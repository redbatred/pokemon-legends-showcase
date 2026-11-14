import {describe,expect,it} from 'vitest';
import {cardMotion,CARD} from './cardMotion';
import {cardLock,coinFlight,COIN_LEDGE,digitLock,DIGIT_STAGGER,FINAL_HOLD,heldAge,HERO,heroState,letterSlam,LOCK_COINS,MULTIPLIER,multiplierFlight,POWER,rainCoin,reelDigits,RIBBON,ribbonState,tierLevel,windup} from './rewardMotion';
import {stampMotion,STAMP_LAND} from './ballVerdict';
import {WIN_STAGES} from './winTimeline';

describe('reward: card, multiplier and total',()=>{
 it('winds the card away, commits to one turn and holds the landing before it rings out',()=>{
  expect(cardMotion(-.34).yaw).toBeGreaterThan(Math.PI);expect(cardMotion(0).yaw).toBeCloseTo(Math.PI/2,1);
  // Contact is one held pose: nothing moves for the hold, then the push relaxes.
  const landed=cardMotion(CARD.land),held=cardMotion(CARD.land+CARD.hold*.9);expect(held.scale).toBeCloseTo(landed.scale,6);expect(held.impact).toBe(1);expect(cardMotion(CARD.land+CARD.hold+.3).impact).toBeLessThan(.02);
  expect(landed.scale).toBeGreaterThan(1.07);expect(cardMotion(-.4).tremble).toBeGreaterThan(.5);expect(cardMotion(.5).tremble).toBe(0);
  // Light builds behind it only while it hangs, and the foil is crossed once.
  expect(cardMotion(-.45).leak).toBeGreaterThan(.8);expect(cardMotion(.4).leak).toBe(0);expect(cardMotion(CARD.land).sweep).toBeLessThan(-1);expect(cardMotion(1.2).sweep).toBeGreaterThan(1.29);
  for(let age=2;age<10;age+=.25){const m=cardMotion(age);expect(Math.abs(m.swayYaw)).toBeLessThan(.09);expect(m.yaw).toBeCloseTo(0,3);}
 });
 it('stamps the multiplier on the card, then lands it in the socket on the frame the count begins',()=>{
  expect(multiplierFlight(MULTIPLIER.stamp-.01).stamped).toBe(false);expect(multiplierFlight(MULTIPLIER.stamp).stamped).toBe(true);
  expect(MULTIPLIER.strike).toBe(WIN_STAGES[0].start);expect(multiplierFlight(MULTIPLIER.strike-.001).docked).toBe(false);
  const landed=multiplierFlight(MULTIPLIER.strike);expect(landed.docked).toBe(true);expect(landed.flying).toBe(false);expect(landed.strike).toBe(1);expect(multiplierFlight(MULTIPLIER.strike+.6).strike).toBeLessThan(.01);
  let previous=0;for(let age=MULTIPLIER.leave;age<=MULTIPLIER.strike;age+=.01){const f=multiplierFlight(age);expect(f.travel).toBeGreaterThanOrEqual(previous);previous=f.travel;}expect(previous).toBeGreaterThan(.98);
 });
 it('upgrades the tier plate in place on each lock and only turns it when the name changes',()=>{
  expect(ribbonState(1).name).toBe('reward');expect(RIBBON.length).toBe(WIN_STAGES.length+1);
  WIN_STAGES.forEach((stage,i)=>{const settled=ribbonState(stage.end+.2);expect(settled.index).toBe(i+1);expect(settled.name).toBe(RIBBON[i+1]);expect(settled.flip).toBe(1);});
  // Mid-turn the plate is edge-on; before the half-way point it still shows the old name.
  expect(ribbonState(WIN_STAGES[0].end+.08).flip).toBeLessThan(.05);expect(ribbonState(WIN_STAGES[0].end+.04).name).toBe('reward');expect(ribbonState(WIN_STAGES[0].end+.12).name).toBe('big');
  expect(ribbonState(WIN_STAGES[3].end+.04).flip).toBe(1);expect(ribbonState(WIN_STAGES[4].end+.04).flip).toBe(1);expect(ribbonState(WIN_STAGES[4].end).name).toBe('legendary');expect(ribbonState(WIN_STAGES[4].end).final).toBe(true);expect(ribbonState(WIN_STAGES[4].end-.01).final).toBe(false);
 });
 it('rolls the reels like an odometer and locks them when the amount holds',()=>{
  const digits=(value:number)=>reelDigits(value,0,6).map(d=>d.blank?' ':String(d.digit)).join('');
  expect(digits(0)).toBe('     0');expect(digits(100)).toBe('   100');expect(digits(1800)).toBe('  1800');
  for(const d of reelDigits(1200,0,6))expect(d.roll).toBe(0);
  // Just short of a round number every lower place has rolled most of the way into the next digit.
  const rolling=reelDigits(299.96,0,6);expect(rolling.at(-1)!.roll).toBeGreaterThan(.9);expect(rolling.at(-2)!.roll).toBeGreaterThan(.5);expect(rolling.at(-3)!.digit).toBe(2);expect(rolling.at(-3)!.roll).toBeGreaterThan(.5);
  // Climbing fast, the low places spin while the high ones can still be read.
  const fast=reelDigits(640,700,6);expect(fast.at(-1)!.spin).toBe(1);expect(fast.at(-2)!.spin).toBe(1);expect(fast.at(-3)!.spin).toBe(0);
  // A new leading place takes its room only as its first digit arrives.
  expect(reelDigits(750,0,6)[2].appear).toBe(0);expect(reelDigits(990,0,6)[2].appear).toBeGreaterThan(.5);expect(reelDigits(1000,0,6)[2].appear).toBe(1);
 });
 it('holds the final total on contact, then lets the clock catch up',()=>{
  const end=WIN_STAGES.at(-1)!.end;expect(heldAge(end-.2)).toBe(end-.2);expect(heldAge(end+FINAL_HOLD*.5)).toBe(end);expect(heldAge(end+2)).toBeCloseTo(end+2,6);
  let previous=0;for(let age=0;age<9;age+=.01){const held=heldAge(age);expect(held).toBeGreaterThanOrEqual(previous-1e-9);expect(held).toBeLessThanOrEqual(age+1e-9);previous=held;}
 });
 it('throws coins clear of the tray, lands them on the end of the ledge and rolls them in to rest',()=>{
  for(let seed=0;seed<60;seed++){
   expect(coinFlight(-.01,seed)).toBeNull();const start=coinFlight(0,seed)!,rest=coinFlight(4,seed)!;
   expect(start.rising).toBe(true);expect(Math.abs(start.x)).toBeCloseTo(1,6);expect(rest.resting).toBe(true);expect(rest.rising).toBe(false);expect(coinFlight(9,seed)).toEqual(rest);
   expect(rest.y).toBeGreaterThanOrEqual(COIN_LEDGE);expect(rest.y).toBeLessThan(COIN_LEDGE+.035);expect(Math.abs(rest.x)).toBeGreaterThan(.09);expect(Math.abs(rest.x)).toBeLessThan(.93);
   // In the air it stays outside the tray's width, so it cannot cross the amount, the bet or the multiplier; on the ledge it never rises to them.
   let top=1;for(let t=0;t<4;t+=.01){const c=coinFlight(t,seed)!;top=Math.min(top,c.y);if(t<start.land)expect(Math.abs(c.x)).toBeGreaterThanOrEqual(.955);else expect(c.y).toBeGreaterThan(COIN_LEDGE-.04);}
   expect(top).toBeLessThan(-.2);
  }
 });
 it('makes every tier worth more than the last, across the card, the coins and the room',()=>{
  expect(tierLevel(1).level).toBe(0);WIN_STAGES.forEach((stage,i)=>{const lv=tierLevel(stage.end+.01);expect(lv.level).toBe(i+1);expect(lv.name).toBe(RIBBON[i+1]);});
  for(let i=1;i<POWER.length;i++)expect(POWER[i]).toBeGreaterThan(POWER[i-1]);for(let i=1;i<LOCK_COINS.length-1;i++)expect(LOCK_COINS[i]).toBeGreaterThan(LOCK_COINS[i-1]);
  // The card pulses on the first lock, lifts and tilts from the second, and throws light across its foil from the third.
  const at=(i:number,t=.06)=>cardLock(WIN_STAGES[i].end+t);
  expect(at(0).scale).toBeGreaterThan(1.005);expect(at(0).lift).toBe(0);expect(at(0).yaw).toBe(0);expect(at(0).sweep).toBeNull();
  expect(at(1,.15).lift).toBeGreaterThan(0);expect(Math.abs(at(1).yaw)).toBeGreaterThan(.05);expect(at(1).sweep).toBeNull();expect(at(2).sweep).not.toBeNull();
  expect(at(4,.15).lift).toBeGreaterThan(at(1,.15).lift);expect(Math.abs(at(4).yaw)).toBeGreaterThan(Math.abs(at(1).yaw));expect(at(4).light).toBeGreaterThan(at(0).light);
  const settled=cardLock(WIN_STAGES[4].end+1.5);expect(settled.scale).toBe(1);expect(settled.lift).toBe(0);expect(settled.yaw).toBe(0);
  // By the time the next lock arrives the last one has rung out.
  for(let i=0;i<4;i++){const late=cardLock(WIN_STAGES[i+1].end-.001);expect(Math.abs(late.scale-1)).toBeLessThan(.002);expect(Math.abs(late.yaw)).toBeLessThan(.003);expect(late.lift).toBeLessThan(.001);}
 });
 it('stops the digits one after another, each with its own slam',()=>{
  for(let order=0;order<9;order++){const before=digitLock(order*DIGIT_STAGGER-.001,order,.5),hit=digitLock(order*DIGIT_STAGGER,order,.5);
   if(order)expect(before.rolling).toBeGreaterThan(0);expect(hit.rolling).toBe(0);expect(hit.scale).toBeGreaterThan(1.3);expect(hit.light).toBe(1);expect(digitLock(order*DIGIT_STAGGER+.5,order,.5)).toEqual({rolling:0,scale:1,lift:0,light:0});}
  expect(digitLock(0,0,1).scale).toBeGreaterThan(digitLock(0,0,.2).scale);
 });
 it('drains the room before the last lock and releases it on the lock',()=>{
  const end=WIN_STAGES.at(-1)!.end,from=WIN_STAGES.at(-2)!.end;expect(windup(from)).toBe(0);expect(windup(from+.6)).toBeGreaterThan(.2);expect(windup(end-.02)).toBeGreaterThan(.98);expect(windup(end)).toBe(0);
  let previous=0;for(let age=from;age<end;age+=.01){const d=windup(age);expect(d).toBeGreaterThanOrEqual(previous);previous=d;}
 });
 it('sends the award out of the tray after the hit-stop and brings it home before the reward steps aside',()=>{
  const end=WIN_STAGES.at(-1)!.end,settle=7;
  expect(heroState(end+HERO.launch-.001,settle).active).toBe(false);expect(heroState(end+HERO.launch,settle).out).toBeCloseTo(0,6);expect(heroState(end+HERO.launch+.3,settle).out).toBe(1);
  // The title starts while the plate is still arriving; the total's digits land after it has begun.
  expect(HERO.title).toBeGreaterThan(HERO.launch);expect(HERO.total).toBeGreaterThan(HERO.title);expect(heroState(end+HERO.title,settle).title).toBeCloseTo(0);expect(heroState(end+HERO.total,settle).total).toBeCloseTo(0);
  expect(heroState(settle-.01,settle).out).toBe(1);expect(heroState(settle+HERO.back,settle).out).toBe(0);expect(heroState(settle+HERO.back,settle).returning).toBe(1);
  let previous=1;for(let age=settle;age<settle+HERO.back;age+=.01){const s=heroState(age,settle);expect(s.out).toBeLessThanOrEqual(previous+1e-9);previous=s.out;}
 });
 it('slams each title letter in from large, once',()=>{
  expect(letterSlam(-.01).shown).toBe(false);expect(letterSlam(0).scale).toBe(2);expect(letterSlam(0).drop).toBe(1);expect(letterSlam(.07).drop).toBe(0);expect(letterSlam(.07).light).toBe(1);
  expect(letterSlam(.07).scale).toBeGreaterThan(1.2);expect(letterSlam(.6).scale).toBe(1);expect(letterSlam(.6).light).toBe(0);
 });
 it('keeps the near coins of the rain on the outer edges and loops both layers',()=>{
  for(let i=0;i<40;i++)for(let t=0;t<9;t+=.37){const near=rainCoin(i,t,true),far=rainCoin(i,t,false);
   if(near){expect(Math.abs(near.x)).toBeGreaterThanOrEqual(.97);expect(near.size).toBeGreaterThan(.06);expect(near.y).toBeGreaterThanOrEqual(-.12);expect(near.y).toBeLessThan(1.13);}
   if(far){expect(far.size).toBeLessThan(.035);expect(Math.abs(far.x)).toBeLessThanOrEqual(1.01);}}
  expect(rainCoin(0,-1,true)).toBeNull();expect(rainCoin(3,8,false)).not.toBeNull();expect(rainCoin(3,8,true)).not.toBeNull();
 });
 it('drops the verdict stamp, lands it once and clears it on time',()=>{
  for(const caught of [true,false]){
   expect(stampMotion(-.01,caught).visible).toBe(false);expect(stampMotion(.01,caught).scale).toBeGreaterThan(1.6);expect(stampMotion(STAMP_LAND,caught).contact).toBe(1);
   expect(stampMotion(STAMP_LAND+.39,caught).scale).toBeCloseTo(1,2);expect(stampMotion(caught?.5:1.3,caught).visible).toBe(false);expect(stampMotion(caught?.499:1.299,caught).alpha).toBeLessThan(.01);
  }
  expect(stampMotion(.25,true).alpha).toBe(1);expect(stampMotion(1,false).alpha).toBe(1);
 });
});
