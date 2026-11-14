import {expect,it} from 'vitest';
import {packResultsFrame,packResultsLayout,autoResultsLayout,collectionFlight} from './packResultsLayout';
it('fits all eleven results between the summary and actions without card collisions',()=>{for(const [w,h] of [[320,400],[375,450],[500,390],[520,390],[320,568],[390,780],[430,932],[568,320],[844,390],[1280,780],[1920,1080]]){const f=packResultsFrame(w,h),l=packResultsLayout(f.width,f.height);expect(f.x).toBeGreaterThan(0);expect(f.y+f.height).toBeLessThan(h);const slots=Array.from({length:11},(_,i)=>l.slot(i));for(const a of slots){expect(a.x-a.width/2).toBeGreaterThan(12);expect(a.x+a.width/2).toBeLessThan(f.width-12);expect(a.y-a.height/2).toBeGreaterThan(l.total.y+l.total.height/2+5);expect(a.y+a.height/2+18).toBeLessThanOrEqual(f.height-81);}for(let i=0;i<11;i++)for(let j=i+1;j<11;j++){const a=slots[i],b=slots[j];expect(Math.abs(a.x-b.x)>=(a.width+b.width)/2+5||Math.abs(a.y-b.y)>=(a.height+b.height)/2+15).toBe(true);}}});
it('carries the same cards continuously from tray to collection slots',()=>{const a={x:100,y:700},b={x:400,y:200};expect(collectionFlight(0,a,b,0)).toMatchObject({...a,scale:0,rotation:0});expect(collectionFlight(1,a,b,10)).toMatchObject({...b,scale:1,done:true});for(const t of [.1,.5,.9]){const p=collectionFlight(t,a,b,3);expect(p.y).toBeLessThan(a.y);expect(Number.isFinite(p.x)).toBe(true);}});

it('keeps the single win hero centered and large, above all pack cards',()=>{
 for(const [w,h] of [[390,780],[1280,780]]){const f=packResultsFrame(w,h),l=packResultsLayout(f.width,f.height);expect(l.total.x).toBe(f.width/2);expect(l.total.height).toBeGreaterThanOrEqual(100);expect(l.total.width).toBeGreaterThan(280);}
});

it('keeps every auto-session pack reachable without overlapping the win hero or footer',()=>{
 for(const [w,h] of [[320,400],[390,780],[568,320],[1280,780]]){
  const f=packResultsFrame(w,h),l=autoResultsLayout(f.width,f.height),seen=[];
  for(let start=0;start<100;start+=l.capacity)for(let i=0;i<Math.min(l.capacity,100-start);i++){const r=l.slot(i);seen.push(start+i);expect(r.x).toBeGreaterThanOrEqual(20);expect(r.x+r.width).toBeLessThanOrEqual(f.width-20);expect(r.y).toBeGreaterThan(l.total.y+l.total.height/2+5);expect(r.y+r.height).toBeLessThanOrEqual(f.height-81);}
  expect(seen).toHaveLength(100);expect(new Set(seen).size).toBe(100);
 }
});

it('fits a short demo pack without reserving empty rows for eleven cards',()=>{const full=packResultsLayout(402,680),short=packResultsLayout(402,680,5);expect(short.slot(0).width).toBeGreaterThan(full.slot(0).width);for(let i=0;i<5;i++){const p=short.slot(i);expect(p.y+p.height/2+18).toBeLessThan(600);expect(p.y-p.height/2).toBeGreaterThan(short.total.y+short.total.height/2);}});
