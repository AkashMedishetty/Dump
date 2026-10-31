// Fig 6 · Branding & design — "Brand shop". A wide-format printer prints the backdrop; a CNC router mills the cap mark as a sign.
import { k, P, at, S, L, D, depth, byDepth, halo, slab, cyl, seg, top, faceY, faceTop, plinth, writeFigure } from "./common.mjs";
const HERE = new URL(".", import.meta.url).pathname;

const MODEL = { width: 3.2, length: 2.4, rate: 32, passes: 48, feed: 18, toolD: 6, signD: 2.0, fast: 170, fastCnc: 6 };
const PRINT_S = (MODEL.width * MODEL.length / MODEL.rate) * 3600 / MODEL.fast;       // ≈ 5.1 s
// sign toolpath: the four panel outlines of the mark at 1.2 m across
const SIGN = [34, -24], R = (MODEL.signD / 2) * 10, SIGN_Z = 4.6;
const TIP = Math.atan2(67.7, 73.6), TI = Math.atan2(67.7, 73.6 - 125);
function panel(q, n = 40) {
  const pts = [], rot = (q - 1) * Math.PI / 2, c = Math.cos(rot), s = Math.sin(rot), f = R / 100;
  const push = (x, y) => pts.push([SIGN[0] + (x * c - y * s) * f, SIGN[1] + (x * s + y * c) * f]);
  for (let i = 0; i <= n; i++) { const a = -TIP + 2 * TIP * i / n; push(100 * Math.cos(a), 100 * Math.sin(a)); }
  for (let i = 1; i < n; i++) { const a = TI + (2 * Math.PI - 2 * TI) * i / n; push(125 + 85 * Math.cos(a), 85 * Math.sin(a)); }
  return pts;
}
const PANELS = [3, 0, 2, 1].map((q) => ({ q, pts: panel(q) }));
const pathLen = (pts) => pts.reduce((a, p, i) => a + (i ? Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0), 0) + Math.hypot(pts[0][0] - pts[pts.length - 1][0], pts[0][1] - pts[pts.length - 1][1]);
const TOOLPATH_M = PANELS.reduce((a, p) => a + pathLen(p.pts), 0) / 10;               // metres
const MILL_S = (TOOLPATH_M / MODEL.feed) * 60 / MODEL.fastCnc;
const T_PRINT = 0.8, T_MILL = T_PRINT + PRINT_S + 0.6, T_LIVE = T_MILL + MILL_S + 0.5;
const CUES = [{ at: T_PRINT, q: "Q1", what: "print the backdrop" }, { at: T_MILL, q: "Q2", what: "mill the sign" }, { at: T_LIVE, q: "Q3", what: "brand live" }];
const END = T_LIVE + 2.2;

const PR = { x: -78, y: -50, w: 44, d: 9, r: 0.6 }, PR_Z = 8;              // printer body
const SHEET = { x: -75, y: PR.y + PR.d, w: 38, maxD: 24 };                // backdrop feeding out (3.2 × 2.4 m at 1:100 → 32 × 24; drawn 38 incl. margins)
const BED = { x: SIGN[0] - 17, y: SIGN[1] - 17, w: 34, d: 34, r: 0.6 }, BED_Z = 4;

