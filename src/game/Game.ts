import { createActor } from 'xstate';
import { Assets } from 'pixi.js';
import { OpeningStage } from './Stage';
import { CanvasUI, type UIState, type HitTarget, type GameAction, type Panel } from './CanvasUI';
import { openingMachine } from './machine';
import { settleOpening, priceCard, DEFAULT_PACK, type Card, type Save, type Pack } from './model';
import { loadSave, transactSave, resetSave } from './storage';
import { setSound, playSound,setAudioScenePaused,destroyAudio,preloadRevealAudio,unlockAudio } from './audio';
import { specialPokemon,type PokemonArtwork } from './specialReward';
import { createPreviewOpening } from './previewOpening';

/** Discrete game state and persistence. Pixi owns every visible screen and frame. */
export class PokemonGame {
  private stage:OpeningStage;private view:CanvasUI|null=null;
  private actor=createActor(openingMachine);private phase='browse';private index=0;
  private save:Save|null=null;private packs:Pack[]=[DEFAULT_PACK];private catalogs:Record<string,Card[]>={};
  private selectedId=DEFAULT_PACK.id;private ready=false;private error='';private toast='';
  private panel:Panel=null;private inspected:Card|null=null;private resultId:string|null=null;
  private sound=false;private reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;private low=false;
  private flowToken=0;private packToken=0;private destroyed=false;private toastTimer=0;private stateKey='';
  private controls=document.createElement('div');private announcer=document.createElement('p');private keyboard=false;
  private pokemonArt:PokemonArtwork={};
  constructor(private host:HTMLElement){
    try{const settings=JSON.parse(localStorage.getItem('legends-settings')??'{}');this.sound=!!settings.sound;this.reduced ||= !!settings.reduced;this.low=!!settings.low;}catch{/* Use device defaults. */}
    setSound(this.sound);
    this.stage=new OpeningStage(host,{reduced:this.reduced,low:this.low,onTear:()=>this.action('tear'),onNext:()=>this.action('next')});
    this.controls.className='game-accessibility';this.controls.setAttribute('aria-label','Game controls');
    this.announcer.className='screen-reader';this.announcer.setAttribute('role','status');this.announcer.setAttribute('aria-live','polite');
    host.append(this.controls,this.announcer);document.addEventListener('keydown',this.trackKeys);document.addEventListener('pointerdown',this.trackPointer);
  }
  private trackKeys=(event:KeyboardEvent)=>{unlockAudio();if(event.key==='Tab')this.keyboard=true;};
  private trackPointer=()=>{unlockAudio();this.keyboard=false;this.view?.setFocus(null);};
  private get selected(){return this.save?.active?.pack??this.packs.find(p=>p.id===this.selectedId)??DEFAULT_PACK;}
  private get pool(){return this.catalogs[this.selected.id]??[];}
  private get opening(){return !['browse','complete'].includes(this.phase);}
  async init(){
    const savePromise=loadSave().catch((e:Error)=>{this.error=e.message;return null;});
    const packPromise=fetch('/assets/packs.json').then(r=>r.ok?r.json():[DEFAULT_PACK]).catch(()=>[DEFAULT_PACK]) as Promise<Pack[]>;
    const artworkPromise=fetch('/assets/pokemon/manifest.json').then(r=>r.ok?r.json():{}).catch(()=>({})) as Promise<PokemonArtwork>;
    await Promise.all([this.stage.init(),document.fonts.load('800 24px Nunito').catch(()=>{})]);if(this.destroyed)return;
    this.view=new CanvasUI(this.stage,this.syncTargets);
    this.actor.subscribe(snapshot=>{
      this.phase=String(snapshot.value);this.index=snapshot.context.index;
      this.render();const key=`${this.phase}-${this.index}`;
      if(key!==this.stateKey){this.stateKey=key;void this.runPhase();}
    });this.actor.start();
    [this.save,this.packs]=await Promise.all([savePromise,packPromise]);if(this.destroyed)return;
    this.pokemonArt=await artworkPromise;if(this.destroyed)return;
    try{
      const entries=await Promise.allSettled(this.packs.map(async pack=>{
        const response=await fetch(pack.catalogUrl);if(!response.ok)throw new Error(`Could not load ${pack.name}. Reload to retry.`);
        const raw:Omit<Card,'value'|'weight'>[]=await response.json();
        return [pack.id,raw.map(c=>{const card=priceCard(c);return {...card,value:Math.round(card.value*pack.price/DEFAULT_PACK.price)};})] as const;
      }));this.catalogs=Object.fromEntries(entries.flatMap(entry=>entry.status==='fulfilled'?[entry.value]:[]));
      if(entries.some(entry=>entry.status==='rejected'))this.error='Some sets could not load. Reload to retry.';
    }catch(e){this.error=(e as Error).message;}
    if(this.destroyed)return;
    if(this.save?.active)this.selectedId=this.save.active.pack?.id??DEFAULT_PACK.id;
    await this.preparePack();if(this.destroyed)return;
    if(this.save?.active){this.preloadOpening();this.actor.send({type:'RESUME'});}else this.render();
  }
  private async preparePack(){
    const token=++this.packToken;this.ready=false;this.render();
    try{await this.stage.setPack(this.selected.packImage,'#82dfff');if(this.destroyed||token!==this.packToken)return;this.ready=true;if(this.phase==='sealed')this.stage.setSealed();}
    catch{if(token===this.packToken)this.error='Pack image could not load. Select another pack or reload.';}
    this.render();
  }
  private preloadOpening(){this.save?.active?.cards.forEach((c,i)=>{void Assets.load(c.image).catch(()=>{});const art=specialPokemon(c,i===0&&this.save?.active?.previewSpecial?0:this.selected.price,this.pokemonArt);if(art)void preloadRevealAudio(art);});}
  private async runPhase(){
    const token=++this.flowToken;const phase=this.phase;
    const valid=()=>!this.destroyed&&token===this.flowToken;
    try{
      if(phase==='reserving'){
        this.save=await transactSave(s=>createPreviewOpening(s,this.pool,this.selected,this.pokemonArt));if(!valid())return;
        this.preloadOpening();await this.preparePack();if(valid())this.actor.send({type:'RESERVED'});
      }else if(phase==='sealed'){if(this.ready)this.stage.setSealed();}
      else if(phase==='tearing'){await this.stage.tear();if(valid())this.actor.send({type:'TORN'});}
      else if(phase==='revealing'){
        const card=this.save?.active?.cards[this.index];if(!card)throw new Error('Opening changed. Reload to sync your game.');
        await this.stage.reveal(card,this.index===0,Math.max(0,this.index-1),specialPokemon(card,this.index===0&&this.save?.active?.previewSpecial?0:this.selected.price,this.pokemonArt));if(valid()){this.error='';this.actor.send({type:'FLIPPED'});}
      }else if(phase==='collecting'){
        const cards=this.save?.active?.cards;if(!cards)throw new Error('Opening changed. Reload to sync your game.');
        await this.stage.collectRemaining(cards,this.index);if(valid())this.actor.send({type:'COLLECTED'});
      }else if(phase==='settling'){
        const id=this.save?.active?.id;if(!id)throw new Error('Opening changed. Reload to sync your game.');
        this.save=await transactSave(s=>settleOpening(s,id));if(!valid())return;
        this.resultId=id;this.stage.showResult();this.actor.send({type:'SETTLED'});playSound('complete');
      }
    }catch(e){
      if(!valid())return;
      this.error=phase==='revealing'?'Card image could not load. Retry the reveal.':(e as Error).message;
      if(phase==='reserving'||phase==='collecting'||phase==='settling')this.actor.send({type:'FAIL'});
      this.render();
    }
  }
  private render(){
    setAudioScenePaused(!!this.panel||!!this.inspected);
    if(!this.view||this.destroyed)return;
    const cards=Array.from(new Map([...Object.values(this.catalogs).flat(),...(this.save?.history.flatMap(o=>o.cards)??[])].filter(c=>c.id!=='energy').map(c=>[c.id,c])).values());
    const state:UIState={phase:this.phase,index:this.index,save:this.save,packs:this.packs,selected:this.selected,pool:this.pool,cards,ready:this.ready,error:this.error,toast:this.toast,panel:this.panel,inspected:this.inspected,result:this.save?.history.find(o=>o.id===this.resultId),sound:this.sound,reduced:this.reduced,low:this.low,action:this.action,select:this.select,inspect:card=>{this.inspected=card;this.render();}};
    this.view.update(state);
  }
  private syncTargets=(hits:HitTarget[],summary:string)=>{
    const old=document.activeElement instanceof HTMLButtonElement?document.activeElement.dataset.control:undefined;
    this.controls.replaceChildren();
    for(const hit of hits){const button=document.createElement('button');button.type='button';button.dataset.control=hit.id;button.setAttribute('aria-label',hit.label);button.disabled=hit.disabled;if(hit.selected!==undefined)button.setAttribute('aria-pressed',String(hit.selected));
      Object.assign(button.style,{left:`${hit.x}px`,top:`${hit.y}px`,width:`${hit.width}px`,height:`${hit.height}px`});
      button.onclick=(event)=>{if(hit.canvasPointer&&event.detail>0)return;this.view?.setFocus(null);hit.action();};if(hit.canvasPointer){button.style.cursor='grab';button.style.zIndex='0';button.onpointerdown=event=>this.view?.railDown(event);button.onwheel=event=>this.view?.railWheel(event);}button.onfocus=()=>{if(this.keyboard)this.view?.setFocus(hit.id);};button.onblur=()=>this.view?.setFocus(null);
      if(!hit.canvasPointer)button.style.zIndex='1';
      button.onpointerdown=hit.canvasPointer?button.onpointerdown:()=>this.view?.press(hit.id,true);button.onpointerup=()=>this.view?.press(hit.id,false);button.onpointerenter=()=>this.view?.hover(hit.id,true);button.onpointerleave=()=>this.view?.hover(hit.id,false);this.controls.append(button);
      if(this.keyboard&&old===hit.id&&!hit.disabled)button.focus({preventScroll:true});
    }
    this.announcer.textContent=summary;
  };
  private select=(pack:Pack)=>{
    if(this.opening)return;
    if(this.phase==='complete'){this.stage.reset();this.actor.send({type:'RESET'});}
    playSound('ui');this.selectedId=pack.id;this.error='';void this.preparePack();
  };
  private notify(message:string){clearTimeout(this.toastTimer);this.toast=message;this.render();this.toastTimer=window.setTimeout(()=>{this.toast='';this.render();},2200);}
  private async addCredits(){
    try{this.save=await transactSave(s=>{if(this.opening&&s.active?.id!==this.save?.active?.id)throw new Error('This opening changed in another tab. Reload to sync.');return {...s,balance:s.balance+100000};});this.error='';this.notify('$1,000 demo credits added');}
    catch(e){this.error=(e as Error).message;this.render();}
  }
  private export(){
    const cards=Object.values(this.catalogs).flat().filter(c=>this.save?.collection[c.id]).map(c=>({id:c.id,name:c.name,number:c.number,copies:this.save!.collection[c.id]}));
    const url=URL.createObjectURL(new Blob([JSON.stringify(cards,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='pokemon-collection.json';a.click();URL.revokeObjectURL(url);
  }
  private settings(){setSound(this.sound);try{localStorage.setItem('legends-settings',JSON.stringify({sound:this.sound,reduced:this.reduced,low:this.low}));}catch{/* Memory-only settings. */}this.stage.updateOptions({reduced:this.reduced,low:this.low,onTear:()=>this.action('tear'),onNext:()=>this.action('next')});}
  action=(type:GameAction)=>{
    if(this.destroyed)return;
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
      case 'reduced':this.reduced=!this.reduced;this.settings();break;
      case 'low':this.low=!this.low;this.settings();break;
      case 'export':this.export();return;
      case 'retry':this.error='';void this.runPhase();break;
      case 'dismiss':this.error='';break;
      case 'fullscreen':if(document.fullscreenElement)void document.exitFullscreen();else void this.host.requestFullscreen().catch(()=>this.notify('Full screen is unavailable.'));return;
      case 'reset':if(!this.opening)void resetSave().then(s=>{this.save=s;this.error='';this.panel=null;this.stage.reset();if(this.phase==='complete')this.actor.send({type:'RESET'});this.render();}).catch(()=>{this.error='Browser storage unavailable.';this.render();});return;
      case 'continue':this.stage.reset();this.actor.send({type:'RESET'});return;
      case 'open':if(this.ready&&this.save&&this.pool.length&&unobscured){this.error='';this.actor.send({type:'OPEN'});}return;
      case 'tear':if(this.ready&&unobscured)this.actor.send({type:'TEAR'});return;
      case 'next':if(unobscured)this.actor.send({type:'NEXT'});return;
      case 'all':if(unobscured)this.actor.send({type:'ALL'});return;
    }
    this.render();
  };
  destroy(){destroyAudio();this.destroyed=true;++this.flowToken;++this.packToken;clearTimeout(this.toastTimer);this.actor.stop();this.view?.destroy();this.stage.destroy();this.controls.remove();this.announcer.remove();document.removeEventListener('keydown',this.trackKeys);document.removeEventListener('pointerdown',this.trackPointer);}
}
