import {Container,BlurFilter,Shader,GlProgram,MeshPlane,Texture} from 'pixi.js';
import {groundWarp} from './backdropMotion';
import {advanceRibbonOffset,arenaMessages,ribbonMapping,ribbonMessages,wallScreenPoint,screenTextWindow,type ArenaBoardState,type RibbonCaption} from './stadiumDisplayGeometry';

// The repeated strip moves under a stationary phosphor surface and edge glow.
// Geometry and rail positions never move, and there are no travelling light bands.
const vertex=`in vec2 aPosition;in vec2 aUV;out vec2 vUV;out vec4 vColor;uniform mat3 uProjectionMatrix;uniform mat3 uWorldTransformMatrix;uniform mat3 uTransformMatrix;uniform vec4 uWorldColorAlpha;uniform vec4 uColor;
void main(){vec3 p=uProjectionMatrix*uWorldTransformMatrix*uTransformMatrix*vec3(aPosition,1.0);gl_Position=vec4(p.xy,0.0,1.0);vUV=aUV;vColor=uWorldColorAlpha*uColor;}`;
const fragment=`in vec2 vUV;in vec4 vColor;out vec4 finalColor;uniform sampler2D uTexture;uniform float uScroll;uniform float uScale;uniform float uOrigin;uniform float uGlow;
void main(){vec2 uv=vec2(fract(vUV.x*uScale+uOrigin+uScroll),vUV.y);vec4 c=texture(uTexture,uv);float scan=.98+.02*sin(vUV.y*402.0);float rail=exp(-vUV.y*75.0)+exp(-(1.0-vUV.y)*75.0);float glow=exp(-vUV.y*14.0)+exp(-(1.0-vUV.y)*14.0);vec3 light=vec3(.13,.78,.94)*(rail*.42+glow*.08);vec3 rgb=c.rgb*scan+light*c.a;float alpha=c.a*.91;if(uGlow>.5)rgb=max(vec3(0.0),rgb-.43)*1.15;finalColor=vec4(rgb*.91,alpha)*vColor;}`;
type Bay={meshes:MeshPlane[];canvas:HTMLCanvasElement;texture:Texture;key:string;window:{center:number;span:number};shaders:Shader[];blur:BlurFilter};

