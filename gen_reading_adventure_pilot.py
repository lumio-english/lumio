# -*- coding: utf-8 -*-
"""Isolated pilot: Reading Adventure lessons for Level 3 Lesson 11
("Zoo Adventure") and Level 4 Lesson 19 ("Reading: A Day with Lumi").
Written to separate namespaces so they don't touch the live lessons."""
import sys, json, os, glob
sys.path.insert(0, "lib")
from deck_template_teen import build_reading_adventure_deck
from grammar_slides import compute_grammar_lesson_map
import deck_template_teen as tpl

L3_DIALOGUES = {
  11: [("The elephant is bigger than the fox.", "الفيل أكبر من الثعلب."),
       ("Yes, and the fox is smaller than the wolf.", "نعم، والثعلب أصغر من الذئب."),
       ("Look at the zebra's stripes!", "انظر إلى خطوط الحمار الوحشي!"),
       ("These wild animals are not in cages here.", "هذه الحيوانات البرية ليست في أقفاص هنا.")],
}
def find_grammar_topic_by_title(level, title_contains):
    data = json.load(open(f"grammar-hub/{level}.json", encoding="utf-8"))
    for t in data["topics"]:
        if title_contains.lower() in t["title"].lower():
            return t
    return None

# For Reading Adventure, the grammar slide should match what the story is
# actually teaching, not the generic evenly-spaced position mapping (which
# would show "Prepositions of Place" for Lesson 11 while the story is about
# comparatives -- thematically broken for a "grammar taught through text" lesson).
L3_GRAMMAR_TOPIC = find_grammar_topic_by_title("level3", "Comparatives")

L3_STORY = {
  "prediction_q": "You're about to read about a day at the zoo. What animals do you think Omar and Noor will see?",
  "intro": "Omar and Noor are going to the zoo today. They want to see all the wild animals. Let's follow their adventure and learn about the animals they see!",
  "intro_q": "Have you ever been to a zoo? What did you see?",
  "passages": [
    {"label": "First", "text": "<b>First</b>, Omar and Noor see the giraffe. The giraffe is very tall. It has a long neck to eat leaves from tall trees.",
     "question": "What does the giraffe use its long neck for?"},
    {"label": "Next", "text": "<b>Next</b>, they walk to see the tiger. The tiger is <b>bigger</b> than the fox. It has orange fur with black stripes.",
     "question": "Is the tiger bigger or smaller than the fox?"},
    {"label": "Then", "text": "<b>Then</b>, they see the zebra. The zebra is <b>smaller</b> than the tiger, but it is not in a cage \u2014 it walks in a big, open field.",
     "question": "Where does the zebra live at the zoo?"},
    {"label": "Finally", "text": "<b>Finally</b>, Omar and Noor see the monkeys. The monkeys are wild and playful. They swing from tree to tree and make funny sounds.",
     "question": "What do the monkeys do in the trees?"},
  ],
  "grammar_extension": "Think of two animals you know. Which one is bigger? Which one is smaller? Tell your teacher!",
  "spot_grammar": {
    "note": "a comparative (bigger than / smaller than)",
    "sentences": [
      {"text": "The tiger is bigger than the fox."},
      {"text": "The giraffe eats leaves from tall trees."},
      {"text": "The zebra is smaller than the tiger."},
      {"text": "The monkeys swing from tree to tree."},
      {"text": "An elephant is bigger than a zebra."},
    ],
  },
  "picture_recall": [
    {"text": "First, they see the "}, {"word": "giraffe"}, {"text": ". Next, the "},
    {"word": "tiger"}, {"text": " is bigger than the "}, {"word": "fox"},
    {"text": ". Then they see the "}, {"word": "zebra"}, {"text": ", and finally the "},
    {"word": "monkey"}, {"text": "s."},
  ],
  "comprehension_qs": [
    "Which animal did Omar and Noor see first?",
    "Why is the giraffe's long neck useful?",
    "Where does the zebra live at the zoo?",
    "What do the monkeys like to do?",
  ],
  "writing_prep": {"prompt": "Describe your favorite zoo animal.",
    "bullets": ["What does it look like?", "Where does it live?", "What sound does it make?"]},
  "writing_project": {"prompt": "Write a passage about your favorite zoo animal.",
    "starters": ["My favorite zoo animal is \u2026", "It is bigger / smaller than \u2026", "It lives \u2026"]},
}

