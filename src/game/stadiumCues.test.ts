import {expect,it} from 'vitest';
import {crowdArrival,crowdPose,floodlightCue,standBounds} from './stadiumCues';
import {performanceProfile} from './performanceProfiles';
import {gameLayout,performanceFloor} from './rendering';
it('staggered celebration returns to the still drawing and stays still under reduced motion',()=>{
 expect(crowdPose(.05,3)).toBeGreaterThan(crowdPose(.05,2));
 for(let i=0;i<8;i++){expect(crowdPose(-1,i)).toBe(0);expect(crowdPose(.5,i)).toBe(1);expect(crowdPose(2,i)).toBe(0);expect(crowdPose(.5,i,true)).toBe(0);}
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
