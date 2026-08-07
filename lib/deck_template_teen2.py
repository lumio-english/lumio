# -*- coding: utf-8 -*-
"""
Teen Track v2: restructured slide order grounded in SLA research
(input before explicit teaching, noticing before rule statements,
controlled-to-free practice progression, distributed retrieval).
Reuses v1's proven slide functions (vocab card, quiz, sentence
builder, etc.) where the function itself doesn't need to change, and
adds new slide types + per-lesson visual theming + larger characters.
"""
import deck_template_teen as v1
from deck_template_teen import (
    esc, slug, INK, INK_DIM, BG_DARK, BG_DARKER, CARD_BG, CARD_TEXT,
    PURPLE, PURPLE_DEEP, ORANGE, ORANGE_DEEP, TEAL, TEAL_DEEP, BORDER,
    CHAR, card_open, xp_pill, VOCAB_CHARS, DOT_GRID,
    slide_vocab, slide_quiz, slide_today_i_learned, slide_reward_homework,
)
import grammar_slides

# ============================================================
# Per-lesson visual theme system -- each lesson gets its own accent
# color and a distinct decorative motif instead of 3 shared variants.
# ============================================================
THEMES = {
    "room":   {"accent": "#F59E0B", "accent_deep": "#D97706", "motif": "shelf"},
    "social": {"accent": "#38BDF8", "accent_deep": "#0EA5E9", "motif": "chat"},
    "sport":  {"accent": "#FB7185", "accent_deep": "#E11D48", "motif": "trophy"},
    "game":   {"accent": "#C084FC", "accent_deep": "#A855F7", "motif": "controller"},
    "money":  {"accent": "#4ADE80", "accent_deep": "#16A34A", "motif": "coin"},
    "school": {"accent": "#818CF8", "accent_deep": "#6366F1", "motif": "book"},
    "default": {"accent": PURPLE, "accent_deep": PURPLE_DEEP, "motif": "none"},
}

def motif_svg(motif, accent):
    common = f'style="position:absolute;opacity:.10;pointer-events:none" fill="none" stroke="{accent}" stroke-width="3"'
    if motif == "shelf":
        return f'''<svg {common} width="220" height="220" style="position:absolute;right:40px;top:60px;opacity:.12">
          <rect x="10" y="20" width="160" height="14" rx="3"/><rect x="10" y="80" width="160" height="14" rx="3"/>
          <rect x="30" y="34" width="18" height="44"/><rect x="55" y="34" width="18" height="44"/>
          <circle cx="150" cy="150" r="40"/></svg>'''
    if motif == "chat":
        return f'''<svg {common} width="240" height="200" style="position:absolute;right:30px;top:50px;opacity:.12">
          <rect x="10" y="10" width="120" height="80" rx="18"/><rect x="70" y="70" width="120" height="80" rx="18"/>
          <circle cx="50" cy="45" r="4" fill="{accent}"/><circle cx="70" cy="45" r="4" fill="{accent}"/><circle cx="90" cy="45" r="4" fill="{accent}"/>
          </svg>'''
    if motif == "trophy":
        return f'''<svg {common} width="200" height="240" style="position:absolute;right:50px;top:60px;opacity:.12">
          <path d="M40 20h80v50a40 40 0 0 1-80 0z"/><rect x="65" y="110" width="30" height="30"/><rect x="45" y="140" width="70" height="16" rx="4"/>
          <path d="M40 30h-20v20a20 20 0 0 0 20 20"/><path d="M120 30h20v20a20 20 0 0 1-20 20"/></svg>'''
    if motif == "controller":
        return f'''<svg {common} width="240" height="160" style="position:absolute;right:30px;top:80px;opacity:.12">
          <rect x="10" y="30" width="220" height="90" rx="45"/><circle cx="70" cy="75" r="8"/><circle cx="170" cy="60" r="8"/><circle cx="190" cy="80" r="8"/>
          </svg>'''
    if motif == "coin":
        return f'''<svg {common} width="220" height="220" style="position:absolute;right:50px;top:60px;opacity:.12">
          <circle cx="80" cy="80" r="60"/><circle cx="150" cy="150" r="40"/></svg>'''
    if motif == "book":
        return f'''<svg {common} width="220" height="200" style="position:absolute;right:40px;top:60px;opacity:.12">
          <path d="M20 20h80v140h-80z"/><path d="M100 20h80v140h-80z"/><line x1="100" y1="20" x2="100" y2="160"/></svg>'''
    return ""