L4_DIALOGUES = {
  19: [("I read a story about Lumi today.", "قرأت قصة عن لومي اليوم."),
       ("What happens in the morning?", "ماذا يحدث في الصباح؟"),
       ("Lumi wakes up happy and plays in the afternoon.", "يستيقظ لومي سعيدا ويلعب بعد الظهر."),
       ("And reads in the evening. What a nice day!", "ويقرأ في المساء. يا له من يوم لطيف!")],
}
L4_GRAMMAR_TOPIC = None  # Lesson 19's own focus is "reading comprehension review", not a new grammar point

L4_STORY = {
  "prediction_q": "You're about to read about a day in Lumi's life. What do you think Lumi does in the morning, afternoon, and evening?",
  "intro": "Lumi is a happy little chick who loves her daily routine. Let's read about Lumi's day, from morning to night!",
  "intro_q": "What's the first thing you do every morning?",
  "passages": [
    {"label": "Morning", "text": "In the <b>morning</b>, Lumi wakes up early. She brushes her teeth and eats a big breakfast with her family. She feels <b>happy</b> and ready for the day.",
     "question": "What does Lumi do first in the morning?"},
    {"label": "Afternoon", "text": "In the <b>afternoon</b>, Lumi goes to school. She always listens carefully and often plays with her friends after class. She usually finishes her homework before dinner.",
     "question": "What does Lumi usually do before dinner?"},
    {"label": "Evening", "text": "In the <b>evening</b>, Lumi has dinner with her family. She talks about her day and shares her favorite <b>story</b> with her little brother.",
     "question": "Who does Lumi share her favorite story with?"},
    {"label": "Night", "text": "At night, Lumi reads a book before bed. She feels happy and sleepy. Soon, she falls asleep, ready for a new <b>day</b> tomorrow.",
     "question": "How does Lumi feel at night?"},
  ],
  "picture_recall": [
    {"text": "In the "}, {"word": "morning"}, {"text": ", Lumi wakes up "},
    {"word": "happy"}, {"text": ". In the "}, {"word": "afternoon"},
    {"text": ", she goes to school. In the "}, {"word": "evening"},
    {"text": ", she shares her favorite "}, {"word": "story"}, {"text": " with her brother."},
  ],
  "comprehension_qs": [
    "What does Lumi do first in the morning?",
    "What does Lumi usually do before dinner?",
    "Who does Lumi share her favorite story with?",
    "How does Lumi feel at night, and why?",
  ],
  "writing_prep": {"prompt": "Describe your typical day.",
    "bullets": ["What do you do in the morning?", "What do you do in the afternoon?", "How do you feel at the end of the day?"]},
  "writing_project": {"prompt": "Write a passage about your day.",
    "starters": ["In the morning, I \u2026", "In the afternoon, I \u2026", "I feel happy when \u2026"]},
}


def build_pilot(level, lesson_num, dialogues, grammar_topic, story, out_ns):
    lesson = json.load(open(f"lessons/{level}/lesson{lesson_num:02d}.json", encoding="utf-8"))
    tpl.DIALOGUES = dialogues
    slides = build_reading_adventure_deck(lesson_num, lesson, grammar_topic, story)

    out_dir = f"slide-content/{out_ns}/{lesson_num:02d}"
    os.makedirs(out_dir, exist_ok=True)
    for old in glob.glob(out_dir + "/slide-*.html"):
        os.remove(old)
    for i, html in enumerate(slides, start=1):
        with open(f"{out_dir}/slide-{i:02d}.html", "w", encoding="utf-8") as f:
            f.write(html)
    os.makedirs(f"assets/slides/{out_ns}", exist_ok=True)
    with open(f"assets/slides/{out_ns}/manifest.json", "w", encoding="utf-8") as f:
        json.dump({f"{lesson_num:02d}": len(slides)}, f)
    print(f"{out_ns}: {len(slides)} slides -> {out_dir}")


build_pilot("level3", 11, L3_DIALOGUES, L3_GRAMMAR_TOPIC, L3_STORY, "_pilot-reading-level3-11")
build_pilot("level4", 19, L4_DIALOGUES, L4_GRAMMAR_TOPIC, L4_STORY, "_pilot-reading-level4-19")
