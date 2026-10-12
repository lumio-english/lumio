# -*- coding: utf-8 -*-
"""Reading Lab slides (teen track, Levels 3-6; one every third lesson).

Three slides per passage, all using the shared .rl-* classes in
css/slide-styles.css (light, classic decks) with the night-studio overrides in
css/slides-v3.css (.v3-teen .rl-*), so the same HTML works in both decks:

  1. opener      -- image A as a hero, title EN/AR, topic tag, two
                    "Before you read" questions, the new-word glossary and a
                    count of words the student has already studied
  2. passage     -- the Z layout: image A top-left with paragraphs 1-2 under
                    it; paragraphs 3-4 bottom-right beside image B.  Words the
                    student has studied before glow (tap -> Arabic meaning +
                    where it was taught); marked pronunciation rules glow
                    gold (tap -> the rule).  Listen buttons per half.
  3. questions   -- six teacher questions in three tiers (Find it / Think /
                    You), questions only, each with a speak button

The known-word index is built from the lesson JSONs: every level below the
current one plus the current level up to and including this lesson.
"""
import glob as _glob
import json as _json
import os
import re

from reading_passages import RULES, PASSAGES, passage_for  # noqa: F401

LEVEL_ORDER = ["pre-a", "level1", "level2", "level3", "level4", "level5", "level6"]
LEVEL_LABEL = {"pre-a": "Pre-A", "level1": "Level 1", "level2": "Level 2", "level3": "Level 3",
               "level4": "Level 4", "level5": "Level 5", "level6": "Level 6"}

# never highlighted even if a lesson teaches them (too common to be a "recall" win)
_STOP = {"the", "and", "but", "for", "with", "this", "that", "you", "are", "was", "were", "have", "has", "had",
         "not", "his", "her", "its", "our", "your", "they", "them", "she", "him", "one", "two", "all", "can",
         "can't", "yes", "no", "what", "where", "when", "why", "who", "how", "very", "too", "here", "there",
         "now", "then", "some", "any", "more", "most", "also", "just", "only", "like", "say", "says", "said",
         "see", "go", "goes", "come", "get", "got", "make", "made", "do", "does", "did", "big", "little",
         "good", "bad", "new", "old", "day", "days", "time", "home", "house", "school", "mother", "father",
         "family", "friend", "friends", "people", "every", "first", "last", "next", "after", "before", "night",
         "morning", "week", "year", "today", "tomorrow", "want", "wants", "need", "know", "think", "look",
         "looks", "put", "take", "give", "eat", "play", "read", "write", "sit", "walk", "run", "open", "close",
         "help", "love", "loves", "work", "live", "call", "ask", "tell", "name", "boy", "girl", "man", "woman",
         "kids", "kid", "water", "food", "car", "bus", "phone", "book", "room", "door", "street", "city",
         "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen",
         "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty", "thirty", "forty", "fifty", "sixty",
         "seventy", "eighty", "ninety", "hundred", "thousand", "half", "o'clock", "tired", "happy", "sorry"}

_INDEX_CACHE = {}


def _html(s):
    return (str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            .replace('"', "&quot;").replace("'", "&#39;"))


def _jsq(s):
    return str(s).replace("\\", "\\\\").replace("'", "\\'").replace("\n", " ")


def known_words(level, lesson_num):
    """{lowercase en: (en, ar, 'Level 3 · Lesson 2', is_current_lesson)} for every word
    taught up to and including this lesson. Later lessons win on duplicates."""
    key = (level, lesson_num)
    if key in _INDEX_CACHE:
        return _INDEX_CACHE[key]
    out = {}
    for lv in LEVEL_ORDER:
        if LEVEL_ORDER.index(lv) > LEVEL_ORDER.index(level):
            break
        for f in sorted(_glob.glob(f"lessons/{lv}/lesson*.json")):
            n = int(re.search(r"lesson(\d+)\.json$", f).group(1))
            if lv == level and n > lesson_num:
                continue
            try:
                d = _json.load(open(f, encoding="utf-8"))
            except Exception:
                continue
            for w in d.get("vocab", []):
                en = (w.get("en") or "").strip()
                if not en or en.lower() in _STOP or len(en) < 4 or not re.match(r"^[A-Za-z][A-Za-z' -]*$", en):
                    continue
                out[en.lower()] = (en, w.get("ar", ""), f"{LEVEL_LABEL[lv]} &middot; Lesson {n}", lv == level and n == lesson_num)
    _INDEX_CACHE[key] = out
    return out


