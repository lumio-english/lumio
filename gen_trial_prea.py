# -*- coding: utf-8 -*-
"""
Trial class deck for Pre-A -- NOT a regular numbered lesson.

v2 revisions from the first prototype, per Eslam's direct feedback:
  - Group sessions, up to 4 students at once (not 1-on-1) -- welcome and
    finish slides now address a name list, and one interactive slide
    (slide_teacher_game, mode="group"/"student") is built specifically
    for a room of kids rather than a single learner.
  - Sized for a real 30-minute class. A real Pre-A lesson's own deck
    averages ~41 slides for its class -- this trial now targets the same
    range (43) instead of a shortened 15, by using each source lesson's
    FULL word list instead of a 2-3 word sample, and by adding a 5th
    content topic (Family) plus a second interactive-game format for
    variety across the longer runtime.

Content is still pulled entirely from real Pre-A lessons -- Hello!,
Animals Part 1, Colors Part 1, My Family, Actions -- per Eslam's
instruction that trial material comes from the real basic-class
materials, nothing invented.

Flow (fixed "beats": instant win -> highlight reel -> interactive win ->
celebration -> repeat per topic -> big finish):
  1.     Custom group welcome
  2-7.   Hello! (all 6 words) -- instant win, words they mostly know already
  8.     Transition: "meet some animal friends!"
  9-14.  Animals (all 6 words) -- highlight reel
  15-16. slide_quick_check x2 (tier=preA) -- picture-picking game, two rounds
  17.    slide_teacher_game (mode="group") -- whole room points together
  18.    Celebration: "Animal Experts!"
  19.    Transition: "let's paint with colors!"
  20-23. Colors (all 4 words)
  24.    slide_quick_check -- colors
  25.    Celebration: "Color Champions!"
  26.    Transition: "let's meet my family!"
  27-30. Family (mom, dad, brother, sister)
  31.    slide_teacher_game (mode="student") -- turn-taking, one child calls it
  32.    Celebration: "Family Friend!"
  33.    Transition: "let's move like Lumi!"
  34-39. slide_tpr_activity x6 -- run, jump, sit, stand, clap, sing
  40-41. slide_vocab x2 -- song, playground (remaining Actions words)
  42.    Mini celebration: "Super Movers!"
  43.    Big group finish + parent-facing enrollment note
"""
import sys, os, json
sys.path.insert(0, "lib")
from deck_template_v2 import (
    bg_plain, bg_study, bg_clean, header, COLORSTRIP, SPARKS, char_img,
    slide_vocab, slide_quick_check, slide_tpr_activity, slide_teacher_game, esc, slug,
)

TOTAL = 44


def load_word(level, lesson_num, en):
    with open(f"lessons/{level}/lesson{lesson_num:02d}.json", encoding="utf-8") as f:
        d = json.load(f)
    for v in d["vocab"]:
        if v["en"] == en:
            return v
    raise ValueError(f"{en} not found in {level} lesson {lesson_num}")


def name_chips_html():
    # Constrained + wrap so a longer roster drops to a second row instead
    # of running under Lumi's image on the right (that overlap was a real
    # bug Eslam caught -- Omar's chip was getting hidden behind the
    # character). The width limit here works together with the narrower
    # text column in slide_trial_welcome/finish below.
    return '<div id="trialNames" style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:18px;max-width:640px"></div>'


def slide_trial_welcome(n, total):
    return (bg_plain() + SPARKS + f'''
    <div style="position:absolute;top:0;left:0;bottom:0;right:560px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 20px">
      <div style="font-size:1.1rem;font-weight:800;color:#F97316;letter-spacing:2px;margin-bottom:14px">TRIAL CLASS</div>
      <h1 style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:2.7rem;color:#43301F;margin:0 0 6px">
        Welcome, friends! &#127881;
      </h1>
      <div style="font-family:'Baloo 2',sans-serif;font-weight:700;font-size:1.25rem;color:#8A7160;margin-bottom:6px">
        Today we're going to have SO much fun with English &mdash; are you ready?
      </div>
      {name_chips_html()}
    </div>
    ''' + char_img("lumi-hero", right=460, bottom=30, height=320))


