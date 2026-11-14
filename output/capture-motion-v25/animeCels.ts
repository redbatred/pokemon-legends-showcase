import {Assets} from 'pixi.js';
import {Spine,TextureAtlas,AtlasAttachmentLoader,SkeletonJson,type SkeletonData} from '@esotericsoftware/spine-pixi-v8';
let ink:SkeletonData,impact:SkeletonData,eye:SkeletonData;
export async function loadAnimeCels(){
 const load=async(name:string)=>{const base='/output/capture-motion-v25/assets/'+name;const [atlas,json]=await Promise.all([Assets.load<TextureAtlas>(base+'.atlas'),Assets.load(base+'.json')]);return new SkeletonJson(new AtlasAttachmentLoader(atlas)).readSkeletonData(json);};
 [ink,impact,eye]=await Promise.all([load('anime-ink-v26'),load('anime-impact-v27'),load('lugia-eye-v27')]);
}
export function createAnimeCel(kind:'ink'|'impact'|'eye'){
 const rig=new Spine({skeletonData:kind==='ink'?ink:kind==='eye'?eye:impact,autoUpdate:false});rig.eventMode='none';
 const sample=(frame:number)=>{rig.skeleton.setToSetupPose();if(!rig.state.getCurrent(0))rig.state.setAnimation(0,'draw',false);rig.state.getCurrent(0)!.trackTime=Math.max(0,Math.min(kind==='impact'?31:15,Math.floor(frame)))*.06+.00001;rig.update(0);};sample(0);return{rig,sample};
}
