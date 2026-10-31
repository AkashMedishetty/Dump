// Fig 4 · Websites & apps — "Request". A tap on an event kiosk travels to the rack and back; the page builds in under a second.
import { k, P, at, S, L, D, depth, byDepth, halo, slab, cyl, seg, top, faceY, faceX, plinth, writeFigure } from "./common.mjs";
const HERE = new URL(".", import.meta.url).pathname;

// the true budget, in milliseconds of real time; the figure runs 6× slower than real time
const MODEL = { dns: 18, tls: 42, ttfb: 126, lcp: 840, slow: 6 };
const T_TAP = 0.8, ms = (x) => (x / 1000) * MODEL.slow;
const T_SRV = T_TAP + ms(MODEL.dns + MODEL.tls);                    // request reaches the rack
const T_RESP = T_TAP + ms(MODEL.dns + MODEL.tls + MODEL.ttfb);      // first byte leaves the rack
const T_LCP = T_TAP + ms(MODEL.lcp);                                // largest paint on the kiosk
const CUES = [{ at: T_TAP, q: "Q1", what: "tap · request" }, { at: T_SRV, q: "Q2", what: "server" }, { at: T_RESP, q: "Q3", what: "render" }, { at: T_LCP + 0.6, q: "Q4", what: "live" }];
const END = CUES[3].at + 2.2;

const RACKS = [-78, -66, -54, -42].map((x) => ({ x, y: -58, w: 10, d: 11, r: 0.4 }));
const RACK_H = 21;
const KIOSK = { x: 28, y: 44, w: 9, d: 4, r: 0.6 }, KIOSK_H = 20;
const WALL = { x: -8, y: -60, w: 52, d: 2.4, r: 0.4 };
// the cable route on the floor, rack row → kiosk, in world points
const ROUTE = [[-48, -45, 0.6], [-48, -30, 0.6], [20, -30, 0.6], [20, 46, 0.6], [28, 46, 0.6]];

function floor() {
  const out = [];
  const raised = { x: -90, y: -64, w: 60, d: 32, r: 0.6 };
  out.push(S(k.slabOf(raised, 0, 0.6, P, 2), { tone: "lo" }));
  let g = ""; for (let x = raised.x + 6; x < raised.x + raised.w; x += 6) g += top([x, raised.y], [x, raised.y + raised.d], 0.6);
  for (let y = raised.y + 6; y < raised.y + raised.d; y += 6) g += top([raised.x, y], [raised.x + raised.w, y], 0.6);
  out.push(L(g, { tone: "faint" }));
  // cable trench along the route, a cover strip on the floor
  for (let i = 0; i < ROUTE.length - 1; i++) {
    const [a, b] = [ROUTE[i], ROUTE[i + 1]];
    const plan = a[0] === b[0] ? { x: a[0] - 1.2, y: Math.min(a[1], b[1]) - 1.2, w: 2.4, d: Math.abs(b[1] - a[1]) + 2.4, r: 0.4 } : { x: Math.min(a[0], b[0]) - 1.2, y: a[1] - 1.2, w: Math.abs(b[0] - a[0]) + 2.4, d: 2.4, r: 0.4 };
    out.push(S(k.slabOf(plan, 0, 0.5, P, 2), { tone: "mid", crease: "none" }));
  }
  out.push(`<path data-route class="iso-line" data-tone="lo" d="${ROUTE.map((p, i) => (i ? "L" : "M") + at(p).map((v) => v.toFixed(2)).join(" ")).join("")}" style="stroke-dasharray:1 1.2"/>`);
  return out.join("");
}

