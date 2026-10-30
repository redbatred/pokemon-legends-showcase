import type {PowerKind} from './powerProfiles';
import {FRAME_COLORS,FRAME_DURATION,specialFrameTier,framePerimeter,frameRibbon,frameMote,type FrameMesh} from './specialFrameGeometry';
export const SPECIAL_FRAME_ATLAS=`special-frame.png
size: 256,256
filter: Linear,Linear
pma: false
corner
  bounds: 0,0,64,64
star
  bounds: 64,0,64,64
material
  bounds: 0,64,64,64
soft
  bounds: 64,64,64,64
bloom
  bounds: 0,128,128,128
`;
type Mesh={type:'mesh';path:string;width:number;height:number;vertices:number[];uvs:number[];triangles:number[];hull:number};
type Region={path:string;width:number;height:number};
const round=(v:number)=>Math.round(v*10000)/10000;
/** Native mesh/deform timelines, shared per element/rarity/quality. No effect
 * draws on the card texture, and no per-frame texture uploads are needed. */
export function buildSpecialFrameRigJson(kind:PowerKind='fire',rarity='Double rare',low=false){
  const tier=specialFrameTier(rarity),palette=FRAME_COLORS[kind],duration=FRAME_DURATION;
  const bones:{name:string;parent?:string;x?:number;y?:number;rotation?:number}[]=[{name:'root'}];
  const slots:{name:string;bone:string;attachment:string;blend:string;color:string}[]=[];
  const attachments:Record<string,Record<string,Mesh|Region>>={},motion:Record<string,unknown>={},alpha:Record<string,unknown>={},deforms:Record<string,unknown>={};
  const addMesh=(name:string,color:string,layer:number,sample:(time:number)=>FrameMesh,mote=false)=>{
    const base=sample(0);slots.push({name,bone:'root',attachment:name,blend:layer===2?'additive':'normal',color:color+'ff'});
    attachments[name]={[name]:{type:'mesh',path:layer===0?'soft':'material',width:400,height:520,...base,hull:0}};
    const frames=low?24:48,values=[];
    for(let n=0;n<=frames;n++){const time=duration*n/frames,mesh=sample(time);values.push({time:round(time),vertices:mesh.vertices.map((v,i)=>round(v-base.vertices[i]))});}
    deforms[name]={[name]:{deform:values}};
    const strength=mote?.95:layer===0?.38:layer===1?.85:1;
    alpha[name]={alpha:[{value:strength},{time:duration/2,value:strength*.82},{time:duration,value:strength}]};
  };
  const count=low?3+tier:4+tier*2;
  for(const layer of low?[1,2]:[0,1,2])for(let i=0;i<count;i++)addMesh(`flow-${layer}-${i}`,palette[layer],layer,time=>frameRibbon(kind,i,count,time,layer,low));
  const motes=low?2+tier:4+tier*2;
  for(let i=0;i<motes;i++)addMesh(`mote-${i}`,i%3===0?palette[2]:palette[1],i%3===0?2:1,time=>frameMote(kind,i,motes,time),true);
  const add=(name:string,path:string,w:number,h:number,x=0,y=0,rotation=0,color=palette[1])=>{bones.push({name,parent:'root',x,y,rotation});slots.push({name,bone:name,attachment:name,blend:'additive',color:color+'ff'});attachments[name]={[name]:{path,width:w,height:h}};};
  for(let i=0;i<4;i++){
    const name='corner'+i;add(name,'corner',tier===3?62:50,tier===3?62:50,i%2?158:-158,i<2?219:-219,[0,-90,90,180][i],tier===3?'ffe7a2':palette[2]);
    motion[name]={scale:[{x:1,y:1},{time:1.2,x:1.14,y:1.14},{time:2.4,x:1,y:1},{time:3.6,x:1.08,y:1.08},{time:duration,x:1,y:1}]};
    alpha[name]={alpha:[{value:.7},{time:1.2,value:1},{time:2.4,value:.7},{time:3.6,value:.92},{time:duration,value:.7}]};
  }
  const sparks=low?4:8,half=sparks/2;
  for(let i=0;i<sparks;i++){
    const phase=(i<half?0:.5)+(i%half)*.018,head=i%half===0,name='spark'+i;
    add(name,head?'star':'bloom',head?30+tier*3:44,head?30+tier*3:44,0,0,0,head?(tier===3?'ffe7a2':palette[2]):palette[1]);
    motion[name]={translate:Array.from({length:97},(_,n)=>{const p=framePerimeter(n/96-phase);return {time:duration*n/96,x:p.x,y:p.y};})};
    alpha[name]={alpha:[{value:head?1:.34-(i%half)*.04},{time:duration,value:head?1:.34-(i%half)*.04}]};
  }
  return {skeleton:{spine:'4.2.22'},bones,slots,skins:[{name:'default',attachments}],animations:{surround:{bones:motion,slots:alpha,attachments:{default:deforms}}}};
}
