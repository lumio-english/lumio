# -*- coding: utf-8 -*-
"""Everything a printable needs about one lesson, gathered from the course's own sources (never invented here):
lessons/<level>/lessonNN.json (words, examples, goal, grammar focus), the grammar unit and its common mistakes
(grammar-hub + lib/common_mistakes.py for Levels 3-6, GRAMMAR_UNITS in gen_slides_<level>_v2.py + common_mistakes.KIDS
for Pre-A-Level 2), the lesson dialogue (Crew Talk for teens, DIALOGUES for kids), the phonics group (phonics-hub,
unit i = lesson 2i-1), the Reading Lab text (lib/reading_passages.py) and the level's writing prompts (writing-hub)."""
import ast, glob, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "lib"))

LEVELS = ["pre-a", "level1", "level2", "level3", "level4", "level5", "level6"]
LABEL = {"pre-a": "Pre-A", **{f"level{i}": f"Level {i}" for i in range(1, 7)}}
STAGE = {"pre-a": "prea", "level1": "kid", "level2": "kid", "level3": "teen", "level4": "teen", "level5": "teen", "level6": "teen"}
KID_SLIDES = {"pre-a": "gen_slides_prea_v2.py", "level1": "gen_slides_level1_v2.py", "level2": "gen_slides_level2_v2.py"}

_cache = {}


def _json(path):
    if path not in _cache:
        _cache[path] = json.load(open(os.path.join(ROOT, path), encoding="utf-8")) if os.path.exists(os.path.join(ROOT, path)) else None
    return _cache[path]


def _literal(script, name):
    """A dict literal from a slide generator, read without running the script."""
    key = (script, name)
    if key not in _cache:
        _cache[key] = {}
        tree = ast.parse(open(os.path.join(ROOT, script), encoding="utf-8").read())
        for node in tree.body:
            if isinstance(node, ast.Assign) and getattr(node.targets[0], "id", "") == name:
                try:
                    _cache[key] = ast.literal_eval(node.value)
                except ValueError:
                    pass
    return _cache[key]


def lessons(level):
    return {d["number"]: d for d in (_json(os.path.relpath(f, ROOT)) for f in sorted(glob.glob(os.path.join(ROOT, f"lessons/{level}/lesson*.json"))))}


def grammar(level, num):
    """(topic dict with title/explanation/explanationAr/examples, [mistake tuples]) or (None, [])."""
    import common_mistakes as CM
    if STAGE[level] == "teen":
        if ("gm", level) not in _cache:
            import grammar_slides as G
            _cache[("gm", level)] = G.match_grammar_by_lesson_focus(level, lessons(level))
        t = _cache[("gm", level)].get(num)
        return t, (CM.mistakes_for(t) if t else [])
    t = _literal(KID_SLIDES[level], "GRAMMAR_UNITS").get(num)
    return t, (CM.KIDS.get(t["title"], []) if t else [])


def dialogue(level, num):
    """[(speaker, en, ar)] for the lesson."""
    if STAGE[level] == "teen":
        try:
            mod = __import__(f"crew_talk_{level}")
            return [tuple(x) for x in mod.CREW_TALK.get(num, [])]
        except ImportError:
            return []
    return [tuple(x) for x in _literal(KID_SLIDES[level], "DIALOGUES").get(num, [])]


def phonics(level, num):
    d = _json(f"phonics-hub/{level}.json")
    if not d or num % 2 == 0:
        return None
    i = (num + 1) // 2 - 1
    return d["units"][i] if i < len(d["units"]) else None


def passage(level, num):
    import reading_passages as R
    return R.PASSAGES.get(level, {}).get(num)


def prompt(level, num, lesson):
    """The writing-hub prompt that best fits the lesson (shared words with its title, goal and words)."""
    d = _json(f"writing-hub/{level}.json")
    if not d or not d.get("prompts"):
        return None
    w = lambda s: set(re.findall(r"[a-z]{3,}", s.lower())) - {"the", "and", "you", "your", "what", "about", "can", "with", "talk", "describe"}
    target = w(lesson["title"] + " " + lesson.get("goal", "") + " " + " ".join(v["en"] for v in lesson["vocab"]))
    best = max(d["prompts"], key=lambda p: (len(w(p["en"]) & target), -d["prompts"].index(p)))
    return best if w(best["en"]) & target else None


def lesson_pack(level, num):
    L = lessons(level)[num]
    topic, mistakes = grammar(level, num)
    return dict(level=level, num=num, label=LABEL[level], stage=STAGE[level], lesson=L, title=L["title"], title_ar=L.get("titleAr", ""),
                goal=L.get("goal", ""), focus=L.get("grammarFocus", ""), words=L["vocab"], topic=topic, mistakes=mistakes,
                dialogue=dialogue(level, num), phonics=phonics(level, num), passage=passage(level, num),
                prompt=prompt(level, num, L), review=num == len(lessons(level)))
