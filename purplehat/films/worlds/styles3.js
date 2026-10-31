// The breath, then act 3 — paint and place, and the glass reveal.
import * as K from './kit.js';
const { clamp, lerp, seg, ss, eio, eo, ei, back, mulberry, hash, TAU, rgb, hex, mix, fbm, vn2 } = K;
const HALF = Math.atan2(67.7, 73.6);

// a dry brush along one lens: bristles at different radii, gaps where the brush runs dry (flying white)
function brushLens(g, M, k, p, ink, maxW = 1, seed = 1) {
  if (p <= 0) return;
  const R = M.R / 100, a0 = K.ARC_DIR[k] - HALF * 1.05, a1 = K.ARC_DIR[k] + HALF * 1.05, n = 70, bristles = 16;
  for (let b = 0; b < bristles; b++) {
    const rad = lerp(84, 101, b / (bristles - 1)) * R, dry = .25 + .6 * (b / bristles);
    g.strokeStyle = ink; g.lineCap = 'round';
    for (let i = 0; i < n * p; i++) {
      const u = i / n, w = Math.pow(Math.sin(Math.PI * u), .5) * maxW;
      // inner edge follows the lens: bristles near the inside only reach the middle
      const inner = 85 + (1 - Math.pow(Math.sin(Math.PI * u), 1)) * 15; if (rad / R < inner - 1) continue;
      if (vn2(i * .35 + seed, b * 1.7) < dry * (1 - Math.sin(Math.PI * u) * .6)) continue;
      const a = lerp(a0, a1, u), a2 = lerp(a0, a1, u + 1 / n);
      g.lineWidth = (1.6 + 2.2 * w) * M.R / 190; g.globalAlpha = .55 + .4 * hash(i * 7 + b);
      g.beginPath(); g.moveTo(M.x + Math.cos(a) * rad, M.y + Math.sin(a) * rad); g.lineTo(M.x + Math.cos(a2) * rad, M.y + Math.sin(a2) * rad); g.stroke();
    }
  }
  g.globalAlpha = 1;
}

// 35 INK WASH — the retreat, the breath: blank rice paper, four strokes, one mountain that bleeds, a seal
export function inkWash(g, t, { W, H, M, S }) {
  g.drawImage(K.paper('xuan', 960, 540, [242, 236, 222], { mottle: 9, grain: 7, fibres: 4000, seed: 35 }), 0, 0, W, H);
  // mountain: an ink bloom spreading on the paper (blurred, wet)
  const bloom = eo(seg(t, .3, 2.6));
  if (bloom > 0) { const C = K.canvas(W, H), q = C.getContext('2d'); q.fillStyle = 'rgba(30,28,26,.85)'; q.beginPath(); q.moveTo(-20, H);
    for (let x = -20; x <= W * .55; x += 8 * S) { const y = H * .78 - Math.max(0, Math.sin((x / (W * .55)) * Math.PI)) * H * .22 * (.8 + .4 * fbm(x / (120 * S), 3)); q.lineTo(x, lerp(H, y, bloom)); } q.lineTo(W * .6, H); q.closePath(); q.fill();
    g.save(); g.filter = `blur(${lerp(14, 5, bloom) * S}px)`; g.globalAlpha = .55; g.drawImage(C, 0, 0); g.filter = 'none'; g.globalAlpha = .35; g.drawImage(C, 0, 0); g.restore(); }
  // the mark in four brush strokes, slow, one per beat
  for (let k = 0; k < 4; k++) brushLens(g, M, k, eio(seg(t, .5 + k * .5, 1.1 + k * .5)), k === 3 ? '#6A4FA0' : '#1E1C1A', 1, k * 13);
  // a tiny figure, two strokes, walking toward the mountain
  const fx = lerp(W * .7, W * .64, clamp(t / 4)), fy = H * .82;
  g.strokeStyle = '#1E1C1A'; g.lineWidth = 3 * S; g.lineCap = 'round'; g.beginPath(); g.moveTo(fx, fy - 30 * S); g.lineTo(fx - 3 * S, fy); g.stroke(); K.circle(g, fx, fy - 36 * S, 4.5 * S); g.fillStyle = '#1E1C1A'; g.fill();
  // red seal
  const sk = back(seg(t, 2.8, 3.0), 1.4); if (sk > 0) { const x = W * .86, y = H * .8, s = 64 * S * sk; g.fillStyle = '#B02E22'; K.rr(g, x - s / 2, y - s / 2, s, s, 6 * S); g.fill();
    g.fillStyle = '#F2ECDE'; g.font = `700 ${26 * S * sk}px IMFell`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('P H', x, y + 2 * S); }
}

