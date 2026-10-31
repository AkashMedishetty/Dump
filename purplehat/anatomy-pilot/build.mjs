// PurpleHat Events — Anatomy pilot: "Show call". A stage on a model plinth; every GO on the
// front-of-house console fires one cue: the truss flies to trim on its chain hoists, the moving
// heads come on, the LED wall wakes tile by tile. 1 world unit = 10 cm.
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const KIT = "/home/user/wheresryan22/anatomy";
const k = await import(KIT + "/kit/iso-kit.mjs");
const { kitScript } = await import(KIT + "/scripts/inline-kit.mjs");

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--dark") ? "dark" : "light";
const WIDTH = 600, HEIGHT = 440;

// ---------- the true model ----------
const MODEL = {
  deck: 1.2,          // m, stage deck height
  low: 1.0,           // m above deck: truss at working height for focusing
  trim: 7.5,          // m above deck: show trim
  speed: 4,           // m/min, fixed-speed 1 t chain hoists
  fast: 17,           // the figure's clock runs 17× real time
  movers: 6,
  tiles: [12, 7],     // LED wall, 0.6 m tiles: 7.2 × 4.2 m
};
const TRAVEL_S = ((MODEL.trim - MODEL.low) / MODEL.speed) * 60 / MODEL.fast; // ≈ 5.74 s on the figure clock
const CUES = [
  { at: 1.2, q: "Q1", what: "fly truss to trim" },
  { at: 1.2 + TRAVEL_S + 0.7, q: "Q2", what: "movers on" },
  { at: 1.2 + TRAVEL_S + 2.9, q: "Q3", what: "LED wall up" },
  { at: 1.2 + TRAVEL_S + 5.8, q: "Q4", what: "show" },
];

// ---------- world plan ----------
const PLATE = { x: -100, y: -64, w: 200, d: 156, r: 7 };
const PLATE_H = 8, FOOT_H = 4;
const DECK = { x: -60, y: -46, w: 120, d: 46, r: 1 };
const DZ = MODEL.deck * 10;                    // 12
const WALL = { x: -37, y: -43, w: 74, d: 3, r: 0.6 };
const SCREEN = { x0: -36, x1: 36, top: DZ + 1 + 42, bottom: DZ + 1, y: WALL.y + WALL.d };
const TOWER_X = [-54, 50];                     // tower plan x (4 wide)
const TOWER = (x) => ({ x, y: -25, w: 4, d: 4, r: 0.3 });
const TOWER_TOP = DZ + 92;
const TRUSS = { x: -50, y: -24.5, w: 100, d: 3 };
const TRUSS_H = 3;
const Z_LOW = DZ + MODEL.low * 10;             // truss bottom chord at load-in
const Z_TRIM = DZ + MODEL.trim * 10;
const MOVER_X = [-40, -24, -8, 8, 24, 40];
const SPK_X = [-76, 68];
const FOH = { x: -20, y: 66, w: 40, d: 20, r: 1.5 };
const DESK = { x: -15, y: 70, w: 30, d: 11, r: 1 };
const GO = [10, 78];

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [TOWER_X[0], -25, TOWER_TOP + 6], [TOWER_X[1] + 4, -21, TOWER_TOP + 6], [0, -24, Z_TRIM + 4]],
  WIDTH, HEIGHT, { pad: 26, azimuth: 63 },
);

const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (pts, style) => k.dotsSvg(pts, style);
const depth = (x, y, z = 0) => k.depthOf([x, y, z], P);
const poly = (pts) => "M" + pts.map((p) => at(p).map((v) => v.toFixed(2)).join(" ")).join("L") + "Z";
const halo = (plan, z, h, blur = 0) => `<path class="iso-halo" d="${k.haloOf(plan, z, h, P)}"${blur ? ` style="filter:blur(${blur}px)"` : ""}/>`;

