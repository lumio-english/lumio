#!/usr/bin/env python3
"""Render every manual that has a source, and refresh the landing page's
handbook cover image.

    python3.12 gen_marketing_media.py --shots       # first, if any screen changed
    python3.12 gen_manuals.py                       # all: handbook + guide + 7 level manuals
    python3.12 gen_manuals.py handbook|guide|levels # a subset
    python3.12 gen_manuals.py level2                # one level manual

Sources (edit these for any text change):
  _docs/manuals-src/parent_handbook.html   -> manuals/Lumio_Parent_Handbook_AR.pdf
  _docs/manuals-src/curriculum_guide.html  -> manuals/Lumio_English_Curriculum_Guide.pdf
  _docs/manuals-src/level_manuals.json     -> manuals/Lumio_English_<Level>_<Name>_Manual.pdf (x7)
      prose only; lesson titles/goals/grammar focus/vocabulary come from lessons/<level>/*.json,
      Hub counts from vocab-hub / idioms-hub / grammar-hub, story parts from story.html,
      game names from student.html's GAME_INFO. Generated HTML is written next to the JSON
      as level_<level>.html (kept in git so a diff shows exactly what changed).
Screenshots they embed live in _docs/manuals-src/assets/ and come from
gen_marketing_media.py. Fonts are local (assets/fonts) so the render never
depends on the network.
"""
import os, sys, json, re, glob, html, subprocess
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.abspath(__file__)); os.chdir(ROOT)
SRC = "_docs/manuals-src"
CHROMIUM = os.environ.get("LUMIO_CHROMIUM") or ("/opt/pw-browsers/chromium" if os.path.exists("/opt/pw-browsers/chromium") else None)
LEVELS = ["pre-a", "level1", "level2", "level3", "level4", "level5", "level6"]
LEVEL_LABEL = {"pre-a": "Pre-A", **{f"level{i}": f"Level {i}" for i in range(1, 7)}}
PDF_NAME = {"pre-a": "Pre-A_First_Words", "level1": "Level1_About_Me", "level2": "Level2_My_World", "level3": "Level3_Everyday_Life",
            "level4": "Level4_Smart_Choices", "level5": "Level5_Telling_My_Story", "level6": "Level6_Looking_Ahead"}
E = html.escape


# ---------------------------------------------------------------- live data
def lessons(lvl):
    return [json.load(open(f, encoding="utf-8")) for f in sorted(glob.glob(f"lessons/{lvl}/lesson*.json"))]


def hub_counts(lvl):
    v = json.load(open(f"vocab-hub/{lvl}.json", encoding="utf-8"))
    themes = v.get("themes", [])
    idioms = json.load(open(f"idioms-hub/{lvl}.json", encoding="utf-8")).get("idioms", []) if os.path.exists(f"idioms-hub/{lvl}.json") else []
    grammar = json.load(open(f"grammar-hub/{lvl}.json", encoding="utf-8")).get("topics", []) if os.path.exists(f"grammar-hub/{lvl}.json") else None
    return dict(themes=themes, words=sum(len(t.get("words", [])) for t in themes), idioms=idioms, grammar=grammar,
                phonics=os.path.exists(f"phonics-hub/{lvl}.json"), spelling=os.path.exists(f"spelling-hub/{lvl}.json"))


def stories():
    src = open("story.html", encoding="utf-8").read()
    out = {}
    for m in re.finditer(r'"(pre-a|level\d)":\s*\{\s*title:\s*"([^"]+)",\s*parts:\s*\[(.*?)\]', src, re.S):
        parts = re.findall(r'name:\s*"([^"]+)",\s*unlockLesson:\s*(\d+)', m.group(3))
        out[m.group(1)] = dict(title=m.group(2), parts=[(n, int(u)) for n, u in parts])
    return out


def games():
    src = open("student.html", encoding="utf-8").read()
    return {m.group(1): m.group(2) for m in re.finditer(r'"(pre-a|level\d)":\s*\{\s*file:\s*"[^"]+",\s*title:\s*"([^"]+)"', src)}