// 36 WATERCOLOUR — a garden wedding: translucent washes on cotton paper that paint themselves, a note in the margin
export function watercolor(g, t, { W, H, M, S }) {
  g.drawImage(K.paper('cotton2', 960, 540, [248, 240, 226], { mottle: 10, grain: 14, seed: 36 }), 0, 0, W, H);
  const wash = (fn, col, a, seed) => { const C = K.canvas(W, H), q = C.getContext('2d'); q.fillStyle = col; fn(q); g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = a; g.filter = `blur(${2 * S}px)`; g.drawImage(C, 0, 0); g.filter = 'none';
    // pigment collects at the edge
    q.globalCompositeOperation = 'source-in'; g.globalAlpha = a * .5; g.restore(); };
  const k = (a, b) => eo(seg(t, a, b));
  // sky wash: wet-on-wet blobs
  wash(q => { q.filter = `blur(${18 * S}px)`; for (let i = 0; i < 40; i++) { const r = mulberry(i + 3), x = r() * W, y = r() * H * .5, rad = (70 + r() * 150) * S * k(-.2, .8); K.circle(q, x, y, rad); q.fill(); } }, '#6E9CCB', .42);
  // lawn
  wash(q => { q.beginPath(); q.moveTo(0, H); for (let x = 0; x <= W; x += 20 * S) q.lineTo(x, H * .78 + Math.sin(x * .004) * 20 * S + (1 - k(.1, .8)) * H * .3); q.lineTo(W, H); q.fill(); }, '#8ea860', .55);
  // arch of flowers around the mark
  const ak = k(.2, 1.1);
  for (let i = 0; i < 60; i++) { const a = Math.PI + (i / 59) * Math.PI, u = i / 59; if (u > ak) break; const r = M.R * 1.45 + Math.sin(i * 1.7) * 10 * S, x = M.x + Math.cos(a) * r, y = M.y + Math.sin(a) * r * 1.05 + M.R * .2;
    g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = .55; g.fillStyle = ['#d9632e', '#e8a0a8', '#f3e2c8', '#c8442a'][i % 4]; K.circle(g, x, y, (12 + hash(i) * 10) * S); g.fill();
    g.fillStyle = '#4e6e3c'; g.globalAlpha = .4; g.beginPath(); g.ellipse(x + 12 * S, y + 6 * S, 12 * S, 5 * S, a, 0, TAU); g.fill(); g.restore(); }
  g.strokeStyle = 'rgba(78,110,60,.6)'; g.lineWidth = 5 * S; for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(M.x + sx * M.R * 1.45, M.y + M.R * .2); g.lineTo(M.x + sx * M.R * 1.45, H * .8); g.stroke(); }
  // the mark, painted: wash, then a darker edge where pigment dries
  const mk = k(.3, 1.0);
  g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = .6 * mk; K.fillMark(g, M, '#c9a06b', '#9c86d8'); g.globalAlpha = .45 * mk; K.strokeMark(g, M, '#8a5a32', 3 * S, '#6a4fa0'); g.restore();
  // granulation
  g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = .25 * mk; K.inMark(g, M, () => { const P = K.markPaths(); P.forEach(p => { g.save(); g.clip(p); for (let i = 0; i < 160; i++) { g.fillStyle = '#5a3a2a'; K.circle(g, -100 + hash(i) * 200, -100 + hash(i + 5) * 200, 1.2); g.fill(); } g.restore(); }); }); g.restore();
  g.fillStyle = 'rgba(80,60,40,.85)'; g.font = `600 ${32 * S}px Caveat`; g.textAlign = 'left'; g.globalAlpha = k(.8, 1.2); g.fillText('golden hour — 18:40, the lawn', 70 * S, 100 * S); g.globalAlpha = 1;
}

