# beats.py file t0 t1 bpm_prior [meter]  -> beat times, tempo, best downbeat phase
import sys, numpy as np, librosa
p,t0,t1,bpm=sys.argv[1],float(sys.argv[2]),float(sys.argv[3]),float(sys.argv[4]); M=int(sys.argv[5]) if len(sys.argv)>5 else 4
y,sr=librosa.load(p,sr=22050,offset=t0,duration=t1-t0); hop=256
oenv=librosa.onset.onset_strength(y=y,sr=sr,hop_length=hop)
tempo,b=librosa.beat.beat_track(onset_envelope=oenv,sr=sr,hop_length=hop,start_bpm=bpm,tightness=400)
bt=librosa.frames_to_time(b,sr=sr,hop_length=hop)+t0
ch=librosa.feature.chroma_cqt(y=y,sr=sr,hop_length=hop)
cs=librosa.util.sync(ch,b,aggregate=np.median); nov=np.r_[0,np.linalg.norm(np.diff(cs,axis=1),axis=0)]
lowb=librosa.util.sync(librosa.feature.melspectrogram(y=y,sr=sr,hop_length=hop,n_mels=32)[:4],b).sum(0)
os_=oenv[b]
sc=[(nov[ph::M].mean()/nov.mean()+os_[ph::M].mean()/os_.mean()+lowb[ph::M].mean()/lowb.mean(),ph) for ph in range(M)]
sc.sort(reverse=True)
ibi=np.diff(bt); print(f"{p.split('/')[-1]} {t0}-{t1}: tempo={float(np.atleast_1d(tempo)[0]):.2f} median_ibi={np.median(ibi):.3f} ({60/np.median(ibi):.1f}bpm) phase scores={[(round(s,2),ph) for s,ph in sc]}")
ph=sc[0][1]
print(' beats:',' '.join(f"{'|' if (i-ph)%M==0 else ''}{x:.2f}" for i,x in enumerate(bt)))
