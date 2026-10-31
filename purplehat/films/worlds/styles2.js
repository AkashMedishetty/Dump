// Act 2 — print, pop and play. The rush: one second each, every world arriving on the beat.
import * as K from './kit.js';
const { clamp, lerp, seg, ss, eio, eo, ei, back, mulberry, hash, TAU, rgb, hex, mix, fbm } = K;

const halftone = (key, ink, step, size = 512) => K.tex('ht:' + key, size, size, (q, w) => { q.fillStyle = ink; for (let y = 0; y < w; y += step) for (let x = (y / step) % 2 ? step / 2 : 0; x < w; x += step) { K.circle(q, x, y, step * .32); q.fill(); } });
const papr = (W, H, c, seed) => K.paper('p' + seed, 960, 540, c, { mottle: 12, grain: 12, fibres: 900, seed });

// 13 SPY TITLES — four flat inks, credits as architecture, a silhouette running through them
export function spyTitles(g, t, { W, H, M, S }) {
  g.fillStyle = '#efe4c9'; g.fillRect(0, 0, W, H);
  const bars = [[-.6, '#1b1714', .12], [-.2, '#d2401f', .06], [.35, '#1b1714', .09], [.8, '#e2a52a', .05]];
  bars.forEach(([o, c, w], i) => { const x = M.x + (o + (t - .5) * (i % 2 ? -.5 : .5)) * W * .5; g.fillStyle = c; g.save(); g.translate(x, M.y); g.rotate(-.32); g.fillRect(-W * w / 2, -H * 1.2, W * w, H * 2.4); g.restore(); });
  // the mark as torn black card, accent lens in red
  K.fillMark(g, M, '#1b1714', '#d2401f'); K.strokeMark(g, M, '#efe4c9', 6 * S);
  // silhouette mid-stride crossing the frame (lateral track)
  const x = lerp(-W * .1, W * 1.1, (t + .2) / 1.4), y = M.y + M.R * 1.05, st = Math.sin(t * 22);
  g.save(); g.translate(x, y); g.scale(S * 1.3, S * 1.3); g.fillStyle = '#1b1714';
  K.circle(g, 0, -150, 16); g.fill(); g.beginPath(); g.moveTo(-14, -132); g.lineTo(16, -132); g.lineTo(22, -60); g.lineTo(-12, -60); g.fill();
  g.lineWidth = 12; g.lineCap = 'round'; g.strokeStyle = '#1b1714'; g.beginPath(); g.moveTo(4, -64); g.lineTo(4 + 30 * st, -20); g.lineTo(10 + 40 * st, 20); g.moveTo(4, -64); g.lineTo(4 - 30 * st, -20); g.lineTo(-10 - 30 * st, 18); g.stroke();
  g.beginPath(); g.moveTo(8, -124); g.lineTo(8 - 32 * st, -88); g.moveTo(8, -124); g.lineTo(8 + 34 * st, -92); g.stroke(); g.restore();
  g.fillStyle = '#efe4c9'; g.fillRect(56 * S, 70 * S, 430 * S, 150 * S); g.fillStyle = '#1b1714'; g.font = `${86 * S}px Bebas`; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; K.track(g, 'THE REVEAL', 70 * S, 196 * S, .06);
  g.font = `${22 * S}px Bebas`; g.fillStyle = '#d2401f'; K.track(g, 'A PURPLEHAT PRODUCTION', 74 * S, 110 * S, .2);
  K.grainOver(g, W, H, t, .05, 'p');
}

// 14 SILKSCREEN — a festival poster pulled one ink at a time: stepped bands, slipped registration
export function silkscreen(g, t, { W, H, M, S }) {
  const inks = ['#FBE6B4', '#F6CD98', '#EE9A73', '#9A7FA8', '#3E7079', '#1E3B4A'];
  const n = inks.length, bh = H * .62 / n;
  inks.forEach((c, i) => { const k = eo(seg(t, -.2 + i * .07, .2 + i * .07)); g.fillStyle = c; g.fillRect(0, i * bh, W * k + 2, bh + 1); });
  // sun = the mark, printed in cream, offset ink shows the slip
  const pull = eo(seg(t, .15, .45));
  g.save(); g.globalAlpha = pull; K.fillMark(g, { x: M.x + 5 * S, y: M.y + 4 * S, R: M.R }, '#EE9A73', '#9A7FA8'); K.fillMark(g, M, '#FFF6DE', '#D7CFFF'); g.restore();
  // mountains, three flat inks
  const mts = [['#3E7079', .66, .9], ['#2B5560', .74, .7], ['#1E3B4A', .84, 1.1]];
  mts.forEach(([c, b, f], i) => { const k = eo(seg(t, .25 + i * .08, .6 + i * .08)); g.fillStyle = c; g.beginPath(); g.moveTo(0, H);
    for (let x = 0; x <= W; x += 30 * S) g.lineTo(x, lerp(H * 1.1, H * b - Math.abs(Math.sin(x / W * Math.PI * (2 + i) * f + i)) * H * .16, k)); g.lineTo(W, H); g.fill(); });
  g.fillStyle = '#FBE6B4'; g.font = `${110 * S}px Bebas`; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.globalAlpha = eo(seg(t, .5, .7)); K.track(g, 'OPEN AIR', M.x, H - 44 * S, .12); g.globalAlpha = 1;
  K.grainOver(g, W, H, t, .06, 'p');
}

// 15 RISOGRAPH — a city run zine: two fluorescent inks overprinted, halftone, plates that never line up
export function risograph(g, t, { W, H, M, S }) {
  g.drawImage(papr(W, H, [244, 238, 226], 15), 0, 0, W, H);
  g.save(); g.globalCompositeOperation = 'multiply';
  const blue = '#0078BF', pink = '#FF48B0';
  // blue plate: ground + buildings; pink plate: sun (the mark) + runner; misregistered
  g.fillStyle = g.createPattern(halftone('b', blue, 7), 'repeat'); g.fillRect(0, H * .7, W, H * .3);
  for (let i = 0; i < 9; i++) { const x = i * W / 8 - 40 * S, h = (120 + hash(i) * 220) * S; g.fillStyle = blue; g.globalAlpha = .55; g.fillRect(x, H * .7 - h, W / 11, h); }
  g.globalAlpha = 1;
  K.fillMark(g, { x: M.x + 6 * S, y: M.y - 3 * S, R: M.R }, pink, pink);
  g.fillStyle = g.createPattern(halftone('p', pink, 6), 'repeat'); g.fillRect(0, 0, W, H * .35);
  K.fillMark(g, { x: M.x - 4 * S, y: M.y + 4 * S, R: M.R }, 'rgba(0,120,191,.0)', blue, { only: [3] });
  // small runner in a big world, crossing
  const x = lerp(W * .15, W * .85, t), st = Math.sin(t * 26);
  g.save(); g.translate(x, H * .7); g.scale(S, S); g.strokeStyle = pink; g.lineWidth = 9; g.lineCap = 'round';
  K.circle(g, 0, -88, 10); g.fillStyle = pink; g.fill(); g.beginPath(); g.moveTo(0, -76); g.lineTo(4, -40); g.lineTo(4 + 18 * st, -16); g.lineTo(8 + 22 * st, 0); g.moveTo(4, -40); g.lineTo(4 - 18 * st, -16); g.lineTo(-6 - 16 * st, 0);
  g.moveTo(2, -70); g.lineTo(2 + 20 * st, -52); g.moveTo(2, -70); g.lineTo(2 - 20 * st, -54); g.stroke(); g.restore();
  g.restore();
  g.fillStyle = '#0078BF'; g.globalAlpha = .9; g.font = `${70 * S}px ArchivoBlack`; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.fillText('CITY RUN', 64 * S, 120 * S);
  g.fillStyle = '#FF48B0'; g.globalCompositeOperation = 'multiply'; g.fillText('CITY RUN', 70 * S, 116 * S); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  K.grainOver(g, W, H, t, .07, 'p');
}

