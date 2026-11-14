import {BoxGeometry,CircleGeometry,Color,DoubleSide,Group,InstancedMesh,Mesh,MeshBasicMaterial,MeshStandardMaterial,Object3D,ShaderMaterial,TorusGeometry} from 'three';
import {championshipBeat} from './championshipBeat';
import {juiceBeats,TIER_PALETTE,winLadder} from './winJuiceMotion';
import {WIN_CINEMA_FINISH} from './winCinemaMotion';
import type {CinemaTier} from './winChoreography';
/** Physical championship architecture. Ribs and lamps are instanced; light lives on the set. */
export class ChampionshipSet{
 readonly root=new Group();private bands:Mesh[]=[];private lamps:InstancedMesh;private emblem:Mesh;private tone:Color;private lampColor=new Color();private award=new Color();private target=new Color();private white=new Color(0xffffff);private last=0;
 constructor(color:number){
  this.tone=new Color(color);
  const metal=new MeshStandardMaterial({color:0x15243e,roughness:.6,metalness:.35,side:DoubleSide});
  for(const [radius,y] of [[11.6,3.5],[12.4,5.3],[12.8,7.2]]){
   const ring=new Mesh(new TorusGeometry(radius,.16,5,72),metal);ring.rotation.x=Math.PI/2;ring.position.y=y;this.root.add(ring);
   const light=new Mesh(new TorusGeometry(radius-.08,.045,4,72),new MeshBasicMaterial({color:this.tone}));light.rotation.x=Math.PI/2;light.position.y=y-.13;this.root.add(light);this.bands.push(light);
  }
  const ribs=new InstancedMesh(new BoxGeometry(.14,4.2,.16),metal,24),dummy=new Object3D();
  this.lamps=new InstancedMesh(new BoxGeometry(.85,.18,.12),new MeshBasicMaterial({color:0xd6edff}),24);
  for(let i=0;i<24;i++){const a=i/24*Math.PI*2;dummy.position.set(Math.sin(a)*12.2,5.25,Math.cos(a)*12.2);dummy.rotation.set(0,a,0);dummy.updateMatrix();ribs.setMatrixAt(i,dummy.matrix);dummy.position.y=6.65;dummy.updateMatrix();this.lamps.setMatrixAt(i,dummy.matrix);this.lamps.setColorAt(i,new Color(0xc6e9ff));}
  this.root.add(ribs,this.lamps);
  const badge=new Group();badge.position.set(0,3.7,-11.4);badge.scale.setScalar(.62);
  const edge=new Mesh(new TorusGeometry(1.2,.13,8,64),metal);badge.add(edge);
  const logo=new ShaderMaterial({side:DoubleSide,uniforms:{power:{value:1}},vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 v;uniform float power;void main(){vec2 p=v-.5;float d=length(p);vec3 c=p.y>0.?vec3(.9,.035,.09):vec3(.6,.8,1.);if(abs(p.y)<.038||d<.16)c=vec3(.015,.035,.07);if(d<.10)c=vec3(.85,.95,1.);gl_FragColor=vec4(c*power,1.);}'});
  this.emblem=new Mesh(new CircleGeometry(1.15,64),logo);badge.add(this.emblem);this.root.add(badge);
  // A fixed architectural halo frames the arena emblem; it is never a text backing.
  const halo=new Mesh(new TorusGeometry(1.52,.025,4,72),new MeshBasicMaterial({color:this.tone}));badge.add(halo);this.bands.push(halo);
 }
 dispose(){this.root.traverse(object=>{if(object instanceof InstancedMesh)object.dispose();});}
 update(age:number,tier:CinemaTier,exitAge:number,reduced:boolean,boost=0){
  const p=championshipBeat(age,tier,exitAge,reduced),pulse=reduced?0:Math.sin(age*1.3)*.04,dt=Math.min(.1,Math.max(0,age-this.last));if(age<this.last||this.last===0)this.award.copy(this.tone);this.last=age;
  // The arena wears the win: its light rings take each tier's colour as that tier lands, and every strike runs up them.
  const rung=winLadder(tier).filter(r=>age>=r.time).at(-1);this.target.copy(this.tone);
  if(age>=WIN_CINEMA_FINISH)this.target.lerp(this.white.setHex(TIER_PALETTE[tier].glow),.7);else if(rung)this.target.lerp(this.white.setHex(TIER_PALETTE[rung.tier].glow),.7);
  this.award.lerp(this.target,reduced?1:1-Math.exp(-dt*7));this.white.setHex(0xffffff);
  const beats=juiceBeats(tier),flash=(delay:number)=>reduced?0:beats.reduce((sum,beat)=>{const t=age-beat.impact-delay;return t>=0?sum+beat.weight*Math.exp(-t*4.5):sum;},0);
  this.bands.forEach((band,i)=>{const hit=flash(.10+i*.10);(band.material as MeshBasicMaterial).color.copy(this.award).lerp(this.white,Math.min(.75,hit*.5)).multiplyScalar(.8+p.light*.8+pulse*(i+1)+hit*.9+boost);});
  (this.emblem.material as ShaderMaterial).uniforms.power.value=.65+p.light*.55+Math.min(.6,flash(.05)*.4);
  const lampHit=flash(.14);
  for(let i=0;i<24;i++){const wave=reduced?0:Math.max(0,Math.cos(i/24*Math.PI*2-age*.65))**12;this.lamps.setColorAt(i,this.lampColor.setHex(0xbedfff).lerp(this.award,.3).multiplyScalar(.45+p.light*.45+wave*.65+lampHit*.55+boost*.6));}if(this.lamps.instanceColor)this.lamps.instanceColor.needsUpdate=true;
 }
}
