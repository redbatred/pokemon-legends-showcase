const clamp=(n:number)=>Math.max(0,Math.min(1,n));
export const stadiumRim=(u:number)=>.256+.214*Math.sin(Math.PI*clamp(u));
export function groundWarp(v:number){const a=Math.min(1,v/.68);return v<=.68?a*a*(3-2*a):Math.max(0,(1-v)/.32);}
/** A shared slow gust moves neighboring branches together; fine movement is delayed toward the tips. */
export function branchWind(time:number,u:number,v:number,seed:number,width:number){
 const tip=(1-clamp(v))**1.65,gust=Math.sin(time*.68+seed*.7)*.62+Math.sin(time*.27-seed*.31)*.38;
 const branch=Math.sin(time*1.52-u*3.4+seed)*.17,flutter=Math.sin(time*3.2+u*12+v*4+seed)*.055;
 return {x:(gust+branch+flutter)*width*.027*tip,y:Math.sin(time*1.1+seed+u*3)*width*.004*tip};
}
export function cloudPosition(time:number,start:number,speed:number,span:number,padding:number){
 const period=span+padding*2;return ((start+time*speed+padding)%period+period)%period-padding;
}
/** Only bright blue/white sky is eligible; flood connectivity keeps blue stadium paint intact. */
export function skyPixels(rgba:Uint8ClampedArray,width:number,height:number){
 const ridge=[[0,.49],[.22,.36],[.28,.322],[.32,.322],[.36,.35],[.40,.378],[.45,.378],[.49,.373],[.53,.402],[.58,.39],[.62,.36],[.66,.335],[.70,.302],[.74,.296],[.78,.313],[.82,.323],[1,.49]];
 const limits=Array.from({length:width},(_,x)=>{const u=x/(width-1),i=ridge.findIndex(p=>p[0]>=u),b=ridge[Math.max(1,i)],a=ridge[Math.max(1,i)-1];return height*(a[1]+(b[1]-a[1])*(u-a[0])/(b[0]-a[0]));});
 const mask=new Uint8Array(width*height),queue=new Int32Array(width*height);let head=0,tail=0;
 const visit=(n:number)=>{if(mask[n]||n<0||n>=mask.length||n>=width*Math.ceil(height*.49))return;const i=n*4,r=rgba[i],g=rgba[i+1],b=rgba[i+2];if(Math.floor(n/width)>limits[n%width]&&!(r>145&&g>175&&b>205))return;if(!(b>201&&((b>g*1.16&&g>r*1.08)||(r>125&&g>158&&b>=r*.98))))return;mask[n]=1;queue[tail++]=n;};
 for(let x=0;x<width;x++)visit(x);
 while(head<tail){const n=queue[head++],x=n%width;if(x)visit(n-1);if(x<width-1)visit(n+1);visit(n+width);visit(n-width);}
 return mask;
}
