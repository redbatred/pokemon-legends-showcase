import type { PowerKind } from './powerProfiles';
import { FLOW_DURATION, FLOW_MATERIALS, flowEmitters, flowFragment, flowMesh } from './elementalFlow';
export { ELEMENTAL_KINDS } from './elementalFlow';

/** Neutral white material bands only. Every visible contour is mesh geometry. */
export const ELEMENTAL_WIN_ATLAS = `elemental-flow.png
size: 256,256
filter: Linear,Linear
pma: false
material
  bounds: 0,0,64,256
soft
  bounds: 64,0,64,256
light
  bounds: 128,0,128,128
fluid
  bounds: 128,128,128,128
`;

type MeshSample = ReturnType<typeof flowMesh>;
type Mesh = { type: 'mesh'; path: string; width: number; height: number; vertices: number[]; uvs: number[]; triangles: number[]; hull: number };
const round = (n: number) => Math.round(n * 10000) / 10000;

/** Native unweighted Spine meshes carry sampled fluid packets. No illustrated
 * silhouette, rotating rectangle, sprite, or JS graphics ticker is involved. */
export function buildElementalWinRigJson(kind: PowerKind, front = false, epic = false, low = false) {
  const slots: { name: string; bone: string; attachment: string; color: string; blend?: string }[] = [];
  const attachments: Record<string, Record<string, Mesh>> = {};
  const timelines: Record<string, { alpha: { time: number; value: number }[] }> = {};
  const deforms: Record<string, Record<string, { deform: { time: number; vertices: number[] }[] }>> = {};
  const fluid = kind === 'fire' || kind === 'water', frames = low ? 40 : fluid || kind === 'electric' ? 80 : 56, material = FLOW_MATERIALS[kind];
  const add = (name: string, layer: number, sample: (time: number) => MeshSample, fragment = false, rim = false) => {
    const base = sample(0), strength = fragment ? .82 : rim ? .20 : kind === 'water' ? [.12, .44, .56][layer] : kind === 'fire' ? [.23, .94, .76][layer] : layer === 0 ? .28 : layer === 1 ? .72 : .8;
    slots.push({ name, bone: 'root', attachment: name, color: `${material.colors[layer]}ff`, ...(layer === 2 && kind !== 'dark' ? { blend: 'additive' } : {}) });
    attachments[name] = { [name]: { type: 'mesh', path: layer === 0 || rim || fragment && (kind === 'dark' || kind === 'psychic') ? 'soft' : fluid && layer === 1 ? 'fluid' : 'material', width: 900, height: 650, vertices: base.vertices, uvs: base.uvs, triangles: base.triangles, hull: 0 } };
    const alpha: { time: number; value: number }[] = [], deform: { time: number; vertices: number[] }[] = [];
    for (let frame = 0; frame <= frames; frame++) {
      const time = frame / frames * FLOW_DURATION, current = sample(time);
      alpha.push({ time: round(time), value: round(current.alpha * strength) });
      deform.push({ time: round(time), vertices: current.vertices.map((value, index) => round(value - base.vertices[index])) });
    }
    timelines[name] = { alpha }; deforms[name] = { [name]: { deform } };
  };
  const emitters = flowEmitters(front, low, kind), packets = front || low || fluid ? 2 : 3;
  if (front && kind !== 'electric') for (const emitter of emitters) add(`rim-${emitter.index}`, 1, time => flowMesh(kind, emitter, 0, 1, time, low ? 17 : 33, true), false, true);
  // Cooler deeper material first, then the moving body and hot core.
  for (const layer of low || front ? [1, 2] : [0, 1, 2]) for (const emitter of emitters) {
    const count = kind === 'fire' && !front && layer !== 0 ? low ? 3 : 4 : packets;
    for (let packet = 0; packet < count; packet++) {
      add(`flow-${emitter.index}-${packet}-${layer}`, layer, time => flowMesh(kind, emitter, packet / count, layer, time, low ? 21 : kind === 'water' && !front ? 49 : fluid ? 33 : front ? 21 : 25));
    }
  }
  for (const emitter of emitters) for (let index = 0; index < (low ? 1 : kind === 'water' ? epic ? 4 : 3 : epic ? 3 : 2); index++) {
    add(`matter-${emitter.index}-${index}`, index % 2 ? 1 : 2, time => flowFragment(kind, emitter, index, time), true);
  }
  return {
    skeleton: { spine: '4.2.22', x: -480, y: -180, width: 960, height: 800 },
    bones: [{ name: 'root' }], slots, skins: [{ name: 'default', attachments }],
    animations: { flow: { slots: timelines, attachments: { default: deforms } } },
  };
}
