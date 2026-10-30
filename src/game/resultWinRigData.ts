/** Small neutral atlas. The medal, wings and rim are native Spine meshes. */
export const RESULT_WIN_ATLAS = `result-win.png
size: 64,64
filter: Linear,Linear
pma: false
ink
  bounds: 0,0,4,4
star
  bounds: 8,0,32,32
shard
  bounds: 44,0,8,12
`;

type Bone = { name: string; parent?: string; x?: number; y?: number; rotation?: number };
type Key = { time: number; x?: number; y?: number; value?: number };
type Motion = { translate?: Key[]; scale?: Key[]; rotate?: Key[] };
type Mesh = { type: 'mesh'; path: string; width: number; height: number; vertices: number[]; uvs: number[]; triangles: number[]; hull: number };
type Region = { path: string; width: number; height: number };
type Slot = { name: string; bone: string; attachment: string; color: string; blend?: string };
const round = (value: number) => Math.round(value * 10000) / 10000;

function polygon(points: number[]): Mesh {
  const triangles: number[] = [];
  for (let i = 1; i < points.length / 2 - 1; i++) triangles.push(0, i, i + 1);
  return { type: 'mesh', path: 'ink', width: 4, height: 4, vertices: points.map(round), uvs: points.map(() => .5), triangles, hull: points.length / 2 };
}

function arc(rx: number, ry: number, thickness: number, from: number, to: number): Mesh {
  const vertices: number[] = [], triangles: number[] = [], uvs: number[] = [];
  for (let i = 0; i <= 18; i++) {
    const angle = (from + (to - from) * i / 18) * Math.PI / 180;
    for (const inset of [0, thickness]) {
      vertices.push(round(Math.cos(angle) * (rx - inset)), round(Math.sin(angle) * (ry - inset)));
      uvs.push(.5, .5);
    }
    if (i < 18) { const j = i * 2; triangles.push(j, j + 1, j + 2, j + 1, j + 3, j + 2); }
  }
  return { type: 'mesh', path: 'ink', width: 4, height: 4, vertices, uvs, triangles, hull: 0 };
}

function disk(radius: number, from = 0, to = 360): Mesh {
  const points = [0, 0];
  for (let i = 0; i <= 24; i++) { const a = (from + (to - from) * i / 24) * Math.PI / 180; points.push(Math.cos(a) * radius, Math.sin(a) * radius); }
  return polygon(points);
}

/** Authored directly into the allotted area, so a short landscape win never
 * inherits the full-stage celebration's card-covering particle trajectories. */
