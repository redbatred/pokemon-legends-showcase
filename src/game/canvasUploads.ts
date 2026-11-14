import {DOMAdapter} from 'pixi.js';

let installed=false;
/** Canvases that are drawn with the 2D API and then uploaded as textures (every text label, the stadium board, generated
 * glows) are kept in ordinary memory. A GPU-backed 2D canvas has to be synchronised across contexts every time it is
 * uploaded: measured on an M3 Pro, twelve small label canvases uploaded in one frame held the GPU for 100-160 ms, against a
 * frame budget of 8-16. That was the hitch on every card reveal, when the screen's labels are rebuilt. The drawing is the
 * same; only where its pixels live changes. This makes it the default for every canvas Pixi creates. */
export function keepTextCanvasesInMemory(){
 if(installed||typeof document==='undefined')return;installed=true;
 const adapter=DOMAdapter.get();
 DOMAdapter.set({...adapter,createCanvas:(width?:number,height?:number)=>{
  const canvas=adapter.createCanvas(width,height) as HTMLCanvasElement,original=canvas.getContext.bind(canvas) as (type:string,options?:unknown)=>unknown;
  (canvas as unknown as {getContext:(type:string,options?:object)=>unknown}).getContext=(type,options)=>original(type,type==='2d'?{willReadFrequently:true,...options}:options);
  return canvas;
 }});
}
/** A 2D context for a canvas the game paints itself and uploads as a texture; see `keepTextCanvasesInMemory`. */
export const textureContext=(canvas:HTMLCanvasElement)=>canvas.getContext('2d',{willReadFrequently:true})!;
