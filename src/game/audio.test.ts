import { beforeEach, afterEach, expect, it, vi } from 'vitest';
const mock=vi.hoisted(()=>({howls:[] as any[],loaded:true}));
vi.mock('howler',()=>{
 class Howl {
  source:string;playing=new Set<number>();paused=new Set<number>();next=1;events:{name:string;fn:(id?:number)=>void;id?:number}[]=[];
  play=vi.fn((id?:number)=>{id??=this.next++;this.playing.add(id);this.paused.delete(id);return id;});
  pause=vi.fn((id:number)=>{this.playing.delete(id);this.paused.add(id);});
  stop=vi.fn((id:number)=>{this.playing.delete(id);this.paused.delete(id);for(const e of [...this.events])if(e.name==='stop'&&e.id===id)e.fn(id);});
  unload=vi.fn();seek=vi.fn();volume=vi.fn();stereo=vi.fn();fade=vi.fn();loop=vi.fn();
  constructor(options:{src:string[]}){this.source=options.src[0];mock.howls.push(this);}
  state(){return mock.loaded?'loaded':'loading';}
  once(name:string,fn:()=>void,id?:number){this.events.push({name,fn,id});}
  off(name:string,fn:()=>void,id?:number){this.events=this.events.filter(e=>e.name!==name||e.fn!==fn||e.id!==id);}
 }
 return {Howl,Howler:{mute:vi.fn(),ctx:{resume:vi.fn(async()=>{})}}};
});
import { destroyAudio, playPokemonMove,pokemonSoundTiming,playSound,playPokemonCry,preloadRevealAudio,setAudioHidden,setAudioScenePaused,setSound,stopRevealAudio,unlockAudio,playCrowdReaction,stopCrowdReaction } from './audio';
import cueManifest from '../../public/assets/audio-v4/cues.json';
const voice=(key:string)=>mock.howls.find(h=>h.source.endsWith(`/${key}.mp3`));
beforeEach(()=>{destroyAudio();mock.howls=[];mock.loaded=true;});
afterEach(()=>{destroyAudio();vi.useRealTimers();});
it('starts the current card crowd when sound is enabled after the reveal without replaying its impact',()=>{
 playCrowdReaction(4);setSound(true);
 expect(voice('crowdcheer').play).toHaveBeenCalledOnce();
 expect(voice('crowdrise').play).not.toHaveBeenCalled();
 setSound(false);setSound(true);
 expect(voice('crowdcheer').play).toHaveBeenCalledTimes(2);
 stopCrowdReaction();setSound(false);setSound(true);
 expect(voice('crowdcheer').play).toHaveBeenCalledTimes(2);
});
it('recovers a loading crowd loop only while its revealed card still owns the reaction',()=>{
 vi.useFakeTimers();mock.loaded=false;setSound(true);playCrowdReaction(4);const loop=voice('crowdcheer');
 mock.loaded=true;for(const e of [...loop.events])if(e.name==='load')e.fn();
 expect(loop.play).toHaveBeenCalledOnce();
 stopCrowdReaction();mock.loaded=false;playCrowdReaction(4);const callbacks=[...loop.events].filter((e:any)=>e.name==='load');stopCrowdReaction();mock.loaded=true;for(const e of callbacks)e.fn();
 expect(loop.play).toHaveBeenCalledOnce();
});
it('halves Pokémon attacks and cries while preserving menu and card volume',()=>{
 setSound(true);
 for(const key of ['fire','water','electric','psychic','swift','hyperbeam','shadowball','aeroblast','petals'] as const){
  playSound(key);expect(voice(key).volume).toHaveBeenLastCalledWith(cueManifest[key].gain*.5,1);
 }
 playSound('ui');expect(voice('ui').volume).toHaveBeenLastCalledWith(cueManifest.ui.gain,1);
 playPokemonCry(6);expect(voice('cries/6').volume).toHaveBeenLastCalledWith(.28,1);
});
it('uses the matching unpitched game cry and sampled ball cue',async()=>{
 setSound(true);await preloadRevealAudio('/assets/pokemon/charizard.png');playPokemonCry(6);playSound('release');
 expect(voice('cries/6').play).toHaveBeenCalledOnce();expect(voice('release').play).toHaveBeenCalledOnce();
});
it('pauses cinematic voices for a panel while result/UI sounds remain usable',()=>{
 setSound(true);playSound('release');setAudioScenePaused(true);playSound('complete');playSound('impact');
 expect(voice('release').pause).toHaveBeenCalledWith(1);expect(voice('complete').play).toHaveBeenCalledOnce();expect(voice('impact').play).not.toHaveBeenCalled();
 setAudioScenePaused(false);expect(voice('release').play).toHaveBeenLastCalledWith(1);
 setAudioHidden(true);expect(voice('complete').pause).toHaveBeenCalledWith(1);
});
it('stops voices on mute and never revives them on unmute or after a reveal ends',()=>{
 setSound(true);playSound('release');setSound(false);setAudioHidden(false);setSound(true);
 expect(voice('release').stop).toHaveBeenCalledWith(1);expect(voice('release').play).toHaveBeenCalledTimes(1);
 playSound('release');playSound('complete');stopRevealAudio();expect(voice('release').stop).toHaveBeenCalledWith(2);expect(voice('complete').stop).not.toHaveBeenCalled();
});
it('drops unloaded cues instead of queuing a late effect on the next card',async()=>{
 vi.useFakeTimers();mock.loaded=false;setSound(true);playSound('release');expect(voice('release').play).not.toHaveBeenCalled();
 const ready=preloadRevealAudio('/assets/pokemon/pikachu.png');await vi.advanceTimersByTimeAsync(1800);await ready;
 mock.loaded=true;expect(voice('release').play).not.toHaveBeenCalled();
});
it('bounds rapid overlapping voices and removes event listeners when stopped',()=>{
 setSound(true);for(let i=0;i<20;i++)playSound('flip');const h=voice('flip');
 expect(h.playing.size).toBe(2);expect(h.events.length).toBe(4);stopRevealAudio();expect(h.events).toHaveLength(0);
});

