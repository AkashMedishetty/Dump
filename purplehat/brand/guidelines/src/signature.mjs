// Signature business cards: finishes-led designs (deboss, emboss, foil, die-cut window, painted edge).
// Units: mm. Each card renders in three modes:
//   'fx'   — mockup: deboss/emboss and foil simulated with light, for presentation
//   'ink'  — print plate: process/Pantone inks only (blind areas carry no ink)
//   'deboss' | 'emboss' | 'foil' | 'die' — separation plates (100% black = the finish), for the finisher
import { C, T, f2, uid, markInner, markH, W, H, G } from './lib.mjs';
import { PERSON } from './print.mjs';

export const SIG = { r: 2.5, edge: C.blue };
const bg = (tw, th, fill, b = 3) => `<rect x="${-b}" y="${-b}" width="${tw + 2 * b}" height="${th + 2 * b}" fill="${fill}"/>`;
const mk = (x, y, w, o) => `<g transform="translate(${f2(x)} ${f2(y)}) scale(${(w / W).toFixed(5)})">${markInner(o)}</g>`;
const strokesOnly = (x, y, w, col) => mk(x, y, w, { color: col, hideDots: true });
const dotsOnly = (x, y, w, col) => { const k = w / W; return `<g transform="translate(${f2(x)} ${f2(y)}) scale(${k.toFixed(5)})">${G_DOTS.map(d => `<circle cx="${d.cx}" cy="${d.cy}" r="${d.r}" fill="${col}"/>`).join('')}</g>`; };
const G_DOTS = G.parts.filter(p => p.kind === 'dot');

// ---------------------------------------------------------------- material simulation (mockups only)
function foilDefs(id, base = C.blue) {
  return `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5F8FF2"/><stop offset=".35" stop-color="${base}"/><stop offset=".55" stop-color="#3D73EE"/><stop offset=".8" stop-color="#1F52D3"/><stop offset="1" stop-color="#2F66E6"/></linearGradient>`;
}
/** Blind deboss (pressed in) or emboss (raised) of any white-filled art, on a ground colour. */
function relief(artFn, ground, mode, o = {}) {
  const id = uid('rl'), d = o.depth || 0.32, inv = mode === 'emboss' ? -1 : 1;
  const face = o.face || ground;
  return `<defs><mask id="${id}f"><rect x="-20" y="-20" width="200" height="200" fill="#000"/>${artFn('#fff')}</mask>
<mask id="${id}s"><rect x="-20" y="-20" width="200" height="200" fill="#fff"/><g transform="translate(${f2(d * inv)} ${f2(d * 1.25 * inv)})">${artFn('#000')}</g></mask>
<mask id="${id}h"><rect x="-20" y="-20" width="200" height="200" fill="#fff"/><g transform="translate(${f2(-d * inv)} ${f2(-d * 1.25 * inv)})">${artFn('#000')}</g></mask>
<filter id="${id}b" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="${f2(d * 0.45)}"/></filter></defs>
<g mask="url(#${id}f)"><rect x="-20" y="-20" width="200" height="200" fill="${face}"/>
<g mask="url(#${id}s)"><rect x="-20" y="-20" width="200" height="200" fill="#000" opacity="${o.shadow ?? 0.42}" filter="url(#${id}b)"/></g>
<g mask="url(#${id}h)"><rect x="-20" y="-20" width="200" height="200" fill="#fff" opacity="${o.light ?? 0.16}" filter="url(#${id}b)"/></g></g>`;
}
function foilDots(x, y, w, id) {
  const k = w / W; return `<g transform="translate(${f2(x)} ${f2(y)}) scale(${k.toFixed(5)})">${G_DOTS.map(d => `<circle cx="${d.cx}" cy="${d.cy}" r="${d.r}" fill="url(#${id})"/><path d="M${f2(d.cx - d.r * 0.62)} ${f2(d.cy - d.r * 0.2)}A${f2(d.r * 0.66)} ${f2(d.r * 0.66)} 0 0 1 ${f2(d.cx + d.r * 0.1)} ${f2(d.cy - d.r * 0.64)}" stroke="#fff" stroke-opacity=".22" stroke-width="${f2(d.r * 0.16)}" fill="none" stroke-linecap="round"/>`).join('')}</g>`;
}
const foilDot = (cx, cy, r, id) => `<circle cx="${f2(cx)}" cy="${f2(cy)}" r="${f2(r)}" fill="url(#${id})"/><path d="M${f2(cx - r * 0.62)} ${f2(cy - r * 0.2)}A${f2(r * 0.66)} ${f2(r * 0.66)} 0 0 1 ${f2(cx + r * 0.1)} ${f2(cy - r * 0.64)}" stroke="#fff" stroke-opacity=".22" stroke-width="${f2(r * 0.16)}" fill="none" stroke-linecap="round"/>`;
const plate = (tw, th, inner) => bg(tw, th, '#FFFFFF') + `<g fill="#000" stroke="#000">${inner}</g>`;

