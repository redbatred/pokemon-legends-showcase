import { expect,it } from 'vitest';
import { modalLayout,rewardLayout } from './modalLayout';
import { gameLayout } from './rendering';

it('keeps centered panel frames and headers within phone, landscape and desktop bounds',()=>{
 for(const [w,h] of [[320,540],[390,780],[568,320],[844,390],[1280,720],[1920,1080]]){
  for(const kind of ['collection','history','about','inspect','complete']){
   const f=modalLayout(w,h,kind);
   expect(f.x).toBeGreaterThanOrEqual(0);expect(f.y).toBeGreaterThanOrEqual(0);
   expect(f.x+f.width).toBeLessThanOrEqual(w);expect(f.y+f.height).toBeLessThanOrEqual(h);
   expect(f.x+f.width/2).toBe(w/2);expect(f.y+f.height/2).toBe(h/2);
  }
 }
});
it('reserves the reward between the card and tray without covering mobile controls',()=>{
 for(const [w,h] of [[320,540],[390,780],[568,320],[844,390],[1280,720],[1920,1080]]){
  const l=gameLayout(w,h,true),r=rewardLayout(w,h);
  expect(r.y).toBeGreaterThan(l.worldY+217.5*l.scale);
  expect(r.y+r.size/2+8).toBeLessThan(l.dockTop);
  expect(r.x).toBe(w/2);expect(r.y).toBeCloseTo(l.stageY+l.stageWidth*.5*l.stageFlatten*.317);expect(r.width).toBeLessThan(l.stageWidth*.25);
 }
});

it('keeps Auto Spin count, mode and start hit areas separate in landscape and portrait',async()=>{
 const {autoSpinLayout}=await import('./modalLayout');
 for(const [w,h] of [[320,400],[390,400],[568,320],[560,390],[390,570],[320,568],[560,570]]){
  const l=autoSpinLayout(w,h),targets=[...Array.from({length:9},(_,i)=>l.count(i)),l.individual,l.all,l.start];
  for(const a of targets){expect(a.x).toBeGreaterThanOrEqual(0);expect(a.x+a.width).toBeLessThanOrEqual(w);expect(a.y+a.height).toBeLessThanOrEqual(h);}
  for(let i=0;i<targets.length;i++)for(let j=i+1;j<targets.length;j++){const a=targets[i],b=targets[j];expect(a.x+a.width<=b.x||b.x+b.width<=a.x||a.y+a.height<=b.y||b.y+b.height<=a.y).toBe(true);}
  expect(l.infoY+16).toBeLessThan(l.start.y);
 }
});

it('keeps the short landscape guide clear of its footer',()=>{const f=modalLayout(720,320,'about');expect(f.height).toBe(320);expect(240).toBeLessThan(f.height-73);});

it('fits every cheat chip between the header and the footer, apart from the others, on every screen',async()=>{
 const {cheatsLayout}=await import('./modalLayout');
 for(const [w,h] of [[320,480],[320,568],[360,640],[390,844],[430,932],[568,320],[667,375],[844,390],[768,1024],[800,797],[1024,768],[1280,720],[1920,1080]]){
  const f=modalLayout(w,h,'cheats'),l=cheatsLayout(f.width,f.height),name=`${w}x${h}`;
  expect(f.x,name).toBeGreaterThanOrEqual(0);expect(f.y,name).toBeGreaterThanOrEqual(0);expect(f.x+f.width,name).toBeLessThanOrEqual(w);expect(f.y+f.height,name).toBeLessThanOrEqual(h);
  const chips=[...Array.from({length:7},(_,i)=>l.win(i)),...Array.from({length:5},(_,i)=>l.total(i)),...Array.from({length:4},(_,i)=>l.bonus(i)),...Array.from({length:2},(_,i)=>l.legendary(i))],targets=[...chips,l.reset,l.open];
  for(const chip of chips){expect(chip.y,name).toBeGreaterThanOrEqual(92);expect(chip.y+chip.height,name).toBeLessThanOrEqual(l.ledge-2);expect(chip.width,name).toBeGreaterThanOrEqual(56);expect(chip.height,name).toBeGreaterThanOrEqual(28);}
  for(const a of targets){expect(a.x,name).toBeGreaterThanOrEqual(20);expect(a.x+a.width,name).toBeLessThanOrEqual(f.width-20+.001);expect(a.y+a.height,name).toBeLessThanOrEqual(f.height-12);}
  for(let i=0;i<targets.length;i++)for(let j=i+1;j<targets.length;j++){const a=targets[i],b=targets[j];expect(a.x+a.width<=b.x+.001||b.x+b.width<=a.x+.001||a.y+a.height<=b.y||b.y+b.height<=a.y,name).toBe(true);}
  // Each section's label sits under the header seam and above its own chips, clear of the row before it.
  const rows=[['win',l.win(0),0],['total',l.total(0),l.win(6).y+l.win(6).height],['bonus',l.bonus(0),l.total(4).y+l.total(4).height],['legendary',l.legendary(0),l.strips?l.total(4).y+l.total(4).height:l.bonus(3).y+l.bonus(3).height]] as const;
  for(const [key,first,previous] of rows){const at=l.labels[key];expect(at.y,name+key).toBeGreaterThanOrEqual(82);expect(at.y,name+key).toBeGreaterThanOrEqual(previous+2);expect(at.y+12,name+key).toBeLessThanOrEqual(first.y);}
  expect(l.reset.y,name).toBeGreaterThanOrEqual(l.ledge+8);if(l.info)expect(l.infoY,name).toBeGreaterThan(l.bottom);
 }
});
