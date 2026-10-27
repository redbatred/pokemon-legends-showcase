import {expect,it} from 'vitest';
import {floodlightBulbs,projectFloodlights} from './floodlightGeometry';
import {groundWarp} from './backdropMotion';
it('maps all42 painted bulbs without substituting a bank-centre emitter',()=>{
 expect(floodlightBulbs).toHaveLength(42);expect(new Set(floodlightBulbs.map(b=>`${b.u},${b.v}`)).size).toBe(42);
 for(let bank=0;bank<2;bank++)for(let row=0;row<3;row++)expect(floodlightBulbs.filter(b=>b.bank===bank&&b.row===row)).toHaveLength(7);
 const sockets=projectFloodlights((u,v)=>({x:u*1672,y:v*941}));expect(sockets[0].x).toBeCloseTo(229.92);expect(sockets[0].y).toBeCloseTo(224.79);expect(sockets[21].x).toBeCloseTo(1442.01);expect(sockets[21].y).toBeCloseTo(224.11);
});
it('every bulb follows the same floor warp and scale as the painted architecture',()=>{
 for(const scale of [.45,1,1.8])for(const shift of [-170,0,220]){
  const project=(u:number,v:number)=>({x:200+u*1672*scale,y:100+(v*941+shift*groundWarp(v))*scale});
  const sockets=projectFloodlights(project);sockets.forEach((s,i)=>{const b=floodlightBulbs[i],expected=project(b.u,b.v);expect(s.x).toBeCloseTo(expected.x);expect(s.y).toBeCloseTo(expected.y);expect(s.width).toBeGreaterThan(2);expect(s.height).toBeGreaterThan(2);expect(Number.isFinite(s.rotation)).toBe(true);});
 }
});
