import {expect,it,vi} from 'vitest';
vi.mock('./audio',()=>({playSound:vi.fn()}));
vi.mock('./MoneyReadout',async()=>{const {Container}=await import('pixi.js');return {MoneyReadout:class extends Container{display=vi.fn(); override getLocalBounds(){return {width:80} as ReturnType<InstanceType<typeof Container>['getLocalBounds']>;}}};});
vi.mock('./WinCelebration',async()=>{const actual=await vi.importActual<typeof import('./WinCelebration')>('./WinCelebration'),{Container}=await import('pixi.js');return {...actual,WinCelebration:class{root=new Container();background=new Container();update(){} amountPose(){return null;}finish(){}destroy(){this.root.destroy();this.background.destroy();}}};});
import {RewardTransfers} from './RewardTransfers';
import {openingAnimationRate} from './autoSpin';
import {WIN_CINEMA_FINISH} from './winCinemaMotion';
it('counts a special automatic award to the exact amount before advancing, with credit still pending',()=>{
 const credit=vi.fn(),r=new RewardTransfers(credit,()=>{});r.reset('auto');r.reveal(0,45678,false,'big');
 for(let i=0;i<Math.ceil((WIN_CINEMA_FINISH+.05)/(.05*openingAnimationRate(false,true)));i++)r.update(.05,390,780,false,openingAnimationRate(false,true));
 const flight=(r as any).flights[0];expect(flight.countFinished).toBe(true);expect(flight.label.display).toHaveBeenLastCalledWith(45678);expect(flight.transferAge).toBeNull();expect(credit).not.toHaveBeenCalled();r.destroy();
});
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
it('snaps the visible amount to its exact value without crediting before Next',()=>{
 const credit=vi.fn(),r=new RewardTransfers(credit,()=>{});r.reset('skip');r.reveal(0,6789,false);r.finish(0);
 r.update(0,1280,720,false);const f=(r as any).flights[0];expect(f.age).toBeGreaterThanOrEqual(1);expect(f.transferAge).toBe(null);expect(f.label.alpha).toBe(1);expect(r.ledger.total).toBe(0);expect(credit).not.toHaveBeenCalled();
 r.rush();for(let i=0;i<10;i++)r.update(.05,1280,720,false);expect(credit).toHaveBeenCalledWith(6789);r.destroy();
});

it('finishes a cinematic on first tap without crediting and advances only on a subsequent tap',()=>{
 const credit=vi.fn(),r=new RewardTransfers(credit,()=>{});r.reset('cinematic');r.reveal(0,200000,false,'epic');r.update(.05,390,780,false);r.finish(0);r.update(0,390,780,false);const f=(r as any).flights[0];expect(f.label.display).toHaveBeenLastCalledWith(200000);expect(f.age).toBeGreaterThan(WIN_CINEMA_FINISH);expect(credit).not.toHaveBeenCalled();r.rush();for(let i=0;i<12;i++)r.update(.05,390,780,false);expect(credit).not.toHaveBeenCalled();for(let i=0;i<10;i++)r.update(.05,390,780,false);expect(credit).toHaveBeenCalledExactlyOnceWith(200000,true);r.destroy();
});

it('keeps the card transfer waiting until the cinematic and award flight have cleared',async()=>{
 const credit=vi.fn(),depart=vi.fn(),r=new RewardTransfers(credit,()=>{});r.reset('return');r.reveal(0,9000,false,'big');r.finish(0);
 const returned=r.beforeCardTransfer().then(depart);
 r.update(.05,390,844,false);await Promise.resolve();expect(depart).not.toHaveBeenCalled();expect(r.actorOcclusion).toBe(1);
 for(let i=0;i<21;i++)r.update(.05,390,844,false);
 await returned;expect(depart).toHaveBeenCalledOnce();expect(credit).toHaveBeenCalledExactlyOnceWith(9000,true);r.destroy();
});
it('releases a pending card handoff when its opening is reset',async()=>{
 const r=new RewardTransfers(()=>{},()=>{});r.reset('old');r.reveal(0,9000,false,'big');const pending=r.beforeCardTransfer();r.reset('new');await pending;expect(r.ledger.total).toBe(0);r.destroy();
});
it('reveals the normal background during recovery while keeping its actor hidden',()=>{
 const r=new RewardTransfers(()=>{},()=>{});r.reset('coverage');r.reveal(0,9000,false,'big');r.finish(0);
 expect(r.backgroundOcclusion).toBe(1);r.rush();for(let i=0;i<9;i++)r.update(.05,390,844,false);
 expect(r.actorOcclusion).toBe(1);expect(r.backgroundOcclusion).toBeLessThan(.5);
 r.destroy();
});
it('holds background preparation until the stadium return has fully cleared',async()=>{
 const r=new RewardTransfers(()=>{},()=>{});r.reset('warm');r.reveal(0,9000,false,'big');let ready=false;
 const pending=r.waitForWinRecovery().then(()=>ready=true);
 for(let i=0;i<130;i++)r.update(.05,390,844,false);
 await Promise.resolve();expect(ready).toBe(false);
 for(let i=0;i<24;i++)r.update(.05,390,844,false);
 await Promise.resolve();expect(ready).toBe(false);r.rush();
 for(let i=0;i<22;i++)r.update(.05,390,844,false);
 await pending;expect(ready).toBe(true);r.destroy();
});
it('releases pending background preparation on reset without leaving a hanging promise',async()=>{
 const r=new RewardTransfers(()=>{},()=>{});r.reveal(0,9000,false,'big');const pending=r.waitForWinRecovery();r.reset('next');await pending;r.destroy();
});

it('retains the final strike scale at the start of an early return',()=>{
 const r=new RewardTransfers(()=>{},()=>{});r.reveal(0,9000,false,'big');
 for(let i=0;i<124;i++)r.update(.05,390,844,false);
 const f=(r as any).flights[0],before=f.label.scale.y;r.rush();r.update(0,390,844,false);
 expect(f.label.scale.y).toBeCloseTo(before,6);r.destroy();
});
