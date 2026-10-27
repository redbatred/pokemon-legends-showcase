import { expect,it } from 'vitest';
import { artworkColor } from './cardColor';
it('takes the saturated artwork instead of white border or black print',()=>{
 const color=artworkColor([255,255,255,255,0,0,0,255,220,35,20,255,190,25,10,255]);
 expect((color>>16)&255).toBeGreaterThan((color>>8)&255);
 expect((color>>16)&255).toBeGreaterThan(color&255);
});
it('uses an icy default for grayscale artwork and ignores transparency',()=>{
 expect(artworkColor([255,0,0,0,120,120,120,255])).toBe(0x8cddff);
});
