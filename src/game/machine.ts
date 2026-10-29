import { setup, assign } from 'xstate';
export const openingMachine = setup({ types: { context: {} as { index: number; collectFrom: 'awaiting'|'revealed' }, events: {} as { type: 'OPEN' | 'RESERVED' | 'FAIL' | 'RESUME' | 'TEAR' | 'TORN' | 'FLIPPED' | 'NEXT' | 'ALL' | 'COLLECTED' | 'SETTLED' | 'RESET' } } }).createMachine({
  id: 'opening', initial: 'browse', context: { index: 0, collectFrom: 'awaiting' },
  states: {
    browse: { on: { OPEN: 'reserving', RESUME: 'sealed' } },
    reserving: { on: { RESERVED: 'sealed', FAIL: 'browse' } },
    sealed: { on: { TEAR: 'tearing' } },
    tearing: { on: { TORN: 'awaiting' } },
    awaiting: { entry: assign({collectFrom:'awaiting'}), on: { NEXT: 'revealing', ALL: 'collecting' } },
    revealing: { on: { FLIPPED: 'revealed' } },
    revealed: { entry: assign({collectFrom:'revealed'}), on: { NEXT: [{ guard: ({ context }) => context.index >= 10, target: 'collecting' }, { target: 'revealing', actions: assign({ index: ({ context }) => context.index + 1 }) }], ALL: 'collecting' } },
    collecting: { on: { COLLECTED: 'settling', FAIL: [{guard:({context})=>context.collectFrom==='awaiting',target:'awaiting'},{target:'revealed'}] } },
    settling: { on: { SETTLED: 'complete', FAIL: 'revealed' } },
    complete: { on: { RESET: { target: 'browse', actions: assign({ index: 0 }) } } },
  },
});
