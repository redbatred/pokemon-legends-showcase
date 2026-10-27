/** Spine 4.2 weighted artwork rigs. Coordinates below are normalized image UVs.
 * Left/right refer to the image, so profile landmarks can be checked against PNGs.
 * This is constrained 2D cutout articulation, not unseen anatomy or a 3D model.
 */
type Point = readonly [number, number];
type Motion = { angle?: number; phase?: number; breathe?: number };
type Joint = { name: string; parent?: string; at: Point; motion?: Motion };
type Zone = {
  bone: string;
  center?: Point;
  radius?: Point;
  polygon?: readonly Point[];
  distal?: string;
  axis?: readonly [Point, Point];
  feather?: number;
};
type Anatomy = 'dragon' | 'quadruped' | 'bird' | 'serpent' | 'humanoid' | 'conservative';
type Profile = { anatomy: Anatomy; joints: Joint[]; zones: Zone[]; amplitude: number };
type Frame = { time: number; value?: number; x?: number; y?: number };
type Timeline = { rotate?: Frame[]; scale?: Frame[] };

export const POKEMON_RIG_SIZE = 350;

const clamp = (x: number) => Math.max(0, Math.min(1, x));
const smooth = (x: number) => { const t = clamp(x); return t * t * (3 - 2 * t); };
const ellipse = (bone: string, center: Point, radius: Point): Zone => ({ bone, center, radius });
const joint = (name: string, parent: string, at: Point, angle = 0, phase = 0): Joint => ({ name, parent, at, motion: { angle, phase } });

function torso(head: Point = [.5, .25], pelvis: Point = [.5, .65], chest: Point = [.5, .47]): Joint[] {
  return [
    { name: 'root', at: [.5, .5] },
    joint('pelvis', 'root', pelvis),
    { ...joint('chest', 'pelvis', chest, .55), motion: { angle: .55, breathe: .012 } },
    joint('neck', 'chest', [(head[0] + chest[0]) / 2, (head[1] + chest[1]) / 2], .8, .35),
    joint('head', 'neck', head, 1.3, .6),
  ];
}

function charizard(): Profile {
  const joints = torso([.47, .23], [.52, .69], [.52, .48]);
  joints.push(
    joint('wingLeft', 'chest', [.44, .44], 6.5),
    joint('wingLeftTip', 'wingLeft', [.29, .32], 3.8, -.8),
    joint('wingRight', 'chest', [.60, .44], -4.5, .12),
    joint('wingRightTip', 'wingRight', [.77, .34], -2.5, -.68),
    joint('armLeft', 'chest', [.43, .47], 1.8, .5),
    joint('handLeft', 'armLeft', [.33, .53], 1, .8),
    joint('armRight', 'chest', [.62, .47], -1.8, .55),
    joint('handRight', 'armRight', [.71, .53], -1, .9),
    joint('legLeft', 'pelvis', [.40, .68], .35, .4),
    joint('legRight', 'pelvis', [.65, .68], -.35, .4),
    // Root-parented foot anchors keep the painted toes planted independently of breathing.
    joint('footLeft', 'root', [.31, .81]),
    joint('footRight', 'root', [.70, .80]),
    joint('tail', 'pelvis', [.43, .71], 1.2, -.65),
    joint('tailMid', 'tail', [.67, .75], 1.5, -1.15),
    joint('tailTip', 'tailMid', [.84, .68], 1.8, -1.7),
    { ...joint('flame', 'tailTip', [.87, .63], 1.8, -2.1), motion: { angle: 1.8, phase: -2.1, breathe: .035 } },
  );
  const zones: Zone[] = [
    { bone: 'footLeft', polygon: [[.25, .77], [.38, .76], [.38, .88], [.24, .88]] },
    { bone: 'footRight', polygon: [[.64, .76], [.78, .77], [.79, .86], [.63, .87]] },
    { bone: 'head', polygon: [[.34, .12], [.54, .12], [.62, .25], [.53, .29], [.37, .26]] },
    { bone: 'neck', polygon: [[.45, .25], [.54, .26], [.60, .47], [.46, .49]] },
    { bone: 'flame', feather: .065, polygon: [[.856, .475], [.88, .49], [.905, .58], [.914, .64], [.89, .672], [.827, .664], [.822, .615], [.843, .55]] },
    // Extend the masks into transparent padding so silhouette vertices follow the wing,
    // rather than blending back to the chest along every outer membrane edge.
    { bone: 'wingLeft', distal: 'wingLeftTip', axis: [[.44, .44], [.14, .27]], polygon: [[0, 0], [.34, 0], [.36, .35], [.46, .43], [.47, .47], [.33, .48], [.25, .54], [.15, .47], [0, .64]] },
    { bone: 'wingRight', distal: 'wingRightTip', axis: [[.60, .44], [.90, .34]], polygon: [[.65, 0], [1, 0], [1, .70], [.94, .66], [.82, .47], [.77, .56], [.66, .49], [.58, .46], [.66, .36]] },
    { bone: 'armLeft', distal: 'handLeft', axis: [[.43, .47], [.31, .55]], polygon: [[.46, .44], [.36, .45], [.26, .52], [.27, .59], [.37, .60], [.40, .52], [.47, .50]] },
    { bone: 'armRight', distal: 'handRight', axis: [[.62, .47], [.73, .55]], polygon: [[.60, .44], [.69, .45], [.79, .53], [.78, .60], [.69, .60], [.65, .52], [.59, .50]] },
    ellipse('legLeft', [.35, .72], [.115, .10]),
    ellipse('legRight', [.68, .72], [.10, .095]),
    { bone: 'tailTip', polygon: [[.70, .72], [.81, .69], [.87, .62], [.91, .61], [.87, .72], [.77, .78], [.69, .78]] },
    ellipse('tail', [.23, .70], [.13, .105]),
    ellipse('tailMid', [.57, .77], [.19, .035]),
  ];
  return { anatomy: 'dragon', joints, zones, amplitude: 1 };
}

