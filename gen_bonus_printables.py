#!/usr/bin/env python3
"""Bonus Class printables: bonus-classes/<level>/bonusNN.json -> "printables".

    python3 gen_bonus_printables.py              # every class that has printables
    python3 gen_bonus_printables.py level1 1     # one class

Writes worksheets/<level>/bonusNN-worksheet.pdf (an activity sheet built from the "worksheet" sections) and
flashcards/<level>/bonusNN-cards.pdf (cut-out cards from "cards": the letter/character cards the class uses
plus picture cards). Rendered as HTML and printed to A4 by Chromium (LUMIO_CHROMIUM or Playwright's own),
like lib/flashcard_html.py, so Arabic shapes correctly.
Section types: draw, picture-gap, odd-one-out, sort-table, write-lines, match, sign.
"""
import glob
import html
import json
import os
import sys

from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.abspath(__file__))
FONTS = os.path.join(ROOT, "_docs", "manuals-src", "assets", "fonts")
TEEN = {"level3", "level4", "level5", "level6"}
e = lambda s: html.escape(str(s if s is not None else ""))


def url(rel):
    return "file://" + os.path.join(ROOT, rel)


def img(name):
    p = os.path.join(ROOT, "assets", "vocab", f"{name}.png")
    return url(f"assets/vocab/{name}.png") if os.path.exists(p) else ""


def font_css():
    faces = [("Baloo 2", "baloo-2-latin-800-normal.woff2", 800), ("Nunito", "nunito-latin-400-normal.woff2", 400),
             ("Nunito", "nunito-latin-700-normal.woff2", 700), ("Nunito", "nunito-latin-800-normal.woff2", 800),
             ("Cairo", "cairo-arabic-600-normal.woff2", 600), ("Cairo", "cairo-arabic-700-normal.woff2", 700)]
    return "".join(f"@font-face{{font-family:'{f}';src:url('file://{os.path.join(FONTS, n)}') format('woff2');font-weight:{w}}}"
                   for f, n, w in faces)


