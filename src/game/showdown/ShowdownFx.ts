import {Texture} from 'pixi.js';
import {Spine,SpineTexture,TextureAtlas,AtlasAttachmentLoader,SkeletonJson,type SkeletonData} from '@esotericsoftware/spine-pixi-v8';
import {clamp} from './showdownModel';
type Kind='fire'|'psychic'|'impact'|'guardhit'|'guardbreak';
let atlas:TextureAtlas;
const cache=new Map<Kind,SkeletonData>();
export const SHOWDOWN_FX_ATLAS='showdown.png\nsize: 512,512\nfilter: Linear,Linear\npma: false\nsolid\n  bounds: 0,0,16,16\nflame\n  bounds: 32,0,224,128\narc\n  bounds: 0,144,128,128\nshock\n  bounds: 144,144,160,160\nsmoke\n  bounds: 320,144,128,128\nshard\n  bounds: 272,0,48,96\ncore\n  bounds: 0,320,160,160\nshield\n  bounds: 320,320,160,160\nring\n  bounds: 176,320,128,128\nspark\n  bounds: 272,104,48,32\n';
function getAtlas(){
 if(atlas)return atlas;
 const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const c=canvas.getContext('2d',{willReadFrequently:true})!;c.fillStyle='#fff';c.fillRect(0,0,16,16);
 // Authored flame silhouette: a single directional tongue, with torn trailing lobes.
 c.beginPath();c.moveTo(35,67);c.bezierCurveTo(80,28,106,73,146,32);c.bezierCurveTo(137,56,186,15,251,61);c.bezierCurveTo(224,60,219,85,179,72);c.bezierCurveTo(201,91,127,116,115,82);c.bezierCurveTo(86,110,82,73,35,67);c.fill();
 c.beginPath();for(let i=0;i<=32;i++){const a=-1.45+i/32*2.9,x=64+Math.cos(a)*59,y=208+Math.sin(a)*59;i?c.lineTo(x,y):c.moveTo(x,y);}for(let i=32;i>=0;i--){const a=-1.45+i/32*2.9,r=59-Math.sin(i/32*Math.PI)*13;c.lineTo(64+Math.cos(a)*r,208+Math.sin(a)*r);}c.closePath();c.fill();
 c.beginPath();for(let i=0;i<24;i++){const a=i/24*Math.PI*2,r=i%2?17+(i%5)*3:49+(i%7)*4,x=224+Math.cos(a)*r,y=224+Math.sin(a)*r;i?c.lineTo(x,y):c.moveTo(x,y);}c.closePath();c.fill();
 c.beginPath();c.moveTo(285,6);c.lineTo(315,15);c.lineTo(296,89);c.lineTo(276,62);c.closePath();c.fill();
 // Smoke is deliberately a flat cel shape, not a blurred particle cloud.
 c.beginPath();c.arc(356,217,25,0,Math.PI*2);c.arc(378,191,32,0,Math.PI*2);c.arc(410,216,25,0,Math.PI*2);c.arc(387,235,25,0,Math.PI*2);c.fill();
 const glow=c.createRadialGradient(80,400,0,80,400,78);glow.addColorStop(0,'#fff');glow.addColorStop(.16,'#ffffffc0');glow.addColorStop(.48,'#ffffff28');glow.addColorStop(1,'#ffffff00');c.fillStyle=glow;c.fillRect(0,320,160,160);
 // Faceted psychic glass: a crisp ink contour, two planes, and a bright chipped edge.
 c.fillStyle='#d7dfff';c.strokeStyle='#172447';c.lineWidth=7;c.lineJoin='miter';
 c.beginPath();c.moveTo(345,339);c.lineTo(411,328);c.lineTo(462,366);c.lineTo(436,437);c.lineTo(382,468);c.lineTo(335,407);c.closePath();c.fill();c.stroke();
 c.fillStyle='#ffffff';c.beginPath();c.moveTo(345,339);c.lineTo(404,371);c.lineTo(382,461);c.lineTo(342,406);c.closePath();c.fill();
 c.fillStyle='#91a6ee';c.beginPath();c.moveTo(411,335);c.lineTo(454,369);c.lineTo(431,431);c.lineTo(388,458);c.lineTo(404,371);c.closePath();c.fill();
 c.strokeStyle='#f5ffff';c.lineWidth=3;c.beginPath();c.moveTo(350,344);c.lineTo(410,334);c.lineTo(454,367);c.stroke();
 // Three separated arcs keep the shield identity visible as the pressure ring expands.
 c.strokeStyle='#fff';c.lineWidth=4;c.lineCap='butt';for(let i=0;i<3;i++){const a=i/3*Math.PI*2;c.beginPath();c.arc(240,384,58,a+.08,a+Math.PI*2/3-.08);c.stroke();}
 c.lineWidth=1.5;for(let i=0;i<3;i++){const a=i/3*Math.PI*2;c.beginPath();c.arc(240,384,51,a+.13,a+Math.PI*2/3-.13);c.stroke();}
 c.fillStyle='#fff';c.beginPath();c.moveTo(296,106);c.lineTo(300,116);c.lineTo(318,120);c.lineTo(300,124);c.lineTo(296,134);c.lineTo(292,124);c.lineTo(274,120);c.lineTo(292,116);c.closePath();c.fill();
 atlas=new TextureAtlas(SHOWDOWN_FX_ATLAS);atlas.pages[0].setTexture(SpineTexture.from(Texture.from(canvas).source));return atlas;
}
/** Native Spine mesh deformation for flame pressure, with finite bone/slot impact tracks. */
export function buildShowdownFx(kind:Kind){
 const bones:Record<string,unknown>[]=[{name:'root'}],slots:Record<string,unknown>[]=[],attachments:Record<string,Record<string,unknown>>={},motion:Record<string,unknown>={},alpha:Record<string,unknown>={},deforms:Record<string,unknown>={};
 const add=(name:string,path:string,w:number,h:number,color:string,x=0,y=0,rotation=0)=>{
  bones.push({name,parent:'root',x,y,rotation});slots.push({name,bone:name,attachment:name,color:color+'ff'});attachments[name]={[name]:{path,width:w,height:h}};
 };
 if(kind==='fire'){
  for(const [layer,width,color] of [[0,27,'633044'],[1,22,'ff783c'],[2,13,'ffc66d'],[3,4,'fff8cf']] as const){
   const name='pressure'+layer,vertices:number[]=[],uvs:number[]=[],triangles:number[]=[];
   for(let side=0;side<2;side++)for(let i=0;i<=12;i++){const u=i/12,x=u*320,y=(side?1:-1)*width*(.15+Math.sin(u*Math.PI)*.85);vertices.push(x,y);uvs.push(u,side);}
   for(let i=0;i<12;i++)triangles.push(i,i+1,i+13,i+1,i+14,i+13);
   slots.push({name,bone:'root',attachment:name,color:color+'ff'});attachments[name]={[name]:{type:'mesh',path:'solid',width:16,height:16,vertices,uvs,triangles,hull:0}};
   const frames=[];for(let f=0;f<=16;f++){const time=f/16*1.2;frames.push({time,vertices:vertices.map((_,i)=>i%2?Math.sin((i>>1)%13*.9-time*24+layer*.5)*Math.sin(((i>>1)%13)/12*Math.PI)*(layer===3?2:6):0)});}
   deforms[name]={[name]:{deform:frames}};
   alpha[name]={alpha:[{value:0},{time:.06,value:1},{time:.55,value:1},{time:.85,value:0},{time:1.2,value:0}]};
  }
  for(let i=0;i<5;i++){
   const name='tongue'+i;add(name,'flame',86,47,i%2?'ffba64':'ff7943',52+i*44,(i%2?1:-1)*5,i%2?4:-6);
   motion[name]={translate:[{x:-30,y:0},{time:.24,x:18,y:i%2?8:-8},{time:.5,x:28,y:0},{time:.85,x:28,y:i%2?-12:12}],scale:[{x:.3,y:.3},{time:.12,x:1,y:.8},{time:.5,x:1.3,y:1},{time:.85,x:.6,y:0}]};
   alpha[name]={alpha:[{value:0},{time:.1,value:.9},{time:.5,value:1},{time:.85,value:0}]};
  }
 }else if(kind==='guardhit'){
  // The first ripple is born at contact, then travels across the field.
  for(let i=0;i<3;i++){
   const n='contactRipple'+i,delay=i*.075;add(n,'ring',92,130,i%2?'c8b0ff':'e4f6ff');
   motion[n]={translate:[{x:0,y:0},{time:delay,x:0,y:0},{time:delay+.5,x:100+i*12,y:0}],scale:[{x:.08,y:.08},{time:delay,x:.08,y:.08},{time:delay+.12,x:.3,y:.85},{time:delay+.55,x:.7,y:1.65}]};
   alpha[n]={alpha:[{value:0},{time:delay,value:0},{time:delay+.035,value:.95},{time:delay+.25,value:.65},{time:delay+.55,value:0},{time:1,value:0}]};
  }
  add('contactCore','core',76,114,'dbbdff');motion.contactCore={scale:[{x:.1,y:.1},{time:.04,x:.85,y:1},{time:.24,x:.1,y:.4}]};alpha.contactCore={alpha:[{value:0},{time:.025,value:.85},{time:.24,value:0},{time:1,value:0}]};
 }else if(kind==='guardbreak'){
  add('collapseShell','ring',200,260,'d3bcff');add('singularity','core',130,130,'efe1ff');
  motion.collapseShell={scale:[{x:1,y:1},{time:.06,x:.88,y:1.07},{time:.16,x:.18,y:.18},{time:.21,x:.06,y:.06}],rotate:[{value:0},{time:.21,value:48}]};
  alpha.collapseShell={alpha:[{value:1},{time:.14,value:1},{time:.23,value:0},{time:1.6,value:0}]};
  motion.singularity={scale:[{x:.05,y:.05},{time:.16,x:.55,y:.55},{time:.21,x:1.4,y:1.4},{time:.42,x:.15,y:.15}]};
  alpha.singularity={alpha:[{value:0},{time:.08,value:.3},{time:.16,value:1},{time:.24,value:.8},{time:.42,value:0},{time:1.6,value:0}]};
  for(let i=0;i<2;i++){
   const n=i?'ringEcho':'ring';add(n,'ring',210,210,i?'b8a4ff':'def7ff');
   motion[n]={scale:[{x:.05,y:.05},{time:.18+i*.035,x:.05,y:.05},{time:.39+i*.035,x:1.5,y:i?.55:1.5},{time:.85,x:2.7,y:i?.8:2.7}],rotate:[{value:0},{time:.85,value:i?-35:25}]};
   alpha[n]={alpha:[{value:0},{time:.18+i*.035,value:0},{time:.23+i*.035,value:1},{time:.43,value:.85},{time:.85,value:0},{time:1.6,value:0}]};
  }
  for(let i=0;i<15;i++){
   const large=i<3,n=large?'plate'+i:'glass'+(i-3),a=i/15*Math.PI*2,dx=Math.cos(a),dy=Math.sin(a),radius=large?35:25;
   add(n,large?'arc':'spark',large?125:8+i%3*4,large?155:8+i%3*4,i%2?'b7a9ff':'e7f2ff',dx*radius,dy*radius,a*180/Math.PI);
   motion[n]={translate:[{x:0,y:0},{time:.17,x:-dx*radius*.8,y:-dy*radius*.8},{time:.25,x:dx*35,y:dy*35},{time:.58,x:dx*170,y:dy*170},{time:1.05,x:dx*245,y:dy*245-25}],rotate:[{value:0},{time:.17,value:-30},{time:1.05,value:i%2?130:-130}],scale:[{x:.6,y:.6},{time:.17,x:.12,y:.12},{time:.29,x:1,y:1},{time:1.05,x:.1,y:.1}]};
   alpha[n]={alpha:[{value:0},{time:.17,value:0},{time:.23,value:1},{time:.58,value:.85},{time:1.05,value:0},{time:1.6,value:0}]};
  }
  for(let i=0;i<12;i++){
   const n='spark'+i,a=i/12*Math.PI*2,dx=Math.cos(a),dy=Math.sin(a);add(n,'spark',12,8,'f3eaff');
   motion[n]={translate:[{x:0,y:0},{time:.19,x:dx*10,y:dy*10},{time:.35,x:dx*110,y:dy*110},{time:.75,x:dx*230,y:dy*230}],scale:[{x:0,y:0},{time:.19,x:0,y:0},{time:.26,x:1.5,y:1.5},{time:.75,x:0,y:0}]};
   alpha[n]={alpha:[{value:0},{time:.19,value:0},{time:.23,value:1},{time:.75,value:0},{time:1.6,value:0}]};
  }
 }else if(kind==='psychic'){
  add('halo','core',150,150,'9d79ff');add('orb','shock',51,51,'cfb8ff');add('heart','core',60,60,'ffffff');
  for(let i=0;i<3;i++){const n='orbit'+i;add(n,'arc',87+i*9,87+i*9,i%2?'f5dcff':'9369ff',0,0,i*120);motion[n]={rotate:[{value:0},{time:.3,value:120},{time:.6,value:240},{time:.9,value:360}],scale:[{x:.8,y:.45},{time:.4,x:1.05,y:.6},{time:.9,x:.8,y:.45}]};}
  for(const s of slots)alpha[s.name as string]={alpha:[{value:0},{time:.05,value:1},{time:.75,value:1},{time:.9,value:0}]};
 }else{
  add('ink','shock',170,170,'302743');add('burst','shock',142,142,'ffd88b');add('hot','shock',90,90,'fff8dc');
  for(const n of ['ink','burst','hot']){motion[n]={scale:[{x:.2,y:.2},{time:.045,x:1.1,y:.85},{time:.11,x:1,y:.8},{time:.3,x:1.45,y:.7}]};alpha[n]={alpha:[{value:0},{time:.025,value:1},{time:.105,value:1},{time:.3,value:0}]};}
  for(let i=0;i<9;i++){
   const n='fragment'+i,a=i/9*Math.PI*2,dx=Math.cos(a),dy=Math.sin(a);add(n,'shard',6+i%3*3,25+i%4*8,i%2?'ffba70':'fff0b5',0,0,a*180/Math.PI+90);
   motion[n]={translate:[{x:dx*8,y:dy*8},{time:.12,x:dx*57,y:dy*57},{time:.75,x:dx*(103+i*4),y:dy*105-25}],rotate:[{value:0},{time:.75,value:i%2?90:-90}],scale:[{x:.1,y:.1},{time:.06,x:1,y:1},{time:.75,x:.1,y:.1}]};alpha[n]={alpha:[{value:0},{time:.03,value:1},{time:.35,value:1},{time:.75,value:0}]};
  }
  for(let i=0;i<4;i++){const n='smoke'+i;add(n,'smoke',72,54,i%2?'789099':'d1c7b9');motion[n]={translate:[{x:0,y:0},{time:.3,x:(i-1.5)*43,y:-19-i*7},{time:.95,x:(i-1.5)*77,y:-42-i*12}],scale:[{x:.15,y:.15},{time:.25,x:.8,y:.8},{time:.95,x:1.2,y:1.1}]};alpha[n]={alpha:[{value:0},{time:.12,value:.45},{time:.4,value:.28},{time:.95,value:0}]};}
 }
 return {skeleton:{spine:'4.2.22'},bones,slots,skins:[{name:'default',attachments}],animations:{action:{bones:motion,slots:alpha,...(kind==='fire'?{attachments:{default:deforms}}:{})}}};
}
export class ShowdownFx {
 readonly rig:Spine;
 constructor(readonly kind:Kind){
  if(!cache.has(kind))cache.set(kind,new SkeletonJson(new AtlasAttachmentLoader(getAtlas())).readSkeletonData(buildShowdownFx(kind)));
  this.rig=new Spine({skeletonData:cache.get(kind)!,autoUpdate:false});this.rig.eventMode='none';this.rig.state.setAnimation(0,'action',false);this.rig.update(0);this.rig.visible=false;
 }
 sample(age:number){const duration=this.kind==='guardbreak'?1.6:this.kind==='fire'?1.2:1;this.rig.visible=age>=0&&age<duration;if(!this.rig.visible)return;this.rig.state.getCurrent(0)!.trackTime=clamp(age/duration)*duration;this.rig.update(0);}
 destroy(){this.rig.destroy();}
}
