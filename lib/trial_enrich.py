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
  today_recap     - now built by lib/trial_recap.py (every word + Arabic,
                    the grammar line, and every sentence, paginated)
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


# trial_words()/recap_slide() were replaced by lib/trial_recap.py: words are
# now recorded at build time (the old source regex missed the last vocab
# group of every teen trial) and the recap lists every sentence too.
