import { Howl, Howler } from 'howler';
type Sound = 'tear' | 'flip' | 'reveal' | 'rare' | 'complete' | 'credit';
const sounds = new Map<Sound, Howl>();
let enabled = false;
export function setSound(value: boolean) { enabled = value; Howler.mute(!value); }
export function playSound(name: Sound) {
  if (!enabled) return;
  if (!sounds.has(name)) sounds.set(name, new Howl({ src: [`/assets/audio/${name}.wav`], volume: name === 'credit' ? 0.09 : name === 'tear' ? 0.35 : 0.23, preload: true }));
  sounds.get(name)?.play();
}
