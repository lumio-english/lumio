/**
 * Lumio English — Sync backend (Google Apps Script), version 14
 * One project, one deployment URL: roster/schedule/leads/progress sync,
 * test-result backup, student inbox + referrals, Zoom auto-links, and
 * AI writing feedback.
 *
 * Setup (once): paste into the Sheet's bound script (Extensions ->
 * Apps Script). Script Properties: GROQ_API_KEY (AI feedback), and
 * optionally ZOOM_ACCOUNT_ID / ZOOM_CLIENT_ID / ZOOM_CLIENT_SECRET /
 * ZOOM_HOST_EMAIL. Deploy -> Web app, Execute as: Me, Access: Anyone.
 * New sheet tabs/columns are created automatically on first run.
 *
 * v14 (Oct 2026) also writes these Script Properties itself -- nothing to
 * set by hand: LUMIO_SETUP_DONE (the first owner has signed in) and
 * LUMIO_TOKEN_SECRET (signs device tokens). Emergency switches, only while
 * something is wrong, then remove them again:
 *   LUMIO_AUTH_OFF = 1            every caller counts as a teacher (as before)
 *   LUMIO_BOOKING_CHECKS_OFF = 1  student bookings skip the account / next-
 *                                 lesson / sessions / 3-a-week checks
 *   LUMIO_LOCK_EXEMPT = <ids>     comma-separated teacher/student ids that a
 *                                 run of wrong PINs can't lock out
 * Editor helpers (Run from the Apps Script editor): clearLockouts(),
 * allowFirstOwnerSetup(), listDuplicateNames(), repairSheetTypes(),
 * setupKeepWarm().
 */

// ---------- tab + column definitions ----------

var TEACHERS_SHEET = "Teachers";
var TEACHERS_COLUMNS = ["id", "name", "avatar", "pinHash", "isOwner", "createdAt", "updatedAt", "photoDataUrl", "meetingLink"];

var ROSTER_SHEET = "Roster";
var ROSTER_COLUMNS = [
  "id", "name", "level", "avatar", "pinHash", "loginCode", "teacherId", "createdAt", "updatedAt", "phone",
  "age", "gender", "grade", "country", "tags",
  "paid", "approved",
  "subscribed", "amountPaid", "currency", "levelsPurchased",
  "rewardPoints", "bonusHours", "sessionsRemaining",
  "pointsLog", "redemptions", "notes",
  "messages", "pendingDeletion", "deletionConfirmed",
  "referrals", "referralsUpdatedAt",
  "cohort",  // batch (join month); was missing, so every sync erased it
  "fieldTimes", // JSON {field: ISO time it last changed, _base}: per-field merge (3 Oct 2026)
  // NEW COLUMNS GO AT THE END ONLY (4 Oct 2026). Two earlier builds inserted
  // installments (+ installmentsRemoved) before "cohort"; readRows_ below
  // reads every tab by its header names, and recognises those two layouts.
  "installments", // JSON [{id, amount, currency, dueDate, sessions, credit, paidAt, applied, editedAt, remindedAt, remindedDueAt, smsUpcomingAt, smsDueAt, smsAt, smsForDue}]
  "installmentsRemoved", // JSON [id] -- parts deleted on some device, so an older copy can't bring them back
  "photoDataUrl"  // the student's uploaded profile photo (200 px JPEG data URL); was never stored, so it stayed on one device
];
// Roster layouts written by earlier builds whose header row may not say so
// (they appended header cells by count, leaving duplicate names).
var LEGACY_ROSTER_LAYOUTS_ = (function () {
  var base = ROSTER_COLUMNS.slice(0, ROSTER_COLUMNS.indexOf("installments"));
  var at = base.indexOf("cohort");
  var withOne = base.slice(0, at).concat(["installments"], base.slice(at));
  var withTwo = base.slice(0, at).concat(["installments", "installmentsRemoved"], base.slice(at));
  var out = {}; out[base.length] = base; out[withOne.length] = withOne; out[withTwo.length] = withTwo;
  return out;
})();

var REWARD_CATALOG_SHEET = "RewardCatalog";
var REWARD_CATALOG_COLUMNS = ["id", "label", "cost"];

var DELETED_IDS_SHEET = "DeletedIds";
var DELETED_IDS_COLUMNS = ["id", "type", "deletedAt"];

var SCHEDULE_SHEET = "Schedule";
var SCHEDULE_COLUMNS = [
  "id", "teacherId", "teacherName", "date", "startTime", "durationMinutes",
  "level", "cohort", "group", "lessonNumber", "meetingLink", "notes",
  "sessionNotes", "status", "patternId", "studentsJson", "createdAt", "updatedAt",
  "fieldTimes",   // JSON, see mergeFields_ (+ _seatsRemoved: seat tombstones)
  "cancelReason"  // "holiday" = cancelled by a blocked date; put back if it is removed
];

var PATTERNS_SHEET = "SchedulePatterns";
var PATTERNS_COLUMNS = [
  "id", "teacherId", "teacherName", "dayOfWeek", "startTime", "durationMinutes",
  "level", "cohort", "group", "notes", "meetingLink", "studentsJson",
  "startDate", "endDate", "lessonStart", "active", "createdAt", "updatedAt", "extra",
  "fieldTimes"
];

var BLOCKED_DATES_SHEET = "BlockedDates";
var BLOCKED_DATES_COLUMNS = ["date", "label", "addedAt"];  // addedAt vs a "blockedDate" tombstone decides

// v14: "studentId" (LAST column of Progress, Homework and StudentExtras) ties
// a result to the child's account, not just the display name, so two
// children called the same never see or overwrite each other's results.
// Rows written before v14 have it empty and keep working by name.
var PROGRESS_SHEET = "Progress";
var PROGRESS_COLUMNS = ["studentName", "level", "lesson", "stars", "score", "total", "date", "studentId"];
// Interactive homework results (drawings stay on the student's device).
var HOMEWORK_SHEET = "Homework";
var HOMEWORK_COLUMNS = ["studentName", "level", "lesson", "stars", "score", "total", "said", "saidTotal", "hasDrawing", "date",
  // per-skill breakdown homework.html saves and report.html reads (Reading = quiz, Writing = spelling)
  "skillType", "skillCorrect", "skillTotal", "quizCorrect", "quizTotal", "spellingCorrect", "spellingTotal", "recorded", "recordedTotal",
  "studentId"];

// Story parts read, level-test results and word-game best scores (Oct 2026):
// one row per student|kind|level|item, merged best-wins like Progress.
//   kind "story":     item = part number ("1".."4"), score 1
//   kind "levelTest": item = "",  score/total/pct/band/attempts of the best attempt
//   kind "game":      item = "<lesson>:<game>" (e.g. "3:word-pop"), stars/score/total
var EXTRAS_SHEET = "StudentExtras";
var EXTRAS_COLUMNS = ["studentName", "kind", "level", "item", "stars", "score", "total", "pct", "band", "attempts", "date", "studentId"];

var LEADS_SHEET = "Leads";
var LEADS_COLUMNS = [
  "id", "name", "phone", "age", "suggestedLevel", "testScore", "testTotal",
  "status", "notes", "createdAt", "updatedAt"
];

var PRO_ADMINS_SHEET = "ProDashboardAdmins";
var PRO_ADMINS_COLUMNS = ["username", "password", "updatedAt"];

var PRO_TEST_RESULTS_SHEET = "ProTestResults";
var PRO_TEST_RESULTS_COLUMNS = ["id", "name", "student_id", "timestamp", "dataJson"];

// ---------- sheet helpers ----------

function getOrCreateSheet_(name, columns) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(columns);
    sheet.setFrozenRows(1);
    return sheet;
  }
  // writeRows_ looks after the header (v14: a missing column name is added
  // at the end), so nothing is appended here: appending names by count used
  // to leave a header that no longer described the data under it.
  return sheet;
}
// Which field each physical column holds (v14). A header with no repeated
// names that includes the tab's key column is TRUSTED: every field is read
// and written at its own header position, and a column someone added by
// hand (a name the script doesn't know, or no name at all) stays with its
// row. A header with repeated names came from an older build; its layout
// is recognised by its width (Roster) or taken as `columns` in order, and
// the next write rewrites it in the current layout (as before v14).
function headerInfo_(sheet, name, columns) {
  var lastCol = sheet.getLastColumn();
  var header = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function (h) { return String(h == null ? "" : h).trim(); }) : [];
  var seen = {}, dup = false, named = 0;
  header.forEach(function (h) { if (!h) return; named++; if (seen[h]) dup = true; seen[h] = true; });
  if (named && !dup && (seen[columns[0]] || seen.id)) return { layout: header, trusted: true };
  var trimmed = header.slice();
  while (trimmed.length && !trimmed[trimmed.length - 1]) trimmed.pop();
  if (name === ROSTER_SHEET && LEGACY_ROSTER_LAYOUTS_[trimmed.length]) return { layout: LEGACY_ROSTER_LAYOUTS_[trimmed.length], trusted: false };
  return { layout: columns, trusted: false };
}
function physicalLayout_(sheet, name, columns) { return headerInfo_(sheet, name, columns).layout; }

// ---- cell typing ----
// Sheets auto-types what setValues() writes: "2026-09-18" becomes a date
// cell, "16:00" a time cell, "052183" the number 52183. getValues() then
// hands back Date objects / numbers, and JSON turns them into
// "2026-09-18T21:00:00.000Z" (midnight in the Sheet's timezone, shifted
// to UTC) and "1899-12-30T04:24:51.000Z" -- which the site compares as
// plain "YYYY-MM-DD" / "HH:MM" strings, so synced classes vanished from
// every calendar and login codes with a leading zero stopped working.
// Two layers of protection:
//   1. writeRows_ formats the data range as plain text ("@") BEFORE
//      writing, so nothing is ever auto-typed again.
//   2. readRows_ normalises anything already stored as a Date (old rows)
//      back to the string the site expects, using the Sheet's own
//      timezone so the calendar day is the one the teacher typed.
// Every class date/time on Lumio is Saudi wall time (see Lumio.TZ in
// js/app.js); the Zoom meeting uses the same zone. An old Date cell was
// typed in the SHEET's zone (File -> Settings), so it is read back in that
// zone (v14: it used to be read as Riyadh time, which shifted a Dubai
// Sheet's 16:00 to 15:00). Setting the Sheet to Asia/Riyadh is still best.
var PLATFORM_TZ = "Asia/Riyadh";
var DATE_ONLY_COLUMNS = { date: 1, startDate: 1, endDate: 1, deletedAt: 0 };
var TIME_ONLY_COLUMNS = { startTime: 1 };
var TEXT_NUMBER_COLUMNS = { loginCode: 1, phone: 1, pin: 1, id: 1, studentId: 1, teacherId: 1 };
var SHEET_TZ_MEMO_ = null;
function sheetTz_() {
  if (SHEET_TZ_MEMO_) return SHEET_TZ_MEMO_;
  var tz = "";
  try { tz = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone(); } catch (e) {}
  SHEET_TZ_MEMO_ = tz || PLATFORM_TZ;
  return SHEET_TZ_MEMO_;
}

function cellToString_(col, v) {
  // Rows that round-tripped through the old code may hold the ISO text
  // "2026-09-18T21:00:00.000Z" (a date) or "1899-12-30T13:00:00.000Z" (a
  // time) as a plain string -- treat those exactly like Date cells.
  if (typeof v === "string" && (TIME_ONLY_COLUMNS[col] || DATE_ONLY_COLUMNS[col]) && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(v)) {
    var parsed = new Date(v);
    if (!isNaN(parsed.getTime())) v = parsed;
  }
  if (v instanceof Date) {
    var tz = sheetTz_();
    if (TIME_ONLY_COLUMNS[col]) return Utilities.formatDate(v, tz, "HH:mm");
    if (DATE_ONLY_COLUMNS[col]) return Utilities.formatDate(v, tz, "yyyy-MM-dd");
    return v.toISOString();
  }
  if (typeof v === "number" && TEXT_NUMBER_COLUMNS[col]) return String(v);
  return v;
}

// ---- speed (v13) ----
// One request often reads the same tab several times (whoIs_ reads Teachers or the Roster, then the action reads it
// again). READ_MEMO_ keeps each tab's rows for the rest of this one request; writeRows_ drops it. The Teachers tab,
// read by EVERY request, is also kept in the script cache for TAB_CACHE_S_ seconds.
// v14: every cached copy carries the tab's VERSION (cache key tabver_<tab>). A reader reads the version BEFORE it
// reads the Sheet and tags its copy with it; writeRows_ sets a new version AFTER the Sheet write. A copy is used only
// while its tag is still the current version, so a copy read before a save (an old PIN, or an empty list caught in
// the middle of a write) can never be served after it. Empty lists are never cached. A hand edit in the Sheet shows up
// within TAB_CACHE_S_ seconds (or at once after any save through the site).
var READ_MEMO_ = {};
var TAB_CACHE_S_ = 360;   // longer than the 5-minute keep-warm timer, so the cache is always warm
var SHARED_CACHE_TABS_ = { "Teachers": true };
function readRows_(name, columns) {
  var key = name + "|" + columns.join(",");
  if (READ_MEMO_[key]) return JSON.parse(READ_MEMO_[key]);
  var hit = SHARED_CACHE_TABS_[name] ? tabCacheGet_(name, key) : null;
  if (hit && hit.json) {
    try { var fromCache = JSON.parse(hit.json); READ_MEMO_[key] = hit.json; return fromCache; } catch (e) {}
  }
  var rows = readRowsFromSheet_(name, columns);
  var json = JSON.stringify(rows);
  READ_MEMO_[key] = json;
  if (hit && hit.ver && rows.length) tabCachePut_(key, json, hit.ver);
  return rows;
}
function tabCacheKey_(key) { return "tab_" + Utilities.base64EncodeWebSafe(key).slice(0, 200); }
function tabVerKey_(name) { return "tabver_" + name; }
// -> { ver: the tab's current version (null = none yet, so nothing may be cached), json: a copy tagged with it }
function tabCacheGet_(name, key) {
  try {
    var c = CacheService.getScriptCache(), k = tabCacheKey_(key), vk = tabVerKey_(name);
    var got = c.getAll([vk, k + "_n"]);
    var ver = got[vk] || null;
    if (!ver) return { ver: null };
    var tag = String(got[k + "_n"] || ""), bar = tag.indexOf("|");
    if (bar < 0 || tag.slice(bar + 1) !== ver) return { ver: ver };
    var n = Number(tag.slice(0, bar)) || 0;
    if (!n) return { ver: ver };
    var parts = c.getAll(Array.apply(null, Array(n)).map(function (_, i) { return k + "_" + i; }));
    var out = "";
    for (var i = 0; i < n; i++) { if (parts[k + "_" + i] == null) return { ver: ver }; out += parts[k + "_" + i]; }
    return { ver: ver, json: out };
  } catch (e) { return null; }
}
function tabCachePut_(key, json, ver) {
  if (!ver || !json || json === "[]") return;   // no version yet, or an empty list: never cached
  try {
    var c = CacheService.getScriptCache(), k = tabCacheKey_(key), size = 90000, vals = {}, n = Math.ceil(json.length / size) || 1;
    if (n > 8) return;   // too big to be worth it
    for (var i = 0; i < n; i++) vals[k + "_" + i] = json.slice(i * size, (i + 1) * size);
    c.putAll(vals, TAB_CACHE_S_);
    c.put(k + "_n", n + "|" + ver, TAB_CACHE_S_);
  } catch (e) {}
}
// A new version for a shared tab: every copy cached before it stops being used.
function tabVerBump_(name) {
  try { CacheService.getScriptCache().put(tabVerKey_(name), Utilities.getUuid().slice(0, 8) + Date.now().toString(36), 21600); } catch (e) {}
}
function forgetTab_(name) {
  Object.keys(READ_MEMO_).forEach(function (k) { if (k.indexOf(name + "|") === 0) delete READ_MEMO_[k]; });
}

// Rows as the Sheet holds them, read through the header (see headerInfo_).
function readSheetRows_(sheet, name, columns) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return { rows: [], info: { layout: columns, trusted: true } };
  var info = headerInfo_(sheet, name, columns), layout = info.layout;
  var pos = {};
  layout.forEach(function (h, i) { if (h && !(h in pos)) pos[h] = i; });
  var values = sheet.getRange(2, 1, lastRow - 1, layout.length).getValues();
  var rows = values
    .filter(function (row) { return row.some(function (cell) { return cell !== "" && cell !== null; }); })
    .map(function (row) {
      var obj = {};
      columns.forEach(function (col) { obj[col] = col in pos ? cellToString_(col, row[pos[col]]) : ""; });
      return obj;
    });
  return { rows: rows, info: info };
}
function readRowsFromSheet_(name, columns) {
  var sheet = getOrCreateSheet_(name, columns);
  var got = readSheetRows_(sheet, name, columns);
  // An older build's layout (repeated header names): rewrite it once in the current one. v14: only while
  // holding the script lock and from a fresh read, so a reader can never write an old copy over a newer save.
  // (A clean header is never rewritten on a read any more: missing columns are simply read as "".)
  if (!got.info.trusted && got.info.layout.join("|") !== columns.join("|")) {
    tryLocked_(0, function () {
      var again = readSheetRows_(sheet, name, columns);
      if (!again.info.trusted && again.info.layout.join("|") !== columns.join("|")) writeRows_(name, columns, again.rows);
      got = again;
    });
  }
  return got.rows;
}

