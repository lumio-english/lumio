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
INK_DIM = "#C6BBF2"
BG_DARK = "#3A2A8A"
BG_DARKER = "#251A5E"
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

DOT_GRID = '''<svg style="position:absolute;inset:0;width:100%;height:100%;opacity:.35" xmlns="http://www.w3.org/2000/svg">
  <defs><pattern id="dotgrid" width="28" height="28" patternUnits="userSpaceOnUse">
    <circle cx="2" cy="2" r="1.4" fill="rgba(237,233,251,.16)"/>
  </pattern></defs>
  <rect width="100%" height="100%" fill="url(#dotgrid)"/></svg>'''

def bg_base(variant="default"):
    blobs = {
        "default": f'''
        <div style="position:absolute;left:-120px;top:-120px;width:380px;height:380px;border-radius:50%;
                    background:radial-gradient(circle,rgba(139,92,246,.24),transparent 70%)"></div>
        <div style="position:absolute;right:-100px;bottom:-100px;width:320px;height:320px;border-radius:50%;
                    background:radial-gradient(circle,rgba(20,184,166,.15),transparent 70%)"></div>''',
        "reading": f'''
        <div style="position:absolute;right:-140px;top:-100px;width:420px;height:420px;border-radius:50%;
                    background:radial-gradient(circle,rgba(139,92,246,.26),transparent 70%)"></div>
        <div style="position:absolute;left:-100px;bottom:-140px;width:360px;height:360px;border-radius:50%;
                    background:radial-gradient(circle,rgba(249,115,22,.12),transparent 70%)"></div>''',
        "warm": f'''
        <div style="position:absolute;left:50%;top:-160px;transform:translateX(-50%);width:520px;height:420px;border-radius:50%;
                    background:radial-gradient(circle,rgba(249,115,22,.18),transparent 70%)"></div>
        <div style="position:absolute;right:-100px;bottom:-100px;width:300px;height:300px;border-radius:50%;
                    background:radial-gradient(circle,rgba(139,92,246,.2),transparent 70%)"></div>''',
    }
    # thin diagonal accent line for depth, subtle, doesn't collide with centered content
    diagonal = '''<div style="position:absolute;left:0;top:38%;width:100%;height:1px;
                  background:linear-gradient(90deg,transparent,rgba(237,233,251,.08),transparent)"></div>'''
    return f'''<div style="position:absolute;inset:0;background:linear-gradient(160deg,{BG_DARK} 0%,{BG_DARKER} 100%)"></div>
    {DOT_GRID}
    {blobs.get(variant, blobs["default"])}
    {diagonal}'''

def header(pagetitle, n, total):
    pct = round(n / total * 100)
    return f'''<div style="position:relative;z-index:5;display:flex;align-items:center;justify-content:space-between;padding:22px 40px 0">
      <div style="display:flex;align-items:center;gap:10px">
        <div style="width:30px;height:30px;border-radius:8px;background:#fff;overflow:hidden;display:flex;align-items:center;justify-content:center;padding:3px">
          <img src="assets/logo/lumio-logo.png" style="width:100%;height:100%;object-fit:contain"></div>
        <div style="font-family:'Fredoka',sans-serif;font-weight:600;color:{INK};font-size:.85rem;letter-spacing:.5px">LUMIO ENGLISH</div>
      </div>
      <div style="font-family:'Fredoka',sans-serif;font-weight:600;color:{CARD_TEXT if False else INK};font-size:.95rem;background:rgba(139,92,246,.14);
                  padding:6px 16px;border-radius:8px">{pagetitle}</div>
      <div style="font-family:'Nunito',sans-serif;font-weight:800;color:{INK_DIM};font-size:.8rem">{n} / {total}</div>
    </div>
    <div style="position:relative;z-index:5;margin:14px 40px 0;height:3px;background:{BORDER};border-radius:2px">
      <div style="height:100%;width:{pct}%;background:linear-gradient(90deg,{PURPLE},{ORANGE});border-radius:2px"></div>
    </div>'''

# Set per slide by deck_template_teen2.bg_theme() so every card -- including
# the v1-built vocab/quiz/TIL slides teen2 wraps -- carries the lesson's
# accent as a slim top edge. None = plain white card (v1 used standalone).
CARD_ACCENT = None

def card_open(width=None, extra=""):
    w = f"width:{width}px;" if width else ""
    edge = f"border-top:4px solid {CARD_ACCENT};" if CARD_ACCENT else ""
    return f'<div style="background:{CARD_BG};border-radius:12px;border:1px solid rgba(0,0,0,.06);{edge}box-shadow:0 12px 26px rgba(0,0,0,.28);{w}{extra}">'

def char_badge(name, right=40, bottom=26):
    # Removed: the small corner "guide" badge sat in the bottom-right
    # exactly where the presenter's game buttons and the Next button
    # live, and collided with both. Returns nothing so every existing
    # call site (v1 and teen2) is a no-op without touching them.
    return ""

def xp_pill(xp, extra_style=""):
    return f'''<span style="display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg,{ORANGE},{ORANGE_DEEP});
                color:#fff;font-family:'Fredoka',sans-serif;font-weight:600;font-size:.85rem;padding:6px 16px;border-radius:999px;{extra_style}">
      &#9889; +{xp} XP</span>'''