const quadrupeds: Record<string, Point> = {
  arceus: [.43, .20], eevee: [.53, .32], espeon: [.31, .30], glaceon: [.36, .31], leafeon: [.53, .31],
  ninetales: [.55, .33], raikou: [.38, .37], suicune: [.31, .32], sylveon: [.51, .36], umbreon: [.39, .29], vaporeon: [.38, .31], venusaur: [.49, .62],
};
const birds: Record<string, Point> = {
  aerodactyl: [.56, .28], articuno: [.57, .25], lugia: [.69, .24], moltres: [.49, .38], pidgeot: [.67, .29], pidgey: [.46, .30], zapdos: [.51, .46],
};
const humanoids: Record<string, Point> = {
  alakazam: [.51, .27], blastoise: [.47, .22], breloom: [.51, .24], cinderace: [.50, .20], cleffa: [.47, .37],
  dracozolt: [.54, .30], dragonite: [.47, .24], duraludon: [.55, .25], gardevoir: [.52, .26], genesect: [.52, .25],
  gengar: [.48, .40], greninja: [.55, .38], mewtwo: [.52, .24], pikachu: [.53, .31], pinsir: [.50, .40],
  raichu: [.48, .31], scizor: [.55, .25], trevenant: [.51, .30], tyranitar: [.52, .28],
};

function quadruped(name: string): Profile {
  const head = quadrupeds[name];
  const joints = torso(head, [.58, .63], [.48, .52]);
  const zones = [ellipse('head', head, [.20, .22]), ellipse('neck', [.46, .46], [.15, .16])];
  // Legs share a torso attachment above, but the distal paw anchors never animate.
  for (const [side, x] of [['Left', .33], ['Right', .63]] as const) {
    joints.push(joint(`leg${side}`, 'pelvis', [x, .62], .3), joint(`foot${side}`, 'root', [x, .81]));
    zones.unshift(ellipse(`leg${side}`, [x, .70], [.11, .13]));
    zones.unshift(ellipse(`foot${side}`, [x, .86], [.14, .11]));
  }
  const tailX = head[0] < .5 ? .80 : .23;
  joints.push(joint('tail', 'pelvis', [tailX, .54], 1.8, -.5), joint('tailTip', 'tail', [tailX, .34], 2.2, -1));
  zones.push({ ...ellipse('tail', [tailX, .39], [.12, .26]), distal: 'tailTip', axis: [[tailX, .65], [tailX, .22]] });
  return { anatomy: 'quadruped', joints, zones, amplitude: .48 };
}

