import {Assets,Container,Point,Sprite,Texture} from 'pixi.js';
import type {PowerProfile} from './powerProfiles';
import {createPokemonModel,disposePokemonRenderer,type PokemonModel} from './PokemonModel';
export {disposePokemonRenderer};
/** A real skeletal model rendered into the 2.5D scene. Unavailable models use intact art. */
export class PokemonActor extends Container {
 private portrait:Sprite;private model:PokemonModel|null;private point=new Point();
 static async create(path:string,low:boolean){
  let model:PokemonModel|null=null;try{model=await createPokemonModel(path,low);}catch(error){console.warn('Animated model unavailable',error);}
  const texture=model?.texture??await Assets.load<Texture>(path);return new PokemonActor(texture,model);
 }
 private constructor(texture:Texture,model:PokemonModel|null){super();this.model=model;this.portrait=new Sprite(texture);this.portrait.anchor.set(.5);const span=model?390:310;const ratio=texture.width/texture.height;this.portrait.width=ratio>=1?span:span*ratio;this.portrait.height=ratio>=1?span/ratio:span;this.addChild(this.portrait);}
 get chargeDuration(){return this.model?.chargeDuration??.65;}
 play(cue:'emerge'|'idle'|'charge'|'attack'|'recover'){this.model?.play(cue);}
 update(dt:number){this.model?.update(dt);}
 powerOrigin(profile:PowerProfile){
  if(this.model){const p=this.model.origin(profile);return this.point.set(p.x*this.portrait.width/2,p.y*this.portrait.height/2);}
  const p=profile.origin??[.5,.3];return this.point.set((p[0]-.5)*this.portrait.width,(p[1]-.5)*this.portrait.height);
 }
 override destroy(){this.model?.dispose();this.model=null;super.destroy({children:true});}
}
