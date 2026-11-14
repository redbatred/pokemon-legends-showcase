import {Texture} from 'pixi.js';
import {AtlasAttachmentLoader,SkeletonJson,Spine,SpineTexture,TextureAtlas,type SkeletonData} from '@esotericsoftware/spine-pixi-v8';

type AttackIndex=0|1|2;
type Json=Record<string,unknown>;
export const VAULT_ATTACK_DURATION=.76;
export const VAULT_ATTACK_ATLAS='vault-attacks.png\nsize: 512,512\nfilter: Linear,Linear\npma: false\nsolid\n  bounds: 0,0,16,16\ntongue\n  bounds: 24,0,232,128\nlobe\n  bounds: 272,0,112,112\ncrest\n  bounds: 0,144,224,224\ncollar\n  bounds: 240,144,128,160\nember\n  bounds: 400,0,56,40\npressure\n  bounds: 240,336,240,48\n';
let atlas:TextureAtlas|undefined;
const dataCache=new Map<AttackIndex,SkeletonData>();

/** Crisp authored cel silhouettes, shared by all attacks; no runtime particle textures. */
function getAtlas(){
 if(atlas)return atlas;
 const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
 const c=canvas.getContext('2d')!;c.fillStyle='#fff';c.fillRect(0,0,16,16);
 c.save();c.translate(24,0);
 c.beginPath();c.moveTo(3,66);c.bezierCurveTo(46,36,58,66,84,31);c.bezierCurveTo(76,54,110,51,126,15);c.bezierCurveTo(116,42,148,43,158,30);c.bezierCurveTo(179,6,203,40,229,62);c.bezierCurveTo(204,59,188,88,164,86);c.bezierCurveTo(172,107,140,119,120,93);c.bezierCurveTo(100,111,91,80,71,96);c.bezierCurveTo(59,102,38,67,3,66);c.fill();c.restore();
 // Rolling comma lobe: a broad curl with a single cutout, not a thin trail.
 c.save();c.translate(272,0);c.beginPath();c.moveTo(8,64);c.bezierCurveTo(4,32,40,8,64,17);c.bezierCurveTo(88,24,94,7,99,4);c.bezierCurveTo(103,26,92,36,80,40);c.bezierCurveTo(108,42,111,82,84,97);c.bezierCurveTo(49,117,12,91,8,64);c.moveTo(38,60);c.bezierCurveTo(43,82,77,88,80,62);c.bezierCurveTo(71,76,51,73,47,54);c.bezierCurveTo(48,39,58,35,65,35);c.bezierCurveTo(44,31,32,43,38,60);c.fill('evenodd');c.restore();
 // Fire Blast's five limbs: a tall head, level outstretched arms and two
 // splayed legs. Unequal, torn flame tips avoid a radial star/sun silhouette.
 c.save();c.translate(112,256);c.beginPath();c.moveTo(12,-105);
 c.bezierCurveTo(26,-76,10,-52,19,-29);
 c.bezierCurveTo(50,-35,75,-25,108,-42);
 c.bezierCurveTo(97,-17,78,-4,41,-6);
 c.bezierCurveTo(49,20,70,56,100,99);
 c.bezierCurveTo(64,91,44,68,18,43);
 c.quadraticCurveTo(6,31,0,18);
 c.bezierCurveTo(-18,49,-47,82,-99,105);
 c.bezierCurveTo(-87,76,-56,45,-35,4);
 c.bezierCurveTo(-64,4,-86,-8,-108,-24);
 c.bezierCurveTo(-75,-18,-55,-37,-18,-26);
 c.bezierCurveTo(-22,-49,-5,-68,12,-105);
 c.closePath();c.fill();c.restore();
 c.save();c.translate(240,144);c.beginPath();c.moveTo(57,5);c.bezierCurveTo(4,14,0,119,59,152);c.bezierCurveTo(104,174,129,106,118,78);c.bezierCurveTo(111,118,88,132,65,111);c.bezierCurveTo(39,89,30,43,57,5);c.fill();c.restore();
 c.beginPath();c.moveTo(401,22);c.quadraticCurveTo(428,0,455,17);c.quadraticCurveTo(439,20,429,35);c.closePath();c.fill();
 c.beginPath();c.moveTo(242,359);c.lineTo(475,339);c.lineTo(444,357);c.lineTo(478,366);c.lineTo(286,369);c.closePath();c.fill();
 atlas=new TextureAtlas(VAULT_ATTACK_ATLAS);atlas.pages[0].setTexture(SpineTexture.from(Texture.from(canvas).source));return atlas;
}

