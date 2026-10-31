// Act 1 — precision and craft, one bar (2 s) each. Every world draws the mark in its own material at the same place.
import * as K from './kit.js';
const { clamp, lerp, seg, ss, eio, eo, ei, back, mulberry, hash, TAU, rgb, hex, mix, fbm, vn2 } = K;

// 01 DARK KEYNOTE — a product launch: black stage, hairline grid, a cue dot that becomes the lit lens
export function darkKeynote(g, t, { W, H, M, S }) {
  g.fillStyle = '#0A0B0F'; g.fillRect(0, 0, W, H);
  const lift = g.createRadialGradient(W / 2, H * .2, 0, W / 2, H * .2, Math.max(W, H) * .8); lift.addColorStop(0, '#161925'); lift.addColorStop(1, 'rgba(22,25,37,0)'); g.fillStyle = lift; g.fillRect(0, 0, W, H);
  const gl = g.createRadialGradient(W * .8, H * .15, 0, W * .8, H * .15, Math.max(W, H) * .5); gl.addColorStop(0, 'rgba(70,60,200,.08)'); gl.addColorStop(1, 'rgba(70,60,200,0)'); g.fillStyle = gl; g.fillRect(0, 0, W, H);
  const s = 48 * S, ox = (W / 2) % s, oy = (M.y) % s; g.lineWidth = 1;
  for (let x = ox, i = 0; x < W; x += s, i++) { g.strokeStyle = `rgba(255,255,255,${i % 4 ? .028 : .055})`; g.beginPath(); g.moveTo(x + .5, 0); g.lineTo(x + .5, H); g.stroke(); }
  for (let y = oy, i = 0; y < H; y += s, i++) { g.strokeStyle = `rgba(255,255,255,${i % 4 ? .028 : .055})`; g.beginPath(); g.moveTo(0, y + .5); g.lineTo(W, y + .5); g.stroke(); }
  // the cue dot blinks on the beat, squashes, GO at 1.0 s: the accent lens grows out of it, the light sweep reveals the rest
  const acc = [139, 124, 255], go = 1.0, mid = K.lensMid(3, 72), dx = M.x + mid[0] * M.R / 100, dy = M.y;
  if (t < go + .05) {
    const on = Math.floor(t / .5) % 2 === 0, wu = seg(t, go - 8 / 24, go), sx = 1 + .4 * ei(wu), sy = 1 - .45 * ei(wu);
    g.save(); g.translate(dx, dy); g.scale(sx, sy); g.shadowColor = rgb(acc, .7); g.shadowBlur = 24 * S;
    g.fillStyle = rgb(acc, on || wu > 0 ? 1 : .35); K.circle(g, 0, 0, 11 * S); g.fill(); g.restore();
  }
  const grow = eo(seg(t, go, go + .45));
  if (grow > 0) {
    K.inMark(g, M, () => { const P = K.markPaths(); g.save(); g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 140, -1.2 * grow, 1.2 * grow); g.closePath(); g.clip();
      g.shadowColor = rgb(acc, .6); g.shadowBlur = 40; g.fillStyle = rgb(acc); g.fill(P[3]); g.restore(); });
    const front = lerp(M.x - M.R * 1.6, M.x + M.R * 1.6, eo(seg(t, go + .15, go + 1.25)));
    g.save(); g.beginPath(); g.rect(0, 0, front, H); g.clip();
    const lg = g.createLinearGradient(front - M.R * 1.4, 0, front, 0); lg.addColorStop(0, '#ECEEF4'); lg.addColorStop(.85, '#FFFFFF'); lg.addColorStop(1, 'rgba(255,255,255,.25)');
    K.fillMark(g, M, lg, 'rgba(0,0,0,0)', { only: [0, 1, 2] }); g.restore();
    // glint riding the front
    const gx = front; const gg = g.createRadialGradient(gx, M.y, 0, gx, M.y, M.R * 1.2); gg.addColorStop(0, 'rgba(200,210,255,.10)'); gg.addColorStop(1, 'rgba(200,210,255,0)');
    if (t < go + 1.3) { g.fillStyle = gg; g.fillRect(0, 0, W, H); }
  }
  K.vignette(g, W, H, .55);
}

