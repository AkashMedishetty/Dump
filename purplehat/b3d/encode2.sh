#!/bin/sh
set -e
cd "$(dirname "$0")"
ffmpeg -loglevel error -y -framerate 30 -i full2/f_%04d.png -framerate 30 -i overlay/o_%04d.png -i sting.wav \
  -filter_complex "[0:v]format=rgb48le[b];[1:v]format=rgba64le[o];[b][o]overlay=format=auto,format=gbrp16le,noise=alls=3:allf=t+u[v]" \
  -map "[v]" -map 2:a -c:v libx264 -preset slow -crf 14 -pix_fmt yuv420p -sws_flags +accurate_rnd+full_chroma_int -sws_dither ed \
  -c:a aac -b:a 256k -movflags +faststart -shortest ../PurpleHat-3D-sting-v2.mp4
echo encoded