function bird(name: string): Profile {
  const head = birds[name];
  const joints = torso(head, [.50, .64], [.50, .48]);
  joints.push(
    joint('wingLeft', 'chest', [.42, .45], 3.6), joint('wingLeftTip', 'wingLeft', [.25, .33], 2, -.7),
    joint('wingRight', 'chest', [.59, .45], -3.6), joint('wingRightTip', 'wingRight', [.77, .33], -2, -.7),
    joint('tail', 'pelvis', [.5, .66], 1.2, -.8), joint('tailTip', 'tail', [.51, .82], 1.5, -1.3),
    joint('footLeft', 'root', [.44, .76]), joint('footRight', 'root', [.59, .76]),
  );
  const zones: Zone[] = [
    ellipse('head', head, [.13, .16]),
    { ...ellipse('wingLeft', [.20, .40], [.24, .31]), distal: 'wingLeftTip', axis: [[.44, .45], [.07, .32]] },
    { ...ellipse('wingRight', [.81, .40], [.24, .31]), distal: 'wingRightTip', axis: [[.59, .45], [.94, .32]] },
    ellipse('footLeft', [.43, .80], [.075, .09]), ellipse('footRight', [.60, .80], [.075, .09]),
    { ...ellipse('tail', [.53, .82], [.16, .19]), distal: 'tailTip', axis: [[.50, .67], [.52, .95]] },
  ];
  return { anatomy: 'bird', joints, zones, amplitude: name === 'pidgey' ? .3 : .6 };
}

function humanoid(name: string): Profile {
  const head = humanoids[name];
  const joints = torso(head);
  const zones = [ellipse('head', head, [.18, .19]), ellipse('neck', [.50, .39], [.12, .13])];
  for (const [side, sign] of [['Left', -1], ['Right', 1]] as const) {
    const armX = .5 + .17 * sign, handX = .5 + .29 * sign, footX = .5 + .15 * sign;
    joints.push(joint(`arm${side}`, 'chest', [armX, .45], sign * 1.5, .4), joint(`hand${side}`, `arm${side}`, [handX, .55], sign * .8, .8),
      joint(`leg${side}`, 'pelvis', [footX, .68], sign * .25), joint(`foot${side}`, 'root', [footX, .85]));
    zones.push({ ...ellipse(`arm${side}`, [handX, .52], [.16, .18]), distal: `hand${side}`, axis: [[armX, .45], [handX, .58]] });
    zones.unshift(ellipse(`leg${side}`, [footX, .73], [.12, .11]));
    zones.unshift(ellipse(`foot${side}`, [footX, .88], [.14, .105]));
  }
  return { anatomy: 'humanoid', joints, zones, amplitude: .48 };
}

function serpent(name: string): Profile {
  // Separate center lines follow the two curved illustrations instead of using a vertical bend.
  const points: Point[] = name === 'gyarados'
    ? [[.35, .27], [.47, .42], [.55, .58], [.68, .64], [.80, .51], [.74, .31]]
    : [[.35, .27], [.48, .40], [.61, .50], [.65, .66], [.49, .75], [.28, .68]];
  const joints: Joint[] = [{ name: 'root', at: [.5, .5] }];
  points.forEach((point, i) => joints.push(joint(i === 0 ? 'head' : `spine${i}`, i === 0 ? 'root' : i === 1 ? 'head' : `spine${i - 1}`, point, i === 0 ? .7 : 1.2, -i * .55)));
  const zones = points.map((point, i) => ellipse(i === 0 ? 'head' : `spine${i}`, point, [.20, .20]));
  return { anatomy: 'serpent', joints, zones, amplitude: .5 };
}

function conservative(name: string): Profile {
  // Unusual silhouettes get a small, localized head/torso rig; no imaginary limbs.
  const heads: Record<string, Point> = { forretress: [.52, .51], giratina: [.50, .28], gloom: [.50, .48], kyogre: [.48, .39], mew: [.34, .38], ninetales: [.55, .33], oddish: [.51, .54], rotom: [.51, .47], starmie: [.50, .49], clodsire: [.43, .54] };
  const head = heads[name] ?? [.50, .32];
  return { anatomy: 'conservative', joints: torso(head), zones: [ellipse('head', head, [.16, .16])], amplitude: .22 };
}