def bg_theme(theme_key="default"):
    t = THEMES.get(theme_key, THEMES["default"])
    accent = t["accent"]
    return f'''<div style="position:absolute;inset:0;background:linear-gradient(160deg,{BG_DARK} 0%,{BG_DARKER} 100%)"></div>
    {DOT_GRID}
    <div style="position:absolute;left:-120px;top:-120px;width:380px;height:380px;border-radius:50%;
                background:radial-gradient(circle,{accent}33,transparent 70%)"></div>
    <div style="position:absolute;right:-100px;bottom:-100px;width:320px;height:320px;border-radius:50%;
                background:radial-gradient(circle,rgba(20,184,166,.14),transparent 70%)"></div>
    {motif_svg(t["motif"], accent)}'''

def header_themed(pagetitle, n, total, theme_key="default"):
    t = THEMES.get(theme_key, THEMES["default"])
    pct = round(n / total * 100)
    return f'''<div style="position:relative;z-index:5;display:flex;align-items:center;justify-content:space-between;padding:22px 40px 0">
      <div style="display:flex;align-items:center;gap:10px">
        <div style="width:30px;height:30px;border-radius:8px;background:linear-gradient(135deg,{t['accent']},{t['accent_deep']});
                    display:flex;align-items:center;justify-content:center;font-weight:800;font-family:'Fredoka',sans-serif;color:#fff;font-size:.85rem">L</div>
        <div style="font-family:'Fredoka',sans-serif;font-weight:600;color:{INK};font-size:.85rem;letter-spacing:.5px">LUMIO ENGLISH</div>
      </div>
      <div style="font-family:'Fredoka',sans-serif;font-weight:600;color:{INK};font-size:.95rem;background:{t['accent']}24;
                  padding:6px 16px;border-radius:8px">{pagetitle}</div>
      <div style="font-family:'Nunito',sans-serif;font-weight:800;color:{INK_DIM};font-size:.8rem">{n} / {total}</div>
    </div>
    <div style="position:relative;z-index:5;margin:14px 40px 0;height:3px;background:{BORDER};border-radius:2px">
      <div style="height:100%;width:{pct}%;background:linear-gradient(90deg,{t['accent']},{t['accent_deep']});border-radius:2px"></div>
    </div>'''

def char_big(name, side="right", bottom=64):
    """Larger character presence than v1's small corner badge -- a
    real supporting figure, not a mascot dominating the slide.
    bottom=64 clears present.html's persistent nav bar (52px) plus
    the game-links row (up to 66px) so it never overlaps controls."""
    pos = f"{side}:30px" if side in ("right", "left") else side
    return f'''<img src="{CHAR}/{name}.png" style="position:absolute;{pos};bottom:{bottom}px;height:300px;z-index:4;
               filter:drop-shadow(0 14px 20px rgba(0,0,0,.35))">'''


# ============================================================
# New slide types for the restructured order
# ============================================================
def slide_hook(hook_question, n, total, ch, theme_key="default"):
    return (bg_theme(theme_key) + header_themed("Hook", n, total, theme_key) + f'''
    <div style="position:relative;z-index:5;display:flex;align-items:center;height:600px;padding:0 60px">
      <div style="max-width:640px">
        <div style="font-family:'Fredoka',sans-serif;font-weight:600;color:{INK_DIM};font-size:.78rem;letter-spacing:1.5px;margin-bottom:14px">BEFORE WE START</div>
        <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:2rem;color:#fff;line-height:1.35">{esc(hook_question)}</div>
      </div>
    </div>
    ''' + char_big(ch))

def slide_first_listen(dialogue, n, total, theme_key="default"):
    y_positions = [130, 250, 370, 490]
    bubbles = ""
    for i, (en, ar) in enumerate(dialogue):
        left = i % 2 == 0
        side = "left" if left else "right"
        bubbles += f'''
        <div style="position:absolute;{side}:60px;top:{y_positions[min(i, 3)]}px;max-width:480px;background:{CARD_BG};border-radius:12px;
                    padding:14px 20px;box-shadow:0 10px 22px rgba(0,0,0,.25);z-index:6">
          <div style="font-family:'Nunito',sans-serif;font-weight:700;font-size:1rem;color:{CARD_TEXT}">{esc(en)}</div>
          <div style="direction:rtl;text-align:right;font-size:.82rem;color:#8A8398;font-weight:700;margin-top:3px">{ar}</div>
        </div>'''
    return (bg_theme(theme_key) + header_themed("First Listen", n, total, theme_key) + f'''
    <div style="position:relative;z-index:5;text-align:center;margin-top:34px;font-family:'Nunito',sans-serif;font-weight:700;color:{INK_DIM};font-size:.9rem">
      Listen first. Don't worry about understanding every word -- just get the gist.</div>
    ''' + bubbles)

