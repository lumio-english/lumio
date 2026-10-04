# -*- coding: utf-8 -*-
"""
Imports voice recordings (from Artlist) into assets/audio/<slug>.mp3, the files Lumio.speak() plays.
A file may be named by its line number from recording/artlist/*.txt ("0001.mp3", "0001 hello.wav")
or by its slug ("hello.mp3"). Each one is trimmed (50 ms of air kept at both ends) and mastered
to -16 LUFS, peaks capped at -1 dBTP, mono 44.1 kHz 64k MP3, so every line sounds equally loud.
  python3 _docs/import-voice.py <folder with the recordings>
"""
import json, os, re, subprocess, sys, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "audio")
TARGET, PEAK = -16.0, -1.0
TRIM = "silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,adelay=50,apad=pad_dur=0.05"

def run(a): return subprocess.run(a, capture_output=True, text=True)

def loudness(path):
    # loop short words to 6 s so the integrated measurement (400 ms blocks) is meaningful
    r = run(["ffmpeg", "-hide_banner", "-nostats", "-stream_loop", "30", "-i", path, "-t", "6",
             "-af", "ebur128=peak=true", "-f", "null", "-"])
    i = re.findall(r"I:\s+(-?[\d.]+) LUFS", r.stderr)
    p = re.findall(r"Peak:\s+(-?[\d.]+|-inf) dBFS", r.stderr)
    return float(i[-1]), float(p[-1]) if p and p[-1] != "-inf" else -99.0

def level(src, dst):
    with tempfile.TemporaryDirectory() as tmp:
        wav = os.path.join(tmp, "a.wav")
        run(["ffmpeg", "-y", "-i", src, "-af", TRIM, "-ar", "44100", "-ac", "1", wav])
        lufs, peak = loudness(wav)
        chain = ["volume=%.2fdB" % (TARGET - lufs)]
        if peak + TARGET - lufs > PEAK: chain.append("alimiter=limit=%.4f:level=false" % (10 ** (PEAK / 20)))
        run(["ffmpeg", "-y", "-i", wav, "-af", ",".join(chain), "-c:a", "libmp3lame", "-b:a", "64k", dst])
    return lufs

if __name__ == "__main__":
    src_dir = sys.argv[1]
    lines = json.load(open(os.path.join(ROOT, "recording", "voice-script.json"), encoding="utf-8"))["lines"]
    by_n, slugs = {l["n"]: l["slug"] for l in lines}, {l["slug"] for l in lines}
    done, unknown = 0, []
    for f in sorted(os.listdir(src_dir)):
        stem, ext = os.path.splitext(f)
        if ext.lower() not in (".mp3", ".wav", ".m4a", ".flac", ".aif", ".aiff"): continue
        m = re.match(r"0*(\d+)\b", stem)
        slug = stem.lower() if stem.lower() in slugs else by_n.get(int(m.group(1))) if m else None
        if not slug: unknown.append(f); continue
        level(os.path.join(src_dir, f), os.path.join(OUT, slug + ".mp3")); done += 1
    print("imported", done, "files")
    if unknown: print("not matched to a line:", ", ".join(unknown))
