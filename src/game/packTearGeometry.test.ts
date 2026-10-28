import {expect,it} from 'vitest';
import {packTearPoint} from './packTearGeometry';
it('keeps every unbroken seam vertex joined while the split advances',()=>{
 for(const rip of [0,.12,.37,.65,.92])for(let u=0;u<=1-rip;u+=.01){const s={tension:.8,rip,curl:.7,open:0,crumple:0},seal=packTearPoint('seal',u,1,s),body=packTearPoint('body',u,0,s);expect(seal.x).toBeCloseTo(body.x,10);expect(seal.y).toBeCloseTo(body.y,10);}
});
it('keeps the retained corner attached while the mouth opens and the foil folds down',()=>{
 for(const open of [0,.4,1])for(const crumple of [0,.5,1])for(const u of [0,.025,.05,.075]){
  const s={tension:.35,rip:.88,curl:1,open,crumple,pull:1};
  const foil=packTearPoint('seal',u,1,s),body=packTearPoint('body',u,0,s);
  expect(foil.x).toBeCloseTo(body.x,8);expect(foil.y).toBeCloseTo(body.y,8);
 }
});
it('separates only released foil and keeps the lower printed body rigid before collapse',()=>{
 const s={tension:1,rip:.65,curl:.75,open:0,crumple:0};expect(packTearPoint('seal',.8,1,s).y).toBeLessThan(packTearPoint('body',.8,0,s).y-10);
 expect(packTearPoint('body',.2,1,s)).toEqual({x:.2*230-115,y:210.5});
});
it('folds the released foil down beside the wrapper without moving the retained corner',()=>{
 const s={tension:.35,rip:.88,curl:1,open:1,crumple:0,pull:0};
 const lifted=packTearPoint('seal',1,1,s),pulled=packTearPoint('seal',1,1,{...s,pull:1});
 expect(pulled.x).toBeLessThan(-115);expect(pulled.y).toBeGreaterThan(lifted.y+100);
 for(let u=0;u<=1;u+=.02)for(let v=0;v<=1;v+=.1){const p=packTearPoint('seal',u,v,{...s,pull:1});expect(Number.isFinite(p.x+p.y)).toBe(true);}
});