// a vertical face y = const mapped to local (u right, v down) from origin (x0, y, ztop)
function faceMatrix(x0, y, ztop) {
  const O = at([x0, y, ztop]), ex = at([x0 + 1, y, ztop]), ez = at([x0, y, ztop + 1]);
  const a = [ex[0] - O[0], ex[1] - O[1]], c = [-(ez[0] - O[0]), -(ez[1] - O[1])];
  return `matrix(${a[0].toFixed(5)} ${a[1].toFixed(5)} ${c[0].toFixed(5)} ${c[1].toFixed(5)} ${O[0].toFixed(3)} ${O[1].toFixed(3)})`;
}

// ---------- parts ----------
function plinth() {
  const out = [halo(PLATE, -PLATE_H - FOOT_H, PLATE_H)];
  const feet = k.corners(PLATE, 18).sort((a, b) => depth(...a) - depth(...b));
  for (const [x, y] of feet) {
    out.push(S(k.cylinder(x, y, 6.5, -PLATE_H - FOOT_H, 1.4, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5, -PLATE_H - FOOT_H + 1.4, FOOT_H - 1.4, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.4), { tone: "mid", inner: L(k.sideSeam(PLATE, -3, P, 8), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 4.5), 0, P), { tone: "faint" }));
  const screws = k.corners(PLATE, 9);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2, 0, P, 16)).join(""), { tone: "lo" }), D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  // ruler strip along the front edge, and the label plate
  const strip = { x: -80, y: PLATE.y + PLATE.d - 12, w: 120, d: 6, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const t = k.topTicks(strip.x + 3, strip.x + strip.w - 3, 3, 5, strip.y + 0.6, 0.6, [1.8, 3.2], P);
  out.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
  out.push(D([at([strip.x + 1.6, strip.y + 3, 0.6]), at([strip.x + strip.w - 1.6, strip.y + 3, 0.6])], { size: 0.42 }));
  const label = { x: 52, y: PLATE.y + PLATE.d - 18, w: 34, d: 12, r: 1 };
  out.push(S(k.slabOf(label, 0, 0.8, P, 3, 0.4), { tone: "mid" }));
  for (const dy of [4, 6.5, 9]) out.push(L(k.lineOnTop([label.x + 13, label.y + dy], [label.x + label.w - 3, label.y + dy], 0.8, P), { tone: "lo", free: true }));
  out.push(k.faceTextSvg(k.topMatrix([label.x + 3, label.y + 7.2], 0.8, P, "x"), "PH-01", { size: 2.6, tone: "mid" }));
  out.push(D(k.corners(label, 1.6).map(([x, y]) => at([x, y, 0.8])), { size: 0.4 }));
  return out.join("");
}

function speaker(x) {
  const y = -22, out = [halo({ x, y, w: 9, d: 9, r: 1 }, 0, 0.1, 3)];
  out.push(S(k.slabOf({ x, y, w: 9, d: 9, r: 0.8 }, 0, 10, P, 3, 0.5), { tone: "mid" }));
  for (const [z0, h] of [[10, 7], [17, 7]]) {
    const plan = { x: x + 0.5, y: y + 0.5, w: 8, d: 8, r: 0.8 };
    out.push(S(k.slabOf(plan, z0, h, P, 3, 0.5), { tone: "mid", inner: L(k.sideSeam(plan, z0 + 0.6, P, 3), { tone: "faint" }) }));
  }
  // drivers on the front face (y = y + 9)
  const fy = y + 9.01;
  out.push(L([k.sideRing([x + 4.5, fy, 5], 3.1, "y", P), k.sideRing([x + 4.5, fy, 5], 1.2, "y", P), k.sideRing([x + 3, fy + 0.5, 13.6], 1.8, "y", P), k.sideRing([x + 6.2, fy + 0.5, 12.5], 0.8, "y", P), k.sideRing([x + 3, fy + 0.5, 20.6], 1.8, "y", P), k.sideRing([x + 6.2, fy + 0.5, 19.5], 0.8, "y", P)].join(""), { tone: "lo" }));
  out.push(D([at([x + 1.2, fy, 1.2]), at([x + 7.8, fy, 1.2]), at([x + 1.2, fy, 8.8]), at([x + 7.8, fy, 8.8])], { size: 0.38 }));
  return out.join("");
}

