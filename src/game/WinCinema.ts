import {prepareBattleFont} from './battleFont';
import {WinJuice} from './WinJuice';
import {WinTierLadder} from './WinTierLadder';
import {eyeBars,EYE_BEAT} from './championshipBeat';
import {juiceUp,scenePunch,shakeOffset,strikeClock,tickRate,TIER_PALETTE,winLadder,winTrauma} from './winJuiceMotion';
import {winTitleLetter} from './winFinalePresentation';
import {finalStrike} from './finalStrike';
import {winReturnPose} from './winContinuity';
import type {WinSource} from './winPresentationIdentity';
import {attackTransition} from './winCinemaImpact';
import {Container,Graphics,Rectangle,Sprite,Text} from 'pixi.js';
import {WinCinemaStage,prepareWinActor,takeWinStage} from './WinCinemaStage';
import {playCrowdReaction,stopCrowdReaction,playSound,preloadRevealAudio,preloadWinAudio,playPokemonMove,type PokemonMoveVoice,type WinSound} from './audio';
import {pokemonPower,type PowerProfile} from './powerProfiles';
import {winTierProfile,winAttackBeats,type CinemaTier} from './winChoreography';
import {finalWinImpact} from './winCinemaImpact';
import {smooth,winCinemaGeometry,winCinemaPose,WIN_CINEMA_IMPACT,WIN_CINEMA_FINISH,AWARD_INK} from './winCinemaMotion';
/** Light is procedural; only the actor and the battle lettering need preparing. */
export function preloadWinCinema(name?:string){return Promise.all([name?prepareWinActor(name):Promise.resolve(null),prepareBattleFont()]);}
export class WinCinema {
 readonly root=new Container();private sceneHost=new Container();private gradientShade=new Graphics();private shade=new Graphics();private shadeWidth=0;private shadeHeight=0;private stage:WinCinemaStage|null=null;private sprite:Sprite|null=null;
 private returnSound=false;private crowdStarted=false;private profile:PowerProfile;private voice:PokemonMoveVoice|null=null;private veil=new Graphics();private echo=new Text({text:'',style:{fontFamily:'BattleDisplay',fontWeight:'400',fontStyle:'normal',fontSize:70,fill:0xffedac},resolution:2});
 private title=new Container();private letters:Text[]=[];private shines:Text[]=[];private tickAge=0;private lastCount=0;private rungCue=0;private chargeCue=false;private glintCue=false;private name:Text;private prompt:Text;
 private juice:WinJuice;private ladder:WinTierLadder;
 private hitArea=new Rectangle();private audioCues:{time:number;kind:string;beat:ReturnType<typeof winAttackBeats>[number]}[]=[];private tier:CinemaTier;private voiceEnds=0;private cueIndex=0;private age=0;private died=false;private settled=false;private loaded=false;
 constructor(tier:CinemaTier|boolean,species:string,low:boolean,onTap:()=>void,image?:string,private source?:WinSource){
  this.tier=typeof tier==='boolean'?(tier?'mega':'big'):tier;const profile=winTierProfile(this.tier);
  const path=image??'/assets/pokemon/'+species.toLowerCase().replace(/\s+(ex|vmax|vstar|v|gx)$/,'')+'.png';this.profile=pokemonPower(path);void preloadRevealAudio(path);void preloadWinAudio();
  this.root.eventMode='static';this.root.on('pointertap',e=>{e.stopPropagation();onTap();});
  this.juice=new WinJuice(this.tier,this.profile.color,this.profile.light,low,this.profile.kind);this.ladder=new WinTierLadder(this.tier);
  this.root.addChild(this.veil,this.sceneHost,this.gradientShade,this.juice.back,this.shade,this.juice.mid,this.ladder.root,this.echo,this.title);this.echo.anchor.set(.5);this.echo.text=this.tier==='legendary'?'LEGENDARY\nWIN':profile.title;this.echo.style.align='center';
  this.audioCues=winAttackBeats(this.tier).flatMap(beat=>[...(beat.finisher?[{time:beat.start,kind:'windup',beat}]:[]),{time:beat.release,kind:'release',beat},{time:beat.impact,kind:'impact',beat},...(beat.finisher?[{time:beat.impact+.22,kind:'resolve',beat}]:[])]);
  const wording=profile.title;
  for(const char of wording){const letter=new Text({text:char,style:{fontFamily:'BattleDisplay, Arial',fontWeight:'400',fontStyle:'normal',fontSize:70,fill:TIER_PALETTE[this.tier].fill,stroke:{color:0x061b32,width:8},dropShadow:{color:TIER_PALETTE[this.tier].edge,blur:0,distance:11,angle:Math.PI/2}},resolution:2});letter.anchor.set(.5);this.letters.push(letter);const shine=new Text({text:char,style:{fontFamily:'BattleDisplay, Arial',fontWeight:'400',fontStyle:'normal',fontSize:70,fill:0xffffff},resolution:2});shine.anchor.set(.5);shine.blendMode='add';shine.alpha=0;this.shines.push(shine);this.title.addChild(letter,shine);}
  this.name=new Text({text:species.toUpperCase(),style:{fontFamily:'Nunito, Arial',fontWeight:'800',fontSize:14,letterSpacing:4,fill:0xc5edff},resolution:2});this.name.anchor.set(.5);
  this.prompt=new Text({text:'TAP TO REVEAL TOTAL',style:{fontFamily:'Nunito, Arial',fontWeight:'800',fontSize:13,letterSpacing:2,fill:0xc5dce9},resolution:2});this.prompt.anchor.set(.5);this.root.addChild(this.name,this.prompt,this.juice.front);
  void Promise.all([preloadWinCinema(),takeWinStage(path,this.tier,low)]).then(([,stage])=>{if(this.died){stage?.destroy();return;}if(stage){this.stage=stage;this.sprite=new Sprite(this.stage.texture);this.sceneHost.addChild(this.sprite);}this.loaded=true;}).catch(error=>{console.warn('Win cinematic unavailable',error);this.loaded=true;});
 }
 get ready(){return this.loaded;}
 finish(){if(this.settled)return;if(this.age>.2&&this.age<WIN_CINEMA_FINISH)playSound(('win-final-'+winTierProfile(this.tier).rank) as WinSound,{gain:.85});this.settled=true;this.cueIndex=100;this.voice?.stop();this.voice=null;}
 update(age:number,w:number,h:number,exitAge=0,reduced=false){
  this.age=age;const g=winCinemaGeometry(w,h,this.tier==='legendary',age,this.letters.length),p=winCinemaPose(age,exitAge,this.tier),entry=reduced?1:attackTransition(age).arena,exit=winReturnPose(exitAge),final=finalWinImpact(age,reduced),clock=age,held=strikeClock(age,this.tier,reduced||this.settled);
  this.hitArea.width=w;this.hitArea.height=h;this.root.hitArea=this.hitArea;this.root.alpha=p.alpha;this.root.eventMode=exitAge?'none':'static';
  if(entry>0&&exit.scene>0)this.stage?.render(held,w,h,reduced,exitAge,age);if(this.sprite){this.sprite.width=w;this.sprite.height=h;this.sprite.alpha=entry*exit.scene;}const origins=age<1.72&&this.source?this.source(clock):this.stage?.attackOrigins(w,h)??[];
  // The whole lens takes each strike: a short punch-in and additive trauma, released with the recovery.
  const trauma=winTrauma(age,this.tier,reduced||this.settled&&age<WIN_CINEMA_FINISH),shake=shakeOffset(age,trauma,Math.min(w,h)*.022),punch=scenePunch(age,this.tier,reduced)*exit.scene;
  this.sceneHost.pivot.set(w/2,h/2);this.sceneHost.position.set(w/2+shake.x,h/2+shake.y);this.sceneHost.rotation=shake.roll;this.sceneHost.scale.set(1+punch+trauma*trauma*.035);
  const banner={x:g.x,y:g.bannerY};this.ladder.update(age,w,h,banner.x+shake.x,banner.y+shake.y,reduced,g.bannerSize);const bars=eyeBars(age,reduced||this.settled);this.ladder.root.alpha=(1-smooth(exitAge/.2))*(1-bars);
  this.juice.update(age,w,h,{socket:origins[0]??null,body:age>=1.72&&this.stage?this.stage.bodyScreen(w,h):{x:w/2,y:h*.40},amount:{x:g.x,y:g.amountCentreY},banner:age>=WIN_CINEMA_FINISH?{x:g.x,y:g.titleY}:banner,count:p.count,exitAge,reduced,eyes:this.stage?.eyePoints??[],bars});
  this.veil.clear().rect(0,0,w,h).fill({color:0x031c37,alpha:entry*.63*exit.scene});
  const profile=winTierProfile(this.tier);
  if(w!==this.shadeWidth||h!==this.shadeHeight){this.shadeWidth=w;this.shadeHeight=h;this.gradientShade.clear();for(let i=0;i<64;i++)this.gradientShade.rect(0,h*(.52+i*.0075),w,h*.0076).fill({color:0x06192c,alpha:(i/64)*.55});}this.gradientShade.alpha=entry*exit.scene;const veil=this.shade.clear();
  if(bars>0){const strip=h*.37*bars;veil.rect(0,0,w,strip).rect(0,h-strip,w,strip).fill(0x020812);}
  if(final.flash>0)veil.rect(0,0,w,h).fill({color:0xfff5d9,alpha:final.flash*Math.min(1.2,profile.strength)});
  this.echo.position.set(g.x,g.titleY+(this.tier==='legendary'?h*.047:0)-final.ring*h*.04);this.echo.style.fontSize=Math.min(g.titleSize,w/(this.letters.length*.8));this.echo.scale.set(1+final.ring*.7);this.echo.alpha=0;
  const landing=Math.max(0,age-WIN_CINEMA_FINISH-.10),strike=finalStrike(age,reduced||this.settled);
  const stamp=reduced||this.settled?{scale:1,rotation:0}:juiceUp(landing-.095,.32,.04);this.title.pivot.set(g.x,g.titleRows[g.titleRows.length-1].y);this.title.position.copyFrom(this.title.pivot);this.title.scale.set(stamp.scale);this.title.rotation=stamp.rotation;
  this.title.alpha=smooth(landing/.045)*(1-smooth(exitAge/.20));const single=g.titleRows[0],advance=single.size*.49,start=g.x-(this.letters.length-1)*advance/2,ride=Math.max(0,strike.amountY-1)*g.size*(AWARD_INK.amountTop+AWARD_INK.amountBottom);
  this.letters.forEach((letter,i)=>{const stacked=g.stacked,row=stacked&&i>9?1:0,index=row?i-10:i,columns=row?3:9,line=g.titleRows[row],pose=winTitleLetter(age-WIN_CINEMA_FINISH-.10,i,this.letters.length,reduced||this.settled);letter.visible=!stacked||i!==9;letter.style.fontSize=line.size;letter.position.set(stacked?w/2+(index-(columns-1)/2)*line.size*.5:start+i*advance,line.y-ride-strike.hit*h*.008+pose.y*h);letter.alpha=pose.alpha;letter.rotation=pose.rotation;letter.scale.set(pose.scale*(1+strike.hit*.06),pose.scale*(1+strike.hit*.08));
   // The held title keeps breathing: a slow per-letter drift and a travelling highlight.
   const held=reduced?0:smooth((landing-.5)/.5),sweep=((landing-.35)*1.15)%2.9-i*.085,shine=this.shines[i];letter.y+=Math.sin(age*2.3+i*.6)*h*.0038*held;letter.rotation+=Math.sin(age*1.7+i*.9)*.014*held;
   shine.visible=letter.visible;shine.style.fontSize=letter.style.fontSize;shine.position.copyFrom(letter.position);shine.rotation=letter.rotation;shine.scale.copyFrom(letter.scale);shine.alpha=reduced?0:pose.alpha*Math.max(Math.max(0,1-landing/.22)*.9,landing>.35?Math.max(0,1-Math.abs(sweep)/.16)*.7:0);});
  // The final lettering is drawn once, unseen, during the opening charge so the finisher never waits on glyphs.
  if(age<.45&&!reduced){this.title.alpha=.004;for(const letter of this.letters)letter.alpha=1;for(const shine of this.shines)shine.alpha=1;}
  this.name.position.set(w/2,h*.105);this.name.style.fontSize=Math.max(11,Math.min(w*.024,19));this.name.alpha=smooth((age-.5)/.3)*(1-smooth((age-1.5)/.3));
  this.prompt.text=age>=WIN_CINEMA_FINISH||this.settled?'TAP TO CONTINUE':'TAP TO REVEAL TOTAL';this.prompt.position.set(w/2,g.promptY);this.prompt.style.fontSize=g.promptSize;this.prompt.alpha=smooth((age-2.5)/.4)*.8*(1-smooth(exitAge/.12))*(1-bars);if(exitAge>0&&!this.returnSound){this.returnSound=true;if(!reduced)playSound('win-return');}
  if(age>this.voiceEnds&&this.voice){this.voice.stop();this.voice=null;}
  const cues=this.audioCues;
  while(this.cueIndex<cues.length&&age>=cues[this.cueIndex].time){const cue=cues[this.cueIndex++];if(reduced||this.settled)continue;
   // One sound per cause: the wind-up rises into its release, the release travels, the strike lands and pays.
   if(cue.kind==='windup')playSound('win-charge',{gain:.8,rate:1.08/(cue.beat.release-cue.beat.start)});
   else if(cue.kind==='release'){this.voice?.stop();this.voice=playPokemonMove(this.profile.cue,0);this.voice?.update(cue.beat.finisher?1:.6,0);this.voiceEnds=cue.beat.impact+.32;playSound(cue.beat.impact===WIN_CINEMA_IMPACT?'win-flood':'win-launch',{gain:cue.beat.finisher?1:.8});}
   else if(cue.kind==='resolve'){stopCrowdReaction();playCrowdReaction(4);this.crowdStarted=true;}
   else if(cue.beat.finisher){playSound(('win-final-'+profile.rank) as WinSound);playSound(('win-coins-'+Math.min(3,profile.rank)) as WinSound,{gain:.9});}
   else if(cue.beat.impact!==WIN_CINEMA_IMPACT){playSound(cue.beat.strength>.62?'win-strike-2':'win-strike-1');playSound('win-coins-1',{gain:.75});}
  }
  // Rising-pitch ticks while the amount climbs; each tier slam answers with a brighter stinger.
  if(!reduced&&!this.settled){
   if(!this.glintCue&&age>=EYE_BEAT.glint&&age<EYE_BEAT.glint+.3){this.glintCue=true;playSound('win-glint');}
   if(!this.chargeCue&&age>=.02&&age<1){this.chargeCue=true;playSound('win-charge',{gain:.9});}
   const rungs=winLadder(this.tier);
   while(this.rungCue<rungs.length&&age>=rungs[this.rungCue].time){const rung=this.rungCue++;if(rungs[rung].time>WIN_CINEMA_IMPACT)playSound(('win-rung-'+(rung+1)) as WinSound);}
   if(p.count>this.lastCount+.0005&&age<WIN_CINEMA_FINISH&&age-this.tickAge>=.085){this.tickAge=age;playSound('win-tick',{gain:.7+p.count*.3,rate:tickRate(p.count,this.rungCue)});}
  }
  this.lastCount=p.count;

 }
 amountPose(w:number,h:number){const g=winCinemaGeometry(w,h,this.tier==='legendary',this.age);return{x:g.x,y:g.amountY,scaleX:1,scaleY:1};}
 get currentAge(){return this.age;}
 destroy(){this.died=true;if(this.crowdStarted)stopCrowdReaction();this.voice?.stop();this.juice.destroy();this.ladder.destroy();this.stage?.destroy();this.root.destroy({children:true});}
}
