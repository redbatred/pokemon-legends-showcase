import {SkeletalContinuity} from './skeletalContinuity';
import {encounter,type EncounterProfile} from './encounter';
import {Container,Sprite,Texture as PixiTexture} from 'pixi.js';
import {AnimationMixer,Box3,DataTexture,DirectionalLight,HemisphereLight,Mesh,NearestFilter,NoToneMapping,OrthographicCamera,Quaternion,RGBAFormat,Scene,SRGBColorSpace,Vector3,WebGLRenderer,type Object3D,type MeshToonMaterial} from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {ensurePokemonNormals,pokemonToonMaterial,pokemonInkEligible} from '../../src/game/pokemonMaterials';
import {createModelOutline} from '../../src/game/modelOutline';

type XYZ=[number,number,number];
type Pose={waist:XYZ;tilt:number;lean:number;leftHand:XYZ;rightHand:XYZ;leftFoot:XYZ;rightFoot:XYZ;leftElbow:XYZ;rightElbow:XYZ;head:number;tail:number};
const clamp=(v:number)=>Math.max(0,Math.min(1,v)),smooth=(v:number)=>{const t=clamp(v);return t*t*(3-2*t)},rad=Math.PI/180;
const standing:Pose={waist:[0,0,0],tilt:0,lean:0,leftHand:[.48,.985,-.2],rightHand:[-.494,1.01,-.163],leftFoot:[.312,.31,-.245],rightFoot:[-.339,.302,-.186],leftElbow:[.7,1.2,-.3],rightElbow:[-.7,1.2,-.3],head:0,tail:0};
const brace:Pose={waist:[-.09,-.34,.04],tilt:10,lean:13,leftHand:[.54,1.05,.45],rightHand:[-.39,1.02,.49],leftFoot:standing.leftFoot,rightFoot:standing.rightFoot,leftElbow:[.85,.75,.12],rightElbow:[-.8,.78,.13],head:-14,tail:-5};
const strain:Pose={...brace,waist:[-.14,-.39,.04],tilt:15,lean:17,leftHand:[.57,1.11,.48],rightHand:[-.36,1.09,.52],head:-19,tail:5};
const airborne:Pose={waist:[.0,.0,0],tilt:-59,lean:5,leftHand:[-.12,1.07,.45],rightHand:[-.38,.97,.2],leftFoot:[-.58,.51,-.23],rightFoot:[-.7,.63,-.28],leftElbow:[-.2,.68,.2],rightElbow:[-.4,.65,-.1],head:23,tail:-7};
const coil:Pose={waist:[.04,.04,.02],tilt:-32,lean:24,leftHand:[.44,1.32,.48],rightHand:[.03,1.34,.49],leftFoot:[.18,.98,.44],rightFoot:[-.2,.97,.37],leftElbow:[.73,1.03,.15],rightElbow:[-.4,1.1,.1],head:30,tail:16};
const burst:Pose={waist:[0,.16,0],tilt:-5,lean:-13,leftHand:[.80,1.95,.20],rightHand:[-.88,1.64,.18],leftFoot:[.6,.38,.05],rightFoot:[-.6,.48,-.04],leftElbow:[.75,1.5,.08],rightElbow:[-.75,1.3,.04],head:8,tail:-8};
const land:Pose={...brace,waist:[0,-.43,.06],tilt:0,lean:22,leftHand:[.52,.49,.32],rightHand:[-.51,.5,.24],leftElbow:[.75,.7,.12],rightElbow:[-.75,.7,.08],head:-20,tail:3};
const defiant:Pose={...standing,waist:[-.03,-.07,0],tilt:5,lean:2,leftHand:[.79,1.29,.37],rightHand:[-.46,.94,-.08],leftElbow:[.60,1.19,.21],rightElbow:[-.6,1.13,-.15],head:-6,tail:0};
const push:Pose={...defiant,waist:[-.10,-.15,0],tilt:12,leftHand:[.96,1.39,.48],leftElbow:[.74,1.33,.33],head:-12,tail:-6};
function blend(a:Pose,b:Pose,t:number):Pose{const result={} as Pose;for(const k of Object.keys(a) as (keyof Pose)[]){const v=a[k],w=b[k];(result as unknown as Record<string,number|XYZ>)[k]=typeof v==='number'?v+((w as number)-v)*t:v.map((n,i)=>n+((w as XYZ)[i]-n)*t) as XYZ;}return result;}
function keys(time:number,frames:[number,Pose][]):Pose{if(time<=frames[0][0])return frames[0][1];for(let i=1;i<frames.length;i++)if(time<=frames[i][0])return blend(frames[i-1][1],frames[i][1],smooth((time-frames[i-1][0])/(frames[i][0]-frames[i-1][0])));return frames.at(-1)![1];}

