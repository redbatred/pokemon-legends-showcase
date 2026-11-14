import {Container,Graphics,Text} from 'pixi.js';
import {CARD_REVEAL_AT,SHOWDOWNS,clamp,smooth,showdownLayout,type ShowdownId} from './showdownModel';
import {rewardPresentation} from './showdownImpact';
/** Sampled floor energy and reward framing. Every visible fragment belongs to a hit or reveal. */
export class ShowdownSpectacle {
 readonly floor=new Graphics();readonly reward=new Container();readonly foreground=new Graphics();
 private rays=new Graphics();private plate=new Graphics();private title=new Text({text:'',style:{fontFamily:'Nunito',fontSize:27,fontWeight:'900',fill:0xffecb1,stroke:{color:0x092846,width:5}}});
 constructor(){this.reward.addChild(this.rays,this.plate,this.title);this.title.anchor.set(.5);}
 sample(time:number,l:ReturnType<typeof showdownLayout>,id:ShowdownId,reduced:boolean){
  const floor=this.floor.clear(),front=this.foreground.clear(),rays=this.rays.clear(),plate=this.plate.clear(),age=time-CARD_REVEAL_AT,legendary=id==='legendary',intensity=legendary?1:.65;
  for(const strike of SHOWDOWNS.find(r=>r.id===id)!.strikes){
   const a=time-strike.at;if(reduced||a<0||a>1.15)continue;
   const u=clamp(a/1.15),r=30+smooth(u)*(strike.finisher?235:126),alpha=(1-u)*intensity;
   floor.ellipse(l.boss.x,l.boss.y+3,r,r*.25).stroke({color:strike.finisher?0xd8c5ff:0xffe1a0,width:3*(1-u)+1,alpha:alpha*.85});
   floor.ellipse(l.boss.x,l.boss.y+3,r*.75,r*.19).stroke({color:0x8cecff,width:1.5,alpha:alpha*.5});
   if(strike.finisher){for(let i=0;i<14;i++){const angle=i/14*Math.PI*2,x=l.boss.x+Math.cos(angle)*r,y=l.boss.y+Math.sin(angle)*r*.25;floor.moveTo(x,y).lineTo(x+Math.cos(angle)*24*(1-u),y+Math.sin(angle)*6*(1-u)).stroke({color:i%2?0xffe9a0:0xc2b2ff,width:2,alpha:alpha*.8});}}
  }
  this.reward.visible=age>=-.35;this.reward.alpha=smooth((age+.35)/.35);if(!this.reward.visible)return;
  const cx=l.card.x,cy=l.card.y,sw=l.cardScale,burst=rewardPresentation(age,1,reduced).burst;
  // A brief backlight belongs behind the foil print; the card owns its rim effects.
  if(burst>0)rays.ellipse(cx,cy,155*sw,210*sw).fill({color:0xd3bfff,alpha:burst*.12*intensity});
  this.title.text='MEWTWO VSTAR';this.title.style.fontSize=l.wide?27:21;this.title.position.set(cx,cy-262*sw);this.title.alpha=smooth((age-.45)/.3);
  const y=cy+235*sw+34,w=l.wide?168:139,h=34,visible=smooth((age-.9)/.25);
  plate.alpha=visible;plate.poly([cx-w-22,y,cx-w+2,y-h,cx+w-2,y-h,cx+w+22,y,cx+w-2,y+h,cx-w+2,y+h]).fill(0x082846).stroke({color:0x9aeaff,width:2});
  plate.poly([cx-w-26,y-13,cx-w-48,y-28,cx-w-27,y+15,cx-w-4,y+25,cx-w-18,y]).fill(0xffdda2);
  plate.poly([cx+w+26,y-13,cx+w+48,y-28,cx+w+27,y+15,cx+w+4,y+25,cx+w+18,y]).fill(0xffdda2);
  if(reduced)return;
  // Shield pieces travel into the prize, rather than adding unrelated confetti.
  if(age>=-.35&&age<.8){for(let i=0;i<22;i++){const u=clamp((age+.35-i*.018)/.65);if(u<=0||u>=1)continue;const a=i*2.399,ox=Math.cos(a)*(42+i*4),oy=Math.sin(a)*65,x=l.boss.x+(cx-l.boss.x)*smooth(u)+ox*Math.sin(Math.PI*u),y=l.boss.y-80+(cy-l.boss.y+80)*smooth(u)-Math.sin(Math.PI*u)*(105+oy),size=(1-u)*5+1;front.poly([x-size,y,x,y-size*1.5,x+size,y,x,y+size*1.5]).fill({color:i%3?0xc8b5ff:0xffe9b2,alpha:Math.sin(Math.PI*u)*.9});}}
  if(age>.48&&age<2.5){const u=clamp((age-.48)/2);for(let i=0;i<28;i++){const a=i*2.399,r=(130+160*smooth(u))*sw,x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*.85+u*u*45,size=(i%3+1)*(1-u)*intensity;front.moveTo(x-size*3,y).lineTo(x+size*3,y).moveTo(x,y-size*3).lineTo(x,y+size*3).stroke({color:i%3?0xa7edff:0xffe6a6,width:1.5,alpha:(1-u)*.85});}}
 }
}