it('does not block a muted reveal on audio downloads',async()=>{
 mock.loaded=false;await preloadRevealAudio('/assets/pokemon/charizard.png');expect(mock.howls).toHaveLength(0);
});
it('does not resume skipped cinematic audio after leaving the settings panel',()=>{
 setSound(true);playSound('release');setAudioScenePaused(true);stopRevealAudio();setAudioScenePaused(false);
 expect(voice('release').play).toHaveBeenCalledTimes(1);expect(voice('release').paused.size).toBe(0);
});

it('uses distinct normal/rare payoffs and keeps menu clicks audible while the scene is paused',()=>{
 setSound(true);playSound('reveal');playSound('rare');setAudioScenePaused(true);playSound('ui');
 for(const key of ['normal','rare','ui'])expect(mock.howls.find(h=>h.source===`/assets/audio-v4/${key}.mp3`).play).toHaveBeenCalledOnce();
});
it('ducks release effects underneath the Pokemon cry',async()=>{
 setSound(true);await preloadRevealAudio('/assets/pokemon/charizard.png');playSound('release');playPokemonCry(6);expect(voice('release').fade).toHaveBeenCalledWith(0.44,0.44*.42,65,1);
});

it('does not duck the release when the cry is unavailable',()=>{
 setSound(true);playSound('release');mock.loaded=false;playPokemonCry(6);expect(voice('release').fade).not.toHaveBeenCalled();
});

it('starts quiet looping music after interaction and pauses it on mute or hidden tabs',()=>{
 setSound(true);expect(voice('ambience')).toBeUndefined();unlockAudio();const music=voice('ambience');
 expect(music.play).toHaveBeenCalledOnce();expect(music.fade).toHaveBeenLastCalledWith(0,.14,650,1);
 setAudioHidden(true);expect(music.pause).toHaveBeenCalledWith(1);setAudioHidden(false);expect(music.play).toHaveBeenLastCalledWith(1);
 setSound(false);const count=music.play.mock.calls.length;setAudioHidden(false);expect(music.play).toHaveBeenCalledTimes(count);
 setSound(true);expect(music.play).toHaveBeenLastCalledWith(1);
});
it('ducks music under suspense and restores it after the cinematic voices stop',()=>{
 setSound(true);unlockAudio();playSound('suspense');expect(voice('ambience').fade).toHaveBeenLastCalledWith(.14,.035,110,1);
 stopRevealAudio();expect(voice('ambience').fade).toHaveBeenLastCalledWith(.035,.14,650,1);
 setAudioScenePaused(true);expect(voice('ambience').fade).toHaveBeenLastCalledWith(.14,.085,110,1);
});
it('does not start late-loading music after the user mutes',()=>{
 vi.useFakeTimers();setSound(true);mock.loaded=false;unlockAudio();const music=voice('ambience');setSound(false);mock.loaded=true;
 music.events.find((e:any)=>e.name==='load').fn();expect(music.play).not.toHaveBeenCalled();
});

