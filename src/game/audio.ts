import { Howl, Howler } from 'howler';
import cueManifest from '../../public/assets/audio-v4/cues.json';
import moveManifest from '../../public/assets/audio-v5/cues.json';
import { pokemonPower, type PowerCue } from './powerProfiles';
export type Sound = PowerCue|'throw'|'impact'|'release'|'charge'|'tear'|'flip'|'reveal'|'rare'|'complete'|'credit'|'ui'|'latch'|'stage'|'land'|'suspense'|'slam';
type Voice={howl:Howl;id:number;scene:boolean;paused:boolean;key:string;gain:number};
const sounds=new Map<string,Howl>(), pending=new Map<string,Promise<void>>(), voices=new Set<OwnedVoice>();
let enabled=false,scenePaused=false,hidden=false,lastCredit=-Infinity,lastLand=-Infinity;
let music:Howl|null=null,musicId:number|undefined,musicPaused=false,interacted=false,musicGain=.14;
const pokemonCues=new Set(['fire','water','electric','psychic','leaf','wind','ice','dark','metal','ground','fairy','dragon','swift','hyperbeam','shadowball','aeroblast','petals','hydropump','waterpulse','psystrike']);
const cues:Record<string,{gain:number;files:{mp3:string;ogg:string}}>={...cueManifest,...moveManifest};
function mixMusic(){
 if(!music||musicId===undefined)return;
 const next=[...voices].some(v=>v.scene&&!v.paused)?.035:scenePaused?.085:.14;
 if(next!==musicGain){music.fade(musicGain,next,next<musicGain?110:650,musicId);musicGain=next;}
}
function syncMusic(){
 if(!enabled||hidden||!interacted){if(music&&musicId!==undefined&&!musicPaused){music.pause(musicId);musicPaused=true;}return;}
 if(!music){music=new Howl({src:['/assets/audio-v3/ambience.mp3','/assets/audio-v3/ambience.ogg'],loop:true,preload:true,volume:0});music.once('load',syncMusic);}
 if(music.state()!=='loaded')return;
 if(musicId===undefined){musicId=music.play();musicGain=0;}
 else if(musicPaused){music.play(musicId);musicGain=0;music.volume(0,musicId);}
 musicPaused=false;mixMusic();
}
/** Browsers unlock audio only after a real pointer/key gesture. */
export function unlockAudio(){interacted=true;if(enabled)void Howler.ctx?.resume();syncMusic();}
function sample(key:string){
 let howl=sounds.get(key);
 if(!howl){const cue=cues[key];howl=new Howl({src:cue?[cue.files.mp3,cue.files.ogg]:[`/assets/audio-v2/${key}.mp3`,`/assets/audio-v2/${key}.ogg`],preload:true,pool:4});sounds.set(key,howl);}
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
export function preloadAudio(){for(const name of ['tear','flip','normal','rare','complete','credit','throw','impact','release','charge','ui','latch','stage','land','suspense','slam'])void ready(name);}
export async function preloadRevealAudio(path:string){if(!enabled)return;const p=pokemonPower(path);await Promise.all([ready(p.cue),ready('release'),ready('throw'),ready('impact'),ready('charge'),ready('latch'),...(p.dexId===null?[]:[ready(`cries/${p.dexId}`)])]);}
function forget(voice:OwnedVoice){voices.delete(voice);voice.howl.off('end',voice.done,voice.id);voice.howl.off('stop',voice.done,voice.id);if(voice.key.startsWith('cries/')&&![...voices].some(v=>v.key.startsWith('cries/')))for(const v of voices)if(v.scene&&!v.key.startsWith('cries/'))v.howl.fade(v.gain*.42,v.gain,120,v.id);mixMusic();}
// Per-ID event ownership prevents old callbacks from retaining destroyed reveals.
type OwnedVoice=Voice & {done:()=>void};
function start(key:string,gain:number,scene:boolean,pan=0){
 const howl=sample(key);
 // Never queue a late cue: a stale impact/cry would sound on the next card.
 if(!enabled||hidden||(scene&&scenePaused)||howl.state()!=='loaded')return;
 const same=[...voices].filter(v=>v.key===key);
 if(same.length>=2){const old=same[0];old.howl.stop(old.id);forget(old as OwnedVoice);}
 if(voices.size>=8){const old=voices.values().next().value!;old.howl.stop(old.id);forget(old as OwnedVoice);}
 const duck=scene&&!key.startsWith('cries/')&&[...voices].some(v=>v.key.startsWith('cries/'));const id=howl.play();howl.volume(gain*(duck?.42:1),id);howl.stereo(Math.max(-.65,Math.min(.65,pan)),id);
 const voice:OwnedVoice={howl,id,scene,paused:false,key,gain,done:()=>forget(voice)};voices.add(voice);howl.once('end',voice.done,id);howl.once('stop',voice.done,id);mixMusic();return voice;
}
export function playSound(name:Sound,options:{pan?:number;gain?:number}={}){
 if(name==='credit'){const now=performance.now();if(now-lastCredit<90)return;lastCredit=now;}
 if(name==='land'){const now=performance.now();if(now-lastLand<75)return;lastLand=now;}
 start(name==='reveal'?'normal':name,(cues[name==='reveal'?'normal':name]?.gain??.32)*(pokemonCues.has(name)?.5:1)*(options.gain??1),name!=='credit'&&name!=='complete'&&name!=='ui',options.pan);
}
export function pokemonSoundTiming(cue:PowerCue){const value=(moveManifest as Record<string,{timing:{startOffset:number;preRoll:number}}>)[cue];return value?.timing??{startOffset:0,preRoll:0};}
export type PokemonMoveVoice={update:(gain:number,pan:number)=>void;stop:()=>void};
/** Scene-clock envelopes pause with the action and can never restart a muted/stale voice. */
export function playPokemonMove(cue:PowerCue,pan=0):PokemonMoveVoice|null{
 const gain=(cues[cue]?.gain??.32)*.5,voice=start(cue,0,true,pan);if(!voice)return null;
 const offset=pokemonSoundTiming(cue).startOffset;if(offset)voice.howl.seek(offset,voice.id);
 let previous=-1,previousPan=pan;
 return {update:(envelope,nextPan)=>{if(!voices.has(voice))return;const duck=[...voices].some(v=>v.key.startsWith('cries/'))?.42:1,volume=gain*Math.max(0,Math.min(1,envelope))*duck;voice.gain=gain*Math.max(0,Math.min(1,envelope));if(Math.abs(volume-previous)>.002){voice.howl.volume(volume,voice.id);previous=volume;}if(Math.abs(nextPan-previousPan)>.025){voice.howl.stereo(Math.max(-.5,Math.min(.5,nextPan)),voice.id);previousPan=nextPan;}},stop:()=>{if(!voices.has(voice))return;voice.howl.stop(voice.id);forget(voice);}};
}
export function playPokemonCry(dexId:number|null){if(dexId===null||!enabled||hidden||scenePaused)return;const cry=start(`cries/${dexId}`,.28,true);if(!cry)return;for(const voice of voices)if(voice.scene&&!voice.key.startsWith('cries/'))voice.howl.fade(voice.gain,voice.gain*.42,65,voice.id);}
function syncPause(){for(const voice of voices){const shouldPause=hidden||(voice.scene&&scenePaused);if(shouldPause&&!voice.paused){voice.howl.pause(voice.id);voice.paused=true;}else if(!shouldPause&&voice.paused&&enabled){voice.howl.play(voice.id);voice.paused=false;}}}
export function setAudioScenePaused(value:boolean){scenePaused=value;syncPause();mixMusic();}
export function setAudioHidden(value:boolean){hidden=value;syncPause();syncMusic();}
export function stopRevealAudio(){for(const voice of [...voices])if(voice.scene){voice.howl.stop(voice.id);forget(voice as OwnedVoice);}}
export function setSound(value:boolean){
 enabled=value;Howler.mute(!value);
 if(value){void Howler.ctx?.resume();preloadAudio();}
 else {for(const voice of [...voices]){voice.howl.stop(voice.id);forget(voice as OwnedVoice);}}
 syncMusic();
}
export function destroyAudio(){music?.unload();music=null;musicId=undefined;musicPaused=false;interacted=false;musicGain=.14;for(const howl of sounds.values())howl.unload();voices.clear();sounds.clear();pending.clear();enabled=false;scenePaused=false;hidden=false;lastCredit=-Infinity,lastLand=-Infinity;}
