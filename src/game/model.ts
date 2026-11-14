import {validShowdownSymbols} from './showdown/showdownSymbols';
import {drawPackCards} from './packDraw';
export interface Card { id: string; number: string; name: string; rarity: string; image: string; value: number; weight: number }
export interface Pack { id: string; name: string; price: number; packImage: string; catalogUrl: string; accent: string; rewardCount: 9 | 10 }
export const DEFAULT_PACK: Pack = { id: 'obsidian-flames', name: 'Obsidian Flames', price: 1000, packImage: '/assets/pack.webp', catalogUrl: '/assets/catalog.json', accent: '#f09749', rewardCount: 10 };
/** A legendary caught in this pack's bonus: its reward card and what it paid (multiplier × pack price). */
export interface BonusWin { name: string; image: string; multiplier: number; amount: number }
export interface Opening { id: string; at: string; cards: Card[]; pack?: Pack; previewSpecial?: boolean; showdownSymbols?: number[]; bonus?: BonusWin }
export interface Result extends Opening { total: number }
export interface Save { version: 1; balance: number; totalWon?: number; collection: Record<string, number>; history: Result[]; active: Opening | null }
export const newSave = (): Save => ({ version: 1, balance: 10000, totalWon: 0, collection: {}, history: [], active: null });
export const PACK_COST = 1000;
export const money = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
export const energy: Card = { id: 'energy', number: '', name: 'Basic Fire Energy', rarity: 'Energy', image: '/assets/cards/energy.webp', value: 0, weight: 0 };
export function createOpening(save: Save, pool: Card[], rng = Math.random, pack: Pack = DEFAULT_PACK): Save {
  if (save.active) return save;
  if (!pool.length || pool.some(c => c.weight <= 0 || !Number.isFinite(c.weight))) throw new Error('Card pool is unavailable.');
  if (!Number.isSafeInteger(pack.price) || pack.price <= 0 || ![9,10].includes(pack.rewardCount)) throw new Error('Invalid pack configuration.');
  if (save.balance < pack.price) throw new Error('Insufficient demo balance. Use + to add free credits.');
  const cards = drawPackCards(pool,pack.rewardCount,pack.price,save.history,rng);
  // Order for presentation only; all results are fixed before the wrapper opens.
  cards.sort((a, b) => a.value - b.value);
  while (cards.length < 11) cards.push(energy);
  return { ...save, balance: save.balance - pack.price, active: { id: crypto.randomUUID(), at: new Date().toISOString(), cards, pack } };
}
export function settleOpening(save: Save, expectedId?: string): Save {
  if (expectedId && save.history.some(o => o.id === expectedId)) return save;
  if (expectedId && save.active?.id !== expectedId) throw new Error('This opening changed in another tab. Reload to sync your demo.');
  if (!save.active) return save;
  const total = save.active.cards.reduce((n, c) => n + c.value, 0) + (save.active.bonus?.amount ?? 0);
  const collection = { ...save.collection };
  for (const card of save.active.cards) if (card.id !== 'energy') collection[card.id] = (collection[card.id] ?? 0) + 1;
  return { ...save, balance: save.balance + total, totalWon: recordedWinnings(save) + total, collection, history: [{ ...save.active, total }, ...save.history].slice(0, 30), active: null };
}
/** Attach a bonus catch to its pack, once. A pack still open carries it into its settlement; a pack that has already settled
 * (the bonus played after Open All) is paid the difference there and then. Any other id changes nothing. */
export function awardBonus(save: Save, openingId: string, bonus: BonusWin): Save {
  if (!Number.isSafeInteger(bonus.amount) || bonus.amount <= 0) return save;
  if (save.active?.id === openingId) return save.active.bonus ? save : { ...save, active: { ...save.active, bonus } };
  const index = save.history.findIndex(o => o.id === openingId);
  if (index < 0 || save.history[index].bonus) return save;
  const history = save.history.map((o, i) => i === index ? { ...o, bonus, total: o.total + bonus.amount } : o);
  return { ...save, history, balance: save.balance + bonus.amount, totalWon: recordedWinnings(save) + bonus.amount };
}
/** A caught legendary as a card, for the screens that list a pack's cards with their values. */
export const bonusCard = (bonus: BonusWin): Card => ({ id: 'bonus', number: `${bonus.multiplier}×`, name: bonus.name, rarity: 'Legendary bonus', image: bonus.image, value: bonus.amount, weight: 0 });
export const recordedWinnings=(save:Save)=>save.totalWon??save.history.reduce((sum,result)=>sum+result.total,0);
export function validateSave(value: unknown): Save | null {
  if (!value || typeof value !== 'object') return null;
  const s = value as Save;
  const cents = (v: unknown): v is number => Number.isSafeInteger(v) && (v as number) >= 0;
  const validCard = (c: Card) => c && typeof c.id === 'string' && typeof c.name === 'string' && typeof c.rarity === 'string' && typeof c.image === 'string' && c.image.startsWith('/assets/') && cents(c.value);
  const validOpening = (o: Opening) => {
    const count = o?.pack?.rewardCount ?? 10;
    const validBonus = (b: BonusWin | undefined) => b === undefined || (!!b && typeof b.name === 'string' && typeof b.image === 'string' && b.image.startsWith('/assets/') && Number.isSafeInteger(b.multiplier) && b.multiplier > 0 && cents(b.amount) && b.amount > 0);
    return o && validBonus(o.bonus) && (o.showdownSymbols===undefined||validShowdownSymbols(o.showdownSymbols,count)) && (o.previewSpecial===undefined||typeof o.previewSpecial==='boolean') && [9,10].includes(count) && (!o.pack || (typeof o.pack.id === 'string' && typeof o.pack.name === 'string' && cents(o.pack.price))) && typeof o.id === 'string' && typeof o.at === 'string' && Array.isArray(o.cards) && o.cards.length === 11 && o.cards.every(validCard) && o.cards.slice(count).every(c => c.id === 'energy' && c.value === 0) && o.cards.slice(0,count).every(c => c.id !== 'energy');
  };
  if (s.version !== 1 || (s.totalWon!==undefined&&!cents(s.totalWon)) || !cents(s.balance) || !s.collection || typeof s.collection !== 'object' || Array.isArray(s.collection) || !Object.values(s.collection).every(cents) || !Array.isArray(s.history) || !s.history.every(o => validOpening(o) && cents(o.total)) || (s.active !== null && !validOpening(s.active))) return null;
  return {...s,totalWon:recordedWinnings(s)};
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
