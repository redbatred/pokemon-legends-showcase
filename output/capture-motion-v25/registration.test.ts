import {readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
describe('registered anime pose meshes',()=>{
 for(const species of ['mewtwo','lugia'])it(`${species} retains valid, unfolded triangles through every frame`,()=>{
  const data=JSON.parse(readFileSync(new URL(`./assets/${species}-conversion.json`,import.meta.url),'utf8'));
  const frames=Object.values(data.skins[0].attachments.art) as {vertices:number[],triangles:number[],uvs:number[]}[];
  expect(frames).toHaveLength(16);
  for(const frame of frames){
   expect(frame.vertices.length).toBe(frame.uvs.length);
   for(let i=0;i<frame.triangles.length;i+=3){
    const [a,b,c]=frame.triangles.slice(i,i+3).map(n=>n*2),v=frame.vertices;
    const area=(v[b]-v[a])*(v[c+1]-v[a+1])-(v[b+1]-v[a+1])*(v[c]-v[a]);
    expect(area).toBeGreaterThan(0);
   }
  }
 });
});