function deck() {
  const out = [halo(DECK, 0, DZ, 4)];
  out.push(S(k.slabOf(DECK, 0, DZ, P, 3, 0.6), { tone: "mid", inner: L(k.sideSeam(DECK, DZ - 2.4, P, 3), { tone: "faint" }) }));
  // deck panels (2 × 1 m), edge to edge
  for (let x = DECK.x + 20; x < DECK.x + DECK.w; x += 20) out.push(L(k.lineOnTop([x, DECK.y], [x, DECK.y + DECK.d], DZ, P), { tone: "faint" }));
  out.push(L(k.lineOnTop([DECK.x, -23], [DECK.x + DECK.w, -23], DZ, P), { tone: "faint" }));
  // front skirt pleats hang from the seam to the floor
  for (let x = DECK.x + 6; x < DECK.x + DECK.w; x += 6) out.push(L(k.segment([x, 0, 0], [x, 0, DZ - 2.4], P), { tone: "faint" }));
  // steps, stage right
  for (const [y0, h] of [[0, 9], [3, 6], [6, 3]]) out.push(S(k.slabOf({ x: 40, y: y0, w: 12, d: 3, r: 0.3 }, 0, h, P, 2, 0.3), { tone: "mid" }));
  return out.join("");
}

function wall() {
  const out = [];
  // rear braces of the ground stack
  for (const x of [-30, 26]) out.push(S(k.slabOf({ x, y: -46, w: 4, d: 3, r: 0.3 }, DZ, 40, P, 2, 0.3), { tone: "lo" }));
  out.push(S(k.slabOf(WALL, DZ, 44, P, 2, 0.5), { tone: "mid" }));
  const [nx, ny] = MODEL.tiles, tile = 6;
  const tf = faceMatrix(SCREEN.x0, SCREEN.y + 0.02, SCREEN.top);
  const W = nx * tile, H = ny * tile;
  // screen: dark glass, then the content masked tile by tile, then the tile grid
  const mark = [
    "M-67.7 -73.6A100 100 0 0 1 67.7 -73.6A85 85 0 0 1 -67.7 -73.6Z",
    "M67.7 73.6A100 100 0 0 1 -67.7 73.6A85 85 0 0 1 67.7 73.6Z",
    "M-73.6 67.7A100 100 0 0 1 -73.6 -67.7A85 85 0 0 1 -73.6 67.7Z"];
  const visor = "M73.6 -67.7A100 100 0 0 1 73.6 67.7A85 85 0 0 1 73.6 -67.7Z";
  let rects = "";
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) rects += `<rect data-tile="${j * nx + i}" x="${i * tile}" y="${j * tile}" width="${tile}" height="${tile}" fill="#fff" opacity="0"/>`;
  out.push(`<g transform="${tf}">
    <defs><mask id="ph-led" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">${rects}</mask>
    <radialGradient id="ph-led-bg" cx="50%" cy="45%" r="70%"><stop offset="0" stop-color="#7a63f2"/><stop offset="1" stop-color="#3b25b8"/></radialGradient></defs>
    <rect class="ph-screen" x="0" y="0" width="${W}" height="${H}"/>
    <g mask="url(#ph-led)"><rect x="0" y="0" width="${W}" height="${H}" fill="url(#ph-led-bg)"/>
      <g transform="translate(${W / 2} ${H / 2}) scale(0.155)">${mark.map((d) => `<path d="${d}" fill="#F6F4EF"/>`).join("")}<path d="${visor}" fill="#D7CFFF"/></g></g>
    <path class="iso-line" data-tone="faint" d="${Array.from({ length: nx - 1 }, (_, i) => `M${(i + 1) * tile} 0V${H}`).join("")}${Array.from({ length: ny - 1 }, (_, j) => `M0 ${(j + 1) * tile}H${W}`).join("")}" style="stroke-width:.35;opacity:.55"/>
    <rect x="0" y="0" width="${W}" height="${H}" fill="none" class="iso-line" data-tone="lo"/>
  </g>`);
  return out.join("");
}