// ---------------------------------------------------------------- name side shared by the signature cards
function nameSide(tw, th, mode, o = {}) {
  const m = 5.5, P = PERSON, ground = o.ground || C.warm; let s = '';
  const tog = { x: tw - m - 6.4, y: m, w: 6.4, h: th - 2 * m };         // vertical toggle, the person ON at the bottom
  const person = { cx: tog.x + tog.w / 2, cy: tog.y + tog.h - tog.w / 2, r: tog.w * 0.32 };
  const togArt = col => `<rect x="${tog.x}" y="${tog.y}" width="${tog.w}" height="${tog.h}" rx="${tog.w / 2}" fill="none" stroke="${col}" stroke-width="0.55"/>`;
  if (mode === 'emboss') return plate(tw, th, togArt('#000'));
  if (mode === 'foil') return plate(tw, th, `<circle cx="${person.cx}" cy="${person.cy}" r="${person.r}"/>`);
  if (mode === 'deboss' || mode === 'die') return plate(tw, th, '');
  s += bg(tw, th, ground);
  s += T(m, m + 5.2, P.name, { size: 4.1, fill: C.violet, weight: 600, ls: -0.012 });
  s += T(m, m + 9.2, P.title, { size: 1.95, fill: C.blue, ls: 0.17, caps: true, weight: 500 });
  const ry = m + 13.2; s += `<line x1="${m}" y1="${ry}" x2="${m + 7}" y2="${ry}" stroke="${C.violet}" stroke-width="0.32" stroke-linecap="round"/><circle cx="${m + 9.1}" cy="${ry}" r="0.42" fill="${C.blue}"/>`;
  [P.phone, P.email, P.web, P.city].forEach((l, i) => { const y = th - m - (3 - i) * 3.35; s += `<circle cx="${f2(m + 0.65)}" cy="${f2(y - 0.8)}" r="0.55" fill="${C.blue}"/>` + T(m + 2.8, y, l, { size: 2.3, fill: C.ink }); });
  s += mk(tw - m - 6.4 - 4 - 13, m + 0.6, 13, { color: C.violet, dot: C.blue });
  if (mode === 'fx') { const id = uid('fo'); s += `<defs>${foilDefs(id)}</defs>` + relief(togArt, ground, 'emboss', { depth: 0.22, shadow: 0.28, light: 0.5 }) + foilDot(person.cx, person.cy, person.r, id); }
  else s += `<circle cx="${person.cx}" cy="${person.cy}" r="${person.r}" fill="${C.blue}"/>`;   // ink proof shows foil position in blue
  return s;
}

// ---------------------------------------------------------------- MONOLITH: violet board, blind-debossed PhE, foil dots
export function monolith(side, tw, th, mode = 'fx') {
  if (side === 'front') return nameSide(tw, th, mode);
  const mw = tw - 10, mx = 5, my = (th - markH(mw)) / 2 - 2.2; let s = '';
  if (mode === 'deboss') return plate(tw, th, strokesOnly(mx, my, mw, '#000'));
  if (mode === 'foil') return plate(tw, th, dotsOnly(mx, my, mw, '#000'));
  if (mode === 'emboss' || mode === 'die') return plate(tw, th, '');
  s += bg(tw, th, C.violet);
  if (mode === 'fx') { const id = uid('fo'); s += `<defs>${foilDefs(id)}</defs>` + relief(col => strokesOnly(mx, my, mw, col), C.violet, 'deboss', { face: '#260B65', depth: 0.34, shadow: 0.55, light: 0.16 }) + foilDots(mx, my, mw, id); }
  else s += dotsOnly(mx, my, mw, C.blue);   // blind deboss carries no ink; foil shown in blue on the proof
  s += T(mx + 0.6, th - 4.6, 'PURPLEHAT EVENTS', { size: 1.75, fill: C.v200, ls: 0.3, weight: 500 });
  s += T(tw - mx - 0.6, th - 4.6, 'HYDERABAD · INDIA', { size: 1.75, fill: C.v400, ls: 0.3, weight: 500, anchor: 'end' });
  return s;
}

