# -*- coding: utf-8 -*-
"""
The "v2" richer/more-efficient deck template (piloted on level1/01),
generalized to run across a full level's 20 lessons. Overwrites the
live slide-content/{level}/{NN}/ decks and assets/slides/{level}/manifest.json.
"""
import json, os, re, glob, random
import grammar_slides

CHAR = "assets/story/characters"

def esc(s):
    return (s or "").replace("&", "&amp;").replace('"', "&quot;")
def slug(w):
    return w.lower().replace("'", "").replace(" ", "-")

SPARKS = ('<div class="spark" style="left:375px;top:135px;font-size:1.6rem">&#10022;</div>'
          '<div class="spark" style="left:415px;top:105px;font-size:1.1rem">&#10022;</div>'
          '<div class="spark" style="left:392px;top:178px;font-size:1.3rem">&#10022;</div>')
WINDOW = '<div class="window"><div class="cross-v"></div><div class="cross-h"></div></div>'
SHELF_BOOKS = ('<div class="shelf"></div>'
    '<div class="book" style="left:56px;width:32px;height:78px;background:#F97316"></div>'
    '<div class="book" style="left:93px;width:28px;height:85px;background:#0D9488"></div>'
    '<div class="book" style="left:126px;width:36px;height:92px;background:#F59E0B"></div>'
    '<div class="book" style="left:167px;width:26px;height:99px;background:#2DD4BF"></div>'
    '<div class="book" style="left:198px;width:32px;height:81px;background:#DC5C33"></div>')
def bg_study(): return f'<div class="wall"></div><div class="teal-band"></div>{SHELF_BOOKS}{WINDOW}{SPARKS}'
def bg_plain(): return f'<div class="wall"></div><div class="teal-band"></div>{WINDOW}{SPARKS}'
def bg_bare(): return f'<div class="wall"></div><div class="teal-band"></div>{SPARKS}'
def bg_clean(): return f'<div class="wall"></div><div class="teal-band"></div>{WINDOW}'

def header(pagetitle, n, total):
    return f'''<div class="header">
      <div class="brand"><img src="assets/logo/lumio-logo.png"><div class="name">Lumio<small>ENGLISH</small></div></div>
      <div class="pagetitle">{pagetitle}</div>
      <div class="counter">{n} / {total}</div>
    </div>'''
COLORSTRIP = '<div class="colorstrip"><div class="c1"></div><div class="c2"></div><div class="c3"></div><div class="c4"></div><div class="c5"></div></div>'
def dots(active_i, count):
    cells = "".join(f'<div class="dot {"on" if i == active_i else ""}"></div>' for i in range(count))
    return f'<div class="dots">{cells}</div>'
def char_img(name, right=95, bottom=42, height=300):
    return (f'<div class="floorshadow" style="right:{right}px;bottom:{bottom-7}px;width:230px;height:36px"></div>'
            f'<img class="char" src="{CHAR}/{name}.png" style="right:{right}px;bottom:{bottom}px;height:{height}px">')
LETTER_COLORS = ["#F97316", "#0D9488", "#F59E0B", "#2DD4BF", "#DC5C33"]
def letter_tiles(word):
    if " " in word or len(word) > 10: return ""
    tiles = ""
    for i, ch in enumerate(word):
        color = LETTER_COLORS[i % len(LETTER_COLORS)]
        tiles += f'''<div style="width:52px;height:52px;border-radius:12px;display:flex;align-items:center;justify-content:center;
                  font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.35rem;color:#fff;background:{color};
                  box-shadow:0 3px 0 rgba(0,0,0,.14), 0 6px 12px rgba(67,48,31,.16)">{ch.upper()}</div>'''
    return f'<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">{tiles}</div>'

VOCAB_CHARS = ["omar-wave", "noor-happy", "sara-clap", "omar-point", "noor-wave"]

def slide_title(lesson, num_words):
    subtitle = " &bull; ".join(esc(v["en"]) for v in lesson["vocab"])
    return f'''
    <div style="position:absolute;inset:0;overflow:hidden">
    <div style="position:absolute;inset:0;background:linear-gradient(180deg,#FFF3D6 0%,#FDF3E0 100%)"></div>
    <div style="position:absolute;left:80px;top:110px;width:70px;height:70px;border-radius:50%;background:#FDD8351F;border:3px solid #FDD835;
      display:flex;align-items:center;justify-content:center;font-size:1.8rem;box-shadow:0 10px 16px rgba(67,48,31,.14)">&#128512;</div>
    <div style="position:absolute;left:1300px;top:90px;width:60px;height:60px;border-radius:50%;background:#1E88E51F;border:3px solid #1E88E5;
      display:flex;align-items:center;justify-content:center;font-size:1.5rem;box-shadow:0 10px 16px rgba(67,48,31,.14)">&#128075;</div>
    </div>
    {SPARKS}
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">
      <div style="position:relative;display:flex;align-items:center;gap:18px;margin-bottom:10px">
        <div style="position:relative">
          <div style="position:absolute;inset:-10px;border-radius:50%;background:radial-gradient(circle,rgba(249,115,22,.35),transparent 70%)"></div>
          <img src="assets/logo/lumio-logo.png" style="position:relative;width:104px;height:104px;border-radius:50%;box-shadow:0 12px 28px rgba(67,48,31,.28);border:6px solid #fff">
        </div>
        <div style="text-align:left">
          <div style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:3rem;color:#43301F;line-height:1">Lumio</div>
          <div style="display:inline-block;margin-top:6px;background:linear-gradient(135deg,#F97316,#EA580C);color:#fff;
                      font-weight:800;font-size:.82rem;letter-spacing:3px;padding:4px 14px;border-radius:999px">ENGLISH</div>
        </div>
      </div>
      <div style="width:100%;background:linear-gradient(90deg,rgba(127,207,196,0) 0%,#7FCFC4 20%,#7FCFC4 80%,rgba(127,207,196,0) 100%);
                  padding:14px 0;margin:16px 0">
        <h1 style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:3.6rem;color:#43301F;margin:0">{esc(lesson["title"])}</h1>
      </div>
      <div style="font-size:1.25rem;color:#8A7160;font-weight:700;margin:10px 0">{subtitle}</div>
    </div>
    {char_img("noor-happy", right=95, bottom=40, height=340)}
    '''

def slide_lets_learn(lesson, n, total, num_words):
    return (bg_study() + header("Let's Learn!", n, total) + COLORSTRIP + f'''
    <div style="position:absolute;left:46px;top:150px;width:820px;display:flex;gap:20px">
      <div class="card" style="flex:1;padding:26px 24px">
        <div style="font-size:.78rem;font-weight:800;color:#F97316;letter-spacing:1.5px;margin-bottom:10px">TODAY'S GOAL</div>
        <div style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.35rem;color:#43301F;line-height:1.35">{esc(lesson.get("goal", ""))}</div>
        <div style="margin-top:14px;display:inline-block;background:#FFF3D6;color:#C2530A;font-weight:800;font-size:.85rem;
                    padding:6px 14px;border-radius:999px">{num_words} new words &bull; {esc(lesson.get("grammarFocus", ""))}</div>
      </div>
      <div class="card" style="flex:1;padding:26px 24px">
        <div style="font-size:.78rem;font-weight:800;color:#0D9488;letter-spacing:1.5px;margin-bottom:10px">WARM-UP</div>
        <div style="font-family:'Baloo 2',sans-serif;font-weight:700;font-size:1.1rem;color:#43301F;line-height:1.5">
          Stand up, stretch, and say hello to a friend! &#10024;</div>
      </div>
    </div>
    ''' + char_img("lumi-wave-book", bottom=42, height=310))

