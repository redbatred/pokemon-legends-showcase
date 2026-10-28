import {expect,it} from 'vitest';
import {Container} from 'pixi.js';
import {PACK_CLEARANCE_TIME} from './packTearGeometry';
import {packStackPose,packStackFan,transferStackFront,PACK_EXTRACTION_START,PACK_ARRIVAL_TIME} from './packOpeningMotion';
it('keeps the cards rigid inside the wrapper and exits with continuous upward velocity',()=>{
 for(let time=PACK_EXTRACTION_START;time<PACK_CLEARANCE_TIME;time+=.01){const pose=packStackPose(time);expect(pose.scale).toBe(.66);expect(pose.rotation).toBe(0);expect(pose.camera).toBe(0);}
 const e=.00001,center=packStackPose(PACK_CLEARANCE_TIME),before=packStackPose(PACK_CLEARANCE_TIME-e),after=packStackPose(PACK_CLEARANCE_TIME+e);
 expect((center.y-before.y)/e).toBeCloseTo(-70,1);expect((after.y-center.y)/e).toBeCloseTo(-70,1);
 for(const key of ['x','scale','rotation','camera'] as const){expect((center[key]-before[key])/e).toBeCloseTo((after[key]-center[key])/e,2);}
});
it('arrives gently in the first reveal pose without overshooting scale',()=>{
 const end=packStackPose(PACK_ARRIVAL_TIME),before=packStackPose(PACK_ARRIVAL_TIME-.00001);
 expect(end.x).toBeCloseTo(0,8);expect(end.y).toBe(-8);expect(end.scale).toBe(.96);expect(end.rotation).toBeCloseTo(0,8);expect(end.camera).toBe(1);
 expect((end.y-before.y)/.00001).toBeCloseTo(0,1);
 for(let t=PACK_EXTRACTION_START;t<PACK_ARRIVAL_TIME;t+=.01){const p=packStackPose(t);expect(p.scale).toBeGreaterThanOrEqual(.66);expect(p.scale).toBeLessThanOrEqual(.96);}
});
it('transfers the same front object without changing any screen-space corner',()=>{
 const world=new Container(),stack=new Container(),layer=new Container(),front=new Container();world.position.set(400,320);world.scale.set(.72);world.addChild(stack,layer);stack.addChild(front);stack.position.set(12,-8);stack.scale.set(.96);stack.rotation=.023;
 const corners=[{x:-156,y:-217.5},{x:156,y:-217.5},{x:156,y:217.5},{x:-156,y:217.5}],before=corners.map(p=>front.toGlobal(p));
 const pose=transferStackFront(stack,layer,front);
 expect(layer.children[0]).toBe(front);expect(stack.children).not.toContain(front);expect(pose).toEqual({offsetX:12,lift:-8,scale:.96,roll:.023});
 corners.forEach((p,i)=>{const after=front.toGlobal(p);expect(after.x).toBeCloseTo(before[i].x,8);expect(after.y).toBeCloseTo(before[i].y,8);});world.destroy({children:true});
});
it('fans only outside the wrapper and settles back into a neat deck',()=>{
 for(const index of [1,2,3]){const sealed=packStackFan(PACK_EXTRACTION_START,index),clear=packStackFan(PACK_CLEARANCE_TIME,index),arrived=packStackFan(PACK_ARRIVAL_TIME,index);expect(clear).toEqual(sealed);expect(arrived.x).toBeCloseTo(sealed.x,8);expect(arrived.rotation).toBeCloseTo(sealed.rotation,8);}
 expect(packStackFan((PACK_CLEARANCE_TIME+PACK_ARRIVAL_TIME)/2,3).x).toBeGreaterThan(19);
});
