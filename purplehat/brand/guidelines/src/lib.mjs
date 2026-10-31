// Shared brand primitives for the PurpleHat Events guidelines + stationery.
// Everything is drawn from ../logo-geom.js (centre lines, stroke 24, dot r 12.75).
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
// GUIDE_OUT=<dir> writes a variant (e.g. an accent study) somewhere else; default is brand/guidelines
export const ROOT = process.env.GUIDE_OUT ? path.resolve(process.env.GUIDE_OUT) : path.resolve(HERE, '..');
export const BRAND = path.resolve(HERE, '..', '..');   // brand
export const G = (await import(pathToFileURL(path.join(BRAND, 'logo-geom.js')).href + '?t=' + Date.now())).default;

export const W = G.width, H = G.height, SW = G.w, RD = G.rd;
export const STROKES = G.parts.filter(p => p.kind === 'stroke');
export const DOTS = G.parts.filter(p => p.kind === 'dot');
export const dot = id => DOTS.find(d => d.id === id);

// ---------------------------------------------------------------- colour
// ACCENT='{"hex":"#FFC72C","name":"Sunburst Yellow","cmyk":"C0 M19 Y89 K0","pms":"Pantone 123 C"}' swaps the accent
export const ACCENT = { hex: '#2563EB', name: 'Electric Blue', cmyk: 'C82 M58 Y0 K0', pms: 'Pantone 2727 C', ...(process.env.ACCENT ? JSON.parse(process.env.ACCENT) : {}) };
export const C = {
  violet: '#2A0D6E', blue: '#2563EB', warm: '#F4F1EB', ink: '#1A1033', white: '#FFFFFF',
  v950: '#16063F', v800: '#3A1A8C', v600: '#5537B5', v400: '#8B76D6', v200: '#C9BFEE', v100: '#E7E2F7',
  b800: '#1A45B8', b400: '#5B8DF2', b200: '#B9CEFA', b100: '#DFE8FD',
  paper: '#FBFAF7', sand: '#E8E2D7', stone: '#CFC8BB',
  g700: '#45414F', g500: '#6E6A7A', g400: '#9A96A6', g300: '#C6C2CE', g200: '#E2DFE6',
  warn: '#D6455D',
};
if (ACCENT.hex !== C.blue) {
  const mixh = (a, b, t) => '#' + hexRgb(a).map((v, i) => Math.round(v + (hexRgb(b)[i] - v) * t).toString(16).padStart(2, '0')).join('').toUpperCase();
  Object.assign(C, { blue: ACCENT.hex, b800: mixh(ACCENT.hex, '#000000', 0.32), b400: mixh(ACCENT.hex, '#FFFFFF', 0.3), b200: mixh(ACCENT.hex, '#FFFFFF', 0.62), b100: mixh(ACCENT.hex, '#FFFFFF', 0.82) });
}
export const FONT = `'Satoshi','DM Sans',system-ui,sans-serif`;

export function hexRgb(h) { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
function lum(h) { return hexRgb(h).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }).reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0); }
export function contrast(a, b) { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); }

// ---------------------------------------------------------------- utils
export function rng(seed = 1) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
let UID = 0; export const uid = p => `${p}${++UID}`;
export const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
export const f2 = n => (+n).toFixed(2).replace(/\.?0+$/, '');

/** SVG text helper (units = the parent viewBox units). */
export function T(x, y, str, o = {}) {
  const { size = 10, weight = 400, fill = C.ink, ls = 0, anchor = 'start', caps = false, opacity, rotate, cls = '', style = '' } = o;
  const tr = rotate ? ` transform="rotate(${rotate} ${f2(x)} ${f2(y)})"` : '';
  return `<text x="${f2(x)}" y="${f2(y)}" font-size="${f2(size)}" font-weight="${weight}" fill="${fill}" letter-spacing="${f2(ls * size)}" text-anchor="${anchor}"${opacity != null ? ` opacity="${opacity}"` : ''}${tr} class="t ${cls}" style="${caps ? 'text-transform:uppercase;' : ''}${style}">${esc(str)}</text>`;
}

// ---------------------------------------------------------------- logo
/**
 * Inner SVG of the PhE mark in logo units (0..W, 0..H).
 * opts: color, dot (dot colour), eFull (pre-revision E: full bar, no E dot), outline (stroke-only misuse),
 *       hideDots, only (array of part ids), sw (override stroke), dotScale, dotDy {id:dy}
 */
