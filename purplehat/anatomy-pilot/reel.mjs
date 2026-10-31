// Builds the showreel pages (9:16 and 16:9) around the Anatomy figure; each page exposes frame(f).
import { readFileSync, writeFileSync, copyFileSync } from "node:fs";
const parts = JSON.parse(readFileSync("parts.json", "utf8"));
copyFileSync("../reel/fonts/Manrope-800.woff", "Manrope-800.woff");
copyFileSync("../reel/fonts/Manrope-500.woff", "Manrope-500.woff");
const CUES = parts.cues, FPS = 30, OFFSET = 1.0, RUN = CUES[3].at + 1.7, OUT = OFFSET + RUN, DUR = OUT + 3.4;
const NAMES = ["Fly truss to trim", "Moving heads on", "LED wall up", "Show"];
const MARK = `<svg viewBox="-110 -110 220 220"><path d="M-67.7 -73.6A100 100 0 0 1 67.7 -73.6A85 85 0 0 1 -67.7 -73.6Z" fill="#5E44E8"/><path d="M67.7 73.6A100 100 0 0 1 -67.7 73.6A85 85 0 0 1 67.7 73.6Z" fill="#5E44E8"/><path d="M-73.6 67.7A100 100 0 0 1 -73.6 -67.7A85 85 0 0 1 -73.6 67.7Z" fill="#5E44E8"/><path d="M73.6 -67.7A100 100 0 0 1 73.6 67.7A85 85 0 0 1 73.6 -67.7Z" fill="#A996FF"/></svg>`;

