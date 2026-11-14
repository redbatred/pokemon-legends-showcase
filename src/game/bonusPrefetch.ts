import {encounters} from '../../output/capture-motion-v25/encounter';
import {BONUS_SCENE} from './bonusEncounter';

export type BonusSpecies=keyof typeof encounters;
export const bonusName=(species:BonusSpecies):string=>encounters[species].name;
const score=(prefix:string,file:string)=>file.startsWith('audio/'+prefix)&&/^(capture|escape)-score\./.test(file.slice(6+prefix.length));
/** What the encounter downloads for one legendary, picked from the list of files shipped with it (`ship.json`): everything
 * except the WAV music (fetched only by a browser that cannot decode FLAC) and the other legendaries' own scores and conversion art. */
export function bonusFiles(ship:readonly string[],species:BonusSpecies):string[]{
 const own=encounters[species],others=Object.values(encounters).filter(other=>other.id!==own.id);
 return ship.filter(file=>!/^audio\/[^/]+\.wav$/.test(file)&&!others.some(other=>file.startsWith(`assets/${other.id}-conversion.`)||(score(other.audioPrefix,file)&&!score(own.audioPrefix,file))));
}
/** Game assets the encounter also loads. The game may not have needed them itself by the time the encounter is asked for. */
export function sharedFiles(species:BonusSpecies):string[]{
 const own=encounters[species],seals=['ball','card'].flatMap(kind=>['atlas','json','png'].map(type=>`/assets/capture-seals-v23/${kind}-seal.${type}`));
 return [own.modelUrl,own.cardUrl,...seals,'/assets/stage/pokemon-anime-arena-v2.png','/assets/showdown-v10/shadow.png','/assets/card-back.webp','/assets/pack.webp',...['001','011','047'].map(id=>`/assets/sets/crown-zenith/cards/${id}.webp`)];
}
/** The scripts and styles a built page asks for. */
export function pageFiles(html:string):string[]{return [...new Set([...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g)].map(match=>match[1]))];}

/** On a metered or very slow connection nothing is fetched ahead of the player asking for it. */
function sparing(){const connection=(navigator as Navigator&{connection?:{saveData?:boolean;effectiveType?:string}}).connection;return !!connection?.saveData||/(^|-)2g$/.test(connection?.effectiveType??'');}
const idle=()=>new Promise<void>(resolve=>{if(typeof requestIdleCallback==='function')requestIdleCallback(()=>resolve(),{timeout:4000});else setTimeout(resolve,300);});

/** Fetches the encounter's files into the browser's cache while the game sits idle, so that opening the encounter reads them
 * from the device instead of the network. Nothing is decoded or kept in memory: the encounter still starts only when asked for.
 * `yieldTo()` is true once the encounter itself is loading; from then on no new file is started, since it is fetching them all. */
export class BonusPrefetch{
 private done=new Set<string>();private stop=new AbortController();private running:Promise<void>=Promise.resolve();
 constructor(private yieldTo:()=>boolean){}
 warm(species:BonusSpecies,delay=1200){
  if(typeof fetch!=='function'||typeof navigator==='undefined'||sparing())return this.running;
  return this.running=this.running.then(()=>new Promise<void>(resolve=>setTimeout(resolve,delay))).then(idle).then(()=>this.run(species)).catch(()=>{});
 }
 private async run(species:BonusSpecies){
  const signal=this.stop.signal,get=(url:string)=>fetch(url,{signal,priority:'low'} as RequestInit);
  const [ship,page]=await Promise.all([get(BONUS_SCENE+'ship.json').then(r=>r.ok?r.json() as Promise<string[]>:[]),get(BONUS_SCENE+'index.html').then(r=>r.ok?r.text():'')]);
  const queue=[...pageFiles(page),...bonusFiles(ship,species).map(file=>BONUS_SCENE+file),...sharedFiles(species)].filter(url=>!this.done.has(url));let next=0;
  // Three at a time: enough to finish in the background, few enough to leave the connection to the game being played.
  const lane=async()=>{while(next<queue.length&&!signal.aborted&&!this.yieldTo()){const url=queue[next++];try{const response=await get(url);await response.arrayBuffer();if(response.ok)this.done.add(url);}catch{}}};
  await Promise.all([lane(),lane(),lane()]);
 }
 destroy(){this.stop.abort();}
}