function tower(x) {
  const T = TOWER(x), out = [];
  out.push(S(k.slabOf({ x: x - 2, y: T.y - 2, w: 8, d: 8, r: 0.5 }, DZ, 1, P, 2, 0.3), { tone: "lo" }));          // base plate
  const c = [[x, T.y], [x + 3.2, T.y], [x, T.y + 3.2], [x + 3.2, T.y + 3.2]].sort((a, b) => depth(...a) - depth(...b));
  const chord = (cx, cy) => S(k.slabOf({ x: cx, y: cy, w: 0.8, d: 0.8, r: 0.2 }, DZ + 1, TOWER_TOP - DZ - 1, P, 2), { tone: "mid", crease: "none" });
  // back chords, lacing on the two visible faces, front chord
  out.push(chord(...c[0]), chord(...c[1]), chord(...c[2]));
  let lace = "";
  for (let z = DZ + 1; z < TOWER_TOP - 6; z += 6) {
    lace += k.segment([x + 0.4, T.y + 4, z], [x + 3.6, T.y + 4, z + 6], P) + k.segment([x + 4, T.y + 0.4, z], [x + 4, T.y + 3.6, z + 6], P);
    lace += k.segment([x + 0.4, T.y + 4, z + 6], [x + 3.6, T.y + 4, z + 6], P) + k.segment([x + 4, T.y + 0.4, z + 6], [x + 4, T.y + 3.6, z + 6], P);
  }
  out.push(L(lace, { tone: "lo" }));
  out.push(chord(...c[3]));
  // top block and the hoist hanging from its inner side
  out.push(S(k.slabOf({ x: x - 1, y: T.y - 1, w: 6, d: 6, r: 0.4 }, TOWER_TOP, 3, P, 2, 0.4), { tone: "mid" }));
  return out.join("");
}

const hoistX = (i) => (i === 0 ? TRUSS.x + 2 : TRUSS.x + TRUSS.w - 5);
function hoists() {
  const out = [];
  for (const i of [0, 1]) {
    const hx = hoistX(i);
    out.push(S(k.slabOf({ x: hx - 0.5, y: TRUSS.y - 0.5, w: 4, d: 4, r: 0.4 }, TOWER_TOP - 6, 4.5, P, 2, 0.4), { tone: "mid" }));
    out.push(S(k.cylinder(hx + 1.5, TRUSS.y + 1.5, 1.6, TOWER_TOP - 1.5, 1.5, P, 16), { tone: "lo" }));
    // spreader beam from the tower top to the hoist
    const tx = i === 0 ? TOWER_X[0] + 4 : TOWER_X[1];
    out.push(S(k.slabOf({ x: Math.min(tx, hx) - 0.5, y: TRUSS.y + 0.7, w: Math.abs(hx + 1.5 - tx) + 1, d: 1.6, r: 0.2 }, TOWER_TOP, 1.5, P, 2), { tone: "mid" }));
  }
  return out.join("");
}
const chainD = (zTop) => [0, 1].map((i) => k.segment([hoistX(i) + 1.5, TRUSS.y + 1.5, TOWER_TOP - 6], [hoistX(i) + 1.5, TRUSS.y + 1.5, zTop + TRUSS_H + 0.6], P)).join("");

