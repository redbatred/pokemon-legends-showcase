import {expect,it} from 'vitest';
import {cutHandleHit,peelProgress,manualPeelPose} from './manualPeel';
import {PACK_TEAR_LIMIT,packTearPoint} from './packTearGeometry';
it('accepts the visible scissor handle beyond the foil edge and normalizes drag for mobile',()=>{expect(cutHandleHit(175,-160)).toBe(true);expect(cutHandleHit(0,0)).toBe(false);expect(peelProgress(-92,0,1)).toBe(.5);expect(peelProgress(-46,0,.5)).toBe(.5);expect(peelProgress(20,184/.85,1)).toBe(1);});
it('deforms actual foil continuously through partial peel and preserves its attached corner',()=>{
 expect(manualPeelPose(0)).toMatchObject({rip:0,curl:0,open:0});expect(manualPeelPose(1)).toMatchObject({rip:PACK_TEAR_LIMIT,open:1,pull:1});
 for(const p of [.15,.25,.43,.52,.76,.88]){const a=packTearPoint('seal',.95,.1,manualPeelPose(p-.00001)),b=packTearPoint('seal',.95,.1,manualPeelPose(p+.00001));expect(Math.hypot(a.x-b.x,a.y-b.y)).toBeLessThan(.01);}
 const flat=packTearPoint('seal',.95,.1,manualPeelPose(0)),peeled=packTearPoint('seal',.95,.1,manualPeelPose(.6));expect(Math.hypot(flat.x-peeled.x,flat.y-peeled.y)).toBeGreaterThan(30);
});
