import {expect,it} from 'vitest';
import {crowdArrival,crowdFrame,floodlightCue,standBounds} from './stadiumCues';
import {performanceProfile} from './performanceProfiles';
import {gameLayout,performanceFloor} from './rendering';
it('keeps quiet applause moving without requiring raised-arm celebration or sound',()=>{
 const mixes=new Set<number>();
 for(let age=.4;age<8;age+=.13){const p=crowdFrame(age,2,false,false,1);expect(p.from).toBe(0);expect(p.to).toBe(2);expect(p.mix).toBeLessThan(.53);mixes.add(Math.round(p.mix*100));}
 expect(mixes.size).toBeGreaterThan(10);
 expect(crowdFrame(2,2,false,false,0)).toEqual({from:0,to:0,mix:0});
});
it('keeps three cheering poses moving until dismissed and holds one pose under reduced motion',()=>{
 expect(crowdFrame(.05,3).mix).toBeGreaterThan(crowdFrame(.05,2).mix);
 for(let i=0;i<8;i++){
  expect(crowdFrame(-1,i)).toEqual({from:0,to:0,mix:0});
  const poses=new Set<number>();for(let age=2;age<30;age+=.11){const p=crowdFrame(age,i);poses.add(p.from);expect(p.from).toBeGreaterThan(0);expect(p.to).toBeGreaterThan(0);expect(p.mix).toBeGreaterThanOrEqual(0);expect(p.mix).toBeLessThanOrEqual(1);}
  expect([...poses].sort()).toEqual([1,2,3]);expect(crowdFrame(30,i,true)).toEqual(crowdFrame(.5,i,true));expect(crowdFrame(4,i,false,true).mix).toBe(0);
 }
});
it('floodlights converge on charge, respond to reveal, and turn off with the stage',()=>{
 const idle=floodlightCue(1,-1,0,0),charged=floodlightCue(1,1,0,0),hit=floodlightCue(1,-1,1,0);
 expect(charged.focus).toBe(1);expect(charged.strength).toBeGreaterThan(idle.strength);expect(hit.strength).toBeGreaterThan(idle.strength);expect(floodlightCue(0,1,1,1).strength).toBe(0);
});
it('the crowd fills behind the travelling light sweep and is complete when travel ends',()=>{
 for(let i=0;i<8;i++){expect(crowdArrival(1,i)).toBe(0);expect(crowdArrival(0,i)).toBe(1);expect(crowdArrival(.5,i,true)).toBe(1);}
 expect(crowdArrival(.5,0)).toBe(1);expect(crowdArrival(.5,7)).toBe(0);
});
it('seat masks remain inside the architecture and follow bowl perspective',()=>{
 expect(standBounds(.5).top).toBeGreaterThan(standBounds(0).top);
 for(let i=0;i<=100;i++){const b=standBounds(i/100);expect(b.bottom).toBeGreaterThan(b.top);expect(b.bottom).toBeLessThan(.62);}
});
it('grounded species contact the stage in portrait and desktop while flyers stay airborne',()=>{
 for(const [w,h] of [[390,780],[1280,720],[844,390]]){const l=gameLayout(w,h,true),floor=performanceFloor(l);expect(l.worldY+(floor-8)*l.scale).toBeCloseTo(l.stageY+l.stageWidth*.012);}
 for(const s of ['blastoise','charizard','eevee','espeon','gardevoir','umbreon','trevenant','mewtwo'])expect(performanceProfile(s).grounded).toBe(true);
 for(const s of ['lugia','mew','rayquaza','rotom'])expect(performanceProfile(s).grounded).toBe(false);
});
