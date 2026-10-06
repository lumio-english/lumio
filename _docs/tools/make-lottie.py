"""Writes Lumio's small Lottie animations to assets/lottie/ (MIT lottie-web plays them).
Hand-built shape animations in the brand colours, so no third-party animation licences are needed:
  star-pop.json  a star that pops in with sparkles (rewards, finished lessons)
  check.json     a green tick drawn in a circle (done steps)
  flame.json     a flickering streak flame
  confetti.json  a short burst of orange/teal dots
Run: python3 _docs/tools/make-lottie.py"""
import json, math, os
OUT = os.path.join(os.path.dirname(__file__), '..', '..', 'assets', 'lottie')
def rgb(h): h = h.lstrip('#'); return [int(h[i:i+2], 16) / 255 for i in (0, 2, 4)] + [1]
def kf(frames):  # [(t, value)] -> animated property
    out = []
    for i, (t, v) in enumerate(frames):
        k = {'t': t, 's': v if isinstance(v, list) else [v]}
        if i < len(frames) - 1: k.update({'i': {'x': [0.3], 'y': [1]}, 'o': {'x': [0.5], 'y': [0]}})
        out.append(k)
    return {'a': 1, 'k': out}
def st(v): return {'a': 0, 'k': v}
def tr(p=(0, 0), s=None, r=None, o=None, a=(0, 0)):
    return {'ty': 'tr', 'p': st(list(p)), 'a': st(list(a)), 's': s or st([100, 100]), 'r': r or st(0), 'o': o or st(100), 'sk': st(0), 'sa': st(0)}
def ks(p, s=None, r=None, o=None):
    return {'o': o or st(100), 'r': r or st(0), 'p': st(list(p) + [0]), 'a': st([0, 0, 0]), 's': s or st([100, 100, 100])}
def fill(c): return {'ty': 'fl', 'c': st(rgb(c)), 'o': st(100), 'r': 1}
def stroke(c, w): return {'ty': 'st', 'c': st(rgb(c)), 'o': st(100), 'w': st(w), 'lc': 2, 'lj': 2}
def layer(ind, name, shapes, ksv, ip=0, op=90):
    return {'ddd': 0, 'ind': ind, 'ty': 4, 'nm': name, 'sr': 1, 'ks': ksv, 'ao': 0, 'shapes': shapes, 'ip': ip, 'op': op, 'st': 0, 'bm': 0}
def comp(name, layers, op=60, w=200, h=200):
    return {'v': '5.7.4', 'fr': 30, 'ip': 0, 'op': op, 'w': w, 'h': h, 'nm': name, 'ddd': 0, 'assets': [], 'layers': layers}
def star(r1, r2, c, pts=5):
    return {'ty': 'gr', 'it': [{'ty': 'sr', 'sy': 1, 'd': 1, 'pt': st(pts), 'p': st([0, 0]), 'r': st(0), 'ir': st(r2), 'is': st(0), 'or': st(r1), 'os': st(0)}, fill(c), tr()]}
def circ(d, c=None, s=None, w=0):
    it = [{'ty': 'el', 'd': 1, 'p': st([0, 0]), 's': st([d, d])}]
    if c: it.append(fill(c))
    if s: it.append(stroke(s, w))
    it.append(tr()); return {'ty': 'gr', 'it': it}

def star_pop():
    L = [layer(1, 'star', [star(62, 28, '#FBBF24'), {'ty': 'gr', 'it': [{'ty': 'sr', 'sy': 1, 'd': 1, 'pt': st(5), 'p': st([0, 0]), 'r': st(0), 'ir': st(28), 'is': st(0), 'or': st(62), 'os': st(0)}, stroke('#F97316', 6), tr()]}],
                 ks([100, 104], s=kf([(0, [0, 0, 100]), (12, [118, 118, 100]), (20, [94, 94, 100]), (28, [100, 100, 100])]), r=kf([(0, -40), (20, 6), (28, 0)])), op=60)]
    for i in range(8):
        a = i / 8 * 2 * math.pi
        x0, y0 = 100 + 40 * math.cos(a), 104 + 40 * math.sin(a); x1, y1 = 100 + 92 * math.cos(a), 104 + 92 * math.sin(a)
        lay = layer(2 + i, 'spark%d' % i, [circ(12 if i % 2 else 8, '#F97316' if i % 2 else '#22C3B5')],
                    {'o': kf([(8, 100), (30, 0)]), 'r': st(0), 'p': kf([(8, [x0, y0, 0]), (30, [x1, y1, 0])]), 'a': st([0, 0, 0]), 's': kf([(8, [0, 0, 100]), (14, [100, 100, 100]), (30, [40, 40, 100])])}, op=60)
        L.append(lay)
    return comp('star-pop', L)

