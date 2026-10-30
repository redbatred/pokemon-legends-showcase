import {afterAll,beforeAll,expect,it,vi} from 'vitest';
import {MeshPlane,Shader} from 'pixi.js';
import {StadiumDisplay} from './StadiumDisplay';
import {advanceRibbonOffset,ribbonMapping,ribbonMessages,screenTextWindow} from './stadiumDisplayGeometry';

// Node has no raster surface. Keep the real Pixi textures, meshes, shaders and
// upload events; substitute only the browser's canvas drawing context.
class TestCanvas {
 width=0;height=0;
 context={clearRect(){},fillRect(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},fill(){},arc(){},save(){},restore(){},translate(){},scale(){},fillText(){},measureText(text:string){return {width:text.length*25};},createLinearGradient(){return {addColorStop(){}};}};
 getContext(kind:string){return kind==='2d'?this.context:null;}
}
beforeAll(()=>{vi.stubGlobal('HTMLCanvasElement',TestCanvas);vi.stubGlobal('document',{createElement:()=>new TestCanvas()});});
afterAll(()=>vi.unstubAllGlobals());
const displayMeshes=(display:StadiumDisplay)=>display.root.children.flatMap(group=>group.children) as MeshPlane[];
const uniforms=(mesh:MeshPlane)=>(mesh.shader as Shader).resources.display.uniforms;

it('crosses the last ribbon tile at the same speed as every other frame',()=>{
 const before=advanceRibbonOffset(.99,.25,1,2,false);
 const after=advanceRibbonOffset(before,.25,1,2,false);
 expect(before).toBeCloseTo(.9975);
 expect(after).toBeCloseTo(.005);
 expect((after-before+1)%1).toBeCloseTo(.0075);
 expect(advanceRibbonOffset(.17,1000,1,2,false)).toBeCloseTo(.17);
});

it('keeps the scroll rate independent of frame rate and freezes its phase under reduced motion',()=>{
 const run=(fps:number)=>{let offset=.23;for(let i=0;i<fps*60;i++)offset=advanceRibbonOffset(offset,1/fps,1,3,false);return offset;};
 expect(run(30)).toBeCloseTo(.43);
 expect(run(60)).toBeCloseTo(.43);
 expect(advanceRibbonOffset(.43,60,.3,3,true)).toBe(.43);
 expect(advanceRibbonOffset(.43,-1,.3,3,false)).toBe(.43);
 expect(advanceRibbonOffset(.43,1,.5,3,false)).toBeCloseTo(.47);
});

it('puts complementary captions in the visible phone windows with one common scroll phase',()=>{
 const windows=[screenTextWindow(0,.36,.64),screenTextWindow(1,.36,.64)],span=Math.min(...windows.map(w=>w.span));
 const mappings=windows.map((window,side)=>ribbonMapping(side as 0|1,window,span,3));
 expect(mappings[0].scale).toBeCloseTo(mappings[1].scale);
 expect(windows[0].center*mappings[0].scale+mappings[0].origin).toBeCloseTo(1/6);
 expect(windows[1].center*mappings[1].scale+mappings[1].origin).toBeCloseTo(.5);
 // A caption occupies one visible bay window, even when most of the wall is cropped.
 expect(span*mappings[0].scale).toBeCloseTo(1/3);
 expect(ribbonMapping(0,{center:.5,span:1},1,2)).toEqual({scale:.5,origin:0});
 expect(ribbonMapping(1,{center:.5,span:1},1,2)).toEqual({scale:.5,origin:.5});
});

it('includes the phase instructions in the loop without showing unrevealed card details',()=>{
 const state={phase:'sealed',packName:'Obsidian Flames',index:0,cardName:'Charizard ex',cardValue:4500,special:true};
 const sealed=ribbonMessages(state);
 expect(sealed).toContainEqual(['CUT THE SEAL','OR PRESS OPEN']);
 expect(sealed).toContainEqual(['CUT THE SEAL','DRAG ACROSS THE TOP']);
 expect(sealed.filter(([title])=>title==='OBSIDIAN FLAMES')).toHaveLength(1);
 for(const phase of ['browse','sealed','tearing','awaiting','revealing','collecting','settling','complete'])expect(JSON.stringify(ribbonMessages({...state,phase}))).not.toMatch(/CHARIZARD|45\.00|SPECIAL REVEAL/);
 expect(ribbonMessages({...state,phase:'revealed',index:10})).toEqual([['CHARIZARD EX','CARD 11 / 11'],['$45.00','SPECIAL REVEAL']]);
 expect(ribbonMessages({...state,phase:'awaiting',index:3})).toContainEqual(['OBSIDIAN FLAMES','CARD 4 / 11']);
});

it('advances both curved bays without repainting the canvas or changing their geometry each frame',()=>{
 const display=new StadiumDisplay(1672,941);display.tick(0,false,false);
 const meshes=displayMeshes(display),positions=meshes.map(mesh=>Array.from(mesh.geometry.getBuffer('aPosition').data));
 let uploads=0;for(const source of new Set(meshes.map(mesh=>mesh.texture.source)))source.on('update',()=>uploads++);
 for(let frame=1;frame<=600;frame++)display.tick(frame/60,false,false);
 expect(uploads).toBe(0);
 const phases=meshes.map(mesh=>uniforms(mesh).uScroll);
 expect(phases[0]).toBeGreaterThan(0);expect(phases.every(phase=>phase===phases[0])).toBe(true);
 meshes.forEach((mesh,i)=>expect(Array.from(mesh.geometry.getBuffer('aPosition').data)).toEqual(positions[i]));
 const phase=phases[0];display.setState({phase:'sealed',packName:'Obsidian Flames',index:0});display.tick(10,false,false);
 expect(uniforms(meshes[0]).uScroll).toBe(phase);expect(uploads).toBeGreaterThan(0);
 display.destroy();expect(display.root.destroyed).toBe(true);
});

it('centers static captions under reduced motion and resumes the existing scroll without a time jump',()=>{
 const display=new StadiumDisplay(1672,941);display.setViewport(.36,.64);display.tick(0,false,false);
 for(let frame=1;frame<=60;frame++)display.tick(frame/60,false,false);
 const meshes=displayMeshes(display),phase=uniforms(meshes[0]).uScroll;
 display.tick(1,true,false);
 const staticUniforms=meshes.filter(mesh=>mesh.alpha>.5).map(uniforms);
 expect(staticUniforms.every(u=>u.uScroll===0&&u.uScale===1&&u.uOrigin===0)).toBe(true);
 let uploads=0;for(const source of new Set(meshes.map(mesh=>mesh.texture.source)))source.on('update',()=>uploads++);
 display.tick(20,true,false);expect(uploads).toBe(0);
 display.tick(20,false,false);expect(uniforms(meshes[0]).uScroll).toBe(phase);
 display.tick(20+1/60,false,false);expect(uniforms(meshes[0]).uScroll).toBeGreaterThan(phase);
 display.destroy();
});
