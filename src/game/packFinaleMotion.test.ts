import {expect,it} from 'vitest';
import {PACK_COUNT,PACK_TIERS,packCascade,packCountPlan,packCountPose,packCountTicks,packPunch,packTierIndex,packWinTier} from './packFinaleMotion';
import {AwardJuice,awardPower} from './AwardJuice';
import {resultPanelParts} from './resultPanelArt';
import {packResultsFrame,packResultsLayout,packTiles} from './packResultsLayout';
import {bonusCard,type Card} from './model';
import {resultWinTitle} from './amountCountMotion';

const PRICE=1000,land=(from:number,to:number,start=.94)=>packCountPlan(from,to,PRICE,start).land;
it('names a pack total by how many times the pack price it is',()=>{
 expect([0,9.9,10,49,50,99,100,149,150,900].map(packTierIndex)).toEqual([-1,-1,0,0,1,1,2,2,3,3]);
 expect([9.9,10,50,100,150].map(packWinTier)).toEqual(['big','big','mega','epic','legendary']);
 for(const tier of PACK_TIERS)expect(resultWinTitle(tier.at)).toBe(tier.title);expect(resultWinTitle(9)).toBe('PACK WIN');expect(resultWinTitle(9,true)).toBe('SESSION WIN');
});
it('keeps the count short: an ordinary pack lands inside two seconds and the top tier inside three and a half',()=>{
 // .94 s is when the first light lands in a dealt receipt (first tile on the table, plus its flight).
 expect(land(0,1515)).toBeLessThan(2);expect(land(0,1515)).toBeGreaterThan(1.5);
 expect(land(0,13300)).toBeLessThan(2.5);expect(land(0,60000)).toBeLessThan(3);expect(land(0,120000)).toBeLessThan(3.2);
 expect(land(0,181515)).toBeLessThan(3.5);expect(land(0,181515)).toBeGreaterThan(3);
 // A late bonus rolls on from the old total with every tier it crosses, in the same time.
 expect(land(1515,181515,.7)-.7).toBeCloseTo(land(0,181515)-.94);
});
it('rolls up without ever stepping back, catches on each tier and lands on the exact total',()=>{
 for(const [from,to] of [[0,1515],[0,13300],[0,181515],[1515,181515],[0,50000],[49999,50001]]){
  const plan=packCountPlan(from,to,PRICE,.5);let value=from,tier=packTierIndex(from/PRICE);
  for(let t=0;t<plan.land+1;t+=1/120){const pose=packCountPose(plan,t);expect(pose.value).toBeGreaterThanOrEqual(value-1e-6);expect(pose.value).toBeLessThanOrEqual(to);expect(pose.tier).toBeGreaterThanOrEqual(tier);value=pose.value;tier=pose.tier;}
  expect(packCountPose(plan,plan.start).value).toBe(from);expect(packCountPose(plan,plan.land)).toMatchObject({value:to,landed:true,landAge:0,tier:packTierIndex(to/PRICE)});
 }
 // Crossing BIG: the roll reaches exactly ten times the price, holds there with the new name, then moves on.
 const plan=packCountPlan(0,60000,PRICE,0),first=plan.segments[0],second=plan.segments[1];
 expect(second.begin-first.end).toBeCloseTo(PACK_COUNT.hold);const caught=packCountPose(plan,first.end+PACK_COUNT.hold/2);
 expect(caught.value).toBe(10000);expect(caught.tier).toBe(0);expect(caught.tierAge).toBeCloseTo(PACK_COUNT.hold/2);expect(caught.rolling).toBe(false);
 expect(packCountPose(plan,first.end-.01).tier).toBe(-1);
 // Each segment accelerates into its threshold.
 const early=packCountPose(plan,first.begin+.1).value,late=packCountPose(plan,first.end-.001).value-packCountPose(plan,first.end-.101).value;expect(late).toBeGreaterThan(early);
});
it('lands a total that is exactly a threshold with that tier, without a dead stretch',()=>{
 const plan=packCountPlan(0,50000,PRICE,0);expect(plan.segments).toHaveLength(2);expect(plan.segments.at(-1)!.to).toBe(50000);expect(plan.segments.at(-1)!.from).toBe(10000);
 const pose=packCountPose(plan,plan.land);expect(pose.tier).toBe(1);expect(pose.tierAge).toBe(0);
});
it('ticks faster as the roll runs and pays tiles tens of milliseconds apart',()=>{
 let previous=0;const steps:number[]=[];for(let p=0;p<=1;p+=.05){const ticks=packCountTicks(p,0);expect(ticks).toBeGreaterThanOrEqual(previous);steps.push(ticks-previous);previous=ticks;}
 expect(packCountTicks(1,0)).toBe(9);expect(packCountTicks(1,4)).toBe(37);expect(packCountTicks(.5,4)-packCountTicks(0,4)).toBeLessThan(packCountTicks(1,4)-packCountTicks(.5,4));
 for(const count of [1,3,11,12]){const gap=packCascade(1,count,0)-packCascade(0,count,0);expect(gap).toBeGreaterThanOrEqual(.03);expect(gap).toBeLessThanOrEqual(.07);expect(packCascade(count-1,count,.2)-.2).toBeLessThanOrEqual(.56);}
});
it('passes the landing through the panel once, nearer tiles first',()=>{
 expect(packPunch(-.1,0)).toBe(0);expect(packPunch(.05,0)).toBeGreaterThan(0);expect(packPunch(.05,1)).toBe(0);expect(packPunch(.3,1)).toBeGreaterThan(0);for(const distance of [0,.5,1])expect(packPunch(2,distance)).toBeLessThan(.001);
});
it('never offers a ring, and scales an award by its size against the stake',()=>{
 for(const name of ['ring','pop'])expect(name in AwardJuice.prototype).toBe(false);for(const name of ['flare','strike','sparks','coins','glint'])expect(name in AwardJuice.prototype).toBe(true);
 expect(awardPower(0,1000)).toBe(0);expect(awardPower(25,1000)).toBeLessThan(.4);expect(awardPower(600,1000)).toBeGreaterThan(.75);expect(awardPower(5000,1000)).toBe(1);expect(awardPower(500,0)).toBe(.5);
});
it('lists a settled pack as its cards followed by the bonus it caught',()=>{
 const cards=[{id:'a',number:'1',name:'A',rarity:'Common',image:'/assets/a.webp',value:25,weight:1}] as Card[],bonus={name:'Lugia',image:'/assets/sets/silver-tempest/cards/186.webp',multiplier:180,amount:180000};
 expect(packTiles({cards})).toBe(cards);const tiles=packTiles({cards,bonus});expect(tiles).toHaveLength(2);expect(tiles[1]).toEqual(bonusCard(bonus));expect(tiles[1]).toMatchObject({id:'bonus',number:'180×',value:180000});
});
it('fits eleven and twelve tiles inside the panel at every screen, clear of the total and the buttons',()=>{
 for(const [w,h] of [[360,640],[390,844],[540,720],[768,1024],[800,571],[844,390],[1280,720],[1920,1080]])for(const count of [11,12]){
  const frame=packResultsFrame(w,h),layout=packResultsLayout(frame.width,frame.height,count),parts=resultPanelParts(frame.height,layout.total),plate=parts.plate!,slots=Array.from({length:count},(_,i)=>layout.slot(i)),where=`${w}x${h} n=${count}`;
  expect(frame.x,where).toBeGreaterThanOrEqual(0);expect(frame.y+frame.height,where).toBeLessThanOrEqual(h);expect(frame.x+frame.width,where).toBeLessThanOrEqual(w);
  expect(plate.y,where).toBeGreaterThan(parts.head);expect(plate.x,where).toBeGreaterThanOrEqual(16);expect(plate.x+plate.width,where).toBeLessThanOrEqual(frame.width-16);
  for(const [i,slot] of slots.entries()){
   // Inside the panel sideways, below the plate, and with its caption above the footer.
   expect(slot.x-slot.width/2,where).toBeGreaterThanOrEqual(20);expect(slot.x+slot.width/2,where).toBeLessThanOrEqual(frame.width-20);
   expect(slot.y-slot.height/2,where).toBeGreaterThanOrEqual(plate.y+plate.height+8);expect(slot.y+slot.height/2+16,where).toBeLessThanOrEqual(parts.foot);
   expect(slot.width,where).toBeGreaterThanOrEqual(44);
   for(const other of slots.slice(i+1)){const apartX=Math.abs(other.x-slot.x)>=slot.width+4,apartY=Math.abs(other.y-slot.y)>=slot.height+16;expect(apartX||apartY,where).toBe(true);}
  }
  // The buttons sit inside the footer.
  expect(frame.height-61+42,where).toBeLessThanOrEqual(frame.height-12);
 }
});
