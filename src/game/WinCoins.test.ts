import {expect,it} from 'vitest';
import {Matrix4,Vector3,type InstancedMesh} from 'three';
import {WinCoins} from './WinCoins';

const FLOOR=.575,toward=new Vector3(0,0,-1);
const heights=(coins:WinCoins)=>{const mesh=coins.root.children[1] as InstancedMesh,m=new Matrix4(),p=new Vector3(),out:number[]=[];for(let i=0;i<mesh.count;i++){mesh.getMatrixAt(i,m);if(m.elements[0]===0&&m.elements[5]===0)continue;p.setFromMatrixPosition(m);out.push(p.y);}return out;};
const run=(coins:WinCoins,seconds:number)=>{for(let t=0;t<seconds;t+=1/60)coins.update(1/60);};

it('throws coins from the strike, never through the floor, and lets every one come to rest',()=>{
 const coins=new WinCoins(FLOOR,64);coins.burst(new Vector3(0,FLOOR,4),toward,40);
 expect(coins.active).toBe(40);expect(coins.resting).toBe(0);
 let peak=0;for(let t=0;t<5;t+=1/60){coins.update(1/60);for(const y of heights(coins)){expect(y).toBeGreaterThanOrEqual(FLOOR);peak=Math.max(peak,y);}}
 expect(peak).toBeGreaterThan(FLOOR+.6);expect(coins.resting).toBe(40);
 for(const y of heights(coins))expect(y).toBeLessThan(FLOOR+.05);
 coins.dispose();
});
it('lands most coins between the strike and the Pokémon',()=>{
 const coins=new WinCoins(FLOOR,64),origin=new Vector3(0,FLOOR,4);coins.burst(origin,toward,60);run(coins,5);
 const mesh=coins.root.children[1] as InstancedMesh,m=new Matrix4(),p=new Vector3();let ahead=0,total=0;
 for(let i=0;i<mesh.count;i++){mesh.getMatrixAt(i,m);if(m.elements[0]===0&&m.elements[5]===0)continue;p.setFromMatrixPosition(m);total++;if(p.z<origin.z)ahead++;}
 expect(total).toBe(60);expect(ahead/total).toBeGreaterThan(.85);coins.dispose();
});
it('makes landed coins hop when a later wave passes under them, nearest first',()=>{
 const coins=new WinCoins(FLOOR,64),origin=new Vector3(0,FLOOR,4);coins.burst(origin,toward,30);run(coins,5);expect(coins.resting).toBe(30);
 coins.shock(origin,1.5);run(coins,.5);
 expect(coins.resting).toBeLessThan(30);expect(Math.max(...heights(coins))).toBeGreaterThan(FLOOR+.1);
 run(coins,5);expect(coins.resting).toBe(30);coins.dispose();
});
it('recycles the oldest coins at capacity and clears on demand',()=>{
 const coins=new WinCoins(FLOOR,16);coins.burst(new Vector3(0,FLOOR,4),toward,40);expect(coins.active).toBe(16);
 coins.clear();expect(coins.active).toBe(0);expect(heights(coins)).toHaveLength(0);coins.dispose();
});
