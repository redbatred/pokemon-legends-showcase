import {expect,it} from 'vitest';
import {ballFlight,ballLanding,BALL_HIT} from './ballPhysics';
it('projects a distant small ball into the card artwork without a position or scale overshoot',()=>{
 const start=ballFlight(0,-500),end=ballFlight(BALL_HIT,-500);
 expect(start.scale).toBeLessThan(.15);expect(start.y).toBeLessThan(-250);expect(end).toMatchObject({x:0,y:-98,scale:.72});
 for(let i=1;i<=30;i++)expect(ballFlight(BALL_HIT*i/30,-500).scale).toBeGreaterThan(ballFlight(BALL_HIT*(i-1)/30,-500).scale);
});
it('preserves contact position, accelerates downward and settles after one rebound',()=>{
 expect(ballLanding(0).y).toBe(-98);expect(ballLanding(.53).y).toBeCloseTo(174);expect(ballLanding(.67).y).toBeLessThan(174);expect(ballLanding(.9).y).toBe(174);
 const early=ballLanding(.12).y-ballLanding(.1).y,late=ballLanding(.42).y-ballLanding(.4).y;expect(late).toBeGreaterThan(early);
});
