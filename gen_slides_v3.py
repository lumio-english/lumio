"""Class slides v3 (new design, same content): builds slide-content-v5/<level>/ and assets/slides-v5/<level>/manifest.json
from the same lesson data and deck plan as the classic decks.

    python3.12 gen_slides_v3.py level1            # kids levels: pre-a, level1, level2
    python3.12 gen_slides_v3.py level4            # teen levels: level3..level6 (gen_slides_v3_teen.py)
Runs the level's own classic generator script with the v3 templates swapped in (lib/deck_v3_kid.py), writing to the
v5 folders instead of the live slide-content/ ones, so the classic decks are never touched."""
import sys, runpy
sys.path.insert(0, "lib")
LEVEL = sys.argv[1]
KID = {"pre-a": "gen_slides_prea_v2.py", "level1": "gen_slides_level1_v2.py", "level2": "gen_slides_level2_v2.py"}
if LEVEL in KID:
    import deck_template_v2 as T
    import deck_v3_kid
    deck_v3_kid.install(LEVEL)
    orig_run = T.run
    def run(level, *a, **kw):
        kw["out_root"], kw["manifest_root"] = "slide-content-v5", "assets/slides-v5"
        return orig_run(level, *a, **kw)
    T.run = run
    runpy.run_path(KID[LEVEL], run_name="__main__")
else:
    import gen_slides_v3_teen                      # teens, level3..level6 (lib/deck_v3_teen.py)
    gen_slides_v3_teen.main(LEVEL)
