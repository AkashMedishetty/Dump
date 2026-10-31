set -e
export PLAYWRIGHT_CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome

bash /tmp/claude-0/-home-user-Dump/4404b19b-f333-5ac2-87a9-ea7d3eab202a/scratchpad/render-worlds2.sh
cd /tmp/claude-0/-home-user-Dump/4404b19b-f333-5ac2-87a9-ea7d3eab202a/scratchpad/films/worlds2 && ffmpeg -v error -y -i out/v169.mp4 -i /tmp/claude-0/-home-user-Dump/4404b19b-f333-5ac2-87a9-ea7d3eab202a/scratchpad/PurpleHat-43-Worlds-PhE-16x9.mp4 -map 0:v -map 1:a -c:v libx264 -crf 21 -preset slow -pix_fmt yuv420p -c:a copy -movflags +faststart /tmp/claude-0/-home-user-Dump/4404b19b-f333-5ac2-87a9-ea7d3eab202a/scratchpad/chk/169.mp4 && mv /tmp/claude-0/-home-user-Dump/4404b19b-f333-5ac2-87a9-ea7d3eab202a/scratchpad/chk/169.mp4 /tmp/claude-0/-home-user-Dump/4404b19b-f333-5ac2-87a9-ea7d3eab202a/scratchpad/PurpleHat-43-Worlds-PhE-16x9.mp4
cd /tmp/claude-0/-home-user-Dump/4404b19b-f333-5ac2-87a9-ea7d3eab202a/scratchpad/brand && node build/build_video.mjs > /tmp/claude-0/-home-user-Dump/4404b19b-f333-5ac2-87a9-ea7d3eab202a/scratchpad/brand/build-video.log 2>&1
echo ALL-DONE
