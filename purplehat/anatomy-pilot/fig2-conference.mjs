// Fig 2 · Conferences & PCO — "Plenary". Four counters print badges; each badge seats one delegate.
import { k, P, at, S, L, D, depth, byDepth, halo, slab, cyl, seg, top, faceY, plinth, writeFigure } from "./common.mjs";
const HERE = new URL(".", import.meta.url).pathname;

const MODEL = { seats: 88, counters: 4, badge: 8, fast: 22 };          // 8 s a badge, real time; clock 22× real
const CYCLE = MODEL.badge / MODEL.fast;                                 // figure seconds per badge per counter
const T0 = 0.8, FILL = (MODEL.seats / MODEL.counters) * CYCLE;          // 8.0 s to seat everyone
const CUES = [{ at: T0, q: "Q1", what: "doors open · registration" }, { at: T0 + FILL + 0.5, q: "Q2", what: "plenary" }];
const END = CUES[1].at + 1.6;

const STAGE = { x: -40, y: -58, w: 80, d: 15, r: 0.6 }, STAGE_H = 6;
const SCREEN = { x: -24, y: -61, w: 48, d: 2, r: 0.4 };
const TIERS = [{ y: -38, rise: 0 }, { y: -24, rise: 3 }, { y: -10, rise: 6 }, { y: 4, rise: 9 }];
const COLS = Array.from({ length: 11 }, (_, i) => -40 + i * 8);
const COUNTERS = [-48, -22, 4, 30];

// seats in fill order: front rows first, a little spread within a row
const seats = [];
TIERS.forEach((t, ti) => [3, 10].forEach((dy, ri) => COLS.forEach((x) => seats.push({ x: x - 2, y: t.y + dy, z: t.rise, row: ti * 2 + ri }))));
const rnd = ((a) => () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; })(7);
const order = seats.map((s, i) => ({ i, key: s.row + rnd() * 1.6 })).sort((a, b) => a.key - b.key).map((o) => o.i);
const rank = []; order.forEach((si, n) => (rank[si] = n));

function stage() {
  const out = [halo(STAGE, 0, STAGE_H, 3)];
  out.push(S(k.slabOf(STAGE, 0, STAGE_H, P, 3, 0.5), { tone: "mid", inner: L(k.sideSeam(STAGE, STAGE_H - 1.6, P, 3), { tone: "faint" }) }));
  for (let x = STAGE.x + 16; x < STAGE.x + STAGE.w; x += 16) out.push(L(top([x, STAGE.y], [x, STAGE.y + STAGE.d], STAGE_H), { tone: "faint" }));
  // screen on two legs, with its own face plane
  for (const x of [SCREEN.x + 4, SCREEN.x + SCREEN.w - 6]) out.push(slab({ x, y: SCREEN.y - 1, w: 2, d: 3, r: 0.3 }, STAGE_H, 4, { tone: "lo" }));
  out.push(S(k.slabOf(SCREEN, STAGE_H + 4, 26, P, 2, 0.4), { tone: "mid" }));
  const f = faceY(SCREEN.x + 1, SCREEN.y + SCREEN.d + 0.02, STAGE_H + 29);
  out.push(`<g transform="${f}"><rect class="ph-screen" width="46" height="24"/>
    <g data-slide opacity="0"><rect width="46" height="24" fill="#5E44E8"/>
      <g transform="translate(11 12) scale(.06)"><path d="M-67.7 -73.6A100 100 0 0 1 67.7 -73.6A85 85 0 0 1 -67.7 -73.6Z M67.7 73.6A100 100 0 0 1 -67.7 73.6A85 85 0 0 1 67.7 73.6Z M-73.6 67.7A100 100 0 0 1 -73.6 -67.7A85 85 0 0 1 -73.6 67.7Z" fill="#F6F4EF"/><path d="M73.6 -67.7A100 100 0 0 1 73.6 67.7A85 85 0 0 1 73.6 -67.7Z" fill="#D7CFFF"/></g>
      <rect x="21" y="8" width="18" height="2.4" rx=".6" fill="#F6F4EF"/><rect x="21" y="12.2" width="13" height="1.4" rx=".5" fill="#D7CFFF"/><rect x="21" y="15" width="15" height="1.4" rx=".5" fill="#D7CFFF" opacity=".7"/></g>
    <rect width="46" height="24" fill="none" class="iso-line" data-tone="lo"/></g>`);
  // lectern, stage right, with a gooseneck mic
  const lec = { x: 24, y: -51, w: 5, d: 4, r: 0.4 };
  out.push(slab(lec, STAGE_H, 11, { tone: "mid" }, 2, 0.4));
  out.push(`<g data-lectern opacity=".25">${S(k.slabOf({ x: lec.x - 0.3, y: lec.y - 0.3, w: 5.6, d: 4.6, r: 0.4 }, STAGE_H + 11, 0.8, P, 2), { tone: "hi", lit: true })}</g>`);
  out.push(L(seg([lec.x + 2.5, lec.y + 1, STAGE_H + 11.8], [lec.x + 3.6, lec.y + 2.4, STAGE_H + 15]), { tone: "mid" }), D([at([lec.x + 3.6, lec.y + 2.4, STAGE_H + 15])], { size: 0.6, tone: "hi" }));
  return out.join("");
}

