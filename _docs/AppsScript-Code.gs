/**
 * Lumio English — Sync backend (Google Apps Script)
 *
 * What this does: gives your Lumio site a shared Google Sheet backend for
 * the roster (students + teachers), the class schedule, and lesson
 * progress, so every teacher's device can see the same data instead of
 * everything living only in one browser's storage.
 *
 * Setup: see SETUP-GOOGLE-SHEETS-SYNC.md that came with this file for the
 * full click-by-click walkthrough. Short version:
 *   1. Create a new Google Sheet.
 *   2. Extensions -> Apps Script, delete the placeholder code, paste this
 *      whole file in instead.
 *   3. Deploy -> New deployment -> type "Web app".
 *        Execute as: Me
 *        Who has access: Anyone
 *   4. Copy the Web App URL it gives you.
 *   5. Paste that URL into Lumio's teacher dashboard -> Students ->
 *      Sync settings -> Save, then "Sync now".
 *
 * This script creates its own sheet tabs (Teachers, Roster, Schedule,
 * Progress) the first time it runs, with header rows, so you don't need
 * to set anything up inside the Sheet itself.
 *
 * Security note: student/teacher PINs are only ever sent here as a hash
 * (pinHash), never in plain text — see the pinHash column below. Nothing
 * here can be used to recover the original 4-digit PIN.
 */

// ---------- tab + column definitions ----------

var TEACHERS_SHEET = "Teachers";
var TEACHERS_COLUMNS = ["id", "name", "avatar", "pinHash", "isOwner", "createdAt", "updatedAt"];

var ROSTER_SHEET = "Roster";
var ROSTER_COLUMNS = ["id", "name", "level", "avatar", "pinHash", "teacherId", "createdAt", "updatedAt", "phone"];

var SCHEDULE_SHEET = "Schedule";
var SCHEDULE_COLUMNS = [
  "id", "studentId", "studentName", "teacherId", "teacherName",
  "date", "startTime", "durationMinutes", "level", "notes", "status", "createdAt", "updatedAt", "attendance", "sessionNotes"
];

var PROGRESS_SHEET = "Progress";
var PROGRESS_COLUMNS = ["studentName", "level", "lesson", "stars", "score", "total", "date"];

var LEADS_SHEET = "Leads";
var LEADS_COLUMNS = [
  "id", "name", "phone", "age", "suggestedLevel", "testScore", "testTotal",
  "status", "notes", "createdAt", "updatedAt"
];

// Admin accounts for lumio-pro-dashboard.html (a separate tool from the
// main teacher dashboard — its own login system for reviewing
// professional-test results). Kept as its own sheet since these
// usernames/passwords are unrelated to student/teacher roster accounts.
// Note: unlike roster PINs, these are stored as plain text here — same
// as how this dashboard's login already worked before it was connected
// to a shared backend. Worth knowing if that matters to you.
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
  // Migration: if this sheet was created by an older version of this
  // script with fewer columns (e.g. before "updatedAt" existed), extend
  // the header row rather than requiring anyone to edit the Sheet by
  // hand. Existing rows just get blank cells for the new column(s),
  // which the client treats as "unknown / very old" — safe default.
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

// ---------- schedule ----------

function pullSchedule_() {
  return { classes: readRows_(SCHEDULE_SHEET, SCHEDULE_COLUMNS) };
}

function pushSchedule_(body) {
  if (Array.isArray(body.classes)) writeRows_(SCHEDULE_SHEET, SCHEDULE_COLUMNS, body.classes);
  return { ok: true };
}

// ---------- progress ----------
// body.progress is the shape Lumio.progressAll() returns:
//   { [studentName]: { [level]: { [lessonId]: {stars, score, total, date} } } }
// flattened here into one row per (student, level, lesson).

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

// ---------- HTTP entry points ----------

function doGet(e) {
  try {
    // e is undefined if this is run manually from the Apps Script editor
    // (clicking "Run" on doGet) instead of through a real web request —
    // that's not a bug, just not how this function is meant to be
    // invoked. Open the deployed /exec URL in a browser tab to test it
    // for real.
    var action = (e && e.parameter) ? e.parameter.action : null;
    if (action === "pullRoster") return jsonResponse_(pullRoster_());
    if (action === "pullSchedule") return jsonResponse_(pullSchedule_());
    if (action === "pullProgress") return jsonResponse_(pullProgress_());
    if (action === "pullLeads") return jsonResponse_(pullLeads_());
    if (action === "pullProAdmins") return jsonResponse_(pullProAdmins_());
    return jsonResponse_({ ok: true, message: "Lumio sync backend is running. Pass ?action=pullRoster / pullSchedule / pullProgress / pullLeads / pullProAdmins." });
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
    if (action === "pushSchedule") return jsonResponse_(pushSchedule_(body));
    if (action === "pushProgress") return jsonResponse_(pushProgress_(body));
    if (action === "pushLeads") return jsonResponse_(pushLeads_(body));
    if (action === "pushProAdmins") return jsonResponse_(pushProAdmins_(body));
    if (action === "writingFeedback") return jsonResponse_(writingFeedback_(body));
    return jsonResponse_({ ok: false, error: "Unknown action: " + action });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err) });
  }
}

// ---------- AI writing feedback (professional dashboard) ----------
// Uses Groq's API (OpenAI-compatible) for fast, free-tier feedback on a
// student's short writing answer. The API key is read from this
// project's Script Properties — never hardcoded here, never sent to or
// stored in the browser. Set it once: in the Apps Script editor, go to
// Project Settings (gear icon) -> Script Properties -> Add property,
// name it GROQ_API_KEY, paste your key from console.groq.com as the
// value. Free tier is enough for this — no billing needed to start.
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

  var systemPrompt = "You are a warm, encouraging English teacher giving feedback on a young " +
    "English-language learner's short writing answer. The student is a child learning English " +
    "as a second language, so be gentle and specific. Write 3-4 short sentences: start with " +
    "something genuinely positive about their answer, then give one or two concrete, easy-to-" +
    "apply suggestions (grammar, vocabulary, or completeness), and end with encouragement. " +
    "Keep it simple and warm, never harsh. Do not use markdown formatting.";
  var userPrompt = "Writing prompt: " + prompt + "\n" +
    (minWords ? "Expected length: at least " + minWords + " words.\n" : "") +
    "Student's answer: " + answer;

  var payload = {
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.6,
    max_tokens: 220
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
      var msg = (data.error && data.error.message) ? data.error.message : ("Groq API returned status " + code);
      return { ok: false, error: msg };
    }
    var feedback = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    if (!feedback) return { ok: false, error: "Empty response from Groq." };
    return { ok: true, feedback: feedback.trim() };
  } catch (err) {
    return { ok: false, error: "Request to Groq failed: " + String(err) };
  }
}
