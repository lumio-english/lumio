# -*- coding: utf-8 -*-
"""One-on-one ("solo") trial class decks -- adapted from each level's group
trial deck without duplicating its content.

Every gen_trial_<level>.py builds the group deck from the same set of
module-level slide builders. This module swaps the GROUP-ONLY builders
(teams, buzzer, relay, copy-cat, scoreboard, finale, welcome, finish) for
single-student equivalents, re-runs the module's own _build(), and writes
the result to slide-content/trial-solo/<level>/. The vocabulary, scenes,
quick checks, TPR, dialogues, sentence builders and recap are untouched,
so a content update to the group trial reaches the solo one on the next
run (regen_level.py runs both).

Solo class logic (present-trial.html?mode=solo):
  * one name, no teams -- a STAR METER replaces the scoreboard: the goal
    is 10 stars by the end of class;
  * "Quick Answer" (was Buzzer): the teacher taps "Got it!" (+1 star) or
    "Almost -- say it with me" (no star, no penalty);
  * "Your Turn" (was Team Relay): same, with the question line;
  * "Show Me!" (was Copy-Cat): the teacher rates the action 1-3 stars;
  * "Star Meter" (was Scoreboard): big star count with the goal bar;
  * "Today's Badges" (was Class Champions): the teacher ticks the badges
    the student earned -- no "pick a student" dropdowns;
  * welcome / finish address one child by name; "You're all X!" headlines
    become singular.

Usage from a generator:   import trial_solo; trial_solo.build(sys.modules[__name__], "level2")
"""
import os, re, sys
import trial_recap as TR

STAR_GOAL = 10


def _is_teen(m):
    return hasattr(m, "bg_theme")


def _solo_action(line):
    # "Who can jump like a bunny the highest?" -> "Can you jump like a bunny?"
    l = re.sub(r"^Who can ", "Can you ", line)
    l = re.sub(r" the (best|highest|fastest|loudest|coolest|silliest)\?", "?", l)
    l = l.replace("their hand", "your hand").replace("Help a teammate!", "Help a friend!").replace("Cheer someone on!", "Cheer me on!")
    return l


def _singular(headline):
    # "You're all Animal Experts!" -> "You're an Animal Expert!"; "Color Champions" -> "a Color Champion"
    h = headline.replace("You're all ", "You're ").replace("you're all ", "you're ")
    m = re.match(r"^(You're )(.+?)(s)([!.]*)$", h)
    if m and not m.group(2).endswith("s"):
        noun = m.group(2)
        art = "an" if noun[:1].lower() in "aeiou" else "a"
        h = f"{m.group(1)}{art} {noun}{m.group(4)}"
    return h.replace("naturals", "a natural")


