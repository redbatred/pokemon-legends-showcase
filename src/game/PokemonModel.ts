import {Texture as PixiTexture} from 'pixi.js';
import {AnimationMixer,Box3,DataTexture,DirectionalLight,Group,HemisphereLight,LoopOnce,LoopRepeat,Matrix4,Mesh,NearestFilter,NoToneMapping,OrthographicCamera,RGBAFormat,Scene,SRGBColorSpace,Vector3,WebGLRenderer,type AnimationAction,type Material,type MeshStandardMaterial,type Object3D,type Texture,type SkinnedMesh} from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/addons/loaders/DRACOLoader.js';
import type {PowerProfile} from './powerProfiles';
import {createModelOutline} from './modelOutline';
import {ensurePokemonNormals,pokemonToonMaterial,pokemonInkEligible} from './pokemonMaterials';
import {performanceTiming} from './performanceTiming';
import {performanceProfile} from './performanceProfiles';
import {sampleAttack} from './attackClock';
import {moveRigs,type ProjectedEmitter} from './moveRig';

type Entry={path:string;species?:string;optimization?:{sha256?:string};idle?:string;attack?:string;powerAt?:number;attackTimeScale?:number;enter?:string;enterStart?:number;enterEnd?:number;enterSpeed?:number;entranceDuration?:number;runtime?:{idle?:string;attack?:string}};
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
 manifest??=fetch('/assets/pokemon-3d/manifest.json',{cache:'no-cache'}).then(r=>r.ok?r.json():{}).catch(()=>({}));
 const raw=await manifest,stem=path.split('/').pop()!.replace(/\.[^.]+$/,'');
 const entry=raw[stem];if(!entry?.path||epoch!==generation)return null;
 decoder??=new DRACOLoader().setDecoderPath('/assets/draco/').setWorkerLimit(1);
 inflight++;
 try{const gltf=await new GLTFLoader().setDRACOLoader(decoder).loadAsync(entry.path+(entry.optimization?.sha256?'?v='+entry.optimization.sha256.slice(0,12):''));
  if(epoch!==generation){disposeObject(gltf.scene);return null;}
  try{return new PokemonModel(gltf.scene,gltf.animations,entry,low,stem);}catch(error){disposeObject(gltf.scene);throw error;}
 }finally{inflight--;if(!inflight&&releaseDecoder)disposeDecoder();}
}
export class PokemonModel {
 readonly texture:PixiTexture;readonly groundY:number;readonly horizontalAnchor:number;readonly bodyHeight:number;readonly frameWidth:number;private canvas=document.createElement('canvas');private context:CanvasRenderingContext2D;
 private scene=new Scene();private camera=new OrthographicCamera(-1,1,1,-1,.01,100);private mixer:AnimationMixer;private attackLight=new DirectionalLight(0x8fdcff,0);
 private current:AnimationAction|null=null;private clips:Map<string,AnimationAction>;private elapsed=0;private size:number;private stopped=false;private charging=false;private emerging=false;private entranceClock=0;private attackClock=0;private sourceClock=0;private low=false;private renderCost=0;
 private poses=new Map<string,Matrix4>();private bones:Object3D[]=[];private bodySpan=1;private tip=new Vector3();private forward=new Vector3();private fallback=new Vector3();private head:Object3D|undefined;private torso:Object3D|undefined;private gradient:DataTexture;private originalMaterials=new Set<Material>();private toonMaterials=new Set<Material>();private textures=new Set<Texture>();
 constructor(private model:Group,animations:import('three').AnimationClip[],private entry:Entry,low:boolean,private stem:string){
  this.low=low;this.size=low?448:1024;this.canvas.width=this.canvas.height=this.size;this.context=this.canvas.getContext('2d')!;this.texture=PixiTexture.from(this.canvas);
  this.gradient=new DataTexture(new Uint8Array([65,65,65,255,142,142,142,255,215,215,215,255,255,255,255,255]),4,1,RGBAFormat);this.gradient.minFilter=this.gradient.magFilter=NearestFilter;this.gradient.needsUpdate=true;
  const outlines:{mesh:Mesh;outline:Mesh}[]=[];
  this.model.traverse(obj=>{if(!(obj instanceof Mesh))return;ensurePokemonNormals(obj.geometry);const materials=Array.isArray(obj.material)?obj.material:[obj.material];const converted=materials.map(material=>{
   const old=material as MeshStandardMaterial;this.originalMaterials.add(old);for(const value of Object.values(old))if(value&&typeof value==='object'&&'isTexture' in value)this.textures.add(value as Texture);
   const mat=pokemonToonMaterial(old,this.gradient);this.toonMaterials.add(mat);return mat;});obj.material=Array.isArray(obj.material)?converted:converted[0];
   if(pokemonInkEligible(stem,obj.name,materials)){const outline=obj.clone(false),ink=createModelOutline(obj.geometry);outline.material=ink;outline.renderOrder=-1;this.toonMaterials.add(ink);outlines.push({mesh:obj,outline});}
  });for(const {mesh,outline} of outlines)mesh.parent!.add(outline);
  this.scene.add(model);this.scene.add(new HemisphereLight(0xeef7ff,0x66759c,.88));const key=new DirectionalLight(0xffffff,1.5);key.position.set(-3,5,7);this.scene.add(key);const rim=new DirectionalLight(0x8fdcff,.42);rim.position.set(1,-1,3);this.scene.add(rim);
  this.mixer=new AnimationMixer(model);this.clips=new Map(animations.map(clip=>[clip.name,this.mixer.clipAction(clip)]));this.play('idle');this.mixer.update(0);model.updateMatrixWorld(true);
  const performance=performanceProfile(entry.species??stem),yaw=performance.cameraYaw*Math.PI/180,elevation=performance.cameraElevation*Math.PI/180,view=new Vector3(Math.sin(yaw)*Math.cos(elevation),Math.sin(elevation),Math.cos(yaw)*Math.cos(elevation));
  const bounds=new Box3().setFromObject(model,true),right=new Vector3(view.z,0,-view.x).normalize(),up=view.clone().cross(right).normalize(),vertex=new Vector3();
  let left=Infinity,rightEdge=-Infinity,bottom=Infinity,top=-Infinity;
  const includePose=()=>{model.traverse(o=>{if(!(o instanceof Mesh)||o.renderOrder===-1)return;const positions=o.geometry.getAttribute('position');if(!positions)return;for(let i=0;i<positions.count;i++){o.getVertexPosition(i,vertex).applyMatrix4(o.matrixWorld);const x=vertex.dot(right),y=vertex.dot(up);left=Math.min(left,x);rightEdge=Math.max(rightEdge,x);bottom=Math.min(bottom,y);top=Math.max(top,y);}});};includePose();const idleHeight=top-bottom,idleBottom=bottom;
  const rig=moveRigs[this.stem],attackAction=this.clips.get(this.entry.attack??this.entry.runtime?.attack??'');
  if(attackAction){
   const original=this.current;original?.stop();attackAction.reset().setLoop(LoopOnce,1).play();attackAction.clampWhenFinished=true;
   const start=rig?.seek??0,end=Math.min(attackAction.getClip().duration,rig?.recoveryEnd??attackAction.getClip().duration);
   const samples=(entry.species??this.stem)==='mewtwo'?48:12;
   for(let i=0;i<=samples;i++){attackAction.time=start+(end-start)*i/samples;this.mixer.update(0);model.updateMatrixWorld(true);bounds.union(new Box3().setFromObject(model,true));includePose();}
   attackAction.stop();this.current=null;this.play('idle');this.mixer.update(0);model.updateMatrixWorld(true);
  }
  const entranceAction=this.entry.enter?this.clips.get(this.entry.enter):null;
  if(entranceAction){this.current?.stop();entranceAction.reset().setLoop(LoopOnce,1).play();const start=this.entry.enterStart??0,end=this.entry.enterEnd??entranceAction.getClip().duration;for(let i=0;i<=8;i++){entranceAction.time=start+(end-start)*i/8;this.mixer.update(0);model.updateMatrixWorld(true);includePose();}entranceAction.stop();this.current=null;this.play('idle');this.mixer.update(0);model.updateMatrixWorld(true);}
  const center=bounds.getCenter(new Vector3()),size=bounds.getSize(new Vector3());
  center.addScaledVector(right,(left+rightEdge)/2-center.dot(right)).addScaledVector(up,(bottom+top)/2-center.dot(up));
  const span=Math.max(rightEdge-left,top-bottom,.1)*1.10;this.bodyHeight=idleHeight/span;this.frameWidth=(rightEdge-left)/span;this.camera.left=this.camera.bottom=-span/2;this.camera.right=this.camera.top=span/2;
  this.camera.position.copy(center).addScaledVector(view,span*2);this.camera.lookAt(center);this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld(true);
  // A real oblique light catches the moving silhouette during the charge and attack.
  // It lights model normals instead of tinting the entire character sprite.
  this.attackLight.position.copy(center).addScaledVector(right,-span*1.6).addScaledVector(view,-span*.55).addScaledVector(up,span*.8);this.attackLight.target.position.copy(center);this.scene.add(this.attackLight,this.attackLight.target);
  // Center the body, not its asymmetric attack envelope. Wings and tails still retain safe frame padding.
  const anchors:Object3D[]=[];model.traverse(o=>{if('isBone' in o)anchors.push(o);});
  const bodyAnchor=['waist','chest','body','spine','root'].map(name=>anchors.find(b=>b.name.toLowerCase().replace(/[_\s]*\d+$/,'')===name)).find(Boolean);
  this.horizontalAnchor=(bodyAnchor?bodyAnchor.getWorldPosition(new Vector3()):model.getWorldPosition(new Vector3())).project(this.camera).x;
  this.groundY=-2*(idleBottom-center.dot(up))/span;

  const bones:Object3D[]=[];model.traverse(o=>{if('isBone' in o)bones.push(o);});const named=(keys:string[])=>keys.map(key=>bones.find(b=>b.name.toLowerCase().replace(/[_\s]*\d+$/,'')===key)).find(Boolean);
  this.bones=bones;this.bodySpan=size.y;this.head=named(['head','jaw','neck']);this.torso=named(['chest','waist','body','spine']);this.fallback.copy(center).add(new Vector3(0,size.y*.22,size.z*.1));this.render();
 }
 private get timing(){const clip=this.clips.get(this.entry.attack??this.entry.runtime?.attack??'');return performanceTiming(this.entry.species??this.stem,clip?.getClip().duration??2,moveRigs[this.stem]);}
 get entranceDuration(){const clip=this.entry.enter?this.clips.get(this.entry.enter):null;return clip?Math.min(1.4,Math.max(.4,((this.entry.enterEnd??clip.getClip().duration)-(this.entry.enterStart??0))/(this.entry.enterSpeed??1))):.68;}
 get chargeDuration(){return this.timing.charge;}
 get attackDuration(){return this.timing.attack;}
 get recoveryDuration(){return this.timing.recovery;}
 play(cue:'emerge'|'idle'|'charge'|'attack'|'recover'){
  if(cue==='attack'&&this.charging)return;
  this.emerging=cue==='emerge'&&!!this.entry.enter&&this.clips.has(this.entry.enter);if(this.emerging){this.entranceClock=0;this.sourceClock=this.entry.enterStart??0;}
  const requested=cue==='charge'||cue==='attack',mapped=this.entry.attack??this.entry.runtime?.attack;const attack=requested&&!!mapped&&this.clips.has(mapped);this.charging=attack;if(attack){this.attackClock=0;this.sourceClock=moveRigs[this.stem]?.seek??0;}
  const names=[...(this.emerging?[this.entry.enter]:[]),...(attack?[this.entry.attack,this.entry.runtime?.attack,'attack','Attack','Attack01','attack01']:[]),this.entry.idle,this.entry.runtime?.idle,'idle','Idle','wait','Wait'];
  let next:AnimationAction|undefined;for(const name of names)if(name&&this.clips.has(name)){next=this.clips.get(name);break;}next??=this.clips.values().next().value;if(!next)return;
  if(next===this.current&&!attack)return;const previous=this.current;next.reset().setEffectiveWeight(1).setLoop(attack||this.emerging?LoopOnce:LoopRepeat,attack||this.emerging?1:Infinity);next.clampWhenFinished=attack||this.emerging;next.timeScale=attack?(moveRigs[this.stem]?.speed??1.4):this.emerging?(this.entry.enterSpeed??1):1;next.time=attack?(moveRigs[this.stem]?.seek??0):this.emerging?(this.entry.enterStart??0):0;next.play();if(previous&&previous!==next)next.crossFadeFrom(previous,cue==='recover'?.32:.18,false);this.current=next;
 }
 setEntranceTime(seconds:number){if(!this.emerging||!this.current)return;const start=this.entry.enterStart??0,end=this.entry.enterEnd??this.current.getClip().duration,source=start+(end-start)*Math.min(1,Math.max(0,seconds/this.entranceDuration)),dt=Math.max(0,seconds-this.entranceClock);this.current.timeScale=1;sampleAttack(this.mixer,this.current,source,this.sourceClock,0,1,dt);this.entranceClock=seconds;this.sourceClock=source;}
 setAttackTime(seconds:number){if(!this.charging||!this.current)return;const source=this.timing.sourceAt(seconds),dt=Math.max(0,seconds-this.attackClock);this.current.timeScale=1;sampleAttack(this.mixer,this.current,source,this.sourceClock,0,1,dt);this.attackClock=seconds;this.sourceClock=source;}
 update(dt:number){if(this.stopped)return;if(!this.charging&&!this.emerging)this.mixer.update(dt);this.elapsed+=dt;const hz=this.low?24:(this.charging||this.emerging)&&this.renderCost<7?60:30;if(this.elapsed<1/hz)return;this.elapsed%=1/hz;const start=performance.now();this.render();this.renderCost=this.renderCost*.85+(performance.now()-start)*.15;}
 capturePose(){this.render();}
 setEnergy(color:number,amount:number){this.attackLight.color.setHex(color);this.attackLight.intensity=Math.max(0,Math.min(1,amount))*1.65;}
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
