import { Assets, Container, Graphics, Sprite, Text, Texture, BitmapFont, BitmapText,Rectangle } from 'pixi.js';
import { gsap } from 'gsap';
import { railElastic,railPosition,railSnap } from './carousel';
import { gameLayout, pageWindow, cardTrayLayout } from './rendering';
import { money, recordedWinnings, type Card, type Pack, type Save, type Result } from './model';
import {modalLayout,rewardLayout} from './modalLayout';
import {MoneyReadout} from './MoneyReadout';
import {moneyState,type MoneyState} from './moneyMotion';
import { loadPackTexture } from './packTexture';
import type { OpeningStage } from './Stage';

export type Panel = 'collection'|'settings'|'history'|'about'|null;
export type GameAction = 'open'|'tear'|'next'|'all'|'continue'|'close'|'collection'|'settings'|'history'|'about'|'credits'|'sound'|'reduced'|'low'|'reset'|'export'|'retry'|'dismiss'|'fullscreen';
export interface UIState {phase:string;index:number;save:Save|null;packs:Pack[];selected:Pack;pool:Card[];cards:Card[];ready:boolean;error:string;toast:string;panel:Panel;inspected:Card|null;result?:Result;sound:boolean;reduced:boolean;low:boolean;action:(action:GameAction)=>void;select:(pack:Pack)=>void;inspect:(card:Card)=>void}
export interface HitTarget {id:string;label:string;x:number;y:number;width:number;height:number;disabled:boolean;action:()=>void;canvasPointer?:boolean;selected?:boolean}
const C={ink:0x092846,panel:0x183e60,raised:0x235781,line:0x5484a8,cyan:0x9aeeff,white:0xf3fbff,muted:0xa3c2d9,blue:0x246ec1};

