// Fig 5 · Experiential installations — "Living floor". A depth sensor tracks footsteps; each step ripples out across 160 LED tiles.
import { k, P, at, S, L, D, depth, byDepth, halo, slab, cyl, seg, top, faceY, faceTop, plinth, writeFigure } from "./common.mjs";
const HERE = new URL(".", import.meta.url).pathname;

const MODEL = { cols: 16, rows: 10, tile: 0.5, fps: 30, wave: 2.0, cadence: 0.55, stride: 0.7 };   // real time, 1:1
const TILE = MODEL.tile * 10, FX = -48, FY = -28, FZ = 2.2;                                   // floor origin, world units
const FW = MODEL.cols * TILE, FD = MODEL.rows * TILE;
const T_ARM = 0.8, T_WALK = 1.8;
// footsteps along a diagonal walk; left and right alternate either side of the line
const steps = [];
{ const a = [FX + 6, FY + FD - 6], b = [FX + FW - 8, FY + 7], n = 12; const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len;
  for (let i = 0; i < n; i++) { const u = i / (n - 1), s = i % 2 ? 1.3 : -1.3; steps.push({ x: a[0] + dx * u + nx * s, y: a[1] + dy * u + ny * s, t: T_WALK + i * MODEL.cadence, ang: Math.atan2(dy, dx) }); } }
const T_BLOOM = steps[steps.length - 1].t + 1.2;
const CUES = [{ at: T_ARM, q: "Q1", what: "sensor armed" }, { at: T_WALK, q: "Q2", what: "visitor on the floor" }, { at: T_BLOOM, q: "Q3", what: "bloom" }];
const END = T_BLOOM + 2.2;

// which tiles fall inside the PurpleHat mark, centred on the floor
const MARK_R = 22, MCX = FX + FW / 2, MCY = FY + FD / 2;
function inMark(x, y) { x = (x - MCX) / MARK_R * 100; y = (y - MCY) / MARK_R * 100; if (x * x + y * y > 10000) return -1; const dirs = [[0, -1], [1, 0], [0, 1], [-1, 0]]; for (let q = 0; q < 4; q++) { const dx = x - 125 * dirs[q][0], dy = y - 125 * dirs[q][1]; if (dx * dx + dy * dy <= 7225) return q; } return -1; }
const tiles = []; for (let j = 0; j < MODEL.rows; j++) for (let i = 0; i < MODEL.cols; i++) { const cx = FX + (i + 0.5) * TILE, cy = FY + (j + 0.5) * TILE; tiles.push({ i, j, cx, cy, mark: inMark(cx, cy) }); }

function riser() {
  const plan = { x: FX - 3, y: FY - 3, w: FW + 6, d: FD + 6, r: 0.8 };
  const out = [halo(plan, 0, FZ, 3), S(k.slabOf(plan, 0, FZ, P, 2, 0.5), { tone: "mid", inner: L(k.sideSeam(plan, 1, P, 2), { tone: "faint" }) })];
  // the LED floor in its own top-face plane: base tiles, a lit layer, the grid
  let base = "", lit = "", grid = "";
  for (const t of tiles) {
    const x = t.i * TILE + 0.25, y = t.j * TILE + 0.25;
    base += `<rect x="${x}" y="${y}" width="${TILE - 0.5}" height="${TILE - 0.5}" class="ph-tile"/>`;
    lit += `<rect data-t="${t.j * MODEL.cols + t.i}" x="${x}" y="${y}" width="${TILE - 0.5}" height="${TILE - 0.5}" class="${t.mark === 1 ? "ph-lit2" : "ph-lit"}" opacity="0"/>`;
  }
  for (let i = 1; i < MODEL.cols; i++) grid += `M${i * TILE} 0V${FD}`; for (let j = 1; j < MODEL.rows; j++) grid += `M0 ${j * TILE}H${FW}`;
  out.push(`<g transform="${faceTop(FX, FY, FZ + 0.02)}">${base}<g class="ph-light-add">${lit}</g><path class="iso-line" data-tone="lo" d="${grid}" style="stroke-width:.3"/><rect width="${FW}" height="${FD}" fill="none" class="iso-line" data-tone="mid"/>
    <g data-proj opacity="0" class="ph-light-add"><g transform="translate(${MCX - FX} ${MCY - FY}) scale(${MARK_R / 100})"><path d="M-67.7 -73.6A100 100 0 0 1 67.7 -73.6A85 85 0 0 1 -67.7 -73.6Z M67.7 73.6A100 100 0 0 1 -67.7 73.6A85 85 0 0 1 67.7 73.6Z M-73.6 67.7A100 100 0 0 1 -73.6 -67.7A85 85 0 0 1 -73.6 67.7Z" fill="#F6F4EF"/><path d="M73.6 -67.7A100 100 0 0 1 73.6 67.7A85 85 0 0 1 73.6 -67.7Z" fill="#D7CFFF"/></g></g>
    <path data-scan class="ph-scan" d="M0 0H${FW}" opacity="0"/>
    ${steps.map((s, n) => `<g data-step="${n}" opacity="0" transform="translate(${(s.x - FX).toFixed(2)} ${(s.y - FY).toFixed(2)}) rotate(${(s.ang * 180 / Math.PI).toFixed(1)})"><rect x="-2.6" y="-1.1" width="5.2" height="2.2" rx="1.1" class="ph-foot"/><rect x="2.9" y="-0.9" width="1.7" height="1.8" rx=".85" class="ph-foot"/></g>`).join("")}</g>`);
  // a ramp onto the floor
  out.push(slab({ x: FX - 3, y: FY + FD + 3, w: 14, d: 6, r: 0.4 }, 0, 1, { tone: "lo" }, 2, 0.2));
  return out.join("");
}

