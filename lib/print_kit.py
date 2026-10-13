# -*- coding: utf-8 -*-
"""Print kit for every Lumio printable (homework sheets, writing sheets, flashcards).

Every sheet is HTML laid out on fixed A4 pages and printed to PDF by Chromium, because ReportLab cannot join Arabic
letters and a browser can. The rules that keep the PDFs trouble-free:
  * fonts are local files (assets/print/fonts), never the network, so a rebuild looks the same anywhere;
  * pictures are flattened onto white and shrunk to print size once (cache: .cache/print-img/), so PDFs stay small
    and no transparent PNG can print as a black box;
  * every page is a 210x297 mm box with 12 mm margins inside the printable area of any home printer; a page that
    overflows is detected in the browser and the builder retries with less content (see render()), and if it still
    overflows the build stops with an error instead of shipping a cut-off sheet;
  * colour is decoration only: every instruction, answer line and box still reads on a black-and-white printer;
  * shuffles are seeded by level + lesson, so rebuilding gives byte-for-byte the same exercises (clean git diffs).
"""
import hashlib, html, os, random, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONTS = os.path.join(ROOT, "assets", "print", "fonts")
CACHE = os.path.join(ROOT, ".cache", "print-img")
LOGO = os.path.join(ROOT, "assets", "logo", "lumio-logo.png")

E = lambda s: html.escape(str(s if s is not None else ""), quote=True)


def rng(*key):
    """Deterministic random generator for one sheet (same exercises on every rebuild)."""
    return random.Random(int(hashlib.sha1("|".join(map(str, key)).encode()).hexdigest()[:12], 16))


def slug(w):
    return str(w).lower().replace("'", "").replace(" ", "-")


def picture(word, size=420):
    """file:// URL of a print-ready copy of a word's picture (white background, JPEG), or None if it has none."""
    name = slug(word.get("image") or word["en"]) if isinstance(word, dict) else slug(word)
    src = os.path.join(ROOT, "assets", "vocab", name + ".png")
    if not os.path.exists(src):
        return None
    os.makedirs(CACHE, exist_ok=True)
    out = os.path.join(CACHE, f"{name}-{size}.jpg")
    if not os.path.exists(out) or os.path.getmtime(out) < os.path.getmtime(src):
        from PIL import Image
        im = Image.open(src).convert("RGBA")
        im.thumbnail((size, size), Image.LANCZOS)
        bg = Image.new("RGB", im.size, (255, 255, 255))
        bg.paste(im, mask=im.split()[3])
        bg.save(out, "JPEG", quality=84, optimize=True, progressive=True)
    return "file://" + out


def logo():
    os.makedirs(CACHE, exist_ok=True)
    out = os.path.join(CACHE, "logo-print.png")
    if not os.path.exists(out) or os.path.getmtime(out) < os.path.getmtime(LOGO):
        from PIL import Image
        im = Image.open(LOGO).convert("RGBA"); im.thumbnail((360, 360), Image.LANCZOS); im.save(out, optimize=True)
    return "file://" + out


def arfix(text):
    """The Arabic "and" written straight onto an English word ("وtheir") makes Chromium draw a stray "g";
    a no-break space after it prints correctly and reads the same."""
    s = re.sub(r"(?<=[A-Za-z])\s+و\s*(?=[A-Za-z])", "، ", str(text or ""))   # "my وyour وhis" -> "my، your، his"
    return re.sub(r"و(?=[A-Za-z])", "و\u00a0", s)


def ar(text):
    """Arabic run inside English text (the browser joins and orders it correctly)."""
    return f'<span class="ar" dir="rtl" lang="ar">{E(arfix(text))}</span>'


def strip_marks(s):
    """Reading Lab text uses [word](rule) to make a word glow on the slide; print shows the plain word."""
    return re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", s)