/** Pixi draws every visible control. Transparent DOM targets provide keyboard/screen-reader access only. */
export class CanvasUI {
  root=new Container({isRenderGroup:true}); private focus=new Graphics();private state:UIState|null=null;
  private backdrop=new Graphics();private modalTween:gsap.core.Timeline|null=null;private modalKind='';private transitioning=false;
  private frozenHud:Sprite|null=null;
  private modalOrigin={x:0,y:0};
  private dismissal:'close'|'continue'|null=null;
  private tray:Texture;
  private moneyAnimations:gsap.core.Tween[]=[];private moneyValues=new Map<string,MoneyState>();
  private updating=false;
  private railMotion={offset:0};private railTween:gsap.core.Tween|null=null;
  private rail:{content:Container;x:number;y:number;width:number;height:number;tile:number;stride:number;max:number;groups:Container[];hits:HitTarget[]}|null=null;
  private drag:{id:number;startX:number;startY:number;offset:number;lastX:number;lastTime:number;velocity:number;moved:boolean}|null=null;
  private lastPackId='';
  private generation=0;private hits:HitTarget[]=[];private paints=new Map<string,Container>();private feedbackTweens=new Map<string,gsap.core.Tween>();
  private page=0;private collected=false;private openingId='';private landed=new Set<number>();
  private trayArt:Texture|null=null;private redrawTray:(()=>void)|null=null;private trayOffset={value:0};private trayTween:gsap.core.Tween|null=null;
  private trayStrip:Container|null=null;private collectingIndex:number|null=null;
  private packValueLabel:MoneyReadout|null=null;private revealCountLabel:Text|null=null;
  private thumbs=new Map<string,Texture>();private pending=new Map<string,Promise<Texture>>();private destroyed=false;
  constructor(private stage:OpeningStage,private onTargets:(hits:HitTarget[],summary:string)=>void){
    BitmapFont.install({name:'LegendsMoney',style:{fontFamily:'Nunito',fontSize:48,fontWeight:'900',fill:0xffffff,stroke:{color:0x082e52,width:3}},chars:'0123456789$.,+- ',resolution:2,padding:3,skipKerning:true});
    const canvas=document.createElement('canvas');canvas.width=8;canvas.height=128;const ctx=canvas.getContext('2d')!;const gradient=ctx.createLinearGradient(0,0,0,128);gradient.addColorStop(0,'rgba(4,14,29,0)');gradient.addColorStop(1,'rgba(4,14,29,.65)');ctx.fillStyle=gradient;ctx.fillRect(0,0,8,128);this.tray=Texture.from(canvas);
    stage.app.stage.addChild(this.backdrop,this.root,stage.flightLayer);stage.onCardStored=this.storeCard;stage.onLayout=()=>{if(!this.updating)this.build();};
    stage.onCollectFocus=this.focusTray;stage.cardDestination=this.cardDestination;
    window.addEventListener('keydown',this.keydown);
    stage.app.canvas.addEventListener('pointerdown',this.railDown);stage.app.canvas.addEventListener('pointermove',this.railMove);stage.app.canvas.addEventListener('pointerup',this.railUp);stage.app.canvas.addEventListener('pointercancel',this.railCancel);stage.app.canvas.addEventListener('wheel',this.railWheel,{passive:false});
  }
  update(state:UIState){
    const id=state.save?.active?.id??'';if(id!==this.openingId){this.openingId=id;this.landed.clear();this.trayOffset.value=0;}
    if(state.phase==='revealed')for(let i=0;i<state.index;i++)this.landed.add(i);
    this.state=state;
    if(!['collecting','settling'].includes(state.phase))this.collectingIndex=null;
    this.updating=true;
    this.stage.setLayoutMode(!['browse','complete'].includes(state.phase));
    this.stage.setScene(['revealing','revealed','collecting','settling','complete'].includes(state.phase));
    this.stage.setBlocked(!!state.panel||!!state.inspected||state.phase==='complete',state.panel==='settings');
    if(state.panel||state.inspected||state.phase==='complete')this.stage.app.stage.addChild(this.backdrop,this.root);else this.stage.app.stage.addChild(this.stage.flightLayer);
    this.updating=false;
    this.build();
  }
  private keydown=(event:KeyboardEvent)=>{
    if(!this.state)return;
    if(event.key==='Escape'){event.preventDefault();this.dismissModal();return;}
    if((event.target as HTMLElement)?.tagName==='BUTTON')return;
    if(this.state.panel==='collection'&&!this.state.inspected&&['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();this.page+=event.key==='ArrowRight'?1:-1;this.build();}
    if((event.key===' '||event.key==='Enter')&&!this.state.panel&&!this.state.inspected){event.preventDefault();const phase=this.state.phase;const action=phase==='browse'?'open':phase==='sealed'?'tear':phase==='revealed'?'next':phase==='complete'?'continue':null;if(action)this.state.action(action);}
  };
  private text(value:string,x:number,y:number,size=14,color=C.white,parent=this.root,align:'left'|'center'|'right'='left',weight:'normal'|'bold'='normal',maxWidth?:number){
    const text=new Text({text:value,style:{fontFamily:'Nunito, Arial, sans-serif',fontSize:size,fontWeight:weight==='bold'?'800':'600',fill:color,align,wordWrap:!!maxWidth,wordWrapWidth:maxWidth,lineHeight:size*1.3},resolution:Math.min(2,devicePixelRatio)});
    text.anchor.set(align==='center'?.5:align==='right'?1:0,0);text.position.set(x,y);parent.addChild(text);return text;
  }
  private money(amount:number,x:number,y:number,size:number,color:number,align:'left'|'center'|'right',key:string,identity:string,plus=false,width=240){
    const state=moneyState(this.moneyValues.get(key),identity,amount,key==='wallet'||key==='lifetime');this.moneyValues.set(key,state);
    const label=new MoneyReadout(state,{size,color,align,width,plus,hero:key==='reward'||key==='result',reduced:this.state!.reduced,ticks:key==='result',draw:()=>this.stage.draw()});
    label.position.set(x,y);this.root.addChild(label);return label;
  }
  private panel(x:number,y:number,w:number,h:number,fill=C.panel,line=C.line,parent=this.root,cut=9){
    const radius=Math.min(cut+3,h/2);
    const g=new Graphics().roundRect(x,y+3,w,h,radius).fill({color:0x04192c,alpha:.38}).roundRect(x,y,w,h,radius).fill({color:fill,alpha:.94}).stroke({width:1.4,color:line,alpha:.8});
    parent.addChild(g);return g;
  }
  private ball(x:number,y:number,r:number,color=C.cyan,parent=this.root){
    const g=new Graphics().circle(x,y,r).stroke({color,width:1.6}).moveTo(x-r,y).lineTo(x+r,y).stroke({color,width:1.5}).circle(x,y,r*.28).fill(C.panel).stroke({color,width:1.5});parent.addChild(g);return g;
  }
  private button(id:string,label:string,x:number,y:number,w:number,h:number,action:()=>void,options:{primary?:boolean;active?:boolean;disabled?:boolean;small?:boolean;large?:boolean;visibleLabel?:string}={}){
    const group=new Container();this.root.addChild(group);this.paints.set(id,group);
    const chosen=options.active||options.primary;
    this.panel(x,y,w,h,chosen?C.blue:C.panel,chosen?C.cyan:C.line,group,7);
    if(chosen){const light=new Graphics().roundRect(x+3,y+3,w-6,h*.4,5).fill({color:0xd7f7ff,alpha:.12});group.addChild(light);}
    if(options.primary)this.ball(x+24,y+h/2,7,C.white,group);
    const fontSize=options.large?23:options.small?12:14;
    const textX=x+(options.primary?43:12),textW=w-(options.primary?55:24),caption=this.text(options.visibleLabel??label,textX+textW/2,y+(h-fontSize*1.3)/2,fontSize,chosen?C.white:C.muted,group,'center','bold');if(caption.width>textW)caption.scale.set(textW/caption.width);
    group.pivot.set(x+w/2,y+h/2);group.position.set(x+w/2,y+h/2);group.alpha=options.disabled?.38:1;
    const hit={id,label,x,y,width:w,height:h,disabled:!!options.disabled,action};this.hits.push(hit);
    group.eventMode=options.disabled?'none':'static';group.cursor='pointer';group.on('pointertap',()=>{if(!options.disabled&&!this.transitioning)action();});
    return group;
  }
  private hit(id:string,label:string,x:number,y:number,w:number,h:number,action:()=>void,disabled=false){this.hits.push({id,label,x,y,width:w,height:h,disabled,action});}
  hover(id:string,value:boolean){this.feedback(id,value?1.045:1);}
  press(id:string,value:boolean){this.feedback(id,value?.94:1.045);}
  private feedback(id:string,scale:number){const paint=this.paints.get(id);if(!paint)return;this.feedbackTweens.get(id)?.kill();if(this.state?.reduced){paint.scale.set(scale);this.stage.draw();return;}this.feedbackTweens.set(id,gsap.to(paint.scale,{x:scale,y:scale,duration:.16,ease:'power2.out',onUpdate:()=>this.stage.draw()}));}
  private command(id:string,label:string,cx:number,cy:number,size:number,kind:'next'|'all',action:()=>void){
    const group=new Container();group.position.set(cx,cy);this.root.addChild(group);this.paints.set(id,group);const r=size/2,g=new Graphics();group.addChild(g);
    g.circle(0,4,r).fill({color:0x04233e,alpha:.5}).circle(0,0,r).fill(0x0b3659).stroke({color:0xa0daed,width:2});
    g.arc(0,0,r-5,Math.PI*1.06,Math.PI*1.94).stroke({color:0xf0fdff,width:3}).arc(0,0,r-5,.10,Math.PI-.10).stroke({color:0x368aca,width:3});
    g.circle(0,0,r-10).fill(kind==='next'?0x267fca:0x204f72);
    if(kind==='next')g.poly([-6,-12,7,0,-6,12,0,12,13,0,0,-12]).fill(0xf3fcff);
    else g.roundRect(-10,-12,15,21,2).stroke({color:0x8fc6e0,width:1.7}).roundRect(-4,-8,15,21,2).fill(0x276b9e).stroke({color:0xf0fcff,width:1.8}).moveTo(0,2).lineTo(4,6).lineTo(9,-1).stroke({color:0xe5ffff,width:1.5});
    const text=this.text(label,0,r+7,kind==='next'?12:10,C.white,group,'center','bold');text.style.stroke={color:0x082b4b,width:3};
    this.hits.push({id,label,x:cx-r-4,y:cy-r-4,width:size+8,height:size+26,disabled:false,action});
    return group;
  }
  private openCommand(w:number,y:number,disabled:boolean,center=w/2,maxWidth=278){
    const s=this.state!,width=Math.min(maxWidth,w-44),height=56,x=center-width/2,group=new Container(),g=new Graphics();this.root.addChild(group);group.addChild(g);group.pivot.set(center,y+height/2);group.position.set(center,y+height/2);this.paints.set('primary',group);
    const shape=(inset:number,dy=0)=>[x+20+inset,y+inset+dy,x+width-20-inset,y+inset+dy,x+width-inset,y+height/2+dy,x+width-20-inset,y+height-inset+dy,x+20+inset,y+height-inset+dy,x+inset,y+height/2+dy];
    g.poly(shape(0,4)).fill({color:0x06283e,alpha:.55}).poly(shape(0)).fill(0x103f6b).stroke({color:0xa6e9fa,width:2}).poly(shape(5)).fill(0x247bc1);
    g.moveTo(x+23,y+8).lineTo(x+width-23,y+8).stroke({color:0xe6ffff,width:2,alpha:.65});
    this.ball(x+45,y+28,13,0xefffff,group);this.text('OPEN',center+6,y+12,24,C.white,group,'center','bold');
    g.poly([x+width-45,y+21,x+width-37,y+28,x+width-45,y+35]).stroke({color:0xdfffff,width:2.5});
    group.alpha=disabled?.4:1;this.hits.push({id:'primary',label:'Open',x,y,width,height,disabled,action:()=>s.action(s.phase==='sealed'?'tear':'open')});
  }
  setFocus(id:string|null){this.focus.clear();const hit=this.hits.find(h=>h.id===id);if(hit)this.focus.roundRect(hit.x-this.modalOrigin.x-3,hit.y-this.modalOrigin.y-3,hit.width+6,hit.height+6,8).stroke({color:0xe3fcff,width:2});this.stage.draw();}
  private async thumbnail(path:string){
    const cached=this.thumbs.get(path);if(cached){this.thumbs.delete(path);this.thumbs.set(path,cached);return cached;}
    if(this.pending.has(path))return this.pending.get(path)!;
    const promise=(async()=>{
      let source:CanvasImageSource,width:number,height:number;
      if(path.endsWith('pack.webp')){const texture=await loadPackTexture(path);source=texture.source.resource as CanvasImageSource;width=texture.width;height=texture.height;}
      else{const image=new Image();image.src=path;await image.decode();source=image;width=image.naturalWidth;height=image.naturalHeight;}
      const scale=Math.min(1,384/Math.max(width,height));const canvas=document.createElement('canvas');canvas.width=Math.round(width*scale);canvas.height=Math.round(height*scale);const ctx=canvas.getContext('2d')!;
      if(path.includes('/cards/')||path.includes('card-back')){ctx.beginPath();ctx.roundRect(0,0,canvas.width,canvas.height,canvas.width*.05);ctx.clip();}
      ctx.drawImage(source,0,0,canvas.width,canvas.height);const texture=Texture.from(canvas);
      if(this.destroyed){texture.destroy(true);throw new Error('closed');}
      this.thumbs.set(path,texture);this.pending.delete(path);return texture;
    })().catch(error=>{this.pending.delete(path);throw error;});this.pending.set(path,promise);return promise;
  }
  private picture(path:string,x:number,y:number,w:number,h:number,parent=this.root,full=false){
    const generation=this.generation;
    const render=(texture:Texture)=>{if(this.destroyed||generation!==this.generation||parent.destroyed)return;const sprite=new Sprite(texture);sprite.anchor.set(.5);const scale=Math.min(w/texture.width,h/texture.height);sprite.scale.set(scale);sprite.position.set(x+w/2,y+h/2);parent.addChild(sprite);this.stage.draw();};
    const ready=full?Assets.get<Texture>(path):this.thumbs.get(path);
    if(ready){if(!full){this.thumbs.delete(path);this.thumbs.set(path,ready);}render(ready);}else void (full?Assets.load<Texture>(path):this.thumbnail(path)).then(render).catch(()=>{if(generation===this.generation&&!parent.destroyed){this.text('Image unavailable',x+w/2,y+h/2,10,C.muted,parent,'center');this.stage.draw();}});
  }
  private build(){
    if(!this.state||this.destroyed)return;
    if(this.dismissal){const action=this.dismissal;this.dismissal=null;this.modalTween?.kill();this.transitioning=false;this.state.action(action);return;}
    if(this.state.panel==='settings'&&!this.modalKind&&!this.frozenHud){const texture=this.stage.app.renderer.generateTexture({target:this.root,frame:new Rectangle(0,0,this.stage.app.screen.width,this.stage.app.screen.height),resolution:1});this.frozenHud=new Sprite(texture);this.stage.app.stage.addChildAt(this.frozenHud,this.stage.app.stage.getChildIndex(this.backdrop));}
    if(this.state.panel!=='settings'&&this.frozenHud){this.frozenHud.destroy({texture:true,textureSource:true});this.frozenHud=null;}
    ++this.generation;this.railTween?.kill();this.railTween=null;this.cancelRailDrag();this.rail=null;this.trayStrip=null;this.packValueLabel=null;this.revealCountLabel=null;this.moneyAnimations.forEach(t=>t.kill());this.moneyAnimations=[];this.trayTween?.kill();this.redrawTray=null;this.trayArt?.destroy(true);this.trayArt=null;this.hits=[];this.feedbackTweens.forEach(t=>t.kill());this.feedbackTweens.clear();this.paints.clear();this.focus.clear();
    this.root.removeChild(this.focus);this.root.removeChildren().forEach(child=>child.destroy({children:true}));
    const s=this.state,sw=this.stage.app.screen.width,sh=this.stage.app.screen.height,modal=s.inspected?'inspect':s.panel??(s.phase==='complete'?'results':'');
    const frame=modal&&modal!=='settings'?modalLayout(sw,sh,modal):{x:0,y:0,width:sw,height:sh};this.modalOrigin={x:frame.x,y:frame.y};
    const w=frame.width,h=frame.height,l=gameLayout(w,h,!['browse','complete'].includes(s.phase)),changed=modal!==this.modalKind;this.modalKind=modal;
    this.modalTween?.kill();this.modalTween=null;this.transitioning=false;this.root.position.set(frame.x,frame.y);this.root.scale.set(1);this.root.alpha=1;
    this.backdrop.clear();this.backdrop.visible=!!modal;this.backdrop.alpha=1;if(modal)this.backdrop.rect(0,0,sw,sh).fill({color:0x03192d,alpha:modal==='settings'?.45:.6});
    if(s.panel==='collection'&&!s.inspected)this.collection(w,h);
    else {
      if(!s.inspected&&!s.panel&&s.phase!=='complete'){this.hud(w,h);this.playControls(w,h);this.rack(w,h);}
      if(s.phase==='complete'&&s.result&&!s.panel&&!s.inspected)this.results(w,h,s.result);
      if(s.panel&&s.panel!=='collection'&&!s.inspected)this.menu(w,h);
      if(s.inspected)this.inspector(w,h,s.inspected);
    }
    if(s.error){
      this.panel(12,l.top+7,w-24,58,0x26334b,0x9bb8d2);
      this.text(s.error,25,l.top+18,12,C.white,this.root,'left','normal',w-136);
      this.button('error-close','Dismiss error',w-59,l.top+17,34,32,()=>s.action('dismiss'),{visibleLabel:'×'});
      if(s.phase==='revealing')this.button('retry','Retry reveal',w-132,l.top+17,66,32,()=>s.action('retry'),{small:true,visibleLabel:'Retry'});
    }
    if(s.toast){this.panel(w/2-145,h-46,290,32,0x163c54,C.line);this.text(s.toast,w/2,h-40,12,C.cyan,this.root,'center');}
    this.hits.forEach(hit=>{hit.x+=frame.x;hit.y+=frame.y;});this.root.addChild(this.focus);this.stage.draw();
    if(modal&&changed&&!s.reduced)this.animateModal(modal,w,h);
    this.emitTargets();
    // Keep thumbnail memory bounded. A screen uses fewer than 24; oldest pages can be discarded.
    while(this.thumbs.size>72){const key=this.thumbs.keys().next().value!;const texture=this.thumbs.get(key)!;this.thumbs.delete(key);texture.destroy(true);}
  }
  private emitTargets(){const s=this.state!;this.onTargets(this.hits.map(hit=>({...hit,disabled:hit.disabled||this.transitioning})),s.inspected?`Viewing ${s.inspected.name}`:s.panel?`${s.panel} screen`:`${s.selected.name}. ${s.phase}. Balance ${money(s.save?.balance??10000)}. ${s.phase==='revealed'?s.save?.active?.cards[s.index]?.name??'':''}`);}
  private animateModal(kind:string,w:number,h:number){
    this.transitioning=true;this.root.alpha=0;this.backdrop.alpha=0;
    if(kind==='settings')this.root.x=Math.min(440,w)+24;else{this.root.scale.set(.985);this.root.position.set(this.modalOrigin.x+w*.0075,this.modalOrigin.y+h*.0075+14);}
    this.modalTween=gsap.timeline({onUpdate:()=>this.stage.draw(),onComplete:()=>{this.transitioning=false;this.emitTargets();}})
      .to(this.backdrop,{alpha:1,duration:.2},0).to(this.root,{x:this.modalOrigin.x,y:this.modalOrigin.y,alpha:1,duration:kind==='settings'?.38:.3,ease:'power3.out'},0).to(this.root.scale,{x:1,y:1,duration:.3,ease:'power3.out'},0);
  }
  private dismissModal(action:'close'|'continue'='close'){
    if(this.transitioning)return;const s=this.state!;
    if(!this.modalKind||s.reduced){s.action(action);return;}
    this.transitioning=true;this.dismissal=action;this.emitTargets();this.modalTween?.kill();
    this.modalTween=gsap.timeline({onUpdate:()=>this.stage.draw(),onComplete:()=>{this.dismissal=null;this.transitioning=false;s.action(action);}})
      .to(this.root,{x:s.panel==='settings'?Math.min(440,this.stage.app.screen.width)+24:this.modalOrigin.x,y:s.panel==='settings'?0:this.modalOrigin.y+12,alpha:0,duration:.2,ease:'power2.in'},0).to(this.backdrop,{alpha:0,duration:.2},0);
  }
  private point(event:MouseEvent){const b=this.stage.app.canvas.getBoundingClientRect();return {x:(event.clientX-b.left)*this.stage.app.screen.width/b.width,y:(event.clientY-b.top)*this.stage.app.screen.height/b.height};}
  railDown=(event:PointerEvent)=>{
    const rail=this.rail;if(!rail||event.button!==0)return;const p=this.point(event);
    if(p.x<rail.x||p.x>rail.x+rail.width||p.y<rail.y||p.y>rail.y+rail.height)return;
    this.railTween?.kill();this.railTween=null;this.setFocus(null);
    this.drag={id:event.pointerId,startX:p.x,startY:p.y,offset:this.railMotion.offset,lastX:p.x,lastTime:performance.now(),velocity:0,moved:false};
    this.stage.app.canvas.setPointerCapture(event.pointerId);this.stage.app.canvas.style.cursor='grabbing';event.preventDefault();
  };
  private railMove=(event:PointerEvent)=>{
    const d=this.drag,rail=this.rail;if(!d||!rail||d.id!==event.pointerId)return;const p=this.point(event),now=performance.now();
    d.moved ||= Math.abs(p.x-d.startX)>7||Math.abs(p.y-d.startY)>7;
    d.velocity=d.velocity*.55+(d.lastX-p.x)/Math.max(8,now-d.lastTime)*.45;d.lastX=p.x;d.lastTime=now;
    this.railMotion.offset=railElastic(d.offset+d.startX-p.x,rail.max);this.positionRail(d.velocity);event.preventDefault();
  };
  private railUp=(event:PointerEvent)=>{
    const d=this.drag,rail=this.rail;if(!d||!rail||d.id!==event.pointerId)return;const p=this.point(event);
    this.cancelRailDrag();
    if(!d.moved){const local=p.x-rail.x+this.railMotion.offset,index=Math.floor(local/rail.stride);const pack=this.state!.packs[index];if(pack&&local-index*rail.stride<=rail.tile){this.state!.select(pack);return;}}
    const velocity=performance.now()-d.lastTime>90?0:d.velocity;
    this.animateRail(railSnap(this.railMotion.offset,velocity,rail.stride,rail.max));
  };
  private railCancel=()=>{this.cancelRailDrag();if(this.rail)this.animateRail(railSnap(this.railMotion.offset,0,this.rail.stride,this.rail.max));};
  private cancelRailDrag(){if(this.drag&&this.stage.app.canvas.hasPointerCapture(this.drag.id))this.stage.app.canvas.releasePointerCapture(this.drag.id);this.drag=null;this.stage.app.canvas.style.cursor='default';}
  railWheel=(event:WheelEvent)=>{const r=this.rail;if(!r)return;const p=this.point(event);if(p.y<r.y||p.y>r.y+r.height)return;event.preventDefault();this.animateRail(railPosition(this.railMotion.offset+(event.deltaX||event.deltaY),r.max),.25);};
  private animateRail(offset:number,duration=.48){
    this.railTween?.kill();const r=this.rail;if(!r)return;
    if(this.state!.reduced){this.railMotion.offset=offset;this.positionRail();this.syncRailTargets();return;}
    this.railTween=gsap.to(this.railMotion,{offset,duration,ease:'power3.out',onUpdate:()=>this.positionRail(),onComplete:()=>{this.railTween=null;this.positionRail();this.syncRailTargets();}});
  }
  private positionRail(velocity=0){const r=this.rail;if(!r)return;r.content.x=r.x-this.railMotion.offset;r.groups.forEach(group=>{group.rotation=this.state!.reduced?0:Math.max(-.025,Math.min(.025,-velocity*.012));});
    this.stage.draw();}
  private syncRailTargets(){
    const r=this.rail;if(!r)return;
    this.hits=this.hits.filter(hit=>!hit.canvasPointer);
    r.hits.forEach((hit,i)=>{const left=r.x+i*r.stride-this.railMotion.offset,right=left+r.tile;hit.x=Math.max(r.x,left);hit.width=Math.max(0,Math.min(r.x+r.width,right)-hit.x);if(hit.width>24)this.hits.push(hit);});
    this.focus.clear();this.emitTargets();
  }
  private iconButton(id:string,label:string,x:number,y:number,size:number,kind:'binder'|'gear'|'sound'|'mute'|'history'|'plus',action:()=>void){
    const group=new Container();this.root.addChild(group);this.paints.set(id,group);const cx=x+size/2,cy=y+size/2,r=size/2;
    const g=new Graphics().circle(cx,cy+3,r).fill({color:0x062c4d,alpha:.45}).circle(cx,cy,r).fill({color:0x15548c,alpha:.96}).stroke({color:0xd8f7ff,width:2}).circle(cx,cy,r-4).stroke({color:0x6cb8e7,width:1,alpha:.65});group.addChild(g);
    const icon=new Graphics(),white=0xf2fbff,unit=size/48;group.addChild(icon);icon.position.set(cx,cy);icon.scale.set(unit);
    if(kind==='binder'){icon.roundRect(-11,-12,17,23,3).fill(0x337ec0).stroke({color:white,width:2}).roundRect(-5,-8,17,23,3).fill(0x194b7b).stroke({color:white,width:2}).circle(3.5,3,4).stroke({color:white,width:1.6}).moveTo(-.5,3).lineTo(7.5,3).stroke({color:white,width:1.4});}
    else if(kind==='gear'){const points:number[]=[];for(let i=0;i<32;i++){const radius=i%4<2?13:10,a=i*Math.PI/16;points.push(Math.cos(a)*radius,Math.sin(a)*radius);}icon.poly(points).fill(white).circle(0,0,5).fill(0x15548c);}
    else if(kind==='history')icon.circle(0,0,12).stroke({color:white,width:2}).moveTo(0,-7).lineTo(0,0).lineTo(6,4).stroke({color:white,width:2.4});
    else if(kind==='plus')icon.roundRect(-10,-2,20,4,2).fill(white).roundRect(-2,-10,4,20,2).fill(white);
    else {icon.poly([-12,-4,-6,-4,1,-10,1,10,-6,4,-12,4]).fill(white);if(kind==='sound'){for(const radius of [7,12])icon.moveTo(1+Math.cos(-.7)*radius,Math.sin(-.7)*radius).arc(1,0,radius,-.7,.7).stroke({color:white,width:2});}else icon.moveTo(6,-5).lineTo(13,5).moveTo(6,5).lineTo(13,-5).stroke({color:white,width:2});}
    group.pivot.set(cx,cy);group.position.set(cx,cy);this.hits.push({id,label,x,y,width:size,height:size,disabled:false,action});return group;
  }
  private hud(w:number,h:number){
    const s=this.state!,l=gameLayout(w,h,!['browse','complete'].includes(s.phase));
    if(s.save&&!this.moneyValues.has('lifetime'))this.moneyValues.set('lifetime',moneyState(undefined,'lifetime',recordedWinnings(s.save),true));
    const logoW=l.portrait?116:148,logoH=l.portrait?44:55;
    this.picture('/assets/pokemon-logo.png',18,10,logoW,logoH);this.text('LEGENDS',18+logoW/2,l.portrait?50:59,8,0xffffff,this.root,'center','bold');
    const walletW=l.portrait?Math.min(181,w*.46):205,walletX=w-walletW-16,walletY=13;
    const wallet=new Graphics().roundRect(walletX,walletY,walletW,48,22).fill({color:0x06315a,alpha:.91}).stroke({width:1.5,color:0xa7e8ff,alpha:.85});this.root.addChild(wallet);
    this.text('Demo credits',walletX+17,walletY+5,8,C.muted);
    this.money(s.save?.balance??10000,w-59,walletY+15,l.portrait?26:28,C.white,'right','wallet','balance',false,walletW-61);
    this.iconButton('credits','Add 1000 free demo credits',w-49,walletY+8,32,'plus',()=>s.action('credits'));
    const size=l.compact?34:l.portrait?40:44,side=l.portrait?18:25,iconsY=l.compact?18:76;
    if(l.compact){
      const left=(w-(size*4+18))/2;
      this.iconButton('binder','My collection',left,iconsY,size,'binder',()=>s.action('collection'));
      this.iconButton('history','Opening history',left+size+6,iconsY,size,'history',()=>s.action('history'));
      this.iconButton('settings','Settings',left+(size+6)*2,iconsY,size,'gear',()=>s.action('settings'));
      this.iconButton('sound',s.sound?'Mute sound':'Enable sound',left+(size+6)*3,iconsY,size,s.sound?'sound':'mute',()=>s.action('sound'));
    }else{
      this.iconButton('binder','My collection',side,iconsY,size,'binder',()=>s.action('collection'));
      this.iconButton('history','Opening history',side+size+10,iconsY,size,'history',()=>s.action('history'));
      this.iconButton('settings','Settings',w-side-size*2-10,iconsY,size,'gear',()=>s.action('settings'));
      this.iconButton('sound',s.sound?'Mute sound':'Enable sound',w-side-size,iconsY,size,s.sound?'sound':'mute',()=>s.action('sound'));
    }
    const captionY=l.compact?65:l.sideControls?128:119;
    this.text(s.selected.name,side,captionY,l.compact?9:10,C.white,this.root,'left','bold');if(s.save?.active)this.revealCountLabel=this.text(`${Math.min(Math.max(this.landed.size,s.index+(['revealed','collecting','settling'].includes(s.phase)?1:0)),11)} / 11`,w-side,captionY,10,C.white,this.root,'right','bold');
  }
  private playControls(w:number,h:number){
    const s=this.state!,l=gameLayout(w,h,!['browse','complete'].includes(s.phase)),busy=['reserving','tearing','revealing','collecting','settling'].includes(s.phase);
    if(s.phase==='revealed'){
      const card=s.save!.active!.cards[s.index],space=(w-l.stageWidth)/2;
      const captionW=l.sideControls?Math.min(238,space-32):w-128;
      const captionX=l.sideControls?(space-captionW)/2:(w-captionW)/2,captionY=l.sideControls?Math.max(l.compact?85:172,l.worldY-3):l.actionTop-5;
      const titleSize=l.compact?14:l.sideControls?22:16;
      const title=this.text(card.name,l.sideControls?captionX: w/2,captionY,titleSize,C.white,this.root,l.sideControls?'left':'center','bold');title.style.stroke={color:0x08294a,width:3};
      if(title.width>captionW)title.scale.set(captionW/title.width);
      const rarity=this.text(card.rarity,l.sideControls?captionX:w/2,captionY+(l.compact?23:l.sideControls?32:22),l.sideControls?10:9,C.cyan,this.root,l.sideControls?'left':'center','bold');rarity.style.stroke={color:0x08294a,width:3};if(rarity.width>captionW)rarity.scale.set(captionW/rarity.width);
      this.hit('inspect',`Inspect ${card.name}`,captionX,captionY-5,captionW,l.sideControls?55:44,()=>s.inspect(card));
      const reward=rewardLayout(w,h,l.dockTop,l.sideControls,l.compact);
      if(card.id!=='energy')this.money(card.value,reward.x,reward.y,reward.size,C.white,'center','reward',`${s.save!.active!.id}-${s.index}`,true,reward.width);
      if(l.sideControls){
        const cx=w-space/2,cy=Math.max(l.compact?117:213,l.worldY+17),size=l.compact?48:76;
        this.command('next',s.index===10?'Collect':'Next card',cx,cy,size,'next',()=>s.action('next'));
        if(s.index<10)this.command('reveal-all','Reveal all',cx,cy+(l.compact?76:113),l.compact?34:44,'all',()=>s.action('all'));
      }else{
        this.command('next',s.index===10?'Collect':'Next card',w-37,l.dockTop-48,l.short?44:48,'next',()=>s.action('next'));
        if(s.index<10)this.command('reveal-all','Reveal all',37,l.dockTop-48,44,'all',()=>s.action('all'));
      }
    }else if(busy){
      const label=s.phase==='tearing'?'Opening':s.phase==='revealing'?'Revealing':['collecting','settling'].includes(s.phase)?'Collecting':'Preparing';
      const y=l.sideControls?l.dockTop-27:l.actionTop+25;this.text(label,w/2,y,12,C.white,this.root,'center','bold');
    }else{
      const y=l.compact?Math.max(76,(l.top+l.dockTop)/2-28):l.dockTop-68;this.openCommand(w,y,!s.ready||!s.save||(s.phase==='browse'&&!s.pool.length),l.compact?w*.80:w/2,l.compact?Math.min(204,w*.34):278);
    }
  }

  private rack(w:number,h:number){
    const s=this.state!,l=gameLayout(w,h,!['browse','complete'].includes(s.phase)),y=l.dockTop;
    const fade=new Sprite(this.tray);fade.position.set(0,y-25);fade.width=w;fade.height=l.dock+25;this.root.addChild(fade);
    if(s.save?.active&&!['revealing','revealed','collecting','settling'].includes(s.phase))return;
    if(s.save?.active){
      const revealed=Math.max(this.landed.size,s.index+(['revealed','collecting','settling'].includes(s.phase)?1:0)),total=s.save.active.cards.slice(0,revealed).reduce((n,c)=>n+c.value,0),tray=cardTrayLayout(w,h,this.collectingIndex??s.index);
      if(!l.compact){this.text('Pack value',20,y+8,10,C.white);this.packValueLabel=this.money(total,w-20,y+1,l.short?22:26,C.cyan,'right','revealed',s.save.active.id,false,w-130);}
      const viewport=new Container(),strip=new Container();this.trayStrip=strip;strip.y=tray.y;viewport.addChild(strip);this.root.addChild(viewport);const mask=new Graphics().rect(tray.viewportX,tray.y-5,tray.viewportWidth,tray.cardHeight+12).fill(0xffffff);this.root.addChild(mask);viewport.mask=mask;
      const base=tray.start+tray.offset;strip.x=base-this.trayOffset.value;
      if(s.phase==='revealing'&&this.trayOffset.value!==tray.offset&&!s.reduced)this.trayTween=gsap.to(this.trayOffset,{value:tray.offset,duration:.48,ease:'power3.out',onUpdate:()=>{strip.x=base-this.trayOffset.value;this.stage.draw();}});else{this.trayOffset.value=tray.offset;strip.x=tray.start;}
      s.save.active.cards.forEach((card,i)=>{
        const x=i*tray.stride,slot=new Container();slot.position.set(x,0);strip.addChild(slot);
        const active=i===s.index;const border=new Graphics().roundRect(-3,-3,tray.cardWidth+6,tray.cardHeight+6,7).fill({color:0x0b3155,alpha:.7}).stroke({width:active?2.5:1,color:active?0xc6f9ff:0x639bb7,alpha:active?1:.5});slot.addChild(border);
        const center=tray.slot(i),left=center.x-tray.cardWidth/2,right=left+tray.cardWidth;
        if(s.phase==='revealed'&&i<revealed&&right>tray.viewportX&&left<tray.viewportX+tray.viewportWidth)this.hit(`card-${i}`,`Inspect ${card.name}, card ${i+1}`,Math.max(tray.viewportX,left),tray.y,Math.min(right,tray.viewportX+tray.viewportWidth)-Math.max(left,tray.viewportX),tray.cardHeight,()=>s.inspect(card));
      });
      // One native canvas atlas keeps the static rack independent of animated
      // mesh buffers, with a single texture update for each landed card.
      const resolution=Math.min(2,this.stage.app.renderer.resolution),art=document.createElement('canvas'),artWidth=(s.save.active.cards.length-1)*tray.stride+tray.cardWidth;
      art.width=Math.ceil(artWidth*resolution);art.height=Math.ceil(tray.cardHeight*resolution);
      const context=art.getContext('2d')!,texture=Texture.from(art),sprite=new Sprite(texture);this.trayArt=texture;sprite.width=artWidth;sprite.height=tray.cardHeight;strip.addChild(sprite);
      const generation=this.generation,cards=s.save.active.cards,backPath='/assets/card-back.webp';
      const redraw=()=>{if(this.destroyed||generation!==this.generation)return;context.setTransform(resolution,0,0,resolution,0,0);context.clearRect(0,0,artWidth,tray.cardHeight);cards.forEach((card,i)=>{const face=this.landed.has(i),image=this.thumbs.get(face?card.image:backPath);if(!image)return;const scale=Math.min(tray.cardWidth/image.width,tray.cardHeight/image.height),cw=image.width*scale,ch=image.height*scale;context.globalAlpha=!face&&i===s.index?.24:1;context.drawImage(image.source.resource as CanvasImageSource,i*tray.stride+(tray.cardWidth-cw)/2,(tray.cardHeight-ch)/2,cw,ch);});context.globalAlpha=1;texture.source.update();this.stage.draw();};
      this.redrawTray=redraw;redraw();
      const paths=new Set([backPath,...cards.map(card=>card.image)]);paths.forEach(path=>{void this.thumbnail(path).then(redraw).catch(()=>{});});
      return;
    }
    const tile=l.compact?124:l.portrait?190:200,stride=tile+14,margin=l.portrait?14:24;
    const viewport={x:margin,y:y+8,width:w-margin*2,height:tile+7};
    const content=new Container();content.y=viewport.y;this.root.addChild(content);
    const footY=(l.compact?68:tile-63)+5;
    // Light chevrons travel with the carousel, between the pack holders.
    for(let i=0;i<s.packs.length-1;i++){
      const arrows=new Container();arrows.position.set(i*stride+tile+7,footY-4);content.addChild(arrows);
      for(let n=0;n<2;n++){const a=new Graphics().moveTo(-9+n*10,-4).lineTo(-5+n*10,0).lineTo(-9+n*10,4).stroke({color:0xa8f6ff,width:2,alpha:.85});a.alpha=.3+n*.3;arrows.addChild(a);if(!s.reduced)this.moneyAnimations.push(gsap.to(a,{alpha:.9,x:4,duration:.65,delay:n*.16,repeat:-1,yoyo:true,ease:'sine.inOut',onUpdate:()=>this.stage.draw()}));}
    }
    const mask=new Graphics().rect(viewport.x,viewport.y-4,viewport.width,viewport.height+8).fill(0xffffff);this.root.addChild(mask);content.mask=mask;
    const groups:Container[]=[],hits:HitTarget[]=[];
    this.railMotion.offset=railPosition(this.railMotion.offset,Math.max(0,s.packs.length*stride-14-viewport.width));
    s.packs.forEach((pack,i)=>{
      const selected=pack.id===s.selected.id,group=new Container();group.pivot.set(tile/2,tile/2);group.position.set(i*stride+tile/2,tile/2);content.addChild(group);groups.push(group);this.paints.set(`pack-${pack.id}`,group);
      const artH=l.compact?68:tile-63,footY=artH+5;
      // Packs float directly over the scene, like the original selector.
      // Keep the larger hit area without drawing a tile around the artwork.
      const shadow=new Graphics().ellipse(tile/2,footY,selected?59:48,7).fill({color:selected?0x9eefff:0x031d34,alpha:selected?.3:.48});group.addChild(shadow);
      if(selected){
        const glow=new Graphics().ellipse(tile/2,footY,69,12).fill({color:0x7fe8ff,alpha:.08}).ellipse(tile/2,footY,57,6).stroke({color:0xc6fbff,width:1.5,alpha:.65});group.addChild(glow);
        if(!s.reduced)this.moneyAnimations.push(gsap.to(glow,{alpha:.45,duration:1.15,repeat:-1,yoyo:true,ease:'sine.inOut',onUpdate:()=>this.stage.draw()}));
      }
      this.picture(pack.packImage,tile/2-49,7,98,artH,group);
      this.text(pack.name,tile/2,tile-53,l.compact?10:12,C.white,group,'center','bold',tile-14);
      const badgeWidth=l.compact?tile-16:132,badgeHeight=l.compact?26:32;const badge=new Graphics().roundRect((tile-badgeWidth)/2,tile-34,badgeWidth,badgeHeight,badgeHeight/2).fill({color:selected?0xc9f6ff:0x0b3052,alpha:.96}).stroke({color:selected?0xf1ffff:0x72a4c6,width:selected?2:1});group.addChild(badge);
      const price=new BitmapText({text:money(pack.price),style:{fontFamily:'LegendsMoney',fontSize:l.compact?20:27}});price.anchor.set(.5);price.position.set(tile/2,tile-34+badgeHeight/2);price.tint=selected?0x17436a:C.white;group.addChild(price);
      if(selected)this.ball((tile-badgeWidth)/2-11,tile-34+badgeHeight/2,4,0xd6ffff,group);
      hits.push({id:`pack-${pack.id}`,label:`${pack.name}, ${money(pack.price)}`,x:0,y:viewport.y,width:tile,height:tile,disabled:false,action:()=>s.select(pack),canvasPointer:true,selected});
      if(selected&&this.lastPackId!==pack.id&&!s.reduced)this.moneyAnimations.push(gsap.from(group.scale,{x:.95,y:.95,duration:.36,ease:'back.out(1.8)'}));
    });
    this.lastPackId=s.selected.id;
    this.rail={content,...viewport,tile,stride,max:Math.max(0,s.packs.length*stride-14-viewport.width),groups,hits};this.positionRail();
    // The edge affordances use the same small luminous chevrons, with 36px hit targets.
    for(const direction of [-1,1]){
      const x=direction<0?3:w-39,ay=viewport.y+tile/2-22,id=direction<0?'pack-prev':'pack-next',label=direction<0?'Previous packs':'Next packs';
      const arrow=new Graphics();for(let n=0;n<2;n++)arrow.moveTo(14+direction*(n*7-4),12).lineTo(14+direction*(n*7+1),20).lineTo(14+direction*(n*7-4),28).stroke({color:0xc6f9ff,width:2.5,alpha:1-n*.3});
      arrow.position.set(x,ay);this.root.addChild(arrow);this.hit(id,label,x,ay,36,44,()=>this.animateRail(railPosition(this.railMotion.offset+direction*stride,this.rail!.max)));
      if(!s.reduced)this.moneyAnimations.push(gsap.to(arrow,{alpha:.4,duration:.85,repeat:-1,yoyo:true,ease:'sine.inOut',onUpdate:()=>this.stage.draw()}));
    }
    hits.forEach((hit,i)=>{const left=viewport.x+i*stride-this.railMotion.offset,right=left+tile;hit.x=Math.max(viewport.x,left);hit.width=Math.max(0,Math.min(viewport.x+viewport.width,right)-hit.x);if(hit.width>24)this.hits.push(hit);});
  }
  private storeCard=(index:number)=>{
    this.landed.add(index);this.redrawTray?.();
    if(this.state?.phase==='collecting'){
      const active=this.state.save!.active!,total=active.cards.filter((_,i)=>this.landed.has(i)).reduce((n,c)=>n+c.value,0);
      if(this.packValueLabel)this.packValueLabel.retarget(total);
      if(this.revealCountLabel)this.revealCountLabel.text=`${this.landed.size} / 11`;
    }
    this.stage.draw();
  };
  private cardDestination=(index:number)=>{
    const tray=cardTrayLayout(this.stage.app.screen.width,this.stage.app.screen.height,this.collectingIndex??this.state?.index??0);
    return {x:tray.start+tray.offset-this.trayOffset.value+index*tray.stride+tray.cardWidth/2,y:tray.y+tray.cardHeight/2,cardWidth:tray.cardWidth};
  };
  private focusTray=(index:number)=>{
    this.collectingIndex=index;const strip=this.trayStrip;if(!strip)return;
    const tray=cardTrayLayout(this.stage.app.screen.width,this.stage.app.screen.height,index),base=tray.start+tray.offset;
    this.trayTween?.kill();
    if(this.state!.reduced){this.trayOffset.value=tray.offset;strip.x=tray.start;}
    else this.trayTween=gsap.to(this.trayOffset,{value:tray.offset,duration:.06,ease:'power2.out',onUpdate:()=>{strip.x=base-this.trayOffset.value;this.stage.draw();}});
  };
  private screen(title:string,w:number,h:number,subtitle?:string){
    const shape=(x:number,y:number,width:number,height:number,cut:number)=>[x+cut,y,x+width-cut,y,x+width,y+cut,x+width,y+height-cut,x+width-cut,y+height,x+cut,y+height,x,y+height-cut,x,y+cut];
    const body=new Graphics().poly(shape(8,8,w-16,h-16,20)).fill(0x06182e).stroke({color:0x03101d,width:4}).poly(shape(12,12,w-24,h-24,18)).fill(0x0d2c4a).stroke({color:0x8abed7,width:2});
    body.poly(shape(17,17,w-34,66,13)).fill(0x195f93).moveTo(34,21).lineTo(w-34,21).stroke({color:0xb3edff,width:2,alpha:.55});
    body.moveTo(30,h-77).lineTo(w-30,h-77).stroke({color:0x6da5bc,width:1,alpha:.22});
    body.circle(48,48,22).fill(0x06182e).stroke({color:0xb4d4df,width:3}).circle(48,48,16).fill(0x318ed1).circle(43,42,6).fill({color:0xd4f9ff,alpha:.8});
    for(let i=0;i<3;i++)body.roundRect(31+i*11,77,7,3,1).fill(i===0?0xe15c73:i===1?0x7fdef3:0x3c8caf);
    this.root.addChild(body);
    const heading=this.text(title,84,26,w<700?21:25,C.white,this.root,'left','bold');if(heading.width>w-164)heading.scale.set((w-164)/heading.width);
    if(subtitle){const sub=this.text(subtitle,85,58,10,0xc2e3f4);if(sub.width>w-166)sub.scale.set((w-166)/sub.width);}
    this.button('close',this.state!.inspected?'Close card viewer':'Return to game',w-68,26,44,44,()=>this.dismissModal(),{visibleLabel:'×',large:true});
  }
  private collection(w:number,h:number){
    const s=this.state!,portrait=w<700,compact=h<550&&w>=560;
    const source=this.collected?s.cards.filter(c=>s.save?.collection[c.id]):s.pool;
    const rows=compact?1:2,columns=portrait?2:Math.max(4,Math.min(6,Math.floor((w-70)/150))),size=columns*rows;
    const page=pageWindow(source.length,size,this.page);this.page=page.page;
    this.screen('Card binder',w,h,`${Object.keys(s.save?.collection??{}).length} cards discovered`);
    const filterW=portrait?(w-74)/2:190;
    this.button('set-filter',s.selected.name,32,96,filterW,44,()=>{this.collected=false;this.page=0;this.build();},{active:!this.collected,small:true});
    this.button('collected-filter','Collected cards',32+filterW+10,96,portrait?filterW:165,44,()=>{this.collected=true;this.page=0;this.build();},{active:this.collected,small:true,visibleLabel:'Collected'});
    if(!portrait)this.button('export','Export collection',w-187,96,155,44,()=>s.action('export'),{small:true});
    if(!source.length){this.ball(w/2,h/2-30,36,C.line);this.text('Your binder is waiting.',w/2,h/2+22,20,C.white,this.root,'center','bold');this.text('Open a pack to collect your first cards.',w/2,h/2+54,12,C.muted,this.root,'center');}
    const top=156,bottom=h-93,slotW=(w-64-(columns-1)*14)/columns,slotH=(bottom-top-16*(rows-1))/rows;
    source.slice(page.start,page.end).forEach((card,i)=>{
      const x=32+(i%columns)*(slotW+14),y=top+Math.floor(i/columns)*(slotH+16),count=s.save?.collection[card.id]??0;
      this.panel(x,y,slotW,slotH,0x102b44,count?0x416d89:0x223f5b,this.root,6);
      const imgH=Math.max(24,slotH-(compact?12:49)),imgW=Math.min(slotW-12,imgH/1.397);this.picture(card.image,compact?x+7:x+(slotW-imgW)/2,y+5,imgW,imgH);
      const textX=compact?x+imgW+18:x+9,textW=compact?slotW-imgW-27:slotW-18;
      const name=this.text(card.name,textX,compact?y+12:y+slotH-37,portrait?11:12,C.white,this.root,'left','bold');if(name.width>textW)name.scale.set(textW/name.width);
      this.text(count?`×${count}`:`#${card.number}`,compact?textX:x+7,compact?y+33:y+slotH-15,9,count?C.cyan:C.muted);
      this.text(money(card.value),x+slotW-7,y+slotH-15,9,C.muted,this.root,'right');
      this.hit(`binder-${card.id}`,`${card.name}, ${count} collected`,x,y,slotW,slotH,()=>s.inspect(card));
    });
    this.button('page-prev','Previous collection page',32,h-65,76,44,()=>{this.page--;this.build();},{disabled:page.page===0,visibleLabel:'‹ Back',small:true});
    this.text(`${page.page+1} / ${page.pages}`,w/2,h-50,12,C.cyan,this.root,'center','bold');
    this.button('page-next','Next collection page',w-108,h-65,76,44,()=>{this.page++;this.build();},{disabled:page.page+1===page.pages,visibleLabel:'Next ›',small:true});
  }
  private settingsDrawer(w:number,h:number){
    const s=this.state!,wide=h<500&&w>=560,width=Math.min(wide?660:400,w-28),x=w-width-14,contentX=x+22,contentW=width-44;
    const shell=new Graphics().roundRect(x,14,width,h-28,22).fill(0x06182e).stroke({color:0x03101d,width:4}).roundRect(x+4,18,width-8,h-36,18).fill(0x0d2c4a).stroke({color:0x8abed7,width:2});
    shell.roundRect(x+9,23,width-18,58,12).fill(0x195f93).circle(x+34,51,14).fill(0x318ed1).stroke({color:0xc7edff,width:3}).circle(x+30,47,4).fill(0xe2ffff);this.root.addChild(shell);
    this.text('Settings',x+60,34,23,C.white,this.root,'left','bold');
    this.button('close','Return to game',x+width-66,30,44,44,()=>this.dismissModal(),{visibleLabel:'×',large:true});
    const top=wide?90:96,rowH=wide?50:h<620?48:60,gap=10,mainW=wide?(contentW-20)/2:contentW;
    [['Sound',s.sound,'sound'],['Reduced motion',s.reduced,'reduced'],['Low graphics',s.low,'low']].forEach(([label,value,action],i)=>{
      const yy=top+i*(rowH+gap);this.panel(contentX,yy,mainW,rowH,0x123c5c,0x2b617c);const name=this.text(String(label),contentX+12,yy+(rowH-19)/2,14,C.white,this.root,'left','bold');if(name.width>mainW-94)name.scale.set((mainW-94)/name.width);
      const sx=contentX+mainW-72,cy=yy+rowH/2,on=!!value;
      const toggle=new Graphics().roundRect(sx,cy-15,58,30,15).fill(on?0x278dc0:0x061e34).stroke({color:on?0x8de8ff:0x47728d,width:1.5}).circle(sx+(on?43:15),cy,11).fill(on?0xe5faff:0x8caabd);this.root.addChild(toggle);this.ball(sx+(on?43:15),cy,5,on?0x27688d:0x34566a);
      this.hit(String(action),`${label}: ${value?'on':'off'}`,contentX,yy,mainW,rowH,()=>s.action(action as GameAction));
    });
    const ax=wide?contentX+mainW+20:contentX,aw=wide?mainW:contentW,start=wide?top:top+3*(rowH+gap)+8,half=(aw-10)/2;
    this.button('credits-menu','Add 1000 demo credits',ax,start,wide?aw:half,44,()=>s.action('credits'),{primary:true,small:true,visibleLabel:'+1,000 credits'});
    this.button('fullscreen','Full screen',wide?ax:ax+half+10,wide?start+54:start,wide?aw:half,44,()=>s.action('fullscreen'),{small:true});
    const navY=start+(wide?108:54),third=(aw-20)/3;
    [['History','history'],['Help','about'],['Export','export']].forEach(([label,action],i)=>this.button(`drawer-${action}`,label,ax+i*(third+10),navY,third,44,()=>s.action(action as GameAction),{small:true}));
    this.button('reset-menu','Reset demo and collection',ax,navY+54,aw,44,()=>s.action('reset'),{disabled:!!s.save?.active,small:true,visibleLabel:'Reset demo'});
    if(!wide&&h>550)this.text('Demo credits only',x+width/2,h-39,10,C.muted,this.root,'center');
  }
  private menu(w:number,h:number){
    const s=this.state!;if(s.panel==='settings'){this.settingsDrawer(w,h);return;}
    this.screen(s.panel==='history'?'Opening history':'How to play',w,h);
    const x=Math.max(28,(w-520)/2),width=Math.min(520,w-56);const y=s.panel==='history'?171:107;
    if(s.panel==='history'){
      this.text('TOTAL WON',x,108,10,C.muted,this.root,'left','bold');
      this.money(s.save?recordedWinnings(s.save):0,x+width,99,34,C.cyan,'right','lifetime','lifetime',false,width-100);
      const rows=Math.max(1,Math.floor((h-239)/66)),history=s.save?.history??[],pg=pageWindow(history.length,rows,this.page);this.page=pg.page;
      if(!history.length)this.text('No completed openings yet.',w/2,h/2,16,C.muted,this.root,'center');
      history.slice(pg.start,pg.end).forEach((result,i)=>{const yy=y+i*66;this.panel(x,yy,width,55,0x112b42,0x25465f);this.picture(result.pack?.packImage??s.packs[0].packImage,x+10,yy+4,28,48);const title=this.text(result.pack?.name??'Obsidian Flames',x+53,yy+9,13,C.white,this.root,'left','bold');if(title.width>width-70)title.scale.set((width-70)/title.width);this.text(new Date(result.at).toLocaleDateString(),x+53,yy+33,9,C.muted);this.money(result.total,x+width-13,yy+29,18,C.cyan,'right',`history-${result.id}`,result.id,false,Math.min(150,width*.42));});
      this.button('history-back','Previous history page',x,h-65,76,44,()=>{this.page--;this.build();},{disabled:pg.page===0,visibleLabel:'‹',small:true});this.text(`${pg.page+1} / ${pg.pages}`,w/2,h-50,12,C.muted,this.root,'center');this.button('history-next','Next history page',x+width-76,h-65,76,44,()=>{this.page++;this.build();},{disabled:pg.page+1===pg.pages,visibleLabel:'›',small:true});
    }else{
      const lines=['Choose a pack, then slide across its seal to open it.','Tap Next card or press Space to reveal. Inspect a card for a closer look.','The revealed value is credited when you collect the pack. Energy has no value.','Your cards and unfinished pack are saved in this browser.','This is a frontend demo. Credits have no cash value; card values and odds are illustrative.'];
      lines.forEach((line,i)=>this.text(line,x,y+i*Math.min(72,(h-135)/5),h<550?12:14,i===4?C.muted:C.white,this.root,'left','normal',width));
    }
  }
  private inspector(w:number,h:number,card:Card){
    this.screen(card.name,w,h,`${card.rarity} · #${card.number||'Energy'}`);
    const area={x:24,y:91,w:w-48,h:h-115};
    this.picture(card.image,area.x,area.y,area.w,area.h,this.root,true);
  }
  private results(w:number,h:number,result:Result){
    const compact=h<550&&w>=560,short=h<620;
    this.screen('Pack collected',w,h,result.pack?.name??'Obsidian Flames');
    this.money(result.total,w/2,compact?87:short?92:96,compact?32:short?32:w<700?42:52,C.cyan,'center','result',result.id,true,w-56);this.text('Added to your balance',w/2,compact?124:short?139:w<700?151:162,11,C.muted,this.root,'center');
    if(!compact&&this.state!.save){this.text('TOTAL WON',w/2-110,short?168:184,9,C.muted,this.root,'left','bold');this.money(recordedWinnings(this.state!.save!),w/2+110,short?160:176,23,C.white,'right','lifetime','lifetime',false,145);}
    const columns=compact?11:w<700?4:6,rows=Math.ceil(11/columns),top=compact?148:short?200:221,bottom=h-95;
    const cw=Math.min(145,(w-54-(columns-1)*12)/columns),ch=Math.min(cw*1.4,(bottom-top-(rows-1)*23)/rows-20),drawW=ch/1.4;
    result.cards.forEach((card,i)=>{const row=Math.floor(i/columns),col=i%columns,number=Math.min(columns,11-row*columns),rowWidth=number*(drawW+12)-12,x=(w-rowWidth)/2+col*(drawW+12),y=top+row*(ch+33);this.picture(card.image,x,y,drawW,ch);const exact=money(card.value),caption=drawW<55&&exact.length>6?'$'+new Intl.NumberFormat('en-US',{notation:'compact',maximumFractionDigits:1}).format(card.value/100):exact;const price=this.text(card.id==='energy'?'Energy':caption,x+drawW/2,y+ch+7,10,C.cyan,this.root,'center');if(price.width>drawW+8)price.scale.set((drawW+8)/price.width);this.hit(`result-${i}`,`Inspect ${card.name}`,x,y,drawW,ch,()=>this.state!.inspect(card));});
    this.button('result-collection','View collection',Math.max(28,w/2-165),h-65,Math.min(155,(w-68)/2),44,()=>this.state!.action('collection'),{visibleLabel:'Collection'});this.button('result-continue','Continue',w/2+6,h-65,Math.min(155,(w-68)/2),44,()=>this.dismissModal('continue'),{primary:true});
  }
  destroy(){this.feedbackTweens.forEach(t=>t.kill());this.feedbackTweens.clear();this.trayArt?.destroy(true);this.frozenHud?.destroy({texture:true,textureSource:true});this.modalTween?.kill();this.backdrop.destroy();this.trayTween?.kill();this.stage.onCardStored=null;this.stage.onCollectFocus=null;this.stage.cardDestination=null;this.railTween?.kill();this.cancelRailDrag();const canvas=this.stage.app.canvas;canvas.removeEventListener('pointerdown',this.railDown);canvas.removeEventListener('pointermove',this.railMove);canvas.removeEventListener('pointerup',this.railUp);canvas.removeEventListener('pointercancel',this.railCancel);canvas.removeEventListener('wheel',this.railWheel);this.moneyAnimations.forEach(t=>t.kill());this.destroyed=true;++this.generation;window.removeEventListener('keydown',this.keydown);this.stage.onLayout=null;this.root.destroy({children:true});this.thumbs.forEach(t=>t.destroy(true));this.thumbs.clear();this.pending.clear();this.tray.destroy(true);BitmapFont.uninstall('LegendsMoney');}
}