// 02 HOLOGRAM HUD — a tech summit: one cyan, hairlines, target boxes, numbers rolling out of glyph noise
export function hologram(g, t, { W, H, M, S }) {
  const cy = [95, 243, 255];
  g.fillStyle = '#03080D'; g.fillRect(0, 0, W, H);
  const bg = g.createRadialGradient(M.x, M.y, 0, M.x, M.y, Math.max(W, H) * .7); bg.addColorStop(0, 'rgba(20,70,90,.35)'); bg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  // floor grid in perspective
  g.lineWidth = 1;
  for (let i = -14; i <= 14; i++) { g.strokeStyle = rgb(cy, .08); g.beginPath(); g.moveTo(M.x + i * 18 * S, M.y + M.R * 1.25); g.lineTo(M.x + i * 140 * S, H); g.stroke(); }
  for (let j = 0; j < 9; j++) { const y = M.y + M.R * 1.25 + (H - M.y - M.R * 1.25) * Math.pow(j / 8, 1.8); g.strokeStyle = rgb(cy, .08); g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  // wireframe: the mark as stacked slices turning in depth
  const rot = t * .9 + .4;
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let z = -3; z <= 3; z++) {
    const sx = Math.cos(rot) , off = Math.sin(rot) * z * 6 * S;
    g.save(); g.translate(M.x + off, M.y - z * 2.5 * S); g.scale(M.R / 100 * (.6 + .4 * Math.abs(sx)) * (1 - Math.abs(z) * .012), M.R / 100);
    const P = K.markPaths(); g.lineWidth = 1.2 * 100 / M.R; P.forEach((p, k) => { g.strokeStyle = rgb(k === 3 ? [200, 190, 255] : cy, z === 0 ? .9 : .22); g.stroke(p); });
    g.restore();
  }
  // scan band
  const sy = M.y - M.R * 1.3 + ((t * .9) % 1) * M.R * 2.6;
  const sg = g.createLinearGradient(0, sy - 30 * S, 0, sy + 30 * S); sg.addColorStop(0, rgb(cy, 0)); sg.addColorStop(.5, rgb(cy, .22)); sg.addColorStop(1, rgb(cy, 0));
  g.fillStyle = sg; g.fillRect(M.x - M.R * 1.4, sy - 30 * S, M.R * 2.8, 60 * S);
  g.restore();
  // target boxes lock on the lenses one per beat, leaders and rolling numbers
  const labels = ['PLAN', 'BUILD', 'RUN', 'WOW'], vals = ['01.000', '02.000', '03.000', '∞'];
  g.font = `500 ${15 * S}px Mono`; g.textBaseline = 'middle';
  for (let k = 0; k < 4; k++) {
    const lt = t - .2 - k * .3; if (lt < 0) continue;
    const [mx, my] = K.lensMid(k, 72), x = M.x + mx * M.R / 100, y = M.y + my * M.R / 100, b = lerp(90, 34, eo(seg(lt, 0, .25))) * S;
    g.strokeStyle = rgb(cy, .9); g.lineWidth = 1.5;
    for (const [sxn, syn] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { g.beginPath(); g.moveTo(x + sxn * b, y + syn * b * .6); g.lineTo(x + sxn * b, y + syn * b); g.lineTo(x + sxn * b * .6, y + syn * b); g.stroke(); }
    const lx = x + Math.sign(mx || 1) * M.R * .95 + (k === 0 || k === 2 ? M.R * .9 : 0), ly = y + (k === 0 ? -M.R * .25 : k === 2 ? M.R * .25 : 0), lk = eo(seg(lt, .15, .4));
    g.beginPath(); g.moveTo(x + Math.sign(lx - x) * b, y); g.lineTo(lerp(x, lx, lk), lerp(y, ly, lk)); g.stroke();
    if (lk > .9) { const roll = seg(lt, .4, .8), txt = vals[k].split('').map((ch, i) => roll * vals[k].length > i ? ch : '#%&@$0'[Math.floor(hash(i + Math.floor(t * 24)) * 6)]).join('');
      g.fillStyle = rgb(cy); g.textAlign = lx > x ? 'left' : 'right'; const tx = lx + (lx > x ? 10 : -10) * S;
      g.fillText(labels[k], tx, ly - 11 * S); g.fillStyle = rgb(cy, .65); g.fillText(txt, tx, ly + 11 * S); }
  }
  g.fillStyle = rgb(cy, .5); g.font = `500 ${13 * S}px Mono`; g.textAlign = 'left'; K.track(g, 'SCAN 02 · SUMMIT HALL · LOCK ' + Math.min(4, Math.floor(clamp(t - .2) / .3 + (t > .2 ? 1 : 0))) + '/4', 40 * S, 52 * S, .12);
  K.vignette(g, W, H, .6);
}

// 03 ASCII CRT — a hackathon: the mark exists only as glyph density on a phosphor grid
export function asciiCrt(g, t, { W, H, M, S }) {
  const ph = [255, 176, 0];
  g.fillStyle = '#0B0700'; g.fillRect(0, 0, W, H);
  g.font = `${24 * S}px VT323`; const cw = g.measureText('M').width, ch = 22 * S, cols = Math.ceil(W / cw), rows = Math.ceil(H / ch), ramp = ' .:-=+*#%@'; g.textBaseline = 'top'; g.textAlign = 'left';
  g.save(); g.shadowColor = rgb(ph, .8); g.shadowBlur = 8 * S;
  const reveal = (t + .3) * 30;   // rows typed in from the top
  for (let r = 0; r < rows; r++) {
    let line = ''; const typed = r <= reveal;
    const y = r * ch + ch / 2;
    for (let c = 0; c < cols; c++) {
      const x = c * cw + cw / 2, mx = (x - M.x) * 100 / M.R, my = (y - M.y) * 100 / M.R;
      let d = 0; for (const [ox, oy] of [[-.3, -.3], [.3, -.3], [-.3, .3], [.3, .3], [0, 0]]) d += K.markHit(mx + ox * cw * 100 / M.R, my + oy * ch * 100 / M.R) >= 0 ? .2 : 0;
      const rr = Math.hypot(mx, my), halo = Math.max(0, 1 - Math.abs(rr - 112) / 14) * .25;
      line += d > 0 ? ramp[Math.min(9, Math.round(d * 9))] : typed && halo > .1 && hash(c * 7 + r * 13) < halo * 3 ? '.' : ' ';
    }
    g.fillStyle = rgb(ph, .95); g.fillText(line, 0, r * ch);
  }
  g.restore();
  // terminal log (top left) types, with a block cursor
  const log = ['> call show --venue hall_b', '  guests ........ 1,200', '  stage ......... ready', '  power ......... ok', '> go'];
  g.font = `${26 * S}px VT323`; g.fillStyle = '#0B0700'; g.fillRect(28 * S, 28 * S, 440 * S, 170 * S);
  g.fillStyle = rgb(ph); g.shadowColor = rgb(ph, .8); g.shadowBlur = 8 * S;
  let n = Math.floor(Math.max(0, t + .2) * 34);
  log.forEach((l, i) => { const s = l.slice(0, Math.max(0, n)); n -= l.length; g.fillText(s, 40 * S, 40 * S + i * 28 * S); });
  if (Math.floor(t * 4) % 2 === 0) g.fillRect(40 * S + 10 * S, 40 * S + 5 * 28 * S, 12 * S, 22 * S);
  g.shadowBlur = 0;
  // scanlines + curvature vignette
  g.fillStyle = 'rgba(0,0,0,.28)'; for (let y = 0; y < H; y += 3 * S) g.fillRect(0, y, W, 1.2 * S);
  K.vignette(g, W, H, .75, .3);
}

// 04 BLUEPRINT — the venue build: white technical line on cyanotype, drawn in drafting order
export function blueprint(g, t, { W, H, M, S }) {
  const bg = g.createLinearGradient(0, 0, W, H); bg.addColorStop(0, '#16306A'); bg.addColorStop(1, '#2A58A6'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.save(); g.globalAlpha = .35; g.globalCompositeOperation = 'overlay'; g.drawImage(K.paper('cyan', 960, 540, [128, 128, 128], { mottle: 40, grain: 26, seed: 4 }), 0, 0, W, H); g.restore();
  const s = 40 * S; g.lineWidth = 1;
  for (let x = (M.x % s); x < W; x += s) { g.strokeStyle = 'rgba(230,240,255,.07)'; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
  for (let y = (M.y % s); y < H; y += s) { g.strokeStyle = 'rgba(230,240,255,.07)'; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  const ink = 'rgba(236,244,255,.95)', k = (a, b) => eo(seg(t, a, b));
  g.strokeStyle = 'rgba(236,244,255,.45)'; g.setLineDash([14 * S, 6 * S, 3 * S, 6 * S]);
  const c1 = k(-.2, .3); g.beginPath(); g.moveTo(M.x - M.R * 1.5 * c1, M.y); g.lineTo(M.x + M.R * 1.5 * c1, M.y); g.moveTo(M.x, M.y - M.R * 1.5 * c1); g.lineTo(M.x, M.y + M.R * 1.5 * c1); g.stroke();
  g.setLineDash([]);
  // compass circles
  g.strokeStyle = 'rgba(236,244,255,.5)'; g.beginPath(); g.arc(M.x, M.y, M.R, -Math.PI / 2, -Math.PI / 2 + TAU * k(.05, .55)); g.stroke();
  K.strokeMark(g, M, 'rgba(236,244,255,.38)', 1.2 * S);
  // the four lenses, inked one after another
  K.inMark(g, M, () => { const P = K.markPaths(); g.lineWidth = 2.2 * 100 / M.R; g.strokeStyle = ink;
    P.forEach((p, i) => { const a = k(-.1 + i * .1, .12 + i * .1); if (a <= 0) return; g.save(); g.beginPath(); g.moveTo(0, 0); const d = K.ARC_DIR[i]; g.arc(0, 0, 150, d - 1.3 * a, d + 1.3 * a); g.closePath(); g.clip(); g.stroke(p);
      if (i === 3) { g.clip(p); g.lineWidth = 1 * 100 / M.R; for (let h = -140; h < 140; h += 7) { g.beginPath(); g.moveTo(h, -140); g.lineTo(h + 140, 0); g.stroke(); } } g.restore(); }); });
  // dimension line + annotations
  const dk = k(.9, 1.3);
  if (dk > 0) { const y = M.y + M.R * 1.32; g.strokeStyle = ink; g.lineWidth = 1.2; g.beginPath(); g.moveTo(M.x - M.R * dk, y); g.lineTo(M.x + M.R * dk, y); g.stroke();
    for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(M.x + sx * M.R, y - 10 * S); g.lineTo(M.x + sx * M.R, y + 10 * S); g.stroke(); }
    g.font = `500 ${15 * S}px Mono`; g.fillStyle = ink; g.textAlign = 'center'; g.globalAlpha = dk; K.track(g, 'Ø 12 000  ·  RIG RING, HALL B', M.x, y + 26 * S, .1); g.globalAlpha = 1; }
  [[3, 1.0], [0, 1.15], [1, 1.25]].forEach(([i, a0], n) => { const a = k(a0, a0 + .25); if (a <= 0) return; const [mx, my] = K.lensMid(i, 72), x = M.x + mx * M.R / 100, y = M.y + my * M.R / 100;
    const bx = x + (i === 1 ? -1 : 1) * M.R * .75, by = y - M.R * .55; g.strokeStyle = ink; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(lerp(x, bx, a), lerp(y, by, a)); g.stroke();
    if (a > .95) { K.circle(g, bx, by, 16 * S); g.stroke(); g.font = `600 ${15 * S}px Mono`; g.fillStyle = ink; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(n + 1), bx, by); } });
  // title block
  g.strokeStyle = 'rgba(236,244,255,.6)'; g.lineWidth = 1; const bw = 300 * S, bh = 86 * S, bx = W - bw - 40 * S, by = H - bh - 40 * S; g.strokeRect(bx, by, bw, bh);
  g.beginPath(); g.moveTo(bx, by + bh / 2); g.lineTo(bx + bw, by + bh / 2); g.stroke();
  g.font = `600 ${15 * S}px Mono`; g.fillStyle = 'rgba(236,244,255,.85)'; g.textAlign = 'left'; g.textBaseline = 'middle';
  K.track(g, 'PURPLEHAT · VENUE BUILD', bx + 14 * S, by + bh / 4, .1); K.track(g, 'FIG. 04   SCALE 1:50', bx + 14 * S, by + bh * .75, .1);
}

// 05 ART DECO — the 1930s gala: black lacquer, a gold sunburst behind the mark, setback towers, bulbs switching on
export function artDeco(g, t, { W, H, M, S }) {
  g.fillStyle = '#0B0907'; g.fillRect(0, 0, W, H);
  const gold = (y0, y1) => { const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, '#F6E3A1'); gr.addColorStop(.45, '#C9A23F'); gr.addColorStop(.55, '#8C6A1E'); gr.addColorStop(1, '#E9C86A'); return gr; };
  // sunburst rays open along the axis
  const open = eo(seg(t, -.1, .7)), n = 36;
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i - n / 2 + .5) / n * Math.PI * 2 * open, w = Math.PI / n * .55 * open, L = Math.hypot(W, H);
    const gr = g.createRadialGradient(M.x, M.y, M.R, M.x, M.y, L * .7); gr.addColorStop(0, `rgba(214,175,70,${i % 2 ? .5 : .28})`); gr.addColorStop(1, 'rgba(214,175,70,0)');
    g.fillStyle = gr; K.poly(g, [[M.x + Math.cos(a - w) * M.R * 1.15, M.y + Math.sin(a - w) * M.R * 1.15], [M.x + Math.cos(a) * L, M.y + Math.sin(a) * L], [M.x + Math.cos(a + w) * M.R * 1.15, M.y + Math.sin(a + w) * M.R * 1.15]]); g.fill();
  }
  // setback towers, mirrored about the axis
  for (const sx of [-1, 1]) {
    const steps = [[1.75, .95], [2.15, .55], [2.6, .25], [3.2, 0]];
    steps.forEach(([dx, top], i) => { const x0 = M.x + sx * M.R * dx, w = M.R * .42, y0 = lerp(H, M.y - M.R * (1.1 - top), eo(seg(t, i * .08, .55 + i * .08)));
      g.fillStyle = '#14100A'; g.fillRect(sx > 0 ? x0 - w : x0, y0, w, H - y0);
      g.strokeStyle = gold(y0, H); g.lineWidth = 1.6 * S; g.strokeRect(sx > 0 ? x0 - w : x0, y0, w, H - y0);
      for (let l = 1; l < 4; l++) { const lx = (sx > 0 ? x0 - w : x0) + w * l / 4; g.beginPath(); g.moveTo(lx, y0 + 12 * S); g.lineTo(lx, H); g.globalAlpha = .4; g.stroke(); g.globalAlpha = 1; }
      // chevron crown
      g.beginPath(); const cx = (sx > 0 ? x0 - w / 2 : x0 + w / 2); for (let c = 0; c < 3; c++) { g.moveTo(cx - w * .35, y0 + (10 + c * 10) * S); g.lineTo(cx, y0 + c * 10 * S); g.lineTo(cx + w * .35, y0 + (10 + c * 10) * S); } g.stroke(); });
  }
  // marquee bulbs around the frame, switching on one by one
  const per = 2 * (W + H), step = 34 * S, nb = Math.floor(per / step), on = Math.floor(clamp((t + .1) / 1.2) * nb);
  for (let i = 0; i < nb; i++) { let d = i * step, x, y; const m = 18 * S;
    if (d < W) { x = d; y = m; } else if ((d -= W) < H) { x = W - m; y = d; } else if ((d -= H) < W) { x = W - d; y = H - m; } else { d -= W; x = m; y = H - d; }
    const lit = i < on; g.fillStyle = lit ? '#FFE9A8' : '#3A2E14'; if (lit) { g.shadowColor = 'rgba(255,214,120,.9)'; g.shadowBlur = 12 * S; } K.circle(g, x, y, 4.5 * S); g.fill(); g.shadowBlur = 0; }
  // the mark in gold leaf, accent lens in lavender enamel edged in gold
  K.fillMark(g, M, gold(M.y - M.R, M.y + M.R), '#D7CFFF');
  K.strokeMark(g, M, '#F6E3A1', 2 * S);
  K.inMark(g, M, () => { g.strokeStyle = 'rgba(246,227,161,.6)'; g.lineWidth = 1.5 * 100 / M.R; g.beginPath(); g.arc(0, 0, 118, 0, TAU); g.stroke(); g.beginPath(); g.arc(0, 0, 126, 0, TAU); g.stroke(); });
  g.font = `${44 * S}px Limelight`; g.fillStyle = gold(M.y + M.R * 1.3, M.y + M.R * 1.6); g.textAlign = 'center'; g.textBaseline = 'middle';
  g.globalAlpha = eo(seg(t, .5, .9)); K.track(g, 'THE GALA', M.x, M.y + M.R * 1.5, .3); g.globalAlpha = 1;
  K.vignette(g, W, H, .55);
}