function racks() {
  const out = [];
  for (const r of byDepth(RACKS, (r) => [r.x + 5, r.y + 5])) {
    out.push(halo(r, 0, RACK_H, 2));
    out.push(S(k.slabOf(r, 0.6, RACK_H, P, 2, 0.4), { tone: "mid" }));
    // front face (y = r.y + r.d): server units, vents and status LEDs
    const f = faceY(r.x + 0.8, r.y + r.d + 0.02, RACK_H - 0.4);
    let u = "", leds = "";
    for (let i = 0; i < 9; i++) { const y = 1 + i * 2.1; u += `<rect x="0" y="${y}" width="8.4" height="1.7" rx=".2" class="ph-unit"/>`; for (let v = 0; v < 5; v++) u += `<rect x="${1 + v * 0.9}" y="${y + 0.55}" width=".5" height=".6" class="ph-vent"/>`; leds += `<circle data-led="${RACKS.indexOf(r) * 9 + i}" cx="7.4" cy="${y + 0.85}" r=".38" class="ph-led" opacity=".25"/>`; }
    out.push(`<g transform="${f}">${u}${leds}</g>`);
    out.push(slab({ x: r.x - 0.2, y: r.y - 0.2, w: r.w + 0.4, d: r.d + 0.4, r: 0.4 }, RACK_H + 0.6, 0.8, { tone: "mid" }));
  }
  // cable tray over the row
  out.push(slab({ x: -79, y: -54, w: 48, d: 3, r: 0.3 }, RACK_H + 2.6, 1, { tone: "lo" }));
  for (const x of [-78, -32]) out.push(slab({ x, y: -53.4, w: 0.8, d: 0.8, r: 0.2 }, RACK_H + 1.4, 1.2, { tone: "mid" }));
  // cooling unit at the end of the row
  const cu = { x: -30, y: -58, w: 8, d: 11, r: 0.4 }; let vents = k.sideSeam(cu, 14, P, 2); for (let i = 0; i < 10; i++) vents += k.sideSeam(cu, RACK_H - 2 - i * 1.2, P, 2);
  out.push(S(k.slabOf(cu, 0.6, RACK_H, P, 2, 0.4), { tone: "mid", inner: L(vents, { tone: "lo" }) }));
  return out.join("");
}

function videoWall() {
  const out = [];
  for (const x of [WALL.x + 6, WALL.x + WALL.w - 8]) out.push(slab({ x, y: WALL.y - 1.5, w: 2, d: 4, r: 0.3 }, 0, 6, { tone: "lo" }));
  out.push(S(k.slabOf(WALL, 6, 26, P, 2, 0.4), { tone: "mid" }));
  const f = faceY(WALL.x + 1, WALL.y + WALL.d + 0.02, 31);
  let bars = ""; for (let i = 0; i < 12; i++) bars += `<rect data-bar="${i}" x="${26 + i * 1.6}" y="20" width="1.1" height="0" class="ph-bar"/>`;
  out.push(`<g transform="${f}"><rect class="ph-screen" width="50" height="24"/>
    <path class="iso-line" data-tone="lo" d="M16.67 0V24M33.33 0V24M0 12H50" style="opacity:.6"/><rect width="50" height="24" fill="none" class="iso-line" data-tone="lo"/>
    <g data-dash opacity=".3"><rect x="2" y="2.4" width="12" height="1.4" rx=".4" fill="#8f7bff"/><text data-count x="2" y="10" class="ph-count">0</text><text x="2" y="12.6" class="ph-small">CHECK-INS</text>
    <path data-spark d="M2 21L14 21" class="ph-spark"/>${bars}<rect x="35" y="2.4" width="13" height="7.6" rx=".6" fill="#5E44E8" opacity=".9"/><rect x="35" y="14" width="13" height="7.6" rx=".6" fill="#3b2d8f"/></g></g>`);
  return out.join("");
}

function noc() {
  const out = [];
  const desk = { x: -6, y: -22, w: 40, d: 8, r: 0.6 };
  out.push(halo(desk, 0, 0.1, 2));
  out.push(S(k.slabOf(desk, 0, 7.4, P, 2, 0.4), { tone: "mid", inner: L(k.sideSeam(desk, 6.2, P, 2), { tone: "faint" }) }));
  for (const x of [-2, 10, 22]) {
    out.push(slab({ x: x + 3, y: -21, w: 2, d: 1.6, r: 0.3 }, 7.4, 1.6, { tone: "lo" }));
    out.push(slab({ x, y: -21.6, w: 8, d: 0.8, r: 0.2 }, 9, 5, { tone: "mid" }));
    out.push(`<g transform="${faceY(x + 0.4, -20.78, 13.6)}"><rect class="ph-screen" width="7.2" height="4.2"/><rect data-mon x=".6" y=".6" width="0" height=".6" fill="#8f7bff"/></g>`);
    out.push(slab({ x: x + 1.5, y: -17.4, w: 5, d: 1.6, r: 0.3 }, 7.4, 0.3, { tone: "hi" }, 2, 0));
  }
  for (const x of [0, 12, 24]) { out.push(cyl(x + 4, -8, 1.8, 0, 0.5, { tone: "lo" }, 12)); out.push(cyl(x + 4, -8, 0.5, 0.5, 3.5, { tone: "mid", crease: "none" }, 10)); out.push(slab({ x: x + 2, y: -10, w: 4, d: 4, r: 0.6 }, 4, 1, { tone: "mid" })); out.push(slab({ x: x + 2, y: -7, w: 4, d: 0.8, r: 0.3 }, 5, 4.4, { tone: "mid" })); }
  return out.join("");
}