function tiers() {
  const out = [];
  TIERS.forEach((t, ti) => {
    const plan = { x: -46, y: t.y, w: 92, d: 14, r: 0.5 };
    if (t.rise) out.push(S(k.slabOf(plan, 0, t.rise, P, 2, 0.4), { tone: "lo", inner: L(k.sideSeam(plan, t.rise - 0.8, P, 2), { tone: "faint" }) }));
    const rowSeats = seats.map((s, i) => ({ s, i })).filter(({ s }) => s.y >= t.y && s.y < t.y + 14);
    for (const { s, i } of byDepth(rowSeats, ({ s }) => [s.x + 2, s.y + 2])) {
      const z = s.z;
      out.push(cyl(s.x + 2, s.y + 2, 0.55, z, 3, { tone: "lo", crease: "none" }, 10));
      const empty = slab({ x: s.x, y: s.y, w: 4, d: 4, r: 0.6 }, z + 3, 1, { tone: "mid" }, 2, 0.3) + slab({ x: s.x, y: s.y + 3.2, w: 4, d: 0.8, r: 0.3 }, z + 4, 4, { tone: "mid" });
      const full = slab({ x: s.x, y: s.y, w: 4, d: 4, r: 0.6 }, z + 3, 1, { tone: "hi" }, 2, 0.3) + slab({ x: s.x, y: s.y + 3.2, w: 4, d: 0.8, r: 0.3 }, z + 4, 4, { tone: "hi" });
      out.push(`<g>${empty}<g data-seat="${i}" class="ph-occ" opacity="0">${full}${D([at([s.x + 2, s.y + 1.6, z + 4])], { size: 0.55, tone: "hi" })}</g></g>`);
    }
    // aisle step nosings: lines along the tier front, edge to edge
    if (t.rise) out.push(L(top([-46, t.y + 0.6], [46, t.y + 0.6], t.rise), { tone: "faint" }));
  });
  return out.join("");
}

function registration() {
  const out = [];
  // floor carpet runner from the doors to the hall
  const runner = { x: -56, y: 30, w: 112, d: 22, r: 1 };
  out.push(S(k.slabOf(runner, 0, 0.3, P, 2), { tone: "lo", crease: "none" }));
  out.push(L(k.planOutline(k.insetPlan(runner, 1.6), 0.3, P), { tone: "faint" }));
  COUNTERS.forEach((x, c) => {
    const desk = { x, y: 54, w: 18, d: 6, r: 0.6 };
    out.push(halo(desk, 0, 0.1, 2));
    out.push(S(k.slabOf(desk, 0, 10, P, 2, 0.4), { tone: "mid", inner: L(k.sideSeam(desk, 7.5, P, 2), { tone: "faint" }) }));
    // printer, badge tray and a scanner on the counter top
    const pr = { x: x + 2, y: 55, w: 6, d: 4, r: 0.5 };
    out.push(slab(pr, 10, 2.6, { tone: "mid" }, 2, 0.3));
    out.push(L(top([pr.x + 1, pr.y + pr.d - 0.8], [pr.x + 5, pr.y + pr.d - 0.8], 12.6), { tone: "lo" }));
    out.push(`<g data-badge="${c}">${slab({ x: pr.x + 1.4, y: pr.y + pr.d - 0.2, w: 3.2, d: 2.2, r: 0.2 }, 10.4, 0.25, { tone: "hi", crease: "none" }, 2, 0)}</g>`);
    out.push(`<g data-led="${c}" opacity=".2">${D([at([pr.x + 5.2, pr.y + 0.8, 12.6])], { size: 0.6, tone: "hi" })}</g>`);
    out.push(slab({ x: x + 11, y: 55.5, w: 5, d: 3, r: 0.4 }, 10, 0.8, { tone: "lo" }, 2, 0.2));
    out.push(cyl(x + 13.5, 57, 0.6, 10.8, 2.4, { tone: "mid" }, 12));
  });
  // queue: stanchions with ropes in front of the counters
  const posts = []; for (let x = -54; x <= 50; x += 13) posts.push([x, 72]);
  out.push(L(posts.slice(1).map((p, i) => seg([posts[i][0], 72, 7.6], [p[0], 72, 7.6])).join(""), { tone: "mid" }));
  for (const [x, y] of byDepth(posts)) { out.push(cyl(x, y, 1.6, 0, 0.6, { tone: "lo" }, 16)); out.push(cyl(x, y, 0.5, 0.6, 7.4, { tone: "mid", crease: "none" }, 10)); out.push(cyl(x, y, 0.8, 8, 0.8, { tone: "mid" }, 12)); }
  return out.join("");
}

