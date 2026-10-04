#!/usr/bin/env python3
"""Builds the bilingual student/parent how-to guides (poster PNG + vertical
MP4, same look as the install guides) from REAL screenshots of the site:

    1 lesson-prep      2 book-a-class     3 fixed-schedule
    4 cancel-a-class   5 homework         6 bonus-game
    0 onboarding       (start here — parent + student, links all the others)

Run from the repo root:   python3.12 _docs/guides/build_student_guides.py [keys...] [--no-capture]

A local http.server serves the site; a demo teacher, demo students, fixed
slots and lesson progress are seeded through the app's own APIs, then each
flow is clicked through at phone size (390x757 @2x) and the control to tap is
ringed in orange with a pointing hand. Outputs: _docs/guides/lumio-guide-<key>.
(png|mp4|src.html), plus web copies in assets/guides/ for guides.html.
Re-run after any change to the student dashboard, booking, lesson or
homework pages.
"""
import base64, json, os, subprocess, sys, time
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import build_install_guides as B  # shared CSS, page shell, step layout

ROOT = B.ROOT
OUT = B.OUT
WEB = ROOT / "assets/guides"
TMP = Path(os.environ.get("LUMIO_TMP", "/tmp/lumio-guides")) / "student"; TMP.mkdir(parents=True, exist_ok=True)
SITE = B.SITE
VW, VH = 390, 757   # phone screen aspect of the poster's phone frame (276 x 536)

# ------------------------------------------------------------------ capture
HL_JS = r"""(arg) => {
  const [sel, idx] = Array.isArray(arg) ? arg : [arg, 0];
  document.querySelectorAll('.lgh').forEach(e => e.classList.remove('lgh'));
  document.querySelectorAll('#lgh-tap').forEach(e => e.remove());
  if (!document.getElementById('lgh-style')) {
    const st = document.createElement('style'); st.id = 'lgh-style';
    st.textContent = `.lgh{outline:5px solid #F97316 !important;outline-offset:4px !important;box-shadow:0 0 0 13px rgba(249,115,22,.30) !important;border-radius:14px;position:relative;z-index:60}
      #lgh-tap{position:fixed;z-index:99999;font-size:44px;line-height:1;pointer-events:none;filter:drop-shadow(0 4px 6px rgba(0,0,0,.35))}`;
    document.head.appendChild(st);
  }
  if (!sel) return true;
  const el = document.querySelectorAll(sel)[idx || 0];
  if (!el) return false;
  // the site scrolls smoothly; screenshots need the final position now
  document.documentElement.style.setProperty('scroll-behavior', 'auto', 'important');
  document.body.style.setProperty('scroll-behavior', 'auto', 'important');
  el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });
  el.classList.add('lgh');
  const r = el.getBoundingClientRect();
  const t = document.createElement('div'); t.id = 'lgh-tap';
  const below = r.bottom + 54 < innerHeight;
  t.textContent = below ? '\u{1F446}' : '\u{1F447}';
  t.style.left = Math.min(innerWidth - 50, Math.max(4, r.left + r.width * 0.62 - 22)) + 'px';
  t.style.top = (below ? r.bottom + 2 : Math.max(4, r.top - 50)) + 'px';
  document.body.appendChild(t);
  return true;
}"""

ACTS_OVERRIDE = """
;try{ const __o = JSON.parse(localStorage.getItem('__guide_acts') || 'null');
  if (__o && window.LUMIO_LESSONS) Object.keys(LUMIO_LESSONS).forEach(l => Object.keys(LUMIO_LESSONS[l]).forEach(n => { LUMIO_LESSONS[l][n].activities = __o; })); }catch(e){}
"""