// ---- writing a tab (v14) ----
// 1. Every value is built and made to fit a cell FIRST (a Sheet cell holds
//    50,000 characters; one bigger value used to fail the write after the
//    tab had already been cleared, emptying the whole Roster).
// 2. A trusted header keeps its columns where they are: known fields are
//    written at their header positions, a known field the tab doesn't have
//    yet is added at the END, and a column added by hand keeps its values,
//    which move with their row (matched by the row's key).
// 3. Rows 2..n+1 are written, then ONLY the rows left over below are
//    cleared -- the tab is never emptied first.
var CELL_MAX_ = 49000;
var KEYED_BY_ = {
  Progress: ["studentName", "level", "lesson"], Homework: ["studentName", "level", "lesson"],
  StudentExtras: ["studentName", "kind", "level", "item"], BlockedDates: ["date"], ProDashboardAdmins: ["username"]
};
function rowKey_(name, r, noId) {
  var f = KEYED_BY_[name];
  if (!f) return "id:" + String(r.id == null ? "" : r.id);
  return (noId ? "" : String(r.studentId || "")) + "|" + f.map(function (c) { return r[c] == null ? "" : String(r[c]); }).join("|");
}
function cellValue_(col, v) {
  if (v === undefined || v === null) return "";
  if (typeof v === "object" && !(v instanceof Date)) v = JSON.stringify(v);
  return fitCell_(col, v);
}
// Makes one value fit a cell; never throws. A JSON list drops its oldest
// entries (the inbox uses capMessages_), a photo is dropped, anything else
// is cut. Each trim is written to the execution log.
function fitCell_(col, v) {
  if (typeof v !== "string" || v.length <= CELL_MAX_) return v;
  var out = null;
  try {
    if (col === "photoDataUrl") out = "";
    else if (col === "messages") out = JSON.stringify(capMessages_(parseArr_(v)));
    else if (v.charAt(0) === "[") {
      var a = JSON.parse(v);
      if (Array.isArray(a)) {
        var sizes = a.map(function (x) { return JSON.stringify(x === undefined ? null : x).length + 1; });
        var total = 1 + sizes.reduce(function (s, x) { return s + x; }, 0);
        while (a.length && total > CELL_MAX_) { total -= sizes.shift(); a.shift(); }
        out = JSON.stringify(a);
      }
    } else if (v.charAt(0) === "{") {
      var o = JSON.parse(v);
      if (o && typeof o === "object") {
        var sr = o._seatsRemoved && typeof o._seatsRemoved === "object" ? o._seatsRemoved : null;
        if (sr) {
          var ks = Object.keys(sr).sort(function (x, y) { return tms_(sr[x]) - tms_(sr[y]); });
          while (ks.length && JSON.stringify(o).length > CELL_MAX_) delete sr[ks.shift()];
        }
        out = JSON.stringify(o);
        if (out.length > CELL_MAX_) out = "{}";
      }
    }
  } catch (e) { out = null; }
  if (out === null || out.length > CELL_MAX_) out = /^[\[{]/.test(v) ? (v.charAt(0) === "[" ? "[]" : "{}") : v.slice(0, CELL_MAX_);
  try { Logger.log("writeRows_: a " + col + " value of " + v.length + " characters was trimmed to " + out.length + " to fit a cell."); } catch (e) {}
  return out;
}
function ensureGrid_(sheet, rowsNeeded, colsNeeded) {
  try {
    var mr = sheet.getMaxRows(), mc = sheet.getMaxColumns();
    if (rowsNeeded > mr) sheet.insertRowsAfter(mr, rowsNeeded - mr);
    if (colsNeeded > mc) sheet.insertColumnsAfter(mc, colsNeeded - mc);
  } catch (e) {}
}
// [[start, length], ...] of consecutive positions where pick(i) is true
function runsOf_(width, pick) {
  var runs = [], i = 0;
  while (i < width) {
    if (!pick(i)) { i++; continue; }
    var s = i;
    while (i < width && pick(i)) i++;
    runs.push([s, i - s]);
  }
  return runs;
}
function writeRows_(name, columns, rows) {
  forgetTab_(name);
  var sheet = getOrCreateSheet_(name, columns);
  var lastRow = sheet.getLastRow(), lastCol = sheet.getLastColumn();
  var info = headerInfo_(sheet, name, columns);
  var n = rows.length;
  var layout = info.trusted ? info.layout.slice() : columns.slice();
  if (info.trusted) columns.forEach(function (c) { if (layout.indexOf(c) < 0) layout.push(c); });   // new known columns: at the end
  var width = layout.length, colIdx = {};
  layout.forEach(function (h, i) { if (h && columns.indexOf(h) >= 0 && !(h in colIdx)) colIdx[h] = i; });
  var isKnown = function (i) { return !!layout[i] && colIdx[layout[i]] === i; };
  var unknownPos = [];
  if (info.trusted) for (var u = 0; u < Math.min(info.layout.length, width); u++) if (!isKnown(u)) unknownPos.push(u);

  // hand-added columns: their current values (formulas kept) by row key
  var byKey = {}, byAlt = {}, oldUnknown = null;
  if (unknownPos.length && lastRow > 1) {
    var oldRange = sheet.getRange(2, 1, lastRow - 1, info.layout.length);
    var oldVals = oldRange.getValues();
    var oldF = null;
    try { if (typeof oldRange.getFormulas === "function") oldF = oldRange.getFormulas(); } catch (e) { oldF = null; }
    oldUnknown = oldVals.map(function (row, ri) {
      return unknownPos.map(function (p) { var f = oldF && oldF[ri] && oldF[ri][p]; return f ? f : row[p]; });
    });
    oldVals.forEach(function (row, ri) {
      var vals = oldUnknown[ri];
      if (!vals.some(function (v) { return v !== "" && v !== null; })) return;
      var o = {};
      columns.forEach(function (c) { if (c in colIdx && colIdx[c] < row.length) o[c] = cellToString_(c, row[colIdx[c]]); });
      var ent = { vals: vals, used: false };
      (byKey[rowKey_(name, o)] = byKey[rowKey_(name, o)] || []).push(ent);
      (byAlt[rowKey_(name, o, true)] = byAlt[rowKey_(name, o, true)] || []).push(ent);
    });
  }
  var take = function (list) { if (!list) return null; for (var i = 0; i < list.length; i++) if (!list[i].used) { list[i].used = true; return list[i]; } return null; };

  // 1) every value first
  var values = rows.map(function (r) {
    var line = [];
    for (var i = 0; i < width; i++) line.push("");
    columns.forEach(function (c) { line[colIdx[c]] = cellValue_(c, r[c]); });
    if (unknownPos.length) {
      var hit = take(byKey[rowKey_(name, r)]) || take(byAlt[rowKey_(name, r, true)]);
      if (hit) unknownPos.forEach(function (p, j) { line[p] = hit.vals[j]; });
    }
    return line;
  });

  // 2) grid + header
  ensureGrid_(sheet, n + 1, width);
  if (info.trusted) {
    if (width > info.layout.length) sheet.getRange(1, info.layout.length + 1, 1, width - info.layout.length).setValues([layout.slice(info.layout.length)]);
  } else {
    var hw = Math.max(lastCol, width);
    var head = sheet.getRange(1, 1, 1, hw);
    var want = layout.concat(new Array(hw - width).fill(""));
    if (head.getValues()[0].map(String).join("|") !== want.join("|")) { head.clearContent(); sheet.getRange(1, 1, 1, width).setValues([layout]); }
  }

  // 3) rows 2..n+1: known columns always; a hand-added column only where its values moved
  if (n) {
    runsOf_(width, isKnown).forEach(function (run) {
      var rg = sheet.getRange(2, run[0] + 1, n, run[1]);
      rg.setNumberFormat("@");   // plain text: no auto-typing of dates, times or numbers
      rg.setValues(values.map(function (line) { return line.slice(run[0], run[0] + run[1]); }));
    });
    runsOf_(width, function (i) { return !isKnown(i); }).forEach(function (run) {
      var same = true;
      for (var ri = 0; ri < n && same; ri++) for (var j = run[0]; j < run[0] + run[1]; j++) {
        var k = unknownPos.indexOf(j), old = oldUnknown && oldUnknown[ri] && k >= 0 ? oldUnknown[ri][k] : "";
        if (String(old == null ? "" : old) !== String(values[ri][j] == null ? "" : values[ri][j])) { same = false; break; }
      }
      if (!same) sheet.getRange(2, run[0] + 1, n, run[1]).setValues(values.map(function (line) { return line.slice(run[0], run[0] + run[1]); }));
    });
    if (!info.trusted && lastCol > width) sheet.getRange(2, width + 1, n, lastCol - width).clearContent();   // an old layout's extra cells
  }
  // 4) only what is left over below
  if (lastRow > n + 1) sheet.getRange(n + 2, 1, lastRow - n - 1, Math.max(lastCol, width)).clearContent();
  forgetTab_(name);
  if (SHARED_CACHE_TABS_[name]) { try { SpreadsheetApp.flush(); } catch (e) {} tabVerBump_(name); }
}

// One-off repair for a Sheet that already has auto-typed cells: rewrites
// every data row of every tab as text (through readRows_'s normalisation).
// v14: through writeRows_ only, so hand-added columns and the header stay
// (an old layout with repeated header names is still rewritten). Run it
// once from the Apps Script editor if dates or login codes look wrong.
function repairSheetTypes() {
  var tabs = [
    [TEACHERS_SHEET, TEACHERS_COLUMNS], [ROSTER_SHEET, ROSTER_COLUMNS],
    [SCHEDULE_SHEET, SCHEDULE_COLUMNS], [PATTERNS_SHEET, PATTERNS_COLUMNS],
    [BLOCKED_DATES_SHEET, BLOCKED_DATES_COLUMNS], [PROGRESS_SHEET, PROGRESS_COLUMNS],
    [LEADS_SHEET, LEADS_COLUMNS], [REWARD_CATALOG_SHEET, REWARD_CATALOG_COLUMNS], [HOMEWORK_SHEET, HOMEWORK_COLUMNS],
    [DELETED_IDS_SHEET, DELETED_IDS_COLUMNS], [PRO_ADMINS_SHEET, PRO_ADMINS_COLUMNS],
    [PRO_TEST_RESULTS_SHEET, PRO_TEST_RESULTS_COLUMNS], [EXTRAS_SHEET, EXTRAS_COLUMNS],
  ];
  withLock_(30000, function () {
    tabs.forEach(function (t) {
      READ_MEMO_ = {};
      writeRows_(t[0], t[1], readRowsFromSheet_(t[0], t[1]));
    });
  });
}

// ---- the script lock (v14) ----
// Every write path runs under the one script lock. withLock_ knows when this
// request already holds it (a roster push that moves a renamed child's
// progress rows, say), so a locked helper can call another without waiting
// for itself.
var LOCK_HELD_ = 0;
function withLock_(ms, fn) {
  if (LOCK_HELD_ > 0) return fn();
  var lock = LockService.getScriptLock();
  lock.waitLock(ms || 20000);
  LOCK_HELD_++;
  try { return fn(); } finally { LOCK_HELD_--; lock.releaseLock(); }
}
// Runs fn only if the lock is free within `ms` (or already ours); returns false when it was busy.
function tryLocked_(ms, fn) {
  if (LOCK_HELD_ > 0) { fn(); return true; }
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(ms || 0)) return false;
  LOCK_HELD_++;
  try { fn(); return true; } finally { LOCK_HELD_--; lock.releaseLock(); }
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---------- per-field merge (3 Oct 2026) ----------
// Pushes used to REPLACE whole tabs (and the client kept whichever whole
// record was newer), so a teacher device that edited a phone number undid
// a redemption the student had made meanwhile, two teacher devices editing
// one class (notes vs attendance) lost one edit, and a student registered
// between a teacher's pull and push vanished. Now every Roster / Schedule /
// SchedulePatterns row carries fieldTimes = { field: ISO time it last
// changed, _base: the row's updatedAt before tracking started } and pushes
// are MERGED into the Sheet field by field (newer field time wins; a field
// without a time is as old as _base, or updatedAt for an old row). Class
// seats merge one by one by their own updatedAt; a removed seat leaves
// fieldTimes._seatsRemoved[key]. Rows go away only through DeletedIds.
// The same rules live in js/lumio-profiles.js and js/lumio-schedule.js.
function tms_(v) { if (!v) return 0; var n = Date.parse(v); return isNaN(n) ? 0 : n; }
function iso_(n) { return n ? new Date(n).toISOString() : ""; }
function ftOf_(rec) {
  var ft = rec && rec.fieldTimes;
  if (typeof ft === "string") { try { ft = ft ? JSON.parse(ft) : null; } catch (e) { ft = null; } }
  return ft && typeof ft === "object" ? ft : {};
}
function fieldTime_(rec, ft, k) { return tms_(ft[k]) || tms_(ft._base) || tms_(rec.updatedAt); }
function baseTime_(rec, ft) { return tms_(ft._base) || tms_(rec.updatedAt); }
function valKey_(v) { if (v === null || v === undefined) return ""; return typeof v === "object" ? JSON.stringify(v) : String(v); }
// a = the Sheet's row (wins exact ties), b = incoming. A field b does not
// carry at all is "not known there", never "cleared".
// v14: an incoming time more than 10 minutes in the future counts as
// now + 10 minutes, so a device can't stamp a field "2099" and freeze it.
function futureCap_() { return Date.now() + 10 * 60000; }
function mergeFields_(a, b, skip) {
  var fa = ftOf_(a), fb = ftOf_(b), out = {}, ft = {}, keys = {}, cap = futureCap_();
  var tbOf = function (k) { return Math.min(fieldTime_(b, fb, k), cap); };
  var base = Math.max(baseTime_(a, fa), Math.min(baseTime_(b, fb), cap));
  Object.keys(a).forEach(function (k) { keys[k] = 1; });
  Object.keys(b).forEach(function (k) { keys[k] = 1; });
  Object.keys(keys).forEach(function (k) {
    if (k === "fieldTimes" || k === "updatedAt" || (skip && skip[k])) return;
    var va = a[k], vb = b[k], t;
    if (vb === undefined) { out[k] = va; t = fieldTime_(a, fa, k); }
    else if (va === undefined) { out[k] = vb; t = tbOf(k); }
    else {
      var ta = fieldTime_(a, fa, k), tb = tbOf(k);
      if (valKey_(va) === valKey_(vb)) { out[k] = va; t = Math.max(ta, tb); }
      else if (tb > ta) { out[k] = vb; t = tb; }
      else { out[k] = va; t = ta; }
    }
    if (t && t !== base) ft[k] = iso_(t);
  });
  if (base) ft._base = iso_(base);
  out.updatedAt = Math.min(tms_(b.updatedAt), cap) > tms_(a.updatedAt) ? (tms_(b.updatedAt) > cap ? iso_(cap) : b.updatedAt) : a.updatedAt;
  out.fieldTimes = ft;
  return out;
}
// Script-side edits stamp the fields they change (and keep the old
// updatedAt as _base so the rest of the row doesn't look newer).
function touch_(rec, keys, now) {
  var ft = ftOf_(rec);
  if (!ft._base) ft._base = rec.updatedAt || rec.createdAt || "";
  (keys || []).forEach(function (k) { ft[k] = now; });
  rec.fieldTimes = ft;
  rec.updatedAt = now;
  return rec;
}
function parseArr_(v) {
  if (Array.isArray(v)) return v;
  try { var a = JSON.parse(v || "[]"); return Array.isArray(a) ? a : []; } catch (e) { return []; }
}
// ---- the inbox budget (v14) ----
// Every class adds a few messages to a child's inbox; with no limit one
// Roster cell (50,000 characters) overflowed after about 34 classes. The
// inbox keeps the NEWEST messages within MSG_MAX_ messages and
// MSG_JSON_MAX_ characters: the oldest READ message goes first, then the
// oldest unread one; an unread deletion request is never dropped. Each
// text is capped at MSG_TEXT_MAX_ characters. An inbox already under the
// budget is left exactly as it is.
var MSG_MAX_ = 150, MSG_JSON_MAX_ = 40000, MSG_TEXT_MAX_ = 1500;
function capMessages_(list) {
  var out = [];
  (list || []).forEach(function (m) {
    if (!m || typeof m !== "object" || !m.id) return;
    var c = {};
    Object.keys(m).forEach(function (k) { c[k] = m[k]; });
    if (typeof c.text === "string" && c.text.length > MSG_TEXT_MAX_) c.text = c.text.slice(0, MSG_TEXT_MAX_);
    out.push(c);
  });
  out.sort(function (p, q) { return tms_(p.date) - tms_(q.date); });
  var sizes = out.map(function (m) { return JSON.stringify(m).length + 1; });
  var total = 1 + sizes.reduce(function (s, x) { return s + x; }, 0);
  var keep = function (m) { return m.type === "delete_request" && !m.read; };
  while (out.length > MSG_MAX_ || total > MSG_JSON_MAX_) {
    var i = -1, j;
    for (j = 0; j < out.length; j++) if (out[j].read === true || out[j].read === "true") { i = j; break; }
    if (i < 0) for (j = 0; j < out.length; j++) if (!keep(out[j])) { i = j; break; }
    if (i < 0) break;
    total -= sizes[i]; out.splice(i, 1); sizes.splice(i, 1);
  }
  return out;
}
function unionMessages_(x, y) {
  var byId = {};
  parseArr_(x).concat(parseArr_(y)).forEach(function (m) {
    if (!m || !m.id) return;
    var prev = byId[m.id];
    if (!prev) { byId[m.id] = m; return; }
    var c = {}; Object.keys(prev).forEach(function (k) { c[k] = prev[k]; }); Object.keys(m).forEach(function (k) { c[k] = m[k]; });
    c.read = !!(prev.read || m.read);
    byId[m.id] = c;
  });
  return Object.keys(byId).map(function (k) { return byId[k]; })
    .sort(function (p, q) { return tms_(p.date) - tms_(q.date); });
}
function mergeStudentRow_(sheet, inc) {
  var out = mergeFields_(sheet, inc);
  // the inbox is always the union (teacher adds, student marks read); v14: when it grew, it is kept
  // within the inbox budget (capMessages_)
  var had = {}, inbox = unionMessages_(sheet.messages, inc.messages);
  parseArr_(sheet.messages).forEach(function (m) { if (m && m.id) had[m.id] = typeof m.text === "string" ? m.text.length : 0; });
  // a text the Sheet already holds trimmed stays trimmed (an old page's longer copy doesn't come back);
  // a long text saved before v14 is left as it is
  inbox = inbox.map(function (m) {
    if (!Object.prototype.hasOwnProperty.call(had, m.id) || had[m.id] > MSG_TEXT_MAX_ || typeof m.text !== "string" || m.text.length <= MSG_TEXT_MAX_) return m;
    var c = {}; Object.keys(m).forEach(function (k) { c[k] = m[k]; }); c.text = m.text.slice(0, MSG_TEXT_MAX_);
    return c;
  });
  if (inbox.some(function (m) { return !Object.prototype.hasOwnProperty.call(had, m.id); })) inbox = capMessages_(inbox);
  out.messages = JSON.stringify(inbox);
  if (!out.loginCode && sheet.loginCode) out.loginCode = sheet.loginCode;   // never changes once issued
  if (!out.pinHash && sheet.pinHash) out.pinHash = sheet.pinHash;
  // a referral reward is never granted twice
  var other = {};
  parseArr_(sheet.referrals).concat(parseArr_(inc.referrals)).forEach(function (r) { if (r && r.id && r.rewardedAt) other[r.id] = r.rewardedAt; });
  var refs = parseArr_(out.referrals);
  if (refs.length) out.referrals = JSON.stringify(refs.map(function (r) { if (r && r.id && !r.rewardedAt && other[r.id]) r.rewardedAt = other[r.id]; return r; }));
  // installments merge per part (same rules as mergeInstallmentLists in js/lumio-profiles.js)
  if (sheet.installments || inc.installments) {
    var m = mergeInstallments_(sheet, inc);
    out.installments = JSON.stringify(m.list);
    if (m.removed.length) out.installmentsRemoved = JSON.stringify(m.removed);
  }
  return out;
}
var INST_STAMPS_ = ["remindedAt", "remindedDueAt", "smsUpcomingAt", "smsDueAt", "smsAt", "smsForDue"];
function mergeInstallments_(a, b) {
  var removed = [], gone = {};
  parseArr_(a.installmentsRemoved).concat(parseArr_(b.installmentsRemoved)).forEach(function (id) { if (id && !gone[id]) { gone[id] = true; removed.push(id); } });
  var byId = {}, order = [];
  [a, b].forEach(function (side) {
    parseArr_(side.installments).forEach(function (i) {
      if (!i || !i.id || gone[i.id]) return;
      var cur = byId[i.id];
      if (!cur) { byId[i.id] = i; order.push(i.id); return; }
      var win = tms_(i.editedAt) > tms_(cur.editedAt) ? i : cur, lose = win === cur ? i : cur;
      if (win.dueDate === lose.dueDate) INST_STAMPS_.forEach(function (k) { if (!win[k] && lose[k]) win[k] = lose[k]; });
      byId[i.id] = win;
    });
  });
  var list = order.map(function (id) { return byId[id]; }).sort(function (x, y) { return String(x.dueDate).localeCompare(String(y.dueDate)); });
  return { list: list, removed: removed };
}
// Merges incoming rows into the Sheet's rows by id; ids in `gone` are dropped.
function mergeRowsById_(sheetRows, incoming, gone, mergeOne) {
  var byId = {}, order = [];
  sheetRows.forEach(function (r) { if (r && r.id && !byId[r.id]) { byId[r.id] = r; order.push(r.id); } });
  (incoming || []).forEach(function (r) {
    if (!r || !r.id) return;
    if (byId[r.id]) byId[r.id] = mergeOne(byId[r.id], r);
    else { byId[r.id] = r; order.push(r.id); }
  });
  return order.filter(function (id) { return !gone[id]; }).map(function (id) { return byId[id]; });
}
function goneSet_(types) {
  var g = {};
  deletedIdsOfType_(types).forEach(function (d) { g[d.id] = true; });
  return g;
}
// v14: a deletion pushed on its own (no list of rows with it) takes the row out of its tab in the same
// request, instead of waiting for the next full push.
function pruneGone_(sheet, columns, type) {
  var gone = goneSet_([type]), all = readRows_(sheet, columns);
  var left = all.filter(function (r) { return !(r && r.id && gone[r.id]); });
  if (left.length !== all.length) writeRows_(sheet, columns, left);
}

// ---- class seats ----
function normName_(v) { return String(v || "").trim().toLowerCase(); }
// v14: is this seat the caller's? A seat with the studentId of a live
// account (on the Roster, not deleted) belongs to that account only, so two
// children with the same name no longer see each other's classes. A seat
// with no id, or with the id of an account that is gone (the child was
// deleted and added again under a new id), belongs to its name as before.
// me = { id, name, live } -- live = liveStudentIds_(); without it every id
// counts as live.
function seatIsMe_(seat, me) {
  if (!seat || !me) return false;
  if (seat.studentId && (!me.live || me.live[String(seat.studentId)])) return String(seat.studentId) === String(me.id);
  return normName_(me.name) !== "" && normName_(seat.studentName) === normName_(me.name);
}
// The ids of the accounts that exist: on the Roster and not deleted.
function liveStudentIds_(roster) {
  var gone = goneSet_(["student"]), live = {};
  (roster || readRows_(ROSTER_SHEET, ROSTER_COLUMNS)).forEach(function (r) { if (r && r.id && !gone[r.id]) live[String(r.id)] = true; });
  return live;
}
// A student account as seatIsMe_ wants it.
function meRef_(s, roster) { return { id: s.id, name: s.name, live: liveStudentIds_(roster) }; }
function sameSeat_(x, y) {
  if (!x || !y) return false;
  if (x.studentId && y.studentId) return x.studentId === y.studentId;
  return normName_(x.studentName) !== "" && normName_(x.studentName) === normName_(y.studentName);
}
function seatKeys_(s) {
  var k = [];
  if (s && s.studentId) k.push("id:" + s.studentId);
  if (s && normName_(s.studentName)) k.push("n:" + normName_(s.studentName));
  return k;
}
function tombSeat_(rec, seat, now) {
  var ft = ftOf_(rec);
  if (!ft._seatsRemoved || typeof ft._seatsRemoved !== "object") ft._seatsRemoved = {};
  seatKeys_(seat).forEach(function (k) { ft._seatsRemoved[k] = now; });
  rec.fieldTimes = ft;
}
function mergeSeats_(a, b, tombs) {
  var seatT = function (cls, s) { return tms_(s && s.updatedAt) || fieldTime_(cls, ftOf_(cls), "students"); };
  var out = [];
  (Array.isArray(a.students) ? a.students : []).forEach(function (s) { if (s && typeof s === "object") out.push({ s: s, t: seatT(a, s) }); });
  (Array.isArray(b.students) ? b.students : []).forEach(function (s) {
    if (!s || typeof s !== "object") return;
    var t = Math.min(seatT(b, s), futureCap_()), hit = null;
    for (var i = 0; i < out.length; i++) if (sameSeat_(out[i].s, s)) { hit = out[i]; break; }
    if (!hit) { out.push({ s: s, t: t }); return; }
    var win = t > hit.t ? s : hit.s, lose = win === s ? hit.s : s, m = {};
    Object.keys(win).forEach(function (k) { m[k] = win[k]; });
    if (!m.teacherRatingStars && lose.teacherRatingStars) m.teacherRatingStars = lose.teacherRatingStars;  // only ever set
    if (lose.sessionDeducted && !m.sessionDeducted) m.sessionDeducted = true;
    if (!m.studentId && lose.studentId) m.studentId = lose.studentId;
    hit.s = m; hit.t = Math.max(t, hit.t);
  });
  return out.filter(function (x) {
    var gone = 0;
    seatKeys_(x.s).forEach(function (k) { gone = Math.max(gone, tms_(tombs[k])); });
    return !(gone && gone >= x.t);
  }).map(function (x) { return x.s; });
}
function mergeClass_(a, b) {
  var out = mergeFields_(a, b, { students: 1 });
  var tombs = {}, ta = ftOf_(a)._seatsRemoved || {}, tb = ftOf_(b)._seatsRemoved || {};
  Object.keys(ta).forEach(function (k) { tombs[k] = ta[k]; });
  Object.keys(tb).forEach(function (k) { if (tms_(tb[k]) > tms_(tombs[k])) tombs[k] = tb[k]; });
  out.students = mergeSeats_(a, b, tombs);
  if (Object.keys(tombs).length) out.fieldTimes._seatsRemoved = tombs;
  if (out.status !== "cancelled" && out.students.length) {
    out.status = out.students.every(function (s) { return s && s.attendance; }) ? "completed" : "scheduled";
  }
  return out;
}
// Two copies of one fixed-schedule session (same pattern + date, not
// cancelled) -- two teacher devices generated it, or an old random-id copy
// meets the new "<patternId>_<date>" one: keep the oldest, fold the other
// in. Bookings for different students at different lessons in one open
// slot are left alone (a real clash for the teacher to see).
function dedupePatternClasses_(classes) {
  var groups = {}, drop = {}, repl = {};
  classes.forEach(function (c) {
    if (!c || !c.patternId || !c.date || c.status === "cancelled") return;
    var k = c.patternId + "|" + c.date;
    (groups[k] = groups[k] || []).push(c);
  });
  Object.keys(groups).forEach(function (k) {
    var g = groups[k];
    if (g.length < 2) return;
    g.sort(function (x, y) { return String(x.createdAt || "").localeCompare(String(y.createdAt || "")) || String(x.id).localeCompare(String(y.id)); });
    var keep = g[0];
    g.slice(1).forEach(function (o) {
      var shares = (o.students || []).some(function (s) { return (keep.students || []).some(function (q) { return sameSeat_(q, s); }); });
      var sameLesson = (!keep.level || !o.level || String(keep.level) === String(o.level))
        && (!keep.lessonNumber || !o.lessonNumber || Number(keep.lessonNumber) === Number(o.lessonNumber));
      if (!shares && !sameLesson && (o.students || []).length && (keep.students || []).length) return;
      var m = mergeClass_(keep, o);
      m.id = keep.id; m.createdAt = keep.createdAt || o.createdAt;
      keep = m; drop[o.id] = true;
    });
    repl[g[0].id] = keep;
  });
  return classes.filter(function (c) { return !drop[c.id]; }).map(function (c) { return repl[c.id] || c; });
}

// ---------- roster ----------

// Narrow write path for STUDENT devices. A student device never pushes the
// whole roster (its copy of other students is stale and it must not be
// able to overwrite teacher-only fields). It only sends the few things a
// student may change about their own row, and the script merges them into
// that one row:
//   avatar                     -- replaced (v14: a short avatar code only)
//   messages                   -- union by message id; read = either side
//                                 (v14: at most 20 new ones per patch, and
//                                 the inbox budget, see capMessages_)
//   pendingDeletion / deletionConfirmed -- replaced (student's answer)
//   redemptions                -- union by date; a NEW redemption deducts
//                                 its cost from rewardPoints and credits
//                                 bonusHours/sessionsRemaining. v14: the
//                                 script decides what it is worth (below).
var PHOTO_MAX_CHARS_ = 48000;
function okPhoto_(v) { return v === "" || (typeof v === "string" && v.length <= PHOTO_MAX_CHARS_ && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+\/=]+$/.test(v)); }
// An avatar is a short code ("c:lumi") or an emoji, never markup or a formula.
function okAvatar_(v) { return typeof v === "string" && v.length > 0 && v.length <= 200 && v.indexOf("<") < 0 && !/^[\s=+\-@]/.test(v); }
function pushStudentPatch_(body) {
  var patch = body && body.patch;
  if (!patch || !patch.id) return { ok: false, error: "missing patch.id" };
  // Locked: a teacher's roster push merging at the same moment must not
  // write back a copy read before this patch landed.
  return withLock_(20000, function () { return pushStudentPatchLocked_(patch); });
}
// Redemptions (v14): the price and the hours come from the script, never
// from the device. A bonus-hour reward is 50 points per whole hour (the
// only kind with hours, js/lumio-profiles.js redeemReward); anything else
// must be an item of the RewardCatalog tab at its current price, with no
// hours. At most 5 new ones per patch, dated within the last 90 days (a
// redemption queued on an offline phone) and at most 7 days ahead (a
// tablet with a wrong date). Any number of whole hours: the page redeems
// every full 50 points at once (1,100 points -> 22 hours); the points the
// row really has are the limit.
var POINTS_PER_HOUR_ = 50, REDEEM_MAX_NEW_ = 5;
function liveRewardCatalog_() {
  var gone = goneSet_(["reward"]);
  return readRows_(REWARD_CATALOG_SHEET, REWARD_CATALOG_COLUMNS).filter(function (r) { return r && r.id && !gone[r.id]; });
}
function pushStudentPatchLocked_(patch) {
  var rows = readRows_(ROSTER_SHEET, ROSTER_COLUMNS);
  var row = null;
  for (var i = 0; i < rows.length; i++) if (rows[i].id === patch.id) { row = rows[i]; break; }
  if (!row) return { ok: false, error: "student not found" };
  var changed = false, stamped = [], refusedRedemptions = [];   // fields this patch changed get their own time (fieldTimes)

  if (okAvatar_(patch.avatar) && patch.avatar !== row.avatar) { row.avatar = patch.avatar; changed = true; stamped.push("avatar"); }
  // the student's own profile photo ("" removes it)
  // Only a change made after the Sheet's copy wins, so an older device can't wipe a newer photo.
  var photoAt = Date.parse(patch.photoAt || "") || 0, sheetPhotoAt = Date.parse(ftOf_(row).photoDataUrl || "") || 0;
  if (photoAt > futureCap_()) photoAt = futureCap_();
  if (patch.photoDataUrl !== undefined && okPhoto_(patch.photoDataUrl) && photoAt > sheetPhotoAt && patch.photoDataUrl !== (row.photoDataUrl || "")) { row.photoDataUrl = patch.photoDataUrl; changed = true; stamped.push("photoDataUrl"); }

  if (Array.isArray(patch.messages)) {
    var existing = parseArr_(row.messages);
    var before = JSON.stringify(existing);
    var byId = {};
    existing.forEach(function (m) { if (m && m.id) byId[m.id] = m; });
    var fresh = [], msgChanged = false;
    patch.messages.forEach(function (m) {
      if (!m || typeof m !== "object" || !m.id || typeof m.id !== "string" || m.id.length > 80) return;
      var prev = byId[m.id];
      if (prev) { if (m.read && !prev.read) { prev.read = true; msgChanged = true; } return; }
      var c = {};
      Object.keys(m).forEach(function (k) { c[k] = m[k]; });
      if (typeof c.text === "string" && c.text.length > MSG_TEXT_MAX_) c.text = c.text.slice(0, MSG_TEXT_MAX_);
      if (JSON.stringify(c).length > 4000) return;   // not a real message
      byId[m.id] = c;
      fresh.push(c);
    });
    if (fresh.length) {
      fresh.sort(function (a, b) { return tms_(a.date) - tms_(b.date); });
      existing = existing.concat(fresh.slice(-20));   // at most 20 new messages in one patch
      msgChanged = true;
    }
    if (msgChanged) {
      var merged = fresh.length ? capMessages_(existing) : existing.slice().sort(function (a, b) { return tms_(a.date) - tms_(b.date); });
      var json = JSON.stringify(merged);
      if (json !== before) { row.messages = json; changed = true; stamped.push("messages"); }
    }
  }

  if (patch.pendingDeletion !== undefined) {
    var pd = patch.pendingDeletion === true || patch.pendingDeletion === "true";
    if (String(pd) !== String(row.pendingDeletion === true || row.pendingDeletion === "true")) { row.pendingDeletion = pd; changed = true; stamped.push("pendingDeletion"); }
  }
  if (patch.deletionConfirmed !== undefined) {
    var dc = patch.deletionConfirmed === true || patch.deletionConfirmed === "true";
    if (String(dc) !== String(row.deletionConfirmed === true || row.deletionConfirmed === "true")) { row.deletionConfirmed = dc; changed = true; stamped.push("deletionConfirmed"); }
  }

  if (Array.isArray(patch.redemptions)) {
    var have = parseArr_(row.redemptions);
    var seen = {};
    have.forEach(function (r) { if (r && r.date) seen[r.date] = true; });
    var points = Number(row.rewardPoints) || 0;
    var bonus = Number(row.bonusHours) || 0;
    var sessions = Number(row.sessionsRemaining) || 0;
    var added = 0, catalog = null, nowMs = Date.now();
    patch.redemptions.forEach(function (r) {
      if (!r || typeof r !== "object" || !r.date || seen[r.date]) return;
      var refuse = function () { refusedRedemptions.push(String(r.date).slice(0, 40)); seen[r.date] = true; };
      var at = Date.parse(r.date);
      if (added >= REDEEM_MAX_NEW_ || typeof r.date !== "string" || isNaN(at) || at < nowMs - 90 * 86400000 || at > nowMs + 7 * 86400000) return refuse();
      var cost = Number(r.cost), hours = Number(r.hours) || 0, label;
      if (hours > 0) {
        if (!(Math.floor(hours) === hours && hours >= 1 && cost === hours * POINTS_PER_HOUR_)) return refuse();
        label = "+" + hours + " bonus hour" + (hours === 1 ? "" : "s");
      } else {
        if (!catalog) catalog = liveRewardCatalog_();
        var want = String(r.label == null ? "" : r.label).trim(), item = null;
        if (r.itemId) item = catalog.filter(function (x) { return String(x.id) === String(r.itemId); })[0] || null;
        if (!item) item = catalog.filter(function (x) { return String(x.label == null ? "" : x.label).trim() === want && want !== ""; })[0] || null;
        if (!item || !(cost > 0) || Number(item.cost) !== cost) return refuse();
        label = String(item.label);
        hours = 0;
      }
      if (!(cost > 0) || cost > points) return refuse();   // cannot redeem more than the row has
      points -= cost;
      bonus += hours;
      sessions += hours;
      have.push({ date: r.date, label: label, cost: cost, hours: hours });
      seen[r.date] = true;
      added++;
    });
    if (added) {
      row.redemptions = JSON.stringify(have);
      row.rewardPoints = points;
      row.bonusHours = bonus;
      row.sessionsRemaining = sessions;
      changed = true; stamped.push("redemptions", "rewardPoints", "bonusHours", "sessionsRemaining");
    }
  }

  if (changed) {
    touch_(row, stamped, new Date().toISOString());
    writeRows_(ROSTER_SHEET, ROSTER_COLUMNS, rows);
  }
  var out = { ok: true, changed: changed, student: row };
  if (refusedRedemptions.length) out.refusedRedemptions = refusedRedemptions;
  return out;
}

// ---------- tombstones (shared by roster, schedule and leads) ----------
// The DeletedIds tab is a UNION of every deletion ever pushed from any
// device, for every record type (student, teacher, class, pattern,
// lead). It only ever grows: a push merges by id instead of replacing
// the tab, so a roster push can never wipe the schedule's tombstones.
function deletedIdsOfType_(types) {
  return readRows_(DELETED_IDS_SHEET, DELETED_IDS_COLUMNS).filter(function (r) {
    return r && r.id && types.indexOf(String(r.type || "student")) !== -1;
  });
}
// v14: who may delete what is decided HERE, for every action (it used to
// be checked on roster pushes only, so a regular teacher could delete the
// owner through a schedule or leads push):
//   - each action takes only its own kinds (`allowedTypes`): pushRoster
//     student/teacher/reward, pushScheduleV2 class/pattern/blockedDate,
//     pushLeads lead;
//   - the main owner can never be deleted;
//   - a regular teacher deletes only their OWN students -- never a teacher,
//     a reward, or another teacher's student (classes, holidays and leads
//     stay open to every teacher, as before).
// -> { added: [new tombstone rows], refused: [{id, type}] }
function mergeDeletedIds_(incoming, who, allowedTypes) {
  var res = { added: [], refused: [] };
  if (!Array.isArray(incoming) || !incoming.length) return res;
  var existing = readRows_(DELETED_IDS_SHEET, DELETED_IDS_COLUMNS);
  // v14: keyed by type + id, so a tombstone of one kind (anyone may delete a "class") never
  // stands in for a deletion of another kind with the same id
  var byId = {}, changed = 0, tkey = function (type, id) { return type + "|" + id; };
  existing.forEach(function (r) { if (r && r.id) { var k = tkey(String(r.type || "student"), String(r.id)); if (!byId[k]) byId[k] = r; } });
  var main = mainOwnerOf_(readRows_(TEACHERS_SHEET, TEACHERS_COLUMNS));
  var owner = callerIsOwner_(who), myId = who && who.teacher ? who.teacher.id : "", mine = null;
  var allowed = function (id, type) {
    if ((allowedTypes || []).indexOf(type) < 0) return false;
    if (main && id === main.id) return false;   // the main owner's account can't be deleted
    if (owner) return true;
    if (type === "teacher" || type === "reward") return false;
    if (type === "student") {
      if (!mine) { mine = {}; readRows_(ROSTER_SHEET, ROSTER_COLUMNS).forEach(function (r) { if (myId && r.teacherId === myId) mine[r.id] = true; }); }
      return !!mine[id];
    }
    return true;
  };
  var cap = futureCap_();
  incoming.forEach(function (r) {
    if (!r || !r.id) return;
    var id = String(r.id), type = String(r.type || "student");
    var when = tms_(r.deletedAt) ? iso_(Math.min(tms_(r.deletedAt), cap)) : new Date().toISOString();
    // A holiday can be removed, added again and removed again: its
    // tombstone keeps the LATEST removal time (compared with addedAt).
    if (byId[tkey(type, id)]) {
      var have = byId[tkey(type, id)];
      if (type === "blockedDate" && allowed(id, type) && tms_(when) > tms_(have.deletedAt)) { have.deletedAt = when; changed++; }
      return;   // already deleted: nothing new
    }
    if (!allowed(id, type)) { res.refused.push({ id: id, type: type }); return; }
    var row = { id: id, type: type, deletedAt: when };
    existing.push(row); byId[tkey(type, id)] = row; res.added.push(row);
    changed++;
  });
  if (changed) writeRows_(DELETED_IDS_SHEET, DELETED_IDS_COLUMNS, existing);
  return res;
}

// Security (v11): a PIN hash is the credential the script checks (tid/th, sid/sh), so a pull never
// hands out anyone else's: students come without pinHash, teachers only with the caller's own.
// Devices keep their local hash (keepHidden in js/lumio-profiles.js) and keepPinHashes_ keeps
// the Sheet's when a push leaves it out.
// v14: also hands the signed-in device its token (authToken, see tokenFor_), so a device that
// signed in before v14 gets one on its next sync.
function pullRoster_(who) {
  var me = who && who.teacher ? who.teacher.id : "";
  var out = {
    students: readRows_(ROSTER_SHEET, ROSTER_COLUMNS).map(function (s) { var o = Object.assign({}, s); delete o.pinHash; return o; }),
    teachers: readRows_(TEACHERS_SHEET, TEACHERS_COLUMNS).map(function (t) { var o = Object.assign({}, t); if (!(who && who.open) && o.id !== me) delete o.pinHash; return o; }),
    rewardCatalog: readRows_(REWARD_CATALOG_SHEET, REWARD_CATALOG_COLUMNS),
    deletedIds: deletedIdsOfType_(["student", "teacher", "reward"]),
  };
  if (who && who.teacher && who.teacher.pinHash) out.authToken = tokenFor_("t", who.teacher.id, who.teacher.pinHash);
  return out;
}

// A pushed row with an empty pinHash never clears one the Sheet already
// has (a device that was only shown the public teacher list has none).
function keepPinHashes_(incoming, sheet, columns) {
  var have = {};
  readRows_(sheet, columns).forEach(function (r) { if (r.id && r.pinHash) have[r.id] = r.pinHash; });
  return incoming.map(function (r) {
    if (r && !r.pinHash && have[r.id]) { var c = {}; Object.keys(r).forEach(function (k) { c[k] = r[k]; }); c.pinHash = have[r.id]; return c; }
    return r;
  });
}
// Names compared the way people type them: case, outer and double spaces ignored.
function normFull_(v) { return String(v == null ? "" : v).trim().replace(/\s+/g, " ").toLowerCase(); }
// Exact Roster name -> ids of the live (not deleted) children with it.
function rosterNameIds_() {
  var gone = goneSet_(["student"]), out = {};
  readRows_(ROSTER_SHEET, ROSTER_COLUMNS).forEach(function (s) {
    if (!s || !s.id || gone[s.id] || !s.name) return;
    (out[s.name] = out[s.name] || []).push(String(s.id));
  });
  return out;
}
// Display names that more than one live child has (ignoring case and spaces).
function duplicateNames_() {
  var gone = goneSet_(["student"]), seen = {}, out = [];
  readRows_(ROSTER_SHEET, ROSTER_COLUMNS).forEach(function (s) {
    if (!s || !s.id || gone[s.id]) return;
    var k = normFull_(s.name);
    if (!k) return;
    if (seen[k] === 1) out.push(String(s.name).trim());
    seen[k] = (seen[k] || 0) + 1;
  });
  return out;
}
// Editor helper: which children share a display name? Their results from
// before v14 (saved by name only) are visible to both until one is renamed
// on the teacher dashboard; everything saved since is kept apart by id.
function listDuplicateNames() {
  var d = duplicateNames_();
  Logger.log(d.length ? "Children sharing a name: " + d.join(", ") : "No two children share a name.");
  return d;
}
// Renaming a student (teacher dashboard) moves their Progress/Homework/
// Extras rows and class seats to the new name, keeping the best result per
// lesson. v14: rows and seats with the child's id move; rows saved by name
// only (before v14) move too -- unless another child on the Roster still
// has the old name, in which case they stay with that child and this one
// gets a copy (both keep the shared history).
function applyRenames_(renames) {
  var done = 0;
  (renames || []).forEach(function (rn) {
    if (!rn || !rn.from || !rn.to || rn.from === rn.to) return;
    var id = rn.id ? String(rn.id) : "", now = new Date().toISOString();
    var gone = goneSet_(["student"]);
    var shared = readRows_(ROSTER_SHEET, ROSTER_COLUMNS).some(function (s) { return s && !gone[s.id] && String(s.id) !== id && s.name === rn.from; });
    var copyAs = function (r) { var c = {}; Object.keys(r).forEach(function (k) { c[k] = r[k]; }); c.studentName = rn.to; if (id) c.studentId = id; return c; };
    var split = function (rows) {
      var keep = [], moving = [];
      rows.forEach(function (r) {
        var mine = id && String(r.studentId || "") === id, legacy = !r.studentId && r.studentName === rn.from;
        if (mine) { if (r.studentName !== rn.to) moving.push(copyAs(r)); else keep.push(r); return; }
        if (legacy) { if (shared && id) keep.push(r); moving.push(copyAs(r)); return; }
        keep.push(r);
      });
      return { keep: keep, moving: moving };
    };
    [[PROGRESS_SHEET, PROGRESS_COLUMNS], [HOMEWORK_SHEET, HOMEWORK_COLUMNS]].forEach(function (t) {
      var s = split(readRows_(t[0], t[1]));
      if (!s.moving.length) return;
      writeRows_(t[0], t[1], s.keep);
      mergeRecordRows_(t[0], t[1], s.moving);
      done++;
    });
    var ex = split(readRows_(EXTRAS_SHEET, EXTRAS_COLUMNS));
    if (ex.moving.length) {
      writeRows_(EXTRAS_SHEET, EXTRAS_COLUMNS, ex.keep);
      mergeExtraRows_(ex.moving);
      done++;
    }
    [[SCHEDULE_SHEET, SCHEDULE_COLUMNS], [PATTERNS_SHEET, PATTERNS_COLUMNS]].forEach(function (t) {
      var rows = readRows_(t[0], t[1]), changed = false;
      rows.forEach(function (r) {
        var seats; try { seats = JSON.parse(r.studentsJson || "[]"); } catch (e) { return; }
        if (!Array.isArray(seats)) return;
        var hit = false;
        seats.forEach(function (st) {
          if (!st || typeof st !== "object") return;
          var me = id ? (String(st.studentId || "") === id || (!st.studentId && st.studentName === rn.from && !shared)) : st.studentName === rn.from;
          if (!me || st.studentName === rn.to) return;
          st.studentName = rn.to; if (id && !st.studentId) st.studentId = id; st.updatedAt = now; hit = true;
        });
        if (hit) { r.studentsJson = JSON.stringify(seats); touch_(r, t[0] === PATTERNS_SHEET ? ["students"] : [], now); changed = true; }
      });
      if (changed) { writeRows_(t[0], t[1], rows); done++; }
    });
  });
  return done;
}

// MERGES into the Sheet (see mergeFields_) instead of replacing the tabs:
// a student who registered, or redeemed points, between this device's pull
// and its push is no longer erased. Removal only through DeletedIds.
// The main owner ("Teacher Lumi", else the longest-standing owner) is the only one who may give or
// take away owner access; nobody can take it from them (same rule as js/lumio-profiles.js).
function mainOwnerOf_(teachers) {
  var byName = teachers.filter(function (t) { return String(t.name || "").trim().toLowerCase() === "teacher lumi"; })[0];
  if (byName) return byName;
  var owners = teachers.filter(function (t) { return t.isOwner === true || t.isOwner === "true"; });
  owners.sort(function (a, b) { return String(a.createdAt || "").localeCompare(String(b.createdAt || "")); });
  return owners[0] || teachers[0] || null;
}
function isOwnerVal_(v) { return v === true || v === "true"; }
// approved / subscribed: read like the pages do (toBool in js/lumio-profiles.js): empty = on,
// any other text is on only when it says "true" (any case), so a hand-typed "FALSE" is off.
function flagOff_(v) {
  if (v === "" || v === undefined || v === null) return false;
  if (typeof v === "string") return v.trim().toLowerCase() !== "true";
  return !v;
}
function callerIsOwner_(who) { return !!(who && (who.open || (who.teacher && isOwnerVal_(who.teacher.isOwner)))); }
// Same rows, same values in every column? (a Teachers write is skipped when nothing changed,
// so ordinary syncs don't keep renewing the Teachers cache)
function sameRows_(a, b, columns) {
  if (a.length !== b.length) return false;
  for (var i = 0; i < a.length; i++) for (var j = 0; j < columns.length; j++) {
    var x = a[i][columns[j]], y = b[i][columns[j]];
    if (valKey_(x) !== valKey_(y)) return false;
  }
  return true;
}
// v14: answers also carry `refused` (deletions this caller may not make, see mergeDeletedIds_) and
// `dupNames` (display names now on more than one child).
function pushRoster_(body, who) {
  return withLock_(20000, function () {
    var del = mergeDeletedIds_(body.deletedIds, who, ["student", "teacher", "reward"]);
    var addedType = function (t) { return del.added.some(function (d) { return d.type === t; }); };
    if (Array.isArray(body.students)) {
      // v14: a regular teacher can't move another teacher's student to themselves (that was the
      // first half of deleting it: reassign, then delete "their own" student). The Sheet's
      // teacherId stays and is stamped just after that device's change, so the device takes it
      // back on its next sync (a later change by an owner still wins).
      // Owners reassign as before; a student with no teacher yet (or the caller's own) is open.
      var isOwner = callerIsOwner_(who), myTid = who && who.teacher ? String(who.teacher.id) : "";
      var mergeOne = function (a, b) {
        var m = mergeStudentRow_(a, b), was = String(a.teacherId == null ? "" : a.teacherId);
        if (!isOwner && was !== "" && was !== myTid && String(m.teacherId == null ? "" : m.teacherId) !== was) {
          var tb = Math.min(fieldTime_(b, ftOf_(b), "teacherId"), futureCap_()), ta = fieldTime_(a, ftOf_(a), "teacherId");
          m.teacherId = a.teacherId;
          m.fieldTimes = ftOf_(m); m.fieldTimes.teacherId = iso_(Math.max(ta, tb + 1));
        }
        return m;
      };
      writeRows_(ROSTER_SHEET, ROSTER_COLUMNS, mergeRowsById_(readRows_(ROSTER_SHEET, ROSTER_COLUMNS),
        keepPinHashes_(body.students, ROSTER_SHEET, ROSTER_COLUMNS), goneSet_(["student"]), mergeOne));
    } else if (addedType("student")) pruneGone_(ROSTER_SHEET, ROSTER_COLUMNS, "student");   // that account is signed out at once
    if (Array.isArray(body.teachers)) {
      var sheetTeachers = readRows_(TEACHERS_SHEET, TEACHERS_COLUMNS), main = mainOwnerOf_(sheetTeachers);
      var callerIsMain = !!(who && (who.open || (who.teacher && main && who.teacher.id === main.id)));
      var merged = mergeRowsById_(sheetTeachers,
        keepPinHashes_(body.teachers, TEACHERS_SHEET, TEACHERS_COLUMNS), goneSet_(["teacher"]), function (a, b) {
          var m = mergeFields_(a, b);
          if (!m.pinHash && a.pinHash) m.pinHash = a.pinHash;
          if (!callerIsMain) m.isOwner = a.isOwner;                        // only the main owner changes owner access
          if (main && a.id === main.id) m.isOwner = true;                  // the main owner always stays an owner
          // v11: only the main owner edits the main owner's record (name, PIN, link...); a regular
          // teacher edits only their own record -- so nobody can reset someone else's PIN
          if (!callerIsMain && main && a.id === main.id && !(who && who.teacher && who.teacher.id === a.id)) return a;
          if (!callerIsOwner_(who) && !(who && who.teacher && who.teacher.id === a.id)) return a;
          return m;
        });
      if (!callerIsMain) {
        var known = {}; sheetTeachers.forEach(function (t) { known[t.id] = true; });
        merged.forEach(function (t) { if (!known[t.id]) t.isOwner = false; });   // new teachers from others start as plain teachers
        if (!callerIsOwner_(who)) merged = merged.filter(function (t) { return known[t.id]; });   // only owners add teachers
      }
      if (!sameRows_(merged, sheetTeachers, TEACHERS_COLUMNS)) writeRows_(TEACHERS_SHEET, TEACHERS_COLUMNS, merged);
    } else if (addedType("teacher")) pruneGone_(TEACHERS_SHEET, TEACHERS_COLUMNS, "teacher");
    if (Array.isArray(body.rewardCatalog)) {
      writeRows_(REWARD_CATALOG_SHEET, REWARD_CATALOG_COLUMNS, mergeRowsById_(readRows_(REWARD_CATALOG_SHEET, REWARD_CATALOG_COLUMNS),
        body.rewardCatalog, goneSet_(["reward"]), function (a, b) { return b; }));
    } else if (addedType("reward")) pruneGone_(REWARD_CATALOG_SHEET, REWARD_CATALOG_COLUMNS, "reward");
    var renamed = applyRenames_(body.renames);
    var out = { ok: true, renamed: renamed, merged: true };
    if (del.refused.length) out.refused = del.refused;
    if (Array.isArray(body.students)) { var dups = duplicateNames_(); if (dups.length) out.dupNames = dups; }
    return out;
  });
}

// ---------- schedule (V2) ----------

function classToRow_(c) {
  var row = {};
  SCHEDULE_COLUMNS.forEach(function (col) { row[col] = c[col] !== undefined ? c[col] : ""; });
  row.studentsJson = JSON.stringify(Array.isArray(c.students) ? c.students : []);
  delete row.students;
  return row;
}
function rowToClass_(row) {
  var c = {};
  SCHEDULE_COLUMNS.forEach(function (col) { if (col !== "studentsJson") c[col] = row[col]; });
  try { c.students = JSON.parse(row.studentsJson || "[]"); } catch (e) { c.students = []; }
  if (!Array.isArray(c.students)) c.students = [];
  var ft = ftOf_(row);
  if (Object.keys(ft).length) c.fieldTimes = ft; else delete c.fieldTimes;
  return c;
}
// Blocked dates still in force: newest addedAt per date, minus any date
// whose "blockedDate" tombstone is at least as new.
function liveBlockedDates_(rows, tombRows) {
  var by = {}, tomb = {};
  (tombRows || []).forEach(function (d) { if (tms_(d.deletedAt) >= tms_(tomb[d.id])) tomb[d.id] = d.deletedAt || ""; });
  (rows || []).forEach(function (b) {
    var e = typeof b === "string" ? { date: b, label: "", addedAt: "" } : { date: b && b.date, label: (b && b.label) || "", addedAt: (b && b.addedAt) || "" };
    if (!e.date) return;
    if (!by[e.date] || tms_(e.addedAt) > tms_(by[e.date].addedAt)) by[e.date] = e;
  });
  return Object.keys(by).map(function (k) { return by[k]; })
    .filter(function (e) { return !(e.date in tomb && tms_(tomb[e.date]) >= tms_(e.addedAt)); });
}

function pullScheduleV2_() {
  return {
    classes: readRows_(SCHEDULE_SHEET, SCHEDULE_COLUMNS).map(rowToClass_),
    patterns: readRows_(PATTERNS_SHEET, PATTERNS_COLUMNS).map(rowToPattern_),
    blockedDates: liveBlockedDates_(readRows_(BLOCKED_DATES_SHEET, BLOCKED_DATES_COLUMNS), deletedIdsOfType_(["blockedDate"])),
    deletedIds: deletedIdsOfType_(["class", "pattern", "blockedDate"]),
  };
}

// Merged into the Sheet like the roster (classes per field + per seat,
// patterns per field, blocked dates by addedAt vs tombstone); duplicate
// copies of one fixed-schedule session are folded together.
// v14: deletions here are classes, slots and holidays only (see mergeDeletedIds_).
function pushScheduleV2_(body, who) {
  return withLock_(20000, function () {
    var del = mergeDeletedIds_(body.deletedIds, who || { open: true }, ["class", "pattern", "blockedDate"]);
    if (Array.isArray(body.classes)) {
      var merged = mergeRowsById_(readRows_(SCHEDULE_SHEET, SCHEDULE_COLUMNS).map(rowToClass_), body.classes,
        goneSet_(["class"]), mergeClass_);
      writeRows_(SCHEDULE_SHEET, SCHEDULE_COLUMNS, dedupePatternClasses_(merged).map(classToRow_));
    } else if (del.added.some(function (d) { return d.type === "class"; })) pruneGone_(SCHEDULE_SHEET, SCHEDULE_COLUMNS, "class");
    if (Array.isArray(body.patterns)) {
      writeRows_(PATTERNS_SHEET, PATTERNS_COLUMNS, mergeRowsById_(readRows_(PATTERNS_SHEET, PATTERNS_COLUMNS).map(rowToPattern_),
        body.patterns, goneSet_(["pattern"]), function (a, b) { return mergeFields_(a, b); }).map(patternToRow_));
    } else if (del.added.some(function (d) { return d.type === "pattern"; })) pruneGone_(PATTERNS_SHEET, PATTERNS_COLUMNS, "pattern");
    if (Array.isArray(body.blockedDates)) {
      writeRows_(BLOCKED_DATES_SHEET, BLOCKED_DATES_COLUMNS, liveBlockedDates_(
        readRows_(BLOCKED_DATES_SHEET, BLOCKED_DATES_COLUMNS).concat(body.blockedDates), deletedIdsOfType_(["blockedDate"])));
    }
    var out = { ok: true, merged: true };
    if (del.refused.length) out.refused = del.refused;
    return out;
  });
}

function patternToRow_(p) {
  var row = {};
  PATTERNS_COLUMNS.forEach(function (col) { row[col] = p[col] !== undefined ? p[col] : ""; });
  row.studentsJson = JSON.stringify(Array.isArray(p.students) ? p.students : []);
  delete row.students;
  return row;
}
function rowToPattern_(row) {
  var p = {};
  PATTERNS_COLUMNS.forEach(function (col) { if (col !== "studentsJson") p[col] = row[col]; });
  try { p.students = JSON.parse(row.studentsJson || "[]"); } catch (e) { p.students = []; }
  if (!Array.isArray(p.students)) p.students = [];
  p.active = row.active === true || row.active === "true" || row.active === 1;
  p.extra = row.extra === true || row.extra === "true" || row.extra === 1;
  var ft = ftOf_(row);
  if (Object.keys(ft).length) p.fieldTimes = ft; else delete p.fieldTimes;
  return p;
}

// ---------- student-device booking (narrow, locked write path) ----------
// A student's phone never pushes the whole schedule (its copy is stale).
// It sends ONE class it wants to book into / create, and this re-checks
// the rules under a script lock, so two students tapping the same seat at
// once can't both get it:
//   - a slot (patternId+date) that already has a class: same level+lesson
//     only, max 4 students, no duplicates
//   - an empty slot: the first booking creates the class and locks it
// v14: for a student device every rule is checked here (bookSlotStudent_),
// not only on the phone.
function normStudent_(n) { return String(n || "").trim().toLowerCase(); }
// The live-class link a booked class should carry: the slot's own link,
// else the teacher's standing classroom link. Students can't look either
// up themselves (pullScheduleV2 blanks pattern links for them, and the
// public teacher list has no meetingLink), so the class row must hold it.
function slotLinkFor_(patternId, teacherId) {
  if (patternId) {
    var pats = readRows_(PATTERNS_SHEET, PATTERNS_COLUMNS);
    for (var i = 0; i < pats.length; i++) if (pats[i].id === patternId) {
      if (pats[i].meetingLink) return String(pats[i].meetingLink);
      if (!teacherId) teacherId = pats[i].teacherId;
      break;
    }
  }
  if (teacherId) {
    var ts = readRows_(TEACHERS_SHEET, TEACHERS_COLUMNS);
    for (var j = 0; j < ts.length; j++) if (ts[j].id === teacherId && ts[j].meetingLink) return String(ts[j].meetingLink);
  }
  return "";
}
// ---- the booking rules on the script (v14) ----
// Same rules as js/lumio-schedule.js (studentBookingState, openSlots,
// bookStudentIntoSlot), which the page applies first for instant feedback.
// Every class date/time is Saudi wall time (UTC+3, no daylight saving).
var MAX_PER_CLASS_ = 4, MAX_PER_WEEK_ = 3, CANCEL_MIN_BEFORE_ = 30, BOOK_HORIZON_DAYS_ = 22;
var BONUS_AFTER_ = [4, 8, 12, 16], LESSONS_PER_LEVEL_ = 20;
function riyadhToday_() { return new Date(Date.now() + 3 * 3600000).toISOString().slice(0, 10); }
function addDays_(date, n) {
  var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(date || ""));
  if (!m) return "";
  return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3] + n)).toISOString().slice(0, 10);
}
function dowOf_(date) {
  var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(date || ""));
  return m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])).getUTCDay() : -1;
}
// Start of a class (ms), NaN when the date or time isn't a real one.
function startMs_(date, hm) {
  var d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(date || "")), t = /^(\d{1,2}):(\d{2})$/.exec(String(hm || ""));
  if (!d || !t || +t[1] > 23 || +t[2] > 59) return NaN;
  return Date.UTC(+d[1], +d[2] - 1, +d[3], +t[1] - 3, +t[2]);
}
function classStartMs_(c) { return startMs_(c && c.date, c && c.startTime); }
function weekKey_(date) { return addDays_(date, -dowOf_(date)); }   // the Sunday of that Sun-Sat week
// Lessons 1-20 with Bonus Class N after every four (4.5, 8.5, 12.5, 16.5) -- Lumio.levelSequence.
function levelSeq_() {
  var out = [];
  for (var n = 1; n <= LESSONS_PER_LEVEL_; n++) { out.push(n); if (BONUS_AFTER_.indexOf(n) >= 0) out.push(n + 0.5); }
  return out;
}
function lessonLabel_(n) { var b = BONUS_AFTER_.indexOf(Math.floor(n)); return n % 1 && b >= 0 ? "Bonus Class " + (b + 1) : "Lesson " + n; }
// Live classes run 45-90 min (LumioSchedule.lessonDuration).
function lessonDuration_(level, lesson) {
  var n = Number(lesson) || 1;
  if (n % 1 !== 0) return level === "pre-a" ? 45 : 60;
  if (n >= LESSONS_PER_LEVEL_) return 90;
  if (n <= 3) return 45;
  return 60;
}
function isLegacyPattern_(p) { return Array.isArray(p && p.students) && p.students.length > 0; }
function overlaps_(s1, d1, s2, d2) { return s1 < s2 + d2 * 60000 && s2 < s1 + d1 * 60000; }
function mySeat_(c, me) { var s = (c.students || []).filter(function (x) { return seatIsMe_(x, me); }); return s[0] || null; }
// What this child may book next in `level` (LumioSchedule.studentBookingState): attended = seat marked
// "present", booked = a still-"scheduled" class; a Bonus Class they went past without attending is owed
// and comes first.
function bookingState_(classes, me, level) {
  var attended = {}, booked = [], bookedSet = {}, top = 0;
  classes.forEach(function (c) {
    if (String(c.level) !== String(level)) return;
    var seat = mySeat_(c, me);
    if (!seat) return;
    var n = Number(c.lessonNumber) || 0;
    if (seat.attendance === "present" && n) { attended[n] = true; top = Math.max(top, n); }
    if (c.status === "scheduled") { booked.push(c); bookedSet[n] = true; top = Math.max(top, n); }
  });
  var seq = levelSeq_(), next = null;
  for (var i = 0; i < seq.length && next === null; i++) { var b = seq[i]; if (b % 1 && b < top && !attended[b] && !bookedSet[b]) next = b; }
  if (next === null) for (var j = 0; j < seq.length && next === null; j++) if (seq[j] > top) next = seq[j];
  var latest = 0;
  booked.forEach(function (c) { var s = classStartMs_(c); if (s > latest) latest = s; });
  return { next: next, latestStart: latest };
}

