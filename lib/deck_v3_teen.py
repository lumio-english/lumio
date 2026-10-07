# -*- coding: utf-8 -*-
"""Class slides v3, teens (Levels 3-6): the "night studio" design.

Same deck plan, words, sentences, activities and pictures as deck_template_teen2 (its build_deck_v2() is reused
untouched); only the slide designs change. install() swaps the slide functions of deck_template_teen2 (and the v1
pieces it calls: title, squad, vocab, scene, sentence trio, your turn, recap, homework), grammar_slides' rule and
practice slides and activity_slides' three teen games for the v3 versions below. Every text, Arabic line, picture,
onclick handler and element id is the classic one; the layout uses the shared v3 classes (css/slides-v3.css, themed
by `.v3.v3-teen`). Run through gen_slides_v3.py <level> (-> gen_slides_v3_teen.py).
"""
import html as _html
import json as _json
import os
import random
import re

import deck_template_teen as v1
import deck_template_teen2 as D
import grammar_slides as G
import activity_slides as A

CHAR = v1.CHAR
esc, jsq, slug = v1.esc, v1.jsq, v1.slug
STATE = {"level": "level4", "lesson": 1}


def ico(name, extra=""):
    return f'<i class="v3-ico" data-ico="{name}"{extra}></i>'


def speak_js(text):
    return f"typeof Lumio !== 'undefined' && Lumio.speak && Lumio.speak('{jsq(text)}')"


# ---------------------------------------------------------------- shared pieces
def _bg(src=None):
    # a sharp, resolution-free backdrop (black, gold light) instead of the small lesson painting
    return f'<div class="v3-bg v3-mesh m{STATE["lesson"] % 4}"></div><div class="v3-shade"></div>'


def bg_theme(theme_key="default"):
    return _bg()


def _lvl():
    return STATE["level"].replace("level", "Level ")


def header(pagetitle, n=None, total=None):
    """The v3 top bar: lesson tab, title ribbon (.pagetitle, same text as the classic title), page tab."""
    parts = re.split(r"\s*(&bull;|&middot;|•|·)\s*", pagetitle or "", maxsplit=1)
    if len(parts) == 3 and parts[2].strip():
        title = f'<b>{parts[0]}</b> {parts[1]} <i>{parts[2]}</i>'
    else:
        title = f'<b>{pagetitle}</b>'
    ribbon = f'<div class="pagetitle v3-ribbon">{title}</div>' if pagetitle else '<div></div>'
    page = f'<div class="counter v3-page">{n} / {total}</div>' if n is not None else '<div style="width:140px"></div>'
    return f'''<div class="v3-top">
      <div class="v3-lesson"><img src="assets/logo/lumio-logo.png" alt="Lumio English"><span><small>{_lvl()}</small>Lesson {STATE["lesson"]}</span></div>
      {ribbon}
      {page}
    </div>'''


def header_themed(pagetitle, n, total, theme_key="default"):
    return header(pagetitle, n, total)


def pose_name(name, pose=None):
    if pose and "-teen-" in name:
        name = name.split("-teen-")[0] + "-teen-" + pose
    return name


def host(name, side="right", offset=40, bottom=0, height=520, flip=False):
    """A large character standing on the floor of the slide (classic: char_big's 300px figure)."""
    fl = ";transform:scaleX(-1)" if flip else ""
    return (f'<div class="v3-floor" style="{side}:{offset - 10}px;bottom:{bottom + 2}px;width:{int(height * .5)}px"></div>'
            f'<img class="char v3-host" src="{CHAR}/{name}.png" style="{side}:{offset}px;bottom:{bottom}px;height:{height}px{fl}" alt="" '
            f'onerror="this.style.display=\'none\'">')


def char_big(name, side="right", bottom=64, pose=None):
    return host(pose_name(name, pose), side)


def prompt(text, top, sub="", extra=""):
    inner = f'<span class="v3t-pr">{text}<small>{sub}</small></span>' if sub else text
    return f'<div class="v3-prompt" style="top:{top}px;{extra}"><div>{inner}</div></div>'


def opt_buttons(opts, target, letters="ABCD"):
    return "".join(f'''<button class="v3-opt" data-letter="{letters[i]}" onclick="window.checkQuizAnswer && checkQuizAnswer(this, '{jsq(o)}', '{jsq(target)}')"
        data-quiz-option="{esc(o)}">{esc(o)}</button>''' for i, o in enumerate(opts))


# ---------------------------------------------------------------- opening slides
def slide_title(lesson, num_words, lesson_type="VOCABULARY & GRAMMAR", bg_image=None):
    chips = "".join(f'<span class="v3-chip">{esc(v["en"])}</span>' for v in lesson["vocab"])
    t = lesson["title"]
    fs = 6.4 if len(t) <= 12 else (5.2 if len(t) <= 18 else 4.2)
    return _bg(bg_image) + f'''
    <div class="v3-glow" style="left:-80px;top:40px;width:1000px;height:900px"></div>
    <div class="v3-paper v3t-title" style="left:96px;top:110px;width:820px;padding:44px 52px 46px">
      <img src="assets/logo/lumio-logo.png" alt="Lumio English" class="v3t-logo">
      <div class="v3-label" style="margin-top:26px">{lesson_type}</div>
      <div class="v3-word" style="font-size:{fs}rem;margin:14px 0 22px">{esc(t)}</div>
      <div class="v3t-chips">{chips}</div>
      <div style="margin-top:28px"><span class="v3-btn gold s" style="cursor:default">&#9889; +{num_words * 10} XP</span></div>
    </div>
    <div class="v3-lesson v3t-corner"><span><small>{_lvl()}</small>Lesson {STATE["lesson"]}</span></div>'''