def capture():
    from playwright.sync_api import sync_playwright
    srv = subprocess.Popen([sys.executable, "-m", "http.server", "8799"], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1.5)
    BASE = "http://localhost:8799"
    H = {"Access-Control-Allow-Origin": "*"}

    def backend(route, req):
        url = req.url
        ok = "action=bookSlot" in url or "action=cancelSlot" in url
        route.fulfill(status=200, content_type="application/json", headers=H, body=json.dumps({"ok": True}) if ok else '{"ok":false}')

    def lessons_data(route, req):
        resp = route.fetch()
        route.fulfill(response=resp, body=resp.text() + ACTS_OVERRIDE)

    try:
        with sync_playwright() as p:
            b = p.chromium.launch(executable_path="/opt/pw-browsers/chromium")
            ctx = b.new_context(service_workers="block", viewport={"width": VW, "height": VH}, device_scale_factor=2)
            pg = ctx.new_page()
            errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
            pg.route("**/script.google.com/**", backend)
            pg.route("**/js/lessons-data.js*", lessons_data)

            def go(path, wait=1300):
                pg.goto(f"{BASE}/{path}"); pg.wait_for_timeout(wait)
                pg.evaluate("document.getElementById('pinError') && (document.getElementById('pinError').style.display='none')")

            def snap(name, sel=None, idx=0, wait=350):
                if sel is not None:
                    found = pg.evaluate(HL_JS, [sel, idx])
                    if not found: print(f"  ! {name}: {sel} not found")
                pg.wait_for_timeout(wait)
                pg.screenshot(path=str(TMP / f"{name}.png"))
                pg.evaluate(HL_JS, [None, 0])

            def as_student(sid, name, level, tour=False):
                pg.evaluate(f"""() => {{ localStorage.setItem('lumio_user', JSON.stringify({{name:'{name}',level:'{level}',t:Date.now()}}));
                    localStorage.setItem('lumio_student_id','{sid}');
                    {'' if tour else f"localStorage.setItem('lumio_parent_guide_seen_v1_{sid}','1');"}
                    localStorage.removeItem('__guide_acts'); }}""")

            def acts(lst):
                pg.evaluate(f"localStorage.setItem('__guide_acts', {json.dumps(json.dumps(lst))})")

            # ---------------- seed ----------------
            go("login.html")
            ids = pg.evaluate("""async () => {
              await new Promise(r => { const s = document.createElement('script'); s.src = 'js/lumio-schedule.js'; s.onload = r; document.head.appendChild(s); });
              const L = LumioSchedule, P = LumioProfiles;
              const sara = await P.addTeacher({name:'Ms. Sara', avatar:'🌸', pin:'1111', isOwner:true, meetingLink:'https://teams.microsoft.com/l/meetup-join/lumio-demo'});
              const omar = await P.addTeacher({name:'Mr. Omar', avatar:'🧑‍🏫', pin:'2222', meetingLink:'https://teams.microsoft.com/l/meetup-join/lumio-demo2'});
              L.setWeeklyAvailability({teacherId:sara.id, teacherName:sara.name, startTimes:['14:00','15:00','16:00','17:00'], durationMinutes:60});
              L.setWeeklyAvailability({teacherId:omar.id, teacherName:omar.name, startTimes:['16:00','18:00','19:00','12:00'], durationMinutes:60});
              // a few past ratings so the teacher cards show stars
              const rana = await P.addStudent({name:'Rana', level:'level2', pin:'1', phone:'966500000009', approved:true, subscribed:true, sessionsRemaining:5});
              for (const [tid, tn, st] of [[sara.id, sara.name, 5], [sara.id, sara.name, 5], [sara.id, sara.name, 4], [omar.id, omar.name, 5]]) {
                const c = L.addClass({students:[{studentName:'Rana'}], teacherId:tid, teacherName:tn, date:'2099-01-01', startTime:'12:00', level:'level2', lessonNumber:1});
                L.rateTeacher(c.id, 'Rana', st);
              }
              const mk = (name, extra) => P.addStudent(Object.assign({name, level:'level1', pin:'1234', phone:'9665012345' + name.length, approved:true, subscribed:true, sessionsRemaining:12, currency:'SAR', country:'SA'}, extra || {}));
              const yousef = await mk('Yousef'), lina = await mk('Lina'), sami = await mk('Sami');
              return {yousef: yousef.id, code: yousef.loginCode, lina: lina.id, sami: sami.id};
            }""")

            (TMP / "demo_id.txt").write_text(str(ids["code"]))
            # ---------------- onboarding: login ----------------
            go("login.html")
            pg.fill("#loginIdentifier", ids["code"])
            snap("ob_login_id", "#loginIdentifier")
            for d in "12":
                pg.evaluate(f"Array.from(document.querySelectorAll('#pinPad button')).find(x => x.textContent.trim() === '{d}').click()")
                pg.wait_for_timeout(120)
            snap("ob_login_pin", "#pinPad")

            # ---------------- onboarding: first open (parent tour) ----------------
            as_student(ids["yousef"], "Yousef", "level1", tour=True)
            go("student.html", 1800)
            snap("ob_tour")
            as_student(ids["yousef"], "Yousef", "level1")
            go("student.html")
            snap("ob_dash", ".sd-hero-card")
            snap("ob_trail", "#scheduleTrail")
            snap("ob_profile_btn", "#myProfileBtn")
            pg.click("#myProfileBtn"); pg.wait_for_timeout(700)
            snap("ob_profile")
            go("student.html")
            snap("ob_messages", "#messagesBtn")

            # ---------------- 1 lesson prep (Yousef, lesson 1) ----------------
            snap("prep_1", "#missionBtn")
            go("lesson.html?level=level1&n=1")
            snap("prep_2", ".btn-sun")
            acts([{"type": "listen-choose", "rounds": 3}]); go("lesson.html?level=level1&n=1")
            pg.click("#nx") if pg.locator("#nx").is_visible() else None
            for _ in range(8):
                if pg.locator(".btn-opt").count(): break
                if pg.locator("#nx").count() and pg.locator("#nx").is_visible(): pg.click("#nx"); pg.wait_for_timeout(200)
            target = pg.evaluate("(() => { const b = document.querySelector('#stage .btn-sun, .btn-sun'); const m = b && (b.getAttribute('onclick') || '').match(/speak\\('([^']+)'/); return m ? m[1] : ''; })()")
            idx = pg.evaluate(f"Array.from(document.querySelectorAll('.btn-opt')).findIndex(b => b.dataset.en === {json.dumps(target)})")
            snap("prep_3", ".btn-opt", max(0, idx))
            acts([{"type": "match", "rounds": 4}]); go("lesson.html?level=level1&n=1")
            for _ in range(8):
                if pg.locator(".tile").count(): break
                if pg.locator("#nx").count() and pg.locator("#nx").is_visible(): pg.click("#nx"); pg.wait_for_timeout(200)
            snap("prep_4", ".tile")
            acts([{"type": "vocab"}]); go("lesson.html?level=level1&n=1")
            for _ in range(12):
                if pg.locator("text=Lesson complete!").count(): break
                if pg.locator("#nx").count() and pg.locator("#nx").is_visible(): pg.click("#nx"); pg.wait_for_timeout(250)
            pg.wait_for_timeout(600)
            pg.evaluate("document.querySelectorAll('p').forEach(x => { if (/^Score: /.test(x.textContent)) x.textContent = 'Score: 17/18 (94%)'; })")
            snap("prep_5", ".stars")
            as_student(ids["yousef"], "Yousef", "level1"); go("student.html")
            snap("prep_6", "#missionBtn")

            # ---------------- 2 book a class (Yousef) ----------------
            snap("book_1", '.sd-book-tabs [data-mode="one"]')
            snap("book_2", ".sd-day.active")
            snap("book_3", ".sd-hour.open")
            pg.evaluate("document.querySelector('.sd-hour.open').click()"); pg.wait_for_timeout(300)
            snap("book_4", ".sd-teacher .sd-book-btn")
            pg.evaluate("document.querySelector('.sd-teacher .sd-book-btn').click()"); pg.wait_for_timeout(400)
            snap("book_5", "#bookYes")
            pg.click("#bookYes"); pg.wait_for_timeout(2200)
            snap("book_6", "#scheduleNext")
            snap("ob_join", "#scheduleNext .sd-join-link")

            # ---------------- 4 cancel (Yousef: lesson 2 booked too) ----------------
            pg.evaluate("""() => { const L = LumioSchedule; const st = L.studentBookingState('Yousef','level1');
              const sl = L.openSlots({studentName:'Yousef', level:'level1', lesson:st.nextLesson}).filter(s => s.teacherName === 'Ms. Sara');
              L.bookStudentIntoSlot({studentName:'Yousef', level:'level1', lesson:st.nextLesson, patternId:sl[1].patternId, date:sl[1].date}); }""")
            go("student.html")
            snap("cancel_1", ".sd-class-row [data-cancel]")
            pg.evaluate("document.querySelector('.sd-class-row [data-cancel]').click()"); pg.wait_for_timeout(400)
            snap("cancel_2", "#bookYes")
            pg.click("#bookYes"); pg.wait_for_timeout(2500)
            go("student.html")
            snap("cancel_3", "#bookingCard .sd-book-title")

            # ---------------- 3 fixed weekly (Lina) ----------------
            as_student(ids["lina"], "Lina", "level1"); go("student.html")
            snap("fixed_1", '[data-mode="fixed"]')
            pg.click('[data-mode="fixed"]'); pg.wait_for_timeout(300)
            snap("fixed_2", '[data-fxday="1"]')
            pg.click('[data-fxday="1"]'); pg.wait_for_timeout(300)
            snap("fixed_3", '.sd-hour.open[data-fxhour="16"]')
            pg.click('.sd-hour.open[data-fxhour="16"]'); pg.wait_for_timeout(300)
            snap("fixed_4", "[data-fxadd]")
            pg.locator("[data-fxadd]").first.click(); pg.wait_for_timeout(300)
            pg.click('[data-fxday="3"]'); pg.wait_for_timeout(250)
            pg.click('.sd-hour.open[data-fxhour="16"]'); pg.wait_for_timeout(250)
            pg.locator("[data-fxadd]").nth(1).click(); pg.wait_for_timeout(300)
            snap("fixed_5", ".sd-picks")
            snap("fixed_6", "#fxBookBtn")
            pg.click("#fxBookBtn"); pg.wait_for_timeout(500)
            snap("fixed_7", "#bookYes")
            pg.click("#bookYes"); pg.wait_for_timeout(3500)
            snap("fixed_8", "#scheduleList")

            # ---------------- 5 homework (Sami: prep + class done, lesson 2 booked) ----------------
            as_student(ids["sami"], "Sami", "level1")
            pg.evaluate("""() => { Lumio.saveResult('Sami','level1',1,3,10,10);
              const L = LumioSchedule; const c = L.addClass({students:[{studentName:'Sami'}], teacherName:'Ms. Sara', date:'2099-01-02', startTime:'16:00', level:'level1', lessonNumber:1});
              L.markAttendance(c.id, {studentName:'Sami'}, 'present');
              const sl = L.openSlots({studentName:'Sami', level:'level1', lesson:2}).filter(s => s.teacherName === 'Ms. Sara');
              L.bookStudentIntoSlot({studentName:'Sami', level:'level1', lesson:2, patternId:sl[0].patternId, date:sl[0].date}); }""")
            go("student.html")
            snap("hw_1", "#missionBtn")
            snap("hw_gate", ".sd-gate")
            go("homework.html?level=level1&n=1", 1800)
            snap("hw_2", "#hwSteps")
            def hw_step(key):
                pg.evaluate(f"goToStep(STEPS.findIndex(s => s.key === '{key}'))"); pg.wait_for_timeout(500)
            hw_step("draw"); snap("hw_3", "#hwSections .hw-card")
            hw_step("sayit"); snap("hw_4", "#recBtn-0")
            hw_step("quiz")
            pg.evaluate("lesson.vocab.forEach((v, i) => { results.spelling[i] = true; results.quiz[i] = true; results.saidWords[i] = true; }); goToStep(STEPS.length - 1)"); pg.wait_for_timeout(500)
            snap("hw_5", 'button[onclick="submitHomework()"]')
            pg.evaluate("submitHomework()"); pg.wait_for_timeout(1200)
            snap("hw_6", "#hwSections .hw-card")
            go("student.html")
            snap("hw_7", "#scheduleNext .sd-join-link")

            # ---------------- 6 bonus game (Sami, lesson 1 homework done) ----------------
            snap("game_1", "#gameWidePlay")
            pg.click("#gameWidePlay"); pg.wait_for_timeout(500)
            snap("game_2", "#gameMapPath .node.done")
            acts([{"type": "vocab"}]); go("lesson.html?level=level1&n=1")
            for _ in range(12):
                if pg.locator("text=Lesson complete!").count(): break
                if pg.locator("#nx").count() and pg.locator("#nx").is_visible(): pg.click("#nx"); pg.wait_for_timeout(250)
            pg.wait_for_timeout(600)
            pg.evaluate("document.querySelectorAll('p').forEach(x => { if (/^Score: /.test(x.textContent)) x.textContent = 'Score: 17/18 (94%)'; })")
            snap("game_3", 'a[href*="games/"]')
            pg.evaluate("localStorage.removeItem('__guide_acts')")
            go("games/treehouse-builder.html?level=level1&n=1&from=lesson", 2600)
            snap("game_4")

            print("capture errors:", errs[:5])
            b.close()
    finally:
        srv.terminate()



