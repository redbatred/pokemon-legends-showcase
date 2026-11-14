import {expect,it} from 'vitest';
import {CARD_REVEAL_AT,showdownLayout} from './showdownModel';
import {lockedReward,vaultCardPose,vaultWard,vaultSealPoints} from './vaultPresentation';
it.each([[1440,900],[1280,720],[844,390],[390,844],[320,568]])('keeps the card visibly behind its guardian and inside the protective ward at %sx%s',(w,h)=>{
 const l=showdownLayout(w,h),p=lockedReward(l),ward=vaultWard(l);
 expect(p.x).toBeGreaterThan(l.boss.x);expect(p.y).toBeLessThan(l.boss.y-150);
 for(const dx of [-156*p.scale,156*p.scale])for(const dy of [-217.5*p.scale,217.5*p.scale]){
  const u=(p.x+dx-ward.x)/ward.radius,v=(p.y+dy-ward.y)/(ward.radius*1.15);expect(u*u+v*v).toBeLessThan(1.08);
 }
 for(const point of vaultSealPoints(l)){expect(l.x+point.x*l.scale).toBeGreaterThan(0);expect(l.x+point.x*l.scale).toBeLessThan(w);}
});
it('releases the existing card continuously into its front-facing reveal position',()=>{
 const l=showdownLayout(390,844),start=lockedReward(l),end=CARD_REVEAL_AT-.35;
 expect(vaultCardPose(8.85,l)).toMatchObject(start);
 const atEnd=vaultCardPose(end,l);expect(atEnd.x).toBe(l.card.x);expect(atEnd.y).toBeCloseTo(l.card.y);expect(atEnd.scale).toBeCloseTo(l.cardScale*.8);
 const previous=vaultCardPose(end-.001,l);expect(Math.abs(previous.x-atEnd.x)).toBeLessThan(.01);
 expect(vaultCardPose(end,l,true)).toEqual(atEnd);
});

it('moves the same centered preview card smoothly behind its arriving guardian',()=>{
 const l=showdownLayout(390,844),preview=vaultCardPose(-1,l),start=vaultCardPose(0,l),end=vaultCardPose(1.1,l);
 expect(start).toEqual(preview);expect(start.x).toBe(l.card.x);expect(start.scale).toBe(.45);expect(end).toMatchObject(lockedReward(l));
 expect(Math.abs(vaultCardPose(1.099,l).x-end.x)).toBeLessThan(.01);
});
