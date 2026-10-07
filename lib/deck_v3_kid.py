# -*- coding: utf-8 -*-
"""Class slides v3, kids (Pre-A, Level 1, Level 2): the "storybook" design.

Same deck plan, words, sentences, activities and pictures as deck_template_v2 (its build_deck() is reused
untouched); only the slide designs change. install() swaps the template's slide functions and shared
pieces (backgrounds, header, character, letter tiles, activity-slide helpers) for the v3 versions below,
then run() writes the decks to slide-content-v3/ (see gen_slides_v3.py). Styles: css/slides-v3.css.
"""
import re, random, json as _json

import deck_template_v2 as T
import activity_slides as A

CHAR = T.CHAR
esc, jsq, slug = T.esc, T.jsq, T.slug
STATE = {"level": "level1", "lesson": 1, "bg": None}
DEFAULT_BG = "assets/lesson-bg-kid/classroom.jpg"


def ico(name):
    return f'<i class="v3-ico" data-ico="{name}"></i>'


def speak(text):
    return f"typeof Lumio !== 'undefined' && Lumio.speak && Lumio.speak('{jsq(text)}')"


def vimg(w):
    return f"assets/vocab/{slug(w.get('image') or w['en'])}.png"


# ---------------------------------------------------------------- shared pieces
def _bg():
    src = T.CURRENT_LESSON_BG or DEFAULT_BG
    return f'<div class="v3-bg" style="background-image:url(\'{src}\')"></div><div class="v3-shade"></div>'


def header(pagetitle, n, total):
    parts = re.split(r"\s*(&bull;|&middot;|•|·)\s*", pagetitle or "", maxsplit=1)
    if len(parts) == 3 and parts[2].strip():
        title = f'<b>{parts[0]}</b> {parts[1]} <i>{parts[2]}</i>'
    else:
        title = f'<b>{pagetitle}</b>'
    lvl = STATE["level"].replace("level", "Level ").replace("pre-a", "Pre-A")
    ribbon = f'<div class="pagetitle v3-ribbon">{title}</div>' if pagetitle else '<div></div>'
    return f'''<div class="v3-top">
      <div class="v3-lesson"><img src="assets/logo/lumio-logo.png" alt="Lumio English"><span><small>{lvl}</small>Lesson {STATE["lesson"]}</span></div>
      {ribbon}
      <div class="counter v3-page">{ico("book")}{n} / {total}</div>
    </div>'''


def char_img(name, right=95, bottom=42, height=300):
    h = min(440, int(height * 1.32))
    b = max(10, bottom - 22)
    return (f'<div class="v3-floor" style="right:{right - 20}px;bottom:{b - 14}px;width:{int(h * .62)}px"></div>'
            f'<img class="char v3-host" src="{CHAR}/{name}.png" style="right:{right}px;bottom:{b}px;height:{h}px" alt="" '
            f'onerror="this.style.display=\'none\'; this.previousElementSibling.style.display=\'none\'">')


def char_left(name, left=60, bottom=20, height=360, flip=False):
    return (f'<div class="v3-floor" style="left:{left - 20}px;bottom:{bottom - 14}px;width:{int(height * .62)}px"></div>'
            f'<img class="char v3-host" src="{CHAR}/{name}.png" style="left:{left}px;bottom:{bottom}px;height:{height}px{";transform:scaleX(-1)" if flip else ""}" alt="" '
            f'onerror="this.style.display=\'none\'">')


def letter_tiles(word, small=False):
    if len(word.replace(" ", "")) > 12:
        return ""
    cells = "".join('<div class="v3-gap"></div>' if ch == " " else f'<div class="v3-tile">{esc(ch.upper())}</div>' for ch in word)
    return f'<div class="v3-tiles{" s" if small or " " in word else ""}">{cells}</div>'


def prompt(text, top, sub="", extra=""):
    inner = f'<span style="display:flex;flex-direction:column;align-items:center;gap:2px">{text}<small>{sub}</small></span>' if sub else text
    return f'<div class="v3-prompt" style="top:{top}px;{extra}"><div>{inner}</div></div>'


def note(label, body, style, icon="bulb"):
    return f'<div class="v3-note" style="{style}"><b class="k">{ico(icon)}{label}</b>{body}</div>'


