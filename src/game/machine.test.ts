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