// 16 HALFTONE DOSSIER — the brief as a case file: heavy headline, dots as shading, a stamp that slams
export function dossier(g, t, { W, H, M, S }) {
  g.drawImage(papr(W, H, [236, 226, 200], 16), 0, 0, W, H);
  g.fillStyle = '#D9C49A'; K.rr(g, W * .06, H * .1, W * .88, H * .86, 10 * S); g.fill(); g.fillRect(W * .06, H * .06, W * .2, H * .08);
  g.drawImage(papr(W, H, [242, 234, 214], 17), W * .09, H * .14, W * .82, H * .78);
  g.save(); g.beginPath(); g.arc(M.x, M.y, M.R * 1.25, 0, TAU); g.clip(); g.fillStyle = g.createPattern(halftone('r', '#E2483C', 9), 'repeat'); g.fillRect(0, 0, W, H); g.restore();
  K.fillMark(g, { x: M.x + 5 * S, y: M.y + 5 * S, R: M.R }, '#2A3A8C', '#2A3A8C'); K.fillMark(g, M, '#1B1A22', '#F2D23A');
  K.strokeMark(g, M, '#1B1A22', 4 * S);
  g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.font = `${96 * S}px ArchivoBlack`;
  g.fillStyle = '#E2483C'; g.fillText('THE BRIEF', W * .12 + 6 * S, H * .3 + 6 * S); g.fillStyle = '#1B1A22'; g.fillText('THE BRIEF', W * .12, H * .3);
  g.font = `600 ${16 * S}px Mono`; K.track(g, 'EXHIBIT 16 · CLIENT: CONFIDENTIAL · DATE: TBC', W * .12, H * .36, .12);
  const st = seg(t, .35, .45), sc = st < 1 ? lerp(2.2, 1, ei(st)) : 1 + .04 * Math.exp(-(t - .45) * 20);
  if (t > .35) { g.save(); g.translate(M.x + M.R * 1.55, M.y + M.R * .7); g.rotate(-.18); g.scale(sc, sc); g.globalAlpha = .88;
    g.strokeStyle = '#C8282E'; g.lineWidth = 6 * S; K.rr(g, -150 * S, -44 * S, 300 * S, 88 * S, 8 * S); g.stroke(); g.fillStyle = '#C8282E'; g.font = `${54 * S}px ArchivoBlack`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('APPROVED', 0, 4 * S); g.restore(); }
}

// 17 SWISS MOTION — the conference identity: grid, one typeface, one signal colour, snaps on the beat
export function swiss(g, t, { W, H, M, S }) {
  g.fillStyle = '#F2F0EA'; g.fillRect(0, 0, W, H);
  const col = W / 12; g.strokeStyle = 'rgba(0,0,0,.06)'; g.lineWidth = 1; for (let i = 1; i < 12; i++) { g.beginPath(); g.moveTo(i * col, 0); g.lineTo(i * col, H); g.stroke(); }
  const k1 = back(seg(t, -.1, .25), 1.3), k2 = back(seg(t, .25, .55), 1.3);
  g.fillStyle = '#141414'; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.font = `700 ${190 * S}px InterTight`; g.letterSpacing = (-.05 * 190 * S) + 'px';
  g.save(); g.beginPath(); g.rect(0, 0, W, H * .3); g.clip(); g.fillText('Confer', col * .5, lerp(H * .5, H * .26, k1)); g.restore();
  g.save(); g.beginPath(); g.rect(0, H * .72, W, H); g.clip(); g.fillText('ence.', col * .5 + (V(W, H) ? 0 : col * 6), lerp(H * 1.3, H * .92, k2)); g.restore(); g.letterSpacing = '0px';
  K.fillMark(g, M, '#141414', '#E30613');
  g.font = `500 ${16 * S}px Mono`; g.fillStyle = '#141414'; K.track(g, '2026 · 3 DAYS · 1 HALL · 40 SPEAKERS', col * .5 + 4 * S, H * .66, .1);
}
const V = (W, H) => H > W;

// 18 PICTOGRAM — games day: a square-grid core graphic of discs and half-discs, a round-capped athlete
export function pictogram(g, t, { W, H, M, S }) {
  const pal = ['#0F5BA8', '#2AA772', '#F2B134', '#E8553D', '#7A4FB0'];
  g.fillStyle = '#F4F2EC'; g.fillRect(0, 0, W, H);
  const s = 90 * S, rows = Math.ceil(H / s) + 1, cols = Math.ceil(W / s) + 2;
  for (let j = 0; j < rows; j++) { const off = (j % 2 ? 1 : -1) * eo(seg(t, -.1 + j * .03, .4 + j * .03)) * s * 2;
    for (let i = -2; i < cols; i++) { const x = i * s + off, y = j * s, k = Math.floor(hash(i * 13 + j * 7) * 5), shape = Math.floor(hash(i * 3 + j * 11) * 3);
      if (Math.hypot(x + s / 2 - M.x, y + s / 2 - M.y) < M.R * 1.35) continue;
      g.fillStyle = pal[k]; if (shape === 0) { K.circle(g, x + s / 2, y + s / 2, s * .42); g.fill(); } else if (shape === 1) { g.beginPath(); g.arc(x + s / 2, y + s, s * .45, Math.PI, 0); g.fill(); } else { g.fillRect(x + s * .1, y + s * .1, s * .8, s * .8); } } }
  g.fillStyle = '#F4F2EC'; K.circle(g, M.x, M.y, M.R * 1.3); g.fill();
  K.fillMark(g, M, '#1B1B1B', '#7A4FB0');
  // athlete pictogram: round-capped bars + disc head, sprinting
  const ph = t * 8, px = M.x + M.R * 1.75, py = M.y + M.R * .2;
  g.save(); g.translate(px, py); g.scale(S, S); g.strokeStyle = '#1B1B1B'; g.lineWidth = 22; g.lineCap = 'round';
  K.circle(g, 18, -112, 20); g.fillStyle = '#1B1B1B'; g.fill(); g.beginPath(); g.moveTo(8, -78); g.lineTo(-6, -10); g.stroke();
  const a = Math.sin(ph); g.beginPath(); g.moveTo(-6, -10); g.lineTo(-6 + 40 * a, 40); g.moveTo(-6, -10); g.lineTo(-6 - 40 * a, 40); g.moveTo(6, -70); g.lineTo(6 - 44 * a, -40); g.moveTo(6, -70); g.lineTo(6 + 44 * a, -46); g.stroke(); g.restore();
  g.fillStyle = '#1B1B1B'; g.font = `800 ${64 * S}px InterTight`; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.fillText('GAMES DAY', 60 * S, H - 60 * S);
}