def slide_recap(prev_words, n, total):
    cards = ""
    for w in prev_words[:3]:
        cards += f'''
        <button onclick="this.querySelector('.recap-answer').style.display='flex';
                       this.querySelector('.recap-question').style.display='none';
                       typeof Lumio !== 'undefined' && Lumio.speak && Lumio.speak('{esc(w["en"])}')" style="border:none;cursor:pointer;font-family:inherit;width:230px;height:270px;
                    background:#fff;border-radius:22px;box-shadow:0 14px 28px rgba(67,48,31,.18);padding:18px;
                    display:flex;flex-direction:column;align-items:center;position:relative">
          <div style="width:100%;height:150px;border-radius:16px;overflow:hidden;background:#FFFCF6;border:4px solid #FFE0B8;margin-bottom:12px"><img src="assets/vocab/{slug(w["en"])}.png" style="width:100%;height:100%;object-fit:contain" onerror="this.style.display='none'"></div>
          <div class="recap-question" style="display:flex;flex-direction:column;align-items:center;gap:6px">
            <div style="font-size:.75rem;font-weight:800;color:#F97316;letter-spacing:1px">TAP TO REMEMBER</div>
            <div style="font-size:1.6rem">&#129300;</div>
          </div>
          <div class="recap-answer" style="display:none;flex-direction:column;align-items:center;gap:4px">
            <div style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.3rem;color:#43301F">{esc(w["en"])}</div>
            <div style="color:#0D9488;font-weight:800;font-size:1rem">{w["ar"]}</div>
          </div>
        </button>'''
    return (bg_plain() + header("Quick Recap &bull; Do you remember?", n, total) + COLORSTRIP + f'''
    <div style="position:absolute;left:0;right:0;top:190px;display:flex;justify-content:center;gap:28px">{cards}</div>
    <div style="position:absolute;left:0;right:0;bottom:52px;text-align:center;font-family:'Baloo 2',sans-serif;
                font-weight:700;font-size:1.05rem;color:#8A7160">From last lesson &mdash; tap each card to check!</div>
    ''' + char_img("noor-think", right=60, bottom=250, height=200))

def slide_vocab(w, idx, n, total, num_words, ch):
    quote = w.get("example", w["en"])
    return (bg_plain() + header(f"Vocabulary &bull; {esc(w['en'])}", n, total) + dots(idx, num_words) + COLORSTRIP + f'''
    <div class="card" style="position:absolute;left:46px;top:180px;width:450px;padding:24px;background:#fff">
      <div style="width:100%;aspect-ratio:1/1;border-radius:22px;overflow:hidden;margin-bottom:20px;
                     box-shadow:0 12px 26px rgba(67,48,31,.22);border:7px solid #fff;outline:4px solid #FFDCA8;background:#fff">
                     <img src="assets/vocab/{slug(w['en'])}.png" style="width:100%;height:100%;object-fit:contain" onerror="this.parentElement.style.background='#FFF3D6'; this.remove()"></div>
      {letter_tiles(w["en"])}
    </div>
    <div class="card" style="position:absolute;left:518px;top:180px;width:620px;padding:36px 42px;">
      <div style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:3.1rem;color:#43301F">{esc(w["en"])}</div>
      <div style="display:inline-block;margin-top:12px;padding:9px 24px;background:linear-gradient(135deg,#DDF6F0,#C8F0E7);color:#0D9488;
                  border-radius:999px;font-weight:800;font-size:1.15rem">{w["ar"]}</div>
      <div style="border-top:1.5px solid #F5EEE1;margin:24px 0 18px"></div>
      <div style="font-size:.82rem;font-weight:800;color:#F97316;letter-spacing:1.8px;margin-bottom:8px">SAY IT</div>
      <div style="font-family:'Baloo 2',sans-serif;font-style:italic;font-weight:700;font-size:1.4rem;color:#43301F;margin-bottom:24px">&ldquo;{esc(quote)}&rdquo;</div>
      <button onclick="typeof Lumio !== 'undefined' && Lumio.speak && Lumio.speak('{esc(w["en"])}')" style="cursor:pointer;border:none;display:inline-block;
                  background:linear-gradient(135deg,#F97316,#EA580C);color:#fff;font-weight:800;font-family:inherit;
                  padding:15px 32px;border-radius:999px;font-size:1.05rem;box-shadow:0 8px 18px rgba(249,115,22,.4)">&#9654; Listen &rarr; Repeat &times;3</button>
    </div>
    ''' + char_img(ch, right=84, bottom=28, height=250))

DISCUSSION_TEMPLATES = [
    "Can you use \u201c{w}\u201d in your own sentence?",
    "Tell me about \u201c{w}\u201d \u2014 what do you know about it?",
    "Where or when have you seen \u201c{w}\u201d before?",
]
def discussion_question(word, seed):
    tmpl = DISCUSSION_TEMPLATES[seed % len(DISCUSSION_TEMPLATES)]
    return tmpl.format(w=word)

def slide_practice_phonics(w, n, total, ch, show_phonics_link=True, seed=0):
    quote = w.get("example", w["en"])
    first_letter = w["en"][0].upper()
    callout = (f'''<div style="display:flex;align-items:center;gap:12px;background:#FFF3D6;border-radius:14px;padding:10px 16px;margin-bottom:12px">
          <div style="width:42px;height:42px;border-radius:10px;background:linear-gradient(135deg,#0D9488,#0B7A6F);color:#fff;
                      display:flex;align-items:center;justify-content:center;font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.2rem">{first_letter}</div>
          <div style="font-size:.85rem;color:#43301F;font-weight:700">&ldquo;{esc(w["en"])}&rdquo; starts with the <b>{first_letter.lower()}</b> sound &mdash; find more {first_letter.lower()} words in Phonics! &#128218;</div>
        </div>''' if show_phonics_link else "")
    question = discussion_question(w["en"], seed)
    return (bg_plain() + header(f"Practice &bull; {esc(w['en'])}", n, total) + COLORSTRIP + f'''
    <div style="position:absolute;left:0;right:0;top:180px;display:flex;justify-content:center;gap:30px">
      <div class="card" style="width:260px;height:260px;overflow:hidden;padding:0"><img src="assets/vocab/{slug(w['en'])}.png" style="width:100%;height:100%;object-fit:contain" onerror="this.style.display='none'"></div>
      <div class="card" style="width:520px;padding:30px 36px;display:flex;flex-direction:column;justify-content:center">
        <div style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.5rem;color:#43301F;margin-bottom:10px">Can you say it?</div>
        <div style="font-family:'Baloo 2',sans-serif;font-style:italic;font-weight:700;font-size:1.4rem;color:#F97316;margin-bottom:18px">&ldquo;{esc(quote)}&rdquo;</div>
        {callout}
        <div style="display:flex;align-items:center;gap:10px;background:#E6FAF7;border-radius:14px;padding:10px 16px">
          <span style="font-size:1.2rem">&#128172;</span>
          <div style="font-size:.85rem;color:#0F766E;font-weight:800">TEACHER: ASK &mdash; {esc(question)}</div>
        </div>
      </div>
    </div>
    ''' + char_img(ch, bottom=32, height=260))

