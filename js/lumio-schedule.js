/*!
 * Lumio Schedule — shared class-booking data for teacher and student
 * dashboards. Loaded alongside lumio-profiles.js. This file only owns
 * "who is booked in for what, when" — it never touches lesson progress
 * or roster identity (that's lumio-profiles.js).
 *
 * v2: real classes are group sessions (2-4 students from the same
 * cohort/group/level on a shared Zoom/Meet call), not one student each —
 * so a class record now holds a `students` array, and attendance, the
 * teacher's letter grade, and the student's star rating of the teacher
 * are all per-student within that one session, not per-class.
 *
 * Storage (this device only, unless synced — see below):
 *   localStorage["lumio_schedule_v2"] = {
 *     classes: [{
 *       id, teacherId, teacherName,
 *       date,        // "YYYY-MM-DD"
 *       startTime,   // "HH:MM" 24h
 *       durationMinutes,
 *       level, cohort, group, // which group session this is -- students
 *                              // booked in are expected to share all three,
 *                              // though this file doesn't enforce that; the
 *                              // booking UI is what should only ever offer
 *                              // students from one cohort+group+level at a time
 *       lessonNumber, // which lesson (within `level`) this class is the live
 *                      // session for -- e.g. 5. Required for a class to count
 *                      // toward unlocking the next lesson's prep (see
 *                      // js/dashboard.js) and toward homework.html's gate.
 *       meetingLink,  // Zoom/Google Meet URL for this session
 *       notes,        // set when booking — plans/context going into the class
 *       sessionNotes, // set after the class — what was actually covered
 *       status,       // "scheduled" | "completed" | "cancelled"
 *       students: [{
 *         studentId, studentName,
 *         attendance,          // null | "present" | "absent" | "no-show"
 *         grade,                // null | a letter grade string, e.g. "A+", "B-"
 *         teacherRatingStars,   // null | 1-5 — this student's rating of the
 *                                // teacher for this specific session
 *       }],
 *       createdAt, updatedAt,
 *     }],
 *     updatedAt
 *   }
 *
 * studentId/teacherId are kept alongside the *name* at booking time, so a
 * class still displays sensibly even if that roster entry is later edited
 * or removed. Names are the source of truth for matching a booking to the
 * logged-in student, same pattern as lumio-profiles.js progress lookups.
 *
 * A class only counts as fully "completed" once every student in it has
 * attendance marked — see completionState(). A session that's passed its
 * time but still has any student unmarked shows up in needsAttendance(),
 * the teacher's "these need attention" list, rather than silently sitting
 * there or auto-cancelling.
 *
 * v1 -> v2: this is a clean cutover to a new storage key, not a field-by-
 * field migration of old single-student records. Old lumio_schedule_v1
 * data is left untouched under its own key (harmless, just no longer
 * read) rather than attempting to guess which old individual bookings
 * were meant to be the same group session -- that mapping doesn't exist
 * in the old data at all, so a real migration would have to fabricate it.
 *
 * ---- Syncing ----
 * Shares the same sync config as lumio-profiles.js
 * (localStorage["lumio_sync_cfg_v1"] = { url, enabled }), so a teacher
 * only has to paste their Apps Script Web App URL once. syncNow() here:
 *   POST <url>?action=pushScheduleV2   body: { classes }
 *   GET  <url>?action=pullScheduleV2   expects: { classes }
 * Like the roster, this is an additive merge (by id) rather than a full
 * mirror, so a fresh device's empty local schedule can never wipe out
 * what's already shared. Uses a V2-suffixed action name so an old Apps
 * Script deployment that only knows the v1 shape doesn't get handed v2
 * records it can't interpret correctly.
 */
