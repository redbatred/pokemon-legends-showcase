import {Graphics} from 'pixi.js';
/** Cue-driven cel animation: anticipation streaks, a single impact fan, then a foil slash. */
export class CardRevealEffects {
 readonly back=new Graphics();readonly front=new Graphics();
 private age=2;private charging=-1;private rare=false;private color=0x9cefff;private low=false;
 constructor(){this.back.blendMode='add';this.front.blendMode='add';}
 fire(color:number,rare:boolean,reduced:boolean,low:boolean){this.clear();if(reduced)return;this.age=0;this.color=color;this.rare=rare;this.low=low;}
 charge(amount:number,color:number,reduced:boolean,low:boolean){if(reduced){this.clear();return;}this.charging=amount;this.color=color;this.low=low;}
 clear(){this.charging=-1;this.age=2;this.back.clear();this.front.clear();}
 update(dt:number){
  const b=this.back.clear(),g=this.front.clear(),c=this.color;
  if(this.charging>=0){
   const p=this.charging,count=this.low?6:12;
   // Ink-like tapered speed strokes accelerate upwards; no idle orbiting dots.
   for(let i=0;i<count;i++){
    const side=i%2?1:-1,travel=(p*(1+i%3*.12)+i*.157)%1,x=side*(171+i%3*15),y=220-travel*455,len=(20+p*p*88)*travel;
    b.poly([x,y+len,x-side*3,y,x+side*2,y-len*.32,x+side*4,y+len*.4]).fill({color:c,alpha:p*travel*.6});
   }
   for(const side of [-1,1])g.moveTo(side*160,195).lineTo(side*160,230-p*375).stroke({color:0xdfffff,width:1.2,alpha:p*.85});
   return;
  }
  if(this.age>=1.1)return;this.age+=dt;
  const duration=this.rare?.95:.46,q=Math.min(1,this.age/duration);if(q>=1)return;
  const strike=Math.max(0,1-this.age/(this.rare?.35:.18)),travel=1-(1-q)**3;
  const count=this.low?8:this.rare?22:10;
  for(let i=0;i<count;i++){
   const a=i/count*Math.PI*2+.08,dx=Math.cos(a),dy=Math.sin(a),nx=-dy,ny=dx;
   const inner=1+travel*.12,outer=inner+(this.rare?.65:.25)*(1+i%3*.22)*travel;
   const ix=dx*168*inner,iy=dy*226*inner,ox=dx*168*outer,oy=dy*226*outer;
   const w=(this.rare?15:5)*(1-q)*(i%2?.55:1);
   b.poly([ix+nx*w,iy+ny*w,ox,oy,ix-nx*w*.4,iy-ny*w*.4]).fill({color:i%4?c:0xe5fbff,alpha:strike*(i%3?.65:.95)});
  }
  // Two hand-drawn zig-zag arcs snap outward on the hit, then vanish.
  if(this.rare&&this.age<.32)for(const side of [-1,1]){
   const x=side*(165+travel*52),a=strike*.9;
   const path=[x,-205,x+side*21,-150,x+side*5,-92,x+side*28,-35,x+side*15,24,x+side*22,85];
   b.poly(path,false).stroke({color:c,width:8*strike,alpha:a*.4}).poly(path,false).stroke({color:0xeaffff,width:2.1*strike,alpha:a});
  }
  const sweep=Math.max(0,(q-.12)/.88),alpha=Math.sin(sweep*Math.PI);
  for(const side of [-1,1]){
   const y=-211+sweep*420;
   g.moveTo(side*158,y-23).lineTo(side*158,y+23).stroke({color:c,width:6,alpha:alpha*.2}).moveTo(side*158,y-19).lineTo(side*158,y+19).stroke({color:0xffffff,width:1.6,alpha:alpha});
   if(this.rare)g.moveTo(side*145,-219).lineTo(side*(145-58*sweep),-219).stroke({color:0xffffff,width:1.5,alpha:alpha});
  }
 }
 destroy(){this.back.destroy();this.front.destroy();}
}
