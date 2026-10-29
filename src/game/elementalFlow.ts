import type { PowerKind } from './powerProfiles';

export const FLOW_DURATION = 3.2;
export const ELEMENTAL_KINDS = ['fire', 'water', 'electric', 'psychic', 'leaf', 'wind', 'ice', 'dark', 'metal', 'ground', 'fairy', 'dragon'] as const satisfies readonly PowerKind[];
export type FlowEmitter = { angle: number; radius: number; height: number; phase: number; front: boolean; index: number };
type Point3 = { x: number; y: number; z: number };
type FlowMaterial = { colors: readonly [string, string, string]; width: number; height: number; curl: number; turbulence: number };

export const FLOW_MATERIALS: Record<PowerKind, FlowMaterial> = {
  fire: { colors: ['d93712', 'ff711c', 'fff1b5'], width: 77, height: 1, curl: .32, turbulence: 32 },
  water: { colors: ['12488c', '1994d5', 'dcffff'], width: 64, height: .96, curl: .22, turbulence: 7 },
  electric: { colors: ['d58d16', 'ffe13b', 'ffffde'], width: 24, height: 1.03, curl: .1, turbulence: 33 },
  psychic: { colors: ['6b35b0', 'ba79ec', 'ffdcff'], width: 65, height: .93, curl: .67, turbulence: 16 },
  leaf: { colors: ['247742', '73ce56', 'e9ffb1'], width: 58, height: .92, curl: .52, turbulence: 22 },
  wind: { colors: ['528b9d', 'b4e7da', 'f3fff6'], width: 53, height: .97, curl: .86, turbulence: 19 },
  ice: { colors: ['427da9', '8bd6ed', 'f3ffff'], width: 55, height: .9, curl: .13, turbulence: 8 },
  dark: { colors: ['221735', '6e469d', 'ba87df'], width: 82, height: 1.01, curl: -.49, turbulence: 30 },
  metal: { colors: ['4b6171', 'a8bfc7', 'eff8fa'], width: 49, height: .83, curl: .18, turbulence: 10 },
  ground: { colors: ['674532', 'af7f4c', 'e9c68c'], width: 88, height: .7, curl: .12, turbulence: 17 },
  fairy: { colors: ['b54994', 'f19dcb', 'fff0f8'], width: 64, height: .94, curl: -.62, turbulence: 13 },
  dragon: { colors: ['333b9a', '6877ed', 'b5fff0'], width: 83, height: 1.06, curl: .43, turbulence: 29 },
};

const TAU = Math.PI * 2;
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const smooth = (a: number, b: number, x: number) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const round = (n: number) => Math.round(n * 10000) / 10000;
const cycle = (time: number) => { const t = time % FLOW_DURATION; return Math.abs(t) < 1e-8 ? 0 : (t + FLOW_DURATION) % FLOW_DURATION; };

/** Fixed 3D sources follow the physical platform circumference. Positive Z is
 * nearer the viewer; front sources deliberately emit only ankle-height spill. */
export function flowEmitters(front: boolean, low = false, kind?: PowerKind): FlowEmitter[] {
  const fluid = kind === 'fire' || kind === 'water' || kind === 'electric';
  const angles = fluid ? (front ? (low ? [.26, .74] : [.16, .49, .84]) : (low ? [1.01, 1.46, 1.99] : [1.00, 1.20, 1.46, 1.76, 1.99])) : front ? (low ? [.18, .5, .82] : [.14, .32, .5, .68, .86]) : (low ? [1.01, 1.34, 1.66, 1.99] : [.99, 1.16, 1.33, 1.5, 1.67, 1.84, 2.01]);
  return angles.map((a, index) => ({ angle: a * Math.PI, radius: front ? 381 : 392 + Math.sin(a * 11) * 10, height: front ? 51 + index % 3 * 8 : kind === 'electric' ? [315, 246, 328, 268, 304][index] : fluid ? [430, 342, 407, 368, 430][index] : 398 + Math.abs(Math.cos(a * Math.PI)) * 27, phase: (index * .173 + (front ? .07 : 0)) % 1, front, index }));
}

