import sys
p=sys.argv[1]; s=open(p).read()
def rep(a,b,cnt=1):
    global s
    assert s.count(a)==cnt, (a, s.count(a)); s=s.replace(a,b)
rep("""      if (Math.abs(cx - M.x) < pw + s * .45 && Math.abs(cy - M.y) < ph + s * .45) continue;
      if (Math.hypot(cx - ax, cy - (ay - 40 * as)) < 150 * as + s * .4) continue;
""", "")
rep("const s = 90 * S, rows = Math.ceil(H / s) + 1, cols = Math.ceil(W / s) + 2, pw = hw + 70 * S, ph = hh + 95 * S;",
    "const s = 90 * S, rows = Math.ceil(H / s) + 1, cols = Math.ceil(W / s) + 2, pw = hw + 80 * S, ph = hh + 80 * S;")
rep("""  g.fillStyle = '#F4F2EC'; pill(g, M.x, M.y, pw, ph); g.fill();""",
    """  g.fillStyle = '#F4F2EC'; pill(g, M.x, M.y, pw, ph); g.fill(); K.circle(g, ax, ay - 40 * as, 150 * as); g.fill();""")
open(p,'w').write(s)
