import {Container,Graphics,Texture} from 'pixi.js';
import {Spine,SpineTexture,TextureAtlas,AtlasAttachmentLoader,SkeletonJson,type SkeletonData} from '@esotericsoftware/spine-pixi-v8';
import {SPECIAL_FRAME_ATLAS,buildSpecialFrameRigJson} from './specialFrameRigData';
import {FRAME_COLORS,FRAME_DURATION,specialFrameTier} from './specialFrameGeometry';
import type {PowerKind} from './powerProfiles';
let atlas:TextureAtlas|undefined;
const data=new Map<string,SkeletonData>();
function frameData(kind:PowerKind,rarity:string,low:boolean){
  if(!atlas){
    const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const c=canvas.getContext('2d',{willReadFrequently:true})!;
    c.strokeStyle='#ffffff';c.lineWidth=3;c.lineJoin='round';c.beginPath();c.moveTo(52,12);c.lineTo(27,12);c.quadraticCurveTo(12,12,12,27);c.lineTo(12,52);c.stroke();
    c.globalAlpha=.35;c.lineWidth=9;c.stroke();c.globalAlpha=1;c.fillStyle='#fff';
    c.beginPath();c.moveTo(96,3);c.quadraticCurveTo(101,27,125,32);c.quadraticCurveTo(101,37,96,61);c.quadraticCurveTo(91,37,67,32);c.quadraticCurveTo(91,27,96,3);c.fill();
    c.fillRect(0,64,64,64);
    const soft=c.createLinearGradient(64,0,128,0);soft.addColorStop(0,'#ffffff00');soft.addColorStop(.5,'#ffffff');soft.addColorStop(1,'#ffffff00');c.fillStyle=soft;c.fillRect(64,64,64,64);
    const bloom=c.createRadialGradient(64,192,0,64,192,62);bloom.addColorStop(0,'#ffffff');bloom.addColorStop(.16,'#ffffffcc');bloom.addColorStop(.42,'#ffffff44');bloom.addColorStop(1,'#ffffff00');c.fillStyle=bloom;c.fillRect(0,128,128,128);
    atlas=new TextureAtlas(SPECIAL_FRAME_ATLAS);atlas.pages[0].setTexture(SpineTexture.from(Texture.from(canvas).source));
  }
  const key=`${kind}:${specialFrameTier(rarity)}:${low}`;
  if(!data.has(key))data.set(key,new SkeletonJson(new AtlasAttachmentLoader(atlas)).readSkeletonData(buildSpecialFrameRigJson(kind,rarity,low)));
  return data.get(key)!;
}
/** Native Spine material ribbons and particles, clipped to a safe rim. The
 * rectangular print and all space below the two-pixel lower rim stay untouched. */
export class SpecialCardFrame extends Container {
  private rig:Spine;
  constructor(width:number,height:number,kind:PowerKind,rarity:string,low=false,reduced=false){
    super();this.eventMode='none';
    const tier=specialFrameTier(rarity),palette=FRAME_COLORS[kind],color=parseInt(palette[1],16),core=parseInt(palette[2],16);
    const effects=new Container(),pad=Math.max(5,Math.min(11,width*.065)),radius=Math.max(3,width*.045);
    const edge=new Graphics();
    for(const [line,alpha,tint] of [[8,.18,color],[4,.68,color],[1.4,.95,core]])edge.roundRect(-width/2-1.7,-height/2-1.7,width+3.4,height+3.4,radius+1.7).stroke({color:tint,width:line,alpha});
    effects.addChild(edge);
    this.rig=new Spine({skeletonData:frameData(kind,rarity,low),autoUpdate:false});this.rig.scale.set(width/312,height/435);
    this.rig.state.setAnimation(0,'surround',true);this.rig.update(reduced?0:Math.random()*FRAME_DURATION);effects.addChild(this.rig);
    if(tier===3){const gold=new Graphics();for(const side of [-1,1])gold.moveTo(side*(width/2-18),-height/2-4).lineTo(side*(width/2-3),-height/2-4).quadraticCurveTo(side*(width/2+4),-height/2-4,side*(width/2+4),-height/2+4).lineTo(side*(width/2+4),-height/2+20).stroke({color:0xffe7a2,width:1.6,alpha:.94});effects.addChild(gold);}
    const safeRim=new Graphics().roundRect(-width/2-pad,-height/2-pad,width+2*pad,height+pad+2,radius+pad*.6).fill(0xffffff).roundRect(-width/2,-height/2,width,height,radius).cut();
    this.addChild(effects,safeRim);effects.mask=safeRim;
  }
  update(dt:number){this.rig.update(dt);}
  override destroy(){super.destroy({children:true});}
}
