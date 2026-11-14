import {expect,it} from 'vitest';
import {Container} from 'pixi.js';
import {SpineReveal} from './SpineReveal';
it('conceals the source card beneath the cinematic and restores it after the scene clears',()=>{const actors=new Container(),cardShell=new Container(),reveal=Object.assign(Object.create(SpineReveal.prototype),{actors,cardShell}) as SpineReveal;reveal.setWinOcclusion(.5);expect(actors.alpha).toBe(0);expect(cardShell.alpha).toBe(0);reveal.setWinOcclusion(0);expect(actors.alpha).toBe(1);expect(cardShell.alpha).toBe(1);actors.destroy();cardShell.destroy();});
