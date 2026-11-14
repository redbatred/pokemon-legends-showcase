import {expect,it} from 'vitest';
import {openingUiPose,trayFlightPose} from './openingUiMotion';
import {PACK_ARRIVAL_TIME} from './packOpeningMotion';
import {PACK_CLEARANCE_TIME} from './packTearGeometry';
it('hands the pack rack to the card tray on the camera arrival clock',()=>{
 expect(openingUiPose(0)).toMatchObject({packs:1,cards:0,controls:0});
 expect(openingUiPose(PACK_CLEARANCE_TIME).packs).toBe(0);expect(openingUiPose(PACK_CLEARANCE_TIME).cards).toBe(0);
 expect(openingUiPose((PACK_CLEARANCE_TIME+PACK_ARRIVAL_TIME)/2).cards).toBeGreaterThan(0);
 expect(openingUiPose(PACK_ARRIVAL_TIME+.25)).toMatchObject({packs:0,cards:1,controls:1});
});
it('carries a card into its slot in one move: lift and tip first, then a fall that arrives with speed',()=>{
 const start=trayFlightPose(0),end=trayFlightPose(1);
 expect(start).toMatchObject({travel:0,shrink:0,tip:0});expect(start.lift).toBeCloseTo(0);expect(start.height).toBeCloseTo(0);
 expect(end.travel).toBeCloseTo(1);expect(end.shrink).toBeCloseTo(1);expect(end.tip).toBeCloseTo(0);expect(end.lift).toBeCloseTo(0);expect(Math.abs(end.lean)).toBeLessThan(1e-9);
 // Anticipation: it has lifted and tipped before it has gone anywhere.
 const early=trayFlightPose(.14);expect(early.lift).toBeGreaterThan(.4);expect(early.tip).toBeGreaterThan(.5);expect(early.travel).toBe(0);
 // Never backwards along the path or in depth, and still moving quickly when it meets the slot.
 let previous=start;for(let t=.02;t<=1.0001;t+=.02){const pose=trayFlightPose(t);expect(pose.travel).toBeGreaterThanOrEqual(previous.travel-1e-9);expect(pose.shrink).toBeGreaterThanOrEqual(previous.shrink-1e-9);for(const value of Object.values(pose))expect(Number.isFinite(value)).toBe(true);previous=pose;}
 expect(1-trayFlightPose(.9).travel).toBeGreaterThan(trayFlightPose(.3).travel-trayFlightPose(.2).travel);
 // Out-of-range times hold the end poses.
 expect(trayFlightPose(-1)).toEqual(start);expect(trayFlightPose(2)).toEqual(end);
});

