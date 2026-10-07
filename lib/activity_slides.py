# -*- coding: utf-8 -*-
"""Interactive activity slides shared by the kids' (deck_template_v2) and
teen (deck_template_teen2) decks. Three per lesson, each built from the
lesson's own vocabulary / grammar topic so it stays correct whenever the
content changes, each with a PAIRS/GROUP mode and a 1-ON-1 mode written on
the slide (the teacher never has to improvise the one-to-one version).

Slides carry no <script>: all interaction is inline onclick calling the
helpers in js/slide-activities.js (window.LumioAct), loaded by
present.html and present-trial.html.

Caller passes the chrome (already-rendered background + header HTML) so
each track keeps its own look; `kid=True` switches fonts/colours to the
kids' palette.

Kids (Pre-A, L1, L2):   flash_race, memory_match, mystery_picture
Teens (L3-L6):          describe_guess, story_chain, truth_or_lie
"""
import html as _html
import re
import json as _json


def esc(s):
    return _html.escape(str(s), quote=True)


def slug(w):
    # Shared site rule (matches the files in assets/vocab/): drop
    # apostrophes, collapse any other non-alphanumeric run to "-", trim
    # dashes -- so "don't have to" -> dont-have-to, "o'clock" -> oclock.
    s = str(w).strip().lower().replace("'", "").replace("\u2019", "")
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")


def _img(w):
    return f"assets/vocab/{slug(w.get('image') or w['en'])}.png"


def _spread(vocab, n):
    """n words spread evenly across the list (so a lesson's early and late
    words are both represented), in lesson order, no repeats."""
    V = len(vocab)
    if V <= n:
        return list(vocab)
    idx = sorted({round(i * (V - 1) / (n - 1)) for i in range(n)})
    return [vocab[i] for i in idx]


def _font(kid):
    return "'Baloo 2',sans-serif" if kid else "'Fredoka',sans-serif"


def _ink(kid):
    return "#43301F" if kid else "#2B2640"


def _muted(kid):
    return "#8A7160" if kid else "#6B6580"


def _radius(kid):
    return "20px" if kid else "14px"


def _card(kid, extra=""):
    return (f'background:#fff;border-radius:{_radius(kid)};box-shadow:0 10px 24px rgba(0,0,0,{".12" if kid else ".28"});'
            f'{"border:1px solid rgba(0,0,0,.06);" if not kid else ""}{extra}')


def mode_band(kid, title, pairs, solo, top=128):
    """The instruction band every activity opens with: what to do in a
    group/pairs and what to do 1-on-1 (student + teacher)."""
    return f'''
    <div style="position:absolute;left:46px;right:46px;top:{top}px;z-index:6;display:flex;gap:14px">
      <div style="flex:1;{_card(kid, "padding:10px 16px")}">
        <div style="font-size:.68rem;font-weight:800;letter-spacing:1.5px;color:#0D9488">&#128101; PAIRS / GROUP</div>
        <div style="font-family:{_font(kid)};font-weight:700;font-size:.92rem;color:{_ink(kid)};line-height:1.3">{pairs}</div>
      </div>
      <div style="flex:1;{_card(kid, "padding:10px 16px")}">
        <div style="font-size:.68rem;font-weight:800;letter-spacing:1.5px;color:#F97316">&#128100; 1-ON-1 WITH YOUR TEACHER</div>
        <div style="font-family:{_font(kid)};font-weight:700;font-size:.92rem;color:{_ink(kid)};line-height:1.3">{solo}</div>
      </div>
    </div>'''


def _btn(label, onclick, color="#F97316", color2="#EA580C", extra=""):
    return (f'<button onclick="{onclick}" style="cursor:pointer;border:none;font-family:inherit;background:linear-gradient(135deg,{color},{color2});'
            f'color:#fff;font-weight:800;padding:11px 22px;border-radius:999px;font-size:.95rem;box-shadow:0 8px 18px rgba(0,0,0,.2);{extra}">{label}</button>')


