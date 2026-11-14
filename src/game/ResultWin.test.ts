import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { Container, Texture } from 'pixi.js';
import { gsap } from 'gsap';
import { ResultWin, type ResultWinOptions } from './ResultWin';
import { ResultDigits } from './ResultDigits';
import { PACK_COUNT } from './packFinaleMotion';
import { CanvasUI } from './CanvasUI';
import { moneyState } from './moneyMotion';
import { playSound } from './audio';

vi.mock('./audio', () => ({ playSound: vi.fn() }));
// Node has no text rasterizer. Replace only its glyph surface: the count, its fitting and Pixi ownership run unchanged.
vi.mock('pixi.js', async importOriginal => {
  const pixi = await importOriginal<typeof import('pixi.js')>();
  class GlyphSurface extends pixi.Container {
    readonly anchor = new pixi.Point();
    readonly style: { fontSize: number };
    private glyphs = new pixi.Graphics();
    private value = '';
    constructor(options: { text: string; style: { fontSize: number } }) { super(); this.style = options.style; this.addChild(this.glyphs); this.text = options.text; }
    get text() { return this.value; }
    set text(value: string) { this.value = value; this.glyphs.clear().rect(0, 0, value.length * this.style.fontSize * .62, this.style.fontSize).fill(0xffffff); }
  }
  return { ...pixi, Text: GlyphSurface, BitmapText: GlyphSurface };
});

beforeAll(() => {
  const context = { fillStyle: '', fillRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, closePath() {}, fill() {} };
  vi.stubGlobal('document', { hidden: false, createElement: () => ({ getContext: () => context }) });
  vi.spyOn(Texture, 'from').mockReturnValue(Texture.EMPTY);
  gsap.ticker.sleep();
});
afterEach(() => { gsap.globalTimeline.clear(); gsap.ticker.sleep(); vi.mocked(playSound).mockClear(); });
afterAll(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });
const options = (overrides: Partial<ResultWinOptions> = {}): ResultWinOptions => ({ width: 342, height: 100, mode: 'pack', reduced: false, turbo: false, low: false, draw: vi.fn(), ...overrides });
const descendants = (root: Container): Container[] => [root, ...root.children.flatMap(child => descendants(child as Container))];

/** Advance the count's own clock by `seconds`, in frames no longer than the 0.1 s it accepts. */
const run=(tick:(...args:number[])=>void,seconds:number)=>{for(let left=seconds;left>1e-9;left-=.05)tick(0,Math.min(50,left*1000),0,0);};
const sounds=()=>vi.mocked(playSound).mock.calls.map(([name])=>name);

