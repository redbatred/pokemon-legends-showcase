import {expect,it} from 'vitest';
import {signatureEffect} from './SignatureEffects';
import {pokemonPower} from './powerProfiles';
it('keeps Earthquake on the floor when the animated attack emitter moves or rotates',()=>{
 const record=()=>{const calls:unknown[]=[];const g=new Proxy({}, {get:(_target,key)=> (...args:unknown[])=>{calls.push([key,...args]);return g;}});return {g,calls};};
 const a=record(),b=record(),profile=pokemonPower('/assets/pokemon/tyranitar.png');
 signatureEffect(a.g as any,a.g as any,profile,(u,v)=>[200+u,-100+v],.2,1,false,{x:0,y:219});
 signatureEffect(b.g as any,b.g as any,profile,(u,v)=>[-200-v,100+u],.2,1,false,{x:0,y:219});
 expect(a.calls.length).toBeGreaterThan(20);expect(a.calls).toEqual(b.calls);
});
