import {expect,it} from 'vitest';
import {ballFlight,ballLanding,ballLandingPlan,ballRevealCues,BALL_HIT} from './ballPhysics';
it('projects a distant small ball into the card artwork with increasing apparent size',()=>{
 const start=ballFlight(0,-500),end=ballFlight(BALL_HIT,-500);
 expect(start.scale).toBeLessThan(.15);expect(start.y).toBeLessThan(-250);expect(end).toMatchObject({x:0,y:-98,scale:.72});
 for(let i=1;i<=30;i++)expect(ballFlight(BALL_HIT*i/30,-500).scale).toBeGreaterThan(ballFlight(BALL_HIT*(i-1)/30,-500).scale);
});
it('keeps the through-card direction and dissipates collision energy without a position jump',()=>{
 for(const sky of [-350,-500,-900]){
  const end=ballFlight(BALL_HIT,sky),before=ballFlight(BALL_HIT-.001,sky),after=ballLanding(.001,sky);
  expect(ballLanding(0,sky).x).toBeCloseTo(0);expect(ballLanding(0,sky)).toMatchObject({y:-98,scale:.72});
  expect(after.x).toBeLessThan(end.x);expect(after.y).toBeGreaterThan(end.y);
  expect((after.y-end.y)/(end.y-before.y)).toBeGreaterThan(.3);expect((after.y-end.y)/(end.y-before.y)).toBeLessThan(.4);
 }
});
it('lands on the responsive stage floor, rebounds visibly once, and settles before opening',()=>{
 for(const floor of [190,220,285]){
  const p=ballLandingPlan(-500,floor);
  expect(ballLanding(p.contact,-500,floor).y).toBeCloseTo(floor);
  expect(floor-ballLanding((p.contact+p.settled)/2,-500,floor).y).toBeGreaterThan(16);
  const end=ballLanding(p.settled+.1,-500,floor);expect(end.y).toBeCloseTo(floor);expect(end.rotation).toBeCloseTo(0);
  expect(ballLanding(p.settled+2,-500,floor)).toEqual(end);
 }
});

it('fires both bounce cues on exact floor contact and lets the soft rebound land before unlatching',()=>{
 for(const sky of [-350,-500,-900])for(const floor of [190,220,285]){const plan=ballLandingPlan(sky,floor),cues=ballRevealCues(plan);expect(ballLanding(cues.first-BALL_HIT,sky,floor).y).toBeCloseTo(floor);expect(ballLanding(cues.second-BALL_HIT,sky,floor).y).toBeCloseTo(floor);expect(cues.latch-cues.second).toBeCloseTo(.12);expect(cues.open).toBeGreaterThan(cues.latch);}
});
