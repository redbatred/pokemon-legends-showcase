import {CanvasTexture,CircleGeometry,CylinderGeometry,DynamicDrawUsage,Group,InstancedMesh,Matrix4,MeshBasicMaterial,MeshPhongMaterial,Quaternion,SRGBColorSpace,Vector3} from 'three';

type Coin={alive:boolean;rest:boolean;delay:number;wait:number;kick:number;x:number;y:number;z:number;vx:number;vy:number;vz:number;turn:Quaternion;axis:Vector3;spin:number;flat:Quaternion;settle:number};
const RADIUS=.088,THICKNESS=.022,GRAVITY=15,UP=new Vector3(0,1,0);
/** The payout as objects in the arena: coins leave the point of contact, are lit by the scene, bounce on the floor and stay where they land. */
export class WinCoins{
 readonly root=new Group();
 private mesh:InstancedMesh;private shadows:InstancedMesh;private coins:Coin[]=[];private cursor=0;private seed=5;private face:CanvasTexture|null=null;
 private matrix=new Matrix4();private position=new Vector3();private scale=new Vector3();private step=new Quaternion();private still=new Quaternion();
 constructor(private floor:number,private capacity=240){
  // Gold carries its own warmth, so coins stay gold in the dark arena and flare under the strike light.
  const side=new MeshPhongMaterial({color:0xf2a51e,specular:0xfff0b8,shininess:55,emissive:0xb06a08,emissiveIntensity:.75});
  const cap=new MeshPhongMaterial({color:0xffffff,specular:0xfff6d0,shininess:80,emissive:0xffa51e,emissiveIntensity:.5});
  if(typeof document!=='undefined'){
   // A struck face: raised rim, a band across the middle and a centre button.
   const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const c=canvas.getContext('2d')!;
   c.fillStyle='#ffd65a';c.fillRect(0,0,128,128);c.strokeStyle='#b9741a';c.lineWidth=9;c.beginPath();c.arc(64,64,54,0,Math.PI*2);c.stroke();
   c.lineWidth=7;c.beginPath();c.moveTo(12,64);c.lineTo(116,64);c.stroke();c.fillStyle='#fff3b0';c.beginPath();c.arc(64,64,17,0,Math.PI*2);c.fill();c.stroke();
   this.face=new CanvasTexture(canvas);this.face.colorSpace=SRGBColorSpace;cap.map=this.face;cap.emissiveMap=this.face;
  }
  this.mesh=new InstancedMesh(new CylinderGeometry(RADIUS,RADIUS,THICKNESS,20),[side,cap,cap],capacity);this.mesh.instanceMatrix.setUsage(DynamicDrawUsage);this.mesh.frustumCulled=false;
  const blob=new CircleGeometry(1,16);blob.rotateX(-Math.PI/2);
  this.shadows=new InstancedMesh(blob,new MeshBasicMaterial({color:0x01040c,transparent:true,opacity:.4,depthWrite:false}),capacity);this.shadows.instanceMatrix.setUsage(DynamicDrawUsage);this.shadows.frustumCulled=false;this.shadows.renderOrder=-1;
  for(let i=0;i<capacity;i++)this.coins.push({alive:false,rest:false,delay:0,wait:0,kick:0,x:0,y:0,z:0,vx:0,vy:0,vz:0,turn:new Quaternion(),axis:new Vector3(1,0,0),spin:0,flat:new Quaternion(),settle:0});
  this.root.add(this.shadows,this.mesh);this.write();
 }
 private random(){this.seed=(this.seed*16807)%2147483647;return (this.seed-1)/2147483646;}
 /** Throw coins from a point on the floor. `toward` is the flat direction to the Pokémon; most coins land between the strike and its feet. */
 burst(origin:Vector3,toward:Vector3,count:number,power=1){
  const sideX=-toward.z,sideZ=toward.x;
  for(let i=0;i<count;i++){
   const coin=this.coins[this.cursor];this.cursor=(this.cursor+1)%this.capacity;
   const along=(.9+this.random()*2.9)*power,across=(this.random()*2-1)*(.9+this.random()*2.1)*power;
   coin.alive=true;coin.rest=false;coin.delay=this.random()*.14;coin.settle=0;coin.wait=0;coin.kick=0;
   coin.x=origin.x+(this.random()-.5)*.5;coin.y=this.floor+THICKNESS;coin.z=origin.z+(this.random()-.5)*.5;
   coin.vx=toward.x*along+sideX*across;coin.vz=toward.z*along+sideZ*across;coin.vy=(4.6+this.random()*3.6)*Math.sqrt(power);
   coin.axis.set(this.random()-.5,this.random()*.3,this.random()-.5).normalize();coin.spin=9+this.random()*12;
   coin.turn.setFromAxisAngle(coin.axis,this.random()*6.283);coin.flat.setFromAxisAngle(UP,this.random()*6.283);
  }
 }
 /** A later strike sends its wave under coins that already landed: each one hops as the wave reaches it. */
 shock(origin:Vector3,strength:number,speed=8.5){
  for(const coin of this.coins){
   if(!coin.alive||coin.delay>0||coin.y>this.floor+.2)continue;
   const distance=Math.hypot(coin.x-origin.x,coin.z-origin.z),kick=strength*5/(1+distance*.4);
   if(kick>.5){coin.wait=Math.max(.001,distance/speed);coin.kick=kick*(.7+this.random()*.6);}
  }
 }
 update(dt:number){
  if(dt<=0)return;
  for(const coin of this.coins){
   if(!coin.alive)continue;
   if(coin.wait>0){coin.wait-=dt;if(coin.wait<=0){coin.rest=false;coin.settle=0;coin.vy=coin.kick;coin.vx+=(this.random()-.5)*.9;coin.vz+=(this.random()-.5)*.9;coin.spin=5+this.random()*9;coin.axis.set(this.random()-.5,0,this.random()-.5).normalize();}}
   if(coin.rest)continue;
   if(coin.delay>0){coin.delay-=dt;continue;}
   coin.vy-=GRAVITY*dt;coin.x+=coin.vx*dt;coin.y+=coin.vy*dt;coin.z+=coin.vz*dt;
   const ground=this.floor+THICKNESS/2;
   if(coin.y<=ground){
    coin.y=ground;
    // Each landing keeps some height and loses grip, until the coin lies flat where it stopped.
    if(Math.abs(coin.vy)<1.3){coin.vy=0;coin.vx*=.5;coin.vz*=.5;coin.spin*=.35;coin.settle+=dt*7;if(coin.settle>=1||Math.hypot(coin.vx,coin.vz)<.05){coin.rest=true;coin.turn.copy(coin.flat);}}
    else{coin.vy=-coin.vy*.42;coin.vx*=.68;coin.vz*=.68;coin.spin*=.7;}
   }
   if(!coin.rest){coin.turn.premultiply(this.step.setFromAxisAngle(coin.axis,coin.spin*dt));if(coin.settle>0)coin.turn.slerp(coin.flat,Math.min(1,coin.settle));}
  }
  this.write();
 }
 private write(){
  for(let i=0;i<this.capacity;i++){
   const coin=this.coins[i],shown=coin.alive&&coin.delay<=0;
   this.matrix.compose(this.position.set(coin.x,coin.y,coin.z),coin.turn,this.scale.setScalar(shown?1:0));this.mesh.setMatrixAt(i,this.matrix);
   // The contact shadow tightens as the coin nears the floor.
   const height=Math.max(0,coin.y-this.floor),spread=shown?RADIUS*(1.15+Math.min(1,height*.5)*.9):0;
   this.matrix.compose(this.position.set(coin.x,this.floor+.006,coin.z),this.still,this.scale.set(spread,1,spread));this.shadows.setMatrixAt(i,this.matrix);
  }
  this.mesh.instanceMatrix.needsUpdate=true;this.shadows.instanceMatrix.needsUpdate=true;
 }
 get resting(){return this.coins.reduce((n,coin)=>n+Number(coin.alive&&coin.rest),0);}
 get active(){return this.coins.reduce((n,coin)=>n+Number(coin.alive),0);}
 clear(){for(const coin of this.coins){coin.alive=false;coin.rest=false;coin.wait=0;}this.cursor=0;this.seed=5;this.write();}
 dispose(){this.mesh.geometry.dispose();this.shadows.geometry.dispose();for(const material of this.mesh.material as MeshPhongMaterial[])material.dispose();(this.shadows.material as MeshBasicMaterial).dispose();this.face?.dispose();}
}
