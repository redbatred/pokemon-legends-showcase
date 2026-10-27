import { openDB } from 'idb';
import { newSave, validateSave, type Save } from './model';
const dbPromise = openDB('pokemon-legends', 1, { upgrade(db) { db.createObjectStore('state'); } });
// A readwrite transaction serializes opening/settlement across tabs as well as clicks.
export async function transactSave(update: (save: Save) => Save): Promise<Save> {
  const db = await dbPromise;
  const tx = db.transaction('state', 'readwrite');
  const raw: unknown = await tx.store.get('save');
  const previous = raw === undefined ? newSave() : validateSave(raw);
  if (!previous) { tx.abort(); throw new Error('This browser’s save could not be read. Reset your demo in Settings.'); }
  const next = update(previous);
  await tx.store.put(next, 'save');
  await tx.done;
  return next;
}
export const loadSave = () => transactSave(s => s);
export async function resetSave() { const db = await dbPromise; const save = newSave(); await db.put('state', save, 'save'); return save; }