// Teacher devices (trusted): the v13 path, unchanged apart from matching the seat by id.
function bookSlot_(body) {
  var cls = body && body.cls, student = body && body.student;
  if (!cls || !cls.id || !student || !student.studentName) return { ok: false, error: "missing class or student" };
  var max = Number(body.maxPerClass) || MAX_PER_CLASS_;
  var me = { id: student.studentId || "", name: student.studentName };
  return withLock_(15000, function () {
    me.live = liveStudentIds_(null);
    var rows = readRows_(SCHEDULE_SHEET, SCHEDULE_COLUMNS).map(rowToClass_);
    var existing = null;
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      if (r.id === cls.id) { existing = r; break; }
      if (cls.patternId && r.patternId === cls.patternId && r.date === cls.date && r.status !== "cancelled") { existing = r; break; }
    }
    var nowIso = new Date().toISOString();
    if (existing) {
      if (existing.status === "cancelled") return { ok: false, error: "That class was cancelled." };
      var already = existing.students.some(function (s) { return seatIsMe_(s, me) || (!me.id && normStudent_(s.studentName) === normStudent_(me.name)); });
      if (already) return { ok: true, cls: existing };
      if (existing.lessonNumber && (String(existing.level) !== String(cls.level) || Number(existing.lessonNumber) !== Number(cls.lessonNumber))) return { ok: false, error: "That class is for a different lesson." };
      if (existing.students.length >= max) return { ok: false, error: "That class is full (" + max + "/" + max + ")." };
      var locks = [];
      if (!existing.lessonNumber) { existing.level = cls.level; existing.lessonNumber = cls.lessonNumber; existing.durationMinutes = cls.durationMinutes; locks = ["level", "lessonNumber", "durationMinutes"]; }
      if (!existing.meetingLink) { var exLink = slotLinkFor_(existing.patternId, existing.teacherId); if (exLink) { existing.meetingLink = exLink; locks.push("meetingLink"); } }
      existing.students.push({ studentId: student.studentId || null, studentName: student.studentName, attendance: null, grade: null, teacherRatingStars: null, updatedAt: nowIso });
      touch_(existing, locks, nowIso);
      writeRows_(SCHEDULE_SHEET, SCHEDULE_COLUMNS, rows.map(classToRow_));
      return { ok: true, cls: existing };
    }
    cls.students = [{ studentId: student.studentId || null, studentName: student.studentName, attendance: null, grade: null, teacherRatingStars: null, updatedAt: nowIso }];
    cls.status = "scheduled";
    if (!cls.meetingLink) cls.meetingLink = slotLinkFor_(cls.patternId, cls.teacherId);
    cls.createdAt = cls.createdAt || nowIso; cls.updatedAt = nowIso;
    rows.push(cls);
    writeRows_(SCHEDULE_SHEET, SCHEDULE_COLUMNS, rows.map(classToRow_));
    return { ok: true, cls: cls };
  });
}