// 37 URBAN SKETCH — a city tour: sepia fineliner that overshoots, loose watercolour dropped off the lines
export function urbanSketch(g, t, { W, H, M, S }) {
  g.drawImage(K.paper('cold', 960, 540, [246, 238, 220], { mottle: 10, grain: 16, seed: 37 }), 0, 0, W, H);
  const d = clamp((t + .1) / 1.3), sep = '#4a3424';
  // colour first, slightly off the lines
  g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = .5 * eo(seg(t, .3, 1.0));
  g.fillStyle = '#9fbcd6'; g.beginPath(); g.ellipse(W * .5, H * .12, W * .45, H * .16, 0, 0, TAU); g.fill();
  g.fillStyle = '#d8c6a0'; g.fillRect(W * .06 + 10 * S, H * .26 + 8 * S, W * .3, H * .6); g.fillRect(W * .64 + 12 * S, H * .22 + 6 * S, W * .3, H * .64);
  g.fillStyle = '#c9573f'; for (const x of [W * .1, W * .7]) g.fillRect(x + 8 * S, H * .58, W * .2, H * .05);
  g.restore();
  // fineliner: buildings in perspective, lines overshoot their corners
  const lines = []; const L = (a, b) => lines.push([a, b]);
  for (const [x0, w, top] of [[W * .06, W * .3, H * .26], [W * .64, W * .3, H * .22]]) {
    L([x0, top], [x0 + w, top]); L([x0, top], [x0, H * .86]); L([x0 + w, top], [x0 + w, H * .86]);
    for (let f = 1; f < 5; f++) L([x0, top + f * H * .12], [x0 + w, top + f * H * .12 - 4 * S]);
    for (let c = 1; c < 4; c++) for (let f = 0; f < 4; f++) { const wx = x0 + c * w / 4 - 16 * S, wy = top + f * H * .12 + 22 * S; L([wx, wy], [wx + 30 * S, wy]); L([wx, wy], [wx, wy + 44 * S]); L([wx + 30 * S, wy], [wx + 30 * S, wy + 44 * S]); }
  }
  L([0, H * .86], [W, H * .86]); L([W * .36, H * .86], [W * .45, H]); L([W * .64, H * .86], [W * .55, H]);
  // hanging sign bracket for the mark
  L([M.x - M.R * 1.3, M.y - M.R * 1.2], [M.x + M.R * 1.3, M.y - M.R * 1.2]); L([M.x, M.y - M.R * 1.2], [M.x, M.y - M.R]);
  g.strokeStyle = sep; g.lineWidth = 1.6 * S; g.lineCap = 'round';
  lines.forEach(([a, b], i) => { const u = clamp(d * lines.length * 1.4 - i * 1.0); if (u <= 0) return; const over = 1.06, ex = lerp(a[0], b[0], u * over), ey = lerp(a[1], b[1], u * over);
    K.wobble(g, [[a[0] - (b[0] - a[0]) * .03, a[1] - (b[1] - a[1]) * .03], [ex, ey]], 2.2 * S, i * 3); g.stroke(); });
  // the mark as the round shop sign: loose wash + wobbly outline
  g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = .55; K.fillMark(g, { x: M.x + 9 * S, y: M.y + 6 * S, R: M.R }, '#c8a86b', '#9c86d8'); g.restore();
  for (let k = 0; k < 4; k++) { const u = clamp(d * 1.6 - .3 - k * .12); if (u <= 0) continue; const pts = K.markOutlinePts(M, 60, k).slice(0, Math.ceil(60 * u)); g.strokeStyle = sep; g.lineWidth = 1.8 * S; K.wobble(g, pts, 2.5 * S, 40 + k); g.stroke(); }
  g.fillStyle = sep; g.font = `600 ${28 * S}px Caveat`; g.textAlign = 'left'; g.globalAlpha = eo(seg(t, .8, 1.2)); g.fillText('old quarter, 10:20 — group of 40', W * .06, H * .95); g.globalAlpha = 1;
}

// 38 UKIYO-E — a Japan incentive: bokashi sky, carved-line sea, a boat of travellers, the mark as the moon; the camera unrolls
export function ukiyoe(g, t, { W, H, M, S }) {
  const pan = (t - 1) * 30 * S;
  const sky = g.createLinearGradient(0, 0, 0, H * .6); sky.addColorStop(0, '#1F3E6E'); sky.addColorStop(.55, '#9DB4C8'); sky.addColorStop(1, '#F1E6CC'); g.fillStyle = sky; g.fillRect(0, 0, W, H);
  K.fillMark(g, M, '#F6E7B8', '#D2C2F2'); K.strokeMark(g, M, '#2A2A30', 2.5 * S);
  // distant mountain with snow cap
  g.fillStyle = '#3E5C7A'; g.beginPath(); g.moveTo(W * .55 - pan * .3, H * .66); g.lineTo(W * .78 - pan * .3, H * .32); g.lineTo(W * 1.02 - pan * .3, H * .66); g.fill();
  g.fillStyle = '#F4EFE2'; g.beginPath(); g.moveTo(W * .73 - pan * .3, H * .39); g.lineTo(W * .78 - pan * .3, H * .32); g.lineTo(W * .83 - pan * .3, H * .39); for (let i = 0; i < 4; i++) g.lineTo(W * (.82 - i * .025) - pan * .3, H * (.4 + (i % 2) * .02)); g.fill();
  // sea in flat blocks with carved swell lines
  g.fillStyle = '#2B5C8A'; g.fillRect(0, H * .66, W, H); g.fillStyle = '#1D3F66'; g.fillRect(0, H * .82, W, H);
  g.strokeStyle = '#E8E1CF'; g.lineWidth = 2.4 * S;
  for (let r = 0; r < 9; r++) { const y = H * .7 + r * 26 * S; g.beginPath(); for (let x = -40; x < W + 40; x += 6 * S) { const yy = y + Math.sin((x + pan * (1 + r * .1)) / (60 * S) + r) * 6 * S; x === -40 ? g.moveTo(x, yy) : g.lineTo(x, yy); } g.stroke(); }
  // boat of travellers (foreground, cropped boldly)
  const bx = W * .22 - pan * 1.5, by = H * .84 + Math.sin(t * 2) * 4 * S;
  g.fillStyle = '#5A3A22'; g.beginPath(); g.moveTo(bx - 200 * S, by); g.quadraticCurveTo(bx, by + 50 * S, bx + 220 * S, by - 20 * S); g.lineTo(bx + 200 * S, by + 10 * S); g.quadraticCurveTo(bx, by + 70 * S, bx - 190 * S, by + 20 * S); g.fill();
  for (let i = 0; i < 5; i++) { const x = bx - 130 * S + i * 60 * S; g.fillStyle = ['#C8402A', '#2B4C7A', '#E2B13A', '#3B6A4A', '#7A4FA0'][i]; g.beginPath(); g.moveTo(x - 16 * S, by + 4 * S); g.lineTo(x, by - 44 * S); g.lineTo(x + 16 * S, by + 4 * S); g.fill(); g.fillStyle = '#E8C8A0'; K.circle(g, x, by - 50 * S, 8 * S); g.fill(); g.fillStyle = '#C8A050'; g.beginPath(); g.moveTo(x - 18 * S, by - 52 * S); g.lineTo(x, by - 66 * S); g.lineTo(x + 18 * S, by - 52 * S); g.fill(); }
  // cartouche + seal
  g.fillStyle = '#F2E2A8'; g.fillRect(W * .88, H * .08, 60 * S, 260 * S); g.strokeStyle = '#2A2A30'; g.lineWidth = 2 * S; g.strokeRect(W * .88, H * .08, 60 * S, 260 * S);
  g.fillStyle = '#2A2A30'; g.font = `${24 * S}px IMFell`; g.textAlign = 'center'; g.textBaseline = 'middle'; 'KYOTO'.split('').forEach((c, i) => g.fillText(c, W * .88 + 30 * S, H * .08 + 40 * S + i * 44 * S));
  g.fillStyle = '#B02E22'; g.fillRect(W * .88 + 10 * S, H * .08 + 280 * S, 40 * S, 40 * S);
  g.save(); g.globalAlpha = .3; g.globalCompositeOperation = 'multiply'; g.drawImage(K.paper('washi', 960, 540, [235, 225, 200], { mottle: 26, grain: 20, fibres: 3000, seed: 38 }), 0, 0, W, H); g.restore();
}

