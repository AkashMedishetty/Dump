import fs from 'fs';
const R = 100, RAD = Math.PI / 180;
const f = (n) => String(+n.toFixed(2));
const C_ = { brand: '#5E44E8', crown: '#F6F4EF', visor: '#D7CFFF', ink: '#17112B', vow: '#A996FF' };
function arcs(H, TIP) { const t = TIP * RAD, C = (R * R - H * H) / (2 * (R * Math.cos(t) - H)); return { t, C, r: C - H }; }
function seamWidth(H, TIP) {
  const { t, C, r } = arcs(H, TIP), a1 = Math.atan2(C - R * Math.cos(t), R * Math.sin(t));
  let m = Infinity;
  for (let i = 0; i <= 3000; i++) { const a = a1 + (Math.PI / 2 - a1) * (i / 3000); m = Math.min(m, -(r * Math.cos(a) + (-C + r * Math.sin(a))) / Math.SQRT2); }
  return 2 * m;
}
const SEAM0 = seamWidth(43, 43);
function tipFor(H, seam) { let lo = 15, hi = 44.99; for (let k = 0; k < 60; k++) { const mid = (lo + hi) / 2; if (seamWidth(H, mid) > seam) lo = mid; else hi = mid; } return lo; }
const rot = ([x, y], q) => [[x, y], [-y, x], [-x, -y], [y, -x]][q];
function geo(H = 40, seam = SEAM0) {
  const TIP = H === 43 && seam === SEAM0 ? 43 : tipFor(H, seam);
  const { t, C, r } = arcs(H, TIP);
  const L = [-R * Math.sin(t), -R * Math.cos(t)], Rr = [R * Math.sin(t), -R * Math.cos(t)];
  const paths = [0, 1, 2, 3].map((q) => { const a = rot(L, q), b = rot(Rr, q); return `M${f(a[0])} ${f(a[1])}A100 100 0 0 1 ${f(b[0])} ${f(b[1])}A${f(r)} ${f(r)} 0 0 1 ${f(a[0])} ${f(a[1])}Z`; });
  return { H, TIP, C, r, seam, paths };
}
const core = geo(40);
const out = {};
const svg = (vb, inner, label, w = 220) => { const [x, y, ww, hh] = vb; return `<svg aria-label="${label}" viewBox="${x} ${y} ${ww} ${hh}" width="${ww}" height="${hh}" style="width:${w}px;height:${f(w * hh / ww)}px">${inner}</svg>`; };
const VB = [-110, -110, 220, 220];
const fill4 = (g, crown, visor) => g.paths.map((d, q) => `<path d="${d}" fill="${q === 1 ? visor : crown}"/>`).join('');

