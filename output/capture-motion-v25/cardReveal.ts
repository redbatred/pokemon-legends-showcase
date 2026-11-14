import {createRewardCounter,heroLayout,plateBox} from './rewardCounter';
import {cardMotion,CARD} from './cardMotion';
import {cardLock,FINAL_HOLD,HERO,heroState,MULTIPLIER,multiplierFlight,POWER,rainCoin,tierLevel,windup} from './rewardMotion';
import {WIN_STAGES} from './winTimeline';
import {playbackTime} from './timing';
import {encounter,type EncounterProfile} from './encounter';
import {lightSwitch} from './lightLayer';
import {Container,Graphics,PerspectiveMesh,Sprite,Texture} from 'pixi.js';
import type {SkeletonData} from '@esotericsoftware/spine-pixi-v8';
import {createFoil} from '../../src/game/foil';
import {pokemonPower} from '../../src/game/powerProfiles';
import {juiceUp} from '../../src/game/winJuiceMotion';
import {juiceTextures} from '../../src/game/WinJuice';
import {playSound,type Sound} from '../../src/game/audio';
import {blend,caption,clamp,display,edgeFrame,fillPoly,floorPlane,GOLD,GOLD_LIGHT,GOLD_SHADE,hairline,hash,INK,lozenge,mix,out,RED,RED_LIGHT,RED_SHADE,shaft,slice,smooth,softBar,softCard,vignette} from './rewardKit';
export interface CardRevealAssets{card:Texture;back:Texture;fxData:SkeletonData;}
export interface CardRevealSample{time:number;w:number;h:number;portrait:boolean;originX:number;originY:number;}
/** The age at which the reward steps aside for the rival's closing remark; the hero layout is home again by then. */
const STEP_ASIDE=playbackTime(21.2)-playbackTime(18.5),SETTLE=STEP_ASIDE-.45;
/** How far the lens pushes in on each lock. */
const PUNCH=[0,.012,.02,.03,.042,.085];
/** Catch → a physical card → its multiplier → the prize tray → the award. One author for the whole reward: the room it
 * happens in, the card's turn and landing, the multiplier leaving it, every lock of the total and the final takeover. */