// 39 TILT-SHIFT — a street festival from above: a real place made toy-sized, time-lapse traffic, a blur band
export function tiltShift(g, t, { W, H, M, S }) {
  const C = K.canvas(W, H), q = C.getContext('2d');
  q.fillStyle = '#7C8A72'; q.fillRect(0, 0, W, H);
  const blk = 230 * S, road = 46 * S, ox = (M.x % (blk + road)) - road / 2 - blk / 2, oy = (M.y % (blk + road)) - road / 2 - blk / 2;
  q.fillStyle = '#5A5E66'; for (let x = ox - (blk + road); x < W; x += blk + road) q.fillRect(x + blk, 0, road, H); for (let y = oy - (blk + road); y < H; y += blk + road) q.fillRect(0, y + blk, W, road);
  // rooftops with sun shadows
  for (let x = ox - (blk + road), i = 0; x < W; x += blk + road, i++) for (let y = oy - (blk + road), j = 0; y < H; y += blk + road, j++) {
    for (let b = 0; b < 4; b++) { const r = mulberry(i * 31 + j * 7 + b), bx = x + (b % 2) * blk / 2 + 6 * S, by = y + Math.floor(b / 2) * blk / 2 + 6 * S, bw = blk / 2 - 12 * S, bh = blk / 2 - 12 * S;
      if (Math.hypot(bx + bw / 2 - M.x, by + bh / 2 - M.y) < M.R * 1.5) continue;
      q.fillStyle = 'rgba(0,0,0,.35)'; q.fillRect(bx + 10 * S, by + 10 * S, bw, bh); q.fillStyle = ['#C8735A', '#D9C9A8', '#A8B4BE', '#E2A85A', '#8A9AA8'][Math.floor(r() * 5)]; q.fillRect(bx, by, bw, bh);
      q.fillStyle = 'rgba(255,255,255,.18)'; q.fillRect(bx, by, bw, 4 * S); } }
  // plaza with the stage: the mark printed on the stage roof, crowd dots swarming around it
  q.fillStyle = '#CFC6B4'; K.circle(q, M.x, M.y, M.R * 1.45); q.fill();
  for (let i = 0; i < 380; i++) { const a = hash(i) * TAU, r = M.R * (1.08 + hash(i + 3) * .35), w = Math.sin(t * 3 + i) * .03;
    q.fillStyle = ['#E8553D', '#2A5CB3', '#F2B134', '#FFFFFF', '#2E8B57'][i % 5]; q.fillRect(M.x + Math.cos(a + w) * r, M.y + Math.sin(a + w) * r, 3.5 * S, 3.5 * S); }
  K.fillMark(q, M, '#F4F2EE', '#9A7FD8', { shadow: { c: 'rgba(0,0,0,.4)', b: 6 * S, x: 8 * S, y: 8 * S } });
  // time-lapse traffic streaks on the roads
  for (let i = 0; i < 40; i++) { const lane = i % 2, horiz = i % 4 < 2, sp = (2 + hash(i) * 2) * W, pos = (hash(i * 9) * W + t * sp * (lane ? 1 : -1)) % (W + 200 * S);
    q.fillStyle = ['#ff5a4a', '#ffffff', '#2a6ad8', '#f2d23a'][i % 4];
    if (horiz) { const y = oy + blk + road * (lane ? .3 : .7) + (Math.floor(i / 4) % 3) * (blk + road); q.fillRect(lane ? pos - 100 * S : W - pos, y - 3 * S, 16 * S, 6 * S); }
    else { const x = ox + blk + road * (lane ? .3 : .7) + (Math.floor(i / 4) % 4) * (blk + road); q.fillRect(x - 3 * S, lane ? pos - 100 * S : H - pos % H, 6 * S, 16 * S); } }
  // cloud shadow sweeping across
  const cx = lerp(-W * .3, W * 1.3, (t + .3) / 2.6), cs = q.createRadialGradient(cx, H * .4, 0, cx, H * .4, W * .35); cs.addColorStop(0, 'rgba(0,0,30,.25)'); cs.addColorStop(1, 'rgba(0,0,30,0)'); q.fillStyle = cs; q.fillRect(0, 0, W, H);
  g.save(); g.filter = 'saturate(1.35) contrast(1.08)'; g.drawImage(C, 0, 0); g.restore();
  // tilt-shift: graduated blur top and bottom
  for (const [y0, y1, b] of [[0, H * .16, 10], [H * .16, H * .26, 4], [H * .74, H * .84, 4], [H * .84, H, 10]]) { g.save(); g.beginPath(); g.rect(0, y0, W, y1 - y0); g.clip(); g.filter = `blur(${b * S}px) saturate(1.35)`; g.drawImage(C, 0, 0); g.restore(); }
}

