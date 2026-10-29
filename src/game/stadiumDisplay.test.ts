import {expect,it} from 'vitest';
import {wallScreenPoint,screenTextWindow,arenaMessages} from './stadiumDisplayGeometry';
it('fits the two curved blue wall bays and leaves the entrance and pale masonry exposed',()=>{
 for(const side of [0,1] as const)for(let i=0;i<=30;i++){
  const t=i/30,top=wallScreenPoint(side,t,0),bottom=wallScreenPoint(side,t,1);
  expect(bottom.v).toBeGreaterThan(top.v+.025);expect(top.v).toBeGreaterThan(.55);expect(bottom.v).toBeLessThan(.659);
  for(const p of [top,bottom]){expect(p.u).toBeGreaterThan(.137);expect(p.u).toBeLessThan(.866);expect(side===0?p.u<.466:p.u>.534).toBe(true);}
 }
 expect(wallScreenPoint(0,0,0).v).toBeLessThan(wallScreenPoint(0,1,0).v-.04);
});
it('does not announce hidden card details until a reveal cue makes them visible',()=>{
 const state={phase:'revealing',packName:'Obsidian Flames',index:0,cardName:'Charizard ex',cardValue:4500,special:true};
 expect(JSON.stringify(arenaMessages(state,0))).not.toMatch(/Charizard|45.00/);
 expect(JSON.stringify(arenaMessages({...state,phase:'revealed'},0))).toMatch(/45.00/);
 expect(JSON.stringify(arenaMessages({phase:'sealed',packName:'Obsidian Flames',index:0},0))).toMatch(/CUT THE SEAL/);
});

it('keeps screen captions in the wall portion visible on a cropped phone view',()=>{
 const a=screenTextWindow(0,.36,.64),b=screenTextWindow(1,.36,.64);expect(a.center).toBeGreaterThan(.8);expect(b.center).toBeLessThan(.2);expect(a.span).toBeGreaterThan(.25);expect(a.span).toBeLessThan(.4);expect(a.center+a.span/2).toBeLessThanOrEqual(1);expect(b.center-b.span/2).toBeGreaterThanOrEqual(0);
});
