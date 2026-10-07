"""Class slides v3, teens (Levels 3-6): builds slide-content-v5/<level>/ and assets/slides-v5/<level>/manifest.json.

    python3.12 gen_slides_v3.py level4          # (dispatches here for level3..level6)

Runs the level's own classic generator (gen_slides_<level>_teenv2.py) with the v3 "night studio" templates swapped in
(lib/deck_v3_teen.py). The classic script writes to hard-coded slide-content/ and assets/slides/ paths, so it is run
from its source with only those two output prefixes rewritten to the v5 folders: same lesson data, same deck plan,
and the classic decks are never touched. V3_PLAIN=1 skips the template swap (a parity check: the output must then be
byte-identical to the classic deck)."""
import os, sys
sys.path.insert(0, "lib")
TEEN = {"level3": "gen_slides_level3_teenv2.py", "level4": "gen_slides_level4_teenv2.py",
        "level5": "gen_slides_level5_teenv2.py", "level6": "gen_slides_level6_teenv2.py"}


def main(level):
    script = TEEN[level]
    src = open(script, encoding="utf-8").read()
    for a, b in (('"slide-content/', '"slide-content-v5/'), ('"assets/slides/', '"assets/slides-v5/')):
        assert a in src, f"{script}: output path {a} not found"
        src = src.replace(a, b)
    assert "slide-content/" not in src.replace("slide-content-v5/", "") and "assets/slides/" not in src
    if not os.environ.get("V3_PLAIN"):
        import deck_v3_teen
        deck_v3_teen.install(level)
    exec(compile(src, script, "exec"), {"__name__": "__main__", "__file__": script})


if __name__ == "__main__":
    main(sys.argv[1])