// 19 GAME SHOW — a brand activation: candy sunburst, a mascot hitting the beat, a judgement word
export function gameShow(g, t, { W, H, M, S }) {
  const rot = t * .6, n = 20;
  for (let i = 0; i < n; i++) { g.fillStyle = i % 2 ? '#FFB870' : '#FFA85A'; g.beginPath(); g.moveTo(M.x, M.y); g.arc(M.x, M.y, Math.hypot(W, H), rot + i / n * TAU, rot + (i + 1) / n * TAU); g.closePath(); g.fill(); }
  // button = the mark, thick ink outline
  const hit = Math.exp(-((t - .5 + 10) % .5) * 10), sq = 1 + .08 * Math.exp(-(t % .5) * 12);
  K.fillMark(g, { x: M.x, y: M.y + 10 * S, R: M.R * sq }, '#2B1B4D', '#2B1B4D'); K.fillMark(g, { ...M, R: M.R * sq }, '#FFFFFF', '#A88BFF'); K.strokeMark(g, { ...M, R: M.R * sq }, '#2B1B4D', 8 * S);
  // mascot: a round blob with big eyes, jumps on the beat
  const j = Math.abs(Math.sin(t * Math.PI * 2)), mx = M.x - M.R * 1.8, my = M.y + M.R * .9 - j * 70 * S;
  g.save(); g.translate(mx, my); g.scale(S * (1 + .1 * (1 - j)), S * (1 - .1 * (1 - j)));
  g.fillStyle = '#5ED3C4'; g.strokeStyle = '#2B1B4D'; g.lineWidth = 8; K.circle(g, 0, 0, 70); g.fill(); g.stroke();
  g.fillStyle = '#fff'; for (const ex of [-24, 24]) { K.circle(g, ex, -12, 18); g.fill(); g.stroke(); g.fillStyle = '#2B1B4D'; K.circle(g, ex + 4, -10, 8); g.fill(); g.fillStyle = '#fff'; }
  g.beginPath(); g.arc(0, 18, 22, .2, Math.PI - .2); g.stroke(); g.restore();
  if (t > .55) { const k = back(seg(t, .55, .75), 2); g.save(); g.translate(M.x + M.R * 1.5, M.y - M.R * 1.0); g.rotate(-.12); g.scale(k, k);
    g.font = `${92 * S}px Lilita`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 16 * S; g.strokeStyle = '#2B1B4D'; g.strokeText('PERFECT!', 0, 0); g.fillStyle = '#FFE24A'; g.fillText('PERFECT!', 0, 0); g.restore(); }
}

// 20 MICROGAME — one word, one second, one action: CATCH!
export function microgame(g, t, { W, H, M, S }) {
  g.fillStyle = '#2a0f5c'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 14; i++) { g.fillStyle = i % 2 ? '#34136f' : '#2a0f5c'; g.save(); g.translate(W / 2, H / 2); g.rotate(-.5); g.fillRect(-W * 2 + i * 120 * S + (t * 300 * S) % (240 * S), -H * 2, 60 * S, H * 4); g.restore(); }
  const fall = clamp(t * 1.6); const my = lerp(M.y - H * .55, M.y, eo(fall));
  K.fillMark(g, { x: M.x, y: my, R: M.R }, '#ffffff', '#ffc928', { shadow: { c: 'rgba(0,0,0,.4)', b: 0, y: 10 * S } });
  // hands closing in from the sides
  const c = eo(seg(t, .45, .7));
  for (const sx of [-1, 1]) { const x = M.x + sx * lerp(W * .55, M.R * 1.22, c); g.save(); g.translate(x, M.y); g.scale(-sx * S, S);
    g.fillStyle = '#ff2e88'; g.strokeStyle = '#120530'; g.lineWidth = 8; K.rr(g, -30, -80, 120, 160, 50); g.fill(); g.stroke(); for (let f = 0; f < 3; f++) { K.rr(g, -60, -60 + f * 42, 60, 34, 17); g.fill(); g.stroke(); } g.restore(); }
  g.font = `${150 * S}px Lilita`; g.textAlign = 'center'; g.textBaseline = 'middle'; const pop = back(seg(t, -.05, .2), 2.5);
  g.save(); g.translate(M.x, H * .14); g.scale(pop, pop); g.lineWidth = 18 * S; g.strokeStyle = '#120530'; g.strokeText('CATCH!', 0, 0); g.fillStyle = '#ffc928'; g.fillText('CATCH!', 0, 0); g.restore();
  // fuse timer
  g.fillStyle = '#1fd1d1'; g.fillRect(60 * S, H - 60 * S, (W - 120 * S) * (1 - clamp(t)), 18 * S);
}

// 21 RUBBER HOSE — a party: black-and-white ink, the mark has eyes and gloves and dances
export function rubberHose(g, t, { W, H, M, S }) {
  g.fillStyle = '#E9E2CF'; g.fillRect(0, 0, W, H);
  const tt = K.twos(t, 12), bob = Math.sin(tt * Math.PI * 4) * 14 * S, sway = Math.sin(tt * Math.PI * 2) * .08;
  // checker floor
  for (let j = 0; j < 6; j++) for (let i = -12; i < 12; i++) { if ((i + j) % 2) continue; const y0 = H * .78 + j * j * 6 * S, y1 = H * .78 + (j + 1) * (j + 1) * 6 * S, f0 = 1 + j * .35, f1 = 1 + (j + 1) * .35, w = 90 * S;
    g.fillStyle = '#1a1714'; K.poly(g, [[W / 2 + i * w * f0, y0], [W / 2 + (i + 1) * w * f0, y0], [W / 2 + (i + 1) * w * f1, y1], [W / 2 + i * w * f1, y1]]); g.fill(); }
  // arms (rubber hose) and gloves
  for (const sx of [-1, 1]) { const ax = M.x + sx * M.R * .95, ay = M.y + bob, hx = M.x + sx * M.R * 1.75, hy = M.y - M.R * (.4 + .5 * Math.abs(Math.sin(tt * 6 + sx))) + bob;
    g.strokeStyle = '#1a1714'; g.lineWidth = 16 * S; g.lineCap = 'round'; g.beginPath(); g.moveTo(ax, ay); g.quadraticCurveTo(ax + sx * 60 * S, ay + 70 * S, hx, hy); g.stroke();
    g.fillStyle = '#fff'; g.lineWidth = 6 * S; K.circle(g, hx, hy, 34 * S); g.fill(); g.stroke(); }
  g.save(); g.translate(M.x, M.y + bob); g.rotate(sway); g.translate(-M.x, -M.y);
  K.fillMark(g, M, '#1a1714', '#FFFFFF'); K.strokeMark(g, M, '#1a1714', 7 * S);
  // pie-cut eyes in the centre
  for (const ex of [-1, 1]) { g.fillStyle = '#fff'; g.beginPath(); g.ellipse(M.x + ex * 26 * S, M.y - 6 * S, 18 * S, 30 * S, 0, 0, TAU); g.fill(); g.strokeStyle = '#1a1714'; g.lineWidth = 5 * S; g.stroke();
    g.fillStyle = '#1a1714'; g.beginPath(); g.ellipse(M.x + ex * 26 * S + 4 * S, M.y, 9 * S, 16 * S, 0, 0, TAU); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.moveTo(M.x + ex * 26 * S + 4 * S, M.y); g.arc(M.x + ex * 26 * S + 4 * S, M.y, 10 * S, -1.2, -.6); g.fill(); }
  g.restore();
  // musical notes bouncing
  for (let i = 0; i < 5; i++) { const x = W * (.15 + i * .18), y = H * .2 + Math.sin(tt * 8 + i) * 20 * S; g.fillStyle = '#1a1714'; g.beginPath(); g.ellipse(x, y, 14 * S, 10 * S, -.4, 0, TAU); g.fill(); g.fillRect(x + 11 * S, y - 50 * S, 4 * S, 50 * S); }
  K.grainOver(g, W, H, t, .14, 'r'); K.vignette(g, W, H, .85, .28, '20,16,12');
}