def slide_trial_transition(headline, emoji, n, total):
    return (bg_study() + header("Trial Class", n, total) + COLORSTRIP + f'''
    <div style="position:absolute;inset:0;top:60px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">
      <div style="font-size:4rem;margin-bottom:20px">{emoji}</div>
      <div style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:2.4rem;color:#43301F;max-width:900px">{headline}</div>
    </div>
    ''' + char_img("lumi-celebrate", bottom=40, height=290))


def slide_team_assign(n, total):
    return (bg_study() + header("Let's Make Teams!", n, total) + COLORSTRIP + f'''
    <div data-challenge="team-assign" style="position:absolute;inset:0;top:150px;display:flex;flex-direction:column;align-items:center">
      <div style="font-family:'Baloo 2',sans-serif;font-weight:700;font-size:1.1rem;color:#8A7160;margin-bottom:16px;text-align:center">
        Tap any name to move it to the other team!
      </div>
      <div style="display:flex;gap:40px;width:100%;justify-content:center">
        <div style="background:#fff;border-radius:18px;padding:16px 22px;min-width:280px;box-shadow:0 8px 20px rgba(67,48,31,.1)">
          <div style="font-family:'Baloo 2',sans-serif;font-weight:800;color:#F97316;font-size:1.2rem;margin-bottom:10px;text-align:center">&#9728;&#65039; Team Sun</div>
          <div id="teamAList" style="display:flex;flex-wrap:wrap;justify-content:center"></div>
        </div>
        <div style="background:#fff;border-radius:18px;padding:16px 22px;min-width:280px;box-shadow:0 8px 20px rgba(67,48,31,.1)">
          <div style="font-family:'Baloo 2',sans-serif;font-weight:800;color:#8B5CF6;font-size:1.2rem;margin-bottom:10px;text-align:center">&#11088; Team Star</div>
          <div id="teamBList" style="display:flex;flex-wrap:wrap;justify-content:center"></div>
        </div>
      </div>
    </div>
    ''' + char_img("lumi-celebrate", right=40, bottom=20, height=150))


def slide_buzzer_challenge(prompt_word, n, total):
    return (bg_clean() + header("Buzzer Challenge", n, total) + COLORSTRIP + f'''
    <div data-challenge="buzzer" style="position:absolute;inset:0;top:120px;display:flex;flex-direction:column;align-items:center">
      <div style="font-family:'Baloo 2',sans-serif;font-weight:700;font-size:1.05rem;color:#8A7160;margin-bottom:8px;text-align:center">
        Who says it first? Tap the name of whoever answers correctly!
      </div>
      <div style="background:#fff;border-radius:20px;padding:14px 34px;box-shadow:0 10px 24px rgba(67,48,31,.12);margin-bottom:16px;text-align:center">
        <div style="width:130px;height:130px;border-radius:14px;overflow:hidden;background:#FFFCF6;border:3px solid #FFE0B8;margin:0 auto 8px">
          <img src="assets/vocab/{slug(prompt_word["en"])}.png" style="width:100%;height:100%;object-fit:contain" onerror="this.style.display='none'">
        </div>
        <div style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.4rem;color:#43301F">{esc(prompt_word["en"])}</div>
        <div style="font-family:'Tajawal',sans-serif;font-weight:700;font-size:1rem;color:#8A7160">{esc(prompt_word["ar"])}</div>
      </div>
      <div id="pickerZone" style="display:flex;flex-wrap:wrap;justify-content:center;max-width:900px"></div>
    </div>
    ''' + char_img("lumi-hero", right=40, bottom=20, height=140))


def slide_team_relay(prompt_word, question_line, n, total):
    return (bg_study() + header("Team Relay!", n, total) + COLORSTRIP + f'''
    <div data-challenge="team-relay" style="position:absolute;inset:0;top:120px;display:flex;flex-direction:column;align-items:center;text-align:center">
      <div style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.3rem;color:#43301F;margin-bottom:10px">{question_line}</div>
      <div style="background:#fff;border-radius:20px;padding:12px 30px;box-shadow:0 10px 24px rgba(67,48,31,.12);margin-bottom:14px">
        <div style="width:110px;height:110px;border-radius:14px;overflow:hidden;background:#FFFCF6;border:3px solid #FFE0B8;margin:0 auto 6px">
          <img src="assets/vocab/{slug(prompt_word["en"])}.png" style="width:100%;height:100%;object-fit:contain" onerror="this.style.display='none'">
        </div>
        <div style="font-family:'Tajawal',sans-serif;font-weight:700;font-size:.95rem;color:#8A7160">{esc(prompt_word["ar"])}</div>
      </div>
      <div style="font-family:'Baloo 2',sans-serif;font-weight:700;font-size:.95rem;color:#8A7160;margin-bottom:16px">
        Call on one player from each team &mdash; whoever's team answers first taps their team below!
      </div>
      <div id="teamZone" style="display:flex;gap:20px"></div>
    </div>
    ''' + char_img("lumi-celebrate", right=40, bottom=20, height=130))