def font_face():
    f = lambda fam, file, w: f"@font-face{{font-family:'{fam}';font-weight:{w};src:url('file://{os.path.join(FONTS, file)}') format('woff2')}}"
    return "".join([
        f("Andika", "andika-latin-400.woff2", 400), f("Andika", "andika-latin-700.woff2", 700),
        f("Nunito", "nunito-latin-400-normal.woff2", 400), f("Nunito", "nunito-latin-600-normal.woff2", 600),
        f("Nunito", "nunito-latin-700-normal.woff2", 700), f("Nunito", "nunito-latin-800-normal.woff2", 800),
        f("Baloo", "baloo-2-latin-700-normal.woff2", 700), f("Baloo", "baloo-2-latin-800-normal.woff2", 800),
        f("Cairo", "cairo-arabic-400-normal.woff2", 400), f("Cairo", "cairo-arabic-600-normal.woff2", 600),
        f("Cairo", "cairo-arabic-700-normal.woff2", 700), f("Cairo", "cairo-arabic-900-normal.woff2", 900),
    ])


BASE_CSS = """
@page{size:A4;margin:0}
*{box-sizing:border-box;margin:0;padding:0;-webkit-print-color-adjust:exact;print-color-adjust:exact}
html,body{background:#fff}
body{font-family:Nunito,Cairo,sans-serif;color:#1F1A15;font-size:10.5pt;line-height:1.4}
.page{width:210mm;height:297mm;padding:12mm 13mm 11mm;position:relative;overflow:hidden;page-break-after:always;display:flex;flex-direction:column}
.page:last-child{page-break-after:auto}
.flow{flex:1;display:flex;flex-direction:column;gap:3.4mm;min-height:0}
.ar{font-family:Cairo,Nunito,sans-serif;direction:rtl;unicode-bidi:isolate}
.kid,.kid .t{font-family:Andika,Nunito,Cairo,sans-serif}
/* header */
.hd{display:flex;align-items:center;gap:4mm;border-bottom:.5mm solid #F2A65A;padding-bottom:2.6mm;margin-bottom:3.6mm}
.hd img{height:15mm;width:auto}
.hd .tt{flex:1;min-width:0}
.hd .kick{font:800 7.6pt Nunito;letter-spacing:.08em;text-transform:uppercase;color:#C2530A}
.hd h1{font:800 17pt/1.1 Baloo,Nunito;color:#2A2118;margin-top:.6mm}
.hd h1 .ar{font:700 12pt Cairo,Nunito,sans-serif;color:#6B5A4A;margin-left:3mm}
.hd .who{display:grid;grid-template-columns:auto 34mm;gap:1.6mm 2mm;font:700 8.5pt Nunito;color:#5B4C3E;align-items:end}
.hd .who i{border-bottom:.3mm solid #8A7A6A;height:4.5mm;display:block}
.goal{font:600 9pt Nunito;color:#5B4C3E;background:#FFF6EA;border-radius:2.5mm;padding:1.8mm 3mm}
.goal b{color:#C2530A}
/* exercise blocks */
.ex{border:.35mm solid #E6DACB;border-radius:3mm;padding:3mm 3.6mm 3.4mm;break-inside:avoid}
.ex h2{display:flex;align-items:baseline;gap:2.4mm;font:800 11pt Nunito;color:#2A2118;margin-bottom:1.8mm}
.ex h2 .n{flex:0 0 6.4mm;height:6.4mm;border-radius:50%;background:#F97316;color:#fff;font:800 9.5pt Nunito;display:flex;align-items:center;justify-content:center;transform:translateY(-.4mm)}
.ex h2 .ar{margin-left:auto;font:600 8.6pt Cairo,Nunito,sans-serif;color:#7A6858}
.ex h2 .who{font:800 7pt Nunito;letter-spacing:.02em;border-radius:99px;padding:.5mm 2.2mm;margin-left:1.6mm;white-space:nowrap;transform:translateY(-.3mm)}
.ex h2 .who .ar{margin:0;font:700 7.4pt Cairo,Nunito,sans-serif;color:inherit}
.ex h2 .who.self{background:#E8F4FF;color:#1E4FA3;border:.3mm solid #B8D4F2}
.ex h2 .who.parent{background:#FFF1E0;color:#B4510A;border:.3mm solid #F3C99A}
.ex h2 .who.both{background:#EEF8F1;color:#1E7A45;border:.3mm solid #B7DEC4}
.ex .hint{font:600 8.4pt Nunito;color:#6B5A4A;margin:-.6mm 0 2mm}
.grow{flex:1;display:flex;flex-direction:column}
.line{border-bottom:.3mm solid #9C8B7A;height:7.4mm;flex:0 0 auto}
.ruled{flex:1 1 0;display:flex;flex-direction:column;overflow:hidden;min-height:20mm}
.ex.grow{min-height:0}
.lines .line:last-child{margin-bottom:0}
.bank{display:flex;flex-wrap:wrap;gap:1.4mm 2mm;border:.35mm dashed #C9B8A6;border-radius:2.4mm;padding:1.6mm 2.4mm;margin-bottom:2.4mm;font:700 9.4pt Nunito}
.bank span{padding:0 1.6mm}
.gap{display:inline-block;min-width:24mm;font:700 10pt Nunito;color:#8A7A6A;padding-left:.6mm;border-bottom:.3mm solid #6B5A4A;height:4.6mm;vertical-align:-1mm}
ol.items{list-style:none;display:flex;flex-direction:column;gap:1.8mm}
ol.items li{display:flex;gap:2mm;align-items:baseline}
ol.items li>b{flex:0 0 5mm;color:#C2530A;font-weight:800}
.two{display:grid;grid-template-columns:1fr 1fr;gap:3.4mm}
.rule{background:#F3F8FF;border:.35mm solid #C9DCF5;border-radius:3mm;padding:2.6mm 3.4mm}
.rule .en{font:700 9.6pt Nunito}
.rule .ar{display:block;font:600 9pt Cairo,Nunito,sans-serif;color:#3B4A63;margin-top:.8mm}
.rule .exs{display:flex;flex-wrap:wrap;gap:1.4mm 4mm;margin-top:1.4mm;font:700 9.4pt Nunito;color:#1E4FA3}
.tick{display:inline-block;width:4.2mm;height:4.2mm;border:.35mm solid #6B5A4A;border-radius:.8mm;vertical-align:-.8mm;margin-right:1.4mm}
/* parent / answers */
.parent{border-radius:3mm;background:#FFF6EA;border:.35mm solid #F3D3AE;padding:2.2mm 3.4mm;direction:rtl;font:600 8.6pt/1.6 Cairo,Nunito,sans-serif;color:#4A3A2A}
.parent b{color:#C2530A;font-weight:800}
.parent .en{font-family:Nunito;direction:ltr;unicode-bidi:isolate}
.sign .stars{font-size:13pt;color:#C9A55A;letter-spacing:1mm}
.sign{display:flex;gap:8mm;font:700 8.4pt Nunito;color:#5B4C3E;margin-top:1mm}
.sign span{flex:1;display:flex;gap:2mm;align-items:end}.sign i{flex:1;border-bottom:.3mm solid #8A7A6A;height:4mm}
.key{transform:rotate(180deg);font:600 7.6pt Nunito;color:#6B5A4A;border-top:.3mm dashed #C9B8A6;padding-top:1.4mm}
.key b{color:#2A2118}
.ft{display:flex;justify-content:space-between;font:700 7.4pt Nunito;color:#9C8B7A;margin-top:2.4mm;border-top:.3mm solid #EFE6DA;padding-top:1.6mm}
/* handwriting: 4-line school rows (ascender, x-height, baseline, descender) */
.hw{position:relative;height:var(--h,13mm);background:
 linear-gradient(#B9C9E6,#B9C9E6) 0 0/100% .25mm no-repeat,
 repeating-linear-gradient(90deg,#E58C8C 0 1.6mm,transparent 1.6mm 3mm) 0 calc(var(--h,13mm)*.36)/100% .25mm no-repeat,
 linear-gradient(#6E86B8,#6E86B8) 0 calc(var(--h,13mm)*.72)/100% .35mm no-repeat,
 linear-gradient(#B9C9E6,#B9C9E6) 0 calc(var(--h,13mm) - .25mm)/100% .25mm no-repeat}
.hw span{position:absolute;left:2mm;top:0;font-family:Andika,Nunito;font-size:calc(var(--h,13mm)*.98);line-height:calc(var(--h,13mm)*1.035);white-space:nowrap;letter-spacing:.6mm}
.hw .model{color:#2A2118}
.hw .trace{color:transparent;-webkit-text-stroke:.28mm #A9A9A9}
"""


