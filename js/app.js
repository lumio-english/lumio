/* ============================================================
   LUMIO ENGLISH — shared utilities (storage, auth, audio, UI)
   v1 uses localStorage. See README for the Google Sheets
   backend upgrade path (same pattern as your 51Talk stack).
   ============================================================ */

const Lumio = (() => {

  /* ---------- Levels ---------- */
  // Names match the branded curriculum used everywhere else on the site
  // (manuals, Curriculum Guide, landing page, Hub) -- these previously
  // used an older, pre-rebrand naming ("Level 4 · On My Own" instead of
  // "Level 4 · Smart Choices", etc.) that six of seven live levels had
  // drifted from, surfaced when the placement-test results screen and
  // its new trial popup showed two different names for the same level
  // side by side. This is the single shared source every page listed
  // above reads from, so fixing it here fixes all of them at once.
  const LEVELS = [
    { id: "pre-a",  name: "Pre-A · First Words",         lessons: 20 },
    { id: "level1", name: "Level 1 · About Me",          lessons: 20 },
    { id: "level2", name: "Level 2 · My World",          lessons: 20 },
    { id: "level3", name: "Level 3 · Everyday Life",     lessons: 20 },
    { id: "level4", name: "Level 4 · Smart Choices",     lessons: 20 },
    { id: "level5", name: "Level 5 · Telling My Story",  lessons: 20 },
    { id: "level6", name: "Level 6 · Looking Ahead",     lessons: 20 },
    { id: "level7", name: "Level 7 · Wide World",        lessons: 20 },
    { id: "level8", name: "Level 8 · Think & Talk",      lessons: 20 },
    { id: "level9", name: "Level 9 · Express Yourself",  lessons: 20 },
    { id: "level10", name: "Level 10 · Ready for the World", lessons: 20 },
  ];
  // Levels with lesson JSON files actually available in /lessons/
  const AVAILABLE_LEVELS = ["pre-a", "level1", "level2", "level3", "level4", "level5", "level6"];

  /* ---------- Storage ---------- */
  const get = (k, d = null) => {
    try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; }
    catch { return d; }
  };
  const set = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  /* ---------- Auth (simple v1) ---------- */
  const login = (name, level) => set("lumio_user", { name: name.trim(), level, t: Date.now() });
  const user = () => get("lumio_user");
  const logout = () => {
    ["lumio_user", "lumio_student_id", "lumio_student_auth"].forEach(k => { try { localStorage.removeItem(k); } catch (e) {} });
    location.href = "login.html";
  };
  const requireUser = () => {
    const u = user();
    if (!u) location.href = "login.html";
    return u;
  };

  /* ---------- Level proficiency test ----------
     lumio_level_tests = { studentName: { levelId: {score, total, pct, band, date, attempts} } }
     Taken once every lesson of a level is done (prep + class + homework);
     the best attempt is kept. The certificate requires a passed test. */
  const TEST_PASS_PCT = 70;
  const testBand = (pct) => pct >= 90 ? "Distinction" : pct >= 80 ? "Merit" : pct >= TEST_PASS_PCT ? "Pass" : "Not yet";
  const levelTestsAll = () => get("lumio_level_tests", {});
  const levelTestFor = (name, levelId) => (levelTestsAll()[name] || {})[levelId] || null;
  const saveLevelTest = (name, levelId, score, total) => {
    const all = levelTestsAll();
    all[name] = all[name] || {};
    const prev = all[name][levelId];
    const pct = total ? Math.round((score / total) * 100) : 0;
    const rec = { score, total, pct, band: testBand(pct), date: new Date().toISOString().slice(0, 10), attempts: (prev ? prev.attempts || 1 : 0) + 1 };
    if (!prev || pct >= (prev.pct || 0)) { all[name][levelId] = rec; }
    else { all[name][levelId] = Object.assign({}, prev, { attempts: rec.attempts, lastPct: pct }); }
    set("lumio_level_tests", all);
    pushExtras(name).catch(() => {});   // best-effort; certificate gate on other devices + teacher
    return all[name][levelId];
  };

  /* ---------- Progress ----------
     lumio_progress = { studentName: { levelId: { lessonNum: {stars, score, total, date} } } } */
  const progressAll = () => get("lumio_progress", {});
  const progressFor = (name) => progressAll()[name] || {};
  const saveResult = (name, levelId, lessonNum, stars, score, total) => {
    const all = progressAll();
    all[name] = all[name] || {};
    all[name][levelId] = all[name][levelId] || {};
    const prev = all[name][levelId][lessonNum];
    // A malformed earlier record (non-numeric stars) must never block a
    // real result from saving.
    if (!prev || Number(stars) >= (Number.isFinite(Number(prev.stars)) ? Number(prev.stars) : -1)) {
      all[name][levelId][lessonNum] = { stars, score, total, date: tzNow().date }; // Riyadh calendar day
    }
    set("lumio_progress", all);
    pushProgressAndHomework(name).catch(() => {}); // best-effort, never blocks the lesson
  };

  /* ---------- Homework (interactive) ----------
     lumio_homework = { studentName: { levelId: { lessonNum: {stars, score, total, said, saidTotal, hasDrawing, drawingDataUrl, date} } } } */
  const homeworkAll = () => get("lumio_homework", {});
  const homeworkFor = (name) => homeworkAll()[name] || {};
  const saveHomework = (name, levelId, lessonNum, record) => {
    const all = homeworkAll();
    all[name] = all[name] || {};
    all[name][levelId] = all[name][levelId] || {};
    all[name][levelId][lessonNum] = record;
    set("lumio_homework", all);
    pushProgressAndHomework(name).catch(() => {});
  };

  /* ---------- Progress + homework sync (Sheet) ----------
     Until 1 Oct 2026 lesson progress and homework lived ONLY in the
     browser they were done in: the teacher dashboard, reports and the
     homework gate were blind to anything a student did on their own
     phone, and a new phone started the child back at Lesson 1. Now every
     saveResult/saveHomework also pushes that student's records to the
     Sheet (merged there by student+level+lesson, best result wins) and
     the dashboards pull before rendering. Drawings (data URLs) stay local.
     Same URL + key as js/lumio-profiles.js -- keep all copies identical. */
  const SYNC_URL = "https://script.google.com/macros/s/AKfycbxlKY07coAR_Uj6UQf2bvy6yi6I3cG9WsnTROvKI5v_l9MhhXIbP3Ke8jxbYx5btZzAGA/exec";
  const LUMIO_API_KEY = "504bc50951590970a9faf630";
  const syncUrl = () => {
    try { const c = window.LumioProfiles && LumioProfiles.getSyncConfig(); if (c && c.url) return c.url; } catch (e) {}
    // Pages that don't load lumio-profiles.js (homework.html, lesson.html)
    // still honour a saved Sync Settings URL.
    try { const c = JSON.parse(localStorage.getItem("lumio_sync_cfg_v1") || "null"); if (c && c.url) return c.url; } catch (e) {}
    return SYNC_URL;
  };
  // Same sign-in the profiles module sends (LumioProfiles.authQuery), read
  // straight from storage when that module isn't on the page: homework.html
  // and lesson.html pushed with no credentials, which the script refuses,
  // so homework done there never reached the Sheet.
  const authQuery = () => {
    if (window.LumioProfiles && LumioProfiles.authQuery) return LumioProfiles.authQuery();
    const pairs = [["lumio_teacher_auth", "tid", "th"], ["lumio_student_auth", "sid", "sh"]];
    for (const [k, a, b] of pairs) {
      try {
        const v = JSON.parse(localStorage.getItem(k) || "null");
        if (v && v.id && v.pinHash) return `&${a}=${encodeURIComponent(v.id)}&${b}=${encodeURIComponent(v.pinHash)}`;
      } catch (e) {}
    }
    return "";
  };
  const syncFetch = (action, body) => {
    const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 20000);
    // authQuery: who this device is -- the script only accepts a student's
    // own records from a student device (see js/lumio-profiles.js).
    const auth = authQuery();
    return fetch(`${syncUrl()}?key=${LUMIO_API_KEY}&action=${action}${auth}`, body
      ? { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(body), signal: ctrl.signal }
      : { signal: ctrl.signal }).finally(() => clearTimeout(t)).then(r => r.json())
      .then(j => { if (j && j.ok === false) throw new Error(j.error || "refused"); return j; });
  };
  const stripDrawing = (rec) => { const r = Object.assign({}, rec); delete r.drawingDataUrl; return r; };
  // Homework record fields beyond stars/score/said that travel through the
  // Sheet's Homework tab (HOMEWORK_COLUMNS in the Apps Script).
  const HW_EXTRA_FIELDS = ["skillType", "skillCorrect", "skillTotal", "quizCorrect", "quizTotal",
    "spellingCorrect", "spellingTotal", "recorded", "recordedTotal"];
  // Push one student's progress + homework (or everyone's when name is null).
  const pushProgressAndHomework = async (name) => {
    const pick = (all) => name ? (all[name] ? { [name]: all[name] } : {}) : all;
    const hw = {};
    Object.entries(pick(homeworkAll())).forEach(([n, levels]) => {
      hw[n] = {};
      Object.entries(levels).forEach(([lv, lessons]) => { hw[n][lv] = {}; Object.entries(lessons).forEach(([k, r]) => { hw[n][lv][k] = stripDrawing(r); }); });
    });
    try {
      await syncFetch("pushProgress", { progress: pick(progressAll()) });
      await syncFetch("pushHomework", { homework: hw });
      markPushPending(name, false);
      return { ok: true };
    } catch (e) {
      // Offline or refused: remember who still needs pushing and try again
      // on the next page load / when the connection returns. The Sheet
      // merges by student+level+lesson (best result wins), so a repeat
      // push is harmless.
      markPushPending(name, true);
      return { ok: false, error: e && e.message };
    }
  };
  const PENDING_PUSH_KEY = "lumio_pending_progress_push";
  const pendingPush = () => get(PENDING_PUSH_KEY, null) || { all: false, names: [] };
  const markPushPending = (name, pending) => {
    try {
      const p = pendingPush();
      if (name === null || name === undefined) p.all = !!pending;
      if (name) p.names = (p.names || []).filter(n => n !== name);
      if (pending && name) p.names.push(name);
      if (!pending && (name === null || name === undefined)) p.names = []; // an everyone-push covers each name
      if (!p.all && !(p.names || []).length) localStorage.removeItem(PENDING_PUSH_KEY);
      else set(PENDING_PUSH_KEY, p);
    } catch (e) {}
  };
  let retryingPush = false;
  const retryPendingPush = async () => {
    const p = pendingPush();
    if (retryingPush || (!p.all && !(p.names || []).length)) return { ok: true, retried: 0 };
    if (!authQuery()) return { ok: false, reason: "signed-out" }; // the script would refuse it anyway
    retryingPush = true;
    try {
      if (p.all) return await pushProgressAndHomework(null);
      let ok = true;
      for (const n of p.names) { const r = await pushProgressAndHomework(n); ok = ok && r.ok; }
      return { ok };
    } finally { retryingPush = false; }
  };
  if (typeof window !== "undefined" && window.addEventListener) {
    window.addEventListener("online", () => { retryPendingPush().catch(() => {}); });
    // After the page (and lumio-profiles.js, if it loads) has settled.
    window.addEventListener("load", () => setTimeout(() => { retryPendingPush().catch(() => {}); }, 2000));
  }
  // Pull everyone's (or one student's) records and merge: higher stars win,
  // then the newer date. Returns how many local records changed.
  const pullProgressAndHomework = async (name) => {
    let changed = 0;
    try {
      const [p, h] = await Promise.all([syncFetch("pullProgress"), syncFetch("pullHomework")]);
      const prog = progressAll();
      (p && p.rows || []).forEach(row => {
        if (!row.studentName || !row.level || row.lesson === "" || row.lesson === undefined) return;
        if (name && row.studentName !== name) return;
        prog[row.studentName] = prog[row.studentName] || {}; prog[row.studentName][row.level] = prog[row.studentName][row.level] || {};
        const prev = prog[row.studentName][row.level][row.lesson];
        const inc = { stars: Number(row.stars) || 0, score: Number(row.score) || 0, total: Number(row.total) || 0, date: String(row.date || "") };
        const prevStars = prev && Number.isFinite(Number(prev.stars)) ? Number(prev.stars) : -1;
        if (!prev || inc.stars > prevStars || (inc.stars === prevStars && inc.date > String(prev.date || ""))) { prog[row.studentName][row.level][row.lesson] = inc; changed++; }
      });
      set("lumio_progress", prog);
      const hw = homeworkAll();
      (h && h.rows || []).forEach(row => {
        if (!row.studentName || !row.level || row.lesson === "" || row.lesson === undefined) return;
        if (name && row.studentName !== name) return;
        hw[row.studentName] = hw[row.studentName] || {}; hw[row.studentName][row.level] = hw[row.studentName][row.level] || {};
        const prev = hw[row.studentName][row.level][row.lesson];
        const inc = { stars: Number(row.stars) || 0, score: Number(row.score) || 0, total: Number(row.total) || 0, said: Number(row.said) || 0, saidTotal: Number(row.saidTotal) || 0, hasDrawing: String(row.hasDrawing) === "true" || row.hasDrawing === true, date: String(row.date || "") };
        // The per-skill breakdown report.html reads (Reading = quiz, Writing
        // = spelling) and the skill/recording counts. Only taken when the
        // Sheet actually has them: rows from before these columns existed
        // must not turn a real local value into 0.
        HW_EXTRA_FIELDS.forEach(k => {
          const v = row[k];
          if (v === undefined || v === null || v === "") return;
          inc[k] = k === "skillType" ? String(v) : (Number(v) || 0);
        });
        const prevStars = prev && Number.isFinite(Number(prev.stars)) ? Number(prev.stars) : -1;
        if (!prev || inc.stars > prevStars || (inc.stars === prevStars && inc.date > String(prev.date || ""))) {
          hw[row.studentName][row.level][row.lesson] = Object.assign({}, prev || {}, inc); changed++;
        } else if (HW_EXTRA_FIELDS.some(k => inc[k] !== undefined && prev[k] === undefined) && inc.stars === prevStars && inc.date === String(prev.date || "")) {
          // Same result, but this device's copy predates the breakdown.
          HW_EXTRA_FIELDS.forEach(k => { if (inc[k] !== undefined && prev[k] === undefined) prev[k] = inc[k]; });
          changed++;
        }
      });
      set("lumio_homework", hw);
      return { ok: true, changed };
    } catch (e) { return { ok: false, changed, error: e && e.message }; }
  };

  /* ---------- Story parts, level tests, word-game bests: synced (Oct 2026) ----------
     lumio_story     = { studentName: { levelId: { part: "YYYY-MM-DD" } } }
     lumio_game_best = { studentName: { levelId: { lessonNum: { game: {stars, score, total, date} } } } }
     lumio_level_tests (above). All three travel through the Sheet's
     StudentExtras tab (pushExtras/pullExtras, Apps Script v12), merged
     best-wins there and here, so another phone and the teacher see them.
     The story used to be one unkeyed device value (lumio_story_progress):
     a sibling on the same tablet inherited it and it never left the device. */
  const STORY_KEY = "lumio_story", OLD_STORY_KEY = "lumio_story_progress", GAME_KEY = "lumio_game_best";
  const storyAll = () => get(STORY_KEY, {}) || {};
  const gameBestAll = () => get(GAME_KEY, {}) || {};
  const gameBestFor = (name) => gameBestAll()[name] || {};
  // One-time move of the old device-wide story value. It can only be
  // attributed safely when this device has never held another student's
  // work; otherwise nobody can tell whose reading it was, so it is dropped
  // (the parts are quick to re-read; a sibling must never get a free tick).
  const migrateOldStory = () => {
    let raw = null;
    try { raw = localStorage.getItem(OLD_STORY_KEY); } catch (e) { return; }
    if (raw === null) return;
    const u = user();
    if (!u || !u.name || isTeacherSession()) return;   // wait for a real student sign-in on this device
    const others = new Set();
    [progressAll(), homeworkAll(), levelTestsAll(), gameBestAll(), storyAll()].forEach(t => Object.keys(t || {}).forEach(n => { if (n !== u.name) others.add(n); }));
    if (!others.size) {
      let old = {}; try { old = JSON.parse(raw) || {}; } catch (e) {}
      const all = storyAll(); const mine = all[u.name] = all[u.name] || {};
      Object.entries(old).forEach(([lv, parts]) => Object.entries(parts || {}).forEach(([p, v]) => {
        if (v) { mine[lv] = mine[lv] || {}; if (!mine[lv][p]) mine[lv][p] = typeof v === "string" ? v : true; }
      }));
      set(STORY_KEY, all);
      markExtrasPending(u.name, true);
      setTimeout(() => { pushExtras(u.name).catch(() => {}); }, 0);
    }
    try { localStorage.removeItem(OLD_STORY_KEY); } catch (e) {}
  };
  const storyProgressFor = (name) => { migrateOldStory(); return (storyAll()[name] || {}); };
  const saveStoryPart = (name, levelId, part) => {
    if (!name) return;
    migrateOldStory();
    const all = storyAll();
    all[name] = all[name] || {}; all[name][levelId] = all[name][levelId] || {};
    if (!all[name][levelId][part]) all[name][levelId][part] = tzNow().date;
    set(STORY_KEY, all);
    pushExtras(name).catch(() => {});
  };
  // Best score per game per lesson (never touches the lesson's prep result).
  const gameBetter = (inc, prev) => {
    if (!prev) return true;
    const n = v => Number.isFinite(Number(v)) ? Number(v) : -1;
    if (n(inc.stars) !== n(prev.stars)) return n(inc.stars) > n(prev.stars);
    if (n(inc.score) !== n(prev.score)) return n(inc.score) > n(prev.score);
    return String(inc.date || "") > String(prev.date || "");
  };
  const saveGameBest = (name, levelId, lessonNum, game, rec) => {
    if (!name || !levelId || !lessonNum || !game) return { counted: false };
    const all = gameBestAll();
    all[name] = all[name] || {}; all[name][levelId] = all[name][levelId] || {};
    const lv = all[name][levelId], prev = lv[lessonNum] && lv[lessonNum][game];
    const inc = Object.assign({ date: tzNow().date }, rec);
    if (prev && !gameBetter(Object.assign({}, inc, { date: "" }), prev)) return { counted: false, reason: "not-better", lessonNum };
    lv[lessonNum] = Object.assign({}, lv[lessonNum], { [game]: inc });
    try { set(GAME_KEY, all); } catch (e) { return { counted: false, reason: "storage-failed" }; }
    pushExtras(name).catch(() => {});
    return { counted: true, first: !prev, lessonNum };
  };
  const GAME_NAMES = { "memory-match": "Memory Match", "word-pop": "Word Pop", "word-builder": "Word Builder", "balloon-pop": "Balloon Pop" };

  // Old deployments don't know pushExtras/pullExtras (a student call would
  // even read as "unauthorized"), so ask ?action=version once per tab and
  // stay quiet until v12 is live; pushes wait in a pending list meanwhile.
  let extrasCapsP = null;
  const extrasSupported = () => {
    try { const c = sessionStorage.getItem("lumio_srv_extras"); if (c === "1") return Promise.resolve(true); } catch (e) {}
    if (!extrasCapsP) {
      extrasCapsP = syncFetch("version").then(j => {
        const ok = !!(j && j.extras);
        if (ok) { try { sessionStorage.setItem("lumio_srv_extras", "1"); } catch (e) {} }
        return ok;
      }).catch(() => false).finally(() => { setTimeout(() => { extrasCapsP = null; }, 60000); });
    }
    return extrasCapsP;
  };
  const EXTRAS_PENDING_KEY = "lumio_pending_extras_push";
  const markExtrasPending = (name, pending) => {
    try {
      const p = get(EXTRAS_PENDING_KEY, null) || { all: false, names: [] };
      if (name === null || name === undefined) { p.all = !!pending; if (!pending) p.names = []; }
      else { p.names = (p.names || []).filter(n => n !== name); if (pending) p.names.push(name); }
      if (!p.all && !p.names.length) localStorage.removeItem(EXTRAS_PENDING_KEY); else set(EXTRAS_PENDING_KEY, p);
    } catch (e) {}
  };
  const extrasTree = (name) => {
    const names = new Set();
    const st = storyAll(), lt = levelTestsAll(), gb = gameBestAll();
    if (name) names.add(name); else [st, lt, gb].forEach(t => Object.keys(t).forEach(n => names.add(n)));
    const out = {};
    names.forEach(n => {
      const rec = {};
      if (st[n]) rec.story = st[n];
      if (lt[n]) rec.levelTest = lt[n];
      if (gb[n]) rec.games = gb[n];
      if (Object.keys(rec).length) out[n] = rec;
    });
    return out;
  };
  const pushExtras = async (name) => {
    const extras = extrasTree(name);
    if (!Object.keys(extras).length) { markExtrasPending(name, false); return { ok: true, empty: true }; }
    if (!authQuery() || !(await extrasSupported())) { markExtrasPending(name, true); return { ok: false, reason: "unsupported" }; }
    try {
      await syncFetch("pushExtras", { extras });
      markExtrasPending(name, false);
      return { ok: true };
    } catch (e) { markExtrasPending(name, true); return { ok: false, error: e && e.message }; }
  };
  const retryExtrasPush = async () => {
    const p = get(EXTRAS_PENDING_KEY, null);
    if (!p || (!p.all && !(p.names || []).length)) return { ok: true };
    if (p.all) return pushExtras(null);
    let ok = true;
    for (const n of p.names) { const r = await pushExtras(n); ok = ok && r.ok; }
    return { ok };
  };
  const pullExtras = async (name) => {
    let changed = 0;
    try {
      if (name) migrateOldStory();
      if (!(await extrasSupported())) return { ok: false, changed, reason: "unsupported" };
      const j = await syncFetch("pullExtras");
      const st = storyAll(), lt = levelTestsAll(), gb = gameBestAll();
      const num = v => (v === "" || v === null || v === undefined || !Number.isFinite(Number(v))) ? undefined : Number(v);
      (j && j.rows || []).forEach(r => {
        const n = r.studentName, lv = r.level;
        if (!n || !lv || (name && n !== name)) return;
        if (r.kind === "story") {
          const part = String(r.item || "");
          if (!part) return;
          st[n] = st[n] || {}; st[n][lv] = st[n][lv] || {};
          if (!st[n][lv][part]) { st[n][lv][part] = String(r.date || "") || true; changed++; }
        } else if (r.kind === "levelTest") {
          const inc = { score: num(r.score) || 0, total: num(r.total) || 0, pct: num(r.pct) || 0, band: String(r.band || "") || testBand(num(r.pct) || 0), date: String(r.date || ""), attempts: num(r.attempts) || 1 };
          lt[n] = lt[n] || {};
          const prev = lt[n][lv];
          if (!prev || inc.pct > (Number(prev.pct) || 0) || (inc.pct === (Number(prev.pct) || 0) && inc.date > String(prev.date || ""))) {
            lt[n][lv] = Object.assign({}, inc, { attempts: Math.max(inc.attempts, (prev && prev.attempts) || 0) }); changed++;
          } else if (inc.attempts > (prev.attempts || 0)) { prev.attempts = inc.attempts; changed++; }
        } else if (r.kind === "game") {
          const m = /^(\d+):([a-z0-9-]+)$/.exec(String(r.item || ""));
          if (!m) return;
          const inc = { stars: num(r.stars) || 0, score: num(r.score) || 0, date: String(r.date || "") };
          if (num(r.total) !== undefined) inc.total = num(r.total);
          gb[n] = gb[n] || {}; gb[n][lv] = gb[n][lv] || {}; gb[n][lv][m[1]] = gb[n][lv][m[1]] || {};
          const prev = gb[n][lv][m[1]][m[2]];
          if (gameBetter(inc, prev)) { gb[n][lv][m[1]][m[2]] = inc; changed++; }
        }
      });
      if (changed) { set(STORY_KEY, st); set("lumio_level_tests", lt); set(GAME_KEY, gb); }
      return { ok: true, changed };
    } catch (e) { return { ok: false, changed, error: e && e.message }; }
  };
  if (typeof window !== "undefined" && window.addEventListener) {
    window.addEventListener("online", () => { retryExtrasPush().catch(() => {}); });
    window.addEventListener("load", () => setTimeout(() => { retryExtrasPush().catch(() => {}); }, 2500));
  }

  /* ---------- The ONE "lesson done" rule ----------
     A lesson is done when its prep is finished, its live class was
     attended AND its homework is submitted -- in order. `current(name,
     level)` is the first lesson that is not fully done; everything after
     it is locked. The adventure map, lesson.html, homework.html,
     story.html, certificates.html and the teacher table all use these,
     so "8/10 lessons" means the same thing everywhere.
     attendedSet: a Set of lesson numbers with a "present" mark (from
     LumioSchedule.attendedLessonNumbers). Pages that do not load the
     schedule pass null, which counts attendance as unknown = not done. */
  const lessonCountFor = (levelId) => { const l = LEVELS.find(x => x.id === levelId); return l ? l.lessons : 20; };
  const attendedSetFor = (name, levelId) => {
    try { return (window.LumioSchedule && LumioSchedule.attendedLessonNumbers) ? LumioSchedule.attendedLessonNumbers(name, levelId) : null; } catch (e) { return null; }
  };
  const lessonDone = (name, levelId, n, attendedSet) => {
    const prep = (progressFor(name)[levelId] || {})[n];
    const hw = (homeworkFor(name)[levelId] || {})[n];
    const att = attendedSet === undefined ? attendedSetFor(name, levelId) : attendedSet;
    return !!prep && !!hw && !!(att && att.has(Number(n)));
  };
  // First lesson not fully done (N+1 when the level is finished).
  const currentLesson = (name, levelId, attendedSet) => {
    const N = lessonCountFor(levelId);
    const att = attendedSet === undefined ? attendedSetFor(name, levelId) : attendedSet;
    for (let n = 1; n <= N; n++) if (!lessonDone(name, levelId, n, att)) return n;
    return N + 1;
  };
  const lessonsDoneCount = (name, levelId, attendedSet) => currentLesson(name, levelId, attendedSet) - 1;
  const levelComplete = (name, levelId, attendedSet) => lessonsDoneCount(name, levelId, attendedSet) >= lessonCountFor(levelId);
  // Teacher session on this device? (preview links, presenter, overrides)
  const isTeacherSession = () => { try { return localStorage.getItem("lumio_teacher") === "1"; } catch (e) { return false; } };

  /* ---------- Report send log ----------
     lumio_report_log = { studentName: "YYYY-MM-DD" }  -- the date a
     teacher last generated+copied that student's report on report.html.
     One date per student, not a full history -- all that's needed is
     "when was this last sent" for a due/overdue reminder, not a log of
     every send. */
  const reportLogAll = () => get("lumio_report_log", {});
  const lastReportDateFor = (name) => reportLogAll()[name] || null;
  const logReportSent = (name) => {
    const all = reportLogAll();
    all[name] = tzNow().date;
    set("lumio_report_log", all);
  };

  /* ---------- Voice recordings (homework "Say It") ----------
     IndexedDB, not localStorage -- audio blobs are too large for
     localStorage's ~5-10MB quota. Same-origin, so both homework.html
     (writes) and teacher.html (reads) can access these as long as
     they're opened in the same browser on the same device -- there's
     no server here, so recordings don't sync across devices. */
  const RECORDINGS_DB = "lumio_recordings";
  const RECORDINGS_STORE = "recordings";
  function openRecordingsDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(RECORDINGS_DB, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(RECORDINGS_STORE)) {
          db.createObjectStore(RECORDINGS_STORE, { keyPath: "id" });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  const saveRecording = async (studentName, levelId, lessonNum, wordIndex, wordEn, blob) => {
    const db = await openRecordingsDB();
    const id = `${studentName}__${levelId}__${lessonNum}__${wordIndex}`;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(RECORDINGS_STORE, "readwrite");
      tx.objectStore(RECORDINGS_STORE).put({
        id, studentName, levelId, lessonNum: String(lessonNum), wordIndex, wordEn, blob,
        date: new Date().toISOString(),
      });
      tx.oncomplete = () => resolve(id);
      tx.onerror = () => reject(tx.error);
    });
  };
  const listRecordingsFor = async (studentName, levelId, lessonNum) => {
    const db = await openRecordingsDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(RECORDINGS_STORE, "readonly");
      const req = tx.objectStore(RECORDINGS_STORE).getAll();
      req.onsuccess = () => resolve(req.result.filter(r =>
        r.studentName === studentName && r.levelId === levelId && r.lessonNum === String(lessonNum)));
      req.onerror = () => reject(req.error);
    });
  };
  const listAllRecordings = async () => {
    const db = await openRecordingsDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(RECORDINGS_STORE, "readonly");
      const req = tx.objectStore(RECORDINGS_STORE).getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  };

  /* ---------- Text-to-Speech (clearer voice selection + iOS fixes) ---------- */
  let voice = null;
  const scoreVoice = (v) => {
    let s = 0;
    if (/^en/i.test(v.lang)) s += 10;
    if (/en-US/i.test(v.lang)) s += 3;
    // prefer natural/neural/online voices — they sound far clearer than default robotic ones
    if (/natural|neural|online|premium/i.test(v.name)) s += 12;
    if (/Samantha|Google US English|Google UK English Female|Microsoft (Aria|Jenny|Ana)/i.test(v.name)) s += 8;
    if (v.localService === false) s += 4; // cloud voices are usually higher quality
    if (/Microsoft (David|Mark|Zira)/i.test(v.name)) s += 2; // decent but dated
    return s;
  };
  const pickVoice = () => {
    const vs = speechSynthesis.getVoices().filter(v => v.lang && v.lang.startsWith("en"));
    if (!vs.length) return;
    voice = vs.slice().sort((a, b) => scoreVoice(b) - scoreVoice(a))[0] || null;
  };
  let voicesReady = false;
  if ("speechSynthesis" in window) {
    pickVoice();
    if (voice) voicesReady = true;
    speechSynthesis.onvoiceschanged = () => { pickVoice(); voicesReady = true; };
    // iOS Safari pauses the synth when idle — keep it alive without cutting off active speech
    setInterval(() => {
      if (speechSynthesis.paused && speechSynthesis.speaking) speechSynthesis.resume();
    }, 4000);
  }
  const speakSynth = (text, rate = 0.92) => {
    if (!("speechSynthesis" in window)) return;
    const doSpeak = () => {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      if (voice) u.voice = voice;
      u.lang = "en-US"; u.rate = rate; u.pitch = 1.0; u.volume = 1.0;
      try { speechSynthesis.resume(); } catch (e) {}  // Windows Chrome/Edge: a paused synth swallows speak() silently
      speechSynthesis.speak(u);
    };
    if (voicesReady || !speechSynthesis.getVoices().length) doSpeak();
    else { pickVoice(); doSpeak(); }
  };

  // ---- Real pre-generated audio (assets/audio/) with automatic fallback ----
  // Not every word has a real recording yet — only what's been generated so
  // far for the lessons that exist. slugify() must exactly match the naming
  // used when the files were generated (see _docs/generate-audio.py).
  // NOTE: apostrophes are NOT stripped here (unlike the image slug used by
  // the games and homework.html). The audio generators turn every non-
  // alphanumeric run into "-", so "Don't be angry." is don-t-be-angry.mp3.
  // A previous "cleanup" stripped the apostrophe first, which made every
  // don't / let's / can't / o'clock recording 404 and silently fall back to
  // the browser voice -- the "Treehouse Build / Lumi's Pocket" audio bug.
  const slugify = (text) => String(text).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  // Pages that live in a subfolder (e.g. games/lumis-pocket.html) need
  // "../assets/..." not "assets/...". Rather than hardcode that per-page,
  // work it out from app.js's own <script> tag, which every page already
  // has to get this far — same pattern as the rest of that page's own
  // relative links (../css/style.css etc.), just computed once instead of
  // needing every caller to know its own nesting depth.
  const ASSET_ROOT = (() => {
    const el = document.querySelector('script[src*="js/app.js"]');
    return el ? el.getAttribute("src").replace(/js\/app\.js.*$/, "") : "";
  })();
  // ---- Mobile autoplay unlock ------------------------------------------
  // iOS Safari / Android Chrome (and most in-app browsers) refuse
  // audio.play() -- and speechSynthesis -- until the page has received a
  // real user gesture. Game prompts that auto-play at round start, and
  // the first "Listen" tap on some devices, were therefore silent. Fix:
  //   1. on the FIRST tap/keypress anywhere, play a tiny silent clip on
  //      one shared <audio> element, which marks it as user-activated;
  //   2. reuse that same element for every word (swapping src is allowed
  //      on an already-activated element);
  //   3. if a play() is refused before that first gesture, remember it
  //      and play it automatically on the next tap instead of losing it.
  const SILENT_MP3 = "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjYwLjE2LjEwMAAAAAAAAAAAAAAA//NwwAAAAAAAAAAAAEluZm8AAAAPAAAACAAAA/oAR0dHR0dHR0dHR0dHYmJiYmJiYmJiYmJifHx8fHx8fHx8fHx8fJaWlpaWlpaWlpaWlrGxsbGxsbGxsbGxsbHLy8vLy8vLy8vLy8vl5eXl5eXl5eXl5eXl////////////////AAAAAExhdmM2MC4zMQAAAAAAAAAAAAAAACQC1AAAAAAAAAP6yysejgAAAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NCxKMAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NAxKQAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80LEowAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80DEpAAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsSjAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==";
  let sharedAudio = null, audioUnlocked = false, pendingSpeak = null;
  const unlockAudio = () => {
    if (audioUnlocked) return;
    audioUnlocked = true;
    try {
      sharedAudio = sharedAudio || new Audio();
      sharedAudio.src = SILENT_MP3;
      const pr = sharedAudio.play();
      if (pr && pr.catch) pr.catch(() => {});
    } catch (e) {}
    if ("speechSynthesis" in window) {
      try { const u = new SpeechSynthesisUtterance(" "); u.volume = 0; speechSynthesis.speak(u); speechSynthesis.cancel(); } catch (e) {}
    }
    // a line blocked a moment ago plays now; an older one is dropped (replaying it on some later tap sounded like a repeat)
    if (pendingSpeak) { const t = pendingSpeak; pendingSpeak = null; if (!t.t || Date.now() - t.t < 4000) setTimeout(() => speak(t.text, t.rate), 60); }
  };
  ["pointerdown", "touchstart", "keydown"].forEach(ev => document.addEventListener(ev, unlockAudio, { passive: true, capture: true }));

  let currentAudio = null, speakSeq = 0;
  // Background music (games, story) dips while a word is spoken, so the voice is clear on phone speakers.
  const duckMusic = (on) => { try { if (musicEl && !musicEl.paused) musicEl.volume = on ? .05 : .18; } catch (e) {} };
  const speak = (text, rate = 0.92) => {
    if (text === undefined || text === null || String(text).trim() === "") return;   // e.g. a game calling speak() before its data is ready
    if (currentAudio) { try { currentAudio.pause(); } catch (e) {} currentAudio = null; }
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    const slug = slugify(text);
    if (!slug) { speakSynth(text, rate); return; }
    // Every call gets a number; a timer or error left over from an EARLIER word must never touch the
    // current one (an old watchdog used to pause the new word and read the old one in the device voice:
    // the new line went missing and the old one repeated).
    const my = ++speakSeq;
    const audio = sharedAudio || new Audio();
    sharedAudio = audio;
    audio.src = `${ASSET_ROOT}assets/audio/${slug}.mp3`;
    audio.playbackRate = 1;
    currentAudio = audio;
    duckMusic(true);
    audio.onended = () => { if (my === speakSeq) duckMusic(false); };
    let fellBack = false;
    const fallback = () => { if (fellBack || my !== speakSeq) return; fellBack = true; duckMusic(false); speakSynth(text, rate); };
    // Single assignment (not addEventListener): the shared element lives
    // across calls, so stacked listeners from earlier words would all fire
    // on a later 404 and replay old words through the browser voice.
    audio.onerror = () => { audio.onerror = null; fallback(); };   // 404: no recording -> browser voice
    // Watchdog: some setups accept play() but never actually start (blocked output device / codec). If
    // nothing is buffered after 1.5s, fall back to the browser voice so the word is never silent -- but a
    // file that is still downloading (slow mobile data) gets until 4s before the device voice takes over.
    let watchdog = 0;
    const check = (late) => {
      if (my !== speakSeq || fellBack) return;
      if (audio.readyState >= 2 && !audio.error) return;
      if (!late && !audio.error) { watchdog = setTimeout(() => check(true), 2500); return; }   // still downloading: give it until 4s
      try { audio.pause(); } catch (e) {} audio.onerror = null; fallback();
    };
    watchdog = setTimeout(() => check(false), 1500);
    audio.addEventListener("playing", () => clearTimeout(watchdog), { once: true });
    const playResult = audio.play();
    if (playResult && typeof playResult.catch === "function") {
      playResult.catch(err => {
        if (err && err.name === "AbortError") return;             // src changed mid-play: a newer word took over
        if (my !== speakSeq) return;
        audio.onerror = null;
        if (err && err.name === "NotAllowedError") { pendingSpeak = { text, rate, t: Date.now() }; return; }  // blocked: replay on next tap
        fallback();
      });
    }
  };
  // Warm the browser cache with a recording that is about to be spoken (games call this before a round).
  const preloadSpeech = (text) => {
    const slug = slugify(text || "");
    if (!slug) return;
    try { fetch(`${ASSET_ROOT}assets/audio/${slug}.mp3`).catch(() => {}); } catch (e) {}
  };

  const speakPhonicsSound = (token, rate = 0.92) => {
    if (currentAudio) { try { currentAudio.pause(); } catch (e) {} currentAudio = null; }
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    const slug = slugify(token);
    if (!slug) { speakSynth(token, rate); return; }
    const audio = new Audio(`${ASSET_ROOT}assets/audio/phonics-sound-${slug}.mp3`);
    currentAudio = audio;
    let fellBack = false;
    const fallback = () => { if (fellBack) return; fellBack = true; speakSynth(token, rate); };
    audio.addEventListener("error", fallback);
    const playResult = audio.play();
    if (playResult && typeof playResult.catch === "function") playResult.catch(fallback);
  };

  /* ---------- Sound effects + music (assets/sfx/, from Artlist) ----------
     Every effect is one file in assets/sfx/<name>.mp3 (see _docs/sound-effects-list.md for the list).
     A missing file is simply skipped (beep() then falls back to its built-in tone), so effects can be
     added one at a time. "lumio_sound" = "off" mutes effects and music, never the spoken words. */
  const SFX_VOL = { correct: .55, wrong: .45, star: .55, complete: .6 };
  // Which files are actually in assets/sfx/. Add a name here when its file is added (e.g. "correct",
  // "music-games"), so pages never ask the server for files that aren't there yet.
  const SFX_FILES = ["music-games", "music-story"];
  const sfxCache = {}, sfxMissing = {};
  const soundOn = () => { try { return localStorage.getItem("lumio_sound") !== "off"; } catch (e) { return true; } };
  // which effect files exist: checked once per page (4 tiny requests); until known, beep() uses its tone
  const sfxHave = {};
  Object.keys(SFX_VOL).forEach(n => { sfxHave[n] = SFX_FILES.indexOf(n) !== -1; });
  const sfx = (name, opts) => {
    if (!soundOn() || sfxMissing[name] || !sfxHave[name]) return false;
    try {
      let base = sfxCache[name];
      if (!base) { base = sfxCache[name] = new Audio(`${ASSET_ROOT}assets/sfx/${name}.mp3`); base.preload = "auto"; base.onerror = () => { sfxMissing[name] = true; }; }
      if (base.error) { sfxMissing[name] = true; return false; }
      const a = base.readyState >= 2 ? base.cloneNode() : base;   // clones let the same effect overlap
      a.volume = Math.max(0, Math.min(1, (opts && opts.volume) || SFX_VOL[name] || .5));
      const pr = a.play(); if (pr && pr.catch) pr.catch(() => {});
      return true;
    } catch (e) { return false; }
  };
  // background music for games and stories: starts after the first tap, loops, with a small toggle
  let musicEl = null;
  const music = (track) => {
    if (!track) { if (musicEl) musicEl.pause(); return; }
    if (!soundOn()) return;
    if (!musicEl) { musicEl = new Audio(); musicEl.loop = true; musicEl.volume = .18; }
    if (musicEl.dataset.track !== track) { musicEl.src = `${ASSET_ROOT}assets/sfx/music-${track}.mp3`; musicEl.dataset.track = track; }
    const pr = musicEl.play(); if (pr && pr.catch) pr.catch(() => {});
  };
  const setSound = (on) => {
    try { localStorage.setItem("lumio_sound", on ? "on" : "off"); } catch (e) {}
    if (!on && musicEl) musicEl.pause();
    if (on && musicEl && musicEl.dataset.track) music(musicEl.dataset.track);
    const t = document.getElementById("lumioSoundBtn"); if (t) { t.setAttribute("aria-pressed", String(on)); t.title = on ? "Sounds on (tap to mute)" : "Sounds off (tap to turn on)"; t.textContent = on ? "🔊" : "🔈"; }
  };
  const autoMusic = () => {
    const path = location.pathname;
    const track = /\/games\//.test(path) ? "games" : /story\.html$/.test(path) ? "story" : "";
    if (!track || SFX_FILES.indexOf("music-" + track) === -1) return;   // no music file yet: no toggle, no request
    Promise.resolve({ ok: true }).then(r => {
      if (!r.ok) return;
      const b = document.createElement("button");
      b.id = "lumioSoundBtn"; b.type = "button";
      b.style.cssText = "position:fixed;right:14px;bottom:calc(14px + env(safe-area-inset-bottom,0px));z-index:400;width:46px;height:46px;border-radius:50%;border:1px solid #F1E4DA;background:#fff;box-shadow:0 8px 20px -8px rgba(80,40,10,.4);font-size:20px;cursor:pointer";
      b.onclick = () => setSound(!soundOn());
      document.body.appendChild(b); setSound(soundOn());
      const start = () => { document.removeEventListener("pointerdown", start, true); if (soundOn()) music(track); };
      document.addEventListener("pointerdown", start, true);
    }).catch(() => {});
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", autoMusic); else autoMusic();

  const beep = (good = true) => {
    if (sfx(good ? "correct" : "wrong")) return;
    if (!soundOn()) return;
    try {
      const ctx = beep.ctx || (beep.ctx = new (window.AudioContext || window.webkitAudioContext)());
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = "sine";
      o.frequency.value = good ? 660 : 200;
      g.gain.setValueAtTime(.15, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .3);
      o.start(); o.stop(ctx.currentTime + .3);
      if (good) {
        const o2 = ctx.createOscillator(), g2 = ctx.createGain();
        o2.connect(g2); g2.connect(ctx.destination);
        o2.frequency.value = 880;
        g2.gain.setValueAtTime(.12, ctx.currentTime + .12);
        g2.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .4);
        o2.start(ctx.currentTime + .12); o2.stop(ctx.currentTime + .4);
      }
    } catch { /* audio unsupported */ }
  };

  /* ---------- Confetti ---------- */
  const confetti = (n = 60) => {
    sfx(n >= 70 ? "complete" : "star");   // lesson/homework finished vs. a single good answer
    const colors = ["#FFC53D", "#F97316", "#23B5A3", "#FF6B6B", "#7EC8F2"];
    for (let i = 0; i < n; i++) {
      const el = document.createElement("div");
      const s = 6 + Math.random() * 8;
      el.style.cssText = `position:fixed;z-index:300;top:-20px;left:${Math.random() * 100}vw;
        width:${s}px;height:${s}px;border-radius:${Math.random() > .5 ? "50%" : "2px"};
        background:${colors[i % colors.length]};pointer-events:none;
        transition:transform ${1.6 + Math.random()}s ease-in, opacity 2s;`;
      document.body.appendChild(el);
      requestAnimationFrame(() => {
        el.style.transform = `translateY(${innerHeight + 60}px) rotate(${Math.random() * 720}deg)`;
        el.style.opacity = "0";
      });
      setTimeout(() => el.remove(), 2800);
    }
  };

  /* ---------- Toast ---------- */
  const toast = (msg, ms = 1800) => {
    const t = document.createElement("div");
    t.className = "toast"; t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), ms);
  };

  /* ---------- Helpers ---------- */
  /* ---------- Vocab visual fallback (no emoji): styled initial-letter tile ---------- */
  const TILE_COLORS = ["#F97316", "#0D9488", "#F59E0B", "#8B5CF6", "#EF4444", "#0EA5E9", "#65A30D"];
  const tileColor = (word) => {
    let h = 0; for (const c of word) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return TILE_COLORS[h % TILE_COLORS.length];
  };
  const letterTile = (word) =>
    `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;
       background:${tileColor(word)};color:#fff;font-family:var(--font-display);font-weight:800;
       font-size:clamp(3rem,14vh,7rem)">${word.trim()[0].toUpperCase()}</div>`;

  const shuffle = (arr) => arr.map(v => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(p => p[1]);
  const qs = (k) => new URLSearchParams(location.search).get(k);

  /* ---------- Phone numbers with country code ---------- */
  // Curated for this platform's actual market (Egypt + GCC), not an
  // exhaustive world list — easy to extend if that changes.
  const COUNTRY_CODES = [
    { code: "20", name: "Egypt", flag: "🇪🇬" },
    { code: "966", name: "Saudi Arabia", flag: "🇸🇦" },
    { code: "971", name: "UAE", flag: "🇦🇪" },
    { code: "965", name: "Kuwait", flag: "🇰🇼" },
    { code: "974", name: "Qatar", flag: "🇶🇦" },
    { code: "973", name: "Bahrain", flag: "🇧🇭" },
    { code: "968", name: "Oman", flag: "🇴🇲" },
    { code: "962", name: "Jordan", flag: "🇯🇴" },
    { code: "961", name: "Lebanon", flag: "🇱🇧" },
  ];
  // Combines a country code + locally-typed number into the single
  // digits-only format WhatsApp's wa.me links actually need — country
  // code, no leading zero on the local part, no "+", no spaces. Without
  // this, a plain local number like "01055556666" produces a wa.me link
  // that doesn't resolve to anyone.
  const combinePhone = (countryCode, local) => {
    const digits = String(local || "").replace(/\D/g, "").replace(/^0+/, "");
    if (!digits) return "";
    return String(countryCode || "").replace(/\D/g, "") + digits;
  };
  // Best-effort split of an already-combined phone back into
  // {countryCode, local} for editing — matches the longest known country
  // code prefix. Falls back to Egypt with the whole number as local if
  // nothing matches (e.g. a number saved before this existed).
  const splitPhone = (fullPhone) => {
    const digits = String(fullPhone || "").replace(/\D/g, "");
    const byLongestCode = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);
    for (const c of byLongestCode) {
      if (digits.startsWith(c.code)) return { countryCode: c.code, local: digits.slice(c.code.length) };
    }
    return { countryCode: "20", local: digits };
  };

  /* ---------- Platform time zone ----------
     Every class time on Lumio is Saudi time (Asia/Riyadh, UTC+3, no
     daylight saving). Classes are stored as a plain "YYYY-MM-DD" date
     plus "HH:MM" clock time and those strings MEAN Riyadh wall time,
     whatever device is looking at them. Before this, "18:00" was read on
     each device's own clock, so a teacher in Cairo and a parent in
     Riyadh disagreed by an hour and a laptop set to another zone showed
     the class hours off. Everything that compares "now" with a class
     (today's date, upcoming classes, class started, streak days) goes
     through these helpers. */
  const TZ = "Asia/Riyadh";
  const TZ_LABEL = "Saudi time";
  const TZ_LABEL_AR = "بتوقيت السعودية";
  const TZ_OFFSET_MIN = 180; // Riyadh never changes clocks
  const pad2 = n => String(n).padStart(2, "0");
  // The date/time it is right now on the Riyadh clock.
  const tzNow = (at) => {
    const d = at ? new Date(at) : new Date();
    // Shift the instant by Riyadh's fixed offset and read it with UTC
    // getters: independent of the device zone (and of its DST changes,
    // which made the old local-getter version an hour off around them).
    const r = new Date(d.getTime() + TZ_OFFSET_MIN * 60000);
    return {
      date: `${r.getUTCFullYear()}-${pad2(r.getUTCMonth() + 1)}-${pad2(r.getUTCDate())}`,
      hm: `${pad2(r.getUTCHours())}:${pad2(r.getUTCMinutes())}`,
      dow: r.getUTCDay(),
      minutes: r.getUTCHours() * 60 + r.getUTCMinutes(),
    };
  };
  // The real instant (a Date) for a Riyadh wall-clock date + "HH:MM".
  const tzToDate = (dateStr, hm) => {
    const [y, m, d] = String(dateStr || "").split("-").map(Number);
    const [h, mi] = String(hm || "00:00").split(":").map(Number);
    return new Date(Date.UTC(y, (m || 1) - 1, d || 1, (h || 0) - TZ_OFFSET_MIN / 60, mi || 0));
  };
  // Date arithmetic on "YYYY-MM-DD" strings that never touches UTC.
  const tzAddDays = (dateStr, n) => {
    const [y, m, d] = String(dateStr).split("-").map(Number);
    const r = new Date(Date.UTC(y, m - 1, d + n));
    return `${r.getUTCFullYear()}-${pad2(r.getUTCMonth() + 1)}-${pad2(r.getUTCDate())}`;
  };
  const tzDayOfWeek = (dateStr) => {
    const [y, m, d] = String(dateStr).split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  };
  const deviceTz = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) { return ""; } };
  // Is this device's clock different from Riyadh? With a class date + time
  // the answer is for THAT moment: Egypt keeps Saudi time in summer but
  // falls an hour behind after its clocks change at the end of October, so
  // "same as Riyadh today" must not hide the local time of a November class.
  const deviceDiffersFromTz = (dateStr, hm) => {
    const at = dateStr ? tzToDate(dateStr, hm) : new Date();
    return Math.round(-at.getTimezoneOffset()) !== TZ_OFFSET_MIN;
  };
  // The device's own clock time for a Riyadh class: { hm, sameDay, day }.
  const localClassTime = (dateStr, hm) => {
    const local = tzToDate(dateStr, hm);
    const sameDay = local.getFullYear() === Number(dateStr.slice(0, 4)) && local.getMonth() + 1 === Number(dateStr.slice(5, 7)) && local.getDate() === Number(dateStr.slice(8, 10));
    return { hm: `${pad2(local.getHours())}:${pad2(local.getMinutes())}`, sameDay,
             day: local.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }) };
  };
  const fmt12 = (hm) => {
    const [h, m] = String(hm || "00:00").split(":").map(Number);
    const ap = h >= 12 ? "PM" : "AM";
    return `${((h + 11) % 12) + 1}:${pad2(m)} ${ap}`;
  };
  // "6:00 PM Saudi time" plus, when the device is elsewhere, "(5:00 PM your time)".
  const fmtClassTime = (dateStr, hm, opts) => {
    const o = opts || {};
    let out = fmt12(hm) + " " + (o.ar ? TZ_LABEL_AR : TZ_LABEL);
    if (dateStr && deviceDiffersFromTz(dateStr, hm)) {
      const L = localClassTime(dateStr, hm);
      const dayNote = L.sameDay ? "" : ` on ${L.day}`;
      out += o.ar ? ` (${fmt12(L.hm)} بتوقيتك${dayNote})` : ` (${fmt12(L.hm)} your time${dayNote})`;
    }
    return out;
  };

  return { LEVELS, AVAILABLE_LEVELS, login, user, logout, requireUser,
           progressAll, progressFor, saveResult, homeworkAll, homeworkFor, saveHomework,
           saveRecording, listRecordingsFor, listAllRecordings,
           lastReportDateFor, logReportSent,
           speak, preloadSpeech, speakPhonicsSound, beep, confetti, sfx, music, setSound, soundOn, toast, shuffle, qs, letterTile,
           COUNTRY_CODES, combinePhone, splitPhone,
           pushProgressAndHomework, pullProgressAndHomework, retryPendingPush,
           lessonCountFor, attendedSetFor, lessonDone, currentLesson, lessonsDoneCount, levelComplete, isTeacherSession,
           TEST_PASS_PCT, testBand, levelTestsAll, levelTestFor, saveLevelTest,
           storyProgressFor, saveStoryPart, gameBestAll, gameBestFor, saveGameBest, GAME_NAMES,
           pushExtras, pullExtras, retryExtrasPush,
           TZ, TZ_LABEL, TZ_LABEL_AR, TZ_OFFSET_MIN, tzNow, tzToDate, tzAddDays, tzDayOfWeek,
           deviceTz, deviceDiffersFromTz, localClassTime, fmt12, fmtClassTime };
})();
// Expose for modules that check window.Lumio (lumio-schedule.js, lumio-profiles.js); a top-level `const` is not a window property.
if (typeof window !== "undefined") window.Lumio = Lumio;

