/* Lumio English — presentation engine v3
   Displays the ACTUAL rendered PPTX slide images (guaranteed pixel-perfect
   to the real file — no HTML reinterpretation risk). Adds two things on
   top: an on-demand "Listen" button on vocabulary slides, and persistent
   game-launch buttons, both positioned to avoid the slide's own content. */
(() => {
  const level = Lumio.qs("level") || "pre-a";
  const num = parseInt(Lumio.qs("n") || "1", 10);
  const nn = String(num).padStart(2, "0");
  const lesson = window.LUMIO_LESSONS?.[level]?.[num];
  const deck = document.getElementById("deck");
  const img = document.getElementById("slideImg");
  if (!lesson) { deck.innerHTML = "<p style='padding:40px;color:#333'>Lesson not found.</p>"; return; }
  document.title = `L${num} ${lesson.title} — Presentation`;

  const SLIDE_DIR = `assets/slides/${level}/${nn}`;

  /* ---------- reconstruct the exact slide index map (mirrors gen_deck_v3.js) ---------- */
  const isFirstInLevel = num === 1;
  const vocabN = lesson.vocab.length;
  const yourTurnN = Math.min(3, vocabN);
  const quizAct = (lesson.activities || []).find(a => a.type === "quiz");
  const customQN = (quizAct && quizAct.questions) ? quizAct.questions.length : 0;
  const questionsN = Math.min(3, customQN + 2);

  let i = 1; // 1-based slide counter
  const map = { vocab: {}, yourTurn: {} };
  i++; // cover done (i now points to next slide)
  if (isFirstInLevel) i++; // meet friends
  i++; // welcome
  i++; // goals
  i++; // warmup
  i++; // vocab overview
  lesson.vocab.forEach((v, k) => {
    map.vocab[i] = v; i++; // vocabulary slide
    i++; // practice slide
  });
  i++; // listen & repeat
  lesson.vocab.slice(0, yourTurnN).forEach((v, k) => { map.yourTurn[i] = v; i++; });
  const gameStartSlide = i; // first quiz slide — natural point to also offer games
  i += questionsN;
  const TOTAL_COMPUTED = i + 1; // + reward (+ homework counted by actual file count below)

  /* ---------- load actual slide count ---------- */
  fetch(`assets/slides/${level}/manifest.json`).then(r => r.json()).then(manifest => {
    const total = manifest[nn] || TOTAL_COMPUTED;
    start(total);
  }).catch(() => start(TOTAL_COMPUTED));

  function start(total) {
    let cur = 1;
    const counterEl = document.getElementById("counter");
    const pbar = document.getElementById("pbar");
    let overlayEl = null;

    const slidePath = (n) => `${SLIDE_DIR}/slide-${String(n).padStart(2, "0")}.jpg`;

    const clearOverlay = () => { if (overlayEl) { overlayEl.remove(); overlayEl = null; } };

    const buildOverlay = () => {
      clearOverlay();
      const wrap = document.createElement("div");
      wrap.style.cssText = "position:absolute;inset:0;pointer-events:none";

      if (map.vocab[cur]) {
        const v = map.vocab[cur];
        const btn = document.createElement("button");
        btn.className = "overlay-btn";
        btn.style.cssText += "left:5%;bottom:6%;pointer-events:auto";
        btn.textContent = "\u25b6 Listen";
        btn.onclick = (e) => { e.stopPropagation(); Lumio.speak(v.en); };
        wrap.appendChild(btn);
      }
      if (map.yourTurn[cur]) {
        const v = map.yourTurn[cur];
        const btn = document.createElement("button");
        btn.className = "overlay-btn";
        btn.style.cssText += "left:5%;bottom:6%;pointer-events:auto";
        btn.textContent = "\u25b6 Reveal answer";
        btn.onclick = (e) => {
          e.stopPropagation();
          Lumio.speak(v.en); Lumio.confetti(40);
          btn.textContent = `${v.en} \u2014 ${v.ar}`;
          btn.style.background = "linear-gradient(135deg,#4ADE80,#16A34A)";
        };
        wrap.appendChild(btn);
      }
      if (cur >= gameStartSlide - 1 && cur <= total) {
        const gwrap = document.createElement("div");
        gwrap.style.cssText = "position:absolute;right:3%;bottom:6%;display:flex;gap:1%;pointer-events:auto";
        gwrap.innerHTML = `
          <a class="overlay-btn game-btn" href="games/balloon-pop.html?level=${level}&n=${num}">Balloon Pop</a>
          <a class="overlay-btn game-btn" href="games/match-drag.html?level=${level}&n=${num}">Match It</a>`;
        wrap.appendChild(gwrap);
      }
      deck.appendChild(wrap);
      overlayEl = wrap;
    };

    const show = (n) => {
      cur = Math.max(1, Math.min(total, n));
      img.src = slidePath(cur);
      counterEl.textContent = `${cur}/${total}`;
      pbar.style.width = `${(cur / total) * 100}%`;
      buildOverlay();
    };

    const next = () => show(cur + 1);
    const prev = () => show(cur - 1);

    document.getElementById("zR").onclick = next;
    document.getElementById("zL").onclick = prev;
    deck.addEventListener("click", (e) => {
      if (e.target.closest(".overlay-btn")) return;
      next();
    });
    addEventListener("keydown", (e) => {
      if (["ArrowRight", " ", "PageDown"].includes(e.key)) { e.preventDefault(); next(); }
      if (["ArrowLeft", "PageUp"].includes(e.key)) { e.preventDefault(); prev(); }
      if (e.key === "Escape") location.href = "teacher.html";
      if (e.key.toLowerCase() === "f") toggleFS();
    });
    const toggleFS = () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
    document.getElementById("fsBtn").onclick = toggleFS;

    show(1);
  }
})();
