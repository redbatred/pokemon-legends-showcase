import { Container,Texture } from 'pixi.js';
import { Spine,SpineTexture,TextureAtlas,AtlasAttachmentLoader,SkeletonJson } from '@esotericsoftware/spine-pixi-v8';
import { stageEmissionStrength,centerEmissionStrength } from './stageLighting';

/** The chassis never enters this rig: every attachment is light on transparent pixels. */
export class StageLightRig {
  root=new Container({isRenderGroup:true});
  private rig:Spine;private atlasTexture:Texture;private reduced=false;private flatten=.82;readonly baseTexture:Texture;
  constructor(platform:Texture){
    const unlit=document.createElement('canvas');unlit.width=platform.width;unlit.height=platform.height;const uc=unlit.getContext('2d',{willReadFrequently:true})!;uc.drawImage(platform.source.resource as CanvasImageSource,0,0);const base=uc.getImageData(0,0,unlit.width,unlit.height);
    for(let i=0;i<base.data.length;i+=4){const u=(i/4%unlit.width)/unlit.width,v=Math.floor(i/4/unlit.width)/unlit.height,amount=Math.max(stageEmissionStrength(base.data[i],base.data[i+1],base.data[i+2],u,v),centerEmissionStrength(base.data[i],base.data[i+1],base.data[i+2],u,v));for(let ch=0;ch<3;ch++)base.data[i+ch]=base.data[i+ch]*(1-amount)+[37,81,126][ch]*amount;}
    uc.putImageData(base,0,0);this.baseTexture=Texture.from(unlit);
    const mask=document.createElement('canvas');mask.width=1024;mask.height=512;
    const context=mask.getContext('2d',{willReadFrequently:true})!;context.drawImage(platform.source.resource as CanvasImageSource,0,0,1024,512);
    const pixels=context.getImageData(0,0,1024,512);
    const center=document.createElement('canvas');center.width=1024;center.height=512;const centerContext=center.getContext('2d')!,centerPixels=centerContext.createImageData(1024,512);
    for(let i=0;i<pixels.data.length;i+=4){const strength=centerEmissionStrength(pixels.data[i],pixels.data[i+1],pixels.data[i+2],(i/4%1024)/1024,Math.floor(i/4/1024)/512);centerPixels.data[i]=centerPixels.data[i+1]=centerPixels.data[i+2]=255;centerPixels.data[i+3]=pixels.data[i+3]*strength;}centerContext.putImageData(centerPixels,0,0);
    for(let i=0;i<pixels.data.length;i+=4){const strength=stageEmissionStrength(pixels.data[i],pixels.data[i+1],pixels.data[i+2],(i/4%1024)/1024,Math.floor(i/4/1024)/512);pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=255;pixels.data[i+3]*=strength;}
    context.putImageData(pixels,0,0);
    // A narrow near-white core inside each emitter gives the strip a luminous
    // cross-section instead of a flat colored fill. Distance stays inside the mask.
    const distance=new Float32Array(1024*512);
    for(let i=0;i<distance.length;i++)distance[i]=pixels.data[i*4+3]>12?64:0;
    for(let y=1;y<512;y++)for(let x=1;x<1024;x++){const i=y*1024+x;if(distance[i])distance[i]=Math.min(distance[i],distance[i-1]+1,distance[i-1024]+1,distance[i-1025]+1.414);}
    for(let y=510;y>=0;y--)for(let x=1022;x>=0;x--){const i=y*1024+x;if(distance[i])distance[i]=Math.min(distance[i],distance[i+1]+1,distance[i+1024]+1,distance[i+1025]+1.414);}
    const core=document.createElement('canvas');core.width=1024;core.height=512;const cc=core.getContext('2d')!,corePixels=cc.createImageData(1024,512);
    for(let i=0;i<distance.length;i++){corePixels.data[i*4]=corePixels.data[i*4+1]=corePixels.data[i*4+2]=255;corePixels.data[i*4+3]=pixels.data[i*4+3]*Math.min(1,distance[i]/5);}
    cc.putImageData(corePixels,0,0);
    const canvas=document.createElement('canvas');canvas.width=2048;canvas.height=1536;const c=canvas.getContext('2d')!;
    c.drawImage(mask,0,0);c.save();c.filter='blur(16px)';c.drawImage(mask,1024,0);c.restore();c.drawImage(core,1024,512);
    const radial=c.createRadialGradient(64,576,0,64,576,64);radial.addColorStop(0,'rgba(255,255,255,1)');radial.addColorStop(.12,'rgba(255,255,255,.8)');radial.addColorStop(.4,'rgba(255,255,255,.22)');radial.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=radial;c.fillRect(0,512,128,128);
    c.save();c.beginPath();c.rect(128,512,256,512);c.clip();c.translate(128,512);const vertical=c.createLinearGradient(0,0,0,512);vertical.addColorStop(0,'transparent');vertical.addColorStop(.5,'rgba(255,255,255,.05)');vertical.addColorStop(.88,'rgba(255,255,255,.22)');vertical.addColorStop(1,'rgba(255,255,255,.55)');c.fillStyle=vertical;c.beginPath();c.moveTo(0,0);c.lineTo(256,0);c.lineTo(149,512);c.lineTo(107,512);c.closePath();c.fill();c.globalCompositeOperation='destination-in';const edge=c.createLinearGradient(0,0,256,0);edge.addColorStop(0,'transparent');edge.addColorStop(.35,'white');edge.addColorStop(.65,'white');edge.addColorStop(1,'transparent');c.fillStyle=edge;c.fillRect(0,0,256,512);c.restore();
    c.drawImage(center,0,1024);c.save();c.filter='blur(13px)';c.drawImage(center,1024,1024);c.restore();
    this.atlasTexture=Texture.from(canvas);
    const atlas=new TextureAtlas('stage-lights.png\nsize: 2048,1536\nfilter: Linear,Linear\npma: false\nrim\n  bounds: 0,0,1024,512\nbloom\n  bounds: 1024,0,1024,512\nhighlight\n  bounds: 1024,512,1024,512\nspot\n  bounds: 0,512,128,128\nbeam\n  bounds: 128,512,256,512\ncenter\n  bounds: 0,1024,1024,512\ncenterBloom\n  bounds: 1024,1024,1024,512\n');atlas.pages[0].setTexture(SpineTexture.from(this.atlasTexture.source));
    const bones:Record<string,unknown>[]=[{name:'root'},{name:'emitter',parent:'root',y:23},{name:'beamL',parent:'emitter',rotation:4},{name:'beamR',parent:'emitter',rotation:-5}];
    const slots:Record<string,unknown>[]=[],attachments:Record<string,unknown>={};
    const slot=(name:string,bone:string,path:string,width:number,height:number,alpha:number,y=0)=>{slots.push({name,bone,attachment:name,blend:['rimCore','centerCore','pool','beamLeft','beamRight'].includes(name)?'normal':'additive',color:`ffffff${Math.round(alpha*255).toString(16).padStart(2,'0')}`});attachments[name]={[name]:{path,width,height,y}};};
    slot('rimBloom','root','bloom',1024,512,.9);slot('rimCore','root','rim',1024,512,1);slot('rimHighlight','root','highlight',1024,512,.16);
    for(let i=0;i<4;i++){const name=`socket${i}`;bones.push({name,parent:'root',x:(i%2?1:-1)*(i<2?231:351),y:i<2?100:-56});slot(name,name,'spot',i<2?104:116,i<2?40:50,.68);}
    slot('centerBloom','root','centerBloom',1024,512,.8);slot('centerCore','root','center',1024,512,.9);slot('centerWhite','root','center',1024,512,.35);
    slot('pool','emitter','spot',300,105,.4);slot('beamLeft','beamL','beam',380,430,.5,215);slot('beamRight','beamR','beam',260,400,.25,200);slot('source','emitter','spot',160,42,.85);
    const idleBones:Record<string,unknown>={beamL:{rotate:[{value:-2},{time:4,value:2},{time:8,value:-2}]},beamR:{rotate:[{value:2},{time:4,value:-2},{time:8,value:2}]}};
    for(let i=0;i<4;i++)idleBones[`socket${i}`]={scale:[{x:.94,y:.94},{time:2+i*.14,x:1.04,y:1.04},{time:4+i*.28,x:.94,y:.94}]};
    const data=new SkeletonJson(new AtlasAttachmentLoader(atlas)).readSkeletonData({skeleton:{spine:'4.2.22'},bones,slots,skins:[{name:'default',attachments}],animations:{idle:{bones:idleBones}}});
    this.rig=new Spine({skeletonData:data,autoUpdate:false});this.rig.state.setAnimation(0,'idle',true);this.rig.update(0);this.root.addChild(this.rig);
  }
  resize(x:number,y:number,width:number,flatten=.82){this.flatten=flatten;this.root.position.set(x,y);this.root.scale.set(width/1024,width/1024*flatten);for(const name of ['beamL','beamR'])this.rig.skeleton.findBone(name)!.scaleY=1/flatten;}
  update(dt:number,color:number,reduced:boolean,low:boolean,impact:number,exposure=1,charge=-1){
    if(reduced!==this.reduced){this.reduced=reduced;this.rig.state.clearTracks();this.rig.skeleton.setToSetupPose();if(!reduced)this.rig.state.setAnimation(0,'idle',true);}
    for(const name of ['beamL','beamR'])this.rig.skeleton.findBone(name)!.scaleY=1/this.flatten;this.rig.update(reduced?0:dt);
    const rgb=[((color>>16)&255)/255,((color>>8)&255)/255,(color&255)/255];
    for(const slot of this.rig.skeleton.slots){const white=slot.data.name==='rimHighlight'||slot.data.name==='centerWhite'?1:slot.data.name==='source'?.65:0;slot.color.r=white+(1-white)*rgb[0];slot.color.g=white+(1-white)*rgb[1];slot.color.b=white+(1-white)*rgb[2];}
    for(const name of ['beamLeft','beamRight'])this.rig.skeleton.findSlot(name)!.color.a=low?0:(name==='beamLeft'?.5:.25)*(1+impact*.2);
    this.rig.skeleton.findSlot('rimCore')!.color.a=1;
    this.rig.skeleton.findSlot('rimBloom')!.color.a=.9+impact*.1;
    this.rig.skeleton.findSlot('centerCore')!.color.a=.8+impact*.2;
    this.rig.skeleton.findSlot('centerBloom')!.color.a=.65+impact*.35;
    this.rig.skeleton.findSlot('centerWhite')!.color.a=.26+impact*.42;
    const brightness=charge>=0?.08+charge*charge*.92:exposure;
    this.rig.skeleton.findSlot('source')!.color.a=charge>=0?.12+charge*.88:.8+impact*.2;
    this.rig.skeleton.findSlot('pool')!.color.a=charge>=0?.08+charge*.55:.36+impact*.20;
    this.root.alpha=(low?.8:1)*brightness;
  }
  destroy(){this.root.destroy({children:true});this.atlasTexture.destroy(true);this.baseTexture.destroy(true);}
}