VOCAB_CHARS = ["omar-teen-wave", "noor-teen-happy", "sara-teen-explain", "omar-teen-point", "noor-teen-wave", "ziad-teen-happy", "hamad-teen-wave"]

# ============================================================
MEET_THE_SQUAD_CAST = [
    ("omar-teen-wave", "Omar", "Let's get started!"),
    ("sara-teen-wave", "Sara", "I've got your back!"),
    ("noor-teen-wave", "Noor", "Ready when you are!"),
    ("ziad-teen-wave", "Ziad", "Level up your English!"),
    ("hamad-teen-wave", "Hamad", "Welcome to the crew!"),
]

def slide_meet_the_squad(n, total, theme_key="default"):
    cards = ""
    positions = [90, 320, 550, 780, 1010]
    for (img_name, char_name, line), left in zip(MEET_THE_SQUAD_CAST, positions):
        cards += f'''
        <div style="position:absolute;left:{left}px;top:210px;width:210px;text-align:center">
          <div style="height:260px;display:flex;align-items:flex-end;justify-content:center">
            <img src="{CHAR}/{img_name}.png" style="max-height:260px;max-width:210px;filter:drop-shadow(0 12px 16px rgba(0,0,0,.35))" onerror="this.style.display='none'">
          </div>
          <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:1.15rem;color:#fff;margin-top:10px">{esc(char_name)}</div>
          <div style="font-family:'Nunito',sans-serif;font-weight:700;font-size:.82rem;color:{INK_DIM};margin-top:2px">{esc(line)}</div>
        </div>'''
    return (bg_base() + f'''
    <div style="position:relative;z-index:5;padding:22px 40px 0">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
        <div style="width:30px;height:30px;border-radius:8px;background:#fff;overflow:hidden;display:flex;align-items:center;justify-content:center;padding:3px">
          <img src="assets/logo/lumio-logo.png" style="width:100%;height:100%;object-fit:contain"></div>
        <div style="font-family:'Fredoka',sans-serif;font-weight:600;color:{INK};font-size:.85rem;letter-spacing:.5px">LUMIO ENGLISH</div>
      </div>
    </div>
    <div style="position:relative;z-index:5;text-align:center;margin-top:20px">
      <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:1.7rem;color:#fff">Meet the Squad</div>
      <div style="font-family:'Nunito',sans-serif;font-weight:700;font-size:.95rem;color:{INK_DIM};margin-top:6px">Your crew for this level</div>
    </div>
    {cards}
    ''')

def slide_title(lesson, num_words, lesson_type="VOCABULARY & GRAMMAR", bg_image=None):
    subtitle = " · ".join(esc(v["en"]) for v in lesson["vocab"])
    if bg_image:
        bg = f'''<div style="position:absolute;inset:0;background:url('{bg_image}') center/cover no-repeat"></div>
        <div style="position:absolute;inset:0;background:linear-gradient(160deg,{BG_DARK}CC 0%,{BG_DARKER}F2 100%)"></div>'''
    else:
        bg = bg_base()
    return f'''{bg}
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;z-index:5">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
        <div style="width:44px;height:44px;border-radius:10px;background:#fff;overflow:hidden;display:flex;align-items:center;justify-content:center;padding:4px">
          <img src="assets/logo/lumio-logo.png" style="width:100%;height:100%;object-fit:contain"></div>
        <div style="font-family:'Fredoka',sans-serif;font-weight:600;color:{INK};font-size:1.1rem;letter-spacing:1px">LUMIO ENGLISH</div>
      </div>
      <div style="background:rgba(139,92,246,.18);border:1px solid rgba(139,92,246,.4);color:{INK};font-family:'Fredoka',sans-serif;
                  font-weight:600;font-size:.72rem;letter-spacing:1.5px;padding:5px 16px;border-radius:999px;margin-bottom:16px">{lesson_type}</div>
      <h1 style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:3.1rem;color:#fff;margin:0 0 14px">{esc(lesson["title"])}</h1>
      <div style="font-family:'Nunito',sans-serif;font-weight:700;color:{INK_DIM};font-size:1.05rem;margin-bottom:22px">{subtitle}</div>
      {xp_pill(num_words * 10)}
    </div>'''

def slide_are_you_ready(n, total, ch):
    return (bg_base("warm") + f'''
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:5;text-align:center">
      <h2 style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:2.4rem;color:#fff;margin:0 0 30px">Are You Ready?</h2>
      <div style="display:flex;align-items:center;gap:36px">
        <div style="background:rgba(20,184,166,.16);border:1px solid rgba(20,184,166,.4);border-radius:12px;padding:14px 24px;
                    font-family:'Fredoka',sans-serif;font-weight:600;color:{INK};font-size:1.05rem">&#128064; Look at me.</div>
        <img src="{CHAR}/{ch}.png" style="height:200px">
        <div style="background:rgba(139,92,246,.18);border:1px solid rgba(139,92,246,.4);border-radius:12px;padding:14px 24px;
                    font-family:'Fredoka',sans-serif;font-weight:600;color:{INK};font-size:1.05rem">&#128266; Listen to me.</div>
      </div>
    </div>
    ''')

