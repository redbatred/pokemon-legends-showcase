import {Assets,AlphaFilter,Container} from 'pixi.js';
import {Spine,BlendMode,AtlasAttachmentLoader,SkeletonJson,type TextureAtlas,type SkeletonData} from '@esotericsoftware/spine-pixi-v8';
let data:SkeletonData;
export async function loadNativeCurrent(){const base='/output/capture-motion-v25/assets/sharp-current';const [atlas,json]=await Promise.all([Assets.load<TextureAtlas>(base+'.atlas'),Assets.load(base+'.json')]);data=new SkeletonJson(new AtlasAttachmentLoader(atlas)).readSkeletonData(json);for(const s of data.slots)s.blendMode=BlendMode.Additive;}
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
export function createNativeCurrent(){const container=new Container(),frames=[new Spine({skeletonData:data,autoUpdate:false}),new Spine({skeletonData:data,autoUpdate:false})];container.filters=[new AlphaFilter({alpha:1})];container.addChild(...frames);container.eventMode='none';
 return{container,sample(p:number,source:{x:number;y:number},target:{x:number;y:number},scale:number){const dx=target.x-source.x,dy=target.y-source.y,distance=Math.hypot(dx,dy);container.visible=p>.015&&p<.99&&distance>2;if(!container.visible)return;container.position.copyFrom(source);container.rotation=Math.atan2(dy,dx);container.scale.set(distance/512,scale*(.18+.07*Math.sin(p*Math.PI)));container.alpha=clamp(p/.12)*clamp((1-p)/.08);const f=(p*13)%4,a=Math.floor(f),u=f-a;frames.forEach((rig,i)=>{rig.skeleton.setToSetupPose();if(!rig.state.getCurrent(0))rig.state.setAnimation(0,'flow',true);rig.state.getCurrent(0)!.trackTime=((i?a+1:a)%4)*.07+.00001;rig.update(0);rig.alpha=i?u:1-u;});}};
}
