import sys
p=sys.argv[1]; s=open(p).read()
def rep(a,b,cnt=1):
    global s
    assert s.count(a)==cnt, (a, s.count(a)); s=s.replace(a,b)
rep("// 20 MICROGAME — one word, one second, one action: CATCH! The mark drops into two gloves; its loose dots plop in after it",
    "// 20 MICROGAME — one word, one second, one action: CATCH! The mark is tossed up from its place and drops into two gloves;\n// its loose dots fly higher and plop back in after it, one per 16th")
rep("drop = H * .17, TC = .42;", "drop = H * .15, TC = .42, toss = (t, t1) => { const u = seg(t, 0, t1); return 4 * u * (1 - u); };")
rep("const fall = ei(seg(t, -.15, TC)), caught", "const fall = 1 - toss(t, TC), caught")
rep("const off = -drop * (1 - fall) + caught * 10 * S, tilt = .1 * (1 - fall);", "const off = -drop * (1 - fall) + caught * 10 * S, tilt = .08 * Math.sin(seg(t, 0, TC) * TAU);")
rep("u = ei(seg(t, -.15, land)), [x, y0] = dotC(M, k), y = y0 - drop * 1.25 * (1 - u) - (1 - u) * d * 40 * S;",
    "[x, y0] = dotC(M, k), y = y0 - (drop * 1.3 + d * 40 * S) * toss(t, land);")
open(p,'w').write(s)
