import {Assets,AlphaFilter,Container} from 'pixi.js';
import {Spine,BlendMode,AtlasAttachmentLoader,SkeletonJson,type TextureAtlas,type SkeletonData} from '@esotericsoftware/spine-pixi-v8';
let data:SkeletonData;
export async function loadRewardWave(){const base='/output/capture-motion-v25/assets/reward-sharp';const [atlas,json]=await Promise.all([Assets.load<TextureAtlas>(base+'.atlas'),Assets.load(base+'.json')]);data=new SkeletonJson(new AtlasAttachmentLoader(atlas)).readSkeletonData(json);for(const s of data.slots)s.blendMode=BlendMode.Additive;}
/** 32 larger inked anime cels. Hold each drawing sharply; the stage supplies continuous movement. */
export function createRewardWave(){const container=new Container(),frames=[new Spine({skeletonData:data,autoUpdate:false}),new Spine({skeletonData:data,autoUpdate:false})];container.filters=[new AlphaFilter({alpha:1})];container.addChild(...frames);container.eventMode='none';
 return{container,sample(progress:number){const f=Math.max(0,Math.min(31,progress*31)),a=Math.floor(f);frames.forEach((rig,i)=>{rig.skeleton.setToSetupPose();if(!rig.state.getCurrent(0))rig.state.setAnimation(0,'draw',false);rig.state.getCurrent(0)!.trackTime=(i?Math.min(31,a+1):a)*.06+.00001;rig.update(0);rig.alpha=i?0:1;});}};
}
