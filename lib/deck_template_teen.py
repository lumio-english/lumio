# -*- coding: utf-8 -*-
"""
Teen Track deck template — Level 3+. Same slide *types* as
deck_template_v2 (Junior), completely different skin:
- Fredoka headings instead of Baloo 2 (no bubble font)
- Dark charcoal/indigo page background, sharp-cornered light cards
  (10-12px radius) instead of pastel-washed bubble cards
- No sparkle decorations, no rainbow colorstrip -- a slim single-
  color progress line instead
- XP/streak gamification copy instead of stars ("+80 XP" not
  "Amazing! Three stars!")
- Characters shrunk to a small corner "guide" badge, not a large
  illustrated mascot figure
- Direct, confident tone -- cut exclamation-mark density
No phonics slide type (Phonics stays Junior-only, Level 1-2).
"""
import json, os, re, glob, random
import grammar_slides

CHAR = "assets/story/characters"

INK = "#EDE9FB"
INK_DIM = "#A79BD1"
BG_DARK = "#2B1B52"
BG_DARKER = "#1C1038"
CARD_BG = "#FFFFFF"
CARD_TEXT = "#2B2640"
PURPLE = "#8B5CF6"
PURPLE_DEEP = "#7C3AED"
ORANGE = "#F97316"
ORANGE_DEEP = "#EA580C"
TEAL = "#14B8A6"
TEAL_DEEP = "#0D9488"
BORDER = "#4A3B7A"

def esc(s):
    return (s or "").replace("&", "&amp;").replace('"', "&quot;")
def slug(w):
    return w.lower().replace("'", "").replace(" ", "-")

def bg_base():
    return f'''<div style="position:absolute;inset:0;background:linear-gradient(160deg,{BG_DARK} 0%,{BG_DARKER} 100%)"></div>
    <div style="position:absolute;left:-120px;top:-120px;width:380px;height:380px;border-radius:50%;
                background:radial-gradient(circle,rgba(139,92,246,.22),transparent 70%)"></div>
    <div style="position:absolute;right:-100px;bottom:-100px;width:320px;height:320px;border-radius:50%;
                background:radial-gradient(circle,rgba(20,184,166,.14),transparent 70%)"></div>'''

def header(pagetitle, n, total):
    pct = round(n / total * 100)
    return f'''<div style="position:relative;z-index:5;display:flex;align-items:center;justify-content:space-between;padding:22px 40px 0">
      <div style="display:flex;align-items:center;gap:10px">
        <div style="width:30px;height:30px;border-radius:8px;background:linear-gradient(135deg,{PURPLE},{PURPLE_DEEP});
                    display:flex;align-items:center;justify-content:center;font-weight:800;font-family:'Fredoka',sans-serif;color:#fff;font-size:.85rem">L</div>
        <div style="font-family:'Fredoka',sans-serif;font-weight:600;color:{INK};font-size:.85rem;letter-spacing:.5px">LUMIO ENGLISH</div>
      </div>
      <div style="font-family:'Fredoka',sans-serif;font-weight:600;color:{CARD_TEXT if False else INK};font-size:.95rem;background:rgba(139,92,246,.14);
                  padding:6px 16px;border-radius:8px">{esc(pagetitle)}</div>
      <div style="font-family:'Nunito',sans-serif;font-weight:800;color:{INK_DIM};font-size:.8rem">{n} / {total}</div>
    </div>
    <div style="position:relative;z-index:5;margin:14px 40px 0;height:3px;background:{BORDER};border-radius:2px">
      <div style="height:100%;width:{pct}%;background:linear-gradient(90deg,{PURPLE},{ORANGE});border-radius:2px"></div>
    </div>'''

def card_open(width=None, extra=""):
    w = f"width:{width}px;" if width else ""
    return f'<div style="background:{CARD_BG};border-radius:12px;border:1px solid rgba(0,0,0,.06);box-shadow:0 12px 26px rgba(0,0,0,.28);{w}{extra}">'

def char_badge(name, right=40, bottom=26):
    return f'''<div style="position:absolute;right:{right}px;bottom:{bottom}px;z-index:6;display:flex;align-items:center;gap:8px;
                background:rgba(255,255,255,.06);border-radius:999px;padding:5px 14px 5px 5px">
      <img src="{CHAR}/{name}.png" style="height:38px;border-radius:50%;background:#fff">
      <span style="font-family:'Fredoka',sans-serif;color:{INK_DIM};font-size:.72rem;font-weight:600">guide</span>
    </div>'''

