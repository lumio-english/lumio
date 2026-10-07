/* Lumio English — Slide Motion (2026): transitions, entrance choreography and in-class game feedback for the
   teaching decks (present.html, present-trial.html). Content and pictures are untouched: every slide file stays
   exactly as it is; this script only animates what is already there and adds feedback to the existing activities.

   How it stays safe on 9,500 hand-built slides:
   - entrances use the Web Animations API on the CSS *individual* transform properties (translate / scale / rotate),
     which compose with each slide's own inline `transform` instead of overwriting it, and leave no styles behind;
   - activity helpers (checkQuizAnswer, checkSentenceBuilder, LumioAct.*) are wrapped, never replaced: the original
     runs first, then the feedback plays;
   - prefers-reduced-motion gets quick fades only; any error in here is caught and never stops the class.
   Switch: off until released (set window.LUMIO_SLIDE_FX = true in present.html to turn it on for everyone).
   Preview: ?fx=1 turns it on in that browser (remembered), ?fx=0 turns it off again. */
(function () {
  "use strict";
  var qs = function (k) { try { return new URLSearchParams(location.search).get(k); } catch (e) { return null; } };
  var flag = qs("fx");
  var ON = window.LUMIO_SLIDE_FX === true;
  try {
    if (flag === "1") localStorage.setItem("lumio_fx", "1");
    if (flag === "0") localStorage.setItem("lumio_fx", "0");
    var saved = localStorage.getItem("lumio_fx");
    if (saved === "1") ON = true; if (saved === "0") ON = false;
  } catch (e) { if (flag === "1") ON = true; }
  if (!ON) return;

  var RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var LEVEL = qs("level") || "pre-a";
  var TEEN = /^level[3-6]$/.test(LEVEL);
  var EASE_IN = TEEN ? "cubic-bezier(.22,.9,.24,1)" : "cubic-bezier(.34,1.56,.64,1)";   // teen: smooth; kid: springy
  var EASE_OUT = "cubic-bezier(.55,0,.75,.2)";
  document.documentElement.classList.add("sfx-on", TEEN ? "sfx-teen" : "sfx-kid");

  var stage = document.getElementById("stage");
  var content = document.getElementById("stageContent");
  if (!stage || !content) return;
  var SW = 1467, SH = 825;   // the deck's design size (present.html scales the stage to fit)

  function anim(el, frames, opts) { try { return el.animate(frames, opts); } catch (e) { return null; } }
  function safe(fn) { return function () { try { return fn.apply(this, arguments); } catch (e) { /* never break the class */ } }; }
  function rect(el) { return el.getBoundingClientRect(); }
  function stageScale() { var r = rect(stage); return r.width / SW || 1; }

  /* ---------------- sound: tiny synthesized effects (no files) ---------------- */
  var AC = null, master = null;
  function ac() {
    if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); master = AC.createGain(); master.gain.value = .45; master.connect(AC.destination); } catch (e) { return null; } }
    if (AC.state === "suspended") AC.resume();
    return AC;
  }
  function soundOn() { try { return localStorage.getItem("lumio_sound") !== "off"; } catch (e) { return true; } }
  function tone(f, t0, d, type, v, f2) { var o = AC.createOscillator(), g = AC.createGain(); o.type = type || "sine"; o.frequency.setValueAtTime(f, t0); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + d); g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(v || .2, t0 + .012); g.gain.exponentialRampToValueAtTime(.0001, t0 + d); o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + d + .02); }
  function noise(t0, d, v, f1, f2) { var len = Math.max(1, Math.floor(AC.sampleRate * d)), buf = AC.createBuffer(1, len, AC.sampleRate), x = buf.getChannelData(0); for (var i = 0; i < len; i++) x[i] = Math.random() * 2 - 1; var s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain(); s.buffer = buf; f.type = "bandpass"; f.Q.value = 1.1; f.frequency.setValueAtTime(f1, t0); if (f2) f.frequency.exponentialRampToValueAtTime(f2, t0 + d); g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(v, t0 + d * .25); g.gain.exponentialRampToValueAtTime(.0001, t0 + d); s.connect(f); f.connect(g); g.connect(master); s.start(t0); s.stop(t0 + d); }
  var SFX = {
    whoosh: function (t) { noise(t, .28, .07, 500, 2400); },
    pop: function (t) { tone(700, t, .09, "sine", .16, 260); },
    correct: function (t) { [784, 988, 1319].forEach(function (f, i) { tone(f, t + i * .075, .28, "triangle", .14); tone(f * 2, t + i * .075, .16, "sine", .04); }); },
    wrong: function (t) { tone(330, t, .16, "square", .045, 300); tone(247, t + .13, .26, "square", .045, 220); tone(165, t, .4, "sine", .1, 140); },
    star: function (t) { [1568, 2093, 2637, 3136].forEach(function (f, i) { tone(f, t + i * .045, .3, "sine", .06); }); },
    coin: function (t) { tone(988, t, .08, "square", .05); tone(1319, t + .07, .28, "square", .05); },
    flip: function (t) { noise(t, .12, .06, 900, 3400); },
    tick: function (t) { tone(1500, t, .03, "square", .035); },
    boom: function (t) { tone(140, t, .5, "sine", .26, 50); noise(t, .3, .1, 300, 90); },
    win: function (t) { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, t + i * .11, .45, "triangle", .13); }); }
  };
  function sfx(n) { if (!soundOn()) return; var c = ac(); if (!c || !SFX[n]) return; try { SFX[n](c.currentTime + .005); } catch (e) {} }
  document.addEventListener("pointerdown", function () { ac(); }, { once: true, capture: true });

  /* ---------------- particles: bursts of stars and confetti ---------------- */
  var cv = document.createElement("canvas"); cv.className = "sfx-canvas"; document.body.appendChild(cv);
  var cx = cv.getContext("2d"), parts = [], raf = 0, dpr = 1;
  function size() { dpr = Math.min(2, devicePixelRatio || 1); cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  size(); addEventListener("resize", size);
  var COLS = TEEN ? ["#A78BFA", "#38BDF8", "#F472B6", "#FDE68A", "#FFFFFF", "#34D399"] : ["#FFC93C", "#F97316", "#22C55E", "#3BA0FF", "#FF5C8A", "#A06BFF"];
  function starPath(r) { cx.beginPath(); for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * .45 : r; cx.lineTo(Math.cos(a) * q, Math.sin(a) * q); } cx.closePath(); }
  function loop() {
    cx.clearRect(0, 0, innerWidth, innerHeight);
    parts = parts.filter(function (p) { return p.life > 0; });
    parts.forEach(function (p) {
      p.vy += p.g; p.vx *= .985; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life--;
      cx.save(); cx.globalAlpha = Math.min(1, p.life / 25); cx.translate(p.x, p.y); cx.rotate(p.rot); cx.fillStyle = p.c;
      if (p.t === "ring") { cx.strokeStyle = p.c; cx.lineWidth = 4 * p.life / p.max; cx.beginPath(); cx.arc(0, 0, p.r0 + (p.max - p.life) * p.sp, 0, 6.28); cx.stroke(); }
      else if (p.t === "star") { starPath(p.s); cx.fill(); }
      else { cx.scale(1, Math.cos(p.rot * 2)); cx.fillRect(-p.s, -p.s * .5, p.s * 2, p.s); }
      cx.restore();
    });
    raf = parts.length ? requestAnimationFrame(loop) : 0;
  }
  function burst(x, y, o) {
    if (RM) return; o = o || {};
    var n = o.n || 28, sp = o.speed || 8;
    for (var i = 0; i < n; i++) { var a = Math.random() * 6.28, v = sp * (.35 + Math.random() * .65); parts.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2, g: .22, rot: Math.random() * 6, vr: (Math.random() - .5) * .5, s: 4 + Math.random() * 5, c: (o.cols || COLS)[i % (o.cols || COLS).length], t: o.shape || (i % 2 ? "star" : "rect"), life: 45 + Math.random() * 30 }); }
    parts.push({ t: "ring", x: x, y: y, vx: 0, vy: 0, g: 0, rot: 0, vr: 0, r0: 16, sp: 3.4, c: o.ring || "#FFD666", life: 22, max: 22 });
    if (!raf) raf = requestAnimationFrame(loop);
  }
  function center(el) { var r = rect(el); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }

  /* ---------------- feedback primitives ---------------- */
  function good(el, big) {
    if (!el) return; var c = center(el);
    burst(c.x, c.y, { n: big ? 60 : 30, ring: "#22C55E" }); sfx("correct");
    anim(el, [{ scale: 1 }, { scale: 1.1 }, { scale: .97 }, { scale: 1 }], { duration: 600, easing: "cubic-bezier(.34,1.56,.64,1)" });
    el.classList.add("sfx-good"); setTimeout(function () { el.classList.remove("sfx-good"); }, 1400);
  }
  function bad(el) {
    if (!el) return; sfx("wrong");
    anim(el, [{ translate: "0 0" }, { translate: "-12px 0" }, { translate: "11px 0" }, { translate: "-7px 0" }, { translate: "4px 0" }, { translate: "0 0" }], { duration: 480, easing: "ease-out" });
    el.classList.add("sfx-bad"); setTimeout(function () { el.classList.remove("sfx-bad"); }, 900);
  }
  function popIn(el, delay) { if (!el) return; anim(el, [{ opacity: 0, scale: .6 }, { opacity: 1, scale: 1 }], { duration: RM ? 120 : 520, delay: delay || 0, easing: EASE_IN, fill: "backwards" }); }

  /* ---------------- slide transitions ---------------- */
  var ghost = null, lastDir = 1, firstLoad = true;
  function makeGhost(dir) {
    if (!content.firstChild || firstLoad) return;
    if (ghost) ghost.remove();
    ghost = content.cloneNode(true);
    ghost.removeAttribute("id"); ghost.className = "sfx-ghost";
    ghost.querySelectorAll("[id]").forEach(function (n) { n.removeAttribute("id"); });
    content.parentNode.insertBefore(ghost, content.nextSibling);
    lastDir = dir;
  }
  if (typeof window.loadSlide === "function") {
    var origLoad = window.loadSlide;
    window.loadSlide = function (n) {
      try { var c = (typeof cur !== "undefined") ? cur : 0; makeGhost(n >= c ? 1 : -1); } catch (e) {}
      return origLoad.apply(this, arguments);
    };
  }

  function leaveGhost() {
    if (!ghost) return; var g = ghost; ghost = null;
    if (RM) { g.remove(); return; }
    var a = anim(g, TEEN
      ? [{ opacity: 1, translate: "0 0", scale: 1 }, { opacity: 0, translate: (-90 * lastDir) + "px 0", scale: .97 }]
      : [{ opacity: 1, translate: "0 0", rotate: "0deg", scale: 1 }, { opacity: 0, translate: (-140 * lastDir) + "px 30px", rotate: (-2.5 * lastDir) + "deg", scale: .92 }],
      { duration: 420, easing: EASE_OUT, fill: "forwards" });
    if (a) a.onfinish = function () { g.remove(); }; else g.remove();
  }

  /* ---------------- entrance choreography ---------------- */
  function isBg(el, r) {
    if (el.matches(".spark,.dots,.colorstrip,.header,.floorshadow,.char")) return false;
    var big = r.width * r.height > SW * SH * .55, text = (el.textContent || "").trim().length;
    return (big && text < 3 && !el.querySelector("img,button,[onclick]")) || el.tagName === "svg" && big;
  }
  function blocksOf(root) {
    var s = stageScale(), out = [];
    (function walk(node, depth) {
      Array.prototype.forEach.call(node.children, function (el) {
        if (el.matches("script,style,link,.sfx-ghost")) return;
        var r = rect(el), w = r.width / s, h = r.height / s;
        if (w < 4 || h < 4 || getComputedStyle(el).display === "none") return;
        if (isBg(el, { width: w, height: h })) return;
        if (el.matches(".spark,.dots,.colorstrip,.header,.floorshadow,.char")) return;
        // a big wrapper with several visible children: animate its children instead (two levels at most)
        if (depth < 2 && w * h > SW * SH * .3 && el.children.length > 1 && !el.matches(".card,button,[onclick]")) { walk(el, depth + 1); return; }
        out.push({ el: el, top: r.top, left: r.left });
      });
    })(root, 0);
    out.sort(function (a, b) { return Math.abs(a.top - b.top) > 40 * s ? a.top - b.top : a.left - b.left; });
    return out.map(function (o) { return o.el; });
  }
  function isChatRow(el) {
    var img = el.querySelector && el.querySelector("img[src*='characters/']");
    var r = rect(el), s = stageScale();
    return !!img && (el.textContent || "").trim().length > 8 && r.height / s < 220;
  }

  var idleChars = [];
  function enter(dir) {
    idleChars.forEach(function (a) { try { a.cancel(); } catch (e) {} }); idleChars = [];
    // the slide as a whole glides in from the side it is coming from
    anim(content, RM ? [{ opacity: 0 }, { opacity: 1 }] : (TEEN
      ? [{ opacity: 0, translate: (70 * dir) + "px 0" }, { opacity: 1, translate: "0 0" }]
      : [{ opacity: 0, translate: (120 * dir) + "px 20px", scale: .96 }, { opacity: 1, translate: "0 0", scale: 1 }]),
      { duration: RM ? 160 : 520, easing: TEEN ? "cubic-bezier(.22,.9,.24,1)" : "cubic-bezier(.2,.9,.3,1.1)" });
    if (RM) return;

    var t = 140;
    var header = content.querySelector(".header");
    if (header) anim(header, [{ opacity: 0, translate: "0 -40px" }, { opacity: 1, translate: "0 0" }], { duration: 500, delay: 80, easing: EASE_IN, fill: "backwards" });
    content.querySelectorAll(".dots,.colorstrip").forEach(function (b) { anim(b, [{ opacity: 0, scale: "0 1" }, { opacity: 1, scale: "1 1" }], { duration: 600, delay: 200, easing: "cubic-bezier(.2,.9,.3,1)", fill: "backwards" }); });

    var blocks = blocksOf(content);
    var chat = blocks.filter(isChatRow);
    blocks.forEach(function (b, i) {
      if (chat.indexOf(b) !== -1) return;
      anim(b, [{ opacity: 0, translate: "0 38px", scale: .94 }, { opacity: 1, translate: "0 0", scale: 1 }], { duration: 620, delay: t + i * 70, easing: EASE_IN, fill: "backwards" });
      // pictures inside a block pop a beat after it
      b.querySelectorAll("img:not([src*='logo'])").forEach(function (im, k) {
        if (im.closest(".char")) return;
        anim(im, [{ opacity: 0, scale: .55, rotate: (TEEN ? 0 : -6) + "deg" }, { opacity: 1, scale: 1, rotate: "0deg" }], { duration: 700, delay: t + i * 70 + 160 + k * 60, easing: EASE_IN, fill: "backwards" });
      });
      // letter tiles / small chips drop in one by one
      var chips = Array.prototype.filter.call(b.querySelectorAll("div,span"), function (d) { var r = rect(d), s = stageScale(); return d.children.length === 0 && (d.textContent || "").trim().length === 1 && r.width / s < 90 && r.height / s < 90; });
      chips.forEach(function (d, k) { anim(d, [{ opacity: 0, translate: "0 -30px", scale: .5 }, { opacity: 1, translate: "0 0", scale: 1 }], { duration: 480, delay: t + i * 70 + 260 + k * 55, easing: "cubic-bezier(.34,1.7,.64,1)", fill: "backwards" }); });
      // buttons and tappable things spring in last
      b.querySelectorAll("button,[onclick]").forEach(function (btn, k) { if (btn === b) return; anim(btn, [{ opacity: 0, scale: .7 }, { opacity: 1, scale: 1 }], { duration: 460, delay: t + i * 70 + 320 + k * 40, easing: EASE_IN, fill: "backwards" }); });
    });
    // chat lines appear one after another, like messages arriving
    chat.forEach(function (row, i) {
      var r = rect(row), fromLeft = r.left + r.width / 2 < rect(stage).left + rect(stage).width / 2;
      anim(row, [{ opacity: 0, translate: (fromLeft ? -40 : 40) + "px 12px", scale: .9 }, { opacity: 1, translate: "0 0", scale: 1 }], { duration: 520, delay: 260 + i * 380, easing: EASE_IN, fill: "backwards" });
      setTimeout(function () { sfx("pop"); }, 260 + i * 380);
    });
    // the character jumps in, then keeps breathing
    content.querySelectorAll(".char, img[src*='characters/']").forEach(function (ch) {
      if (ch.closest && chat.some(function (row) { return row.contains(ch); })) return;
      var r = rect(ch), s = stageScale(); if (r.height / s < 160) return;   // small chat heads are handled above
      var a = anim(ch, [{ opacity: 0, translate: "160px 60px", rotate: "8deg" }, { opacity: 1, translate: "-8px -10px", rotate: "-2deg", offset: .75 }, { opacity: 1, translate: "0 0", rotate: "0deg" }], { duration: 900, delay: 300, easing: "cubic-bezier(.2,.9,.3,1.15)", fill: "backwards" });
      var start = function () { var b = anim(ch, [{ scale: "1 1", translate: "0 0" }, { scale: "1.012 1.03", translate: "0 -4px" }], { duration: 1700, iterations: Infinity, direction: "alternate", easing: "ease-in-out" }); if (b) idleChars.push(b); };
      if (a) a.onfinish = start; else start();
    });
    // the tiny sparkle shapes twinkle
    content.querySelectorAll(".spark").forEach(function (sp, i) { var a = anim(sp, [{ opacity: .15, scale: .7, rotate: "0deg" }, { opacity: .8, scale: 1.15, rotate: "45deg" }], { duration: 1600 + i * 300, iterations: Infinity, direction: "alternate", easing: "ease-in-out", delay: i * 200 }); if (a) idleChars.push(a); });
  }

  /* run on every slide swap (present.html replaces #stageContent's children) */
  var pending = false;
  new MutationObserver(function () {
    if (pending) return; pending = true;
    requestAnimationFrame(safe(function () {
      pending = false;
      if (content.querySelector("#loadingMsg")) return;
      var dir = lastDir;
      if (!firstLoad) sfx("whoosh");
      leaveGhost(); enter(dir); progress(); firstLoad = false;
    }));
  }).observe(content, { childList: true });

  /* ---------------- progress bar ---------------- */
  var bar = document.createElement("div"); bar.className = "sfx-progress"; bar.innerHTML = "<i></i>"; stage.appendChild(bar);
  function progress() { try { var p = (typeof cur !== "undefined" && typeof total !== "undefined" && total) ? cur / total : 0; bar.firstChild.style.transform = "scaleX(" + Math.max(.01, p) + ")"; } catch (e) {} }

  /* ---------------- game links: glowing cards that pop in ---------------- */
  var links = document.getElementById("gameLinks");
  if (links) new MutationObserver(safe(function () {
    var as = links.querySelectorAll("a"); if (!as.length || links.dataset.sfxShown === "1") { if (!as.length) links.dataset.sfxShown = ""; return; }
    links.dataset.sfxShown = "1";
    as.forEach(function (a, i) { popIn(a, 200 + i * 120); });
    setTimeout(function () { sfx("star"); }, 300);
  })).observe(links, { childList: true });

  /* ---------------- activities: wrap the existing helpers ---------------- */
  function wrap(obj, name, after, before) {
    var orig = obj && obj[name]; if (typeof orig !== "function") return;
    obj[name] = function () {
      var args = arguments, pre;
      try { if (before) pre = before.apply(this, args); } catch (e) {}
      var res = orig.apply(this, args);
      try { if (after) after.apply(this, [res, pre].concat(Array.prototype.slice.call(args))); } catch (e) {}
      return res;
    };
  }

  // quiz answers
  wrap(window, "checkQuizAnswer", function (res, answeredBefore, el, chosen, correct) {
    if (answeredBefore) return;   // only the first answer counts, as in the original
    if (chosen === correct) { good(el, true); }
    else { bad(el); var c = content.querySelector('[data-quiz-option="' + String(correct).replace(/"/g, '\\"') + '"]'); if (c) setTimeout(function () { anim(c, [{ scale: 1 }, { scale: 1.08 }, { scale: 1 }], { duration: 700, easing: "ease-in-out", iterations: 2 }); }, 450); }
  }, function (el) { var box = el && el.closest("#stageContent"); return box && box.dataset.quizAnswered === "1"; });

  // sentence builder
  wrap(window, "checkSentenceBuilder", function (res, pre, groupId) {
    groupId = groupId || ""; var slots = document.getElementById("sbSlots" + groupId), fb = document.getElementById("sbFeedback" + groupId);
    if (!slots || !fb) return;
    if (/Perfect/.test(fb.textContent)) { good(slots, true); slots.querySelectorAll(".sb-tile").forEach(function (t, i) { anim(t, [{ translate: "0 0" }, { translate: "0 -14px" }, { translate: "0 0" }], { duration: 420, delay: i * 70, easing: "ease-out" }); }); }
    else if (/try again/i.test(fb.textContent)) bad(slots);
    if (fb.textContent) popIn(fb);
  });

  var A = window.LumioAct;
  if (A) {
    // a real 3D flip: turn to the edge, swap faces, turn back
    var origFlip = A.flip;
    A.flip = function (card) {
      if (!card) return;
      if (RM || card._sfxFlipping) return origFlip.apply(A, arguments);
      if (card.dataset.flipped === "1" && card.dataset.lock === "1") return origFlip.apply(A, arguments);
      card._sfxFlipping = true; sfx("flip");
      var a = anim(card, [{ rotate: "y 0deg" }, { rotate: "y 90deg" }], { duration: 160, easing: "ease-in" });
      var self = this, args = arguments;
      var done = function () { origFlip.apply(self, args); anim(card, [{ rotate: "y -90deg" }, { rotate: "y 0deg" }], { duration: 260, easing: "cubic-bezier(.34,1.56,.64,1)" }); card._sfxFlipping = false; };
      if (a) a.onfinish = done; else done();
    };
    // memory: a found pair bursts; the whole board cheers when it's finished
    wrap(A, "memory", function (res, pre, card) {
      setTimeout(function () {
        if (card && card.dataset.done === "1" && !card._sfxDone) {
          card._sfxDone = true; good(card);
          var board = card.parentElement; if (board && !board.querySelector("[data-pair]:not([data-done='1'])")) { setTimeout(function () { var c = center(board); burst(c.x, c.y, { n: 90, speed: 12 }); sfx("win"); }, 300); }
        }
      }, 450);
    });
    // team scores: coins for points, a gentle tick for a take-back
    wrap(A, "score", function (res, pre, btn, delta) {
      var box = btn && btn.parentElement ? btn.parentElement.querySelector("[data-act-score]") : null; if (!box) return;
      if (delta > 0) { var c = center(box); burst(c.x, c.y, { n: 16, speed: 5, shape: "star", cols: ["#FFD666", "#FFB300", "#fff"] }); sfx("coin"); anim(box, [{ scale: 1 }, { scale: 1.45 }, { scale: 1 }], { duration: 500, easing: "cubic-bezier(.34,1.56,.64,1)" }); }
      else sfx("tick");
    });
    wrap(A, "star", function (res, pre, rowId) {
      var row = document.getElementById(rowId); if (!row) return;
      var stars = row.querySelectorAll("[data-star='1']"), last = stars[stars.length - 1]; if (!last) return;
      var c = center(last); burst(c.x, c.y, { n: 20, shape: "star", cols: ["#FFD666", "#FFB300", "#fff"] }); sfx("star");
      if (!row.querySelector("[data-star='0']")) setTimeout(function () { sfx("win"); var cc = center(row); burst(cc.x, cc.y, { n: 70, speed: 11 }); }, 250);
    });
    // mystery picture: tiles burst away instead of vanishing
    var origUncover = A.uncover;
    A.uncover = function (tile) {
      if (!tile || RM) return origUncover.apply(A, arguments);
      var c = center(tile); burst(c.x, c.y, { n: 10, speed: 4 }); sfx("pop");
      var a = anim(tile, [{ scale: 1, rotate: "0deg" }, { scale: 1.25, rotate: (Math.random() * 24 - 12) + "deg", opacity: 0 }], { duration: 280, easing: "ease-in" });
      var self = this, args = arguments; if (a) a.onfinish = function () { origUncover.apply(self, args); }; else origUncover.apply(self, args);
    };
    wrap(A, "uncoverAll", function (res, pre, panelId) { var p = document.getElementById(panelId); if (!p) return; var c = center(p); burst(c.x, c.y, { n: 60, speed: 10 }); sfx("win"); });
    // the countdown pulses in the last ten seconds and goes BOOM at zero
    wrap(A, "timer", function (res, pre, btn) {
      if (!btn) return; clearInterval(btn._sfxIv);
      btn._sfxIv = setInterval(function () {
        var m = /(\d+)/.exec(btn.textContent || ""), n = m ? Number(m[1]) : null;
        if (/Time!/.test(btn.textContent)) { clearInterval(btn._sfxIv); sfx("boom"); anim(btn, [{ scale: 1 }, { scale: 1.3 }, { scale: 1 }], { duration: 500, easing: "cubic-bezier(.34,1.56,.64,1)" }); bad(btn); return; }
        if (n !== null && n <= 10) { sfx("tick"); anim(btn, [{ scale: 1 }, { scale: 1.12 }, { scale: 1 }], { duration: 400, easing: "ease-out" }); btn.classList.add("sfx-hurry"); }
        else btn.classList.remove("sfx-hurry");
      }, 1000);
    });
    // anything that reveals a new panel/item: pop it in
    ["cycle", "random"].forEach(function (k) { wrap(A, k, function (res, pre, id) { var c = document.getElementById(id); if (!c) return; var shown = Array.prototype.find.call(c.children, function (x) { return x.style.display !== "none"; }); if (shown) { popIn(shown); sfx("pop"); } }); });
    wrap(A, "pick", function (res, pre, poolId, targetId) { var t = document.getElementById(targetId); if (!t) return; Array.prototype.forEach.call(t.children, function (x, i) { popIn(x, i * 90); }); sfx("pop"); });
    wrap(A, "next", function (res, pre, rowId) { var row = document.getElementById(rowId); if (!row) return; var k = row.children[Number(row.dataset.idx || 0)]; if (k) { anim(k, [{ scale: 1 }, { scale: 1.12 }, { scale: 1 }], { duration: 450, easing: "cubic-bezier(.34,1.56,.64,1)" }); sfx("pop"); } });
    wrap(A, "show", function (res, pre, id) { var e = document.getElementById(id); if (e) popIn(e); });
  }

  /* ---------------- every tap feels physical; listen buttons show sound waves ---------------- */
  var lastTap = null;
  document.addEventListener("pointerdown", safe(function (e) {
    var t = e.target.closest && e.target.closest("#stageContent button, #stageContent [onclick]");
    if (!t) return; lastTap = t;
    if (!RM) anim(t, [{ scale: 1 }, { scale: .94 }, { scale: 1 }], { duration: 260, easing: "ease-out" });
    // a tap that reveals something (recap cards, tap-to-show answers): a small pop when it changes
    var before = t.innerHTML.length;
    setTimeout(function () { if (t.isConnected && Math.abs(t.innerHTML.length - before) > 0) { var c = center(t); burst(c.x, c.y, { n: 12, speed: 4 }); } }, 60);
  }), true);
  function waves(el) {
    if (!el || RM) return;
    var r = rect(el), s = stageScale();
    for (var i = 0; i < 3; i++) {
      var w = document.createElement("span"); w.className = "sfx-wave";
      w.style.left = (r.left + r.width / 2) + "px"; w.style.top = (r.top + r.height / 2) + "px";
      w.style.width = w.style.height = Math.max(r.width, r.height) * 1.05 + "px";
      document.body.appendChild(w);
      (function (w, i) { var a = anim(w, [{ opacity: .55, scale: .6 }, { opacity: 0, scale: 1.8 }], { duration: 900, delay: i * 220, easing: "ease-out" }); if (a) a.onfinish = function () { w.remove(); }; else w.remove(); })(w, i);
    }
  }
  function hookSpeak() {
    if (!window.Lumio || !Lumio.speak || Lumio.speak._sfx) return;
    var sp = Lumio.speak;
    Lumio.speak = function () { try { if (lastTap && lastTap.isConnected && Date.now() - (lastTap._t || 0) < 1) {} waves(lastTap); lastTap = null; } catch (e) {} return sp.apply(this, arguments); };
    Lumio.speak._sfx = true;
  }
  hookSpeak(); document.addEventListener("DOMContentLoaded", hookSpeak);

  /* keyboard: Space = next, like a clicker */
  document.addEventListener("keydown", function (e) {
    if (e.key === " " && !/INPUT|TEXTAREA|BUTTON/.test((document.activeElement || {}).tagName || "")) { var n = document.getElementById("nextBtn"); if (n && !n.disabled) { e.preventDefault(); n.click(); } }
  });

  window.LumioSlideFX = { burst: burst, good: good, bad: bad, sfx: sfx };
})();