def check():
    ring = layer(2, 'ring', [circ(150, '#DCFCE7'), circ(150, None, '#16A34A', 8)], ks([100, 100], s=kf([(0, [0, 0, 100]), (10, [108, 108, 100]), (16, [100, 100, 100])])), op=60)
    tick = layer(1, 'tick', [{'ty': 'gr', 'it': [
        {'ty': 'sh', 'ks': st({'i': [[0, 0], [0, 0], [0, 0]], 'o': [[0, 0], [0, 0], [0, 0]], 'v': [[-34, 2], [-10, 26], [36, -22]], 'c': False})},
        stroke('#16A34A', 14), {'ty': 'tm', 's': st(0), 'e': kf([(10, 0), (26, 100)]), 'o': st(0), 'm': 1}, tr()]}], ks([100, 100]), op=60)
    return comp('check', [tick, ring])

def flame():
    def blob(c, w, h, dy):
        v = [[0, -h], [w, 0], [0, h * .55], [-w, 0]]
        i = [[-w * .2, 0], [0, -h * .55], [w * .55, 0], [0, h * .35]]
        o = [[w * .2, 0], [0, h * .35], [-w * .55, 0], [0, -h * .55]]
        return {'ty': 'gr', 'it': [{'ty': 'sh', 'ks': st({'i': i, 'o': o, 'v': v, 'c': True})}, fill(c), tr(p=(0, dy))]}
    outer = layer(2, 'outer', [blob('#F97316', 52, 80, 0)], ks([100, 120], s=kf([(0, [100, 100, 100]), (15, [94, 108, 100]), (30, [104, 96, 100]), (45, [96, 106, 100]), (60, [100, 100, 100])]), r=kf([(0, -3), (30, 3), (60, -3)])), op=60)
    inner = layer(1, 'inner', [blob('#FBBF24', 28, 44, 18)], ks([100, 126], s=kf([(0, [100, 100, 100]), (20, [90, 112, 100]), (40, [106, 94, 100]), (60, [100, 100, 100])])), op=60)
    return comp('flame', [inner, outer])

def confetti():
    cols = ['#F97316', '#22C3B5', '#FBBF24', '#6366F1', '#FB7185']
    L = []
    for i in range(18):
        a = -math.pi / 2 + (i - 8.5) / 9 * 1.3
        d = 70 + (i * 37 % 40)
        x1, y1 = 100 + d * math.cos(a), 120 + d * math.sin(a)
        L.append(layer(i + 1, 'c%d' % i, [{'ty': 'gr', 'it': [{'ty': 'rc', 'd': 1, 'p': st([0, 0]), 's': st([10, 6 + i % 3 * 3]), 'r': st(2)}, fill(cols[i % 5]), tr()]}],
                       {'o': kf([(0, 100), (40, 100), (55, 0)]), 'r': kf([(0, 0), (55, 360 * (1 if i % 2 else -1))]),
                        'p': kf([(0, [100, 130, 0]), (22, [x1, y1, 0]), (55, [x1 + (i % 5 - 2) * 6, y1 + 60, 0])]), 'a': st([0, 0, 0]), 's': st([100, 100, 100])}, op=60))
    return comp('confetti', L)

os.makedirs(OUT, exist_ok=True)
for name, fn in (('star-pop', star_pop), ('check', check), ('flame', flame), ('confetti', confetti)):
    with open(os.path.join(OUT, name + '.json'), 'w') as f: json.dump(fn(), f, separators=(',', ':'))
    print('wrote', name)
