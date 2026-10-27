import { setup, assign } from 'xstate';
export const openingMachine = setup({ types: { context: {} as { index: number }, events: {} as { type: 'OPEN' | 'RESERVED' | 'FAIL' | 'RESUME' | 'TEAR' | 'TORN' | 'FLIPPED' | 'NEXT' | 'ALL' | 'COLLECTED' | 'SETTLED' | 'RESET' } } }).createMachine({
  id: 'opening', initial: 'browse', context: { index: 0 },
  states: {
    browse: { on: { OPEN: 'reserving', RESUME: 'sealed' } },
    reserving: { on: { RESERVED: 'sealed', FAIL: 'browse' } },
    sealed: { on: { TEAR: 'tearing' } },
    tearing: { on: { TORN: 'revealing' } },
    revealing: { on: { FLIPPED: 'revealed' } },
    revealed: { on: { NEXT: [{ guard: ({ context }) => context.index >= 10, target: 'collecting' }, { target: 'revealing', actions: assign({ index: ({ context }) => context.index + 1 }) }], ALL: 'collecting' } },
    collecting: { on: { COLLECTED: 'settling', FAIL: 'revealed' } },
    settling: { on: { SETTLED: 'complete', FAIL: 'revealed' } },
    complete: { on: { RESET: { target: 'browse', actions: assign({ index: 0 }) } } },
  },
});
