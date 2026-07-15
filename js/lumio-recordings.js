/*!
 * Lumio Recordings — student pronunciation recordings from the "speak"
 * lesson activity, kept so a teacher can play them back later from the
 * dashboard to check pronunciation.
 *
 * Deliberately local-device only, NOT synced through the Google Sheets
 * backend like roster/schedule/progress/leads are. Audio, even a few
 * seconds of it, is far too large for Sheets cells (~50,000 character
 * limit) or a reasonable Apps Script payload. This only works when the
 * teacher is reviewing on the same device/browser the student actually
 * recorded on — e.g. right after class on a shared device. If you need
 * real cross-device playback later, that's a genuinely different build
 * (uploading to Google Drive via Apps Script) — this is not that.
 *
 * Storage:
 *   localStorage["lumio_recordings_v1"] = {
 *     [studentName]: {
 *       [levelId]: {
 *         [wordEn]: { wordAr, lessonNum, audioDataUrl, recordedAt }
 *       }
 *     }
 *   }
 *
 * Only the *latest* recording per (student, level, word) is kept — re-
 * recording a word overwrites the old one rather than piling up, so
 * storage stays bounded by how many distinct words exist across a
 * level's "speak" activities, not by how many times someone hit
 * "Record again".
 */
(function (global) {
  "use strict";

  const KEY = "lumio_recordings_v1";

  const memory = {};
  function safeGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return memory[key] || null; }
  }
  function safeSet(key, val) {
    try { localStorage.setItem(key, val); return true; }
    catch (e) { memory[key] = val; return false; } // also covers QuotaExceededError — fails soft
  }

  function load() {
    let data;
    try { data = JSON.parse(safeGet(KEY) || "null"); } catch (e) { data = null; }
    if (!data || typeof data !== "object") data = {};
    return data;
  }
  function save(data) {
    return safeSet(KEY, JSON.stringify(data));
  }

  function saveRecording({ studentName, level, lessonNum, wordEn, wordAr, audioDataUrl } = {}) {
    if (!studentName || !level || !wordEn || !audioDataUrl) return false;
    const data = load();
    data[studentName] = data[studentName] || {};
    data[studentName][level] = data[studentName][level] || {};
    data[studentName][level][wordEn] = {
      wordAr: wordAr || "",
      lessonNum: lessonNum || null,
      audioDataUrl,
      recordedAt: new Date().toISOString(),
    };
    return save(data);
  }

  function listForStudent(studentName, level) {
    const data = load();
    const byLevel = (data[studentName] || {})[level] || {};
    return Object.keys(byLevel)
      .map(wordEn => Object.assign({ wordEn }, byLevel[wordEn]))
      .sort((a, b) => (b.recordedAt || "").localeCompare(a.recordedAt || ""));
  }

  function removeRecording(studentName, level, wordEn) {
    const data = load();
    if (data[studentName] && data[studentName][level]) {
      delete data[studentName][level][wordEn];
      save(data);
    }
  }

  function clearForStudent(studentName, level) {
    const data = load();
    if (data[studentName]) {
      if (level) delete data[studentName][level];
      else delete data[studentName];
      save(data);
    }
  }

  global.LumioRecordings = {
    saveRecording, listForStudent, removeRecording, clearForStudent,
  };
})(window);
