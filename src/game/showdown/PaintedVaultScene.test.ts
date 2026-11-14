import {expect,it,vi} from 'vitest';
import {paintedVaultPlacement,PaintedVaultScene} from './PaintedVaultScene';
import {showdownLayout} from './showdownModel';

for(const [w,h,iw,ih] of [[1440,900,1536,1024],[1920,1080,1536,1024],[390,844,1024,1536],[768,1024,1024,1536],[568,320,1536,1024]]){
 it(`aligns the painted contact line with both actor feet at ${w}×${h}`,()=>{
  const p=paintedVaultPlacement(w,h,iw,ih),l=showdownLayout(w,h);
  expect(p.y+p.height*.70).toBeCloseTo(l.y+l.player.y*l.scale,7);
  expect(p.y+p.height*.70).toBeCloseTo(l.y+l.boss.y*l.scale,7);
  expect(p.x+p.width/2).toBeCloseTo(w/2,7);
  expect(p.width).toBeGreaterThanOrEqual(w-1e-6);expect(p.height).toBeGreaterThanOrEqual(h-1e-6);
  expect(p.width/p.height).toBeCloseTo(iw/ih,7);
 });
}
it('switches to portrait composition at the same boundary as the actor layout',()=>{
 expect(paintedVaultPlacement(1200,1000,1024,1536).portrait).toBe(true);
 expect(paintedVaultPlacement(1201,1000,1536,1024).portrait).toBe(false);
});

it('accelerates rock motion continuously on seal loss and freezes it while paused',()=>{
 const sample=vi.fn(),scene=Object.assign(Object.create(PaintedVaultScene.prototype),{dead:false,active:true,paused:false,time:0,rockTime:0,lastTime:0,impactAge:100,impactStrength:0,reveal:0,guardCount:3,reduced:false,water:[],rocks:{sample,rig:{}},painting:{}}) as PaintedVaultScene;
 scene.tick(.1,false,false);expect(sample.mock.calls.at(-1)![0]).toBeCloseTo(.1);
 scene.setBoard({phase:'showdown',packName:'Legendary Showdown',index:2});expect(sample.mock.calls.at(-1)![0]).toBeCloseTo(.1);
 scene.tick(.2,false,false);expect(sample.mock.calls.at(-1)![0]).toBeCloseTo(.212);
 scene.pause(true);scene.tick(2,false,false);expect(sample.mock.calls.at(-1)![0]).toBeCloseTo(.212);
});