function printer() {
  const out = [];
  for (const x of [PR.x + 3, PR.x + PR.w - 7]) { out.push(slab({ x, y: PR.y - 2, w: 4, d: 13, r: 0.4 }, 0, 1, { tone: "lo" })); out.push(slab({ x: x + 1, y: PR.y + 2, w: 2, d: 3, r: 0.3 }, 1, PR_Z - 1, { tone: "mid" })); }
  out.push(S(k.slabOf({ x: PR.x + 2, y: PR.y - 4, w: PR.w - 4, d: 4, r: 1.8 }, PR_Z - 1, 4, P, 6, 0.3), { tone: "mid", inner: L(k.sideSeam({ x: PR.x + 2, y: PR.y - 4, w: PR.w - 4, d: 4, r: 1.8 }, PR_Z + 1, P, 6), { tone: "faint" }) }));   // media roll
  out.push(S(k.slabOf(PR, PR_Z, 6, P, 2, 0.5), { tone: "mid", inner: L(k.sideSeam(PR, PR_Z + 4.2, P, 2), { tone: "faint" }) }));
  out.push(slab({ x: PR.x + PR.w - 8, y: PR.y + 1, w: 6, d: 4, r: 0.5 }, PR_Z + 6, 1.4, { tone: "hi" }));    // control panel
  out.push(`<g transform="${faceY(PR.x + PR.w - 7.4, PR.y + 5.02, PR_Z + 7.2)}"><rect class="ph-screen" width="4.8" height="1.2" rx=".2"/><rect data-pbar x=".3" y=".35" width="0" height=".5" fill="#8f7bff"/></g>`);
  out.push(`<g data-head>${slab({ x: PR.x + 3, y: PR.y + 2, w: 5, d: 6, r: 0.5 }, PR_Z + 6, 2.4, { tone: "hi", lit: true }, 2, 0.3)}</g>`);
  for (const [x, c] of [[PR.x + 10, "#00a4d6"], [PR.x + 13, "#d6007e"], [PR.x + 16, "#f2d300"], [PR.x + 19, "#17112B"]]) out.push(cyl(x, PR.y - 6, 1, 0, 6, { tone: "mid" }, 12) + D([at([x, PR.y - 6, 6])], { size: 0.7, tone: "hi" }));
  return out.join("");
}

function sheet() {
  // the backdrop on the floor in front of the printer; printed area grows pass by pass (clip)
  const f = faceTop(SHEET.x, SHEET.y, 0.3);
  return `<g transform="${f}"><defs><clipPath id="ph-fed"><rect data-fed x="0" y="0" width="${SHEET.w}" height="0"/></clipPath><clipPath id="ph-ink"><rect data-ink x="0" y="0" width="${SHEET.w}" height="0"/></clipPath></defs>
    <g clip-path="url(#ph-fed)"><rect width="${SHEET.w}" height="${SHEET.maxD}" class="ph-media"/>
    <g clip-path="url(#ph-ink)"><rect x="3" y="2" width="${SHEET.w - 6}" height="${SHEET.maxD - 4}" fill="#5E44E8"/>
      <g transform="translate(${SHEET.w / 2} ${SHEET.maxD / 2}) scale(.075)"><path d="M-67.7 -73.6A100 100 0 0 1 67.7 -73.6A85 85 0 0 1 -67.7 -73.6Z M67.7 73.6A100 100 0 0 1 -67.7 73.6A85 85 0 0 1 67.7 73.6Z M-73.6 67.7A100 100 0 0 1 -73.6 -67.7A85 85 0 0 1 -73.6 67.7Z" fill="#F6F4EF"/><path d="M73.6 -67.7A100 100 0 0 1 73.6 67.7A85 85 0 0 1 73.6 -67.7Z" fill="#D7CFFF"/></g></g>
    <rect width="${SHEET.w}" height="${SHEET.maxD}" fill="none" class="iso-line" data-tone="lo"/></g></g>`;
}

