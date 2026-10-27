import {Graphics} from 'pixi.js';
import type {PerformanceProfile} from './performanceProfiles';
/** Short cel-painted accents tied to formation/landing, with a clean quiet hold afterward. */
export class EntranceEffects {
 readonly back=new Graphics();readonly front=new Graphics();progress=0;opacity=0;
 constructor(private profile:PerformanceProfile,private color:number,private light:number,private low:boolean){}
 update(x:number,y:number){const b=this.back.clear(),g=this.front.clear(),p=this.progress,a=this.opacity;if(a<=.001)return;const kind=this.profile.entrance,c=this.color,l=this.light,n=this.low?5:9;
  if(kind==='soar'||kind==='coil'){
   for(let i=0;i<3;i++){const t=Math.max(0,Math.min(1,p*1.4-i*.11)),span=30+t*90,yy=y+95-i*23;b.moveTo(x-span,yy+16).bezierCurveTo(x-span*.55,yy-25,x+span*.6,yy-24,x+span,yy-8).stroke({color:i===1?l:c,width:3.5-i*.7,alpha:a*(1-t)*.8});}
  }else if(kind==='levitate'||kind==='phase'){
   for(let i=0;i<n;i++){const angle=i/n*Math.PI*2+p*2,rr=96*(1-p*.55),xx=x+Math.cos(angle)*rr,yy=y+70+Math.sin(angle)*rr*.8,size=(i%3+3)*(1-p*.4);b.poly([xx,yy-size*2,xx+size,yy,xx,yy+size*2,xx-size,yy]).fill({color:kind==='phase'?c:l,alpha:a*.7});}
   const radius=28+p*70;for(let i=0;i<3;i++){const angle=i*Math.PI*2/3-p*3;b.arc(x,y+80,radius,angle,angle+.65).stroke({color:c,width:2.2,alpha:a*.45});}
  }else if(kind==='bloom'){
   for(let i=0;i<n;i++){const angle=i/n*Math.PI*2,rr=25+p*80,xx=x+Math.cos(angle)*rr,yy=y+100+Math.sin(angle)*rr*.6-p*35;b.moveTo(xx,yy-7).quadraticCurveTo(xx+10,yy-4,xx,yy+9).quadraticCurveTo(xx-6,yy+1,xx,yy-7).fill({color:i%2?c:l,alpha:a*.7});}
  }else{
   // Tapered dust/contact strokes radiate along the floor, not water rings.
   for(let i=0;i<n;i++){const angle=Math.PI+i/n*Math.PI,rr=20+p*100,xx=x+Math.cos(angle)*rr,yy=218+Math.sin(angle)*rr*.18,len=18+25*p;g.moveTo(xx,yy).lineTo(xx+Math.cos(angle)*len,yy+Math.sin(angle)*len*.35).lineTo(xx+Math.cos(angle)*len*.6,yy+6).closePath().fill({color:i%3?c:l,alpha:a*(1-p)*.7});}
   if(kind==='dash'){for(let i=0;i<4;i++)b.moveTo(x-this.profile.side*2-i*9,y+70+i*18).lineTo(x-this.profile.side*.2,y+60+i*18).stroke({color:l,width:1.4,alpha:a*(1-p)*.5});}
  }
 }
 destroy(){this.back.destroy();this.front.destroy();}
}
