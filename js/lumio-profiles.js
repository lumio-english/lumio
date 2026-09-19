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
  // Country -> currency table used by currencyForCountry() (defined
  // further down). Lives up here with the other module constants because
  // load() -- which can run before the rest of this file finishes
  // evaluating -- already needs it for its currency-fixup migration.
  const COUNTRY_CURRENCY = [
    { cur: "EGP", names: ["egypt", "مصر", "eg"] },
    { cur: "KWD", names: ["kuwait", "الكويت", "kw"] },
    { cur: "SAR", names: ["saudi arabia", "saudi", "ksa", "السعودية", "المملكة العربية السعودية", "sa"] },
    { cur: "AED", names: ["uae", "united arab emirates", "emirates", "الإمارات", "الامارات", "dubai", "abu dhabi", "ae"] },
    { cur: "QAR", names: ["qatar", "قطر", "qa"] },
    { cur: "BHD", names: ["bahrain", "البحرين", "bh"] },
    { cur: "OMR", names: ["oman", "عمان", "عُمان", "om"] },
    { cur: "JOD", names: ["jordan", "الأردن", "الاردن", "jo"] },
    { cur: "IQD", names: ["iraq", "العراق", "iq"] },
    { cur: "LBP", names: ["lebanon", "لبنان", "lb"] },
    { cur: "MAD", names: ["morocco", "المغرب", "ma"] },
    { cur: "DZD", names: ["algeria", "الجزائر", "dz"] },
    { cur: "TND", names: ["tunisia", "تونس", "tn"] },
    { cur: "LYD", names: ["libya", "ليبيا", "ly"] },
    { cur: "SDG", names: ["sudan", "السودان", "sd"] },
    { cur: "YER", names: ["yemen", "اليمن", "ye"] },
    { cur: "SYP", names: ["syria", "سوريا", "sy"] },
    { cur: "TRY", names: ["turkey", "türkiye", "turkiye", "تركيا", "tr"] },
    { cur: "GBP", names: ["uk", "united kingdom", "england", "britain", "بريطانيا", "gb"] },
    { cur: "EUR", names: ["germany", "france", "italy", "spain", "netherlands", "ألمانيا", "فرنسا"] },
    { cur: "USD", names: ["usa", "united states", "america", "us", "أمريكا", "الولايات المتحدة"] },
    { cur: "CAD", names: ["canada", "كندا", "ca"] },
  ];

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
    // Despite the name (kept to avoid touching every call site), this is
    // now localStorage-backed, not sessionStorage. CURRENT_TEACHER_KEY is
    // the only thing that ever used this, and it has exactly the same
    // "which tab did this happen in" bug the teacher-login flag itself
    // had (see js/auth.js's own comment on that fix): sessionStorage is
    // scoped to one browser tab, so a tab that never itself went through
    // teacher-portal.html's picker -- which is most of them, once a
    // teacher has the dashboard, a game preview, and a report all open
    // in separate tabs -- had no idea which teacher was "you" even
    // though localStorage's lumio_teacher flag correctly let it into
    // teacher.html at all. isCurrentTeacherOwner() (and anything else
    // gated on "is this the owner") came back false in every tab except
    // the one exact tab the owner originally logged in from, hiding
    // every owner-only control (Edit/New PIN/Remove on teacher cards,
    // etc.) everywhere else.
    try { return localStorage.getItem(key); } catch (e) { return sessionMemory[key] || null; }
  }
  function safeSessionSet(key, val) {
    try { localStorage.setItem(key, val); } catch (e) { sessionMemory[key] = val; }
  }
  function safeSessionRemove(key) {
    try { localStorage.removeItem(key); } catch (e) { delete sessionMemory[key]; }
  }

  // Stable 6-digit code derived from a student's internal id. Same input
  // always yields the same output, so a student's login ID never changes.
  function deriveLoginCode(seed, existing) {
    let hash = 0;
    const str = String(seed || "");
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
    }
    const base = Math.abs(hash) % 900000;
    for (let attempt = 0; attempt < 900000; attempt++) {
      const code = String(100000 + ((base + attempt) % 900000));
      const clash = (existing || []).some(x => x.id !== seed && x.loginCode === code);
      if (!clash) return code;
    }
    return String(100000 + (base % 900000));
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

    // Safety net for students saved before loginCode existed, or whose
    // loginCode came back empty from a sync.
    //
    // This is DELIBERATELY deterministic rather than random. A student's
    // login ID is the number they're shown once (at the end of the
    // placement test) and then type in forever -- it must be the same
    // number every time, on every device. Minting a fresh random code
    // here meant that any time the field arrived blank, the student's ID
    // silently changed out from under them and the number they'd written
    // down stopped working. Deriving it from the student's immutable
    // internal id instead means the same student always resolves to the
    // same 6-digit number, no matter which device rebuilds it or how
    // many times. Collisions fall back to a probe that is itself
    // deterministic, so even that stays stable across devices.
    data.students.forEach(s => {
      if (!s.loginCode) {
        s.loginCode = deriveLoginCode(s.id, data.students);
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
      if (!s.currency) { s.currency = "KWD"; needsSave = true; }
      // safety net for students saved before profile/subscription/rewards
      // fields existed -- plain defaults so every reader (drawer, rewards
      // card, leaderboard, renewal list) can rely on these always existing.
      if (!Array.isArray(s.pointsLog)) { s.pointsLog = []; needsSave = true; }
      if (!Array.isArray(s.redemptions)) { s.redemptions = []; needsSave = true; }
      if (!Array.isArray(s.notes)) { s.notes = []; needsSave = true; }
      if (!Array.isArray(s.messages)) { s.messages = []; needsSave = true; }
      if (!Array.isArray(s.referrals)) { s.referrals = []; needsSave = true; }
      // Currency follows country (see currencyForCountry). Fix up any
      // record saved before that rule existed.
      { const derived = currencyForCountry(s.country); if (derived && s.currency !== derived) { s.currency = derived; needsSave = true; } }
      if (s.sessionsRemaining === undefined) { s.sessionsRemaining = 0; needsSave = true; }
    });
    if (!Array.isArray(data.rewardCatalog)) { data.rewardCatalog = []; needsSave = true; }
    // Tombstones: ids removed on THIS device, so a later sync's additive
    // merge (see mergeById below) never resurrects them just because an
    // older copy is still sitting on the shared Sheet.
    if (!Array.isArray(data.deletedStudentIds)) { data.deletedStudentIds = []; needsSave = true; }
    if (!Array.isArray(data.deletedTeacherIds)) { data.deletedTeacherIds = []; needsSave = true; }

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
    const n = String(name || "").trim().toLowerCase();
    if (!n) return null;
    return load().students.find(s => s.name && String(s.name).trim().toLowerCase() === n) || null;
  }
  function findByPhone(phone) {
    // Defensive on the INPUT too, not just the stored records searched
    // below -- this exact "a Sheets round-trip handed back a Number
    // instead of a string" bug has now shown up from more than one
    // caller (a student's own phone field, and separately a lead's),
    // so guard the argument itself rather than relying on every future
    // caller to remember to coerce it first.
    const raw = String(phone || "").trim();
    if (!raw) return null;
    const students = load().students;
    // Stored/synced phone values are supposed to be strings, but a Google
    // Sheets round-trip hands back any purely-numeric cell as a JS Number
    // (e.g. "201155167475" comes back as 201155167475), and that broke
    // EVERY login attempt system-wide the moment any one student on the
    // roster had a numeric phone -- .find() throws on the first record it
    // touches, not just the one being looked up. String(...) everywhere a
    // phone value is read, rather than trusting it was already a string.
    const exact = students.find(s => s.phone && String(s.phone).trim() === raw);
    if (exact) return exact;

    // Stored numbers are digits-only with the country code prepended and NO
    // leading zero on the local part (see combinePhone in js/app.js and
    // lumio-pro-test.html — e.g. Egypt "01155167475" is saved as
    // "201155167475"). login.html, though, is just a plain text field with
    // no country picker, so a student who registered by picking a country
    // and typing their local number will very naturally log back in by
    // typing that same *local* number alone, without the country code —
    // and the exact-match above would never find them. Normalize both
    // sides to bare digits with any leading zeros stripped, then accept a
    // suffix match: the input is what the student actually dialled, so the
    // saved number should end with it.
    const digits = raw.replace(/\D/g, "").replace(/^0+/, "");
    if (digits.length < 6) return null; // too short to safely suffix-match
    const suffixMatches = students.filter(s => {
      if (!s.phone) return false;
      const stored = String(s.phone).replace(/\D/g, "");
      return stored.length >= digits.length && stored.endsWith(digits);
    });
    // Only trust the suffix match when it's unambiguous — if two different
    // students' numbers happen to share the same local digits under
    // different country codes, refuse to guess rather than log the wrong
    // person in.
    return suffixMatches.length === 1 ? suffixMatches[0] : null;
  }


  function findByLoginCode(code) {
    const c = String(code || "").trim();
    if (!c) return null;
    // Same root cause as findByPhone: loginCode is a purely-numeric string
    // ("482913"), and a Google Sheets round-trip hands numeric-looking
    // cells back as a JS Number, not a string. The old `===` here didn't
    // crash on that (unlike .trim() elsewhere) but it DID silently stop
    // matching -- 482913 === "482913" is false -- so a student's own ID
    // login could quietly break the moment their record round-tripped
    // through a sync, falling through to findByPhone/findByName instead.
    return load().students.find(s => s.loginCode !== undefined && s.loginCode !== null
      && String(s.loginCode).trim() === c) || null;
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
  // ---------- currency follows country ----------
  // The "Amount paid" currency is derived from the student's country
  // rather than picked separately, so a student in Egypt is always shown
  // in EGP, one in Kuwait in KWD, etc. Matches English and Arabic names
  // plus common short forms. Returns null for an unknown/blank country so
  // callers keep whatever currency was already set.
  function currencyForCountry(country) {
    const key = String(country || "").trim().toLowerCase();
    if (!key) return null;
    const hit = COUNTRY_CURRENCY.find(e => e.names.some(n => n === key || key.includes(n) && n.length > 2));
    return hit ? hit.cur : null;
  }

  async function addStudent({ name, level, avatar, pin, loginCode, teacherId, phone, cohort, group, paid, age, gender, grade, country, tags, subscribed, amountPaid, currency, levelsPurchased, rewardPoints, bonusHours, sessionsRemaining, approved } = {}) {
    const data = load();
    name = (name || "").trim();
    if (!name) throw new Error("A student needs a name.");
    if (findByName(name)) throw new Error(`"${name}" is already on the roster.`);
    const finalPin = normalizePin(pin) || randomPin();
    // A caller can request a specific login ID (used only for the
    // permanent test-student account, which needs the same fixed,
    // memorable ID every time rather than a random one) -- falls back to
    // the normal random generator otherwise, and never silently reuses
    // a code that's already taken.
    const finalLoginCode = (loginCode && !data.students.some(s => s.loginCode === loginCode))
      ? loginCode
      : genLoginCode();
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
      loginCode: finalLoginCode,
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
      // Which currency `amountPaid` is in -- KWD/SAR/AED are the ones the
      // teacher actually collects payment in; defaults to KWD only
      // because it has to default to something, not because it's assumed.
      currency: currencyForCountry(country) || currency || "KWD",
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
      // The student's own inbox, shown behind the "Messages" button on
      // their dashboard. {id, type, text, date, read, meta}. Written by
      // the teacher's device (PIN/phone/level changes, delete requests,
      // content-available alerts) and read/marked-read on the student's
      // -- travels between them as part of the student record via the
      // normal roster sync, so no separate sheet or endpoint is needed.
      messages: [],
      // People this student referred to Lumio. {id, name, phone, status,
      // date, rewardedAt}. status: "added" -> "tested" (took the placement
      // test) -> "trial" (attended a trial class) -> "subscribed". The
      // moment one reaches "subscribed", the referring student is
      // credited 5 free sessions, exactly once per referral (rewardedAt).
      referrals: [],
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
    // Snapshot the fields that should notify the student when they
    // change, so the messages added at the bottom reflect a real change
    // and not just a re-save of the same value.
    const before = { pinHash: s.pinHash, phone: s.phone, level: s.level };
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
    if (patch.country !== undefined) {
      s.country = (patch.country || "").trim();
      const derived = currencyForCountry(s.country);
      if (derived) s.currency = derived;
    }
    if (patch.tags !== undefined) s.tags = Array.isArray(patch.tags) ? patch.tags.map(t => String(t).trim()).filter(Boolean) : [];
    if (patch.subscribed !== undefined) s.subscribed = !!patch.subscribed;
    if (patch.amountPaid !== undefined) s.amountPaid = patch.amountPaid === null || patch.amountPaid === "" ? 0 : Number(patch.amountPaid);
    if (patch.currency !== undefined && !currencyForCountry(s.country)) s.currency = patch.currency || "KWD";
    // loginCode is deliberately NOT patchable through the normal edit
    // flow (see addStudent's comment on why it must never change once
    // issued) -- this narrow exception exists only for repairing/
    // repurposing the fixed test-student account, and refuses outright
    // if the requested code is already used by a DIFFERENT student.
    if (patch.loginCode !== undefined && patch.loginCode) {
      const clash = data.students.find(x => x.id !== id && x.loginCode === patch.loginCode);
      if (clash) throw new Error(`Login ID ${patch.loginCode} is already in use.`);
      s.loginCode = patch.loginCode;
    }
    if (patch.levelsPurchased !== undefined) s.levelsPurchased = patch.levelsPurchased === null || patch.levelsPurchased === "" ? 0 : Number(patch.levelsPurchased);
    if (patch.rewardPoints !== undefined) s.rewardPoints = Math.max(0, Number(patch.rewardPoints) || 0);
    if (patch.bonusHours !== undefined) s.bonusHours = Math.max(0, Number(patch.bonusHours) || 0);
    if (patch.sessionsRemaining !== undefined) s.sessionsRemaining = Math.max(0, Number(patch.sessionsRemaining) || 0);
    // Notify the student's inbox about changes to the things they rely
    // on to log in or that change what they're studying. Compared
    // against the snapshot taken at the top so an edit that re-saves
    // the same value doesn't spam them. The new PIN's value itself is
    // deliberately NOT included: PINs never leave the device that set
    // them (see stripPin), and a message travels through the shared
    // Sheet in plain text -- so the notification tells them it changed
    // and to ask their teacher, rather than leaking it.
    if (!Array.isArray(s.messages)) s.messages = [];
    if (patch.pin !== undefined && s.pinHash !== before.pinHash) {
      pushMessage_(s, "pin_changed", "Your PIN was changed by your teacher. Ask them for your new PIN before your next login.");
    }
    if (patch.phone !== undefined && (s.phone || "") !== (before.phone || "")) {
      pushMessage_(s, "phone_changed", s.phone ? `The phone number on your account was updated to +${s.phone}.` : "The phone number was removed from your account.");
    }
    if (patch.level !== undefined && s.level !== before.level) {
      pushMessage_(s, "level_changed", `Your level was changed to ${s.level || "unassigned"}. Your lessons and games will update to match.`);
    }
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
    // Redeeming used to only bump the separate bonusHours counter shown on
    // the rewards card, with a "ask your teacher to book it in!" note --
    // meaning the student's actual usable session count never changed, so
    // it looked like redeeming did nothing where it mattered. A redeemed
    // bonus hour is a real extra session, so credit it straight to
    // sessionsRemaining too -- it shows up immediately, same as any other
    // session, with no separate manual step for the teacher to remember.
    s.sessionsRemaining = (s.sessionsRemaining || 0) + blocks;
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

  // ---------- student inbox (the "Messages" button on their dashboard) ----------
  // Internal: appends to an already-loaded student object. Callers that
  // hold `data` save it themselves; addMessage() below is the public,
  // load-and-save version.
  function pushMessage_(s, type, text, meta) {
    if (!Array.isArray(s.messages)) s.messages = [];
    s.messages.push({
      id: "m_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      type: type,
      text: text,
      meta: meta || null,
      date: new Date().toISOString(),
      read: false,
    });
    // Keep the inbox from growing without bound on a long-lived account
    // (every class reminder, every content alert...). Oldest drop off.
    if (s.messages.length > 200) s.messages = s.messages.slice(-200);
  }
  function addMessage(studentId, { type, text, meta } = {}) {
    const data = load();
    const s = data.students.find(x => x.id === studentId);
    if (!s) throw new Error("Student not found.");
    if (!text) throw new Error("A message needs text.");
    pushMessage_(s, type || "info", text, meta);
    s.updatedAt = new Date().toISOString();
    save(data);
    return s.messages[s.messages.length - 1];
  }
  // Only adds if no message with this dedupeKey already exists -- for
  // things like "class in 1 hour" reminders and "lesson N is ready"
  // alerts that get re-evaluated on every dashboard load and must not
  // pile up duplicates.
  function addMessageOnce(studentId, dedupeKey, { type, text, meta } = {}) {
    const data = load();
    const s = data.students.find(x => x.id === studentId);
    if (!s) return null;
    if (!Array.isArray(s.messages)) s.messages = [];
    if (s.messages.some(m => m.meta && m.meta.dedupeKey === dedupeKey)) return null;
    pushMessage_(s, type || "info", text, Object.assign({}, meta || {}, { dedupeKey }));
    s.updatedAt = new Date().toISOString();
    save(data);
    return s.messages[s.messages.length - 1];
  }
  function listMessages(studentId) {
    const s = getStudent(studentId);
    return s && Array.isArray(s.messages) ? s.messages.slice().reverse() : [];
  }
  function unreadMessageCount(studentId) {
    const s = getStudent(studentId);
    return s && Array.isArray(s.messages) ? s.messages.filter(m => !m.read).length : 0;
  }
  function markMessagesRead(studentId) {
    const data = load();
    const s = data.students.find(x => x.id === studentId);
    if (!s || !Array.isArray(s.messages)) return;
    let changed = false;
    s.messages.forEach(m => { if (!m.read) { m.read = true; changed = true; } });
    if (changed) { s.updatedAt = new Date().toISOString(); save(data); }
  }

  // ---------- account deletion with student confirmation ----------
  // An "active" account is one the student still has something invested
  // in: paid session cards they haven't used, or money on record. For
  // those, the teacher's "Delete Account" doesn't delete outright -- it
  // sends the student a message asking them to confirm, and only their
  // confirmation (from their own dashboard) finalizes it. Anything not
  // active is deleted immediately, same as before.
  function isStudentActive(s) {
    if (!s) return false;
    return (Number(s.sessionsRemaining) || 0) > 0 || (Number(s.amountPaid) || 0) > 0;
  }
  function requestAccountDeletion(studentId, requestedBy) {
    const data = load();
    const s = data.students.find(x => x.id === studentId);
    if (!s) throw new Error("Student not found.");
    s.pendingDeletion = true;
    s.deletionConfirmed = false;
    pushMessage_(s, "delete_request",
      `${requestedBy || "Your teacher"} wants to delete your Lumio account. You still have ${Number(s.sessionsRemaining) || 0} session${(Number(s.sessionsRemaining) || 0) === 1 ? "" : "s"} left. Please confirm below if you agree, or keep your account.`,
      { requestedBy: requestedBy || "" });
    s.updatedAt = new Date().toISOString();
    save(data);
    return s;
  }
  // Student's side, from their own dashboard.
  function confirmAccountDeletion(studentId) {
    const data = load();
    const s = data.students.find(x => x.id === studentId);
    if (!s) throw new Error("Student not found.");
    s.deletionConfirmed = true;
    s.updatedAt = new Date().toISOString();
    save(data);
    return s;
  }
  function declineAccountDeletion(studentId) {
    const data = load();
    const s = data.students.find(x => x.id === studentId);
    if (!s) throw new Error("Student not found.");
    s.pendingDeletion = false;
    s.deletionConfirmed = false;
    // Tell the teacher's side too, so they see why nothing happened.
    pushMessage_(s, "delete_declined", "You chose to keep your account. Your teacher has been notified.", null);
    s.updatedAt = new Date().toISOString();
    save(data);
    return s;
  }

  // ---------- referrals ----------
  const REFERRAL_STATUSES = ["added", "tested", "trial", "subscribed"];
  const REFERRAL_REWARD_SESSIONS = 5;
  function addReferral(studentId, { name, phone } = {}) {
    const data = load();
    const s = data.students.find(x => x.id === studentId);
    if (!s) throw new Error("Student not found.");
    const n = String(name || "").trim();
    if (!n) throw new Error("The referred person needs a name.");
    if (!Array.isArray(s.referrals)) s.referrals = [];
    const ref = {
      id: "r_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      name: n,
      phone: String(phone || "").trim(),
      status: "added",
      date: new Date().toISOString(),
      rewardedAt: null,
    };
    s.referrals.push(ref);
    s.referralsUpdatedAt = new Date().toISOString();
    pushMessage_(s, "referral", `🤝 Thanks for referring ${n}! We'll let you know when they take the test, join a trial, and subscribe — a subscription earns you ${REFERRAL_REWARD_SESSIONS} free sessions.`, { referralId: ref.id });
    s.updatedAt = new Date().toISOString();
    save(data);
    return ref;
  }
  function updateReferralStatus(studentId, referralId, status) {
    if (!REFERRAL_STATUSES.includes(status)) throw new Error("Unknown referral status: " + status);
    const data = load();
    const s = data.students.find(x => x.id === studentId);
    if (!s) throw new Error("Student not found.");
    const ref = (s.referrals || []).find(r => r.id === referralId);
    if (!ref) throw new Error("Referral not found.");
    const prev = ref.status;
    ref.status = status;
    if (status !== prev) {
      if (status === "tested") pushMessage_(s, "referral", `📝 ${ref.name} took the placement test!`, { referralId });
      if (status === "trial") pushMessage_(s, "referral", `🎓 ${ref.name} attended a trial class!`, { referralId });
    }
    // Reward exactly once per referral, on first reaching "subscribed" --
    // moving the status back and forward again never re-credits.
    let rewarded = false;
    if (status === "subscribed" && !ref.rewardedAt) {
      ref.rewardedAt = new Date().toISOString();
      s.sessionsRemaining = (Number(s.sessionsRemaining) || 0) + REFERRAL_REWARD_SESSIONS;
      pushMessage_(s, "referral_reward", `🎁 ${ref.name} subscribed! You earned ${REFERRAL_REWARD_SESSIONS} free sessions — they've been added to your sessions left.`, { referralId, sessions: REFERRAL_REWARD_SESSIONS });
      rewarded = true;
    }
    s.referralsUpdatedAt = new Date().toISOString();
    s.updatedAt = new Date().toISOString();
    save(data);
    return { referral: ref, rewarded, sessionsRemaining: s.sessionsRemaining };
  }
  function removeReferral(studentId, referralId) {
    const data = load();
    const s = data.students.find(x => x.id === studentId);
    if (!s) throw new Error("Student not found.");
    s.referrals = (s.referrals || []).filter(r => r.id !== referralId);
    s.referralsUpdatedAt = new Date().toISOString();
    s.updatedAt = new Date().toISOString();
    save(data);
  }
  function listReferrals(studentId) {
    const s = getStudent(studentId);
    return s && Array.isArray(s.referrals) ? s.referrals.slice().reverse() : [];
  }
  function referralStats(studentId) {
    const refs = listReferrals(studentId);
    const rank = st => REFERRAL_STATUSES.indexOf(st);
    return {
      total: refs.length,
      tested: refs.filter(r => rank(r.status) >= rank("tested")).length,
      trial: refs.filter(r => rank(r.status) >= rank("trial")).length,
      subscribed: refs.filter(r => r.status === "subscribed").length,
      sessionsEarned: refs.filter(r => r.rewardedAt).length * REFERRAL_REWARD_SESSIONS,
      rewardPerSubscription: REFERRAL_REWARD_SESSIONS,
    };
  }
  async function assignStudent(studentId, teacherId) {
    return updateStudent(studentId, { teacherId });
  }
  function removeStudent(id) {
    const data = load();
    data.students = data.students.filter(s => s.id !== id);
    // Without this, the next syncNow() pulls this student back from the
    // Sheet (mergeById is deliberately additive — see its comment) and
    // re-adds them locally, making removal look like it silently undoes
    // itself. Recording the id here means the merge step below can
    // exclude it from the incoming remote list, and since the outgoing
    // push only ever contains what's left in data.students afterwards,
    // the very next sync also removes the row from the shared Sheet for
    // good.
    if (!data.deletedStudentIds.includes(id)) data.deletedStudentIds.push(id);
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
    // Same tombstone mechanism as removeStudent -- see its comment.
    if (!data.deletedTeacherIds.includes(id)) data.deletedTeacherIds.push(id);
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
    // `pin` now DOES sync (Eslam's call): teachers need to see and share a
    // student's current PIN from any device, not just the one that set it.
    // The Sheet is the teacher's own private spreadsheet; pinHash is still
    // what login verification uses.
    // Sheets/Apps Script rows are flat key/value, so array/object fields
    // would otherwise get mangled on the way through -- serialize each to
    // a wire-safe string, same idea as everywhere else here that keeps
    // the Sheet schema flat. Restored back in parseSyncedStudent() below.
    if (Array.isArray(copy.tags)) copy.tags = copy.tags.join(", ");
    if (Array.isArray(copy.pointsLog)) copy.pointsLog = JSON.stringify(copy.pointsLog);
    if (Array.isArray(copy.redemptions)) copy.redemptions = JSON.stringify(copy.redemptions);
    if (Array.isArray(copy.notes)) copy.notes = JSON.stringify(copy.notes);
    if (Array.isArray(copy.messages)) copy.messages = JSON.stringify(copy.messages);
    if (Array.isArray(copy.referrals)) copy.referrals = JSON.stringify(copy.referrals);
    return copy;
  }
  function parseSyncedStudent(s) {
    if (!s) return s;
    if (typeof s.tags === "string") s.tags = s.tags.split(",").map(t => t.trim()).filter(Boolean);
    else if (!Array.isArray(s.tags)) s.tags = [];
    ["pointsLog", "redemptions", "notes", "messages", "referrals"].forEach(k => {
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
    s.pendingDeletion = toBool(s.pendingDeletion, false);
    s.deletionConfirmed = toBool(s.deletionConfirmed, false);
    if (!s.currency) s.currency = "KWD";
    // Google Sheets hands back any cell that looks purely numeric as a JS
    // Number rather than a string -- phone ("201155167475") and loginCode
    // ("482913") both look numeric to Sheets. Left as numbers, every
    // string method called on them elsewhere (findByPhone's .trim(),
    // findByLoginCode's comparison, the roster card's phone formatting,
    // the WhatsApp link builder) either throws outright or silently stops
    // matching. Fixed at the source here so nothing downstream has to
    // guess the type.
    if (s.phone !== undefined && s.phone !== null && s.phone !== "") s.phone = String(s.phone);
    if (s.loginCode !== undefined && s.loginCode !== null && s.loginCode !== "") s.loginCode = String(s.loginCode);
    // pin is a 4-digit string; Sheets turns "0427" into the number 427.
    if (s.pin !== undefined && s.pin !== null && s.pin !== "") s.pin = String(s.pin).padStart(4, "0");
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
      // A student's login ID is the credential they actually type in --
      // it must never change once issued. If the remote copy is missing
      // it (an older Sheet that predates the loginCode column, or a row
      // where that cell is blank), keep whatever this device already has
      // rather than letting the blank overwrite it -- otherwise load()'s
      // migration sees an empty loginCode and mints a brand-new random
      // one, silently changing the ID out from under the student.
      const keepIdentity = (chosen) => {
        if (!chosen.loginCode && local.loginCode) chosen.loginCode = local.loginCode;
        return chosen;
      };
      const localTime = local.updatedAt ? Date.parse(local.updatedAt) : 0;
      const remoteTime = r.updatedAt ? Date.parse(r.updatedAt) : 0;
      // Messages are written by the teacher's device and marked read on
      // the student's -- two devices editing the same record. Plain
      // newest-updatedAt-wins would drop whichever side lost: a new
      // message from the teacher, or a read-mark from the student. So
      // regardless of which copy wins below, the inbox is the union of
      // both, by message id, with "read" sticky once either side set it.
      const unionMessages = (a, b) => {
        const byMsgId = {};
        (Array.isArray(a) ? a : []).concat(Array.isArray(b) ? b : []).forEach(m => {
          if (!m || !m.id) return;
          const prev = byMsgId[m.id];
          byMsgId[m.id] = prev ? Object.assign({}, prev, m, { read: !!(prev.read || m.read) }) : m;
        });
        return Object.values(byMsgId).sort((x, y) => Date.parse(x.date || 0) - Date.parse(y.date || 0));
      };
      const mergedMessages = unionMessages(local.messages, r.messages);
      let chosen;
      if (localTime > remoteTime) {
        // this device's edit is newer than what's on the Sheet — keep it,
        // and it'll get pushed up right after this merge step runs.
        chosen = local;
      } else if (local.pin && local.pinHash && local.pinHash === r.pinHash) {
        // remote is newer or tied, but this device still knows the
        // matching plaintext PIN — keep that for local reveal/print.
        chosen = keepIdentity(Object.assign({}, r, { pin: local.pin }));
      } else {
        chosen = keepIdentity(Object.assign({}, r));
      }
      // mergeById also merges teacher records, which have no inbox --
      // only attach when at least one side actually carries messages.
      if (Array.isArray(local.messages) || Array.isArray(r.messages)) chosen.messages = mergedMessages;
      // Keep a plaintext pin from either side as long as it matches the
      // hash that actually wins -- lets a second teacher device show it.
      if (!chosen.pin) {
        if (r.pin && r.pinHash === chosen.pinHash) chosen.pin = String(r.pin);
        else if (local.pin && local.pinHash === chosen.pinHash) chosen.pin = String(local.pin);
      }
      // Referrals are only ever edited on the teacher's side, so instead
      // of an additive union (which would resurrect a removed referral
      // from the other device's stale copy, exactly the old
      // deleted-student bug) the side that last EDITED referrals wins
      // outright -- tracked by referralsUpdatedAt, bumped only by
      // addReferral/updateReferralStatus/removeReferral. A student device
      // marking messages read bumps updatedAt but never referralsUpdatedAt,
      // so its stale referral copy can no longer overwrite the teacher's.
      // rewardedAt stays sticky by id as a last line of defence against a
      // subscription reward ever being granted twice.
      if (Array.isArray(local.referrals) || Array.isArray(r.referrals)) {
        const lt = local.referralsUpdatedAt ? Date.parse(local.referralsUpdatedAt) : 0;
        const rt = r.referralsUpdatedAt ? Date.parse(r.referralsUpdatedAt) : 0;
        const winner = lt >= rt ? local : r;
        const other = winner === local ? r : local;
        const otherById = {};
        (Array.isArray(other.referrals) ? other.referrals : []).forEach(x => { if (x && x.id) otherById[x.id] = x; });
        chosen.referrals = (Array.isArray(winner.referrals) ? winner.referrals : []).map(x => {
          const o = otherById[x.id];
          return o && o.rewardedAt && !x.rewardedAt ? Object.assign({}, x, { rewardedAt: o.rewardedAt }) : x;
        });
        chosen.referralsUpdatedAt = winner.referralsUpdatedAt || chosen.referralsUpdatedAt || "";
      }
      byId[r.id] = chosen;
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
      // Fold the SHARED tombstone list into this device's own local one
      // before anything else. This is what makes a deletion actually
      // reach every device, not just prevent it from bouncing back on
      // the one that deleted it: a device that already had "eslam" or
      // "abdallah" cached locally from before a deletion happened
      // elsewhere would otherwise keep them forever, since the roster/
      // teacher merge below is deliberately additive and never infers
      // a deletion just because a record is missing from a pull.
      if (remote && Array.isArray(remote.deletedIds)) {
        remote.deletedIds.forEach(entry => {
          if (!entry || !entry.id) return;
          if (entry.type === "teacher") {
            if (!data.deletedTeacherIds.includes(entry.id)) data.deletedTeacherIds.push(entry.id);
          } else {
            if (!data.deletedStudentIds.includes(entry.id)) data.deletedStudentIds.push(entry.id);
          }
        });
        // Now that this device knows about every tombstone the Sheet
        // carries (not just the ones it created itself), actually prune
        // any local record that matches one -- this is the step that
        // makes a stale local copy on another device finally disappear.
        data.students = data.students.filter(s => !data.deletedStudentIds.includes(s.id));
        data.teachers = data.teachers.filter(t => !data.deletedTeacherIds.includes(t.id));
      }
      if (remote && Array.isArray(remote.students)) {
        remote.students.forEach(parseSyncedStudent);
        // Drop anything removed on this device before it ever reaches the
        // additive merge below -- otherwise a still-present Sheet row for
        // an id we deliberately deleted comes right back as "remote-only".
        const incomingStudents = remote.students.filter(s => !data.deletedStudentIds.includes(s.id));
        data.students = mergeById(data.students, incomingStudents);
      }
      if (remote && Array.isArray(remote.teachers) && remote.teachers.length) {
        const incomingTeachers = remote.teachers.filter(t => !data.deletedTeacherIds.includes(t.id));
        const merged = mergeById(data.teachers, incomingTeachers);
        // A brand-new device auto-seeds its own local-only "Teacher Lumi"
        // placeholder (see load() below) before anyone's had a chance to
        // sync — so the very first sync would otherwise end up with two
        // teachers named "Teacher Lumi" with different ids. Collapse any
        // name collision down to whichever record actually came from the
        // Sheet, and if the browser's current session was pointed at the
        // placeholder that just got dropped, repoint it to the real one
        // so this tab doesn't lose owner access mid-session.
        const { teachers: deduped, replacements } = dedupeTeachersByName(merged, incomingTeachers);
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
          // Always the union of what this device knew plus whatever the
          // Sheet already had (folded in during the pull above) -- never
          // just this device's own deletions -- so the shared list can
          // only grow over time and a deletion made anywhere eventually
          // reaches everywhere.
          deletedIds: [
            ...data.deletedStudentIds.map(id => ({ id, type: "student", deletedAt: new Date().toISOString() })),
            ...data.deletedTeacherIds.map(id => ({ id, type: "teacher", deletedAt: new Date().toISOString() })),
          ],
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
    addMessage, addMessageOnce, listMessages, unreadMessageCount, markMessagesRead,
    isStudentActive, requestAccountDeletion, confirmAccountDeletion, declineAccountDeletion,
    currencyForCountry,
    addReferral, updateReferralStatus, removeReferral, listReferrals, referralStats,
    verifyStudentLogin, randomPin,
    listTeachers, getTeacher, findTeacherByName,
    addTeacher, updateTeacher, removeTeacher, verifyTeacherLogin,
    getCurrentTeacherId, setCurrentTeacherId, getCurrentTeacher, clearCurrentTeacher, isCurrentTeacherOwner,
    getTeacherName, setTeacherName,
    getSyncConfig, configureSync, syncNow,
  };
})(window);