function cnc() {
  const out = [halo(BED, 0, BED_Z, 3)];
  out.push(S(k.slabOf(BED, 0, BED_Z, P, 2, 0.5), { tone: "mid", inner: L(k.sideSeam(BED, 2.6, P, 2), { tone: "faint" }) }));
  let slots = ""; for (let x = BED.x + 4; x < BED.x + BED.w; x += 4) slots += top([x, BED.y], [x, BED.y + BED.d], BED_Z);
  out.push(L(slots, { tone: "faint" }));
  const block = { x: SIGN[0] - 12.5, y: SIGN[1] - 12.5, w: 25, d: 25, r: 0.4 };
  out.push(S(k.slabOf(block, BED_Z, SIGN_Z - BED_Z, P, 2, 0.3), { tone: "hi" }));
  // toolpath traced so far, and the panels rising out of the block
  out.push(`<path data-trace class="ph-trace" d=""/><g data-sign></g>`);
  // gantry: side rails, a bridge that moves in y, a spindle that moves in x
  for (const x of [BED.x - 2, BED.x + BED.w]) out.push(slab({ x, y: BED.y, w: 2, d: BED.d, r: 0.3 }, BED_Z, 2, { tone: "mid" }));
  return out.join("");
}
function bridge() {
  const y = SIGN[1], out = [];
  for (const x of [BED.x - 2.5, BED.x + BED.w - 0.5]) out.push(slab({ x, y: y - 2, w: 3, d: 4, r: 0.3 }, BED_Z + 2, 14, { tone: "mid" }));
  out.push(S(k.slabOf({ x: BED.x - 2.5, y: y - 2, w: BED.w + 5, d: 4, r: 0.4 }, BED_Z + 16, 3, P, 2, 0.4), { tone: "mid" }));
  return `<g data-bridge>${out.join("")}<g data-spindle>${slab({ x: SIGN[0] - 2, y: y + 2, w: 4, d: 3, r: 0.4 }, BED_Z + 8, 11, { tone: "hi", lit: true }, 2, 0.3)}${cyl(SIGN[0], y + 3.5, 0.6, SIGN_Z + 0.4, BED_Z + 8 - SIGN_Z - 0.4, { tone: "mid", crease: "none" }, 10)}</g></g>`;
}

function rack() {
  const out = [];
  out.push(slab({ x: -40, y: 22, w: 36, d: 10, r: 0.4 }, 0, 1, { tone: "lo" }));
  const rolls = [["#5E44E8", 9], ["#D7CFFF", 8], ["#F6F4EF", 10], ["#17112B", 7], ["#A996FF", 9], ["#e8e2d6", 8]];
  rolls.forEach(([c, h], i) => { const x = -36 + i * 5.6, y = 27; out.push(cyl(x, y, 2.2, 1, h * 2, { tone: "mid" }, 20, 0.3)); out.push(`<path d="${k.slabOf({ x: x - 2.2, y: y - 2.2, w: 4.4, d: 4.4, r: 2.2 }, 1 + h * 2, 0.01, P, 8).top}" fill="${c}" opacity=".9"/>`); out.push(cyl(x, y, 0.6, 1 + h * 2, 0.6, { tone: "lo" }, 10)); });
  // spot lights on stands aimed at the sign
  for (const [x, y] of [[62, 6], [10, 6]]) { out.push(cyl(x, y, 1.6, 0, 0.5, { tone: "lo" }, 12), cyl(x, y, 0.4, 0.5, 16, { tone: "mid", crease: "none" }, 10), slab({ x: x - 2, y: y - 2, w: 4, d: 4, r: 1 }, 16.5, 3, { tone: "mid" }, 3, 0.3)); }
  // light from the two spots onto the sign, faded in at Q3
  const g = [];
  [[62, 6], [10, 6]].forEach(([x, y], i) => { const o = at([x, y, 17]), tp = at([SIGN[0], SIGN[1], SIGN_Z + 2]);
    const v = [tp[0] - o[0], tp[1] - o[1]], len = Math.hypot(...v), n = [-v[1] / len, v[0] / len], w = 9;
    g.push(`<linearGradient id="ph-spot-${i}" gradientUnits="userSpaceOnUse" x1="${o[0]}" y1="${o[1]}" x2="${tp[0]}" y2="${tp[1]}"><stop offset="0" stop-color="var(--ph-glow)" stop-opacity=".55"/><stop offset="1" stop-color="var(--ph-glow)" stop-opacity=".05"/></linearGradient>`);
    out.push(`<path data-spot class="ph-light" opacity="0" d="M${o[0]} ${o[1]}L${tp[0] + n[0] * w} ${tp[1] + n[1] * w}L${tp[0] - n[0] * w} ${tp[1] - n[1] * w}Z" fill="url(#ph-spot-${i})"/>`); });
  return `<defs>${g.join("")}</defs>` + out.join("");
}