// 06 STAINED GLASS — an awards hall: the mark is the rose window; only what the sun touches is alive
export function stainedGlass(g, t, { W, H, M, S }) {
  g.fillStyle = '#0D0B0A'; g.fillRect(0, 0, W, H);
  g.save(); g.globalAlpha = .5; g.drawImage(K.paper('stone', 640, 360, [40, 36, 33], { mottle: 30, grain: 30, seed: 6, scale: .4 }), 0, 0, W, H); g.restore();
  // stone courses
  g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 2 * S; for (let y = 0, r = 0; y < H; y += 46 * S, r++) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); for (let x = (r % 2) * 60 * S; x < W; x += 120 * S) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 46 * S); g.stroke(); } }
  const sun = lerp(-.6, .6, (t + .3) / 2.3);   // the beam's angle drifts: light is the clock
  const R2 = M.R * 1.32, pal = [[38, 70, 160], [150, 24, 38], [220, 170, 40], [30, 120, 80], [110, 40, 140]];
  // rose window: outer petals (pie cells) + the mark lenses as clear gold glass, accent lens violet
  g.save(); g.beginPath(); g.arc(M.x, M.y, R2, 0, TAU); g.clip();
  const n = 24;
  for (let ring = 0; ring < 3; ring++) for (let i = 0; i < n; i++) {
    const a0 = i / n * TAU + ring * .13, a1 = (i + 1) / n * TAU + ring * .13, r0 = R2 * [0, .5, .78][ring], r1 = R2 * [.5, .78, 1][ring];
    const c = pal[(i * 7 + ring * 3) % 5], lit = .35 + .65 * Math.max(0, Math.cos((a0 - Math.PI * .75) - sun * 2)) ;
    g.fillStyle = rgb(mix([10, 8, 8], c, lit)); g.beginPath(); g.arc(M.x, M.y, r1, a0, a1); g.arc(M.x, M.y, r0, a1, a0, true); g.closePath(); g.fill();
    g.strokeStyle = '#151210'; g.lineWidth = 5 * S; g.stroke();
  }
  g.restore();
  const lit = .65 + .35 * Math.sin(t * 1.4);
  K.fillMark(g, M, rgb(mix([60, 45, 15], [255, 222, 140], lit)), rgb(mix([40, 20, 70], [200, 170, 255], lit)), { shadow: { c: 'rgba(255,220,150,.5)', b: 30 * S } });
  K.strokeMark(g, M, '#141110', 6 * S);
  g.strokeStyle = '#141110'; g.lineWidth = 12 * S; K.circle(g, M.x, M.y, R2); g.stroke();
  g.strokeStyle = 'rgba(160,140,120,.35)'; g.lineWidth = 2 * S; K.circle(g, M.x, M.y, R2 + 12 * S); g.stroke();
  // god rays + coloured pools on the floor
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 7; i++) { const a = Math.PI * .35 + sun * .2 + (i - 3) * .05, L = Math.hypot(W, H);
    const gr = g.createLinearGradient(M.x, M.y, M.x + Math.cos(a) * L * .6, M.y + Math.sin(a) * L * .6); gr.addColorStop(0, rgb(pal[i % 5], .14)); gr.addColorStop(1, rgb(pal[i % 5], 0));
    g.fillStyle = gr; K.poly(g, [[M.x + (i - 3) * 20 * S, M.y], [M.x + Math.cos(a - .04) * L, M.y + Math.sin(a - .04) * L], [M.x + Math.cos(a + .04) * L, M.y + Math.sin(a + .04) * L]]); g.fill(); }
  g.restore();
  K.vignette(g, W, H, .7, .25);
}

