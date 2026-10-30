import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { Container, Texture } from 'pixi.js';
import { Spine } from '@esotericsoftware/spine-pixi-v8';
import { gsap } from 'gsap';
import { ResultWin, preloadResultWin, type ResultWinOptions } from './ResultWin';
import { MoneyReadout } from './MoneyReadout';
import { moneyState } from './moneyMotion';
import { playSound } from './audio';

vi.mock('./audio', () => ({ playSound: vi.fn() }));
// Node has no text rasterizer. Replace only its glyph surface: actual
// MoneyReadout fitting/counting, Pixi ownership and native Spine run unchanged.
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

describe('single result win ownership', () => {
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
    expect(descendants(win).filter(child => child instanceof MoneyReadout)).toHaveLength(1);
    expect(state.value).toBe(987654321); expect(state.remaining).toBe(0);
    const bounds = win.amount.getLocalBounds();
    expect(bounds.width).toBeLessThanOrEqual(240 * .8 + .01);
    expect(Math.abs((bounds.minY + bounds.maxY) / 2)).toBeLessThan(.01);
    win.destroy();
  });

  it('continues the actual displayed cents and does not repeat entrance or finish audio after rebuilding', async () => {
    const state = moneyState(undefined, 'pack-1', 420000, false), win = new ResultWin(state, options());
    expect(state.remaining).toBe(1.3);
    gsap.getTweensOf(state)[0].progress(.4);
    const displayed = state.value, remaining = state.remaining;
    expect(displayed).toBeGreaterThan(0); expect(displayed).toBeLessThan(state.target);
    win.destroy();
    const rebuilt = new ResultWin(state, options({ width: 500 }));
    expect(state.value).toBe(displayed); expect(state.remaining).toBe(remaining);
    rebuilt.display(state.target);
    expect(playSound).toHaveBeenCalledTimes(1); expect(playSound).toHaveBeenLastCalledWith('complete', { gain: .42 });
    rebuilt.destroy();
    const settled = new ResultWin(state, options()); await preloadResultWin();
    expect(state.value).toBe(420000); expect(playSound).toHaveBeenCalledTimes(1);
    settled.destroy();
  });

  it('uses an independent GSAP ticker, cleans its ownership, and rejects late loading after destruction', async () => {
    const add = vi.spyOn(gsap.ticker, 'add'), remove = vi.spyOn(gsap.ticker, 'remove');
    const state = moneyState(undefined, 'pack-2', 5000, false), draw = vi.fn();
    const win = new ResultWin(state, options({ turbo: true, draw }));
    expect(state.remaining).toBe(.85);
    const tick = add.mock.calls.at(-1)![0];
    await preloadResultWin();
    const rig = descendants(win).find(child => child instanceof Spine) as Spine;
    expect(rig.autoUpdate).toBe(false);
    tick(1, 100, 1, 0); expect(draw).toHaveBeenCalled();
    win.destroy(); expect(remove).toHaveBeenCalledWith(tick); expect(rig.destroyed).toBe(true);
    expect(gsap.getTweensOf(state)).toHaveLength(0);
    const late = new ResultWin(moneyState(undefined, 'late', 100, false), options()); late.destroy();
    await preloadResultWin(); expect(late.destroyed).toBe(true); expect(late.children).toHaveLength(0);
    expect(() => late.destroy()).not.toThrow();
    add.mockRestore(); remove.mockRestore();
  });
});
