// Fig 3 · MICE — "Arrivals". 180 guests land; two 45-seat coaches run 20 km to the resort; rooms light as they check in.
import { k, P, at, S, L, D, depth, byDepth, halo, slab, cyl, seg, top, faceY, plinth, writeFigure } from "./common.mjs";
const HERE = new URL(".", import.meta.url).pathname;

const MODEL = { guests: 180, coach: 45, coaches: 2, km: 20, kmh: 50, rooms: 90, fast: 900 };
const DRIVE = (MODEL.km / MODEL.kmh) * 3600 / MODEL.fast;             // 1.6 s one way on the figure clock
const LOAD = 0.4;
const CUES = [{ at: 0.8, q: "Q1", what: "flight lands" }, { at: 2.4, q: "Q2", what: "coaches roll" }];
const RUNS = [];                                                        // each run: coach, depart, arrive
for (let c = 0; c < 2; c++) for (let r = 0; r < 2; r++) { const dep = CUES[1].at + c * 0.8 + r * (2 * DRIVE + 2 * LOAD); RUNS.push({ c, dep, arr: dep + DRIVE }); }
RUNS.sort((a, b) => a.arr - b.arr);
const LAST = Math.max(...RUNS.map((r) => r.arr)) + 0.9;
CUES.push({ at: LAST + 0.3, q: "Q3", what: "welcome gala" });
const END = CUES[2].at + 1.6;

const ROAD = { x: -66, y: -26, w: 112, d: 8, r: 1 }, ROAD_Y = -22;
const STOP_A = -54, STOP_B = 32;                                         // coach x at terminal, at hotel
const HOTEL = { x: 40, y: -62, w: 34, d: 22, r: 0.6 }, FLOORS = 10, BAYS = 9, FLOOR_H = 5.6;
const HOTEL_TOP = 4 + FLOORS * FLOOR_H;

function airport() {
  const out = [];
  const runway = { x: -96, y: -62, w: 74, d: 13, r: 0.6 };
  out.push(S(k.slabOf(runway, 0, 0.4, P, 2), { tone: "lo" }));
  let dashes = ""; for (let x = runway.x + 4; x < runway.x + runway.w - 6; x += 8) dashes += top([x, -55.5], [x + 4, -55.5], 0.4);
  out.push(L(dashes, { tone: "mid", free: true }));
  for (const y of [runway.y + 1.2, runway.y + runway.d - 1.2]) out.push(L(top([runway.x, y], [runway.x + runway.w, y], 0.4), { tone: "faint" }));
  const term = { x: -96, y: -42, w: 30, d: 13, r: 0.6 };
  out.push(halo(term, 0, 10, 2));
  out.push(S(k.slabOf(term, 0, 9, P, 2, 0.4), { tone: "mid", inner: L(k.sideSeam(term, 6.4, P, 2) + k.sideSeam(term, 3.6, P, 2), { tone: "faint" }) }));
  out.push(slab({ x: -94, y: -40, w: 10, d: 9, r: 0.5 }, 9, 3, { tone: "mid" }));
  out.push(cyl(-74, -36, 1.4, 9, 9, { tone: "mid" }, 16), cyl(-74, -36, 3, 18, 2.2, { tone: "mid" }, 20));   // control tower
  return out.join("");
}

// the aircraft rolls out to its stand; built at the stand, moved along x
function aircraft() {
  const x0 = -60, y0 = -47, out = [];
  out.push(halo({ x: x0 - 12, y: y0 - 2, w: 26, d: 4, r: 2 }, 0, 0.1, 2));
  out.push(slab({ x: x0 - 3, y: y0 - 11, w: 7, d: 26, r: 1 }, 3.2, 0.7, { tone: "hi" }, 3, 0.2));     // wings
  out.push(S(k.slabOf({ x: x0 - 13, y: y0 - 2, w: 27, d: 4.4, r: 2.2 }, 1.6, 4.6, P, 6, 0.4), { tone: "hi", lit: true }));
  out.push(slab({ x: x0 - 13, y: y0 - 6, w: 5, d: 12, r: 0.6 }, 5, 0.5, { tone: "hi" }, 2, 0));         // tailplane
  out.push(slab({ x: x0 - 13, y: y0 - 0.4, w: 5, d: 1.2, r: 0.4 }, 6.2, 5, { tone: "hi" }, 2, 0));      // fin
  for (const yy of [y0 - 6, y0 + 6.4]) out.push(cyl(x0 + 1, yy, 1, 1.4, 2, { tone: "mid" }, 14));        // engines
  out.push(L(seg([x0 - 9, y0 + 4.42, 4.6], [x0 + 10, y0 + 4.42, 4.6]), { tone: "faint" }));              // window line
  return `<g data-plane>${out.join("")}</g>`;
}

