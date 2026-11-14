import {battleCameraZoom,impactPresentationTime} from './battleFraming';
import {PaintedVaultFx} from './PaintedVaultFx';
import {lockedReward,vaultWard,vaultCardPose,vaultSealPoints} from './vaultPresentation';
import {guardContact,showdownBeam} from './showdownBeam';
import {impactPose,rewardPresentation} from './showdownImpact';
import {Assets,Container,Sprite,Texture as PixiTexture,Rectangle,Text,PerspectiveMesh,Point as PixiPoint,type Application,type Texture} from 'pixi.js';
import {PaintedVaultScene} from './PaintedVaultScene';
import {money} from '../model';
import {gameLayout} from '../rendering';
import {PokemonActor} from '../PokemonActor';
import {BattlePerformer} from './BattlePerformer';
import {createFoil} from '../foil';
import {pokemonPower} from '../powerProfiles';
import {playSound,playPokemonCry,playPokemonMove,preloadRevealAudio,preloadVaultAudio,stopRevealAudio} from '../audio';
import {SHOWDOWNS,FLIGHT_TIME,CARD_REVEAL_AT,showdownReleaseAt,showdownLayout,showdownSnapshot,clamp,smooth,type ShowdownId,type Point} from './showdownModel';

const CARD='/assets/sets/crown-zenith/cards/GG44.webp';
function text(value:string,size:number,color:number){const t=new Text({text:value,style:{fontFamily:'Nunito',fontWeight:'900',fontSize:size,fill:color,stroke:{color:0x102536,width:3}}});t.anchor.set(.5);return t;}
/** A staged fight. Native poses and Spine FX share one sampled timeline. */
export class ShowdownScene {
 readonly root=new Container();
 private camera=new Container();private stadium=new PaintedVaultScene();private world=new Container();private shadows=new Container();private groundShadows=[new Sprite(),new Sprite()];private environmentTime=0;private travel=1;private cinematicZoom=1;private shade=new Sprite(PixiTexture.WHITE);private boardGuard=-1;
 private playerRoot=new Container();private bossRoot=new Container();private player:PokemonActor|null=null;private boss:PokemonActor|null=null;
 private playerMotion:BattlePerformer|null=null;private bossMotion:BattlePerformer|null=null;
 private portraits:Sprite[]=[];private playerSummon=new PaintedVaultFx('summon');private bossSummon=new PaintedVaultFx('summon');private coronation=new PaintedVaultFx('reward');
 private guard=new PaintedVaultFx('guardfront');private guardBack=new PaintedVaultFx('guardback');private charge=new PaintedVaultFx('charge');private attacks=[new PaintedVaultFx('fire0'),new PaintedVaultFx('fire1'),new PaintedVaultFx('fire2')];private speed=new PaintedVaultFx('speed');private shock=new PaintedVaultFx('shock');private hit=new PaintedVaultFx('impact');private guardBreak=new PaintedVaultFx('guardbreak');private ball=new PaintedVaultFx('ball');private portals=[new PaintedVaultFx('portal'),new PaintedVaultFx('portal')];private links=[new PaintedVaultFx('link'),new PaintedVaultFx('link'),new PaintedVaultFx('link')];
 private playerName=text('Charizard',20,0xffd4a4);private bossName=text('Mewtwo',20,0xe4d4ff);
 private prizeRoot=new Container();private containment=new PaintedVaultFx('containment');private vaultCaption=text('Sealed reward',16,0xe1d4ff);private card:PerspectiveMesh|null=null;private cardFront:Texture|null=null;private cardBack:Texture|null=null;private foil=createFoil(.8);
 private payout=text('',61,0xffe7a6);private payoutCaption=text('',17,0xf4f2e7);private hitAward=text('',27,0xe9d9ff);private moveTitle=text('',28,0xffedd0);private impactFlash=new Sprite(PixiTexture.WHITE);
 private layout=showdownLayout(1200,900);private id:ShowdownId='legendary';private dead=false;private closing=false;private lastTime=-1;private fired=new Set<string>();private loaded=false;
 constructor(private app:Application,private low:boolean,private baseBet=1000){
  this.root.addChild(this.camera,this.impactFlash);this.camera.addChild(this.stadium.root,this.shade,this.world);this.world.addChild(this.shadows,...this.portals.map(f=>f.rig),this.guardBack.rig,this.prizeRoot,this.containment.rig,...this.links.map(f=>f.rig),this.playerRoot,this.bossRoot,this.ball.rig,this.playerSummon.rig,this.bossSummon.rig,this.guard.rig,this.speed.rig,this.charge.rig,...this.attacks.map(fx=>fx.rig),this.hit.rig,this.guardBreak.rig,this.shock.rig,this.playerName,this.bossName,this.hitAward,this.moveTitle,this.vaultCaption,this.payout,this.payoutCaption);
  this.shadows.addChild(...this.groundShadows);this.shade.tint=0x080719;this.impactFlash.tint=0xffefcf;this.shade.alpha=this.impactFlash.alpha=0;
  this.prizeRoot.addChild(this.coronation.rig);
  this.playerSummon.rig.visible=this.bossSummon.rig.visible=false;this.prizeRoot.visible=false;this.app.stage.addChild(this.root);this.resize();
 }
 async load(){
  const results=await Promise.allSettled([
   this.stadium.init().then(()=>{if(this.dead||this.closing)return;this.stadium.setActive(true,true);this.stadium.setBoard({phase:'showdown',packName:'Legendary Showdown',index:3});this.resize();}),
   Promise.all([Assets.load<Texture>(CARD),Assets.load<Texture>('/assets/card-back.webp')]).then(([front,back])=>{if(this.dead)return;this.cardFront=front;this.cardBack=back;this.card=new PerspectiveMesh({texture:back,verticesX:4,verticesY:6});this.card.filters=[this.foil];this.prizeRoot.addChild(this.card);}),
   this.loadActor('charizard',this.playerRoot,-64),this.loadActor('mewtwo',this.bossRoot,64),preloadVaultAudio(),
   Promise.all(this.effects.map(f=>f.load())),
   Assets.load<Texture>('/assets/showdown-v10/shadow.png').then(texture=>{if(this.dead)return;const shadow=new PixiTexture({source:texture.source,frame:new Rectangle(70,560,1110,220)});for(const sprite of this.groundShadows){sprite.texture=shadow;sprite.anchor.set(.5);}}),
  ]);
  if([0,1,2,3,5,6].some(i=>results[i].status==='rejected'))throw new Error('Required vault artwork could not load.');
  this.loaded=true;return results.every(r=>r.status==='fulfilled');
 }
 private get effects(){return [this.playerSummon,this.bossSummon,this.coronation,this.guard,this.guardBack,this.charge,...this.attacks,this.speed,this.shock,this.hit,this.guardBreak,this.ball,...this.portals,...this.links,this.containment];}
 private async loadActor(name:'charizard'|'mewtwo',parent:Container,yaw:number){
  const path=`/assets/pokemon/${name}.png`,texture=await Assets.load<Texture>(path);if(this.dead)return;
  const portrait=new Sprite(texture);portrait.anchor.set(.5,1);portrait.width=portrait.height=290;parent.addChild(portrait);this.portraits.push(portrait);
  const actor=await PokemonActor.create(path,this.low,yaw);if(this.dead){actor.destroy();return;}
  actor.setContinuousRendering(true);actor.fitPresentation(name==='charizard'?270:240);actor.y=-154;actor.play('idle');parent.addChild(actor);portrait.visible=false;
  if(name==='charizard'){this.player=actor;this.playerMotion=new BattlePerformer(actor);}else{this.boss=actor;this.bossMotion=new BattlePerformer(actor);}
  void preloadRevealAudio(path);
 }
 resize(){
  const w=this.app.screen.width,h=this.app.screen.height,l=this.layout=showdownLayout(w,h);
  this.stadium.resize(w,h,h,{...gameLayout(w,h,true),stageWidth:l.deck.width*l.scale,stageY:l.y+l.deck.y*l.scale,stageFlatten:l.deck.flatten});
  this.setTravel(this.travel);
  this.world.position.set(l.x,l.y);this.world.scale.set(l.scale);
  this.playerRoot.position.set(l.player.x,l.player.y);this.playerRoot.scale.set(l.playerScale);this.bossRoot.position.set(l.boss.x,l.boss.y);this.bossRoot.scale.set(l.bossScale);
  this.playerName.visible=this.bossName.visible=false;
  this.playerName.style.fontSize=this.bossName.style.fontSize=l.wide?20:17;
  this.prizeRoot.position.set(l.card.x,l.card.y);this.prizeRoot.scale.set(l.cardScale);
  this.payout.position.set(l.width/2,l.card.y+235*l.cardScale+34);this.payout.style.fontSize=l.wide?57:45;
  this.payoutCaption.position.set(l.width/2,l.card.y+235*l.cardScale+78);this.payoutCaption.style.fontSize=l.wide?18:16;
  this.moveTitle.visible=false;

 }
 cancelPresentation(){this.closing=true;this.playerMotion?.reset();this.bossMotion?.reset();stopRevealAudio();}
 setPaused(paused:boolean){this.stadium.pause(paused);}
 setTravel(progress:number){
  this.travel=progress;const w=this.app.screen.width,h=this.app.screen.height,zoom=1+(1-progress)*.13;
  this.camera.pivot.set(w/2,h*.62);this.camera.position.set(w/2,h*.62+(1-progress)*24);this.camera.scale.set(zoom*this.cinematicZoom);
 }
 reset(id:ShowdownId){this.id=id;this.lastTime=-1;this.fired.clear();this.playerMotion?.reset();this.bossMotion?.reset();this.stadium.resetPresentation();stopRevealAudio();}
 private source(actor:PokemonActor|null,parent:Container,name:string):Point{
  const emitter=actor?.powerEmitters(pokemonPower(`/assets/pokemon/${name}.png`))[0];
  if(actor&&emitter){const p=this.world.toLocal(actor.toGlobal(new PixiPoint(emitter.x,emitter.y)));return {x:p.x,y:p.y};}
  return {x:parent.x,y:parent.y-95*parent.scale.y};
 }
 private cue(key:string,at:number,time:number,silent:boolean,run:()=>void){if(time>=at&&!this.fired.has(key)){this.fired.add(key);if(!this.closing&&!silent&&time-at<.5)run();}}
 update(time:number,dt:number,reduced:boolean,playing:boolean,silent=false){
  if(this.dead)return;
  const l=this.layout,round=SHOWDOWNS.find(r=>r.id===this.id)!,preview=time<0,final=smooth((time-8.95)/.9),snapshot=showdownSnapshot(this.id,time);
  if(time<this.lastTime)this.reset(this.id);this.lastTime=time;
  if(silent){this.playerMotion?.reset();this.bossMotion?.reset();stopRevealAudio();}
  this.playerRoot.position.set(l.player.x,l.player.y);this.bossRoot.position.set(l.boss.x,l.boss.y);
  const poseTime=impactPresentationTime(time,round.strikes,reduced);
  const lastStrike=[...round.strikes].reverse().find(s=>time>=s.at),reaction=impactPose(lastStrike?poseTime-lastStrike.at:-1,this.id==='legendary'?1:.8,!!lastStrike?.finisher,reduced);
  this.bossRoot.x+=reaction.x;this.bossRoot.y+=reaction.y;this.boss?.setHitReaction(reaction.recoil,lastStrike?.finisher?1.3:1);
  const windup=!reduced?smooth((time-(round.strikes[2].at-1.1))/.9)*(1-smooth((time-round.strikes[2].at)/.8)):0;
  this.cinematicZoom=battleCameraZoom(time,l.wide,reduced)+(reduced?0:windup*.045+reaction.recoil*(lastStrike?.finisher?.03:.01));this.setTravel(this.travel);
  this.shade.width=this.impactFlash.width=this.app.screen.width;this.shade.height=this.impactFlash.height=this.app.screen.height;this.shade.alpha=preview?0:.06+windup*.15+final*.24;
  this.playerRoot.alpha=preview?0:(reduced?1:smooth((time-.55)/.6))*(1-final);
  this.bossRoot.alpha=(preview?0:reduced?1:smooth((time-.3)/.7))*(1-final);
  this.playerName.alpha=this.bossName.alpha=1-final;
  this.environmentTime+=Math.max(0,dt);this.stadium.tick(this.environmentTime,reduced,this.low);
  if(this.boardGuard!==snapshot.guard){this.boardGuard=snapshot.guard;this.stadium.setBoard({phase:'showdown',packName:'Legendary Showdown',index:snapshot.guard});}
  this.world.position.set(l.x,l.y);
  const upcoming=round.strikes.find(s=>time<s.at),release=showdownReleaseAt(this.id,time,this.player?.chargeDuration??.65);
  this.playerMotion?.update(preview?-1:poseTime,dt,reduced,.35,preview||!playing?null:release);
  const ward=round.strikes.filter(s=>time>=s.at-2).at(-1)??round.strikes[0];
  this.bossMotion?.update(preview?-1:poseTime,dt,reduced,0,preview||!playing?null:ward.at-1.05);
  this.player?.setEnergy(0xff924b,upcoming&&time>upcoming.at-1.1&&time<upcoming.at?.65:.08);
  this.boss?.setEnergy(0xc7a0ff,upcoming&&time>upcoming.at-2&&time<upcoming.at-.65?.8:.12);
  [this.playerRoot,this.bossRoot].forEach((root,i)=>{const shadow=this.groundShadows[i];shadow.position.set(i?root.x:l.player.x,l.player.y+3);shadow.width=180*(i?l.bossScale:l.playerScale);shadow.height=35*(i?l.bossScale:l.playerScale);shadow.alpha=root.alpha*.72;});
  this.sampleSummon(this.playerSummon,preview?-1:time-.35,l.player,reduced,preview);this.sampleSummon(this.bossSummon,preview?-1:time,l.boss,reduced,preview);
  this.ball.sample(preview?-1:time,reduced);this.ball.rig.position.set(l.player.x,l.player.y);this.ball.rig.scale.set(l.wide?1.2:.9);
  this.portals.forEach((fx,i)=>{fx.sample(Math.max(0,time),reduced);const p=i?l.boss:l.player;fx.rig.position.set(p.x,p.y);fx.rig.scale.set((l.wide?1:.7),l.wide?.65:.5);fx.rig.alpha=preview?0:smooth(time/.3)*(1-final)*(i?.14:.22*(1-smooth((time-1.2)/.6)));});
  const mouth=this.source(this.player,this.playerRoot,'charizard');
  const bossTarget=guardContact(l);
  for(const fx of this.attacks)fx.rig.visible=false;this.hit.rig.visible=this.guardBreak.rig.visible=false;
  this.hitAward.visible=false;this.charge.rig.visible=false;this.shock.rig.visible=false;this.speed.rig.visible=false;this.links.forEach(f=>f.rig.visible=false);this.impactFlash.alpha=0;
  this.drawGuard(time,snapshot.guard,reduced);
  if(!preview&&!reduced&&windup>0){this.speed.sample(time);this.speed.rig.position.set(l.width/2,300);this.speed.rig.scale.set(l.width/1000,.8);this.speed.rig.alpha=windup*.42;}
  // Each authored Spine tether originates at Mewtwo's native hand and terminates at a surviving card seal.
  if(!preview&&time>1.1&&snapshot.guard>0){
   const hand=this.source(this.boss,this.bossRoot,'mewtwo'),reinforcing=upcoming&&time>upcoming.at-2&&time<upcoming.at-.65;
   for(const [i,p] of vaultSealPoints(l).slice(0,snapshot.guard).entries()){
    const fx=this.links[i],dx=p.x-hand.x,dy=p.y-hand.y;fx.sample(time+i*.4,reduced);fx.rig.position.set(hand.x,hand.y);fx.rig.rotation=Math.atan2(dy,dx);fx.rig.scale.set(Math.hypot(dx,dy)/320,.4);fx.rig.alpha=reinforcing?.6:.28;
   }
  }
  if(!reduced&&lastStrike){const age=time-lastStrike.at;this.world.position.set(l.x+Math.sin(age*52)*reaction.shake,l.y+Math.cos(age*43)*reaction.shake*.35);if(reaction.flash>0)this.impactFlash.alpha=reaction.flash;}

  for(const [i,s] of round.strikes.entries()){
   const age=time-s.at,fireAge=poseTime-s.at+FLIGHT_TIME;
   this.cue('charge'+i,s.at-1.0,time,silent,()=>playSound('vault-charge',{gain:1}));
   this.cue('fire'+i,s.at-FLIGHT_TIME,time,silent,()=>{if(i===0)playPokemonCry(6);this.playerMotion?.setVoice(playPokemonMove('fire'),s.at-FLIGHT_TIME);});
   this.cue('hit'+i,s.at,time,silent,()=>{playSound(s.finisher?'vault-break':i===1?'vault-hit-heavy':'vault-hit',{gain:1});if(s.finisher){this.stadium.beginReveal(reduced,this.id==='legendary'?4:2);this.stadium.setCardColor(0xcbb2ff,reduced,.1);}this.stadium.impact(!!s.finisher,reduced,!!s.finisher);});
   if(!reduced&&time>=s.at-1.05&&fireAge<0)this.drawCharge(mouth,time-(s.at-1.05),s.finisher?1.2:.8);
   const beam=showdownBeam(mouth,bossTarget,fireAge);
   if(!reduced&&beam.visible){
    const fire=this.attacks[i];fire.sample(fireAge);fire.rig.alpha=beam.alpha;
    const dx=beam.end.x-beam.start.x,dy=beam.end.y-beam.start.y;
    fire.rig.position.set(beam.start.x,beam.start.y);fire.rig.rotation=Math.atan2(dy,dx);
    fire.rig.scale.set(Math.max(.001,Math.hypot(dx,dy)/320),Math.min((l.wide?1.35:1)*(s.finisher?1.3:1),Math.hypot(dx,dy)/(s.finisher?280:320))*(.65+.35*beam.alpha));
   }
   if(!reduced&&age>=0&&age<1){if(age<.32){this.shock.sample(age*1.7);this.shock.rig.position.set(bossTarget.x,bossTarget.y);this.shock.rig.scale.set(s.finisher?.55:.28);this.shock.rig.alpha=.6;}this.hit.sample(age);this.hit.rig.position.set(bossTarget.x,bossTarget.y);this.hit.rig.scale.set(s.finisher?2.6:1.6);}

   if(!reduced&&s.finisher&&age>=0&&age<1.6){this.guardBreak.sample(age);this.guardBreak.rig.position.set(vaultWard(l).x,vaultWard(l).y);this.guardBreak.rig.scale.set(l.guardRadius/100);}
   if(age>=.12&&age<1.5){const u=reduced?0:clamp((age-.65)/.8);this.hitAward.visible=true;this.hitAward.text=s.finisher?'Vault unlocked':`Seal ${i+1} broken`;this.hitAward.position.set(bossTarget.x+(l.width/2-bossTarget.x)*smooth(u),bossTarget.y-95-(reduced?0:45*clamp(age)));this.hitAward.alpha=1-smooth(u);this.hitAward.scale.set((s.finisher?1.15:1)*(1-u*.35));}
  }
  const namedMove=round.strikes.find(s=>time>=s.at-1.1&&time<s.at+.16);
  this.moveTitle.text=namedMove?.title??'';this.moveTitle.visible=!preview&&!!namedMove;this.moveTitle.style.fontSize=l.wide?23:19;this.moveTitle.position.set(l.player.x+12,l.player.y-(l.wide?325:265));this.moveTitle.alpha=namedMove?1:0;
  this.updatePrize(time,dt,reduced,snapshot.total,silent);
 }
 private sampleSummon(fx:PaintedVaultFx,age:number,p:Point,reduced:boolean,preview:boolean){
  // Character materialization is masked by authored plumes, then settles onto the same floor lane.
  fx.sample(age,reduced&&!preview);fx.rig.position.set(p.x,p.y);fx.rig.scale.set(this.layout.wide?1.5:1.1);
 }
 private drawGuard(time:number,remaining:number,reduced:boolean){
  const l=this.layout,last=SHOWDOWNS.find(s=>s.id===this.id)!.strikes.filter(s=>time>=s.at).at(-1),age=last?time-last.at:99;
  const visible=time>=.6&&time<CARD_REVEAL_AT-.5;
  for(const fx of [this.guardBack,this.guard]){fx.sampleGuard(time,visible?remaining:0,reduced,smooth(age/.035)*(1-smooth(age/.45)));fx.rig.position.set(vaultWard(l).x,vaultWard(l).y);fx.rig.scale.set(l.guardRadius/100);fx.rig.alpha=reduced?1:smooth((time-.6)/.45);}
 }
 private drawCharge(p:Point,age:number,size:number){this.charge.sample(age);this.charge.rig.position.set(p.x,p.y);this.charge.rig.scale.set(size*.6);}
 private updatePrize(time:number,_dt:number,reduced:boolean,total:number,silent=false){
  const l=this.layout,age=time-CARD_REVEAL_AT;
  const uniforms=this.foil.resources.foil.uniforms;uniforms.uTime=reduced||age<0?0:time;uniforms.uTilt=reduced||age<0?0:Math.sin(age*.65)*.3;uniforms.uTiltY=0;
  this.coronation.sample(age-.65,reduced);this.coronation.rig.position.set(0,0);this.coronation.rig.scale.set(1);this.coronation.rig.alpha=this.id==='legendary'?1:.55;
  this.prizeRoot.visible=true;this.payout.visible=this.payoutCaption.visible=age>=.95;
  const held=lockedReward(l),pose=vaultCardPose(time,l,reduced),remaining=showdownSnapshot(this.id,time).guard;
  const latest=SHOWDOWNS.find(r=>r.id===this.id)!.strikes.filter(s=>time>=s.at).at(-1),hit=latest?1-smooth((time-latest.at)/.35):0;
  this.containment.sampleContainment(time,remaining,pose.release,reduced,hit);this.containment.rig.position.set(time<1.1?pose.x:held.x,time<1.1?pose.y:held.y);
  this.vaultCaption.visible=remaining>0&&age<-.35;this.vaultCaption.text='Sealed reward';this.vaultCaption.position.set(time<1.1?pose.x:held.x,(time<1.1?pose.y:held.y)-116);
  if(age<-.35){
   this.prizeRoot.position.set(pose.x,pose.y);this.prizeRoot.scale.set(pose.scale);this.prizeRoot.alpha=1;
   this.coronation.rig.visible=false;
   if(this.card&&this.cardBack){this.card.texture=this.cardBack;this.card.setCorners(-156,-217.5,156,-217.5,156,217.5,-156,217.5);}
   return;
  }
  const reward=rewardPresentation(age,total,reduced),enter=reduced?1:smooth((age+.35)/.35),flip=reduced?1:smooth(age/.95),width=312*Math.max(.015,Math.abs(Math.cos(flip*Math.PI))),depth=Math.sin(flip*Math.PI)*22;
  this.prizeRoot.alpha=1;this.prizeRoot.position.set(l.card.x,l.card.y);this.prizeRoot.scale.set(l.cardScale*(.8+.2*enter)*reward.zoom);
  if(this.card&&this.cardFront&&this.cardBack){this.card.texture=flip<.5?this.cardBack:this.cardFront;this.card.setCorners(-width/2,-217.5+depth,width/2,-217.5-depth,width/2,217.5+depth,-width/2,217.5-depth);const u=this.foil.resources.foil.uniforms;u.uTime=reduced?0:time;u.uTilt=reduced?0:Math.sin(age*.65)*.3;u.uTiltY=0;}
  this.coronation.rig.visible=this.coronation.rig.visible&&flip>.98;
  this.payout.text=`${reward.shownTotal}×`;this.payout.scale.set(reward.zoom);this.payoutCaption.text=`${total} × ${money(this.baseBet)} = ${money(total*this.baseBet)}`;
  this.cue('card-flip',CARD_REVEAL_AT+.48,time,silent,()=>playSound('flip'));
  this.cue('card-reveal',CARD_REVEAL_AT+.55,time,silent,()=>{playSound('vault-reward',{gain:1});this.stadium.setCardColor(0xffdfa2,reduced,.3);});
  this.cue('win-lock',CARD_REVEAL_AT+2,time,silent,()=>playSound('wincollect',{gain:.8}));
 }
 render(){if(this.dead)return;if(this.app.stage.children.at(-1)!==this.root)this.app.stage.addChild(this.root);this.app.renderer.render(this.app.stage);}
 get ready(){return this.loaded;}
 destroy(){if(this.dead)return;this.dead=true;this.playerMotion?.reset();this.bossMotion?.reset();stopRevealAudio();this.player?.destroy();this.boss?.destroy();this.foil.destroy();this.effects.forEach(f=>f.destroy());this.stadium.destroy();this.root.destroy({children:true});}
}