export function createCardReveal({card,back}:CardRevealAssets,profile:Pick<EncounterProfile,'name'|'bet'|'multiplier'>=encounter){
 // The scene's general light layer steps back: nothing else draws on the reward.
 lightSwitch.reward=false;
 const power=pokemonPower('/assets/pokemon/'+encounter.id+'.png'),light=power.light,tint=power.color,textures=juiceTextures();
 // The room takes each tier's colour: the Pokémon's own light, then blue, red, violet, brighter violet, gold.
 const ROOM=[light,0x3fa0ff,0xff4a55,0xa46bff,0xc79bff,0xffc531];
 const glow=(texture:Texture,anchorY=.5)=>{const s=new Sprite(texture);s.anchor.set(.5,anchorY);s.blendMode='add';s.alpha=0;return s;};
 const container=new Container(),stage=new Container(),composition=new Container(),front=new Container();
 // The stage: the cavern kept faintly visible, light from above, slow rays behind the card, a floor for the tray to stand on.
 const shade=new Sprite(vignette()),dark=new Sprite(Texture.WHITE),wash=new Sprite(Texture.WHITE),raysA=glow(textures.rays),raysB=glow(textures.rays),heroRays=glow(textures.rays),shafts=[0,1,2,3,4].map(()=>glow(shaft(),0)),floor=glow(floorPlane(),0),pool=glow(softBar());
 const farCoins=Array.from({length:44},()=>{const s=new Sprite(textures.coins[0]);s.anchor.set(.5);s.visible=false;return s;}),nearCoins=Array.from({length:10},()=>{const s=new Sprite(textures.coins[0]);s.anchor.set(.5);s.visible=false;return s;}),drains=Array.from({length:12},()=>{const s=glow(textures.streak);s.anchor.set(1,.5);return s;});
 const edgeGlow=glow(edgeFrame()),flash=new Sprite(Texture.WHITE);
 dark.tint=0x040b15;wash.blendMode='add';stage.addChild(shade,dark,wash,floor,pool,heroRays,raysB,raysA,...shafts,...farCoins,...drains);
 // The card.
 const physical=new Container(),shadow=new Sprite(softCard()),leak=glow(softCard()),edges=new Graphics(),rimLight=new Graphics();
 const rear=new PerspectiveMesh({texture:back,verticesX:6,verticesY:8}),face=new PerspectiveMesh({texture:card,verticesX:6,verticesY:8}),glare=new PerspectiveMesh({texture:card,verticesX:6,verticesY:8}),foil=createFoil(.8);
 const badge=new Container(),badgePlate=new Graphics(),badgeText=display(`${profile.multiplier}×`,40,0xfff6dc,RED_SHADE),badgeGlow=glow(softCard()),sparkles=Array.from({length:14},()=>glow(textures.star));
 const flyer=new Container(),flyerPlate=new Graphics(),flyerText=display(`×${profile.multiplier}`,30,0xfffbe6,GOLD_SHADE),trails=[0,1,2].map(()=>{const s=glow(textures.streak);s.anchor.set(1,.5);return s;}),strikeFlare=glow(hairline()),strikeCore=glow(hairline());
 const header=display(profile.name.toUpperCase(),44,0xfff6dc,0x16405e),rarityTab=new Graphics(),rarity=caption('LEGENDARY CAPTURED',16,0xfff6dc,3),mock=caption('MOCK REWARD',13,0x9fb6c6,3);
 const counter=createRewardCounter(profile);
 mock.style.stroke={color:INK,width:3,join:'round'};
 shadow.anchor.set(.5);shadow.tint=0x02070e;glare.blendMode='add';face.filters=[foil];badge.addChild(badgeGlow,badgePlate,badgeText);flyer.addChild(flyerPlate,flyerText);header.anchor.set(0,.5);rarity.anchor.set(0,.5);
 // The card-back image is a square-cornered picture with white outside its rounded border: redraw it once, cut to the card's shape.
 {const source=back.source,canvas=document.createElement('canvas');canvas.width=source.pixelWidth;canvas.height=source.pixelHeight;const c=canvas.getContext('2d',{willReadFrequently:true});
  if(c&&source.resource){c.beginPath();c.roundRect(0,0,canvas.width,canvas.height,canvas.width*.048);c.clip();c.drawImage(source.resource as CanvasImageSource,0,0,canvas.width,canvas.height);rear.texture=Texture.from(canvas);}}
 physical.addChild(shadow,leak,edges,rear,face,glare,rimLight,badge,...sparkles);
 composition.addChild(physical,counter.container,rarityTab,header,rarity,mock,...trails,flyer,strikeFlare,strikeCore);front.addChild(...nearCoins,edgeGlow);container.addChild(stage,composition,front,flash);container.eventMode='none';
 let badgeSize=0,lastAge=-99,tick=-9;
 const cue=(name:string,gain:number,rate=1)=>playSound(name as Sound,{gain,rate});
 function sample({time:t,w,h,portrait,originX,originY}:CardRevealSample){
  container.visible=t>=12.45&&t<17.5;if(!container.visible){lastAge=-99;return;}container.alpha=1-smooth((t-17.2)/.3);
  const age=playbackTime(t+4.45)-playbackTime(18.5),motion=cardMotion(age),flight=multiplierFlight(age),lv=tierLevel(age),lock=cardLock(age),drain=windup(age),final=WIN_STAGES.at(-1)!.end,finalAge=age-final,last=WIN_STAGES.length;
  const hero=heroState(age,SETTLE),place=heroLayout(w,h,portrait),box=plateBox(w,h,portrait),k=hero.out,post=out((playbackTime(t+4.45)-playbackTime(21.2))/.32);
  // The room's colour and strength follow the tier, changing over a quarter of a second after each lock.
  const turn=smooth(lv.since/.28),colour=blend(ROOM[Math.max(0,lv.level-1)],ROOM[lv.level],turn),strength=mix(POWER[Math.max(0,lv.level-1)],lv.power,turn),burst=lv.level?Math.exp(-Math.max(0,lv.since-(lv.level===last?FINAL_HOLD:0))*5)*(.35+.65*lv.power):0,enter=smooth((t-12.65)/.7),lit=smooth((age-CARD.land)/.5);
  // The lens: a push-in on the card's landing and on every lock, further each tier, held through the final hit-stop.
  const kick=lv.level?PUNCH[lv.level]*(lv.level===last&&finalAge<FINAL_HOLD?1:Math.exp(-Math.max(0,lv.since-(lv.level===last?FINAL_HOLD:0))*6)):0,punch=.022*motion.impact+kick+.014*drain;
  // For the rival's closing remark the whole reward steps back and up, clear of the portrait and the speech balloon.
  const shrink=(portrait?.2:.12)*post,zoom=(1-shrink)*(1+punch),pivotX=w*.5,pivotY=h*.45;composition.scale.set(zoom);composition.position.set(w*shrink/2-pivotX*punch*(1-shrink),-h*(portrait?.012:.025)*post-pivotY*punch*(1-shrink));
  const screen=(x:number,y:number)=>[composition.x+x*zoom,composition.y+y*zoom] as const;
  // Layers at other depths move by different amounts when the lens pushes: the room less, the near coins more.
  stage.scale.set(1+punch*.4);stage.position.set(-pivotX*punch*.4,-pivotY*punch*.4);front.scale.set(1+punch*1.9);front.position.set(-pivotX*punch*1.9,-pivotY*punch*1.9);
  const cx=mix(w*(portrait?.5:.33),place.cardX,k),cy=mix(h*(portrait?.38:.52),place.cardY,k),ch=h*(portrait?.47:.68),cw=ch*card.width/card.height,thick=cw*.03,focal=h*1.7;
  // Rise: it leaves the ball lying back on the ball's light and stands up as it climbs toward the lens. Afterwards every lock moves it.
  const rise=out((t-13)/.65),stand=smooth((t-13)/.6),swing=hero.active?Math.exp(-(hero.s-HERO.launch)*4.5)*Math.cos((hero.s-HERO.launch)*8.5):0,lifted=mix(.1,1,rise)*motion.scale*lock.scale*mix(1,place.cardScale,k),tremble=motion.tremble+drain*.5;
  const px=mix(originX,cx,rise)+Math.sin(age*71)*tremble*h*.0035,py=mix(originY,cy,rise)-Math.sin(rise*Math.PI)*h*.05+Math.sin(age*59)*tremble*h*.003+(age>.9?Math.sin((age-.9)*1.3)*h*.004:0)-lock.lift*h;
  const yaw=motion.yaw+motion.swayYaw+(1-stand)*.55+lock.yaw+(lv.level===last?swing*.5-lock.yaw:0),pitch=(1-stand)**1.4*1.1+motion.swayPitch-.07*motion.tremble+lock.pitch,roll=mix(-.3,0,rise)+motion.rotation+Math.sin(age*83)*tremble*.012;
  const cosY=Math.cos(yaw),sinY=Math.sin(yaw),cosP=Math.cos(pitch),sinP=Math.sin(pitch),cosR=Math.cos(roll),sinR=Math.sin(roll);
  const project=(x:number,y:number,z:number)=>{const x1=x*cosY+z*sinY,z1=-x*sinY+z*cosY,y2=y*cosP-z1*sinP,z2=y*sinP+z1*cosP,s=focal/(focal-z2*lifted)*lifted,sx=x1*s,sy=y2*s;return [sx*cosR-sy*sinR,sx*sinR+sy*cosR] as const;};
  physical.visible=t>=13;physical.alpha=smooth((t-13)/.05);physical.position.set(px,py);
  const facing=cosY*cosP>0,z=facing?thick/2:-thick/2,flip=facing?1:-1,quad=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([sx,sy])=>project(sx*flip*cw/2,sy*ch/2,z)),mesh=facing?face:rear;
  face.visible=glare.visible=facing;rear.visible=!facing;mesh.setCorners(quad[0][0],quad[0][1],quad[1][0],quad[1][1],quad[2][0],quad[2][1],quad[3][0],quad[3][1]);
  if(facing)glare.setCorners(quad[0][0],quad[0][1],quad[1][0],quad[1][1],quad[2][0],quad[2][1],quad[3][0],quad[3][1]);
  // Thickness: whichever cut edges face the lens are drawn as paper, lit by how squarely they face it.
  edges.clear();const sides:[number,number[][]][]=[[-sinY*cosP,[[1,-1],[1,1]]],[sinY*cosP,[[-1,1],[-1,-1]]],[-sinP,[[-1,-1],[1,-1]]],[sinP,[[1,1],[-1,1]]]];
  for(const [normal,[a,b]] of sides){if(normal<=.002)continue;const p=[project(a[0]*cw/2,a[1]*ch/2,thick/2),project(b[0]*cw/2,b[1]*ch/2,thick/2),project(b[0]*cw/2,b[1]*ch/2,-thick/2),project(a[0]*cw/2,a[1]*ch/2,-thick/2)].flat();edges.poly(p).fill(normal>.5?0xf4f7fa:0xc9d3dc).poly(p).stroke({color:0x54616e,width:1,alpha:.8});}
  // Shadow parts from the card as it comes toward the lens; light builds behind it while it hangs, and grows with every tier after.
  const height=clamp((motion.scale*lock.scale-1)/.085)*.7+.3*rise+lock.lift*14,flat=Math.max(.08,Math.abs(cosY)),heroFlare=hero.active?Math.exp(-(hero.s-HERO.launch)*6):0;
  shadow.position.set(h*(.012+.03*height),h*(.02+.05*height));shadow.width=cw*1.72*lifted*flat*(1+.1*height);shadow.height=ch*1.52*lifted*(1+.1*height)*Math.max(.3,cosP);shadow.alpha=(.62-.25*Math.min(1,height))*rise;shadow.rotation=roll;
  leak.width=cw*(2.3+1.1*strength)*lifted*Math.max(.35,flat);leak.height=ch*(1.9+.7*strength)*lifted;leak.tint=age<CARD.land?light:colour;leak.alpha=Math.min(1,motion.leak*(.6+.12*Math.sin(age*23))+.5*motion.impact+lit*(.14+.5*strength+.4*burst));leak.rotation=roll;
  const rimAlpha=Math.min(1,Math.max(motion.leak*.7+motion.impact,lv.level?burst*.9+(lv.level>=3?.3*strength:0):0,heroFlare));rimLight.clear();if(rimAlpha>.01){const p=quad.flat();rimLight.poly(p).stroke({color:lv.level&&age>CARD.land+.3?colour:light,width:5,alpha:rimAlpha}).poly(p).stroke({color:0xffffff,width:1.6,alpha:rimAlpha});}
  // The face lands: held white for the frames of contact, then one hard highlight crosses the foil. Later locks send their own across it.
  glare.alpha=Math.max(motion.impact*.85,heroFlare*.75);
  const u=foil.resources.foil.uniforms;u.uTime=t;u.uTilt=age<CARD.land?-.8:(motion.swayYaw+lock.yaw)*3.2+.25*motion.sweep*(1-smooth((age-1.2)/.6));u.uTiltY=(motion.swayPitch+lock.pitch)*2.4;u.uSweep=lock.sweep??(motion.sweep<1.29?motion.sweep:.25*Math.sin(age*.5));u.uStrength=age<1.5?.95:.62+.33*strength;u.uLightStrength=.5*motion.impact+.12*Math.exp(-Math.max(0,age-CARD.land)*4)+lock.light*.6;u.uLightColor=lv.level?[((colour>>16)&255)/255,((colour>>8)&255)/255,(colour&255)/255]:[.55,.8,1];
  // Sparkles walk the card's edges once the tiers start to matter.
  const twinkles=[0,0,3,6,9,14][lv.level];sparkles.forEach((star,i)=>{const period=.5+hash(i)*.5,clock=(age+hash(i+7)*3)/period,cycle=Math.floor(clock),phase=clock-cycle,s=hash(i*31+cycle*17)*4,side=Math.floor(s),v=s-side-.5;star.visible=facing&&i<twinkles;if(!star.visible)return;
   const at=side===0?project(v*cw,-ch/2,z):side===1?project(cw/2,v*ch,z):side===2?project(v*cw,ch/2,z):project(-cw/2,v*ch,z);star.position.set(at[0],at[1]);star.scale.set(ch*(.05+.05*hash(i+3))*(.6+.6*lv.power)*Math.sin(phase*Math.PI)/128);star.rotation=phase*1.1;star.alpha=Math.sin(phase*Math.PI);star.tint=lv.level===last?(i%2?0xffffff:0xffe08a):blend(colour,0xffffff,.55);});
  // The multiplier is the card's own value: stamped on its face, it charges and leaves for the tray.
  const size=Math.round(ch*.13);if(size!==badgeSize){badgeSize=size;const bw=size*2.7;badgePlate.clear();fillPoly(badgePlate,lozenge(bw+8,size+8,size*.5+3).map((v,i)=>i%2?v+5:v),INK,INK,0,.5);fillPoly(badgePlate,lozenge(bw+6,size+6,size*.5+2),GOLD,INK,4);badgePlate.poly(lozenge(bw-4,size-4,size*.5-2)).fill(RED).poly(slice(bw-4,size-4,size*.5-2,-size*.4,-size*.12)).fill(RED_LIGHT).poly(slice(bw-4,size-4,size*.5-2,size*.28,size*.5,2)).fill(RED_SHADE).poly(lozenge(bw-4,size-4,size*.5-2)).stroke({color:INK,width:2.5,join:'round'});badgeText.style.fontSize=size*.82;badgeText.position.set(0,-size*.04);
   const fw=size*2.3;flyerPlate.clear().poly(lozenge(fw,size*.86,size*.36)).fill(GOLD).poly(slice(fw,size*.86,size*.36,-size*.34,-size*.1)).fill(GOLD_LIGHT).poly(slice(fw,size*.86,size*.36,size*.26,size*.43,2)).fill(GOLD_SHADE).poly(lozenge(fw,size*.86,size*.36)).stroke({color:INK,width:3.5,join:'round'});flyerText.style.fontSize=size*.5;flyerText.position.set(0,-size*.03);}
  const anchor=project(cw*.2,ch*.4,thick/2+4),stamp=juiceUp(flight.stampAge,.75,.1),paid=juiceUp(age-5.62,.4,.05),spent=flight.docked?.92:1;
  badge.visible=facing&&flight.stamped;badge.position.set(anchor[0],anchor[1]);badge.rotation=roll-.06+stamp.rotation+paid.rotation;badge.scale.set(lifted*stamp.scale*paid.scale*(1+.14*flight.charge)*spent);
  badgeGlow.width=size*5;badgeGlow.height=size*3.4;badgeGlow.tint=GOLD_LIGHT;badgeGlow.alpha=flight.charge*.9+(age>=5.62?Math.exp(-(age-5.62)*4)*.7:0);
  // It crosses to the socket on an arc, dragging light, and seats on the frame the count begins.
  const target=counter.socket(w,h,portrait),fx=px+anchor[0],fy=py+anchor[1],tx=mix(fx,target.x,flight.travel),ty=mix(fy,target.y,flight.travel)-flight.arc*h*.07;
  flyer.visible=flight.flying;flyer.position.set(tx,ty);flyer.rotation=-.06+flight.arc*.5;flyer.scale.set(mix(1.1,target.width/Math.max(1,size*2.3),flight.travel)*(1+.2*flight.arc));
  trails.forEach((s,i)=>{const lag=.05+i*.05,v=multiplierFlight(age-lag),lx=mix(fx,target.x,v.travel),ly=mix(fy,target.y,v.travel)-v.arc*h*.07;s.visible=flight.flying&&v.flying;s.position.set(tx,ty);s.rotation=Math.atan2(ty-ly,tx-lx);s.width=Math.hypot(tx-lx,ty-ly)*1.6+8;s.height=size*(.9-i*.22);s.tint=i?GOLD_LIGHT:0xffffff;s.alpha=.75-i*.2;});
  const hit=flight.docked?flight.strike:0;strikeFlare.visible=strikeCore.visible=hit>.02;strikeFlare.position.set(target.x,target.y);strikeCore.position.copyFrom(strikeFlare.position);strikeFlare.width=box.width*1.25*(1.1-.4*hit);strikeFlare.height=h*.012;strikeFlare.tint=GOLD_LIGHT;strikeFlare.alpha=hit;strikeCore.width=strikeFlare.width*.5;strikeCore.height=h*.005;strikeCore.alpha=hit;
  // Header: the name in the display face, the catch on a red tab beneath it.
  const left=cx-cw*mix(1,place.cardScale,k)/2,nameSize=h*(portrait?.05:.06);header.style.fontSize=nameSize;header.style.dropShadow={color:tint,alpha:1,blur:0,distance:Math.max(3,nameSize*.1),angle:Math.PI/2};header.scale.set(1);header.scale.set(Math.min(1,cw/Math.max(1,header.width)));header.position.set(left,h*(portrait?.054:.058));header.alpha=smooth((t-12.85)/.3);
  const tabIn=out((age-.28)/.3),tabSize=h*(portrait?.0155:.019);rarity.style.fontSize=tabSize;const tabW=rarity.width+tabSize*2.6,tabH=tabSize*2.1,tabY=h*(portrait?.106:.117);
  rarityTab.clear();rarityTab.visible=rarity.visible=tabIn>0;fillPoly(rarityTab,lozenge(tabW,tabH,tabH*.5).map((v,i)=>i%2?v+tabY:v+left+tabW/2-tabH*.2-(1-tabIn)*24),RED,INK,3,tabIn);rarity.position.set(left+tabSize*1.1-(1-tabIn)*24,tabY);rarity.alpha=tabIn;
  counter.sample(age,w,h,portrait,SETTLE);
  mock.style.fontSize=h*(portrait?.0135:.017);mock.position.set(portrait?w/2:mix(box.x,place.x,k),h*(portrait?.987:mix(.756,.8,k)));mock.alpha=smooth((age-.9)/.3)*.9*(1-Math.min(1,4*k*(1-k)*1.6));
  // ── The room ──
  const [sx,sy]=screen(px,py),[trayX,trayY]=screen(box.x,box.y),[heroX,heroY]=screen(place.x,(place.titleY+place.totalY)/2),present=hero.active?smooth((hero.s-HERO.launch)/.25):0;
  shade.width=w;shade.height=h;shade.alpha=enter;dark.width=w;dark.height=h;dark.alpha=enter*(.2*(1-lit)+.26*drain);
  wash.width=w;wash.height=h;wash.tint=colour;wash.alpha=enter*lit*(strength*.15+burst*.2)*(1-.8*drain);
  // Slow rays behind the card, larger and stronger with every tier; they pull in tight while the room drains.
  const reach=ch*zoom*(1.9+2.5*strength)*(1-.42*drain)/512,raysOn=lit*(.1+.42*strength+.35*burst)*(1-.3*drain);
  raysA.position.set(sx,sy);raysA.scale.set(reach);raysA.rotation=age*.11;raysA.tint=colour;raysA.alpha=raysOn;raysB.position.set(sx,sy);raysB.scale.set(reach*1.3);raysB.rotation=1-age*.07;raysB.tint=blend(colour,0xffffff,.5);raysB.alpha=raysOn*.6;
  // After the final lock gold rays fill the room from the award, and stay behind the tray until the fade.
  heroRays.position.set(mix(heroX,trayX,hero.returning),mix(heroY,trayY,hero.returning));heroRays.scale.set(Math.hypot(w,h)*1.5/512*(.55+.45*present));heroRays.rotation=.6+age*.09;heroRays.tint=0xffd36a;heroRays.alpha=present*(.62-.2*hero.returning);
  // Shafts from above converge on the card: one at first, more with each tier; they narrow and brighten while the room drains.
  shafts.forEach((beam,i)=>{const from=i===2?0:i===1?1:i===3?2:i===0?3:4,on=i===2?Math.max(smooth((t-13)/.5)*.5,lit):lv.level>from?1:lv.level===from?turn:0,topX=sx+(i-2)*w*(portrait?.25:.14),topY=-h*.12,dx=sx-topX,dy=sy-topY;
   beam.position.set(topX,topY);beam.rotation=Math.atan2(-dx,dy);beam.height=Math.hypot(dx,dy)+ch*zoom*.62;beam.width=cw*zoom*(1.05+.35*Math.abs(i-2))*(1-.45*drain);beam.tint=blend(colour,0xffffff,.35);beam.alpha=Math.min(.8,on*(.11+.17*strength+.22*burst)*(1+.9*drain)*enter);});
  // The floor the tray stands on, lit along its far edge, with the tier's light pooled under the tray.
  const horizon=h*(portrait?.775:.632);floor.position.set(w/2,horizon);floor.width=w*1.6;floor.height=h-horizon+12;floor.tint=blend(0xa9cbee,colour,.25+.5*strength);floor.alpha=enter*(.5+.35*strength+.2*burst)*(1-.4*drain);
  pool.position.set(trayX,trayY+box.height*zoom*.52);pool.width=box.width*zoom*1.3;pool.height=box.height*zoom*.6;pool.tint=colour;pool.alpha=enter*smooth((age-.7)/.3)*(.2+.32*strength+.3*burst)*(1-k);
  // Wind-up: streaks of the room's light run in to the card and the tray.
  drains.forEach((streak,i)=>{const phase=(age*1.5+hash(i))%1,angle=i/12*Math.PI*2+hash(i+20),fromX=w/2+Math.cos(angle)*w*.78,fromY=h*.45+Math.sin(angle)*h*.62,toX=i%3===2?trayX:sx,toY=i%3===2?trayY:sy,e=phase*phase;
   streak.visible=drain>.01;if(!streak.visible)return;streak.position.set(mix(fromX,toX,e),mix(fromY,toY,e));streak.rotation=Math.atan2(toY-fromY,toX-fromX);streak.width=(1-e)*w*.24+18;streak.height=h*.008*(2-e);streak.tint=blend(colour,0xffffff,.45);streak.alpha=drain*Math.sin(Math.PI*phase)*.85;});
  // Coin rain with depth: small ones far behind everything, large ones down the outer edges in front.
  const rain=hero.s-.3;farCoins.forEach((coin,i)=>{const c=hero.active?rainCoin(i,rain,false):null;coin.visible=!!c;if(!c)return;coin.texture=textures.coins[Math.floor(((c.spin/Math.PI)%1+1)%1*8)%8];coin.position.set(w/2+c.x*w/2,c.y*h);coin.scale.set(c.size*h/64);coin.alpha=.8;});
  nearCoins.forEach((coin,i)=>{const c=hero.active?rainCoin(i,rain-.15,true):null;coin.visible=!!c;if(!c)return;coin.texture=textures.coins[Math.floor(((c.spin/Math.PI)%1+1)%1*8)%8];coin.position.set(w/2+c.x*w/2,c.y*h);coin.scale.set(c.size*h/64);});
  // The frame itself glows: the tier's colour on the bigger locks, gold for the award.
  edgeGlow.position.set(w/2,h/2);edgeGlow.width=w;edgeGlow.height=h;edgeGlow.tint=lv.level===last?0xffc531:colour;edgeGlow.alpha=Math.max(lv.level>=2&&lv.level<last?burst*.45*strength:0,present*(.6+.08*Math.sin(age*2.2)))+drain*.0;
  // One white frame for each landing: light on the card's, a touch on the bigger locks, full on the final total.
  flash.width=w;flash.height=h;flash.alpha=Math.max(.22*motion.impact*(age<CARD.land+CARD.hold+.02?1:0),finalAge>=0?(finalAge<.045?.85:.85*Math.exp(-(finalAge-.045)*15)):0,hit*.14,lv.level>=2&&lv.level<last&&lv.since<.05?.1+.16*lv.power:0);
  // Sound follows the same causes. Nothing plays when the clock is scrubbed or jumped.
  const crossed=(at:number)=>lastAge<at&&age>=at&&age-lastAge<.25;
  if(crossed(CARD.wind))cue('flip',.8);if(crossed(CARD.land))cue('cap-card',.8);if(crossed(MULTIPLIER.stamp))cue('cap-mult',.7);if(crossed(MULTIPLIER.strike))cue('win-stamp',.75);
  if(crossed(WIN_STAGES.at(-2)!.end+.22))cue('charge',.55,1.25);if(crossed(final+HERO.title))cue('win-stamp',.8);if(crossed(final+HERO.total))cue('slam',.8);if(crossed(final+.6))cue('win-coins-2',.6);
  WIN_STAGES.forEach((stage,i)=>{const end=i===last-1;if(crossed(stage.end)){if(end){cue('win-final-4',.9);cue('win-coins-3',.75);}else{cue('win-rung-'+Math.min(3,i+1),.6+.08*i);cue('win-coins-1',.5+.08*i);if(i>=2)cue('slam',.35+.12*i);}}
   if(age>=stage.start&&age<stage.end&&age-lastAge<.25&&age-tick>=.07){tick=age;cue('win-tick',.5+.1*i,.9+.11*i+.35*(age-stage.start)/(stage.end-stage.start));}});
  if(age<tick)tick=-9;lastAge=age;
 }
 return{container,sample,setGuideVisible(visible:boolean){mock.visible=!visible;counter.setGuideVisible(visible);}};
}