function profileFor(path: string): Profile {
  const name = path.split(/[?#]/)[0].split('/').pop()?.replace(/\.[^.]+$/, '').toLowerCase() ?? '';
  if (name === 'charizard') return charizard();
  if (name in quadrupeds) return quadruped(name);
  if (name in birds) return bird(name);
  if (name in humanoids) return humanoid(name);
  if (name === 'gyarados' || name === 'rayquaza') return serpent(name);
  return conservative(name);
}

function polygonDistance(point: Point, polygon: readonly Point[]): number {
  let inside = false, nearest = Infinity;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[j], b = polygon[i], dx = b[0] - a[0], dy = b[1] - a[1];
    const t = clamp(((point[0] - a[0]) * dx + (point[1] - a[1]) * dy) / (dx * dx + dy * dy || 1));
    nearest = Math.min(nearest, Math.hypot(point[0] - a[0] - t * dx, point[1] - a[1] - t * dy));
    if ((a[1] > point[1]) !== (b[1] > point[1]) && point[0] < (b[0] - a[0]) * (point[1] - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
  }
  return inside ? nearest : -nearest;
}

function zoneStrength(point: Point, zone: Zone): number {
  if (zone.polygon) return smooth((polygonDistance(point, zone.polygon) + .014) / (zone.feather ?? .039));
  const center = zone.center!, radius = zone.radius!;
  const distance = Math.hypot((point[0] - center[0]) / radius[0], (point[1] - center[1]) / radius[1]);
  return smooth((1.12 - distance) / .38);
}

function influences(point: Point, profile: Profile): [string, number][] {
  if (profile.anatomy === 'serpent') {
    const nearest = profile.joints.slice(1).map(bone => ({ name: bone.name, distance: Math.hypot(point[0] - bone.at[0], point[1] - bone.at[1]) }))
      .sort((a, b) => a.distance - b.distance).slice(0, 2);
    const a = 1 / Math.max(.0001, nearest[0].distance ** 3), b = 1 / Math.max(.0001, nearest[1].distance ** 3);
    return [[nearest[0].name, a / (a + b)], [nearest[1].name, b / (a + b)]];
  }
  const torsoWeight = smooth((.72 - point[1]) / .23);
  const weights = new Map<string, number>([['pelvis', 1 - torsoWeight], ['chest', torsoWeight]]);
  // Composite overlapping feathered masks from back to front. A barely intersecting
  // high-priority zone must blend into the underlying limb, never reset it to torso.
  for (const zone of [...profile.zones].reverse()) {
    const strength = zoneStrength(point, zone);
    if (strength < .01) continue;
    let distal = 0;
    if (zone.distal && zone.axis) {
      const [a, b] = zone.axis, dx = b[0] - a[0], dy = b[1] - a[1];
      distal = smooth((((point[0] - a[0]) * dx + (point[1] - a[1]) * dy) / (dx * dx + dy * dy) - .20) / .65) * .88;
    }
    for (const [name, weight] of weights) weights.set(name, weight * (1 - strength));
    weights.set(zone.bone, (weights.get(zone.bone) ?? 0) + strength * (1 - distal));
    if (zone.distal) weights.set(zone.distal, (weights.get(zone.distal) ?? 0) + strength * distal);
  }
  const active = [...weights].filter(([, value]) => value > .00001);
  const sum = active.reduce((total, [, value]) => total + value, 0);
  return active.map(([name, value]) => [name, value / sum]);
}

function animations(profile: Profile): Record<string, { bones: Record<string, Timeline> }> {
  const idle: Record<string, Timeline> = {}, emerge: Record<string, Timeline> = {}, roar: Record<string, Timeline> = {};
  for (const bone of profile.joints) {
    const motion = bone.motion;
    if (!motion || (!motion.angle && !motion.breathe)) continue;
    const angle = (motion.angle ?? 0) * profile.amplitude;
    const phase = motion.phase ?? 0;
    const idleFrames: Frame[] = [], scaleFrames: Frame[] = [];
    for (let i = 0; i <= 32; i++) {
      const time = i / 32 * 3.2, wave = Math.sin(i / 32 * Math.PI * 2 + phase);
      idleFrames.push({ time, value: angle * wave });
      const breath = (motion.breathe ?? 0) * (wave + 1) / 2;
      scaleFrames.push({ time, x: 1 + breath * .55, y: 1 + breath });
    }
    idle[bone.name] = { rotate: idleFrames, ...(motion.breathe ? { scale: scaleFrames } : {}) };
    const sign = bone.name.includes('Right') ? -1 : 1;
    const wingAccent = bone.name.includes('Tip') ? 2 : bone.name.includes('Right') ? 3.5 : 7;
    const accent = bone.name.startsWith('wing') ? wingAccent * sign : bone.name === 'head' ? 8 : bone.name === 'neck' ? -4 : bone.name.startsWith('arm') ? 5 * sign : bone.name.startsWith('tail') ? -.7 : bone.name === 'chest' ? -1.5 : .6;
    const value = accent * profile.amplitude;
    emerge[bone.name] = { rotate: [
      { time: 0, value: -value * .55 }, { time: .24, value: -value * .8 },
      { time: .57, value }, { time: .82, value: value * .65 },
      { time: 1.10, value: -value * .15 }, { time: 1.35, value: angle * Math.sin(phase) },
    ] };
    roar[bone.name] = { rotate: [
      { time: 0, value: angle * Math.sin(phase) }, { time: .20, value: -value * .35 },
      { time: .46, value }, { time: .72, value: value * .7 }, { time: 1.10, value: angle * Math.sin(phase) },
    ] };
    if (motion.breathe) {
      emerge[bone.name].scale = [{ time: 0, x: 1, y: .99 }, { time: .55, x: 1.01, y: 1.02 }, { time: 1.35, x: 1, y: 1 }];
      roar[bone.name].scale = [{ time: 0, x: 1, y: 1 }, { time: .46, x: 1.015, y: 1.025 }, { time: 1.10, x: 1, y: 1 }];
    }
  }
  return { emerge: { bones: emerge }, roar: { bones: roar }, idle: { bones: idle } };
}

/** Pure builder, also used by runtime tests without a GPU or DOM. */
export function buildPokemonRigJson(path: string, width = POKEMON_RIG_SIZE, height = POKEMON_RIG_SIZE) {
  const profile = profileFor(path), n = profile.anatomy === 'dragon' ? 48 : 28;
  const indices = new Map(profile.joints.map((bone, index) => [bone.name, index]));
  const positions = new Map(profile.joints.map(bone => [bone.name, [(bone.at[0] - .5) * width, (.5 - bone.at[1]) * height] as Point]));
  const bones = profile.joints.map(bone => {
    const at = positions.get(bone.name)!, parentAt = bone.parent ? positions.get(bone.parent)! : [0, 0];
    return { name: bone.name, ...(bone.parent ? { parent: bone.parent } : {}), x: at[0] - parentAt[0], y: at[1] - parentAt[1] };
  });
  const uvs: number[] = [], vertices: number[] = [], triangles: number[] = [];
  for (let row = 0; row <= n; row++) for (let column = 0; column <= n; column++) {
    const u = column / n, v = row / n, x = (u - .5) * width, y = (.5 - v) * height;
    uvs.push(u, v);
    const weights = influences([u, v], profile);
    vertices.push(weights.length);
    for (const [name, weight] of weights) {
      const bind = positions.get(name)!;
      // Spine 4.2: influence count, then (bone index, local bind x, local bind y, weight).
      vertices.push(indices.get(name)!, x - bind[0], y - bind[1], weight);
    }
    if (column < n && row < n) {
      const a = row * (n + 1) + column;
      triangles.push(a, a + 1, a + n + 1, a + 1, a + n + 2, a + n + 1);
    }
  }
  return {
    skeleton: { spine: '4.2.22', width, height },
    bones,
    slots: [{ name: 'artwork', bone: 'root', attachment: 'artwork' }],
    skins: [{ name: 'default', attachments: { artwork: { artwork: { type: 'mesh', path: 'artwork', uvs, triangles, vertices, hull: 0, width, height } } } }],
    animations: animations(profile),
  };
}
