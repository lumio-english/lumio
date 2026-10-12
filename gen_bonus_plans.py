#!/usr/bin/env python3
"""Bonus Classes: check the data and write printable teacher plans.

Reads bonus-classes/<level>/bonusNN.json (schema = bonus-classes/level1/bonus01.json)
and writes teacher-guide/bonus/index.html + teacher-guide/bonus/<level>-bonusNN.html.

    python3 gen_bonus_plans.py            # check + build everything
    python3 gen_bonus_plans.py --check    # check only

A level has 24 classes: Lessons 1-20 plus Bonus Classes 1-4 after Lessons 4, 8, 12, 16.
"""
import glob
import html
import json
import os
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, "bonus-classes")
OUT = os.path.join(ROOT, "teacher-guide", "bonus")

LEVELS = ["pre-a", "level1", "level2", "level3", "level4", "level5", "level6"]
LEVEL_NAMES = {
    "pre-a": "Pre-A · First Words", "level1": "Level 1 · About Me", "level2": "Level 2 · My World",
    "level3": "Level 3 · Everyday Life", "level4": "Level 4 · Smart Choices",
    "level5": "Level 5 · Telling My Story", "level6": "Level 6 · Looking Ahead",
}
AFTER_LESSON = {1: 4, 2: 8, 3: 12, 4: 16}
CLASS_MINUTES = 60

REQUIRED = ["id", "level", "bonusNumber", "label", "afterLesson", "classPosition", "durationMinutes",
            "ages", "strand", "strandAr", "skillFocus", "title", "titleAr", "bigIdea", "bigIdeaAr",
            "builtOn", "objectives", "keyTerms", "linguisticsCorner", "arabicBridge", "commonErrors",
            "materials", "stages", "exitTicket", "homework", "differentiation", "assessment", "teacherNotes"]
STAGE_REQUIRED = ["minutes", "name", "nameAr", "method", "purpose", "teacherSays", "teacherSaysAr",
                  "studentsDo", "tips"]


def sequence():
    """The 24-class order of a level: [("lesson", 1), ..., ("bonus", 1), ...]."""
    seq = []
    for n in range(1, 21):
        seq.append(("lesson", n))
        for b, after in AFTER_LESSON.items():
            if after == n:
                seq.append(("bonus", b))
    return seq


def check(d, path):
    errs = []
    for k in REQUIRED:
        if k not in d:
            errs.append(f"missing '{k}'")
    if errs:
        return errs
    level = os.path.basename(os.path.dirname(path))
    b = d["bonusNumber"]
    if d["level"] != level:
        errs.append(f"level '{d['level']}' but folder '{level}'")
    if d["id"] != f"{level}-bonus{b:02d}":
        errs.append(f"id should be {level}-bonus{b:02d}")
    if os.path.basename(path) != f"bonus{b:02d}.json":
        errs.append("file name does not match bonusNumber")
    if d["afterLesson"] != AFTER_LESSON.get(b):
        errs.append(f"afterLesson should be {AFTER_LESSON.get(b)}")
    if d["classPosition"] != sequence().index(("bonus", b)) + 1:
        errs.append(f"classPosition should be {sequence().index(('bonus', b)) + 1}")
    if d["durationMinutes"] != CLASS_MINUTES:
        errs.append("durationMinutes must be 60")
    total = sum(s.get("minutes", 0) for s in d["stages"])
    if total != CLASS_MINUTES:
        errs.append(f"stages add up to {total} minutes, not 60")
    for i, s in enumerate(d["stages"], 1):
        for k in STAGE_REQUIRED:
            if k not in s:
                errs.append(f"stage {i} missing '{k}'")
        ex = s.get("exercise")
        if ex is not None:
            for k in ("type", "instructions", "items"):
                if k not in ex:
                    errs.append(f"stage {i} exercise missing '{k}'")
            for it in ex.get("items", []):
                if "prompt" not in it or "answer" not in it:
                    errs.append(f"stage {i} exercise item without prompt/answer")
                    break
    if not d["exitTicket"].get("items"):
        errs.append("exit ticket has no items")
    return errs


