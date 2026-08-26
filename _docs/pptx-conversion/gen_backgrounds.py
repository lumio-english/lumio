"""
Generates the two reusable dark-theme background images the PPTX
conversion pipeline uses for the teen track (Level 3-6). Run this once
(or whenever the palette changes) -- gen_pptx_deck.js references the
output files by name, it doesn't regenerate them itself.

Why these exist at all: pptxgenjs cannot render CSS-style gradient
fills directly (confirmed during the pilot -- there is no gradient
fill option on shapes or slide backgrounds), so a gradient background
has to be a literal image instead. This produces the exact same
gradient defined in lib/deck_template_teen.py (BG_DARK -> BG_DARKER,
160deg) as a PNG, once as a plain gradient (used for the cover slide,
under a lesson photo + dark overlay) and once with the corner glows
and dot-grid texture added (used for every regular content slide).

Usage: python3 gen_backgrounds.py
Output: bg_dark_gradient.png, bg_dark_content.png (both 1600x900,
written into this same directory)
"""
import math
import numpy as np
from PIL import Image, ImageDraw

W, H = 1600, 900

# Exact values from lib/deck_template_teen.py -- keep these in sync if
# the palette ever changes there.
BG_DARK = (0x2B, 0x1B, 0x52)
BG_DARKER = (0x1C, 0x10, 0x38)


def base_gradient():
    """160deg linear gradient, BG_DARK -> BG_DARKER, with dithering to
    avoid the visible banding a naive per-pixel-rounded gradient
    produces (caught and fixed during the pilot -- the first, undithered
    attempt showed clear stepping in the smooth dark-purple gradient)."""
    c1 = np.array(BG_DARK, dtype=np.float64)
    c2 = np.array(BG_DARKER, dtype=np.float64)
    angle_rad = math.radians(160 - 90)
    dx, dy = math.cos(angle_rad), math.sin(angle_rad)
    xx, yy = np.meshgrid(np.arange(W) - W / 2, np.arange(H) - H / 2)
    proj = xx * dx + yy * dy
    diag = abs(W * dx) + abs(H * dy)
    t = np.clip(proj / diag + 0.5, 0, 1)
    rng = np.random.default_rng(42)
    noise = rng.uniform(-0.6, 0.6, size=(H, W))
    arr = np.zeros((H, W, 3), dtype=np.float64)
    for i in range(3):
        arr[:, :, i] = c1[i] + (c2[i] - c1[i]) * t + noise
    return arr


def add_radial(arr, cx, cy, radius, color, max_alpha):
    xx, yy = np.meshgrid(np.arange(W), np.arange(H))
    dist = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2)
    alpha = np.clip(1 - dist / radius, 0, 1) * max_alpha
    for i in range(3):
        arr[:, :, i] = arr[:, :, i] * (1 - alpha) + color[i] * alpha
    return arr


# ---- bg_dark_gradient.png: plain gradient + corner glows ----
# Used only as a fallback / for non-content slides. The cover slide
# itself uses a real lesson photo (assets/lesson-bg/{level}/{NN}.jpg)
# with a dark overlay on top, not this file directly -- see
# slideCover() in gen_pptx_deck.js.
arr = base_gradient()
arr = add_radial(arr, -120, -120, 380, (139, 92, 246), 0.24)   # purple, top-left
arr = add_radial(arr, W + 100, H + 100, 320, (20, 184, 166), 0.15)  # teal, bottom-right
arr = np.clip(arr, 0, 255)
Image.fromarray(arr.astype(np.uint8), mode="RGB").save("bg_dark_gradient.png")

# ---- bg_dark_content.png: gradient + corner glows + dot-grid texture ----
# Used as the background for every regular content slide (Hook, First
# Listen, Vocabulary, Quiz, Discussion, Grammar Recap, Describing
# Time...). Matches the dot-grid pattern from the live HTML deck
# templates (28px spacing, rgba(237,233,251,.16) at .35 opacity).
arr = base_gradient()
arr = add_radial(arr, -120, -120, 380, (139, 92, 246), 0.24)
arr = add_radial(arr, W + 100, H + 100, 320, (20, 184, 166), 0.15)
arr = np.clip(arr, 0, 255)
img = Image.fromarray(arr.astype(np.uint8), mode="RGB").convert("RGBA")
dots = Image.new("RGBA", (W, H), (0, 0, 0, 0))
dd = ImageDraw.Draw(dots)
for gy in range(0, H, 28):
    for gx in range(0, W, 28):
        dd.ellipse([gx, gy, gx + 2.8, gy + 2.8], fill=(237, 233, 251, int(255 * 0.16 * 0.35)))
img = Image.alpha_composite(img, dots)
img.convert("RGB").save("bg_dark_content.png")

print("Wrote bg_dark_gradient.png and bg_dark_content.png (1600x900)")
