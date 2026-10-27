export interface Card { id: string; number: string; name: string; rarity: string; image: string; value: number; weight: number }
export interface Pack { id: string; name: string; price: number; packImage: string; catalogUrl: string; accent: string; rewardCount: 9 | 10 }
export const DEFAULT_PACK: Pack = { id: 'obsidian-flames', name: 'Obsidian Flames', price: 1000, packImage: '/assets/pack.webp', catalogUrl: '/assets/catalog.json', accent: '#f09749', rewardCount: 10 };
export interface Opening { id: string; at: string; cards: Card[]; pack?: Pack }
export interface Result extends Opening { total: number }
export interface Save { version: 1; balance: number; collection: Record<string, number>; history: Result[]; active: Opening | null }
export const newSave = (): Save => ({ version: 1, balance: 10000, collection: {}, history: [], active: null });
export const PACK_COST = 1000;
export const money = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
export const energy: Card = { id: 'energy', number: '', name: 'Basic Fire Energy', rarity: 'Energy', image: '/assets/cards/energy.webp', value: 0, weight: 0 };
export function createOpening(save: Save, pool: Card[], rng = Math.random, pack: Pack = DEFAULT_PACK): Save {
  if (save.active) return save;
  if (!pool.length || pool.some(c => c.weight <= 0 || !Number.isFinite(c.weight))) throw new Error('Card pool is unavailable.');
  if (!Number.isSafeInteger(pack.price) || pack.price <= 0 || ![9,10].includes(pack.rewardCount)) throw new Error('Invalid pack configuration.');
  if (save.balance < pack.price) throw new Error('Insufficient demo balance. Use + to add free credits.');
  const totalWeight = pool.reduce((n, c) => n + c.weight, 0);
  const cards = Array.from({ length: pack.rewardCount }, () => {
    let pick = Math.min(0.9999999, Math.max(0, rng())) * totalWeight;
    return pool.find(c => (pick -= c.weight) < 0) ?? pool[pool.length - 1];
  });
  // Order for presentation only; all results are fixed before the wrapper opens.
  cards.sort((a, b) => a.value - b.value);
  while (cards.length < 11) cards.push(energy);
  return { ...save, balance: save.balance - pack.price, active: { id: crypto.randomUUID(), at: new Date().toISOString(), cards, pack } };
}
export function settleOpening(save: Save, expectedId?: string): Save {
  if (expectedId && save.history.some(o => o.id === expectedId)) return save;
  if (expectedId && save.active?.id !== expectedId) throw new Error('This opening changed in another tab. Reload to sync your demo.');
  if (!save.active) return save;
  const total = save.active.cards.reduce((n, c) => n + c.value, 0);
  const collection = { ...save.collection };
  for (const card of save.active.cards) if (card.id !== 'energy') collection[card.id] = (collection[card.id] ?? 0) + 1;
  return { ...save, balance: save.balance + total, collection, history: [{ ...save.active, total }, ...save.history].slice(0, 30), active: null };
}
export function validateSave(value: unknown): Save | null {
  if (!value || typeof value !== 'object') return null;
  const s = value as Save;
  const cents = (v: unknown): v is number => Number.isSafeInteger(v) && (v as number) >= 0;
  const validCard = (c: Card) => c && typeof c.id === 'string' && typeof c.name === 'string' && typeof c.rarity === 'string' && typeof c.image === 'string' && c.image.startsWith('/assets/') && cents(c.value);
  const validOpening = (o: Opening) => {
    const count = o?.pack?.rewardCount ?? 10;
    return o && [9,10].includes(count) && (!o.pack || (typeof o.pack.id === 'string' && typeof o.pack.name === 'string' && cents(o.pack.price))) && typeof o.id === 'string' && typeof o.at === 'string' && Array.isArray(o.cards) && o.cards.length === 11 && o.cards.every(validCard) && o.cards.slice(count).every(c => c.id === 'energy' && c.value === 0) && o.cards.slice(0,count).every(c => c.id !== 'energy');
  };
  if (s.version !== 1 || !cents(s.balance) || !s.collection || typeof s.collection !== 'object' || Array.isArray(s.collection) || !Object.values(s.collection).every(cents) || !Array.isArray(s.history) || !s.history.every(o => validOpening(o) && cents(o.total)) || (s.active !== null && !validOpening(s.active))) return null;
  return s;
}
export function priceCard(raw: Omit<Card, 'value' | 'weight'>): Card {
  const n = Number(raw.number);
  if (n === 223) return { ...raw, value: 4500, weight: 0.6 };
  if (n === 228) return { ...raw, value: 2800, weight: 0.8 };
  if (n === 225) return { ...raw, value: 2200, weight: 1.2 };
  if (n >= 210) return { ...raw, value: 1200, weight: 2 };
  if (n >= 198) return { ...raw, value: n === 199 ? 950 : 600, weight: 3 };
  if (raw.rarity.toLowerCase().includes('double') || raw.name.includes(' ex')) return { ...raw, value: 250, weight: 8 };
  if (raw.rarity === 'Rare') return { ...raw, value: 90, weight: 14 };
  return { ...raw, value: raw.rarity === 'Common' ? 25 : 50, weight: 20 };
}
