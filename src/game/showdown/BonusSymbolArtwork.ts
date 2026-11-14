import {Container,Graphics,Sprite,Text,Texture} from 'pixi.js';
import {Quaternion,Vector3} from 'three';
import {BALL_FRAME,PokeBall3D} from '../PokeBall3D';
import {juiceTextures} from '../WinJuice';
import {prepareBattleFont} from '../battleFont';
import {bonusBadgePose,BADGE_BALL,BADGE_SCALE,BADGE_SOCKET} from './bonusBallMotion';

/** The still is cut a little wider than the shell so its ink edge is kept. */
const STILL_PAD=1.14,TUMBLE=new Vector3(.82,.35,.46).normalize(),FORWARD=new Vector3(1,0,0);
let loading:Promise<void>|undefined,still:Texture|null|undefined,rendering=0;
/** The mark's lettering is the battle font, so it must be ready before the first card can carry one. */
export function loadBonusSymbolArtwork(){return loading??=prepareBattleFont().catch(error=>{loading=undefined;throw error;});}
/** One render of the game's 3D Poké Ball at rest, shared by every ball that is not moving. */
export function bonusBallTexture(){
 if(still!==undefined)return still;
 if(typeof document==='undefined'){still=null;return still;}
 try{
  const size=384,ball=new PokeBall3D(false,0xbdf7ff,size);ball.place(0,0,10,1,true);ball.update({spin:new Quaternion(),roll:0,open:0,button:.2,inner:0,front:false});
  const source=ball.sprite.texture.source.resource as CanvasImageSource,radius=size/(BALL_FRAME.top-BALL_FRAME.bottom),side=Math.ceil(radius*2*STILL_PAD),canvas=document.createElement('canvas');canvas.width=canvas.height=side;
  canvas.getContext('2d',{willReadFrequently:true})!.drawImage(source,size/2-side/2,size*BALL_FRAME.anchorY-side/2,side,side,0,0,side,side);ball.dispose();still=Texture.from(canvas);
 }catch(error){console.warn('Bonus ball could not be rendered',error);still=null;}
 return still;
}
/** Without WebGL the ball is still a ball: flat, in the same colours. */
function flatBall(radius:number){const g=new Graphics();g.circle(0,0,radius).fill(0xf1f5f9).stroke({color:0x1d2c3c,width:radius*.12});g.arc(0,0,radius,Math.PI,Math.PI*2).closePath().fill(0xe5263f);g.rect(-radius,-radius*.1,radius*2,radius*.2).fill(0x1d2633);g.circle(0,0,radius*.3).fill(0xf6fbff).stroke({color:0x1d2633,width:radius*.12});return g;}
/** A resting ball of the given radius, centred on its origin. */
export function createBonusToken(radius:number){
 const root=new Container(),texture=bonusBallTexture();
 if(texture){const sprite=new Sprite(texture);sprite.anchor.set(.5);sprite.width=sprite.height=radius*2*STILL_PAD;root.addChild(sprite);}else root.addChild(flatBall(radius));
 return root;
}
/** The permanent mark a bonus card carries: an inked capsule with a gold edge, BONUS in the battle font and a well with the
 * impression of the ball that sat in it. Drawn large enough to survive the tray and the result grid. */
