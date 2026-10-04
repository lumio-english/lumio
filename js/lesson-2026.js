/* Lumio English — lesson prep page layout (2026).
   Adds a side panel to lesson.html: the lesson (level, number, English + Arabic title, buddy), a progress
   bar and the list of activities with the current one highlighted. It listens for "lumio-lesson-step"
   from js/lesson.js and never touches the activities themselves, so the lesson logic stays in one place.
   On phones the panel sits on top and the activities become a scrollable row. */
(function () {
  'use strict';
  var NAMES = {
    'vocab': ['New words', 'See, hear and learn', 'cards'],
    'listen-choose': ['Listen & choose', 'Tap the right picture', 'sound'],
    'match': ['Match', 'Pair words and pictures', 'puzzle'],
    'quiz': ['Quiz', 'Pick the answer', 'question'],
    'spell': ['Spell it', 'Build the word', 'blocks'],
    'spell_blend': ['Sound it out', 'Blend the sounds', 'sound'],
    'sentence_fill': ['Fill the gap', 'Finish the sentence', 'pencil'],
    'speak': ['Say it', 'Record your voice', 'mic'],
    'sequence': ['Put in order', 'Order the steps', 'retry']
  };
  var rail, list, prog, progBar, progText, built = false;
  function ic(name) { return (window.LumioIcons && LumioIcons.svg(name)) || ''; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function build(d) {
    var main = document.querySelector('main.wrap'), stage = document.getElementById('stage');
    if (!main || !stage) return false;
    document.body.classList.add('l26');
    var lv = (window.Lumio && Lumio.LEVELS || []).filter(function (l) { return l.id === d.level; })[0];
    var teen = document.body.classList.contains('theme-teen');
    rail = document.createElement('aside'); rail.className = 'l26-rail';
    rail.innerHTML =
      '<div class="l26-hero">' +
        '<p class="l26-kicker">' + esc((lv ? lv.name : d.level) + ' · Lesson ' + d.num) + '</p>' +
        '<h1 class="l26-title">' + esc(d.title) + '</h1>' +
        (d.titleAr ? '<p class="l26-ar" dir="rtl" lang="ar">' + esc(d.titleAr) + '</p>' : '') +
        '<p class="l26-sub">Get ready for your live class: learn the new words, then play.</p>' +
        '<div class="l26-prog"><div class="l26-prog-bar"><i></i></div><span></span></div>' +
        '<img class="l26-buddy" alt="" src="assets/story/characters/' + (teen ? 'lumi-teen-welcome-hero.png' : 'lumi-welcome-hero.png') + '" onerror="this.remove()">' +
      '</div>' +
      '<ol class="l26-steps" aria-label="Activities in this lesson"></ol>';
    main.insertBefore(rail, stage);
    stage.classList.add('l26-stage');
    list = rail.querySelector('.l26-steps'); progBar = rail.querySelector('.l26-prog i'); progText = rail.querySelector('.l26-prog span');
    list.innerHTML = d.types.map(function (t, k) {
      var n = NAMES[t] || [t, '', 'star'];
      return '<li data-k="' + k + '"><span class="l26-dot">' + ic(n[2]) + '</span><span class="l26-tx"><b>' + esc(n[0]) + '</b><small>' + esc(n[1]) + '</small></span></li>';
    }).join('');
    return true;
  }
  function update(d) {
    if (!built) built = build(d);
    if (!built) return;
    var total = d.types.length, i = Math.min(d.i, total);
    Array.prototype.forEach.call(list.children, function (li, k) {
      li.className = k < i ? 'done' : k === i ? 'now' : '';
      if (k === i) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
      var dot = li.querySelector('.l26-dot');
      var want = k < i ? 'check' : (NAMES[d.types[k]] || [0, 0, 'star'])[2];
      if (dot.getAttribute('data-ic') !== want) { dot.innerHTML = ic(want); dot.setAttribute('data-ic', want); }
    });
    progBar.style.width = Math.round(i / total * 100) + '%';
    progText.textContent = i >= total ? 'Prep done! See you in class' : 'Activity ' + (i + 1) + ' of ' + total;
    // keep the current activity in view in the phone row
    var cur = list.children[i];
    if (cur && list.scrollWidth > list.clientWidth) list.scrollTo({ left: cur.offsetLeft - 12, behavior: 'smooth' });
  }
  document.addEventListener('lumio-lesson-step', function (e) { if (e.detail && e.detail.types && e.detail.types.length) update(e.detail); });
})();
