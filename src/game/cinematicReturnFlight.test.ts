import {expect,it} from 'vitest';
import {cinematicReturnFlight} from './cinematicReturnFlight';
it('keeps a readable uncollapsed amount until it reaches the exact total',()=>{
 const a={x:200,y:650},b={x:180,y:72};
 expect(cinematicReturnFlight(0,a,b)).toMatchObject({...a,done:false,fold:0});
 expect(cinematicReturnFlight(.28,a,b)).toMatchObject({y:361,done:false,fold:0});
 expect(cinematicReturnFlight(.56,a,b)).toMatchObject({...b,done:true,fold:0});
});
