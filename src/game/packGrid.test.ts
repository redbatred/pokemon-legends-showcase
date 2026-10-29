import {expect,it} from 'vitest';
import {packGridLayout} from './packGrid';
it('keeps every pack and hit area on screen without any scrolling',()=>{
 for(const [w,h] of [[320,568],[390,780],[430,932],[568,320],[844,390],[768,1024],[1280,720],[1920,1080]]){
  const grid=packGridLayout(w,h,10),tiles=Array.from({length:10},(_,i)=>grid.slot(i));
  for(const t of tiles){expect(t.width).toBeGreaterThanOrEqual(44);expect(t.height).toBeGreaterThanOrEqual(64);expect(t.x).toBeGreaterThanOrEqual(0);expect(t.x+t.width).toBeLessThanOrEqual(w);expect(t.y).toBeGreaterThan(0);expect(t.y+t.height).toBeLessThanOrEqual(h);}
  for(let i=0;i<tiles.length;i++)for(let j=i+1;j<tiles.length;j++){const a=tiles[i],b=tiles[j];expect(a.x+a.width<=b.x||b.x+b.width<=a.x||a.y+a.height<=b.y||b.y+b.height<=a.y).toBe(true);}
 }
});