# ---------------------------------------------------------------- slides
def slide_title(lesson, num_words):
    chips = "".join(f'<span class="v3-chip" style="background:#fff">{esc(v["en"])}</span>' for v in lesson["vocab"])
    lvl = STATE["level"].replace("level", "Level ").replace("pre-a", "Pre-A")
    return _bg() + f'''
    <div class="v3-glow" style="left:120px;top:20px;width:900px;height:900px"></div>
    <div style="position:absolute;left:90px;top:70px;width:860px;text-align:center;z-index:5">
      <img src="assets/logo/lumio-logo.png" alt="Lumio English" style="height:150px;filter:drop-shadow(0 14px 18px rgba(60,30,5,.35))">
    </div>
    <div class="v3-paper" style="left:90px;top:250px;width:860px;padding:34px 44px 36px;text-align:center">
      <div class="v3-label">{lvl} &middot; Lesson {lesson.get("number", STATE["lesson"])}</div>
      <div class="v3-word" style="font-size:5.6rem;margin:10px 0 18px">{esc(lesson["title"])}</div>
      <div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center">{chips}</div>
    </div>
    ''' + char_img("noor-happy", right=110, bottom=40, height=340)


def slide_lets_learn(lesson, n, total, num_words):
    return _bg() + header("Let's Learn!", n, total) + f'''
    <div class="v3-paper" style="left:70px;top:160px;width:640px;min-height:330px">
      <div class="v3-label">{ico("compass")} Today's goal</div>
      <div class="v3-quote" style="font-size:2.6rem;margin:14px 0 22px">{esc(lesson.get("goal", ""))}</div>
      <span class="v3-chip">{ico("cards")}{num_words} new words &bull; {esc(lesson.get("grammarFocus", ""))}</span>
    </div>
    <div class="v3-paper" style="left:740px;top:200px;width:380px;padding:30px 32px">
      <div class="v3-label t">{ico("flame")} Warm-up</div>
      <div class="v3-quote" style="font-size:1.75rem;margin-top:12px">Stand up, stretch, and say hello to a friend! &#10024;</div>
    </div>
    ''' + char_img("lumi-wave-book", bottom=42, height=310)


def slide_unscramble(word, n, total, ch):
    letters = list(word["en"].replace(" ", ""))
    order = list(range(len(letters)))
    random.Random(sum(ord(c) for c in word["en"])).shuffle(order)
    tiles = "".join(f'<div class="v3-tile" style="width:96px;height:100px;font-size:3.2rem;border-radius:22px">{esc(letters[order[i]].upper())}</div>' for i in range(len(order)))
    return _bg() + header("Warm-Up &bull; Unscramble!", n, total) + prompt("Can you guess the word before it's revealed?", 150) + f'''
    <div class="v3-tiles" style="position:absolute;left:60px;right:380px;top:270px;z-index:8;gap:16px">{tiles}</div>
    <div id="unscrambleAnswer" style="position:absolute;left:60px;right:380px;top:420px;text-align:center;display:none;z-index:8">
      <div class="v3-paper" style="position:relative;display:inline-block;padding:22px 46px">
        <div class="v3-word m">{esc(word["en"])}</div>
        <div class="v3-ar" style="margin-top:10px">{word["ar"]}</div>
      </div>
    </div>
    <button class="v3-btn" onclick="document.getElementById('unscrambleAnswer').style.display='block'; {speak(word["en"])}"
            style="position:absolute;left:70px;bottom:84px;z-index:20">&#128064; Reveal the word</button>
    ''' + char_img(ch, bottom=32, height=270)


def slide_recap(prev_words, n, total):
    cards = ""
    for w in prev_words[:3]:
        cards += f'''
        <button class="v3-card" style="width:250px" onclick="this.querySelector('.recap-answer').style.display='flex';
                       this.querySelector('.recap-question').style.display='none'; {speak(w["en"])}">
          <div class="ph"><img src="{vimg(w)}" alt="" onerror="this.style.display='none'"></div>
          <div class="recap-question q">Tap to remember<span style="font-size:2rem">&#129300;</span></div>
          <div class="recap-answer" style="display:none;flex-direction:column;align-items:center;gap:2px">
            <div style="font-size:1.9rem;line-height:1">{esc(w["en"])}</div><div class="ar" style="font-size:1.3rem">{w["ar"]}</div>
          </div>
        </button>'''
    return _bg() + header("Quick Recap &bull; Do you remember?", n, total) + f'''
    <div class="v3-board" style="left:60px;right:360px;top:170px;gap:34px">{cards}</div>
    ''' + prompt("From last lesson &mdash; tap each card to check!", 640, extra="right:330px") + char_img("noor-think", right=70, bottom=60, height=270)


def mouth(letter, size=60):
    return f'<img src="assets/spelling/mouth-{letter}.png" style="width:{size}px;height:{size}px;object-fit:contain;display:block;margin:6px auto 0" alt="" onerror="this.style.display=\'none\'">'


