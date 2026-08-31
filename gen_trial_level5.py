# -*- coding: utf-8 -*-
"""
Trial class deck for Level 5 -- NOT a regular numbered lesson.

Same teen-theme infrastructure as Level 3/4 (see those files, and
gen_trial_prea.py, for the full design history). Adapted to Level 5's
own real content: What I Did This Weekend (6 past-tense action verbs
-- great fit for Copy-Cat, since "acting out what you did" is a
natural match for past-tense practice), The Big Trip (4 words), The
Party (4 words), and How I Felt (3 feeling words).
"""
import sys, os, json
sys.path.insert(0, "lib")
from deck_template_teen import (
    bg_base, header, slide_vocab, card_open, char_badge, xp_pill,
    CHAR, esc, slug, PURPLE, PURPLE_DEEP, ORANGE, ORANGE_DEEP, TEAL, TEAL_DEEP,
    CARD_BG, CARD_TEXT, INK, INK_DIM, MEET_THE_SQUAD_CAST,
)

TOTAL = 31


def load_word(level, lesson_num, en):
    with open(f"lessons/{level}/lesson{lesson_num:02d}.json", encoding="utf-8") as f:
        d = json.load(f)
    for v in d["vocab"]:
        if v["en"] == en:
            return v
    raise ValueError(f"{en} not found in {level} lesson {lesson_num}")


def name_chips_html():
    return f'<div id="trialNames" style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:18px;max-width:640px"></div>'


def slide_trial_welcome(n, total):
    cast_row = "".join(
        f'<img src="{CHAR}/{img}.png" style="height:170px" title="{name}">'
        for img, name, _ in MEET_THE_SQUAD_CAST
    )
    return (bg_base() + f'''
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 30px;z-index:5">
      <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:1.05rem;color:{ORANGE};letter-spacing:2px;margin-bottom:14px">TRIAL CLASS</div>
      <h1 style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:2.9rem;color:{INK};margin:0 0 10px">
        Welcome, everyone! &#127881;
      </h1>
      <div style="font-family:'Fredoka',sans-serif;font-weight:500;font-size:1.25rem;color:{INK_DIM};margin-bottom:14px">
        Today we're going to have SO much fun with English &mdash; are you ready?
      </div>
      {name_chips_html()}
      <div style="display:flex;gap:6px;margin-top:16px;align-items:flex-end">{cast_row}</div>
    </div>
    ''')


def slide_trial_transition(headline, emoji, n, total):
    return (bg_base() + header("Trial Class", n, total) + f'''
    <div style="position:relative;z-index:5;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:60px 40px 0">
      <div style="font-size:3.6rem;margin-bottom:18px">{emoji}</div>
      <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:2.1rem;color:{INK};max-width:900px">{headline}</div>
    </div>
    ''' + char_badge("omar-teen-explain"))


def slide_mini_celebrate(headline, n, total):
    return (bg_base() + header("Trial Class", n, total) + f'''
    <div style="position:relative;z-index:5;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:50px 40px 0">
      <div style="font-size:3rem;margin-bottom:10px">&#127775;</div>
      <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:1.9rem;color:{INK}">{headline}</div>
    </div>
    ''' + char_badge("sara-teen-thumbs"))