BASE_CSS = """
@page { size:A4; margin:12mm 12mm 14mm; }
* { box-sizing:border-box; }
body { margin:0; font:11.5pt/1.4 'Nunito',sans-serif; color:#2A2118; }
.ar { font-family:'Cairo',sans-serif; direction:rtl; color:#6B5040; font-weight:600; }
.head { display:flex; align-items:center; gap:12px; border-bottom:3px solid var(--acc); padding-bottom:8px; margin-bottom:10px; }
.head img { height:46px; }
.head .t { flex:1; }
.head .k { font:800 8.5pt 'Nunito'; letter-spacing:.08em; text-transform:uppercase; color:var(--acc2); }
.head h1 { font:800 17pt/1.1 'Baloo 2',sans-serif; margin:2px 0 0; }
.name { font-weight:800; font-size:10pt; text-align:right; white-space:nowrap; }
.name span { display:inline-block; width:44mm; border-bottom:1.5px solid #2A2118; }
section { break-inside:avoid; margin:0 0 9px; border:1.5px solid #EAE3D8; border-radius:12px; padding:9px 12px 11px; }
section h2 { font:800 12.5pt 'Baloo 2',sans-serif; margin:0; display:flex; gap:8px; align-items:center; }
section h2 .n { width:22px; height:22px; border-radius:50%; background:var(--acc); color:#fff; display:inline-grid; place-items:center; font-size:10pt; }
section .ar.sub { font-size:9.5pt; margin:0 0 6px; }
.draws { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
.draw { height:44mm; border:2px dashed var(--c); border-radius:12px; position:relative; }
.draw b { position:absolute; left:0; right:0; bottom:6px; text-align:center; font:800 12pt 'Baloo 2'; color:var(--c); }
.draw small { position:absolute; left:0; right:0; bottom:-1px; text-align:center; font-size:8pt; color:#8A7160; display:none; }
.gaps { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; }
.gap { border:1.5px solid #EAE3D8; border-radius:10px; padding:6px; text-align:center; }
.gap img { height:22mm; width:22mm; object-fit:contain; }
.gap .w { font:800 17pt 'Baloo 2'; letter-spacing:.12em; }
.gap .w i { display:inline-block; width:9mm; border-bottom:2px solid #2A2118; }
.odds { display:grid; grid-template-columns:1fr 1fr; gap:6px 18px; font:800 14pt 'Baloo 2'; }
.odds div span { display:inline-block; margin-right:16px; }
.sort .letters { font:800 18pt 'Baloo 2'; letter-spacing:.35em; text-align:center; margin:2px 0 6px; }
.sort .boxes { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.sort .boxes div { height:22mm; border:2px dashed var(--acc); border-radius:10px; padding:4px 8px; font-weight:800; font-size:9.5pt; color:var(--acc2); }
.lines .ex { font-size:10pt; color:#6B5040; }
.lines .l { height:11mm; border-bottom:1.5px solid #C9BFB2; }
.match { display:grid; grid-template-columns:1fr 30mm 1fr; gap:6px 0; font-weight:800; }
.match .r { text-align:right; }
.sign { display:flex; gap:12px; align-items:flex-end; font-weight:800; border-style:dashed; }
.sign span.l { flex:1; border-bottom:1.5px solid #2A2118; height:8mm; }
.foot { position:fixed; bottom:-8mm; left:0; right:0; text-align:center; font-size:8pt; color:#8A7160; }
/* cards */
.cards { display:grid; grid-template-columns:repeat(3,1fr); gap:0; }
.card { height:88mm; border:1.5px dashed #B9AE9F; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; padding:8px; text-align:center; break-inside:avoid; }
.card .big { width:44mm; height:44mm; border-radius:14mm; display:grid; place-items:center; background:var(--c); color:#fff; font:800 82pt/1 'Baloo 2'; }
.card img { width:46mm; height:46mm; object-fit:contain; }
.card .h { font:800 19pt 'Baloo 2'; color:var(--c); margin-top:4px; }
.card .s { font-weight:700; color:#6B5040; }
.card .ar { font-size:11pt; }
.cut { text-align:center; font-size:8.5pt; color:#8A7160; margin-bottom:4px; }
"""


def worksheet_html(d):
    teen = d["level"] in TEEN
    acc, acc2 = ("#B7791F", "#7A4E0A") if teen else ("#F97316", "#C2530A")
    out, n = [], 0
    for s in d["printables"].get("worksheet", []):
        t = s["type"]
        if t == "sign":
            out.append(f'<section class="sign"><span>{e(s["text"])}<br><span class="ar">{e(s.get("textAr"))}</span></span>'
                       f'<span class="l"></span><span>Parent ✓</span><span class="l" style="flex:.4"></span></section>')
            continue
        n += 1
        h = f'<h2><span class="n">{n}</span>{e(s["title"])}</h2><div class="ar sub">{e(s.get("titleAr"))}</div>'
        if t == "draw":
            body = '<div class="draws">' + "".join(
                f'<div class="draw" style="--c:{b.get("color", acc)}"><b>{e(b["label"])}</b></div>' for b in s["boxes"]) + "</div>"
        elif t == "picture-gap":
            cells = []
            for it in s["items"]:
                pre, post = it["frame"].split("_")
                pic = img(it.get("image", ""))
                cells.append(f'<div class="gap">{f"<img src={chr(34)}{pic}{chr(34)}>" if pic else ""}'
                             f'<div class="w">{e(pre)}<i>&nbsp;</i>{e(post)}</div></div>')
            body = '<div class="gaps">' + "".join(cells) + "</div>"
        elif t == "odd-one-out":
            body = '<div class="odds">' + "".join(
                f'<div>{chr(97 + i)})&nbsp; ' + "".join(f"<span>{e(w)}</span>" for w in st) + "</div>" for i, st in enumerate(s["sets"])) + "</div>"
        elif t == "sort-table":
            body = (f'<div class="sort"><div class="letters">{" ".join(e(x) for x in s["letters"])}</div><div class="boxes">'
                    + "".join(f"<div>{e(b)}</div>" for b in s["boxes"]) + "</div></div>")
        elif t == "write-lines":
            body = (f'<div class="lines">{f"<div class=ex>Example: {e(s["example"])}</div>" if s.get("example") else ""}'
                    + '<div class="l"></div>' * s.get("lines", 2) + "</div>")
        elif t == "match":
            body = '<div class="match">' + "".join(f'<div>{e(a)}</div><div></div><div class="r">{e(b)}</div>' for a, b in s["pairs"]) + "</div>"
        else:
            raise ValueError(f"{d['id']}: unknown worksheet section {t!r}")
        out.append(f"<section>{h}{body}</section>")
    head = (f'<div class="head"><img src="{url("assets/logo/lumio-logo.png")}"><div class="t"><div class="k">'
            f'{e(d["label"])} · {e(d["strand"])} · worksheet</div><h1>{e(d["title"])}</h1></div>'
            f'<div class="name">Name <span></span></div></div>')
    return (f'<!doctype html><html><head><meta charset="utf-8"><style>{font_css()}{BASE_CSS}'
            f':root{{--acc:{acc};--acc2:{acc2}}}</style></head><body>{head}{"".join(out)}'
            '</body></html>')


