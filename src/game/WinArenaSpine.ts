import {Spine,RegionAttachment} from '@esotericsoftware/spine-pixi-v8';
import {BufferAttribute,BufferGeometry,DoubleSide,Group,Mesh,ShaderMaterial,TextureLoader,SRGBColorSpace,type Texture} from 'three';
import {loadArenaPressureRig} from './PressureRig';
import {arenaPressureMotion} from './arenaPressureMotion';
import type {CinemaTier} from './winChoreography';
let texture:Promise<Texture>|undefined;
export async function prepareArenaSpine(){texture??=new TextureLoader().loadAsync('/assets/arena-pressure-v54/pressure.svg').then(t=>{t.colorSpace=SRGBColorSpace;t.flipY=false;return t;});const [data,art]=await Promise.all([loadArenaPressureRig(),texture]);return {data,art};}
/** One finite skeletal shockwave, flush with the court. All slots share one draw call. */
export class WinArenaSpine {
 readonly root=new Group();private rig:Spine;private mesh:Mesh<BufferGeometry,ShaderMaterial>;private vertices=new Float32Array(8);private animation='burst';
 constructor(data:Awaited<ReturnType<typeof prepareArenaSpine>>,private tier:CinemaTier){
  this.rig=new Spine({skeletonData:data.data,autoUpdate:false});this.rig.state.setAnimation(0,'burst',false);
  const count=data.data.slots.length,geometry=new BufferGeometry(),indices=[];
  geometry.setAttribute('position',new BufferAttribute(new Float32Array(count*12),3));geometry.setAttribute('uv',new BufferAttribute(new Float32Array(count*8),2));geometry.setAttribute('opacity',new BufferAttribute(new Float32Array(count*4),1));
  for(let i=0;i<count;i++){const j=i*4;indices.push(j,j+1,j+2,j+2,j+3,j);}geometry.setIndex(indices);
  const material=new ShaderMaterial({transparent:true,depthWrite:false,side:DoubleSide,uniforms:{art:{value:data.art}},vertexShader:'attribute float opacity;varying vec2 tex;varying float alpha;void main(){tex=uv;alpha=opacity;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 tex;varying float alpha;uniform sampler2D art;void main(){vec4 c=texture2D(art,tex);gl_FragColor=vec4(c.rgb,c.a*alpha);}' });
  this.mesh=new Mesh(geometry,material);this.mesh.frustumCulled=false;this.mesh.position.y=.605;this.root.add(this.mesh);this.root.visible=false;
 }
 update(age:number,reduced:boolean){
  const p=arenaPressureMotion(age,this.tier,reduced);this.root.visible=p.visible;if(!p.visible)return;
  this.mesh.scale.setScalar(.013*p.strength);if(p.animation!==this.animation){this.animation=p.animation;this.rig.state.setAnimation(0,p.animation,false);}this.rig.state.getCurrent(0)!.trackTime=p.time;this.rig.update(0);
  const position=this.mesh.geometry.getAttribute('position'),uv=this.mesh.geometry.getAttribute('uv'),opacity=this.mesh.geometry.getAttribute('opacity');
  this.rig.skeleton.slots.forEach((slot,i)=>{const attachment=slot.getAttachment();if(!(attachment instanceof RegionAttachment))return;attachment.computeWorldVertices(slot,this.vertices,0,2);
   const dust=slot.data.name.startsWith('dust'),cy=(this.vertices[1]+this.vertices[3]+this.vertices[5]+this.vertices[7])/4;
   for(let j=0;j<4;j++){const k=i*4+j,x=this.vertices[j*2],y=this.vertices[j*2+1];position.setXYZ(k,x,dust?Math.max(0,(y-cy)*.35+18+p.lift):0,dust?-cy: -y);uv.setXY(k,attachment.uvs[j*2],attachment.uvs[j*2+1]);opacity.setX(k,slot.color.a*.82);}
  });position.needsUpdate=uv.needsUpdate=opacity.needsUpdate=true;
 }
 destroy(){this.rig.destroy();}
}
