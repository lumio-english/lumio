/* Lumio English — student dashboard "Story Journey" (design-previews/c-journey.html), 2026.
   Purely presentational, added on top of the page that student.html and its scripts already built:
   - numbers the visible sections as chapters (medal, "Chapter two" kicker, alternating sides),
   - a glowing dotted path from chapter to chapter, drawn as you scroll, with a small Lumi walking along it,
   - a chapter nav: a chip bar on phones/tablets, a side index on laptops,
   - floating letters and shapes behind the page (CSS animation, compositor only),
   - "Account & help" rows in the last chapter that open the same top-bar windows,
   - GSAP + ScrollTrigger (vendor/, loaded after the page) for chapter entrances. A chapter is only animated
     when it comes into view and its start state is set at that moment, so nothing is ever left hidden if a
     script fails. Everything is skipped for prefers-reduced-motion, and nothing here changes data or links. */
(function () {
  'use strict';
  var main = document.querySelector('main.sd-wrap');
  if (!main) return;
  var RM = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var body = document.body;
  var WORDS = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
  var NAV = { secToday: "Today's mission", secMap: 'My adventure', secProgress: 'My progress', secUnlocked: 'Story & game', secClasses: 'My classes', secHub: 'English Hub', secRewards: 'Rewards', secMore: 'More' };
  var SVGNS = 'http://www.w3.org/2000/svg';
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  body.classList.add('sj');

  /* ---------- top bar height -> sticky offsets ---------- */
  var bar = $('.sd-topbar');
  function measureTop() { var h = bar && getComputedStyle(bar).position === 'sticky' ? Math.round(bar.getBoundingClientRect().height) : 0; document.documentElement.style.setProperty('--sj-top', h + 'px'); }
  measureTop();

  /* ---------- floating letters & shapes ---------- */
  (function sky() {
    if ($('.sj-sky')) return;
    var box = document.createElement('div'); box.className = 'sj-sky'; box.setAttribute('aria-hidden', 'true');
    var items = [['A', 6, 14], ['b', 88, 22], ['s', 18, 46], ['Hi', 80, 58], ['?', 8, 78], ['c', 92, 84], ['Z', 46, 92], ['t', 62, 8], ['e', 30, 30], ['!', 70, 40], ['M', 24, 64], ['s', 54, 70], ['Yes', 86, 4], ['o', 40, 52]];
    var html = '<div class="planet"></div>';
    items.forEach(function (it, i) {
      var st = 'left:' + it[1] + '%;top:' + it[2] + '%;--r:' + ((i % 2 ? 1 : -1) * (6 + i * 3)) + 'deg;animation-duration:' + (11 + (i % 5) * 2) + 's;animation-delay:' + (-i * 1.7) + 's';
      if (it[0] === 's' || it[0] === 'c' || it[0] === 't') html += '<span class="s ' + it[0] + '" style="' + st + '"></span>';
      else html += '<span class="l" style="' + st + '">' + it[0] + '</span>';
    });
    box.innerHTML = html;
    body.insertBefore(box, body.firstChild);
  })();

  /* ---------- trail + walker layer ---------- */
  var trail = document.createElementNS(SVGNS, 'svg');
  trail.setAttribute('class', 'sj-trail'); trail.setAttribute('aria-hidden', 'true');
  trail.innerHTML = '<defs><linearGradient id="sjGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FDBA74"/><stop offset=".5" stop-color="#F97316"/><stop offset="1" stop-color="#EA580C"/></linearGradient></defs><path class="ghost" d=""/>';
  // The glowing ink is drawn once and revealed by two composited transforms (a moving clip window and a
  // counter-moving copy of the path), so scrolling never repaints the long SVG, which is what keeps phones smooth.
  var inkClip = document.createElement('div'); inkClip.className = 'sj-inkclip'; inkClip.setAttribute('aria-hidden', 'true');
  var inkSvg = document.createElementNS(SVGNS, 'svg'); inkSvg.setAttribute('class', 'sj-trail sj-inksvg');
  inkSvg.innerHTML = '<path class="ink" d=""/><path class="shine" d=""/>';
  inkClip.appendChild(inkSvg);
  var walker = document.createElement('div');
  walker.className = 'sj-walker'; walker.setAttribute('aria-hidden', 'true');
  walker.innerHTML = '<div class="wf"><div class="wb"><img class="sj-k" src="assets/story/characters/lumi-welcome-hero.png" alt="" onerror="this.remove()"><img class="sj-t" src="assets/story/characters/lumi-teen-walk.png" alt="" onerror="this.remove()"></div></div><span class="spark"></span>';
  main.insertBefore(walker, main.firstChild);
  main.insertBefore(inkClip, main.firstChild);
  main.insertBefore(trail, main.firstChild);
  var pInk = $('.ink', inkSvg), pGhost = $('.ghost', trail), pShine = $('.shine', inkSvg), wf = $('.wf', walker), trailH = 0;

  /* ---------- chapters ---------- */
  var chs = [];
  function visibleSections() { return $$(':scope > .s26-sec', main).filter(function (s) { return !s.hidden && s.offsetParent !== null; }); }
  function splitWords(h) {
    if (!h || h.dataset.sjSplit) return; h.dataset.sjSplit = '1';
    var t = h.textContent.trim(); h.setAttribute('aria-label', t);
    h.innerHTML = t.split(/\s+/).map(function (w) { return '<span class="w" aria-hidden="true"></span>'; }).join(' ');
    var ws = t.split(/\s+/); $$('.w', h).forEach(function (s, i) { s.textContent = ws[i]; });
  }
  function renumber() {
    chs = visibleSections();
    chs.forEach(function (s, i) {
      s.classList.toggle('sj-flip', i % 2 === 1);
      var b = $('.sj-medal b', s); if (b) b.textContent = String(i + 1);
      var k = $('.sj-no', s); if (k) k.textContent = 'Chapter ' + (WORDS[i] || i + 1);
      s.dataset.sjN = String(i + 1);
    });
    buildNav();
  }

  /* ---------- nav ---------- */
  var chipBar = null, index = null, navSig = '';
  function buildNav() {
    var sig = chs.map(function (s) { return s.id; }).join(',');
    if (sig === navSig && chipBar) return; navSig = sig;
    var items = chs.map(function (s, i) {
      var label = NAV[s.id] || (($('h2', s) || {}).textContent || '').trim();
      return '<a href="#' + s.id + '" data-ch="' + (i + 1) + '"><span class="n">' + (i + 1) + '</span><span>' + label.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</span></a>';
    });
    if (!chipBar) {
      chipBar = document.createElement('nav'); chipBar.className = 'sj-chips'; chipBar.setAttribute('aria-label', 'Chapters');
      index = document.createElement('nav'); index.className = 'sj-index'; index.setAttribute('aria-label', 'Chapters');
      body.appendChild(index);
      [chipBar, index].forEach(function (nav) {
        nav.addEventListener('click', function (e) {
          var a = e.target.closest('a[href^="#"]'); if (!a) return;
          var t = document.getElementById(a.getAttribute('href').slice(1)); if (!t) return;
          e.preventDefault();
          t.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' });
          setActive(+a.dataset.ch, true);
        });
      });
    }
    var first = chs[0] || $('#secToday');
    if (first && chipBar.nextElementSibling !== first) main.insertBefore(chipBar, first);
    chipBar.innerHTML = items.join('');
    index.innerHTML = '<p class="title">Chapters</p><ol>' + items.map(function (a) { return '<li>' + a + '</li>'; }).join('') + '</ol><div class="prog" aria-hidden="true"><i></i></div>';
    activeCh = 0; setActive(activeFromScroll());
  }
  var activeCh = 0;
  function setActive(n, fromClick) {
    if (!n || n === activeCh) return; activeCh = n;
    [chipBar, index].forEach(function (nav) {
      if (!nav) return;
      $$('a', nav).forEach(function (a) {
        var k = +a.dataset.ch; a.classList.toggle('active', k === n); a.classList.toggle('passed', k < n);
        if (k === n) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current');
      });
    });
    var act = chipBar && $('a.active', chipBar);
    if (act && chipBar.scrollWidth > chipBar.clientWidth) {
      var left = act.offsetLeft - (chipBar.clientWidth - act.offsetWidth) / 2;
      try { chipBar.scrollTo({ left: Math.max(0, left), behavior: RM || fromClick ? 'auto' : 'smooth' }); } catch (e) { chipBar.scrollLeft = left; }
    }
  }
  function activeFromScroll() {
    var n = 1, line = scrollY + innerHeight * 0.45;
    if (!chTops.length) chTops = chs.map(function (s) { return s.getBoundingClientRect().top + scrollY; });
    for (var i = 0; i < chTops.length; i++) { if (chTops[i] <= line) n = i + 1; else break; }
    return n;
  }

  /* ---------- path ---------- */
  var pathLen = 0, table = [], medalLens = [], medals = [], curLen = 0, targetLen = 0, lastX = null, running = false;
  // layout numbers cached at build time, so scrolling never has to read layout
  var mainTop = 0, mainW = 0, ww = 42, chTops = [], stats = { builds: 0, ms: 0 };
  function offsetIn(el) {
    var x = 0, y = 0, e = el;
    while (e && e !== main) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; }
    if (e !== main) { var r = el.getBoundingClientRect(), m = main.getBoundingClientRect(); return { x: r.left - m.left, y: r.top - m.top, w: r.width, h: r.height }; }
    return { x: x, y: y, w: el.offsetWidth, h: el.offsetHeight };
  }
  function centre(el) { var o = offsetIn(el); return { x: o.x + o.w / 2, y: o.y + o.h / 2 }; }
  // Catmull-Rom through the points, as cubic Béziers: returns the SVG path and a sampled polyline
  // (length, x, y, running max y) so scrolling never calls getPointAtLength / getTotalLength.
  function catmull(pts) {
    var d = 'M' + pts[0].x.toFixed(1) + ' ' + pts[0].y.toFixed(1), smp = [[0, pts[0].x, pts[0].y, pts[0].y]], L = 0, maxY = pts[0].y;
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2, t = 1 / 3;
      var c1x = p1.x + (p2.x - p0.x) * t / 2, c1y = p1.y + (p2.y - p0.y) * t / 2, c2x = p2.x - (p3.x - p1.x) * t / 2, c2y = p2.y - (p3.y - p1.y) * t / 2;
      d += ' C' + c1x.toFixed(1) + ' ' + c1y.toFixed(1) + ' ' + c2x.toFixed(1) + ' ' + c2y.toFixed(1) + ' ' + p2.x.toFixed(1) + ' ' + p2.y.toFixed(1);
      var px = p1.x, py = p1.y, n = 24;
      for (var k = 1; k <= n; k++) {
        var u = k / n, v = 1 - u, a = v * v * v, b = 3 * v * v * u, c = 3 * v * u * u, e = u * u * u;
        var x = a * p1.x + b * c1x + c * c2x + e * p2.x, y = a * p1.y + b * c1y + c * c2y + e * p2.y;
        L += Math.sqrt((x - px) * (x - px) + (y - py) * (y - py)); px = x; py = y; maxY = Math.max(maxY, y);
        smp.push([L, x, y, maxY]);
      }
    }
    return { d: d, smp: smp, len: L };
  }
  function pointAt(L) {
    var lo = 0, hi = table.length - 1; if (!table.length) return { x: 0, y: 0 };
    while (lo < hi) { var mid = (lo + hi) >> 1; if (table[mid][0] < L) lo = mid + 1; else hi = mid; }
    var b = table[lo], a = table[Math.max(0, lo - 1)], span = b[0] - a[0], f = span > 0 ? (L - a[0]) / span : 0;
    return { x: a[1] + (b[1] - a[1]) * f, y: a[2] + (b[2] - a[2]) * f };
  }
  function buildPath() {
    if (!chs.length) return;
    var t0 = performance.now();
    mainTop = main.getBoundingClientRect().top + scrollY; mainW = main.clientWidth; ww = walker.offsetWidth || 42;
    chTops = chs.map(function (s) { return mainTop + offsetIn(s).y; });
    var W = main.clientWidth, H = main.offsetHeight, desk = innerWidth >= 900;
    var gutter = 10;
    trailH = H;
    [trail, inkSvg].forEach(function (sv) { sv.setAttribute('viewBox', '0 0 ' + W + ' ' + H); sv.style.height = H + 'px'; });
    inkClip.style.height = H + 'px';
    var pts = [], mids = [];
    medals = chs.map(function (s) { return $('.sj-medal', s); });
    var m0 = centre(medals[0]);
    pts.push({ x: m0.x, y: Math.max(0, m0.y - (desk ? 140 : 90)) });
    chs.forEach(function (ch, i) {
      var m = centre(medals[i]), c = offsetIn(ch), flip = ch.classList.contains('sj-flip');
      var bottom = c.y + c.h, run = desk ? m.x : (flip ? W - gutter : gutter);
      pts.push({ x: m.x, y: m.y }); mids.push(pts.length - 1);
      var h = bottom - m.y;
      if (h > 220) {
        pts.push({ x: run, y: m.y + Math.min(140, h * 0.25) });
        if (desk && h > 600) pts.push({ x: run + (flip ? -36 : 36), y: m.y + h * 0.5 });
        pts.push({ x: run, y: bottom - 30 });
      }
    });
    var end = $('.sj-end', main);
    if (end && end.offsetParent) { var e = offsetIn(end); pts.push({ x: e.x + e.w / 2, y: e.y + 8 }); }
    var cm = catmull(pts);
    [pInk, pGhost, pShine].forEach(function (p) { p.setAttribute('d', cm.d); });
    pathLen = cm.len; table = cm.smp;
    medalLens = mids.map(function (idx) { return lenAtY(pts[idx].y); });
    computeTarget(); if (!curLen) curLen = targetLen; kick();
    stats.builds++; stats.ms += performance.now() - t0;
  }
  function lenAtY(y) { var lo = 0, hi = table.length - 1; if (!table.length) return 0; while (lo < hi) { var mid = (lo + hi) >> 1; if (table[mid][3] < y) lo = mid + 1; else hi = mid; } return table[lo][0]; }
  function computeTarget() { if (!pathLen) return; var y = scrollY + innerHeight * 0.62 - mainTop; targetLen = Math.max(0, Math.min(pathLen, lenAtY(y))); }
  var hasGsap = function () { return !!window.gsap && !RM; };
  function draw() {
    var pt = pointAt(curLen);
    var r = Math.max(0, Math.min(trailH, pt.y + 6)), sh = (trailH - r).toFixed(1);
    inkClip.style.transform = 'translateY(-' + sh + 'px)'; inkSvg.style.transform = 'translateY(' + sh + 'px)';
    var wx = Math.max(2, Math.min(mainW - ww - 2, pt.x - ww / 2));
    walker.style.transform = 'translate(' + wx.toFixed(1) + 'px,' + (pt.y - ww + 4).toFixed(1) + 'px)';
    if (lastX !== null && Math.abs(pt.x - lastX) > 0.6) wf.classList.toggle('left', pt.x < lastX);
    lastX = pt.x;
    medalLens.forEach(function (L, i) {
      var m = medals[i]; if (!m) return;
      var on = curLen >= L - 4;
      if (on !== m.classList.contains('reached')) {
        m.classList.toggle('reached', on);
        if (on && hasGsap()) gsap.fromTo(m, { scale: 0.8 }, { scale: 1, duration: 0.7, ease: 'elastic.out(1,.45)', clearProps: 'transform' });
      }
    });
  }
  function frame() {
    var dl = targetLen - curLen;
    curLen += (RM || Math.abs(dl) < 0.5) ? dl : dl * 0.12;
    draw();
    if (Math.abs(targetLen - curLen) > 0.5) requestAnimationFrame(frame); else running = false;
  }
  function kick() { if (!pathLen) return; if (!running) { running = true; requestAnimationFrame(frame); } }

  /* ---------- scroll ---------- */
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      computeTarget(); kick();
      setActive(activeFromScroll());
      var bar = index && $('.prog i', index);
      if (bar) { var max = document.documentElement.scrollHeight - innerHeight; bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, scrollY / max) : 0).toFixed(3) + ')'; }
    });
  }
  addEventListener('scroll', onScroll, { passive: true });

  /* ---------- "More" chapter: account & help ---------- */
  var ROWS = [
    ['myProfileBtn', '👤', 'My profile', 'Details, grades, report'],
    ['messagesBtn', '📬', 'Messages', 'Teacher notes and reminders'],
    ['avatarBtn', '🙂', 'My avatar', 'Pick a crew friend or a photo'],
    ['guidesBtn', '📘', 'Guides · الأدلة', 'How to join, book and do homework'],
    ['referralsBtn', '🤝', 'Referrals', 'Invite friends, earn free sessions'],
    ['parentGuideBtn', '🧭', 'Parent guide · دليل ولي الأمر', 'A short tour for families']
  ];
  function srcShown(el) { return !!el && el.style.display !== 'none'; }
  function account() {
    var more = $('#secMore'); if (!more) return;
    var card = $('.sj-acct', more);
    if (!card) {
      card = document.createElement('div'); card.className = 'sj-acct';
      card.innerHTML = '<h3>Account &amp; help</h3><div class="sj-rows">' + ROWS.map(function (r) {
        var src = document.getElementById(r[0]);
        var tag = src && src.tagName === 'A' ? 'a href="' + src.getAttribute('href') + '"' : 'button type="button"';
        return '<' + tag + ' class="sj-row" data-src="' + r[0] + '"><span class="ri" aria-hidden="true">' + r[1] + '</span><span>' + r[2] + '<small>' + r[3] + '</small></span>' + (r[0] === 'messagesBtn' ? '<span class="cnt" hidden></span>' : '') + '</' + tag.split(' ')[0] + '>';
      }).join('') + '</div>';
      more.appendChild(card);
      card.addEventListener('click', function (e) {
        var row = e.target.closest('.sj-row'); if (!row || row.tagName === 'A') return;
        var src = document.getElementById(row.dataset.src); if (src) src.click();
      });
    }
    $$('.sj-row', card).forEach(function (row) {
      var src = document.getElementById(row.dataset.src);
      row.hidden = !srcShown(src);
      if (row.dataset.src === 'messagesBtn') {
        var b = $('#msgBadge'), c = $('.cnt', row), n = b && srcShown(b) ? b.textContent.trim() : '';
        c.hidden = !n || n === '0'; c.textContent = n;
      }
    });
  }

  /* ---------- entrances (GSAP + ScrollTrigger, progressive) ---------- */
  function reveal(sec) {
    if (!hasGsap() || sec.dataset.sjIn) return; sec.dataset.sjIn = '1';
    var flip = sec.classList.contains('sj-flip'), pl = $('.sj-pl', sec), art = $('.sj-art', sec);
    var tl = gsap.timeline();
    if (pl) tl.from(pl, { rotateY: flip ? 60 : -60, opacity: 0, transformPerspective: 900, transformOrigin: flip ? 'right center' : 'left center', duration: 0.85, ease: 'power3.out', clearProps: 'transform,opacity' }, 0);
    var ws = $$('.sj-plate h2 .w', sec);
    if (ws.length) tl.from(ws, { yPercent: 110, rotate: 6, duration: 0.6, stagger: 0.08, ease: 'back.out(1.7)', clearProps: 'transform' }, 0.25);
    var lines = $$('.sj-no, .sj-narr, .sj-plate .sj-ar', sec);
    if (lines.length) tl.from(lines, { opacity: 0, y: 10, stagger: 0.08, duration: 0.4, clearProps: 'transform,opacity' }, 0.35);
    // the pages slide in on laptops only: on phones, promoting big cards to layers costs more than it gives
    var cards = innerWidth < 900 ? [] : $$(':scope > :not(.s26-sech)', sec).filter(function (c) { return c.offsetParent !== null; }).slice(0, 3);
    if (cards.length) tl.from(cards, { y: 46, opacity: 0, duration: 0.75, stagger: 0.12, ease: 'power3.out', clearProps: 'transform,opacity' }, 0.15);
    if (art && art.offsetParent) gsap.from(art, { y: 80, opacity: 0, rotate: flip ? 8 : -8, duration: 1, delay: 0.3, ease: 'back.out(1.4)', clearProps: 'transform,opacity' });
  }
  function entrances() {
    if (!hasGsap() || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    chs.forEach(function (sec) {
      // already on screen (or above it): leave it exactly as it is
      if (sec.getBoundingClientRect().top < innerHeight * 0.9) { sec.dataset.sjIn = '1'; return; }
      ScrollTrigger.create({ trigger: sec, start: 'top 88%', once: true, onEnter: function () { reveal(sec); } });
    });
    var end = $('.sj-end', main);
    if (end && end.getBoundingClientRect().top > innerHeight) ScrollTrigger.create({ trigger: end, start: 'top 90%', once: true, onEnter: function () { gsap.from(end, { y: 40, opacity: 0, scale: 0.96, duration: 0.8, ease: 'back.out(1.6)', clearProps: 'transform,opacity' }); } });
  }
  function loadScript(src, cb) { var s = document.createElement('script'); s.src = src; s.onload = function () { cb(true); }; s.onerror = function () { cb(false); }; document.head.appendChild(s); }
  function loadGsap() {
    if (RM) return;
    var go = function () { try { entrances(); } catch (e) { if (window.console) console.warn('Lumio journey entrances skipped:', e); } };
    if (window.gsap && window.ScrollTrigger) return go();
    loadScript('vendor/gsap-3.12.5.min.js', function (ok) { if (!ok || !window.gsap) return; loadScript('vendor/ScrollTrigger-3.12.5.min.js', function (ok2) { if (ok2) go(); }); });
  }

  /* ---------- refresh on layout changes ---------- */
  var rz = null;
  function refresh() {
    clearTimeout(rz);
    rz = setTimeout(function () {
      try { measureTop(); renumber(); account(); buildPath(); if (window.ScrollTrigger && ScrollTrigger.refresh) ScrollTrigger.refresh(); } catch (e) { if (window.console) console.warn('Lumio journey refresh skipped:', e); }
    }, 180);
  }

  var started = false;
  function start() {
    if (started) return; started = true;
    try {
      $$('.s26-sech.sj-plate h2', main).forEach(splitWords);
      renumber(); account(); buildPath(); onScroll();
      if (window.ResizeObserver) { var ro = new ResizeObserver(refresh); ro.observe(main); if (bar) ro.observe(bar); }
      addEventListener('resize', refresh);
      if (window.MutationObserver) {
        var mo = new MutationObserver(refresh);
        $$(':scope > .s26-sec', main).forEach(function (s) { mo.observe(s, { attributes: true, attributeFilter: ['hidden'] }); });
        ['myProfileBtn', 'messagesBtn', 'referralsBtn', 'parentGuideBtn', 'msgBadge'].forEach(function (id) { var el = document.getElementById(id); if (el) mo.observe(el, { attributes: true, attributeFilter: ['style'], childList: true }); });
      }
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
      var later = function () { refresh(); setTimeout(loadGsap, 300); };
      if (document.readyState === 'complete') later(); else addEventListener('load', function () { setTimeout(later, 500); });
    } catch (e) { if (window.console) console.warn('Lumio journey skipped:', e); }
  }
  if (window.LumioMapState) setTimeout(start, 0);
  document.addEventListener('lumio-map-ready', function () { setTimeout(start, 0); });
  window.LumioJourney = { refresh: refresh, stats: stats };
})();
