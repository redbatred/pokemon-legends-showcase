import { expect, it } from 'vitest';
import { createActor } from 'xstate';
import { openingMachine } from './machine';
it('gates duplicate purchase and reveal inputs until animation completion', () => {
  const actor = createActor(openingMachine).start();
  actor.send({ type: 'OPEN' }); actor.send({ type: 'OPEN' });
  expect(actor.getSnapshot().value).toBe('reserving');
  actor.send({ type: 'RESERVED' }); actor.send({ type: 'TEAR' }); actor.send({ type: 'NEXT' });
  expect(actor.getSnapshot().value).toBe('tearing');
  actor.send({ type: 'TORN' }); actor.send({ type: 'NEXT' });
  expect(actor.getSnapshot().context.index).toBe(0);
  actor.send({ type: 'FLIPPED' }); actor.send({ type: 'NEXT' }); actor.send({ type: 'NEXT' });
  expect(actor.getSnapshot().context.index).toBe(1);
  actor.stop();
});
it('waits for every collected card before allowing settlement and results', () => {
  const actor=createActor(openingMachine).start();
  for(const type of ['OPEN','RESERVED','TEAR','TORN','NEXT','FLIPPED','ALL'] as const)actor.send({type});
  expect(actor.getSnapshot().value).toBe('collecting');
  actor.send({type:'ALL'});actor.send({type:'NEXT'});actor.send({type:'SETTLED'});
  expect(actor.getSnapshot().value).toBe('collecting');
  actor.send({type:'COLLECTED'});
  expect(actor.getSnapshot().value).toBe('settling');
  actor.send({type:'SETTLED'});
  expect(actor.getSnapshot().value).toBe('complete');
  actor.stop();
});
it('waits face down after tearing until the player chooses a reveal mode',()=>{
 const actor=createActor(openingMachine).start();
 for(const type of ['OPEN','RESERVED','TEAR','TORN'] as const)actor.send({type});
 expect(actor.getSnapshot().value).toBe('awaiting');
 expect(actor.getSnapshot().context.index).toBe(0);
 actor.send({type:'NEXT'});expect(actor.getSnapshot().value).toBe('revealing');
 expect(actor.getSnapshot().context.index).toBe(0);actor.stop();
});
it('opens all directly from the face-down stack without a first-card reveal',()=>{
 const actor=createActor(openingMachine).start();
 for(const type of ['OPEN','RESERVED','TEAR','TORN','ALL'] as const)actor.send({type});
 expect(actor.getSnapshot().value).toBe('collecting');actor.stop();
});
it('keeps the first card unrevealed if Open All cannot load an image',()=>{
 const actor=createActor(openingMachine).start();
 for(const type of ['OPEN','RESERVED','TEAR','TORN','ALL','FAIL'] as const)actor.send({type});
 expect(actor.getSnapshot().value).toBe('awaiting');actor.send({type:'NEXT'});expect(actor.getSnapshot().context.index).toBe(0);actor.stop();
});
it('restores the current revealed card when collecting later cards fails',()=>{
 const actor=createActor(openingMachine).start();
 for(const type of ['OPEN','RESERVED','TEAR','TORN','NEXT','FLIPPED','ALL','FAIL'] as const)actor.send({type});
 expect(actor.getSnapshot().value).toBe('revealed');expect(actor.getSnapshot().context.index).toBe(0);actor.stop();
});