def slide_phonics_rule(unit, n, total, ch):
    sounds = unit.get("sounds", [])
    tiles = ""
    if sounds:
        for s in sounds:
            tok = s["letter"].split(",")[0].split("-")[0].strip()
            tiles += f'''
          <button class="v3-card" style="width:150px;padding:14px 10px" onclick="typeof Lumio !== 'undefined' && Lumio.speakPhonicsSound && Lumio.speakPhonicsSound('{esc(tok)}')">
            <div style="font-size:3rem;line-height:1;color:var(--orange-d)">{esc(s["letter"])}</div>
            <div style="font-family:var(--read);font-size:1rem;color:var(--ink2)">{esc(s["sound"])}</div>
            {mouth(tok.lower())}
          </button>'''
    else:
        for w in unit.get("words", []):
            tiles += f'<button class="v3-card" style="width:auto;padding:14px 22px" onclick="{speak(w["en"])}"><div style="font-size:2rem;color:var(--orange-d)">{esc(w["en"])}</div><div class="ar">{w["ar"]}</div></button>'
    tip = unit.get("tip", "")
    return _bg() + header("Phonics Time! &#128218;", n, total) + f'''
    <div class="v3-paper" style="left:60px;top:150px;width:840px;padding:30px 36px">
      <div class="v3-label t">{ico("sound")} Teacher: explain this rule</div>
      <div class="v3-quote" style="font-size:2.3rem;margin:8px 0 2px">{esc(unit["unit"])}</div>
      <div class="v3-arline" style="margin-bottom:16px">{unit["unitAr"]}</div>
      <div style="display:flex;flex-wrap:wrap;gap:16px;justify-content:center">{tiles}</div>
    </div>
    ''' + (note("Teacher tip", f'<div dir="rtl" style="text-align:right;font-family:var(--arf)">{tip}</div>', "left:930px;top:150px;width:300px") if tip else "") + char_img(ch, bottom=42, height=290)


def slide_phonics_practice(unit, n, total, ch):
    cards = ""
    for w in unit.get("words", [])[:6]:
        tl = letter_tiles(w["en"], small=True) or f'<div style="font-size:2rem">{esc(w["en"])}</div>'
        cards += f'<button class="v3-card" style="width:250px;padding:20px 14px 16px" onclick="{speak(w["en"])}">{tl}<div class="ar" style="font-size:1.3rem;margin-top:6px">{w["ar"]}</div></button>'
    return _bg() + header("Listen &amp; Spot", n, total) + prompt("Tap each word, sound it out, then say it together!", 140) + f'''
    <div class="v3-board" style="left:40px;right:380px;top:250px;gap:26px">{cards}</div>
    ''' + char_img(ch, right=90, bottom=40, height=320)


def slide_phonics_story(unit, n, total, ch):
    story = unit.get("story", {})
    label = esc(unit.get("unit", "").split(":")[0].upper())
    return _bg() + header("Read the Story!", n, total) + f'''
    <div class="v3-paper" style="left:70px;top:150px;width:900px;padding:34px 42px">
      <div class="v3-label t">{ico("story")} A story with {label}</div>
      <div class="v3-quote" style="font-size:2.3rem;line-height:1.45;margin:12px 0 16px">{esc(story.get("en", ""))}</div>
      <div class="v3-hr"></div>
      <div class="v3-arline">{story.get("ar", "")}</div>
      <button class="v3-btn teal" style="margin-top:18px" onclick="{speak(story.get("en", ""))}">{ico("sound")}Listen to the story</button>
    </div>
    ''' + char_img(ch, bottom=24, height=280)


def slide_sound_match(target_word, distractor_words, idx, total_q, n, total, seed):
    opts = distractor_words + [target_word]
    random.Random(seed).shuffle(opts)
    letters = "ABCD"
    buttons = "".join(f'''<button class="v3-opt" data-letter="{letters[i]}" data-quiz-option="{esc(o["en"])}"
          onclick="window.checkQuizAnswer && checkQuizAnswer(this, '{jsq(o["en"])}', '{jsq(target_word["en"])}')">
          {letter_tiles(o["en"], small=True) or esc(o["en"])}</button>''' for i, o in enumerate(opts))
    return _bg() + header(f"Sound Match &bull; {idx}/{total_q}", n, total) + f'''
    <div class="v3-paper" style="left:80px;top:170px;width:330px;height:430px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;text-align:center">
      <div class="v3-quote" style="font-size:2rem">Which word is this?</div>
      <button class="v3-btn teal round" style="width:170px;height:170px" onclick="{speak(target_word["en"])}">&#128266;</button>
      <div class="v3-label t">Tap to hear</div>
    </div>
    <div class="v3-opts" style="left:470px;right:80px;top:180px;grid-template-columns:1fr 1fr">{buttons}</div>
    '''


