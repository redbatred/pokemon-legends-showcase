import {openingAnimationRate} from './autoSpin';
import {WIN_CINEMA_FINISH} from './winCinemaMotion';
import { createActor } from 'xstate';
import { Assets,type Texture } from 'pixi.js';
import { OpeningStage } from './Stage';
import { CanvasUI, type UIState, type HitTarget, type GameAction, type Panel } from './CanvasUI';
import { openingMachine } from './machine';
import { settleOpening, awardBonus, priceCard, DEFAULT_PACK, type Card, type Save, type Pack } from './model';
import { loadSave, transactSave, resetSave } from './storage';
import {winTier} from './winTransfer';
import { setSound, setBattleMusic,playSound,setAudioScenePaused,destroyAudio,preloadRevealAudio,unlockAudio } from './audio';
import { specialPokemon,type PokemonArtwork } from './specialReward';
import {createCheatOpening,NO_CHEATS,type Cheats} from './cheats';
import {AutoSpinSession,autoInterludeDelay,type AutoRevealMode} from './autoSpin';
import {qualifiesForShowdown} from './showdown/showdownSymbols';
import {bonusFrameBox,BONUS_SCENE,type CaptureDemo} from './bonusEncounter';
import {BonusPrefetch,bonusName,type BonusSpecies} from './bonusPrefetch';
import {BonusLoader} from './BonusLoader';