/** Source is x=0, collision is x=320. Mesh, bone and alpha tracks all finish at .76s. */
export function buildVaultAttackFx(index:AttackIndex,reduced=false){
 const bones:Json[]=[{name:'root'}],slots:Json[]=[],attachments:Record<string,Json>={},motion:Record<string,Json>={},alpha:Record<string,Json>={},deforms:Record<string,Json>={};
 const fade=(name:string,peak=1,delay=0,end=.76)=>{alpha[name]={alpha:[{value:0},{time:Math.max(.015,delay),value:0},{time:delay+.055,value:peak},{time:.42,value:peak},{time:Math.min(.55,end-.08),value:peak*.65},{time:end,value:0},{time:.76,value:0}]};};
 const region=(name:string,path:string,width:number,height:number,color:string,x=0,y=0,rotation=0,parent='root')=>{
  bones.push({name,parent,x,y,rotation});slots.push({name,bone:name,attachment:name,color:color+'ff'});attachments[name]={[name]:{path,width,height}};fade(name);
 };
 const mesh=(name:string,color:string,width:number,shape:'cone'|'lance'|'wake',parent='root')=>{
  const vertices:number[]=[],uvs:number[]=[],triangles:number[]=[],segments=20;
  for(let side=0;side<2;side++)for(let i=0;i<=segments;i++){
   const u=i/segments,body=shape==='cone'?Math.pow(Math.sin(u*Math.PI),.55)*(.45+u*.9):shape==='lance'?Math.pow(Math.sin(u*Math.PI),.7):Math.sin(u*Math.PI)*(.55+u*.45);
   const torn=1+(i%3===0?.13:i%3===1?-.08:.03);vertices.push(u*320,(side?1:-1)*width*body*torn);uvs.push(u,side);
  }
  for(let i=0;i<segments;i++)triangles.push(i,i+1,i+segments+1,i+1,i+segments+2,i+segments+1);
  slots.push({name,bone:parent,attachment:name,color:color+'ff'});attachments[name]={[name]:{type:'mesh',path:'solid',width:16,height:16,vertices,uvs,triangles,hull:0}};
  const frames=[];
  for(let f=0;f<=12;f++){
   const time=f/12*.76,phase=reduced?.2:time*27;
   frames.push({time,vertices:vertices.map((_,j)=>{
    if(j%2===0)return 0;const k=(j>>1)%(segments+1),u=k/segments,side=(j>>1)>segments?1:-1;
    return Math.sin(u*Math.PI)*(Math.sin(k*.95-phase)*width*.12+side*Math.sin(k*1.7-phase*1.3)*width*.1);
   })});
  }
  deforms[name]={[name]:{deform:frames}};fade(name);
 };
 const embers=(count:number)=>{
  for(let i=0;i<count;i++){
   const name='ember'+i,sign=i%2?1:-1,x=35+i/count*250;
   region(name,'ember',12+i%3*5,5+i%3*2,i%3?'ffd76b':'fff9db',x,sign*(14+i%4*7),sign*12);
   motion[name]={translate:[{x:-12,y:0},{time:.2,x:7,y:sign*8},{time:.5,x:24,y:sign*(20+i%3*8)},{time:.76,x:32,y:sign*(34+i%3*8)}],scale:[{x:.3,y:.3},{time:.12,x:1,y:1},{time:.48,x:.65,y:.65},{time:.76,x:0,y:0}]};
   fade(name,reduced?0:1,i%4*.018);
  }
 };
 if(index===0){
  mesh('flameShadow','a42e30',49,'cone');mesh('flameOuter','ff6126',44,'cone');mesh('flameInner','ffad32',31,'cone');
  for(let i=0;i<7;i++){
   const name='flameRoll'+i,sign=i%2?1:-1;
   region(name,'tongue',75+i*6,37+i*4,i%2?'ff7927':'ffbd43',53+i*34,sign*(8+i*2),sign*7);
   motion[name]={translate:[{x:-8,y:0},{time:.18,x:5,y:sign*5},{time:.34,x:10,y:sign*-4},{time:.48,x:14,y:sign*8},{time:.76,x:17,y:sign*15}],scale:[{x:.6,y:.5},{time:.13,x:1,y:.85},{time:.3,x:.94,y:1.12},{time:.42,x:1.08,y:.95},{time:.76,x:.5,y:0}]};
  }
  mesh('flameHeart','ffdc6a',20,'cone');mesh('flameCore','fff9df',10,'cone');embers(13);
 }else if(index===1){
  mesh('blastWakeOuter','ec4a25',23,'wake');mesh('blastWakeHot','ffb240',12,'wake');
  region('fireCrest','crest',126,154,'ff6828',292,0);
  motion.fireCrest={translate:[{x:-30,y:0},{time:.2,x:-8,y:0},{time:.42,x:8,y:0},{time:.76,x:8,y:0}],scale:[{x:.32,y:.32},{time:.12,x:.6,y:.6},{time:.32,x:.96,y:.96},{time:.42,x:1,y:1},{time:.76,x:1.18,y:1.18}],rotate:[{value:-5},{time:.42,value:0},{time:.76,value:3}]};
  // The hot inner crest shares the outer crest's bone so all five arms stay registered.
  slots.push({name:'crestHot',bone:'fireCrest',attachment:'crestHot',color:'ffca4aff'});attachments.crestHot={crestHot:{path:'crest',width:91,height:111}};fade('crestHot');
  const limbTongues=[[3,43,88],[42,12,6],[-42,8,174],[-29,-39,-128],[31,-37,-52]] as const;
  for(let i=0;i<5;i++){
   const [x,y,rotation]=limbTongues[i],name='crestLobe'+i;
   region(name,'tongue',29,15,i%2?'ffc350':'ffe285',x,y,rotation,'fireCrest');
   fade(name,.65);
   motion[name]={rotate:[{value:-6},{time:.2,value:reduced?0:8},{time:.42,value:reduced?0:-7},{time:.76,value:reduced?0:12}],translate:[{x:0,y:0},{time:.2,x:reduced?0:2,y:reduced?0:-2},{time:.42,x:reduced?0:-2,y:reduced?0:3},{time:.76,x:0,y:0}],scale:[{x:.6,y:.6},{time:.2,x:1,y:.85},{time:.42,x:1.15,y:1},{time:.76,x:.5,y:.5}]};
  }
  slots.push({name:'crestCore',bone:'fireCrest',attachment:'crestCore',color:'fff8dcff'});attachments.crestCore={crestCore:{path:'crest',width:57,height:69}};fade('crestCore');embers(9);
 }else{
  bones.push({name:'lanceBody',parent:'root'});
  motion.lanceBody={scale:[{x:.36,y:.18},{time:.045,x:.56,y:.28},{time:.12,x:1,y:1},{time:.3,x:1,y:1.08},{time:.42,x:1,y:1},{time:.76,x:1,y:.15}]};
  for(let i=0;i<6;i++){
   const name='pressure'+i,sign=i%2?1:-1;
   region(name,'pressure',100+i%3*29,9+i%2*3,'ffc57a',83+i%3*66,sign*(48+i%3*6),sign*-4);
   motion[name]={translate:[{x:-22,y:0},{time:.12,x:-12,y:0},{time:.42,x:40,y:sign*7},{time:.76,x:52,y:sign*12}],scale:[{x:.2,y:.2},{time:.1,x:.4,y:.6},{time:.25,x:1,y:1},{time:.76,x:.4,y:0}]};fade(name,reduced?0:.75,.035);
  }
  mesh('lanceShadow','b8372b',45,'lance','lanceBody');mesh('lanceOuter','fb6a26',39,'lance','lanceBody');mesh('lanceHot','ffbb3d',29,'lance','lanceBody');
  for(let i=0;i<5;i++){
   const name='collar'+i;
   region(name,'collar',47,72,i%2?'ffda63':'ff8d2b',48+i*51,0,-30+i*17,'lanceBody');
   motion[name]={rotate:[{value:0},{time:.2,value:reduced?0:50},{time:.42,value:reduced?0:114},{time:.76,value:reduced?0:175}],translate:[{x:-8,y:0},{time:.42,x:9,y:0},{time:.76,x:15,y:0}],scale:[{x:.55,y:.6},{time:.15,x:1,y:1},{time:.42,x:1.1,y:1.14},{time:.76,x:.8,y:.3}]};
  }
  mesh('lanceCore','fff7d2',15,'lance','lanceBody');mesh('lanceWhite','fffef0',6,'lance','lanceBody');embers(11);
 }
 return {skeleton:{spine:'4.2.22'},bones,slots,skins:[{name:'default',attachments}],animations:{action:{bones:motion,slots:alpha,attachments:{default:deforms}}}};
}