it('aligns authentic move excerpts and uses a quiet scene-owned envelope',()=>{
 setSound(true);const move=playPokemonMove('psystrike');const h=voice('psystrike');
 expect(h.seek).toHaveBeenCalledWith(2.78,1);expect(pokemonSoundTiming('hydropump').preRoll).toBe(.24);
 move!.update(1,.2);expect(h.volume).toHaveBeenLastCalledWith(.14,1);
 setAudioScenePaused(true);expect(h.pause).toHaveBeenCalledWith(1);setAudioScenePaused(false);expect(h.play).toHaveBeenLastCalledWith(1);
 move!.update(.2,0);expect(h.volume).toHaveBeenLastCalledWith(.028000000000000004,1);move!.stop();expect(h.stop).toHaveBeenCalledWith(1);
});
it('never revives a Pokémon move after mute or disposal, even with pending animation callbacks',()=>{
 setSound(true);const move=playPokemonMove('hydropump')!,h=voice('hydropump');move.update(1,0);setSound(false);const updates=h.volume.mock.calls.length;move.update(1,.4);move.stop();setSound(true);expect(h.volume).toHaveBeenCalledTimes(updates);expect(h.play).toHaveBeenCalledTimes(1);
});

it('uses the expanded move recordings at quiet gain and seeks to the measured attack phase',()=>{
 setSound(true);const attack=playPokemonMove('thunder');attack?.update(1,0);
 const thunder=voice('thunder');expect(thunder.source).toContain('/audio-v6/');expect(thunder.seek).toHaveBeenCalledWith(2.04,1);expect(thunder.volume.mock.calls.at(-1)[0]).toBeLessThanOrEqual(.15);
 setAudioScenePaused(true);expect(thunder.pause).toHaveBeenCalledWith(1);attack?.stop();setAudioScenePaused(false);expect(thunder.play).toHaveBeenCalledTimes(1);
});

it('preloads dedicated PCM bounce cues with independent floor contacts and scene pause ownership',async()=>{
 setSound(true);await preloadRevealAudio('/assets/pokemon/charizard.png');const first=mock.howls.find(h=>h.source.endsWith('/ballbounce.wav')),second=mock.howls.find(h=>h.source.endsWith('/ballsettle.wav'));expect(first).toBeDefined();expect(second).toBeDefined();
 playSound('ballbounce');expect(first.play).toHaveBeenCalledOnce();expect(first.volume).toHaveBeenLastCalledWith(.38,1);expect(second.play).not.toHaveBeenCalled();playSound('ballsettle');expect(second.play).toHaveBeenCalledOnce();
 setAudioScenePaused(true);expect(first.pause).toHaveBeenCalledWith(1);expect(second.pause).toHaveBeenCalledWith(1);stopRevealAudio();setAudioScenePaused(false);expect(first.play).toHaveBeenCalledTimes(1);expect(second.play).toHaveBeenCalledTimes(1);
});

it('keeps one rare crowd loop until next card, including loop boundaries and pause/resume',()=>{
 setSound(true);playCrowdReaction(4);const rise=voice('crowdrise'),loop=voice('crowdcheer');
 expect(rise.play).toHaveBeenCalledOnce();expect(loop.loop).toHaveBeenCalledWith(true,1);expect(loop.events.some((e:any)=>e.name==='end')).toBe(false);
 playCrowdReaction(4);expect(loop.play).toHaveBeenCalledOnce();expect(rise.play).toHaveBeenCalledOnce();
 setAudioScenePaused(true);expect(loop.pause).toHaveBeenCalledWith(1);setAudioScenePaused(false);expect(loop.play).toHaveBeenLastCalledWith(1);
 stopCrowdReaction();expect(loop.stop).toHaveBeenCalledWith(1);expect(loop.events).toHaveLength(0);setAudioHidden(true);setAudioHidden(false);expect(loop.play).toHaveBeenCalledTimes(2);
});
it('uses distinct small applause and resumes only the active crowd bed after unmuting',()=>{
 setSound(true);playCrowdReaction(1);expect(voice('crowdsmall').volume).toHaveBeenLastCalledWith(.44,1);expect(voice('crowdapplause').fade).toHaveBeenLastCalledWith(0,.16,260,1);expect(voice('crowdrise').play).not.toHaveBeenCalled();
 playCrowdReaction(4);setSound(false);setSound(true);setAudioScenePaused(false);expect(voice('crowdcheer').play).toHaveBeenCalledTimes(2);expect(voice('crowdrise').play).toHaveBeenCalledOnce();
});

it('reserves silence for energy and scales applause into stadium cheers',()=>{
 setSound(true);playCrowdReaction(0);expect(voice('crowdsmall').play).not.toHaveBeenCalled();expect(voice('crowdcheer').play).not.toHaveBeenCalled();
 playCrowdReaction(2);expect(voice('crowdsmall').volume).toHaveBeenLastCalledWith(.54,1);expect(voice('crowdapplause').fade).toHaveBeenLastCalledWith(0,.24,260,1);
 stopCrowdReaction();playCrowdReaction(4);expect(voice('crowdrise').volume).toHaveBeenLastCalledWith(.80,1);expect(voice('crowdcheer').fade).toHaveBeenLastCalledWith(0,.46,260,1);
});