def slide_vocab(w, idx, n, total, num_words, ch, verb_count=0):
    from word_categories import chip_label as _chip, categorize as _cat, CATEGORY_LABELS as _CL
    chip = _chip(w, esc(w["en"])).replace(" · ", " &bull; ")
    cat_en, cat_ar = _CL[_cat(w)]
    quote = w.get("example", w["en"])
    word_cls = "v3-word" if len(w["en"]) <= 9 else "v3-word m"
    return _bg() + header(chip, n, total) + f'''
    <div class="v3-photo" style="left:70px;top:150px;width:440px;height:440px"><div class="pic">
      <img src="{vimg(w)}" alt="" onerror="this.parentElement.style.background='#FFF3D6'; this.remove()"></div></div>
    <div style="position:absolute;left:60px;width:460px;top:626px;z-index:8">{letter_tiles(w["en"], small=len(w["en"]) > 7)}</div>
    <div class="v3-paper" style="left:560px;top:150px;width:560px;padding:34px 42px 34px">
      <span class="v3-chip">{cat_en} &middot; {cat_ar}</span>
      <div class="{word_cls}" style="margin:16px 0 14px">{esc(w["en"])}</div>
      <div class="v3-ar">{w["ar"]}</div>
      <div class="v3-hr"></div>
      <div class="v3-label">{ico("speech")} Say it</div>
      <div class="v3-quote" style="margin:8px 0 22px">&ldquo;{esc(quote)}&rdquo;</div>
      <button class="v3-btn" onclick="{speak(w["en"])}">{ico("sound")}Listen &rarr; Repeat &times;3</button>
    </div>
    ''' + char_img(ch, right=40, bottom=28, height=250)


def slide_practice_phonics(w, n, total, ch, show_phonics_link=True, seed=0):
    quote = w.get("example", w["en"])
    fl = w["en"][0].upper()
    callout = (f'''<div style="display:flex;align-items:center;gap:14px;margin-top:18px">
          <div class="v3-tile" style="flex:none">{fl}</div>
          <div style="font-weight:800;font-size:1.15rem;color:var(--ink2);line-height:1.35">&ldquo;{esc(w["en"])}&rdquo; starts with the <b style="color:var(--teal)">{fl.lower()}</b> sound &mdash; find more {fl.lower()} words in Phonics!</div>
        </div>''' if show_phonics_link else "")
    question = T.discussion_question(w["en"], seed)
    return _bg() + header(f"Practice &bull; {esc(w['en'])}", n, total) + f'''
    <div class="v3-photo r" style="left:80px;top:170px;width:330px;height:330px"><div class="pic"><img src="{vimg(w)}" alt="" onerror="this.style.display='none'"></div></div>
    <div class="v3-paper" style="left:460px;top:160px;width:600px;padding:34px 40px">
      <div class="v3-label">{ico("mic")} Can you say it?</div>
      <div class="v3-quote" style="font-size:2.6rem;margin-top:10px;color:var(--orange-d)">&ldquo;{esc(quote)}&rdquo;</div>
      {callout}
    </div>
    ''' + note("Teacher: ask", esc(question), "left:470px;top:520px;width:560px", "speech") + char_img(ch, bottom=32, height=260)


DIALOGUE_PAIRS = T.DIALOGUE_CHAR_PAIRS


def slide_dialogue(lines, n, total, lesson_num=0):
    lc, rc = DIALOGUE_PAIRS[lesson_num % len(DIALOGUE_PAIRS)]
    ln, rn = T.char_display_name(lc), T.char_display_name(rc)
    k = len(lines)
    fs = 1.65 if k <= 4 else 1.35
    bubbles = ""
    for i, line in enumerate(lines):
        if len(line) >= 3:
            sp, en, ar = line[0], line[1], line[2]
        else:
            sp, en, ar = ("L" if i % 2 == 0 else "R"), line[0], (line[1] if len(line) > 1 else "")
        left = sp == "L"
        bubbles += f'''<div class="v3-line {'l' if left else 'r'}"><div class="who">{esc(ln if left else rn)}</div>
          <div class="en" style="font-size:{fs}rem">{esc(en)}</div><div class="ar2">{ar}</div></div>'''
    return _bg() + header("Dialogue &bull; Let's talk!", n, total) + prompt(
        "Listen first, then read it in pairs &mdash; swap roles!", 122,
        "1-on-1: you read one character, your teacher reads the other &mdash; then swap.") + f'''
    <div class="v3-chat" style="left:340px;width:790px;top:220px;bottom:70px">{bubbles}</div>
    ''' + char_left(lc, left=40, bottom=10, height=330) + char_img(rc, right=40, bottom=32, height=250).replace('class="char v3-host"', 'class="char v3-host" ', 1)


