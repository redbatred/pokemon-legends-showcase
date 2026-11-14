import { Howl, Howler } from 'howler';
import cueManifest from '../../public/assets/audio-v4/cues.json';
import moveManifest from '../../public/assets/audio-v5/cues.json';
import ensembleManifest from '../../public/assets/audio-v6/cues.json';
import ballManifest from '../../public/assets/audio-v7/cues.json';
import interfaceManifest from '../../public/assets/audio-v12/cues.json';
import cinematicManifest from '../../public/assets/audio-v13/cues.json';
import reactionManifest from '../../public/assets/audio-v11/cues.json';
import packManifest from '../../public/assets/audio-v9/cues.json';
import vaultManifest from '../../public/assets/audio-showdown-v8/cues.json';
import winManifest from '../../public/assets/audio-win-v14/cues.json';
import gameManifest from '../../public/assets/audio-game-v15/cues.json';
import {crowdMix,type CrowdLevel} from './crowdReaction';
import { pokemonPower, type PowerCue } from './powerProfiles';
export type VaultSound = keyof typeof vaultManifest;
export type WinSound = keyof typeof winManifest;
/** The v15 set: every base game cue plus the `cap-*` cues of the legendary capture. */
export type GameSound = keyof typeof gameManifest;
export type Sound = PowerCue|VaultSound|WinSound|GameSound|'flight'|'throw'|'impact'|'release'|'charge'|'tear'|'flip'|'reveal'|'rare'|'complete'|'credit'|'ui'|'latch'|'stage'|'land'|'suspense'|'slam'|'ballbounce'|'ballsettle'|'packtear'|'packrustle'|'win'|'wincollect';
type Voice={howl:Howl;id:number;scene:boolean;paused:boolean;key:string;gain:number;loop:boolean};
const sounds=new Map<string,Howl>(), pending=new Map<string,Promise<void>>(), voices=new Set<OwnedVoice>();
let enabled=false,scenePaused=false,hidden=false,vaultActive=false,lastCredit=-Infinity,lastLand=-Infinity,lastUI=-Infinity,lastCrowd=-Infinity,lastFlip=-Infinity;
type MusicKey='lobby'|'battle';
type MusicTrack={howl:Howl;id?:number;paused:boolean;gain:number;target:number;timer?:ReturnType<typeof setTimeout>};
const musicTracks=new Map<MusicKey,MusicTrack>();let musicMode:MusicKey='lobby',audibleMusic:MusicKey='lobby',interacted=false;
let crowdRise:OwnedVoice|null=null,crowdCurrent=-1,crowdGeneration=0,crowdStartedAt=0,crowdAttackPlayed=false;
const crowdLoads=new Map<Howl,()=>void>();
const pokemonCues=new Set([...Object.keys(ensembleManifest),'fire','water','electric','psychic','leaf','wind','ice','dark','metal','ground','fairy','dragon','swift','hyperbeam','shadowball','aeroblast','petals','hydropump','waterpulse','psystrike']);
const cues:Record<string,{gain:number;files:{mp3?:string;ogg?:string;wav?:string}}>={...cueManifest,...moveManifest,...ensembleManifest,...ballManifest,...reactionManifest,...packManifest,...interfaceManifest,...cinematicManifest,...vaultManifest,...winManifest,...gameManifest};
export type AudioCapture={stream:MediaStream;dispose:()=>void};
const captures=new Set<AudioCapture>();
let monitorMuted=false;
/** Mute only local speakers; recording taps still receive the game's stereo mix. */
export function setAudioMonitorMuted(muted:boolean){
 const context=Howler.ctx,master=Howler.masterGain;
 if(!context||!master||monitorMuted===muted)return;
 if(muted)master.disconnect(context.destination);else master.connect(context.destination);
 monitorMuted=muted;
}
/** Tap the audible Web Audio mix, including master mute; never opens a microphone. */
export function createAudioCapture():AudioCapture|null{
 const context=Howler.ctx,master=Howler.masterGain;
 if(!Howler.usingWebAudio||!context||!master||context.state==='closed'||!context.createMediaStreamDestination)return null;
 const destination=context.createMediaStreamDestination();master.connect(destination);
 let disposed=false;
 const capture:AudioCapture={stream:destination.stream,dispose:()=>{
  if(disposed)return;disposed=true;captures.delete(capture);
  // Disconnect only this tap: speakers and other active recordings remain connected.
  master.disconnect(destination);for(const track of destination.stream.getTracks())track.stop();
 }};captures.add(capture);return capture;
}
function audibleGain(track:MusicTrack){const value=track.id===undefined?0:track.howl.volume(track.id);return typeof value==='number'&&Number.isFinite(value)?value:track.gain;}
function musicLevel(key:MusicKey){if(vaultActive)return 0;const foreground=[...voices].some(v=>v.scene&&!v.paused&&!v.key.startsWith('crowd'));return foreground?(key==='battle'?.09:.035):scenePaused||[...voices].some(v=>v.key.startsWith('crowd'))?(key==='battle'?.14:.085):key==='battle'?.24:.14;}
function mixMusic(){
 for(const [key,track] of musicTracks){if(track.id===undefined||track.paused)continue;const next=key===audibleMusic?musicLevel(key):0;if(next===track.target)continue;
  const previous=audibleGain(track),down=next<track.target;track.target=next;track.howl.fade(previous,next,down?110:650,track.id);track.gain=next;
 }
}
function syncMusic(){
 if(!enabled||hidden||!interacted){for(const t of musicTracks.values()){clearTimeout(t.timer);if(t.id!==undefined&&!t.paused)t.howl.pause(t.id);t.paused=true;t.target=t.gain=0;}return;}
 let wanted=musicTracks.get(musicMode);
 if(!wanted){const howl=new Howl({src:musicMode==='battle'?['/assets/audio-v13/battle.mp3','/assets/audio-v13/battle.ogg']:['/assets/audio-v3/ambience.mp3','/assets/audio-v3/ambience.ogg'],loop:true,preload:true,volume:0});wanted={howl,paused:true,gain:0,target:0};musicTracks.set(musicMode,wanted);howl.once('load',syncMusic);}
 // Keep the current track playing while its replacement loads; late loads use the latest requested scene.
 if(wanted.howl.state()!=='loaded')return;
 const switching=audibleMusic!==musicMode;audibleMusic=musicMode;
 for(const [key,t] of musicTracks){
  clearTimeout(t.timer);
  if(key===audibleMusic){
   if(t.id===undefined){t.id=t.howl.play();t.gain=t.target=0;}
   else if(t.paused){t.howl.volume(0,t.id);t.howl.play(t.id);t.gain=t.target=0;}
   t.paused=false;const next=musicLevel(key);if(next!==t.target){t.howl.fade(audibleGain(t),next,switching?800:650,t.id);t.gain=t.target=next;}
  }else if(t.id!==undefined&&!t.paused){
   t.howl.fade(audibleGain(t),0,800,t.id);t.gain=t.target=0;
   t.timer=setTimeout(()=>{if(key!==musicMode&&t.id!==undefined){t.howl.pause(t.id);t.paused=true;}},820);
  }
 }
}
export function setBattleMusic(active:boolean){const next=active?'battle':'lobby';if(musicMode===next)return;musicMode=next;syncMusic();}
/** The authored vault cues own the bonus soundstage; restore the current music on exit. */
export function setVaultAudio(active:boolean){vaultActive=active;mixMusic();}
/** Browsers unlock audio only after a real pointer/key gesture. */
export function unlockAudio(){interacted=true;if(enabled)void Howler.ctx?.resume();syncMusic();syncCrowd(false);}
function sample(key:string){
 let howl=sounds.get(key);
 if(!howl){const cue=cues[key],src=cue?(cue.files.wav?[cue.files.wav]:[cue.files.mp3,cue.files.ogg].filter((file):file is string=>!!file)):[`/assets/audio-v2/${key}.mp3`,`/assets/audio-v2/${key}.ogg`];howl=new Howl({src,preload:true,pool:4});sounds.set(key,howl);}
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
export function preloadAudio(){for(const name of ['flight','tear','flip','normal','rare','complete','credit','throw','impact','release','charge','ui','latch','stage','land','suspense','slam','ballbounce','ballsettle','crowdreact','crowdreactrare','packtear','packrustle','win','wincollect'])void ready(name);}
/** Await before the vault scene starts; muted preparation never blocks on downloads. */
/** The special win's own set: Poké Ball beats, the flood into the arena, strikes, coins, tiers. */
export async function preloadWinAudio(){if(enabled)await Promise.all(Object.keys(winManifest).map(ready));}
export async function preloadVaultAudio(){if(enabled)await Promise.all(Object.keys(vaultManifest).map(ready));}
/** The legendary capture's own set: merge, arena entry, throw, wobbles, verdict and reward. */
export async function preloadCaptureAudio(){if(enabled)await Promise.all(Object.keys(gameManifest).filter(key=>key.startsWith('cap-')).map(ready));}
export async function preloadRevealAudio(path:string){if(!enabled)return;const p=pokemonPower(path);await Promise.all([preloadWinAudio(),ready(p.cue),ready('release'),ready('flight'),ready('throw'),ready('impact'),ready('charge'),ready('latch'),ready('slam'),ready('ballbounce'),ready('ballsettle'),...(p.dexId===null?[]:[ready(`cries/${p.cryId??p.dexId}`)])]);}
function forget(voice:OwnedVoice){voices.delete(voice);voice.howl.off('end',voice.done,voice.id);voice.howl.off('stop',voice.done,voice.id);if(voice.key.startsWith('cries/')&&![...voices].some(v=>v.key.startsWith('cries/')))for(const v of voices)if(v.scene&&!v.key.startsWith('cries/'))v.howl.fade(v.gain*.42,v.gain,120,v.id);mixMusic();}
// Per-ID event ownership prevents old callbacks from retaining destroyed reveals.
type OwnedVoice=Voice & {done:()=>void};
function start(key:string,gain:number,scene:boolean,pan=0,loop=false,rate=1){
 const howl=sample(key);
 // Never queue a late cue: a stale impact/cry would sound on the next card.
 if(!enabled||hidden||(scene&&scenePaused)||howl.state()!=='loaded')return;
 const same=[...voices].filter(v=>v.key===key);
 if(same.length>=2){const old=same[0];old.howl.stop(old.id);forget(old as OwnedVoice);}
 if(voices.size>=8){const old=[...voices].find(v=>!v.loop)??voices.values().next().value!;old.howl.stop(old.id);forget(old as OwnedVoice);}
 const duck=scene&&!key.startsWith('cries/')&&[...voices].some(v=>v.key.startsWith('cries/'));const id=howl.play();howl.volume(gain*(duck?.42:1),id);if(rate!==1)howl.rate?.(rate,id);howl.stereo(Math.max(-.65,Math.min(.65,pan)),id);
 howl.loop(loop,id);const voice:OwnedVoice={howl,id,scene,paused:false,key,gain,loop,done:()=>forget(voice)};voices.add(voice);if(!loop)howl.once('end',voice.done,id);howl.once('stop',voice.done,id);mixMusic();return voice;
}
/** A continuing audience reaction belongs to the current card, including late audio unlock. */
function clearCrowdLoads(){for(const [howl,callback] of crowdLoads)howl.off('load',callback);crowdLoads.clear();}
function syncCrowd(allowAttack:boolean){
 if(crowdCurrent<1||!enabled||hidden||scenePaused)return;
 const mix=crowdMix(crowdCurrent as CrowdLevel),generation=crowdGeneration;
 const loaded=(key:string)=>{
  const howl=sample(key);if(howl.state()==='loaded')return true;
  if(!crowdLoads.has(howl)){const callback=()=>{howl.off('load',callback);crowdLoads.delete(howl);if(generation===crowdGeneration)syncCrowd(performance.now()-crowdStartedAt<450);};crowdLoads.set(howl,callback);howl.once('load',callback);}
  return false;
 };
 if(allowAttack&&!crowdAttackPlayed&&performance.now()-crowdStartedAt<450&&loaded(mix.attack)){
  crowdRise=start(mix.attack,mix.rise,true)??null;crowdAttackPlayed=!!crowdRise;
 }

}
export function playCrowdReaction(level:CrowdLevel){
 if(crowdCurrent===level)return;
 stopCrowdReaction();crowdCurrent=level;crowdStartedAt=performance.now();crowdAttackPlayed=!enabled||hidden||scenePaused||(level<3&&crowdStartedAt-lastCrowd<3500);if(!crowdAttackPlayed&&level>0)lastCrowd=crowdStartedAt;syncCrowd(true);
}
export function stopCrowdReaction(){
 ++crowdGeneration;clearCrowdLoads();
 for(const voice of [crowdRise])if(voice&&voices.has(voice)){voice.howl.stop(voice.id);forget(voice);}
 crowdRise=null;crowdCurrent=-1;crowdAttackPlayed=false;
}
export function playSound(name:Sound,options:{pan?:number;gain?:number;rate?:number}={}){
 if(name==='ui'){const now=performance.now();if(now-lastUI<80)return;lastUI=now;}
 if(name==='flip'){const now=performance.now();if(now-lastFlip<90)return;lastFlip=now;}
 if(name==='credit'){const now=performance.now();if(now-lastCredit<90)return;lastCredit=now;}
 if(name==='land'){const now=performance.now();if(now-lastLand<75)return;lastLand=now;}
 start(name==='reveal'?'normal':name,(cues[name==='reveal'?'normal':name]?.gain??.32)*(pokemonCues.has(name)?.5:1)*(options.gain??1),name!=='credit'&&name!=='complete'&&name!=='ui',options.pan,false,options.rate);
}
export function pokemonSoundTiming(cue:PowerCue){const value=({...moveManifest,...ensembleManifest} as Record<string,{timing:{startOffset:number;preRoll:number}}>)[cue];return value?.timing??{startOffset:0,preRoll:0};}
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
export function setAudioScenePaused(value:boolean){scenePaused=value;syncPause();syncCrowd(false);mixMusic();}
export function setAudioHidden(value:boolean){hidden=value;syncPause();syncMusic();syncCrowd(false);}
export function stopRevealAudio(){stopCrowdReaction();for(const voice of [...voices])if(voice.scene){voice.howl.stop(voice.id);forget(voice as OwnedVoice);}}
export function setSound(value:boolean){
 enabled=value;Howler.mute(!value);
 if(value){void Howler.ctx?.resume();preloadAudio();syncCrowd(false);}
 else {crowdAttackPlayed=true;clearCrowdLoads();for(const voice of [...voices]){voice.howl.stop(voice.id);forget(voice as OwnedVoice);}}
 syncMusic();
}
export function destroyAudio(){for(const capture of [...captures])capture.dispose();stopCrowdReaction();for(const t of musicTracks.values()){clearTimeout(t.timer);t.howl.unload();}musicTracks.clear();musicMode=audibleMusic='lobby';interacted=false;crowdRise=null;crowdCurrent=-1;for(const howl of sounds.values())howl.unload();voices.clear();sounds.clear();pending.clear();enabled=false;scenePaused=false;hidden=false;vaultActive=false;lastCredit=-Infinity,lastLand=-Infinity,lastUI=-Infinity,lastCrowd=-Infinity,lastFlip=-Infinity;}