def xp_pill(xp, extra_style=""):
    return f'''<span style="display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg,{ORANGE},{ORANGE_DEEP});
                color:#fff;font-family:'Fredoka',sans-serif;font-weight:600;font-size:.85rem;padding:6px 16px;border-radius:999px;{extra_style}">
      &#9889; +{xp} XP</span>'''

VOCAB_CHARS = ["omar-wave", "noor-happy", "sara-clap", "omar-point", "noor-wave"]

# ============================================================
def slide_title(lesson, num_words):
    subtitle = " &middot; ".join(esc(v["en"]) for v in lesson["vocab"])
    return f'''{bg_base()}
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;z-index:5">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:18px">
        <div style="width:44px;height:44px;border-radius:10px;background:linear-gradient(135deg,{PURPLE},{PURPLE_DEEP});
                    display:flex;align-items:center;justify-content:center;font-weight:800;font-family:'Fredoka',sans-serif;color:#fff;font-size:1.3rem">L</div>
        <div style="font-family:'Fredoka',sans-serif;font-weight:600;color:{INK};font-size:1.1rem;letter-spacing:1px">LUMIO ENGLISH</div>
      </div>
      <h1 style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:3.1rem;color:#fff;margin:0 0 14px">{esc(lesson["title"])}</h1>
      <div style="font-family:'Nunito',sans-serif;font-weight:700;color:{INK_DIM};font-size:1.05rem;margin-bottom:22px">{subtitle}</div>
      {xp_pill(num_words * 10)}
    </div>'''

def slide_goal(lesson, n, total, num_words):
    return (bg_base() + header("Today's Goal", n, total) + f'''
    <div style="position:relative;z-index:5;display:flex;gap:20px;padding:60px 40px 0">
      {card_open(560, "padding:30px 34px")}
        <div style="font-family:'Fredoka',sans-serif;font-weight:600;color:{ORANGE_DEEP};font-size:.78rem;letter-spacing:1.5px;margin-bottom:10px">GOAL</div>
        <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:1.3rem;color:{CARD_TEXT};line-height:1.4">{esc(lesson.get("goal",""))}</div>
        <div style="margin-top:16px;display:inline-block;background:#F1F5F9;color:{CARD_TEXT};font-weight:700;font-size:.82rem;padding:6px 14px;border-radius:8px">
          {num_words} words &middot; {esc(lesson.get("grammarFocus",""))}</div>
      </div>
      {card_open(300, "padding:30px 34px")}
        <div style="font-family:'Fredoka',sans-serif;font-weight:600;color:{TEAL_DEEP};font-size:.78rem;letter-spacing:1.5px;margin-bottom:10px">WARM-UP</div>
        <div style="font-family:'Nunito',sans-serif;font-weight:700;font-size:1rem;color:{CARD_TEXT};line-height:1.5">Quick stretch, then let's get into it.</div>
      </div>
    </div>
    ''')

def slide_unscramble(word, n, total, ch):
    letters = list(word["en"].replace(" ", ""))
    order = list(range(len(letters)))
    random.Random(sum(ord(c) for c in word["en"])).shuffle(order)
    colors = [ORANGE, TEAL, ORANGE_DEEP, TEAL_DEEP]
    tiles = "".join(f'''<div style="width:50px;height:50px;border-radius:10px;display:flex;align-items:center;justify-content:center;
                  font-family:'Fredoka',sans-serif;font-weight:600;font-size:1.3rem;color:#fff;background:{colors[i % len(colors)]}">{letters[order[i]].upper()}</div>'''
                 for i in range(len(order)))
    return (bg_base() + header("Warm-Up &middot; Unscramble", n, total) + f'''
    <div style="position:relative;z-index:5;text-align:center;margin-top:50px;font-family:'Nunito',sans-serif;font-weight:700;color:{INK_DIM}">
      Guess the word before you reveal it.</div>
    <div style="position:relative;z-index:5;display:flex;gap:10px;justify-content:center;margin-top:26px">{tiles}</div>
    <div id="unscrambleAnswer" style="position:relative;z-index:5;text-align:center;margin-top:28px;display:none">
      {card_open(None, "display:inline-block;padding:14px 30px")}
        <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:1.6rem;color:{CARD_TEXT}">{esc(word["en"])}</div>
        <div style="color:{TEAL_DEEP};font-weight:800;font-size:1rem;margin-top:2px">{word["ar"]}</div>
      </div>
    </div>
    <button onclick="document.getElementById('unscrambleAnswer').style.display='block'; typeof Lumio !== 'undefined' && Lumio.speak && Lumio.speak('{esc(word["en"]).replace(chr(39), chr(92)+chr(39))}')"
            style="position:absolute;left:40px;bottom:30px;z-index:20;cursor:pointer;border:none;font-family:'Fredoka',sans-serif;
            background:linear-gradient(135deg,{ORANGE},{ORANGE_DEEP});color:#fff;font-weight:600;padding:12px 24px;border-radius:10px;font-size:.9rem">Reveal</button>
    ''' + char_badge(ch))

