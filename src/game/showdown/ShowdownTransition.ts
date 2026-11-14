import {Assets,Container,Sprite,Text,Texture,Rectangle} from 'pixi.js';
import {smooth} from './showdownModel';
import {showdownTransitionFrame} from './showdownTransitionModel';
import {PaintedVaultFx} from './PaintedVaultFx';

/** A red/white Poké Ball battle wipe, with cel speed lines at the locked midpoint. */
export class ShowdownTransition {
 readonly root=new Container();
 private source:Sprite|null;private matte=new Sprite(Texture.WHITE);private top=new Sprite(Texture.WHITE);private bottom=new Sprite(Texture.WHITE);private seam=new Sprite(Texture.WHITE);private ball=new Sprite(Texture.EMPTY);private fx=new PaintedVaultFx('speed');private dead=false;
 private title:Text;private subtitle:Text;private encounter:Text;
 constructor(origin?:Texture){
  this.source=origin?new Sprite(origin):null;if(this.source)this.root.addChild(this.source);
  this.matte.tint=0x111726;this.top.tint=0xe63840;this.bottom.tint=0xf5f1df;this.seam.tint=0x111726;this.ball.anchor.set(.5);
  this.title=new Text({text:'Mewtwo’s Psychic Vault',style:{fontFamily:'Nunito',fontSize:32,fontWeight:'900',fill:0x172339},resolution:2});this.title.anchor.set(.5);
  this.subtitle=new Text({text:'Break three seals. Reveal one card.',style:{fontFamily:'Nunito',fontSize:16,fontWeight:'800',fill:0x38445a},resolution:2});this.subtitle.anchor.set(.5);
  this.encounter=new Text({text:'A legendary presence!',style:{fontFamily:'Nunito',fontSize:32,fontWeight:'900',fontStyle:'italic',fill:0xffffff,stroke:{color:0x911d35,width:4}},resolution:2});this.encounter.anchor.set(.5);
  this.root.addChild(this.matte,this.top,this.bottom,this.fx.rig,this.seam,this.ball,this.encounter,this.title,this.subtitle);this.root.eventMode='none';
  void Assets.load<Texture>('/assets/showdown-v11/support.png').then(t=>{if(!this.dead)this.ball.texture=new Texture({source:t.source,frame:new Rectangle(0,t.height/2,t.width/2,t.height/2)});}).catch(()=>{});
  void this.fx.load().catch(()=>{});
 }
 sample(time:number,w:number,h:number,direction:'in'|'out',reduced:boolean,retainOrigin=false,ambientTime=time){
  const f=showdownTransitionFrame(time,reduced),cx=w/2,cy=h/2;this.root.visible=!f.done;
  if(this.source){this.source.width=w;this.source.height=h;this.source.visible=direction==='in'?!f.swap:retainOrigin||f.swap;}
  this.matte.width=w;this.matte.height=h;this.matte.alpha=reduced?f.cover:0;
  this.top.width=this.bottom.width=w;this.top.height=this.bottom.height=h/2+8;
  this.top.y=reduced?0:-(h/2+8)*(1-f.cover);this.bottom.y=reduced?h/2:h/2+(h/2+8)*(1-f.cover);
  this.top.alpha=this.bottom.alpha=reduced?f.cover:1;
  this.seam.position.set(0,cy-8);this.seam.width=w;this.seam.height=16;this.seam.alpha=smooth((f.cover-.86)/.14);
  this.fx.sample(ambientTime,reduced);this.fx.rig.position.set(cx,cy);this.fx.rig.scale.set(w/1000,h/700);this.fx.rig.alpha=reduced?0:f.cover*.48;
  const lock=smooth((time-.18)/.22),leave=1-smooth((time-.92)/.37),labelAlpha=reduced?0:lock*leave;
  const diameter=Math.min(210,w*.42),zoom=reduced?1:1+(1-lock)*1.3+f.arrival*1.9;
  this.ball.width=this.ball.height=diameter/.62*zoom;this.ball.position.set(cx,cy);this.ball.rotation=reduced?0:(1-lock)*-1.8+f.arrival*1.25;this.ball.alpha=reduced?f.cover:labelAlpha;
  this.title.alpha=this.subtitle.alpha=this.encounter.alpha=labelAlpha;
  this.title.text=direction==='in'?'Mewtwo’s Psychic Vault':'Back to your pack';this.subtitle.text=direction==='in'?'Break three seals. Reveal one card.':'The encounter is complete';this.encounter.text=direction==='in'?'A legendary presence!':'Vault unlocked!';
  this.title.style.fontSize=Math.min(32,(w-38)/13.5);this.encounter.style.fontSize=Math.min(38,(w-38)/11);this.subtitle.style.fontSize=w<500?13:16;
  this.encounter.position.set(cx,cy-diameter*.65-26);this.title.position.set(cx,cy+diameter*.65+22);this.subtitle.position.set(cx,cy+diameter*.65+53);
  return f;
 }
 destroy(){this.dead=true;const texture=this.source?.texture;this.fx.destroy();this.root.destroy({children:true});texture?.destroy(true);}
}
