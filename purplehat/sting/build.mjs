import fs from 'fs';
const G = JSON.parse(fs.readFileSync('glyphs.json', 'utf8'));
const html = `<!doctype html><html><body style="margin:0;background:#000"><canvas id="c" width="1920" height="1080"></canvas><script>
const G = ${JSON.stringify(G)};
const W = 1920, H = 1080, FPS = 60, DUR = 6.0, SUB = 10, SHUTTER = 0.5;
const PANEL = [
  'M-67.7 -73.6A100 100 0 0 1 67.7 -73.6A85 85 0 0 1 -67.7 -73.6Z',
  'M73.6 -67.7A100 100 0 0 1 73.6 67.7A85 85 0 0 1 73.6 -67.7Z',
  'M67.7 73.6A100 100 0 0 1 -67.7 73.6A85 85 0 0 1 67.7 73.6Z',
  'M-73.6 67.7A100 100 0 0 1 -73.6 -67.7A85 85 0 0 1 -73.6 67.7Z'].map((d) => new Path2D(d));
const DIR = [[0, -1], [1, 0], [0, 1], [-1, 0]];
const NAME = G.name.glyphs.map((g) => ({ ...g, p: new Path2D(g.d) }));
const EV = G.ev.glyphs.map((g) => ({ ...g, p: new Path2D(g.d) }));
const C = { bg0: '#6A52EE', bg1: '#5238DA', crown: '#F6F4EF', visor: '#D7CFFF', ev: '#D7CFFF' };
const clamp = (x) => Math.max(0, Math.min(1, x));
const outExpo = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
const inOutCubic = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const outBack = (x) => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const prog = (t, a, d) => clamp((t - a) / d);
const lerp = (a, b, k) => a + (b - a) * k;

// Final lockup layout
const R1 = 118, GAP = 64, NW = G.name.width;
const total = 2 * R1 + GAP + NW, left = (W - total) / 2;
const MX1 = left + R1, MY = 540;
const NX = left + 2 * R1 + GAP, CAP = -G.name.capTop;
const NB = MY + CAP / 2 - 22, EB = NB + 64;

function scene(ctx, t) {
  const g = ctx.createRadialGradient(W * 0.5, H * 0.42, 80, W * 0.5, H * 0.5, W * 0.62);
  g.addColorStop(0, C.bg0); g.addColorStop(1, C.bg1);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.save(); const cam = 1 + 0.025 * inOutCubic(clamp((t - 3.2) / 2.8)); ctx.translate(W / 2, H / 2); ctx.scale(cam, cam); ctx.translate(-W / 2, -H / 2);

  // Mark position and size: centred and large, then slides into the lockup
  const s = inOutCubic(prog(t, 2.45, 0.95));
  const mx = lerp(W / 2, MX1, s), r = lerp(190, R1, s);
  const settle = (t > 1.75 && t < 2.35 ? 1 + 0.025 * Math.sin(Math.PI * (t - 1.75) / 0.6) : 1);

  ctx.save(); ctx.translate(mx, MY); ctx.scale(r / 100 * settle, r / 100 * settle);
  // Crown panels orbit in around the centre and close up; the visor lands last
  const starts = { 3: 0.12, 0: 0.22, 2: 0.32 };
  for (const q of [3, 0, 2, 1]) {
    if (q === 1) {
      const u = prog(t, 1.05, 0.9);
      if (u <= 0) continue;
      const k = outExpo(u);
      ctx.save(); ctx.globalAlpha = clamp(u * 4);
      ctx.translate(380 * (1 - k), 0); ctx.rotate(-0.35 * (1 - k));
      ctx.fillStyle = C.visor; ctx.fill(PANEL[q]); ctx.restore();
      continue;
    }
    const u = prog(t, starts[q], 1.25);
    if (u <= 0) continue;
    const k = outExpo(u);
    ctx.save(); ctx.globalAlpha = clamp(u * 5);
    ctx.rotate(-2.2 * (1 - k)); const sc = 1 + 0.9 * (1 - k); ctx.scale(sc, sc);
    ctx.fillStyle = C.crown; ctx.fill(PANEL[q]); ctx.restore();
  }
  ctx.restore();

  // Wordmark rises through its baseline, letter by letter
  ctx.save();
  ctx.beginPath(); ctx.rect(NX - 40, 0, NW + 120, NB + 46); ctx.clip();
  NAME.forEach((gl, i) => {
    const k = outExpo(prog(t, 2.9 + i * 0.045, 0.8));
    if (k <= 0) return;
    ctx.save(); ctx.translate(NX + gl.x, NB + (1 - k) * 200); ctx.fillStyle = C.crown; ctx.fill(gl.p); ctx.restore();
  });
  ctx.restore();
  EV.forEach((gl, i) => {
    const k = outExpo(prog(t, 3.55 + i * 0.06, 0.9));
    if (k <= 0) return;
    ctx.save(); ctx.globalAlpha = k; ctx.translate(NX + 6 + gl.x, EB + (1 - k) * 14); ctx.fillStyle = C.ev; ctx.fill(gl.p); ctx.restore();
  });
  ctx.restore();
}

const out = document.getElementById('c'), octx = out.getContext('2d');
const tmp = document.createElement('canvas'); tmp.width = W; tmp.height = H; const tctx = tmp.getContext('2d', { willReadFrequently: true });
const acc = new Float32Array(W * H * 4);
window.frame = (f) => {
  acc.fill(0);
  for (let s = 0; s < SUB; s++) {
    const t = (f + (s / SUB - 0.5) * SHUTTER) / FPS;
    scene(tctx, t);
    const d = tctx.getImageData(0, 0, W, H).data;
    for (let i = 0; i < d.length; i++) acc[i] += d[i];
  }
  const img = octx.createImageData(W, H), o = img.data;
  let seed = (f * 2654435761) >>> 0;
  for (let i = 0; i < o.length; i += 4) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const n = ((seed >>> 8) / 16777216 - 0.5) * 3.2;
    o[i] = acc[i] / SUB + n; o[i + 1] = acc[i + 1] / SUB + n; o[i + 2] = acc[i + 2] / SUB + n; o[i + 3] = 255;
  }
  octx.putImageData(img, 0, 0);
  return out.toDataURL('image/png');
};
window.TOTAL = Math.round(DUR * FPS);
</script></body></html>`;
fs.writeFileSync('anim.html', html);
