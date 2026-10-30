import {expect,it,vi} from 'vitest';
import gsap from 'gsap';
import {RevealCompletion} from './revealCompletion';
it('finishes the current step without running skipped sound or impact callbacks',()=>{
 const owner=new RevealCompletion(),sound=vi.fn(),settle=vi.fn(),done=vi.fn(),value={n:0};owner.begin();
 const timeline=gsap.timeline({paused:true}).call(sound,[],.2).to(value,{n:1,duration:1},0);
 owner.bind(timeline,settle,done);owner.request();expect(value.n).toBe(1);expect(sound).not.toHaveBeenCalled();expect(settle).toHaveBeenCalledOnce();expect(done).toHaveBeenCalledOnce();
 owner.request();expect(done).toHaveBeenCalledOnce();timeline.kill();
});
it('remembers a skip during loading and finishes both reveal stages',()=>{
 const owner=new RevealCompletion();owner.begin();owner.request();const flip=vi.fn(),pokemon=vi.fn();
 for(const settle of [flip,pokemon]){const timeline=gsap.timeline({paused:true}).to({}, {duration:1}),done=vi.fn();owner.bind(timeline,settle,done);expect(settle).toHaveBeenCalledOnce();expect(done).toHaveBeenCalledOnce();timeline.kill();}
 owner.end();expect(owner.request()).toBe(false);owner.begin();expect(owner.requested).toBe(false);
});
it('normal completion resolves once, and reset cannot finish a stale card',()=>{
 const owner=new RevealCompletion();owner.begin();const timeline=gsap.timeline({paused:true}).to({}, {duration:1}),settle=vi.fn(),done=vi.fn();owner.bind(timeline,settle,done);timeline.progress(1);expect(done).toHaveBeenCalledOnce();expect(settle).not.toHaveBeenCalled();
 owner.end();owner.request();expect(done).toHaveBeenCalledOnce();timeline.kill();
});
it('ignores early big-win clicks until the ball arrives without queuing a later skip',()=>{
 const owner=new RevealCompletion();owner.begin(true);
 const timeline=gsap.timeline({paused:true}).to({}, {duration:3}),settle=vi.fn(),done=vi.fn();owner.bind(timeline,settle,done);
 expect(owner.request()).toBe(false);expect(owner.requested).toBe(false);expect(done).not.toHaveBeenCalled();
 owner.unlock();expect(done).not.toHaveBeenCalled();expect(owner.requested).toBe(false);
 expect(owner.request()).toBe(true);expect(settle).toHaveBeenCalledOnce();expect(done).toHaveBeenCalledOnce();timeline.kill();
});
it('a protected loading phase cannot carry an early click into the card or ball timeline',()=>{
 const owner=new RevealCompletion();owner.begin(true);expect(owner.request()).toBe(false);
 const timeline=gsap.timeline({paused:true}).to({}, {duration:3}),settle=vi.fn(),done=vi.fn();owner.bind(timeline,settle,done);
 expect(settle).not.toHaveBeenCalled();owner.end();owner.unlock();expect(owner.request()).toBe(false);
 owner.begin();expect(owner.request()).toBe(true);timeline.kill();
});