function foyer() {
  const out = [];
  for (const kx of [6, 50]) {
    const kp = { x: kx, y: 44, w: 9, d: 4, r: 0.6 };
    out.push(slab({ x: kx - 2, y: 42, w: 13, d: 8, r: 1 }, 0, 1, { tone: "lo" }, 3, 0.3));
    out.push(S(k.slabOf(kp, 1, KIOSK_H, P, 3, 0.5), { tone: "mid" }));
    out.push(`<g transform="${faceY(kx + 1, 48.02, KIOSK_H - 1)}"><rect class="ph-screen" width="7" height="14" rx=".4"/><g transform="translate(3.5 5.5) scale(.02)"><path d="M-67.7 -73.6A100 100 0 0 1 67.7 -73.6A85 85 0 0 1 -67.7 -73.6Z M67.7 73.6A100 100 0 0 1 -67.7 73.6A85 85 0 0 1 67.7 73.6Z M-73.6 67.7A100 100 0 0 1 -73.6 -67.7A85 85 0 0 1 -73.6 67.7Z M73.6 -67.7A100 100 0 0 1 73.6 67.7A85 85 0 0 1 73.6 -67.7Z" fill="#5E44E8" opacity=".55"/></g><rect x="1.6" y="10.5" width="3.8" height="1.2" rx=".6" fill="#3b2d8f"/></g>`);
  }
  // wifi access point on a pole by the kiosks
  out.push(cyl(-4, 40, 1.4, 0, 0.6, { tone: "lo" }, 14), cyl(-4, 40, 0.45, 0.6, 22, { tone: "mid", crease: "none" }, 10), cyl(-4, 40, 2.2, 22.6, 1, { tone: "hi" }, 20));
  out.push(`<g data-ap opacity=".2">${D([at([-4, 40, 23.6])], { size: 0.7, tone: "hi" })}</g>`);
  // lounge: two sofas around a low table
  for (const [x, y] of [[-70, 30], [-70, 52]]) { out.push(slab({ x, y, w: 26, d: 7, r: 1.2 }, 0, 4, { tone: "mid" }, 3, 0.4)); out.push(slab({ x, y: y === 30 ? y : y + 5, w: 26, d: 2, r: 0.8 }, 4, 3.6, { tone: "mid" }, 3, 0.3)); }
  out.push(slab({ x: -64, y: 40, w: 14, d: 8, r: 1.6 }, 0, 3.4, { tone: "hi" }, 4, 0.4));
  out.push(slab({ x: -60, y: 42, w: 4, d: 3, r: 0.3 }, 3.4, 0.25, { tone: "mid" }, 2, 0));
  return out.join("");
}

function kiosk() {
  const out = [halo({ x: KIOSK.x - 2, y: KIOSK.y - 2, w: 13, d: 8, r: 1 }, 0, 0.1, 2)];
  out.push(slab({ x: KIOSK.x - 2, y: KIOSK.y - 2, w: 13, d: 8, r: 1 }, 0, 1, { tone: "lo" }, 3, 0.3));
  out.push(S(k.slabOf(KIOSK, 1, KIOSK_H, P, 3, 0.5), { tone: "hi", lit: true }));
  // the page builds on the kiosk's screen, in its face plane
  const f = faceY(KIOSK.x + 1, KIOSK.y + KIOSK.d + 0.02, KIOSK_H - 1);
  out.push(`<g transform="${f}"><rect class="ph-screen" width="7" height="14" rx=".4"/>
    <rect data-blk="0" x=".6" y=".7" width="5.8" height="1" rx=".2" fill="#F6F4EF" opacity="0"/>
    <rect data-blk="1" x=".6" y="2.3" width="5.8" height="4.8" rx=".3" fill="#5E44E8" opacity="0"/>
    <g data-blk="2" opacity="0"><g transform="translate(3.5 4.7) scale(.016)"><path d="M-67.7 -73.6A100 100 0 0 1 67.7 -73.6A85 85 0 0 1 -67.7 -73.6Z M67.7 73.6A100 100 0 0 1 -67.7 73.6A85 85 0 0 1 67.7 73.6Z M-73.6 67.7A100 100 0 0 1 -73.6 -67.7A85 85 0 0 1 -73.6 67.7Z" fill="#F6F4EF"/><path d="M73.6 -67.7A100 100 0 0 1 73.6 67.7A85 85 0 0 1 73.6 -67.7Z" fill="#D7CFFF"/></g></g>
    <g data-blk="3" opacity="0"><rect x=".6" y="7.8" width="5" height=".6" rx=".2" fill="#F6F4EF"/><rect x=".6" y="8.9" width="4" height=".5" rx=".2" fill="#9a8fd8"/><rect x=".6" y="9.8" width="4.6" height=".5" rx=".2" fill="#9a8fd8"/></g>
    <rect data-blk="4" x=".6" y="11.4" width="3.6" height="1.4" rx=".7" fill="#D7CFFF" opacity="0"/>
    <circle data-touch cx="2.4" cy="12.1" r="0" fill="none" stroke="#F6F4EF" stroke-width=".25"/></g>`);
  return out.join("");
}

