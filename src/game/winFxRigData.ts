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
blade
  bounds: 0,64,256,32
ribbon
  bounds: 128,0,32,64
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

/** Smooth the silhouette between the five authored ribbon joints. */
function ribbonPoint(points: readonly Point[], position: number): Point {
  const segment = Math.min(points.length - 2, Math.floor(position));
  const t = position - segment, t2 = t * t, t3 = t2 * t;
  const a = points[Math.max(0, segment - 1)], b = points[segment];
  const c = points[segment + 1], d = points[Math.min(points.length - 1, segment + 2)];
  const axisAt = (axis: 0 | 1) => .5 * (2 * b[axis] + (-a[axis] + c[axis]) * t
    + (2 * a[axis] - 5 * b[axis] + 4 * c[axis] - d[axis]) * t2
    + (-a[axis] + 3 * b[axis] - 3 * c[axis] + d[axis]) * t3);
  return [axisAt(0), axisAt(1)];
}

export function buildWinFxRigJson(epic: boolean, special = false) {
  const bones: Bone[] = [{ name: 'root' }];
  const slots: Slot[] = [];
  const attachments: Record<string, Record<string, Region | Mesh>> = {};
  const boneMotion: Record<string, BoneMotion> = {};
  const slotMotion: Record<string, { alpha: Frame[] }> = {};
  const alpha = (name: string, keys: readonly Point[]) => {
    slotMotion[name] = { alpha: keys.map(([time, value]) => ({ time: round(time), value })) };
  };
  const slot = (name: string, bone: string, attachment: Region | Mesh, color: string, additive = false) => {
    slots.push({ name, bone, attachment: name, color: `${color}00`, ...(additive ? { blend: 'additive' } : {}) });
    attachments[name] = { [name]: attachment };
  };

  // A tapered atlas blade points inward at its left tip. Its local origin is
  // that tip, so scaling it never sweeps a stroke across the center card/title.
  const bladeCount = special ? 10 : epic ? 28 : 22;
  for (let i = 0; i < bladeCount; i++) {
    const name = `blade${i}`, angle = (i + .25) / bladeCount * Math.PI * 2;
    const dx = Math.cos(angle), dy = Math.sin(angle);
    const ellipseRadius = 1 / Math.hypot(dx / 360, dy / 470);
    const rectangleRadius = Math.min(295 / Math.abs(dx), (dy < 0 ? 400 : 270) / Math.abs(dy));
    const protectedRadius = Math.max(ellipseRadius, rectangleRadius);
    const radius = protectedRadius + 12 + sample(i, 5) * 18;
    const length = 135 + sample(i, 7) * 95;
    bones.push({ name, parent: 'root', x: round(dx * radius), y: round(250 + dy * radius), rotation: round(angle * 180 / Math.PI) });
    slot(name, name, { path: 'blade', width: length, height: 4 + i % 4 * 1.5, x: length / 2 }, i % 5 === 0 ? 'fff0ac' : 'd8f7ff', true);
    boneMotion[name] = {
      translate: [{ time: 0, x: 0, y: 0 }, { time: .18, x: 0, y: 0 }, { time: .55, x: round(dx * 62), y: round(dy * 62) }],
      scale: [{ time: 0, x: .04, y: .2 }, { time: .12, x: .04, y: .2 }, { time: .22, x: 1, y: 1 }, { time: .55, x: .72, y: .16 }],
    };
    alpha(name, [[0, 0], [.12, 0], [.21, special ? .20 : epic ? .72 : .58], [.34, .30], [.55, 0], [2.5, 0]]);
  }

  // Two narrow, asymmetric arches, with real weighted vertices. Each joint
  // launches later than the previous one, then settles without a ripple loop.
  for (const [name, side] of [['ribbonLeft', -1], ['ribbonRight', 1]] as const) {
    const points: Point[] = [[280, 52], [345, 108], [416, 181], [404, 254], [351, 299]]
      .map(([x, y]) => [x * side, y] as const);
    const indices: number[] = [];
    for (let joint = 0; joint < points.length; joint++) {
      const boneName = `${name}${joint}`, [x, y] = points[joint];
      indices.push(bones.length);
      bones.push({ name: boneName, parent: 'root', x, y });
      const foldedX = side * (282 + joint * 7) - x, foldedY = 52 + joint * 6 - y;
      const start = .18 + joint * .055, open = .42 + joint * .095;
      boneMotion[boneName] = {
        translate: [
          { time: 0, x: foldedX, y: foldedY }, { time: round(start), x: foldedX, y: foldedY },
          { time: round(open), x: 0, y: 0 }, { time: .85, x: side * joint * 1.2, y: -joint * .7 },
          { time: 1.8, x: side * (14 + joint * 3), y: -50 - joint * 9 },
        ],
        rotate: [
          { time: 0, value: side * (joint % 2 ? -14 : 12) },
          { time: round(start), value: side * (joint % 2 ? -14 : 12) },
          { time: round(open), value: 0 }, { time: .9, value: side * joint * -.9 },
          { time: 1.8, value: side * (joint * -2 - 3) },
        ],
      };
    }
    const uvs: number[] = [], vertices: number[] = [], triangles: number[] = [];
    const rows = 25;
    for (let row = 0; row < rows; row++) {
      const v = row / (rows - 1), position = v * 4;
      const point = ribbonPoint(points, position);
      const before = ribbonPoint(points, Math.max(0, position - .01));
      const after = ribbonPoint(points, Math.min(4, position + .01));
      const dx = after[0] - before[0], dy = after[1] - before[1], distance = Math.hypot(dx, dy);
      const halfWidth = 1.4 + Math.sin(v * Math.PI) ** .7 * (epic ? 5.2 : 4.5);
      const first = Math.min(3, Math.floor(position)), weight = position - first;
      for (const edge of [-1, 1]) {
        const x = point[0] - dy / distance * halfWidth * edge, y = point[1] + dx / distance * halfWidth * edge;
        uvs.push((edge + 1) / 2, 1 - v);
        // Every vertex has two joint influences in Spine's packed weight format:
        // influence count, bone index, local X, local Y, weight, ...
        vertices.push(2, indices[first], round(x - points[first][0]), round(y - points[first][1]), round(1 - weight),
          indices[first + 1], round(x - points[first + 1][0]), round(y - points[first + 1][1]), round(weight));
      }
      if (row < rows - 1) {
        const a = row * 2;
        triangles.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
    slot(name, 'root', { type: 'mesh', path: 'ribbon', width: 32, height: 64, uvs, vertices, triangles, hull: rows * 2 }, side < 0 ? 'd9f1ff' : '96d6ff');
    const strength = special ? .36 : 1;
    alpha(name, [[0, 0], [.18, 0], [.30, .78 * strength], [.60, .94 * strength], [.95, .70 * strength], [1.45, .28 * strength], [1.8, 0], [2.5, 0]]);
  }

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
  }

  return {
    skeleton: { spine: '4.2.22', x: -500, y: -175, width: 1000, height: 700 },
    bones, slots, skins: [{ name: 'default', attachments }],
    animations: { celebrate: { bones: boneMotion, slots: slotMotion } },
  };
}
