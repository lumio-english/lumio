# -*- coding: utf-8 -*-
"""Slides every trial deck (group + 1-on-1, all levels) shares:

  * meet_characters(m, level, n, total) -- the level's cast, reusing the
    regular lesson's own "Meet Your Friends" (kids) / "Meet the Squad"
    (teens) slide so the trial introduces exactly the characters the
    student will meet in the course.
  * game_slide(m, level, n, total) -- the level's own mini-game with a
    big "Play" button (opens in a new tab for screen-share) and the short
    link students type on their own device to try it live.
  * number_challenges(slides) -- stamps "Question k of N" on every
    point/star challenge so the teacher always knows how long a challenge
    runs. Applied by trial_recap.two_pass_build to both deck kinds.

`m` is the generator module (gen_trial_<level>), which exposes whichever
template it was built on (deck_template_v2 for kids, deck_template_teen
for teens).
"""
import re

SITE = "lumio-english.github.io/lumio"

# Same table as GAME_INFO in student.html -- keep both in step.
GAMES = {
    "pre-a":  dict(file="lumis-pocket.html",            title="Lumi's Pocket",          icon="&#128269;", sub="Listen and tap the right picture with Lumi!"),
    "level1": dict(file="treehouse-builder.html",       title="Treehouse Builder",      icon="&#127795;", sub="Answer correctly to build the Treehouse Club, piece by piece!"),
    "level2": dict(file="twelve-months-calendar.html",  title="Twelve Months Calendar", icon="&#128197;", sub="Flip through the year with the Twelve Months Club!"),
    "level3": dict(file="crew-chat.html",               title="Crew Chat",              icon="&#128172;", sub="Reply to the crew's group chat &mdash; tap or type it back!"),
    "level4": dict(file="squad-budget.html",            title="Squad Budget",           icon="&#128717;&#65039;", sub="Shop the list, watch your budget, print the receipt!"),
    "level5": dict(file="story-detective.html",         title="Story Detective",        icon="&#128373;&#65039;", sub="Find the evidence and crack the case!"),
    "level6": dict(file="crystal-ball.html",            title="Crystal Ball",           icon="&#128302;", sub="Read the crystal ball and judge each prediction!"),
}


def _teen(m):
    return hasattr(m, "bg_theme")


def game_url(level):
    return f"games/{GAMES[level]['file']}?level={level}&n=1&from=trial"


def meet_characters(m, level, n, total):
    if _teen(m):
        import deck_template_teen as T
        return T.slide_meet_the_squad(n, total)
    import deck_template_v2 as V
    return V.slide_meet_the_team(n, total)


def game_slide(m, level, n, total):
    g = GAMES[level]
    url = game_url(level)
    full = f"https://{SITE}/{url}"
    short = f"{SITE}/games/{g['file']}?level={level}&n=1"
    poster = f"assets/games/poster-{level}.png"
    if _teen(m):
        font, ink, dim, card_text = "'Fredoka',sans-serif", m.INK, m.INK_DIM, m.CARD_TEXT
        shell_open = m.bg_theme() + m.header("Try the Game!", n, total) + '<div style="position:absolute;inset:0;top:90px;bottom:70px;z-index:5;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;padding:0 60px">'
        shell_close = '</div>' + m.char_badge("lumi-teen-celebrate")
        card = lambda inner: f'{m.card_open(None, "padding:18px 26px;max-width:900px;text-align:center")}{inner}</div>'
    else:
        font, ink, dim, card_text = "'Baloo 2',sans-serif", "#43301F", "#8A7160", "#43301F"
        shell_open = m.bg_study() + m.header("Try the Game!", n, total) + m.COLORSTRIP + '<div style="position:absolute;inset:0;top:100px;bottom:70px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;padding:0 60px">'
        shell_close = '</div>' + m.char_img("lumi-celebrate", right=30, bottom=20, height=170)
        card = lambda inner: f'<div style="background:#fff;border-radius:22px;padding:18px 26px;box-shadow:0 12px 26px rgba(67,48,31,.14);max-width:900px;text-align:center">{inner}</div>'
    body = f'''
      <div style="width:840px;border-radius:22px;overflow:hidden;box-shadow:0 14px 30px rgba(0,0,0,.25);background:#fff">
        <img src="{poster}" style="width:100%;display:block" onerror="this.parentElement.style.display='none'">
      </div>
      {card(f"""
        <div style="display:flex;align-items:center;gap:26px;text-align:left">
          <div style="flex:1">
            <div style="font-family:{font};font-weight:800;font-size:1.8rem;color:{card_text};line-height:1.1">{g['icon']} {g['title']}</div>
            <div style="font-family:{font};font-weight:700;font-size:1rem;color:{dim};margin:4px 0 10px">{g['sub']}</div>
            <div style="font-family:{font};font-weight:700;font-size:.82rem;color:{dim}">Students open it on their own device:</div>
            <div style="font-family:'Nunito',monospace;font-weight:800;font-size:.92rem;color:{card_text};background:#FFF3D6;border-radius:10px;padding:7px 12px;margin-top:4px;word-break:break-all">{short}</div>
          </div>
          <div style="flex:0 0 auto;text-align:center">
            <a href="{url}" target="_blank" rel="noopener" data-game-link style="display:inline-block;background:#F97316;color:#fff;text-decoration:none;font-family:{font};font-weight:800;font-size:1.25rem;padding:16px 30px;border-radius:999px;box-shadow:0 8px 18px rgba(249,115,22,.4)">&#9654; Play now</a>
            <div style="font-family:{font};font-weight:700;font-size:.78rem;color:{dim};margin-top:8px;max-width:220px">Share your screen, play one round together, then let the student try.</div>
          </div>
        </div>
      """)}
    '''
    return shell_open + body + shell_close


# Every challenge slide that awards points (group) or stars (solo) gets a
# "Question k of N" stamp. N = number of such slides in the whole deck.
_CHALLENGE_RE = re.compile(r'<div data-challenge="(buzzer|team-relay|copycat|solo-answer|solo-do)"')


def number_challenges(slides):
    idx = [i for i, s in enumerate(slides) if _CHALLENGE_RE.search(s)]
    total = len(idx)
    out = list(slides)
    for k, i in enumerate(idx, start=1):
        badge = (f'<div data-qnum style="position:absolute;top:34px;right:150px;z-index:6;'
                 f'background:#43301F;color:#FFC93C;font-family:\'Baloo 2\',\'Fredoka\',sans-serif;font-weight:800;font-size:1rem;'
                 f'letter-spacing:1px;padding:6px 18px;border-radius:999px;box-shadow:0 6px 14px rgba(0,0,0,.25)">&#11088; Question {k} of {total}</div>')
        out[i] = badge + out[i]
    return out
