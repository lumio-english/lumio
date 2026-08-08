# -*- coding: utf-8 -*-
"""Regenerates js/lessons-data.js, the offline bundle used as a fallback
by homework.html/lesson.html/present.html/student.html when live fetch
isn't available. This was stale after the Level 3/4 curriculum rebuild
(still had 'My Town', 'Jobs Around Town' etc. hardcoded) and, because
these pages check window.LUMIO_LESSONS BEFORE falling back to fetch,
that meant they were actively serving the OLD curriculum instead of
the new one. Run this any time lesson JSON content changes."""
import json, glob, os

LEVELS = ["pre-a", "level1", "level2", "level3", "level4"]
bundle = {}
for level in LEVELS:
    bundle[level] = {}
    for f in sorted(glob.glob(f"lessons/{level}/lesson*.json")):
        d = json.load(open(f, encoding="utf-8"))
        bundle[level][str(d["number"])] = d

with open("js/lessons-data.js", "w", encoding="utf-8") as f:
    f.write("window.LUMIO_LESSONS = ")
    json.dump(bundle, f, ensure_ascii=False, separators=(",", ": "))
    f.write(";\n")

total = sum(len(v) for v in bundle.values())
print(f"Regenerated js/lessons-data.js: {total} lessons across {len(LEVELS)} levels")
for level in LEVELS:
    print(f"  {level}: {len(bundle[level])} lessons")
