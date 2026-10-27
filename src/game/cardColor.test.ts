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
it('keeps pastel artwork hue but gives the emitter a visibly saturated color',()=>{
 const color=artworkColor([180,100,200,255,190,110,210,255]);
 const channels=[color>>16&255,color>>8&255,color&255];
 expect(Math.max(...channels)-Math.min(...channels)).toBeGreaterThan(170);
 expect(channels[2]).toBeGreaterThan(channels[0]);
 expect(channels[0]).toBeGreaterThan(channels[1]);
});