# ---------------------------------------------------------------- html
CSS = """
@font-face{font-family:'Baloo 2';font-weight:700;src:url(assets/fonts/baloo-2-latin-700-normal.woff2) format('woff2')}
@font-face{font-family:'Baloo 2';font-weight:800;src:url(assets/fonts/baloo-2-latin-800-normal.woff2) format('woff2')}
@font-face{font-family:Nunito;font-weight:400;src:url(assets/fonts/nunito-latin-400-normal.woff2) format('woff2')}
@font-face{font-family:Nunito;font-weight:600;src:url(assets/fonts/nunito-latin-600-normal.woff2) format('woff2')}
@font-face{font-family:Nunito;font-weight:700;src:url(assets/fonts/nunito-latin-700-normal.woff2) format('woff2')}
@font-face{font-family:Nunito;font-weight:800;src:url(assets/fonts/nunito-latin-800-normal.woff2) format('woff2')}
@font-face{font-family:Cairo;font-weight:600;src:url(assets/fonts/cairo-arabic-600-normal.woff2) format('woff2')}
@font-face{font-family:Cairo;font-weight:700;src:url(assets/fonts/cairo-arabic-700-normal.woff2) format('woff2')}
:root{--orange:#F97316;--orange-dark:#C2530A;--orange-soft:#FFF1E0;--sun:#FFC93C;--sun-soft:#FFF3D6;--blue:#1E4FA3;--blue-soft:#E8EFFB;
 --teal:#0D9488;--teal-soft:#E6FAF7;--cocoa:#43301F;--ink:#2A2118;--ink-soft:#5B4636;--muted:#8A7160;--paper:#FFFBF5;--border:#EAE3D8;
 --grad:linear-gradient(135deg,#FB923C 0%,#F97316 55%,#F59E0B 100%);--night:linear-gradient(160deg,#3A2A1C 0%,#1C1610 100%)}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Nunito,Cairo,sans-serif;color:var(--ink);background:#fff;font-size:12.5px;line-height:1.65}
.ar{font-family:Cairo,sans-serif;direction:rtl;unicode-bidi:isolate}
.page{width:662px;height:941px;position:relative;overflow:hidden;page-break-after:always;
 background:radial-gradient(700px 320px at 90% -10%,rgba(255,201,60,.18),transparent 60%),linear-gradient(180deg,#FFF8EC 0%,#FFFBF5 40%,#FFFBF5 100%)}
.page:last-child{page-break-after:auto}
.bar{background:var(--grad);color:#fff;padding:20px 40px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 6px 18px rgba(249,115,22,.22)}
.bar h1{font-family:'Baloo 2';font-size:20px;font-weight:800}
.bar .brand{display:flex;align-items:center;gap:8px;background:#fff;border-radius:999px;padding:5px 12px 5px 6px;font-family:'Baloo 2';font-weight:800;font-size:12px;color:var(--cocoa)}
.bar .brand img{height:30px;display:block}
.content{padding:22px 40px 0}
.card{background:#fff;border-radius:18px;padding:18px 22px;margin-bottom:13px;border:1px solid var(--border);box-shadow:0 2px 4px rgba(67,48,31,.04),0 8px 22px rgba(67,48,31,.06)}
.card h2{font-family:'Baloo 2';font-size:16px;color:var(--orange-dark);margin-bottom:6px}
.card p,.card li{color:var(--ink-soft)}
.card ul,.card ol{padding-left:20px}.card li{margin-bottom:4px}
.two{display:grid;grid-template-columns:1fr 1fr;gap:13px}
.shot{border-radius:14px;overflow:hidden;border:1px solid var(--border);box-shadow:0 8px 22px rgba(67,48,31,.10);background:#fff}
.shot img{width:100%;display:block}
.cap{font-size:10.5px;color:var(--muted);text-align:center;margin-top:7px;font-weight:700}
.foot{position:absolute;bottom:0;left:0;right:0;padding:10px 40px;border-top:1px solid rgba(67,48,31,.08);display:flex;justify-content:space-between;font-size:10.5px;color:var(--muted);font-weight:700}
.pill{display:inline-block;background:var(--sun-soft);color:#7B4A0E;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:700;margin:2px 3px 2px 0}
.pill .ar{color:var(--muted);font-size:10.5px;margin-left:5px}
.pill.t{background:var(--teal-soft);color:var(--teal)}.pill.b{background:var(--blue-soft);color:var(--blue)}.pill.o{background:var(--orange-soft);color:var(--orange-dark)}
.lesson{background:#fff;border-radius:16px;padding:13px 18px;margin-bottom:10px;border:1px solid var(--border);box-shadow:0 6px 16px rgba(67,48,31,.06)}
.lesson .head{display:flex;align-items:center;gap:10px;margin-bottom:3px}
.lesson .num{width:28px;height:28px;border-radius:50%;background:var(--orange);color:#fff;display:flex;align-items:center;justify-content:center;font-family:'Baloo 2';font-weight:800;font-size:13px;flex-shrink:0}
.lesson.review .num{background:var(--sun);color:var(--cocoa)}
.lesson h3{font-family:'Baloo 2';font-size:14.5px;color:var(--cocoa)}
.lesson h3 .ar{font-size:12px;color:var(--muted);margin-left:8px;font-weight:700}
.lesson .tag{margin-left:auto;background:var(--teal-soft);color:var(--teal);padding:2px 10px;border-radius:999px;font-size:10px;font-weight:800;white-space:nowrap}
.lesson .goal{font-size:11.5px;color:var(--ink-soft);font-style:italic}
.lesson .gf{font-size:11.5px;color:var(--orange-dark);font-weight:800}
.lesson .words{margin-top:5px}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:13px}
.stat{background:#fff;border-radius:16px;padding:12px 8px;text-align:center;border:1px solid var(--border);box-shadow:0 6px 16px rgba(67,48,31,.06)}
.stat .n{font-family:'Baloo 2';font-weight:800;font-size:26px;color:var(--orange);line-height:1.1}
.stat .l{font-size:9.5px;font-weight:800;color:var(--muted);letter-spacing:.5px;text-transform:uppercase;margin-top:3px}
.note{background:var(--sun-soft);border-radius:14px;padding:12px 16px;border-left:5px solid var(--sun);color:var(--ink-soft);font-weight:600;margin-bottom:13px}
.steps{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.step{background:#fff;border-radius:16px;padding:12px 14px;border:1px solid var(--border);display:flex;gap:10px;align-items:flex-start}
.step .n{width:30px;height:30px;border-radius:50%;color:#fff;display:flex;align-items:center;justify-content:center;font-family:'Baloo 2';font-weight:800;flex-shrink:0}
.step h3{font-family:'Baloo 2';font-size:13px;color:var(--cocoa)}.step p{font-size:11px;color:var(--ink-soft)}
.o1{background:var(--orange)}.o2{background:var(--teal)}.o3{background:var(--sun);color:var(--cocoa)!important}.o4{background:var(--blue)}
/* cover */
.cover{color:#fff;text-align:center;background:var(--grad)}
.cover.teen{background:var(--night)}
.cover .top{display:flex;justify-content:flex-start;padding:30px 40px 0}
.cover .lock{background:#fff;border-radius:18px;padding:10px 16px;display:inline-block;box-shadow:0 12px 30px rgba(67,48,31,.18)}
.cover .lock img{height:72px;display:block}
.cover .badge{display:inline-block;background:rgba(255,255,255,.22);border:1px solid rgba(255,255,255,.35);padding:6px 20px;border-radius:999px;font-family:'Baloo 2';font-weight:800;font-size:14px;margin-top:46px}
.cover h1{font-family:'Baloo 2';font-size:40px;font-weight:800;line-height:1.2;margin:14px auto 6px;max-width:520px}
.cover .sub{font-weight:700;font-size:14px;opacity:.95}
.cover .stats{display:flex;gap:9px;justify-content:center;margin:20px 0 0;flex-wrap:wrap;padding:0 30px}
.cover .stats span{background:rgba(255,255,255,.22);border:1px solid rgba(255,255,255,.35);padding:6px 15px;border-radius:999px;font-weight:800;font-size:12.5px}
.cover .hero{height:350px;margin-top:22px;filter:drop-shadow(0 22px 28px rgba(0,0,0,.28))}
.cover .bubble{position:absolute;bottom:54px;left:50%;transform:translateX(-50%);background:#fff;color:var(--cocoa);border-radius:18px;padding:12px 20px;font-weight:700;font-size:12.5px;max-width:460px;box-shadow:0 12px 30px rgba(0,0,0,.2)}
.back{background:var(--night);color:#FFF3D6;text-align:center}
.back .top{display:flex;justify-content:flex-start;padding:30px 40px 0}
.back h1{font-family:'Baloo 2';font-size:32px;color:#fff;margin-top:80px}
.back .sub{max-width:460px;margin:8px auto 0;color:#F3E3C8;font-weight:600}
.back .hero{height:270px;margin-top:22px;filter:drop-shadow(0 22px 28px rgba(0,0,0,.35))}
.back .contact{position:absolute;bottom:56px;left:40px;right:40px;display:flex;align-items:center;gap:20px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);border-radius:22px;padding:16px 20px;text-align:left}
.back .qr{flex:0 0 130px;background:#fff;border-radius:16px;padding:7px}.back .qr img{width:116px;height:116px;display:block}
.back .k{font-family:'Baloo 2';font-size:18px;color:#fff;font-weight:800}.back .v{font-family:'Baloo 2';font-size:15px;color:var(--sun);font-weight:800}
.back .h{font-size:11.5px;color:#E7D6BC;font-weight:600;margin-top:5px;line-height:1.6}
.back .slogan{position:absolute;bottom:20px;left:0;right:0;font-family:'Baloo 2';font-weight:800;font-size:13px;color:var(--sun);letter-spacing:.5px}
"""