// ---------------------------------------------------------------- WINDOW: warm white board, letterpress PhE, capsule window onto the blue core
export function windowCard(side, tw, th, mode = 'fx') {
  if (side === 'front') return nameSide(tw, th, mode, { ground: '#FFFFFF' });
  const mw = tw * 0.62, mx = 6, my = 7.2, win = { w: 30, h: 11.6 }; win.x = tw - 6 - win.w; win.y = th - 6.4 - win.h;
  const winShape = col => `<rect x="${win.x}" y="${win.y}" width="${win.w}" height="${win.h}" rx="${win.h / 2}" fill="${col}"/>`;
  let s = '';
  if (mode === 'die') return plate(tw, th, winShape('#000'));
  if (mode === 'deboss') return plate(tw, th, strokesOnly(mx, my, mw, '#000'));   // letterpress impression
  if (mode === 'foil' || mode === 'emboss') return plate(tw, th, '');
  s += bg(tw, th, C.warm);
  s += mk(mx, my, mw, { color: C.violet, dot: C.blue });
  s += T(mx + 0.4, th - 6.4 - 0.2, 'PurpleHat Events', { size: 2.6, fill: C.violet, weight: 500 });
  s += T(mx + 0.4, th - 6.4 + 3.2, 'Events for a more connected tomorrow.', { size: 1.9, fill: C.g500 });
  // the window: Electric Blue core seen through the cut, the person switched ON (printed on the core)
  const kx = win.x + win.w - win.h / 2, ky = win.y + win.h / 2;
  if (mode === 'fx') {
    const id = uid('wn');
    s += `<defs><clipPath id="${id}"><rect x="${win.x}" y="${win.y}" width="${win.w}" height="${win.h}" rx="${win.h / 2}"/></clipPath></defs>`;
    s += `<g clip-path="url(#${id})"><rect x="${win.x}" y="${win.y}" width="${win.w}" height="${win.h}" fill="${C.blue}"/>`;
    s += `<rect x="${win.x - 1}" y="${win.y - 1}" width="${win.w + 2}" height="${win.h + 2}" rx="${win.h / 2 + 1}" fill="none" stroke="#000" stroke-opacity=".38" stroke-width="1.6" transform="translate(.35 .5)" style="filter:blur(.35px)"/>`;
    s += `<circle cx="${kx}" cy="${ky}" r="${win.h * 0.33}" fill="#FFFFFF"/><circle cx="${kx + 0.25}" cy="${ky + 0.45}" r="${win.h * 0.33}" fill="none" stroke="#000" stroke-opacity=".12" stroke-width=".4"/></g>`;
    s += `<rect x="${win.x}" y="${win.y}" width="${win.w}" height="${win.h}" rx="${win.h / 2}" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width=".22" transform="translate(-.08 -.1)"/>`;
  } else s += winShape(C.blue) + `<circle cx="${kx}" cy="${ky}" r="${win.h * 0.33}" fill="#FFFFFF"/>`;
  return s;
}

export const SIGNATURE = {
  M: { name: 'Monolith', fn: monolith, desc: 'Violet board · blind-debossed PhE · Electric Blue foil dots · blue painted edge',
       plates: { back: ['ink', 'deboss', 'foil'], front: ['ink', 'emboss', 'foil'] } },
  W: { name: 'Window', fn: windowCard, desc: 'Warm white triplex · letterpress PhE · capsule die-cut window onto an Electric Blue core',
       plates: { back: ['ink', 'deboss', 'die'], front: ['ink', 'emboss', 'foil'] } },
};