// 40 IMPASTO — a reception in the rain: palette-knife planes, warm lamps against cool shadow, wet reflections
export function impasto(g, t, { W, H, M, S }) {
  const hor = H * .66;
  const bld = [[0, .30, .40], [.14, .22, .30], [.30, .34, .44], [.62, .66, .40], [.74, .86, .26], [.86, 1.0, .36]];
  const lamps = [[W * .2, H * .44], [W * .8, H * .42], [W * .5, H * .58]];
  const sceneTop = (x, y) => {
    let c = mix([28, 30, 72], [86, 52, 96], clamp(y / hor));
    for (const [x0, x1, top] of bld) if (x > x0 * W && x < x1 * W && y > top * H) { c = [24, 22, 38]; const wx = (x - x0 * W) % (44 * S), wy = (y - top * H) % (52 * S); if (wx > 14 * S && wx < 30 * S && wy > 14 * S && wy < 34 * S && hash(Math.floor(x / (44 * S)) * 7 + Math.floor(y / (52 * S))) > .45) c = [255, 196, 110]; }
    for (const [lx, ly] of lamps) { const d = Math.hypot(x - lx, y - ly); c = mix(c, [255, 190, 90], Math.max(0, 1 - d / (150 * S)) * .85); }
    const gm = Math.max(0, 1 - Math.abs(Math.hypot(x - M.x, y - M.y) - M.R) / (110 * S)); return mix(c, [210, 195, 255], gm * .6); };
  const scene = (x, y) => y < hor ? sceneTop(x, y) : mix([20, 22, 38], sceneTop(x + Math.sin(y * .05) * 12 * S, hor - (y - hor) * 1.3), .6);
  // underpainting: the scene in coarse flat planes first
  const UP = K.tex('impasto-under', 160, Math.round(160 * H / W), (q, w, h) => { for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { q.fillStyle = rgb(scene((x + .5) * W / w, (y + .5) * H / h)); q.fillRect(x, y, 1, 1); } });
  g.save(); g.filter = `blur(${10 * S}px)`; g.drawImage(UP, -20, -20, W + 40, H + 40); g.restore();
  const r = mulberry(40), n = 4200;
  for (let i = 0; i < n; i++) { const x = r() * W, y = r() * H, c = scene(x, y), j = (r() - .5) * 30, w = (18 + r() * 34) * S, h = (8 + r() * 14) * S, a = (y > hor ? Math.PI / 2 : 0) + (r() - .5) * .9;
    g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = rgb([c[0] + j, c[1] + j, c[2] + j]); K.poly(g, [[-w / 2, -h / 2], [w / 2, -h / 2 + 3 * S], [w / 2, h / 2], [-w / 2 + 4 * S, h / 2]]); g.fill();
    g.strokeStyle = `rgba(255,255,255,${.12 + r() * .1})`; g.lineWidth = 1.4 * S; g.beginPath(); g.moveTo(-w / 2, -h / 2); g.lineTo(w / 2, -h / 2 + 3 * S); g.stroke(); g.restore(); }
  // the mark as a lit sign, knife-laid: thick strokes inside each lens
  K.fillMark(g, M, '#F2E2C2', '#A994F0', { shadow: { c: 'rgba(230,210,255,.8)', b: 30 * S } });
  K.inMark(g, M, () => { const P = K.markPaths(); P.forEach((p, k) => { g.save(); g.clip(p); const rr = mulberry(k + 50); for (let i = 0; i < 70; i++) { const x = -100 + rr() * 200, y = -100 + rr() * 200, c = k === 3 ? [190, 170, 255] : [255, 236, 200];
    g.fillStyle = rgb([c[0] - rr() * 30, c[1] - rr() * 30, c[2] - rr() * 20]); g.save(); g.translate(x, y); g.rotate(K.ARC_DIR[k] + Math.PI / 2 + (rr() - .5) * .5); g.fillRect(-16, -6, 32, 12); g.restore(); } g.restore(); }); });
  // rain
  g.strokeStyle = 'rgba(220,225,255,.25)'; g.lineWidth = 1.2 * S; for (let i = 0; i < 160; i++) { const x = (hash(i) * W + t * 120 * S) % W, y = (hash(i + 7) * H + t * 1400 * S) % H; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 6 * S, y + 26 * S); g.stroke(); }
  K.vignette(g, W, H, .45);
}