/** A material trajectory, not a sprite transform. Fire accelerates upward and
 * entrains inward; water follows a ballistic arc and falls after its crest. */
export function flowPath(kind: PowerKind, emitter: FlowEmitter, u: number, time: number): Point3 {
  const m = FLOW_MATERIALS[kind], t = cycle(time) / FLOW_DURATION * TAU, p = emitter.phase * TAU;
  const front = emitter.front, water = kind === 'water', heavy = kind === 'ground' || kind === 'metal' || kind === 'ice';
  if (front) {
    const angle = emitter.angle + (u - .5) * 1.18 + .025 * Math.sin(t + p);
    const radius = emitter.radius + 9 * Math.sin(u * TAU - t * 2 + p);
    return { x: radius * Math.cos(angle), y: 12 + 26 * Math.sin(u * Math.PI * 2 - t + p) ** 2, z: radius * Math.sin(angle) };
  }
  const entrainment = .56 + .26 * (.5 + .5 * Math.sin(emitter.index * 1.73 + p));
  const convergence = front ? -.05 * u : water ? (.78 + .16 * Math.sin(emitter.index * 1.31) ** 2) * u : entrainment * smooth(.45, 1, u);
  const curl = front ? .12 * u : m.curl * Math.sin(Math.PI * u) + .10 * Math.sin(t + p) * u;
  const radius = emitter.radius * (1 - convergence), angle = emitter.angle + curl;
  const advected = t * 2 - u * 12 + p;
  let noise = Math.sin(advected) + .36 * Math.sin(t * 5 - u * 27 + p * 2);
  if (kind === 'electric') noise = (Math.sin(u * 45 + p) > 0 ? 1 : -1) * (.6 + .4 * Math.sin(t * 8 + p));
  const turbulence = m.turbulence * Math.sin(Math.PI * u) * (front ? .18 : 1);
  const height = Math.min(430, emitter.height * m.height * (1 + (front ? .05 : .075) * Math.sin(t + p)));
  let y = water || heavy ? height * 4 * u * (1 - u) : height * (u + .035 * Math.sin(advected) * Math.sin(Math.PI * u));
  if (front) y = emitter.height * Math.sin(Math.PI * u) * (.86 + .14 * Math.sin(t * 2 + p));
  return { x: radius * Math.cos(angle) + turbulence * noise * Math.cos(angle + Math.PI / 2), y: Math.min(430, y), z: radius * Math.sin(angle) + turbulence * noise * Math.sin(angle + Math.PI / 2) };
}

function project(point: Point3) {
  const perspective = 1 / (1 - point.z / 2200);
  return { x: point.x * perspective, y: (point.y - point.z * .33) * perspective, perspective };
}

/** A short strike is a trunk plus two forks, each its own mesh strip. Irregular
 * strikes/aftershocks replace the continuous electrical dome and never join up
 * into an arch over the actor. */
