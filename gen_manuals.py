#!/usr/bin/env python3
"""Render the two manuals that have an HTML source, and refresh the landing
page's handbook cover image.

    python3.12 gen_marketing_media.py --shots   # first, if any screen changed
    python3.12 gen_manuals.py                   # both manuals
    python3.12 gen_manuals.py handbook|guide    # just one

Sources (edit these for any text change):
  _docs/manuals-src/parent_handbook.html   -> manuals/Lumio_Parent_Handbook_AR.pdf
  _docs/manuals-src/curriculum_guide.html  -> manuals/Lumio_English_Curriculum_Guide.pdf
Screenshots they embed live in _docs/manuals-src/assets/ and come from
gen_marketing_media.py. Fonts are local (assets/fonts) so the render never
depends on the network. The per-level manuals have no source in the repo.
"""
import os, sys, subprocess
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.abspath(__file__)); os.chdir(ROOT)
CHROMIUM = os.environ.get("LUMIO_CHROMIUM") or ("/opt/pw-browsers/chromium" if os.path.exists("/opt/pw-browsers/chromium") else None)
DOCS = {
    "handbook": ("_docs/manuals-src/parent_handbook.html", "manuals/Lumio_Parent_Handbook_AR.pdf", (794, 1123)),
    "guide":    ("_docs/manuals-src/curriculum_guide.html", "manuals/Lumio_English_Curriculum_Guide.pdf", (662, 941)),
}
which = [a for a in sys.argv[1:] if a in DOCS] or list(DOCS)

with sync_playwright() as p:
    b = p.chromium.launch(executable_path=CHROMIUM) if CHROMIUM else p.chromium.launch()
    for key in which:
        src, out, (w, h) = DOCS[key]
        pg = b.new_page(viewport={"width": w, "height": h})
        pg.goto("file://" + os.path.abspath(src)); pg.wait_for_timeout(1500)
        pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(300)
        pg.pdf(path=out, width=f"{w}px", height=f"{h}px", print_background=True,
               margin={"top": "0", "right": "0", "bottom": "0", "left": "0"}, prefer_css_page_size=False)
        pg.close(); print("wrote", out)
    b.close()

if "handbook" in which:
    subprocess.run(["pdftoppm", "-r", "84", "-f", "1", "-l", "1", "-jpeg", "-jpegopt", "quality=88", "-singlefile",
                    DOCS["handbook"][1], "assets/marketing/parent-handbook-cover"], check=True)
    print("wrote assets/marketing/parent-handbook-cover.jpg")
