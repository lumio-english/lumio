"""Round student avatars from the Lumio crew art -> assets/avatars/<id>.png (192x192).
The id is what a student's `avatar` field holds as "c:<id>" (see LumioProfiles.CHARACTER_AVATARS).
Run: python3 _docs/tools/make-avatars.py"""
from PIL import Image, ImageDraw
import os
ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
SRC = os.path.join(ROOT, 'assets', 'story', 'characters')
OUT = os.path.join(ROOT, 'assets', 'avatars')
# id: (source file, head-crop size as a share of the figure height, bg colour)
AV = {
  'lumi': ('lumi-thumbs', .78, '#FFE8C2'), 'lumi-teen': ('lumi-teen-happy', .74, '#FFD9BA'),
  'hamad': ('hamad-happy', .44, '#DDF3FF'), 'hamad-teen': ('hamad-teen-happy', .34, '#D6E4FF'),
  'noor': ('noor-happy', .52, '#FFE3D3'), 'noor-teen': ('noor-teen-happy', .34, '#D9F2EE'),
  'omar': ('omar-happy', .48, '#FFEBC8'), 'omar-teen': ('omar-teen-happy', .33, '#FFE1CC'),
  'sara': ('sara-celebrate', .52, '#FFE0E6'), 'sara-teen': ('sara-teen-happy', .30, '#FFE6D2'),
  'ziad': ('ziad-happy', .44, '#DCE6FF'), 'ziad-teen': ('ziad-teen-happy', .33, '#E0E8FF'),
}
def ink_mask(im):
    rgb = im.convert('RGB'); a = im.getchannel('A') if 'A' in im.getbands() else None
    w, h = rgb.size; px = rgb.load(); m = Image.new('L', (w, h), 0); mp = m.load()
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            if (a is None or a.getpixel((x, y)) > 20) and (r < 238 or g < 238 or b < 238): mp[x, y] = 255
    return m
os.makedirs(OUT, exist_ok=True)
for aid, (src, k, bg) in AV.items():
    im = Image.open(os.path.join(SRC, src + '.png')).convert('RGBA')
    m = ink_mask(im); x0, y0, x1, y1 = m.getbbox(); H = y1 - y0
    side = int(H * k)
    band = m.crop((x0, y0, x1, y0 + max(4, int(side * .45))))     # the head: top of the figure
    bx = band.getbbox(); cx = x0 + (bx[0] + bx[2]) / 2 if bx else (x0 + x1) / 2
    top = y0 - int(side * .06)
    box = (int(cx - side / 2), top, int(cx + side / 2), top + side)
    # white background -> transparent, then onto a soft circle
    crop = im.crop(box)
    cm = ink_mask(crop)
    crop.putalpha(cm.point(lambda v: v))
    S = 192; crop = crop.resize((S, S), Image.LANCZOS)
    out = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    circle = Image.new('L', (S * 4, S * 4), 0); ImageDraw.Draw(circle).ellipse((0, 0, S * 4 - 1, S * 4 - 1), fill=255)
    circle = circle.resize((S, S), Image.LANCZOS)
    disc = Image.new('RGBA', (S, S), bg); out.paste(disc, (0, 0), circle)
    fig = Image.new('RGBA', (S, S), (0, 0, 0, 0)); fig.paste(crop, (0, 0), crop)
    fa = Image.composite(fig.getchannel('A'), Image.new('L', (S, S), 0), circle); fig.putalpha(fa)
    out.alpha_composite(fig)
    out.save(os.path.join(OUT, aid + '.png'), optimize=True)
    print('wrote', aid, box)