// Custom geometric letters (stroked), cap height h, stroke w, origin top-left
function letters(x, y, h, w, color, gap) {
  const r = h * 0.29;               // P bowl radius
  const pw = r + w * 0.5 + h * 0.06;  // P bowl width
  const P = `M${f(x + w / 2)} ${f(y + h)}V${f(y + w / 2)}H${f(x + pw - r)}A${f(r - w / 2 + w / 2)} ${f(r)} 0 0 1 ${f(x + pw - r)} ${f(y + w / 2 + 2 * r)}H${f(x + w / 2)}`;
  const x2 = x + pw + r * 0 + gap + w / 2;
  const hw = h * 0.62;
  const Hh = `M${f(x2)} ${f(y)}V${f(y + h)}M${f(x2 + hw)} ${f(y)}V${f(y + h)}M${f(x2)} ${f(y + h / 2)}H${f(x2 + hw)}`;
  const x3 = x2 + hw + gap;
  const ew = h * 0.5;
  const E = `M${f(x3 + ew)} ${f(y + w / 2)}H${f(x3 + w / 2)}V${f(y + h - w / 2)}H${f(x3 + ew)}M${f(x3 + w / 2)} ${f(y + h / 2)}H${f(x3 + ew * 0.88)}`;
  const width = x3 + ew - x;
  return { d: P + Hh + E, width, P, H: Hh, E, x2, x3, hw, ew, pw };
}
const strokeP = (d, color, w) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linejoin="miter" stroke-linecap="butt"/>`;

// 01 Original, 02 Core, 03 Fuller, 04 Button, 05 Fine, 06 Bold
const g43 = geo(43), g37 = geo(37), gFine = geo(40, 4.2), gBold = geo(40, 11);
out.m01 = svg(VB, fill4(g43, C_.crown, C_.visor), 'Original');
out.m02 = svg(VB, fill4(core, C_.crown, C_.visor), 'Core');
out.m03 = svg(VB, fill4(g37, C_.crown, C_.visor), 'Fuller');
out.m04 = svg(VB, fill4(core, C_.crown, C_.visor) + `<circle cx="0" cy="0" r="11" fill="${C_.crown}"/>`, 'Button');
out.m05 = svg(VB, fill4(gFine, C_.crown, C_.visor), 'Fine seam');
out.m06 = svg(VB, fill4(gBold, C_.crown, C_.visor), 'Bold seam');
// 07 Neon outline
out.m07 = svg(VB, core.paths.map((d, q) => `<path d="${d}" fill="none" stroke="${q === 1 ? C_.visor : C_.crown}" stroke-width="5" stroke-linejoin="round"/>`).join(''), 'Neon');
// 08 Stitch: dashed stitch arcs inside each panel along the rim
function stitchRange(g, rad) { // max angle from axis where radius rad is inside the panel with 4 units margin
  const { C, r } = g; let best = 0;
  for (let a = 0; a < 45; a += 0.05) { const ca = Math.cos(a * RAD); const disc = C * C * ca * ca - (C * C - r * r); if (disc < 0) break; const sIn = C * ca - Math.sqrt(disc); if (sIn < rad - 5) best = a; else break; }
  return best;
}
const sr = 88, sa = 30;
const stitch = [0, 1, 2, 3].map((q) => { const a0 = (-90 + q * 90 - sa) * RAD, a1 = (-90 + q * 90 + sa) * RAD; return `<path d="M${f(sr * Math.cos(a0))} ${f(sr * Math.sin(a0))}A${sr} ${sr} 0 0 1 ${f(sr * Math.cos(a1))} ${f(sr * Math.sin(a1))}" fill="none" stroke="${C_.brand}" stroke-width="2.2" stroke-dasharray="5 4" stroke-linecap="round"/>`; }).join('');
out.m08 = svg(VB, fill4(core, C_.crown, C_.visor) + stitch, 'Stitch');
// 09 Blueprint
const guide = [0, 1, 2, 3].map((q) => { const [cx, cy] = rot([0, -core.C], q); return `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(core.r)}" fill="none" stroke="${C_.visor}" stroke-width="0.6" stroke-dasharray="3 3" opacity="0.7"/>`; }).join('');
out.m09 = svg(VB, `<defs><clipPath id="bp"><rect x="-110" y="-110" width="220" height="220"/></clipPath></defs><g clip-path="url(#bp)">${guide}</g><circle r="100" fill="none" stroke="${C_.visor}" stroke-width="0.6" opacity="0.8"/><path d="M-108 -108L108 108M-108 108L108 -108" stroke="${C_.visor}" stroke-width="0.6" opacity="0.6"/>` + core.paths.map((d, q) => `<path d="${d}" fill="${q === 1 ? C_.visor : C_.crown}" fill-opacity="0.92"/>`).join(''), 'Blueprint');
// 10 Tip of the hat: visor rotated about its own middle
const vis = core.paths[1], crownOnly = (g, c) => g.paths.map((d, q) => q === 1 ? '' : `<path d="${d}" fill="${c}"/>`).join('');
out.m10 = svg(VB, crownOnly(core, C_.crown) + `<path d="${vis}" fill="${C_.visor}" transform="rotate(-11 74 0)"/>`, 'Tip of the hat');
// 11 Forward
out.m11 = svg([-110, -110, 230, 220], crownOnly(core, C_.crown) + `<path d="${vis}" fill="${C_.visor}" transform="translate(12 0)"/>`, 'Forward');
// 12 Lead
out.m12 = svg(VB, crownOnly(core, '#8D78F4') + `<path d="${vis}" fill="${C_.crown}"/>`, 'Lead');
// 13 In motion: each panel turned about its own middle
const mid = (q) => rot([0, -(100 + 40) / 2], q);
out.m13 = svg(VB, core.paths.map((d, q) => { const [cx, cy] = mid(q); return `<path d="${d}" fill="${q === 1 ? C_.visor : C_.crown}" transform="rotate(9 ${f(cx)} ${f(cy)})"/>`; }).join(''), 'In motion');
// 14 Mono ink, 15 Reversed white, 16 Tonal
out.m14 = svg(VB, fill4(core, C_.ink, C_.ink), 'One colour');
out.m15 = svg(VB, fill4(core, '#FBFAF7', '#FBFAF7'), 'Reversed');
const tones = ['#CEC3FF', C_.crown, '#BCAEFF', '#A895FF'];
out.m16 = svg(VB, core.paths.map((d, q) => `<path d="${d}" fill="${tones[q]}"/>`).join(''), 'Tonal');
// Lettering
const L1 = letters(0, 0, 100, 17, C_.crown, 22);
out.phe = svg([-10, -10, f(L1.width + 20), 120], strokeP(L1.d, C_.crown, 17), 'PHE', 300);
out.pheInk = svg([-10, -10, f(L1.width + 20), 120], strokeP(L1.d, C_.brand, 17), 'PHE', 300);
// 20 PHE in centre
const Lc = letters(0, 0, 26, 5, C_.crown, 6);
out.m20 = svg(VB, fill4(core, C_.crown, C_.visor) + `<g transform="translate(${f(-Lc.width / 2)} -13)">${strokeP(Lc.d, C_.crown, 5)}</g>`, 'PHE in the centre');
// 21 P H E across: P cut from back panel, H in centre, E cut from visor
const Lp = letters(0, 0, 38, 7, '#000', 8);
const Pd = Lp.P, Hd = Lp.H, Ed = Lp.E;
const pw = Lp.pw, hw = Lp.hw, ew = Lp.ew;
const mask = `<defs><mask id="ac" maskUnits="userSpaceOnUse" x="-110" y="-110" width="220" height="220"><rect x="-110" y="-110" width="220" height="220" fill="#fff"/><g transform="translate(${f(-70 - pw / 2)} -19)">${strokeP(Pd, '#000', 7)}</g><g transform="translate(${f(70 - Lp.x3 - ew / 2)} -19)">${strokeP(Ed, '#000', 7)}</g></mask></defs>`;
out.m21 = svg(VB, mask + `<g mask="url(#ac)">${fill4(core, C_.crown, C_.visor)}</g><g transform="translate(${f(-Lp.x2 - hw / 2)} -19)">${strokeP(Hd, C_.crown, 7)}</g>`, 'P H E across the middle');
// 22 Hidden H
out.m22 = svg(VB, fill4(core, C_.crown, C_.visor) + `<rect x="-62" y="-8" width="62" height="16" fill="${C_.crown}"/><rect x="0" y="-8" width="62" height="16" fill="${C_.visor}"/>`, 'Hidden H');
// 23 App icon
out.m23 = svg([-130, -130, 260, 260], `<rect x="-128" y="-128" width="256" height="256" rx="58" fill="${C_.brand}"/>` + `<g transform="scale(0.72)">${fill4(core, C_.crown, C_.visor)}</g>`, 'App icon');
// 24 Favicon set (bold seam on purple square)
const fav = (s) => svg([-118, -118, 236, 236], `<rect x="-118" y="-118" width="236" height="236" rx="34" fill="${C_.brand}"/><g transform="scale(0.86)">${fill4(gBold, C_.crown, C_.visor)}</g>`, 'Favicon', s);
out.fav160 = fav(160); out.fav48 = fav(48); out.fav32 = fav(32); out.fav16 = fav(16);
// 25 Pattern: tiled marks with <use>
let tiles = '';
for (let row = 0; row < 4; row++) for (let col = 0; col < 7; col++) { const x = col * 230 + (row % 2) * 115, y = row * 200; tiles += `<use href="#pm" x="${x}" y="${y}"/>`; }
out.m25 = `<svg aria-label="Pattern" viewBox="0 0 1500 640" width="1500" height="640" style="width:SIZE">` + `<defs><g id="pm" transform="translate(0 0) scale(0.8)">${core.paths.map((d, q) => `<path d="${d}" fill="${q === 1 ? '#8D78F4' : '#7560EE'}"/>`).join('')}</g></defs><rect width="1500" height="640" fill="${C_.brand}"/>` + tiles + `</svg>`;
// 26 Super-graphic crop
out.m26 = `<svg aria-label="Super-graphic" viewBox="20 -100 180 200" width="180" height="200" style="width:SIZE">${fill4(core, C_.crown, C_.visor)}</svg>`;
// Don'ts helpers
out.dRot = svg(VB, `<g transform="rotate(90)">${fill4(core, C_.crown, C_.visor)}</g>`, 'Rotated');
out.dRain = svg(VB, core.paths.map((d, q) => `<path d="${d}" fill="${['#FFB547', '#FF5D72', '#3DD6A3', '#5BB8FF'][q]}"/>`).join(''), 'Recoloured');
out.dStretch = `<svg aria-label="Stretched" viewBox="-110 -110 220 220" width="220" height="220" preserveAspectRatio="none" style="width:300px;height:160px">${fill4(core, C_.crown, C_.visor)}</svg>`;
out.dLow = svg(VB, fill4(core, '#E9E4FF', '#F3F0FF'), 'Low contrast');
out.dMix = svg(VB, core.paths.map((d, q) => q % 2 ? `<path d="${d}" fill="none" stroke="${C_.crown}" stroke-width="5"/>` : `<path d="${d}" fill="${C_.crown}"/>`).join(''), 'Mixed');
out.dSplit = svg(VB, fill4(core, C_.crown, C_.visor) + `<path d="M0 -104V-58M0 58V104M-104 0H-58" stroke="${C_.brand}" stroke-width="6"/>`, 'Extra seams');
// Construction diagram (lines only + mark) for the slide
out.construct = svg([-150, -125, 300, 250], `<defs><clipPath id="cc"><rect x="-150" y="-125" width="300" height="250"/></clipPath></defs><g clip-path="url(#cc)">${[0, 1, 2, 3].map((q) => { const [cx, cy] = rot([0, -core.C], q); return `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(core.r)}" fill="none" stroke="#A39BB5" stroke-width="0.7" stroke-dasharray="3 3"/>`; }).join('')}</g><circle r="100" fill="none" stroke="#A39BB5" stroke-width="0.7"/><path d="M-118 -118L118 118M-118 118L118 -118" stroke="#A39BB5" stroke-width="0.6"/>${fill4(core, C_.brand, C_.vow)}<path d="M0 0L-70.71 70.71" stroke="#17112B" stroke-width="1"/><path d="M0 0V-40" stroke="#17112B" stroke-width="1" stroke-dasharray="2 2"/>`, 'Construction', 760);
fs.writeFileSync('marks.json', JSON.stringify(out, null, 1));
console.log('core TIP', core.TIP.toFixed(2), 'C', core.C.toFixed(2), 'r', core.r.toFixed(2), 'seam', SEAM0.toFixed(2), 'fine', gFine.TIP.toFixed(2), 'bold', gBold.TIP.toFixed(2), 'stitch angle', sa.toFixed(1));
for (const [k, v] of Object.entries(out)) console.log(k, v.length);
// Preview page
const page = `<body style="background:#efedf3;font:12px sans-serif;display:flex;flex-wrap:wrap;gap:10px;padding:10px">` + Object.entries(out).map(([k, v]) => `<div style="background:${['m14', 'dLow'].includes(k) ? '#fff' : k === 'm15' ? '#17112B' : k === 'construct' ? '#fff' : '#5E44E8'};padding:10px;color:#fff"><div>${k}</div>${v.replace(/style="width:SIZE"/, 'style="width:300px"').replace(/style="width:[\d.]+px;height:[\d.]+px"/, 'style="width:220px"')}</div>`).join('') + '</body>';
fs.writeFileSync('preview.html', page);
