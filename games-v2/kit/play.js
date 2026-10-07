/* ============================================================
   Lumio Play kit (window.LP): scene, HUD, actors, cards, FX, sound,
   title screen, round banners and the results screen for games-v2/.
   Needs vendor/gsap (required) and vendor/lottie-light (optional),
   plus js/app.js (Lumio.speak / Lumio.music / sound setting).
   Every animation is transform/opacity; prefers-reduced-motion gets
   the same game with calm, near-instant transitions and no ambient motion.
   ============================================================ */
(function () {
  "use strict";
  const KIT_SRC = (document.currentScript && document.currentScript.src) || location.href;
  const ROOT = new URL("../../", KIT_SRC).href;            // site root (…/lumio/)
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const G = window.gsap;
  const $ = (s, r) => (r || document).querySelector(s);
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const rnd = (a, b) => a + Math.random() * (b - a);
  const wait = ms => new Promise(r => setTimeout(r, RM ? Math.min(ms, 120) : ms));
  const center = n => { const r = n.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, r }; };
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const D = d => RM ? 0.01 : d;                            // duration helper

  const ICON = {
    star: '<svg viewBox="0 0 48 48" class="ico" aria-hidden="true"><defs><linearGradient id="lpSg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE27A"/><stop offset="1" stop-color="#FFB300"/></linearGradient></defs><path d="M24 3.5l6.2 12.6 13.9 2-10 9.8 2.4 13.8L24 35.2l-12.5 6.5 2.4-13.8-10-9.8 13.9-2z" fill="url(#lpSg)" stroke="#E08A00" stroke-width="2.4" stroke-linejoin="round"/><path d="M17 15.5l3.2-1" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/></svg>',
    starOff: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 3.5l6.2 12.6 13.9 2-10 9.8 2.4 13.8L24 35.2l-12.5 6.5 2.4-13.8-10-9.8 13.9-2z" fill="rgba(120,90,60,.18)" stroke="rgba(120,90,60,.3)" stroke-width="2.4" stroke-linejoin="round"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5z" fill="currentColor"/></svg>',
    again: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    speaker: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 9v6h4l5 5V4L8 9H4z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 010 7M19 6a9 9 0 010 12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    soundOn: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 9v6h4l5 5V4L8 9H4z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 010 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    soundOff: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 9v6h4l5 5V4L8 9H4z" fill="currentColor"/><path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  const LP = { ROOT, RM, ICON, esc, wait, center, el };
  LP.asset = p => ROOT + String(p).replace(/^\/+/, "");
  LP.char = (name, pose) => LP.asset(`assets/story/characters/${name}-${pose}.png`);
  LP.vocabImg = w => LP.asset(`assets/vocab/${String(w).toLowerCase().replace(/'/g, "").replace(/ /g, "-")}.png`);
  const soundOn = () => { try { return localStorage.getItem("lumio_sound") !== "off"; } catch (e) { return true; } };

  /* ============ Sound: small synthesized effects (no files needed) ============ */
  let AC = null, master = null;
  const ac = () => {
    if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); master = AC.createGain(); master.gain.value = .5; master.connect(AC.destination); } catch (e) { return null; } }
    if (AC.state === "suspended") AC.resume();
    return AC;
  };
  function tone(f, t0, dur, type, vol, f2) {
    const c = AC, o = c.createOscillator(), g = c.createGain();
    o.type = type || "sine"; o.frequency.setValueAtTime(f, t0);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol || .2, t0 + .012); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + dur + .02);
  }
  function noise(t0, dur, vol, fFrom, fTo, q) {
    const c = AC, len = Math.max(1, Math.floor(c.sampleRate * dur)), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = buf; f.type = "bandpass"; f.Q.value = q || 1.2; f.frequency.setValueAtTime(fFrom, t0); if (fTo) f.frequency.exponentialRampToValueAtTime(fTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + dur * .25); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    s.connect(f); f.connect(g); g.connect(master); s.start(t0); s.stop(t0 + dur);
  }
  const SFX = {
    tap: t => { tone(1100, t, .05, "triangle", .08); },
    pop: t => { tone(720, t, .09, "sine", .22, 240); noise(t, .06, .08, 2400); },
    deal: t => { noise(t, .07, .07, 3000, 1400, 2); },
    flip: t => { noise(t, .14, .08, 900, 3600, 1.5); },
    whoosh: t => { noise(t, .32, .11, 400, 2600, .8); },
    correct: t => { [784, 988, 1319].forEach((f, i) => { tone(f, t + i * .075, .28, "triangle", .16); tone(f * 2, t + i * .075, .18, "sine", .05); }); },
    wrong: t => { tone(330, t, .16, "square", .05, 300); tone(247, t + .13, .26, "square", .05, 220); tone(165, t, .4, "sine", .12, 140); },
    star: t => { [1568, 2093, 2637, 3136].forEach((f, i) => tone(f, t + i * .045, .3, "sine", .07)); },
    coin: t => { tone(988, t, .08, "square", .06); tone(1319, t + .07, .3, "square", .06); },
    tick: t => { tone(1500, t, .03, "square", .04); },
    win: t => { [523, 659, 784, 1047].forEach((f, i) => { tone(f, t + i * .12, .5, "triangle", .15); tone(f / 2, t + i * .12, .5, "sine", .08); }); [1319, 1568, 2093].forEach((f, i) => tone(f, t + .55 + i * .06, .9, "sine", .07)); },
    rise: t => { tone(300, t, .35, "sine", .1, 900); },
    boom: t => { tone(120, t, .5, "sine", .3, 50); noise(t, .3, .12, 300, 80); }
  };
  LP.sfx = (name) => { if (!soundOn()) return; const c = ac(); if (!c || !SFX[name]) return; try { SFX[name](c.currentTime + .005); } catch (e) {} };

  /* speak through the site's voice (recorded clip when one exists, else the browser voice) */
  LP.say = (text, btn) => {
    if (!text) return;
    try { window.Lumio && Lumio.speak(text); } catch (e) {}
    if (btn) { btn.classList.add("talking"); clearTimeout(btn._t); btn._t = setTimeout(() => btn.classList.remove("talking"), 1400); if (G && !RM) G.fromTo(btn, { scale: .9 }, { scale: 1, duration: .5, ease: "elastic.out(1,.4)" }); }
  };

  /* ============ Scene ============ */
  const PARTS = {
    motes:     { n: 34, col: ["255,240,200", "255,214,140"], size: [1.2, 3.2], vy: [-.18, -.05], vx: [-.08, .08], glow: 1 },
    fireflies: { n: 26, col: ["255,236,140", "190,255,160"], size: [1.5, 3], vy: [-.15, .15], vx: [-.2, .2], glow: 1, blink: 1 },
    stars:     { n: 70, col: ["255,255,255", "200,210,255"], size: [.6, 1.8], vy: [0, 0], vx: [0, 0], blink: 1 },
    leaves:    { n: 16, col: ["126,190,80", "245,180,60", "230,120,50"], size: [5, 9], vy: [.25, .6], vx: [-.25, .25], leaf: 1 },
    petals:    { n: 18, col: ["255,182,200", "255,220,230", "255,240,200"], size: [4, 7], vy: [.2, .5], vx: [-.3, .1], leaf: 1 },
    bubbles:   { n: 22, col: ["255,255,255"], size: [4, 14], vy: [-.5, -.2], vx: [-.1, .1], bubble: 1 },
    snow:      { n: 50, col: ["255,255,255"], size: [1.2, 3.4], vy: [.3, .8], vx: [-.2, .2] },
    neon:      { n: 30, col: ["140,160,255", "255,120,220", "120,240,255"], size: [1, 2.6], vy: [-.2, -.05], vx: [-.1, .1], glow: 1, blink: 1 }
  };
  LP.scene = (opt) => {
    opt = opt || {};
    let sc = $(".lp-scene");
    if (!sc) {
      sc = el("div", "lp-scene");
      sc.innerHTML = '<div class="bg a"></div><div class="bg b"></div><div class="tint"></div><div class="light"></div><canvas></canvas><div class="vig"></div>';
      document.body.prepend(sc);
    }
    const a = $(".bg.a", sc), b = $(".bg.b", sc);
    if (opt.bg) { a.style.backgroundImage = `url("${LP.asset(opt.bg)}")`; if (opt.pos) a.style.backgroundPosition = opt.pos; }
    $(".tint", sc).style.background = opt.tint || "transparent";
    $(".light", sc).style.display = opt.light === false ? "none" : "";
    if (G && !RM) {
      G.to([a, b], { scale: 1.1, duration: 28, ease: "sine.inOut", yoyo: true, repeat: -1 });
      G.to($(".light", sc), { opacity: .55, x: "4%", duration: 7, ease: "sine.inOut", yoyo: true, repeat: -1 });
      const move = (x, y) => G.to([a, b], { x: x * -18, y: y * -12, duration: 1.4, ease: "power2.out", overwrite: "auto" });
      addEventListener("pointermove", e => move(e.clientX / innerWidth - .5, e.clientY / innerHeight - .5), { passive: true });
    }
    particles($("canvas", sc), PARTS[opt.particles] || null);
    LP.sceneEl = sc;
    return sc;
  };
  /* crossfade the scene to another painting (e.g. next stage of a build) */
  LP.sceneTo = (bg, pos) => {
    const sc = LP.sceneEl; if (!sc) return;
    const a = $(".bg.a", sc), b = $(".bg.b", sc);
    b.style.backgroundImage = `url("${LP.asset(bg)}")`; b.style.backgroundPosition = pos || "center";
    if (!G) { a.style.backgroundImage = b.style.backgroundImage; return; }
    G.fromTo(b, { opacity: 0 }, { opacity: 1, duration: D(1.1), ease: "power2.inOut", onComplete: () => { a.style.backgroundImage = b.style.backgroundImage; a.style.backgroundPosition = b.style.backgroundPosition; G.set(b, { opacity: 0 }); } });
  };

  function particles(cv, cfg) {
    if (!cv) return;
    const ctx = cv.getContext("2d"); let W = 0, H = 0, dpr = Math.min(2, devicePixelRatio || 1), list = [];
    const size = () => { W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size(); addEventListener("resize", size);
    if (!cfg) return;
    const n = RM ? Math.round(cfg.n / 3) : cfg.n;
    const mk = (init) => ({ x: rnd(0, W), y: init ? rnd(0, H) : (cfg.vy[1] > 0 ? -12 : H + 12), s: rnd(cfg.size[0], cfg.size[1]), vx: rnd(cfg.vx[0], cfg.vx[1]), vy: rnd(cfg.vy[0], cfg.vy[1]) || (cfg.blink ? 0 : -.1),
      c: cfg.col[Math.floor(Math.random() * cfg.col.length)], p: rnd(0, 6.28), r: rnd(0, 6.28), vr: rnd(-.03, .03) });
    for (let i = 0; i < n; i++) list.push(mk(true));
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (const q of list) {
        if (!RM) { q.x += q.vx + (cfg.leaf ? Math.sin(q.p) * .4 : 0); q.y += q.vy; q.p += .02; q.r += q.vr; }
        if (q.y < -20 || q.y > H + 20 || q.x < -20 || q.x > W + 20) Object.assign(q, mk(false));
        let a = cfg.blink ? .35 + .65 * Math.abs(Math.sin(q.p * 1.3)) : .8;
        ctx.save(); ctx.translate(q.x, q.y);
        if (cfg.leaf) { ctx.rotate(q.r); ctx.fillStyle = `rgba(${q.c},.85)`; ctx.beginPath(); ctx.ellipse(0, 0, q.s, q.s * .45, 0, 0, 6.28); ctx.fill(); }
        else if (cfg.bubble) { ctx.strokeStyle = `rgba(${q.c},.6)`; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(0, 0, q.s, 0, 6.28); ctx.stroke(); ctx.fillStyle = "rgba(255,255,255,.5)"; ctx.beginPath(); ctx.arc(-q.s * .35, -q.s * .35, q.s * .22, 0, 6.28); ctx.fill(); }
        else {
          if (cfg.glow) { const g = ctx.createRadialGradient(0, 0, 0, 0, 0, q.s * 4); g.addColorStop(0, `rgba(${q.c},${a * .9})`); g.addColorStop(1, `rgba(${q.c},0)`); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, q.s * 4, 0, 6.28); ctx.fill(); }
          ctx.fillStyle = `rgba(${q.c},${a})`; ctx.beginPath(); ctx.arc(0, 0, q.s, 0, 6.28); ctx.fill();
        }
        ctx.restore();
      }
      if (!RM) raf = requestAnimationFrame(draw);
    };
    let raf = requestAnimationFrame(draw);
    document.addEventListener("visibilitychange", () => { cancelAnimationFrame(raf); if (!document.hidden) raf = requestAnimationFrame(draw); });
  }

  /* ============ FX layer: bursts of confetti and stars ============ */
  let fxCv, fxCtx, fxList = [], fxRaf = 0, fxDpr = 1;
  function fxInit() {
    if (fxCv) return;
    fxCv = el("canvas", "lp-fx"); document.body.appendChild(fxCv); fxCtx = fxCv.getContext("2d");
    const size = () => { fxDpr = Math.min(2, devicePixelRatio || 1); fxCv.width = innerWidth * fxDpr; fxCv.height = innerHeight * fxDpr; fxCtx.setTransform(fxDpr, 0, 0, fxDpr, 0, 0); };
    size(); addEventListener("resize", size);
  }
  function starPath(c, r) { c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } c.closePath(); }
  function fxLoop() {
    fxCtx.clearRect(0, 0, innerWidth, innerHeight);
    fxList = fxList.filter(p => p.life > 0);
    for (const p of fxList) {
      p.vy += p.g; p.vx *= .985; p.vy *= .985; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life -= 1;
      const a = Math.min(1, p.life / 25);
      fxCtx.save(); fxCtx.globalAlpha = a; fxCtx.translate(p.x, p.y); fxCtx.rotate(p.rot); fxCtx.fillStyle = p.c;
      if (p.t === "ring") { fxCtx.globalAlpha = a * .8; fxCtx.strokeStyle = p.c; fxCtx.lineWidth = 4 * (p.life / p.max); fxCtx.beginPath(); fxCtx.arc(0, 0, p.r0 + (p.max - p.life) * p.vr0, 0, 6.28); fxCtx.stroke(); }
      else if (p.t === "star") { starPath(fxCtx, p.s); fxCtx.fill(); }
      else if (p.t === "dot") { fxCtx.beginPath(); fxCtx.arc(0, 0, p.s * .6, 0, 6.28); fxCtx.fill(); }
      else { fxCtx.scale(1, Math.cos(p.rot * 2)); fxCtx.fillRect(-p.s, -p.s * .5, p.s * 2, p.s); }
      fxCtx.restore();
    }
    fxRaf = fxList.length ? requestAnimationFrame(fxLoop) : 0;
    if (!fxRaf) fxCtx.clearRect(0, 0, innerWidth, innerHeight);
  }
  const COLORS = ["#FFC93C", "#F97316", "#22C55E", "#3BA0FF", "#FF5C8A", "#A06BFF"];
  LP.burst = (x, y, o) => {
    o = o || {}; fxInit();
    const n = RM ? 0 : (o.n || 26), cols = o.colors || COLORS, sp = o.speed || 7;
    for (let i = 0; i < n; i++) {
      const a = rnd(0, Math.PI * 2), v = rnd(sp * .35, sp);
      fxList.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - (o.up || 2), g: o.g == null ? .22 : o.g, rot: rnd(0, 6), vr: rnd(-.25, .25),
        s: rnd(4, 8) * (o.scale || 1), c: cols[i % cols.length], t: o.shape || (i % 3 === 0 ? "star" : i % 3 === 1 ? "rect" : "dot"), life: rnd(45, 75) });
    }
    if (o.ring !== false) fxList.push({ t: "ring", x, y, vx: 0, vy: 0, g: 0, rot: 0, vr: 0, r0: o.r0 || 20, vr0: o.ringSpeed || 3.2, c: o.ringColor || "#FFD666", life: 22, max: 22 });
    if (!fxRaf) fxRaf = requestAnimationFrame(fxLoop);
  };
  LP.rain = (o) => { // full-screen confetti rain (results)
    o = o || {}; fxInit(); if (RM) return;
    const n = o.n || 120;
    for (let i = 0; i < n; i++) fxList.push({ x: rnd(0, innerWidth), y: rnd(-innerHeight * .6, -10), vx: rnd(-1, 1), vy: rnd(2, 5), g: .05, rot: rnd(0, 6), vr: rnd(-.2, .2),
      s: rnd(4, 8), c: COLORS[i % COLORS.length], t: i % 4 === 0 ? "star" : "rect", life: rnd(140, 220) });
    if (!fxRaf) fxRaf = requestAnimationFrame(fxLoop);
  };

  /* ============ HUD ============ */
  let hud = null, starN = 0, segs = [];
  LP.hud = (o) => {
    o = o || {};
    hud = el("header", "lp-hud");
    const exit = el("a", "lp-chip lp-exit", ICON.back + '<span class="t">' + esc(o.exitLabel || "Exit") + "</span>");
    exit.href = o.exitHref || "../student.html"; exit.setAttribute("aria-label", "Exit game");
    const prog = el("div", "lp-prog"); prog.setAttribute("role", "progressbar"); prog.setAttribute("aria-valuemin", "0"); prog.setAttribute("aria-valuemax", String(o.rounds || 6)); prog.setAttribute("aria-label", "Progress");
    segs = []; for (let i = 0; i < (o.rounds || 6); i++) { const s = el("i", "", "<b></b>"); prog.appendChild(s); segs.push(s); }
    const stars = el("div", "lp-chip lp-stars", ICON.star + '<span class="n" aria-live="polite">0</span>');
    stars.setAttribute("aria-label", "Stars");
    hud.append(exit, prog, stars);
    if (o.extra) hud.insertBefore(o.extra, stars);
    document.body.appendChild(hud);
    LP.hud.exit = exit; LP.hud.stars = stars; LP.hud.prog = prog;
    soundButton();
    return hud;
  };
  LP.round = (i) => { segs.forEach((s, k) => s.classList.toggle("now", k === i)); if (LP.hud.prog) LP.hud.prog.setAttribute("aria-valuenow", String(i)); };
  LP.fill = (i) => { const s = segs[i]; if (!s) return; s.classList.remove("now"); const b = s.firstChild; if (G) G.to(b, { scaleX: 1, duration: D(.7), ease: "elastic.out(1,.6)" }); else b.style.transform = "scaleX(1)"; };
  LP.setStars = (n) => { starN = n; if (LP.hud.stars) $(".n", LP.hud.stars).textContent = n; };
  LP.addStar = (fromEl, n) => {
    n = n || 1; const target = LP.hud.stars ? $(".ico", LP.hud.stars) : null;
    const done = () => { LP.setStars(starN + n); LP.sfx("star"); if (G && target) { G.fromTo(LP.hud.stars, { scale: 1.25 }, { scale: 1, duration: D(.6), ease: "elastic.out(1,.4)" }); const c = center(target); LP.burst(c.x, c.y, { n: 10, speed: 4, ring: true, r0: 8, ringSpeed: 2, shape: "star", colors: ["#FFD666", "#FFB300", "#fff"] }); } };
    if (!G || !target || !fromEl || RM) { done(); return Promise.resolve(); }
    const a = center(fromEl), b = center(target);
    const s = el("div", "", ICON.star); s.style.cssText = "position:fixed;left:0;top:0;width:44px;height:44px;z-index:300;pointer-events:none;margin:-22px 0 0 -22px"; document.body.appendChild(s);
    const cx = (a.x + b.x) / 2 + rnd(-90, 90), cy = Math.min(a.y, b.y) - 140, o = { t: 0 };
    return new Promise(res => G.to(o, { t: 1, duration: .85, ease: "power2.in", onUpdate() {
      const t = o.t, x = (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * cx + t * t * b.x, y = (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * cy + t * t * b.y;
      G.set(s, { x, y, rotation: t * 360, scale: 1.3 - t * .7 });
      if (Math.random() < .5) fxList.push({ x, y, vx: rnd(-.5, .5), vy: rnd(-.5, .5), g: .02, rot: 0, vr: 0, s: rnd(2, 4), c: "#FFE27A", t: "dot", life: 18 }), fxInit(), fxRaf || (fxRaf = requestAnimationFrame(fxLoop));
    }, onComplete() { s.remove(); done(); res(); } }));
  };

  function soundButton() {
    const b = el("button", "lp-chip lp-sound"); b.type = "button";
    const paint = () => { const on = soundOn(); b.innerHTML = on ? ICON.soundOn : ICON.soundOff; b.setAttribute("aria-pressed", String(on)); b.setAttribute("aria-label", on ? "Sound on (tap to mute)" : "Sound off (tap to turn on)"); };
    b.onclick = () => { const on = !soundOn(); try { window.Lumio && Lumio.setSound ? Lumio.setSound(on) : localStorage.setItem("lumio_sound", on ? "on" : "off"); } catch (e) {} if (on) LP.music(); else { try { Lumio.music(""); } catch (e) {} } paint(); LP.sfx("tap"); };
    paint(); document.body.appendChild(b);
  }
  LP.music = () => { try { if (soundOn() && window.Lumio && Lumio.music) Lumio.music(LP.track || "games"); } catch (e) {} };

  /* ============ Press feel on every tappable thing ============ */
  const PRESS = ".lp-btn,.lp-card,.lp-word,.lp-chip,.lp-speak,.lp-bubble,[data-press]";
  document.addEventListener("pointerdown", e => {
    const t = e.target.closest(PRESS); if (!t || t.disabled || !G || RM) return;
    G.to(t, { scale: .93, duration: .1, ease: "power2.out", overwrite: "auto" });
    const up = () => { G.to(t, { scale: 1, duration: .55, ease: "elastic.out(1.1,.45)", overwrite: "auto" }); removeEventListener("pointerup", up); removeEventListener("pointercancel", up); };
    addEventListener("pointerup", up); addEventListener("pointercancel", up);
  }, { passive: true });

  /* ============ Actor: real character art that breathes and reacts ============ */
  LP.actor = (host, o) => {
    o = o || {};
    const wrap = el("div", "lp-actor"); if (o.height) wrap.style.height = typeof o.height === "number" ? o.height + "px" : o.height;
    const idleL = el("div", "body"); const body = el("div", "act"); const img = el("img"); img.alt = o.alt || ""; img.draggable = false;
    const shadow = el("div", "shadow");
    body.appendChild(img); idleL.appendChild(body); wrap.append(shadow, idleL); if (host) host.appendChild(wrap);
    const poses = Object.assign({}, o.poses || {});
    const src = p => poses[p] || LP.char(o.char || "lumi", p);
    Object.keys(poses).forEach(k => { const i = new Image(); i.src = poses[k]; });
    // every character has a "<name>-happy" pose except kid Lumi, whose friendly default is "thumbs"
    if (!o.pose) o.pose = (o.char || "lumi") === "lumi" ? "thumbs" : "happy";
    let cur = o.pose, idleTl = null;
    // a pose that doesn't exist for this character falls back to its thumbs-up art instead of a broken image
    img.onerror = () => { const f = LP.char(o.char || "lumi", "thumbs"); if (img.src !== f) img.src = f; };
    img.src = src(cur);
    const A = { el: wrap, body, img };
    A.set = (p) => {
      if (!p || p === cur) return; cur = p; const s = src(p);
      if (!G || RM) { img.src = s; return; }
      // quick pose changes: only the latest request may land, older crossfades are dropped
      const tok = A._tok = (A._tok || 0) + 1;
      body.querySelectorAll("img.next").forEach(n => n.remove());
      const nx = el("img", "next"); nx.src = s; nx.alt = ""; nx.style.height = "100%";
      nx.onload = () => { if (tok !== A._tok) return; body.appendChild(nx); G.to(nx, { opacity: 1, duration: .14, onComplete: () => { if (tok === A._tok) img.src = s; nx.remove(); } }); };
      nx.onerror = () => nx.remove();
    };
    A.idle = () => {
      if (!G || RM) return A; if (idleTl) idleTl.kill();
      idleTl = G.timeline({ repeat: -1, yoyo: true, defaults: { ease: "sine.inOut" } })
        .to(idleL, { scaleY: 1.025, scaleX: .99, y: -3, duration: 1.5 })
        .to(shadow, { scaleX: .92, opacity: .8, duration: 1.5 }, 0);
      G.fromTo(idleL, { rotation: -1.2 }, { rotation: 1.2, duration: 2.6, yoyo: true, repeat: -1, ease: "sine.inOut" });
      return A;
    };
    A.enter = (from) => {
      if (!G || RM) return Promise.resolve();
      return new Promise(r => G.timeline({ onComplete: r })
        .fromTo(body, { y: from === "top" ? -240 : 220, scaleY: 1.15, scaleX: .9, opacity: 0 }, { y: 0, opacity: 1, duration: .55, ease: "power3.in" })
        .to(body, { scaleY: .82, scaleX: 1.14, duration: .1, ease: "power1.out" })
        .to(body, { scaleY: 1, scaleX: 1, duration: .7, ease: "elastic.out(1,.35)" })
        .fromTo(shadow, { scale: .2, opacity: 0 }, { scale: 1, opacity: 1, duration: .5 }, .35));
    };
    A.cheer = (pose, back) => {
      A.set(pose || o.cheer || "celebrate");
      if (G && !RM) G.timeline()
        .to(body, { scaleY: .84, scaleX: 1.12, duration: .1, ease: "power2.out" })
        .to(body, { y: -46, scaleY: 1.1, scaleX: .94, rotation: rnd(-6, 6), duration: .26, ease: "power2.out" })
        .to(body, { y: 0, scaleY: 1, scaleX: 1, rotation: 0, duration: .32, ease: "bounce.out" })
        .to(shadow, { scaleX: .55, opacity: .4, duration: .26 }, .1).to(shadow, { scaleX: 1, opacity: 1, duration: .3 }, .36);
      if (back !== false) { clearTimeout(A._b); A._b = setTimeout(() => A.set(back || o.pose || "happy"), 1300); }
    };
    A.oops = (pose, back) => {
      A.set(pose || o.oops || "surprised");
      if (G && !RM) G.timeline().to(body, { rotation: -7, x: -6, duration: .08 }).to(body, { rotation: 6, x: 6, duration: .1 }).to(body, { rotation: -3, x: -2, duration: .1 }).to(body, { rotation: 0, x: 0, duration: .3, ease: "elastic.out(1,.4)" });
      clearTimeout(A._b); A._b = setTimeout(() => A.set(back || o.pose || "happy"), 900);
    };
    A.nod = () => { if (G && !RM) G.fromTo(body, { scaleY: .94 }, { scaleY: 1, duration: .6, ease: "elastic.out(1,.4)" }); };
    A.pose = () => cur;
    if (o.idle !== false) A.idle();
    return A;
  };

  /* ============ Cards ============ */
  const tileCol = w => { const c = ["#F97316", "#0D9488", "#3B82F6", "#E11D48", "#8B5CF6", "#F59E0B"]; let h = 0; for (const ch of String(w)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return c[h % c.length]; };
  LP.picCard = (word, o) => {
    o = o || {};
    const b = el("button", "lp-card" + (o.label === false ? " nolbl" : "")); b.type = "button"; b.dataset.word = word;
    b.setAttribute("aria-label", o.aria || word);
    const img = o.img || LP.vocabImg(word);
    b.innerHTML = `<div class="pic"><div class="tile" style="background:${tileCol(word)}">${esc(String(word).trim()[0] || "?").toUpperCase()}</div>` +
      `<img alt="" src="${esc(img)}" onload="this.previousElementSibling.style.display='none'" onerror="this.remove()"></div>` +
      (o.label === false ? "" : `<div class="lbl">${esc(o.text || word)}</div>`) +
      `<span class="shine"></span><span class="ring"></span><span class="badge">${ICON.check}</span>`;
    if (!RM && G && matchMedia("(hover:hover)").matches) {
      b.addEventListener("pointermove", e => { const r = b.getBoundingClientRect(); G.to(b, { rotationY: ((e.clientX - r.left) / r.width - .5) * 14, rotationX: -((e.clientY - r.top) / r.height - .5) * 12, duration: .4, ease: "power2.out", overwrite: "auto" }); });
      b.addEventListener("pointerleave", () => G.to(b, { rotationY: 0, rotationX: 0, duration: .6, ease: "elastic.out(1,.5)" }));
    }
    return b;
  };
  /* deal cards in (from a point, e.g. a character's pocket) */
  LP.deal = (cards, from) => {
    cards = [].slice.call(cards);
    if (!G || RM) { cards.forEach(c => c.style.opacity = 1); return Promise.resolve(); }
    let fx = 0, fy = 260;
    return new Promise(res => {
      requestAnimationFrame(() => {
        const tl = G.timeline({ onComplete: res });
        cards.forEach((c, i) => {
          if (from) { const a = center(from), b = center(c); fx = a.x - b.x; fy = a.y - b.y; }
          tl.fromTo(c, { x: fx, y: fy, scale: .25, rotation: rnd(-40, 40), opacity: 0 }, { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1, duration: .7, ease: "back.out(1.5)", clearProps: "x,y,rotation,scale", onStart: () => LP.sfx("deal") }, i * .09);
        });
        tl.add(() => cards.forEach((c, i) => setTimeout(() => { c.classList.add("glint"); setTimeout(() => c.classList.remove("glint"), 950); }, i * 70)), "-=.2");
      });
    });
  };
  LP.clear = (cards, keep) => {
    cards = [].slice.call(cards).filter(c => c !== keep);
    if (!G || RM) return Promise.resolve();
    return new Promise(res => G.to(cards, { y: 60, scale: .6, opacity: 0, rotation: () => rnd(-20, 20), duration: .35, stagger: .05, ease: "power2.in", onComplete: res }));
  };
  LP.good = (card, o) => {
    o = o || {};
    card.classList.add("good");
    const c = center(card);
    LP.sfx("correct");
    if (G && !RM) {
      G.timeline().to(card, { scale: 1.12, rotation: rnd(-3, 3), duration: .18, ease: "power2.out" }).to(card, { scale: 1, rotation: 0, duration: .6, ease: "elastic.out(1,.4)" });
      const bd = $(".badge", card); if (bd) G.to(bd, { opacity: 1, scale: 1, duration: .5, ease: "back.out(2.4)", delay: .08 });
    } else { const bd = $(".badge", card); if (bd) { bd.style.opacity = 1; bd.style.transform = "none"; } }
    LP.burst(c.x, c.y, { n: 30, ringColor: "#22C55E" });
    LP.streak(true);
    return o.star === false ? Promise.resolve() : LP.addStar(card);
  };
  LP.bad = (card) => {
    LP.sfx("wrong"); LP.streak(false);
    if (!card) return;
    card.classList.add("bad");
    if (G && !RM) G.timeline().to(card, { x: -12, rotation: -3, duration: .06 }).to(card, { x: 11, rotation: 3, duration: .08 }).to(card, { x: -7, rotation: -2, duration: .08 }).to(card, { x: 0, rotation: 0, duration: .4, ease: "elastic.out(1,.35)" });
    setTimeout(() => { card.classList.remove("bad"); }, 700);
  };

  /* streak chip: 3+ right answers in a row */
  let streakN = 0, streakEl = null, flameAnim = null;
  LP.streak = (ok) => {
    streakN = ok ? streakN + 1 : 0;
    if (streakN < 3) { if (streakEl && G) G.to(streakEl, { opacity: 0, y: -10, duration: .25 }); return; }
    if (!streakEl) {
      streakEl = el("div", "lp-streak", '<span class="fl"></span><span class="t"></span>'); document.body.appendChild(streakEl);
      if (window.lottie) try { flameAnim = lottie.loadAnimation({ container: $(".fl", streakEl), renderer: "svg", loop: true, autoplay: !RM, path: LP.asset("assets/lottie/flame.json") }); } catch (e) {}
    }
    $(".t", streakEl).textContent = streakN + " in a row!";
    if (G) G.fromTo(streakEl, { opacity: 0, y: -16, scale: .7 }, { opacity: 1, y: 0, scale: 1, duration: D(.5), ease: "back.out(2)" });
    clearTimeout(LP._stk); LP._stk = setTimeout(() => { if (streakEl && G) G.to(streakEl, { opacity: 0, y: -10, duration: .3 }); }, 1800);
  };
  LP.streakCount = () => streakN;

  /* ============ Round banner ============ */
  LP.banner = (big, small, ms) => {
    const b = el("div", "lp-banner", `<b>${esc(big)}</b>${small ? `<small>${esc(small)}</small>` : ""}`); b.setAttribute("aria-hidden", "true");
    document.body.appendChild(b);
    if (!G || RM) { b.style.opacity = 1; return wait(ms || 600).then(() => b.remove()); }
    LP.sfx("whoosh");
    return new Promise(r => G.timeline({ onComplete: () => { b.remove(); r(); } })
      .fromTo(b, { opacity: 0, scale: .4, rotation: -8 }, { opacity: 1, scale: 1, rotation: 0, duration: .45, ease: "back.out(2.2)" })
      .fromTo($("small", b) || {}, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: .3 }, .15)
      .to(b, { opacity: 0, scale: 1.25, y: -30, duration: .3, ease: "power2.in" }, (ms || 900) / 1000));
  };

  /* ============ Title screen ============ */
  LP.title = (o) => new Promise(resolve => {
    document.body.classList.add("lp-intro");
    const t = el("section", "lp-title"); t.setAttribute("role", "dialog"); t.setAttribute("aria-label", o.title);
    const words = String(o.title).split(" ").map(w => `<span class="w">${[...w].map(ch => `<span class="ch">${esc(ch)}</span>`).join("")}</span>`).join(" ");
    t.innerHTML = `<div class="veil"></div><div class="inner">${o.kicker ? `<span class="kick">${esc(o.kicker)}</span>` : ""}<div class="hero"></div><h1>${words}</h1>` +
      `<p>${esc(o.sub || "")}${o.ar ? `<span class="ar" dir="rtl" lang="ar">${esc(o.ar)}</span>` : ""}</p>` +
      `<button class="lp-btn" type="button">${ICON.play}<span>${esc(o.button || "Play")}</span></button></div>`;
    document.body.appendChild(t);
    const hero = LP.actor($(".hero", t), Object.assign({ height: "100%", idle: false }, o.actor || {}));
    const btn = $(".lp-btn", t), chars = t.querySelectorAll("h1 .ch");
    if (G && !RM) {
      G.timeline()
        .from($(".veil", t), { opacity: 0, duration: .6 })
        .from(LP.sceneEl ? LP.sceneEl.querySelectorAll(".bg") : [], { scale: 1.35, duration: 2.2, ease: "power3.out" }, 0)
        .from($(".kick", t) || {}, { y: -20, opacity: 0, duration: .4 }, .2)
        .add(() => hero.enter("bottom").then(() => { hero.idle(); hero.cheer(o.actor && o.actor.cheer, o.actor && o.actor.pose); }), .25)
        .from(chars, { y: -120, rotation: () => rnd(-40, 40), opacity: 0, duration: .7, ease: "bounce.out", stagger: .035 }, .55)
        .from($("p", t), { y: 16, opacity: 0, duration: .5 }, 1.1)
        .from(btn, { scale: 0, duration: .7, ease: "elastic.out(1,.45)" }, 1.25)
        .add(() => G.to(btn, { scale: 1.06, duration: .8, yoyo: true, repeat: -1, ease: "sine.inOut" }));
      setTimeout(() => LP.sfx("rise"), 300);
    } else hero.idle();
    btn.addEventListener("click", () => {
      ac(); LP.sfx("pop"); LP.music(); document.body.classList.remove("lp-intro");
      if (!G || RM) { t.remove(); resolve(); return; }
      G.killTweensOf(btn);
      G.timeline({ onComplete: () => { t.remove(); resolve(); } })
        .to(chars, { y: -80, opacity: 0, duration: .35, stagger: .01, ease: "power2.in" })
        .to([$(".hero", t), btn, $("p", t), $(".kick", t) || {}], { y: 40, opacity: 0, duration: .35, ease: "power2.in" }, 0)
        .to(t, { opacity: 0, duration: .3 }, .25);
    }, { once: true });
    setTimeout(() => btn.focus({ preventScroll: true }), 50);
  });

  /* ============ Results ============ */
  LP.results = (o) => {
    const total = o.total || 1, score = o.score || 0, pct = score / total;
    const stars = o.stars != null ? o.stars : pct >= .9 ? 3 : pct >= .6 ? 2 : score > 0 ? 1 : 0;
    const head = o.title || (stars === 3 ? "Amazing!" : stars === 2 ? "Great job!" : "Good try!");
    if (streakEl) streakEl.remove(), streakEl = null;
    document.body.classList.add("lp-done");
    const r = el("section", "lp-results"); r.setAttribute("role", "dialog"); r.setAttribute("aria-label", head);
    r.innerHTML = `<div class="dim"></div><div class="rays"></div><div class="card"><div class="hero"></div><div class="conf"></div>` +
      `<div class="stars">${[0, 1, 2].map(() => `<span><span class="off">${ICON.starOff}</span><span class="on">${ICON.star}</span></span>`).join("")}</div>` +
      `<h2>${esc(head)}</h2><p class="score">${esc(o.scoreLabel || "You got")} <b class="n">0</b> / ${total}</p>${o.note ? `<p class="note">${esc(o.note)}</p>` : '<p class="note"></p>'}` +
      `<div class="acts"><button class="lp-btn alt" type="button" data-act="again">${ICON.again}<span>Play again</span></button>` +
      `<a class="lp-btn" data-act="exit" href="${esc(o.exitHref || (LP.hud.exit && LP.hud.exit.href) || "../student.html")}"><span>${esc(o.exitLabel || "Done")}</span></a></div></div>`;
    document.body.appendChild(r); r.style.visibility = "visible";
    const hero = LP.actor($(".hero", r), Object.assign({ height: "100%", pose: "celebrate", idle: false }, o.actor || {}));
    $("[data-act=again]", r).onclick = () => { if (o.onReplay) { r.remove(); document.body.classList.remove("lp-done"); o.onReplay(); } else location.reload(); };
    if (LP.hud.exit && LP.hud.exit.onclick) $("[data-act=exit]", r).onclick = LP.hud.exit.onclick;
    try { window.Lumio && Lumio.speak(stars >= 3 ? "Amazing!" : "Great job!"); } catch (e) {}
    const onStars = r.querySelectorAll(".stars .on"), n = $(".n", r);
    if (!G || RM) { for (let i = 0; i < stars; i++) onStars[i].style.opacity = 1; n.textContent = score; hero.idle(); return; }
    LP.sfx("win");
    G.to($(".rays", r), { rotation: 360, duration: 30, repeat: -1, ease: "none" });
    const tl = G.timeline();
    tl.from($(".dim", r), { opacity: 0, duration: .4 })
      .from($(".rays", r), { opacity: 0, scale: .4, duration: .8, ease: "power2.out" }, .1)
      .from($(".card", r), { y: 120, scale: .7, opacity: 0, duration: .7, ease: "back.out(1.6)" }, .15)
      .add(() => hero.enter("bottom").then(() => { hero.idle(); hero.cheer(null, false); }), .5)
      .add(() => LP.rain({ n: 140 }), .6);
    for (let i = 0; i < stars; i++) tl.fromTo(onStars[i], { opacity: 0, scale: 3, rotation: -60 }, { opacity: 1, scale: 1, rotation: 0, duration: .5, ease: "back.out(2)", onComplete: () => { LP.sfx("star"); const c = center(onStars[i]); LP.burst(c.x, c.y, { n: 18, shape: "star", colors: ["#FFD666", "#FFB300", "#fff"] }); } }, .95 + i * .35);
    const cnt = { v: 0 }; tl.to(cnt, { v: score, duration: .8, ease: "power1.out", onUpdate: () => { n.textContent = Math.round(cnt.v); } }, .9);
    tl.from(r.querySelectorAll(".acts .lp-btn"), { y: 30, opacity: 0, stagger: .1, duration: .5, ease: "back.out(2)" }, 1.4 + stars * .2);
    if (window.lottie) try { lottie.loadAnimation({ container: $(".conf", r), renderer: "svg", loop: false, autoplay: true, path: LP.asset("assets/lottie/confetti.json") }); } catch (e) {}
  };

  /* ============ One-call setup ============ */
  LP.init = (o) => {
    o = o || {};
    document.body.classList.add("lp");
    if (o.theme === "teen") document.documentElement.setAttribute("data-lp", "teen");
    if (o.track) LP.track = o.track;
    if (o.scene) LP.scene(o.scene);
    if (o.hud !== false) LP.hud(o.hud || {});
    return LP;
  };

  window.LP = LP;
})();
