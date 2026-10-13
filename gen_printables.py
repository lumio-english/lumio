#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Lumio printables: the homework sheet, the writing sheet and the flashcards of every lesson, every level.

    python3.12 gen_printables.py                     # all levels, all three kinds
    python3.12 gen_printables.py level2 level3       # some levels
    python3.12 gen_printables.py level2 --only homework|writing|flashcards
    python3.12 gen_printables.py level2 --lessons 3,4

Outputs (same paths the site links to):
    worksheets/<level>/lessonNN-homework.pdf   writing/<level>/lessonNN-writing.pdf   flashcards/<level>/lessonNN-flashcards.pdf

Each stage gets its own exercises (content from lib/print_data.py, layout rules in lib/print_kit.py):
  Pre-A (4-6, not reading yet): look-and-say, listen-and-circle (a grown-up reads), tracing on school lines,
      draw-and-say; every instruction for the grown-up is in Arabic.
  Levels 1-2 (6-10, learning to read): look-and-write with letter boxes, the lesson's phonics group and its
      decodable story, sentence patterns and the common mistakes Arabic speakers make, the dialogue / Reading Lab,
      a short personal answer; handwriting trace (L1) or copy (L2), building and writing sentences.
  Levels 3-6 (10-15): vocabulary in context, the grammar rule with find-and-fix and word-order tasks, the Crew Talk or
      Reading Lab text, and a guided writing task whose length grows by level; a writing workshop sheet with a plan,
      a draft and a self-check. Answers sit upside down at the foot of the last page.
  Flashcards: picture + word on the front, Arabic (+ the example sentence from Level 1) on the back; fronts and backs
      alternate sheet by sheet and the backs are mirrored, so double-sided printing (flip on long edge) lines up for
      any number of words.
"""
import os, re, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
os.chdir(ROOT)
sys.path.insert(0, os.path.join(ROOT, "lib"))
import print_kit as K
import print_data as D

E, ar = K.E, K.ar
TEEN_TARGET = {"level3": (5, "40-60"), "level4": (6, "60-80"), "level5": (7, "80-100"), "level6": (8, "100-130")}


# ------------------------------------------------------------------ helpers
WHO = {"parent": ("With a parent", "مع ولي الأمر"), "self": ("On my own", "وحدي"), "both": ("On my own, then with a parent", "وحدي ثم مع ولي الأمر")}


def ex(n, title, title_ar="", body="", hint="", cls="", style="", who=None):
    """One exercise. who = 'parent' | 'self' | 'both': these sheets are done at home, by the child alone or with a parent."""
    h = f'<div class="hint">{hint}</div>' if hint else ""
    t_ar = f'<span class="ar">{E(title_ar)}</span>' if title_ar else ""
    chip = f'<span class="who {who}">{E(WHO[who][0])} · {ar(WHO[who][1])}</span>' if who else ""
    return f'<div class="ex {cls}" style="{style}"><h2><span class="n">{n}</span>{E(title)}{chip}{t_ar}</h2>{h}{body}</div>'


def lines(n, h=7.4):
    return '<div class="lines">' + "".join(f'<div class="line" style="height:{h}mm"></div>' for _ in range(n)) + "</div>"


def single_words(words):
    """Words that make good picture / spelling items (one or two short words)."""
    return [w for w in words if len(w["en"]) <= 14 and len(w["en"].split()) <= 2]


def gapped(sentence, word):
    """The example sentence with the lesson word (or a form of it: eyebrow -> eyebrows) blanked, or None."""
    m = re.search(r"\b" + re.escape(word) + r"\w*", sentence, re.I)
    if not m or len(word) < 2:
        return None
    return sentence[:m.start()] + " <span class=\"gap\"></span> " + sentence[m.end():], m.group(0)


def scramble(sentence, r):
    words = re.findall(r"[A-Za-z0-9'’\-]+", sentence)
    if len(words) < 3:
        return None
    order = words[:]
    for _ in range(8):
        r.shuffle(order)
        if order != words:
            break
    return " / ".join(order)


def writing_task(p, prefer="prompt"):
    """The writing task: the Hub prompt when it really fits the lesson, otherwise the lesson goal turned round.
    Any length inside a prompt ("using at least 3 sentences") is dropped: the sheet states the level's own target."""
    t, a = _writing_task(p, prefer)
    t = re.sub(r",?\s*(using|in|with|writing)\s+(at least\s+)?\w+\s+sentences?", "", t, flags=re.I)
    a = re.sub(r"\s*(باستخدام|في)\s+\S+\s+جمل[^.؟]*", "", a)
    return t, a


def _writing_task(p, prefer):
    pr = p["prompt"] if prefer == "prompt" else None
    goal = p["goal"].strip().rstrip(".")
    if pr:
        tw = set(re.findall(r"[a-z]{4,}", (p["title"] + " " + p["goal"] + " " + " ".join(w["en"] for w in p["words"])).lower()))
        if len(set(re.findall(r"[a-z]{4,}", pr["en"].lower())) & tw) >= 2:
            return pr["en"], pr.get("ar", "")
    m = re.match(r"I can (talk|write|say|tell|describe|ask|give|make|compare|use|read)(?: about)?\s+(.*)", goal, re.I)
    if m:
        body = m.group(2)
        for a, b in ((r"\bmy\b", "your"), (r"\bmyself\b", "yourself"), (r"\bI\b", "you"), (r"\bme\b", "you"), (r"\bmine\b", "yours"), (r"\bam\b", "are")):
            body = re.sub(a, b, body)
        verb = m.group(1).lower()
        lead = {"talk": "Write about", "describe": "Describe", "tell": "Tell", "compare": "Compare", "ask": "Write questions to ask",
                "give": "Give", "make": "Make", "use": "Use", "say": "Write", "write": "Write", "read": "Write about"}[verb]
        return f"{lead} {body}.", ""
    # any other goal: the goal itself as an instruction ("I can name rooms in my house" -> "Name the rooms in your house.")
    m = re.match(r"(?:I can\s+)?(.*)", goal, re.I)
    body = re.sub(r"^understand and\s+", "", m.group(1).strip(), flags=re.I)
    for a, b in ((r"\bmy\b", "your"), (r"\bmyself\b", "yourself"), (r"\bI\b", "you"), (r"\bme\b", "you"), (r"\bam\b", "are")):
        body = re.sub(a, b, body)
    body = re.sub(r"^(name)\s+(?!the\b)", r"\1 the ", body, flags=re.I)
    body = re.sub(r"^follow\s+(.*)", r"write the \1 you know", body, flags=re.I)
    body = re.sub(r"^count from (.*)", r"write the numbers from \1 in words", body, flags=re.I)
    tail = "" if body.lower().startswith("write") else " Use full sentences."
    return (body[:1].upper() + body[1:]).rstrip(".") + "." + tail, ""