def slide_vocab_scene(image_path, sentence, bold_words, n, total, seed, translation=None):
    hl = T.highlight_words(esc(sentence), bold_words).replace('class="vs-key"', 'class="v3-key"')
    return f'''<div class="v3-bg" style="background-image:url('{image_path}')"></div>
    <div class="v3-shade" style="background:linear-gradient(180deg,rgba(30,15,0,.45),rgba(30,15,0,0) 22%,rgba(30,15,0,0) 60%,rgba(30,15,0,.55))"></div>
    {header("", n, total)}
    <div class="v3-caption">
      <div><div class="v3-quote">{hl}</div>{f'<div class="v3-ar" style="margin-top:8px;font-size:1.25rem">{esc(translation)}</div>' if translation else ''}</div>
      <button class="v3-btn round" onclick="{speak(sentence)}">&#128266;</button>
    </div>'''


def slide_sentence_trio(sentences, n, total, ch, seed):
    rows = ""
    for i, sentence in enumerate(sentences):
        words, punct = T.tokenize_sentence(sentence)
        order = list(range(len(words)))
        random.Random(seed * 10 + i).shuffle(order)
        pt = f'<div class="sbg-tile sbg-punct" style="cursor:default">{punct}</div>' if punct else ""
        slots = "".join(f'<div class="sb-slot sbg-slot" data-group="{i}" data-index="{j}"></div>' for j in range(len(words)))
        tray = "".join(f'<div class="sb-tile sbg-tile" draggable="false" data-group="{i}" data-word="{esc(words[j])}">{esc(words[j])}</div>' for j in order)
        rows += f'''<div class="v3-sbrow"><div class="num">{i + 1}</div>
          <div id="sbSlots{i}" data-correct="{esc(sentence.strip())}" style="display:flex;gap:8px;flex-wrap:wrap;min-height:52px">{slots}{pt}</div>
          <div style="display:flex;align-items:center;gap:12px;margin-top:10px">
            <div id="sbTray{i}" style="display:flex;gap:8px;flex-wrap:wrap;flex:1">{tray}</div>
            <button class="v3-btn teal s" onclick="window.checkSentenceBuilder && checkSentenceBuilder('{i}')">&#10003; Check</button>
          </div>
          <div id="sbFeedback{i}" style="font-family:var(--display);font-weight:800;font-size:1.15rem;min-height:22px;margin-top:4px"></div></div>'''
    return _bg() + header("Build the Sentences", n, total) + prompt("Put the words in the right order &mdash; drag the tiles!", 118) + f'''
    <div class="v3-sb" style="top:196px">{rows}</div>'''


def slide_sound_spot(vocab, n, total, ch):
    cards = "".join(f'''<button class="v3-card" style="width:170px" onclick="{speak(w["en"])}">
        <div class="ph"><img src="{vimg(w)}" alt="" onerror="this.style.display='none'"></div>{esc(w["en"])}<div class="ar">{w["ar"]}</div></button>''' for w in vocab)
    return _bg() + header("Sound &amp; Spot", n, total) + prompt("Tap any word to hear it &mdash; can you say it before it plays?", 128) + f'''
    <div class="v3-board" style="left:20px;right:330px;top:214px;bottom:70px;overflow-y:auto;align-content:flex-start;padding:10px 10px 20px">{cards}</div>
    ''' + char_img(ch, right=60, bottom=40, height=300)


def your_turn_html(w, idx, total_rounds, teen, chars_html=""):
    if teen:
        return _orig_your_turn(w, idx, total_rounds, teen, chars_html)
    en, ar = w["en"], w.get("ar", "")
    steps = "".join(f'<span class="v3-chip" style="background:#fff">{t}</span>' for t in ("1 Play the word", "2 Say the Arabic", "3 Reveal"))
    return f'''
    <div class="v3-photo" style="left:150px;top:160px;width:420px;height:420px"><div class="pic" id="ytCard{idx}" style="display:grid;place-items:center">
      <div id="ytMystery{idx}" style="font-family:var(--display);font-weight:800;font-size:13rem;line-height:1;background:linear-gradient(180deg,#FFA43A,#F2600C);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 20px 24px rgba(242,96,12,.35))">?</div>
      <img id="ytImg{idx}" src="{vimg(w)}" style="display:none;position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:#fff;padding:14px" alt="" onerror="this.style.display='none'">
    </div></div>
    <div class="v3-paper" style="left:640px;top:170px;width:520px;padding:30px 34px;text-align:center">
      <div id="ytAsk{idx}">
        <div class="v3-quote" style="font-size:2.3rem">Listen &mdash; say it in Arabic!</div>
        <div class="v3-arline" style="text-align:center;font-size:1.4rem">استمعوا ثم قولوا الكلمة بالعربية</div>
        <div style="display:flex;justify-content:center;gap:8px;margin-top:14px;flex-wrap:wrap">{steps}</div>
        <div style="margin-top:14px;font-weight:700;font-size:1.05rem;color:var(--ink2);line-height:1.45">Pairs: the first to say the Arabic wins the point.<br>1-on-1: your teacher plays the word, you answer.</div>
      </div>
      <div id="ytAns{idx}" style="display:none">
        <div class="v3-bigar">{ar}</div>
        <div class="v3-word m" style="color:var(--orange-d);margin-top:6px">{esc(en)}</div>
        {f'<div class="v3-quote" style="font-size:1.4rem;margin-top:10px;color:var(--ink2)">&ldquo;{esc(w.get("example"))}&rdquo;</div>' if w.get("example") else ""}
      </div>
    </div>
    <div style="position:absolute;left:640px;width:520px;top:600px;display:flex;justify-content:center;gap:18px;z-index:20">
      <button class="v3-btn teal" onclick="typeof Lumio!=='undefined' && Lumio.speak && Lumio.speak({esc(_json.dumps(en))})">&#9654; Play the word</button>
      <button class="v3-btn" onclick="document.getElementById('ytMystery{idx}').style.display='none';document.getElementById('ytImg{idx}').style.display='block';document.getElementById('ytAsk{idx}').style.display='none';document.getElementById('ytAns{idx}').style.display='block';this.disabled=true;this.style.opacity=.55">&#128064; Reveal</button>
    </div>
    {chars_html}'''