def _score_box(kid, label, color):
    return f'''
      <div style="display:flex;align-items:center;gap:8px;{_card(kid, "padding:6px 10px 6px 14px")}">
        <span style="font-family:{_font(kid)};font-weight:800;color:{color};font-size:.9rem">{label}</span>
        <span data-act-score style="display:inline-block;min-width:34px;text-align:center;font-family:{_font(kid)};font-weight:800;font-size:1.3rem;color:{_ink(kid)};transition:transform .15s">0</span>
        <button onclick="LumioAct.score(this,1)" style="cursor:pointer;border:none;width:30px;height:30px;border-radius:50%;background:{color};color:#fff;font-weight:900;font-size:1rem">+</button>
        <button onclick="LumioAct.score(this,-1)" style="cursor:pointer;border:none;width:30px;height:30px;border-radius:50%;background:#E5E7EB;color:#6B7280;font-weight:900;font-size:1rem">&minus;</button>
      </div>'''


# ----------------------------------------------------------------- KIDS --

def slide_flash_race(vocab, bg, header_html, kid=True, char_html=""):
    """Flash Race: one big picture at a time; children shout the word
    before the next card. Teacher taps Next (or Random). Groups: two
    teams score; 1-on-1: the student earns stars (5 stars = win) and the
    teacher says the word first only if the student is stuck."""
    panels = ""
    for i, w in enumerate(vocab):
        panels += f'''
        <div data-say="{esc(w['en'])}" style="display:{'none' if i else 'block'}"><div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <div style="width:300px;height:300px;border-radius:24px;overflow:hidden;background:#FFFCF6;{_card(kid)}"><img src="{_img(w)}" style="width:100%;height:100%;object-fit:contain" onerror="this.style.display='none'"></div>
        </div></div>'''
    stars = "".join(f'<span data-star="0" style="font-size:2rem;opacity:.25;transition:transform .2s">&#11088;</span>' for _ in range(5))
    return (bg + header_html + mode_band(kid, "Flash Race",
        "Two teams. A picture appears &mdash; the first team to shout the English word gets a point. Teacher taps <b>Next</b>.",
        "A picture appears &mdash; you say the word! Each correct word = one star. Five stars and you win. Stuck? Your teacher says it, you repeat it.") + f'''
    <div style="position:absolute;left:0;right:0;top:214px;bottom:60px;z-index:6;display:flex;align-items:center;justify-content:center;gap:40px">
      <div style="display:flex;flex-direction:column;align-items:center;gap:12px">
        <div id="frPanels" data-idx="0" data-autosay="0">{panels}</div>
        <div style="display:flex;gap:10px;align-items:center">
          {_btn("&#9664; Back", "LumioAct.cycle('frPanels',-1)", "#94A3B8", "#64748B")}
          <span data-act-counter="frPanels" style="font-family:{_font(kid)};font-weight:800;color:{_muted(kid)}">1 / {len(vocab)}</span>
          {_btn("Next &#9654;", "LumioAct.cycle('frPanels',1)")}
          {_btn("&#127922; Random", "LumioAct.random('frPanels')", "#0D9488", "#0B7A6F")}
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:14px;width:300px">
        <div style="{_card(kid, "padding:14px 16px")}">
          <div style="font-size:.68rem;font-weight:800;letter-spacing:1.5px;color:#0D9488;margin-bottom:6px">TEAM SCORES</div>
          <div style="display:flex;flex-direction:column;gap:8px">{_score_box(kid, "Team A", "#F97316")}{_score_box(kid, "Team B", "#0D9488")}</div>
        </div>
        <div style="{_card(kid, "padding:14px 16px")}">
          <div style="font-size:.68rem;font-weight:800;letter-spacing:1.5px;color:#F97316;margin-bottom:6px">1-ON-1 STARS</div>
          <div id="frStars" style="display:flex;gap:4px;justify-content:center">{stars}</div>
          <div style="display:flex;justify-content:center;margin-top:8px">{_btn("&#11088; Got it!", "LumioAct.star('frStars')", "#FBBF24", "#F59E0B", "color:#43301F")}</div>
          <div data-act-stars-done="frStars" style="display:none;text-align:center;font-family:{_font(kid)};font-weight:800;color:#0D9488;margin-top:8px">&#127881; Five stars &mdash; you win!</div>
        </div>
      </div>
    </div>
    ''' + char_html)