/** Discrete game state and persistence. Pixi owns every visible screen and frame. */
export class PokemonGame {
  private stage:OpeningStage;private view:CanvasUI|null=null;
  private actor=createActor(openingMachine);private phase='browse';private index=0;
  private save:Save|null=null;private packs:Pack[]=[DEFAULT_PACK];private catalogs:Record<string,Card[]>={};
  private selectedId=DEFAULT_PACK.id;private ready=false;private error='';private toast='';
  private panel:Panel=null;private inspected:Card|null=null;private resultId:string|null=null;
  private sound=false;private reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;private low=false;
  private turbo=false;private autoCount=5;private autoMode:AutoRevealMode='individual';private autoRun:AutoSpinSession|null=null;private autoTimer=0;
  private autoInterlude=false;private autoFinishing=false;private autoTimerToken=0;
  private flowToken=0;private packToken=0;private destroyed=false;private toastTimer=0;private stateKey='';
  private controls=document.createElement('div');private announcer=document.createElement('p');private keyboard=false;
  private pokemonArt:PokemonArtwork={};
  private showdown:{destroy():void}|null=null;private showdownLoading=false;private bonusFrame:HTMLIFrameElement|null=null;private bonusShade=document.createElement('div');private bonusDemo:Promise<CaptureDemo>|null=null;private bonusPlayed='';private bonusDueAt=0;private bonusQuiet=0;private bonusStake=0;private bonusAward=0;private bonusShape=0;private bonusSpecies='';private bonusAspect=.75;private cheats:Cheats={...NO_CHEATS};private showdownArmed=false;private showdownPending=false;
  constructor(private host:HTMLElement,private persistence={loadSave,transactSave,resetSave}){
    try{const settings=JSON.parse(localStorage.getItem('legends-settings')??'{}');this.sound=!!settings.sound;this.turbo=!!(settings.turbo??settings.reduced);this.low=!!settings.low;}catch{/* Use device defaults. */}
    setSound(this.sound);
    this.stage=new OpeningStage(host,{reduced:this.reduced,turbo:this.turbo,low:this.low,onTear:()=>this.action('tear'),onNext:()=>this.action('next')});
    this.controls.className='game-accessibility';this.controls.setAttribute('aria-label','Game controls');
    this.announcer.className='screen-reader';this.announcer.setAttribute('role','status');this.announcer.setAttribute('aria-live','polite');
    host.append(this.controls,this.announcer);host.addEventListener('legendary-bonus-ready',this.bonusReady);document.addEventListener('keydown',this.trackKeys);document.addEventListener('pointerdown',this.trackPointer);document.addEventListener('visibilitychange',this.scheduleAuto);
  }
  private trackKeys=(event:KeyboardEvent)=>{unlockAudio();if(event.key==='Tab')this.keyboard=true;};
  private trackPointer=()=>{unlockAudio();this.keyboard=false;this.view?.setFocus(null);};
  private get selected(){return this.save?.active?.pack??this.packs.find(p=>p.id===this.selectedId)??DEFAULT_PACK;}
  private get pool(){return this.catalogs[this.selected.id]??[];}
  private get opening(){return !['browse','complete'].includes(this.phase);}
  private get groupRevealCount(){
    const count=this.save?.active?.cards.length??0;
    return this.phase==='collecting'&&this.index<count-1?count-this.index-(this.actor.getSnapshot().context.collectFrom==='revealed'?1:0):0;
  }
  private get displayPhase(){return this.phase==='browse'&&!this.save?.active&&this.autoRun&&!this.autoRun.running&&this.autoRun.completed>0?'complete':this.phase;}
  async init(progress:(value:number,label:string)=>void=()=>{}){
    progress(.12,'Preparing the stadium');
    const savePromise=this.persistence.loadSave().catch((e:Error)=>{this.error=e.message;return null;});
    const packPromise=fetch('/assets/packs.json').then(r=>r.ok?r.json():[DEFAULT_PACK]).catch(()=>[DEFAULT_PACK]) as Promise<Pack[]>;
    const artworkPromise=fetch('/assets/pokemon/manifest.json').then(r=>r.ok?r.json():{}).catch(()=>({})) as Promise<PokemonArtwork>;
    await Promise.all([this.stage.init(),document.fonts.load('800 24px Nunito').catch(()=>{})]);if(this.destroyed)return;
    progress(.5,'Loading card sets');
    this.view=new CanvasUI(this.stage,this.syncTargets);
    this.actor.subscribe(snapshot=>{
      this.phase=String(snapshot.value);this.index=snapshot.context.index;
      this.render();const key=`${this.phase}-${this.index}`;
      if(key!==this.stateKey){this.stateKey=key;void this.runPhase();}
    });this.actor.start();
    [this.save,this.packs]=await Promise.all([savePromise,packPromise]);if(this.destroyed)return;
    this.pokemonArt=await artworkPromise;if(this.destroyed)return;
    try{
      let catalogsReady=0;
      const entries=await Promise.allSettled(this.packs.map(async pack=>{
        const response=await fetch(pack.catalogUrl);if(!response.ok)throw new Error(`Could not load ${pack.name}. Reload to retry.`);
        const raw:Omit<Card,'value'|'weight'>[]=await response.json();progress(.5+.2*++catalogsReady/this.packs.length,'Loading card sets');
        return [pack.id,raw.map(c=>{const card=priceCard(c);return {...card,value:Math.round(card.value*pack.price/DEFAULT_PACK.price)};})] as const;
      }));this.catalogs=Object.fromEntries(entries.flatMap(entry=>entry.status==='fulfilled'?[entry.value]:[]));
      if(entries.some(entry=>entry.status==='rejected'))this.error='Some sets could not load. Reload to retry.';
    }catch(e){this.error=(e as Error).message;}
    if(this.destroyed)return;
    if(this.save?.active)this.selectedId=this.save.active.pack?.id??DEFAULT_PACK.id;
    await this.preparePack();if(this.destroyed)return;
    if(this.save?.active){this.preloadOpening();this.actor.send({type:'RESUME'});}else this.render();
    progress(.72,'Preparing your packs');
    await this.view.prepareAssets(this.packs,value=>progress(.72+value*.2,'Preparing your packs'));if(this.destroyed)return;
    progress(.94,'Entering the stadium');
    await this.stage.prepareFirstFrame();if(this.destroyed)return;
    progress(1,'Ready');
  }
  private async preparePack(){
    const token=++this.packToken;this.ready=false;this.render();
    try{await this.stage.setPack(this.selected.packImage,'#82dfff');if(this.destroyed||token!==this.packToken)return;this.ready=true;if(this.phase==='sealed')this.stage.setSealed();}
    catch{if(token===this.packToken)this.error='Pack image could not load. Select another pack or reload.';}
    this.render();
  }
  private warmReveal(index:number){
    const opening=this.save?.active;if(!opening)return;
    // Keep the next card ready and prepare the next Pokémon during earlier cards / wrapper opening.
    for(let i=index;i<opening.cards.length;i++){
      const card=opening.cards[i],image=specialPokemon(card,i===0&&opening.previewSpecial?0:this.selected.price,this.pokemonArt);
      if(i===index||image)this.stage.prepareReveal(card,image,winTier(card,opening.pack?.price??this.selected.price,!!opening.previewSpecial&&i===0));
      if(image)break;
    }
  }
  private preloadOpening(){if(this.save?.active){this.stage.setShowdownOpening(this.save.active.id,this.save.active.showdownSymbols??[]);if(qualifiesForShowdown(this.save.active.showdownSymbols,this.save.active.pack?.rewardCount??10))void this.loadBonus().catch(()=>{});}this.warmReveal(0);this.save?.active?.cards.forEach((c,i)=>{void Assets.load(c.image).catch(()=>{});const art=specialPokemon(c,i===0&&this.save?.active?.previewSpecial?0:this.selected.price,this.pokemonArt);if(art)void preloadRevealAudio(art);});}
  private async runPhase(){
    const token=++this.flowToken;const phase=this.phase;
    const valid=()=>!this.destroyed&&token===this.flowToken;
    try{
      if(phase==='reserving'){
        this.save=await this.persistence.transactSave(s=>{if(s.active)throw new Error('A pack was opened in another tab. Reload to continue it.');return createCheatOpening(s,this.pool,this.selected,this.pokemonArt,this.cheats,Math.random,this.showdownArmed);});if(!valid())return;
        this.showdownArmed=false;this.preloadOpening();await this.preparePack();if(valid())this.actor.send({type:'RESERVED'});
      }else if(phase==='sealed'){if(this.ready)this.stage.setSealed();}
      else if(phase==='awaiting'){this.stage.waitForReveal();}
      else if(phase==='tearing'){await this.stage.tear();if(valid())this.actor.send({type:'TORN'});}
      else if(phase==='revealing'){
        const card=this.save?.active?.cards[this.index];if(!card)throw new Error('Opening changed. Reload to sync your game.');
        await this.stage.reveal(card,this.index===0,Math.max(0,this.index-1),specialPokemon(card,this.index===0&&this.save?.active?.previewSpecial?0:this.selected.price,this.pokemonArt),this.selected.price,this.index);if(valid()){this.error='';this.actor.send({type:'FLIPPED'});}
      }else if(phase==='revealed'){await this.view?.waitForWinRecovery();if(valid())this.warmReveal(this.index+1);
      }else if(phase==='collecting'){
        const cards=this.save?.active?.cards;if(!cards)throw new Error('Opening changed. Reload to sync your game.');
        await this.stage.collectRemaining(cards,this.index,this.groupRevealCount>0,this.selected.price);if(valid())this.actor.send({type:'COLLECTED'});
      }else if(phase==='settling'){
        const id=this.save?.active?.id;if(!id)throw new Error('Opening changed. Reload to sync your game.');
        this.save=await this.persistence.transactSave(s=>settleOpening(s,id));if(!valid())return;
        const result=this.save.history.find(opening=>opening.id===id);if(!result)throw new Error('The settled pack could not be found. Reload to sync your game.');
        this.resultId=id;this.autoRun?.record(result);this.autoFinishing=false;this.autoInterlude=!!this.autoRun&&this.autoRun.total>1;
        this.stage.showResult();this.actor.send({type:'SETTLED'});
        if(qualifiesForShowdown(result.showdownSymbols,result.pack?.rewardCount??10)&&this.bonusPlayed!==id){this.stopAuto(false);this.autoInterlude=false;this.showdownPending=true;this.openPendingShowdown();}
      }
    }catch(e){
      if(!valid())return;
      this.stopAuto(false);this.error=phase==='revealing'?'Card image could not load. Retry the reveal.':(e as Error).message;
      if(phase==='reserving'||phase==='collecting'||phase==='settling')this.actor.send({type:'FAIL'});
      this.render();
    }
  }
  private render(){
    if(this.showdown||this.showdownLoading)return;
    this.stage.setAutomatic(!!this.autoRun?.running||this.autoFinishing);
    setBattleMusic(['tearing','awaiting','revealing','revealed','collecting','settling','complete'].includes(this.displayPhase)||!!this.autoRun?.running&&this.autoRun.completed>0);setAudioScenePaused(!!this.panel||!!this.inspected);
    if(!this.view||this.destroyed)return;
    const cards=Array.from(new Map([...Object.values(this.catalogs).flat(),...(this.save?.history.flatMap(o=>o.cards)??[])].filter(c=>c.id!=='energy').map(c=>[c.id,c])).values());
    const state:UIState={phase:this.displayPhase,index:this.index,groupRevealCount:this.groupRevealCount,save:this.save,packs:this.packs,selected:this.selected,pool:this.pool,cards,ready:this.ready,error:this.error,toast:this.toast,panel:this.panel,inspected:this.inspected,result:this.autoRun?.results.find(o=>o.id===this.resultId)??this.save?.history.find(o=>o.id===this.resultId),sound:this.sound,reduced:this.reduced,turbo:this.turbo,autoCount:this.autoCount,autoMode:this.autoMode,autoRun:this.autoRun?{id:this.autoRun.id,running:this.autoRun.running,completed:this.autoRun.completed,total:this.autoRun.total,totalWon:this.autoRun.totalWon,results:this.autoRun.results,interlude:this.autoInterlude}:undefined,configureAuto:this.configureAuto,cheats:this.cheats,setCheats:this.setCheats,low:this.low,action:this.action,select:this.select,inspect:card=>{this.inspected=card;this.render();}};
    this.view.update(state);this.scheduleAuto();
  }
  private syncTargets=(hits:HitTarget[],summary:string)=>{
    const old=document.activeElement instanceof HTMLButtonElement?document.activeElement.dataset.control:undefined;
    this.controls.replaceChildren();
    for(const hit of hits){const button=document.createElement('button');button.type='button';button.dataset.control=hit.id;button.setAttribute('aria-label',hit.label);button.disabled=hit.disabled;if(hit.selected!==undefined)button.setAttribute('aria-pressed',String(hit.selected));
      Object.assign(button.style,{left:`${hit.x}px`,top:`${hit.y}px`,width:`${hit.width}px`,height:`${hit.height}px`});
      button.onclick=()=>{this.view?.setFocus(null);hit.action();};button.onfocus=()=>{if(this.keyboard)this.view?.setFocus(hit.id);};button.onblur=()=>this.view?.setFocus(null);
      button.style.zIndex='1';button.onpointerdown=()=>this.view?.press(hit.id,true);button.onpointerup=()=>this.view?.press(hit.id,false);button.onpointerenter=event=>{if(event.pointerType==='mouse')this.view?.hover(hit.id,true);};button.onpointerleave=event=>{if(event.pointerType==='mouse')this.view?.hover(hit.id,false);};this.controls.append(button);
      if(this.keyboard&&old===hit.id&&!hit.disabled)button.focus({preventScroll:true});
    }
    this.announcer.textContent=summary;
  };
  private select=(pack:Pack)=>{
    if(this.opening||this.autoRun?.running||this.showdown||this.showdownLoading)return;
    if(this.displayPhase==='complete')this.dismissResults();
    playSound('ui');this.selectedId=pack.id;this.error='';void this.preparePack();
  };
  private notify(message:string){clearTimeout(this.toastTimer);this.toast=message;this.render();this.toastTimer=window.setTimeout(()=>{this.toast='';this.render();},2200);}
  private async addCredits(){
    try{this.save=await this.persistence.transactSave(s=>{if(this.opening&&s.active?.id!==this.save?.active?.id)throw new Error('This opening changed in another tab. Reload to sync.');return {...s,balance:s.balance+100000};});this.error='';this.notify('$1,000 demo credits added');}
    catch(e){this.error=(e as Error).message;this.render();}
  }
  private export(){
    const cards=Object.values(this.catalogs).flat().filter(c=>this.save?.collection[c.id]).map(c=>({id:c.id,name:c.name,number:c.number,copies:this.save!.collection[c.id]}));
    const url=URL.createObjectURL(new Blob([JSON.stringify(cards,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='pokemon-collection.json';a.click();URL.revokeObjectURL(url);
  }
  private settings(){setSound(this.sound);try{localStorage.setItem('legends-settings',JSON.stringify({sound:this.sound,turbo:this.turbo,low:this.low}));}catch{/* Memory-only settings. */}this.stage.updateOptions({reduced:this.reduced,turbo:this.turbo,low:this.low,onTear:()=>this.action('tear'),onNext:()=>this.action('next')});}
  /** Demo cheats choose what the next pack holds; they stay chosen until changed or reset. */
  private setCheats=(patch:Partial<Cheats>)=>{const legendary=this.legendary;this.cheats={...this.cheats,...patch};this.render();if(this.prefetch&&this.legendary!==legendary)void this.prefetch.warm(this.legendary,400);};
  private configureAuto=(count:number,mode:AutoRevealMode)=>{if(this.autoRun?.running)return;this.autoCount=count;this.autoMode=mode;this.render();};
  private startAuto(){
    if(this.autoRun?.running||this.autoInterlude||this.opening||!this.ready||!this.save||!this.pool.length)return;
    if(this.save.balance<this.selected.price){this.error='Not enough demo credits for this pack.';this.render();return;}
    try{this.autoRun=new AutoSpinSession(this.autoCount,this.autoMode);}catch{return;}
    this.cancelAutoTimer();this.autoInterlude=false;this.autoFinishing=false;this.resultId=null;
    this.panel=null;this.error='';if(this.phase==='complete'){this.stage.reset();this.actor.send({type:'RESET'});}this.render();
  }
  private cancelAutoTimer(){clearTimeout(this.autoTimer);++this.autoTimerToken;}
  private dismissResults(){
    this.cancelAutoTimer();this.autoRun=null;this.autoInterlude=false;this.autoFinishing=false;this.resultId=null;
    this.stage.reset();this.actor.send({type:'RESET'});this.render();
  }
  private stopAuto(notify=true){
    this.cancelAutoTimer();this.autoFinishing=notify&&!!this.autoRun&&this.opening&&!this.error;this.autoRun?.stop();
    if(notify)this.notify(this.autoFinishing?'Auto Spin stopped · finishing this pack':'Auto Spin stopped');
  }
  private scheduleAuto=()=>{
    this.cancelAutoTimer();
    if(this.destroyed||document.hidden||this.panel||this.inspected||this.error||!this.autoRun||this.showdown||this.showdownLoading)return;
    const session=this.autoRun,phase=this.phase,index=this.index;
    const timerToken=this.autoTimerToken;
    const valid=()=>!this.destroyed&&!document.hidden&&!this.panel&&!this.inspected&&!this.error&&timerToken===this.autoTimerToken&&session===this.autoRun&&this.phase===phase&&this.index===index;
    if(this.autoInterlude&&phase==='complete'){
      this.autoTimer=window.setTimeout(()=>{
        if(!valid()||!this.autoInterlude)return;
        this.autoInterlude=false;
        if(session.running){
          if(!this.save||this.save.balance<this.selected.price){session.stop();this.notify('Auto Spin stopped · not enough credits');return;}
          this.view?.beginAutoPackTransition();this.stage.reset();this.actor.send({type:'RESET'});
        }else this.render();
      },autoInterludeDelay(this.turbo,this.reduced));
      return;
    }
    const action=session.next(this.phase,this.autoFinishing);if(!action||!this.ready||this.bonusDue)return;
    if(action==='open'&&(!this.save||this.save.balance<this.selected.price)){session.stop();this.notify('Auto Spin stopped · not enough credits');return;}
    const card=this.save?.active?.cards[this.index],big=card&&winTier(card,this.selected.price,!!this.save?.active?.previewSpecial&&this.index===0);
    const delay=this.turbo?180:action==='next'?(phase==='awaiting'?180:big&&big!=='special'?(WIN_CINEMA_FINISH+.4)/openingAnimationRate(false,true)*1000:big?1450:session.mode==='all'?520:780):action==='all'?600:action==='continue'?650:380;
    this.autoTimer=window.setTimeout(()=>{
      if(!valid()||session.next(this.phase,this.autoFinishing)!==action)return;
      if(action==='continue'){this.stage.reset();this.actor.send({type:'RESET'});}
      else this.actor.send({type:({open:'OPEN',tear:'TEAR',next:'NEXT',all:'ALL'} as const)[action]});
    },delay);
  };
  action=(type:GameAction)=>{
    if(this.destroyed||this.host.inert||this.showdown||this.showdownLoading)return;
    if(type==='next'||type==='all'){
      // Taps that arrive while the third ball is on its way, or in the instant after the encounter hands back, do nothing.
      // The wait is bounded, so a ball that somehow never lands cannot hold the pack.
      const now=performance.now();if(now<this.bonusQuiet)return;
      if(this.bonusDue){this.bonusDueAt||=now;if(now-this.bonusDueAt<8000)return;}else this.bonusDueAt=0;
    }
    if(this.autoInterlude&&!this.panel&&!this.inspected&&(type==='continue'||type==='close'))return;
    if(this.autoRun?.running&&['open','cheats-open','tear','all','continue','reset'].includes(type))return;
    if(!['sound','next','all','tear'].includes(type))playSound('ui');
    const unobscured=!this.panel&&!this.inspected;
    switch(type){
      case 'showdown':void this.openShowdown('buy');return;
      case 'close':if(this.inspected)this.inspected=null;else if(this.panel)this.panel=null;else if(this.displayPhase==='complete'){if(!this.autoRun?.running)this.dismissResults();return;}break;
      case 'collection':this.panel='collection';break;
      case 'settings':this.panel='settings';break;
      case 'history':this.panel='history';break;
      case 'about':this.panel='about';break;
      case 'cheats':this.panel='cheats';break;
      case 'cheats-reset':this.cheats={...NO_CHEATS};break;
      // Straight from the cheats panel into the pack it describes.
      case 'cheats-open':this.panel=null;this.inspected=null;if(this.ready&&this.save&&this.pool.length&&!this.opening){this.dismissResults();this.error='';this.actor.send({type:'OPEN'});return;}break;
      case 'credits':void this.addCredits();return;
      case 'sound':this.sound=!this.sound;this.settings();if(this.sound)playSound('credit');break;
      case 'turbo':this.turbo=!this.turbo;this.settings();break;
      case 'auto':if(!this.autoRun?.running&&!this.opening)this.panel='auto';break;
      case 'auto-start':this.startAuto();return;
      case 'auto-stop':this.stopAuto();return;
      case 'low':this.low=!this.low;this.settings();break;
      case 'export':this.export();return;
      case 'retry':this.error='';void this.runPhase();break;
      case 'dismiss':this.error='';break;
      case 'fullscreen':if(document.fullscreenElement)void document.exitFullscreen();else void this.host.requestFullscreen().catch(()=>this.notify('Full screen is unavailable.'));return;
      case 'reset':if(!this.opening)void this.persistence.resetSave().then(s=>{this.save=s;this.error='';this.panel=null;this.showdownPending=false;this.showdownArmed=false;this.dismissResults();}).catch(()=>{this.error='Browser storage unavailable.';this.render();});return;
      case 'continue':this.dismissResults();return;
      case 'open':if(this.ready&&this.save&&this.pool.length&&unobscured){if(!this.opening)this.dismissResults();this.error='';this.actor.send({type:'OPEN'});}return;
      case 'tear':if(this.ready&&unobscured)this.actor.send({type:'TEAR'});return;
      case 'next':if(unobscured){this.cancelAutoTimer();if(this.phase==='revealing')this.stage.skipReveal();else this.actor.send({type:'NEXT'});}return;
      case 'all':if(unobscured)this.actor.send({type:'ALL'});return;
    }
    this.render();this.openPendingShowdown();
  };
  /** True from the moment the card carrying this pack's third bonus ball starts to reveal until its encounter has played.
   * The pack cannot be advanced in that window, however fast the player taps. */
  private get bonusDue(){
    const opening=this.save?.active;if(!opening||!this.bonusFrame||this.bonusPlayed===opening.id||!['revealing','revealed'].includes(this.phase))return false;
    const symbols=opening.showdownSymbols??[];return qualifiesForShowdown(symbols,opening.pack?.rewardCount??10)&&this.index>=Math.max(...symbols);
  }
  /** The third bonus ball has landed. With cards revealed one at a time the encounter opens right there and the pack resumes
   * at the same card; when the rest of the pack is being opened at once it waits for that reveal to finish. */
  private bonusReady=()=>{
    if(this.destroyed||!this.save?.active)return;
    if(this.phase==='collecting'||this.phase==='settling'||this.panel||this.inspected){this.showdownPending=true;return;}
    void this.openShowdown('trigger');
  };
  private openPendingShowdown(){
    if(this.showdownPending&&!this.panel&&!this.inspected&&(!this.opening||this.bonusDue)&&(!this.autoRun?.running||this.bonusDue)&&!this.showdown&&!this.showdownLoading)void this.openShowdown('trigger');
  }
  /** The legendary is the one chosen in the cheats panel (Lugia unless changed); `?legendary=mewtwo` still forces Mewtwo. */
  private get legendary():BonusSpecies{return typeof location!=='undefined'&&new URLSearchParams(location.search).get('legendary')==='mewtwo'?'mewtwo':this.cheats.legendary;}
  private prefetch:BonusPrefetch|null=null;private bonusBooting=false;private bonusLoaded=0;
  /** Once the game is up, the encounter's files are fetched into the browser's cache in the background (see `BonusPrefetch`),
   * so the first Bonus Buy or triggered encounter reads them from the device instead of waiting on the network. */
  warmBonus(){this.prefetch??=new BonusPrefetch(()=>this.bonusBooting);void this.prefetch.warm(this.legendary);}
  /** The encounter scene lives in its own page; it is loaded once, hidden, and driven through `captureDemo`. */
  private loadBonus(){
    // The scene shows the reward for the pack being opened: a different pack price needs the scene loaded again.
    // It also takes the shape of the screen when it loads; a screen that has turned or changed a lot gets a fresh one.
    const stake=this.selected.price,shape=Math.max(.4,Math.min(2.6,this.host.clientWidth/Math.max(1,this.host.clientHeight)))||.75,turned=Math.abs(Math.log(shape/(this.bonusShape||shape)))>.18;
    const species=this.legendary;
    if(this.bonusDemo&&(this.bonusStake!==stake||turned||this.bonusSpecies!==species)&&!this.showdown&&!this.showdownLoading){this.bonusDemo=null;this.bonusFrame?.remove();this.bonusFrame=null;}
    return this.bonusDemo??=new Promise<CaptureDemo>((resolve,reject)=>{
      const frame=this.bonusFrame=document.createElement('iframe');this.bonusStake=stake;this.bonusShape=shape;this.bonusSpecies=species;this.bonusBooting=true;this.bonusLoaded=0;
      frame.title='Legendary encounter';frame.allow='autoplay';frame.tabIndex=-1;frame.src=`${BONUS_SCENE}index.html?pokemon=${species}&embed=1&bet=${stake/100}&aspect=${shape.toFixed(3)}`;
      Object.assign(frame.style,{position:'absolute',border:'0',visibility:'hidden',zIndex:'6',background:'transparent'});
      Object.assign(this.bonusShade.style,{position:'absolute',inset:'0',background:'#061624',opacity:'0',transition:'opacity .35s ease',pointerEvents:'none',zIndex:'5',visibility:'hidden'});
      this.host.append(this.bonusShade,frame);
      const started=performance.now(),poll=()=>{const page=frame.contentWindow as (Window&{captureDemo?:CaptureDemo;captureLoad?:{progress:number}})|null,demo=page?.captureDemo;this.bonusLoaded=demo?1:page?.captureLoad?.progress??0;
        if(this.destroyed)reject(new Error('closed'));else if(demo)resolve(demo);else if(performance.now()-started>45000)reject(new Error('The encounter scene did not load.'));else setTimeout(poll,60);};
      frame.addEventListener('error',()=>reject(new Error('The encounter scene could not load.')));poll();
    }).finally(()=>{this.bonusBooting=false;}).catch(error=>{this.bonusDemo=null;this.bonusFrame?.remove();this.bonusFrame=null;this.bonusShade.remove();throw error;});
  }
  private placeBonus(){const box=bonusFrameBox(this.host.clientWidth,this.host.clientHeight,this.bonusAspect);if(this.bonusFrame)Object.assign(this.bonusFrame.style,{left:box.x+'px',top:box.y+'px',width:box.width+'px',height:box.height+'px'});return box;}
  private async openShowdown(entry:'buy'|'trigger'){
    if(this.destroyed||this.showdown||this.showdownLoading||this.panel||this.inspected)return;
    if(entry==='buy'&&(this.opening||this.autoRun?.running))return;
    const openingId=this.save?.active?.id??this.resultId??'',pause=(ms:number)=>new Promise<void>(resolve=>setTimeout(resolve,ms));
    this.showdownLoading=true;this.showdownPending=false;this.cancelAutoTimer();this.controls.inert=true;
    const freeze=document.createElement('canvas');freeze.width=720;freeze.height=960;let closed=false;
    const restore=()=>{if(closed)return;closed=true;removeEventListener('resize',resize);if(this.bonusFrame)this.bonusFrame.style.visibility='hidden';this.bonusShade.style.opacity='0';this.bonusShade.style.visibility='hidden';
      this.stage.setCovered(false);this.stage.finishBonusTransfer();this.controls.inert=false;this.stage.setBlocked(false);setSound(this.sound);this.showdown=null;};
    const resize=()=>this.placeBonus();
    // An encounter that is not on the device yet says so at once: the tap is answered with a loader and its progress, not a still screen.
    // A bought preview starts from the idle game, which is paused underneath so the encounter's start-up has the whole device.
    const loader=new BonusLoader(this.host,bonusName(this.legendary));let waiting:ReturnType<typeof setTimeout>|undefined,pauseUnder:ReturnType<typeof setTimeout>|undefined,reporting:ReturnType<typeof setInterval>|undefined;
    try{
      // A win being presented on this card finishes first; the encounter never opens over it.
      if(entry==='trigger'){await this.view?.waitForWinRecovery();await pause(650);if(this.destroyed)return;}
      // A scene already loaded answers within the moment and the loader never appears.
      waiting=setTimeout(()=>{if(closed||this.destroyed)return;loader.progress(.04);loader.show();this.announcer.textContent='Loading the legendary encounter.';
        if(entry==='buy')pauseUnder=setTimeout(()=>{if(!closed&&loader.visible)this.stage.setBlocked(true);},240);},140);
      reporting=setInterval(()=>loader.progress(.04+.86*this.bonusLoaded),100);
      const [demo,receiver]=await Promise.all([this.loadBonus(),Assets.load<Texture>(BONUS_SCENE+'assets/receiver.webp')]);clearTimeout(waiting);clearInterval(reporting);if(this.destroyed)return;
      loader.progress(.94);if(entry==='trigger')loader.hide();
      const size=demo.size;this.bonusAspect=size.width/size.height;freeze.width=size.width;freeze.height=size.height;const box=this.placeBonus();addEventListener('resize',resize);
      this.stage.blocked=true;if(entry==='trigger')await this.stage.bonusTransfer(receiver);if(this.destroyed)return;
      // Entry is drawn from the pack as it looks now (with the receiver); exit returns to the pack without it.
      this.stage.snapshot(freeze,box.x,box.y,box.width,box.height);this.stage.setBlocked(true);setSound(false);demo.setMuted(!this.sound);demo.setEntryBackdrop(freeze);
      this.stage.finishBonusTransfer();this.stage.setBonusCollectorBlocked(false);this.stage.snapshot(freeze,box.x,box.y,box.width,box.height);demo.setExitBackdrop(freeze);this.stage.setBonusCollectorBlocked(true);
      // The throw ends as chosen in the cheats panel; otherwise `?outcome=` decides, otherwise chance.
      const forced=this.cheats.bonus==='capture'||this.cheats.bonus==='escape'?this.cheats.bonus:new URLSearchParams(location.search).get('outcome');
      await demo.start(forced==='capture'||forced==='escape'?forced:'random');if(this.destroyed)return;
      this.showdown={destroy:()=>{demo.stop();restore();}};this.bonusPlayed=openingId;this.bonusShade.style.visibility='visible';this.bonusShade.style.opacity=box.letterboxed?'.88':'0';this.bonusFrame!.style.visibility='visible';this.stage.setCovered(true);this.bonusFrame!.focus({preventScroll:true});loader.hide();
      this.announcer.textContent='Legendary encounter. Throw the Poké Ball to try to catch it.';
      while(demo.running&&!this.destroyed&&!closed)await pause(60);
      // A catch in a pack's own bonus pays that pack: the amount joins its total and reaches the wallet when the pack settles
      // (or at once, if the pack had already settled). A bought preview pays nothing.
      if(entry==='trigger'&&!this.destroyed&&demo.outcome==='capture'&&openingId){
        const reward=demo.reward,bonus={name:reward.name,image:reward.image,multiplier:reward.multiplier,amount:reward.multiplier*this.bonusStake};
        const before=this.save;this.save=await this.persistence.transactSave(s=>awardBonus(s,openingId,bonus));
        if(this.save!==before)this.bonusAward=bonus.amount;
      }
      await pause(300);
    }catch(error){
      this.error='The encounter could not load. Please try again.';console.error('Legendary encounter failed',error);
    }finally{
      clearTimeout(waiting);clearTimeout(pauseUnder);clearInterval(reporting);loader.hide();
      restore();this.showdownLoading=false;this.bonusDueAt=0;this.bonusQuiet=performance.now()+450;
      // Back on the pack: the catch is paid into the running total in front of the player.
      if(this.bonusAward&&!this.destroyed){const amount=this.bonusAward;this.bonusAward=0;this.view?.awardBonus(amount);}
      if(!this.destroyed){this.render();this.controls.querySelector<HTMLButtonElement>('[data-control="next"], [data-control="showdown"], [data-control="result-continue"]')?.focus({preventScroll:true});}
    }
  }
  destroy(){this.showdown?.destroy();this.showdown=null;this.host.removeEventListener('legendary-bonus-ready',this.bonusReady);this.bonusFrame?.remove();this.bonusShade.remove();this.prefetch?.destroy();this.stopAuto(false);document.removeEventListener('visibilitychange',this.scheduleAuto);destroyAudio();this.destroyed=true;++this.flowToken;++this.packToken;clearTimeout(this.toastTimer);this.actor.stop();this.view?.destroy();this.stage.destroy();this.controls.remove();this.announcer.remove();document.removeEventListener('keydown',this.trackKeys);document.removeEventListener('pointerdown',this.trackPointer);}
}
