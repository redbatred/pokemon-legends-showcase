import {Texture} from 'pixi.js';
import {Spine,SpineTexture,TextureAtlas,AtlasAttachmentLoader,SkeletonJson,Physics,type SkeletonData,type Skeleton} from '@esotericsoftware/spine-pixi-v8';
import {clamp} from './showdownModel';

export type ShowdownCeremonyKind='summon'|'guard'|'coronation';
export type ShowdownCeremonyPalette='warm'|'cool';
export const SHOWDOWN_GUARD_RADIUS=100;
export const SHOWDOWN_CORONATION_FRAME={halfWidth:156,halfHeight:217.5} as const;
export const SHOWDOWN_CEREMONY_DURATION={summon:1.45,guard:6,coronation:2.7} as const;
export const SHOWDOWN_CEREMONY_ATLAS='ceremony.png\nsize: 1024,1024\nfilter: Linear,Linear\npma: false\nballTop\n  bounds: 0,0,192,96\nballBottom\n  bounds: 0,104,192,96\nbutton\n  bounds: 200,0,64,64\nseal\n  bounds: 272,0,256,128\nribbon\n  bounds: 544,0,96,320\nfield\n  bounds: 0,224,256,256\nsolid\n  bounds: 800,0,8,8\nchip\n  bounds: 656,0,32,64\nspark\n  bounds: 696,0,64,64\ncurrent\n  bounds: 272,224,256,256\nrim\n  bounds: 0,496,336,464\n';
let atlas:TextureAtlas|undefined;
const cache=new Map<string,SkeletonData>();