def slide_copycat_challenge(action_line, n, total):
    return (bg_clean() + header("Copy-Cat Challenge", n, total) + COLORSTRIP + f'''
    <div data-challenge="copycat" style="position:absolute;inset:0;top:130px;display:flex;flex-direction:column;align-items:center;text-align:center">
      <div style="font-size:2.6rem;margin-bottom:10px">&#127942;</div>
      <div style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.5rem;color:#43301F;max-width:800px;margin-bottom:8px">{action_line}</div>
      <div style="font-family:'Baloo 2',sans-serif;font-weight:700;font-size:1rem;color:#8A7160;margin-bottom:18px">Pick two students to go head-to-head &mdash; tap whoever did it best!</div>
      <div id="pickerZone" style="display:flex;flex-wrap:wrap;justify-content:center;max-width:900px"></div>
    </div>
    ''' + char_img("lumi-hero", right=40, bottom=20, height=150))


def slide_scoreboard(headline, n, total):
    return (bg_plain() + SPARKS + f'''
    <div data-challenge="scoreboard" style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
      <div style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.6rem;color:#43301F;margin-bottom:24px">{headline}</div>
      <div id="scoreboardBig"></div>
    </div>
    ''')


def slide_finale(n, total):
    return (bg_clean() + header("Class Champions!", n, total) + COLORSTRIP + f'''
    <div data-challenge="finale" style="position:absolute;inset:0;top:120px;display:flex;flex-direction:column;align-items:center">
      <div style="font-family:'Baloo 2',sans-serif;font-weight:700;font-size:1rem;color:#8A7160;margin-bottom:14px;text-align:center">
        Everyone did great today! Pick a name for each shout-out:
      </div>
      <div id="finaleZone" style="width:560px"></div>
    </div>
    ''' + char_img("lumi-celebrate", right=40, bottom=10, height=140))


def slide_mini_celebrate(headline, n, total):
    return (bg_clean() + header("Trial Class", n, total) + COLORSTRIP + SPARKS + f'''
    <div style="position:absolute;inset:0;top:40px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">
      <div style="font-size:3.4rem;margin-bottom:10px">&#127775;</div>
      <div style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:2.2rem;color:#43301F">{headline}</div>
    </div>
    ''' + char_img("lumi-thumbs", bottom=40, height=280))


def slide_trial_finish(n, total):
    return (bg_plain() + SPARKS + f'''
    <div style="position:absolute;top:0;left:0;bottom:0;right:380px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 20px">
      <div style="font-size:1rem;font-weight:800;color:#0D9488;letter-spacing:2px;margin-bottom:10px">GREAT JOB TODAY</div>
      <h1 style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:2.3rem;color:#43301F;margin:0 0 4px">
        You're all naturals! &#11088;
      </h1>
      {name_chips_html()}
      <div style="font-family:'Baloo 2',sans-serif;font-weight:700;font-size:1.05rem;color:#8A7160;margin:16px 0 22px">
        Hello, animals, colors, family, and moving in English &mdash; all in one class! This is just a taste
        of the 140 lessons and 7 levels waiting on the full Lumio adventure.
      </div>
      <div style="background:#fff;border-radius:18px;padding:14px 26px;box-shadow:0 12px 26px rgba(67,48,31,.18);
                  font-family:'Baloo 2',sans-serif;font-weight:700;font-size:.95rem;color:#43301F">
        &#128172; Ask your teacher about starting the full course today!
      </div>
    </div>
    ''' + char_img("lumi-celebrate", right=60, bottom=20, height=250))


