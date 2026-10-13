# -*- coding: utf-8 -*-
"""
Trial class deck for Level 3 -- NOT a regular numbered lesson.

First of the 4 teen-track trials (Level 3-6). Same proven challenge
infrastructure and 4-topic "highlight reel" philosophy as the young-
track trials (Pre-A/1/2 -- see gen_trial_prea.py for the full design
history), but visually and tonally adapted for teens:
  - Reuses deck_template_teen.py's real, already-built dark/dot-grid
    theme (bg_base, header, slide_vocab, card_open, char_badge) for
    vocabulary presentation, instead of the young track's warm/cream
    deck_template_v2.py -- these are genuinely different rendering
    systems, not just a palette swap, so vocab slides call straight
    into the teen module's own slide_vocab rather than reimplementing it.
  - Custom challenge slides (welcome, team-assign, buzzer, relay,
    copycat, scoreboard, finale) are built fresh for this file, styled
    with the same dark/purple/dot-grid look and the teen character
    cast (Omar, Sara, Noor, Ziad, Hamad) instead of Lumi solo.
  - Points display as "+XP" using deck_template_teen.py's own xp_pill,
    matching the Stars-to-XP convention already established on the
    Level 3-6 student dashboard.

Content pulled entirely from real Level 3 lessons -- Meet the Crew (all
8 words), My Room (6 words), Can You Skate? (6 words, several of them
naturally physical -- great for the Copy-Cat round), and Around School
(6 words).
"""
import sys, os, json
sys.path.insert(0, "lib")
from deck_template_teen import (
    bg_base, header, slide_vocab, card_open, char_badge, xp_pill,
    CHAR, esc, slug, PURPLE, PURPLE_DEEP, ORANGE, ORANGE_DEEP, TEAL, TEAL_DEEP,
    CARD_BG, CARD_TEXT, INK, INK_DIM, MEET_THE_SQUAD_CAST,
)
import deck_template_teen2
import trial_enrich as TE
import trial_recap as TR
import trial_common as TC
from deck_template_teen2 import bg_theme

TOTAL = 47


def load_word(level, lesson_num, en):
    with open(f"lessons/{level}/lesson{lesson_num:02d}.json", encoding="utf-8") as f:
        d = json.load(f)
    for v in d["vocab"]:
        if v["en"] == en:
            return TR.remember_word(v)
    raise ValueError(f"{en} not found in {level} lesson {lesson_num}")


def name_chips_html():
    return f'<div id="trialNames" style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:18px;max-width:640px"></div>'


def slide_trial_welcome(n, total):
    cast_row = "".join(
        f'<img src="{CHAR}/{img}.png" style="height:170px" title="{name}">'
        for img, name, _ in MEET_THE_SQUAD_CAST
    )
    return (bg_theme() + f'''
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 30px;z-index:5">
      <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:1.05rem;color:{ORANGE};letter-spacing:2px;margin-bottom:14px">TRIAL CLASS</div>
      <h1 style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:2.9rem;color:{INK};margin:0 0 10px">
        Welcome to the Crew! &#127881;
      </h1>
      <div style="font-family:'Fredoka',sans-serif;font-weight:500;font-size:1.25rem;color:{INK_DIM};margin-bottom:14px">
        Today we're going to have SO much fun with English &mdash; are you ready?
      </div>
      {name_chips_html()}
      <div style="display:flex;gap:6px;margin-top:16px;align-items:flex-end">{cast_row}</div>
    </div>
    ''')


def slide_trial_transition(headline, emoji, n, total):
    return (bg_theme() + header("Trial Class", n, total) + f'''
    <div style="position:relative;z-index:5;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:60px 40px 0">
      <div style="font-size:3.6rem;margin-bottom:18px">{emoji}</div>
      <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:2.1rem;color:{INK};max-width:900px">{headline}</div>
    </div>
    ''' + char_badge("omar-teen-explain"))


def slide_mini_celebrate(headline, n, total):
    return (bg_theme() + header("Trial Class", n, total) + f'''
    <div style="position:relative;z-index:5;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:50px 40px 0">
      <div style="font-size:3rem;margin-bottom:10px">&#127775;</div>
      <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:1.9rem;color:{INK}">{headline}</div>
    </div>
    ''' + char_badge("sara-teen-thumbs"))