function createMark(){
 const mark=new Container(),g=new Graphics(),{x,y}=BADGE_SOCKET;
 g.roundRect(-61,-19,126,46,23).fill({color:0x031425,alpha:.4});
 g.roundRect(-63,-23,126,46,23).fill(0x061b32);g.roundRect(-60.5,-20.5,121,41,20.5).fill(0xffd76a);g.roundRect(-58,-18,116,36,18).fill(0xcf2a41);
 // Bevel: a lit upper half and a shaded lower lip, so it reads as a raised enamel plate rather than a flat label.
 g.roundRect(-55,-16,110,13,9).fill({color:0xff8f9c,alpha:.5});g.roundRect(-55,5,110,11,8).fill({color:0x861729,alpha:.55});
 g.circle(x,y,19.5).fill(0x061b32);g.circle(x,y,17).fill(0xffd76a);g.circle(x,y,14.2).fill(0x0c2238);g.moveTo(x+Math.cos(Math.PI*1.08)*12.6,y+1.5+Math.sin(Math.PI*1.08)*12.6).arc(x,y+1.5,12.6,Math.PI*1.08,Math.PI*1.92).stroke({color:0x030c17,width:3.2,alpha:.85});
 // The ball's impression, in gold line.
 g.circle(x,y,9.4).stroke({color:0xffd76a,width:1.7,alpha:.95});g.moveTo(x-9.4,y).lineTo(x+9.4,y).stroke({color:0xffd76a,width:1.7,alpha:.95});g.circle(x,y,3.1).fill(0x0c2238).stroke({color:0xffd76a,width:1.6});
 const label=new Text({text:'BONUS',style:{fontFamily:'BattleDisplay, Nunito, Arial',fontWeight:'400',fontSize:24,letterSpacing:1.2,fill:0xfff4d9,stroke:{color:0x061b32,width:4.5},dropShadow:{color:0x5e0f1c,alpha:1,blur:0,distance:2.2,angle:Math.PI/2}},resolution:3});
 label.anchor.set(.5);label.position.set(21,-.5);mark.addChild(g,label);mark.rotation=-.06;return mark;
}
export interface SeatedBall{/** Where the seated ball is on screen, and how large; null once its card is gone. */global():{x:number;y:number;radius:number}|null;/** The ball leaves the card; its impression stays in the mark. */release():void;/** Still on a card that exists, and (given the stage) on one that is being shown. */alive(stage?:Container):boolean;/** The child of the stage this ball's card is drawn in. */layer(stage:Container):Container|null}
const animations=new WeakMap<Container,(dt:number,reduced:boolean)=>void>(),seatedBalls:SeatedBall[]=[];
/** A ball seated on a marked card, for whoever carries it away; each can be claimed once. A single reveal takes the card just
 * marked (`newest`); cards turned together are taken in the order they were dealt. */
export function claimBonusBall(newest=true,stage?:Container){
 for(let i=seatedBalls.length-1;i>=0;i--)if(!seatedBalls[i].alive())seatedBalls.splice(i,1);
 let index=-1;for(let i=0;i<seatedBalls.length;i++)if(seatedBalls[i].alive(stage)){index=i;if(!newest)break;}
 return index<0?null:seatedBalls.splice(index,1)[0];
}
/** A bonus card's mark. Animated, the game's real 3D ball drops onto the card from the lens, lands with weight in the mark's
 * well and prints the mark under it; light from the contact runs across the card face. Coordinates are the card's own (312 × 435). */