export function markInner(o = {}) {
  const { color = C.violet, dot: dc = null, eFull = false, outline = false, hideDots = false, only = null, sw = SW, dotScale = 1, dotDy = {}, dotFill = null, partColors = {} } = o;
  const dcol = dc || color;
  if (outline) return `<path d="${G.outline}" fill="none" stroke="${color}" stroke-width="${o.outlineW || 3}" stroke-linejoin="round"/>`;
  let s = `<g fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">`;
  for (const p of STROKES) {
    if (only && !only.includes(p.id)) continue;
    let d = p.line;
    if (eFull && p.id === 'E-bowl') { const e = dot('dot-E'); d = d.replace(/L[\d.]+ [\d.]+$/, `L${e.cx} ${e.cy}`); }
    s += `<path d="${d}"${partColors[p.id] ? ` stroke="${partColors[p.id]}"` : ''}/>`;
  }
  s += '</g>';
  if (!hideDots) {
    s += `<g fill="${dotFill || dcol}">`;
    for (const d of DOTS) {
      if (only && !only.includes(d.id)) continue;
      if (eFull && d.id === 'dot-E') continue;
      s += `<circle cx="${d.cx}" cy="${d.cy + (dotDy[d.id] || 0)}" r="${f2(d.r * dotScale)}"${partColors[d.id] ? ` fill="${partColors[d.id]}"` : ''}/>`;
    }
    s += '</g>';
  }
  return s;
}
/** Mark as a <g> placed at x,y with a given width (in parent units). */
export function markG(x, y, width, o = {}) { const k = width / W; return `<g transform="translate(${f2(x)} ${f2(y)}) scale(${k.toFixed(5)})">${markInner(o)}</g>`; }
export const markH = width => width * H / W;

/** Standalone inline <svg> of the mark. width is a CSS length string or px number. */
export function mark(o = {}) {
  const { width = 200, cls = '', style = '' } = o;
  const [n, u] = typeof width === 'number' ? [width, 'px'] : [parseFloat(width), width.replace(/[\d.]+/, '')];
  return `<svg class="mk ${cls}" viewBox="0 0 ${W} ${H}" style="width:${n}${u};height:${f2(n * H / W)}${u};overflow:visible;${style}">${markInner(o)}</svg>`;
}

// Lockup geometry mirrors gen_logo.py so these match ../svg/phe-lockup-*.svg
const WS = H * 0.30, WS2 = H * 0.36, WS3 = H * 0.34;
export const LOCK = {
  primary: { w: W, h: H + WS * 1.25 + WS * 0.32 },
  horizontal: { w: 960.98, h: H },
  stacked: { w: W + 2, h: H + WS3 * 2.9 },
};
export function lockupInner(kind = 'primary', o = {}) {
  const { color = C.violet, word = color } = o;
  const wm = (x, y, s, str = 'PurpleHat Events') => `<text x="${f2(x)}" y="${f2(y)}" font-size="${f2(s)}" font-weight="500" letter-spacing="${f2(-0.01 * s)}" fill="${word}" class="t wm">${str}</text>`;
  if (kind === 'primary') return markInner(o) + wm(2, H + WS * 1.25, WS);
  if (kind === 'horizontal') {
    const x2 = W + H * 0.32;
    return markInner(o) + `<rect x="${f2(W + H * 0.16 - 1)}" y="${f2(H * 0.12)}" width="2" height="${f2(H * 0.76)}" fill="${word}" opacity=".25"/>` + wm(x2, H * 0.5 + WS2 * 0.36, WS2);
  }
  if (kind === 'stacked') return markInner(o) + wm(2, H + WS3 * 1.3, WS3, 'PurpleHat') + wm(2, H + WS3 * 2.5, WS3, 'Events');
  throw new Error(kind);
}
export function lockupG(kind, x, y, width, o = {}) { const k = width / LOCK[kind].w; return `<g transform="translate(${f2(x)} ${f2(y)}) scale(${k.toFixed(5)})">${lockupInner(kind, o)}</g>`; }
export function lockup(kind, o = {}) {
  const { width = 300, cls = '', style = '' } = o; const L = LOCK[kind];
  const [n, u] = typeof width === 'number' ? [width, 'px'] : [parseFloat(width), width.replace(/[\d.]+/, '')];
  return `<svg class="mk ${cls}" viewBox="0 0 ${f2(L.w)} ${f2(L.h)}" style="width:${n}${u};height:${f2(n * L.h / L.w)}${u};overflow:visible;${style}">${lockupInner(kind, o)}</svg>`;
}
/** Pill lockup (board 04): wordmark in a pill + a circle. Returns inner, size w x h in its own units. */
export function pillLockupInner(o = {}) {
  const { color = C.violet, word = color, sw = 3.2 } = o; const s = 40, ph = s * 2.4, tw = 318, pw = tw + ph * 1.1;
  return {
    w: pw + ph * 1.25 + sw * 2, h: ph + sw * 2,
    svg: `<rect x="${sw}" y="${sw}" width="${f2(pw)}" height="${ph}" rx="${ph / 2}" fill="none" stroke="${color}" stroke-width="${sw}"/>` +
      `<circle cx="${f2(pw + sw + ph * 0.75)}" cy="${f2(ph / 2 + sw)}" r="${ph / 2}" fill="none" stroke="${color}" stroke-width="${sw}"/>` +
      `<text x="${f2(sw + pw / 2)}" y="${f2(sw + ph / 2 + s * 0.36)}" font-size="${s}" font-weight="500" text-anchor="middle" letter-spacing="-0.4" fill="${word}" class="t wm">PurpleHat Events</text>`,
  };
}
export function pillLockup(o = {}) { const p = pillLockupInner(o); const { width = 300, style = '' } = o; return `<svg class="mk" viewBox="0 0 ${f2(p.w)} ${f2(p.h)}" style="width:${width}px;height:${f2(width * p.h / p.w)}px;overflow:visible;${style}">${p.svg}</svg>`; }

