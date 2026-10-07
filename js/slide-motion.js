/* Lumio English — Live Class (2026, v2): turns the teaching decks (present.html, present-trial.html) into a living
   picture book, the same way story.html does for reading. Content and pictures are untouched: every slide file stays
   exactly as it is; this script only stages what is already there.

   What the class sees:
   - the deck is a book: pages really turn (kids) / the screen turns like a cube (teens), with paper sounds;
   - the slide's own painting slowly breathes (Ken Burns) with floating dust / stars over it;
   - a chapter card (big title, the lesson's cast jumping in, confetti) opens each new part of the lesson;
   - the slide's character is the host: jumps in, breathes, talks in a speech bubble and reacts to answers
     (celebrate / surprised poses from the character library);
   - New Words are a magic reveal: the picture sleeps in grey under a "?", Next (or a tap) wakes it up in colour,
     the word is spoken and its letters drop in one by one; going back shows it already revealed;
   - Listen buttons light the words up while they are read (karaoke), single words glow and spell themselves;
   - quizzes are a game show: right answers send a star flying into the class star jar (teens: XP), the host
     cheers; wrong answers shake and the host gasps; dialogue lines arrive like chat messages with "typing…";
   - a story trail along the bottom shows the parts of the lesson with the host walking along it;
   - the last slide ends with a celebration of the stars the class earned.

   Safety on 9,500 hand-built slides: entrances use the Web Animations API on the individual transform properties
   (translate / scale / rotate), which compose with each slide's own inline transform and leave nothing behind;
   activity helpers are wrapped, never replaced; everything is in try/catch, so nothing here can stop a class.
   Switch: off until released (window.LUMIO_SLIDE_FX = true turns it on for everyone).
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

  var stage = document.getElementById("stage");
  var content = document.getElementById("stageContent");
  if (!stage || !content) return;

  var RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var LEVEL = qs("level") || "pre-a";
  var NUM = qs("n") || "1";
  var TEEN = /^level[3-6]$/.test(LEVEL);
  var SW = 1467, SH = 825;
  var DECK = (location.pathname.match(/present-trial/) ? "trial-" : "") + LEVEL + "-" + NUM;
  var EASE_IN = TEEN ? "cubic-bezier(.22,.9,.24,1)" : "cubic-bezier(.34,1.56,.64,1)";
  var root = document.documentElement;
  root.classList.add("lc-on", TEEN ? "lc-teen" : "lc-kid");

  /* ---------------- small helpers ---------------- */
  function anim(el, frames, opts) { try { return el.animate(frames, opts); } catch (e) { return null; } }
  function safe(fn) { return function () { try { return fn.apply(this, arguments); } catch (e) { if (window.console) console.warn("Live Class:", e); } }; }
  function rect(el) { return el.getBoundingClientRect(); }
  function sc() { return rect(stage).width / SW || 1; }
  function inStage(el) { var r = rect(el), s = rect(stage), k = s.width / SW || 1; return { x: (r.left - s.left) / k, y: (r.top - s.top) / k, w: r.width / k, h: r.height / k }; }
  function center(el) { var r = rect(el); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
  function mk(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  var slideTok = 0;   // bumps on every slide change: delayed steps of an old slide never run on the new one
  function later(fn, ms) { var t = slideTok; return setTimeout(function () { if (t === slideTok) { try { fn(); } catch (e) {} } }, ms); }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function norm(s) { return String(s || "").toLowerCase().replace(/[‘’']/g, "").replace(/[^a-z0-9]+/g, " ").trim(); }
  function icon(n) { try { return (window.LumioIcons && LumioIcons.svg(n)) || ""; } catch (e) { return ""; } }
  function leaves(rootEl) {   // elements whose text is their own (no element children with text)
    var out = [];
    rootEl.querySelectorAll("div,span,p,b,strong,em,i,h1,h2,h3,h4,button,li").forEach(function (el) {
      if (!(el.textContent || "").trim()) return;
      for (var c = el.firstElementChild; c; c = c.nextElementSibling) if ((c.textContent || "").trim() && c.tagName !== "BR") return;
      out.push(el);
    });
    return out;
  }
  function visible(el) { var r = rect(el); return r.width > 2 && r.height > 2 && getComputedStyle(el).visibility !== "hidden"; }

  /* ---------------- sound: synthesized effects (no files) ---------------- */
  var AC = null, master = null;
  function ac() {
    if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); master = AC.createGain(); master.gain.value = .5; master.connect(AC.destination); } catch (e) { return null; } }
    if (AC.state === "suspended") AC.resume();
    return AC;
  }
  function soundOn() { try { return localStorage.getItem("lumio_sound") !== "off"; } catch (e) { return true; } }
  function tone(f, t0, d, type, v, f2) { var o = AC.createOscillator(), g = AC.createGain(); o.type = type || "sine"; o.frequency.setValueAtTime(f, t0); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + d); g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(v || .2, t0 + .012); g.gain.exponentialRampToValueAtTime(.0001, t0 + d); o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + d + .02); }
  function noise(t0, d, v, f1, f2, q) { var len = Math.max(1, Math.floor(AC.sampleRate * d)), buf = AC.createBuffer(1, len, AC.sampleRate), x = buf.getChannelData(0); for (var i = 0; i < len; i++) x[i] = Math.random() * 2 - 1; var s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain(); s.buffer = buf; f.type = "bandpass"; f.Q.value = q || 1.1; f.frequency.setValueAtTime(f1, t0); if (f2) f.frequency.exponentialRampToValueAtTime(f2, t0 + d); g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(v, t0 + d * .25); g.gain.exponentialRampToValueAtTime(.0001, t0 + d); s.connect(f); f.connect(g); g.connect(master); s.start(t0); s.stop(t0 + d); }
  var SFX = {
    page: function (t) { noise(t, .16, .08, 2600, 900, .7); noise(t + .1, .26, .11, 1400, 500, .6); noise(t + .3, .09, .05, 3200, 2000); },
    cube: function (t) { noise(t, .4, .06, 300, 2600); tone(180, t, .35, "sine", .05, 90); },
    whoosh: function (t) { noise(t, .28, .07, 500, 2400); },
    pop: function (t) { tone(700, t, .09, "sine", .16, 260); },
    bubble: function (t) { tone(520, t, .07, "sine", .1, 900); tone(880, t + .06, .08, "sine", .08, 1200); },
    type: function (t) { tone(1900 + Math.random() * 500, t, .02, "square", .018); },
    tick: function (t) { tone(1500, t, .03, "square", .035); },
    tile: function (t, i) { tone(620 + (i || 0) * 70, t, .12, "triangle", .1); },
    correct: function (t) { [784, 988, 1319].forEach(function (f, i) { tone(f, t + i * .075, .28, "triangle", .14); tone(f * 2, t + i * .075, .16, "sine", .04); }); },
    wrong: function (t) { tone(330, t, .16, "square", .045, 300); tone(247, t + .13, .26, "square", .045, 220); tone(165, t, .4, "sine", .1, 140); },
    star: function (t) { [1568, 2093, 2637, 3136].forEach(function (f, i) { tone(f, t + i * .045, .3, "sine", .06); }); },
    coin: function (t) { tone(988, t, .08, "square", .05); tone(1319, t + .07, .28, "square", .05); },
    flip: function (t) { noise(t, .12, .06, 900, 3400); },
    boom: function (t) { tone(140, t, .5, "sine", .26, 50); noise(t, .3, .1, 300, 90); },
    drum: function (t) { for (var i = 0; i < 14; i++) noise(t + i * .045, .05, .05 + i * .006, 180, 120, .8); },
    magic: function (t) { [1047, 1319, 1568, 2093, 2637, 3136, 4186].forEach(function (f, i) { tone(f, t + i * .05, .5, "sine", .05); }); noise(t, .6, .03, 6000, 9000); },
    tada: function (t) { [523, 659, 784].forEach(function (f) { tone(f, t, .18, "triangle", .1); }); [523, 659, 784, 1047].forEach(function (f) { tone(f, t + .2, .9, "triangle", .11); tone(f * 2, t + .2, .5, "sine", .03); }); },
    win: function (t) { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, t + i * .11, .45, "triangle", .13); }); },
    clap: function (t) { for (var i = 0; i < 26; i++) noise(t + i * .06 + Math.random() * .05, .05, .05 + Math.random() * .05, 1500 + Math.random() * 1500, 0, .9); },
    rise: function (t) { tone(300, t, .5, "sine", .06, 1200); noise(t, .5, .03, 800, 5000); }
  };
  function sfx(n, i) { if (!soundOn()) return; var c = ac(); if (!c || !SFX[n]) return; try { SFX[n](c.currentTime + .005, i); } catch (e) {} }
  document.addEventListener("pointerdown", function () { ac(); }, { once: true, capture: true });

  /* ---------------- particles over the whole window ---------------- */
  var cv = mk("canvas", "lc-canvas"); document.body.appendChild(cv);
  var cx = cv.getContext("2d"), parts = [], raf = 0, dpr = 1;
  function size() { dpr = Math.min(2, devicePixelRatio || 1); cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  size(); addEventListener("resize", size);
  var COLS = TEEN ? ["#A78BFA", "#38BDF8", "#F472B6", "#FDE68A", "#FFFFFF", "#34D399"] : ["#FFC93C", "#F97316", "#22C55E", "#3BA0FF", "#FF5C8A", "#A06BFF"];
  var GOLD = ["#FFD666", "#FFB300", "#FFFFFF", "#FFE9A8"];
  function starPath(r) { cx.beginPath(); for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * .45 : r; cx.lineTo(Math.cos(a) * q, Math.sin(a) * q); } cx.closePath(); }
  function loop() {
    cx.clearRect(0, 0, innerWidth, innerHeight);
    parts = parts.filter(function (p) { return p.life > 0; });
    parts.forEach(function (p) {
      p.vy += p.g; p.vx *= p.drag || .985; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life--;
      cx.save(); cx.globalAlpha = Math.min(1, p.life / 25); cx.translate(p.x, p.y); cx.rotate(p.rot); cx.fillStyle = p.c;
      if (p.t === "ring") { cx.strokeStyle = p.c; cx.lineWidth = 5 * p.life / p.max; cx.beginPath(); cx.arc(0, 0, p.r0 + (p.max - p.life) * p.sp, 0, 6.28); cx.stroke(); }
      else if (p.t === "star") { starPath(p.s); cx.fill(); }
      else if (p.t === "dot") { cx.beginPath(); cx.arc(0, 0, p.s, 0, 6.28); cx.fill(); }
      else { cx.scale(1, Math.cos(p.rot * 2)); cx.fillRect(-p.s, -p.s * .5, p.s * 2, p.s); }
      cx.restore();
    });
    raf = parts.length ? requestAnimationFrame(loop) : 0;
  }
  function kick() { if (!raf) raf = requestAnimationFrame(loop); }
  function burst(x, y, o) {
    if (RM) return; o = o || {};
    var n = o.n || 28, sp = o.speed || 8, cols = o.cols || COLS;
    for (var i = 0; i < n; i++) { var a = Math.random() * 6.28, v = sp * (.35 + Math.random() * .65); parts.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2, g: .22, rot: Math.random() * 6, vr: (Math.random() - .5) * .5, s: 4 + Math.random() * 5, c: cols[i % cols.length], t: o.shape || (i % 2 ? "star" : "rect"), life: 45 + Math.random() * 30 }); }
    if (o.ring !== false) parts.push({ t: "ring", x: x, y: y, vx: 0, vy: 0, g: 0, rot: 0, vr: 0, r0: 16, sp: 3.6, c: o.ring || "#FFD666", life: 24, max: 24 });
    kick();
  }
  function rain(n) {   // confetti falling over the whole screen
    if (RM) return;
    for (var i = 0; i < (n || 120); i++) parts.push({ x: Math.random() * innerWidth, y: -20 - Math.random() * innerHeight * .5, vx: (Math.random() - .5) * 2, vy: 2 + Math.random() * 3, g: .05, drag: .995, rot: Math.random() * 6, vr: (Math.random() - .5) * .3, s: 5 + Math.random() * 5, c: COLS[i % COLS.length], t: i % 3 ? "rect" : "star", life: 150 + Math.random() * 60 });
    kick();
  }
  function firework(x, y) {
    if (RM) return;
    var cols = [pick(COLS), "#FFFFFF", pick(GOLD)];
    for (var i = 0; i < 46; i++) { var a = i / 46 * 6.28, v = 6 + Math.random() * 2.5; parts.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: .09, drag: .965, rot: 0, vr: 0, s: 2.6, c: cols[i % 3], t: "dot", life: 60 + Math.random() * 25 }); }
    kick();
  }
  function trailDot(x, y, c) { parts.push({ x: x, y: y, vx: (Math.random() - .5) * .8, vy: (Math.random() - .5) * .8, g: .02, rot: 0, vr: 0, s: 2 + Math.random() * 2.5, c: c || "#FFE27A", t: "dot", life: 22 }); kick(); }

  /* ---------------- stage layers: overlay (bubbles, hints), HUD (trail + star jar) ---------------- */
  var layer = mk("div", "lc-layer"); stage.appendChild(layer);
  var navRow = document.getElementById("navRow"), nextBtn = document.getElementById("nextBtn"), prevBtn = document.getElementById("prevBtn");
  var hud = mk("div", "lc-hud");
  var trail = mk("div", "lc-trail", '<div class="lc-track"><i class="lc-fill"></i></div><div class="lc-stops"></div><div class="lc-me"><img alt=""></div>');
  var HOST_FACE = "assets/story/characters/" + (TEEN ? "lumi-teen-happy.png" : "lumi-thumbs.png");
  trail.querySelector(".lc-me img").src = HOST_FACE;
  var jar = mk("button", "lc-jar", '<span class="lc-jarIco">' + (TEEN ? icon("bolt") : icon("star")) + '</span><b class="lc-jarN">0</b><small>' + (TEEN ? "XP" : "stars") + '</small>');
  jar.type = "button"; jar.title = TEEN ? "Class XP earned this lesson" : "Stars the class earned this lesson";
  hud.appendChild(trail); hud.appendChild(jar);
  if (navRow && nextBtn) navRow.insertBefore(hud, nextBtn); else stage.appendChild(hud);
  var JAR_KEY = "lumio_lc_jar_" + DECK, jarN = 0;
  try { jarN = Number(sessionStorage.getItem(JAR_KEY) || 0) || 0; } catch (e) {}
  function jarText() { return TEEN ? String(jarN * 100) : String(jarN); }
  jar.querySelector(".lc-jarN").textContent = jarText();
  jar.onclick = function () { var c = center(jar); burst(c.x, c.y, { n: 18, cols: GOLD, shape: "star" }); sfx("star"); };
  function addJar(fromEl) {
    var done = function () {
      jarN++; try { sessionStorage.setItem(JAR_KEY, String(jarN)); } catch (e) {}
      jar.querySelector(".lc-jarN").textContent = jarText();
      anim(jar, [{ scale: 1 }, { scale: 1.35 }, { scale: .92 }, { scale: 1 }], { duration: 650, easing: "cubic-bezier(.34,1.56,.64,1)" });
      var c = center(jar); burst(c.x, c.y, { n: 14, speed: 5, cols: GOLD, shape: "star" }); sfx("coin");
    };
    if (RM || !fromEl) { done(); return; }
    var a = center(fromEl), b = center(jar);
    var s = mk("div", "lc-flystar", TEEN ? icon("bolt") : icon("star")); document.body.appendChild(s);
    var mx = (a.x + b.x) / 2 + (Math.random() - .5) * 200, my = Math.min(a.y, b.y) - 160, t0 = performance.now(), D = 900;
    sfx("rise");
    (function step(now) {
      var t = Math.min(1, (now - t0) / D), e = t * t * (3 - 2 * t);
      var x = (1 - e) * (1 - e) * a.x + 2 * (1 - e) * e * mx + e * e * b.x, y = (1 - e) * (1 - e) * a.y + 2 * (1 - e) * e * my + e * e * b.y;
      s.style.transform = "translate(" + x + "px," + y + "px) rotate(" + (t * 540) + "deg) scale(" + (1.6 - t * .9) + ")";
      if (Math.random() < .7) trailDot(x, y, TEEN ? "#A5F3FC" : "#FFE27A");
      if (t < 1) requestAnimationFrame(step); else { s.remove(); done(); }
    })(t0);
  }

  /* ---------------- the lesson map: titles of every slide, read once in the background ---------------- */
  var SECTIONS = [
    { k: "quiz", rx: /quiz|check|test/i, label: TEEN ? "Quiz" : "Quiz Time!", icon: "question", say: TEEN ? ["Quiz time. Show what you know."] : ["Quiz time! You can do it!"] },
    { k: "game", rx: /game|play/i, label: TEEN ? "Game On" : "Game Time!", icon: "pad", say: TEEN ? ["Game on!"] : ["Game time! Let's play!"] },
    { k: "end", rx: /goodbye|bye|great job|well done|homework|see you|badge|champion|summary|wrap/i, label: TEEN ? "Wrap-up" : "Great Job!", icon: "trophy", say: TEEN ? ["Great work today."] : ["You did it! Great job!"] },
    { k: "words", rx: /new word|new verb|new phrase|new expression|vocab|word|meet the/i, label: TEEN ? "New Words" : "New Words!", icon: "cards", say: TEEN ? ["New words. Let's go."] : ["Look! New words!"] },
    { k: "phon", rx: /phonic|sound|letter|abc|spell|listen/i, label: TEEN ? "Sounds" : "Sound Time!", icon: "sound", say: TEEN ? ["Listen closely."] : ["Listen to the sounds!"] },
    { k: "gram", rx: /grammar|rule|pattern|sentence|tense|form/i, label: TEEN ? "Grammar" : "Grammar Fun!", icon: "puzzle", say: TEEN ? ["Grammar time. Let's build it."] : ["Let's build sentences!"] },
    { k: "talk", rx: /dialog|chat|conversation|talk|role|scene|story|read/i, label: TEEN ? "Let's Talk" : "Let's Talk!", icon: "speech", say: TEEN ? ["Let's talk."] : ["Let's talk together!"] },
    { k: "prac", rx: /practice|builder|match|your turn|challenge|discussion|write|unscramble|spot/i, label: TEEN ? "Practice" : "Your Turn!", icon: "pencil", say: TEEN ? ["Your turn."] : ["Your turn! Let's try!"] },
    { k: "warm", rx: /warm|recap|remember|review/i, label: TEEN ? "Warm-up" : "Warm Up!", icon: "flame", say: TEEN ? ["Let's warm up."] : ["Let's warm up!"] },
    { k: "start", rx: /goal|let.?s learn|welcome|today|hello/i, label: TEEN ? "Let's Begin" : "Let's Begin!", icon: "sun", say: TEEN ? ["Hey everyone. Ready?"] : ["Hello, class! Are you ready?"] }
  ];
  function decode(s) { var t = document.createElement("textarea"); t.innerHTML = s; return t.value; }
  function titleOfHtml(html) {
    var m = /class="pagetitle"[^>]*>([^<]+)</.exec(html);
    if (!m) m = />\s*([A-Z][^<>]{1,40}?\s(?:&middot;|·|&bull;|•)\s[^<>]{1,50}?)\s*</.exec(html);
    return m ? decode(m[1]).replace(/\s+/g, " ").trim() : "";
  }
  function sectionOf(title) {
    var cat = String(title || "").split(/\s[·•]\s/)[0];
    for (var i = 0; i < SECTIONS.length; i++) if (SECTIONS[i].rx.test(cat)) return SECTIONS[i];
    return null;
  }
  var deckMap = null, castNames = [];
  function slideUrl(n) {
    var trialM = location.pathname.match(/present-trial/);
    if (trialM) return null;   // trial decks: read titles from the live slide only
    return "slide-content" + (qs("deck") === "3" ? "-v3" : "") + "/" + LEVEL + "/" + String(NUM).padStart(2, "0") + "/slide-" + String(n).padStart(2, "0") + ".html";
  }
  function buildMap(total) {
    if (deckMap || !total || !slideUrl(1)) return;
    deckMap = [];
    var idx = []; for (var i = 1; i <= total; i++) idx.push(i);
    var seen = {};
    var batch = function (k) {
      var nums = idx.slice(k, k + 10); if (!nums.length) { drawStops(total); return; }
      Promise.all(nums.map(function (n) { return fetch(slideUrl(n)).then(function (r) { return r.ok ? r.text() : ""; }).catch(function () { return ""; }); }))
        .then(function (texts) {
          texts.forEach(function (h, j) {
            var sec = sectionOf(titleOfHtml(h)); deckMap[nums[j]] = sec ? sec.k : null;
            var re = /characters\/([a-z]+)(-teen)?-[a-z-]+\.png/g, m;
            while ((m = re.exec(h))) { var nm = m[1] + (m[2] || ""); if (!seen[nm]) { seen[nm] = 1; castNames.push(nm); } }
          });
          batch(k + 10);
        });
    };
    batch(0);
  }
  function drawStops(total) {
    var box = trail.querySelector(".lc-stops"); box.innerHTML = "";
    var last = null, placed = [];
    for (var i = 1; i <= total; i++) {
      var k = deckMap[i]; if (!k || k === last) continue; last = k;
      if (placed.some(function (p) { return p.k === k; })) continue;
      var sec = SECTIONS.filter(function (s) { return s.k === k; })[0]; if (!sec) continue;
      var pos = total > 1 ? (i - 1) / (total - 1) : 0;
      if (placed.length && pos - placed[placed.length - 1].pos < .045) continue;
      placed.push({ k: k, pos: pos });
      var st = mk("div", "lc-stop", icon(sec.icon)); st.style.left = (pos * 100) + "%"; st.title = sec.label; st.dataset.at = String(i);
      box.appendChild(st);
    }
    moveTrail();
  }
  function curN() { try { return typeof cur !== "undefined" ? cur : 1; } catch (e) { return 1; } }
  function totN() { try { return typeof total !== "undefined" ? total : 1; } catch (e) { return 1; } }
  function moveTrail() {
    var t = totN(), c = curN(), p = t > 1 ? (c - 1) / (t - 1) : 0;
    trail.querySelector(".lc-fill").style.width = (p * 100) + "%";
    trail.querySelector(".lc-me").style.left = (p * 100) + "%";
    trail.querySelectorAll(".lc-stop").forEach(function (s) { s.classList.toggle("done", Number(s.dataset.at) <= c); });
  }

  /* ---------------- host character: the slide's own character, or the face on the trail ---------------- */
  var host = null, hostSrc = "", bubbleEl = null, bubbleTimer = 0;
  // a character's height on the slide, even before its picture has loaded (slides give it an inline height)
  function charH(im) { var b = inStage(im), m = /height:\s*(\d+)px/.exec(im.getAttribute("style") || ""); return Math.max(b.h, m ? Number(m[1]) : 0); }
  function findHost() {
    var best = null, bh = 0;
    content.querySelectorAll("img.char, img[src*='characters/']").forEach(function (im) {
      if (getComputedStyle(im).display === "none") return; var h = charH(im);
      if (h >= 150 && h > bh && !isChatRow(im.parentElement || im)) { best = im; bh = h; }
    });
    return best;
  }
  function getHost() { if (!host || !host.isConnected) { host = findHost(); hostSrc = host ? host.getAttribute("src") : ""; } return host; }
  function charBase(src) { var m = /characters\/([a-z]+(?:-teen)?)-([a-z-]+)\.png/.exec(src || ""); return m ? m[1] : null; }
  var POSE_ALT = { think: "surprised" };
  function pose(p, ms) {
    var face = trail.querySelector(".lc-me img");
    var target = getHost() || face;
    if (!target) return;
    var base = charBase(target.getAttribute("src")); if (!base) return;
    var orig = target === host ? hostSrc : HOST_FACE;
    var want = "assets/story/characters/" + base + "-" + p + ".png";
    var im = new Image();
    im.onload = function () {
      target.src = want;
      anim(target, [{ scale: "1 1" }, { scale: "1.08 .9" }, { scale: ".96 1.06" }, { scale: "1 1" }], { duration: 520, easing: "cubic-bezier(.34,1.56,.64,1)" });
      clearTimeout(target._lcPose);
      target._lcPose = setTimeout(function () { if (target.isConnected) target.src = orig; }, ms || 1900);
    };
    im.onerror = function () { if (POSE_ALT[p]) pose(POSE_ALT[p], ms); };
    im.src = want;
  }
  function say(text, ms) {
    if (!text) return;
    if (bubbleEl) bubbleEl.remove(); clearTimeout(bubbleTimer);
    var b = mk("div", "lc-bubble"), span = mk("span"); b.appendChild(span); layer.appendChild(b);
    var anchor = getHost(), ab;
    if (anchor && anchor.isConnected) ab = inStage(anchor);
    else { anchor = trail.querySelector(".lc-me"); ab = inStage(anchor); b.classList.add("lc-low"); }
    span.textContent = text;
    var bw = Math.min(460, Math.max(160, text.length * 17 + 60));
    b.style.width = bw + "px";
    var bb = b.getBoundingClientRect(), bhh = bb.height / sc();
    var x = ab.x + ab.w / 2 - bw * .75, y = ab.y - bhh - 14;
    if (b.classList.contains("lc-low")) { x = ab.x + ab.w / 2 - bw / 2; y = ab.y - bhh - 18; }
    x = Math.max(16, Math.min(SW - bw - 16, x)); y = Math.max(90, y);
    b.style.left = x + "px"; b.style.top = y + "px";
    b.style.setProperty("--tail", Math.max(24, Math.min(bw - 40, ab.x + ab.w / 2 - x)) + "px");
    bubbleEl = b; sfx("bubble");
    if (!RM) {
      anim(b, [{ opacity: 0, scale: .4, translate: "0 20px" }, { opacity: 1, scale: 1, translate: "0 0" }], { duration: 420, easing: "cubic-bezier(.34,1.56,.64,1)" });
      span.textContent = ""; var i = 0;
      var iv = setInterval(function () { if (!b.isConnected) { clearInterval(iv); return; } i++; span.textContent = text.slice(0, i); if (i % 3 === 0) sfx("type"); if (i >= text.length) clearInterval(iv); }, 28);
    }
    bubbleTimer = setTimeout(function () {
      if (!b.isConnected) return;
      var a = anim(b, [{ opacity: 1, scale: 1 }, { opacity: 0, scale: .7 }], { duration: 260, easing: "ease-in" });
      if (a) a.onfinish = function () { b.remove(); }; else b.remove();
    }, ms || Math.max(2600, text.length * 75));
  }

  /* ---------------- next button: "ready" glow + build steps (reveal before moving on) ---------------- */
  var pendingBuild = null, nextLabel = nextBtn ? nextBtn.innerHTML : "";
  function setBuild(fn, label) {
    pendingBuild = fn;
    if (nextBtn) { nextBtn.innerHTML = label; nextBtn.classList.add("lc-build"); }
  }
  function clearBuild() { pendingBuild = null; if (nextBtn) { nextBtn.innerHTML = nextLabel; nextBtn.classList.remove("lc-build"); } }
  function ready() { if (nextBtn && !nextBtn.disabled) nextBtn.classList.add("lc-ready"); }
  document.addEventListener("click", function (e) {
    if (!pendingBuild || !e.target.closest || !e.target.closest("#nextBtn")) return;
    e.stopImmediatePropagation(); e.preventDefault();
    var f = pendingBuild; clearBuild(); safe(f)();
  }, true);

  /* ---------------- transitions: a real page turn (kids) / a cube turn (teens) ---------------- */
  var ghost = null, lastDir = 1, firstLoad = true, prevN = 0;
  function makeGhost(dir) {
    if (!content.firstChild || firstLoad || content.querySelector("#loadingMsg")) return;
    if (ghost) ghost.remove();
    ghost = content.cloneNode(true);
    ghost.removeAttribute("id"); ghost.className = "lc-ghost";
    ghost.querySelectorAll("[id]").forEach(function (n) { n.removeAttribute("id"); });
    ghost.appendChild(mk("div", "lc-shade"));
    ghost.appendChild(mk("div", "lc-gloss"));
    content.parentNode.insertBefore(ghost, layer);
    lastDir = dir;
  }
  if (typeof window.loadSlide === "function") {
    var origLoad = window.loadSlide;
    window.loadSlide = function (n) {
      try { var c = curN(); makeGhost(n >= c ? 1 : -1); } catch (e) {}
      return origLoad.apply(this, arguments);
    };
  }
  function turnPage(dir) {
    if (!ghost) return;
    var g = ghost; ghost = null;
    if (RM) { g.remove(); return; }
    var sh = g.querySelector(".lc-shade"), gl = g.querySelector(".lc-gloss");
    if (TEEN) {
      g.style.transformOrigin = dir > 0 ? "0% 50%" : "100% 50%";
      sfx("cube");
      var a = anim(g, [{ transform: "perspective(2000px) rotateY(0deg)", opacity: 1 }, { transform: "perspective(2000px) rotateY(" + (dir > 0 ? -90 : 90) + "deg)", opacity: .6 }], { duration: 640, easing: "cubic-bezier(.55,.05,.35,1)", fill: "forwards" });
      anim(sh, [{ opacity: 0 }, { opacity: .85 }], { duration: 640, fill: "forwards" });
      content.style.transformOrigin = dir > 0 ? "100% 50%" : "0% 50%";
      anim(content, [{ transform: "perspective(2000px) rotateY(" + (dir > 0 ? 90 : -90) + "deg)", filter: "brightness(.5)" }, { transform: "perspective(2000px) rotateY(0deg)", filter: "brightness(1)" }], { duration: 640, easing: "cubic-bezier(.55,.05,.35,1)" });
      var streak = mk("div", "lc-streak"); layer.appendChild(streak);
      anim(streak, [{ translate: (dir > 0 ? "-120%" : "120%") + " 0", opacity: 0 }, { opacity: 1, offset: .4 }, { translate: (dir > 0 ? "120%" : "-120%") + " 0", opacity: 0 }], { duration: 760, easing: "ease-in-out" });
      setTimeout(function () { streak.remove(); }, 800);
      if (a) a.onfinish = function () { g.remove(); }; else g.remove();
      return;
    }
    // kids: the old page lifts at the spine and turns over, showing the new page underneath
    g.style.transformOrigin = dir > 0 ? "0% 50%" : "100% 50%";
    sfx("page");
    var turn = anim(g, [
      { transform: "perspective(2200px) rotateY(0deg)", boxShadow: "0 0 0 rgba(0,0,0,0)" },
      { transform: "perspective(2200px) rotateY(" + (dir > 0 ? -55 : 55) + "deg)", boxShadow: (dir > 0 ? "-" : "") + "40px 30px 60px rgba(40,20,0,.45)", offset: .55 },
      { transform: "perspective(2200px) rotateY(" + (dir > 0 ? -95 : 95) + "deg)", boxShadow: "0 0 0 rgba(0,0,0,0)" }
    ], { duration: 760, easing: "cubic-bezier(.45,.05,.4,1)", fill: "forwards" });
    anim(sh, [{ opacity: 0 }, { opacity: .25, offset: .4 }, { opacity: .7 }], { duration: 760, fill: "forwards" });
    anim(gl, [{ opacity: 0, translate: "-40% 0" }, { opacity: .9, offset: .45 }, { opacity: 0, translate: "40% 0" }], { duration: 760, fill: "forwards" });
    anim(content, [{ filter: "brightness(.72)" }, { filter: "brightness(1)" }], { duration: 760, easing: "ease-out" });
    if (turn) turn.onfinish = function () { g.remove(); }; else g.remove();
  }

  /* ---------------- living backdrop: the painting breathes, dust / stars float over it ---------------- */
  var motesRaf = 0;
  function backdrop() {
    var kids = Array.prototype.slice.call(content.children), bg = null, after = null;
    var v3 = content.querySelector(".v3");
    if (v3) { kids = Array.prototype.slice.call(v3.children); bg = v3.querySelector(".v3-bg"); after = v3.querySelector(".v3-shade") || bg; }
    else
    for (var i = 0; i < kids.length && i < 6; i++) {
      var el = kids[i], st = el.getAttribute("style") || "";
      if (/inset:\s*0|width:\s*100%/.test(st) && !(el.textContent || "").trim()) { if (!bg && /url\(/.test(st)) bg = el; after = el; } else if (after) break;
    }
    if (bg && !RM) anim(bg, [{ scale: 1, translate: "0 0" }, { scale: 1.07, translate: "-14px -8px" }], { duration: 16000, iterations: Infinity, direction: "alternate", easing: "ease-in-out" });
    var c = mk("canvas", "lc-motes"); c.width = SW; c.height = SH;
    if (after && after.nextSibling) after.parentNode.insertBefore(c, after.nextSibling); else content.insertBefore(c, content.firstChild);
    if (RM) return;
    var g = c.getContext("2d"), N = TEEN ? 46 : 34, ms = [];
    for (var j = 0; j < N; j++) ms.push({ x: Math.random() * SW, y: Math.random() * SH, r: TEEN ? .6 + Math.random() * 1.6 : 1.2 + Math.random() * 2.8, vx: (Math.random() - .5) * .25, vy: TEEN ? (Math.random() - .5) * .1 : -.12 - Math.random() * .3, ph: Math.random() * 6.28, sp: .01 + Math.random() * .03 });
    var orbs = TEEN ? [0, 1, 2].map(function (k) { return { x: Math.random() * SW, y: Math.random() * SH, r: 160 + k * 60, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .25, c: ["139,92,246", "56,189,248", "244,114,182"][k] }; }) : [];
    cancelAnimationFrame(motesRaf);
    (function draw() {
      if (!c.isConnected) return;
      g.clearRect(0, 0, SW, SH);
      orbs.forEach(function (o) { o.x += o.vx; o.y += o.vy; if (o.x < -o.r || o.x > SW + o.r) o.vx *= -1; if (o.y < -o.r || o.y > SH + o.r) o.vy *= -1; var gr = g.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r); gr.addColorStop(0, "rgba(" + o.c + ",.16)"); gr.addColorStop(1, "rgba(" + o.c + ",0)"); g.fillStyle = gr; g.fillRect(o.x - o.r, o.y - o.r, o.r * 2, o.r * 2); });
      ms.forEach(function (m) {
        m.x += m.vx; m.y += m.vy; m.ph += m.sp;
        if (m.y < -10) { m.y = SH + 10; m.x = Math.random() * SW; } if (m.x < -10) m.x = SW + 10; if (m.x > SW + 10) m.x = -10; if (m.y > SH + 10) m.y = -10;
        var a = .25 + .55 * (.5 + .5 * Math.sin(m.ph));
        g.globalAlpha = a; g.fillStyle = TEEN ? "#E0E7FF" : "#FFE7A3";
        g.beginPath(); g.arc(m.x, m.y, m.r, 0, 6.28); g.fill();
        if (!TEEN && m.r > 3) { g.globalAlpha = a * .25; g.beginPath(); g.arc(m.x, m.y, m.r * 3, 0, 6.28); g.fill(); }
      });
      g.globalAlpha = 1;
      motesRaf = requestAnimationFrame(draw);
    })();
  }

  /* ---------------- entrance choreography ---------------- */
  function isBgBlock(el, w, h) {
    if (el.matches(".spark,.dots,.colorstrip,.header,.floorshadow,.char,.lc-motes")) return false;
    var big = w * h > SW * SH * .55, text = (el.textContent || "").trim().length;
    return (big && text < 3 && !el.querySelector("img,button,[onclick]")) || (el.tagName.toLowerCase() === "svg" && big);
  }
  function blocksOf(rootEl) {
    var s = sc(), out = [];
    (function walk(node, depth) {
      Array.prototype.forEach.call(node.children, function (el) {
        if (el.matches("script,style,link,canvas,.lc-ghost")) return;
        var r = rect(el), w = r.width / s, h = r.height / s;
        if (w < 4 || h < 4 || getComputedStyle(el).display === "none") return;
        if (isBgBlock(el, w, h)) return;
        if (el.matches(".spark,.dots,.colorstrip,.header,.floorshadow,.char")) return;
        if (depth < 2 && w * h > SW * SH * .3 && el.children.length > 1 && !el.matches(".card,button,[onclick]")) { walk(el, depth + 1); return; }
        out.push({ el: el, top: r.top, left: r.left });
      });
    })(rootEl, 0);
    out.sort(function (a, b) { return Math.abs(a.top - b.top) > 40 * s ? a.top - b.top : a.left - b.left; });
    return out.map(function (o) { return o.el; });
  }
  function isChatRow(el) {
    if (!el || !el.querySelector) return false;
    var img = el.querySelector("img[src*='characters/']");
    var b = inStage(el);
    return !!img && (el.textContent || "").trim().length > 8 && b.h < 220 && b.w > 300;
  }
  var idle = [];
  function stopIdle() { idle.forEach(function (a) { try { a.cancel(); } catch (e) {} }); idle = []; }
  function enter(dir) {
    stopIdle();
    if (RM) { anim(content, [{ opacity: 0 }, { opacity: 1 }], { duration: 160 }); return; }
    var t = 160;
    var header = content.querySelector(".header");
    if (header) anim(header, [{ opacity: 0, translate: "0 -40px" }, { opacity: 1, translate: "0 0" }], { duration: 520, delay: 60, easing: EASE_IN, fill: "backwards" });
    content.querySelectorAll(".dots,.colorstrip").forEach(function (b) { anim(b, [{ opacity: 0, scale: "0 1" }, { opacity: 1, scale: "1 1" }], { duration: 600, delay: 200, easing: "cubic-bezier(.2,.9,.3,1)", fill: "backwards" }); });
    var blocks = blocksOf(content), chat = blocks.filter(isChatRow);
    var k = 0;
    blocks.forEach(function (b) {
      if (chat.indexOf(b) !== -1) return;
      var d = t + k * 90; k++;
      anim(b, TEEN
        ? [{ opacity: 0, translate: "0 34px", filter: "blur(6px)" }, { opacity: 1, translate: "0 0", filter: "blur(0)" }]
        : [{ opacity: 0, translate: "0 60px", scale: .86, rotate: (k % 2 ? -2 : 2) + "deg" }, { opacity: 1, translate: "0 0", scale: 1, rotate: "0deg" }],
        { duration: TEEN ? 620 : 720, delay: d, easing: EASE_IN, fill: "backwards" });
      b.querySelectorAll("img:not([src*='logo'])").forEach(function (im, j) {
        if (im.closest(".char") || im.classList.contains("char")) return;
        anim(im, [{ opacity: 0, scale: .5, rotate: (TEEN ? 0 : -8) + "deg" }, { opacity: 1, scale: 1, rotate: "0deg" }], { duration: 760, delay: d + 180 + j * 70, easing: EASE_IN, fill: "backwards" });
        sweep(im, d + 900);
      });
      tilesIn(b).forEach(function (tile, j) {
        anim(tile, [{ opacity: 0, translate: "0 -60px", scale: .4, rotate: "-20deg" }, { opacity: 1, translate: "0 0", scale: 1, rotate: "0deg" }], { duration: 560, delay: d + 300 + j * 70, easing: "cubic-bezier(.34,1.8,.64,1)", fill: "backwards" });
      });
      b.querySelectorAll("button,[onclick]").forEach(function (btn, j) { if (btn === b) return; anim(btn, [{ opacity: 0, scale: .6 }, { opacity: 1, scale: 1 }], { duration: 480, delay: d + 340 + j * 50, easing: EASE_IN, fill: "backwards" }); });
    });
    // dialogue lines arrive like chat messages, each after a short "typing…"
    chat.forEach(function (row, i) {
      var at = 420 + i * 900, b = inStage(row), fromLeft = b.x + b.w / 2 < SW / 2;
      anim(row, [{ opacity: 0 }, { opacity: 0 }], { duration: at + 380, fill: "backwards" });
      later(safe(function () {
        if (!row.isConnected) return;
        var ty = mk("div", "lc-typing", "<i></i><i></i><i></i>"); ty.style.left = (fromLeft ? b.x + 70 : b.x + b.w - 150) + "px"; ty.style.top = (b.y + b.h / 2 - 22) + "px"; layer.appendChild(ty);
        setTimeout(function () { ty.remove(); if (!row.isConnected) return; sfx("pop"); anim(row, [{ opacity: 0, translate: (fromLeft ? -50 : 50) + "px 14px", scale: .85 }, { opacity: 1, translate: "0 0", scale: 1 }], { duration: 520, easing: "cubic-bezier(.34,1.56,.64,1)" }); }, 380);
      }), at);
    });
    // the host jumps in, then keeps breathing
    content.querySelectorAll(".char, img[src*='characters/']").forEach(function (ch) {
      if (chat.some(function (row) { return row.contains(ch); })) return;
      var b = inStage(ch); if (charH(ch) < 150) return;
      var fromRight = b.x + b.w / 2 > SW / 2 || (/right:/.test(ch.getAttribute("style") || ""));
      var a = anim(ch, [{ opacity: 0, translate: (fromRight ? 220 : -220) + "px 140px", rotate: (fromRight ? 12 : -12) + "deg" }, { opacity: 1, translate: (fromRight ? -10 : 10) + "px -40px", rotate: "0deg", offset: .6 }, { opacity: 1, translate: "0 6px", scale: "1.06 .92", offset: .8 }, { opacity: 1, translate: "0 0", scale: "1 1" }], { duration: 1000, delay: 380, easing: "cubic-bezier(.3,.8,.4,1)", fill: "backwards" });
      var start = function () { var br = anim(ch, [{ scale: "1 1", translate: "0 0", rotate: "-1deg" }, { scale: "1.015 1.035", translate: "0 -5px", rotate: "1deg" }], { duration: 1600, iterations: Infinity, direction: "alternate", easing: "ease-in-out" }); if (br) idle.push(br); };
      if (a) a.onfinish = start; else start();
    });
    content.querySelectorAll(".spark").forEach(function (sp, i) { var a = anim(sp, [{ opacity: .15, scale: .7, rotate: "0deg" }, { opacity: .9, scale: 1.25, rotate: "45deg" }], { duration: 1400 + i * 300, iterations: Infinity, direction: "alternate", easing: "ease-in-out", delay: i * 200 }); if (a) idle.push(a); });
  }
  function tilesIn(b) {
    var s = sc();
    return Array.prototype.filter.call(b.querySelectorAll("div,span"), function (d) { var r = rect(d); return d.children.length === 0 && /^[A-Za-z]$/.test((d.textContent || "").trim()) && r.width / s < 90 && r.height / s < 90 && r.width / s > 24; });
  }
  function sweep(im, delay) {
    var box = im.parentElement; if (!box || RM) return;
    if (getComputedStyle(box).position === "static") box.style.position = "relative";
    if (getComputedStyle(box).overflow !== "hidden") return;
    var s = mk("div", "lc-sweep"); box.appendChild(s);
    anim(s, [{ translate: "-120% 0" }, { translate: "120% 0" }], { duration: 1100, delay: delay || 0, easing: "ease-in-out", fill: "both" });
    setTimeout(function () { s.remove(); }, (delay || 0) + 1200);
  }

  /* ---------------- chapter card: opens each new part of the lesson ---------------- */
  var shownSections = {};
  try { shownSections = JSON.parse(sessionStorage.getItem("lumio_lc_parts_" + DECK) || "{}") || {}; } catch (e) {}
  function castFor(n) {
    var list = castNames.length ? castNames.slice() : (TEEN ? ["noor-teen", "omar-teen", "sara-teen"] : ["lumi", "sara", "omar"]);
    if (list.indexOf(TEEN ? "lumi-teen" : "lumi") === -1) list.unshift(TEEN ? "lumi-teen" : "lumi");
    return list.slice(0, n);
  }
  function chapterCard(sec) {
    return new Promise(function (resolve) {
      if (RM) { resolve(); return; }
      var ov = mk("div", "lc-chapter");
      var letters = sec.label.split("").map(function (ch, i) { return '<span style="--i:' + i + '">' + (ch === " " ? "&nbsp;" : ch.replace(/[<>&]/g, "")) + "</span>"; }).join("");
      var cast = castFor(2);
      ov.innerHTML = '<div class="lc-chBg"></div><div class="lc-chIn"><div class="lc-chIco">' + icon(sec.icon) + '</div><div class="lc-chTitle">' + letters + '</div><div class="lc-chSub">' + (TEEN ? "Lesson " + NUM : "Lesson " + NUM + " &middot; let's go!") + '</div></div>' +
        cast.map(function (c, i) { return '<img class="lc-chCast lc-c' + i + '" alt="" src="assets/story/characters/' + c + "-" + (i === 0 ? "celebrate" : "thumbs") + '.png">'; }).join("");
      layer.appendChild(ov);
      ov.querySelectorAll(".lc-chCast").forEach(function (im) { im.onerror = function () { im.remove(); }; });
      sfx("drum"); setTimeout(function () { sfx("tada"); rain(TEEN ? 50 : 110); }, 600);
      anim(ov.querySelector(".lc-chBg"), [{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: "both" });
      anim(ov.querySelector(".lc-chIco"), [{ opacity: 0, scale: .2, rotate: "-30deg" }, { opacity: 1, scale: 1.15, rotate: "8deg", offset: .7 }, { opacity: 1, scale: 1, rotate: "0deg" }], { duration: 700, delay: 120, easing: "ease-out", fill: "both" });
      ov.querySelectorAll(".lc-chTitle span").forEach(function (s, i) {
        anim(s, TEEN ? [{ opacity: 0, translate: "0 40px", filter: "blur(10px)" }, { opacity: 1, translate: "0 0", filter: "blur(0)" }]
          : [{ opacity: 0, translate: "0 -140px", scale: .3 }, { opacity: 1, translate: "0 12px", scale: 1.1, offset: .7 }, { opacity: 1, translate: "0 0", scale: 1 }],
          { duration: 560, delay: 300 + i * 45, easing: "ease-out", fill: "both" });
      });
      anim(ov.querySelector(".lc-chSub"), [{ opacity: 0, translate: "0 20px" }, { opacity: 1, translate: "0 0" }], { duration: 500, delay: 700, fill: "both" });
      ov.querySelectorAll(".lc-chCast").forEach(function (im, i) {
        anim(im, [{ opacity: 0, translate: (i ? 260 : -260) + "px 300px", rotate: (i ? 15 : -15) + "deg" }, { opacity: 1, translate: "0 -40px", rotate: "0deg", offset: .65 }, { opacity: 1, translate: "0 0" }], { duration: 900, delay: 350 + i * 120, easing: "ease-out", fill: "both" });
      });
      var closed = false;
      var close = function () {
        if (closed) return; closed = true; document.removeEventListener("keydown", key, true);
        var a = anim(ov, [{ opacity: 1, scale: 1 }, { opacity: 0, scale: 1.08 }], { duration: 380, easing: "ease-in", fill: "forwards" });
        var fin = function () { ov.remove(); resolve(); };
        if (a) a.onfinish = fin; else fin();
      };
      var key = function (e) { if (e.key === " " || e.key === "ArrowRight" || e.key === "Enter") { e.preventDefault(); e.stopImmediatePropagation(); close(); } };
      document.addEventListener("keydown", key, true);
      ov.addEventListener("pointerdown", close);
      setTimeout(close, 2500);
    });
  }

  /* ---------------- New Words: the magic reveal ---------------- */
  function vocabPicture() {
    var best = null, bw = 0;
    content.querySelectorAll("img[src*='assets/vocab/']").forEach(function (im) { var b = inStage(im); if (b.w >= 220 && b.w > bw) { best = im; bw = b.w; } });
    return best;
  }
  function wordParts(word, pic) {
    var card = pic.closest(".card, .v3-paper, .v3-photo") || pic.parentElement.parentElement;
    var L = leaves(content), w = norm(word), out = { big: null, ar: [], tiles: [], ex: [] };
    var bigFs = 0;
    L.forEach(function (el) {
      var tx = (el.textContent || "").trim();
      if (norm(tx) === w) { var fs = parseFloat(getComputedStyle(el).fontSize) || 0; if (fs > bigFs && fs >= 28) { bigFs = fs; out.big = el; } }
    });
    L.forEach(function (el) {
      var tx = (el.textContent || "").trim();
      if (/[؀-ۿ]/.test(tx) && !/[A-Za-z]/.test(tx) && tx.length < 60) out.ar.push(el);
      if (/^[“"].*[”"]$/.test(tx) && tx.length < 120) out.ex.push(el);
    });
    if (card) out.tiles = tilesIn(card);
    if (!out.tiles.length && content.querySelector(".v3")) out.tiles = tilesIn(content);
    return out;
  }
  function setupReveal(sec, dir) {
    if (!sec || sec.k !== "words") return false;
    var pic = vocabPicture(); if (!pic) return false;
    var title = currentTitle(), word = (title.split(/\s[·•]\s/)[1] || "").trim();
    if (!word) return false;
    var parts = wordParts(word, pic);
    if (dir < 0) return false;   // going back: show it as it is
    var box = pic.parentElement;
    if (getComputedStyle(box).position === "static") box.style.position = "relative";
    pic.classList.add("lc-sleep");
    var veil = mk("div", "lc-veil", '<b>?</b><span>' + (TEEN ? "Tap to reveal" : "Tap to reveal!") + '</span>');
    box.appendChild(veil);
    var hidden = [].concat(parts.big ? [parts.big] : [], parts.ar, parts.ex, parts.tiles);
    hidden.forEach(function (el) { el.classList.add("lc-hide"); });
    var listen = Array.prototype.filter.call(content.querySelectorAll("button"), function (b) { return /listen/i.test(b.textContent || ""); });
    listen.forEach(function (b) { b.classList.add("lc-hide"); });
    var done = false;
    var reveal = safe(function (ev) {
      if (done) return; done = true; clearBuild();
      var c = center(box);
      sfx("magic");
      // colour floods back in from where the class tapped (or from the middle)
      var col = pic.cloneNode(true); col.classList.remove("lc-sleep"); col.classList.add("lc-wake"); col.removeAttribute("onerror"); box.appendChild(col);
      var br = rect(box), px = ev && ev.clientX ? (ev.clientX - br.left) / br.width * 100 : 50, py = ev && ev.clientY ? (ev.clientY - br.top) / br.height * 100 : 50;
      var a = anim(col, [{ clipPath: "circle(0% at " + px + "% " + py + "%)" }, { clipPath: "circle(150% at " + px + "% " + py + "%)" }], { duration: RM ? 10 : 900, easing: "cubic-bezier(.4,0,.2,1)", fill: "forwards" });
      var after = function () { pic.classList.remove("lc-sleep"); col.remove(); };
      if (a) a.onfinish = after; else after();
      anim(veil, [{ opacity: 1, scale: 1 }, { opacity: 0, scale: 1.6 }], { duration: 420, easing: "ease-in", fill: "forwards" });
      setTimeout(function () { veil.remove(); }, 450);
      burst(c.x, c.y, { n: 70, speed: 12, cols: GOLD.concat(COLS), ring: "#FFFFFF" });
      setTimeout(function () { try { if (window.Lumio && Lumio.speak) Lumio.speak(word); } catch (e) {} }, 420);
      if (parts.big) {
        var el = parts.big; el.classList.remove("lc-hide");
        if (el.childNodes.length === 1 && el.firstChild.nodeType === 3 && !RM) {
          var txt = el.textContent; el.textContent = "";
          txt.split("").forEach(function (ch, i) {
            var sp = mk("span", "lc-letter"); sp.textContent = ch; el.appendChild(sp);
            anim(sp, [{ opacity: 0, translate: "0 -50px", scale: .3 }, { opacity: 1, translate: "0 8px", scale: 1.2, offset: .7 }, { opacity: 1, translate: "0 0", scale: 1 }], { duration: 520, delay: 520 + i * 60, easing: "ease-out", fill: "both" });
          });
        } else anim(el, [{ opacity: 0, scale: .5 }, { opacity: 1, scale: 1 }], { duration: 600, delay: 500, easing: EASE_IN, fill: "both" });
      }
      parts.tiles.forEach(function (tl, i) {
        tl.classList.remove("lc-hide");
        anim(tl, [{ opacity: 0, translate: "0 -90px", rotate: "-25deg", scale: .3 }, { opacity: 1, translate: "0 0", rotate: "0deg", scale: 1 }], { duration: 560, delay: 700 + i * 110, easing: "cubic-bezier(.34,1.8,.64,1)", fill: "both" });
        setTimeout(function () { sfx("tile", i); }, 700 + i * 110);
      });
      var tail = 900 + parts.tiles.length * 110;
      parts.ar.forEach(function (el, i) { el.classList.remove("lc-hide"); anim(el, [{ opacity: 0, translate: "60px 0" }, { opacity: 1, translate: "0 0" }], { duration: 520, delay: tail + i * 90, easing: EASE_IN, fill: "both" }); });
      parts.ex.forEach(function (el, i) { el.classList.remove("lc-hide"); anim(el, [{ opacity: 0, translate: "0 24px" }, { opacity: 1, translate: "0 0" }], { duration: 520, delay: tail + 200 + i * 90, easing: "ease-out", fill: "both" }); });
      listen.forEach(function (b) { b.classList.remove("lc-hide"); anim(b, [{ opacity: 0, scale: .5 }, { opacity: 1, scale: 1 }], { duration: 520, delay: tail + 380, easing: EASE_IN, fill: "both" }); b.classList.add("lc-glow"); });
      later(function () { pose("celebrate", 1800); say(TEEN ? word + "." : word + "!", 2200); ready(); }, 600);
    });
    veil.addEventListener("click", function (e) { e.stopPropagation(); reveal(e); });
    pic.addEventListener("click", function (e) { if (!done) reveal(e); });
    setBuild(reveal, TEEN ? "Reveal &#10022;" : "Reveal &#10024;");
    later(function () { if (!done) say(TEEN ? "Guess the word." : pick(["What's this?", "Can you guess?", "What do you see?"])); }, 1200);
    return true;
  }

  /* ---------------- Listen: words light up while they are read (karaoke) ---------------- */
  var lastAudio = null;
  try {
    var origPlay = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () { if (this instanceof HTMLAudioElement && /assets\/audio\//.test(this.src || "")) lastAudio = this; return origPlay.apply(this, arguments); };
  } catch (e) {}
  var lastTap = null;
  function karaoke(text) {
    var spoken = norm(text).split(" ").filter(Boolean); if (!spoken.length) return;
    var L = leaves(content).filter(function (el) { return visible(el) && !el.closest("button") && el.tagName !== "BUTTON"; });
    var match = null;
    L.forEach(function (el) { var n = norm(el.textContent); if (n && (" " + n + " ").indexOf(" " + spoken.join(" ") + " ") !== -1 && (!match || n.length < norm(match.textContent).length)) match = el; });
    var startTimer = function (dur) {
      if (!match) return;
      if (spoken.length === 1) {
        match.classList.add("lc-saying"); setTimeout(function () { match.classList.remove("lc-saying"); }, Math.max(900, dur));
        var tl = []; var card = match.closest(".card, .v3-paper"); if (card) tl = tilesIn(card);
        if (!tl.length) { var pic = vocabPicture(); if (pic) { var c2 = pic.closest(".card"); if (c2) tl = tilesIn(c2); else tl = tilesIn(content); } }
        tl.forEach(function (t, i) { setTimeout(function () { anim(t, [{ translate: "0 0", scale: 1 }, { translate: "0 -14px", scale: 1.15 }, { translate: "0 0", scale: 1 }], { duration: 380, easing: "ease-out" }); t.classList.add("lc-lit"); setTimeout(function () { t.classList.remove("lc-lit"); }, 420); }, i * Math.min(160, dur / Math.max(1, tl.length))); });
        return;
      }
      // wrap the words of the matching line once, then light them in order
      if (!match._lcWords) {
        var html = match.innerHTML;
        if (/</.test(html)) { match.classList.add("lc-saying"); setTimeout(function () { match.classList.remove("lc-saying"); }, dur); return; }
        match.innerHTML = match.textContent.split(/(\s+)/).map(function (tok) { return /^\s+$/.test(tok) || !tok ? tok : '<span class="lc-w">' + tok.replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }) + "</span>"; }).join("");
        match._lcWords = true;
      }
      var ws = Array.prototype.slice.call(match.querySelectorAll(".lc-w"));
      var wn = ws.map(function (w) { return norm(w.textContent); });
      var start = 0;
      for (var s0 = 0; s0 < wn.length; s0++) { if (wn[s0] === spoken[0]) { start = s0; break; } }
      var seq = ws.slice(start, start + spoken.length);
      var weights = seq.map(function (w) { return Math.max(2, norm(w.textContent).length) + 1.5; }), tot = weights.reduce(function (a, b) { return a + b; }, 0), acc = 0;
      seq.forEach(function (w, i) {
        var at = acc / tot * dur; acc += weights[i];
        setTimeout(function () { seq.forEach(function (x) { x.classList.remove("on"); }); w.classList.add("on"); if (!RM) anim(w, [{ scale: 1 }, { scale: 1.18 }, { scale: 1 }], { duration: 360, easing: "ease-out" }); }, at);
      });
      setTimeout(function () { seq.forEach(function (x) { x.classList.remove("on"); }); }, dur + 200);
    };
    // the recording's real length when there is one, otherwise the speaking pace of the device voice
    var est = 380 * spoken.length + 300;
    setTimeout(function () {
      var a = lastAudio;
      if (a && !a.paused && isFinite(a.duration) && a.duration > 0) { startTimer(Math.max(400, (a.duration - a.currentTime) * 1000 - 120)); return; }
      if (a && !a.paused) { var once = function () { a.removeEventListener("loadedmetadata", once); startTimer(isFinite(a.duration) ? a.duration * 1000 - 120 : est); }; a.addEventListener("loadedmetadata", once); setTimeout(function () { if (!match || match._lcStarted) return; }, 600); return; }
      startTimer(est);
    }, 140);
  }
  function waves(el) {
    if (!el || RM) return;
    var r = rect(el);
    for (var i = 0; i < 3; i++) {
      var w = mk("span", "lc-wave");
      w.style.left = (r.left + r.width / 2) + "px"; w.style.top = (r.top + r.height / 2) + "px";
      w.style.width = w.style.height = Math.max(r.width, r.height) * 1.05 + "px";
      document.body.appendChild(w);
      (function (w, i) { var a = anim(w, [{ opacity: .6, scale: .6 }, { opacity: 0, scale: 1.9 }], { duration: 950, delay: i * 220, easing: "ease-out" }); if (a) a.onfinish = function () { w.remove(); }; else w.remove(); })(w, i);
    }
  }
  function hookSpeak() {
    if (!window.Lumio || !Lumio.speak || Lumio.speak._lc) return;
    var sp = Lumio.speak;
    Lumio.speak = function (text) {
      var res = sp.apply(this, arguments);
      try { if (lastTap && lastTap.isConnected && Date.now() - lastTap._lcT < 600) waves(lastTap); karaoke(text); } catch (e) {}
      return res;
    };
    Lumio.speak._lc = true;
  }
  hookSpeak(); document.addEventListener("DOMContentLoaded", hookSpeak);

  /* ---------------- answers: game-show feedback ---------------- */
  var PRAISE = TEEN ? ["Nice!", "Spot on.", "Exactly!", "Nailed it.", "Well done!"] : ["Super!", "Great job!", "You got it!", "Amazing!", "Yes! Well done!"];
  var OOPS = TEEN ? ["Close. Look again.", "Not quite.", "Almost!"] : ["Oops! Almost!", "Good try!", "Look again!"];
  function good(el, big) {
    if (!el) return; var c = center(el);
    burst(c.x, c.y, { n: big ? 70 : 34, speed: big ? 11 : 8, ring: "#22C55E" }); sfx("correct");
    anim(el, [{ scale: 1 }, { scale: 1.14 }, { scale: .96 }, { scale: 1 }], { duration: 650, easing: "cubic-bezier(.34,1.56,.64,1)" });
    el.classList.add("lc-good"); setTimeout(function () { el.classList.remove("lc-good"); }, 1500);
  }
  function bad(el) {
    if (!el) return; sfx("wrong");
    anim(el, [{ translate: "0 0" }, { translate: "-14px 0" }, { translate: "12px 0" }, { translate: "-8px 0" }, { translate: "4px 0" }, { translate: "0 0" }], { duration: 500, easing: "ease-out" });
    el.classList.add("lc-bad"); setTimeout(function () { el.classList.remove("lc-bad"); }, 1000);
  }
  function popIn(el, delay) { if (!el) return; anim(el, [{ opacity: 0, scale: .6 }, { opacity: 1, scale: 1 }], { duration: RM ? 120 : 520, delay: delay || 0, easing: EASE_IN, fill: "backwards" }); }
  function cheer(el, big) { good(el, big); addJar(el); pose("celebrate"); say(pick(PRAISE), 1800); if (big) rain(TEEN ? 40 : 80); ready(); }
  function oops(el) { bad(el); pose("surprised", 1600); say(pick(OOPS), 1800); }

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
  wrap(window, "checkQuizAnswer", function (res, answeredBefore, el, chosen, correct) {
    if (answeredBefore) return;
    if (chosen === correct) cheer(el, true);
    else {
      oops(el);
      var c = content.querySelector('[data-quiz-option="' + String(correct).replace(/"/g, '\\"') + '"]');
      if (c) setTimeout(function () { anim(c, [{ scale: 1 }, { scale: 1.1 }, { scale: 1 }], { duration: 700, easing: "ease-in-out", iterations: 2 }); c.classList.add("lc-good"); setTimeout(function () { c.classList.remove("lc-good"); }, 1600); }, 500);
      ready();
    }
  }, function (el) { var box = el && el.closest("#stageContent"); return box && box.dataset.quizAnswered === "1"; });
  wrap(window, "checkSentenceBuilder", function (res, pre, groupId) {
    groupId = groupId || ""; var slots = document.getElementById("sbSlots" + groupId), fb = document.getElementById("sbFeedback" + groupId);
    if (!slots || !fb) return;
    if (/Perfect/.test(fb.textContent)) { cheer(slots, true); slots.querySelectorAll(".sb-tile").forEach(function (t, i) { anim(t, [{ translate: "0 0" }, { translate: "0 -18px" }, { translate: "0 0" }], { duration: 440, delay: i * 80, easing: "ease-out" }); }); }
    else if (/try again/i.test(fb.textContent)) oops(slots);
    if (fb.textContent) popIn(fb);
  });

  var A = window.LumioAct;
  if (A) {
    var origFlip = A.flip;
    A.flip = function (card) {
      if (!card) return;
      if (RM || card._lcFlip) return origFlip.apply(A, arguments);
      if (card.dataset.flipped === "1" && card.dataset.lock === "1") return origFlip.apply(A, arguments);
      card._lcFlip = true; sfx("flip");
      var a = anim(card, [{ rotate: "y 0deg", scale: 1 }, { rotate: "y 90deg", scale: 1.06 }], { duration: 170, easing: "ease-in" });
      var self = this, args = arguments;
      var done = function () { origFlip.apply(self, args); anim(card, [{ rotate: "y -90deg", scale: 1.06 }, { rotate: "y 0deg", scale: 1 }], { duration: 300, easing: "cubic-bezier(.34,1.56,.64,1)" }); var c = center(card); burst(c.x, c.y, { n: 14, speed: 5, ring: false }); card._lcFlip = false; };
      if (a) a.onfinish = done; else done();
    };
    wrap(A, "memory", function (res, pre, card) {
      setTimeout(function () {
        if (card && card.dataset.done === "1" && !card._lcDone) {
          card._lcDone = true; good(card);
          var board = card.parentElement;
          if (board && !board.querySelector("[data-pair]:not([data-done='1'])")) setTimeout(function () { var c = center(board); burst(c.x, c.y, { n: 100, speed: 13 }); sfx("win"); addJar(board); pose("celebrate"); say(pick(PRAISE)); rain(); ready(); }, 300);
        }
      }, 450);
    });
    wrap(A, "score", function (res, pre, btn, delta) {
      var box = btn && btn.parentElement ? btn.parentElement.querySelector("[data-act-score]") : null; if (!box) return;
      if (delta > 0) { var c = center(box); burst(c.x, c.y, { n: 18, speed: 5, shape: "star", cols: GOLD }); sfx("coin"); anim(box, [{ scale: 1 }, { scale: 1.5 }, { scale: 1 }], { duration: 520, easing: "cubic-bezier(.34,1.56,.64,1)" }); }
      else sfx("tick");
    });
    wrap(A, "star", function (res, pre, rowId) {
      var row = document.getElementById(rowId); if (!row) return;
      var stars = row.querySelectorAll("[data-star='1']"), last = stars[stars.length - 1]; if (!last) return;
      var c = center(last); burst(c.x, c.y, { n: 22, shape: "star", cols: GOLD }); sfx("star");
      if (!row.querySelector("[data-star='0']")) setTimeout(function () { sfx("win"); var cc = center(row); burst(cc.x, cc.y, { n: 80, speed: 11 }); addJar(row); pose("celebrate"); }, 250);
    });
    var origUncover = A.uncover;
    A.uncover = function (tile) {
      if (!tile || RM) return origUncover.apply(A, arguments);
      var c = center(tile); burst(c.x, c.y, { n: 12, speed: 4, ring: false }); sfx("pop");
      var a = anim(tile, [{ scale: 1, rotate: "0deg" }, { scale: 1.3, rotate: (Math.random() * 30 - 15) + "deg", opacity: 0 }], { duration: 280, easing: "ease-in" });
      var self = this, args = arguments; if (a) a.onfinish = function () { origUncover.apply(self, args); }; else origUncover.apply(self, args);
    };
    wrap(A, "uncoverAll", function (res, pre, panelId) { var p = document.getElementById(panelId); if (!p) return; var c = center(p); burst(c.x, c.y, { n: 70, speed: 11 }); sfx("magic"); pose("surprised", 1400); });
    wrap(A, "timer", function (res, pre, btn) {
      if (!btn) return; clearInterval(btn._lcIv);
      btn._lcIv = setInterval(function () {
        if (!btn.isConnected) { clearInterval(btn._lcIv); return; }
        var m = /(\d+)/.exec(btn.textContent || ""), n = m ? Number(m[1]) : null;
        if (/Time!/.test(btn.textContent)) { clearInterval(btn._lcIv); sfx("boom"); anim(btn, [{ scale: 1 }, { scale: 1.35 }, { scale: 1 }], { duration: 520, easing: "cubic-bezier(.34,1.56,.64,1)" }); bad(btn); pose("surprised"); return; }
        if (n !== null && n <= 10) { sfx("tick"); anim(btn, [{ scale: 1 }, { scale: 1.14 }, { scale: 1 }], { duration: 400, easing: "ease-out" }); btn.classList.add("lc-hurry"); }
        else btn.classList.remove("lc-hurry");
      }, 1000);
    });
    ["cycle", "random"].forEach(function (k) { wrap(A, k, function (res, pre, id) { var c = document.getElementById(id); if (!c) return; var shown = Array.prototype.find.call(c.children, function (x) { return x.style.display !== "none"; }); if (shown) { popIn(shown); sfx("pop"); } }); });
    wrap(A, "pick", function (res, pre, poolId, targetId) { var t = document.getElementById(targetId); if (!t) return; sfx("drum"); Array.prototype.forEach.call(t.children, function (x, i) { popIn(x, 500 + i * 90); }); setTimeout(function () { sfx("tada"); }, 500); });
    wrap(A, "next", function (res, pre, rowId) { var row = document.getElementById(rowId); if (!row) return; var k = row.children[Number(row.dataset.idx || 0)]; if (k) { anim(k, [{ scale: 1 }, { scale: 1.14 }, { scale: 1 }], { duration: 450, easing: "cubic-bezier(.34,1.56,.64,1)" }); sfx("pop"); } });
    wrap(A, "show", function (res, pre, id) { var e = document.getElementById(id); if (e) { popIn(e); sfx("pop"); } });
  }

  /* every tap feels physical; a tap that reveals something sparkles */
  document.addEventListener("pointerdown", safe(function (e) {
    var t = e.target.closest && e.target.closest("#stageContent button, #stageContent [onclick]");
    if (!t) return; lastTap = t; t._lcT = Date.now();
    if (!RM) anim(t, [{ scale: 1 }, { scale: .93 }, { scale: 1 }], { duration: 260, easing: "ease-out" });
    var before = t.innerHTML.length;
    setTimeout(function () { if (t.isConnected && t.innerHTML.length !== before && !/lc-w/.test(t.innerHTML)) { var c = center(t); burst(c.x, c.y, { n: 14, speed: 4, ring: false }); sfx("pop"); } }, 60);
  }), true);

  /* ---------------- the finale on the last slide ---------------- */
  function finale() {
    if (RM) return;
    var ov = mk("div", "lc-finale");
    var cast = castFor(3);
    ov.innerHTML = '<div class="lc-chBg"></div><div class="lc-fnIn"><div class="lc-fnJar">' + (TEEN ? icon("bolt") : icon("trophy")) + '</div><h2>' + (TEEN ? "Lesson complete" : "Lesson complete!") + '</h2><p>' +
      (jarN ? (TEEN ? "Your class earned <b>" + jarN * 100 + " XP</b> today." : "Your class earned <b>" + jarN + " star" + (jarN === 1 ? "" : "s") + "</b> today!") : (TEEN ? "Great work today, everyone." : "Great work today, everyone!")) +
      '</p><small>' + (TEEN ? "Tap to close" : "Tap to close") + '</small></div>' +
      cast.map(function (c, i) { return '<img class="lc-fnCast lc-f' + i + '" alt="" src="assets/story/characters/' + c + '-celebrate.png">'; }).join("");
    layer.appendChild(ov);
    ov.querySelectorAll(".lc-fnCast").forEach(function (im) { im.onerror = function () { im.remove(); }; });
    anim(ov.querySelector(".lc-chBg"), [{ opacity: 0 }, { opacity: 1 }], { duration: 400, fill: "both" });
    anim(ov.querySelector(".lc-fnIn"), [{ opacity: 0, scale: .3, rotate: "-8deg" }, { opacity: 1, scale: 1.08, rotate: "2deg", offset: .7 }, { opacity: 1, scale: 1, rotate: "0deg" }], { duration: 800, delay: 200, easing: "ease-out", fill: "both" });
    ov.querySelectorAll(".lc-fnCast").forEach(function (im, i) {
      anim(im, [{ opacity: 0, translate: "0 400px" }, { opacity: 1, translate: "0 -60px", offset: .6 }, { opacity: 1, translate: "0 0" }], { duration: 900, delay: 500 + i * 150, easing: "ease-out", fill: "both" });
      var j = anim(im, [{ translate: "0 0" }, { translate: "0 -26px" }], { duration: 420, delay: 1500 + i * 140, iterations: 6, direction: "alternate", easing: "ease-out" });
    });
    sfx("drum"); setTimeout(function () { sfx("tada"); sfx("clap"); rain(160); }, 650);
    var sr = rect(stage);
    for (var k = 0; k < 7; k++) setTimeout(function () { firework(sr.left + sr.width * (.15 + Math.random() * .7), sr.top + sr.height * (.12 + Math.random() * .35)); sfx("pop"); }, 900 + k * 380);
    ov.addEventListener("pointerdown", function () { var a = anim(ov, [{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: "forwards" }); if (a) a.onfinish = function () { ov.remove(); }; else ov.remove(); });
  }

  /* ---------------- emoji on the slides -> the Lumio icon set ---------------- */
  var EMOJI = { "\u{1F50A}": "sound", "\u{1F509}": "sound", "\u{1F508}": "sound", "\u{1F4AC}": "speech", "\u2B50": "star", "\u{1F31F}": "star", "\u{1F440}": "eye",
    "\u{1F4A1}": "bulb", "\u{1F465}": "people", "\u{1F464}": "user", "\u{1F4DA}": "library", "\u2705": "check", "\u26A1": "bolt", "\u{1F389}": "sparkle", "\u2728": "sparkle",
    "\u{1F3B2}": "dice", "\u{1F4DD}": "write", "\u{1F600}": "smile", "\u{1F44B}": "wave", "\u{1F3C6}": "trophy", "\u{1F4D6}": "book", "\u270F": "pencil", "\u{1F3B5}": "music",
    "\u{1F4C5}": "calendar", "\u{1F393}": "grad", "\u2600": "sun", "\u{1F914}": "question", "\u{1F50D}": "eye" };
  var EMOJI_RX = new RegExp("(" + Object.keys(EMOJI).join("|") + ")\\uFE0F?", "gu");
  function iconify(rootEl) {
    if (!window.LumioIcons) return;
    var walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT), nodes = [], t;
    while ((t = walker.nextNode())) { EMOJI_RX.lastIndex = 0; if (EMOJI_RX.test(t.nodeValue)) nodes.push(t); }
    nodes.forEach(function (node) {
      var frag = document.createDocumentFragment(), parts = node.nodeValue.split(EMOJI_RX);
      for (var i = 0; i < parts.length; i++) {
        if (i % 2 === 1) { var sp = mk("span", "lc-ico", icon(EMOJI[parts[i]])); sp.setAttribute("aria-hidden", "true"); frag.appendChild(sp); }
        else if (parts[i]) frag.appendChild(document.createTextNode(parts[i].replace(/^\uFE0F/, "")));
      }
      node.parentNode.replaceChild(frag, node);
    });
  }
  (function () { var br = document.getElementById("lessonBrand"); if (br) iconify(br); })();

  /* ---------------- run on every slide swap ---------------- */
  function currentTitle() {
    var pt = content.querySelector(".pagetitle"); if (pt) return (pt.textContent || "").replace(/\s+/g, " ").trim();
    var best = null;
    leaves(content).forEach(function (el) {
      var tx = (el.textContent || "").replace(/\s+/g, " ").trim(); if (tx.length < 3 || tx.length > 70) return;
      var b = inStage(el); if (b.y > 150) return;
      if (/\s[·•]\s/.test(tx) && (!best || Math.abs(b.x + b.w / 2 - SW / 2) < best.d)) best = { tx: tx, d: Math.abs(b.x + b.w / 2 - SW / 2) };
    });
    if (best) return best.tx;
    var mid = null;
    leaves(content).forEach(function (el) { var tx = (el.textContent || "").trim(), b = inStage(el); if (b.y < 150 && tx.length > 2 && tx.length < 50 && Math.abs(b.x + b.w / 2 - SW / 2) < 200 && !/\d+\s*\/\s*\d+/.test(tx)) mid = mid || tx; });
    return mid || "";
  }
  var prevSec = null, pending = false;
  new MutationObserver(function () {
    if (pending) return; pending = true;
    requestAnimationFrame(safe(function () {
      pending = false;
      if (content.querySelector("#loadingMsg") || !content.firstElementChild) return;
      if (content.querySelector(".lc-motes")) return;   // our own canvas insert
      var dir = lastDir, n = curN(), t = totN();
      if (prevN && n < prevN) dir = -1; else if (prevN && n > prevN) dir = 1;
      var isFirst = firstLoad;
      firstLoad = false; prevN = n; slideTok++; host = null;
      if (bubbleEl) { bubbleEl.remove(); bubbleEl = null; }
      layer.querySelectorAll(".lc-typing,.lc-chapter").forEach(function (x) { x.remove(); });
      clearBuild(); if (nextBtn) nextBtn.classList.remove("lc-ready");
      if (isFirst) buildMap(t);
      try { iconify(content); } catch (e) {}
      backdrop();
      host = findHost(); hostSrc = host ? host.getAttribute("src") : "";
      var title = currentTitle(), sec = sectionOf(title);
      var newPart = sec && sec.k !== (prevSec && prevSec.k) && !shownSections[sec.k] && dir > 0 && !isFirst && n !== t;
      prevSec = sec;
      var revealing = setupReveal(sec, dir);
      if (isFirst && !RM) {
        anim(content, [{ clipPath: "circle(0% at 50% 50%)" }, { clipPath: "circle(75% at 50% 50%)" }], { duration: 1100, easing: "cubic-bezier(.6,0,.2,1)" });
        sfx("magic");
      } else turnPage(dir);
      moveTrail();
      var go = function () {
        enter(dir);
        if (!revealing && sec && (newPart || isFirst)) later(function () { say(pick(sec.say)); }, 1100);
        if (n === t && t > 1 && dir > 0) later(finale, 900);
      };
      if (newPart) {
        shownSections[sec.k] = 1; try { sessionStorage.setItem("lumio_lc_parts_" + DECK, JSON.stringify(shownSections)); } catch (e) {}
        content.style.visibility = "hidden";
        var tk = slideTok;
        setTimeout(function () { if (tk !== slideTok) { content.style.visibility = ""; return; } chapterCard(sec).then(function () { content.style.visibility = ""; if (tk === slideTok) go(); }); }, TEEN ? 520 : 600);
      } else go();
    }));
  }).observe(content, { childList: true });

  /* game links (end of the lesson): glowing cards that pop in */
  var links = document.getElementById("gameLinks");
  if (links) new MutationObserver(safe(function () {
    var as = links.querySelectorAll("a"); if (!as.length || links.dataset.lcShown === "1") { if (!as.length) links.dataset.lcShown = ""; return; }
    links.dataset.lcShown = "1";
    as.forEach(function (a, i) { popIn(a, 200 + i * 120); });
    setTimeout(function () { sfx("star"); }, 300);
  })).observe(links, { childList: true });

  /* keyboard: Space = next, like a clicker (a pending reveal goes first) */
  document.addEventListener("keydown", function (e) {
    if (e.key === " " && !/INPUT|TEXTAREA|BUTTON/.test((document.activeElement || {}).tagName || "")) { if (nextBtn && !nextBtn.disabled) { e.preventDefault(); nextBtn.click(); } }
  });

  window.LumioSlideFX = { burst: burst, good: good, bad: bad, sfx: sfx, say: say, pose: pose, rain: rain, addJar: addJar };
})();