function road() {
  const out = [S(k.slabOf(ROAD, 0, 0.35, P, 2), { tone: "lo", crease: "none" })];
  let d = ""; for (let x = ROAD.x + 3; x < ROAD.x + ROAD.w - 4; x += 7) d += top([x, ROAD_Y], [x + 3.5, ROAD_Y], 0.35);
  out.push(L(d, { tone: "mid", free: true }));
  out.push(L(top([ROAD.x, ROAD.y + 0.7], [ROAD.x + ROAD.w, ROAD.y + 0.7], 0.35) + top([ROAD.x, ROAD.y + ROAD.d - 0.7], [ROAD.x + ROAD.w, ROAD.y + ROAD.d - 0.7], 0.35), { tone: "faint" }));
  return out.join("");
}

function coach(c) {
  const y = c === 0 ? -25 : -21.4, out = [];
  const body = { x: 0, y, w: 13, d: 3.4, r: 0.8 };
  out.push(S(k.slabOf(body, 0.9, 5, P, 3, 0.4), { tone: "hi", inner: L(k.sideSeam(body, 3.2, P, 3) + k.sideSeam(body, 4.6, P, 3), { tone: "lo" }) }));
  out.push(D([[2.6, y + 3.4, 1], [10.4, y + 3.4, 1]].map(at), { size: 0.9, tone: "mid" }));
  return `<g data-coach="${c}">${out.join("")}</g>`;
}

function hotel() {
  const out = [halo(HOTEL, 0, HOTEL_TOP, 3)];
  const podium = { x: HOTEL.x - 3, y: HOTEL.y + HOTEL.d - 2, w: HOTEL.w + 6, d: 8, r: 0.6 };
  let seams = ""; for (let fl = 1; fl < FLOORS; fl++) seams += k.sideSeam(HOTEL, HOTEL_TOP - 1.5 - fl * FLOOR_H, P, 2);
  out.push(S(k.slabOf(HOTEL, 0, HOTEL_TOP, P, 2, 0.5), { tone: "mid", inner: L(seams, { tone: "faint" }) }));
  // rooms on the front face, one window each: 9 bays × 10 floors = 90 rooms
  const f = faceY(HOTEL.x + 1.5, HOTEL.y + HOTEL.d + 0.02, HOTEL_TOP - 1.5);
  let wins = "", lits = "";
  const bw = (HOTEL.w - 3) / BAYS;
  for (let fl = 0; fl < FLOORS; fl++) for (let b = 0; b < BAYS; b++) {
    const room = (FLOORS - 1 - fl) * BAYS + b;           // room 0 is ground floor
    const x = b * bw + 0.5, y = fl * FLOOR_H + 1.2;
    wins += `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${(bw - 1).toFixed(2)}" height="${(FLOOR_H - 2.4).toFixed(2)}" class="ph-win"/>`;
    lits += `<rect data-room="${room}" opacity="0" x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${(bw - 1).toFixed(2)}" height="${(FLOOR_H - 2.4).toFixed(2)}" class="ph-room"/>`;
  }
  let floors = ""; for (let fl = 1; fl < FLOORS; fl++) floors += `M-1.5 ${fl * FLOOR_H}H${HOTEL.w - 1.5}`;
  out.push(`<g transform="${f}">${wins}${lits}</g>`);
  out.push(slab({ x: HOTEL.x + 4, y: HOTEL.y + 4, w: 10, d: 8, r: 0.5 }, HOTEL_TOP, 4, { tone: "mid" }));   // plant room
  out.push(S(k.slabOf(podium, 0, 4, P, 2, 0.4), { tone: "mid" }));
  out.push(slab({ x: HOTEL.x + 8, y: podium.y + podium.d - 1, w: 16, d: 5, r: 0.5 }, 4.6, 0.6, { tone: "hi" }));     // porte-cochère canopy
  for (const x of [HOTEL.x + 9, HOTEL.x + 23]) out.push(cyl(x, podium.y + podium.d + 3, 0.5, 0, 4.6, { tone: "mid", crease: "none" }, 10));
  return out.join("");
}