const css = `.ph-media{fill:#f2efe8}.iso[data-theme="dark"] .ph-media{fill:#2a2a2a}
.ph-trace{fill:none;stroke:#5E44E8;stroke-width:.9}.iso[data-theme="dark"] .ph-trace{stroke:#b9adff}`;

const live = `
const CUES = ${JSON.stringify(CUES)}, END = ${END}, M = ${JSON.stringify(MODEL)};
const T_PRINT = ${T_PRINT}, PRINT_S = ${PRINT_S}, T_MILL = ${T_MILL}, MILL_S = ${MILL_S}, T_LIVE = ${T_LIVE}, TOOLPATH_M = ${TOOLPATH_M};
const P = ${JSON.stringify(P)}, PANELS = ${JSON.stringify(PANELS)}, SIGN = ${JSON.stringify(SIGN)}, SIGN_Z = ${SIGN_Z}, PR = ${JSON.stringify(PR)}, SHEET = ${JSON.stringify(SHEET)};
const svgEl = document.querySelector(".iso-stage svg"), readout = document.querySelector("[data-readout]");
const head = svgEl.querySelector("[data-head]"), fed = svgEl.querySelector("[data-fed]"), ink = svgEl.querySelector("[data-ink]"), pbar = svgEl.querySelector("[data-pbar]");
const trace = svgEl.querySelector("[data-trace]"), sign = svgEl.querySelector("[data-sign]"), bridgeEl = svgEl.querySelector("[data-bridge]"), spindle = svgEl.querySelector("[data-spindle]");
const cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v)), sm = (x) => { x = cl(x); return x * x * (3 - 2 * x); };
// cumulative toolpath, in world units
const LENS = PANELS.map((p) => { let l = 0; const c = [0]; for (let i = 1; i <= p.pts.length; i++) { const a = p.pts[i - 1], b = p.pts[i % p.pts.length]; l += Math.hypot(b[0] - a[0], b[1] - a[1]); c.push(l); } return c; });
const TOTAL = LENS.reduce((a, c) => a + c[c.length - 1], 0);
function along(d) { // returns { panel, point, done[] }
  let rest = d; const done = [];
  for (let p = 0; p < PANELS.length; p++) { const c = LENS[p], len = c[c.length - 1];
    if (rest >= len) { done.push(1); rest -= len; continue; }
    let i = 1; while (c[i] < rest) i++; const u = (rest - c[i - 1]) / (c[i] - c[i - 1]); const a = PANELS[p].pts[i - 1], b = PANELS[p].pts[i % PANELS[p].pts.length];
    return { p, i, pt: [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u], done }; }
  return { p: PANELS.length, i: 0, pt: PANELS[PANELS.length - 1].pts[0], done };
}
let lastSign = -1, said = "";
function render(t) {
  // printer: the head sweeps once per pass; the sheet feeds out with the printed band behind the head
  const pu = cl((t - T_PRINT) / PRINT_S), pass = Math.min(M.passes, Math.floor(pu * M.passes) + (t > T_PRINT ? 1 : 0));
  const sweep = (pu * M.passes) % 1, dir = Math.floor(pu * M.passes) % 2;
  head.setAttribute("transform", translateAlong(P, [t > T_PRINT && pu < 1 ? (dir ? 1 - sweep : sweep) * (PR.w - 10) : 0, 0, 0]));
  fed.setAttribute("height", (SHEET.maxD * Math.min(1, pu * 1.04)).toFixed(2)); ink.setAttribute("height", (SHEET.maxD * pu).toFixed(2));
  pbar.setAttribute("width", (4.2 * pu).toFixed(2));
  // router: follow the toolpath; panels rise as each outline closes
  const mu = cl((t - T_MILL) / MILL_S), a = along(mu * TOTAL);
  const pts = []; for (let p = 0; p < a.p && p < PANELS.length; p++) pts.push(PANELS[p].pts.concat([PANELS[p].pts[0]]));
  if (a.p < PANELS.length && t > T_MILL) pts.push(PANELS[a.p].pts.slice(0, a.i).concat([a.pt]));
  trace.setAttribute("d", pts.map((pl) => "M" + pl.map((q) => iso([q[0], q[1], SIGN_Z + 0.05], P).map((v) => v.toFixed(2)).join(" ")).join("L")).join(""));
  const pos = t > T_MILL && mu < 1 ? a.pt : SIGN;
  bridgeEl.setAttribute("transform", translateAlong(P, [0, pos[1] - SIGN[1], 0])); spindle.setAttribute("transform", translateAlong(P, [pos[0] - SIGN[0], 0, 0]));
  const rise = PANELS.map((_, p) => p < a.p ? sm((t - T_MILL - (LENS.slice(0, p + 1).reduce((s, c) => s + c[c.length - 1], 0) / TOTAL) * MILL_S) / 0.5) : 0);
  const key = rise.map((r) => r.toFixed(2)).join(",") + (t >= T_LIVE ? "L" : "");
  if (key !== lastSign) { lastSign = key; sign.innerHTML = PANELS.map((p, n) => rise[n] > 0.01 ? solidSvg(extrude(p.pts, SIGN_Z, 3 * rise[n], P, { convex: false }), { tone: "hi", lit: p.q === 1 }) : "").join(""); }
  svgEl.querySelectorAll("[data-spot]").forEach((el) => el.setAttribute("opacity", sm((t - T_LIVE) / 0.6).toFixed(3)));
  const text = t < T_PRINT ? "standby · brand files approved"
    : t < T_MILL ? "Q1 · print · pass " + pass + "/" + M.passes + " · " + M.rate + " m²/h · " + M.width + " × " + M.length + " m"
    : t < T_LIVE ? "Q2 · mill · toolpath " + Math.round(mu * 100) + "% of " + TOOLPATH_M.toFixed(1) + " m · Ø" + M.toolD + " mm · " + M.feed + " m/min"
    : "Q3 · brand live · #5E44E8 · " + M.signD + " m sign";
  if (text !== said) { readout.textContent = text; said = text; }
}
`;