def slide_team_assign(n, total):
    return (bg_theme() + header("Let's Make Teams!", n, total) + f'''
    <div data-challenge="team-assign" style="position:relative;z-index:5;display:flex;flex-direction:column;align-items:center;padding:30px 40px 0;text-align:center">
      <div style="font-family:'Fredoka',sans-serif;font-weight:500;font-size:1.05rem;color:{INK_DIM};margin-bottom:16px">
        Tap any name to move it to the other team!
      </div>
      <div style="display:flex;gap:30px;width:100%;justify-content:center">
        {card_open(300, "padding:16px 18px")}
          <div style="font-family:'Fredoka',sans-serif;font-weight:600;color:{ORANGE};font-size:1.1rem;margin-bottom:10px">&#9728;&#65039; Team Sun</div>
          <div id="teamAList" style="display:flex;flex-wrap:wrap;justify-content:center"></div>
        </div>
        {card_open(300, "padding:16px 18px")}
          <div style="font-family:'Fredoka',sans-serif;font-weight:600;color:{PURPLE};font-size:1.1rem;margin-bottom:10px">&#11088; Team Star</div>
          <div id="teamBList" style="display:flex;flex-wrap:wrap;justify-content:center"></div>
        </div>
      </div>
    </div>
    ''' + char_badge("noor-teen-point"))


def slide_buzzer_challenge(prompt_word, n, total):
    return (bg_theme() + header("Buzzer Challenge", n, total) + f'''
    <div data-challenge="buzzer" style="position:relative;z-index:5;display:flex;flex-direction:column;align-items:center;padding:28px 40px 0">
      <div style="font-family:'Fredoka',sans-serif;font-weight:500;font-size:1rem;color:{INK_DIM};margin-bottom:14px;text-align:center">
        Who says the English word first? Tap the word to check, then tap the winner&#39;s name!
      </div>
      {card_open(280, "padding:18px;text-align:center;margin-bottom:16px")}
        <div style="width:110px;height:110px;border-radius:12px;overflow:hidden;background:#F8FAFC;margin:0 auto 8px">
          <img src="assets/vocab/{slug(prompt_word.get("image") or prompt_word["en"])}.png" style="width:100%;height:100%;object-fit:contain" onerror="this.style.display='none'">
        </div>
        <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:1.3rem;color:{CARD_TEXT}"><span onclick="this.style.filter='none'" title="Tap to check" style="filter:blur(11px);cursor:pointer;user-select:none">{esc(prompt_word["en"])}</span></div>
        <div style="font-family:'Tajawal',sans-serif;font-weight:700;font-size:.95rem;color:{TEAL_DEEP}">{esc(prompt_word["ar"])}</div>
      </div>
      <div id="pickerZone" style="display:flex;flex-wrap:wrap;justify-content:center;max-width:900px"></div>
    </div>
    ''' + char_badge("ziad-teen-thumbs"))


def slide_team_relay(prompt_word, question_line, n, total):
    return (bg_theme() + header("Team Relay!", n, total) + f'''
    <div data-challenge="team-relay" style="position:relative;z-index:5;display:flex;flex-direction:column;align-items:center;padding:26px 40px 0;text-align:center">
      <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:1.25rem;color:{INK};margin-bottom:10px">{question_line}</div>
      {card_open(240, "padding:14px;margin-bottom:12px")}
        <div style="width:90px;height:90px;border-radius:10px;overflow:hidden;background:#F8FAFC;margin:0 auto 6px">
          <img src="assets/vocab/{slug(prompt_word.get("image") or prompt_word["en"])}.png" style="width:100%;height:100%;object-fit:contain" onerror="this.style.display='none'">
        </div>
        <div style="font-family:'Tajawal',sans-serif;font-weight:700;font-size:.9rem;color:{TEAL_DEEP}">{esc(prompt_word["ar"])}</div>
      </div>
      <div style="font-family:'Fredoka',sans-serif;font-weight:500;font-size:.95rem;color:{INK_DIM};margin-bottom:16px">
        Call on one player from each team &mdash; whoever's team answers first taps their team below!
      </div>
      <div id="teamZone" style="display:flex;gap:20px"></div>
    </div>
    ''' + char_badge("hamad-teen-wave"))