const live = `
const CUES = ${JSON.stringify(CUES)}, END = ${END};
const M = ${JSON.stringify(MODEL)}, CYCLE = ${CYCLE}, T0 = ${T0};
const RANK = ${JSON.stringify(rank)};
const P = ${JSON.stringify(P)};
const svgEl = document.querySelector(".iso-stage svg"), readout = document.querySelector("[data-readout]");
const seatEls = [...svgEl.querySelectorAll("[data-seat]")].sort((a, b) => a.dataset.seat - b.dataset.seat);
const badges = [...svgEl.querySelectorAll("[data-badge]")], leds = [...svgEl.querySelectorAll("[data-led]")];
const slide = svgEl.querySelector("[data-slide]"), lectern = svgEl.querySelector("[data-lectern]");
const cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v)), sm = (x) => { x = cl(x); return x * x * (3 - 2 * x); };
let said = "";
function render(t) {
  const cycles = (t - T0) / CYCLE;
  const reg = Math.min(M.seats, Math.max(0, Math.floor(cycles) * M.counters + (cycles > 0 ? M.counters : 0)));
  seatEls.forEach((el, i) => el.setAttribute("opacity", sm((t - T0 - (RANK[i] / M.counters + 1) * CYCLE - 0.15) / 0.25).toFixed(3)));
  const ph = cycles - Math.floor(cycles), busy = t > T0 && reg < M.seats + 1 && cycles < M.seats / M.counters;
  badges.forEach((b, c) => b.setAttribute("transform", translateAlong(P, [0, busy ? 2.6 * sm(ph / 0.7) : (t > T0 ? 2.6 : 0), 0])));
  leds.forEach((l, c) => l.setAttribute("opacity", busy ? (0.35 + 0.65 * (1 - ph)).toFixed(3) : "0.2"));
  const k2 = sm((t - CUES[1].at) / 0.6);
  slide.setAttribute("opacity", k2.toFixed(3)); lectern.setAttribute("opacity", (0.25 + 0.75 * k2).toFixed(3));
  const seated = seatEls.filter((el) => +el.getAttribute("opacity") > 0.5).length;
  const text = t < T0 ? "standby · 0/" + M.seats + " registered"
    : t < CUES[1].at ? "Q1 · registered " + reg + "/" + M.seats + " · " + M.counters + " counters · " + M.badge + " s a badge"
    : "Q2 · plenary · " + seated + "/" + M.seats + " seated";
  if (text !== said) { readout.textContent = text; said = text; }
}
`;

writeFigure(HERE, "plenary", {
  fig: "Fig 2", title: "Plenary", hint: "Hover to scrub · → for the next cue", readout: "standby · 0/88 registered",
  keys: [{ mark: "lit", label: "Seats as they fill, and the lectern" }, { mark: "raised", label: "Hall, tiers and counters at 1:100" }],
  caption: `A conference hall as a scale model. Four registration counters each print a badge every ${MODEL.badge} s; every badge seats one delegate, front rows first, until all ${MODEL.seats} are in (${Math.round((MODEL.seats / MODEL.counters) * MODEL.badge / 60 * 10) / 10} min, shown ${MODEL.fast}× faster). Then the house goes to plenary.`,
  label: "A conference hall on a precision plinth: a stage with a screen and lectern, four raked tiers of 88 seats, four registration counters with badge printers and a queue of stanchions. Badges print and seats fill front rows first, then the screen and lectern come up for the plenary.",
  body: [plinth("PH-02"), stage(), tiers(), registration()],
  css: `.ph-occ .iso-top{fill:#d9d0ff}.ph-occ .iso-shade{fill:#c3b6ff}.ph-occ .iso-fill{fill:#cdc2ff}.iso[data-theme="dark"] .ph-occ .iso-top{fill:#3a2f73}.iso[data-theme="dark"] .ph-occ .iso-shade{fill:#2c2459}.iso[data-theme="dark"] .ph-occ .iso-fill{fill:#2c2459}`,
  live, cues: CUES, end: END,
  names: ["Doors open · registration", "Plenary"], headline: "Conferences<br>&amp; PCO", tagline: "Every delegate, in their seat",
  sfx: [{ kind: "ticks", from: T0, to: T0 + FILL, every: CYCLE }, { kind: "swell", at: CUES[1].at }],
});
