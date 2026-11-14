import type {Application,Texture} from 'pixi.js';
import {ShowdownScene} from './ShowdownScene';
import {SHOWDOWNS,CARD_REVEAL_AT,SHOWDOWN_DURATION,showdownMessage,showdownSnapshot,type ShowdownId} from './showdownModel';
import {money} from '../model';
import {setSound,unlockAudio,setAudioScenePaused,setAudioHidden,stopRevealAudio,preloadRevealAudio,playSound,setVaultAudio} from '../audio';
import {ShowdownTransition} from './ShowdownTransition';
import {advanceShowdownTransition,reverseShowdownTransition} from './showdownTransitionModel';
import './showdown.css';
export interface ShowdownOptions {
 origin?:Texture;entry:'buy'|'trigger';packPrice:number;sound:boolean;reduced:boolean;low:boolean;
 onClose:()=>void;onArm:()=>void;onSound:(enabled:boolean)=>void;
}
/** A single cancellable clock controls the presentation; it never writes to the wallet. */
export class LegendaryShowdown {
 private element=document.createElement('section');private scene:ShowdownScene;private frame=0;private last=0;
 private time=-1;private speed=1;private paused=false;private id:ShowdownId='legendary';private state:'entry'|'playing'|'result'='entry';
 private bridge:ShowdownTransition;private transitionDirection:'in'|'out'|null='in';private transitionTime=0;private transitionAmbient=0;private assetsSettled=false;private loadStarted=false;private retainOrigin=false;
 private dead=false;private reduced:boolean;private sound:boolean;private previousFocus=document.activeElement as HTMLElement|null;
 private total:HTMLElement;private status:HTMLElement;private progress:HTMLElement;private footer:HTMLElement;private live:HTMLElement;
 private soundButton:HTMLButtonElement;private motionButton:HTMLButtonElement;private startButton:HTMLButtonElement;private resizeObserver:ResizeObserver;
 constructor(private host:HTMLElement,app:Application,private options:ShowdownOptions){
  this.reduced=options.reduced;this.sound=options.sound;setVaultAudio(true);setAudioScenePaused(false);this.scene=new ShowdownScene(app,options.low,options.packPrice);this.bridge=new ShowdownTransition(options.origin);this.scene.root.addChild(this.bridge.root);
  this.element.className='showdown-overlay';this.element.dataset.phase='entry';this.element.setAttribute('role','dialog');this.element.setAttribute('aria-modal','true');this.element.setAttribute('aria-labelledby','showdown-title');
  this.element.tabIndex=-1;this.element.dataset.transition='in';
  this.element.innerHTML=`<header class="showdown-header"><div class="showdown-logo"><img src="/assets/pokemon-logo.png" alt="Pokémon"><span>LEGENDS</span></div><h1 id="showdown-title">Mewtwo’s Psychic Vault</h1><div class="showdown-bank"><span>Card reward</span><strong>Locked</strong></div><button class="showdown-close" aria-label="Close Legendary Showdown">×</button></header>
   <div class="showdown-trainer"><b>Charizard</b><span><i aria-hidden="true">◆</i> Seal breaker</span></div>
   <div class="showdown-guard" aria-label="Mewtwo psychic barrier"><b>Mewtwo</b><span>Card shield</span><div><i></i><i></i><i></i></div><small>3 / 3</small></div>
   <aside class="showdown-rules"><strong>Break 3 seals. Reveal 1 card.</strong><span>Mewtwo guards the card behind him. Break his 3 psychic seals.</span><small>Enter with 3 bonus symbols in one pack, or buy entry. Hits open seals; the card reveals one payout.</small></aside>
   <footer class="showdown-footer"><div class="showdown-dialogue"><div class="showdown-progress" aria-hidden="true"><i></i></div><div class="showdown-attack" aria-label="Fire attack sequence"><span>FIRE</span><div class="showdown-move-marks"></div></div><div class="showdown-status"></div><div class="showdown-entry-copy">3 seals → 1 card → 1 reward.</div><p class="showdown-disclaimer"></p></div><div class="showdown-command-panel"><div class="showdown-actions"></div><details class="showdown-options"><summary>Options</summary><div class="showdown-options-content"><div class="showdown-settings"></div><div class="showdown-trigger-option"></div></div></details></div></footer>
   <p class="screen-reader" role="status" aria-live="polite"></p>`;
  this.total=this.element.querySelector('.showdown-bank strong')!;this.footer=this.element.querySelector('.showdown-actions')!;
  this.status=this.element.querySelector('.showdown-status')!;this.progress=this.element.querySelector('.showdown-progress i')!;this.live=this.element.querySelector('[role="status"]')!;
  this.element.querySelector<HTMLButtonElement>('.showdown-close')!.onclick=()=>this.close();
  const marks=this.element.querySelector('.showdown-move-marks')!;
  for(const strike of SHOWDOWNS.find(round=>round.id===this.id)!.strikes){const mark=document.createElement('i');mark.title=strike.title;mark.setAttribute('aria-hidden','true');marks.append(mark);}
  this.startButton=this.button('Loading…',()=>this.start(),'showdown-primary');this.startButton.disabled=true;this.footer.append(this.startButton);
  if(options.entry==='buy')this.element.querySelector('.showdown-trigger-option')!.append(this.button('Demo: trigger next pack',()=>{options.onArm();this.close();}));
  this.status.textContent=options.entry==='trigger'?'Three bonus symbols found!':'Unlock the sealed card.';
  if(options.entry==='trigger')this.element.querySelector('.showdown-entry-copy')!.textContent='Your vault is unlocked for entry.';
  this.element.querySelector('.showdown-disclaimer')!.textContent=`Base bet ${money(this.options.packPrice)} · Demo only`;
  const settings=this.element.querySelector('.showdown-settings')!;
  this.soundButton=this.button('',()=>{this.sound=!this.sound;setSound(this.sound);options.onSound(this.sound);if(this.sound)void Promise.all(['charizard','mewtwo'].map(name=>preloadRevealAudio(`/assets/pokemon/${name}.png`)));this.updateSettings();});
  this.motionButton=this.button('',()=>{this.reduced=!this.reduced;this.updateSettings();});settings.append(this.soundButton,this.motionButton);this.updateSettings();
  host.append(this.element);this.element.addEventListener('keydown',this.keydown);document.addEventListener('visibilitychange',this.visibility);
  this.resizeObserver=new ResizeObserver(()=>this.scene.resize());this.resizeObserver.observe(host);

  this.element.focus({preventScroll:true});this.frame=requestAnimationFrame(this.tick);
 }
 private loadAssets(){
  this.loadStarted=true;playSound('latch',{gain:.3});
  void this.scene.load().then(ok=>{if(this.dead)return;this.assetsSettled=true;this.startButton.disabled=false;this.setEntryButton();playSound('vault-enter');if(!ok)this.live.textContent='Some assets are unavailable; simplified artwork will be used.';}).catch(()=>{if(!this.dead){this.assetsSettled=true;this.status.textContent='The arena could not load. Close and try again.';}});
 }
 private setEntryButton(){
  const label=document.createElement('strong'),detail=document.createElement('span');
  label.textContent=this.options.entry==='buy'?'Buy bonus':'Open vault';
  detail.textContent=this.options.entry==='buy'?`${money(this.options.packPrice*100)} · 100× base bet`:'Bonus unlocked';
  this.startButton.replaceChildren(label,detail);
  this.startButton.setAttribute('aria-label',this.options.entry==='buy'?`Buy bonus for ${money(this.options.packPrice*100)} demo price. No balance changes.`:'Open vault');
 }
 private button(label:string,action:()=>void,cls='showdown-secondary'){const b=document.createElement('button');b.type='button';b.textContent=label;b.className=cls;b.onclick=()=>{if(this.transitionDirection)return;unlockAudio();action();};return b;}
 private start(){
  if(this.dead||this.transitionDirection||!this.scene.ready||this.state==='playing')return;
  this.state='playing';this.time=0;this.last=0;this.speed=1;this.paused=false;this.scene.reset(this.id);this.scene.setPaused(false);setAudioScenePaused(false);this.element.dataset.phase='playing';this.element.querySelector<HTMLDetailsElement>('details')!.open=false;
  const speed=this.button('1× Speed',()=>{this.speed=this.speed===1?2:1;speed.textContent=`${this.speed}× Speed`;speed.setAttribute('aria-pressed',String(this.speed===2));},'showdown-command showdown-speed');speed.setAttribute('aria-pressed','false');
  const pause=this.button('Pause',()=>{this.paused=!this.paused;setAudioScenePaused(this.paused);this.scene.setPaused(this.paused);pause.textContent=this.paused?'Resume':'Pause';pause.setAttribute('aria-pressed',String(this.paused));this.live.textContent=this.paused?'Battle paused.':'Battle resumed.';},'showdown-command showdown-pause');pause.setAttribute('aria-pressed','false');
  this.footer.replaceChildren(speed,pause,this.button('Skip',()=>this.finish(true),'showdown-command showdown-skip'));
  this.element.querySelector('.showdown-disclaimer')!.textContent='Demo only · No balance changes';
  this.live.textContent='Mewtwo protects one reward card with three seals. Charizard breaks the seals to reveal it.';speed.focus({preventScroll:true});
 }
 private finish(skipped=false){
  if(this.dead||this.state==='result')return;this.time=SHOWDOWNS.find(r=>r.id===this.id)!.duration;
  if(skipped)stopRevealAudio();setAudioScenePaused(false);this.scene.setPaused(false);this.scene.update(this.time,0,this.reduced,false,skipped);this.state='result';this.paused=false;this.element.dataset.phase='result';this.refresh();
  this.footer.replaceChildren(this.button('Return to packs',()=>this.close(),'showdown-primary'),this.button('Replay',()=>this.start()));
  const total=showdownSnapshot(this.id,this.time).total;this.status.textContent=`${total} × ${money(this.options.packPrice)} = ${money(total*this.options.packPrice)}`;
  this.element.querySelector('.showdown-disclaimer')!.textContent='One card reward · Demo only · No balance changes';
  this.live.textContent=`Showdown complete. ${total} times pack value. No balance changes.`;this.footer.querySelector('button')?.focus({preventScroll:true});
 }
 private refresh(){
  this.element.dataset.revealing=String(this.time>=CARD_REVEAL_AT-.5);
  const snap=showdownSnapshot(this.id,this.time);this.total.textContent=snap.total?`${snap.total}×`:'Locked';this.progress.style.width=`${Math.max(0,this.time)/SHOWDOWN_DURATION*100}%`;
  this.element.querySelectorAll<HTMLElement>('.showdown-guard i').forEach((bar,i)=>bar.dataset.broken=String(i>=snap.guard));
  this.element.querySelector('.showdown-guard small')!.textContent=`${snap.guard} / 3`;
  const strikes=SHOWDOWNS.find(round=>round.id===this.id)!.strikes;
  this.element.querySelectorAll<HTMLElement>('.showdown-move-marks i').forEach((mark,i)=>{mark.dataset.state=this.time>=strikes[i].at?'complete':this.time>=strikes[i].at-1.1?'active':'pending';});
  this.element.querySelector('.showdown-attack')!.setAttribute('aria-label',`Fire attacks: ${3-snap.guard} of 3 landed`);
 }
 private tick=(now:number)=>{
  if(this.dead)return;const dt=this.last?Math.min(.05,(now-this.last)/1000):0;this.last=now;
  if(!document.hidden){
   if(this.state==='playing'&&!this.transitionDirection){
    this.time=Math.min(SHOWDOWN_DURATION,this.time+(this.paused?0:dt)*this.speed);this.refresh();
    const message=showdownMessage(this.time);
    if(this.status.textContent!==message){this.status.textContent=message;this.live.textContent=message;}
    if(this.time>=SHOWDOWN_DURATION)this.finish();
   }
   this.scene.update(this.time,(this.paused?0:dt)*(this.state==='playing'?this.speed:1),this.reduced,this.state==='playing');
   if(this.transitionDirection){
    this.transitionAmbient+=dt;
    if(this.transitionDirection==='in'&&!this.loadStarted&&this.transitionTime>=(this.reduced?.12:.4))this.loadAssets();
    this.transitionTime=advanceShowdownTransition(this.transitionTime,dt,this.transitionDirection==='out'||this.assetsSettled,this.reduced);
    const f=this.bridge.sample(this.transitionTime,this.hostWidth(),this.hostHeight(),this.transitionDirection,this.reduced,this.retainOrigin,this.transitionAmbient);
    this.scene.setTravel(this.reduced?1:this.transitionDirection==='in'?f.arrival:1-f.cover);
    if(f.done){
     if(this.transitionDirection==='out'){this.completeClose();return;}
     this.transitionDirection=null;delete this.element.dataset.transition;this.scene.setTravel(1);(this.startButton.disabled?this.element.querySelector<HTMLButtonElement>('.showdown-close')!:this.startButton).focus({preventScroll:true});
    }
   }
   this.scene.render();
  }
  this.frame=requestAnimationFrame(this.tick);
 };
 private hostWidth(){return this.host.clientWidth;}
 private hostHeight(){return this.host.clientHeight;}
 private updateSettings(){this.element.dataset.reduced=String(this.reduced);this.soundButton.textContent=this.sound?'Sound on':'Sound off';this.soundButton.setAttribute('aria-pressed',String(this.sound));this.motionButton.textContent=this.reduced?'Reduced motion':'Full motion';this.motionButton.setAttribute('aria-pressed',String(this.reduced));}
 private visibility=()=>{this.last=0;setAudioHidden(document.hidden);this.scene.setPaused(document.hidden||this.paused);};
 private keydown=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();this.close();return;}if(e.key!=='Tab')return;if(this.transitionDirection){e.preventDefault();return;}const buttons=Array.from(this.element.querySelectorAll<HTMLElement>('button,summary')).filter(b=>!b.hasAttribute('disabled')&&b.getClientRects().length>0),first=buttons[0],last=buttons.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}};
 private close(){if(this.dead||this.transitionDirection==='out')return;this.scene.cancelPresentation();if(this.transitionDirection==='in'){const reverse=reverseShowdownTransition(this.transitionTime,this.reduced);this.transitionTime=reverse.time;this.retainOrigin=reverse.retainOrigin;}else this.transitionTime=0;this.transitionDirection='out';this.element.dataset.transition='out';this.paused=true;stopRevealAudio();this.element.focus({preventScroll:true});}
 private completeClose(){this.destroy();this.options.onClose();if(this.previousFocus?.isConnected&&!this.previousFocus.closest('[inert]'))this.previousFocus.focus({preventScroll:true});}
 destroy(){if(this.dead)return;this.dead=true;cancelAnimationFrame(this.frame);this.resizeObserver.disconnect();document.removeEventListener('visibilitychange',this.visibility);this.element.removeEventListener('keydown',this.keydown);this.bridge.destroy();this.scene.destroy();setVaultAudio(false);setAudioScenePaused(false);this.element.remove();}
}
