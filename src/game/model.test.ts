import { describe, it, expect } from 'vitest';
import { DEFAULT_PACK, awardBonus, bonusCard, createOpening, newSave, settleOpening, type Card, validateSave } from './model';
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
it('keeps total winnings after history rolls off and does not count free credits or duplicate settlement',()=>{
 let save=newSave();
 for(let i=0;i<34;i++)save=settleOpening(createOpening({...save,balance:100000},pool,()=>0));
 expect(save.history).toHaveLength(30);expect(save.totalWon).toBe(8500);
 expect(settleOpening(save,save.history[0].id).totalWon).toBe(8500);
 expect(validateSave({...save,balance:999999})?.totalWon).toBe(8500);
});
it('preserves old saves and seeds recorded winnings from retained completed openings',()=>{
 const save=settleOpening(createOpening(newSave(),pool,()=>0));
 const {totalWon:_,...legacy}=save;
 expect(validateSave(legacy)?.totalWon).toBe(250);
 expect(validateSave({...save,totalWon:-1})).toBeNull();
});
describe('bonus win', () => {
  const bonus = { name: 'Lugia', image: '/assets/sets/silver-tempest/cards/186.webp', multiplier: 180, amount: 180000 };
  const opened = () => createOpening({ ...newSave(), balance: 5000 }, [{ id: 'a', number: '1', name: 'A', rarity: 'Common', image: '/assets/cards/a.webp', value: 25, weight: 1 }], () => .5);
  it('rides an open pack into its settlement and is paid once', () => {
    const open = opened(), id = open.active!.id, withBonus = awardBonus(open, id, bonus);
    expect(withBonus.active!.bonus).toEqual(bonus);expect(awardBonus(withBonus, id, { ...bonus, amount: 5 })).toBe(withBonus);
    const cards = open.active!.cards.reduce((n, c) => n + c.value, 0), settled = settleOpening(withBonus, id);
    expect(settled.history[0].total).toBe(cards + bonus.amount);expect(settled.balance).toBe(open.balance + cards + bonus.amount);expect(settled.history[0].bonus).toEqual(bonus);
    expect(validateSave(settled)).not.toBeNull();expect(validateSave(withBonus)).not.toBeNull();
  });
  it('pays a pack that settled before its bonus was played, once', () => {
    const open = opened(), id = open.active!.id, settled = settleOpening(open, id), paid = awardBonus(settled, id, bonus);
    expect(paid.history[0].total).toBe(settled.history[0].total + bonus.amount);expect(paid.balance).toBe(settled.balance + bonus.amount);expect(paid.totalWon).toBe((settled.totalWon ?? 0) + bonus.amount);
    expect(awardBonus(paid, id, bonus)).toBe(paid);
  });
  it('ignores an unknown pack and a worthless bonus', () => {
    const open = opened();expect(awardBonus(open, 'nope', bonus)).toBe(open);expect(awardBonus(open, open.active!.id, { ...bonus, amount: 0 })).toBe(open);
  });
  it('rejects a malformed bonus in a stored save and lists a catch as a card', () => {
    const open = opened(), bad = { ...open, active: { ...open.active!, bonus: { ...bonus, image: 'http://x/y.png' } } };expect(validateSave(bad)).toBeNull();
    expect(bonusCard(bonus)).toMatchObject({ id: 'bonus', name: 'Lugia', value: 180000, number: '180×' });
  });
});
