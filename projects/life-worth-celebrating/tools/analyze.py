import sys, numpy as np, librosa
KEYS=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
MAJ=np.array([6.35,2.23,3.48,2.33,4.38,4.09,2.52,5.19,2.39,3.66,2.29,2.88])
MIN=np.array([6.33,2.68,3.52,5.38,2.60,3.53,2.54,4.75,3.98,2.69,3.34,3.17])
def key(ch):
    best=[]
    for i in range(12):
        best.append((np.corrcoef(ch,np.roll(MAJ,i))[0,1],KEYS[i]+' maj'))
        best.append((np.corrcoef(ch,np.roll(MIN,i))[0,1],KEYS[i]+' min'))
    best.sort(reverse=True); return best[:2]
def tuning_and_key(y,sr):
    t=librosa.estimate_tuning(y=y,sr=sr)
    ch=librosa.feature.chroma_cqt(y=y,sr=sr,tuning=t).mean(1)
    return t,key(ch)
for p in sys.argv[1:]:
    y,sr=librosa.load(p,sr=22050,mono=True)
    d=len(y)/sr
    t,k=tuning_and_key(y,sr)
    tempo,beats=librosa.beat.beat_track(y=y,sr=sr)
    print(f"\n### {p.split('/')[-1]}  dur={d:.1f}s tuning={t:+.2f}st key={k} tempo={float(np.atleast_1d(tempo)[0]):.1f}")
    # per-10s windows: rms dB, centroid, key
    hop=10
    for s in range(0,int(d),hop):
        seg=y[s*sr:(s+hop)*sr]
        if len(seg)<sr: break
        r=20*np.log10(np.sqrt(np.mean(seg**2))+1e-9)
        c=librosa.feature.spectral_centroid(y=seg,sr=sr).mean()
        ch=librosa.feature.chroma_cqt(y=seg,sr=sr,tuning=t).mean(1)
        kk=key(ch)[0]
        top=''.join(KEYS[i]+' ' for i in np.argsort(ch)[::-1][:4])
        print(f"{s:4d}-{s+hop:<4d} rms={r:6.1f}dB cent={c:6.0f} key~{kk[1]:7s}({kk[0]:.2f}) top:{top}")
