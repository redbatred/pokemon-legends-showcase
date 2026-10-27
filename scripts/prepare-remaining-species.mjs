// Rebuild the 17 previously missing species from the pinned acquisitions in source-assets.
// POKEMON_ASSET_TOOLS points to a directory with glTF-Transform 4.3 and draco3dgltf.
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {Matrix4,Quaternion,Vector3,Euler} from 'three';
const req=createRequire((process.env.POKEMON_ASSET_TOOLS||'/tmp/pokemon-gltf-opt-tools')+'/package.json');
const {NodeIO}=await import(req.resolve('@gltf-transform/core'));
const {ALL_EXTENSIONS}=await import(req.resolve('@gltf-transform/extensions'));
const draco3d=req('draco3dgltf');
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'draco3d.decoder':await draco3d.createDecoderModule()});
const dir='source-assets/pokemon-3d-remaining',out='public/assets/pokemon-3d';
const acquired=JSON.parse(await fs.readFile(dir+'/acquisition.json')),homes=JSON.parse(await fs.readFile(dir+'/home-acquisition.json'));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const v3=a=>new Vector3(...a),m4=a=>new Matrix4().fromArray(a),mat4Safe=a=>new Matrix4().fromArray(a),rad=Math.PI/180;
const normal=n=>n.toLowerCase().replace(/_\d+$/,'').replaceAll('_','');
const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x)};
const hump=(t,a,b,c,d)=>ease((t-a)/(b-a))*(1-ease((t-c)/(d-c)));
function points(doc,withWeights=false){
 const rows=[];
 for(const node of doc.getRoot().listNodes()){
  if(!node.getMesh()||/CusAnimVis/.test(node.getName()))continue;
  const skin=node.getSkin(),joints=skin?.listJoints();
  const matrices=skin?joints.map((j,i)=>m4(j.getWorldMatrix()).multiply(m4(Array.from(skin.getInverseBindMatrices().getArray().slice(i*16,i*16+16))))):null;
  for(const p of node.getMesh().listPrimitives()){
   const ps=p.getAttribute('POSITION'),js=p.getAttribute('JOINTS_0'),ws=p.getAttribute('WEIGHTS_0');
   for(let i=0;i<ps.getCount();i++){
    const a=ps.getElement(i,[]);let world;
    if(skin&&js&&ws){const ids=js.getElement(i,[]),weights=ws.getElement(i,[]);world=new Vector3();for(let k=0;k<4;k++)world.add(v3(a).applyMatrix4(matrices[ids[k]]).multiplyScalar(weights[k]));rows.push({point:world.toArray(),joints:ids.map(k=>joints[k]),weights});}
    else{world=v3(a).applyMatrix4(m4(node.getWorldMatrix()));rows.push({point:world.toArray()});}
   }
  }
 }
 return rows;
}
function box(rows){const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];for(const r of rows)for(let a=0;a<3;a++){min[a]=Math.min(min[a],r.point[a]);max[a]=Math.max(max[a],r.point[a])}return{min,max,size:max.map((v,i)=>v-min[i]),center:max.map((v,i)=>(v+min[i])/2)}}
function rigTransfer(target,donor){
 const targetRows=points(target),sourceRows=points(donor,true).filter(r=>r.joints),tb=box(targetRows),sb=box(sourceRows);
 const scale=tb.size.map((s,i)=>s/sb.size[i]),offset=tb.min.map((v,i)=>v-sb.min[i]*scale[i]);
 const wrapper=target.createNode('ensemble_transferred_rig').setScale(scale).setTranslation(offset);target.getRoot().listScenes()[0].addChild(wrapper);
 const donorJoints=new Set(donor.getRoot().listSkins().flatMap(s=>s.listJoints())),needed=new Set();
 for(const j of donorJoints){let n=j;while(n){needed.add(n);n=n.getParentNode()}}
 const map=new Map();
 for(const n of needed)map.set(n,target.createNode(n.getName()).setTranslation(n.getTranslation()).setRotation(n.getRotation()).setScale(n.getScale()));
 for(const [n,c] of map){const parent=n.getParentNode();(map.get(parent)||wrapper).addChild(c)}
 const joints=[...donorJoints],jointIds=new Map(joints.map((j,i)=>[j,i]));
 const donors=sourceRows.map(r=>({...r,point:r.point.map((v,i)=>v*scale[i]+offset[i])}));
 const buffer=target.getRoot().listBuffers()[0]||target.createBuffer();let errorSum=0,count=0,maxError=0;
 for(const n of target.getRoot().listNodes().filter(n=>n.getMesh())){
  const meshWorld=m4(n.getWorldMatrix()),skin=target.createSkin('ensemble_transferred_skin_'+n.getName());
  for(const j of joints)skin.addJoint(map.get(j));
  const inverse=joints.flatMap(j=>m4(map.get(j).getWorldMatrix()).invert().multiply(meshWorld).toArray());
  skin.setInverseBindMatrices(target.createAccessor().setType('MAT4').setArray(new Float32Array(inverse)).setBuffer(buffer));n.setSkin(skin);
  for(const p of n.getMesh().listPrimitives()){
   const positions=p.getAttribute('POSITION'),ids=[],weights=[];
   for(let i=0;i<positions.getCount();i++){
    const a=v3(positions.getElement(i,[])).applyMatrix4(meshWorld).toArray();let best=Infinity,nearest;
    const closest=[];
    for(const d of donors){const dist=(a[0]-d.point[0])**2+(a[1]-d.point[1])**2+(a[2]-d.point[2])**2;if(dist<best){best=dist;nearest=d}if(closest.length<8||dist<closest[7][0]){closest.push([dist,d]);closest.sort((x,y)=>x[0]-y[0]);closest.length=Math.min(closest.length,8)}}
    const merged=new Map();for(const [distance,donorVertex] of closest){const influence=1/Math.max(distance,1e-8);for(let k=0;k<4;k++){const jid=jointIds.get(donorVertex.joints[k]);merged.set(jid,(merged.get(jid)||0)+donorVertex.weights[k]*influence)}}
    const top=[...merged].sort((a,b)=>b[1]-a[1]).slice(0,4),sum=top.reduce((s,p)=>s+p[1],0);while(top.length<4)top.push([0,0]);
    ids.push(...top.map(p=>p[0]));weights.push(...top.map(p=>p[1]/sum));errorSum+=best;maxError=Math.max(maxError,Math.sqrt(best));count++;
   }
   p.setAttribute('JOINTS_0',target.createAccessor().setType('VEC4').setArray(new Uint16Array(ids)).setBuffer(buffer));
   p.setAttribute('WEIGHTS_0',target.createAccessor().setType('VEC4').setArray(new Float32Array(weights)).setBuffer(buffer));
  }
 }
 return{method:'Source anatomical skeleton and eight-neighbor interpolated rest-surface skin weights transferred from HOME to the textured source mesh; target positions, UVs, indices, normals and encoded textures retained.',donorJointCount:joints.length,donorToTargetScale:scale,donorToTargetTranslation:offset,nearestSurfaceRms:Math.sqrt(errorSum/count),nearestSurfaceMax:maxError,targetVertexCount:count};
}
const profiles={
 arceus:{form:'judgment',description:'Foreleg brace, raised neck, head-directed Judgment pulse and tail settle.',sockets:['Head']},
 breloom:{form:'seed-bomb',description:'Rooted rear legs, shoulder windup, right arm seed-punch thrust, head follow-through and tail counterbalance.',sockets:['RHand']},
 cinderace:{form:'pyro-ball',description:'Arms balance a right thigh lift, knee fold, foot strike and controlled leg recovery.',sockets:['RFoot']},
 cleffa:{form:'fairy-pulse',description:'Small-foot brace, raised arms and ears, forward head pulse and soft settle.',sockets:['Head']},
 forretress:{form:'shell-cannon',description:'Upper and lower shell joints open in opposition while the four cannon limbs brace and recoil.',sockets:['LHandA','RHandA']},
 gardevoir:{form:'psychic-palm-wave',description:'Paired shoulder and elbow lift from lowered arms, palm projection, neck counterbalance and skirt follow-through.',sockets:['LHand','RHand']},
 genesect:{form:'techno-blast',description:'Leg brace and torso dip position the dorsal cannon, which pitches and recoils independently of the head.',sockets:['FeelerD']},
 giratina:{form:'shadow-pulse',description:'Six legs brace, upper neck lowers toward the target, jaw opens and wing tendrils sweep.',sockets:['Head']},
 kyogre:{form:'hydro-pump',description:'Pectoral fins flare, head braces and jaw opens for a forward water jet; tail chain counterbalances.',sockets:['Head_043']},
 clodsire:{form:'sludge-bomb',description:'Four short limbs brace, back horns rise with the spine, head and lower jaw deliver a sludge pulse.',sockets:['head_23']},
 raikou:{form:'thunderbolt',description:'Four-paw brace, neck thrust, open jaw, mane ripple and tail recoil.',sockets:['Head']},
 rayquaza:{form:'dragon-pulse',description:'Curved tail wave supports a raised head, forearm spread, neck thrust and jaw release.',sockets:['Head']},
 rotom:{form:'electric-pulse',description:'Both electrical arms sweep inward to charge, then fan outward while the tail ripples.',sockets:['LHand','RHand']},
 suicune:{form:'water-pulse',description:'Four-paw brace, raised neck and jaw release with mane and ribbon tail follow-through.',sockets:['Head']},
 sylveon:{form:'fairy-pulse',description:'Forepaws brace, head tilts, ears lift and four ribbon chains swing softly through the pulse.',sockets:['Head']},
 trevenant:{form:'spectral-roots',description:'Six root legs brace, branch arms draw back and sweep toward the target with wrist/finger follow-through.',sockets:['LHand','RHand']},
 tyranitar:{form:'dark-pulse',description:'Thigh brace, torso windup, neck thrust and open jaw; the heavy tail offsets the forward release.',sockets:['Head']}
};
function motion(slug,n,t,kind){
 const name=normal(n.getName()),left=/^(l(?!ower)|left)/.test(name),side=left?1:-1;
 const tail=/tail/.test(name),tailN=Number(name.match(/\d+/)?.[0]||1),spine=/^spine/.test(name),head=/^head/.test(name),neck=/^neck/.test(name);
 const arm=/^(larm|rarm|leftarm|rightarm)$/.test(name),forearm=/forearm/.test(name),thigh=/thigh|crotch/.test(name),leg=/^(lleg|rleg|leftleg|rightleg)\d*$/.test(name),hand=/^(lhand|rhand|lefthand|righthand)/.test(name),jaw=/^(jaw|lowerjaw)/.test(name),ear=/ear/.test(name),hair=/hair/.test(name),feeler=/feeler/.test(name);
 let x=0,y=0,z=0;
 // A lowered arm rest stance replaces source T poses through animation only.
 if(arm&&['cinderace','gardevoir','trevenant','tyranitar','genesect'].includes(slug))z+=-side*({cinderace:60,gardevoir:64,trevenant:22,tyranitar:20,genesect:22}[slug]);
 if(slug==='rayquaza'&&tail){y+=7+Math.sin(tailN*.45)*3;x+=Math.sin(tailN*.4)*3}
 if(slug==='sylveon'&&/feeler[bch]\d/.test(name)){z+=-side*(tailN===1?20:2);y+=side*3}
 if(slug==='suicune'&&tail){y+=side*3;x+=Math.sin(tailN*.32)*2}
 const idle=kind==='idle',enter=kind==='enter';
 const wave=Math.sin(t/2.4*Math.PI*2),smooth=idle?wave:0;
 if(spine)x+=smooth*.7;
 if(neck||head)x+=smooth*.8;
 if(tail)y+=idle?Math.sin(t/2.4*Math.PI*2-tailN*.35)*2*Math.sin(t/2.4*Math.PI)**2:0;
 if(ear||hair||feeler)z+=idle?Math.sin(t/2.4*Math.PI*2+tailN*.5)*.75*side*Math.sin(t/2.4*Math.PI)**2:0;
 if(arm||forearm)z+=smooth*.6*side;
 if(idle)return[x,y,z];
 const charge=enter?hump(t,0,.17,.34,.72):hump(t,0,.46,.57,.8);
 const fire=enter?0:hump(t,.56,.76,1.24,1.6);
 const recoil=enter?0:hump(t,.78,.89,1.02,1.36);
 const settle=enter?hump(t,.26,.38,.4,.72):hump(t,1.42,1.58,1.68,2);
 if(spine){x+=charge*5-fire*4+recoil*2+settle*1.5;y+=slug==='breloom'?charge*-6+fire*6:0}
 if(neck)x+=charge*-5+fire*3;
 if(head)x+=charge*-5+fire*3+recoil*2;
 if(thigh)x+=charge*7-fire*3+settle*5;
 if(leg)x-=charge*8+settle*5;
 if(arm)x+=charge*5-fire*8+settle*3;
 if(forearm)x-=charge*5-fire*5;
 if(jaw)x+=fire*10;
 if(tail)y+=(charge*-2+fire*2.5+settle*.8)*Math.sin(tailN*.4+1);
 if(hair||ear)z+=(charge*2+fire*-3+settle)*side;
 if(['giratina','sylveon'].includes(slug)&&feeler)z+=(charge*2-fire*3+settle)*side;
 if(slug==='gardevoir'){
  if(arm){x+=charge*-20+fire*-54;z+=side*(charge*10+fire*18)}
  if(forearm){x+=charge*-18+fire*-12;y+=side*(charge*-10+fire*-8)}
  if(hand)x+=fire*8;
 }
 if(slug==='cinderace'){
  if(/^rthigh$/.test(name))x+=charge*-35+fire*-55;
  if(/^rleg$/.test(name))x+=charge*55+fire*9;
  if(/^rfoot$/.test(name))x+=charge*5+fire*-16;
  if(arm){z+=side*(charge*12+fire*18);y+=side*(charge*12-fire*5)}
  if(/^hips$/.test(name))y+=charge*-6+fire*8;
 }
 if(slug==='breloom'){
  if(/^rarm$/.test(name)){y+=charge*-20+fire*62;z+=charge*10+fire*-5}
  if(/^rhand$/.test(name))y+=charge*10-fire*12;
  if(/^larm$/.test(name))y+=charge*18-fire*10;
 }
 if(slug==='forretress'){
  if(name==='upperspine')x+=charge*-4+fire*-9;
  if(name==='lowerspine')x+=charge*4+fire*9;
  if(hand){y+=side*(charge*7-fire*5);x+=recoil*6}
  if(feeler)z+=side*(charge*2-fire*3);
 }
 if(slug==='kyogre'&&(arm||forearm)){z+=side*(charge*12-fire*18+recoil*4)}
 if(slug==='genesect'&&/^feelera[12]$/.test(name))x+=charge*-8+fire*6+recoil*3;
 if(slug==='rotom'&&(arm||hand)){z+=side*(charge*22-fire*25);y+=side*fire*12}
 if(slug==='trevenant'&&arm){y+=side*(charge*12-fire*35);x+=fire*-12}
 if(slug==='cleffa'&&arm)z+=side*(charge*12+fire*22);
 if(slug==='rayquaza'&&tail){y+=(charge*2-fire*2)*Math.cos(tailN*.3);x+=Math.sin(tailN*.35)*fire*1.5}
 if(slug==='clodsire'&&/horn/.test(name))x+=charge*-7+fire*9;
 return[x,y,z];
}
function buildAnimations(doc,slug){
 const joints=[...new Set(doc.getRoot().listSkins().flatMap(s=>s.listJoints()))],buffer=doc.getRoot().listBuffers()[0];
 const rests=new Map(joints.map(n=>[n,{q:new Quaternion(...n.getRotation()),parent:n.getParentNode()?new Quaternion(...n.getParentNode().getWorldRotation()):new Quaternion()}]));
 const clips=[];
 for(const [kind,duration] of [['idle',2.4],['enter',.72],['attack',2]]){
  const times=Array.from({length:Math.round(duration*60)+1},(_,i)=>duration*i/Math.round(duration*60));
  const input=doc.createAccessor().setType('SCALAR').setArray(new Float32Array(times)).setBuffer(buffer);
  const animation=doc.createAnimation('ensemble_'+kind).setExtras({authored:true,originalSourceClip:false,method:'Anatomical joint rotation keyframes; no whole-model transform animation or mesh deformation targets.'});
  let moving=0;
  for(const n of joints){
   const {q,parent}=rests.get(n);const values=times.flatMap(t=>{const angles=motion(slug,n,t,kind).map(v=>v*rad);const world=new Quaternion().setFromEuler(new Euler(...angles,'XYZ'));return parent.clone().invert().multiply(world).multiply(parent).multiply(q).normalize().toArray()});
   const changing=values.some((v,i)=>Math.abs(v-values[i%4])>1e-7),baseChanged=values.slice(0,4).some((v,i)=>Math.abs(v-q.toArray()[i])>1e-7);
   if(!changing&&!baseChanged)continue;
   const output=doc.createAccessor().setType('VEC4').setArray(new Float32Array(values)).setBuffer(buffer),sampler=doc.createAnimationSampler().setInput(input).setOutput(output).setInterpolation('LINEAR');
   animation.addSampler(sampler).addChannel(doc.createAnimationChannel().setTargetNode(n).setTargetPath('rotation').setSampler(sampler));if(changing)moving++;
  }
  clips.push({name:animation.getName(),duration,channels:animation.listChannels().length,varyingSkinnedJointChannels:moving,movingSkinnedJointCount:moving,authored:true});
 }
 return clips;
}
const fragment={generatedAt:new Date().toISOString(),description:'17 animated species assets. Source meshes/textures are acquired assets; ensemble_* clips are newly authored skeletal animation, not official/native animation.',manifest:{},provenance:{},powerCues:{},unavailable:[]};
for(const entry of acquired){
 const slug=entry.slug,doc=await io.read(`${dir}/${slug}.glb`),sourceTextures=doc.getRoot().listTextures().map(t=>hash(t.getImage()));
 for(const e of doc.getRoot().listExtensionsUsed())if(e.extensionName==='KHR_draco_mesh_compression')e.dispose();
 let canonicalWrapper=null;
 if(slug==='breloom'){
  const mesh=doc.getRoot().listNodes().find(n=>n.getMesh()),scene=doc.getRoot().listScenes()[0],roots=[...scene.listChildren()];
  const originalWorld=mat4Safe(mesh.getWorldMatrix()),originalRotation=new Quaternion(...mesh.getWorldRotation());
  const rotation=new Quaternion().setFromAxisAngle(new Vector3(1,0,0),-Math.PI/2).multiply(originalRotation.invert());
  const primitive=mesh.getMesh().listPrimitives()[0],min=primitive.getAttribute('POSITION').getMin([]),max=primitive.getAttribute('POSITION').getMax([]);
  const sourceScale=new Vector3().setFromMatrixScale(originalWorld),scale=1.4/((max[2]-min[2])*sourceScale.z);
  const offset=new Vector3().setFromMatrixPosition(originalWorld).applyQuaternion(rotation).multiplyScalar(-scale);
  const wrapper=doc.createNode('ensemble_canonical_asset_space').setRotation(rotation.toArray()).setScale([scale,scale,scale]).setTranslation(offset.toArray());
  for(const n of roots){scene.removeChild(n);wrapper.addChild(n)}scene.addChild(wrapper);
  canonicalWrapper={reason:'The source fan-art mesh uses Z-up local coordinates, a tilted Sketchfab presentation and world units thousands of times larger than the other characters. A parent transform canonicalizes its local -Y forward/+Z up basis to +Z forward/+Y up and a 1.4-unit height before rig transfer; source vertex/normal/UV/index buffers and original nodes remain unchanged.',rotation:rotation.toArray(),scale,translation:offset.toArray()};
 }
 let transfer=null;const home=homes.find(h=>h.slug===slug);
 if(home)transfer=rigTransfer(doc,await io.read(`${dir}/${slug}-home.glb`));
 const clips=buildAnimations(doc,slug),raw=await io.writeBinary(doc);await fs.writeFile(`${out}/${slug}.glb`,raw);
 const reopened=await io.read(`${out}/${slug}.glb`);if(JSON.stringify(reopened.getRoot().listTextures().map(t=>hash(t.getImage())))!==JSON.stringify(sourceTextures))throw Error(slug+' textures changed');
 if(clips.some(c=>c.movingSkinnedJointCount<3))throw Error(slug+' insufficient moving joints');
 fragment.manifest[slug]={name:entry.name,dexId:entry.dexId,path:`/assets/pokemon-3d/${slug}.glb`,bytes:raw.length,extensionsRequired:reopened.getRoot().listExtensionsRequired().map(e=>e.extensionName),clips,idle:'ensemble_idle',attack:'ensemble_attack',enter:'ensemble_enter',enterStart:0,enterEnd:.72,enterSpeed:1,attackTimeScale:1,powerAt:.76,powerPeakAt:1,powerWindow:[.76,1.5],orientation:{up:'+Y',forward:'+Z'},notes:['ensemble_idle, ensemble_enter and ensemble_attack are authored anatomical skeletal clips, not source/native game animation.',profiles[slug].description],optimization:{sourceBytes:entry.bytes,sha256:hash(raw),authoredAnimation:true}};
 fragment.provenance[slug]={name:entry.name,dexId:entry.dexId,localPath:`/assets/pokemon-3d/${slug}.glb`,sourceGlb:entry.url,sourceSha256:entry.sourceSha256,sourceByteLength:entry.bytes,sha256:hash(raw),byteLength:raw.length,originalPath:`${dir}/${slug}.glb`,sourceClips:[],remainingClips:clips.map(c=>c.name),authoredAnimation:{clips:clips.map(c=>c.name),method:'60 Hz eased bone-local quaternion keyframes, calculated from anatomical joint names and source rest-space world axes.',nativeAnimation:false,description:profiles[slug].description,rootMotion:false,poseRecovery:'Entrance end, idle start, attack start and attack end have matching authored rest pose.'},canonicalWrapper,rigTransfer:transfer?{...transfer,donorUrl:home.url,donorSha256:home.sourceSha256}:null,validation:{decodes:true,sourceEncodedTexturesIdentical:true,movingJointCounts:Object.fromEntries(clips.map(c=>[c.name,c.movingSkinnedJointCount]))},embeddedUpstreamAttribution:entry.extras.extras||null};
 fragment.powerCues[slug]={form:profiles[slug].form,seek:0,speed:1,powerAt:.76,sustainEnd:1.35,end:1.5,recoverAt:2,recoveryEnd:2,recoverySpeed:1,attackClip:'ensemble_attack',chargeDuration:.76,attachment:['breloom','cinderace','clodsire'].includes(slug)?'capture-at-release':'continuous',socketSampleTime:.9,sourceGlbSha256:hash(raw),emitterBoneNames:profiles[slug].sockets,timeUnits:'source clip seconds; authored clip runs at speed 1',coordinateUnits:'tip and forward are absolute points in named bone-local space',evidence:'Newly authored action; timing is an authored envelope, not extracted game event metadata.',sources:[entry.url,...(home?[home.url]:[])]};
 console.log(slug,raw.length,clips.map(c=>c.movingSkinnedJointCount).join('/'),transfer?'transferred':'source-rig');
}
await fs.writeFile('docs/research/remaining-species-assets.json',JSON.stringify(fragment,null,2)+'\n');
