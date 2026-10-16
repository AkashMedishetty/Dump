# chords.py file t0 t1 bpm beats_per_chunk [semitone_shift] -> chord per chunk
import sys, numpy as np, librosa
p,t0,t1,bpm,n=sys.argv[1],float(sys.argv[2]),float(sys.argv[3]),float(sys.argv[4]),int(sys.argv[5]); sh=int(sys.argv[6]) if len(sys.argv)>6 else 0
K=['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B']
T=[];N=[]
for r in range(12):
    for q,iv in (('',[0,4,7]),('m',[0,3,7])):
        v=np.zeros(12); v[[(r+i)%12 for i in iv]]=1; T.append(v/np.linalg.norm(v)); N.append(K[r]+q)
T=np.array(T)
y,sr=librosa.load(p,sr=22050,offset=t0,duration=t1-t0); hop=512
oenv=librosa.onset.onset_strength(y=y,sr=sr,hop_length=hop)
_,b=librosa.beat.beat_track(onset_envelope=oenv,sr=sr,hop_length=hop,start_bpm=bpm,tightness=400)
ch=librosa.feature.chroma_cqt(y=y,sr=sr,hop_length=hop,bins_per_octave=36)
ch=np.roll(ch,sh,axis=0)
bt=librosa.frames_to_time(b,sr=sr,hop_length=hop)+t0
out=[]
for i in range(0,len(b)-n,n):
    c=ch[:,b[i]:b[i+n]].mean(1); c/=np.linalg.norm(c)+1e-9
    s=T@c; j=s.argmax(); out.append(f"{bt[i]:.1f}:{N[j]}")
print(p.split('/')[-1],f"{t0}-{t1} shift{sh:+d}:",' '.join(out))