function resort() {
  const out = [];
  // pool with water tint and loungers
  const pool = { x: -34, y: 6, w: 40, d: 20, r: 3 };
  out.push(S(k.slabOf(k.insetPlan(pool, -2), 0, 0.8, P, 6, 0.3), { tone: "mid" }));
  out.push(`<path d="${k.slabOf(pool, 0, 0.8, P, 6).top}" class="ph-water"/>`);
  out.push(L(k.planOutline(k.insetPlan(pool, 1.5), 0.8, P, 6), { tone: "faint" }));
  for (let x = -32; x <= 2; x += 6) out.push(slab({ x, y: 30, w: 3.4, d: 7, r: 0.5 }, 0, 1.2, { tone: "mid" }, 2, 0.2));
  // palms
  for (const [x, y] of byDepth([[-44, 4], [12, 2], [-44, 32], [14, 34]])) { out.push(cyl(x, y, 0.7, 0, 13, { tone: "mid", crease: "none" }, 10));
    const star = []; for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2 + 0.2, r = i % 2 ? 1.1 : 5.2; star.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); }
    out.push(S(k.extrude(star, 12.6, 0.5, P, { convex: false }), { tone: "hi" })); out.push(cyl(x, y, 1, 12.9, 0.9, { tone: "mid" }, 12)); }
  // gala tent: walls, ridge roof lines, and a string of lanterns
  const tent = { x: 26, y: 12, w: 42, d: 30, r: 0.4 };
  out.push(halo(tent, 0, 0.1, 3));
  out.push(S(k.slabOf(tent, 0, 9, P, 2, 0.4), { tone: "hi", inner: L(k.sideSeam(tent, 7.6, P, 2), { tone: "faint" }) }));
  const ridge = [[26, 27, 9], [68, 27, 9]];
  out.push(L(seg([26, 12, 9], [26, 27, 16]) + seg([26, 27, 16], [26, 42, 9]) + seg([68, 12, 9], [68, 27, 16]) + seg([68, 27, 16], [68, 42, 9]) + seg([26, 27, 16], [68, 27, 16]) + seg([47, 12, 9], [47, 27, 16]) + seg([47, 27, 16], [47, 42, 9]), { tone: "mid" }));
  let lan = ""; const pts = []; for (let i = 0; i <= 12; i++) { const x = 28 + i * 3.3; pts.push(at([x, 42.2, 7 - Math.sin((i / 12) * Math.PI) * 1.6])); }
  out.push(`<path d="M${pts.map((p) => p.map((v) => v.toFixed(2)).join(" ")).join("L")}" class="iso-line" data-tone="lo"/>`);
  out.push(`<g data-lanterns opacity=".15">${D(pts, { size: 0.9, tone: "hi" })}<g class="ph-light">${pts.map((p) => `<circle cx="${p[0].toFixed(2)}" cy="${p[1].toFixed(2)}" r="3.2" fill="url(#ph-lantern)"/>`).join("")}</g></g>`);
  return `<defs><radialGradient id="ph-lantern"><stop offset="0" stop-color="#f3b54a" stop-opacity=".75"/><stop offset="1" stop-color="#f3b54a" stop-opacity="0"/></radialGradient></defs>` + out.join("");
}

const css = `.ph-win{fill:var(--anatomy-shade-1)}.ph-room{fill:#f6c66b}.iso[data-theme="dark"] .ph-room{fill:#ffcf73}
.ph-water{fill:#cfc6ff;opacity:.85}.iso[data-theme="dark"] .ph-water{fill:#2a2361}`;

