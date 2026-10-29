/** Native Spine 4.2 celebration, authored in a 1000 × 700 viewport.
 * The origin is the banner center; positive Y points upward in Spine space.
 * Artwork is neutral white: slots supply the gold, cyan, and silver palette.
 */
export const WIN_FX_ATLAS = `win-fx.png
size: 256,256
filter: Linear,Linear
pma: false
shard
  bounds: 0,0,32,32
star
  bounds: 32,0,64,64
`;

type Point = readonly [number, number];
type Bone = { name: string; parent?: string; x?: number; y?: number; rotation?: number };
type Slot = { name: string; bone: string; attachment: string; color: string; blend?: string };
type Frame = { time: number; x?: number; y?: number; value?: number };
type BoneMotion = { translate?: Frame[]; rotate?: Frame[]; scale?: Frame[] };
type Region = { path: string; width: number; height: number; x?: number };
type Mesh = { type: 'mesh'; path: string; width: number; height: number; uvs: number[]; vertices: number[]; triangles: number[]; hull: number };

const round = (value: number) => Math.round(value * 10000) / 10000;
const sample = (index: number, salt = 0) => {
  const value = Math.sin((index + 1) * 127.1 + salt * 311.7) * 43758.5453;
  return value - Math.floor(value);
};

export function buildWinFxRigJson(epic: boolean, special = false) {
  const bones: Bone[] = [{ name: 'root' }];
  const slots: Slot[] = [];
  const attachments: Record<string, Record<string, Region | Mesh>> = {};
  const boneMotion: Record<string, BoneMotion> = {};
  const slotMotion: Record<string, { alpha: Frame[] }> = {};
  const idleBones: Record<string, BoneMotion> = {};
  const idleSlots: Record<string, { alpha: Frame[] }> = {};
  const alpha = (name: string, keys: readonly Point[]) => {
    slotMotion[name] = { alpha: keys.map(([time, value]) => ({ time: round(time), value })) };
  };
  const slot = (name: string, bone: string, attachment: Region | Mesh, color: string, additive = false) => {
    slots.push({ name, bone, attachment: name, color: `${color}00`, ...(additive ? { blend: 'additive' } : {}) });
    attachments[name] = { [name]: attachment };
  };

  // The elemental stage flow carries the impact. Confetti stays off the card.
  const confettiCount = special ? 12 : epic ? 54 : 36;
  const palette = ['ffe077', '79e4ff', 'f5fdff', 'ffcc56', 'b8efff'];
  for (let i = 0; i < confettiCount; i++) {
    const name = `confetti${i}`, side = i % 2 ? 1 : -1;
    const seed = sample(i), delay = .10 + sample(i, 2) * .13;
    const velocityX = side * (i % 5 === 0 ? 35 + seed * 65 : -(25 + seed * 95));
    const velocityY = 435 + sample(i, 3) * (epic ? 175 : 135), gravity = 610 + sample(i, 4) * 65;
    const rotation = sample(i, 6) * 360, spin = (i % 3 ? 1 : -1) * (290 + seed * 440);
    const star = i % 6 === 0, size = 5 + seed * 5;
    bones.push({ name, parent: 'root', x: side * (309 + sample(i, 8) * 31), y: 0, rotation: round(rotation) });
    slot(name, name, { path: star ? 'star' : 'shard', width: star ? size * 1.65 : size, height: star ? size * 1.65 : size * 1.55 }, palette[i % palette.length]);
    const translate: Frame[] = [{ time: 0, x: 0, y: 0 }];
    const rotate: Frame[] = [{ time: 0, value: 0 }];
    const scale: Frame[] = [{ time: 0, x: 1, y: 1 }];
    // These are exported keyframes, not a per-frame particle simulation.
    for (let frame = 0; frame <= 20; frame++) {
      const t = frame * .1, time = round(delay + t);
      translate.push({ time, x: round(velocityX * t + Math.sin(t * 4 + seed * 6) * t * 5), y: round(velocityY * t - gravity * t * t / 2) });
      rotate.push({ time, value: round(spin * t) });
      scale.push({ time, x: round(Math.cos(t * (8 + seed * 5))), y: round(.86 + Math.sin(t * 5 + seed * 6) * .14) });
    }
    boneMotion[name] = { translate, rotate, scale };
    alpha(name, [[0, 0], [delay, 0], [delay + .06, special ? .74 : 1], [delay + 1.22, special ? .60 : .95], [delay + 2, 0], [2.5, 0]]);
  }

  const glints: readonly Point[] = [[-254, 62], [263, 76], [-386, 221], [374, 307], [-155, 384], [188, 430]];
  for (let i = 0; i < (special ? 2 : epic ? 6 : 4); i++) {
    const name = `glint${i}`, [x, y] = glints[i], delay = .48 + i * .16;
    bones.push({ name, parent: 'root', x, y, rotation: i * 17 });
    slot(name, name, { path: 'star', width: i < 2 ? 25 : 18, height: i < 2 ? 32 : 25 }, i % 2 ? 'd7f5ff' : 'fff2bb', true);
    boneMotion[name] = {
      scale: [{ time: 0, x: 0, y: 0 }, { time: delay, x: 0, y: 0 }, { time: delay + .10, x: 1, y: 1 }, { time: delay + .35, x: .1, y: .1 }],
      rotate: [{ time: 0, value: -12 }, { time: delay, value: -12 }, { time: delay + .35, value: 35 }],
    };
    alpha(name, [[0, 0], [delay, 0], [delay + .10, .94], [delay + .35, 0], [2.5, 0]]);
    const idleStart=round(.2+i*.28);
    idleBones[name]={scale:[{time:0,x:0,y:0},{time:idleStart,x:0,y:0},{time:round(idleStart+.16),x:.8,y:.8},{time:round(idleStart+.55),x:0,y:0},{time:2.8,x:0,y:0}],rotate:[{time:0,value:-10},{time:idleStart,value:-10},{time:round(idleStart+.55),value:35}]};
    idleSlots[name]={alpha:[{time:0,value:0},{time:idleStart,value:0},{time:round(idleStart+.16),value:.65},{time:round(idleStart+.55),value:0},{time:2.8,value:0}]};
  }

  return {
    skeleton: { spine: '4.2.22', x: -500, y: -175, width: 1000, height: 700 },
    bones, slots, skins: [{ name: 'default', attachments }],
    animations: { celebrate: { bones: boneMotion, slots: slotMotion }, idle: { bones: idleBones, slots: idleSlots } },
  };
}
