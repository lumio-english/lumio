#!/usr/bin/env bash
# Cloudflare Pages build: copies only the files the website serves into dist/ (Pages build output directory).
# Cloudflare Pages (free) publishes at most 20,000 files, and the repository also holds the generators, docs and the
# old "classic" slide decks (~10,000 files) that visitors never load, so those stay out:
#   _docs/ lib/ slidegen-src/ recording/ .claude/   tools, notes, sources
#   slide-content/ + assets/slides/*.jpg           classic decks (only ?deck=classic used them; v5 is the default)
#   *.py *.gs *.md *.bak                            scripts and notes
# Cloudflare settings: Build command  bash cloudflare-build.sh   ·   Build output directory  dist
set -euo pipefail
rm -rf dist && mkdir dist
git ls-files -z \
  | grep -zvE '^(_docs|lib|slidegen-src|recording|\.claude|slide-content)/|^assets/slides/.*\.jpg$|\.(py|gs|md|bak)$|^(\.gitignore|CNAME|cloudflare-build\.sh)$' \
  | xargs -0 cp --parents -t dist
count=$(find dist -type f | wc -l)
echo "Lumio: $count files in dist/"
if [ "$count" -gt 19500 ]; then echo "Too many files for Cloudflare Pages (limit 20,000)"; exit 1; fi