def slide_memory_match(vocab, bg, header_html, kid=True, char_html=""):
    """Memory Match: 4 words, two picture cards each, face down. Tap two:
    a match stays open (and the word is spoken), a miss flips back.
    Pairs take turns and keep their matches; 1-on-1: student vs teacher."""
    words = _spread(vocab, 4)
    cards = []
    for p, w in enumerate(words):
        for _ in range(2):
            cards.append((p, w))
    # deterministic shuffle so regeneration is stable
    order = sorted(range(len(cards)), key=lambda i: (i * 7 + 3) % len(cards))
    cards = [cards[i] for i in order]
    back_style = "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#F97316,#FBBF24);color:#fff;font-size:3rem;font-weight:900"
    tiles = "".join(f'''
      <div data-pair="{p}" data-say="{esc(w['en'])}" onclick="LumioAct.memory(this)" style="position:relative;width:150px;height:150px;border-radius:18px;overflow:hidden;cursor:pointer;{_card(kid)};transition:transform .15s">
        <div class="act-front" style="display:none;position:absolute;inset:0;background:#fff;padding:8px"><img src="{_img(w)}" style="width:100%;height:100%;object-fit:contain" onerror="this.style.display='none'"></div>
        <div class="act-back" style="{back_style}">?</div>
      </div>''' for p, w in cards)
    legend = "".join(f'<span style="font-family:{_font(kid)};font-weight:800;color:{_ink(kid)};background:#fff;padding:4px 10px;border-radius:999px;font-size:.85rem">{esc(w["en"])}</span>' for w in words)
    return (bg + header_html + mode_band(kid, "Memory Match",
        "Take turns: tap two cards. A match? Say the word and keep going. No match? Next player. Most pairs wins.",
        "You vs your teacher! Tap two cards; say the word when you find a pair. Count your pairs &mdash; can you beat the teacher?") + f'''
    <div style="position:absolute;left:0;right:0;top:214px;bottom:56px;z-index:6;display:flex;align-items:center;justify-content:center;gap:40px">
      <div id="mmBoard" style="display:grid;grid-template-columns:repeat(4,150px);gap:14px">{tiles}</div>
      <div style="width:260px;{_card(kid, "padding:14px 16px")}">
        <div style="font-size:.68rem;font-weight:800;letter-spacing:1.5px;color:#0D9488;margin-bottom:8px">WORDS TO FIND</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px">{legend}</div>
        <div style="display:flex;flex-direction:column;gap:8px">{_score_box(kid, "Player 1", "#F97316")}{_score_box(kid, "Player 2", "#0D9488")}</div>
        <div data-act-memory-done="mmBoard" style="display:none;text-align:center;font-family:{_font(kid)};font-weight:800;color:#0D9488;margin-top:10px">&#127881; All pairs found!</div>
      </div>
    </div>
    ''' + char_html)


