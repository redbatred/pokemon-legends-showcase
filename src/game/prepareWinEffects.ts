import {Container,type Renderer,type Texture} from 'pixi.js';
import {Spine,type SpineTexture,type RegionAttachment,type MeshAttachment} from '@esotericsoftware/spine-pixi-v8';
import {juiceTextures} from './WinJuice';
/** Spine attachments are not ordinary child sprites, so prepare.upload(root) misses their atlases. */
export function spineTextures(root:Container){
 const textures=new Set<Texture>();
 const visit=(node:Container)=>{if(node instanceof Spine)for(const skin of node.skeleton.data.skins)for(const entry of skin.getAttachments()){
  const region=(entry.attachment as RegionAttachment|MeshAttachment).region,texture=(region?.texture as SpineTexture|undefined)?.texture;if(texture)textures.add(texture);
 }for(const child of node.children)visit(child);};visit(root);return [...textures];
}
const warmed=new WeakMap<Renderer,Promise<void>>();
/** Upload the shared light shapes during preparation, not on their first visible hit. */
export function prepareWinEffects(renderer:Renderer,_image:string,_low:boolean,_w:number,_h:number,alive:()=>boolean){
 let pending=warmed.get(renderer);if(pending)return pending;
 pending=(async()=>{if(!alive())return;const t=juiceTextures();await renderer.prepare.upload([t.dot,t.streak,t.ring,t.star,t.rays,...t.coins]);})();
 warmed.set(renderer,pending);pending.catch(()=>warmed.delete(renderer));return pending;
}