def slide_goal(lesson, n, total, num_words):
    return (bg_base() + header("Today's Goal", n, total) + f'''
    <div style="position:relative;z-index:5;display:flex;gap:20px;padding:60px 40px 0">
      {card_open(560, "padding:30px 34px")}
        <div style="font-family:'Fredoka',sans-serif;font-weight:600;color:{ORANGE_DEEP};font-size:.78rem;letter-spacing:1.5px;margin-bottom:10px">GOAL</div>
        <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:1.3rem;color:{CARD_TEXT};line-height:1.4">{esc(lesson.get("goal",""))}</div>
        <div style="margin-top:16px;display:inline-block;background:#F1F5F9;color:{CARD_TEXT};font-weight:700;font-size:.82rem;padding:6px 14px;border-radius:8px">
          {num_words} words · {esc(lesson.get("grammarFocus",""))}</div>
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
    return (bg_base() + header("Warm-Up · Unscramble", n, total) + f'''
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
            style="position:absolute;left:50%;transform:translateX(-170px);bottom:110px;z-index:20;cursor:pointer;border:none;font-family:'Fredoka',sans-serif;
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

def slide_vocab(w, idx, n, total, num_words, ch, verb_count=0):
    quote = w.get("example", w["en"])
    # Same verbs-first-then-other-words split as js/lesson.js's actVocab,
    # kept in sync deliberately -- verb_count=0 (the default, and what
    # every untouched lesson passes) reproduces the exact original
    # "Vocabulary · word" label with no behavior change.
    is_verb = w.get("pos") == "verb"
    if is_verb:
        chip_label = f"New Verbs · {esc(w['en'])}"
    elif verb_count:
        chip_label = f"New Words · {esc(w['en'])}"
    else:
        chip_label = f"Vocabulary · {esc(w['en'])}"
    return (bg_base() + header(chip_label, n, total) + f'''
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
    return (bg_base() + header(f"Practice · {esc(w['en'])}", n, total) + f'''
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
            style="position:absolute;left:50%;transform:translateX(-170px);bottom:110px;z-index:20;cursor:pointer;border:none;font-family:'Fredoka',sans-serif;
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

def slide_sentence_trio(sentences, n, total, ch, seed):
    """Three compact build-the-sentence exercises on one slide, teen-theme
    version -- same data-group-scoped drag-and-drop as the kid template's
    slide_sentence_trio, styled to match this module's dark theme instead
    (bg_base, CARD_BG, Fredoka) rather than reusing the kid version's
    cream/Baloo styling directly."""
    rows = ""
    row_top = 130
    row_height = 155
    for i, sentence in enumerate(sentences):
        words, punct = tokenize_sentence(sentence)
        order = list(range(len(words)))
        random.Random(seed * 10 + i).shuffle(order)
        punct_tile = f'<div class="sbg-tile sbg-punct" style="cursor:default">{punct}</div>' if punct else ""
        slots = "".join(f'<div class="sb-slot sbg-slot" data-group="{i}" data-index="{j}"></div>' for j in range(len(words)))
        tray = "".join(f'<div class="sb-tile sbg-tile" draggable="false" data-group="{i}" data-word="{esc(words[j])}">{esc(words[j])}</div>' for j in order)
        top = row_top + i * row_height
        rows += f'''
        <div style="position:absolute;left:40px;right:40px;top:{top}px;background:{CARD_BG};border-radius:12px;padding:12px 18px;
                    box-shadow:0 6px 14px rgba(0,0,0,.18)">
          <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
            <div style="font-size:.8rem;font-weight:700;color:{ORANGE};min-width:14px">{i + 1}.</div>
            <div id="sbSlots{i}" data-correct="{esc(sentence.strip())}" style="display:flex;gap:6px;flex-wrap:wrap;min-height:36px">
              {slots}{punct_tile}
            </div>
            <div style="width:1.5px;align-self:stretch;background:{BORDER};margin:0 4px"></div>
            <div id="sbTray{i}" style="display:flex;gap:6px;flex-wrap:wrap;flex:1">
              {tray}
            </div>
            <button onclick="window.checkSentenceBuilder && checkSentenceBuilder('{i}')"
                    style="cursor:pointer;border:none;font-family:'Fredoka',sans-serif;background:linear-gradient(135deg,{ORANGE},{ORANGE_DEEP});
                           color:#fff;font-weight:600;padding:7px 14px;border-radius:8px;font-size:.78rem;white-space:nowrap">Check</button>
          </div>
          <div id="sbFeedback{i}" style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:.8rem;min-height:18px;margin-top:4px;color:{CARD_TEXT}"></div>
        </div>'''
    return (bg_base() + header("Build the Sentences", n, total) + f'''
    <div style="position:relative;z-index:5;text-align:center;margin-top:30px;font-family:'Nunito',sans-serif;font-weight:700;color:{INK_DIM}">
      Drag the tiles into order.</div>
    {rows}
    <style>
      .sbg-slot {{ width:70px; height:38px; border:2px dashed {BORDER}; border-radius:8px; background:rgba(0,0,0,.04); }}
      .sbg-tile {{ min-width:50px; height:38px; padding:0 10px; background:#FFF8EC; border-radius:8px; display:flex; align-items:center;
                   justify-content:center; font-family:'Fredoka',sans-serif; font-weight:600; font-size:.82rem; color:{CARD_TEXT};
                   box-shadow:0 3px 8px rgba(0,0,0,.15); cursor:grab; touch-action:none; user-select:none; }}
      .sbg-tile.sb-dragging {{ opacity:.4; }}
      .sbg-punct {{ background:transparent !important; box-shadow:none !important; font-size:1.2rem; min-width:10px; padding:0; height:38px; color:{INK}; }}
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
    return (bg_base() + header(f"Your Turn · {idx}/{total_rounds}", n, total) + f'''
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
            style="position:absolute;left:50%;transform:translateX(-170px);bottom:110px;z-index:20;cursor:pointer;border:none;font-family:'Fredoka',sans-serif;
            background:linear-gradient(135deg,{TEAL},{TEAL_DEEP});color:#fff;font-weight:600;padding:12px 22px;border-radius:10px;font-size:.88rem">&#9654; Play</button>
    <button onclick="document.getElementById('ytMystery{idx}').style.display='none'; document.getElementById('ytImg{idx}').style.display='block'; this.textContent='{esc(w["en"])} \\u2014 {w["ar"]}'; this.style.background='linear-gradient(135deg,#4ADE80,#16A34A)'"
            style="position:absolute;left:50%;transform:translateX(10px);bottom:110px;z-index:20;cursor:pointer;border:none;font-family:'Fredoka',sans-serif;
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
    return (bg_base() + header(f"Quiz · {idx}/{total_q}", n, total) + f'''
    {card_open(260, "position:absolute;left:60px;top:200px;height:260px;overflow:hidden;padding:0")}<img src="assets/vocab/{slug(target['en'])}.png" style="width:100%;height:100%;object-fit:contain" onerror="this.style.display='none'"></div>
    <div style="position:absolute;left:600px;top:150px;font-family:'Fredoka',sans-serif;font-weight:600;font-size:1.5rem;color:{INK}">What is this?</div>
    {buttons}
    ''')

def today_i_learned_pages(lesson, grammar_topic=None, dialogue=None, crew_talk=None,
                          scene_sentence=None, extra_sentences=None, grammar_recap_topics=None,
                          extra_blocks=None):
    """Everything the class covered, grouped into blocks and paginated
    by recap_pages (see that module). Previously the teen recap showed
    only the first 6 vocab words (lesson["vocab"][:6]) and only their
    own example sentences -- the grammar examples, the dialogue and the
    crew-talk lines never appeared on it, and any lesson with more than
    6 words silently lost the rest from its own recap."""
    import recap_pages
    max_chips = 2 * recap_pages.TEEN.chips_per_row()
    blocks = [{"kind": "chips" if len(lesson["vocab"]) <= max_chips else "pills",
               "label": "KEY WORDS", "items": [w["en"] for w in lesson["vocab"]]}]
    for blk in (extra_blocks or []):
        if blk.get("items"): blocks.append(blk)
    vocab_sentences = recap_pages.dedupe([w.get("example") for w in lesson["vocab"]]
                                         + ([scene_sentence] if scene_sentence else [])
                                         + list(extra_sentences or []))
    seen = {t.lower() for t in vocab_sentences}
    blocks.append({"kind": "sentences", "label": "SENTENCE PATTERNS", "items": vocab_sentences,
                   "title": lesson.get("grammarFocus") or None})
    if grammar_topic:
        gex = [ex["en"] for ex in grammar_topic.get("examples", [])]
        for rule in grammar_topic.get("rules", []) or []:
            gex += [e if isinstance(e, str) else e.get("en", "") for e in rule.get("examples", [])]
        gex = [g for g in recap_pages.dedupe(gex) if g.lower() not in seen]
        if gex:
            blocks.append({"kind": "sentences", "label": "GRAMMAR", "items": gex,
                           "title": grammar_topic.get("title")})
    if grammar_recap_topics:
        # Review lesson (20): every grammar topic the level covered, by
        # title -- the full example lists would be ~60 sentences.
        titles = [t.get("title", "") for chunk in grammar_recap_topics for t in chunk]
        blocks.append({"kind": "pills", "label": "GRAMMAR REVIEWED", "items": recap_pages.dedupe(titles)})
    if dialogue:
        lines = [(l[1] if len(l) == 3 else l[0]) for l in dialogue]
        blocks.append({"kind": "lines", "label": "DIALOGUE", "items": recap_pages.dedupe(lines)})
    if crew_talk:
        lines = [f"{l[0]}: {l[1]}" for l in crew_talk]
        blocks.append({"kind": "lines", "label": "CREW TALK", "items": recap_pages.dedupe(lines)})
    return recap_pages.paginate(blocks, recap_pages.TEEN)


def _recap_block_html(blk):
    kind, items = blk["kind"], blk["items"]
    label = blk["label"] + (" (cont.)" if blk.get("cont") else "")
    color = ORANGE_DEEP if kind in ("chips", "pills") else TEAL_DEEP
    out = f'<div style="font-family:\'Fredoka\',sans-serif;font-weight:600;color:{color};font-size:.75rem;letter-spacing:1.5px;margin-bottom:10px">{label}</div>'
    if kind == "chips":
        chips = "".join(f'''
      <div style="background:{CARD_BG};border-radius:10px;padding:10px 8px;display:flex;flex-direction:column;align-items:center;gap:6px;width:100px">
        <div style="width:64px;height:64px;border-radius:8px;overflow:hidden;background:#F8FAFC"><img src="assets/vocab/{slug(w)}.png" style="width:100%;height:100%;object-fit:contain" onerror="this.style.display='none'"></div>
        <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:.75rem;color:{CARD_TEXT};text-align:center">{esc(w)}</div>
      </div>''' for w in items)
        out += f'<div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:18px">{chips}</div>'
    elif kind == "pills":
        pills = "".join(f'''
      <div style="background:{CARD_BG};border-radius:999px;padding:7px 14px;font-family:'Fredoka',sans-serif;font-weight:600;
                  font-size:.8rem;color:{CARD_TEXT};line-height:1.2">{esc(w)}</div>''' for w in items)
        out += f'<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:18px">{pills}</div>'
    else:
        title = blk.get("title")
        title_html = (f'<div style="font-family:\'Fredoka\',sans-serif;font-weight:600;font-size:1rem;color:{CARD_TEXT};margin-bottom:6px">{esc(title)}</div>'
                      if title and not blk.get("cont") else "")
        cols = "1fr 1fr" if kind == "sentences" else "1fr"
        rows = "".join(f'<div style="font-family:\'Fredoka\',sans-serif;font-style:italic;font-weight:500;font-size:.88rem;color:{ORANGE_DEEP};line-height:1.35">&ldquo;{esc(p)}&rdquo;</div>' for p in items)
        out += card_open(None, "padding:14px 20px;margin-bottom:18px") + f'''{title_html}
        <div style="display:grid;grid-template-columns:{cols};gap:4px 18px">{rows}</div>
      </div>'''
    return out


def slide_today_i_learned(page, page_idx, page_count, n, total, bg_fn=None, header_fn=None):
    title = "Recap" if page_count == 1 else f"Recap &middot; {page_idx}/{page_count}"
    body = "".join(_recap_block_html(b) for b in page)
    return ((bg_fn or bg_base)() + (header_fn or header)(title, n, total) + f'''
    <div data-recap-body style="position:relative;z-index:5;padding:40px 40px 0">{body}</div>
    ''')

# ---------- Reading Adventure: procedural/narrative reading-comprehension slides ----------
def slide_reading_warmup(prediction_q, n, total, ch):
    return (bg_base() + header("Warm-Up", n, total) + f'''
    <div style="position:relative;z-index:5;display:flex;justify-content:center;margin-top:70px">
      {card_open(700, "padding:40px 44px;text-align:center")}
        <div style="font-size:2.2rem;margin-bottom:16px">&#129300;</div>
        <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:1.3rem;color:{CARD_TEXT}">{esc(prediction_q)}</div>
      </div>
    </div>
    ''' + char_badge(ch))

def slide_reading_intro(intro_text, discussion_q, n, total, ch):
    return (bg_base() + header("Let's Read", n, total) + f'''
    <div style="position:relative;z-index:5;display:flex;justify-content:center;margin-top:60px">
      {card_open(760, "padding:36px 40px")}
        <div style="font-family:'Nunito',sans-serif;font-size:1.1rem;color:{CARD_TEXT};line-height:1.7;margin-bottom:20px">{esc(intro_text)}</div>
        <div style="display:flex;align-items:center;gap:10px;background:#F1F5F9;border-radius:10px;padding:12px 16px">
          <span style="font-size:1.1rem">&#128172;</span>
          <div style="font-size:.85rem;color:{CARD_TEXT};font-weight:700">DISCUSS: {esc(discussion_q)}</div>
        </div>
      </div>
    </div>
    ''' + char_badge(ch))

def slide_reading_passage(text, question, chunk_label, n, total):
    return (bg_base() + header(f"Reading · {esc(chunk_label)}", n, total) + f'''
    <div style="position:relative;z-index:5;display:flex;justify-content:center;margin-top:60px">
      {card_open(760, "padding:36px 40px")}
        <div style="font-family:'Nunito',sans-serif;font-size:1.15rem;color:{CARD_TEXT};line-height:1.8;margin-bottom:22px">{text}</div>
        <div style="display:flex;align-items:center;gap:10px;background:#F1F5F9;border-radius:10px;padding:12px 16px">
          <span style="font-size:1.1rem">&#10067;</span>
          <div style="font-size:.85rem;color:{CARD_TEXT};font-weight:700">{esc(question)}</div>
        </div>
      </div>
    </div>
    ''')

def slide_writing_prep(prompt, bullets, n, total):
    bullet_html = "".join(f'<li style="margin-bottom:8px">{esc(b)}</li>' for b in bullets)
    return (bg_base() + header("Writing Preparation", n, total) + f'''
    <div style="position:relative;z-index:5;display:flex;justify-content:center;margin-top:60px">
      {card_open(700, "padding:36px 40px")}
        <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:1.2rem;color:{CARD_TEXT};margin-bottom:16px">{esc(prompt)}</div>
        <ul style="font-family:'Nunito',sans-serif;font-size:1rem;color:{CARD_TEXT};padding-left:20px">{bullet_html}</ul>
        <div style="font-size:.82rem;color:#6B6580;font-weight:700;margin-top:10px">Talk it through out loud before you write.</div>
      </div>
    </div>
    ''')

def slide_writing_project(prompt, starters, n, total):
    starter_html = "".join(f'<div style="background:#F1F5F9;border-radius:10px;padding:10px 14px;margin-bottom:8px;font-weight:700;color:{CARD_TEXT}">{esc(s)}</div>' for s in starters)
    return (bg_base() + header("Writing Project", n, total) + f'''
    <div style="position:relative;z-index:5;display:flex;justify-content:center;margin-top:60px">
      {card_open(700, "padding:36px 40px")}
        <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:1.2rem;color:{CARD_TEXT};margin-bottom:16px">{esc(prompt)}</div>
        {starter_html}
        <div style="font-size:.82rem;color:#6B6580;font-weight:700;margin-top:10px">Write your passage after class.</div>
      </div>
    </div>
    ''')


def slide_grammar_extension(prompt, n, total, ch):
    return (bg_base() + header("Use It In Your Life", n, total) + f'''
    <div style="position:relative;z-index:5;display:flex;justify-content:center;margin-top:70px">
      {card_open(680, "padding:38px 42px;text-align:center")}
        <div style="font-size:1.8rem;margin-bottom:14px">&#127775;</div>
        <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:1.15rem;color:{CARD_TEXT}">{esc(prompt)}</div>
      </div>
    </div>
    ''' + char_badge(ch))

def slide_picture_recall(sentence_parts, n, total):
    """sentence_parts: list of {'text': str} or {'word': str} (word -> shown as an image blank)"""
    parts_html = ""
    for p in sentence_parts:
        if "word" in p:
            parts_html += f'''<span style="display:inline-flex;flex-direction:column;align-items:center;margin:0 6px;vertical-align:middle">
              <span style="width:56px;height:56px;border-radius:8px;overflow:hidden;background:#F1F5F9;display:block">
                <img src="assets/vocab/{slug(p["word"])}.png" style="width:100%;height:100%;object-fit:contain" onerror="this.style.display='none'"></span>
            </span>'''
        else:
            parts_html += f'<span style="font-size:1.1rem;color:{CARD_TEXT}">{esc(p["text"])}</span>'
    return (bg_base("reading") + header("Picture Recall", n, total) + f'''
    <div style="position:relative;z-index:5;display:flex;justify-content:center;margin-top:70px">
      {card_open(760, "padding:40px 44px")}
        <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:.95rem;color:#6B6580;margin-bottom:20px">Use the pictures to retell the story out loud.</div>
        <div style="line-height:2.6">{parts_html}</div>
      </div>
    </div>
    ''')

def slide_spot_grammar(sentences, target_note, n, total):
    """sentences: list of {'text': str, 'has_target': bool}"""
    rows = ""
    for i, s in enumerate(sentences):
        rows += f'''<button onclick="this.classList.toggle('spotted'); this.style.borderColor = this.classList.contains('spotted') ? '{PURPLE}' : '#EEF0F4'; this.style.background = this.classList.contains('spotted') ? 'rgba(139,92,246,.08)' : '#fff'"
                style="display:block;width:100%;text-align:left;border:2px solid #EEF0F4;background:#fff;border-radius:10px;padding:12px 16px;margin-bottom:10px;
                       font-family:'Nunito',sans-serif;font-weight:700;color:{CARD_TEXT};cursor:pointer;font-size:1rem">{esc(s["text"])}</button>'''
    return (bg_base("reading") + header("Spot the Grammar", n, total) + f'''
    <div style="position:relative;z-index:5;display:flex;justify-content:center;margin-top:50px">
      {card_open(760, "padding:34px 40px")}
        <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:1.05rem;color:{CARD_TEXT};margin-bottom:4px">Tap every sentence that uses {esc(target_note)}.</div>
        <div style="font-size:.82rem;color:#6B6580;font-weight:700;margin-bottom:18px">Tap again to un-select.</div>
        {rows}
      </div>
    </div>
    ''')

def slide_comprehension_wrapup(questions, n, total):
    rows = "".join(f'''<div style="display:flex;align-items:flex-start;gap:10px;padding:9px 0">
        <span style="width:24px;height:24px;border-radius:6px;background:rgba(139,92,246,.16);color:{PURPLE_DEEP};font-weight:800;
                     display:flex;align-items:center;justify-content:center;font-size:.78rem;flex-shrink:0;margin-top:2px">{i+1}</span>
        <span style="font-family:'Nunito',sans-serif;font-weight:700;color:{CARD_TEXT};font-size:1rem">{esc(q)}</span>
      </div>''' for i, q in enumerate(questions))
    return (bg_base("reading") + header("What Do You Remember?", n, total) + f'''
    <div style="position:relative;z-index:5;display:flex;justify-content:center;margin-top:55px">
      {card_open(720, "padding:34px 40px")}
        <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:1.05rem;color:{CARD_TEXT};margin-bottom:14px">Answer out loud, in your own words.</div>
        {rows}
      </div>
    </div>
    ''')


def build_reading_adventure_deck(lesson_num, lesson, grammar_topic, story):
    """story = {prediction_q, intro, intro_q, passages: [{text, question, label}],
                post_q, writing_prep: {prompt, bullets}, writing_project: {prompt, starters}}"""
    V = len(lesson["vocab"])
    plan = [("title", None), ("are_you_ready", None), ("goal", None), ("warmup", None)]
    for i, w in enumerate(lesson["vocab"]):
        plan.append(("vocab", (w, i)))
        plan.append(("practice", (w, i)))
    # Scene slide: only when a scene image exists for this lesson (see
    # lib/teen_scenes.py); skipped silently otherwise.
    try:
        import teen_scenes, os as _os
        _sc = teen_scenes.SCENES.get(CURRENT_LEVEL, {}).get(lesson_num)
        if _sc and _os.path.exists(f"assets/vocab-scenes/{CURRENT_LEVEL}/{lesson_num:02d}.jpg"):
            plan.append(("scene", _sc))
    except Exception:
        pass
    if grammar_topic:
        plan.append(("grammar_rule", grammar_topic))
        plan.append(("grammar_practice", grammar_topic))
        if story.get("grammar_extension"):
            plan.append(("grammar_extension", story["grammar_extension"]))
        if story.get("spot_grammar"):
            plan.append(("spot_grammar", story["spot_grammar"]))
    plan.append(("reading_intro", None))
    for idx, p in enumerate(story["passages"]):
        plan.append(("reading_passage", (p, idx + 1, len(story["passages"]))))
    if story.get("picture_recall"):
        plan.append(("picture_recall", story["picture_recall"]))
    if story.get("comprehension_qs"):
        plan.append(("comprehension_wrapup", story["comprehension_qs"]))
    plan.append(("writing_prep", None))
    plan.append(("writing_project", None))
    plan.append(("quiz", 1))
    plan.append(("quiz", 2))
    _recap = today_i_learned_pages(lesson, grammar_topic, DIALOGUES.get(lesson_num) if isinstance(DIALOGUES, dict) else None)
    for _pi, _page in enumerate(_recap, 1):
        plan.append(("today_i_learned", (_page, _pi, len(_recap))))
    plan.append(("reward_homework", None))

    total = len(plan)
    slides = []
    for pos, (kind, data) in enumerate(plan):
        n = pos + 1
        if kind == "title": slides.append(slide_title(lesson, V, "READING COMPREHENSION"))
        elif kind == "are_you_ready": slides.append(slide_are_you_ready(n, total, "omar-wave"))
        elif kind == "goal": slides.append(slide_goal(lesson, n, total, V))
        elif kind == "warmup": slides.append(slide_reading_warmup(story["prediction_q"], n, total, "lumi-wave-book"))
        elif kind == "grammar_rule":
            slides.append(grammar_slides.slide_grammar_rule(data, n, total, "sara-explain", header, "", bg_base, lambda ch, **kw: char_badge(ch)))
        elif kind == "grammar_practice":
            slides.append(grammar_slides.slide_grammar_practice(data, n, total, "sara-clap", header, "", bg_base, lambda ch, **kw: char_badge(ch)))
        elif kind == "grammar_extension":
            slides.append(slide_grammar_extension(data, n, total, "sara-explain"))
        elif kind == "spot_grammar":
            slides.append(slide_spot_grammar(data["sentences"], data["note"], n, total))
        elif kind == "vocab":
            w, i = data
            slides.append(slide_vocab(w, i, n, total, V, VOCAB_CHARS[i % len(VOCAB_CHARS)]))
        elif kind == "scene":
            slides.append(slide_vocab_scene(f"assets/vocab-scenes/{CURRENT_LEVEL}/{lesson_num:02d}.jpg", data["en"], data["bold"], n, total, data.get("ar")))
        elif kind == "practice":
            w, i = data
            slides.append(slide_practice(w, n, total, VOCAB_CHARS[i % len(VOCAB_CHARS)], seed=i))
        elif kind == "reading_intro":
            slides.append(slide_reading_intro(story["intro"], story["intro_q"], n, total, "noor-happy"))
        elif kind == "reading_passage":
            p, idx, tot = data
            slides.append(slide_reading_passage(p["text"], p["question"], p["label"], n, total))
        elif kind == "picture_recall":
            slides.append(slide_picture_recall(data, n, total))
        elif kind == "comprehension_wrapup":
            slides.append(slide_comprehension_wrapup(data, n, total))
        elif kind == "writing_prep":
            slides.append(slide_writing_prep(story["writing_prep"]["prompt"], story["writing_prep"]["bullets"], n, total))
        elif kind == "writing_project":
            slides.append(slide_writing_project(story["writing_project"]["prompt"], story["writing_project"]["starters"], n, total))
        elif kind == "today_i_learned":
            _page, _pi, _pc = data
            slides.append(slide_today_i_learned(_page, _pi, _pc, n, total))
        elif kind == "quiz":
            idx = data
            target = lesson["vocab"][1 if idx == 1 else min(3, V - 1)]
            distractors = [x for x in lesson["vocab"] if x["en"] != target["en"]][:3]
            slides.append(slide_quiz(target, distractors, idx, 2, n, total, lesson_num * 7 + idx))
        elif kind == "reward_homework":
            slides.append(slide_reward_homework(lesson_num, n, total, V * 10))
    return slides


def slide_reward_homework(lesson_num, n, total, xp):
    items = [
        "Do the interactive homework on your dashboard first",
        "Print your worksheet, writing-practice sheet and flashcards",
        "Memorise this lesson's words with your flashcards",
        "Play this lesson's bonus game",
    ]
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


def slide_vocab_scene(image_path, sentence, bold_words, n, total, translation=None):
    """One real illustrated moment for the lesson's language: the scene
    full-bleed, the sentence in a caption box with key words highlighted,
    an Arabic line, and a play button. Mirrors the young-track version."""
    import re as _re
    highlighted = esc(sentence)
    for w in sorted(bold_words, key=len, reverse=True):
        highlighted = _re.sub(r"\b(" + _re.escape(esc(w)) + r")\b", r'<span class="vs-key">\1</span>', highlighted, count=1, flags=_re.I)
    speak = sentence.replace("'", "\\'")
    return (f'''
    <div style="position:absolute;inset:0;background:#1a1530 url('{image_path}') center/cover no-repeat"></div>
    <div style="position:absolute;inset:0;background:linear-gradient(0deg,rgba(15,10,30,.78) 0%,rgba(15,10,30,.35) 30%,transparent 55%)"></div>
    ''' + header("Scene &middot; " + " &amp; ".join(esc(w) for w in bold_words[:2]), n, total) + f'''
    <div style="position:absolute;left:0;right:0;bottom:44px;display:flex;align-items:center;justify-content:center;gap:16px;padding:0 60px">
      <div style="background:#fff;border-radius:20px;padding:16px 28px;box-shadow:0 12px 30px rgba(0,0,0,.35);text-align:center;max-width:900px">
        <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:1.5rem;color:{CARD_TEXT};line-height:1.35">{highlighted}</div>
        {f'<div dir="rtl" style="margin-top:8px;display:inline-block;padding:6px 18px;border-radius:999px;background:#E6F7F3;color:{TEAL_DEEP};font-weight:700;font-size:1.05rem">{esc(translation)}</div>' if translation else ''}
      </div>
      <button onclick="typeof Lumio !== 'undefined' && Lumio.speak && Lumio.speak('{speak}')"
              style="flex-shrink:0;border:none;cursor:pointer;font-family:inherit;background:linear-gradient(135deg,#F97316,#EA580C);color:#fff;font-weight:800;width:56px;height:56px;border-radius:50%;font-size:1.3rem;box-shadow:0 6px 16px rgba(0,0,0,.35)">&#9654;</button>
    </div>
    <style>.vs-key{{color:{ORANGE_DEEP};font-weight:700}}</style>''')


def build_deck(lesson_num, lesson, prev_lesson, grammar_topic=None):
    V = len(lesson["vocab"])
    plan = [("title", None), ("goal", None), ("unscramble", lesson["vocab"][0])]
    if prev_lesson:
        plan.append(("recap", None))
    for i, w in enumerate(lesson["vocab"]):
        plan.append(("vocab", (w, i)))
        plan.append(("practice", (w, i)))
    # Scene slide: only when a scene image exists for this lesson (see
    # lib/teen_scenes.py); skipped silently otherwise.
    try:
        import teen_scenes, os as _os
        _sc = teen_scenes.SCENES.get(CURRENT_LEVEL, {}).get(lesson_num)
        if _sc and _os.path.exists(f"assets/vocab-scenes/{CURRENT_LEVEL}/{lesson_num:02d}.jpg"):
            plan.append(("scene", _sc))
    except Exception:
        pass
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
    _recap = today_i_learned_pages(lesson, grammar_topic, DIALOGUES.get(lesson_num) if isinstance(DIALOGUES, dict) else None)
    for _pi, _page in enumerate(_recap, 1):
        plan.append(("today_i_learned", (_page, _pi, len(_recap))))
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
        elif kind == "scene":
            slides.append(slide_vocab_scene(f"assets/vocab-scenes/{CURRENT_LEVEL}/{lesson_num:02d}.jpg", data["en"], data["bold"], n, total, data.get("ar")))
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
            _page, _pi, _pc = data
            slides.append(slide_today_i_learned(_page, _pi, _pc, n, total))
        elif kind == "quiz":
            idx = data
            target = lesson["vocab"][1 if idx == 1 else min(3, V - 1)]
            distractors = [x for x in lesson["vocab"] if x["en"] != target["en"]][:3]
            slides.append(slide_quiz(target, distractors, idx, 2, n, total, lesson_num * 7 + idx))
        elif kind == "reward_homework":
            slides.append(slide_reward_homework(lesson_num, n, total, V * 10))
    return slides


DIALOGUES = {}
CURRENT_LEVEL = None

def run(level, dialogues, grammar_units=None, out_root="slide-content", manifest_root="assets/slides"):
    global DIALOGUES, CURRENT_LEVEL
    DIALOGUES = dialogues
    CURRENT_LEVEL = level
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
