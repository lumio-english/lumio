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
var TEACHERS_COLUMNS = ["id", "name", "avatar", "pinHash", "isOwner", "createdAt", "updatedAt"];

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
  "cohort"   // batch (join month); was missing, so every sync erased it
];

var REWARD_CATALOG_SHEET = "RewardCatalog";
var REWARD_CATALOG_COLUMNS = ["id", "label", "cost"];

var DELETED_IDS_SHEET = "DeletedIds";
var DELETED_IDS_COLUMNS = ["id", "type", "deletedAt"];

var SCHEDULE_SHEET = "Schedule";
var SCHEDULE_COLUMNS = [
  "id", "teacherId", "teacherName", "date", "startTime", "durationMinutes",
  "level", "cohort", "group", "lessonNumber", "meetingLink", "notes",
  "sessionNotes", "status", "patternId", "studentsJson", "createdAt", "updatedAt"
];

var PATTERNS_SHEET = "SchedulePatterns";
var PATTERNS_COLUMNS = [
  "id", "teacherId", "teacherName", "dayOfWeek", "startTime", "durationMinutes",
  "level", "cohort", "group", "notes", "meetingLink", "studentsJson",
  "startDate", "endDate", "lessonStart", "active", "createdAt", "updatedAt"
];

var BLOCKED_DATES_SHEET = "BlockedDates";
var BLOCKED_DATES_COLUMNS = ["date", "label"];

var PROGRESS_SHEET = "Progress";
var PROGRESS_COLUMNS = ["studentName", "level", "lesson", "stars", "score", "total", "date"];
// Interactive homework results (drawings stay on the student's device).
var HOMEWORK_SHEET = "Homework";
var HOMEWORK_COLUMNS = ["studentName", "level", "lesson", "stars", "score", "total", "said", "saidTotal", "hasDrawing", "date"];

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
  var lastCol = sheet.getLastColumn();
  var existingHeader = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
  if (existingHeader.length < columns.length) {
    sheet.getRange(1, existingHeader.length + 1, 1, columns.length - existingHeader.length)
      .setValues([columns.slice(existingHeader.length)]);
  }
  return sheet;
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
  var values = sheet.getRange(2, 1, lastRow - 1, columns.length).getValues();
  return values
    .filter(function (row) { return row.some(function (cell) { return cell !== "" && cell !== null; }); })
    .map(function (row) {
      var obj = {};
      columns.forEach(function (col, i) { obj[col] = cellToString_(col, row[i]); });
      return obj;
    });
}

function writeRows_(name, columns, rows) {
  var sheet = getOrCreateSheet_(name, columns);
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, columns.length).clearContent();
  }
  if (!rows.length) return;
  var values = rows.map(function (r) {
    return columns.map(function (col) {
      var v = r[col];
      if (v === undefined || v === null) return "";
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
function pushStudentPatch_(body) {
  var patch = body && body.patch;
  if (!patch || !patch.id) return { ok: false, error: "missing patch.id" };
  var rows = readRows_(ROSTER_SHEET, ROSTER_COLUMNS);
  var row = null;
  for (var i = 0; i < rows.length; i++) if (rows[i].id === patch.id) { row = rows[i]; break; }
  if (!row) return { ok: false, error: "student not found" };
  var parseArr = function (v) { try { var a = JSON.parse(v || "[]"); return Array.isArray(a) ? a : []; } catch (e) { return []; } };
  var changed = false;

  if (typeof patch.avatar === "string" && patch.avatar && patch.avatar !== row.avatar) { row.avatar = patch.avatar; changed = true; }

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
      changed = true;
    }
  }

  if (patch.pendingDeletion !== undefined) {
    var pd = patch.pendingDeletion === true || patch.pendingDeletion === "true";
    if (String(pd) !== String(row.pendingDeletion === true || row.pendingDeletion === "true")) { row.pendingDeletion = pd; changed = true; }
  }
  if (patch.deletionConfirmed !== undefined) {
    var dc = patch.deletionConfirmed === true || patch.deletionConfirmed === "true";
    if (String(dc) !== String(row.deletionConfirmed === true || row.deletionConfirmed === "true")) { row.deletionConfirmed = dc; changed = true; }
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
      changed = true;
    }
  }

  if (changed) {
    row.updatedAt = new Date().toISOString();
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
  incoming.forEach(function (r) {
    if (!r || !r.id || seen[r.id]) return;
    seen[r.id] = true;
    existing.push({ id: r.id, type: r.type || "student", deletedAt: r.deletedAt || new Date().toISOString() });
    added++;
  });
  if (added) writeRows_(DELETED_IDS_SHEET, DELETED_IDS_COLUMNS, existing);
}

function pullRoster_() {
  return {
    students: readRows_(ROSTER_SHEET, ROSTER_COLUMNS),
    teachers: readRows_(TEACHERS_SHEET, TEACHERS_COLUMNS),
    rewardCatalog: readRows_(REWARD_CATALOG_SHEET, REWARD_CATALOG_COLUMNS),
    deletedIds: deletedIdsOfType_(["student", "teacher"]),
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
        seats.forEach(function (st) { if (st && ((rn.id && st.studentId === rn.id) || st.studentName === rn.from)) { st.studentName = rn.to; hit = true; } });
        if (hit) { r.studentsJson = JSON.stringify(seats); r.updatedAt = now; changed = true; }
      });
      if (changed) { writeRows_(t[0], t[1], rows); done++; }
    });
  });
  return done;
}

