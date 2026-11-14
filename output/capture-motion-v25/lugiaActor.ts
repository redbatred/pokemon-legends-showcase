import {SkeletalContinuity,arrivalPhase} from './skeletalContinuity';
import {encounter,type EncounterProfile} from './encounter';
import {Container,Sprite,Texture as PixiTexture} from 'pixi.js';
import {AnimationMixer,Box3,DataTexture,DirectionalLight,Group,HemisphereLight,Mesh,NearestFilter,NoToneMapping,OrthographicCamera,Quaternion,RGBAFormat,Scene,SRGBColorSpace,Vector3,WebGLRenderer,type Object3D,type MeshToonMaterial,type Material} from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {ensurePokemonNormals,pokemonToonMaterial,pokemonInkEligible} from '../../src/game/pokemonMaterials';
import {createModelOutline} from '../../src/game/modelOutline';

const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const ease=(v:number)=>{const t=clamp(v);return t*t*(3-2*t);};
const rad=Math.PI/180;
type Pose=Array<{p:Vector3;q:Quaternion;s:Vector3}>;

/** Native skinned Lugia, with absolute/reentrant pose sampling.
 * Supported seconds-based clips: appear (1.2), idle (loop), react (.55),
 * resist (.6), capture (1.1), escape (1), reject (.7), depart (.35, held flare).
 * Source root rotations and .350744 scales are part of its skin binding and
 * MUST survive. Only the outer flight group translates the whole character.
 * Numeric suffixes are exporter node IDs, not anatomical joint numbers.
 * Alpha, energy conversion, screen flight and warp belong to the caller.
 */