def slide_copycat_challenge(action_line, n, total):
    return (bg_theme() + header("Copy-Cat Challenge", n, total) + f'''
    <div data-challenge="copycat" style="position:relative;z-index:5;display:flex;flex-direction:column;align-items:center;padding:34px 40px 0;text-align:center">
      <div style="font-size:2.4rem;margin-bottom:10px">&#127942;</div>
      <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:1.4rem;color:{INK};max-width:800px;margin-bottom:8px">{action_line}</div>
      <div style="font-family:'Fredoka',sans-serif;font-weight:500;font-size:.95rem;color:{INK_DIM};margin-bottom:18px">Pick two students to go head-to-head &mdash; tap whoever did it best!</div>
      <div id="pickerZone" style="display:flex;flex-wrap:wrap;justify-content:center;max-width:900px"></div>
    </div>
    ''' + char_badge("omar-teen-celebrate"))


def slide_scoreboard(headline, n, total):
    return (bg_theme() + f'''
    <div data-challenge="scoreboard" style="position:relative;z-index:5;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding-top:120px">
      <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:1.5rem;color:{INK};margin-bottom:24px">{headline}</div>
      <div id="scoreboardBig"></div>
    </div>
    ''')


def slide_finale(n, total):
    return (bg_theme() + header("Class Champions!", n, total) + f'''
    <div data-challenge="finale" style="position:relative;z-index:5;display:flex;flex-direction:column;align-items:center;padding:22px 40px 0">
      <div style="font-family:'Fredoka',sans-serif;font-weight:500;font-size:.95rem;color:{INK_DIM};margin-bottom:14px;text-align:center">
        Everyone did great today! Pick a name for each shout-out:
      </div>
      <div id="finaleZone" style="width:560px"></div>
    </div>
    ''' + char_badge("noor-teen-welcome"))


def slide_trial_finish(n, total):
    return (bg_theme() + f'''
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 30px;z-index:5">
      <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:1rem;color:{TEAL};letter-spacing:2px;margin-bottom:10px">GREAT JOB TODAY</div>
      <h1 style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:2.5rem;color:{INK};margin:0 0 6px">
        You're all naturals! &#11088;
      </h1>
      {name_chips_html()}
      <div style="font-family:'Fredoka',sans-serif;font-weight:500;font-size:1.05rem;color:{INK_DIM};margin:18px 0 22px;max-width:800px">
        The crew, your room, new skills, and school life &mdash; all in one class! This is just a taste
        of the full level: 24 live classes (20 lessons + 4 Bonus Classes) in about 3 months.
      </div>
      {card_open(None, "padding:14px 28px")}
        <span style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:.95rem;color:{CARD_TEXT}">&#128172; Ask your teacher about starting the full course today!</span>
      </div>
    </div>
    ''')


# Built on this level's lessons 1-3 (lib/trial_teen.py has the shared structure).
SPEC = dict(
    l1_words=["hang out", "chat", "text", "laugh", "group chat"],
    checks=[("We ___ out after school.", "hang", ["hang", "hangs", "hanging", "to hang"]),
            ("She ___ basketball every week.", "plays", ["plays", "play", "playing", "is play"]),
            ("I ___ like boring movies.", "don't", ["don't", "doesn't", "not", "am not"])],
    trio=["We chat in the group chat.", "She plays football every day.", "I don't like boring shows."],
    more_words=[(2, "plays"), (2, "watches"), (2, "practices"), (3, "boring"), (3, "awesome")],
    relay_q="What does she do every week? Say a full sentence!")


def _build():
    import trial_teen
    return trial_teen.build(sys.modules[__name__], "level3", SPEC)


def build():
    def _set(t):
        global TOTAL
        TOTAL = t
    slides = TR.two_pass_build(_build, _set, TOTAL)

    out_dir = "slide-content/trial/level3"
    os.makedirs(out_dir, exist_ok=True)
    for f in os.listdir(out_dir):
        os.remove(os.path.join(out_dir, f))
    for i, html in enumerate(slides, start=1):
        with open(f"{out_dir}/slide-{i:02d}.html", "w", encoding="utf-8") as f:
            f.write(html)
    print(f"Wrote {len(slides)} trial slides to {out_dir}/")


if __name__ == "__main__":
    build()
    # 1-on-1 variant: same content, group-only slides swapped (lib/trial_solo.py)
    import trial_solo
    trial_solo.build(sys.modules[__name__], "level3")
