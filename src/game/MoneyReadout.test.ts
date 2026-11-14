import { afterEach, expect, it, vi } from 'vitest';
import { gsap } from 'gsap';
import { MoneyReadout } from './MoneyReadout';
import { moneyState } from './moneyMotion';

// Node lacks a glyph rasterizer; preserve real Pixi bounds, transforms and GSAP.
vi.mock('pixi.js', async importOriginal => {
  const pixi = await importOriginal<typeof import('pixi.js')>();
  class GlyphSurface extends pixi.Container {
    private glyphs = new pixi.Graphics();
    private value = '';
    constructor(private options: {text:string;style:{fontSize:number}}) {super();this.addChild(this.glyphs);this.text=options.text;}
    get text(){return this.value;}
    set text(value:string){this.value=value;this.glyphs.clear().rect(0,0,value.length*this.options.style.fontSize*.62,this.options.style.fontSize).fill(0xffffff);}
  }
  return {...pixi,BitmapText:GlyphSurface};
});
afterEach(()=>{gsap.globalTimeline.clear();gsap.ticker.sleep();});
const options=(align:'left'|'center'|'right',reduced=false)=>({size:32,color:0xffffff,align,width:120,plus:false,hero:false,centerY:true,reduced,ticks:false,draw:()=>{}});
it.each(['center','right'] as const)('keeps the %s alignment fixed throughout its impact',align=>{
  const state=moneyState(undefined,'wallet',123456,true),readout=new MoneyReadout(state,options(align));
  readout.pulse();
  const bounds=readout.getLocalBounds();
  expect(align==='center'?(bounds.minX+bounds.maxX)/2:bounds.maxX).toBeCloseTo(0,5);
  expect(bounds.width).toBeLessThanOrEqual(120.01);
  readout.destroy();
});
it('retargets from displayed cents and keeps the alignment while crossing a digit boundary',()=>{
  const state=moneyState(undefined,'wallet',99999,true),readout=new MoneyReadout(state,options('right'));
  readout.retarget(100001);gsap.getTweensOf(state)[0].progress(.4);
  const displayed=state.value;
  readout.retarget(200001);
  expect(state.value).toBe(displayed);
  gsap.getTweensOf(state)[0].progress(1);
  expect(state.value).toBe(200001);expect(state.remaining).toBe(0);
  expect(readout.getLocalBounds().maxX).toBeCloseTo(0,5);
  readout.destroy();expect(gsap.getTweensOf(state)).toHaveLength(0);
});
it('settles exact cents immediately without motion when reduced motion is enabled',()=>{
  const state=moneyState(undefined,'pack',123456,false),readout=new MoneyReadout(state,options('center',true));
  readout.retarget(987654321);readout.pulse();
  expect(state.value).toBe(987654321);expect(state.remaining).toBe(0);
  expect(gsap.getTweensOf(state)).toHaveLength(0);
  const bounds=readout.getLocalBounds();expect(bounds.width).toBeLessThanOrEqual(120.01);
  expect((bounds.minX+bounds.maxX)/2).toBeCloseTo(0,5);
  readout.destroy();
});

// GPU glyph filtering is verified in browser; the CPU tests exercise real
// amount transforms, threshold gating and Pixi filter ownership.
vi.mock('./BurningText',()=>({createBurningText:()=>({filter:{enabled:true},sample:()=>{},destroy:()=>{}})}));
it('keeps a wallet neutral even when its value exceeds a large payout',()=>{
 const readout=new MoneyReadout(moneyState(undefined,'wallet',99999999,true),options('center'));
 const ink=readout.children[0];
 expect(ink.children.every(glyph=>glyph.tint===0xffffff)).toBe(true);
 expect(readout.children).toHaveLength(1);readout.destroy();
});
it('colors a reduced-motion payout without adding fire or an animation ticker',()=>{
 const add=vi.spyOn(gsap.ticker,'add'),readout=new MoneyReadout(moneyState(undefined,'pack',50000,false),{...options('center',true),bet:10000});
 expect(readout.children).toHaveLength(1);
 expect(readout.children[0].children.every(glyph=>glyph.tint===0xffd36f)).toBe(true);
 expect(add).not.toHaveBeenCalled();readout.destroy();add.mockRestore();
});
it('keeps ordinary wins filter-free and anchors only exceptional glyph ignition',()=>{
 const add=vi.spyOn(gsap.ticker,'add'),remove=vi.spyOn(gsap.ticker,'remove'),draw=vi.fn();
 const state=moneyState(undefined,'pack',50000,false),readout=new MoneyReadout(state,{...options('center'),bet:1000,draw});
 const tick=add.mock.calls.at(-1)![0];
 expect(readout.children).toHaveLength(1);
 gsap.getTweensOf(state)[0].progress(.5);
 expect(readout.children).toHaveLength(1);expect(readout.children[0].filters?.length??0).toBe(0);
 readout.retarget(200000);gsap.getTweensOf(state)[0].progress(1);
 expect(readout.children).toHaveLength(1);expect(readout.children[0].filters).toHaveLength(1);
 for(let i=0;i<20;i++){
  tick(i*.05,50,i,0);const bounds=readout.getLocalBounds();
  expect((bounds.minX+bounds.maxX)/2).toBeCloseTo(0,5);expect(bounds.width).toBeLessThanOrEqual(120.01);
 }
 readout.visible=false;draw.mockClear();tick(2,50,21,0);expect(draw).not.toHaveBeenCalled();
 const layers=[...readout.children];readout.destroy();
 expect(remove).toHaveBeenCalledWith(tick);expect(layers.every(layer=>layer.destroyed)).toBe(true);
 add.mockRestore();remove.mockRestore();
});

it('uses a short burst cadence with readable holds and preserves real remaining time',()=>{
 const state=moneyState(undefined,'pack',1000000,false),readout=new MoneyReadout(state,options('center'));
 const tween=gsap.getTweensOf(state)[0],duration=state.remaining;
 expect(duration).toBeLessThanOrEqual(.7);
 tween.progress(.20);const held=state.value;
 tween.progress(.23);expect(state.value).toBe(held);expect(state.remaining).toBeCloseTo(duration*.77,5);
 const remaining=state.remaining;readout.destroy();
 const rebuilt=new MoneyReadout(state,options('center'));
 expect(state.value).toBe(held);expect(state.remaining).toBe(remaining);
 gsap.getTweensOf(state)[0].progress(1);expect(state.value).toBe(state.target);rebuilt.destroy();
});
it('does not ignite exceptional wins under reduced motion and removes the filter after cooling',()=>{
 const reduced=new MoneyReadout(moneyState(undefined,'reduced',300000,true),{...options('center',true),bet:1000});
 expect(reduced.children[0].filters?.length??0).toBe(0);reduced.destroy();
 const state=moneyState(undefined,'cooling',300000,true),readout=new MoneyReadout(state,{...options('center'),bet:1000});
 expect(readout.children[0].filters).toHaveLength(1);
 readout.retarget(10000);gsap.getTweensOf(state)[0].progress(1);
 expect(readout.children[0].filters?.length??0).toBe(0);readout.destroy();
});