def slide_meet_the_squad(n, total, theme_key="default"):
    cards = ""
    for img_name, char_name, line in v1.MEET_THE_SQUAD_CAST:
        cards += f'''
        <div class="v3t-member">
          <div class="pic"><img class="char" src="{CHAR}/{img_name}.png" alt="" onerror="this.style.display='none'"></div>
          <div class="v3-paper v3t-plate"><div class="nm">{esc(char_name)}</div><div class="ln">{esc(line)}</div></div>
        </div>'''
    return _bg() + f'''
    <div class="v3-top"><div class="v3-lesson"><img src="assets/logo/lumio-logo.png" alt="Lumio English"><span><small>{_lvl()}</small>Lesson {STATE["lesson"]}</span></div></div>
    <div style="position:absolute;left:0;right:0;top:118px;text-align:center;z-index:8">
      <div class="v3-word" style="font-size:3.6rem">Meet the Squad</div>
      <div class="v3-label" style="margin-top:10px">Your crew for this level</div>
    </div>
    <div class="v3t-squad">{cards}</div>'''


def slide_hook(hook_question, n, total, ch, theme_key="default"):
    return _bg() + header("Hook", n, total) + f'''
    <div class="v3-paper" style="left:80px;top:200px;width:820px;padding:46px 54px 50px">
      <div class="v3-label">BEFORE WE START</div>
      <div class="v3-quote" style="font-size:3rem;line-height:1.2;margin-top:18px">{esc(hook_question)}</div>
    </div>
    ''' + host(pose_name(ch, D.dyn_pose('hook', n)), "right", offset=110, height=600)


def slide_describing_time(image_rel_path, n, total, theme_key="default"):
    return f'''<div class="v3-bg" style="background-image:url('{image_rel_path}')"></div>
    <div class="v3-shade v3t-topshade"></div>
    {header("Describing Time", n, total)}
    ''' + prompt("Look at the picture. What do you see? Describe it in English!", 124)


# ---------------------------------------------------------------- dialogues (first listen, crew talk)
def chat_column(rows, t, instruction, instruction_sub=""):
    count = max(1, len(rows))
    size = "l" if count <= 4 else ("m" if count <= 6 else ("s" if count <= 8 else "xs"))
    out = ""
    for i, (who, img, en, ar) in enumerate(rows):
        left = i % 2 == 0
        avatar = (f'<div class="av"><img src="{img}" alt="" onerror="this.parentElement.style.display=\'none\'"></div>' if img else "")
        who_html = f'<div class="who">{esc(who)}</div>' if who else ""
        bubble = f'<div class="v3-line {"l" if left else "r"}">{who_html}<div class="en">{esc(en)}</div><div class="ar2" dir="rtl">{ar}</div></div>'
        out += f'<div class="v3t-msg {"l" if left else "r"}">{(avatar + bubble) if left else (bubble + avatar)}</div>'
    return (prompt(instruction, 118, instruction_sub)
            + f'<div class="v3-chat v3-thread v3t-thread {size}" style="left:160px;right:160px;top:{212 if instruction_sub else 196}px;bottom:66px">{out}</div>')


def slide_first_listen(dialogue, n, total, theme_key="default", speakers=None):
    sp = speakers or [("A", None), ("B", None)]
    rows = [(sp[i % 2][0], sp[i % 2][1], en, ar) for i, (en, ar) in enumerate(dialogue)]
    return (_bg() + header("First Listen", n, total)
            + chat_column(rows, None, "Listen first. Don't worry about understanding every word -- just get the gist.",
                          "Then read it in pairs: one voice each, swap roles. 1-on-1: the teacher takes one voice."))


def slide_crew_talk(lines, n, total, theme_key="default"):
    rows = [(who.upper(), f"{CHAR}/{who.lower()}-teen-happy.png", en, ar) for (who, en, ar) in lines]
    return (_bg() + header("Crew Talk", n, total)
            + chat_column(rows, None, "Read it in pairs, then swap roles.", "1-on-1: you read one character, your teacher reads the other -- then swap."))


# ---------------------------------------------------------------- vocabulary
def _vimg(w):
    return f"assets/vocab/{slug(w.get('image') or w['en'])}.png"


def slide_vocab(w, idx, n, total, num_words, ch, verb_count=0):
    from word_categories import chip_label as _chip, categorize as _cat, CATEGORY_LABELS as _CL
    quote = w.get("example", w["en"])
    cat_en, cat_ar = _CL[_cat(w)]
    L = len(w["en"])
    fs = 6.4 if L <= 8 else (5.2 if L <= 11 else 4.2)
    return _bg() + header(_chip(w, esc(w["en"])), n, total) + f'''
    <div class="v3-photo" style="left:80px;top:150px;width:520px;height:520px"><div class="pic">
      <img src="{_vimg(w)}" alt="" onerror="this.parentElement.style.background='#F1F5F9'; this.remove()"></div></div>
    <div class="v3-paper" style="left:650px;top:150px;width:720px;padding:40px 48px 42px">
      <span class="v3-chip">{cat_en} &middot; {cat_ar}</span>
      <div class="v3-word" style="font-size:{fs}rem;margin:18px 0 16px">{esc(w["en"])}</div>
      <div class="v3-ar">{w["ar"]}</div>
      <div class="v3-hr"></div>
      <div class="v3-label">EXAMPLE</div>
      <div class="v3-quote" style="margin:10px 0 26px">&ldquo;{esc(quote)}&rdquo;</div>
      <button class="v3-btn" onclick="typeof Lumio !== 'undefined' && Lumio.speak && Lumio.speak('{jsq(w["en"])}')">&#9654; Listen</button>
    </div>'''


def slide_practice_themed(w, n, total, ch, seed=0, theme_key="default"):
    quote = w.get("example", w["en"])
    question = v1.discussion_question(w["en"], seed)
    return _bg() + header(f"Practice &middot; {esc(w['en'])}", n, total) + f'''
    <div class="v3-photo" style="left:80px;top:160px;width:420px;height:420px"><div class="pic">
      <img src="assets/vocab/{slug(w['en'])}.png" alt="" onerror="this.style.display='none'"></div></div>
    <div class="v3-paper" style="left:550px;top:160px;width:820px;padding:42px 50px 44px">
      <div class="v3-label">{ico("mic")}Say it out loud.</div>
      <div class="v3-quote" style="font-size:3rem;margin:16px 0 30px">&ldquo;{esc(quote)}&rdquo;</div>
      <div class="v3t-discuss"><b>DISCUSS:</b> {esc(question)}</div>
    </div>'''


