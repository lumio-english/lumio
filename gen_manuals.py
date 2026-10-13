#!/usr/bin/env python3
"""Render every manual that has a source, and refresh the landing page's
handbook cover image.

    python3.12 gen_marketing_media.py --shots       # first, if any screen changed
    python3.12 gen_manuals.py                       # all: handbook + guide + 7 level manuals
    python3.12 gen_manuals.py handbook|guide|levels # a subset
    python3.12 gen_manuals.py level2                # one level manual

Sources (edit these for any text change):
  _docs/manuals-src/parent_handbook.html   -> manuals/Lumio_Parent_Handbook_AR.pdf
  build_guide() (this file)                -> _docs/manuals-src/curriculum_guide.html -> manuals/Lumio_English_Curriculum_Guide.pdf
      (generated from the same live data + level_manuals.json; do not edit the HTML by hand)
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


def bonus_classes(lvl):
    out = []
    for p in sorted(glob.glob(os.path.join(ROOT, "bonus-classes", lvl, "bonus*.json"))):
        with open(p, encoding="utf-8") as f:
            out.append(json.load(f))
    return out


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
.bar .brand{display:flex;align-items:center;gap:8px;background:#fff;border-radius:14px;padding:4px 10px;font-family:'Baloo 2';font-weight:800;font-size:12px;color:var(--cocoa)}
.bar .brand img{height:46px;width:auto;display:block}
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
.cover .lock img{height:110px;width:auto;display:block}
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
    return f'<div class="bar"><h1>{E(title)}</h1><div class="brand"><img src="assets/lumio-logo.png" alt="Lumio English"></div></div>'


def foot(lvl, cfg, n):
    return f'<div class="foot"><span>Lumio English &middot; {E(cfg["name"])} Guide</span><span>{n}</span></div>'


def pill(w):
    ar = f'<span class="ar">{E(w["ar"])}</span>' if w.get("ar") else ""
    return f'<span class="pill">{E(w["en"])}{ar}</span>'


def phonics_units(lvl):
    p = f"phonics-hub/{lvl}.json"
    return json.load(open(p, encoding="utf-8")).get("units", []) if os.path.exists(p) else []


def reading_passages(lvl):
    """{lesson: passage} from lib/reading_passages.py (Reading Lab, every third lesson)."""
    sys.path.insert(0, os.path.join(ROOT, "lib"))
    import reading_passages as RP
    return RP.PASSAGES.get(lvl, {})


def sound_label(s):
    return s["letter"].replace("_", "-")


# What really happens in a live class, in slide order (checked against slide-content-v5/<level>/NN/).
CLASS_FLOW = {
    "pre-a": [
        ("Warm-up and quick recap", "A hello routine, then a fast look back at the last lesson's words."),
        ("Letters and sounds", "In the alphabet lessons: Meet the Letter, Hear the Sound, then \"S is for...\" with a picture word."),
        ("New words", "Every word with a picture, its Arabic and a recorded voice, then Sound Match."),
        ("Let's Move!", "Children act the words out, so they learn with their whole body."),
        ("Sentences and a dialogue", "Build the Sentences and a short dialogue with the lesson's words."),
        ("Games and checks", "Memory Match, Sound & Spot, Quick Check, Your Turn and Mystery Picture, then a short quiz."),
        ("Today I Learned!", "A picture recap of the lesson to finish."),
    ],
    "kids": [
        ("Warm-up and quick recap", "A hello routine, then a fast look back at the last lesson's words."),
        ("Phonics Time", "In odd-numbered lessons: a new sound group, Listen & Spot, then a short story your child reads using only the sounds already taught."),
        ("Grammar Time", "In lessons with a new sentence pattern: the pattern, guided practice and Common Mistakes that Arabic speakers make."),
        ("New words", "Every word with a picture, its Arabic and a recorded voice, then Flash Race."),
        ("Sentences and a dialogue", "Build the Sentences, then a short dialogue that uses the lesson's words."),
        ("Reading Lab", "Level 2 only, in Lessons 3, 6, 9, 12, 15 and 18: a short illustrated text and questions (page {reading})."),
        ("Games and checks", "Memory Match, Sound & Spot, Quick Check, Your Turn and Mystery Picture, then a short quiz."),
        ("Today I Learned!", "A recap of the words and sentences from the lesson."),
    ],
    "teen": [
        ("Hook", "One question to get everyone talking about the lesson's topic."),
        ("First Listen and Crew Talk", "A real conversation between the Crew, with recorded voices, read and acted out."),
        ("Grammar Time", "Notice the pattern, learn the rule, practise it, then 10 Grammar Checks and Common Mistakes that Arabic speakers make."),
        ("New words", "Verbs first, then words and phrases, each with a picture, Arabic and audio, then 10 Vocabulary Checks."),
        ("Describe It and Build the Sentences", "Students describe a picture and build full sentences with the new grammar."),
        ("Reading Lab", "In Lessons 3, 6, 9, 12, 15 and 18: a real text with questions (page {reading})."),
        ("Speaking games", "Story Chain, Your Turn and Two Truths & a Lie, all using the lesson's grammar."),
        ("Challenge, real life and discussion", "A final challenge, a link to real life and about five minutes of open discussion."),
        ("Recap", "The lesson's verbs, words and grammar on one page."),
    ],
}


GAP = ' style="margin-left:6px"'


def build_level(lvl, cfg, data, story, game):
    L = lessons(lvl); hub = hub_counts(lvl)
    all_words = [w for d in L for w in d["vocab"]]
    label = LEVEL_LABEL[lvl]; teen = cfg["track"] == "teen"
    is_young = not teen
    grammar_n = len(hub["grammar"]) if hub["grammar"] is not None else None
    units = phonics_units(lvl)
    passages = reading_passages(lvl)
    bonus = bonus_classes(lvl)
    bonus_min = 45 if lvl == "pre-a" else 60

    # page plan first, so cross-references ("page N") are always right
    plan = ["cover", "overview", "how", "flow"] + (["phonics"] if units else []) + (["reading"] if passages else []) \
        + [f"lessons{p}" for p in range(5)] + (["bonus"] if bonus else []) + ["hub", "print", "game", "finish", "back"]
    P = {k: i + 1 for i, k in enumerate(plan)}
    pages = {}

    # ---- cover
    stat3 = f'{grammar_n} Grammar Topics' if grammar_n else (f'{len(units)} Phonics Groups' if units else f'{len(hub["themes"])} Vocabulary Themes')
    pages["cover"] = f'''<div class="page cover{" teen" if teen else ""}">
  <div class="top"><div class="lock"><img src="assets/lumio-logo.png" alt=""></div></div>
  <div class="badge">{label}</div><h1>{E(cfg["name"])}</h1>
  <div class="sub">Complete Level Guide &middot; Ages {cfg["ages"]} &middot; CEFR {cfg["cefr"]}</div>
  <div class="stats"><span>{len(L)} Lessons + {len(bonus)} Bonus Classes</span><span>{len(L) + len(bonus)} Live Classes</span><span>{len(all_words)} Words</span><span>{stat3}</span></div>
  <img class="hero" src="assets/{cfg["cover_char"]}" alt="">
  <div class="bubble">{E(cfg["cover_quote"])}</div></div>'''
    # ---- overview
    sample = [w for w in all_words if w["en"] in cfg["sample_words"]]
    seen = set(); sample = [w for w in sample if not (w["en"] in seen or seen.add(w["en"]))]
    pages["overview"] = f'''<div class="page">{bar(f"{label} · {cfg['name']}")}<div class="content">
  <div class="card"><p>{E(cfg["intro"])}</p></div>
  <div class="two"><div class="card"><h2>By the end of this level, your child can:</h2><ul>{"".join(f"<li>{E(o)}</li>" for o in cfg["outcomes"])}</ul></div>
  <div><div class="card"><h2>Sample vocabulary</h2><div>{"".join(pill(w) for w in sample)}</div></div>
  <div class="card"><h2>{"Grammar" if teen else "Sentences, sounds and grammar"}</h2><p>{E(cfg["grammar_blurb"])}</p></div></div></div>
  </div>{foot(lvl, cfg, P["overview"])}</div>'''
    # ---- how this level works
    hubparts = ["Vocabulary", "Idioms", "Writing &amp; Speaking"] + (["Spelling"] if hub["spelling"] else []) + (["Phonics"] if hub["phonics"] else []) \
        + (["Grammar"] if grammar_n else []) + ["Songs", "Word games"]
    hw = "Spelling, " + ("Draw It, " if lvl in ("pre-a", "level1") else "") + "Say It, " + ("" if lvl in ("pre-a", "level1") else "Talk, ") \
        + ("a phonics or grammar step, " if lvl != "pre-a" else "") + "and a short quiz"
    story_html = ""
    if story:
        parts = " &middot; ".join(f"<b>Part {i+1}</b> {E(n)} <span style='color:var(--muted)'>(after Lesson {u})</span>" for i, (n, u) in enumerate(story["parts"]))
        story_html = f'<div class="card"><h2>This level\'s story: &ldquo;{E(story["title"])}&rdquo;</h2><p>A four-part illustrated story told in this level\'s own words, read aloud with each word lighting up, with the English and Arabic text on every page (and a Hide/Show text button for reading practice). Each part unlocks as your child progresses:</p><p style="margin-top:6px">{parts}</p></div>'
    pages["how"] = f'''<div class="page">{bar("How this level is taught")}<div class="content">
  <div class="steps">
    <div class="step"><div class="n o1">1</div><div><h3>Prepare in the app</h3><p>Before each live class, your child meets the lesson's new words, sounds and sentences on their own, so they arrive ready.</p></div></div>
    <div class="step"><div class="n o2">2</div><div><h3>Live class on Microsoft Teams</h3><p>A real teacher leads the lesson for a small group of up to four students at the same level and lesson, with a supervisor on hand.</p></div></div>
    <div class="step"><div class="n o3">3</div><div><h3>Homework</h3><p>{hw}, all tied to that lesson; plus a printable homework sheet and flashcards.</p></div></div>
    <div class="step"><div class="n o4">4</div><div><h3>Grow on the map</h3><p>A lesson counts as done after prep, the live class and homework. Then the next stop on the adventure map lights up.</p></div></div>
  </div>
  <div style="height:13px"></div>{story_html}
  <div class="card"><h2>One level = 24 live classes, about 3 months</h2><p>{len(L)} lessons plus {len(bonus)} Bonus Classes (after Lessons 4, 8, 12 and 16), at 2&ndash;3 classes a week. Lessons run 45&ndash;90 minutes &mdash; shorter at the start of the level, the full 90 minutes for the Big Review in Lesson {len(L)}. Each Bonus Class runs {bonus_min} minutes.</p></div>
  <div class="card"><h2>The {E(cfg["name"])} Hub and game</h2><p>Open any time, not just during lessons: {", ".join(hubparts)} (page {P["hub"]}). After every finished lesson, a new round of this level's game, <b>{E(game)}</b>, unlocks (page {P["game"]}).</p></div>
  </div>{foot(lvl, cfg, P["how"])}</div>'''
    # ---- inside a live class
    flow = CLASS_FLOW["pre-a" if lvl == "pre-a" else ("teen" if teen else "kids")]
    flow = [(h, t) for h, t in flow if not (h == "Reading Lab" and not passages)]
    steps = "".join(f'<div class="lesson" style="padding:8px 13px;margin:0"><div class="head"><div class="num">{i}</div><h3 style="font-size:13px">{E(h)}</h3></div>'
                    f'<div class="goal" style="font-style:normal;font-size:10.8px;line-height:1.5">{E(t.format(reading=P.get("reading", "")))}</div></div>' for i, (h, t) in enumerate(flow, 1))
    pages["flow"] = f'''<div class="page">{bar("Inside a live class")}<div class="content">
  <div class="card"><p>Every lesson in {label} follows the same order, so your child always knows what comes next. The teacher shares the lesson on screen and every student takes part: tapping answers, speaking, playing for stars. Arabic is there whenever it helps: every word has its Arabic meaning, and grammar rules come with an Arabic explanation.</p></div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">{steps}</div>
  <div class="shot" style="max-width:{300 if teen else 340}px;margin:0 auto"><img src="assets/lv-{lvl}-lesson.png" alt=""></div>
  <div class="cap">A real vocabulary slide from Lesson 1 &mdash; picture, Arabic, example sentence and audio</div>
  </div>{foot(lvl, cfg, P["flow"])}</div>'''
    # ---- phonics (Levels 1-2)
    if units:
        rows = []
        for i, u in enumerate(units, 1):
            snd = ", ".join(sound_label(s) for s in u["sounds"])
            tr = ", ".join(t["en"] for t in u.get("tricky", []))
            review = not u.get("tricky")
            rows.append(f'''<div class="lesson{" review" if review else ""}" style="padding:8px 13px;margin:0"><div class="head"><div class="num">{i}</div><h3 style="font-size:12.5px">{E(u["unit"])}</h3><span class="tag">Lesson {2*i-1}</span></div>
  <div class="goal" style="font-style:normal;font-size:11px"><b>Sounds:</b> {E(snd)}{f"<br><b>Tricky words:</b> {E(tr)}" if tr else ""}</div></div>''')
        intro = ("Level 1 teaches every single letter sound, in a careful order: s, a, t, p first, because they already make real words (sat, tap, pat). Your child blends sounds into words from the very first lesson."
                 if lvl == "level1" else
                 "Level 2 builds on Level 1: two letters that make one sound (sh, ch, th, ng), consonant blends, magic e, long-vowel teams and vowels with r.")
        pages["phonics"] = f'''<div class="page">{bar(f"{label} · Phonics")}<div class="content">
  <div class="card"><h2>Reading English, sound by sound</h2><p>{E(intro)} Every practice word and every short story uses only the sounds taught so far, so your child can always read it on their own. A few very common words that don't follow the rules ("tricky words") come one to three at a time.</p></div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">{"".join(rows)}</div>
  <div class="note">Each sound has a recorded voice and an Arabic hint (for example, /s/ is like the Arabic س), in class and in the Hub's Phonics section, so your child can practise at home.</div>
  </div>{foot(lvl, cfg, P["phonics"])}</div>'''
    # ---- reading lab (Levels 2-6)
    if passages:
        items = "".join(f'''<div class="lesson" style="padding:8px 13px;margin:0"><div class="head"><div class="num">{n}</div><h3>{E(p["title"])}</h3><span class="tag">Lesson {n}</span></div>
  <div class="goal">{E(p.get("tag", ""))}</div></div>''' for n, p in sorted(passages.items()))
        how = ("The teacher reads the first part aloud, then the children read the second part themselves." if not teen
               else "The teacher reads the first part, the students read the second part, then everyone answers questions.")
        pages["reading"] = f'''<div class="page">{bar(f"{label} · Reading Lab")}<div class="content">
  <div class="card"><h2>Real reading, every third lesson</h2><p>Six short illustrated texts across the level, written with the words and grammar your child has already met. Two questions start the conversation before reading. {E(how)} Every word your child has already studied glows &mdash; tap it to see its Arabic and the lesson it came from &mdash; and two or three new words are explained.</p>
  <p style="margin-top:6px">After reading, six questions go from <b>Find it</b> (the answer is in the text) to <b>Think</b> (read between the lines) to <b>You</b> (connect it to your own life).</p></div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">{items}</div>
  <div class="shot" style="max-width:360px;margin:4px auto 0"><img src="assets/lv-{lvl}-reading.png" alt=""></div>
  <div class="cap">The Reading Lab in Lesson 3: studied words glow, and tapping one shows its Arabic</div>
  </div>{foot(lvl, cfg, P["reading"])}</div>'''
    # ---- lessons, 4 per page
    unlock = {u: i + 1 for i, (n, u) in enumerate(story["parts"])} if story else {}
    ph_lesson = {2*i - 1: u for i, u in enumerate(units, 1)}
    for p in range(5):
        chunk = L[p*4:(p+1)*4]; items = []
        for d in chunk:
            n = d["number"]; review = n == len(L); cap = 12 if review else 20
            tags = []
            if review: tags.append("Big Review")
            elif n in unlock: tags.append(f"Unlocks story part {unlock[n]}")
            if n in passages: tags.append("Reading Lab")
            tag = "".join(f'<span class="tag"{GAP if i else ""}>{E(t)}</span>' for i, t in enumerate(tags))
            ar = f'<span class="ar">{E(d["titleAr"])}</span>' if d.get("titleAr") else ""
            gf = f'<div class="gf">Grammar focus: {E(d["grammarFocus"])}</div>' if d.get("grammarFocus") and (grammar_n or is_young) else ""
            ph = f'<div class="gf" style="color:var(--teal)">Phonics: {E(ph_lesson[n]["unit"])}</div>' if n in ph_lesson else ""
            items.append(f'''<div class="lesson{" review" if review else ""}"><div class="head"><div class="num">{n}</div><h3>{E(d["title"])}{ar}</h3>{tag}</div>
  <div class="goal">Goal: {E(d.get("goal",""))}</div>{gf}{ph}<div class="words">{"".join(pill(w) for w in d["vocab"][:cap])}{f'<span class="pill t">+{len(d["vocab"])-cap} more review words</span>' if len(d["vocab"]) > cap else ""}</div></div>''')
        pages[f"lessons{p}"] = f'<div class="page">{bar(f"{label} · Lessons {p*4+1}-{p*4+4}")}<div class="content">{"".join(items)}</div>{foot(lvl, cfg, P[f"lessons{p}"])}</div>'
    # ---- Bonus Classes (bonus-classes/<level>/bonusNN.json)
    if bonus:
        bitems = "".join(f'''<div class="lesson" style="padding:11px 18px;margin-bottom:9px"><div class="head"><div class="num">B{b["bonusNumber"]}</div><h3>{E(b["title"])}<span class="ar">{E(b["titleAr"])}</span></h3><span class="tag">After Lesson {b["afterLesson"]}</span></div>
  <div class="goal">{E(b["bigIdea"])}</div></div>''' for b in bonus)
        pages["bonus"] = f'''<div class="page">{bar(f"{label} · Bonus Classes")}<div class="content">
  <div class="card"><h2>Four Bonus Classes: how English works</h2><p>After every four lessons comes a {bonus_min}-minute Bonus Class. It explains how English really works &mdash; sounds, spelling, grammar or where words come from &mdash; compares it with Arabic, and practises it with games and creative tasks. At home, your child completes a bonus mission board, and each Bonus Class has its own printable worksheet and cards.</p></div>
  {bitems}
  <div class="note">The level test and certificate open after all 20 lessons and all 4 Bonus Classes.</div></div>{foot(lvl, cfg, P["bonus"])}</div>'''
    # ---- hub
    themes = "".join(f'<span class="pill o">{E(t.get("name") or t.get("title") or t.get("theme",""))}</span>' for t in hub["themes"])
    idioms = "".join(f'<li><b>{E(i.get("phrase",""))}</b> &mdash; {E(i.get("meaning",""))}</li>' for i in hub["idioms"][:3])
    patterns = len({d.get("grammarFocus") for d in L if d.get("grammarFocus")})
    third = (f'<div class="stat"><div class="n">{grammar_n}</div><div class="l">Grammar topics</div></div>' if grammar_n else
             f'<div class="stat"><div class="n">{len(units)}</div><div class="l">Phonics groups</div></div>' if units else
             f'<div class="stat"><div class="n">{patterns}</div><div class="l">Sentence patterns</div></div>')
    pages["hub"] = f'''<div class="page">{bar(f"The {cfg['name']} Hub")}<div class="content">
  <div class="card"><h2>Everything learned, ready to revisit any time</h2><p>Every word your child has met in this level, organised by theme with its picture, Arabic and audio, with a Learn mode and a quiz for each theme &mdash; plus idioms, writing and speaking practice{", a page for every grammar rule" if grammar_n else ""}{", every phonics sound and its tricky words" if units else ""}{", letter-by-letter spelling" if hub["spelling"] else ""}, the level's songs and word games. Open any time, on a phone or a computer.</p></div>
  <div class="stats"><div class="stat"><div class="n">{len(hub["themes"])}</div><div class="l">Vocabulary themes</div></div><div class="stat"><div class="n">{hub["words"]}</div><div class="l">Vocabulary words</div></div><div class="stat"><div class="n">{len(hub["idioms"])}</div><div class="l">Idioms</div></div>{third}</div>
  <div class="card"><h2>Vocabulary themes in this level</h2><div>{themes}</div></div>
  <div class="card"><h2>Sample idioms your child will discover</h2><ul>{idioms}</ul></div>
  <div class="shot" style="width:fit-content;margin:0 auto"><img src="assets/lv-{lvl}-hub.png" alt="" style="height:170px;width:auto"></div>
  <div class="cap">The English Hub for this level, as your child sees it</div>
  </div>{foot(lvl, cfg, P["hub"])}</div>'''
    # ---- printables
    fc = data["flashcards_teen" if teen else "flashcards_young"]
    writing_sheet = True   # every level has writing/<level>/lessonNN-writing.pdf (gen_printables.py)
    pages["print"] = f'''<div class="page">{bar("Printable Practice & Flashcards")}<div class="content">
  <div class="card"><h2>A printable page for every lesson</h2><p>Beyond the screen, every one of {label}'s {len(L)} lessons comes with its own homework sheet and flashcard set{", plus a writing sheet" if writing_sheet else ""}, ready to print. Each Bonus Class has a worksheet and cards too.</p></div>
  <div class="two"><div><div class="shot" style="height:300px"><img src="assets/lv-{lvl}-worksheet.png" alt=""></div><div class="cap">Lesson 1 homework sheet</div></div>
  <div><div class="shot" style="height:300px"><img src="assets/lv-{lvl}-flashcards.png" alt=""></div><div class="cap">Lesson 1 flashcards (print double-sided, flip on the long edge)</div></div></div>
  <div class="card" style="margin-top:13px"><h2>Made for home</h2><p><b>Homework and writing sheets:</b> {E(cfg["writing"])}</p><p style="margin-top:6px"><b>Flashcards:</b> {E(fc)}</p></div>
  </div>{foot(lvl, cfg, P["print"])}</div>'''
    # ---- game
    gsteps = "".join(f"<li>{E(s)}</li>" for s in cfg["game_steps"])
    pages["game"] = f'''<div class="page">{bar(f"{game} — How It Works")}<div class="content">
  <div class="card"><h2>{E(game)}, this level's game</h2><p>{E(cfg["game_desc"])}</p></div>
  <div class="two" style="align-items:start"><div class="shot"><img src="assets/lv-{lvl}-game.png" alt=""></div>
  <div class="card" style="margin:0"><h2>How to play</h2><ol>{gsteps}</ol></div></div>
  <div class="note" style="margin-top:13px">A new round of the game unlocks after every lesson your child finishes, using that lesson's own words &mdash; so it is always practice, never random. The Hub adds Memory Match, Word Pop, Word Builder and Balloon Pop for extra word practice.</div>
  </div>{foot(lvl, cfg, P["game"])}</div>'''
    # ---- level test, progress and certificate
    pages["finish"] = f'''<div class="page">{bar("Progress, Level Test & Certificate")}<div class="content">
  <div class="card"><h2>Progress you can see</h2><p>Your child's page shows every lesson: prep stars, the live class (attended, with the teacher's grade and comment) and the homework score. Totals show lessons finished, attendance, and the average teacher grade. You can open the same page at any time with your child's ID and PIN.</p></div>
  <div class="steps">
    <div class="step"><div class="n o1">1</div><div><h3>Finish the level</h3><p>All {len(L)} lessons and all {len(bonus)} Bonus Classes, each with its prep, live class and homework.</p></div></div>
    <div class="step"><div class="n o2">2</div><div><h3>Take the level test</h3><p>30 questions built from this level's own lessons: pictures, Arabic to English, sentences and listening. About 15 minutes.</p></div></div>
    <div class="step"><div class="n o3">3</div><div><h3>Pass with 70%</h3><p>Bands: Pass (70%+), Merit (80%+), Distinction (90%+). The test can be retaken, and the best score counts.</p></div></div>
    <div class="step"><div class="n o4">4</div><div><h3>Get the certificate</h3><p>With your child's name, CEFR {cfg["cefr"]}, test score and band, attendance, teacher grade and a list of what they can now do.</p></div></div>
  </div>
  <div class="card" style="margin-top:13px"><h2>What the certificate says your child can do</h2><ul>{"".join(f"<li>{E(o)}</li>" for o in cfg["outcomes"])}</ul></div>
  </div>{foot(lvl, cfg, P["finish"])}</div>'''
    # ---- back cover
    pages["back"] = f'''<div class="page back"><div class="top"><div class="lock" style="background:#fff;border-radius:18px;padding:10px 16px;display:inline-block"><img src="assets/lumio-logo.png" alt="Lumio English" style="height:96px;width:auto;display:block"></div></div>
  <h1>We're here with you every step</h1><div class="sub">Thank you for trusting Lumio English with your child's learning journey. We can't wait to see how far they'll go.</div>
  <img class="hero" src="assets/{cfg["cover_char"]}" alt="">
  <div class="contact"><div class="qr"><img src="assets/qr-website.png" alt=""></div><div><div class="k">Visit our website</div><div class="v">lumiooo.com</div><div class="h">Scan with your phone camera to open the site &mdash; the free placement test, the free trial class, every level's details and pricing.</div></div></div>
  <div class="slogan">Small Steps &middot; Big Futures</div></div>'''
    body = "".join(pages[k] for k in plan)
    return f'<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>{label} &middot; {E(cfg["name"])} Guide</title><style>{CSS}</style></head><body>{body}</body></html>'


# ---------------------------------------------------------------- curriculum guide (all levels, generated)
GUIDE_CSS = """
.ltab{width:100%;border-collapse:separate;border-spacing:0;background:#fff;border:1px solid var(--border);border-radius:14px;overflow:hidden;font-size:11px}
.ltab th{background:var(--orange-soft);color:var(--orange-dark);font-family:'Baloo 2';font-size:11.5px;text-align:left;padding:7px 10px}
.ltab td{padding:6px 10px;border-top:1px solid var(--border);color:var(--ink-soft);vertical-align:top}
.ltab td b{color:var(--cocoa)}
.lgrid{display:grid;grid-template-columns:1fr 1fr;gap:1px 14px;font-size:10.5px;line-height:1.45}
.lgrid div{display:flex;gap:7px;align-items:baseline;color:var(--ink-soft)}
.lgrid .n{font-family:'Baloo 2';font-weight:800;color:var(--orange);min-width:16px;text-align:right}
.lgrid .b{color:var(--teal);font-weight:800}
.lvhead{color:#fff;padding:20px 40px;display:flex;align-items:center;justify-content:space-between}
.lvhead h1{font-family:'Baloo 2';font-size:24px;font-weight:800;line-height:1.1}
.lvhead .meta{font-weight:800;font-size:12px;opacity:.95;margin-top:3px}
.lvp .card{padding:13px 18px}.lvp .card li,.lvp .card p{font-size:11px;line-height:1.5}.lvp .card li{margin-bottom:2px}.lvp .card h2{font-size:14.5px;margin-bottom:4px}
.lvhead img{height:92px;filter:drop-shadow(0 8px 12px rgba(0,0,0,.25))}
"""
LEVEL_COLOR = {"pre-a": "linear-gradient(120deg,#FDBA74,#F97316)", "level1": "linear-gradient(120deg,#93C5FD,#3B82F6)",
               "level2": "linear-gradient(120deg,#86EFAC,#16A34A)", "level3": "linear-gradient(120deg,#C4B5FD,#7C3AED)",
               "level4": "linear-gradient(120deg,#5EEAD4,#0D9488)", "level5": "linear-gradient(120deg,#FDA4AF,#E11D48)",
               "level6": "linear-gradient(120deg,#FCD34D,#B45309)"}


def gfoot(n):
    return f'<div class="foot"><span>Lumio English &middot; Curriculum Guide</span><span>{n}</span></div>'


def build_guide(data, st, gm):
    info = {}
    for lvl in LEVELS:
        L = lessons(lvl); hub = hub_counts(lvl)
        info[lvl] = dict(L=L, hub=hub, cfg=data[lvl], bonus=bonus_classes(lvl), units=phonics_units(lvl), reading=reading_passages(lvl),
                         words=sum(len(d["vocab"]) for d in L))
    total_words = sum(v["words"] for v in info.values())
    total_classes = sum(len(v["L"]) + len(v["bonus"]) for v in info.values())
    pages = []
    n = lambda: len(pages) + 1
    # cover
    pages.append(f'''<div class="page cover">
  <div class="top"><div class="lock"><img src="assets/lumio-logo.png" alt=""></div></div>
  <div class="badge">Complete Curriculum Guide</div><h1>7 Levels. One Journey. Real English.</h1>
  <div class="sub">From First Words to Looking Ahead &middot; Ages 4&ndash;15 &middot; CEFR Pre-A1 to A2</div>
  <div class="stats"><span>7 Levels</span><span>{total_classes} Live Classes</span><span>{total_words:,} Lesson Words</span><span>Full Arabic Support</span></div>
  <img class="hero" src="assets/lumi-hero.png" alt="">
  <div class="bubble">Hi! I'm Lumi. This guide shows exactly what your child learns, in what order, and why.</div></div>''')
    # welcome + the path
    rows = "".join(f'<tr><td><b>{LEVEL_LABEL[l]}</b></td><td><b>{E(info[l]["cfg"]["name"])}</b></td><td>{info[l]["cfg"]["ages"]}</td><td>{info[l]["cfg"]["cefr"]}</td>'
                   f'<td>{len(info[l]["L"])} + {len(info[l]["bonus"])}</td><td>{info[l]["words"]}</td></tr>' for l in LEVELS)
    pages.append(f'''<div class="page">{bar("Welcome to Lumio")}<div class="content">
  <div class="card"><h2>A complete English course for Arabic-speaking children</h2><p>Lumio English takes a child from their very first English word (age 4) to real conversation, reading and writing (age 15) in seven levels. Every level is taught live by a real teacher on Microsoft Teams, in small groups of up to four students at the same level, and every level is supported by an app with prep, homework, games, stories and the English Hub. Arabic is built in from the start: every word, instruction and grammar rule has its Arabic alongside it.</p></div>
  <div class="card"><h2>Built on the CEFR</h2><p>Each level maps to a stage of the CEFR (Common European Framework of Reference for Languages), the international standard used by schools and exams worldwide, so progress at Lumio means something outside Lumio too.</p></div>
  <table class="ltab"><tr><th>Level</th><th>Name</th><th>Ages</th><th>CEFR</th><th>Lessons + Bonus</th><th>Words</th></tr>{rows}</table>
  <div class="note" style="margin-top:13px">Every level = 24 live classes (20 lessons + 4 Bonus Classes), about 3 months at 2&ndash;3 classes a week. The free placement test finds the right starting level.</div>
  </div>{gfoot(n())}</div>''')
    # principles
    pages.append(f'''<div class="page">{bar("How the curriculum is built")}<div class="content">
  <div class="card"><h2>Three goals in every level</h2><ul>
    <li><b>Speak with real confidence</b> &mdash; language your child can use in the moment, not memorised phrases.</li>
    <li><b>Understand real, connected English</b> &mdash; through dialogues, stories and reading texts, not word lists.</li>
    <li><b>Build on what came before</b> &mdash; every level assumes and reinforces everything already learned.</li></ul></div>
  <div class="card"><h2>A spiral, not a straight line</h2><p>Big topics &mdash; family, food, school, routines, feelings &mdash; come back in later levels with richer words and harder grammar. Review lessons mix old words with new ones on the same themes, so review is still real learning.</p></div>
  <div class="card"><h2>Two tracks, one journey</h2><p><b>Kids track (Pre-A to Level 2, ages 4&ndash;10):</b> letters and sounds, a full phonics course, first sentence patterns, songs, movement and picture games, with Lumi, Omar, Sara and Noor.<br><b>Teen track (Levels 3&ndash;6, ages 10&ndash;15):</b> one grammar point per lesson, real dialogues between the Crew (with Ziad and Hamad joining), reading, discussion and debate, in a design made for teenagers.</p></div>
  <div class="card"><h2>Made for Arabic speakers</h2><p>The course knows where Arabic speakers struggle: sounds Arabic doesn't have (p, v), vowels, consonant clusters ("isport"), word order, the verb "to be", and he/she/it -s. Every grammar point has a Common Mistakes slide, and the Bonus Classes compare English with Arabic directly.</p></div>
  </div>{gfoot(n())}</div>''')
    # learning cycle + lesson shape
    pages.append(f'''<div class="page">{bar("The learning cycle")}<div class="content">
  <div class="steps">
    <div class="step"><div class="n o1">1</div><div><h3>Prepare in the app</h3><p>New words with pictures, Arabic and audio before class, earning stars.</p></div></div>
    <div class="step"><div class="n o2">2</div><div><h3>Live class on Teams</h3><p>A real teacher, up to four classmates at the same level and lesson, and a supervisor.</p></div></div>
    <div class="step"><div class="n o3">3</div><div><h3>Homework</h3><p>Spelling, Say It, drawing or a talk task, a phonics or grammar step and a quiz, plus printable sheets and flashcards.</p></div></div>
    <div class="step"><div class="n o4">4</div><div><h3>Grow on the map</h3><p>A lesson is done after prep + live class + homework; then the next stop, the story and the game unlock.</p></div></div>
  </div>
  <div class="two" style="margin-top:13px">
   <div class="card"><h2>A kids' class (Pre-A&ndash;Level 2)</h2><ol><li>Warm-up and quick recap</li><li>Letters and sounds (Pre-A) or Phonics Time with a decodable story (Levels 1&ndash;2)</li><li>Grammar Time and Common Mistakes, when a pattern is new</li><li>New words with picture, Arabic and voice</li><li>Build the Sentences and a dialogue</li><li>Reading Lab (Level 2, every third lesson)</li><li>Games: Memory Match, Sound &amp; Spot, Mystery Picture, quiz</li><li>Today I Learned</li></ol></div>
   <div class="card"><h2>A teen class (Levels 3&ndash;6)</h2><ol><li>Hook question</li><li>Crew Talk: a recorded dialogue</li><li>Grammar Time: pattern, rule, practice, 10 checks, Common Mistakes</li><li>New words, then 10 vocabulary checks</li><li>Describe It and Build the Sentences</li><li>Reading Lab (every third lesson)</li><li>Story Chain, Your Turn, Two Truths &amp; a Lie</li><li>Challenge, real life, 5-minute discussion, recap</li></ol></div>
  </div>
  <div class="note">Lessons run 45&ndash;90 minutes: shorter at the start of a level and the full 90 minutes for the Big Review in Lesson 20. Bonus Classes run 60 minutes (45 in Pre-A).</div>
  </div>{gfoot(n())}</div>''')
    # skill strands
    rows = []
    for l in LEVELS:
        v = info[l]
        sounds = f'{len(v["units"])} phonics groups' if v["units"] else ("Letters A&ndash;Z and their sounds" if l == "pre-a" else "&mdash;")
        gram = f'{len(v["hub"]["grammar"])} grammar topics' if v["hub"]["grammar"] else "Sentence patterns"
        read = f'{len(v["reading"])} Reading Lab texts' if v["reading"] else ("Decodable stories" if v["units"] else "Picture words")
        write = "Trace, copy, draw" if l in ("pre-a", "level1") else ("Copy + talk about it" if l == "level2" else "Own sentences with the lesson's grammar")
        rows.append(f'<tr><td><b>{LEVEL_LABEL[l]}</b></td><td>{sounds}</td><td>{gram}</td><td>{read}</td><td>{write}</td></tr>')
    pages.append(f'''<div class="page">{bar("Skills, level by level")}<div class="content">
  <table class="ltab"><tr><th>Level</th><th>Sounds</th><th>Grammar</th><th>Reading</th><th>Writing</th></tr>{"".join(rows)}</table>
  <div class="card" style="margin-top:13px"><h2>Phonics (Levels 1&ndash;2)</h2><p>Systematic synthetic phonics: Level 1 teaches every single letter sound (starting with s, a, t, p so children read real words from lesson one), Level 2 teaches sh/ch/th/ng, blends, magic e, vowel teams and vowels with r. Every practice word and story uses only sounds already taught, and tricky words come one to three at a time.</p></div>
  <div class="card"><h2>Reading Lab (Levels 2&ndash;6)</h2><p>Six illustrated texts per level, in Lessons 3, 6, 9, 12, 15 and 18, set in places children know (the majlis, AlUla, Riyadh Season, Eid). The teacher reads the first part, students read the second; studied words glow and show their Arabic, and six questions move from <b>Find it</b> to <b>Think</b> to <b>You</b>.</p></div>
  </div>{gfoot(n())}</div>''')
    # bonus classes overview
    brows = "".join(f'<tr><td><b>{LEVEL_LABEL[l]}</b></td>' + "".join(f'<td>{E(b["title"])}</td>' for b in info[l]["bonus"]) + '</tr>' for l in LEVELS)
    pages.append(f'''<div class="page">{bar("Bonus Classes: how English works")}<div class="content">
  <div class="card"><h2>Four Bonus Classes in every level</h2><p>After Lessons 4, 8, 12 and 16 comes a Bonus Class that steps back and explains <i>how English works</i> &mdash; its sounds, spelling, grammar and history &mdash; and compares it with Arabic. Each one has games and creative tasks in class, a bonus mission board at home, and its own printable worksheet and cards. They are part of the level: the level test and certificate need all four.</p></div>
  <table class="ltab" style="font-size:10.5px"><tr><th>Level</th><th>After Lesson 4</th><th>After Lesson 8</th><th>After Lesson 12</th><th>After Lesson 16</th></tr>{brows}</table>
  <div class="shot" style="max-width:250px;margin:10px auto 0"><img src="assets/hb-bonus.png" alt=""></div>
  <div class="cap">A real Bonus Class slide (Level 1): the vowel sounds, with a gesture for each</div>
  </div>{gfoot(n())}</div>''')
    # one page per level
    for l in LEVELS:
        v = info[l]; cfg = v["cfg"]; teen = cfg["track"] == "teen"
        ph = {2*i - 1: u for i, u in enumerate(v["units"], 1)}
        cells = []
        for d in v["L"]:
            marks = []
            if d["number"] in ph: marks.append("phonics")
            if d["number"] in v["reading"]: marks.append("reading")
            m = f' <span class="b">&middot; {", ".join(marks)}</span>' if marks else ""
            cells.append(f'<div><span class="n">{d["number"]}</span><span>{E(d["title"])}{m}</span></div>')
        order = [cells[i // 2 + (i % 2) * 10] for i in range(20)] if len(cells) == 20 else cells
        bon = "".join(f'<div><span class="n">B{b["bonusNumber"]}</span><span>{E(b["title"])}</span></div>' for b in v["bonus"])
        extra = ""
        if v["units"]:
            extra = '<p style="margin-top:6px"><b>Phonics:</b> ' + " &middot; ".join(E(u["unit"]) for u in v["units"]) + "</p>"
        if v["reading"]:
            extra += '<p style="margin-top:6px"><b>Reading Lab:</b> ' + " &middot; ".join(E(p["title"]) for _, p in sorted(v["reading"].items())) + "</p>"
        stat = f'{len(v["hub"]["grammar"])} grammar topics' if v["hub"]["grammar"] else (f'{len(v["units"])} phonics groups' if v["units"] else "letters &amp; sounds")
        pages.append(f'''<div class="page"><div class="lvhead" style="background:{LEVEL_COLOR[l]}"><div><h1>{LEVEL_LABEL[l]} &middot; {E(cfg["name"])}</h1>
  <div class="meta">Ages {cfg["ages"]} &middot; CEFR {cfg["cefr"]} &middot; 20 lessons + 4 Bonus Classes &middot; {v["words"]} words &middot; {stat} &middot; game: {E(gm[l])}</div></div>
  <img src="assets/{cfg["cover_char"]}" alt=""></div><div class="content lvp" style="padding-top:16px">
  <div class="two"><div class="card" style="margin:0"><h2>By the end, your child can:</h2><ul>{"".join(f"<li>{E(o)}</li>" for o in cfg["outcomes"])}</ul></div>
  <div class="card" style="margin:0"><h2>In this level</h2><p>{E(cfg["intro"])}</p>{extra}</div></div>
  <div class="card" style="margin-top:13px"><h2>The 20 lessons</h2><div class="lgrid">{"".join(order)}</div>
  <h2 style="margin-top:10px">Bonus Classes</h2><div class="lgrid">{bon}</div></div>
  </div>{gfoot(n())}</div>''')
    # hub + games
    hrows = "".join(f'<tr><td><b>{LEVEL_LABEL[l]}</b></td><td>{len(info[l]["hub"]["themes"])}</td><td>{info[l]["hub"]["words"]}</td><td>{len(info[l]["hub"]["idioms"])}</td>'
                    f'<td>{len(info[l]["hub"]["grammar"]) if info[l]["hub"]["grammar"] else ("phonics: " + str(len(info[l]["units"])) if info[l]["units"] else "spelling")}</td><td>{E(gm[l])}</td></tr>' for l in LEVELS)
    pages.append(f'''<div class="page">{bar("The English Hub & games")}<div class="content">
  <div class="card"><h2>A library of English, open any time</h2><p>Every level has its own English Hub on phone or computer: every word by theme with picture, Arabic and audio (Learn mode and a quiz), idioms, writing and speaking prompts (type or record), grammar rules (Levels 3&ndash;6), phonics sounds and tricky words (Levels 1&ndash;2), spelling (Pre-A), the level's songs and four word games.</p></div>
  <table class="ltab"><tr><th>Level</th><th>Themes</th><th>Hub words</th><th>Idioms</th><th>Grammar / sounds</th><th>Level game</th></tr>{hrows}</table>
  <div class="two" style="margin-top:13px;align-items:start"><div class="shot" style="width:fit-content;margin:0 auto"><img src="assets/hb-hub.png" alt="" style="height:240px;width:auto"></div>
  <div class="card" style="margin:0"><h2>A game for every level</h2><p>Each level has its own game built from that level's words and sentences. A new round unlocks after every lesson your child finishes, so the game is always practice of what was just taught. Inside lessons there are many more: Flash Race, Memory Match, Mystery Picture, Describe It, Story Chain and more.</p></div></div>
  </div>{gfoot(n())}</div>''')
    # stories + test & certificate
    srows = "".join(f'<p style="margin-top:5px"><b>{LEVEL_LABEL[l]} &mdash; &ldquo;{E(st[l]["title"])}&rdquo;:</b> ' + " &middot; ".join(f"{i+1}. {E(p)}" for i, (p, _) in enumerate(st[l]["parts"])) + "</p>" for l in LEVELS if l in st)
    pages.append(f'''<div class="page">{bar("Stories, level test & certificate")}<div class="content">
  <div class="card"><h2>Illustrated stories that unlock</h2><p>Pre-A to Level 3 each have a four-part illustrated story, told in that level's own words and read aloud with each word lighting up. Part 1 opens after Lesson 5, then Lessons 10, 15 and 20.</p>{srows}</div>
  <div class="card"><h2>Level test</h2><p>After all 20 lessons and 4 Bonus Classes, your child takes a 30-question test built from the level's own lessons (pictures, Arabic to English, sentences, listening), about 15 minutes. Pass mark 70%; Merit from 80%, Distinction from 90%. It can be retaken, and the best score counts.</p></div>
  <div class="card"><h2>Certificate</h2><p>A certificate with your child's name, level, CEFR stage, test score and band, attendance, the teacher's average grade and a list of what they can now do &mdash; ready to print or save as PDF.</p></div>
  <div class="note">Free to start: the placement test (about 8 minutes, listening, reading and writing) and a free trial class, in a group or one-on-one, before any payment.</div>
  </div>{gfoot(n())}</div>''')
    pages.append(f'''<div class="page back"><div class="top"><div class="lock" style="background:#fff;border-radius:18px;padding:10px 16px;display:inline-block"><img src="assets/lumio-logo.png" alt="Lumio English" style="height:96px;width:auto;display:block"></div></div>
  <h1>We're here with you every step</h1><div class="sub">Thank you for trusting Lumio English with your child's learning journey. We can't wait to see how far they'll go.</div>
  <img class="hero" src="assets/lumi-welcome-hero.png" alt="">
  <div class="contact"><div class="qr"><img src="assets/qr-website.png" alt=""></div><div><div class="k">Visit our website</div><div class="v">lumiooo.com</div><div class="h">Scan with your phone camera to open the site &mdash; the free placement test, the free trial class, every level's details and pricing.</div></div></div>
  <div class="slogan">Small Steps &middot; Big Futures</div></div>''')
    return f'<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Lumio English &middot; Curriculum Guide</title><style>{CSS}{GUIDE_CSS}</style></head><body>{"".join(pages)}</body></html>'


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
            open(f"{SRC}/curriculum_guide.html", "w", encoding="utf-8").write(build_guide(data, st, gm))
            render(b, f"{SRC}/curriculum_guide.html", "manuals/Lumio_English_Curriculum_Guide.pdf", 662, 941)
        for lvl in want_levels:
            html_path = f"{SRC}/level_{lvl}.html"
            open(html_path, "w", encoding="utf-8").write(build_level(lvl, data[lvl], data, st.get(lvl), gm[lvl]))
            render(b, html_path, f"manuals/Lumio_English_{PDF_NAME[lvl]}_Manual.pdf", 662, 941)
        b.close()


if __name__ == "__main__":
    main()