// 07 PAPER LANTERN — a night festival shadow box: layered card, warm light burning through, the mark is the moon
export function paperLantern(g, t, { W, H, M, S }) {
  const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#0a1330'); sky.addColorStop(1, '#3a4f8a'); g.fillStyle = sky; g.fillRect(0, 0, W, H);
  // backlight glow
  const gl = g.createRadialGradient(M.x, M.y, M.R * .2, M.x, M.y, M.R * 3.2); gl.addColorStop(0, 'rgba(255,200,110,.95)'); gl.addColorStop(.25, 'rgba(255,184,98,.35)'); gl.addColorStop(1, 'rgba(255,184,98,0)'); g.fillStyle = gl; g.fillRect(0, 0, W, H);
  // moon = the mark, burnt through the back layer
  K.fillMark(g, M, '#FFE2A8', '#E8DCFF', { shadow: { c: 'rgba(255,200,120,.9)', b: 40 * S } });
  // layers of cut card, darker toward the front, each throwing a soft shadow on the next
  const cols = ['#24345f', '#1b284b', '#14203d', '#0e1532', '#0a0f24'], drift = Math.sin(t * .8) * 6 * S;
  cols.forEach((c, L) => {
    const base = H * (.73 + L * .06), amp = (52 - L * 6) * S, par = drift * (L + 1) * .5;
    g.save(); g.shadowColor = 'rgba(0,0,0,.55)'; g.shadowBlur = 18 * S; g.shadowOffsetY = -4 * S; g.fillStyle = c;
    g.beginPath(); g.moveTo(-20, H);
    for (let x = -20; x <= W + 20; x += 10 * S) { const n = fbm((x + par) / (260 * S) + L * 7, L) ; g.lineTo(x + par, base - n * amp * 2.2 + (L === 1 ? -Math.max(0, 1 - Math.abs(x - W * .2) / (140 * S)) * 150 * S : 0)); }
    g.lineTo(W + 20, H); g.closePath(); g.fill();
    // pagoda eaves on layer 3, lit windows
    if (L === 3) { for (const px of [W * .16, W * .84]) { const ph = 3; for (let f = 0; f < ph; f++) { const y = base - 40 * S - f * 52 * S, w = (120 - f * 22) * S;
      g.beginPath(); g.moveTo(px - w, y); g.quadraticCurveTo(px - w * .4, y - 14 * S, px, y - 22 * S); g.quadraticCurveTo(px + w * .4, y - 14 * S, px + w, y); g.lineTo(px + w * .55, y); g.lineTo(px + w * .55, y + 44 * S); g.lineTo(px - w * .55, y + 44 * S); g.lineTo(px - w * .55, y); g.closePath(); g.fill();
        g.save(); g.shadowBlur = 14 * S; g.shadowColor = 'rgba(255,190,100,.9)'; g.fillStyle = 'rgba(255,200,120,.9)'; for (let wi = -1; wi <= 1; wi++) g.fillRect(px + wi * 22 * S - 6 * S, y + 14 * S, 12 * S, 18 * S); g.restore(); g.fillStyle = c; } } }
    g.restore();
  });
  // floating lanterns rise
  for (let i = 0; i < 14; i++) { const r = mulberry(40 + i), x = r() * W, y = H - ((t * (40 + r() * 50) * S + r() * H) % (H * 1.1)), s = (8 + r() * 10) * S;
    g.save(); g.shadowColor = 'rgba(255,170,80,.9)'; g.shadowBlur = 16 * S; g.fillStyle = 'rgba(255,190,110,.9)'; K.rr(g, x - s / 2, y - s * .7, s, s * 1.3, s * .3); g.fill(); g.restore(); }
  // the box frame (the frame is the box)
  g.strokeStyle = '#05070f'; g.lineWidth = 34 * S; g.strokeRect(0, 0, W, H);
  g.strokeStyle = 'rgba(255,220,170,.12)'; g.lineWidth = 2 * S; g.strokeRect(17 * S, 17 * S, W - 34 * S, H - 34 * S);
  K.vignette(g, W, H, .5);
}