// Student devices (v14): the script is the referee. From the request it
// reads ONLY which class/slot (cls.id, or cls.patternId + cls.date) and
// which level + lesson; everything else -- teacher, time, length, link,
// notes, capacity -- comes from the Sheet. It checks, under the lock:
//   1. the account is approved + subscribed and the level is the child's;
//   2. the lesson is the child's next one (owed Bonus Classes first);
//   3. a session is left that isn't already promised to a booked class;
//   4. fewer than 3 classes in that Sun-Sat week;
//   and always: the slot is open on that date (active, right weekday, in
//   its date range, not a holiday, a real teacher, within 22 days, not
//   started), the class has room (4 seats) and is for this lesson, and
//   neither the child nor the teacher is busy then.
// Script Property LUMIO_BOOKING_CHECKS_OFF = 1 skips checks 1-4 only.
// Refusals keep the v13 texts the page shows ("That class is full (4/4).",
// "...different lesson.", "...was cancelled."); new ones start with "The
// server refused that booking:" (js/lumio-schedule.js shows those as is).
function bookSlotStudent_(body, who) {
  var c = (body && body.cls) || {};
  var refuse = function (why) { return { ok: false, error: "The server refused that booking: " + why + "." }; };
  return withLock_(15000, function () {
    var me = null, roster = readRows_(ROSTER_SHEET, ROSTER_COLUMNS);
    for (var i = 0; i < roster.length; i++) if (roster[i].id === who.student.id) { me = roster[i]; break; }
    if (!me) return refuse("your account wasn't found - sign in again");
    var meRef = meRef_(me, roster);
    var checks = String(props_().LUMIO_BOOKING_CHECKS_OFF || "") !== "1";
    var level = String(c.level || ""), lesson = Number(c.lessonNumber);
    if (!/^(pre-a|level([1-9]|10))$/.test(level) || levelSeq_().indexOf(lesson) < 0) return refuse("that isn't a lesson of a level");
    if (checks) {
      if (flagOff_(me.approved) || flagOff_(me.subscribed)) return refuse("this account isn't subscribed yet");
      if (!me.level || String(me.level) !== level) return refuse("that class is for another level");
    }
    var classes = readRows_(SCHEDULE_SHEET, SCHEDULE_COLUMNS).map(rowToClass_);
    var existing = null;
    if (c.id) existing = classes.filter(function (x) { return x.id === String(c.id); })[0] || null;
    if (!existing && c.patternId && c.date) existing = classes.filter(function (x) { return x.patternId === String(c.patternId) && x.date === String(c.date) && x.status !== "cancelled"; })[0] || null;
    if (existing && existing.status === "cancelled") return { ok: false, error: "That class was cancelled." };
    if (existing && mySeat_(existing, meRef)) return { ok: true, cls: existing };   // already booked (a retry)
    var st = bookingState_(classes, meRef, level);
    if (checks) {
      if (st.next === null) return refuse("every lesson of this level is already attended or booked");
      if (lesson !== st.next) return refuse("your next class is " + lessonLabel_(st.next) + " - refresh and try again");
    }
    var patterns = readRows_(PATTERNS_SHEET, PATTERNS_COLUMNS).map(rowToPattern_);
    var patOf = function (id) { return patterns.filter(function (p) { return p.id === id; })[0] || null; };
    var now = Date.now(), nowIso = new Date(now).toISOString();
    var mine = classes.filter(function (x) { return mySeat_(x, meRef); });
    // the rules shared by joining and creating
    var common = function (date, start, dur, exceptId) {
      if (isNaN(start) || start <= now) return refuse("that time has already passed");
      if (mine.some(function (x) { return x.id !== exceptId && x.status === "scheduled" && overlaps_(start, dur, classStartMs_(x), Number(x.durationMinutes) || 45); })) return refuse("you already have a class at that time");
      if (start <= st.latestStart) return refuse(lessonLabel_(lesson) + " must come after the lessons already booked - pick a later time");
      if (checks) {
        var pending = mine.filter(function (x) { var s = mySeat_(x, meRef); return x.status === "scheduled" && s && !s.attendance; }).length;
        if ((Number(me.sessionsRemaining) || 0) - pending <= 0) return refuse(Number(me.sessionsRemaining) > 0 ? "every session left on the package is already booked" : "no sessions left on the package");
        var wk = weekKey_(date);
        if (mine.filter(function (x) { return x.status !== "cancelled" && x.id !== exceptId && weekKey_(x.date) === wk; }).length >= MAX_PER_WEEK_) return refuse("the most is " + MAX_PER_WEEK_ + " classes a week");
      }
      return null;
    };
    var seat = { studentId: me.id, studentName: me.name, attendance: null, grade: null, teacherRatingStars: null, updatedAt: nowIso };

    if (existing) {
      if (existing.status !== "scheduled") return refuse("that class has already taken place");
      var p0 = existing.patternId ? patOf(existing.patternId) : null;
      if (p0 && (!p0.active || isLegacyPattern_(p0))) return refuse("that slot is closed");
      if (!p0 && !(existing.level && Number(existing.lessonNumber))) return refuse("that class isn't open for booking");
      if (Number(existing.lessonNumber)) {
        if (String(existing.level) !== level || Number(existing.lessonNumber) !== lesson) return { ok: false, error: "That class is for a different lesson." };
      } else if (existing.students.length) return { ok: false, error: "That class is for a different lesson." };
      if (existing.students.length >= MAX_PER_CLASS_) return { ok: false, error: "That class is full (" + MAX_PER_CLASS_ + "/" + MAX_PER_CLASS_ + ")." };
      var lockIt = !Number(existing.lessonNumber), dur0 = lockIt ? lessonDuration_(level, lesson) : (Number(existing.durationMinutes) || 45);
      var bad = common(existing.date, classStartMs_(existing), dur0, existing.id);
      if (bad) return bad;
      var locks = [];
      if (lockIt) { existing.level = level; existing.lessonNumber = lesson; existing.durationMinutes = dur0; locks = ["level", "lessonNumber", "durationMinutes"]; }
      if (!existing.meetingLink) { var exLink = slotLinkFor_(existing.patternId, existing.teacherId); if (exLink) { existing.meetingLink = exLink; locks.push("meetingLink"); } }
      existing.students.push(seat);
      touch_(existing, locks, nowIso);
      writeRows_(SCHEDULE_SHEET, SCHEDULE_COLUMNS, classes.map(classToRow_));
      return { ok: true, cls: existing };
    }

    // a new class in an open teacher slot
    var pat = c.patternId ? patOf(String(c.patternId)) : null;
    if (!pat) return refuse("pick a time slot");
    if (!pat.active || isLegacyPattern_(pat)) return refuse("that slot is closed");
    var date = String(c.date || "");
    if (dowOf_(date) < 0 || Number(pat.dayOfWeek) !== dowOf_(date) || (pat.startDate && date < String(pat.startDate)) || (pat.endDate && date >= String(pat.endDate))) return refuse("that slot isn't available on that date");
    if (liveBlockedDates_(readRows_(BLOCKED_DATES_SHEET, BLOCKED_DATES_COLUMNS), deletedIdsOfType_(["blockedDate"])).some(function (b) { return b.date === date; })) return refuse("that date is blocked (holiday / day off)");
    if (date > addDays_(riyadhToday_(), BOOK_HORIZON_DAYS_)) return refuse("that date is too far ahead");
    var goneT = goneSet_(["teacher"]);
    var teacher = readRows_(TEACHERS_SHEET, TEACHERS_COLUMNS).filter(function (t) { return t.id === pat.teacherId && !goneT[t.id]; })[0];
    if (!teacher) return refuse("that teacher isn't available");
    var dur = lessonDuration_(level, lesson), start = startMs_(date, pat.startTime);
    var bad2 = common(date, start, dur, null);
    if (bad2) return bad2;
    if (classes.some(function (x) { return x.teacherId === teacher.id && x.date === date && x.status !== "cancelled" && overlaps_(start, dur, classStartMs_(x), Number(x.durationMinutes) || 45); })) return refuse("the teacher is still teaching another class then");
    // The page's own new id is kept only when it has the page's shape ("c_" + random, genId in
    // js/lumio-schedule.js), is unused and was never deleted (any type). A fixed weekly group's
    // sessions have ids "<patternId>_<date>": a child's booking must never take one of those
    // over (the group's session would later fold into the child's class). Anything else gets a
    // new id here; bookSlotRemote adopts the class it gets back.
    var wantId = String(c.id || ""), deadIds = {};
    readRows_(DELETED_IDS_SHEET, DELETED_IDS_COLUMNS).forEach(function (d) { if (d && d.id) deadIds[String(d.id)] = true; });
    var okId = /^c_[a-z0-9]{6,24}$/.test(wantId) && !deadIds[wantId] && !classes.some(function (x) { return x.id === wantId; })
      && !patterns.some(function (p) { return p.id && wantId.indexOf(String(p.id) + "_") === 0; });
    var id = okId ? wantId : "c_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    var record = {
      id: id, teacherId: teacher.id, teacherName: teacher.name || pat.teacherName || "", date: date, startTime: pat.startTime,
      durationMinutes: dur, level: level, cohort: "", group: "", lessonNumber: lesson, meetingLink: slotLinkFor_(pat.id, teacher.id),
      notes: "", sessionNotes: "", status: "scheduled", patternId: pat.id, students: [seat], createdAt: nowIso, updatedAt: nowIso, cancelReason: ""
    };
    classes.push(record);
    writeRows_(SCHEDULE_SHEET, SCHEDULE_COLUMNS, classes.map(classToRow_));
    return { ok: true, cls: record };
  });
}

