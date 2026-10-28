import {expect,it} from 'vitest';
import {floodlightBulbs,projectFloodlights,floodlightCone} from './floodlightGeometry';
import {groundWarp} from './backdropMotion';
it('maps all42 painted bulbs without substituting a bank-centre emitter',()=>{
 expect(floodlightBulbs).toHaveLength(42);expect(new Set(floodlightBulbs.map(b=>`${b.u},${b.v}`)).size).toBe(42);
 for(let bank=0;bank<2;bank++)for(let row=0;row<3;row++)expect(floodlightBulbs.filter(b=>b.bank===bank&&b.row===row)).toHaveLength(7);
 const sockets=projectFloodlights((u,v)=>({x:u*1672,y:v*941}));expect(sockets[0].x).toBeCloseTo(229.92);expect(sockets[0].y).toBeCloseTo(224.79);expect(sockets[21].x).toBeCloseTo(1442.01);expect(sockets[21].y).toBeCloseTo(224.11);
});
it('widens with throw distance and overlaps across a reveal area instead of pinching to a point',()=>{
 const target={x:640,y:430},left=floodlightCone({x:180,y:140},target),right=floodlightCone({x:1100,y:140},target);
 expect(left.width*left.receiver).toBeGreaterThan(280);expect(left.width).toBeCloseTo(right.width);
 expect(left.receiver).toBeGreaterThan(.8);expect(left.receiver).toBeLessThan(.9);
 const twice=floodlightCone({x:0,y:0},{x:920,y:580});expect(twice.width).toBeCloseTo(left.width*2);
 expect(-Math.sin(left.rotation)*left.length*left.receiver).toBeCloseTo(460);
 expect(Math.cos(left.rotation)*left.length*left.receiver).toBeCloseTo(290);
});
it('every bulb follows the same floor warp and scale as the painted architecture',()=>{
 for(const scale of [.45,1,1.8])for(const shift of [-170,0,220]){
  const project=(u:number,v:number)=>({x:200+u*1672*scale,y:100+(v*941+shift*groundWarp(v))*scale});
  const sockets=projectFloodlights(project);sockets.forEach((s,i)=>{const b=floodlightBulbs[i],expected=project(b.u,b.v);expect(s.x).toBeCloseTo(expected.x);expect(s.y).toBeCloseTo(expected.y);expect(s.width).toBeGreaterThan(2);expect(s.height).toBeGreaterThan(2);expect(Number.isFinite(s.rotation)).toBe(true);});
 }
});
