import sys
p=sys.argv[1]; s=open(p).read()
a = """  const ph2 = t * 8, a = Math.sin(ph2), lw = K.STROKE * 1.35;"""
b = """  const ph2 = t * 9 + .9, lw = K.STROKE * 1.35, D = (o, l, an) => [o[0] + Math.sin(an) * l, o[1] + Math.cos(an) * l];"""
assert s.count(a)==1; s=s.replace(a,b)
a = """  g.beginPath(); g.moveTo(-4, -16); g.lineTo(-4 + 44 * a, 44); g.moveTo(-4, -16); g.lineTo(-4 - 44 * a, 44); g.moveTo(8, -76); g.lineTo(8 - 48 * a, -44); g.moveTo(8, -76); g.lineTo(8 + 48 * a, -50); g.stroke(); g.restore();"""
b = """  g.beginPath();
  for (const p of [ph2, ph2 + Math.PI]) { const th = .85 * Math.sin(p), kn = D([-4, -16], 44, th), ft = D(kn, 44, th - 1.2 * (.5 - .5 * Math.cos(p)));   // legs: thigh + bent shin
    g.moveTo(-4, -16); g.lineTo(kn[0], kn[1]); g.lineTo(ft[0], ft[1]);
    const ua = -.9 * Math.sin(p), el = D([10, -80], 34, ua), hd = D(el, 32, ua + 1.5); g.moveTo(10, -80); g.lineTo(el[0], el[1]); g.lineTo(hd[0], hd[1]); }   // arms swing opposite
  g.stroke(); g.restore();"""
assert s.count(a)==1; s=s.replace(a,b)
s = s.replace("K.circle(g, 22, -128, 22); g.fillStyle = ink; g.fill(); g.beginPath(); g.moveTo(10, -88); g.lineTo(-4, -16); g.stroke();",
              "g.lineJoin = 'round'; K.circle(g, 26, -126, 22); g.fillStyle = ink; g.fill(); g.beginPath(); g.moveTo(12, -86); g.lineTo(-4, -16); g.stroke();")
open(p,'w').write(s)