def slide_notice_practice(sentences, note, n, total, theme_key="default"):
    t = THEMES.get(theme_key, THEMES["default"])
    rows = ""
    for s in sentences:
        rows += f'''<button onclick="this.classList.toggle('spotted'); this.style.borderColor = this.classList.contains('spotted') ? '{t["accent"]}' : '#EEF0F4'; this.style.background = this.classList.contains('spotted') ? '{t["accent"]}14' : '#fff'"
                style="display:block;width:100%;text-align:left;border:2px solid #EEF0F4;background:#fff;border-radius:10px;padding:12px 16px;margin-bottom:10px;
                       font-family:'Nunito',sans-serif;font-weight:700;color:{CARD_TEXT};cursor:pointer;font-size:1rem">{esc(s)}</button>'''
    return (bg_theme(theme_key) + header_themed("Notice the Pattern", n, total, theme_key) + f'''
    <div style="position:relative;z-index:5;display:flex;justify-content:center;margin-top:50px">
      {card_open(760, "padding:34px 40px")}
        <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:1.05rem;color:{CARD_TEXT};margin-bottom:4px">Tap every sentence that uses {esc(note)}.</div>
        <div style="font-size:.82rem;color:#6B6580;font-weight:700;margin-bottom:18px">You just heard some of these -- can you spot the pattern?</div>
        {rows}
      </div>
    </div>
    ''')

def slide_challenge(prompt, hint, n, total, ch, theme_key="default"):
    return (bg_theme(theme_key) + header_themed("Challenge", n, total, theme_key) + f'''
    <div style="position:relative;z-index:5;display:flex;justify-content:center;margin-top:60px">
      {card_open(680, "padding:36px 40px;text-align:center")}
        <div style="font-size:1.8rem;margin-bottom:12px">&#9889;</div>
        <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:1.2rem;color:{CARD_TEXT};margin-bottom:12px">{esc(prompt)}</div>
        <div style="font-size:.85rem;color:#6B6580;font-weight:700">{esc(hint)}</div>
      </div>
    </div>
    ''' + char_big(ch, side="left"))

def slide_real_life(prompt, n, total, ch, theme_key="default"):
    return (bg_theme(theme_key) + header_themed("Real Life Connection", n, total, theme_key) + f'''
    <div style="position:relative;z-index:5;display:flex;justify-content:center;margin-top:70px">
      {card_open(680, "padding:38px 42px;text-align:center")}
        <div style="font-size:1.8rem;margin-bottom:14px">&#127775;</div>
        <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:1.15rem;color:{CARD_TEXT}">{esc(prompt)}</div>
      </div>
    </div>
    ''' + char_big(ch))

import random

