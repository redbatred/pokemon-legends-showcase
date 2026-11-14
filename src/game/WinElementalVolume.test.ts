import {expect,it} from 'vitest';
import {PerspectiveCamera,Vector3,type InstancedMesh} from 'three';
import {WinElementalVolume} from './WinElementalVolume';
import {elementalPath,elementalBeat} from './elementalPerformance';
import {winCinemaGeometry} from './winCinemaMotion';
const camera=()=>{const c=new PerspectiveCamera(39,540/720,.08,90);c.position.set(0,3,9);c.lookAt(0,1,0);c.updateMatrixWorld();return c;};
it('begins in the moving muzzle direction and meets the score in perspective',()=>{
 const c=camera(),socket={position:new Vector3(.1,2,0),direction:new Vector3(0,.4,1).normalize()};
 const path=elementalPath(socket,c,540,720,6.12,'big',-1);
 expect(path.getTangent(0).dot(socket.direction)).toBeGreaterThan(.999);
 const tip=path.getPoint(1).project(c),amountY=winCinemaGeometry(540,720,false,6.12).amountY;
 expect((.5-tip.y*.5)*720).toBeCloseTo(amountY,3);expect(tip.x).toBeCloseTo(0,4);
 socket.position.x+=.4;const next=elementalPath(socket,c,540,720,6.13,'big',-1);expect(next.getPoint(0).x).toBeCloseTo(.5);
});
it('keeps both live cannon emitters and contact burst within fixed GPU pools',()=>{
 const fx=new WinElementalVolume('mega','water',0x88ccff,false),c=camera(),sockets=[-1,1].map(x=>({position:new Vector3(x,2,0),direction:new Vector3(0,0,1)}));
 for(let age=5.13;age<7.3;age+=1/60){fx.update(age,540,720,c,sockets);for(const object of fx.root.children)if('isInstancedMesh' in object){const mesh=object as InstancedMesh;expect(mesh.count).toBeLessThanOrEqual(mesh.instanceMatrix.count);expect(mesh.instanceMatrix.array.every(Number.isFinite)).toBe(true);}}
 fx.update(7.3,540,720,c,sockets);expect(fx.root.visible).toBe(false);fx.dispose();
});
it('never emits before release, and completes its tail before the effect ends',()=>{
 expect(elementalBeat(5.6,'big')!.travel).toBe(0);expect(elementalBeat(6.12,'big')!.travel).toBe(1);expect(elementalBeat(6.4,'big')!.tail).toBe(1);
 const fx=new WinElementalVolume('big','fire',0xff8800,true),c=camera();fx.update(5.6,540,720,c,[]);expect(fx.root.visible).toBe(false);fx.update(5.6,540,720,c,[{position:new Vector3(),direction:new Vector3(0,0,1)}],true);expect(fx.root.visible).toBe(false);fx.dispose();
});