// 22 MIDCENTURY TOON — the town hall: colour planes, an ink line printed off-register, a geometric presenter
export function midcentury(g, t, { W, H, M, S }) {
  g.fillStyle = '#E8DCC0'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#5E9C94'; g.fillRect(0, 0, W * .38, H); g.fillStyle = '#E3A33B'; g.fillRect(W * .62, H * .1, W * .3, H * .5); g.fillStyle = '#D9654A'; K.circle(g, W * .82, H * .78, 120 * S); g.fill();
  // easel holding the mark (colour plane offset from its line)
  g.strokeStyle = '#2a2420'; g.lineWidth = 5 * S; g.beginPath(); g.moveTo(M.x - M.R * .7, M.y + M.R * 1.6); g.lineTo(M.x, M.y - M.R * 1.1); g.lineTo(M.x + M.R * .7, M.y + M.R * 1.6); g.stroke();
  K.fillMark(g, { x: M.x + 8 * S, y: M.y + 6 * S, R: M.R }, '#F5EFE0', '#8C78C8'); K.strokeMark(g, M, '#2a2420', 3 * S);
  // presenter: trapezoid body, oval head, a pointing arm that does all the work
  const px = M.x - M.R * 1.9, py = M.y + M.R * 1.3, p = eo(seg(t, .1, .4));
  g.fillStyle = '#2E4A7A'; K.poly(g, [[px - 50 * S, py], [px + 50 * S, py], [px + 28 * S, py - 170 * S], [px - 28 * S, py - 170 * S]]); g.fill();
  g.fillStyle = '#F0C8A0'; g.beginPath(); g.ellipse(px, py - 205 * S, 28 * S, 36 * S, 0, 0, TAU); g.fill(); g.strokeStyle = '#2a2420'; g.lineWidth = 3 * S; g.stroke();
  g.lineWidth = 8 * S; g.beginPath(); g.moveTo(px + 20 * S, py - 150 * S); g.lineTo(px + lerp(40, 150, p) * S, py - lerp(120, 210, p) * S); g.stroke();
  g.fillStyle = '#2a2420'; g.font = `600 ${28 * S}px IMFellItalic`; g.textAlign = 'left'; g.fillText('No. 22 — How a town hall runs itself.', 60 * S, H - 60 * S);
}

// 23 SCI-FI TOON — a portal party: boiling thick outlines, flat colour, a glowing green portal inside the mark
export function scifiToon(g, t, { W, H, M, S }) {
  const tt = K.twos(t, 8), boil = (s) => (hash(Math.floor(tt * 8) * 7 + s) - .5) * 4 * S;
  g.fillStyle = '#1B1035'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 60; i++) { g.fillStyle = '#fff'; K.circle(g, hash(i) * W, hash(i + 9) * H * .7, (hash(i + 3) * 2 + .5) * S); g.fill(); }
  g.fillStyle = '#3B2A6B'; g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= W; x += 40 * S) g.lineTo(x, H * .8 + Math.sin(x * .01) * 20 * S); g.lineTo(W, H); g.fill();
  // portal: swirling green rings inside the ring
  g.save(); K.circle(g, M.x, M.y, M.R * 1.02); g.clip();
  for (let i = 0; i < 14; i++) { const r = M.R * (1 - i / 14), a = t * 6 + i * .5; g.fillStyle = i % 2 ? '#3EE07A' : '#B6FF6A'; g.beginPath(); g.ellipse(M.x + Math.cos(a) * 6 * S, M.y + Math.sin(a) * 6 * S, r, r * .96, a, 0, TAU); g.fill(); }
  g.restore();
  g.save(); g.shadowColor = '#7BFF7A'; g.shadowBlur = 50 * S; K.fillMark(g, { x: M.x + boil(1), y: M.y + boil(2), R: M.R }, '#F2F0FF', '#C9A8FF'); g.restore();
  K.strokeMark(g, { x: M.x + boil(3), y: M.y + boil(4), R: M.R }, '#0E0820', 7 * S);
  g.strokeStyle = '#0E0820'; g.lineWidth = 7 * S; K.circle(g, M.x + boil(5), M.y + boil(6), M.R * 1.04); g.stroke();
  // a gadget (household junk): a ray-gun shaped mic on the floor
  g.fillStyle = '#E86A5A'; g.strokeStyle = '#0E0820'; g.lineWidth = 6 * S; K.rr(g, M.x + M.R * 1.6 + boil(7), H * .8 - 40 * S, 140 * S, 50 * S, 20 * S); g.fill(); g.stroke();
}

// 24 CEL ANIME 80s — launch night: airbrushed city sky, backlit neon, flat cels, tape on a CRT
export function celAnime(g, t, { W, H, M, S }) {
  const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#120B2E'); sky.addColorStop(.6, '#5B2A7A'); sky.addColorStop(1, '#E2627F'); g.fillStyle = sky; g.fillRect(0, 0, W, H);
  // skyline cels
  for (let L = 0; L < 2; L++) for (let i = 0; i < 16; i++) { const r = mulberry(i + L * 50), w = (60 + r() * 90) * S, x = i * W / 14 - 30 * S + L * 40 * S, h = (160 + r() * 300) * S * (L ? .7 : 1);
    g.fillStyle = L ? '#2A1240' : '#160A28'; g.fillRect(x, H - h, w, h);
    g.fillStyle = L ? 'rgba(255,190,120,.7)' : 'rgba(120,220,255,.85)'; for (let wy = 0; wy < 10; wy++) for (let wx = 0; wx < 3; wx++) if (r() < .4) g.fillRect(x + 10 * S + wx * w / 3.4, H - h + 16 * S + wy * 26 * S, 8 * S, 12 * S); }
  // neon sign = the mark, backlit with heavy glow
  g.save(); g.globalCompositeOperation = 'lighter'; for (const [b, a] of [[60, .5], [25, .8]]) { g.shadowColor = '#FF4FD8'; g.shadowBlur = b * S; K.strokeMark(g, M, `rgba(255,120,230,${a})`, 10 * S, `rgba(140,230,255,${a})`); } g.restore();
  K.strokeMark(g, M, '#FFE6FA', 4 * S, '#E6FBFF');
  // speed lines
  g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 2 * S; for (let i = 0; i < 30; i++) { const y = hash(i * 3 + Math.floor(t * 12)) * H, x = ((hash(i) * W + t * 3000 * S) % (W * 1.4)) - W * .2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 220 * S, y); g.stroke(); }
  g.font = `italic 800 ${64 * S}px InterTight`; g.fillStyle = '#FFE6FA'; g.textAlign = 'left'; g.save(); g.shadowColor = '#FF4FD8'; g.shadowBlur = 20 * S; g.fillText('MIDNIGHT LAUNCH', 70 * S, 130 * S); g.restore();
  // tape on a CRT: scanlines, chroma shift, a tracking bar
  g.fillStyle = 'rgba(0,0,0,.22)'; for (let y = 0; y < H; y += 3 * S) g.fillRect(0, y, W, 1.2 * S);
  const ty = ((t * .7) % 1) * H; g.fillStyle = 'rgba(255,255,255,.06)'; g.fillRect(0, ty, W, 24 * S);
  K.vignette(g, W, H, .7, .3);
}