// 41 BACKROOMS — a haunted-house build: camcorder tape, a fluorescent corridor, the only way out is lit
export function backrooms(g, t, { W, H, M, S }) {
  const sh = [Math.sin(t * 7) * 3 * S + Math.sin(t * 2.3) * 5 * S, Math.cos(t * 6) * 2 * S];
  g.save(); g.translate(sh[0], sh[1]);
  const vp = [M.x, M.y], wall = '#C9B66A', ceil = '#D8CFA2', floor = '#8C7A48';
  const D = Math.max(W, H) * 1.2, fr = (s) => [vp[0] + (s[0] - vp[0]), vp[1] + (s[1] - vp[1])];
  // one-point corridor
  g.fillStyle = ceil; K.poly(g, [[-D, -D], [W + D, -D], [vp[0] + M.R * 1.5, vp[1] - M.R * 1.2], [vp[0] - M.R * 1.5, vp[1] - M.R * 1.2]]); g.fill();
  g.fillStyle = floor; K.poly(g, [[-D, H + D], [W + D, H + D], [vp[0] + M.R * 1.5, vp[1] + M.R * 1.2], [vp[0] - M.R * 1.5, vp[1] + M.R * 1.2]]); g.fill();
  g.fillStyle = wall; K.poly(g, [[-D, -D], [vp[0] - M.R * 1.5, vp[1] - M.R * 1.2], [vp[0] - M.R * 1.5, vp[1] + M.R * 1.2], [-D, H + D]]); g.fill();
  g.fillStyle = '#BFAC60'; K.poly(g, [[W + D, -D], [vp[0] + M.R * 1.5, vp[1] - M.R * 1.2], [vp[0] + M.R * 1.5, vp[1] + M.R * 1.2], [W + D, H + D]]); g.fill();
  g.fillStyle = '#1a1608'; g.fillRect(vp[0] - M.R * 1.5, vp[1] - M.R * 1.2, M.R * 3, M.R * 2.4);
  // wallpaper stripes converging, fluorescent panels on the ceiling (one flickers)
  g.strokeStyle = 'rgba(120,100,40,.25)'; g.lineWidth = 2 * S; for (let i = 0; i < 16; i++) { const z = Math.pow(i / 16, 1.6), x = lerp(0, vp[0] - M.R * 1.5, z); g.beginPath(); g.moveTo(x, lerp(-D * .2, vp[1] - M.R * 1.2, z)); g.lineTo(x, lerp(H + D * .2, vp[1] + M.R * 1.2, z)); g.stroke(); const x2 = lerp(W, vp[0] + M.R * 1.5, z); g.beginPath(); g.moveTo(x2, lerp(-D * .2, vp[1] - M.R * 1.2, z)); g.lineTo(x2, lerp(H + D * .2, vp[1] + M.R * 1.2, z)); g.stroke(); }
  for (let i = 0; i < 5; i++) { const z = Math.pow((i + .5) / 5, 1.5), y = lerp(-H * .1, vp[1] - M.R * 1.25, z), w = lerp(W * .25, M.R * .6, z), h = lerp(70, 8, z) * S;
    const on = i === 2 ? (hash(Math.floor(t * 18)) > .3 ? 1 : .2) : 1; g.save(); g.fillStyle = `rgba(255,252,225,${.9 * on})`; g.shadowColor = 'rgba(255,250,200,.9)'; g.shadowBlur = 30 * S * on; g.fillRect(vp[0] - w / 2, y, w, h); g.restore(); }
  // the way out: the mark glowing at the end of the corridor
  K.fillMark(g, M, '#F6F4EF', '#B9A6FF', { shadow: { c: 'rgba(220,210,255,.9)', b: 50 * S } });
  g.fillStyle = 'rgba(60,50,20,.75)'; g.font = `600 ${22 * S}px Mono`; g.textAlign = 'left'; g.save(); g.translate(W * .08, H * .38); g.transform(1, .12, 0, 1, 0, 0); g.fillText('RULE 4: THE WAY OUT', 0, 0); g.fillText('IS ALWAYS LIT.', 0, 30 * S); g.restore();
  g.restore();
  // camcorder overlay
  g.fillStyle = 'rgba(0,0,0,.18)'; for (let y = 0; y < H; y += 4 * S) g.fillRect(0, y, W, 1.5 * S);
  const ty = ((t * .37) % 1) * H; g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(0, ty, W, 10 * S);
  g.font = `${36 * S}px VT323`; g.fillStyle = '#F2F2F2'; g.textAlign = 'left'; g.textBaseline = 'top';
  if (Math.floor(t * 2) % 2 === 0) { g.fillStyle = '#FF3B30'; K.circle(g, 70 * S, 74 * S, 10 * S); g.fill(); }
  g.fillStyle = '#F2F2F2'; g.fillText('REC', 92 * S, 56 * S); g.textAlign = 'right'; g.fillText('SP  0:41:' + String(Math.floor(t * 24) % 60).padStart(2, '0'), W - 60 * S, 56 * S);
  g.textAlign = 'left'; g.fillText('BUILD WEEK · DAY 3 · 03:14 AM', 70 * S, H - 120 * S);
  K.grainOver(g, W, H, t, .12, 'b'); K.vignette(g, W, H, .5);
}

