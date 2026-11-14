/** Shown the moment the legendary encounter is asked for and is not yet on the device: the wait is acknowledged at once and
 * its progress is visible. It speaks the boot screen's language (the same ball, ring and meter), and its motion is plain CSS
 * on whole elements, so it keeps turning while the encounter's start-up has the main thread. */
const BALL='<svg class="bonus-loader-ball" viewBox="0 0 240 240"><defs><clipPath id="bonus-loader-clip"><circle cx="120" cy="120" r="46"/></clipPath></defs><circle cx="120" cy="120" r="49" fill="#071d3a" stroke="#aadced" stroke-width="1.5"/><g clip-path="url(#bonus-loader-clip)"><path d="M72 72H168V120H72Z" fill="#e44555"/><path d="M72 120H168V168H72Z" fill="#e8f4f7"/><path d="M150 80Q174 143 111 164Q158 180 171 133Z" fill="#85a9c4" opacity=".7"/><path d="M80 93Q106 65 143 86Q108 75 87 108Z" fill="#ffb1b3"/><path d="M71 120H169" stroke="#092039" stroke-width="9"/></g><circle cx="120" cy="120" r="15" fill="#071d3a"/><circle cx="120" cy="120" r="10.5" fill="#f1fcff" stroke="#9dbfd3" stroke-width="2"/><circle cx="120" cy="120" r="5" fill="#71dbf4"/></svg>';
const RING='<svg class="bonus-loader-ring" viewBox="0 0 240 240"><circle cx="120" cy="120" r="77" fill="none" stroke="#3676a2" stroke-width="1" opacity=".4"/><circle cx="120" cy="120" r="77" fill="none" stroke="#7ce7ff" stroke-width="3" stroke-linecap="round" stroke-dasharray="66 176"/><circle cx="120" cy="120" r="89" fill="none" stroke="#b8edff" stroke-width="1" stroke-dasharray="6 134" opacity=".65"/></svg>';
export class BonusLoader{
 private root:HTMLElement|null=null;private value=0;private gone=false;
 /** Nothing is built until it is shown: most encounters are already loaded and never need it. */
 constructor(private host:HTMLElement,private name:string){}
 get visible(){return !!this.root&&!this.gone;}
 show(){
  if(this.root||this.gone)return;const root=this.root=document.createElement('div');root.className='bonus-loader';root.setAttribute('aria-hidden','true');
  root.innerHTML=`<div class="bonus-loader-content"><div class="bonus-loader-emblem">${RING}${BALL}</div><p class="bonus-loader-title">Legendary Encounter</p><div class="boot-meter"><span></span></div><p class="boot-status"></p></div>`;
  root.querySelector('.boot-status')!.textContent=`Summoning ${this.name}`;this.progress(this.value);
  this.host.append(root);void root.offsetWidth;root.dataset.shown='';
 }
 /** Progress only moves forward. */
 progress(value:number){this.value=Math.max(this.value,Math.min(1,value));this.root?.style.setProperty('--boot-progress',this.value.toFixed(3));}
 /** Lifts off what is behind it, then leaves the page. */
 hide(){if(this.gone)return;this.gone=true;const root=this.root;if(!root)return;this.progress(1);delete root.dataset.shown;setTimeout(()=>root.remove(),260);}
}