// 25 PIXEL RPG — gaming expo: 320×180, an indexed palette, a hero, a save point, a typing text box
export function pixelRpg(g, t, { W, H, M, S }) {
  const pw = 320, ph = Math.round(320 * H / W), q = K.canvas(pw, ph).getContext('2d'), s = W / pw;
  const P = ['#0f0f1b', '#262b44', '#3a4466', '#5a6988', '#8b9bb4', '#3e8948', '#63c74d', '#265c42', '#feae34', '#f77622', '#ffffff', '#b55088', '#a884f3'];
  q.fillStyle = P[6]; q.fillRect(0, 0, pw, ph);
  for (let y = 0; y < ph; y += 16) for (let x = 0; x < pw; x += 16) { if (hash(x * 3 + y) < .35) { q.fillStyle = P[5]; q.fillRect(x + 4, y + 6, 2, 2); q.fillRect(x + 10, y + 3, 2, 2); } }
  // path + trees
  q.fillStyle = '#c2a36b'; q.fillRect(0, Math.round(ph * .72), pw, 14);
  for (let i = 0; i < 9; i++) { const x = Math.round(hash(i * 5) * pw), y = Math.round(ph * .1 + hash(i * 7) * ph * .2); q.fillStyle = P[7]; q.fillRect(x - 6, y - 10, 12, 14); q.fillStyle = P[5]; q.fillRect(x - 5, y - 9, 8, 6); q.fillStyle = '#6b4a2a'; q.fillRect(x - 1, y + 4, 3, 4); }
  // the mark as a pixel save point (glowing, palette-cycled)
  const mx = M.x / s, my = M.y / s, R = M.R / s, cyc = Math.floor(t * 8) % 2;
  for (let y = Math.floor(my - R - 2); y < my + R + 2; y++) for (let x = Math.floor(mx - R - 2); x < mx + R + 2; x++) { const k = K.markHit((x + .5 - mx) * 100 / R, (y + .5 - my) * 100 / R); if (k < 0) continue; q.fillStyle = k === 3 ? P[12] : (cyc && (x + y) % 5 === 0 ? P[4] : P[10]); q.fillRect(x, y, 1, 1); }
  // hero walking toward it (2-frame walk)
  const hx = Math.round(lerp(20, mx - R - 14, clamp(t * 1.4))), hy = Math.round(ph * .72) - 10, f = Math.floor(t * 8) % 2;
  q.fillStyle = P[0]; q.fillRect(hx, hy - 12, 8, 8); q.fillStyle = '#f2c09a'; q.fillRect(hx + 1, hy - 11, 6, 5); q.fillStyle = P[11]; q.fillRect(hx, hy - 4, 8, 7); q.fillStyle = P[1]; q.fillRect(hx + (f ? 0 : 1), hy + 3, 3, 3); q.fillRect(hx + (f ? 5 : 4), hy + 3, 3, 3);
  // text box
  const bx = 8, by = Math.min(ph - 40, Math.round(ph * .78)), bw = pw - 16; q.fillStyle = P[1]; q.fillRect(bx, by, bw, 32); q.fillStyle = P[10]; q.fillRect(bx + 1, by + 1, bw - 2, 1); q.fillRect(bx + 1, by + 30, bw - 2, 1); q.fillRect(bx + 1, by + 1, 1, 30); q.fillRect(bx + bw - 2, by + 1, 1, 30);
  g.imageSmoothingEnabled = false; g.drawImage(q.canvas, 0, 0, W, H); g.imageSmoothingEnabled = true;
  const msg = 'PURPLEHAT joined your party!', n = Math.floor(clamp(t * 1.6) * msg.length);
  g.font = `${8 * s}px PressStart`; g.fillStyle = '#ffffff'; g.textAlign = 'left'; g.textBaseline = 'top'; g.fillText(msg.slice(0, n), (bx + 8) * s, (by + 12) * s);
}

// 26 HD-2D — a fantasy ball: pixel sprites as paper cut-outs inside a lit, fogged diorama, tilt-shift focus
export function hd2d(g, t, { W, H, M, S }) {
  const C = K.canvas(W, H), q = C.getContext('2d');
  const bg = q.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#1a1428'); bg.addColorStop(1, '#3a2a3a'); q.fillStyle = bg; q.fillRect(0, 0, W, H);
  // stone floor in perspective
  for (let j = 0; j < 12; j++) for (let i = -10; i < 10; i++) { const y0 = H * .55 + j * j * 4 * S, f = 1 + j * .18, w = 80 * S * f; q.fillStyle = (i + j) % 2 ? '#4a3a44' : '#54424a'; q.fillRect(W / 2 + i * w, y0, w - 2, (2 * j + 1) * 4 * S); }
  // pillars with torches
  for (const sx of [-1, 1]) for (let k = 0; k < 2; k++) { const x = M.x + sx * M.R * (2 + k * 1.3), h = H * (.5 - k * .1); q.fillStyle = k ? '#2a2030' : '#3a2e3e'; q.fillRect(x - 30 * S, H * .55 - h, 60 * S, h + 40 * S);
    const fl = .8 + .2 * Math.sin(t * 20 + k + sx); const gl = q.createRadialGradient(x, H * .55 - h * .7, 0, x, H * .55 - h * .7, 220 * S); gl.addColorStop(0, `rgba(255,170,80,${.55 * fl})`); gl.addColorStop(1, 'rgba(255,170,80,0)'); q.fillStyle = gl; q.fillRect(0, 0, W, H);
    q.fillStyle = '#ffcf6a'; q.fillRect(x - 6 * S, H * .55 - h * .7 - 10 * S, 12 * S, 16 * S); }
  // the mark as a glowing pixel banner (crest)
  const px = 7 * S; for (const c of K.markCells(M, px)) { q.fillStyle = c.k === 3 ? '#B8A2FF' : '#F4E6C8'; q.fillRect(c.x - px / 2, c.y - px / 2, px, px); }
  const cg = q.createRadialGradient(M.x, M.y, 0, M.x, M.y, M.R * 1.8); cg.addColorStop(0, 'rgba(200,180,255,.25)'); cg.addColorStop(1, 'rgba(200,180,255,0)'); q.fillStyle = cg; q.fillRect(0, 0, W, H);
  // sprites: dancing couples, stepping on twos, with drop shadows
  const tt = K.twos(t, 8);
  for (let i = 0; i < 6; i++) { const x = W * (.18 + i * .13) + Math.sin(tt * 3 + i) * 20 * S, y = H * .8 + (i % 2) * 30 * S, sp = 6 * S;
    q.fillStyle = 'rgba(0,0,0,.35)'; q.beginPath(); q.ellipse(x, y + 2 * sp, 5 * sp, 1.6 * sp, 0, 0, TAU); q.fill();
    const col = ['#c84a6a', '#4a6ac8', '#e0c050'][i % 3]; q.fillStyle = col; q.fillRect(x - 3 * sp, y - 8 * sp, 6 * sp, 9 * sp); q.fillStyle = '#f2c8a0'; q.fillRect(x - 2 * sp, y - 12 * sp, 4 * sp, 4 * sp); q.fillStyle = '#2a1a1a'; q.fillRect(x - 2 * sp, y - 13 * sp, 4 * sp, 2 * sp); }
  g.drawImage(C, 0, 0);
  // tilt-shift: blur bands top and bottom, bloom, vignette
  g.save(); g.filter = `blur(${6 * S}px)`; g.beginPath(); g.rect(0, 0, W, H * .22); g.rect(0, H * .86, W, H * .14); g.clip(); g.drawImage(C, 0, 0); g.restore();
  g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = .25; g.filter = `blur(${18 * S}px)`; g.drawImage(C, 0, 0); g.restore();
  K.vignette(g, W, H, .7, .3);
}

