/* Lumio English — Bonus Class homework ("bonus mission"): bonus-homework.html?level=<level>&b=<N>[&preview=1].
   Reads bonus-classes/<level>/bonusNN.json -> homeworkMissions. A mission board instead of the lesson homework's
   step list: the child opens missions in any order, each one stamps the board when finished, and all of them
   together earn the class badge. Mission types: listen-choose, build, sort, true-false, record, mission.
   Auto-marked missions give the score; record + mission (real-world task) must be finished to submit. */
(function () {
  "use strict";
  var qs = function (k) { return new URLSearchParams(location.search).get(k); };
  var L = window.Lumio || {};
  var teacherDevice = (function () { try { return localStorage.getItem("lumio_teacher") === "1"; } catch (e) { return false; } })();
  var user = L.user ? L.user() : null;
  if (!user && !teacherDevice) { location.replace("login.html"); return; }
  var level = qs("level") || (user && user.level) || "level1";
  var B = parseInt(qs("b") || "1", 10) || 1;
  var preview = teacherDevice && (qs("preview") === "1" || !user);
  var TEEN = /^level[3-6]$/.test(level);
  if (TEEN) document.body.classList.add("bm-teen");
  if (preview) document.getElementById("bmPreview").hidden = false;
  if (teacherDevice) { var bk = document.getElementById("bmBack"); bk.textContent = "Close"; bk.href = "teacher.html"; }

  var app = document.getElementById("bmApp");
  var data = null, cls = null, state = [];
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  function say(t) {
    t = String(t || "");
    try {
      if (/^\/.+\/$/.test(t) && L.speakPhonicsSound) L.speakPhonicsSound(t.slice(1, -1));
      else if (L.speak) L.speak(t);
    } catch (e) {}
  }
  function ding(ok) { try { if (L.beep) L.beep(!!ok); } catch (e) {} }
  var ICON = { "listen-choose": "👂", build: "🧱", sort: "🗂️", "true-false": "🔬", record: "🎙️", mission: "🏠" };
  var CHAR = TEEN ? "assets/story/characters/lumi-teen-explain.png" : "assets/story/characters/lumi-magnify.png";

  // Saved like lesson homework, under the Bonus Class's number in the level's order (Bonus 1 = 4.5 ...).
  var BONUS_KEY = L.bonusLesson ? L.bonusLesson(B) : [4, 8, 12, 16][B - 1] + 0.5;
  // Gate (students only): own level, and the Bonus Class attended -- same rule as lesson homework.
  if (!preview && user) {
    if (user.level && user.level !== level) { gateMsg("This bonus mission is for another level.", "Open your own dashboard to see your next class."); return; }
    var att = (window.LumioSchedule && LumioSchedule.attendedLessonNumbers) ? LumioSchedule.attendedLessonNumbers(user.name, level) : null;
    if (!att || !att.has(BONUS_KEY)) { gateMsg("Not quite yet!", "Your bonus mission opens after your Bonus Class " + B + " with your teacher."); return; }
  }
  function gateMsg(t, sub) { app.innerHTML = '<section class="bm-finish"><div class="bm-badge">🔒</div><h2>' + esc(t) + '</h2><p>' + esc(sub) + '</p><a class="bm-btn" href="student.html">My dashboard</a></section>'; }
  fetch("bonus-classes/" + level + "/bonus" + String(B).padStart(2, "0") + ".json")
    .then(function (r) { if (!r.ok) throw new Error("missing"); return r.json(); })
    .then(function (d) {
      cls = d; data = d.homeworkMissions;
      if (!data || !data.missions || !data.missions.length) throw new Error("no missions");
      state = data.missions.map(function () { return { done: false, correct: 0, total: 0 }; });
      board();
    })
    .catch(function () { app.innerHTML = '<div class="bm-card"><h2>This mission is not ready yet.</h2><p>Ask your teacher.</p></div>'; });

  /* ---------------- the board ---------------- */
  function board() {
    var done = state.filter(function (s) { return s.done; }).length, n = state.length;
    var pct = Math.round(done / n * 100);
    app.innerHTML =
      '<section class="bm-hero">' +
        '<div class="bm-hero-txt"><span class="bm-kicker">' + esc(cls.label) + ' · ' + esc(data.theme) + '</span>' +
        '<h1>' + esc(cls.title) + '</h1><p>' + esc(data.intro) + '</p><p class="ar" dir="rtl">' + esc(data.introAr) + '</p></div>' +
        '<div class="bm-ring" style="--p:' + pct + '"><b>' + done + '/' + n + '</b><small>missions</small></div>' +
        '<img class="bm-buddy" src="' + CHAR + '" alt="">' +
      '</section>' +
      '<div class="bm-grid">' + data.missions.map(function (m, i) {
        var s = state[i];
        return '<button type="button" class="bm-tile' + (s.done ? " done" : "") + '" data-i="' + i + '">' +
          '<span class="bm-num">' + (i + 1) + '</span><span class="bm-ico">' + (ICON[m.type] || "⭐") + '</span>' +
          '<b>' + esc(m.title) + '</b><span class="ar" dir="rtl">' + esc(m.titleAr) + '</span>' +
          '<span class="bm-state">' + (s.done ? (s.total ? "✓ " + s.correct + "/" + s.total : "✓ Done") : "Start") + '</span>' +
          (s.done ? '<span class="bm-stamp">★</span>' : "") + '</button>';
      }).join("") + '</div>' +
      (done === n ? finishCard() : '<p class="bm-tip">Do the missions in any order. Every mission you finish gets a star stamp.</p>');
    app.querySelectorAll(".bm-tile").forEach(function (b) { b.addEventListener("click", function () { open(+b.dataset.i); }); });
    var sb = document.getElementById("bmSubmit"); if (sb) sb.addEventListener("click", submit);
  }

  function score() {
    var c = 0, t = 0; state.forEach(function (s) { c += s.correct; t += s.total; });
    return { c: c, t: t, pct: t ? Math.round(c / t * 100) : 100 };
  }
  function stars(pct) { return pct >= 90 ? 3 : pct >= 60 ? 2 : 1; }
  function finishCard() {
    var sc = score(), st = stars(sc.pct);
    return '<section class="bm-finish"><div class="bm-badge">🏅</div><h2>' + esc(data.badge) + '!</h2>' +
      '<p class="ar" dir="rtl">' + esc(data.badgeAr) + '</p>' +
      '<div class="bm-stars">' + "★★★".slice(0, st) + '<span>' + "★★★".slice(st) + '</span></div>' +
      '<p>' + sc.c + ' of ' + sc.t + ' answers right on the first try (' + sc.pct + '%).</p>' +
      '<button type="button" class="bm-btn" id="bmSubmit">' + (preview ? "Finish (preview)" : "Send to my teacher") + '</button></section>';
  }

  function submit() {
    var sc = score(), st = stars(sc.pct);
    var rec = state.map(function (s, i) { return { type: data.missions[i].type, correct: s.correct, total: s.total, extra: s.extra || null }; });
    if (!preview && L.saveHomework) {
      L.saveHomework(user.name, level, BONUS_KEY, {
        stars: st, score: sc.c, total: sc.t, bonus: B, missions: rec, date: new Date().toISOString().slice(0, 10)
      });
    }
    try { if (L.confetti) L.confetti(sc.pct); } catch (e) {}
    app.querySelector(".bm-finish").innerHTML = '<div class="bm-badge">🎉</div><h2>' + (preview ? "Preview finished" : "Sent! Great work, " + esc(user.name.split(" ")[0]) + "!") + '</h2>' +
      '<p>' + "★".repeat(st) + ' · ' + sc.pct + '%</p><a class="bm-btn" href="' + (teacherDevice ? "teacher.html" : "student.html") + '">Back</a>';
  }

  /* ---------------- one mission ---------------- */
  function open(i) {
    var m = data.missions[i];
    app.innerHTML = '<section class="bm-mission"><button type="button" class="bm-back">← All missions</button>' +
      '<div class="bm-mhead"><span class="bm-ico">' + (ICON[m.type] || "⭐") + '</span><div><h2>' + esc(m.title) + '</h2>' +
      '<p>' + esc(m.intro) + '</p><p class="ar" dir="rtl">' + esc(m.introAr) + '</p></div></div>' +
      '<div class="bm-body" id="bmBody"></div></section>';
    app.querySelector(".bm-back").addEventListener("click", board);
    scrollTo(0, 0);
    var body = document.getElementById("bmBody");
    var finish = function (correct, total, extra) {
      state[i] = { done: true, correct: correct, total: total, extra: extra };
      body.insertAdjacentHTML("beforeend", '<div class="bm-done"><b>Mission complete! ★</b>' +
        (total ? '<span>' + correct + ' / ' + total + ' right first time</span>' : "") +
        '<button type="button" class="bm-btn">Back to the board</button></div>');
      body.querySelector(".bm-done .bm-btn").addEventListener("click", board);
      try { if (L.confetti) L.confetti(total ? Math.round(correct / total * 100) : 100); } catch (e) {}
    };
    (RUN[m.type] || RUN.mission)(m, body, finish);
  }

  // A round-by-round runner: render(round, answer) shows one round; first-try answers count.
  function rounds(body, list, render, finish) {
    var k = 0, right = 0;
    function next() {
      if (k >= list.length) return finish(right, list.length);
      var firstTry = true;
      body.innerHTML = '<div class="bm-count">' + (k + 1) + ' / ' + list.length + '</div><div class="bm-round"></div>';
      render(list[k], body.querySelector(".bm-round"), function (ok, btn) {
        ding(ok);
        if (ok) {
          if (firstTry) right++;
          if (btn) btn.classList.add("ok");
          k++; setTimeout(next, 750);
        } else {
          firstTry = false;
          if (btn) { btn.classList.add("no"); btn.disabled = true; }
        }
      });
    }
    next();
  }

  var RUN = {
    "listen-choose": function (m, body, finish) {
      rounds(body, m.rounds, function (r, el, answer) {
        el.innerHTML = '<button type="button" class="bm-say big" aria-label="Listen">🔊</button>' +
          '<div class="bm-opts">' + r.options.map(function (o) {
            return '<button type="button" class="bm-opt" data-o="' + esc(o) + '"><b>' + esc(o) + '</b>' +
              (m.labels && m.labels[o] ? '<small>' + esc(m.labels[o]) + '</small>' : "") + '</button>';
          }).join("") + '</div>';
        el.querySelector(".bm-say").addEventListener("click", function () { say(r.say); });
        el.querySelectorAll(".bm-opt").forEach(function (b) { b.addEventListener("click", function () { answer(b.dataset.o === r.answer, b); }); });
        setTimeout(function () { say(r.say); }, 350);
      }, finish);
    },
    build: function (m, body, finish) {
      rounds(body, m.rounds, function (r, el, answer) {
        var parts = r.frame.split("_");
        el.innerHTML = '<button type="button" class="bm-say big" aria-label="Listen">🔊</button>' +
          '<div class="bm-frame"><span>' + esc(parts[0]) + '</span><span class="gap">?</span><span>' + esc(parts[1]) + '</span></div>' +
          '<div class="bm-opts">' + m.options.map(function (o) { return '<button type="button" class="bm-opt" data-o="' + esc(o) + '"><b>' + esc(o) + '</b></button>'; }).join("") + '</div>';
        el.querySelector(".bm-say").addEventListener("click", function () { say(r.say); });
        el.querySelectorAll(".bm-opt").forEach(function (b) {
          b.addEventListener("click", function () {
            var ok = b.dataset.o === r.answer;
            if (ok) { el.querySelector(".gap").textContent = r.answer; el.querySelector(".gap").classList.add("ok"); say(r.say); }
            answer(ok, b);
          });
        });
        setTimeout(function () { say(r.say); }, 350);
      }, finish);
    },
    sort: function (m, body, finish) {
      var left = m.items.length, right = 0, sel = null, missed = {};
      body.innerHTML = '<div class="bm-bins">' + m.boxes.map(function (b, j) { return '<button type="button" class="bm-bin" data-b="' + j + '"><b>' + esc(b) + '</b><div class="in"></div></button>'; }).join("") + '</div>' +
        '<div class="bm-chips">' + m.items.map(function (it, j) { return '<button type="button" class="bm-chip" data-j="' + j + '">' + esc(it.text) + '</button>'; }).join("") + '</div>' +
        '<p class="bm-tip">Tap a sound, then tap its box.</p>';
      body.querySelectorAll(".bm-chip").forEach(function (c) {
        c.addEventListener("click", function () {
          body.querySelectorAll(".bm-chip").forEach(function (x) { x.classList.remove("sel"); });
          c.classList.add("sel"); sel = +c.dataset.j; say(m.items[sel].say || m.items[sel].text);
        });
      });
      body.querySelectorAll(".bm-bin").forEach(function (bn) {
        bn.addEventListener("click", function () {
          if (sel == null) return;
          var it = m.items[sel], chip = body.querySelector('.bm-chip[data-j="' + sel + '"]');
          if (+bn.dataset.b === it.box) {
            ding(true); if (!missed[sel]) right++;
            bn.querySelector(".in").insertAdjacentHTML("beforeend", "<span>" + esc(it.text) + "</span>");
            chip.remove(); sel = null; left--;
            if (!left) finish(right, m.items.length);
          } else { ding(false); missed[sel] = true; bn.classList.add("shake"); setTimeout(function () { bn.classList.remove("shake"); }, 400); }
        });
      });
    },
    "true-false": function (m, body, finish) {
      rounds(body, m.items, function (r, el, answer) {
        el.innerHTML = '<p class="bm-q">' + esc(r.q) + '</p>' + (r.qAr ? '<p class="ar bm-qar" dir="rtl">' + esc(r.qAr) + '</p>' : "") +
          '<div class="bm-opts two"><button type="button" class="bm-opt tf" data-v="1"><b>True</b><small>صح</small></button>' +
          '<button type="button" class="bm-opt tf" data-v="0"><b>False</b><small>خطأ</small></button></div><p class="bm-why" hidden></p>';
        el.querySelectorAll(".bm-opt").forEach(function (b) {
          b.addEventListener("click", function () {
            var ok = (b.dataset.v === "1") === !!r.a;
            if (r.why) { var w = el.querySelector(".bm-why"); w.textContent = r.why; w.hidden = false; }
            if (ok && r.why) { setTimeout(function () { answer(true, b); }, 900); } else answer(ok, b);
          });
        });
      }, finish);
    },
    record: function (m, body, finish) {
      var mic = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
      var done = m.lines.map(function () { return false; });
      var rec = null, chunks = [], stream = null, active = -1;
      body.innerHTML = m.lines.map(function (l, j) {
        return '<div class="bm-line" data-j="' + j + '"><button type="button" class="bm-say" aria-label="Listen">🔊</button><b>' + esc(l) + '</b>' +
          (mic ? '<button type="button" class="bm-rec">🎙️ Record</button><audio controls hidden></audio>'
               : '<label class="bm-check"><input type="checkbox"> I said it aloud</label>') + '</div>';
      }).join("") + '<button type="button" class="bm-btn" id="bmRecDone" disabled>I finished</button>';
      var doneBtn = body.querySelector("#bmRecDone");
      function update() { doneBtn.disabled = !done.every(Boolean); }
      body.querySelectorAll(".bm-line").forEach(function (row) {
        var j = +row.dataset.j;
        row.querySelector(".bm-say").addEventListener("click", function () { say(m.lines[j]); });
        var cb = row.querySelector("input[type=checkbox]");
        if (cb) cb.addEventListener("change", function () { done[j] = cb.checked; update(); });
        var rb = row.querySelector(".bm-rec");
        if (rb) rb.addEventListener("click", function () {
          if (active === j && rec && rec.state === "recording") { rec.stop(); return; }
          if (rec && rec.state === "recording") return;
          navigator.mediaDevices.getUserMedia({ audio: true }).then(function (s) {
            stream = s; chunks = []; active = j; rec = new MediaRecorder(s);
            rec.ondataavailable = function (e) { chunks.push(e.data); };
            rec.onstop = function () {
              var a = row.querySelector("audio"); a.src = URL.createObjectURL(new Blob(chunks)); a.hidden = false;
              rb.textContent = "✓ Recorded · redo"; rb.classList.add("ok"); done[j] = true; active = -1;
              stream.getTracks().forEach(function (t) { t.stop(); }); update();
            };
            rec.start(); rb.textContent = "⏹ Stop";
          }).catch(function () {
            row.insertAdjacentHTML("beforeend", '<label class="bm-check"><input type="checkbox"> I said it aloud</label>');
            rb.remove();
            var c2 = row.querySelector("input[type=checkbox]");
            c2.addEventListener("change", function () { done[j] = c2.checked; update(); });
          });
        });
      });
      doneBtn.addEventListener("click", function () { doneBtn.remove(); finish(0, 0, { lines: m.lines.length }); });
    },
    mission: function (m, body, finish) {
      var n = m.findCount || 0;
      body.innerHTML = '<ol class="bm-steps">' + m.steps.map(function (s, j) {
        return '<li><label><input type="checkbox" data-j="' + j + '"><span>' + esc(s.en) + '<span class="ar" dir="rtl">' + esc(s.ar) + '</span></span></label></li>';
      }).join("") + '</ol>' +
        (m.ask ? '<label class="bm-field">' + esc(m.ask) + ' <span class="ar" dir="rtl">' + esc(m.askAr) + '</span><input type="text" id="bmWho" maxlength="40" placeholder="Mom, Dad, my brother..."></label>' : "") +
        (n ? '<div class="bm-field">' + esc(m.findLabel) + ' <span class="ar" dir="rtl">' + esc(m.findLabelAr) + '</span><div class="bm-finds">' +
          Array.from({ length: n }, function (_, j) { return '<input type="text" maxlength="20" class="bm-find" aria-label="Thing ' + (j + 1) + '">'; }).join("") + '</div></div>' : "") +
        '<button type="button" class="bm-btn" id="bmMissionDone" disabled>Mission done!</button>';
      var btn = body.querySelector("#bmMissionDone");
      function check() {
        var all = Array.prototype.every.call(body.querySelectorAll(".bm-steps input"), function (c) { return c.checked; });
        var who = !m.ask || (body.querySelector("#bmWho").value.trim().length > 1);
        var finds = Array.prototype.filter.call(body.querySelectorAll(".bm-find"), function (f) { return f.value.trim(); }).length >= n;
        btn.disabled = !(all && who && finds);
      }
      body.addEventListener("input", check); body.addEventListener("change", check);
      btn.addEventListener("click", function () {
        var extra = { who: m.ask ? body.querySelector("#bmWho").value.trim() : "", found: Array.prototype.map.call(body.querySelectorAll(".bm-find"), function (f) { return f.value.trim(); }) };
        btn.remove(); finish(0, 0, extra);
      });
    }
  };
})();
