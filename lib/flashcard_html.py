# -*- coding: utf-8 -*-
"""
Flashcard PDFs, rendered via a real browser (Playwright/Chromium)
instead of ReportLab's manual glyph-by-glyph drawing.

Why: ReportLab has no text-shaping engine. Even feeding it correctly
reshaped+reordered Arabic (arabic_reshaper + python-bidi) still
renders as visually disconnected letters, because Arabic presentation-
form glyphs are designed to be cursively connected via a shaping
engine's GPOS positioning (HarfBuzz), which ReportLab doesn't have --
it just places each glyph at its own advance width with no overlap.
A browser's native text stack (used everywhere else on this site, and
where Arabic already renders perfectly) does this correctly by
default, so we render the flashcard as HTML and print it to PDF
instead of drawing glyphs by hand.
"""
import os, math
from playwright.sync_api import sync_playwright

def esc(s):
    return (s or "").replace("&", "&amp;").replace("<", "&lt;").replace('"', "&quot;")

def slug(w):
    return w.lower().replace("'", "").replace(" ", "-")

def build_flashcard_html(level, num, vocab, page="front"):
    n = len(vocab)
    cols = min(4, max(3, math.ceil(n / 2)))
    rows = math.ceil(n / cols)

    cards_by_row = []
    for r in range(rows):
        row_items = []
        for c in range(cols):
            idx = r * cols + c
            if idx < n:
                row_items.append(vocab[idx])
        cards_by_row.append(row_items)

    def front_card(w):
        img_path = f"assets/vocab/{slug(w['en'])}.png"
        img_abs = os.path.abspath(img_path)
        has_img = os.path.exists(img_abs)
        img_html = (f'<img src="file://{img_abs}">' if has_img
                    else f'<div class="fallback">{esc(w["en"][0].upper())}</div>')
        logo_abs = os.path.abspath("assets/logo/lumio-logo.png")
        logo_html = f'<img class="card-logo" src="file://{logo_abs}">' if os.path.exists(logo_abs) else ""
        return f'''<div class="card">
          {logo_html}
          {img_html}
          <div class="word">{esc(w["en"])}</div>
        </div>'''

    def back_card(w):
        logo_abs = os.path.abspath("assets/logo/lumio-logo.png")
        logo_html = f'<img class="card-logo" src="file://{logo_abs}">' if os.path.exists(logo_abs) else ""
        return f'''<div class="card back-card">
          {logo_html}
          <div class="arword">{esc(w["ar"])}</div>
        </div>'''

    if page == "front":
        rows_html = "".join(
            f'<div class="row">{"".join(front_card(w) for w in row)}</div>'
            for row in cards_by_row
        )
    else:
        # mirror each row so back aligns with front after a long-edge duplex flip
        rows_html = "".join(
            f'<div class="row">{"".join(back_card(w) for w in reversed(row))}</div>'
            for row in cards_by_row
        )

    return f'''<!DOCTYPE html>
<html lang="ar" dir="ltr"><head><meta charset="utf-8">
<style>
  @page {{ size: A4; margin: 14mm 10mm; }}
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{ font-family: 'Noto Sans Arabic', 'Nunito', sans-serif; }}
  .header {{ font-size: 11px; font-weight: 700; color: #43301F; margin-bottom: 10mm; }}
  .row {{ display: flex; gap: 5mm; margin-bottom: 5mm; }}
  .card {{
    flex: 1; height: 62mm; border: 2px dashed #8A7160; border-radius: 6mm;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 4mm; padding: 4mm; position: relative;
  }}
  .card-logo {{ position: absolute; top: 2.5mm; right: 2.5mm; width: 8mm; height: 8mm; object-fit: contain; }}
  .card img:not(.card-logo) {{ max-width: 70%; max-height: 60%; object-fit: contain; }}
  .card .fallback {{
    width: 26mm; height: 26mm; border-radius: 4mm; background: #FFF3D6; color: #F97316;
    display: flex; align-items: center; justify-content: center; font-size: 16mm; font-weight: 800;
  }}
  .card .word {{ font-size: 15px; font-weight: 800; color: #43301F; }}
  .back-card {{ align-items: flex-start; justify-content: flex-start; }}
  .back-card .arword {{ font-size: 13px; font-weight: 800; color: #0D9488; direction: rtl; }}
</style></head>
<body>
  <div class="header">Lumio English &mdash; {level.upper()} Lesson {num} &mdash; print double-sided, flip on long edge</div>
  {rows_html}
</body></html>'''


_browser_holder = {}

def get_browser():
    if "browser" not in _browser_holder:
        pw = sync_playwright().start()
        _browser_holder["pw"] = pw
        _browser_holder["browser"] = pw.chromium.launch()
    return _browser_holder["browser"]

def close_browser():
    if "browser" in _browser_holder:
        _browser_holder["browser"].close()
        _browser_holder["pw"].stop()
        _browser_holder.clear()

def build_flashcard_pdf(level, num, vocab, out_path):
    browser = get_browser()
    page = browser.new_page()
    front_html = build_flashcard_html(level, num, vocab, "front")
    back_html = build_flashcard_html(level, num, vocab, "back")

    tmp_front_pdf = out_path + ".front.pdf"
    tmp_back_pdf = out_path + ".back.pdf"
    tmp_front_html = out_path + ".front.html"
    tmp_back_html = out_path + ".back.html"

    # page.set_content() serves the page with no real origin, so Chromium
    # blocks file:// <img> loads from it ("Not allowed to load local
    # resource"). Writing to a real file and navigating via file:// grants
    # the page a proper file:// origin, which local <img> tags need.
    with open(tmp_front_html, "w", encoding="utf-8") as f:
        f.write(front_html)
    page.goto(f"file://{os.path.abspath(tmp_front_html)}", wait_until="load")
    page.pdf(path=tmp_front_pdf, format="A4", print_background=True)

    with open(tmp_back_html, "w", encoding="utf-8") as f:
        f.write(back_html)
    page.goto(f"file://{os.path.abspath(tmp_back_html)}", wait_until="load")
    page.pdf(path=tmp_back_pdf, format="A4", print_background=True)
    page.close()
    os.remove(tmp_front_html)
    os.remove(tmp_back_html)

    # merge front+back into the final 2-page PDF
    from pypdf import PdfWriter, PdfReader
    writer = PdfWriter()
    for p in (tmp_front_pdf, tmp_back_pdf):
        reader = PdfReader(p)
        for pg in reader.pages:
            writer.add_page(pg)
    with open(out_path, "wb") as f:
        writer.write(f)
    os.remove(tmp_front_pdf)
    os.remove(tmp_back_pdf)
