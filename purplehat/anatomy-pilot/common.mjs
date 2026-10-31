// Shared base for the PurpleHat Anatomy set: one plinth, one camera, one scale (1 unit = 10 cm).
import { writeFileSync } from "node:fs";
const KIT = "/home/user/wheresryan22/anatomy";
export const k = await import(KIT + "/kit/iso-kit.mjs");
const { kitScript } = await import(KIT + "/scripts/inline-kit.mjs");

export const WIDTH = 600, HEIGHT = 440;
export const PLATE = { x: -100, y: -64, w: 200, d: 156, r: 7 };
export const PLATE_H = 8, FOOT_H = 4;
// the same camera and fit as Fig 1 (Show call), so every figure in the set shares one scale
export const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [-54, -25, 110], [54, -21, 110], [0, -24, 91]],
  WIDTH, HEIGHT, { pad: 26, azimuth: 63 },
);
export const at = (p) => k.iso(p, P);
export const S = (paths, style) => k.solidSvg(paths, style);
export const L = (d, style) => k.lineSvg(d, style);
export const D = (pts, style) => k.dotsSvg(pts, style);
export const depth = (x, y, z = 0) => k.depthOf([x, y, z], P);
export const byDepth = (items, key = (i) => i) => [...items].sort((a, b) => depth(...key(a)) - depth(...key(b)));
export const halo = (plan, z, h, blur = 0) => `<path class="iso-halo" d="${k.haloOf(plan, z, h, P)}"${blur ? ` style="filter:blur(${blur}px)"` : ""}/>`;
export const slab = (plan, z, h, style = { tone: "mid" }, steps = 2, bevel = 0.3) => S(k.slabOf(plan, z, h, P, steps, bevel), style);
export const cyl = (x, y, r, z, h, style = { tone: "mid" }, steps = 20, bevel = 0) => S(k.cylinder(x, y, r, z, h, P, steps, bevel), style);
export const seg = (a, b) => k.segment(a, b, P);
export const top = (a, b, z) => k.lineOnTop(a, b, z, P);

// a vertical face y = const, local (u right, v down) from origin (x0, y, ztop)
export function faceY(x0, y, ztop) {
  const O = at([x0, y, ztop]), ex = at([x0 + 1, y, ztop]), ez = at([x0, y, ztop + 1]);
  return `matrix(${(ex[0] - O[0]).toFixed(5)} ${(ex[1] - O[1]).toFixed(5)} ${(-(ez[0] - O[0])).toFixed(5)} ${(-(ez[1] - O[1])).toFixed(5)} ${O[0].toFixed(3)} ${O[1].toFixed(3)})`;
}
// a vertical face x = const, local (u along +y, v down)
export function faceX(x, y0, ztop) {
  const O = at([x, y0, ztop]), ey = at([x, y0 + 1, ztop]), ez = at([x, y0, ztop + 1]);
  return `matrix(${(ey[0] - O[0]).toFixed(5)} ${(ey[1] - O[1]).toFixed(5)} ${(-(ez[0] - O[0])).toFixed(5)} ${(-(ez[1] - O[1])).toFixed(5)} ${O[0].toFixed(3)} ${O[1].toFixed(3)})`;
}
// the top face z, local (u along +x, v along +y)
export function faceTop(x0, y0, z) {
  const O = at([x0, y0, z]), ex = at([x0 + 1, y0, z]), ey = at([x0, y0 + 1, z]);
  return `matrix(${(ex[0] - O[0]).toFixed(5)} ${(ex[1] - O[1]).toFixed(5)} ${(ey[0] - O[0]).toFixed(5)} ${(ey[1] - O[1]).toFixed(5)} ${O[0].toFixed(3)} ${O[1].toFixed(3)})`;
}

export function plinth(code) {
  const out = [halo(PLATE, -PLATE_H - FOOT_H, PLATE_H)];
  for (const [x, y] of byDepth(k.corners(PLATE, 18))) {
    out.push(cyl(x, y, 6.5, -PLATE_H - FOOT_H, 1.4, { tone: "lo" }, 28));
    out.push(cyl(x, y, 5, -PLATE_H - FOOT_H + 1.4, FOOT_H - 1.4, { tone: "mid" }, 28));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.4), { tone: "mid", inner: L(k.sideSeam(PLATE, -3, P, 8), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 4.5), 0, P), { tone: "faint" }));
  const screws = k.corners(PLATE, 9);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2, 0, P, 16)).join(""), { tone: "lo" }), D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  const strip = { x: -80, y: PLATE.y + PLATE.d - 12, w: 120, d: 6, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const t = k.topTicks(strip.x + 3, strip.x + strip.w - 3, 3, 5, strip.y + 0.6, 0.6, [1.8, 3.2], P);
  out.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
  out.push(D([at([strip.x + 1.6, strip.y + 3, 0.6]), at([strip.x + strip.w - 1.6, strip.y + 3, 0.6])], { size: 0.42 }));
  const label = { x: 52, y: PLATE.y + PLATE.d - 18, w: 34, d: 12, r: 1 };
  out.push(S(k.slabOf(label, 0, 0.8, P, 3, 0.4), { tone: "mid" }));
  for (const dy of [4, 6.5, 9]) out.push(L(top([label.x + 13, label.y + dy], [label.x + label.w - 3, label.y + dy], 0.8), { tone: "lo", free: true }));
  out.push(k.faceTextSvg(k.topMatrix([label.x + 3, label.y + 7.2], 0.8, P, "x"), code, { size: 2.6, tone: "mid" }));
  out.push(D(k.corners(label, 1.6).map(([x, y]) => at([x, y, 0.8])), { size: 0.4 }));
  return out.join("");
}

