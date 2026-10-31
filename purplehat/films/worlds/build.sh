#!/bin/sh
# One command: events → score → both renders → masters.  LIB = the lemo-opuscar library folder.
set -e
HERE=$(cd "$(dirname "$0")" && pwd); LIB=${LIB:?set LIB to the lemo-opuscar folder}; export LIB
cd "$LIB"
node core/render/events.mjs "$HERE"
node core/render/readcheck.mjs "$HERE"
"$LIB/.venv/bin/python" "$HERE/mix.py"
node core/render/video.mjs "$HERE" --fps 24 --workers 4 --out "$HERE/out/video-16x9.mp4"
node core/render/video.mjs "$HERE" --fps 24 --workers 4 --size 1080x1920 --out "$HERE/out/video-9x16.mp4"
for f in 16x9 9x16; do sh core/render/mux.sh "$HERE/out/video-$f.mp4" "$HERE/out/mix.wav" "$HERE/PurpleHat-43-Worlds-$f.mp4" 24 0; done
