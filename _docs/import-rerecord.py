# -*- coding: utf-8 -*-
"""Imports a re-record batch into assets/audio/<slug>.mp3 (the files Lumio.speak() plays).
  python3 _docs/import-rerecord.py <folder with the recordings> [--list recording/rerecord-2026-10-15.txt] [--dry]
- Matches ONLY by exact file name = a slug (first column) of the list, never by a line number, so
  "7-o-clock.mp3" or "2027.mp3" can't be taken for line 7 / line 2027 the way _docs/import-voice.py would,
  and a skipped or extra download can't shift every clip after it.
- Same chain as _docs/import-voice.py (its own level(): trim 50 ms air, -16 LUFS, peaks -1 dBTP,
  mono 44.1 kHz 64k MP3).
- Copies any file it replaces to <repo>/../lumio-voice-backup/<slug>.mp3 first (never overwrites a backup).
- Prints what it imported, files not on the list, and the lines of the list still to record
  (written to <folder>/still-to-record.txt)."""
import importlib.util, os, shutil, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "audio")
BACKUP = os.path.join(os.path.dirname(ROOT), "lumio-voice-backup")
AUDIO_EXT = (".mp3", ".wav", ".m4a", ".flac", ".aif", ".aiff")

spec = importlib.util.spec_from_file_location("import_voice", os.path.join(ROOT, "_docs", "import-voice.py"))
iv = importlib.util.module_from_spec(spec); spec.loader.exec_module(iv)

args = [a for a in sys.argv[1:] if not a.startswith("--")]
if not args: sys.exit(__doc__)
src_dir, dry = args[0], "--dry" in sys.argv
list_path = os.path.join(ROOT, "recording", "rerecord-2026-10-15.txt")
if "--list" in sys.argv: list_path = sys.argv[sys.argv.index("--list") + 1]

wanted = {}  # slug -> words to say, in list order
for line in open(list_path, encoding="utf-8"):
    if line.startswith("#") or "\t" not in line: continue
    slug, say = line.rstrip("\n").split("\t", 1)
    wanted[slug.strip()] = say

found, unknown, done = set(), [], 0
for f in sorted(os.listdir(src_dir)):
    stem, ext = os.path.splitext(f)
    if ext.lower() not in AUDIO_EXT: continue
    slug = stem.lower().strip()
    if slug not in wanted: unknown.append(f); continue
    found.add(slug)
    dst = os.path.join(OUT, slug + ".mp3")
    action = "replaced" if os.path.exists(dst) else "added"
    if dry: print(action, slug); continue
    if action == "replaced":
        bk = os.path.join(BACKUP, slug + ".mp3")
        if not os.path.exists(bk): os.makedirs(BACKUP, exist_ok=True); shutil.copy2(dst, bk)
    iv.level(os.path.join(src_dir, f), dst); done += 1
    print(action, slug)

print("imported", done, "files" + (" (dry run)" if dry else ""))
if unknown: print("not on the list (skipped):", ", ".join(unknown))
missing = [s for s in wanted if s not in found]
with open(os.path.join(src_dir, "still-to-record.txt"), "w", encoding="utf-8") as fh:
    fh.writelines("%s\t%s\n" % (s, wanted[s]) for s in missing)
print("still to record from the list:", len(missing), "(see still-to-record.txt in the folder)")