def slide_team_assign(n, total):
    return (bg_base() + header("Let's Make Teams!", n, total) + f'''
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
    return (bg_base() + header("Buzzer Challenge", n, total) + f'''
    <div data-challenge="buzzer" style="position:relative;z-index:5;display:flex;flex-direction:column;align-items:center;padding:28px 40px 0">
      <div style="font-family:'Fredoka',sans-serif;font-weight:500;font-size:1rem;color:{INK_DIM};margin-bottom:14px;text-align:center">
        Who says it first? Tap the name of whoever answers correctly!
      </div>
      {card_open(280, "padding:18px;text-align:center;margin-bottom:16px")}
        <div style="width:110px;height:110px;border-radius:12px;overflow:hidden;background:#F8FAFC;margin:0 auto 8px">
          <img src="assets/vocab/{slug(prompt_word["en"])}.png" style="width:100%;height:100%;object-fit:contain" onerror="this.style.display='none'">
        </div>
        <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:1.3rem;color:{CARD_TEXT}">{esc(prompt_word["en"])}</div>
        <div style="font-family:'Tajawal',sans-serif;font-weight:700;font-size:.95rem;color:{TEAL_DEEP}">{esc(prompt_word["ar"])}</div>
      </div>
      <div id="pickerZone" style="display:flex;flex-wrap:wrap;justify-content:center;max-width:900px"></div>
    </div>
    ''' + char_badge("ziad-teen-thumbs"))


def slide_team_relay(prompt_word, question_line, n, total):
    return (bg_base() + header("Team Relay!", n, total) + f'''
    <div data-challenge="team-relay" style="position:relative;z-index:5;display:flex;flex-direction:column;align-items:center;padding:26px 40px 0;text-align:center">
      <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:1.25rem;color:{INK};margin-bottom:10px">{question_line}</div>
      {card_open(240, "padding:14px;margin-bottom:12px")}
        <div style="width:90px;height:90px;border-radius:10px;overflow:hidden;background:#F8FAFC;margin:0 auto 6px">
          <img src="assets/vocab/{slug(prompt_word["en"])}.png" style="width:100%;height:100%;object-fit:contain" onerror="this.style.display='none'">
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
    return (bg_base() + header("Copy-Cat Challenge", n, total) + f'''
    <div data-challenge="copycat" style="position:relative;z-index:5;display:flex;flex-direction:column;align-items:center;padding:34px 40px 0;text-align:center">
      <div style="font-size:2.4rem;margin-bottom:10px">&#127942;</div>
      <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:1.4rem;color:{INK};max-width:800px;margin-bottom:8px">{action_line}</div>
      <div style="font-family:'Fredoka',sans-serif;font-weight:500;font-size:.95rem;color:{INK_DIM};margin-bottom:18px">Pick two students to go head-to-head &mdash; tap whoever did it best!</div>
      <div id="pickerZone" style="display:flex;flex-wrap:wrap;justify-content:center;max-width:900px"></div>
    </div>
    ''' + char_badge("omar-teen-celebrate"))


def slide_scoreboard(headline, n, total):
    return (bg_base() + f'''
    <div data-challenge="scoreboard" style="position:relative;z-index:5;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding-top:120px">
      <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:1.5rem;color:{INK};margin-bottom:24px">{headline}</div>
      <div id="scoreboardBig"></div>
    </div>
    ''')


def slide_finale(n, total):
    return (bg_base() + header("Class Champions!", n, total) + f'''
    <div data-challenge="finale" style="position:relative;z-index:5;display:flex;flex-direction:column;align-items:center;padding:22px 40px 0">
      <div style="font-family:'Fredoka',sans-serif;font-weight:500;font-size:.95rem;color:{INK_DIM};margin-bottom:14px;text-align:center">
        Everyone did great today! Pick a name for each shout-out:
      </div>
      <div id="finaleZone" style="width:560px"></div>
    </div>
    ''' + char_badge("noor-teen-welcome"))


def slide_trial_finish(n, total):
    return (bg_base() + f'''
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 30px;z-index:5">
      <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:1rem;color:{TEAL};letter-spacing:2px;margin-bottom:10px">GREAT JOB TODAY</div>
      <h1 style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:2.5rem;color:{INK};margin:0 0 6px">
        You're all naturals! &#11088;
      </h1>
      {name_chips_html()}
      <div style="font-family:'Fredoka',sans-serif;font-weight:500;font-size:1.05rem;color:{INK_DIM};margin:18px 0 22px;max-width:800px">
        Your weekend, a big trip, a party, and your feelings &mdash; all in one class! This is just a taste
        of the 140 lessons and 7 levels waiting on the full Lumio adventure.
      </div>
      {card_open(None, "padding:14px 28px")}
        <span style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:.95rem;color:{CARD_TEXT}">&#128172; Ask your teacher about starting the full course today!</span>
      </div>
    </div>
    ''')


def build():
    slides = []

    slides.append(slide_trial_welcome(1, TOTAL))
    slides.append(slide_team_assign(len(slides) + 1, TOTAL))

    weekend_words = [load_word("level5", 1, w) for w in ["played", "watched", "walked", "helped", "cleaned", "cooked"]]
    for w in weekend_words:
        slides.append(slide_vocab(w, 0, len(slides) + 1, TOTAL, 1, "noor-teen-point"))

    slides.append(slide_copycat_challenge("Who can act out \u201ccooked\u201d the best? Show me!", len(slides) + 1, TOTAL))
    slides.append(slide_copycat_challenge("Who can act out \u201ccleaned\u201d the best? Show me!", len(slides) + 1, TOTAL))
    slides.append(slide_team_relay(weekend_words[1], "What did they do this weekend?", len(slides) + 1, TOTAL))
    slides.append(slide_mini_celebrate("You're all Weekend Story Experts!", len(slides) + 1, TOTAL))

    slides.append(slide_trial_transition("Let's talk about a big trip!", "&#9992;&#65039;", len(slides) + 1, TOTAL))
    trip_words = [load_word("level5", 12, w) for w in ["packed", "flew", "suitcase", "airport"]]
    for w in trip_words:
        slides.append(slide_vocab(w, 0, len(slides) + 1, TOTAL, 1, "hamad-teen-wave"))
    slides.append(slide_buzzer_challenge(trip_words[2], len(slides) + 1, TOTAL))
    slides.append(slide_scoreboard("Halfway there! Here's the score so far...", len(slides) + 1, TOTAL))

    slides.append(slide_trial_transition("Let's throw a party!", "&#127881;", len(slides) + 1, TOTAL))
    party_words = [load_word("level5", 14, w) for w in ["guests", "cake", "gifts"]]
    for w in party_words:
        slides.append(slide_vocab(w, 0, len(slides) + 1, TOTAL, 1, "sara-teen-explain"))
    slides.append(slide_buzzer_challenge(party_words[1], len(slides) + 1, TOTAL))
    slides.append(slide_mini_celebrate("You're all Party Planners!", len(slides) + 1, TOTAL))

    for w_en in ["proud", "nervous", "surprised"]:
        slides.append(slide_vocab(load_word("level5", 9, w_en), 0, len(slides) + 1, TOTAL, 1, "ziad-teen-happy"))

    slides.append(slide_scoreboard("And the final score is...", len(slides) + 1, TOTAL))
    slides.append(slide_finale(len(slides) + 1, TOTAL))
    slides.append(slide_trial_finish(len(slides) + 1, TOTAL))

    assert len(slides) == TOTAL, f"expected {TOTAL} slides, built {len(slides)}"

    out_dir = "slide-content/trial/level5"
    os.makedirs(out_dir, exist_ok=True)
    for f in os.listdir(out_dir):
        os.remove(os.path.join(out_dir, f))
    for i, html in enumerate(slides, start=1):
        with open(f"{out_dir}/slide-{i:02d}.html", "w", encoding="utf-8") as f:
            f.write(html)
    print(f"Wrote {len(slides)} trial slides to {out_dir}/")


if __name__ == "__main__":
    build()
