import {Container,Graphics,Sprite,Text,Texture} from 'pixi.js';
import {juiceTextures} from '../../src/game/WinJuice';
import {RevealJuice} from '../../src/game/RevealJuice';
import {pokemonPower} from '../../src/game/powerProfiles';
import {juiceUp,TIER_PALETTE} from '../../src/game/winJuiceMotion';
import {playSound,setSound,preloadCaptureAudio,preloadWinAudio,type Sound} from '../../src/game/audio';
import {WIN_STAGES} from './winTimeline';
import {encounter} from './encounter';

/** Parts of this layer that another module has taken over can be switched off. */
export const lightSwitch={reward:true};
export interface LightSample{t:number;rewardAge:number;/** 0..1: the reward composition steps aside for the guide's closing remark. */post:number;w:number;h:number;portrait:boolean;caught:boolean;now:number;
 ball:{x:number;y:number;visible:boolean};/** Where the ball rests for the checks, and how far it is rolled over right now. */rest:{x:number;y:number};ballRoll:number;/** The ball on screen, after the scene's camera. */ballScreen:{x:number;y:number};chest:{x:number;y:number};feet:{x:number;y:number};floorY:number;card:{x:number;y:number;width:number;height:number};counter:{x:number;y:number;height:number};}
const KNOCKS=[9.8,10.65,11.5],LADDER=['big','mega','epic','epic','legendary'] as const,TITLES={big:'BIG WIN',mega:'MEGA WIN',epic:'EPIC WIN',legendary:'LEGENDARY WIN'};
const LEFT=Math.PI,RIGHT=0,UP=-Math.PI/2;
/** Light for the encounter's own beats. It reads the scene's clock and positions and never changes them: every flare,
 * streak and spark answers something the ball, the Pokémon, the card or the count just did, and points the way it went.
 * No rings: impacts are a point of light with a flare across it, floors take a kick of light along them, a lock is a pillar and stars. */
