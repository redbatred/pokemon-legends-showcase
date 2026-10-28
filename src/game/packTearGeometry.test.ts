import {expect,it} from 'vitest';
import {packTearPoint} from './packTearGeometry';
it('keeps every unbroken seam vertex joined while the split advances',()=>{
 for(const rip of [0,.12,.37,.65,.92])for(let u=0;u<=1-rip;u+=.01){const s={tension:.8,rip,curl:.7,open:0,crumple:0},seal=packTearPoint('seal',u,1,s),body=packTearPoint('body',u,0,s);expect(seal.x).toBeCloseTo(body.x,10);expect(seal.y).toBeCloseTo(body.y,10);}
});
it('separates only released foil and keeps the lower printed body rigid before collapse',()=>{
 const s={tension:1,rip:.65,curl:.75,open:0,crumple:0};expect(packTearPoint('seal',.8,1,s).y).toBeLessThan(packTearPoint('body',.8,0,s).y-10);
 expect(packTearPoint('body',.2,1,s)).toEqual({x:.2*230-115,y:210.5});
});
