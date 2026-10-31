import sys
p=sys.argv[1]; s=open(p).read()
def rep(a,b,cnt=1):
    global s
    assert s.count(a)==cnt, (a, s.count(a)); s=s.replace(a,b)
rep("const sinceBeat = (t) => t - Math.floor(t * 2) / 2;",
"""const sinceBeat = (t) => t - Math.floor(t * 2) / 2;
// outer outline of the union of the parts (no seams where the h's arch meets its stem): lw px visible outside the shape.
// Drawn via a scratch canvas, so call it with g untransformed.
let SC = null;
function outline(g, M, col, lw, xf = null, only = null) {
  const W = g.canvas.width, H = g.canvas.height; if (!SC || SC.width !== W || SC.height !== H) SC = K.canvas(W, H);
  const q = SC.getContext('2d'); q.setTransform(1, 0, 0, 1, 0, 0); q.globalCompositeOperation = 'source-over'; q.clearRect(0, 0, W, H);
  eachPart(q, M, xf, (q, p, i, k) => { q.lineWidth = lw * 2 / k; q.lineJoin = 'round'; q.strokeStyle = col; q.stroke(p); }, only);
  q.globalCompositeOperation = 'destination-out'; eachPart(q, M, xf, (q, p) => { q.fillStyle = '#000'; q.fill(p); }, only); q.globalCompositeOperation = 'source-over';
  g.drawImage(SC, 0, 0);
}""")
rep("const pw = (hw + 72 * S) * sq, ph = (hh + 62 * S) * sq;", "const pw = (hw + 96 * S) * sq, ph = (hh + 84 * S) * sq;")
rep("pillPt(i / nb, M.x, M.y, pw - 22 * S, ph - 22 * S)", "pillPt(i / nb, M.x, M.y, pw - 24 * S, ph - 24 * S)")
rep("const nb = 34;", "const nb = 38;")
rep("strokes(g, { x: M.x, y: M.y + 9 * S, R: MM.R }, ink); strokes(g, MM, '#FFFFFF'); K.strokeMark(g, MM, ink, 7 * S);",
    "strokes(g, { x: M.x, y: M.y + 10 * S, R: MM.R }, ink); outline(g, MM, ink, 6 * S, null, STK); strokes(g, MM, '#FFFFFF');")
rep("const px = V ? M.x - 250 * S : M.x - bw - 190 * S, py = V ? floor : H * .93,", "const px = V ? M.x - 250 * S : M.x - bw - 190 * S, py = V ? floor : H * .87,")
rep("eachPart(g, M, (i) => i < 5 ? null : pulse(i), (g, p, i, k) => { g.lineWidth = 2.6 * S / k; g.strokeStyle = ink; g.stroke(p); });",
    "outline(g, M, ink, 2.6 * S, (i) => i < 5 ? null : pulse(i));")
rep("bh = H * .62 / n;", "bh = H * .68 / n;")
rep("K.strokeMark(g, MO, ink, 7 * S);", "outline(g, MO, ink, 7 * S, null, STK);")
rep("""const rx = hw * 1.02, ry = Math.max(hh * 1.9, M.R * 1.05), blob = (sc, ph) => { g.beginPath(); for (let i = 0; i <= 64; i++) { const a = i / 64 * TAU, w = 1 + .05 * Math.sin(a * 5 + ph) + .035 * Math.sin(a * 9 - ph * 1.7) + (hash(fr * 13 + i % 64) - .5) * .02;""",
"""const rx = hw * 1.22, ry = hh * 2.25, blob = (sc, ph) => { g.beginPath(); for (let i = 0; i <= 72; i++) { const a = i / 72 * TAU, w = 1 + .045 * Math.sin(a * 5 + ph) + .03 * Math.sin(a * 8 - ph * 1.7) + .015 * Math.sin(a * 13 + fr * 2.1);""")
rep("for (let i = 1; i < 9; i++) { g.fillStyle = i % 2 ? '#B6FF6A' : '#3EE07A'; blob(1 - i / 9, tt * 3 + i * .9); g.fill(); }",
    "for (let i = 1; i < 10; i++) { g.fillStyle = i % 2 ? '#B6FF6A' : (i > 6 ? '#1FAE55' : '#3EE07A'); blob(1 - i / 10, tt * 3 + i * 1.3 - tt * 4); g.fill(); }")
rep("a = j / 6 * TAU + r * 3.2 - tt * 7;", "a = j / 6 * TAU + r * 3.6 - tt * 7;")
rep("K.circle(g, 0, 0, 32 * S); g.fill(); g.stroke(); for (const fx",
    "g.beginPath(); g.ellipse(-sx * 30 * S, 4 * S, 12 * S, 18 * S, sx * .6, 0, TAU); g.fill(); g.stroke(); K.circle(g, 0, 0, 32 * S); g.fill(); g.stroke(); for (const fx")
rep("g.fillStyle = ink; K.circle(g, fx0 - 30 * S, fy, 30 * S); g.fill(); g.strokeStyle = '#1fd1d1'; g.lineWidth = 4 * S; g.stroke();",
    "g.fillStyle = ink; K.circle(g, fx0 - 30 * S, fy, 30 * S); g.fill(); g.strokeStyle = '#1fd1d1'; g.lineWidth = 4 * S; g.stroke(); g.fillStyle = 'rgba(255,255,255,.5)'; K.circle(g, fx0 - 40 * S, fy - 10 * S, 7 * S); g.fill();")
rep("g.fillStyle = '#ffc928'; K.circle(g, fx, fy, (10 + 5 * Math.sin(t * 70)) * S); g.fill();",
    "g.save(); g.translate(fx, fy); g.rotate(t * 20); g.fillStyle = '#ffc928'; g.beginPath(); for (let i = 0; i < 16; i++) { const r = (i % 2 ? 7 : 17 + 5 * Math.sin(t * 70)) * S, a = i / 16 * TAU; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.fill(); g.restore();")
open(p,'w').write(s)