const esc = (x) => x.replace(/<\/(script)/gi, "<\\/$1");
function page(fmt) {
  const V = fmt === "9x16";
  const W = V ? 1080 : 1920, H = V ? 1920 : 1080;
  const L = V
    ? { fig: "left:0;top:400px;width:1080px", head: "left:84px;top:200px", cues: "left:84px;top:1250px;width:912px", read: "left:84px;top:1660px", origin: "50% 38%" }
    : { fig: "left:-30px;top:60px;width:1320px", head: "left:1300px;top:150px", cues: "left:1300px;top:470px;width:540px", read: "left:1300px;top:860px", origin: "52% 40%" };
  const fs = V ? { h: 84, sub: 26, row: 30, read: 34, out: 92 } : { h: 64, sub: 20, row: 24, read: 26, out: 84 };
  const rows = NAMES.map((n, i) => `<div class="row" data-row="${i}"><span class="q">Q${i + 1}</span><span class="n">${n}</span><span class="st"></span></div>`).join("");
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Manrope;src:url(Manrope-800.woff);font-weight:800}@font-face{font-family:Manrope;src:url(Manrope-500.woff);font-weight:500}
${parts.isoCss}${parts.CSS}
*{box-sizing:border-box}html,body{margin:0;background:#000}
#frame{position:relative;width:${W}px;height:${H}px;overflow:hidden;background:var(--anatomy-card)}
.mono{font-family:ui-monospace,SFMono-Regular,Menlo,"DejaVu Sans Mono",monospace;letter-spacing:.12em;text-transform:uppercase;color:var(--anatomy-muted)}
.corner{position:absolute;font-size:${V ? 22 : 18}px}
#fig{position:absolute;${L.fig};transform-origin:${L.origin}}
#fig svg{width:100%;height:auto;display:block}
#head{position:absolute;${L.head}}
#head h1{font:800 ${fs.h}px/1.02 Manrope,sans-serif;letter-spacing:-.02em;color:var(--anatomy-strong);margin:0 0 18px}
#head .mono{font-size:${fs.sub}px}
#cues{position:absolute;${L.cues};border-top:1px solid var(--anatomy-faint)}
.row{display:flex;align-items:center;gap:${V ? 28 : 20}px;padding:${V ? 22 : 16}px 0;border-bottom:1px solid var(--anatomy-faint);font:500 ${fs.row}px/1 Manrope,sans-serif;color:var(--anatomy-muted);transition:none}
.row .q{font-family:ui-monospace,"DejaVu Sans Mono",monospace;font-size:${fs.row - 4}px;width:${V ? 60 : 46}px;color:var(--anatomy-muted)}
.row .n{flex:1}.row .st{font-family:ui-monospace,"DejaVu Sans Mono",monospace;font-size:${fs.row - 6}px;letter-spacing:.1em}
.row[data-s="live"]{color:var(--anatomy-strong)}.row[data-s="live"] .q,.row[data-s="live"] .st{color:#5E44E8}
.row[data-s="done"]{color:var(--anatomy-text)}
#read{position:absolute;${L.read}}
#read .mono{font-size:${fs.sub - 4}px;margin-bottom:12px}
#read [data-readout]{font-family:ui-monospace,"DejaVu Sans Mono",monospace;font-size:${fs.read}px;color:var(--anatomy-strong);letter-spacing:.02em}
#outro{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${V ? 40 : 30}px;opacity:0}
#outro h2{font:800 ${fs.out}px/1.05 Manrope,sans-serif;letter-spacing:-.025em;color:var(--anatomy-strong);margin:0;text-align:center}
#outro .lock{display:flex;align-items:center;gap:22px}#outro .lock svg{width:${V ? 96 : 80}px;height:${V ? 96 : 80}px}
#outro .lock b{font:800 ${V ? 46 : 40}px Manrope,sans-serif;color:#5E44E8;letter-spacing:-.02em}#outro .lock span{display:block;font-size:${V ? 18 : 15}px;margin-top:4px}
</style></head><body class="iso" data-theme="light"><div id="frame">
<div class="corner mono" style="left:${V ? 84 : 60}px;top:${V ? 90 : 48}px">Fig 1 · Show call</div>
<div class="corner mono" style="right:${V ? 84 : 60}px;top:${V ? 90 : 48}px">PurpleHat Events</div>
<div id="head"><h1>Event<br>management</h1><div class="mono">Every cue, called on time</div></div>
<div id="fig" class="iso-stage">${parts.svg}</div>
<div id="cues">${rows}</div>
<div id="read"><div class="mono">Live readout</div><div data-readout>standby · truss 1.00 m</div></div>
<div id="outro"><h2>Every cue,<br>on time.</h2><div class="lock">${MARK}<div><b>PurpleHat</b><span class="mono">Events · Event management</span></div></div></div>
</div>
<script>window.PH_HOLD = true;</script>
<script type="module">${esc(parts.kit)}
${esc(parts.live)}
const OFFSET = ${OFFSET}, RUN = ${RUN}, OUT = ${OUT};
const clampv = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const sm = (x) => { x = clampv(x); return x * x * (3 - 2 * x); };
const fig = document.getElementById("fig"), head = document.getElementById("head"), cues = document.getElementById("cues"), read = document.getElementById("read"), outro = document.getElementById("outro");
const rowEls = [...document.querySelectorAll(".row")];
window.frame = (f) => {
  const t = f / ${FPS}, ft = clampv(t - OFFSET, 0, RUN);
  window.PH.render(ft);
  const intro = sm((t - 0.1) / 0.9), push = sm((t - OFFSET) / RUN), leave = sm((t - OUT) / 0.8);
  fig.style.opacity = (intro * (1 - 0.88 * leave)).toFixed(3);
  fig.style.transform = "translateY(" + ((1 - intro) * 24).toFixed(1) + "px) scale(" + (1 + 0.07 * push - 0.04 * leave).toFixed(4) + ")";
  for (const el of [head, cues, read]) { el.style.opacity = (sm((t - 0.35) / 0.8) * (1 - leave)).toFixed(3); }
  rowEls.forEach((r, i) => {
    const on = ft >= CUES[i].at, next = i < 3 ? ft >= CUES[i + 1].at : false;
    const s = !on ? "wait" : next ? "done" : "live";
    if (r.dataset.s !== s) { r.dataset.s = s; r.querySelector(".st").textContent = s === "wait" ? "standby" : s === "live" ? "● go" : "done"; }
  });
  outro.style.opacity = sm((t - OUT - 0.3) / 0.8).toFixed(3);
  outro.style.transform = "translateY(" + ((1 - sm((t - OUT - 0.3) / 0.9)) * 18).toFixed(1) + "px)";
};
window.TOTAL = ${Math.round(DUR * FPS)};
window.READY = document.fonts.ready;
</script></body></html>`;
}
for (const f of ["9x16", "16x9"]) writeFileSync(`reel-${f}.html`, page(f));
writeFileSync("timing.json", JSON.stringify({ offset: OFFSET, run: RUN, out: OUT, dur: DUR, cues: CUES.map((c) => c.at + OFFSET), travel: parts.travel }));
console.log("reel pages written; duration", DUR.toFixed(2), "s; GO at", CUES.map((c) => (c.at + OFFSET).toFixed(2)).join(" "));
