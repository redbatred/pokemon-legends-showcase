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
  for(const type of ['OPEN','RESERVED','TEAR','TORN','FLIPPED','ALL'] as const)actor.send({type});
  expect(actor.getSnapshot().value).toBe('collecting');
  actor.send({type:'ALL'});actor.send({type:'NEXT'});actor.send({type:'SETTLED'});
  expect(actor.getSnapshot().value).toBe('collecting');
  actor.send({type:'COLLECTED'});
  expect(actor.getSnapshot().value).toBe('settling');
  actor.send({type:'SETTLED'});
  expect(actor.getSnapshot().value).toBe('complete');
  actor.stop();
});
