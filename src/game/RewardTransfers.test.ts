import {expect,it,vi} from 'vitest';
vi.mock('./audio',()=>({playSound:vi.fn()}));
vi.mock('./MoneyReadout',async()=>{const {Container}=await import('pixi.js');return {MoneyReadout:class extends Container{display(){} override getLocalBounds(){return {width:80} as ReturnType<InstanceType<typeof Container>['getLocalBounds']>;}}};});
import {RewardTransfers} from './RewardTransfers';
it('holds the card amount without crediting until the player advances',()=>{
 const credit=vi.fn(),r=new RewardTransfers(credit,()=>{});r.reset('pack');r.reveal(0,4500,false);
 for(let i=0;i<1200;i++)r.update(.05,1280,720,false);
 expect(r.ledger.total).toBe(0);expect(credit).not.toHaveBeenCalled();expect(r.root.children.length).toBeGreaterThan(1);
 r.rush();expect(credit).not.toHaveBeenCalled();
 for(let i=0;i<10;i++)r.update(.05,390,780,false);
 expect(r.ledger.total).toBe(4500);expect(credit).toHaveBeenCalledOnce();
 r.reveal(0,4500,false);r.rush();r.update(.05,390,780,false);expect(credit).toHaveBeenCalledOnce();r.destroy();
});
it('also waits for advance with reduced motion instead of crediting at reveal',()=>{
 const credit=vi.fn(),r=new RewardTransfers(credit,()=>{});r.reset('pack');r.reveal(0,2500,true);
 for(let i=0;i<100;i++)r.update(.05,390,780,true);
 expect(r.ledger.total).toBe(0);expect(credit).not.toHaveBeenCalled();
 r.rush();r.update(.05,390,780,true);expect(r.ledger.total).toBe(2500);expect(credit).toHaveBeenCalledOnce();r.destroy();
});
it('completes a visible reward flight before crediting during immediate reveal all',()=>{
 const credit=vi.fn(),r=new RewardTransfers(credit,()=>{});r.reset('pack');r.reveal(0,4500,false);r.update(.05,1280,720,false);
 r.rush();expect(credit).not.toHaveBeenCalled();r.deposit(0,4500);expect(credit).not.toHaveBeenCalled();expect(r.ledger.total).toBe(0);
 for(let i=0;i<3;i++)r.update(.05,1280,720,false);
 expect(credit).toHaveBeenCalledOnce();expect(credit).toHaveBeenCalledWith(4500);r.deposit(0,4500);expect(credit).toHaveBeenCalledOnce();r.destroy();
});
it('keeps an in-flight award through resizing and stops old-pack credits on reset',()=>{
 const credit=vi.fn(),r=new RewardTransfers(credit,()=>{});r.reset('a');r.reveal(0,75,false);for(let i=0;i<11;i++)r.update(.05,1280,720,false);r.rush();r.update(.05,390,780,false);expect(credit).not.toHaveBeenCalled();r.reset('b');r.update(.05,390,780,false);expect(credit).not.toHaveBeenCalled();r.reveal(0,25,true);r.rush();r.update(.05,390,780,true);expect(credit).toHaveBeenCalledWith(25);r.destroy();
});
