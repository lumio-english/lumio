/* ============================================================
   LUMIO ENGLISH — Universal Lesson Engine
   Loads /lessons/{level}/lesson{NN}.json and runs activities:
   vocab → listen-choose → match → quiz → spell → results
   ============================================================ */

(async () => {
  const user = Lumio.requireUser();
  const level = Lumio.qs("level") || user.level || "pre-a";
  const num = parseInt(Lumio.qs("n") || "1", 10);
  const nn = String(num).padStart(2, "0");

  const stage = document.getElementById("stage");
  const barEl = document.getElementById("bar");
  const crumbs = document.getElementById("crumbs");

  let lesson;
  // 1) embedded bundle (works when opening index.html directly, no server)
  if (window.LUMIO_LESSONS && window.LUMIO_LESSONS[level] && window.LUMIO_LESSONS[level][num]) {
    lesson = window.LUMIO_LESSONS[level][num];
  } else {
    // 2) fallback: fetch the JSON file (works on GitHub Pages / any server)
    try {
      const res = await fetch(`lessons/${level}/lesson${nn}.json`);
      if (!res.ok) throw new Error();
      lesson = await res.json();
    } catch {
      stage.innerHTML = `<div class="card center">
        <h2>Lesson not ready yet</h2>
        <p class="mt">This lesson hasn't been added. Go back and pick another one.</p>
        <a class="btn btn-primary mt" href="student.html">Back to my map</a></div>`;
      return;
    }
  }

  crumbs.textContent = `${lesson.title} · Lesson ${num}`;
  document.title = `${lesson.title} — Lumio English`;

  /* ---------- Build activity queue ---------- */
  const steps = [];
  (lesson.activities || []).forEach(a => steps.push(a));
  let stepIdx = 0;
  let score = 0, total = 0;

  const setBar = () => { barEl.style.width = `${(stepIdx / steps.length) * 100}%`; };

  const next = () => {
    stepIdx++;
    setBar();
    if (stepIdx >= steps.length) return showResults();
    render(steps[stepIdx]);
  };

  const speakBtn = (text, big = false) =>
    `<button class="btn btn-sun ${big ? "btn-big" : ""}" onclick="Lumio.speak('${text.replace(/'/g, "\\'")}')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="vertical-align:-3px;margin-right:6px"><path d="M4 9v6h4l5 5V4L8 9H4z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 010 7M19 6a9 9 0 010 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/></svg>Listen</button>`;

  /* ============================================================
     SHARED — vocab image with letter-tile fallback
     ============================================================ */
  // Vocab images are used throughout lesson.html the same way everywhere:
  // try the real picture first, fall back to a colored letter-tile only if
  // that word genuinely has no image yet. The letter-tile sits behind the
  // <img> so it's visible immediately (no flash of blank space) and as a
  // fallback if the image 404s -- but once the real picture loads, it's
  // explicitly hidden via onload, and the <img> itself gets a white fill
  // so even letterboxed margins (when the picture's aspect ratio doesn't
  // exactly match the box) show white/cream, never the tile's random
  // color peeking through at the edges.
  let vocabImgSeq = 0;
  const vocabImg = (word, boxStyle) => {
    const id = `vi${vocabImgSeq++}`;
    return `<div style="${boxStyle};position:relative;overflow:hidden">
       <div id="${id}" style="position:absolute;inset:0">${Lumio.letterTile(word)}</div>
       <img src="assets/vocab/${word.toLowerCase().replace(/'/g,"").replace(/ /g,"-")}.png" alt="${word}"
            style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;padding:6px;box-sizing:border-box;background:#fff"
            onload="var t=document.getElementById('${id}');if(t)t.style.display='none';"
            onerror="this.remove()">
     </div>`;
  };

  /* ============================================================
     ACTIVITY 1 — VOCAB FLASHCARDS
     ============================================================ */
  function actVocab() {
    let i = 0;
    const words = lesson.vocab;
    const draw = () => {
      const w = words[i];
      stage.innerHTML = `
        <div class="card center">
          <span class="chip chip-orange">New words · ${i + 1}/${words.length}</span>
          ${vocabImg(w.en, "width:min(320px,70vw);height:220px;margin:18px auto;border-radius:20px")}
          <h1 style="font-size:2.6rem">${w.en}</h1>
          <p class="ar" style="font-size:1.5rem;font-weight:800;color:var(--cocoa-soft)">${w.ar}</p>
          ${w.example ? `<p class="mt" style="font-weight:700">"${w.example}"</p>` : ""}
          <div class="row mt" style="justify-content:center">
            ${speakBtn(w.example || w.en, true)}
            <button class="btn btn-primary btn-big" id="nx">${i < words.length - 1 ? "Next →" : "Let's play!"}</button>
          </div>
        </div>`;
      document.getElementById("nx").onclick = () => { i++; i < words.length ? draw() : next(); };
    };
    draw();
  }

  /* ============================================================
     ACTIVITY 2 — LISTEN & CHOOSE  (hear word → tap picture)
     ============================================================ */
  function actListen(a) {
    const rounds = Lumio.shuffle([...lesson.vocab]).slice(0, a.rounds || 5);
    let r = 0;
    const draw = () => {
      const target = rounds[r];
      const opts = Lumio.shuffle([target, ...Lumio.shuffle(lesson.vocab.filter(v => v.en !== target.en)).slice(0, 3)]);
      stage.innerHTML = `
        <div class="card center">
          <span class="chip chip-teal">Listen & tap · ${r + 1}/${rounds.length}</span>
          <h2 class="mt">What do you hear?</h2>
          <div class="mt">${speakBtn(target.en, true)}</div>
          <div class="feature-grid mt" id="opts">
            ${opts.map(o => `<button class="card btn-opt" data-en="${o.en}" style="cursor:pointer;border-width:3px;padding:0;overflow:hidden">
              ${vocabImg(o.en, "height:90px")}
              <div style="font-size:1rem;font-weight:800;padding:8px">${o.en}</div></button>`).join("")}
          </div>
        </div>`;
      document.querySelectorAll(".btn-opt").forEach(b => b.onclick = () => {
        total++;
        if (b.dataset.en === target.en) {
          score++; Lumio.beep(true); b.style.background = "var(--green)"; b.style.color = "#fff";
        } else {
          Lumio.beep(false); b.style.background = "var(--coral)"; b.style.color = "#fff";
          Lumio.speak(target.en);
        }
        document.querySelectorAll(".btn-opt").forEach(x => x.style.pointerEvents = "none");
        setTimeout(() => { r++; r < rounds.length ? draw() : next(); }, 900);
      });
    };
    draw();
  }

  /* ============================================================
     ACTIVITY 3 — MATCH (English ↔ Arabic pairs)
     ============================================================ */
  function actMatch() {
    const pairs = Lumio.shuffle([...lesson.vocab]).slice(0, 5);
    const tiles = Lumio.shuffle([
      ...pairs.map(p => ({ id: p.en, label: p.ar, kind: "ar" })),
      ...pairs.map(p => ({ id: p.en, label: p.en, kind: "en" })),
    ]);
    let sel = null, found = 0;
    stage.innerHTML = `
      <div class="card center">
        <span class="chip chip-orange">Match English &amp; Arabic</span>
        <div class="feature-grid mt" id="grid">
          ${tiles.map((t, i) => `<button class="card tile ${t.kind === "ar" ? "ar" : ""}" data-i="${i}" data-id="${t.id}"
             style="cursor:pointer;font-size:1.25rem;font-weight:800;min-height:90px">${t.label}</button>`).join("")}
        </div>
      </div>`;
    document.querySelectorAll(".tile").forEach(el => el.onclick = () => {
      if (el.classList.contains("ok") || el === sel) return;
      el.style.background = "var(--sun-light)";
      if (!sel) { sel = el; return; }
      total++;
      if (sel.dataset.id === el.dataset.id && sel.dataset.i !== el.dataset.i) {
        score++; found++; Lumio.beep(true); Lumio.speak(el.dataset.id);
        [sel, el].forEach(x => { x.classList.add("ok"); x.style.background = "var(--green)"; x.style.color = "#fff"; x.style.pointerEvents = "none"; });
      } else {
        Lumio.beep(false);
        const a = sel, b = el;
        setTimeout(() => { a.style.background = ""; b.style.background = ""; }, 500);
      }
      sel = null;
      if (found === pairs.length) setTimeout(next, 800);
    });
  }

  /* ============================================================
     ACTIVITY 4 — QUIZ (see picture → pick the word, + custom Qs)
     ============================================================ */
  function actQuiz(a) {
    const auto = Lumio.shuffle([...lesson.vocab]).slice(0, a.rounds || 4).map(v => ({
      prompt: `${vocabImg(v.en, "height:130px;border-radius:18px;max-width:220px;margin:0 auto")}<h2 class="mt">What is this?</h2>`,
      answer: v.en,
      options: Lumio.shuffle([v.en, ...Lumio.shuffle(lesson.vocab.filter(x => x.en !== v.en)).slice(0, 3).map(x => x.en)]),
    }));
    const custom = (a.questions || []).map(q => ({
      prompt: `<h2>${q.q}</h2>`, answer: q.answer, options: Lumio.shuffle([...q.options]),
    }));
    const qsAll = Lumio.shuffle([...auto, ...custom]);
    let r = 0;
    const draw = () => {
      const q = qsAll[r];
      stage.innerHTML = `
        <div class="card center">
          <span class="chip chip-teal">Quiz · ${r + 1}/${qsAll.length}</span>
          <div class="mt">${q.prompt}</div>
          <div class="feature-grid mt">
            ${q.options.map(o => `<button class="card q-opt" data-v="${o}" style="cursor:pointer;font-size:1.2rem;font-weight:800">${o}</button>`).join("")}
          </div>
        </div>`;
      document.querySelectorAll(".q-opt").forEach(b => b.onclick = () => {
        total++;
        const ok = b.dataset.v === q.answer;
        if (ok) { score++; Lumio.beep(true); b.style.background = "var(--green)"; b.style.color = "#fff"; }
        else {
          Lumio.beep(false); b.style.background = "var(--coral)"; b.style.color = "#fff";
          document.querySelectorAll(".q-opt").forEach(x => { if (x.dataset.v === q.answer) { x.style.background = "var(--green)"; x.style.color = "#fff"; } });
        }
        Lumio.speak(q.answer);
        document.querySelectorAll(".q-opt").forEach(x => x.style.pointerEvents = "none");
        setTimeout(() => { r++; r < qsAll.length ? draw() : next(); }, 1000);
      });
    };
    draw();
  }

  /* ============================================================
     ACTIVITY 5 — SPELL (unscramble letters)
     ============================================================ */
  function actSpell(a) {
    const words = Lumio.shuffle(lesson.vocab.filter(v => v.en.length <= 8 && !v.en.includes(" "))).slice(0, a.rounds || 3);
    if (!words.length) return next();
    let r = 0;
    const draw = () => {
      const w = words[r];
      let built = "";
      const letters = Lumio.shuffle(w.en.toLowerCase().split(""));
      const redraw = () => {
        stage.innerHTML = `
          <div class="card center">
            <span class="chip chip-orange">Spell it · ${r + 1}/${words.length}</span>
            ${vocabImg(w.en, "height:110px;border-radius:16px;max-width:200px;margin:12px auto")}
            ${speakBtn(w.en)}
            <div class="mt" style="font-family:var(--font-display);font-size:2.2rem;letter-spacing:6px;min-height:52px;border-bottom:4px dashed var(--cocoa);display:inline-block;padding:0 20px">${built || "&nbsp;"}</div>
            <div class="row mt" style="justify-content:center" id="letters">
              ${letters.map((L, i) => `<button class="btn btn-sun L" data-i="${i}" style="font-size:1.5rem;min-width:56px">${L}</button>`).join("")}
            </div>
            <button class="btn btn-ghost mt" id="reset">↺ Start over</button>
          </div>`;
        document.querySelectorAll(".L").forEach(b => {
          if (usedIdx.has(+b.dataset.i)) b.disabled = true;
          b.onclick = () => {
            usedIdx.add(+b.dataset.i);
            built += b.textContent;
            if (built.length === w.en.length) {
              total++;
              if (built === w.en.toLowerCase()) {
                score++; Lumio.beep(true); Lumio.speak(w.en); Lumio.toast("Great spelling!");
                setTimeout(() => { r++; r < words.length ? draw() : next(); }, 900);
              } else {
                Lumio.beep(false); Lumio.toast("Almost! Try again");
                setTimeout(() => { built = ""; usedIdx.clear(); redraw(); }, 800);
              }
            } else redraw();
          };
        });
        document.getElementById("reset").onclick = () => { built = ""; usedIdx.clear(); redraw(); };
      };
      const usedIdx = new Set();
      redraw();
    };
    draw();
  }

  /* ============================================================
     ACTIVITY 6 — SPEAK IT (record yourself, compare to the native
     speaker, no pass/fail — real pronunciation scoring needs a speech
     API this project doesn't have, so this is deliberately practice-
     only. A round counts once the student actually records something;
     rounds where the mic isn't available/allowed don't count toward
     score at all, so they can't skew the lesson's star rating either
     way.)
     ============================================================ */
  function actSpeak(a) {
    const words = Lumio.shuffle([...lesson.vocab]).slice(0, a.rounds || 3);
    let r = 0;
    const supported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
    let mediaStream = null;
    let recorder = null;
    let chunks = [];
    let recordedUrl = null;
    let roundCounted = false;

    const cleanupStream = () => {
      if (mediaStream) { mediaStream.getTracks().forEach(t => t.stop()); mediaStream = null; }
    };
    const showFallback = (message) => {
      document.getElementById("recordZone").innerHTML = `<p class="mt" style="font-weight:700;color:var(--coral)">${message}</p>`;
      const after = document.getElementById("afterZone");
      after.innerHTML = `<button class="btn btn-primary btn-big" id="spNext">${r < words.length - 1 ? "Next →" : "Let's continue!"}</button>`;
      document.getElementById("spNext").onclick = advance;
    };

    const draw = () => {
      const w = words[r];
      recordedUrl = null;
      roundCounted = false;
      stage.innerHTML = `
        <div class="card center">
          <span class="chip chip-teal">Speak it · ${r + 1}/${words.length}</span>
          ${vocabImg(w.en, "height:110px;border-radius:16px;max-width:200px;margin:12px auto")}
          <h1 style="font-size:2.2rem">${w.en}</h1>
          <p class="ar" style="font-size:1.3rem;font-weight:800;color:var(--cocoa-soft)">${w.ar}</p>
          <div class="row mt" style="justify-content:center">${speakBtn(w.en, true)}</div>
          <div class="mt" id="recordZone"></div>
          <div class="row mt" style="justify-content:center" id="afterZone"></div>
        </div>`;
      if (!supported) {
        showFallback("🎤 We couldn't reach a microphone here — that's okay, just listen and repeat out loud!");
        return;
      }
      document.getElementById("recordZone").innerHTML = `<button class="btn btn-teal btn-big" id="spRecord">🎤 Tap to record</button>`;
      document.getElementById("spRecord").onclick = startRecording;
    };

    async function startRecording() {
      const zone = document.getElementById("recordZone");
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (e) {
        showFallback("🎤 Microphone access wasn't allowed — no problem, just listen and repeat out loud!");
        return;
      }
      chunks = [];
      recorder = new MediaRecorder(mediaStream);
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        // Use whatever format the browser actually recorded in — iOS
        // Safari doesn't support webm at all and records in its own
        // format (typically mp4/aac); hardcoding "audio/webm" here
        // mislabels the file and breaks playback specifically on
        // iPhone, even though the recording itself succeeds fine.
        const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
        recordedUrl = URL.createObjectURL(blob);
        cleanupStream();
        showPlayback();
      };
      recorder.start();
      let secondsLeft = 5;
      const stopBtn = document.createElement("button");
      stopBtn.className = "btn btn-sun btn-big";
      stopBtn.textContent = `⏺ Recording… ${secondsLeft}s (tap to stop)`;
      zone.innerHTML = "";
      zone.appendChild(stopBtn);
      const stopNow = () => { clearInterval(timer); if (recorder.state !== "inactive") recorder.stop(); };
      stopBtn.onclick = stopNow;
      const timer = setInterval(() => {
        secondsLeft--;
        if (secondsLeft <= 0) { stopNow(); return; }
        stopBtn.textContent = `⏺ Recording… ${secondsLeft}s (tap to stop)`;
      }, 1000);
    }

    function showPlayback() {
      const zone = document.getElementById("recordZone");
      zone.innerHTML = `
        <audio id="spPlayback" src="${recordedUrl}"></audio>
        <div class="row" style="justify-content:center">
          <button class="btn btn-sun" id="spPlay">▶ Play my voice</button>
          <button class="btn btn-ghost" id="spRedo">🔁 Record again</button>
        </div>`;
      document.getElementById("spPlay").onclick = () => document.getElementById("spPlayback").play();
      document.getElementById("spRedo").onclick = startRecording;
      if (!roundCounted) { total++; score++; roundCounted = true; }
      const after = document.getElementById("afterZone");
      after.innerHTML = `<button class="btn btn-primary btn-big" id="spNext">${r < words.length - 1 ? "Next →" : "Let's continue!"}</button>`;
      document.getElementById("spNext").onclick = advance;
    }

    function advance() {
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
      r++;
      r < words.length ? draw() : next();
    }

    draw();
  }

  /* ============================================================
     ACTIVITY 7 — SEQUENCE (put the steps in order)
     For routine/process lessons where lesson.vocab is already
     authored in the correct real-world order (e.g. Daily Morning:
     wake up → brush teeth → get dressed...). The student taps
     tiles in order; a wrong tap just shakes red and waits for the
     right one, so there's no way to get stuck or lose progress.
     ============================================================ */
  function actSequence(a) {
    const correct = lesson.vocab.map(v => v.en);
    const tiles = Lumio.shuffle(lesson.vocab.map(v => ({ ...v })));
    let nextIdx = 0;
    stage.innerHTML = `
      <div class="card center">
        <span class="chip chip-teal">Put it in order · what happens first?</span>
        <div class="mt" id="seqBuilt" style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;min-height:40px"></div>
        <div class="feature-grid mt" id="seqTiles">
          ${tiles.map(t => `<button class="card seq-tile" data-en="${t.en}"
              style="cursor:pointer;font-size:1rem;font-weight:800;padding:14px;line-height:1.3">
              ${t.en}<br><span class="ar" style="font-weight:700;font-size:.85rem">${t.ar}</span></button>`).join("")}
        </div>
      </div>`;
    const builtEl = document.getElementById("seqBuilt");
    document.querySelectorAll(".seq-tile").forEach(b => b.onclick = () => {
      if (b.disabled) return;
      total++;
      if (b.dataset.en === correct[nextIdx]) {
        score++; Lumio.beep(true); Lumio.speak(b.dataset.en);
        b.disabled = true; b.style.opacity = ".35"; b.style.pointerEvents = "none";
        const chip = document.createElement("span");
        chip.className = "chip chip-orange";
        chip.textContent = `${nextIdx + 1}. ${b.dataset.en}`;
        builtEl.appendChild(chip);
        nextIdx++;
        if (nextIdx === correct.length) setTimeout(next, 900);
      } else {
        Lumio.beep(false);
        b.style.background = "var(--coral)"; b.style.color = "#fff";
        setTimeout(() => { b.style.background = ""; b.style.color = ""; }, 400);
      }
    });
  }

  /* ============================================================
     RESULTS
     ============================================================ */
  // Level-tailored bonus games (games/*.html), reachable right after
  // finishing prep. Only listed here once a level actually has its own
  // game built — an empty/missing entry means no bonus button shows,
  // rather than linking to something that doesn't exist yet.
  const LEVEL_GAMES = {
    "pre-a": { file: "lumis-pocket.html", label: "🔍 Play Lumi's Pocket!" },
    "level1": { file: "treehouse-builder.html", label: "🌳 Play Treehouse Builder!" },
    "level2": { file: "twelve-months-calendar.html", label: "📅 Play Twelve Months Calendar!" },
    "level3": { file: "crew-chat.html", label: "💬 Play Crew Chat!" },
    "level4": { file: "squad-budget.html", label: "🛍️ Play Squad Budget!" },
  };

  function showResults() {
    barEl.style.width = "100%";
    const pct = total ? Math.round((score / total) * 100) : 100;
    const stars = pct >= 85 ? 3 : pct >= 60 ? 2 : 1;
    Lumio.saveResult(user.name, level, num, stars, score, total);
    Lumio.confetti(90);
    Lumio.speak(stars === 3 ? "Amazing! Three stars!" : stars === 2 ? "Great job!" : "Good try! Practice makes perfect!");
    const game = LEVEL_GAMES[level];
    stage.innerHTML = `
      <div class="card center card-sun">
        <img src="assets/story/characters/lumi-celebrate.png" alt="Lumi celebrating" style="width:170px;filter:drop-shadow(0 10px 16px rgba(67,48,31,.22))">
        <h1 class="mt">Lesson complete!</h1>
        <div class="stars mt" style="font-size:3rem">
          ${"★".repeat(stars)}<span class="star-off">${"★".repeat(3 - stars)}</span>
        </div>
        <p class="mt" style="font-weight:800;font-size:1.2rem">Score: ${score}/${total} (${pct}%)</p>
        <div class="row mt" style="justify-content:center">
          <a class="btn" href="lesson.html?level=${level}&n=${num}">↺ Play again</a>
          <a class="btn btn-teal" href="student.html">My map</a>
        </div>
        <p class="mt" style="font-weight:700;color:var(--cocoa-soft);font-size:.95rem">
          Great work! Your live class with your teacher unlocks the next lesson —
          check My Schedule on your map.
        </p>
        <div class="mt" style="padding-top:14px;border-top:1.5px solid #F5EEE1">
          ${game ? `<a class="btn" style="background:#E6F7F4;color:#0D9488;margin-right:8px" href="games/${game.file}?level=${level}&n=${num}&from=lesson">${game.label}</a>` : ""}
          <a class="btn" style="background:#FFF3D6;color:#C2530A" href="homework.html?level=${level}&n=${num}">📝 Do your homework</a>
        </div>
      </div>`;
  }

  /* ---------- Router ---------- */
  function render(a) {
    switch (a.type) {
      case "vocab": return actVocab();
      case "listen-choose": return actListen(a);
      case "match": return actMatch();
      case "quiz": return actQuiz(a);
      case "spell": return actSpell(a);
      case "speak": return actSpeak(a);
      case "sequence": return actSequence(a);
      default: return next();
    }
  }

  setBar();
  render(steps[0]);
})();
