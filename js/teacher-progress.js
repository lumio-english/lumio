/* Lumio English — teacher's detailed view of one student's progress (teacher.html).
   LumioTeacherProgress.open(name, level) shows a full-screen panel with
   1. totals: classes done (of 24), attendance, prep score, homework score, teacher grade, level game, story, level test;
   2. one row per class in the level's order (20 lessons + Bonus Classes B1-B4 after lessons 4, 8, 12, 16):
      prep (stars, %), the live class (attended / absent / booked, grade, comment), homework (%),
      the level's own game (best stars and score) and the Hub word games, with a status;
   3. filters: All · Needs attention · Done.
   Reads the same records the student page uses (Lumio.progressFor, homeworkFor, gameBestFor, storyProgressFor,
   levelTestFor, LumioSchedule classes) and NEVER writes anything. */
(function () {
  "use strict";
  var GRADE_POINTS = { "A+": 4.3, "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7, "C+": 2.3, "C": 2.0, "C-": 1.7, "D": 1.0, "F": 0.0 };
  var LEVEL_GAME = { "pre-a": "lumis-pocket", level1: "treehouse-builder", level2: "twelve-months-calendar", level3: "crew-chat",
    level4: "squad-budget", level5: "story-detective", level6: "crystal-ball" };
  var titleCache = {};
  var state = { name: "", level: "", filter: "all" };

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function pct(r) { return r && Number(r.total) > 0 ? Math.round(Number(r.score) / Number(r.total) * 100) : null; }
  function avg(a) { return a.length ? Math.round(a.reduce(function (x, y) { return x + y; }, 0) / a.length) : null; }
  function tone(p) { return p == null ? "" : p >= 85 ? "good" : p >= 70 ? "ok" : p >= 50 ? "mid" : "low"; }
  function gTone(g) { return !g ? "" : g[0] === "A" ? "good" : g[0] === "B" ? "ok" : g[0] === "C" ? "mid" : "low"; }
  function stars(n) { n = Math.max(0, Math.min(3, Number(n) || 0)); return '<span class="tp-st">' + "★".repeat(n) + "<i>" + "★".repeat(3 - n) + "</i></span>"; }
  function day(d) {
    if (!d) return "";
    var p = String(d).split("-").map(Number);
    if (p.length < 3 || !p[0]) return esc(d);
    return new Date(Date.UTC(p[0], p[1] - 1, p[2])).toLocaleDateString("en", { month: "short", day: "numeric", timeZone: "UTC" });
  }
  function key(n) { return String(n); }

  function titles(level) {
    if (titleCache[level]) return Promise.resolve(titleCache[level]);
    var L = window.Lumio, seq = L.levelSequence(level);
    return Promise.all(seq.map(function (n) {
      var url = L.isBonus(n) ? "bonus-classes/" + level + "/bonus" + String(L.bonusNumber(n)).padStart(2, "0") + ".json"
        : "lessons/" + level + "/lesson" + String(n).padStart(2, "0") + ".json";
      var local = !L.isBonus(n) && window.LUMIO_LESSONS && LUMIO_LESSONS[level] && LUMIO_LESSONS[level][n];
      if (local) return local.title || "";
      return fetch(url).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) { return (d && d.title) || ""; }).catch(function () { return ""; });
    })).then(function (t) { var o = {}; seq.forEach(function (n, i) { o[key(n)] = t[i]; }); return (titleCache[level] = o); });
  }

  function collect(name, level) {
    var L = window.Lumio, S = window.LumioSchedule;
    var prog = (L.progressFor(name) || {})[level] || {};
    var hw = (L.homeworkFor(name) || {})[level] || {};
    var games = ((L.gameBestFor && L.gameBestFor(name)) || {})[level] || {};
    var me = String(name).trim().toLowerCase();
    var byLesson = {};
    (S && S.listClasses ? S.listClasses({ studentName: name, level: level }) : []).forEach(function (c) {
      var n = Number(c.lessonNumber); if (!n || c.status === "cancelled") return;
      var slot = (c.students || []).filter(function (s) { return String(s.studentName || "").trim().toLowerCase() === me; })[0];
      if (!slot) return;
      var rank = function (x) { return x.slot.attendance === "present" ? 2 : x.slot.attendance ? 1 : 0; };
      var cand = { c: c, slot: slot }, cur = byLesson[key(n)];
      if (!cur || rank(cand) > rank(cur) || (rank(cand) === rank(cur) && (c.date + c.startTime) > (cur.c.date + cur.c.startTime))) byLesson[key(n)] = cand;
    });
    var lg = LEVEL_GAME[level];
    var rows = L.levelSequence(level).map(function (n) {
      var k = key(n), bonus = L.isBonus(n);
      var gb = games[k] || games[n] || {};
      var r = {
        n: n, bonus: bonus, label: L.lessonLabel(n, true),
        prep: bonus ? null : (prog[k] || prog[n] || null), hw: hw[k] || hw[n] || null, cls: byLesson[k] || null,
        game: lg ? gb[lg] || null : null,
        words: Object.keys(gb).filter(function (g) { return g !== lg; }).map(function (g) { return { g: g, b: gb[g] }; })
      };
      r.attended = !!(r.cls && r.cls.slot.attendance === "present");
      r.done = bonus ? !!(r.hw && r.attended) : !!(r.prep && r.hw && r.attended);
      r.started = !!(r.prep || r.hw || r.cls || r.game || r.words.length);
      // needs attention: attended but homework missing, absent / no-show, prep missing for a booked class, or a weak score
      var hp = pct(r.hw), pp = pct(r.prep);
      r.flags = [];
      if (r.attended && !r.hw) r.flags.push("Homework missing");
      if (r.cls && /absent|no-show/.test(r.cls.slot.attendance || "")) r.flags.push(r.cls.slot.attendance === "no-show" ? "No-show" : "Absent");
      if (!bonus && r.cls && !r.prep) r.flags.push("Prep missing");
      if (hp != null && hp < 60) r.flags.push("Low homework");
      if (pp != null && pp < 60) r.flags.push("Low prep");
      return r;
    });
    var prepP = [], hwP = [], gameS = [], grades = [];
    rows.forEach(function (r) {
      var a = pct(r.prep), b = pct(r.hw);
      if (a != null) prepP.push(a);
      if (b != null) hwP.push(b);
      if (r.game) gameS.push(Number(r.game.stars) || 0);
      if (r.cls && r.cls.slot.grade && GRADE_POINTS[r.cls.slot.grade] != null) grades.push(GRADE_POINTS[r.cls.slot.grade]);
    });
    var marked = rows.filter(function (r) { return r.cls && r.cls.slot.attendance; });
    var gradePct = grades.length ? Math.round(grades.reduce(function (a, b) { return a + b; }, 0) / grades.length / 4.3 * 100) : null;
    var gradeLetter = gradePct == null ? null : Object.keys(GRADE_POINTS).reduce(function (best, k) {
      return Math.abs(GRADE_POINTS[k] / 4.3 * 100 - gradePct) < Math.abs(GRADE_POINTS[best] / 4.3 * 100 - gradePct) ? k : best;
    }, "A+");
    var story = ((L.storyProgressFor && L.storyProgressFor(name)) || {})[level] || {};
    return {
      rows: rows, done: rows.filter(function (r) { return r.done; }).length, total: rows.length,
      attended: rows.filter(function (r) { return r.attended; }).length, marked: marked.length,
      attPct: marked.length ? Math.round(rows.filter(function (r) { return r.attended; }).length / marked.length * 100) : null,
      prepAvg: avg(prepP), prepN: prepP.length, hwAvg: avg(hwP), hwN: hwP.length,
      gameAvg: gameS.length ? (gameS.reduce(function (a, b) { return a + b; }, 0) / gameS.length) : null, gameN: gameS.length,
      gradeLetter: gradeLetter, gradeN: grades.length,
      stars: rows.reduce(function (s, r) { return s + (r.prep ? Number(r.prep.stars) || 0 : 0); }, 0),
      story: Object.keys(story).filter(function (p) { return story[p]; }).sort(),
      test: L.levelTestFor ? L.levelTestFor(name, level) : null,
      game: (L.GAME_NAMES || {})[LEVEL_GAME[level]] || "Level game"
    };
  }

  function tiles(D) {
    var t = [
      [D.done + "<small>/" + D.total + "</small>", "Classes done", "Prep + class + homework", ""],
      [D.attPct == null ? "–" : D.attPct + "%", "Attendance", D.marked ? D.attended + " of " + D.marked + " marked" : "No class marked yet", tone(D.attPct)],
      [D.prepAvg == null ? "–" : D.prepAvg + "%", "Prep", D.prepN ? D.prepN + " lessons · " + D.stars + " ★" : "Not started", tone(D.prepAvg)],
      [D.hwAvg == null ? "–" : D.hwAvg + "%", "Homework", D.hwN ? D.hwN + " sent" : "None sent", tone(D.hwAvg)],
      [D.gameAvg == null ? "–" : D.gameAvg.toFixed(1) + " ★", esc(D.game), D.gameN ? D.gameN + " rounds played" : "Not played yet", D.gameAvg == null ? "" : tone(D.gameAvg / 3 * 100)],
      [D.gradeLetter || "–", "Teacher grade", D.gradeN ? "Average of " + D.gradeN : "Given after each class", gTone(D.gradeLetter)],
      [D.story.length ? D.story.length + "<small>/4</small>" : "–", "Story parts", D.story.length ? "Read: part " + D.story.join(", ") : "None read yet", ""],
      [D.test ? (Number(D.test.pct) || 0) + "%" : "–", "Level test", D.test ? esc(D.test.band || "") + " · " + day(D.test.date) : "Not taken", D.test ? tone(Number(D.test.pct)) : ""]
    ];
    return '<div class="tp-tiles">' + t.map(function (x) { return '<div class="tp-tile ' + x[3] + '"><b>' + x[0] + "</b><span>" + x[1] + "</span><small>" + x[2] + "</small></div>"; }).join("") + "</div>";
  }

  function row(r, T) {
    var p = pct(r.prep), h = pct(r.hw), c = r.cls;
    var prep = r.bonus ? '<span class="tp-na">No prep</span>' : r.prep
      ? stars(r.prep.stars) + '<b class="' + tone(p) + '">' + (p == null ? "Done" : p + "%") + "</b><small>" + day(r.prep.date) + "</small>"
      : '<span class="tp-na">—</span>';
    var cls;
    if (c && c.slot.attendance === "present") cls = '<span class="tp-ok">✓ ' + day(c.c.date) + "</span>" + (c.slot.grade ? '<b class="' + gTone(c.slot.grade) + '">' + esc(c.slot.grade) + "</b>" : '<small>No grade</small>') + (c.slot.gradeComment ? '<small class="tp-cm" title="' + esc(c.slot.gradeComment) + '">“' + esc(c.slot.gradeComment) + "”</small>" : "");
    else if (c && c.slot.attendance) cls = '<span class="tp-bad">' + esc(c.slot.attendance === "no-show" ? "No-show" : c.slot.attendance === "absent" ? "Absent" : c.slot.attendance) + "</span><small>" + day(c.c.date) + "</small>";
    else if (c) cls = '<span class="tp-wait">Booked</span><small>' + day(c.c.date) + " " + esc(c.c.startTime || "") + "</small>";
    else cls = '<span class="tp-na">—</span>';
    var hw = r.hw ? stars(r.hw.stars) + '<b class="' + tone(h) + '">' + (h == null ? "Sent" : h + "%") + "</b>" + (r.bonus ? "<small>Bonus missions</small>" : "") + "<small>" + day(r.hw.date) + "</small>" : '<span class="tp-na">—</span>';
    var game = r.bonus ? '<span class="tp-na">—</span>' : r.game ? stars(r.game.stars) + "<b>" + (Number(r.game.score) || 0) + (r.game.total ? "/" + r.game.total : "") + "</b><small>" + day(r.game.date) + "</small>" : '<span class="tp-na">—</span>';
    var words = r.words.length ? r.words.map(function (w) { return '<span class="tp-chip">' + esc((window.Lumio.GAME_NAMES || {})[w.g] || w.g) + " " + (Number(w.b.score) || 0) + (w.b.total ? "/" + w.b.total : "") + "</span>"; }).join("") : '<span class="tp-na">—</span>';
    var status = r.done ? '<span class="tp-pill good">Done</span>' : r.flags.length ? '<span class="tp-pill low">' + esc(r.flags[0]) + "</span>" + (r.flags.length > 1 ? "<small>+" + (r.flags.length - 1) + " more</small>" : "") : r.started ? '<span class="tp-pill mid">In progress</span>' : '<span class="tp-pill">Not started</span>';
    return '<tr class="' + (r.bonus ? "tp-bonus" : "") + '"><th><span class="tp-n">' + esc(r.label) + "</span><span class=\"tp-t\">" + esc(T[key(r.n)] || "") + "</span></th>" +
      '<td data-l="Prep">' + prep + '</td><td data-l="Class">' + cls + '</td><td data-l="Homework">' + hw + '</td><td data-l="Level game">' + game + '</td><td data-l="Word games">' + words + '</td><td data-l="Status">' + status + "</td></tr>";
  }

  function paint() {
    var box = document.getElementById("tpBody"); if (!box) return;
    var D = collect(state.name, state.level);
    titles(state.level).then(function (T) {
      var rows = D.rows.filter(function (r) { return state.filter === "all" || (state.filter === "done" ? r.done : (!r.done && r.flags.length)); });
      var need = D.rows.filter(function (r) { return !r.done && r.flags.length; }).length;
      document.querySelectorAll("#tpFilters button").forEach(function (b) {
        b.classList.toggle("on", b.dataset.f === state.filter);
        if (b.dataset.f === "need") b.textContent = "Needs attention (" + need + ")";
      });
      box.innerHTML = tiles(D) + '<div class="tp-tablewrap"><table class="tp-table"><thead><tr><th>Class</th><th>Prep</th><th>Live class</th><th>Homework</th><th>' + esc(D.game) + '</th><th>Word games</th><th>Status</th></tr></thead><tbody>' +
        (rows.length ? rows.map(function (r) { return row(r, T); }).join("") : '<tr><td colspan="7" class="tp-empty">Nothing here.</td></tr>') + "</tbody></table></div>" +
        '<p class="tp-foot">Read-only: this view never changes the student\'s records. Scores sync from the student\'s devices; press "Sync now" for the latest.</p>';
    });
  }

  function levelsFor(name, current) {
    var L = window.Lumio, ids = (L.AVAILABLE_LEVELS || []).map(function (l) { return l.id || l; });
    var have = {};
    [L.progressFor(name), L.homeworkFor(name), L.gameBestFor ? L.gameBestFor(name) : {}].forEach(function (o) { Object.keys(o || {}).forEach(function (k) { have[k] = 1; }); });
    have[current] = 1;
    return ids.filter(function (id) { return have[id]; });
  }

  function ensure() {
    if (document.getElementById("tpOverlay")) return;
    var o = document.createElement("div");
    o.id = "tpOverlay"; o.className = "tp-overlay"; o.setAttribute("role", "dialog"); o.setAttribute("aria-modal", "true"); o.setAttribute("aria-labelledby", "tpName");
    o.innerHTML = '<div class="tp-box"><div class="tp-head"><div><small>Student progress</small><h2 id="tpName"></h2></div>' +
      '<select id="tpLevel" class="td-select" aria-label="Level"></select><button type="button" class="tp-x" id="tpClose" aria-label="Close">✕</button></div>' +
      '<div class="tp-filters" id="tpFilters"><button type="button" data-f="all">All classes</button><button type="button" data-f="need">Needs attention</button><button type="button" data-f="done">Done</button></div>' +
      '<div id="tpBody"></div></div>';
    document.body.appendChild(o);
    o.addEventListener("click", function (e) { if (e.target === o) close(); });
    document.getElementById("tpClose").onclick = close;
    document.getElementById("tpLevel").onchange = function (e) { state.level = e.target.value; paint(); };
    document.querySelectorAll("#tpFilters button").forEach(function (b) { b.onclick = function () { state.filter = b.dataset.f; paint(); }; });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && o.classList.contains("show")) close(); });
  }
  function close() { var o = document.getElementById("tpOverlay"); if (o) o.classList.remove("show"); document.body.style.overflow = ""; }

  function open(name, level) {
    if (!window.Lumio || !name) return;
    ensure();
    state.name = name; state.level = level || "pre-a"; state.filter = "all";
    document.getElementById("tpName").textContent = name;
    var names = {}; (window.Lumio.LEVELS || []).forEach(function (l) { names[l.id] = l.name; });
    document.getElementById("tpLevel").innerHTML = levelsFor(name, state.level).map(function (id) { return '<option value="' + esc(id) + '"' + (id === state.level ? " selected" : "") + ">" + esc(names[id] || id) + "</option>"; }).join("");
    document.getElementById("tpOverlay").classList.add("show"); document.body.style.overflow = "hidden";
    paint();
  }

  window.LumioTeacherProgress = { open: open, close: close, collect: collect };
})();
