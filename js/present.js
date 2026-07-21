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

  /* ---------- load actual slide count + quiz answer key ---------- */
  let quizData = {};
  Promise.all([
    fetch(`assets/slides/${level}/manifest.json`).then(r => r.json()).catch(() => null),
    fetch(`${SLIDE_DIR}/quiz-data.json`).then(r => r.json()).catch(() => ({})),
  ]).then(([manifest, qd]) => {
    quizData = qd || {};
    const total = (manifest && manifest[nn]) || TOTAL_COMPUTED;
    start(total);
  });

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
      if (quizData[cur]) {
        // Real clickable answer zones, positioned to align exactly with
        // the option boxes drawn into the slide image itself (fixed
        // layout: QUIZ_OPTION_BOXES in the Python generator).
        const q = quizData[cur];
        const boxes = [
          { left: 610, top: 260, width: 260, height: 84 },
          { left: 890, top: 260, width: 260, height: 84 },
          { left: 610, top: 364, width: 260, height: 84 },
          { left: 890, top: 364, width: 260, height: 84 },
        ];
        let answered = false;
        q.options.forEach((opt, idx) => {
          const b = boxes[idx];
          const zone = document.createElement("button");
          zone.className = "quiz-zone";
          zone.style.cssText = `position:absolute;left:${(b.left/1467*100).toFixed(2)}%;top:${(b.top/825*100).toFixed(2)}%;
            width:${(b.width/1467*100).toFixed(2)}%;height:${(b.height/825*100).toFixed(2)}%;
            border-radius:16px;border:2.5px solid transparent;background:transparent;cursor:pointer;pointer-events:auto`;
          zone.onclick = (e) => {
            e.stopPropagation();
            if (answered) return;
            answered = true;
            const correct = opt === q.correct;
            zone.style.background = correct ? "rgba(74,222,128,.28)" : "rgba(248,113,113,.28)";
            zone.style.borderColor = correct ? "#16A34A" : "#DC2626";
            zone.textContent = correct ? "\u2713" : "\u2717";
            zone.style.fontSize = "1.8rem"; zone.style.fontWeight = "800";
            zone.style.color = correct ? "#16A34A" : "#DC2626";
            if (correct) { Lumio.confetti(50); Lumio.speak(q.correct); }
            else {
              // also mark the correct one so the class sees the right answer
              const correctIdx = q.options.indexOf(q.correct);
              const cz = wrap.querySelectorAll(".quiz-zone")[correctIdx];
              if (cz) {
                cz.style.background = "rgba(74,222,128,.28)";
                cz.style.borderColor = "#16A34A";
                cz.textContent = "\u2713"; cz.style.fontSize = "1.8rem"; cz.style.fontWeight = "800"; cz.style.color = "#16A34A";
              }
            }
          };
          wrap.appendChild(zone);
        });
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
