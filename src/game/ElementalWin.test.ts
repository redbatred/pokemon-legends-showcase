import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { Texture } from 'pixi.js';
import { MeshAttachment, Spine } from '@esotericsoftware/spine-pixi-v8';
import { ElementalWin, preloadElementalWin } from './ElementalWin';
import { gameLayout } from './rendering';

// Only the unavailable Node raster surface is replaced. Real Spine data, native
// mesh deformation, animation state, Pixi containers and destruction are exercised.
beforeAll(() => {
  const gradient = { addColorStop() {} }, context = { fillRect() {}, createLinearGradient: () => gradient, createRadialGradient: () => gradient };
  vi.stubGlobal('document', { createElement: () => ({ getContext: () => context }) });
  vi.spyOn(Texture, 'from').mockReturnValue(Texture.EMPTY);
});
afterAll(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('persistent elemental stage flow', () => {
  it('catches up after loading and holds visible moving material until destruction', async () => {
    const effect = new ElementalWin('water', true);
    effect.update(.55, 1200, 760); await preloadElementalWin();
    const rigs = [...effect.back.children, ...effect.front.children] as Spine[];
    expect(rigs).toHaveLength(2);
    for (const age of [.55, 5, 20, 75]) {
      effect.update(age, 1200, 760);
      expect(effect.back.visible).toBe(true); expect(effect.back.alpha).toBeGreaterThan(.7);
      for (const rig of rigs) {
        expect(rig.state.getCurrent(0)!.trackTime).toBe(age);
        expect(rig.skeleton.slots.some(slot => slot.color.a > .5 && slot.getAttachment() instanceof MeshAttachment)).toBe(true);
      }
    }
    effect.destroy();
    expect(rigs.every(rig => rig.destroyed)).toBe(true);
    expect(effect.back.destroyed).toBe(true); expect(effect.front.destroyed).toBe(true);
  });

  it('skips straight to the held flow even when finish precedes asynchronous loading', async () => {
    const effect = new ElementalWin('fire'); effect.finish(); await preloadElementalWin();
    expect(effect.back.children).toHaveLength(1); expect(effect.front.children).toHaveLength(1);
    expect(effect.back.alpha).toBeCloseTo(.78); expect(effect.back.visible).toBe(true);
    effect.update(10, 1000, 700);
    expect((effect.back.children[0] as Spine).state.getCurrent(0)!.trackTime).toBe(10.6);
    effect.destroy();
  });

  it('never creates late instances after destruction', async () => {
    const effect = new ElementalWin('electric'); effect.destroy(); await preloadElementalWin();
    expect(effect.back.destroyed).toBe(true); expect(effect.front.destroyed).toBe(true);
    effect.destroy();
  });

  it('hides the full flow for reduced motion without restarting when restored', async () => {
    const effect = new ElementalWin('leaf'); effect.update(.3, 900, 700, true); await preloadElementalWin();
    expect(effect.back.visible).toBe(false); expect(effect.front.visible).toBe(false);
    effect.update(8.2, 900, 700, false);
    expect(effect.back.visible).toBe(true);
    expect((effect.back.children[0] as Spine).state.getCurrent(0)!.trackTime).toBe(8.2);
    effect.destroy();
  });

  it('tolerates the parent scene destroying its containers first', async () => {
    const effect = new ElementalWin('ice'); await preloadElementalWin();
    effect.back.destroy({ children: true }); effect.front.destroy({ children: true });
    expect(() => effect.destroy()).not.toThrow();
  });

  it.each([[390, 780], [430, 932], [1280, 720], [1920, 1080]])('uses the actual stage origin and uniform projection at %s × %s', async (width, height) => {
    const effect = new ElementalWin('fire', true); await preloadElementalWin(); effect.update(.65, width, height);
    const stage = gameLayout(width, height, true);
    for (const rig of [...effect.back.children, ...effect.front.children] as Spine[]) {
      expect(rig.x).toBe(width / 2); expect(rig.y).toBe(stage.stageY);
      expect(rig.scale.x).toBe(stage.scale); expect(rig.scale.y).toBe(stage.scale);
    }
    effect.destroy();
  });
});