// Cancelling a seat. Student devices (who given, v14): only their own seat
// (matched by id), at least 30 minutes before the start (the script's own
// number, whatever the request says), and never a class that is no longer
// scheduled or whose seat already has attendance, a grade or a deducted
// session. Teacher devices keep the v13 rules (by name, minBefore from the
// request). An emptied class is cancelled so the teacher's slot opens again.
// Lessons are booked in order, so this child's other bookings in the same
// level that START LATER go too (v14: later in time, not a higher lesson
// number -- an owed Bonus Class 4.5 is booked after Lessons 11 and 12, and
// cancelling it must not cancel them). Classes about to start and seats
// with attendance are left alone.
function cancelSlot_(body, who) {
  var classId = body && body.classId, studentName = body && body.studentName;
  var asStudent = !!(who && who.student);
  if (!classId || (!asStudent && !studentName)) return { ok: false, error: "missing classId or studentName" };
  var minBefore = asStudent ? CANCEL_MIN_BEFORE_ : (Number(body.minBefore) || CANCEL_MIN_BEFORE_);
  var meS = asStudent ? meRef_(who.student, who.roster) : null;
  var isMine = asStudent
    ? function (s) { return seatIsMe_(s, meS); }
    : function (s) { return !!s && normStudent_(s.studentName) === normStudent_(studentName); };
  return withLock_(15000, function () {
    var rows = readRows_(SCHEDULE_SHEET, SCHEDULE_COLUMNS).map(rowToClass_);
    var c = null;
    for (var i = 0; i < rows.length; i++) if (rows[i].id === classId) { c = rows[i]; break; }
    if (!c) return { ok: false, error: "Class not found." };
    var seat = c.students.filter(isMine)[0];
    if (!seat) return { ok: false, error: "That student isn't in this class." };
    if (asStudent) {
      if (c.status !== "scheduled") return { ok: false, error: "The server refused that cancellation: that class isn't scheduled any more." };
      if (seat.attendance || seat.grade || seat.sessionDeducted) return { ok: false, error: "The server refused that cancellation: attendance for that class is already marked." };
    }
    var start = classStartMs_(c);
    var minsToStart = isNaN(start) ? -1e9 : (start - Date.now()) / 60000;
    if (minsToStart < minBefore) return { ok: false, error: "Classes can be cancelled up to " + minBefore + " minutes before they start." };
    var nowIso = new Date().toISOString();
    c.students = c.students.filter(function (s) {
      var me = isMine(s);
      if (me) tombSeat_(c, s, nowIso);   // so a teacher device's older copy can't put the seat back
      return !me;
    });
    if (!c.students.length) c.status = "cancelled";
    touch_(c, c.students.length ? [] : ["status"], nowIso);
    if (Number(c.lessonNumber) && !isNaN(start)) rows.forEach(function (x) {
      if (x.id === c.id || x.status !== "scheduled" || String(x.level) !== String(c.level)) return;
      var sx = classStartMs_(x);
      if (!(sx > start)) return;
      if (asStudent && sx - Date.now() < CANCEL_MIN_BEFORE_ * 60000) return;
      var b = x.students.length;
      x.students = x.students.filter(function (s) {
        var me = isMine(s) && !s.attendance;
        if (me) tombSeat_(x, s, nowIso);
        return !me;
      });
      if (x.students.length === b) return;
      if (!x.students.length) x.status = "cancelled";
      touch_(x, x.students.length ? [] : ["status"], nowIso);
    });
    writeRows_(SCHEDULE_SHEET, SCHEDULE_COLUMNS, rows.map(classToRow_));
    return { ok: true, cls: c };
  });
}

// A student's star rating (1-5) of the teacher for one class they were
// in. Student devices never push the schedule, so ratings used to stay on
// the phone. Sets ONLY the caller's own seat (+ that seat's updatedAt, so
// the per-seat merge keeps it against a teacher device's older copy).
// v14: a student rates only their own seat (by id), once the class has
// started and they were marked present. "not attended yet" keeps the
// rating waiting on the phone; it is sent again after attendance.
function rateClass_(body, who) {
  var classId = body && body.classId, n = Number(body && body.stars);
  if (!classId) return { ok: false, error: "missing classId" };
  if (!(n >= 1 && n <= 5 && Math.floor(n) === n)) return { ok: false, error: "Rating must be an integer from 1 to 5." };
  return withLock_(15000, function () {
    var rows = readRows_(SCHEDULE_SHEET, SCHEDULE_COLUMNS).map(rowToClass_);
    var c = null;
    for (var i = 0; i < rows.length; i++) if (rows[i].id === classId) { c = rows[i]; break; }
    if (!c) return { ok: false, error: "Class not found." };
    var sid = who.studentId, sname = who.studentName, seat = null;
    if (who.student) seat = mySeat_(c, { id: sid, name: sname, live: liveStudentIds_(who.roster) });
    else (c.students || []).forEach(function (s) {
      if (seat || !s) return;
      if ((sid && s.studentId === sid) || (sname && normStudent_(s.studentName) === normStudent_(sname))) seat = s;
    });
    if (!seat) return { ok: false, error: "That student isn't in this class." };
    if (who.student) {
      var start = classStartMs_(c);
      if (seat.attendance !== "present" || isNaN(start) || start > Date.now()) return { ok: false, error: "not attended yet" };
    }
    seat.teacherRatingStars = n;
    seat.updatedAt = new Date().toISOString();
    writeRows_(SCHEDULE_SHEET, SCHEDULE_COLUMNS, rows.map(classToRow_));
    return { ok: true, cls: c };
  });
}

// ---------- progress ----------

// Progress and homework rows are MERGED by student+level+lesson (best
// result wins, see betterRecord_), never replaced wholesale: student
// phones push only their own records, teacher devices push everything
// they know, and neither can wipe the other's rows.
// v14:
//   - every row is checked when it is written (cleanRecordRow_): a known
//     level, Lesson 1-20 or Bonus 4.5/8.5/12.5/16.5, 0-3 stars, counts
//     0-1000 with correct <= total, a real date (not after tomorrow); a row
//     that isn't a real result is dropped, and a phone sends at most 300;
//   - rows carry the child's studentId (a student's own id; on a teacher
//     push the id of the one child with that exact name). Rows saved before
//     v14 have none and still belong to that name (see mergeOwned_);
//   - all of it under the script lock (a phone and the teacher saving at
//     the same moment used to lose one of the two saves).
function flattenRecords_(tree, columns) {
  var rows = [];
  if (!tree || typeof tree !== "object") return rows;
  Object.keys(tree).forEach(function (studentName) {
    var levels = tree[studentName] || {};
    if (typeof levels !== "object") return;
    Object.keys(levels).forEach(function (level) {
      var lessons = levels[level] || {};
      if (typeof lessons !== "object") return;
      Object.keys(lessons).forEach(function (lessonId) {
        var r = lessons[lessonId] || {};
        if (typeof r !== "object") return;
        var row = { studentName: studentName, level: level, lesson: lessonId };
        columns.forEach(function (col) { if (!(col in row)) row[col] = r[col] === undefined || r[col] === null ? "" : r[col]; });
        rows.push(row);
      });
    });
  });
  return rows;
}
var RESULT_LEVEL_RE_ = /^(pre-a|level([1-9]|10))$/;
// "3", "4.5" ... or "" for anything that isn't a lesson of a level
function normLesson_(v) {
  if (v === "" || v === null || v === undefined || typeof v === "boolean") return "";
  var n = Number(v);
  if (!isFinite(n)) return "";
  if (Math.floor(n) === n && n >= 1 && n <= LESSONS_PER_LEVEL_) return String(n);
  if (BONUS_AFTER_.indexOf(n - 0.5) >= 0) return String(n);
  return "";
}
function numIn_(v, lo, hi) {
  if (v === "" || v === null || v === undefined || typeof v === "boolean") return "";
  var n = Number(v);
  if (!isFinite(n)) return "";
  return Math.min(hi, Math.max(lo, n));
}
// A result's day: YYYY-MM-DD (or a full ISO time), never after tomorrow (Saudi time); "" stays "".
function cleanDate_(v) {
  var s = String(v == null ? "" : v).trim();
  if (!s) return "";
  var today = riyadhToday_(), m = /^(\d{4}-\d{2}-\d{2})(T[0-9:.]+Z?)?$/.exec(s);
  if (!m || isNaN(Date.parse(m[1] + "T00:00:00Z"))) return today;
  return m[1] > addDays_(today, 1) ? today : s.slice(0, 30);
}
var COUNT_PAIRS_ = [["score", "total"], ["said", "saidTotal"], ["skillCorrect", "skillTotal"], ["quizCorrect", "quizTotal"],
  ["spellingCorrect", "spellingTotal"], ["recorded", "recordedTotal"]];
function cleanRecordRow_(r, columns) {
  var name = String(r.studentName == null ? "" : r.studentName);
  if (!name.trim() || name.length > 120) return null;
  var level = String(r.level || ""), lesson = normLesson_(r.lesson);
  if (!RESULT_LEVEL_RE_.test(level) || !lesson) return null;
  var stars = numIn_(r.stars, 0, 3);
  if (stars === "") return null;
  var out = {};
  columns.forEach(function (c) { out[c] = ""; });
  out.studentName = name; out.level = level; out.lesson = lesson; out.stars = Math.round(stars);
  COUNT_PAIRS_.forEach(function (p) {
    if (columns.indexOf(p[0]) < 0) return;
    var a = numIn_(r[p[0]], 0, 1000), b = numIn_(r[p[1]], 0, 1000);
    if (a !== "" && b !== "" && a > b) a = b;
    out[p[0]] = a; out[p[1]] = b;
  });
  if (columns.indexOf("hasDrawing") >= 0) out.hasDrawing = r.hasDrawing === true || r.hasDrawing === "true" ? true : (r.hasDrawing === false || r.hasDrawing === "false" ? false : "");
  if (columns.indexOf("skillType") >= 0) out.skillType = cleanText_(r.skillType, 20);
  out.date = cleanDate_(r.date);
  out.studentId = r.studentId ? String(r.studentId).slice(0, 80) : "";
  return out;
}
// Which of two results for one lesson is better: more stars (0-3), then the
// higher score (score/total), then the newer day. A stored row outside
// those ranges (e.g. 99 stars) counts as -1, so a real result replaces it.
// The same rule is Lumio.betterRecord in js/app.js.
function recStars_(r) {
  var v = r && r.stars, n = Number(v);
  if (v === "" || v === null || v === undefined || typeof v === "boolean" || !isFinite(n) || n < 0 || n > 3 || Math.floor(n) !== n) return -1;
  return n;
}
function recRatio_(r) {
  var s = Number(r && r.score), t = Number(r && r.total);
  if (!r || r.score === "" || r.score === null || r.score === undefined || !isFinite(s) || s < 0) return -1;
  if (r.total !== "" && r.total !== null && r.total !== undefined && isFinite(t) && t > 0) return s > t ? -1 : s / t;
  return s > 1000 ? -1 : s;
}
function betterRecord_(a, b) {
  if (!b) return true;
  var sa = recStars_(a), sb = recStars_(b);
  if (sa !== sb) return sa > sb;
  var ra = recRatio_(a), rb = recRatio_(b);
  if (ra !== rb) return ra > rb;
  return String(a.date || "") > String(b.date || "");
}
// The rows a student push may write are the caller's own (v14: stamped with
// their id); a teacher push gets the id of the one child with that name.
function stampRows_(rows, who) {
  if (who && who.student) return rows.map(function (r) { r.studentId = String(who.student.id); r.studentName = who.student.name; return r; });
  var nameIds = rosterNameIds_();
  return rows.map(function (r) {
    var ids = nameIds[r.studentName] || [], sent = String(r.studentId || "");
    r.studentId = ids.length === 1 ? ids[0] : (sent && ids.indexOf(sent) >= 0 ? sent : "");
    return r;
  });
}
// The merge every result tab shares (v14). A row belongs to a child by its
// studentId; a row saved before v14 has none and belongs to its name. An
// incoming row WITH an id merges into that id's row for the same lesson /
// item -- or into the name-only row of that name when only one child (or
// none) has the name (it then takes the id over) -- else it is added. A row
// WITHOUT an id (a teacher device, for a name two children share) merges
// into the name-only row, and is skipped when one of those children already
// has an id row there (it is only an echo of it). Rows are replaced by a
// better one or added; none is ever removed. decide(incoming, sheetRow)
// says "replace", "changed" (it updated the Sheet's row) or "".
// admitFor (optional): admitFor(sheetRows) -> function (row) saying whether a
// NEW row may be added (rows already there are never touched by it).
function mergeOwned_(sheet, columns, incoming, rest, decide, admitFor) {
  var existing = readRows_(sheet, columns);
  var admit = admitFor ? admitFor(existing) : null;
  var nameIds = rosterNameIds_();
  var byId = {}, byName = {};
  var index = function (r, i) {
    var k = rest(r);
    if (r.studentId) { if (byId[r.studentId + "|" + k] === undefined) byId[r.studentId + "|" + k] = i; }
    else if (byName[r.studentName + "|" + k] === undefined) byName[r.studentName + "|" + k] = i;
  };
  existing.forEach(index);
  var changed = 0;
  (incoming || []).forEach(function (r) {
    if (!r || !r.studentName) return;
    var k = rest(r), ids = nameIds[r.studentName] || [], i, claim = false;
    if (r.studentId) {
      i = byId[r.studentId + "|" + k];
      if (i === undefined && ids.length <= 1) { i = byName[r.studentName + "|" + k]; claim = i !== undefined; }
    } else {
      if (ids.length > 1 && ids.some(function (id) { return byId[id + "|" + k] !== undefined; })) return;
      i = byName[r.studentName + "|" + k];
    }
    if (i === undefined) {
      if (admit && !admit(r)) return;
      existing.push(r); index(r, existing.length - 1); changed++; return;
    }
    var d = decide(r, existing[i]);
    if (d === "replace") {
      existing[i] = r;
      if (claim) { delete byName[r.studentName + "|" + k]; byId[r.studentId + "|" + k] = i; }
      changed++;
    } else if (d === "changed") changed++;
  });
  if (changed) writeRows_(sheet, columns, existing);
  return changed;
}
function mergeRecordRows_(sheet, columns, incoming) {
  return mergeOwned_(sheet, columns, incoming, function (r) { return r.level + "|" + r.lesson; }, function (r, prev) {
    if (betterRecord_(r, prev)) return "replace";
    if (recStars_(r) === recStars_(prev) && recRatio_(r) === recRatio_(prev) && String(r.date || "") === String(prev.date || "")) {
      // Same result, but the row predates a column (e.g. the homework
      // skill breakdown added 3 Oct 2026): fill the blanks in.
      var filled = false;
      columns.forEach(function (col) {
        if (col === "studentId") return;
        if ((prev[col] === "" || prev[col] === undefined) && r[col] !== "" && r[col] !== undefined && r[col] !== null) { prev[col] = r[col]; filled = true; }
      });
      return filled ? "changed" : "";
    }
    return "";
  });
}
function pushRecords_(sheet, columns, tree, who) {
  return withLock_(20000, function () {
    var rows = flattenRecords_(tree, columns).map(function (r) { return cleanRecordRow_(r, columns); }).filter(function (r) { return r; });
    if (who && who.student) rows = rows.slice(0, 300);
    rows = stampRows_(rows, who);
    return { ok: true, rows: rows.length, changed: mergeRecordRows_(sheet, columns, rows) };
  });
}
function pushProgress_(body, who) { return pushRecords_(PROGRESS_SHEET, PROGRESS_COLUMNS, body && body.progress, who); }
function pullProgress_() {
  return { rows: readRows_(PROGRESS_SHEET, PROGRESS_COLUMNS) };
}
function pushHomework_(body, who) { return pushRecords_(HOMEWORK_SHEET, HOMEWORK_COLUMNS, body && body.homework, who); }
function pullHomework_() {
  return { rows: readRows_(HOMEWORK_SHEET, HOMEWORK_COLUMNS) };
}