function gantry() {
  const out = [], Y = FY + FD / 2 - 1.5, H = 36;
  for (const x of [FX - 7, FX + FW + 3]) { out.push(slab({ x: x - 1, y: Y - 1, w: 6, d: 6, r: 0.4 }, 0, 1, { tone: "lo" })); out.push(S(k.slabOf({ x, y: Y, w: 4, d: 4, r: 0.4 }, 1, H - 1, P, 2, 0.3), { tone: "mid" })); }
  out.push(S(k.slabOf({ x: FX - 7, y: Y, w: FW + 14, d: 4, r: 0.4 }, H, 3, P, 2, 0.4), { tone: "mid" }));
  // depth sensor and projector hanging from the beam, centred over the floor
  out.push(slab({ x: MCX - 0.5, y: Y + 1.5, w: 1, d: 1, r: 0.2 }, H - 3, 3, { tone: "lo" }));
  out.push(S(k.slabOf({ x: MCX - 5, y: Y + 0.5, w: 10, d: 3, r: 0.8 }, H - 5.4, 2.4, P, 3, 0.3), { tone: "hi", lit: true }));
  out.push(`<g data-sensor opacity=".25">${D([at([MCX - 2.5, Y + 3.5, H - 4.2]), at([MCX + 2.5, Y + 3.5, H - 4.2])], { size: 0.65, tone: "hi" })}</g>`);
  out.push(slab({ x: MCX + 10, y: Y, w: 6, d: 4, r: 0.4 }, H - 4.2, 4.2, { tone: "mid" }));
  return out.join("");
}

function control() {
  const out = [];
  const desk = { x: 46, y: 24, w: 22, d: 9, r: 0.6 };
  out.push(halo(desk, 0, 0.1, 2), S(k.slabOf(desk, 0, 7.4, P, 2, 0.4), { tone: "mid", inner: L(k.sideSeam(desk, 6.2, P, 2), { tone: "faint" }) }));
  out.push(slab({ x: 49, y: 26, w: 8, d: 5.4, r: 0.4 }, 7.4, 0.4, { tone: "mid" }, 2, 0));
  out.push(slab({ x: 49, y: 25.6, w: 8, d: 0.6, r: 0.2 }, 7.8, 5, { tone: "mid" }));
  out.push(`<g transform="${faceY(49.4, 26.22, 12.4)}"><rect class="ph-screen" width="7.2" height="4.2"/><g data-viz opacity=".3"><rect x=".5" y=".5" width="3" height="3.2" fill="#5E44E8"/><path d="M4 3.4L4.8 2L5.6 2.6L6.6 .8" stroke="#D7CFFF" stroke-width=".25" fill="none"/></g></g>`);
  for (const x of [60, 64]) out.push(cyl(x, 29, 1.2, 7.4, 1.4, { tone: "lo" }, 14));
  // speakers on stands either side of the floor
  for (const [x, y] of [[FX - 12, FY + FD + 6], [FX + FW + 6, FY + FD + 6]]) { out.push(cyl(x + 2, y + 2, 2, 0, 0.5, { tone: "lo" }, 14), cyl(x + 2, y + 2, 0.4, 0.5, 12, { tone: "mid", crease: "none" }, 10)); out.push(slab({ x, y, w: 4, d: 4, r: 0.4 }, 12.5, 6, { tone: "mid" }, 2, 0.3)); out.push(L(k.sideRing([x + 2, y + 4.02, 15.5], 1.2, "y", P), { tone: "lo" })); }
  return out.join("");
}

const css = `.ph-tile{fill:#2a2342}.iso[data-theme="dark"] .ph-tile{fill:#100d1c}
.ph-lit{fill:#9d8cff}.ph-lit2{fill:#e2dbff}.iso[data-theme="dark"] .ph-lit{fill:#8f7bff}
.ph-foot{fill:#F6F4EF;stroke:#17112B;stroke-width:.2}.ph-scan{stroke:#D7CFFF;stroke-width:.8}`;

