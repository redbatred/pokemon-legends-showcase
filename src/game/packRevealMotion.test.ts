import {expect,it} from 'vitest';
import {packRevealLayout,packRevealPose,PACK_REVEAL} from './packRevealMotion';
it('fits every face and price between the HUD, controls and tray at each supported size',()=>{
 for(const [w,h] of [[320,400],[320,568],[390,780],[430,932],[568,320],[844,390],[1280,780],[1920,1080]])for(const n of [1,5,11]){
  const l=packRevealLayout(w,h,n),slots=Array.from({length:n},(_,i)=>l.slot(i));
  for(const s of slots){expect(s.x-s.width/2).toBeGreaterThanOrEqual(10);expect(s.x+s.width/2).toBeLessThanOrEqual(w-10);expect(s.y-s.height/2).toBeGreaterThanOrEqual(l.top-1);expect(s.y+s.height/2+l.priceHeight).toBeLessThanOrEqual(l.bottom+1);}
  for(let a=0;a<n;a++)for(let b=a+1;b<n;b++){const p=slots[a],q=slots[b];expect(Math.abs(p.x-q.x)>=p.width+5||Math.abs(p.y-q.y)>=p.height+l.priceHeight+5).toBe(true);}
 }
});
it('turns every card on the same beat, then holds the full formation before any tray departure',()=>{
 for(let i=0;i<11;i++){
  expect(packRevealPose(0,i)).toMatchObject({spread:0,front:false,price:0});
  expect(packRevealPose(PACK_REVEAL.flip-.01,i).front).toBe(false);
  expect(packRevealPose(PACK_REVEAL.face+.01,i).front).toBe(true);
  expect(packRevealPose(PACK_REVEAL.depart-.01,i)).toMatchObject({spread:1,front:true,price:1,flip:0});
 }
 expect(PACK_REVEAL.depart-PACK_REVEAL.face).toBeGreaterThan(1.7);
});