// ---------- story / level test / word games (StudentExtras) ----------

// body.extras = { studentName: { story: {level: {part: date}},
//   levelTest: {level: {score,total,pct,band,attempts,date}},
//   games: {level: {lesson: {game: {stars,score,total,date}}}} } }
// v14: values are checked on write (cleanExtraRow_), rows carry studentId
// and merge like Progress (mergeOwned_).
var EXTRA_LEVEL_RE_ = RESULT_LEVEL_RE_;
function extraNum_(v) { var n = Number(v); return (v !== "" && v !== null && v !== undefined && isFinite(n)) ? n : ""; }
function flattenExtras_(tree) {
  var rows = [];
  var add = function (name, kind, level, item, r) {
    if (!EXTRA_LEVEL_RE_.test(String(level)) || rows.length >= 3000) return;
    r = r || {};
    rows.push({ studentName: name, kind: kind, level: String(level), item: cleanText_(item, 60),
      stars: extraNum_(r.stars), score: extraNum_(r.score), total: extraNum_(r.total), pct: extraNum_(r.pct),
      band: cleanText_(r.band || "", 20), attempts: extraNum_(r.attempts), date: cleanText_(r.date || "", 30), studentId: "" });
  };
  if (!tree || typeof tree !== "object") return rows;
  Object.keys(tree).forEach(function (name) {
    var t = tree[name] || {};
    if (typeof t !== "object") return;
    Object.keys(t.story || {}).forEach(function (lv) {
      Object.keys(t.story[lv] || {}).forEach(function (part) {
        var v = t.story[lv][part];
        if (v && /^[1-9]$/.test(part)) add(name, "story", lv, part, { score: 1, date: typeof v === "string" ? v : "" });
      });
    });
    Object.keys(t.levelTest || {}).forEach(function (lv) { var r = t.levelTest[lv]; if (r && typeof r === "object") add(name, "levelTest", lv, "", r); });
    Object.keys(t.games || {}).forEach(function (lv) {
      Object.keys(t.games[lv] || {}).forEach(function (n) {
        Object.keys(t.games[lv][n] || {}).forEach(function (g) {
          var r = t.games[lv][n][g];
          if (r && typeof r === "object" && /^\d{1,2}$/.test(n) && /^[a-z0-9-]{1,40}$/.test(g)) add(name, "game", lv, n + ":" + g, r);
        });
      });
    });
  });
  return rows;
}
function testBand_(pct) { return pct >= 90 ? "Distinction" : pct >= 80 ? "Merit" : pct >= 70 ? "Pass" : "Not yet"; }
function cleanExtraRow_(r) {
  var name = String(r.studentName == null ? "" : r.studentName);
  if (!name.trim() || name.length > 120 || !EXTRA_LEVEL_RE_.test(String(r.level || ""))) return null;
  var out = { studentName: name, kind: r.kind, level: String(r.level), item: "", stars: "", score: "", total: "", pct: "", band: "", attempts: "",
    date: cleanDate_(r.date), studentId: r.studentId ? String(r.studentId).slice(0, 80) : "" };
  var score = numIn_(r.score, 0, 1000), total = numIn_(r.total, 0, 1000);
  if (score !== "" && total !== "" && score > total) score = total;
  if (r.kind === "story") {
    if (!/^[1-9]$/.test(String(r.item))) return null;
    out.item = String(r.item); out.score = 1;
  } else if (r.kind === "levelTest") {
    out.score = score; out.total = total;
    var pct = total !== "" && total > 0 && score !== "" ? Math.round(score / total * 100) : numIn_(r.pct, 0, 100);
    if (pct === "") return null;
    out.pct = pct; out.band = testBand_(pct);
    var att = numIn_(r.attempts, 1, 999);
    out.attempts = att === "" ? 1 : Math.round(att);
  } else if (r.kind === "game") {
    var m = /^(\d{1,2}):([a-z0-9-]{1,40})$/.exec(String(r.item || ""));
    if (!m || +m[1] < 1 || +m[1] > LESSONS_PER_LEVEL_) return null;
    out.item = m[0];
    var st = numIn_(r.stars, 0, 3);
    out.stars = st === "" ? "" : Math.round(st); out.score = score; out.total = total;
  } else return null;
  return out;
}
// Which of two rows for the same key is better: level test by percent,
// game by stars then score, story parts are all equal; then the newer date.
// v14: a stored value outside the real range counts as -1 (a real result replaces it).
function extraRank_(r) {
  var n = function (v, hi) { var x = Number(v); return (v !== "" && v !== null && v !== undefined && isFinite(x) && x >= 0 && x <= hi) ? x : -1; };
  if (r.kind === "levelTest") return [n(r.pct, 100), 0];
  if (r.kind === "game") return [n(r.stars, 3), n(r.score, 1000)];
  return [0, 0];
}
// v14: game names are open-ended (a new game needs no new script), so NEW
// rows for a game the site doesn't have yet (not in GAME_IDS_, same list as
// GAME_NAMES in js/app.js) are capped per child: 8 per level + lesson and
// 200 in all. The real games are never capped (11 games x 20 lessons x 11
// levels at most). Rows already in the tab are kept as they are.
var GAME_IDS_ = { "memory-match": 1, "word-pop": 1, "word-builder": 1, "balloon-pop": 1, "lumis-pocket": 1, "treehouse-builder": 1,
  "twelve-months-calendar": 1, "crew-chat": 1, "squad-budget": 1, "story-detective": 1, "crystal-ball": 1 };
var GAME_OTHER_PER_LESSON_ = 8, GAME_OTHER_PER_CHILD_ = 200;
function gameRowAdmit_(rows) {
  var perChild = {}, perLesson = {};
  var keysOf = function (r) {
    if (!r || r.kind !== "game") return null;
    var m = /^(\d{1,2}):(.+)$/.exec(String(r.item || ""));
    if (!m || GAME_IDS_[m[2]]) return null;
    var who = r.studentId ? "i:" + r.studentId : "n:" + normName_(r.studentName);
    return [who, who + "|" + r.level + "|" + Number(m[1])];
  };
  rows.forEach(function (r) {
    var k = keysOf(r);
    if (k) { perChild[k[0]] = (perChild[k[0]] || 0) + 1; perLesson[k[1]] = (perLesson[k[1]] || 0) + 1; }
  });
  return function (r) {
    var k = keysOf(r);
    if (!k) return true;
    if ((perChild[k[0]] || 0) >= GAME_OTHER_PER_CHILD_ || (perLesson[k[1]] || 0) >= GAME_OTHER_PER_LESSON_) return false;
    perChild[k[0]] = (perChild[k[0]] || 0) + 1; perLesson[k[1]] = (perLesson[k[1]] || 0) + 1;
    return true;
  };
}
function mergeExtraRows_(incoming) {
  var rows = (incoming || []).filter(function (r) { return r && r.studentName && /^(story|levelTest|game)$/.test(r.kind); });
  return mergeOwned_(EXTRAS_SHEET, EXTRAS_COLUMNS, rows, function (r) { return [r.kind, r.level, r.item].join("|"); }, function (r, prev) {
    var a = extraRank_(r), b = extraRank_(prev);
    var better = a[0] > b[0] || (a[0] === b[0] && (a[1] > b[1] || (a[1] === b[1] && r.kind !== "story" && String(r.date || "") > String(prev.date || ""))));
    var att = Math.max(Number(r.attempts) || 0, Number(prev.attempts) || 0);
    if (better) { if (r.kind === "levelTest" && att) r.attempts = att; return "replace"; }
    if (r.kind === "levelTest" && att > (Number(prev.attempts) || 0)) { prev.attempts = att; return "changed"; }
    return "";
  }, gameRowAdmit_);
}
function pushExtras_(body, who) {
  return withLock_(20000, function () {
    var rows = flattenExtras_(body && body.extras).map(cleanExtraRow_).filter(function (r) { return r; });
    if (who && who.student) rows = rows.slice(0, 1000);
    rows = stampRows_(rows, who);
    return { ok: true, rows: rows.length, changed: mergeExtraRows_(rows) };
  });
}
function pullExtras_() {
  return { ok: true, rows: readRows_(EXTRAS_SHEET, EXTRAS_COLUMNS) };
}

// ---------- leads ----------

function pullLeads_() {
  return { leads: readRows_(LEADS_SHEET, LEADS_COLUMNS), deletedIds: deletedIdsOfType_(["lead"]) };
}

// Merged by id (newer updatedAt wins), never replaced: a lead a parent
// submitted (addLead_) between a teacher device's pull and push used to
// be erased by that push. Removal only through DeletedIds (v14: leads only).
function pushLeads_(body, who) {
  return withLock_(20000, function () {
    var del = mergeDeletedIds_(body.deletedIds, who || { open: true }, ["lead"]);
    if (Array.isArray(body.leads)) {
      writeRows_(LEADS_SHEET, LEADS_COLUMNS, mergeRowsById_(readRows_(LEADS_SHEET, LEADS_COLUMNS), body.leads, goneSet_(["lead"]),
        function (a, b) { return tms_(b.updatedAt) > tms_(a.updatedAt) ? b : a; }));
    } else if (del.added.length) pruneGone_(LEADS_SHEET, LEADS_COLUMNS, "lead");
    var out = { ok: true };
    if (del.refused.length) out.refused = del.refused;
    return out;
  });
}

// ---------- pro dashboard admins ----------

function pullProAdmins_() {
  return { admins: readRows_(PRO_ADMINS_SHEET, PRO_ADMINS_COLUMNS) };
}

function pushProAdmins_(body) {
  if (Array.isArray(body.admins)) withLock_(20000, function () { writeRows_(PRO_ADMINS_SHEET, PRO_ADMINS_COLUMNS, body.admins); });
  return { ok: true };
}

// ---------- pro test results ----------

function pullProTestResults_() {
  var rows = readRows_(PRO_TEST_RESULTS_SHEET, PRO_TEST_RESULTS_COLUMNS);
  return {
    results: rows.map(function (row) {
      try { return JSON.parse(row.dataJson || "{}"); } catch (e) { return null; }
    }).filter(function (r) { return r; }),
  };
}

// v14: at most 45,000 characters (one Sheet cell holds 50,000), under the lock.
function pushProTestResult_(body) {
  var result = body.result;
  if (!result || typeof result !== "object") return { ok: false, error: "No result provided." };
  if (JSON.stringify(result).length > 45000) return { ok: false, error: "too big" };
  result.name = cleanText_(result.name, 60);
  var id = String(result.student_id) + "_" + String(result.timestamp);
  return withLock_(20000, function () {
    var existing = readRows_(PRO_TEST_RESULTS_SHEET, PRO_TEST_RESULTS_COLUMNS);
    var alreadyThere = existing.some(function (row) { return row.id === id; });
    if (!alreadyThere) {
      existing.push({
        id: id, name: cleanText_(result.name, 60), student_id: String(result.student_id || "").replace(/\D/g, "").slice(0, 16),
        timestamp: cleanText_(result.timestamp || "", 40), dataJson: JSON.stringify(result),
      });
      writeRows_(PRO_TEST_RESULTS_SHEET, PRO_TEST_RESULTS_COLUMNS, existing);
    }
    return { ok: true };
  });
}

function clearProTestResults_() {
  withLock_(20000, function () { writeRows_(PRO_TEST_RESULTS_SHEET, PRO_TEST_RESULTS_COLUMNS, []); });
  return { ok: true };
}

// ---------- Zoom auto-link generation ----------
// Trigger: Triggers (clock icon) -> Add Trigger -> autoGenerateZoomLinks,
// Time-driven, every 10 minutes. Needs the four ZOOM_* Script Properties.
// v14: reads/writes the Schedule by its header names; the meetings are
// created first, then the links are saved under the script lock from a
// fresh read (only into classes still scheduled and still without a link).

function autoGenerateZoomLinks() {
  var props = PropertiesService.getScriptProperties();
  var accountId = props.getProperty("ZOOM_ACCOUNT_ID");
  var clientId = props.getProperty("ZOOM_CLIENT_ID");
  var clientSecret = props.getProperty("ZOOM_CLIENT_SECRET");
  var hostEmail = props.getProperty("ZOOM_HOST_EMAIL");
  if (!accountId || !clientId || !clientSecret || !hostEmail) {
    Logger.log("Zoom auto-link: Script Properties not set up yet — skipping.");
    return;
  }
  resetRequest_();
  var now = new Date();
  var twoHoursOut = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  var accessToken = null, links = {}, made = 0;
  var rows = readRows_(SCHEDULE_SHEET, SCHEDULE_COLUMNS);
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    if (!row.id || row.status !== "scheduled" || row.meetingLink || !row.date || !row.startTime) continue;
    var startDate = new Date(row.date + "T" + row.startTime + ":00+03:00"); // Saudi wall time
    if (isNaN(startDate.getTime()) || startDate < now || startDate > twoHoursOut) continue;
    if (!accessToken) accessToken = getZoomAccessToken_(accountId, clientId, clientSecret);
    if (!accessToken) { Logger.log("Zoom auto-link: couldn't get an access token."); break; }
    var level = row.level || "";
    var lessonNumber = row.lessonNumber || "";
    var topic = "Lumio English Club" + (level ? " – " + level : "") + (lessonNumber ? " – Lesson " + lessonNumber : "");
    var durationMinutes = Number(row.durationMinutes) || 45;
    try {
      var joinUrl = createZoomMeeting_(accessToken, hostEmail, topic, startDate, durationMinutes);
      if (joinUrl) { links[row.id] = joinUrl; made++; }
    } catch (err) {
      Logger.log("Zoom auto-link: failed for class " + row.id + ": " + err);
    }
  }
  if (!made) return;
  var saved = tryLocked_(30000, function () {
    forgetTab_(SCHEDULE_SHEET);
    var fresh = readRows_(SCHEDULE_SHEET, SCHEDULE_COLUMNS), changed = false, stampedAt = new Date().toISOString();
    fresh.forEach(function (r) {
      if (!links[r.id] || r.status !== "scheduled" || r.meetingLink) return;
      // the link gets its own field time, or a teacher device's older
      // copy (meetingLink "") would win the per-field merge
      r.meetingLink = links[r.id];
      touch_(r, ["meetingLink"], stampedAt);
      changed = true;
    });
    if (changed) writeRows_(SCHEDULE_SHEET, SCHEDULE_COLUMNS, fresh);
  });
  if (!saved) Logger.log("Zoom auto-link: a save was running -- " + made + " link(s) not stored this time.");
}

function getZoomAccessToken_(accountId, clientId, clientSecret) {
  var url = "https://zoom.us/oauth/token?grant_type=account_credentials&account_id=" + encodeURIComponent(accountId);
  var basicAuth = Utilities.base64Encode(clientId + ":" + clientSecret);
  var res = UrlFetchApp.fetch(url, { method: "post", headers: { Authorization: "Basic " + basicAuth }, muteHttpExceptions: true });
  var body = JSON.parse(res.getContentText() || "{}");
  return body.access_token || null;
}

function createZoomMeeting_(accessToken, hostEmail, topic, startDate, durationMinutes) {
  var tz = PLATFORM_TZ; // class times on Lumio are Saudi time
  var startIso = Utilities.formatDate(startDate, tz, "yyyy-MM-dd'T'HH:mm:ss");
  var payload = { topic: topic, type: 2, start_time: startIso, duration: durationMinutes, timezone: tz,
    settings: { join_before_host: true, waiting_room: false, approval_type: 2 } };
  var res = UrlFetchApp.fetch("https://api.zoom.us/v2/users/" + encodeURIComponent(hostEmail) + "/meetings", {
    method: "post", contentType: "application/json", headers: { Authorization: "Bearer " + accessToken },
    payload: JSON.stringify(payload), muteHttpExceptions: true,
  });
  var code = res.getResponseCode();
  var body = JSON.parse(res.getContentText() || "{}");
  if (code >= 200 && code < 300 && body.join_url) return body.join_url;
  throw new Error("Zoom API error " + code + ": " + res.getContentText());
}

// ---------- Installment SMS reminders (automatic) ----------
// Trigger: Triggers (clock icon) -> Add Trigger -> sendInstallmentReminders,
// Time-driven, Day timer, 9am-10am. Reads the Roster tab, finds unpaid
// installments due in 3 days or today (or overdue and never texted) and
// sends ONE Arabic SMS per installment per stage to the student's phone.
// Needs Script Properties SMS_PROVIDER=twilio, TWILIO_SID, TWILIO_TOKEN,
// TWILIO_FROM (E.164, e.g. +1415...). Without them it only logs what it
// would send, so it is safe to leave the trigger on.
var INSTALLMENT_REMIND_DAYS = 3;
function fmtMoney_(amount, currency) { var n = Number(amount) || 0; return (n % 1 ? n.toFixed(2) : String(n)) + (currency ? " " + currency : ""); }
function fmtDateAr_(d) { try { return Utilities.formatDate(new Date(d + "T12:00:00+03:00"), PLATFORM_TZ, "d/M/yyyy"); } catch (e) { return d; } }
function installmentSms_(name, inst, daysLeft) {
  var amt = fmtMoney_(inst.amount, inst.currency);
  var when = daysLeft > 0 ? ("بعد " + (daysLeft === 1 ? "يوم" : daysLeft === 2 ? "يومين" : daysLeft + " أيام") + " (" + fmtDateAr_(inst.dueDate) + ")")
           : daysLeft === 0 ? ("اليوم (" + fmtDateAr_(inst.dueDate) + ")") : ("كان في " + fmtDateAr_(inst.dueDate));
  return "تذكير من Lumio English: قسط اشتراك " + name + " بقيمة " + amt + " مستحق " + when + ". شكراً لكم";
}
function sendSms_(to, text) {
  var props = PropertiesService.getScriptProperties();
  var provider = props.getProperty("SMS_PROVIDER") || "";
  var digits = String(to || "").replace(/\D/g, "");
  if (!digits) return { ok: false, error: "no phone" };
  var e164 = "+" + digits;
  if (provider === "twilio") {
    var sid = props.getProperty("TWILIO_SID"), token = props.getProperty("TWILIO_TOKEN"), from = props.getProperty("TWILIO_FROM");
    if (!sid || !token || !from) return { ok: false, error: "twilio properties missing" };
    var res = UrlFetchApp.fetch("https://api.twilio.com/2010-04-01/Accounts/" + sid + "/Messages.json", {
      method: "post", payload: { To: e164, From: from, Body: text },
      headers: { Authorization: "Basic " + Utilities.base64Encode(sid + ":" + token) }, muteHttpExceptions: true,
    });
    var code = res.getResponseCode();
    return code >= 200 && code < 300 ? { ok: true } : { ok: false, error: "twilio " + code + ": " + res.getContentText().slice(0, 200) };
  }
  Logger.log("SMS (no provider configured) -> " + e164 + ": " + text);
  return { ok: false, error: "no provider", dryRun: true };
}
function sendInstallmentReminders() {
  // Same lock as every roster write, so a teacher's push landing mid-run
  // isn't overwritten by this job's write-back.
  READ_MEMO_ = {};
  return withLock_(30000, sendInstallmentRemindersLocked_);
}
function sendInstallmentRemindersLocked_() {
  var rows = readRows_(ROSTER_SHEET, ROSTER_COLUMNS);
  var today = Utilities.formatDate(new Date(), PLATFORM_TZ, "yyyy-MM-dd");
  var t0 = Date.UTC(+today.slice(0, 4), +today.slice(5, 7) - 1, +today.slice(8, 10));
  var changed = false, sentCount = 0;
  rows.forEach(function (r) {
    var list; try { list = JSON.parse(r.installments || "[]"); } catch (e) { list = []; }
    if (!Array.isArray(list) || !list.length) return;
    if (String(r.subscribed).toLowerCase() === "false" || String(r.pendingDeletion).toLowerCase() === "true") return;
    var touched = false;
    list.forEach(function (i) {
      if (!i || i.paidAt || !i.dueDate) return;
      var d = Date.UTC(+i.dueDate.slice(0, 4), +i.dueDate.slice(5, 7) - 1, +i.dueDate.slice(8, 10));
      var daysLeft = Math.round((d - t0) / 86400000);
      var stage = daysLeft > 0 && daysLeft <= INSTALLMENT_REMIND_DAYS ? "upcoming" : daysLeft <= 0 ? "due" : "";
      if (!stage) return;
      var key = stage === "upcoming" ? "smsUpcomingAt" : "smsDueAt";
      if (i[key] && (!i.smsForDue || i.smsForDue === i.dueDate)) return; // already texted for this stage of this due date
      var res = sendSms_(r.phone, installmentSms_(r.name, i, daysLeft));
      if (res.ok) {
        if (i.smsForDue && i.smsForDue !== i.dueDate) { i.smsUpcomingAt = null; i.smsDueAt = null; }
        i[key] = new Date().toISOString(); i.smsAt = i[key]; i.smsForDue = i.dueDate; touched = true; sentCount++;
      }
      else Logger.log("Installment SMS not sent for " + r.name + ": " + res.error);
    });
    if (touched) { r.installments = JSON.stringify(list); touch_(r, ["installments"], new Date().toISOString()); changed = true; }
  });
  if (changed) writeRows_(ROSTER_SHEET, ROSTER_COLUMNS, rows);
  Logger.log("Installment reminders: " + sentCount + " SMS sent.");
  return sentCount;
}

// ---------- AI writing feedback ----------

function testGroqAuth() {
  // Run this once from the editor (not via a web request) to trigger the
  // permission popup for calling an external domain (the Groq API).
  var result = writingFeedback_({ prompt: "test", answer: "This is a test answer to trigger the authorization prompt.", minWords: 5 });
  Logger.log(result);
}

