import {Assets,Container,Sprite,Texture} from 'pixi.js';
import type {PowerProfile} from './powerProfiles';
import type {ProjectedEmitter} from './moveRig';
import {createPokemonModel,disposePokemonRenderer,type PokemonModel} from './PokemonModel';
export {disposePokemonRenderer};
/** A real skeletal model rendered into the 2.5D scene. Unavailable models use intact art. */
export class PokemonActor extends Container {
 private portrait:Sprite;private model:PokemonModel|null;private preferredSpan:number;
 static async create(path:string,low:boolean){
  let model:PokemonModel|null=null;try{model=await createPokemonModel(path,low);}catch(error){console.warn('Animated model unavailable',error);}
  const texture=model?.texture??await Assets.load<Texture>(path);return new PokemonActor(texture,model,path);
 }
 private constructor(texture:Texture,model:PokemonModel|null,path:string){super();this.model=model;this.portrait=new Sprite(texture);this.portrait.anchor.set(.5);const span=model?(path.endsWith('/mewtwo.png')?560:430):310;this.preferredSpan=span;const ratio=texture.width/texture.height;this.portrait.width=ratio>=1?span:span*ratio;this.portrait.height=ratio>=1?span/ratio:span;if(model){this.portrait.y=154-model.groundY*this.portrait.height/2;this.portrait.x=-model.horizontalAnchor*this.portrait.width/2;}this.addChild(this.portrait);}
 fitPresentation(halfWidth:number){if(!this.model)return;const span=Math.min(this.preferredSpan,Math.max(160,halfWidth-30)/(.5+Math.abs(this.model.horizontalAnchor)*.5));this.portrait.width=this.portrait.height=span;this.portrait.x=-this.model.horizontalAnchor*span/2;this.portrait.y=154-this.model.groundY*span/2;}
 get entranceDuration(){return this.model?.entranceDuration??.68;}
 get attackDuration(){return this.model?.attackDuration??.9;}
 get recoveryDuration(){return this.model?.recoveryDuration??.35;}
 get chargeDuration(){return this.model?.chargeDuration??.65;}
 play(cue:'emerge'|'idle'|'charge'|'attack'|'recover'){this.model?.play(cue);}
 capturePose(){this.model?.capturePose();}
 setEntranceTime(seconds:number){this.model?.setEntranceTime(seconds);}
 setAttackTime(seconds:number){this.model?.setAttackTime(seconds);}
 update(dt:number){this.model?.update(dt);}
 powerEmitters(profile:PowerProfile):ProjectedEmitter[]{
  if(this.model)return this.model.emitters(profile).map(p=>({...p,x:this.portrait.x+p.x*this.portrait.width/2,y:this.portrait.y+p.y*this.portrait.height/2}));
  const p=profile.origin??[.5,.3];return [{x:(p[0]-.5)*this.portrait.width,y:(p[1]-.5)*this.portrait.height,dx:Math.cos(profile.direction),dy:Math.sin(profile.direction)}];
 }
 override destroy(){this.model?.dispose();this.model=null;super.destroy({children:true});}
}