// the flown system, built at the load-in height and moved with translateAlong
function truss() {
  const z = Z_LOW, out = [];
  const chord = (y, zz, tone) => S(k.slabOf({ x: TRUSS.x, y, w: TRUSS.w, d: 0.8, r: 0.25 }, zz, 0.8, P, 2), { tone, crease: "none" });
  out.push(chord(TRUSS.y, z + TRUSS_H - 0.8, "mid"), chord(TRUSS.y, z, "mid"));
  let back = "", front = "";
  for (let x = TRUSS.x; x < TRUSS.x + TRUSS.w - 1; x += 3) {
    back += k.segment([x, TRUSS.y + 0.4, z + 0.8], [x + 3, TRUSS.y + 0.4, z + TRUSS_H - 0.8], P);
    front += k.segment([x, TRUSS.y + TRUSS.d - 0.4, z + 0.8], [x + 3, TRUSS.y + TRUSS.d - 0.4, z + TRUSS_H - 0.8], P);
    front += k.segment([x + 3, TRUSS.y + 0.4, z + TRUSS_H - 0.4], [x + 3, TRUSS.y + TRUSS.d - 0.4, z + TRUSS_H - 0.4], P);
  }
  out.push(L(back, { tone: "faint" }));
  out.push(S(k.slabOf({ x: TRUSS.x, y: TRUSS.y + TRUSS.d - 0.8, w: TRUSS.w, d: 0.8, r: 0.25 }, z + TRUSS_H - 0.8, 0.8, P, 2), { tone: "hi", lit: true, crease: "none" }), S(k.slabOf({ x: TRUSS.x, y: TRUSS.y + TRUSS.d - 0.8, w: TRUSS.w, d: 0.8, r: 0.25 }, z, 0.8, P, 2), { tone: "hi", lit: true, crease: "none" }));
  out.push(L(front, { tone: "lo" }));
  // end plates and the hoist pick-up shackles
  for (const ex of [TRUSS.x - 0.6, TRUSS.x + TRUSS.w - 0.4]) out.push(S(k.slabOf({ x: ex, y: TRUSS.y - 0.3, w: 1, d: TRUSS.d + 0.6, r: 0.2 }, z - 0.3, TRUSS_H + 0.6, P, 2), { tone: "mid" }));
  out.push(D([0, 1].map((i) => at([hoistX(i) + 1.5, TRUSS.y + 1.5, z + TRUSS_H + 0.6])), { size: 0.7, tone: "hi" }));
  // moving heads hang under the bottom chords
  for (const mx of MOVER_X) {
    out.push(S(k.slabOf({ x: mx - 0.7, y: TRUSS.y + 0.8, w: 1.4, d: 1.4, r: 0.3 }, z - 1, 1, P, 2), { tone: "lo" }));
    out.push(S(k.slabOf({ x: mx - 1.8, y: TRUSS.y - 0.3, w: 3.6, d: 3.6, r: 0.6 }, z - 2.6, 1.6, P, 3, 0.3), { tone: "mid" }));
    out.push(S(k.cylinder(mx, TRUSS.y + 1.5, 1.5, z - 5.4, 2.8, P, 20, 0.3), { tone: "hi" }));
    out.push(L(k.sideArc(mx, TRUSS.y + 1.5, 1.5, z - 4.6, P, 12), { tone: "faint" }));
  }
  return out.join("");
}

// light from the heads, computed at trim; each beam is its own group so cues can fade them
function beams() {
  const out = [`<defs>`];
  const g = [];
  MOVER_X.forEach((mx, i) => {
    const o = at([mx, TRUSS.y + 1.5, Z_TRIM - 5.6]);
    const tx = mx * 0.55 + (i % 2 ? 7 : -7), ty = 22 + (i % 3) * 5;
    const t = at([tx, ty, 0]);
    const v = [t[0] - o[0], t[1] - o[1]], len = Math.hypot(...v), n = [-v[1] / len, v[0] / len], w = 7.5;
    out.push(`<linearGradient id="ph-beam-${i}" gradientUnits="userSpaceOnUse" x1="${o[0]}" y1="${o[1]}" x2="${t[0]}" y2="${t[1]}"><stop offset="0" stop-color="var(--ph-beam)" stop-opacity=".62"/><stop offset=".7" stop-color="var(--ph-beam)" stop-opacity=".16"/><stop offset="1" stop-color="var(--ph-beam)" stop-opacity="0"/></linearGradient>`);
    const pool = k.ring(tx, ty, 5.5, 0.05, P, 32);
    g.push(`<g data-beam="${i}" opacity="0"><path d="M${o[0]} ${o[1]}L${t[0] + n[0] * w} ${t[1] + n[1] * w}L${t[0] - n[0] * w} ${t[1] - n[1] * w}Z" fill="url(#ph-beam-${i})"/><path d="${pool}" class="ph-pool"/></g>`);
  });
  out.push(`</defs>`);
  return out.join("") + `<g class="ph-beams">${g.join("")}</g>`;
}