def slide_vocab_mcq(vocab_list, mode, idx, total_q, n, total, theme_key="default"):
    """mode: 'picture' (image -> English word) or 'translate' (Arabic -> English word)"""
    seed = idx * 13 + (1 if mode == "translate" else 0)
    rng = random.Random(seed)
    target = vocab_list[idx % len(vocab_list)]
    distractors = rng.sample([w for w in vocab_list if w["en"] != target["en"]], min(3, len(vocab_list) - 1))
    opts = distractors + [target]
    rng.shuffle(opts)
    positions = [(600, 210), (880, 210), (600, 300), (880, 300)]
    buttons = ""
    for o, (l, t) in zip(opts, positions):
        buttons += f'''
      <button onclick="window.checkQuizAnswer && checkQuizAnswer(this, '{esc(o["en"])}', '{esc(target["en"])}')"
              style="position:absolute;left:{l}px;top:{t}px;width:250px;height:76px;background:{CARD_BG};border:1px solid #EEF0F4;border-radius:10px;
                  display:flex;align-items:center;justify-content:center;font-family:'Fredoka',sans-serif;font-weight:600;font-size:1.05rem;
                  color:{CARD_TEXT};cursor:pointer" data-quiz-option="{esc(o["en"])}">{esc(o["en"])}</button>'''
    if mode == "picture":
        prompt_html = f'''{card_open(260, "position:absolute;left:60px;top:200px;height:260px;overflow:hidden;padding:0")}
          <img src="assets/vocab/{slug(target['en'])}.png" style="width:100%;height:100%;object-fit:contain" onerror="this.style.display='none'"></div>
        <div style="position:absolute;left:600px;top:150px;font-family:'Fredoka',sans-serif;font-weight:600;font-size:1.5rem;color:{INK}">What is this?</div>'''
    else:
        prompt_html = f'''{card_open(460, "position:absolute;left:60px;top:220px;padding:30px;text-align:center")}
          <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:.78rem;color:#6B6580;letter-spacing:1px;margin-bottom:10px">WHAT'S THE ENGLISH WORD?</div>
          <div style="direction:rtl;font-family:'Nunito',sans-serif;font-weight:800;font-size:2rem;color:{CARD_TEXT}">{target['ar']}</div></div>'''
    return (bg_theme(theme_key) + header_themed(f"Vocabulary Check &middot; {idx + 1}/{total_q}", n, total, theme_key) + prompt_html + buttons)


def slide_grammar_mcq(sentences, idx, total_q, n, total, theme_key="default"):
    """sentences: list of {en, ar} pulled from grammar examples + vocab
    examples (this curriculum writes vocab examples to already reflect
    the lesson's grammar focus, so pooling both gives real variety
    without any lesson-specific hand-authoring)."""
    seed = idx * 17
    rng = random.Random(seed)
    target_sentence = sentences[idx % len(sentences)]
    words = target_sentence["en"].strip().split(" ")
    correct_word = words[0].rstrip(".,!?")
    rest = " ".join(words[1:])
    other_first_words = list({s["en"].strip().split(" ")[0].rstrip(".,!?") for s in sentences} - {correct_word})
    rng.shuffle(other_first_words)
    distractors = other_first_words[:3]
    while len(distractors) < 3:
        distractors.append(rng.choice(["I", "You", "She", "They"]))
    opts = distractors + [correct_word]
    rng.shuffle(opts)
    opt_buttons = "".join(f'''<button onclick="window.checkQuizAnswer && checkQuizAnswer(this, '{esc(o)}', '{esc(correct_word)}')"
        data-quiz-option="{esc(o)}" style="border:2px solid #EEF0F4;background:#fff;border-radius:10px;padding:14px;
        font-family:'Fredoka',sans-serif;font-weight:600;font-size:1.05rem;color:{CARD_TEXT};cursor:pointer">{esc(o)}</button>''' for o in opts)
    return (bg_theme(theme_key) + header_themed(f"Grammar Check &middot; {idx + 1}/{total_q}", n, total, theme_key) + f'''
    <div style="position:relative;z-index:5;display:flex;justify-content:center;margin-top:70px">
      {card_open(700, "padding:38px 42px")}
        <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:.78rem;color:#6B6580;letter-spacing:1px;margin-bottom:14px">COMPLETE THE SENTENCE</div>
        <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:1.4rem;color:{CARD_TEXT};margin-bottom:22px">___ {esc(rest)}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">{opt_buttons}</div>
      </div>
    </div>
    ''')


def slide_practice_themed(w, n, total, ch, seed=0, theme_key="default"):
    quote = w.get("example", w["en"])
    question = v1.discussion_question(w["en"], seed)
    return (bg_theme(theme_key) + header_themed(f"Practice &middot; {esc(w['en'])}", n, total, theme_key) + f'''
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
    ''')

def header_themed_wrap(theme_key):
    return lambda title, n, total: header_themed(title, n, total, theme_key)

def bg_theme_wrap(theme_key):
    return lambda: bg_theme(theme_key)


def slide_pair_check(prompt, n, total, theme_key="default"):
    return (bg_theme(theme_key) + header_themed("Pair Check", n, total, theme_key) + f'''
    <div style="position:relative;z-index:5;display:flex;justify-content:center;margin-top:80px">
      {card_open(660, "padding:40px 44px;text-align:center")}
        <div style="font-size:2rem;margin-bottom:14px">&#129309;</div>
        <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:1.2rem;color:{CARD_TEXT};margin-bottom:10px">{esc(prompt)}</div>
        <div style="font-size:.85rem;color:#6B6580;font-weight:700">60 seconds &mdash; go!</div>
      </div>
    </div>
    ''')