/** Two precisely traced wall bays reading a single continuously repeating ribbon. */
export class StadiumDisplay {
 root=new Container();private bays:Bay[]=[];private state:ArenaBoardState={phase:'browse',packName:'Obsidian Flames',index:0};
 private captions=ribbonMessages(this.state);private lastTime=0;private offset=0;private reduced=true;private low=false;private revision='';
 constructor(private width:number,private height:number){
  for(let side=0;side<2;side++){
   const group=new Container(),canvas=document.createElement('canvas');canvas.width=2048;canvas.height=128;
   const texture=Texture.from(canvas);texture.source.style.addressModeU='repeat';
   const meshes=[0,1].map(()=>new MeshPlane({texture,verticesX:49,verticesY:7})),blur=new BlurFilter({strength:3.5,quality:2});
   const shaders=meshes.map((mesh,i)=>{
    mesh.geometry.batchMode='no-batch';if(i){mesh.filters=[blur];mesh.blendMode='add';group.addChildAt(mesh,0);}else group.addChild(mesh);
    const shader=new Shader({glProgram:GlProgram.from({vertex,fragment}),resources:{uTexture:texture.source,display:{uScroll:{value:0,type:'f32'},uScale:{value:1,type:'f32'},uOrigin:{value:0,type:'f32'},uGlow:{value:i,type:'f32'}}}});
    mesh.shader=Object.assign(shader,{texture});return shader;
   });
   this.root.addChild(group);this.bays.push({meshes,canvas,texture,key:'',window:{center:.5,span:1},shaders,blur});
  }
  this.root.eventMode='none';this.warp(0);this.tick(0,true,false);
 }
 setState(state:ArenaBoardState){
  const key=JSON.stringify(state);if(key===this.revision)return;this.revision=key;this.state=state;this.captions=ribbonMessages(state);
  // A completed pack must update immediately, while retaining its scroll phase.
  this.tick(this.lastTime,this.reduced,this.low);
 }
 setViewport(minU:number,maxU:number){for(const [i,bay] of this.bays.entries())bay.window=screenTextWindow(i as 0|1,minU,maxU);}
 private caption(x:CanvasRenderingContext2D,[title,detail]:RibbonCaption,center:number,available:number){
  x.textAlign='center';x.textBaseline='middle';x.font='900 47px Nunito';const measured=x.measureText(title).width;if(measured>available)x.font=`900 ${47*available/measured}px Nunito`;
  x.shadowColor='#75f8ff';x.shadowBlur=18;x.fillStyle='#65eeff';x.globalAlpha=.55;x.fillText(title,center-1.5,(detail?49:64)+1);x.globalAlpha=1;x.fillStyle='#edffff';x.fillText(title,center,detail?49:64);x.shadowBlur=0;
  if(detail){x.font='800 24px Nunito';const measuredDetail=x.measureText(detail).width;if(measuredDetail>available)x.font=`800 ${24*available/measuredDetail}px Nunito`;x.fillStyle='#82d4ee';x.fillText(detail,center,93);}
 }
 private paint(bay:Bay,captions:RibbonCaption[],span:number,reduced:boolean){
  const c=bay.canvas,x=c.getContext('2d')!,width=c.width;x.clearRect(0,0,width,128);
  const g=x.createLinearGradient(0,0,0,128);g.addColorStop(0,'#168ba7');g.addColorStop(.40,'#125f83');g.addColorStop(1,'#168ba7');x.fillStyle=g;x.fillRect(0,0,width,128);
  // The two edges of the tile have the same background and glyph-free padding.
  x.strokeStyle='rgba(126,247,255,.12)';x.lineWidth=1;for(let k=16;k<width;k+=32){x.beginPath();x.moveTo(k,0);x.lineTo(k,128);x.stroke();}for(let y=16;y<128;y+=16){x.beginPath();x.moveTo(0,y);x.lineTo(width,y);x.stroke();}
  x.shadowColor='#7bf4ff';x.shadowBlur=9;x.fillStyle='#99f5ff';x.fillRect(0,0,width,2);x.fillRect(0,126,width,2);x.shadowBlur=0;
  if(reduced){x.save();x.scale(width/1280,1);this.caption(x,captions[0],bay.window.center*1280,Math.min(1030,bay.window.span*1280-38));x.restore();return;}
  const cellWidth=width/captions.length,logicalWidth=1280*span;
  captions.forEach((caption,i)=>{
   // Canvas x scaling is undone by the UV scale, keeping letter proportions
   // consistent while fitting a whole entry into the visible mobile window.
   x.save();x.translate(i*cellWidth,0);x.scale(cellWidth/logicalWidth,1);
   x.strokeStyle='rgba(144,245,255,.62)';x.lineWidth=1.8;x.shadowColor='#70f5ff';x.shadowBlur=8;
   x.beginPath();x.arc(25,64,14,0,Math.PI*2);x.moveTo(11,64);x.lineTo(39,64);x.stroke();x.beginPath();x.arc(25,64,4,0,Math.PI*2);x.fillStyle='#126c98';x.fill();x.stroke();x.shadowBlur=0;
   this.caption(x,caption,logicalWidth/2+14,Math.min(1030,logicalWidth-90));x.restore();
  });
 }
 warp(shift:number){this.bays.forEach((bay,side)=>bay.meshes.forEach(mesh=>{const buffer=mesh.geometry.getBuffer('aPosition');for(let row=0;row<7;row++)for(let col=0;col<49;col++){const p=wallScreenPoint(side as 0|1,col/48,row/6),i=(row*49+col)*2;buffer.data[i]=p.u*this.width;buffer.data[i+1]=p.v*this.height+shift*groundWarp(p.v);}buffer.update();}));}
 tick(time:number,reduced:boolean,low:boolean){
  const dt=Math.min(.05,Math.max(0,time-this.lastTime));this.lastTime=time;this.reduced=reduced;this.low=low;
  const span=Math.max(.22,Math.min(...this.bays.map(bay=>bay.window.span))),count=this.captions.length;
  this.offset=advanceRibbonOffset(this.offset,dt,span,count,reduced);
  const staticLines=reduced?arenaMessages(this.state,0):null;
  for(const [i,bay] of this.bays.entries()){
   const captions:RibbonCaption[]=staticLines?[[staticLines[i*2],staticLines[i*2+1]]]:this.captions;
   const key=JSON.stringify([captions,reduced,reduced?bay.window:span]);
   if(key!==bay.key){bay.key=key;this.paint(bay,captions,span,reduced);bay.texture.source.update();}
   const mapping=reduced?{scale:1,origin:0}:ribbonMapping(i as 0|1,bay.window,span,count);
   bay.meshes[1].alpha=low?0:.42;
   for(const shader of bay.shaders){const u=shader.resources.display.uniforms;u.uScroll=reduced?0:this.offset;u.uScale=mapping.scale;u.uOrigin=mapping.origin;}
  }
 }
 destroy(){for(const bay of this.bays){for(const shader of bay.shaders)shader.destroy();bay.blur.destroy();bay.texture.destroy(true);}this.root.destroy({children:true});}
}