// Shape-preserving Hermite curves carry velocity through a key whenever the
// channel continues in the same direction. Reversals settle at their extrema;
// they never overshoot the authored joint targets or pause the whole pose.
const captureFrames:[number,Pose][]=[[0,strain],[.38,airborne],[.82,coil]];
function captureChannel(time:number,values:number[]):number{
 const times=captureFrames.map(([t])=>t);
 if(time<=times[0])return values[0];if(time>=times.at(-1)!)return values.at(-1)!;
 const intervals=times.slice(1).map((t,i)=>t-times[i]),slopes=intervals.map((h,i)=>(values[i+1]-values[i])/h);
 const tangents=values.map((_,i)=>{
  if(i===0||i===values.length-1||slopes[i-1]*slopes[i]<=0)return 0;
  const before=intervals[i-1],after=intervals[i],w1=2*after+before,w2=after+2*before;
  return (w1+w2)/(w1/slopes[i-1]+w2/slopes[i]);
 });
 const i=times.findIndex(t=>t>time)-1,h=intervals[i],u=(time-times[i])/h,u2=u*u,u3=u2*u;
 return (2*u3-3*u2+1)*values[i]+(u3-2*u2+u)*h*tangents[i]+(-2*u3+3*u2)*values[i+1]+(u3-u2)*h*tangents[i+1];
}
function capturePose(time:number):Pose{
 const result={} as Pose;
 for(const key of Object.keys(strain) as (keyof Pose)[]){
  // The chest/head start the pull, then the hands, feet and tail follow. Each
  // channel starts with zero velocity, so its small delay introduces no snap.
  const delay=key==='tail'?.12:key.endsWith('Foot')?.08:key.endsWith('Hand')||key.endsWith('Elbow')?.04:0;
  const channelTime=(time-delay)*(key==='tail'?.82/.98:1);
  const values=captureFrames.map(([,pose])=>pose[key]);
  (result as unknown as Record<string,number|XYZ>)[key]=typeof values[0]==='number'
   ?captureChannel(channelTime,values as number[])
   :[0,1,2].map(axis=>captureChannel(channelTime,values.map(value=>(value as XYZ)[axis]))) as XYZ;
 }
 return result;
}

/** Actual skinned GLTF geometry, rendered with the game's cel shading and ink shell.
 * display has the same grounded coordinates as the former Spine actor. chest is
 * the current projected upper-torso bone, in display pixels (positive y down).
 * All sampling is absolute/reentrant; the parent scene owns flight and shrinking.
 */
