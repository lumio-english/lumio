/*!
 * Lumio Profiles — shared student roster + teacher accounts + simple PIN auth.
 * Loaded alongside js/app.js (which owns lesson progress). This file only
 * owns "who exists and how do they log in" — it never touches progress data.
 *
 * Storage (this device only, for now):
 *   localStorage["lumio_roster_v1"] = {
 *     students: [{ id, name, level, avatar, pin, teacherId, createdAt }],
 *     teachers: [{ id, name, avatar, pin, createdAt }],
 *     updatedAt
 *   }
 *   sessionStorage["lumio_current_teacher_id"] = "<teacherId>"  (who's logged in right now)
 *
 * A default "Teacher Lumi" account is created automatically the first time
 * this loads with no teachers yet, so login always has someone to pick.
 * Rename it or add more from the Teachers tab in teacher.html.
 *
 * ---- Syncing later (Google Sheets / Apps Script) ----
 * localStorage["lumio_sync_cfg_v1"] = { url, enabled }
 * Call LumioProfiles.configureSync({ url }) once you have an Apps Script
 * Web App URL (same pattern as the README's Progress backend). syncNow()
 * will then:
 *   POST  <url>?action=pushRoster   body: { students, teachers }
 *   GET   <url>?action=pullRoster   expects: { students, teachers }
 * Your Apps Script needs "Roster" and "Teachers" sheet tabs and a
 * doPost/doGet that read/write them — mirroring the Progress tab pattern
 * already described in the README. Until you wire that up, syncNow()
 * safely no-ops.
 */