// 27 LOW-POLY ISLAND — an offsite: a faceted island, pastel sky, pieces landing with a bounce
export function lowpoly(g, t, { W, H, M, S }) {
  const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#FBD3C4'); sky.addColorStop(1, '#BFE3F0'); g.fillStyle = sky; g.fillRect(0, 0, W, H);
  K.fillMark(g, M, '#FFF7EC', '#C9B6FF');
  // sea
  g.fillStyle = '#7FC4D8'; g.fillRect(0, H * .72, W, H * .28); g.fillStyle = '#9AD3E2'; for (let i = 0; i < 16; i++) { const y = H * .74 + i * 14 * S; g.fillRect(((hash(i) * W + t * 60 * S) % W), y, 80 * S, 3 * S); }
  // island: faceted triangles
  const cx = M.x, cy = H * .74, iw = M.R * 2.6, r = mulberry(27);
  const tri = (a, b, c, col) => { g.fillStyle = col; K.poly(g, [a, b, c]); g.fill(); };
  tri([cx - iw, cy], [cx - iw * .3, cy - 60 * S], [cx, cy], '#9CCB7C'); tri([cx - iw * .3, cy - 60 * S], [cx + iw * .4, cy - 70 * S], [cx, cy], '#8BBE6C'); tri([cx + iw * .4, cy - 70 * S], [cx + iw, cy], [cx, cy], '#A9D488');
  tri([cx - iw, cy], [cx, cy], [cx - iw * .2, cy + 50 * S], '#C9A77A'); tri([cx, cy], [cx + iw, cy], [cx - iw * .2, cy + 50 * S], '#B8936A');
  // houses landing with a bounce
  for (let i = 0; i < 5; i++) { const lt = t - i * .1, k = lt < 0 ? 0 : back(seg(lt, 0, .25), 2.2); if (k <= 0) continue;
    const x = cx - iw * .6 + i * iw * .3, y = cy - 60 * S - Math.sin(i) * 10 * S - (1 - k) * 120 * S, s = 40 * S;
    g.fillStyle = ['#FFFFFF', '#F7E1C8', '#FFFFFF', '#F3D1D1', '#FFFFFF'][i]; g.fillRect(x - s / 2, y - s, s, s); g.fillStyle = ['#E77E6B', '#6B8BE7', '#E7B76B', '#7EC08F', '#B07EE7'][i]; K.poly(g, [[x - s * .62, y - s], [x, y - s * 1.6], [x + s * .62, y - s]]); g.fill(); }
  // palm
  g.strokeStyle = '#8A6A4A'; g.lineWidth = 8 * S; g.beginPath(); g.moveTo(cx + iw * .7, cy - 10 * S); g.quadraticCurveTo(cx + iw * .75, cy - 90 * S, cx + iw * .62, cy - 150 * S); g.stroke();
  for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * .6 + Math.sin(t * 3) * .05; tri([cx + iw * .62, cy - 150 * S], [cx + iw * .62 + Math.cos(a - .15) * 80 * S, cy - 150 * S + Math.sin(a - .15) * 80 * S + 30 * S], [cx + iw * .62 + Math.cos(a + .15) * 80 * S, cy - 150 * S + Math.sin(a + .15) * 80 * S + 30 * S], '#6DB36A'); }
}

// 28 ISO INFOGRAPHIC — the expo floor as a floating isometric board: three-tone blocks, thin labels, Isotype people
export function isoInfo(g, t, { W, H, M, S }) {
  g.fillStyle = '#F3EFE6'; g.fillRect(0, 0, W, H);
  const u = 46 * S, iso = (x, y, z) => [M.x + (x - y) * u * .866, M.y + M.R * 1.05 + (x + y) * u * .5 - z * u];
  const box = (x, y, w, d, h, c) => { const [top, l, r] = c; const p = (a, b, z) => iso(a, b, z);
    g.fillStyle = l; K.poly(g, [p(x, y + d, 0), p(x + w, y + d, 0), p(x + w, y + d, h), p(x, y + d, h)]); g.fill();
    g.fillStyle = r; K.poly(g, [p(x + w, y, 0), p(x + w, y + d, 0), p(x + w, y + d, h), p(x + w, y, h)]); g.fill();
    g.fillStyle = top; K.poly(g, [p(x, y, h), p(x + w, y, h), p(x + w, y + d, h), p(x, y + d, h)]); g.fill(); };
  // board with soil strata
  box(-6, -4, 12, 8, .0001, ['#E7E1D2', '#C9B79A', '#B5A07F']); box(-6, -4, 12, 8, -.6, ['#E7E1D2', '#C9B79A', '#B5A07F']);
  const cols = [['#7FB3C8', '#4E7F94', '#3B6577'], ['#F2B134', '#C68B1C', '#A87514'], ['#E8553D', '#B8402C', '#963322'], ['#9A7FA8', '#735A82', '#5A456A']];
  const booths = [[-5, -3, 2, 2], [-5, 1, 2, 2], [3, -3, 2, 2], [3, 1, 2, 2], [-1.5, 2.2, 3, 1.4]];
  booths.forEach(([x, y, w, d], i) => { const k = back(seg(t, i * .08, .3 + i * .08), 1.6); if (k > 0) box(x, y, w, d, 1.2 * k, cols[i % 4]); });
  // the mark as the hall's centre sign, upright
  K.fillMark(g, M, '#2B2F3A', '#9A7FA8');
  // Isotype rows: one figure = 100 guests
  const n = Math.floor(clamp(t * 1.3) * 12); g.fillStyle = '#2B2F3A';
  for (let i = 0; i < n; i++) { const x = 70 * S + (i % 6) * 34 * S, y = H * .2 + Math.floor(i / 6) * 60 * S; K.circle(g, x, y, 7 * S); g.fill(); K.rr(g, x - 9 * S, y + 10 * S, 18 * S, 30 * S, 6 * S); g.fill(); }
  g.font = `600 ${15 * S}px Mono`; g.textAlign = 'left'; K.track(g, '■ = 100 GUESTS / HOUR', 64 * S, H * .2 + 140 * S, .1);
  g.strokeStyle = '#2B2F3A'; g.lineWidth = 1; const [ax, ay] = iso(4, 2, 1.2); g.beginPath(); g.moveTo(ax, ay); g.lineTo(ax + 120 * S, ay - 80 * S); g.lineTo(ax + 260 * S, ay - 80 * S); g.stroke();
  K.track(g, 'BOOTH C · DEMO ZONE', ax + 126 * S, ay - 92 * S, .1);
}

// 29 BRICK TOY — the family zone: the mark built from toy bricks on a desk, macro focus
export function brickToy(g, t, { W, H, M, S }) {
  const desk = g.createLinearGradient(0, 0, 0, H); desk.addColorStop(0, '#8C6A4A'); desk.addColorStop(1, '#5A4030'); g.fillStyle = desk; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 30; i++) { g.strokeStyle = `rgba(40,25,15,${.1 + hash(i) * .15})`; g.lineWidth = 2 * S; g.beginPath(); g.moveTo(0, i * H / 30 + Math.sin(i) * 10); g.bezierCurveTo(W * .3, i * H / 30 + 20, W * .6, i * H / 30 - 15, W, i * H / 30 + 8); g.stroke(); }
  const st = 26 * S, cells = K.markCells(M, st), pal = { 0: '#C91A09', 1: '#0055BF', 2: '#F2CD37', 3: '#B9A6F2' };
  g.save(); g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 14 * S; g.shadowOffsetY = 8 * S;
  cells.forEach((c, i) => { const land = (c.j + 12) * .012 - .2 + hash(c.i * 7 + c.j) * .06, k = back(seg(t, land - .2, land), 1.4); if (k <= 0) return; const y = c.y - (1 - k) * 160 * S;
    g.fillStyle = pal[c.k]; g.fillRect(c.x - st / 2, y - st / 2, st + .5, st + .5); });
  g.restore();
  cells.forEach((c) => { const land = (c.j + 12) * .012 - .2 + hash(c.i * 7 + c.j) * .06, k = back(seg(t, land - .2, land), 1.4); if (k <= 0) return; const y = c.y - (1 - k) * 160 * S;
    g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(c.x - st / 2, y + st / 2 - 3 * S, st, 3 * S);
    const gr = g.createRadialGradient(c.x - 3 * S, y - 3 * S, 0, c.x, y, st * .36); gr.addColorStop(0, 'rgba(255,255,255,.7)'); gr.addColorStop(.4, pal[c.k]); gr.addColorStop(1, 'rgba(0,0,0,.25)');
    g.fillStyle = gr; K.circle(g, c.x, y, st * .3); g.fill(); });
  // shallow depth of field: soften the edges of the frame
  const C = K.canvas(W, H); C.getContext('2d').drawImage(g.canvas, 0, 0);
  g.save(); g.filter = `blur(${7 * S}px)`; g.beginPath(); g.rect(0, 0, W, H * .18); g.rect(0, H * .86, W, H * .14); g.clip(); g.drawImage(C, 0, 0); g.restore();
  K.vignette(g, W, H, .5);
}

