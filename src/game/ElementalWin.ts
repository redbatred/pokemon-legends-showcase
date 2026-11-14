import { Container, Texture } from 'pixi.js';
import { AtlasAttachmentLoader, SkeletonJson, Spine, SpineTexture, TextureAtlas, type SkeletonData } from '@esotericsoftware/spine-pixi-v8';
import type { PowerKind } from './powerProfiles';
import { gameLayout } from './rendering';
import { buildElementalWinRigJson, ELEMENTAL_WIN_ATLAS } from './elementalWinRigData';

type ElementalResources = { reader: SkeletonJson; data: Map<string, SkeletonData> };
let resources: Promise<ElementalResources> | undefined;

/** Shared neutral material atlas; contours and their motion live in the mesh. */
function loadResources(): Promise<ElementalResources> {
  return resources ??= Promise.resolve().then(() => {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 256;
    const c = canvas.getContext('2d',{willReadFrequently:true});
    if (!c) throw new Error('A 2D canvas is required for elemental materials.');
    const material = c.createLinearGradient(0, 0, 64, 0);
    material.addColorStop(0, '#ffffffc8'); material.addColorStop(.18, '#ffffffff');
    material.addColorStop(.82, '#ffffffff'); material.addColorStop(1, '#ffffffc8');
    c.fillStyle = material; c.fillRect(0, 0, 64, 256);
    const soft = c.createLinearGradient(64, 0, 128, 0);
    soft.addColorStop(0, '#ffffff00'); soft.addColorStop(.2, '#ffffff80');
    soft.addColorStop(.45, '#ffffffff'); soft.addColorStop(.55, '#ffffffff');
    soft.addColorStop(.8, '#ffffff80'); soft.addColorStop(1, '#ffffff00');
    c.fillStyle = soft; c.fillRect(64, 0, 64, 256);
    const light = c.createRadialGradient(192, 64, 0, 192, 64, 62);
    light.addColorStop(0, '#ffffffff'); light.addColorStop(.45, '#ffffff66'); light.addColorStop(1, '#ffffff00');
    c.fillStyle = light; c.fillRect(128, 0, 128, 128);
    const fluid = c.createLinearGradient(128, 0, 256, 0);
    fluid.addColorStop(0, '#ffffff00'); fluid.addColorStop(.065, '#ffffffbf');
    fluid.addColorStop(.16, '#ffffffff'); fluid.addColorStop(.84, '#ffffffff');
    fluid.addColorStop(.935, '#ffffffbf'); fluid.addColorStop(1, '#ffffff00');
    c.fillStyle = fluid; c.fillRect(128, 128, 128, 128);
    const atlas = new TextureAtlas(ELEMENTAL_WIN_ATLAS);
    atlas.pages[0].setTexture(SpineTexture.from(Texture.from(canvas).source));
    return { reader: new SkeletonJson(new AtlasAttachmentLoader(atlas)), data: new Map<string, SkeletonData>() };
  }).catch(error => { resources = undefined; throw error; });
}

export async function preloadElementalWin(): Promise<void> { await loadResources(); }

/** Flow surrounds the actual stage: back below the world, low spill above it.
 * The flow holds until destruction/Next. finish() skips only its entrance. */
export class ElementalWin {
  readonly back = new Container();
  readonly front = new Container();
  private rigs: Spine[] = [];
  private age = 0;
  private width = 1000;
  private height = 700;
  private reduced = false;
  private held = false;
  private destroyed = false;

  constructor(kind: PowerKind, epic = false, private readonly low = false) {
    this.back.eventMode = this.front.eventMode = 'none';
    void loadResources().then(shared => {
      if (this.destroyed || this.back.destroyed || this.front.destroyed) return;
      for (const front of [false, true]) {
        const key = `${kind}:${front}:${epic}:${low}`;
        let data = shared.data.get(key);
        if (!data) {
          data = shared.reader.readSkeletonData(buildElementalWinRigJson(kind, front, epic, low));
          shared.data.set(key, data);
        }
        const rig = new Spine({ skeletonData: data, autoUpdate: false });
        rig.state.setAnimation(0, 'flow', true);
        (front ? this.front : this.back).addChild(rig); this.rigs.push(rig);
      }
      this.update(this.age, this.width, this.height, this.reduced);
    }).catch(() => { this.back.visible = this.front.visible = false; });
  }

  update(age: number, width: number, height: number, reduced = false): void {
    if (this.destroyed || this.back.destroyed || this.front.destroyed) return;
    this.age = Number.isFinite(age) ? Math.max(0, age) : 0;
    this.width = width; this.height = height; this.reduced = reduced;
    const l = gameLayout(width, height, true), enter = Math.max(0, Math.min(1, (this.age - .12) / .48));
    const buildup = enter * enter * (3 - 2 * enter);
    const peak = this.age < 1.35 ? 1 : .78 + .22 * Math.exp(-(this.age - 1.35) * 1.8);
    this.back.alpha = (this.low ? .78 : 1) * (this.held ? .78 : buildup * peak);
    this.front.alpha = this.back.alpha * .85;
    this.back.visible = this.front.visible = !reduced;
    if (reduced) return;
    for (const rig of this.rigs) {
      rig.position.set(width / 2, l.stageY); rig.scale.set(l.scale);
      const track = rig.state.getCurrent(0);
      if (track) track.trackTime = this.age + (this.held ? .6 : 0);
      rig.update(0);
    }
  }

  finish(): void {
    if (this.destroyed) return;
    this.held = true;
    this.update(this.age, this.width, this.height, this.reduced);
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    for (const rig of this.rigs) if (!rig.destroyed) rig.state.clearTracks();
    this.rigs.length = 0;
    if (!this.back.destroyed) this.back.destroy({ children: true });
    if (!this.front.destroyed) this.front.destroy({ children: true });
  }
}