def slide_your_turn_listen_first(w, idx, total_rounds, n, total, ch):
    return _bg() + header(f"Your Turn &bull; Round {idx} of {total_rounds}", n, total) + your_turn_html(w, idx, total_rounds, False, char_img(ch, right=40, bottom=32, height=200))


def slide_quick_check(target, distractors, idx, total_q, n, total, seed, tier="preA"):
    n_opts = {"preA": 2, "level1": 3, "level2": 4}.get(tier, 4)
    opts = distractors[:n_opts - 1] + [target]
    random.Random(seed).shuffle(opts)
    letters = "ABCD"
    prompt_txt = {"preA": "Which one is it?", "level1": "Which word matches?"}.get(tier, "What is this?")
    buttons = "".join(f'''<button class="v3-opt" data-letter="{letters[i]}" data-quiz-option="{esc(o["en"])}"
        onclick="window.checkQuizAnswer && checkQuizAnswer(this, '{jsq(o["en"])}', '{jsq(target["en"])}')">{esc(o["en"])}</button>''' for i, o in enumerate(opts))
    cols = "1fr" if n_opts == 3 else "1fr 1fr"
    return _bg() + header(f"Quick Check &bull; {idx}", n, total) + f'''
    <div class="v3-paper v3-qcard" style="left:110px;top:170px;width:400px;height:400px">
      <div class="v3-label t">{ico("question")} {prompt_txt}</div>
      <div class="v3-bigar" style="margin-top:16px">{esc(target.get("ar", ""))}</div>
    </div>
    <div class="v3-opts" style="left:580px;width:{560 if n_opts != 3 else 520}px;top:{180 if n_opts == 3 else 220}px;grid-template-columns:{cols}">{buttons}</div>
    '''


def slide_teacher_game(vocab, n, total, ch, tier="preA", mode="teacher"):
    show_word = tier != "preA"
    w_px = 200 if tier == "preA" else 176
    tiles = "".join(f'''<button class="v3-card" style="width:{w_px}px" onclick="{speak(w["en"])}">
        <div class="ph"><img src="{vimg(w)}" alt="" onerror="this.style.display='none'"></div>{esc(w["en"]) if show_word else ""}</button>''' for w in vocab)
    title = {"teacher": "Teacher & Student Game", "student": "Your Turn to Call It!", "partner": "Partner Challenge", "group": "Everyone Together!"}.get(mode, "Teacher & Student Game")
    instr = {"teacher": "Teacher says a word out loud &mdash; first student to tap it wins!",
             "student": "Pick a student to call out a word for the class &mdash; everyone else races to tap it!",
             "partner": "Pair up! Take turns calling out words for your partner to find.",
             "group": "Everyone stands up! Teacher calls a word and the whole class points to it together!"}.get(mode, "")
    return _bg() + header(title, n, total) + prompt(instr, 122) + f'''
    <div class="v3-board" style="left:30px;right:30px;top:206px;bottom:64px;overflow-y:auto;align-content:flex-start;padding:10px 120px 20px;gap:20px">{tiles}</div>
    ''' + char_img(ch, right=20, bottom=30, height=150)


