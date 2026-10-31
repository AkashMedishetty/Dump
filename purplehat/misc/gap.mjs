const R=100;
function minGap(H,TIP){const t=TIP*Math.PI/180;const C=(R*R-H*H)/(2*(R*Math.cos(t)-H)),r=C-H;
 // top lens inner arc: circle centre (0,-C) radius r, from tipR to tipL through (0,-H). Sample it + tip.
 let m=Infinity; const a1=Math.atan2(-R*Math.cos(t)+C, R*Math.sin(t)); // angle of tipR seen from centre (0,-C)
 for(let i=0;i<=2000;i++){const a=a1+(Math.PI/2-a1)*i/2000; const x=r*Math.cos(a), y=-C+r*Math.sin(a); m=Math.min(m,-(x+y)/Math.SQRT2);}
 return {gap:2*m,C,r};}
const G0=minGap(43,43).gap; console.log('G0',G0.toFixed(2));
for(const H of [43,40,37,34,32]){let lo=15,hi=44.9;for(let k=0;k<60;k++){const mid=(lo+hi)/2; if(minGap(H,mid).gap>G0) lo=mid; else hi=mid;}
 const rimGap=2*R*Math.sin((45-lo)*Math.PI/180);console.log(H, 'TIP',lo.toFixed(2),'rimGap',rimGap.toFixed(2));}