def slide_mystery_picture(vocab, bg, header_html, kid=True, char_html=""):
    """Mystery Picture: a word picture hidden under four tiles. Tap a tile
    to peek; guess early for more points (4 tiles left = 4 points).
    'I know!' reveals everything and says the word."""
    words = _spread(vocab, 4)
    panels = ""
    for i, w in enumerate(words):
        tiles = "".join(f'<div data-act-tile onclick="LumioAct.uncover(this)" style="background:linear-gradient(135deg,{c1},{c2});cursor:pointer;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:2.4rem;transition:opacity .3s">{k}</div>'
                        for k, (c1, c2) in enumerate([("#F97316", "#FB923C"), ("#0D9488", "#2DD4BF"), ("#8B5CF6", "#A78BFA"), ("#FBBF24", "#FCD34D")], 1))
        panels += f'''
        <div id="mpPanel{i}" data-say="{esc(w['en'])}" style="display:{'none' if i else 'block'}"><div style="display:flex;flex-direction:column;align-items:center;gap:10px">
          <div style="position:relative;width:320px;height:320px;border-radius:24px;overflow:hidden;background:#fff;{_card(kid)}">
            <img src="{_img(w)}" style="position:absolute;inset:12px;width:calc(100% - 24px);height:calc(100% - 24px);object-fit:contain" onerror="this.style.display='none'">
            <div style="position:absolute;inset:0;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:3px">{tiles}</div>
          </div>
          <div style="display:flex;gap:10px">
            {_btn("&#128161; I know!", f"LumioAct.uncoverAll('mpPanel{i}'); typeof Lumio!=='undefined' && Lumio.speak && Lumio.speak({esc(_json.dumps(w['en']))})", "#0D9488", "#0B7A6F")}
          </div>
        </div></div>'''
    return (bg + header_html + mode_band(kid, "Mystery Picture",
        "Teams take turns tapping ONE tile each. Guess the word any time: 4 tiles still hidden = 4 points, 1 tile = 1 point. Wrong guess? Other team's turn.",
        "Tap one tile and guess. Early guess = more points. Say the word in English, then your teacher asks: <i>What colour is it? Do you like it?</i>") + f'''
    <div style="position:absolute;left:0;right:0;top:214px;bottom:56px;z-index:6;display:flex;align-items:center;justify-content:center;gap:40px">
      <div style="display:flex;flex-direction:column;align-items:center;gap:10px">
        <div id="mpPanels" data-idx="0">{panels}</div>
        <div style="display:flex;gap:10px;align-items:center">
          {_btn("&#9664;", "LumioAct.cycle('mpPanels',-1)", "#94A3B8", "#64748B")}
          <span data-act-counter="mpPanels" style="font-family:{_font(kid)};font-weight:800;color:{_muted(kid)}">1 / {len(words)}</span>
          {_btn("Next picture &#9654;", "LumioAct.cycle('mpPanels',1)")}
        </div>
      </div>
      <div style="width:260px;{_card(kid, "padding:14px 16px")}">
        <div style="font-size:.68rem;font-weight:800;letter-spacing:1.5px;color:#0D9488;margin-bottom:8px">POINTS</div>
        <div style="display:flex;flex-direction:column;gap:8px">{_score_box(kid, "Team A", "#F97316")}{_score_box(kid, "Team B", "#0D9488")}</div>
        <div style="font-family:{_font(kid)};font-size:.8rem;color:{_muted(kid)};font-weight:700;margin-top:10px">Tip: tap <b>+</b> once per hidden tile when the guess is right.</div>
      </div>
    </div>
    ''' + char_html)


# ---------------------------------------------------------------- TEENS --

