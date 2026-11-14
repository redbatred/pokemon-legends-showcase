import {expect,it} from 'vitest';
import {Object3D} from 'three';
import {SkeletalContinuity,arrivalPhase} from './skeletalContinuity';
it('bounds a sudden target change and settles without overshooting',()=>{
 const bone=new Object3D(),motion=new SkeletalContinuity([bone]);motion.apply(0);
 bone.rotation.z=Math.PI/2;motion.apply(1/60);
 expect(bone.rotation.z).toBeGreaterThan(0);expect(bone.rotation.z).toBeLessThan(.18);
 let previous=bone.rotation.z;
 for(let i=2;i<=90;i++){bone.rotation.z=Math.PI/2;motion.apply(i/60);expect(bone.rotation.z).toBeGreaterThanOrEqual(previous-1e-6);expect(bone.rotation.z).toBeLessThanOrEqual(Math.PI/2+1e-6);previous=bone.rotation.z;}
 expect(previous).toBeCloseTo(Math.PI/2,3);
});
it('does not advance twice on a repaint and resets on an explicit seek',()=>{
 const bone=new Object3D(),motion=new SkeletalContinuity([bone]);motion.apply(0);bone.position.x=1;motion.apply(.016);const x=bone.position.x;
 bone.position.x=1;motion.apply(.016);expect(bone.position.x).toBe(x);
 bone.position.x=5;motion.apply(-1);expect(bone.position.x).toBe(5);
});
it('keeps wing phase moving and matches idle velocity at the arrival handoff',()=>{
 let last=arrivalPhase(0,1.85);
 for(let t=.01;t<=1.6;t+=.01){const next=arrivalPhase(t,1.85);expect(next-last).toBeGreaterThan(.009);last=next;}
 expect(arrivalPhase(1.6,1.85)).toBeCloseTo(3.7);
 expect((arrivalPhase(1.6,1.85)-arrivalPhase(1.5999,1.85))/.0001).toBeCloseTo(1,2);
});