def bar(title):
    return f'<div class="bar"><h1>{E(title)}</h1><div class="brand"><img src="assets/lumio-logo.png" alt="">LUMIO ENGLISH</div></div>'


def foot(lvl, cfg, n):
    return f'<div class="foot"><span>Lumio English &middot; {E(cfg["name"])} Guide</span><span>{n}</span></div>'


def pill(w):
    ar = f'<span class="ar">{E(w["ar"])}</span>' if w.get("ar") else ""
    return f'<span class="pill">{E(w["en"])}{ar}</span>'


def build_level(lvl, cfg, data, story, game):
    L = lessons(lvl); hub = hub_counts(lvl)
    all_words = [w for d in L for w in d["vocab"]]
    label = LEVEL_LABEL[lvl]; teen = cfg["track"] == "teen"
    is_young = not teen
    grammar_n = len(hub["grammar"]) if hub["grammar"] is not None else None
    pages = []
    # ---- cover
    stat3 = f'{grammar_n} Grammar Topics' if grammar_n else f'{len(hub["themes"])} Vocabulary Themes'
    pages.append(f'''<div class="page cover{" teen" if teen else ""}">
  <div class="top"><div class="lock"><img src="assets/lumio-logo.png" alt=""></div></div>
  <div class="badge">{label}</div><h1>{E(cfg["name"])}</h1>
  <div class="sub">Complete Lesson Guide &middot; Ages {cfg["ages"]} &middot; CEFR {cfg["cefr"]}</div>
  <div class="stats"><span>{len(L)} Lessons</span><span>{len(all_words)} Words</span><span>{stat3}</span></div>
  <img class="hero" src="assets/{cfg["cover_char"]}" alt="">
  <div class="bubble">{E(cfg["cover_quote"])}</div></div>''')
    # ---- overview
    sample = [w for w in all_words if w["en"] in cfg["sample_words"]]
    seen = set(); sample = [w for w in sample if not (w["en"] in seen or seen.add(w["en"]))]
    pages.append(f'''<div class="page">{bar(f"{label} · {cfg['name']}")}<div class="content">
  <div class="card"><p>{E(cfg["intro"])}</p></div>
  <div class="two"><div class="card"><h2>By the end of this level, your child can:</h2><ul>{"".join(f"<li>{E(o)}</li>" for o in cfg["outcomes"])}</ul></div>
  <div><div class="card"><h2>Sample vocabulary</h2><div>{"".join(pill(w) for w in sample)}</div></div>
  <div class="card"><h2>Grammar</h2><p>{E(cfg["grammar_blurb"])}</p></div></div></div>
  <div class="shot" style="max-width:430px;margin:0 auto"><img src="assets/lv-{lvl}-lesson.png" alt=""></div>
  <div class="cap">A real vocabulary slide from Lesson 1 &mdash; picture, Arabic, example sentence and audio</div>
  </div>{foot(lvl, cfg, 2)}</div>''')
    # ---- how this level works
    hubparts = ["Vocabulary", "Idioms", "Writing &amp; Speaking"] + (["Spelling"] if hub["spelling"] else []) + (["Phonics"] if hub["phonics"] else []) + (["Grammar"] if grammar_n else [])
    story_html = ""
    if story:
        parts = " &middot; ".join(f"<b>Part {i+1}</b> {E(n)} <span style='color:var(--muted)'>(after Lesson {u})</span>" for i, (n, u) in enumerate(story["parts"]))
        story_html = f'<div class="card"><h2>This level\'s story: &ldquo;{E(story["title"])}&rdquo;</h2><p>A four-part illustrated story told entirely in this level\'s own words, with the text in English and Arabic under every page (and a Hide/Show text button for reading practice). Each part unlocks as your child progresses:</p><p style="margin-top:6px">{parts}</p></div>'
    pages.append(f'''<div class="page">{bar("How this level is taught")}<div class="content">
  <div class="steps">
    <div class="step"><div class="n o1">1</div><div><h3>Prepare in the app</h3><p>Before each live class, your child meets the lesson's new words, sounds and sentences on their own, so they arrive ready.</p></div></div>
    <div class="step"><div class="n o2">2</div><div><h3>Live class on Microsoft Teams</h3><p>A real teacher leads the same lesson in a small group of up to four students at this level, with a supervisor on hand.</p></div></div>
    <div class="step"><div class="n o3">3</div><div><h3>Homework</h3><p>Spelling, drawing{" or writing" if teen else ""}, Say It and a short quiz, all tied to that lesson; plus a printable worksheet, writing sheet and flashcards.</p></div></div>
    <div class="step"><div class="n o4">4</div><div><h3>Grow on the map</h3><p>Every finished lesson lights up the next step on the adventure map and unlocks that lesson's bonus game.</p></div></div>
  </div>
  <div style="height:13px"></div>{story_html}
  <div class="card"><h2>The {E(cfg["name"])} Hub</h2><p>Open any time, not just during lessons: {", ".join(hubparts)} (page 9). And after every finished lesson, a new round of this level's bonus game, <b>{E(game)}</b>, unlocks (page 11).</p></div>
  <div class="note" >Every lesson has the same shape: new words with pictures, Arabic and audio &rarr; listening and matching practice &rarr; {"a grammar point &rarr; " if grammar_n else ""}a short quiz and spelling &rarr; homework, a printable worksheet and flashcards. Lesson {len(L)} is the level's Big Review.</div>
  <div class="note">Live classes run 45&ndash;90 minutes depending on the lesson: a little shorter at the start of the level, and the full 90 minutes for the Big Review in Lesson {len(L)}.</div>
  </div>{foot(lvl, cfg, 3)}</div>''')
    # ---- lessons, 4 per page
    unlock = {u: i + 1 for i, (n, u) in enumerate(story["parts"])} if story else {}
    for p in range(5):
        chunk = L[p*4:(p+1)*4]; items = []
        for d in chunk:
            n = d["number"]; review = n == len(L)
            tag = ""
            if review: tag = '<span class="tag">Big Review</span>'
            elif n in unlock: tag = f'<span class="tag">Unlocks story part {unlock[n]}</span>'
            ar = f'<span class="ar">{E(d["titleAr"])}</span>' if d.get("titleAr") else ""
            gf = f'<div class="gf">Grammar focus: {E(d["grammarFocus"])}</div>' if d.get("grammarFocus") and (grammar_n or is_young) else ""
            items.append(f'''<div class="lesson{" review" if review else ""}"><div class="head"><div class="num">{n}</div><h3>{E(d["title"])}{ar}</h3>{tag}</div>
  <div class="goal">Goal: {E(d.get("goal",""))}</div>{gf}<div class="words">{"".join(pill(w) for w in d["vocab"][:20])}{f'<span class="pill t">+{len(d["vocab"])-20} more review words</span>' if len(d["vocab"]) > 20 else ""}</div></div>''')
        pages.append(f'<div class="page">{bar(f"{label} · Lessons {p*4+1}-{p*4+4}")}<div class="content">{"".join(items)}</div>{foot(lvl, cfg, 4+p)}</div>')
    # ---- hub
    themes = "".join(f'<span class="pill o">{E(t.get("name") or t.get("title") or t.get("theme",""))}</span>' for t in hub["themes"])
    idioms = "".join(f'<li><b>{E(i.get("phrase",""))}</b> &mdash; {E(i.get("meaning",""))}</li>' for i in hub["idioms"][:3])
    patterns = len({d.get("grammarFocus") for d in L if d.get("grammarFocus")})
    grammar_stat = f'<div class="stat"><div class="n">{grammar_n}</div><div class="l">Grammar topics</div></div>' if grammar_n else f'<div class="stat"><div class="n">{patterns}</div><div class="l">Sentence patterns</div></div>'
    pages.append(f'''<div class="page">{bar(f"The {cfg['name']} Hub")}<div class="content">
  <div class="card"><h2>Everything learned, ready to revisit anytime</h2><p>Every word your child has met in this level, organized by theme with its picture, Arabic and audio &mdash; plus idioms, writing and speaking practice{", and a rule page for every grammar point" if grammar_n else ""}. Open any time, not just during lesson time.</p></div>
  <div class="stats"><div class="stat"><div class="n">{len(hub["themes"])}</div><div class="l">Vocabulary themes</div></div><div class="stat"><div class="n">{hub["words"]}</div><div class="l">Vocabulary words</div></div><div class="stat"><div class="n">{len(hub["idioms"])}</div><div class="l">Idioms</div></div>{grammar_stat}</div>
  <div class="card"><h2>Vocabulary themes in this level</h2><div>{themes}</div></div>
  <div class="card"><h2>Sample idioms your child will discover</h2><ul>{idioms}</ul></div>
  <div class="shot" style="max-width:470px;margin:0 auto"><img src="assets/lv-{lvl}-hub.png" alt=""></div>
  <div class="cap">The first vocabulary theme of this level, as it appears in the Hub</div>
  </div>{foot(lvl, cfg, 9)}</div>''')
    # ---- printables
    fc = data["flashcards_teen" if teen else "flashcards_young"]
    pages.append(f'''<div class="page">{bar("Writing Practice & Flashcards")}<div class="content">
  <div class="card"><h2>A printable page for every single lesson</h2><p>Beyond the screen, every one of {label}'s {len(L)} lessons comes with its own homework sheet, writing sheet and flashcard set, ready to print.</p></div>
  <div class="two"><div><div class="shot"><img src="assets/lv-{lvl}-worksheet.png" alt=""></div><div class="cap">Lesson 1 homework sheet</div></div>
  <div><div class="shot"><img src="assets/lv-{lvl}-flashcards.png" alt=""></div><div class="cap">Lesson 1 flashcards (print double-sided)</div></div></div>
  <div class="card" style="margin-top:13px"><h2>Who they're for, and why</h2><p><b>Writing practice:</b> {E(cfg["writing"])}</p><p style="margin-top:6px"><b>Flashcards:</b> {E(fc)}</p></div>
  </div>{foot(lvl, cfg, 10)}</div>''')
    # ---- game
    steps = "".join(f"<li>{E(s)}</li>" for s in cfg["game_steps"])
    pages.append(f'''<div class="page">{bar(f"{game} — How It Works")}<div class="content">
  <div class="card"><h2>{E(game)}, this level's bonus game</h2><p>{E(cfg["game_desc"])}</p></div>
  <div class="two" style="align-items:start"><div class="shot"><img src="assets/lv-{lvl}-game.png" alt=""></div>
  <div class="card" style="margin:0"><h2>How to play</h2><ol>{steps}</ol></div></div>
  <div class="note" style="margin-top:13px">A new round of the game unlocks after every lesson your child finishes, using that lesson's own words &mdash; so it is always practice, never random.</div>
  </div>{foot(lvl, cfg, 11)}</div>''')
    # ---- back cover
    pages.append(f'''<div class="page back"><div class="top"><div class="lock" style="background:#fff;border-radius:18px;padding:10px 16px;display:inline-block"><img src="assets/lumio-logo.png" alt="" style="height:64px;display:block"></div></div>
  <h1>We're here with you every step</h1><div class="sub">Thank you for trusting Lumio English with your child's learning journey. We can't wait to see how far they'll go.</div>
  <img class="hero" src="assets/{cfg["cover_char"]}" alt="">
  <div class="contact"><div class="qr"><img src="assets/qr-website.png" alt=""></div><div><div class="k">Visit our website</div><div class="v">lumio-english.github.io/lumio</div><div class="h">Scan with your phone camera to open the site &mdash; the free placement test, the free trial class, every level's details and pricing.</div></div></div>
  <div class="slogan">Small Steps &middot; Big Futures</div></div>''')
    return f'<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>{label} &middot; {E(cfg["name"])} Guide</title><style>{CSS}</style></head><body>{"".join(pages)}</body></html>'


