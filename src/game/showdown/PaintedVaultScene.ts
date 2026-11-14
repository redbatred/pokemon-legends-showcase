import {Assets,Container,Sprite,Texture} from 'pixi.js';
import type {gameLayout} from '../rendering';
import type {ArenaBoardState} from '../stadiumDisplayGeometry';
import {PaintedVaultFx} from './PaintedVaultFx';
import {showdownLayout} from './showdownModel';

/** Preserve the painting's perspective and put its authored floor beneath both actors. */
export function paintedVaultPlacement(w:number,h:number,imageWidth:number,imageHeight:number){
 const layout=showdownLayout(w,h),scale=Math.max(w/imageWidth,h/imageHeight);
 const width=imageWidth*scale,height=imageHeight*scale,floorY=layout.y+layout.player.y*layout.scale;
 return {x:(w-width)/2,y:floorY-height*.70,width,height,floorY,portrait:!layout.wide};
}

/** Cel-painted cave with native Spine water and telekinetic rocks behind the fight. */
export class PaintedVaultScene{
 readonly root=new Container();
 private base=new Sprite(Texture.WHITE);
 private painting=new Sprite(Texture.EMPTY);
 private water=[new PaintedVaultFx('water'),new PaintedVaultFx('water')];
 private rocks=new PaintedVaultFx('rocks');
 private landscape?:Texture;
 private portrait?:Texture;
 private loading?:Promise<void>;
 private width=0;
 private height=0;
 private active=false;
 private paused=false;
 private dead=false;
 private time=0;
 private rockTime=0;
 private lastTime:number|null=null;
 private impactAge=100;
 private impactStrength=0;
 private reveal=0;
 private guardCount=3;
 private reduced=false;

 constructor(){
  this.root.eventMode='none';this.root.interactiveChildren=false;
  this.base.tint=0x334654;this.root.addChild(this.base,this.painting,...this.water.map(f=>f.rig),this.rocks.rig);
 }
 init():Promise<void>{
  if(this.dead)return Promise.resolve();
  if(!this.loading)this.loading=Promise.all([
   Assets.load<Texture>('/assets/showdown-v11/cave.png'),
   Assets.load<Texture>('/assets/showdown-v11/portrait.png'),
   Promise.all([...this.water,this.rocks].map(f=>f.load())),
  ]).then(([landscape,portrait])=>{
   if(this.dead)return;this.landscape=landscape;this.portrait=portrait;
   this.resize(this.width,this.height,this.height);this.sample();
  }).catch(error=>{this.loading=undefined;throw error;});
  return this.loading;
 }
 resize(w:number,h:number,_contentHeight:number,_layout?:ReturnType<typeof gameLayout>){
  if(this.dead||w<=0||h<=0)return;
  this.width=w;this.height=h;this.base.width=w;this.base.height=h;
  const l=showdownLayout(w,h),texture=l.wide?this.landscape:this.portrait;
  if(!texture)return;
  const p=paintedVaultPlacement(w,h,texture.width,texture.height);
  this.painting.texture=texture;this.painting.position.set(p.x,p.y);this.painting.width=p.width;this.painting.height=p.height;
  // Water occupies the rear shoreline; rocks float in the same camera space behind the fighters.
  this.water.forEach((fx,i)=>{fx.rig.position.set(w/2+(i?280:-280)*l.scale,p.floorY-p.height*.19);fx.rig.scale.set(l.scale,l.scale*.65);});
  this.rocks.rig.position.set(w/2,p.floorY-12*l.scale);this.rocks.rig.scale.set(l.scale);
  this.sample();
 }
 setActive(active:boolean,reduced:boolean){this.active=active;this.reduced=reduced;this.sample();}
 setBoard(state:ArenaBoardState){this.guardCount=Math.max(0,Math.min(3,state.index));this.sample();}
 pause(value:boolean){this.paused=value;this.lastTime=null;}
 tick(time:number,reduced:boolean,_low:boolean){
  if(this.dead||!Number.isFinite(time))return;
  const dt=this.lastTime===null?0:Math.max(0,Math.min(.1,time-this.lastTime));this.lastTime=time;
  if(!this.paused){this.time+=dt;this.rockTime+=dt*(1+(3-this.guardCount)*.12);this.impactAge+=dt;this.reveal=Math.max(0,this.reveal-dt*.8);}
  this.reduced=reduced;this.sample();
 }
 private sample(){
  if(this.dead)return;
  if(!this.active){this.rocks.rig.visible=false;this.water.forEach(f=>f.rig.visible=false);return;}
  this.rocks.sample(this.rockTime,this.reduced);this.water.forEach((fx,i)=>{fx.sample(this.time+i*.8,this.reduced);fx.rig.alpha=.58;});
  const pulse=this.reduced?0:this.impactStrength*Math.exp(-this.impactAge*5);
  this.rocks.rig.alpha=.86*(1-this.reveal*.25);this.rocks.rig.rotation=this.reduced?0:Math.sin(this.impactAge*28)*pulse*.025;
  this.painting.tint=pulse>.4?0xe6d6ff:0xffffff;

 }
 beginReveal(reduced:boolean,_reaction=0){this.reveal=reduced?0:1;this.sample();}
 setCardColor(color:number,_reduced:boolean,_duration=.55){this.rocks.rig.tint=color;}
 impact(rare:boolean,reduced:boolean,_celebrate=rare){this.impactAge=0;this.impactStrength=reduced?0:rare?1:.4;this.sample();}
 resetPresentation(){this.impactAge=100;this.impactStrength=0;this.reveal=0;this.guardCount=3;this.rocks.rig.tint=0xffffff;this.sample();}
 destroy(){
  if(this.dead)return;this.dead=true;[...this.water,this.rocks].forEach(f=>f.destroy());this.root.destroy({children:true});
  // Both paintings and the FX atlas stay in the shared Assets cache.
 }
}
