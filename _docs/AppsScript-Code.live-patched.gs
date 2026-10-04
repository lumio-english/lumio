function testGroqAuth() {
  // Temporary helper - run this once from the editor (not via a web
  // request) to trigger the permission popup for calling a new
  // external domain (the Groq API). Safe to delete once authorized.
  var result = writingFeedback_({ prompt: "test", answer: "This is a test answer to trigger the authorization prompt.", minWords: 5 });
  Logger.log(result);
}

/**
/**
 * Lumio English — Sync backend (Google Apps Script)
 * One project, one deployment URL: roster/schedule/leads/progress sync,
 * test-result backup, student inbox + referrals, Zoom auto-links, and
 * AI writing feedback.
 *
 * Setup (once): paste into the Sheet's bound script (Extensions ->
 * Apps Script). Script Properties: GROQ_API_KEY (AI feedback), and
 * optionally ZOOM_ACCOUNT_ID / ZOOM_CLIENT_ID / ZOOM_CLIENT_SECRET /
 * ZOOM_HOST_EMAIL. Deploy -> Web app, Execute as: Me, Access: Anyone.
 * New sheet tabs/columns are created automatically on first run.
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

var PROGRESS_SHEET = "Progress";
var PROGRESS_COLUMNS = ["studentName", "level", "lesson", "stars", "score", "total", "date"];
// Interactive homework results (drawings stay on the student's device).
var HOMEWORK_SHEET = "Homework";
var HOMEWORK_COLUMNS = ["studentName", "level", "lesson", "stars", "score", "total", "said", "saidTotal", "hasDrawing", "date",
  // per-skill breakdown homework.html saves and report.html reads (Reading = quiz, Writing = spelling)
  "skillType", "skillCorrect", "skillTotal", "quizCorrect", "quizTotal", "spellingCorrect", "spellingTotal", "recorded", "recordedTotal"];

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
  // The header row is rewritten by writeRows_ (always exactly `columns`),
  // so nothing is appended here: appending names by count used to leave a
  // header that no longer described the data under it.
  return sheet;
}
// Which field each physical column holds. A clean header (unique names)
// is trusted by name; a header with duplicates came from an older build,
// whose layout is recognised by its width. Otherwise: `columns` in order.
function physicalLayout_(sheet, name, columns) {
  var lastCol = sheet.getLastColumn();
  var header = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function (h) { return String(h || "").trim(); }) : [];
  while (header.length && !header[header.length - 1]) header.pop();
  var seen = {}, clean = header.length > 0;
  header.forEach(function (h) { if (!h || seen[h]) clean = false; seen[h] = true; });
  if (clean && header.indexOf("id") >= 0 || clean && header.indexOf(columns[0]) >= 0) return header;
  if (name === ROSTER_SHEET && LEGACY_ROSTER_LAYOUTS_[header.length]) return LEGACY_ROSTER_LAYOUTS_[header.length];
  return columns;
}

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
// js/app.js); the Zoom meeting and any Date-cell repair use the same zone.
var PLATFORM_TZ = "Asia/Riyadh";
var DATE_ONLY_COLUMNS = { date: 1, startDate: 1, endDate: 1, deletedAt: 0 };
var TIME_ONLY_COLUMNS = { startTime: 1 };
var TEXT_NUMBER_COLUMNS = { loginCode: 1, phone: 1, pin: 1, id: 1, studentId: 1, teacherId: 1 };

function cellToString_(col, v) {
  // Rows that round-tripped through the old code may hold the ISO text
  // "2026-09-18T21:00:00.000Z" (a date) or "1899-12-30T13:00:00.000Z" (a
  // time) as a plain string -- treat those exactly like Date cells.
  if (typeof v === "string" && (TIME_ONLY_COLUMNS[col] || DATE_ONLY_COLUMNS[col]) && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(v)) {
    var parsed = new Date(v);
    if (!isNaN(parsed.getTime())) v = parsed;
  }
  if (v instanceof Date) {
    var tz = PLATFORM_TZ;
    if (TIME_ONLY_COLUMNS[col]) return Utilities.formatDate(v, tz, "HH:mm");
    if (DATE_ONLY_COLUMNS[col]) return Utilities.formatDate(v, tz, "yyyy-MM-dd");
    return v.toISOString();
  }
  if (typeof v === "number" && TEXT_NUMBER_COLUMNS[col]) return String(v);
  return v;
}

function readRows_(name, columns) {
  var sheet = getOrCreateSheet_(name, columns);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  var layout = physicalLayout_(sheet, name, columns);
  var values = sheet.getRange(2, 1, lastRow - 1, layout.length).getValues();
  var rows = values
    .filter(function (row) { return row.some(function (cell) { return cell !== "" && cell !== null; }); })
    .map(function (row) {
      var obj = {};
      columns.forEach(function (col) { var i = layout.indexOf(col); obj[col] = i >= 0 ? cellToString_(col, row[i]) : ""; });
      return obj;
    });
  // Old layout on the sheet: rewrite it once in the current one, so every
  // later read/write (and the positional cell updates) line up.
  if (layout.join("|") !== columns.join("|")) writeRows_(name, columns, rows);
  return rows;
}

function writeRows_(name, columns, rows) {
  var sheet = getOrCreateSheet_(name, columns);
  var lastRow = sheet.getLastRow(), lastCol = Math.max(sheet.getLastColumn(), columns.length);
  var head = sheet.getRange(1, 1, 1, lastCol);
  var want = columns.concat(new Array(lastCol - columns.length).fill(""));
  if (head.getValues()[0].map(String).join("|") !== want.join("|")) { head.clearContent(); sheet.getRange(1, 1, 1, columns.length).setValues([columns]); }
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, lastCol).clearContent();
  }
  if (!rows.length) return;
  var values = rows.map(function (r) {
    return columns.map(function (col) {
      var v = r[col];
      if (v === undefined || v === null) return "";
      if (col === "photoDataUrl" && String(v).length > PHOTO_MAX_CHARS_) return "";   // a Sheet cell holds 50,000 characters
      if (typeof v === "object") return JSON.stringify(v);
      return v;
    });
  });
  var range = sheet.getRange(2, 1, values.length, columns.length);
  range.setNumberFormat("@");   // plain text: no auto-typing of dates, times or numbers
  range.setValues(values);
}

// One-off repair for a Sheet that already has auto-typed cells: rewrites
// every data row of every tab as text (through readRows_'s normalisation)
// and refreshes the header rows from the column lists above. Run it once
// from the Apps Script editor after deploying this version.
function repairSheetTypes() {
  var tabs = [
    [TEACHERS_SHEET, TEACHERS_COLUMNS], [ROSTER_SHEET, ROSTER_COLUMNS],
    [SCHEDULE_SHEET, SCHEDULE_COLUMNS], [PATTERNS_SHEET, PATTERNS_COLUMNS],
    [BLOCKED_DATES_SHEET, BLOCKED_DATES_COLUMNS], [PROGRESS_SHEET, PROGRESS_COLUMNS],
    [LEADS_SHEET, LEADS_COLUMNS], [REWARD_CATALOG_SHEET, REWARD_CATALOG_COLUMNS], [HOMEWORK_SHEET, HOMEWORK_COLUMNS],
    [DELETED_IDS_SHEET, DELETED_IDS_COLUMNS], [PRO_ADMINS_SHEET, PRO_ADMINS_COLUMNS],
    [PRO_TEST_RESULTS_SHEET, PRO_TEST_RESULTS_COLUMNS],
  ];
  tabs.forEach(function (t) {
    var sheet = getOrCreateSheet_(t[0], t[1]);
    var rows = readRows_(t[0], t[1]);
    var lastCol = sheet.getLastColumn();
    if (lastCol > 0) sheet.getRange(1, 1, 1, lastCol).clearContent();
    sheet.getRange(1, 1, 1, t[1].length).setValues([t[1]]);
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) sheet.getRange(2, 1, lastRow - 1, Math.max(lastCol, t[1].length)).clearContent();
    writeRows_(t[0], t[1], rows);
  });
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
function mergeFields_(a, b, skip) {
  var fa = ftOf_(a), fb = ftOf_(b), out = {}, ft = {}, keys = {};
  var base = Math.max(baseTime_(a, fa), baseTime_(b, fb));
  Object.keys(a).forEach(function (k) { keys[k] = 1; });
  Object.keys(b).forEach(function (k) { keys[k] = 1; });
  Object.keys(keys).forEach(function (k) {
    if (k === "fieldTimes" || k === "updatedAt" || (skip && skip[k])) return;
    var va = a[k], vb = b[k], t;
    if (vb === undefined) { out[k] = va; t = fieldTime_(a, fa, k); }
    else if (va === undefined) { out[k] = vb; t = fieldTime_(b, fb, k); }
    else {
      var ta = fieldTime_(a, fa, k), tb = fieldTime_(b, fb, k);
      if (valKey_(va) === valKey_(vb)) { out[k] = va; t = Math.max(ta, tb); }
      else if (tb > ta) { out[k] = vb; t = tb; }
      else { out[k] = va; t = ta; }
    }
    if (t && t !== base) ft[k] = iso_(t);
  });
  if (base) ft._base = iso_(base);
  out.updatedAt = tms_(b.updatedAt) > tms_(a.updatedAt) ? b.updatedAt : a.updatedAt;
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
  // the inbox is always the union (teacher adds, student marks read)
  out.messages = JSON.stringify(unionMessages_(sheet.messages, inc.messages));
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

// ---- class seats ----
function normName_(v) { return String(v || "").trim().toLowerCase(); }
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
  (a.students || []).forEach(function (s) { if (s) out.push({ s: s, t: seatT(a, s) }); });
  (b.students || []).forEach(function (s) {
    if (!s) return;
    var t = seatT(b, s), hit = null;
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
//   avatar                     -- replaced
//   messages                   -- union by message id; read = either side
//   pendingDeletion / deletionConfirmed -- replaced (student's answer)
//   redemptions                -- union by date; a NEW redemption deducts
//                                 its cost from rewardPoints and credits
//                                 bonusHours/sessionsRemaining (hours field)
var PHOTO_MAX_CHARS_ = 48000;
function okPhoto_(v) { return v === "" || (typeof v === "string" && v.length <= PHOTO_MAX_CHARS_ && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+\/=]+$/.test(v)); }
function pushStudentPatch_(body) {
  var patch = body && body.patch;
  if (!patch || !patch.id) return { ok: false, error: "missing patch.id" };
  // Locked: a teacher's roster push merging at the same moment must not
  // write back a copy read before this patch landed.
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try { return pushStudentPatchLocked_(patch); } finally { lock.releaseLock(); }
}
function pushStudentPatchLocked_(patch) {
  var rows = readRows_(ROSTER_SHEET, ROSTER_COLUMNS);
  var row = null;
  for (var i = 0; i < rows.length; i++) if (rows[i].id === patch.id) { row = rows[i]; break; }
  if (!row) return { ok: false, error: "student not found" };
  var parseArr = function (v) { try { var a = JSON.parse(v || "[]"); return Array.isArray(a) ? a : []; } catch (e) { return []; } };
  var changed = false, stamped = [];   // fields this patch changed get their own time (fieldTimes)

  if (typeof patch.avatar === "string" && patch.avatar && patch.avatar !== row.avatar) { row.avatar = patch.avatar; changed = true; stamped.push("avatar"); }
  // the student's own profile photo ("" removes it)
  // Only a change made after the Sheet's copy wins, so an older device can't wipe a newer photo.
  var photoAt = Date.parse(patch.photoAt || "") || 0, sheetPhotoAt = Date.parse(ftOf_(row).photoDataUrl || "") || 0;
  if (patch.photoDataUrl !== undefined && okPhoto_(patch.photoDataUrl) && photoAt > sheetPhotoAt && patch.photoDataUrl !== (row.photoDataUrl || "")) { row.photoDataUrl = patch.photoDataUrl; changed = true; stamped.push("photoDataUrl"); }

  if (Array.isArray(patch.messages)) {
    var existing = parseArr(row.messages);
    var byId = {};
    existing.forEach(function (m) { if (m && m.id) byId[m.id] = m; });
    var msgChanged = false;
    patch.messages.forEach(function (m) {
      if (!m || !m.id) return;
      var prev = byId[m.id];
      if (!prev) { byId[m.id] = m; msgChanged = true; }
      else if (m.read && !prev.read) { prev.read = true; msgChanged = true; }
    });
    if (msgChanged) {
      var merged = Object.keys(byId).map(function (k) { return byId[k]; });
      merged.sort(function (a, b) { return Date.parse(a.date || 0) - Date.parse(b.date || 0); });
      row.messages = JSON.stringify(merged);
      changed = true; stamped.push("messages");
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
    var have = parseArr(row.redemptions);
    var seen = {};
    have.forEach(function (r) { if (r && r.date) seen[r.date] = true; });
    var points = Number(row.rewardPoints) || 0;
    var bonus = Number(row.bonusHours) || 0;
    var sessions = Number(row.sessionsRemaining) || 0;
    var added = false;
    patch.redemptions.forEach(function (r) {
      if (!r || !r.date || seen[r.date]) return;
      var cost = Number(r.cost) || 0;
      if (cost <= 0 || cost > points) return;   // cannot redeem more than the row has
      var hours = Number(r.hours) || 0;
      points -= cost;
      bonus += hours;
      sessions += hours;
      have.push({ date: r.date, label: r.label || "", cost: cost, hours: hours });
      seen[r.date] = true;
      added = true;
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
  return { ok: true, changed: changed, student: row };
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
function mergeDeletedIds_(incoming) {
  if (!Array.isArray(incoming) || !incoming.length) return;
  var existing = readRows_(DELETED_IDS_SHEET, DELETED_IDS_COLUMNS);
  var seen = {};
  existing.forEach(function (r) { if (r && r.id) seen[r.id] = true; });
  var added = 0;
  var byId = {};
  existing.forEach(function (r) { if (r && r.id) byId[r.id] = r; });
  incoming.forEach(function (r) {
    if (!r || !r.id) return;
    // A holiday can be removed, added again and removed again: its
    // tombstone keeps the LATEST removal time (compared with addedAt).
    if (seen[r.id]) {
      var have = byId[r.id];
      if (r.type === "blockedDate" && have && tms_(r.deletedAt) > tms_(have.deletedAt)) { have.deletedAt = r.deletedAt; added++; }
      return;
    }
    seen[r.id] = true;
    var row = { id: r.id, type: r.type || "student", deletedAt: r.deletedAt || new Date().toISOString() };
    existing.push(row); byId[r.id] = row;
    added++;
  });
  if (added) writeRows_(DELETED_IDS_SHEET, DELETED_IDS_COLUMNS, existing);
}

// Security (v11): a PIN hash is the credential the script checks (tid/th, sid/sh), so a pull never
// hands out anyone else's: students come without pinHash, teachers only with the caller's own.
// Devices keep their local hash (keepHidden in js/lumio-profiles.js) and keepPinHashes_ keeps
// the Sheet's when a push leaves it out.
function pullRoster_(who) {
  var me = who && who.teacher ? who.teacher.id : "";
  return {
    students: readRows_(ROSTER_SHEET, ROSTER_COLUMNS).map(function (s) { var o = Object.assign({}, s); delete o.pinHash; return o; }),
    teachers: readRows_(TEACHERS_SHEET, TEACHERS_COLUMNS).map(function (t) { var o = Object.assign({}, t); if (!(who && who.open) && o.id !== me) delete o.pinHash; return o; }),
    rewardCatalog: readRows_(REWARD_CATALOG_SHEET, REWARD_CATALOG_COLUMNS),
    deletedIds: deletedIdsOfType_(["student", "teacher", "reward"]),
  };
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
// Renaming a student (teacher dashboard) moves their Progress/Homework
// rows and class seats to the new name, keeping the best result per lesson.
function applyRenames_(renames) {
  var done = 0;
  (renames || []).forEach(function (rn) {
    if (!rn || !rn.from || !rn.to || rn.from === rn.to) return;
    [[PROGRESS_SHEET, PROGRESS_COLUMNS], [HOMEWORK_SHEET, HOMEWORK_COLUMNS]].forEach(function (t) {
      var rows = readRows_(t[0], t[1]);
      var moving = rows.filter(function (r) { return r.studentName === rn.from; });
      if (!moving.length) return;
      writeRows_(t[0], t[1], rows.filter(function (r) { return r.studentName !== rn.from; }));
      mergeRecordRows_(t[0], t[1], moving.map(function (r) { r.studentName = rn.to; return r; }));
      done++;
    });
    [[SCHEDULE_SHEET, SCHEDULE_COLUMNS], [PATTERNS_SHEET, PATTERNS_COLUMNS]].forEach(function (t) {
      var rows = readRows_(t[0], t[1]), changed = false, now = new Date().toISOString();
      rows.forEach(function (r) {
        var seats; try { seats = JSON.parse(r.studentsJson || "[]"); } catch (e) { return; }
        var hit = false;
        seats.forEach(function (st) { if (st && ((rn.id && st.studentId === rn.id) || st.studentName === rn.from)) { st.studentName = rn.to; st.updatedAt = now; hit = true; } });
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
function callerIsOwner_(who) { return !!(who && (who.open || (who.teacher && isOwnerVal_(who.teacher.isOwner)))); }
function pushRoster_(body, who) {
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var mainNow = mainOwnerOf_(readRows_(TEACHERS_SHEET, TEACHERS_COLUMNS));
    if (mainNow && Array.isArray(body.deletedIds)) body.deletedIds = body.deletedIds.filter(function (d) { return !(d && d.id === mainNow.id); });   // the main owner's account can't be deleted
    // Deletions (v11): owners may delete anything (except the main owner); a regular teacher only
    // their own students -- never a teacher, and never another teacher's student.
    if (!callerIsOwner_(who) && Array.isArray(body.deletedIds)) {
      var mineIds = {}; readRows_(ROSTER_SHEET, ROSTER_COLUMNS).forEach(function (r) { if (who.teacher && r.teacherId === who.teacher.id) mineIds[r.id] = true; });
      body.deletedIds = body.deletedIds.filter(function (d) { return d && (d.type || "student") === "student" && mineIds[d.id]; });
    }
    mergeDeletedIds_(body.deletedIds);
    if (Array.isArray(body.students)) {
      writeRows_(ROSTER_SHEET, ROSTER_COLUMNS, mergeRowsById_(readRows_(ROSTER_SHEET, ROSTER_COLUMNS),
        keepPinHashes_(body.students, ROSTER_SHEET, ROSTER_COLUMNS), goneSet_(["student"]), mergeStudentRow_));
    }
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
      writeRows_(TEACHERS_SHEET, TEACHERS_COLUMNS, merged);
    }
    if (Array.isArray(body.rewardCatalog)) {
      writeRows_(REWARD_CATALOG_SHEET, REWARD_CATALOG_COLUMNS, mergeRowsById_(readRows_(REWARD_CATALOG_SHEET, REWARD_CATALOG_COLUMNS),
        body.rewardCatalog, goneSet_(["reward"]), function (a, b) { return b; }));
    }
    var renamed = applyRenames_(body.renames);
    return { ok: true, renamed: renamed, merged: true };
  } finally { lock.releaseLock(); }
}

// ---------- schedule (V2) ----------

function classToRow_(c) {
  var row = {};
  SCHEDULE_COLUMNS.forEach(function (col) { row[col] = c[col] !== undefined ? c[col] : ""; });
  row.studentsJson = JSON.stringify(c.students || []);
  delete row.students;
  return row;
}
function rowToClass_(row) {
  var c = {};
  SCHEDULE_COLUMNS.forEach(function (col) { if (col !== "studentsJson") c[col] = row[col]; });
  try { c.students = JSON.parse(row.studentsJson || "[]"); } catch (e) { c.students = []; }
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
function pushScheduleV2_(body) {
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    mergeDeletedIds_(body.deletedIds);
    if (Array.isArray(body.classes)) {
      var merged = mergeRowsById_(readRows_(SCHEDULE_SHEET, SCHEDULE_COLUMNS).map(rowToClass_), body.classes,
        goneSet_(["class"]), mergeClass_);
      writeRows_(SCHEDULE_SHEET, SCHEDULE_COLUMNS, dedupePatternClasses_(merged).map(classToRow_));
    }
    if (Array.isArray(body.patterns)) {
      writeRows_(PATTERNS_SHEET, PATTERNS_COLUMNS, mergeRowsById_(readRows_(PATTERNS_SHEET, PATTERNS_COLUMNS).map(rowToPattern_),
        body.patterns, goneSet_(["pattern"]), function (a, b) { return mergeFields_(a, b); }).map(patternToRow_));
    }
    if (Array.isArray(body.blockedDates)) {
      writeRows_(BLOCKED_DATES_SHEET, BLOCKED_DATES_COLUMNS, liveBlockedDates_(
        readRows_(BLOCKED_DATES_SHEET, BLOCKED_DATES_COLUMNS).concat(body.blockedDates), deletedIdsOfType_(["blockedDate"])));
    }
    return { ok: true, merged: true };
  } finally { lock.releaseLock(); }
}

function patternToRow_(p) {
  var row = {};
  PATTERNS_COLUMNS.forEach(function (col) { row[col] = p[col] !== undefined ? p[col] : ""; });
  row.studentsJson = JSON.stringify(p.students || []);
  delete row.students;
  return row;
}
function rowToPattern_(row) {
  var p = {};
  PATTERNS_COLUMNS.forEach(function (col) { if (col !== "studentsJson") p[col] = row[col]; });
  try { p.students = JSON.parse(row.studentsJson || "[]"); } catch (e) { p.students = []; }
  p.active = row.active === true || row.active === "true" || row.active === 1;
  p.extra = row.extra === true || row.extra === "true" || row.extra === 1;
  var ft = ftOf_(row);
  if (Object.keys(ft).length) p.fieldTimes = ft; else delete p.fieldTimes;
  return p;
}

// ---------- student-device booking (narrow, locked write path) ----------
// A student's phone never pushes the whole schedule (its copy is stale).
// It sends ONE class it wants to book into / create, and this re-checks
// the rules that matter for fairness under a script lock, so two students
// tapping the same seat at once can't both get it:
//   - a slot (patternId+date) that already has a class: same level+lesson
//     only, max `maxPerClass` students, no duplicates
//   - an empty slot: the first booking creates the class and locks it
function normStudent_(n) { return String(n || "").trim().toLowerCase(); }
function bookSlot_(body) {
  var cls = body && body.cls, student = body && body.student;
  if (!cls || !cls.id || !student || !student.studentName) return { ok: false, error: "missing class or student" };
  var max = Number(body.maxPerClass) || 4;
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
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
      var already = existing.students.some(function (s) { return normStudent_(s.studentName) === normStudent_(student.studentName); });
      if (already) return { ok: true, cls: existing };
      if (existing.lessonNumber && (String(existing.level) !== String(cls.level) || Number(existing.lessonNumber) !== Number(cls.lessonNumber))) return { ok: false, error: "That class is for a different lesson." };
      if (existing.students.length >= max) return { ok: false, error: "That class is full (" + max + "/" + max + ")." };
      var locks = [];
      if (!existing.lessonNumber) { existing.level = cls.level; existing.lessonNumber = cls.lessonNumber; existing.durationMinutes = cls.durationMinutes; locks = ["level", "lessonNumber", "durationMinutes"]; }
      existing.students.push({ studentId: student.studentId || null, studentName: student.studentName, attendance: null, grade: null, teacherRatingStars: null, updatedAt: nowIso });
      touch_(existing, locks, nowIso);
      writeRows_(SCHEDULE_SHEET, SCHEDULE_COLUMNS, rows.map(classToRow_));
      return { ok: true, cls: existing };
    }
    cls.students = [{ studentId: student.studentId || null, studentName: student.studentName, attendance: null, grade: null, teacherRatingStars: null, updatedAt: nowIso }];
    cls.status = "scheduled";
    cls.createdAt = cls.createdAt || nowIso; cls.updatedAt = nowIso;
    rows.push(cls);
    writeRows_(SCHEDULE_SHEET, SCHEDULE_COLUMNS, rows.map(classToRow_));
    return { ok: true, cls: cls };
  } finally { lock.releaseLock(); }
}
// Student cancels their own seat: allowed up to `minBefore` minutes before
// the class starts (Saudi time). An emptied class is cancelled so the
// teacher's slot opens again.
function cancelSlot_(body) {
  var classId = body && body.classId, studentName = body && body.studentName;
  if (!classId || !studentName) return { ok: false, error: "missing classId or studentName" };
  var minBefore = Number(body.minBefore) || 30;
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var rows = readRows_(SCHEDULE_SHEET, SCHEDULE_COLUMNS).map(rowToClass_);
    var c = null;
    for (var i = 0; i < rows.length; i++) if (rows[i].id === classId) { c = rows[i]; break; }
    if (!c) return { ok: false, error: "Class not found." };
    var start = new Date(c.date + "T" + c.startTime + ":00+03:00"); // Riyadh has no DST
    var minsToStart = (start.getTime() - Date.now()) / 60000;
    if (minsToStart < minBefore) return { ok: false, error: "Classes can be cancelled up to " + minBefore + " minutes before they start." };
    var nowIso = new Date().toISOString();
    var before = c.students.length;
    c.students = c.students.filter(function (s) {
      var me = normStudent_(s.studentName) === normStudent_(studentName);
      if (me) tombSeat_(c, s, nowIso);   // so a teacher device's older copy can't put the seat back
      return !me;
    });
    if (c.students.length === before) return { ok: false, error: "That student isn't in this class." };
    if (!c.students.length) c.status = "cancelled";
    touch_(c, c.students.length ? [] : ["status"], nowIso);
    // Lessons are booked in sequence: dropping lesson N drops this
    // student's later bookings in the same level too.
    var n = Number(c.lessonNumber) || 0;
    if (n) rows.forEach(function (x) {
      if (x.id === c.id || x.status !== "scheduled" || String(x.level) !== String(c.level) || !(Number(x.lessonNumber) > n)) return;
      var b = x.students.length;
      x.students = x.students.filter(function (s) {
        var me = normStudent_(s.studentName) === normStudent_(studentName);
        if (me) tombSeat_(x, s, nowIso);
        return !me;
      });
      if (x.students.length === b) return;
      if (!x.students.length) x.status = "cancelled";
      touch_(x, x.students.length ? [] : ["status"], nowIso);
    });
    writeRows_(SCHEDULE_SHEET, SCHEDULE_COLUMNS, rows.map(classToRow_));
    return { ok: true, cls: c };
  } finally { lock.releaseLock(); }
}

// A student's star rating (1-5) of the teacher for one class they were
// in. Student devices never push the schedule, so ratings used to stay on
// the phone. Sets ONLY the caller's own seat (+ that seat's updatedAt, so
// the per-seat merge keeps it against a teacher device's older copy).
function rateClass_(body, who) {
  var classId = body && body.classId, n = Number(body && body.stars);
  if (!classId) return { ok: false, error: "missing classId" };
  if (!(n >= 1 && n <= 5 && Math.floor(n) === n)) return { ok: false, error: "Rating must be an integer from 1 to 5." };
  var lock = LockService.getScriptLock(); lock.waitLock(15000);
  try {
    var rows = readRows_(SCHEDULE_SHEET, SCHEDULE_COLUMNS).map(rowToClass_);
    var c = null;
    for (var i = 0; i < rows.length; i++) if (rows[i].id === classId) { c = rows[i]; break; }
    if (!c) return { ok: false, error: "Class not found." };
    var sid = who.studentId, sname = who.studentName, seat = null;
    (c.students || []).forEach(function (s) {
      if (seat || !s) return;
      if ((sid && s.studentId === sid) || (sname && normStudent_(s.studentName) === normStudent_(sname))) seat = s;
    });
    if (!seat) return { ok: false, error: "That student isn't in this class." };
    seat.teacherRatingStars = n;
    seat.updatedAt = new Date().toISOString();
    writeRows_(SCHEDULE_SHEET, SCHEDULE_COLUMNS, rows.map(classToRow_));
    return { ok: true, cls: c };
  } finally { lock.releaseLock(); }
}

// ---------- progress ----------

// Progress and homework rows are MERGED by student+level+lesson (higher
// stars win, then the newer date), never replaced wholesale: student
// phones push only their own records, teacher devices push everything
// they know, and neither can wipe the other's rows.
function flattenRecords_(tree, columns) {
  var rows = [];
  Object.keys(tree || {}).forEach(function (studentName) {
    var levels = tree[studentName] || {};
    Object.keys(levels).forEach(function (level) {
      var lessons = levels[level] || {};
      Object.keys(lessons).forEach(function (lessonId) {
        var r = lessons[lessonId] || {};
        var row = { studentName: studentName, level: level, lesson: lessonId };
        columns.forEach(function (col) { if (!(col in row)) row[col] = r[col] === undefined || r[col] === null ? "" : r[col]; });
        rows.push(row);
      });
    });
  });
  return rows;
}
function mergeRecordRows_(sheet, columns, incoming) {
  var existing = readRows_(sheet, columns);
  var byKey = {};
  existing.forEach(function (r) { byKey[r.studentName + "|" + r.level + "|" + r.lesson] = r; });
  var changed = 0;
  incoming.forEach(function (r) {
    var k = r.studentName + "|" + r.level + "|" + r.lesson;
    var prev = byKey[k];
    // Non-numeric stars (a malformed row) count as -1 so a real record
    // always replaces it.
    var num = function (v) { var n = Number(v); return (v !== "" && v !== null && v !== undefined && isFinite(n)) ? n : -1; };
    var better = !prev || num(r.stars) > num(prev.stars)
      || (num(r.stars) === num(prev.stars) && String(r.date || "") > String(prev.date || ""));
    if (better) { byKey[k] = r; changed++; }
    else if (prev && num(r.stars) === num(prev.stars) && String(r.date || "") === String(prev.date || "")) {
      // Same result, but the row predates a column (e.g. the homework
      // skill breakdown added 3 Oct 2026): fill the blanks in.
      var filled = false;
      columns.forEach(function (col) {
        if ((prev[col] === "" || prev[col] === undefined) && r[col] !== "" && r[col] !== undefined && r[col] !== null) { prev[col] = r[col]; filled = true; }
      });
      if (filled) changed++;
    }
  });
  if (changed) writeRows_(sheet, columns, Object.keys(byKey).map(function (k) { return byKey[k]; }));
  return changed;
}
function pushProgress_(body) {
  var rows = flattenRecords_(body.progress, PROGRESS_COLUMNS);
  var changed = mergeRecordRows_(PROGRESS_SHEET, PROGRESS_COLUMNS, rows);
  return { ok: true, rows: rows.length, changed: changed };
}
function pullProgress_() {
  return { rows: readRows_(PROGRESS_SHEET, PROGRESS_COLUMNS) };
}
function pushHomework_(body) {
  var rows = flattenRecords_(body.homework, HOMEWORK_COLUMNS);
  var changed = mergeRecordRows_(HOMEWORK_SHEET, HOMEWORK_COLUMNS, rows);
  return { ok: true, rows: rows.length, changed: changed };
}
function pullHomework_() {
  return { rows: readRows_(HOMEWORK_SHEET, HOMEWORK_COLUMNS) };
}

// ---------- leads ----------

function pullLeads_() {
  return { leads: readRows_(LEADS_SHEET, LEADS_COLUMNS), deletedIds: deletedIdsOfType_(["lead"]) };
}

// Merged by id (newer updatedAt wins), never replaced: a lead a parent
// submitted (addLead_) between a teacher device's pull and push used to
// be erased by that push. Removal only through DeletedIds.
function pushLeads_(body) {
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    mergeDeletedIds_(body.deletedIds);
    if (Array.isArray(body.leads)) {
      writeRows_(LEADS_SHEET, LEADS_COLUMNS, mergeRowsById_(readRows_(LEADS_SHEET, LEADS_COLUMNS), body.leads, goneSet_(["lead"]),
        function (a, b) { return tms_(b.updatedAt) > tms_(a.updatedAt) ? b : a; }));
    }
    return { ok: true };
  } finally { lock.releaseLock(); }
}

// ---------- pro dashboard admins ----------

function pullProAdmins_() {
  return { admins: readRows_(PRO_ADMINS_SHEET, PRO_ADMINS_COLUMNS) };
}

function pushProAdmins_(body) {
  if (Array.isArray(body.admins)) writeRows_(PRO_ADMINS_SHEET, PRO_ADMINS_COLUMNS, body.admins);
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

function pushProTestResult_(body) {
  var result = body.result;
  if (!result) return { ok: false, error: "No result provided." };
  if (JSON.stringify(result).length > 60000) return { ok: false, error: "too big" };
  result.name = cleanText_(result.name, 60);
  var id = result.student_id + "_" + result.timestamp;
  var existing = readRows_(PRO_TEST_RESULTS_SHEET, PRO_TEST_RESULTS_COLUMNS);
  var alreadyThere = existing.some(function (row) { return row.id === id; });
  if (!alreadyThere) {
    existing.push({
      id: id, name: cleanText_(result.name, 60), student_id: String(result.student_id || "").replace(/\D/g, "").slice(0, 16),
      timestamp: result.timestamp || "", dataJson: JSON.stringify(result),
    });
    writeRows_(PRO_TEST_RESULTS_SHEET, PRO_TEST_RESULTS_COLUMNS, existing);
  }
  return { ok: true };
}

function clearProTestResults_() {
  writeRows_(PRO_TEST_RESULTS_SHEET, PRO_TEST_RESULTS_COLUMNS, []);
  return { ok: true };
}

// ---------- Zoom auto-link generation ----------
// Trigger: Triggers (clock icon) -> Add Trigger -> autoGenerateZoomLinks,
// Time-driven, every 10 minutes. Needs the four ZOOM_* Script Properties.

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
  var sheet = getOrCreateSheet_(SCHEDULE_SHEET, SCHEDULE_COLUMNS);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  var idCol = SCHEDULE_COLUMNS.indexOf("id") + 1;
  var dateCol = SCHEDULE_COLUMNS.indexOf("date") + 1;
  var startCol = SCHEDULE_COLUMNS.indexOf("startTime") + 1;
  var durCol = SCHEDULE_COLUMNS.indexOf("durationMinutes") + 1;
  var levelCol = SCHEDULE_COLUMNS.indexOf("level") + 1;
  var lessonCol = SCHEDULE_COLUMNS.indexOf("lessonNumber") + 1;
  var linkCol = SCHEDULE_COLUMNS.indexOf("meetingLink") + 1;
  var statusCol = SCHEDULE_COLUMNS.indexOf("status") + 1;
  var updatedCol = SCHEDULE_COLUMNS.indexOf("updatedAt") + 1;
  var ftCol = SCHEDULE_COLUMNS.indexOf("fieldTimes") + 1;
  var values = sheet.getRange(2, 1, lastRow - 1, SCHEDULE_COLUMNS.length).getValues();
  var now = new Date();
  var twoHoursOut = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  var accessToken = null;
  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    if (row[statusCol - 1] !== "scheduled" || row[linkCol - 1] || !row[dateCol - 1] || !row[startCol - 1]) continue;
    var startDate = new Date(row[dateCol - 1] + "T" + row[startCol - 1] + ":00+03:00"); // Saudi wall time
    if (isNaN(startDate.getTime()) || startDate < now || startDate > twoHoursOut) continue;
    if (!accessToken) accessToken = getZoomAccessToken_(accountId, clientId, clientSecret);
    if (!accessToken) { Logger.log("Zoom auto-link: couldn't get an access token."); return; }
    var level = row[levelCol - 1] || "";
    var lessonNumber = row[lessonCol - 1] || "";
    var topic = "Lumio English Club" + (level ? " – " + level : "") + (lessonNumber ? " – Lesson " + lessonNumber : "");
    var durationMinutes = Number(row[durCol - 1]) || 45;
    try {
      var joinUrl = createZoomMeeting_(accessToken, hostEmail, topic, startDate, durationMinutes);
      if (joinUrl) {
        var stampedAt = new Date().toISOString();
        // the link gets its own field time, or a teacher device's older
        // copy (meetingLink "") would win the per-field merge
        var ft = touch_({ fieldTimes: row[ftCol - 1], updatedAt: row[updatedCol - 1] }, ["meetingLink"], stampedAt).fieldTimes;
        sheet.getRange(i + 2, linkCol).setValue(joinUrl);
        sheet.getRange(i + 2, ftCol).setValue(JSON.stringify(ft));
        sheet.getRange(i + 2, updatedCol).setValue(stampedAt);
      }
    } catch (err) {
      Logger.log("Zoom auto-link: failed for class " + row[idCol - 1] + ": " + err);
    }
  }
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
  var lock = LockService.getScriptLock(); lock.waitLock(30000);
  try { return sendInstallmentRemindersLocked_(); } finally { lock.releaseLock(); }
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
  var result = writingFeedback_({ prompt: "test", answer: "This is a test answer to trigger the authorization prompt.", minWords: 5 });
  Logger.log(result);
}

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
    var data = JSON.parse(res.getContentText());
    if (code !== 200) return { ok: false, error: (data.error && data.error.message) ? data.error.message : ("Groq API returned status " + code) };
    var msg = data.choices && data.choices[0] && data.choices[0].message;
    var feedback = (msg && msg.content) || (msg && msg.reasoning) || "";
    if (!feedback) return { ok: false, error: "Empty response from Groq." };
    return { ok: true, feedback: feedback.trim() };
  } catch (err) {
    return { ok: false, error: "Request to Groq failed: " + String(err) };
  }
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
// Until any teacher has a PIN on the Sheet (a brand-new install) every
// caller counts as a teacher, so setting up can never lock the owner out.
// Emergency switch: Script Property LUMIO_AUTH_OFF = 1 turns the checks
// off (old behaviour) without redeploying.
// Repeated wrong PINs for one id are refused for 15 minutes (CacheService),
// so the 10,000 possible PINs cannot be tried one after another.
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

function authOff_() { return String(PropertiesService.getScriptProperties().getProperty("LUMIO_AUTH_OFF") || "") === "1"; }

// Returns { role: "teacher"|"student"|"public", teacher?, student?, error? }
function whoIs_(e) {
  var p = (e && e.parameter) || {};
  if (authOff_()) return { role: "teacher", open: true };
  var teachers = readRows_(TEACHERS_SHEET, TEACHERS_COLUMNS);
  var anyTeacherPin = teachers.some(function (t) { return t.pinHash; });
  if (!anyTeacherPin) return { role: "teacher", open: true };
  if (p.tid) {
    if (isLocked_("t", p.tid)) return { role: "public", error: "locked" };
    var t = teachers.filter(function (x) { return x.id === p.tid; })[0];
    if (t && t.pinHash && p.th && t.pinHash === p.th) return { role: "teacher", teacher: t };
    noteFail_("t", p.tid);
    return { role: "public", error: "unauthorized" };
  }
  if (p.sid) {
    if (isLocked_("s", p.sid)) return { role: "public", error: "locked" };
    var rows = readRows_(ROSTER_SHEET, ROSTER_COLUMNS);
    var s = rows.filter(function (x) { return x.id === p.sid; })[0];
    if (s && s.pinHash && p.sh && s.pinHash === p.sh) return { role: "student", student: s, roster: rows };
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
function cleanText_(v, max) {
  return String(v == null ? "" : v).replace(/[<>]/g, "").slice(0, max || 200);
}

// ---- logins (public actions; answer only yes/no + the caller's own row) ----
function teacherLogin_(body) {
  var id = String(body.id || ""), hash = String(body.pinHash || "");
  if (!id || !hash) return { ok: false, error: "missing" };
  if (isLocked_("t", id)) return { ok: false, error: "locked" };
  var t = readRows_(TEACHERS_SHEET, TEACHERS_COLUMNS).filter(function (x) { return x.id === id; })[0];
  if (!t || !t.pinHash || t.pinHash !== hash) { noteFail_("t", id); return { ok: false, error: "no_match" }; }
  clearFails_("t", id);
  return { ok: true, teacher: t };
}
function studentLogin_(body) {
  var ident = String(body.identifier || "").trim(), hash = String(body.pinHash || "");
  if (!ident || !hash) return { ok: false, error: "missing" };
  if (isLocked_("s", ident)) return { ok: false, error: "locked" };
  var digits = ident.replace(/\D/g, "");
  var rows = readRows_(ROSTER_SHEET, ROSTER_COLUMNS);
  var gone = {};
  deletedIdsOfType_(["student"]).forEach(function (d) { gone[d.id] = true; });
  var phoneTail = function (ph) { var d = String(ph || "").replace(/\D/g, ""); return d.length >= 8 ? d.slice(-9) : d; };
  var s = rows.filter(function (r) {
    if (gone[r.id]) return false;
    if (String(r.loginCode || "") === ident) return true;
    if (digits.length >= 8 && r.phone && phoneTail(r.phone) === phoneTail(digits)) return true;
    return String(r.name || "").trim().toLowerCase() === ident.toLowerCase();
  }).filter(function (r) { return r.pinHash === hash; })[0];
  if (!s) { noteFail_("s", ident); return { ok: false, error: "no_match" }; }
  clearFails_("s", ident);
  if (String(s.approved) === "false") return { ok: false, error: "pending_approval" };
  return { ok: true, student: selfView_(s), teachers: publicTeachers_(), rewardCatalog: readRows_(REWARD_CATALOG_SHEET, REWARD_CATALOG_COLUMNS) };
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
  return { ok: true, exists: !!s, subscribed: !!(s && String(s.subscribed) !== "false") };
}
function registerStudent_(body) {
  var name = cleanText_(body.name, 60).trim(), phone = String(body.phone || "").replace(/\D/g, "").slice(0, 16), hash = String(body.pinHash || "");
  if (!name || phone.length < 6 || !/^[0-9a-f]{64}$|^fnv1a-/.test(hash)) return { ok: false, error: "missing" };
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var rows = readRows_(ROSTER_SHEET, ROSTER_COLUMNS);
    var existing = findByPhone_(rows, phone);
    if (existing) return { ok: false, error: "exists", subscribed: String(existing.subscribed) !== "false" };
    var code;
    do { code = String(Math.floor(100000 + Math.random() * 900000)); }
    while (rows.some(function (r) { return String(r.loginCode) === code; }));
    var now = new Date().toISOString();
    var avatars = ["🦊", "🐼", "🐯", "🐸", "🦁", "🐨", "🐵", "🐰"];
    var row = {
      id: "s_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      name: name, level: "", avatar: avatars[Math.floor(Math.random() * avatars.length)],
      pinHash: hash, loginCode: code, teacherId: "", createdAt: now, updatedAt: now, phone: phone,
      age: body.age ? cleanText_(body.age, 3) : "", paid: false, approved: false, subscribed: false,
      amountPaid: 0, currency: "", levelsPurchased: 0, rewardPoints: 0, bonusHours: 0, sessionsRemaining: 0,
      pointsLog: "[]", redemptions: "[]", notes: "[]", messages: "[]", referrals: "[]", tags: "placement-test",
    };
    rows.push(row);
    writeRows_(ROSTER_SHEET, ROSTER_COLUMNS, rows);
    return { ok: true, student: { id: row.id, name: row.name, loginCode: code } };
  } finally { lock.releaseLock(); }
}
// Only a self-registered account that the teacher has NOT approved yet can
// be touched from the public test, and only its level and age.
function placementUpdate_(body) {
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var rows = readRows_(ROSTER_SHEET, ROSTER_COLUMNS);
    var s = findByPhone_(rows, body.phone);
    if (!s || String(s.approved) !== "false") return { ok: false, error: "not_allowed" };
    var lv = String(body.level || "");
    if (lv && /^(pre-a|level[1-9])$/.test(lv)) s.level = lv;
    if (body.age !== undefined && body.age !== "" && isFinite(Number(body.age))) s.age = Number(body.age);
    touch_(s, ["level", "age"], new Date().toISOString());
    writeRows_(ROSTER_SHEET, ROSTER_COLUMNS, rows);
    return { ok: true };
  } finally { lock.releaseLock(); }
}
function addLead_(body) {
  var l = body && body.lead;
  if (!l) return { ok: false, error: "missing" };
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var rows = readRows_(LEADS_SHEET, LEADS_COLUMNS);
    var id = cleanText_(l.id, 60) || ("lead_" + Date.now().toString(36));
    if (rows.some(function (r) { return r.id === id; })) return { ok: true, duplicate: true };
    var now = new Date().toISOString();
    rows.push({
      id: id, name: cleanText_(l.name, 60), phone: String(l.phone || "").replace(/\D/g, "").slice(0, 16),
      age: isFinite(Number(l.age)) && l.age !== null && l.age !== "" ? Number(l.age) : "",
      suggestedLevel: /^(pre-a|level[1-9])$/.test(String(l.suggestedLevel || "")) ? l.suggestedLevel : "",
      testScore: isFinite(Number(l.testScore)) ? Number(l.testScore) : "", testTotal: isFinite(Number(l.testTotal)) ? Number(l.testTotal) : "",
      status: "new", notes: cleanText_(l.notes, 500), createdAt: now, updatedAt: now,
    });
    writeRows_(LEADS_SHEET, LEADS_COLUMNS, rows);
    return { ok: true };
  } finally { lock.releaseLock(); }
}

// ---- student-scoped views of the shared tabs ----
function studentRoster_(who) {
  var me = who.student;
  return { ok: true, students: [selfView_(me)], teachers: publicTeachers_(),
    rewardCatalog: readRows_(REWARD_CATALOG_SHEET, REWARD_CATALOG_COLUMNS), deletedIds: [] };
}
function inClass_(c, me) {
  return (c.students || []).some(function (x) { return x && ((x.studentId && x.studentId === me.id) || (!x.studentId && x.studentName === me.name) || x.studentName === me.name); });
}
// A student sees their own classes in full (classmates by name only) and,
// for booking, every other class as anonymous seats: level, lesson, slot,
// teacher and how many seats are taken -- never another child's name,
// attendance, grade, notes or the meeting link. Ratings stay (as bare
// stars) because the booking screen shows each teacher's average.
function seatFor_(x, me) {
  if (!x) return x;
  var mine = (x.studentId && x.studentId === me.id) || x.studentName === me.name;
  return mine ? x : { studentName: "", studentId: null, teacherRatingStars: x.teacherRatingStars || null };
}
function studentClassView_(c, me) {
  var copy = {};
  Object.keys(c).forEach(function (k) { copy[k] = c[k]; });
  delete copy.fieldTimes;   // its seat tombstones name other children; student devices don't merge
  if (inClass_(c, me)) {
    copy.students = (c.students || []).map(function (x) {
      if (!x) return x;
      var mine = (x.studentId && x.studentId === me.id) || x.studentName === me.name;
      return mine ? x : { studentName: x.studentName, studentId: x.studentId };
    });
  } else {
    copy.students = (c.students || []).map(function (x) { return seatFor_(x, me); });
    copy.meetingLink = ""; copy.notes = ""; copy.sessionNotes = "";
  }
  return copy;
}
function studentSchedule_(who) {
  var me = who.student;
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
function ownRows_(rows, me) { return rows.filter(function (r) { return r.studentName === me.name; }); }
function ownTree_(tree, me) { var out = {}; if (tree && tree[me.name]) out[me.name] = tree[me.name]; return out; }

// ---------- HTTP entry points ----------

// ---------- access key ----------
// Script Property LUMIO_API_KEY (Project Settings -> Script Properties)
// must match the ?key= every Lumio page sends (LUMIO_API_KEY constant in
// js/lumio-profiles.js and friends). While the property is NOT set the
// check is skipped, so deploying this version can never lock the site
// out; set the property right after deploying to turn the lock on.
// [max requests, per seconds] for the public actions, counted across the whole site
var PUBLIC_LIMITS_ = {
  teacherLogin: [120, 600], studentLogin: [300, 600], checkPhone: [60, 600], registerStudent: [30, 600],
  placementUpdate: [60, 600], addLead: [40, 600], pushProTestResult: [40, 600], writingFeedback: [60, 600]
};
function throttleOk_(name, max, windowS) {
  try {
    var c = CacheService.getScriptCache(), slot = Math.floor(Date.now() / 1000 / windowS), k = "rl_" + name + "_" + slot;
    var n = Number(c.get(k) || 0) + 1;
    c.put(k, String(n), windowS + 60);
    return n <= max;
  } catch (e) { return true; }   // never block real users because the cache hiccuped
}
function keyOk_(e) {
  var want = PropertiesService.getScriptProperties().getProperty("LUMIO_API_KEY");
  if (!want) return true;
  var got = (e && e.parameter) ? e.parameter.key : "";
  return got === want;
}

function denied_(who) { return jsonResponse_({ ok: false, error: who.error || "unauthorized" }); }

function doGet(e) {
  try {
    if (!keyOk_(e)) return jsonResponse_({ ok: false, error: "unauthorized" });
    var action = (e && e.parameter) ? e.parameter.action : null;
    // Lets a page tell this version apart from older deployments.
    if (action === "version") return jsonResponse_({ ok: true, version: 11, auth: true, merge: true, studentPhoto: true, mainOwner: true, hardened: true });
    var who = whoIs_(e);
    if (who.error) return denied_(who);
    if (who.role === "student") {
      if (action === "pullRoster") return jsonResponse_(studentRoster_(who));
      if (action === "pullScheduleV2") return jsonResponse_(studentSchedule_(who));
      if (action === "pullProgress") return jsonResponse_({ ok: true, rows: ownRows_(pullProgress_().rows, who.student) });
      if (action === "pullHomework") return jsonResponse_({ ok: true, rows: ownRows_(pullHomework_().rows, who.student) });
      return denied_(who);
    }
    if (who.role === "public") {
      // The teacher portal needs the list of teachers to show before
      // anyone has signed in -- names and avatars only.
      if (action === "pullRoster") return jsonResponse_({ ok: true, students: [], teachers: publicTeachers_(), rewardCatalog: [], deletedIds: deletedIdsOfType_(["teacher"]) });
      if (action) return denied_(who);
      return jsonResponse_({ ok: true, message: "Lumio sync backend is running." });
    }
    if (action === "pullRoster") return jsonResponse_(pullRoster_(who));
    if (action === "pullScheduleV2") return jsonResponse_(pullScheduleV2_());
    if (action === "pullProgress") return jsonResponse_(pullProgress_());
    if (action === "pullHomework") return jsonResponse_(pullHomework_());
    if (action === "pullLeads") return jsonResponse_(pullLeads_());
    if (action === "pullProAdmins") return callerIsOwner_(who) ? jsonResponse_(pullProAdmins_()) : denied_({});
    if (action === "pullProTestResults") return jsonResponse_(pullProTestResults_());
    return jsonResponse_({ ok: true, message: "Lumio sync backend is running." });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err) });
  }
}

function doPost(e) {
  try {
    if (!keyOk_(e)) return jsonResponse_({ ok: false, error: "unauthorized" });
    var action = (e && e.parameter) ? e.parameter.action : null;
    var body = {};
    if (e && e.postData && e.postData.contents) body = JSON.parse(e.postData.contents);
    // Public actions: the logins and the placement test. v11: each has a site-wide rate limit
    // (Apps Script can't see IP addresses), generous for real use, tight enough to stop a script.
    var lim = PUBLIC_LIMITS_[action];
    if (lim && !throttleOk_(action, lim[0], lim[1])) return jsonResponse_({ ok: false, error: "busy", message: "Too many requests right now. Please wait a few minutes and try again." });
    if (action === "teacherLogin") return jsonResponse_(teacherLogin_(body));
    if (action === "studentLogin") return jsonResponse_(studentLogin_(body));
    if (action === "checkPhone") return jsonResponse_(checkPhone_(body));
    if (action === "registerStudent") return jsonResponse_(registerStudent_(body));
    if (action === "placementUpdate") return jsonResponse_(placementUpdate_(body));
    if (action === "addLead") return jsonResponse_(addLead_(body));
    if (action === "pushProTestResult") return jsonResponse_(pushProTestResult_(body));
    if (action === "writingFeedback") return jsonResponse_(writingFeedback_(body));
    var who = whoIs_(e);
    if (who.error) return denied_(who);
    if (who.role === "student") {
      var me = who.student;
      if (action === "pushStudentPatch") {
        if (!body.patch || body.patch.id !== me.id) return denied_({});
        var out = pushStudentPatch_(body);
        if (out && out.student) out.student = selfView_(out.student);
        return jsonResponse_(out);
      }
      // Booking: only themselves, and the answer only shows their own seat.
      if (action === "bookSlot") {
        if (!body.student || (body.student.studentId && body.student.studentId !== me.id)) return denied_({});
        body.student = { studentId: me.id, studentName: me.name };
        var booked = bookSlot_(body);
        if (booked && booked.cls) booked.cls = studentClassView_(booked.cls, me);
        return jsonResponse_(booked);
      }
      if (action === "cancelSlot") {
        if (normStudent_(body.studentName) !== normStudent_(me.name)) return denied_({});
        var cancelled = cancelSlot_(body);
        if (cancelled && cancelled.cls) cancelled.cls = studentClassView_(cancelled.cls, me);
        return jsonResponse_(cancelled);
      }
      if (action === "rateClass") {
        var rated = rateClass_(body, { studentId: me.id, studentName: me.name });
        if (rated && rated.cls) rated.cls = studentClassView_(rated.cls, me);
        return jsonResponse_(rated);
      }
      if (action === "pushProgress") return jsonResponse_(pushProgress_({ progress: ownTree_(body.progress, me) }));
      if (action === "pushHomework") return jsonResponse_(pushHomework_({ homework: ownTree_(body.homework, me) }));
      return denied_({});
    }
    if (who.role !== "teacher") return denied_({});
    if (action === "pushRoster") return jsonResponse_(pushRoster_(body, who));
    if (action === "pushStudentPatch") return jsonResponse_(pushStudentPatch_(body));
    if (action === "pushScheduleV2") return jsonResponse_(pushScheduleV2_(body));
    if (action === "bookSlot") return jsonResponse_(bookSlot_(body));
    if (action === "cancelSlot") return jsonResponse_(cancelSlot_(body));
    if (action === "rateClass") return jsonResponse_(rateClass_(body, { studentId: body.studentId, studentName: body.studentName }));
    if (action === "pushProgress") return jsonResponse_(pushProgress_(body));
    if (action === "pushHomework") return jsonResponse_(pushHomework_(body));
    if (action === "pushLeads") return jsonResponse_(pushLeads_(body));
    if (action === "pushProAdmins") return callerIsOwner_(who) ? jsonResponse_(pushProAdmins_(body)) : denied_({});
    if (action === "clearProTestResults") return callerIsOwner_(who) ? jsonResponse_(clearProTestResults_()) : denied_({});
    return jsonResponse_({ ok: false, error: "Unknown action: " + action });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err) });
  }
}
