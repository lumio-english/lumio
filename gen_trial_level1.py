# -*- coding: utf-8 -*-
"""
Trial class deck for Level 1 -- NOT a regular numbered lesson.

Same challenge infrastructure as the Pre-A trial (group-aware roster/teams,
live challenge slides). Content follows the start of the real course:
Lesson 1 "This is...", the first phonics group (s, a, t, p -- blending and a
decodable story from day one), My Pets and "I can...".

Content pulled entirely from real Level 1 lessons -- nothing invented.
"""
import sys, os, json
sys.path.insert(0, "lib")
import deck_template_v2
from deck_template_v2 import (
    bg_plain, bg_study, bg_clean, header, COLORSTRIP, SPARKS, char_img,
    slide_vocab, slide_quick_check, slide_tpr_activity, slide_teacher_game, esc, slug,
    slide_vocab_scene,
)
import trial_recap as TR
import trial_common as TC

_scene_slide = slide_vocab_scene
def slide_vocab_scene(img, sentence, bold, *a, **k):
    TR.remember_sentence(sentence)
    return _scene_slide(img, sentence, bold, *a, **k)

TOTAL = 43


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
      <div style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:2.2rem;color:#43301F">{headline}</div>
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
      <div style="font-family:'Baloo 2',sans-serif;font-weight:700;font-size:1.15rem;color:#8A7160;margin:20px 0 24px;max-width:820px">
        Food, pets, weather, and moving in English &mdash; all in one class! This is just a taste
        of the full level: 24 live classes (20 lessons + 4 Bonus Classes) in about 3 months.
      </div>
      <div style="background:#fff;border-radius:18px;padding:15px 28px;box-shadow:0 12px 26px rgba(67,48,31,.18);
                  font-family:'Baloo 2',sans-serif;font-weight:700;font-size:1rem;color:#43301F">
        &#128172; Ask your teacher about starting the full course today!
      </div>
    </div>
    ''' + char_img("lumi-celebrate", right=30, bottom=25, height=170))


def _build():
    """Lesson 1 (This is...) + the course's first phonics group (s, a, t, p: blending from day one) +
    pets (Lesson 16) + I can... (Lesson 14). Every section ends in speaking or a game."""
    import activity_slides as _AS
    import json as _json
    slides = []
    n = lambda: len(slides) + 1

    slides.append(slide_trial_welcome(1, TOTAL))
    slides.append(TC.meet_characters(sys.modules[__name__], "level1", n(), TOTAL))
    slides.append(slide_team_assign(n(), TOTAL))

    # This is... -- the course's first sentence frame
    deck_template_v2.CURRENT_LESSON_BG = "assets/lesson-bg-kid/family-home.jpg"
    people = [load_word("level1", 1, w) for w in ["boy", "girl", "teacher", "friend", "mom", "dad"]]
    for w in people:
        slides.append(slide_vocab(w, 0, n(), TOTAL, 1, "lumi-hero"))
    slides.append(slide_vocab_scene("assets/vocab-scenes/level1/03.jpg", "My mom hugs me. My dad reads to me.", ["mom", "dad"], n(), TOTAL, 1))
    slides.append(_AS.slide_flash_race(people, bg_study(), header("Flash Race &bull; Speaking Game", n(), TOTAL) + COLORSTRIP))
    trio = ["This is my mom.", "This is my friend.", "This is my teacher."]
    slides.append(deck_template_v2.slide_sentence_trio(trio, n(), TOTAL, "lumi-hero", 11))
    for t in trio: TR.remember_sentence(t)
    slides.append(slide_buzzer_challenge(people[3], n(), TOTAL))

    # Phonics Group 1 (phonics-hub/level1.json unit 1): sounds -> blend -> read a story -> listen and match
    unit = _json.load(open("phonics-hub/level1.json", encoding="utf-8"))["units"][0]
    slides.append(slide_trial_transition("Let's read our first words!", "&#128292;", n(), TOTAL))
    slides.append(deck_template_v2.slide_phonics_rule(unit, n(), TOTAL, "lumi-point"))
    slides.append(deck_template_v2.slide_phonics_practice(unit, n(), TOTAL, "lumi-books"))
    slides.append(deck_template_v2.slide_phonics_story(unit, n(), TOTAL, "lumi-read"))
    pw = unit["words"]
    for i in range(2):
        slides.append(deck_template_v2.slide_sound_match(pw[i + 1], [x for x in pw if x is not pw[i + 1]][:3], i + 1, 2, n(), TOTAL, 70 + i))
    slides.append(slide_scoreboard("Halfway there! Here's the score so far...", n(), TOTAL))

    # Pets
    deck_template_v2.CURRENT_LESSON_BG = "assets/lesson-bg-kid/animals.jpg"
    pet_words = [load_word("level1", 16, w) for w in ["dog", "cat", "fish", "bird"]]
    for w in pet_words:
        slides.append(slide_vocab(w, 0, n(), TOTAL, 1, "lumi-hero"))
    slides.append(slide_vocab_scene("assets/vocab-scenes/level1/46.jpg", "My dog and my cat play together.", ["dog", "cat"], n(), TOTAL, 1))
    slides.append(_AS.slide_mystery_picture(pet_words, bg_study(), header("Mystery Picture &bull; Guessing Game", n(), TOTAL) + COLORSTRIP))
    slides.append(slide_team_relay(pet_words[3], "Which pet is this?", n(), TOTAL))

    # I can... -- say it, then show it
    deck_template_v2.CURRENT_LESSON_BG = "assets/lesson-bg-kid/park.jpg"
    for w_en in ["read", "draw", "dance"]:
        slides.append(slide_vocab(load_word("level1", 14, w_en), 0, n(), TOTAL, 1, "lumi-hero"))
    slides.append(slide_vocab_scene("assets/vocab-scenes/level1/42.jpg", "I can sing. I can dance.", ["sing", "dance"], n(), TOTAL, 1))
    slides.append(slide_copycat_challenge("Who can show \u201cI can dance!\u201d the best? Say it and do it!", n(), TOTAL))
    slides.append(slide_copycat_challenge("Who can run in place the fastest? Say \u201cI can run!\u201d", n(), TOTAL))
    TR.remember_actions("run", "dance")
    deck_template_v2.CURRENT_LESSON_BG = None

    slides.append(TC.game_slide(sys.modules[__name__], "level1", n(), TOTAL))
    slides.append(slide_scoreboard("And the final score is...", n(), TOTAL))
    slides.extend(TR.kid_slides(n(), TOTAL, phonics_unit=unit))
    slides.append(TC.journey_slide(sys.modules[__name__], "level1", n(), TOTAL))
    slides.append(slide_finale(n(), TOTAL))
    slides.append(slide_trial_finish(n(), TOTAL))
    return slides


def build():
    def _set(t):
        global TOTAL
        TOTAL = t
    slides = TR.two_pass_build(_build, _set, TOTAL)

    out_dir = "slide-content/trial/level1"
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
    trial_solo.build(sys.modules[__name__], "level1")
