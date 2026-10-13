# -*- coding: utf-8 -*-
"""One structure for the four teen trial classes (Levels 3-6), built on the level's own lessons 1-3.

A trial is a short version of the real course start, not a highlight reel from across the level:

    welcome -> meet the squad -> teams -> hook
    Crew Talk (lesson 1 dialogue, real audio) -> lesson 1 words -> Describe It -> buzzer
    Grammar Time (the level's first grammar topic) -> Common Mistakes -> 3 grammar checks -> Build the Sentences
    halfway score -> lesson 2-3 words -> relay -> word check
    Reading Lab (lesson 3 passage + questions) -> Two Truths & a Lie (target grammar about yourself)
    the level game -> final score -> 5-minute discussion -> recap -> the full level (for parents) -> finale -> finish

Each gen_trial_level<N>.py keeps its own trial-only slides (welcome, teams, buzzer, relay, scoreboard, finale,
finish) and passes a SPEC; everything else comes from the same builders the real v5 lessons use, so the trial
always looks like the course (gen_trial_v5.py swaps in the v5 versions of these builders).
"""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

import trial_enrich as TE
import trial_recap as TR
import trial_common as TC
import deck_template_teen2 as D
import deck_template_teen as v1
import grammar_slides as G
import activity_slides as A
import reading_slides as RS
import common_mistakes as CM


def _crew_talk(level, lesson):
    mod = __import__(f"crew_talk_{level}")
    return mod.CREW_TALK.get(lesson, [])


def _v5():
    return D.slide_grammar_mcq.__module__ == "deck_v3_teen"


def fixed_grammar_check(m, sentence, answer, options, idx, total_q, n, total):
    """Grammar Check with hand-picked options (the generic builder blanks a random word and can test the wrong thing)."""
    title = f"Grammar Check &middot; {idx}/{total_q}"
    if _v5():
        import deck_v3_teen as V
        shown = V.esc(sentence).replace("___", '<span class="v3t-blank">___</span>', 1)
        return V._bg() + V.header(title, n, total) + f'''
    <div class="v3-paper" style="left:120px;right:120px;top:160px;padding:40px 52px 44px">
      <div class="v3-label">COMPLETE THE SENTENCE</div>
      <div class="v3-quote v3t-gsent">{shown}</div>
    </div>
    <div class="v3-opts v3t-opts" style="left:120px;right:120px;top:430px">{V.opt_buttons(options, answer)}</div>'''
    esc, jsq = v1.esc, D.jsq
    btns = "".join(f'''<button onclick="window.checkQuizAnswer && checkQuizAnswer(this, '{jsq(o)}', '{jsq(answer)}')"
        data-quiz-option="{esc(o)}" style="border:2px solid #EEF0F4;background:#fff;border-radius:10px;padding:14px;
        font-family:'Fredoka',sans-serif;font-weight:600;font-size:1.05rem;color:{v1.CARD_TEXT};cursor:pointer">{esc(o)}</button>''' for o in options)
    return m.bg_theme() + m.header(title, n, total) + f'''
    <div style="position:relative;z-index:5;display:flex;justify-content:center;margin-top:70px">
      {v1.card_open(700, "padding:38px 42px")}
        <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:.78rem;color:#6B6580;letter-spacing:1px;margin-bottom:14px">COMPLETE THE SENTENCE</div>
        <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:1.4rem;color:{v1.CARD_TEXT};margin-bottom:22px">{esc(sentence)}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">{btns}</div>
      </div>
    </div>'''


def build(m, level, spec):
    """m: the gen_trial_level<N> module (its trial-only builders + load_word); spec: see gen_trial_level3.py."""
    T = lambda: m.TOTAL
    s = []
    n = lambda: len(s) + 1
    bg_lesson = lambda k: setattr(D, "CURRENT_LESSON_BG", f"assets/lesson-bg/{level}/{k:02d}.jpg")

    s.append(m.slide_trial_welcome(1, T()))
    s.append(TC.meet_characters(m, level, n(), T()))
    s.append(m.slide_team_assign(n(), T()))
    s.append(TE.hook_slide(level, n(), T()))

    # ---- lesson 1: listen, words, speak
    bg_lesson(1)
    talk = _crew_talk(level, 1)
    if talk:
        s.append(D.slide_crew_talk(talk, n(), T()))
        TR.remember_sentence(talk[0][1])
    l1 = [m.load_word(level, 1, w) for w in spec["l1_words"]]
    chars = spec.get("chars", ["omar-teen-explain", "sara-teen-explain", "ziad-teen-happy", "noor-teen-explain", "hamad-teen-explain"])
    for i, w in enumerate(l1):
        s.append(m.slide_vocab(w, 0, n(), T(), 1, chars[i % len(chars)]))
    s.append(A.slide_describe_guess(l1, D.bg_theme(), m.header("Describe It &bull; Speaking Game", n(), T())))
    s.append(m.slide_buzzer_challenge(l1[spec.get("buzzer", 1)], n(), T()))

    # ---- grammar: rule, common mistakes, checks, build
    topic = G.compute_grammar_lesson_map(level)[1]
    s.append(G.slide_grammar_rule(topic, n(), T(), "sara-teen-explain", D.header_themed_wrap("default"), "",
                                  D.bg_theme_wrap("default"), lambda ch, **kw: v1.char_badge(ch)))
    mistakes = CM.mistakes_for(topic)
    if mistakes:
        s.append(D.slide_error_analysis(mistakes, topic["title"], n(), T()))
    checks = spec["checks"]
    for i, (sent, ans, opts) in enumerate(checks, 1):
        s.append(fixed_grammar_check(m, sent, ans, opts, i, len(checks), n(), T()))
        TR.remember_sentence(sent.replace("___", ans))
    s.append(v1.slide_sentence_trio(spec["trio"], n(), T(), "sara-teen-explain", 31))
    for t in spec["trio"]:
        TR.remember_sentence(t)
    s.append(m.slide_scoreboard("Halfway there! Here's the score so far...", n(), T()))

    # ---- lessons 2-3: more words, relay, quick check
    more = [m.load_word(level, ln, w) for ln, w in spec["more_words"]]
    bg_lesson(spec["more_words"][0][0])
    for i, w in enumerate(more):
        s.append(m.slide_vocab(w, 0, n(), T(), 1, chars[(i + 2) % len(chars)]))
    s.append(m.slide_team_relay(more[spec.get("relay", 0)], spec["relay_q"], n(), T()))
    for sl in TE.vocab_quiz_slides(l1 + more, n(), T(), 1):
        s.append(sl)

    # ---- Reading Lab (lesson 3) and speaking about yourself
    bg_lesson(3)
    for idx in (1, 2):   # passage, check understanding (the opener is a lesson-pacing slide)
        s.append(RS.reading_slide(level, 3, idx, D.bg_theme(), lambda t, _n=n(): m.header(t, _n, T())))
    D.CURRENT_LESSON_BG = None
    s.append(A.slide_truth_or_lie(l1 + more, topic, D.bg_theme(), m.header("Two Truths &amp; a Lie &bull; Speaking Game", n(), T())))

    # ---- game, close
    s.append(TC.game_slide(m, level, n(), T()))
    s.append(m.slide_scoreboard("And the final score is...", n(), T()))
    s.append(TE.discussion_slide(level, n(), T()))
    s.extend(TR.teen_slides(level, TE.LEVEL_META[level]["grammar"], [l[1] for l in talk[:4]], n(), T()))
    s.append(TC.journey_slide(m, level, n(), T()))
    s.append(m.slide_finale(n(), T()))
    s.append(m.slide_trial_finish(n(), T()))
    return s
