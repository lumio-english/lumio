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
  // Shared secret the Apps Script checks on every request (Script
  // Property LUMIO_API_KEY). Stops anyone who finds the URL from pulling
  // or overwriting the roster. Same value in every file that calls the
  // script: lumio-schedule.js, lumio-leads.js, teacher.html,
  // lumio-pro-test.html, lumio-pro-dashboard.html.
  const LUMIO_API_KEY = "504bc50951590970a9faf630";

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

  function defaultTeacherRecord_() {
    return {
      id: genId("t"),
      name: "Teacher Lumi",
      avatar: "🦉",
      pin: "1111",
      isOwner: true,
      createdAt: new Date().toISOString().slice(0, 10),
    };
  }

  // Create the placeholder owner account only when the roster truly has no
  // teachers (called by the portal after a sync that returned none).
  function ensureDefaultTeacher() {
    const data = load();
    if (data.teachers.length) return data.teachers[0];
    const t = defaultTeacherRecord_();
    data.teachers.push(t);
    save(data);
    return t;
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

    // Guarantee at least one teacher exists so login is never a dead end --
    // but ONLY when there is no backend to pull the real teachers from.
    // With a sync URL configured, a fresh device must wait for the Sheet
    // instead of minting a local-only "Teacher Lumi" that then has to be
    // deduped away (and used to leave the dashboard pointing at a ghost
    // teacher id). The portal calls ensureDefaultTeacher() if the Sheet
    // really has no teachers.
    if (!data.teachers.length && !getSyncConfig().url) {
      data.teachers.push(defaultTeacherRecord_());
      needsSave = true;
    }

    // The Sheet stores every cell as text, so isOwner comes back as
    // "true"/"false" -- and the string "false" is truthy, which made every
    // synced teacher an owner. Turned into a real boolean on every load.
    data.teachers.forEach(t => {
      if (typeof t.isOwner === "string") { t.isOwner = t.isOwner.trim().toLowerCase() === "true"; needsSave = true; }
    });

    // safety net for roster data saved before "isOwner" existed
    if (data.teachers.length && !data.teachers.some(t => t.isOwner)) {
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
      if (!Array.isArray(s.installments)) { s.installments = []; needsSave = true; }
      // Currency follows country (see currencyForCountry). Fix up any
      // record saved before that rule existed.
      { const derived = currencyForCountry(s.country); if (derived && s.currency !== derived) { s.currency = derived; needsSave = true; } }
      if (s.sessionsRemaining === undefined) { s.sessionsRemaining = 0; needsSave = true; }
      if (coerceNumbers(s)) needsSave = true;
    });
    if (!Array.isArray(data.rewardCatalog)) { data.rewardCatalog = []; needsSave = true; }
    // Tombstones: ids removed on THIS device, so a later sync's additive
    // merge (see mergeById below) never resurrects them just because an
    // older copy is still sitting on the shared Sheet.
    if (!Array.isArray(data.deletedStudentIds)) { data.deletedStudentIds = []; needsSave = true; }
    if (!Array.isArray(data.deletedTeacherIds)) { data.deletedTeacherIds = []; needsSave = true; }
    // Reward catalog items removed here (same idea): without it the
    // union-by-id pull put a removed reward straight back.
    if (!Array.isArray(data.deletedRewardIds)) { data.deletedRewardIds = []; needsSave = true; }

    // Migrations/normalisation are not edits: never stamp them as newer
    // than what the Sheet has (see stampChanges).
    if (needsSave) save(data, { noStamp: true });
    return data;
  }
  // ---- field-level change times (3 Oct 2026) ----
  // Every record carries fieldTimes = { field: ISO time it last changed,
  // _base: the record's updatedAt before tracking started }. Two devices
  // (or a teacher device and the script's pushStudentPatch_) editing
  // DIFFERENT fields of the same student no longer overwrite each other:
  // the merge picks each field from whichever side changed it last (see
  // mergeFields). save() stamps the fields that actually changed by
  // diffing against what was stored, so every edit path -- updateStudent,
  // addRewardPoints, redeem*, messages, referrals, deletion -- is covered
  // without each function having to remember. Sync/merge/migration saves
  // pass { noStamp: true }: they adopt other devices' times, not new edits.
  const STAMP_SKIP = { id: 1, updatedAt: 1, fieldTimes: 1, createdAt: 1 };
  function stampChanges(prev, data, now) {
    ["students", "teachers"].forEach(listKey => {
      const before = {};
      ((prev && prev[listKey]) || []).forEach(r => { if (r && r.id) before[r.id] = r; });
      (data[listKey] || []).forEach(r => {
        const old = r && before[r.id];
        if (!old) return; // brand-new record: its createdAt/updatedAt says it all
        if (JSON.stringify(r) === JSON.stringify(old)) return; // cheap path: untouched record
        const changed = Object.keys(Object.assign({}, old, r))
          .filter(k => !STAMP_SKIP[k] && JSON.stringify(r[k]) !== JSON.stringify(old[k]));
        if (!changed.length && r.updatedAt === old.updatedAt) return;
        const ft = (r.fieldTimes && typeof r.fieldTimes === "object") ? r.fieldTimes : {};
        // _base keeps untouched fields at their old time, so bumping
        // updatedAt never makes the whole record look newer.
        if (!ft._base) ft._base = old.updatedAt || r.createdAt || "";
        changed.forEach(k => { ft[k] = now; });
        r.fieldTimes = ft;
        r.updatedAt = now;
      });
    });
  }
  function save(data, opts) {
    const now = new Date().toISOString();
    if (!(opts && opts.noStamp)) {
      let prev = null;
      try { prev = JSON.parse(safeGet(ROSTER_KEY) || "null"); } catch (e) { prev = null; }
      stampChanges(prev, data, now);
    }
    data.updatedAt = now;
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
  // Groupmates: same cohort (batch) + level, case/whitespace-insensitive,
  // excluding the student themself -- used both by the roster UI and by
  // the cohort-comparison report chart. The separate "group" field was
  // removed: level communities are handled outside the app, so batch +
  // level is the whole match now. A student with no cohort has no
  // groupmates by definition.
  function groupmatesOf(studentId) {
    const s = getStudent(studentId);
    if (!s || !s.cohort) return [];
    const norm = v => (v || "").trim().toLowerCase();
    return load().students.filter(x =>
      x.id !== s.id && norm(x.cohort) === norm(s.cohort) && x.level === s.level
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
  // Progress, homework, the report log and schedule slots are keyed by the
  // student's NAME. Renaming used to orphan all of it (back to Lesson 1,
  // classes no longer matching). Move every name-keyed record over.
  function migrateStudentName_(oldName, newName, id) {
    try {
      ["lumio_progress", "lumio_homework", "lumio_level_tests", "lumio_report_log"].forEach(k => {
        const all = JSON.parse(safeGet(k) || "{}") || {};
        if (all[oldName] === undefined) return;
        if (k === "lumio_report_log") { all[newName] = all[oldName]; }
        else {
          const merged = all[newName] || {};
          Object.entries(all[oldName]).forEach(([lv, lessons]) => { merged[lv] = Object.assign({}, lessons, merged[lv] || {}); });
          all[newName] = merged;
        }
        delete all[oldName];
        safeSet(k, JSON.stringify(all));
      });
      const sched = JSON.parse(safeGet("lumio_schedule_v2") || "null");
      if (sched && Array.isArray(sched.classes)) {
        let touched = false;
        const now = new Date().toISOString();
        // Bump updatedAt on every class that changed: without it the
        // Sheet's copy (same timestamp, old name) won the next merge and
        // the rename was undone.
        // The seat's own updatedAt is what the per-seat merge compares
        // (lumio-schedule.js mergeSeats), so the new name wins there too.
        const fix = list => (list || []).forEach(c => (c.students || []).forEach(st => {
          if (st.studentId === id || st.studentName === oldName) {
            if (!c.fieldTimes || typeof c.fieldTimes !== "object") c.fieldTimes = {};
            if (!c.fieldTimes._base) c.fieldTimes._base = c.updatedAt || "";
            st.studentName = newName; st.updatedAt = now; c.updatedAt = now; touched = true;
          }
        }));
        fix(sched.classes); fix(sched.patterns);
        if (touched) safeSet("lumio_schedule_v2", JSON.stringify(sched));
      }
      // The Sheet's Progress/Homework rows are keyed by name too: the next
      // roster push asks the script to move them (see pushRoster_), or the
      // old-name rows came straight back as a "guest" row.
      const pending = JSON.parse(safeGet(PENDING_RENAMES_KEY) || "[]") || [];
      pending.push({ from: oldName, to: newName, id, at: new Date().toISOString() });
      safeSet(PENDING_RENAMES_KEY, JSON.stringify(pending));
    } catch (e) { console.warn("Lumio: rename migration failed", e); }
  }
  const PENDING_RENAMES_KEY = "lumio_pending_renames";

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
      // Payment plan: [{id, amount, currency, dueDate (YYYY-MM-DD), sessions, credit, paidAt, applied, note, remindedAt}] -- see installments section
      installments: [],
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
    const before = { pinHash: s.pinHash, phone: s.phone, level: s.level, subscribed: !!s.subscribed };
    if (patch.name !== undefined) {
      const newName = patch.name.trim();
      if (!newName) throw new Error("A student needs a name.");
      const dupe = data.students.find(x => x.id !== id && x.name.trim().toLowerCase() === newName.toLowerCase());
      if (dupe) throw new Error(`"${newName}" is already on the roster.`);
      if (newName !== s.name) migrateStudentName_(s.name, newName, s.id);
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
    // A referred student who just became subscribed -> the referrer's
    // reward fires right away (see syncReferrals).
    if (patch.subscribed !== undefined && s.subscribed && !before.subscribed) {
      try { syncReferrals({ linkedStudentId: s.id }); } catch (e) {}
    }
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
    s.rewardPoints = Math.max(0, (Number(s.rewardPoints) || 0) + amt);
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
    s.rewardPoints = Number(s.rewardPoints) || 0;
    const blocks = Math.floor(s.rewardPoints / POINTS_PER_HOUR);
    if (blocks < 1) throw new Error(`Needs at least ${POINTS_PER_HOUR} points to redeem — has ${s.rewardPoints || 0}.`);
    s.rewardPoints -= blocks * POINTS_PER_HOUR;
    s.bonusHours = (Number(s.bonusHours) || 0) + blocks;
    // Redeeming used to only bump the separate bonusHours counter shown on
    // the rewards card, with a "ask your teacher to book it in!" note --
    // meaning the student's actual usable session count never changed, so
    // it looked like redeeming did nothing where it mattered. A redeemed
    // bonus hour is a real extra session, so credit it straight to
    // sessionsRemaining too -- it shows up immediately, same as any other
    // session, with no separate manual step for the teacher to remember.
    s.sessionsRemaining = (Number(s.sessionsRemaining) || 0) + blocks;
    if (!Array.isArray(s.redemptions)) s.redemptions = [];
    s.redemptions.push({ date: new Date().toISOString(), label: `+${blocks} bonus hour${blocks === 1 ? "" : "s"}`, cost: blocks * POINTS_PER_HOUR, hours: blocks });
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
    if (!data.deletedRewardIds.includes(id)) data.deletedRewardIds.push(id);
    save(data);
  }
  function redeemCatalogItem(studentId, itemId) {
    const data = load();
    const s = data.students.find(x => x.id === studentId);
    if (!s) throw new Error("Student not found.");
    const item = (data.rewardCatalog || []).find(r => r.id === itemId);
    if (!item) throw new Error("Reward not found.");
    s.rewardPoints = Number(s.rewardPoints) || 0;
    const cost = Number(item.cost) || 0;
    if (s.rewardPoints < cost) throw new Error(`Needs ${cost} points — has ${s.rewardPoints}.`);
    s.rewardPoints -= cost;
    if (!Array.isArray(s.redemptions)) s.redemptions = [];
    s.redemptions.push({ date: new Date().toISOString(), label: item.label, cost, hours: 0 });
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
  function pushMessage_(s, type, text, meta, fixedId) {
    if (!Array.isArray(s.messages)) s.messages = [];
    if (fixedId && s.messages.some(m => m && m.id === fixedId)) return;
    s.messages.push({
      id: fixedId || ("m_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7)),
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
  // Who may refer: a subscribed, approved (active) student.
  function canRefer(s) {
    return !!(s && s.subscribed && s.approved !== false && !s.pendingDeletion);
  }
  function referrerBlockReason(s) {
    if (!s) return "Student not found.";
    if (s.approved === false) return `${s.name}'s account isn't approved yet — only active, subscribed students can refer.`;
    if (!s.subscribed) return `${s.name} isn't subscribed — only subscribed students can refer friends.`;
    return null;
  }
  // Every referral across the roster, newest first: [{ referrer, ref }].
  function listAllReferrals() {
    const out = [];
    load().students.forEach(s => (s.referrals || []).forEach(r => out.push({ referrer: s, ref: r })));
    return out.sort((a, b) => String(b.ref.date).localeCompare(String(a.ref.date)));
  }
  function findReferralByLinked(linkedStudentId) {
    return listAllReferrals().find(x => x.ref.linkedStudentId === linkedStudentId) || null;
  }
  // linkedStudentId: the referred person's own roster record (existing
  // student, or one the teacher just created for them). When set, the
  // status follows that record automatically -- see syncReferrals.
  function addReferral(studentId, { name, phone, linkedStudentId } = {}) {
    const data = load();
    const s = data.students.find(x => x.id === studentId);
    if (!s) throw new Error("Student not found.");
    const block = referrerBlockReason(s);
    if (block) throw new Error(block);
    let linked = null;
    if (linkedStudentId) {
      linked = data.students.find(x => x.id === linkedStudentId);
      if (!linked) throw new Error("The referred student wasn't found on the roster.");
      if (linked.id === s.id) throw new Error("A student can't refer themselves.");
      const dupe = findReferralByLinked(linked.id);
      if (dupe) throw new Error(`${linked.name} is already listed as referred by ${dupe.referrer.name}.`);
    }
    const n = String(name || (linked && linked.name) || "").trim();
    if (!n) throw new Error("The referred person needs a name.");
    if (!Array.isArray(s.referrals)) s.referrals = [];
    const ref = {
      id: "r_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      name: n,
      phone: String(phone || (linked && linked.phone) || "").trim(),
      status: "added",
      date: new Date().toISOString(),
      rewardedAt: null,
      linkedStudentId: linked ? linked.id : null,
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
  // Removing a referral takes its reward back with it: the 5 free sessions
  // credited when that referral subscribed are deducted again (never below
  // zero) and the referrer is told why. Returns { clawedBack } for the UI.
  function removeReferral(studentId, referralId) {
    const data = load();
    const s = data.students.find(x => x.id === studentId);
    if (!s) throw new Error("Student not found.");
    const ref = (s.referrals || []).find(r => r.id === referralId);
    let clawedBack = 0;
    if (ref && ref.rewardedAt) {
      const before = Number(s.sessionsRemaining) || 0;
      s.sessionsRemaining = Math.max(0, before - REFERRAL_REWARD_SESSIONS);
      clawedBack = before - s.sessionsRemaining;
      pushMessage_(s, "referral", `↩️ The referral for ${ref.name} was removed, so the ${REFERRAL_REWARD_SESSIONS} free sessions it earned were taken back (${clawedBack} removed from your sessions left).`, { referralId, sessions: -clawedBack });
    }
    s.referrals = (s.referrals || []).filter(r => r.id !== referralId);
    s.referralsUpdatedAt = new Date().toISOString();
    s.updatedAt = new Date().toISOString();
    save(data);
    return { clawedBack, sessionsRemaining: s.sessionsRemaining };
  }
  function listReferrals(studentId) {
    const s = getStudent(studentId);
    return s && Array.isArray(s.referrals) ? s.referrals.slice().reverse() : [];
  }
  // What a linked referral's status should be, read off the referred
  // student's own record: subscribed -> "subscribed"; marked present in a
  // trial class -> "trial"; came through the placement test -> "tested".
  // Statuses only ever move forward here; a teacher can still set one by hand.
  function autoReferralStatus(linked) {
    if (!linked) return null;
    if (linked.subscribed) return "subscribed";
    let trial = false;
    try {
      const LS = typeof window !== "undefined" ? window.LumioSchedule : null;
      if (LS && LS.listClasses) {
        trial = LS.listClasses({ studentName: linked.name }).some(c => {
          const isTrial = /trial/i.test([c.level, c.notes, c.cohort, c.group].join(" "));
          const slot = (c.students || []).find(x => String(x.studentName).trim().toLowerCase() === String(linked.name).trim().toLowerCase());
          return isTrial && slot && slot.attendance === "present";
        });
      }
    } catch (e) {}
    if (trial || (Array.isArray(linked.tags) && linked.tags.some(t => /trial/i.test(t)))) return "trial";
    if (Array.isArray(linked.tags) && linked.tags.some(t => /placement/i.test(t))) return "tested";
    return "added";
  }
  // Brings every linked referral in line with the referred student's
  // record (optionally only those pointing at one student). Returns the
  // referrals that changed, with `rewarded` flags, so the caller can toast.
  function syncReferrals({ linkedStudentId } = {}) {
    const rank = st => REFERRAL_STATUSES.indexOf(st);
    const changed = [];
    listAllReferrals().forEach(({ referrer, ref }) => {
      if (!ref.linkedStudentId || (linkedStudentId && ref.linkedStudentId !== linkedStudentId)) return;
      const linked = getStudent(ref.linkedStudentId);
      if (!linked) return;
      const want = autoReferralStatus(linked);
      if (!want || rank(want) <= rank(ref.status)) return;
      const res = updateReferralStatus(referrer.id, ref.id, want);
      changed.push({ referrer: getStudent(referrer.id), referral: res.referral, rewarded: res.rewarded, sessionsRemaining: res.sessionsRemaining });
    });
    return changed;
  }
  // Everyone a subscribed student may be credited for referring: roster
  // students other than the referrer who aren't already someone's referral.
  function referrableStudents(referrerId) {
    const taken = new Set(listAllReferrals().map(x => x.ref.linkedStudentId).filter(Boolean));
    return listStudents().filter(s => s.id !== referrerId && !taken.has(s.id));
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
  // ---------- installments (payment plan) ----------
  // The teacher sets a plan on the student: a list of due amounts with
  // dates. Reminders: the student's inbox gets an Arabic+English message
  // 3 days before and on the due day (once each), the dashboard shows a
  // banner, the teacher panel pops a "due today / overdue" list, and the
  // Apps Script (when SMS credentials are set) texts the parent.
  const INSTALLMENT_REMIND_DAYS = 3;
  function todayRiyadh() {
    try { if (typeof window !== "undefined" && window.Lumio && Lumio.tzNow) return Lumio.tzNow().date; } catch (e) {}
    return new Date().toISOString().slice(0, 10);
  }
  function daysBetween(a, b) { return Math.round((Date.UTC(+b.slice(0, 4), +b.slice(5, 7) - 1, +b.slice(8, 10)) - Date.UTC(+a.slice(0, 4), +a.slice(5, 7) - 1, +a.slice(8, 10))) / 86400000); }
  function fmtMoney(amount, currency) { const n = Number(amount) || 0; return `${n % 1 ? n.toFixed(2) : n} ${currency || ""}`.trim(); }
  function fmtDateAr(d) { try { return new Date(d + "T00:00:00").toLocaleDateString("ar-EG", { weekday: "long", day: "numeric", month: "long" }); } catch (e) { return d; } }
  function installmentMessage(s, inst, daysLeft) {
    const amt = fmtMoney(inst.amount, inst.currency || s.currency);
    const when = daysLeft > 0 ? `بعد ${daysLeft === 1 ? "يوم" : daysLeft === 2 ? "يومين" : daysLeft + " أيام"} (${fmtDateAr(inst.dueDate)})` : daysLeft === 0 ? `اليوم (${fmtDateAr(inst.dueDate)})` : `كان في ${fmtDateAr(inst.dueDate)}`;
    const ar = `تذكير من Lumio English: قسط اشتراك ${s.name} بقيمة ${amt} مستحق ${when}. شكراً لكم 🌟`;
    const en = `Lumio English reminder: ${s.name}'s installment of ${amt} is due ${daysLeft > 0 ? `in ${daysLeft} day${daysLeft === 1 ? "" : "s"} (${inst.dueDate})` : daysLeft === 0 ? `today (${inst.dueDate})` : `— it was due on ${inst.dueDate}`}.`;
    return { ar, en };
  }
  // What a PAID installment adds to the student's balance. The operations
  // manager sets both per installment: `sessions` (classes added) and
  // `credit` (added to "Amount paid"; blank = the installment amount).
  // `applied` records exactly what was added, so un-ticking Paid, editing
  // the numbers afterwards, or deleting the row adds/takes back only the
  // difference -- balances never double-count.
  function instTarget_(i) {
    if (!i || !i.paidAt) return { sessions: 0, amount: 0 };
    const credit = i.credit === null || i.credit === undefined || i.credit === "" ? Number(i.amount) || 0 : Number(i.credit) || 0;
    return { sessions: Math.max(0, Math.round(Number(i.sessions) || 0)), amount: Math.round(credit * 100) / 100 };
  }
  function instApplied_(i) {
    const a = i && i.applied;
    // paid before this existed: its money was already entered by hand -- treat as counted
    if (!a) return i && i.paidAt ? instTarget_(i) : { sessions: 0, amount: 0 };
    return { sessions: Number(a.sessions) || 0, amount: Number(a.amount) || 0 };
  }
  // Balance change the plan `next` causes compared with what the stored
  // plan `prev` already added (rows missing from `next` are taken back).
  function installmentBalanceDelta(prev, next) {
    const d = { sessions: 0, amount: 0 };
    (prev || []).forEach(i => { const a = instApplied_(i); d.sessions -= a.sessions; d.amount -= a.amount; });
    (next || []).forEach(i => { const t = instTarget_(i); d.sessions += t.sessions; d.amount += t.amount; });
    d.amount = Math.round(d.amount * 100) / 100;
    return d;
  }
  function applyBalance_(s, d) {
    if (d.sessions) s.sessionsRemaining = Math.max(0, (Number(s.sessionsRemaining) || 0) + d.sessions);
    if (d.amount) s.amountPaid = Math.max(0, Math.round(((Number(s.amountPaid) || 0) + d.amount) * 100) / 100);
  }
  function paidMessage_(s, i) {
    const cur = i.currency || s.currency, t = instTarget_(i);
    const addAr = t.sessions ? ` وأُضيفت ${t.sessions} ${t.sessions === 1 ? "حصة" : t.sessions === 2 ? "حصتان" : t.sessions <= 10 ? "حصص" : "حصة"} إلى رصيدكم` : "";
    const addEn = t.sessions ? ` ${t.sessions} session${t.sessions === 1 ? "" : "s"} added to your balance.` : "";
    pushMessage_(s, "payment",
      `✅ تم استلام قسط بقيمة ${fmtMoney(i.amount, cur)}${addAr}. الحصص المتبقية: ${Number(s.sessionsRemaining) || 0} · إجمالي المدفوع: ${fmtMoney(s.amountPaid, cur)}. شكراً لكم!\n`
      + `Payment of ${fmtMoney(i.amount, cur)} received.${addEn} Sessions left: ${Number(s.sessionsRemaining) || 0} · Total paid: ${fmtMoney(s.amountPaid, cur)}. Thank you!`,
      { installmentId: i.id, sessionsAdded: t.sessions, amountAdded: t.amount }, `paid_${i.id}_${String(i.paidAt).slice(0, 19)}`);
  }
  // opts.balancesInForm: the teacher modal already moved "Sessions left" /
  // "Amount paid" on screen (and saved them), so only record what's applied.
  function setInstallments(studentId, list, opts) {
    const data = load();
    const s = data.students.find(x => x.id === studentId);
    if (!s) throw new Error("Student not found.");
    const prev = Array.isArray(s.installments) ? s.installments : [];
    const prevById = {}; prev.forEach(i => { if (i && i.id) prevById[i.id] = i; });
    const nowIso = new Date().toISOString();
    const next = (list || []).filter(i => i && i.dueDate && Number(i.amount) > 0).map(i => Object.assign({}, i, {
      id: i.id || ("i_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)),
      amount: Number(i.amount), currency: i.currency || s.currency || "", dueDate: String(i.dueDate).slice(0, 10),
      sessions: Math.max(0, Math.round(Number(i.sessions) || 0)),
      credit: i.credit === null || i.credit === undefined || i.credit === "" ? null : Number(i.credit),
      paidAt: i.paidAt || null, note: i.note || "", remindedAt: i.remindedAt || null, remindedDueAt: i.remindedDueAt || null,
      applied: i.applied || null,
    })).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    next.forEach(i => {
      const o = prevById[i.id];
      const key = x => JSON.stringify([Number(x.amount), x.dueDate, Number(x.sessions) || 0, x.credit === undefined ? null : x.credit, !!x.paidAt]);
      if (!o || key(o) !== key(i)) i.editedAt = nowIso;
      // a new date (or amount) is a new reminder cycle
      if (o && (o.dueDate !== i.dueDate || Number(o.amount) !== Number(i.amount))) {
        ["remindedAt", "remindedDueAt", "smsUpcomingAt", "smsDueAt", "smsAt", "smsForDue"].forEach(k => { i[k] = null; });
      }
    });
    // ids removed here are remembered so a merge with an older copy can't bring them back
    const keptIds = new Set(next.map(i => i.id));
    const removed = (Array.isArray(s.installmentsRemoved) ? s.installmentsRemoved : []).slice();
    prev.forEach(i => { if (i && i.id && !keptIds.has(i.id) && !removed.includes(i.id)) removed.push(i.id); });
    if (removed.length) s.installmentsRemoved = removed.slice(-200);
    if (!(opts && opts.balancesInForm)) applyBalance_(s, installmentBalanceDelta(prev, next));
    const wasPaid = new Set(prev.filter(i => i.paidAt).map(i => i.id));
    next.forEach(i => {
      const t = instTarget_(i);
      i.applied = i.paidAt ? { sessions: t.sessions, amount: t.amount, at: (i.applied && i.applied.at) || new Date().toISOString() } : null;
    });
    s.installments = next;
    next.filter(i => i.paidAt && !wasPaid.has(i.id)).forEach(i => paidMessage_(s, i));
    s.updatedAt = new Date().toISOString();
    save(data);
    return s.installments;
  }
  // total, count, firstDate, everyMonths -> evenly split plan (last one takes the rounding)
  function buildInstallmentPlan({ total, count, firstDate, everyMonths, currency, sessions } = {}) {
    const n = Math.max(1, Number(count) || 1), T = Number(total) || 0, step = Math.max(1, Number(everyMonths) || 1);
    const SS = Math.max(0, Math.round(Number(sessions) || 0)), sBase = Math.floor(SS / n), sExtra = SS - sBase * n;  // extra sessions go to the first parts
    const base = Math.floor((T / n) * 100) / 100;
    const out = [];
    const [y, m, d] = String(firstDate || todayRiyadh()).split("-").map(Number);
    for (let k = 0; k < n; k++) {
      const dt = new Date(Date.UTC(y, m - 1 + k * step, 1));
      const lastDay = new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth() + 1, 0)).getUTCDate();
      const dd = new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), Math.min(d, lastDay)));
      out.push({ amount: k === n - 1 ? Math.round((T - base * (n - 1)) * 100) / 100 : base, currency, dueDate: dd.toISOString().slice(0, 10), sessions: sBase + (k < sExtra ? 1 : 0), credit: null });
    }
    return out;
  }
  function markInstallmentPaid(studentId, instId, paid) {
    const s0 = (load().students || []).find(x => x.id === studentId);
    if (!s0) throw new Error("Student not found.");
    const list = (s0.installments || []).map(x => Object.assign({}, x));
    const i = list.find(x => x.id === instId);
    if (!i) throw new Error("Installment not found.");
    i.paidAt = paid === false ? null : (i.paidAt || new Date().toISOString());
    return setInstallments(studentId, list).find(x => x.id === instId);
  }
  // Every unpaid installment across the roster with how many days are left
  // (negative = overdue). `withinDays` limits to the coming window.
  function installmentsDue({ withinDays } = {}) {
    const today = todayRiyadh(); const out = [];
    load().students.forEach(s => (s.installments || []).forEach(i => {
      if (i.paidAt) return;
      const daysLeft = daysBetween(today, i.dueDate);
      if (withinDays !== undefined && daysLeft > withinDays) return;
      out.push({ student: s, inst: i, daysLeft });
    }));
    return out.sort((a, b) => a.daysLeft - b.daysLeft);
  }
  // Drops the automatic reminders into students' inboxes: once at 3 days
  // before, once on the due day (and once if already overdue when first
  // seen). Returns what it sent so the caller can toast / sync.
  function sendDueInstallmentReminders() {
    const data = load(); const today = todayRiyadh(); const sent = [];
    data.students.forEach(s => (s.installments || []).forEach(i => {
      if (i.paidAt) return;
      const daysLeft = daysBetween(today, i.dueDate);
      if (daysLeft <= INSTALLMENT_REMIND_DAYS && daysLeft > 0 && !i.remindedAt) {
        const m = installmentMessage(s, i, daysLeft);
        pushMessage_(s, "payment_due", `💳 ${m.ar}\n${m.en}`, { installmentId: i.id, amount: i.amount, dueDate: i.dueDate }, `due_${i.id}_up_${i.dueDate}`);
        i.remindedAt = new Date().toISOString(); sent.push({ student: s.name, stage: "upcoming", daysLeft });
      } else if (daysLeft <= 0 && !i.remindedDueAt) {
        const m = installmentMessage(s, i, daysLeft);
        pushMessage_(s, "payment_due", `💳 ${m.ar}\n${m.en}`, { installmentId: i.id, amount: i.amount, dueDate: i.dueDate }, `due_${i.id}_due_${i.dueDate}`);
        i.remindedDueAt = new Date().toISOString(); sent.push({ student: s.name, stage: daysLeft === 0 ? "due" : "overdue", daysLeft });
      }
    }));
    if (sent.length) { data.students.forEach(s => { if ((s.installments || []).some(i => i.remindedAt || i.remindedDueAt)) s.updatedAt = new Date().toISOString(); }); save(data); }
    return sent;
  }
  function installmentSummary(s) {
    const list = s && Array.isArray(s.installments) ? s.installments : [];
    const paid = list.filter(i => i.paidAt), unpaid = list.filter(i => !i.paidAt);
    const sum = l => Math.round(l.reduce((a, i) => a + (Number(i.amount) || 0), 0) * 100) / 100;
    const next = unpaid.slice().sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0] || null;
    const sessionsAdded = paid.reduce((a, i) => a + (i.applied ? Number(i.applied.sessions) || 0 : 0), 0);
    const sessionsPlanned = list.reduce((a, i) => a + (Number(i.sessions) || 0), 0);
    return { count: list.length, paidCount: paid.length, paidTotal: sum(paid), dueTotal: sum(unpaid), total: sum(list), next, sessionsAdded, sessionsPlanned, nextDays: next ? daysBetween(todayRiyadh(), next.dueDate) : null };
  }

  async function assignStudent(studentId, teacherId) {
    return updateStudent(studentId, { teacherId });
  }
  function removeStudent(id) {
    const data = load();
    const gone = data.students.find(s => s.id === id);
    // A deleted student must not keep a seat in classes that haven't
    // started (it blocked the seat and kept regenerating from a fixed
    // schedule); classes already held keep them for the record.
    if (gone && global.LumioSchedule && typeof global.LumioSchedule.removeStudentFromFuture === "function") {
      try { global.LumioSchedule.removeStudentFromFuture(gone.id, gone.name); } catch (e) { console.warn("Lumio: seat cleanup failed", e); }
    }
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
    const caps = await serverCaps();
    if (caps.auth && normalizePin(pin)) {
      const pinHash = await hashPin(normalizePin(pin));
      let out = null;
      try { out = await postAction("studentLogin", { identifier: String(identifier || "").trim(), pinHash }); } catch (e) { out = null; }
      if (out && out.ok && out.student) {
        // This device now holds exactly one student: this one. Anything a
        // previous version cached about other students is dropped.
        const me = parseSyncedStudent(Object.assign({}, out.student, { pinHash }));
        const data = load();
        const prev = data.students.find(x => x.id === me.id);
        const merged = prev ? Object.assign({}, prev, me, { notes: prev.notes || [] }) : me;
        // On a teacher's own device (testing a student login) keep the
        // rest of the roster; on a student's phone keep only this student.
        data.students = isTeacherDevice()
          ? data.students.filter(x => x.id !== me.id).concat([merged])
          : [Object.assign({}, merged, { notes: [] })];
        if (Array.isArray(out.teachers)) data.teachers = mergeById(data.teachers, out.teachers);
        if (Array.isArray(out.rewardCatalog)) data.rewardCatalog = out.rewardCatalog.map(r => ({ ...r, cost: Number(r.cost) || 0 }));
        save(data, { noStamp: true });
        setStudentAuth(me.id, pinHash);
        return data.students.find(x => x.id === me.id);
      }
      if (out && out.error === "pending_approval") {
        const err = new Error("Your teacher hasn't activated your account yet — check back soon!");
        err.code = "pending_approval";
        throw err;
      }
      if (out && out.error === "locked") {
        const err = new Error("Too many wrong PINs — please wait 15 minutes and try again.");
        err.code = "locked";
        throw err;
      }
      if (out) return null;
      // No answer from the server (offline): fall through to this
      // device's own saved record, if it has one.
    }
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
    if (s.pinHash) setStudentAuth(s.id, s.pinHash);
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
  async function addTeacher({ name, avatar, pin, isOwner, photoDataUrl, meetingLink } = {}) {
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
      photoDataUrl: photoDataUrl || "",
      meetingLink: (meetingLink || "").trim(), // the teacher's standing classroom link (Teams / Zoom / Meet)
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
    if (patch.photoDataUrl !== undefined) t.photoDataUrl = patch.photoDataUrl || "";
    if (patch.meetingLink !== undefined) t.meetingLink = String(patch.meetingLink || "").trim();
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
    const pinHash = await hashPin(p);
    const caps = await serverCaps();
    if (caps.auth) {
      // The teacher list a device gets before sign-in has no PIN hashes,
      // so the script checks the PIN.
      let out = null;
      try { out = await postAction("teacherLogin", { id: t.id, pinHash }); } catch (e) { out = null; }
      if (out && out.ok) {
        setTeacherAuth(t.id, pinHash);
        if (out.teacher) {
          const data = load();
          data.teachers = data.teachers.map(x => x.id === t.id ? Object.assign({}, x, out.teacher) : x);
          save(data);
        }
        return getTeacher(t.id) || t;
      }
      if (out && out.error === "locked") {
        const err = new Error("Too many wrong PINs — please wait 15 minutes and try again.");
        err.code = "locked";
        throw err;
      }
      if (out) return null;
    }
    if (t.pinHash) {
      if (pinHash !== t.pinHash) return null;
      setTeacherAuth(t.id, t.pinHash);
      return t;
    }
    if (p !== t.pin) return null;
    try { await updateTeacher(t.id, { pin: p }); } catch (e) { /* non-fatal */ }
    setTeacherAuth(t.id, pinHash);
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
    clearTeacherAuth();
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
  // Fields this site version expects the Apps Script to store. If the
  // last pull shows the Teachers tab lacks any of them, the script needs
  // redeploying (see _docs/HANDOFF.md) -- edits to those fields only live
  // on this device until then.
  const SERVER_TEACHER_FIELDS = ["photoDataUrl", "meetingLink"];
  const SERVER_ROSTER_FIELDS = ["installments", "installmentsRemoved", "referrals"];
  function serverMissingFields() {
    const out = [];
    try {
      const keys = JSON.parse(safeGet("lumio_server_teacher_keys") || "null");
      if (Array.isArray(keys) && keys.length) SERVER_TEACHER_FIELDS.forEach(k => { if (!keys.includes(k)) out.push(k); });
    } catch (e) {}
    try {
      const keys = JSON.parse(safeGet("lumio_server_roster_keys") || "null");
      if (Array.isArray(keys) && keys.length) SERVER_ROSTER_FIELDS.forEach(k => { if (!keys.includes(k)) out.push(k); });
    } catch (e) {}
    return out;
  }
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
  // ---- who this device is (2 Oct 2026) ----
  // Sent with every Sheet request so the script can decide what this
  // device may see (see whoIs_ in the Apps Script): a teacher who proved
  // their PIN gets everything, a student only their own record, classes
  // and progress, an anonymous page only the teacher list. Stored in
  // localStorage so new tabs (report, presenter) and the 5-minute auto
  // sync keep working; removed on logout / teacher switch.
  const TEACHER_AUTH_KEY = "lumio_teacher_auth";
  const STUDENT_AUTH_KEY = "lumio_student_auth";
  function readAuth(k) {
    try { const a = JSON.parse(safeGet(k) || "null"); return a && a.id && a.pinHash ? a : null; } catch (e) { return null; }
  }
  function getTeacherAuth() { return readAuth(TEACHER_AUTH_KEY); }
  function getStudentAuth() { return readAuth(STUDENT_AUTH_KEY); }
  function setTeacherAuth(id, pinHash) { safeSet(TEACHER_AUTH_KEY, JSON.stringify({ id, pinHash })); }
  function setStudentAuth(id, pinHash) { safeSet(STUDENT_AUTH_KEY, JSON.stringify({ id, pinHash })); }
  function clearTeacherAuth() { try { localStorage.removeItem(TEACHER_AUTH_KEY); } catch (e) {} }
  function clearStudentAuth() { try { localStorage.removeItem(STUDENT_AUTH_KEY); } catch (e) {} }
  function authQuery() {
    const enc = encodeURIComponent;
    const t = getTeacherAuth();
    if (t) return "&tid=" + enc(t.id) + "&th=" + enc(t.pinHash);
    const st = getStudentAuth();
    if (st) return "&sid=" + enc(st.id) + "&sh=" + enc(st.pinHash);
    return "";
  }
  // A device that is not signed in as a teacher. It only ever holds its
  // own student record (the script sends nothing else any more).
  function isTeacherDevice() { return !!getTeacherAuth() || safeGet("lumio_teacher") === "1"; }
  function isStudentDevice() { return !isTeacherDevice() && !!getStudentAuth(); }
  // Students who logged in before this change have no stored credentials,
  // but their phone still has their own record (with its pinHash) from
  // the old full-roster download -- adopt it once so they stay signed in.
  function adoptLegacyStudentAuth() {
    if (isTeacherDevice() || getStudentAuth()) return;
    const id = safeGet("lumio_student_id");
    if (!id) return;
    const me = load().students.find(x => x.id === id);
    if (me && me.pinHash) setStudentAuth(me.id, me.pinHash);
  }
  // Does the deployed script check who is calling (version 7+)? Older
  // deployments answer the "version" action with their plain "running"
  // message. Asked once per tab; until the new script is deployed every
  // page keeps the previous behaviour.
  let capsPromise = null;
  function serverCaps() {
    try { const c = JSON.parse(sessionStorage.getItem("lumio_srv_caps") || "null"); if (c) return Promise.resolve(c); } catch (e) {}
    if (capsPromise) return capsPromise;
    const cfg = getSyncConfig();
    if (!cfg.enabled || !cfg.url) return Promise.resolve({ auth: false });
    capsPromise = fetchWithTimeout(cfg.url + "?key=" + LUMIO_API_KEY + "&action=version", {}, 10000)
      .then(r => r.json())
      .then(j => {
        const c = { auth: !!(j && j.auth), version: (j && j.version) || 0 };
        try { sessionStorage.setItem("lumio_srv_caps", JSON.stringify(c)); } catch (e) {}
        return c;
      })
      .catch(() => ({ auth: false, unknown: true }))
      .finally(() => { capsPromise = null; });
    return capsPromise;
  }
  async function postAction(action, body) {
    const cfg = getSyncConfig();
    const res = await fetchWithTimeout(cfg.url + "?key=" + LUMIO_API_KEY + "&action=" + action + authQuery(), {
      method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(body || {}),
    });
    return res.json();
  }

  function stripPin(record) {
    const copy = Object.assign({}, record);
    // The plaintext `pin` stays on the device that set it: the Roster and
    // Teachers tabs deliberately have NO pin column (the script would drop
    // it anyway), so it is not sent at all. Only pinHash syncs, and that is
    // what every login check uses. Another teacher device cannot read the
    // PIN back; it can only set a new one.
    delete copy.pin;
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
    if (Array.isArray(copy.installments)) copy.installments = JSON.stringify(copy.installments);
    if (Array.isArray(copy.installmentsRemoved)) copy.installmentsRemoved = JSON.stringify(copy.installmentsRemoved);
    return copy;
  }
  // The Sheet stores every cell as text (writeRows_ formats the range as
  // "@"), so counters come back as "20", not 20 -- and "20" + 60 is
  // "2060". Every numeric field is coerced here and in load(), the only
  // two ways a record enters this device.
  const NUMERIC_FIELDS = ["rewardPoints", "bonusHours", "sessionsRemaining", "amountPaid", "levelsPurchased"];
  function coerceNumbers(s) {
    let changed = false;
    NUMERIC_FIELDS.forEach(k => {
      if (s[k] === undefined || s[k] === null) return;
      const n = Number(s[k]);
      const v = (s[k] === "" || !isFinite(n)) ? 0 : n;
      if (v !== s[k]) { s[k] = v; changed = true; }
    });
    return changed;
  }
  // fieldTimes travels as JSON text in the Sheet.
  function parseFieldTimes(rec) {
    if (!rec || rec.fieldTimes === undefined) return rec;
    if (typeof rec.fieldTimes === "string") {
      try { rec.fieldTimes = rec.fieldTimes ? JSON.parse(rec.fieldTimes) : null; } catch (e) { rec.fieldTimes = null; }
    }
    if (!rec.fieldTimes || typeof rec.fieldTimes !== "object") delete rec.fieldTimes;
    return rec;
  }
  function parseSyncedStudent(s) {
    if (!s) return s;
    parseFieldTimes(s);
    coerceNumbers(s);
    if (typeof s.tags === "string") s.tags = s.tags.split(",").map(t => t.trim()).filter(Boolean);
    else if (!Array.isArray(s.tags)) s.tags = [];
    // A column the Sheet doesn't have yet (Apps Script not redeployed)
    // arrives as undefined: leave it undefined so the merge treats it as
    // "not known there" and keeps this device's copy. Turning it into []
    // here used to WIPE e.g. a new installment plan on the next sync,
    // because the pushed fieldTimes stamp made the empty list look newer.
    ["pointsLog", "redemptions", "notes", "messages", "referrals", "installments", "installmentsRemoved"].forEach(k => {
      if (s[k] === undefined) return;
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
  // Conflict resolution is PER FIELD since 3 Oct 2026 (see stampChanges
  // and mergeFields): each field comes from whichever side changed it last,
  // falling back to the record's updatedAt for rows written before
  // fieldTimes existed. Whole-record newest-wins used to let a teacher
  // device that edited a phone number silently undo a redemption or avatar
  // change the student had made meanwhile, and two teacher devices editing
  // different fields of one student lost one of the edits.
  // The script leaves pinHash (and a student's CRM notes) out of what it
  // sends to anyone but a signed-in teacher. A missing field there means
  // "not shown to you", never "cleared", so the local value is kept.
  function keepHidden(before, merged) {
    const prev = {};
    before.forEach(r => { prev[r.id] = r; });
    return merged.map(r => {
      const old = prev[r.id];
      if (!old) return r;
      const out = Object.assign({}, r);
      ["pinHash", "notes"].forEach(k => { if ((out[k] === undefined) && old[k] !== undefined) out[k] = old[k]; });
      return out;
    });
  }
  // ---- per-field merge (same rules as mergeFields_ in the Apps Script) ----
  function ftOf(rec) {
    let ft = rec && rec.fieldTimes;
    if (typeof ft === "string") { try { ft = ft ? JSON.parse(ft) : null; } catch (e) { ft = null; } }
    return ft && typeof ft === "object" ? ft : {};
  }
  function tms(v) { const n = v ? Date.parse(v) : NaN; return isNaN(n) ? 0 : n; }
  // When a field has no time of its own it is as old as the record's
  // _base (or, for a row that predates fieldTimes, its updatedAt).
  function fieldTime(rec, ft, k) { return tms(ft[k]) || tms(ft._base) || tms(rec.updatedAt); }
  function baseTime(rec, ft) { return tms(ft._base) || tms(rec.updatedAt); }
  // a wins ties (callers pass the Sheet's copy as a). A field one side
  // doesn't carry at all is "not known there", never "cleared".
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
  function mergeById(localList, remoteList) {
    const byId = {};
    localList.forEach(r => { byId[r.id] = Object.assign({}, r); });
    remoteList.forEach(r => {
      const local = byId[r.id];
      if (!local) { byId[r.id] = r; return; }
      // Remote (the Sheet) is passed first so it wins exact ties.
      const chosen = mergeFields(r, local);
      // A student's login ID is the credential they actually type in --
      // it must never change once issued. If the remote copy is missing
      // it (an older Sheet that predates the loginCode column, or a row
      // where that cell is blank), keep whatever this device already has
      // rather than letting the blank overwrite it -- otherwise load()'s
      // migration sees an empty loginCode and mints a brand-new random
      // one, silently changing the ID out from under the student.
      if (!chosen.loginCode && local.loginCode) chosen.loginCode = local.loginCode;
      // Messages are written by the teacher's device and marked read on
      // the student's -- two devices editing the same record. Whatever
      // the field times say, the inbox is the union of both, by message
      // id, with "read" sticky once either side set it.
      const unionMessages = (x, y) => {
        const byMsgId = {};
        (Array.isArray(x) ? x : []).concat(Array.isArray(y) ? y : []).forEach(m => {
          if (!m || !m.id) return;
          const prev = byMsgId[m.id];
          byMsgId[m.id] = prev ? Object.assign({}, prev, m, { read: !!(prev.read || m.read) }) : m;
        });
        return Object.values(byMsgId).sort((p, q) => Date.parse(p.date || 0) - Date.parse(q.date || 0));
      };
      // mergeById also merges teacher records, which have no inbox --
      // only attach when at least one side actually carries messages.
      if (Array.isArray(local.messages) || Array.isArray(r.messages)) chosen.messages = unionMessages(local.messages, r.messages);
      // The plaintext pin never leaves this device (see stripPin): keep it
      // as long as it still matches the hash that won.
      if (local.pin && local.pinHash && local.pinHash === chosen.pinHash) chosen.pin = String(local.pin);
      else if (!(r.pin && r.pinHash === chosen.pinHash)) delete chosen.pin;
      // Referrals are only ever edited on the teacher's side: the side that
      // last EDITED them wins outright (referralsUpdatedAt, else the field
      // time), never a union that would resurrect a removed referral.
      // rewardedAt stays sticky by id as a last line of defence against a
      // subscription reward ever being granted twice.
      if (Array.isArray(local.referrals) || Array.isArray(r.referrals)) {
        const lt = tms(local.referralsUpdatedAt) || fieldTime(local, ftOf(local), "referrals");
        const rt = tms(r.referralsUpdatedAt) || fieldTime(r, ftOf(r), "referrals");
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
      if (Array.isArray(local.installments) || Array.isArray(r.installments)) {
        const m = mergeInstallmentLists(r, local);
        chosen.installments = m.list; if (m.removed.length) chosen.installmentsRemoved = m.removed;
      }
      byId[r.id] = chosen;
    });
    return Object.values(byId);
  }
  // Installments merge PER PART (by id), not as one blob: each part comes
  // from whichever side edited it last (editedAt), reminder/SMS stamps for
  // the same due date are kept from either side, and parts removed on
  // either side stay removed. (As one blob, a teacher device that only
  // stamped a reminder could revert a "Paid" made on another device.)
  const INST_STAMPS = ["remindedAt", "remindedDueAt", "smsUpcomingAt", "smsDueAt", "smsAt", "smsForDue"];
  function mergeInstallmentLists(a, b) {
    const removed = Array.from(new Set([].concat(Array.isArray(a.installmentsRemoved) ? a.installmentsRemoved : [], Array.isArray(b.installmentsRemoved) ? b.installmentsRemoved : [])));
    const gone = new Set(removed), byId = {};
    // An older Sheet script keeps the plan but not the removed-ids list: a
    // part only this device has was then most likely deleted elsewhere --
    // keep it only if it was edited here after the Sheet's copy changed.
    const remoteIds = new Set((Array.isArray(a.installments) ? a.installments : []).map(i => i && i.id));
    const noTombs = a.installmentsRemoved === undefined && Array.isArray(a.installments);
    const remoteT = noTombs ? fieldTime(a, ftOf(a), "installments") : 0;
    [a, b].forEach((side, idx) => (Array.isArray(side.installments) ? side.installments : []).forEach(i => {
      if (!i || !i.id || gone.has(i.id)) return;
      if (idx === 1 && noTombs && !remoteIds.has(i.id) && !(tms(i.editedAt) > remoteT)) return;
      const cur = byId[i.id];
      if (!cur) { byId[i.id] = Object.assign({}, i); return; }
      const win = tms(i.editedAt) > tms(cur.editedAt) ? Object.assign({}, i) : cur, lose = win === cur ? i : cur;
      if (win.dueDate === lose.dueDate) INST_STAMPS.forEach(k => { if (!win[k] && lose[k]) win[k] = lose[k]; });
      byId[i.id] = win;
    }));
    return { list: Object.values(byId).sort((x, y) => String(x.dueDate).localeCompare(String(y.dueDate))), removed };
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

  // opts.pullOnly: pull + merge + save, but never push the roster back.
  // Student devices use this (see pushStudentPatch for their write path);
  // a student's stale copy of the roster must never overwrite the Sheet.
  async function syncNow(opts) {
    let pullOnly = !!(opts && opts.pullOnly);
    const cfg = getSyncConfig();
    if (!cfg.enabled || !cfg.url) return { ok: false, reason: "not-configured" };
    const caps = await serverCaps();
    // Only a signed-in teacher may write the roster once the script checks.
    if (caps.auth && !getTeacherAuth()) pullOnly = true;
    if (caps.auth) adoptLegacyStudentAuth();
    let data;
    try {
      // Pull + merge first, so a brand-new device can never push an empty
      // local roster over whatever's already shared.
      const res = await fetchWithTimeout(cfg.url + "?key=" + LUMIO_API_KEY + "&action=pullRoster" + authQuery());
      const remote = await res.json();
      // Read local data only now: an edit made while the pull was in
      // flight used to be overwritten by the merge result saved below.
      data = load();
      if (remote && remote.ok === false) {
        // The script refused: wrong/old PIN, or this student was deleted.
        const reason = remote.error || "refused";
        if (reason === "deleted" || reason === "unauthorized") {
          const st = getStudentAuth();
          if (st && !getTeacherAuth()) {
            clearStudentAuth();
            if (reason === "deleted") {
              if (!data.deletedStudentIds.includes(st.id)) data.deletedStudentIds.push(st.id);
              data.students = data.students.filter(x => x.id !== st.id);
              save(data);
            }
          } else if (getTeacherAuth()) {
            clearTeacherAuth();
          }
        }
        return { ok: false, reason };
      }
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
          } else if (entry.type === "reward") {
            if (!data.deletedRewardIds.includes(entry.id)) data.deletedRewardIds.push(entry.id);
          } else if (!entry.type || entry.type === "student") {
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
        data.students = keepHidden(data.students, mergeById(data.students, incomingStudents));
        // A device that is not a teacher's keeps only its own student
        // (older versions cached the whole roster on every phone).
        if (caps.auth && isStudentDevice()) {
          const st = getStudentAuth();
          data.students = data.students.filter(x => st && x.id === st.id);
        }
      }
      // Remember which teacher columns the Sheet actually carries, so the
      // dashboard can warn when the Apps Script is older than the site
      // (fields it doesn't know are dropped on every push).
      if (remote && Array.isArray(remote.teachers) && remote.teachers.length) {
        try { safeSet("lumio_server_teacher_keys", JSON.stringify(Object.keys(remote.teachers[0]))); } catch (e) {}
      }
      if (remote && Array.isArray(remote.students) && remote.students.length && getTeacherAuth()) {
        try { safeSet("lumio_server_roster_keys", JSON.stringify(Object.keys(remote.students.reduce((a, r) => Object.assign(a, r), {})))); } catch (e) {}
      }
      if (remote && Array.isArray(remote.teachers) && remote.teachers.length) {
        const incomingTeachers = remote.teachers.filter(t => !data.deletedTeacherIds.includes(t.id));
        const merged = keepHidden(data.teachers, mergeById(data.teachers, incomingTeachers));
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
        remote.rewardCatalog.forEach(r => { if (r && !seen.has(r.id) && !data.deletedRewardIds.includes(r.id)) { data.rewardCatalog.push({ ...r, cost: Number(r.cost) || 0 }); seen.add(r.id); } });
      }
      data.rewardCatalog = data.rewardCatalog.filter(r => r && !data.deletedRewardIds.includes(r.id));
      await backfillMissingHashes(data);
      save(data, { noStamp: true }); // adopting the Sheet's values, not a local edit
      if (pullOnly) return { ok: true, at: new Date().toISOString(), pullOnly: true };

      const pushRes = await fetchWithTimeout(cfg.url + "?key=" + LUMIO_API_KEY + "&action=pushRoster" + authQuery(), {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          students: data.students.map(stripPin),
          teachers: data.teachers.map(stripPin),
          rewardCatalog: data.rewardCatalog,
          renames: (() => { try { return JSON.parse(safeGet(PENDING_RENAMES_KEY) || "[]") || []; } catch (e) { return []; } })(),
          // Always the union of what this device knew plus whatever the
          // Sheet already had (folded in during the pull above) -- never
          // just this device's own deletions -- so the shared list can
          // only grow over time and a deletion made anywhere eventually
          // reaches everywhere.
          deletedIds: [
            ...data.deletedStudentIds.map(id => ({ id, type: "student", deletedAt: new Date().toISOString() })),
            ...data.deletedTeacherIds.map(id => ({ id, type: "teacher", deletedAt: new Date().toISOString() })),
            ...data.deletedRewardIds.map(id => ({ id, type: "reward", deletedAt: new Date().toISOString() })),
          ],
        }),
      });
      let pushed = null;
      try { pushed = await pushRes.json(); } catch (e) { pushed = null; }
      if (!pushed || pushed.ok === false) return { ok: false, reason: (pushed && pushed.error) || "push-failed" };
      // An older script ignores `renames`; keep them until one confirms.
      if (pushed.renamed !== undefined) { try { localStorage.removeItem(PENDING_RENAMES_KEY); } catch (e) {} }
      return { ok: true, at: new Date().toISOString() };
    } catch (e) {
      return { ok: false, reason: e && e.name === "AbortError" ? "timeout" : "network", error: e && e.message };
    }
  }

  // Student-side write path: send only the fields a student may change on
  // their OWN row (avatar, read flags, deletion answer, redemptions). The
  // script merges them into that single row -- see pushStudentPatch_ in
  // the Apps Script. Returns the merged row so the caller can refresh.
  async function pushStudentPatch(studentId) {
    const cfg = getSyncConfig();
    if (!cfg.enabled || !cfg.url) return { ok: false, reason: "not-configured" };
    const data = load();
    const s = data.students.find(x => x.id === studentId);
    if (!s) return { ok: false, reason: "not-found" };
    const patch = {
      id: s.id,
      avatar: s.avatar || "",
      messages: (Array.isArray(s.messages) ? s.messages : []).map(m => ({ id: m.id, type: m.type, text: m.text, meta: m.meta || null, date: m.date, read: !!m.read })),
      pendingDeletion: !!s.pendingDeletion,
      deletionConfirmed: !!s.deletionConfirmed,
      redemptions: Array.isArray(s.redemptions) ? s.redemptions : [],
    };
    try {
      const res = await fetchWithTimeout(cfg.url + "?key=" + LUMIO_API_KEY + "&action=pushStudentPatch" + authQuery(), {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ patch }),
      });
      const out = await res.json();
      if (out && out.ok && out.student) {
        // Adopt the Sheet's view of points/sessions right away so the
        // student never sees a number the teacher side will later undo.
        parseSyncedStudent(out.student);
        const fresh = load();
        const mine = fresh.students.find(x => x.id === studentId);
        if (mine) {
          const sft = ftOf(out.student), mft = ftOf(mine);
          ["rewardPoints", "bonusHours", "sessionsRemaining", "redemptions", "messages", "pendingDeletion", "deletionConfirmed", "avatar"].forEach(k => {
            if (out.student[k] === undefined) return;
            mine[k] = out.student[k];
            if (tms(sft[k]) > tms(mft[k])) mft[k] = sft[k];
          });
          if (!mft._base) mft._base = sft._base || mine.updatedAt || "";
          mine.fieldTimes = mft;
          if (tms(out.student.updatedAt) > tms(mine.updatedAt)) mine.updatedAt = out.student.updatedAt;
          ["rewardPoints", "bonusHours", "sessionsRemaining"].forEach(k => { mine[k] = Number(mine[k]) || 0; });
          save(fresh, { noStamp: true }); // the Sheet's values, not a new edit
        }
      }
      // Offline / refused: remember it and send again on the next page
      // load or when the connection comes back (see retryPendingPatches).
      // A student the Sheet no longer has is not worth retrying.
      markPatchPending(studentId, !(out && out.ok) && !(out && /not found|deleted/i.test(out.error || "")));
      return out || { ok: false };
    } catch (e) {
      markPatchPending(studentId, true);
      return { ok: false, reason: e && e.name === "AbortError" ? "timeout" : "network", error: e && e.message };
    }
  }
  // ---- offline retry for a student's own changes (3 Oct 2026) ----
  // pushStudentPatch_ on the script is idempotent (avatar replaced,
  // messages unioned, a redemption counted once by its date), so sending
  // the same patch twice is harmless.
  const PENDING_PATCH_KEY = "lumio_pending_student_patch";
  function pendingPatchIds() {
    try { const a = JSON.parse(safeGet(PENDING_PATCH_KEY) || "[]"); return Array.isArray(a) ? a : []; } catch (e) { return []; }
  }
  function markPatchPending(id, pending) {
    const ids = pendingPatchIds().filter(x => x !== id);
    if (pending) ids.push(id);
    if (ids.length) safeSet(PENDING_PATCH_KEY, JSON.stringify(ids));
    else { try { localStorage.removeItem(PENDING_PATCH_KEY); } catch (e) { delete memory[PENDING_PATCH_KEY]; } }
  }
  let retryingPatches = false;
  async function retryPendingPatches() {
    if (retryingPatches) return { ok: true, retried: 0 };
    const ids = pendingPatchIds();
    if (!ids.length) return { ok: true, retried: 0 };
    retryingPatches = true;
    let done = 0;
    try {
      for (const id of ids) {
        if (!load().students.some(s => s.id === id)) { markPatchPending(id, false); continue; }
        const r = await pushStudentPatch(id);
        if (r && r.ok) done++;
      }
    } finally { retryingPatches = false; }
    return { ok: pendingPatchIds().length === 0, retried: done };
  }
  if (typeof window !== "undefined" && window.addEventListener) {
    window.addEventListener("online", () => { retryPendingPatches().catch(() => {}); });
    // Shortly after the page settles, so it never competes with the
    // page's own first sync.
    setTimeout(() => { retryPendingPatches().catch(() => {}); }, 2500);
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
    setInstallments, buildInstallmentPlan, markInstallmentPaid, installmentBalanceDelta, installmentsDue, sendDueInstallmentReminders, installmentSummary, installmentMessage, fmtMoney, INSTALLMENT_REMIND_DAYS,
    addReferral, updateReferralStatus, removeReferral, listReferrals, referralStats,
    canRefer, referrerBlockReason, listAllReferrals, findReferralByLinked, autoReferralStatus, syncReferrals, referrableStudents, REFERRAL_STATUSES, REFERRAL_REWARD_SESSIONS,
    verifyStudentLogin, randomPin,
    listTeachers, getTeacher, findTeacherByName,
    addTeacher, updateTeacher, removeTeacher, verifyTeacherLogin, ensureDefaultTeacher,
    getCurrentTeacherId, setCurrentTeacherId, getCurrentTeacher, clearCurrentTeacher, isCurrentTeacherOwner,
    getTeacherName, setTeacherName,
    getSyncConfig, configureSync, syncNow, pushStudentPatch, retryPendingPatches, serverMissingFields,
    authQuery, serverCaps, postAction, getTeacherAuth, getStudentAuth, setTeacherAuth, clearTeacherAuth, clearStudentAuth, hashPin,
  };
})(window);