def ruled(h=7.4, n=40):
    """A writing area that fills the space left on the page with evenly spaced lines (extra lines are hidden)."""
    return '<div class="ruled">' + "".join(f'<div class="line" style="height:{h}mm"></div>' for _ in range(n)) + "</div>"


def parent_box(html_ar):
    return f'<div class="parent"><b>لولي الأمر:</b> {html_ar}</div>'


def sign(kid=True):
    """Home sheets: the child rates their own work, a parent signs (no teacher box)."""
    me = "How did I do?" if kid else "My effort"
    return (f'<div class="sign"><span>{me} <b class="stars">☆ ☆ ☆</b></span>'
            f'<span>Parent signature<i></i></span></div>')


def key_strip(items):
    if not items:
        return ""
    return '<div class="key"><b>Answers:</b> ' + " &nbsp;·&nbsp; ".join(items) + "</div>"


def kicker(p, kind):
    return f"{p['label']} · Lesson {p['num']} · {kind}"


def foot(p, kind, i, n):
    return K.footer(f"Lumio English · {p['label']} · Lesson {p['num']} · {kind}", f"Page {i} of {n}" if n > 1 else "Small Steps · Big Futures")


def pic_or_ar(w, size=260, cls="pic"):
    src = K.picture(w, size)
    return f'<img class="{cls}" src="{src}" alt="">' if src else f'<div class="{cls} nopic">{ar(w["ar"])}</div>'


SHEET_CSS = """
.pics{display:grid;gap:2.4mm}
.pics .c{border:.3mm solid #EFE6DA;border-radius:2.6mm;padding:1.6mm;text-align:center;display:flex;flex-direction:column;align-items:center;gap:1mm}
.pic{width:100%;height:var(--ph,24mm);object-fit:contain}
.nopic{display:flex;align-items:center;justify-content:center;background:#FFF6EA;border-radius:2mm;font-size:13pt}
.pics .w{font:700 12pt Andika,Nunito;color:#2A2118}
.circle-row{display:grid;grid-template-columns:7mm repeat(3,1fr);gap:3mm;align-items:center}
.circle-row .num{font:800 12pt Nunito;color:#C2530A}
.circle-row .o{border:.3mm solid #E6DACB;border-radius:4mm;height:var(--ch,30mm);padding:2mm;display:flex;align-items:center;justify-content:center}
.circle-row .o img{max-width:100%;max-height:100%;object-fit:contain}
.drawbox{flex:1;min-height:30mm;border:.4mm dashed #C9B8A6;border-radius:3mm;position:relative}
.frame{font:700 13pt Andika,Nunito;margin-top:2mm}
.boxes{display:flex;gap:.9mm;justify-content:center;flex-wrap:wrap}
.boxes i{width:6.4mm;height:7.6mm;border:.3mm solid #8A7A6A;border-radius:1mm;display:flex;align-items:center;justify-content:center;font:700 11pt Andika;font-style:normal;color:#2A2118}
.boxes i.sp{border:0;width:2.4mm}
.boxes.small{gap:.5mm;flex-wrap:nowrap}.boxes.small i{width:4.6mm;height:6.4mm;font-size:9.5pt}.boxes.small i.sp{width:1.6mm}
.gpic{width:9mm;height:9mm;object-fit:contain;vertical-align:middle;margin-right:2mm}
.lw{display:grid;gap:2.4mm}
.lw .c{border:.3mm solid #EFE6DA;border-radius:2.6mm;padding:1.8mm;display:flex;flex-direction:column;align-items:center;gap:1.6mm}
.lw .pic{width:24mm;height:22mm}
.match{display:grid;grid-template-columns:1fr 26mm 1fr;align-items:center;row-gap:2.3mm}
.match .l{font:700 11pt Andika,Nunito;display:flex;justify-content:space-between;align-items:center;gap:2mm}
.match .r{font:700 11pt Cairo,Nunito,sans-serif;direction:rtl;display:flex;justify-content:space-between;align-items:center;gap:2mm}
.dot{width:2.4mm;height:2.4mm;border-radius:50%;background:#2A2118;flex:0 0 2.4mm}
.story{font:400 12.5pt/1.75 Andika,Nunito;background:#F6FBF8;border:.35mm solid #CFE8DC;border-radius:3mm;padding:2.6mm 3.4mm}
.sounds{display:flex;gap:2mm;flex-wrap:wrap;margin-bottom:2mm}
.sounds b{border:.4mm solid #0D9488;color:#0D9488;border-radius:2mm;padding:.4mm 2.6mm;font:800 12pt Andika}
.wordrow{display:flex;flex-wrap:wrap;gap:2mm 6mm;font:700 12.5pt Andika,Nunito}
.sort{display:grid;gap:2.4mm}
.sort .col{border:.35mm solid #CFE8DC;border-radius:2.6mm;min-height:24mm;padding:1.6mm 2.4mm}
.sort .col b{display:block;text-align:center;font:800 12pt Andika;color:#0D9488;border-bottom:.3mm solid #CFE8DC;margin-bottom:1.6mm}
.pick{display:grid;grid-template-columns:6mm 1fr 1fr;gap:2mm 3mm;align-items:center;font:700 10.5pt Andika,Nunito}
.pick span{border:.3mm solid #E6DACB;border-radius:2mm;padding:1.2mm 2.4mm}
.dlg{display:flex;flex-direction:column;gap:1.2mm;font-size:10.2pt}
.dlg div{display:flex;gap:2mm}.dlg b{flex:0 0 13mm;color:#C2530A}
.passage{font:400 10pt/1.55 Nunito;column-gap:6mm}
.passage p+p{margin-top:1.4mm}
.check{display:grid;grid-template-columns:1fr 1fr;gap:1.2mm 5mm;font:600 9pt Nunito}
.plan{display:grid;gap:2.4mm}
.plan div{border:.35mm solid #E6DACB;border-radius:2.6mm;padding:1.6mm 2.4mm;min-height:22mm;font:800 8.6pt Nunito;color:#C2530A}
.fb{display:grid;grid-template-columns:repeat(4,1fr);gap:2mm;font:700 8.6pt Nunito;text-align:center}
.fb div{border:.35mm solid #E6DACB;border-radius:2mm;padding:1.4mm}.fb i{display:block;font-style:normal;color:#C9B8A6;letter-spacing:1mm;font-size:11pt}
.models{display:flex;flex-direction:column;gap:1mm;font:600 9.8pt Nunito;color:#1E4FA3}
"""


# ================================================================== PRE-A
def prea_letters(p):
    """The letters of an alphabet lesson ("S is for sun"); empty when only a few words use that pattern (a review)."""
    if sum(bool(re.match(r"^[A-Z] is for", w.get("example", ""))) for w in p["words"]) * 2 < len(p["words"]):
        return []
    out = []
    for w in p["words"]:
        m = re.match(r"^([A-Z]) is for", w.get("example", ""))
        if m and m.group(1) not in out:
            out.append(m.group(1))
    return out