# --------------------------------------------------------------- builders
def make_builders(m):
    teen = _is_teen(m)
    if teen:
        ORANGE, INK, INK_DIM, TEAL, CARD_TEXT = m.ORANGE, m.INK, m.INK_DIM, m.TEAL, m.CARD_TEXT
        FONT = "'Fredoka',sans-serif"
        def shell(title, n, total, body, badge="lumi-teen-happy"):
            return m.bg_theme() + m.header(title, n, total) + f'<div style="position:relative;z-index:5;display:flex;flex-direction:column;align-items:center;padding:26px 40px 0;text-align:center">{body}</div>' + m.char_badge(badge)
        def plain(body):
            return m.bg_theme() + f'<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 30px;z-index:5">{body}</div>'
        card = lambda inner, extra="": f'{m.card_open(None, "padding:16px 26px;" + extra)}{inner}</div>'
        cast = "".join(f'<img src="{m.CHAR}/{img}.png" style="height:170px" title="{name}">' for img, name, _ in m.MEET_THE_SQUAD_CAST)
        CHIP = f"background:#fff;color:{CARD_TEXT}"
    else:
        ORANGE, INK, INK_DIM, TEAL, CARD_TEXT = "#F97316", "#43301F", "#8A7160", "#0D9488", "#43301F"
        FONT = "'Baloo 2',sans-serif"
        def shell(title, n, total, body, badge="lumi-hero"):
            return m.bg_study() + m.header(title, n, total) + m.COLORSTRIP + f'<div style="position:absolute;inset:0;top:120px;display:flex;flex-direction:column;align-items:center;text-align:center">{body}</div>' + m.char_img(badge, right=40, bottom=20, height=150)
        def plain(body):
            return m.bg_plain() + m.SPARKS + f'<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 30px">{body}</div>'
        card = lambda inner, extra="": f'<div style="background:#fff;border-radius:20px;padding:16px 26px;box-shadow:0 12px 26px rgba(67,48,31,.14);{extra}">{inner}</div>'
        cast = ""
        CHIP = "background:#fff;color:#43301F"
    name_chip = '<div id="trialNames" style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:14px"></div>'
    H = lambda txt, size="1.3rem", color=INK: f'<div style="font-family:{FONT};font-weight:800;font-size:{size};color:{color};margin-bottom:10px">{txt}</div>'
    SUB = lambda txt: f'<div style="font-family:{FONT};font-weight:700;font-size:1rem;color:{INK_DIM};margin-bottom:12px;max-width:820px">{txt}</div>'

    def word_card(w):
        img = m.slug(w.get("image") or w["en"])
        return card(f'''<div data-say="{m.esc(w["en"])}" style="width:120px;height:120px;border-radius:14px;overflow:hidden;background:#FFFCF6;border:3px solid #FFE0B8;margin:0 auto 6px"><img src="assets/vocab/{img}.png" style="width:100%;height:100%;object-fit:contain" onerror="this.style.display='none'"></div>
          <div style="font-family:{FONT};font-weight:800;font-size:1.3rem;color:{CARD_TEXT}">{m.esc(w["en"])}</div>
          <div style="font-family:'Tajawal',sans-serif;font-weight:700;font-size:.95rem;color:#8A7160">{m.esc(w["ar"])}</div>''', "margin-bottom:12px")

    def welcome(n, total):
        body = (f'<div style="font-family:{FONT};font-weight:800;font-size:1.05rem;color:{ORANGE};letter-spacing:2px;margin-bottom:14px">1-ON-1 TRIAL CLASS</div>'
                f'<h1 style="font-family:{FONT};font-weight:800;font-size:3rem;color:{INK};margin:0 0 8px">Welcome! &#127881;</h1>'
                + SUB("This class is just for you &mdash; today we'll learn, play, and collect stars together. Ready?")
                + name_chip
                + f'<div style="margin-top:14px;{CHIP};border-radius:999px;padding:8px 18px;font-family:{FONT};font-weight:800;font-size:.95rem;box-shadow:0 6px 14px rgba(0,0,0,.12)">&#11088; Goal today: collect {STAR_GOAL} stars!</div>'
                + (f'<div style="display:flex;gap:6px;margin-top:16px;align-items:flex-end">{cast}</div>' if teen else ""))
        return plain(body) if teen else plain(body) + m.char_img("lumi-hero", right=30, bottom=30, height=190)

    def goal(n, total):   # replaces team-assign
        body = (H("How stars work &#11088;", "1.6rem") + SUB("Every time you answer, say a word, or show me an action, you can earn a star. Let's see how many you can collect!")
                + f'<div data-challenge="solo-meter" style="width:100%;display:flex;justify-content:center"><div id="soloMeter"></div></div>')
        return shell("Let's Collect Stars!", n, total, body, "lumi-teen-wave" if teen else "lumi-celebrate")

    def quick_answer(w, n, total):   # replaces buzzer
        body = (SUB("Say the word! Then tap how it went.") + word_card(w)
                + f'<div data-challenge="solo-answer" id="soloAnswer"></div>')
        return shell("Quick Answer", n, total, body)

    def your_turn(w, question_line, n, total):   # replaces team relay
        body = (H(question_line, "1.4rem") + word_card(w) + f'<div data-challenge="solo-answer" id="soloAnswer"></div>')
        return shell("Your Turn!", n, total, body, "lumi-teen-point" if teen else "lumi-point")

    def show_me(action_line, n, total):   # replaces copy-cat
        body = (f'<div style="font-size:2.4rem;margin-bottom:8px">&#127942;</div>' + H(_solo_action(action_line), "1.5rem")
                + SUB("Show me! Then rate it: 1, 2 or 3 stars.") + f'<div data-challenge="solo-do" id="soloDo"></div>')
        return shell("Show Me!", n, total, body)

    def meter(headline, n, total):   # replaces scoreboard
        body = H(headline, "1.6rem") + f'<div data-challenge="solo-meter" style="width:100%;display:flex;justify-content:center"><div id="soloMeter"></div></div>'
        return plain(body) if teen else plain(body)

    def badges(n, total):   # replaces finale
        body = (SUB("Tick every badge earned today &mdash; then read them out loud together!")
                + f'<div data-challenge="solo-badges" id="soloBadges" style="width:600px"></div>')
        return shell("Today's Badges", n, total, body, "lumi-teen-celebrate" if teen else "lumi-celebrate")

    def finish(n, total):
        words = [x["en"] for x in TR.WORDS] + list(TR.ACTIONS)
        chips = "".join(f'<span style="background:#FFF3D6;color:#7B3F1B;padding:6px 14px;border-radius:999px;font-weight:800;font-size:.95rem">{w}</span>' for w in words)
        body = (f'<div style="font-family:{FONT};font-weight:800;font-size:1rem;color:{TEAL};letter-spacing:2px;margin-bottom:10px">GREAT JOB TODAY</div>'
                f'<h1 style="font-family:{FONT};font-weight:800;font-size:2.5rem;color:{INK};margin:0 0 6px">You\'re a natural! &#11088;</h1>'
                + name_chip
                + f'<div data-challenge="solo-meter" style="margin:12px 0 10px;display:flex;justify-content:center"><div id="soloMeter" data-compact="1"></div></div>'
                + card(f'<div style="font-size:.78rem;font-weight:800;color:{ORANGE};letter-spacing:1.5px;margin-bottom:8px">TODAY YOU LEARNED &nbsp;&middot;&nbsp; <span dir="rtl">تعلمت اليوم</span></div>'
                       f'<div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;max-width:820px">{chips}</div>'
                       f'<div style="font-family:{FONT};font-weight:700;font-size:1rem;color:#8A7160;margin-top:10px">Thank you! Goodbye! &nbsp;<span dir="rtl" style="color:{TEAL}">شكراً لك! مع السلامة!</span> &mdash; this was one class out of 140 lessons across 7 levels.</div>', "margin-bottom:12px")
                + card(f'<span style="font-family:{FONT};font-weight:700;font-size:1rem;color:{CARD_TEXT}">&#128172; Ask your teacher about starting the full course today!</span>'))
        return plain(body) if teen else plain(body) + m.char_img("lumi-celebrate", right=30, bottom=25, height=170)

    orig_mini = m.slide_mini_celebrate
    def mini(headline, n, total):
        return orig_mini(_singular(headline), n, total)

    return dict(slide_trial_welcome=welcome, slide_team_assign=goal, slide_buzzer_challenge=quick_answer,
                slide_team_relay=your_turn, slide_copycat_challenge=show_me, slide_scoreboard=meter,
                slide_finale=badges, slide_trial_finish=finish, slide_mini_celebrate=mini)


def build(m, level):
    """Swap the group-only builders on module m, rebuild, write trial-solo/<level>/."""
    saved = {k: getattr(m, k) for k in make_builders(m)}
    for k, fn in make_builders(m).items():
        setattr(m, k, fn)
    try:
        def _set(t):
            m.TOTAL = t
        slides = TR.two_pass_build(m._build, _set, m.TOTAL)
    finally:
        for k, fn in saved.items():
            setattr(m, k, fn)
    out_dir = f"slide-content/trial-solo/{level}"
    os.makedirs(out_dir, exist_ok=True)
    for f in os.listdir(out_dir):
        os.remove(os.path.join(out_dir, f))
    for i, html in enumerate(slides, start=1):
        with open(f"{out_dir}/slide-{i:02d}.html", "w", encoding="utf-8") as f:
            f.write(html)
    print(f"Wrote {len(slides)} 1-on-1 trial slides to {out_dir}/")
    return len(slides)
