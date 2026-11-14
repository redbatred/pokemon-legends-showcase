import {WinElementalVolume} from './WinElementalVolume';
import {WinHeroLight} from './WinHeroLight';
import {heroLight,juiceBeats,scoreHeat,TIER_PALETTE} from './winJuiceMotion';
import {WinCoins} from './WinCoins';
import {winAttackCloseup} from './championshipBeat';
import {ChampionshipSet} from './ChampionshipSet';
import {winFinalePresentation} from './winFinalePresentation';
import {prepareOnFrame} from './preparationFrames';
import {winRenderers} from './WinRendererPool';
import {RevealPreparation} from './revealPreparation';
import {stadiumResponse} from './stadiumResponse';
import {groundWave} from './arenaImpact';
import {WinArenaSpine,prepareArenaSpine} from './WinArenaSpine';
import {winCameraBeat,winReturnPose} from './winContinuity';
import {pokemonPower} from './powerProfiles';
import {winModelKey} from './winPresentationIdentity';
import {attachTeraCrown,teraMaterial,type TeraAttachment} from './teraAppearance';
import {performanceProfile} from './performanceProfiles';
import {CanvasSource,type Texture as PixiTexture} from 'pixi.js';
import {winSceneTexture} from './winSceneTexture';
import {Raycaster,AnimationMixer,Box3,Color,DataTexture,DirectionalLight,DoubleSide,FogExp2,Group,HemisphereLight,LoopOnce,LoopRepeat,Mesh,NearestFilter,Object3D,PerspectiveCamera,PlaneGeometry,PointLight,Quaternion,RGBAFormat,Scene,ShaderMaterial,SRGBColorSpace,Vector2,Vector3,WebGLRenderer,type AnimationAction,type AnimationClip,type Material} from 'three';
import {GLTFLoader,type GLTF} from 'three/addons/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/addons/loaders/DRACOLoader.js';
import {clone} from 'three/addons/utils/SkeletonUtils.js';
import {pokemonToonMaterial,ensurePokemonNormals,pokemonInkEligible} from './pokemonMaterials';
import {createModelOutline} from './modelOutline';
import {smooth,winCinemaGeometry,winCinemaPose,WIN_CINEMA_IMPACT,WIN_CINEMA_FINISH} from './winCinemaMotion';
import {winChoreography,winTierProfile,type CinemaTier} from './winChoreography';
import {prepareSceneReveal} from './sceneReveal';
import {moveRigs} from './moveRig';
import {prepareWinArena,WinCinemaArena} from './WinCinemaArena';
import {attackTransition,finalWinImpact} from './winCinemaImpact';
const models=new Map<string,Promise<GLTF>>();
type CinemaEntry={path:string;species?:string;idle?:string;attack?:string;runtime?:{idle?:string;attack?:string};tera?:{path:string;attachment:TeraAttachment}};
let manifest:Promise<Record<string,CinemaEntry>>|undefined;
let decoder:DRACOLoader|undefined;
export async function prepareWinActor(name:string){
 const species=winModelKey(name);
 manifest??=fetch('/assets/pokemon-3d/manifest.json').then(r=>r.json());const data=await manifest,entry=data[species];
 if(!entry)return null;
 let pending=models.get(species);if(!pending){decoder??=new DRACOLoader().setDecoderPath('/assets/draco/').setWorkerLimit(1);const loader=new GLTFLoader().setDRACOLoader(decoder);pending=loader.loadAsync(entry.path).then(async gltf=>{if(entry.tera){const crown=await loader.loadAsync(entry.tera.path);attachTeraCrown(gltf.scene,crown.scene,entry.tera.attachment);}return gltf;});models.set(species,pending);pending.catch(()=>models.delete(species));}
 return {gltf:await pending,entry,species,arena:await prepareWinArena(),atmosphere:await prepareArenaSpine()};
}
const preparedStages=new Map<string,RevealPreparation<Awaited<ReturnType<typeof prepareWinActor>>,WinCinemaStage>>();
const stageKey=(name:string,tier:CinemaTier,low:boolean)=>winModelKey(name)+':'+tier+':'+low;
/** Own only the upcoming scene. Adoption removes it; cancellation releases late GPU resources. */
export function prewarmWinStage(name:string,tier:CinemaTier,low:boolean,w=720,h=960){
 const key=stageKey(name,tier,low);let prepared=preparedStages.get(key);
 if(!prepared){prepared=new RevealPreparation(prepareWinActor(name),async source=>{
  if(!source)return null;await new Promise<void>(r=>requestAnimationFrame(()=>setTimeout(r,0)));
  const stage=new WinCinemaStage(source,winTierProfile(tier).rank>=2,low,tier);
  try{await stage.prepare(w,h);return stage;}catch(error){stage.destroy();throw error;}
 });preparedStages.set(key,prepared);}
 return prepared;
}
export function takeWinStage(name:string,tier:CinemaTier,low:boolean){const prepared=prewarmWinStage(name,tier,low);preparedStages.delete(stageKey(name,tier,low));return prepared.takeSpecial();}
export function clearPreparedWinStages(){for(const stage of preparedStages.values())stage.cancel();preparedStages.clear();}
/** Preview audits release their model cache after disposing the last instance. */
export function forgetWinActor(input:string){const key=winModelKey(input),pending=models.get(key);models.delete(key);void pending?.then(g=>{const textures=new Set<import('three').Texture>();g.scene.traverse(o=>{if(!(o instanceof Mesh))return;for(const m of Array.isArray(o.material)?o.material:[o.material]){for(const value of Object.values(m))if(value&&typeof value==='object'&&'isTexture' in value)textures.add(value as import('three').Texture);}});textures.forEach(t=>t.dispose());});}
/** A real perspective scene. Every actor uses its native skinned animation clips;
 * camera motion, lighting, architecture and particles occupy the same 3D space. */