// 08 SHADOW PUPPET — a cultural night: oil-lamp light on cotton, carved translucent figures presenting the mark
export function shadowPuppet(g, t, { W, H, M, S }) {
  const fl = .92 + .08 * Math.sin(t * 13) * Math.sin(t * 7.3);
  g.fillStyle = '#2a1206'; g.fillRect(0, 0, W, H);
  const lamp = g.createRadialGradient(M.x, M.y * .9, 0, M.x, M.y, Math.max(W, H) * .65); lamp.addColorStop(0, `rgba(255,214,150,${fl})`); lamp.addColorStop(.5, `rgba(226,140,60,${.85 * fl})`); lamp.addColorStop(1, 'rgba(90,30,8,1)');
  g.fillStyle = lamp; g.fillRect(0, 0, W, H);
  g.save(); g.globalAlpha = .25; g.globalCompositeOperation = 'multiply'; g.drawImage(K.paper('cotton', 640, 360, [200, 190, 175], { mottle: 30, grain: 40, seed: 8 }), 0, 0, W, H); g.restore();
  // the mark as carved hide: dyed red/indigo translucent with lace holes
  const hide = (c) => c;
  K.fillMark(g, M, 'rgba(120,20,10,.88)', 'rgba(80,40,140,.85)');
  K.inMark(g, M, () => { g.fillStyle = 'rgba(255,220,160,.85)'; const P = K.markPaths();
    for (let k = 0; k < 4; k++) { g.save(); g.clip(P[k]); for (let i = 0; i < 9; i++) { const a = K.ARC_DIR[k] + (i - 4) * .085; const r = 92 - (i % 2) * 6; K.circle(g, Math.cos(a) * r * .8, Math.sin(a) * r * .8, 2.6); g.fill(); } g.restore(); } });
  K.strokeMark(g, M, 'rgba(40,8,2,.9)', 3 * S);
  // two profile figures on rods, hands raised to the ring; moving on twos
  const tt = K.twos(t, 12);
  for (const sx of [-1, 1]) {
    const bx = M.x + sx * M.R * 2.05, by = M.y + M.R * .55 + Math.sin(tt * 3 + sx) * 6 * S;
    g.save(); g.translate(bx, by); g.scale(-sx * S, S);
    g.fillStyle = sx < 0 ? 'rgba(30,60,40,.88)' : 'rgba(110,30,20,.88)';
    // robe
    g.beginPath(); g.moveTo(-40, -60); g.quadraticCurveTo(-70, 60, -80, 190); g.lineTo(60, 190); g.quadraticCurveTo(40, 60, 30, -60); g.closePath(); g.fill();
    // head in profile with headdress
    g.beginPath(); g.ellipse(0, -100, 34, 40, 0, 0, TAU); g.fill(); g.beginPath(); g.moveTo(-30, -130); g.lineTo(10, -190); g.lineTo(36, -130); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(-34, -100); g.lineTo(-52, -92); g.lineTo(-34, -84); g.fill();
    // lace holes in robe
    g.fillStyle = 'rgba(255,215,150,.9)'; for (let i = 0; i < 12; i++) { K.circle(g, -30 + (i % 4) * 18, 10 + Math.floor(i / 4) * 40, 4); g.fill(); }
    // arm reaching toward the ring, jointed at elbow
    const reach = .5 + .5 * Math.sin(tt * 2.2 + (sx > 0 ? 1 : 0));
    g.strokeStyle = sx < 0 ? 'rgba(30,60,40,.9)' : 'rgba(110,30,20,.9)'; g.lineWidth = 14; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-20, -40); g.lineTo(-90, -60 - 30 * reach); g.lineTo(-150, -120 - 20 * reach); g.stroke();
    // control rods
    g.strokeStyle = 'rgba(30,10,4,.6)'; g.lineWidth = 3; g.beginPath(); g.moveTo(-150, -120 - 20 * reach); g.lineTo(-170, 400); g.moveTo(0, -60); g.lineTo(10, 400); g.stroke();
    g.restore();
  }
  // screen edge (wood frame)
  g.strokeStyle = '#1a0a03'; g.lineWidth = 30 * S; g.strokeRect(0, 0, W, H);
  K.vignette(g, W, H, .55, .3, '40,10,0');
}

