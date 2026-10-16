import sys, numpy as np, librosa, librosa.display, matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
p,out=sys.argv[1],sys.argv[2]; t0=float(sys.argv[3]) if len(sys.argv)>3 else 0; t1=float(sys.argv[4]) if len(sys.argv)>4 else None
y,sr=librosa.load(p,sr=22050,offset=t0,duration=(t1-t0) if t1 else None)
fig,ax=plt.subplots(4,1,figsize=(22,13),sharex=True)
S=librosa.power_to_db(librosa.feature.melspectrogram(y=y,sr=sr,n_mels=128,fmax=8000),ref=np.max)
librosa.display.specshow(S,sr=sr,x_axis='time',y_axis='mel',fmax=8000,ax=ax[0])
ch=librosa.feature.chroma_cqt(y=y,sr=sr); librosa.display.specshow(ch,sr=sr,x_axis='time',y_axis='chroma',ax=ax[1])
r=librosa.feature.rms(y=y)[0]; tt=librosa.times_like(r,sr=sr); ax[2].plot(tt,20*np.log10(r+1e-6)); ax[2].set_ylim(-60,0)
oenv=librosa.onset.onset_strength(y=y,sr=sr); ax[3].plot(librosa.times_like(oenv,sr=sr),oenv,lw=.5)
tempo,beats=librosa.beat.beat_track(onset_envelope=oenv,sr=sr,start_bpm=90)
for b in librosa.frames_to_time(beats,sr=sr): ax[3].axvline(b,color='r',lw=.3)
ax[3].set_title(f'beats tempo~{float(np.atleast_1d(tempo)[0]):.1f}')
step=5 if len(y)/sr>60 else 2
for a in ax:
    a.set_xticks(np.arange(0,len(y)/sr,step)); a.grid(axis='x',color='w' if a in ax[:2] else 'k',alpha=.5)
ax[3].set_xticklabels([f'{t0+x:.0f}' for x in np.arange(0,len(y)/sr,step)])
plt.tight_layout(); plt.savefig(out,dpi=55)
