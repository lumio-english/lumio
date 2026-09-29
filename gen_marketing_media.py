#!/usr/bin/env python3
"""Capture every screenshot and screen recording used by the landing page
and the Parent Handbook, straight from the live app (served locally).

    python3.12 gen_marketing_media.py            # screenshots + videos
    python3.12 gen_marketing_media.py --shots    # screenshots only (fast)

Outputs
  assets/marketing/real-lesson-screenshot.png   landing "This is what a real lesson looks like"
  assets/marketing/worksheet-sample.png         landing, page 1 of Pre-A L1 worksheet PDF
  assets/marketing/flashcard-sample.png         landing, page 1 of Pre-A L1 flashcards PDF
  assets/marketing/demo-hub.{webm,mp4} + -poster.jpg    landing recording: browsing the Hub
  assets/marketing/demo-game.{webm,mp4} + -poster.jpg   landing recording: Level 3 Crew Chat
  assets/marketing/parent-handbook-cover.jpg    landing, page 1 of the handbook PDF (see gen_manuals.py)
  _docs/manuals-src/assets/hb-*.png             every screenshot the Parent Handbook embeds
  _docs/manuals-src/assets/{hub_screenshot,prea_lumipocket_shot}.png   the Curriculum Guide's screenshots

Run this after any visual change (theme, logo, slide templates, vocab
pictures, story scenes), then `python3.12 gen_manuals.py` to
re-render the handbook, and commit the results together.
Needs Chromium: LUMIO_CHROMIUM (default /opt/pw-browsers/chromium) and a
free port 8799 (the script starts its own http.server).
"""
import os, sys, subprocess, time, json, shutil, glob
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.abspath(__file__))
os.chdir(ROOT)
PORT = 8799
BASE = f"http://localhost:{PORT}"
CHROMIUM = os.environ.get("LUMIO_CHROMIUM") or ("/opt/pw-browsers/chromium" if os.path.exists("/opt/pw-browsers/chromium") else None)
MK = "assets/marketing"
HB = "_docs/manuals-src/assets"
SHOTS_ONLY = "--shots" in sys.argv

STUDENT = {"name": "Yousef", "level": "pre-a", "t": 0}
PROGRESS = {"Yousef": {"pre-a": {str(n): {"stars": 3 if n % 3 else 2, "score": 9, "total": 10, "date": "2026-09-20"} for n in range(1, 8)}}}
SEED = f"""
if (!localStorage.getItem('lumio_user')) localStorage.setItem('lumio_user', {json.dumps(json.dumps(STUDENT))});
if (!localStorage.getItem('lumio_progress')) localStorage.setItem('lumio_progress', {json.dumps(json.dumps(PROGRESS))});
if (localStorage.getItem('lumio_teacher') !== '0') localStorage.setItem('lumio_teacher', '1');
"""


