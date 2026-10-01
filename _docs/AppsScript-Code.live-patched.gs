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
  "referrals", "referralsUpdatedAt"
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
    var tz = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();
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
    [LEADS_SHEET, LEADS_COLUMNS], [REWARD_CATALOG_SHEET, REWARD_CATALOG_COLUMNS],
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

function pullRoster_() {
  return {
    students: readRows_(ROSTER_SHEET, ROSTER_COLUMNS),
    teachers: readRows_(TEACHERS_SHEET, TEACHERS_COLUMNS),
    rewardCatalog: readRows_(REWARD_CATALOG_SHEET, REWARD_CATALOG_COLUMNS),
    deletedIds: readRows_(DELETED_IDS_SHEET, DELETED_IDS_COLUMNS),
  };
}

function pushRoster_(body) {
  if (Array.isArray(body.students)) writeRows_(ROSTER_SHEET, ROSTER_COLUMNS, body.students);
  if (Array.isArray(body.teachers)) writeRows_(TEACHERS_SHEET, TEACHERS_COLUMNS, body.teachers);
  if (Array.isArray(body.rewardCatalog)) writeRows_(REWARD_CATALOG_SHEET, REWARD_CATALOG_COLUMNS, body.rewardCatalog);
  if (Array.isArray(body.deletedIds)) writeRows_(DELETED_IDS_SHEET, DELETED_IDS_COLUMNS, body.deletedIds);
  return { ok: true };
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

function pushProgress_(body) {
  var rows = [];
  var progress = body.progress || {};
  Object.keys(progress).forEach(function (studentName) {
    var levels = progress[studentName] || {};
    Object.keys(levels).forEach(function (level) {
      var lessons = levels[level] || {};
      Object.keys(lessons).forEach(function (lessonId) {
        var r = lessons[lessonId] || {};
        rows.push({
          studentName: studentName, level: level, lesson: lessonId,
          stars: r.stars || 0, score: r.score || 0, total: r.total || 0, date: r.date || "",
        });
      });
    });
  });
  writeRows_(PROGRESS_SHEET, PROGRESS_COLUMNS, rows);
  return { ok: true, rows: rows.length };
}

function pullProgress_() {
  return { rows: readRows_(PROGRESS_SHEET, PROGRESS_COLUMNS) };
}

// ---------- leads ----------

function pullLeads_() {
  return { leads: readRows_(LEADS_SHEET, LEADS_COLUMNS) };
}

function pushLeads_(body) {
  if (Array.isArray(body.leads)) writeRows_(LEADS_SHEET, LEADS_COLUMNS, body.leads);
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
  var id = result.student_id + "_" + result.timestamp;
  var existing = readRows_(PRO_TEST_RESULTS_SHEET, PRO_TEST_RESULTS_COLUMNS);
  var alreadyThere = existing.some(function (row) { return row.id === id; });
  if (!alreadyThere) {
    existing.push({
      id: id, name: result.name || "", student_id: result.student_id || "",
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
    var startDate = new Date(row[dateCol - 1] + "T" + row[startCol - 1] + ":00");
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
  var tz = Session.getScriptTimeZone();
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

// ---------- HTTP entry points ----------

function doGet(e) {
  try {
    var action = (e && e.parameter) ? e.parameter.action : null;
    if (action === "pullRoster") return jsonResponse_(pullRoster_());
    if (action === "pullScheduleV2") return jsonResponse_(pullScheduleV2_());
    if (action === "pullProgress") return jsonResponse_(pullProgress_());
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
    var action = (e && e.parameter) ? e.parameter.action : null;
    var body = {};
    if (e && e.postData && e.postData.contents) body = JSON.parse(e.postData.contents);
    if (action === "pushRoster") return jsonResponse_(pushRoster_(body));
    if (action === "pushScheduleV2") return jsonResponse_(pushScheduleV2_(body));
    if (action === "pushProgress") return jsonResponse_(pushProgress_(body));
    if (action === "pushLeads") return jsonResponse_(pushLeads_(body));
    if (action === "pushProAdmins") return jsonResponse_(pushProAdmins_(body));
    if (action === "pushProTestResult") return jsonResponse_(pushProTestResult_(body));
    if (action === "clearProTestResults") return jsonResponse_(clearProTestResults_());
    if (action === "writingFeedback") return jsonResponse_(writingFeedback_(body));
    return jsonResponse_({ ok: false, error: "Unknown action: " + action });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err) });
  }
}