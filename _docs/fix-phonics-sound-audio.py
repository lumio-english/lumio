# -*- coding: utf-8 -*-
"""
Fixes a real bug: phonics sound tiles were speaking the LETTER NAME
(e.g. tapping "s" said "ess", tapping "p" said "pee") instead of the
actual phonetic SOUND, because generic TTS reads isolated letters as
their alphabet names. Verified via piper's espeak phonemizer that
appending a schwa ("-uh") forces true phoneme + schwa pronunciation
for every consonant/blend (e.g. "s"->"suh" actually produces /s/+/ʌ/,
not /ɛs/), and that short vowels need a minimal real word ("a"->"at")
to avoid the long-vowel letter-name reading.

These map ONLY changes what's SPOKEN when a sound tile is tapped --
the displayed letter/label in the UI is untouched.
"""
import wave
from piper import PiperVoice, SynthesisConfig

VOICE_MODEL = "/home/claude/lumio_voice/en_US-amy-medium.onnx"
LENGTH_SCALE = 1.087

SPEECH_MAP = {
    # single letters -> phoneme + schwa (verified via espeak phonemizer)
    "s": "suh", "t": "tuh", "p": "puh", "n": "nuh", "m": "muh", "d": "duh",
    "g": "guh", "c": "kuh", "k": "kuh", "r": "ruh", "h": "huh", "b": "buh",
    "f": "fuh", "l": "luh", "j": "juh", "v": "vuh", "w": "wuh", "x": "xuh",
    "y": "yuh", "z": "zuh",
    # short vowels -> minimal real word forces short reading (bare letter
    # gets read as the long-vowel letter NAME otherwise)
    "a": "at", "e": "ed", "i": "it", "o": "ot", "u": "ut",
    # digraphs
    "ck": "kuh", "sh": "shuh", "ch": "chuh", "th": "thuh", "ng": "ing",
    # blends
    "bl": "bluh", "cl": "cluh", "fl": "fluh", "pl": "pluh", "sl": "sluh",
    "br": "bruh", "cr": "cruh", "dr": "druh", "fr": "fruh", "gr": "gruh", "tr": "truh",
    "sp": "spuh", "st": "stuh", "sk": "skuh", "sm": "smuh", "sn": "snuh", "sw": "swuh",
    # vowel teams -> the example word carries the clean sound
    "ai": "rain", "ee": "tree", "oa": "boat",
}

def slugify(t):
    import re
    return re.sub(r"[^a-z0-9]+", "-", t.lower().strip()).strip("-")

def main():
    voice = PiperVoice.load(VOICE_MODEL)
    cfg = SynthesisConfig(length_scale=LENGTH_SCALE)
    for letter, speech_text in SPEECH_MAP.items():
        out_path = f"assets/audio/phonics-sound-{slugify(letter)}.mp3"
        tmp_wav = "/tmp/_phonics_sound.wav"
        with wave.open(tmp_wav, "wb") as wf:
            voice.synthesize_wav(speech_text, wf, syn_config=cfg)
        import subprocess
        subprocess.run(["ffmpeg", "-y", "-i", tmp_wav, "-codec:a", "libmp3lame", "-qscale:a", "4", out_path],
                        check=True, capture_output=True)
        print(f"{letter!r} -> speaks {speech_text!r} -> {out_path}")

if __name__ == "__main__":
    main()