// v14: only for a signed-in teacher or student (see doPost), and Groq's own
// error text goes to the execution log, not to the page.
function writingFeedback_(body) {
  var apiKey = PropertiesService.getScriptProperties().getProperty("GROQ_API_KEY");
  if (!apiKey) return { ok: false, error: "No Groq API key set up yet. Project Settings -> Script Properties -> add GROQ_API_KEY." };
  var prompt = String(body.prompt || "").slice(0, 500);
  var answer = String(body.answer || "").slice(0, 1000);
  var minWords = Number(body.minWords) || 0;
  if (!answer.trim()) return { ok: false, error: "No answer to review yet." };
  var systemPrompt = "You are an English teacher giving feedback on a young English-language learner's short writing answer. The student is a child learning English as a second language. Your feedback MUST directly reference their actual writing, not generic advice. Structure your reply as exactly this: (1) One short genuinely positive sentence about their effort or something they got right. (2) Point out 1-3 SPECIFIC errors by quoting the exact word or phrase they wrote and giving the correct version, in the form: you wrote \"X\", try \"Y\" instead. Cover grammar, spelling, or word choice, only for mistakes actually present in their answer. (3) One short encouraging closing sentence. If their answer has no real, readable English words or sentences at all (for example random keyboard mashing), skip step 2 and instead gently tell them to write real English words and sentences about the topic, with one simple example sentence they could use to start. Keep language simple enough for a child, warm, never harsh. Do not use markdown formatting.";
  var userPrompt = "Writing prompt: " + prompt + "\n" + (minWords ? "Expected length: at least " + minWords + " words.\n" : "") + "Student's actual answer (quote from this directly): " + answer;
  var payload = { model: "openai/gpt-oss-120b", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
    temperature: 0.5, max_completion_tokens: 300, reasoning_effort: "low", include_reasoning: false };
  try {
    var res = UrlFetchApp.fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "post", contentType: "application/json", headers: { "Authorization": "Bearer " + apiKey },
      payload: JSON.stringify(payload), muteHttpExceptions: true
    });
    var code = res.getResponseCode();
    if (code !== 200) {
      console.error("Groq answered " + code + ": " + String(res.getContentText() || "").slice(0, 500));
      return { ok: false, error: "AI feedback isn't available right now (code " + code + ")." };
    }
    var data = JSON.parse(res.getContentText());
    var msg = data.choices && data.choices[0] && data.choices[0].message;
    var feedback = (msg && msg.content) || (msg && msg.reasoning) || "";
    if (!feedback) return { ok: false, error: "AI feedback isn't available right now (empty answer)." };
    return { ok: true, feedback: feedback.trim() };
  } catch (err) {
    console.error("Request to Groq failed: " + String(err));
    return { ok: false, error: "AI feedback isn't available right now." };
  }
}
// 30 a caller and 300 for the whole site per 10 minutes (each call spends the owner's Groq quota).
function aiFeedback_(body, who) {
  if (!who || (who.role !== "teacher" && who.role !== "student")) return { ok: false, error: "unauthorized" };
  var caller = who.teacher ? "t" + who.teacher.id : who.student ? "s" + who.student.id : "open";
  if (!throttleOk_("ai_" + caller, 30, 600) || !throttleOk_("ai_site", 300, 600)) return BUSY_;
  return writingFeedback_(body || {});
}

// ---------- who is calling (2 Oct 2026) ----------
// The ?key= on every request is public (it ships in the site's JS), so it
// only keeps casual bots out. What a caller may READ or WRITE is decided
// here, from the credentials the page sends with every request:
//   &tid=<teacher id>&th=<teacher pinHash>  -> "teacher": everything
//   &sid=<student id>&sh=<student pinHash>  -> "student": only their own
//                                              row, classes and progress
//   nothing                                 -> "public": the teacher list
//                                              (names + avatars) and the
//                                              narrow placement-test actions
// A brand-new install (no teacher has a PIN yet) lets every caller count as
// a teacher, so setting up can never lock the owner out. v14: only ONCE --
// the first time a teacher with a PIN is seen, Script Property
// LUMIO_SETUP_DONE = 1 is set, and from then on an empty Teachers tab means
// nobody is a teacher (it used to open the whole backend to anyone).
// Editor helper allowFirstOwnerSetup() allows the first-run setup again.
// Emergency switch: Script Property LUMIO_AUTH_OFF = 1 turns the checks
// off (old behaviour) without redeploying.
// Repeated wrong PINs for one id are refused for 15 minutes (CacheService),
// so the 10,000 possible PINs cannot be tried one after another.
// v14 device tokens: a device that signed in gets a token (&tk=) bound to
// its id + PIN hash (see tokenFor_). With the right PIN and its token a
// device is never locked out, so a stranger's wrong guesses (teacher ids
// are public) can no longer lock the owner or a child out. Without a token
// the old rule stands: 10 wrong tries, then 15 minutes locked even for the
// right PIN. Recovery during an attack: LUMIO_LOCK_EXEMPT or clearLockouts().
var FAIL_LIMIT = 10, FAIL_WINDOW_S = 15 * 60;
function failKey_(kind, id) { return "fail_" + kind + "_" + String(id || "").slice(0, 80); }
function isLocked_(kind, id) {
  var n = Number(CacheService.getScriptCache().get(failKey_(kind, id)) || 0);
  return n >= FAIL_LIMIT;
}
function noteFail_(kind, id) {
  var c = CacheService.getScriptCache(), k = failKey_(kind, id);
  c.put(k, String(Number(c.get(k) || 0) + 1), FAIL_WINDOW_S);
}
function clearFails_(kind, id) { CacheService.getScriptCache().remove(failKey_(kind, id)); }
function failCount_(kind, id) {
  try { return Number(CacheService.getScriptCache().get(failKey_(kind, id)) || 0); } catch (e) { return 0; }
}

// Script Properties, read once per request (v14).
var PROPS_ = null, PROPS_AT_ = 0;
function props_() {
  if (!PROPS_ || Date.now() - PROPS_AT_ > 5000) {
    try { PROPS_ = PropertiesService.getScriptProperties().getProperties() || {}; } catch (e) { PROPS_ = {}; }
    PROPS_AT_ = Date.now();
  }
  return PROPS_;
}
function setProp_(k, v) {
  PropertiesService.getScriptProperties().setProperty(k, v);
  if (PROPS_) PROPS_[k] = v;
}
function authOff_() { return String(props_().LUMIO_AUTH_OFF || "") === "1"; }
function setupDone_() { return String(props_().LUMIO_SETUP_DONE || "") === "1"; }
function markSetupDone_() { if (!setupDone_()) setProp_("LUMIO_SETUP_DONE", "1"); }
function lockExempt_(id) {
  var list = String(props_().LUMIO_LOCK_EXEMPT || "").split(",").map(function (x) { return x.trim(); }).filter(function (x) { return x; });
  return list.indexOf(String(id)) >= 0;
}
// Device tokens: HMAC-SHA256 of kind|id|pinHash with a secret only the script knows (Script Property
// LUMIO_TOKEN_SECRET, created on first use). A new PIN means a new token.
function tokenSecret_() {
  var s = props_().LUMIO_TOKEN_SECRET;
  if (s) return s;
  return withLock_(10000, function () {
    var sp = PropertiesService.getScriptProperties(), have = sp.getProperty("LUMIO_TOKEN_SECRET");
    if (!have) { have = Utilities.getUuid() + Utilities.getUuid(); sp.setProperty("LUMIO_TOKEN_SECRET", have); }
    if (PROPS_) PROPS_.LUMIO_TOKEN_SECRET = have;
    return have;
  });
}
function tokenFor_(kind, id, hash) {
  var sig = Utilities.computeHmacSha256Signature(kind + "|" + id + "|" + hash, tokenSecret_());
  return Utilities.base64EncodeWebSafe(sig).replace(/=+$/, "").slice(0, 32);
}
function tokenOk_(kind, id, hash, tk) {
  if (!tk || !hash || !props_().LUMIO_TOKEN_SECRET) return false;
  return String(tk) === tokenFor_(kind, id, hash);
}

// Returns { role: "teacher"|"student"|"public", teacher?, student?, error? }
function whoIs_(e) {
  var p = (e && e.parameter) || {};
  if (authOff_()) return { role: "teacher", open: true };
  var teachers = readRows_(TEACHERS_SHEET, TEACHERS_COLUMNS);
  var anyTeacherPin = teachers.some(function (t) { return t.pinHash; });
  if (anyTeacherPin) markSetupDone_();
  else if (!setupDone_()) return { role: "teacher", open: true };
  if (p.tid) {
    var t = teachers.filter(function (x) { return x.id === p.tid; })[0];
    var tRight = !!(t && t.pinHash && p.th && t.pinHash === p.th);
    if (tRight && tokenOk_("t", t.id, t.pinHash, p.tk)) return { role: "teacher", teacher: t };
    if (isLocked_("t", p.tid) && !lockExempt_(p.tid)) return { role: "public", error: "locked" };
    if (tRight) return { role: "teacher", teacher: t };
    noteFail_("t", p.tid);
    return { role: "public", error: "unauthorized" };
  }
  if (p.sid) {
    var rows = readRows_(ROSTER_SHEET, ROSTER_COLUMNS);
    var s = rows.filter(function (x) { return x.id === p.sid; })[0];
    var sRight = !!(s && s.pinHash && p.sh && s.pinHash === p.sh);
    if (!(sRight && tokenOk_("s", s.id, s.pinHash, p.tk)) && isLocked_("s", p.sid) && !lockExempt_(p.sid)) return { role: "public", error: "locked" };
    if (sRight) {
      // v14: a deleted account stays cut off even while its Roster row is still there (a row an
      // older build or a hand edit left behind); nothing is rewritten here
      if (goneSet_(["student"])[s.id]) return { role: "public", error: "deleted" };
      // v14: an account the teacher hasn't approved yet (self-registered on the placement test) can't use anything
      if (flagOff_(s.approved)) return { role: "public", error: "pending_approval" };
      return { role: "student", student: s, roster: rows };
    }
    if (!s && deletedIdsOfType_(["student"]).some(function (d) { return d.id === p.sid; })) return { role: "public", error: "deleted" };
    noteFail_("s", p.sid);
    return { role: "public", error: "unauthorized" };
  }
  return { role: "public" };
}

// What a student device may hold about itself: no PIN hash, no teacher
// CRM notes. Other students are never sent to a student device.
function selfView_(row) {
  var out = {};
  Object.keys(row).forEach(function (k) { if (k !== "pinHash" && k !== "notes" && k !== "pin") out[k] = row[k]; });
  return out;
}
function publicTeachers_() {
  return readRows_(TEACHERS_SHEET, TEACHERS_COLUMNS).map(function (t) {
    return { id: t.id, name: t.name, avatar: t.avatar, isOwner: t.isOwner, updatedAt: t.updatedAt, photoDataUrl: t.photoDataUrl || "" };
  });
}
// Plain text only for anything typed on a public page: no tags, capped.
// v14: no leading = + - @ either (or spaces/tabs before them), so a CSV or
// Excel export of the Sheet can't turn a typed value into a formula.
function cleanText_(v, max) {
  return String(v == null ? "" : v).replace(/[<>]/g, "").replace(/^[\s=+\-@]+/, "").slice(0, max || 200);
}

// ---- logins (public actions; answer only yes/no + the caller's own row) ----
// v14: the right PIN + this device's token (body.tk / body.tks) always gets
// in. Otherwise the lock-outs apply: per account (10 wrong tries in 15
// minutes) and, for students, per identifier too, however it is typed
// (phone in any format, name in any case, login code); and above
// LOGIN_FAIL_CEILING_ wrong logins in 10 minutes site-wide, further WRONG
// logins answer "busy" (still counted for their account / identifier).
// Right logins are never counted, so one stranger sending junk can't block
// anyone: above the ceiling a right PIN still gets in -- with its device
// token always, without one only while the account (and the identifier
// typed) has had fewer than BUSY_FREE_FAILS_ wrong tries lately. After
// that the right PIN answers "busy" too, so above the ceiling a guesser
// learns nothing from "busy" (at most 3 guesses an account, not 10).
// Student counters: "si" per typed identifier, "sl" per account (only for
// a login code or phone that fits ONE account: a family phone shared by
// siblings counts per identifier only, and a classmate typing a child's
// NAME can't lock that child's own code login). A phone typed with other
// characters around it ("x966...", "966...#") is still that phone: the
// same "p" key and the same "sl" counter. Login failures never feed whoIs_'s "s"
// counter: a sibling's typos, a stranger typing a child's name or an old
// device still sending a changed PIN can't stop a signed-in child's sync.
var LOGIN_FAIL_CEILING_ = { studentLogin: 1000, teacherLogin: 300 }, LOGIN_FAIL_WINDOW_S_ = 600, BUSY_FREE_FAILS_ = 3;
var BUSY_ = { ok: false, error: "busy", message: "Too many requests right now. Please wait a few minutes and try again." };
function siteFailKey_(action, slot) { return "rlf_" + action + "_" + slot; }
function siteFailSlot_() { return Math.floor(Date.now() / 1000 / LOGIN_FAIL_WINDOW_S_); }
function siteFailsOver_(action) {
  try { return Number(CacheService.getScriptCache().get(siteFailKey_(action, siteFailSlot_())) || 0) >= LOGIN_FAIL_CEILING_[action]; } catch (e) { return false; }
}
function noteSiteFail_(action) {
  try {
    var c = CacheService.getScriptCache(), k = siteFailKey_(action, siteFailSlot_());
    c.put(k, String(Number(c.get(k) || 0) + 1), LOGIN_FAIL_WINDOW_S_ + 60);
  } catch (e) {}
}
function teacherLogin_(body) {
  var id = String(body.id || ""), hash = String(body.pinHash || "");
  if (!id || !hash) return { ok: false, error: "missing" };
  var teachers = readRows_(TEACHERS_SHEET, TEACHERS_COLUMNS);
  if (teachers.some(function (x) { return x.pinHash; })) markSetupDone_();
  else if (!setupDone_()) return firstOwnerLogin_(body);
  var t = teachers.filter(function (x) { return x.id === id; })[0];
  var right = !!(t && t.pinHash && t.pinHash === hash);
  if (!(right && tokenOk_("t", id, hash, body.tk)) && isLocked_("t", id) && !lockExempt_(id)) return { ok: false, error: "locked" };
  if (!right) {
    noteFail_("t", id);
    if (siteFailsOver_("teacherLogin")) return BUSY_;
    noteSiteFail_("teacherLogin");
    return { ok: false, error: "no_match" };
  }
  // above the ceiling a right PIN with no token answers "busy" once this id has had a few wrong tries
  if (!tokenOk_("t", id, hash, body.tk) && !lockExempt_(id) && failCount_("t", id) >= BUSY_FREE_FAILS_ && siteFailsOver_("teacherLogin")) return BUSY_;
  clearFails_("t", id);
  return { ok: true, teacher: t, token: tokenFor_("t", t.id, t.pinHash) };
}
// A brand-new install (v14): no teacher has a PIN and the first setup hasn't
// happened. The portal's local "Teacher Lumi" (or whoever signs in first)
// becomes the main owner with the PIN they just used.
function firstOwnerLogin_(body) {
  var id = String(body.id || ""), hash = String(body.pinHash || "");
  if (!/^[\w-]{1,64}$/.test(id) || !/^[0-9a-f]{64}$|^fnv1a-/.test(hash)) return { ok: false, error: "no_match" };
  return withLock_(20000, function () {
    forgetTab_(TEACHERS_SHEET);
    PROPS_ = null;
    var teachers = readRows_(TEACHERS_SHEET, TEACHERS_COLUMNS);
    if (teachers.some(function (x) { return x.pinHash; }) || setupDone_()) {
      // someone finished the setup a moment ago: the normal check
      var t0 = teachers.filter(function (x) { return x.id === id; })[0];
      if (!t0 || t0.pinHash !== hash) { noteFail_("t", id); return { ok: false, error: "no_match" }; }
      return { ok: true, teacher: t0, token: tokenFor_("t", t0.id, t0.pinHash) };
    }
    var now = new Date().toISOString(), name = cleanText_(body.name, 60).trim() || "Teacher Lumi";
    var t = teachers.filter(function (x) { return x.id === id; })[0];
    if (t) { t.pinHash = hash; t.isOwner = true; if (!t.name) t.name = name; t.updatedAt = now; }
    else {
      t = { id: id, name: name, avatar: "", pinHash: hash, isOwner: true, createdAt: now, updatedAt: now, photoDataUrl: "", meetingLink: "" };
      teachers.push(t);
    }
    writeRows_(TEACHERS_SHEET, TEACHERS_COLUMNS, teachers);
    markSetupDone_();
    return { ok: true, teacher: t, token: tokenFor_("t", t.id, t.pinHash), firstSetup: true };
  });
}
// The fail counter a typed identifier shares with every other way of typing it.
// v14 (review): 8 or more digits anywhere in it = a phone number, whatever
// else is typed around them -- studentLogin_ finds accounts by those digits,
// so letters or symbols added to a phone must not give fresh tries.
function loginIdentKey_(ident) {
  var s = String(ident == null ? "" : ident).trim(), digits = s.replace(/\D/g, "");
  if (digits.length >= 8) return "p" + digits.slice(-9);
  if (/^\d+$/.test(s)) return "c" + s;
  return "n" + normFull_(s).slice(0, 70);
}
function studentLogin_(body) {
  var ident = String(body.identifier || "").trim(), hash = String(body.pinHash || "");
  if (!ident || !hash) return { ok: false, error: "missing" };
  var digits = ident.replace(/\D/g, ""), key = loginIdentKey_(ident), nIdent = normFull_(ident);
  var rows = readRows_(ROSTER_SHEET, ROSTER_COLUMNS);
  var gone = goneSet_(["student"]);
  var phoneTail = function (ph) { var d = String(ph || "").replace(/\D/g, ""); return d.length >= 8 ? d.slice(-9) : d; };
  // found by its login code or phone digits (not only by name): then the account's own "sl" counter counts
  var byNumber = function (r) { return String(r.loginCode || "") === ident || (digits.length >= 8 && !!r.phone && phoneTail(r.phone) === phoneTail(digits)); };
  var cands = rows.filter(function (r) {
    if (!r.id || gone[r.id]) return false;
    if (byNumber(r)) return true;
    return nIdent !== "" && normFull_(r.name) === nIdent;
  });
  var s = cands.filter(function (r) { return r.pinHash && r.pinHash === hash; })[0] || null;
  var tks = (Array.isArray(body.tks) ? body.tks : body.tk ? [body.tk] : []).slice(0, 5).map(String);
  var tokenIn = !!(s && tks.length && props_().LUMIO_TOKEN_SECRET && tks.indexOf(tokenFor_("s", s.id, s.pinHash)) >= 0);
  if (!tokenIn) {
    // with the right PIN only that account's own counter counts; a wrong PIN answers "locked"
    // when any account it could be is locked (the same answer either way, so nothing leaks)
    var exempt = s ? lockExempt_(s.id) : cands.some(function (c) { return lockExempt_(c.id); });
    var acctLocked = s ? isLocked_("sl", s.id) : cands.some(function (c) { return isLocked_("sl", c.id); });
    if (!exempt && (isLocked_("si", key) || acctLocked)) return { ok: false, error: "locked" };
  }
  if (!s) {
    noteFail_("si", key);
    if (cands.length === 1 && byNumber(cands[0])) noteFail_("sl", cands[0].id);
    if (siteFailsOver_("studentLogin")) return BUSY_;
    noteSiteFail_("studentLogin");
    return { ok: false, error: "no_match" };
  }
  // above the ceiling a right PIN with no token answers "busy" once the account or identifier has a few wrong tries
  if (!tokenIn && !lockExempt_(s.id) && Math.max(failCount_("si", key), failCount_("sl", s.id)) >= BUSY_FREE_FAILS_ && siteFailsOver_("studentLogin")) return BUSY_;
  clearFails_("si", key); clearFails_("sl", s.id); clearFails_("s", s.id);
  if (flagOff_(s.approved)) return { ok: false, error: "pending_approval" };
  return { ok: true, student: selfView_(s), teachers: publicTeachers_(), rewardCatalog: readRows_(REWARD_CATALOG_SHEET, REWARD_CATALOG_COLUMNS),
    token: tokenFor_("s", s.id, s.pinHash) };
}