def slide_quiz(target, distractors, idx, total_q, n, total, seed):
    opts = distractors + [target]
    random.Random(seed).shuffle(opts)
    letters = "ABCD"
    buttons = "".join(f'''<button class="v3-opt" data-letter="{letters[i]}" data-quiz-option="{esc(o["en"])}"
        onclick="window.checkQuizAnswer && checkQuizAnswer(this, '{jsq(o["en"])}', '{jsq(target["en"])}')">{esc(o["en"])}</button>''' for i, o in enumerate(opts))
    return _bg() + header(f"Quiz &bull; {idx}/{total_q}", n, total) + f'''
    <div class="v3-photo" style="left:100px;top:160px;width:420px;height:420px"><div class="pic"><img src="{vimg(target)}" alt="" onerror="this.style.display='none'"></div></div>
    <div class="v3-stamp" style="left:440px;top:120px"><span><b>?</b>Quiz</span></div>
    ''' + prompt("What is this?", 168, extra="left:590px;right:auto;width:600px") + f'''
    <div class="v3-opts" style="left:590px;width:600px;top:270px;grid-template-columns:1fr 1fr">{buttons}</div>
    '''


def _recap_block(blk):
    kind, items = blk["kind"], blk["items"]
    label = blk["label"] + (" (cont.)" if blk.get("cont") else "")
    t = "" if kind in ("chips", "pills") else ' class="t"'
    out = f'<h4{t}>{label}</h4>'
    if kind == "chips":
        out += '<div class="row">' + "".join(
            f'<div class="mini"><div class="ph"><img src="assets/vocab/{slug(w["image"] if isinstance(w, dict) else w)}.png" alt="" onerror="this.style.display=\'none\'"></div>{esc(w["en"] if isinstance(w, dict) else w)}</div>'
            for w in items) + '</div>'
    elif kind == "pills":
        out += '<div class="row">' + "".join(f'<div class="pill">{esc(w["en"] if isinstance(w, dict) else w)}</div>' for w in items) + '</div>'
    else:
        title = blk.get("title")
        th = f'<div class="sent" style="font-weight:800;margin-bottom:6px">{esc(title)}</div>' if title and not blk.get("cont") else ""
        cols = "1fr 1fr" if kind == "sentences" else "1fr"
        rows = "".join(f'<div class="sent" style="color:var(--orange-d)">&ldquo;{esc(p)}&rdquo;</div>' for p in items)
        out += f'<div class="sents" style="grid-template-columns:{cols}">{th and "<div style=\'grid-column:1/-1\'>" + th + "</div>"}{rows}</div>'
    return out


def slide_today_i_learned(page, page_idx, page_count, n, total):
    title = "Today I Learned! &#127775;" if page_count == 1 else f"Today I Learned! &#127775; &middot; {page_idx}/{page_count}"
    body = "".join(_recap_block(b) for b in page)
    return _bg() + header(title, n, total) + f'''
    <div class="v3-paper v3-recap" data-recap-body style="left:60px;top:140px;width:1010px;max-height:610px;overflow:hidden;padding:28px 34px">{body}</div>
    ''' + char_img("noor-happy", right=40, bottom=42, height=300)


def slide_reward_homework(lesson_num, n, total, has_story=False):
    items = ["Do the interactive homework on your dashboard first",
             "Print your worksheet, writing-practice sheet and flashcards",
             "Memorise today's words with your flashcards",
             "Play this lesson's bonus game"]
    if has_story and lesson_num in (5, 10, 15, 20):
        items.append("A new story part is waiting for you in the Story section!")
    rows = "".join(f'''<div style="display:flex;align-items:center;gap:14px;padding:7px 0">
        <span style="width:40px;height:40px;border-radius:50%;flex:none;display:grid;place-items:center;font-family:var(--display);font-weight:800;font-size:1.2rem;color:#fff;background:linear-gradient(180deg,#2CC4B4,var(--teal-d))">{i + 1}</span>
        <span style="font-family:var(--display);font-weight:700;font-size:1.35rem;line-height:1.25">{it}</span></div>''' for i, it in enumerate(items))
    stars = "".join(f'<i class="v3-ico" data-ico="star" style="width:72px;height:72px;transform:translateY({abs(2 - i) * 14}px)"></i>' for i in range(5))
    return _bg() + header("Great Job! &bull; Homework", n, total) + f'''
    <div class="v3-glow" style="left:-40px;top:60px;width:760px;height:760px"></div>
    <div style="position:absolute;left:70px;top:160px;width:520px;text-align:center;z-index:6">
      <i class="v3-ico" data-ico="trophy" style="width:190px;height:190px;filter:drop-shadow(0 16px 20px rgba(120,60,0,.45))"></i>
      <div style="display:flex;justify-content:center;gap:4px;margin:6px 0 16px">{stars}</div>
      <div class="v3-btn gold" style="cursor:default">You earned 5 stars!</div>
    </div>
    <div class="v3-paper" style="left:640px;top:150px;width:560px;padding:30px 36px">
      <div class="v3-label t">{ico("pencil")} Before next time&hellip;</div>
      <div style="margin-top:10px">{rows}</div>
    </div>
    ''' + char_left("lumi-wave-book", left=1010, bottom=10, height=250) + char_img("omar-wave", right=20, bottom=30, height=230)


