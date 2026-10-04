/* Lumio English — "Today's lesson" card and top menu, 2026 look.
   Runs after student.html has filled the mission card (labels, links, which buttons show), then:
   - swaps the emoji in each label for a matching line icon (the page's own wording is kept),
   - adds the lesson's name (EN + AR) and a 3-step tracker: prepare → live class → homework,
   - lays the four homework materials out as icon tiles,
   - gives the number cards and the top-menu buttons the same icon set.
   The page's elements, ids, links and click handlers are reused as they are. */
(function () {
  'use strict';
  var S = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
  var I = {
    play: '<svg ' + S + '><path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/></svg>',
    arrow: '<svg ' + S + '><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    pencil: '<svg ' + S + '><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg>',
    sheet: '<svg ' + S + '><path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/></svg>',
    write: '<svg ' + S + '><path d="M4 20h4L19 9a2.8 2.8 0 00-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></svg>',
    cards: '<svg ' + S + '><rect x="3" y="6" width="13" height="15" rx="2"/><path d="M8 3h11a2 2 0 012 2v12"/></svg>',
    cal: '<svg ' + S + '><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    test: '<svg ' + S + '><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3v3h6V3M9 12l2 2 4-4M9 17h6"/></svg>',
    trophy: '<svg ' + S + '><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0V4z"/><path d="M17 5h3a3 3 0 01-3 4M7 5H4a3 3 0 003 4"/></svg>',
    retry: '<svg ' + S + '><path d="M3 12a9 9 0 1015.5-6.2L21 8"/><path d="M21 3v5h-5"/></svg>',
    star: '<svg ' + S + '><path d="M12 2.8l2.8 5.8 6.4.9-4.6 4.5 1.1 6.4L12 17.4l-5.7 3 1.1-6.4L2.8 9.5l6.4-.9z" fill="currentColor"/></svg>',
    bolt: '<svg ' + S + '><path d="M13 2L4 14h7l-1 8 9-12h-7z" fill="currentColor"/></svg>',
    check: '<svg ' + S + '><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    grad: '<svg ' + S + '><path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5M22 9v6"/></svg>',
    book: '<svg ' + S + '><path d="M4 5.5A2.5 2.5 0 016.5 3H20v15H6.5A2.5 2.5 0 004 20.5z"/><path d="M4 20.5A2.5 2.5 0 006.5 23H20v-5"/></svg>',
    video: '<svg ' + S + '><rect x="2" y="6" width="14" height="12" rx="2"/><path d="M16 10l6-3v10l-6-3"/></svg>',
    user: '<svg ' + S + '><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg>',
    mail: '<svg ' + S + '><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
    guide: '<svg ' + S + '><path d="M4 19.5A2.5 2.5 0 016.5 17H20V3H6.5A2.5 2.5 0 004 5.5z"/><path d="M4 19.5A2.5 2.5 0 006.5 22H20v-5"/><path d="M9 7h7M9 11h5"/></svg>',
    gift: '<svg ' + S + '><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8v13M3 12h18M12 8S10.5 3 7.5 4.5 9 8 12 8zm0 0s1.5-5 4.5-3.5S15 8 12 8z"/></svg>',
    compass: '<svg ' + S + '><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/></svg>',
    out: '<svg ' + S + '><path d="M15 4h3a2 2 0 012 2v12a2 2 0 01-2 2h-3M10 17l5-5-5-5M15 12H3"/></svg>',
    flame: '<svg ' + S + '><path d="M12 2c1 3.5 5 5.6 5 10.5A5 5 0 0112 22a5 5 0 01-5-5.2c0-2.3 1.2-3.8 2.4-5 .2 1.4.9 2.4 2 2.9C11 11.3 10.6 6 12 2z" fill="currentColor" stroke="none"/></svg>'
  };
  // drop a leading emoji / symbol run from the page's own label, keep its words
  function clean(s) { return String(s || '').replace(/^[^\p{L}\p{N}]+/u, '').trim(); }
  function $(s) { return document.querySelector(s); }
  // Lumio's own icon set (js/lumio-icons.js); the line icons above are the fallback
  function ic(name, fallback) { return (window.LumioIcons && window.LumioIcons.svg(name)) || fallback || ''; }

  function missionIcon(label) {
    var l = label.toLowerCase();
    if (/certificate/.test(l)) return ic('trophy', I.trophy);
    if (/retake/.test(l)) return ic('retry', I.retry);
    if (/level test/.test(l)) return ic('test', I.test);
    if (/schedule|class/.test(l)) return ic('calendar', I.cal);
    if (/homework/.test(l)) return ic('pencil', I.pencil);
    return ic('play', I.play);
  }

  function mission() {
    var card = $('.sd-hero-card'), btn = $('#missionBtn'); if (!card || !btn || card.dataset.s26) return;
    card.dataset.s26 = '1';
    var M = window.LumioMapState || {}, n = M.current, lv = M.level;
    // lesson name, English + Arabic, from the lesson data the page already loads
    var L = window.LUMIO_LESSONS && lv && n ? ((window.LUMIO_LESSONS[lv] || {})[n] || (window.LUMIO_LESSONS[lv] || {})[String(n)]) : null;
    var title = $('#missionTitle');
    if (L && title && n <= (M.total || 20)) {
      var nm = document.createElement('div'); nm.className = 's26-lname';
      nm.innerHTML = '<span></span>' + (L.titleAr ? '<span class="ar" dir="rtl" lang="ar"></span>' : '');
      nm.firstChild.textContent = L.title || ''; if (L.titleAr) nm.lastChild.textContent = L.titleAr;
      title.insertAdjacentElement('afterend', nm);
    }
    // three steps of this lesson
    if (n && n <= (M.total || 20) && typeof M.isPrepDone === 'function') {
      var prep = !!M.isPrepDone(n), live = !!(M.isLiveDone && M.isLiveDone(n)), hw = !!(M.isHomeworkDone && M.isHomeworkDone(n));
      var steps = [['Prepare', 'In the app', ic('book', I.book), prep], ['Live class', 'On Teams', ic('video', I.video), live], ['Homework', 'After class', ic('pencil', I.pencil), hw]];
      var nowIdx = steps.findIndex(function (s) { return !s[3]; });
      var row = document.createElement('ol'); row.className = 's26-steps'; row.setAttribute('aria-label', 'Lesson ' + n + ' steps');
      row.innerHTML = steps.map(function (s, i) {
        var st = s[3] ? 'done' : i === nowIdx ? 'now' : 'later';
        return '<li class="' + st + '"><span class="dot">' + (s[3] ? ic('check', I.check) : s[2]) + '</span><span class="t"><b>' + s[0] + '</b><small>' + (s[3] ? 'Done' : i === nowIdx ? 'Now · ' + s[1] : s[1]) + '</small></span></li>';
      }).join('');
      var sub = $('#missionSub'); (sub || title).insertAdjacentElement('afterend', row);
    }
    // the main action: icon + the page's own words + arrow
    var label = clean(btn.textContent) || 'Continue';
    btn.innerHTML = '<span class="ic">' + missionIcon(label) + '</span><span class="lb"></span><span class="ar">' + I.arrow + '</span>';
    btn.querySelector('.lb').textContent = label;
    // homework materials as tiles
    var tools = document.createElement('div'); tools.className = 's26-tools';
    [['homeworkBtn', ic('pencil', I.pencil), 'In the app'], ['worksheetBtn', ic('sheet', I.sheet), 'PDF to print'], ['writingBtn', ic('write', I.write), 'PDF to print'], ['flashcardsBtn', ic('cards', I.cards), 'PDF to print']].forEach(function (t) {
      var a = document.getElementById(t[0]); if (!a) return;
      var text = clean(a.textContent);
      a.innerHTML = '<span class="ic">' + t[1] + '</span><span class="tx"><b></b><small></small></span>';
      a.querySelector('b').textContent = text; a.querySelector('small').textContent = t[2];
      a.classList.add('s26-tool'); a.style.marginTop = '';
      tools.appendChild(a);
    });
    var head = document.createElement('div'); head.className = 's26-toolhead'; head.textContent = 'Homework for this lesson';
    btn.insertAdjacentElement('afterend', tools); tools.insertAdjacentElement('beforebegin', head);
  }

  function stats() {
    var icons = document.querySelectorAll('.sd-side-stats .sd-stat-icon');
    var teen = /^level([3-9]|10)$/.test((window.LumioMapState || {}).level || '');
    [teen ? ic('bolt', I.bolt) : ic('star', I.star), ic('check', I.check), ic('grad', I.grad)].forEach(function (svg, i) { var el = icons[i]; if (el) { el.innerHTML = svg; el.removeAttribute('style'); el.classList.add('s26-sicon', 's26-sicon' + i); } });
  }

  function menu() {
    var map = { myProfileBtn: ic('user', I.user), messagesBtn: ic('mail', I.mail), guidesBtn: ic('guide', I.guide), referralsBtn: ic('gift', I.gift), parentGuideBtn: ic('compass', I.compass) };
    Object.keys(map).forEach(function (id) {
      var b = document.getElementById(id); if (!b || b.dataset.s26) return; b.dataset.s26 = '1';
      var tn = Array.prototype.find.call(b.childNodes, function (x) { return x.nodeType === 3 && x.textContent.trim(); });
      if (tn) tn.textContent = clean(tn.textContent);
      b.insertAdjacentHTML('afterbegin', '<span class="s26-mic">' + map[id] + '</span>');
    });
    var out = $('.sd-logout'); if (out && !out.dataset.s26) { out.dataset.s26 = '1'; out.insertAdjacentHTML('afterbegin', '<span class="s26-mic">' + ic('logout', I.out) + '</span>'); }
    var fl = $('#streakChip .flame'); if (fl) fl.innerHTML = ic('flame', I.flame);
  }

  function decorate() {
    if (!window.LumioIcons) return;
    var secs = { secToday: 'sun', secMap: 'map', secUnlocked: 'gift', secClasses: 'calendar', secHub: 'library', secRewards: 'trophy', secMore: 'dots' };
    Object.keys(secs).forEach(function (id) { var el = document.querySelector('#' + id + ' .s26-ic'); if (el) { el.innerHTML = ic(secs[id]); el.classList.add('lm'); } });
    var hub = { hubVocab: 'cards', hubGrammar: 'ruler', hubIdioms: 'bulb', hubPhonics: 'sound', hubSpelling: 'blocks', hubSongs: 'music', hubWriting: 'write' };
    Object.keys(hub).forEach(function (id) { var el = document.querySelector('#' + id + ' .sd-hubb-icon'); if (el) { el.innerHTML = ic(hub[id]); el.classList.add('lm'); } });
    document.querySelectorAll('#manualSection .sd-hubb-icon').forEach(function (el) { el.innerHTML = ic('guide'); el.classList.add('lm'); });
    var si = $('.sd-story-icon'); if (si) { si.innerHTML = ic('story'); si.classList.add('lm'); }
    var gi = $('#gameWideIcon'); if (gi) { gi.innerHTML = ic('pad'); gi.classList.add('lm'); }
    var MED = { 'first step': 'medal-step', 'on a roll': 'medal-flame', 'star collector': 'medal-star', 'super star': 'medal-stars', 'perfectionist': 'medal-100', 'halfway there': 'medal-half', 'level up!': 'medal-up', 'dedicated': 'medal-target' };
    document.querySelectorAll('#badgeGrid .sd-badge').forEach(function (b) {
      var t = b.querySelector('.t'), i = b.querySelector('.ic'), name = t && MED[t.textContent.trim().toLowerCase()];
      if (i && name) { i.innerHTML = ic(name); i.classList.add('lm'); }
    });
  }

  var done = false;
  function run() { if (done) return; done = true; try { mission(); stats(); menu(); decorate(); } catch (e) { if (window.console) console.warn('Lumio mission card skipped:', e); } }
  if (window.LumioMapState) run();
  document.addEventListener('lumio-map-ready', run);
})();
