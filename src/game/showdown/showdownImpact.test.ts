import {describe,it,expect} from 'vitest';
import {Group,Bone} from 'three';
import {impactPose,rewardPresentation,applyHitPose} from './showdownImpact';
describe('Showdown impact choreography',()=>{
 it('builds recoil on impact, holds contact briefly, then settles without drifting',()=>{
  expect(impactPose(-.01,1,false,false).recoil).toBe(0);
  expect(impactPose(.1,1,false,false).recoil).toBeGreaterThan(.9);
  expect(impactPose(.4,1,false,false).recoil).toBeLessThan(impactPose(.1,1,false,false).recoil);
  expect(impactPose(2,1,false,false).recoil).toBe(0);
 });
 it('gives the final hit greater displacement and longer recovery',()=>{
  expect(impactPose(.1,1,true,false).x).toBeGreaterThan(impactPose(.1,1,false,false).x);
  expect(impactPose(1.15,1,true,false).recoil).toBeGreaterThan(impactPose(1.15,1,false,false).recoil);
 });
 it('removes motion and flashes in reduced motion mode',()=>{
  for(let t=0;t<2;t+=.05)expect(impactPose(t,1,true,true)).toMatchObject({x:0,y:0,shake:0,flash:0,recoil:0});
 });
 it('counts up only during the reveal and settles to the exact award on skip',()=>{
  expect(rewardPresentation(-1,180,false).shownTotal).toBe(0);
  const values=[.9,1.1,1.4,1.7,2.1].map(t=>rewardPresentation(t,180,false).shownTotal);
  expect(values).toEqual([...values].sort((a,b)=>a-b));expect(values.at(-1)).toBe(180);
  expect(rewardPresentation(99,50,false)).toMatchObject({shownTotal:50,burst:0,zoom:1});
  expect(rewardPresentation(1.2,50,true).shownTotal).toBe(50);
 });
 it('layers an articulated hit over native bones and restores the exact native pose',()=>{
  const root=new Group();const spine=new Bone(),head=new Bone(),arm=new Bone();spine.name='spine_02';head.name='head';arm.name='left_arm_01';root.add(spine);spine.add(head,arm);spine.rotation.set(.1,.2,.3);const before=spine.quaternion.clone(),headBefore=head.quaternion.clone();
  const restore=applyHitPose([spine,head,arm],1,1);expect(spine.quaternion.equals(before)).toBe(false);expect(head.quaternion.equals(headBefore)).toBe(false);
  restore();expect(spine.quaternion.toArray()).toEqual(before.toArray());expect(head.quaternion.toArray()).toEqual(headBefore.toArray());
  const noHit=applyHitPose([spine,head],0,0);expect(spine.quaternion.toArray()).toEqual(before.toArray());noHit();
 });
});