def slide_recap(prev_words, n, total):
    cards = "".join(f'''
      <button onclick="this.querySelector('.q').style.display='none'; this.querySelector('.a').style.display='flex';
                       typeof Lumio !== 'undefined' && Lumio.speak && Lumio.speak('{esc(w["en"])}')"
              style="border:none;cursor:pointer;font-family:inherit;background:{CARD_BG};border-radius:12px;padding:16px;width:190px;height:210px;
                    display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 10px 22px rgba(0,0,0,.25)">
        <div class="q" style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <div style="font-family:'Fredoka',sans-serif;font-weight:600;color:{INK_DIM};font-size:.75rem;letter-spacing:1px">TAP TO CHECK</div>
          <div style="font-size:1.4rem">?</div>
        </div>
        <div class="a" style="display:none;flex-direction:column;align-items:center;gap:4px">
          <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:1.1rem;color:{CARD_TEXT}">{esc(w["en"])}</div>
          <div style="color:{TEAL_DEEP};font-weight:800;font-size:.95rem">{w["ar"]}</div>
        </div>
      </button>''' for w in prev_words[:3])
    return (bg_base() + header("Quick Recap", n, total) + f'''
    <div style="position:relative;z-index:5;display:flex;gap:20px;justify-content:center;margin-top:50px">{cards}</div>
    <div style="position:relative;z-index:5;text-align:center;margin-top:24px;font-family:'Nunito',sans-serif;font-weight:700;color:{INK_DIM};font-size:.9rem">From last lesson</div>
    ''')

def slide_vocab(w, idx, n, total, num_words, ch):
    quote = w.get("example", w["en"])
    return (bg_base() + header(f"Vocabulary &middot; {esc(w['en'])}", n, total) + f'''
    <div style="position:relative;z-index:5;display:flex;gap:22px;padding:44px 40px 0">
      {card_open(410, "padding:20px;text-align:center")}
        <div style="width:100%;aspect-ratio:1/1;border-radius:10px;overflow:hidden;background:#F8FAFC">
          <img src="assets/vocab/{slug(w['en'])}.png" style="width:100%;height:100%;object-fit:contain" onerror="this.parentElement.style.background='#F1F5F9'; this.remove()">
        </div>
      </div>
      {card_open(560, "padding:32px 36px")}
        <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:2.4rem;color:{CARD_TEXT}">{esc(w["en"])}</div>
        <div style="display:inline-block;margin-top:10px;padding:6px 18px;background:#E6FBF8;color:{TEAL_DEEP};border-radius:8px;font-weight:800;font-size:1rem">{w["ar"]}</div>
        <div style="border-top:1px solid #EEF0F4;margin:20px 0 16px"></div>
        <div style="font-family:'Fredoka',sans-serif;font-weight:600;color:{ORANGE_DEEP};font-size:.75rem;letter-spacing:1.5px;margin-bottom:8px">EXAMPLE</div>
        <div style="font-family:'Nunito',sans-serif;font-style:italic;font-weight:700;font-size:1.15rem;color:{CARD_TEXT};margin-bottom:20px">&ldquo;{esc(quote)}&rdquo;</div>
        <button onclick="typeof Lumio !== 'undefined' && Lumio.speak && Lumio.speak('{esc(w["en"])}')" style="cursor:pointer;border:none;
                  background:linear-gradient(135deg,{ORANGE},{ORANGE_DEEP});color:#fff;font-weight:600;font-family:'Fredoka',sans-serif;
                  padding:12px 26px;border-radius:10px;font-size:.9rem">&#9654; Listen</button>
      </div>
    </div>
    ''' + char_badge(ch))

