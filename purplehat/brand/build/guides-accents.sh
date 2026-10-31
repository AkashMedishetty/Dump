set -e
PY=/home/user/lemomo-ai/lemo-opuscar/.venv/bin/python
S=/tmp/claude-0/-home-user-Dump/4404b19b-f333-5ac2-87a9-ea7d3eab202a/scratchpad/brand/guidelines/src
build() { # $1 = out dir (empty = default)
  ( cd /tmp/claude-0/-home-user-Dump/4404b19b-f333-5ac2-87a9-ea7d3eab202a/scratchpad/brand/guidelines && node $S/build.mjs all && node $S/render.mjs ) > /dev/null
  ( cd ${GUIDE_OUT:-/tmp/claude-0/-home-user-Dump/4404b19b-f333-5ac2-87a9-ea7d3eab202a/scratchpad/brand/guidelines} && $PY $S/thumbs.py && cd /tmp/claude-0/-home-user-Dump/4404b19b-f333-5ac2-87a9-ea7d3eab202a/scratchpad/brand/guidelines && node $S/build.mjs index ) > /dev/null
  echo "built ${GUIDE_OUT:-/tmp/claude-0/-home-user-Dump/4404b19b-f333-5ac2-87a9-ea7d3eab202a/scratchpad/brand/guidelines}"
}
build
for v in 'yellow|{"hex":"#FFC72C","name":"Sunburst Yellow","cmyk":"C0 M19 Y89 K0","pms":"Pantone 123 C"}'          'green|{"hex":"#A0DAB3","name":"Pastel Mint","cmyk":"C38 M0 Y35 K0","pms":"Pantone 344 C"}'; do
  n=${v%%|*}; O=/tmp/claude-0/-home-user-Dump/4404b19b-f333-5ac2-87a9-ea7d3eab202a/scratchpad/brand/guidelines-accent-$n; mkdir -p $O; cp -r /tmp/claude-0/-home-user-Dump/4404b19b-f333-5ac2-87a9-ea7d3eab202a/scratchpad/brand/guidelines/assets $O/
  export GUIDE_OUT=$O ACCENT="${v#*|}"; build
done
echo ALL-DONE
