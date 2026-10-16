# Per-second vocal-stem vs mix level -> where are vocals?
import sys, numpy as np, soundfile as sf
mix,sr=sf.read(sys.argv[1]); voc,_=sf.read(sys.argv[2])
m=mix.mean(1); v=voc.mean(1); n=min(len(m),len(v))
step=int(sys.argv[3]) if len(sys.argv)>3 else 2
out=[]
for s in range(0,n//sr,step):
    a=m[s*sr:(s+step)*sr]; b=v[s*sr:(s+step)*sr]
    rm=20*np.log10(np.sqrt(np.mean(a**2))+1e-9); rv=20*np.log10(np.sqrt(np.mean(b**2))+1e-9)
    out.append(f"{s:3d}:{rm:5.0f}/{rv-rm:+4.0f}{'V' if rv-rm>-12 else ('v' if rv-rm>-20 else '.')}")
for i in range(0,len(out),6): print('  '.join(out[i:i+6]))