def slide_round_checkpoint(round_label, n, total, theme_key="default"):
    return (bg_theme(theme_key) + header_themed("Quick Check-In", n, total, theme_key) + f'''
    <div style="position:relative;z-index:5;display:flex;justify-content:center;margin-top:90px">
      {card_open(600, "padding:36px 40px;text-align:center")}
        <div style="font-size:1.8rem;margin-bottom:12px">&#9995;</div>
        <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:1.15rem;color:{CARD_TEXT}">{esc(round_label)} done. How did we do?</div>
        <div style="font-size:.85rem;color:#6B6580;font-weight:700;margin-top:8px">Thumbs up if you're feeling good, thumbs down if you want to go over one again.</div>
      </div>
    </div>
    ''')

def slide_error_analysis(wrong_sentence, right_sentence, why, n, total, theme_key="default"):
    return (bg_theme(theme_key) + header_themed("Common Mistake", n, total, theme_key) + f'''
    <div style="position:relative;z-index:5;display:flex;justify-content:center;margin-top:60px">
      {card_open(720, "padding:36px 40px")}
        <div style="display:flex;align-items:center;gap:12px;background:#FEF2F2;border-radius:10px;padding:12px 16px;margin-bottom:10px">
          <span style="font-size:1.1rem">&#10060;</span>
          <div style="font-family:'Nunito',sans-serif;font-weight:700;color:#991B1B;font-size:1rem">{esc(wrong_sentence)}</div>
        </div>
        <div style="display:flex;align-items:center;gap:12px;background:#F0FDF4;border-radius:10px;padding:12px 16px;margin-bottom:18px">
          <span style="font-size:1.1rem">&#9989;</span>
          <div style="font-family:'Nunito',sans-serif;font-weight:700;color:#166534;font-size:1rem">{esc(right_sentence)}</div>
        </div>
        <div style="font-size:.9rem;color:{CARD_TEXT};font-weight:700">{esc(why)}</div>
      </div>
    </div>
    ''')