def serve():
    p = subprocess.Popen([sys.executable, "-m", "http.server", str(PORT)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1.2)
    return p


def pdf_page(pdf, out_png, page=1, dpi=110):
    tmp = out_png[:-4]
    subprocess.run(["pdftoppm", "-r", str(dpi), "-f", str(page), "-l", str(page), "-png", "-singlefile", pdf, tmp], check=True)


def find_slide(level, lesson, needle):
    """First slide-content file of a lesson containing `needle` (e.g. a vocab word)."""
    for f in sorted(glob.glob(f"slide-content/{level}/{lesson:02d}/slide-*.html")):
        if needle in open(f, encoding="utf-8").read():
            return int(os.path.basename(f)[6:-5])
    return 1


def main():
    os.makedirs(MK, exist_ok=True); os.makedirs(HB, exist_ok=True)
    srv = serve()
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(executable_path=CHROMIUM) if CHROMIUM else p.chromium.launch()
            ctx = browser.new_context(viewport={"width": 1280, "height": 720}, device_scale_factor=2, locale="en")
            ctx.add_init_script(SEED)
            pg = ctx.new_page()

            def shot(url, out, wait=1400, js=None, full=False, clip=None):
                pg.goto(f"{BASE}/{url}"); pg.wait_for_timeout(wait)
                if js:
                    pg.evaluate(js); pg.wait_for_timeout(900)
                pg.screenshot(path=out, full_page=full, clip=clip)
                print("shot", out)

            # --- Landing: a real lesson slide (Pre-A L1 vocab "hello")
            n = find_slide("pre-a", 1, "Vocabulary &bull; hello") or find_slide("pre-a", 1, "hello")
            shot("present.html?level=pre-a&n=1", f"{MK}/real-lesson-screenshot.png", js=f"loadSlide({n})")
            # --- Handbook screenshots
            shutil.copy(f"{MK}/real-lesson-screenshot.png", f"{HB}/hb-lesson.png")
            shot("placement-test.html", f"{HB}/hb-placement.png")
            shot("story.html?level=pre-a&part=1&preview=1", f"{HB}/hb-story.png")
            # dashboard: seed a roster student with 6 fully-done lessons via the app's own APIs
            pg.goto(f"{BASE}/teacher.html"); pg.wait_for_timeout(1500)
            pg.evaluate("""async () => {
              const s = await LumioProfiles.addStudent({name:'Yousef', level:'pre-a', pin:'1234', phone:'0500000000', approved:true, subscribed:true, sessionsRemaining:20});
              localStorage.setItem('lumio_parent_guide_seen_v1_' + s.id, '1');
              for (let n = 1; n <= 6; n++) {
                const c = LumioSchedule.addClass({students:[{studentName:'Yousef'}], teacherName:'Ms. Sara', date:'2026-09-0'+n, startTime:'16:00', durationMinutes:45, level:'pre-a', cohort:'2026-09', lessonNumber:n, meetingLink:'https://zoom.us/j/1'});
                LumioSchedule.markAttendance(c.id, 'Yousef', 'present');
                Lumio.saveHomework('Yousef', 'pre-a', n, {stars:3, score:9, total:10, said:4, saidTotal:4, hasDrawing:true, date:'2026-09-0'+n});
              }
            }""")
            shot("student.html", f"{HB}/hb-dashboard.png", wait=2200)
            # homework as the student sees it (no teacher-preview banner): Yousef has attended lessons 1-6
            pg.goto(f"{BASE}/login.html"); pg.evaluate("localStorage.setItem('lumio_teacher','0')")
            shot("homework.html?level=pre-a&n=2", f"{HB}/hb-homework.png", wait=1800)
            pg.evaluate("localStorage.setItem('lumio_teacher','1')")
            full = {"Yousef": {"pre-a": {str(n): {"stars": 3, "score": 10, "total": 10, "date": "2026-09-20"} for n in range(1, 21)}}}
            pg.goto(f"{BASE}/login.html"); pg.evaluate(f"localStorage.setItem('lumio_progress', {json.dumps(json.dumps(full))})")
            shot("certificates.html", f"{HB}/hb-certificate.png", wait=1600)
            pg.evaluate(f"localStorage.setItem('lumio_progress', {json.dumps(json.dumps(PROGRESS))})")
            shot("present-trial.html?level=pre-a&names=Yousef,Layla,Omar,Sara", f"{HB}/hb-trial.png", js="document.getElementById('startTrialBtn').click(); setTimeout(()=>loadSlide(3), 400)")
            shot("hub-present.html?type=vocab&level=pre-a", f"{HB}/hb-hub.png", wait=1800)
            # Curriculum Guide screenshots (same folder, names referenced by curriculum_guide.html)
            shutil.copy(f"{HB}/hb-hub.png", f"{HB}/hub_screenshot.png")
            pg.set_viewport_size({"width": 560, "height": 820})
            shot("games/lumis-pocket.html?level=pre-a&n=1", f"{HB}/prea_lumipocket_shot.png", wait=2500)
            pg.set_viewport_size({"width": 1280, "height": 720})
            # Per-level manual screenshots: lesson slide, Hub, bonus game, printables
            GAMES = {"pre-a": "lumis-pocket", "level1": "treehouse-builder", "level2": "twelve-months-calendar", "level3": "crew-chat",
                     "level4": "squad-budget", "level5": "story-detective", "level6": "crystal-ball"}
            for lvl, game in GAMES.items():
                n = find_slide(lvl, 1, "SAY IT") if lvl in ("pre-a", "level1", "level2") else find_slide(lvl, 1, "EXAMPLE")
                shot(f"present.html?level={lvl}&n=1", f"{HB}/lv-{lvl}-lesson.png", js=f"loadSlide({n})")
                shot(f"hub-present.html?type=vocab&level={lvl}", f"{HB}/lv-{lvl}-hub.png", wait=1800)
                if game == "crew-chat":
                    pg.set_viewport_size({"width": 640, "height": 720})
                shot(f"games/{game}.html?level={lvl}&n=3", f"{HB}/lv-{lvl}-game.png", wait=3200)
                pg.set_viewport_size({"width": 1280, "height": 720})
                pdf_page(f"worksheets/{lvl}/lesson01-homework.pdf", f"{HB}/lv-{lvl}-worksheet.png", dpi=90)
                pdf_page(f"flashcards/{lvl}/lesson01-flashcards.pdf", f"{HB}/lv-{lvl}-flashcards.png", dpi=90)
            # --- printable samples from the real PDFs
            pdf_page("worksheets/pre-a/lesson01-homework.pdf", f"{MK}/worksheet-sample.png")
            pdf_page("flashcards/pre-a/lesson01-flashcards.pdf", f"{MK}/flashcard-sample.png")
            shutil.copy(f"{MK}/worksheet-sample.png", f"{HB}/hb-worksheet.png")
            shutil.copy(f"{MK}/flashcard-sample.png", f"{HB}/hb-flashcards.png")
            pg.close()

            if not SHOTS_ONLY:
                # --- Recordings (webm from Playwright, mp4 via ffmpeg)
                def record(name, steps, size=(1280, 720)):
                    vdir = f"/tmp/lumio-rec-{name}"; shutil.rmtree(vdir, ignore_errors=True)
                    c = browser.new_context(viewport={"width": size[0], "height": size[1]}, record_video_dir=vdir,
                                            record_video_size={"width": size[0], "height": size[1]})
                    c.add_init_script(SEED)
                    page = c.new_page(); steps(page); path = page.video.path(); page.close(); c.close()
                    webm = f"{MK}/{name}.webm"; shutil.move(path, webm)
                    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", webm, "-c:v", "libx264", "-pix_fmt", "yuv420p",
                                    "-movflags", "+faststart", "-an", f"{MK}/{name}.mp4"], check=True)
                    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", "2", "-i", webm, "-frames:v", "1", "-q:v", "3",
                                    f"{MK}/{name}-poster.jpg"], check=True)
                    print("video", webm)

                def hub_steps(page):
                    page.goto(f"{BASE}/hub-present.html?type=vocab&level=level2"); page.wait_for_timeout(2500)
                    for _ in range(6):
                        page.keyboard.press("ArrowRight"); page.wait_for_timeout(1500)
                    page.goto(f"{BASE}/hub-present.html?type=idioms&level=level2"); page.wait_for_timeout(2500)
                    for _ in range(3):
                        page.keyboard.press("ArrowRight"); page.wait_for_timeout(1500)

                def game_steps(page):
                    vocab = json.load(open("lessons/level3/lesson01.json", encoding="utf-8"))["vocab"]
                    ar2en = {v["ar"]: v["en"] for v in vocab}
                    page.goto(f"{BASE}/games/crew-chat.html?level=level3&n=1"); page.wait_for_timeout(3500)
                    for _ in range(7):
                        page.wait_for_timeout(1200)
                        tiles = page.locator(".letter-tile:visible")
                        if tiles.count():
                            ar = page.evaluate("() => { const b=[...document.querySelectorAll('.msg-row.them b')].pop(); return b ? b.textContent.replace(/\"/g,'') : ''; }")
                            word = ar2en.get(ar, "")
                            for ch in [c for c in word.lower() if c.isalpha()]:
                                t = page.locator(f".letter-tile:not(.used):visible", has_text=ch.upper()).first
                                t.click(); page.wait_for_timeout(350)
                        else:
                            for _try in range(4):
                                chips = page.locator(".reply-chip:visible:not(.wrong):not(.locked)")
                                if not chips.count():
                                    break
                                chips.first.click(); page.wait_for_timeout(1000)
                                if page.locator(".letter-tile:visible").count() or not page.locator(".reply-chip.wrong").count():
                                    break
                        page.wait_for_timeout(2200)

                record("demo-hub", hub_steps)
                record("demo-game", game_steps, size=(640, 720))
            browser.close()
    finally:
        srv.terminate()
    print("done")


if __name__ == "__main__":
    main()