DISCUSSION_TEMPLATES = [
    "Use \u201c{w}\u201d in a sentence of your own.",
    "What do you already know about \u201c{w}\u201d?",
    "When did you last see or use \u201c{w}\u201d?",
]
def discussion_question(word, seed):
    return DISCUSSION_TEMPLATES[seed % len(DISCUSSION_TEMPLATES)].format(w=word)

def slide_practice(w, n, total, ch, seed=0):
    quote = w.get("example", w["en"])
    question = discussion_question(w["en"], seed)
    return (bg_base() + header(f"Practice &middot; {esc(w['en'])}", n, total) + f'''
    <div style="position:relative;z-index:5;display:flex;gap:22px;padding:50px 40px 0">
      {card_open(260, "padding:0;overflow:hidden;height:260px")}<img src="assets/vocab/{slug(w['en'])}.png" style="width:100%;height:100%;object-fit:contain" onerror="this.style.display='none'"></div>
      {card_open(560, "padding:30px 34px")}
        <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:1.3rem;color:{CARD_TEXT};margin-bottom:10px">Say it out loud.</div>
        <div style="font-family:'Nunito',sans-serif;font-style:italic;font-weight:700;font-size:1.15rem;color:{ORANGE_DEEP};margin-bottom:18px">&ldquo;{esc(quote)}&rdquo;</div>
        <div style="display:flex;align-items:center;gap:10px;background:#F1F5F9;border-radius:10px;padding:12px 16px">
          <span style="font-size:1.1rem">&#128172;</span>
          <div style="font-size:.85rem;color:{CARD_TEXT};font-weight:700">DISCUSS: {esc(question)}</div>
        </div>
      </div>
    </div>
    ''' + char_badge(ch))

def slide_dialogue(lines, n, total):
    y_positions = [70, 176, 282, 388]
    bubbles = ""
    for i, (en, ar) in enumerate(lines):
        left = i % 2 == 0
        side = "left" if left else "right"
        bubbles += f'''
        <div style="position:absolute;{side}:60px;top:{y_positions[i]}px;max-width:520px;background:{CARD_BG};border-radius:12px;
                    padding:14px 20px;box-shadow:0 10px 22px rgba(0,0,0,.25);z-index:6">
          <div style="font-family:'Nunito',sans-serif;font-weight:700;font-size:1rem;color:{CARD_TEXT}">{esc(en)}</div>
          <div style="direction:rtl;text-align:right;font-size:.82rem;color:#8A8398;font-weight:700;margin-top:3px">{ar}</div>
        </div>'''
    return (bg_base() + header("Dialogue", n, total) + bubbles)

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
    return (bg_base() + header("Build the Sentence", n, total) + f'''
    <div style="position:relative;z-index:5;text-align:center;margin-top:40px;font-family:'Nunito',sans-serif;font-weight:700;color:{INK_DIM}">
      Drag the tiles into order.</div>
    <div id="sbSlots" data-correct="{esc(sentence.strip())}" style="position:relative;z-index:5;display:flex;justify-content:center;gap:10px;margin-top:30px;flex-wrap:wrap">
      {slots}{punct_tile}
    </div>
    <div id="sbTray" style="position:relative;z-index:5;display:flex;justify-content:center;gap:10px;margin-top:40px;flex-wrap:wrap;padding:0 60px">
      {tray}
    </div>
    <div id="sbFeedback" style="position:relative;z-index:5;text-align:center;margin-top:20px;font-family:'Fredoka',sans-serif;font-weight:600;font-size:1.2rem;color:{INK};min-height:32px"></div>
    <button onclick="window.checkSentenceBuilder && checkSentenceBuilder()"
            style="position:absolute;left:40px;bottom:30px;z-index:20;cursor:pointer;border:none;font-family:'Fredoka',sans-serif;
            background:linear-gradient(135deg,{ORANGE},{ORANGE_DEEP});color:#fff;font-weight:600;padding:12px 24px;border-radius:10px;font-size:.9rem">Check</button>
    ''' + char_badge(ch) + f'''
    <style>
      .sb-slot {{ width:110px; height:58px; border:2px dashed {BORDER}; border-radius:10px; background:rgba(255,255,255,.04); }}
      .sb-slot.sb-filled {{ border-style:solid; border-color:{ORANGE}; background:{CARD_BG}; }}
      .sb-tile {{ min-width:80px; height:58px; padding:0 16px; background:{CARD_BG}; border-radius:10px; display:flex; align-items:center;
                  justify-content:center; font-family:'Fredoka',sans-serif; font-weight:600; font-size:1.05rem; color:{CARD_TEXT};
                  box-shadow:0 8px 16px rgba(0,0,0,.2); cursor:grab; touch-action:none; user-select:none; }}
      .sb-tile.sb-dragging {{ opacity:.4; }}
      .sb-tile.sb-punct {{ background:transparent; box-shadow:none; font-size:1.6rem; min-width:16px; padding:0; color:{INK}; }}
    </style>''')