# ---------------------------------------------------------------- render
def render(browser, src, out, w, h):
    pg = browser.new_page(viewport={"width": w, "height": h})
    pg.goto("file://" + os.path.abspath(src)); pg.wait_for_timeout(1200)
    pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(300)
    pg.pdf(path=out, width=f"{w}px", height=f"{h}px", print_background=True,
           margin={"top": "0", "right": "0", "bottom": "0", "left": "0"}, prefer_css_page_size=False)
    pg.close(); print("wrote", out)


def main():
    args = sys.argv[1:] or ["handbook", "guide", "levels"]
    want_levels = [a for a in args if a in LEVELS] or (LEVELS if "levels" in args else [])
    data = json.load(open(f"{SRC}/level_manuals.json", encoding="utf-8"))
    st = stories(); gm = games()
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path=CHROMIUM) if CHROMIUM else p.chromium.launch()
        if "handbook" in args:
            render(b, f"{SRC}/parent_handbook.html", "manuals/Lumio_Parent_Handbook_AR.pdf", 794, 1123)
            subprocess.run(["pdftoppm", "-r", "84", "-f", "1", "-l", "1", "-jpeg", "-jpegopt", "quality=88", "-singlefile",
                            "manuals/Lumio_Parent_Handbook_AR.pdf", "assets/marketing/parent-handbook-cover"], check=True)
        if "guide" in args:
            render(b, f"{SRC}/curriculum_guide.html", "manuals/Lumio_English_Curriculum_Guide.pdf", 662, 941)
        for lvl in want_levels:
            html_path = f"{SRC}/level_{lvl}.html"
            open(html_path, "w", encoding="utf-8").write(build_level(lvl, data[lvl], data, st.get(lvl), gm[lvl]))
            render(b, html_path, f"manuals/Lumio_English_{PDF_NAME[lvl]}_Manual.pdf", 662, 941)
        b.close()


if __name__ == "__main__":
    main()