def slide_dialogue(lines, n, total):
    y_positions = [165, 271, 378, 484]
    bubbles = ""
    for i, (en, ar) in enumerate(lines):
        left = i % 2 == 0
        side = "left" if left else "right"
        tri = "left" if left else "right"
        bubbles += f'''
        <div style="position:absolute;{side}:150px;top:{y_positions[i]}px;max-width:520px;background:#fff;border-radius:20px;
                    padding:14px 20px;box-shadow:0 10px 22px rgba(67,48,31,.16);z-index:6">
          <div style="position:absolute;top:20px;{tri}:-10px;border-{'right' if left else 'left'}-color:#fff;width:0;height:0;border:10px solid transparent"></div>
          <div style="font-family:'Baloo 2',sans-serif;font-weight:700;font-size:1.08rem;color:#43301F">{esc(en)}</div>
          <div style="direction:rtl;text-align:right;font-size:.86rem;color:#8A7160;font-weight:700;margin-top:3px">{ar}</div>
        </div>'''
    return (bg_plain() + header("Dialogue &bull; Let's talk!", n, total) + COLORSTRIP + bubbles + f'''
    <img class="char" src="{CHAR}/noor-wave.png" style="left:280px;bottom:0px;height:230px;position:absolute;z-index:5;filter:drop-shadow(0 16px 22px rgba(67,48,31,.3))">
    <img class="char" src="{CHAR}/sara-clap.png" style="right:280px;bottom:0px;height:230px;position:absolute;z-index:5;filter:drop-shadow(0 16px 22px rgba(67,48,31,.3));transform:scaleX(-1)">
    ''')

def tokenize_sentence(sentence):
    m = re.match(r"^(.*?)([.!?]+)$", sentence.strip())
    if m: words, punct = m.group(1).strip(), m.group(2)
    else: words, punct = sentence.strip(), ""
    return words.split(" "), punct

def slide_sentence_builder(sentence, n, total, ch, seed):
    words, punct = tokenize_sentence(sentence)
    order = list(range(len(words)))
    random.Random(seed).shuffle(order)
    slots = "".join(f'<div class="sb-slot" data-index="{i}"></div>' for i in range(len(words)))
    punct_tile = f'<div class="sb-tile sb-punct" style="cursor:default">{punct}</div>' if punct else ""
    tray = "".join(f'<div class="sb-tile" draggable="false" data-word="{esc(words[i])}">{esc(words[i])}</div>' for i in order)
    return (bg_plain() + header("Build the Sentence", n, total) + COLORSTRIP + f'''
    <div style="position:absolute;left:0;right:0;top:190px;text-align:center">
      <div style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.5rem;color:#43301F;margin-bottom:8px">Put the words in the right order!</div>
      <div style="font-size:.95rem;color:#8A7160;font-weight:700">Drag the tiles into the boxes below.</div>
    </div>
    <div id="sbSlots" data-correct="{esc(sentence.strip())}" style="position:absolute;left:0;right:0;top:300px;display:flex;justify-content:center;gap:12px;min-height:80px;flex-wrap:wrap">
      {slots}{punct_tile}
    </div>
    <div id="sbTray" style="position:absolute;left:0;right:0;top:430px;display:flex;justify-content:center;gap:12px;flex-wrap:wrap;padding:0 60px">
      {tray}
    </div>
    <div id="sbFeedback" style="position:absolute;left:0;right:0;top:560px;text-align:center;font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.3rem;min-height:40px"></div>
    <button onclick="window.checkSentenceBuilder && checkSentenceBuilder()"
            style="position:absolute;left:46px;bottom:32px;z-index:20;cursor:pointer;border:none;font-family:inherit;
            background:linear-gradient(135deg,#F97316,#EA580C);color:#fff;font-weight:800;padding:13px 28px;border-radius:999px;
            font-size:1.02rem;box-shadow:0 8px 18px rgba(249,115,22,.35)">&#10003; Check my sentence</button>
    ''' + char_img(ch, bottom=24, height=230) + '''
    <style>
      .sb-slot { width:120px; height:64px; border:3px dashed #E5DDD0; border-radius:14px; background:rgba(255,255,255,.5); }
      .sb-slot.sb-filled { border-style:solid; border-color:#FFDCA8; background:#fff; }
      .sb-tile { min-width:90px; height:64px; padding:0 18px; background:#fff; border-radius:14px; display:flex; align-items:center;
                  justify-content:center; font-family:'Baloo 2',sans-serif; font-weight:800; font-size:1.25rem; color:#43301F;
                  box-shadow:0 8px 16px rgba(67,48,31,.18); cursor:grab; touch-action:none; user-select:none; }
      .sb-tile.sb-dragging { opacity:.4; }
      .sb-tile.sb-punct { background:transparent; box-shadow:none; font-size:2rem; min-width:20px; padding:0; }
    </style>
    ''')

def slide_sound_spot(vocab, n, total, ch):
    cards = ""
    for w in vocab:
        cards += f'''
      <button onclick="typeof Lumio !== 'undefined' && Lumio.speak && Lumio.speak('{esc(w["en"])}')"
              style="border:none;cursor:pointer;font-family:inherit;background:#fff;border-radius:16px;padding:10px;
                    box-shadow:0 8px 16px rgba(67,48,31,.14);display:flex;flex-direction:column;align-items:center;gap:6px;width:150px">
        <div style="width:110px;height:110px;border-radius:12px;overflow:hidden;background:#FFFCF6"><img src="assets/vocab/{slug(w['en'])}.png" style="width:100%;height:100%;object-fit:contain" onerror="this.style.display='none'"></div>
        <div style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:.95rem;color:#43301F">{esc(w["en"])}</div>
        <div style="font-size:.78rem;color:#0D9488;font-weight:800">{w["ar"]}</div>
      </button>'''
    return (bg_study() + header("Sound &amp; Spot", n, total) + COLORSTRIP + f'''
    <div style="position:absolute;left:0;right:0;top:158px;text-align:center;font-family:'Baloo 2',sans-serif;font-weight:700;
                font-size:1.05rem;color:#8A7160">Tap any word to hear it &mdash; can you say it before it plays?</div>
    <div style="position:absolute;left:0;right:400px;top:210px;display:flex;flex-wrap:wrap;gap:16px;justify-content:center;padding:0 30px">
      {cards}
    </div>
    ''' + char_img(ch, right=90, bottom=40, height=320))

