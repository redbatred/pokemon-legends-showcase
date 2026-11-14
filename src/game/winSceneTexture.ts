import {Texture,type TextureSource} from 'pixi.js';
/** The cinema canvas changes from its initial size to the current viewport. */
export function winSceneTexture(source:TextureSource){return new Texture({source,dynamic:true});}