/** Crisp atlas paintings; every moving element below is a native Spine attachment. */
function getAtlas(){
 if(atlas)return atlas;
 const canvas=document.createElement('canvas');canvas.width=canvas.height=1024;const c=canvas.getContext('2d',{willReadFrequently:true})!;
 const polygon=(points:number[],fill:string,stroke?:string,width=2)=>{c.beginPath();for(let i=0;i<points.length;i+=2)i?c.lineTo(points[i],points[i+1]):c.moveTo(points[i],points[i+1]);c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}};
 // Real separate Poké Ball shells: the dark rim and inset planes survive opening.
 c.beginPath();c.moveTo(4,92);c.bezierCurveTo(4,-25,188,-25,188,92);c.closePath();c.fillStyle='#8b233d';c.fill();c.strokeStyle='#18213a';c.lineWidth=7;c.stroke();
 c.beginPath();c.moveTo(13,83);c.bezierCurveTo(15,-4,170,-10,179,83);c.closePath();c.fillStyle='#f45d69';c.fill();
 c.beginPath();c.moveTo(23,62);c.bezierCurveTo(37,14,109,6,147,29);c.strokeStyle='#ffb4ad';c.lineWidth=9;c.stroke();
 c.fillStyle='#18213a';c.fillRect(5,84,182,12);
 c.beginPath();c.moveTo(4,108);c.bezierCurveTo(4,225,188,225,188,108);c.closePath();c.fillStyle='#a7bed1';c.fill();c.strokeStyle='#18213a';c.lineWidth=7;c.stroke();
 c.beginPath();c.moveTo(14,119);c.bezierCurveTo(21,194,152,211,178,119);c.closePath();c.fillStyle='#f5f9f5';c.fill();c.fillStyle='#18213a';c.fillRect(5,104,182,12);
 for(const [r,color] of [[30,'#18213a'],[23,'#a6dae9'],[15,'#fffdf0']] as const){c.beginPath();c.arc(232,32,r,0,Math.PI*2);c.fillStyle=color;c.fill();}
 // Perspective floor seal with sharply segmented inlays.
 c.lineWidth=3;c.strokeStyle='#fff';for(let ring=0;ring<2;ring++)for(let i=0;i<8;i++){c.beginPath();c.ellipse(400,64,ring?105:124,ring?42:58,0,i*Math.PI/4+.04,(i+1)*Math.PI/4-.08);c.stroke();}
 for(let i=0;i<8;i++){const a=i*Math.PI/4,x=400+Math.cos(a)*114,y=64+Math.sin(a)*51;polygon([x-3,y,x,y-6,x+3,y,x,y+6],'#fff');}
 // A torn, tapered cel ribbon with a hard white spine and a darker folded face.
 polygon([588,3,622,45,609,104,631,159,598,221,611,267,574,317,592,258,571,209,600,157,579,102,598,50],'#c3c4e6');
 polygon([588,3,608,49,594,104,615,158,586,215,600,262,574,317,590,260,578,213,605,157,586,103,603,49],'#fff');
 // A translucent psychic membrane: color lives at the rim, the body stays readable.
 const glow=c.createRadialGradient(128,352,24,128,352,128);
 glow.addColorStop(0,'#c0a1ff00');glow.addColorStop(.68,'#aa8aff08');glow.addColorStop(.88,'#bba2ff22');glow.addColorStop(.97,'#cbbdff66');glow.addColorStop(1,'#b8f1ff00');
 c.fillStyle=glow;c.fillRect(0,224,256,256);
 c.beginPath();c.ellipse(128,352,127,127,0,0,Math.PI*2);c.strokeStyle='#dcceff88';c.lineWidth=1.4;c.stroke();
 c.beginPath();c.ellipse(125,349,121,122,0,Math.PI*.85,Math.PI*1.45);c.strokeStyle='#f4f4ffd9';c.lineWidth=2;c.stroke();
 c.fillStyle='#fff';c.fillRect(800,0,8,8);
 polygon([669,2,685,19,676,61,657,43],'#fff');polygon([728,1,735,25,759,32,735,39,728,63,721,39,697,32,721,25],'#fff');
 // Flowing surface current with a fine hot core and wider violet falloff.
 for(const [width,color] of [[18,'#9870ff44'],[8,'#b697ffbb'],[3.2,'#f6eaff']] as const){
  c.beginPath();for(let i=0;i<=90;i++){const a=-2.6+i/90*4.1,r=108+Math.sin(a*6)*3,x=400+Math.cos(a)*r,y=352+Math.sin(a)*r;i?c.lineTo(x,y):c.moveTo(x,y);}c.strokeStyle=color;c.lineWidth=width;c.stroke();
 }
 // A silver foil rim uses the card's exact 312 × 435 print, with a small safe margin.
 c.beginPath();c.roundRect(10,508.5,316,439,12);c.strokeStyle='#e7dcff33';c.lineWidth=7;c.stroke();
 c.strokeStyle='#f1ebff';c.lineWidth=1.7;c.stroke();
 c.beginPath();c.roundRect(7,505.5,322,445,15);c.strokeStyle='#c5b1ec66';c.lineWidth=1;c.stroke();
 atlas=new TextureAtlas(SHOWDOWN_CEREMONY_ATLAS);atlas.pages[0].setTexture(SpineTexture.from(Texture.from(canvas).source));return atlas;
}

