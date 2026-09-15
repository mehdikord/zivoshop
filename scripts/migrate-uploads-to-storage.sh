#!/usr/bin/env bash
# Migrate legacy public/uploads → storage/ (safe to re-run)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/public/uploads"
DST="$ROOT/storage"

mkdir -p "$DST/media" "$DST/products"

if [[ -d "$SRC/media" ]]; then
  shopt -s nullglob
  files=("$SRC/media"/*)
  if ((${#files[@]})); then
    cp -an "$SRC/media"/. "$DST/media"/
    echo "Copied media files → storage/media"
  else
    echo "No media files in public/uploads/media"
  fi
fi

if [[ -d "$SRC/products" ]]; then
  shopt -s nullglob
  files=("$SRC/products"/*)
  if ((${#files[@]})); then
    cp -an "$SRC/products"/. "$DST/products"/
    echo "Copied product files → storage/products"
  else
    echo "No product files in public/uploads/products"
  fi
fi

echo "Done. You can remove public/uploads after verifying /uploads/... URLs work."