function pushRoster_(body) {
  if (Array.isArray(body.students)) writeRows_(ROSTER_SHEET, ROSTER_COLUMNS, keepPinHashes_(body.students, ROSTER_SHEET, ROSTER_COLUMNS));
  if (Array.isArray(body.teachers)) writeRows_(TEACHERS_SHEET, TEACHERS_COLUMNS, keepPinHashes_(body.teachers, TEACHERS_SHEET, TEACHERS_COLUMNS));
  if (Array.isArray(body.rewardCatalog)) writeRows_(REWARD_CATALOG_SHEET, REWARD_CATALOG_COLUMNS, body.rewardCatalog);
  mergeDeletedIds_(body.deletedIds);
  var renamed = applyRenames_(body.renames);
  return { ok: true, renamed: renamed };
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
  return c;
}

function pullScheduleV2_() {
  return {
    classes: readRows_(SCHEDULE_SHEET, SCHEDULE_COLUMNS).map(rowToClass_),
    patterns: readRows_(PATTERNS_SHEET, PATTERNS_COLUMNS).map(rowToPattern_),
    blockedDates: readRows_(BLOCKED_DATES_SHEET, BLOCKED_DATES_COLUMNS),
    deletedIds: deletedIdsOfType_(["class", "pattern"]),
  };
}

function pushScheduleV2_(body) {
  if (Array.isArray(body.classes)) writeRows_(SCHEDULE_SHEET, SCHEDULE_COLUMNS, body.classes.map(classToRow_));
  if (Array.isArray(body.patterns)) writeRows_(PATTERNS_SHEET, PATTERNS_COLUMNS, body.patterns.map(patternToRow_));
  if (Array.isArray(body.blockedDates)) {
    var rows = body.blockedDates.map(function (b) {
      return typeof b === "string" ? { date: b, label: "" } : { date: b.date, label: b.label || "" };
    });
    writeRows_(BLOCKED_DATES_SHEET, BLOCKED_DATES_COLUMNS, rows);
  }
  mergeDeletedIds_(body.deletedIds);
  return { ok: true };
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
  return p;
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

function pushLeads_(body) {
  if (Array.isArray(body.leads)) writeRows_(LEADS_SHEET, LEADS_COLUMNS, body.leads);
  mergeDeletedIds_(body.deletedIds);
  return { ok: true };
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
        sheet.getRange(i + 2, linkCol).setValue(joinUrl);
        sheet.getRange(i + 2, updatedCol).setValue(new Date().toISOString());
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
    return { id: t.id, name: t.name, avatar: t.avatar, isOwner: t.isOwner, updatedAt: t.updatedAt };
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
    if (lv && /^(pre-a|level[1-6])$/.test(lv)) s.level = lv;
    if (body.age !== undefined && body.age !== "" && isFinite(Number(body.age))) s.age = Number(body.age);
    s.updatedAt = new Date().toISOString();
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
      suggestedLevel: /^(pre-a|level[1-6])$/.test(String(l.suggestedLevel || "")) ? l.suggestedLevel : "",
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
// A student sees the classes they are booked into. Classmates appear by
// name only (no attendance, grades or notes of anyone else).
function studentSchedule_(who) {
  var me = who.student;
  var full = pullScheduleV2_();
  var trim = function (c) {
    var copy = {};
    Object.keys(c).forEach(function (k) { copy[k] = c[k]; });
    copy.students = (c.students || []).map(function (x) {
      if (!x) return x;
      var mine = (x.studentId && x.studentId === me.id) || x.studentName === me.name;
      return mine ? x : { studentName: x.studentName, studentId: x.studentId };
    });
    return copy;
  };
  return { ok: true,
    classes: full.classes.filter(function (c) { return inClass_(c, me); }).map(trim),
    patterns: full.patterns.filter(function (p) { return inClass_(p, me); }).map(trim),
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
    if (action === "version") return jsonResponse_({ ok: true, version: 7, auth: true });
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
    if (action === "pullRoster") return jsonResponse_(pullRoster_());
    if (action === "pullScheduleV2") return jsonResponse_(pullScheduleV2_());
    if (action === "pullProgress") return jsonResponse_(pullProgress_());
    if (action === "pullHomework") return jsonResponse_(pullHomework_());
    if (action === "pullLeads") return jsonResponse_(pullLeads_());
    if (action === "pullProAdmins") return jsonResponse_(pullProAdmins_());
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
    // Public actions: the logins and the placement test.
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
      if (action === "pushProgress") return jsonResponse_(pushProgress_({ progress: ownTree_(body.progress, me) }));
      if (action === "pushHomework") return jsonResponse_(pushHomework_({ homework: ownTree_(body.homework, me) }));
      return denied_({});
    }
    if (who.role !== "teacher") return denied_({});
    if (action === "pushRoster") return jsonResponse_(pushRoster_(body));
    if (action === "pushStudentPatch") return jsonResponse_(pushStudentPatch_(body));
    if (action === "pushScheduleV2") return jsonResponse_(pushScheduleV2_(body));
    if (action === "pushProgress") return jsonResponse_(pushProgress_(body));
    if (action === "pushHomework") return jsonResponse_(pushHomework_(body));
    if (action === "pushLeads") return jsonResponse_(pushLeads_(body));
    if (action === "pushProAdmins") return jsonResponse_(pushProAdmins_(body));
    if (action === "clearProTestResults") return jsonResponse_(clearProTestResults_());
    return jsonResponse_({ ok: false, error: "Unknown action: " + action });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err) });
  }
}