# ------------------------------------------------------------------ posters
EXTRA_CSS = """
.step{grid-template-columns:360px 1fr}
.step .phone{width:360px;height:676px}
@media print{ .step,.gidx,.tip,header{break-inside:avoid} }
.gref{display:inline-block;background:#43301F;color:#FFC93C;border-radius:999px;padding:3px 12px;font-size:17px;font-weight:800;margin:6px 6px 0 0;font-family:'Nunito',sans-serif;direction:ltr}
.ar .gref{font-family:'Cairo',sans-serif}
.shot{width:100%;height:100%;object-fit:cover;object-position:top;display:block}
.cred{height:100%;background:#ECE5DD;display:flex;flex-direction:column}
.cred .bar{background:#075E54;color:#fff;padding:14px 14px 12px;display:flex;align-items:center;gap:10px;font-weight:800;font-size:15px}
.cred .bar img{width:34px;height:34px;border-radius:50%;background:#fff}
.cred .bub{background:#fff;margin:16px 12px 0;border-radius:4px 14px 14px 14px;padding:12px 14px;font-size:14px;line-height:1.55;color:#202124;box-shadow:0 1px 1px rgba(0,0,0,.1)}
.cred .bub .ar{direction:rtl;font-family:'Cairo',sans-serif;font-weight:700}
.cred .k{display:flex;justify-content:space-between;background:#FFF3D6;border-radius:8px;padding:6px 10px;margin-top:6px;font-weight:800;direction:ltr}
.cred .k b{color:#C2410C;letter-spacing:2px;font-size:17px}
.gidx{margin:34px 64px 0;background:#fff;border-radius:28px;padding:26px 30px;box-shadow:0 10px 30px rgba(67,48,31,.08)}
.gidx h3{font-family:'Baloo 2';font-size:30px;margin-bottom:4px}
.gidx h3 span{color:var(--or)}
.gidx .ar.h{font-size:24px;font-weight:900;color:#5A4030;margin-bottom:14px}
.gidx .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.gidx .g{display:flex;align-items:center;gap:14px;border:2px solid var(--line);border-radius:18px;padding:12px 16px}
.gidx .g .n{width:46px;height:46px;border-radius:50%;background:var(--or);color:#fff;font-family:'Baloo 2';font-weight:800;font-size:24px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.gidx .g .n.i{background:var(--teal);font-size:20px}
.gidx .g b{display:block;font-size:21px}
.gidx .g span{display:block;font-family:'Cairo',sans-serif;font-weight:700;font-size:19px;color:var(--soft);direction:rtl;text-align:left}
"""

