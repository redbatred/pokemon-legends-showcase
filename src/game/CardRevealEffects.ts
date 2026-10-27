import {Graphics} from 'pixi.js';
/** Short local effects, with no filters or persistent particle allocations. */
export class CardRevealEffects {
 readonly back=new Graphics();readonly front=new Graphics();
 private age=2;private charging=-1;private rare=false;private color=0x9cefff;private low=false;
 constructor(){this.back.blendMode='add';this.front.blendMode='add';}
 fire(color:number,rare:boolean,reduced:boolean,low:boolean){this.clear();if(reduced)return;this.age=0;this.color=color;this.rare=rare;this.low=low;}
 charge(amount:number,color:number,reduced:boolean,low:boolean){if(reduced){this.clear();return;}this.charging=amount;this.color=color;this.low=low;}
 clear(){this.charging=-1;this.age=2;this.back.clear();this.front.clear();}
 update(dt:number){
  if(this.charging>=0){
   const p=this.charging,c=this.color,b=this.back.clear(),g=this.front.clear(),strength=p*p;
   b.roundRect(-166,-226,332,452,15).stroke({color:c,width:12,alpha:strength*.18}).roundRect(-163,-223,326,446,12).stroke({color:c,width:3,alpha:p*.65});
   for(let i=0;i<(this.low?6:12);i++){
    const side=i%2?1:-1,x=side*(164+12*(i%3)),travel=(p*(1.5+i%3*.2)+i*.17)%1,y=208-travel*420,length=8+strength*26;
    g.moveTo(x,y+length).lineTo(x+side*2,y).stroke({color:i%3?c:0xf4ffff,width:i%3?1.6:2.5,alpha:p*travel});
   }
   return;
  }
  if(this.age>=1.4)return;this.age+=dt;const t=this.age,d=this.rare?1.25:.78,q=Math.min(1,t/d),alpha=Math.sin(q*Math.PI),c=this.color,b=this.back.clear(),g=this.front.clear();if(q>=1)return;
  const expand=1-Math.pow(1-q,3),count=this.low?6:this.rare?18:10;
  if(this.rare&&q<.45){const hit=1-q/.45;for(const side of [-1,1]){
   b.poly([side*142,-190,side*(195+expand*65),-260,side*178,-115]).fill({color:c,alpha:hit*.45});
   b.moveTo(side*145,-205).lineTo(side*(190+expand*90),-265).stroke({color:0xf1ffff,width:3*hit,alpha:hit*.85});
  }}
  // Short perimeter streaks give the foil a crisp glint without covering print.
  const offset=(q*2)%1;
  for(const side of [-1,1]){
    const x=side*160,y=-210+offset*410;
    g.moveTo(x,y-22).lineTo(x,y+20).stroke({color:c,width:7,alpha:alpha*.18}).moveTo(x,y-18).lineTo(x,y+18).stroke({color:0xf4ffff,width:1.6,alpha:alpha*.85});
    g.moveTo(side*152,-224).lineTo(side*(152-35*alpha),-224).stroke({color:c,width:2,alpha:alpha*.8});
  }
  for(let i=0;i<count;i++){
    const angle=i/count*Math.PI*2+.21,rx=166+expand*(this.rare?100:48),ry=225+expand*(this.rare?65:35);
    const x=Math.cos(angle)*rx,y=Math.sin(angle)*ry,life=Math.max(0,1-q-i%3*.08),r=(this.rare?6:3)*life;
    if(this.rare&&i%3===0){const innerX=Math.cos(angle)*170,innerY=Math.sin(angle)*226;b.moveTo(innerX,innerY).lineTo(x,y).stroke({color:c,width:4*life,alpha:alpha*.5});}
    g.poly([x,y-r*2.2,x+r*.35,y-r*.35,x+r*1.2,y,x+r*.35,y+r*.35,x,y+r*2.2,x-r*.35,y+r*.35,x-r*1.2,y,x-r*.35,y-r*.35]).fill({color:i%3?c:0xffffff,alpha:life*alpha});
  }
 }
 destroy(){this.back.destroy();this.front.destroy();}
}