/** App icon: rounded square + mark. */
export function appIconInner(size = 512, o = {}) { const { bg = C.violet, fg = C.warm, dot: d = null, r = 0.22 } = o; const mw = size * 0.72; return `<rect width="${size}" height="${size}" rx="${size * r}" fill="${bg}"/>` + markG((size - mw) / 2, (size - markH(mw)) / 2, mw, { color: fg, dot: d }); }

// ---------------------------------------------------------------- arc helpers for construction drawings
/** centre of an SVG arc (endpoint parametrisation, rx=ry) */
export function arcCentre(x1, y1, x2, y2, r, large, sweep) {
  const dx = (x1 - x2) / 2, dy = (y1 - y2) / 2; const d2 = dx * dx + dy * dy;
  let k = Math.sqrt(Math.max(0, (r * r - d2) / d2)); if (large === sweep) k = -k;
  const cxp = k * dy, cyp = -k * dx; return [cxp + (x1 + x2) / 2, cyp + (y1 + y2) / 2];
}
export function arcsOf(line) {
  const out = []; const re = /([ML])([\d.]+) ([\d.]+)|A([\d.]+) ([\d.]+) [\d.]+ (\d) (\d) ([\d.]+) ([\d.]+)/g; let m, cx = 0, cy = 0;
  while ((m = re.exec(line))) {
    if (m[1]) { cx = +m[2]; cy = +m[3]; continue; }
    const r = +m[4], large = +m[6], sweep = +m[7], x = +m[8], y = +m[9];
    const [ox, oy] = arcCentre(cx, cy, x, y, r, large, sweep); out.push({ cx: ox, cy: oy, r }); cx = x; cy = y;
  }
  return out;
}

