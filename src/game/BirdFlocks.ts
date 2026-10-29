import {Container,Graphics,GraphicsContext} from 'pixi.js';
import {advanceBirdFlights,birdFlightPose,createBirdFlightState,requestBirdFlock} from './birdFlight';
import type {BirdFlightState,BirdPose} from './birdFlight';

/** Distant ink-and-cel birds: shared held wing drawings, a fixed pool, and occasional flybys. */
export class BirdFlocks {
 readonly root=new Container();
 private state:BirdFlightState;
 private cels:GraphicsContext[];
 private birds:Graphics[][];
 private pose:BirdPose={x:0,y:0,wing:0,bank:0,scale:0,alpha:0};
 private destroyed=false;

 constructor(private width:number,private height:number,private random:()=>number=Math.random){
  this.state=createBirdFlightState(random);
  this.cels=[-10,-7,-3,0,3,6,9].map(wing=>this.drawCel(wing));
  this.birds=this.state.flocks.map(flock=>flock.birds.map(()=>{
   const bird=new Graphics({context:this.cels[3]});bird.visible=false;bird.eventMode='none';this.root.addChild(bird);return bird;
  }));
  this.root.eventMode='none';this.root.interactiveChildren=false;this.root.visible=false;
 }

 private drawCel(wing:number){
  const g=new GraphicsContext();
  // The far wing catches blue atmospheric light; the near wing carries the darker cel edge.
  g.moveTo(1,-.3).quadraticCurveTo(7,wing*.55,10,wing*.88-.3)
   .lineTo(6.5,wing*.72+1.2).lineTo(2,wing*.35+1.4).lineTo(-1,1).closePath().fill(0x7897ad);
  // A pointed head and a short forked tail keep the tiny outline recognizably avian.
  g.poly([-6,1,-12,3,-10,.2,-12,-1.1,-5,-.8,-1,-1.5,4,-.8,5.8,-2.2,8,-2.1,9,-.7,11,0,8.1,.8,4,1.5,-.5,2.4]).fill(0x3d596e);
  g.moveTo(-.5,.1).quadraticCurveTo(-4,wing*.85,-13,wing)
   .lineTo(-10.4,wing*.56+1.2).lineTo(-8.4,wing*.57+1.8)
   .lineTo(-7,wing*.34+1.4).quadraticCurveTo(-3,3,-.5,2).closePath().fill(0x496b82);
  // Only a sliver of warm underside survives at this distance, with no outlined eyes or details.
  g.moveTo(-2,1.45).quadraticCurveTo(2,2.4,5.7,.8).lineTo(3.8,1.9).lineTo(-.8,2.2).closePath().fill({color:0xe8e4c5,alpha:.7});
  return g;
 }

 tick(time:number,reduced:boolean,low:boolean){
  if(this.destroyed)return;
  advanceBirdFlights(this.state,time,reduced,low,this.random);this.render();
 }

 /** Trigger an ambient pass on demand; the reduced-motion and pool limits still apply. */
 showBirds(){
  if(this.destroyed)return false;
  const started=requestBirdFlock(this.state,this.random);this.render();return started;
 }

 private render(){
  this.root.visible=this.state.flocks.some(f=>f.active);
  for(let f=0;f<this.birds.length;f++){
   const flock=this.state.flocks[f];
   for(let i=0;i<this.birds[f].length;i++){
    const bird=this.birds[f][i];bird.visible=flock.active&&i<flock.count;
    if(!bird.visible)continue;
    const pose=birdFlightPose(flock,i,flock.age,this.pose),scale=this.width*pose.scale/24;
    if(bird.context!==this.cels[pose.wing])bird.context=this.cels[pose.wing];
    bird.position.set(pose.x*this.width,pose.y*this.height);bird.scale.set(scale*flock.direction,scale);
    bird.rotation=pose.bank;bird.alpha=pose.alpha;
   }
  }
 }

 destroy(){
  if(this.destroyed)return;
  this.destroyed=true;this.root.destroy({children:true});for(const cel of this.cels)cel.destroy();
 }
}
