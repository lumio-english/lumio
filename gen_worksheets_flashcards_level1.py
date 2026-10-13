# -*- coding: utf-8 -*-
"""Kept so old commands still work: the level1 homework sheets, writing sheets and flashcards are built by
gen_printables.py (one generator for every level since Oct 2026)."""
import os, subprocess, sys

here = os.path.dirname(os.path.abspath(__file__))
sys.exit(subprocess.call([sys.executable, os.path.join(here, "gen_printables.py"), "level1"] + sys.argv[1:]))