def slide_your_turn_listen_first(w, idx, total_rounds, n, total, ch):
    return (bg_plain() + header(f"Your Turn &bull; Round {idx} of {total_rounds}", n, total) + COLORSTRIP + f'''
    <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:40px;padding-bottom:60px">
      <div class="card" id="ytCard{idx}" style="width:320px;height:320px;display:flex;align-items:center;justify-content:center;
                  background:linear-gradient(135deg,#FFF3D6,#FFE0B8);position:relative;overflow:hidden">
        <div id="ytMystery{idx}" style="font-size:4rem">&#128266;</div>
        <img id="ytImg{idx}" src="assets/vocab/{slug(w['en'])}.png" style="display:none;width:100%;height:100%;object-fit:contain" onerror="this.style.display='none'">
      </div>
      <div class="card" style="width:400px;padding:40px 36px;text-align:center">
        <div style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.7rem;color:#43301F;margin-bottom:10px">Listen first!</div>
        <div style="font-size:.95rem;color:#8A7160;font-weight:700">Play the sound, guess the word, then reveal the picture.</div>
      </div>
    </div>
    <button onclick="typeof Lumio !== 'undefined' && Lumio.speak && Lumio.speak('{esc(w["en"])}')"
            style="position:absolute;left:46px;bottom:32px;z-index:20;cursor:pointer;border:none;font-family:inherit;
            background:linear-gradient(135deg,#0D9488,#0B7A6F);color:#fff;font-weight:800;padding:13px 26px;border-radius:999px;
            font-size:1.02rem;box-shadow:0 8px 18px rgba(13,148,136,.35)">&#9654; Play sound</button>
    <button onclick="document.getElementById('ytMystery{idx}').style.display='none'; document.getElementById('ytImg{idx}').style.display='block'; this.textContent='{esc(w["en"])} \\u2014 {w["ar"]}'; this.style.background='linear-gradient(135deg,#4ADE80,#16A34A)'"
            style="position:absolute;left:230px;bottom:32px;z-index:20;cursor:pointer;border:none;font-family:inherit;
            background:linear-gradient(135deg,#F97316,#EA580C);color:#fff;font-weight:800;padding:13px 26px;border-radius:999px;
            font-size:1.02rem;box-shadow:0 8px 18px rgba(249,115,22,.35)">&#128064; Reveal picture</button>
    ''' + char_img(ch, bottom=32, height=250))

def slide_quick_check(target, distractors, idx, total_q, n, total, seed, tier="preA"):
    """Age-calibrated live practice, one tier per Junior level:
    - preA (4-5yo, pre-literacy): 2 big picture choices, no text at all,
      minimal cognitive load, pure picture recognition
    - level1 (5-6yo, beginning literacy): 3 choices, picture + word
      together, reinforces letter/word recognition
    - level2 (6-7yo, developing reader): 4 choices, word only, matches
      the standard quiz mechanic (they're ready for it by now)"""
    n_opts = {"preA": 2, "level1": 3, "level2": 4}.get(tier, 4)
    opts = (distractors[:n_opts - 1] + [target])
    random.Random(seed).shuffle(opts)

    if tier == "preA":
        # two large picture-only cards, side by side, no reading required --
        # plus a tap-to-hear button so the target word is actually
        # announced (previously nothing on this slide indicated which
        # word was being asked about beyond the teacher saying it aloud)
        positions = [(560, 300), (900, 300)]
        buttons = ""
        for o, (l, t) in zip(opts, positions):
            buttons += f'''
          <button onclick="window.checkQuizAnswer && checkQuizAnswer(this, '{esc(o["en"])}', '{esc(target["en"])}')"
                  style="position:absolute;left:{l}px;top:{t}px;width:220px;height:220px;background:#fff;border:3px solid #F0E9DD;border-radius:20px;
                      padding:10px;cursor:pointer" data-quiz-option="{esc(o["en"])}">
            <img src="assets/vocab/{slug(o['en'])}.png" style="width:100%;height:100%;object-fit:contain" onerror="this.style.display='none'">
          </button>'''
        prompt = "Which one is it?"
        listen_btn = f'''<button onclick="typeof Lumio !== 'undefined' && Lumio.speak && Lumio.speak('{esc(target["en"])}')"
                style="position:absolute;left:80px;top:280px;width:180px;height:180px;border:none;cursor:pointer;background:linear-gradient(135deg,#0D9488,#0B7A6F);
                       border-radius:24px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:#fff">
          <span style="font-size:2.4rem">&#128266;</span>
          <span style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:.9rem">Tap to hear</span>
        </button>'''
    elif tier == "level1":
        positions = [(560, 230), (790, 230), (1020, 230)]
        buttons = ""
        for o, (l, t) in zip(opts, positions):
            buttons += f'''
          <button onclick="window.checkQuizAnswer && checkQuizAnswer(this, '{esc(o["en"])}', '{esc(target["en"])}')"
                  style="position:absolute;left:{l}px;top:{t}px;width:180px;height:210px;background:#fff;border:3px solid #F0E9DD;border-radius:16px;
                      padding:8px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:6px" data-quiz-option="{esc(o["en"])}">
            <div style="width:100%;height:140px"><img src="assets/vocab/{slug(o['en'])}.png" style="width:100%;height:100%;object-fit:contain" onerror="this.style.display='none'"></div>
            <div style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1rem;color:#43301F">{esc(o["en"])}</div>
          </button>'''
        prompt = "Which word matches the picture?"
    else:
        positions = [(610, 260), (890, 260), (610, 364), (890, 364)]
        buttons = ""
        for o, (l, t) in zip(opts, positions):
            buttons += f'''
          <button onclick="window.checkQuizAnswer && checkQuizAnswer(this, '{esc(o["en"])}', '{esc(target["en"])}')"
                  style="position:absolute;left:{l}px;top:{t}px;width:260px;height:84px;background:#fff;border:2.5px solid #F0E9DD;border-radius:16px;
                      display:flex;align-items:center;justify-content:center;font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.25rem;
                      color:#43301F;cursor:pointer" data-quiz-option="{esc(o["en"])}">{esc(o["en"])}</button>'''
        prompt = "What is this?"

    img_block = listen_btn if tier == "preA" else f'''<div class="card" style="position:absolute;left:280px;top:190px;width:280px;height:280px;overflow:hidden;padding:0">
      <img src="assets/vocab/{slug(target['en'])}.png" style="width:100%;height:100%;object-fit:contain" onerror="this.style.display='none'"></div>'''
    prompt_pos = "left:80px;top:200px;width:220px;text-align:center" if tier == "preA" else "left:610px;top:190px;width:540px"
    return (bg_plain() + header(f"Quick Check &bull; {idx}", n, total) + COLORSTRIP + f'''
    {img_block}
    <div style="position:absolute;{prompt_pos};font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.9rem;color:#43301F">{prompt}</div>
    {buttons}
    ''')