function dischargeMesh(emitter: FlowEmitter, packetPhase: number, layer: number, time: number) {
  const phase = cycle(time) / FLOW_DURATION, life = (phase + packetPhase + emitter.phase) % 1;
  const strike = smooth(.008, .026, life) * (1 - smooth(.105, .145, life));
  const aftershock = smooth(.185, .202, life) * (1 - smooth(.235, .265, life)) * .58;
  const seed = emitter.index * 2.37 + packetPhase * 13.71, side = Math.cos(emitter.angle) >= 0 ? 1 : -1;
  const height = Math.min(330, emitter.height) * (.73 + .25 * Math.sin(seed + .8) ** 2);
  const trunk: {x: number; y: number}[] = [];
  for (let i = 0; i < 9; i++) {
    const u = i / 8, zig = Math.sin(i * 3.83 + seed + phase * TAU * 4) * (emitter.front ? 5 : 16) * Math.sin(Math.PI * u);
    const angle = emitter.angle + (emitter.front ? (u - .5) * .42 : .035 * u);
    const point = project({ x: emitter.radius * Math.cos(angle) + (emitter.front ? 0 : side * 34 * u) + zig, y: emitter.front ? 14 + Math.sin(Math.PI * u) * 24 : height * u, z: emitter.radius * Math.sin(angle) });
    trunk.push(point);
  }
  const paths = [trunk];
  for (let fork = 0; fork < 2; fork++) {
    const start = trunk[fork ? 5 : 3], direction = side * (fork ? -1 : 1), branch: {x: number; y: number}[] = [];
    for (let i = 0; i < 5; i++) {
      const u = i / 4;
      branch.push({ x: start.x + direction * (emitter.front ? 26 : 61 + 19 * Math.sin(seed + fork)) * u + Math.sin(i * 4.1 + seed) * Math.sin(Math.PI * u) * 8,
        y: start.y + (emitter.front ? 13 : 56 + 19 * Math.cos(seed + fork)) * u + Math.sin(i * 3.3 + phase * TAU * 4) * Math.sin(Math.PI * u) * 8 });
    }
    paths.push(branch);
  }
  const vertices: number[] = [], uvs: number[] = [], triangles: number[] = [];
  paths.forEach((path, branch) => {
    const offset = vertices.length / 2;
    path.forEach((point, row) => {
      const a = path[Math.max(0, row - 1)], b = path[Math.min(path.length - 1, row + 1)];
      const dx = b.x - a.x, dy = b.y - a.y, length = Math.max(.001, Math.hypot(dx, dy));
      const q = row / (path.length - 1), radius = [14, 4.5, 1.4][layer] * (branch ? .68 : 1) * (emitter.front ? .68 : 1) * (.50 + .50 * Math.sin(Math.PI * q)) * (q === 1 ? .05 : 1);
      for (let column = 0; column < 3; column++) {
        const across = column - 1;
        vertices.push(round(point.x - dy / length * radius * across), round(point.y + dx / length * radius * across)); uvs.push(column / 2, 1 - q);
        if (row < path.length - 1 && column < 2) {
          const index = offset + row * 3 + column;
          triangles.push(index, index + 1, index + 3, index + 1, index + 4, index + 3);
        }
      }
    });
  });
  return {vertices, uvs, triangles, alpha: round(Math.max(strike, aftershock))};
}

/** A moving packet occupies only part of a streamline. Its boundaries, width,
 * necks, curled tip and hot core evolve while the next staggered packet is born.
 * Only neutral material UVs are used. */
