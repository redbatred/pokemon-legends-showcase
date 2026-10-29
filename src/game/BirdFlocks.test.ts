import {expect,it} from 'vitest';
import {Graphics} from 'pixi.js';
import {BirdFlocks} from './BirdFlocks';

it('renders a sky pass, hides every bird under reduced motion, and disposes shared cels',()=>{
 const birds=new BirdFlocks(1672,941,()=>.5),contexts=new Set(birds.root.children.map(child=>(child as Graphics).context));
 birds.tick(0,false,false);expect(birds.root.visible).toBe(false);expect(birds.showBirds()).toBe(true);
 for(let i=1;i<=100;i++){
  birds.tick(i/20,false,false);
  for(const child of birds.root.children)if(child.visible)contexts.add((child as Graphics).context);
 }
 const visible=birds.root.children.filter(child=>child.visible);
 expect(visible.length).toBeGreaterThanOrEqual(4);expect(visible.length).toBeLessThanOrEqual(9);
 expect(visible.every(child=>child.x>0&&child.x<1672&&child.y>50&&child.y<270)).toBe(true);
 expect(contexts.size).toBeGreaterThanOrEqual(5);
 birds.tick(5.05,true,false);
 expect(birds.root.visible).toBe(false);expect(birds.root.children.every(child=>!child.visible)).toBe(true);expect(birds.showBirds()).toBe(false);
 birds.destroy();expect(birds.root.destroyed).toBe(true);expect([...contexts].every(context=>context.destroyed)).toBe(true);
 expect(()=>birds.destroy()).not.toThrow();expect(birds.showBirds()).toBe(false);
});
