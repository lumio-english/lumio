/*!
 * Lumio Schedule — shared class-booking data for teacher and student
 * dashboards. Loaded alongside lumio-profiles.js. This file only owns
 * "who is booked in for what, when" — it never touches lesson progress
 * or roster identity (that's lumio-profiles.js).
 *
 * Storage (this device only, unless synced — see below):
 *   localStorage["lumio_schedule_v1"] = {
 *     classes: [{
 *       id, studentId, studentName, teacherId, teacherName,
 *       date,        // "YYYY-MM-DD"
 *       startTime,   // "HH:MM" 24h
 *       durationMinutes,
 *       level, notes,
 *       status,      // "scheduled" | "completed" | "cancelled"
 *       createdAt
 *     }],
 *     updatedAt
 *   }
 *
 * studentId/teacherId are kept alongside the *name* at booking time, so a
 * class still displays sensibly even if that roster entry is later edited
 * or removed. Names are the source of truth for matching a booking to the
 * logged-in student, same pattern as lumio-profiles.js progress lookups.
 *
 * ---- Syncing ----
 * Shares the same sync config as lumio-profiles.js
 * (localStorage["lumio_sync_cfg_v1"] = { url, enabled }), so a teacher
 * only has to paste their Apps Script Web App URL once. syncNow() here:
 *   POST <url>?action=pushSchedule   body: { classes }
 *   GET  <url>?action=pullSchedule   expects: { classes }
 * Like the roster, this is an additive merge (by id) rather than a full
 * mirror, so a fresh device's empty local schedule can never wipe out
 * what's already shared.
 */
