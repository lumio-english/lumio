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

TOTAL = 43


def load_word(level, lesson_num, en):
    with open(f"lessons/{level}/lesson{lesson_num:02d}.json", encoding="utf-8") as f:
        d = json.load(f)
    for v in d["vocab"]:
        if v["en"] == en:
            return v
    raise ValueError(f"{en} not found in {level} lesson {lesson_num}")


def name_chips_html():
    return '<div id="trialNames" style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-top:18px"></div>'


def slide_trial_welcome(n, total):
    return (bg_plain() + SPARKS + f'''
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">
      <div style="font-size:1.1rem;font-weight:800;color:#F97316;letter-spacing:2px;margin-bottom:14px">TRIAL CLASS</div>
      <h1 style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:3rem;color:#43301F;margin:0 0 6px">
        Welcome, friends! &#127881;
      </h1>
      <div style="font-family:'Baloo 2',sans-serif;font-weight:700;font-size:1.4rem;color:#8A7160;max-width:800px;margin-bottom:6px">
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


def slide_mini_celebrate(headline, n, total):
    return (bg_clean() + header("Trial Class", n, total) + COLORSTRIP + SPARKS + f'''
    <div style="position:absolute;inset:0;top:40px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">
      <div style="font-size:3.4rem;margin-bottom:10px">&#127775;</div>
      <div style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:2.2rem;color:#43301F">{headline}</div>
    </div>
    ''' + char_img("lumi-thumbs", bottom=40, height=280))


def slide_trial_finish(n, total):
    return (bg_plain() + SPARKS + f'''
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">
      <div style="font-size:1rem;font-weight:800;color:#0D9488;letter-spacing:2px;margin-bottom:10px">GREAT JOB TODAY</div>
      <h1 style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:2.6rem;color:#43301F;margin:0 0 4px">
        You're all naturals! &#11088;
      </h1>
      {name_chips_html()}
      <div style="font-family:'Baloo 2',sans-serif;font-weight:700;font-size:1.15rem;color:#8A7160;max-width:760px;margin:16px 0 22px">
        Hello, animals, colors, family, and moving in English &mdash; all in one class! This is just a taste
        of the 140 lessons and 7 levels waiting on the full Lumio adventure.
      </div>
      <div style="background:#fff;border-radius:18px;padding:16px 30px;box-shadow:0 12px 26px rgba(67,48,31,.18);
                  font-family:'Baloo 2',sans-serif;font-weight:700;font-size:1rem;color:#43301F">
        &#128172; Ask your teacher about starting the full course today!
      </div>
    </div>
    ''' + char_img("lumi-celebrate", right=60, bottom=20, height=250))


def build():
    slides = []

    slides.append(slide_trial_welcome(1, TOTAL))

    for w_en in ["hello", "hi", "good morning", "good night", "goodbye", "thank you"]:
        slides.append(slide_vocab(load_word("pre-a", 1, w_en), 0, len(slides) + 1, TOTAL, 1, "lumi-hero"))

    slides.append(slide_trial_transition("Let's meet some animal friends!", "&#128062;", len(slides) + 1, TOTAL))

    animal_words = [load_word("pre-a", 12, w) for w in ["cat", "dog", "bird", "fish", "rabbit", "duck"]]
    for w in animal_words:
        slides.append(slide_vocab(w, 0, len(slides) + 1, TOTAL, 1, "lumi-hero"))

    slides.append(slide_quick_check(animal_words[0], animal_words[1:3], 0, 1, len(slides) + 1, TOTAL, seed=1, tier="preA"))
    slides.append(slide_quick_check(animal_words[3], [animal_words[4], animal_words[0]], 0, 1, len(slides) + 1, TOTAL, seed=2, tier="preA"))
    slides.append(slide_teacher_game(animal_words, len(slides) + 1, TOTAL, "lumi-hero", tier="preA", mode="group"))
    slides.append(slide_mini_celebrate("You're all Animal Experts!", len(slides) + 1, TOTAL))

    slides.append(slide_trial_transition("Let's paint with colors!", "&#127752;", len(slides) + 1, TOTAL))
    color_words = [load_word("pre-a", 8, w) for w in ["red", "blue", "yellow", "green"]]
    for w in color_words:
        slides.append(slide_vocab(w, 0, len(slides) + 1, TOTAL, 1, "lumi-hero"))
    slides.append(slide_quick_check(color_words[0], color_words[1:3], 0, 1, len(slides) + 1, TOTAL, seed=3, tier="preA"))
    slides.append(slide_mini_celebrate("You're all Color Champions!", len(slides) + 1, TOTAL))

    slides.append(slide_trial_transition("Let's meet my family!", "&#128106;", len(slides) + 1, TOTAL))
    family_words = [load_word("pre-a", 10, w) for w in ["mom", "dad", "brother", "sister"]]
    for w in family_words:
        slides.append(slide_vocab(w, 0, len(slides) + 1, TOTAL, 1, "lumi-hero"))
    slides.append(slide_teacher_game(family_words, len(slides) + 1, TOTAL, "lumi-hero", tier="preA", mode="student"))
    slides.append(slide_mini_celebrate("You're a Family Friend!", len(slides) + 1, TOTAL))

    slides.append(slide_trial_transition("Let's move like Lumi!", "&#127939;", len(slides) + 1, TOTAL))
    tpr_lines = {
        "run": "Everyone stand up and run in place! Say \u201cRun!\u201d &#127939;",
        "jump": "Stand up and jump like a bunny! Say \u201cJump!\u201d &#128007;",
        "sit": "Sit down quickly! Say \u201cSit!\u201d &#128994;",
        "stand": "Now stand back up! Say \u201cStand!\u201d &#128993;",
        "clap": "Clap your hands and say \u201cClap!\u201d &#128079;",
        "sing": "Everyone sing \u201cLa la la!\u201d together! &#127925;",
    }
    for w_en, line in tpr_lines.items():
        slides.append(slide_tpr_activity(line, len(slides) + 1, TOTAL, "lumi-hero"))

    for w_en in ["song", "playground"]:
        slides.append(slide_vocab(load_word("pre-a", 18, w_en), 0, len(slides) + 1, TOTAL, 1, "lumi-hero"))

    slides.append(slide_mini_celebrate("You're all Super Movers!", len(slides) + 1, TOTAL))
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
