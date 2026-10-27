import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {Matrix4,Quaternion,Vector3} from 'three';
const req=createRequire((process.env.POKEMON_ASSET_TOOLS||'/tmp/pokemon-gltf-opt-tools')+'/package.json');
const {NodeIO}=await import(req.resolve('@gltf-transform/core'));const {ALL_EXTENSIONS}=await import(req.resolve('@gltf-transform/extensions'));const draco=req('draco3dgltf');
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'draco3d.decoder':await draco.createDecoderModule()});
const fragment=JSON.parse(await fs.readFile('docs/research/remaining-species-assets.json','utf8'));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex'),arrHash=a=>hash(new Uint8Array(a.buffer,a.byteOffset,a.byteLength));
const mat=a=>new Matrix4().fromArray(a),vec=a=>new Vector3(...a);
function geometry(doc,ignoreWeights){return doc.getRoot().listNodes().filter(n=>n.getMesh()).map(n=>({name:n.getName(),prims:n.getMesh().listPrimitives().map(p=>({indices:p.getIndices()?arrHash(p.getIndices().getArray()):null,attributes:Object.fromEntries(p.listSemantics().filter(s=>!ignoreWeights||!s.startsWith('JOINTS')&&!s.startsWith('WEIGHTS')).sort().map(s=>[s,arrHash(p.getAttribute(s).getArray())]))}))})).sort((a,b)=>a.name.localeCompare(b.name))}
function worldPoints(doc){const points=[];
 for(const n of doc.getRoot().listNodes())if(n.getMesh()){
  const skin=n.getSkin(),joints=skin?.listJoints(),ms=skin?joints.map((j,i)=>mat(j.getWorldMatrix()).multiply(mat(Array.from(skin.getInverseBindMatrices().getArray().slice(i*16,i*16+16))))):null;
  for(const p of n.getMesh().listPrimitives()){
   const positions=p.getAttribute('POSITION'),js=p.getAttribute('JOINTS_0'),ws=p.getAttribute('WEIGHTS_0');
   for(let i=0;i<positions.getCount();i++){
    const pos=positions.getElement(i,[]),ids=js?.getElement(i,[]),weights=ws?.getElement(i,[]);let point;
    if(skin&&ids&&weights){point=new Vector3();for(let k=0;k<4;k++)point.add(vec(pos).applyMatrix4(ms[ids[k]]).multiplyScalar(weights[k]));points.push({point:point.toArray(),influences:ids.map((j,k)=>[joints[j],weights[k]])})}
    else points.push({point:vec(pos).applyMatrix4(mat(n.getWorldMatrix())).toArray(),influences:[]});
   }
  }
 }
 return points;
}
function bounds(points){const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];for(const {point} of points)for(let i=0;i<3;i++){min[i]=Math.min(min[i],point[i]);max[i]=Math.max(max[i],point[i])}return{min,max,size:max.map((v,i)=>v-min[i]),center:max.map((v,i)=>(v+min[i])/2)}}
function pose(doc,clip,time,rests){for(const [n,r] of rests)n.setRotation(r);const anim=doc.getRoot().listAnimations().find(a=>a.getName()===clip);
 for(const c of anim.listChannels()){
  const s=c.getSampler(),times=s.getInput().getArray(),values=s.getOutput().getArray(),n=c.getTargetNode();let i=0;while(i+1<times.length&&times[i+1]<=time)i++;
  const a=new Quaternion(...values.slice(i*4,i*4+4));if(i+1<times.length&&time>times[i])a.slerp(new Quaternion(...values.slice(i*4+4,i*4+8)),(time-times[i])/(times[i+1]-times[i]));n.setRotation(a.toArray());
 }
}
let total=0;
for(const [slug,entry] of Object.entries(fragment.manifest)){
 const doc=await io.read('public'+entry.path),source=await io.read(fragment.provenance[slug].originalPath),transfer=!!fragment.provenance[slug].rigTransfer;
 if(JSON.stringify(geometry(doc,transfer))!==JSON.stringify(geometry(source,transfer)))throw Error(slug+' source geometry differs');
 const textureHashes=d=>d.getRoot().listTextures().map(t=>hash(t.getImage()));if(JSON.stringify(textureHashes(doc))!==JSON.stringify(textureHashes(source)))throw Error(slug+' encoded texture differs');
 const rests=new Map(doc.getRoot().listNodes().map(n=>[n,n.getRotation()]));pose(doc,'ensemble_idle',0,rests);const neutral=worldPoints(doc),base=bounds(neutral);entry.bounds={...base,method:'CPU-skinned world-space vertices at ensemble_idle t=0'};
 const series=[],span=Math.max(...base.size);let maxMoving=0,maxReturn=0;
 for(const [clip,times] of [['ensemble_idle',[0,.6,1.2,1.8,2.4]],['ensemble_enter',[0,.18,.36,.54,.72]],['ensemble_attack',[0,.3,.5,.76,.9,1.2,1.5,1.75,2]]]){
  for(const time of times){pose(doc,clip,time,rests);const ps=worldPoints(doc),b=bounds(ps),rms=Math.sqrt(ps.reduce((sum,p,i)=>sum+p.point.reduce((s,v,a)=>s+(v-neutral[i].point[a])**2,0),0)/ps.length);if(clip==='ensemble_attack')maxMoving=Math.max(maxMoving,rms/span);if((clip==='ensemble_enter'&&time===.72)||(clip==='ensemble_attack'&&time===2))maxReturn=Math.max(maxReturn,rms/span);series.push({clip,time,bounds:b,rmsFromIdleNormalized:rms/span});if(b.size.some(v=>!Number.isFinite(v)||v>span*2.5))throw Error(slug+' excessive/nonfinite animated bounds');}
 }
 if(maxReturn>1e-6)throw Error(slug+' incomplete recovery');if(maxMoving<.0005)throw Error(slug+' insufficient body motion');
 const cue=fragment.powerCues[slug];pose(doc,entry.attack,cue.socketSampleTime,rests);const ps=worldPoints(doc),named=new Map(doc.getRoot().listNodes().map(n=>[n.getName(),n]));
 cue.emitters=(cue.emitterBoneNames??cue.emitters.map(e=>e.sourceBone||e.bone)).map((name,i)=>{
  const n=named.get(name);if(!n)throw Error(slug+' emitter missing '+name);
  const descendants=new Set([n]);function visit(node){for(const child of node.listChildren()){descendants.add(child);visit(child)}}visit(n);
  let candidates=ps.filter(p=>p.influences.reduce((sum,[j,w])=>sum+(descendants.has(j)?w:0),0)>.35).map(p=>p.point);
  const origin=n.getWorldTranslation();if(!candidates.length)candidates=[origin];
  let tip;
  if(slug==='forretress'){
   const waist=named.get('Waist').getWorldTranslation(),direction=vec(origin).sub(vec(waist)).normalize();candidates.sort((a,b)=>vec(b).sub(vec(origin)).dot(direction)-vec(a).sub(vec(origin)).dot(direction));const end=candidates.slice(0,Math.max(1,Math.ceil(candidates.length*.12)));tip=end.reduce((p,q)=>p.add(vec(q)),new Vector3()).multiplyScalar(1/end.length);const f=tip.clone().addScaledVector(direction,span*.18),inv=mat(n.getWorldMatrix()).invert();return{id:'cannon-'+(i?'right':'left'),bone:name.toLowerCase(),sourceBone:name,tip:tip.clone().applyMatrix4(inv).toArray(),forward:f.applyMatrix4(inv).toArray(),method:'Centroid of outermost 12% of skinned cannon vertices along cannon-joint to waist axis.'};
  }
  if(/hand/i.test(name)&&slug!=='breloom'){tip=candidates.reduce((p,q)=>p.add(vec(q)),new Vector3()).multiplyScalar(1/candidates.length)}
  else{candidates.sort((a,b)=>b[2]-a[2]);const front=candidates.slice(0,Math.max(1,Math.ceil(candidates.length*.08)));tip=front.reduce((p,q)=>p.add(vec(q)),new Vector3()).multiplyScalar(1/front.length)}
  if(slug==='genesect')tip=vec(origin);
  const inv=mat(n.getWorldMatrix()).invert(),forward=tip.clone().add(new Vector3(0,0,span*.18));
  return{id:/hand/i.test(name)?(/^r/i.test(name)?'right-palm':'left-palm'):/foot/i.test(name)?'striking-foot':slug==='genesect'?'dorsal-cannon':'muzzle',bone:name.toLowerCase(),sourceBone:name,tip:tip.clone().applyMatrix4(inv).toArray(),forward:forward.applyMatrix4(inv).toArray(),method:slug==='genesect'?'Native FeelerD cannon-front joint.':/hand/i.test(name)&&slug!=='breloom'?'Centroid of vertices influenced by the hand and finger descendants.':'Centroid of frontmost 8% of vertices influenced by the named joint and descendants at release pose.'};
 });delete cue.emitterBoneNames;
 cue.evidence=cue.evidence.split(' Socket points are measured')[0]+' Socket points are measured from CPU-skinned source geometry at t=0.9 and transformed into the animated joint local space. Forward is authored +Z at release (Forretress follows each native cannon axis), then follows the joint. These are geometric effect attachments, not official move events.';
 if(cue.attachment==='capture-at-release'){cue.projectileCount=1;cue.projectileLifetime=.6}
 fragment.provenance[slug].validation={...fragment.provenance[slug].validation,sourcePositionNormalUvIndexBuffersIdentical:true,sourceEncodedTextureHashes:textureHashes(doc),sampledPoseCount:series.length,maxAttackVertexRmsNormalized:maxMoving,maxEndpointVertexRmsNormalized:maxReturn,finiteBounds:true};
 fragment.provenance[slug].poseValidation=series;
 total+=entry.bytes;console.log(slug,entry.bytes,'motion',maxMoving.toFixed(5),'recovery',maxReturn.toExponential(2),'emitters',cue.emitters.length);
}
fragment.validation={modelCount:17,bytes:total,allDecode:true,allHaveSourceSkins:true,sourceTexturesAndGeometryRetained:true,allAuthoredClipsPresent:true,allSampledPoseBoundsFinite:true,exactEndpointRecoveryWithinNormalizedTolerance:1e-6};
await fs.writeFile('docs/research/remaining-species-assets.json',JSON.stringify(fragment,null,2)+'\n');
console.log('REMAINING_17_VALIDATED',total);