describe('single result win ownership', () => {
  it('lands on the exact total with one win cue, then one delayed resolution cue',()=>{
    const add=vi.spyOn(gsap.ticker,'add'),state=moneyState(undefined,'timed-session',123456,false);
    const win=new ResultWin(state,options({mode:'session'})),tick=add.mock.calls.at(-1)![0];
    run(tick,.3);expect(state.value).toBeGreaterThan(0);expect(state.value).toBeLessThan(state.target);
    expect(sounds().some(name=>name==='win'||name==='complete')).toBe(false);
    win.display(state.target);expect(state.value).toBe(123456);expect(state.remaining).toBe(0);expect(playSound).toHaveBeenLastCalledWith('win',{gain:.85});
    // The landing holds its first frame, then the resolution follows 0.16 s later, once.
    run(tick,PACK_COUNT.stop*.5+.1);expect(sounds()).not.toContain('complete');
    run(tick,.1);expect(playSound).toHaveBeenLastCalledWith('complete',{gain:.8});
    run(tick,1);expect(sounds().filter(name=>name==='complete')).toHaveLength(1);expect(sounds().filter(name=>name==='win')).toHaveLength(1);
    win.destroy();add.mockRestore();
  });

  it.each(['pack', 'interlude', 'session'] as const)('keeps the %s completion cue with reduced motion without repeating on rebuild', mode => {
    const state = moneyState(undefined, 'reduced-' + mode, 125000, false);
    const win = new ResultWin(state, options({ reduced: true, mode }));
    expect(state.value).toBe(125000);
    expect(playSound).toHaveBeenCalledExactlyOnceWith('complete', { gain: mode === 'session' ? .58 : .42 });
    win.destroy();
    const rebuilt = new ResultWin(state, options({ reduced: true, mode }));
    expect(playSound).toHaveBeenCalledTimes(1);
    rebuilt.destroy();
  });

  it('fits one huge exact-cents amount even at minimum landscape dimensions', () => {
    const state = moneyState(undefined, 'hundred-packs', 987654321, false);
    const win = new ResultWin(state, options({ width: 240, height: 76, reduced: true, mode: 'session' }));
    expect(descendants(win).filter(child => child instanceof ResultDigits)).toHaveLength(1);
    expect(state.value).toBe(987654321); expect(state.remaining).toBe(0);
    expect(win.amount.drawnWidth).toBeLessThanOrEqual(240 * .8 + .01);expect(win.amount.drawnWidth).toBeGreaterThan(240*.6);
    win.destroy();
  });

  it('continues the actual displayed cents and does not repeat the landing after rebuilding', () => {
    const add=vi.spyOn(gsap.ticker,'add'),state = moneyState(undefined, 'pack-1', 420000, false), win = new ResultWin(state, options());
    // No tiles and no tier to cross: the roll starts at once and is short.
    expect(state.remaining).toBeCloseTo(.1+PACK_COUNT.base,1);
    run(add.mock.calls.at(-1)![0],.5);
    const displayed = state.value, remaining = state.remaining;
    expect(displayed).toBeGreaterThan(0); expect(displayed).toBeLessThan(state.target);
    win.destroy();
    const rebuilt = new ResultWin(state, options({ width: 500 }));
    expect(state.value).toBe(displayed); expect(state.remaining).toBe(remaining);
    rebuilt.display(state.target);
    expect(sounds().filter(name=>name==='win')).toHaveLength(1); expect(playSound).toHaveBeenLastCalledWith('win', { gain: .6 });
    rebuilt.destroy();const before=vi.mocked(playSound).mock.calls.length;
    const settled = new ResultWin(state, options());
    expect(state.value).toBe(420000); expect(playSound).toHaveBeenCalledTimes(before);
    settled.destroy();add.mockRestore();
  });

  it('uses an independent GSAP ticker, stops asking for frames once at rest, and leaves nothing behind', async () => {
    const add = vi.spyOn(gsap.ticker, 'add'), remove = vi.spyOn(gsap.ticker, 'remove');
    const state = moneyState(undefined, 'pack-2', 5000, false), draw = vi.fn();
    const win = new ResultWin(state, options({ turbo: true, draw }));
    const tick = add.mock.calls.at(-1)![0];
    tick(1, 100, 1, 0); expect(draw).toHaveBeenCalled();
    // Turbo runs the same count faster; when it has landed and settled the modal is static and is not redrawn.
    run(tick,3);expect(state.value).toBe(5000);const drawn=draw.mock.calls.length;run(tick,1);expect(draw).toHaveBeenCalledTimes(drawn);
    win.pulse();run(tick,.1);expect(draw.mock.calls.length).toBeGreaterThan(drawn);
    const layer = win.celebrationLayer;
    win.destroy(); expect(remove).toHaveBeenCalledWith(tick); expect(layer.destroyed).toBe(true);
    expect(gsap.getTweensOf(state)).toHaveLength(0);
    const late = new ResultWin(moneyState(undefined, 'late', 100, false), options()); late.destroy();
    await Promise.resolve(); expect(late.destroyed).toBe(true); expect(late.children).toHaveLength(0);
    expect(() => late.destroy()).not.toThrow();
    add.mockRestore(); remove.mockRestore();
  });
});

it('finishes the result count on the first Continue and navigates only on the next press',()=>{
  const state=moneyState(undefined,'tap-result',123456,false),win=new ResultWin(state,options()),action=vi.fn();
  const ui=Object.assign(Object.create(CanvasUI.prototype),{
    transitioning:false,modalKind:'results',resultAmount:win,resultCount:state,
    state:{reduced:true,action},stage:{draw:vi.fn()},historyOpening:null,autoPack:null,
  }) as {dismissModal:(action:'continue')=>void};
  ui.dismissModal('continue');
  expect(state.value).toBe(state.target);expect(state.remaining).toBe(0);
  expect(action).not.toHaveBeenCalled();
  ui.dismissModal('continue');expect(action).toHaveBeenCalledExactlyOnceWith('continue');
  win.destroy();
});

it('turns a win gold from its own pack cost and leaves less than the stake cream',()=>{
  const hot=new ResultWin(moneyState(undefined,'hot-pack',50000,false),options({reduced:true,bet:10000}));
  const neutral=new ResultWin(moneyState(undefined,'neutral-pack',50000,false),options({reduced:true,bet:100000}));
  expect(hot.amount.faceTint).toBe(0xffd24a);expect(neutral.amount.faceTint).toBe(0xfff4d6);
  hot.destroy();neutral.destroy();
});