def slide_describe_guess(vocab, bg, header_html, kid=False, char_html=""):
    """Describe It: six face-down word cards. Flip one, describe the word
    in English WITHOUT saying it (or any part of it); your partner
    guesses. 60-second timer, two scores. 1-on-1: teacher describes
    first, then swap."""
    words = _spread(vocab, 6)
    cards = "".join(f'''
      <div onclick="LumioAct.flip(this)" style="position:relative;width:170px;height:170px;border-radius:14px;overflow:hidden;cursor:pointer;{_card(kid)};transition:transform .15s">
        <div class="act-front" style="display:none;position:absolute;inset:0;background:#fff"><div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:8px">
          <img src="{_img(w)}" style="width:110px;height:110px;object-fit:contain" onerror="this.style.display='none'">
          <div style="font-family:{_font(kid)};font-weight:700;color:{_ink(kid)};font-size:.95rem">{esc(w['en'])}</div>
        </div></div>
        <div class="act-back" style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(135deg,#8B5CF6,#6D4BD6);color:#fff">
          <div style="font-size:2.6rem;font-weight:900">?</div><div style="font-size:.7rem;font-weight:800;letter-spacing:1.5px;opacity:.85">TAP TO FLIP</div>
        </div>
      </div>''' for w in words)
    return (bg + header_html + mode_band(kid, "Describe It",
        "Partner A flips a card and describes the word in English &mdash; <b>without saying it</b>. Partner B guesses. Swap after each card. 60 seconds, most cards wins.",
        "Your teacher flips a card and describes it &mdash; you guess in English. Then swap: you describe, the teacher guesses. Use a full sentence: <i>It's a place where&hellip; / You do this when&hellip;</i>") + f'''
    <div style="position:absolute;left:0;right:0;top:214px;bottom:56px;z-index:6;display:flex;align-items:center;justify-content:center;gap:34px">
      <div style="display:grid;grid-template-columns:repeat(3,170px);gap:14px">{cards}</div>
      <div style="width:250px;display:flex;flex-direction:column;gap:12px">
        <div style="{_card(kid, "padding:14px 16px;text-align:center")}">
          <div style="font-size:.68rem;font-weight:800;letter-spacing:1.5px;color:#8B5CF6;margin-bottom:8px">TIMER</div>
          {_btn("&#9201; Start 60s", "LumioAct.timer(this,60)", "#8B5CF6", "#6D4BD6", "width:100%;font-size:1.1rem")}
        </div>
        <div style="{_card(kid, "padding:14px 16px")}">
          <div style="font-size:.68rem;font-weight:800;letter-spacing:1.5px;color:#0D9488;margin-bottom:8px">SCORE</div>
          <div style="display:flex;flex-direction:column;gap:8px">{_score_box(kid, "A / You", "#F97316")}{_score_box(kid, "B / Teacher", "#0D9488")}</div>
        </div>
        <div style="font-family:{_font(kid)};font-size:.78rem;color:{_muted(kid)};font-weight:700;text-align:center">Rule: no Arabic, no spelling, no pointing &mdash; English only!</div>
      </div>
    </div>
    ''' + char_html)


def slide_story_chain(vocab, grammar_topic, bg, header_html, kid=False, char_html=""):
    """Story Chain: six word pictures in a row. Tap Next to light the next
    word; the speaker adds ONE sentence to the story using that word
    (and today's grammar pattern). Pairs/groups go round; 1-on-1 the
    student and teacher alternate."""
    words = _spread(vocab, 6)
    row = "".join(f'''
      <div data-say="{esc(w['en'])}" style="width:150px;{_card(kid, "padding:10px 8px")};display:flex;flex-direction:column;align-items:center;gap:6px;transition:transform .15s,outline .15s">
        <div style="width:96px;height:96px"><img src="{_img(w)}" style="width:100%;height:100%;object-fit:contain" onerror="this.style.display='none'"></div>
        <div style="font-family:{_font(kid)};font-weight:700;color:{_ink(kid)};font-size:.9rem;text-align:center">{esc(w['en'])}</div>
        <div style="font-size:.78rem;color:#0D9488;font-weight:800">{w.get('ar', '')}</div>
      </div>''' for w in words)
    if grammar_topic:
        ex = (grammar_topic.get("examples") or [{}])[0]
        pattern = f'''<div style="{_card(kid, "padding:12px 18px")};display:flex;align-items:center;gap:16px;max-width:760px">
          <div><div style="font-size:.68rem;font-weight:800;letter-spacing:1.5px;color:#F97316">USE TODAY'S PATTERN</div>
          <div style="font-family:{_font(kid)};font-weight:700;color:{_ink(kid)};font-size:1rem">{esc(grammar_topic.get("title", ""))}</div></div>
          <div style="border-left:2px solid #EEF0F4;padding-left:16px;font-style:italic;color:{_muted(kid)};font-weight:700;font-size:.92rem">&ldquo;{esc(ex.get("en", ""))}&rdquo;</div>
        </div>'''
    else:
        pattern = f'<div style="{_card(kid, "padding:12px 18px")};font-family:{_font(kid)};font-weight:700;color:{_ink(kid)}">Start: <i>&ldquo;One day, &hellip;&rdquo;</i> &mdash; every sentence must use the lit word.</div>'
    return (bg + header_html + mode_band(kid, "Story Chain",
        "Build one story together. Tap <b>Next word</b> &mdash; whoever's turn it is adds ONE sentence with that word. Keep the story going round the group; it must make sense!",
        "You and your teacher take turns. Teacher starts with the first word; you add the next sentence. Three times round = a whole story. Then retell it alone from the pictures.") + f'''
    <div style="position:absolute;left:0;right:0;top:214px;bottom:56px;z-index:6;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px">
      <div id="scRow" style="display:flex;gap:12px">{row}</div>
      {pattern}
      <div style="display:flex;gap:12px">
        {_btn("Next word &#9654;", "LumioAct.next('scRow')", "#F97316", "#EA580C", "font-size:1.05rem;padding:13px 30px")}
      </div>
    </div>
    ''' + char_html)


