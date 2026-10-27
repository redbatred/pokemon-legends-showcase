import { beforeEach, afterEach, expect, it, vi } from 'vitest';
const mock=vi.hoisted(()=>({howls:[] as any[],loaded:true}));
vi.mock('howler',()=>{
 class Howl {
  source:string;playing=new Set<number>();paused=new Set<number>();next=1;events:{name:string;fn:(id?:number)=>void;id?:number}[]=[];
  play=vi.fn((id?:number)=>{id??=this.next++;this.playing.add(id);this.paused.delete(id);return id;});
  pause=vi.fn((id:number)=>{this.playing.delete(id);this.paused.add(id);});
  stop=vi.fn((id:number)=>{this.playing.delete(id);this.paused.delete(id);for(const e of [...this.events])if(e.name==='stop'&&e.id===id)e.fn(id);});
  unload=vi.fn();volume=vi.fn();stereo=vi.fn();fade=vi.fn();
  constructor(options:{src:string[]}){this.source=options.src[0];mock.howls.push(this);}
  state(){return mock.loaded?'loaded':'loading';}
  once(name:string,fn:()=>void,id?:number){this.events.push({name,fn,id});}
  off(name:string,fn:()=>void,id?:number){this.events=this.events.filter(e=>e.name!==name||e.fn!==fn||e.id!==id);}
 }
 return {Howl,Howler:{mute:vi.fn(),ctx:{resume:vi.fn(async()=>{})}}};
});
import { destroyAudio, playSound,playPokemonCry,preloadRevealAudio,setAudioHidden,setAudioScenePaused,setSound,stopRevealAudio,unlockAudio } from './audio';
const voice=(key:string)=>mock.howls.find(h=>h.source.endsWith(`/${key}.mp3`));
beforeEach(()=>{destroyAudio();mock.howls=[];mock.loaded=true;});
afterEach(()=>{destroyAudio();vi.useRealTimers();});
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
