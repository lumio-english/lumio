#!/usr/bin/env python3
"""Swap story pages from the old "background + character cut-outs" layout
to a single generated scene image with the caption overlaid.

For every story-content/<level>/partP-pageN.html whose scene image
assets/story/scenes/<level>/pP-NN.jpg exists:
  1. normalise the image in place: center-crop to 16:9, resize to
     1600x900, save as JPEG q85 (ChatGPT's 1536x1024 3:2 output is fine).
  2. rewrite the page to:   <img class="scene" src=...>
                            <div class="partbadge">  (kept verbatim)
                            <div class="pagedots">   (kept verbatim)
                            [<div id="colorGame">]   (kept, pre-a p1-3 only)
                            <div class="caption">    (kept verbatim)
Pages without an image are left untouched, so the rollout can be partial.
Idempotent — safe to re-run after every batch.  Usage:
    python3 migrate_story_scenes.py            # all levels
    python3 migrate_story_scenes.py level1     # one level
"""
import os, re, sys, glob
from PIL import Image

ROOT = os.path.dirname(os.path.abspath(__file__))
W, H = 1600, 900


def normalise(path):
    im = Image.open(path).convert("RGB")
    w, h = im.size
    if (w, h) != (W, H):
        target = W / H
        if w / h > target:            # too wide -> crop sides
            nw = int(h * target); x = (w - nw) // 2; im = im.crop((x, 0, x + nw, h))
        elif w / h < target:          # too tall -> crop top/bottom
            nh = int(w / target); y = (h - nh) // 2; im = im.crop((0, y, w, y + nh))
        im = im.resize((W, H), Image.LANCZOS)
        im.save(path, "JPEG", quality=85, optimize=True, progressive=True)
        return True
    return False


def block(src, pattern):
    m = re.search(pattern, src, re.S)
    return m.group(0) if m else ""


def rewrite(page, scene_rel):
    src = open(page, encoding="utf-8").read()
    badge = block(src, r'<div class="partbadge"[^>]*>.*?</div>')
    dots = block(src, r'<div class="pagedots">.*?</div>\s*</div>')
    game = block(src, r'<div id="colorGame"[^>]*></div>')
    # caption: from its opening tag to the closing </div> that follows the last </p>
    cap = block(src, r'<div class="caption">.*?</p>\s*</div>')
    if not (badge and dots and cap):
        raise SystemExit(f"could not parse {page}")
    parts = [f'<img class="scene" src="{scene_rel}" alt="">', badge, dots]
    if game:
        parts.append(game)
    parts.append(cap)
    new = "\n".join(parts) + "\n"
    if new != src:
        open(page, "w", encoding="utf-8").write(new)
        return True
    return False


def main():
    levels = sys.argv[1:] or ["pre-a", "level1", "level2", "level3"]
    done = skipped = 0
    for level in levels:
        for page in sorted(glob.glob(os.path.join(ROOT, "story-content", level, "part*-page*.html"))):
            m = re.search(r"part(\d+)-page(\d+)", page)
            rel = f"assets/story/scenes/{level}/p{m.group(1)}-{int(m.group(2)):02d}.jpg"
            img = os.path.join(ROOT, rel)
            if not os.path.exists(img):
                skipped += 1
                continue
            normalise(img)
            rewrite(page, rel)
            done += 1
            print("migrated", os.path.relpath(page, ROOT))
    print(f"{done} pages migrated, {skipped} still waiting for images")


if __name__ == "__main__":
    main()