def slide_truth_or_lie(vocab, grammar_topic, bg, header_html, kid=False, char_html=""):
    """Two Truths & a Lie: Spin picks three of today's words. The speaker
    says three sentences about themselves using them (today's grammar),
    one of them false; the listener asks ONE question, then guesses the
    lie. Points for fooling your partner / catching the lie."""
    pool = "".join(f'''
      <div style="display:none;width:200px;{_card(kid, "padding:12px 10px")}"><div style="display:flex;flex-direction:column;align-items:center;gap:6px">
        <div style="width:110px;height:110px"><img src="{_img(w)}" style="width:100%;height:100%;object-fit:contain" onerror="this.style.display='none'"></div>
        <div style="font-family:{_font(kid)};font-weight:700;color:{_ink(kid)};font-size:1.05rem">{esc(w['en'])}</div>
        <div style="font-size:.8rem;color:#0D9488;font-weight:800">{w.get('ar', '')}</div>
      </div></div>''' for w in vocab)
    hint = ""
    if grammar_topic:
        hint = f'<span style="color:#F97316">Use: {esc(grammar_topic.get("title", ""))}</span> &mdash; '
    return (bg + header_html + mode_band(kid, "Two Truths &amp; a Lie",
        "Tap <b>Spin</b>: three words. Say three sentences about YOU using them &mdash; two true, one false. Your partner asks one question, then guesses the lie. Fool them = 2 points; they catch you = 1 point for them.",
        "Spin, then tell your teacher three sentences (two true, one false). The teacher asks one follow-up question and guesses. Then the teacher spins and you catch the lie!") + f'''
    <div style="position:absolute;left:0;right:0;top:214px;bottom:56px;z-index:6;display:flex;align-items:center;justify-content:center;gap:34px">
      <div style="display:flex;flex-direction:column;align-items:center;gap:16px">
        <div id="tlPool" style="display:none">{pool}</div>
        <div id="tlPicked" style="display:flex;gap:14px;min-height:190px;align-items:center">
          <div style="font-family:{_font(kid)};font-weight:700;color:#fff;opacity:.8;font-size:1.05rem">Tap Spin to get your three words &#8594;</div>
        </div>
        <div style="font-family:{_font(kid)};font-weight:700;font-size:.9rem;color:#fff;opacity:.9;text-align:center;max-width:620px">{hint}every sentence must contain one of the three words.</div>
      </div>
      <div style="width:250px;display:flex;flex-direction:column;gap:12px">
        <div style="{_card(kid, "padding:14px 16px;text-align:center")}">
          {_btn("&#127922; Spin", "LumioAct.pick('tlPool','tlPicked',3)", "#8B5CF6", "#6D4BD6", "width:100%;font-size:1.15rem")}
        </div>
        <div style="{_card(kid, "padding:14px 16px")}">
          <div style="font-size:.68rem;font-weight:800;letter-spacing:1.5px;color:#0D9488;margin-bottom:8px">SCORE</div>
          <div style="display:flex;flex-direction:column;gap:8px">{_score_box(kid, "A / You", "#F97316")}{_score_box(kid, "B / Teacher", "#0D9488")}</div>
        </div>
      </div>
    </div>
    ''' + char_html)
