import {expect,it} from 'vitest';
import {utilityLayout} from './utilityLayout';
import {gameLayout,revealControlsLayout} from './rendering';
import {packGridLayout,packTileLayout} from './packGrid';
const sizes=[[320,568],[390,780],[430,932],[568,320],[844,390],[768,1024],[1280,720],[1920,1080]];
it('keeps all four left controls equally sized and separated, including hover and captions',()=>{
 for(const [w,h] of [...sizes,[699,780],[700,780],[899,700],[900,700],[1024,1366],[560,320]])for(const opening of [false,true]){
  const u=utilityLayout(w,h,opening),buttons=[u.binder,u.history,u.turbo,u.auto];
  for(const b of buttons){expect(b).toBeDefined();expect(b.width).toBe(u.turbo.width);expect(b.height).toBe(u.turbo.height);}
  const all=[...buttons,u.settings,u.sound];
  for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++){
   const a=all[i],b=all[j];
   expect(a.x+a.width+6<=b.x||b.x+b.width+6<=a.x||a.y+a.height+6<=b.y||b.y+b.height+6<=a.y,`${w}×${h}, opening ${opening}, controls ${i}/${j}`).toBe(true);
  }
 }
});
it('gives both utilities separate reachable bounds outside the stage on every layout',()=>{
 for(const [w,h] of sizes)for(const opening of [false,true]){
  const l=gameLayout(w,h,opening),u=utilityLayout(w,h,opening);
  for(const r of [u.turbo,u.auto]){expect(r.width).toBeGreaterThanOrEqual(l.compact?36:40);expect(r.height).toBeGreaterThanOrEqual(44);expect(r.x).toBeGreaterThanOrEqual(0);expect(r.x+r.width).toBeLessThanOrEqual(w);expect(r.y+r.height).toBeLessThanOrEqual(l.dockTop);expect(r.y+r.height).toBeLessThan(l.compact?l.dockTop:l.top+106);}
  const a=u.turbo,b=u.auto;expect(a.x+a.width<=b.x||b.x+b.width<=a.x||a.y+a.height<=b.y||b.y+b.height<=a.y).toBe(true);
 }
});
it('reserves separate artwork, two-line names and centered price bands',()=>{
 for(const [w,h] of sizes){const s=packGridLayout(w,h).slot(0),p=packTileLayout(s.width,s.height);expect(p.artHeight).toBeGreaterThan(24);expect(p.nameY).toBeGreaterThanOrEqual(p.artHeight+5);expect(p.priceY).toBeGreaterThanOrEqual(p.nameY+p.nameHeight+3);expect(p.priceY+p.priceHeight).toBeLessThanOrEqual(s.height);}
});

it('keeps utility icons aligned with the header and Next aligned with the card',()=>{
 for(const [w,h] of sizes){const l=gameLayout(w,h,true),u=utilityLayout(w,h,true),c=revealControlsLayout(w,h);expect(u.auto.y).toBe(u.turbo.y);expect(u.turbo.y+u.turbo.height).toBeLessThanOrEqual(l.compact?148:196);expect(c.next.x).toBeGreaterThan(w/2);expect(c.next.y).toBeCloseTo(l.worldY-8*l.scale);}
});

it('keeps compact utilities above the reveal controls',()=>{for(const [w,h] of [[568,320],[667,375],[844,390]]){const u=utilityLayout(w,h,true),c=revealControlsLayout(w,h);for(const r of [u.turbo,u.auto])for(const b of [c.all,c.next])expect(r.x+r.width<b.x-b.size/2-4||r.x>b.x+b.size/2+4||r.y+r.height<b.y-b.size/2-4).toBe(true);}});