def homework_prea(p, density):
    r = K.rng(p["level"], p["num"], "hw")
    ws = [w for w in single_words(p["words"]) if K.picture(w)]
    look = ws[: (8 if density < 2 else 6)]
    cols = 4
    look_html = f'<div class="pics" style="grid-template-columns:repeat({cols},1fr);--ph:{19 - 2 * density}mm">' + "".join(
        f'<div class="c">{pic_or_ar(w, 260)}<div class="w kid">{E(w["en"])}</div></div>' for w in look) + "</div>"
    # listen and circle: a grown-up says the word, the child circles its picture among three
    n_rows = min(len(ws), 3)
    targets = r.sample(ws, n_rows) if len(ws) >= 3 else []
    rows, said = [], []
    for i, t in enumerate(targets, 1):
        others = [w for w in ws if w is not t and w not in targets] or [w for w in ws if w is not t]
        opts = r.sample(others, min(2, len(others))) + [t]; r.shuffle(opts)
        rows.append(f'<div class="circle-row"><span class="num">{i}</span>' + "".join(
            f'<div class="o"><img src="{K.picture(o, 240)}" alt=""></div>' for o in opts) + "</div>")
        said.append(f'<span class="en">{i}) {E(t["en"])}</span>')
    circle = f'<div style="display:flex;flex-direction:column;gap:2.4mm;--ch:{24 - 3 * density}mm">' + "".join(rows) + "</div>"
    letters = prea_letters(p)
    if letters:
        show = letters[: (2 if density < 2 else 1)]
        trace = "".join(f'<div class="hw" style="--h:14mm;margin-bottom:2mm"><span><b class="model">{L}{L.lower()}</b>'
                        f'<b class="trace">&nbsp;&nbsp;{L}{L.lower()}&nbsp;&nbsp;{L}{L.lower()}&nbsp;&nbsp;{L}{L.lower()}</b></span></div>' for L in show)
        more = f" All {len(letters)} letters are on the writing sheet." if len(letters) > len(show) else ""
        third = ex(3, "Trace the letters", "تتبّع الحروف", trace, "Start at the top. Say the sound as you write." + more, who="parent")
    else:
        frame = {"It is ___": "It is ________.", "I like ___": "I like ________.", "I can ___": "I can ________.",
                 "I have a ___": "I have a ________."}.get(p["focus"], "This is my ________.")
        third = ex(3, "Draw and say", "ارسم وقل", f'<div class="drawbox"></div><div class="frame kid">{E(frame)}</div>',
                   "Draw one of today's words. Then say the sentence to your parent.", cls="grow", who="both")
    words_en = '<span class="en">' + E(", ".join(w["en"] for w in p["words"][:8])) + "</span>"
    parent = parent_box(
        f'تعلّم طفلكم اليوم: {words_en}. <b>التمرين ١:</b> أشيروا إلى كل صورة وقولوا الكلمة، ثم يكرّرها طفلكم. '
        f'<b>التمرين ٢:</b> اقرؤوا الكلمة بصوت واضح، ويضع طفلكم دائرة حول صورتها: {" ، ".join(said)}. '
        + ("<b>التمرين ٣:</b> يبدأ الطفل من أعلى الحرف ويتتبّعه وهو يقول صوته." if letters else "<b>التمرين ٣:</b> يرسم طفلكم ثم يقول الجملة بمساعدتكم."))
    body = (K.header(kicker(p, "Homework"), p["title"], p["title_ar"]) + '<div class="flow kid">'
            + ex(1, "Look and say", "انظر وقل", look_html, "Point to each picture and say the word.", who="parent")
            + ex(2, "Listen and circle", "استمع وضع دائرة", circle, "Your parent says a word. Circle the picture.", who="parent")
            + third + parent + sign() + "</div>" + foot(p, "Homework", 1, 1))
    return [K.page(body)], SHEET_CSS


