import sys
p=sys.argv[1]; s=open(p).read()
old = s.split('\n')
i = next(n for n,l in enumerate(old) if l.startswith("  g.save(); g.translate(x, gy); g.scale(sc, sc); g.fillStyle = '#1b1714';"))
new = """  // the runner: a cream paper edge first (so it reads over the black bars), then the black card
  const fig = (col, e) => { g.fillStyle = col; g.strokeStyle = col; g.lineJoin = 'round'; g.lineCap = 'round';
    K.circle(g, 0, -150, 16 + e / 2); g.fill(); g.lineWidth = e || 1; g.beginPath(); g.moveTo(-14, -132); g.lineTo(16, -132); g.lineTo(22, -60); g.lineTo(-12, -60); g.closePath(); g.fill(); if (e) g.stroke();
    g.lineWidth = 12 + e; g.beginPath(); g.moveTo(4, -64); g.lineTo(4 + 30 * st, -20); g.lineTo(10 + 40 * st, 20); g.moveTo(4, -64); g.lineTo(4 - 30 * st, -20); g.lineTo(-10 - 30 * st, 18); g.stroke();
    g.beginPath(); g.moveTo(8, -124); g.lineTo(8 - 32 * st, -88); g.moveTo(8, -124); g.lineTo(8 + 34 * st, -92); g.stroke(); };
  g.save(); g.translate(x, gy); g.scale(sc, sc); fig('#efe4c9', 9); fig('#1b1714', 0); g.restore();"""
old[i:i+4] = [new]
open(p,'w').write('\n'.join(old))