def load_all():
    classes, problems = {}, []
    for level in LEVELS:
        for path in sorted(glob.glob(os.path.join(SRC, level, "bonus*.json"))):
            rel = os.path.relpath(path, ROOT)
            try:
                with open(path, encoding="utf-8") as f:
                    d = json.load(f)
            except ValueError as e:
                problems.append(f"{rel}: not valid JSON ({e})")
                continue
            errs = check(d, path)
            problems += [f"{rel}: {e}" for e in errs]
            if not errs:
                classes.setdefault(level, []).append(d)
    return classes, problems


# ---------------------------------------------------------------- HTML
e = lambda s: html.escape(str(s))

CSS = """
:root{--o:var(--lumio-orange,#F97316);--od:var(--lumio-orange-dark,#C2530A);--os:var(--lumio-orange-soft,#FFF1E0);
--sun:var(--lumio-sun-soft,#FFF3D6);--teal:var(--lumio-teal,#0D9488);--ts:var(--lumio-teal-soft,#E6FAF7);
--blue:var(--lumio-blue,#1E4FA3);--bs:var(--lumio-blue-soft,#E8EFFB);--coral:var(--lumio-coral,#F43F5E);
--cs:var(--lumio-coral-soft,#FCEBEA);--ink:var(--lumio-ink,#2A2118);--soft:var(--lumio-ink-soft,#6B5040);
--muted:var(--lumio-muted,#8A7160);--line:var(--lumio-border,#EAE3D8);--paper:var(--lumio-paper,#FFFBF5)}
*{box-sizing:border-box}
body{margin:0;background:var(--paper);color:var(--ink);font:15px/1.55 "Nunito","Segoe UI",system-ui,sans-serif}
.ar{font-family:"Cairo","Segoe UI",Tahoma,sans-serif;direction:rtl;text-align:right;unicode-bidi:isolate}
main{max-width:980px;margin:0 auto;padding:24px 16px 64px}
a{color:var(--od)}
header.top{display:flex;align-items:center;gap:14px;margin-bottom:18px}
header.top img{height:46px}
header.top .crumb{color:var(--muted);font-size:.9rem}
.hero{background:linear-gradient(135deg,#FB923C,#F97316 55%,#F59E0B);color:#fff;border-radius:22px;padding:24px 26px;margin-bottom:18px}
.hero .tag{display:inline-block;background:rgba(255,255,255,.22);border-radius:999px;padding:3px 12px;font-weight:800;font-size:.8rem;margin:0 6px 8px 0}
.hero h1{margin:4px 0 6px;font-size:1.75rem;line-height:1.2}
.hero .ar{font-size:1.15rem;opacity:.95}
.hero .big{margin-top:12px;background:rgba(255,255,255,.16);border-radius:14px;padding:10px 14px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px;margin-bottom:14px}
.card{background:#fff;border:1px solid var(--line);border-radius:18px;padding:16px 18px;margin-bottom:14px;break-inside:avoid}
.card h2{margin:0 0 10px;font-size:1.1rem;color:var(--od)}
.card h3{margin:12px 0 6px;font-size:.98rem}
ul{margin:4px 0;padding-left:20px}
li{margin:3px 0}
.pair{display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:start}
.pair>div{min-width:0}
table{width:100%;border-collapse:collapse;font-size:.92rem}
th,td{border-bottom:1px solid var(--line);padding:6px 8px;text-align:left;vertical-align:top}
th{background:var(--os);color:var(--od);font-weight:800}
td.ar,th.ar{text-align:right}
.timeline{display:flex;border-radius:12px;overflow:hidden;margin:6px 0 4px;border:1px solid var(--line)}
.timeline div{padding:6px 4px;font-size:.72rem;font-weight:800;text-align:center;color:#fff;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.stage{border-left:6px solid var(--o)}
.stage .head{display:flex;justify-content:space-between;gap:10px;align-items:baseline;flex-wrap:wrap}
.stage .min{background:var(--o);color:#fff;border-radius:999px;padding:2px 12px;font-weight:800;white-space:nowrap}
.meta{color:var(--soft);font-size:.9rem;margin:4px 0 8px}
.say{background:var(--sun);border-radius:12px;padding:8px 12px;margin:6px 0}
.say p{margin:4px 0}
.do{background:var(--ts);border-radius:12px;padding:8px 12px;margin:6px 0}
.ex{background:var(--bs);border-radius:12px;padding:8px 12px;margin:6px 0}
.ex ol{margin:6px 0;padding-left:22px}
.ans{color:var(--teal);font-weight:800}
.tips{color:var(--soft);font-size:.9rem}
.err td:first-child{color:var(--coral);text-decoration:line-through}
.err td:nth-child(2){color:var(--teal);font-weight:800}
.lv h2{display:flex;justify-content:space-between;align-items:baseline}
.seq{display:flex;flex-wrap:wrap;gap:4px;margin:8px 0 12px}
.seq span{border-radius:8px;padding:3px 7px;font-size:.75rem;font-weight:800;background:#F1ECE2;color:var(--soft)}
.seq span.b{background:var(--o);color:#fff}
.clist a{display:block;padding:10px 12px;border:1px solid var(--line);border-radius:12px;margin:6px 0;text-decoration:none;color:var(--ink);background:#fff}
.clist a:hover{border-color:var(--o)}
.clist .ar{display:block}
.clist small{color:var(--muted)}
.btn{display:inline-block;background:var(--o);color:#fff;border-radius:999px;padding:6px 14px;font-weight:800;text-decoration:none;border:0;cursor:pointer;font:inherit}
@media (max-width:640px){.pair{grid-template-columns:1fr}.hero h1{font-size:1.4rem}}
@media print{body{background:#fff;font-size:12px}main{max-width:none;padding:0}.noprint{display:none}
.hero{-webkit-print-color-adjust:exact;print-color-adjust:exact}.card{page-break-inside:avoid}}
"""

