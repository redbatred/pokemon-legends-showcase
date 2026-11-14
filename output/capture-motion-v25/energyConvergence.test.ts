import {expect,it} from 'vitest';
import {convergeOutlet} from './energyConvergence';
it('pins both crossfading drawings to the same mouth throughout full conversion',()=>{
 for(const outlet of [{x:300,y:200},{x:340,y:180}])for(let frame=2.7;frame<=15;frame+=.1){
  const state=convergeOutlet(outlet,{x:460,y:340},frame);expect(state.end.x).toBeCloseTo(460,8);expect(state.end.y).toBeCloseTo(340,8);
 }
});
it('leaves the first intact pose unwarped and approaches the mouth continuously',()=>{
 const a={x:200,y:180},b={x:450,y:400};expect(convergeOutlet(a,b,0).end).toEqual(a);
 let prior=Infinity;for(let frame=0;frame<=3;frame+=.01){const p=convergeOutlet(a,b,frame).end,d=Math.hypot(p.x-b.x,p.y-b.y);expect(d).toBeLessThanOrEqual(prior+1e-9);prior=d;}
});
