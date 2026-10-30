import { createActor } from 'xstate';
import { Assets } from 'pixi.js';
import { OpeningStage } from './Stage';
import { CanvasUI, type UIState, type HitTarget, type GameAction, type Panel } from './CanvasUI';
import { openingMachine } from './machine';
import { settleOpening, priceCard, DEFAULT_PACK, type Card, type Save, type Pack } from './model';
import { loadSave, transactSave, resetSave } from './storage';
import {winTier} from './winTransfer';
import { setSound, setBattleMusic,playSound,setAudioScenePaused,destroyAudio,preloadRevealAudio,unlockAudio } from './audio';
import { specialPokemon,type PokemonArtwork } from './specialReward';
import { createPreviewOpening } from './previewOpening';
import {AutoSpinSession,type AutoRevealMode} from './autoSpin';

/** Discrete game state and persistence. Pixi owns every visible screen and frame. */
export class PokemonGame {
  private stage:OpeningStage;private view:CanvasUI|null=null;
  private actor=createActor(openingMachine);private phase='browse';private index=0;
  private save:Save|null=null;private packs:Pack[]=[DEFAULT_PACK];private catalogs:Record<string,Card[]>={};
  private selectedId=DEFAULT_PACK.id;private ready=false;private error='';private toast='';
  private panel:Panel=null;private inspected:Card|null=null;private resultId:string|null=null;
  private sound=false;private reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;private low=false;
  private turbo=false;private autoCount=5;private autoMode:AutoRevealMode='individual';private autoRun:AutoSpinSession|null=null;private autoTimer=0;
  private flowToken=0;private packToken=0;private destroyed=false;private toastTimer=0;private stateKey='';
  private controls=document.createElement('div');private announcer=document.createElement('p');private keyboard=false;
  private pokemonArt:PokemonArtwork={};
  constructor(private host:HTMLElement,private persistence={loadSave,transactSave,resetSave}){
    try{const settings=JSON.parse(localStorage.getItem('legends-settings')??'{}');this.sound=!!settings.sound;this.turbo=!!(settings.turbo??settings.reduced);this.low=!!settings.low;}catch{/* Use device defaults. */}
    setSound(this.sound);
    this.stage=new OpeningStage(host,{reduced:this.reduced,turbo:this.turbo,low:this.low,onTear:()=>this.action('tear'),onNext:()=>this.action('next')});
    this.controls.className='game-accessibility';this.controls.setAttribute('aria-label','Game controls');
    this.announcer.className='screen-reader';this.announcer.setAttribute('role','status');this.announcer.setAttribute('aria-live','polite');
    host.append(this.controls,this.announcer);document.addEventListener('keydown',this.trackKeys);document.addEventListener('pointerdown',this.trackPointer);document.addEventListener('visibilitychange',this.scheduleAuto);
  }
  private trackKeys=(event:KeyboardEvent)=>{unlockAudio();if(event.key==='Tab')this.keyboard=true;};
  private trackPointer=()=>{unlockAudio();this.keyboard=false;this.view?.setFocus(null);};
  private get selected(){return this.save?.active?.pack??this.packs.find(p=>p.id===this.selectedId)??DEFAULT_PACK;}
  private get pool(){return this.catalogs[this.selected.id]??[];}
  private get opening(){return !['browse','complete'].includes(this.phase);}
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
      if(i===index||image)this.stage.prepareReveal(card,image);
      if(image)break;
    }
  }
  private preloadOpening(){this.warmReveal(0);this.save?.active?.cards.forEach((c,i)=>{void Assets.load(c.image).catch(()=>{});const art=specialPokemon(c,i===0&&this.save?.active?.previewSpecial?0:this.selected.price,this.pokemonArt);if(art)void preloadRevealAudio(art);});}
  private async runPhase(){
    const token=++this.flowToken;const phase=this.phase;
    const valid=()=>!this.destroyed&&token===this.flowToken;
    try{
      if(phase==='reserving'){
        this.save=await this.persistence.transactSave(s=>{if(s.active)throw new Error('A pack was opened in another tab. Reload to continue it.');return createPreviewOpening(s,this.pool,this.selected,this.pokemonArt);});if(!valid())return;
        this.preloadOpening();await this.preparePack();if(valid())this.actor.send({type:'RESERVED'});
      }else if(phase==='sealed'){if(this.ready)this.stage.setSealed();}
      else if(phase==='awaiting'){this.stage.waitForReveal();}
      else if(phase==='tearing'){await this.stage.tear();if(valid())this.actor.send({type:'TORN'});}
      else if(phase==='revealing'){
        const card=this.save?.active?.cards[this.index];if(!card)throw new Error('Opening changed. Reload to sync your game.');
        await this.stage.reveal(card,this.index===0,Math.max(0,this.index-1),specialPokemon(card,this.index===0&&this.save?.active?.previewSpecial?0:this.selected.price,this.pokemonArt),this.selected.price);if(valid()){this.error='';this.actor.send({type:'FLIPPED'});}
      }else if(phase==='revealed'){this.warmReveal(this.index+1);
      }else if(phase==='collecting'){
        const cards=this.save?.active?.cards;if(!cards)throw new Error('Opening changed. Reload to sync your game.');
        await this.stage.collectRemaining(cards,this.index);if(valid())this.actor.send({type:'COLLECTED'});
      }else if(phase==='settling'){
        const id=this.save?.active?.id;if(!id)throw new Error('Opening changed. Reload to sync your game.');
        this.save=await this.persistence.transactSave(s=>settleOpening(s,id));if(!valid())return;
        this.resultId=id;this.autoRun?.record(id);this.stage.showResult();this.actor.send({type:'SETTLED'});if(this.autoRun?.running||this.reduced)playSound('complete');
      }
    }catch(e){
      if(!valid())return;
      this.stopAuto(false);this.error=phase==='revealing'?'Card image could not load. Retry the reveal.':(e as Error).message;
      if(phase==='reserving'||phase==='collecting'||phase==='settling')this.actor.send({type:'FAIL'});
      this.render();
    }
  }
  private render(){
    setBattleMusic(['tearing','awaiting','revealing','revealed','collecting','settling','complete'].includes(this.phase));setAudioScenePaused(!!this.panel||!!this.inspected);
    if(!this.view||this.destroyed)return;
    const cards=Array.from(new Map([...Object.values(this.catalogs).flat(),...(this.save?.history.flatMap(o=>o.cards)??[])].filter(c=>c.id!=='energy').map(c=>[c.id,c])).values());
    const state:UIState={phase:this.phase,index:this.index,save:this.save,packs:this.packs,selected:this.selected,pool:this.pool,cards,ready:this.ready,error:this.error,toast:this.toast,panel:this.panel,inspected:this.inspected,result:this.save?.history.find(o=>o.id===this.resultId),sound:this.sound,reduced:this.reduced,turbo:this.turbo,autoCount:this.autoCount,autoMode:this.autoMode,autoRun:this.autoRun?{running:this.autoRun.running,completed:this.autoRun.completed,total:this.autoRun.total}:undefined,configureAuto:this.configureAuto,low:this.low,action:this.action,select:this.select,inspect:card=>{this.inspected=card;this.render();}};
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
    if(this.opening||this.autoRun?.running)return;
    if(this.phase==='complete'){this.stage.reset();this.actor.send({type:'RESET'});}
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
  private configureAuto=(count:number,mode:AutoRevealMode)=>{if(this.autoRun?.running)return;this.autoCount=count;this.autoMode=mode;this.render();};
  private startAuto(){
    if(this.autoRun?.running||this.opening||!this.ready||!this.save||!this.pool.length)return;
    if(this.save.balance<this.selected.price){this.error='Not enough demo credits for this pack.';this.render();return;}
    try{this.autoRun=new AutoSpinSession(this.autoCount,this.autoMode);}catch{return;}
    this.panel=null;this.error='';if(this.phase==='complete'){this.stage.reset();this.actor.send({type:'RESET'});}this.render();
  }
  private stopAuto(notify=true){clearTimeout(this.autoTimer);this.autoRun?.stop();if(notify)this.notify('Auto Spin stopped');}
  private scheduleAuto=()=>{
    clearTimeout(this.autoTimer);
    if(this.destroyed||document.hidden||this.panel||this.inspected||this.error||!this.autoRun?.running)return;
    const action=this.autoRun.next(this.phase);if(!action||!this.ready)return;
    if(action==='open'&&(!this.save||this.save.balance<this.selected.price)){this.autoRun.stop();this.notify('Auto Spin stopped · not enough credits');return;}
    const session=this.autoRun,phase=this.phase,index=this.index;
    const card=this.save?.active?.cards[this.index],big=card&&winTier(card,this.selected.price,!!this.save?.active?.previewSpecial&&this.index===0);
    const delay=this.turbo?180:action==='next'?(big?2200:1400):action==='all'?600:action==='continue'?650:380;
    this.autoTimer=window.setTimeout(()=>{
      if(this.destroyed||document.hidden||this.panel||this.inspected||session!==this.autoRun||!session.running||this.phase!==phase||this.index!==index)return;
      if(action==='continue'){this.stage.reset();this.actor.send({type:'RESET'});}
      else this.actor.send({type:({open:'OPEN',tear:'TEAR',next:'NEXT',all:'ALL'} as const)[action]});
    },delay);
  };
  action=(type:GameAction)=>{
    if(this.destroyed||this.host.inert)return;
    if(this.autoRun?.running&&['open','tear','all','continue','reset'].includes(type))return;
    if(!['sound','next','all','tear'].includes(type))playSound('ui');
    const unobscured=!this.panel&&!this.inspected;
    switch(type){
      case 'close':if(this.inspected)this.inspected=null;else if(this.panel)this.panel=null;else if(this.phase==='complete'){this.stage.reset();this.actor.send({type:'RESET'});return;}break;
      case 'collection':this.panel='collection';break;
      case 'settings':this.panel='settings';break;
      case 'history':this.panel='history';break;
      case 'about':this.panel='about';break;
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
      case 'reset':if(!this.opening)void this.persistence.resetSave().then(s=>{this.save=s;this.error='';this.panel=null;this.stage.reset();if(this.phase==='complete')this.actor.send({type:'RESET'});this.render();}).catch(()=>{this.error='Browser storage unavailable.';this.render();});return;
      case 'continue':this.stage.reset();this.actor.send({type:'RESET'});return;
      case 'open':if(this.ready&&this.save&&this.pool.length&&unobscured){this.error='';this.actor.send({type:'OPEN'});}return;
      case 'tear':if(this.ready&&unobscured)this.actor.send({type:'TEAR'});return;
      case 'next':if(unobscured){clearTimeout(this.autoTimer);if(this.phase==='revealing')this.stage.skipReveal();else this.actor.send({type:'NEXT'});}return;
      case 'all':if(unobscured)this.actor.send({type:'ALL'});return;
    }
    this.render();
  };
  destroy(){this.stopAuto(false);document.removeEventListener('visibilitychange',this.scheduleAuto);destroyAudio();this.destroyed=true;++this.flowToken;++this.packToken;clearTimeout(this.toastTimer);this.actor.stop();this.view?.destroy();this.stage.destroy();this.controls.remove();this.announcer.remove();document.removeEventListener('keydown',this.trackKeys);document.removeEventListener('pointerdown',this.trackPointer);}
}
