# -*- coding: utf-8 -*-
"""
Writes the text to paste into Artlist's voiceover from recording/voice-script.json.
Single words are written as their own sentence ("Hello.", "Ice cream.") so the voice reads
them alone with a falling tone, not like the start of a sentence.
  python3 _docs/voice-batches.py test      -> recording/artlist/test.txt (20 Pre-A words + 20 sentences)
  python3 _docs/voice-batches.py all       -> recording/artlist/<level>.txt (every line, in teaching order)
Each line is "NNNN<TAB>text"; NNNN is the line's "n" in voice-script.json. Save each recording
as NNNN.mp3 (or <slug>.mp3) and _docs/import-voice.py puts it in assets/audio/<slug>.mp3.
"""
import json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "recording", "artlist")

def spoken(line):
    t = line["text"].strip()
    if line["kind"] == "word":
        if t[:1].islower() and t not in ("i",): t = t[0].upper() + t[1:]
        if t[-1:] not in ".!?": t += "."
    return t

def write(name, lines):
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, name + ".txt"), "w", encoding="utf-8") as f:
        for l in lines: f.write("%04d\t%s\n" % (l["n"], spoken(l)))
    print(name + ".txt", len(lines), "lines")

if __name__ == "__main__":
    lines = json.load(open(os.path.join(ROOT, "recording", "voice-script.json"), encoding="utf-8"))["lines"]
    if (sys.argv[1:] or ["test"])[0] == "all":
        for lv in dict.fromkeys(l["level"] for l in lines): write(lv, [l for l in lines if l["level"] == lv])
    else:
        pre = [l for l in lines if l["level"] == "pre-a"]
        write("test", [l for l in pre if l["kind"] == "word"][:20] + [l for l in pre if l["kind"] == "sentence"][:20])
