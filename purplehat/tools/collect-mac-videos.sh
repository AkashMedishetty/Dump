#!/bin/bash
# Collect every PurpleHat video on this Mac into ~/Downloads/PurpleHat-Videos/08-Mac,
# next to the cloud videos (01-07), then zip the whole folder.
# Run from anywhere:  bash ~/Downloads/collect-mac-videos.sh
set -u
DL="$HOME/Downloads"; OUT="$DL/PurpleHat-Videos"; MAC="$OUT/08-Mac"
cd "$DL" || exit 1

# 1. Rebuild the cloud zip from its parts (if they are here and not unpacked yet)
if [ ! -d "$OUT" ] && ls PurpleHat-All-Videos.zip.part0* >/dev/null 2>&1; then
  echo "Rebuilding the cloud zip…"
  cat PurpleHat-All-Videos.zip.part0* > PurpleHat-All-Videos.zip
  shasum -a 256 -c PurpleHat-All-Videos.sha256 || { echo "Checksum failed: re-download the parts."; exit 1; }
  unzip -q PurpleHat-All-Videos.zip
fi
mkdir -p "$MAC"

# 2. Find the videos the Mac sessions made. Known output folders first, then anything PurpleHat-named
#    under ~/CTX, Desktop, Downloads, Movies and Documents. Skips node_modules, .git, build caches and tiny files.
LIST="$MAC/_found.txt"; : > "$LIST"
VID=( \( -iname '*.mp4' -o -iname '*.mov' -o -iname '*.m4v' -o -iname '*.webm' \) )
SKIP=( -not -path '*/node_modules/*' -not -path '*/.git/*' -not -path '*/.next/*' -not -path "$OUT/*" )
for d in "$HOME/CTX/Websites/TEMP-SCRAP/tgasicon2026-video/out/purplehat" \
         "$HOME/CTX/Websites/TEMP-SCRAP/purplehat-intro" \
         "$HOME/CTX/Websites/Purplehat"; do
  [ -d "$d" ] && find "$d" -type f "${VID[@]}" -size +200k "${SKIP[@]}" -print >> "$LIST" 2>/dev/null
done
for d in "$HOME/CTX" "$HOME/Desktop" "$HOME/Downloads" "$HOME/Movies" "$HOME/Documents"; do
  [ -d "$d" ] && find "$d" -type f "${VID[@]}" -size +200k "${SKIP[@]}" \
    \( -ipath '*purple*' -o -iname 'PH_*' -o -iname '*showreel*' \) -print >> "$LIST" 2>/dev/null
done
sort -u "$LIST" -o "$LIST"

# 3. Copy them in, keeping where each came from (APFS clones: instant and no extra disk space)
n=0
while IFS= read -r f; do
  [ -f "$f" ] || continue
  rel="${f#$HOME/}"; dest="$MAC/$rel"
  mkdir -p "$(dirname "$dest")"
  [ -e "$dest" ] || cp -c "$f" "$dest" 2>/dev/null || cp "$f" "$dest"
  n=$((n + 1))
done < "$LIST"
echo "Copied $n Mac videos into $MAC (full list: $LIST)"

# 3b. The book: it was never rendered as a video, only captured as review frames from the website direction.
#     Those stills live in a git-ignored folder on this Mac, so copy them in as 09-Book-Frames.
BOOK="$HOME/CTX/Websites/Purplehat/.directions-work/shots/book"
if [ -d "$BOOK" ]; then
  mkdir -p "$OUT/09-Book-Frames"
  cp -R -c "$BOOK/." "$OUT/09-Book-Frames/" 2>/dev/null || cp -R "$BOOK/." "$OUT/09-Book-Frames/"
  echo "Copied the book frames into $OUT/09-Book-Frames ($(find "$OUT/09-Book-Frames" -type f | wc -l | tr -d ' ') files)"
else
  echo "Book frames not found at $BOOK"
fi

# 4. One zip of everything (stored, not recompressed: video is already compressed)
cd "$DL" && rm -f PurpleHat-Videos-ALL.zip && zip -0 -r -q PurpleHat-Videos-ALL.zip PurpleHat-Videos -x '*/_found.txt'
echo "Done: $DL/PurpleHat-Videos (folder) and $DL/PurpleHat-Videos-ALL.zip ($(du -h PurpleHat-Videos-ALL.zip | cut -f1))"
open "$OUT" 2>/dev/null || true