def _forms(word):
    """Regex alternatives for simple inflections of a single word."""
    w = re.escape(word)
    alts = [w, w + "s", w + "es", w + "ed", w + "d", w + "ing"]
    if word.endswith("e"):
        alts.append(re.escape(word[:-1]) + "ing")
    if word.endswith("y"):
        alts += [re.escape(word[:-1]) + "ies", re.escape(word[:-1]) + "ied"]
    if len(word) > 3 and word[-1] not in "aeiouy" and word[-2] in "aeiou" and word[-3] not in "aeiou":
        alts += [w + word[-1] + "ing", w + word[-1] + "ed"]   # stop -> stopping, stopped
    return "|".join(alts)


def _rule_span(word, key):
    r = RULES.get(key)
    if not r:
        return _html(word)
    title, en, ar, ex = r
    return (f'<span class="rl-rule" onclick="LumioAct.rlPop(this)" data-rl-kind="rule" data-rl-word="{_html(word)}" '
            f'data-rl-title="{_html(title)}" data-rl-en="{_html(en)}" data-rl-ar="{_html(ar)}" data-rl-ex="{_html(ex)}">{_html(word)}</span>')


def render_paragraph(text, known, used):
    """Pronunciation marks [word](rule) -> gold glow; studied words -> teal glow
    (first occurrence per passage only, at most ~14 per passage)."""
    holders = []

    def _hold(m):
        holders.append(_rule_span(m.group(1), m.group(2)))
        return f"\x00{len(holders) - 1}\x00"
    t = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", _hold, text)
    # escape everything else first, then mark known words on the escaped text
    t = _html(t)
    # longest entries first so "best friend" beats "friend"
    for lw in sorted(known, key=len, reverse=True):
        if lw in used or len(used) >= 14 or lw.rstrip("s") in {u.rstrip("s") for u in used}:
            continue
        en, ar, src, cur = known[lw]
        pat = _forms(lw) if " " not in lw else re.escape(lw) + "s?"
        m = re.search(r"(?<![\w\x00-])(" + pat + r")(?![\w\x00-])", t, flags=re.I)
        if not m:
            continue
        # skip if inside a placeholder token (between \x00 markers)
        before = t[:m.start()]
        if before.count("\x00") % 2 == 1:
            continue
        used.add(lw)
        cls = "rl-known cur" if cur else "rl-known"
        holders.append(f'<span class="{cls}" onclick="LumioAct.rlPop(this)" data-rl-kind="word" data-rl-word="{_html(en)}" '
                       f'data-rl-ar="{_html(ar)}" data-rl-src="{src}">{m.group(1)}</span>')
        t = t[:m.start()] + f"\x00{len(holders) - 1}\x00" + t[m.end():]
    t = re.sub(r"\x00(\d+)\x00", lambda m: holders[int(m.group(1))], t)
    return t


def plain_text(text):
    return re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)


def _img_tile(level, fname, alt, cls=""):
    path = f"assets/reading/{level}/{fname}"
    if os.path.exists(path):
        return f'<div class="rl-img {cls}"><img src="{path}" alt="{_html(alt)}"></div>'
    # styled placeholder until the picture is generated
    return f'<div class="rl-img rl-ph {cls}"><span data-ico="book"></span><small>{_html(alt[:70])}&hellip;</small></div>'


def _speak_btn(text, label="Listen", cls=""):
    return (f'<button type="button" class="rl-btn {cls}" onclick="LumioAct.rlSpeak(this, \'{_jsq(text)}\')">'
            f'<span data-ico="sound"></span>{label}</button>')


# ---------------------------------------------------------------- slides
def slide_opener(p, level, lesson_num, bg, header_html):
    known = known_words(level, lesson_num)
    used = set()
    for para in p["paras"]:
        render_paragraph(para, known, used)
    n_known = len(used)
    before = "".join(f'<li>{_html(q)}</li>' for q in p["before"])
    new = "".join(f'<div class="rl-new"><b>{_html(en)}</b><span dir="rtl">{_html(ar)}</span></div>' for en, ar in p["new"])
    img_a = _img_tile(level, p["images"][0][0], p["images"][0][1], "hero")
    return bg + header_html + f'''
    <div class="rl rl-open">
      <div class="rl-hero">{img_a}
        <div class="rl-hero-cap"><small>{_html(p["tag"])}</small><h2>{_html(p["title"])}</h2><div class="rl-ar" dir="rtl">{_html(p["title_ar"])}</div></div>
      </div>
      <div class="rl-side">
        <div class="rl-box">
          <div class="rl-lab">BEFORE YOU READ</div>
          <ol class="rl-before">{before}</ol>
        </div>
        <div class="rl-box">
          <div class="rl-lab">NEW IN THIS TEXT</div>
          <div class="rl-newrow">{new}</div>
        </div>
        <div class="rl-box rl-tip">
          <div class="rl-lab">WHILE YOU READ</div>
          <p><span class="rl-known demo">{n_known} words</span> you have already studied glow in this text &mdash; tap one to recall its meaning.
          <span class="rl-rule demo">Gold words</span> hide a pronunciation rule &mdash; tap to see it.</p>
        </div>
      </div>
    </div>'''


