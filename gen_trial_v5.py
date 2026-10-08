"""Trial classes, version 5 "show stage" design (same content): builds slide-content-v5/trial/<level>/ and
slide-content-v5/trial-solo/<level>/ from the same trial generators as the classic trial decks.

    python3.12 gen_trial_v5.py level1          # pre-a, level1 .. level6

Runs gen_trial_<level>.py from its source with the version-5 slide templates swapped in (lib/deck_v3_kid.py for
Pre-A/L1/L2, lib/deck_v3_teen.py for L3-L6) and its output paths rewritten to the v5 folders, so the classic trial
decks in slide-content/trial*/ are never touched. Every written slide is wrapped in the v5 container (the trial-only
slides -- welcome, teams, buzzer, relay, scoreboard, finale, finish -- are written inline by the trial scripts), and
present-trial.html + css/trial-stage.css turn the whole deck into the game-show stage look."""
import os, re, sys, glob
sys.path.insert(0, "lib")
SCRIPTS = {"pre-a": "gen_trial_prea.py", "level1": "gen_trial_level1.py", "level2": "gen_trial_level2.py",
           "level3": "gen_trial_level3.py", "level4": "gen_trial_level4.py", "level5": "gen_trial_level5.py",
           "level6": "gen_trial_level6.py"}
TEEN = ("level3", "level4", "level5", "level6")


def main(level):
    script = SCRIPTS[level]
    src = open(script, encoding="utf-8").read()
    a = '"slide-content/trial/'
    assert a in src, f"{script}: output path not found"
    src = src.replace(a, '"slide-content-v5/trial/')
    if level in TEEN:
        import deck_v3_teen as V
    else:
        import deck_v3_kid as V
    V.install(level)
    if level in TEEN:
        # the teen trials still build some slides with the older teen helpers (lib/deck_template_teen.py: the
        # sentence builder, dialogue, recap, team/buzzer pages); give those the v5 background and header too
        import deck_template_teen as v1
        v1.bg_base = lambda variant="default": V._bg()
        v1.header = V.header
    import trial_solo                                     # the 1-on-1 deck writes to its own folder
    tsrc = open(trial_solo.__file__, encoding="utf-8").read().replace('f"slide-content/trial-solo/{level}"', 'f"slide-content-v5/trial-solo/{level}"')
    assert "slide-content-v5/trial-solo" in tsrc
    exec(compile(tsrc, trial_solo.__file__, "exec"), trial_solo.__dict__)
    # the trial scripts pass sys.modules[__name__] to helpers (trial_common, trial_solo): run them as the real __main__
    import types
    mod = types.ModuleType("__main__"); mod.__file__ = script
    runner, sys.modules["__main__"] = sys.modules.get("__main__"), mod
    try:
        exec(compile(src, script, "exec"), mod.__dict__)
    finally:
        sys.modules["__main__"] = runner
    # trial-only slides are inline HTML: give every slide the v5 wrapper (template slides already have it)
    n = 0
    for d in (f"slide-content-v5/trial/{level}", f"slide-content-v5/trial-solo/{level}"):
        for f in sorted(glob.glob(d + "/slide-*.html")):
            html = open(f, encoding="utf-8").read()
            if 'class="v3 ' not in html[:200]:
                html = V.finish(html); n += 1
            html = html.replace('class="v3 ', 'class="v3 v3-trial ', 1)
            html = re.sub(r'(<div class="v3-lesson">.*?<small>[^<]*</small>)Lesson \d+', r'\1Trial class', html, count=1, flags=re.S)   # a trial is not "Lesson 1"
            open(f, "w", encoding="utf-8").write(html)
    print(f"{level}: wrapped {n} trial-only slides")


if __name__ == "__main__":
    main(sys.argv[1])