def build():
    slides = []

    slides.append(slide_trial_welcome(1, TOTAL))
    slides.append(slide_team_assign(len(slides) + 1, TOTAL))

    for w_en in ["hello", "hi", "good morning", "good night", "goodbye", "thank you"]:
        slides.append(slide_vocab(load_word("pre-a", 1, w_en), 0, len(slides) + 1, TOTAL, 1, "lumi-hero"))

    slides.append(slide_trial_transition("Let's meet some animal friends!", "&#128062;", len(slides) + 1, TOTAL))

    animal_words = [load_word("pre-a", 12, w) for w in ["cat", "dog", "bird", "fish", "rabbit", "duck"]]
    for w in animal_words:
        slides.append(slide_vocab(w, 0, len(slides) + 1, TOTAL, 1, "lumi-hero"))

    slides.append(slide_buzzer_challenge(animal_words[0], len(slides) + 1, TOTAL))
    slides.append(slide_buzzer_challenge(animal_words[3], len(slides) + 1, TOTAL))
    slides.append(slide_team_relay(animal_words[5], "Which animal is this?", len(slides) + 1, TOTAL))
    slides.append(slide_mini_celebrate("You're all Animal Experts!", len(slides) + 1, TOTAL))

    slides.append(slide_trial_transition("Let's paint with colors!", "&#127752;", len(slides) + 1, TOTAL))
    color_words = [load_word("pre-a", 8, w) for w in ["red", "blue", "yellow", "green"]]
    for w in color_words:
        slides.append(slide_vocab(w, 0, len(slides) + 1, TOTAL, 1, "lumi-hero"))
    slides.append(slide_buzzer_challenge(color_words[1], len(slides) + 1, TOTAL))
    slides.append(slide_scoreboard("Halfway there! Here's the score so far...", len(slides) + 1, TOTAL))

    slides.append(slide_trial_transition("Let's meet my family!", "&#128106;", len(slides) + 1, TOTAL))
    family_words = [load_word("pre-a", 10, w) for w in ["mom", "dad", "brother", "sister"]]
    for w in family_words:
        slides.append(slide_vocab(w, 0, len(slides) + 1, TOTAL, 1, "lumi-hero"))
    slides.append(slide_team_relay(family_words[0], "Who is this?", len(slides) + 1, TOTAL))
    slides.append(slide_mini_celebrate("You're a Family Friend!", len(slides) + 1, TOTAL))

    slides.append(slide_trial_transition("Let's move like Lumi!", "&#127939;", len(slides) + 1, TOTAL))
    unison_tpr = {
        "sit": "Sit down quickly! Say \u201cSit!\u201d &#128994;",
        "stand": "Now stand back up! Say \u201cStand!\u201d &#128993;",
        "sing": "Everyone sing \u201cLa la la!\u201d together! &#127925;",
    }
    for w_en, line in unison_tpr.items():
        slides.append(slide_tpr_activity(line, len(slides) + 1, TOTAL, "lumi-hero"))

    slides.append(slide_copycat_challenge("Who can run in place the best? Ready, go!", len(slides) + 1, TOTAL))
    slides.append(slide_copycat_challenge("Who can jump like a bunny the highest?", len(slides) + 1, TOTAL))

    for w_en in ["song", "playground"]:
        slides.append(slide_vocab(load_word("pre-a", 18, w_en), 0, len(slides) + 1, TOTAL, 1, "lumi-hero"))

    slides.append(slide_scoreboard("And the final score is...", len(slides) + 1, TOTAL))
    slides.append(slide_finale(len(slides) + 1, TOTAL))
    slides.append(slide_trial_finish(len(slides) + 1, TOTAL))

    assert len(slides) == TOTAL, f"expected {TOTAL} slides, built {len(slides)}"

    out_dir = "slide-content/trial/pre-a"
    os.makedirs(out_dir, exist_ok=True)
    for f in os.listdir(out_dir):
        os.remove(os.path.join(out_dir, f))
    for i, html in enumerate(slides, start=1):
        with open(f"{out_dir}/slide-{i:02d}.html", "w", encoding="utf-8") as f:
            f.write(html)
    print(f"Wrote {len(slides)} trial slides to {out_dir}/")


if __name__ == "__main__":
    build()
