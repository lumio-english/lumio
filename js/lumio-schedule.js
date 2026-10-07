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
 *       meetingLink,  // Teams / Zoom / Google Meet URL for this session (falls back to the slot's, then the teacher's)
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
    // Removed holidays: [{date, deletedAt}]. A blocked date without one of
    // these came back from the Sheet's union on the next sync, so removing
    // a holiday never stuck. Shared as DeletedIds type "blockedDate".
    if (!Array.isArray(data.deletedBlockedDates)) data.deletedBlockedDates = [];
    return data;
  }
  // ---- field-level change times (3 Oct 2026) ----
  // Same scheme as lumio-profiles.js: every class/pattern carries
  // fieldTimes = { field: ISO time, _base: updatedAt before tracking }, and
  // every seat in class.students carries its own updatedAt. save() stamps
  // whatever changed against the stored copy, so updateClass, markAttendance,
  // gradeStudent, rateTeacher, notes, bookings, cancellations are all
  // covered. A removed seat leaves fieldTimes._seatsRemoved[key] = time so
  // the per-seat union in mergeSeats can't bring it back. Sync and rollback
  // saves pass { noStamp: true }.
  const STAMP_SKIP = { id: 1, updatedAt: 1, fieldTimes: 1, createdAt: 1, students: 1 };
  const nn = v => String(v || "").trim().toLowerCase();
  function sameSeat(x, y) {
    if (!x || !y) return false;
    if (x.studentId && y.studentId) return x.studentId === y.studentId;
    return nn(x.studentName) !== "" && nn(x.studentName) === nn(y.studentName);
  }
  function seatKeys(s) {
    return [s && s.studentId ? "id:" + s.studentId : "", s && nn(s.studentName) ? "n:" + nn(s.studentName) : ""].filter(Boolean);
  }
  function seatSansTime(s) { const c = Object.assign({}, s); delete c.updatedAt; return JSON.stringify(c); }
  // `now`, or 1 ms after the latest of the given times when the local
  // clock is behind them (so an edit always beats what it edited).
  function notBefore(now, ...prior) {
    const t = Math.max(Date.parse(now) || 0, ...prior.map(v => { const n = v ? Date.parse(v) : NaN; return isNaN(n) ? 0 : n + 1; }));
    return new Date(t).toISOString();
  }
  function stampChanges(prev, data, now) {
    ["classes", "patterns"].forEach(listKey => {
      const before = {};
      ((prev && prev[listKey]) || []).forEach(r => { if (r && r.id) before[r.id] = r; });
      (data[listKey] || []).forEach(r => {
        const old = r && before[r.id];
        if (!old) return;
        if (JSON.stringify(r) === JSON.stringify(old)) return; // cheap path: untouched record
        let ft = null;
        const touch = () => {
          if (!ft) {
            ft = (r.fieldTimes && typeof r.fieldTimes === "object") ? r.fieldTimes : {};
            if (!ft._base) ft._base = old.updatedAt || r.createdAt || "";
          }
          return ft;
        };
        Object.keys(Object.assign({}, old, r)).forEach(k => {
          if (STAMP_SKIP[k] && !(k === "students" && listKey === "patterns")) return;
          if (JSON.stringify(r[k]) !== JSON.stringify(old[k])) { const f = touch(); f[k] = notBefore(now, f[k], old.updatedAt); }
        });
        if (listKey === "classes") {
          const oldSeats = Array.isArray(old.students) ? old.students : [];
          (r.students || []).forEach(s => {
            const o = oldSeats.find(x => sameSeat(x, s));
            // never stamp a seat edit older than the copy it replaces: a
            // teacher device whose clock runs behind the server would
            // otherwise lose the attendance mark on the next merge while
            // the session deduction (always kept) stays
            if (!o || seatSansTime(o) !== seatSansTime(s)) { s.updatedAt = notBefore(now, o && o.updatedAt); touch(); }
          });
          oldSeats.forEach(o => {
            if ((r.students || []).some(s => sameSeat(o, s))) return;
            const t = touch();
            t._seatsRemoved = (t._seatsRemoved && typeof t._seatsRemoved === "object") ? t._seatsRemoved : {};
            seatKeys(o).forEach(k => { t._seatsRemoved[k] = now; });
          });
        }
        if (ft || r.updatedAt !== old.updatedAt) { touch(); r.fieldTimes = ft; r.updatedAt = now; }
      });
    });
  }
  function save(data, opts) {
    const now = new Date().toISOString();
    if (!(opts && opts.noStamp)) {
      let prev = null;
      try { prev = JSON.parse(safeGet(SCHEDULE_KEY) || "null"); } catch (e) { prev = null; }
      stampChanges(prev, data, now);
    }
    data.updatedAt = now;
    safeSet(SCHEDULE_KEY, JSON.stringify(data));
    return data;
  }

  // ---- per-field merge (same rules as mergeFields_/mergeClass_ in the
  // Apps Script; keep the three copies -- here, lumio-profiles.js, Code.gs --
  // in step) ----
  function ftOf(rec) {
    let ft = rec && rec.fieldTimes;
    if (typeof ft === "string") { try { ft = ft ? JSON.parse(ft) : null; } catch (e) { ft = null; } }
    return ft && typeof ft === "object" ? ft : {};
  }
  function tms(v) { const n = v ? Date.parse(v) : NaN; return isNaN(n) ? 0 : n; }
  function fieldTime(rec, ft, k) { return tms(ft[k]) || tms(ft._base) || tms(rec.updatedAt); }
  function baseTime(rec, ft) { return tms(ft._base) || tms(rec.updatedAt); }
  // a wins exact ties (the caller passes the Sheet's copy as a).
  function mergeFields(a, b, skip) {
    const fa = ftOf(a), fb = ftOf(b), out = {}, ft = {};
    const base = Math.max(baseTime(a, fa), baseTime(b, fb));
    Object.keys(Object.assign({}, a, b)).forEach(k => {
      if (k === "fieldTimes" || k === "updatedAt" || (skip && skip[k])) return;
      const va = a[k], vb = b[k];
      let t;
      if (vb === undefined) { out[k] = va; t = fieldTime(a, fa, k); }
      else if (va === undefined) { out[k] = vb; t = fieldTime(b, fb, k); }
      else {
        const ta = fieldTime(a, fa, k), tb = fieldTime(b, fb, k);
        if (JSON.stringify(va) === JSON.stringify(vb)) { out[k] = va; t = Math.max(ta, tb); }
        else if (tb > ta) { out[k] = vb; t = tb; }
        else { out[k] = va; t = ta; }
      }
      if (t && t !== base) ft[k] = new Date(t).toISOString();
    });
    if (base) ft._base = new Date(base).toISOString();
    out.updatedAt = tms(b.updatedAt) > tms(a.updatedAt) ? b.updatedAt : a.updatedAt;
    out.fieldTimes = ft;
    return out;
  }
  // Seats merge one by one (matched by studentId, else name), each by its
  // own updatedAt: a teacher marking attendance on one device and another
  // device grading, or a student's rating arriving through the script, all
  // survive. A seat removed on either side stays removed unless it was
  // re-added after the removal.
  function mergeSeats(a, b, tombs) {
    const seatT = (cls, s) => tms(s && s.updatedAt) || fieldTime(cls, ftOf(cls), "students");
    const out = [];
    (a.students || []).forEach(s => { if (s) out.push({ s, t: seatT(a, s) }); });
    (b.students || []).forEach(s => {
      if (!s) return;
      const t = seatT(b, s);
      const hit = out.find(x => sameSeat(x.s, s));
      if (!hit) { out.push({ s, t }); return; }
      const win = t > hit.t ? s : hit.s, lose = win === s ? hit.s : s;
      const m = Object.assign({}, win);
      // Ratings are only ever set, and a deducted session stays deducted.
      if ((m.teacherRatingStars === null || m.teacherRatingStars === undefined || m.teacherRatingStars === "") && lose.teacherRatingStars) m.teacherRatingStars = lose.teacherRatingStars;
      if (lose.sessionDeducted && !m.sessionDeducted) m.sessionDeducted = true;
      if (!m.studentId && lose.studentId) m.studentId = lose.studentId;
      hit.s = m; hit.t = Math.max(t, hit.t);
    });
    return out.filter(x => {
      const gone = Math.max(0, ...seatKeys(x.s).map(k => tms(tombs[k])));
      return !(gone && gone >= x.t);
    }).map(x => x.s);
  }
  function mergeClass(a, b) {
    const out = mergeFields(a, b, { students: 1 });
    const tombs = Object.assign({}, ftOf(a)._seatsRemoved || {});
    Object.entries(ftOf(b)._seatsRemoved || {}).forEach(([k, v]) => { if (tms(v) > tms(tombs[k])) tombs[k] = v; });
    out.students = mergeSeats(a, b, tombs);
    if (Object.keys(tombs).length) out.fieldTimes._seatsRemoved = tombs;
    // Status follows the merged seats (a seat added elsewhere reopens a
    // "completed" class), except a cancellation.
    if (out.status !== "cancelled" && out.students.length) {
      out.status = out.students.every(s => s.attendance) ? "completed" : "scheduled";
    }
    return out;
  }
  // Two copies of one fixed-schedule session (same pattern + date): two
  // teacher devices generated it, or an old random-id copy meets the new
  // `${patternId}_${date}` one. Keep the oldest, fold the other's seats and
  // fields in. Bookings for different students at different lessons in the
  // same open slot are NOT merged (that's a real clash for the teacher).
  function dedupePatternClasses(classes) {
    const groups = {};
    classes.forEach(c => {
      if (!c || !c.patternId || !c.date || c.status === "cancelled") return;
      const k = c.patternId + "|" + c.date;
      (groups[k] = groups[k] || []).push(c);
    });
    const drop = new Set(), replace = {};
    Object.values(groups).forEach(g => {
      if (g.length < 2) return;
      g.sort((x, y) => (x.createdAt || "").localeCompare(y.createdAt || "") || String(x.id).localeCompare(String(y.id)));
      let keep = g[0];
      g.slice(1).forEach(o => {
        const shares = (o.students || []).some(s => (keep.students || []).some(k => sameSeat(k, s)));
        const sameLesson = (!keep.level || !o.level || keep.level === o.level)
          && (!keep.lessonNumber || !o.lessonNumber || Number(keep.lessonNumber) === Number(o.lessonNumber));
        if (!shares && !sameLesson && (o.students || []).length && (keep.students || []).length) return;
        const merged = mergeClass(keep, o);
        merged.id = keep.id;
        merged.createdAt = keep.createdAt || o.createdAt;
        keep = merged;
        drop.add(o.id);
      });
      replace[g[0].id] = keep;
    });
    if (!drop.size && !Object.keys(replace).length) return classes;
    return classes.filter(c => !drop.has(c.id)).map(c => replace[c.id] || c);
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
      meetingLink: meetingLink || teacherDefaultLink(teacherId) || "",
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
      // Matched by id, else by name (sameSeat): an exact "id|name" key
      // treated a seat saved without a studentId as a new student and
      // wiped its attendance/grade on re-save.
      const oldSeats = c.students.slice();
      c.students = patch.students.map(s => {
        const existing = oldSeats.find(o => sameSeat(o, s));
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
          global.LumioProfiles.updateStudent(full.id, { sessionsRemaining: Math.max(0, (Number(full.sessionsRemaining) || 0) - 1) });
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
  // Teacher's evaluation of one student for one session: a letter grade
  // and an optional comment (`comment` undefined = leave it as it is).
  function gradeStudent(classId, studentRef, grade, comment) {
    if (grade !== null && grade !== undefined && VALID_GRADES.indexOf(grade) === -1) {
      throw new Error("Grade must be one of: " + VALID_GRADES.join(", ") + " (or null to clear it).");
    }
    const data = load();
    const c = data.classes.find(x => x.id === classId);
    if (!c) throw new Error("Class not found.");
    const slot = findStudentSlot(c, typeof studentRef === "string" ? { studentName: studentRef } : studentRef);
    if (!slot) throw new Error("That student isn't booked into this class.");
    if (grade !== undefined) slot.grade = grade;
    if (comment !== undefined) slot.gradeComment = String(comment || "").trim().slice(0, 600);
    if (slot.grade || slot.gradeComment) slot.gradedAt = new Date().toISOString();
    c.updatedAt = new Date().toISOString();
    save(data);
    return c;
  }
  // Classes that ENDED, weren't cancelled, and still have a present
  // student without a grade -- the teacher's "evaluate now" list.
  function needsEvaluation(filter) {
    return listClasses(filter).filter(c => c.status !== "cancelled" && hasEnded(c)
      && c.students.some(s => s.attendance === "present" && !s.grade));
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
    // Student devices never push the schedule, so the rating used to stay
    // on the phone and never reached the teacher. It now goes to the
    // script's rateClass action (only the caller's own seat); offline or
    // not-yet-deployed script -> queued and retried (retryPendingRatings).
    // Teacher devices just sync normally.
    if (isStudentOnlyDevice()) {
      queueRating(classId, n);
      retryPendingRatings().catch(() => {});
    }
    return c;
  }
  // ---- ratings waiting to reach the script ----
  const PENDING_RATINGS_KEY = "lumio_pending_ratings";
  function pendingRatings() {
    try { const a = JSON.parse(safeGet(PENDING_RATINGS_KEY) || "[]"); return Array.isArray(a) ? a : []; } catch (e) { return []; }
  }
  function setPendingRatings(list) {
    if (list.length) safeSet(PENDING_RATINGS_KEY, JSON.stringify(list));
    else { try { localStorage.removeItem(PENDING_RATINGS_KEY); } catch (e) { delete memory[PENDING_RATINGS_KEY]; } }
  }
  function queueRating(classId, stars) {
    setPendingRatings(pendingRatings().filter(r => r.classId !== classId).concat([{ classId, stars }]));
  }
  // The pulled schedule replaces a student's copy; keep showing a rating
  // that hasn't been accepted yet so the rating card doesn't come back.
  function applyPendingRatings(data) {
    const me = global.LumioProfiles && LumioProfiles.getStudentAuth ? LumioProfiles.getStudentAuth() : null;
    let myName = "";
    try { myName = (global.Lumio && Lumio.user && Lumio.user() && Lumio.user().name) || ""; } catch (e) {}
    pendingRatings().forEach(r => {
      const c = data.classes.find(x => x.id === r.classId);
      const slot = c && (c.students || []).find(s => (me && s.studentId === me.id) || (myName && nn(s.studentName) === nn(myName)));
      if (slot && !slot.teacherRatingStars) slot.teacherRatingStars = r.stars;
    });
  }
  let ratingRetryRunning = false;
  async function retryPendingRatings() {
    if (ratingRetryRunning) return { ok: true, sent: 0 };
    const list = pendingRatings();
    if (!list.length || !isStudentOnlyDevice()) return { ok: true, sent: 0 };
    const cfg = getSyncConfig();
    if (!cfg.enabled || !cfg.url) return { ok: false, reason: "not-configured" };
    ratingRetryRunning = true;
    let sent = 0;
    try {
      for (const r of list) {
        let out = null;
        try {
          const res = await fetchWithTimeout(cfg.url + "?key=" + LUMIO_API_KEY + "&action=rateClass" + LumioProfiles.authQuery(), {
            method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({ classId: r.classId, stars: r.stars }),
          });
          out = await res.json();
        } catch (e) { out = null; }
        // Delivered, or refused for good (class gone / not this student's):
        // drop it. Network trouble or an older script: keep for next time.
        const final = out && (out.ok || /not found|isn't in|Rating must/i.test(out.error || ""));
        if (final) {
          sent += out.ok ? 1 : 0;
          setPendingRatings(pendingRatings().filter(x => !(x.classId === r.classId && x.stars === r.stars)));
        }
      }
    } finally { ratingRetryRunning = false; }
    return { ok: pendingRatings().length === 0, sent };
  }
  // A class has STARTED once its start time has passed on the Riyadh
  // clock, and ENDED once start + duration has. Every class date/time is
  // Saudi wall time (see Lumio.tzNow in js/app.js).
  function startMs(c) {
    if (global.Lumio && typeof Lumio.tzToDate === "function") return Lumio.tzToDate(c.date, c.startTime || "00:00").getTime();
    const [y, m, d] = String(c.date || "").split("-").map(Number);
    const [h, mi] = String(c.startTime || "00:00").split(":").map(Number);
    return Date.UTC(y, (m || 1) - 1, d || 1, (h || 0) - 3, mi || 0); // Riyadh = UTC+3, no DST
  }
  function hasStarted(c) { return !!(c && c.date) && startMs(c) <= Date.now(); }
  function hasEnded(c) { return !!(c && c.date) && startMs(c) + (Number(c.durationMinutes) || 45) * 60000 <= Date.now(); }
  // Classes that have STARTED, weren't cancelled, and still have at least
  // one student with no attendance marked yet — the teacher's "these need
  // attention" list. Used to compare dates only, so every class later
  // today showed up here (and asked for attendance) from midnight on.
  function needsAttendance(filter) {
    return listClasses(filter).filter(c =>
      c.status !== "cancelled" && hasStarted(c) && !completionState(c).complete
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
  // class" card. Dates are read on the Riyadh clock (the Sheet's zone):
  // they used to be read on the device's clock, so a student in Egypt or
  // Europe saw a class from the night before, or an hour off.
  function riyadhParts(d) {
    try {
      const f = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Riyadh", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
      const o = {}; f.formatToParts(d).forEach(p => { o[p.type] = p.value; });
      return { date: `${o.year}-${o.month}-${o.day}`, hm: `${o.hour === "24" ? "00" : o.hour}:${o.minute}` };
    } catch (e) {
      const pad = n => String(n).padStart(2, "0");
      return { date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, hm: `${pad(d.getHours())}:${pad(d.getMinutes())}` };
    }
  }
  function normalizeSheetDates(rec) {
    if (!rec) return rec;
    ["date", "startDate", "endDate"].forEach(k => {
      const v = rec[k];
      if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}T/.test(v)) {
        const d = new Date(v);
        if (!isNaN(d)) rec[k] = riyadhParts(d).date;
      }
    });
    const t = rec.startTime;
    if (typeof t === "string" && /^\d{4}-\d{2}-\d{2}T/.test(t)) {
      const d = new Date(t);
      if (!isNaN(d)) rec.startTime = riyadhParts(d).hm;
    }
    if (typeof rec.lessonNumber === "string" && /^\d+$/.test(rec.lessonNumber)) rec.lessonNumber = Number(rec.lessonNumber);
    if (typeof rec.durationMinutes === "string" && /^\d+$/.test(rec.durationMinutes)) rec.durationMinutes = Number(rec.durationMinutes);
    // fieldTimes arrives as JSON text from the Sheet (or "" on old rows).
    if (rec.fieldTimes !== undefined) {
      const ft = ftOf(rec);
      if (Object.keys(ft).length) rec.fieldTimes = ft; else delete rec.fieldTimes;
    }
    return rec;
  }
  // Per field / per seat since 3 Oct 2026 (see mergeFields, mergeClass):
  // whole-record newest-wins lost one of two edits made on different
  // devices to the same class (session notes vs attendance).
  function mergeById(localList, remoteList, isClass) {
    const byId = {};
    localList.forEach(r => { byId[r.id] = r; });
    remoteList.forEach(r => {
      const local = byId[r.id];
      if (!local) { byId[r.id] = r; return; }
      byId[r.id] = isClass ? mergeClass(r, local) : mergeFields(r, local); // the Sheet's copy wins exact ties
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

  // Blocked dates: union by date (the newest addedAt keeps the label),
  // minus any date whose removal is newer than its adding. Re-adding a
  // removed holiday works because the new addedAt is newer than the
  // tombstone. Plain-string entries from before addedAt existed count as
  // added "long ago".
  function blockedTombs(data, remoteDeleted) {
    const t = {};
    (data.deletedBlockedDates || []).forEach(x => { if (x && x.date && tms(x.deletedAt) >= tms(t[x.date])) t[x.date] = x.deletedAt || ""; });
    (remoteDeleted || []).forEach(e => { if (e && e.type === "blockedDate" && e.id && tms(e.deletedAt) > tms(t[e.id])) t[e.id] = e.deletedAt; });
    return t;
  }
  function mergeBlockedDates(localList, remoteList, tombs) {
    const by = {};
    const add = b => {
      const e = typeof b === "string" ? { date: b, label: "" } : Object.assign({}, b);
      if (!e || !e.date) return;
      e.label = e.label || "";
      const prev = by[e.date];
      if (!prev || tms(e.addedAt) > tms(prev.addedAt)) by[e.date] = e;
    };
    (localList || []).forEach(add); (remoteList || []).forEach(add);
    return Object.values(by).filter(e => !(e.date in tombs && tms(tombs[e.date]) >= tms(e.addedAt)));
  }
  function isStudentOnlyDevice() {
    try {
      return !!(global.LumioProfiles && LumioProfiles.getStudentAuth && LumioProfiles.getStudentAuth()
        && !LumioProfiles.getTeacherAuth() && localStorage.getItem("lumio_teacher") !== "1");
    } catch (e) { return false; }
  }

  // opts.pullOnly: pull + merge + save only (student devices never push).
  // A full (teacher) sync also runs generateUpcoming() between the pull and
  // the push, so a fresh device generates fixed-schedule sessions from the
  // shared data instead of from its own empty copy.
  async function syncNow(opts) {
    const pullOnly = !!(opts && opts.pullOnly);
    const cfg = getSyncConfig();
    if (!cfg.enabled || !cfg.url) return { ok: false, reason: "not-configured" };
    let data;
    try {
      const res = await fetchWithTimeout(cfg.url + "?key=" + LUMIO_API_KEY + "&action=pullScheduleV2" + ((global.LumioProfiles && LumioProfiles.authQuery) ? LumioProfiles.authQuery() : ""));
      const remote = await res.json();
      // The script refused (signed out, wrong PIN): report it, never
      // treat it as "the schedule is empty".
      if (remote && remote.ok === false) return { ok: false, reason: remote.error || "refused" };
      // Loaded only now, so an edit made while the pull was in flight is
      // not overwritten by the save below.
      data = load();
      const studentOnly = isStudentOnlyDevice();
      if (remote && Array.isArray(remote.deletedIds)) {
        remote.deletedIds.forEach(e => {
          if (!e || !e.id) return;
          if (e.type === "class" && !data.deletedClassIds.includes(e.id)) data.deletedClassIds.push(e.id);
          if (e.type === "pattern" && !data.deletedPatternIds.includes(e.id)) data.deletedPatternIds.push(e.id);
        });
      }
      if (studentOnly) {
        // A student device receives only its own classes (others as
        // anonymous seats) and never edits the schedule except through the
        // script (booking, cancel, rating), so the script's copy simply
        // replaces what an older version cached here. Anonymous seats can't
        // be merged seat by seat anyway.
        if (remote && Array.isArray(remote.classes)) data.classes = remote.classes.map(normalizeSheetDates);
        if (remote && Array.isArray(remote.patterns)) data.patterns = remote.patterns.map(normalizeSheetDates);
        applyPendingRatings(data); // a rating still waiting to reach the script stays visible
      } else {
        if (remote && Array.isArray(remote.classes)) {
          remote.classes.forEach(normalizeSheetDates);
          data.classes = mergeById(data.classes, remote.classes.filter(c => !data.deletedClassIds.includes(c.id)), true);
        }
        if (remote && Array.isArray(remote.patterns)) {
          remote.patterns.forEach(normalizeSheetDates);
          data.patterns = mergeById(data.patterns, remote.patterns.filter(p => !data.deletedPatternIds.includes(p.id)));
        }
      }
      data.classes = dedupePatternClasses(data.classes.filter(c => !data.deletedClassIds.includes(c.id)));
      data.patterns = data.patterns.filter(p => !data.deletedPatternIds.includes(p.id));
      if (remote && Array.isArray(remote.blockedDates)) {
        const tombs = blockedTombs(data, remote.deletedIds);
        data.deletedBlockedDates = Object.keys(tombs).map(date => ({ date, deletedAt: tombs[date] }));
        data.blockedDates = mergeBlockedDates(data.blockedDates, remote.blockedDates, tombs);
      }
      save(data, { noStamp: true }); // the Sheet's values, not a local edit
      // A class a student booked into a teacher's slot may carry no live-class
      // link (booked through an older script, which didn't copy it), and the
      // student's device can't look up the slot's or teacher's link itself.
      // The teacher's device fills it in (a stamped edit, so the push wins).
      if (!studentOnly) { try { relinkFutureClasses({}); } catch (e) { console.warn("Lumio: relink failed", e); } }
      if (pullOnly) return { ok: true, at: new Date().toISOString(), pullOnly: true };
      // Fixed schedules: generate / apply holidays / renumber on the merged
      // data, then push the result (two devices produce the same ids).
      let generated = null;
      if (!studentOnly) { try { generated = generateUpcoming(); } catch (e) { console.warn("Lumio: generateUpcoming failed", e); } }
      data = load();
      const pushRes = await fetchWithTimeout(cfg.url + "?key=" + LUMIO_API_KEY + "&action=pushScheduleV2" + ((global.LumioProfiles && LumioProfiles.authQuery) ? LumioProfiles.authQuery() : ""), {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          classes: data.classes, patterns: data.patterns, blockedDates: data.blockedDates,
          deletedIds: [
            ...data.deletedClassIds.map(id => ({ id, type: "class", deletedAt: new Date().toISOString() })),
            ...data.deletedPatternIds.map(id => ({ id, type: "pattern", deletedAt: new Date().toISOString() })),
            // the real removal time: a later re-add must beat it
            ...data.deletedBlockedDates.map(x => ({ id: x.date, type: "blockedDate", deletedAt: x.deletedAt })),
          ],
        }),
      });
      let pushed = null;
      try { pushed = await pushRes.json(); } catch (e) { pushed = null; }
      if (!pushed || pushed.ok === false) return { ok: false, reason: (pushed && pushed.error) || "push-failed" };
      return { ok: true, at: new Date().toISOString(), generated };
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
      if (slot && (slot.grade || slot.gradeComment)) out.push({ classId: c.id, date: c.date, lessonNumber: c.lessonNumber, grade: slot.grade || null, comment: slot.gradeComment || "", teacherName: c.teacherName || "", gradedAt: slot.gradedAt || null });
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
    const past = all.filter(hasStarted); // a class later today hasn't happened yet
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
      // hasStarted: a class earlier today already happened with its real teacher
      if (c.teacherId === fromTeacherId && c.date >= fromDate && c.date <= toDate && c.status === "scheduled" && !hasStarted(c)) {
        const oldDefault = teacherDefaultLink(fromTeacherId);
        if (!c.meetingLink || (oldDefault && c.meetingLink === oldDefault)) c.meetingLink = teacherDefaultLink(toTeacherId) || "";
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
      // a session that already started today happened: not cancelled
      if (c.patternId === id && c.date >= from && c.status === "scheduled" && !hasStarted(c)) {
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
  // Entries are { date, label, addedAt } (old ones may be bare strings).
  const blockedKey = b => (typeof b === "string" ? b : (b && b.date));
  function listBlockedDates() {
    // Sorted by date: plain .sort() never ordered the {date,label} objects.
    return load().blockedDates.slice().sort((x, y) => String(blockedKey(x)).localeCompare(String(blockedKey(y))));
  }
  // Adding a holiday cancels the fixed-schedule sessions already generated
  // for that date (none marked yet); generateUpcoming() skips it from now
  // on. Returns the sorted list (as before) with .cancelled = how many
  // sessions were called off.
  function addBlockedDate(date, label) {
    if (!date) throw new Error("Pick a date to block.");
    const data = load();
    if (!data.blockedDates.some(b => blockedKey(b) === date)) {
      data.blockedDates.push({ date, label: label || "", addedAt: new Date().toISOString() });
      save(data);
    }
    const r = generateUpcoming();
    const list = listBlockedDates();
    list.cancelled = r.cancelled;
    return list;
  }
  // Removing one leaves a tombstone (shared as DeletedIds type
  // "blockedDate") so the Sheet's copy can't bring it back, puts back the
  // sessions that holiday had cancelled and renumbers the lessons after
  // it. Returns the sorted list with .reinstated / .created.
  function removeBlockedDate(date) {
    const data = load();
    data.blockedDates = data.blockedDates.filter(b => blockedKey(b) !== date);
    data.deletedBlockedDates = data.deletedBlockedDates.filter(x => x.date !== date)
      .concat([{ date, deletedAt: new Date().toISOString() }]);
    save(data);
    const r = generateUpcoming();
    const list = listBlockedDates();
    list.reinstated = r.reinstated;
    list.created = r.created;
    return list;
  }
  function isDateBlocked(date) {
    return load().blockedDates.some(b => blockedKey(b) === date);
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

  // Generated sessions get a deterministic id, so two teacher devices
  // generating the same pattern produce the SAME class instead of two
  // (old random ids stay readable; dedupePatternClasses folds them in).
  // Their updatedAt is a fixed long-ago time: a device that generated a
  // session before its first sync must never out-rank the copy the Sheet
  // already has (attendance, notes, lesson number) on any field.
  const GENERATED_AT = "2000-01-01T00:00:00.000Z";
  function patternClassId(patternId, date) { return `${patternId}_${date}`; }
  const unmarked = c => !(c.students || []).some(s => s.attendance);

  // Materializes real class rows for every active pattern, `weeks` weeks
  // ahead from today (default 4) — call this on dashboard load and it's
  // safe to call as often as you like, since it never creates a
  // duplicate for a date it's already generated. LumioSchedule.syncNow()
  // also runs it on teacher devices right after merging the Sheet's data.
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
  //
  // It also keeps generated sessions consistent with the shared data:
  //  - holidays: a not-yet-started, unmarked session on a blocked date is
  //    cancelled (cancelReason "holiday"); one whose holiday was removed
  //    is put back;
  //  - lesson numbers: Nth non-cancelled session = lessonStart + N - 1,
  //    recomputed for sessions that haven't started/been marked, so a
  //    removed holiday or a session generated late never duplicates one;
  //  - duplicates of one pattern+date are folded together.
  function generateUpcoming(weeks) {
    weeks = weeks || 4;
    const data = load();
    const today = todayStr();
    const horizon = addWeeks(today, weeks);
    const created = [];
    const skippedUnsubscribed = [];
    let cancelled = 0, reinstated = 0, renumbered = 0;
    const blocked = new Set(data.blockedDates.map(blockedKey));
    const legacy = {};
    data.patterns.forEach(p => { if (isLegacyPattern(p)) legacy[p.id] = p; });

    const before = data.classes.length;
    data.classes = dedupePatternClasses(data.classes);
    const deduped = before - data.classes.length;

    data.classes.forEach(c => {
      if (!c.patternId || !legacy[c.patternId] || hasStarted(c) || !unmarked(c)) return;
      if (blocked.has(c.date) && c.status === "scheduled") {
        c.status = "cancelled"; c.cancelReason = "holiday"; c.updatedAt = new Date().toISOString(); cancelled++;
      } else if (!blocked.has(c.date) && c.status === "cancelled" && c.cancelReason === "holiday") {
        c.status = "scheduled"; c.cancelReason = ""; c.updatedAt = new Date().toISOString(); reinstated++;
      }
    });

    data.patterns.forEach(p => {
      if (!p.active || !isLegacyPattern(p)) return; // availability slots materialize on first booking, not here
      let d = nextDateForDayOfWeek(p.startDate > today ? p.startDate : today, p.dayOfWeek);
      while (d <= horizon) {
        const id = patternClassId(p.id, d);
        const inRange = d >= p.startDate && (!p.endDate || d < p.endDate);
        // A cancelled session stays as "skip this date"; a REMOVED one
        // (tombstone) must not come straight back either.
        const alreadyExists = data.classes.some(c => c.patternId === p.id && c.date === d) || data.deletedClassIds.includes(id);
        if (inRange && !alreadyExists && !blocked.has(d) && !isPast(d, p.startTime)) {
          const allSubscribed = !global.LumioProfiles || p.students.every(s => {
            const full = s.studentId ? global.LumioProfiles.getStudent(s.studentId) : global.LumioProfiles.findByName(s.studentName);
            return full ? !!full.subscribed : true; // unknown/guest students don't block generation
          });
          if (allSubscribed) {
            const record = {
              id,
              teacherId: p.teacherId, teacherName: p.teacherName,
              date: d, startTime: p.startTime, durationMinutes: p.durationMinutes,
              level: p.level, cohort: p.cohort,
              lessonNumber: null, // set by the renumbering pass below
              meetingLink: p.meetingLink || "", notes: p.notes || "", sessionNotes: "",
              status: "scheduled", patternId: p.id,
              students: p.students.map(s => ({ studentId: s.studentId || null, studentName: s.studentName, attendance: null, grade: null, teacherRatingStars: null })),
              createdAt: new Date().toISOString(), updatedAt: GENERATED_AT,
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

    // Lesson numbers count the sessions this pattern actually holds before
    // each date -- not calendar weeks -- so a start date that isn't on the
    // pattern's weekday, a holiday or a skipped week never leaves a gap,
    // and a holiday removed later never produces two "Lesson 3"s.
    Object.values(legacy).forEach(p => {
      if (!p.lessonStart) return;
      const mine = data.classes.filter(c => c.patternId === p.id)
        .sort((x, y) => (x.date + x.startTime).localeCompare(y.date + y.startTime));
      let n = 0;
      mine.forEach(c => {
        if (c.status === "cancelled") return;
        const want = Number(p.lessonStart) + n;
        n++;
        if (Number(c.lessonNumber) === want) return;
        if (c.lessonNumber && (hasStarted(c) || !unmarked(c))) return; // what was taught stays on record
        c.lessonNumber = want;
        if (!created.includes(c)) { c.updatedAt = new Date().toISOString(); renumbered++; }
      });
    });

    if (created.length || cancelled || reinstated || renumbered || deduped) save(data);
    return { created: created.length, skippedUnsubscribed, cancelled, reinstated, renumbered, deduped };
  }

  // A deleted student leaves every class that hasn't started yet (one left
  // empty is cancelled) and every old-style fixed schedule; classes that
  // already happened keep them for attendance history.
  function removeStudentFromFuture(studentId, studentName) {
    const data = load();
    const me = { studentId: studentId || null, studentName: studentName || "" };
    const isMe = s => sameSeat(s, me) || (studentName && nn(s.studentName) === nn(studentName));
    let removed = 0, cancelledEmpty = 0, patterns = 0;
    data.classes.forEach(c => {
      if (c.status !== "scheduled" || hasStarted(c)) return;
      const n = (c.students || []).length;
      c.students = (c.students || []).filter(s => !isMe(s));
      if (c.students.length === n) return;
      removed++;
      if (!c.students.length) { c.status = "cancelled"; cancelledEmpty++; }
      else refreshStatus(c);
      c.updatedAt = new Date().toISOString();
    });
    data.patterns.forEach(p => {
      if (!isLegacyPattern(p) || !p.students.some(isMe)) return;
      p.students = p.students.filter(s => !isMe(s));
      // An old-style pattern with nobody left would turn into an open
      // teacher slot (see isLegacyPattern) -- end it instead.
      if (!p.students.length) { p.active = false; p.endDate = todayStr(); }
      p.updatedAt = new Date().toISOString();
      patterns++;
    });
    if (removed || patterns) save(data);
    return { removed, cancelled: cancelledEmpty, patterns };
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
  // The link a student should click: the class's own link, else the slot's,
  // else the teacher's standing classroom link (Teams/Zoom/Meet) set once
  // on the Team page. Keeps "one click to join" true without a per-class
  // meeting having to exist.
  function meetingLinkFor(cls) {
    if (!cls) return "";
    if (cls.meetingLink) return cls.meetingLink;
    if (cls.patternId) { const p = getPattern(cls.patternId); if (p && p.meetingLink) return p.meetingLink; }
    try {
      const t = global.LumioProfiles && global.LumioProfiles.getTeacher ? global.LumioProfiles.getTeacher(cls.teacherId) : null;
      if (t && t.meetingLink) return t.meetingLink;
    } catch (e) {}
    return "";
  }
  function teacherDefaultLink(teacherId) {
    try { const t = global.LumioProfiles && global.LumioProfiles.getTeacher ? global.LumioProfiles.getTeacher(teacherId) : null; return (t && t.meetingLink) || ""; } catch (e) { return ""; }
  }
  function inWorkingHours(dayOfWeek, startTime, durationMinutes) {
    if (!WORK.days.includes(Number(dayOfWeek))) return `Fixed slots are Sunday to Thursday only.`;
    const s = hmToMin(startTime), e = s + (Number(durationMinutes) || 60);
    if (s < hmToMin(WORK.start) || e > hmToMin(WORK.end)) return `Fixed slots must start at or after ${WORK.start} and end by ${WORK.end} (Saudi time).`;
    return null;
  }
  // A teacher's classroom link (or a slot's link) changed: booked classes
  // that still carry the OLD link (or none) take the new one. Classes
  // keep a copy because students only ever see the link of their own
  // classes (the public teacher list never includes it).
  function relinkFutureClasses({ teacherId, patternId, oldLinks, newLink } = {}) {
    const data = load(); const olds = (oldLinks || []).filter(Boolean); let n = 0;
    data.classes.forEach(c => {
      if (c.status !== "scheduled" || hasStarted(c)) return;
      if (teacherId && c.teacherId !== teacherId) return;
      if (patternId && c.patternId !== patternId) return;
      if (c.meetingLink && !olds.includes(c.meetingLink)) return;
      const next = newLink || (c.patternId && (getPattern(c.patternId) || {}).meetingLink) || teacherDefaultLink(c.teacherId) || "";
      if (c.meetingLink === next) return;
      c.meetingLink = next; c.updatedAt = new Date().toISOString(); n++;
    });
    if (n) save(data);
    return n;
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
    const booked = listClasses({ studentName, status: "scheduled" }).filter(c => c.level === level);
    const future = booked.filter(c => stillRunning(c, now));
    // Every still-"scheduled" booking counts, including one that already
    // happened but has no attendance yet -- otherwise that lesson could be
    // booked a second time before the teacher marks it.
    const maxBooked = booked.reduce((m, c) => Math.max(m, Number(c.lessonNumber) || 0), 0);
    const N = (global.Lumio && Lumio.lessonCountFor) ? Lumio.lessonCountFor(level) : 20;
    const nextLesson = Math.max(maxAttended, maxBooked) + 1;
    return { nextLesson: nextLesson > N ? null : nextLesson, maxAttended, maxBooked, futureCount: future.length, levelDone: nextLesson > N };
  }
  // Sun..Sat week (Riyadh) containing date d.
  function weekKey(d) { return addDaysStr(d, -dowOf(d)); }
  function bookingsInWeek(studentName, d) {
    const wk = weekKey(d);
    return listClasses({ studentName }).filter(c => c.status !== "cancelled" && weekKey(c.date) === wk).length;
  }
  // Sessions already promised to booked classes that haven't been marked
  // yet (a session is deducted when the teacher marks the student present).
  function pendingBookings(studentName) {
    const n = normName(studentName);
    return listClasses({ studentName, status: "scheduled" }).filter(c => {
      const slot = c.students.find(s => normName(s.studentName) === n);
      return slot && !slot.attendance;
    }).length;
  }
  function freeSessions(full, studentName) {
    return (Number(full && full.sessionsRemaining) || 0) - pendingBookings(studentName);
  }
  // Latest start (ms) of the student's booked lessons in this level: new
  // bookings must come after it, so lessons stay in date order.
  function latestBookedStart(studentName, level) {
    return listClasses({ studentName, status: "scheduled" }).filter(c => c.level === level)
      .reduce((m, c) => Math.max(m, startMs(c)), 0);
  }
  const rangeOf = (date, hm, dur) => { const s = startMs({ date, startTime: hm }); return [s, s + (Number(dur) || 60) * 60000]; };
  const overlaps = (a, b) => a[0] < b[1] && b[0] < a[1];
  // Does the student already have a class overlapping this time?
  function studentBusy(studentName, date, hm, dur, exceptId) {
    const r = rangeOf(date, hm, dur);
    return listClasses({ studentName, status: "scheduled" }).some(c => c.id !== exceptId && overlaps(r, rangeOf(c.date, c.startTime, c.durationMinutes || 45)));
  }
  // Is the teacher already teaching a different class overlapping this time
  // (e.g. a 90-minute Big Review running into the next hour's slot)?
  function teacherBusy(teacherId, date, hm, dur, exceptId) {
    const r = rangeOf(date, hm, dur);
    return load().classes.some(c => c.teacherId === teacherId && c.date === date && c.status !== "cancelled" && c.id !== exceptId
      && overlaps(r, rangeOf(c.date, c.startTime, c.durationMinutes || 45)));
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
    const dur = lessonDuration(level, lesson);
    const after = latestBookedStart(studentName, level);
    const busy = (d, hm, du, exceptId) => startMs({ date: d, startTime: hm }) <= after || studentBusy(studentName, d, hm, du || dur, exceptId);
    for (let d = today; d <= horizon; d = addDaysStr(d, 1)) {
      if (isDateBlocked(d)) continue;
      const dow = dowOf(d);
      data.patterns.forEach(p => {
        if (!p.active || isLegacyPattern(p) || Number(p.dayOfWeek) !== dow) return;
        if (d < p.startDate || (p.endDate && d >= p.endDate)) return;
        if (isPast(d, p.startTime, now)) return;
        const cls = data.classes.find(c => c.patternId === p.id && c.date === d && c.status !== "cancelled");
        if (busy(d, p.startTime, cls ? cls.durationMinutes : dur, cls && cls.id)) return;
        if (!cls && teacherBusy(p.teacherId, d, p.startTime, dur)) return;
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
        if (isPast(d, c.startTime, now) || busy(d, c.startTime, c.durationMinutes, c.id)) return;
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
    const slotDur = cls ? (cls.durationMinutes || lessonDuration(level, lesson)) : lessonDuration(level, lesson);
    if (studentBusy(studentName, slotDate, slotTime, slotDur, cls && cls.id)) throw new Error("The student already has a class at that time.");
    if (startMs({ date: slotDate, startTime: slotTime }) <= latestBookedStart(studentName, level)) throw new Error(`Lesson ${lesson} must come after the lessons already booked — pick a later time.`);
    if (!cls && teacherBusy(pat.teacherId, slotDate, slotTime, slotDur)) throw new Error("The teacher is still teaching another class then (the class before runs longer).");
    if (!override) {
      const full = global.LumioProfiles ? (studentId ? global.LumioProfiles.getStudent(studentId) : global.LumioProfiles.findByName(studentName)) : null;
      if (full && !full.subscribed) throw new Error("This student isn't subscribed yet.");
      if (full && !(freeSessions(full, studentName) > 0)) throw new Error(Number(full.sessionsRemaining) > 0 ? "Every session left on the package is already booked." : "No sessions left on this student's package.");
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
      meetingLink: pat.meetingLink || teacherDefaultLink(pat.teacherId) || "", notes: notes || "", sessionNotes: "", status: "scheduled", patternId: pat.id,
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
      if (!byTeacher && startMs(x) - Date.now() < CANCEL_MIN_BEFORE * 60000) return;
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
  function restore(snap) { try { save(JSON.parse(snap), { noStamp: true }); } catch (e) {} } // exact rollback
  function replaceClass(cls) {
    const data = load();
    const i = data.classes.findIndex(c => c.id === cls.id);
    if (i >= 0) data.classes[i] = cls; else data.classes.push(cls);
    save(data, { noStamp: true }); // the script's copy (already stamped there)
  }
  async function bookSlotRemote(args) {
    const snap = snapshot();
    const cls = bookStudentIntoSlot(args);
    const cfg = getSyncConfig();
    if (!cfg.enabled || !cfg.url) return cls;
    try {
      const res = await fetchWithTimeout(cfg.url + "?key=" + LUMIO_API_KEY + "&action=bookSlot" + ((global.LumioProfiles && LumioProfiles.authQuery) ? LumioProfiles.authQuery() : ""), {
        method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ cls, student: { studentId: args.studentId || null, studentName: args.studentName }, maxPerClass: MAX_PER_CLASS }),
      });
      const out = await res.json();
      if (!out || !out.ok) {
        restore(snap);
        if (out && /Unknown action/i.test(out.error || "")) throw new Error("Online booking isn't switched on yet — please tell your teacher (the booking server needs its update).");
        throw new Error((out && out.error) || "The server refused that booking.");
      }
      if (out.cls) { normalizeSheetDates(out.cls); if (out.cls.id !== cls.id) restore(snap); replaceClass(out.cls); return out.cls; }
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
      const res = await fetchWithTimeout(cfg.url + "?key=" + LUMIO_API_KEY + "&action=cancelSlot" + ((global.LumioProfiles && LumioProfiles.authQuery) ? LumioProfiles.authQuery() : ""), {
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
      let sessionsLeft = full ? freeSessions(full, studentName) : 99;
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
    const results = []; let stopped = false;
    for (const item of plan) {
      // Later items were planned as "the next lesson after this one"; once one
      // fails their lesson numbers are wrong, so stop and let the student re-plan.
      if (stopped && item.ok) { results.push(Object.assign({}, item, { ok: false, reason: "Not booked — the booking before it failed. Open the planner again to book the rest." })); continue; }
      if (!item.ok) { results.push(item); continue; }
      try {
        const cls = await bookSlotRemote({ studentName, studentId, level, lesson: item.lesson, patternId: item.patternId, date: item.date });
        results.push(Object.assign({}, item, { ok: true, classId: cls.id }));
      } catch (e) {
        results.push(Object.assign({}, item, { ok: false, reason: e.message }));
        stopped = true;
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
    bookSlotRemote, cancelBookingRemote, laterBookings, relinkFutureClasses, pendingBookings, freeSessions,
    weeklySlotOptions, weeklyPlanPreview, bookWeeklyRemote, fixedPlanFor, saveFixedPlan,
    // booking model
    WORK, MAX_PER_CLASS, MAX_PER_WEEK, CANCEL_MIN_BEFORE, lessonDuration, inWorkingHours, isPast, isLegacyPattern, meetingLinkFor, teacherDefaultLink,
    addAvailability, setWeeklyAvailability, availabilityForTeacher, availabilityStatus, studentBookingState, bookingsInWeek, openSlots,
    bookStudentIntoSlot, cancelBooking, joinGate,
    addClass, updateClass, removeClass, cancelClass,
    markAttendance, gradeStudent, needsEvaluation, rateTeacher, completionState,
    needsAttendance, attendanceStatsForStudent, gradesForStudent, teacherRatingsGiven, teacherAverageRating,
    attendanceStreakForStudent, teacherStats, reassignTeacherForRange,
    attendedLessonNumbers, classForLesson,
    upcomingForStudent, upcomingForTeacher, todayStr,
    getSyncConfig, syncNow,
    VALID_GRADES,
    // fixed schedules
    listPatterns, getPattern, addPattern, updatePattern, cancelPatternFromDate, removePattern,
    listBlockedDates, addBlockedDate, removeBlockedDate, isDateBlocked,
    fixedScheduleCountForStudent, generateUpcoming, patternClassId,
    // 3 Oct 2026: Riyadh start/end checks, deleted-student cleanup, rating retry
    hasStarted, hasEnded, removeStudentFromFuture, retryPendingRatings,
  };
  // Ratings that couldn't reach the script are sent again on the next page
  // load and whenever the connection comes back.
  if (typeof window !== "undefined" && window.addEventListener) {
    window.addEventListener("online", () => { retryPendingRatings().catch(() => {}); });
    setTimeout(() => { retryPendingRatings().catch(() => {}); }, 3000);
  }
})(window);
