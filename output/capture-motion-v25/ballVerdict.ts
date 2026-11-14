import {verdictAge} from './choreography';
import {Container,Graphics,Sprite} from 'pixi.js';
import {juiceUp} from '../../src/game/winJuiceMotion';
import {slice,caption,CREAM,CREAM_SHADE,display,fillPoly,GOLD,GOLD_LIGHT,hairline,INK,lozenge,out,RED,RED_LIGHT,RED_SHADE,smooth,STEEL,STEEL_LIGHT,STEEL_SHADE} from './rewardKit';
/** Seconds after the verdict that the stamp meets the screen. */
export const STAMP_LAND=.09;
/** How the stamp arrives: it drops in large, lands, rings out once and holds. Pure, so the scene can be scrubbed. */
export function stampMotion(age:number,caught:boolean){
 const fall=Math.min(1,Math.max(0,age)/STAMP_LAND),landed=age-STAMP_LAND,ring=juiceUp(landed,.5,.05),leave=caught?.32:1.1;
 return {scale:(landed<0?1+1.1*(1-fall)**2:ring.scale),rotation:-.045+(landed<0?.12*(1-fall):ring.rotation),height:1-fall,contact:landed<0?0:Math.exp(-landed*13),
  alpha:smooth(age/.04)*(1-smooth((age-leave)/.18)),tag:out((landed-.03)/.14),visible:age>=0&&age<(caught?.5:1.3)};
}
/** One settled verdict follows the ball's physical lock or breakout, never a fake win.
 * A struck plate in the reward's own language: Poké Ball red with a gold rim for a catch, cold steel for a break-out. */
export function createBallVerdict(){
 const container=new Container(),shadow=new Graphics(),tag=new Container(),tagPlate=new Graphics(),detail=caption('',20,0x18394b,3.5),plate=new Graphics(),title=display('',84,0xfff6dc,RED_SHADE),shine=display('',84,0xffffff,0xffffff),flares=[new Sprite(hairline()),new Sprite(hairline())];
 shine.blendMode='add';shine.style.stroke={color:0xffffff,width:0};shine.style.dropShadow=false;for(const flare of flares){flare.anchor.set(.5);flare.blendMode='add';}
 tag.addChild(tagPlate,detail);container.addChild(...flares,shadow,tag,plate,title,shine);container.eventMode='none';
 let drawn='';
 function sample(t:number,caught:boolean,w:number,h:number){
  const age=verdictAge(t,caught?'capture':'escape'),m=stampMotion(age,caught);container.visible=m.visible;if(!m.visible)return;
  // A catch is stamped above the ball. A break-out belongs to the Pokémon taking its shape back, so its stamp keeps off the body:
  // a lower third under its feet in the tall frame (the commentary line is away for exactly this beat), up beside it in the wide one.
  const wide=w>h,[x,y,W]=caught?[w/2,h*(wide?.2:.27),Math.min(w*.66,480)]:wide?[w*.16,h*.31,Math.min(w*.28,360)]:[w/2,h*.885,Math.min(w*.6,420)],H=W*.25,key=`${Math.round(W)}:${caught}`;
  if(key!==drawn){drawn=key;const [face,lit,lip,rim]=caught?[RED,RED_LIGHT,RED_SHADE,GOLD]:[STEEL,STEEL_LIGHT,STEEL_SHADE,0xdfe9f2];
   shadow.clear();fillPoly(shadow,lozenge(W+16,H+16,H*.5+6),INK,INK,0,.55);
   plate.clear();fillPoly(plate,lozenge(W+12,H+12,H*.5+5),rim,INK,5);plate.poly(lozenge(W-2,H-2,H*.5-1)).fill(face).poly(slice(W-2,H-2,H*.5-1,-H*.4,-H*.12,8)).fill(lit).poly(slice(W-2,H-2,H*.5-1,H*.3,H*.5,3)).fill(lip).poly(lozenge(W-2,H-2,H*.5-1)).stroke({color:INK,width:3.5,join:'round'});void GOLD_LIGHT;
   const tagW=W*.78;tagPlate.clear().poly(lozenge(tagW,H*.44,H*.22)).fill(CREAM).poly(slice(tagW,H*.44,H*.22,H*.1,H*.22,2)).fill(CREAM_SHADE).poly(lozenge(tagW,H*.44,H*.22)).stroke({color:INK,width:3.5,join:'round'});
   title.text=shine.text=caught?'CAUGHT!':'BROKE FREE!';title.style.fontSize=shine.style.fontSize=Math.min(H*.74,(W-H)/(title.text.length*.47));title.style.dropShadow={color:lip,alpha:1,blur:0,distance:Math.max(3,H*.07),angle:Math.PI/2};
   detail.text=caught?'BONUS CARD SECURED':'NO BONUS AWARDED';detail.style.fontSize=H*.17;detail.scale.set(1);detail.scale.set(Math.min(1,(tagW-H*.44-14)/Math.max(1,detail.width)));}
  container.position.set(x,y);container.alpha=m.alpha;container.rotation=m.rotation;container.scale.set(m.scale);
  // It falls toward the screen: the shadow closes up under it and the contact throws one flare along its length.
  shadow.position.set(6+30*m.height,8+38*m.height);shadow.alpha=1-.5*m.height;title.position.set(0,-H*.03);shine.position.copyFrom(title.position);shine.alpha=m.contact*.9;
  tag.position.set(0,H*.5+H*.22*m.tag);tag.alpha=m.tag;tag.scale.set(.9+.1*m.tag);
  flares.forEach((flare,i)=>{flare.visible=m.contact>.02;flare.position.set(0,i?H*.08:-H*.05);flare.width=W*(1.5+.9*(1-m.contact))*(i?.7:1);flare.height=H*(i?.05:.09);flare.tint=caught?GOLD_LIGHT:0xcfe6ff;flare.alpha=m.contact*(i?.9:.7);});
 }
 return{container,sample};
}