STAGE_COLOURS = ["#F97316", "#0D9488", "#1E4FA3", "#F59E0B", "#F43F5E", "#22C55E", "#8B5CF6", "#C2530A"]


def page(title, body, depth="../../"):
    return f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{e(title)}</title>
<link rel="icon" href="{depth}favicon.ico">
<link rel="stylesheet" href="{depth}css/brand.css">
<style>{CSS}</style></head>
<body><main>
<header class="top"><img src="{depth}assets/logo/lumio-logo.png" alt="Lumio English">
<div class="crumb"><a href="index.html">Bonus Classes</a> · Teacher plans</div>
<button class="btn noprint" style="margin-left:auto" onclick="print()">Print</button></header>
{body}
</main></body></html>
"""


def bullets(items):
    return "<ul>" + "".join(f"<li>{e(x)}</li>" for x in items) + "</ul>"


def ar_bullets(items):
    return '<ul class="ar">' + "".join(f"<li>{e(x)}</li>" for x in items) + "</ul>"


def exercise_html(ex):
    out = [f'<div class="ex"><b>Exercise · {e(ex.get("type", ""))}</b> — {e(ex.get("instructions", ""))}']
    if ex.get("instructionsAr"):
        out.append(f'<div class="ar">{e(ex["instructionsAr"])}</div>')
    out.append("<ol>")
    for it in ex.get("items", []):
        out.append(f'<li>{e(it["prompt"])} → <span class="ans">{e(it["answer"])}</span></li>')
    out.append("</ol></div>")
    return "".join(out)


def class_page(d):
    lvname = LEVEL_NAMES.get(d["level"], d["level"])
    h = []
    h.append(f"""<section class="hero">
