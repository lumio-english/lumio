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
    // Recurring "fixed schedule" patterns (one per weekly slot, e.g. "this
    // group, every Tuesday at 5pm") and a shared list of blocked dates
    // (holidays / days off) the generator should never book into. Both
    // additive to the v2 schema -- old data without them just gets these
    // as empty arrays, no migration needed.
    if (!Array.isArray(data.patterns)) data.patterns = [];
    if (!Array.isArray(data.blockedDates)) data.blockedDates = [];
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
  function addClass({ students, teacherId, teacherName, date, startTime, durationMinutes, level, cohort, group, notes, lessonNumber, meetingLink, patternId } = {}) {
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
      // Set only for a session the fixed-schedule generator created — lets
      // the UI show "part of a fixed weekly schedule" and offer "cancel
      // this and all future" without affecting a normal one-off booking.
      patternId: patternId || null,
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
    // Replacing the roster preserves each remaining student's existing
    // attendance/grade/rating rather than wiping it just because the
    // class was re-saved -- only a genuinely new student (not in the
    // old list) starts fresh, and a removed student's data simply drops
    // with them.
    if (patch.students !== undefined) {
      const bySlotKey = s => (s.studentId || "") + "|" + normName(s.studentName);
      const oldByKey = {};
      c.students.forEach(s => { oldByKey[bySlotKey(s)] = s; });
      c.students = patch.students.map(s => {
        const key = (s.studentId || "") + "|" + normName(s.studentName);
        const existing = oldByKey[key];
        return existing || { studentId: s.studentId || null, studentName: s.studentName, attendance: null, grade: null, teacherRatingStars: null };
      });
      refreshStatus(c);
    }
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
    const wasPresent = slot.attendance === "present";
    slot.attendance = value;
    // Auto-decrement the student's paid session-card count the first
    // time this slot is marked "present" -- `sessionDeducted` guards
    // against double-charging if a teacher toggles present -> absent ->
    // present again on the same slot, or just re-clicks present twice.
    // Switching AWAY from present after a deduction intentionally does
    // NOT refund it here (a session that happened and was later
    // re-marked isn't the common case, and silently refunding on every
    // edit would make the count too easy to game) -- a teacher can
    // still correct it by hand via the student's profile if truly needed.
    if (value === "present" && !wasPresent && !slot.sessionDeducted && global.LumioProfiles) {
      const full = slot.studentId ? global.LumioProfiles.getStudent(slot.studentId) : global.LumioProfiles.findByName(slot.studentName);
      if (full) {
        try {
          global.LumioProfiles.updateStudent(full.id, { sessionsRemaining: Math.max(0, (full.sessionsRemaining || 0) - 1) });
          slot.sessionDeducted = true;
        } catch (e) { /* non-fatal -- attendance itself still gets marked */ }
      }
    }
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
  // See the identical helper + comment in js/lumio-profiles.js -- a bare
  // fetch() can hang forever on a flaky connection with no error and no
  // success, leaving "Syncing..." stuck indefinitely.
  function fetchWithTimeout(url, opts, ms) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms || 20000);
    return fetch(url, Object.assign({}, opts, { signal: controller.signal }))
      .finally(() => clearTimeout(timer));
  }

  async function syncNow() {
    const cfg = getSyncConfig();
    if (!cfg.enabled || !cfg.url) return { ok: false, reason: "not-configured" };
    const data = load();
    try {
      const res = await fetchWithTimeout(cfg.url + "?action=pullScheduleV2");
      const remote = await res.json();
      if (remote && Array.isArray(remote.classes)) {
        data.classes = mergeById(data.classes, remote.classes);
      }
      if (remote && Array.isArray(remote.patterns)) {
        data.patterns = mergeById(data.patterns, remote.patterns);
      }
      // Blocked dates are a small, rarely-changed shared list -- simple
      // union rather than per-record merge-by-id (plain date strings have
      // no id/updatedAt to compare).
      if (remote && Array.isArray(remote.blockedDates)) {
        const seen = new Set(data.blockedDates.map(b => typeof b === "string" ? b : b.date));
        remote.blockedDates.forEach(b => {
          const key = typeof b === "string" ? b : b.date;
          if (!seen.has(key)) { data.blockedDates.push(b); seen.add(key); }
        });
      }
      save(data);
      await fetchWithTimeout(cfg.url + "?action=pushScheduleV2", {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ classes: data.classes, patterns: data.patterns, blockedDates: data.blockedDates }),
      });
      return { ok: true, at: new Date().toISOString() };
    } catch (e) {
      return { ok: false, reason: e && e.name === "AbortError" ? "timeout" : "network", error: e && e.message };
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
  // Current consecutive-attendance streak, counting back from the most
  // recent MARKED session: how many in a row (most recent first) were
  // "present" before hitting one that wasn't (absent/no-show) or running
  // out of marked sessions. An unmarked/future session doesn't break or
  // extend the streak -- it's simply skipped, since it hasn't happened
  // from an attendance standpoint yet.
  function attendanceStreakForStudent(studentName) {
    const marked = listClasses({ studentName })
      .filter(c => c.status !== "cancelled")
      .map(c => findStudentSlot(c, { studentName }))
      .filter(s => s && s.attendance)
      .reverse(); // listClasses is date-ascending; walk most-recent-first
    let streak = 0;
    for (const s of marked) {
      if (s.attendance === "present") streak++;
      else break;
    }
    return streak;
  }
  // A teacher's own workload/quality snapshot: classes taught this
  // calendar month (marked complete), their average student rating (see
  // teacherAverageRating above), and a rough "punctuality" proxy -- the
  // % of their PAST sessions that are fully attendance-marked rather
  // than left sitting in needsAttendance(). This file has no timestamp
  // for exactly when a teacher clicked "present", so it can't measure
  // true on-time marking -- this is the closest honest signal available
  // without adding new tracking.
  function teacherStats(teacherId) {
    const all = listClasses({ teacherId }).filter(c => c.status !== "cancelled");
    const today = todayStr();
    const past = all.filter(c => c.date <= today);
    const now = new Date();
    const ym = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");
    const classesThisMonth = all.filter(c => (c.date || "").slice(0, 7) === ym && c.status === "completed").length;
    const fullyMarked = past.filter(c => completionState(c).complete).length;
    const punctualityPct = past.length ? Math.round((fullyMarked / past.length) * 100) : null;
    return {
      classesThisMonth,
      punctualityPct,
      rating: teacherAverageRating(teacherId), // {average, count} | null
      totalPastSessions: past.length,
    };
  }
  // Reassigns every class in [fromDate, toDate] (inclusive) from one
  // teacher to another -- the "substitute teacher" action for when a
  // teacher is out sick. Only touches classes that haven't already
  // happened/been cancelled, so past history keeps its real teacher on
  // record.
  function reassignTeacherForRange(fromTeacherId, toTeacherId, fromDate, toDate, toTeacherName) {
    if (!fromTeacherId || !toTeacherId) throw new Error("Pick both the original and substitute teacher.");
    const data = load();
    let count = 0;
    data.classes.forEach(c => {
      if (c.teacherId === fromTeacherId && c.date >= fromDate && c.date <= toDate && c.status === "scheduled") {
        c.teacherId = toTeacherId;
        c.teacherName = toTeacherName || c.teacherName;
        c.updatedAt = new Date().toISOString();
        count++;
      }
    });
    if (count) save(data);
    return { reassigned: count };
  }

  // ═══════════════════════════════════════════════════════════════════
  //  FIXED SCHEDULES (recurring weekly patterns)
  // ═══════════════════════════════════════════════════════════════════
  //
  // A pattern is "this group, every <dayOfWeek> at <startTime>" — it does
  // NOT replace individual class rows. Instead, generateUpcoming() reads
  // every active pattern and creates normal classes (exactly the kind
  // addClass() makes) a few weeks ahead, tagged with patternId. That way
  // attendance, grading, Zoom auto-links, and the calendar all keep
  // working completely unchanged — they just see ordinary classes.
  //
  // Skipping ONE date: cancel/remove that single generated class like any
  // other class. Since the generator only ever creates a class for a
  // given (patternId, date) pair once — see the "already exists" check
  // in generateUpcoming() — a cancelled instance is never regenerated, so
  // "cancel this session" already IS "skip just this date" for a fixed
  // schedule. No separate skip-list needed.
  //
  // Stopping the WHOLE series from some date onward: cancelPatternFromDate().

  function genPatternId() { return "p_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

  function listPatterns(filter) {
    filter = filter || {};
    let out = load().patterns.slice();
    if (filter.teacherId) out = out.filter(p => p.teacherId === filter.teacherId);
    if (filter.active !== undefined) out = out.filter(p => p.active === filter.active);
    if (filter.studentName) {
      const n = normName(filter.studentName);
      out = out.filter(p => p.students.some(s => normName(s.studentName) === n));
    }
    return out;
  }
  function getPattern(id) {
    return load().patterns.find(p => p.id === id) || null;
  }
  // dayOfWeek: 0=Sunday .. 6=Saturday (same convention as JS Date#getDay).
  function addPattern({ students, teacherId, teacherName, dayOfWeek, startTime, durationMinutes, level, cohort, group, notes, meetingLink, startDate, lessonStart } = {}) {
    if (!Array.isArray(students) || !students.length) throw new Error("Pick at least one student for this fixed schedule.");
    students.forEach(s => { if (!s.studentName) throw new Error("Every student needs a name."); });
    if (dayOfWeek === undefined || dayOfWeek === null || dayOfWeek < 0 || dayOfWeek > 6) throw new Error("Pick a day of the week.");
    if (!startTime) throw new Error("Pick a start time.");
    const data = load();
    const record = {
      id: genPatternId(),
      teacherId: teacherId || null,
      teacherName: teacherName || "",
      dayOfWeek: Number(dayOfWeek),
      startTime,
      durationMinutes: Number(durationMinutes) || 45,
      level: level || "",
      cohort: cohort || "",
      group: group || "",
      notes: notes || "",
      meetingLink: meetingLink || "",
      students: students.map(s => ({ studentId: s.studentId || null, studentName: s.studentName })),
      startDate: startDate || todayStr(), // first date the pattern is eligible to generate from
      endDate: null,                       // set by cancelPatternFromDate() to stop the series
      lessonStart: lessonStart ? Number(lessonStart) : null, // lesson number for the first generated week, +1 each week after
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.patterns.push(record);
    save(data);
    return record;
  }
  function updatePattern(id, patch) {
    const data = load();
    const p = data.patterns.find(x => x.id === id);
    if (!p) throw new Error("Fixed schedule not found.");
    ["teacherId", "teacherName", "startTime", "level", "cohort", "group", "notes", "meetingLink", "active"].forEach(k => {
      if (patch[k] !== undefined) p[k] = patch[k];
    });
    if (patch.dayOfWeek !== undefined) p.dayOfWeek = Number(patch.dayOfWeek);
    if (patch.durationMinutes !== undefined) p.durationMinutes = Number(patch.durationMinutes) || p.durationMinutes;
    if (patch.students !== undefined) p.students = patch.students.map(s => ({ studentId: s.studentId || null, studentName: s.studentName }));
    p.updatedAt = new Date().toISOString();
    save(data);
    return p;
  }
  // Stops a fixed schedule from `fromDate` onward: the pattern itself is
  // kept (with endDate set) rather than deleted, so past generated
  // sessions and their attendance history stay intact and visible — and
  // cancels any already-generated future sessions tied to it that
  // haven't happened yet, so they don't sit there orphaned.
  function cancelPatternFromDate(id, fromDate) {
    const data = load();
    const p = data.patterns.find(x => x.id === id);
    if (!p) throw new Error("Fixed schedule not found.");
    const from = fromDate || todayStr();
    p.endDate = from;
    p.active = false;
    p.updatedAt = new Date().toISOString();
    let cancelledCount = 0;
    data.classes.forEach(c => {
      if (c.patternId === id && c.date >= from && c.status === "scheduled") {
        c.status = "cancelled";
        c.updatedAt = new Date().toISOString();
        cancelledCount++;
      }
    });
    save(data);
    return { pattern: p, cancelledCount };
  }
  function removePattern(id) {
    const data = load();
    data.patterns = data.patterns.filter(p => p.id !== id);
    save(data);
  }

  // ---- blocked dates (holidays / days the generator should skip) ----
  function listBlockedDates() {
    return load().blockedDates.slice().sort();
  }
  function addBlockedDate(date, label) {
    if (!date) throw new Error("Pick a date to block.");
    const data = load();
    if (!data.blockedDates.some(b => (typeof b === "string" ? b : b.date) === date)) {
      data.blockedDates.push(label ? { date, label } : date);
      save(data);
    }
    return listBlockedDates();
  }
  function removeBlockedDate(date) {
    const data = load();
    data.blockedDates = data.blockedDates.filter(b => (typeof b === "string" ? b : b.date) !== date);
    save(data);
    return listBlockedDates();
  }
  function isDateBlocked(date) {
    return load().blockedDates.some(b => (typeof b === "string" ? b : b.date) === date);
  }

  // How many active fixed weekly slots a student currently has — the
  // "Fixed schedule: 4" style count shown on their profile.
  function fixedScheduleCountForStudent(studentName) {
    return listPatterns({ active: true, studentName }).length;
  }

  function addWeeks(dateStr, n) {
    const d = new Date(dateStr + "T00:00:00");
    d.setDate(d.getDate() + n * 7);
    return d.toISOString().slice(0, 10);
  }
  function nextDateForDayOfWeek(fromDateStr, dayOfWeek) {
    const d = new Date(fromDateStr + "T00:00:00");
    const diff = (dayOfWeek - d.getDay() + 7) % 7;
    d.setDate(d.getDate() + diff);
    return d.toISOString().slice(0, 10);
  }

  // Materializes real class rows for every active pattern, `weeks` weeks
  // ahead from today (default 4) — call this on dashboard load and it's
  // safe to call as often as you like, since it never creates a
  // duplicate for a date it's already generated.
  //
  // Subscription gate: every student in the pattern must currently be
  // `subscribed` (per js/lumio-profiles.js) for that week's session to be
  // generated. This is checked fresh each run rather than baked into the
  // pattern once, so generation automatically pauses the moment someone
  // lapses and automatically resumes the moment they renew — no manual
  // re-enabling needed either way. A lapsed student doesn't cancel
  // already-generated future sessions on their own (that stays an
  // explicit "cancel this and all future" action) — it only stops NEW
  // ones from being created while they're unsubscribed.
  function generateUpcoming(weeks) {
    weeks = weeks || 4;
    const data = load();
    const today = todayStr();
    const horizon = addWeeks(today, weeks);
    const created = [];
    const skippedUnsubscribed = [];

    data.patterns.forEach(p => {
      if (!p.active) return;
      let d = nextDateForDayOfWeek(p.startDate > today ? p.startDate : today, p.dayOfWeek);
      while (d <= horizon) {
        const inRange = d >= p.startDate && (!p.endDate || d < p.endDate);
        const alreadyExists = data.classes.some(c => c.patternId === p.id && c.date === d);
        const blocked = isDateBlocked(d);
        if (inRange && !alreadyExists && !blocked) {
          const allSubscribed = !global.LumioProfiles || p.students.every(s => {
            const full = s.studentId ? global.LumioProfiles.getStudent(s.studentId) : global.LumioProfiles.findByName(s.studentName);
            return full ? !!full.subscribed : true; // unknown/guest students don't block generation
          });
          if (allSubscribed) {
            const weekIndex = Math.round((new Date(d) - new Date(p.startDate)) / (7 * 86400000));
            const record = {
              id: genId(),
              teacherId: p.teacherId, teacherName: p.teacherName,
              date: d, startTime: p.startTime, durationMinutes: p.durationMinutes,
              level: p.level, cohort: p.cohort, group: p.group,
              lessonNumber: p.lessonStart ? p.lessonStart + weekIndex : null,
              meetingLink: p.meetingLink || "", notes: p.notes || "", sessionNotes: "",
              status: "scheduled", patternId: p.id,
              students: p.students.map(s => ({ studentId: s.studentId || null, studentName: s.studentName, attendance: null, grade: null, teacherRatingStars: null })),
              createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
            };
            data.classes.push(record);
            created.push(record);
          } else {
            skippedUnsubscribed.push({ patternId: p.id, date: d });
          }
        }
        d = addWeeks(d, 1);
      }
    });

    if (created.length) save(data);
    return { created: created.length, skippedUnsubscribed };
  }

  global.LumioSchedule = {
    listClasses, getClass,
    addClass, updateClass, removeClass, cancelClass,
    markAttendance, gradeStudent, rateTeacher, completionState,
    needsAttendance, attendanceStatsForStudent, gradesForStudent, teacherRatingsGiven, teacherAverageRating,
    attendanceStreakForStudent, teacherStats, reassignTeacherForRange,
    attendedLessonNumbers, classForLesson,
    upcomingForStudent, upcomingForTeacher, todayStr,
    getSyncConfig, syncNow,
    VALID_GRADES,
    // fixed schedules
    listPatterns, getPattern, addPattern, updatePattern, cancelPatternFromDate, removePattern,
    listBlockedDates, addBlockedDate, removeBlockedDate, isDateBlocked,
    fixedScheduleCountForStudent, generateUpcoming,
  };
})(window);