export class VaultAttackFx{
 readonly rig:Spine;
 private reduced=false;
 constructor(readonly index:AttackIndex){
  this.rig=new Spine({skeletonData:this.data(),autoUpdate:false});this.rig.eventMode='none';this.rig.state.setAnimation(0,'action',false);this.rig.update(0);this.rig.visible=false;
 }
 private data(){
  if(!dataCache.has(this.index)){
   const normal=buildVaultAttackFx(this.index),reduced=buildVaultAttackFx(this.index,true);
   const json={...normal,animations:{...normal.animations,reduced:reduced.animations.action}};
   dataCache.set(this.index,new SkeletonJson(new AtlasAttachmentLoader(getAtlas())).readSkeletonData(json));
  }
  return dataCache.get(this.index)!;
 }
 sample(age:number,reduced=false){
  this.rig.visible=Number.isFinite(age)&&age>=0&&age<VAULT_ATTACK_DURATION;if(!this.rig.visible)return;
  // Reduced mode keeps the silhouette and timing, but freezes secondary turbulence
  // and removes flying embers/pressure streaks. Animation data shares the same rig.
  if(this.reduced!==reduced){
   this.reduced=reduced;
   this.rig.state.setAnimation(0,reduced?'reduced':'action',false);
  }
  this.rig.skeleton.setToSetupPose();this.rig.state.getCurrent(0)!.trackTime=age;this.rig.update(0);
 }
 destroy(){this.rig.destroy();}
}