// ---------------------------------------------------------------- pattern system
/** pills + circles, outline. Returns SVG inner for a w x h box. */
export function pattern(w, h, o = {}) {
  const { mode = 'grid', u = 40, color = C.blue, sw = 2.4, seed = 7, fill = 'none', accent = null, gap = null } = o;
  const R = rng(seed); const g = gap ?? u * 0.32; let s = `<g fill="${fill}" stroke="${color}" stroke-width="${sw}">`;
  const pill = (x, y, pw, ph) => `<rect x="${f2(x)}" y="${f2(y)}" width="${f2(pw)}" height="${f2(ph)}" rx="${f2(Math.min(pw, ph) / 2)}"/>`;
  const circ = (x, y, d) => `<circle cx="${f2(x + d / 2)}" cy="${f2(y + d / 2)}" r="${f2(d / 2)}"/>`;
  if (mode === 'grid') {               // board panel 1: alternating pill + circle rows
    for (let row = 0, y = -u * 0.4; y < h + u; row++, y += u + g) {
      let x = row % 2 ? -u * 0.55 : -u * 1.2;
      for (let i = 0; x < w + u; i++) {
        const isPill = (i + row) % 2 === 0; const pw = isPill ? u * 2.2 : u;
        s += isPill ? pill(x, y, pw, u) : circ(x, y, u); x += pw + g;
      }
    }
  } else if (mode === 'mix') {         // board panel 3: varying pill lengths
    for (let row = 0, y = -u * 0.3; y < h + u; row++, y += u + g) {
      let x = -u * (0.3 + R() * 1.2);
      while (x < w + u) {
        const r = R(); const pw = r < 0.32 ? u : u * (1.8 + Math.round(R() * 3) * 0.5);
        s += pw === u ? circ(x, y, u) : pill(x, y, pw, u); x += pw + g;
      }
    }
  } else if (mode === 'big') {         // board panel 2: big circle over tall pill, cropped halves at the edges
    const d = Math.min(w * 0.72, h * 0.36); const cx = w * 0.58;
    s += `<circle cx="${f2(cx)}" cy="${f2(h * 0.2)}" r="${f2(d / 2)}"/>`;
    s += pill(cx - d * 0.42, h * 0.2 + d / 2 + g * 1.2, d * 0.84, h * 0.62);
    s += `<circle cx="${f2(-d * 0.18)}" cy="${f2(h * 0.62)}" r="${f2(d * 0.42)}"/>` + pill(-d * 0.55, h * 0.84, d * 0.7, d * 1.4);
  } else if (mode === 'toggle') {      // pills containing a circle: on / off states
    for (let row = 0, y = u * 0.2; y < h + u; row++, y += u + g) {
      let x = row % 2 ? -u : -u * 0.2;
      while (x < w + u) {
        const pw = u * 2.1; const on = R() < 0.5; s += pill(x, y, pw, u);
        const ins = u * 0.16; const dd = u - ins * 2; const cx = on ? x + pw - ins - dd : x + ins;
        s += `<circle cx="${f2(cx + dd / 2)}" cy="${f2(y + u / 2)}" r="${f2(dd / 2)}" ${on && accent ? `fill="${accent}" stroke="${accent}"` : ''}/>`;
        x += pw + g;
      }
    }
  } else if (mode === 'dots') {        // dot field: the three-dot rhythm repeated
    s = `<g fill="${color}">`; const step = u;
    for (let y = step / 2; y < h; y += step) for (let x = step / 2; x < w; x += step) {
      const k = R(); const r = k < 0.08 ? step * 0.26 : step * 0.12; s += `<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(r)}"${k < 0.08 && accent ? ` fill="${accent}"` : ''}/>`;
    }
  }
  const cid = uid('pc'); return `<defs><clipPath id="${cid}"><rect width="${f2(w)}" height="${f2(h)}"/></clipPath></defs><g clip-path="url(#${cid})">${s}</g></g>`;
}

