// Showreel segment pages: one per service, dark theme, 9:16 and 16:9. Each page exposes frame(f) and TOTAL.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
export const ORDER = ["show-call", "plenary", "arrivals", "request", "living-floor", "brand-shop", "the-vote"];
export const LEAD = 0.6, START = 0.5, HOLD = 0.5;          // seconds of fade-in, figure time we start at, hold after the end
const esc = (x) => x.replace(/<\/(script)/gi, "<\\/$1");
const MARK = `<svg viewBox="-110 -110 220 220"><path d="M-67.7 -73.6A100 100 0 0 1 67.7 -73.6A85 85 0 0 1 -67.7 -73.6Z M67.7 73.6A100 100 0 0 1 -67.7 73.6A85 85 0 0 1 67.7 73.6Z M-73.6 67.7A100 100 0 0 1 -73.6 -67.7A85 85 0 0 1 -73.6 67.7Z" fill="#F6F4EF"/><path d="M73.6 -67.7A100 100 0 0 1 73.6 67.7A85 85 0 0 1 73.6 -67.7Z" fill="#D7CFFF"/></svg>`;

export const segLength = (p) => LEAD + (p.end - START) + HOLD;

function frameCss(V, extra = "") {
  const W = V ? 1080 : 1920, H = V ? 1920 : 1080;
  return `@font-face{font-family:Manrope;src:url(Manrope-800.woff);font-weight:800}@font-face{font-family:Manrope;src:url(Manrope-500.woff);font-weight:500}
*{box-sizing:border-box}html,body{margin:0;background:#000}
#frame{position:relative;width:${W}px;height:${H}px;overflow:hidden;background:radial-gradient(120% 90% at 50% 38%,#17151d 0%,#0d0c10 60%,#08080a 100%)}
.mono{font-family:ui-monospace,SFMono-Regular,Menlo,"DejaVu Sans Mono",monospace;letter-spacing:.14em;text-transform:uppercase;color:#7b7690}
.corner{position:absolute;font-size:${V ? 22 : 17}px}
${extra}`;
}

