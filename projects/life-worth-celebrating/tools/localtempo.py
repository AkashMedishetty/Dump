import sys, numpy as np, librosa
p=sys.argv[1]; y,sr=librosa.load(p,sr=22050)
oenv=librosa.onset.onset_strength(y=y,sr=sr,hop_length=512)
tg=librosa.feature.tempogram(onset_envelope=oenv,sr=sr,hop_length=512,win_length=384)
bpms=librosa.tempo_frequencies(tg.shape[0],sr=sr,hop_length=512)
fr=sr/512; W=int(10*fr)
line=[]
for s in range(0,tg.shape[1]-W,W):
    m=tg[:,s:s+W].mean(1); ok=(bpms>50)&(bpms<200)
    idx=np.argsort(m[ok])[::-1]; cand=bpms[ok][idx]
    # top 2 distinct
    top=[cand[0]]+[c for c in cand[1:] if all(abs(c-t)/t>.08 for t in top)][:1] if False else None
    t=[];
    for c in cand:
        if all(abs(c-x)/x>.08 for x in t): t.append(c)
        if len(t)==3: break
    line.append(f"{s/fr:5.0f}s: "+"/".join(f"{x:.0f}" for x in t))
print(p.split('/')[-1]); print('\n'.join(line))
