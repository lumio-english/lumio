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
  // Baked into the deployed site so every device automatically knows where
  // to sync from, with zero per-device setup. A locally-saved override (via
  // Sync Settings in the dashboard) still takes priority if one exists —
  // this is just the fallback so a brand-new device isn't blind until a
  // teacher manually pastes the URL there. Update this if you ever
  // redeploy the Apps Script to a new URL.
  const DEFAULT_SYNC_URL = "https://script.google.com/macros/s/AKfycbxlKY07coAR_Uj6UQf2bvy6yi6I3cG9WsnTROvKI5v_l9MhhXIbP3Ke8jxbYx5btZzAGA/exec";
  const CURRENT_TEACHER_KEY = "lumio_current_teacher_id";

  const AVATARS = ["🦊", "🐼", "🦁", "🐸", "🐵", "🐨", "🦄", "🐯", "🐰", "🐶", "🐱"];
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

    // safety net for students saved before loginCode/paid existed -- without
    // this, a student created before this change, with no phone on file,
    // would have no way at all to log in under the new ID/phone system.
    // Generated inline (not via genLoginCode(), which itself calls load())
    // to avoid infinite recursion, checking uniqueness against both the
    // existing roster and codes already assigned earlier in this same pass.
    data.students.forEach(s => {
      if (!s.loginCode) {
        let code;
        do { code = String(Math.floor(100000 + Math.random() * 900000)); }
        while (data.students.some(x => x.loginCode === code));
        s.loginCode = code;
        needsSave = true;
      }
      if (s.paid === undefined) {
        s.paid = true; // every pre-existing student was a teacher-enrolled "Current Learner"
        needsSave = true;
      }
      if (s.approved === undefined) {
        s.approved = true; // pre-existing students could already log in -- don't retroactively lock anyone out
        needsSave = true;
      }
      // safety net for students saved before profile/subscription/rewards
      // fields existed -- plain defaults so every reader (drawer, rewards
      // card, leaderboard, renewal list) can rely on these always existing.
      if (!Array.isArray(s.pointsLog)) { s.pointsLog = []; needsSave = true; }
      if (!Array.isArray(s.redemptions)) { s.redemptions = []; needsSave = true; }
      if (!Array.isArray(s.notes)) { s.notes = []; needsSave = true; }
      if (s.sessionsRemaining === undefined) { s.sessionsRemaining = 0; needsSave = true; }
    });
    if (!Array.isArray(data.rewardCatalog)) { data.rewardCatalog = []; needsSave = true; }

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
  // Groupmates: same cohort + group + level, case/whitespace-insensitive,
  // excluding the student themself -- used both by the roster UI (showing
  // a groupmate count) and, later, by the cohort-comparison report chart.
  // A student with no cohort/group set has no groupmates by definition,
  // since there's nothing to match against.
  function groupmatesOf(studentId) {
    const s = getStudent(studentId);
    if (!s || !s.cohort || !s.group) return [];
    const norm = v => (v || "").trim().toLowerCase();
    return load().students.filter(x =>
      x.id !== s.id && norm(x.cohort) === norm(s.cohort) && norm(x.group) === norm(s.group) && x.level === s.level
    );
  }
  function getStudent(id) {
    return load().students.find(s => s.id === id) || null;
  }
  function findByName(name) {
    const n = (name || "").trim().toLowerCase();
    if (!n) return null;
    return load().students.find(s => s.name.trim().toLowerCase() === n) || null;
  }
  function findByPhone(phone) {
    const p = (phone || "").trim();
    if (!p) return null;
    return load().students.find(s => s.phone && s.phone.trim() === p) || null;
  }
  function findByLoginCode(code) {
    const c = (code || "").trim();
    if (!c) return null;
    return load().students.find(s => s.loginCode === c) || null;
  }
  // A student's real `id` (e.g. "s_mtl2xy8k") is an internal system key,
  // not something a young child -- the platform's actual primary
  // audience -- or a parent could reasonably type in or remember. This is
  // a separate, short, numeric code generated purely for logging in --
  // meant to be written on a sticker or read aloud over the phone.
  // Regenerated on collision (astronomically rare at 6 digits for a
  // roster this size, but checked rather than assumed).
  function genLoginCode() {
    const data = load();
    let code;
    do { code = String(Math.floor(100000 + Math.random() * 900000)); }
    while (data.students.some(s => s.loginCode === code));
    return code;
  }
  async function addStudent({ name, level, avatar, pin, teacherId, phone, cohort, group, paid, age, gender, grade, country, tags, subscribed, amountPaid, levelsPurchased, rewardPoints, bonusHours, sessionsRemaining, approved } = {}) {
    const data = load();
    name = (name || "").trim();
    if (!name) throw new Error("A student needs a name.");
    if (findByName(name)) throw new Error(`"${name}" is already on the roster.`);
    const finalPin = normalizePin(pin) || randomPin();
    const record = {
      id: genId("s"),
      name,
      // level is nullable on purpose: a student who has registered during
      // the placement test but not finished it yet has no level until
      // their score comes in. Distinguishes "explicitly passed null" from
      // "the caller didn't pass this at all" (undefined), so every
      // existing addStudent() call site that never mentions level keeps
      // defaulting to pre-a exactly as before.
      level: level === undefined ? "pre-a" : level,
      avatar: avatar || AVATARS[Math.floor(Math.random() * AVATARS.length)],
      pin: finalPin,
      pinHash: await hashPin(finalPin),
      // A short, human-typeable login code, separate from the internal
      // `id` above -- see genLoginCode() for why.
      loginCode: genLoginCode(),
      teacherId: teacherId || getCurrentTeacherId() || (data.teachers[0] && data.teachers[0].id) || null,
      phone: (phone || "").trim(), // optional — parent/guardian contact, used for the inactivity check-in shortcut
      // Whether this student has actually paid and been enrolled ("Current
      // Learner") vs. having only registered a phone number and PIN during
      // the placement test, possibly with no level decided yet ("New
      // Learner"). Defaults true so every existing call site (teachers
      // manually adding a real, paying student) is unaffected; the
      // placement-test registration flow is the one caller that passes
      // paid: false explicitly.
      paid: paid === undefined ? true : !!paid,
      // Whether this student is allowed to actually LOG IN yet. Separate
      // from `subscribed`/`paid` on purpose: this is a one-time gate on a
      // brand-new self-registered account (placement test), not an
      // ongoing status that should flip back and forth as a subscription
      // lapses and renews later. Defaults true so every existing call
      // site (a teacher manually adding a student they've already
      // vetted) is unaffected; the placement-test registration flow is
      // the one caller that passes approved: false explicitly, so a kid
      // can't start using the student dashboard the moment they finish a
      // test -- only once the teacher has reviewed their profile, taken
      // payment, and approved them from the dashboard.
      approved: approved === undefined ? true : !!approved,
      // Free-text, not a managed list -- a cohort is an enrollment batch (e.g.
      // "Sept 2026 Intake"), a group is a class section within that cohort at
      // one level (multiple groups can share a level within the same cohort).
      // Two students are "groupmates" for comparison purposes when their
      // cohort + group + level all match exactly (case/whitespace-insensitive).
      cohort: (cohort || "").trim(),
      group: (group || "").trim(),
      // ---- Profile info (CRM-style card, entered/edited by the teacher
      // by hand -- nothing here is auto-computed) ----
      age: age === undefined || age === null || age === "" ? null : Number(age),
      gender: gender || "", // free-form short code, e.g. "M" / "F" -- not a managed enum
      grade: (grade || "").trim(), // e.g. "High school", "Grade 8"
      country: (country || "").trim(),
      tags: Array.isArray(tags) ? tags.map(t => String(t).trim()).filter(Boolean) : [],
      // ---- Subscription / billing status (separate from `paid` above,
      // which only tracks placement-test registration vs. real
      // enrollment) -- this is the actual "are they currently a paying
      // subscriber, how much did they pay, how many levels did that
      // cover" info a teacher fills in by hand after a payment. ----
      subscribed: subscribed === undefined ? true : !!subscribed,
      amountPaid: amountPaid === undefined || amountPaid === null || amountPaid === "" ? 0 : Number(amountPaid),
      levelsPurchased: levelsPurchased === undefined || levelsPurchased === null || levelsPurchased === "" ? 0 : Number(levelsPurchased),
      // ---- Rewards ----
      // rewardPoints accumulates freely; every full 50 points can be
      // redeemed (see redeemReward()) for 1 bonus hour, which just counts
      // up in bonusHours for the teacher to track/apply manually (e.g. as
      // an extra session card) -- this file doesn't touch scheduling or
      // session-card counts itself.
      rewardPoints: rewardPoints ? Number(rewardPoints) : 0,
      bonusHours: bonusHours ? Number(bonusHours) : 0,
      // History of point awards, {date, amount} -- lets a leaderboard
      // compute "points this month" instead of only lifetime totals.
      // Redemptions (both the legacy 50pt/1hr and any catalog item) are
      // logged separately below in `redemptions`.
      pointsLog: [],
      redemptions: [],
      // How many paid session cards this student has left -- separate
      // from `levelsPurchased` (a lifetime count of levels bought). Ticks
      // down by 1 automatically the first time a class they're in gets
      // marked "present" (see markAttendance's auto-decrement in
      // js/lumio-schedule.js); never goes below 0.
      sessionsRemaining: sessionsRemaining === undefined || sessionsRemaining === null || sessionsRemaining === "" ? 0 : Number(sessionsRemaining),
      // Free-form CRM-style timeline -- call notes, parent complaints,
      // praise -- separate from lesson/session notes, which live on the
      // class record instead. {date, text, author}.
      notes: [],
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString(),
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
    // A real uploaded photo, stored as a data URL exactly like homework
    // drawings already are elsewhere in this app (no backend to upload
    // to). Kept separate from `avatar` (the emoji) rather than replacing
    // it, so switching back to an emoji later doesn't lose anything --
    // pass null explicitly to clear a photo and fall back to the emoji.
    if (patch.photoDataUrl !== undefined) s.photoDataUrl = patch.photoDataUrl;
    if (patch.pin !== undefined) {
      const newPin = normalizePin(patch.pin) || s.pin;
      s.pin = newPin;
      s.pinHash = await hashPin(newPin);
    }
    if (patch.teacherId !== undefined) s.teacherId = patch.teacherId;
    if (patch.phone !== undefined) s.phone = (patch.phone || "").trim();
    if (patch.cohort !== undefined) s.cohort = (patch.cohort || "").trim();
    if (patch.group !== undefined) s.group = (patch.group || "").trim();
    if (patch.paid !== undefined) s.paid = !!patch.paid;
    if (patch.approved !== undefined) s.approved = !!patch.approved;
    if (patch.age !== undefined) s.age = patch.age === null || patch.age === "" ? null : Number(patch.age);
    if (patch.gender !== undefined) s.gender = patch.gender || "";
    if (patch.grade !== undefined) s.grade = (patch.grade || "").trim();
    if (patch.country !== undefined) s.country = (patch.country || "").trim();
    if (patch.tags !== undefined) s.tags = Array.isArray(patch.tags) ? patch.tags.map(t => String(t).trim()).filter(Boolean) : [];
    if (patch.subscribed !== undefined) s.subscribed = !!patch.subscribed;
    if (patch.amountPaid !== undefined) s.amountPaid = patch.amountPaid === null || patch.amountPaid === "" ? 0 : Number(patch.amountPaid);
    if (patch.levelsPurchased !== undefined) s.levelsPurchased = patch.levelsPurchased === null || patch.levelsPurchased === "" ? 0 : Number(patch.levelsPurchased);
    if (patch.rewardPoints !== undefined) s.rewardPoints = Math.max(0, Number(patch.rewardPoints) || 0);
    if (patch.bonusHours !== undefined) s.bonusHours = Math.max(0, Number(patch.bonusHours) || 0);
    if (patch.sessionsRemaining !== undefined) s.sessionsRemaining = Math.max(0, Number(patch.sessionsRemaining) || 0);
    s.updatedAt = new Date().toISOString();
    save(data);
    return s;
  }
  // Adds (or, with a negative amount, removes) reward points -- the
  // day-to-day action a teacher takes after a student does something
  // reward-worthy. Kept separate from updateStudent's raw rewardPoints
  // overwrite so callers don't have to read-then-write the current total
  // themselves. Logs to pointsLog so a leaderboard can total "this
  // month" rather than only ever seeing the lifetime balance.
  function addRewardPoints(id, amount) {
    const data = load();
    const s = data.students.find(x => x.id === id);
    if (!s) throw new Error("Student not found.");
    const amt = Number(amount || 0);
    s.rewardPoints = Math.max(0, (s.rewardPoints || 0) + amt);
    if (!Array.isArray(s.pointsLog)) s.pointsLog = [];
    s.pointsLog.push({ date: new Date().toISOString(), amount: amt });
    s.updatedAt = new Date().toISOString();
    save(data);
    return s;
  }
  // Redeems every full 50-point block currently available: 50 points -> 1
  // bonus hour, 100 -> 2, and so on in one go, leaving any remainder
  // (e.g. 130 points -> 2 hours redeemed, 30 points left) rather than
  // requiring one redemption per block. This is the original, fixed
  // "points -> hours" reward kept exactly as-is; see redeemCatalogItem()
  // below for teacher-defined reward types on top of this one.
  function redeemReward(id) {
    const data = load();
    const s = data.students.find(x => x.id === id);
    if (!s) throw new Error("Student not found.");
    const POINTS_PER_HOUR = 50;
    const blocks = Math.floor((s.rewardPoints || 0) / POINTS_PER_HOUR);
    if (blocks < 1) throw new Error(`Needs at least ${POINTS_PER_HOUR} points to redeem — has ${s.rewardPoints || 0}.`);
    s.rewardPoints -= blocks * POINTS_PER_HOUR;
    s.bonusHours = (s.bonusHours || 0) + blocks;
    if (!Array.isArray(s.redemptions)) s.redemptions = [];
    s.redemptions.push({ date: new Date().toISOString(), label: `+${blocks} bonus hour${blocks === 1 ? "" : "s"}`, cost: blocks * POINTS_PER_HOUR });
    s.updatedAt = new Date().toISOString();
    save(data);
    return { student: s, hoursRedeemed: blocks };
  }

  // ---- reward catalog (shared across all students, teacher-managed) ----
  // A short list of extra redeemable items beyond the fixed "50pts=1hr"
  // reward above, e.g. {label:"Sticker shoutout", cost:25} or
  // {label:"Merch pack", cost:100}. Purely descriptive on this side --
  // redeeming just deducts points and logs it to the student's
  // `redemptions` for the teacher to actually go fulfil (mail the merch,
  // give the shoutout, etc.); nothing here auto-ships anything.
  function listRewardCatalog() {
    return load().rewardCatalog ? load().rewardCatalog.slice() : [];
  }
  function addRewardCatalogItem({ label, cost } = {}) {
    label = (label || "").trim();
    const c = Number(cost);
    if (!label) throw new Error("A reward needs a name.");
    if (!c || c < 1) throw new Error("A reward needs a positive point cost.");
    const data = load();
    if (!Array.isArray(data.rewardCatalog)) data.rewardCatalog = [];
    const item = { id: genId("rw"), label, cost: c };
    data.rewardCatalog.push(item);
    save(data);
    return item;
  }
  function removeRewardCatalogItem(id) {
    const data = load();
    data.rewardCatalog = (data.rewardCatalog || []).filter(r => r.id !== id);
    save(data);
  }
  function redeemCatalogItem(studentId, itemId) {
    const data = load();
    const s = data.students.find(x => x.id === studentId);
    if (!s) throw new Error("Student not found.");
    const item = (data.rewardCatalog || []).find(r => r.id === itemId);
    if (!item) throw new Error("Reward not found.");
    if ((s.rewardPoints || 0) < item.cost) throw new Error(`Needs ${item.cost} points — has ${s.rewardPoints || 0}.`);
    s.rewardPoints -= item.cost;
    if (!Array.isArray(s.redemptions)) s.redemptions = [];
    s.redemptions.push({ date: new Date().toISOString(), label: item.label, cost: item.cost });
    s.updatedAt = new Date().toISOString();
    save(data);
    return s;
  }
  // Total points a student earned within the current calendar month —
  // for the leaderboard's "this month" ranking. Falls back to 0 for a
  // student who has no pointsLog yet (e.g. created before this existed).
  function pointsThisMonthForStudent(s) {
    const now = new Date();
    const ym = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");
    return (s.pointsLog || []).filter(e => (e.date || "").slice(0, 7) === ym).reduce((sum, e) => sum + (e.amount || 0), 0);
  }

  // ---- CRM-style notes timeline (separate from lesson/session notes) ----
  function addNote(studentId, text, author) {
    text = (text || "").trim();
    if (!text) throw new Error("A note needs some text.");
    const data = load();
    const s = data.students.find(x => x.id === studentId);
    if (!s) throw new Error("Student not found.");
    if (!Array.isArray(s.notes)) s.notes = [];
    s.notes.push({ date: new Date().toISOString(), text, author: author || "" });
    s.updatedAt = new Date().toISOString();
    save(data);
    return s;
  }
  function listNotes(studentId) {
    const s = getStudent(studentId);
    return s && Array.isArray(s.notes) ? s.notes.slice().reverse() : [];
  }
  async function assignStudent(studentId, teacherId) {
    return updateStudent(studentId, { teacherId });
  }
  function removeStudent(id) {
    const data = load();
    data.students = data.students.filter(s => s.id !== id);
    save(data);
  }
  // identifier can be the student's login code (e.g. "482913"), their
  // phone number, or (kept for any old callers) their name -- tried in
  // that order since code and phone are the two ways login.html now
  // actually asks for.
  async function verifyStudentLogin(identifier, pin) {
    const s = findByLoginCode(identifier) || findByPhone(identifier) || findByName(identifier);
    if (!s) return null;
    const p = normalizePin(pin);
    if (!p) return null;
    let matched = false;
    if (s.pinHash) {
      matched = (await hashPin(p)) === s.pinHash;
    } else {
      // legacy record with no pinHash yet (created before hashing existed) —
      // fall back to a plaintext check, then self-heal by adding the hash.
      matched = p === s.pin;
      if (matched) { try { await updateStudent(s.id, { pin: p }); } catch (e) { /* non-fatal */ } }
    }
    if (!matched) return null;
    // Right ID/phone and right PIN -- but if the teacher hasn't approved
    // this account yet (e.g. it was just self-registered via the
    // placement test), block the login here rather than in the caller,
    // so every login surface gets this for free. Thrown rather than
    // returned null so the caller can tell "wrong PIN" apart from
    // "correct PIN, just not approved yet" and show the right message.
    if (s.approved === false) {
      const err = new Error("Your teacher hasn't activated your account yet — check back soon!");
      err.code = "pending_approval";
      throw err;
    }
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
      updatedAt: new Date().toISOString(),
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
    t.updatedAt = new Date().toISOString();
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

  // ---- sync ----
  function getSyncConfig() {
    try {
      const saved = JSON.parse(safeGet(SYNC_KEY) || "null");
      if (saved && saved.url) return saved;
    } catch (e) { /* fall through to default below */ }
    return DEFAULT_SYNC_URL ? { url: DEFAULT_SYNC_URL, enabled: true } : { url: "", enabled: false };
  }
  function configureSync({ url } = {}) {
    const cfg = { url: (url || "").trim(), enabled: !!(url && url.trim()) };
    safeSet(SYNC_KEY, JSON.stringify(cfg));
    return cfg;
  }
  function stripPin(record) {
    const copy = Object.assign({}, record);
    delete copy.pin; // never leaves the device
    // Sheets/Apps Script rows are flat key/value, so array/object fields
    // would otherwise get mangled on the way through -- serialize each to
    // a wire-safe string, same idea as everywhere else here that keeps
    // the Sheet schema flat. Restored back in parseSyncedStudent() below.
    if (Array.isArray(copy.tags)) copy.tags = copy.tags.join(", ");
    if (Array.isArray(copy.pointsLog)) copy.pointsLog = JSON.stringify(copy.pointsLog);
    if (Array.isArray(copy.redemptions)) copy.redemptions = JSON.stringify(copy.redemptions);
    if (Array.isArray(copy.notes)) copy.notes = JSON.stringify(copy.notes);
    return copy;
  }
  function parseSyncedStudent(s) {
    if (!s) return s;
    if (typeof s.tags === "string") s.tags = s.tags.split(",").map(t => t.trim()).filter(Boolean);
    else if (!Array.isArray(s.tags)) s.tags = [];
    ["pointsLog", "redemptions", "notes"].forEach(k => {
      if (typeof s[k] === "string") { try { s[k] = JSON.parse(s[k] || "[]"); } catch (e) { s[k] = []; } }
      else if (!Array.isArray(s[k])) s[k] = [];
    });
    if (s.sessionsRemaining === undefined || s.sessionsRemaining === "") s.sessionsRemaining = 0;
    // Sheets can hand these back as the literal strings "true"/"false"
    // rather than real booleans -- and the string "false" is truthy in
    // JS, so a naive `!!s.approved` here would silently let a
    // NOT-approved student log in the moment their record round-trips
    // through a sync. `approved` in particular gates real student
    // dashboard access, so it gets an explicit, unambiguous parse rather
    // than relying on JS truthiness; an empty/missing value defaults to
    // true, same as brand-new local records and the load() migration.
    const toBool = (v, dflt) => {
      if (v === "" || v === undefined || v === null) return dflt;
      if (typeof v === "string") return v.trim().toLowerCase() === "true";
      return !!v;
    };
    s.approved = toBool(s.approved, true);
    s.paid = toBool(s.paid, true);
    s.subscribed = toBool(s.subscribed, true);
    return s;
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
  //
  // Conflict resolution uses each record's `updatedAt` timestamp: whichever
  // side was edited more recently wins. This matters specifically for a
  // just-changed PIN — without this, syncing shortly after an edit (before
  // that edit had been pushed anywhere) would silently revert it back to
  // whatever was already on the Sheet, since the old code always preferred
  // "remote" on any mismatch regardless of which side was actually newer.
  function mergeById(localList, remoteList) {
    const byId = {};
    localList.forEach(r => { byId[r.id] = Object.assign({}, r); });
    remoteList.forEach(r => {
      const local = byId[r.id];
      if (!local) { byId[r.id] = r; return; }
      const localTime = local.updatedAt ? Date.parse(local.updatedAt) : 0;
      const remoteTime = r.updatedAt ? Date.parse(r.updatedAt) : 0;
      if (localTime > remoteTime) {
        // this device's edit is newer than what's on the Sheet — keep it,
        // and it'll get pushed up right after this merge step runs.
        byId[r.id] = local;
      } else if (local.pin && local.pinHash && local.pinHash === r.pinHash) {
        // remote is newer or tied, but this device still knows the
        // matching plaintext PIN — keep that for local reveal/print.
        byId[r.id] = Object.assign({}, r, { pin: local.pin });
      } else {
        byId[r.id] = r;
      }
    });
    return Object.values(byId);
  }
  // Collapses teacher name collisions after a merge — specifically the
  // "brand-new device auto-seeded its own placeholder before syncing"
  // case. Prefers whichever record actually came from the Sheet over a
  // local-only one, and reports id replacements so the caller can
  // repoint the active session if it was pointed at a dropped duplicate.
  function dedupeTeachersByName(mergedTeachers, remoteTeachers) {
    const remoteIds = new Set(remoteTeachers.map(t => t.id));
    const seenByName = {};
    const replacements = {};
    const result = [];
    mergedTeachers.forEach(t => {
      const key = (t.name || "").trim().toLowerCase();
      if (!seenByName[key]) {
        seenByName[key] = t;
        result.push(t);
        return;
      }
      const existing = seenByName[key];
      if (existing.id === t.id) return; // same record, nothing to do
      const existingIsRemote = remoteIds.has(existing.id);
      const thisIsRemote = remoteIds.has(t.id);
      if (!existingIsRemote && thisIsRemote) {
        const idx = result.indexOf(existing);
        result[idx] = t;
        seenByName[key] = t;
        replacements[existing.id] = t.id;
      } else {
        replacements[t.id] = existing.id;
      }
    });
    return { teachers: result, replacements };
  }
  async function backfillMissingHashes(data) {
    for (const t of data.teachers) {
      if (!t.pinHash && t.pin) t.pinHash = await hashPin(t.pin);
    }
    for (const s of data.students) {
      if (!s.pinHash && s.pin) s.pinHash = await hashPin(s.pin);
    }
  }
  // A bare fetch() never times out on its own -- on a flaky mobile
  // connection (a weak signal, a captive wifi portal, a request that
  // stalls mid-flight) it can simply hang forever with no error and no
  // success, leaving the UI stuck on "Syncing..." indefinitely with
  // nothing to show for it and no way to tell the user what's wrong.
  // Every sync request goes through this instead, so a stalled request
  // always eventually fails loudly (caught by syncNow's try/catch,
  // which already reports it) rather than hanging silently.
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
      // Pull + merge first, so a brand-new device can never push an empty
      // local roster over whatever's already shared.
      const res = await fetchWithTimeout(cfg.url + "?action=pullRoster");
      const remote = await res.json();
      if (remote && Array.isArray(remote.students)) {
        remote.students.forEach(parseSyncedStudent);
        data.students = mergeById(data.students, remote.students);
      }
      if (remote && Array.isArray(remote.teachers) && remote.teachers.length) {
        const merged = mergeById(data.teachers, remote.teachers);
        // A brand-new device auto-seeds its own local-only "Teacher Lumi"
        // placeholder (see load() below) before anyone's had a chance to
        // sync — so the very first sync would otherwise end up with two
        // teachers named "Teacher Lumi" with different ids. Collapse any
        // name collision down to whichever record actually came from the
        // Sheet, and if the browser's current session was pointed at the
        // placeholder that just got dropped, repoint it to the real one
        // so this tab doesn't lose owner access mid-session.
        const { teachers: deduped, replacements } = dedupeTeachersByName(merged, remote.teachers);
        data.teachers = deduped;
        const curId = getCurrentTeacherId();
        if (curId && replacements[curId]) setCurrentTeacherId(replacements[curId]);
      }
      // Reward catalog is a small shared list, not per-student -- simple
      // union by id rather than a full merge-by-updatedAt, since these
      // barely ever change.
      if (remote && Array.isArray(remote.rewardCatalog)) {
        const seen = new Set(data.rewardCatalog.map(r => r.id));
        remote.rewardCatalog.forEach(r => { if (!seen.has(r.id)) { data.rewardCatalog.push(r); seen.add(r.id); } });
      }
      await backfillMissingHashes(data);
      save(data);

      await fetchWithTimeout(cfg.url + "?action=pushRoster", {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          students: data.students.map(stripPin),
          teachers: data.teachers.map(stripPin),
          rewardCatalog: data.rewardCatalog,
        }),
      });
      return { ok: true, at: new Date().toISOString() };
    } catch (e) {
      return { ok: false, reason: e && e.name === "AbortError" ? "timeout" : "network", error: e && e.message };
    }
  }

  global.LumioProfiles = {
    AVATARS, TEACHER_AVATARS,
    listStudents, getStudent, findByName, findByPhone, findByLoginCode, groupmatesOf,
    addStudent, updateStudent, removeStudent, assignStudent,
    addRewardPoints, redeemReward, pointsThisMonthForStudent,
    listRewardCatalog, addRewardCatalogItem, removeRewardCatalogItem, redeemCatalogItem,
    addNote, listNotes,
    verifyStudentLogin, randomPin,
    listTeachers, getTeacher, findTeacherByName,
    addTeacher, updateTeacher, removeTeacher, verifyTeacherLogin,
    getCurrentTeacherId, setCurrentTeacherId, getCurrentTeacher, clearCurrentTeacher, isCurrentTeacherOwner,
    getTeacherName, setTeacherName,
    getSyncConfig, configureSync, syncNow,
  };
})(window);