def slide_sound_spot(vocab, n, total, ch):
    cards = "".join(f'''
      <button onclick="typeof Lumio !== 'undefined' && Lumio.speak && Lumio.speak('{esc(w["en"])}')"
              style="border:none;cursor:pointer;font-family:inherit;background:{CARD_BG};border-radius:10px;padding:10px;
                    box-shadow:0 8px 16px rgba(0,0,0,.2);display:flex;flex-direction:column;align-items:center;gap:6px;width:140px">
        <div style="width:100px;height:100px;border-radius:8px;overflow:hidden;background:#F8FAFC"><img src="assets/vocab/{slug(w['en'])}.png" style="width:100%;height:100%;object-fit:contain" onerror="this.style.display='none'"></div>
        <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:.88rem;color:{CARD_TEXT}">{esc(w["en"])}</div>
        <div style="font-size:.75rem;color:{TEAL_DEEP};font-weight:800">{w["ar"]}</div>
      </button>''' for w in vocab)
    return (bg_base() + header("Sound &amp; Spot", n, total) + f'''
    <div style="position:relative;z-index:5;text-align:center;margin-top:34px;font-family:'Nunito',sans-serif;font-weight:700;color:{INK_DIM};font-size:.95rem">
      Tap a word to hear it.</div>
    <div style="position:relative;z-index:5;display:flex;flex-wrap:wrap;gap:16px;justify-content:center;margin-top:24px;padding:0 40px">{cards}</div>
    ''')

def slide_your_turn(w, idx, total_rounds, n, total, ch):
    return (bg_base() + header(f"Your Turn &middot; {idx}/{total_rounds}", n, total) + f'''
    <div style="position:relative;z-index:5;display:flex;align-items:center;justify-content:center;gap:36px;margin-top:60px">
      {card_open(280, f"height:280px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;background:#232038")}
        <div id="ytMystery{idx}" style="font-size:3.2rem">&#128266;</div>
        <img id="ytImg{idx}" src="assets/vocab/{slug(w['en'])}.png" style="display:none;position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:#fff" onerror="this.style.display='none'">
      </div>
      {card_open(360, "padding:32px;text-align:center")}
        <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:1.3rem;color:{CARD_TEXT};margin-bottom:8px">Listen first.</div>
        <div style="font-family:'Nunito',sans-serif;font-weight:700;font-size:.9rem;color:#6B6580">Play the sound, guess it, then reveal.</div>
      </div>
    </div>
    <button onclick="typeof Lumio !== 'undefined' && Lumio.speak && Lumio.speak('{esc(w["en"])}')"
            style="position:absolute;left:40px;bottom:30px;z-index:20;cursor:pointer;border:none;font-family:'Fredoka',sans-serif;
            background:linear-gradient(135deg,{TEAL},{TEAL_DEEP});color:#fff;font-weight:600;padding:12px 22px;border-radius:10px;font-size:.88rem">&#9654; Play</button>
    <button onclick="document.getElementById('ytMystery{idx}').style.display='none'; document.getElementById('ytImg{idx}').style.display='block'; this.textContent='{esc(w["en"])} \\u2014 {w["ar"]}'; this.style.background='linear-gradient(135deg,#4ADE80,#16A34A)'"
            style="position:absolute;left:190px;bottom:30px;z-index:20;cursor:pointer;border:none;font-family:'Fredoka',sans-serif;
            background:linear-gradient(135deg,{ORANGE},{ORANGE_DEEP});color:#fff;font-weight:600;padding:12px 22px;border-radius:10px;font-size:.88rem">Reveal</button>
    ''')