function seats() {
  const items = [];
  for (const y of [16, 25, 34, 43]) for (let x = -35; x <= 35; x += 14) items.push([x, y]);
  items.sort((a, b) => depth(...a) - depth(...b));
  return items.map(([x, y]) => [
    S(k.cylinder(x + 2, y + 2, 0.55, 0, 4, P, 10), { tone: "lo", crease: "none" }),
    S(k.slabOf({ x, y, w: 4, d: 4, r: 0.6 }, 4, 1, P, 2, 0.3), { tone: "mid" }),
    S(k.slabOf({ x, y: y + 3.2, w: 4, d: 0.8, r: 0.3 }, 5, 5, P, 2), { tone: "mid" }),
  ].join("")).join("");
}

function foh() {
  const out = [halo(FOH, 0, 2, 3)];
  out.push(S(k.slabOf(FOH, 0, 2.2, P, 3, 0.5), { tone: "lo" }));
  out.push(S(k.slabOf(DESK, 2.2, 6, P, 3, 0.5), { tone: "mid", inner: L(k.sideSeam(DESK, 6.4, P, 3), { tone: "faint" }) }));
  const top = 8.2;
  // fader strips: slots run front to back, caps as dots
  for (let i = 0; i < 12; i++) {
    const x = DESK.x + 3 + i * 1.6;
    out.push(L(k.lineOnTop([x, DESK.y + 4.5], [x, DESK.y + DESK.d - 1.5], top, P), { tone: "lo" }));
    out.push(D([at([x, DESK.y + 5 + ((i * 7) % 5), top])], { size: 0.45, tone: "mid" }));
  }
  out.push(D(Array.from({ length: 12 }, (_, i) => at([DESK.x + 3 + i * 1.6, DESK.y + 2.6, top])), { size: 0.32, tone: "lo" }));
  // cue screen standing at the back of the desk
  const scr = { x: DESK.x + 2, y: DESK.y + 0.4, w: 16, d: 1.2, r: 0.3 };
  out.push(S(k.slabOf(scr, top, 8, P, 2, 0.3), { tone: "mid" }));
  out.push(`<g transform="${faceMatrix(scr.x + 1, scr.y + scr.d + 0.02, top + 7)}"><rect class="ph-screen" x="0" y="0" width="14" height="6" rx=".4"/>${[0, 1, 2, 3].map((i) => `<rect data-cue-row="${i}" x="1" y="${0.9 + i * 1.25}" width="12" height=".8" rx=".2" class="ph-row"/>`).join("")}</g>`);
  // GO: the one button that matters
  out.push(S(k.cylinder(GO[0], GO[1], 2, top, 0.8, P, 24), { tone: "mid" }));
  out.push(`<g data-go>${S(k.cylinder(GO[0], GO[1], 1.5, top + 0.8, 0.9, P, 24, 0.3), { tone: "hi", lit: true })}</g>`);
  return out.join("");
}

// ---------- assemble ----------
const sidesBack = [speaker(SPK_X[0]), tower(TOWER_X[0])];
const svg = k.figureSvg({
  width: WIDTH, height: HEIGHT,
  label: "A scale model of a show on a precision plinth: a stage with an LED wall, two ground-support towers with chain hoists, a lighting truss with six moving heads, speaker stacks, 24 seats and a front-of-house console. Each press of GO fires the next cue: the truss flies from 1.0 to 7.5 metres at 4 metres a minute, the moving heads come on, and the LED wall lights tile by tile.",
  body: [
    plinth(),
    speaker(SPK_X[0]),
    deck(),
    wall(),
    tower(TOWER_X[0]),
    hoists(),
    `<path data-part="chains" class="iso-line" data-tone="mid" d="${chainD(Z_LOW)}" style="stroke-dasharray:.5 .45;stroke-width:.7"/>`,
    D([0, 1].map((i) => at([hoistX(i) + 1.5, TRUSS.y + 1.5, TOWER_TOP - 6])), { size: 0.6, tone: "mid" }),
    `<g data-part="truss" transform="${k.translateAlong(P, [0, 0, 0])}">${truss()}</g>`,
    tower(TOWER_X[1]),
    speaker(SPK_X[1]),
    k.wireSvg(at([0, 66, 0.1]), at([46, 0.2, 0.1]), { via: [at([0, 56, 0.1]), at([46, 56, 0.1])], tone: "lo" }),
    seats(),
    beams(),
    foh(),
  ],
});

