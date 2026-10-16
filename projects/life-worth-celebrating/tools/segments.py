import sys, numpy as np, librosa, scipy.ndimage as nd
p=sys.argv[1]; k=int(sys.argv[2]) if len(sys.argv)>2 else 16
y,sr=librosa.load(p,sr=22050)
ch=librosa.feature.chroma_cqt(y=y,sr=sr,hop_length=512); mf=librosa.feature.mfcc(y=y,sr=sr,hop_length=512,n_mfcc=13)
F=np.vstack([librosa.util.normalize(ch),librosa.util.normalize(mf[1:],axis=1)])
# downsample to 0.25s
step=int(0.25*sr/512); F=nd.uniform_filter1d(F,step,axis=1)[:,::step]
b=librosa.segment.agglomerative(F,k); t=b*0.25*512/sr*step/step
t=b*step*512/sr
print(p.split('/')[-1], ' '.join(f"{x:.1f}" for x in t))