export function flowMesh(kind: PowerKind, emitter: FlowEmitter, packetPhase: number, layer: number, time: number, rows = 15, continuous = false) {
  if (kind === 'electric') return dischargeMesh(emitter, packetPhase, layer, time);
  const m = FLOW_MATERIALS[kind], t = cycle(time), phase = t / FLOW_DURATION;
  const life = (phase + packetPhase + emitter.phase) % 1;
  const water = kind === 'water', fire = kind === 'fire', fluid = water || fire, angular = ['ice', 'metal', 'ground', 'electric'].includes(kind);
  const fireTongue = fire && !emitter.front;
  const travel = water ? 1.57 : fireTongue ? 1.48 : 1.78;
  const length = emitter.front ? .98 : fireTongue ? layer === 0 ? .72 : .44 : water ? .98 : .83;
  const head = life * travel, tail = head - length;
  const start = continuous ? 0 : clamp(fireTongue && layer === 2 ? head - .35 : tail);
  const end = continuous ? 1 : clamp(head - (layer === 2 ? fireTongue ? .14 : fire ? .12 : .045 : layer === 1 ? .012 : 0));
  const alpha = continuous ? 1 : smooth(.015, .09, life) * (1 - smooth(.86, .985, life)) * smooth(0, .06, end - start);
  const vertices: number[] = [], uvs: number[] = [], triangles: number[] = [];
  const pathEmitter = fluid && !emitter.front ? { ...emitter, height: emitter.height * (.91 + .09 * Math.sin(packetPhase * 17 + emitter.index * 2.13)), angle: emitter.angle + .06 * Math.sin(packetPhase * 11 + emitter.index) } : emitter;
  const pathTime = t + (fire && !emitter.front ? packetPhase * .53 : 0);
  for (let row = 0; row < rows; row++) {
    const q = row / (rows - 1), u = start + (end - start) * q;
    const bodyQ = clamp((u - (head - .44)) / .44);
    const p = project(flowPath(kind, pathEmitter, u, pathTime));
    const before = project(flowPath(kind, pathEmitter, Math.max(0, u - .003), pathTime));
    const after = project(flowPath(kind, pathEmitter, Math.min(1, u + .003), pathTime));
    const dx = after.x - before.x, dy = after.y - before.y, d = Math.max(.001, Math.hypot(dx, dy));
    const nx = -dy / d, ny = dx / d;
    const wave = phase * TAU * 3 - u * 15 + emitter.phase * TAU;
    const envelope = continuous ? .78 + .22 * Math.sin(q * Math.PI) : Math.pow(Math.max(0, Math.sin(q * Math.PI)), angular ? .75 : .62);
    const flowWidth = water ? .67 + .64 * Math.sin(Math.PI * u) ** 2 : (.55 + .58 * Math.sin(Math.PI * u)) * Math.pow(1.04 - u, .36);
    const baseWidth = m.width * (emitter.front ? .29 : 1) * flowWidth * envelope * p.perspective;
    let width = baseWidth * (fire ? [1.30, .75, fireTongue ? .23 : .065] : water ? [1.12, .82, .045] : [1.16, .80, .22])[layer];
    width *= 1 + (fire ? .30 : water ? .08 : .23) * Math.sin(wave) + (fire ? .15 : water ? .035 : .12) * Math.sin(phase * TAU * 5 - u * 31 + emitter.index);
    if (fireTongue && layer !== 0) {
      const neck = .48 + .17 * Math.sin(phase * TAU * 2 + packetPhase * 8 + emitter.index);
      width *= (1 - .60 * Math.exp(-(((bodyQ - neck) / .10) ** 2))) * (.74 + .26 * Math.sin(packetPhase * 13 + emitter.index * 1.7) ** 2);
    }
    if (water && layer === 2) width *= smooth(.18, .36, u) * (1 - smooth(.70, .96, u));
    if (kind === 'fairy' || kind === 'psychic') width *= .75 + .25 * Math.sin(u * 22 - phase * TAU * 2) ** 2;
    if (kind === 'leaf') width *= .55 + .45 * Math.abs(Math.sin(q * Math.PI * 2));
    const offset = layer === 2 ? water ? baseWidth * .68 : width * .26 * Math.sin(wave + .7) : 0;
    const tipCurl = fireTongue && layer !== 0 ? 28 * smooth(.38, .9, bodyQ) * Math.sin(bodyQ * Math.PI * 2.3 + phase * TAU + emitter.index) * Math.sin(life * Math.PI) : 0;
    for (let column = 0; column < 3; column++) {
      const across = column - 1;
      const scallop = fire ? .19 * Math.sin(u * 29 - phase * TAU * 4 + across * 1.4) + .08 * Math.sin(u * 51 - phase * TAU * 6 + across) : 0;
      const asymmetric = 1 + across * (water ? .055 : .16) * Math.sin(wave + q * 8) + scallop;
      const edgeSlip = across === 0 ? 0 : width * (water ? .025 : .07) * Math.sin(wave * 2 + across);
      vertices.push(round(p.x + nx * (across * width * asymmetric + offset + tipCurl) + dx / d * edgeSlip), round(p.y + ny * (across * width * asymmetric + offset + tipCurl) + dy / d * edgeSlip));
      uvs.push(column / 2, 1 - q);
      if (row < rows - 1 && column < 2) {
        const index = row * 3 + column;
        triangles.push(index, index + 1, index + 3, index + 1, index + 4, index + 3);
      }
    }
  }
  return { vertices, uvs, triangles, alpha: round(alpha) };
}

