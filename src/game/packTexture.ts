import { Assets, Texture } from 'pixi.js';

const wrappers=new Map<string,Promise<Texture>>();

/** Clip the photographic white margin outside the wrapper, preserving white printed artwork. */
export function loadPackTexture(path:string){
  const cached=wrappers.get(path);if(cached)return cached;
  const promise=Assets.load<Texture>(path).then(texture=>{
    const canvas=document.createElement('canvas');canvas.width=texture.width;canvas.height=texture.height;
    const ctx=canvas.getContext('2d',{willReadFrequently:true})!,w=canvas.width,h=canvas.height;
    ctx.beginPath();ctx.moveTo(w*.004,h*.002);ctx.lineTo(w*.996,h*.002);
    ctx.bezierCurveTo(w*.996,h*.06,w*.976,h*.13,w*.976,h*.23);
    ctx.lineTo(w*.976,h*.84);ctx.bezierCurveTo(w*.976,h*.91,w*.996,h*.96,w*.996,h*.998);
    ctx.lineTo(w*.004,h*.998);ctx.bezierCurveTo(w*.004,h*.96,w*.024,h*.91,w*.024,h*.84);
    ctx.lineTo(w*.024,h*.23);ctx.bezierCurveTo(w*.024,h*.13,w*.004,h*.06,w*.004,h*.002);
    ctx.closePath();ctx.clip();ctx.drawImage(texture.source.resource as CanvasImageSource,0,0);
    return Texture.from(canvas);
  }).catch(error=>{wrappers.delete(path);throw error;});
  wrappers.set(path,promise);return promise;
}