def shot(name):
    return f'<div class="phone ios"><div class="screen"><img class="shot" src="SHOT:{name}"></div></div>'

def gref(n, en, ar=None):
    return f'<span class="gref">📘 Guide {n} · {en}</span>' if ar is None else f'<span class="gref">📘 دليل {n} · {ar}</span>'

GUIDE_TITLES = {1: ("Lesson prep", "تحضير الدرس"), 2: ("Book a class", "حجز حصة"), 3: ("Fixed weekly schedule", "الجدول الأسبوعي الثابت"),
                4: ("Cancel a class", "إلغاء حصة"), 5: ("Homework", "الواجب"), 6: ("Bonus game", "لعبة المكافأة")}
def G(n):   # (english chip, arabic chip)
    en, ar = GUIDE_TITLES[n]
    return gref(n, en), gref(n, en, ar)

S = B.step
def steps(*rows):
    return "".join(S(i + 1, *r) for i, r in enumerate(rows))

def credentials_art():
    demo_id = (TMP / "demo_id.txt").read_text().strip() if (TMP / "demo_id.txt").exists() else "497444"
    return ('<div class="phone ios"><div class="screen"><div class="cred"><div class="bar"><img src="ICON"><div>Lumio English<div style="font-size:11px;font-weight:600;opacity:.8">WhatsApp</div></div></div>'
            '<div class="bub"><div class="ar">أهلاً بكم في Lumio English 🎉<br>تم تفعيل اشتراك يوسف. بيانات الدخول:</div>'
            f'<div class="k">Student ID <b>{demo_id}</b></div><div class="k">PIN <b>••••</b></div>'
            f'<div style="margin-top:8px;font-size:12.5px;color:#075E54;font-weight:800">{SITE}</div></div></div></div></div>')

def install_art():
    return f'<div class="phone ios"><div class="screen">{B.home_icons("ios", labels=["Phone","Messages","Camera","Photos","WhatsApp","Lumio","YouTube","Maps","Clock","Settings","Calendar","Safari"])}</div></div>'

def guides_index():
    cards = "".join(f'<div class="g"><div class="n">{n}</div><div><b>{en}</b><span>{ar}</span></div></div>' for n, (en, ar) in GUIDE_TITLES.items())
    cards += ('<div class="g"><div class="n i">📱</div><div><b>Install on Android</b><span>التثبيت على أندرويد</span></div></div>'
              '<div class="g"><div class="n i">🍏</div><div><b>Install on iPhone / iPad</b><span>التثبيت على آيفون وآيباد</span></div></div>'
              '<div class="g"><div class="n i">💻</div><div><b>Install on a computer</b><span>التثبيت على الكمبيوتر</span></div></div>')
    return (f'<div class="gidx"><h3>All the <span>Lumio guides</span></h3><div class="ar h">كل أدلة Lumio — اطلبوها من المعلّم أو افتحوها من صفحة الأدلة</div>'
            f'<div class="grid">{cards}</div><div style="margin-top:12px;font-weight:800;color:var(--soft);font-size:19px">Every guide: <b style="color:var(--or)">{SITE}/guides.html</b></div></div>')