const CSS = `
.iso{--ph-beam:#6a4ff0;--ph-screen:#1d1730}
.iso[data-theme="dark"]{--ph-beam:#b9adff;--ph-screen:#0c0a14}
.ph-screen{fill:var(--ph-screen)}
.ph-pool{fill:var(--ph-beam);opacity:.16}
.ph-row{fill:var(--anatomy-lo);opacity:.55}
.ph-row[data-on]{fill:#8f7bff;opacity:1}
[data-go]{opacity:.2}
.iso[data-theme="light"] .ph-beams{mix-blend-mode:multiply}
.iso[data-theme="dark"] .ph-beams{mix-blend-mode:screen}
`;

const live = `
const P = ${JSON.stringify(P)};
const M = ${JSON.stringify(MODEL)};
const CUES = ${JSON.stringify(CUES)};
const TRAVEL = ${TRAVEL_S}, Z_LOW = ${Z_LOW}, Z_TRIM = ${Z_TRIM}, TRUSS_H = ${TRUSS_H}, TOWER_TOP = ${TOWER_TOP};
const HX = [${hoistX(0) + 1.5}, ${hoistX(1) + 1.5}], HY = ${TRUSS.y + 1.5};
const NT = M.tiles[0] * M.tiles[1], LOOP = CUES[3].at + 4.2, STRIKE = LOOP + TRAVEL + 1.2;
const svg = document.querySelector(".iso-stage svg"), stage = document.querySelector(".iso-stage");
const truss = svg.querySelector('[data-part="truss"]'), chains = svg.querySelector('[data-part="chains"]');
const beams = [...svg.querySelectorAll("[data-beam]")], tiles = [...svg.querySelectorAll("[data-tile]")];
const rows = [...svg.querySelectorAll("[data-cue-row]")], go = svg.querySelector("[data-go]");
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
// fixed-speed hoists: constant 4 m/min with a 0.15 s soft start and stop
const travel = (u) => { const r = 0.15 / TRAVEL; u = clamp(u); if (u < r) return u * u / (2 * r) / (1 - r); if (u > 1 - r) return 1 - (1 - u) * (1 - u) / (2 * r) / (1 - r); return (u - r / 2) / (1 - r); };
function state(t) {
  const s = { h: M.low, beams: beams.map(() => 0), tiles: 0, cue: -1, go: 0 };
  if (t >= LOOP) { // strike: everything out, then the truss comes back down at the same speed
    const u = (t - LOOP - 0.9) / TRAVEL; s.h = M.trim - (M.trim - M.low) * travel(u);
    const out = 1 - ease((t - LOOP) / 0.6); s.beams = beams.map(() => out); s.tiles = NT * out; s.cue = 4; s.fade = out; return s;
  }
  for (let i = 0; i < CUES.length; i++) if (t >= CUES[i].at) { s.cue = i; s.go = Math.max(s.go, 1 - clamp((t - CUES[i].at) / 0.45)); }
  s.h = M.low + (M.trim - M.low) * travel((t - CUES[0].at) / TRAVEL);
  s.beams = beams.map((_, i) => ease((t - CUES[1].at - i * 0.22) / 0.5));
  s.tiles = clamp((t - CUES[2].at) / 2.1, 0, 1) * NT;
  if (s.cue === 3) s.beams = s.beams.map((b, i) => b * (0.8 + 0.2 * Math.cos((t - CUES[3].at) * 2.2 + i * 1.1)));
  return s;
}
let lastText = "";
function render(t) {
  const s = state(t);
  const dz = (s.h - M.low) * 10;
  truss.setAttribute("transform", translateAlong(P, [0, 0, dz]));
  chains.setAttribute("d", HX.map((x) => segment([x, HY, TOWER_TOP - 6], [x, HY, Z_LOW + dz + TRUSS_H + 0.6], P)).join(""));
  beams.forEach((b, i) => b.setAttribute("opacity", s.beams[i].toFixed(3)));
  tiles.forEach((r, i) => r.setAttribute("opacity", clamp(s.tiles - i * 1.0, 0, 1).toFixed(3)));
  rows.forEach((r, i) => (i <= s.cue && s.cue < 4 ? r.setAttribute("data-on", "") : r.removeAttribute("data-on")));
  go.style.opacity = (0.2 + 0.8 * s.go).toFixed(3);
  const lit = Math.round(s.tiles), on = s.beams.filter((b) => b > 0.5).length;
  const text = s.cue < 0 ? "standby · truss " + s.h.toFixed(2) + " m"
    : s.cue === 0 ? "Q1 · truss " + s.h.toFixed(2) + " m · " + (s.h < M.trim - 0.005 ? "↑ " + M.speed + " m/min" : "at trim")
    : s.cue === 1 ? "Q2 · movers " + on + "/" + M.movers
    : s.cue === 2 ? "Q3 · LED " + lit + "/" + NT + " tiles"
    : s.cue === 3 ? "Q4 · show · every cue on time"
    : "strike · truss " + s.h.toFixed(2) + " m";
  if (text !== lastText) { readout.textContent = text; lastText = text; }
}
window.PH = { render, state, LOOP: STRIKE, CUES };
let clock = 0, last = 0, frame = 0, touring = !still.matches, visible = false, idle = 0, scrub = null;
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60; last = now;
  if (touring) clock = (clock + dt) % STRIKE;
  else if (scrub !== null) clock += (scrub - clock) * (1 - Math.exp(-dt / 0.25));
  render(clock);
  frame = visible && !window.PH_HOLD ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible && !window.PH_HOLD) { last = 0; frame = requestAnimationFrame(tick); } };
new IntersectionObserver((e) => { visible = e[e.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
const pause = () => { touring = false; clearTimeout(idle); idle = setTimeout(() => { touring = !still.matches; scrub = null; run(); }, 3600); run(); };
stage.addEventListener("pointermove", (e) => { const b = svg.getBoundingClientRect(); scrub = clamp((e.clientX - b.left) / b.width) * (CUES[3].at + 2); pause(); });
stage.addEventListener("keydown", (e) => {
  const here = CUES.reduce((n, c, i) => (clock >= c.at - 0.01 ? i : n), -1);
  let to = null;
  if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") to = Math.min(CUES.length - 1, here + 1);
  if (e.key === "ArrowLeft") to = Math.max(-1, here - 1);
  if (to === null) return; e.preventDefault();
  scrub = to < 0 ? 0 : CUES[to].at + (to === 0 ? TRAVEL + 0.4 : to === 2 ? 2.4 : 1.2); pause();
});
render(still.matches ? CUES[3].at + 1 : 0);
`;