<span class="tag">{e(lvname)}</span><span class="tag">{e(d['label'])}</span>
<span class="tag">Class {d['classPosition']} of 24 · after Lesson {d['afterLesson']}</span>
<span class="tag">{d['durationMinutes']} minutes · ages {e(d['ages'])}</span>
<span class="tag">{e(d['strand'])} · <span class="ar">{e(d['strandAr'])}</span></span>
<h1>{e(d['title'])}</h1><div class="ar">{e(d['titleAr'])}</div>
<div class="big"><b>Big idea:</b> {e(d['bigIdea'])}<div class="ar">{e(d['bigIdeaAr'])}</div></div>
</section>""")

    # timeline
    bar = []
    for i, s in enumerate(d["stages"]):
        bar.append(f'<div style="flex:{s["minutes"]};background:{STAGE_COLOURS[i % len(STAGE_COLOURS)]}" '
                   f'title="{e(s["name"])}">{s["minutes"]}′ {e(s["name"].split(":")[0])}</div>')
    h.append('<div class="card"><h2>The 60 minutes</h2><div class="timeline">' + "".join(bar) + "</div>")
    h.append('<table><tr><th>Min</th><th>Stage</th><th>Method</th></tr>')
    t = 0
    for s in d["stages"]:
        h.append(f'<tr><td>{t}–{t + s["minutes"]}</td><td>{e(s["name"])}</td><td>{e(s["method"])}</td></tr>')
        t += s["minutes"]
    h.append("</table></div>")

    obj = "".join(f'<tr><td>{e(o["en"])}</td><td class="ar">{e(o["ar"])}</td></tr>' for o in d["objectives"])
    h.append(f'<div class="grid"><div class="card"><h2>Objectives</h2><table>{obj}</table></div>'
             f'<div class="card"><h2>Builds on</h2>{bullets(d["builtOn"])}'
             f'<h3>Skill focus</h3><p>{e(", ".join(d["skillFocus"]))}</p></div></div>')

    lc = d["linguisticsCorner"]
    facts = "".join(f'<tr><td>{e(f["en"])}</td><td class="ar">{e(f["ar"])}</td></tr>' for f in lc["facts"])
    terms = "".join(f'<tr><td><b>{e(k["term"])}</b></td><td class="ar">{e(k["ar"])}</td><td>{e(k["meaning"])}</td></tr>'
                    for k in d["keyTerms"])
    h.append(f'<div class="card"><h2>Linguistics Corner — {e(lc["title"])} <span class="ar" style="font-weight:600">· {e(lc.get("titleAr", ""))}</span></h2>'
             f'<table>{facts}</table><h3>Key terms</h3><table><tr><th>Term</th><th class="ar">بالعربية</th><th>Meaning</th></tr>{terms}</table></div>')

    br = "".join(f'<tr><td><b>{e(b["english"])}</b></td><td class="ar">{e(b["arabic"])}</td><td>{e(b["point"])}'
                 f'<div class="ar">{e(b.get("pointAr", ""))}</div></td></tr>' for b in d["arabicBridge"])
    h.append(f'<div class="card"><h2>Arabic Bridge</h2><table><tr><th>English</th><th class="ar">العربية</th><th>What to notice</th></tr>{br}</table></div>')

    er = "".join(f'<tr><td>{e(x["wrong"])}</td><td>{e(x["right"])}</td><td>{e(x["why"])}</td></tr>' for x in d["commonErrors"])
    h.append(f'<div class="card err"><h2>Common errors of Arabic speakers</h2><table><tr><th>Student says</th><th>Correct</th><th>Why</th></tr>{er}</table></div>')

    m = d["materials"]
    h.append(f'<div class="grid"><div class="card"><h2>Teacher needs</h2>{bullets(m.get("teacher", []))}</div>'
             f'<div class="card"><h2>Students need at home</h2>{bullets(m.get("student", []))}</div></div>')

    t = 0
    for i, s in enumerate(d["stages"], 1):
        col = STAGE_COLOURS[(i - 1) % len(STAGE_COLOURS)]
        part = [f'<div class="card stage" style="border-left-color:{col}"><div class="head"><h2 style="color:{col}">'
                f'{i}. {e(s["name"])}</h2><span class="min" style="background:{col}">{t}–{t + s["minutes"]} min</span></div>']
        t += s["minutes"]
        part.append(f'<div class="ar">{e(s["nameAr"])}</div>')
        part.append(f'<div class="meta"><b>Method:</b> {e(s["method"])}<br><b>Purpose:</b> {e(s["purpose"])}</div>')
        part.append('<div class="say"><b>Teacher says</b>' + "".join(f"<p>“{e(x)}”</p>" for x in s["teacherSays"]))
        if s.get("teacherSaysAr"):
            part.append(ar_bullets(s["teacherSaysAr"]))
        part.append("</div>")
        part.append(f'<div class="do"><b>Students do</b>{bullets(s["studentsDo"])}</div>')
        if s.get("exercise"):
            part.append(exercise_html(s["exercise"]))
        if s.get("tips"):
            part.append(f'<div class="tips"><b>Tips:</b>{bullets(s["tips"])}</div>')
        part.append("</div>")
        h.append("".join(part))

    et = d["exitTicket"]
    h.append('<div class="card"><h2>Exit ticket</h2>' + exercise_html({"type": "exit ticket", **et}) + "</div>")
    hw = d["homework"]
    h.append(f'<div class="card"><h2>Homework</h2><p>{e(hw["en"])}</p><p class="ar">{e(hw["ar"])}</p>{bullets(hw.get("tasks", []))}</div>')
    df = d["differentiation"]
    h.append(f'<div class="grid"><div class="card"><h2>Support</h2>{bullets(df.get("support", []))}</div>'
             f'<div class="card"><h2>Challenge</h2>{bullets(df.get("challenge", []))}</div></div>')
    a = d["assessment"]
    h.append(f'<div class="grid"><div class="card"><h2>Success criteria</h2>{bullets(a.get("successCriteria", []))}</div>'
             f'<div class="card"><h2>Watch for</h2>{bullets(a.get("watchFor", []))}</div></div>')
    h.append(f'<div class="card"><h2>Teacher notes</h2>{bullets(d["teacherNotes"])}</div>')
    return page(f"{d['label']} · {lvname}", "\n".join(h))


def index_page(classes):
    seq = "".join(f'<span class="b">B{n}</span>' if k == "bonus" else f"<span>L{n}</span>" for k, n in sequence())
    h = ["""<section class="hero"><span class="tag">Design · not live yet</span>