export function buildShowdownCeremonyFx(kind:ShowdownCeremonyKind,palette:ShowdownCeremonyPalette='cool'){
 const bones:Record<string,unknown>[]=[{name:'root'}],slots:Record<string,unknown>[]=[],attachments:Record<string,Record<string,unknown>>={},motion:Record<string,unknown>={},alpha:Record<string,unknown>={};
 const duration=SHOWDOWN_CEREMONY_DURATION[kind],bright=palette==='warm'?'fff2c7':'dbfbff',mid=palette==='warm'?'ffc369':'a4c3ff',deep=palette==='warm'?'f48256':'a587ef';
 const add=(name:string,path:string,w:number,h:number,color='ffffff',x=0,y=0,rotation=0)=>{bones.push({name,parent:'root',x,y,rotation});slots.push({name,bone:name,attachment:name,color:color+'ff'});attachments[name]={[name]:{path,width:w,height:h}};};
 const fade=(name:string,frames:{time?:number;value:number}[])=>{alpha[name]={alpha:[...frames,{time:duration,value:0}]};};
 if(kind==='summon'){
  add('floorSeal','seal',270,135,mid,0,6);motion.floorSeal={scale:[{x:.12,y:.12},{time:.26,x:.62,y:.62},{time:.52,x:1.15,y:1.15},{time:.9,x:1.28,y:1.28},{time:1.45,x:1.45,y:1.45}]};fade('floorSeal',[{value:0},{time:.09,value:.45},{time:.42,value:.9},{time:.88,value:.6},{time:1.38,value:0}]);
  for(let i=0;i<6;i++){
   const n='ribbon'+i,side=i%2?1:-1,delay=(i>>1)*.055;add(n,'ribbon',39+(i%3)*9,200+(i%3)*40,i%2?mid:deep,side*(23+(i>>1)*29),125+(i%3)*12,side*-9);
   motion[n]={translate:[{x:0,y:-85},{time:.25+delay,x:0,y:-70},{time:.5+delay,x:side*7,y:5},{time:.94+delay,x:side*20,y:65},{time:1.36,x:side*30,y:145}],scale:[{x:.15,y:.02},{time:.25+delay,x:.3,y:.03},{time:.5+delay,x:1,y:1},{time:1.02,x:.6,y:1.1},{time:1.36,x:.05,y:.25}],rotate:[{value:side*12},{time:.65,value:side*-5},{time:1.36,value:side*-18}]};fade(n,[{value:0},{time:.24+delay,value:0},{time:.38+delay,value:.9},{time:.78+delay,value:.7},{time:1.34,value:0}]);
  }
  // Opening halves separate on their own bones; they never dissolve as one sprite.
  for(const [name,path,y,sign] of [['ballTop','ballTop',60,1],['ballBottom','ballBottom',27,-1]] as const){
   add(name,path,66,33,'ffffff',0,y);motion[name]={translate:[{x:0,y:18},{time:.2,x:0,y:0},{time:.29,x:0,y:0},{time:.46,x:sign*-15,y:sign*29},{time:.77,x:sign*-28,y:sign*50}],rotate:[{value:-20},{time:.2,value:0},{time:.29,value:0},{time:.48,value:sign*-24},{time:.77,value:sign*-46}],scale:[{x:.4,y:.4},{time:.19,x:1,y:1},{time:.5,x:1,y:1},{time:.8,x:.3,y:.3}]};fade(name,[{value:0},{time:.07,value:1},{time:.56,value:1},{time:.8,value:0}]);
  }
  add('ballButton','button',24,24,'ffffff',0,43.5);motion.ballButton={scale:[{x:.4,y:.4},{time:.19,x:1,y:1},{time:.29,x:1,y:1},{time:.37,x:1.7,y:1.7},{time:.51,x:.1,y:.1}]};fade('ballButton',[{value:0},{time:.07,value:1},{time:.3,value:1},{time:.51,value:0}]);
  for(let i=0;i<14;i++){
   const n='summonChip'+i,a=i/14*Math.PI*2,dx=Math.cos(a),dy=Math.sin(a),delay=.31+(i%3)*.025;add(n,i%3?'chip':'spark',i%3?9:20,i%3?22:20,i%2?bright:mid,0,45,a*180/Math.PI);
   motion[n]={translate:[{x:0,y:0},{time:delay,x:dx*12,y:dy*12},{time:delay+.21,x:dx*92,y:dy*68+30},{time:1.23,x:dx*150,y:dy*82+58}],rotate:[{value:0},{time:1.23,value:i%2?95:-95}],scale:[{x:.1,y:.1},{time:delay+.05,x:1,y:1},{time:1.23,x:.1,y:.1}]};fade(n,[{value:0},{time:delay,value:0},{time:delay+.035,value:1},{time:.79,value:.65},{time:1.23,value:0}]);
  }
 }else if(kind==='guard'){
  add('barrierField','field',200,260,'d7c5ff');
  alpha.barrierField={alpha:[{value:.8},{time:3,value:1},{time:6,value:.8}]};
  for(let i=0;i<3;i++){
   const n='current'+i;add(n,'current',184,244,i%2?'b0dfff':'cbb4ff',0,0,i*65);
   motion[n]={rotate:[{value:0},{time:3,value:i%2?-180:180},{time:6,value:i%2?-360:360}],scale:[{x:1,y:.65},{time:1.5,x:.72,y:1},{time:3,x:1,y:.65},{time:4.5,x:.72,y:1},{time:6,x:1,y:.65}]};
   alpha[n]={alpha:[{value:.72},{time:3,value:.95},{time:6,value:.72}]};
  }
  for(let i=0;i<9;i++){
   const n='psiMote'+i;add(n,'spark',i%3?5:9,i%3?5:9,i%2?'d3c1ff':'e0faff');
   const frames=[];for(let f=0;f<=48;f++){const a=i*Math.PI*2/9+f/48*Math.PI*2;frames.push({time:f/8,x:Math.cos(a)*92,y:Math.sin(a)*121});}
   motion[n]={translate:frames,scale:[{x:.6,y:.6},{time:3,x:1,y:1},{time:6,x:.6,y:.6}]};alpha[n]={alpha:[{value:.7},{time:3,value:1},{time:6,value:.7}]};
  }
  // Three luminous charge arcs share one membrane; no solid armor covers the Pokémon.
  for(let i=0;i<3;i++){
   const n='guard'+i+'_seam',vertices:number[]=[],uvs:number[]=[],triangles:number[]=[],start=i*Math.PI*2/3+.09,end=(i+1)*Math.PI*2/3-.09;
   for(let j=0;j<=24;j++){const a=start+(end-start)*j/24;for(const edge of [0,1]){vertices.push(Math.cos(a)*(100-edge*1.7),Math.sin(a)*(130-edge*1.7));uvs.push(j/24,edge);}}
   for(let j=0;j<24;j++){const q=j*2;triangles.push(q,q+1,q+2,q+1,q+3,q+2);}
   slots.push({name:n,bone:'root',attachment:n,color:'e1d5ffff'});attachments[n]={[n]:{type:'mesh',path:'solid',width:8,height:8,vertices,uvs,triangles,hull:0}};
   alpha[n]={alpha:[{value:.6},{time:3,value:.95},{time:6,value:.6}]};
   const a=(i+.5)*Math.PI*2/3,rune='guard'+i+'_rune';add(rune,'spark',13,13,'f4eaff',Math.cos(a)*100,Math.sin(a)*130);
   motion[rune]={scale:[{x:.65,y:.65},{time:3,x:1,y:1},{time:6,x:.65,y:.65}]};alpha[rune]={alpha:[{value:.75},{time:3,value:1},{time:6,value:.75}]};
  }
  // One deformable parent preserves x=-100 while the membrane compresses.
  bones.splice(1,0,{name:'membrane',parent:'root'});
  for(const bone of bones)if(bone.name!=='root'&&bone.name!=='membrane')bone.parent='membrane';
  for(const slot of slots)if(slot.bone==='root')slot.bone='membrane';
 }else{
  const {halfWidth:x,halfHeight:y}=SHOWDOWN_CORONATION_FRAME;
  add('cardRim','rim',336,464,'fff0ca');
  fade('cardRim',[{value:0},{time:.4,value:0},{time:.85,value:.95},{time:1.8,value:.7},{time:2.7,value:0}]);
  // Two glints chase the actual rectangular rim, rather than building an unrelated trophy.
  for(let i=0;i<2;i++){
   const n='edgeGlint'+i,side=i?1:-1;add(n,'spark',22,22,i?'e3d4ff':'fff1b6');
   motion[n]={translate:[{x:side*(x+3),y:side*(y+3)},{time:.55,x:side*(x+3),y:side*(y+3)},{time:1.1,x:side*(x+3),y:-side*(y+3)},{time:1.55,x:-side*(x+3),y:-side*(y+3)},{time:2.15,x:-side*(x+3),y:side*(y+3)}],scale:[{x:.1,y:.1},{time:.6,x:1,y:1},{time:1.4,x:.65,y:.65},{time:2.2,x:0,y:0}]};
   fade(n,[{value:0},{time:.48,value:0},{time:.62,value:1},{time:1.65,value:.85},{time:2.2,value:0}]);
  }
  for(let i=0;i<10;i++){
   const n='foilMote'+i,side=i%2?1:-1,delay=.68+i*.055;add(n,'spark',8+i%3*3,8+i%3*3,i%3?'e2d6ff':'fff1cf',side*(x+6),-y+24+(i>>1)*96);
   motion[n]={translate:[{x:0,y:0},{time:delay,x:0,y:0},{time:delay+.6,x:side*22,y:30}],scale:[{x:0,y:0},{time:delay,x:0,y:0},{time:delay+.1,x:1,y:1},{time:delay+.6,x:0,y:0}]};
   fade(n,[{value:0},{time:delay,value:0},{time:delay+.1,value:.9},{time:delay+.6,value:0}]);
  }
 }
 return {skeleton:{spine:'4.2.22'},bones,slots,skins:[{name:'default',attachments}],animations:{action:{bones:motion,slots:alpha}}};
}