def slide_quiz(target, distractors, idx, total_q, n, total, seed):
    opts = distractors + [target]
    random.Random(seed).shuffle(opts)
    positions = [(600, 210), (880, 210), (600, 300), (880, 300)]
    buttons = ""
    for o, (l, t) in zip(opts, positions):
        buttons += f'''
      <button onclick="window.checkQuizAnswer && checkQuizAnswer(this, '{esc(o["en"])}', '{esc(target["en"])}')"
              style="position:absolute;left:{l}px;top:{t}px;width:250px;height:76px;background:{CARD_BG};border:1px solid #EEF0F4;border-radius:10px;
                  display:flex;align-items:center;justify-content:center;font-family:'Fredoka',sans-serif;font-weight:600;font-size:1.05rem;
                  color:{CARD_TEXT};cursor:pointer" data-quiz-option="{esc(o["en"])}">{esc(o["en"])}</button>'''
    return (bg_base() + header(f"Quiz &middot; {idx}/{total_q}", n, total) + f'''
    {card_open(260, "position:absolute;left:60px;top:200px;height:260px;overflow:hidden;padding:0")}<img src="assets/vocab/{slug(target['en'])}.png" style="width:100%;height:100%;object-fit:contain" onerror="this.style.display='none'"></div>
    <div style="position:absolute;left:600px;top:150px;font-family:'Fredoka',sans-serif;font-weight:600;font-size:1.5rem;color:{INK}">What is this?</div>
    {buttons}
    ''')

def slide_today_i_learned(lesson, n, total):
    chips = "".join(f'''
      <div style="background:{CARD_BG};border-radius:10px;padding:10px 8px;display:flex;flex-direction:column;align-items:center;gap:6px;width:100px">
        <div style="width:64px;height:64px;border-radius:8px;overflow:hidden;background:#F8FAFC"><img src="assets/vocab/{slug(w['en'])}.png" style="width:100%;height:100%;object-fit:contain" onerror="this.style.display='none'"></div>
        <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:.75rem;color:{CARD_TEXT};text-align:center">{esc(w["en"])}</div>
      </div>''' for w in lesson["vocab"][:6])
    return (bg_base() + header("Recap", n, total) + f'''
    <div style="position:relative;z-index:5;padding:40px 40px 0">
      <div style="font-family:'Fredoka',sans-serif;font-weight:600;color:{ORANGE_DEEP};font-size:.75rem;letter-spacing:1.5px;margin-bottom:10px">KEY WORDS</div>
      <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:20px">{chips}</div>
      <div style="font-family:'Fredoka',sans-serif;font-weight:600;color:{TEAL_DEEP};font-size:.75rem;letter-spacing:1.5px;margin-bottom:8px">GRAMMAR</div>
      {card_open(700, "padding:16px 20px")}
        <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:1rem;color:{CARD_TEXT}">{esc(lesson.get("grammarFocus",""))}</div>
      </div>
    </div>
    ''')

def slide_reward_homework(lesson_num, n, total, xp):
    items = ["Replay this lesson", "Finish your homework", "Practice with a friend or family member"]
    rows = "".join(f'''
      <div style="display:flex;align-items:center;gap:12px;padding:8px 0">
        <span style="width:22px;height:22px;border-radius:6px;background:#E6FBF8;color:{TEAL_DEEP};font-weight:800;
                     display:flex;align-items:center;justify-content:center;font-size:.78rem;flex-shrink:0">{i+1}</span>
        <span style="font-family:'Nunito',sans-serif;font-weight:700;font-size:.95rem;color:{CARD_TEXT}">{it}</span>
      </div>''' for i, it in enumerate(items))
    return (bg_base() + header("Session Complete", n, total) + f'''
    <div style="position:relative;z-index:5;display:flex;gap:20px;padding:50px 40px 0">
      {card_open(400, "padding:30px;text-align:center")}
        <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:1.3rem;color:{CARD_TEXT};margin-bottom:14px">Nice work.</div>
        {xp_pill(xp, "font-size:1.1rem;padding:10px 22px")}
      </div>
      {card_open(400, "padding:26px 30px")}
        <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:1rem;color:{CARD_TEXT};margin-bottom:10px">Before next time</div>
        {rows}
      </div>
    </div>
    ''')


