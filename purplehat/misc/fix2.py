import sys
p=sys.argv[1]; s=open(p).read()
def rep(a,b,cnt=1):
    global s
    assert s.count(a)==cnt, (a, s.count(a)); s=s.replace(a,b)
rep("w = 1 + .045 * Math.sin(a * 5 + ph) + .03 * Math.sin(a * 8 - ph * 1.7) + .015 * Math.sin(a * 13 + fr * 2.1);",
    "w = 1 + .03 * Math.sin(a * 4 + ph) + .02 * Math.sin(a * 7 - ph * 1.7) + .01 * Math.sin(a * 13 + fr * 2.1);")
rep("g.save(); g.shadowColor = 'rgba(14,8,32,.6)'; g.shadowOffsetY = 8 * S; strokes(g, MF, '#F2F0FF'); g.restore();",
    "strokes(g, { x: MF.x, y: MF.y + 9 * S, R: M.R }, 'rgba(14,8,32,.55)'); strokes(g, MF, '#F2F0FF');")
open(p,'w').write(s)