it.each([[5,'PACK WIN'],[10,'BIG WIN'],[50,'MEGA WIN'],[100,'EPIC WIN'],[150,'LEGENDARY WIN']] as const)('labels a %s× result with the right win tier', (ratio,title)=>{
  const win=new ResultWin(moneyState(undefined,'title-'+ratio,ratio*10000,false),options({reduced:true,bet:10000}));
  const text=descendants(win).filter(child=>'text' in child).map(child=>(child as Container & {text:string}).text);
  expect(text).toContain(title);win.destroy();
});

describe('a slot-length count',()=>{
  const titleOf=(win:ResultWin)=>descendants(win).filter(child=>'text' in child).map(child=>(child as Container & {text:string}).text)[0];
  it('upgrades the tier name in place on the way up, each with its own cue, and lands inside three seconds',()=>{
    const add=vi.spyOn(gsap.ticker,'add'),impact=vi.fn(),state=moneyState(undefined,'big-roll',3000000,false),win=new ResultWin(state,options({bet:10000,onImpact:impact})),tick=add.mock.calls.at(-1)![0];
    expect(titleOf(win)).toBe('PACK WIN');expect(state.remaining).toBeCloseTo(.1+PACK_COUNT.base+PACK_COUNT.perTier*4,1);expect(state.remaining).toBeLessThan(3);
    const seen:string[]=[];for(let t=0;t<3.2;t+=.05){tick(0,50,0,0);const title=titleOf(win);if(seen.at(-1)!==title)seen.push(title);}
    expect(seen).toEqual(['PACK WIN','BIG WIN','MEGA WIN','EPIC WIN','LEGENDARY WIN']);expect(state.value).toBe(3000000);
    expect(sounds().filter(name=>String(name).startsWith('win-rung-'))).toEqual(['win-rung-1','win-rung-2','win-rung-3','win-rung-3']);
    expect(sounds()).toContain('win-final-4');expect(sounds().filter(name=>name==='win')).toHaveLength(1);
    // Ticks rise: the last is pitched above the first.
    const ticks=vi.mocked(playSound).mock.calls.filter(([name])=>name==='win-tick').map(([,options])=>(options as {rate:number}).rate);expect(ticks.length).toBeGreaterThan(20);expect(ticks.at(-1)!).toBeGreaterThan(ticks[0]+.5);
    // Four upgrades and one landing reach the panel; the landing is the hardest.
    expect(impact).toHaveBeenCalledTimes(5);expect(impact.mock.calls.at(-1)![0]).toBe(1);expect(Math.max(...impact.mock.calls.slice(0,4).map(([power])=>power))).toBeLessThan(1);
    win.destroy();add.mockRestore();
  });
  it('counts on from the old total when a bonus arrives on a settled result',()=>{
    const add=vi.spyOn(gsap.ticker,'add'),settled=moneyState(undefined,'late-bonus',1515,false);settled.value=1515;settled.remaining=0;
    const first=new ResultWin(settled,options({bet:1000}));expect(titleOf(first)).toBe('PACK WIN');first.destroy();vi.mocked(playSound).mockClear();
    const state=moneyState(settled,'late-bonus',181515,false);expect(state).not.toBe(settled);expect(state.value).toBe(1515);
    const win=new ResultWin(state,options({bet:1000})),tick=add.mock.calls.at(-1)![0];let low=state.value;
    expect(win.paying).toBe(true);
    for(let t=0;t<3;t+=.05){tick(0,50,0,0);expect(state.value).toBeGreaterThanOrEqual(low);low=state.value;expect(state.value).toBeGreaterThanOrEqual(1515);}
    expect(state.value).toBe(181515);expect(win.paying).toBe(false);expect(titleOf(win)).toBe('LEGENDARY WIN');expect(sounds()).toContain('win-final-4');
    win.destroy();add.mockRestore();
  });
  it('lands at once on a tap, with the final tier, and does not land twice',()=>{
    const add=vi.spyOn(gsap.ticker,'add'),state=moneyState(undefined,'tap-big',600000,false),win=new ResultWin(state,options({bet:10000})),tick=add.mock.calls.at(-1)![0];
    run(tick,.3);win.display(state.target);expect(state.value).toBe(600000);expect(titleOf(win)).toBe('MEGA WIN');
    win.display(state.target);run(tick,2);expect(sounds().filter(name=>name==='win')).toHaveLength(1);expect(sounds().filter(name=>name==='win-final-2')).toHaveLength(1);
    win.destroy();add.mockRestore();
  });
});