def slide_vocab_scene(image_path, sentence, bold_words, n, total, translation=None):
    hl = esc(sentence)
    for w in sorted(bold_words, key=len, reverse=True):
        hl = re.sub(r"\b(" + re.escape(esc(w)) + r")\b", r'<span class="v3-key">\1</span>', hl, count=1, flags=re.I)
    sp = sentence.replace("'", "\\'")
    tr = f'<div class="v3-ar" dir="rtl" style="margin-top:10px">{esc(translation)}</div>' if translation else ''
    return f'''<div class="v3-bg" style="background-image:url('{image_path}')"></div>
    <div class="v3-shade v3t-sceneshade"></div>
    {header("Scene &middot; " + " &amp; ".join(esc(w) for w in bold_words[:2]), n, total)}
    <div class="v3-caption v3t-caption">
      <div><div class="v3-quote">{hl}</div>{tr}</div>
      <button class="v3-btn round" onclick="typeof Lumio !== 'undefined' && Lumio.speak && Lumio.speak('{sp}')">&#9654;</button>
    </div>'''


def slide_phrase_focus(phrases, n, total, theme_key="default"):
    cards = "".join(f'''
      <div class="v3-paper v3t-phrase">
        <div class="num">{i + 1:02d}</div>
        <div class="v3-quote">&ldquo;{esc(en)}&rdquo;</div>
        <div class="gl">{esc(gloss)}</div>
        <div class="v3-ar" dir="rtl">{esc(ar)}</div>
      </div>''' for i, (en, gloss, ar) in enumerate(phrases))
    return _bg() + header("Phrase Focus", n, total) + prompt(
        "Real phrases people actually use for this topic -- let's break them down.", 124) + f'''
    <div class="v3t-phrases" style="grid-template-columns:repeat({min(3, max(1, len(phrases)))},1fr)">{cards}</div>'''