/** Detached matter follows buoyancy for fire, gravity for droplets/debris. */
export function flowFragment(kind: PowerKind, emitter: FlowEmitter, index: number, time: number) {
  const t = cycle(time), phase = t / FLOW_DURATION, life = (phase + emitter.phase + index * .347) % 1;
  const water = kind === 'water', heavy = ['ground', 'metal', 'ice', 'leaf'].includes(kind);
  const origin = flowPath(kind, emitter, emitter.front ? .46 : water ? .48 : .73, t);
  const side = Math.cos(emitter.angle) >= 0 ? 1 : -1;
  const x = origin.x + side * life * (water ? 106 : 52) + Math.sin(life * 5 + index) * life * 16;
  const y = origin.y + (emitter.front ? 30 : water ? 115 : 126) * life - (water || heavy ? 245 : 34) * life * life;
  const p = project({ x, y, z: origin.z + life * 45 });
  const radius = (water ? 5.4 : heavy ? 9 : 5.2) * Math.sin(life * Math.PI) ** .6 * p.perspective;
  const elongation = water ? index % 3 === 0 ? 1 : 1.15 + life * 1.4 : kind === 'leaf' ? 2.8 : kind === 'ice' ? 2.1 : kind === 'dark' ? 2.7 : heavy ? 1.2 : 2.5 - life;
  const shapes: Partial<Record<PowerKind, [number, number][]>> = {
    leaf: [[0,-1],[.65,-.54],[.85,0],[.50,.55],[0,1],[-.50,.55],[-.85,0],[-.65,-.54]],
    ice: [[0,-1],[.43,-.65],[.76,.38],[0,1],[-.66,.43],[-.35,-.67]],
    ground: [[-.5,-1],[.61,-.85],[1,-.1],[.65,.83],[-.18,1],[-.9,.48],[-1,-.4]],
    metal: [[0,-1],[.83,-.50],[.83,.5],[0,1],[-.83,.5],[-.83,-.5]],
    electric: [[0,-1],[.26,-.22],[.67,-.08],[.18,.22],[0,1],[-.20,.18],[-.62,-.04],[-.24,-.25]],
    fairy: [[0,-1],[.23,-.28],[1,0],[.25,.25],[0,1],[-.25,.25],[-1,0],[-.23,-.28]],
    wind: [[0,-1],[.45,-.43],[.52,.18],[0,1],[-.25,.4],[-.54,-.24]],
  };
  const contour = shapes[kind] ?? Array.from({length: 12}, (_, i): [number, number] => {
    const angle = i / 12 * TAU, variation = kind === 'dark' ? .79 + .21 * Math.sin(angle * 3 + phase * TAU * 2) : 1;
    return [Math.cos(angle) * variation, Math.sin(angle)];
  });
  const spin = kind === 'leaf' || heavy || kind === 'electric' || kind === 'wind' ? life * TAU * (kind === 'leaf' ? 1.7 : .7) + emitter.phase * TAU + index : 0;
  const c = Math.cos(spin), s = Math.sin(spin), vertices: number[] = [round(p.x), round(p.y)], uvs: number[] = [.5, .5], triangles: number[] = [];
  contour.forEach(([xx, yy], i) => {
    const dx = xx * radius, dy = yy * radius * elongation;
    vertices.push(round(p.x + dx * c - dy * s), round(p.y + dx * s + dy * c));
    uvs.push(.5 + xx * .5, .5 - yy * .5);
    triangles.push(0, i + 1, (i + 1) % contour.length + 1);
  });
  return { vertices, uvs, triangles, alpha: round(smooth(.03, .13, life) * (1 - smooth(.72, .98, life))) };
}