def guide_defs():
    g1, g1a = G(1); g2, g2a = G(2); g3, g3a = G(3); g4, g4a = G(4); g5, g5a = G(5); g6, g6a = G(6)
    D = {}
    D["guide-1-lesson-prep"] = dict(
        title='Lesson <span>prep</span>', sub_en="Guide 1 · before every live class · 10–15 minutes", sub_ar="الدليل ١ · قبل كل حصة مباشرة · ١٠–١٥ دقيقة",
        steps=steps(
            (shot("prep_1"), 'Open <span class="key">Today\'s mission</span> → ▶ Continue', "The orange card at the top always shows exactly what to do next — right now, the next lesson's prep.",
             'من <span class="key">مهمة اليوم</span> اضغطوا ▶ Continue', "البطاقة البرتقالية في الأعلى تعرض دائماً الخطوة التالية بالضبط — الآن: تحضير الدرس القادم."),
            (shot("prep_2"), 'Meet the new words: <span class="key">Listen</span> → say it → Next', "Every word has its picture, the Arabic meaning and an example sentence. Say each word out loud before tapping Next.",
             'تعرّفوا على الكلمات: <span class="key">Listen</span> ← ردّدوها ← Next', "لكل كلمة صورة ومعناها بالعربية وجملة مثال. ردّدوا الكلمة بصوت عالٍ قبل الضغط على Next."),
            (shot("prep_3"), 'Play the quick games', "Listen and tap the right picture, then quiz, complete-the-sentence and spelling rounds. A wrong answer is fine — Lumi says the word again.",
             'العبوا الألعاب القصيرة', "استمعوا واختاروا الصورة الصحيحة، ثم الاختبار وإكمال الجملة والتهجئة. لا بأس بالخطأ — Lumi يكرر الكلمة."),
            (shot("prep_4"), 'Match <span class="key">English ↔ Arabic</span>', "Tap a word, then its meaning. Correct pairs turn green.",
             'صِلوا <span class="key">الإنجليزية بالعربية</span>', "اضغطوا الكلمة ثم معناها. الأزواج الصحيحة تتحول للأخضر."),
            (shot("prep_5"), '<span class="key">Lesson complete!</span> Collect your stars', "Up to 3 stars (teen levels earn XP). Play again any time to beat your score.",
             '<span class="key">اكتمل الدرس!</span> اجمعوا النجوم', "حتى ٣ نجوم (مستويات المراهقين تجمع نقاط XP). يمكن الإعادة في أي وقت لتحسين النتيجة."),
            (shot("prep_6"), 'Prep done ✓ — next comes the live class', "The mission card now says “prep done”. Book the class, join it on Teams, then do the homework." + "<br>" + g2 + g5,
             'انتهى التحضير ✓ — التالي: الحصة المباشرة', "تتغير البطاقة إلى «prep done». احجزوا الحصة، ادخلوها على Teams، ثم حلّوا الواجب." + "<br>" + g2a + g5a),
        ),
        tip_en='💡 <span>Why prep first?</span> Students who meet the words before class understand the teacher faster and speak much more in the live lesson.',
        tip_ar='لماذا التحضير أولاً؟ الطالب الذي يتعرّف على الكلمات قبل الحصة يفهم المعلّم أسرع ويتكلم أكثر بكثير أثناء الدرس.')
    D["guide-2-book-a-class"] = dict(
        title='Book a <span>class</span>', sub_en="Guide 2 · one class at a time · Sunday–Thursday, Saudi time", sub_ar="الدليل ٢ · حصة واحدة في كل مرة · الأحد–الخميس بتوقيت السعودية",
        steps=steps(
            (shot("book_1"), 'My schedule → Book my next class → <span class="key">One class</span>', "Scroll down the dashboard. The lesson to book is shown — lessons are always booked in order.",
             'جدولي ← احجز حصتي القادمة ← <span class="key">حصة واحدة</span>', "انزلوا في الصفحة الرئيسية. يظهر رقم الدرس المطلوب حجزه — الدروس تُحجز دائماً بالترتيب."),
            (shot("book_2"), 'Pick a <span class="key">day</span>', "The whole week shows: Friday and Saturday are off, past days are grey, each day says how many times are open. ‹ › moves to the next weeks.",
             'اختاروا <span class="key">اليوم</span>', "يظهر الأسبوع كاملاً: الجمعة والسبت عطلة، الأيام الماضية رمادية، وكل يوم يوضح عدد المواعيد المتاحة. ‹ › للأسابيع القادمة."),
            (shot("book_3"), 'Pick a <span class="key">time</span>', "Working hours 12:00 PM – 8:00 PM Saudi time. Only open times can be tapped; the number shows how many teachers are free.",
             'اختاروا <span class="key">الوقت</span>', "ساعات العمل ١٢ ظهراً – ٨ مساءً بتوقيت السعودية. فقط الأوقات المتاحة قابلة للضغط، والرقم يوضح عدد المعلمين المتاحين."),
            (shot("book_4"), 'Pick your teacher → <span class="key">Book</span>', "See each teacher's photo and rating. “New class” means you're first; “Join” means classmates on the same lesson are already in (up to 4).",
             'اختاروا المعلّم ← <span class="key">Book</span>', "تظهر صورة كل معلّم وتقييمه. «New class» يعني أنكم أول من يحجز، و«Join» يعني أن زملاء في نفس الدرس حجزوا (حتى ٤)."),
            (shot("book_5"), 'Confirm: <span class="key">Yes, book it ✓</span>', "The day, time and teacher are shown once more before anything is booked.",
             'أكّدوا: <span class="key">Yes, book it ✓</span>', "يظهر اليوم والوقت والمعلّم مرة أخرى قبل تأكيد الحجز."),
            (shot("book_6"), 'Booked! The class waits in My schedule', "On the day, tap “Join on Teams” right here. Need a different time? Use Cancel." + "<br>" + g4,
             'تم الحجز! الحصة في «جدولي»', "في يوم الحصة اضغطوا «Join on Teams» من هنا. تحتاجون وقتاً آخر؟ استخدموا Cancel." + "<br>" + g4a),
        ),
        tip_en='📌 <span>Booking rules:</span> up to 3 classes a week · up to 4 classmates, all on the same lesson · each class uses one session from your package · cancel up to 30 minutes before.',
        tip_ar='قواعد الحجز: حتى ٣ حصص في الأسبوع · حتى ٤ زملاء في نفس الدرس · كل حصة تُخصم من رصيد الباقة · الإلغاء متاح حتى ٣٠ دقيقة قبل الموعد.')
    D["guide-3-fixed-schedule"] = dict(
        title='Fixed <span>weekly</span> schedule', sub_en="Guide 3 · the same days & times every week, booked lesson after lesson", sub_ar="الدليل ٣ · نفس الأيام والأوقات كل أسبوع، تُحجز درساً بعد درس",
        steps=steps(
            (shot("fixed_1"), 'In Book my next class tap <span class="key">🔁 Fixed weekly</span>', "Choose up to 3 weekly times once — we book your next lessons into them in order.",
             'من «احجز حصتي القادمة» اضغطوا <span class="key">🔁 Fixed weekly</span>', "اختاروا حتى ٣ مواعيد أسبوعية مرة واحدة — ونحجز دروسكم القادمة فيها بالترتيب."),
            (shot("fixed_2"), 'Pick a <span class="key">day</span> (Sunday–Thursday)', "This is “every Monday”, not one date.",
             'اختاروا <span class="key">اليوم</span> (الأحد–الخميس)', "المقصود «كل يوم اثنين» وليس تاريخاً واحداً."),
            (shot("fixed_3"), 'Pick a <span class="key">time</span>', "Only times a teacher offers every week are open.",
             'اختاروا <span class="key">الوقت</span>', "فقط الأوقات التي يقدّمها معلّم كل أسبوع تكون متاحة."),
            (shot("fixed_4"), 'Pick the teacher → <span class="key">Add</span>', "Photo, rating and the weekly time are shown on each card.",
             'اختاروا المعلّم ← <span class="key">Add</span>', "تظهر الصورة والتقييم والموعد الأسبوعي على كل بطاقة."),
            (shot("fixed_5"), 'Add up to <span class="key">3</span> weekly times', "Repeat for other days. Remove one with ✕.",
             'أضيفوا حتى <span class="key">٣</span> مواعيد أسبوعية', "كرروا لأيام أخرى. احذفوا أي موعد بـ ✕."),
            (shot("fixed_6"), 'Tap <span class="key">Preview &amp; book my weeks</span>', "Nothing is booked yet — you'll see the full list first.",
             'اضغطوا <span class="key">Preview &amp; book my weeks</span>', "لم يُحجز شيء بعد — ستظهر القائمة كاملة أولاً."),
            (shot("fixed_7"), 'Check the list → <span class="key">Yes, book them ✓</span>', "Every date with its lesson number. Anything that can't be booked says why (for example: no sessions left).",
             'راجعوا القائمة ← <span class="key">Yes, book them ✓</span>', "كل تاريخ مع رقم الدرس. وما لا يمكن حجزه يظهر سببه (مثلاً: انتهى رصيد الحصص)."),
            (shot("fixed_8"), 'Done — your next weeks are booked', "Each class keeps its own Cancel. When new weeks open, the card offers “Book them” in one tap." + "<br>" + g4,
             'تم — حُجزت أسابيعكم القادمة', "كل حصة لها زر إلغاء خاص بها. وعند فتح أسابيع جديدة تظهر «Book them» بضغطة واحدة." + "<br>" + g4a),
        ),
        tip_en='💡 <span>Same rules as single bookings:</span> next lesson in order · up to 4 classmates on the same lesson · max 3 a week · only your package\'s sessions.',
        tip_ar='نفس قواعد الحجز الفردي: الدرس التالي بالترتيب · حتى ٤ زملاء في نفس الدرس · ٣ حصص أسبوعياً كحد أقصى · ضمن رصيد الباقة فقط.')
    D["guide-4-cancel-a-class"] = dict(
        title='Cancel a <span>class</span>', sub_en="Guide 4 · up to 30 minutes before the class starts", sub_ar="الدليل ٤ · حتى ٣٠ دقيقة قبل بداية الحصة",
        steps=steps(
            (shot("cancel_1"), 'In My schedule tap <span class="key">Cancel</span> on the class', "Every booked class has its own Cancel button.",
             'من «جدولي» اضغطوا <span class="key">Cancel</span> على الحصة', "لكل حصة محجوزة زر إلغاء خاص بها."),
            (shot("cancel_2"), 'Confirm: <span class="key">Yes, cancel it</span>', "Lessons go in order — cancelling one also cancels the lessons booked after it, and the message says which.",
             'أكّدوا: <span class="key">Yes, cancel it</span>', "الدروس بالترتيب — إلغاء درس يلغي الدروس المحجوزة بعده، والرسالة توضح أيّها."),
            (shot("cancel_3"), 'Book a new time straight away', "The seat opens for others and the lesson is free to book again right below." + "<br>" + g2,
             'احجزوا موعداً جديداً مباشرة', "يُفتح المقعد للآخرين، ويمكن حجز الدرس من جديد في الأسفل مباشرة." + "<br>" + g2a),
        ),
        tip_en='⏰ <span>Less than 30 minutes left?</span> The Cancel button disappears — message your teacher on WhatsApp instead.',
        tip_ar='بقي أقل من ٣٠ دقيقة؟ يختفي زر الإلغاء — تواصلوا مع المعلّم على واتساب.')
    D["guide-5-homework"] = dict(
        title='Do the <span>homework</span>', sub_en="Guide 5 · after every live class · unlocks the next lesson", sub_ar="الدليل ٥ · بعد كل حصة مباشرة · يفتح الدرس التالي",
        steps=steps(
            (shot("hw_1"), 'After class: Today\'s mission → <span class="key">📝 Do homework</span>', "It opens as soon as the teacher marks the student present.",
             'بعد الحصة: مهمة اليوم ← <span class="key">📝 Do homework</span>', "يُفتح الواجب بمجرد أن يسجّل المعلّم حضور الطالب."),
            (shot("hw_2"), 'Follow the steps at the top', "Spelling → Draw (teens: Talk) → Say It → Phonics/Grammar → Quiz. A tick shows each finished step.",
             'اتبعوا الخطوات في الأعلى', "التهجئة ← الرسم (للمراهقين: المحادثة) ← النطق ← الأصوات/القواعد ← الاختبار. علامة ✓ تظهر عند إنهاء كل خطوة."),
            (shot("hw_3"), 'Draw it', "Younger levels draw the word with the colours; teen levels practise a short conversation instead.",
             'ارسموا الكلمة', "المستويات الصغيرة ترسم الكلمة بالألوان، ومستويات المراهقين تتدرب على محادثة قصيرة بدلاً من ذلك."),
            (shot("hw_4"), 'Say It — tap <span class="key">Record</span>', "Listen, say each word, record yourself. Parents: listen together and tick the box.",
             'النطق — اضغطوا <span class="key">Record</span>', "استمعوا، ردّدوا كل كلمة، وسجّلوا أصواتكم. أولياء الأمور: استمعوا مع الطفل وضعوا علامة ✓."),
            (shot("hw_5"), 'Finish the quiz → <span class="key">✓ Submit Homework</span>', "Spelling and the quiz must be tried before it can be sent.",
             'أكملوا الاختبار ← <span class="key">✓ Submit Homework</span>', "يجب تجربة التهجئة والاختبار قبل الإرسال."),
            (shot("hw_6"), '<span class="key">Homework complete!</span>', "Stars for the work, and the teacher sees the results.",
             '<span class="key">اكتمل الواجب!</span>', "نجوم على الإنجاز، والمعلّم يرى النتائج."),
            (shot("hw_gate"), 'Why it matters: the next class stays 🔒', "Until the homework is done, the next class shows “Finish the homework… before joining” instead of the Join button.",
             'لماذا هو مهم: الحصة التالية مقفلة 🔒', "حتى يُنجز الواجب، تظهر الحصة التالية برسالة «أكملوا الواجب قبل الدخول» بدلاً من زر الدخول."),
            (shot("hw_7"), 'Done ✓ — Join on Teams is back', "The next lesson's prep opens too, and so does this lesson's part of the bonus game." + "<br>" + g1 + g6,
             'تم ✓ — عاد زر الدخول إلى Teams', "ويُفتح تحضير الدرس التالي، وجزء هذا الدرس في لعبة المكافأة." + "<br>" + g1a + g6a),
        ),
        tip_en='📄 <span>Prefer paper too?</span> “Homework Sheet” and “Flashcards” on the dashboard download printable PDFs for every lesson.',
        tip_ar='تفضّلون الورق أيضاً؟ «Homework Sheet» و«Flashcards» في الصفحة الرئيسية تنزّل ملفات PDF قابلة للطباعة لكل درس.')
    D["guide-6-bonus-game"] = dict(
        title='The <span>bonus game</span>', sub_en="Guide 6 · each lesson's part unlocks after its homework", sub_ar="الدليل ٦ · جزء كل درس يُفتح بعد واجبه",
        steps=steps(
            (shot("game_1"), 'Mini-Game → <span class="key">▶ Play</span>', "Every level has its own game: Lumi's Pocket, Treehouse Builder, Twelve Months Calendar, Crew Chat, Squad Budget, Story Detective, Crystal Ball.",
             'Mini-Game ← <span class="key">▶ Play</span>', "لكل مستوى لعبته الخاصة: Lumi's Pocket وTreehouse Builder وTwelve Months Calendar وCrew Chat وSquad Budget وStory Detective وCrystal Ball."),
            (shot("game_2"), 'Pick an <span class="key">unlocked lesson</span>', "A lesson's part opens once its homework is done; the rest show 🔒.",
             'اختاروا <span class="key">درساً مفتوحاً</span>', "يُفتح جزء الدرس بعد إنهاء واجبه، والباقي يظهر عليه 🔒."),
            (shot("game_3"), 'Or play straight from <span class="key">Lesson complete</span>', "After prep, the game button appears here once that lesson's homework is done.",
             'أو العبوا مباشرة من <span class="key">Lesson complete</span>', "بعد التحضير يظهر زر اللعبة هنا عندما يكون واجب ذلك الدرس منجزاً."),
            (shot("game_4"), 'Play with the lesson\'s own words', "Listen and tap — every round uses the words from that lesson.",
             'العبوا بكلمات الدرس نفسه', "استمعوا واضغطوا — كل جولة تستخدم كلمات ذلك الدرس."),
        ),
        tip_en='🏆 <span>Points add up:</span> stars and points from lessons, homework and games fill “My rewards” — every 50 points = 1 free class hour.',
        tip_ar='النقاط تتجمّع: نجوم ونقاط الدروس والواجبات والألعاب تملأ «مكافآتي» — كل ٥٠ نقطة = ساعة حصة مجانية.')
    D["guide-0-start-here"] = dict(
        title='Welcome to <span>Lumio</span>!', sub_en="Start here · parents & students · from your ID & PIN to your first class", sub_ar="ابدأوا من هنا · لأولياء الأمور والطلاب · من رقم الطالب والرمز إلى أول حصة",
        steps=steps(
            (credentials_art(), 'You receive the <span class="key">Student ID</span> and <span class="key">PIN</span>', "We send them on WhatsApp as soon as the subscription is activated. Keep them safe — the ID never changes.",
             'تصلكم <span class="key">رقم الطالب</span> و<span class="key">الرمز السري</span>', "نرسلها على واتساب فور تفعيل الاشتراك. احتفظوا بها — رقم الطالب لا يتغير."),
            (install_art(), 'Open the site — or install it as an app', f"Go to <b>{SITE}</b> and tap Login. Installing it puts the Lumio icon on the phone, tablet or computer.<br><span class=\"gref\">📱 Install: Android · iPhone/iPad · PC</span>",
             'افتحوا الموقع — أو ثبّتوه كتطبيق', "ادخلوا إلى الرابط واضغطوا Login. التثبيت يضع أيقونة Lumio على الجوال أو التابلت أو الكمبيوتر.<br><span class=\"gref\">📱 أدلة التثبيت: أندرويد · آيفون/آيباد · كمبيوتر</span>"),
            (shot("ob_login_id"), 'Current Learner → type the <span class="key">Student ID</span>', "Use the ID from the message (the parent's phone number works too).",
             'Current Learner ← اكتبوا <span class="key">رقم الطالب</span>', "استخدموا الرقم المرسل في الرسالة (ويعمل رقم جوال ولي الأمر أيضاً)."),
            (shot("ob_login_pin"), 'Enter the 4-digit <span class="key">PIN</span>', "The account opens. This device stays logged in — no need to type it every time.",
             'أدخلوا <span class="key">الرمز السري</span> من ٤ أرقام', "يُفتح الحساب ويبقى الجهاز مسجّلاً — لا حاجة لإدخاله كل مرة."),
            (shot("ob_tour"), 'First visit: a short Arabic tour opens', "It walks parents through the real dashboard. Next to continue, Skip any time; reopen it from «دليل ولي الأمر».",
             'أول زيارة: تُفتح جولة تعريفية بالعربية', "تشرح لأولياء الأمور الصفحة الرئيسية الحقيقية. Next للمتابعة وSkip للتخطي، ويمكن فتحها لاحقاً من «دليل ولي الأمر»."),
            (shot("ob_dash"), 'Today\'s mission = what to do now', "Always start here. It moves on by itself: prep → book the class → homework → next lesson.",
             'مهمة اليوم = ما يجب فعله الآن', "ابدأوا من هنا دائماً. تنتقل تلقائياً: التحضير ← حجز الحصة ← الواجب ← الدرس التالي."),
            (shot("ob_trail"), 'Every lesson = <span class="key">Prep → Live class → Homework</span>', "The next lesson opens only when all three are done." + "<br>" + g1 + g5,
             'كل درس = <span class="key">تحضير ← حصة مباشرة ← واجب</span>', "لا يُفتح الدرس التالي إلا بعد إنجاز الثلاثة." + "<br>" + g1a + g5a),
            (shot("book_1"), 'Book your classes', "One class at a time, or a fixed weekly schedule that books lesson after lesson. Changed plans? Cancel up to 30 minutes before." + "<br>" + g2 + g3 + g4,
             'احجزوا حصصكم', "حصة واحدة في كل مرة، أو جدول أسبوعي ثابت يحجز درساً بعد درس. تغيّرت الخطط؟ ألغوا حتى ٣٠ دقيقة قبل الموعد." + "<br>" + g2a + g3a + g4a),
            (shot("ob_join"), 'On class day: <span class="key">Join on Teams</span>', "The class opens in Microsoft Teams (free; join as a guest with the student's name). Be ready 5 minutes early with headphones.",
             'يوم الحصة: <span class="key">Join on Teams</span>', "تُفتح الحصة في Microsoft Teams (مجاناً؛ الدخول كضيف باسم الطالب). كونوا جاهزين قبل ٥ دقائق مع سماعات."),
            (shot("game_1"), 'After homework: the fun part', "Bonus game, Lumi's story, songs and the English Hub — all on the dashboard." + "<br>" + g6,
             'بعد الواجب: وقت المتعة', "لعبة المكافأة وقصة Lumi والأغاني وEnglish Hub — كلها في الصفحة الرئيسية." + "<br>" + g6a),
            (shot("ob_profile"), 'For parents: <span class="key">My Profile</span>', "Sessions left, payments, teacher grades, attendance and a downloadable performance report.",
             'لأولياء الأمور: <span class="key">My Profile</span>', "الحصص المتبقية والمدفوعات ودرجات المعلّم والحضور وتقرير أداء قابل للتنزيل."),
            (shot("ob_messages"), 'For parents: <span class="key">Messages</span>', "Bookings, class reminders, payment due dates and teacher notes arrive here. Referrals: every friend who subscribes adds 5 free classes.",
             'لأولياء الأمور: <span class="key">Messages</span>', "تصل هنا الحجوزات وتذكيرات الحصص ومواعيد الأقساط وملاحظات المعلّم. الإحالات: كل صديق يشترك يضيف ٥ حصص مجانية."),
        ),
        tip_en='💬 <span>Stuck at any step?</span> Every numbered guide is one tap away: <b>📘 Guides</b> on the dashboard (or scan this code). Still stuck? Message your teacher on WhatsApp.',
        tip_ar='واجهتم صعوبة؟ كل دليل مرقّم على بُعد ضغطة: زر <b>📘 Guides · الأدلة</b> في الصفحة الرئيسية (أو امسحوا الرمز). وإن احتجتم مساعدة راسلوا المعلّم على واتساب.',
        index=True)
    return D


