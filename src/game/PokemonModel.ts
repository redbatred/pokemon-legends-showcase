import {Texture as PixiTexture} from 'pixi.js';
import {AnimationMixer,BackSide,Box3,Color,DataTexture,DirectionalLight,Group,HemisphereLight,LoopOnce,LoopRepeat,Matrix4,Mesh,MeshBasicMaterial,MeshToonMaterial,NearestFilter,NoToneMapping,OrthographicCamera,RGBAFormat,Scene,SRGBColorSpace,Vector3,WebGLRenderer,type AnimationAction,type Material,type MeshStandardMaterial,type Object3D,type Texture,type SkinnedMesh} from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/addons/loaders/DRACOLoader.js';
import type {PowerProfile} from './powerProfiles';
import {sampleAttack} from './attackClock';
import {moveRigs,type ProjectedEmitter} from './moveRig';

type Entry={path:string;idle?:string;attack?:string;powerAt?:number;attackTimeScale?:number;enter?:string;runtime?:{idle?:string;attack?:string}};
let manifest:Promise<Record<string,Entry>>|null=null,renderer:WebGLRenderer|null=null,decoder:DRACOLoader|null=null,generation=0,inflight=0,releaseDecoder=false;
function rendererFor(size:number){if(!renderer){renderer=new WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});renderer.setClearColor(0x000000,0);renderer.outputColorSpace=SRGBColorSpace;renderer.toneMapping=NoToneMapping;}if(renderer.domElement.width!==size||renderer.domElement.height!==size)renderer.setSize(size,size,false);return renderer;}
function disposeDecoder(){decoder?.dispose();decoder=null;releaseDecoder=false;}
function disposeObject(root:Object3D,extraTextures:Iterable<Texture>=[]){
 const geometries=new Set<import('three').BufferGeometry>(),materials=new Set<Material>(),textures=new Set<Texture>(extraTextures),skeletons=new Set<import('three').Skeleton>();
 root.traverse(o=>{if(!(o instanceof Mesh))return;geometries.add(o.geometry);if('isSkinnedMesh' in o)skeletons.add((o as SkinnedMesh).skeleton);for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);});
 for(const m of materials){for(const value of Object.values(m))if(value&&typeof value==='object'&&'isTexture' in value)textures.add(value as Texture);m.dispose();}
 for(const s of skeletons)s.dispose();for(const g of geometries)g.dispose();for(const t of textures){const image=t.source?.data;if(typeof ImageBitmap!=='undefined'&&image instanceof ImageBitmap)image.close();t.dispose();}
}
export function disposePokemonRenderer(){generation++;renderer?.dispose();renderer?.forceContextLoss();renderer=null;if(inflight)releaseDecoder=true;else disposeDecoder();}
export async function createPokemonModel(path:string,low:boolean){
 const epoch=generation;
 manifest??=fetch('/assets/pokemon-3d/manifest.json').then(r=>r.ok?r.json():{}).catch(()=>({}));
 const raw=await manifest,stem=path.split('/').pop()!.replace(/\.[^.]+$/,'');
 const entry=raw[stem];if(!entry?.path||epoch!==generation)return null;
 decoder??=new DRACOLoader().setDecoderPath('/assets/draco/').setWorkerLimit(1);
 inflight++;
 try{const gltf=await new GLTFLoader().setDRACOLoader(decoder).loadAsync(entry.path);
  if(epoch!==generation){disposeObject(gltf.scene);return null;}
  try{return new PokemonModel(gltf.scene,gltf.animations,entry,low,stem);}catch(error){disposeObject(gltf.scene);throw error;}
 }finally{inflight--;if(!inflight&&releaseDecoder)disposeDecoder();}
}
export class PokemonModel {
 readonly texture:PixiTexture;readonly groundY:number;private canvas=document.createElement('canvas');private context:CanvasRenderingContext2D;
 private scene=new Scene();private camera=new OrthographicCamera(-1,1,1,-1,.01,100);private mixer:AnimationMixer;
 private current:AnimationAction|null=null;private clips:Map<string,AnimationAction>;private elapsed=0;private size:number;private stopped=false;private charging=false;private attackClock=0;
 private poses=new Map<string,Matrix4>();private bones:Object3D[]=[];private bodySpan=1;private tip=new Vector3();private forward=new Vector3();private fallback=new Vector3();private head:Object3D|undefined;private torso:Object3D|undefined;private gradient:DataTexture;private originalMaterials=new Set<Material>();private toonMaterials=new Set<Material>();private textures=new Set<Texture>();
 constructor(private model:Group,animations:import('three').AnimationClip[],private entry:Entry,low:boolean,private stem:string){
  this.size=low?384:640;this.canvas.width=this.canvas.height=this.size;this.context=this.canvas.getContext('2d')!;this.texture=PixiTexture.from(this.canvas);
  this.gradient=new DataTexture(new Uint8Array([65,65,65,255,142,142,142,255,215,215,215,255,255,255,255,255]),4,1,RGBAFormat);this.gradient.minFilter=this.gradient.magFilter=NearestFilter;this.gradient.needsUpdate=true;
  const outlines:{mesh:Mesh;outline:Mesh}[]=[];
  this.model.traverse(obj=>{if(!(obj instanceof Mesh))return;const materials=Array.isArray(obj.material)?obj.material:[obj.material];const converted=materials.map(material=>{
   const old=material as MeshStandardMaterial;this.originalMaterials.add(old);for(const value of Object.values(old))if(value&&typeof value==='object'&&'isTexture' in value)this.textures.add(value as Texture);
   const mat=new MeshToonMaterial({map:old.map,color:old.color??new Color('white'),gradientMap:this.gradient,transparent:old.transparent,opacity:old.opacity,alphaTest:old.alphaTest,side:old.side,emissive:old.emissive??new Color(0x000000),emissiveMap:old.emissiveMap??null,emissiveIntensity:Math.min(old.emissiveIntensity??0,1.5)});this.toonMaterials.add(mat);return mat;});obj.material=Array.isArray(obj.material)?converted:converted[0];
   if(materials.some(m=>/body/i.test(m.name))){const outline=obj.clone(false),ink=new MeshBasicMaterial({color:0x25374a,side:BackSide});ink.onBeforeCompile=shader=>{shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n transformed += objectNormal * 0.006;');};outline.material=ink;outline.renderOrder=-1;this.toonMaterials.add(ink);outlines.push({mesh:obj,outline});}
  });for(const {mesh,outline} of outlines)mesh.parent!.add(outline);
  this.scene.add(model);this.scene.add(new HemisphereLight(0xeef7ff,0x66759c,1.15));const key=new DirectionalLight(0xffffff,1.65);key.position.set(-3,5,7);this.scene.add(key);const rim=new DirectionalLight(0x8fdcff,.7);rim.position.set(1,-1,3);this.scene.add(rim);
  this.mixer=new AnimationMixer(model);this.clips=new Map(animations.map(clip=>[clip.name,this.mixer.clipAction(clip)]));this.play('idle');this.mixer.update(0);model.updateMatrixWorld(true);
  const bounds=new Box3().setFromObject(model,true),idleBounds=bounds.clone(),right=new Vector3(1.75,0,-.70).normalize(),up=new Vector3(.70,.22,1.75).normalize().cross(right).normalize(),vertex=new Vector3();
  let left=Infinity,rightEdge=-Infinity,bottom=Infinity,top=-Infinity;
  const includePose=()=>{model.traverse(o=>{if(!(o instanceof Mesh)||o.renderOrder===-1)return;const positions=o.geometry.getAttribute('position');if(!positions)return;for(let i=0;i<positions.count;i++){o.getVertexPosition(i,vertex).applyMatrix4(o.matrixWorld);const x=vertex.dot(right),y=vertex.dot(up);left=Math.min(left,x);rightEdge=Math.max(rightEdge,x);bottom=Math.min(bottom,y);top=Math.max(top,y);}});};includePose();
  const rig=moveRigs[this.stem],attackAction=this.clips.get(this.entry.attack??this.entry.runtime?.attack??'');
  if(attackAction){
   const original=this.current;original?.stop();attackAction.reset().setLoop(LoopOnce,1).play();attackAction.clampWhenFinished=true;
   const start=rig?.seek??0,end=Math.min(attackAction.getClip().duration,(rig?.end??attackAction.getClip().duration*.36+1.26)+(rig?.speed??1.4)*.24);
   for(let i=0;i<=12;i++){attackAction.time=start+(end-start)*i/12;this.mixer.update(0);model.updateMatrixWorld(true);bounds.union(new Box3().setFromObject(model,true));includePose();}
   attackAction.stop();this.current=null;this.play('idle');this.mixer.update(0);model.updateMatrixWorld(true);
  }
  const center=bounds.getCenter(new Vector3()),size=bounds.getSize(new Vector3());
  center.addScaledVector(right,(left+rightEdge)/2-center.dot(right)).addScaledVector(up,(bottom+top)/2-center.dot(up));
  const span=Math.max(rightEdge-left,top-bottom,.1)*1.10;this.camera.left=this.camera.bottom=-span/2;this.camera.right=this.camera.top=span/2;
  this.camera.position.copy(center).add(new Vector3(span*.70,span*.22,span*1.75));this.camera.lookAt(center);this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld(true);
  const foot=idleBounds.getCenter(new Vector3());foot.y=idleBounds.min.y;foot.project(this.camera);this.groundY=-foot.y;
  const bones:Object3D[]=[];model.traverse(o=>{if('isBone' in o)bones.push(o);});const named=(keys:string[])=>keys.map(key=>bones.find(b=>b.name.toLowerCase().replace(/[_\s]*\d+$/,'')===key)).find(Boolean);
  this.bones=bones;this.bodySpan=size.y;this.head=named(['head','jaw','neck']);this.torso=named(['chest','waist','body','spine']);this.fallback.copy(center).add(new Vector3(0,size.y*.22,size.z*.1));this.render();
 }
 get chargeDuration(){const action=this.clips.get(this.entry.attack??this.entry.runtime?.attack??'');if(!action)return .65;const rig=moveRigs[this.stem],at=rig?.powerAt??this.entry.powerAt??action.getClip().duration*.36;return Math.max(.25,(at-(rig?.seek??0))/(rig?.speed??1.4));}
 get attackDuration(){const rig=moveRigs[this.stem];return rig?Math.max(.3,(rig.end-rig.powerAt)/rig.speed):.9;}
 play(cue:'emerge'|'idle'|'charge'|'attack'|'recover'){
  if(cue==='attack'&&this.charging)return;
  const requested=cue==='charge'||cue==='attack',mapped=this.entry.attack??this.entry.runtime?.attack;const attack=requested&&!!mapped&&this.clips.has(mapped);this.charging=attack;if(attack)this.attackClock=0;
  const names=[...(attack?[this.entry.attack,this.entry.runtime?.attack,'attack','Attack','Attack01','attack01']:[]),this.entry.idle,this.entry.runtime?.idle,'idle','Idle','wait','Wait'];
  let next:AnimationAction|undefined;for(const name of names)if(name&&this.clips.has(name)){next=this.clips.get(name);break;}next??=this.clips.values().next().value;if(!next)return;
  if(next===this.current&&!attack)return;const previous=this.current;next.reset().setEffectiveWeight(1).setLoop(attack?LoopOnce:LoopRepeat,attack?1:Infinity);next.clampWhenFinished=attack;next.timeScale=attack?(moveRigs[this.stem]?.speed??1.4):1;next.time=attack?(moveRigs[this.stem]?.seek??0):0;next.play();if(previous&&previous!==next)next.crossFadeFrom(previous,.18,false);this.current=next;
 }
 setAttackTime(seconds:number){if(!this.charging||!this.current)return;this.attackClock=sampleAttack(this.mixer,this.current,seconds,this.attackClock,moveRigs[this.stem]?.seek??0,moveRigs[this.stem]?.speed??1.4);}
 update(dt:number){if(this.stopped)return;if(!this.charging)this.mixer.update(dt);this.elapsed+=dt;if(this.elapsed<1/30)return;this.elapsed%=1/30;this.render();}
 capturePose(){this.render();}
 private render(){this.model.updateMatrixWorld(true);for(const bone of this.bones){let m=this.poses.get(bone.name.toLowerCase());if(!m){m=new Matrix4();this.poses.set(bone.name.toLowerCase(),m);}m.copy(bone.matrixWorld);}const r=rendererFor(this.size);r.render(this.scene,this.camera);this.context.clearRect(0,0,this.size,this.size);this.context.drawImage(r.domElement,0,0);this.texture.source.update();}
 emitters(profile:PowerProfile):ProjectedEmitter[]{
  const rig=moveRigs[this.stem];
  const project=()=>{const axis=this.forward.clone().sub(this.tip).normalize(),view=this.camera.getWorldDirection(new Vector3()),foreshortening=Math.sqrt(Math.max(0,1-axis.dot(view)**2));this.tip.project(this.camera);this.forward.project(this.camera);const dx=this.forward.x-this.tip.x,dy=this.tip.y-this.forward.y,length=Math.hypot(dx,dy)||1;return {x:this.tip.x,y:-this.tip.y,dx:dx/length,dy:dy/length,foreshortening};};
  if(rig){const result:ProjectedEmitter[]=[];for(const e of rig.emitters){const pose=this.poses.get(e.bone);if(!pose)continue;this.tip.fromArray(e.tip).applyMatrix4(pose);this.forward.fromArray(e.forward).applyMatrix4(pose);result.push(project());}if(result.length)return result;}
  const bone=profile.bone==='chest'?this.torso??this.head:this.head;const pose=bone?this.poses.get(bone.name.toLowerCase()):null;if(pose)this.tip.setFromMatrixPosition(pose);else this.tip.copy(this.fallback);
  // The source models face +Z. Use the animated nose direction whenever available.
  const nose=this.bones.find(b=>/^(center_)?nose(_\d+)?$/i.test(b.name));
  if(nose&&profile.bone!=='chest'){this.forward.setFromMatrixPosition(this.poses.get(nose.name.toLowerCase())!);this.forward.sub(this.tip).normalize();this.tip.addScaledVector(this.forward,this.bodySpan*.035);this.forward.multiplyScalar(this.bodySpan*.2).add(this.tip);}
  else this.forward.copy(this.tip).add(new Vector3(0,0,this.bodySpan*.25));
  return [project()];
 }
 dispose(){this.stopped=true;this.mixer.stopAllAction();this.mixer.uncacheRoot(this.model);disposeObject(this.model,this.textures);for(const m of this.originalMaterials)m.dispose();this.gradient.dispose();this.texture.destroy(true);this.scene.clear();}
}
