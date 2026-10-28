import {expect,it} from 'vitest';
import {packTearPoint} from './packTearGeometry';
it('keeps every unbroken seam vertex joined while the split advances',()=>{
 for(const rip of [0,.12,.37,.65,.92])for(let u=0;u<=1-rip;u+=.01){const s={tension:.8,rip,curl:.7,open:0,crumple:0},seal=packTearPoint('seal',u,1,s),body=packTearPoint('body',u,0,s);expect(seal.x).toBeCloseTo(body.x,10);expect(seal.y).toBeCloseTo(body.y,10);}
});
it('separates only released foil and keeps the lower printed body rigid before collapse',()=>{
 const s={tension:1,rip:.65,curl:.75,open:0,crumple:0};expect(packTearPoint('seal',.8,1,s).y).toBeLessThan(packTearPoint('body',.8,0,s).y-10);
 expect(packTearPoint('body',.2,1,s)).toEqual({x:.2*230-115,y:210.5});
});
it('keeps the attached peel near the original pack top, then flexes across its width in flight',()=>{
 const s={tension:.35,rip:1.12,curl:1,open:1,crumple:0,flight:0};
 for(let u=0;u<=1;u+=.02)for(let v=0;v<=1;v+=.1)expect(packTearPoint('seal',u,v,s).y).toBeGreaterThan(-221);
 const offsets=[.2,.5,.8].map(u=>packTearPoint('seal',u,.5,{...s,flight:.4}).y-packTearPoint('seal',u,.5,s).y);
 expect(Math.max(...offsets)-Math.min(...offsets)).toBeGreaterThan(5);
});
