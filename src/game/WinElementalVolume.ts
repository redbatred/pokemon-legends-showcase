import {Color,CylinderGeometry,DynamicDrawUsage,Group,IcosahedronGeometry,InstancedBufferAttribute,InstancedMesh,LatheGeometry,Matrix4,Mesh,Object3D,ShaderMaterial,TorusGeometry,Vector2,Vector3,type BufferGeometry,type PerspectiveCamera} from 'three';
import {elementalBeat,elementalPath,type ElementalSocket} from './elementalPerformance';
import {smooth} from './winCinemaMotion';
import type {CinemaTier} from './winChoreography';
import type {PowerKind} from './powerProfiles';
const Y=new Vector3(0,1,0);
const seed=(i:number)=>{const n=Math.sin(i*127.1+311.7)*43758.5453;return n-Math.floor(n);};
/** Native 3D flame tongues / water jets, not a billboard or a translucent tube.
 * Every surface has depth, a moving silhouette, and stylized face shading matching the actor.
 * Fixed instanced pools keep the whole elemental performance to four fire or five water mesh draw calls. */
export class WinElementalVolume{
 readonly root=new Group();private body:InstancedMesh;private spray:InstancedMesh;private crown:InstancedMesh;private rings:InstancedMesh;
 private waterJets:Mesh<CylinderGeometry,ShaderMaterial>[]=[];private materials:ShaderMaterial[]=[];private geometries:BufferGeometry[]=[];
 private dummy=new Object3D();private point=new Vector3();private tangent=new Vector3();private right=new Vector3();private up=new Vector3();private offset=new Vector3();
 private fire:boolean;private bodyCount:number;private sprayCount:number;private crownCount:number;
 constructor(private tier:CinemaTier,kind:PowerKind,color:number,low:boolean){
  this.fire=kind==='fire';this.bodyCount=low?48:88;this.sprayCount=low?32:64;this.crownCount=low?16:26;
  const flame=new LatheGeometry([new Vector2(0,0),new Vector2(.28,.04),new Vector2(.48,.22),new Vector2(.38,.48),new Vector2(.22,.78),new Vector2(.085,1.06),new Vector2(0,1.35)],9);
  const water=new LatheGeometry([new Vector2(0,-.55),new Vector2(.18,-.48),new Vector2(.34,-.18),new Vector2(.32,.20),new Vector2(.16,.58),new Vector2(0,.95)],10);
  const droplet=new IcosahedronGeometry(1,1),ring=new TorusGeometry(1,.032,5,48);this.geometries.push(flame,water,droplet,ring);
  const surface=this.material(color,false),small=this.material(color,true);this.materials.push(surface,small);
  this.body=this.pool(this.fire?flame:water,surface,this.bodyCount);
  this.spray=this.pool(this.fire?flame:droplet,small,this.sprayCount);
  this.crown=this.pool(this.fire?flame:water,surface,this.crownCount);
  this.rings=this.pool(ring,small,8);this.root.add(this.body,this.spray,this.crown,this.rings);
  if(!this.fire){const geometry=new CylinderGeometry(1,1,1,12,48,true);this.geometries.push(geometry);for(let i=0;i<2;i++){const material=this.waterMaterial();this.materials.push(material);const mesh=new Mesh(geometry,material);mesh.frustumCulled=false;mesh.visible=false;this.waterJets.push(mesh);this.root.add(mesh);}}
  this.root.visible=false;
 }
 private waterMaterial(){return new ShaderMaterial({uniforms:{start:{value:new Vector3()},first:{value:new Vector3()},second:{value:new Vector3()},end:{value:new Vector3()},head:{value:0},tail:{value:0},width:{value:.1},clock:{value:0}},vertexShader:`
  uniform vec3 start,first,second,end;uniform float head,tail,width,clock;varying vec3 normalWorld,world;varying float flow,angle;
  void main(){float f=position.y+.5,t=mix(tail,head,f),u=1.-t;vec3 center=u*u*u*start+3.*u*u*t*first+3.*u*t*t*second+t*t*t*end;vec3 tangent=normalize(3.*u*u*(first-start)+6.*u*t*(second-first)+3.*t*t*(end-second));vec3 axis=abs(tangent.y)>.9?vec3(1,0,0):vec3(0,1,0);vec3 n=normalize(cross(tangent,axis)),b=cross(tangent,n);float radius=width*(.85+t*.35)*(1.+sin(t*70.-clock*39.)*.065)*(1.-smoothstep(.91,1.,f)*.93);normalWorld=normalize(n*position.x+b*position.z);world=center+normalWorld*radius;flow=t;angle=atan(position.z,position.x);gl_Position=projectionMatrix*viewMatrix*vec4(world,1.);
  }`,fragmentShader:`varying vec3 normalWorld,world;varying float flow,angle;uniform float clock;void main(){vec3 n=normalize(normalWorld),v=normalize(cameraPosition-world);float facing=abs(dot(n,v)),light=dot(n,normalize(vec3(-.6,1.,1.)));vec3 c=mix(vec3(.025,.22,.65),vec3(.13,.75,1.),smoothstep(-.3,.65,light));float streak=smoothstep(.82,.98,sin(angle*4.+flow*34.-clock*23.))*smoothstep(.3,.8,light);c=mix(c,vec3(.80,.98,1.),max(streak*.8,pow(1.-facing,3.)));gl_FragColor=vec4(c,1.);}`});}
 private material(color:number,small:boolean){return new ShaderMaterial({uniforms:{clock:{value:0},tone:{value:new Color(color)},fire:{value:this.fire?1:0},small:{value:small?1:0}},vertexShader:`
  attribute float phase;varying vec3 normalWorld,world;varying float height;uniform float clock,fire;void main(){
   vec3 p=position;float tip=max(0.,p.y);p.x+=sin(tip*4.5+clock*15.+phase*19.)*tip*tip*.17*fire;p.z+=cos(tip*5.-clock*12.+phase*21.)*tip*tip*.14*fire;
   p.xz*=1.+sin(p.y*12.-clock*19.+phase*12.)*.055;
   vec4 wp=modelMatrix*instanceMatrix*vec4(p,1.);world=wp.xyz;normalWorld=normalize(mat3(modelMatrix*instanceMatrix)*normal);height=p.y;gl_Position=projectionMatrix*viewMatrix*wp;
  }`,fragmentShader:`
  varying vec3 normalWorld,world;varying float height;uniform vec3 tone;uniform float clock,fire,small;
  void main(){vec3 n=normalize(normalWorld),v=normalize(cameraPosition-world);float facing=max(0.,dot(n,v)),lit=dot(n,normalize(vec3(-.6,1.,1.)));
   float hot=1.-smoothstep(.18,1.2,height);vec3 fireInk=mix(vec3(1.,.16,.008),vec3(1.,.87,.20),hot);fireInk*=.78+.22*smoothstep(-.35,.7,lit);if(facing>.82&&height<.23)fireInk=mix(fireInk,vec3(1.,.98,.67),.7);
   vec3 waterInk=tone*.50;if(lit>-.2)waterInk=mix(tone,vec3(.05,.66,.96),.5);if(lit>.48)waterInk=vec3(.32,.86,1.);if(facing<.30||lit>.85)waterInk=vec3(.83,.99,1.);
   gl_FragColor=vec4(mix(waterInk,fireInk,fire),1.);
  }`});}
 private pool(geometry:BufferGeometry,material:ShaderMaterial,count:number){
  // Each pool owns its phase attribute; geometry is shared only when counts agree.
  const own=geometry.clone();own.setAttribute('phase',new InstancedBufferAttribute(Float32Array.from({length:count},(_,i)=>seed(i+7)),1));this.geometries.push(own);
  const mesh=new InstancedMesh(own,material,count);mesh.instanceMatrix.setUsage(DynamicDrawUsage);mesh.frustumCulled=false;mesh.count=0;return mesh;
 }
 private place(mesh:InstancedMesh,index:number,p:Vector3,d:Vector3,width:number,length:number){
  this.dummy.position.copy(p);this.dummy.quaternion.setFromUnitVectors(Y,d);this.dummy.scale.set(width,length,width);this.dummy.updateMatrix();mesh.setMatrixAt(index,this.dummy.matrix);
 }
 prepare(){this.root.visible=true;this.waterJets.forEach(mesh=>mesh.visible=true);for(const mesh of [this.body,this.spray,this.crown,this.rings]){mesh.count=1;mesh.setMatrixAt(0,new Matrix4().makeScale(.001,.001,.001));}}
 update(age:number,w:number,h:number,camera:PerspectiveCamera,sockets:ElementalSocket[],reduced=false){
  const p=elementalBeat(age,this.tier);if(!p||reduced||!sockets.length){this.root.visible=false;return;}this.root.visible=true;
  this.materials.forEach(m=>m.uniforms.clock.value=age);
  this.right.setFromMatrixColumn(camera.matrixWorld,0);this.up.setFromMatrixColumn(camera.matrixWorld,1);
  let bodies=0,sprays=0,crowns=0,rings=0;this.waterJets.forEach(mesh=>mesh.visible=false);
  const emitters=sockets.slice(0,2),per=Math.floor(this.bodyCount/emitters.length),parts=Math.floor(this.sprayCount/emitters.length);
  for(let e=0;e<emitters.length;e++){
   const socket=emitters[e],side=emitters.length===1?-1:e?1:-1,path=elementalPath(socket,camera,w,h,age,this.tier,side),strength=p.strength;
   // Charge is physically attached to the moving socket. Small tongues / droplets draw inward.
   if(p.charge>0){
    for(let i=0;i<parts;i++){const phase=(age*(this.fire?1.9:2.7)+seed(i+e*35))%1,a=i*2.399+age*3,r=(1-phase)*(.12+p.charge*.48);
     this.point.copy(socket.position).addScaledVector(this.right,Math.cos(a)*r).addScaledVector(this.up,Math.sin(a)*r);this.offset.copy(socket.position).sub(this.point).normalize();
     const size=(this.fire?.055:.025)*p.charge*Math.sin(phase*Math.PI);this.place(this.spray,sprays++,this.point,this.offset,size,size*(this.fire?2:1.8));
    }
    this.point.copy(socket.position);this.place(this.body,bodies++,this.point,socket.direction,.10+p.charge*.13,.12+p.charge*.27);
   }
   if(age>=p.beat.release&&p.after<.35){
    // Dense overlapping packets, curved along the actual nozzle tangent. The front meets the score exactly on the beat.
    if(this.fire)for(let i=0;i<per;i++){
     const fraction=(i/per+age*2.1)%1,t=p.tail+(p.travel-p.tail)*fraction;if(t<0||t>1||p.travel<=p.tail)continue;
     path.getPoint(t,this.point);path.getTangent(t,this.tangent);
     const pulse=.82+.18*Math.sin(t*43-age*28+e*2),end=Math.sin(Math.PI*Math.max(.001,fraction))**.24;
     const width=(this.fire?.15+t*.17:.105+t*.045)*strength*pulse*end;
     const twist=age*12+t*30,spread=this.fire?.055:.024;this.point.addScaledVector(this.right,Math.sin(twist)*spread*t).addScaledVector(this.up,Math.cos(twist)*spread*t);
     this.place(this.body,bodies++,this.point,this.tangent,width,width*(this.fire?2.3:3.8));
    }
    if(!this.fire){const mesh=this.waterJets[e],u=mesh.material.uniforms;mesh.visible=p.travel>p.tail;u.start.value.copy(path.v0);u.first.value.copy(path.v1);u.second.value.copy(path.v2);u.end.value.copy(path.v3);u.head.value=p.travel;u.tail.value=p.tail;u.width.value=.075*strength;u.clock.value=age;}
    for(let i=0;i<parts;i++){
     const t=(age*(this.fire?2.7:3.8)+seed(i+e*77))%1;if(t>p.travel||t<p.tail)continue;path.getPoint(t,this.point);path.getTangent(t,this.tangent);
     const a=i*2.399+age*2,spread=(this.fire?.13:.10)+t*(this.fire?.29:.17),size=(this.fire?.025:.009)*(1+seed(i)*1.5)*strength;
     this.point.addScaledVector(this.right,Math.cos(a)*spread).addScaledVector(this.up,Math.sin(a)*spread);
     this.place(this.spray,sprays++,this.point,this.tangent,size,size*(this.fire?3.4:3));
    }
    // Pressure collars are nozzle-local and advect down the jet, not screen-space ornaments.
    if(!this.fire)for(let i=0;i<4;i++){const t=(age*3+i/4)%1;if(t>p.travel||t<p.tail)continue;path.getPoint(t,this.point);path.getTangent(t,this.tangent);this.dummy.position.copy(this.point);this.dummy.quaternion.setFromUnitVectors(new Vector3(0,0,1),this.tangent);this.dummy.scale.setScalar((.14+t*.07)*strength);this.dummy.updateMatrix();this.rings.setMatrixAt(rings++,this.dummy.matrix);}
   }
   if(p.after>=0){
    // The same stream breaks into a directional, three-dimensional splash at contact.
    const origin=path.v3,count=Math.floor(this.crownCount/emitters.length),life=1-smooth((p.after-.18)/.70),spread=1-Math.exp(-p.after*6);
    for(let i=0;i<count;i++){
     const sideways=(i%2?1:-1)*(.72+seed(i+9)*.28),vertical=(seed(i+19)-.5)*.4;
     this.offset.copy(this.right).multiplyScalar(sideways).addScaledVector(this.up,vertical).normalize();
     this.point.copy(origin).addScaledVector(this.offset,spread*(.65+seed(i+41)*.9)*strength).addScaledVector(this.up,this.fire?p.after*.18:-p.after*p.after*.9);
     const size=(this.fire?.085:.045)*life*smooth(p.after/.035)*(1+seed(i+4)*.6)*strength;
     this.tangent.copy(this.offset).multiplyScalar(.75).addScaledVector(this.up,this.fire?.65:.2).normalize();this.place(this.crown,crowns++,this.point,this.tangent,size,size*(this.fire?2.1:3.2));
    }
   }
  }
  for(const [mesh,count] of [[this.body,bodies],[this.spray,sprays],[this.crown,crowns],[this.rings,rings]] as const){mesh.count=count;mesh.instanceMatrix.needsUpdate=true;}
 }
 dispose(){for(const mesh of [this.body,this.spray,this.crown,this.rings])mesh.dispose();this.geometries.forEach(g=>g.dispose());this.materials.forEach(m=>m.dispose());}
}