def build_deck_v2(lesson_num, lesson, grammar_topic, dialogue, hook_question, notice_sentences,
                   notice_note, challenge, real_life, theme_key="default",
                   n_vocab_mcq=10, n_grammar_mcq=10):
    V = len(lesson["vocab"])
    ch1, ch2, ch3 = "omar-wave", "noor-happy", "sara-explain"

    plan = [("title", None), ("hook", None), ("first_listen", None)]
    for i, w in enumerate(lesson["vocab"]):
        plan.append(("vocab", (w, i)))
    for i in range(3):
        w = lesson["vocab"][i % V]
        plan.append(("practice", (w, i)))
    plan.append(("pair_check", f"Quiz your partner on today's words -- point and ask 'What's this?'"))
    # Vocabulary Check: live, in-class MCQ practice, split into two 5-question
    # rounds with a checkpoint -- breaks up 10 slides in a row and gives a
    # natural pacing beat instead of one long uninterrupted block.
    half = n_vocab_mcq // 2
    for i in range(half):
        plan.append(("vocab_mcq", i))
    plan.append(("checkpoint", "Round 1"))
    for i in range(half, n_vocab_mcq):
        plan.append(("vocab_mcq", i))
    if grammar_topic:
        plan.append(("grammar_rule", grammar_topic))
    if notice_sentences:
        plan.append(("notice", None))
    plan.append(("sentence", None))
    if grammar_topic:
        plan.append(("grammar_practice", grammar_topic))
    ghalf = n_grammar_mcq // 2
    for i in range(ghalf):
        plan.append(("grammar_mcq", i))
    plan.append(("checkpoint", "Round 1"))
    for i in range(ghalf, n_grammar_mcq):
        plan.append(("grammar_mcq", i))
    if grammar_topic:
        plan.append(("error_analysis", None))
    your_turn_n = min(2, V)
    for i in range(your_turn_n):
        plan.append(("your_turn", (lesson["vocab"][i], i + 1)))
    if challenge:
        plan.append(("challenge", None))
    if real_life:
        plan.append(("real_life", None))
    plan.append(("today_i_learned", None))
    plan.append(("reward_homework", None))

    total = len(plan)
    slides = []
    v1.DIALOGUES = {lesson_num: dialogue}
    vocab_mcq_sentences_pool = None
    grammar_mcq_sentences_pool = None
    for pos, (kind, data) in enumerate(plan):
        n = pos + 1
        if kind == "title":
            slides.append(v1.slide_title(lesson, V, "VOCABULARY & GRAMMAR"))
        elif kind == "hook":
            slides.append(slide_hook(hook_question, n, total, ch1, theme_key))
        elif kind == "first_listen":
            slides.append(slide_first_listen(dialogue, n, total, theme_key))
        elif kind == "vocab":
            w, i = data
            slides.append(slide_vocab(w, i, n, total, V, VOCAB_CHARS[i % len(VOCAB_CHARS)]))
        elif kind == "grammar_rule":
            slides.append(grammar_slides.slide_grammar_rule(
                data, n, total, ch3, header_themed_wrap(theme_key), "", bg_theme_wrap(theme_key),
                lambda ch, **kw: v1.char_badge(ch)))
        elif kind == "notice":
            slides.append(slide_notice_practice(notice_sentences, notice_note, n, total, theme_key))
        elif kind == "practice":
            w, i = data
            slides.append(slide_practice_themed(w, n, total, VOCAB_CHARS[i % len(VOCAB_CHARS)], seed=i, theme_key=theme_key))
        elif kind == "pair_check":
            slides.append(slide_pair_check(data, n, total, theme_key))
        elif kind == "checkpoint":
            slides.append(slide_round_checkpoint(data, n, total, theme_key))
        elif kind == "vocab_mcq":
            i = data
            mode = "picture" if i % 2 == 0 else "translate"
            slides.append(slide_vocab_mcq(lesson["vocab"], mode, i, n_vocab_mcq, n, total, theme_key))
        elif kind == "sentence":
            slides.append(v1.slide_sentence_builder(lesson["vocab"][0]["example"], n, total, "sara-teach-board", lesson_num))
        elif kind == "grammar_practice":
            slides.append(grammar_slides.slide_grammar_practice(
                data, n, total, ch3, header_themed_wrap(theme_key), "", bg_theme_wrap(theme_key),
                lambda ch, **kw: v1.char_badge(ch)))
        elif kind == "grammar_mcq":
            i = data
            if grammar_mcq_sentences_pool is None:
                grammar_mcq_sentences_pool = []
                if grammar_topic:
                    for ex in grammar_topic.get("examples", []):
                        grammar_mcq_sentences_pool.append({"en": ex["en"], "ar": ex["ar"]})
                for w in lesson["vocab"]:
                    if w.get("example"):
                        grammar_mcq_sentences_pool.append({"en": w["example"], "ar": w["ar"]})
            slides.append(slide_grammar_mcq(grammar_mcq_sentences_pool, i, n_grammar_mcq, n, total, theme_key))
        elif kind == "error_analysis":
            pool = grammar_mcq_sentences_pool or []
            if pool:
                target_sentence = pool[0]
                words = target_sentence["en"].strip().split(" ")
                correct_word = words[0].rstrip(".,!?")
                rest = " ".join(words[1:])
                other_words = list({s["en"].strip().split(" ")[0].rstrip(".,!?") for s in pool} - {correct_word})
                wrong_word = other_words[0] if other_words else "It"
                wrong_sentence = f"{wrong_word} {rest}"
                right_sentence = target_sentence["en"]
                topic_title = grammar_topic["title"] if grammar_topic else "this grammar point"
                why = f"With {topic_title}, we say \"{correct_word}\" here, not \"{wrong_word}\"."
                slides.append(slide_error_analysis(wrong_sentence, right_sentence, why, n, total, theme_key))
        elif kind == "your_turn":
            w, idx = data
            slides.append(v1.slide_your_turn(w, idx, your_turn_n, n, total, "omar-wave"))
        elif kind == "challenge":
            slides.append(slide_challenge(challenge["prompt"], challenge["hint"], n, total, ch2, theme_key))
        elif kind == "real_life":
            slides.append(slide_real_life(real_life, n, total, ch1, theme_key))
        elif kind == "today_i_learned":
            slides.append(slide_today_i_learned(lesson, n, total))
        elif kind == "reward_homework":
            slides.append(slide_reward_homework(lesson_num, n, total, V * 10))
    return slides
