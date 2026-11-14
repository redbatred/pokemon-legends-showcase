import {expect,it} from 'vitest';
import {createPreparationQueue} from './preparationFrames';
it('runs competing GPU preparations on separate frames and continues after failure',async()=>{
 const frames:(()=>void)[]=[],calls:string[]=[];const queue=createPreparationQueue(fn=>frames.push(fn));
 const a=queue(()=>calls.push('actor')),b=queue(()=>{throw Error('cancelled');}).catch(()=>null),c=queue(()=>calls.push('arena'));
 expect(frames).toHaveLength(1);frames.shift()!();expect(calls).toEqual(['actor']);expect(frames).toHaveLength(1);
 frames.shift()!();expect(calls).toEqual(['actor']);frames.shift()!();await Promise.all([a,b,c]);expect(calls).toEqual(['actor','arena']);
});
