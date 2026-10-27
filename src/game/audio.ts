import { Howl, Howler } from 'howler';
import { pokemonPower, type PowerCue } from './powerProfiles';
export type Sound = PowerCue|'throw'|'impact'|'release'|'charge'|'tear'|'flip'|'reveal'|'rare'|'complete'|'credit';
type Voice={howl:Howl;id:number;scene:boolean;paused:boolean;key:string};
const sounds=new Map<string,Howl>(), pending=new Map<string,Promise<void>>(), voices=new Set<OwnedVoice>();
let enabled=false,scenePaused=false,hidden=false,lastCredit=-Infinity;
const gains:Partial<Record<Sound,number>>={throw:.4,impact:.43,release:.52,charge:.24,fire:.38,water:.36,electric:.33,psychic:.32,tear:.38,flip:.26,reveal:.33,rare:.34,complete:.35,credit:.14};
function sample(key:string){
 let howl=sounds.get(key);
 if(!howl){howl=new Howl({src:[`/assets/audio-v2/${key}.mp3`,`/assets/audio-v2/${key}.ogg`],preload:true,pool:4});sounds.set(key,howl);}
 return howl;
}
function ready(key:string){
 const howl=sample(key);if(howl.state()==='loaded')return Promise.resolve();
 let promise=pending.get(key);if(promise)return promise;
 promise=new Promise<void>(resolve=>{
  let timer:ReturnType<typeof setTimeout>;
  const finish=()=>{clearTimeout(timer);howl.off('load',finish);howl.off('loaderror',finish);pending.delete(key);resolve();};
  howl.once('load',finish);howl.once('loaderror',finish);timer=setTimeout(finish,1800);
 });pending.set(key,promise);return promise;
}
export function preloadAudio(){for(const name of ['tear','flip','reveal','complete','credit','throw','impact','release','charge'])void ready(name);}
export async function preloadRevealAudio(path:string){if(!enabled)return;const p=pokemonPower(path);await Promise.all([ready(p.cue),ready('release'),ready('throw'),ready('impact'),ready('charge'),...(p.dexId===null?[]:[ready(`cries/${p.dexId}`)])]);}
function forget(voice:OwnedVoice){voices.delete(voice);voice.howl.off('end',voice.done,voice.id);voice.howl.off('stop',voice.done,voice.id);}
// Per-ID event ownership prevents old callbacks from retaining destroyed reveals.
type OwnedVoice=Voice & {done:()=>void};
function start(key:string,gain:number,scene:boolean,pan=0){
 const howl=sample(key);
 // Never queue a late cue: a stale impact/cry would sound on the next card.
 if(!enabled||hidden||(scene&&scenePaused)||howl.state()!=='loaded')return;
 const same=[...voices].filter(v=>v.key===key);
 if(same.length>=2){const old=same[0];old.howl.stop(old.id);forget(old as OwnedVoice);}
 if(voices.size>=8){const old=voices.values().next().value!;old.howl.stop(old.id);forget(old as OwnedVoice);}
 const id=howl.play();howl.volume(gain,id);howl.stereo(Math.max(-.65,Math.min(.65,pan)),id);
 const voice:OwnedVoice={howl,id,scene,paused:false,key,done:()=>forget(voice)};voices.add(voice);howl.once('end',voice.done,id);howl.once('stop',voice.done,id);
}
export function playSound(name:Sound,options:{pan?:number;gain?:number}={}){
 if(name==='credit'){const now=performance.now();if(now-lastCredit<90)return;lastCredit=now;}
 start(name==='rare'?'reveal':name,(gains[name]??.32)*(options.gain??1),name!=='credit'&&name!=='complete',options.pan);
}
export function playPokemonCry(dexId:number|null){if(dexId!==null)start(`cries/${dexId}`,.53,true);}
function syncPause(){for(const voice of voices){const shouldPause=hidden||(voice.scene&&scenePaused);if(shouldPause&&!voice.paused){voice.howl.pause(voice.id);voice.paused=true;}else if(!shouldPause&&voice.paused&&enabled){voice.howl.play(voice.id);voice.paused=false;}}}
export function setAudioScenePaused(value:boolean){scenePaused=value;syncPause();}
export function setAudioHidden(value:boolean){hidden=value;syncPause();}
export function stopRevealAudio(){for(const voice of [...voices])if(voice.scene){voice.howl.stop(voice.id);forget(voice as OwnedVoice);}}
export function setSound(value:boolean){
 enabled=value;Howler.mute(!value);
 if(value){void Howler.ctx?.resume();preloadAudio();}
 else {for(const voice of [...voices]){voice.howl.stop(voice.id);forget(voice as OwnedVoice);}}
}
export function destroyAudio(){for(const howl of sounds.values())howl.unload();voices.clear();sounds.clear();pending.clear();enabled=false;scenePaused=false;hidden=false;lastCredit=-Infinity;}