// ---- placement test (public): exists?, register, fill in level/age, lead ----
function findByPhone_(rows, phone) {
  var d = String(phone || "").replace(/\D/g, "");
  if (d.length < 6) return null;
  var tail = d.slice(-9);
  var gone = {};
  deletedIdsOfType_(["student"]).forEach(function (x) { gone[x.id] = true; });
  return rows.filter(function (r) { return !gone[r.id] && String(r.phone || "").replace(/\D/g, "").slice(-9) === tail; })[0] || null;
}
function checkPhone_(body) {
  var s = findByPhone_(readRows_(ROSTER_SHEET, ROSTER_COLUMNS), body.phone);
  return { ok: true, exists: !!s, subscribed: !!(s && !flagOff_(s.subscribed)) };
}
// v14: a name another child already has (ignoring case and spaces) is saved
// as "Name (2)", "Name (3)"..., so a stranger can't take over a child's
// records by registering with their name. The answer gives the saved name.
function registerStudent_(body) {
  var name = cleanText_(body.name, 60).trim().replace(/\s+/g, " "), phone = String(body.phone || "").replace(/\D/g, "").slice(0, 16), hash = String(body.pinHash || "");
  if (!name || phone.length < 6 || !/^[0-9a-f]{64}$|^fnv1a-/.test(hash)) return { ok: false, error: "missing" };
  return withLock_(20000, function () {
    var rows = readRows_(ROSTER_SHEET, ROSTER_COLUMNS);
    var existing = findByPhone_(rows, phone);
    if (existing) return { ok: false, error: "exists", subscribed: !flagOff_(existing.subscribed) };
    // v14 (review): a deleted child's name is taken too (its Roster row, or the seats and records still
    // carrying its id), so a new sign-up can't pick up that child's classes and results through the name
    // fallback (seatIsMe_ / ownRows_). A teacher re-adding a returning child still uses the exact name.
    var taken = deadStudentNames_();
    rows.forEach(function (r) { if (r && r.id) taken[normFull_(r.name)] = true; });
    var finalName = name, k = 2;
    while (taken[normFull_(finalName)]) finalName = name.slice(0, 54) + " (" + (k++) + ")";
    var code;
    do { code = String(Math.floor(100000 + Math.random() * 900000)); }
    while (rows.some(function (r) { return String(r.loginCode) === code; }));
    var now = new Date().toISOString();
    var avatars = ["🦊", "🐼", "🐯", "🐸", "🦁", "🐨", "🐵", "🐰"];
    var row = {
      id: "s_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      name: finalName, level: "", avatar: avatars[Math.floor(Math.random() * avatars.length)],
      pinHash: hash, loginCode: code, teacherId: "", createdAt: now, updatedAt: now, phone: phone,
      age: body.age ? cleanText_(body.age, 3) : "", paid: false, approved: false, subscribed: false,
      amountPaid: 0, currency: "", levelsPurchased: 0, rewardPoints: 0, bonusHours: 0, sessionsRemaining: 0,
      pointsLog: "[]", redemptions: "[]", notes: "[]", messages: "[]", referrals: "[]", tags: "placement-test",
    };
    rows.push(row);
    writeRows_(ROSTER_SHEET, ROSTER_COLUMNS, rows);
    var out = { ok: true, student: { id: row.id, name: row.name, loginCode: code } };
    if (finalName !== name) out.renamed = true;
    return out;
  });
}
// The names (normFull_) on seats and records whose studentId is a deleted student.
function deadStudentNames_() {
  var out = {};
  try {
    var gone = goneSet_(["student"]);
    if (!Object.keys(gone).length) return out;
    var add = function (id, name) { if (id && gone[String(id)] && name) out[normFull_(name)] = true; };
    [[SCHEDULE_SHEET, SCHEDULE_COLUMNS], [PATTERNS_SHEET, PATTERNS_COLUMNS]].forEach(function (t) {
      readRows_(t[0], t[1]).forEach(function (c) { parseArr_(c && c.studentsJson).forEach(function (x) { if (x) add(x.studentId, x.studentName); }); });
    });
    [[PROGRESS_SHEET, PROGRESS_COLUMNS], [HOMEWORK_SHEET, HOMEWORK_COLUMNS], [EXTRAS_SHEET, EXTRAS_COLUMNS]].forEach(function (t) {
      readRows_(t[0], t[1]).forEach(function (r) { if (r) add(r.studentId, r.studentName); });
    });
  } catch (e) {}
  return out;
}
// Only a self-registered account that the teacher has NOT approved yet can
// be touched from the public test, and only its level and age. v14: the
// page proves it is the one that registered (the PIN hash it registered
// with); a page from before v14 sends no hash, which is still accepted
// for 3 hours after registering, while the account has no level yet.
function placementUpdate_(body) {
  return withLock_(20000, function () {
    var rows = readRows_(ROSTER_SHEET, ROSTER_COLUMNS);
    var s = findByPhone_(rows, body.phone);
    if (!s || !flagOff_(s.approved)) return { ok: false, error: "not_allowed" };
    var hash = String(body.pinHash || "");
    if (hash) { if (hash !== s.pinHash) return { ok: false, error: "not_allowed" }; }
    else {
      var made = tms_(s.createdAt), age = Date.now() - made;
      if (!made || age > 3 * 3600000 || age < -600000 || s.level) return { ok: false, error: "not_allowed" };
    }
    var lv = String(body.level || "");
    if (lv && RESULT_LEVEL_RE_.test(lv)) s.level = lv;
    if (body.age !== undefined && body.age !== "" && isFinite(Number(body.age))) s.age = Math.max(0, Math.min(99, Number(body.age)));
    touch_(s, ["level", "age"], new Date().toISOString());
    writeRows_(ROSTER_SHEET, ROSTER_COLUMNS, rows);
    return { ok: true };
  });
}
function addLead_(body) {
  var l = body && body.lead;
  if (!l || typeof l !== "object") return { ok: false, error: "missing" };
  return withLock_(20000, function () {
    var rows = readRows_(LEADS_SHEET, LEADS_COLUMNS);
    var id = cleanText_(l.id, 60) || ("lead_" + Date.now().toString(36));
    if (rows.some(function (r) { return r.id === id; })) return { ok: true, duplicate: true };
    var now = new Date().toISOString();
    rows.push({
      id: id, name: cleanText_(l.name, 60), phone: String(l.phone || "").replace(/\D/g, "").slice(0, 16),
      age: isFinite(Number(l.age)) && l.age !== null && l.age !== "" ? Math.max(0, Math.min(99, Number(l.age))) : "",
      suggestedLevel: RESULT_LEVEL_RE_.test(String(l.suggestedLevel || "")) ? l.suggestedLevel : "",
      testScore: l.testScore !== "" && l.testScore !== null && isFinite(Number(l.testScore)) ? Number(l.testScore) : "",
      testTotal: l.testTotal !== "" && l.testTotal !== null && isFinite(Number(l.testTotal)) ? Number(l.testTotal) : "",
      status: "new", notes: cleanText_(l.notes, 500), createdAt: now, updatedAt: now,
    });
    writeRows_(LEADS_SHEET, LEADS_COLUMNS, rows);
    return { ok: true };
  });
}

// ---- student-scoped views of the shared tabs ----
function studentRoster_(who) {
  var me = who.student;
  return { ok: true, students: [selfView_(me)], teachers: publicTeachers_(),
    rewardCatalog: readRows_(REWARD_CATALOG_SHEET, REWARD_CATALOG_COLUMNS), deletedIds: [],
    authToken: tokenFor_("s", me.id, me.pinHash) };
}
function inClass_(c, me) {
  return (c.students || []).some(function (x) { return seatIsMe_(x, me); });
}
// A student sees their own classes in full (classmates by name only) and,
// for booking, every other class as anonymous seats: level, lesson, slot,
// teacher and how many seats are taken -- never another child's name,
// attendance, grade, notes or the meeting link. Ratings stay (as bare
// stars) because the booking screen shows each teacher's average.
// v14: seats match by id (see seatIsMe_), and a classmate's studentId is
// no longer sent (it was enough to lock that child out).
function seatFor_(x, me) {
  if (!x) return x;
  return seatIsMe_(x, me) ? x : { studentName: "", studentId: null, teacherRatingStars: x.teacherRatingStars || null };
}
function studentClassView_(c, me) {
  var copy = {};
  Object.keys(c).forEach(function (k) { copy[k] = c[k]; });
  delete copy.fieldTimes;   // its seat tombstones name other children; student devices don't merge
  if (inClass_(c, me)) {
    copy.students = (c.students || []).map(function (x) {
      if (!x) return x;
      return seatIsMe_(x, me) ? x : { studentName: x.studentName };
    });
  } else {
    copy.students = (c.students || []).map(function (x) { return seatFor_(x, me); });
    copy.meetingLink = ""; copy.notes = ""; copy.sessionNotes = "";
  }
  return copy;
}
function studentSchedule_(who) {
  var me = meRef_(who.student, who.roster);
  var full = pullScheduleV2_();
  return { ok: true,
    classes: full.classes.map(function (c) { return studentClassView_(c, me); }),
    // Open teacher slots (no students) are what a student books into;
    // an old-style group pattern is shown only to its own students.
    patterns: full.patterns.filter(function (p) { return !(p.students || []).length || inClass_(p, me); }).map(function (p) {
      var copy = studentClassView_(p, me);
      if (!inClass_(p, me)) copy.meetingLink = "";
      return copy;
    }),
    blockedDates: full.blockedDates, deletedIds: full.deletedIds };
}
// v14: a row with a studentId is that account's; a row from before v14 (no id), or one whose id
// is no longer a live account (see seatIsMe_), is the name's.
function ownRows_(rows, me) {
  return rows.filter(function (r) {
    return r.studentId && (!me.live || me.live[String(r.studentId)]) ? String(r.studentId) === String(me.id) : r.studentName === me.name;
  });
}
function ownTree_(tree, me) { var out = {}; if (tree && typeof tree === "object" && tree[me.name]) out[me.name] = tree[me.name]; return out; }

// ---------- HTTP entry points ----------

// ---------- access key ----------
// Script Property LUMIO_API_KEY (Project Settings -> Script Properties)
// must match the ?key= every Lumio page sends (LUMIO_API_KEY constant in
// js/lumio-profiles.js and friends). While the property is NOT set the
// check is skipped, so deploying this version can never lock the site
// out; set the property right after deploying to turn the lock on.
// Public actions (no sign-in), v14: a limit per phone number / student id
// first ([max, per seconds]), then a ceiling for the whole site. The two
// logins have their own rules (wrong tries only, see studentLogin_) and AI
// feedback needs a sign-in (aiFeedback_).
var PUBLIC_LIMITS_ = {
  checkPhone: { key: [20, 600], site: [300, 600] },
  registerStudent: { key: [5, 600], site: [60, 600] },
  placementUpdate: { key: [20, 600], site: [120, 600] },
  addLead: { key: [10, 600], site: [120, 600] },
  pushProTestResult: { key: [10, 600], site: [120, 600] }
};
function publicKeyOf_(action, body) {
  body = body || {};
  var d = function (v) { return String(v == null ? "" : v).replace(/\D/g, "").slice(-9); };
  if (action === "addLead") return d(body.lead && body.lead.phone);
  if (action === "pushProTestResult") return d(body.result && body.result.student_id);
  return d(body.phone);
}
function publicLimitOk_(action, body) {
  var lim = PUBLIC_LIMITS_[action];
  if (!lim) return true;
  var k = publicKeyOf_(action, body);
  if (k && !throttleOk_("k_" + action + "_" + k, lim.key[0], lim.key[1])) return false;
  return throttleOk_(action, lim.site[0], lim.site[1]);
}
function throttleOk_(name, max, windowS) {
  try {
    var c = CacheService.getScriptCache(), slot = Math.floor(Date.now() / 1000 / windowS), k = "rl_" + name + "_" + slot;
    var n = Number(c.get(k) || 0) + 1;
    c.put(k, String(n), windowS + 60);
    return n <= max;
  } catch (e) { return true; }   // never block real users because the cache hiccuped
}
function keyOk_(e) {
  var want = props_().LUMIO_API_KEY;
  if (!want) return true;
  var got = (e && e.parameter) ? e.parameter.key : "";
  return got === want;
}

function denied_(who) { return jsonResponse_({ ok: false, error: who.error || "unauthorized" }); }
// v14: what went wrong goes to the execution log (Apps Script -> Executions), not to the page.
function fail_(err) {
  try { console.error("Lumio script error: " + String((err && err.stack) || err)); } catch (e) {}
  return jsonResponse_({ ok: false, error: "server_error" });
}
// Every request starts with fresh reads (and, in the editor's test runs, a clean slate).
function resetRequest_() { READ_MEMO_ = {}; PROPS_ = null; LOCK_HELD_ = 0; SHEET_TZ_MEMO_ = null; }

// The answer to one read action for an already identified caller (same rules as before v13).
function getResult_(action, who) {
  var no = { ok: false, error: who.error || "unauthorized" };
  if (who.role === "student") {
    if (action === "pullRoster") return studentRoster_(who);
    if (action === "pullScheduleV2") return studentSchedule_(who);
    if (action === "pullProgress") return { ok: true, rows: ownRows_(pullProgress_().rows, meRef_(who.student, who.roster)) };
    if (action === "pullHomework") return { ok: true, rows: ownRows_(pullHomework_().rows, meRef_(who.student, who.roster)) };
    if (action === "pullExtras") return { ok: true, rows: ownRows_(pullExtras_().rows, meRef_(who.student, who.roster)) };
    return no;
  }
  if (who.role === "public") {
    // The teacher portal needs the list of teachers to show before
    // anyone has signed in -- names and avatars only.
    if (action === "pullRoster") return { ok: true, students: [], teachers: publicTeachers_(), rewardCatalog: [], deletedIds: deletedIdsOfType_(["teacher"]) };
    if (action) return no;
    return { ok: true, message: "Lumio sync backend is running." };
  }
  if (action === "pullRoster") return pullRoster_(who);
  if (action === "pullScheduleV2") return pullScheduleV2_();
  if (action === "pullProgress") return pullProgress_();
  if (action === "pullHomework") return pullHomework_();
  if (action === "pullExtras") return pullExtras_();
  if (action === "pullLeads") return pullLeads_();
  if (action === "pullProAdmins") return callerIsOwner_(who) ? pullProAdmins_() : { ok: false, error: "unauthorized" };
  if (action === "pullProTestResults") return pullProTestResults_();
  return { ok: true, message: "Lumio sync backend is running." };
}
var BUNDLE_ACTIONS_ = { pullRoster: 1, pullScheduleV2: 1, pullProgress: 1, pullHomework: 1, pullExtras: 1, pullLeads: 1, pullProAdmins: 1, pullProTestResults: 1 };

function doGet(e) {
  try {
    resetRequest_();
    if (!keyOk_(e)) return jsonResponse_({ ok: false, error: "unauthorized" });
    var action = (e && e.parameter) ? e.parameter.action : null;
    // Lets a page tell this version apart from older deployments (every v13 flag stays).
    if (action === "version") return jsonResponse_({ ok: true, version: 14, auth: true, merge: true, studentPhoto: true, mainOwner: true, hardened: true, extras: true, bundle: true,
      tokens: true, serverBooking: true, recordIds: true, keepsColumns: true });
    if (action === "ping") { keepWarm(); return jsonResponse_({ ok: true }); }
    var who = whoIs_(e);
    if (who.error) return denied_(who);
    // v13: several reads in one request (a dashboard used to send 5 at once, each identifying the caller again)
    if (action === "bundle") {
      var list = String((e.parameter && e.parameter.actions) || "").split(",").filter(function (a) { return BUNDLE_ACTIONS_[a]; }).slice(0, 8);
      var results = {};
      list.forEach(function (a) {
        try { results[a] = getResult_(a, who); }
        catch (err) { try { console.error("Lumio bundle " + a + ": " + String((err && err.stack) || err)); } catch (e2) {} results[a] = { ok: false, error: "server_error" }; }
      });
      return jsonResponse_({ ok: true, bundle: true, results: results });
    }
    return jsonResponse_(getResult_(action, who));
  } catch (err) {
    return fail_(err);
  }
}

// ---- keep the script awake (v13) ----
// Google puts an unused script to sleep; the first request after that waits 5-10 s. A timer that runs every
// 5 minutes keeps it awake and the Teachers cache filled. Run setupKeepWarm() ONCE from the editor to install it.
// v14: it re-reads the tab every time (so the 6-minute cache never runs out between two runs) and, when the tab has
// no cache version yet, starts one while holding the script lock (no save can be half-way then).
function keepWarm() {
  var key = TEACHERS_SHEET + "|" + TEACHERS_COLUMNS.join(",");
  var hit = tabCacheGet_(TEACHERS_SHEET, key);
  if (!hit) { readRows_(TEACHERS_SHEET, TEACHERS_COLUMNS); return; }
  var refresh = function (ver) {
    var rows = readRowsFromSheet_(TEACHERS_SHEET, TEACHERS_COLUMNS);
    if (ver && rows.length) tabCachePut_(key, JSON.stringify(rows), ver);
  };
  if (hit.ver) { refresh(hit.ver); return; }
  tryLocked_(5000, function () {
    var again = tabCacheGet_(TEACHERS_SHEET, key);
    if (again && !again.ver) { tabVerBump_(TEACHERS_SHEET); again = tabCacheGet_(TEACHERS_SHEET, key); }
    if (again && again.ver) refresh(again.ver);
  });
}
function setupKeepWarm() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === "keepWarm") ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger("keepWarm").timeBased().everyMinutes(5).create();
}

function doPost(e) {
  try {
    resetRequest_();
    if (!keyOk_(e)) return jsonResponse_({ ok: false, error: "unauthorized" });
    var action = (e && e.parameter) ? e.parameter.action : null;
    var body = {};
    if (e && e.postData && e.postData.contents) {
      try { body = JSON.parse(e.postData.contents); } catch (pe) { return jsonResponse_({ ok: false, error: "bad_request" }); }
      if (!body || typeof body !== "object" || Array.isArray(body)) return jsonResponse_({ ok: false, error: "bad_request" });
    }
    // Public actions: the logins and the placement test (limits: see PUBLIC_LIMITS_ and studentLogin_).
    if (action === "teacherLogin") return jsonResponse_(teacherLogin_(body));
    if (action === "studentLogin") return jsonResponse_(studentLogin_(body));
    if (PUBLIC_LIMITS_[action] && !publicLimitOk_(action, body)) return jsonResponse_(BUSY_);
    if (action === "checkPhone") return jsonResponse_(checkPhone_(body));
    if (action === "registerStudent") return jsonResponse_(registerStudent_(body));
    if (action === "placementUpdate") return jsonResponse_(placementUpdate_(body));
    if (action === "addLead") return jsonResponse_(addLead_(body));
    if (action === "pushProTestResult") return jsonResponse_(pushProTestResult_(body));
    var who = whoIs_(e);
    if (who.error) return denied_(who);
    if (action === "writingFeedback") return jsonResponse_(aiFeedback_(body, who));
    if (who.role === "student") {
      var me = who.student, meV = meRef_(me, who.roster);   // meV: for matching class seats
      if (action === "pushStudentPatch") {
        if (!body.patch || body.patch.id !== me.id) return denied_({});
        var out = pushStudentPatch_(body);
        if (out && out.student) out.student = selfView_(out.student);
        return jsonResponse_(out);
      }
      // Booking: only themselves, and the answer only shows their own seat.
      if (action === "bookSlot") {
        if (body.student && body.student.studentId && body.student.studentId !== me.id) return denied_({});
        var booked = bookSlotStudent_(body, who);
        if (booked && booked.cls) booked.cls = studentClassView_(booked.cls, meV);
        return jsonResponse_(booked);
      }
      if (action === "cancelSlot") {
        var cancelled = cancelSlot_(body, who);
        if (cancelled && cancelled.cls) cancelled.cls = studentClassView_(cancelled.cls, meV);
        return jsonResponse_(cancelled);
      }
      if (action === "rateClass") {
        var rated = rateClass_(body, { studentId: me.id, studentName: me.name, student: true, roster: who.roster });
        if (rated && rated.cls) rated.cls = studentClassView_(rated.cls, meV);
        return jsonResponse_(rated);
      }
      if (action === "pushProgress") return jsonResponse_(pushProgress_({ progress: ownTree_(body.progress, me) }, who));
      if (action === "pushHomework") return jsonResponse_(pushHomework_({ homework: ownTree_(body.homework, me) }, who));
      if (action === "pushExtras") return jsonResponse_(pushExtras_({ extras: ownTree_(body.extras, me) }, who));
      return denied_({});
    }
    if (who.role !== "teacher") return denied_({});
    if (action === "pushRoster") return jsonResponse_(pushRoster_(body, who));
    if (action === "pushStudentPatch") return jsonResponse_(pushStudentPatch_(body));
    if (action === "pushScheduleV2") return jsonResponse_(pushScheduleV2_(body, who));
    if (action === "bookSlot") return jsonResponse_(bookSlot_(body));
    if (action === "cancelSlot") return jsonResponse_(cancelSlot_(body));
    if (action === "rateClass") return jsonResponse_(rateClass_(body, { studentId: body.studentId, studentName: body.studentName }));
    if (action === "pushProgress") return jsonResponse_(pushProgress_(body, who));
    if (action === "pushHomework") return jsonResponse_(pushHomework_(body, who));
    if (action === "pushExtras") return jsonResponse_(pushExtras_(body, who));
    if (action === "pushLeads") return jsonResponse_(pushLeads_(body, who));
    if (action === "pushProAdmins") return callerIsOwner_(who) ? jsonResponse_(pushProAdmins_(body)) : denied_({});
    if (action === "clearProTestResults") return callerIsOwner_(who) ? jsonResponse_(clearProTestResults_()) : denied_({});
    return jsonResponse_({ ok: false, error: "Unknown action: " + action });
  } catch (err) {
    return fail_(err);
  }
}

// ---------- editor helpers (v14) ----------
// Run from the Apps Script editor (select the function, press Run).

// Lets every teacher and child who got locked out by wrong PINs try again now.
function clearLockouts() {
  resetRequest_();
  var keys = [];
  readRows_(TEACHERS_SHEET, TEACHERS_COLUMNS).forEach(function (t) { if (t.id) keys.push(failKey_("t", t.id)); });
  readRows_(ROSTER_SHEET, ROSTER_COLUMNS).forEach(function (s) {
    if (!s.id) return;
    keys.push(failKey_("s", s.id), failKey_("sl", s.id));
    [s.loginCode, s.phone, s.name].forEach(function (v) { if (v) keys.push(failKey_("si", loginIdentKey_(String(v)))); });
  });
  var slot = siteFailSlot_();
  ["studentLogin", "teacherLogin"].forEach(function (a) { keys.push(siteFailKey_(a, slot), siteFailKey_(a, slot - 1)); });
  var c = CacheService.getScriptCache();
  for (var i = 0; i < keys.length; i += 500) c.removeAll(keys.slice(i, i + 500));
  Logger.log("Lock-outs cleared (" + keys.length + " counters).");
  return keys.length;
}
// A new, empty Teachers tab (or a fresh copy of the Sheet): lets the first
// teacher who signs in on teacher-portal.html become the main owner again.
// While any teacher has a PIN this changes nothing.
function allowFirstOwnerSetup() {
  PropertiesService.getScriptProperties().deleteProperty("LUMIO_SETUP_DONE");
  PROPS_ = null;
  Logger.log("First-owner setup allowed: the next teacher to sign in while no teacher has a PIN becomes the main owner.");
}
