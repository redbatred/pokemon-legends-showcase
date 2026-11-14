import {scoreImpact} from './scoreImpact';
import {finalStrikeTravel} from './finalStrike';
import {Assets,Container,Rectangle} from 'pixi.js';
import {AtlasAttachmentLoader,SkeletonJson,Spine,TextureAtlas,type SkeletonData} from '@esotericsoftware/spine-pixi-v8';
import {animeCelMatte} from './AnimeCelMatte';
import {winEffectAge} from './winContinuity';
import {smooth,winCinemaGeometry} from './winCinemaMotion';
import {winAttackBeats,winChoreography,type CinemaTier} from './winChoreography';
import type {PowerKind} from './powerProfiles';
export type AttackKind='fire'|'wind'|'water'|'electric'|'psychic';
export function attackKind(kind:PowerKind):AttackKind{return kind==='fire'?'fire':['water','ice'].includes(kind)?'water':kind==='electric'?'electric':['psychic','fairy','dark'].includes(kind)?'psychic':'wind';}
const pending=new Map<string,Promise<SkeletonData>>();
export function loadWinAttack(kind:AttackKind){let data=pending.get(kind);if(!data){const base='/assets/'+(['fire','wind'].includes(kind)?'win-cinema-v38/':'win-cinema-v39/')+kind;data=Promise.all([Assets.load<TextureAtlas>(base+'.atlas'),Assets.load(base+'.json')]).then(([atlas,json])=>new SkeletonJson(new AtlasAttachmentLoader(atlas)).readSkeletonData(json));pending.set(kind,data);}return data;}
function cel(data:SkeletonData){const spine=new Spine({skeletonData:data,autoUpdate:false});spine.state.setAnimation(0,'draw',false);return spine;}
const sampledFrames=new WeakMap<Spine,number>();
function sample(spine:Spine,frame:number){if(!spine.visible)return;const index=Math.max(0,Math.min(15,Math.floor(frame)));if(sampledFrames.get(spine)===index)return;sampledFrames.set(spine,index);spine.state.getCurrent(0)!.trackTime=Math.max(0,Math.min(15,Math.floor(frame)))/24+.00001;spine.update(0);}
type Point={x:number;y:number};
type Release={bolts:Spine[];wake:Spine[];pressure:Spine;origins:Point[];captured:boolean};
/** Each launch owns its travel and recovery. Overlapping windups never truncate a released attack. */
export class WinAttackFrames{
 readonly root=new Container();private charges:Spine[];private releases:Release[];private matte=animeCelMatte();private edgeMatte=animeCelMatte(true);private lastAge=0;private area=new Rectangle();
 constructor(data:SkeletonData,kind:AttackKind,private tier:CinemaTier='big',color=0xffffff,pressureData:SkeletonData=data,private low=false,private volume=false){
  this.charges=[cel(data),cel(data)];
  this.releases=winAttackBeats(tier).map(()=>({bolts:[cel(data),cel(data)],wake:[cel(data),cel(data)],pressure:cel(pressureData),origins:[],captured:false}));
  this.root.addChild(...this.releases.map(r=>r.pressure),...this.charges,...this.releases.flatMap(r=>[...r.wake,...r.bolts]));
  this.root.eventMode='none';this.matte.resolution=this.edgeMatte.resolution=low?.75:1;this.root.filters=[this.matte];
  for(const rig of this.releases.map(r=>r.pressure))rig.filters=[this.edgeMatte];
  if(kind==='wind')for(const rig of [...this.charges,...this.releases.flatMap(r=>[...r.wake,...r.bolts])])rig.filters=[this.edgeMatte];
  if(kind==='wind'&&color!==0xffffff)for(const rig of [...this.charges,...this.releases.flatMap(r=>[...r.wake,...r.bolts])])rig.tint=color;
 }
 update(age:number,w:number,h:number,origins:Point[],reduced=false){
  const c=winChoreography(age,this.tier),g=winCinemaGeometry(w,h,this.tier==='legendary',age);
  this.root.visible=!reduced;this.area.width=w;this.area.height=h;this.root.filterArea=this.area;
  const sockets=origins.length?origins.slice(0,2):[{x:w/2,y:h*.32}];
  if(age<this.lastAge)for(const r of this.releases)r.captured=false;this.lastAge=age;
  this.charges.forEach((rig,i)=>{const o=sockets[i]??sockets[0];rig.visible=!(this.volume&&age>2.48)&&i<sockets.length&&!!c.beat&&age<c.beat.release;rig.position.set(o.x,o.y);rig.scale.set(w*(.065+c.charge*.11)/512);rig.alpha=c.charge*.85;rig.rotation=(i?-.25:.25);sample(rig,c.charge*4);});
  winAttackBeats(this.tier).forEach((beat,index)=>{
   const r=this.releases[index],fx=winEffectAge(age,beat),opening=index===0;
   if(age>=beat.release&&!r.captured){r.origins=sockets.map(p=>({...p}));r.captured=true;}
   if(this.volume&&!opening){for(const rig of [...r.bolts,...r.wake])rig.visible=false;r.pressure.visible=false;return;}
   const sources=r.captured?r.origins:sockets,travel=beat.finisher?finalStrikeTravel(age):fx.travel,after=fx.after;
   const readable=scoreImpact(w,h,after,beat.finisher,g.amountY);
   const target={x:w/2,y:opening?h*.42:readable.y};
   r.bolts.forEach((rig,i)=>{
    rig.visible=fx.visible&&i<sources.length;const from=sources[i]??sources[0];
    const bow=Math.sin(travel*Math.PI)*(i?1:-1)*w*(opening?.045:beat.finisher?.23:.10);
    rig.position.set(from.x+(target.x-from.x)*travel+bow,from.y+(target.y-from.y)*travel);
    const reach=opening?Math.max(w,h)*1.45:readable.size;
    const size=w*.12+(reach-w*.12)*travel**(opening?1.8:1.3)+(opening?0:Math.sin(travel*Math.PI)*w*.16);
    rig.scale.set(size/512*(opening?1+smooth(after/.5)*.26:1));rig.alpha=(opening?1-smooth((after-.22)/.40):readable.alpha)/(sources.length>1?1.15:1);
    rig.rotation=opening?0:(i?-.14:.14);sample(rig,after<0?travel*5:opening?5+after/fx.tail*10:7+after/.14*8);
   });
   r.wake.forEach((rig,i)=>{
    if(beat.finisher&&after>=0){
     rig.visible=after<.78;rig.position.set(w/2+(i?1:-1)*readable.sideX,readable.sideY);
     rig.scale.set(readable.sideSize/512);rig.alpha=readable.sideAlpha;rig.rotation=i?-.45:.45;sample(rig,8+after/.78*7);return;
    }
    const from=sources[i%sources.length],t=Math.max(0,travel-.10);
    rig.visible=fx.visible&&t>0&&after<0&&(!this.low||i===0);
    rig.position.set(from.x+(target.x-from.x)*t+Math.sin(t*Math.PI)*(i?1:-1)*w*(opening?.045:beat.finisher?.23:.10),from.y+(target.y-from.y)*t);
    const direction=Math.atan2(target.y-from.y,target.x-from.x);rig.rotation=direction-Math.PI/2;
    rig.scale.set(w*(.055+t*.055)/512,w*(.08+t*.14)/512);rig.alpha=.60*(1-smooth((travel-.88)/.12));sample(rig,3+t*6+i);
   });
   // A distinct authored wind cel follows the elemental strike and disperses below the amount.
   const t=after-.035;r.pressure.visible=t>=0&&t<(beat.finisher?1.12:.80);
   r.pressure.position.set(w/2,Math.min(h*.9,g.amountY+h*.04));
   const span=w*(.60+smooth(t/.65)*(beat.finisher?1.05:.65));r.pressure.scale.set(span/512,span/512*.36);
   r.pressure.alpha=(beat.finisher?.72:.40)*(1-smooth(t/(beat.finisher?1.12:.80)));sample(r.pressure,9+Math.max(0,t)/(beat.finisher?1.12:.80)*6);
  });
  this.root.visible=!reduced&&this.root.children.some(r=>r.visible);
 }
 destroy(){this.root.filters=[];this.matte.destroy();this.edgeMatte.destroy();this.root.destroy({children:true});}
}