export async function createLugiaActor(profile:EncounterProfile=encounter){
 const gltf=await new GLTFLoader().loadAsync(profile.modelUrl);
 const model=gltf.scene,flight=new Group(),scene=new Scene();flight.add(model);scene.add(flight);
 // This export's real meshes are top-level siblings of its root skeleton.
 // lod1/lod2 below the skeleton are placeholders: never remove those siblings.
 model.traverse(o=>{if(/^lod[12]_/.test(o.name)||/_lod[12]_/.test(o.name))o.visible=false;});
 const nodes:Object3D[]=[];model.traverse(o=>nodes.push(o));
 const bones=new Map<string,Object3D>();model.traverse(o=>{if('isBone'in o)bones.set(o.name.replace(/_\d+$/,''),o);});
 for(const name of ['waist','spine_02','head','left_hand','right_hand','left_foot','right_foot','tail_06'])if(!bones.has(name))throw Error(`Lugia rig missing ${name}`);
 const save=():Pose=>nodes.map(o=>({p:o.position.clone(),q:o.quaternion.clone(),s:o.scale.clone()}));
 const restore=(p:Pose)=>nodes.forEach((o,i)=>{o.position.copy(p[i].p);o.quaternion.copy(p[i].q);o.scale.copy(p[i].s);});
 const rest=save(),mixer=new AnimationMixer(model);
 const clips={idle:gltf.animations.find(c=>c.name.includes(profile.clips.idle))!,attack:gltf.animations.find(c=>c.name.includes(profile.clips.attack))!,roar:gltf.animations.find(c=>c.name.includes(profile.clips.roar))!};
 if(Object.values(clips).some(c=>!c))throw Error('Lugia native clips unavailable');
 const actions=Object.fromEntries(Object.entries(clips).map(([name,c])=>{const a=mixer.clipAction(c);a.play();a.paused=true;a.enabled=false;return [name,a];}));
 function native(name:keyof typeof clips,time:number){
  // Reactivate after restoring rest so Three's property-mixer cache cannot
  // skip writing an identical timestamp after a procedural pose or seek.
  mixer.stopAllAction();restore(rest);
  const action=actions[name];action.reset().play();action.paused=true;action.time=Math.max(0,Math.min(time,clips[name].duration-.00001));mixer.update(0);
 }
 function blendNative(from:Pose,name:keyof typeof clips,time:number,weight:number){native(name,time);nodes.forEach((o,i)=>{o.position.lerpVectors(from[i].p,o.position,weight);o.quaternion.slerpQuaternions(from[i].q,o.quaternion.clone(),weight);o.scale.lerpVectors(from[i].s,o.scale,weight);});}
 function worldRotate(name:string,axis:Vector3,angle:number){const b=bones.get(name);if(!b||!angle)return;scene.updateMatrixWorld(true);const q=b.getWorldQuaternion(new Quaternion()).premultiply(new Quaternion().setFromAxisAngle(axis,angle));b.quaternion.copy(b.parent!.getWorldQuaternion(new Quaternion()).invert().multiply(q));}
 native('idle',0);const idleStart=save();
 native('roar',1.1);const resistanceEnd=save();
 function capturePose(t:number){
  // The native folded-wing phase supplies the tuck, preserving elbow, palm and
  // individual feather/finger articulation. Chest leads, the tail follows.
  blendNative(resistanceEnd,'idle',1.02,ease(t/.78));
  worldRotate('waist',new Vector3(0,0,1),-19*rad*ease(t/.8));
  worldRotate('spine_02',new Vector3(1,0,0),-10*rad*ease((t-.06)/.65));
  worldRotate('head',new Vector3(1,0,0),8*rad*ease((t-.13)/.65));
  for(let i=2;i<=8;i++)worldRotate(`tail_0${i}`,new Vector3(0,1,0),3*rad*ease((t-.12-i*.015)/.75));
 }
 capturePose(1.1);const captured=save();native('idle',0);
 const gradient=new DataTexture(new Uint8Array([75,75,75,255,149,149,149,255,220,220,220,255,255,255,255,255]),4,1,RGBAFormat);gradient.minFilter=gradient.magFilter=NearestFilter;gradient.needsUpdate=true;
 const materials:MeshToonMaterial[]=[],outlines:Mesh[]=[],meshes:Mesh[]=[],originalMaterials=new Set<Material>();
 model.traverse(o=>{if(!(o instanceof Mesh))return;meshes.push(o);ensurePokemonNormals(o.geometry);const original=Array.isArray(o.material)?o.material:[o.material];original.forEach(m=>originalMaterials.add(m));const converted=original.map(m=>pokemonToonMaterial(m,gradient));materials.push(...converted);o.material=Array.isArray(o.material)?converted:converted[0];if(pokemonInkEligible('lugia',o.name,original)){const outline=o.clone(false);outline.name=`${o.name}_capture_ink`;outline.material=createModelOutline(o.geometry);outline.renderOrder=-1;outlines.push(outline);}});
 for(let i=0;i<outlines.length;i++){const o=outlines[i];model.getObjectByName(o.name.replace(/_capture_ink$/,''))!.parent!.add(o);}
 scene.add(new HemisphereLight(0xf3f6ff,0x667395,1.25));const key=new DirectionalLight(0xffffff,2);key.position.set(-3,6,7);scene.add(key);const rim=new DirectionalLight(0xc8c7ff,.5);rim.position.set(4,2,-3);scene.add(rim);
 // A single skinned surface carries both appearance and transport. No sprite handoff.
 const flow={progress:{value:0},time:{value:0},chest:{value:new Vector3()},target:{value:new Vector3()}};
 let flowTarget:{x:number;y:number}|null=null;
 for(const material of [...materials,...outlines.map(o=>o.material as Material)]){
  const previous=material.onBeforeCompile.bind(material),ink=!materials.includes(material as MeshToonMaterial);
  material.onBeforeCompile=(shader,renderer)=>{
   previous(shader,renderer);
   Object.assign(shader.uniforms,{uFlow:flow.progress,uFlowTime:flow.time,uFlowChest:flow.chest,uFlowTarget:flow.target});
   shader.vertexShader='uniform float uFlow; uniform float uFlowTime; uniform vec3 uFlowChest; uniform vec3 uFlowTarget; varying float vFlow; varying float vCurrent;\n'+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',`
    vec4 mvPosition = vec4(transformed,1.0);
    #ifdef USE_INSTANCING
     mvPosition = instanceMatrix * mvPosition;
    #endif
    mvPosition = modelViewMatrix * mvPosition;
    vec3 origin=mvPosition.xyz;
    float distanceFromCore=length((origin-uFlowChest)*vec3(1.0,.8,.6));
    float delay=.02+.44*(1.0-clamp(distanceFromCore/1.9,0.0,1.0));
    float q=clamp((uFlow-delay)/.54,0.0,1.0);
    vFlow=smoothstep(.02,.34,q);
    float travel=smoothstep(.08,1.0,q);
    vec3 c1=mix(origin,uFlowChest,.72)+vec3(-.08,.36,0.0);
    vec3 c2=uFlowTarget+vec3(-.46,.2,.16);
    float inv=1.0-travel;
    vec3 current=inv*inv*inv*origin+3.0*inv*inv*travel*c1+3.0*inv*travel*travel*c2+travel*travel*travel*uFlowTarget;
    float curl=sin(travel*3.14159265)*.055*vFlow;
    current.xy+=vec2(sin(uFlowTime*13.0+distanceFromCore*3.0),cos(uFlowTime*9.0+distanceFromCore*4.0))*curl;
    mvPosition.xyz=current;
    vCurrent=distanceFromCore*6.0-travel*18.0+uFlowTime*13.0;
    gl_Position = projectionMatrix * mvPosition;
   `);
   shader.fragmentShader='uniform float uFlow; varying float vFlow; varying float vCurrent;\n'+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',
    (ink ? 'outgoingLight=mix(outgoingLight,vec3(.012,.07,.22),vFlow);diffuseColor.a*=1.0-smoothstep(.86,1.0,uFlow);' : 'float core=.5+.5*sin(vCurrent); outgoingLight=mix(outgoingLight,mix(vec3(.015,.13,.38)+outgoingLight*vec3(.13,.34,.52),vec3(.82,.96,1.0),smoothstep(.88,.985,core)),vFlow);')+'\n#include <opaque_fragment>');
  };
  material.customProgramCacheKey=()=>`lugia-continuous-flow-v25-${ink}`;
  if(ink)material.transparent=true;
 }
 const span=6.4,center=new Vector3(0,1.1,0),camera=new OrthographicCamera(-span/2,span/2,span/2,-span/2,.1,30);camera.position.copy(center).add(new Vector3(-3.7,.65,11.4));camera.lookAt(center);camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
 // Measure the actual projected skinned vertices. Projecting an enclosing
 // world AABB inflated the span with empty tail-depth corners and over-shrank
 // this very broad character. The 430px maximum becomes 339px on a 366px
 // phone preview (720px stage, scene scale 1.55).
 let projectedWidth=0;const bounds=new Box3(),vertex=new Vector3();
 function projectedBounds(){
  let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
  for(const mesh of meshes)for(let i=0;i<mesh.geometry.attributes.position.count;i++){
   mesh.getVertexPosition(i,vertex).applyMatrix4(mesh.matrixWorld).project(camera);
   minX=Math.min(minX,vertex.x);maxX=Math.max(maxX,vertex.x);minY=Math.min(minY,vertex.y);maxY=Math.max(maxY,vertex.y);
  }
  return {width:(maxX-minX)*span/2,height:(maxY-minY)*span/2};
 }
 for(const name of Object.keys(clips) as Array<keyof typeof clips>)for(let i=0;i<=24;i++){
  native(name,clips[name].duration*i/24);scene.updateMatrixWorld(true);projectedWidth=Math.max(projectedWidth,projectedBounds().width);
 }
 native('idle',0);scene.updateMatrixWorld(true);bounds.makeEmpty();for(const m of meshes)bounds.expandByObject(m,true);
 const heroBounds=projectedBounds(),pixelsPerUnit=430/projectedWidth,displaySize=span*pixelsPerUnit;
 const renderer=new WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});renderer.setSize(1024,1024,false);renderer.setClearColor(0,0);renderer.outputColorSpace=SRGBColorSpace;renderer.toneMapping=NoToneMapping;
 // The 3D render is uploaded to the scene straight from its own canvas: one copy per frame instead of two.
 const canvas=renderer.domElement;
 const texture=PixiTexture.from(canvas),sprite=new Sprite(texture),display=new Container();display.addChild(sprite);sprite.width=sprite.height=displaySize;
 const floor=new Vector3(0,bounds.min.y,0).project(camera);sprite.anchor.set((floor.x+1)/2,(1-floor.y)/2);
 // Keep an actual skinned vertex at each outer feather tip, rather than a
 // wrist joint. The live vertex follows the native elbow and finger curl.
 native('idle',.45);scene.updateMatrixWorld(true);
 const tipVertices:{mesh:Mesh;index:number}[]=[];const tipExtent=[-Infinity,Infinity];
 for(const mesh of meshes)for(let index=0;index<mesh.geometry.attributes.position.count;index++){
  mesh.getVertexPosition(index,vertex).applyMatrix4(mesh.matrixWorld);
  if(vertex.x>tipExtent[0]){tipExtent[0]=vertex.x;tipVertices[0]={mesh,index};}
  if(vertex.x<tipExtent[1]){tipExtent[1]=vertex.x;tipVertices[1]={mesh,index};}
 }
 const energyPaths=Array.from({length:6},()=>Array.from({length:4},()=>({x:0,y:0})));
 const flowChest={x:0,y:0},chest={worldX:0,worldY:0},energyAnchors=Array.from({length:7},()=>({x:0,y:0}));
 const wingAnchors={left:energyAnchors[2],right:energyAnchors[3]};
 // Retiming complete native cycles retains shoulder/elbow/palm articulation.
 // Downstroke troughs land just after the .20/.75 wing-pressure impulses.
 const diagnostics={source:profile.modelUrl,boneCount:bones.size,sourceClips:gltf.animations.map(c=>({name:c.name,duration:c.duration})),renderSize:1024,standingHeight:heroBounds.height*pixelsPerUnit,maxNativeWidth:projectedWidth*pixelsPerUnit,lastClip:'idle',finite:true};
 const continuity=new SkeletalContinuity([...nodes,flight]);
 let lastRenderKey='';
 function sample(clip:string,time:number,render=true,idlePhase=0,motionClock?:number){
  const t=Math.max(0,time),cacheKey=`${clip}:${t}:${idlePhase}:${motionClock}:${flow.progress.value}:${flowTarget?.x}:${flowTarget?.y}`;flight.position.set(0,.16,0);flight.rotation.set(0,0,0);
  // The hit begins at the actual live idle phase, including time spent waiting.
  if(clip==='react'){native('idle',(idlePhase+t)%clips.idle.duration);const liveIdle=save();blendNative(liveIdle,'roar',.7+.05*ease(t/.55),ease(t/.25));}
  else if(clip==='resist'){native('roar',.75+.35*ease(t/.6));worldRotate('spine_02',new Vector3(0,0,1),Math.sin(t*34)*rad*.8*Math.sin(Math.PI*clamp(t/.6)));}
  else if(clip==='capture')capturePose(t);
  else if(clip==='reform'){
   // Continue directly from the last reconstituted pose into a defiant roar;
   // only then recover into idle. Never restart the folded capture entrance.
   if(t<.3)native('roar',1.1+.4*ease(t/.3));
   else{native('roar',1.5);const roarEnd=save();blendNative(roarEnd,'idle',0,ease((t-.3)/.4));}
  }
  else if(clip==='escape'){
   // Explode from the capture tuck into the native full-width threat pose,
   // recover overhead, then drive one complete wing beat into a stable idle.
   if(t<.26)blendNative(captured,'roar',.9,ease(t/.26));
   else if(t<.52){native('roar',.9);const spread=save();blendNative(spread,'idle',0,ease((t-.26)/.26));}
   else if(t<.76)native('idle',.85*ease((t-.52)/.24));
   else native('idle',.85+(clips.idle.duration-.85)*ease((t-.76)/.24));
   const recoil=Math.sin(Math.PI*clamp(t/.52));
   worldRotate('spine_02',new Vector3(1,0,0),-8*rad*recoil);
   worldRotate('head',new Vector3(1,0,0),6*rad*recoil);
   flight.position.y=.16+.1*recoil;
  }else if(clip==='reject'){
   const threat=ease(t/.13)*(1-ease((t-.42)/.28));
   blendNative(idleStart,'roar',.9+Math.min(t,.7)*.6,threat);
   worldRotate('waist',new Vector3(0,1,0),-7*rad*threat);
   worldRotate('head',new Vector3(0,1,0),10*rad*threat);
   worldRotate('spine_02',new Vector3(1,0,0),-5*rad*threat);
  }else if(clip==='depart'){
   // Poised magician's flourish. Hold this full-body pose for the caller's
   // smoke disappearance: there is deliberately no flight path or fade.
   blendNative(idleStart,'roar',1.35,ease(t/.3));
   worldRotate('head',new Vector3(1,0,0),-6*rad*ease(t/.3));
   flight.position.y=.16-.035*Math.sin(Math.PI*clamp(t/.3));
  }else if(clip==='appear'){
   const p=ease(t/1.6);
   native('idle',arrivalPhase(t,clips.idle.duration)%clips.idle.duration);
   // Banking approach, wing brake, chest recoil, then neutral hover. All
   // offsets reach zero before the continuing native idle takes over.
   const bank=(1-p)*Math.sin(Math.PI*clamp(t/.95));
   flight.rotation.y=-32*rad*(1-p);
   flight.rotation.z=19*rad*bank;
   flight.rotation.x=12*rad*Math.sin(Math.PI*p)*(1-p);
   worldRotate('head',new Vector3(0,1,0),18*rad*(1-p));
   for(let i=2;i<=8;i++)worldRotate(`tail_0${i}`,new Vector3(0,0,1),4*rad*Math.sin(t*4-i*.23)*(1-p));
   flight.position.y=.16+.08*Math.sin(Math.PI*p);
  }else native('idle',t%clips.idle.duration);
  continuity.apply(motionClock);
  // Fully opaque geometry throughout; parent controls energy and trajectory.
  scene.updateMatrixWorld(true);
  const project=(name:string)=>{const p=bones.get(name)!.getWorldPosition(new Vector3()).project(camera);return {x:((p.x+1)/2-sprite.anchor.x)*displaySize,y:((1-p.y)/2-sprite.anchor.y)*displaySize};};
  flow.time.value=t;flow.chest.value.copy(bones.get('spine_02')!.getWorldPosition(new Vector3())).applyMatrix4(camera.matrixWorldInverse);
  if(flowTarget)flow.target.value.set(((flowTarget.x/displaySize+sprite.anchor.x)*2-1)*span/2,(1-(flowTarget.y/displaySize+sprite.anchor.y)*2)*span/2,flow.chest.value.z-.22);
  const source=flow.chest.value,goal=flow.target.value,q=clamp((flow.progress.value-.46)/.54),travel=ease((q-.08)/.92),inv=1-travel;
  const transported=source.clone().multiplyScalar(inv*inv*inv).add(source.clone().add(new Vector3(-.08,.36,0)).multiplyScalar(3*inv*inv*travel)).add(goal.clone().add(new Vector3(-.46,.2,.16)).multiplyScalar(3*inv*travel*travel)).add(goal.clone().multiplyScalar(travel**3));
  const curl=Math.sin(travel*Math.PI)*.055*ease((q-.02)/.32);transported.x+=Math.sin(t*13)*curl;transported.y+=Math.cos(t*9)*curl;
  flowChest.x=((transported.x/(span/2)+1)/2-sprite.anchor.x)*displaySize;flowChest.y=((1-transported.y/(span/2))/2-sprite.anchor.y)*displaySize;
  const p=project('spine_02');chest.worldX=p.x;chest.worldY=p.y;
  ['spine_02','head','left_hand','right_hand','left_foot','tail_06','right_foot'].forEach((name,i)=>Object.assign(energyAnchors[i],project(name)));
  tipVertices.forEach(({mesh,index},side)=>{
   mesh.getVertexPosition(index,vertex).applyMatrix4(mesh.matrixWorld).project(camera);
   Object.assign(energyAnchors[2+side],{x:((vertex.x+1)/2-sprite.anchor.x)*displaySize,y:((1-vertex.y)/2-sprite.anchor.y)*displaySize});
  });
  const pathNames=[['spine_02','neck_02','head','jaw_01'],['spine_02','left_shoulder','left_arm_02','left_hand'],['spine_02','right_shoulder','right_arm_02','right_hand'],['spine_02','hips','left_leg_02','left_foot'],['spine_02','hips','tail_04','tail_09'],['spine_02','hips','right_leg_02','right_foot']];
  pathNames.forEach((names,i)=>names.forEach((name,j)=>Object.assign(energyPaths[i][j],project(name))));
  Object.assign(energyPaths[1][3],energyAnchors[2]);Object.assign(energyPaths[2][3],energyAnchors[3]);
  diagnostics.lastClip=clip;diagnostics.finite=nodes.every(o=>o.matrixWorld.elements.every(Number.isFinite));if(!diagnostics.finite)throw Error(`Nonfinite Lugia pose ${clip}@${t}`);
  if(render&&lastRenderKey!==cacheKey){renderer.render(scene,camera);texture.source.update();lastRenderKey=cacheKey;}
 }
 sample('idle',0);
 return {display,sprite,texture,displaySize,sample,setCaptureFlow(progress:number,target:{x:number;y:number}|null){flow.progress.value=clamp(progress);flowTarget=target;},flowChest,chest,energyAnchors,energyPaths,wingAnchors,diagnostics,dispose(){mixer.stopAllAction();mixer.uncacheRoot(model);display.destroy({children:true});texture.destroy(true);for(const m of materials)m.dispose();for(const m of originalMaterials)m.dispose();for(const o of outlines)(o.material as Material).dispose();for(const g of new Set(meshes.map(m=>m.geometry)))g.dispose();gradient.dispose();renderer.dispose();renderer.forceContextLoss();}};
}