(function (global) {
  "use strict";

  const SCHEDULE_KEY = "lumio_schedule_v2";
  const SYNC_KEY = "lumio_sync_cfg_v1"; // same key lumio-profiles.js uses
  // Same baked-in default as lumio-profiles.js — keep these in sync if the
  // Apps Script is ever redeployed to a new URL.
  const DEFAULT_SYNC_URL = "https://script.google.com/macros/s/AKfycbxlKY07coAR_Uj6UQf2bvy6yi6I3cG9WsnTROvKI5v_l9MhhXIbP3Ke8jxbYx5btZzAGA/exec";
  const VALID_GRADES = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"];

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
  function normName(n) { return (n || "").trim().toLowerCase(); }

  // markAttendance/gradeStudent/rateTeacher accept a studentRef that's
  // either a full {studentId, studentName} object or, as a convenient
  // shorthand, a bare string -- interpreted as a *name*, matching every
  // other name-keyed lookup in this codebase (progress, homework), not
  // as an id.

  function findStudentSlot(cls, { studentId, studentName }) {
    if (studentId) {
      const bySid = cls.students.find(s => s.studentId === studentId);
      if (bySid) return bySid;
    }
    if (studentName) {
      const n = normName(studentName);
      return cls.students.find(s => normName(s.studentName) === n) || null;
    }
    return null;
  }

  function listClasses(filter) {
    filter = filter || {};
    let out = load().classes.slice();
    if (filter.teacherId) out = out.filter(c => c.teacherId === filter.teacherId);
    if (filter.studentId) out = out.filter(c => c.students.some(s => s.studentId === filter.studentId));
    if (filter.studentName) {
      const n = normName(filter.studentName);
      out = out.filter(c => c.students.some(s => normName(s.studentName) === n));
    }
    if (filter.cohort) out = out.filter(c => c.cohort === filter.cohort);
    if (filter.group) out = out.filter(c => c.group === filter.group);
    if (filter.level) out = out.filter(c => c.level === filter.level);
    if (filter.from) out = out.filter(c => c.date >= filter.from);
    if (filter.to) out = out.filter(c => c.date <= filter.to);
    if (filter.status) out = out.filter(c => c.status === filter.status);
    out.sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
    return out;
  }
  function getClass(id) {
    return load().classes.find(c => c.id === id) || null;
  }
  // students: [{studentId, studentName}, ...] -- 1-4 in practice, but not
  // hard-limited here; the booking UI is what should keep it to a real
  // group size and to one cohort+group+level at a time, not this layer.
  function addClass({ students, teacherId, teacherName, date, startTime, durationMinutes, level, cohort, group, notes, lessonNumber, meetingLink } = {}) {
    if (!Array.isArray(students) || !students.length) throw new Error("Pick at least one student for this class.");
    students.forEach(s => { if (!s.studentName) throw new Error("Every student needs a name."); });
    if (!date) throw new Error("Pick a date for this class.");
    if (!startTime) throw new Error("Pick a start time for this class.");
    const data = load();
    const record = {
      id: genId(),
      teacherId: teacherId || null,
      teacherName: teacherName || "",
      date,
      startTime,
      durationMinutes: Number(durationMinutes) || 45,
      level: level || "",
      cohort: cohort || "",
      group: group || "",
      lessonNumber: lessonNumber ? Number(lessonNumber) : null,
      meetingLink: meetingLink || "",
      notes: notes || "",
      sessionNotes: "",
      status: "scheduled",
      students: students.map(s => ({
        studentId: s.studentId || null,
        studentName: s.studentName,
        attendance: null,
        grade: null,
        teacherRatingStars: null,
      })),
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
    ["teacherId", "teacherName", "date", "startTime", "notes", "sessionNotes", "level", "cohort", "group", "status", "meetingLink"].forEach(k => {
      if (patch[k] !== undefined) c[k] = patch[k];
    });
    if (patch.durationMinutes !== undefined) c.durationMinutes = Number(patch.durationMinutes) || c.durationMinutes;
    if (patch.lessonNumber !== undefined) c.lessonNumber = patch.lessonNumber ? Number(patch.lessonNumber) : null;
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
  // A class is "completed" once every student in it has attendance marked
  // -- not just one, since a 3-4 student group session isn't done from the
  // teacher's side until they've gone through the whole list.
  function completionState(cls) {
    const marked = cls.students.filter(s => s.attendance).length;
    return { marked, total: cls.students.length, complete: marked === cls.students.length };
  }
  function refreshStatus(cls) {
    if (cls.status === "cancelled") return;
    cls.status = completionState(cls).complete ? "completed" : "scheduled";
  }
  // Marking attendance is per-student within a session now, not per-class
  // -- one class can have some students present and others absent.
  function markAttendance(classId, studentRef, value) {
    if (["present", "absent", "no-show"].indexOf(value) === -1) {
      throw new Error('Attendance must be "present", "absent", or "no-show".');
    }
    const data = load();
    const c = data.classes.find(x => x.id === classId);
    if (!c) throw new Error("Class not found.");
    const slot = findStudentSlot(c, typeof studentRef === "string" ? { studentName: studentRef } : studentRef);
    if (!slot) throw new Error("That student isn't booked into this class.");
    slot.attendance = value;
    refreshStatus(c);
    c.updatedAt = new Date().toISOString();
    save(data);
    return c;
  }
  // Teacher's letter grade for one student in this session.
  function gradeStudent(classId, studentRef, grade) {
    if (grade !== null && VALID_GRADES.indexOf(grade) === -1) {
      throw new Error("Grade must be one of: " + VALID_GRADES.join(", ") + " (or null to clear it).");
    }
    const data = load();
    const c = data.classes.find(x => x.id === classId);
    if (!c) throw new Error("Class not found.");
    const slot = findStudentSlot(c, typeof studentRef === "string" ? { studentName: studentRef } : studentRef);
    if (!slot) throw new Error("That student isn't booked into this class.");
    slot.grade = grade;
    c.updatedAt = new Date().toISOString();
    save(data);
    return c;
  }
  // A student's star rating (1-5) of the teacher, for this one session --
  // called from the student side, not the teacher side.
  function rateTeacher(classId, studentRef, stars) {
    const n = Number(stars);
    if (!Number.isInteger(n) || n < 1 || n > 5) throw new Error("Rating must be an integer from 1 to 5.");
    const data = load();
    const c = data.classes.find(x => x.id === classId);
    if (!c) throw new Error("Class not found.");
    const slot = findStudentSlot(c, typeof studentRef === "string" ? { studentName: studentRef } : studentRef);
    if (!slot) throw new Error("That student isn't booked into this class.");
    slot.teacherRatingStars = n;
    c.updatedAt = new Date().toISOString();
    save(data);
    return c;
  }
  // Classes whose date has passed, weren't cancelled, and still have at
  // least one student with no attendance marked yet — the teacher's
  // "these need attention" list. A session doesn't silently vanish or
  // auto-cancel once its time passes; it sits here until the teacher
  // actually goes through it.
  function needsAttendance(filter) {
    const today = todayStr();
    return listClasses(filter).filter(c =>
      c.status !== "cancelled" && c.date <= today && !completionState(c).complete
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
    try {
      const saved = JSON.parse(safeGet(SYNC_KEY) || "null");
      if (saved && saved.url) return saved;
    } catch (e) { /* fall through to default below */ }
    return DEFAULT_SYNC_URL ? { url: DEFAULT_SYNC_URL, enabled: true } : { url: "", enabled: false };
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
      const res = await fetch(cfg.url + "?action=pullScheduleV2");
      const remote = await res.json();
      if (remote && Array.isArray(remote.classes)) {
        data.classes = mergeById(data.classes, remote.classes);
        save(data);
      }
      await fetch(cfg.url + "?action=pushScheduleV2", {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ classes: data.classes }),
      });
      return { ok: true, at: new Date().toISOString() };
    } catch (e) {
      return { ok: false, reason: "network", error: e && e.message };
    }
  }

  // The set of lesson numbers (within `level`) for which this student has
  // an attended ("present") live class -- this is the "live lesson
  // happened" signal the adventure map (js/dashboard.js) gates the next
  // lesson's prep on, and homework.html gates on too. Only "present"
  // counts; "absent"/"no-show" don't unlock the next lesson, since the
  // class didn't actually happen for that student. Same output shape
  // (a Set of numbers) as before the multi-student rewrite, so neither
  // of those two call sites needed to change.
  function attendedLessonNumbers(studentName, level) {
    const nums = new Set();
    listClasses({ studentName, level }).forEach(c => {
      const slot = findStudentSlot(c, { studentName });
      if (slot && slot.attendance === "present" && c.lessonNumber) {
        nums.add(Number(c.lessonNumber));
      }
    });
    return nums;
  }
  // The most relevant (most recently booked, non-cancelled) class for a
  // given student/level/lesson — used to show "your class for Lesson 5 is
  // Tuesday at 4pm" style status without needing the caller to filter
  // listClasses() themselves.
  function classForLesson(studentName, level, lessonNumber) {
    const matches = listClasses({ studentName, level })
      .filter(c => Number(c.lessonNumber) === Number(lessonNumber) && c.status !== "cancelled");
    if (!matches.length) return null;
    return matches.sort((a, b) => (b.date + b.startTime).localeCompare(a.date + a.startTime))[0];
  }

  function attendanceStatsForStudent(studentName) {
    const stats = { present: 0, absent: 0, "no-show": 0, total: 0 };
    listClasses({ studentName }).forEach(c => {
      const slot = findStudentSlot(c, { studentName });
      if (slot && slot.attendance) { stats[slot.attendance]++; stats.total++; }
    });
    return stats;
  }
  // A student's own grades (this level or across all) and their ratings
  // of the teacher, pulled back out of whichever sessions they were in --
  // report.html reads these the same way it already reads prep/homework
  // data, rather than this file trying to pre-aggregate everything itself.
  function gradesForStudent(studentName, level) {
    const out = [];
    listClasses({ studentName, level }).forEach(c => {
      const slot = findStudentSlot(c, { studentName });
      if (slot && slot.grade) out.push({ classId: c.id, date: c.date, lessonNumber: c.lessonNumber, grade: slot.grade });
    });
    return out;
  }
  function teacherRatingsGiven(studentName) {
    const out = [];
    listClasses({ studentName }).forEach(c => {
      const slot = findStudentSlot(c, { studentName });
      if (slot && slot.teacherRatingStars) out.push({ classId: c.id, date: c.date, teacherId: c.teacherId, stars: slot.teacherRatingStars });
    });
    return out;
  }
  function teacherAverageRating(teacherId) {
    const stars = [];
    listClasses({ teacherId }).forEach(c => {
      c.students.forEach(s => { if (s.teacherRatingStars) stars.push(s.teacherRatingStars); });
    });
    if (!stars.length) return null;
    return { average: stars.reduce((a, b) => a + b, 0) / stars.length, count: stars.length };
  }

  global.LumioSchedule = {
    listClasses, getClass,
    addClass, updateClass, removeClass, cancelClass,
    markAttendance, gradeStudent, rateTeacher, completionState,
    needsAttendance, attendanceStatsForStudent, gradesForStudent, teacherRatingsGiven, teacherAverageRating,
    attendedLessonNumbers, classForLesson,
    upcomingForStudent, upcomingForTeacher, todayStr,
    getSyncConfig, syncNow,
    VALID_GRADES,
  };
})(window);