(function (global) {
  "use strict";

  const SCHEDULE_KEY = "lumio_schedule_v1";
  const SYNC_KEY = "lumio_sync_cfg_v1"; // same key lumio-profiles.js uses

  const memory = {};
  function safeGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return memory[key] || null; }
  }
  function safeSet(key, val) {
    try { localStorage.setItem(key, val); } catch (e) { memory[key] = val; }
  }

  function load() {
    let data;
    try { data = JSON.parse(safeGet(SCHEDULE_KEY) || "null"); } catch (e) { data = null; }
    if (!data || typeof data !== "object") data = {};
    if (!Array.isArray(data.classes)) data.classes = [];
    return data;
  }
  function save(data) {
    data.updatedAt = new Date().toISOString();
    safeSet(SCHEDULE_KEY, JSON.stringify(data));
    return data;
  }
  function genId() {
    return "c_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function listClasses(filter) {
    filter = filter || {};
    let out = load().classes.slice();
    if (filter.teacherId) out = out.filter(c => c.teacherId === filter.teacherId);
    if (filter.studentId) out = out.filter(c => c.studentId === filter.studentId);
    if (filter.studentName) {
      const n = filter.studentName.trim().toLowerCase();
      out = out.filter(c => (c.studentName || "").trim().toLowerCase() === n);
    }
    if (filter.from) out = out.filter(c => c.date >= filter.from);
    if (filter.to) out = out.filter(c => c.date <= filter.to);
    if (filter.status) out = out.filter(c => c.status === filter.status);
    out.sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
    return out;
  }
  function getClass(id) {
    return load().classes.find(c => c.id === id) || null;
  }
  function addClass({ studentId, studentName, teacherId, teacherName, date, startTime, durationMinutes, level, notes } = {}) {
    if (!studentName) throw new Error("Pick a student for this class.");
    if (!date) throw new Error("Pick a date for this class.");
    if (!startTime) throw new Error("Pick a start time for this class.");
    const data = load();
    const record = {
      id: genId(),
      studentId: studentId || null,
      studentName,
      teacherId: teacherId || null,
      teacherName: teacherName || "",
      date,
      startTime,
      durationMinutes: Number(durationMinutes) || 30,
      level: level || "",
      notes: notes || "",
      status: "scheduled",
      attendance: null, // null | "present" | "absent" | "no-show"
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.classes.push(record);
    save(data);
    return record;
  }
  function updateClass(id, patch) {
    const data = load();
    const c = data.classes.find(x => x.id === id);
    if (!c) throw new Error("Class not found.");
    ["studentId", "studentName", "teacherId", "teacherName", "date", "startTime", "notes", "level", "status", "attendance"].forEach(k => {
      if (patch[k] !== undefined) c[k] = patch[k];
    });
    if (patch.durationMinutes !== undefined) c.durationMinutes = Number(patch.durationMinutes) || c.durationMinutes;
    c.updatedAt = new Date().toISOString();
    save(data);
    return c;
  }
  function removeClass(id) {
    const data = load();
    data.classes = data.classes.filter(c => c.id !== id);
    save(data);
  }
  function cancelClass(id) {
    return updateClass(id, { status: "cancelled" });
  }
  function completeClass(id) {
    return updateClass(id, { status: "completed" });
  }
  // Marking attendance is the real "this class happened" signal now —
  // it also flips status to "completed" so it drops out of "Upcoming".
  function markAttendance(id, value) {
    if (["present", "absent", "no-show"].indexOf(value) === -1) {
      throw new Error('Attendance must be "present", "absent", or "no-show".');
    }
    return updateClass(id, { attendance: value, status: "completed" });
  }
  // Classes whose date has passed, weren't cancelled, and still have no
  // attendance marked — the teacher's "catch up on this" list.
  function needsAttendance(filter) {
    const today = todayStr();
    return listClasses(filter).filter(c =>
      c.status !== "cancelled" && !c.attendance && c.date <= today
    );
  }

  function todayStr() {
    return new Date().toISOString().slice(0, 10);
  }
  function upcomingForStudent(studentName, limit) {
    const today = todayStr();
    const nowHM = new Date().toTimeString().slice(0, 5);
    return listClasses({ studentName, status: "scheduled" })
      .filter(c => c.date > today || (c.date === today && c.startTime >= nowHM))
      .slice(0, limit || 50);
  }
  function upcomingForTeacher(teacherId, limit) {
    const today = todayStr();
    const nowHM = new Date().toTimeString().slice(0, 5);
    return listClasses({ teacherId, status: "scheduled" })
      .filter(c => c.date > today || (c.date === today && c.startTime >= nowHM))
      .slice(0, limit || 50);
  }

  function getSyncConfig() {
    try { return JSON.parse(safeGet(SYNC_KEY) || "null") || { url: "", enabled: false }; }
    catch (e) { return { url: "", enabled: false }; }
  }
  // Same "whoever edited more recently wins" rule as lumio-profiles.js —
  // without this, syncing shortly after editing a class (before that edit
  // had been pushed anywhere) would silently revert it back to whatever
  // was already on the Sheet.
  function mergeById(localList, remoteList) {
    const byId = {};
    localList.forEach(r => { byId[r.id] = r; });
    remoteList.forEach(r => {
      const local = byId[r.id];
      if (!local) { byId[r.id] = r; return; }
      const localTime = local.updatedAt ? Date.parse(local.updatedAt) : 0;
      const remoteTime = r.updatedAt ? Date.parse(r.updatedAt) : 0;
      byId[r.id] = localTime > remoteTime ? local : r;
    });
    return Object.values(byId);
  }
  async function syncNow() {
    const cfg = getSyncConfig();
    if (!cfg.enabled || !cfg.url) return { ok: false, reason: "not-configured" };
    const data = load();
    try {
      const res = await fetch(cfg.url + "?action=pullSchedule");
      const remote = await res.json();
      if (remote && Array.isArray(remote.classes)) {
        data.classes = mergeById(data.classes, remote.classes);
        save(data);
      }
      await fetch(cfg.url + "?action=pushSchedule", {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ classes: data.classes }),
      });
      return { ok: true, at: new Date().toISOString() };
    } catch (e) {
      return { ok: false, reason: "network", error: e && e.message };
    }
  }

  function attendanceStatsForStudent(studentName) {
    const classes = listClasses({ studentName }).filter(c => c.attendance);
    const stats = { present: 0, absent: 0, "no-show": 0, total: classes.length };
    classes.forEach(c => { stats[c.attendance] = (stats[c.attendance] || 0) + 1; });
    return stats;
  }

  global.LumioSchedule = {
    listClasses, getClass,
    addClass, updateClass, removeClass, cancelClass, completeClass,
    markAttendance, needsAttendance, attendanceStatsForStudent,
    upcomingForStudent, upcomingForTeacher, todayStr,
    getSyncConfig, syncNow,
  };
})(window);