const live = `
const CUES = ${JSON.stringify(CUES)}, END = ${END}, RUNS = ${JSON.stringify(RUNS)};
const M = ${JSON.stringify(MODEL)}, DRIVE = ${DRIVE}, LOAD = ${LOAD}, STOP_A = ${STOP_A}, STOP_B = ${STOP_B};
const P = ${JSON.stringify(P)};
const svgEl = document.querySelector(".iso-stage svg"), readout = document.querySelector("[data-readout]");
const plane = svgEl.querySelector("[data-plane]"), coaches = [...svgEl.querySelectorAll("[data-coach]")];
const rooms = [...svgEl.querySelectorAll("[data-room]")].sort((a, b) => a.dataset.room - b.dataset.room), lanterns = svgEl.querySelector("[data-lanterns]");
const cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v)), sm = (x) => { x = cl(x); return x * x * (3 - 2 * x); };
// a coach's x: out on its runs, back between them, parked otherwise
function coachX(c, t) {
  const mine = RUNS.filter((r) => r.c === c).sort((a, b) => a.dep - b.dep);
  let x = STOP_A;
  for (let i = 0; i < mine.length; i++) {
    const r = mine[i];
    if (t >= r.dep && t < r.arr) return STOP_A + (STOP_B - STOP_A) * sm((t - r.dep) / DRIVE);
    if (t >= r.arr) { x = STOP_B; const back = r.arr + LOAD, next = mine[i + 1]; if (next && t >= back) x = STOP_B + (STOP_A - STOP_B) * sm((t - back) / DRIVE); }
  }
  return x;
}
let said = "";
function render(t) {
  plane.setAttribute("transform", translateAlong(P, [-34 * (1 - sm((t - CUES[0].at) / 1.3)), 0, 0]));
  coaches.forEach((el, c) => el.setAttribute("transform", translateAlong(P, [coachX(c, t), 0, 0])));
  const arrived = RUNS.filter((r) => t >= r.arr).length, guests = arrived * M.coach;
  rooms.forEach((el, i) => { const run = Math.floor(i / (M.rooms / RUNS.length)), r = RUNS[run]; const local = (i % (M.rooms / RUNS.length)) / (M.rooms / RUNS.length); el.setAttribute("opacity", r ? sm((t - r.arr - local * 0.8) / 0.18).toFixed(3) : "0"); });
  lanterns.setAttribute("opacity", (0.15 + 0.85 * sm((t - CUES[2].at) / 0.7)).toFixed(3));
  const runs = RUNS.filter((r) => t >= r.dep).length;
  const text = t < CUES[0].at ? "standby · " + M.guests + " guests inbound"
    : t < CUES[1].at ? "Q1 · flight on stand · " + M.guests + " guests"
    : t < CUES[2].at ? "Q2 · coach runs " + runs + "/4 · " + guests + "/" + M.guests + " at the resort"
    : "Q3 · welcome gala · " + M.guests + "/" + M.guests + " checked in";
  if (text !== said) { readout.textContent = text; said = text; }
}
`;

writeFigure(HERE, "arrivals", {
  fig: "Fig 3", title: "Arrivals", hint: "Hover to scrub · → for the next cue", readout: "standby · 180 guests inbound",
  keys: [{ mark: "lit", label: "The aircraft and the coaches: what moves the guests" }, { mark: "raised", label: "Airport, road, resort and gala tent at 1:100" }],
  caption: `An incentive trip as a scale model. ${MODEL.guests} guests land; two ${MODEL.coach}-seat coaches make four runs of ${MODEL.km} km at ${MODEL.kmh} km/h (${Math.round(MODEL.km / MODEL.kmh * 60)} min each way, shown ${MODEL.fast}× faster), and the ${MODEL.rooms} twin rooms light as each coach checks in. Then the welcome gala.`,
  label: "An incentive trip on a precision plinth: a runway and terminal with an aircraft, a road with two coaches, a ten-floor resort hotel with 90 rooms on its face, a pool with palms and a gala tent with lanterns. Coaches shuttle guests and the rooms light as they check in, then the gala tent lights.",
  body: [plinth("PH-03"), airport(), aircraft(), hotel(), road(), coach(0), coach(1), resort()],
  css, live, cues: CUES, end: END,
  names: ["Flight lands", "Coaches roll", "Welcome gala"], headline: "MICE &amp;<br>incentives", tagline: "Every guest, every transfer",
  sfx: RUNS.map((r) => ({ kind: "arrive", at: r.arr })).concat([{ kind: "swell", at: CUES[2].at }, { kind: "whoosh", at: CUES[0].at }]),
});
