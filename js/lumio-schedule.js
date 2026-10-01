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
  const LUMIO_API_KEY = "504bc50951590970a9faf630"; // see lumio-profiles.js
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
    // Tombstones: ids of classes/patterns removed on ANY device. Without
    // them the additive merge in syncNow() re-added a removed class from
    // the Sheet on the very next sync (often the same click). Shared
    // through the DeletedIds tab, same as students/teachers.
    if (!Array.isArray(data.deletedClassIds)) data.deletedClassIds = [];
    if (!Array.isArray(data.deletedPatternIds)) data.deletedPatternIds = [];
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
    if (isPast(date, startTime)) throw new Error("That date and time have already passed.");
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
    ["teacherId", "teacherName", "date", "startTime", "notes", "sessionNotes", "level", "cohort", "status", "meetingLink"].forEach(k => {
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
    if (!data.deletedClassIds.includes(id)) data.deletedClassIds.push(id);
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
    // Used to be `new Date().toISOString().slice(0, 10)` -- .toISOString()
    // always returns the UTC date, not the browser's local date. For any
    // timezone ahead of UTC (Egypt, the Gulf -- exactly this platform's
    // audience, per its own GCC/KSA market focus), the local calendar day
    // rolls over to the next day BEFORE UTC's does: e.g. at 12:30 AM local
    // time in Cairo (UTC+2/+3), it's still the previous day in UTC. Every
    // caller of todayStr() (calendar "today" highlighting, which classes
    // count as upcoming vs needing attention, default date-picker values,
    // when attendance-marking buttons appear) means "today" as the person
    // actually using the app understands it -- their own wall clock, not
    // UTC -- so this now builds the date string from local getters instead.
    // Platform time (Asia/Riyadh) since 1 Oct 2026 -- see Lumio.tzNow in
    // js/app.js. Every class date/time string on Lumio is Saudi time, so
    // "today" has to be today in Riyadh, not on the device's clock.
    return nowTz().date;
  }
  function nowTz() {
    if (global.Lumio && typeof Lumio.tzNow === "function") return Lumio.tzNow();
    const d = new Date(); const pad = n => String(n).padStart(2, "0");
    return { date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, hm: `${pad(d.getHours())}:${pad(d.getMinutes())}`, dow: d.getDay(), minutes: d.getHours() * 60 + d.getMinutes() };
  }
  // A class stays "upcoming" until it has ENDED (start + duration), so the
  // join link does not vanish the second the class starts.
  function stillRunning(c, now) {
    if (c.date !== now.date) return c.date > now.date;
    const [h, m] = String(c.startTime || "00:00").split(":").map(Number);
    return h * 60 + m + (Number(c.durationMinutes) || 45) > now.minutes;
  }
  function upcomingForStudent(studentName, limit) {
    const now = nowTz();
    return listClasses({ studentName, status: "scheduled" })
      .filter(c => stillRunning(c, now))
      .slice(0, limit || 50);
  }
  function upcomingForTeacher(teacherId, limit) {
    const now = nowTz();
    return listClasses({ teacherId, status: "scheduled" })
      .filter(c => stillRunning(c, now))
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
  // Safety net for rows the Sheet auto-typed before the Apps Script
  // started storing everything as text: a `date` that arrives as
  // "2026-09-18T21:00:00.000Z" (midnight in the Sheet's timezone) or a
  // `startTime` that arrives as "1899-12-30T13:00:00.000Z" is turned back
  // into the "YYYY-MM-DD" / "HH:MM" strings every comparison here expects.
  // Without this a synced class matched no calendar day and no "next
  // class" card. Dates are read in the browser's local timezone, which is
  // the same region as the Sheet's for a Lumio teacher.
  function normalizeSheetDates(rec) {
    if (!rec) return rec;
    const pad = n => String(n).padStart(2, "0");
    ["date", "startDate", "endDate"].forEach(k => {
      const v = rec[k];
      if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}T/.test(v)) {
        const d = new Date(v);
        if (!isNaN(d)) rec[k] = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      }
    });
    const t = rec.startTime;
    if (typeof t === "string" && /^\d{4}-\d{2}-\d{2}T/.test(t)) {
      const d = new Date(t);
      if (!isNaN(d)) rec.startTime = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }
    if (typeof rec.lessonNumber === "string" && /^\d+$/.test(rec.lessonNumber)) rec.lessonNumber = Number(rec.lessonNumber);
    if (typeof rec.durationMinutes === "string" && /^\d+$/.test(rec.durationMinutes)) rec.durationMinutes = Number(rec.durationMinutes);
    return rec;
  }
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

  // opts.pullOnly: pull + merge + save only (student devices never push).
  async function syncNow(opts) {
    const pullOnly = !!(opts && opts.pullOnly);
    const cfg = getSyncConfig();
    if (!cfg.enabled || !cfg.url) return { ok: false, reason: "not-configured" };
    const data = load();
    try {
      const res = await fetchWithTimeout(cfg.url + "?key=" + LUMIO_API_KEY + "&action=pullScheduleV2");
      const remote = await res.json();
      if (remote && Array.isArray(remote.deletedIds)) {
        remote.deletedIds.forEach(e => {
          if (!e || !e.id) return;
          if (e.type === "class" && !data.deletedClassIds.includes(e.id)) data.deletedClassIds.push(e.id);
          if (e.type === "pattern" && !data.deletedPatternIds.includes(e.id)) data.deletedPatternIds.push(e.id);
        });
      }
      if (remote && Array.isArray(remote.classes)) {
        remote.classes.forEach(normalizeSheetDates);
        data.classes = mergeById(data.classes, remote.classes.filter(c => !data.deletedClassIds.includes(c.id)));
      }
      if (remote && Array.isArray(remote.patterns)) {
        remote.patterns.forEach(normalizeSheetDates);
        data.patterns = mergeById(data.patterns, remote.patterns.filter(p => !data.deletedPatternIds.includes(p.id)));
      }
      data.classes = data.classes.filter(c => !data.deletedClassIds.includes(c.id));
      data.patterns = data.patterns.filter(p => !data.deletedPatternIds.includes(p.id));
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
      if (pullOnly) return { ok: true, at: new Date().toISOString(), pullOnly: true };
      await fetchWithTimeout(cfg.url + "?key=" + LUMIO_API_KEY + "&action=pushScheduleV2", {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          classes: data.classes, patterns: data.patterns, blockedDates: data.blockedDates,
          deletedIds: [
            ...data.deletedClassIds.map(id => ({ id, type: "class", deletedAt: new Date().toISOString() })),
            ...data.deletedPatternIds.map(id => ({ id, type: "pattern", deletedAt: new Date().toISOString() })),
          ],
        }),
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
    const ym = today.slice(0, 7);
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
    ["teacherId", "teacherName", "startTime", "level", "cohort", "notes", "meetingLink", "active", "extra"].forEach(k => {
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
    if (!data.deletedPatternIds.includes(id)) data.deletedPatternIds.push(id);
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

  // Pure calendar arithmetic on "YYYY-MM-DD" strings. The old versions
  // built a LOCAL midnight Date and then called .toISOString() (UTC), so
  // in any zone ahead of UTC -- Riyadh, Cairo -- every generated date
  // landed one day EARLY: a "Tuesday" pattern booked Mondays.
  function addDaysStr(dateStr, n) {
    const [y, m, d] = String(dateStr).split("-").map(Number);
    const r = new Date(Date.UTC(y, m - 1, d + n));
    return `${r.getUTCFullYear()}-${String(r.getUTCMonth() + 1).padStart(2, "0")}-${String(r.getUTCDate()).padStart(2, "0")}`;
  }
  function addWeeks(dateStr, n) { return addDaysStr(dateStr, n * 7); }
  function nextDateForDayOfWeek(fromDateStr, dayOfWeek) {
    const [y, m, d] = String(fromDateStr).split("-").map(Number);
    const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    return addDaysStr(fromDateStr, (dayOfWeek - dow + 7) % 7);
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
      if (!p.active || !isLegacyPattern(p)) return; // availability slots materialize on first booking, not here
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
            // Lesson numbers count the sessions this pattern actually
            // produced before this date -- not calendar weeks -- so a
            // start date that isn't on the pattern's weekday, a holiday or
            // a skipped week never leaves a gap (e.g. "Lesson 2" first).
            const priorSessions = data.classes.filter(c => c.patternId === p.id && c.date < d && c.status !== "cancelled").length;
            const record = {
              id: genId(),
              teacherId: p.teacherId, teacherName: p.teacherName,
              date: d, startTime: p.startTime, durationMinutes: p.durationMinutes,
              level: p.level, cohort: p.cohort,
              lessonNumber: p.lessonStart ? Number(p.lessonStart) + priorSessions : null,
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


  // =====================================================================
  //  BOOKING MODEL (1 Oct 2026) -- teacher-first fixed schedule
  //  * A fixed-schedule pattern is a TEACHER'S AVAILABILITY: weekday +
  //    start time inside working hours. It has no students and no lesson
  //    (patterns created before this date still carry students/lessonStart
  //    and keep generating as before -- "legacy" patterns).
  //  * A class is created from an availability slot by the FIRST booking,
  //    which locks the class to that student's level + lesson. Later
  //    bookings may join only if level+lesson match and there is room.
  //  * Every booking -- by a student, by a teacher for a student -- goes
  //    through bookStudentIntoSlot(), so the rules can't be bypassed.
  // =====================================================================
  // Every teacher runs 4 fixed sessions a day, Sunday-Thursday (20 a week).
  const WORK = { days: [0, 1, 2, 3, 4], start: "12:00", end: "20:00", minSlotsPerDay: 4, minSlotsPerTeacher: 20 };
  const MAX_PER_CLASS = 4;
  const MAX_PER_WEEK = 3;
  const CANCEL_MIN_BEFORE = 30;   // minutes before start a student may still cancel
  const BOOK_HORIZON_DAYS = 21;

  const hmToMin = hm => { const [h, m] = String(hm || "0:0").split(":").map(Number); return h * 60 + (m || 0); };
  const minToHm = m => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  const dowOf = d => { const [y, m, dd] = String(d).split("-").map(Number); return new Date(Date.UTC(y, m - 1, dd)).getUTCDay(); };
  // Live classes run 45-90 min depending on the lesson (first lessons a
  // little shorter, the level's Big Review the full 90).
  function lessonDuration(level, lesson) {
    const n = Number(lesson) || 1;
    const N = (global.Lumio && Lumio.lessonCountFor) ? Lumio.lessonCountFor(level) : 20;
    if (n >= N) return 90;
    if (n <= 3) return 45;
    return 60;
  }
  function isLegacyPattern(p) { return Array.isArray(p.students) && p.students.length > 0; }
  function inWorkingHours(dayOfWeek, startTime, durationMinutes) {
    if (!WORK.days.includes(Number(dayOfWeek))) return `Fixed slots are Sunday to Thursday only.`;
    const s = hmToMin(startTime), e = s + (Number(durationMinutes) || 60);
    if (s < hmToMin(WORK.start) || e > hmToMin(WORK.end)) return `Fixed slots must start at or after ${WORK.start} and end by ${WORK.end} (Saudi time).`;
    return null;
  }
  // Teacher availability slot (the new kind of pattern).
  function addAvailability({ teacherId, teacherName, dayOfWeek, startTime, durationMinutes, meetingLink, notes, startDate, extra } = {}) {
    if (!teacherId) throw new Error("Pick a teacher.");
    const bad = inWorkingHours(dayOfWeek, startTime, durationMinutes || 60);
    if (bad) throw new Error(bad);
    const data = load();
    const clash = data.patterns.some(p => p.active && p.teacherId === teacherId && Number(p.dayOfWeek) === Number(dayOfWeek)
      && Math.abs(hmToMin(p.startTime) - hmToMin(startTime)) < Math.max(Number(p.durationMinutes) || 60, Number(durationMinutes) || 60));
    if (clash) throw new Error("That overlaps another slot this teacher already has on that day.");
    const record = {
      id: genPatternId(), teacherId, teacherName: teacherName || "", dayOfWeek: Number(dayOfWeek), startTime,
      durationMinutes: Number(durationMinutes) || 60, level: "", cohort: "", group: "", notes: notes || "", meetingLink: meetingLink || "",
      students: [], startDate: startDate || todayStr(), endDate: null, lessonStart: null, active: true, extra: !!extra,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    data.patterns.push(record); save(data); return record;
  }
  function availabilityForTeacher(teacherId) {
    return listPatterns({ teacherId, active: true }).filter(p => !isLegacyPattern(p))
      .sort((a, b) => a.dayOfWeek - b.dayOfWeek || hmToMin(a.startTime) - hmToMin(b.startTime));
  }
  // The 4-a-day rule: how a teacher stands against it (warning, not a hard
  // block). perDay[dow] = base slots that day; missingDays lists Sun-Thu
  // days still under 4.
  function availabilityStatus(teacherId) {
    const base = availabilityForTeacher(teacherId).filter(p => !p.extra);
    const perDay = {}; WORK.days.forEach(d => { perDay[d] = 0; });
    base.forEach(p => { if (perDay[p.dayOfWeek] !== undefined) perDay[p.dayOfWeek]++; });
    const missingDays = WORK.days.filter(d => perDay[d] < WORK.minSlotsPerDay);
    const n = base.length;
    return { count: n, required: WORK.minSlotsPerTeacher, perDay, perDayRequired: WORK.minSlotsPerDay, missingDays, ok: missingDays.length === 0 };
  }
  // One-shot weekly setup: the same start times on every working day.
  // Existing/overlapping slots are skipped, never duplicated.
  function setWeeklyAvailability({ teacherId, teacherName, startTimes, durationMinutes, meetingLink } = {}) {
    if (!teacherId) throw new Error("Pick a teacher.");
    const times = (startTimes || []).filter(Boolean);
    if (!times.length) throw new Error("Pick at least one start time.");
    let created = 0, skipped = 0;
    WORK.days.forEach(d => times.forEach(t => {
      try { addAvailability({ teacherId, teacherName, dayOfWeek: d, startTime: t, durationMinutes: durationMinutes || 60, meetingLink }); created++; }
      catch (e) { skipped++; }
    }));
    return { created, skipped };
  }

  // ---- what the student may book next ----
  function studentBookingState(studentName, level) {
    const now = nowTz();
    const attended = attendedLessonNumbers(studentName, level);
    const maxAttended = attended.size ? Math.max(...attended) : 0;
    const future = listClasses({ studentName, status: "scheduled" }).filter(c => c.level === level && stillRunning(c, now));
    const maxBooked = future.reduce((m, c) => Math.max(m, Number(c.lessonNumber) || 0), 0);
    const N = (global.Lumio && Lumio.lessonCountFor) ? Lumio.lessonCountFor(level) : 20;
    const nextLesson = Math.max(maxAttended, maxBooked) + 1;
    return { nextLesson: nextLesson > N ? null : nextLesson, maxAttended, maxBooked, futureCount: future.length, levelDone: nextLesson > N };
  }
  // Sun..Sat week (Riyadh) containing date d.
  function weekKey(d) { return addDaysStr(d, -dowOf(d)); }
  function bookingsInWeek(studentName, d) {
    const wk = weekKey(d);
    return listClasses({ studentName, status: "scheduled" }).filter(c => weekKey(c.date) === wk).length;
  }
  function isPast(date, startTime, now) {
    now = now || nowTz();
    return date < now.date || (date === now.date && hmToMin(startTime) <= now.minutes);
  }

  // Every slot a student could book for (level, lesson) in the next
  // BOOK_HORIZON_DAYS: availability slots with no class yet ("new"), and
  // existing classes with the same level+lesson and a free seat ("join").
  // Past slots, blocked dates and full/mismatched classes never appear.
  function openSlots({ studentName, level, lesson, days } = {}) {
    const data = load(); const now = nowTz(); const today = now.date;
    const horizon = addDaysStr(today, days || BOOK_HORIZON_DAYS);
    const teacherName = id => { const t = global.LumioProfiles && global.LumioProfiles.listTeachers ? global.LumioProfiles.listTeachers().find(x => x.id === id) : null; return t ? t.name : ""; };
    const out = [];
    const mine = listClasses({ studentName, status: "scheduled" });
    const busy = (d, hm) => mine.some(c => c.date === d && c.startTime === hm);
    for (let d = today; d <= horizon; d = addDaysStr(d, 1)) {
      if (isDateBlocked(d)) continue;
      const dow = dowOf(d);
      data.patterns.forEach(p => {
        if (!p.active || isLegacyPattern(p) || Number(p.dayOfWeek) !== dow) return;
        if (d < p.startDate || (p.endDate && d >= p.endDate)) return;
        if (isPast(d, p.startTime, now) || busy(d, p.startTime)) return;
        const cls = data.classes.find(c => c.patternId === p.id && c.date === d && c.status !== "cancelled");
        if (!cls) {
          out.push({ kind: "new", date: d, startTime: p.startTime, durationMinutes: lessonDuration(level, lesson), patternId: p.id,
                     teacherId: p.teacherId, teacherName: p.teacherName || teacherName(p.teacherId), seats: MAX_PER_CLASS, taken: 0 });
        } else if (cls.level === level && Number(cls.lessonNumber) === Number(lesson) && cls.students.length < MAX_PER_CLASS
                   && !cls.students.some(s => normName(s.studentName) === normName(studentName))) {
          out.push({ kind: "join", date: d, startTime: cls.startTime, durationMinutes: cls.durationMinutes, classId: cls.id, patternId: p.id,
                     teacherId: cls.teacherId, teacherName: cls.teacherName || teacherName(cls.teacherId), seats: MAX_PER_CLASS, taken: cls.students.length });
        }
      });
      // Manual (teacher-made) sessions for the same level+lesson with a free seat.
      data.classes.forEach(c => {
        if (c.patternId || c.date !== d || c.status !== "scheduled") return;
        if (c.level !== level || Number(c.lessonNumber) !== Number(lesson) || c.students.length >= MAX_PER_CLASS) return;
        if (isPast(d, c.startTime, now) || busy(d, c.startTime)) return;
        if (c.students.some(s => normName(s.studentName) === normName(studentName))) return;
        out.push({ kind: "join", date: d, startTime: c.startTime, durationMinutes: c.durationMinutes, classId: c.id, patternId: null,
                   teacherId: c.teacherId, teacherName: c.teacherName || teacherName(c.teacherId), seats: MAX_PER_CLASS, taken: c.students.length, manual: true });
      });
    }
    return out.sort((a, b) => a.date.localeCompare(b.date) || hmToMin(a.startTime) - hmToMin(b.startTime));
  }

  // THE booking function. `override` (teacher only) skips the subscription,
  // sessions-left and weekly-cap checks -- never the lesson lock, capacity
  // or the past-slot rule.
  function bookStudentIntoSlot({ studentName, studentId, level, lesson, patternId, classId, date, override, notes } = {}) {
    if (!studentName) throw new Error("Which student?");
    if (!level) throw new Error("The student has no level yet.");
    const data = load(); const now = nowTz();
    const st = studentBookingState(studentName, level);
    if (st.levelDone) throw new Error("Every lesson of this level is already attended or booked.");
    lesson = Number(lesson || st.nextLesson);
    if (lesson !== st.nextLesson) throw new Error(`The next class to book is Lesson ${st.nextLesson}.`);
    let cls = classId ? data.classes.find(c => c.id === classId) : null;
    let pat = patternId ? data.patterns.find(p => p.id === patternId) : null;
    if (!cls && pat && date) cls = data.classes.find(c => c.patternId === pat.id && c.date === date && c.status !== "cancelled") || null;
    if (!cls && !pat) throw new Error("Pick a time slot.");
    const slotDate = cls ? cls.date : date, slotTime = cls ? cls.startTime : pat.startTime;
    if (!slotDate) throw new Error("Pick a date.");
    if (isPast(slotDate, slotTime, now)) throw new Error("That time has already passed.");
    if (isDateBlocked(slotDate)) throw new Error("That date is blocked (holiday / day off).");
    if (pat && !isLegacyPattern(pat) && (slotDate < pat.startDate || (pat.endDate && slotDate >= pat.endDate) || Number(pat.dayOfWeek) !== dowOf(slotDate))) throw new Error("That slot isn't available on that date.");
    if (listClasses({ studentName, status: "scheduled" }).some(c => c.date === slotDate && c.startTime === slotTime)) throw new Error("The student already has a class at that time.");
    if (!override) {
      const full = global.LumioProfiles ? (studentId ? global.LumioProfiles.getStudent(studentId) : global.LumioProfiles.findByName(studentName)) : null;
      if (full && !full.subscribed) throw new Error("This student isn't subscribed yet.");
      if (full && !(Number(full.sessionsRemaining) > 0)) throw new Error("No sessions left on this student's package.");
      if (bookingsInWeek(studentName, slotDate) >= MAX_PER_WEEK) throw new Error(`Maximum ${MAX_PER_WEEK} classes per week.`);
    }
    if (cls) {
      if (cls.status === "cancelled") throw new Error("That class was cancelled.");
      if (cls.students.length >= MAX_PER_CLASS) throw new Error("That class is full (4/4).");
      if (cls.lessonNumber && (cls.level !== level || Number(cls.lessonNumber) !== lesson)) throw new Error("That class is for a different lesson.");
      if (!cls.lessonNumber) { cls.level = level; cls.lessonNumber = lesson; cls.durationMinutes = lessonDuration(level, lesson); }
      if (cls.students.some(s => normName(s.studentName) === normName(studentName))) throw new Error("Already booked in that class.");
      cls.students.push({ studentId: studentId || null, studentName, attendance: null, grade: null, teacherRatingStars: null });
      if (notes) cls.notes = (cls.notes ? cls.notes + " · " : "") + notes;
      cls.updatedAt = new Date().toISOString();
      save(data); return cls;
    }
    // first booking creates the class from the availability slot and locks it
    const record = {
      id: genId(), teacherId: pat.teacherId, teacherName: pat.teacherName, date: slotDate, startTime: pat.startTime,
      durationMinutes: lessonDuration(level, lesson), level, cohort: "", group: "", lessonNumber: lesson,
      meetingLink: pat.meetingLink || "", notes: notes || "", sessionNotes: "", status: "scheduled", patternId: pat.id,
      students: [{ studentId: studentId || null, studentName, attendance: null, grade: null, teacherRatingStars: null }],
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    data.classes.push(record); save(data); return record;
  }
  // Student-side cancellation: up to CANCEL_MIN_BEFORE minutes before start.
  // Removes the student; an emptied class is cancelled so the slot reopens.
  function cancelBooking(classId, studentName, { byTeacher } = {}) {
    const data = load(); const now = nowTz();
    const c = data.classes.find(x => x.id === classId);
    if (!c) throw new Error("Class not found.");
    if (!byTeacher) {
      let minsToStart;
      if (global.Lumio && Lumio.tzToDate) minsToStart = (Lumio.tzToDate(c.date, c.startTime).getTime() - Date.now()) / 60000;
      else minsToStart = c.date === now.date ? hmToMin(c.startTime) - now.minutes : (c.date > now.date ? 1e9 : -1e9);
      if (minsToStart < CANCEL_MIN_BEFORE) throw new Error(`Classes can be cancelled up to ${CANCEL_MIN_BEFORE} minutes before they start.`);
    }
    const before = c.students.length;
    c.students = c.students.filter(s => normName(s.studentName) !== normName(studentName));
    if (c.students.length === before) throw new Error("That student isn't in this class.");
    if (!c.students.length) c.status = "cancelled";
    c.updatedAt = new Date().toISOString();
    // Lessons are booked in sequence, so dropping lesson N also drops the
    // student's later bookings (N+1, N+2...) in the same level -- they
    // can't happen before N anyway. Returned as `cascaded` for the UI.
    const n = Number(c.lessonNumber) || 0;
    const cascaded = [];
    if (n) data.classes.forEach(x => {
      if (x.id === c.id || x.status !== "scheduled" || x.level !== c.level || !(Number(x.lessonNumber) > n)) return;
      const b = x.students.length;
      x.students = x.students.filter(s => normName(s.studentName) !== normName(studentName));
      if (x.students.length === b) return;
      if (!x.students.length) x.status = "cancelled";
      x.updatedAt = new Date().toISOString();
      cascaded.push(x);
    });
    c.cascaded = cascaded.map(x => x.id);
    save(data); return c;
  }
  // Later lessons that would be dropped with this one (for the confirm text).
  function laterBookings(classId, studentName) {
    const c = getClass(classId); if (!c || !c.lessonNumber) return [];
    return listClasses({ studentName, status: "scheduled" }).filter(x => x.id !== c.id && x.level === c.level && Number(x.lessonNumber) > Number(c.lessonNumber));
  }
  // Can this student actually join (open the meeting link for) this class?
  // Lesson N's class needs lesson N-1's homework done first.
  function joinGate(studentName, cls) {
    const n = Number(cls.lessonNumber) || 0;
    if (n <= 1 || !global.Lumio || !Lumio.homeworkFor) return { ok: true };
    const hw = (Lumio.homeworkFor(studentName)[cls.level] || {})[n - 1];
    return hw ? { ok: true } : { ok: false, reason: `Finish the homework for Lesson ${n - 1} before joining Lesson ${n}.`, lesson: n - 1 };
  }

  // ---- student-device booking: server is the referee ----
  // A student's phone never pushes the whole schedule, so a booking goes
  // through one narrow server call that re-checks the lock and capacity
  // under a script lock (two students tapping the same seat at once). The
  // local rules run first (instant feedback); the server's answer wins.
  function snapshot() { return JSON.stringify(load()); }
  function restore(snap) { try { save(JSON.parse(snap)); } catch (e) {} }
  function replaceClass(cls) {
    const data = load();
    const i = data.classes.findIndex(c => c.id === cls.id);
    if (i >= 0) data.classes[i] = cls; else data.classes.push(cls);
    save(data);
  }
  async function bookSlotRemote(args) {
    const snap = snapshot();
    const cls = bookStudentIntoSlot(args);
    const cfg = getSyncConfig();
    if (!cfg.enabled || !cfg.url) return cls;
    try {
      const res = await fetchWithTimeout(cfg.url + "?key=" + LUMIO_API_KEY + "&action=bookSlot", {
        method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ cls, student: { studentId: args.studentId || null, studentName: args.studentName }, maxPerClass: MAX_PER_CLASS }),
      });
      const out = await res.json();
      if (!out || !out.ok) {
        restore(snap);
        if (out && /Unknown action/i.test(out.error || "")) throw new Error("Online booking isn't switched on yet — please tell your teacher (the booking server needs its update).");
        throw new Error((out && out.error) || "The server refused that booking.");
      }
      if (out.cls) { normalizeSheetDates(out.cls); replaceClass(out.cls); return out.cls; }
      return cls;
    } catch (e) {
      if (e && /server refused|different lesson|full|cancelled|already|switched on/i.test(e.message || "")) throw e;
      restore(snap);
      throw new Error("Couldn't reach the booking server — check your connection and try again.");
    }
  }
  async function cancelBookingRemote(classId, studentName) {
    const snap = snapshot();
    const cls = cancelBooking(classId, studentName, {});
    const cfg = getSyncConfig();
    if (!cfg.enabled || !cfg.url) return cls;
    try {
      const res = await fetchWithTimeout(cfg.url + "?key=" + LUMIO_API_KEY + "&action=cancelSlot", {
        method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ classId, studentName, minBefore: CANCEL_MIN_BEFORE }),
      });
      const out = await res.json();
      if (!out || !out.ok) {
        restore(snap);
        if (out && /Unknown action/i.test(out.error || "")) throw new Error("Online booking isn't switched on yet — please tell your teacher (the booking server needs its update).");
        throw new Error((out && out.error) || "The server refused that cancellation.");
      }
      if (out.cls) { normalizeSheetDates(out.cls); delete out.cls.cascaded; replaceClass(out.cls); }
      return cls;
    } catch (e) {
      if (e && /server refused|minutes before|not found|isn't in|switched on/i.test(e.message || "")) throw e;
      restore(snap);
      throw new Error("Couldn't reach the booking server — check your connection and try again.");
    }
  }

  // ---- student fixed weekly schedule ----
  // picks: [{ dayOfWeek, startTime, teacherId }] (max MAX_PER_WEEK). The
  // plan is just the same single bookings made in sequence: every matching
  // date in the horizon gets the student's next lesson, under exactly the
  // rules above. Preview = run the bookings locally on a snapshot, collect
  // the outcome per date, then put the data back untouched.
  function weeklySlotOptions(dayOfWeek) {
    return load().patterns.filter(p => p.active && !isLegacyPattern(p) && Number(p.dayOfWeek) === Number(dayOfWeek))
      .sort((a, b) => hmToMin(a.startTime) - hmToMin(b.startTime));
  }
  function weeklyPlanPreview({ studentName, studentId, level, picks, days } = {}) {
    const snap = snapshot();
    const out = [];
    try {
      const today = todayStr();
      const horizon = addDaysStr(today, days || BOOK_HORIZON_DAYS);
      const full = global.LumioProfiles ? (studentId ? global.LumioProfiles.getStudent(studentId) : global.LumioProfiles.findByName(studentName)) : null;
      let sessionsLeft = full ? Number(full.sessionsRemaining) || 0 : 99;
      for (let d = today; d <= horizon; d = addDaysStr(d, 1)) {
        const dow = dowOf(d);
        (picks || []).filter(pk => Number(pk.dayOfWeek) === dow).sort((a, b) => hmToMin(a.startTime) - hmToMin(b.startTime)).forEach(pk => {
          const pat = load().patterns.find(p => p.active && !isLegacyPattern(p) && p.teacherId === pk.teacherId && Number(p.dayOfWeek) === dow && p.startTime === pk.startTime);
          const item = { date: d, startTime: pk.startTime, teacherId: pk.teacherId, teacherName: pat ? pat.teacherName : "", lesson: null, ok: false, reason: "" };
          if (!pat) { item.reason = "That teacher no longer has this slot."; out.push(item); return; }
          if (isPast(d, pk.startTime)) return; // silently skip what already passed
          const st = studentBookingState(studentName, level);
          if (st.levelDone) { item.reason = "Level complete — nothing more to book."; out.push(item); return; }
          if (sessionsLeft <= 0) { item.reason = "No sessions left on the package after the bookings above."; out.push(item); return; }
          try {
            const cls = bookStudentIntoSlot({ studentName, studentId, level, lesson: st.nextLesson, patternId: pat.id, date: d });
            item.lesson = cls.lessonNumber; item.ok = true; item.patternId = pat.id; item.classId = cls.id;
            item.kind = cls.students.length > 1 ? "join" : "new"; item.taken = cls.students.length - 1;
            sessionsLeft--;
          } catch (e) { item.reason = e.message; }
          out.push(item);
        });
      }
    } finally { restore(snap); }
    return out;
  }
  async function bookWeeklyRemote({ studentName, studentId, level, picks, days } = {}) {
    const plan = weeklyPlanPreview({ studentName, studentId, level, picks, days });
    const results = [];
    for (const item of plan) {
      if (!item.ok) { results.push(item); continue; }
      try {
        const cls = await bookSlotRemote({ studentName, studentId, level, lesson: item.lesson, patternId: item.patternId, date: item.date });
        results.push(Object.assign({}, item, { ok: true, classId: cls.id }));
      } catch (e) {
        results.push(Object.assign({}, item, { ok: false, reason: e.message }));
        if (/switched on|reach the booking server/i.test(e.message || "")) break; // no point continuing offline
      }
    }
    return results;
  }
  const FIXED_PLAN_KEY = "lumio_fixed_plan_v1";
  function fixedPlanFor(studentName) {
    try { const all = JSON.parse(localStorage.getItem(FIXED_PLAN_KEY) || "{}"); return all[normName(studentName)] || null; } catch (e) { return null; }
  }
  function saveFixedPlan(studentName, picks) {
    try {
      const all = JSON.parse(localStorage.getItem(FIXED_PLAN_KEY) || "{}");
      if (picks && picks.length) all[normName(studentName)] = { picks, savedAt: new Date().toISOString() }; else delete all[normName(studentName)];
      localStorage.setItem(FIXED_PLAN_KEY, JSON.stringify(all));
    } catch (e) {}
  }

  global.LumioSchedule = {
    listClasses, getClass,
    bookSlotRemote, cancelBookingRemote, laterBookings,
    weeklySlotOptions, weeklyPlanPreview, bookWeeklyRemote, fixedPlanFor, saveFixedPlan,
    // booking model
    WORK, MAX_PER_CLASS, MAX_PER_WEEK, CANCEL_MIN_BEFORE, lessonDuration, inWorkingHours, isPast, isLegacyPattern,
    addAvailability, setWeeklyAvailability, availabilityForTeacher, availabilityStatus, studentBookingState, bookingsInWeek, openSlots,
    bookStudentIntoSlot, cancelBooking, joinGate,
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
