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
import deck_template_v2
from deck_template_v2 import (
    bg_plain, bg_study, bg_clean, header, COLORSTRIP, SPARKS, char_img,
    slide_vocab, slide_quick_check, slide_tpr_activity, slide_teacher_game, slide_sound_spot, esc, slug,
    slide_vocab_scene,
)
import trial_recap as TR
import trial_common as TC

_scene_slide = slide_vocab_scene
def slide_vocab_scene(img, sentence, bold, *a, **k):
    TR.remember_sentence(sentence)
    return _scene_slide(img, sentence, bold, *a, **k)

TOTAL = 52


def load_word(level, lesson_num, en):
    with open(f"lessons/{level}/lesson{lesson_num:02d}.json", encoding="utf-8") as f:
        d = json.load(f)
    for v in d["vocab"]:
        if v["en"] == en:
            return TR.remember_word(v)
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
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 30px">
      <div style="font-size:1.15rem;font-weight:800;color:#F97316;letter-spacing:2px;margin-bottom:16px">TRIAL CLASS</div>
      <h1 style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:3.2rem;color:#43301F;margin:0 0 10px">
        Welcome, friends! &#127881;
      </h1>
      <div style="font-family:'Baloo 2',sans-serif;font-weight:700;font-size:1.4rem;color:#8A7160;margin-bottom:22px;max-width:820px">
        Today we're going to have SO much fun with English &mdash; are you ready?
      </div>
      {name_chips_html()}
    </div>
    ''' + char_img("lumi-hero", right=30, bottom=30, height=190))


def slide_trial_transition(headline, emoji, n, total):
    return (bg_study() + header("Trial Class", n, total) + COLORSTRIP + f'''
    <div style="position:absolute;inset:0;top:60px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">
      <div style="font-size:4rem;margin-bottom:20px">{emoji}</div>
      <div style="background:#fff;border-radius:22px;padding:18px 40px;box-shadow:0 12px 28px rgba(67,48,31,.16);font-family:'Baloo 2',sans-serif;font-weight:800;font-size:2.4rem;color:#43301F;max-width:900px">{headline}</div>
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
        Who says the English word first? Tap the word to check, then tap the winner&#39;s name!
      </div>
      <div style="background:#fff;border-radius:20px;padding:14px 34px;box-shadow:0 10px 24px rgba(67,48,31,.12);margin-bottom:16px;text-align:center">
        <div style="width:130px;height:130px;border-radius:14px;overflow:hidden;background:#FFFCF6;border:3px solid #FFE0B8;margin:0 auto 8px">
          <img src="assets/vocab/{slug(prompt_word.get("image") or prompt_word["en"])}.png" style="width:100%;height:100%;object-fit:contain" onerror="this.style.display='none'">
        </div>
        <div style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.4rem;color:#43301F"><span onclick="this.style.filter='none'" title="Tap to check" style="filter:blur(11px);cursor:pointer;user-select:none">{esc(prompt_word["en"])}</span></div>
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
          <img src="assets/vocab/{slug(prompt_word.get("image") or prompt_word["en"])}.png" style="width:100%;height:100%;object-fit:contain" onerror="this.style.display='none'">
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
      <div style="background:#fff;border-radius:22px;padding:16px 38px;box-shadow:0 12px 28px rgba(67,48,31,.16);font-family:'Baloo 2',sans-serif;font-weight:800;font-size:2.2rem;color:#43301F">{headline}</div>
    </div>
    ''' + char_img("lumi-thumbs", bottom=40, height=280))


def slide_trial_finish(n, total):
    return (bg_plain() + SPARKS + f'''
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 30px">
      <div style="font-size:1.05rem;font-weight:800;color:#0D9488;letter-spacing:2px;margin-bottom:12px">GREAT JOB TODAY</div>
      <h1 style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:2.6rem;color:#43301F;margin:0 0 6px">
        You're all naturals! &#11088;
      </h1>
      {name_chips_html()}
      <div style="background:#fff;border-radius:20px;padding:16px 26px;box-shadow:0 12px 26px rgba(67,48,31,.14);margin:16px 0 14px;max-width:860px">
        <div style="font-size:.78rem;font-weight:800;color:#F97316;letter-spacing:1.5px;margin-bottom:8px">TODAY YOU LEARNED &nbsp;&middot;&nbsp; <span dir="rtl">تعلمت اليوم</span></div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center">
          {"".join(f'<span style="background:#FFF3D6;color:#7B3F1B;padding:6px 14px;border-radius:999px;font-weight:800;font-size:.95rem">{w}</span>' for w in [x["en"] for x in TR.WORDS] + TR.ACTIONS)}
        </div>
        <div style="font-family:'Baloo 2',sans-serif;font-weight:700;font-size:1rem;color:#8A7160;margin-top:10px">
          Thank you! Goodbye! &nbsp;<span dir="rtl" style="color:#0D9488">شكراً لك! مع السلامة!</span> &mdash; this was one class &mdash; the full level has 24 live classes (20 lessons + 4 Bonus Classes) in about 3 months.
        </div>
      </div>
      <div style="background:#fff;border-radius:18px;padding:15px 28px;box-shadow:0 12px 26px rgba(67,48,31,.18);
                  font-family:'Baloo 2',sans-serif;font-weight:700;font-size:1rem;color:#43301F">
        &#128172; Ask your teacher about starting the full course today!
      </div>
    </div>
    ''' + char_img("lumi-celebrate", right=30, bottom=25, height=170))


def _build():
    """45 minutes: greetings (said and done), animals, the level's core skill -- letters and their sounds
    (C is for cat, D is for dog, as in the ABC lessons) -- colors, movement, the game. About 12 words, every
    section ends in a game or an action; nothing on screen asks a pre-reader to read."""
    import activity_slides as _AS
    slides = []
    n = lambda: len(slides) + 1

    slides.append(slide_trial_welcome(1, TOTAL))
    slides.append(TC.meet_characters(sys.modules[__name__], "pre-a", n(), TOTAL))
    slides.append(slide_team_assign(n(), TOTAL))

    # Greetings: say it and do it
    deck_template_v2.CURRENT_LESSON_BG = "assets/lesson-bg-kid/classroom.jpg"
    for w_en in ["hello", "goodbye", "thank you"]:
        slides.append(slide_vocab(load_word("pre-a", 1, w_en), 0, n(), TOTAL, 1, "lumi-hero"))
    slides.append(slide_vocab_scene("assets/vocab-scenes/pre-a/01.jpg", "Hello! Hi, friend!", ["Hello", "Hi"], n(), TOTAL, 1, "مرحباً! أهلاً يا صديقي!"))
    slides.append(slide_tpr_activity("Wave to a friend and say \u201cHello!\u201d &#128075;", n(), TOTAL, "lumi-hero"))
    TR.remember_actions("wave")

    # Animals
    deck_template_v2.CURRENT_LESSON_BG = "assets/lesson-bg-kid/animals.jpg"
    animal_words = [load_word("pre-a", 12, w) for w in ["cat", "dog", "fish", "duck"]]
    for w in animal_words:
        slides.append(slide_vocab(w, 0, n(), TOTAL, 1, "lumi-hero"))
    slides.append(_AS.slide_flash_race(animal_words, bg_study(), header("Flash Race &bull; Speaking Game", n(), TOTAL) + COLORSTRIP))
    slides.append(slide_vocab_scene("assets/vocab-scenes/pre-a/29.jpg", "The cat and the dog play together.", ["cat", "dog"], n(), TOTAL, 1, "القطة والكلب يلعبان معاً"))
    slides.append(slide_buzzer_challenge(animal_words[3], n(), TOTAL))

    # Letters and sounds (the ABC lessons' own 3-step sequence): C is for cat, D is for dog
    deck_template_v2.CURRENT_LESSON_BG = None
    slides.append(slide_trial_transition("Let's meet two letters!", "&#128292;", n(), TOTAL))
    pairs = [("c", load_word("pre-a", 3, "cat")), ("d", load_word("pre-a", 3, "dog"))]
    for letter, w in pairs:
        slides.append(deck_template_v2.slide_meet_the_letter(letter, n(), TOTAL, "sara-explain"))
        slides.append(deck_template_v2.slide_hear_the_sound(letter, n(), TOTAL, "sara-explain"))
        slides.append(deck_template_v2.slide_letter_word(w, letter, n(), TOTAL, "lumi-point"))
    slides.append(deck_template_v2.slide_letter_chunk_recap(pairs, n(), TOTAL, "lumi-celebrate"))
    slides.append(_AS.slide_mystery_picture(animal_words, bg_study(), header("Mystery Picture &bull; Guessing Game", n(), TOTAL) + COLORSTRIP))
    slides.append(slide_scoreboard("Halfway there! Here's the score so far...", n(), TOTAL))

    # Colors
    deck_template_v2.CURRENT_LESSON_BG = "assets/lesson-bg-kid/playroom.jpg"
    color_words = [load_word("pre-a", 8, w) for w in ["red", "blue", "yellow"]]
    for w in color_words:
        slides.append(slide_vocab(w, 0, n(), TOTAL, 1, "lumi-hero"))
    slides.append(slide_vocab_scene("assets/vocab-scenes/pre-a/19.jpg", "A red balloon and a blue balloon!", ["red", "blue"], n(), TOTAL, 1, "بالون أحمر وبالون أزرق!"))
    slides.append(_AS.slide_memory_match(animal_words + color_words[:2], bg_study(), header("Memory Match &bull; Game", n(), TOTAL) + COLORSTRIP))
    slides.append(slide_team_relay(color_words[2], "What color is this?", n(), TOTAL))

    # Move and sing
    deck_template_v2.CURRENT_LESSON_BG = None
    slides.append(slide_tpr_activity("Sing together: \u201cHello, hello, how are you?\u201d &#127925;", n(), TOTAL, "lumi-hero"))
    slides.append(slide_copycat_challenge("Who can jump like a bunny the highest?", n(), TOTAL))
    slides.append(slide_copycat_challenge("Who can swim like a fish? Say \u201cFish!\u201d", n(), TOTAL))
    TR.remember_actions("sing", "jump")

    slides.append(TC.game_slide(sys.modules[__name__], "pre-a", n(), TOTAL))
    slides.append(slide_scoreboard("And the final score is...", n(), TOTAL))
    slides.extend(TR.kid_slides(n(), TOTAL, letters=["C", "D"]))
    slides.append(TC.journey_slide(sys.modules[__name__], "pre-a", n(), TOTAL))
    slides.append(slide_finale(n(), TOTAL))
    slides.append(slide_trial_finish(n(), TOTAL))
    return slides


def build():
    def _set(t):
        global TOTAL
        TOTAL = t
    slides = TR.two_pass_build(_build, _set, TOTAL)

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
    # 1-on-1 variant: same content, group-only slides swapped (lib/trial_solo.py)
    import trial_solo
    trial_solo.build(sys.modules[__name__], "pre-a")
