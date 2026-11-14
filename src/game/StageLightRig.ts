import { Container,Texture } from 'pixi.js';
import { Spine,SpineTexture,TextureAtlas,AtlasAttachmentLoader,SkeletonJson } from '@esotericsoftware/spine-pixi-v8';
import { stageEmissionStrength,centerEmissionStrength,stageLightColor,stageLightLevel } from './stageLighting';

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
    const center=document.createElement('canvas');center.width=1024;center.height=512;const centerContext=center.getContext('2d',{willReadFrequently:true})!,centerPixels=centerContext.createImageData(1024,512);
    for(let i=0;i<pixels.data.length;i+=4){const strength=centerEmissionStrength(pixels.data[i],pixels.data[i+1],pixels.data[i+2],(i/4%1024)/1024,Math.floor(i/4/1024)/512);centerPixels.data[i]=centerPixels.data[i+1]=centerPixels.data[i+2]=255;centerPixels.data[i+3]=pixels.data[i+3]*strength;}centerContext.putImageData(centerPixels,0,0);
    for(let i=0;i<pixels.data.length;i+=4){const strength=stageEmissionStrength(pixels.data[i],pixels.data[i+1],pixels.data[i+2],(i/4%1024)/1024,Math.floor(i/4/1024)/512);pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=255;pixels.data[i+3]*=strength;}
    context.putImageData(pixels,0,0);
    // A narrow near-white core inside each emitter gives the strip a luminous
    // cross-section instead of a flat colored fill. Distance stays inside the mask.
    const distance=new Float32Array(1024*512);
    for(let i=0;i<distance.length;i++)distance[i]=pixels.data[i*4+3]>12?64:0;
    for(let y=1;y<512;y++)for(let x=1;x<1024;x++){const i=y*1024+x;if(distance[i])distance[i]=Math.min(distance[i],distance[i-1]+1,distance[i-1024]+1,distance[i-1025]+1.414);}
    for(let y=510;y>=0;y--)for(let x=1022;x>=0;x--){const i=y*1024+x;if(distance[i])distance[i]=Math.min(distance[i],distance[i+1]+1,distance[i+1024]+1,distance[i+1025]+1.414);}
    const core=document.createElement('canvas');core.width=1024;core.height=512;const cc=core.getContext('2d',{willReadFrequently:true})!,corePixels=cc.createImageData(1024,512);
    for(let i=0;i<distance.length;i++){corePixels.data[i*4]=corePixels.data[i*4+1]=corePixels.data[i*4+2]=255;corePixels.data[i*4+3]=pixels.data[i*4+3]*Math.min(1,distance[i]/5);}
    cc.putImageData(corePixels,0,0);
    const canvas=document.createElement('canvas');canvas.width=2048;canvas.height=2048;const c=canvas.getContext('2d',{willReadFrequently:true})!;
    c.drawImage(mask,0,0);c.save();c.filter='blur(16px)';c.drawImage(mask,1024,0);c.restore();c.drawImage(core,1024,512);
    const radial=c.createRadialGradient(64,576,0,64,576,64);radial.addColorStop(0,'rgba(255,255,255,1)');radial.addColorStop(.12,'rgba(255,255,255,.8)');radial.addColorStop(.4,'rgba(255,255,255,.22)');radial.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=radial;c.fillRect(0,512,128,128);
    const beam=c.createImageData(256,512);
    for(let y=0;y<512;y++)for(let x=0;x<256;x++){
      const v=y/511,n=(x-127.5)/128,spread=.40+(1-v)*.80,edge=Math.exp(-n*n/(spread*spread)*1.5),vertical=Math.sin(v*Math.PI*.60)**1.4,idx=(y*256+x)*4;
      beam.data[idx]=beam.data[idx+1]=beam.data[idx+2]=255;beam.data[idx+3]=edge*vertical*205;
    }c.putImageData(beam,128,512);
    c.drawImage(center,0,1024);c.save();c.filter='blur(5px)';c.drawImage(center,1024,1024);c.globalAlpha=.65;c.filter='blur(15px)';c.drawImage(center,1024,1024);c.restore();
    // Erode the emblem to a thin hot filament; its broad edge remains colored.
    const filament=centerContext.createImageData(1024,512);
    for(let y=2;y<510;y++)for(let x=2;x<1022;x++){
      const i=(y*1024+x)*4;let alpha=255;
      for(const [dx,dy] of [[0,0],[-2,0],[2,0],[0,-2],[0,2]])alpha=Math.min(alpha,centerPixels.data[((y+dy)*1024+x+dx)*4+3]);
      filament.data[i]=filament.data[i+1]=filament.data[i+2]=255;filament.data[i+3]=alpha;
    }
    c.putImageData(filament,0,1536);
    this.atlasTexture=Texture.from(canvas);
    const atlas=new TextureAtlas('stage-lights.png\nsize: 2048,2048\nfilter: Linear,Linear\npma: false\nrim\n  bounds: 0,0,1024,512\nbloom\n  bounds: 1024,0,1024,512\nhighlight\n  bounds: 1024,512,1024,512\nspot\n  bounds: 0,512,128,128\nbeam\n  bounds: 128,512,256,512\ncenter\n  bounds: 0,1024,1024,512\ncenterBloom\n  bounds: 1024,1024,1024,512\ncenterFilament\n  bounds: 0,1536,1024,512\n');atlas.pages[0].setTexture(SpineTexture.from(this.atlasTexture.source));
    const bones:Record<string,unknown>[]=[{name:'root'},{name:'emitter',parent:'root',y:23},{name:'beamL',parent:'emitter',rotation:4},{name:'beamR',parent:'emitter',rotation:-5}];
    const slots:Record<string,unknown>[]=[],attachments:Record<string,unknown>={};
    const slot=(name:string,bone:string,path:string,width:number,height:number,alpha:number,y=0)=>{slots.push({name,bone,attachment:name,blend:['rimCore','centerCore'].includes(name)?'normal':'additive',color:`ffffff${Math.round(alpha*255).toString(16).padStart(2,'0')}`});attachments[name]={[name]:{path,width,height,y}};};
    slot('rimBloom','root','bloom',1024,512,.9);slot('rimCore','root','rim',1024,512,1);slot('rimHighlight','root','highlight',1024,512,.16);
    for(let i=0;i<4;i++){const name=`socket${i}`;bones.push({name,parent:'root',x:(i%2?1:-1)*(i<2?231:351),y:i<2?100:-56});slot(name,name,'spot',i<2?104:116,i<2?40:50,.68);}
    slot('centerBloom','root','centerBloom',1024,512,.8);slot('centerCore','root','center',1024,512,.9);slot('centerWhite','root','centerFilament',1024,512,.35);
    slot('pool','emitter','spot',480,155,.12);slot('beamLeft','beamL','beam',400,510,.23,255);slot('beamRight','beamR','beam',240,470,.11,235);slot('source','emitter','spot',165,40,.14);
    const idleBones:Record<string,unknown>={beamL:{rotate:[{value:-2},{time:4,value:2},{time:8,value:-2}]},beamR:{rotate:[{value:2},{time:4,value:-2},{time:8,value:2}]}};
    for(let i=0;i<4;i++)idleBones[`socket${i}`]={scale:[{x:.94,y:.94},{time:2+i*.14,x:1.04,y:1.04},{time:4+i*.28,x:.94,y:.94}]};
    const data=new SkeletonJson(new AtlasAttachmentLoader(atlas)).readSkeletonData({skeleton:{spine:'4.2.22'},bones,slots,skins:[{name:'default',attachments}],animations:{idle:{bones:idleBones}}});
    this.rig=new Spine({skeletonData:data,autoUpdate:false});this.rig.state.setAnimation(0,'idle',true);this.rig.update(0);this.root.addChild(this.rig);
  }
  resize(x:number,y:number,width:number,flatten=.82){this.flatten=flatten;this.root.position.set(x,y);this.root.scale.set(width/1024,width/1024*flatten);for(const name of ['beamL','beamR'])this.rig.skeleton.findBone(name)!.scaleY=1/flatten;}
  update(dt:number,color:number,reduced:boolean,low:boolean,impact:number,exposure=1,charge=-1){
    if(reduced!==this.reduced){this.reduced=reduced;this.rig.state.clearTracks();this.rig.skeleton.setToSetupPose();if(!reduced)this.rig.state.setAnimation(0,'idle',true);}
    for(const name of ['beamL','beamR'])this.rig.skeleton.findBone(name)!.scaleY=1/this.flatten;this.rig.update(reduced?0:dt);
    for(const slot of this.rig.skeleton.slots){
      const name=slot.data.name,[r,g,b]=stageLightColor(color,name);
      slot.color.set(r,g,b,low&&name.startsWith('beam')?0:stageLightLevel(name,impact,charge));
    }
    this.root.alpha=(low?.8:1)*Math.min(1.08,exposure);

  }
  destroy(){this.root.destroy({children:true});this.atlasTexture.destroy(true);this.baseTexture.destroy(true);}
}