# Per-word TPR (physical response) actions -- word-specific, not a
# generic template applied blindly. A generic "point to/find something
# that is X" made no sense for social phrases like "hello" or "thank
# you" (you can't point at a greeting), abstract words like "I"/"you",
# or things that usually aren't physically in the room like family
# members and animals. Covers every word across all 20 Pre-A lessons.
TPR_ACTIONS = {
    # Greetings & social phrases -- gesture + say it
    "hello": "Wave to a friend and say 'hello'!",
    "hi": "Wave your hand and say 'hi'!",
    "good morning": "Stretch your arms up high and say 'good morning'!",
    "good night": "Close your eyes and pretend to sleep, then whisper 'good night'!",
    "goodbye": "Wave goodbye with a big smile!",
    "thank you": "Put your hand on your heart and say 'thank you'!",
    "please": "Put your hands together and say 'please'!",
    "sorry": "Make a sorry face and say 'sorry'!",
    "nice to meet you": "Shake hands with a friend and say 'nice to meet you'!",
    # Pronouns / abstract social words
    "name": "Point to yourself and say your name!",
    "i": "Point to yourself and say 'I'!",
    "you": "Point to a friend and say 'you'!",
    "boy": "If you are a boy, stand up and wave!",
    "girl": "If you are a girl, stand up and wave!",
    "friend": "Point to a friend and give them a high-five!",
    # Body parts -- touch it directly
    "head": "Touch your head!",
    "eyes": "Point to your eyes and blink!",
    "nose": "Touch your nose!",
    "mouth": "Touch your mouth and smile!",
    "ears": "Touch your ears!",
    "hands": "Clap your hands!",
    "feet": "Stomp your feet!",
    # Family -- act it out, since family members usually aren't in the room
    "mom": "Pretend to give your mom a big hug!",
    "dad": "Pretend to give your dad a big hug!",
    "brother": "Pretend to play with your brother!",
    "sister": "Pretend to play with your sister!",
    "baby": "Rock your arms like you're holding a baby!",
    "grandma": "Pretend to give your grandma a gentle hug!",
    "grandpa": "Pretend to give your grandpa a gentle hug!",
    # Animals -- act out how they move or sound
    "cat": "Meow like a cat and stretch like one too!",
    "dog": "Bark like a dog and wag your 'tail'!",
    "bird": "Flap your arms like a bird flying!",
    "fish": "Wiggle like a fish swimming!",
    "rabbit": "Hop like a rabbit!",
    "duck": "Waddle and quack like a duck!",
    "goat": "Make a goat sound -- baaa!",
    "lion": "Make a big lion roar!",
    "elephant": "Swing your arm like an elephant's trunk!",
    "monkey": "Scratch your arms and jump like a monkey!",
    "giraffe": "Stretch your neck up tall like a giraffe!",
    "zebra": "Gallop in place like a zebra!",
    "camel": "Walk slowly and humpy like a camel!",
    # Actions -- direct imperative, these ARE the actions
    "run": "Run in place!",
    "jump": "Jump up and down!",
    "sit": "Sit down!",
    "stand": "Stand up tall!",
    "clap": "Clap your hands!",
    "sing": "Sing your favorite song out loud!",
    # Feelings -- make the face / show it
    "happy": "Make your happiest, biggest smile!",
    "sad": "Make a sad face, then turn it into a smile!",
    "angry": "Make an angry face -- grr!",
    "tired": "Pretend to yawn and stretch, you're so tired!",
    "hungry": "Rub your tummy like you're hungry!",
    "scared": "Make a scared face -- boo!",
    # Food -- pretend to eat/drink it
    "apple": "Pretend to take a big bite of an apple!",
    "banana": "Pretend to peel and eat a banana!",
    "bread": "Pretend to take a big bite of bread!",
    "milk": "Pretend to drink a glass of milk!",
    "water": "Pretend to drink a glass of water!",
    "egg": "Pretend to crack an egg!",
    "rice": "Pretend to eat a spoonful of rice!",
    "chicken": "Pretend to eat a piece of chicken!",
    "cheese": "Pretend to take a bite of cheese!",
    "juice": "Pretend to drink a cup of juice!",
    "cake": "Pretend to eat a slice of cake!",
    "ice cream": "Pretend to lick an ice cream cone!",
    # Numbers -- show with fingers
    "one": "Show me 1 finger!",
    "two": "Show me 2 fingers!",
    "three": "Show me 3 fingers!",
    "four": "Show me 4 fingers!",
    "five": "Show me 5 fingers!",
    "six": "Show me 6 fingers! (use both hands!)",
    "seven": "Show me 7 fingers!",
    "eight": "Show me 8 fingers!",
    "nine": "Show me 9 fingers!",
    "ten": "Show me all 10 fingers!",
    # Colors -- find something that color
    "red": "Find something red in the room and point to it!",
    "blue": "Find something blue in the room and point to it!",
    "yellow": "Find something yellow in the room and point to it!",
    "green": "Find something green in the room and point to it!",
    "orange": "Find something orange in the room and point to it!",
    "purple": "Find something purple in the room and point to it!",
    "pink": "Find something pink in the room and point to it!",
    "brown": "Find something brown in the room and point to it!",
    "black": "Find something black in the room and point to it!",
    "white": "Find something white in the room and point to it!",
    # Concrete objects -- point to it or a picture of it
    "ball": "Pretend to bounce or throw a ball!",
    "box": "Find a box in the room and point to it!",
    "car": "Pretend to drive a car -- vroom!",
    "doll": "Pretend to hug a doll!",
    "robot": "Walk like a robot!",
    "blocks": "Pretend to stack blocks up high!",
    "teddy bear": "Pretend to hug a teddy bear!",
    "school": "Point to your backpack or something from school!",
    "book": "Pretend to open a book and read!",
    "pen": "Pretend to write with a pen!",
    "pencil": "Pretend to write with a pencil!",
    "bag": "Point to a bag or backpack!",
    "teacher": "Point to your teacher and wave!",
    "kite": "Pretend to fly a kite!",
    "moon": "Look up and point at the sky, pretend you see the moon!",
    "queen": "Stand tall and act like a queen with a crown!",
    "sun": "Reach up high and pretend to touch the sun!",
    "tree": "Stretch your arms out like tree branches!",
    "umbrella": "Pretend to hold an umbrella in the rain!",
    "van": "Pretend to drive a van -- vroom!",
    "hat": "Pretend to put on a hat!",
}

def tpr_action_for(word):
    """Returns a word-appropriate action, falling back to a safe
    generic 'find it' prompt only for words not in the dictionary
    above (shouldn't happen for any current Pre-A lesson, but keeps
    this robust if new vocab is added later)."""
    return TPR_ACTIONS.get(word.lower(), f"Find something that reminds you of '{word}' and show the class!")

def slide_tpr_activity(instruction, n, total, ch):
    """Total Physical Response activity -- teacher-led, no reading or
    clicking required. Appropriate for pre-literacy Pre-A students who
    can't yet do text-based practice; builds the same vocabulary
    through movement and pointing instead."""
    return (bg_study() + header("Let's Move!", n, total) + COLORSTRIP + f'''
    <div style="position:absolute;left:0;right:0;top:220px;text-align:center">
      <div style="font-size:2.4rem;margin-bottom:20px">&#129323;</div>
      <div style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:2rem;color:#43301F;padding:0 100px">{instruction}</div>
    </div>
    ''' + char_img(ch, bottom=42, height=280))

def slide_quiz(target, distractors, idx, total_q, n, total, seed):
    opts = distractors + [target]
    random.Random(seed).shuffle(opts)
    positions = [(610, 260), (890, 260), (610, 364), (890, 364)]
    buttons = ""
    for o, (l, t) in zip(opts, positions):
        buttons += f'''
      <button onclick="window.checkQuizAnswer && checkQuizAnswer(this, '{esc(o["en"])}', '{esc(target["en"])}')"
              style="position:absolute;left:{l}px;top:{t}px;width:260px;height:84px;background:#fff;border:2.5px solid #F0E9DD;border-radius:16px;
                  display:flex;align-items:center;justify-content:center;font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.25rem;
                  color:#43301F;cursor:pointer" data-quiz-option="{esc(o["en"])}">{esc(o["en"])}</button>'''
    return (bg_plain() + header(f"Quiz &bull; {idx}/{total_q}", n, total) + COLORSTRIP + f'''
    <div class="card" style="position:absolute;left:280px;top:190px;width:280px;height:280px;overflow:hidden;padding:0"><img src="assets/vocab/{slug(target['en'])}.png" style="width:100%;height:100%;object-fit:contain" onerror="this.style.display='none'"></div>
    <div style="position:absolute;left:610px;top:190px;width:540px;font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.9rem;color:#43301F">What is this?</div>
    {buttons}
    ''')

