/* English Hub v2 (Oct 2026) -- the student's study app: Vocabulary, Idioms, Grammar, Phonics, Spelling, Writing,
   Songs and Games for their level. Content comes from the same <type>-hub/<level>.json files the old slide Hub
   read; every word, example and prompt plays its real recording through Lumio.speak (device voice only when a
   recording is missing). Progress (words known, quiz bests, topics done, drafts, XP, days practised) is kept
   per student and level in localStorage "lumio_hub2". Routes live in the URL hash so Back works on phones. */
(function () {
  "use strict";
  var qs = function (k) { return new URLSearchParams(location.search).get(k); };
  var L = window.Lumio || {};
  var me = (L.user && L.user()) || null;
  var LEVEL = qs("level") || (me && me.level) || "level1";
  var TEEN = ["level3", "level4", "level5", "level6", "level7", "level8", "level9"].indexOf(LEVEL) !== -1;
  document.documentElement.classList.add(TEEN ? "teen" : "kid");
  var NAME = (me && me.name) || "guest";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var main = $("#main");
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var pic = function (en) { return "assets/vocab/" + String(en).toLowerCase().replace(/'/g, "").replace(/ /g, "-") + ".png"; };
  var shuffle = function (a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  var MO = !(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);

  /* ---------- crisp one-colour glyphs (same family as the v5 slide buttons) ---------- */
  var G = {
    back: '<path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
    sound: '<path d="M4 9.5v5h3.6L13 19V5L7.6 9.5z" fill="currentColor"/><path d="M16.2 8.6a5 5 0 010 6.8M18.8 6a8.6 8.6 0 010 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    book: '<path d="M12 6.2C10 4.8 7.3 4.3 3.5 4.5v14c3.8-.2 6.5.3 8.5 1.7 2-1.4 4.7-1.9 8.5-1.7v-14c-3.8-.2-6.5.3-8.5 1.7z" fill="currentColor"/><path d="M12 6.4v13.4" stroke="var(--bg,#fff)" stroke-width="1.6"/>',
    chat: '<path d="M4 6.5A2.5 2.5 0 016.5 4h11A2.5 2.5 0 0120 6.5v7a2.5 2.5 0 01-2.5 2.5H10l-4.5 4v-4h0A2.5 2.5 0 014 13.5z" fill="currentColor"/>',
    rule: '<path d="M5 4h14v4H5zM5 10h9v4H5zM5 16h12v4H5z" fill="currentColor"/>',
    abc: '<path d="M3 18l3.6-12h2.2L12.4 18h-2.3l-.8-2.8H6.1L5.3 18zm3.7-4.8h2l-1-3.6zM14 6h3.6c2 0 3.2 1 3.2 2.6 0 1-.5 1.7-1.3 2.1 1.1.3 1.8 1.2 1.8 2.4 0 1.9-1.4 2.9-3.6 2.9H14zm2.2 1.9v2.7h1.2c.9 0 1.4-.5 1.4-1.4 0-.8-.5-1.3-1.4-1.3zm0 4.5v3.1h1.4c1 0 1.6-.5 1.6-1.6 0-1-.6-1.5-1.6-1.5z" fill="currentColor"/>',
    pencil: '<path d="M15.6 4.4l4 4L9 19H5v-4z" fill="currentColor"/><path d="M13.5 6.5l4 4" stroke="var(--bg,#fff)" stroke-width="1.6"/>',
    spell: '<path d="M4 17l4.5-11h2L15 17h-2.2l-1-2.6H7.2L6.2 17zm3.9-4.5h3.2L9.5 8.3zM15.5 13.5l2 2 4-4.5" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/>',
    music: '<path d="M9 17.5V6l11-2v11.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><circle cx="6.5" cy="17.5" r="2.8" fill="currentColor"/><circle cx="17.5" cy="15.5" r="2.8" fill="currentColor"/>',
    game: '<path d="M7 7h10a5 5 0 015 5v1.5a3.5 3.5 0 01-6.2 2.2L14.5 14h-5l-1.3 1.7A3.5 3.5 0 012 13.5V12a5 5 0 015-5z" fill="currentColor"/><path d="M7.5 10v4M5.5 12h4" stroke="var(--bg,#fff)" stroke-width="1.8" stroke-linecap="round"/><circle cx="16.5" cy="11" r="1.2" fill="var(--bg,#fff)"/><circle cx="18.5" cy="13" r="1.2" fill="var(--bg,#fff)"/>',
    check: '<path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
    x: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>',
    bolt: '<path d="M13.5 2L4 13.5h6.5L9.5 22 20 9.5h-6.5z" fill="currentColor"/>',
    star: '<path d="M12 2.6l2.9 6 6.5.8-4.8 4.5 1.2 6.5L12 17.3l-5.8 3.1 1.2-6.5-4.8-4.5 6.5-.8z" fill="currentColor"/>',
    cards: '<rect x="3" y="6" width="13" height="15" rx="2.5" fill="currentColor" opacity=".45"/><rect x="8" y="3" width="13" height="15" rx="2.5" fill="currentColor"/>',
    target: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/>',
    eye: '<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3.2" fill="currentColor"/>',
    redo: '<path d="M19 12a7 7 0 11-2.1-5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M19.5 4v4.5H15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
    flame: '<path d="M12 2.5c.6 3.6 5.5 5.6 5.5 11a5.5 5.5 0 01-11 0c0-2.4 1.2-3.9 2.4-5 .1 1.8.9 2.9 2 3.3C10.6 8.6 11 5.3 12 2.5z" fill="currentColor"/>',
    next: '<path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>'
  };
  var g = function (n) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + (G[n] || "") + "</svg>"; };

  /* ---------- progress ---------- */
  var KEY = "lumio_hub2";
  function loadAll() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  var ALL = loadAll();
  ALL[NAME] = ALL[NAME] || {};
  var P = ALL[NAME][LEVEL] = ALL[NAME][LEVEL] || {};
  ["known", "quiz", "idioms", "grammar", "sounds", "spelling", "writing"].forEach(function (k) { P[k] = P[k] || {}; });
  P.xp = P.xp || 0; P.days = P.days || [];
  function save() { try { localStorage.setItem(KEY, JSON.stringify(ALL)); } catch (e) {} }
  function today() { try { return L.tzNow ? L.tzNow().date : new Date().toISOString().slice(0, 10); } catch (e) { return new Date().toISOString().slice(0, 10); } }
  function streak() {
    var d = P.days.slice().sort(), n = 0, cur = new Date(today() + "T12:00:00Z");
    for (;;) { var s = cur.toISOString().slice(0, 10); if (d.indexOf(s) === -1) { if (n === 0 && s === today()) { cur.setUTCDate(cur.getUTCDate() - 1); continue; } break; } n++; cur.setUTCDate(cur.getUTCDate() - 1); }
    return n;
  }
  function addXP(n, why) {
    P.xp += n; if (P.days.indexOf(today()) === -1) P.days.push(today()); save(); paintXP(true);
    if (why) toast(g("bolt") + "+" + n + " XP · " + esc(why));
  }

  /* ---------- sound ---------- */
  var speakingEl = null;
  function say(text, el) {
    if (speakingEl) speakingEl.classList.remove("speaking", "on");
    speakingEl = el || null; if (el) el.classList.add(el.classList.contains("play") ? "on" : "speaking");
    try { L.speak ? L.speak(text) : null; } catch (e) {}
    if (el) setTimeout(function () { el.classList.remove("speaking", "on"); }, 1400);
  }
  function sayPhonics(tok, el) {
    if (el) { el.classList.add("speaking"); setTimeout(function () { el.classList.remove("speaking"); }, 900); }
    try { L.speakPhonicsSound ? L.speakPhonicsSound(tok) : L.speak(tok); } catch (e) {}
  }
  function fx(kind) { try { if (L.beep) L.beep(kind === "right"); } catch (e) {} }

  /* ---------- chrome ---------- */
  var topTitle = $("#hbTitle"), topSmall = $("#hbSmall"), backBtn = $("#hbBack");
  function paintXP(bump) {
    var x = $("#hbXp"); x.innerHTML = g("bolt") + "<span>" + P.xp + "</span>";
    if (bump && MO && x.animate) x.animate([{ transform: "scale(1)" }, { transform: "scale(1.18)" }, { transform: "scale(1)" }], { duration: 450, easing: "cubic-bezier(.3,1.6,.5,1)" });
  }
  var toastT;
  function toast(html) { var t = $("#hbToast"); t.innerHTML = html; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove("show"); }, 1900); }
  function confetti() {
    if (!MO) return;
    var c = document.createElement("canvas"); c.className = "confetti"; document.body.appendChild(c);
    var W = c.width = innerWidth * devicePixelRatio, H = c.height = innerHeight * devicePixelRatio, x = c.getContext("2d");
    var cols = TEEN ? ["#FFC000", "#FFD34D", "#FFFFFF", "#FF8A00"] : ["#FF9A2E", "#F2600C", "#7FD8C9", "#FF8FB1", "#FFD166", "#8FD3FF"];
    var ps = []; for (var i = 0; i < 120; i++) ps.push({ x: W / 2 + (Math.random() - .5) * W * .3, y: H * .35, vx: (Math.random() - .5) * 22 * devicePixelRatio, vy: (-Math.random() * 18 - 6) * devicePixelRatio, r: (4 + Math.random() * 5) * devicePixelRatio, c: cols[i % cols.length], a: Math.random() * 6, va: (Math.random() - .5) * .3 });
    var t0 = performance.now();
    (function step(t) {
      x.clearRect(0, 0, W, H);
      ps.forEach(function (p) { p.vy += .55 * devicePixelRatio; p.vx *= .985; p.x += p.vx; p.y += p.vy; p.a += p.va; x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.fillStyle = p.c; x.fillRect(-p.r, -p.r / 2, p.r * 2, p.r); x.restore(); });
      if (t - t0 < 2600) requestAnimationFrame(step); else c.remove();
    })(t0);
  }
  function setTop(small, title, back) {
    topSmall.textContent = small; topTitle.textContent = title;
    backBtn.onclick = function () { if (back === "student") location.href = "student.html"; else location.hash = back; };
  }
  function render(html) { main.innerHTML = '<div class="hb-view">' + html + "</div>"; window.scrollTo(0, 0); }

  /* ---------- data ---------- */
  var DIRS = { vocab: "vocab-hub", grammar: "grammar-hub", idioms: "idioms-hub", phonics: "phonics-hub", spelling: "spelling-hub", writing: "writing-hub" };
  var DATA = {};
  function load(type) {
    if (DATA[type] !== undefined) return Promise.resolve(DATA[type]);
    return fetch(DIRS[type] + "/" + LEVEL + ".json").then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; })
      .then(function (d) { DATA[type] = d; return d; });
  }
  var SECTIONS = [
    { k: "vocab", t: "Vocabulary", s: "Words with pictures", gl: "book", c1: "#FFA43A", c2: "#F2600C" },
    { k: "idioms", t: "Idioms", s: "Phrases natives use", gl: "chat", c1: "#FF8FB1", c2: "#E0457B" },
    { k: "grammar", t: "Grammar", s: "Rules + build sentences", gl: "rule", c1: "#8FA2FF", c2: "#5468E8" },
    { k: "phonics", t: "Phonics", s: "Letter sounds", gl: "abc", c1: "#5FD3C2", c2: "#139A88" },
    { k: "spelling", t: "Spelling", s: "The rules behind words", gl: "spell", c1: "#7FD3FF", c2: "#2C8FD8" },
    { k: "writing", t: "Writing", s: "Say it, then write it", gl: "pencil", c1: "#FFD166", c2: "#E8A400" },
    { k: "songs", t: "Songs", s: "Sing your level's songs", gl: "music", c1: "#C79BFF", c2: "#8B4FE0", href: "songs.html?level=" + encodeURIComponent(LEVEL) },
    { k: "games", t: "Games", s: "Word games", gl: "game", c1: "#7EE08C", c2: "#2FAE4A", href: "games/word-pop.html?level=" + encodeURIComponent(LEVEL) + "&from=hub" }
  ];

  /* how far along each section is: [done, total] */
  function sectionProgress(k, d) {
    if (!d) return null;
    if (k === "vocab") { var ws = []; d.themes.forEach(function (t) { ws = ws.concat(t.words); }); return [ws.filter(function (w) { return P.known[w.en]; }).length, ws.length]; }
    if (k === "idioms") return [d.idioms.filter(function (i) { return P.idioms[i.phrase]; }).length, d.idioms.length];
    if (k === "grammar") return [d.topics.filter(function (t) { return P.grammar[t.title]; }).length, d.topics.length];
    if (k === "phonics") return [d.units.filter(function (u) { return P.sounds[u.unit]; }).length, d.units.length];
    if (k === "spelling") return [d.rules.filter(function (r) { return P.spelling[r.id]; }).length, d.rules.length];
    if (k === "writing") return [d.prompts.filter(function (p, i) { return P.writing[i] && P.writing[i].done; }).length, d.prompts.length];
    return null;
  }
  function ring(done, total) {
    var f = total ? done / total : 0, C = 2 * Math.PI * 16;
    return '<div class="ring" aria-label="' + done + " of " + total + '"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" stroke-opacity=".12" stroke-width="4"/>' +
      '<circle cx="20" cy="20" r="16" fill="none" stroke="var(--accent)" stroke-width="4" stroke-linecap="' + (TEEN ? "butt" : "round") + '" stroke-dasharray="' + (C * f).toFixed(1) + " " + C.toFixed(1) + '"/></svg><span>' + Math.round(f * 100) + "%</span></div>";
  }

  /* ================================================================ HOME */
  function home() {
    setTop("Lumio English", "English Hub", "student");
    var lvName = "";
    Promise.all(SECTIONS.filter(function (s) { return !s.href; }).map(function (s) { return load(s.k); })).then(function () {
      var any = DATA.vocab || DATA.idioms || DATA.grammar; lvName = any ? any.levelName : LEVEL;
      var words = sectionProgress("vocab", DATA.vocab);
      var mascot = TEEN ? "assets/story/characters/lumi-teen-thumbs.png" : "assets/story/characters/lumi-wave-book.png";
      var first = me && me.name ? esc(String(me.name).split(" ")[0]) : "";
      var tiles = SECTIONS.map(function (s) {
        if (!s.href && !DATA[s.k]) return "";
        var pr = s.href ? null : sectionProgress(s.k, DATA[s.k]);
        var small = s.s;
        if (s.k === "vocab" && pr) small = pr[1] + " words · " + DATA.vocab.themes.length + " topics";
        if (s.k === "idioms" && pr) small = pr[1] + " idioms";
        if (s.k === "grammar" && pr) small = pr[1] + " rules";
        if (s.k === "writing" && pr) small = pr[1] + " prompts";
        return '<button class="card tile" data-k="' + s.k + '" style="--c1:' + s.c1 + ";--c2:" + s.c2 + '"><span class="gl">' + g(s.gl) + "</span>" +
          (pr ? ring(pr[0], pr[1]) : "") + "<span><b>" + s.t + "</b><small>" + esc(small) + "</small></span></button>";
      }).join("");
      render(
        '<section class="card hero"><div class="who"><span class="lbl">' + esc(lvName) + '</span><h1 class="h1">' + (first ? "Hi " + first + "!" : "English Hub") + "</h1>" +
        '<p class="sub">' + (TEEN ? "Practise any time. Short sessions, every day." : "Learn new words, play, and collect XP!") + "</p></div>" +
        '<img class="mascot" src="' + mascot + '" alt="" onerror="this.remove()"></section>' +
        '<div class="stats">' +
        '<div class="card stat"><b>' + (words ? words[0] : 0) + '</b><span>words known</span></div>' +
        '<div class="card stat"><b>' + P.xp + '</b><span>XP</span></div>' +
        '<div class="card stat"><b>' + streak() + '</b><span>day streak</span></div></div>' +
        '<div class="sec-h"><h2>Practise</h2></div><div class="tiles">' + tiles + "</div>");
      main.querySelectorAll(".tile").forEach(function (b) {
        b.onclick = function () { var s = SECTIONS.filter(function (x) { return x.k === b.dataset.k; })[0]; if (s.href) location.href = s.href; else location.hash = "#/" + s.k; };
      });
    });
  }

  /* ================================================================ VOCABULARY */
  function vocabHome(d) {
    setTop("English Hub", "Vocabulary", "#/");
    var cards = d.themes.map(function (t, i) {
      var k = t.words.filter(function (w) { return P.known[w.en]; }).length, best = P.quiz["v" + i];
      return '<button class="card theme" data-i="' + i + '"><div class="collage">' + t.words.slice(0, 4).map(function (w) { return '<img src="' + pic(w.en) + '" alt="" loading="lazy" onerror="this.style.visibility=\'hidden\'">'; }).join("") + "</div>" +
        '<div class="meta"><div><b>' + esc(t.theme) + '</b><span class="ar" dir="rtl">' + esc(t.themeAr) + "</span>" +
        '<div class="bar"><i style="width:' + Math.round(k / t.words.length * 100) + '%"></i></div></div>' +
        (best ? '<span class="xpgain" title="best quiz">' + g("star") + best.stars + "</span>" : "") + "</div></button>";
    }).join("");
    render('<span class="lbl">' + esc(d.levelName) + '</span><h1 class="h1">Vocabulary</h1><p class="sub">Pick a topic. Tap a word to hear it, then learn it and test yourself.</p>' +
      '<div class="sec-h"><h2>Topics</h2><span class="sub">' + d.themes.length + "</span></div>" + '<div class="themes">' + cards + "</div>");
    main.querySelectorAll(".theme").forEach(function (b) { b.onclick = function () { location.hash = "#/vocab/" + b.dataset.i; }; });
  }
  function vocabTheme(d, i) {
    var t = d.themes[i]; if (!t) return vocabHome(d);
    setTop("Vocabulary", t.theme, "#/vocab");
    var k = t.words.filter(function (w) { return P.known[w.en]; }).length;
    render('<span class="lbl">Topic ' + (+i + 1) + " of " + d.themes.length + '</span><h1 class="h1">' + esc(t.theme) + '</h1><p class="sub" dir="rtl" style="text-align:left">' + esc(t.themeAr) + "</p>" +
      '<div class="prog" style="margin-top:12px"><div class="bar"><i style="width:' + Math.round(k / t.words.length * 100) + '%"></i></div><span>' + k + "/" + t.words.length + " known</span></div>" +
      '<div class="actions"><button class="btn pri" id="goLearn">' + g("cards") + 'Learn</button><button class="btn sec" id="goQuiz">' + g("target") + "Quiz</button></div>" +
      '<div class="sec-h"><h2>All words</h2><span class="sub">tap to hear</span></div><div class="words">' +
      t.words.map(function (w, j) {
        return '<button class="card word" data-j="' + j + '"><img src="' + pic(w.en) + '" alt="" loading="lazy" onerror="this.style.visibility=\'hidden\'">' +
          (P.known[w.en] ? '<span class="ok">' + g("check") + "</span>" : "") + "<b>" + esc(w.en) + '</b><span class="ar" dir="rtl">' + esc(w.ar) + "</span></button>";
      }).join("") + "</div>");
    main.querySelectorAll(".word").forEach(function (b) { b.onclick = function () { say(t.words[b.dataset.j].en, b); }; });
    $("#goLearn").onclick = function () { location.hash = "#/vocab/" + i + "/learn"; };
    $("#goQuiz").onclick = function () { location.hash = "#/vocab/" + i + "/quiz"; };
  }
  /* flashcards: picture + word + recording; Arabic hidden until tapped; "I know it" / "Still learning"; swipe works too */
  function vocabLearn(d, i) {
    var t = d.themes[i]; if (!t) return vocabHome(d);
    setTop(t.theme, "Learn", "#/vocab/" + i);
    var order = shuffle(t.words.map(function (w, j) { return j; }).sort(function (a, b) { return (P.known[t.words[a].en] ? 1 : 0) - (P.known[t.words[b].en] ? 1 : 0); }));
    order.sort(function (a, b) { return (P.known[t.words[a].en] ? 1 : 0) - (P.known[t.words[b].en] ? 1 : 0); });
    var pos = 0, gotNew = 0;
    function card(dir) {
      if (pos >= order.length) return done();
      var w = t.words[order[pos]];
      render('<div class="deck-wrap"><div class="prog"><div class="bar"><i style="width:' + Math.round(pos / order.length * 100) + '%"></i></div><span>' + (pos + 1) + "/" + order.length + "</span></div>" +
        '<div class="card flash hb-card-anim" id="fc" style="--from:' + (dir < 0 ? "-40px" : "40px") + ";--rot:" + (dir < 0 ? "-2deg" : "2deg") + '">' +
        '<img class="pic" src="' + pic(w.en) + '" alt="' + esc(w.en) + '" onerror="this.style.visibility=\'hidden\'">' +
        '<div class="w">' + esc(w.en) + '</div><div class="ar hide" id="fcAr" dir="rtl" title="Tap to see the Arabic">' + esc(w.ar) + "</div>" +
        '<div class="row"><button class="play big" id="fcPlay" aria-label="Listen">' + g("sound") + "</button></div></div>" +
        '<div class="know"><button class="btn no" id="kNo">' + g("redo") + 'Still learning</button><button class="btn yes" id="kYes">' + g("check") + "I know it</button></div>" +
        '<p class="swipe-hint">Swipe right if you know it, left to practise again</p></div>');
      var play = $("#fcPlay"); play.onclick = function () { say(w.en, play); };
      setTimeout(function () { say(w.en, play); }, 350);
      $("#fcAr").onclick = function () { this.classList.remove("hide"); };
      $("#kYes").onclick = function () { mark(true); };
      $("#kNo").onclick = function () { mark(false); };
      swipe($("#fc"), function (r) { mark(r); });
      function mark(yes) {
        if (yes && !P.known[w.en]) { P.known[w.en] = today(); gotNew++; save(); }
        if (!yes && P.known[w.en]) { delete P.known[w.en]; save(); }
        if (!yes) order.push(order[pos]);   // comes back later in this round
        fx(yes ? "right" : "");
        if (order.length > t.words.length * 2) order.length = Math.max(pos + 1, t.words.length);
        pos++; card(yes ? 1 : -1);
      }
    }
    function done() {
      var k = t.words.filter(function (w) { return P.known[w.en]; }).length;
      if (gotNew) addXP(gotNew * 2, "new words");
      if (k === t.words.length) confetti();
      render('<div class="deck-wrap"><div class="card result"><span class="lbl">Round complete</span><div class="score">' + k + "/" + t.words.length + '</div><p class="sub">words you know in ' + esc(t.theme) + "</p>" +
        (gotNew ? '<div class="xpgain">' + g("bolt") + "+" + gotNew * 2 + " XP</div>" : "") +
        '<div class="actions"><button class="btn sec" id="again">' + g("redo") + 'Again</button><button class="btn pri" id="toQuiz">' + g("target") + "Take the quiz</button></div></div></div>");
      $("#again").onclick = function () { vocabLearn(d, i); };
      $("#toQuiz").onclick = function () { location.hash = "#/vocab/" + i + "/quiz"; };
    }
    card(1);
  }
  function swipe(el, cb) {
    var x0 = null, dx = 0;
    el.addEventListener("pointerdown", function (e) { if (e.target.closest("button")) return; x0 = e.clientX; dx = 0; el.setPointerCapture(e.pointerId); });
    el.addEventListener("pointermove", function (e) { if (x0 === null) return; dx = e.clientX - x0; el.style.transform = "translateX(" + dx + "px) rotate(" + dx / 22 + "deg)"; });
    var end = function () { if (x0 === null) return; x0 = null; if (Math.abs(dx) > 90) cb(dx > 0); else { el.style.transition = "transform .3s"; el.style.transform = ""; setTimeout(function () { el.style.transition = ""; }, 300); } };
    el.addEventListener("pointerup", end); el.addEventListener("pointercancel", end);
  }
  /* quiz: 8 questions, alternating "hear it -> pick the picture" and "see the picture -> pick the word" */
  function vocabQuiz(d, i) {
    var t = d.themes[i]; if (!t) return vocabHome(d);
    setTop(t.theme, "Quiz", "#/vocab/" + i);
    var pool = t.words.length >= 4 ? t.words : [].concat.apply([], d.themes.map(function (x) { return x.words; }));
    var qs8 = shuffle(t.words).slice(0, Math.min(8, t.words.length));
    runQuiz(qs8.map(function (w, n) {
      var opts = shuffle([w].concat(shuffle(pool.filter(function (x) { return x.en !== w.en; })).slice(0, 3)));
      if (n % 2 === 0) return { kind: "hear", w: w, opts: opts };
      return { kind: "see", w: w, opts: opts };
    }), function (score, total) {
      var stars = score === total ? 3 : score >= total * .7 ? 2 : score >= total * .4 ? 1 : 0;
      var prev = P.quiz["v" + i]; if (!prev || stars > prev.stars || (stars === prev.stars && score > prev.score)) { P.quiz["v" + i] = { stars: stars, score: score, total: total, date: today() }; save(); }
      return { stars: stars, xp: score * 3, again: function () { vocabQuiz(d, i); }, back: "#/vocab/" + i };
    });
  }
  /* shared quiz runner: q = {kind:"hear"|"see"|"text", w, opts, prompt?, label?} */
  function runQuiz(qs, finish) {
    var n = 0, score = 0;
    function q() {
      if (n >= qs.length) return result();
      var Q = qs[n], head = "";
      if (Q.kind === "hear") head = '<div class="q-head"><span class="lbl">Listen</span><div class="t">Which picture is it?</div><div class="row" style="display:flex;justify-content:center;margin-top:12px"><button class="play big" id="qPlay" aria-label="Listen again">' + g("sound") + "</button></div></div>";
      else if (Q.kind === "see") head = '<div class="q-head"><span class="lbl">Look</span><div class="t">What is this?</div></div><img class="q-pic" src="' + pic(Q.w.en) + '" alt="">';
      else head = '<div class="q-head"><span class="lbl">' + esc(Q.label || "Question") + '</span><div class="t">' + Q.prompt + "</div></div>";
      var opts = Q.opts.map(function (o, j) {
        if (Q.kind === "hear") return '<button class="card opt picopt" data-j="' + j + '"><img src="' + pic(o.en) + '" alt="' + esc(o.en) + '"></button>';
        if (Q.kind === "see") return '<button class="card opt" data-j="' + j + '">' + esc(o.en) + "</button>";
        return '<button class="card opt txt" data-j="' + j + '">' + esc(o.text) + "</button>";
      }).join("");
      render('<div class="deck-wrap"><div class="prog"><div class="bar"><i style="width:' + Math.round(n / qs.length * 100) + '%"></i></div><span>' + (n + 1) + "/" + qs.length + "</span></div>" + head +
        '<div class="opts' + (Q.kind === "text" ? " one" : "") + '">' + opts + '</div><div class="feedback" id="fb" aria-live="polite"></div></div>');
      if (Q.kind === "hear") { var pb = $("#qPlay"); pb.onclick = function () { say(Q.w.en, pb); }; setTimeout(function () { say(Q.w.en, pb); }, 300); }
      var locked = false;
      main.querySelectorAll(".opt").forEach(function (b) {
        b.onclick = function () {
          if (locked) return; locked = true;
          var o = Q.opts[b.dataset.j], ok = Q.kind === "text" ? o.ok : o.en === Q.w.en;
          main.querySelectorAll(".opt").forEach(function (x) {
            var xo = Q.opts[x.dataset.j], xr = Q.kind === "text" ? xo.ok : xo.en === Q.w.en;
            if (xr) { x.classList.add("right"); x.insertAdjacentHTML("beforeend", '<span class="mk">' + g("check") + "</span>"); }
            else if (x === b) { x.classList.add("wrong"); x.insertAdjacentHTML("beforeend", '<span class="mk">' + g("x") + "</span>"); }
            else x.classList.add("dim");
          });
          if (ok) score++;
          fx(ok ? "right" : "");
          $("#fb").innerHTML = ok ? '<span style="color:var(--good)">' + (TEEN ? "Correct." : "Great job!") + "</span>" : '<span style="color:var(--bad)">' + (Q.kind === "text" ? "Not quite." : "It's “" + esc(Q.w.en) + "”") + "</span>";
          if (Q.kind !== "text") say(Q.w.en);
          else if (Q.say) say(Q.say);
          setTimeout(function () { n++; q(); }, ok ? 1100 : 1900);
        };
      });
    }
    function result() {
      var r = finish(score, qs.length);
      if (r.xp) addXP(r.xp, "quiz");
      if (r.stars >= 2) confetti();
      render('<div class="deck-wrap"><div class="card result"><span class="lbl">Quiz complete</span><div class="stars">' +
        [0, 1, 2].map(function (k) { return '<span class="' + (k < r.stars ? "on" : "off") + '" style="color:var(--accent);animation-delay:' + (k * .18) + 's">' + g("star") + "</span>"; }).join("") +
        '</div><div class="score">' + score + "/" + qs.length + '</div><p class="sub">' + (r.stars === 3 ? "Perfect!" : r.stars === 2 ? "Very good!" : r.stars === 1 ? "Good try. Practise and play again!" : "Keep practising, you've got this!") + "</p>" +
        (r.xp ? '<div class="xpgain">' + g("bolt") + "+" + r.xp + " XP</div>" : "") +
        '<div class="actions"><button class="btn sec" id="qBack">' + g("back") + 'Back</button><button class="btn pri" id="qAgain">' + g("redo") + "Play again</button></div></div></div>");
      $("#qAgain").onclick = r.again; $("#qBack").onclick = function () { location.hash = r.back; };
    }
    q();
  }

  /* ================================================================ IDIOMS */
  function idioms(d, start) {
    setTop("English Hub", "Idioms", "#/");
    var list = d.idioms, pos = Math.max(0, Math.min(list.length - 1, start | 0));
    function card(dir) {
      var it = list[pos], known = !!P.idioms[it.phrase];
      render('<div class="deck-wrap"><div class="prog"><div class="bar"><i style="width:' + Math.round((list.filter(function (x) { return P.idioms[x.phrase]; }).length) / list.length * 100) + '%"></i></div><span>' + (pos + 1) + "/" + list.length + "</span></div>" +
        '<div class="card idiom hb-card-anim" id="ic" style="--from:' + (dir < 0 ? "-40px" : "40px") + '"><span class="lbl">Idiom ' + (pos + 1) + "</span>" +
        '<div class="ph">' + esc(it.phrase) + '</div><div class="ph-ar" dir="rtl">' + esc(it.phraseAr) + "</div>" +
        '<div style="display:flex;justify-content:center;margin-top:12px"><button class="play big" id="iPlay" aria-label="Listen">' + g("sound") + "</button></div>" +
        '<div class="reveal" id="iRev"' + (known ? "" : " hidden") + '><div class="box"><span class="lbl">What it means</span><div class="en">' + esc(it.meaning) + '</div><div class="ar" dir="rtl">' + esc(it.meaningAr) + "</div></div>" +
        '<div class="box ex"><button class="play s" id="iEx" aria-label="Listen to the example">' + g("sound") + '</button><div><div class="en">“' + esc(it.example) + '”</div><div class="ar" dir="rtl">' + esc(it.exampleAr) + "</div></div></div></div>" +
        (known ? "" : '<button class="btn sec wide" id="iShow" style="margin-top:16px">' + g("eye") + "What does it mean?</button>") + "</div>" +
        '<div class="know"><button class="btn no" id="iPrev">' + g("back") + 'Back</button><button class="btn yes" id="iNext">' + (known ? g("next") + "Next" : g("check") + "Got it") + "</button></div>" +
        (list.length >= 4 ? '<button class="btn sec wide" id="iQuiz" style="margin-top:10px">' + g("target") + "Idioms quiz</button>" : "") + "</div>");
      var pl = $("#iPlay"); pl.onclick = function () { say(it.phrase, pl); };
      setTimeout(function () { say(it.phrase, pl); }, 300);
      var sh = $("#iShow"); if (sh) sh.onclick = function () { $("#iRev").hidden = false; sh.remove(); };
      var ex = $("#iEx"); ex.onclick = function () { say(it.example, ex); };
      $("#iPrev").onclick = function () { if (pos > 0) { pos--; card(-1); } else location.hash = "#/"; };
      $("#iNext").onclick = function () {
        if (!P.idioms[it.phrase]) { P.idioms[it.phrase] = today(); save(); addXP(2); }
        if (pos < list.length - 1) { pos++; card(1); } else { confetti(); location.hash = "#/"; }
      };
      var qb = $("#iQuiz"); if (qb) qb.onclick = function () { location.hash = "#/idioms/quiz"; };
      swipe($("#ic"), function (r) { if (r) $("#iNext").click(); else $("#iPrev").click(); });
    }
    card(1);
  }
  function idiomsQuiz(d) {
    setTop("Idioms", "Quiz", "#/idioms");
    var list = shuffle(d.idioms).slice(0, Math.min(8, d.idioms.length));
    runQuiz(list.map(function (it) {
      var wrong = shuffle(d.idioms.filter(function (x) { return x.phrase !== it.phrase; })).slice(0, 2);
      return { kind: "text", label: "What does it mean?", prompt: "“" + esc(it.phrase) + "”", say: it.phrase,
        opts: shuffle([{ text: it.meaning, ok: true }].concat(wrong.map(function (x) { return { text: x.meaning, ok: false }; }))) };
    }), function (score, total) {
      var stars = score === total ? 3 : score >= total * .7 ? 2 : score >= total * .4 ? 1 : 0;
      var prev = P.quiz.idioms; if (!prev || stars > prev.stars) { P.quiz.idioms = { stars: stars, score: score, total: total, date: today() }; save(); }
      return { stars: stars, xp: score * 3, again: function () { idiomsQuiz(d); }, back: "#/idioms" };
    });
  }

  /* ================================================================ GRAMMAR */
  function grammarHome(d) {
    setTop("English Hub", "Grammar", "#/");
    render('<span class="lbl">' + esc(d.levelName) + '</span><h1 class="h1">Grammar</h1><p class="sub">Read the rule, hear the examples, then build the sentences yourself.</p>' +
      '<div class="sec-h"><h2>Rules</h2><span class="sub">' + d.topics.length + '</span></div><div class="topics">' +
      d.topics.map(function (t, i) {
        return '<button class="card topic" data-i="' + i + '"><span class="n">' + (i + 1) + "</span><span><b>" + esc(t.title) + '</b><span class="ar" dir="rtl">' + esc(t.titleAr) + "</span></span>" +
          (P.grammar[t.title] ? '<span class="done">' + g("check") + "</span>" : "") + "</button>";
      }).join("") + "</div>");
    main.querySelectorAll(".topic").forEach(function (b) { b.onclick = function () { location.hash = "#/grammar/" + b.dataset.i; }; });
  }
  function grammarTopic(d, i) {
    var t = d.topics[i]; if (!t) return grammarHome(d);
    setTop("Grammar", t.title, "#/grammar");
    render('<span class="lbl">Rule ' + (+i + 1) + " of " + d.topics.length + '</span><h1 class="h1" style="font-size:clamp(26px,6.5vw,38px)">' + esc(t.title) + "</h1>" +
      '<div class="two"><div><div class="card rule"><span class="lbl">The rule</span><p>' + esc(t.explanation) + '</p><p class="ar" dir="rtl">' + esc(t.explanationAr) + "</p></div>" +
      '<div class="sec-h"><h2>Examples</h2><span class="sub">tap to hear</span></div><div class="exs">' +
      t.examples.map(function (e, j) { return '<div class="card exrow"><div><b>' + esc(e.en) + '</b><span class="ar" dir="rtl">' + esc(e.ar) + '</span></div><button class="play s" data-j="' + j + '" aria-label="Listen">' + g("sound") + "</button></div>"; }).join("") +
      '</div></div><div><div class="sec-h"><h2>Build the sentence</h2></div><div class="card builder" id="bld"></div></div></div>');
    main.querySelectorAll(".exrow .play").forEach(function (b) { b.onclick = function () { say(t.examples[b.dataset.j].en, b); }; });
    builder(t, i, d);
  }
  function words(s) { return s.replace(/\s+/g, " ").trim().split(" "); }
  function builder(t, ti, d) {
    var box = $("#bld"), list = shuffle(t.examples), n = 0, right = 0;
    function one() {
      if (n >= list.length) {
        if (!P.grammar[t.title]) { P.grammar[t.title] = today(); save(); }
        addXP(right * 3, "grammar"); if (right === list.length) confetti();
        box.innerHTML = '<div class="result" style="padding:10px 4px"><span class="lbl">Done</span><div class="score">' + right + "/" + list.length + '</div><p class="sub">sentences right first time</p>' +
          '<div class="actions"><button class="btn sec" id="bAgain">' + g("redo") + "Again</button>" + (d.topics[+ti + 1] ? '<button class="btn pri" id="bNext">' + g("next") + "Next rule</button>" : '<button class="btn pri" id="bAll">' + g("check") + "All rules</button>") + "</div></div>";
        $("#bAgain").onclick = function () { builder(t, ti, d); };
        var nx = $("#bNext"); if (nx) nx.onclick = function () { location.hash = "#/grammar/" + (+ti + 1); };
        var al = $("#bAll"); if (al) al.onclick = function () { location.hash = "#/grammar"; };
        return;
      }
      var ex = list[n], target = words(ex.en), tries = 0;
      var chips = shuffle(target.map(function (w, k) { return { w: w, k: k }; }));
      if (chips.map(function (c) { return c.w; }).join(" ") === target.join(" ") && chips.length > 1) chips.reverse();
      box.innerHTML = '<span class="lbl">Sentence ' + (n + 1) + " of " + list.length + '</span><p class="sub" dir="rtl" style="margin:6px 0 10px;text-align:left;font-size:16px">' + esc(ex.ar) + "</p>" +
        '<div class="slots" id="slots" aria-label="Your sentence"></div><div class="pool" id="pool">' + chips.map(function (c, j) { return '<button class="chip" data-j="' + j + '">' + esc(c.w) + "</button>"; }).join("") + "</div>" +
        '<div class="actions"><button class="btn sec" id="bClear">' + g("redo") + 'Clear</button><button class="btn pri" id="bCheck">' + g("check") + "Check</button></div>";
      var slots = $("#slots"), pool = $("#pool");
      box.querySelectorAll(".chip").forEach(function (c) {
        c.onclick = function () { (c.parentNode === pool ? slots : pool).appendChild(c); slots.classList.remove("bad", "good"); };
      });
      $("#bClear").onclick = function () { Array.prototype.slice.call(slots.children).forEach(function (c) { pool.appendChild(c); }); slots.classList.remove("bad"); };
      $("#bCheck").onclick = function () {
        var got = Array.prototype.map.call(slots.children, function (c) { return c.textContent; }).join(" ");
        if (got === target.join(" ")) {
          slots.classList.add("good"); fx("right"); if (tries === 0) right++;
          say(ex.en);
          setTimeout(function () { n++; one(); }, 1300);
        } else {
          tries++; slots.classList.remove("bad"); void slots.offsetWidth; slots.classList.add("bad"); fx("");
          if (tries >= 2) toast(g("eye") + "It starts with “" + esc(target[0]) + "”");
        }
      };
    }
    one();
  }

  /* ================================================================ PHONICS */
  function phonicsHome(d) {
    setTop("English Hub", "Phonics", "#/");
    render('<span class="lbl">' + esc(d.levelName) + '</span><h1 class="h1">Phonics</h1><p class="sub">Tap each sound and say it out loud. Then read the words and the little story.</p>' +
      '<div class="sec-h"><h2>Sound groups</h2><span class="sub">' + d.units.length + '</span></div><div class="topics">' +
      d.units.map(function (u, i) {
        return '<button class="card topic" data-i="' + i + '"><span class="n">' + (i + 1) + "</span><span><b>" + esc(u.unit) + '</b><span class="ar" dir="rtl">' + esc(u.unitAr) + "</span></span>" + (P.sounds[u.unit] ? '<span class="done">' + g("check") + "</span>" : "") + "</button>";
      }).join("") + "</div>");
    main.querySelectorAll(".topic").forEach(function (b) { b.onclick = function () { location.hash = "#/phonics/" + b.dataset.i; }; });
  }
  function soundLetters(word, sounds) {
    var toks = sounds.map(function (s) { return String(s.letter).toLowerCase(); }).sort(function (a, b) { return b.length - a.length; });
    var out = "", w = String(word), i = 0;
    while (i < w.length) {
      var hit = toks.filter(function (t) { return t && w.toLowerCase().substr(i, t.length) === t; })[0];
      if (hit) { out += "<i>" + esc(w.substr(i, hit.length)) + "</i>"; i += hit.length; } else { out += esc(w[i]); i++; }
    }
    return out;
  }
  function phonicsUnit(d, i) {
    var u = d.units[i]; if (!u) return phonicsHome(d);
    setTop("Phonics", u.unit, "#/phonics");
    render('<span class="lbl">Group ' + (+i + 1) + " of " + d.units.length + '</span><h1 class="h1" style="font-size:clamp(26px,6.5vw,38px)">' + esc(u.unit) + "</h1>" +
      '<div class="sec-h"><h2>Sounds</h2><span class="sub">tap to hear</span></div><div class="sounds">' +
      u.sounds.map(function (s, j) { return '<button class="card sound" data-j="' + j + '"><div class="L">' + esc(s.letter) + '</div><div class="S">' + esc(s.sound) + '</div><span class="ar" dir="rtl">' + esc(s.ar) + "</span></button>"; }).join("") + "</div>" +
      '<div class="sec-h"><h2>Words</h2></div><div class="words">' +
      u.words.map(function (w, j) {
        // words without a picture get a letter tile instead, with this group's sounds lit up
        return '<button class="card word" data-w="' + j + '"><img src="' + pic(w.en) + '" alt="" loading="lazy" onerror="this.parentNode.classList.add(\'nopic\')">' +
          '<span class="wt" aria-hidden="true"><span>' + soundLetters(w.en, u.sounds) + "</span></span><b>" + esc(w.en) + '</b><span class="ar" dir="rtl">' + esc(w.ar) + "</span></button>";
      }).join("") + "</div>" +
      (u.story ? '<div class="sec-h"><h2>Read the story</h2></div><div class="card story"><button class="play" id="stPlay" aria-label="Listen">' + g("sound") + '</button><div><p>' + esc(u.story.en) + '</p><p class="ar" dir="rtl">' + esc(u.story.ar) + "</p></div></div>" : "") +
      (u.tip ? '<div class="box tip"><span class="lbl">Tip</span><div class="ar" dir="rtl" style="color:var(--ink)">' + esc(u.tip) + "</div></div>" : "") +
      '<button class="btn pri wide" id="phDone" style="margin-top:18px">' + g("check") + (P.sounds[u.unit] ? "Practised" : "I practised these sounds") + "</button>");
    main.querySelectorAll(".sound").forEach(function (b) { b.onclick = function () { sayPhonics(u.sounds[b.dataset.j].letter, b); }; });
    main.querySelectorAll(".word").forEach(function (b) { b.onclick = function () { say(u.words[b.dataset.w].en, b); }; });
    var sp = $("#stPlay"); if (sp) sp.onclick = function () { say(u.story.en, sp); };
    $("#phDone").onclick = function () {
      if (!P.sounds[u.unit]) { P.sounds[u.unit] = today(); save(); addXP(5, "phonics"); }
      location.hash = d.units[+i + 1] ? "#/phonics/" + (+i + 1) : "#/phonics";
    };
  }

  /* ================================================================ SPELLING */
  function spelling(d, i) {
    setTop("English Hub", "Spelling", "#/");
    var pos = Math.max(0, Math.min(d.rules.length - 1, i | 0)), r = d.rules[pos], ex = r.example || {};
    render('<div class="deck-wrap" style="max-width:640px"><div class="prog"><div class="bar"><i style="width:' + Math.round(pos / d.rules.length * 100) + '%"></i></div><span>Rule ' + (pos + 1) + "/" + d.rules.length + "</span></div>" +
      (pos === 0 && d.intro ? '<div class="card rule" style="margin-bottom:12px"><span class="lbl">Start here</span><p>' + esc(d.intro) + '</p><p class="ar" dir="rtl">' + esc(d.introAr) + "</p></div>" : "") +
      '<div class="card rule hb-card-anim"><span class="lbl">Rule ' + (pos + 1) + '</span><h2 style="margin:6px 0 0;font-size:24px;letter-spacing:-.02em">' + esc(r.title) + '</h2><p class="ar" dir="rtl" style="margin-top:4px">' + esc(r.titleAr) + "</p>" +
      (ex.letter ? '<div class="sounds" style="margin-top:14px"><button class="card sound" id="spL"><div class="L">' + esc(ex.letter) + '</div><div class="S">name: “' + esc(ex.name) + '”</div></button>' +
        '<button class="card sound" id="spS"><div class="L">' + esc(ex.letter.toLowerCase()) + '</div><div class="S">sound: “' + esc(ex.sound) + '”</div></button>' +
        (ex.word ? '<button class="card sound" id="spW"><img src="' + pic(ex.word) + '" alt="" style="width:60px;height:60px;object-fit:contain" onerror="this.remove()"><div class="S">' + esc(ex.word) + "</div></button>" : "") + "</div>" : "") +
      "<p>" + esc(r.explanation) + '</p><p class="ar" dir="rtl">' + esc(r.explanationAr) + "</p>" +
      (r.goal ? '<div class="box" style="margin-top:12px"><span class="lbl">Why it matters</span><div class="en" style="font-size:15.5px">' + esc(r.goal) + '</div><div class="ar" dir="rtl">' + esc(r.goalAr) + "</div></div>" : "") + "</div>" +
      '<div class="know"><button class="btn no" id="sPrev">' + g("back") + 'Back</button><button class="btn yes" id="sNext">' + g("check") + (pos < d.rules.length - 1 ? "Got it" : "Finish") + "</button></div></div>");
    var a = $("#spL"); if (a) a.onclick = function () { say(ex.letter.toLowerCase(), a); };
    var b = $("#spS"); if (b) b.onclick = function () { sayPhonics(ex.letter.toLowerCase(), b); };
    var c = $("#spW"); if (c) c.onclick = function () { say(ex.word, c); };
    $("#sPrev").onclick = function () { location.hash = pos > 0 ? "#/spelling/" + (pos - 1) : "#/"; };
    $("#sNext").onclick = function () {
      if (!P.spelling[r.id]) { P.spelling[r.id] = today(); save(); addXP(3); }
      if (pos < d.rules.length - 1) location.hash = "#/spelling/" + (pos + 1); else { confetti(); location.hash = "#/"; }
    };
  }

  /* ================================================================ WRITING */
  function writingHome(d) {
    setTop("English Hub", "Writing", "#/");
    render('<span class="lbl">' + esc(d.levelName) + '</span><h1 class="h1">Writing</h1><p class="sub">Hear the question, say your answer out loud, then write it down. Your answers stay saved here.</p>' +
      '<div class="sec-h"><h2>Prompts</h2><span class="sub">' + d.prompts.length + '</span></div><div class="topics">' +
      d.prompts.map(function (p, i) {
        return '<button class="card topic" data-i="' + i + '"><span class="n">' + (i + 1) + "</span><span><b>" + esc(p.en) + '</b><span class="ar" dir="rtl">' + esc(p.ar) + "</span></span>" + (P.writing[i] && P.writing[i].done ? '<span class="done">' + g("check") + "</span>" : "") + "</button>";
      }).join("") + "</div>");
    main.querySelectorAll(".topic").forEach(function (b) { b.onclick = function () { location.hash = "#/writing/" + b.dataset.i; }; });
  }
  function writingPrompt(d, i) {
    var p = d.prompts[i]; if (!p) return writingHome(d);
    setTop("Writing", "Prompt " + (+i + 1), "#/writing");
    var rec = P.writing[i] || {};
    var goal = TEEN ? 25 : LEVEL === "pre-a" ? 3 : 8;
    render('<div class="deck-wrap" style="max-width:680px"><div class="card prompt"><div style="display:flex;gap:12px;align-items:flex-start"><div style="flex:1"><span class="lbl">Prompt ' + (+i + 1) + " of " + d.prompts.length + '</span><div class="q">' + esc(p.en) + '</div><div class="ar" dir="rtl">' + esc(p.ar) + "</div></div>" +
      '<button class="play" id="wPlay" aria-label="Hear the prompt">' + g("sound") + "</button></div>" +
      '<textarea class="write" id="wTxt" placeholder="' + (TEEN ? "Write your answer in English..." : "Write your answer here...") + '" spellcheck="true" lang="en">' + esc(rec.text || "") + "</textarea>" +
      '<div class="wmeta"><span id="wCount"></span><span id="wSaved"></span></div>' +
      '<div class="checks"><div class="check" id="c1"><i>' + g("check") + "</i>At least " + goal + ' words</div><div class="check" id="c2"><i>' + g("check") + '</i>Starts with a capital letter</div><div class="check" id="c3"><i>' + g("check") + "</i>Ends with . ! or ?</div></div>" +
      '<button class="btn pri wide" id="wDone" style="margin-top:16px">' + g("check") + (rec.done ? "Saved" : "I'm done") + "</button></div></div>");
    var ta = $("#wTxt"), pl = $("#wPlay"), saveT;
    pl.onclick = function () { say(p.en, pl); };
    function upd() {
      var v = ta.value.trim(), n = v ? v.split(/\s+/).length : 0;
      $("#wCount").textContent = n + (n === 1 ? " word" : " words");
      $("#c1").classList.toggle("on", n >= goal); $("#c2").classList.toggle("on", /^[A-Z]/.test(v)); $("#c3").classList.toggle("on", /[.!?]["')]?$/.test(v));
      return n;
    }
    upd();
    ta.oninput = function () { upd(); clearTimeout(saveT); saveT = setTimeout(function () { P.writing[i] = Object.assign({}, P.writing[i], { text: ta.value }); save(); $("#wSaved").textContent = "Saved"; }, 500); };
    $("#wDone").onclick = function () {
      var n = upd(); if (n < 1) { ta.focus(); return; }
      var first = !(P.writing[i] && P.writing[i].done);
      P.writing[i] = { text: ta.value, done: today() }; save();
      if (first) { addXP(n >= goal ? 10 : 5, "writing"); confetti(); }
      location.hash = d.prompts[+i + 1] ? "#/writing/" + (+i + 1) : "#/writing";
    };
  }

  /* ================================================================ router */
  function route() {
    var h = (location.hash || "#/").replace(/^#\/?/, "").split("/"), type = h[0];
    if (!type) return home();
    if (!DIRS[type]) return home();
    load(type).then(function (d) {
      if (!d) { setTop("English Hub", "Coming soon", "#/"); return render('<div class="empty">This part isn’t ready for your level yet. Check back soon!</div>'); }
      if (type === "vocab") return h[1] == null ? vocabHome(d) : h[2] === "learn" ? vocabLearn(d, h[1]) : h[2] === "quiz" ? vocabQuiz(d, h[1]) : vocabTheme(d, h[1]);
      if (type === "idioms") return h[1] === "quiz" ? idiomsQuiz(d) : idioms(d, h[1]);
      if (type === "grammar") return h[1] == null ? grammarHome(d) : grammarTopic(d, h[1]);
      if (type === "phonics") return h[1] == null ? phonicsHome(d) : phonicsUnit(d, h[1]);
      if (type === "spelling") return spelling(d, h[1]);
      if (type === "writing") return h[1] == null ? writingHome(d) : writingPrompt(d, h[1]);
    });
  }
  backBtn.innerHTML = g("back");
  paintXP();
  window.addEventListener("hashchange", route);
  route();
})();
