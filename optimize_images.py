# -*- coding: utf-8 -*-
"""
Fixes real, measured load-time lag: vocab images averaged 561KB (up
to ~2MB) for icons displayed at ~250-300px on screen -- multiple
megapixels of unneeded resolution the browser had to download and
decode on every slide, especially the first (uncached) load. Resizes
to a generous max dimension (covers even 2x-retina display at the
largest on-screen size used anywhere in the site) and re-compresses
with PNG optimization, preserving transparency.
"""
import os
from PIL import Image

MAX_DIM = 600  # generous vs largest actual on-screen size (~340px @ 2x), tested to cut size significantly more than 700px while staying sharp

def optimize_dir(dir_path):
    total_before, total_after, changed = 0, 0, 0
    for fname in sorted(os.listdir(dir_path)):
        if not fname.lower().endswith(".png"):
            continue
        path = os.path.join(dir_path, fname)
        before = os.path.getsize(path)
        total_before += before

        img = Image.open(path)
        if img.mode != "RGBA":
            img = img.convert("RGBA")
        w, h = img.size
        if max(w, h) > MAX_DIM:
            scale = MAX_DIM / max(w, h)
            img = img.resize((max(1, round(w * scale)), max(1, round(h * scale))), Image.LANCZOS)

        img.save(path, "PNG", optimize=True)
        after = os.path.getsize(path)
        total_after += after
        if after != before:
            changed += 1

    print(f"{dir_path}: {changed} files touched, {total_before/1024/1024:.1f}MB -> {total_after/1024/1024:.1f}MB "
          f"({(1 - total_after/total_before)*100:.0f}% smaller)")

optimize_dir("assets/vocab")
optimize_dir("assets/story/characters")
optimize_dir("assets/story/animals")
optimize_dir("assets/story/toys")
optimize_dir("assets/story/family")