writeFigure(HERE, "brand-shop", {
  fig: "Fig 6", title: "Brand shop", hint: "Hover to scrub · → for the next cue", readout: "standby · brand files approved",
  keys: [{ mark: "lit", label: "The print head and the spindle: what makes the brand physical" }, { mark: "raised", label: "Printer, router, media rack and lights at 1:100" }],
  caption: `The brand, made physical. A ${MODEL.width} m wide-format printer prints a ${MODEL.width} × ${MODEL.length} m backdrop in ${MODEL.passes} passes at ${MODEL.rate} m²/h (${Math.round(MODEL.width * MODEL.length / MODEL.rate * 60)} min, shown ${MODEL.fast}× faster); then a CNC router follows the mark's ${TOOLPATH_M.toFixed(1)} m outline with a ${MODEL.toolD} mm cutter at ${MODEL.feed} m/min, and the four panels rise as a ${MODEL.signD} m sign.`,
  label: "A brand workshop on a precision plinth: a wide-format printer with ink bottles and a media roll printing a purple backdrop with the PurpleHat mark onto the floor, a CNC router with a moving gantry milling the cap mark out of a block, a rack of coloured media rolls and two spotlights.",
  body: [plinth("PH-06"), printer(), sheet(), rack(), cnc(), bridge()],
  css, live, cues: CUES, end: END,
  names: ["Print the backdrop", "Mill the sign", "Brand live"], headline: "Branding<br>&amp; design", tagline: "Every mark, made physical",
  sfx: [{ kind: "ticks", from: T_PRINT, to: T_PRINT + PRINT_S, every: PRINT_S / 48 }, { kind: "hum", from: T_MILL, to: T_MILL + MILL_S }, { kind: "swell", at: T_LIVE }],
});