export function buildResultWinRigJson(width: number, height: number, low = false) {
  const bones: Bone[] = [{ name: 'root' }, { name: 'crest', parent: 'root', y: -height * .385 }];
  const slots: Slot[] = [], attachments: Record<string, Record<string, Mesh | Region>> = {};
  const arrivalBones: Record<string, Motion> = {}, arrivalSlots: Record<string, { alpha: Key[] }> = {};
  const impactBones: Record<string, Motion> = {}, impactSlots: Record<string, { alpha: Key[] }> = {};
  const idleBones: Record<string, Motion> = {}, idleSlots: Record<string, { alpha: Key[] }> = {};
  const add = (name: string, bone: string, shape: Mesh | Region, color: string, additive = false) => {
    slots.push({ name, bone, attachment: name, color, ...(additive ? { blend: 'additive' } : {}) });
    attachments[name] = { [name]: shape };
  };
  const radius = height * .075, wingLength = Math.min(width * .22, height * 1.2);
  for (const side of [-1, 1]) {
    const name = side < 0 ? 'wing-left' : 'wing-right';
    bones.push({ name, parent: 'crest', x: side * radius * 1.5 });
    const points = [0, 0, side * wingLength, height * .065, side * wingLength * .84, height * .016, side * wingLength * .18, -height * .018];
    add(name, name, polygon(points), 'ffd571c0');
    add(`${name}-feather`, name, polygon([side * wingLength * .17, -height * .035, side * wingLength * .69, -height * .018, side * wingLength * .56, -height * .047, side * wingLength * .2, -height * .052]), '9fdde87a');
    arrivalBones[name] = { scale: [{ time: 0, x: .12, y: .6 }, { time: .36, x: 1, y: 1 }] };
    impactBones[name] = { scale: [{ time: 0, x: .86, y: .8 }, { time: .12, x: 1, y: 1 }, { time: .85, x: 1, y: 1 }] };
    const rim = `${name}-rim`;
    add(rim, 'root', arc(width * .465, height * .28, Math.max(.7, height * .009), side > 0 ? -46 : 134, side > 0 ? 46 : 226), 'ffe9ab48');
    impactSlots[rim] = { alpha: [{ time: 0, value: .28 }, { time: .10, value: .8 }, { time: .62, value: .28 }, { time: .85, value: .28 }] };
  }
  add('medal-outline', 'crest', disk(radius), 'ffda85ff');
  add('medal-dark', 'crest', disk(radius * .81), '143a5dff');
  add('medal-red', 'crest', disk(radius * .66, 0, 180), 'f97a56ff');
  add('medal-ivory', 'crest', disk(radius * .66, 180, 360), 'fff4cbff');
  add('medal-stripe', 'crest', polygon([-radius * .75, -radius * .1, radius * .75, -radius * .1, radius * .75, radius * .1, -radius * .75, radius * .1]), '143a5dff');
  add('medal-button-ring', 'crest', disk(radius * .31), '143a5dff');
  add('medal-button', 'crest', disk(radius * .18), 'fff7d9ff');
  arrivalBones.crest = { scale: [{ time: 0, x: .6, y: .6 }, { time: .32, x: 1, y: 1 }] };
  impactBones.crest = { scale: [{ time: 0, x: .84, y: .84 }, { time: .14, x: 1.06, y: 1.06 }, { time: .4, x: 1, y: 1 }] };

  for (let i = 0; i < (low ? 6 : 16); i++) {
    const name = `confetti-${i}`, side = i % 2 ? 1 : -1, lane = Math.floor(i / 2), delay = lane * .018;
    const size = Math.min(4.5, height * (.025 + (i % 3) * .006));
    bones.push({ name, parent: 'root', x: side * width * (.435 + (i % 3) * .009), y: -height * .20, rotation: i * 39 });
    add(name, name, { path: i % 5 ? 'shard' : 'star', width: size, height: size * 1.4 }, `${['ffe48e', 'a9e8fa', 'fff5da'][i % 3]}00`);
    impactBones[name] = {
      translate: [{ time: 0, x: 0, y: 0 }, { time: delay, x: 0, y: 0 }, { time: delay + .27, x: side * width * .012, y: height * (.43 + i % 3 * .025) }, { time: .85, x: side * width * .022, y: height * .015 }],
      rotate: [{ time: 0, value: 0 }, { time: .85, value: side * (210 + i * 13) }],
      scale: [{ time: 0, x: 1, y: 1 }, { time: .24, x: -.8, y: 1 }, { time: .48, x: .7, y: 1 }, { time: .85, x: -.6, y: .8 }],
    };
    impactSlots[name] = { alpha: [{ time: 0, value: 0 }, { time: delay + .04, value: .9 }, { time: .55, value: .8 }, { time: .85, value: 0 }] };
  }
  for (let i = 0; i < (low ? 2 : 4); i++) {
    const name = `glint-${i}`, side = i % 2 ? 1 : -1, start = .1 + i * .11;
    const size = Math.min(15, height * .12);
    bones.push({ name, parent: 'root', x: side * width * .405, y: height * (i < 2 ? .245 : -.255) });
    add(name, name, { path: 'star', width: size, height: size }, i % 2 ? 'cef4ff00' : 'fff2bc00', true);
    impactBones[name] = { scale: [{ time: 0, x: 0, y: 0 }, { time: start, x: 0, y: 0 }, { time: start + .08, x: 1, y: 1 }, { time: start + .34, x: 0, y: 0 }], rotate: [{ time: 0, value: -15 }, { time: .85, value: 35 }] };
    impactSlots[name] = { alpha: [{ time: 0, value: 0 }, { time: start, value: 0 }, { time: start + .08, value: 1 }, { time: start + .34, value: 0 }, { time: .85, value: 0 }] };
    const idle = .4 + i * .56;
    idleBones[name] = { scale: [{ time: 0, x: 0, y: 0 }, { time: idle, x: 0, y: 0 }, { time: idle + .15, x: .62, y: .62 }, { time: idle + .48, x: 0, y: 0 }, { time: 3.6, x: 0, y: 0 }], rotate: [{ time: 0, value: -10 }, { time: 3.6, value: 45 }] };
    idleSlots[name] = { alpha: [{ time: 0, value: 0 }, { time: idle, value: 0 }, { time: idle + .15, value: .65 }, { time: idle + .48, value: 0 }, { time: 3.6, value: 0 }] };
  }
  for (const slot of slots.filter(slot => !/confetti|glint/.test(slot.name))) {
    const opacity = parseInt(slot.color.slice(6), 16) / 255;
    arrivalSlots[slot.name] = { alpha: [{ time: 0, value: 0 }, { time: .30, value: opacity }, { time: .4, value: opacity }] };
  }
  return {
    skeleton: { spine: '4.2.22', x: -width / 2, y: -height / 2, width, height },
    bones, slots, skins: [{ name: 'default', attachments }],
    animations: {
      arrive: { bones: arrivalBones, slots: arrivalSlots },
      impact: { bones: impactBones, slots: impactSlots },
      idle: { bones: idleBones, slots: idleSlots },
      held: {},
    },
  };
}