export function createLightLayer(){
 const power=pokemonPower('/assets/pokemon/'+encounter.id+'.png'),tint=power.color,light=power.light;
 // The capture energy has its own strong colour per encounter, so a pale Pokémon in a pale cave still reads as light.
 const energy=({lugia:0x2fa8ff,mewtwo:0xb06cff} as Record<string,number>)[encounter.id]??tint;
 const world=new RevealJuice(false),reward=new RevealJuice(false),ladder=new Container();
 const style={fontFamily:'BattleDisplay, Nunito, Arial',fontWeight:'400' as const,fontSize:64};
 const label=new Text({text:'',style:{...style,fill:0xffffff,stroke:{color:0x061b32,width:8},dropShadow:{color:0x1c5f8f,blur:0,distance:8,angle:Math.PI/2}},resolution:2}),shine=new Text({text:'',style:{...style,fill:0xffffff},resolution:2});
 label.anchor.set(.5);shine.anchor.set(.5);shine.blendMode='add';ladder.addChild(label,shine);ladder.eventMode='none';ladder.visible=false;
 // Behind the reward card: slow rays and a glow that warm up as the count climbs. Over the cavern during the checks: the room
 // falls away around the ball, so the three shakes play in a pool of light.
 const textures=juiceTextures(),halo=new Container(),rays=new Sprite(textures.rays),glow=new Sprite(textures.dot);for(const sprite of [rays,glow]){sprite.anchor.set(.5);sprite.blendMode='add';}const warmth=new Sprite(textures.dot);warmth.anchor.set(.5);warmth.blendMode='add';halo.addChild(glow,rays,warmth);halo.eventMode='none';
 const shadeCanvas=document.createElement('canvas');shadeCanvas.width=shadeCanvas.height=256;{const c=shadeCanvas.getContext('2d')!,g=c.createRadialGradient(128,128,22,128,128,128);g.addColorStop(0,'rgba(3,10,22,0)');g.addColorStop(.42,'rgba(3,10,22,.55)');g.addColorStop(1,'rgba(3,10,22,1)');c.fillStyle=g;c.fillRect(0,0,256,256);}
 const vignette=new Sprite(Texture.from(shadeCanvas));vignette.anchor.set(.5);vignette.eventMode='none';vignette.visible=false;
 const ease=(v:number)=>{const p=Math.max(0,Math.min(1,v));return p*p*(3-2*p);};
 let lastT=-99,lastAge=-99,lastNow=0,trail=0,shownTier=-2,twinkle=0,seed=7,previous={x:0,y:0};
 let strands=0;
 // The checks: three lights over the ball, one per rattle; the seam and the shell, which leak the trapped energy while it fights.
 const RADIUS=52.5,seam=new Sprite(juiceTextures().dot),shell=new Sprite(juiceTextures().dot);for(const sprite of [seam,shell]){sprite.anchor.set(.5);sprite.blendMode='add';sprite.visible=false;}
 const pips=[0,1,2].map(()=>{const root=new Container(),base=new Graphics(),lit=new Graphics(),glow=new Sprite(juiceTextures().dot),shape=[0,-12,8.6,0,0,12,-8.6,0];
  base.poly(shape).fill({color:0x0b1d2e,alpha:.62}).stroke({color:0xf3eedb,width:1.8,alpha:.9});lit.poly(shape).fill(0xffffff).stroke({color:0x061b32,width:2.4});glow.anchor.set(.5);glow.blendMode='add';glow.scale.set(1.5);
  root.addChild(glow,base,lit);root.visible=false;return {root,lit,glow};});
 world.front.addChild(shell,seam,...pips.map(pip=>pip.root));
 const later:{at:number;run:()=>void}[]=[],random=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};
 // Accents under the scene's own score and voices: short, and quieter than they play in the main game.
 let sounding=false;const cue=(name:string,gain:number)=>{if(sounding)playSound(name as Sound,{gain});};
 function audio(on:boolean){sounding=on;setSound(on);if(on){void preloadCaptureAudio();void preloadWinAudio();}}
 /** A point of light with a flare drawn through it, the way a lens takes a hard highlight. */
 const glare=(juice:RevealJuice,x:number,y:number,size:number,color:number,wide=1.6)=>{juice.flare(x,y,size,0xffffff,.24);juice.streak(x,y,LEFT,size*wide,3.4,color,.34);juice.streak(x,y,RIGHT,size*wide,3.4,color,.34);juice.streak(x,y,LEFT,size*wide*.6,1.3,0xffffff,.26);juice.streak(x,y,RIGHT,size*wide*.6,1.3,0xffffff,.26);};
 /** Light kicked along the floor to both sides, with a little dust. */
 const kick=(x:number,y:number,reach:number,color:number,dust:number,side=0)=>{if(side<=0)world.streak(x,y,LEFT,reach,2.2,color,.36,true);if(side>=0)world.streak(x,y,RIGHT,reach,2.2,color,.36,true);world.burst(x,y,dust,reach*1.2,color,.55);};
 function sample(s:LightSample){
  const dt=lastNow?Math.min(.05,Math.max(0,s.now-lastNow)):0;lastNow=s.now;const {t,rewardAge:age,w,h}=s,unit=h/960;
  // A seek or a new round: nothing left over from another moment.
  if(t<lastT-.05||age<lastAge-.05){world.clear();reward.clear();later.length=0;}
  const hit=(at:number)=>lastT<at&&t>=at&&t-lastT<.3,won=(at:number)=>lastAge<at&&age>=at&&age-lastAge<.3;
  for(let i=later.length-1;i>=0;i--)if(s.now>=later[i].at){later[i].run();later.splice(i,1);}
  world.scale=reward.scale=unit*1.15;const b=s.ball,mouth={x:b.x,y:b.y-22*unit};
  // The legendary lands: its weight goes out along the floor.
  if(hit(3.1))cue('cap-presence',.7);
  if(hit(17.0))cue('cap-exit',.7);
  if(!s.caught&&hit(14.4))cue('cap-flee',.7);
  if(hit(4.36)){kick(s.feet.x,s.feet.y,300*unit,light,14);world.flood(.08,light);}
  // It leaves in a rising column of its own light.
  if(!s.caught&&hit(14.42)){world.gather(s.chest.x,s.chest.y,.12,light);kick(s.feet.x,s.feet.y,200*unit,light,8);}
  if(!s.caught&&hit(14.5)){world.flood(.14,light);world.streak(s.feet.x,s.feet.y,UP,h*1.1,16,light,.9,true);world.streak(s.feet.x,s.feet.y,UP,h*1.0,5,0xffffff,.7,true);world.burst(s.chest.x,s.chest.y,26,520,light,.9);kick(s.feet.x,s.feet.y,340*unit,light,14);
   for(let i=0;i<6;i++){const x=s.feet.x+(random()-.5)*150*unit,y0=s.feet.y-random()*h*.3;later.push({at:s.now+.05+i*.05,run:()=>world.streak(x,y0,UP,(160+random()*220)*unit,1.6+random()*2,random()<.5?0xffffff:light,.3)});}}
  if(b.visible){
   // Thrown: a streak hangs behind the ball along its path and it sheds motes.
   if(hit(5.1))cue('cap-throw',.8);
   if(t>=5.1&&t<5.85){const dx=b.x-previous.x,dy=b.y-previous.y,speed=Math.hypot(dx,dy);if(speed>2)world.streak(b.x,b.y,Math.atan2(-dy,-dx),Math.min(170,speed*5)*unit,2.6,light,.16,true);trail+=dt*80;while(trail>=1){trail--;world.trail(b.x,b.y,60*unit,light);}}
   // Contact: one hard highlight with a flare through it, lines of force behind, sparks off the shell.
   if(hit(5.85)){cue('cap-hit',.85);world.flood(.34,0xffffff);glare(world,b.x,b.y,300*unit,tint,2.2);world.fan(b.x,b.y,820*unit,light,.42);world.fan(b.x,b.y,460*unit,0xffffff,.22);world.burst(b.x,b.y,30,620,light,.1);
    // The blow carries on through the Pokémon: lines of force thrown past it, and a second, smaller ring of light a beat later.
    for(let i=0;i<7;i++){const angle=Math.PI+(i-3)*.2+(random()-.5)*.1;world.streak(b.x,b.y,angle,(260+random()*240)*unit,2+random()*2.4,i%2?light:0xffffff,.3+random()*.14);}
    const bx=b.x,by=b.y;later.push({at:s.now+.07,run:()=>{world.flare(bx,by,150*unit,light,.2);world.burst(bx,by,10,300,0xffffff,.2);}});}
   // Drawn in: the beam itself is drawn by the scene (energyBeam). Around it the air goes with it: lines of suction race in from
   // the edges of the frame, dust is dragged along the floor, light packs into the mouth, and the last of it goes in with a gulp.
   if(hit(6.25)){cue('release',.5);world.flare(mouth.x,mouth.y,150*unit,light,.2);world.burst(mouth.x,mouth.y,10,320,light,.2);}
   if(hit(6.42)){world.flood(.1,light);glare(world,s.chest.x,s.chest.y,150*unit,tint,1.6);world.burst(s.chest.x,s.chest.y,16,420,light,.2);}
   if(hit(6.95))cue('cap-absorb',.75);
   if(t>=6.42&&t<8.1){const pullIn=Math.min(1,(t-6.42)/1.5);world.charging(mouth.x,mouth.y,.2+.3*pullIn,light);
    strands+=dt*(22+pullIn*46);while(strands>=1){strands--;
     if(random()<.3){const side=random()<.5?-1:1,x=mouth.x+side*(160+random()*260)*unit;world.streak(x,s.floorY+(random()-.5)*14*unit,side<0?RIGHT:LEFT,(70+random()*110)*unit,1.2+random()*1.2,0xe8f6ff,.22,true);}
     else{const a=random()*6.283,reach=(300+random()*300)*unit,x=mouth.x+Math.cos(a)*reach,y=mouth.y+Math.sin(a)*reach*.85;world.streak(x,y,Math.atan2(mouth.y-y,mouth.x-x),(110+random()*170)*unit*(.6+pullIn*.6),1+random()*1.8,random()<.35?0xffffff:light,.16+random()*.08,true);}}}
   if(hit(8.06)){world.gather(mouth.x,mouth.y,.14,light);}
   if(hit(8.14)){world.flare(mouth.x,mouth.y,140*unit,0xffffff,.16);world.burst(mouth.x,mouth.y,14,420,light,.5);}
   if(hit(8.2)){cue('cap-shut',.75);world.flood(.12,light);glare(world,b.x,b.y,130*unit,light,1.3);world.burst(b.x,b.y,9,300,light);}
   // On the floor: each landing throws light and dust along it.
   if(hit(8.55))cue('cap-drop',.7);
   if(hit(8.55))kick(b.x,s.floorY+4*unit,190*unit,0xe8f6ff,10);
   if(hit(9.1))kick(b.x,s.floorY+4*unit,90*unit,0xe8f6ff,4);
   // The checks. The Pokémon's energy fights inside the shell: on each rattle it leaks out of the seam on the side the ball is
   // thrown to, lines of force jump off the shell, the floor is scuffed, and one of the three lights above the ball comes on.
   const radius=RADIUS*unit,floor=s.floorY+4*unit;
   const leak=(side:number,force:number)=>{const x=b.x+side*radius*.96,y=b.y+2*unit,base=side>0?RIGHT:LEFT;world.flare(x,y,(46+34*force)*unit,0xffffff,.16);
    for(const [spread,color,thick,reach] of [[-.34,energy,2.2,1],[-.06,0xffffff,1.5,1.3],[.2,energy,2.6,.9]] as const)world.streak(x,y,base+spread*side-.08,(100+80*force)*unit*reach,thick*force,color,.2+.05*force);
    world.burst(x,y,Math.round(5*force),340,energy,.25);};
   const impact=(i:number)=>{world.flare(b.x,b.y,(96+i*30)*unit,energy,.18);for(let j=0;j<12;j++){const a=-Math.PI+(j+random()*.6)/12*Math.PI,from=(74+random()*22)*unit;world.streak(b.x+Math.cos(a)*from,b.y+Math.sin(a)*from,a,(46+random()*90)*unit*(1+i*.28),1.1+random()*1.5,j%3?0xffffff:energy,.15+random()*.07);}};
   KNOCKS.forEach((at,i)=>{
    if(hit(at+.02))cue('cap-wobble-'+(i+1),.8);
    if(hit(at+.157)){leak(-1,.55+i*.15);kick(b.x,floor,(80+i*24)*unit,0xffd9d0,2,-1);}
    if(hit(at+.26)){leak(1,1+i*.28);impact(i);kick(b.x,floor,(130+i*36)*unit,0xffe9e0,4+i*2,1);world.burst(b.x,floor,5+i*3,230,0xffffff,.9);world.flood(.04+i*.03,energy);}
    if(hit(at+.366)){leak(-1,.8+i*.2);kick(b.x,floor,(100+i*28)*unit,0xffd9d0,3,-1);}});
   if(hit(11.74))cue('cap-hold',.6);
   if(hit(11.74))world.gather(b.x,b.y,.46,energy);
   if(hit(12.2)){
    if(s.caught){
     // Locked: a pillar of gold stands on the ball, a flare crosses it, and the three stars pop off in turn.
     cue('cap-lock',.85);world.flood(.32,0xfff3c8);glare(world,b.x,b.y,300*unit,0xffe08a,2.4);world.fan(b.x,b.y,900*unit,0xffd76a,.7);kick(b.x,s.floorY+4*unit,330*unit,0xffe08a,16);world.streak(b.x,b.y,UP,h*.62,11,0xffd76a,.8,true);world.streak(b.x,b.y,UP,h*.5,3.2,0xffffff,.6,true);world.burst(b.x,b.y,24,460,0xffe9a8,.35);
     for(let i=0;i<3;i++){const angle=UP+(i-1)*.62,reach=(118+(i===1?26:0))*unit,x=b.x+Math.cos(angle)*reach,y=b.y+Math.sin(angle)*reach;later.push({at:s.now+.1+i*.11,run:()=>{world.flare(x,y,76*unit,0xfff0a8,.5);world.flare(x,y,34*unit,0xffffff,.34);world.burst(x,y,4,170,0xfff0a8,.2);}});}
    }else{
     // Broke out: shards of the Pokémon's light fly from the seam in every direction.
     cue('cap-break',.85);world.flood(.2,0xffffff);world.flare(b.x,b.y,200*unit,light,.24);world.fan(b.x,b.y,900*unit,light,.5);kick(b.x,s.floorY+4*unit,300*unit,light,14);for(let i=0;i<9;i++){const angle=i/9*Math.PI*2+.3;world.streak(b.x,b.y,angle,(220+random()*200)*unit,2.4+random()*2.6,i%2?tint:light,.38+random()*.2);}world.burst(b.x,b.y,26,540,light,.4);
    }
   }
   // Broke out: the scene runs the beam backwards. The blast throws the air outward, and when the body lets go of the light it
   // sheds it in every direction and stamps the floor.
   if(!s.caught&&t>=12.2&&t<12.7){strands+=dt*70;while(strands>=1){strands--;const a=random()*6.283,near=(40+random()*60)*unit;world.streak(b.x+Math.cos(a)*near,b.y+Math.sin(a)*near*.8,a,(160+random()*260)*unit,1.2+random()*2,random()<.4?0xffffff:light,.2+random()*.1,true);}}
   if(!s.caught&&hit(13.14)){world.flood(.12,light);glare(world,s.chest.x,s.chest.y,200*unit,tint,2);world.fan(s.chest.x,s.chest.y,820*unit,light,.5);world.burst(s.chest.x,s.chest.y,34,560,light,.3);kick(s.feet.x,s.feet.y,340*unit,light,18);
    for(let i=0;i<10;i++){const a=i/10*6.283+random()*.4;world.streak(s.chest.x,s.chest.y,a,(170+random()*190)*unit,1.6+random()*2.2,i%2?0xffffff:light,.3+random()*.14);}}
   // The ball gives up its card on a column of light.
   if(s.caught&&hit(13.0)){world.streak(b.x,b.y,UP,h*.4,8,light,.6,true);world.streak(b.x,b.y,UP,h*.3,2.4,0xffffff,.45,true);world.burst(b.x,b.y,10,300,light,.7);}
   previous={x:b.x,y:b.y};
  }
  // Seam, shell and the three lights are placed every frame from the clock, so a seek shows the right state.
  {let strain=0;for(const [i,at] of KNOCKS.entries()){const age=t-at;if(age>=0&&age<.58)strain=Math.max(strain,Math.sin(Math.PI*age/.58)**2*(.72+i*.15));}
   const held=ease((t-11.74)/.46),checking=b.visible&&t>=9.3&&t<12.2,level=Math.max(strain,held*.75)*(held>0?.4+.6*random():1),radius=RADIUS*unit;
   seam.visible=shell.visible=checking&&level>.02;
   if(seam.visible){seam.position.set(b.x,b.y+2*unit);seam.rotation=s.ballRoll;seam.scale.set(radius*2.5/64,(5+level*9)*unit/64);seam.tint=energy;seam.alpha=Math.min(1,level*1.25);shell.position.set(b.x,b.y);shell.scale.set(radius*3.4/64);shell.tint=energy;shell.alpha=level*.42;}
   const shown=t>=9.4&&t<(s.caught?12.42:12.8)&&world.back.parent?.visible!==false;
   pips.forEach((pip,i)=>{pip.root.visible=shown;if(!shown)return;const appear=ease((t-9.4-i*.08)/.18),lit=t-(KNOCKS[i]+.26),v=t-12.2,stamp=lit>=0?juiceUp(lit,.8,.14):{scale:1,rotation:0};
    let x=s.rest.x+(i-1)*36*unit,y=s.rest.y-92*unit-(i===1?10*unit:0),size=appear*stamp.scale,alpha=appear,color=energy,turn=stamp.rotation;
    if(held>0&&v<0){const hold=t-11.74;size*=1+.12*Math.sin(hold*(16+46*hold));}
    // Caught: the three lights turn gold and drop into the latch. Broke out: they go red and are thrown off.
    if(v>=0){if(s.caught){const k=ease(v/.16);x+=(b.x-x)*k;y+=(b.y-y)*k;size*=1-k*.85;color=0xffd76a;alpha*=1-ease((v-.14)/.06);}else{color=0xff5a44;y+=(v*v*520-v*150)*unit;x+=(i-1)*v*130*unit;turn+=(i-1)*v*6;alpha*=1-ease((v-.22)/.3);}}
    pip.root.position.set(x,y);pip.root.scale.set(size*unit);pip.root.rotation=turn;pip.root.alpha=alpha;pip.lit.visible=pip.glow.visible=lit>=0;pip.lit.tint=pip.glow.tint=color;pip.glow.alpha=lit>=0?.5+.5*Math.exp(-lit*4):0;});}
  world.update(dt);
  // The pool of dark lifts just before a flash, so the flash never lights its edge into a ring.
  const dark=Math.max(ease((t-9.15)/1.3)*(1-ease((t-12.1)/.09)),.62*ease((t-6.5)/.4)*(1-ease((t-8.05)/.12)),s.caught?0:.55*ease((t-12.36)/.18)*(1-ease((t-13.0)/.12)));vignette.visible=dark>.003;if(vignette.visible){vignette.position.set(s.ballScreen.x,s.ballScreen.y);const closed=KNOCKS.filter(at=>t>=at+.26&&t<12.2).length;vignette.width=vignette.height=Math.hypot(w,h)*(1.3-.1*closed-.08*ease((t-11.74)/.46)*(t<12.2?1:0));vignette.alpha=Math.min(.94,dark*(.82+.04*closed));}
  // Reward: the card turns over into a fan of light and keeps glinting; each milestone of the count pays out; the last one slams.
  if(!lightSwitch.reward){reward.update(dt);halo.visible=false;ladder.visible=false;lastT=t;lastAge=age;return;}
  const c=s.counter,amountY=c.y+c.height*.035,ends=WIN_STAGES.map(stage=>stage.end),card=s.card;
  if(won(.18)){cue('cap-card',.75);reward.fan(card.x,card.y,card.height*2,light,.9);reward.flare(card.x,card.y-card.height*.18,card.height*.42,0xffffff,.22);reward.streak(card.x,card.y-card.height*.18,LEFT,card.width*1.25,3,light,.4);reward.streak(card.x,card.y-card.height*.18,RIGHT,card.width*1.25,3,light,.4);}
  if(age>.5&&age<12){twinkle+=dt*(age>ends[ends.length-1]?7:3.5);while(twinkle>=1){twinkle--;const edge=Math.floor(random()*4),u=random()-.5,x=card.x+(edge<2?u*card.width:(edge===2?-.5:.5)*card.width),y=card.y+(edge<2?(edge?.5:-.5)*card.height:u*card.height);reward.flare(x*(1-.12*s.post)+w*.06*s.post,y*(1-.12*s.post)-h*.025*s.post,(18+random()*26)*unit,random()<.5?0xffffff:light,.3+random()*.25);}}
  ends.forEach((end,i)=>{if(!won(end))return;const last=i===ends.length-1,glow=TIER_PALETTE[LADDER[i]].glow,reach=w*(s.portrait?.3:.12)*(1+i*.14);
   if(last){cue('win-final-4',.8);cue('win-coins-3',.7);}else{cue('win-rung-'+Math.min(3,i+1),.65);cue('win-coins-1',.55);}
   // The total takes the hit: a flare across the digits, sparks off both ends, coins from either side of it.
   glare(reward,c.x,amountY,(120+i*26)*unit,glow,reach/((120+i*26)*unit));reward.burst(c.x-reach,amountY,5+i*2,300,glow,.3);reward.burst(c.x+reach,amountY,5+i*2,300,glow,.3);
   for(const way of [-1,1])reward.coins(c.x+way*w*(s.portrait?.22:.09),amountY+c.height*.12,last?26:4+i*2,(170+i*18)*unit,true);
   if(last){reward.flood(.3,0xfff3c8);reward.fan(c.x,amountY,h*.95,glow,1);
    for(let k=0;k<8;k++){const x=c.x+(random()-.5)*w*(s.portrait?.86:.34),y=amountY-c.height*(.25+random()*.6);later.push({at:s.now+.08+k*.07,run:()=>{reward.flare(x,y,(40+random()*40)*unit,k%2?0xffffff:glow,.4);}});}}});
  if(won(5.62)){cue('cap-mult',.65);const x=card.x+card.width*.385,y=card.y+card.height*.32;reward.flare(x,y,90*unit,0xffffff,.24);reward.streak(x,y,LEFT,120*unit,2.4,0xff8a96,.3);reward.streak(x,y,RIGHT,120*unit,2.4,0xff8a96,.3);reward.burst(x,y,8,220,0xff8a96,.2);}
  {const k=1-.12*s.post,tierNow=ends.filter(end=>age>=end).length-1,sinceHit=tierNow>=0?age-ends[tierNow]:9,won=tierNow===ends.length-1,lit=ease((age-.18)/.5)*(1-ease((age-11.4)/.5));
   halo.visible=lit>.003;halo.position.set(card.x*k+w*.06*s.post,card.y*k-h*.025*s.post);rays.tint=glow.tint=won?0xffd77a:light;rays.rotation=s.now*.12;
   rays.scale.set(card.height*(2.5+(won?.5:0))*k/512);rays.alpha=lit*(.2+(won?.16:0)+.3*Math.exp(-sinceHit*4));glow.scale.set(card.height*1.7*k/32);glow.alpha=lit*(.3+.25*Math.exp(-sinceHit*5));
   // The amount heats as it climbs: a wide low glow under the digits instead of flames on them.
   const heat=Math.max(0,Math.min(1,(age-ends[0])/(ends[ends.length-1]-ends[0])));warmth.position.set((c.x-card.x)*k,(c.y+c.height*.06-card.y)*k);warmth.tint=won?0xffc24a:0xffa53a;warmth.scale.set(w*(s.portrait?.95:.4)*k/32,c.height*.75*k/32);warmth.alpha=lit*(tierNow>=0?.16+.3*heat+.3*Math.exp(-sinceHit*5):0);}
  reward.update(dt);
  // Tier ladder over the amount: lower tiers land on earlier milestones and are replaced by the next.
  const tier=ends.filter(end=>age>=end).length-1;ladder.visible=tier>=0&&age<12;
  if(ladder.visible){const name=LADDER[tier],palette=TIER_PALETTE[name],since=age-ends[tier],kick=juiceUp(since,name==='legendary'?.6:.42,.06),size=h*(s.portrait?.056:.064)*(name==='legendary'?1.1:1);
   if(tier!==shownTier){shownTier=tier;label.text=shine.text=TITLES[name];label.style.fill=palette.fill;label.style.dropShadow!.color=palette.edge;}
   label.style.fontSize=shine.style.fontSize=size;const k=1-.12*s.post;ladder.position.set(c.x*k+w*.06*s.post,(c.y-c.height*.57)*k-h*.025*s.post);kick.scale*=k;ladder.scale.set(kick.scale);ladder.rotation=-.03+kick.rotation;
   const sweep=((since-.5)*1.1)%2.4;shine.alpha=Math.max(Math.max(0,1-since/.22)*.9,since>.5&&name==='legendary'?Math.max(0,1-Math.abs(sweep-.5)/.18)*.5:0);
   if(ladder.width>w*(s.portrait?.92:.4))ladder.scale.set(kick.scale*w*(s.portrait?.92:.4)/ladder.width);
  }else shownTier=-2;
  lastT=t;lastAge=age;
 }
 return {world,reward,ladder,halo,vignette,sample,audio,light,tint,energy};
}
