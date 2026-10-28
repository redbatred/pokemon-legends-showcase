import {Assets,Container,Graphics,Text,Texture} from 'pixi.js';
import {Spine,SpineTexture,TextureAtlas,AtlasAttachmentLoader,SkeletonJson,type SkeletonData} from '@esotericsoftware/spine-pixi-v8';
import type {WinTier} from './winTransfer';
import {celebrationPose,specialWinGeometry,WIN_FRAME_ASSET} from './winCelebrationMotion';
import {WIN_BANNER_ATLAS,buildWinBannerRigJson} from './winBannerRigData';
import {WIN_FX_ATLAS,buildWinFxRigJson} from './winFxRigData';
import {playSound} from './audio';
export {specialWinGeometry} from './winCelebrationMotion';

type Rigs={banner:SkeletonData;fx:Record<Exclude<WinTier,null>,SkeletonData>};
let rigs:Promise<Rigs>|undefined;
/** Shared textures/data; every award owns its own Spine state and pose. */
export function preloadWinCelebration(){
 return rigs??=(async()=>{
  const texture=await Assets.load<Texture>(WIN_FRAME_ASSET),atlas=new TextureAtlas(WIN_BANNER_ATLAS);
  atlas.pages[0].setTexture(SpineTexture.from(texture.source));
  const banner=new SkeletonJson(new AtlasAttachmentLoader(atlas)).readSkeletonData(buildWinBannerRigJson());
  // Small code-native texture atlas; all placement/deformation is authored in Spine.
  const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const c=canvas.getContext('2d')!;
  c.fillStyle='#fff';c.beginPath();c.moveTo(3,5);c.lineTo(17,2);c.lineTo(29,25);c.lineTo(14,30);c.closePath();c.fill();
  c.beginPath();[[32,32],[58,27],[64,1],[70,27],[96,32],[70,37],[64,63],[58,37]].forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();
  c.beginPath();c.moveTo(0,80);c.lineTo(241,66);c.lineTo(256,80);c.lineTo(241,94);c.closePath();c.fill();
  const stripe=c.createLinearGradient(128,0,160,0);stripe.addColorStop(0,'#ffffff00');stripe.addColorStop(.25,'#ffffff88');stripe.addColorStop(.5,'#ffffffff');stripe.addColorStop(.75,'#ffffff88');stripe.addColorStop(1,'#ffffff00');c.fillStyle=stripe;c.fillRect(128,0,32,64);
  const fxAtlas=new TextureAtlas(WIN_FX_ATLAS);fxAtlas.pages[0].setTexture(SpineTexture.from(Texture.from(canvas).source));
  const reader=new SkeletonJson(new AtlasAttachmentLoader(fxAtlas));
  return {banner,fx:{special:reader.readSkeletonData(buildWinFxRigJson(false,true)),big:reader.readSkeletonData(buildWinFxRigJson(false)),epic:reader.readSkeletonData(buildWinFxRigJson(true))}};
 })().catch(error=>{rigs=undefined;throw error;});
}

/** Two actual Spine skeletons: the winged award and full-screen weighted effects. */
export class WinCelebration {
 root=new Container();private shade=new Graphics();private title:Text;private banner:Spine|null=null;private fx:Spine|null=null;
 private age=0;private lastAge=0;private sounded=false;private geometry=specialWinGeometry(1280,720);
 constructor(private tier:Exclude<WinTier,null>,low=false){
  this.title=new Text({text:tier==='epic'?'EPIC WIN!':tier==='big'?'BIG WIN!':'SPECIAL PULL',style:{fontFamily:'Nunito',fontWeight:'900',fontStyle:'italic',fontSize:30,fill:0xffed87,stroke:{color:0x08244d,width:2},letterSpacing:1.5},resolution:2});this.title.anchor.set(.5);
  this.root.addChild(this.shade,this.title);this.root.eventMode='none';
  void preloadWinCelebration().then(data=>{
   if(this.root.destroyed)return;
   this.fx=new Spine({skeletonData:data.fx[low?'special':tier],autoUpdate:false});this.banner=new Spine({skeletonData:data.banner,autoUpdate:false});
   this.banner.state.addListener({event:(_entry,event)=>{if(event.data.name==='impact'&&!this.sounded){this.sounded=true;if(this.age>=.16&&this.age<.46)playSound(this.tier==='special'?'rare':'win',{gain:this.tier==='special'?.48:.78});}}});
   this.fx.state.setAnimation(0,'celebrate',false);this.banner.state.setAnimation(0,'celebrate',false);
   this.root.addChildAt(this.fx,1);this.root.addChildAt(this.banner,2);
  }).catch(()=>{});
 }
 update(age:number,w:number,h:number,hold:number){
  this.age=age;const g=this.geometry=specialWinGeometry(w,h),p=celebrationPose(age,hold),dt=Math.max(0,age-this.lastAge);
  this.root.alpha=p.alpha;this.shade.clear().rect(0,0,w,h).fill({color:0x061731,alpha:p.enter*(this.tier==='special'?.12:.30)});
  if(this.banner&&this.fx){
   this.banner.position.set(g.x,g.y);this.banner.scale.set(g.width/1000);this.banner.update(dt);
   this.fx.position.set(w/2,g.y);this.fx.scale.set(w/1000,Math.min(1.35,h/700));this.fx.update(dt);this.lastAge=age;
   const bone=this.banner.skeleton.findBone('title')!;
   this.title.position.set(g.x+bone.worldX*g.width/1000,g.y+bone.worldY*g.width/1000);
   this.title.scale.set(Math.hypot(bone.a,bone.c),Math.hypot(bone.b,bone.d));
  }else{this.title.position.set(g.x,g.titleY);this.title.scale.set(1);}
  this.title.style.fontSize=g.titleSize;this.title.alpha=p.titleAlpha;
 }
 amountPose(){
  const g=this.geometry,bone=this.banner?.skeleton.findBone('amount');
  return bone?{x:g.x+bone.worldX*g.width/1000,y:g.y+bone.worldY*g.width/1000,scaleX:Math.hypot(bone.a,bone.c),scaleY:Math.hypot(bone.b,bone.d)}:{x:g.x,y:g.amountY,scaleX:1,scaleY:1};
 }
 destroy(){this.root.destroy({children:true});}
}