// 42 ONE LINE — the idea: a single ink line enters, becomes a stage, climbs into the mark, leaves; it never lifts
export function oneLine(g, t, { W, H, M, S }) {
  g.fillStyle = '#FBFAF6'; g.fillRect(0, 0, W, H);
  const y0 = M.y + M.R * 1.35, R = M.R / 100;
  // the whole path: in from the left, a stage step, up into the ring tour, back down, out right
  const pts = [];
  for (let x = -20; x < M.x - M.R * 1.6; x += 8 * S) pts.push([x, y0]);
  pts.push([M.x - M.R * 1.6, y0 - 40 * S], [M.x - M.R * 1.1, y0 - 40 * S], [M.x - M.R * 1.1, y0], [M.x - M.R * .6, y0]);
  pts.push([M.x - M.R * .3, M.y + M.R * 1.0]);
  const tags = pts.map(() => 0), R100 = M.R / 100, D2R = Math.PI / 180, W0 = Math.atan2(67.7, -51.4);
  const ringPt = (a) => [M.x + Math.cos(a) * 100 * R100, M.y + Math.sin(a) * 100 * R100];
  const accAng = (a) => { const m = ((a % TAU) + TAU) % TAU; return m < HALF || m > TAU - HALF; };
  pts.push(ringPt(Math.PI / 2)); tags.push(0);
  for (let i = 0; i <= 200; i++) { const a = Math.PI / 2 + i / 200 * TAU; pts.push(ringPt(a)); tags.push(accAng(a) ? 1 : 0); }
  for (const k of [2, 3, 0, 1]) { const d = K.ARC_DIR[k], c = [M.x + Math.cos(d) * 125 * R100, M.y + Math.sin(d) * 125 * R100];
    for (let i = 0; i <= 40; i++) { const a = d + lerp(W0, TAU - W0, i / 40); pts.push([c[0] + Math.cos(a) * 85 * R100, c[1] + Math.sin(a) * 85 * R100]); tags.push(k === 3 ? 1 : 0); } }
  const tail = [[M.x + M.R * .3, M.y + M.R * 1.0], [M.x + M.R * .6, y0], [M.x + M.R * 1.1, y0], [M.x + M.R * 1.1, y0 - 40 * S], [M.x + M.R * 1.6, y0 - 40 * S], [M.x + M.R * 1.6, y0]];
  for (let x = M.x + M.R * 1.6; x < W + 20; x += 8 * S) tail.push([x, y0]);
  tail.forEach(p2 => { pts.push(p2); tags.push(0); });
  const n = Math.floor(clamp((t + .9) / 2.3) * pts.length);
  g.lineWidth = 4.5 * S; g.lineCap = 'round'; g.lineJoin = 'round';
  for (let i = 1; i < n; i++) { g.strokeStyle = tags[i] ? '#7B5CE0' : '#1D1A17'; g.beginPath(); g.moveTo(...pts[i - 1]); g.lineTo(...pts[i]); g.stroke(); }
  if (n > 0 && n < pts.length) { const [x, y] = pts[n - 1]; g.fillStyle = '#1D1A17'; K.circle(g, x, y, 6 * S); g.fill(); }
}