/** Apply guard state after sampling the authored pose; safe to seek in either direction. */
export function applyShowdownGuardPose(skeleton:Skeleton,remaining:number,reduced=false,hitPulse=0){
 const count=Math.max(0,Math.min(3,Math.floor(remaining))),pulse=reduced?0:clamp(hitPulse);
 const membrane=skeleton.findBone('membrane')!;membrane.scaleX=1-.18*pulse;membrane.scaleY=1+.09*pulse;membrane.x=-100*(1-membrane.scaleX);
 for(const slot of skeleton.slots){
  const match=/^guard([0-2])_/.exec(slot.data.name);
  if(match){
   if(Number(match[1])>=count){slot.color.a=0;continue;}
   if(reduced&&slot.data.name.endsWith('_rune'))slot.color.a=0;
   else slot.color.a=Math.min(1,slot.color.a+pulse*.22);
   // Only color/alpha reacts to a hit. The fixed collision-facing contour cannot drift.
   slot.color.r+= (1-slot.color.r)*pulse;slot.color.g+=(1-slot.color.g)*pulse;slot.color.b+=(1-slot.color.b)*pulse;
  }else if(slot.data.name==='barrierField'){slot.color.a=count===0?0:Math.min(1,slot.color.a*(.55+.15*count)+pulse*.3);}
  else if(slot.data.name.startsWith('current')||slot.data.name.startsWith('psiMote')){slot.color.a=reduced||count===0?0:Math.min(1,slot.color.a+pulse*.4);}
 }
}