def slide_passage(p, level, lesson_num, bg, header_html):
    known = known_words(level, lesson_num)
    used = set()
    paras = [render_paragraph(t, known, used) for t in p["paras"]]
    left = "".join(f"<p>{h}</p>" for h in paras[:2])
    right = "".join(f"<p>{h}</p>" for h in paras[2:])
    txt_left = " ".join(plain_text(t) for t in p["paras"][:2])
    txt_right = " ".join(plain_text(t) for t in p["paras"][2:])
    img_a = _img_tile(level, p["images"][0][0], p["images"][0][1])
    img_b = _img_tile(level, p["images"][1][0], p["images"][1][1])
    words = len((txt_left + " " + txt_right).split())
    return bg + header_html + f'''
    <div class="rl rl-read" data-rl-stage="1">
      <div class="rl-col">
        {img_a}
        <div class="rl-text">{left}</div>
        <div class="rl-tools">{_speak_btn(txt_left, "Part 1")}<span class="rl-count">{words} words &middot; {len(used)} known</span></div>
      </div>
      <div class="rl-col">
        <div class="rl-text">{right}</div>
        <div class="rl-tools">{_speak_btn(txt_right, "Part 2")}<span class="rl-legend"><i class="k"></i> studied <i class="r"></i> pronunciation</span></div>
        {img_b}
      </div>
      <div class="rl-pop" id="rlPop" onclick="LumioAct.rlClose()"></div>
    </div>'''


_TIER = {"find": ("FIND IT", "in the text"), "think": ("THINK", "between the lines"), "you": ("YOU", "your own life")}


def slide_questions(p, level, lesson_num, bg, header_html):
    cols = []
    for tier in ("find", "think", "you"):
        qs = [q for k, q in p["questions"] if k == tier]
        cards = "".join(f'''<div class="rl-q" onclick="LumioAct.rlSpeak(this, '{_jsq(q)}')"><b>{i + 1}</b><span>{_html(q)}</span></div>'''
                        for i, q in enumerate(qs))
        lab, sub = _TIER[tier]
        cols.append(f'<div class="rl-tier t-{tier}"><div class="rl-lab">{lab} <small>{sub}</small></div>{cards}</div>')
    return bg + header_html + f'''
    <div class="rl rl-ask">
      <div class="rl-askhead"><h2>Check Understanding</h2><p>Teacher asks, student answers aloud &mdash; in full sentences when you can. No options, no pressure.</p></div>
      <div class="rl-tiers">{"".join(cols)}</div>
      <div class="rl-askfoot"><span dir="rtl">المعلّم يسأل والطالب يجيب شفهيًا</span> &middot; <b>{_html(p["title"])}</b></div>
    </div>'''


def reading_slide(level, lesson_num, idx, bg, header_fn):
    """One of the three slides (idx 0-2) -- header_fn(title) -> header html for that slide's page number."""
    p = passage_for(level, lesson_num)
    if not p:
        return ""
    t = _html(p["title"])
    if idx == 0:
        return slide_opener(p, level, lesson_num, bg, header_fn(f"Reading Lab &middot; {t}"))
    if idx == 1:
        return slide_passage(p, level, lesson_num, bg, header_fn(f"Reading Lab &middot; {t}"))
    return slide_questions(p, level, lesson_num, bg, header_fn("Reading Lab &middot; Check Understanding"))


def reading_slides(level, lesson_num, bg, header_fn):
    """[(html)...] or [] when the lesson has no passage. header_fn(title) -> header html."""
    p = passage_for(level, lesson_num)
    if not p:
        return []
    t = _html(p["title"])
    return [slide_opener(p, level, lesson_num, bg, header_fn(f"Reading Lab &middot; {t}")),
            slide_passage(p, level, lesson_num, bg, header_fn(f"Reading Lab &middot; {t}")),
            slide_questions(p, level, lesson_num, bg, header_fn("Reading Lab &middot; Check Understanding"))]