// 30 PAPER POP-UP — a pop-up stage: V-fold arches spring up back to front, a cut-paper actor with a white border
export function paperPopup(g, t, { W, H, M, S }) {
  g.fillStyle = '#6B4F3A'; g.fillRect(0, 0, W, H);
  // open book pages
  g.fillStyle = '#F4EBDD'; K.poly(g, [[W * .05, H * .62], [W / 2, H * .66], [W / 2, H * .98], [W * .02, H * .94]]); g.fill(); g.fillStyle = '#EADFCB'; K.poly(g, [[W * .95, H * .62], [W / 2, H * .66], [W / 2, H * .98], [W * .98, H * .94]]); g.fill();
  const lamp = g.createRadialGradient(W * .3, 0, 0, W * .3, 0, H * 1.2); lamp.addColorStop(0, 'rgba(255,230,180,.35)'); lamp.addColorStop(1, 'rgba(0,0,0,.3)'); g.fillStyle = lamp; g.fillRect(0, 0, W, H);
  const pop = (i) => eo(seg(t, -.15 + i * .1, .2 + i * .1));
  // arches (back to front), each rotating up from the page
  [['#9A6FB0', 1.55], ['#C78BD0', 1.35]].forEach(([c, r], i) => { const k = pop(i); g.save(); g.translate(M.x, H * .66); g.scale(1, k); g.fillStyle = c; g.beginPath(); g.arc(0, 0, M.R * r * 1.05, Math.PI, 0); g.arc(0, 0, M.R * (r - .12), 0, Math.PI, true); g.fill(); g.restore(); });
  // the mark as a pop-up wheel standing on a V-fold
  const k = pop(2); g.save(); g.translate(0, (1 - k) * M.R * 2); g.globalAlpha = k;
  K.fillMark(g, M, '#FFFFFF', '#FFFFFF', { shadow: { c: 'rgba(0,0,0,.35)', b: 20 * S, y: 12 * S } }); K.fillMark(g, { ...M, R: M.R * .9 }, '#2E3A6E', '#9A7FD8'); g.restore();
  // cut-paper actor with a white border, bobbing
  const ax = M.x - M.R * 1.75, ay = H * .66 + Math.sin(t * 10) * 4 * S;
  g.save(); g.translate(ax, ay); g.scale(S, S); g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 12; g.shadowOffsetY = 8;
  g.fillStyle = '#fff'; K.rr(g, -46, -200, 92, 200, 40); g.fill(); g.shadowColor = 'transparent';
  g.fillStyle = '#E8553D'; K.rr(g, -36, -120, 72, 112, 26); g.fill(); g.fillStyle = '#F2C8A0'; K.circle(g, 0, -150, 30); g.fill(); g.fillStyle = '#2a1a1a'; K.circle(g, -10, -152, 4); g.fill(); K.circle(g, 10, -152, 4); g.fill(); g.restore();
  // speech bubble typing on
  const msg = 'Curtain up!', n = Math.floor(clamp((t - .2) * 2.5) * msg.length);
  if (n > 0) { g.fillStyle = '#fff'; K.rr(g, ax - 20 * S, H * .66 - 300 * S, 230 * S, 64 * S, 30 * S); g.fill(); g.fillStyle = '#2a1a1a'; g.font = `${30 * S}px Lilita`; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(msg.slice(0, n), ax + 4 * S, H * .66 - 268 * S); }
}

// 31 LIVING SCREENCAST — the event app: a crisp hi-res interface with a low-res mascot acting it out
export function screencast(g, t, { W, H, M, S }) {
  g.fillStyle = '#E9ECF2'; g.fillRect(0, 0, W, H);
  const x = W * .12, y = H * .08, w = W * .76, h = H * .84;
  g.save(); g.shadowColor = 'rgba(20,30,60,.18)'; g.shadowBlur = 40 * S; g.shadowOffsetY = 16 * S; g.fillStyle = '#fff'; K.rr(g, x, y, w, h, 16 * S); g.fill(); g.restore();
  g.fillStyle = '#F4F5F8'; K.rr(g, x, y, w, 52 * S, 16 * S); g.fill(); g.fillRect(x, y + 30 * S, w, 22 * S);
  g.fillStyle = '#C9CED8'; K.rr(g, x + w * .3, y + 14 * S, w * .4, 24 * S, 12 * S); g.fill(); g.fillStyle = '#6A7180'; g.font = `500 ${14 * S}px Inter`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('register.purplehat.events', x + w / 2, y + 27 * S);
  // page: hero with the mark as the logo, a register button
  K.fillMark(g, M, '#1E1B2E', '#7C6AF2');
  g.textAlign = 'left'; g.fillStyle = '#1E1B2E'; g.font = `700 ${36 * S}px InterTight`; g.fillText('Summit 2026', x + 48 * S, y + 110 * S);
  g.fillStyle = '#6A7180'; g.font = `400 ${18 * S}px Inter`; g.fillText('Two days. One badge. Zero queues.', x + 48 * S, y + 146 * S);
  const bx = M.x - 110 * S, by = M.y + M.R * 1.25, pressed = t > .55 && t < .7;
  g.fillStyle = pressed ? '#5B49D6' : '#7C6AF2'; K.rr(g, bx, by, 220 * S, 56 * S, 28 * S); g.fill(); g.fillStyle = '#fff'; g.font = `600 ${20 * S}px Inter`; g.textAlign = 'center'; g.fillText(t > .7 ? '✓  Registered' : 'Register', bx + 110 * S, by + 29 * S);
  // cursor
  const cx = lerp(x + w * .8, bx + 150 * S, eo(seg(t, 0, .5))), cy = lerp(y + h * .2, by + 34 * S, eo(seg(t, 0, .5)));
  g.fillStyle = '#111'; K.poly(g, [[cx, cy], [cx, cy + 26 * S], [cx + 7 * S, cy + 20 * S], [cx + 13 * S, cy + 32 * S], [cx + 18 * S, cy + 30 * S], [cx + 12 * S, cy + 18 * S], [cx + 21 * S, cy + 18 * S]]); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 1.5; g.stroke();
  // low-res mascot hopping on the button
  const q = K.canvas(16, 16).getContext('2d'); q.fillStyle = '#7C6AF2'; q.fillRect(3, 5, 10, 9); q.fillRect(5, 3, 6, 2); q.fillStyle = '#fff'; q.fillRect(5, 7, 2, 2); q.fillRect(9, 7, 2, 2); q.fillStyle = '#1E1B2E'; q.fillRect(6, 8, 1, 1); q.fillRect(10, 8, 1, 1);
  const hop = Math.abs(Math.sin(t * 9)) * 40 * S; g.imageSmoothingEnabled = false; g.drawImage(q.canvas, bx - 70 * S, by - 60 * S - hop, 64 * S, 64 * S); g.imageSmoothingEnabled = true;
}

