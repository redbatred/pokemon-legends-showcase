import {afterEach,expect,it,vi} from 'vitest';
import {Container,Texture} from 'pixi.js';
import {gsap} from 'gsap';
import {OpeningStage} from './Stage';
import {RevealPreparation} from './revealPreparation';
import {RevealCompletion} from './revealCompletion';
import {energy} from './model';
vi.mock('./audio',()=>({playSound:vi.fn(),stopRevealAudio:vi.fn()}));

const flush=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};
function setup(){
 vi.stubGlobal('document',{hidden:false});
 const card={...energy,id:'special',image:'/special.png',rarity:'Special Illustration Rare',value:450000};
 let finishLoad!:(value:any)=>void;
 const prepared=new RevealPreparation(Promise.resolve(Texture.WHITE),()=>new Promise<any>(resolve=>finishLoad=resolve));
 // Keep the actual stage, mesh, preparation ownership and GSAP sequencing. Only external rendering / sound are stubbed.
 const stage=Object.assign(Object.create(OpeningStage.prototype),{
  options:{reduced:false,turbo:false,low:true},revealCompletion:new RevealCompletion(),revealToken:0,cardHoverReady:false,
  destroyed:false,blocked:false,resetPointer:vi.fn(),detachCard:()=>null,draw:vi.fn(),project:vi.fn(),
  prepared:new Map(),prepareReveal:()=>prepared,loadingReveal:null,cardColors:new Map([[card.image,0xff8833]]),lastProjection:new WeakMap(),
  scene:{endCelebration:vi.fn(),beginReveal:vi.fn(),setCharge:vi.fn(),setCinematic:vi.fn(),setCardColor:vi.fn(),impact:vi.fn()},
  revealEffects:{clear:vi.fn(),charge:vi.fn(),fire:vi.fn()},foil:{resources:{foil:{uniforms:{}}}},
  pack:new Container(),packShadow:new Container(),stack:new Container(),cardLayer:new Container(),cardEdge:new Container(),world:new Container(),
  app:{screen:{width:1280,height:780}},back:Texture.EMPTY,motion:{},cardMesh:null,openingCard:null,timeline:null,
  tweens:new Set(),previousTease:false,
 });
 let ballStarted=false;
 const special={root:new Container(),fitPresentation:vi.fn(),setFloor:vi.fn(),setCardFoil:vi.fn(),finish:vi.fn(),destroy:vi.fn(),
  play:(timeline:gsap.core.Timeline,_sky:number,impact:()=>void)=>{ballStarted=true;timeline.call(impact,[],1.12).to({}, {duration:2},0);}};
 return {stage,card,prepared,special,finishLoad:(value=special)=>finishLoad(value),ballStarted:()=>ballStarted};
}
afterEach(()=>{gsap.globalTimeline.clear();vi.unstubAllGlobals();});

it('keeps a special face down while its actor is delayed, then launches the ball on the flip completion frame',async()=>{
 const {stage,card,finishLoad,ballStarted}=setup();const done=stage.reveal(card,true,0,'/pokemon.png',1000);
 await flush();stage.timeline.progress(1);await flush();
 expect(stage.cardMesh.texture).toBe(Texture.EMPTY);expect(ballStarted()).toBe(false);expect(stage.skipReveal()).toBe(false);
 finishLoad();await flush();stage.timeline.time(1.22);await flush();
 expect(stage.cardMesh.texture).toBe(Texture.WHITE);expect(ballStarted()).toBe(true);
 stage.timeline.time(1.13);expect(stage.skipReveal()).toBe(true);await done;
});

it('does not reveal a loaded special behind a modal',async()=>{
 const {stage,card,finishLoad,ballStarted}=setup();const done=stage.reveal(card,true,0,'/pokemon.png',1000);
 await flush();stage.timeline.progress(1);await flush();stage.blocked=true;finishLoad();await flush();
 expect(stage.cardMesh.texture).toBe(Texture.EMPTY);expect(ballStarted()).toBe(false);expect(stage.timeline.paused()).toBe(true);
 stage.blocked=false;stage.timeline.resume().progress(1);await flush();stage.timeline.progress(1);await flush();
 expect(ballStarted()).toBe(true);stage.timeline.progress(1);await done;
});

it('releases a late actor if a loading reveal is cancelled before the flip',async()=>{
 const {stage,card,prepared,special,finishLoad,ballStarted}=setup();const done=stage.reveal(card,true,0,'/pokemon.png',1000);
 await flush();stage.timeline.progress(1);await flush();stage.revealToken++;prepared.cancel();finishLoad();await done;
 expect(special.destroy).toHaveBeenCalledOnce();expect(ballStarted()).toBe(false);expect(stage.cardMesh.texture).toBe(Texture.EMPTY);
});

it.each(['turbo','reduced'])('keeps the readiness barrier in %s mode and settles the loaded Pokémon immediately',async option=>{
 const {stage,card,finishLoad,special,ballStarted}=setup();stage.options[option]=true;stage.onSpecialWin=vi.fn();
 const done=stage.reveal(card,true,0,'/pokemon.png',1000);await flush();stage.timeline.progress(1);await flush();
 expect(stage.cardMesh.texture).toBe(Texture.EMPTY);expect(stage.onSpecialWin).not.toHaveBeenCalled();
 finishLoad();await flush();stage.timeline.progress(1);await done;
 expect(stage.cardMesh.texture).toBe(Texture.WHITE);expect(special.finish).toHaveBeenCalledOnce();expect(ballStarted()).toBe(false);
 expect(stage.onSpecialWin).toHaveBeenCalledWith(card,true);
});

it('still reveals and awards the card when its optional Pokémon cannot load',async()=>{
 const {stage,card,finishLoad,ballStarted}=setup();stage.onSpecialWin=vi.fn();
 const done=stage.reveal(card,true,0,'/pokemon.png',1000);await flush();stage.timeline.progress(1);finishLoad(null as any);await flush();stage.timeline.progress(1);await done;
 expect(stage.cardMesh.texture).toBe(Texture.WHITE);expect(ballStarted()).toBe(false);expect(stage.onSpecialWin).toHaveBeenCalledWith(card);
 expect(stage.scene.setCharge).toHaveBeenLastCalledWith(null);expect(stage.scene.setCinematic).toHaveBeenLastCalledWith(false,false);
});
