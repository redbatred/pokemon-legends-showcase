import {Container,BlurFilter,Shader,GlProgram,MeshPlane,Texture} from 'pixi.js';
import {groundWarp} from './backdropMotion';
import {arenaMessages,wallScreenPoint,screenTextWindow,type ArenaBoardState} from './stadiumDisplayGeometry';
// Fine phosphor emission bends with the wall. No travelling horizontal light bands.
const vertex=`in vec2 aPosition;in vec2 aUV;out vec2 vUV;out vec4 vColor;uniform mat3 uProjectionMatrix;uniform mat3 uWorldTransformMatrix;uniform mat3 uTransformMatrix;uniform vec4 uWorldColorAlpha;uniform vec4 uColor;
void main(){vec3 p=uProjectionMatrix*uWorldTransformMatrix*uTransformMatrix*vec3(aPosition,1.0);gl_Position=vec4(p.xy,0.0,1.0);vUV=aUV;vColor=uWorldColorAlpha*uColor;}`;
const fragment=`in vec2 vUV;in vec4 vColor;out vec4 finalColor;uniform sampler2D uTexture;uniform float uTime;uniform float uMotion;uniform float uGlow;
void main(){vec2 uv=vUV;vec4 c=texture(uTexture,uv);float scan=.97+.03*sin(uv.y*402.0-uTime*1.2)*(.3+.7*uMotion);float rail=exp(-uv.y*75.0)+exp(-(1.0-uv.y)*75.0);float glow=exp(-uv.y*14.0)+exp(-(1.0-uv.y)*14.0);vec3 light=vec3(.13,.78,.94)*(rail*.42+glow*.08);vec3 rgb=c.rgb*scan+light*c.a;float alpha=c.a*.91;if(uGlow>.5)rgb=max(vec3(0.0),rgb-.43)*1.15;finalColor=vec4(rgb*.91,alpha)*vColor;}`;
type Bay={meshes:MeshPlane[];canvases:[HTMLCanvasElement,HTMLCanvasElement];textures:[Texture,Texture];current:0|1;key:string;mix:number;window:{center:number;span:number};shaders:Shader[];blurs:BlurFilter[]};
/** A pair of curved LED surfaces sharing the exact stadium warp, behind the foreground game. */
export class StadiumDisplay {
 root=new Container();private bays:Bay[]=[];private state:ArenaBoardState={phase:'browse',packName:'Obsidian Flames',index:0};private lastTime=0;private cycle=-1;private revision='';
 constructor(private width:number,private height:number){
  for(let side=0;side<2;side++){
   const group=new Container(),canvases=[this.canvas(),this.canvas()] as [HTMLCanvasElement,HTMLCanvasElement],textures=canvases.map(c=>Texture.from(c)) as [Texture,Texture],meshes=[...textures,...textures].map(texture=>new MeshPlane({texture,verticesX:49,verticesY:7}));const blurs:BlurFilter[]=[];
   for(const [i,m] of meshes.entries()){m.geometry.batchMode='no-batch';if(i>=2){const blur=new BlurFilter({strength:3.5,quality:2});m.filters=[blur];m.blendMode='add';blurs.push(blur);group.addChildAt(m,0);}else group.addChild(m);}
   const shaders=meshes.map((m,i)=>{const shader=new Shader({glProgram:GlProgram.from({vertex,fragment}),resources:{uTexture:textures[i%2].source,display:{uTime:{value:0,type:'f32'},uMotion:{value:1,type:'f32'},uGlow:{value:i>=2?1:0,type:'f32'}}}});m.shader=Object.assign(shader,{texture:textures[i%2]});return shader;});this.root.addChild(group);this.bays.push({meshes,canvases,textures,current:0,key:'',mix:1,window:{center:.5,span:1},shaders,blurs});
  }
  this.root.eventMode='none';this.warp(0);this.tick(0,true,false);
 }
 private canvas(){const c=document.createElement('canvas');c.width=1280;c.height=128;return c;}
 setState(state:ArenaBoardState){const key=JSON.stringify(state);if(key===this.revision)return;this.revision=key;this.state=state;this.cycle=-1;if(state.phase==='complete')this.tick(this.lastTime,true,false);}
 setViewport(minU:number,maxU:number){for(const [i,bay] of this.bays.entries()){bay.window=screenTextWindow(i as 0|1,minU,maxU);bay.key='';}this.cycle=-1;}
 private paint(c:HTMLCanvasElement,title:string,detail:string,window:{center:number;span:number}){
  const x=c.getContext('2d')!;x.clearRect(0,0,1280,128);const g=x.createLinearGradient(0,0,0,128);g.addColorStop(0,'#168ba7');g.addColorStop(.40,'#125f83');g.addColorStop(1,'#168ba7');x.fillStyle=g;x.fillRect(0,0,1280,128);
  x.strokeStyle='rgba(126,247,255,.12)';x.lineWidth=1;for(let k=0;k<1280;k+=32){x.beginPath();x.moveTo(k,0);x.lineTo(k,128);x.stroke();}for(let y=16;y<128;y+=16){x.beginPath();x.moveTo(0,y);x.lineTo(1280,y);x.stroke();}
  x.shadowColor='#7bf4ff';x.shadowBlur=9;x.fillStyle='#99f5ff';x.fillRect(0,0,1280,2);x.fillRect(0,126,1280,2);x.shadowBlur=0;
  x.strokeStyle='rgba(120,231,255,.28)';x.lineWidth=1.5;for(const side of [0,1]){x.save();x.translate(side?1280:0,0);x.scale(side?-1:1,1);x.beginPath();x.moveTo(0,19);x.lineTo(170,19);x.lineTo(185,34);x.lineTo(225,34);x.moveTo(0,110);x.lineTo(145,110);x.lineTo(160,95);x.lineTo(205,95);x.stroke();x.restore();}
  for(const cx of [62,1218]){x.save();x.translate(cx,64);x.strokeStyle='#90f5ff';x.shadowColor='#70f5ff';x.shadowBlur=8;x.lineWidth=1.8;x.beginPath();x.arc(0,0,26,0,Math.PI*2);x.moveTo(-26,0);x.lineTo(26,0);x.stroke();x.beginPath();x.arc(0,0,6,0,Math.PI*2);x.fillStyle='#126c98';x.fill();x.stroke();x.shadowBlur=0;x.strokeStyle='rgba(113,237,255,.25)';x.beginPath();x.arc(0,0,33,-1.2,1.2);x.stroke();x.restore();}
  x.save();x.translate(640,64);x.scale(1.8,1);x.strokeStyle='rgba(127,247,255,.12)';x.lineWidth=2;for(const r of [40,51,57]){x.beginPath();x.arc(0,0,r,0,Math.PI*2);x.stroke();}x.beginPath();x.moveTo(-51,0);x.lineTo(51,0);x.stroke();x.restore();
  x.textAlign='center';x.textBaseline='middle';x.font='900 47px Nunito';const measured=x.measureText(title).width,available=Math.min(1030,window.span*1280-38),center=window.center*1280;if(measured>available)x.font=`900 ${47*available/measured}px Nunito`;
  x.shadowColor='#75f8ff';x.shadowBlur=18;x.fillStyle='#65eeff';x.globalAlpha=.55;x.fillText(title,center-1.5,(detail?49:64)+1);x.globalAlpha=1;x.fillStyle='#edffff';x.fillText(title,center,detail?49:64);x.shadowBlur=0;
  if(detail){x.font='800 24px Nunito';const dw=x.measureText(detail).width;if(dw>available)x.font=`800 ${24*available/dw}px Nunito`;x.fillStyle='#82d4ee';x.fillText(detail,center,93);}
 }
 warp(shift:number){this.bays.forEach((bay,side)=>bay.meshes.forEach(mesh=>{const buffer=mesh.geometry.getBuffer('aPosition');for(let row=0;row<7;row++)for(let col=0;col<49;col++){const p=wallScreenPoint(side as 0|1,col/48,row/6),i=(row*49+col)*2;buffer.data[i]=p.u*this.width;buffer.data[i+1]=p.v*this.height+shift*groundWarp(p.v);}buffer.update();}));}
 tick(time:number,reduced:boolean,low:boolean){
  const dt=Math.min(.05,Math.max(0,time-this.lastTime));this.lastTime=time;const cycle=reduced?0:Math.floor(time/6);
  if(cycle!==this.cycle){this.cycle=cycle;const lines=arenaMessages(this.state,cycle);this.bays.forEach((bay,i)=>{const title=lines[i*2],detail=lines[i*2+1],key=title+'|'+detail;if(key===bay.key)return;bay.key=key;bay.current=bay.current===0?1:0;this.paint(bay.canvases[bay.current],title,detail,bay.window);bay.textures[bay.current].source.update();bay.mix=reduced?1:0;});}
  for(const bay of this.bays){bay.mix=Math.min(1,bay.mix+dt/.28);const t=reduced?1:bay.mix*bay.mix*(3-2*bay.mix);bay.meshes[bay.current].alpha=t;bay.meshes[1-bay.current].alpha=1-t;bay.meshes[bay.current+2].alpha=low?0:t*.42;bay.meshes[3-bay.current].alpha=low?0:(1-t)*.42;for(const shader of bay.shaders){shader.resources.display.uniforms.uTime=reduced?0:time;shader.resources.display.uniforms.uMotion=reduced||low?0:1;}}
 }
 destroy(){for(const bay of this.bays){for(const shader of bay.shaders)shader.destroy();for(const blur of bay.blurs)blur.destroy();for(const t of bay.textures)t.destroy(true);}this.root.destroy({children:true});}
}
