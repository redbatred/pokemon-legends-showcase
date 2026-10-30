/** A tiny HTML cover paints before the renderer bundle has even downloaded. */
export class BootScreen {
  private disposed=false;private failed=false;private value=0;private exit:Animation|null=null;
  constructor(private cover:HTMLElement,private host:HTMLElement){}
  progress=(value:number,label:string)=>{
    if(this.disposed||this.failed)return;this.value=Math.max(this.value,Math.min(1,value));
    this.cover.style.setProperty('--boot-progress',String(this.value));
    this.cover.querySelector('[role="progressbar"]')?.setAttribute('aria-valuenow',String(Math.round(this.value*100)));
    this.cover.querySelector('[data-boot-status]')!.textContent=label;
  };
  async finish(){
    if(this.disposed||this.failed)return;this.progress(1,'Ready');this.host.removeAttribute('data-booting');
    this.cover.dataset.state='ready';
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.exit=this.cover.animate([{opacity:1},{opacity:1,offset:.2},{opacity:0}],{duration:reduced?80:600,easing:'ease-in-out',fill:'forwards'});
    await this.exit.finished.catch(()=>{});if(this.disposed)return;
    this.cover.remove();this.host.inert=false;this.host.setAttribute('aria-busy','false');
  }
  fail(){
    if(this.disposed)return;this.failed=true;this.cover.dataset.state='error';
    this.cover.querySelector('[data-boot-status]')!.textContent='Couldn’t load the stadium';
    this.cover.querySelector('[data-boot-help]')!.textContent='Please try again.';
    const retry=this.cover.querySelector<HTMLButtonElement>('[data-boot-retry]')!;retry.hidden=false;retry.onclick=()=>location.reload();
  }
  destroy(){this.disposed=true;this.exit?.cancel();}
}
