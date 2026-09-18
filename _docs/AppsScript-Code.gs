/**
 * Lumio English — Sync backend (Google Apps Script)
 *
 * What this does: gives your Lumio site a shared Google Sheet backend for
 * the roster (students + teachers), the class schedule, lesson progress,
 * and leads, so every teacher's device sees the same data instead of
 * everything living only in one browser's storage. It also auto-creates
 * a Zoom meeting for each booked class 2 hours before it starts, so
 * teachers never have to paste in a meeting link by hand — see the
 * "ZOOM AUTO-LINK GENERATION" section near the bottom — and it powers
 * the professional dashboard's "Get Feedback" AI writing review button
 * (see the "AI WRITING FEEDBACK" section) from this same URL, so there's
 * only ever one Apps Script project and one deployment URL to manage.
 *
 * Setup: see SETUP-GOOGLE-SHEETS-SYNC.md for the full walkthrough of the
 * roster/schedule/progress sync. Short version:
 *   1. Create a new Google Sheet.
 *   2. Extensions -> Apps Script, delete the placeholder code, paste this
 *      whole file in instead.
 *   3. For AI writing feedback: gear icon (Project Settings) -> Script
 *      Properties -> add GROQ_API_KEY with your key from console.groq.com.
 *      Then run testGroqAuth once from the function dropdown and click
 *      Allow on the permission popup -- this grants the one-time
 *      authorization for calling Groq's API.
 *   4. Deploy -> New deployment -> type "Web app".
 *        Execute as: Me
 *        Who has access: Anyone
 *   5. Copy the Web App URL it gives you. Paste it into Lumio's teacher
 *      dashboard -> Students -> Sync settings -> Save, then "Sync now" --
 *      AND into lumio-pro-dashboard.html's AI_FEEDBACK_URL near the top
 *      of its script. Same URL, both places.
 *
 * For the Zoom automation on top of that, see the setup steps in the
 * comment above autoGenerateZoomLinks() below — you'll need a free Zoom
 * "Server-to-Server OAuth" app and a one-time trigger.
 *
 * This script creates its own sheet tabs (Teachers, Roster, Schedule,
 * Progress, Leads, ProDashboardAdmins, DeletedIds) the first time it
 * runs, with header rows, so you don't need to set anything up inside
 * the Sheet itself.
 *
 * Security note: student/teacher PINs are only ever sent here as a hash
 * (pinHash), never in plain text. Zoom and Groq credentials are stored in
 * this script's Script Properties (Project Settings -> Script
 * Properties), never in the Sheet or in the site's code, so they're
 * never exposed to a browser.
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
  // Student inbox (JSON array) + the "teacher asked to delete this
  // account, student hasn't answered / has confirmed" flags -- both
  // travel with the student record so the two devices involved can
  // see each other's side of the exchange through the normal sync.
  "messages", "pendingDeletion", "deletionConfirmed"
];

// Reward catalog is shared across all students (teacher-managed list of
// extra redeemable items), not per-student -- its own small sheet.
var REWARD_CATALOG_SHEET = "RewardCatalog";
var REWARD_CATALOG_COLUMNS = ["id", "label", "cost"];

// Tombstones for deleted students/teachers. Without this, a deletion
// only ever lived in the deleting device's OWN localStorage -- it kept
// that specific device from re-adding the record on its next sync, but
// never told any OTHER device the record was gone. A second device that
// already had the record cached locally from before the deletion would
// keep it forever: the roster/teacher pull-merge is deliberately
// additive (a missing-from-remote record is never inferred as deleted,
// since a device with a not-yet-pushed new record must not have it
// wiped out by an unrelated pull), so nothing short of an explicit,
// shared tombstone list can make a deletion actually reach every
// device. This sheet is that list: whichever device deletes something
// pushes the id here, and every other device's own pull now also learns
// about it and can prune its local copy in turn.
var DELETED_IDS_SHEET = "DeletedIds";
var DELETED_IDS_COLUMNS = ["id", "type", "deletedAt"];

// V2 schedule schema — one row per group class session. `studentsJson` is
// the class's `students` array (see js/lumio-schedule.js) serialized as a
// JSON string, since a Sheet row can't hold a nested array directly. This
// matches what the site's LumioSchedule.syncNow() actually pushes/pulls
// (?action=pushScheduleV2 / pullScheduleV2) — the old v1 columns (one
// row per single student, no meetingLink/lessonNumber/group) are gone.
var SCHEDULE_SHEET = "Schedule";
var SCHEDULE_COLUMNS = [
  "id", "teacherId", "teacherName", "date", "startTime", "durationMinutes",
  "level", "cohort", "group", "lessonNumber", "meetingLink", "notes",
  "sessionNotes", "status", "patternId", "studentsJson", "createdAt", "updatedAt"
];

// Fixed weekly schedules ("this group, every Tuesday at 5pm") — see the
// FIXED SCHEDULES section of js/lumio-schedule.js for how these generate
// real Schedule rows. studentsJson is that pattern's `students` array
// serialized the same way as a class's.
var PATTERNS_SHEET = "SchedulePatterns";
var PATTERNS_COLUMNS = [
  "id", "teacherId", "teacherName", "dayOfWeek", "startTime", "durationMinutes",
  "level", "cohort", "group", "notes", "meetingLink", "studentsJson",
  "startDate", "endDate", "lessonStart", "active", "createdAt", "updatedAt"
];

// Holidays / days off the fixed-schedule generator should never book
// into. One row per blocked date.
var BLOCKED_DATES_SHEET = "BlockedDates";
var BLOCKED_DATES_COLUMNS = ["date", "label"];

var PROGRESS_SHEET = "Progress";
var PROGRESS_COLUMNS = ["studentName", "level", "lesson", "stars", "score", "total", "date"];

var LEADS_SHEET = "Leads";
var LEADS_COLUMNS = [
  "id", "name", "phone", "age", "suggestedLevel", "testScore", "testTotal",
  "status", "notes", "createdAt", "updatedAt"
];

// Admin accounts for lumio-pro-dashboard.html — its own login system,
// unrelated to student/teacher roster accounts. Stored as plain text,
// same as that dashboard's original standalone login.
var PRO_ADMINS_SHEET = "ProDashboardAdmins";
var PRO_ADMINS_COLUMNS = ["username", "password", "updatedAt"];

// Professional placement test results (lumio-pro-test.html ->
// lumio-pro-dashboard.html). Previously these lived ONLY in the
// browser's localStorage on whichever device the test was taken on,
// with the dashboard reading that same local copy and nothing else --
// no server backup at all. A cleared browser (cache/cookies wiped, a
// different device, "Clear All" on the dashboard) meant the result was
// simply gone, no way back. dataJson holds the full result record
// (scores, every answer, writing text) as one serialized blob, the
// same pattern already used for Schedule/SchedulePatterns' nested
// `students` arrays -- a submission's shape is too deeply nested for a
// flat column schema to be worth maintaining.
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

function readRows_(name, columns) {
  var sheet = getOrCreateSheet_(name, columns);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  var values = sheet.getRange(2, 1, lastRow - 1, columns.length).getValues();
  return values
    .filter(function (row) { return row.some(function (cell) { return cell !== "" && cell !== null; }); })
    .map(function (row) {
      var obj = {};
      columns.forEach(function (col, i) { obj[col] = row[i]; });
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
      return v === undefined || v === null ? "" : v;
    });
  });
  sheet.getRange(2, 1, values.length, columns.length).setValues(values);
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
  // The client always pulls this same list, unions it with whatever it
  // knows locally, and only then pushes -- so a full-replace write here
  // (matching writeRows_'s usual semantics) is safe and can only ever
  // grow this list, never accidentally shrink it back down.
  if (Array.isArray(body.deletedIds)) writeRows_(DELETED_IDS_SHEET, DELETED_IDS_COLUMNS, body.deletedIds);
  return { ok: true };
}

// ---------- schedule (V2) ----------
// The site's `classes` array has a nested `students` array per class;
// here it's flattened to `studentsJson` for storage and expanded back
// out on the way to the client, so the Sheet <-> LumioSchedule shape
// round-trips exactly.

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
          studentName: studentName,
          level: level,
          lesson: lessonId,
          stars: r.stars || 0,
          score: r.score || 0,
          total: r.total || 0,
          date: r.date || "",
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

// Additive, not a full replace like writeRows_'s usual callers -- each
// test submission happens independently on whatever device the student
// used, so pushing must never overwrite results some OTHER device has
// already saved to the Sheet. Reads what's there, skips it if this
// exact result (by id) already exists (a retry after a flaky network
// response shouldn't duplicate it), appends, writes the full list back.
function pushProTestResult_(body) {
  var result = body.result;
  if (!result) return { ok: false, error: "No result provided." };
  var id = result.student_id + "_" + result.timestamp;
  var existing = readRows_(PRO_TEST_RESULTS_SHEET, PRO_TEST_RESULTS_COLUMNS);
  var alreadyThere = existing.some(function (row) { return row.id === id; });
  if (!alreadyThere) {
    existing.push({
      id: id,
      name: result.name || "",
      student_id: result.student_id || "",
      timestamp: result.timestamp || "",
      dataJson: JSON.stringify(result),
    });
    writeRows_(PRO_TEST_RESULTS_SHEET, PRO_TEST_RESULTS_COLUMNS, existing);
  }
  return { ok: true };
}

// The dashboard's "Clear All" button -- an explicit, confirmed, full
// wipe, unlike the additive push above. Clears the shared copy too, so
// a deliberate clear doesn't leave stale results reappearing from the
// Sheet on the next sync.
function clearProTestResults_() {
  writeRows_(PRO_TEST_RESULTS_SHEET, PRO_TEST_RESULTS_COLUMNS, []);
  return { ok: true };
}

// ═══════════════════════════════════════════════════════════════════
//  ZOOM AUTO-LINK GENERATION
// ═══════════════════════════════════════════════════════════════════
//
// Goal: a teacher books a class with a date/time and never has to touch
// Zoom themselves. Exactly ~2 hours before each class starts, this
// script creates a real Zoom meeting via the Zoom API and writes the
// join URL into that class's `meetingLink` — which both the teacher
// dashboard and student.html already display automatically once it's
// synced, since that field already existed in the schema.
//
// ---- One-time setup (you do this once) ----
//
// 1. Create a Zoom "Server-to-Server OAuth" app (free, no user login
//    flow needed — this is the right app type for a script, not
//    "OAuth" or "JWT" which Zoom has deprecated):
//      Zoom App Marketplace -> Develop -> Build App -> Server-to-Server OAuth
//    Add a "create meetings" scope for your plan (Zoom's exact scope
//    name varies — meeting:write:admin or meeting:write). Activate the
//    app. Copy the Account ID, Client ID, and Client Secret it gives you.
//
// 2. In this Apps Script project: Project Settings (gear icon) -> Script
//    Properties -> add these four:
//      ZOOM_ACCOUNT_ID     = <your Account ID>
//      ZOOM_CLIENT_ID      = <your Client ID>
//      ZOOM_CLIENT_SECRET  = <your Client Secret>
//      ZOOM_HOST_EMAIL     = <the Zoom account email meetings should be
//                             created under — usually your own Zoom login>
//
// 3. Add a time-driven trigger so this actually runs on a schedule:
//      Apps Script editor -> Triggers (clock icon) -> + Add Trigger
//        Function: autoGenerateZoomLinks
//        Event source: Time-driven
//        Type: Minutes timer -> Every 10 minutes
//    No code change needed for the trigger itself.
//
// ---- How it decides what to generate ----
// Every run, it looks at every class in the Schedule sheet where:
//   - status is "scheduled" (not cancelled/completed)
//   - it doesn't already have a meetingLink
//   - its start time is between "right now" and "2 hours from now"
// ...and for each one, creates a Zoom meeting and writes the join URL
// back into that row. Running every 10 minutes means a link reliably
// appears within ~10 minutes of the 2-hour mark, not exactly on the
// dot — fine for this purpose, and safe to run more or less often.
//
// A class booked with LESS than 2 hours' notice still gets a link on
// the very next run (nothing here requires a full 2-hour window to
// exist — "within the next 2 hours" already covers "starts in 20
// minutes and doesn't have a link yet").

function autoGenerateZoomLinks() {
  var props = PropertiesService.getScriptProperties();
  var accountId = props.getProperty("ZOOM_ACCOUNT_ID");
  var clientId = props.getProperty("ZOOM_CLIENT_ID");
  var clientSecret = props.getProperty("ZOOM_CLIENT_SECRET");
  var hostEmail = props.getProperty("ZOOM_HOST_EMAIL");
  if (!accountId || !clientId || !clientSecret || !hostEmail) {
    Logger.log("Zoom auto-link: Script Properties not set up yet — skipping. See the setup comment above autoGenerateZoomLinks().");
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
  var accessToken = null; // fetched lazily, only if there's actually work to do

  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var status = row[statusCol - 1];
    var link = row[linkCol - 1];
    var dateStr = row[dateCol - 1];
    var startTime = row[startCol - 1];
    if (status !== "scheduled" || link || !dateStr || !startTime) continue;

    var startDate = new Date(dateStr + "T" + startTime + ":00");
    if (isNaN(startDate.getTime())) continue;
    if (startDate < now || startDate > twoHoursOut) continue; // not in the "next 2 hours" window

    if (!accessToken) accessToken = getZoomAccessToken_(accountId, clientId, clientSecret);
    if (!accessToken) { Logger.log("Zoom auto-link: couldn't get an access token — check your Script Properties."); return; }

    var level = row[levelCol - 1] || "";
    var lessonNumber = row[lessonCol - 1] || "";
    var topic = "Lumio English Club" + (level ? " – " + level : "") + (lessonNumber ? " – Lesson " + lessonNumber : "");
    var durationMinutes = Number(row[durCol - 1]) || 45;

    try {
      var joinUrl = createZoomMeeting_(accessToken, hostEmail, topic, startDate, durationMinutes);
      if (joinUrl) {
        sheet.getRange(i + 2, linkCol).setValue(joinUrl);
        sheet.getRange(i + 2, updatedCol).setValue(new Date().toISOString());
        Logger.log("Zoom auto-link: created meeting for class " + row[idCol - 1] + " -> " + joinUrl);
      }
    } catch (err) {
      Logger.log("Zoom auto-link: failed for class " + row[idCol - 1] + ": " + err);
    }
  }
}

function getZoomAccessToken_(accountId, clientId, clientSecret) {
  var url = "https://zoom.us/oauth/token?grant_type=account_credentials&account_id=" + encodeURIComponent(accountId);
  var basicAuth = Utilities.base64Encode(clientId + ":" + clientSecret);
  var res = UrlFetchApp.fetch(url, {
    method: "post",
    headers: { Authorization: "Basic " + basicAuth },
    muteHttpExceptions: true,
  });
  var body = JSON.parse(res.getContentText() || "{}");
  return body.access_token || null;
}

// startDate: a JS Date in this script's timezone (Project Settings ->
// General -> time zone — set that to match your classes, e.g.
// Asia/Riyadh, so the meeting's actual start time matches what teachers
// booked). Returns the join_url, or null on failure.
function createZoomMeeting_(accessToken, hostEmail, topic, startDate, durationMinutes) {
  var tz = Session.getScriptTimeZone();
  var startIso = Utilities.formatDate(startDate, tz, "yyyy-MM-dd'T'HH:mm:ss");
  var payload = {
    topic: topic,
    type: 2, // scheduled meeting
    start_time: startIso,
    duration: durationMinutes,
    timezone: tz,
    settings: {
      join_before_host: true,
      waiting_room: false,
      approval_type: 2, // no registration required
    },
  };
  var res = UrlFetchApp.fetch("https://api.zoom.us/v2/users/" + encodeURIComponent(hostEmail) + "/meetings", {
    method: "post",
    contentType: "application/json",
    headers: { Authorization: "Bearer " + accessToken },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });
  var code = res.getResponseCode();
  var body = JSON.parse(res.getContentText() || "{}");
  if (code >= 200 && code < 300 && body.join_url) return body.join_url;
  throw new Error("Zoom API error " + code + ": " + res.getContentText());
}


// ═══════════════════════════════════════════════════════════════════
//  AI WRITING FEEDBACK (professional dashboard's "Get Feedback" button)
// ═══════════════════════════════════════════════════════════════════
// Merged into this same project/deployment rather than kept separate --
// this project's own UrlFetchApp authorization already works fine here,
// so there's no need for a second Apps Script project and a second URL
// just for this one feature. Uses the exact same GROQ_API_KEY Script
// Property either way.

function testGroqAuth() {
  var result = writingFeedback_({ prompt: "test", answer: "This is a test answer to trigger the authorization prompt.", minWords: 5 });
  Logger.log(result);
}

function writingFeedback_(body) {
  var apiKey = PropertiesService.getScriptProperties().getProperty("GROQ_API_KEY");
  if (!apiKey) {
    return { ok: false, error: "No Groq API key set up yet. In the Apps Script editor: Project Settings -> Script Properties -> add GROQ_API_KEY with your key from console.groq.com." };
  }
  var prompt = String(body.prompt || "").slice(0, 500);
  var answer = String(body.answer || "").slice(0, 1000);
  var minWords = Number(body.minWords) || 0;
  if (!answer.trim()) {
    return { ok: false, error: "No answer to review yet." };
  }

  var systemPrompt = "You are an English teacher giving feedback on a young English-language " +
    "learner's short writing answer. The student is a child learning English as a second " +
    "language. Your feedback MUST directly reference their actual writing, not generic advice. " +
    "Structure your reply as exactly this: " +
    "(1) One short genuinely positive sentence about their effort or something they got right. " +
    "(2) Point out 1-3 SPECIFIC errors by quoting the exact word or phrase they wrote and giving " +
    "the correct version, in the form: you wrote \"X\", try \"Y\" instead. Cover grammar, spelling, " +
    "or word choice, only for mistakes actually present in their answer. " +
    "(3) One short encouraging closing sentence. " +
    "If their answer has no real, readable English words or sentences at all (for example random " +
    "keyboard mashing), skip step 2 and instead gently tell them to write real English words and " +
    "sentences about the topic, with one simple example sentence they could use to start. " +
    "Keep language simple enough for a child, warm, never harsh. Do not use markdown formatting.";
  var userPrompt = "Writing prompt: " + prompt + "\n" +
    (minWords ? "Expected length: at least " + minWords + " words.\n" : "") +
    "Student's actual answer (quote from this directly): " + answer;

  var payload = {
    // llama-3.3-70b-versatile was deprecated by Groq (shutdown 08/16/2026 --
    // see https://console.groq.com/docs/deprecations) and now returns
    // "The model `llama-3.3-70b-versatile` does not exist or you do not
    // have access to it." on every request. openai/gpt-oss-120b is Groq's
    // own recommended replacement for it.
    //
    // gpt-oss-120b is a reasoning model, which changes two things from a
    // plain chat model: (1) by default it also generates internal
    // "reasoning" content alongside the real answer -- include_reasoning:
    // false keeps that out of the response so `content` stays just the
    // feedback text; reasoning_effort: "low" is enough for a short,
    // templated writing-feedback reply and keeps latency down. (2) Groq's
    // current docs use max_completion_tokens rather than max_tokens for
    // this model family.
    model: "openai/gpt-oss-120b",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.5,
    max_completion_tokens: 300,
    reasoning_effort: "low",
    include_reasoning: false
  };

  try {
    var res = UrlFetchApp.fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "post",
      contentType: "application/json",
      headers: { "Authorization": "Bearer " + apiKey },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    var code = res.getResponseCode();
    var data = JSON.parse(res.getContentText());
    if (code !== 200) {
      var errMsg = (data.error && data.error.message) ? data.error.message : ("Groq API returned status " + code);
      return { ok: false, error: errMsg };
    }
    var msg = data.choices && data.choices[0] && data.choices[0].message;
    // gpt-oss models have a known, occasionally-triggered Groq platform
    // quirk (see community.groq.com) where despite include_reasoning:
    // false, a reply's real text still lands in `reasoning` instead of
    // `content`. Fall back to it rather than surfacing a confusing "empty
    // response" error when the model actually did answer.
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
    return jsonResponse_({ ok: true, message: "Lumio sync backend is running. Pass ?action=pullRoster / pullScheduleV2 / pullProgress / pullLeads / pullProAdmins." });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err) });
  }
}

function doPost(e) {
  try {
    var action = (e && e.parameter) ? e.parameter.action : null;
    var body = {};
    if (e && e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    }
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