def slide_phonics_rule(unit, n, total, ch):
    sounds = unit.get("sounds", [])
    if sounds:
        tiles = ""
        for s in sounds:
            speak_token = s["letter"].split(",")[0].split("-")[0].strip()
            tiles += f'''
          <button onclick="typeof Lumio !== 'undefined' && Lumio.speakPhonicsSound && Lumio.speakPhonicsSound('{esc(speak_token)}')"
                  style="border:none;cursor:pointer;font-family:inherit;background:#fff;border-radius:14px;padding:14px 18px;min-width:100px;
                        text-align:center;box-shadow:0 8px 16px rgba(67,48,31,.14)">
            <div style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.6rem;color:#F97316">{esc(s["letter"])}</div>
            <div style="font-size:.8rem;color:#8A7160;margin-top:2px">{esc(s["sound"])}</div>
          </button>'''
        tiles_block = f'<div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-bottom:18px">{tiles}</div>'
    else:
        tiles_block = ""
    tip = unit.get("tip", "")
    return (bg_study() + header("Phonics Time! &#128218;", n, total) + COLORSTRIP + f'''
    <div class="card" style="position:absolute;left:46px;top:150px;width:820px;padding:30px 36px">
      <div style="font-size:.78rem;font-weight:800;color:#0D9488;letter-spacing:1.5px;margin-bottom:8px">TEACHER: EXPLAIN THIS RULE</div>
      <div style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.5rem;color:#43301F;margin-bottom:4px">{esc(unit["unit"])}</div>
      <div style="direction:rtl;text-align:right;font-size:.9rem;color:#8A7160;font-weight:700;margin-bottom:18px">{unit["unitAr"]}</div>
      {tiles_block}
      {f'<div style="background:#FFF3D6;border-radius:12px;padding:12px 16px;direction:rtl;text-align:right;font-size:.85rem;color:#43301F;line-height:1.6">{tip}</div>' if tip else ""}
    </div>
    ''' + char_img(ch, bottom=42, height=310))

def slide_phonics_practice(unit, n, total, ch):
    words = unit.get("words", [])
    cards = ""
    for w in words[:6]:
        cards += f'''
      <button onclick="typeof Lumio !== 'undefined' && Lumio.speak && Lumio.speak('{esc(w["en"])}')"
              style="border:none;cursor:pointer;font-family:inherit;background:#fff;border-radius:16px;padding:14px 10px;
                    box-shadow:0 8px 16px rgba(67,48,31,.14);display:flex;flex-direction:column;align-items:center;gap:8px;width:160px">
        {letter_tiles(w["en"]) or f'<div style="font-family:\'Baloo 2\',sans-serif;font-weight:800;font-size:1.4rem;color:#43301F">{esc(w["en"])}</div>'}
        <div style="font-size:.85rem;color:#0D9488;font-weight:800">{w["ar"]}</div>
      </button>'''
    return (bg_plain() + header("Listen &amp; Spot", n, total) + COLORSTRIP + f'''
    <div style="position:absolute;left:0;right:0;top:158px;text-align:center;font-family:'Baloo 2',sans-serif;font-weight:700;
                font-size:1.05rem;color:#8A7160">Tap each word, sound it out, then say it together!</div>
    <div style="position:absolute;left:0;right:380px;top:220px;display:flex;flex-wrap:wrap;gap:18px;justify-content:center;padding:0 30px">
      {cards}
    </div>
    ''' + char_img(ch, right=90, bottom=40, height=320))


def slide_sound_match(target_word, distractor_words, idx, total_q, n, total, seed):
    """Graded phonics practice -- tap the word that matches the sound
    played, using the phonics unit's own word list. Distinct from
    slide_phonics_practice (which is presentational/tap-to-hear, not
    graded) -- this is a real check with right/wrong feedback."""
    opts = distractor_words + [target_word]
    random.Random(seed).shuffle(opts)
    positions = [(560, 260), (860, 260), (560, 380), (860, 380)][:len(opts)]
    buttons = ""
    for o, (l, t) in zip(opts, positions):
        buttons += f'''
      <button onclick="window.checkQuizAnswer && checkQuizAnswer(this, '{esc(o["en"])}', '{esc(target_word["en"])}')"
              style="position:absolute;left:{l}px;top:{t}px;width:230px;height:96px;background:#fff;border:2.5px solid #F0E9DD;border-radius:16px;
                  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;cursor:pointer" data-quiz-option="{esc(o["en"])}">
        {letter_tiles(o["en"]) or f'<div style="font-family:\'Baloo 2\',sans-serif;font-weight:800;font-size:1.15rem;color:#43301F">{esc(o["en"])}</div>'}
      </button>'''
    return (bg_plain() + header(f"Sound Match &bull; {idx}/{total_q}", n, total) + COLORSTRIP + f'''
    <button onclick="typeof Lumio !== 'undefined' && Lumio.speak && Lumio.speak('{esc(target_word["en"])}')"
            style="position:absolute;left:80px;top:280px;width:180px;height:180px;border:none;cursor:pointer;background:linear-gradient(135deg,#0D9488,#0B7A6F);
                   border-radius:24px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:#fff">
      <span style="font-size:2.2rem">&#128266;</span>
      <span style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:.85rem">Tap to hear</span>
    </button>
    <div style="position:absolute;left:80px;top:200px;width:220px;font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.2rem;color:#43301F">Which word is this?</div>
    {buttons}
    ''')


def slide_teacher_game(vocab, n, total, ch, tier="preA", mode="teacher"):
    """A real teacher-led game, not another graded exercise -- shows
    every word from the lesson as a tappable tile in one board.
    Two modes instead of a repeated round: 'teacher' has the teacher
    call out words for students to race to; 'student' flips it --
    a student calls out words for classmates, building turn-taking
    and peer confidence instead of just repeating the same format."""
    cols = 3 if len(vocab) <= 6 else 4
    tile_w = 220 if tier == "preA" else 190
    tile_h = 190 if tier == "preA" else 160
    tiles = ""
    for i, w in enumerate(vocab):
        row, col = divmod(i, cols)
        left = 130 + col * (tile_w + 24)
        top = 210 + row * (tile_h + 20)
        show_word = tier != "preA"
        tiles += f'''
      <button onclick="this.style.transform='scale(0.92)'; this.style.borderColor='#0D9488'; setTimeout(() => {{ this.style.transform='scale(1)'; }}, 180); typeof Lumio !== 'undefined' && Lumio.speak && Lumio.speak('{esc(w["en"])}')"
              style="position:absolute;left:{left}px;top:{top}px;width:{tile_w}px;height:{tile_h}px;background:#fff;border:3px solid #F0E9DD;border-radius:18px;
                  padding:8px;cursor:pointer;transition:transform .15s ease, border-color .15s ease;display:flex;flex-direction:column;align-items:center;gap:4px">
        <div style="width:100%;flex:1;overflow:hidden"><img src="assets/vocab/{slug(w['en'])}.png" style="width:100%;height:100%;object-fit:contain" onerror="this.style.display='none'"></div>
        {f'<div style="font-family:\'Baloo 2\',sans-serif;font-weight:800;font-size:.85rem;color:#43301F">{esc(w["en"])}</div>' if show_word else ""}
      </button>'''
    title = {"teacher": "Teacher & Student Game", "student": "Your Turn to Call It!", "partner": "Partner Challenge", "group": "Everyone Together!"}.get(mode, "Teacher & Student Game")
    instruction = {
        "teacher": "Teacher says a word out loud &mdash; first student to tap it wins!",
        "student": "Pick a student to call out a word for the class &mdash; everyone else races to tap it!",
        "partner": "Pair up! Take turns calling out words for your partner to find.",
        "group": "Everyone stands up! Teacher calls a word and the whole class points to it together!",
    }.get(mode, "Teacher says a word out loud &mdash; first student to tap it wins!")
    return (bg_study() + header(title, n, total) + COLORSTRIP + f'''
    <div style="position:absolute;left:0;right:0;top:150px;text-align:center;font-family:'Baloo 2',sans-serif;font-weight:700;
                font-size:1.05rem;color:#8A7160">{instruction}</div>
    {tiles}
    ''' + char_img(ch, right=40, bottom=30, height=150))


