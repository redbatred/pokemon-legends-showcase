export type BirdMember={offsetX:number;offsetY:number;size:number;phase:number;beat:number;glide:number};
export type BirdFlock={active:boolean;age:number;duration:number;direction:number;startY:number;endY:number;count:number;opacity:number;birds:BirdMember[]};
export type BirdFlightState={previous:number|null;nextIn:number;reduced:boolean;low:boolean;flocks:BirdFlock[]};
export type BirdPose={x:number;y:number;wing:number;bank:number;scale:number;alpha:number};
export const BIRD_FLOCK_CAPACITY=2;
export const BIRDS_PER_FLOCK=9;

const clamp=(n:number,min=0,max=1)=>Math.max(min,Math.min(max,n));
const unit=(random:()=>number)=>clamp(random(),0,.999999999);
const initialDelay=(random:()=>number)=>3+unit(random)*3;

/** Fixed slots and members are recycled; no timers, browser state or renderer dependencies. */
export function createBirdFlightState(random:()=>number=Math.random):BirdFlightState{
 return {previous:null,nextIn:initialDelay(random),reduced:false,low:false,flocks:Array.from({length:BIRD_FLOCK_CAPACITY},()=>({
  active:false,age:0,duration:10,direction:1,startY:.16,endY:.16,count:0,opacity:.7,
  birds:Array.from({length:BIRDS_PER_FLOCK},()=>({offsetX:0,offsetY:0,size:0,phase:0,beat:0,glide:0})),
 }))};
}

/** An optional ambient cue uses the same capacity and accessibility limits as scheduled passes. */
export function requestBirdFlock(state:BirdFlightState,random:()=>number=Math.random){
 if(state.reduced)return false;
 const flock=state.low?(state.flocks[0].active?undefined:state.flocks[0]):state.flocks.find(f=>!f.active);
 if(!flock)return false;
 flock.active=true;flock.age=0;flock.duration=8+unit(random)*6;flock.direction=unit(random)<.5?1:-1;
 flock.startY=.13+unit(random)*.08;flock.endY=clamp(flock.startY+(unit(random)-.5)*.11,.115,.23);
 flock.count=4+Math.floor(unit(random)*(state.low?2:6));flock.opacity=.6+unit(random)*.17;
 const spacing=.016+unit(random)*.004,spread=.007+unit(random)*.002;
 for(let i=0;i<flock.count;i++){
  const member=flock.birds[i],rank=Math.ceil(i/2),side=i%2?-1:1;
  member.offsetX=-flock.direction*(rank*spacing+(i?unit(random)*.004:0));
  member.offsetY=side*rank*spread+(unit(random)-.5)*.003;
  member.size=.0054+unit(random)*.0025;member.phase=i*1.73+unit(random)*Math.PI*2;
  member.beat=2.25+unit(random)*.75;member.glide=unit(random)*4.4;
 }
 state.nextIn=12+unit(random)*16;
 return true;
}

/** A resumed or stalled frame advances at most 100ms; missed flights never spawn in a burst. */
export function advanceBirdFlights(state:BirdFlightState,time:number,reduced:boolean,low:boolean,random:()=>number=Math.random){
 const dt=Number.isFinite(time)&&state.previous!==null?clamp(time-state.previous,0,.1):0;
 state.previous=Number.isFinite(time)?time:null;state.low=low;
 if(reduced){
  if(!state.reduced)state.nextIn=initialDelay(random);
  state.reduced=true;for(const flock of state.flocks)flock.active=false;return;
 }
 state.reduced=false;
 for(let i=0;i<state.flocks.length;i++){
  const flock=state.flocks[i];
  if(low&&i>0)flock.active=false;
  if(!flock.active)continue;
  if(low)flock.count=Math.min(flock.count,5);
  flock.age+=dt;if(flock.age>=flock.duration)flock.active=false;
 }
 state.nextIn-=dt;
 if(state.nextIn<=0&&!requestBirdFlock(state,random))state.nextIn=1;
}

/** Normalized sky position and held animation cel. Passing `out` avoids per-frame allocations. */
export function birdFlightPose(flock:BirdFlock,index:number,age:number,out:BirdPose={x:0,y:0,wing:0,bank:0,scale:0,alpha:0}){
 const bird=flock.birds[index],p=clamp(age/flock.duration),cycle=(age+bird.glide)%4.4;
 out.x=(flock.direction===1?-.14+p*1.28:1.14-p*1.28)+bird.offsetX+Math.sin(age*.9+bird.phase)*.0012;
 out.y=flock.startY+(flock.endY-flock.startY)*p+bird.offsetY+Math.sin(age*1.5+bird.phase)*.0018;
 out.wing=cycle>2.65?3:Math.round(3+Math.sin(age*bird.beat*Math.PI*2+bird.phase)*3);
 out.bank=(flock.endY-flock.startY)*flock.direction*.65+Math.sin(age*.7+bird.phase)*.018;
 out.scale=bird.size;out.alpha=flock.opacity*Math.min(1,p/.06,(1-p)/.07);
 return out;
}