const body = k.plateHtml({
  fig: "Fig 1",
  title: "Show call",
  hint: "Hover to scrub the cues · → for GO",
  readout: "standby · truss 1.00 m",
  keys: [
    { mark: "lit", label: "The flown truss: what each GO moves" },
    { mark: "raised", label: "Stage, towers, wall and console at 1:100" },
  ],
  caption: `A show, built as a scale model. Each GO on the console fires one cue: the truss flies from ${MODEL.low.toFixed(1)} m to its ${MODEL.trim.toFixed(1)} m trim on two 1 t chain hoists at ${MODEL.speed} m/min (${Math.round(((MODEL.trim - MODEL.low) / MODEL.speed) * 60)} s, shown ${MODEL.fast}× faster), the six moving heads come on, and the ${MODEL.tiles[0]} × ${MODEL.tiles[1]} LED wall lights tile by tile.`,
  body: `<div class="iso-stage" tabindex="0" role="img" aria-label="Show call: arrow right fires the next cue">${svg}</div>`,
});

const file = theme === "light" ? "show-call-light.html" : "show-call.html";
writeFileSync(join(HERE, file), k.pageHtml({ title: "Show call · PurpleHat Events", theme, body: `<style>${CSS}</style>` + body, script: kitScript() + live, width: 720 }));
console.log("wrote", file, "travel", TRAVEL_S.toFixed(2), "s, cues", CUES.map((c) => c.at.toFixed(2)).join(" "));
if (theme === "light") writeFileSync(join(HERE, "parts.json"), JSON.stringify({ svg, CSS, live, kit: kitScript(), cues: CUES, travel: TRAVEL_S, isoCss: k.ISO_CSS }));