def page(inner, cls=""):
    return f'<section class="page {cls}">{inner}</section>'


def header(kicker, title, title_ar="", who=True):
    who_html = '<div class="who"><span>Name</span><i></i><span>Date</span><i></i></div>' if who else ""
    t_ar = f' <span class="ar">{E(title_ar)}</span>' if title_ar else ""
    return (f'<div class="hd"><img src="{logo()}" alt=""><div class="tt"><div class="kick">{E(kicker)}</div>'
            f'<h1>{E(title)}{t_ar}</h1></div>{who_html}</div>')


def footer(left, right):
    return f'<div class="ft"><span>{E(left)}</span><span>{E(right)}</span></div>'


def document(pages, css="", title="Lumio English"):
    return (f'<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>{E(title)}</title>'
            f'<style>{font_face()}{BASE_CSS}{css}</style></head><body>{"".join(pages)}</body></html>')


# ------------------------------------------------------------------ rendering
_B = {}


def browser():
    if "b" not in _B:
        from playwright.sync_api import sync_playwright
        _B["pw"] = sync_playwright().start()
        exe = os.environ.get("LUMIO_CHROMIUM") or ("/opt/pw-browsers/chromium" if os.path.exists("/opt/pw-browsers/chromium") else None)
        _B["b"] = _B["pw"].chromium.launch(executable_path=exe)
        _B["p"] = _B["b"].new_page()
    return _B["p"]