def slide_today_i_learned(lesson, n, total):
    chips = "".join(f'''
      <div style="background:#fff;border-radius:14px;padding:10px 8px;display:flex;flex-direction:column;align-items:center;gap:6px;
                  box-shadow:0 6px 14px rgba(67,48,31,.1);width:110px">
        <div style="width:70px;height:70px;border-radius:10px;overflow:hidden;background:#FFFCF6"><img src="assets/vocab/{slug(w['en'])}.png" style="width:100%;height:100%;object-fit:contain" onerror="this.style.display='none'"></div>
        <div style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:.8rem;color:#43301F;text-align:center">{esc(w["en"])}</div>
      </div>''' for w in lesson["vocab"][:6])
    return (bg_clean() + header("Today I Learned! &#127775;", n, total) + COLORSTRIP + f'''
    <div style="position:absolute;left:46px;top:150px;width:820px">
      <div style="font-size:.78rem;font-weight:800;color:#F97316;letter-spacing:1.5px;margin-bottom:10px">KEY WORDS</div>
      <div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:20px">{chips}</div>
      <div style="font-size:.78rem;font-weight:800;color:#0D9488;letter-spacing:1.5px;margin-bottom:8px">SENTENCE PATTERN</div>
      <div class="card" style="padding:16px 20px">
        <div style="font-family:'Baloo 2',sans-serif;font-weight:700;font-size:1.05rem;color:#43301F">{esc(lesson.get("grammarFocus",""))}</div>
        <div style="font-family:'Baloo 2',sans-serif;font-style:italic;font-weight:700;font-size:1.1rem;color:#F97316;margin-top:6px">&ldquo;{esc(lesson["vocab"][0].get("example", ""))}&rdquo;</div>
      </div>
    </div>
    ''' + char_img("noor-happy", bottom=42, height=310))


def slide_unscramble(word, n, total, ch):
    import random as _r
    letters = list(word["en"].replace(" ", ""))
    order = list(range(len(letters)))
    _r.Random(sum(ord(c) for c in word["en"])).shuffle(order)
    tiles = "".join(f'''<div style="width:52px;height:52px;border-radius:12px;display:flex;align-items:center;justify-content:center;
                  font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.35rem;color:#fff;background:{LETTER_COLORS[i % len(LETTER_COLORS)]};
                  box-shadow:0 3px 0 rgba(0,0,0,.14), 0 6px 12px rgba(67,48,31,.16)">{letters[order[i]].upper()}</div>''' for i in range(len(order)))
    return (bg_plain() + header("Warm-Up &bull; Unscramble!", n, total) + COLORSTRIP + f'''
    <div style="position:absolute;left:0;right:0;top:190px;text-align:center;font-family:'Baloo 2',sans-serif;font-weight:700;
                font-size:1.1rem;color:#43301F">Can you guess the word before it's revealed?</div>
    <div style="position:absolute;left:0;right:0;top:250px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;padding:0 60px">
      {tiles}
    </div>
    <div id="unscrambleAnswer" style="position:absolute;left:0;right:0;top:360px;text-align:center;display:none">
      <div class="card" style="display:inline-block;padding:16px 32px">
        <div style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.8rem;color:#43301F">{esc(word["en"])}</div>
        <div style="color:#0D9488;font-weight:800;font-size:1.1rem;margin-top:4px">{word["ar"]}</div>
      </div>
    </div>
    <button onclick="document.getElementById('unscrambleAnswer').style.display='block'; typeof Lumio !== 'undefined' && Lumio.speak && Lumio.speak('{esc(word["en"]).replace(chr(39), chr(92)+chr(39))}')"
            style="position:absolute;left:46px;bottom:32px;z-index:20;cursor:pointer;border:none;font-family:inherit;
            background:linear-gradient(135deg,#F97316,#EA580C);color:#fff;font-weight:800;padding:13px 26px;border-radius:999px;
            font-size:1.02rem;box-shadow:0 8px 18px rgba(249,115,22,.35)">&#128064; Reveal the word</button>
    ''' + char_img(ch, bottom=32, height=270))


def slide_reward_homework(lesson_num, n, total):
    items = [f"Play this lesson again on Lumio English", "Finish your homework sheet", "Say each word to your family"]
    rows = "".join(f'''
      <div style="display:flex;align-items:center;gap:12px;padding:8px 0">
        <span style="width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,#DDF6F0,#C8F0E7);color:#0D9488;
                     font-weight:800;display:flex;align-items:center;justify-content:center;font-size:.85rem;flex-shrink:0">{i+1}</span>
        <span style="font-family:'Baloo 2',sans-serif;font-weight:700;font-size:1.05rem;color:#43301F">{it}</span>
      </div>''' for i, it in enumerate(items))
    return (bg_bare() + header("Great Job! &bull; Homework", n, total) + COLORSTRIP + f'''
    <div style="position:absolute;left:46px;top:150px;width:520px">
      <div style="font-size:2.6rem;margin-bottom:6px">&#127881;</div>
      <div style="font-size:1.7rem;letter-spacing:5px;margin-bottom:14px">&#11088;&#11088;&#11088;&#11088;&#11088;</div>
      <div style="background:#fff;display:inline-block;padding:9px 22px;border-radius:999px;box-shadow:0 8px 18px rgba(67,48,31,.14);
                  font-family:'Baloo 2',sans-serif;font-weight:800;color:#0D9488;font-size:1rem">You earned 5 stars!</div>
    </div>
    <div class="card" style="position:absolute;left:610px;top:150px;width:400px;padding:26px 30px">
      <div style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.15rem;color:#43301F;margin-bottom:10px">Before next time&hellip;</div>
      {rows}
    </div>
    <div style="position:absolute;right:70px;bottom:30px;display:flex">
      <div class="floorshadow" style="right:140px;bottom:-7px;width:230px;height:36px"></div>
      <img class="char" src="{CHAR}/lumi-wave-book.png" style="right:140px;bottom:0px;height:250px">
      <div class="floorshadow" style="right:10px;bottom:-7px;width:230px;height:36px"></div>
      <img class="char" src="{CHAR}/omar-wave.png" style="right:10px;bottom:0px;height:250px">
    </div>''')