export async function createCaptureActor(profile:EncounterProfile=encounter){
 const gltf=await new GLTFLoader().loadAsync(profile.modelUrl);
 const model=gltf.scene,scene=new Scene();scene.add(model);
 const gradient=new DataTexture(new Uint8Array([68,68,68,255,145,145,145,255,219,219,219,255,255,255,255,255]),4,1,RGBAFormat);gradient.minFilter=gradient.magFilter=NearestFilter;gradient.needsUpdate=true;
 const materials:MeshToonMaterial[]=[],outlines:Mesh[]=[],meshes:Mesh[]=[];
 model.traverse(o=>{if(!(o instanceof Mesh))return;meshes.push(o);ensurePokemonNormals(o.geometry);const original=Array.isArray(o.material)?o.material:[o.material];const converted=original.map(m=>pokemonToonMaterial(m,gradient));materials.push(...converted);o.material=Array.isArray(o.material)?converted:converted[0];if(pokemonInkEligible('mewtwo',o.name,original)){const outline=o.clone(false);outline.material=createModelOutline(o.geometry);outline.renderOrder=-1;outlines.push(outline);}});
 for(let i=0;i<outlines.length;i++){const o=outlines[i];model.getObjectByName(o.name)?.parent?.add(o);}
 scene.add(new HemisphereLight(0xf4f4ff,0x596280,1.15));const key=new DirectionalLight(0xffffff,2.1);key.position.set(-3,6,7);scene.add(key);const rim=new DirectionalLight(0xbaadff,.55);rim.position.set(4,2,-3);scene.add(rim);
 const renderer=new WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});renderer.setSize(1024,1024,false);renderer.setClearColor(0,0);renderer.outputColorSpace=SRGBColorSpace;renderer.toneMapping=NoToneMapping;
 // The 3D render is uploaded to the scene straight from its own canvas: one copy per frame instead of two.
 const canvas=renderer.domElement,texture=PixiTexture.from(canvas),sprite=new Sprite(texture),display=new Container();display.addChild(sprite);
 const mixer=new AnimationMixer(model),idleClip=gltf.animations.find(a=>a.name==='idle')!;const idleAction=mixer.clipAction(idleClip);idleAction.play();mixer.setTime(0);model.updateMatrixWorld(true);
 const bones=new Map<string,Object3D>();model.traverse(o=>{if('isBone'in o||o.name==='waist'||o.name==='origin')bones.set(o.name,o)});
 for(const name of ['waist','spine_02','head','left_arm_01','left_arm_02','left_hand','right_arm_01','right_arm_02','right_hand','left_leg_01','left_leg_02','left_foot','right_leg_01','right_leg_02','right_foot'])if(!bones.has(name))throw Error(`Capture rig is missing ${name}`);
 const initial=new Map([...bones].map(([n,b])=>[n,{p:b.position.clone(),q:b.quaternion.clone(),s:b.scale.clone()}]));
 const footRotations={left:bones.get('left_foot')!.getWorldQuaternion(new Quaternion()),right:bones.get('right_foot')!.getWorldQuaternion(new Quaternion())};
 const yaw=-28*rad,view=new Vector3(Math.sin(yaw),.035,Math.cos(yaw)).normalize(),span=5.6,center=new Vector3(0,.82,0),camera=new OrthographicCamera(-span/2,span/2,span/2,-span/2,.1,30);camera.position.copy(center).addScaledVector(view,12);camera.lookAt(center);camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
 const standingBounds=new Box3().setFromObject(model,true),pixelsPerUnit=430/(standingBounds.max.y-standingBounds.min.y),displaySize=span*pixelsPerUnit;
 sprite.width=sprite.height=displaySize;
 const floor=new Vector3(0,standingBounds.min.y,0).project(camera);sprite.anchor.set((floor.x+1)/2,(1-floor.y)/2);
 const captureMotionValidation={samples:265,stepSeconds:1/240,maxHeadStep:0,maxChestStep:0,resistToCaptureMaxMatrixDelta:0};
 const energyAnchors=Array.from({length:7},()=>({x:0,y:0}));
 const energyPaths=Array.from({length:6},()=>Array.from({length:4},()=>({x:0,y:0})));
 const chest={worldX:0,worldY:0},diagnostics={source:'/assets/pokemon-3d/mewtwo.glb',boneCount:bones.size,sourceClips:gltf.animations.map(a=>({name:a.name,duration:a.duration})),renderSize:1024,standingHeight:430,lastClip:'idle',maxAbsProjectedCoordinate:0,finite:true,captureMotionValidation};
 const position=(name:string)=>bones.get(name)!.getWorldPosition(new Vector3());
 function rotateWorld(b:Object3D,axis:Vector3,angle:number){const parent=b.parent!.getWorldQuaternion(new Quaternion()),world=b.getWorldQuaternion(new Quaternion()).premultiply(new Quaternion().setFromAxisAngle(axis,angle));b.quaternion.copy(parent.invert().multiply(world));b.updateWorldMatrix(false,true);}
 function aim(b:Object3D,child:Object3D,target:Vector3){const origin=b.getWorldPosition(new Vector3()),from=child.getWorldPosition(new Vector3()).sub(origin).normalize(),to=target.clone().sub(origin).normalize(),delta=new Quaternion().setFromUnitVectors(from,to),world=b.getWorldQuaternion(new Quaternion()).premultiply(delta),parent=b.parent!.getWorldQuaternion(new Quaternion());b.quaternion.copy(parent.invert().multiply(world));b.updateWorldMatrix(false,true);}
 function ik(prefix:string,limb:'arm'|'leg',target:XYZ,pole:XYZ){const a=bones.get(`${prefix}_${limb}_01`)!,b=bones.get(`${prefix}_${limb}_02`)!,end=bones.get(`${prefix}_${limb==='arm'?'hand':'foot'}`)!,origin=a.getWorldPosition(new Vector3()),middle=b.getWorldPosition(new Vector3()),tip=end.getWorldPosition(new Vector3()),l1=origin.distanceTo(middle),l2=middle.distanceTo(tip),v=new Vector3(...target).sub(origin),d=Math.max(.015,Math.min(v.length(),(l1+l2)*.992)),direction=v.normalize(),bend=new Vector3(...pole).sub(origin);bend.addScaledVector(direction,-bend.dot(direction)).normalize();const along=(l1*l1-l2*l2+d*d)/(2*d),height=Math.sqrt(Math.max(0,l1*l1-along*along)),elbow=origin.clone().addScaledVector(direction,along).addScaledVector(bend,height),tipTarget=origin.clone().addScaledVector(direction,d);aim(a,b,elbow);aim(b,end,tipTarget);}
 const continuity=new SkeletalContinuity([...bones.values()]);
 let lastRenderKey='';
 function sample(clip:string,time:number,render=true,_idlePhase=0,motionClock?:number){
  const cacheKey=`${clip}:${time}:${motionClock}`;display.alpha=1;if(render&&cacheKey===lastRenderKey)return;
  const t=Math.max(0,time);for(const[n,b]of bones){const s=initial.get(n)!;b.position.copy(s.p);b.quaternion.copy(s.q);b.scale.copy(s.s);}
  mixer.setTime(clip==='idle'?t%idleClip.duration:clip==='appear'?Math.max(0,1.2-t)*.3:0);model.updateMatrixWorld(true);
  let p:Pose|null=null;
  if(clip==='react')p=keys(t,[[0,standing],[.09,blend(standing,brace,.3)],[.25,brace],[.55,brace]]);
  if(clip==='resist'){p=keys(t,[[0,brace],[.2,blend(brace,strain,.35)],[.6,strain]]);const envelope=smooth(t/.1)*smooth((.6-t)/.14);p={...p,waist:[p.waist[0]+Math.sin(t*46)*.008*envelope,p.waist[1],p.waist[2]],head:p.head+Math.sin(t*38)*1.2*envelope,tail:p.tail+Math.sin(t*16)*3*envelope};}
  if(clip==='capture')p=capturePose(t);
  if(clip==='reform')p=keys(t,[[0,strain],[.2,burst],[.5,land],[.7,defiant]]);
  if(clip==='escape')p=keys(t,[[0,coil],[.1,coil],[.25,burst],[.49,burst],[.8,land],[1,blend(land,defiant,.12)]]);
  if(clip==='depart')p=keys(t,[[0,defiant],[.18,{...defiant,leftHand:[.65,1.65,.40],rightHand:[-.65,1.65,.40],head:12}],[.7,{...coil,tilt:0,lean:0,head:-10}]]);
  if(clip==='reject')p=keys(t,[[0,blend(land,defiant,.12)],[.15,push],[.32,blend(push,defiant,.35)],[.7,defiant]]);
  if(p){
   const waist=bones.get('waist')!,world=position('waist').add(new Vector3(...p.waist));waist.position.copy(waist.parent!.worldToLocal(world));waist.updateWorldMatrix(false,true);
   rotateWorld(waist,new Vector3(0,0,1),p.tilt*rad);rotateWorld(bones.get('spine_01')!,new Vector3(1,0,0),p.lean*rad);rotateWorld(bones.get('head')!,new Vector3(1,0,0),p.head*rad);
   ik('left','leg',p.leftFoot,[.62,.55,.85]);ik('right','leg',p.rightFoot,[-.62,.55,.85]);
   for(const side of ['left','right'] as const){const b=bones.get(`${side}_foot`)!;b.quaternion.copy(b.parent!.getWorldQuaternion(new Quaternion()).invert().multiply(footRotations[side]));b.updateWorldMatrix(false,true);}
   ik('left','arm',p.leftHand,p.leftElbow);ik('right','arm',p.rightHand,p.rightElbow);
   for(let i=2;i<=12;i++){const b=bones.get(`tail_${String(i).padStart(2,'0')}`);if(b)b.quaternion.multiply(new Quaternion().setFromAxisAngle(new Vector3(0,1,0),p.tail*rad*.32*Math.sin(i*.19)));}
  }
  // Native finger joints flex around local Y. Uncurl their distal segments while
  // preserving the existing palm orientation and the proximal finger spread.
  const open=clip==='reject'?smooth(t/.12):clip==='escape'?smooth((t-.12)/.1)*(1-smooth((t-.5)/.3)):0;
  if(open>0)for(const side of clip==='escape'?['left','right']:['left'])for(const finger of ['thumb','middle','ring']){
   for(const joint of ['02','03'])bones.get(`${side}_${finger}_${joint}`)?.quaternion.slerp(new Quaternion(),open*.92);
   const base=bones.get(`${side}_${finger}_01`);if(base&&finger!=='thumb')base.quaternion.multiply(new Quaternion().setFromAxisAngle(new Vector3(0,1,0),(finger==='middle'?8:10)*rad*open));
  }
  for(const o of outlines)o.visible=true;
  display.alpha=1;
  continuity.apply(motionClock);
  model.updateMatrixWorld(true);const projected=position('spine_02').project(camera);chest.worldX=((projected.x+1)/2-sprite.anchor.x)*displaySize;chest.worldY=((1-projected.y)/2-sprite.anchor.y)*displaySize;
  ['spine_02','head','left_hand','right_hand','left_foot','tail_08','right_foot'].forEach((name,i)=>{const p=position(name).project(camera);energyAnchors[i].x=((p.x+1)/2-sprite.anchor.x)*displaySize;energyAnchors[i].y=((1-p.y)/2-sprite.anchor.y)*displaySize;});
  const pathNames=[['spine_02','neck','head','left_ear'],['spine_02','left_arm_02','left_hand','left_middle_03'],['spine_02','right_arm_02','right_hand','right_middle_03'],['spine_02','hips','left_leg_02','left_foot'],['spine_02','hips','tail_04','tail_12'],['spine_02','hips','right_leg_02','right_foot']];
  pathNames.forEach((names,i)=>names.forEach((name,j)=>{const v=position(name).project(camera);energyPaths[i][j].x=((v.x+1)/2-sprite.anchor.x)*displaySize;energyPaths[i][j].y=((1-v.y)/2-sprite.anchor.y)*displaySize;}));
  diagnostics.lastClip=clip;diagnostics.finite=[...bones.values()].every(b=>b.matrixWorld.elements.every(Number.isFinite));if(!diagnostics.finite)throw Error(`Nonfinite skeletal pose ${clip}@${t}`);
  if(render){renderer.render(scene,camera);texture.source.update();lastRenderKey=cacheKey;}
 }
 const validation:Record<string,{samples:number;finite:boolean;maxProjectedExtent:number;minFootHeight:number;maxFootHeight:number}>={};
 for(const[clip,duration]of Object.entries({idle:3,appear:1.2,react:.55,resist:.6,capture:1.1,escape:1,reject:.7})){
  const result={samples:21,finite:true,maxProjectedExtent:0,minFootHeight:Infinity,maxFootHeight:-Infinity};
  for(let i=0;i<=20;i++){sample(clip,duration*i/20,false);result.finite&&=diagnostics.finite;for(const b of bones.values()){const p=b.getWorldPosition(new Vector3()).project(camera);result.maxProjectedExtent=Math.max(result.maxProjectedExtent,Math.abs(p.x),Math.abs(p.y));}for(const name of ['left_foot','right_foot']){const y=position(name).y;result.minFootHeight=Math.min(result.minFootHeight,y);result.maxFootHeight=Math.max(result.maxFootHeight,y);}}
  validation[clip]=result;
 }
 // Check the actual solved skeleton, including the clip seam, at 240 Hz.
 // These bounds detect positional snaps; they are not a collision test.
 sample('resist',.6,false);const resistanceMatrices=[...bones.values()].map(b=>b.matrixWorld.elements.slice());
 sample('capture',0,false);
 [...bones.values()].forEach((b,i)=>b.matrixWorld.elements.forEach((v,j)=>{captureMotionValidation.resistToCaptureMaxMatrixDelta=Math.max(captureMotionValidation.resistToCaptureMaxMatrixDelta,Math.abs(v-resistanceMatrices[i][j]));}));
 let previousHead=position('head'),previousChest=position('spine_02');
 for(let i=1;i<captureMotionValidation.samples;i++){
  sample('capture',i*captureMotionValidation.stepSeconds,false);
  const head=position('head'),torso=position('spine_02');
  captureMotionValidation.maxHeadStep=Math.max(captureMotionValidation.maxHeadStep,head.distanceTo(previousHead));
  captureMotionValidation.maxChestStep=Math.max(captureMotionValidation.maxChestStep,torso.distanceTo(previousChest));
  previousHead=head;previousChest=torso;
 }
 if(captureMotionValidation.resistToCaptureMaxMatrixDelta>1e-9)throw Error('Resistance and capture poses do not join exactly');
 if(captureMotionValidation.maxHeadStep>.08||captureMotionValidation.maxChestStep>.04)throw Error('Capture pose has a discontinuous head or chest trajectory');
 sample('idle',0);
 return {display,sprite,displaySize,sample,chest,energyAnchors,energyPaths,diagnostics,validation,dispose(){mixer.stopAllAction();texture.destroy(true);for(const m of materials)m.dispose();for(const o of outlines)(o.material as import('three').Material).dispose();gradient.dispose();renderer.dispose();renderer.forceContextLoss();},};
}