def build_qr():
    import qrcode
    img = qrcode.make(f"https://{SITE}/guides.html", box_size=10, border=2)
    p = TMP / "qr-guides.png"; img.save(p); return p


def render(key, cfg, qr):
    from playwright.sync_api import sync_playwright
    from PIL import Image
    html = B.page(cfg["title"], cfg["sub_en"], cfg["sub_ar"], cfg["steps"], cfg["tip_en"], cfg["tip_ar"])
    html = html.replace("</style>", EXTRA_CSS + "</style>", 1)
    if cfg.get("index"):
        html = html.replace('<div class="tip">', guides_index() + '<div class="tip">', 1)
    (OUT / f"lumio-{key}.src.html").write_text(html)
    import re
    for name in sorted(set(re.findall(r'src="SHOT:([\w-]+)"', html))):
        html = html.replace(f'src="SHOT:{name}"', f'src="{B.du(TMP / (name + ".png"))}"')
    html = (html.replace("FONTS/", f"file://{B.FONTS}/")
            .replace('src="LOGO"', f'src="{B.du(ROOT / "assets/logo/lumio-logo.png")}"')
            .replace('src="ICON"', f'src="{B.du(ROOT / "assets/logo/favicon-192.png")}"')
            .replace('src="QR"', f'src="{B.du(qr)}"'))
    inl = TMP / f"{key}.html"; inl.write_text(html)
    frames = []
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path="/opt/pw-browsers/chromium")
        pg = b.new_page(viewport={"width": 1080, "height": 1000}, device_scale_factor=1)
        pg.goto(f"file://{inl}"); pg.wait_for_timeout(800)
        Hh = pg.evaluate("document.body.scrollHeight")
        dsf = max(1.5, min(2.0, 7900 / Hh))   # <= 7900 px tall when possible, never below 1.5x
        pg.close(); pg = b.new_page(viewport={"width": 1080, "height": 1000}, device_scale_factor=dsf)
        pg.goto(f"file://{inl}"); pg.wait_for_timeout(1200)
        pg.screenshot(path=str(OUT / f"lumio-{key}.png"), full_page=True)
        pg.set_viewport_size({"width": 1080, "height": Hh}); pg.wait_for_timeout(300)
        pg.screenshot(path=str(TMP / f"{key}_header.png"), clip={"x": 0, "y": 0, "width": 1080, "height": 200})
        for i, el in enumerate(pg.query_selector_all(".step, .gidx, .tip")):
            bb = el.bounding_box(); f = TMP / f"{key}_f{i}.png"
            pg.screenshot(path=str(f), clip={"x": bb["x"] - 24, "y": bb["y"] - 24, "width": bb["width"] + 48, "height": bb["height"] + 32}); frames.append(f)
        if cfg.get("index"):   # the onboarding guide also ships as a paged PDF for parents
            pg.emulate_media(media="print")
            pg.pdf(path=str(OUT / f"lumio-{key}.pdf"), width="1080px", height="1920px", print_background=True,
                   margin={"top": "30px", "bottom": "30px", "left": "0", "right": "0"})
        b.close()
    video(key, frames)
    # web copies for guides.html
    WEB.mkdir(parents=True, exist_ok=True)
    im = Image.open(OUT / f"lumio-{key}.png").convert("RGB")
    if im.width > 1080: im = im.resize((1080, round(im.height * 1080 / im.width)), Image.LANCZOS)
    im.save(WEB / f"lumio-{key}.jpg", quality=84, optimize=True, progressive=True)
    import shutil; shutil.copy(OUT / f"lumio-{key}.mp4", WEB / f"lumio-{key}.mp4")
    if (OUT / f"lumio-{key}.pdf").exists(): shutil.copy(OUT / f"lumio-{key}.pdf", WEB / f"lumio-{key}.pdf")


