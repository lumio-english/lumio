#!/usr/bin/env python3
"""One command to rebuild everything derived from a level's lesson content.

    python3.12 regen_level.py level2            # slides + bundle + PDFs + trial
    python3.12 regen_level.py level2 --pdfs     # only worksheets/flashcards/writing
    python3.12 regen_level.py level2 --no-pdfs  # everything except the (slow) PDFs

Run after editing lessons/<level>/*.json OR dropping new pictures into
assets/vocab/.  The teacher decks, student lesson, Hub and homework load
vocab pictures by file name, so a new image is live the moment it is saved --
but the worksheet/flashcard/writing PDFs embed the pictures and must be
rebuilt, and the trial-class deck must be rebuilt whenever the lesson data
(words, examples, image overrides) changes.  This script always includes the
trial deck (group AND the 1-on-1 variant, both written by gen_trial_<level>.py)
so trial classes never fall behind the main course.

PDF rendering needs Chromium; set LUMIO_CHROMIUM if Playwright's own download
is not present (this container: /opt/pw-browsers/chromium).
"""
import os, subprocess, sys

LEVELS = {
    "pre-a":  dict(slides="gen_slides_prea_v2.py",       pdfs="gen_worksheets_flashcards_pre_a.py",  trial="gen_trial_prea.py"),
    "level1": dict(slides="gen_slides_level1_v2.py",     pdfs="gen_worksheets_flashcards_level1.py", trial="gen_trial_level1.py"),
    "level2": dict(slides="gen_slides_level2_v2.py",     pdfs="gen_worksheets_flashcards_level2.py", trial="gen_trial_level2.py"),
    "level3": dict(slides="gen_slides_level3_teenv2.py", pdfs="gen_worksheets_flashcards_level3.py", trial="gen_trial_level3.py"),
    "level4": dict(slides="gen_slides_level4_teenv2.py", pdfs="gen_worksheets_flashcards_level4.py", trial="gen_trial_level4.py"),
    "level5": dict(slides="gen_slides_level5_teenv2.py", pdfs="gen_worksheets_flashcards_level5.py", trial="gen_trial_level5.py"),
    "level6": dict(slides="gen_slides_level6_teenv2.py", pdfs="gen_worksheets_flashcards_level6.py", trial="gen_trial_level6.py"),
}


def run(script):
    print(f"\n=== {script}")
    subprocess.run([sys.executable, script], check=True)


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    flags = {a for a in sys.argv[1:] if a.startswith("--")}
    if len(args) != 1 or args[0] not in LEVELS:
        sys.exit(f"usage: {sys.argv[0]} <{'|'.join(LEVELS)}> [--pdfs | --no-pdfs]")
    level = args[0]
    g = LEVELS[level]
    os.environ.setdefault("LUMIO_CHROMIUM", "/opt/pw-browsers/chromium" if os.path.exists("/opt/pw-browsers/chromium") else "")
    if "--pdfs" not in flags:
        run(g["slides"])
        run("gen_lessons_data_bundle.py")
        run(g["trial"])
    if "--no-pdfs" not in flags:
        run(g["pdfs"])
    print(f"\nDone: {level}. Review `git status` -- unseeded quiz shuffles may touch slides you did not change; "
          "keep only the lessons you edited.")


if __name__ == "__main__":
    main()
