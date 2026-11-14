import {Assets} from 'pixi.js';
import {Spine,TextureAtlas,AtlasAttachmentLoader,SkeletonJson,type SkeletonData} from '@esotericsoftware/spine-pixi-v8';
type Kind='wind';const data={} as Record<Kind,SkeletonData>;
export async function loadPremiumCels(){await Promise.all((['wind'] as const).map(async kind=>{const base='/output/capture-motion-v25/assets/'+'wing-wind-v30';const [atlas,json]=await Promise.all([Assets.load<TextureAtlas>(base+'.atlas'),Assets.load(base+'.json')]);data[kind]=new SkeletonJson(new AtlasAttachmentLoader(atlas)).readSkeletonData(json);}));}
export function createPremiumCel(kind:Kind){const rig=new Spine({skeletonData:data[kind],autoUpdate:false});rig.eventMode='none';rig.state.setAnimation(0,'draw',false);return{rig,sample(frame:number){rig.skeleton.setToSetupPose();rig.state.getCurrent(0)!.trackTime=Math.max(0,Math.min(15,Math.floor(frame)))*.06+.00001;rig.update(0);}};}
/** Win-to-bet presentation only; never changes the outcome. */
export function cardFireIntensity(ratio:number){const p=Math.max(0,Math.min(1,(ratio-20)/160));return Math.sqrt(p);}
