#!/usr/bin/env python3
"""
Generates real, natural-sounding audio for Lumio English's vocabulary,
using Piper's "Amy" neural voice (via sherpa-onnx) — completely free,
runs entirely locally, no API keys or paid service needed.

WHAT THIS DOES
  1. Scans every lessons/{level}/lesson*.json file for vocab[].en words.
  2. Also generates the fixed congratulation phrases from js/lesson.js.
  3. Generates one MP3 per unique word/phrase into assets/audio/.
  4. Skips anything that already has a file — safe to re-run any time
     you add new lessons; it only generates what's new.

WHY "REAL AUDIO" AT ALL
  The site's default is the browser's built-in text-to-speech
  (speechSynthesis), which sounds different — often worse — depending
  on whatever voice happens to be installed on each student's device.
  These pre-generated files sound the same, and sound genuinely
  natural, on every device. js/app.js's speak() tries a matching file
  in assets/audio/ first and falls back to the old browser TTS
  automatically for anything that doesn't have one yet.

HOW TO RUN THIS YOURSELF LATER (e.g. after adding Level 2+ lessons)
  pip install sherpa-onnx --break-system-packages

  Download the Amy voice model once (~67MB), if you don't still have it:
    curl -sL -o amy.tar.bz2 \
      https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-en_US-amy-medium.tar.bz2
    tar xjf amy.tar.bz2

  Then, from the project root:
    python3 _docs/generate-audio.py

  Needs ffmpeg on PATH for the WAV->MP3 conversion step
  (apt install ffmpeg / brew install ffmpeg).
"""
import json
import os
import re
import subprocess
import sys
import wave

import numpy as np
import sherpa_onnx

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LESSONS_DIR = os.path.join(PROJECT_ROOT, "lessons")
OUTPUT_DIR = os.path.join(PROJECT_ROOT, "assets", "audio")
VOICE_DIR = os.environ.get("PIPER_VOICE_DIR", os.path.join(os.getcwd(), "vits-piper-en_US-amy-medium"))

# Fixed phrases js/lesson.js speaks at the end of a lesson (see showResults()).
FIXED_PHRASES = [
    "Amazing! Three stars!",
    "Great job!",
    "Good try! Practice makes perfect!",
]


def slugify(text):
    """Must exactly match js/app.js's slugify() — same algorithm, same output."""
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")


def collect_words():
    words = set(FIXED_PHRASES)
    if not os.path.isdir(LESSONS_DIR):
        print(f"No lessons/ directory found at {LESSONS_DIR}")
        return words
    for level in sorted(os.listdir(LESSONS_DIR)):
        level_dir = os.path.join(LESSONS_DIR, level)
        if not os.path.isdir(level_dir):
            continue
        for fname in sorted(os.listdir(level_dir)):
            if not fname.endswith(".json"):
                continue
            with open(os.path.join(level_dir, fname), encoding="utf-8") as f:
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
    if not os.path.isdir(VOICE_DIR):
        print(f"Voice model not found at {VOICE_DIR}")
        print("Download it first (see this script's docstring for the exact commands).")
        sys.exit(1)

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    words = sorted(collect_words())
    print(f"Found {len(words)} unique words/phrases across all lessons.")

    to_generate = []
    for w in words:
        slug = slugify(w)
        if not slug:
            continue
        out_path = os.path.join(OUTPUT_DIR, f"{slug}.mp3")
        if os.path.exists(out_path):
            continue
        to_generate.append((w, slug, out_path))

    if not to_generate:
        print("Nothing new to generate — every word already has a file.")
        return

    print(f"Generating {len(to_generate)} new audio files...")

    tts_config = sherpa_onnx.OfflineTtsConfig(
        model=sherpa_onnx.OfflineTtsModelConfig(
            vits=sherpa_onnx.OfflineTtsVitsModelConfig(
                model=os.path.join(VOICE_DIR, "en_US-amy-medium.onnx"),
                tokens=os.path.join(VOICE_DIR, "tokens.txt"),
                data_dir=os.path.join(VOICE_DIR, "espeak-ng-data"),
            ),
            num_threads=2,
        ),
        max_num_sentences=1,
    )
    tts = sherpa_onnx.OfflineTts(tts_config)

    tmp_wav = os.path.join(PROJECT_ROOT, "_tmp_gen.wav")
    for i, (word, slug, out_path) in enumerate(to_generate, 1):
        audio = tts.generate(word, sid=0, speed=0.92)
        with wave.open(tmp_wav, "wb") as f:
            f.setnchannels(1)
            f.setsampwidth(2)
            f.setframerate(audio.sample_rate)
            samples_int16 = (np.array(audio.samples) * 32767).astype(np.int16)
            f.writeframes(samples_int16.tobytes())
        subprocess.run(
            ["ffmpeg", "-y", "-i", tmp_wav, "-codec:a", "libmp3lame", "-qscale:a", "4", out_path],
            check=True, capture_output=True,
        )
        print(f"  [{i}/{len(to_generate)}] {word!r} -> assets/audio/{slug}.mp3")

    if os.path.exists(tmp_wav):
        os.remove(tmp_wav)
    print("Done.")


if __name__ == "__main__":
    main()