def cards_html(d):
    cards = []
    for c in d["printables"].get("cards", []):
        pic = img(c["image"]) if c.get("image") else ""
        top = f'<div class="big">{e(c["big"])}</div>' if c.get("big") else (f'<img src="{pic}">' if pic else "")
        cards.append(f'<div class="card" style="--c:{c.get("color", "#F97316")}">{top}<div class="h">{e(c["head"])}</div>'
                     f'{f"<div class=s>{e(c["sub"])}</div>" if c.get("sub") else ""}'
                     f'{f"<div class=ar>{e(c["ar"])}</div>" if c.get("ar") else ""}</div>')
    return (f'<!doctype html><html><head><meta charset="utf-8"><style>{font_css()}{BASE_CSS}</style></head><body>'
            f'<div class="cut">✂ Cut along the dashed lines · {e(d["label"])}: {e(d["title"])}</div>'
            f'<div class="cards">{"".join(cards)}</div></body></html>')


def pdf(page, html_text, out):
    os.makedirs(os.path.dirname(out), exist_ok=True)
    tmp = out + ".tmp.html"
    with open(tmp, "w", encoding="utf-8") as f:
        f.write(html_text)
    page.goto("file://" + tmp, wait_until="load")
    page.wait_for_timeout(200)
    page.pdf(path=out, format="A4", print_background=True, prefer_css_page_size=True)
    os.remove(tmp)


def main():
    a = sys.argv[1:]
    if len(a) > 1:
        paths = [os.path.join(ROOT, "bonus-classes", a[0], f"bonus{int(a[1]):02d}.json")]
    elif a:
        paths = sorted(glob.glob(os.path.join(ROOT, "bonus-classes", a[0], "bonus*.json")))
    else:
        paths = sorted(glob.glob(os.path.join(ROOT, "bonus-classes", "*", "bonus*.json")))
    with sync_playwright() as p:
        br = p.chromium.launch(executable_path=os.environ.get("LUMIO_CHROMIUM") or None)
        page = br.new_page()
        for path in paths:
            with open(path, encoding="utf-8") as f:
                d = json.load(f)
            if not d.get("printables"):
                continue
            nn = f'{d["bonusNumber"]:02d}'
            if d["printables"].get("worksheet"):
                pdf(page, worksheet_html(d), os.path.join(ROOT, "worksheets", d["level"], f"bonus{nn}-worksheet.pdf"))
            if d["printables"].get("cards"):
                pdf(page, cards_html(d), os.path.join(ROOT, "flashcards", d["level"], f"bonus{nn}-cards.pdf"))
            print(f'{d["level"]} bonus {nn}: printables written')
        br.close()


if __name__ == "__main__":
    main()
