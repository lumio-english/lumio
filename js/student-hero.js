/* Lumio English — student dashboard welcome card (2026 redesign).
   Adds a greeting card above "Today's mission" built only from data the page already has:
   - lesson progress from js/dashboard.js (window.LumioMapState: done / current / total),
   - the "Continue" link that student.html already computed (#missionBtn),
   - the next live class from LumioSchedule.upcomingForStudent (Saudi time, like the rest of the page).
   It never changes the page's own elements, so if anything here fails the dashboard is untouched. */
(function () {
  'use strict';
  function $(s) { return document.querySelector(s); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var STORY = { 'pre-a': "Lumi's Magic Map", level1: 'The Treehouse Club', level2: 'The Twelve Months Club', level3: 'The Crew' };
  var built = false, timer = null;

  function build() {
    if (built) return;
    var L = window.Lumio, M = window.LumioMapState, hero = $('.sd-hero');
    if (!L || !M || !hero) return;
    built = true;
    try {
      var u = L.user() || {};
      var lv = (L.LEVELS || []).find(function (x) { return x.id === M.level; }) || { name: M.level };
      var teen = /^level([3-9]|10)$/.test(M.level);
      var first = String(u.name || '').trim().split(/\s+/)[0] || '';
      var h = Number(String((L.tzNow ? L.tzNow().hm : '') || new Date().getHours() + ':00').split(':')[0]);
      var greet = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
      var greetAr = h < 12 ? 'صباح الخير' : 'مساء الخير';
      var total = M.total || 20, done = Math.min(M.done || 0, total), pct = Math.round(done / total * 100);
      var finished = done >= total, next = Math.min(total, (M.current || done + 1));
      var lead = finished
        ? 'You finished ' + lv.name.split(' · ')[0] + '! Your level test and certificate are waiting.'
        : done === 0 ? "Let's start " + lv.name.split(' · ')[0] + ' with Lesson 1.'
        : 'You have finished ' + done + ' of ' + total + ' lessons. Lesson ' + next + ' is next' + (total - done > 1 ? ', ' + (total - done) + ' to go.' : ', the last one!');
      var mission = $('#missionBtn');
      var go = mission && mission.getAttribute('href') && mission.getAttribute('href') !== '#' ? mission.getAttribute('href') : 'lesson.html?level=' + encodeURIComponent(M.level) + '&n=' + next;
      var goText = finished ? (mission ? mission.textContent.trim() : 'Open') : 'Continue lesson ' + next;
      var buddy = 'assets/story/characters/' + (teen ? 'lumi-teen-welcome-hero.png' : 'lumi-welcome-hero.png');
      var kicker = lv.name + (STORY[M.level] ? ' · ' + STORY[M.level] : '');

      var card = document.createElement('section');
      card.className = 's26-hello';
      card.setAttribute('aria-label', 'Welcome');
      card.innerHTML =
        '<div><span class="s26-kicker">' + esc(kicker) + '</span>' +
        '<h1>' + esc(greet + (first ? ', ' + first : '') + '!') + '</h1>' +
        '<div style="font-family:Tajawal,sans-serif;font-weight:700;font-size:17px;color:#FFE3CC;margin-top:4px" dir="rtl" lang="ar">' + esc(greetAr + (first ? ' يا ' + first : '')) + '</div>' +
        '<p class="s26-lead">' + esc(lead) + '</p>' +
        '<div class="s26-ctas"><a class="s26-btn p" id="s26Go" href="' + esc(go) + '">' + esc(goText) + ' →</a>' +
        '<button type="button" class="s26-btn g" id="s26Sched">My schedule</button></div></div>' +
        '<div class="s26-ring" role="img" aria-label="' + esc(done + ' of ' + total + ' lessons done') + '"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,.3)" stroke-width="4.5"/>' +
        '<circle id="s26Ring" cx="20" cy="20" r="16" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round" pathLength="100" stroke-dasharray="100" stroke-dashoffset="' + (100 - pct) + '"/></svg>' +
        '<div class="c"><b>' + pct + '%</b><span>' + esc(done + ' of ' + total + ' lessons') + '</span></div></div>' +
        '<div class="s26-buddy"><img src="' + buddy + '" alt=""></div>';
      hero.parentNode.insertBefore(card, hero);

      var sched = $('#scheduleCard');
      $('#s26Sched').onclick = function () { if (sched) sched.scrollIntoView({ behavior: 'smooth', block: 'start' }); };

      // next live class: a live countdown (the Join button and its rules stay in "My schedule")
      var S = window.LumioSchedule, cls = null;
      try { cls = S && S.upcomingForStudent ? (S.upcomingForStudent(u.name, 5) || [])[0] : null; } catch (e) { cls = null; }
      if (cls && L.tzToDate) {
        var start = L.tzToDate(cls.date, cls.startTime);
        var day = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric', timeZone: 'Asia/Riyadh' }).format(start);
        var when = day + ' · ' + (L.fmtClassTime ? L.fmtClassTime(cls.date, cls.startTime) : cls.startTime);
        var row = document.createElement('div');
        row.className = 's26-next';
        row.innerHTML = '<div><div class="lbl">Next live class' + (cls.lessonNumber ? ' · Lesson ' + esc(cls.lessonNumber) : '') + '</div><div class="when">' + esc(when) + '</div></div>' +
          '<div class="s26-count" aria-live="off"><div><b id="s26d">0</b><small>days</small></div><div><b id="s26h">0</b><small>hours</small></div><div><b id="s26m">0</b><small>min</small></div></div>';
        card.appendChild(row);
        var tick = function () {
          var ms = start - new Date();
          if (ms <= 0) { row.querySelector('.s26-count').innerHTML = '<div style="min-width:auto;padding:8px 12px"><b style="font-size:15px">Class time!</b></div>'; clearInterval(timer); return; }
          var m = Math.floor(ms / 60000);
          $('#s26d').textContent = Math.floor(m / 1440); $('#s26h').textContent = Math.floor(m % 1440 / 60); $('#s26m').textContent = m % 60;
        };
        tick(); timer = setInterval(tick, 30000);
      }

      // gentle entrance (skipped for reduced motion)
      var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!still && card.animate) {
        card.animate([{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }], { duration: 600, easing: 'cubic-bezier(.22,1,.36,1)' });
        var ring = card.querySelector('#s26Ring');
        if (ring && ring.animate) ring.animate([{ strokeDashoffset: 100 }, { strokeDashoffset: 100 - pct }], { duration: 1300, easing: 'cubic-bezier(.22,1,.36,1)' });
      }
    } catch (e) {
      if (window.console) console.warn('Lumio welcome card skipped:', e);
    }
  }

  if (window.LumioMapState) build();
  document.addEventListener('lumio-map-ready', build);
})();