export class WinCinemaStage {
 readonly texture:PixiTexture;readonly hasVolumeAttack:boolean;
 private canvas:HTMLCanvasElement;
 private renderer:WebGLRenderer;private rendererLease:ReturnType<typeof winRenderers.take>;private scene=new Scene();private camera=new PerspectiveCamera(39,1,.08,90);
 private model:Group;private actorGroup=new Group();private mixer:AnimationMixer;private actions:AnimationAction[];private active:AnimationAction|null=null;
 private owned=new Set<Material>();private gradient:DataTexture;private floor:Mesh;private sceneryMaterials=new Set<Material>();private scenery=new Group();private championship:ChampionshipSet;private elementalVolume:WinElementalVolume;private heroLight:WinHeroLight;private heroPoint=new Vector3();private coins:WinCoins;private hit=new Vector3();private toward=new Vector3();private ray=new Vector3();private shock={x:0,z:0,start:-9,strength:0};private arena:WinCinemaArena;private atmosphere:WinArenaSpine;private species:string;private baseSpecies:string;private bones=new Map<string,Object3D>();
 private eyes:Object3D[][]=[];private headBone:Object3D|undefined;private eyeWorld=[new Vector3(),new Vector3()];private eyeCentre=new Vector3();private eyeSpan=0;private lens=new Vector3();private eyeScratch=new Vector3();private eyeRay=new Raycaster();private eyeMeshes:Mesh[]=[];private eyeOffsets:Vector3[]|null|false=null;private eyePivots=[new Vector3(),new Vector3()];private eyeFacing=new Vector3();private faceDepth=-1;private bodyMeshes:Mesh[]=[];private lensDir=new Vector3();private visibleEyes=[true,true];private eyeCheck=-1;
 /** Screen positions of the eyes during the finisher's eye shot; empty otherwise. */
 readonly eyePoints:{x:number;y:number}[]=[];
 private key=new DirectionalLight(0xfff2cf,1.7);private rim=new DirectionalLight(0x67ddff,1.4);private pulse=new PointLight(0xffd778,0,18,1.1);
 private pulseBaseColor=new Color();private fireEmitter=false;private body:Object3D|undefined;private bodyY=0;private bodyZ=0;private bodyX=0;private actorBaseY=0;private followY=0;private bodyPoint=new Vector3();private last=0;private dead=false;
 private idle:AnimationAction|undefined;private attack:AnimationAction|undefined;private happy:AnimationAction|undefined;
 constructor(source:NonNullable<Awaited<ReturnType<typeof prepareWinActor>>>,mega:boolean,private low=false,private tier:CinemaTier=mega?'mega':'big'){
  const elemental=pokemonPower('/assets/pokemon/'+source.species+'.png');this.pulse.color.set(elemental.light);this.pulseBaseColor.set(elemental.light);this.fireEmitter=elemental.kind==='fire';this.rim.color.set(elemental.color);
  this.hasVolumeAttack=['fire','water','ice'].includes(elemental.kind)&&!!moveRigs[source.species]?.emitters.length;this.species=source.species;this.baseSpecies=source.entry.species??source.species;
  this.rendererLease=winRenderers.take(low);this.renderer=this.rendererLease.renderer;this.canvas=this.renderer.domElement;this.texture=winSceneTexture(new CanvasSource({resource:this.canvas}));this.renderer.outputColorSpace=SRGBColorSpace;this.renderer.setClearColor(0x071a33,0);
  this.scene.fog=new FogExp2(0x071a33,.028);this.scene.add(new HemisphereLight(0x9ebdea,0x102044,.85));this.key.position.set(-4,6,6);this.rim.position.set(3,4,-3);this.pulse.position.set(0,1,3);this.scene.add(this.key,this.rim,this.pulse);
  this.gradient=new DataTexture(new Uint8Array([72,72,72,255,155,155,155,255,225,225,225,255,255,255,255,255]),4,1,RGBAFormat);this.gradient.minFilter=this.gradient.magFilter=NearestFilter;this.gradient.needsUpdate=true;
  this.model=clone(source.gltf.scene) as Group;const outlines:{mesh:Mesh;outline:Mesh}[]=[];
  this.model.traverse(o=>{if(!(o instanceof Mesh))return;ensurePokemonNormals(o.geometry);const old=Array.isArray(o.material)?o.material:[o.material];const mats=old.map(m=>{const mat=source.entry.tera?teraMaterial(m,this.gradient,!!o.userData.teraCrown,this.baseSpecies):pokemonToonMaterial(m,this.gradient);this.owned.add(mat);return mat;});o.material=Array.isArray(o.material)?mats:mats[0];if(!o.userData.teraCrown&&pokemonInkEligible(this.baseSpecies,o.name,old)){const outline=o.clone(false);outline.material=createModelOutline(o.geometry);this.owned.add(outline.material);outline.renderOrder=-1;outlines.push({mesh:o,outline});}});for(const p of outlines)p.mesh.parent!.add(p.outline);
  this.mixer=new AnimationMixer(this.model);this.actions=source.gltf.animations.map((clip:AnimationClip)=>this.mixer.clipAction(clip));const find=(name:string|undefined,pattern:RegExp)=>this.actions.find(a=>a.getClip().name===name)??this.actions.find(a=>pattern.test(a.getClip().name));this.idle=find(source.entry.idle??source.entry.runtime?.idle,/idle|wait/i)??this.actions[0];this.attack=find((moveRigs[source.species] as {attackClip?:string}|undefined)?.attackClip??source.entry.attack??source.entry.runtime?.attack,/attack/i)??this.idle;this.happy=find(undefined,/happy|roar/i)??this.idle;
  this.play(this.idle);this.mixer.update(0);this.model.updateMatrixWorld(true);this.model.traverse(o=>{if('isSkinnedMesh' in o)(o as import('three').SkinnedMesh).skeleton.update();});
  const box=new Box3().setFromObject(this.model,true),size=box.getSize(new Vector3()),center=box.getCenter(new Vector3()),scale=Math.min(4.1/size.x,3.1/size.y,3.8/size.z);this.actorGroup.scale.setScalar(scale);this.actorGroup.position.set(-center.x*scale,-box.min.y*scale+.6,-center.z*scale);this.actorGroup.add(this.model);this.scene.add(this.actorGroup);
  this.actorBaseY=this.actorGroup.position.y;this.actorGroup.updateMatrixWorld(true);this.model.traverse(o=>{if('isBone' in o)this.bones.set(o.name.toLowerCase(),o);if(!this.body&&'isBone' in o&&/waist|chest|body|spine/i.test(o.name))this.body=o;});this.headBone=this.bones.get('head')??[...this.bones.entries()].find(([name])=>/(^|[\s_])head(_\d+)?$/.test(name))?.[1];
  const group=(pattern:RegExp)=>[...this.bones.entries()].filter(([name])=>pattern.test(name)).map(([,bone])=>bone);
  const left=group(/left.*eyelid/),right=group(/right.*eyelid/),locators=group(/^effeye0[12]$/);
  this.eyes=left.length&&right.length?[left,right]:locators.length>=2?[[locators[0]],[locators[1]]]:[];
  this.model.traverse(o=>{if(o instanceof Mesh&&o.renderOrder>=0)this.bodyMeshes.push(o);});
  // The visible eyes: eyelid bones pivot deep in the skull, so the eye meshes give the real positions on the face.
  this.model.traverse(o=>{if(o instanceof Mesh&&o.renderOrder>=0&&/eye/i.test(o.name+' '+(o.parent?.name??''))&&!/lod[12]|brow|lash|lid/i.test(o.name+' '+(o.parent?.name??'')))this.eyeMeshes.push(o);});
  this.bodyY=this.body?.getWorldPosition(this.bodyPoint).y??0;this.bodyZ=this.bodyPoint.z;this.bodyX=this.bodyPoint.x;
  const floorMat=new ShaderMaterial({side:DoubleSide,uniforms:{waveRadius:{value:0},waveAlpha:{value:0},hitCentre:{value:new Vector2()},hitRadius:{value:0},hitAlpha:{value:0},heat:{value:0},tone:{value:new Color(elemental.light)},charge:{value:0},impactLight:{value:0},paint:{value:source.arena.base}},vertexShader:'varying vec3 p; void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 p;uniform vec2 hitCentre;uniform float hitRadius;uniform float hitAlpha;uniform float heat;uniform float waveRadius;uniform float waveAlpha;uniform float charge;uniform float impactLight;uniform vec3 tone;uniform sampler2D paint;void main(){float r=length(p.xy);float ring=1.-smoothstep(.025,.055,abs(r-2.8));float line=(1.-smoothstep(.025,.045,abs(p.y)))*step(.52,abs(p.x));float circle=1.-smoothstep(.02,.04,abs(r-.52));float wave=exp(-pow((r-waveRadius)/.20,2.))*waveAlpha;float court=1.-smoothstep(3.0,7.0,r);float tiles=step(.985,fract(p.x*.5))+step(.985,fract(p.y*.5));vec3 base=mix(vec3(.006,.015,.035),vec3(.025,.065,.105),court)+vec3(.025,.045,.05)*tiles;if(r<.49)base=p.y>0.?vec3(.56,.10,.15):vec3(.61,.72,.77);if(r<.14)base=vec3(.80,.87,.92);float bounce=exp(-r*.20)*impactLight;float hd=length(p.xy-hitCentre);float shock=(exp(-pow((hd-hitRadius)/.16,2.))+.35*exp(-pow((hd-hitRadius*.72)/.3,2.)))*hitAlpha;float pool=exp(-hd*hd*.38)*heat;gl_FragColor=vec4(base*(1.-charge*.22)+tone*(ring*(.55+bounce*.22)+line*(.45+bounce*.18)+circle*.6+wave*.65+shock*1.2+pool*.5)+tone*bounce*.10,1.);}'});
  this.floor=new Mesh(new PlaneGeometry(65,65),floorMat);this.floor.rotation.x=-Math.PI/2;this.floor.position.y=.575;this.scenery.add(this.floor);
  this.arena=new WinCinemaArena(source.arena,mega,elemental.color);this.scenery.add(this.arena.root);this.championship=new ChampionshipSet(elemental.color);this.scenery.add(this.championship.root);this.scene.add(this.scenery);
  this.sceneryMaterials=prepareSceneReveal(this.scenery);this.atmosphere=new WinArenaSpine(source.atmosphere,this.tier);this.scene.add(this.atmosphere.root);this.elementalVolume=new WinElementalVolume(this.tier,elemental.kind,elemental.color,low);this.scene.add(this.elementalVolume.root);
  this.heroLight=new WinHeroLight(elemental.color,TIER_PALETTE[this.tier].glow);this.scene.add(this.heroLight.root);
  this.coins=new WinCoins(this.floor.position.y,low?120:240);this.scene.add(this.coins.root);

 }
 async prepare(w=720,h=960){
  // Allocate the multisampled canvas before uploading scene buffers.
  await prepareOnFrame(()=>{this.resize(w,h);this.renderer.render(new Scene(),this.camera);});
  if(this.hasVolumeAttack)this.elementalVolume.prepare();
  this.atmosphere.update(WIN_CINEMA_IMPACT+.18,false);
  this.arena.update(8,stadiumResponse(8,this.tier),false,this.tier);
  await this.renderer.compileAsync(this.scene,this.camera);
  // Compilation does not upload texture data or initialize the first render target.
  // Spread those first-use costs across preparation frames, before the action clock starts.
  const textures=new Set<import('three').Texture>();
  this.scene.traverse(o=>{if(!(o instanceof Mesh))return;for(const m of Array.isArray(o.material)?o.material:[o.material]){
   for(const value of Object.values(m))if(value&&typeof value==='object'&&'isTexture' in value)textures.add(value as import('three').Texture);
   if(m instanceof ShaderMaterial)for(const u of Object.values(m.uniforms))if(u.value?.isTexture)textures.add(u.value);
  }});
  for(const texture of textures){await prepareOnFrame(()=>this.renderer.initTexture(texture));}
  await prepareOnFrame(()=>this.render(6.18,w,h));
  await prepareOnFrame(()=>this.render(8,w,h));
  await prepareOnFrame(()=>this.render(WIN_CINEMA_IMPACT+.18,w,h));this.last=0;this.followY=0;
 }
 private play(action:AnimationAction|undefined,once=false){if(!action||action===this.active)return;action.reset().setEffectiveWeight(1).setLoop(once?LoopOnce:LoopRepeat,once?1:Infinity);action.clampWhenFinished=once;action.play();if(this.active)action.crossFadeFrom(this.active,.32,false);this.active=action;}
 /** `age` drives the performance (slowed and held on the finisher); `real` drives the lens. */
 render(age:number,w:number,h:number,reduced=false,exitAge=0,real=age){
  if(this.dead)return;const previous=this.last,dt=Math.min(.06,Math.max(0,age-this.last));this.last=age;
  const choreo=winChoreography(age,this.tier),profile=winTierProfile(this.tier),finale=finalWinImpact(age,reduced),transition=attackTransition(age,reduced);
  // Sample the native action continuously through windup, emission and recovery.
  // Blend its actual joints with an advancing idle; never reset the whole mixer.
  const weight=reduced?0:choreo.attackWeight,after=age>7.18?smooth((age-7.18)/.4):0;
  for(const action of this.actions){action.stopFading();action.enabled=true;action.paused=true;action.setEffectiveWeight(0);action.play();}
  if(this.idle){this.idle.time=age%this.idle.getClip().duration;this.idle.setEffectiveWeight(1-weight);}
  if(this.attack){const rig=moveRigs[this.species],p=choreo.clipPhase,start=rig?.seek??0,power=rig?.powerAt??this.attack.getClip().duration*.3,end=rig?.end??this.attack.getClip().duration*.55,recover=rig?.recoveryEnd??this.attack.getClip().duration;
   this.attack.time=p<.36?start+(power-start)*p/.36:p<.65?power+(end-power)*(p-.36)/.29:end+(recover-end)*(p-.65)/.35;this.attack.time=Math.min(this.attack.getClip().duration-.00001,Math.max(0,this.attack.time));this.attack.setEffectiveWeight(weight);
  }
  if(after&&this.happy&&this.happy!==this.attack&&this.happy!==this.idle){this.idle?.setEffectiveWeight(1-after*.75);this.happy.time=(age-7.18)%this.happy.getClip().duration;this.happy.setEffectiveWeight(after*.75);}
  this.mixer.update(0);
  this.scenery.visible=transition.arena>0;for(const material of this.sceneryMaterials){if(material instanceof ShaderMaterial)material.uniforms.sceneReveal.value=transition.arena;else material.opacity=transition.arena;}const response=stadiumResponse(age,this.tier,reduced);this.arena.update(age,response,reduced,this.tier,exitAge);this.championship.update(age,this.tier,exitAge,reduced);this.atmosphere.update(age,reduced);
  const wingRestores:(()=>void)[]=[];
  if(!reduced&&this.species==='pidgeot'&&choreo.beat){const beat=choreo.beat,local=age-beat.start,stroke=(smooth(local/.22)*(1-smooth((age-beat.release)/.30))*.88-choreo.recoil*.25)*choreo.attackWeight;this.actorGroup.updateMatrixWorld(true);for(const name of ['lfeeler1','rfeeler1','lfeeler2','rfeeler2']){const bone=this.bones.get(name);if(!bone?.parent)continue;const saved=bone.quaternion.clone(),position=bone.getWorldPosition(new Vector3()),axis=new Vector3(0,0,1).applyQuaternion(bone.parent.getWorldQuaternion(new Quaternion()).invert());bone.quaternion.premultiply(new Quaternion().setFromAxisAngle(axis,Math.sign(position.x||1)*stroke*(name.endsWith('2')?.45:1)));wingRestores.push(()=>bone.quaternion.copy(saved));}}
  const shot=winCameraBeat(age,this.tier,reduced),finisherCharge=shot.focus,victory=winFinalePresentation(age,this.tier,exitAge,reduced);
  this.actorGroup.position.y=this.actorBaseY;
  this.actorGroup.rotation.y=reduced?0:Math.sin(age*1.6)*.09+choreo.recoil*.08*(choreo.beat?.impact===3.55?-1:1);
  const pull=smooth((age-.2)/1.65),portrait=h>w*.85,orbit=reduced?.10:.68*(1-pull)+Math.sin(age*.38)*profile.orbit*(1-finisherCharge*.85)+finisherCharge*.26;
  this.actorGroup.updateMatrixWorld(true);const offset=(this.body?.getWorldPosition(this.bodyPoint).y??this.bodyY)-this.bodyY,forward=Math.max(0,this.bodyPoint.z-this.bodyZ),sideways=this.bodyPoint.x-this.bodyX;const airborne=performanceProfile(this.baseSpecies).entrance==='soar';if(airborne){this.actorGroup.position.y-=offset*.85;this.followY=offset*.15;this.actorGroup.updateMatrixWorld(true);}else this.followY+=(offset-this.followY)*(1-Math.exp(-dt*12));
  const strikeAge=choreo.beat?age-choreo.beat.impact:9,strikePulse=strikeAge>=0?Math.exp(-strikeAge*10)*choreo.strength:0;
  const radius=(1+winReturnPose(exitAge).pull*.14)*((portrait?9.4:9.0)-(1-pull)*2.3)*Math.max(1,.68/(w/h))*(1-victory.heroZoom-Math.min(.08,finale.zoom*profile.strength)-shot.dolly*.6-strikePulse*.018+response.recoil*.035);
  const impact=Math.max(0,age-WIN_CINEMA_IMPACT),shake=!reduced&&age>WIN_CINEMA_IMPACT?Math.exp(-impact*9)*.10:0;
  this.camera.position.set(sideways*.85+Math.sin(orbit)*radius+Math.sin(age*87)*shake+finale.shake*profile.strength+Math.sin(age*77)*strikePulse*.07,1.3+pull*1.8+this.followY*.65+finale.shake*.65+response.lift*.14,Math.cos(orbit)*radius+forward*.85);const closeup=winAttackCloseup(real,reduced),headPoint=this.headBone?.getWorldPosition(new Vector3()),head=closeup>0&&headPoint?this.locateEyes(headPoint,orbit):headPoint;
  // The eye shot looks into the eyes. The face's forward is perpendicular to the line between the eyes, on the side the
  // wide camera already sees; the lens sits at eye level, turned a touch toward the orbit so a muzzle falls aside.
  if(closeup&&head)this.eyeLens(head,orbit,closeup);
  this.camera.lookAt(sideways*.85*(1-closeup)+(head?.x??0)*closeup,((portrait?.75:.45)+this.followY*.65-victory.aimDrop)*(1-closeup)+(head?.y??1.7)*closeup,forward*.7*(1-closeup)+(head?.z??0)*closeup);this.camera.rotation.z=reduced?0:shot.bank*profile.rank+finale.shake*.2+response.roll*.014;this.camera.aspect=w/h;this.camera.updateProjectionMatrix();
  // Keep a readable face margin during the held award, including short, broad actors.
  // This follows the animated head; it does not restart or rescale the Pokémon pose.
  if(head){this.camera.updateMatrixWorld();const projected=head.clone().project(this.camera),overflow=Math.max(0,projected.y-.66)*victory.victory,horizontal=projected.x-Math.max(-.40,Math.min(.40,projected.x));if(overflow>0||horizontal!==0){const aim=new Vector3();this.camera.getWorldDirection(aim);aim.multiplyScalar(radius).add(this.camera.position);aim.y+=overflow*radius*.36;aim.x+=horizontal*radius*.36*(w/h);this.camera.lookAt(aim);this.camera.updateMatrixWorld();}}

  const flash=age>WIN_CINEMA_IMPACT?Math.exp(-impact*5):0,final=age>WIN_CINEMA_FINISH?Math.exp(-(age-WIN_CINEMA_FINISH)*4):0;
  this.pulse.intensity=flash*20+final*20*profile.strength+strikePulse*20+finisherCharge*3;this.rim.intensity=1.4+flash*2+final*2+finisherCharge*3;this.key.intensity=(1.7+Math.sin(age)*.10)*(1-response.charge*.30)+response.light*.55;this.rim.intensity+=response.afterglow*.8+victory.victory*1.1;this.key.intensity+=victory.victory*.35;
  const mat=this.floor.material as ShaderMaterial;const wave=groundWave(age,this.tier,reduced);mat.uniforms.waveRadius.value=wave.radius;mat.uniforms.waveAlpha.value=wave.alpha;mat.uniforms.charge.value=response.charge;mat.uniforms.impactLight.value=response.light;

  const backlight=heroLight(age,this.tier,exitAge,reduced);this.heroPoint.set(this.body?this.bodyPoint.x:0,this.body?this.bodyPoint.y:this.actorBaseY+1.4,this.body?this.bodyPoint.z:0);
  this.heroLight.update(age,this.camera,this.heroPoint,backlight.rays*transition.arena,backlight.core*transition.arena,victory.victory);
  this.resize(w,h);
  const sockets=this.worldAttackOrigins();this.elementalVolume.update(age,w,h,this.camera,sockets,reduced||!this.hasVolumeAttack);
  // Reuse the precompiled impact light; a second dynamic light changes every actor shader.
  if(sockets.length&&choreo.beat&&age>2.48&&age<(this.hasVolumeAttack?choreo.beat.impact:choreo.beat.release)){this.pulse.position.copy(sockets[0].position);this.pulse.color.copy(this.rim.color);this.pulse.intensity=(this.fireEmitter?1.3:.9)*Math.max(.3,choreo.charge)*(choreo.finisher?2.2:1.4);}else{this.pulse.position.set(0,1,3);this.pulse.color.copy(this.pulseBaseColor);}
  // The strike lands on the arena floor under the amount: a wave crosses the floor, coins are thrown toward the Pokémon and the contact lights both.
  const award=winCinemaGeometry(w,h,this.tier==='legendary',age),floorY=this.floor.position.y;this.camera.updateMatrixWorld();
  this.ray.set(0,1-2*award.amountCentreY/h,.5).unproject(this.camera).sub(this.camera.position).normalize();
  const reach=this.ray.y<-.06?Math.max(2.2,Math.min(9,(floorY-this.camera.position.y)/this.ray.y)):6;this.hit.copy(this.camera.position).addScaledVector(this.ray,reach);this.hit.y=floorY;
  this.toward.set(-this.hit.x,0,-this.hit.z);if(this.toward.lengthSq()<1e-4)this.toward.set(0,0,-1);this.toward.normalize();
  if(age<previous){this.coins.clear();this.shock.start=-9;}
  if(!reduced)for(const beat of juiceBeats(this.tier)){
   if(beat.opening||!(previous<beat.impact&&age>=beat.impact)||(age-previous>.25&&!beat.finisher))continue;
   this.shock.x=this.hit.x;this.shock.z=this.hit.z;this.shock.start=beat.impact;this.shock.strength=beat.finisher?1.5:.75+beat.strength*.4;
   this.coins.shock(this.hit,this.shock.strength);this.coins.burst(this.hit,this.toward,Math.round((beat.finisher?TIER_PALETTE[this.tier].coin*1.5:12+beat.weight*14)*(this.low?.5:1)),beat.finisher?1.2:1);
  }
  this.coins.update(dt);
  const travelled=age-this.shock.start,fade=Math.max(0,1-travelled/1.15);mat.uniforms.hitCentre.value.set(this.shock.x,-this.shock.z);mat.uniforms.hitRadius.value=.3+travelled*8.5;mat.uniforms.hitAlpha.value=travelled>=0?fade*fade*this.shock.strength*transition.arena:0;
  mat.uniforms.heat.value=scoreHeat(age,winCinemaPose(age,exitAge,this.tier).count,this.tier,exitAge,reduced)*transition.arena;
  if(age>2.48&&!(sockets.length&&choreo.beat&&age<choreo.beat.release)){this.pulse.position.set(this.hit.x*.82,floorY+.9,this.hit.z*.82);}
  if(this.eyeProject(closeup,real,w,h)){}
  else if(real<5){this.eyeCheck=-1;this.eyeOffsets=null;this.faceDepth=-1;}
  this.renderer.render(this.scene,this.camera);this.texture.source.update();wingRestores.forEach(restore=>restore());
 }
 /** Move the lens onto the eyes: level with them, outside the face, looking along where the face looks. */
 private eyeLens(head:Vector3,orbit:number,closeup:number){const across=this.eyeScratch.copy(this.eyeWorld[1]).sub(this.eyeWorld[0]);across.y=0;const facing=this.lens.set(-across.z,0,across.x);
   if(facing.lengthSq()<1e-8)facing.set(Math.sin(orbit),0,Math.cos(orbit));facing.normalize();if((this.camera.position.x-head.x)*facing.x+(this.camera.position.z-head.z)*facing.z<0)facing.multiplyScalar(-1);
   // Where the eyes themselves look, when the eye meshes tell us: follow their tilt, and their side if it disagrees.
   let lift=.04;if(this.eyeFacing.lengthSq()>1e-8){const look=this.eyeFacing.clone().normalize(),flat=Math.hypot(look.x,look.z);if(flat>.2){facing.set(look.x/flat,0,look.z/flat);}lift=Math.max(-.55,Math.min(.35,look.y/Math.max(.2,flat)));}
   const turn=.12*(Math.sign(Math.sin(orbit))||1),c=Math.cos(turn),sn=Math.sin(turn),norm=Math.hypot(1,lift),dir=this.lensDir.set((facing.x*c+facing.z*sn)/norm,lift/norm,(-facing.x*sn+facing.z*c)/norm);
   // How far the face surface lies in front of the eye points along this line, measured once per shot from outside:
   // the lens keeps that depth plus a gap, so it is never inside a muzzle, a brow or a round body.
   if(this.faceDepth<0){this.model.updateMatrixWorld(true);const far=8;this.eyeRay.set(this.eyeScratch.copy(dir).multiplyScalar(far).add(head),dir.clone().negate());this.eyeRay.far=far;const hit=this.eyeRay.intersectObjects(this.bodyMeshes,false)[0];this.faceDepth=hit?Math.max(0,far-hit.distance):0;}
   const distance=this.faceDepth+Math.max(.9,Math.min(2.4,this.eyeSpan*4.5||1.2));
   this.camera.position.lerp(this.lens.copy(dir).multiplyScalar(distance).add(head),closeup);this.camera.position.y=Math.max(this.camera.position.y,this.floor.position.y+.35);}
 /** Screen positions of the eyes the lens can actually see. */
 private eyeProject(closeup:number,real:number,w:number,h:number){
  this.eyePoints.length=0;if(closeup<=.01)return false;{this.camera.updateMatrixWorld();
   // Once per shot, after the lens settles: an eye hidden behind a muzzle or brow gets no glint.
   if(closeup>.98&&this.eyeCheck<0){this.eyeCheck=real;this.model.updateMatrixWorld(true);const meshes:Object3D[]=[];this.model.traverse(o=>{if(o instanceof Mesh&&o.renderOrder>=0&&o.visible)meshes.push(o);});
    this.eyeWorld.forEach((eye,i)=>{const toEye=this.eyeScratch.copy(eye).sub(this.camera.position),distance=toEye.length();this.eyeRay.set(this.camera.position,toEye.normalize());this.eyeRay.far=distance;const hit=this.eyeRay.intersectObjects(meshes,false)[0];this.visibleEyes[i]=!hit||hit.distance>distance-Math.max(0,this.faceDepth)-Math.max(.06,this.eyeSpan*.35);});}
   this.eyeWorld.forEach((eye,i)=>{if(!this.visibleEyes[i])return;const p=this.eyeScratch.copy(eye).project(this.camera);this.eyePoints.push({x:(p.x*.5+.5)*w,y:(.5-p.y*.5)*h});});}
  return true;
 }
 private resize(w:number,h:number){const resolution=this.low?.8:Math.min(1.4,1152/Math.max(w,h)),rw=Math.round(w*resolution),rh=Math.round(h*resolution);if(this.canvas.width!==rw||this.canvas.height!==rh)this.renderer.setSize(rw,rh,false);}
 private worldAttackOrigins(){return (moveRigs[this.species]?.emitters??[]).flatMap(e=>{const bone=this.bones.get(e.bone);if(!bone)return[];const position=new Vector3().fromArray(e.tip).applyMatrix4(bone.matrixWorld),direction=new Vector3().fromArray(e.forward).applyMatrix4(bone.matrixWorld).sub(position).normalize();return[{position,direction}];});}
 /** World positions of both eyes from the eyelid bones or eye locators; models without them use a span across the head. */
 private locateEyes(head:Vector3,orbit:number){
  if(this.eyes.length===2){this.eyes.forEach((bones,i)=>{const out=this.eyeWorld[i].set(0,0,0);for(const bone of bones)out.add(bone.getWorldPosition(this.eyeScratch));out.divideScalar(bones.length);});
   // Once per shot, measure each eye's mesh centre on its own side of the face and carry it with the head from then on.
   if(this.eyeOffsets===null&&this.headBone)this.eyeOffsets=this.measureEyes()??false;
   this.eyePivots[0].copy(this.eyeWorld[0]);this.eyePivots[1].copy(this.eyeWorld[1]);this.eyeFacing.set(0,0,0);
   // Each eye looks out from its pivot through its surface: together they give where the face is looking, tilt included.
   if(this.eyeOffsets&&this.headBone){this.eyeOffsets.forEach((offset,i)=>this.headBone!.localToWorld(this.eyeWorld[i].copy(offset)));const near=this.eyeWorld[0].distanceTo(this.eyePivots[0])<.5&&this.eyeWorld[1].distanceTo(this.eyePivots[1])<.5;if(near)this.eyeFacing.copy(this.eyeWorld[0]).sub(this.eyePivots[0]).add(this.eyeWorld[1]).sub(this.eyePivots[1]);}}
  else{this.eyeFacing.set(0,0,0);const right=this.eyeScratch.set(Math.cos(orbit),0,-Math.sin(orbit)).multiplyScalar(.11);this.eyeWorld[0].copy(head).sub(right).y+=.06;this.eyeWorld[1].copy(head).add(right).y+=.06;}
  this.eyeSpan=this.eyeWorld[0].distanceTo(this.eyeWorld[1]);return this.eyeCentre.copy(this.eyeWorld[0]).add(this.eyeWorld[1]).multiplyScalar(.5);
 }
 private measureEyes(){
  if(!this.eyeMeshes.length||!this.headBone)return null;this.model.updateMatrixWorld(true);
  const left=this.eyeWorld[0].clone(),right=this.eyeWorld[1].clone(),mid=left.clone().add(right).multiplyScalar(.5),across=right.clone().sub(left),sums=[new Vector3(),new Vector3()],counts=[0,0],v=new Vector3();
  // Only eyes that are drawn: some files carry hidden alternate-form meshes.
  const shown=(o:Object3D|null):boolean=>!o||(o.visible&&shown(o.parent));
  for(const mesh of this.eyeMeshes){const position=mesh.geometry.getAttribute('position');if(!position||!shown(mesh))continue;const step=Math.max(1,Math.floor(position.count/1500));
   for(let i=0;i<position.count;i+=step){mesh.getVertexPosition(i,v);v.applyMatrix4(mesh.matrixWorld);const side=v.clone().sub(mid).dot(across)>0?1:0;sums[side].add(v);counts[side]++;}}
  if(!counts[0]||!counts[1])return null;
  return sums.map((sum,i)=>this.headBone!.worldToLocal(sum.divideScalar(counts[i])));
 }
 /** Screen position of the actor's torso for 2D light that follows the performance. */
 bodyScreen(w:number,h:number){const point=this.heroPoint.clone().project(this.camera);return {x:(point.x*.5+.5)*w,y:(.5-point.y*.5)*h};}
 attackOrigins(w:number,h:number){const emitters=this.species==='pidgeot'?[{bone:'lfeeler2',tip:[57.888596,-1.672706,-3.67954]},{bone:'rfeeler2',tip:[57.888592,1.672701,-3.679567]}]:moveRigs[this.species]?.emitters??[];return emitters.flatMap(e=>{const bone=this.bones.get(e.bone);if(!bone)return[];const point=new Vector3().fromArray(e.tip).applyMatrix4(bone.matrixWorld).project(this.camera);return [{x:(point.x*.5+.5)*w,y:(.5-point.y*.5)*h}];});}
 destroy(){if(this.dead)return;this.dead=true;this.mixer.stopAllAction();this.mixer.uncacheRoot(this.model);this.model.traverse(o=>{if('isSkinnedMesh' in o)(o as import('three').SkinnedMesh).skeleton.dispose();});this.scene.remove(this.actorGroup);const geometries=new Set<import('three').BufferGeometry>();this.scene.traverse(o=>{if(o instanceof Mesh){geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])this.owned.add(m);}});geometries.forEach(g=>g.dispose());this.owned.forEach(m=>m.dispose());this.atmosphere.destroy();this.elementalVolume.dispose();this.heroLight.dispose();this.coins.dispose();this.championship.dispose();this.arena.disposeTexture();this.gradient.dispose();this.texture.destroy(true);winRenderers.release(this.rendererLease);this.scene.clear();}
}