(function (global) {
  "use strict";

  const ROSTER_KEY = "lumio_roster_v1";
  const SYNC_KEY = "lumio_sync_cfg_v1";
  const CURRENT_TEACHER_KEY = "lumio_current_teacher_id";

  const AVATARS = ["🦊", "🐼", "🦁", "🐸", "🐵", "🐨", "🦄", "🐯", "🐰", "🐶", "🐱", "🐷"];
  const TEACHER_AVATARS = ["🦉", "🎓", "📚", "🍎", "⭐", "🧑‍🏫", "👩‍🏫", "👨‍🏫", "✏️", "🌟", "💡", "🏆"];

  // ---- storage helpers (never let a blocked/opaque-origin storage crash the page) ----
  const memory = {};
  function safeGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return memory[key] || null; }
  }
  function safeSet(key, val) {
    try { localStorage.setItem(key, val); } catch (e) { memory[key] = val; }
  }
  const sessionMemory = {};
  function safeSessionGet(key) {
    try { return sessionStorage.getItem(key); } catch (e) { return sessionMemory[key] || null; }
  }
  function safeSessionSet(key, val) {
    try { sessionStorage.setItem(key, val); } catch (e) { sessionMemory[key] = val; }
  }
  function safeSessionRemove(key) {
    try { sessionStorage.removeItem(key); } catch (e) { delete sessionMemory[key]; }
  }

  function load() {
    let data;
    try { data = JSON.parse(safeGet(ROSTER_KEY) || "null"); } catch (e) { data = null; }
    if (!data || typeof data !== "object") data = {};
    if (!Array.isArray(data.students)) data.students = [];
    if (!Array.isArray(data.teachers)) data.teachers = [];

    let needsSave = false;

    // migrate the old single-name teacher field into a real teacher record
    if (data.teacher && data.teacher.name && !data.teachers.length) {
      data.teachers.push({
        id: genId("t"),
        name: data.teacher.name,
        avatar: TEACHER_AVATARS[0],
        pin: "2026",
        isOwner: true,
        createdAt: new Date().toISOString().slice(0, 10),
      });
      needsSave = true;
    }
    delete data.teacher;

    // always guarantee at least one teacher exists so login is never a dead end
    if (!data.teachers.length) {
      data.teachers.push({
        id: genId("t"),
        name: "Teacher Lumi",
        avatar: "🦉",
        pin: "1111",
        isOwner: true,
        createdAt: new Date().toISOString().slice(0, 10),
      });
      needsSave = true;
    }

    // safety net for roster data saved before "isOwner" existed
    if (!data.teachers.some(t => t.isOwner)) {
      data.teachers[0].isOwner = true;
      needsSave = true;
    }

    if (needsSave) save(data);
    return data;
  }
  function save(data) {
    data.updatedAt = new Date().toISOString();
    safeSet(ROSTER_KEY, JSON.stringify(data));
    return data;
  }

  function genId(prefix) {
    return (prefix || "s") + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }
  function randomPin() {
    return String(Math.floor(1000 + Math.random() * 9000));
  }
  function normalizePin(pin) {
    const p = String(pin || "").replace(/\D/g, "").slice(0, 4);
    return p.length === 4 ? p : null;
  }

  // ---- PIN hashing ----
  // Local reveal/print of a PIN (so a teacher can tell a kid their PIN, or
  // print login cards) still uses the plaintext `pin` field, which never
  // leaves this device. Verification and anything sent to a sync backend
  // uses `pinHash` instead, so a shared Google Sheet (or the network tab)
  // never sees a PIN in the clear. Uses real SHA-256 via the browser's
  // Web Crypto API when available (any https deployment, e.g. GitHub
  // Pages); falls back to a simple non-cryptographic hash if that API is
  // unavailable (some file:// setups) so PINs are still never stored
  // as-is even then — just with a weaker guarantee.
  async function hashPin(pin) {
    const p = normalizePin(pin) || "";
    try {
      if (global.crypto && global.crypto.subtle && global.crypto.subtle.digest) {
        const bytes = new TextEncoder().encode("lumio:" + p);
        const digest = await global.crypto.subtle.digest("SHA-256", bytes);
        return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, "0")).join("");
      }
    } catch (e) { /* fall through to the simple hash below */ }
    // Simple fallback hash (FNV-1a-style) — not cryptographically secure,
    // just keeps a 4-digit PIN from sitting around as plain text.
    let h = 0x811c9dc5;
    const s = "lumio:" + p;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = (h * 0x01000193) >>> 0;
    }
    return "fnv1a-" + h.toString(16).padStart(8, "0");
  }

  // ---- roster CRUD ----
  function listStudents() {
    return load().students.slice();
  }
  function getStudent(id) {
    return load().students.find(s => s.id === id) || null;
  }
  function findByName(name) {
    const n = (name || "").trim().toLowerCase();
    if (!n) return null;
    return load().students.find(s => s.name.trim().toLowerCase() === n) || null;
  }
  async function addStudent({ name, level, avatar, pin, teacherId } = {}) {
    const data = load();
    name = (name || "").trim();
    if (!name) throw new Error("A student needs a name.");
    if (findByName(name)) throw new Error(`"${name}" is already on the roster.`);
    const finalPin = normalizePin(pin) || randomPin();
    const record = {
      id: genId("s"),
      name,
      level: level || "pre-a",
      avatar: avatar || AVATARS[Math.floor(Math.random() * AVATARS.length)],
      pin: finalPin,
      pinHash: await hashPin(finalPin),
      teacherId: teacherId || getCurrentTeacherId() || (data.teachers[0] && data.teachers[0].id) || null,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    data.students.push(record);
    save(data);
    return record;
  }
  async function updateStudent(id, patch) {
    const data = load();
    const s = data.students.find(x => x.id === id);
    if (!s) throw new Error("Student not found.");
    if (patch.name !== undefined) {
      const newName = patch.name.trim();
      if (!newName) throw new Error("A student needs a name.");
      const dupe = data.students.find(x => x.id !== id && x.name.trim().toLowerCase() === newName.toLowerCase());
      if (dupe) throw new Error(`"${newName}" is already on the roster.`);
      s.name = newName;
    }
    if (patch.level !== undefined) s.level = patch.level;
    if (patch.avatar !== undefined) s.avatar = patch.avatar;
    if (patch.pin !== undefined) {
      const newPin = normalizePin(patch.pin) || s.pin;
      s.pin = newPin;
      s.pinHash = await hashPin(newPin);
    }
    if (patch.teacherId !== undefined) s.teacherId = patch.teacherId;
    save(data);
    return s;
  }
  async function assignStudent(studentId, teacherId) {
    return updateStudent(studentId, { teacherId });
  }
  function removeStudent(id) {
    const data = load();
    data.students = data.students.filter(s => s.id !== id);
    save(data);
  }
  async function verifyStudentLogin(name, pin) {
    const s = findByName(name);
    if (!s) return null;
    const p = normalizePin(pin);
    if (!p) return null;
    if (s.pinHash) {
      if ((await hashPin(p)) !== s.pinHash) return null;
      return s;
    }
    // legacy record with no pinHash yet (created before hashing existed) —
    // fall back to a plaintext check, then self-heal by adding the hash.
    if (p !== s.pin) return null;
    try { await updateStudent(s.id, { pin: p }); } catch (e) { /* non-fatal */ }
    return s;
  }

  // ---- teacher accounts ----
  // Note: the site-wide "Teacher PIN" gate (default 2026, in your existing
  // js/auth.js) still controls who can even reach the dashboard. These
  // per-teacher PINs are a separate, additional layer used only to pick
  // *which* teacher is logged in, for greeting + student assignment.
  function listTeachers() {
    return load().teachers.slice();
  }
  function getTeacher(id) {
    return load().teachers.find(t => t.id === id) || null;
  }
  function findTeacherByName(name) {
    const n = (name || "").trim().toLowerCase();
    if (!n) return null;
    return load().teachers.find(t => t.name.trim().toLowerCase() === n) || null;
  }
  async function addTeacher({ name, avatar, pin, isOwner } = {}) {
    const data = load();
    name = (name || "").trim();
    if (!name) throw new Error("A teacher needs a name.");
    if (findTeacherByName(name)) throw new Error(`"${name}" is already a teacher.`);
    const finalPin = normalizePin(pin) || randomPin();
    const record = {
      id: genId("t"),
      name,
      avatar: avatar || TEACHER_AVATARS[Math.floor(Math.random() * TEACHER_AVATARS.length)],
      pin: finalPin,
      pinHash: await hashPin(finalPin),
      isOwner: !!isOwner,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    data.teachers.push(record);
    save(data);
    return record;
  }
  async function updateTeacher(id, patch) {
    const data = load();
    const t = data.teachers.find(x => x.id === id);
    if (!t) throw new Error("Teacher not found.");
    if (patch.name !== undefined) {
      const newName = patch.name.trim();
      if (!newName) throw new Error("A teacher needs a name.");
      const dupe = data.teachers.find(x => x.id !== id && x.name.trim().toLowerCase() === newName.toLowerCase());
      if (dupe) throw new Error(`"${newName}" is already a teacher.`);
      t.name = newName;
    }
    if (patch.avatar !== undefined) t.avatar = patch.avatar;
    if (patch.pin !== undefined) {
      const newPin = normalizePin(patch.pin) || t.pin;
      t.pin = newPin;
      t.pinHash = await hashPin(newPin);
    }
    if (patch.isOwner !== undefined) {
      const wouldRemoveLastOwner = t.isOwner && !patch.isOwner && data.teachers.filter(x => x.isOwner).length <= 1;
      if (wouldRemoveLastOwner) throw new Error("There must always be at least one owner.");
      t.isOwner = !!patch.isOwner;
    }
    save(data);
    return t;
  }
  function removeTeacher(id) {
    const data = load();
    if (data.teachers.length <= 1) throw new Error("You need at least one teacher account.");
    const target = data.teachers.find(t => t.id === id);
    if (target && target.isOwner && data.teachers.filter(t => t.isOwner).length <= 1) {
      throw new Error("You can't remove the last owner. Make someone else an owner first.");
    }
    data.teachers = data.teachers.filter(t => t.id !== id);
    // unassign any students who belonged to this teacher rather than leave a dangling reference
    data.students.forEach(s => { if (s.teacherId === id) s.teacherId = data.teachers[0].id; });
    save(data);
    if (getCurrentTeacherId() === id) setCurrentTeacherId(data.teachers[0].id);
  }
  async function verifyTeacherLogin(name, pin) {
    const t = findTeacherByName(name);
    if (!t) return null;
    const p = normalizePin(pin);
    if (!p) return null;
    if (t.pinHash) {
      if ((await hashPin(p)) !== t.pinHash) return null;
      return t;
    }
    if (p !== t.pin) return null;
    try { await updateTeacher(t.id, { pin: p }); } catch (e) { /* non-fatal */ }
    return t;
  }

  // ---- current teacher session (who's logged in on this tab right now) ----
  function getCurrentTeacherId() {
    return safeSessionGet(CURRENT_TEACHER_KEY) || null;
  }
  function setCurrentTeacherId(id) {
    safeSessionSet(CURRENT_TEACHER_KEY, id || "");
  }
  function getCurrentTeacher() {
    const id = getCurrentTeacherId();
    return id ? getTeacher(id) : null;
  }
  function clearCurrentTeacher() {
    safeSessionRemove(CURRENT_TEACHER_KEY);
  }
  function isCurrentTeacherOwner() {
    const t = getCurrentTeacher();
    return !!(t && t.isOwner);
  }

  // ---- deprecated cosmetic-name shims (kept so older calls don't break) ----
  function getTeacherName() {
    const cur = getCurrentTeacher();
    return cur ? cur.name : "";
  }
  function setTeacherName(name) {
    const cur = getCurrentTeacher();
    if (cur) return updateTeacher(cur.id, { name }).name;
    return addTeacher({ name }).name;
  }

  // ---- sync (prep only, safe no-op until configured) ----
  function getSyncConfig() {
    try { return JSON.parse(safeGet(SYNC_KEY) || "null") || { url: "", enabled: false }; }
    catch (e) { return { url: "", enabled: false }; }
  }
  function configureSync({ url } = {}) {
    const cfg = { url: (url || "").trim(), enabled: !!(url && url.trim()) };
    safeSet(SYNC_KEY, JSON.stringify(cfg));
    return cfg;
  }
  function stripPin(record) {
    const copy = Object.assign({}, record);
    delete copy.pin; // never leaves the device
    return copy;
  }
  // Additive merge: keeps local-only records, adds remote-only records, and
  // for records both sides know about, remote wins on most fields but a
  // locally-known plaintext PIN is preserved *only* if it still matches the
  // incoming hash (otherwise it changed elsewhere and this device
  // legitimately doesn't know it anymore — by design).
  //
  // Note: this is deliberately additive, not a full mirror — a record
  // removed on one device won't auto-remove here. That's a conscious
  // trade-off for v1: syncing should never be able to silently wipe data
  // just because one device's local copy happened to be empty (e.g. the
  // very first sync from a brand-new device).
  function mergeById(localList, remoteList) {
    const byId = {};
    localList.forEach(r => { byId[r.id] = Object.assign({}, r); });
    remoteList.forEach(r => {
      const local = byId[r.id];
      if (local && local.pin && local.pinHash && local.pinHash === r.pinHash) {
        byId[r.id] = Object.assign({}, r, { pin: local.pin });
      } else {
        byId[r.id] = r;
      }
    });
    return Object.values(byId);
  }
  async function backfillMissingHashes(data) {
    for (const t of data.teachers) {
      if (!t.pinHash && t.pin) t.pinHash = await hashPin(t.pin);
    }
    for (const s of data.students) {
      if (!s.pinHash && s.pin) s.pinHash = await hashPin(s.pin);
    }
  }
  async function syncNow() {
    const cfg = getSyncConfig();
    if (!cfg.enabled || !cfg.url) return { ok: false, reason: "not-configured" };
    const data = load();
    try {
      // Pull + merge first, so a brand-new device can never push an empty
      // local roster over whatever's already shared.
      const res = await fetch(cfg.url + "?action=pullRoster");
      const remote = await res.json();
      if (remote && Array.isArray(remote.students)) {
        data.students = mergeById(data.students, remote.students);
      }
      if (remote && Array.isArray(remote.teachers) && remote.teachers.length) {
        data.teachers = mergeById(data.teachers, remote.teachers);
      }
      await backfillMissingHashes(data);
      save(data);

      await fetch(cfg.url + "?action=pushRoster", {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          students: data.students.map(stripPin),
          teachers: data.teachers.map(stripPin),
        }),
      });
      return { ok: true, at: new Date().toISOString() };
    } catch (e) {
      return { ok: false, reason: "network", error: e && e.message };
    }
  }

  global.LumioProfiles = {
    AVATARS, TEACHER_AVATARS,
    listStudents, getStudent, findByName,
    addStudent, updateStudent, removeStudent, assignStudent,
    verifyStudentLogin, randomPin,
    listTeachers, getTeacher, findTeacherByName,
    addTeacher, updateTeacher, removeTeacher, verifyTeacherLogin,
    getCurrentTeacherId, setCurrentTeacherId, getCurrentTeacher, clearCurrentTeacher, isCurrentTeacherOwner,
    getTeacherName, setTeacherName,
    getSyncConfig, configureSync, syncNow,
  };
})(window);