// ---------------------------------------------------------------- photo placeholder (drawn, not stock)
/** Abstract purple-graded event scene: light beams, stage glow, crowd built from circles + pills. */
export function photo(w, h, o = {}) {
  // Flat-colour event scene used as a photography placeholder (no gradients): a stage with an LED screen showing the
  // capsule, flat light beams, the crowd in three flat tones. Replace with real photography.
  const { seed = 3, label = 'Photo placeholder', crowd = true, beams = true, tone = 'night', rows = 3, focus = 0.5, lx = 0.03, ly = 0.03 } = o;
  const R = rng(seed); const id = uid('ph');
  const DAY = ['#D9D2C5', '#C9C1B2', ['#A79F92', '#8E877B', '#6F695F']], TONES = { night: ['#24222A', '#2F2C35', ['#3A3741', '#2A2830', '#1B1A1F']], day: DAY, warm: DAY };
  const [bgc, stage, CROWD] = TONES[tone] || TONES.night, night = !(tone === 'day' || tone === 'warm');
  let s = `<defs><clipPath id="${id}c"><rect width="${w}" height="${h}"/></clipPath></defs><g clip-path="url(#${id}c)">
  <rect width="${w}" height="${h}" fill="${bgc}"/><rect y="${f2(h * 0.6)}" width="${w}" height="${f2(h * 0.4)}" fill="${stage}"/>`;
  // LED screen with the capsule switched on
  const sw = w * 0.42, sh = sw * 0.42, sx = w * focus - sw / 2, sy = h * 0.2;
  s += `<rect x="${f2(sx)}" y="${f2(sy)}" width="${f2(sw)}" height="${f2(sh)}" rx="${f2(sh * 0.06)}" fill="${night ? '#F4F1EB' : '#FFFFFF'}"/>`;
  const ph = sh * 0.42, pw = sw * 0.56, px = sx + (sw - pw) / 2, py = sy + (sh - ph) / 2;
  s += `<rect x="${f2(px)}" y="${f2(py)}" width="${f2(pw)}" height="${f2(ph)}" rx="${f2(ph / 2)}" fill="${C.blue}"/><circle cx="${f2(px + pw - ph / 2)}" cy="${f2(py + ph / 2)}" r="${f2(ph * 0.34)}" fill="#FFFFFF"/>`;
  if (beams) {
    const n = 6; for (let i = 0; i < n; i++) {
      const bx = w * (0.08 + 0.84 * i / (n - 1)) + (R() - 0.5) * w * 0.05, spread = w * (0.05 + R() * 0.05), ex = w * focus + (bx - w * focus) * 0.35 + (R() - .5) * w * .25;
      s += `<polygon points="${f2(bx - 2)},0 ${f2(bx + 2)},0 ${f2(ex + spread)},${f2(h * 0.8)} ${f2(ex - spread)},${f2(h * 0.8)}" fill="${i % 3 === 1 ? C.blue : '#FFFFFF'}" opacity="${night ? (0.06 + R() * 0.05).toFixed(3) : (0.12 + R() * 0.06).toFixed(3)}"/>`;
    }
  }
  for (let i = 0; i < 22; i++) { const r = h * (0.004 + R() * 0.012); s += `<circle cx="${f2(R() * w)}" cy="${f2(R() * h * 0.5)}" r="${f2(r)}" fill="${R() < .35 ? C.blue : '#FFFFFF'}" opacity="${night ? (0.35 + R() * 0.4).toFixed(2) : '0.8'}"/>`; }
  if (crowd) {
    for (let r = 0; r < rows; r++) {
      const t = r / Math.max(1, rows - 1); const hr = h * (0.035 + 0.05 * t); const base = h * (0.74 + 0.2 * t); const col = CROWD[Math.min(2, Math.round(t * 2))];
      let x = -hr * (R() * 2); while (x < w + hr * 2) {
        const hy = base - hr * (0.6 + R() * 0.8);
        s += `<circle cx="${f2(x)}" cy="${f2(hy)}" r="${f2(hr)}" fill="${col}"/><rect x="${f2(x - hr * 1.9)}" y="${f2(hy + hr * 1.1)}" width="${f2(hr * 3.8)}" height="${f2(h)}" rx="${f2(hr * 1.9)}" fill="${col}"/>`;
        if (R() < 0.12) { const a = (R() - .5) * 30; s += `<rect x="${f2(x + hr * 1.1)}" y="${f2(hy - hr * 3.2)}" width="${f2(hr * 0.7)}" height="${f2(hr * 4.2)}" rx="${f2(hr * 0.35)}" fill="${col}" transform="rotate(${a.toFixed(1)} ${f2(x + hr * 1.4)} ${f2(hy + hr)})"/>`; }
        x += hr * (2.6 + R() * 1.4);
      }
    }
  }
  s += '</g>';
  const fs = Math.min(h * 0.024, w * 0.03), lc = night ? '#FFFFFF' : C.ink;
  if (label) s += `<g opacity=".8"><rect x="${f2(w * lx)}" y="${f2(h * ly)}" width="${f2(label.length * fs * 0.62 + fs * 2.4)}" height="${f2(fs * 2.3)}" rx="${f2(fs * 1.15)}" fill="none" stroke="${lc}" stroke-width="${f2(fs * 0.12)}" opacity=".7"/>` +
    T(w * lx + fs * 1.2, h * ly + fs * 1.55, label, { size: fs, fill: lc, ls: 0.12, caps: true, weight: 500 }) + '</g>';
  return s;
}