def writing_prea(p, density):
    letters = prea_letters(p)
    per_page = 5 if density == 0 else 4
    if letters:
        items = [("letter", L, next((w for w in p["words"] if w.get("example", "").startswith(L + " is for")), None)) for L in letters]
    else:
        items = [("word", w["en"], w) for w in single_words(p["words"]) if len(w["en"]) <= 9]
        if len(items) > 10:   # a review lesson: ten words, spread over the level
            items = items[:: max(1, len(items) // 10)][:10]
    pages, chunks = [], [items[i:i + per_page] for i in range(0, len(items), per_page)] or [[]]
    for pi, chunk in enumerate(chunks, 1):
        rows = []
        for kind, text, w in chunk:
            src = K.picture(w, 220) if w else None
            img = f'<img src="{src}" style="width:20mm;height:20mm;object-fit:contain" alt="">' if src else '<div style="width:20mm"></div>'
            model = f"{text}{text.lower()}" if kind == "letter" else text
            trace = ("&nbsp;&nbsp;" + model) * (3 if kind == "letter" else 2)
            rows.append(f'<div style="display:flex;gap:3mm;align-items:center"><div style="text-align:center">{img}'
                        f'<div class="kid" style="font:700 10pt Andika">{E(w["en"]) if w else ""}</div></div><div style="flex:1;display:flex;flex-direction:column;gap:2mm">'
                        f'<div class="hw" style="--h:15mm"><span><b class="model">{E(model)}</b><b class="trace">{E(trace).replace("&amp;nbsp;", "&nbsp;")}</b></span></div>'
                        f'<div class="hw" style="--h:15mm"></div></div></div>')
        hint = "Trace the grey letters, then write them on your own." if letters else "Trace the grey word, then write it on your own."
        body = (K.header(kicker(p, "Writing"), p["title"], p["title_ar"], who=(pi == 1)) + '<div class="flow kid">'
                + ex(1 if pi == 1 else "+", "Trace and write" if pi == 1 else "Keep going", "تتبّع واكتب", '<div style="display:flex;flex-direction:column;gap:3.6mm">' + "".join(rows) + "</div>", hint, who="parent")
                + (parent_box("اجلسوا مع طفلكم، وأمسكوا القلم معه في البداية. يبدأ كل حرف من الخط العلوي، ويقول طفلكم صوت الحرف أثناء الكتابة. لا بأس بالأخطاء: المهم أن يتتبّع الشكل كاملًا.") if pi == len(chunks) else "")
                + "</div>" + foot(p, "Writing", pi, len(chunks)))
        pages.append(K.page(body))
    return pages, SHEET_CSS


# ================================================================== LEVELS 1-2
def letter_boxes(word, give_first):
    out = []
    small = len(word) > 7
    for i, ch in enumerate(word):
        if ch == " ":
            out.append('<i class="sp"></i>')
        else:
            out.append(f"<i>{E(ch) if (give_first and i == 0) else ''}</i>")
    return f'<div class="boxes{" small" if small else ""}">' + "".join(out) + "</div>"


def phonics_block(p, n, r, level):
    u = p["phonics"]
    sounds = "".join(f"<b>{E(s['letter'].replace('_', '-'))}</b>" for s in u["sounds"])
    words = [w["en"] for w in u.get("words", [])]
    tricky = ", ".join(t["en"] for t in u.get("tricky", []))
    story = u.get("story", {}).get("en", "")
    if level == "level2" and len(u["sounds"]) >= 2 and words:
        # sort the words by their sound (columns = the group's spellings)
        keys = []
        for s in u["sounds"]:
            g = s["letter"].split(",")[0].strip()
            if g not in keys:
                keys.append(g)
        def has(wd, g):
            if "_" in g:
                a, b = g.split("_")
                return re.search(a + r"[a-z]" + b + r"\b", wd) is not None
            return g in wd
        story_words = re.findall(r"[a-z]+", u.get("story", {}).get("en", "").lower())
        cand = list(dict.fromkeys([w.lower() for w in words] + story_words))
        per = {k_: [w for w in cand if has(w, k_) and sum(has(w, g) for g in keys) == 1][:3] for k_ in keys}
        keys = [k_ for k_ in keys if per[k_]][:4]
        pool = [w for k_ in keys for w in per[k_]]
        r.shuffle(pool)
        cols = "".join(f'<div class="col"><b>{E(g.replace("_", "-"))}</b></div>' for g in keys)
        task = (f'<div class="wordrow" style="margin-bottom:2mm">{" ".join(f"<span>{E(w)}</span>" for w in pool)}</div>'
                f'<div class="sort" style="grid-template-columns:repeat({len(keys)},1fr)">{cols}</div>')
        key = "; ".join(f"{g.replace('_', '-')}: " + ", ".join(w for w in pool if has(w, g)) for g in keys)
        hint = "Read each word. Write it under its sound."
    else:
        pool = words[:10]
        task = f'<div class="wordrow">{" ".join(f"<span>{E(w)}</span>" for w in pool)}</div>'
        key = ""
        hint = "Read each word aloud to your parent. Then colour the sound in each word."
    st = (f'<div class="story" style="margin-top:2.4mm"><b style="font:800 9pt Nunito;color:#0D9488">READ THE STORY</b><br>{E(story)}'
          f'<div style="font:600 8.6pt Nunito;margin-top:1mm"><span class="tick"></span>I read it aloud to my parent</div></div>') if story else ""
    tr = f'<div style="font:700 9pt Nunito;margin-top:1.6mm">Tricky words to learn: <span style="color:#C2530A">{E(tricky)}</span></div>' if tricky else ""
    return ex(n, f"Phonics: {u['unit']}", "الأصوات", f'<div class="sounds">{sounds}</div>{task}{st}{tr}', hint, who="both"), key


def match_block(n, ws, r):
    left = ws[:]
    right = ws[:]; r.shuffle(right)
    rows = "".join(f'<div class="l"><span>{E(a["en"])}</span><span class="dot"></span></div><div></div>'
                   f'<div class="r"><span>{E(K.arfix(b["ar"]))}</span><span class="dot"></span></div>' for a, b in zip(left, right))
    return ex(n, "Match the word to its meaning", "صِل الكلمة بمعناها", f'<div class="match">{rows}</div>', "Draw a line from each English word to its Arabic meaning.", who="self")


def homework_kid(p, density):
    lv = p["level"]; L1 = lv == "level1"
    r = K.rng(lv, p["num"], "hw")
    ws = [w for w in single_words(p["words"]) if K.picture(w)]
    keys = []
    # ---- page 1: words
    n_look = min(len(ws), 6 if density < 2 else 4)
    look = r.sample(ws, n_look) if len(ws) > n_look else ws
    look_html = '<div class="lw" style="grid-template-columns:repeat(3,1fr)">' + "".join(
        f'<div class="c">{pic_or_ar(w, 240)}{letter_boxes(w["en"], L1)}</div>' for w in look) + "</div>"
    keys.append("1) " + ", ".join(w["en"] for w in look))
    blocks = [ex(1, "Look and write", "انظر واكتب", look_html, "Write one letter in each box." + (" The first letter is there to help you." if L1 else ""), who="self")]
    n = 2
    if p["phonics"]:
        b, k = phonics_block(p, n, r, lv); blocks.append(b)
        if k: keys.append(f"{n}) {k}")
        n += 1
    if not p["phonics"] or density == 0:
        mw = r.sample(p["words"], min(len(p["words"]), 5 if p["phonics"] else 6))
        blocks.append(match_block(n, mw, r)); n += 1
    p1_blocks = blocks
    # ---- page 2: sentences, reading, writing
    blocks = []
    t, mistakes = p["topic"], p["mistakes"]
    if t:
        rule = (f'<div class="rule"><div class="en">{E(t["explanation"])}</div>{ar(t.get("explanationAr", ""))}'
                f'<div class="exs">' + "".join(f"<span>{E(e['en'])}</span>" for e in t.get("examples", [])[:3]) + "</div></div>")
        body = rule
        if mistakes:
            rows = []
            for i, m in enumerate(mistakes[:3], 1):
                a, b = (m[0], m[1]) if r.random() < .5 else (m[1], m[0])
                rows.append(f"<b>{i}</b><span>{E(a)}</span><span>{E(b)}</span>")
                keys.append(f"{n}.{i}) {m[1]}")
            body += f'<div class="pick" style="margin-top:2.4mm">{"".join(rows)}</div>'
        blocks.append(ex(n, f"Grammar: {t['title']}", t.get("titleAr", ""), body, "Read the rule with your parent (the Arabic helps). Then circle the correct sentence on your own." if mistakes else "Read the rule and the examples aloud.", who="both"))
        n += 1
    # sentence gaps from the lesson's own examples
    gaps = []
    for w in r.sample(p["words"], len(p["words"])):
        g = gapped(w.get("example", ""), w["en"]) if w.get("example") else None
        if g and len(gaps) < (5 if density < 2 else 4) and g[1].lower() not in [x[1].lower() for x in gaps]:
            src = K.picture(w, 160)
            clue = f'<img class="gpic" src="{src}" alt="">' if src else f'<span class="ar" style="margin-right:2mm;color:#8A7A6A">({E(w["ar"])})</span>'
            gaps.append((clue + g[0], g[1]))
    if gaps:
        bank = '<div class="bank">' + "".join(f"<span>{E(x[1])}</span>" for x in sorted(gaps, key=lambda x: x[1].lower())) + "</div>"
        items = "".join(f"<li><b>{i}</b><span>{g[0]}</span></li>" for i, g in enumerate(gaps, 1))
        blocks.append(ex(n, "Complete the sentences", "أكمل الجمل", bank + f'<ol class="items" style="gap:1.2mm">{items}</ol>', "Look at the picture. Write the word from the box.", who="self"))
        keys.append(f"{n}) " + ", ".join(g[1] for g in gaps)); n += 1
    ps = p["passage"]
    if ps and density < 3:
        paras = "".join(f"<p>{E(K.strip_marks(x))}</p>" for x in ps["paras"][:2 if density == 0 else 1])
        qs = [q for k_, q in ps["questions"] if k_ == "find"][:2] + [q for k_, q in ps["questions"] if k_ == "you"][:1]
        qh = "".join(f"<li><b>{i}</b><span>{E(q)}</span></li>" for i, q in enumerate(qs, 1))
        blocks.append(ex(n, f"Read: {ps['title']}", ps.get("title_ar", ""), f'<div class="passage">{paras}</div><ol class="items" style="margin-top:2mm">{qh}</ol>' + lines(2),
                         "Read the Reading Lab text again, then read it aloud to your parent. Answer the questions.", who="both"))
        n += 1
    elif p["dialogue"] and density < 3:
        dl = "".join(f"<div><b>{E(sp if len(sp) > 1 else ('Omar' if sp == 'L' else 'Sara'))}</b><span>{E(en)}</span></div>" for sp, en, *_ in p["dialogue"][:4])
        blocks.append(ex(n, "Read the dialogue", "اقرأ الحوار", f'<div class="dlg">{dl}</div><div style="font:600 8.6pt Nunito;margin-top:1.6mm"><span class="tick"></span>We read it together and took turns.</div>',
                         "Read it aloud with your parent: you read one person, your parent reads the other. Then swap.", who="parent"))
        n += 1
    task, _ = writing_task(p, "goal")
    if L1:
        blocks.append(ex(n, "Your turn: draw and write", "دورك: ارسم واكتب", '<div class="drawbox"></div>' + lines(2, 8.4),
                         "Draw something from today's lesson that is about you. Then write a sentence about it, like the sentences above.", cls="grow", who="self"))
    else:
        blocks.append(ex(n, "Your turn: write", "دورك: اكتب", lines(3, 8.4) + '<div class="drawbox" style="min-height:18mm;margin-top:2mm"></div>',
                         E(task) + " Then draw a small picture to go with it.", cls="grow", who="self"))
    words_en = '<span class="en">' + E(", ".join(w["en"] for w in p["words"][:8])) + "</span>"
    parent = parent_box(f'كلمات الدرس: {words_en}. التمارين المكتوب عليها <b>«وحدي»</b> يحلّها طفلكم بنفسه، والمكتوب عليها <b>«مع ولي الأمر»</b> تحتاج مشاركتكم: استمعوا إليه وهو يقرأ، وساعدوه في الكلمات الصعبة دون أن تعطوه الإجابة مباشرة. الإجابات مكتوبة مقلوبة أسفل الصفحة: صحّحوا معه في النهاية واحتفلوا بما أنجزه.')
    page1 = K.header(kicker(p, "Homework"), p["title"], p["title_ar"]) + '<div class="flow kid">' + "".join(p1_blocks) + parent + "</div>" + foot(p, "Homework", 1, 2)
    page2 = (K.header(kicker(p, "Homework"), p["title"], p["title_ar"], who=False) + '<div class="flow kid">' + "".join(blocks) + sign()
             + key_strip([E(k) for k in keys]) + "</div>" + foot(p, "Homework", 2, 2))
    return [K.page(page1), K.page(page2)], SHEET_CSS


def writing_kid(p, density):
    lv = p["level"]; L1 = lv == "level1"
    r = K.rng(lv, p["num"], "wr")
    ws = [w for w in single_words(p["words"]) if len(w["en"]) <= 11]
    ws = ws[: (8 if density == 0 else 6)]
    rows = []
    for w in ws:
        src = K.picture(w, 200)
        img = f'<img src="{src}" style="width:14mm;height:14mm;object-fit:contain" alt="">' if src else f'<div style="width:14mm">{ar(w["ar"])}</div>'
        content = (f'<b class="model">{E(w["en"])}</b><b class="trace">&nbsp;&nbsp;{E(w["en"])}&nbsp;&nbsp;{E(w["en"])}</b>' if L1
                   else f'<b class="model">{E(w["en"])}</b>')
        rows.append(f'<div style="display:flex;gap:3mm;align-items:center">{img}<div class="hw" style="--h:{12 if L1 else 11}mm;flex:1"><span>{content}</span></div></div>')
    page1 = (K.header(kicker(p, "Writing"), p["title"], p["title_ar"]) + '<div class="flow kid">'
             + ex(1, "Trace, then write" if L1 else "Copy the words", "تتبّع واكتب" if L1 else "انسخ الكلمات",
                  '<div style="display:flex;flex-direction:column;gap:2.6mm">' + "".join(rows) + "</div>",
                  "Trace the grey words, then write each word once more on the line." if L1 else "Write each word two more times on the line. Keep your letters on the lines.", who="self")
             + "</div>" + foot(p, "Writing", 1, 2))
    # page 2: copy sentences, build sentences, write about you
    exs = [w["example"] for w in p["words"] if w.get("example")]
    copy = exs[:3]
    copy_html = "".join(f'<div style="font:700 11.5pt Andika;margin-top:1.4mm">{E(s)}</div><div class="hw" style="--h:{11 if L1 else 9}mm"></div>' for s in copy)
    pool = [s for s in exs[3:] + exs[:3] if 3 <= len(s.split()) <= (6 if L1 else 9)]
    build = []
    for s in pool:
        sc = scramble(s, r)
        if sc and sc not in [b[0] for b in build]:
            build.append((sc, s))
        if len(build) == (2 if L1 else 3):
            break
    build_html = "".join(f'<li><b>{i}</b><span class="kid" style="font-size:11.5pt">{E(b[0])}</span></li>' for i, b in enumerate(build, 1))
    frame = (p["topic"] or {}).get("examples", [{}])[0].get("en") if p["topic"] else (exs[0] if exs else "")
    me = ex(3, "Write about you", "اكتب عن نفسك", f'<div class="hint">Like this: <b>{E(frame)}</b></div>' + lines(2 if L1 else 3, 9),
            "Write " + ("one or two sentences" if L1 else "three sentences") + " about you. Start with a capital letter and end with a full stop. Then read them to your parent.", cls="grow", who="self")
    page2 = (K.header(kicker(p, "Writing"), p["title"], p["title_ar"], who=False) + '<div class="flow kid">'
             + ex(1, "Copy the sentences", "انسخ الجمل", copy_html, "Read each sentence aloud to your parent, then copy it.", who="both")
             + (ex(2, "Build the sentence", "رتّب الجملة", f'<ol class="items">{build_html}</ol>' + lines(len(build), 8.6), "Put the words in order and write the sentence.", who="self") if build else "")
             + me + parent_box("يكتب طفلكم وحده، ثم يقرأ لكم ما كتب. راقبوا شكل الحروف على السطور وبداية الجملة بحرف كبير ونهايتها بنقطة. إجابات تمرين ترتيب الجملة مقلوبة أسفل الصفحة.")
             + key_strip([E(f"2.{i}) {b[1]}") for i, b in enumerate(build, 1)]) + "</div>" + foot(p, "Writing", 2, 2))
    return [K.page(page1), K.page(page2)], SHEET_CSS


# ================================================================== LEVELS 3-6
def review_mistakes(level, r, k=3):
    """Lesson 20 (Big Review): one common mistake from each of several of the level's grammar topics."""
    import common_mistakes as CM
    seen, out = set(), []
    for n in sorted(D.lessons(level)):
        t, ms = D.grammar(level, n)
        if t and ms and t["title"] not in seen:
            seen.add(t["title"]); out.append(r.choice(ms))
    r.shuffle(out)
    return out[:k]


def homework_teen(p, density):
    lv = p["level"]; hi = lv in ("level5", "level6")
    r = K.rng(lv, p["num"], "hw")
    keys = []
    # ---- 1. vocabulary in context
    gaps = []
    for w in r.sample(p["words"], len(p["words"])):
        g = gapped(w.get("example", ""), w["en"]) if w.get("example") else None
        if g and g[1].lower() not in [x[1].lower() for x in gaps]:
            # one answer per gap: an Arabic clue (L3-4) or the first letter (L5-6)
            clue = (f' <span class="ar" style="color:#8A7A6A;font-size:8.6pt">({E(K.arfix(w["ar"]))})</span>' if not hi else "")
            text = g[0].replace('<span class="gap"></span>', f'<span class="gap">{E(g[1][0]) if hi else ""}</span>', 1) + clue
            gaps.append((text, g[1]))
        if len(gaps) == (8 if density == 0 else 6):
            break
    extra = [w["en"] for w in p["words"] if w["en"].lower() not in [g[1].lower() for g in gaps]][:1 if hi else 0]
    bank_words = sorted([g[1] for g in gaps] + extra, key=str.lower)
    v_body = '<div class="bank">' + "".join(f"<span>{E(b)}</span>" for b in bank_words) + "</div>" + \
             '<ol class="items">' + "".join(f"<li><b>{i}</b><span>{g[0]}</span></li>" for i, g in enumerate(gaps, 1)) + "</ol>"
    keys.append("1) " + ", ".join(g[1] for g in gaps))
    blocks = [ex(1, "Vocabulary in context", "المفردات في سياقها", v_body, "Complete each sentence with a word from the box." + (" One word is extra." if extra else ""), who="self")]
    n = 2
    if not hi and density < 2:
        mw = r.sample(p["words"], min(len(p["words"]), 5))
        blocks.append(match_block(n, mw, r)); n += 1
    elif hi and density < 2:
        pick = r.sample([w["en"] for w in p["words"]], min(3, len(p["words"])))
        blocks.append(ex(n, "Use the words", "استخدم الكلمات", f'<div class="bank">' + "".join(f"<span>{E(x)}</span>" for x in pick) + "</div>" + lines(3),
                         "Write one sentence of your own with each word.", who="self")); n += 1
    # ---- 2. grammar
    t = p["topic"]
    mistakes = p["mistakes"] or (review_mistakes(lv, r) if p["review"] else [])
    g_body = ""
    if t:
        g_body += (f'<div class="rule"><div class="en"><b>{E(t["title"])}.</b> {E(t["explanation"])}</div>{ar(t.get("explanationAr", ""))}'
                   '<div class="exs">' + "".join(f"<span>{E(e['en'])}</span>" for e in t.get("examples", [])[:3]) + "</div></div>")
    if mistakes:
        g_body += '<div style="font:800 9pt Nunito;margin:2.4mm 0 1mm">A. Find and fix the mistake. Write the correct sentence.</div><ol class="items">' + \
                  "".join(f"<li><b>{i}</b><span>{E(m[0])}</span></li>" for i, m in enumerate(mistakes[:3], 1)) + "</ol>" + lines(min(3, len(mistakes)), 7)
        keys.append(f"{n}A) " + " | ".join(m[1] for m in mistakes[:3]))
    exs = [e["en"] for e in (t or {}).get("examples", [])] or [w["example"] for w in p["words"] if w.get("example")]
    order = []
    for s in r.sample(exs, len(exs)):
        sc = scramble(s, r)
        if sc and 4 <= len(s.split()) <= 11:
            order.append((sc, s))
        if len(order) == (3 if density < 2 else 2):
            break
    if order:
        g_body += '<div style="font:800 9pt Nunito;margin:2.4mm 0 1mm">B. Put the words in the right order.</div><ol class="items">' + \
                  "".join(f"<li><b>{i}</b><span>{E(o[0])}</span></li>" for i, o in enumerate(order, 1)) + "</ol>" + lines(len(order), 7)
        keys.append(f"{n}B) " + " | ".join(o[1] for o in order))
    page1_blocks = blocks[:]
    grammar_block = ex(n, "Grammar" + (f": {t['title']}" if t else ": review"), (t or {}).get("titleAr", "مراجعة القواعد"), g_body, who="self")
    n += 1
    # ---- 3. reading
    ps = p["passage"]
    if ps:
        paras = "".join(f"<p>{E(K.strip_marks(x))}</p>" for x in ps["paras"][: (4 if density == 0 else 3 if density == 1 else 2)])
        qs = [q for k_, q in ps["questions"] if k_ == "find"][:2] + [q for k_, q in ps["questions"] if k_ == "think"][:1] + [q for k_, q in ps["questions"] if k_ == "you"][:1]
        rd = ex(n, f"Reading: {ps['title']}", ps.get("title_ar", ""),
                f'<div class="passage">{paras}</div><ol class="items" style="margin-top:2mm">' + "".join(f"<li><b>{i}</b><span>{E(q)}</span></li>" for i, q in enumerate(qs, 1)) + "</ol>" + lines(len(qs), 7),
                "Read the Reading Lab text again. Answer in full sentences.", who="self")
    else:
        dl = p["dialogue"][: (6 if density < 2 else 4)]
        vocab = sorted({w["en"] for w in p["words"]}, key=len, reverse=True)
        out, used = [], []
        for sp, en, *_ in dl:
            hit = next((v for v in vocab if v not in used and re.search(r"\b" + re.escape(v) + r"\b", en, re.I)), None)
            if hit and len(used) < 4:
                used.append(hit)
                en_h = re.sub(r"\b" + re.escape(hit) + r"\b", '<span class="gap"></span>', E(en), count=1, flags=re.I)
            else:
                en_h = E(en)
            out.append(f"<div><b>{E(sp)}</b><span>{en_h}</span></div>")
        bank = ('<div class="bank">' + "".join(f"<span>{E(u)}</span>" for u in sorted(used, key=str.lower)) + "</div>") if used else ""
        if used:
            keys.append(f"{n}) " + ", ".join(used))
        rd = ex(n, "Crew Talk: read and complete", "حوار الفريق", bank + f'<div class="dlg">{"".join(out)}</div>'
                + '<div style="font:600 8.6pt Nunito;margin-top:1.6mm"><span class="tick"></span>I read the whole conversation aloud (a family member can read one part).</div>',
                "Complete the conversation with words from the box, then read it aloud." if used else "Read the conversation aloud. Use a different voice for each person.", who="self")
    n += 1
    # ---- 4. guided writing
    task, task_ar = writing_task(p, "goal")
    sentences, words_n = TEEN_TARGET[lv]
    wt = ex(n, "Writing", "الكتابة",
            f'<div style="font:700 10pt Nunito;margin-bottom:1mm">{E(task)}</div>' + (f'<div class="ar" style="display:block;font:600 8.8pt Cairo,Nunito,sans-serif;color:#6B5A4A;margin-bottom:1.4mm">{E(K.arfix(task_ar))}</div>' if task_ar else "")
            + f'<div class="hint">Write {sentences}+ sentences ({words_n} words). Use today\'s grammar and at least three words from this lesson.</div>'
            + ruled(7.4)
            + '<div class="check" style="margin-top:2mm"><span><span class="tick"></span>I used today\'s grammar</span><span><span class="tick"></span>I used three new words</span>'
              '<span><span class="tick"></span>Capital letters and full stops</span><span><span class="tick"></span>I read it again and fixed mistakes</span></div>',
            cls="grow", who="self")
    page1 = K.header(kicker(p, "Homework"), p["title"], p["title_ar"]) + '<div class="flow">' + f'<div class="goal"><b>Goal:</b> {E(p["goal"])}</div>' + page1_blocks[0] + grammar_block + "</div>" + foot(p, "Homework", 1, 2)
    note = ('<div class="goal" style="background:#F3F8FF"><b style="color:#1E4FA3">Check yourself:</b> when you finish, turn the page upside down and check exercises with answers. '
            'Correct your mistakes in a different colour.</div>')
    page2 = (K.header(kicker(p, "Homework"), p["title"], p["title_ar"], who=False) + '<div class="flow">' + "".join(page1_blocks[1:]) + rd + wt + note + sign(kid=False)
             + key_strip([E(k) for k in keys]) + "</div>" + foot(p, "Homework", 2, 2))
    return [K.page(page1), K.page(page2)], SHEET_CSS


PLAN = {"level3": ["Who?", "What?", "Where / When?", "How do you feel?"],
        "level4": ["My idea", "Reason 1", "Reason 2", "Example"],
        "level5": ["Beginning: when, where, who", "Middle: what happened", "Problem / feeling", "End: how it finished"],
        "level6": ["My opinion / plan", "Reason 1 + example", "Reason 2 + example", "Conclusion"]}
CHECK = {"level3": ["Today's grammar, used correctly", "Three words from this lesson", "Capital letters and full stops", "and / but / because to join ideas"],
         "level4": ["Today's grammar, used correctly", "Four words from this lesson", "Reasons with because / so", "Capital letters, commas, full stops"],
         "level5": ["Past tense verbs, checked one by one", "Sequencing: first, then, after that, finally", "Four words from this lesson", "Paragraphs: beginning, middle, end"],
         "level6": ["Today's grammar, used correctly", "Linking words: however, also, for example, in conclusion", "Five words from this lesson", "A clear opening and a conclusion"]}


def writing_teen(p, density):
    lv = p["level"]
    task, task_ar = writing_task(p)
    sentences, words_n = TEEN_TARGET[lv]
    t = p["topic"]
    models = [e["en"] for e in (t or {}).get("examples", [])][:3] or [w["example"] for w in p["words"] if w.get("example")][:3]
    words = [w["en"] for w in p["words"]][:12]
    page1 = (K.header(kicker(p, "Writing"), p["title"], p["title_ar"]) + '<div class="flow">'
             + ex(1, "The task", "المهمة", who="self", body=f'<div style="font:800 11pt Nunito">{E(task)}</div>'
                  + (f'<div class="ar" style="display:block;font:600 9pt Cairo,Nunito,sans-serif;color:#6B5A4A;margin-top:.6mm">{E(K.arfix(task_ar))}</div>' if task_ar else "")
                  + f'<div class="hint" style="margin-top:1.6mm">Length: {sentences}+ sentences, about {words_n} words.</div>')
             + ex(2, "Tools for your text", "أدوات للكتابة",
                  f'<div style="font:800 8.6pt Nunito;color:#5B4C3E;margin-bottom:1mm">Sentence models' + (f" · {E(t['title'])}" if t else "") + "</div>"
                  + '<div class="models">' + "".join(f"<span>{E(m)}</span>" for m in models) + "</div>"
                  + '<div style="font:800 8.6pt Nunito;color:#5B4C3E;margin:2mm 0 1mm">Words from this lesson</div><div class="bank" style="margin:0">' + "".join(f"<span>{E(w)}</span>" for w in words) + "</div>")
             + (ex(3, "Ideas from the lesson", "أفكار من الدرس", '<div class="dlg" style="font-size:9.6pt">' + "".join(f"<div><b>{E(sp)}</b><span>{E(en)}</span></div>" for sp, en, *_ in p["dialogue"][:6]) + "</div>",
                   "Read the Crew's conversation. What would you say? Steal good phrases for your text.", who="self") if p["dialogue"] else "")
             + ex(4 if p["dialogue"] else 3, "Plan", "خطّط", '<div class="plan" style="grid-template-columns:1fr 1fr">' + "".join(f"<div>{E(x)}</div>" for x in PLAN[lv]) + "</div>", "Write notes, not sentences: a few words in each box.", who="self")
             + "</div>" + foot(p, "Writing", 1, 2))
    page2 = (K.header(kicker(p, "Writing"), p["title"], p["title_ar"], who=False) + '<div class="flow">'
             + ex(5 if p["dialogue"] else 4, "Write", "اكتب", ruled(8.4),
                  "Use your plan. Skip a line if you want space to correct.", cls="grow", who="self")
             + ex(6 if p["dialogue"] else 5, "Check your writing", "راجع كتابتك", '<div class="check">' + "".join(f'<span><span class="tick"></span>{E(c)}</span>' for c in CHECK[lv]) + "</div>", "Read your text slowly, once for each point. Fix what you find.", who="self")
             + ex(7 if p["dialogue"] else 6, "Rate your work", "قيّم عملك", '<div class="fb">' + "".join(f"<div>{x}<i>☆☆☆</i></div>" for x in ("Ideas", "Grammar", "Vocabulary", "Spelling &amp; punctuation")) + "</div>"
                  + '<div style="font:700 8.6pt Nunito;margin-top:2mm">One thing I will do better next time:</div>' + lines(1), "Colour the stars: 1 = I need more practice, 3 = I did it well.", who="self")
             + parent_box("يعمل ابنكم/ابنتكم على هذه الورقة وحده. دوركم: اطلبوا منه أن يقرأ لكم ما كتب بصوت عالٍ، واسألوه سؤالًا واحدًا عن فكرته، ثم وقّعوا في الأسفل.")
             + sign(kid=False)
             + "</div>" + foot(p, "Writing", 2, 2))
    return [K.page(page1), K.page(page2)], SHEET_CSS


# ================================================================== FLASHCARDS
CARD_CSS = """
.page.cards{padding:9mm 10mm 8mm}
.cardhd{display:flex;justify-content:space-between;align-items:center;font:700 7.6pt Nunito;color:#8A7A6A;margin-bottom:3mm}
.cardhd .ar{font:600 8pt Cairo}
.cardgrid{flex:1;display:grid;gap:0;border:.25mm dashed #B7A898}
.card{min-height:0;min-width:0;border:.25mm dashed #B7A898;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:4mm;text-align:center;position:relative;overflow:hidden}
.card.empty{background:repeating-linear-gradient(45deg,#fff 0 3mm,#FAF6F0 3mm 6mm)}
.card img{width:auto;height:auto;max-width:78%;max-height:var(--imgh,52mm);object-fit:contain;flex:0 1 auto;min-height:0}
.card .en{font:700 20pt/1.1 Andika,Nunito;color:#1F1A15;margin-top:2.6mm}
.card .pos{position:absolute;top:2.6mm;left:3mm;font:800 7pt Nunito;letter-spacing:.06em;text-transform:uppercase;color:#C2530A}
.card .ar{font:800 24pt/1.4 Cairo,Nunito,sans-serif;color:#0D6E65}
.card .exm{font:600 10.5pt/1.35 Nunito;color:#3B3128;margin-top:3mm;max-width:92%}
.card .enb{font:700 11pt Andika;color:#8A7A6A;margin-top:1.6mm}
.card .tag{position:absolute;bottom:2.2mm;right:3mm;font:700 6.4pt Nunito;color:#B7A898}
.teen .card .en{font-family:Nunito;font-weight:800;font-size:17pt}
"""


def flashcards(p, density):
    lv = p["level"]; kid = p["stage"] != "teen"
    cols, rows = ((2, 3) if kid else (2, 4)) if not p["review"] else ((2, 4) if kid else (3, 4))
    per = cols * rows
    words = p["words"]
    sheets = [words[i:i + per] for i in range(0, len(words), per)]
    pages = []
    note = ('Print double-sided · flip on long edge · then cut along the dashed lines', 'اطبعوا على الوجهين (القلب على الحافة الطويلة) ثم قصّوا على الخطوط')
    for si, chunk in enumerate(sheets, 1):
        cells = chunk + [None] * (per - len(chunk))
        def front(w):
            if not w:
                return '<div class="card empty"></div>'
            src = K.picture(w, 420 if kid else 340)
            img = f'<img src="{src}" alt="">' if src else f'<div style="font:800 40pt Andika;color:#F2A65A">{E(w["en"][0].upper())}</div>'
            pos = f'<span class="pos">{E(w.get("pos", ""))}</span>' if (not kid and w.get("pos")) else ""
            return f'<div class="card">{pos}{img}<div class="en">{E(w["en"])}</div></div>'
        def back(w):
            if not w:
                return '<div class="card empty"></div>'
            exm = f'<div class="exm">{E(w["example"])}</div>' if (lv != "pre-a" and w.get("example")) else f'<div class="enb">{E(w["en"])}</div>'
            return f'<div class="card"><div class="ar" dir="rtl">{E(K.arfix(w["ar"]))}</div>{exm}<span class="tag">{E(p["label"])} · L{p["num"]}</span></div>'
        grid = lambda inner: f'<div class="cardgrid" style="grid-template-columns:repeat({cols},1fr);grid-template-rows:repeat({rows},minmax(0,1fr));--imgh:{(50 if rows == 3 else 34) if kid else (34 if cols == 2 else 28)}mm">{inner}</div>'
        hd = lambda side: (f'<div class="cardhd"><span>Lumio English · {E(p["label"])} · Lesson {p["num"]} · {E(p["title"])} · sheet {si}/{len(sheets)} · {side}</span>'
                           f'<span>{E(note[0])} · {ar(note[1])}</span></div>')
        pages.append(K.page(hd("FRONT") + grid("".join(front(w) for w in cells)), "cards" + ("" if kid else " teen")))
        # back sheet: each row mirrored so a long-edge flip puts every back behind its own front
        mirrored = []
        for rr in range(rows):
            mirrored += list(reversed(cells[rr * cols:(rr + 1) * cols]))
        pages.append(K.page(hd("BACK") + grid("".join(back(w) for w in mirrored)), "cards" + ("" if kid else " teen")))
    return pages, CARD_CSS


# ================================================================== main
BUILDERS = {
    "homework": {"prea": homework_prea, "kid": homework_kid, "teen": homework_teen},
    "writing": {"prea": writing_prea, "kid": writing_kid, "teen": writing_teen},
    "flashcards": {"prea": flashcards, "kid": flashcards, "teen": flashcards},
}
OUT = {"homework": "worksheets/{lv}/lesson{nn}-homework.pdf", "writing": "writing/{lv}/lesson{nn}-writing.pdf", "flashcards": "flashcards/{lv}/lesson{nn}-flashcards.pdf"}


def main():
    args = sys.argv[1:]
    levels = [a for a in args if a in D.LEVELS] or D.LEVELS
    only = args[args.index("--only") + 1].split(",") if "--only" in args else list(BUILDERS)
    pick = [int(x) for x in args[args.index("--lessons") + 1].split(",")] if "--lessons" in args else None
    report, failed = [], []
    try:
        for lv in levels:
            for num in sorted(D.lessons(lv)):
                if pick and num not in pick:
                    continue
                p = D.lesson_pack(lv, num)
                for kind in only:
                    out = OUT[kind].format(lv=lv, nn=f"{num:02d}")
                    try:
                        res = K.render(lambda d: BUILDERS[kind][p["stage"]](p, d), out, f"{p['label']} Lesson {num} {kind} - {p['title']}")
                    except Exception as e:   # keep going; every failure is listed at the end and the exit code is 1
                        failed.append(f"{out}: {e}"); print("FAILED", out, e); continue
                    report.append((out, res))
                    print(f"{out}: {res['pages']} p, {res['kb']} KB" + (f", density {res['density']}" if res["density"] else ""))
    finally:
        K.close()
    big = [o for o, r in report if r["kb"] > 2500]
    if big:
        print("WARNING: over 2.5 MB:", big)
    print(f"{len(report)} PDFs built, {len(failed)} failed")
    if failed:
        print("\n".join(failed)); sys.exit(1)


if __name__ == "__main__":
    main()
