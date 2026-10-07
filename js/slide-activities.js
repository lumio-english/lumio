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
  A.memory = function (card) {
    if (!card || card.dataset.done === "1" || card.dataset.flipped === "1") return;
    const board = card.parentElement;
    if (board.dataset.busy === "1") return;
    A.flip(card);
    const open = Array.from(board.querySelectorAll("[data-pair][data-flipped='1']:not([data-done='1'])"));
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
      setTimeout(function () { A.flip(a); A.flip(b); board.dataset.busy = "0"; }, 900);
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

  window.LumioAct = A;
})();