// ---------------------------------------------------------------- icons (24 grid, round caps, dot accent)
export const ICONS = {
  calendar: { n: 'Event Management', d: '<rect x="3" y="5" width="18" height="16" rx="3.5"/><path d="M3 10h18M8 3v4M16 3v4"/>', dots: [[12, 15.5]] },
  conference: { n: 'Conferences & PCO', d: '<rect x="9" y="2.5" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5v1.5"/>', dots: [[12, 21.5]] },
  globe: { n: 'MICE & travel', d: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="3.8" ry="9"/><path d="M3.5 9h17M3.5 15h17"/>', dots: [[19.2, 4.8]] },
  people: { n: 'Corporate Events', d: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.2a5 5 0 0 1 5.5 5.3"/>', dots: [] },
  toggle: { n: 'Experiential Installations', d: '<rect x="2" y="7" width="20" height="10" rx="5"/>', dots: [[17, 12, 3]] },
  pen: { n: 'Branding & Design', d: '<path d="M4 20l2.4-6.6L15.5 4.3a2.4 2.4 0 0 1 3.4 0l.8.8a2.4 2.4 0 0 1 0 3.4L10.6 17.6z"/><path d="M13.5 6.3l4.2 4.2"/>', dots: [[4.6, 19.4]] },
  app: { n: 'Websites & Apps', d: '<rect x="3" y="4" width="18" height="16" rx="3.5"/><path d="M3 9h18"/>', dots: [[6.4, 6.5, 0.9], [9, 6.5, 0.9], [11.6, 6.5, 0.9]] },
  pin: { n: 'Venue / location', d: '<path d="M12 21s-6.5-5.8-6.5-11a6.5 6.5 0 0 1 13 0c0 5.2-6.5 11-6.5 11z"/>', dots: [[12, 10]] },
  ticket: { n: 'Tickets & access', d: '<path d="M3 8.5V6.8A1.8 1.8 0 0 1 4.8 5h14.4A1.8 1.8 0 0 1 21 6.8v1.7a3.5 3.5 0 0 0 0 7v1.7a1.8 1.8 0 0 1-1.8 1.8H4.8A1.8 1.8 0 0 1 3 17.2v-1.7a3.5 3.5 0 0 0 0-7z"/><path d="M14 7.5v1.2M14 11.4v1.2M14 15.3v1.2"/>', dots: [] },
  idea: { n: 'Ideas', d: '<path d="M9 17.5h6M9.8 20.5h4.4M12 3a6 6 0 0 0-3.6 10.8c.5.4.8 1 .8 1.6V15.5h5.6v-.1c0-.6.3-1.2.8-1.6A6 6 0 0 0 12 3z"/>', dots: [[12, 9.2]] },
  chat: { n: 'Talk to us', d: '<path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 3.5V17A2.5 2.5 0 0 1 4 14.5z"/>', dots: [[8.5, 10.5, 1.1], [12, 10.5, 1.1], [15.5, 10.5, 1.1]] },
  camera: { n: 'Content & coverage', d: '<rect x="3" y="7" width="18" height="13" rx="3.5"/><circle cx="12" cy="13.5" r="3.6"/><path d="M8.5 7l1.4-2.6h4.2L15.5 7"/>', dots: [[17.6, 10.2]] },
};
export function icon(name, o = {}) {
  const { size = 48, color = C.violet, dot: dc = C.blue, sw = 1.75 } = o; const I = ICONS[name];
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${I.d}${I.dots.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r || 1.55}" fill="${dc}" stroke="none"/>`).join('')}</svg>`;
}

// ---------------------------------------------------------------- shared CSS
export function baseCSS(rel = '.') {
  return `${[300, 400, 500, 600, 700, 900].map(w => `@font-face{font-family:'DM Sans';src:url('${rel}/assets/fonts/DMSans-${w}.ttf') format('truetype');font-weight:${w};font-style:normal}`).join('\n')}
:root{--violet:${C.violet};--blue:${C.blue};--warm:${C.warm};--ink:${C.ink};--font:${FONT}}
*{box-sizing:border-box}
body{margin:0;font-family:var(--font);color:var(--ink);-webkit-font-smoothing:antialiased;font-optical-sizing:auto}
.t{font-family:var(--font)}
svg text{font-family:var(--font)}`;
}
export const write = (rel, s) => { if (ACCENT.name !== 'Electric Blue') s = s.replaceAll('Electric Blue', ACCENT.name); const p = path.join(ROOT, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, s); return p; };
