// Shared helpers for the interactive activity slides (lib/activity_slides.py).
// Slide HTML is injected with innerHTML, so slides cannot carry <script>;
// their inline onclick handlers call these instead. Loaded by present.html
// and present-trial.html. Every helper is defensive: a missing element is a
// no-op, never an error in the middle of a class.
(function () {
  "use strict";
  const A = {};

  // Flip a face-down card: hides .act-back, shows .act-front. Second click
  // flips it back unless data-lock="1".
  A.flip = function (card) {
    if (!card) return;
    const flipped = card.dataset.flipped === "1";
    if (flipped && card.dataset.lock === "1") return;
    card.dataset.flipped = flipped ? "0" : "1";
    const back = card.querySelector(".act-back"), front = card.querySelector(".act-front");
    if (back) back.style.display = flipped ? "" : "none";
    if (front) front.style.display = flipped ? "none" : "";
    card.style.transform = flipped ? "" : "scale(1.04)";
  };

  // Show the next/previous child of a container (children are the panels),
  // wrapping around. Updates any [data-act-counter] inside the slide.
  A.cycle = function (containerId, delta) {
    const c = document.getElementById(containerId);
    if (!c) return;
    const kids = Array.from(c.children);
    if (!kids.length) return;
    let i = Number(c.dataset.idx || 0);
    kids[i].style.display = "none";
    i = (i + delta + kids.length) % kids.length;
    kids[i].style.display = "";
    c.dataset.idx = String(i);
    const counter = document.querySelector(`[data-act-counter="${containerId}"]`);
    if (counter) counter.textContent = (i + 1) + " / " + kids.length;
    // A panel can carry a word to speak when it appears.
    const say = kids[i].dataset.say;
    if (say && c.dataset.autosay === "1" && window.Lumio && Lumio.speak) Lumio.speak(say);
  };

  // Show a random child of a container (never the current one twice in a row).
  A.random = function (containerId) {
    const c = document.getElementById(containerId);
    if (!c) return;
    const kids = Array.from(c.children);
    if (kids.length < 2) return;
    let i = Number(c.dataset.idx || 0), j = i;
    while (j === i) j = Math.floor(Math.random() * kids.length);
    kids[i].style.display = "none"; kids[j].style.display = ""; c.dataset.idx = String(j);
    const counter = document.querySelector(`[data-act-counter="${containerId}"]`);
    if (counter) counter.textContent = (j + 1) + " / " + kids.length;
  };

  // Countdown on a button: "⏱ 60" ... "⏰ Time!". Click again to restart.
  A.timer = function (btn, secs) {
    if (!btn) return;
    if (btn._iv) { clearInterval(btn._iv); btn._iv = null; }
    let t = Number(secs) || 60;
    btn.textContent = "⏱ " + t;
    btn._iv = setInterval(function () {
      t--;
      btn.textContent = t > 0 ? "⏱ " + t : "⏰ Time!";
      if (t <= 0) { clearInterval(btn._iv); btn._iv = null; }
    }, 1000);
  };

  // Score counter: [data-act-score] element next to the button holds the number.
  A.score = function (btn, delta) {
    const box = btn && btn.parentElement ? btn.parentElement.querySelector("[data-act-score]") : null;
    if (!box) return;
    const v = Math.max(0, Number(box.textContent || 0) + delta);
    box.textContent = String(v);
    box.style.transform = "scale(1.25)";
    setTimeout(function () { box.style.transform = ""; }, 180);
  };

  // Stars: fill the next empty star in a [data-act-stars] row.
  A.star = function (rowId) {
    const row = document.getElementById(rowId);
    if (!row) return;
    const empty = row.querySelector("[data-star='0']");
    if (!empty) return;
    empty.dataset.star = "1"; empty.style.opacity = "1"; empty.style.transform = "scale(1.2)";
    setTimeout(function () { empty.style.transform = ""; }, 200);
    if (!row.querySelector("[data-star='0']")) {
      const msg = document.querySelector(`[data-act-stars-done="${rowId}"]`);
      if (msg) msg.style.display = "";
    }
  };

  // Memory pairs: cards carry data-pair; two face-up non-matching cards flip
  // back after a moment, matches stay up. State lives on the board element.
  // The board tracks which cards are face-up itself (data-open) rather than
  // reading data-flipped: slide-motion.js animates A.flip and only sets
  // data-flipped when the 3D turn finishes, so reading it synchronously saw
  // one open card and a matching pair was never recognised until a third tap.
  A.memory = function (card) {
    if (!card || card.dataset.done === "1" || card.dataset.open === "1" || card.dataset.flipped === "1") return;
    const board = card.parentElement;
    if (board.dataset.busy === "1") return;
    if (board.dataset.shuffled !== "1") {
      // The generated board is deterministic (pairs sit side by side); deal a
      // fresh random layout the first time someone taps, while all cards are
      // still face down.
      board.dataset.shuffled = "1";
      const kids = Array.from(board.children);
      for (let i = kids.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [kids[i], kids[j]] = [kids[j], kids[i]]; }
      kids.forEach(function (k) { board.appendChild(k); });
    }
    card.dataset.open = "1";
    A.flip(card);
    const open = Array.from(board.querySelectorAll("[data-pair][data-open='1']:not([data-done='1'])"));
    if (open.length < 2) return;
    const [a, b] = open;
    if (a.dataset.pair === b.dataset.pair) {
      a.dataset.done = b.dataset.done = "1"; a.dataset.lock = b.dataset.lock = "1";
      a.style.boxShadow = b.style.boxShadow = "0 0 0 4px #22C55E";
      if (window.Lumio && Lumio.speak && a.dataset.say) Lumio.speak(a.dataset.say);
      if (!board.querySelector("[data-pair]:not([data-done='1'])")) {
        const msg = document.querySelector(`[data-act-memory-done="${board.id}"]`);
        if (msg) msg.style.display = "";
      }
    } else {
      board.dataset.busy = "1";
      setTimeout(function () {
        // flip back only once both cards have actually landed face-up
        const tryBack = function (n) {
          if (n > 0 && (a.dataset.flipped !== "1" || b.dataset.flipped !== "1")) return setTimeout(function () { tryBack(n - 1); }, 100);
          A.flip(a); A.flip(b); a.dataset.open = b.dataset.open = "0"; board.dataset.busy = "0";
        };
        tryBack(10);
      }, 900);
    }
  };

  // Mystery picture: hide one cover tile. Reveal-all removes every tile.
  A.uncover = function (tile) { if (tile) tile.style.opacity = "0"; tile.style.pointerEvents = "none"; };
  A.uncoverAll = function (panelId) {
    const p = document.getElementById(panelId);
    if (!p) return;
    p.querySelectorAll("[data-act-tile]").forEach(function (t) { t.style.opacity = "0"; t.style.pointerEvents = "none"; });
  };

  // Pick N random items from a hidden pool list and show them in a target.
  A.pick = function (poolId, targetId, n) {
    const pool = document.getElementById(poolId), target = document.getElementById(targetId);
    if (!pool || !target) return;
    const items = Array.from(pool.children);
    for (let i = items.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [items[i], items[j]] = [items[j], items[i]]; }
    target.innerHTML = "";
    items.slice(0, n).forEach(function (it) { const c = it.cloneNode(true); c.style.display = ""; target.appendChild(c); });
  };

  // Highlight the next item in an ordered row (story chain). Wraps around.
  A.next = function (rowId) {
    const row = document.getElementById(rowId);
    if (!row) return;
    const kids = Array.from(row.children);
    if (!kids.length) return;
    let i = Number(row.dataset.idx === undefined ? -1 : row.dataset.idx);
    if (i >= 0) { kids[i].style.outline = ""; kids[i].style.transform = ""; }
    i = (i + 1) % kids.length;
    kids[i].style.outline = "4px solid #F97316"; kids[i].style.transform = "translateY(-6px)";
    row.dataset.idx = String(i);
    const say = kids[i].dataset.say;
    if (say && window.Lumio && Lumio.speak) Lumio.speak(say);
  };

  // Simple show/hide toggle for a reveal panel.
  A.show = function (id) { const e = document.getElementById(id); if (e) e.style.display = ""; };

  // ---- Reading Lab (lib/reading_slides.py) ----------------------------
  // Tap a glowing word -> a dark pop card near it (meaning + where it was
  // taught, or the pronunciation rule). Tap anywhere on the card, or the
  // same word again, to close. Listen buttons read a half of the passage.
  A.rlClose = function () {
    document.querySelectorAll(".rl-pop.on").forEach(function (p) { p.classList.remove("on"); });
    document.querySelectorAll(".rl-known.on, .rl-rule.on").forEach(function (w) { w.classList.remove("on"); });
  };
  A.rlPop = function (el) {
    if (!el) return;
    const stage = el.closest("[data-rl-stage]") || el.closest(".rl");
    const pop = stage && stage.querySelector(".rl-pop");
    const wasOn = el.classList.contains("on");
    A.rlClose();
    if (wasOn || !pop) { if (!pop && window.Lumio && Lumio.speak) Lumio.speak(el.dataset.rlWord || el.textContent); return; }
    el.classList.add("on");
    const d = el.dataset;
    if (d.rlKind === "rule") {
      pop.className = "rl-pop rule on";
      pop.innerHTML = "<b>" + d.rlWord + "</b><small>" + d.rlTitle + "</small><em>" + d.rlEn + "</em><em dir='rtl'>" + d.rlAr + "</em><em class='ex'>" + d.rlEx + "</em>";
    } else {
      pop.className = "rl-pop word on";
      pop.innerHTML = "<b>" + d.rlWord + "</b><span class='ar' dir='rtl'>" + d.rlAr + "</span><small>You learned this in " + d.rlSrc + "</small>";
    }
    // place it under the word, kept inside the stage
    const sr = stage.getBoundingClientRect(), r = el.getBoundingClientRect();
    const sx = sr.width / stage.offsetWidth || 1, sy = sr.height / stage.offsetHeight || 1;
    let left = (r.left - sr.left) / sx, top = (r.bottom - sr.top) / sy + 8;
    pop.style.left = "0px"; pop.style.top = "0px";
    const pw = pop.offsetWidth, ph = pop.offsetHeight;
    if (left + pw > stage.offsetWidth - 8) left = Math.max(8, stage.offsetWidth - pw - 8);
    if (top + ph > stage.offsetHeight - 8) top = Math.max(8, (r.top - sr.top) / sy - ph - 8);
    pop.style.left = left + "px"; pop.style.top = top + "px";
    if (window.Lumio && Lumio.speak && d.rlWord) Lumio.speak(d.rlWord);
  };
  A.rlSpeak = function (btn, text) {
    if (!text) return;
    document.querySelectorAll(".rl-btn.on").forEach(function (b) { b.classList.remove("on"); });
    if (btn && btn.classList) { btn.classList.add("on"); setTimeout(function () { btn.classList.remove("on"); }, Math.min(60000, 350 * text.split(/\s+/).length)); }
    if (window.Lumio && Lumio.speak) Lumio.speak(text);
    else if (window.speechSynthesis) { const u = new SpeechSynthesisUtterance(text); u.lang = "en-US"; u.rate = 0.9; speechSynthesis.cancel(); speechSynthesis.speak(u); }
  };

  window.LumioAct = A;
})();