def video(key, frames):
    from PIL import Image
    W, H = 1080, 1920
    hdr = Image.open(TMP / f"{key}_header.png").convert("RGB"); hdr = hdr.resize((W, int(hdr.height * W / hdr.width)))
    full = Image.open(OUT / f"lumio-{key}.png").convert("RGB"); s = W / full.width
    slides = [TMP / f"{key}_s0.png"]; full.resize((W, int(full.height * s))).crop((0, 0, W, H)).save(slides[0])
    for i, f in enumerate(frames):
        im = Image.new("RGB", (W, H), (255, 243, 222)); im.paste(hdr, (0, 0))
        card = Image.open(f).convert("RGB"); sc = min((W - 60) / card.width, (H - hdr.height - 120) / card.height)
        card = card.resize((int(card.width * sc), int(card.height * sc)))
        im.paste(card, ((W - card.width) // 2, hdr.height + (H - hdr.height - card.height) // 2))
        p = TMP / f"{key}_s{i+1}.png"; im.save(p); slides.append(p)
    n = len(slides)
    cmd = ["ffmpeg", "-y", "-loglevel", "error"]
    for p in slides: cmd += ["-loop", "1", "-t", "5", "-i", str(p)]
    fc = "".join(f"[{i}:v]fade=t=in:st=0:d=0.4,fade=t=out:st=4.6:d=0.4,format=yuv420p[v{i}];" for i in range(n)) + "".join(f"[v{i}]" for i in range(n)) + f"concat=n={n}:v=1:a=0[v]"
    cmd += ["-filter_complex", fc, "-map", "[v]", "-r", "30", "-c:v", "libx264", "-crf", "26", "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(OUT / f"lumio-{key}.mp4")]
    subprocess.run(cmd, check=True)


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if "--no-capture" not in sys.argv:
        capture()
    qr = build_qr()
    defs = guide_defs()
    for k in (args or list(defs)):
        render(k, defs[k], qr); print("built", k)
