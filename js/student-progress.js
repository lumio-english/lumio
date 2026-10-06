/* Lumio English — "My progress" on the student page (section #secProgress).
   1. Totals: lessons finished, live classes attended, attendance, prep score,
      homework score and the teacher's average grade.
   2. "My lessons": one row per unlocked lesson with its prep stars + score,
      the live class (attended / absent / booked + the teacher's grade) and
      the homework score, and buttons to go back to everything of a finished
      lesson: the prep, the interactive homework, flashcards, the homework
      sheet and the writing sheet.
   Reads the same data the rest of student.html uses (Lumio.progressFor,
   Lumio.homeworkFor, LumioSchedule classes) and never writes anything. */
(function () {
  'use strict';
  var GRADE_POINTS = { 'A+': 4.3, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D': 1.0, 'F': 0.0 };
  var SHEETS = ['pre-a', 'level1', 'level2', 'level3']; // homework + writing PDFs exist for these levels
  var filter = 'all';

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function ic(n) { return (window.LumioIcons && LumioIcons.svg(n)) || ''; }
  function pad(n) { return String(n).padStart(2, '0'); }
  function pctOf(r) { return r && Number(r.total) > 0 ? Math.round(Number(r.score) / Number(r.total) * 100) : null; }
  function avg(list) { return list.length ? Math.round(list.reduce(function (a, b) { return a + b; }, 0) / list.length) : null; }
  function fmtDay(d) {
    if (!d) return '';
    var p = String(d).split('-').map(Number);
    return new Date(Date.UTC(p[0], p[1] - 1, p[2])).toLocaleDateString('en', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  }
  function gradeTone(g) { return !g ? '' : g[0] === 'A' ? 'good' : g[0] === 'B' ? 'ok' : g[0] === 'C' ? 'mid' : 'low'; }
  function scoreTone(p) { return p === null ? '' : p >= 85 ? 'good' : p >= 70 ? 'ok' : p >= 50 ? 'mid' : 'low'; }
  function starsHtml(n) { n = Math.max(0, Math.min(3, Number(n) || 0)); return '<span class="spg-stars" aria-label="' + n + ' of 3 stars">' + '★'.repeat(n) + '<i>' + '★'.repeat(3 - n) + '</i></span>'; }

  function collect() {
    var u = window.Lumio && Lumio.user && Lumio.user();
    if (!u || !u.name) return null;
    var level = u.level || 'pre-a';
    var meta = (Lumio.LEVELS || []).filter(function (l) { return l.id === level; })[0] || { name: level, lessons: 20 };
    var total = meta.lessons || 20;
    var prog = (Lumio.progressFor(u.name) || {})[level] || {};
    var hw = (Lumio.homeworkFor ? Lumio.homeworkFor(u.name)[level] : null) || {};
    var S = window.LumioSchedule;
    var classes = S && S.listClasses ? S.listClasses({ studentName: u.name, level: level }) : [];
    var me = String(u.name).trim().toLowerCase();
    var byLesson = {};
    classes.forEach(function (c) {
      var n = Number(c.lessonNumber); if (!n || c.status === 'cancelled') return;
      var slot = (c.students || []).filter(function (s) { return String(s.studentName || '').trim().toLowerCase() === me; })[0];
      if (!slot) return;
      var cur = byLesson[n];
      // keep the attended class over an absent/booked one, then the latest
      var rank = function (x) { return x.slot.attendance === 'present' ? 2 : x.slot.attendance ? 1 : 0; };
      var cand = { c: c, slot: slot };
      if (!cur || rank(cand) > rank(cur) || (rank(cand) === rank(cur) && (c.date + c.startTime) > (cur.c.date + cur.c.startTime))) byLesson[n] = cand;
    });
    var att = S && S.attendanceStatsForStudent ? S.attendanceStatsForStudent(u.name) : { present: 0, total: 0 };
    var lessons = [], current = total + 1;
    for (var n = 1; n <= total; n++) {
      var cls = byLesson[n] || null;
      var L = {
        n: n, data: (window.LUMIO_LESSONS && LUMIO_LESSONS[level] && LUMIO_LESSONS[level][n]) || {},
        prep: prog[n] || null, hw: hw[n] || null, cls: cls,
        attended: !!(cls && cls.slot.attendance === 'present')
      };
      L.done = !!(L.prep && L.attended && L.hw);
      if (!L.done && current > total) current = n;
      lessons.push(L);
    }
    var prepP = [], hwP = [], grades = [];
    lessons.forEach(function (L) {
      var a = pctOf(L.prep), b = pctOf(L.hw);
      if (a !== null) prepP.push(a);
      if (b !== null) hwP.push(b);
      if (L.cls && L.cls.slot.grade && GRADE_POINTS[L.cls.slot.grade] != null) grades.push(GRADE_POINTS[L.cls.slot.grade]);
    });
    var gradePct = grades.length ? Math.round(grades.reduce(function (a, b) { return a + b; }, 0) / grades.length / 4.3 * 100) : null;
    var gradeLetter = gradePct === null ? null : Object.keys(GRADE_POINTS).reduce(function (best, k) {
      return Math.abs(GRADE_POINTS[k] / 4.3 * 100 - gradePct) < Math.abs(GRADE_POINTS[best] / 4.3 * 100 - gradePct) ? k : best;
    }, 'A+');
    return {
      u: u, level: level, meta: meta, total: total, lessons: lessons, current: current,
      finished: lessons.filter(function (L) { return L.done; }).length,
      attended: lessons.filter(function (L) { return L.attended; }).length,
      att: att, attPct: att.total ? Math.round(att.present / att.total * 100) : null,
      prepAvg: avg(prepP), hwAvg: avg(hwP), prepCount: prepP.length, hwCount: hwP.length,
      gradeLetter: gradeLetter, gradePct: gradePct, gradeCount: grades.length,
      stars: lessons.reduce(function (s, L) { return s + (L.prep ? Number(L.prep.stars) || 0 : 0); }, 0)
    };
  }

  function tiles(D) {
    var t = [
      ['check', D.finished + '<small>/' + D.total + '</small>', 'Lessons finished', 'Prep + class + homework', ''],
      ['video', String(D.attended), 'Classes attended', D.att.total ? D.att.present + ' of ' + D.att.total + ' marked' : 'None marked yet', ''],
      ['calendar', D.attPct === null ? '–' : D.attPct + '%', 'Attendance', D.att.total ? (D.att.absent || 0) + (D.att['no-show'] || 0) + ' missed' : 'After your first class', scoreTone(D.attPct)],
      ['book', D.prepAvg === null ? '–' : D.prepAvg + '%', 'Prep score', D.prepCount ? D.prepCount + ' lesson' + (D.prepCount === 1 ? '' : 's') + ' · ' + D.stars + ' ★' : 'Not started yet', scoreTone(D.prepAvg)],
      ['pencil', D.hwAvg === null ? '–' : D.hwAvg + '%', 'Homework score', D.hwCount ? D.hwCount + ' homework' + (D.hwCount === 1 ? '' : 's') + ' done' : 'None done yet', scoreTone(D.hwAvg)],
      ['grad', D.gradeLetter || '–', 'Teacher grade', D.gradeCount ? 'Average of ' + D.gradeCount + ' class' + (D.gradeCount === 1 ? '' : 'es') + ' · ' + D.gradePct + '%' : 'Given after each class', gradeTone(D.gradeLetter)]
    ];
    return '<div class="spg-tiles">' + t.map(function (x) {
      return '<div class="spg-tile ' + x[4] + '"><span class="spg-tic">' + ic(x[0]) + '</span><b>' + x[1] + '</b><span class="spg-tl">' + x[2] + '</span><small>' + esc(x[3]) + '</small></div>';
    }).join('') + '</div>';
  }

  function row(D, L) {
    var lv = D.level, nn = pad(L.n), unlocked = L.n <= D.current;
    var title = L.data.title || ('Lesson ' + L.n), titleAr = L.data.titleAr || '';
    var p = pctOf(L.prep), h = pctOf(L.hw);
    var prepCell = L.prep
      ? '<div class="spg-cell"><span class="spg-k">Prep</span>' + starsHtml(L.prep.stars) + '<b class="' + scoreTone(p) + '">' + (p === null ? 'Done' : p + '%') + '</b></div>'
      : '<div class="spg-cell todo"><span class="spg-k">Prep</span><b>' + (unlocked ? 'To do' : '—') + '</b></div>';
    var c = L.cls, classCell;
    if (c && c.slot.attendance === 'present') {
      classCell = '<div class="spg-cell"><span class="spg-k">Class</span><span class="spg-ok">✓ ' + esc(fmtDay(c.c.date)) + '</span>' + (c.slot.grade ? '<b class="spg-grade ' + gradeTone(c.slot.grade) + '">' + esc(c.slot.grade) + '</b>' : '<b class="spg-wait">No grade yet</b>') + '</div>';
    } else if (c && c.slot.attendance) {
      classCell = '<div class="spg-cell miss"><span class="spg-k">Class</span><b>' + (c.slot.attendance === 'absent' ? 'Absent' : 'Missed') + ' · ' + esc(fmtDay(c.c.date)) + '</b></div>';
    } else if (c) {
      classCell = '<div class="spg-cell todo"><span class="spg-k">Class</span><b>Booked · ' + esc(fmtDay(c.c.date)) + '</b></div>';
    } else {
      classCell = '<div class="spg-cell todo"><span class="spg-k">Class</span><b>' + (unlocked ? 'Not booked' : '—') + '</b></div>';
    }
    var hwCell = L.hw
      ? '<div class="spg-cell"><span class="spg-k">Homework</span>' + (L.hw.stars != null ? starsHtml(L.hw.stars) : '') + '<b class="' + scoreTone(h) + '">' + (h === null ? 'Done' : h + '%') + '</b></div>'
      : '<div class="spg-cell todo"><span class="spg-k">Homework</span><b>' + (L.prep && L.attended ? 'To do' : '—') + '</b></div>';
    var acts = [];
    if (unlocked) acts.push('<a class="spg-act" href="lesson.html?level=' + lv + '&n=' + L.n + '">' + ic('play') + (L.prep ? 'Replay prep' : 'Start prep') + '</a>');
    if (L.prep && L.attended) acts.push('<a class="spg-act" href="homework.html?level=' + lv + '&n=' + L.n + '">' + ic('pencil') + (L.hw ? 'Redo homework' : 'Homework') + '</a>');
    if (unlocked) acts.push('<a class="spg-act" href="flashcards/' + lv + '/lesson' + nn + '-flashcards.pdf" target="_blank" rel="noopener">' + ic('cards') + 'Flashcards</a>');
    if (unlocked && SHEETS.indexOf(lv) >= 0) {
      acts.push('<a class="spg-act" href="worksheets/' + lv + '/lesson' + nn + '-homework.pdf" target="_blank" rel="noopener">' + ic('sheet') + 'Homework sheet</a>');
      acts.push('<a class="spg-act" href="writing/' + lv + '/lesson' + nn + '-writing.pdf" target="_blank" rel="noopener">' + ic('write') + 'Writing</a>');
    }
    var state = L.done ? 'done' : L.n === D.current ? 'now' : unlocked ? 'open' : 'locked';
    var badge = L.done ? '<span class="spg-badge done">Finished</span>' : L.n === D.current ? '<span class="spg-badge now">Now</span>' : '';
    return '<li class="spg-row ' + state + '" data-done="' + (L.done ? 1 : 0) + '">' +
      '<div class="spg-num">' + (L.done ? ic('check') : L.n) + '</div>' +
      '<div class="spg-main">' +
        '<div class="spg-title"><b>Lesson ' + L.n + ' · ' + esc(title) + '</b>' + badge + (titleAr ? '<span class="spg-ar" dir="rtl" lang="ar">' + esc(titleAr) + '</span>' : '') + '</div>' +
        '<div class="spg-cells">' + prepCell + classCell + hwCell + '</div>' +
        (c && c.slot.gradeComment ? '<div class="spg-note">“' + esc(c.slot.gradeComment) + '”' + (c.c.teacherName ? ' — ' + esc(c.c.teacherName) : '') + '</div>' : '') +
        (acts.length ? '<div class="spg-acts">' + acts.join('') + '</div>' : '') +
      '</div></li>';
  }

  function render() {
    var host = document.getElementById('progressBody');
    if (!host) return;
    var D;
    try { D = collect(); } catch (e) { if (window.console) console.warn('Lumio progress skipped:', e); return; }
    if (!D) return;
    var shown = D.lessons.filter(function (L) { return L.n <= D.current || L.prep || L.hw || L.cls; });
    var locked = D.total - shown.length;
    var list = shown.filter(function (L) { return filter === 'all' || L.done; });
    host.innerHTML = tiles(D) +
      '<div class="spg-head"><h3>My lessons <span>' + esc(D.meta.name) + '</span></h3>' +
        '<div class="spg-filter" role="tablist"><button type="button" role="tab" data-f="all" aria-selected="' + (filter === 'all') + '">All</button><button type="button" role="tab" data-f="done" aria-selected="' + (filter === 'done') + '">Finished (' + D.finished + ')</button></div></div>' +
      '<p class="spg-sub">Go back to any lesson: replay the prep, redo the homework or open its flashcards and sheets.</p>' +
      (list.length ? '<ol class="spg-list">' + list.map(function (L) { return row(D, L); }).join('') + '</ol>'
        : '<div class="spg-empty">No finished lessons yet. A lesson is finished when its prep, live class and homework are all done.</div>') +
      (filter === 'all' && locked > 0 ? '<div class="spg-locked">' + ic('lock') + locked + ' more lesson' + (locked === 1 ? '' : 's') + ' unlock as you go</div>' : '');
    host.querySelectorAll('[data-f]').forEach(function (b) { b.addEventListener('click', function () { filter = b.getAttribute('data-f'); render(); }); });
    var sec = document.querySelector('#secProgress .s26-ic');
    if (sec && window.LumioIcons) { sec.innerHTML = ic('chart'); sec.classList.add('lm'); }
  }
  window.LumioStudentProgress = { render: render, collect: collect };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render); else render();
})();