const css = `.ph-unit{fill:var(--anatomy-shade-1);stroke:var(--anatomy-lo);stroke-width:.12}.ph-vent{fill:var(--anatomy-lo)}
.ph-led{fill:#7b63f0}.iso[data-theme="dark"] .ph-led{fill:#b9adff}
.ph-bar{fill:#8f7bff}.ph-count{fill:#F6F4EF;font:700 6px ui-monospace,monospace}.ph-small{fill:#9a8fd8;font:500 1.6px ui-monospace,monospace;letter-spacing:.2px}
.ph-spark{fill:none;stroke:#D7CFFF;stroke-width:.35}
.ph-packet{fill:#5E44E8;stroke:#fff;stroke-width:.5}.iso[data-theme="dark"] .ph-packet{fill:#b9adff}`;

const live = `
const CUES = ${JSON.stringify(CUES)}, END = ${END};
const M = ${JSON.stringify(MODEL)}, T_TAP = ${T_TAP}, T_SRV = ${T_SRV}, T_RESP = ${T_RESP}, T_LCP = ${T_LCP};
const svgEl = document.querySelector(".iso-stage svg"), readout = document.querySelector("[data-readout]");
const route = svgEl.querySelector("[data-route]"), LEN = route.getTotalLength();
const NS = "http://www.w3.org/2000/svg";
const packets = Array.from({ length: 5 }, () => { const c = document.createElementNS(NS, "circle"); c.setAttribute("r", "1.9"); c.setAttribute("class", "ph-packet"); c.setAttribute("opacity", "0"); route.after(c); return c; });
const leds = [...svgEl.querySelectorAll("[data-led]")], blks = [...svgEl.querySelectorAll("[data-blk]")], bars = [...svgEl.querySelectorAll("[data-bar]")];
const touch = svgEl.querySelector("[data-touch]"), dash = svgEl.querySelector("[data-dash]"), count = svgEl.querySelector("[data-count]"), spark = svgEl.querySelector("[data-spark]");
const mons = [...svgEl.querySelectorAll("[data-mon]")];
const cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v)), sm = (x) => { x = cl(x); return x * x * (3 - 2 * x); };
const posAt = (u) => route.getPointAtLength(cl(u) * LEN);  // u = 0 at the rack, 1 at the kiosk
let said = "";
function render(t) {
  // request: kiosk → rack; response: five packets rack → kiosk
  packets.forEach((c, i) => {
    let u = null;
    if (i === 0 && t >= T_TAP && t < T_SRV) u = 1 - (t - T_TAP) / (T_SRV - T_TAP);
    if (t >= T_RESP + i * 0.12) { const v = (t - T_RESP - i * 0.12) / (T_LCP - T_RESP - 0.3); if (v < 1) u = v; }
    if (u === null) { c.setAttribute("opacity", "0"); return; }
    const p = posAt(u); c.setAttribute("cx", p.x.toFixed(2)); c.setAttribute("cy", p.y.toFixed(2)); c.setAttribute("opacity", "1");
  });
  const busy = t >= T_SRV && t < T_RESP + 0.4;
  svgEl.querySelector("[data-ap]").setAttribute("opacity", (t >= T_TAP && t < T_LCP) ? ((Math.sin(t * 30) > 0) ? "1" : ".4") : ".2");
  leds.forEach((l, i) => l.setAttribute("opacity", busy ? ((Math.sin(t * 40 + i * 2.1) > 0) ? "1" : ".3") : (t >= T_RESP ? ".55" : ".25")));
  touch.setAttribute("r", (t >= T_TAP ? 0.4 + 2.2 * sm((t - T_TAP) / 0.5) : 0).toFixed(2)); touch.setAttribute("opacity", (1 - sm((t - T_TAP) / 0.5)).toFixed(3));
  const span = T_LCP - T_RESP;
  blks.forEach((b, i) => b.setAttribute("opacity", sm((t - T_RESP - span * (0.25 + i * 0.16)) / 0.18).toFixed(3)));
  const live = sm((t - CUES[3].at) / 0.5);
  dash.setAttribute("opacity", (0.3 + 0.7 * live).toFixed(3));
  const n = Math.floor(1180 + Math.max(0, t - CUES[3].at) * 26);
  count.textContent = t >= CUES[3].at ? n.toLocaleString("en") : "—";
  bars.forEach((b, i) => { const h = 4 + 9 * (0.5 + 0.5 * Math.sin(i * 1.7 + (t >= CUES[3].at ? (t - CUES[3].at) * 3 : 0))) * live; b.setAttribute("height", h.toFixed(2)); b.setAttribute("y", (21 - h).toFixed(2)); });
  spark.setAttribute("d", "M2 21" + Array.from({ length: 13 }, (_, i) => "L" + (2 + i) + " " + (21 - (3 + 3 * Math.sin(i * 0.9 + t * 2)) * live).toFixed(2)).join(""));
  mons.forEach((m, i) => m.setAttribute("width", (6 * sm((t - T_SRV - i * 0.1) / 0.6)).toFixed(2)));
  const ms = (x) => Math.round(x);
  const realMs = Math.max(0, (t - T_TAP) / M.slow * 1000);
  const text = t < T_TAP ? "standby · kiosk idle"
    : t < T_SRV ? "Q1 · request · DNS " + M.dns + " ms · TLS " + M.tls + " ms · t+" + ms(realMs) + " ms"
    : t < T_RESP ? "Q2 · server · TTFB " + M.ttfb + " ms"
    : t < CUES[3].at ? "Q3 · render · t+" + ms(Math.min(realMs, M.lcp)) + " ms" + (t >= T_LCP ? " · LCP " + (M.lcp / 1000).toFixed(2) + " s · 200 OK" : "")
    : "Q4 · live · " + n.toLocaleString("en") + " check-ins";
  if (text !== said) { readout.textContent = text; said = text; }
}
`;

