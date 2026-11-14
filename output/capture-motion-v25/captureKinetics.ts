const clamp=(v:number)=>Math.max(0,Math.min(1,v));
export function captureFlight(progress:number,from:{x:number;y:number},to:{x:number;y:number},lift:number){
 const p=clamp(progress),u=p**1.55,arc=p===0||p===1?0:Math.sin(Math.PI*u);
 return{x:from.x+(to.x-from.x)*u,y:from.y+(to.y-from.y)*u-arc*lift,scale:p===1?1.05:2.3-1.25*u,rotation:p===1?0:-4.6*(1-u)};
}
export function captureKnock(time:number){
 const beats=[9.8,10.65,11.5],index=beats.findIndex(start=>time>=start&&time<start+.58);
 if(index<0)return{x:0,y:0,rotation:0,impact:0};
 const t=time-beats[index],s=.72+index*.15,envelope=Math.sin(Math.PI*clamp(t/.58))**2,rock=Math.sin(t*30)*envelope*s;
 return{x:rock*9,y:-Math.abs(rock)*5,rotation:rock*.18,impact:envelope*s};
}
export function captureSceneImpulse(time:number){
 return Math.max(0,...[[4.36,.28],[5.85,1],[8.55,.55],[12.2,1.25]].map(([at,power])=>{const t=time-at;return t>=0&&t<.65?Math.exp(-t*9)*power:0;}));
}

/** One clock for skin flow and the connected stream, reversed on escape. */
export function conversionProgress(age:number){const p=clamp(age/1.25);return p*p*(3-2*p);}