def build_deck(lesson_num, lesson, prev_lesson, phonics_unit=None, grammar_topic=None, has_phonics=True, level="pre-a"):
    V = len(lesson["vocab"])
    tier = "preA" if level == "pre-a" else ("level1" if level == "level1" else "level2")
    plan = [("title", None), ("lets_learn", None), ("unscramble", lesson["vocab"][0])]
    if prev_lesson:
        plan.append(("recap", None))
    if phonics_unit:
        plan.append(("phonics_rule", phonics_unit))
        plan.append(("phonics_practice", phonics_unit))
        n_sound_match = min(4, len(phonics_unit.get("words", [])))
        for i in range(n_sound_match):
            plan.append(("sound_match", i))
    if tier == "preA":
        for w in lesson["vocab"]:
            plan.append(("tpr", tpr_action_for(w["en"])))
    for i, w in enumerate(lesson["vocab"]):
        plan.append(("vocab", (w, i)))
        plan.append(("practice_phonics", (w, i)))
    if grammar_topic:
        plan.append(("grammar_rule", grammar_topic))
        plan.append(("grammar_practice", grammar_topic))
    plan.append(("dialogue", None))
    plan.append(("sentence", None))
    plan.append(("sound_spot", None))
    your_turn_n = min(4, V) if V <= 4 else min(3, V)
    for i in range(your_turn_n):
        plan.append(("your_turn", (lesson["vocab"][i], i + 1)))
    # Quick Check: live, age-calibrated in-class practice -- one round per
    # vocab word, once through (no repeat round -- that repetition is now
    # a real teacher-led game instead, more engaging than seeing the same
    # question format twice)
    for i in range(V):
        plan.append(("quick_check", (i, 0)))
    plan.append(("teacher_game", "teacher"))
    plan.append(("teacher_game", "student"))
    plan.append(("teacher_game", "partner"))
    if V <= 4:
        plan.append(("teacher_game", "group"))
    plan.append(("quiz", 1))
    plan.append(("quiz", 2))
    plan.append(("today_i_learned", None))
    plan.append(("reward_homework", None))

    total = len(plan)
    slides = []
    for pos, (kind, data) in enumerate(plan):
        n = pos + 1
        if kind == "title": slides.append(slide_title(lesson, V))
        elif kind == "lets_learn": slides.append(slide_lets_learn(lesson, n, total, V))
        elif kind == "unscramble": slides.append(slide_unscramble(data, n, total, "lumi-wave-book"))
        elif kind == "recap": slides.append(slide_recap(prev_lesson["vocab"], n, total))
        elif kind == "tpr": slides.append(slide_tpr_activity(data, n, total, "omar-wave"))
        elif kind == "quick_check":
            i, r = data
            target = lesson["vocab"][i]
            seed = lesson_num * 11 + i + n
            others = [x for x in lesson["vocab"] if x["en"] != target["en"]]
            distractors = random.Random(seed).sample(others, min(3, len(others)))
            label = f"{i + 1}/{V}"
            slides.append(slide_quick_check(target, distractors, label, V, n, total, seed, tier=tier))
        elif kind == "teacher_game":
            slides.append(slide_teacher_game(lesson["vocab"], n, total, "omar-wave", tier=tier, mode=data))
        elif kind == "phonics_rule": slides.append(slide_phonics_rule(data, n, total, "sara-explain"))
        elif kind == "phonics_practice": slides.append(slide_phonics_practice(data, n, total, "sara-clap"))
        elif kind == "sound_match":
            i = data
            words = phonics_unit.get("words", []) if phonics_unit else []
            target_word = words[i % len(words)]
            others = [w for w in words if w["en"] != target_word["en"]]
            seed = lesson_num * 13 + i + n
            distractor_words = random.Random(seed).sample(others, min(3, len(others)))
            total_q = min(4, len(words)) or 1
            slides.append(slide_sound_match(target_word, distractor_words, i + 1, total_q, n, total, seed))
        elif kind == "grammar_rule":
            slides.append(grammar_slides.slide_grammar_rule(data, n, total, "sara-explain", header, COLORSTRIP, bg_study, char_img))
        elif kind == "grammar_practice":
            slides.append(grammar_slides.slide_grammar_practice(data, n, total, "sara-clap", header, COLORSTRIP, bg_plain, char_img))
        elif kind == "vocab":
            w, i = data
            slides.append(slide_vocab(w, i, n, total, V, VOCAB_CHARS[i % len(VOCAB_CHARS)]))
        elif kind == "practice_phonics":
            w, i = data
            slides.append(slide_practice_phonics(w, n, total, VOCAB_CHARS[i % len(VOCAB_CHARS)], has_phonics, seed=i))
        elif kind == "dialogue":
            slides.append(slide_dialogue(DIALOGUES[lesson_num], n, total))
        elif kind == "sentence":
            slides.append(slide_sentence_builder(lesson["vocab"][0]["example"], n, total, "sara-teach-board", lesson_num))
        elif kind == "sound_spot":
            slides.append(slide_sound_spot(lesson["vocab"], n, total, "sara-clap"))
        elif kind == "your_turn":
            w, idx = data
            slides.append(slide_your_turn_listen_first(w, idx, your_turn_n, n, total, "omar-wave"))
        elif kind == "today_i_learned":
            slides.append(slide_today_i_learned(lesson, n, total))
        elif kind == "quiz":
            idx = data
            target = lesson["vocab"][1 if idx == 1 else min(3, V - 1)]
            distractors = [x for x in lesson["vocab"] if x["en"] != target["en"]][:3]
            slides.append(slide_quiz(target, distractors, idx, 2, n, total, lesson_num * 7 + idx))
        elif kind == "reward_homework": slides.append(slide_reward_homework(lesson_num, n, total))
    return slides


def run(level, dialogues, phonics_units=None, grammar_units=None, has_phonics=True, out_root="slide-content", manifest_root="assets/slides"):
    global DIALOGUES
    DIALOGUES = dialogues
    phonics_units = phonics_units or {}  # {lesson_num: unit_dict}
    grammar_units = grammar_units or {}  # {lesson_num: topic_dict}
    lesson_files = sorted(glob.glob(f"lessons/{level}/lesson*.json"))
    lessons = {}
    for f in lesson_files:
        d = json.load(open(f, encoding="utf-8"))
        lessons[d["number"]] = d

    out_dir = f"{out_root}/{level}"
    manifest_path = f"{manifest_root}/{level}/manifest.json"
    os.makedirs(out_dir, exist_ok=True)
    os.makedirs(f"{manifest_root}/{level}", exist_ok=True)

    manifest = {}
    for num in sorted(lessons):
        lesson = lessons[num]
        prev_lesson = lessons.get(num - 1)
        slides = build_deck(num, lesson, prev_lesson, phonics_units.get(num), grammar_units.get(num), has_phonics, level)
        nn = f"{num:02d}"
        lesson_dir = os.path.join(out_dir, nn)
        os.makedirs(lesson_dir, exist_ok=True)
        # clear old slide files so stale higher-numbered slides don't linger
        for old in glob.glob(os.path.join(lesson_dir, "slide-*.html")):
            os.remove(old)
        for i, html in enumerate(slides, start=1):
            with open(os.path.join(lesson_dir, f"slide-{i:02d}.html"), "w", encoding="utf-8") as f:
                f.write(html)
        manifest[nn] = len(slides)
        tags = []
        if num in phonics_units: tags.append("phonics")
        if num in grammar_units: tags.append("grammar")
        print(f"{level} lesson {nn}: {len(slides)} slides" + (f" [+ {', '.join(tags)}]" if tags else ""))

    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=0)
    print("Manifest written:", manifest_path)
