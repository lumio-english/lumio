# -*- coding: utf-8 -*-
"""
Builds recording/voice-script.json: every line the platform speaks, once each, in teaching
order (level by level, lesson by lesson, then that level's English Hub, games and slides).
The recording studio (recording-studio.html) reads it. Each entry's "slug" is the exact
file name Lumio.speak() looks for (assets/audio/<slug>.mp3), so a recording made in the
studio replaces the old computer voice with no code change. Re-run after adding content:
  python3 _docs/build-voice-script.py
"""
import json, os, re, glob, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
LEVELS = ["pre-a", "level1", "level2", "level3", "level4", "level5", "level6", "level7", "level8", "level9"]
LEVEL_NAMES = {"pre-a": "Pre-A", "general": "Everywhere"}
for i in range(1, 10): LEVEL_NAMES["level%d" % i] = "Level %d" % i

def slugify(t): return re.sub(r"[^a-z0-9]+", "-", str(t).lower().strip()).strip("-")   # = js/app.js slugify
def clean(t):
    t = str(t or "").strip()
    if "->" in t: t = t.split("->")[0].strip().strip('"')
    return re.sub(r"\s+", " ", t)

entries, seen = [], {}
def add(text, level, where, kind):
    text = clean(text)
    if not text or not re.search(r"[A-Za-z]", text) or re.search(r"[؀-ۿ]", text): return
    s = slugify(text)
    if not s or len(s) > 180: return
    if s in seen:
        seen[s]["uses"] += 1; return
    e = {"slug": s, "text": text, "level": level, "where": where, "kind": kind, "uses": 1}
    seen[s] = e; entries.append(e)

# 1) lessons (prep): each word, then its example sentence
lessons = json.loads(subprocess.check_output(["node", "-e",
    "global.window={};eval(require('fs').readFileSync('js/lessons-data.js','utf8'));process.stdout.write(JSON.stringify(window.LUMIO_LESSONS))"]))
def level_files(folder):
    out = {}
    for f in glob.glob(folder + "/*.json"):
        lv = os.path.splitext(os.path.basename(f))[0]
        try: out[lv] = json.load(open(f, encoding="utf-8"))
        except Exception: pass
    return out
vocab_hub, grammar, phonics, idioms = level_files("vocab-hub"), level_files("grammar-hub"), level_files("phonics-hub"), level_files("idioms-hub")
stories, writing, spelling = level_files("stories-hub"), level_files("writing-hub"), level_files("spelling-hub")

def literal_speaks(paths):
    out = []
    for p in paths:
        try: src = open(p, encoding="utf-8", errors="ignore").read()
        except Exception: continue
        for m in re.finditer(r"""(?:Lumio\.)?speak\(\s*(['"])((?:\\.|(?!\1).){2,200}?)\1""", src):
            out.append(m.group(2).replace("\\'", "'").replace('\\"', '"'))
    return out

for lv in LEVELS:
    for n in sorted((lessons.get(lv) or {}), key=lambda x: int(x)):
        ls = lessons[lv][n]; where = "Lesson %s · %s" % (n, ls.get("title", ""))
        for w in ls.get("vocab", []):
            add(w.get("en"), lv, where, "word")
            add(w.get("example"), lv, where, "sentence")
        for a in ls.get("activities", []):
            for item in (a.get("items") or a.get("sequence") or []):
                if isinstance(item, dict): add(item.get("en") or item.get("text"), lv, where, "sentence")
    hub = "English Hub · "
    for t in (vocab_hub.get(lv) or {}).get("themes", []):
        for w in t.get("words", []): add(w.get("en"), lv, hub + "Vocabulary · " + t.get("theme", ""), "word")
    for u in (phonics.get(lv) or {}).get("units", []):
        for s in u.get("sounds", []): add(s.get("example") or "", lv, hub + "Phonics · " + u.get("unit", ""), "word")
        for w in u.get("words", []): add(w.get("en"), lv, hub + "Phonics · " + u.get("unit", ""), "word")
        if isinstance(u.get("story"), dict): add(u["story"].get("en"), lv, hub + "Phonics story · " + u.get("unit", ""), "sentence")
    for t in (grammar.get(lv) or {}).get("topics", []):
        for ex in t.get("examples", []): add(ex.get("en"), lv, hub + "Grammar · " + t.get("title", ""), "sentence")
    for i in (idioms.get(lv) or {}).get("idioms", []):
        add(i.get("phrase"), lv, hub + "Idioms", "sentence"); add(i.get("example"), lv, hub + "Idioms", "sentence")
    for s in (stories.get(lv) or {}).get("stories", []):
        for w in s.get("keyWords", []): add(w if isinstance(w, str) else w.get("en"), lv, hub + "Stories · " + s.get("title", ""), "word")
    for p in (writing.get(lv) or {}).get("prompts", []):
        add(p.get("en") if isinstance(p, dict) else p, lv, hub + "Writing & speaking", "sentence")
    for r in (spelling.get(lv) or {}).get("rules", []):
        ex = r.get("example") or {}
        if isinstance(ex, dict): add(ex.get("word"), lv, hub + "Spelling", "word")
    # games, stories and class slides that live in a level folder
    paths = glob.glob("story-content/%s/**/*.html" % lv, recursive=True) + glob.glob("slide-content/%s/**/*.html" % lv, recursive=True) \
          + glob.glob("games/*%s*.html" % lv)
    for t in literal_speaks(paths): add(t, lv, "Games, stories & class slides", "sentence" if " " in t.strip() else "word")

# 2) anything else the site says (games for every level, praise lines, UI phrases)
for t in ["Amazing! Three stars!", "Great job!", "Good try! Practice makes perfect!"]: add(t, "general", "Praise", "sentence")
other = [p for p in glob.glob("*.html") + glob.glob("games/*.html") + glob.glob("js/*.js") if "vendor" not in p]
for t in literal_speaks(other): add(t, "general", "Games & activities", "sentence" if " " in t.strip() else "word")

have = set(f[:-4] for f in os.listdir("assets/audio") if f.endswith(".mp3"))
for i, e in enumerate(entries, 1):
    e["n"] = i; e["hasOldAudio"] = e["slug"] in have
summary = {}
for e in entries: summary.setdefault(e["level"], {"lines": 0, "words": 0, "sentences": 0}); s = summary[e["level"]]; s["lines"] += 1; s["words" if e["kind"] == "word" else "sentences"] += 1
out = {"version": 1, "levels": [{"id": k, "name": LEVEL_NAMES.get(k, k), **v} for k, v in summary.items()], "lines": entries}
os.makedirs("recording", exist_ok=True)
json.dump(out, open("recording/voice-script.json", "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print(len(entries), "lines"); [print(" ", l["name"], l["lines"], "(%d words, %d sentences)" % (l["words"], l["sentences"])) for l in out["levels"]]
