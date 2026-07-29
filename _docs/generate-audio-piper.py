#!/usr/bin/env python3
"""
Generates real audio for every vocab word/example sentence that
doesn't have one yet, using the Amy voice (piper-tts, same model as
_docs/generate-audio.py originally used via sherpa-onnx). Safe to
re-run any time -- only generates what's missing.
"""
import json, os, re, glob, subprocess, sys

PROJECT_ROOT = "/home/claude/lumio"
VOICE_MODEL = "/home/claude/lumio_voice/en_US-amy-medium.onnx"
OUTPUT_DIR = os.path.join(PROJECT_ROOT, "assets", "audio")
LENGTH_SCALE = "1.087"  # matches the original script's speed=0.92 (slightly slower, clearer for learners)

FIXED_PHRASES = [
    "Amazing! Three stars!",
    "Great job!",
    "Good try! Practice makes perfect!",
]

def slugify(text):
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")

def collect_words():
    words = set(FIXED_PHRASES)
    for level_dir in sorted(glob.glob(os.path.join(PROJECT_ROOT, "lessons", "*/"))):
        for fname in sorted(glob.glob(os.path.join(level_dir, "*.json"))):
            with open(fname, encoding="utf-8") as f:
                data = json.load(f)
            for v in data.get("vocab", []):
                en = (v.get("en") or "").strip()
                if en:
                    words.add(en)
                example = (v.get("example") or "").strip()
                if example:
                    words.add(example)
    return words

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    words = sorted(collect_words())
    to_generate = []
    for w in words:
        slug = slugify(w)
        if not slug:
            continue
        out_path = os.path.join(OUTPUT_DIR, f"{slug}.mp3")
        if os.path.exists(out_path):
            continue
        to_generate.append((w, slug, out_path))

    print(f"Found {len(words)} unique words/phrases, {len(to_generate)} need generating.")

    start_idx = int(sys.argv[1]) if len(sys.argv) > 1 else 0
    end_idx = int(sys.argv[2]) if len(sys.argv) > 2 else len(to_generate)
    batch = to_generate[start_idx:end_idx]
    print(f"Processing indices [{start_idx}:{end_idx}] ({len(batch)} files)")

    tmp_wav = "/tmp/_gen_audio.wav"
    for i, (word, slug, out_path) in enumerate(batch, 1):
        result = subprocess.run(
            ["python3", "-m", "piper", "-m", VOICE_MODEL, "-f", tmp_wav,
             "--length-scale", LENGTH_SCALE],
            input=word, text=True, capture_output=True,
        )
        if result.returncode != 0 or not os.path.exists(tmp_wav):
            print(f"  FAILED [{start_idx+i}] {word!r}: {result.stderr[-300:]}")
            continue
        subprocess.run(
            ["ffmpeg", "-y", "-i", tmp_wav, "-codec:a", "libmp3lame", "-qscale:a", "4", out_path],
            check=True, capture_output=True,
        )
        os.remove(tmp_wav)
        print(f"  [{start_idx+i}/{len(to_generate)}] {word!r} -> {slug}.mp3")

if __name__ == "__main__":
    main()
