# -*- coding: utf-8 -*-
"""
Levels the Artlist sound effects and music loops so they all sound equally loud, then writes
them to assets/sfx/<name>.mp3 (the names js/app.js plays; see _docs/sound-effects-list.md).
Playback volume is set in code (SFX_VOL per effect, music .18), so every file is mastered to the
same loudness here: -16 LUFS, peaks capped at -1 dBTP, 44.1 kHz stereo, 128k MP3.
  - effects: leading/trailing silence trimmed, 8 ms fade-out so nothing clicks
  - music: not trimmed or faded, so a loop that starts and ends cleanly stays seamless
Input = any audio files (MP3 or WAV) whose names start with the target name, e.g.
"correct.wav", "music-games (Artlist).mp3". Usage:
  python3 _docs/level-sfx.py <folder with the downloads>
"""
import json, os, re, subprocess, sys, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "sfx")
NAMES = ["correct", "wrong", "star", "complete", "music-games", "music-story"]
TARGET, PEAK = -16.0, -1.0

def run(args): return subprocess.run(args, capture_output=True, text=True)

def loudness(path):
    # short effects are looped to 6 s so the integrated measurement (400 ms blocks) is meaningful
    r = run(["ffmpeg", "-hide_banner", "-nostats", "-stream_loop", "20", "-i", path, "-t", "6",
             "-af", "ebur128=peak=true", "-f", "null", "-"])
    i = re.findall(r"I:\s+(-?[\d.]+) LUFS", r.stderr)
    p = re.findall(r"Peak:\s+(-?[\d.]+|-inf) dBFS", r.stderr)
    return float(i[-1]), float(p[-1]) if p and p[-1] != "-inf" else -99.0

def duration(path):
    return float(run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path]).stdout)

def level(src, name):
    music = name.startswith("music-")
    dst = os.path.join(OUT, name + ".mp3")
    with tempfile.TemporaryDirectory() as tmp:
        wav = os.path.join(tmp, "a.wav")
        pre = [] if music else ["-af", "silenceremove=start_periods=1:start_threshold=-55dB,"
                                       "areverse,silenceremove=start_periods=1:start_threshold=-55dB,areverse"]
        run(["ffmpeg", "-y", "-i", src, *pre, "-ar", "44100", "-ac", "2", wav])
        lufs, peak = loudness(wav)
        gain = TARGET - lufs
        chain = ["volume=%.2fdB" % gain]
        if peak + gain > PEAK: chain.append("alimiter=limit=%.4f:level=false" % (10 ** (PEAK / 20)))
        if not music: chain.append("afade=t=out:st=%.3f:d=0.008" % max(0, duration(wav) - 0.008))
        run(["ffmpeg", "-y", "-i", wav, "-af", ",".join(chain), "-c:a", "libmp3lame", "-b:a", "128k", dst])
    l2, p2 = loudness(dst)
    return {"file": name + ".mp3", "from": os.path.basename(src), "seconds": round(duration(dst), 2),
            "before_lufs": round(lufs, 1), "after_lufs": round(l2, 1), "peak_db": round(p2, 1)}

if __name__ == "__main__":
    src_dir = sys.argv[1] if len(sys.argv) > 1 else "."
    os.makedirs(OUT, exist_ok=True)
    files = sorted(f for f in os.listdir(src_dir) if f.lower().endswith((".mp3", ".wav", ".m4a", ".aif", ".aiff", ".flac")))
    for name in NAMES:
        hit = [f for f in files if os.path.splitext(f)[0].lower() == name] or \
              [f for f in files if f.lower().startswith(name) and not (name == "star" and f.lower().startswith("start"))]
        if not hit: print("missing:", name); continue
        print(json.dumps(level(os.path.join(src_dir, hit[0]), name)))