export function segPage(id, idx, fmt) {
  const p = JSON.parse(readFileSync(`parts-${id}.json`, "utf8"));
  const V = fmt === "9x16";
  const L = V
    ? { fig: "left:-40px;top:430px;width:1160px", head: "left:84px;top:210px", cues: "left:84px;top:1290px;width:912px", read: "left:84px;top:1700px", origin: "50% 45%" }
    : { fig: "left:-40px;top:70px;width:1330px", head: "left:1300px;top:170px", cues: "left:1300px;top:480px;width:560px", read: "left:1300px;top:880px", origin: "52% 46%" };
  const fs = V ? { h: 84, sub: 24, row: 30, read: 27 } : { h: 62, sub: 18, row: 24, read: 18 };
  const rows = p.names.map((n, i) => `<div class="row" data-row="${i}"><span class="q">Q${i + 1}</span><span class="n">${n}</span><span class="st">standby</span></div>`).join("");
  const total = Math.round(segLength(p) * 30);
  return `<!doctype html><html><head><meta charset="utf-8"><style>${p.isoCss}${p.CSS}${frameCss(V, `
#fig{position:absolute;${L.fig};transform-origin:${L.origin}}#fig svg{width:100%;height:auto;display:block}
.iso .iso-stage{background:transparent}
#head{position:absolute;${L.head}}#head .k{font-size:${fs.sub}px;margin-bottom:18px;color:#8f7bff}
#head h1{font:800 ${fs.h}px/1.02 Manrope,sans-serif;letter-spacing:-.02em;color:#f2f0f7;margin:0 0 16px}#head .t{font-size:${fs.sub}px}
#cues{position:absolute;${L.cues};border-top:1px solid #2a2733}
.row{display:flex;align-items:center;gap:${V ? 26 : 18}px;padding:${V ? 22 : 15}px 0;border-bottom:1px solid #2a2733;font:500 ${fs.row}px/1 Manrope,sans-serif;color:#5d586e}
.row .q{font-family:ui-monospace,"DejaVu Sans Mono",monospace;font-size:${fs.row - 6}px;width:${V ? 56 : 44}px}.row .n{flex:1}
.row .st{font-family:ui-monospace,"DejaVu Sans Mono",monospace;font-size:${fs.row - 8}px;letter-spacing:.12em;text-transform:uppercase}
.row[data-s="live"]{color:#f2f0f7}.row[data-s="live"] .q,.row[data-s="live"] .st{color:#a99bff}.row[data-s="done"]{color:#a7a2b8}
#read{position:absolute;${L.read}}#read .mono{font-size:${fs.sub - 4}px;margin-bottom:12px}
#read [data-readout]{white-space:nowrap;font-family:ui-monospace,"DejaVu Sans Mono",monospace;font-size:${fs.read}px;color:#f2f0f7;letter-spacing:.02em}
`)}</style></head><body class="iso" data-theme="dark"><div id="frame">
<div class="corner mono" style="left:${V ? 84 : 60}px;top:${V ? 92 : 48}px">${p.fig} · ${p.title}</div>
<div class="corner mono" style="right:${V ? 84 : 60}px;top:${V ? 92 : 48}px">PurpleHat Events · ${String(idx + 1).padStart(2, "0")} / 07</div>
<div id="head"><div class="k mono">Service ${String(idx + 1).padStart(2, "0")}</div><h1>${p.headline}</h1><div class="t mono">${p.tagline}</div></div>
<div id="fig" class="iso-stage">${p.svg}</div>
<div id="cues">${rows}</div>
<div id="read"><div class="mono">Live readout</div><div data-readout>—</div></div>
</div>
<script>window.PH_HOLD = true;</script>
<script type="module">${esc(p.kit)}
${esc(p.live)}
const __C = ${JSON.stringify(p.cues)}, __END = ${p.end}, __LEAD = ${LEAD}, __START = ${START};
const __cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v)), __sm = (x) => { x = __cl(x); return x * x * (3 - 2 * x); };
const __fig = document.getElementById("fig"), __rows = [...document.querySelectorAll(".row")], __txt = [document.getElementById("head"), document.getElementById("cues"), document.getElementById("read")];
window.frame = (f) => {
  const s = f / 30, ft = __cl(__START + (s - __LEAD), 0, __END);
  window.PH.render(ft);
  const a = __sm(s / __LEAD), push = __sm((s - __LEAD) / (__END - __START));
  __fig.style.opacity = a.toFixed(3);
  __fig.style.transform = "translateY(" + ((1 - a) * 20).toFixed(1) + "px) scale(" + (1.0 + 0.06 * push).toFixed(4) + ")";
  __txt.forEach((el, i) => { el.style.opacity = __sm((s - 0.1 * i) / 0.6).toFixed(3); el.style.transform = "translateY(" + ((1 - __sm((s - 0.1 * i) / 0.6)) * 14).toFixed(1) + "px)"; });
  __rows.forEach((r, i) => { const on = ft >= __C[i].at, nx = i < __C.length - 1 && ft >= __C[i + 1].at; const st = !on ? "wait" : nx ? "done" : "live";
    if (r.dataset.s !== st) { r.dataset.s = st; r.querySelector(".st").textContent = st === "wait" ? "standby" : st === "live" ? "● go" : "done"; } });
};
window.TOTAL = ${total};
window.READY = document.fonts.ready;
</script></body></html>`;
}

export function introPage(fmt) {
  const V = fmt === "9x16";
  const lines = ["Event management", "Conferences & PCO", "MICE & incentives", "Websites & apps", "Experiential installations", "Branding & design", "Corporate events"];
  return `<!doctype html><html><head><meta charset="utf-8"><style>${frameCss(V, `
#c{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;padding:0 ${V ? 96 : 220}px}
#c .lock{display:flex;align-items:center;gap:22px;margin-bottom:${V ? 70 : 46}px}#c .lock svg{width:${V ? 84 : 64}px;height:${V ? 84 : 64}px}
#c .lock b{font:800 ${V ? 44 : 34}px Manrope,sans-serif;color:#f2f0f7;letter-spacing:-.02em}
#c h1{font:800 ${V ? 104 : 96}px/1.0 Manrope,sans-serif;letter-spacing:-.03em;color:#f2f0f7;margin:0 0 ${V ? 60 : 40}px}
#c h1 i{font-style:normal;color:#a99bff}
#c ol{list-style:none;margin:0;padding:0;columns:${V ? 1 : 2};column-gap:60px}#c li{font-size:${V ? 26 : 20}px;padding:${V ? 10 : 7}px 0;opacity:0}
#c li span{color:#8f7bff;margin-right:18px}`)}</style></head><body><div id="frame"><div id="c">
<div class="lock" data-a="0">${MARK}<b>PurpleHat Events</b></div>
<h1 data-a="1">Seven services.<br><i>Built like machines.</i></h1>
<ol>${lines.map((l, i) => `<li class="mono" data-li="${i}"><span>${String(i + 1).padStart(2, "0")}</span>${l.replace("&", "&amp;")}</li>`).join("")}</ol></div></div>
<script>
const sm = (x) => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
const A = [...document.querySelectorAll("[data-a]")], LI = [...document.querySelectorAll("[data-li]")];
window.frame = (f) => { const t = f / 30;
  A.forEach((el, i) => { const k = sm((t - 0.15 - i * 0.35) / 0.7); el.style.opacity = k; el.style.transform = "translateY(" + ((1 - k) * 24) + "px)"; });
  LI.forEach((el, i) => { const k = sm((t - 1.0 - i * 0.12) / 0.5); el.style.opacity = k; el.style.transform = "translateX(" + ((1 - k) * -16) + "px)"; }); };
window.TOTAL = 120; window.READY = document.fonts.ready;
</script></body></html>`;
}

if (process.argv[1] && process.argv[1].endsWith("seg.mjs")) {
  for (const fmt of ["9x16", "16x9"]) {
    writeFileSync(`seg-intro-${fmt}.html`, introPage(fmt));
    ORDER.forEach((id, i) => writeFileSync(`seg-${id}-${fmt}.html`, segPage(id, i, fmt)));
  }
  const lens = ORDER.map((id) => segLength(JSON.parse(readFileSync(`parts-${id}.json`, "utf8"))));
  writeFileSync("segments.json", JSON.stringify({ order: ORDER, lens, lead: LEAD, start: START, intro: 4.0 }));
  console.log("segments", lens.map((l) => l.toFixed(2)).join(" "), "total", (lens.reduce((a, b) => a + b, 0) + 4).toFixed(1));
}
