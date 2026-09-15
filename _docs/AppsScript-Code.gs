/**
 * Lumio English — Sync backend (Google Apps Script)
 *
 * What this does: gives your Lumio site a shared Google Sheet backend for
 * the roster (students + teachers), the class schedule, lesson progress,
 * and leads, so every teacher's device sees the same data instead of
 * everything living only in one browser's storage. It also auto-creates
 * a Zoom meeting for each booked class 2 hours before it starts, so
 * teachers never have to paste in a meeting link by hand — see the
 * "ZOOM AUTO-LINK GENERATION" section near the bottom.
 *
 * Setup: see SETUP-GOOGLE-SHEETS-SYNC.md for the full walkthrough of the
 * roster/schedule/progress sync. Short version:
 *   1. Create a new Google Sheet.
 *   2. Extensions -> Apps Script, delete the placeholder code, paste this
 *      whole file in instead.
 *   3. Deploy -> New deployment -> type "Web app".
 *        Execute as: Me
 *        Who has access: Anyone
 *   4. Copy the Web App URL it gives you, paste it into Lumio's teacher
 *      dashboard -> Students -> Sync settings -> Save, then "Sync now".
 *
 * For the Zoom automation on top of that, see the setup steps in the
 * comment above autoGenerateZoomLinks() below — you'll need a free Zoom
 * "Server-to-Server OAuth" app and a one-time trigger.
 *
 * This script creates its own sheet tabs (Teachers, Roster, Schedule,
 * Progress, Leads, ProDashboardAdmins) the first time it runs, with
 * header rows, so you don't need to set anything up inside the Sheet
 * itself.
 *
 * Security note: student/teacher PINs are only ever sent here as a hash
 * (pinHash), never in plain text. Zoom credentials are stored in this
 * script's Script Properties (Project Settings -> Script Properties),
 * never in the Sheet or in the site's code, so they're never exposed to
 * a browser.
 */

// ---------- tab + column definitions ----------

var TEACHERS_SHEET = "Teachers";
var TEACHERS_COLUMNS = ["id", "name", "avatar", "pinHash", "isOwner", "createdAt", "updatedAt"];

var ROSTER_SHEET = "Roster";
var ROSTER_COLUMNS = [
  "id", "name", "level", "avatar", "pinHash", "teacherId", "createdAt", "updatedAt", "phone",
  "age", "gender", "grade", "country", "tags",
  "subscribed", "amountPaid", "levelsPurchased",
  "rewardPoints", "bonusHours"
];

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
  "sessionNotes", "status", "studentsJson", "createdAt", "updatedAt"
];

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
  };
}

function pushRoster_(body) {
  if (Array.isArray(body.students)) writeRows_(ROSTER_SHEET, ROSTER_COLUMNS, body.students);
  if (Array.isArray(body.teachers)) writeRows_(TEACHERS_SHEET, TEACHERS_COLUMNS, body.teachers);
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
  return { classes: readRows_(SCHEDULE_SHEET, SCHEDULE_COLUMNS).map(rowToClass_) };
}

function pushScheduleV2_(body) {
  if (Array.isArray(body.classes)) writeRows_(SCHEDULE_SHEET, SCHEDULE_COLUMNS, body.classes.map(classToRow_));
  return { ok: true };
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

// ---------- HTTP entry points ----------

function doGet(e) {
  try {
    var action = (e && e.parameter) ? e.parameter.action : null;
    if (action === "pullRoster") return jsonResponse_(pullRoster_());
    if (action === "pullScheduleV2") return jsonResponse_(pullScheduleV2_());
    if (action === "pullProgress") return jsonResponse_(pullProgress_());
    if (action === "pullLeads") return jsonResponse_(pullLeads_());
    if (action === "pullProAdmins") return jsonResponse_(pullProAdmins_());
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
    return jsonResponse_({ ok: false, error: "Unknown action: " + action });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err) });
  }
}
