# -*- coding: utf-8 -*-
"""
Generates missing audio for ALL spoken content site-wide, not just
lesson vocab: grammar-hub examples, phonics-hub sounds/words,
vocab-hub words, stories-hub keywords, writing-hub prompts, plus the
original lessons/*/*.json vocab+examples and fixed UI phrases.
Loads the Amy voice once and reuses it for every synthesis call
(much faster than shelling out to `python3 -m piper` per word).
Safe to re-run -- skips anything that already has a file. Supports
start:end slicing via argv for batching across multiple calls.
"""
import json, os, re, glob, subprocess, sys, wave

VOICE_MODEL = "/home/claude/lumio_voice/en_US-amy-medium.onnx"
OUTPUT_DIR = "assets/audio"
LENGTH_SCALE = 1.087

FIXED_PHRASES = ["Amazing! Three stars!", "Great job!", "Good try! Practice makes perfect!"]

def slugify(text):
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")

def clean_for_speech(text):
    # Reported-speech examples use a "->" transform notation for display;
    # speak just the first (quoted) part, which is the actual sentence.
    if "->" in text:
        text = text.split("->")[0].strip().strip('"')
    return text

def collect_words():
    words = set(FIXED_PHRASES)
    for fname in glob.glob("lessons/*/*.json"):
        d = json.load(open(fname, encoding="utf-8"))
        for v in d.get("vocab", []):
            en = (v.get("en") or "").strip()
            if en: words.add(en)
            ex = (v.get("example") or "").strip()
            if ex: words.add(ex)
    for f in glob.glob("grammar-hub/*.json"):
        d = json.load(open(f, encoding="utf-8"))
        for t in d["topics"]:
            for ex in t.get("examples", []):
                en = (ex.get("en") or "").strip()
                if en: words.add(clean_for_speech(en))
    for f in glob.glob("phonics-hub/*.json"):
        d = json.load(open(f, encoding="utf-8"))
        for u in d["units"]:
            for s in u.get("sounds", []):
                tok = s["letter"].split(",")[0].split("-")[0].strip()
                if tok: words.add(tok)
            for w in u.get("words", []):
                en = (w.get("en") or "").strip()
                if en: words.add(en)
    for f in glob.glob("vocab-hub/*.json"):
        d = json.load(open(f, encoding="utf-8"))
        for t in d["themes"]:
            for w in t.get("words", []):
                en = (w.get("en") or "").strip()
                if en: words.add(en)
    for f in glob.glob("stories-hub/*.json"):
        d = json.load(open(f, encoding="utf-8"))
        for s in d.get("stories", []):
            for w in s.get("keyWords", []):
                en = (w.get("en") or "").strip()
                if en: words.add(en)
    for f in glob.glob("writing-hub/*.json"):
        d = json.load(open(f, encoding="utf-8"))
        for p in d.get("prompts", []):
            en = (p.get("en") or "").strip()
            if en: words.add(en)
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

    start_idx = int(sys.argv[1]) if len(sys.argv) > 1 else 0
    end_idx = int(sys.argv[2]) if len(sys.argv) > 2 else len(to_generate)
    batch = to_generate[start_idx:end_idx]
    print(f"Total missing: {len(to_generate)}. Processing [{start_idx}:{end_idx}] ({len(batch)} files)")

    if not batch:
        return

    from piper import PiperVoice, SynthesisConfig
    voice = PiperVoice.load(VOICE_MODEL)
    cfg = SynthesisConfig(length_scale=LENGTH_SCALE)

    tmp_wav = "/tmp/_gen_audio_batch.wav"
    ok, fail = 0, 0
    for i, (word, slug, out_path) in enumerate(batch, 1):
        try:
            with wave.open(tmp_wav, "wb") as wav_file:
                voice.synthesize_wav(word, wav_file, syn_config=cfg)
            subprocess.run(
                ["ffmpeg", "-y", "-i", tmp_wav, "-codec:a", "libmp3lame", "-qscale:a", "4", out_path],
                check=True, capture_output=True,
            )
            ok += 1
        except Exception as e:
            print(f"  FAILED [{start_idx+i}] {word!r}: {e}")
            fail += 1
            continue
    print(f"Done. {ok} generated, {fail} failed, in batch of {len(batch)}.")

if __name__ == "__main__":
    main()