def close():
    if "b" in _B:
        _B["b"].close(); _B["pw"].stop(); _B.clear()


OVERFLOW_JS = """() => [...document.querySelectorAll('.page')].map((p, i) => {
  const lim = p.getBoundingClientRect().bottom - parseFloat(getComputedStyle(p).paddingBottom);
  let worst = 0;
  // every block and every leaf inside it must end above the bottom margin (catches text pushed out of a box too)
  p.querySelectorAll('.flow > *, .flow .ex > *, .flow li, .ft, .cardgrid, .card > *').forEach(e => { worst = Math.max(worst, e.getBoundingClientRect().bottom); });
  return worst > lim + 1 ? i + 1 : 0;
}).filter(Boolean)"""


def render(build, out_path, title, tries=4):
    """build(density) -> list of page HTML strings; density goes 0, 1, 2... until nothing overflows."""
    pg = browser()
    tmp = os.path.join(CACHE, "_sheet.html")
    os.makedirs(CACHE, exist_ok=True)
    for density in range(tries):
        pages, css = build(density)
        open(tmp, "w", encoding="utf-8").write(document(pages, css, title))
        pg.goto("file://" + tmp, wait_until="load")
        pg.evaluate("document.fonts.ready")
        bad = pg.evaluate(OVERFLOW_JS)
        if not bad:
            os.makedirs(os.path.dirname(out_path), exist_ok=True)
            pg.pdf(path=out_path, width="210mm", height="297mm", print_background=True, margin={"top": "0", "right": "0", "bottom": "0", "left": "0"})
            return {"pages": len(pages), "density": density, "kb": os.path.getsize(out_path) // 1024}
    dbg = os.path.join(CACHE, "overflow-" + os.path.basename(out_path).replace(".pdf", ".png"))
    pg.set_viewport_size({"width": 800, "height": 1131}); pg.screenshot(path=dbg, full_page=True)
    raise RuntimeError(f"{out_path}: page(s) {bad} still overflow after {tries} tries (screenshot: {dbg})")