def build_deck(lesson_num, lesson, prev_lesson, grammar_topic=None):
    V = len(lesson["vocab"])
    plan = [("title", None), ("goal", None), ("unscramble", lesson["vocab"][0])]
    if prev_lesson:
        plan.append(("recap", None))
    for i, w in enumerate(lesson["vocab"]):
        plan.append(("vocab", (w, i)))
        plan.append(("practice", (w, i)))
    if grammar_topic:
        plan.append(("grammar_rule", grammar_topic))
        plan.append(("grammar_practice", grammar_topic))
    plan.append(("dialogue", None))
    plan.append(("sentence", None))
    plan.append(("sound_spot", None))
    your_turn_n = min(2, V)
    for i in range(your_turn_n):
        plan.append(("your_turn", (lesson["vocab"][i], i + 1)))
    plan.append(("quiz", 1))
    plan.append(("quiz", 2))
    plan.append(("today_i_learned", None))
    plan.append(("reward_homework", None))

    total = len(plan)
    slides = []
    for pos, (kind, data) in enumerate(plan):
        n = pos + 1
        if kind == "title": slides.append(slide_title(lesson, V))
        elif kind == "goal": slides.append(slide_goal(lesson, n, total, V))
        elif kind == "unscramble": slides.append(slide_unscramble(data, n, total, "lumi-wave-book"))
        elif kind == "recap": slides.append(slide_recap(prev_lesson["vocab"], n, total))
        elif kind == "grammar_rule":
            slides.append(grammar_slides.slide_grammar_rule(data, n, total, "sara-explain", header, "", bg_base, lambda ch, **kw: char_badge(ch)))
        elif kind == "grammar_practice":
            slides.append(grammar_slides.slide_grammar_practice(data, n, total, "sara-clap", header, "", bg_base, lambda ch, **kw: char_badge(ch)))
        elif kind == "vocab":
            w, i = data
            slides.append(slide_vocab(w, i, n, total, V, VOCAB_CHARS[i % len(VOCAB_CHARS)]))
        elif kind == "practice":
            w, i = data
            slides.append(slide_practice(w, n, total, VOCAB_CHARS[i % len(VOCAB_CHARS)], seed=i))
        elif kind == "dialogue":
            slides.append(slide_dialogue(DIALOGUES[lesson_num], n, total))
        elif kind == "sentence":
            slides.append(slide_sentence_builder(lesson["vocab"][0]["example"], n, total, "sara-teach-board", lesson_num))
        elif kind == "sound_spot":
            slides.append(slide_sound_spot(lesson["vocab"], n, total, "sara-clap"))
        elif kind == "your_turn":
            w, idx = data
            slides.append(slide_your_turn(w, idx, your_turn_n, n, total, "omar-wave"))
        elif kind == "today_i_learned":
            slides.append(slide_today_i_learned(lesson, n, total))
        elif kind == "quiz":
            idx = data
            target = lesson["vocab"][1 if idx == 1 else min(3, V - 1)]
            distractors = [x for x in lesson["vocab"] if x["en"] != target["en"]][:3]
            slides.append(slide_quiz(target, distractors, idx, 2, n, total, lesson_num * 7 + idx))
        elif kind == "reward_homework":
            slides.append(slide_reward_homework(lesson_num, n, total, V * 10))
    return slides


def run(level, dialogues, grammar_units=None, out_root="slide-content", manifest_root="assets/slides"):
    global DIALOGUES
    DIALOGUES = dialogues
    grammar_units = grammar_units or {}
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
        slides = build_deck(num, lesson, prev_lesson, grammar_units.get(num))
        nn = f"{num:02d}"
        lesson_dir = os.path.join(out_dir, nn)
        os.makedirs(lesson_dir, exist_ok=True)
        for old in glob.glob(os.path.join(lesson_dir, "slide-*.html")):
            os.remove(old)
        for i, html in enumerate(slides, start=1):
            with open(os.path.join(lesson_dir, f"slide-{i:02d}.html"), "w", encoding="utf-8") as f:
                f.write(html)
        manifest[nn] = len(slides)
        print(f"{level} lesson {nn}: {len(slides)} slides" + (" [+ grammar]" if num in grammar_units else ""))

    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=0)
    print("Manifest written:", manifest_path)
