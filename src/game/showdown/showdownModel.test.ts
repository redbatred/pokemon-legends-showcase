import {describe,it,expect} from 'vitest';
import {SHOWDOWNS,CARD_REVEAL_AT,showdownSnapshot,showdownLayout,projectilePosition,showdownReleaseAt,showdownMessage} from './showdownModel';
describe('Showdown choreography',()=>{
 it('breaking seals reveals progress, never separate money awards',()=>{
  for(const round of SHOWDOWNS)for(const strike of round.strikes){
   expect(showdownSnapshot(round.id,strike.at-.01).guard).toBeGreaterThan(showdownSnapshot(round.id,strike.at+.01).guard);
   expect(showdownSnapshot(round.id,strike.at+1).total).toBe(0);
  }
 });
 it('reveals exactly one card reward and preserves it through skip or replay',()=>{
  for(const round of SHOWDOWNS){
   expect(showdownSnapshot(round.id,CARD_REVEAL_AT+.54).total).toBe(0);
   const end=showdownSnapshot(round.id,13);expect(end.total).toBe(round.id==='legendary'?180:50);
   expect(showdownSnapshot(round.id,CARD_REVEAL_AT+.55).total).toBe(end.total);
   expect(end.guard).toBe(0);expect(end.complete).toBe(true);
   expect(showdownSnapshot(round.id,1000)).toEqual(end);
   expect(showdownSnapshot(round.id,0).total).toBe(0);
  }
 });
 it('lands projectiles exactly on the recipient at the impact time',()=>{
  const from={x:80,y:200},to={x:750,y:350};
  expect(projectilePosition(from,to,0)).toEqual(from);
  expect(projectilePosition(from,to,1)).toEqual(to);
  expect(projectilePosition(from,to,2)).toEqual(to);
  expect(projectilePosition(from,to,.5).x).toBeGreaterThan(from.x);
 });
 it.each([[1440,900],[390,844],[320,568],[844,390]])('keeps fighter anchors and the entire final card on screen at %sx%s',(w,h)=>{
  const l=showdownLayout(w,h);
  for(const p of [l.player,l.boss,l.card]){expect(p.x).toBeGreaterThan(0);expect(p.x).toBeLessThan(l.width);expect(p.y).toBeGreaterThan(0);expect(p.y).toBeLessThan(l.height);}
  for(const point of [l.player,l.boss]){
   const dx=(point.x-l.deck.x)/(l.deck.width*.4),dy=(point.y-(l.deck.y-l.deck.width*.035*l.deck.flatten))/(l.deck.width*.12*l.deck.flatten);
   expect(dx*dx+dy*dy).toBeLessThan(1);
  }
  expect(l.scale).toBeGreaterThan(0);
  expect(l.y+(l.card.y-217.5*l.cardScale)*l.scale).toBeGreaterThan(0);
  expect(l.y+(l.card.y+217.5*l.cardScale)*l.scale).toBeLessThan(h);
  expect(l.x+(l.card.x-156*l.cardScale)*l.scale).toBeGreaterThan(0);
  expect(l.x+(l.card.x+156*l.cardScale)*l.scale).toBeLessThan(w);
 });
});
it('fits three complete award reveals and the reward flip into a thirteen-second round',()=>{
 for(const round of SHOWDOWNS){expect(round.duration).toBe(13);expect(round.strikes.map(s=>s.at)).toEqual([3,5.8,8.6]);expect(round.strikes.at(-1)!.at+1.05).toBeLessThan(10.1);}
});

it('begins the next native charge on its own clock instead of truncating it behind a fixed recovery hold',()=>{
 const charge=.615;
 expect(showdownReleaseAt('legendary',5.8-.42-charge-.001,charge)).toBeCloseTo(3-.42);
 expect(showdownReleaseAt('legendary',5.8-.42-charge,charge)).toBeCloseTo(5.8-.42);
 expect(showdownReleaseAt('legendary',8.6-.42-charge,charge)).toBeCloseTo(8.6-.42);
 expect(showdownMessage(5.5)).toContain('Fire Blast');expect(showdownMessage(6)).toContain('Second seal broken');expect(showdownMessage(11)).toContain('reward');
});
it.each([[390,844],[320,568],[430,932]])('places portrait opponents across the same battle lane with their contact footprints on the deck at %sx%s',(w,h)=>{
 const l=showdownLayout(w,h);
 expect(Math.abs(l.player.y-l.boss.y)*l.scale).toBeLessThan(12);
 expect((l.boss.x-l.player.x)*l.scale).toBeGreaterThan(w*.4);
 const ellipse={x:l.deck.x,y:l.deck.y-l.deck.width*.035*l.deck.flatten,rx:l.deck.width*.4,ry:l.deck.width*.12*l.deck.flatten};
 for(const [p,s] of [[l.player,l.playerScale],[l.boss,l.bossScale]] as const){
  for(const dx of [-57*s,57*s]){const x=(p.x+dx-ellipse.x)/ellipse.rx,y=(p.y-ellipse.y)/ellipse.ry;expect(x*x+y*y).toBeLessThan(.94);}
 }
});

it.each([[1440,900],[1280,720],[844,390],[390,844],[320,568]])('keeps both opponents on one mirrored depth lane at %sx%s',(w,h)=>{
 const l=showdownLayout(w,h);
 expect(l.player.y).toBe(l.boss.y);
 expect(l.deck.x-l.player.x).toBe(l.boss.x-l.deck.x);
});
