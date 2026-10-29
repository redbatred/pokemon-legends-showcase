import { describe, expect, it } from 'vitest';
import { flowEmitters, flowMesh, flowPath, flowFragment, FLOW_DURATION, ELEMENTAL_KINDS } from './elementalFlow';

describe('stage anchored elemental flow', () => {
  it('keeps its front spill below the card and its rear sources on the stage perimeter', () => {
    for (const emitter of flowEmitters(false)) {
      const point = flowPath('fire', emitter, 0, 0);
      expect(Math.hypot(point.x, point.z)).toBeGreaterThan(340);
      expect(Math.hypot(point.x, point.z)).toBeLessThan(440);
    }
    for (const emitter of flowEmitters(true)) for (let t = 0; t < FLOW_DURATION; t += .4) {
      const mesh = flowMesh('fire', emitter, 0, 1, t);
      const ys = mesh.vertices.filter((_, i) => i % 2 === 1);
      expect(Math.max(...ys)).toBeLessThan(90);
    }
  });
  it('advects whole fire lobes upward, changing both edges instead of rotating a fixed silhouette', () => {
    const emitter = flowEmitters(false)[0];
    const a = flowMesh('fire', emitter, .15, 1, .1), b = flowMesh('fire', emitter, .15, 1, .55);
    expect(a.vertices).not.toEqual(b.vertices);
    const width = (vertices: number[], row: number) => Math.hypot(vertices[row * 6 + 4] - vertices[row * 6], vertices[row * 6 + 5] - vertices[row * 6 + 1]);
    expect(Math.max(...Array.from({length: 15}, (_, row) => Math.abs(width(a.vertices, row) - width(b.vertices, row))))).toBeGreaterThan(8);
  });
  it('makes water rise and fall under gravity while fire remains buoyant', () => {
    const emitter = flowEmitters(false)[0];
    expect(flowPath('water', emitter, .5, .4).y).toBeGreaterThan(400);
    expect(flowPath('water', emitter, .9, .4).y).toBeLessThan(flowPath('water', emitter, .5, .4).y - 200);
    expect(flowPath('fire', emitter, .9, .4).y).toBeGreaterThan(flowPath('fire', emitter, .5, .4).y + 100);
  });
  it('joins the loop exactly and reduces emitter count on low quality', () => {
    for (const emitter of flowEmitters(false)) {
      const first = flowMesh('fire', emitter, .21, 1, 0), last = flowMesh('fire', emitter, .21, 1, FLOW_DURATION);
      expect(last).toEqual(first);
    }
    expect(flowEmitters(false, true).length).toBeLessThanOrEqual(4);
    expect(flowEmitters(true, true).length).toBeLessThanOrEqual(3);
  });
  it('keeps water specular highlights much narrower than the translucent body', () => {
    const kind = 'water';
    const emitter = flowEmitters(false)[1];
    const body = flowMesh(kind, emitter, .15, 1, .55, 49), core = flowMesh(kind, emitter, .15, 2, .55, 49);
    const widest = (vertices: number[]) => Math.max(...Array.from({ length: 49 }, (_, row) => Math.hypot(vertices[row * 6 + 4] - vertices[row * 6], vertices[row * 6 + 5] - vertices[row * 6 + 1])));
    expect(widest(core.vertices)).toBeLessThan(widest(body.vertices) * .22);
  });
  it('concentrates fire brightness into small hot pockets instead of a full-length core ribbon', () => {
    const emitter = flowEmitters(false, false, 'fire')[1];
    const body = flowMesh('fire', emitter, .15, 1, .55, 33), core = flowMesh('fire', emitter, .15, 2, .55, 33);
    const area = (mesh: typeof body) => {
      let result = 0;
      for (let i = 0; i < mesh.triangles.length; i += 3) {
        const [a,b,c] = mesh.triangles.slice(i,i+3).map(n => n*2), v = mesh.vertices;
        result += Math.abs((v[b]-v[a])*(v[c+1]-v[a+1])-(v[c]-v[a])*(v[b+1]-v[a+1]))/2;
      }
      return result;
    };
    expect(area(core)).toBeGreaterThan(80);
    expect(area(core)).toBeLessThan(area(body) * .24);
  });
  it('rolls foreground flow along the rim instead of launching isolated upright diamonds', () => {
    const emitter = flowEmitters(true)[2];
    const a = flowPath('fire', emitter, 0, .4), b = flowPath('fire', emitter, 1, .4);
    expect(Math.hypot(b.x - a.x, b.z - a.z)).toBeGreaterThan(300);
    for (let u = 0; u <= 1; u += .1) expect(flowPath('fire', emitter, u, .4).y).toBeLessThan(55);
  });
  it('tumbles recognizably long leaf matter instead of generic round particles', () => {
    const emitter = flowEmitters(false)[1], ratios: number[] = [];
    for (let time = .15; time < 2.8; time += .12) {
      const { vertices } = flowFragment('leaf', emitter, 0, time);
      const xs = vertices.filter((_, n) => n % 2 === 0), ys = vertices.filter((_, n) => n % 2 === 1);
      const width = Math.max(...xs) - Math.min(...xs), height = Math.max(...ys) - Math.min(...ys);
      ratios.push(Math.max(width / height, height / width));
    }
    expect(Math.max(...ratios)).toBeGreaterThan(2.1);
    expect(Math.min(...ratios)).toBeLessThan(1.2);
  });
  it('caps the physical rise of every element below the header region', () => {
    for (const kind of ELEMENTAL_KINDS) for (const emitter of flowEmitters(false, false, kind)) for (const time of [0,.6,1.3,2.2]) {
      for (const u of [.4,.5,.8,1]) expect(flowPath(kind, emitter, u, time).y).toBeLessThanOrEqual(430);
    }
  });
  it('builds electrical strikes from separate forks rather than one continuous arch', () => {
    const mesh = flowMesh('electric', flowEmitters(false, false, 'electric')[0], 0, 1, .25);
    const parent = Array.from({length: mesh.vertices.length / 2}, (_, i) => i);
    const root = (n: number): number => parent[n] === n ? n : root(parent[n]);
    for (let i = 0; i < mesh.triangles.length; i += 3) {
      const [a,b,c] = mesh.triangles.slice(i,i+3);
      parent[root(b)] = root(a); parent[root(c)] = root(a);
    }
    expect(new Set(parent.map((_, i) => root(i))).size).toBeGreaterThanOrEqual(3);
    const ys = mesh.vertices.filter((_, i) => i % 2 === 1);
    expect(Math.max(...ys)).toBeLessThan(430);
  });
});
