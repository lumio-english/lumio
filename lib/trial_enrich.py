"""Shared enrichment for the Level 3-6 trial classes.

The Pre-A trial has real moments between the games -- scenes, dialogue,
a recap of what was learned. The teen trials only had vocab + buzzer
games, so they felt thin. This module adds, without touching each
deck's own section structure:

  hook            - one real-life question to open the class
  dialogue        - a short role-play pulled from the level's own lessons
  sentence_builder- rebuild a sentence the class just heard
  grammar_mcq     - graded fill-the-blank on the level's grammar
  vocab_mcq       - graded quick check on the words just taught
  discussion      - an open moment the teacher sits on for real time
  today_recap     - "Today you learned" with every word + Arabic, and the
                    level's grammar line, before the finish slide
"""
import ast, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)

from deck_template_teen import (bg_base, header, slide_dialogue, slide_sentence_builder,
                                esc, ORANGE_DEEP, TEAL_DEEP, CARD_TEXT, INK_DIM)
from deck_template_teen2 import slide_hook, slide_vocab_mcq, slide_grammar_mcq, slide_discussion

LEVEL_META = {
    "level3": dict(gen="gen_slides_level3_v2.py", hook="What do you and your friends do together every week?",
                   grammar="Present Simple - I play / She plays - and there is / there are",
                   ch="omar-teen-happy",
                   discussion=["What is one thing your best friend does every day?",
                               "Describe your room in three sentences - what is there?",
                               "Which is harder for you: talking about yourself, or asking questions? Why?",
                               "Tell us one thing you CAN do well and one thing you CAN'T do yet.",
                               "If a new student joined today, what would you ask them first?"]),
    "level4": dict(gen="gen_slides_level4_v2.py", hook="How often do you check your phone - and is that too much?",
                   grammar="Questions with Do / Does, frequency words, and I'd like / You should",
                   ch="ziad-teen-happy",
                   discussion=["What is one rule in your routine you never break?",
                               "You have 50 riyals for the week. What do you buy first, and why?",
                               "When did someone give you good advice? What did they say?",
                               "Is it better to save money or enjoy it now? Convince the other team.",
                               "What is one thing you want to be able to say in English by next month?"]),
    "level5": dict(gen="gen_slides_level5_teenv2.py", hook="What is the best thing that happened to you last weekend?",
                   grammar="Past Simple - I went / We saw / Did you...? - and telling a story in order",
                   ch="sara-teen-happy",
                   discussion=["Tell us about a day you will never forget. What happened first?",
                               "What went wrong the last time you planned something? How did you fix it?",
                               "Interview your teammate: three questions about their last holiday.",
                               "Describe a party or celebration in your family, from start to finish.",
                               "What is one story from this class you could tell at home tonight?"]),
    "level6": dict(gen="gen_slides_level6_teenv2.py", hook="What are you going to do differently next year?",
                   grammar="Going to / will for plans and predictions, have to / must, and comparatives",
                   ch="hamad-teen-happy",
                   discussion=["Make one prediction about your class in five years.",
                               "Which rule at home do you think is fair? Which one is not?",
                               "Compare two things you love - which is better, and why?",
                               "What do you have to do this week that you don't want to do?",
                               "Describe your plan for one perfect weekend, step by step."]),
}


def _dialogues(level):
    """Pull the level's DIALOGUES dict from its lesson generator without
    importing (importing would regenerate every lesson deck)."""
    src = open(os.path.join(ROOT, LEVEL_META[level]["gen"]), encoding="utf-8").read()
    m = re.search(r"^DIALOGUES\s*=\s*(\{.*?^\})", src, re.S | re.M)
    d = ast.literal_eval(m.group(1))
    # normalise (speaker, en, ar) -> (en, ar)
    return {k: [(t[-2], t[-1]) for t in v] for k, v in d.items()}


