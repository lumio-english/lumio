/* Lumio English — student dashboard motion (2026 redesign).
   Purely presentational, added after the page has rendered:
   - a "Menu" button that folds the top-bar buttons on phones,
   - hides a section when everything inside it is hidden (e.g. no manual for this level),
   - cards slide in as they scroll into view, earned badges pop, numbers count up,
   - a gentle tilt on hover (mouse only), floating letter tiles in the welcome card.
   Everything is skipped for prefers-reduced-motion, and nothing here changes data or links. */
(function () {
  'use strict';
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && matchMedia('(pointer: fine)').matches;
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* ---- phone menu ---- */
  var bar = document.querySelector('.sd-topbar');
  if (bar && !bar.querySelector('.s26-menubtn')) {
    var mb = document.createElement('button');
    mb.type = 'button'; mb.className = 's26-menubtn'; mb.setAttribute('aria-expanded', 'false');
    mb.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>Menu';
    var anchor = bar.querySelector('#streakChip');
    bar.insertBefore(mb, anchor || null);
    mb.addEventListener('click', function () { var o = bar.classList.toggle('open'); mb.setAttribute('aria-expanded', String(o)); });
  }

  /* ---- hide sections with nothing visible inside ---- */
  function tidySections() {
    $$('.s26-sec').forEach(function (sec) {
      var kids = $$(':scope > :not(.s26-sech)', sec);
      var any = kids.some(function (k) { return k.offsetParent !== null || (k.getClientRects && k.getClientRects().length); });
      sec.hidden = !any;
    });
  }

  /* ---- count-up for plain numbers (keeps "12/20", "3,600" formats) ---- */
  function countUp(el) {
    var txt = (el.textContent || '').trim(), m = txt.match(/^([\d,]+)(.*)$/);
    if (!m) return;
    var target = parseInt(m[1].replace(/,/g, ''), 10), rest = m[2], useComma = m[1].indexOf(',') > -1 || target >= 1000;
    if (!target) return;
    var t0 = null, dur = 1100;
    function step(ts) {
      if (!t0) t0 = ts;
      var k = Math.min(1, (ts - t0) / dur), v = Math.round(target * (1 - Math.pow(1 - k, 3)));
      el.textContent = (useComma ? v.toLocaleString('en-US') : String(v)) + rest;
      if (k < 1) requestAnimationFrame(step); else el.textContent = txt;
    }
    requestAnimationFrame(step);
  }

  /* ---- welcome card: floating letter tiles ---- */
  function decorateWelcome() {
    var card = document.querySelector('.s26-hello');
    if (!card || card.querySelector('.s26-tiles') || still) return;
    var box = document.createElement('div'); box.className = 's26-tiles'; box.setAttribute('aria-hidden', 'true');
    var tiles = [['A', 64, 14], ['ب', 78, 70], ['C', 52, 82], ['ت', 90, 30], ['S', 40, 8]];
    tiles.forEach(function (t, i) {
      var s = document.createElement('span'), z = 34 + (i % 3) * 8;
      s.textContent = t[0];
      s.style.cssText = 'left:' + t[1] + '%;top:' + t[2] + '%;width:' + z + 'px;height:' + z + 'px;opacity:.55;--r:' + ((i % 2 ? 1 : -1) * (8 + i * 4)) + 'deg;animation-delay:' + (-i * 1.4) + 's';
      box.appendChild(s);
    });
    card.insertBefore(box, card.firstChild);
  }

  /* ---- scroll reveals, badge pops, count-ups ---- */
  function reveal() {
    if (still || !('IntersectionObserver' in window)) return;
    var targets = [];
    $$('.s26-sec').forEach(function (sec) {
      $$(':scope > *', sec).forEach(function (el, i) { el.classList.add('s26-reveal'); el.dataset.s26d = String(Math.min(i, 5) * 70); targets.push(el); });
    });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target; io.unobserve(el);
        setTimeout(function () {
          el.classList.add('in');
          $$('.sd-badge.earned', el).forEach(function (b, j) { b.style.animationDelay = (j * 70) + 'ms'; b.classList.add('s26-pop'); });
          $$('.sd-stat-card b, #rwPointsVal, #rwHoursVal', el).forEach(countUp);
        }, +el.dataset.s26d || 0);
      });
    }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(function (el) { io.observe(el); });
    // anything already on screen at load shows at once (no blank first frame)
    requestAnimationFrame(function () {
      targets.forEach(function (el) { var r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) { el.classList.add('in'); } });
    });
  }

  /* ---- hover tilt (mouse only) ---- */
  function tilt() {
    if (still || !fine) return;
    $$('.sd-hubb, .sd-badge, .sd-buddy-card, .sd-story-banner, .sd-game-wide, .sd-stat-card').forEach(function (c) {
      c.classList.add('s26-tilt');
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.transform = 'perspective(800px) rotateY(' + (x * 6) + 'deg) rotateX(' + (-y * 6) + 'deg) translateY(-3px)';
      });
      c.addEventListener('pointerleave', function () { c.style.transform = ''; });
    });
  }

  var started = false;
  function start() {
    if (started) return; started = true;
    try { decorateWelcome(); tidySections(); reveal(); tilt(); } catch (e) { if (window.console) console.warn('Lumio motion skipped:', e); }
  }
  if (window.LumioMapState) setTimeout(start, 0);
  document.addEventListener('lumio-map-ready', function () { setTimeout(start, 0); });
  // sections can fill in later (rewards, rating) after a background sync
  window.addEventListener('load', function () { setTimeout(tidySections, 400); });
})();
