import {Assets,AlphaFilter,Container} from 'pixi.js';
import {Spine,BlendMode,TextureAtlas,AtlasAttachmentLoader,SkeletonJson,type SkeletonData} from '@esotericsoftware/spine-pixi-v8';
const data:Partial<Record<'ball'|'card',SkeletonData>>={};let loading:Promise<void>|undefined;
export function loadCaptureSeals(){return loading??=Promise.all((['ball','card'] as const).map(async kind=>{
 const base='/assets/capture-seals-v23/'+kind+'-seal';
 const [atlas,json]=await Promise.all([Assets.load<TextureAtlas>(base+'.atlas'),Assets.load(base+'.json')]);
 const skeleton=new SkeletonJson(new AtlasAttachmentLoader(atlas)).readSkeletonData(json);for(const slot of skeleton.slots)slot.blendMode=BlendMode.Additive;data[kind]=skeleton;
})).then(()=>{}).catch(error=>{loading=undefined;throw error;});}
/** Blend authored Spine attachments in premultiplied space, without a glow shader. */
export function createCaptureSeal(kind:'ball'|'card'){
 const skeleton=data[kind];if(!skeleton)return null;
 const container=new Container(),frames=[new Spine({skeletonData:skeleton,autoUpdate:false}),new Spine({skeletonData:skeleton,autoUpdate:false})];
 container.eventMode='none';container.filters=[new AlphaFilter({alpha:1})];container.addChild(...frames);
 function sample(progress:number){const frame=Math.max(0,Math.min(15,progress*15)),a=Math.floor(frame),b=Math.min(15,a+1),u=frame-a;
  frames.forEach((rig,i)=>{rig.skeleton.setToSetupPose();if(!rig.state.getCurrent(0))rig.state.setAnimation(0,'draw',false);rig.state.getCurrent(0)!.trackTime=(i?b:a)*.06+.00001;rig.update(0);rig.alpha=i?u:1-u;});
 }
 sample(0);return{container,sample};
}