writeFigure(HERE, "request", {
  fig: "Fig 4", title: "Request", hint: "Hover to scrub · → for the next cue", readout: "standby · kiosk idle",
  keys: [{ mark: "lit", label: "The kiosk: where the tap starts and the page lands" }, { mark: "raised", label: "Server row, NOC desk and video wall at 1:100" }],
  caption: `One tap on an event kiosk, slowed ${MODEL.slow}× so it can be seen. DNS ${MODEL.dns} ms and TLS ${MODEL.tls} ms carry the request to the rack; the server answers in ${MODEL.ttfb} ms; the page is painted at ${MODEL.lcp} ms, under the 2.5 s "good" line for Largest Contentful Paint. Then the video wall counts check-ins live.`,
  label: "A server room and event kiosk on a precision plinth: a row of four racks with status lights, a cooling unit, a cable trench across the floor to a kiosk, a NOC desk with three monitors and chairs, and a video wall. A tap sends a packet to the racks, they light, response packets return and the kiosk builds its page block by block; then the video wall shows live check-ins.",
  body: [plinth("PH-04"), floor(), racks(), videoWall(), noc(), foyer(), kiosk()],
  css, live, cues: CUES, end: END,
  names: ["Tap · request", "Server", "Render", "Live"], headline: "Websites<br>&amp; apps", tagline: "Every tap, under a second",
  sfx: [{ kind: "tap", at: T_TAP }, { kind: "ticks", from: T_SRV, to: T_RESP, every: 0.08 }, { kind: "blips", from: T_RESP, to: T_LCP, n: 5 }, { kind: "swell", at: CUES[3].at }],
});