export class ShowdownCeremonyFx {
 readonly rig:Spine;
 constructor(readonly kind:ShowdownCeremonyKind,palette:ShowdownCeremonyPalette='cool'){
  const key=kind+':'+palette;if(!cache.has(key))cache.set(key,new SkeletonJson(new AtlasAttachmentLoader(getAtlas())).readSkeletonData(buildShowdownCeremonyFx(kind,palette)));
  this.rig=new Spine({skeletonData:cache.get(key)!,autoUpdate:false});this.rig.eventMode='none';this.rig.state.setAnimation(0,'action',false);this.rig.update(0);this.rig.visible=false;
 }
 private pose(time:number){this.rig.skeleton.setToSetupPose();this.rig.state.getCurrent(0)!.trackTime=time;this.rig.update(0);}
 sample(age:number,reduced=false){
  const duration=SHOWDOWN_CEREMONY_DURATION[this.kind];this.rig.visible=!reduced&&Number.isFinite(age)&&age>0&&age<duration;
  if(this.rig.visible)this.pose(clamp(age/duration)*duration);
 }
 sampleGuard(time:number,remaining:number,reduced=false,hitPulse=0){
  this.rig.visible=Number.isFinite(time)&&remaining>0;if(!this.rig.visible)return;
  this.pose(reduced?0:((time%6)+6)%6);applyShowdownGuardPose(this.rig.skeleton,remaining,reduced,hitPulse);this.rig.skeleton.updateWorldTransform(Physics.update);
 }
 destroy(){this.rig.destroy();}
}