def dialogue_slide(level, lesson_num, n, total, max_lines=4):
    lines = _dialogues(level).get(lesson_num, [])[:max_lines]
    return slide_dialogue(lines, n, total) if lines else None


def hook_slide(level, n, total):
    m = LEVEL_META[level]
    return slide_hook(m["hook"], n, total, m["ch"])


def sentence_slide(word, n, total, ch, seed=1):
    ex = (word.get("example") or "").strip()
    return slide_sentence_builder(ex, n, total, ch, seed) if ex else None


def grammar_slides(words, n_start, total, count=2):
    sents = [{"en": w.get("example", ""), "ar": w.get("exampleAr", "")} for w in words if w.get("example")]
    out = []
    for i in range(min(count, len(sents))):
        out.append(slide_grammar_mcq(sents, i, min(count, len(sents)), n_start + i, total))
    return out


def vocab_quiz_slides(words, n_start, total, count=2):
    out = []
    for i in range(min(count, len(words))):
        out.append(slide_vocab_mcq(words, "translate" if i % 2 == 0 else "picture", i, min(count, len(words)), n_start + i, total))
    return out


def discussion_slide(level, n, total):
    m = LEVEL_META[level]
    return slide_discussion(m["discussion"], n, total, m["ch"])


def trial_words(trial_file):
    """Every word the trial itself teaches, read from its own load_word(...)
    calls so the recap can never drift from the deck."""
    src = open(trial_file, encoding="utf-8").read()
    level = re.search(r'load_word\("(level\d)"', src).group(1)
    words, seen = [], set()
    for lesson, lst in re.findall(r'load_word\("level\d",\s*(\d+),\s*w(?:_en)?\)\s*for w(?:_en)? in \[([^\]]*)\]', src):
        for en in re.findall(r'"([^"]+)"', lst):
            if en not in seen:
                seen.add(en); words.append((int(lesson), en))
    return level, words


def recap_slide(level, words, n, total):
    """'Today you learned' -- every word with Arabic, plus the grammar line."""
    m = LEVEL_META[level]
    chips = ""
    for lesson, en in words:
        p = os.path.join(ROOT, "lessons", level, f"lesson{lesson:02d}.json")
        ar = ""
        try:
            for w in json.load(open(p, encoding="utf-8"))["vocab"]:
                if w["en"] == en: ar = w.get("ar", ""); break
        except Exception:
            pass
        chips += (f'<div style="background:#fff;border-radius:14px;padding:10px 16px;box-shadow:0 6px 14px rgba(0,0,0,.08);text-align:center">'
                  f'<div style="font-family:\'Fredoka\',sans-serif;font-weight:600;font-size:1.05rem;color:{CARD_TEXT}">{esc(en)}</div>'
                  f'<div dir="rtl" style="font-weight:700;font-size:.95rem;color:{TEAL_DEEP};margin-top:2px">{esc(ar)}</div></div>')
    return (bg_base() + header("Today you learned &#127775;", n, total) + f'''
    <div style="position:absolute;left:60px;right:60px;top:130px">
      <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:.8rem;letter-spacing:1.5px;color:{ORANGE_DEEP};margin-bottom:10px">
        WORDS &nbsp;&middot;&nbsp; <span dir="rtl">الكلمات</span></div>
      <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:10px">{chips}</div>
      <div style="margin-top:22px;background:#fff;border-radius:16px;padding:16px 22px;box-shadow:0 8px 18px rgba(0,0,0,.08)">
        <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:.8rem;letter-spacing:1.5px;color:{TEAL_DEEP};margin-bottom:6px">GRAMMAR YOU USED TODAY</div>
        <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:1.15rem;color:{CARD_TEXT}">{esc(m["grammar"])}</div>
        <div style="font-size:.95rem;color:{INK_DIM};margin-top:6px">This was one class. The full level has 20 lessons, a bonus game, printable worksheets and flashcards, and a story.</div>
      </div>
    </div>''')
