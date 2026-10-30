import {afterEach,expect,it,vi} from 'vitest';
import {Assets,Container,Texture} from 'pixi.js';
import gsap from 'gsap';
const boards=vi.hoisted(()=>[] as any[]);
vi.mock('./audio',()=>({playSound:vi.fn(),stopRevealAudio:vi.fn()}));
vi.mock('./PackReveal',()=>({PackReveal:class{
 root=new Container();items:any[];time=0;destroy=vi.fn(()=>this.root.destroy({children:true}));
 constructor(cards:any[]){this.items=cards.map(()=>({flight:new Container()}));for(const i of this.items)this.root.addChild(i.flight);boards.push(this);}
 render(time:number){this.time=time;for(const i of this.items)if(!i.taken){i.flight.position.set(300,300);i.flight.scale.set(.4);}}
 takeFlight(i:number){this.items[i].taken=true;this.items[i].flight.removeFromParent();return this.items[i].flight;}
}}));
import {OpeningStage} from './Stage';
import {energy} from './model';
import {PACK_REVEAL} from './packRevealMotion';
const flush=async()=>{for(let i=0;i<16;i++)await Promise.resolve();};
function setup(){
 vi.stubGlobal('document',{hidden:false});vi.spyOn(Assets,'load').mockImplementation(async()=>Texture.WHITE as any);
 const cards=Array.from({length:11},(_,i)=>({...energy,id:'card-'+i,value:25,rarity:'Common'}));
 const stage=Object.assign(Object.create(OpeningStage.prototype),{options:{low:true,turbo:false,reduced:false},automatic:true,revealToken:0,destroyed:false,blocked:false,
  discardPrepared:vi.fn(),detachCard:()=>null,stack:new Container(),cardLayer:new Container(),world:new Container(),flightLayer:new Container(),
  app:{screen:{width:1280,height:780},renderer:{prepare:{upload:vi.fn(async()=>{})}}},onCardStored:vi.fn(),onCollectFocus:vi.fn(),
  scene:{beginReveal:vi.fn(),setCinematic:vi.fn(),setCardColor:vi.fn(),setCharge:vi.fn(),impact:vi.fn()},revealEffects:{fire:vi.fn()},back:Texture.EMPTY});
 return {stage,cards};
}
afterEach(()=>{gsap.globalTimeline.clear();boards.length=0;vi.restoreAllMocks();vi.unstubAllGlobals();});
it('holds the complete face-up formation before storing any card, then stores each exactly once',async()=>{
 const {stage,cards}=setup();let finished=false;const done=stage.collectRemaining(cards,0,true).then(()=>finished=true);await flush();
 expect(boards).toHaveLength(1);expect(stage.onCardStored).not.toHaveBeenCalled();
 expect(stage.app.renderer.prepare.upload).toHaveBeenCalledWith([boards[0].root,...cards.map(()=>Texture.WHITE)]);
 stage.timeline.time(PACK_REVEAL.depart-.01);await flush();expect(finished).toBe(false);expect(stage.onCardStored).not.toHaveBeenCalled();
 stage.timeline.progress(1);await done;expect(stage.onCardStored.mock.calls.map((x:any[])=>x[0])).toEqual(Array.from({length:11},(_,i)=>i));expect(boards[0].destroy).toHaveBeenCalledOnce();expect(stage.packReveal).toBeNull();
});
it('flies the current face-up card to the tray while only unopened cards join the formation',async()=>{
 const {stage,cards}=setup(),current=new Container();stage.automatic=false;stage.cardMesh={};stage.detachCard=vi.fn(()=>current);stage.flightLayer.addChild(current);
 const done=stage.collectRemaining(cards,2,true);await flush();expect(boards[0].items).toHaveLength(8);expect(current.destroyed).toBe(false);
 stage.timeline.time(.65);expect(stage.onCardStored.mock.calls.map((x:any[])=>x[0])).toEqual([2]);
 stage.timeline.progress(1);await done;expect(stage.onCardStored.mock.calls.map((x:any[])=>x[0])).toEqual([2,3,4,5,6,7,8,9,10]);
});
it.each(['turbo','reduced'])('uses the existing quick collection path for %s',async option=>{
 const {stage,cards}=setup();stage.options[option]=true;const done=stage.collectRemaining(cards,0,true);await flush();expect(boards).toHaveLength(0);stage.timeline.progress(1);await done;expect(stage.onCardStored).toHaveBeenCalledTimes(11);
});
it('cancels an upload safely if the game resets before the group is ready',async()=>{
 const {stage,cards}=setup();let upload!:()=>void;stage.app.renderer.prepare.upload.mockImplementation(()=>new Promise<void>(resolve=>upload=resolve));
 const done=stage.collectRemaining(cards,0,true);await flush();stage.revealToken++;upload();await done;
 expect(stage.flightLayer.children).toHaveLength(0);expect(stage.onCardStored).not.toHaveBeenCalled();expect(boards[0].destroy).toHaveBeenCalledOnce();
});
