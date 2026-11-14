import {Texture} from 'pixi.js';
import {Spine,SpineTexture,TextureAtlas,AtlasAttachmentLoader,SkeletonJson,type SkeletonData} from '@esotericsoftware/spine-pixi-v8';
import {clamp,smooth} from './showdownModel';

export const SHOWDOWN_TRANSITION_ATLAS='transition.png\nsize: 1024,512\nfilter: Linear,Linear\npma: false\narm\n  bounds: 0,0,256,128\nseal\n  bounds: 256,0,192,192\narc\n  bounds: 448,0,256,256\nstreak\n  bounds: 0,192,256,32\nspark\n  bounds: 0,240,48,48\ncorona\n  bounds: 720,0,256,256\n';
let atlas:TextureAtlas|undefined,data:SkeletonData|undefined;
function getAtlas(){
 if(atlas)return atlas;
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=512;const c=canvas.getContext('2d')!;
 // Curved, bevelled locking plates. Their broad dark faces carry the machinery;
 // the cyan edge is an inlaid channel, rather than another floating outline.
 c.lineJoin='round';c.beginPath();c.moveTo(12,93);c.lineTo(29,34);c.quadraticCurveTo(128,-8,227,34);c.lineTo(244,93);c.lineTo(222,113);c.quadraticCurveTo(128,76,34,113);c.closePath();
 const metal=c.createLinearGradient(0,7,0,120);metal.addColorStop(0,'#398ab5');metal.addColorStop(.45,'#1d5680');metal.addColorStop(1,'#0b2b4d');c.fillStyle=metal;c.fill();c.strokeStyle='#061c35';c.lineWidth=5;c.stroke();
 c.beginPath();c.moveTo(34,40);c.quadraticCurveTo(128,2,222,40);c.lineTo(218,52);c.quadraticCurveTo(128,18,38,52);c.closePath();c.fillStyle='#69daf5';c.fill();
 c.beginPath();c.moveTo(39,39);c.quadraticCurveTo(128,5,217,39);c.strokeStyle='#d1faff';c.lineWidth=2;c.stroke();
 c.beginPath();c.moveTo(31,94);c.quadraticCurveTo(128,58,225,94);c.strokeStyle='#061c35';c.lineWidth=9;c.stroke();c.strokeStyle='#3cbce7';c.lineWidth=3;c.stroke();
 c.fillStyle='#123c5d';for(const side of [-1,1]){const x=128+side*76;c.beginPath();c.moveTo(x-10,58);c.lineTo(x+10,58);c.lineTo(x+7,72);c.lineTo(x-7,72);c.closePath();c.fill();c.fillStyle='#c4f5ff';c.fillRect(x-3,59,6,3);c.fillStyle='#123c5d';}
 c.fillStyle='#bceeff';c.beginPath();c.moveTo(118,53);c.lineTo(138,53);c.lineTo(135,59);c.lineTo(121,59);c.closePath();c.fill();
 // The actual seal is a custom blue Poké Ball, with separate recessed and lit planes.
 const sx=352,sy=96;c.fillStyle='#061c35';c.beginPath();c.arc(sx,sy,90,0,Math.PI*2);c.fill();
 const face=c.createLinearGradient(0,12,0,178);face.addColorStop(0,'#f2fdff');face.addColorStop(.49,'#beeafa');face.addColorStop(.51,'#3e92bb');face.addColorStop(1,'#1c527b');c.fillStyle=face;c.beginPath();c.arc(sx,sy,81,0,Math.PI*2);c.fill();c.strokeStyle='#85eaff';c.lineWidth=3;c.stroke();
 c.fillStyle='#082641';c.fillRect(sx-81,sy-8,162,16);c.beginPath();c.arc(sx,sy,39,0,Math.PI*2);c.fill();
 c.fillStyle='#54c9e9';c.beginPath();c.arc(sx,sy,30,0,Math.PI*2);c.fill();c.strokeStyle='#e6fbff';c.lineWidth=3;c.stroke();c.fillStyle='#ecfeff';c.beginPath();c.arc(sx,sy,17,0,Math.PI*2);c.fill();
 c.beginPath();c.arc(sx,sy,68,-Math.PI*.88,-Math.PI*.25);c.strokeStyle='#fff';c.lineWidth=2;c.stroke();
 // Broken orbital ribbons keep a clear aperture instead of washing out the scene.
 c.strokeStyle='#fff';c.lineCap='round';for(let i=0;i<4;i++){
  const a=i*Math.PI/2;c.beginPath();c.arc(576,128,116,a+.12,a+1.17);c.lineWidth=i%2?3:6;c.stroke();
  c.beginPath();c.arc(576,128,106,a+.24,a+.9);c.lineWidth=1.5;c.stroke();
 }
 const streak=c.createLinearGradient(0,0,256,0);streak.addColorStop(0,'#ffffff00');streak.addColorStop(.65,'#ffffff60');streak.addColorStop(1,'#fff');c.fillStyle=streak;c.beginPath();c.moveTo(2,208);c.lineTo(230,203);c.lineTo(254,208);c.lineTo(230,213);c.closePath();c.fill();
 c.fillStyle='#fff';c.beginPath();c.moveTo(24,241);c.lineTo(28,260);c.lineTo(46,264);c.lineTo(28,268);c.lineTo(24,287);c.lineTo(20,268);c.lineTo(2,264);c.lineTo(20,260);c.closePath();c.fill();
 const corona=c.createRadialGradient(848,128,68,848,128,126);corona.addColorStop(0,'#ffffff00');corona.addColorStop(.55,'#ffffff0a');corona.addColorStop(.74,'#ffffff70');corona.addColorStop(.8,'#ffffffc0');corona.addColorStop(.85,'#ffffff45');corona.addColorStop(1,'#ffffff00');c.fillStyle=corona;c.fillRect(720,0,256,256);
 atlas=new TextureAtlas(SHOWDOWN_TRANSITION_ATLAS);atlas.pages[0].setTexture(SpineTexture.from(Texture.from(canvas).source));return atlas;
}
/** Authored native Spine timelines: approach, latch, charge, release. No ticking particles. */
export function buildShowdownTransitionFx(){
 const bones:Record<string,unknown>[]=[{name:'root'},{name:'collar',parent:'root'}],slots:Record<string,unknown>[]=[],attachments:Record<string,Record<string,unknown>>={},motion:Record<string,unknown>={},alpha:Record<string,unknown>={};
 const add=(name:string,path:string,w:number,h:number,color='ffffffff',x=0,y=0,rotation=0,parent='root')=>{
  bones.push({name,parent,x,y,rotation});slots.push({name,bone:name,attachment:name,color});attachments[name]={[name]:{path,width:w,height:h}};
 };
 const fade=(name:string,frames:{time?:number;value:number}[])=>{alpha[name]={alpha:frames};};
 add('aura','corona',334,334,'69dfff88');
 motion.aura={scale:[{x:1.5,y:1.5},{time:.38,x:1,y:1},{time:.6,x:1.07,y:1.07},{time:.88,x:1,y:1},{time:1.42,x:4,y:4}]};
 fade('aura',[{value:0},{time:.2,value:0},{time:.38,value:.3},{time:.61,value:.5},{time:.88,value:.35},{time:1.02,value:.7},{time:1.42,value:0},{time:1.62,value:0}]);
 // Eight individually rigged plates rotate into their keyed radial sockets.
 motion.collar={rotate:[{value:-18},{time:.38,value:0},{time:.88,value:0},{time:1.36,value:28}]};
 for(let i=0;i<8;i++){
  const n='arm'+i,a=i*Math.PI/4,dx=Math.cos(a),dy=Math.sin(a);
  add(n,'arm',116,58,'ffffffff',dx*118,dy*118,a*180/Math.PI-90,'collar');
  motion[n]={translate:[{x:dx*500,y:dy*500},{time:.14,x:dx*205,y:dy*205},{time:.32,x:dx*5,y:dy*5},{time:.38,x:0,y:0},{time:.88,x:0,y:0},{time:1.04,x:dx*70,y:dy*70},{time:1.42,x:dx*750,y:dy*750}],rotate:[{value:24},{time:.32,value:-2},{time:.38,value:0},{time:.88,value:0},{time:1.42,value:-24}]};
  fade(n,[{value:0},{time:.07,value:1},{time:1.06,value:1},{time:1.42,value:0},{time:1.62,value:0}]);
 }
 for(let i=0;i<2;i++){
  const n='orbit'+i;add(n,'arc',i?196:332,i?196:332,i?'b8f5ffff':'65d5f9ff');
  motion[n]={rotate:[{value:i?30:-15},{time:.38,value:i?-12:0},{time:.88,value:i?-70:24},{time:1.4,value:i?-150:80}],scale:[{x:1.5,y:1.5},{time:.38,x:1,y:1},{time:.88,x:1,y:1},{time:1.4,x:4,y:4}]};
  fade(n,[{value:0},{time:.21,value:0},{time:.38,value:i?.85:.55},{time:.88,value:i?.85:.55},{time:1.08,value:.9},{time:1.4,value:0},{time:1.62,value:0}]);
 }
 // Streamlines stop at the seal's edge; paired late tracks carry the release outwards.
 for(let i=0;i<16;i++){
  const a=i*Math.PI/8+.08,dx=Math.cos(a),dy=Math.sin(a),delay=(i%4)*.025,n='intake'+i;
  add(n,'streak',150+(i%3)*30,8,i%4?'66dbffff':'dbfaffff',dx*190,dy*190,a*180/Math.PI+180);
  motion[n]={translate:[{x:dx*370,y:dy*370},{time:.13+delay,x:dx*220,y:dy*220},{time:.34+delay,x:0,y:0},{time:.47+delay,x:-dx*60,y:-dy*60}],scale:[{x:1.6,y:.5},{time:.3,x:1,y:1},{time:.5,x:.1,y:.1}]};
  fade(n,[{value:0},{time:.1+delay,value:0},{time:.17+delay,value:.8},{time:.35+delay,value:.7},{time:.48+delay,value:0},{time:1.62,value:0}]);
  const out='release'+i;add(out,'streak',180,7,i%4?'78e9ffff':'e8fdffff',dx*145,dy*145,a*180/Math.PI);
  motion[out]={translate:[{x:0,y:0},{time:.9+delay,x:0,y:0},{time:1.14+delay,x:dx*250,y:dy*250},{time:1.48,x:dx*800,y:dy*800}],scale:[{x:.1,y:.1},{time:.88,x:.1,y:.1},{time:1.02,x:1,y:1},{time:1.48,x:1.8,y:.1}]};
  fade(out,[{value:0},{time:.9+delay,value:0},{time:.98+delay,value:.8},{time:1.18,value:.45},{time:1.48,value:0},{time:1.62,value:0}]);
 }
 add('seal','seal',146,146);
 motion.seal={scale:[{x:.4,y:.4},{time:.22,x:.4,y:.4},{time:.36,x:1.06,y:1.06},{time:.43,x:1,y:1},{time:.88,x:1,y:1},{time:.98,x:.82,y:.82},{time:1.1,x:.2,y:.2}],rotate:[{value:-35},{time:.38,value:0},{time:.88,value:0},{time:1.1,value:20}]};
 fade('seal',[{value:0},{time:.18,value:0},{time:.32,value:1},{time:.88,value:1},{time:1.05,value:0},{time:1.62,value:0}]);
 for(let i=0;i<4;i++){
  const a=i*Math.PI/2+Math.PI/4,n='latch'+i;add(n,'spark',21,21,'d6faffff',Math.cos(a)*94,Math.sin(a)*94,45);
  motion[n]={scale:[{x:.1,y:.1},{time:.32,x:.1,y:.1},{time:.39,x:1.4,y:1.4},{time:.55,x:.2,y:.2},{time:.88,x:.2,y:.2},{time:.94,x:1.7,y:1.7},{time:1.07,x:.1,y:.1}]};
  fade(n,[{value:0},{time:.32,value:0},{time:.38,value:1},{time:.55,value:0},{time:.88,value:0},{time:.94,value:1},{time:1.07,value:0},{time:1.62,value:0}]);
 }
 return {skeleton:{spine:'4.2.22'},bones,slots,skins:[{name:'default',attachments}],animations:{transition:{bones:motion,slots:alpha}}};
}
export class ShowdownTransitionFx {
 readonly rig:Spine;
 private sampleTime=0;
 private ambientTime=0;
 constructor(){
  data??=new SkeletonJson(new AtlasAttachmentLoader(getAtlas())).readSkeletonData(buildShowdownTransitionFx());
  this.rig=new Spine({skeletonData:data,autoUpdate:false});this.rig.eventMode='none';
  const collar=this.rig.skeleton.findBone('collar')!,seal=this.rig.skeleton.findBone('seal')!,outer=this.rig.skeleton.findBone('orbit0')!,inner=this.rig.skeleton.findBone('orbit1')!;
  // Ambient time continues during an asset hold. Apply the breathing after Spine
  // samples its authored pose, so it never accumulates or changes cover/opacity.
  this.rig.beforeUpdateWorldTransforms=()=>{
   const weight=smooth((this.sampleTime-.28)/.12)*(1-smooth((this.sampleTime-.9)/.3)),phase=this.ambientTime;
   collar.rotation+=Math.sin(phase*1.2)*.8*weight;
   outer.rotation+=Math.sin(phase*.85)*6*weight;inner.rotation-=Math.sin(phase*.7)*7*weight;
   const pulse=1+Math.sin(phase*3.1)*.012*weight;seal.scaleX*=pulse;seal.scaleY*=pulse;
  };
  this.rig.state.setAnimation(0,'transition',false);this.rig.update(0);
 }
 sample(time:number,w:number,h:number,reduced:boolean,ambientTime=time){
  this.rig.visible=!reduced&&time>0&&time<1.62;if(!this.rig.visible)return;
  this.sampleTime=time;this.ambientTime=ambientTime;
  this.rig.position.set(w/2,h/2);this.rig.scale.set(Math.min(1.12,w/540,h/470));
  this.rig.skeleton.setToSetupPose();this.rig.state.getCurrent(0)!.trackTime=clamp(time/1.62)*1.62;this.rig.update(0);
 }
 destroy(){this.rig.destroy();}
}
