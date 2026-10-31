set -e
export PLAYWRIGHT_CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome LIB=/home/user/lemomo-ai/lemo-opuscar
cd /home/user/lemomo-ai/lemo-opuscar
node core/render/events.mjs /tmp/claude-0/-home-user-Dump/4404b19b-f333-5ac2-87a9-ea7d3eab202a/scratchpad/brand/motion-hero > /tmp/claude-0/-home-user-Dump/4404b19b-f333-5ac2-87a9-ea7d3eab202a/scratchpad/brand/motion-hero/out.log 2>&1
.venv/bin/python /tmp/claude-0/-home-user-Dump/4404b19b-f333-5ac2-87a9-ea7d3eab202a/scratchpad/brand/motion-hero/mix.py >> /tmp/claude-0/-home-user-Dump/4404b19b-f333-5ac2-87a9-ea7d3eab202a/scratchpad/brand/motion-hero/out.log 2>&1
node core/render/video.mjs /tmp/claude-0/-home-user-Dump/4404b19b-f333-5ac2-87a9-ea7d3eab202a/scratchpad/brand/motion-hero --fps 30 --workers 4 --out /tmp/claude-0/-home-user-Dump/4404b19b-f333-5ac2-87a9-ea7d3eab202a/scratchpad/brand/motion-hero/out/v169.mp4 >> /tmp/claude-0/-home-user-Dump/4404b19b-f333-5ac2-87a9-ea7d3eab202a/scratchpad/brand/motion-hero/out.log 2>&1
node core/render/video.mjs /tmp/claude-0/-home-user-Dump/4404b19b-f333-5ac2-87a9-ea7d3eab202a/scratchpad/brand/motion-hero --fps 30 --workers 4 --size 1080x1920 --out /tmp/claude-0/-home-user-Dump/4404b19b-f333-5ac2-87a9-ea7d3eab202a/scratchpad/brand/motion-hero/out/v916.mp4 >> /tmp/claude-0/-home-user-Dump/4404b19b-f333-5ac2-87a9-ea7d3eab202a/scratchpad/brand/motion-hero/out.log 2>&1
for a in "169 16x9" "916 9x16"; do set -- $a
  J=$(ffmpeg -hide_banner -nostats -i /tmp/claude-0/-home-user-Dump/4404b19b-f333-5ac2-87a9-ea7d3eab202a/scratchpad/brand/motion-hero/out/mix.wav -af loudnorm=I=-14:TP=-1.2:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
  g() { echo "$J" | grep "\"$1\"" | sed 's/.*: "\(.*\)".*/\1/'; }
  ffmpeg -y -hide_banner -loglevel error -i /tmp/claude-0/-home-user-Dump/4404b19b-f333-5ac2-87a9-ea7d3eab202a/scratchpad/brand/motion-hero/out/v$1.mp4 -i /tmp/claude-0/-home-user-Dump/4404b19b-f333-5ac2-87a9-ea7d3eab202a/scratchpad/brand/motion-hero/out/mix.wav -map 0:v -map 1:a -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p     -af "loudnorm=I=-14:TP=-1.2:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true"     -ar 48000 -c:a aac -b:a 192k -shortest -movflags +faststart /tmp/claude-0/-home-user-Dump/4404b19b-f333-5ac2-87a9-ea7d3eab202a/scratchpad/PurpleHat-PhE-Hero-Motion-$2.mp4
done
echo ALL-DONE
