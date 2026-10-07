/* Lumio English — student dashboard cover ("Story Journey" design, 2026).
   Adds the storybook cover above chapter 1 ("<Name>'s story, chapter <current lesson>"), built only from
   data the page already has:
   - lesson progress from js/dashboard.js (window.LumioMapState: done / current / total),
   - the "Continue" link that student.html already computed (#missionBtn),
   - streak, stars/XP, reward points and sessions left, read from the page's own counters
     (#streakVal, #starCount, #rwPointsVal, #sessionsRemainingPill) and kept in step with them;
     a chip only shows when the page has that number (no made-up values),
   - the next live class from LumioSchedule.upcomingForStudent (Saudi time, like the rest of the page).
   It never changes the page's own elements, so if anything here fails the dashboard is untouched. */
(function () {
  'use strict';
  function $(s) { return document.querySelector(s); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var STORY = { 'pre-a': "Lumi's Magic Map", level1: 'The Treehouse Club', level2: 'The Twelve Months Club', level3: 'The Crew' };
  var built = false, timer = null;

  function visible(el) { return !!el && el.style.display !== 'none' && !!(el.offsetParent || el.getClientRects().length); }

  // stat chips mirror the page's own counters
  function chips(box, teen) {
    function setChip(key, show, val, label) {
      var c = box.querySelector('[data-chip="' + key + '"]'); if (!c) return;
      c.hidden = !show; if (!show) return;
      c.querySelector('b').textContent = val; c.querySelector('small').textContent = label;
    }
    function read() {
      var st = $('#streakVal'), sc = $('#starCount'), pts = $('#rwPointsVal'), rw = $('#rewardsCard'), pill = $('#sessionsRemainingPill');
      var sv = st ? parseInt(st.textContent, 10) || 0 : null;
      setChip('streak', sv !== null, sv + (sv === 1 ? ' day' : ' days'), 'Streak');
      setChip('stars', !!sc, (sc ? sc.textContent.trim() : '') + (teen ? ' XP' : ''), teen ? 'Experience' : 'Stars earned');
      setChip('points', !!(pts && rw && rw.style.display !== 'none'), (pts ? pts.textContent.trim() : '') + ' pts', 'Reward points');
      var m = pill && pill.style.display !== 'none' ? String(pill.textContent).match(/\d+/) : null;
      setChip('sessions', !!m, (m ? m[0] : '') + ' left', 'Sessions');
    }
    read();
    if (window.MutationObserver) {
      var mo = new MutationObserver(read);
      ['#streakVal', '#starCount', '#rwPointsVal', '#rewardsCard', '#sessionsRemainingPill'].forEach(function (s) {
        var el = $(s); if (el) mo.observe(el, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ['style'] });
      });
    }
  }

  function build() {
    if (built) return;
    var L = window.Lumio, M = window.LumioMapState, hero = $('#secToday') || $('.sd-hero');
    if (!L || !M || !hero) return;
    built = true;
    try {
      var u = L.user() || {};
      var lv = (L.LEVELS || []).find(function (x) { return x.id === M.level; }) || { name: M.level };
      var teen = /^level([3-9]|10)$/.test(M.level);
      var first = String(u.name || '').trim().split(/\s+/)[0] || '';
      var h = Number(String((L.tzNow ? L.tzNow().hm : '') || new Date().getHours() + ':00').split(':')[0]);
      var part = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
      var total = M.total || 20, done = Math.min(M.done || 0, total), pct = Math.round(done / total * 100);
      var finished = done >= total, next = Math.min(total, (M.current || done + 1));
      var lvShort = String(lv.name || '').split(' · ')[0];
      var lessons = window.LUMIO_LESSONS && window.LUMIO_LESSONS[M.level];
      var lt = lessons ? (lessons[next] || lessons[String(next)]) : null;
      var ltTitle = lt && lt.title ? String(lt.title) : '';
      var lead = finished
        ? 'You finished ' + lvShort + '! Your level test and certificate are waiting.'
        : done === 0 ? "Let's start " + lvShort + ' with Lesson 1' + (ltTitle ? ': “' + ltTitle + '”.' : '.')
        : "You're on Lesson " + next + ' of ' + total + (ltTitle ? ': “' + ltTitle + '”' : '') + '. ' + (total - done > 1 ? (total - done) + ' lessons to go.' : 'The last one!');
      var mission = $('#missionBtn');
      var go = mission && mission.getAttribute('href') && mission.getAttribute('href') !== '#' ? mission.getAttribute('href') : 'lesson.html?level=' + encodeURIComponent(M.level) + '&n=' + next;
      var goText = finished ? (mission ? mission.textContent.trim() : 'Open') : "Open today's chapter";
      var buddy = 'assets/story/characters/' + (teen ? 'lumi-teen-welcome-hero.png' : 'lumi-welcome-hero.png');
      var day = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'Asia/Riyadh' }).format(new Date());
      var kicker = "Today's page · " + day + ' ' + (teen && part === 'evening' ? 'night' : part);
      var sub = lv.name + (STORY[M.level] ? ' · ' + STORY[M.level] : '');
      var p = window.LumioProfiles && LumioProfiles.findByName ? LumioProfiles.findByName(u.name) : null;

      var card = document.createElement('section');
      card.className = 'sj-cover';
      card.setAttribute('aria-labelledby', 'sjCoverTitle');
      card.innerHTML =
        '<div class="sj-mascot" aria-hidden="true"><img src="' + buddy + '" alt="" onerror="this.remove()"></div>' +
        '<p class="sj-kicker">' + esc(kicker) + '</p>' +
        '<h1 id="sjCoverTitle">' + esc(first ? first + '’s story, ' : 'Your story, ') +
          '<em>' + (finished ? 'the last page' : 'chapter ' + next) + '</em></h1>' +
        '<p class="sj-sub">' + esc(sub) + '</p>' +
        '<p class="sj-lede">' + esc(lead) + ' Follow the glowing path: every stop is a chapter of your English adventure.</p>' +
        '<p class="sj-ar" dir="rtl" lang="ar">للأهل: هذه صفحة طفلكم. انزلوا مع المسار لرؤية مهمة اليوم والتقدم والحصص.</p>' +
        '<div class="sj-book" role="img" aria-label="' + esc(done + ' of ' + total + ' lessons done') + '"><span class="sj-book-bar"><i id="s26Ring" style="width:' + pct + '%"></i></span><span class="sj-book-t"><b>' + pct + '%</b> · ' + esc(done + ' of ' + total + ' lessons') + '</span></div>' +
        '<div class="sj-stats">' +
          '<div class="sj-stat" data-chip="streak" hidden><span class="ico" aria-hidden="true">🔥</span><span><b></b><small></small></span></div>' +
          '<div class="sj-stat" data-chip="stars" hidden><span class="ico" aria-hidden="true">' + (teen ? '⚡' : '⭐') + '</span><span><b></b><small></small></span></div>' +
          '<div class="sj-stat" data-chip="points" hidden><span class="ico" aria-hidden="true">🪙</span><span><b></b><small></small></span></div>' +
          '<div class="sj-stat" data-chip="sessions" hidden><span class="ico" aria-hidden="true">🎟️</span><span><b></b><small></small></span></div>' +
        '</div>' +
        '<div class="sj-ctas"><a class="sj-btn p" id="s26Go" href="' + esc(go) + '"><span>' + esc(goText) + '</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></a>' +
        '<button type="button" class="sj-btn g" id="s26Sched">My schedule</button>' +
        (p && p.subscribed === true ? '<span class="sj-pill ok"><span class="ic" aria-hidden="true">✅</span>Subscribed</span>' : '') + '</div>';
      hero.parentNode.insertBefore(card, hero);
      chips(card, teen);

      var sched = $('#scheduleCard');
      $('#s26Sched').onclick = function () { if (sched) sched.scrollIntoView({ behavior: 'smooth', block: 'start' }); };

      // next live class: a live countdown (the Join button and its rules stay in "My classes")
      var S = window.LumioSchedule, cls = null;
      try { cls = S && S.upcomingForStudent ? (S.upcomingForStudent(u.name, 5) || [])[0] : null; } catch (e) { cls = null; }
      if (cls && L.tzToDate) {
        var start = L.tzToDate(cls.date, cls.startTime);
        var dayStr = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric', timeZone: 'Asia/Riyadh' }).format(start);
        var when = dayStr + ' · ' + (L.fmtClassTime ? L.fmtClassTime(cls.date, cls.startTime) : cls.startTime);
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

      // gentle entrance (skipped for reduced motion); opacity/transform only, never left hidden
      var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!still && card.animate) {
        card.animate([{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }], { duration: 650, easing: 'cubic-bezier(.22,1,.36,1)' });
        var kids = card.querySelectorAll('h1, .sj-lede, .sj-stat, .sj-ctas');
        Array.prototype.forEach.call(kids, function (el, i) { el.animate([{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: 600, delay: 150 + i * 60, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' }); });
        var mas = card.querySelector('.sj-mascot');
        if (mas) mas.animate([{ opacity: 0, transform: 'translateX(50px) rotate(10deg)' }, { opacity: 1, transform: 'none' }], { duration: 1000, delay: 250, easing: 'cubic-bezier(.34,1.56,.64,1)', fill: 'backwards' });
      }
    } catch (e) {
      if (window.console) console.warn('Lumio welcome card skipped:', e);
    }
  }

  if (window.LumioMapState) build();
  document.addEventListener('lumio-map-ready', build);
})();
