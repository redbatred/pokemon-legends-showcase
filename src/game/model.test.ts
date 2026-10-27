import { describe, it, expect } from 'vitest';
import { newSave, createOpening, settleOpening, validateSave, DEFAULT_PACK, type Card } from './model';
const pool: Card[] = [{ id: 'sv03-001', number: '001', name: 'Oddish', rarity: 'Common', image: '/assets/cards/001.webp', value: 25, weight: 1 }];
describe('demo accounting', () => {
  it('creates ten paying cards and one zero-value Energy, with one debit', () => {
    const opened = createOpening(newSave(), pool, () => 0);
    expect(opened.balance).toBe(9000);
    expect(opened.active?.cards).toHaveLength(11);
    expect(opened.active?.cards[10].value).toBe(0);
    expect(opened.active?.cards[10].id).toBe('energy');
    expect(createOpening(opened, pool, () => 0)).toEqual(opened);
  });
  it('settles all ten reward cards exactly once and records duplicates in collection', () => {
    const settled = settleOpening(createOpening(newSave(), pool, () => 0));
    expect(settled.balance).toBe(9250);
    expect(settled.collection['sv03-001']).toBe(10);
    expect(settled.collection.energy).toBeUndefined();
    expect(settled.history).toHaveLength(1);
    expect(settled.history[0].total).toBe(250);
    expect(settleOpening(settled)).toEqual(settled);
  });
  it('rejects insufficient balance without changing the save', () => {
    const save = { ...newSave(), balance: 999 };
    expect(() => createOpening(save, pool)).toThrow(/balance/i);
    expect(save.balance).toBe(999);
  });
  it('recovers the same paid opening after a JSON round trip', () => {
    const opened = createOpening(newSave(), pool, () => 0);
    const restored = validateSave(JSON.parse(JSON.stringify(opened)));
    expect(restored).toEqual(opened);
    expect(createOpening(restored!, pool)).toEqual(opened);
  });
  it('rejects corrupt saves instead of silently treating them as valid', () => {
    expect(validateSave({ version: 1, balance: NaN })).toBeNull();
    expect(validateSave({ ...newSave(), balance: -1 })).toBeNull();
    expect(validateSave({ ...newSave(), active: { cards: [] } })).toBeNull();
    expect(validateSave({ ...newSave(), collection: { broken: -1 } })).toBeNull();
  });
  it('rejects an empty pool before charging', () => {
    expect(() => createOpening(newSave(), [])).toThrow(/pool/i);
  });
  it('a stale tab cannot settle a different paid opening', () => {
    const first = createOpening(newSave(), pool, () => 0);
    const oldId = first.active!.id;
    const second = createOpening(settleOpening(first), pool, () => 0);
    const staleSettlement = settleOpening(second, oldId);
    expect(staleSettlement.balance).toBe(8250);
    expect(staleSettlement.active?.id).toBe(second.active!.id);
    expect(staleSettlement.history).toHaveLength(1);
  });
  it('charges the selected pack price and preserves its identity on reload', () => {
    const pack = { ...DEFAULT_PACK, id: 'pokemon-151', name: 'Pokémon 151', price: 2500 };
    const opened = createOpening(newSave(), pool, () => 0, pack);
    expect(opened.balance).toBe(7500);
    expect(validateSave(JSON.parse(JSON.stringify(opened)))?.active?.pack?.id).toBe('pokemon-151');
  });
  it('Base Set has nine rewards and two non-paying Energy slots', () => {
    const pack = { ...DEFAULT_PACK, id: 'base-set', name: 'Base Set 1999', price: 100000, rewardCount: 9 as const };
    const opened = createOpening({ ...newSave(), balance: 200000 }, pool, () => 0, pack);
    expect(opened.active?.cards.filter(c => c.id !== 'energy')).toHaveLength(9);
    expect(opened.active?.cards.filter(c => c.id === 'energy')).toHaveLength(2);
    expect(opened.active?.cards).toHaveLength(11);
    expect(validateSave(opened)).toEqual(opened);
    expect(settleOpening(opened).balance).toBe(100225);
  });
});