// 09 PAPERCUT RED — a new-year gala: a fold-symmetric red window flower, the mark is cut out of it
export function papercut(g, t, { W, H, M, S }) {
  g.drawImage(K.paper('rice', 960, 540, [240, 228, 205], { mottle: 14, grain: 10, fibres: 2500, seed: 9 }), 0, 0, W, H);
  const red = '#C8102E', open = eo(seg(t, -.1, .6));
  g.save(); g.shadowColor = 'rgba(80,0,0,.35)'; g.shadowBlur = 10 * S; g.shadowOffsetY = 6 * S;
  // rosette layer drawn as an offscreen cut (holes punched with destination-out)
  const C = K.canvas(W, H), q = C.getContext('2d'), Rr = M.R * 1.75 * lerp(.66, 1, open);
  q.fillStyle = red; q.beginPath();
  const n = 16; for (let i = 0; i <= n * 8; i++) { const a = i / (n * 8) * TAU, w = (i % 8 < 4 ? 1 : .86) - .1 * Math.cos(a * n); q.lineTo(M.x + Math.cos(a) * Rr * w, M.y + Math.sin(a) * Rr * w); } q.closePath(); q.fill();
  q.globalCompositeOperation = 'destination-out';
  // crescents and swirls in rings (yin cutting)
  for (let i = 0; i < n; i++) { const a = i / n * TAU + .1 * Math.sin(t), r1 = Rr * .86;
    q.beginPath(); q.arc(M.x + Math.cos(a) * r1, M.y + Math.sin(a) * r1, Rr * .07, 0, TAU); q.fill();
    q.beginPath(); q.ellipse(M.x + Math.cos(a + Math.PI / n) * Rr * .7, M.y + Math.sin(a + Math.PI / n) * Rr * .7, Rr * .08, Rr * .025, a + Math.PI / n, 0, TAU); q.fill();
    // sawtooth ring
    for (let s2 = 0; s2 < 4; s2++) { const b = a + s2 * TAU / (n * 4), r2 = Rr * .6; q.beginPath(); q.moveTo(M.x + Math.cos(b) * r2, M.y + Math.sin(b) * r2); q.lineTo(M.x + Math.cos(b + .04) * (r2 - Rr * .05), M.y + Math.sin(b + .04) * (r2 - Rr * .05)); q.lineTo(M.x + Math.cos(b + .08) * r2, M.y + Math.sin(b + .08) * r2); q.closePath(); q.fill(); }
  }
  q.beginPath(); q.arc(M.x, M.y, M.R * 1.12, 0, TAU); q.arc(M.x, M.y, M.R * 1.04, 0, TAU, true); q.fill();
  // the mark is cut out (yang): three lenses as holes, the accent lens left in and dyed gold
  K.fillMark(q, M, '#000', 'rgba(0,0,0,0)', { only: [0, 1, 2] });
  q.globalCompositeOperation = 'source-over';
  g.drawImage(C, 0, 0); g.restore();
  K.fillMark(g, M, 'rgba(0,0,0,0)', '#E9B53A', { only: [3] });
  // swallows (jointed figures) flying around on twos
  const tt = K.twos(t, 12);
  for (let i = 0; i < 3; i++) { const a = tt * 1.2 + i * TAU / 3, x = M.x + Math.cos(a) * M.R * 2.4, y = M.y + Math.sin(a) * M.R * .9 - M.R * .2;
    g.save(); g.translate(x, y); g.rotate(a + Math.PI / 2); g.scale(S * 1.2, S * 1.2); g.fillStyle = red;
    const flap = Math.sin(tt * 18 + i) * .5; g.beginPath(); g.moveTo(0, -18); g.quadraticCurveTo(30, -10 + flap * 20, 46, 6); g.lineTo(6, 4); g.lineTo(0, 22); g.lineTo(-6, 4); g.lineTo(-46, 6); g.quadraticCurveTo(-30, -10 + flap * 20, 0, -18); g.fill(); g.restore(); }
}

