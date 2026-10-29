import {describe,expect,it} from 'vitest';
import {advanceBirdFlights,birdFlightPose,createBirdFlightState,requestBirdFlock} from './birdFlight';

const seeded=(seed:number)=>()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const advance=(state:ReturnType<typeof createBirdFlightState>,seconds:number,random:()=>number,reduced=false,low=false)=>{
 const start=state.previous??0;
 for(let i=1;i<=Math.round(seconds*20);i++)advanceBirdFlights(state,start+i/20,reduced,low,random);
};

describe('distant bird flights',()=>{
 it('waits for the first pass and spaces subsequent arrivals instead of maintaining a permanent flock',()=>{
  const random=()=>.5,state=createBirdFlightState(random);
  advanceBirdFlights(state,0,false,false,random);advance(state,4.4,random);
  expect(state.flocks.filter(f=>f.active)).toHaveLength(0);
  advance(state,.2,random);expect(state.flocks.filter(f=>f.active)).toHaveLength(1);
  advance(state,11.1,random);expect(state.flocks.filter(f=>f.active)).toHaveLength(0);
  advance(state,8.7,random);expect(state.flocks.filter(f=>f.active)).toHaveLength(0);
  advance(state,.2,random);expect(state.flocks.filter(f=>f.active)).toHaveLength(1);
 });

 it('crosses the entire sky in both directions and keeps every member above the stadium',()=>{
  const random=seeded(47),state=createBirdFlightState(random),directions=new Set<number>(),slopes=new Set<number>();
  for(let pass=0;pass<80;pass++){
   state.flocks.forEach(f=>f.active=false);expect(requestBirdFlock(state,random)).toBe(true);
   const flock=state.flocks.find(f=>f.active)!;directions.add(flock.direction);slopes.add(Math.sign(flock.endY-flock.startY));
   expect(flock.count).toBeGreaterThanOrEqual(4);expect(flock.count).toBeLessThanOrEqual(9);
   expect(flock.duration).toBeGreaterThanOrEqual(8);expect(flock.duration).toBeLessThanOrEqual(14);
   for(let i=0;i<flock.count;i++){
    const start=birdFlightPose(flock,i,0),end=birdFlightPose(flock,i,flock.duration);
    if(flock.direction===1){expect(start.x).toBeLessThan(-.02);expect(end.x).toBeGreaterThan(1.02);}
    else{expect(start.x).toBeGreaterThan(1.02);expect(end.x).toBeLessThan(-.02);}
    for(let t=0;t<=flock.duration;t+=.2){const pose=birdFlightPose(flock,i,t);expect(pose.y).toBeGreaterThan(.055);expect(pose.y).toBeLessThan(.285);}
   }
  }
  expect([...directions].sort()).toEqual([-1,1]);expect([...slopes].sort()).toEqual([-1,1]);
 });

 it('staggers the formation and wing phases while each bird alternates flapping and gliding',()=>{
  const random=seeded(9),state=createBirdFlightState(random);requestBirdFlock(state,random);
  const flock=state.flocks[0],wings=new Set<number>();let varied=false;
  for(let t=0;t<flock.duration;t+=.07){
   const leader=birdFlightPose(flock,0,t);wings.add(leader.wing);
   if(birdFlightPose(flock,1,t).wing!==leader.wing)varied=true;
  }
  expect(wings.size).toBeGreaterThanOrEqual(5);expect(varied).toBe(true);
  const positions=flock.birds.slice(0,flock.count).map((_,i)=>birdFlightPose(flock,i,4));
  expect(positions.some(p=>p.y<positions[0].y)).toBe(true);expect(positions.some(p=>p.y>positions[0].y)).toBe(true);
  for(let i=1;i<positions.length;i++)expect((positions[0].x-positions[i].x)*flock.direction).toBeGreaterThan(.007);
 });

 it('does not advance a whole flight or catch up missed spawns after a background time jump',()=>{
  const random=()=>.5,state=createBirdFlightState(random);advanceBirdFlights(state,0,false,false,random);
  requestBirdFlock(state,random);advance(state,1,random);const age=state.flocks[0].age;
  advanceBirdFlights(state,3600,false,false,random);
  expect(state.flocks[0].age-age).toBeLessThanOrEqual(.10001);expect(state.flocks.filter(f=>f.active)).toHaveLength(1);
  advanceBirdFlights(state,3599,false,false,random);expect(state.flocks[0].age).toBeCloseTo(age+.1);
 });

 it('removes active birds and suppresses scheduled and requested passes under reduced motion',()=>{
  const random=seeded(4),state=createBirdFlightState(random);advanceBirdFlights(state,0,false,false,random);requestBirdFlock(state,random);
  advanceBirdFlights(state,.05,true,false,random);expect(state.flocks.every(f=>!f.active)).toBe(true);
  advance(state,80,random,true);expect(state.flocks.every(f=>!f.active)).toBe(true);expect(requestBirdFlock(state,random)).toBe(false);
  advanceBirdFlights(state,80.1,false,false,random);expect(state.flocks.every(f=>!f.active)).toBe(true);
  advance(state,6.1,random);expect(state.flocks.some(f=>f.active)).toBe(true);
 });

 it('reuses a fixed flock pool and limits low quality to a single small flock',()=>{
  const random=seeded(15),state=createBirdFlightState(random),slots=[...state.flocks],members=state.flocks.map(f=>f.birds);
  expect(requestBirdFlock(state,random)).toBe(true);expect(requestBirdFlock(state,random)).toBe(true);expect(requestBirdFlock(state,random)).toBe(false);
  advanceBirdFlights(state,0,false,true,random);expect(state.flocks.filter(f=>f.active)).toHaveLength(1);expect(state.flocks[0].count).toBeLessThanOrEqual(5);
  advance(state,14.1,random,false,true);expect(state.flocks.filter(f=>f.active).length).toBeLessThanOrEqual(1);
  advance(state,120,random,false,true);
  state.flocks.forEach((flock,i)=>{expect(flock).toBe(slots[i]);expect(flock.birds).toBe(members[i]);});
 });

 it('replays identical passes for an injected seed and writes into a reusable pose object',()=>{
  const a=seeded(31),b=seeded(31),left=createBirdFlightState(a),right=createBirdFlightState(b);
  advanceBirdFlights(left,0,false,false,a);advanceBirdFlights(right,0,false,false,b);advance(left,7,a);advance(right,7,b);
  expect(left).toEqual(right);
  const out={x:0,y:0,wing:0,bank:0,scale:0,alpha:0};expect(birdFlightPose(left.flocks[0],2,5,out)).toBe(out);
  expect(out).toEqual(birdFlightPose(right.flocks[0],2,5));
 });
});