// 32 DATAVIZ — the numbers: a donut drawn by red–blue pencil on cream, a handwritten note pinned to it
export function dataviz(g, t, { W, H, M, S }) {
  g.drawImage(papr(W, H, [246, 240, 226], 32), 0, 0, W, H);
  g.strokeStyle = 'rgba(30,40,80,.12)'; g.lineWidth = 1; for (let y = H * .1; y < H; y += 32 * S) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  // the mark drawn as a four-part donut: blue pencil, the highlighted part in red pencil
  const d = eo(seg(t, -.1, .6));
  K.inMark(g, M, () => { const P = K.markPaths(); P.forEach((p, k) => { const a = clamp(d * 4 - k); if (a <= 0) return; g.save(); g.clip(p);
    g.strokeStyle = k === 3 ? '#C8363A' : '#2A5CB3'; g.lineWidth = 1.6 * 100 / M.R; for (let s2 = -120; s2 < -120 + 240 * a; s2 += 5) { g.beginPath(); g.moveTo(s2, -120); g.lineTo(s2 + 50, 120); g.stroke(); } g.restore();
    g.strokeStyle = k === 3 ? '#C8363A' : '#2A5CB3'; g.lineWidth = 2 * 100 / M.R; if (a > .3) g.stroke(p); }); });
  const labels = ['talks', 'networking', 'dinner', 'the show'];
  g.font = `600 ${28 * S}px Caveat`; g.textBaseline = 'middle';
  labels.forEach((l, k) => { if (d * 4 - k < .8) return; const [mx, my] = K.lensMid(k, 128); g.fillStyle = k === 3 ? '#C8363A' : '#2A5CB3'; g.textAlign = mx > 1 ? 'left' : mx < -1 ? 'right' : 'center'; g.fillText(l, M.x + mx * M.R / 100, M.y + my * M.R / 100 + (my > 0 ? 14 * S : my < 0 ? -10 * S : 0)); });
  if (t > .55) { const k = back(seg(t, .55, .75), 1.6); g.save(); g.translate(M.x + M.R * 1.75, M.y - M.R * .9); g.rotate(.05); g.scale(k, k);
    g.fillStyle = '#FFF3A8'; g.fillRect(-120 * S, -60 * S, 240 * S, 120 * S); g.fillStyle = '#C8363A'; K.circle(g, 0, -60 * S, 8 * S); g.fill();
    g.fillStyle = '#2a2a2a'; g.font = `600 ${30 * S}px Caveat`; g.textAlign = 'center'; g.fillText('the part people', 0, -14 * S); g.fillText('remember ↙', 0, 22 * S); g.restore(); }
  g.fillStyle = '#2a2a2a'; g.font = `700 ${40 * S}px InterTight`; g.textAlign = 'left'; g.fillText('Where the evening goes', 70 * S, 100 * S);
}

// 33 WHITEBOARD — the workshop: marker strokes written live, the mark drawn in one go, arrows and a flow
export function whiteboard(g, t, { W, H, M, S }) {
  g.fillStyle = '#F7F8F9'; g.fillRect(0, 0, W, H);
  const gl = g.createLinearGradient(W * .2, 0, W * .5, H); gl.addColorStop(0, 'rgba(255,255,255,0)'); gl.addColorStop(.5, 'rgba(255,255,255,.7)'); gl.addColorStop(.52, 'rgba(230,234,240,.4)'); gl.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gl; g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(60,70,90,.06)'; g.lineWidth = 30 * S; g.beginPath(); g.moveTo(W * .1, H * .8); g.bezierCurveTo(W * .3, H * .6, W * .5, H * .9, W * .8, H * .7); g.stroke();
  K.strokeMark(g, M, 'rgba(42,92,179,.14)', 9 * S);
  const p = clamp((t + .4) * 1.6), pts = K.markOutlinePts(M, 320), n = Math.floor(p * pts.length);
  g.lineCap = 'round'; g.lineJoin = 'round';
  [0, 1, 2, 3].forEach(k => { const a = k * 80, b = Math.min(n, a + 80); if (b <= a) return; g.strokeStyle = k === 3 ? '#7B4FC8' : '#2A5CB3'; g.lineWidth = 7 * S; g.beginPath(); for (let i = a; i < b; i++) i === a ? g.moveTo(...pts[i]) : g.lineTo(...pts[i]); if (b === a + 80) g.closePath(); g.stroke(); });
  if (n < pts.length) { const [x, y] = pts[Math.max(0, n - 1)]; g.save(); g.translate(x, y); g.rotate(-.6); g.fillStyle = '#2A5CB3'; K.rr(g, 0, -14 * S, 150 * S, 28 * S, 8 * S); g.fill(); g.fillStyle = '#1C2333'; g.fillRect(-14 * S, -6 * S, 16 * S, 12 * S); g.restore(); }
  const words = ['plan', 'build', 'run', 'wow'];
  g.font = `700 ${40 * S}px Caveat`; g.fillStyle = '#23262c'; g.textBaseline = 'middle';
  words.forEach((w, k) => { if (p < .25 * (k + 1)) return; const [mx, my] = K.lensMid(k, 150); g.textAlign = mx > 1 ? 'left' : mx < -1 ? 'right' : 'center'; g.fillStyle = k === 3 ? '#7B4FC8' : '#23262c'; g.fillText(w, M.x + mx * M.R / 100, M.y + my * M.R / 100); });
  // magnets
  for (const [x, y, c] of [[W * .08, H * .12, '#c8363a'], [W * .9, H * .1, '#2e8b57']]) { g.fillStyle = c; K.circle(g, x, y, 16 * S); g.fill(); }
}

// 34 CRAYON BOOK — family day: wax crayon on toothy paper, a watercolour wash revealing what the crayon hid
export function crayonBook(g, t, { W, H, M, S }) {
  g.drawImage(K.paper('tooth', 960, 540, [250, 246, 236], { mottle: 8, grain: 30, seed: 34 }), 0, 0, W, H);
  // wash first (it reveals the wax resist)
  const wash = eo(seg(t, .2, .9));
  g.save(); g.globalAlpha = .45 * wash; g.globalCompositeOperation = 'multiply';
  const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#8FC1E8'); sky.addColorStop(1, '#D9EEF8'); g.fillStyle = sky; g.fillRect(0, 0, W, H * .72); g.fillStyle = '#9BD07A'; g.fillRect(0, H * .72, W * wash, H); g.restore();
  const crayon = (pts, col, w, seed, close = false) => { for (let p = 0; p < 3; p++) { g.strokeStyle = col; g.globalAlpha = .55; g.lineWidth = w * (1 - p * .25); K.wobble(g, pts, 6 * S, seed + p, close); g.stroke(); } g.globalAlpha = 1; };
  // the mark coloured in crayon scribbles
  K.inMark(g, M, () => { const P = K.markPaths(); P.forEach((p, k) => { g.save(); g.clip(p); g.strokeStyle = k === 3 ? '#8A5CD8' : '#F2A93B'; g.globalAlpha = .75; g.lineWidth = 5 * 100 / M.R;
    const r = mulberry(k + 7); g.beginPath(); for (let i = 0; i < 26; i++) { g.moveTo(-110 + r() * 220, -110 + r() * 220); g.lineTo(-110 + r() * 220, -110 + r() * 220); } g.stroke(); g.restore(); }); });
  for (let k = 0; k < 4; k++) crayon(K.markOutlinePts(M, 60, k), k === 3 ? '#6A3CC0' : '#C46A1A', 5 * S, k * 11, true);
  // a tent and two kids
  crayon([[W * .12, H * .72], [W * .2, H * .48], [W * .28, H * .72]], '#E8553D', 7 * S, 3, true);
  for (const [x, c] of [[W * .76, '#2A5CB3'], [W * .84, '#C8363A']]) { const y = H * .72 - Math.abs(Math.sin(t * 8 + x)) * 20 * S;
    crayon([[x, y - 120 * S], [x, y - 40 * S]], c, 8 * S, x | 0); crayon([[x - 30 * S, y], [x, y - 40 * S], [x + 30 * S, y]], c, 7 * S, (x | 0) + 1); crayon([[x - 40 * S, y - 100 * S], [x, y - 90 * S], [x + 40 * S, y - 110 * S]], c, 7 * S, (x | 0) + 2);
    g.strokeStyle = '#3A2A1A'; g.lineWidth = 4 * S; g.globalAlpha = .7; K.wobble(g, Array.from({ length: 13 }, (_, i) => [x + Math.cos(i / 12 * TAU) * 24 * S, y - 146 * S + Math.sin(i / 12 * TAU) * 24 * S]), 3 * S, 5); g.stroke(); g.globalAlpha = 1; }
  // sun scribble in the corner
  crayon(Array.from({ length: 16 }, (_, i) => [W * .9 + Math.cos(i / 15 * TAU) * 50 * S, H * .14 + Math.sin(i / 15 * TAU) * 50 * S]), '#F2C43B', 8 * S, 9, true);
}