export function createAnimatedBonusBadge(animated=false){
 const root=new Container(),mark=createMark();root.eventMode='none';root.position.set(66,166);root.scale.set(BADGE_SCALE);
 if(!animated){root.addChild(mark);return root;}
 const textures=juiceTextures(),additive=(texture:Texture)=>{const sprite=new Sprite(texture);sprite.anchor.set(.5);sprite.blendMode='add';sprite.alpha=0;return sprite;};
 // Light from the landing stays on the card: it is cut to the card's own outline.
 const cardLight=new Container(),k=1/BADGE_SCALE,outline=new Graphics().roundRect((-156-66)*k,(-217.5-166)*k,312*k,435*k,15*k).fill(0xffffff),wash=additive(textures.dot),bar=additive(textures.streak),core=additive(textures.streak);
 const sparks=Array.from({length:8},(_,i)=>({sprite:additive(textures.streak),angle:(i/8)*Math.PI*2+(i%2?.35:-.2),reach:70+((i*37)%5)*26}));
 cardLight.addChild(wash,bar,core,...sparks.map(s=>s.sprite));cardLight.mask=outline;
 const shadow=new Sprite(textures.dot);shadow.anchor.set(.5);shadow.tint=0x020a14;shadow.alpha=0;
 // The print flashes white for an instant as it takes, and the ball drags light behind it on the way in.
 const print=new Graphics().roundRect(-63,-23,126,46,23).fill(0xffffff);print.blendMode='add';print.rotation=mark.rotation;print.alpha=0;const tail=additive(textures.streak);tail.anchor.set(0,.5);const glint=additive(textures.star);
 const seat=new Container(),spin=new Quaternion(),roll=new Quaternion();let ball:PokeBall3D|null=null,rest:Container|null=null,raw=0,released=false,dead=false;
 // A few live 3D balls at most; beyond that a landing uses the resting render.
 if(rendering<3&&bonusBallTexture())try{ball=new PokeBall3D(false,0xbdf7ff,256);rendering++;seat.addChild(ball.sprite);}catch{ball=null;}
 const settle=()=>{if(ball){rendering--;ball.sprite.removeFromParent();ball.dispose();ball=null;}if(!rest){rest=createBonusToken(BADGE_BALL.seated);seat.addChild(rest);}};
 root.addChild(outline,cardLight,shadow,mark,print,tail,seat,glint);mark.alpha=0;
 root.once('destroyed',()=>{dead=true;if(ball){rendering--;ball.dispose();ball=null;}});
 const sample=(dt:number,reduced:boolean)=>{
  if(dead)return;
  // Contact holds for a few frames before anything answers it.
  raw+=dt;const {impact,hold}=BADGE_BALL,age=reduced||raw<impact?raw:raw<impact+hold?impact:raw-hold,p=bonusBadgePose(age,reduced),{x,y}=BADGE_SOCKET;
  mark.alpha=p.mark.alpha;mark.scale.set(p.mark.scale);print.scale.set(p.mark.scale);print.alpha=p.mark.flash*.6;
  tail.visible=!released&&p.tail>.01;if(tail.visible){tail.position.set(x+p.ball.x,y+p.ball.y);tail.rotation=Math.atan2(-250,-24);tail.tint=0xbdf7ff;tail.width=p.tail*150;tail.height=p.ball.radius*.5;tail.alpha=Math.min(1,p.tail)*.8;}
  glint.visible=!released&&p.light.glint>.02;if(glint.visible){glint.position.set(x+5,y-2);glint.width=glint.height=44*p.light.glint;glint.alpha=p.light.glint;glint.rotation=age*2;}
  seat.visible=!released&&p.ball.alpha>0;shadow.visible=seat.visible;
  if(seat.visible){
   if(ball&&(p.seated||reduced))settle();
   if(ball){ball.place(x+p.ball.x,y+p.ball.y,p.ball.radius,p.ball.alpha,true);ball.sprite.scale.x*=1+p.ball.squash;ball.sprite.scale.y*=1-p.ball.squash;
    ball.update({spin:spin.setFromAxisAngle(TUMBLE,p.ball.tumble).premultiply(roll.setFromAxisAngle(FORWARD,-p.ball.tumble*.35)),roll:p.ball.roll,open:0,button:p.ball.button,inner:0,front:false});}
   else{if(!rest)settle();rest!.position.set(x+p.ball.x,y+p.ball.y);rest!.scale.set(p.ball.radius/BADGE_BALL.seated*(1+p.ball.squash),p.ball.radius/BADGE_BALL.seated*(1-p.ball.squash));rest!.alpha=p.ball.alpha;rest!.rotation=p.ball.roll;}
   shadow.position.set(x+p.shadow.x,y+p.shadow.y);shadow.width=p.shadow.width;shadow.height=p.shadow.width*.42;shadow.alpha=p.shadow.alpha;
  }
  wash.position.set(x,y);wash.tint=0x9fe6ff;wash.width=wash.height=p.light.wash*2;wash.alpha=p.light.washAlpha;
  for(const [sprite,thickness,tint] of [[bar,2.6,0x9fe6ff],[core,1,0xffffff]] as const){sprite.position.set(x,y);sprite.tint=tint;sprite.width=p.light.bar*(thickness>1?1:.62);sprite.height=Math.max(.5,thickness*4*p.light.barAlpha);sprite.alpha=p.light.barAlpha;}
  for(const spark of sparks){const d=spark.reach*p.light.spread;spark.sprite.position.set(x+Math.cos(spark.angle)*d,y+Math.sin(spark.angle)*d*.8);spark.sprite.rotation=spark.angle;spark.sprite.tint=0xdff6ff;spark.sprite.width=26*p.light.sparkAlpha+4;spark.sprite.height=2.2;spark.sprite.alpha=p.light.sparkAlpha;}
 };
 const attached=(stage:Container)=>{let node:Container|null=root;while(node&&node!==stage)node=node.parent;return node===stage;};
 seatedBalls.push({layer:stage=>{let node:Container|null=root;while(node&&node.parent!==stage)node=node.parent;return node;},alive:stage=>!dead&&!released&&!root.destroyed&&(!stage||attached(stage)),global:()=>{if(dead||root.destroyed||!root.parent)return null;const point=root.toGlobal(BADGE_SOCKET),m=root.worldTransform;return {x:point.x,y:point.y,radius:BADGE_BALL.seated*Math.hypot(m.a,m.b)};},
  release:()=>{if(released||dead)return;released=true;seat.visible=false;shadow.visible=false;tail.visible=glint.visible=false;if(ball){rendering--;ball.sprite.removeFromParent();ball.dispose();ball=null;}}});
 animations.set(root,sample);sample(.001,false);return root;
}
export function updateBonusBadge(root:Container|null,dt:number,reduced=false){if(root&&!root.destroyed)animations.get(root)?.(dt,reduced);}