def slide_review_break(progress, n, total, theme_key="default"):
    done, out_of = progress
    pct = round(done / out_of * 100)
    activity = D.REVIEW_BREAK_ACTIVITIES_TEEN[(done // 9 - 1) % len(D.REVIEW_BREAK_ACTIVITIES_TEEN)]
    return _bg() + header("Quick Break", n, total) + f'''
    <div class="v3-paper" style="left:283px;top:190px;width:900px;padding:48px 60px;text-align:center">
      <div class="v3-label">{done} of {out_of} words reviewed</div>
      <div class="v3-word" style="font-size:6rem;margin:16px 0 22px">{pct}%</div>
      <div class="v3t-bar"><div style="width:{pct}%"></div></div>
      <div class="v3-quote" style="font-size:1.9rem;margin-top:30px">{esc(activity)}</div>
    </div>'''


def slide_round_checkpoint(round_label, n, total, theme_key="default"):
    return _bg() + header("Quick Check-In", n, total) + f'''
    <div class="v3-paper" style="left:233px;top:220px;width:1000px;padding:56px 64px;text-align:center">
      <div class="v3-word" style="font-size:4.4rem">{esc(round_label)} done. How did we do?</div>
      <div class="v3-hr"></div>
      <div class="v3-quote" style="font-size:1.7rem;color:var(--ink2)">Thumbs up if you're feeling good, thumbs down if you want to go over one again.</div>
    </div>'''


# ---------------------------------------------------------------- checks (vocabulary / grammar MCQ)
def slide_vocab_mcq(vocab_list, mode, idx, total_q, n, total, theme_key="default"):
    seed = idx * 13 + (1 if mode == "translate" else 0)
    rng = random.Random(seed)
    target = vocab_list[idx % len(vocab_list)]
    distractors = rng.sample([w for w in vocab_list if w["en"] != target["en"]], min(3, len(vocab_list) - 1))
    opts = distractors + [target]
    rng.shuffle(opts)
    buttons = opt_buttons([o["en"] for o in opts], target["en"])
    if mode == "picture":
        q = f'''<div class="v3-photo" style="left:90px;top:160px;width:480px;height:480px"><div class="pic">
          <img src="assets/vocab/{slug(target['en'])}.png" alt="" onerror="this.style.display='none'"></div></div>
        <div class="v3-word v3t-ask" style="left:640px;top:170px">What is this?</div>'''
    else:
        q = f'''<div class="v3-paper v3-qcard" style="left:90px;top:170px;width:480px;height:440px">
          <div class="v3-label">WHAT'S THE ENGLISH WORD?</div>
          <div class="v3-bigar" style="margin-top:22px">{target['ar']}</div></div>'''
    return _bg() + header(f"Vocabulary Check &middot; {idx + 1}/{total_q}", n, total) + q + f'''
    <div class="v3-opts v3t-opts" style="left:640px;right:90px;top:{290 if mode == "picture" else 200}px">{buttons}</div>'''


_classic_cache = {}


def _classic_quiz(n):
    """(options, correct) of the live classic slide n of this lesson. The classic grammar-MCQ distractors come from
    iterating a set of strings, so their order depends on Python's per-run hash seed; the v3 slide takes the exact
    options the classic deck shows instead of re-rolling them."""
    path = f"slide-content/{STATE['level']}/{STATE['lesson']:02d}/slide-{n:02d}.html"
    if path not in _classic_cache:
        _classic_cache[path] = open(path, encoding="utf-8").read() if os.path.exists(path) else ""
    h = _classic_cache[path]
    calls = re.findall(r"checkQuizAnswer\(this, '((?:[^'\\]|\\.)*)', '((?:[^'\\]|\\.)*)'\)", h)
    if len(calls) != 4:
        return None
    un = lambda s: _html.unescape(s.replace("\\'", "'").replace("\\\\", "\\"))
    return [un(c[0]) for c in calls], un(calls[0][1]), h


def slide_grammar_mcq(sentences, idx, total_q, n, total, theme_key="default"):
    seed = idx * 17
    rng = random.Random(seed)
    target_sentence = sentences[idx % len(sentences)]
    raw_words = target_sentence["en"].strip().split(" ")
    words_clean = [w.rstrip(".,!?") for w in raw_words]
    blank_i = D.find_blank_index(words_clean)
    if blank_i is None:
        blank_i = 0
    correct_word = words_clean[blank_i]
    before = " ".join(raw_words[:blank_i])
    after = " ".join(raw_words[blank_i + 1:])
    mtype = D.marker_type(correct_word)
    correct_group = D.equivalence_group(correct_word)
    excluded = correct_group if correct_group else {correct_word.lower()}
    same_type_words = set()
    for s in sentences:
        if s is target_sentence:
            continue
        if mtype == "other":
            sw = [w.rstrip(".,!?") for w in s["en"].strip().split(" ")]
            if blank_i < len(sw) and sw[blank_i].lower() not in excluded:
                same_type_words.add(sw[blank_i])
        else:
            for w in s["en"].strip().split(" "):
                wc = w.rstrip(".,!?")
                if D.marker_type(wc) == mtype and wc.lower() not in excluded:
                    same_type_words.add(wc)
    pool_distractors = list(same_type_words)
    rng.shuffle(pool_distractors)
    distractors = pool_distractors[:3]
    fallback_pool = D.MARKER_DISTRACTOR_POOLS.get(mtype, []) + ["Not", "The", "A", "Is"]
    attempts = 0
    while len(distractors) < 3 and attempts < 20:
        candidate = rng.choice(fallback_pool)
        if candidate.lower() not in excluded and candidate not in distractors:
            distractors.append(candidate)
        attempts += 1
    opts = distractors + [correct_word]
    rng.shuffle(opts)
    sentence_display = f"{esc(before)} ___ {esc(after)}".strip() if before else f"___ {esc(after)}".strip()
    cl = _classic_quiz(n)
    if cl and cl[1] == correct_word and f"Grammar Check &middot; {idx + 1}/{total_q}" in cl[2]:
        opts = cl[0]
    blank = '<span class="v3t-blank">___</span>'
    shown = sentence_display.replace("___", blank, 1)
    return _bg() + header(f"Grammar Check &middot; {idx + 1}/{total_q}", n, total) + f'''
    <div class="v3-paper" style="left:120px;right:120px;top:160px;padding:40px 52px 44px">
      <div class="v3-label">COMPLETE THE SENTENCE</div>
      <div class="v3-quote v3t-gsent">{shown}</div>
    </div>
    <div class="v3-opts v3t-opts" style="left:120px;right:120px;top:{430}px">{opt_buttons(opts, correct_word)}</div>'''


# ---------------------------------------------------------------- grammar
def slide_grammar_rule(topic, n, total, ch, header_fn=None, colorstrip="", bg_study_fn=None, char_img_fn=None):
    examples = topic.get("examples", [])[:2]
    if topic.get("rules"):
        right = "".join(f'''
        <div class="v3t-rule">
          <div class="en">{esc(r["en"])}</div>
          <div class="ar" dir="rtl">{r["ar"]}</div>
          <div class="ex">{" &bull; ".join(esc(x).replace("->", "&rarr;") for x in r.get("examples", []))}</div>
        </div>''' for r in topic["rules"])
        right = f'<div class="v3t-rules">{right}</div>'
    else:
        right = "".join(f'''
        <div class="v3t-ex"><div class="en">{esc(ex["en"])}</div><div class="ar" dir="rtl">{ex["ar"]}</div></div>''' for ex in examples)
    return _bg() + header("Grammar Time! &#128221;", n, total) + f'''
    <div class="v3-paper" style="left:70px;top:140px;width:700px;bottom:76px;padding:40px 46px">
      <div class="v3-label">TEACHER: EXPLAIN THIS RULE</div>
      <div class="v3-word" style="font-size:3.4rem;margin:16px 0 6px">{esc(topic["title"])}</div>
      <div class="v3-arline">{topic["titleAr"]}</div>
      <div class="v3-hr"></div>
      <div class="v3t-expl">{esc(topic["explanation"])}</div>
      <div class="v3-arline" style="margin-top:10px">{topic["explanationAr"]}</div>
    </div>
    <div class="v3-paper" style="left:800px;right:70px;top:140px;bottom:76px;padding:36px 36px;display:flex;flex-direction:column">
      <div class="v3-label">EXAMPLES</div>
      <div class="v3t-exwrap">{right}</div>
    </div>'''


def slide_grammar_practice(topic, n, total, ch, header_fn=None, colorstrip="", bg_plain_fn=None, char_img_fn=None):
    examples = topic.get("examples", [])[:4]
    rows = ""
    for i, ex in enumerate(examples, 1):
        en = ex["en"]; ar = ex.get("ar", "")
        rows += f'''
        <div class="v3t-rr">
          <div class="k">{i}</div>
          <div style="flex:1;min-width:0"><div class="en">{esc(en)}</div><div class="ar" dir="rtl">{ar}</div></div>
          <button class="v3-btn teal round s" onclick="typeof Lumio!=='undefined' && Lumio.speak && Lumio.speak({esc(_json.dumps(en))})" title="Listen">&#128266;</button>
        </div>'''
    steps = "".join(f'<div class="v3t-step"><div class="k">{k}</div><div>{t}<span>{a}</span></div></div>'
                    for k, t, a in [(1, "Listen", "استمعوا"), (2, "Repeat together", "ردّدوا معاً"), (3, "Say it on your own", "قولوها بمفردكم")])
    return _bg() + header("Grammar Practice &bull; Read &amp; Repeat", n, total) + f'''
    <div class="v3-paper" style="left:60px;top:134px;width:430px;bottom:70px;padding:30px 32px;display:flex;flex-direction:column">
      <div class="v3-label">THE PATTERN</div>
      <div class="v3-word" style="font-size:2.6rem;margin-top:10px">{esc(topic.get("title", ""))}</div>
      <div class="v3-arline">{topic.get("titleAr", "")}</div>
      <div class="v3t-expl s" style="margin-top:14px">{esc(topic.get("explanation", ""))}
        <div class="v3-arline" style="font-size:1rem;margin-top:6px">{topic.get("explanationAr", "")}</div></div>
      <div class="v3-hr" style="margin:18px 0 12px"></div>
      <div class="v3-label">HOW WE PRACTISE</div>{steps}
    </div>
    <div class="v3-paper" style="left:520px;right:60px;top:134px;bottom:70px;padding:28px 32px;display:flex;flex-direction:column;gap:12px">
      <div class="v3-label">READ &amp; REPEAT &middot; اقرؤوا وردّدوا</div>
      {rows}
      <div class="v3t-now">
        <div class="t">Now you &mdash; make one NEW sentence with this pattern.</div>
        <div class="s">Pairs: say it to your partner, who repeats it back. &nbsp;1-on-1: say it to your teacher, then swap &mdash; the teacher says one, you repeat.
          <span dir="rtl">الآن دوركم: كوّنوا جملة جديدة بنفس القاعدة.</span></div>
      </div>
    </div>'''


def slide_notice_practice(sentences, note, n, total, theme_key="default"):
    t = D.THEMES.get(theme_key, D.THEMES["default"])
    rows = "".join(f'''<button class="v3t-spot" onclick="this.classList.toggle('spotted'); this.style.borderColor = this.classList.contains('spotted') ? '{t["accent"]}' : '#EEF0F4'; this.style.background = this.classList.contains('spotted') ? '{t["accent"]}14' : '#fff'"><span class="k">{i + 1:02d}</span>{esc(s)}</button>''' for i, s in enumerate(sentences))
    return _bg() + header("Notice the Pattern", n, total) + f'''
    <div class="v3-paper" style="left:160px;right:160px;top:140px;padding:36px 46px 34px">
      <div class="v3-quote" style="font-size:2.1rem">Tap every sentence that uses {esc(note)}.</div>
      <div class="v3-label" style="margin:10px 0 20px">You just heard some of these -- can you spot the pattern?</div>
      <div class="v3t-spots">{rows}</div>
    </div>'''


def slide_sentence_trio(sentences, n, total, ch, seed):
    rows = ""
    for i, sentence in enumerate(sentences):
        words, punct = v1.tokenize_sentence(sentence)
        order = list(range(len(words)))
        random.Random(seed * 10 + i).shuffle(order)
        pt = f'<div class="sbg-tile sbg-punct" style="cursor:default">{punct}</div>' if punct else ""
        slots = "".join(f'<div class="sb-slot sbg-slot" data-group="{i}" data-index="{j}"></div>' for j in range(len(words)))
        tray = "".join(f'<div class="sb-tile sbg-tile" draggable="false" data-group="{i}" data-word="{esc(words[j])}">{esc(words[j])}</div>' for j in order)
        rows += f'''<div class="v3-sbrow"><div class="num">{i + 1}</div>
          <div id="sbSlots{i}" data-correct="{esc(sentence.strip())}" class="v3t-slots">{slots}{pt}</div>
          <div class="v3t-trayrow">
            <div id="sbTray{i}" class="v3t-tray">{tray}</div>
            <button class="v3-btn teal s" onclick="window.checkSentenceBuilder && checkSentenceBuilder('{i}')">&#10003; Check</button>
          </div>
          <div id="sbFeedback{i}" class="v3t-fb"></div></div>'''
    return _bg() + header("Build the Sentences", n, total) + prompt(
        "Put the words in the right order &mdash; drag the tiles.", 116,
        "1-on-1: say the sentence first, then build it.") + f'''
    <div class="v3-sb v3t-sb" style="top:206px">{rows}</div>'''


def slide_error_analysis(mistakes, topic_title, n, total, theme_key="default"):
    rows = ""
    for i, (wrong, right, why_en, why_ar) in enumerate(mistakes[:3], 1):
        rows += f'''
        <div class="v3-paper v3t-mist">
          <div class="top">
            <div class="k">{i}</div>
            <div class="wrong"><span class="tag">{ico("warn")}</span>{esc(wrong)}</div>
            <button class="v3-btn s ghost" onclick="var f=document.getElementById('cmFix{i}');f.style.display='block';this.style.display='none'">Show the fix</button>
          </div>
          <div id="cmFix{i}" style="display:none" class="fix">
            <div class="right"><span class="tag">{ico("check")}</span>{esc(right)}</div>
            <div class="why"><div>{ico("bulb")}{esc(why_en)}</div><div dir="rtl" class="ar">{why_ar}</div></div>
          </div>
        </div>'''
    return _bg() + header("Common Mistakes", n, total) + prompt(
        f"{esc(topic_title)} &middot; Find the mistake in each sentence, then tap to check.", 116,
        "Pairs: who spots it first? &middot; 1-on-1: say the correct sentence before you reveal it.") + f'''
    <div class="v3t-mists">{rows}</div>'''


def slide_grammar_recap(topics, n, total, ch, theme_key="default"):
    rows = "".join(f'''
        <div class="v3t-pt"><div class="k">{i + 1:02d}</div><div><div class="t">{esc(t["title"])}</div>
          <div class="s">{esc(t["examples"][0]["en"])}</div></div></div>''' for i, t in enumerate(topics))
    return _bg() + header("Grammar Recap", n, total) + f'''
    <div class="v3-paper" style="left:470px;right:70px;top:136px;padding:34px 44px 30px">
      <div class="v3-word" style="font-size:2.8rem">Quick grammar recap</div>
      <div class="v3-label" style="margin-top:8px">Everything we've covered this level, at a glance</div>
      <div class="v3t-pts">{rows}</div>
    </div>
    ''' + host(pose_name(ch, D.dyn_pose('practice', n)), "left", offset=60, height=540)


# ---------------------------------------------------------------- your turn, speaking
def your_turn_html(w, idx, total_rounds, teen, chars_html=""):
    if not teen:
        return _orig_your_turn(w, idx, total_rounds, teen, chars_html)
    en, ar = w["en"], w.get("ar", "")
    steps = "".join(f'<span class="v3-chip">{t}</span>' for t in ("1 Play the word", "2 Say the Arabic", "3 Reveal"))
    ex = f'<div class="v3-quote" style="font-size:1.6rem;margin-top:14px;color:var(--ink2)">&ldquo;{esc(w.get("example"))}&rdquo;</div>' if w.get("example") else ""
    return f'''
    <div class="v3-photo" style="left:120px;top:150px;width:470px;height:470px"><div class="pic v3t-myst" id="ytCard{idx}">
      <div id="ytMystery{idx}" class="v3t-mq">&#128266;</div>
      <img id="ytImg{idx}" src="{_vimg(w)}" style="display:none;position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:#fff;padding:14px" onerror="this.style.display='none'">
    </div></div>
    <div class="v3-paper" style="left:650px;top:160px;width:700px;min-height:330px;padding:40px 46px;text-align:center">
      <div id="ytAsk{idx}">
        <div class="v3-quote" style="font-size:2.8rem">Listen &mdash; say it in Arabic!</div>
        <div class="v3-arline" style="text-align:center;font-size:1.5rem;margin-top:6px">استمعوا ثم قولوا الكلمة بالعربية</div>
        <div class="v3t-chips" style="justify-content:center;margin-top:18px">{steps}</div>
        <div class="v3t-small" style="margin-top:18px">Pairs: the first to say the Arabic wins the point.<br>1-on-1: your teacher plays the word, you answer.</div>
      </div>
      <div id="ytAns{idx}" style="display:none">
        <div class="v3-bigar">{ar}</div>
        <div class="v3-word" style="font-size:3.6rem;margin-top:10px">{esc(en)}</div>
        {ex}
      </div>
    </div>
    <div style="position:absolute;left:650px;width:700px;top:540px;display:flex;justify-content:center;gap:22px;z-index:20">
      <button class="v3-btn teal" onclick="typeof Lumio!=='undefined' && Lumio.speak && Lumio.speak({esc(_json.dumps(en))})">&#9654; Play the word</button>
      <button class="v3-btn" onclick="document.getElementById('ytMystery{idx}').style.display='none';document.getElementById('ytImg{idx}').style.display='block';document.getElementById('ytAsk{idx}').style.display='none';document.getElementById('ytAns{idx}').style.display='block';this.disabled=true;this.style.opacity=.55">&#128064; Reveal</button>
    </div>
    {chars_html}'''


def slide_your_turn(w, idx, total_rounds, n, total, ch):
    return _bg() + header(f"Your Turn &middot; {idx}/{total_rounds}", n, total) + your_turn_html(w, idx, total_rounds, True)


def slide_challenge(prompt_txt, hint, n, total, ch, theme_key="default"):
    return _bg() + header("Challenge", n, total) + f'''
    <div class="v3-paper" style="left:520px;right:80px;top:190px;padding:50px 56px 52px">
      <div class="v3-label">{ico("bolt")}CHALLENGE</div>
      <div class="v3-quote" style="font-size:2.6rem;margin:18px 0 22px">{esc(prompt_txt)}</div>
      <div class="v3-hr"></div>
      <div class="v3t-small" style="font-size:1.35rem">{esc(hint)}</div>
    </div>
    ''' + host(pose_name(ch, D.dyn_pose('practice', n)), "left", offset=90, height=600)


def slide_real_life(prompt_txt, n, total, ch, theme_key="default"):
    return _bg() + header("Real Life Connection", n, total) + f'''
    <div class="v3-paper" style="left:80px;width:860px;top:210px;padding:50px 56px 54px">
      <div class="v3-label">{ico("star")}REAL LIFE</div>
      <div class="v3-quote" style="font-size:2.6rem;margin-top:18px">{esc(prompt_txt)}</div>
    </div>
    ''' + host(pose_name(ch, D.dyn_pose('reallife', n)), "right", offset=110, height=600)


def slide_pair_check(prompt_txt, n, total, theme_key="default"):
    return _bg() + header("Pair Check", n, total) + f'''
    <div class="v3-paper" style="left:283px;width:900px;top:220px;padding:50px 56px;text-align:center">
      <div class="v3-quote" style="font-size:2.4rem">{esc(prompt_txt)}</div>
      <div class="v3-label" style="margin-top:18px">60 seconds &mdash; go!</div>
    </div>'''


def slide_discussion(points, n, total, ch, theme_key="default"):
    rows = "".join(f'<div class="v3t-pt"><div class="k">{i + 1:02d}</div><div class="t">{esc(p)}</div></div>' for i, p in enumerate(points))
    return _bg() + header("Discussion Time", n, total) + f'''
    <div class="v3-paper" style="left:440px;right:60px;top:132px;padding:32px 42px 26px">
      <div class="v3-word" style="font-size:2.8rem">Let's talk about it!</div>
      <div class="v3-label" style="margin-top:8px">&#8776; 10 minutes &middot; open class conversation &middot; talk to each other, not just to me</div>
      <div class="v3t-pts">{rows}</div>
    </div>
    ''' + host(pose_name(ch, D.dyn_pose('practice', n)), "left", offset=50, height=560)


# ---------------------------------------------------------------- recap & wrap-up
def _recap_block(blk):
    kind, items = blk["kind"], blk["items"]
    label = blk["label"] + (" (cont.)" if blk.get("cont") else "")
    out = f'<h4>{label}</h4>'
    if kind == "chips":
        out += '<div class="row">' + "".join(
            f'<div class="mini"><div class="ph"><img src="assets/vocab/{slug(w["image"] if isinstance(w, dict) else w)}.png" alt="" onerror="this.style.display=\'none\'"></div>{esc(w["en"] if isinstance(w, dict) else w)}</div>'
            for w in items) + '</div>'
    elif kind == "pills":
        out += '<div class="row">' + "".join(f'<div class="pill">{esc(w["en"] if isinstance(w, dict) else w)}</div>' for w in items) + '</div>'
    else:
        title = blk.get("title")
        th = f'<div class="ttl">{esc(title)}</div>' if title and not blk.get("cont") else ""
        cols = "1fr 1fr" if kind == "sentences" else "1fr"
        rows = "".join(f'<div class="sent">&ldquo;{esc(p)}&rdquo;</div>' for p in items)
        out += f'<div class="sents" style="grid-template-columns:{cols}">{th}{rows}</div>'
    return out


def slide_today_i_learned(page, page_idx, page_count, n, total, bg_fn=None, header_fn=None):
    title = "Recap" if page_count == 1 else f"Recap &middot; {page_idx}/{page_count}"
    body = "".join(_recap_block(b) for b in page)
    return _bg() + header(title, n, total) + f'''
    <div class="v3-paper v3-recap v3t-recap" data-recap-body>{body}</div>'''


def slide_reward_homework(lesson_num, n, total, xp):
    items = ["Do the interactive homework on your dashboard first",
             "Print your worksheet, writing-practice sheet and flashcards",
             "Memorise this lesson's words with your flashcards",
             "Play this lesson's bonus game"]
    rows = "".join(f'<div class="v3t-pt"><div class="k">{i + 1:02d}</div><div class="t">{it}</div></div>' for i, it in enumerate(items))
    return _bg() + header("Session Complete", n, total) + f'''
    <div class="v3-paper" style="left:90px;top:170px;width:520px;height:470px;padding:48px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">
      {ico("trophy", ' style="width:150px;height:150px"')}
      <div class="v3-word" style="font-size:4.2rem;margin:18px 0 26px">Nice work.</div>
      <span class="v3-btn gold" style="cursor:default">&#9889; +{xp} XP</span>
    </div>
    <div class="v3-paper" style="left:650px;right:90px;top:170px;height:470px;padding:44px 48px">
      <div class="v3-label">{ico("pencil")}Before next time</div>
      <div class="v3t-pts">{rows}</div>
    </div>'''


# ---------------------------------------------------------------- teen activities (Describe It, Story Chain, Two Truths)
def _band(pairs, solo):
    return f'''
    <div class="v3t-band">
      <div class="v3-paper"><div class="v3-label">&#128101; PAIRS / GROUP</div><div class="tx">{pairs}</div></div>
      <div class="v3-paper"><div class="v3-label">&#128100; 1-ON-1 WITH YOUR TEACHER</div><div class="tx">{solo}</div></div>
    </div>'''


def _score(label):
    return f'''
      <div class="v3t-score">
        <span class="lb">{label}</span>
        <span data-act-score class="val">0</span>
        <button class="v3-btn s" onclick="LumioAct.score(this,1)">+</button>
        <button class="v3-btn s ghost" onclick="LumioAct.score(this,-1)">&minus;</button>
      </div>'''


def slide_describe_guess(vocab, bg, header_html, kid=False, char_html=""):
    if kid:
        return _orig_describe(vocab, bg, header_html, kid, char_html)
    words = A._spread(vocab, 6)
    cards = "".join(f'''
      <div onclick="LumioAct.flip(this)" class="v3t-flip">
        <div class="act-front" style="display:none"><div class="in">
          <img src="{A._img(w)}" alt="" onerror="this.style.display='none'">
          <div class="w">{esc(w['en'])}</div>
        </div></div>
        <div class="act-back"><div class="q">?</div><div class="v3-label">TAP TO FLIP</div></div>
      </div>''' for w in words)
    return (bg + header_html + _band(
        "Partner A flips a card and describes the word in English &mdash; <b>without saying it</b>. Partner B guesses. Swap after each card. 60 seconds, most cards wins.",
        "Your teacher flips a card and describes it &mdash; you guess in English. Then swap: you describe, the teacher guesses. Use a full sentence: <i>It's a place where&hellip; / You do this when&hellip;</i>") + f'''
    <div class="v3t-act">
      <div class="v3t-flips">{cards}</div>
      <div class="v3t-side">
        <div class="v3-paper"><div class="v3-label">TIMER</div>
          <button class="v3-btn" style="width:100%;margin-top:12px" onclick="LumioAct.timer(this,60)">&#9201; Start 60s</button></div>
        <div class="v3-paper"><div class="v3-label">SCORE</div>{_score("A / You")}{_score("B / Teacher")}</div>
        <div class="v3t-small" style="text-align:center">Rule: no Arabic, no spelling, no pointing &mdash; English only!</div>
      </div>
    </div>''' + char_html)


def slide_story_chain(vocab, grammar_topic, bg, header_html, kid=False, char_html=""):
    if kid:
        return _orig_story(vocab, grammar_topic, bg, header_html, kid, char_html)
    words = A._spread(vocab, 6)
    row = "".join(f'''
      <div data-say="{esc(w['en'])}" class="v3t-chain">
        <div class="ph"><img src="{A._img(w)}" alt="" onerror="this.style.display='none'"></div>
        <div class="w">{esc(w['en'])}</div>
        <div class="ar">{w.get('ar', '')}</div>
      </div>''' for w in words)
    if grammar_topic:
        ex = (grammar_topic.get("examples") or [{}])[0]
        pattern = f'''<div class="v3-paper v3t-pattern">
          <div><div class="v3-label">USE TODAY'S PATTERN</div><div class="t">{esc(grammar_topic.get("title", ""))}</div></div>
          <div class="ex">&ldquo;{esc(ex.get("en", ""))}&rdquo;</div></div>'''
    else:
        pattern = '<div class="v3-paper v3t-pattern"><div class="t">Start: <i>&ldquo;One day, &hellip;&rdquo;</i> &mdash; every sentence must use the lit word.</div></div>'
    return (bg + header_html + _band(
        "Build one story together. Tap <b>Next word</b> &mdash; whoever's turn it is adds ONE sentence with that word. Keep the story going round the group; it must make sense!",
        "You and your teacher take turns. Teacher starts with the first word; you add the next sentence. Three times round = a whole story. Then retell it alone from the pictures.") + f'''
    <div class="v3t-act col">
      <div id="scRow" class="v3t-chainrow">{row}</div>
      {pattern}
      <button class="v3-btn" onclick="LumioAct.next('scRow')">Next word &#9654;</button>
    </div>''' + char_html)


def slide_truth_or_lie(vocab, grammar_topic, bg, header_html, kid=False, char_html=""):
    if kid:
        return _orig_truth(vocab, grammar_topic, bg, header_html, kid, char_html)
    pool = "".join(f'''
      <div style="display:none" class="v3t-chain big"><div class="ph"><img src="{A._img(w)}" alt="" onerror="this.style.display='none'"></div>
        <div class="w">{esc(w['en'])}</div><div class="ar">{w.get('ar', '')}</div></div>''' for w in vocab)
    hint = f'<span class="v3t-hl">Use: {esc(grammar_topic.get("title", ""))}</span> &mdash; ' if grammar_topic else ""
    return (bg + header_html + _band(
        "Tap <b>Spin</b>: three words. Say three sentences about YOU using them &mdash; two true, one false. Your partner asks one question, then guesses the lie. Fool them = 2 points; they catch you = 1 point for them.",
        "Spin, then tell your teacher three sentences (two true, one false). The teacher asks one follow-up question and guesses. Then the teacher spins and you catch the lie!") + f'''
    <div class="v3t-act">
      <div class="v3t-tlmain">
        <div id="tlPool" style="display:none">{pool}</div>
        <div id="tlPicked" class="v3t-picked">
          <div class="v3-quote" style="font-size:1.7rem;opacity:.85">Tap Spin to get your three words &#8594;</div>
        </div>
        <div class="v3t-small" style="text-align:center">{hint}every sentence must contain one of the three words.</div>
      </div>
      <div class="v3t-side">
        <div class="v3-paper"><button class="v3-btn" style="width:100%" onclick="LumioAct.pick('tlPool','tlPicked',3)">&#127922; Spin</button></div>
        <div class="v3-paper"><div class="v3-label">SCORE</div>{_score("A / You")}{_score("B / Teacher")}</div>
      </div>
    </div>''' + char_html)


# ---------------------------------------------------------------- emoji -> Lumio icons, wrapper
EMOJI = {"128266": "sound", "128064": "eye", "10003": "check", "11088": "star", "127922": "dice", "128172": "speech", "128161": "bulb",
         "127881": "sparkle", "128101": "people", "128100": "user", "128218": "library", "129300": "question", "10024": "sparkle",
         "9989": "check", "127775": "star", "128512": "smile", "128075": "wave", "127942": "trophy", "9654": "play", "128214": "book",
         "9999": "pencil", "128066": "sound", "9889": "bolt", "9201": "clock", "128221": "write", "10060": "warn", "128220": "sheet",
         "9995": "wave", "129309": "people", "9664": "play"}
EMOJI_CHARS = {chr(int(k)): v for k, v in EMOJI.items()}
_ENT = re.compile(r"&#(\d+);(?:&#65039;)?")


def _iconify_text(txt):
    txt = _ENT.sub(lambda m: f'<i class="v3-ico" data-ico="{EMOJI[m.group(1)]}"></i>' if m.group(1) in EMOJI else m.group(0), txt)
    return "".join(f'<i class="v3-ico" data-ico="{EMOJI_CHARS[c]}"></i>' if c in EMOJI_CHARS else c for c in txt if c != "️")


def finish(html):
    html = re.sub(r">([^<>]+)<", lambda m: ">" + _iconify_text(m.group(1)) + "<", html)
    import v3_glyphs
    html = v3_glyphs.buttons(html)
    return f'<div class="v3 v3-teen">{html}</div>'


# ---------------------------------------------------------------- install
_orig_your_turn = v1.your_turn_html
_orig_describe, _orig_story, _orig_truth = A.slide_describe_guess, A.slide_story_chain, A.slide_truth_or_lie


def install(level):
    STATE["level"] = level
    for name in ("bg_theme", "header_themed", "char_big", "slide_hook", "chat_column", "slide_first_listen", "slide_crew_talk",
                 "slide_notice_practice", "slide_challenge", "slide_real_life", "slide_vocab_mcq", "slide_grammar_mcq",
                 "slide_practice_themed", "slide_pair_check", "slide_review_break", "slide_round_checkpoint",
                 "slide_error_analysis", "slide_phrase_focus", "slide_discussion", "slide_describing_time",
                 "slide_grammar_recap", "slide_vocab", "slide_today_i_learned", "slide_reward_homework"):
        setattr(D, name, globals()[name])
    for name in ("slide_title", "slide_meet_the_squad", "slide_vocab_scene", "slide_sentence_trio", "slide_your_turn",
                 "your_turn_html", "slide_vocab", "slide_today_i_learned", "slide_reward_homework"):
        setattr(v1, name, globals()[name])
    G.slide_grammar_rule, G.slide_grammar_practice = slide_grammar_rule, slide_grammar_practice
    A.slide_describe_guess, A.slide_story_chain, A.slide_truth_or_lie = slide_describe_guess, slide_story_chain, slide_truth_or_lie
    orig_build = D.build_deck_v2

    def build_deck_v2(lesson_num, *args, **kw):
        STATE["lesson"] = lesson_num
        return [finish(h) for h in orig_build(lesson_num, *args, **kw)]
    D.build_deck_v2 = build_deck_v2