export const BASE_CSS = `
.iso{--ph-purple:#5E44E8;--ph-lav:#D7CFFF;--ph-glow:#6a4ff0;--ph-screen:#1d1730;--ph-on:#8f7bff}
.iso[data-theme="dark"]{--ph-glow:#b9adff;--ph-screen:#0c0a14;--ph-on:#a99bff}
.ph-screen{fill:var(--ph-screen)}
.ph-light{mix-blend-mode:multiply}.iso[data-theme="dark"] .ph-light{mix-blend-mode:screen}
`;

// live runner shared by every figure: the figure's own code defines CUES, END and render(t)
const RUNNER = `
const __stage = document.querySelector(".iso-stage"), __svg = __stage.querySelector("svg");
const __still = matchMedia("(prefers-reduced-motion: reduce)");
const LOOP = END + 3.5;
window.PH = { render, CUES, LOOP, END };
let __clock = 0, __last = 0, __frame = 0, __tour = !__still.matches, __vis = false, __idle = 0, __scrub = null;
function __tick(now) {
  const dt = __last ? Math.min((now - __last) / 1000, 1 / 30) : 1 / 60; __last = now;
  if (__tour) __clock = (__clock + dt) % LOOP; else if (__scrub !== null) __clock += (__scrub - __clock) * (1 - Math.exp(-dt / 0.25));
  render(__clock);
  __frame = __vis && !window.PH_HOLD ? requestAnimationFrame(__tick) : 0;
}
const __run = () => { if (!__frame && __vis && !window.PH_HOLD) { __last = 0; __frame = requestAnimationFrame(__tick); } };
new IntersectionObserver((e) => { __vis = e[e.length - 1].isIntersecting; if (__vis) __run(); }, { rootMargin: "120px 0px" }).observe(__stage);
const __pause = () => { __tour = false; clearTimeout(__idle); __idle = setTimeout(() => { __tour = !__still.matches; __scrub = null; __run(); }, 3600); __run(); };
__stage.addEventListener("pointermove", (e) => { const b = __svg.getBoundingClientRect(); __scrub = Math.min(1, Math.max(0, (e.clientX - b.left) / b.width)) * END; __pause(); });
__stage.addEventListener("keydown", (e) => {
  const here = CUES.reduce((n, c, i) => (__clock >= c.at - 0.01 ? i : n), -1);
  let to = null;
  if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") to = Math.min(CUES.length - 1, here + 1);
  if (e.key === "ArrowLeft") to = Math.max(-1, here - 1);
  if (to === null) return; e.preventDefault();
  __scrub = to < 0 ? 0 : (to < CUES.length - 1 ? CUES[to + 1].at - 0.05 : END); __pause();
});
render(__still.matches ? END : 0);
`;

// writes light + dark pages and the parts the reel needs
export function writeFigure(dir, id, { fig, title, hint, readout, keys, caption, label, body, css = "", live, cues, end, names, headline, tagline, sfx = [] }) {
  const svg = k.figureSvg({ width: WIDTH, height: HEIGHT, label, body });
  const fullLive = live + RUNNER;
  const plate = k.plateHtml({ fig, title, hint, readout, keys, caption, body: `<div class="iso-stage" tabindex="0" role="img" aria-label="${title}: arrow right fires the next cue">${svg}</div>` });
  for (const theme of ["light", "dark"]) {
    writeFileSync(`${dir}/${id}${theme === "light" ? "-light" : ""}.html`, k.pageHtml({ title: `${title} · PurpleHat Events`, theme, body: `<style>${BASE_CSS}${css}</style>` + plate, script: kitScript() + fullLive, width: 720 }));
  }
  writeFileSync(`${dir}/parts-${id}.json`, JSON.stringify({ svg, CSS: BASE_CSS + css, live: fullLive, kit: kitScript(), cues, end, names, headline, tagline, sfx, fig, title, isoCss: k.ISO_CSS }));
  console.log(`wrote ${id}: cues ${cues.map((c) => c.at.toFixed(2)).join(" ")} end ${end.toFixed(2)}`);
}