<h1>Bonus Classes</h1><div class="ar">الحصص الإضافية</div>
<div class="big">Every level = 24 classes: 20 lessons + 4 Bonus Classes (one after every 4 lessons).
About 3 months per level at 2-3 classes a week. Each Bonus Class is 60 minutes and teaches how English works.
<div class="ar">كل مستوى = 24 حصة: 20 درساً + 4 حصص إضافية (واحدة بعد كل 4 دروس). نحو 3 أشهر للمستوى بمعدل حصتين إلى ثلاث أسبوعياً.</div></div></section>""",
         f'<div class="card"><h2>Order of classes in every level</h2><div class="seq">{seq}</div></div>']
    for level in LEVELS:
        cs = classes.get(level, [])
        if not cs:
            continue
        cs.sort(key=lambda d: d["bonusNumber"])
        links = "".join(
            f'<a href="{level}-bonus{d["bonusNumber"]:02d}.html"><b>{e(d["label"])}: {e(d["title"])}</b><br>'
            f'<span class="ar">{e(d["titleAr"])}</span><br><small>Class {d["classPosition"]} · after Lesson {d["afterLesson"]} · '
            f'{e(", ".join(d["skillFocus"]))}</small></a>' for d in cs)
        h.append(f'<div class="card lv"><h2><span>{e(LEVEL_NAMES[level])}</span><small>{e(cs[0]["strand"])} · ages {e(cs[0]["ages"])}</small></h2>'
                 f'<div class="clist">{links}</div></div>')
    return page("Bonus Classes · Teacher plans", "\n".join(h))


def main():
    classes, problems = load_all()
    n = sum(len(v) for v in classes.values())
    if problems:
        print("PROBLEMS:")
        for p in problems:
            print("  " + p)
    print(f"{n} bonus classes OK" + (f", {len(problems)} problems" if problems else ""))
    if "--check" in sys.argv:
        sys.exit(1 if problems else 0)
    os.makedirs(OUT, exist_ok=True)
    for level, cs in classes.items():
        for d in cs:
            with open(os.path.join(OUT, f"{level}-bonus{d['bonusNumber']:02d}.html"), "w", encoding="utf-8") as f:
                f.write(class_page(d))
    with open(os.path.join(OUT, "index.html"), "w", encoding="utf-8") as f:
        f.write(index_page(classes))
    print(f"wrote {n} plans + index to {os.path.relpath(OUT, ROOT)}/")
    sys.exit(1 if problems else 0)


if __name__ == "__main__":
    main()
