import {Assets,Container} from 'pixi.js';
import {Spine,TextureAtlas,AtlasAttachmentLoader,SkeletonJson,type SkeletonData} from '@esotericsoftware/spine-pixi-v8';
const names=['left','right','medal','burst','goldSlash','blueSlash','glint','foil'];
let loaded:Promise<SkeletonData>|undefined;
export function preloadWinArtwork(){return loaded??=Assets.load<TextureAtlas>('/assets/win-v34/victory.atlas').then(atlas=>{
 const bones=[{name:'root'},...Array.from({length:34},(_,i)=>({name:'part'+i,parent:'root'}))];
 const slots=bones.slice(1).map((b,i)=>({name:b.name,bone:b.name,attachment:names[i<8?i:i%2?6:7]}));
 const attachments=Object.fromEntries(slots.map(s=>[s.name,{[s.attachment]:{type:'region',path:s.attachment,width:256,height:256}}]));
 return new SkeletonJson(new AtlasAttachmentLoader(atlas)).readSkeletonData({skeleton:{spine:'4.2.22'},bones,slots,skins:[{name:'default',attachments}],animations:{}});
});}
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
/** Separate transparent artwork on Spine bones: no filtered full-screen quad or opaque backdrop. */
export class WinArtwork{
 readonly back=new Container();readonly front=new Container();private rear?:Spine;private crest?:Spine;private disposed=false;
 constructor(private medal=true){this.back.eventMode=this.front.eventMode='none';void preloadWinArtwork().then(data=>{if(this.disposed)return;this.rear=new Spine({skeletonData:data,autoUpdate:false});this.crest=new Spine({skeletonData:data,autoUpdate:false});this.back.addChild(this.rear);this.front.addChild(this.crest);}).catch(()=>{});}
 sample(age:number,w:number,h:number,x:number,y:number,width:number,power:number,reduced=false,impactAge=age-2.05){
  if(!this.rear||!this.crest)return;
  const enter=reduced?1:1-(1-clamp(age/.38))**3,hit=reduced?0:impactAge>=0?Math.exp(-impactAge*8):Math.exp(-age*6),pulse=reduced?0:Math.sin(Math.max(0,age-.12)*5)*Math.exp(-Math.max(0,age-.12)*4);
  const beatHit=reduced?0:Math.max(...[.40,.88,1.4].map(t=>age>=t?.38*Math.exp(-(age-t)*11):0));
  const screenHit=Math.max(hit,beatHit);
  const unit=Math.min(w/720,h/960),intensity=.65+.35*power;
  for(const rig of [this.rear,this.crest])for(const slot of rig.skeleton.slots)slot.color.a=0;
  const put=(rig:Spine,i:number,px:number,py:number,sx:number,sy:number,rot:number,alpha:number)=>{const b=rig.skeleton.findBone('part'+i)!;b.x=px;b.y=-py;b.scaleX=sx;b.scaleY=sy;b.rotation=rot;rig.skeleton.findSlot('part'+i)!.color.a=clamp(alpha);};
  // Crest halves are articulated independently, never stretched into one background.
  const wing=width*.31/256;
  put(this.crest,0,x-width*.36*enter,y+6,wing*(1+hit*.10),wing*.53,-(1-enter)*32+hit*3,enter);
  put(this.crest,1,x+width*.36*enter,y+6,wing*(1+hit*.10),wing*.53,(1-enter)*32-hit*3,enter);
  put(this.crest,2,x,y-36*unit,.20*unit*(1+pulse*.20),.20*unit*(1+pulse*.20),reduced?0:pulse*10,enter*Number(this.medal));
  // Broad, brief impact rays sit behind the actual stage. Transparent centre remains clear.
  const burstAlpha=reduced?0:(.035+.27*screenHit)*intensity;
  put(this.rear,3,w/2,h*.44,Math.min(w,h)*1.22/256*(.7+.3*enter+hit*.08),Math.min(w,h)*1.22/256*(.7+.3*enter+hit*.08),reduced?0:Math.sin(age*.6)*4,burstAlpha);
  for(const i of [4,5]){const side=i===4?-1:1,phase=reduced?1:clamp(age/.6),s=Math.min(w,h)*.68/256;put(this.rear,i,w/2+side*w*(.40+.12*(1-phase)),h*.49+(i-4)*h*.10,s*.45,s,side*(8+Math.sin(age*.7)*3),reduced?.14:(.14+screenHit*.38)*enter);}
  for(let i=8;i<34;i++){
   const k=i-8,side=k%2?-1:1,seed=(k*137.507)%360,a=seed*Math.PI/180,life=reduced?.65:(age*.30+k*.173)%1;
   const radius=.18+.50*life,px=w/2+Math.cos(a)*w*radius,py=h*.45+Math.sin(a)*h*radius;
   const edge=Math.abs(px-w/2)>w*.22||py<h*.24||py>h*.70;
   const s=(i%2?.06:.035)*unit*(.7+.5*power)*(1+hit*.55);
   put(this.rear,i,px,py,s*(i%2?1:.4+Math.abs(Math.sin(age*3+k))*.6),s,reduced?seed:seed+side*age*70,(edge?.72:.12)*enter*intensity*(reduced?.3:Math.sin(life*Math.PI)));
  }
  // Four sharp glints bracket the award on the final hit, with a short afterglow.
  for(let i=0;i<4;i++)put(this.crest,8+i,x+(i%2?1:-1)*width*(i<2?.45:.24),y+(i<2?-10:72)*unit,.12*unit*(1+hit),.12*unit*(1+hit),age*12+i*35,enter*(reduced?.3:.24+.7*hit));
  this.rear.update(0);this.crest.update(0);
 }
 destroy(){this.disposed=true;this.back.destroy({children:true});this.front.destroy({children:true});}
}