// 43 GLASS PRODUCT — the reveal: the mark as a glass object in a black studio, strip lights, a lit core, a caustic on the floor
export function glassProduct(g, t, { W, H, M, S }) {
  g.fillStyle = '#030304'; g.fillRect(0, 0, W, H);
  const sw = g.createRadialGradient(M.x, M.y, 0, M.x, M.y, Math.max(W, H) * .6); sw.addColorStop(0, '#16161c'); sw.addColorStop(1, '#030304'); g.fillStyle = sw; g.fillRect(0, 0, W, H);
  // strip lights behind and beside
  const sweep = lerp(-1.2, 1.2, (t % 3) / 3);
  for (const sx of [-1, 1]) { const x = M.x + sx * M.R * 2.3, gr = g.createLinearGradient(x - 30 * S, 0, x + 30 * S, 0); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.5, 'rgba(235,240,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(x - 30 * S, M.y - M.R * 1.9, 60 * S, M.R * 3.4); }
  const floorY = M.y + M.R * 1.32;
  // floor: black gloss, reflection, caustic ring
  const fl = g.createLinearGradient(0, floorY, 0, H); fl.addColorStop(0, '#0b0b10'); fl.addColorStop(1, '#030304'); g.fillStyle = fl; g.fillRect(0, floorY, W, H - floorY);
  g.save(); g.globalCompositeOperation = 'lighter';
  for (const [c, dr] of [['255,80,80', -4], ['80,255,140', 0], ['120,140,255', 4]]) { g.strokeStyle = `rgba(${c},.18)`; g.lineWidth = 3 * S; g.beginPath(); g.ellipse(M.x, floorY + 24 * S, M.R * (1.1 + .04 * Math.sin(t * 2)) + dr * S, M.R * .16, 0, 0, TAU); g.stroke(); }
  const cg = g.createRadialGradient(M.x, floorY + 24 * S, 0, M.x, floorY + 24 * S, M.R * 1.2); cg.addColorStop(0, 'rgba(160,140,255,.25)'); cg.addColorStop(1, 'rgba(160,140,255,0)'); g.fillStyle = cg; g.beginPath(); g.ellipse(M.x, floorY + 24 * S, M.R * 1.2, M.R * .2, 0, 0, TAU); g.fill();
  g.restore();
  const drawGlass = (MM, alpha) => {
    K.inMark(g, MM, () => { const P = K.markPaths();
      P.forEach((p, k) => { g.save(); g.globalAlpha = alpha; g.clip(p);
        // body: near-black glass with a faint inner gradient
        const d = K.ARC_DIR[k], body = g.createLinearGradient(Math.cos(d) * 60, Math.sin(d) * 60, Math.cos(d) * 100, Math.sin(d) * 100); body.addColorStop(0, k === 3 ? 'rgba(90,70,190,.55)' : 'rgba(40,42,52,.55)'); body.addColorStop(1, k === 3 ? 'rgba(170,150,255,.35)' : 'rgba(90,95,110,.3)');
        g.fillStyle = body; g.fill(p);
        // light travelling inside the accent lens: a comet along the arc
        if (k === 3) { const ph = ((t * .9) % 1), a = lerp(-HALF, HALF, ph); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 18; i++) { const aa = a - i * .03; g.fillStyle = `rgba(${200 + i * 2},${190},255,${.5 * Math.exp(-i * .2)})`; K.circle(g, Math.cos(aa) * 93, Math.sin(aa) * 93, 6 - i * .25); g.fill(); } }
        // strip-light reflections: the sweep slides across
        g.globalCompositeOperation = 'lighter'; const sx = sweep * 100; const rg = g.createLinearGradient(sx - 30, 0, sx + 30, 0); rg.addColorStop(0, 'rgba(255,255,255,0)'); rg.addColorStop(.5, 'rgba(255,255,255,.35)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = rg; g.fillRect(-120, -120, 240, 240);
        g.restore();
        // rim: white edge with dispersion fringes at the thick outer edge
        g.save(); g.globalAlpha = alpha; g.globalCompositeOperation = 'lighter'; g.lineWidth = 1.6;
        for (const [c, o] of [['255,90,90', -1.2], ['120,255,160', 0], ['120,150,255', 1.2]]) { g.strokeStyle = `rgba(${c},.35)`; g.beginPath(); g.arc(0, 0, 100 + o * .8, d - HALF + .02, d + HALF - .02); g.stroke(); }
        g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 1.1; g.stroke(p); g.restore(); }); });
  };
  // reflection on the floor first (flipped), then the object
  g.save(); g.translate(0, floorY * 2 + 20 * S); g.scale(1, -1); g.globalAlpha = .9; const rf = g.createLinearGradient(0, floorY, 0, floorY - M.R * 2); drawGlass(M, .22); g.restore();
  const fade = g.createLinearGradient(0, floorY, 0, H); fade.addColorStop(0, 'rgba(3,3,4,0)'); fade.addColorStop(.6, 'rgba(3,3,4,1)'); g.fillStyle = fade; g.fillRect(0, floorY, W, H - floorY);
  drawGlass(M, 1);
  // bloom on the core
  g.save(); g.globalCompositeOperation = 'lighter'; const [mx, my] = K.lensMid(3, 92); const bl = g.createRadialGradient(M.x + mx * M.R / 100, M.y, 0, M.x + mx * M.R / 100, M.y, M.R * .8); bl.addColorStop(0, 'rgba(150,130,255,.22)'); bl.addColorStop(1, 'rgba(150,130,255,0)'); g.fillStyle = bl; g.fillRect(0, 0, W, H); g.restore();
  // title, ultra-thin and wide, with a glint
  const tk = eo(seg(t, .6, 1.2)); if (tk > 0 && t < 3.2) { g.save(); g.globalAlpha = tk * (1 - seg(t, 2.6, 3.0)); g.font = `200 ${(64) * S}px InterTight`; g.fillStyle = '#E8E8EE'; g.textAlign = 'center'; g.textBaseline = 'middle'; K.track(g, 'THE REVEAL', M.x, M.y - M.R * 1.7, .5); g.restore(); }
}
