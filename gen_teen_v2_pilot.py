# -*- coding: utf-8 -*-
"""Isolated pilot: restructured Teen Track v2 slide order + per-lesson
theme, for Level 3 Lesson 4 'My Room'. Written to a separate namespace,
doesn't touch the live lesson."""
import sys, json, os, glob
sys.path.insert(0, "lib")
from deck_template_teen2 import build_deck_v2
from grammar_slides import match_grammar_by_lesson_focus

lesson = json.load(open("lessons/level3/lesson04.json", encoding="utf-8"))
grammar_topic = match_grammar_by_lesson_focus("level3", {4: lesson}).get(4)

dialogue = [
    ("Come see my room! There is a poster on the wall.", "تعال وانظر إلى غرفتي! يوجد ملصق على الحائط."),
    ("Wow, is there a speaker on your shelf too?", "واو، هل يوجد سماعة على رفك أيضا؟"),
    ("Yes! And there is a lamp on my desk.", "نعم! ويوجد مصباح على مكتبي."),
    ("This beanbag looks so comfortable!", "هذا الكرسي الإسفنجي يبدو مريحا جدا!"),
]

hook_question = "What's one thing in your room that says a lot about who you are?"

notice_sentences = [
    "There is a poster on the wall.",
    "My room is upstairs.",
    "There are two lamps on my desk.",
    "I like my beanbag chair.",
    "There is a speaker on the shelf.",
]
notice_note = "there is / there are"

challenge = {
    "prompt": "Describe your room using 3 sentences with 'There is' or 'There are' -- without looking at your notes.",
    "hint": "Try to use at least 2 different vocabulary words from today.",
}

real_life = "Tonight, describe your room to a family member in English. See how many words you remember!"

slides = build_deck_v2(4, lesson, grammar_topic, dialogue, hook_question, notice_sentences,
                        notice_note, challenge, real_life, theme_key="room")

out_dir = "slide-content/_pilot-teenv2-level3-04/04"
os.makedirs(out_dir, exist_ok=True)
for old in glob.glob(out_dir + "/slide-*.html"):
    os.remove(old)
for i, html in enumerate(slides, start=1):
    with open(f"{out_dir}/slide-{i:02d}.html", "w", encoding="utf-8") as f:
        f.write(html)

os.makedirs("assets/slides/_pilot-teenv2-level3-04", exist_ok=True)
with open("assets/slides/_pilot-teenv2-level3-04/manifest.json", "w", encoding="utf-8") as f:
    json.dump({"04": len(slides)}, f)

print(f"Pilot v2 deck: {len(slides)} slides -> {out_dir}")
