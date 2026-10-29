import {expect,it} from 'vitest';
import {openingUiPose} from './openingUiMotion';
import {PACK_ARRIVAL_TIME} from './packOpeningMotion';
import {PACK_CLEARANCE_TIME} from './packTearGeometry';
it('hands the pack rack to the card tray on the camera arrival clock',()=>{
 expect(openingUiPose(0)).toMatchObject({packs:1,cards:0,controls:0});
 expect(openingUiPose(PACK_CLEARANCE_TIME).packs).toBe(0);expect(openingUiPose(PACK_CLEARANCE_TIME).cards).toBe(0);
 expect(openingUiPose((PACK_CLEARANCE_TIME+PACK_ARRIVAL_TIME)/2).cards).toBeGreaterThan(0);
 expect(openingUiPose(PACK_ARRIVAL_TIME+.25)).toMatchObject({packs:0,cards:1,controls:1});
});