// 10 WOODCUT — a manifesto summit: a black block, light only where the knife has cut; one colour, for what burns
export function woodcut(g, t, { W, H, M, S }) {
  g.fillStyle = '#0c0b0a'; g.fillRect(0, 0, W, H);
  const cut = eo(seg(t, -.2, 1.0)), paperC = '#EDE6D6';
  g.strokeStyle = paperC; g.lineCap = 'round';
  // radiating gouges around the ring, length grows with the cut
  const r0 = M.R * 1.12, N = 140;
  for (let i = 0; i < N; i++) { const a = i / N * TAU, len = (0.4 + .6 * hash(i * 3.1)) * Math.max(W, H) * .55 * cut, w = (2.6 - 1.8 * hash(i)) * S;
    g.lineWidth = w; g.beginPath(); g.moveTo(M.x + Math.cos(a) * r0, M.y + Math.sin(a) * r0); g.lineTo(M.x + Math.cos(a) * (r0 + len), M.y + Math.sin(a) * (r0 + len)); g.stroke(); }
  // crowd at the bottom: heads and shoulders as white-line hatching
  for (let i = 0; i < 18; i++) { const r = mulberry(i * 5 + 3), x = (i + .5) / 18 * W + (r() - .5) * 30 * S, s2 = (58 + r() * 26) * S, y = H - s2 * 1.1 + r() * 20 * S;
    g.fillStyle = '#0c0b0a'; K.circle(g, x, y, s2 * .42); g.fill(); g.beginPath(); g.ellipse(x, y + s2 * 1.25, s2 * .95, s2 * .9, 0, Math.PI, 0); g.lineTo(x + s2, H); g.lineTo(x - s2, H); g.fill();
    g.strokeStyle = paperC; g.lineWidth = 2.2 * S; for (let h = 0; h < 3; h++) { g.beginPath(); g.arc(x, y, s2 * .42 - h * 4 * S, -2.6 + h * .2, -.6 - h * .2); g.stroke(); }
    g.beginPath(); g.ellipse(x, y + s2 * 1.25, s2 * .95 - 3 * S, s2 * .9 - 3 * S, 0, Math.PI + .3, -.3); g.stroke(); }
  // the mark carved: lenses as white with gouge texture following the curve
  K.inMark(g, M, () => { const P = K.markPaths(); P.forEach((p, k) => { g.save(); g.clip(p); g.fillStyle = k === 3 ? '#C7341C' : paperC; g.fill(p);
    g.strokeStyle = '#0c0b0a'; g.lineWidth = 2.2; for (let r = 86; r < 100; r += 3.5) { g.beginPath(); g.arc(0, 0, r, K.ARC_DIR[k] - .9, K.ARC_DIR[k] + .9); g.stroke(); } g.restore(); }); });
  // burning: the accent lens flickers
  K.fillMark(g, M, 'rgba(0,0,0,0)', `rgba(255,120,40,${.15 + .15 * Math.sin(t * 20)})`, { only: [3], shadow: { c: 'rgba(255,90,20,.8)', b: 30 * S } });
  K.grainOver(g, W, H, t, .12, 'w');
}

// 11 ENGRAVING — a heritage launch: an intaglio plate cuts itself, hatching follows the form, a hand-laid wash
export function engraving(g, t, { W, H, M, S }) {
  g.drawImage(K.paper('plate', 960, 540, [238, 230, 212], { mottle: 10, grain: 8, fibres: 1500, seed: 11 }), 0, 0, W, H);
  // plate mark
  g.strokeStyle = 'rgba(120,100,70,.4)'; g.lineWidth = 2 * S; g.strokeRect(W * .08, H * .07, W * .84, H * .86); g.strokeStyle = 'rgba(255,255,255,.6)'; g.strokeRect(W * .08 + 3, H * .07 + 3, W * .84, H * .86);
  const ink = '#1E1A16', k = eo(seg(t, -.2, 1.1));
  // hatching inside each lens, along the arc (contour hatching), then cross-hatching in half-tones
  K.inMark(g, M, () => { const P = K.markPaths(); g.lineWidth = 1.1 * 100 / M.R;
    P.forEach((p, i) => { g.save(); g.clip(p); g.strokeStyle = ink; const d = K.ARC_DIR[i];
      for (let r = 40; r < 101; r += 3.2) { if ((r - 40) / 61 > k) break; g.beginPath(); g.arc(0, 0, r, d - 1.0, d + 1.0); g.stroke(); }
      if (k > .5) for (let s2 = -110; s2 < 110; s2 += 5) { if ((s2 + 110) / 220 > (k - .5) * 2) break; const c = Math.cos(d), sn = Math.sin(d); g.beginPath(); g.moveTo(c * 60 - sn * s2, sn * 60 + c * s2); g.lineTo(c * 100 - sn * s2 * .9, sn * 100 + c * s2 * .9); g.globalAlpha = .55; g.stroke(); g.globalAlpha = 1; }
      g.restore(); g.strokeStyle = ink; g.lineWidth = 2 * 100 / M.R; g.stroke(p); }); });
  // hand-laid wash on the accent lens, after printing
  const wash = eo(seg(t, .9, 1.6));
  if (wash > 0) { g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = .75 * wash; K.fillMark(g, M, 'rgba(0,0,0,0)', '#B9A6F2', { only: [3] }); g.restore(); }
  // numbered roundels and leader lines
  [[0, 'i'], [3, 'ii']].forEach(([i, n], m) => { const [mx, my] = K.lensMid(i, 100), x = M.x + mx * M.R / 100, y = M.y + my * M.R / 100, bx = x + (m ? 1 : -1) * M.R * .9, by = y - (m ? 0 : M.R * .2);
    g.strokeStyle = ink; g.lineWidth = .8 * S; g.beginPath(); g.moveTo(x, y); g.lineTo(bx, by); g.stroke(); K.circle(g, bx, by, 14 * S); g.stroke();
    g.font = `italic ${16 * S}px IMFellItalic`; g.fillStyle = ink; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(n, bx, by); });
  g.fillStyle = ink; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  g.font = `${30 * S}px IMFell`; K.track(g, 'PLATE XI', M.x, H * .07 + 50 * S, .3);
  g.font = `italic ${30 * S}px IMFellItalic`; g.fillText('Annulus purpurea, in four parts.', M.x, M.y + M.R * 1.45);
  g.font = `italic ${14 * S}px IMFellItalic`; g.textAlign = 'left'; g.fillText('PurpleHat del.', W * .08 + 16 * S, H * .93 - 12 * S); g.textAlign = 'right'; g.fillText('sculp. MMXXVI', W * .92 - 16 * S, H * .93 - 12 * S);
}