# ---------------------------------------------------------------- activity slides (Flash Race, Memory, Mystery)
def _a_card(kid, extra=""):
    if not kid:
        return _orig_a_card(kid, extra)
    return ("background:rgba(255,255,255,.76);-webkit-backdrop-filter:blur(24px) saturate(1.7);backdrop-filter:blur(24px) saturate(1.7);border-radius:28px;"
            "border:1px solid rgba(255,255,255,.85);box-shadow:0 30px 60px -30px rgba(40,24,8,.55),0 10px 24px -12px rgba(40,24,8,.25);" + extra)


def _a_btn(label, onclick, color="#F97316", color2="#EA580C", extra=""):
    cls = {"#0D9488": "teal", "#FBBF24": "gold", "#94A3B8": "ghost"}.get(color, "")
    return f'<button class="v3-btn s {cls}" onclick="{onclick}" style="{extra.replace("color:#43301F", "")}">{label}</button>'


def _a_band(kid, title, pairs, solo, top=128):
    if not kid:
        return _orig_a_band(kid, title, pairs, solo, top)
    return f'''
    <div style="position:absolute;left:60px;right:60px;top:{top - 6}px;z-index:6;display:flex;gap:18px">
      <div class="v3-note" style="position:relative;width:auto;flex:1"><b class="k">{ico("people")}Pairs / group</b>{pairs}</div>
      <div class="v3-note" style="position:relative;width:auto;flex:1;background:linear-gradient(180deg,rgba(214,244,250,.9),rgba(190,234,244,.84));color:#0B4F5C"><b class="k" style="color:#0B7A6F">{ico("user")}1-on-1 with your teacher</b>{solo}</div>
    </div>'''


# ---------------------------------------------------------------- emoji -> Lumio icons, wrapper
EMOJI = {"128266": "sound", "128064": "eye", "10003": "check", "11088": "star", "127922": "dice", "128172": "speech", "128161": "bulb",
         "127881": "sparkle", "128101": "people", "128100": "user", "128218": "library", "129300": "question", "10024": "sparkle",
         "9989": "check", "127775": "star", "128512": "smile", "128075": "wave", "127942": "trophy", "9654": "play", "128214": "book",
         "9999": "pencil", "128066": "sound"}
EMOJI_CHARS = {chr(int(k)): v for k, v in EMOJI.items()}
_ENT = re.compile(r"&#(\d+);(?:&#65039;)?")


def _iconify_text(txt):
    txt = _ENT.sub(lambda m: f'<i class="v3-ico" data-ico="{EMOJI[m.group(1)]}"></i>' if m.group(1) in EMOJI else m.group(0), txt)
    return "".join(f'<i class="v3-ico" data-ico="{EMOJI_CHARS[c]}"></i>' if c in EMOJI_CHARS else c for c in txt if c != "️")


def finish(html):
    html = re.sub(r">([^<]+)<", lambda m: ">" + _iconify_text(m.group(1)) + "<", html)
    return f'<div class="v3 v3-kid">{html}</div>'


# ---------------------------------------------------------------- install
_orig_your_turn = T.your_turn_html
_orig_a_card, _orig_a_band = A._card, A.mode_band


def install(level):
    STATE["level"] = level
    for name in ("header", "char_img", "letter_tiles", "slide_title", "slide_lets_learn", "slide_unscramble", "slide_recap",
                 "slide_phonics_rule", "slide_phonics_practice", "slide_phonics_story", "slide_sound_match", "slide_vocab",
                 "slide_practice_phonics", "slide_dialogue", "slide_vocab_scene", "slide_sentence_trio", "slide_sound_spot",
                 "your_turn_html", "slide_your_turn_listen_first", "slide_quick_check", "slide_teacher_game", "slide_quiz",
                 "slide_today_i_learned", "slide_reward_homework"):
        setattr(T, name, globals()[name])
    for fn in ("bg_study", "bg_plain", "bg_bare", "bg_clean"):
        setattr(T, fn, _bg)
    T.COLORSTRIP = ""
    T.dots = lambda active_i, count: ""
    A._card, A._btn, A.mode_band = _a_card, _a_btn, _a_band
    orig_build = T.build_deck

    def build_deck(lesson_num, *args, **kw):
        STATE["lesson"] = lesson_num
        return [finish(h) for h in orig_build(lesson_num, *args, **kw)]
    T.build_deck = build_deck