const live = `
const CUES = ${JSON.stringify(CUES)}, END = ${END}, STEPS = ${JSON.stringify(steps)}, TILES = ${JSON.stringify(tiles)};
const M = ${JSON.stringify(MODEL)}, FX = ${FX}, FY = ${FY}, FD = ${FD}, T_ARM = ${T_ARM}, T_BLOOM = ${T_BLOOM};
const svgEl = document.querySelector(".iso-stage svg"), readout = document.querySelector("[data-readout]");
const litEls = [...svgEl.querySelectorAll("[data-t]")].sort((a, b) => a.dataset.t - b.dataset.t);
const stepEls = [...svgEl.querySelectorAll("[data-step]")].sort((a, b) => a.dataset.step - b.dataset.step);
const proj = svgEl.querySelector("[data-proj]"), sensor = svgEl.querySelector("[data-sensor]"), scan = svgEl.querySelector("[data-scan]"), viz = svgEl.querySelector("[data-viz]");
const cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v)), sm = (x) => { x = cl(x); return x * x * (3 - 2 * x); };
const V = M.wave * 10, LAT = 1 / M.fps;   // ripple speed in world units/s; the sensor sees a step one frame late
let said = "";
function render(t) {
  sensor.setAttribute("opacity", (0.25 + 0.75 * sm((t - T_ARM) / 0.3)).toFixed(3));
  const sw = (t - T_ARM) / 0.8; scan.setAttribute("opacity", sw > 0 && sw < 1 ? "0.9" : "0"); scan.setAttribute("transform", "translate(0 " + (cl(sw) * FD).toFixed(2) + ")");
  stepEls.forEach((el, n) => { const dt = t - STEPS[n].t; el.setAttribute("opacity", dt < 0 ? "0" : (1 - 0.75 * sm((dt - 1.4) / 0.8)).toFixed(3)); });
  const bloom = sm((t - T_BLOOM) / 0.9);
  TILES.forEach((tile, idx) => {
    let b = 0;
    for (const s of STEPS) { const dt = t - s.t - LAT; if (dt <= 0) continue; const r = Math.hypot(tile.cx - s.x, tile.cy - s.y); const ring = Math.exp(-((r - V * dt) ** 2) / (2 * 3.2 * 3.2)) * Math.exp(-dt / 1.1); const under = r < 4 ? Math.exp(-dt / 0.5) : 0; b = Math.max(b, ring, under); }
    b = b * (1 - bloom) + bloom * (0.42 + 0.12 * Math.sin(t * 2.4 - Math.hypot(tile.cx - ${MCX}, tile.cy - ${MCY}) * 0.2));
    litEls[idx].setAttribute("opacity", Math.min(1, b).toFixed(3));
  });
  proj.setAttribute("opacity", sm((t - T_BLOOM - 0.3) / 0.8).toFixed(3));
  viz.setAttribute("opacity", (0.3 + 0.7 * sm((t - T_ARM) / 0.4)).toFixed(3));
  const n = STEPS.filter((s) => t >= s.t).length;
  const text = t < T_ARM ? "standby · floor dark" : t < CUES[1].at ? "Q1 · sensor armed · " + M.fps + " fps · " + Math.round(LAT * 1000) + " ms"
    : t < T_BLOOM ? "Q2 · steps " + n + " · ripple " + M.wave.toFixed(1) + " m/s · latency " + Math.round(LAT * 1000) + " ms"
    : "Q3 · bloom · " + TILES.length + "/" + TILES.length + " tiles · mark projected";
  if (text !== said) { readout.textContent = text; said = text; }
}
`;

writeFigure(HERE, "living-floor", {
  fig: "Fig 5", title: "Living floor", hint: "Hover to scrub · → for the next cue", readout: "standby · floor dark",
  keys: [{ mark: "lit", label: "The depth sensor: what sees each step" }, { mark: "raised", label: "Floor, gantry and control desk at 1:100" }],
  caption: `An interactive floor, in real time. A ${MODEL.fps} fps depth sensor sees each footstep one frame late (${Math.round(1000 / MODEL.fps)} ms); a visitor walks at ${MODEL.cadence} s a step and every step sends a ripple across the ${MODEL.cols} × ${MODEL.rows} tiles (${MODEL.tile} m each) at ${MODEL.wave} m/s. When they step off, the floor blooms into the mark.`,
  label: "An interactive LED floor on a riser under a gantry with a depth sensor and projector, with speakers on stands and a control desk. Footprints cross the floor and each one sends a ripple of light across 160 tiles; then the floor blooms into the PurpleHat mark.",
  body: [plinth("PH-05"), gantry(), riser(), control()],
  css, live, cues: CUES, end: END,
  names: ["Sensor armed", "Visitor on the floor", "Bloom"], headline: "Experiential<br>installations", tagline: "Every step, answered",
  sfx: steps.map((s) => ({ kind: "step", at: s.t })).concat([{ kind: "swell", at: T_BLOOM }, { kind: "tap", at: T_ARM }]),
});