// 12 SILENT FILM — an awards night, 1920s: a flickering 4:3 print between velvet curtains, then an intertitle
export function silentFilm(g, t, { W, H, M, S }) {
  g.fillStyle = '#120405'; g.fillRect(0, 0, W, H);
  const fh = Math.min(H * .86, W * .72 * .75), fw = fh * 4 / 3, fx = W / 2 - fw / 2 + Math.sin(t * 9) * 1.5 * S, fy = M.y - fh * .5 + Math.cos(t * 7) * 1.5 * S;
  const fl = .86 + .14 * hash(Math.floor(t * 24) * 1.7);
  g.save(); g.beginPath(); g.rect(fx, fy, fw, fh); g.clip();
  const title = t > 1.15;
  if (!title) {
    g.fillStyle = rgb([200 * fl, 196 * fl, 186 * fl]); g.fillRect(fx, fy, fw, fh);
    // stage: proscenium, spotlight, the mark on a gilt easel, presenter in top hat
    const sp = g.createRadialGradient(M.x, M.y, 0, M.x, M.y, fh * .6); sp.addColorStop(0, 'rgba(255,255,250,.35)'); sp.addColorStop(1, 'rgba(0,0,0,.45)'); g.fillStyle = sp; g.fillRect(fx, fy, fw, fh);
    g.fillStyle = 'rgba(40,36,34,.85)'; g.fillRect(fx, M.y + M.R * 1.2, fw, fh); g.strokeStyle = 'rgba(20,18,16,.8)'; g.lineWidth = 2 * S;
    for (let i = 0; i < 14; i++) { g.beginPath(); g.moveTo(fx + i * fw / 13, M.y + M.R * 1.2); g.lineTo(fx + (i - 6.5) * fw / 6 + fw / 2, fy + fh); g.stroke(); }
    K.fillMark(g, M, rgb([40 * fl, 36 * fl, 34 * fl]), rgb([120 * fl, 110 * fl, 120 * fl]));
    K.inMark(g, M, () => { g.strokeStyle = 'rgba(30,26,24,.6)'; g.lineWidth = .8; const P = K.markPaths(); P.forEach((p, i) => { g.save(); g.clip(p); for (let h = -110; h < 110; h += 4) { g.beginPath(); g.moveTo(h, -110); g.lineTo(h + 40, 110); g.stroke(); } g.restore(); }); });
    // presenter (deadpan, the body does the acting): bows on the beat
    const bow = Math.max(0, Math.sin((t - .5) * Math.PI * 2)) * .35, px = M.x + M.R * 1.75, py = M.y + M.R * 1.2;
    g.save(); g.translate(px, py); g.fillStyle = 'rgba(25,22,20,.95)';
    g.fillRect(-16 * S, -110 * S, 12 * S, 110 * S); g.fillRect(4 * S, -110 * S, 12 * S, 110 * S);
    g.rotate(-bow); g.beginPath(); g.moveTo(-28 * S, -110 * S); g.lineTo(28 * S, -110 * S); g.lineTo(22 * S, -220 * S); g.lineTo(-22 * S, -220 * S); g.fill();
    K.circle(g, 0, -248 * S, 26 * S); g.fill(); g.fillRect(-20 * S, -320 * S, 40 * S, 52 * S); g.fillRect(-32 * S, -272 * S, 64 * S, 6 * S);
    g.restore();
  } else {
    // intertitle: ornate border, white on black
    g.fillStyle = '#0d0c0b'; g.fillRect(fx, fy, fw, fh);
    g.strokeStyle = 'rgba(230,226,215,.85)'; g.lineWidth = 2 * S; g.strokeRect(fx + 30 * S, fy + 30 * S, fw - 60 * S, fh - 60 * S); g.strokeRect(fx + 38 * S, fy + 38 * S, fw - 76 * S, fh - 76 * S);
    g.fillStyle = 'rgba(236,232,222,.95)'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `italic ${46 * S}px IMFellItalic`; g.fillText('Ladies & gentlemen—', M.x, M.y - 28 * S); g.font = `${46 * S}px IMFell`; g.fillText('the show.', M.x, M.y + 34 * S);
  }
  // scratches, dust, flicker
  for (let i = 0; i < 4; i++) { const r = hash(Math.floor(t * 24) * 3 + i); if (r < .5) continue; g.strokeStyle = `rgba(255,255,255,${.12 + .2 * r})`; g.lineWidth = 1; const x = fx + hash(i + Math.floor(t * 24)) * fw; g.beginPath(); g.moveTo(x, fy); g.lineTo(x + 4, fy + fh); g.stroke(); }
  K.grainOver(g, W, H, t, .18, 's');
  const iv = g.createRadialGradient(M.x, M.y, fh * .3, M.x, M.y, fh * .8); iv.addColorStop(0, 'rgba(0,0,0,0)'); iv.addColorStop(1, 'rgba(0,0,0,.6)'); g.fillStyle = iv; g.fillRect(fx, fy, fw, fh);
  g.restore();
  // velvet curtains framing the screen
  for (const sx of [-1, 1]) { const x0 = sx < 0 ? 0 : fx + fw, w = sx < 0 ? fx : W - fx - fw;
    for (let i = 0; i < 9; i++) { const xx = x0 + (i / 9) * w, gr = g.createLinearGradient(xx, 0, xx + w / 9, 0); gr.addColorStop(0, '#3a0610'); gr.addColorStop(.5, '#8a1424'); gr.addColorStop(1, '#2a040b'); g.fillStyle = gr; g.fillRect(xx, 0, w / 9 + 1, H); } }
  const val = g.createLinearGradient(0, 0, 0, fy); val.addColorStop(0, '#5a0a16'); val.addColorStop(1, '#2a040b'); g.fillStyle = val; g.fillRect(0, 0, W, Math.max(0, fy - 4 * S));
}
