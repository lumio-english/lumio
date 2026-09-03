/* ============================================================
   LUMIO ENGLISH — shared utilities (storage, auth, audio, UI)
   v1 uses localStorage. See README for the Google Sheets
   backend upgrade path (same pattern as your 51Talk stack).
   ============================================================ */

const Lumio = (() => {

  /* ---------- Levels ---------- */
  const LEVELS = [
    { id: "pre-a",  name: "Level 0 · First Words",       lessons: 20 },
    { id: "level1", name: "Level 1 · First Sentences",   lessons: 20 },
    { id: "level2", name: "Level 2 · About Me",          lessons: 20 },
    { id: "level3", name: "Level 3 · Real Life",         lessons: 20 },
    { id: "level4", name: "Level 4 · On My Own",         lessons: 20 },
    { id: "level5", name: "Level 5 · My Story",          lessons: 20 },
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
  const logout = () => { localStorage.removeItem("lumio_user"); location.href = "index.html"; };
  const requireUser = () => {
    const u = user();
    if (!u) location.href = "login.html";
    return u;
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
    if (!prev || stars >= prev.stars) {
      all[name][levelId][lessonNum] = { stars, score, total, date: new Date().toISOString().slice(0, 10) };
    }
    set("lumio_progress", all);
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
  };

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
    all[name] = new Date().toISOString().slice(0, 10);
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
      speechSynthesis.speak(u);
    };
    if (voicesReady || !speechSynthesis.getVoices().length) doSpeak();
    else { pickVoice(); doSpeak(); }
  };

  // ---- Real pre-generated audio (assets/audio/) with automatic fallback ----
  // Not every word has a real recording yet — only what's been generated so
  // far for the lessons that exist. slugify() must exactly match the naming
  // used when the files were generated (see _docs/generate-audio.py).
  const slugify = (text) => String(text).toLowerCase().trim().replace(/'/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
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
  let currentAudio = null;
  const speak = (text, rate = 0.92) => {
    if (currentAudio) { try { currentAudio.pause(); } catch (e) {} currentAudio = null; }
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    const slug = slugify(text);
    if (!slug) { speakSynth(text, rate); return; }
    const audio = new Audio(`${ASSET_ROOT}assets/audio/${slug}.mp3`);
    currentAudio = audio;
    let fellBack = false;
    const fallback = () => { if (fellBack) return; fellBack = true; speakSynth(text, rate); };
    audio.addEventListener("error", fallback);
    const playResult = audio.play();
    if (playResult && typeof playResult.catch === "function") playResult.catch(fallback);
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

  /* ---------- Sounds ---------- */
  const beep = (good = true) => {
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

  return { LEVELS, AVAILABLE_LEVELS, login, user, logout, requireUser,
           progressAll, progressFor, saveResult, homeworkAll, homeworkFor, saveHomework,
           saveRecording, listRecordingsFor, listAllRecordings,
           lastReportDateFor, logReportSent,
           speak, speakPhonicsSound, beep, confetti, toast, shuffle, qs, letterTile,
           COUNTRY_CODES, combinePhone, splitPhone };
})();
