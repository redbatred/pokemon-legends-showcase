import { Assets, Container, Graphics, Sprite, Text, Texture, BitmapFont, BitmapText,Rectangle,type Ticker } from 'pixi.js';
import { gsap } from 'gsap';
import {packGridLayout,packTileLayout} from './packGrid';
import {binderLayout,historyLayout} from './libraryLayout';
import {cardPowerKind} from './powerProfiles';
import {historyFanLayout} from './historyFan';
import {settingsLayout} from './settingsLayout';
import {packResultsLayout,autoResultsLayout,collectionFlight} from './packResultsLayout';
import {packRevealLayout} from './packRevealMotion';
import {playSound} from './audio';
import {openingUiPose} from './openingUiMotion';
import {utilityLayout,compactToolbar} from './utilityLayout';
import {TrayPan} from './trayPan';
import {AUTO_SPIN_COUNTS,openingAnimationRate,type AutoRevealMode,type AutoSpinView} from './autoSpin';
import { gameLayout, pageWindow, cardTrayLayout,revealControlsLayout } from './rendering';
import { money, recordedWinnings, type Card, type Pack, type Save, type Result } from './model';
import {modalLayout,totalWinLayout,creditLayout,autoSpinLayout} from './modalLayout';
import {MoneyReadout} from './MoneyReadout';
import {ResultWin} from './ResultWin';
import {AutoPackBridge} from './AutoPackBridge';
import {RewardTransfers} from './RewardTransfers';
import {preloadWinCelebration} from './WinCelebration';
import {winTier} from './winTransfer';
import {moneyState,type MoneyState} from './moneyMotion';
import { loadPackTexture } from './packTexture';
import {HoloCard} from './HoloCard';
import {foilStrength} from './foil';
import {SpecialCardFrame} from './SpecialCardFrame';
import {isSpecialCard} from './specialCard';
import type { OpeningStage } from './Stage';

export type Panel = 'collection'|'settings'|'history'|'about'|'auto'|null;
export type GameAction = 'open'|'tear'|'next'|'all'|'continue'|'close'|'collection'|'settings'|'history'|'about'|'credits'|'sound'|'turbo'|'auto'|'auto-start'|'auto-stop'|'low'|'reset'|'export'|'retry'|'dismiss'|'fullscreen';
export interface UIState {phase:string;index:number;groupRevealCount?:number;save:Save|null;packs:Pack[];selected:Pack;pool:Card[];cards:Card[];ready:boolean;error:string;toast:string;panel:Panel;inspected:Card|null;result?:Result;sound:boolean;turbo?:boolean;autoCount?:number;autoMode?:AutoRevealMode;autoRun?:AutoSpinView;configureAuto?:(count:number,mode:AutoRevealMode)=>void;reduced:boolean;low:boolean;action:(action:GameAction)=>void;select:(pack:Pack)=>void;inspect:(card:Card)=>void}
export interface HitTarget {id:string;label:string;x:number;y:number;width:number;height:number;disabled:boolean;action:()=>void;selected?:boolean}
const C={ink:0x092846,panel:0x183e60,raised:0x235781,line:0x5484a8,cyan:0x9aeeff,white:0xf3fbff,muted:0xa3c2d9,blue:0x246ec1};

/** Pixi draws every visible control. Transparent DOM targets provide keyboard/screen-reader access only. */
export class CanvasUI {
  root=new Container({isRenderGroup:true}); private focus=new Graphics();private state:UIState|null=null;
  private backdrop=new Graphics();private modalTween:gsap.core.Timeline|null=null;private modalKind='';private transitioning=false;
  private frozenHud:Sprite|null=null;
  private returnCover:Sprite|null=null;private returnTween:gsap.core.Tween|null=null;
  private autoCover:AutoPackBridge|null=null;private autoCoverTween:gsap.core.Tween|null=null;
  private autoCoverMotion={value:0};
  private interludeEntry=false;private autoResultsPage=0;private autoPack:Result|null=null;private autoIdentity='';private resultUnderlay:Sprite|null=null;private resultLaunch:{sources:{x:number;y:number;cardWidth:number}[];total:ReturnType<typeof totalWinLayout>}|null=null;
  private resultChrome:Container|null=null;private resultAmount:ResultWin|null=null;private resultCards:{group:Container;x:number;y:number;width:number;index:number}[]=[];
  private modalOrigin={x:0,y:0};
  private tray:Texture;
  private moneyAnimations:gsap.core.Tween[]=[];private moneyValues=new Map<string,MoneyState>();
  private rewards:RewardTransfers;private cardCaptions:Text[]=[];
  private rewardPhaseKey='';
  private awardCard=(card:Card,immediate=false)=>{
    const s=this.state;if(!s?.save?.active||s.save.active.cards[s.index]?.id!==card.id)return;
    const tier=winTier(card,s.save.active.pack?.price??s.selected.price,!!s.save.active.previewSpecial&&s.index===0);
    this.rewards.reveal(s.index,card.value,s.reduced,tier,s.low,cardPowerKind(card));
    this.stage.scene.setBoard({phase:'revealed',packName:s.save.active.pack?.name??s.selected.name,index:s.index,cardName:card.name,cardValue:card.value,special:!!tier});
    if(immediate){this.rewards.finish(s.index);this.rewards.update(0,this.stage.app.screen.width,this.stage.app.screen.height,s.reduced);this.stage.draw();}
  };
  private tickRewards=(ticker:Ticker)=>{this.animateChrome();const s=this.state;if(!s)return;const visible=!s.panel&&!s.inspected&&['awaiting','revealing','revealed','collecting','settling'].includes(s.phase);this.rewards.root.visible=visible;this.rewards.background.visible=visible;if(visible)this.rewards.update(ticker.deltaMS/1000,this.stage.app.screen.width,this.stage.app.screen.height,s.reduced,openingAnimationRate(false,!!s.autoRun&&!s.turbo));for(const caption of this.cardCaptions)caption.alpha=1-this.rewards.celebrationOpacity;};
  private creditReward=(total:number)=>{if(this.moneyValues.get('revealed')?.target===total)return;if(this.packValueLabel){this.packValueLabel.retarget(total);this.packValueLabel.pulse();}else this.moneyValues.set('revealed',moneyState(this.moneyValues.get('revealed'),this.openingId,total,false));};
  private updating=false;
  private lastPackId='';private rackGroup:Container|null=null;private rackMask:Graphics|null=null;private rackGlow:Graphics|null=null;private rackKind:'packs'|'cards'='packs';private arrowPulses:{glyph:Graphics;base:number;phase:number;axis:'x'|'y'}[]=[];
  private cardPulses:{group:Container;baseX:number;baseY:number;rotation:number;phase:number;shine:Graphics}[]=[];
  private generation=0;private hits:HitTarget[]=[];private paints=new Map<string,Container>();private feedbackTweens=new Map<string,gsap.core.Tween>();
  private historyOpening:Result|null=null;private historySelection=0;private historyFanCards:{group:Container;x:number;y:number;rotation:number;scale:number;ready:boolean}[]=[];private historyFanTime=0;private tickHistoryFan=(_time:number,delta:number)=>{if(document.hidden)return;this.historyFanTime+=delta/1000;this.animateHistoryFan(Math.min(.05,delta/1000));this.stage.draw();};private historyFanTitle:Text|null=null;private historyFanRarity:Text|null=null;private historyFanValue:MoneyReadout|null=null;
  private page=0;private collected=false;private openingId='';private landed=new Set<number>();
  private trayArt:Texture|null=null;private redrawTray:(()=>void)|null=null;private trayOffset={value:0};private trayTween:gsap.core.Tween|null=null;
  private trayPan=new TrayPan();private trayPointer:number|null=null;private trayInterrupted=false;private trayFocusKey='';private suppressTrayClickUntil=0;private trayHost:HTMLElement;
  private specialFrames=new Set<SpecialCardFrame>();
  private tickSpecialFrames=(_time:number,delta:number)=>{if(document.hidden||this.state?.reduced)return;for(const frame of this.specialFrames)frame.update(Math.min(.05,delta/1000));if(this.specialFrames.size)this.stage.draw();};
  private trayPrices=new Map<number,Container>();
  private trayStrip:Container|null=null;private collectingIndex:number|null=null;
  private packValueLabel:MoneyReadout|null=null;private revealCountLabel:Text|null=null;
  private thumbs=new Map<string,Texture>();private pending=new Map<string,Promise<Texture>>();private destroyed=false;
  constructor(private stage:OpeningStage,private onTargets:(hits:HitTarget[],summary:string)=>void){
    void preloadWinCelebration().catch(()=>{});
    BitmapFont.install({name:'LegendsMoney',style:{fontFamily:'Nunito',fontSize:64,fontWeight:'900',fill:0xffffff,stroke:{color:0x082e52,width:3}},chars:'0123456789$.,+- ',resolution:3,padding:3,skipKerning:true});
    const canvas=document.createElement('canvas');canvas.width=8;canvas.height=128;const ctx=canvas.getContext('2d')!;const gradient=ctx.createLinearGradient(0,0,0,128);gradient.addColorStop(0,'rgba(4,14,29,0)');gradient.addColorStop(1,'rgba(4,14,29,.65)');ctx.fillStyle=gradient;ctx.fillRect(0,0,8,128);this.tray=Texture.from(canvas);
    this.rewards=new RewardTransfers(this.creditReward,()=>stage.draw());stage.app.stage.addChildAt(this.rewards.background,stage.app.stage.getChildIndex(stage.world));stage.app.ticker.add(this.tickRewards);
    stage.app.stage.addChild(this.backdrop,this.root,stage.flightLayer,this.rewards.root);stage.onCardStored=this.storeCard;stage.onSpecialWin=this.awardCard;stage.onLayout=()=>{if(!this.updating)this.build();};
    stage.onCollectFocus=this.focusTray;stage.cardDestination=this.cardDestination;
    window.addEventListener('keydown',this.keydown);
    this.trayHost=stage.app.canvas.parentElement!;this.trayHost.addEventListener('pointerdown',this.trayDown,true);this.trayHost.addEventListener('pointermove',this.trayMove,true);this.trayHost.addEventListener('pointerup',this.trayUp,true);this.trayHost.addEventListener('pointercancel',this.trayCancel,true);this.trayHost.addEventListener('click',this.trayClick,true);this.trayHost.addEventListener('wheel',this.trayWheel,{capture:true,passive:false});

  }
  update(state:UIState){
    this.interludeEntry=!!state.autoRun?.interlude&&!this.state?.autoRun?.interlude;
    if((state.autoRun?.id??'')!==this.autoIdentity){this.autoIdentity=state.autoRun?.id??'';this.autoResultsPage=0;this.autoPack=null;}
    if(state.phase==='complete'&&this.state?.phase!=='complete'&&state.result&&!state.autoRun?.interlude&&(state.autoRun?.results.length??0)<=1&&!state.panel&&!state.inspected)this.resultLaunch={sources:state.result.cards.map((_,i)=>this.cardDestination(i)),total:totalWinLayout(this.stage.app.screen.width,this.stage.app.screen.height)};
    if(this.state?.phase==='revealing'&&state.phase==='revealed')this.trayOffset.value=cardTrayLayout(this.stage.app.screen.width,this.stage.app.screen.height,state.index).offset;
    const id=state.save?.active?.id??'';if(id!==this.openingId){this.openingId=id;this.landed.clear();this.trayOffset.value=0;this.trayFocusKey='';this.trayPan.cancel();this.rewards.reset(id,state.save?.active?.cards.slice(0,state.index).map(c=>c.value)??[]);this.moneyValues.delete('revealed');}
    if(state.phase==='revealed')for(let i=0;i<state.index;i++)this.landed.add(i);
    this.state=state;if(state.panel!=='history')this.historyOpening=null;
    if(!['collecting','settling'].includes(state.phase))this.collectingIndex=null;
    this.updating=true;
    const arena=['awaiting','revealing','revealed','collecting','settling','complete'].includes(state.phase)||!!state.autoRun?.running&&state.autoRun.completed>0;
    this.stage.setLayoutMode(arena);
    this.stage.setScene(arena);
    this.stage.setBlocked(!!state.panel||!!state.inspected||state.phase==='complete');
    if(state.panel||state.inspected||state.phase==='complete')this.stage.app.stage.addChild(this.backdrop,this.root);else this.stage.app.stage.addChild(this.stage.flightLayer,this.rewards.root);
    this.rewards.background.visible=this.rewards.root.visible=!state.panel&&!state.inspected&&['awaiting','revealing','revealed','collecting','settling'].includes(state.phase);
    this.updating=false;
    const phaseKey=`${id}:${state.index}:${state.phase}:${state.selected.id}`;
    if(phaseKey!==this.rewardPhaseKey){const card=state.phase==='revealed'?state.save?.active?.cards[state.index]:undefined;this.stage.scene.setBoard({phase:state.phase,packName:state.save?.active?.pack?.name??state.selected.name,index:state.index,cardName:card?.name,cardValue:card?.value});}
    if(phaseKey!==this.rewardPhaseKey&&(state.phase==='collecting'||state.phase==='revealing'))this.rewards.rush();this.rewardPhaseKey=phaseKey;
    this.build();
    if(this.autoCover&&!this.autoCoverTween&&(state.phase==='tearing'||state.phase==='awaiting'||!state.autoRun?.running||state.error||state.panel||state.inspected))this.finishAutoPackTransition();
    if(state.phase==='revealed'&&state.save?.active)this.awardCard(state.save.active.cards[state.index]);
  }
  /** Preserve the complete award frame until the next wrapper is actually ready.
   * This cover survives the browse/reservation/asset-loading rebuilds. */
  beginAutoPackTransition(){
    if(this.destroyed||this.autoCover)return;
    const {width,height}=this.stage.app.screen;
    this.autoCoverMotion.value=0;
    this.root.visible=false;
    let texture:Texture;try{texture=this.stage.app.renderer.generateTexture({target:this.stage.app.stage,frame:new Rectangle(0,0,width,height),resolution:Math.min(1.5,this.stage.app.renderer.resolution)});}finally{this.root.visible=true;}
    const s=this.state!,run=s.autoRun!;
    const cover=this.autoCover=new AutoPackBridge(texture,{completed:run.completed,total:run.total,amount:s.result?.total??0,reduced:s.reduced,turbo:!!s.turbo,low:s.low},()=>this.stage.draw());
    cover.layout(width,height);this.stage.app.stage.addChild(cover);
  }
  private layoutAutoCover(){if(!this.autoCover)return;const {width,height}=this.stage.app.screen;this.autoCover.layout(width,height);}
  private finishAutoPackTransition(){
    const cover=this.autoCover;if(!cover)return;
    const s=this.state!,duration=s.reduced?.12:s.turbo?.16:.32;
    if(!s.reduced&&!s.error)playSound('wincollect',{gain:.3});
    this.autoCoverTween=gsap.to(this.autoCoverMotion,{value:1,duration,ease:'power2.inOut',onUpdate:()=>{cover.alpha=1-this.autoCoverMotion.value;this.layoutAutoCover();this.stage.draw();},onComplete:()=>{cover.destroy();this.autoCover=null;this.autoCoverTween=null;this.emitTargets();this.stage.draw();}});
  }
  private animateChrome(){
    const s=this.state;if(!s)return;const time=this.stage.openingUiTime,pose=time===null?null:openingUiPose(time),w=this.stage.app.screen.width,h=this.stage.app.screen.height;
    for(const c of this.cardPulses){const wave=s.reduced?0:Math.sin(this.stage.time*2.2-c.phase);c.group.x=c.baseX+wave*.7;c.group.y=c.baseY-wave*1.2;c.group.rotation=c.rotation+wave*.018;c.shine.alpha=s.reduced?.55:.25+.6*(1+wave)/2;}
    for(const {glyph,base,phase,axis} of this.arrowPulses){const p=s.reduced?1:(1+Math.sin(this.stage.time*3.6-phase))*.5;glyph[axis]=base+p*2.6;glyph.alpha=.72+.28*p;}
    if(this.rackGroup){const a=pose?(this.rackKind==='packs'?pose.packs:pose.cards):1;this.rackGroup.alpha=a;
      if(this.rackKind==='packs'){this.rackGroup.pivot.set(w/2,h);this.rackGroup.position.set(w/2,h+(1-a)*24);this.rackGroup.scale.set(.97+.03*a,.92+.08*a);}else{this.rackGroup.position.set(0,(1-a)*26);}
      const reveal=this.rackKind==='cards'?a:1,span=w*(.04+.96*reveal);this.rackMask?.clear().rect((w-span)/2,0,span,h+40).fill(0xffffff);
      const glow=this.rackGlow?.clear();if(glow&&reveal>0&&reveal<1){const top=gameLayout(w,h,true).dockTop+26,bottom=h-8,alpha=Math.sin(Math.PI*reveal);for(const x of [(w-span)/2,(w+span)/2])glow.moveTo(x,top).lineTo(x,bottom).stroke({color:0x8febff,width:2.5,alpha:alpha*.85});}
    }
    if(pose){const primary=this.paints.get('primary');if(primary&&s.phase==='tearing')primary.alpha=.4*pose.open;for(const id of ['next','reveal-all']){const group=this.paints.get(id);if(group&&s.phase==='awaiting')group.alpha=pose.controls;}}
  }
  private keydown=(event:KeyboardEvent)=>{
    if(!this.state||this.trayHost.inert)return;
    if(this.transitioning){event.preventDefault();return;}
    if(event.key==='Escape'){event.preventDefault();this.dismissModal();return;}
    if((event.target as HTMLElement)?.tagName==='BUTTON')return;
    if(this.state.panel==='collection'&&!this.state.inspected&&['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();this.page+=event.key==='ArrowRight'?1:-1;this.build();}
    if((event.key===' '||event.key==='Enter')&&!this.state.panel&&!this.state.inspected){event.preventDefault();const phase=this.state.phase;const action=phase==='browse'?'open':phase==='sealed'?'tear':['awaiting','revealing','revealed'].includes(phase)?'next':phase==='complete'?'continue':null;if(action){if(phase==='complete')this.dismissModal('continue');else this.state.action(action);}}
  };
  private text(value:string,x:number,y:number,size=14,color=C.white,parent=this.root,align:'left'|'center'|'right'='left',weight:'normal'|'bold'='normal',maxWidth?:number){
    const text=new Text({text:value,style:{fontFamily:'Nunito, Arial, sans-serif',fontSize:size,fontWeight:weight==='bold'?'800':'600',fill:color,align,wordWrap:!!maxWidth,wordWrapWidth:maxWidth,lineHeight:size*1.3},resolution:Math.max(2,Math.min(3,devicePixelRatio))});
    text.roundPixels=true;text.anchor.set(align==='center'?.5:align==='right'?1:0,0);text.position.set(x,y);parent.addChild(text);return text;
  }
  private money(amount:number,x:number,y:number,size:number,color:number,align:'left'|'center'|'right',key:string,identity:string,plus=false,width=240,centerY=false){
    const state=moneyState(this.moneyValues.get(key),identity,amount,key==='wallet'||key==='lifetime'||key==='revealed');this.moneyValues.set(key,state);
    const label=new MoneyReadout(state,{size,color,align,width,plus,centerY,hero:key==='reward'||key==='result',reduced:this.state!.reduced,ticks:key==='result',draw:()=>this.stage.draw()});
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
    const cut=Math.min(10,h/4),shape=(dy:number)=>[x+cut,y+dy,x+w-cut,y+dy,x+w,y+cut+dy,x+w,y+h-cut+dy,x+w-cut,y+h+dy,x+cut,y+h+dy,x,y+h-cut+dy,x,y+cut+dy];const plate=new Graphics().poly(shape(3)).fill({color:0x020f20,alpha:.6}).poly(shape(0)).fill(chosen?0x226e9d:0x12344f).stroke({color:chosen?0xc4ecdf:0x4b7891,width:1.5}).moveTo(x+cut+3,y+4).lineTo(x+w-cut-3,y+4).stroke({color:chosen?0xf3eac2:0x80b2ca,width:1,alpha:chosen?.8:.3});group.addChild(plate);
    if(chosen){const light=new Graphics().roundRect(x+3,y+3,w-6,h*.4,5).fill({color:0xd7f7ff,alpha:.12});group.addChild(light);}
    if(options.primary)this.ball(x+24,y+h/2,7,C.white,group);
    const fontSize=options.large?23:options.small?12:14;
    const textX=x+(options.primary?43:12),textW=w-(options.primary?55:24),caption=this.text(options.visibleLabel??label,textX+textW/2,y+(h-fontSize*1.3)/2,fontSize,chosen?C.white:C.muted,group,'center','bold');if(caption.width>textW)caption.scale.set(textW/caption.width);
    group.pivot.set(x+w/2,y+h/2);group.position.set(x+w/2,y+h/2);group.alpha=options.disabled?.38:1;
    const hit={id,label,x,y,width:w,height:h,disabled:!!options.disabled,selected:options.active,action};this.hits.push(hit);
    group.eventMode=options.disabled?'none':'static';group.cursor='pointer';group.on('pointertap',()=>{if(!options.disabled&&!this.transitioning)action();});
    return group;
  }
  private utility(kind:'turbo'|'auto',label:string,r:{x:number;y:number;width:number;height:number},active:boolean,disabled:boolean,action:()=>void){
    const {x,y,width:w,height:h}=r,group=new Container(),g=new Graphics(),cx=w/2,cy=w/2,ink=disabled?0x8ba9bf:active?0xecffff:0xf2fbff;
    group.position.set(x+cx,y+cy);group.pivot.set(cx,cy);group.addChild(g);this.root.addChild(group);this.paints.set(kind,group);
    g.circle(cx,cy+3,w/2).fill({color:0x05233f,alpha:.55}).circle(cx,cy,w/2).fill(active?0x197ab8:0x124a79).stroke({color:active?0x8ef7ff:0xa8d5e9,width:1.8}).circle(cx,cy,w/2-4).stroke({color:active?0x9cf7ff:0x4389b8,width:1,alpha:.65});
    const icon=new Graphics();icon.position.set(cx,cy);icon.scale.set(w/44);group.addChild(icon);
    if(kind==='turbo')icon.poly([3,-14,-9,2,-1,2,-5,14,11,-4,3,-4]).fill(ink).stroke({color:0x063557,width:1.4,join:'round'});
    else if(active)icon.roundRect(-6,-6,12,12,2).fill(ink);
    else{icon.moveTo(9,-8).arc(0,0,12,-.72,Math.PI*1.12).stroke({color:ink,width:2.2,cap:'round'}).poly([-13,-7,-14,2,-5,-1]).fill(ink);icon.roundRect(-4,-6,8,12,1.5).stroke({color:ink,width:1.5}).moveTo(-2,-3).lineTo(2,-3).stroke({color:ink,width:1});}
    if(active)g.circle(w-3,4,6).fill(0x082e4f).stroke({color:0x9af7ff,width:1.2});
    const text=this.text(kind==='turbo'?'TURBO':active?'STOP':'AUTO',cx,w+5,w<40?7:8.5,disabled?0x9bb5c9:C.white,group,'center','bold');text.style.stroke={color:0x072b49,width:2.8};
    if(active){const badge=this.text(kind==='turbo'?'4×':String(this.state!.autoRun!.total-this.state!.autoRun!.completed),w-3,-1,7,0xefffff,group,'center','bold');badge.style.lineHeight=8;}
    this.hits.push({id:kind,label,x,y,width:w,height:h,disabled,selected:active,action});
  }

  private hit(id:string,label:string,x:number,y:number,w:number,h:number,action:()=>void,disabled=false){this.hits.push({id,label,x,y,width:w,height:h,disabled,action});}
  hover(id:string,value:boolean){if(id.startsWith('history-fan-')){if(value)this.focusHistoryCard(Number(id.slice(12)));return;}this.feedback(id,value?1.045:1);}
  press(id:string,value:boolean){if(id.startsWith('history-fan-'))return;this.feedback(id,value?.94:1.045);}
  private feedback(id:string,scale:number){const paint=this.paints.get(id);if(!paint)return;this.feedbackTweens.get(id)?.kill();if(this.state?.reduced){paint.scale.set(scale);this.stage.draw();return;}this.feedbackTweens.set(id,gsap.to(paint.scale,{x:scale,y:scale,duration:.16,ease:'power2.out',onUpdate:()=>this.stage.draw()}));}
  private command(id:string,label:string,cx:number,cy:number,size:number,kind:'next'|'all',action:()=>void,disabled=false){
    const group=new Container();group.position.set(cx,cy);this.root.addChild(group);this.paints.set(id,group);const r=size/2,g=new Graphics();group.addChild(g);
    const icon=new Graphics(),k=size/(kind==='next'?56:64);icon.scale.set(k);group.addChild(icon);
    if(kind==='next'){
      for(const [i,base] of [-18,0].entries()){
        const glyph=new Graphics();glyph.x=base;icon.addChild(glyph);this.arrowPulses.push({glyph,base,phase:i*1.7,axis:'x'});
        for(const [width,color,alpha] of [[12,0x58cfff,.17],[7,0x073456,1],[3.6,0xd9fdff,1]])glyph.moveTo(0,-21).lineTo(22,0).lineTo(0,21).stroke({color,width,alpha,cap:'round',join:'round'});
      }
      // No circular backing: a deep ink edge keeps the luminous arrow readable over the stadium.
    }else{
      icon.scale.set(size/84);
      g.ellipse(0,10,size*.5,size*.34).fill({color:0x4ddbff,alpha:.12});
      for(const [i,base] of [-18,0,18].entries()){
        const card=new Container(),rotation=base*.013,plate=new Graphics(),shine=new Graphics();card.position.set(base,i===1?-6:2);card.rotation=rotation;icon.addChild(card);
        plate.roundRect(-18,-26,36,52,4).fill(0x062443).stroke({color:0x082e52,width:5}).roundRect(-18,-26,36,52,4).fill(i===1?0x207ac3:0x144c80).stroke({color:i===1?0xf2ffff:0x84cfe9,width:i===1?2.7:2});
        plate.roundRect(-13,-21,26,42,3).stroke({color:0x75dfff,width:1,alpha:.72});card.addChild(plate);this.ball(0,0,8,i===1?0xf5ffff:0xa9e4f4,card);
        shine.moveTo(-11,-20).lineTo(9,-20).stroke({color:0xffffff,width:3,alpha:.95}).moveTo(-14,-15).lineTo(-14,9).stroke({color:0x93ffff,width:2,alpha:.9});card.addChild(shine);
        this.cardPulses.push({group:card,baseX:base,baseY:card.y,rotation,phase:i*1.4,shine});
      }
      const flash=new Graphics().poly([0,-8,2,-2,8,0,2,2,0,8,-2,2,-8,0,-2,-2]).fill(0xf0ffff);flash.position.set(27,-28);icon.addChild(flash);
    }
    const text=this.text(kind==='all'?'OPEN ALL':label,0,r+7,kind==='all'?Math.min(18,size*.18):size>=76?14:12,C.white,group,'center','bold');text.style.stroke={color:0x082b4b,width:3};
    if(kind==='all'){text.anchor.set(.5);text.y=r+16;const plate=new Graphics().roundRect(-r-3,r+2,size+6,28,8).fill({color:0x07365d,alpha:.94}).stroke({color:0x8ee9ff,width:1.5});group.addChildAt(plate,group.getChildIndex(text));}
    group.alpha=disabled?.42:1;
    this.hits.push({id,label,x:cx-r-4,y:cy-r-4,width:size+8,height:size+30,disabled,action});
    return group;
  }
  private openCommand(w:number,y:number,disabled:boolean,center=w/2,maxWidth=278){
    const s=this.state!,width=Math.min(maxWidth,w-44),height=56,x=center-width/2,group=new Container(),g=new Graphics();this.root.addChild(group);group.addChild(g);group.pivot.set(center,y+height/2);group.position.set(center,y+height/2);this.paints.set('primary',group);
    const shape=(inset:number,dy=0)=>[x+20+inset,y+inset+dy,x+width-20-inset,y+inset+dy,x+width-inset,y+height/2+dy,x+width-20-inset,y+height-inset+dy,x+20+inset,y+height-inset+dy,x+inset,y+height/2+dy];
    g.poly(shape(0,4)).fill({color:0x06283e,alpha:.55}).poly(shape(0)).fill(0x103f6b).stroke({color:0xa6e9fa,width:2}).poly(shape(5)).fill(0x247bc1);
    g.moveTo(x+23,y+8).lineTo(x+width-23,y+8).stroke({color:0xe6ffff,width:2,alpha:.65});
    const label=['browse','reserving'].includes(s.phase)?'Buy pack':'Open';
    this.ball(x+45,y+28,13,0xefffff,group);const caption=this.text(label.toUpperCase(),center+5,y+12,24,C.white,group,'center','bold');if(caption.width>width-118)caption.scale.set((width-118)/caption.width);
    g.poly([x+width-45,y+21,x+width-37,y+28,x+width-45,y+35]).stroke({color:0xdfffff,width:2.5});
    group.alpha=disabled?.4:1;this.hits.push({id:'primary',label,x,y,width,height,disabled,action:()=>s.action(s.phase==='sealed'?'tear':'open')});
  }
  setFocus(id:string|null){if(id?.startsWith('history-fan-'))this.focusHistoryCard(Number(id.slice(12)));this.focus.clear();const hit=this.hits.find(h=>h.id===id);if(hit)this.focus.roundRect(hit.x-this.modalOrigin.x-3,hit.y-this.modalOrigin.y-3,hit.width+6,hit.height+6,8).stroke({color:0xe3fcff,width:2});this.stage.draw();}
  async prepareAssets(packs:Pack[],progress:(value:number)=>void=()=>{}){
    const paths=[...new Set(['/assets/pokemon-logo.png',...packs.map(pack=>pack.packImage)])];let completed=0;
    await Promise.all(paths.map(async path=>{await this.thumbnail(path);progress(++completed/paths.length);}));
  }
  private async thumbnail(path:string){
    const cached=this.thumbs.get(path);if(cached){this.thumbs.delete(path);this.thumbs.set(path,cached);return cached;}
    if(this.pending.has(path))return this.pending.get(path)!;
    const promise=(async()=>{
      let source:CanvasImageSource,width:number,height:number;
      if(path.endsWith('pack.webp')){const texture=await loadPackTexture(path);source=texture.source.resource as CanvasImageSource;width=texture.width;height=texture.height;}
      else{const image=new Image();image.src=path;await image.decode();source=image;width=image.naturalWidth;height=image.naturalHeight;}
      const scale=Math.min(1,640/Math.max(width,height));const canvas=document.createElement('canvas');canvas.width=Math.round(width*scale);canvas.height=Math.round(height*scale);const ctx=canvas.getContext('2d')!;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
      if(path.includes('/cards/')||path.includes('card-back')){ctx.beginPath();ctx.roundRect(0,0,canvas.width,canvas.height,canvas.width*.05);ctx.clip();}
      ctx.drawImage(source,0,0,canvas.width,canvas.height);const texture=Texture.from(canvas);
      if(this.destroyed){texture.destroy(true);throw new Error('closed');}
      this.thumbs.set(path,texture);this.pending.delete(path);return texture;
    })().catch(error=>{this.pending.delete(path);throw error;});this.pending.set(path,promise);return promise;
  }
  private picture(path:string,x:number,y:number,w:number,h:number,parent=this.root,full=false,holo=0,special?:Card){
    const generation=this.generation;
    const render=(texture:Texture)=>{if(full&&!texture.source.autoGenerateMipmaps){texture.source.autoGenerateMipmaps=true;texture.source.scaleMode='linear';texture.source.updateMipmaps();}if(this.destroyed||generation!==this.generation||parent.destroyed)return;const scale=Math.min(w/texture.width,h/texture.height);if(holo){const card=new HoloCard(texture,texture.width*scale*.96,texture.height*scale*.96,this.stage.app.canvas,()=>this.stage.draw(),holo,!!this.state?.reduced);card.position.set(x+w/2,y+h/2);parent.addChild(card);}else{const sprite=new Sprite(texture);sprite.anchor.set(.5);sprite.scale.set(scale);sprite.position.set(x+w/2,y+h/2);parent.addChild(sprite);}
      if(special&&isSpecialCard(special)){const factor=holo?.96:1,frame=new SpecialCardFrame(texture.width*scale*factor,texture.height*scale*factor,cardPowerKind(special),special.rarity,!!this.state?.low,!!this.state?.reduced);frame.position.set(x+w/2,y+h/2);parent.addChild(frame);this.specialFrames.add(frame);if(!this.state?.reduced&&this.specialFrames.size===1)gsap.ticker.add(this.tickSpecialFrames);}
      this.stage.draw();};
    const ready=full?Assets.get<Texture>(path):this.thumbs.get(path);
    if(ready){if(!full){this.thumbs.delete(path);this.thumbs.set(path,ready);}render(ready);}else void (full?Assets.load<Texture>(path):this.thumbnail(path)).then(render).catch(()=>{if(generation===this.generation&&!parent.destroyed){this.text('Image unavailable',x+w/2,y+h/2,10,C.muted,parent,'center');this.stage.draw();}});
  }
  private build(){
    if(!this.state||this.destroyed)return;
    const overlay=!!this.state.panel||!!this.state.inspected;
    if(overlay&&!this.modalKind&&!this.frozenHud){const texture=this.stage.app.renderer.generateTexture({target:this.root,frame:new Rectangle(0,0,this.stage.app.screen.width,this.stage.app.screen.height),resolution:this.stage.app.renderer.resolution});this.frozenHud=new Sprite(texture);this.stage.app.stage.addChildAt(this.frozenHud,this.stage.app.stage.getChildIndex(this.backdrop));}
    if(!overlay&&this.frozenHud){this.frozenHud.destroy({texture:true,textureSource:true});this.frozenHud=null;}
    this.resultUnderlay?.destroy({texture:true,textureSource:true});this.resultUnderlay=null;
    if((this.resultLaunch||this.interludeEntry)&&!this.state.reduced){const texture=this.stage.app.renderer.generateTexture({target:this.root,frame:new Rectangle(0,0,this.stage.app.screen.width,this.stage.app.screen.height),resolution:1});this.resultUnderlay=new Sprite(texture);this.stage.app.stage.addChildAt(this.resultUnderlay,this.stage.app.stage.getChildIndex(this.backdrop));}
    this.resultChrome=null;this.resultAmount=null;this.resultCards=[];this.trayPan.cancel();this.trayPointer=null;
    ++this.generation;gsap.ticker.remove(this.tickSpecialFrames);this.specialFrames.clear();this.trayPrices.clear();gsap.ticker.remove(this.tickHistoryFan);this.historyFanCards=[];this.historyFanTitle=this.historyFanRarity=null;this.historyFanValue=null;this.arrowPulses=[];this.cardPulses=[];this.rackGroup=null;this.rackMask=null;this.rackGlow=null;this.cardCaptions=[];this.trayStrip=null;this.packValueLabel=null;this.revealCountLabel=null;this.moneyAnimations.forEach(t=>t.kill());this.moneyAnimations=[];this.trayTween?.kill();this.redrawTray=null;this.trayArt?.destroy(true);this.trayArt=null;this.hits=[];this.feedbackTweens.forEach(t=>t.kill());this.feedbackTweens.clear();this.paints.clear();this.focus.clear();
    this.root.removeChild(this.focus);this.root.removeChildren().forEach(child=>child.destroy({children:true}));
    const s=this.state,sw=this.stage.app.screen.width,sh=this.stage.app.screen.height,modal=s.inspected?'inspect':s.panel==='history'&&this.historyOpening?'history-pack':s.panel??(s.phase==='complete'?(s.autoRun?.interlude?'interlude':s.autoRun&&s.autoRun.results.length>1?(this.autoPack?'auto-pack':'auto-session'):'results'):'');
    const frame=modal&&!['settings','interlude'].includes(modal)?modalLayout(sw,sh,modal,s.save?.history.length):{x:0,y:0,width:sw,height:sh};this.modalOrigin={x:frame.x,y:frame.y};
    const w=frame.width,h=frame.height,l=gameLayout(w,h,['awaiting','revealing','revealed','collecting','settling'].includes(s.phase)),changed=modal!==this.modalKind;this.modalKind=modal;
    this.modalTween?.kill();this.modalTween=null;this.transitioning=!!this.returnCover;this.root.position.set(frame.x,frame.y);this.root.scale.set(1);this.root.alpha=1;
    this.backdrop.clear();this.backdrop.visible=!!modal;this.backdrop.alpha=1;if(modal)this.backdrop.rect(0,0,sw,sh).fill({color:0x03192d,alpha:['results','auto-session','auto-pack','interlude'].includes(modal)?.34:modal==='settings'?.45:.6});
    if(s.panel==='collection'&&!s.inspected)this.collection(w,h);
    else {
      if(!s.inspected&&!s.panel&&s.phase!=='complete'){this.hud(w,h);this.playControls(w,h);const start=this.root.children.length;this.rack(w,h);const children=this.root.children.slice(start);this.rackGroup=new Container();this.rackGroup.addChild(...children);this.rackMask=new Graphics();this.rackGlow=new Graphics();this.root.addChild(this.rackGroup,this.rackMask,this.rackGlow);this.rackGroup.mask=this.rackMask;this.animateChrome();}
      if(s.phase==='complete'&&!s.panel&&!s.inspected){
        if(s.autoRun?.interlude&&s.result)this.autoInterlude(w,h,s.result,s.autoRun);
        else if(s.autoRun&&s.autoRun.results.length>1){if(this.autoPack)this.results(w,h,this.autoPack,true);else this.autoResults(w,h,s.autoRun);}
        else if(s.result)this.results(w,h,s.result);
      }
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
    this.hits.forEach(hit=>{hit.x+=frame.x;hit.y+=frame.y;});this.root.addChild(this.focus);if(this.returnCover)this.stage.app.stage.addChild(this.returnCover);if(this.autoCover){this.layoutAutoCover();this.stage.app.stage.addChild(this.autoCover);}this.rewards.update(0,sw,sh,s.reduced);for(const caption of this.cardCaptions)caption.alpha=1-this.rewards.celebrationOpacity;this.stage.draw();
    if(modal==='results'&&this.resultLaunch&&!s.reduced)this.animateResults();else if(modal&&changed&&!s.reduced)this.animateModal(modal,w,h);
    this.resultLaunch=null;this.interludeEntry=false;
    this.emitTargets();
    // Keep thumbnail memory bounded. A screen uses fewer than 24; oldest pages can be discarded.
    while(this.thumbs.size>72){const key=this.thumbs.keys().next().value!;const texture=this.thumbs.get(key)!;this.thumbs.delete(key);texture.destroy(true);}
  }
  private emitTargets(){const s=this.state!;const {width,height}=this.stage.app.screen,bw=Math.min(166,width-60);const hits=this.autoCover?(s.autoRun?.running?[{id:'auto-transition-stop',label:'Stop Auto Spin',x:width/2-bw/2,y:height-58,width:bw,height:38,disabled:false,action:()=>s.action('auto-stop')}]:[]):this.hits.map(hit=>({...hit,disabled:hit.disabled||this.transitioning}));this.onTargets(hits,s.inspected?`Viewing ${s.inspected.name}`:s.panel?`${s.panel} screen`:`${s.selected.name}. ${s.phase}. Balance ${money(s.save?.balance??10000)}. ${s.phase==='revealed'?s.save?.active?.cards[s.index]?.name??'':''}`);}
  private animateModal(kind:string,w:number,h:number){
    this.transitioning=true;this.root.alpha=0;this.backdrop.alpha=0;
    if(kind==='settings')this.root.x=Math.min(440,w)+24;else{this.root.scale.set(.985);this.root.position.set(this.modalOrigin.x+w*.0075,this.modalOrigin.y+h*.0075+14);}
    this.modalTween=gsap.timeline({onUpdate:()=>this.stage.draw(),onComplete:()=>{this.resultUnderlay?.destroy({texture:true,textureSource:true});this.resultUnderlay=null;this.transitioning=false;this.emitTargets();}})
      .to(this.backdrop,{alpha:1,duration:.2},0).to(this.root,{x:this.modalOrigin.x,y:this.modalOrigin.y,alpha:1,duration:kind==='settings'?.38:.3,ease:'power3.out'},0).to(this.root.scale,{x:1,y:1,duration:.3,ease:'power3.out'},0);
    if(this.resultUnderlay)this.modalTween.to(this.resultUnderlay,{alpha:0,duration:.3},0);
  }
  private dismissModal(action:'close'|'continue'='close'){
    if(this.transitioning)return;const s=this.state!;if(this.modalKind==='interlude')return;
    const destination=()=>{if(this.autoPack&&!s.inspected&&!s.panel){this.autoPack=null;this.build();}else if(this.historyOpening&&!s.inspected){this.historyOpening=null;this.build();}else s.action(action);};
    if(!this.modalKind||s.reduced){destination();return;}
    // Build the destination before fading the old, fully composed frame. This
    // also covers inspector → library and history pack → history transitions.
    const results=['results','auto-session','auto-pack'].includes(this.modalKind),{width,height}=this.stage.app.screen;
    const texture=this.stage.app.renderer.generateTexture({target:this.stage.app.stage,frame:new Rectangle(0,0,width,height),resolution:this.stage.app.renderer.resolution});
    const cover=this.returnCover=new Sprite(texture);destination();this.stage.app.stage.addChild(cover);this.transitioning=true;this.emitTargets();
    this.returnTween=gsap.to(cover,{alpha:0,duration:results?.42:.26,ease:'power2.inOut',onUpdate:()=>{cover.width=this.stage.app.screen.width;cover.height=this.stage.app.screen.height;this.stage.draw();},onComplete:()=>{cover.destroy({texture:true,textureSource:true});this.returnCover=null;this.returnTween=null;this.transitioning=!!this.modalTween?.isActive();this.emitTargets();this.stage.draw();}});
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
    if(kind==='binder'||kind==='history'){const caption=this.text(kind==='binder'?'CARDS':'HISTORY',cx,y+size+5,size<40?7:8.5,C.white,group,'center','bold');caption.style.stroke={color:0x072b49,width:2.8};}
    group.pivot.set(cx,cy);group.position.set(cx,cy);this.hits.push({id,label,x,y,width:size,height:size+(['binder','history'].includes(kind)?18:0),disabled:false,action});return group;
  }
  private hud(w:number,h:number){
    const s=this.state!,l=gameLayout(w,h,['awaiting','revealing','revealed','collecting','settling'].includes(s.phase));
    if(s.save&&!this.moneyValues.has('lifetime'))this.moneyValues.set('lifetime',moneyState(undefined,'lifetime',recordedWinnings(s.save),true));
    const logoW=l.compact?compactToolbar(w).logoWidth:l.portrait?116:148,logoH=l.compact?logoW*.38:l.portrait?44:55;
    this.picture('/assets/pokemon-logo.png',18,10,logoW,logoH);this.text('LEGENDS',18+logoW/2,l.compact?logoH+16:l.portrait?50:59,8,0xffffff,this.root,'center','bold');
    const credit=creditLayout(w,h);
    const wallet=new Graphics().roundRect(credit.x,credit.y,credit.width,credit.height,22).fill({color:0x06315a,alpha:.94}).stroke({width:1.5,color:0xa7e8ff,alpha:.85});
    wallet.moveTo(credit.buttonX-7,credit.y+13).lineTo(credit.buttonX-7,credit.y+credit.height-13).stroke({width:1,color:0x7ccde5,alpha:.25});this.root.addChild(wallet);
    this.text('DEMO CREDITS',credit.textX,credit.labelY,9,C.muted,this.root,'left','bold');
    this.money(s.save?.balance??10000,credit.textX,credit.amountY,credit.amountSize,C.white,'left','wallet','balance',false,credit.textWidth,true);
    this.iconButton('credits','Add 1000 free demo credits',credit.buttonX,credit.buttonY,credit.buttonSize,'plus',()=>s.action('credits'));
    const side=l.portrait?18:25,utilities=utilityLayout(w,h,['awaiting','revealing','revealed','collecting','settling'].includes(s.phase));
    for(const [id,label,kind,action] of [['binder','My collection','binder','collection'],['history','Opening history','history','history'],['settings','Settings','gear','settings'],['sound',s.sound?'Mute sound':'Enable sound',s.sound?'sound':'mute','sound']] as const){
      const r=utilities[id];this.iconButton(id,label,r.x,r.y,r.width,kind,()=>s.action(action));
    }
    this.utility('turbo',`Turbo Mode: ${s.turbo?'on':'off'}`,utilities.turbo,!!s.turbo,false,()=>s.action('turbo'));
    this.utility('auto',s.autoRun?.running?'Stop Auto Spin':'Auto Spin',utilities.auto,!!s.autoRun?.running,!s.autoRun?.running&&!!s.save?.active,()=>s.action(s.autoRun?.running?'auto-stop':'auto'));
    const edgeTitle=l.compact||(l.short&&l.sideControls),captionY=l.compact?65:!l.sideControls&&l.short?166:edgeTitle?125:l.sideControls?28:182;
    const captionWidth=edgeTitle?Math.max(85,l.sideControls?(w-l.stageWidth)/2-28:w/2-156*l.scale-side-12):l.sideControls?w-510:w-112;
    const packTitle=this.text(s.save?.active?.pack?.name??s.selected.name,edgeTitle?side:w/2,captionY,edgeTitle?14:l.sideControls?22:18,C.white,this.root,edgeTitle?'left':'center','bold');packTitle.visible=!['awaiting','revealing','revealed','collecting','settling'].includes(s.phase);packTitle.style.stroke={color:0x08315a,width:3};if(packTitle.width>captionWidth)packTitle.scale.set(captionWidth/packTitle.width);
    if(s.save?.active){const grouped=s.phase==='collecting'&&(s.groupRevealCount??0)>0,countY=l.compact?65:!l.sideControls?captionY+3:128;this.revealCountLabel=this.text(grouped?`${s.groupRevealCount} CARDS`:`${Math.min(Math.max(this.landed.size,s.index+(['revealed','collecting','settling'].includes(s.phase)?1:0)),11)} / 11`,w-side,grouped?Math.min(countY,packRevealLayout(w,h,s.groupRevealCount!).top-19):countY,10,C.white,this.root,'right','bold');}
  }
  private playControls(w:number,h:number){
    const s=this.state!,l=gameLayout(w,h,['awaiting','revealing','revealed','collecting','settling'].includes(s.phase)),busy=!!s.autoRun?.running||['reserving','tearing','revealing','collecting','settling'].includes(s.phase);
    if(s.save?.active&&['awaiting','revealing','revealed','collecting','settling'].includes(s.phase)){
      const win=totalWinLayout(w,h),half=Math.min(win.width*.48,l.compact?55:92),top=win.y-win.size*.55,bottom=win.y+win.size*.60,g=new Graphics();
      for(const side of [-1,1]){const x=win.x+side*half;g.moveTo(x-side*8,top).lineTo(x,top).lineTo(x,bottom).lineTo(x-side*8,bottom).stroke({color:0x062b4c,width:6,alpha:.7,join:'round'}).moveTo(x-side*8,top).lineTo(x,top).lineTo(x,bottom).lineTo(x-side*8,bottom).stroke({color:0x91efff,width:1.3,alpha:.85,join:'round'});}
      g.moveTo(win.x-half+12,bottom+4).lineTo(win.x+half-12,bottom+4).stroke({color:0x79e9ff,width:1.5,alpha:.35});this.root.addChild(g);
      const caption=this.text('TOTAL WIN',win.x,win.labelY,l.compact?9:11,0xb4f5ff,this.root,'center','bold');caption.style.stroke={color:0x082b4b,width:3};caption.style.letterSpacing=1.8;
      this.packValueLabel=this.money(this.rewards.ledger.total,win.x,win.y,win.size,0xfff3c9,'center','revealed',s.save.active.id,false,win.width-26,true);
    }

    if(s.phase==='revealed'){
      const card=s.save!.active!.cards[s.index],space=(w-l.stageWidth)/2;
      const captionW=l.compact?Math.min(238,space-32):l.sideControls?Math.min(420,l.stageWidth*.72):w-220;
      const captionX=l.compact?(space-captionW)/2:(w-captionW)/2,captionY=l.compact?65:l.stageFront+1;
      const titleSize=l.compact?14:l.sideControls?20:16,align=l.compact?'left':'center',textX=l.compact?captionX:w/2;
      const title=this.text(card.name,textX,captionY,titleSize,C.white,this.root,align,'bold');title.style.stroke={color:0x08294a,width:3};
      if(title.width>captionW)title.scale.set(captionW/title.width);
      const rarity=this.text(card.rarity,textX,captionY+(l.compact?16:l.sideControls?25:22),l.sideControls?10:9,C.cyan,this.root,align,'bold');rarity.style.stroke={color:0x08294a,width:3};if(rarity.width>captionW)rarity.scale.set(captionW/rarity.width);
      this.cardCaptions.push(title,rarity);
      this.hit('inspect',`Inspect ${card.name}`,captionX,captionY-2,captionW,l.sideControls?40:36,()=>s.inspect(card));
    }
    if(['awaiting','revealing','revealed','collecting','settling'].includes(s.phase)){
      const grouped=s.phase==='collecting'&&(s.groupRevealCount??0)>0;
      const controls=grouped?packRevealLayout(w,h,s.groupRevealCount!).controls:revealControlsLayout(w,h);
      this.command('next',s.phase==='awaiting'?'Reveal card':s.index===10?'Collect':'Next card',controls.next.x,controls.next.y,controls.next.size,'next',()=>s.action('next'),['collecting','settling'].includes(s.phase));
      this.command('reveal-all','Open All',controls.all.x,controls.all.y,controls.all.size,'all',()=>s.action('all'),busy||s.index>=10);
    }else{
      const y=l.compact?Math.max(76,(l.top+l.dockTop)/2-28):l.dockTop-68;this.openCommand(w,y,busy||!s.ready||!s.save||(s.phase==='browse'&&!s.pool.length),l.compact?w*.80:w/2,l.compact?Math.min(204,w*.34):278);
    }
  }

  private rack(w:number,h:number){
    const s=this.state!,opening=['awaiting','revealing','revealed','collecting','settling'].includes(s.phase)||this.stage.isOpeningJourney,l=gameLayout(w,h,opening),y=l.dockTop;this.rackKind=opening?'cards':'packs';
    const fade=new Sprite(this.tray);fade.position.set(0,y-25);fade.width=w;fade.height=l.dock+25;this.root.addChild(fade);
    if(s.save?.active&&opening){
      const tray=cardTrayLayout(w,h,this.collectingIndex??s.index);
      const viewport=new Container(),strip=new Container();this.trayStrip=strip;strip.y=tray.y;viewport.addChild(strip);this.root.addChild(viewport);const mask=new Graphics().rect(tray.viewportX,tray.y-5,tray.viewportWidth,tray.slotHeight+12).fill(0xffffff);this.root.addChild(mask);viewport.mask=mask;
      const base=tray.start+tray.offset,focusKey=`${this.openingId}:${s.index}`,changed=focusKey!==this.trayFocusKey;this.trayFocusKey=focusKey;
      this.trayPan.configure(tray.maxOffset,this.trayOffset.value);this.trayOffset.value=this.trayPan.offset;strip.x=base-this.trayOffset.value;
      if(changed&&s.phase==='revealing'&&!s.reduced)this.scrollTrayTo(tray.offset,.38,false);
      else if(changed){this.trayOffset.value=tray.offset;this.trayPan.configure(tray.maxOffset,tray.offset);strip.x=base-tray.offset;}
      s.save.active.cards.forEach((card,i)=>{
        const x=i*tray.stride,slot=new Container();slot.position.set(x,0);strip.addChild(slot);
        const active=i===s.index;const border=new Graphics().roundRect(-3,-3,tray.cardWidth+6,tray.cardHeight+6,7).fill({color:0x0b3155,alpha:.7}).stroke({width:active?2.5:1,color:active?0xc6f9ff:0x639bb7,alpha:active?1:.5});slot.addChild(border);
        const price=new Container(),pw=tray.cardWidth,ph=tray.priceHeight,color=isSpecialCard(card)?0xffe59a:0xc6f5ff;
        price.position.set(pw/2,tray.priceY+ph/2);price.visible=this.landed.has(i);slot.addChild(price);this.trayPrices.set(i,price);
        price.addChild(new Graphics().poly([-pw/2+5,-ph/2,pw/2-5,-ph/2,pw/2,0,pw/2-5,ph/2,-pw/2+5,ph/2,-pw/2,0]).fill({color:0x09243e,alpha:.92}).stroke({color,width:1,alpha:.55}).moveTo(-pw*.28,-ph/2).lineTo(pw*.28,-ph/2).stroke({color,width:1.5,alpha:.9}));
        price.addChild(new MoneyReadout({identity:this.openingId,value:card.value,target:card.value,remaining:0},{size:l.compact?15:l.short?17:21,color,align:'center',width:pw-7,plus:false,hero:false,centerY:true,reduced:true,ticks:false,draw:()=>this.stage.draw()}));
      });
      // One native canvas atlas keeps the static rack independent of animated
      // mesh buffers, with a single texture update for each landed card.
      const resolution=Math.min(2,this.stage.app.renderer.resolution),art=document.createElement('canvas'),artWidth=(s.save.active.cards.length-1)*tray.stride+tray.cardWidth;
      art.width=Math.ceil(artWidth*resolution);art.height=Math.ceil(tray.cardHeight*resolution);
      const context=art.getContext('2d')!,texture=Texture.from(art),sprite=new Sprite(texture);this.trayArt=texture;sprite.width=artWidth;sprite.height=tray.cardHeight;strip.addChild(sprite);
      const generation=this.generation,cards=s.save.active.cards;
      const redraw=()=>{if(this.destroyed||generation!==this.generation)return;context.setTransform(resolution,0,0,resolution,0,0);context.clearRect(0,0,artWidth,tray.cardHeight);cards.forEach((card,i)=>{
        const x=i*tray.stride,image=this.landed.has(i)?this.thumbs.get(card.image):null;
        if(image){const scale=Math.min(tray.cardWidth/image.width,tray.cardHeight/image.height),cw=image.width*scale,ch=image.height*scale;context.drawImage(image.source.resource as CanvasImageSource,x+(tray.cardWidth-cw)/2,(tray.cardHeight-ch)/2,cw,ch);}
        else{context.save();context.textAlign='center';context.textBaseline='middle';context.font=`800 ${tray.cardWidth*.52}px Nunito`;context.strokeStyle='#0b2c49';context.lineWidth=3;context.strokeText('?',x+tray.cardWidth/2,tray.cardHeight*.46);context.fillStyle=i===s.index?'#b9e9f6':'#749db8';context.fillText('?',x+tray.cardWidth/2,tray.cardHeight*.46);context.font='800 9px Nunito';context.fillStyle='#7197b0';context.fillText(String(i+1).padStart(2,'0'),x+tray.cardWidth/2,tray.cardHeight-13);context.restore();}
      });texture.source.update();this.stage.draw();};
      this.redrawTray=redraw;redraw();
      new Set(cards.map(card=>card.image)).forEach(path=>{void this.thumbnail(path).then(redraw).catch(()=>{});});
      this.syncTrayHits();
      if(tray.maxOffset>0){for(const direction of [-1,1]){const cx=direction<0?11:w-11,cy=tray.y+tray.cardHeight/2,g=new Graphics();g.moveTo(cx-direction*3,cy-8).lineTo(cx+direction*3,cy).lineTo(cx-direction*3,cy+8).stroke({color:0xbcf4ff,width:2,alpha:.85});this.root.addChild(g);this.hit(direction<0?'tray-prev':'tray-next',direction<0?'Scroll cards left':'Scroll cards right',cx-10,cy-23,20,46,()=>this.scrollTrayTo(this.trayOffset.value+direction*tray.stride*2),!['awaiting','revealed'].includes(s.phase));}}
      return;
    }
    const grid=packGridLayout(w,h,s.packs.length);
    s.packs.forEach((pack,i)=>{
      const slot=grid.slot(i),{x,y,width:tw,height:th}=slot,selected=pack.id===s.selected.id,group=new Container();
      group.position.set(x+tw/2,y+th/2);group.pivot.set(tw/2,th/2);this.root.addChild(group);this.paints.set(`pack-${pack.id}`,group);
      const tile=packTileLayout(tw,th),base=tile.artHeight+1;
      const halo=new Graphics().ellipse(tw/2,base,Math.min(tw*.4,50),3).fill({color:selected?0xa2eaff:0x061e34,alpha:selected?.5:.45});group.addChild(halo);
      if(selected){halo.ellipse(tw/2,base,Math.min(tw*.46,58),5).stroke({color:0xb5f5ff,width:1.5,alpha:.8});if(!s.reduced)this.moneyAnimations.push(gsap.to(halo,{alpha:.55,duration:1.2,repeat:-1,yoyo:true,ease:'sine.inOut'}));}
      this.picture(pack.packImage,tw*.12,0,tw*.76,tile.artHeight,group);
      const title=this.text(pack.name,tw/2,tile.nameY,tile.fontSize,C.white,group,'center','bold',tw-4);
      title.style.lineHeight=tile.fontSize*1.15;
      // Vertical centering keeps short and wrapped names aligned above their prices.
      title.y=tile.nameY+(tile.nameHeight-title.height)/2;
      const bh=tile.priceHeight,bw=Math.min(tw-4,132),by=tile.priceY;
      group.addChild(new Graphics().roundRect((tw-bw)/2,by,bw,bh,bh/2).fill({color:selected?0xc9f6ff:0x0b3052,alpha:.96}).stroke({color:selected?0xf1ffff:0x72a4c6,width:selected?2:1}));
      const price=new BitmapText({text:money(pack.price),style:{fontFamily:'LegendsMoney',fontSize:tw<85?16:tw<120?21:25}});price.anchor.set(.5);price.position.set(tw/2,by+bh/2);price.tint=selected?0x17436a:C.white;if(price.width>bw-8)price.scale.set((bw-8)/price.width);group.addChild(price);
      const disabled=!!s.autoRun?.running||!!s.save?.active;group.alpha=disabled?.45:1;
      this.hits.push({id:`pack-${pack.id}`,label:`${pack.name}, ${money(pack.price)}`,x,y,width:tw,height:th,disabled,action:()=>s.select(pack),selected});
      if(selected&&this.lastPackId!==pack.id&&!s.reduced)this.moneyAnimations.push(gsap.from(group.scale,{x:.92,y:.92,duration:.3,ease:'back.out(1.7)'}));
    });
    this.lastPackId=s.selected.id;
  }

  private trayLayout(){return cardTrayLayout(this.stage.app.screen.width,this.stage.app.screen.height,this.collectingIndex??this.state?.index??0);}
  private trayPoint(event:PointerEvent|WheelEvent){const b=this.trayHost.getBoundingClientRect();return {x:(event.clientX-b.left)*this.stage.app.screen.width/b.width,y:(event.clientY-b.top)*this.stage.app.screen.height/b.height};}
  private overTray(event:PointerEvent|WheelEvent){const s=this.state;if(!s||s.panel||s.inspected||!['awaiting','revealed'].includes(s.phase))return false;const t=this.trayLayout(),p=this.trayPoint(event);return t.maxOffset>0&&p.y>=t.y-6&&p.y<=t.y+t.slotHeight+8&&p.x>=0&&p.x<=this.stage.app.screen.width;}
  private trayDown=(e:PointerEvent)=>{if(!this.overTray(e)||e.button>0)return;this.trayInterrupted=!!this.trayTween?.isActive();this.trayTween?.kill();this.trayPointer=e.pointerId;this.trayPan.configure(this.trayLayout().maxOffset,this.trayOffset.value);this.trayPan.start(this.trayPoint(e).x,e.timeStamp);};
  private trayMove=(e:PointerEvent)=>{if(e.pointerId!==this.trayPointer)return;const was=this.trayPan.dragged;this.trayPan.move(this.trayPoint(e).x,e.timeStamp);if(!this.trayPan.dragged)return;e.preventDefault();e.stopPropagation();if(!was){this.trayHost.setPointerCapture(e.pointerId);this.syncTrayHits(false);this.emitTargets();}this.trayOffset.value=this.trayPan.offset;this.positionTray();};
  private trayUp=(e:PointerEvent)=>{if(e.pointerId!==this.trayPointer)return;this.trayPointer=null;if(this.trayPan.dragged){e.preventDefault();e.stopPropagation();this.suppressTrayClickUntil=performance.now()+400;if(this.trayHost.hasPointerCapture(e.pointerId))this.trayHost.releasePointerCapture(e.pointerId);this.scrollTrayTo(this.trayPan.end(),.34);}else{this.trayPan.cancel();if(this.trayInterrupted){this.syncTrayHits();this.emitTargets();}}this.trayInterrupted=false;};
  private trayCancel=()=>{this.trayPointer=null;this.trayPan.cancel();this.syncTrayHits();this.emitTargets();};
  private trayClick=(e:MouseEvent)=>{if(performance.now()<this.suppressTrayClickUntil){e.preventDefault();e.stopImmediatePropagation();}};
  private trayWheel=(e:WheelEvent)=>{if(!this.overTray(e))return;e.preventDefault();e.stopPropagation();const delta=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;this.scrollTrayTo(this.trayOffset.value+delta*(e.deltaMode===1?16:1),.16);};
  private positionTray(){if(this.trayStrip){const t=this.trayLayout();this.trayStrip.x=t.start+t.offset-this.trayOffset.value;this.stage.draw();}}
  private scrollTrayTo(value:number,duration=.3,emit=true){
    this.trayTween?.kill();const t=this.trayLayout(),target=Math.max(0,Math.min(t.maxOffset,value));this.trayPan.configure(t.maxOffset,target);this.syncTrayHits(false);if(emit)this.emitTargets();
    const finish=()=>{this.trayOffset.value=target;this.positionTray();this.syncTrayHits();this.emitTargets();};
    if(this.state?.reduced){finish();return;}
    this.trayTween=gsap.to(this.trayOffset,{value:target,duration,ease:'power3.out',onUpdate:()=>this.positionTray(),onComplete:finish});
  }
  private syncTrayHits(enabled=true){
    this.hits=this.hits.filter(hit=>!hit.id.startsWith('card-'));const s=this.state;if(!enabled||s?.phase!=='revealed'||s.panel||s.inspected||!s.save?.active)return;
    const t=this.trayLayout(),base=t.start+t.offset-this.trayOffset.value;
    s.save.active.cards.forEach((card,i)=>{const x=base+i*t.stride,left=Math.max(x,t.viewportX),right=Math.min(x+t.cardWidth,t.viewportX+t.viewportWidth);if(this.landed.has(i)&&right>left)this.hit(`card-${i}`,`Inspect ${card.name}, ${money(card.value)}, card ${i+1}`,left,t.y,right-left,t.slotHeight,()=>s.inspect(card));});
  }

  private storeCard=(index:number)=>{
    const fresh=!this.landed.has(index);this.landed.add(index);this.redrawTray?.();
    const price=this.trayPrices.get(index);if(price){price.visible=true;if(fresh&&!this.state?.reduced){this.moneyAnimations.push(gsap.from(price,{alpha:0,y:price.y+5,duration:.26,ease:'power3.out',onUpdate:()=>this.stage.draw()}),gsap.from(price.scale,{x:.78,y:.78,duration:.32,ease:'back.out(1.5)',onUpdate:()=>this.stage.draw()}));}}
    this.syncTrayHits();this.emitTargets();
    if(this.state?.phase==='collecting'){
      const card=this.state.save!.active!.cards[index];this.rewards.deposit(index,card.value);
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
  private libraryShell(title:string,subtitle:string,w:number,h:number,kind:'binder'|'history',footer=true){
    const shape=(inset:number)=>[24+inset,8+inset,w-30-inset,8+inset,w-8-inset,30+inset,w-8-inset,h-28-inset,w-28-inset,h-8-inset,28+inset,h-8-inset,8+inset,h-28-inset,8+inset,24+inset];
    const g=new Graphics().poly(shape(0)).fill({color:0x071b30,alpha:.96}).stroke({color:0x07111e,width:5}).poly(shape(4)).stroke({color:0x87bed2,width:1.8});this.root.addChild(g);
    g.poly([14,30,30,14,110,14,96,20,30,20,20,30,20,76,14,82]).fill(0xcd3b56);
    g.roundRect(24,23,w-48,56,12).fill(0x123752).moveTo(88,78).lineTo(w-34,78).stroke({color:0x82efff,width:1.2,alpha:.5});
    this.ball(52,49,19,0xc2f6ff);if(kind==='binder'){g.moveTo(43,39).lineTo(61,39).lineTo(61,60).lineTo(43,60).closePath().fill(0x164b69).stroke({color:0xc2f6ff,width:1.5});}else{g.moveTo(52,38).lineTo(52,49).lineTo(59,54).stroke({color:0xeaffff,width:2.5,cap:'round'});}
    const nested=!!this.state!.inspected||!!this.historyOpening,buttonW=nested?84:38,titleW=w-126-buttonW;
    const titleText=this.text(title,84,28,w<500?20:25,C.white,this.root,'left','bold');if(titleText.width>titleW)titleText.scale.set(titleW/titleText.width);
    const sub=this.text(subtitle,85,58,10,C.cyan);if(sub.width>titleW)sub.scale.set(titleW/sub.width);
    this.button('close',this.state!.inspected?'Back to cards':this.historyOpening?'Back to history':'Return to game',w-29-buttonW,28,buttonW,38,()=>this.dismissModal(),{visibleLabel:nested?'‹ BACK':'×',small:nested,large:!nested});
    if(footer)g.moveTo(28,h-73).lineTo(w-28,h-73).stroke({color:0x77d6e5,width:1,alpha:.3});
    for(const x of [20,w-20])for(const y of [h-22,90])g.circle(x,y,2).fill(0x82bdd0);
  }
  private libraryTab(id:string,label:string,x:number,y:number,width:number,active:boolean,action:()=>void){
    const g=new Graphics().poly([x+9,y,x+width-9,y,x+width,y+9,x+width,y+27,x+width-9,y+36,x+9,y+36,x,y+27,x,y+9]).fill(active?0x1d6086:0x0d2a43).stroke({color:active?0x9ef6ff:0x315571,width:active?1.5:1});this.root.addChild(g);
    if(active)g.moveTo(x+14,y+34).lineTo(x+width-14,y+34).stroke({color:0xb7fbff,width:2});
    const caption=this.text(label,x+width/2,y+10,11,active?C.white:C.muted,this.root,'center','bold');if(caption.width>width-18)caption.scale.set((width-18)/caption.width);
    this.hit(id,label,x,y,width,36,action);
  }
  private libraryPager(w:number,h:number,page:number,pages:number,kind:'collection'|'history'){
    this.button('page-prev',`Previous ${kind} page`,28,h-59,58,38,()=>{this.page--;this.build();},{disabled:page===0,visibleLabel:'‹',large:true});
    const text=this.text(`${String(page+1).padStart(2,'0')}  /  ${String(pages).padStart(2,'0')}`,w/2,h-47,13,C.white,this.root,'center','bold');text.style.letterSpacing=1;
    this.button('page-next',`Next ${kind} page`,w-86,h-59,58,38,()=>{this.page++;this.build();},{disabled:page+1===pages,visibleLabel:'›',large:true});
  }
  private collection(w:number,h:number){
    const s=this.state!,layout=binderLayout(w,h),source=this.collected?s.cards.filter(c=>s.save?.collection[c.id]):s.pool,pg=pageWindow(source.length,layout.size,this.page);this.page=pg.page;
    const owned=Object.values(s.save?.collection??{}).reduce((sum,n)=>sum+n,0),discovered=Object.keys(s.save?.collection??{}).length;
    this.libraryShell('COLLECTION',`${owned} cards · ${discovered} discovered`,w,h,'binder');
    const tabW=Math.min(220,(w-layout.pad*2-10)/2),tabY=h<500?90:102;
    this.libraryTab('set-filter',s.selected.name,layout.pad,tabY,tabW,!this.collected,()=>{this.collected=false;this.page=0;this.build();});
    this.libraryTab('collected-filter','My cards',layout.pad+tabW+10,tabY,tabW,this.collected,()=>{this.collected=true;this.page=0;this.build();});
    if(w>780)this.button('export','Export collection',w-178,tabY,142,36,()=>s.action('export'),{visibleLabel:'Export',small:true});
    if(!source.length){this.ball(w/2,h/2-24,30,0x46768f);this.text('No cards collected yet',w/2,h/2+24,17,C.white,this.root,'center','bold');}
    source.slice(pg.start,pg.end).forEach((card,i)=>{
      const r=layout.slot(i),count=s.save?.collection[card.id]??0,group=new Container();group.pivot.set(r.width/2,r.height/2);group.position.set(r.x+r.width/2,r.y+r.height/2);this.root.addChild(group);this.paints.set(`binder-${card.id}`,group);
      const g=new Graphics().roundRect(0,0,r.width,r.height,7).fill({color:0x153b53,alpha:count?.55:.22}).stroke({color:count?0x5996ad:0x234657,width:1,alpha:.65});group.addChild(g);
      const imageH=Math.max(28,r.height-43),imageW=Math.min(r.width-12,imageH/1.397),ix=(r.width-imageW)/2,iy=2;
      const art=new Container();art.alpha=count?1:.86;group.addChild(art);this.picture(card.image,ix,iy,imageW,imageH,art,true,0,card);
      for(const side of [0,1]){const x=side?r.width-4:4;g.moveTo(x+(side?-9:9),6).lineTo(x,6).lineTo(x,18).stroke({color:count?0xbbf4fc:0x39556a,width:1.4});}
      const name=this.text(card.name,r.width/2,r.height-37,r.width<100?10:12,count?C.white:C.muted,group,'center','bold');if(name.width>r.width-8)name.scale.set((r.width-8)/name.width);
      this.text(`#${card.number}`,6,r.height-17,8,0x79a8bf,group);const value=this.text(money(card.value),r.width-6,r.height-17,9,count?0xacecf4:0x7596a8,group,'right','bold');if(value.width>r.width*.64)value.scale.set(r.width*.64/value.width);
      if(count){const badgeW=26;g.roundRect(r.width-badgeW-3,5,badgeW,19,5).fill(0x092d47).stroke({color:0x9eeeff,width:1});this.text(`×${count}`,r.width-badgeW/2-3,7,10,C.white,group,'center','bold');}
      this.hit(`binder-${card.id}`,`${card.name}, ${count} collected`,r.x,r.y,r.width,r.height,()=>s.inspect(card));
      if(!s.reduced)this.moneyAnimations.push(gsap.from(group,{alpha:0,y:group.y+12,duration:.25,delay:i*.024,ease:'power3.out',onUpdate:()=>this.stage.draw()}));
    });
    this.libraryPager(w,h,pg.page,pg.pages,'collection');
  }
  private history(w:number,h:number){
    const s=this.state!,history=s.save?.history??[],l=historyLayout(w,h),pg=pageWindow(history.length,l.rows,this.page);this.page=pg.page;
    this.libraryShell('PACK HISTORY',`${history.length} ${history.length===1?'pack':'packs'} collected`,w,h,'history');
    const top=h<500?90:99,statsH=h<500?46:58,stats=new Graphics().roundRect(l.pad,top,l.width,statsH,8).fill(0x0f344d);this.root.addChild(stats);
    this.text('TOTAL WON',l.pad+14,top+7,9,C.cyan,this.root,'left','bold');this.money(s.save?recordedWinnings(s.save):0,l.pad+14,top+(h<500?31:39),h<500?22:31,0xfff2bb,'left','lifetime','lifetime',false,l.width*.58,true);
    const best=Math.max(0,...history.map(r=>r.total));this.text('BEST PACK',w-l.pad-14,top+7,9,C.muted,this.root,'right','bold');this.money(best,w-l.pad-14,top+(h<500?32:40),h<500?18:23,C.white,'right','history-best','best',false,l.width*.34,true);
    if(!history.length){this.ball(w/2,h/2-20,28,0x46768f);this.text('No packs opened yet',w/2,h/2+24,17,C.white,this.root,'center','bold');}
    history.slice(pg.start,pg.end).forEach((result,i)=>{
      const x=l.pad,y=l.top+i*(l.rowHeight+l.gap),wRow=l.width,hRow=l.rowHeight,group=new Container();group.position.set(x,y);this.root.addChild(group);
      this.hit(`history-pack-${result.id}`,`View all cards from ${result.pack?.name??'Obsidian Flames'}`,x,y,wRow,hRow,()=>this.openHistoryHand(result));
      const g=new Graphics().poly([12,0,wRow-12,0,wRow,12,wRow,hRow-12,wRow-12,hRow,12,hRow,0,hRow-12,0,12]).fill(0x12354e).stroke({color:0x466f87,width:1});g.moveTo(2,18).lineTo(2,hRow-18).stroke({color:i===0?0xadebfc:0x3f7d9b,width:3});group.addChild(g);
      const packW=hRow<90?35:42;this.picture(result.pack?.packImage??s.packs[0].packImage,14,8,packW,hRow-16,group);
      const textX=packW+29,title=this.text(result.pack?.name??'Obsidian Flames',textX,12,w<500?13:16,C.white,group,'left','bold'),titleW=w<500?wRow-textX-12:wRow-textX-210;if(title.width>titleW)title.scale.set(titleW/title.width);
      const date=new Date(result.at);this.text(date.toLocaleDateString(undefined,{month:'short',day:'numeric'})+' · '+date.toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit'}),textX,hRow<90?34:38,9,C.muted,group);
      this.text(`${result.cards.length} CARDS`,textX,hRow-22,9,0x85bdce,group,'left','bold');
      const amount=this.money(result.total,x+wRow-14,y+hRow-30,w<500?24:29,0xe4ffff,'right',`history-${result.id}`,result.id,false,w<500?wRow*.52:180,true);group.addChild(amount);amount.position.set(wRow-14,hRow-23);
      if(w>=600){const bestCards=[...result.cards].sort((a,b)=>b.value-a.value).slice(0,3);bestCards.forEach((card,j)=>{const cx=wRow-300+j*29;const thumbH=Math.min(63,hRow-24);this.picture(card.image,cx,12,thumbH/1.4,thumbH,group,true,0,card);this.hit(`history-card-${result.id}-${j}`,`View pack with ${card.name}`,x+cx,y+12,29,thumbH,()=>this.openHistoryHand(result,result.cards.indexOf(card)));});}
      if(!s.reduced)this.moneyAnimations.push(gsap.from(group,{alpha:0,x:x+18,duration:.28,delay:i*.045,ease:'power3.out',onUpdate:()=>this.stage.draw()}));
    });
    this.libraryPager(w,h,pg.page,pg.pages,'history');
  }
  private openHistoryHand(result:Result,index?:number){this.historyOpening=result;this.historySelection=index??result.cards.reduce((best,c,i)=>c.value>result.cards[best].value?i:best,0);this.build();playSound('flip',{gain:.35});}
  private focusHistoryCard(index:number){if(!this.historyOpening||index===this.historySelection)return;this.historySelection=index;const {width,height}=modalLayout(this.stage.app.screen.width,this.stage.app.screen.height,'history-pack'),l=historyFanLayout(width,height,this.historyOpening.cards.length);this.historyFanCards.forEach((c,i)=>{const p=l.pose(i,i===index);Object.assign(c,p);c.group.zIndex=i===index?100:i;});this.updateHistoryDetails();if(this.state?.reduced){this.animateHistoryFan(0);this.stage.draw();}}
  private updateHistoryDetails(){const c=this.historyOpening?.cards[this.historySelection];if(!c)return;const width=modalLayout(this.stage.app.screen.width,this.stage.app.screen.height,'history-pack').width,max=Math.min(470,width-86-(width<600?112:190));if(this.historyFanTitle){this.historyFanTitle.text=c.name;this.historyFanTitle.scale.set(1);if(this.historyFanTitle.width>max)this.historyFanTitle.scale.set(max/this.historyFanTitle.width);}if(this.historyFanRarity){this.historyFanRarity.text=`${c.rarity} · #${c.number||'Energy'}`;this.historyFanRarity.scale.set(1);if(this.historyFanRarity.width>max)this.historyFanRarity.scale.set(max/this.historyFanRarity.width);}this.historyFanValue?.retarget(c.value);this.historyFanValue?.display(c.value);}
  private animateHistoryFan(dt:number){if(!this.historyOpening||this.state?.inspected||this.transitioning)return;const blend=this.state?.reduced?1:Math.min(1,dt*13);this.historyFanCards.forEach((c,i)=>{if(!c.ready)return;const bob=this.state?.reduced?0:Math.sin(this.historyFanTime*.9+i*.37)*2;const g=c.group;g.x+=(c.x-g.x)*blend;g.y+=(c.y+bob-g.y)*blend;g.rotation+=(c.rotation-g.rotation)*blend;g.scale.set(g.scale.x+(c.scale-g.scale.x)*blend);});}
  private historyHand(w:number,h:number,result:Result){
    this.libraryShell('PACK REPLAY',result.pack?.name??'Obsidian Flames',w,h,'binder',false);const l=historyFanLayout(w,h,result.cards.length),compact=h<420;
    this.text('PACK WIN',34,compact?88:102,9,C.cyan,this.root,'left','bold');this.money(result.total,w-34,compact?95:119,compact?20:28,0xfff2b8,'right','history-pack-total',result.id,false,180,true);
    if(!compact)this.text(w<600?'Tap to lift · Tap again to inspect':'Hover to fan · Select a card to inspect',34,123,10,C.muted);
    const hand=new Container();hand.sortableChildren=true;this.root.addChild(hand);
    result.cards.forEach((card,i)=>{const p=l.pose(i,i===this.historySelection),group=new Container();group.position.set(p.x,p.y);group.rotation=p.rotation;group.scale.set(p.scale);group.zIndex=i===this.historySelection?100:i;hand.addChild(group);
      const shadow=new Graphics().roundRect(-l.width/2-2,-l.height/2+4,l.width+4,l.height,7).fill({color:0x000b18,alpha:.7}).roundRect(-l.width/2-1,-l.height/2-1,l.width+2,l.height+2,6).stroke({color:0xa9dfed,width:1.5,alpha:.7});group.addChild(shadow);this.picture(card.image,-l.width/2,-l.height/2,l.width,l.height,group,true,0,card);const entry={group,...p,ready:!!this.state!.reduced};this.historyFanCards.push(entry);
      const hitW=i===0||i===result.cards.length-1?l.step/2+l.width/2:l.step;const hitX=i===0?p.x-l.width/2:p.x-l.step/2;
      this.hit(`history-fan-${i}`,`Inspect ${card.name} from pack`,hitX,Math.max(104,p.y-l.height/2-l.lift),hitW,l.height+l.lift+16,()=>{if(this.historySelection!==i){this.focusHistoryCard(i);this.stage.draw();}else this.state!.inspect(card);});
      if(!this.state!.reduced)this.moneyAnimations.push(gsap.from(group,{x:w/2,y:h+40,rotation:0,alpha:0,duration:.48,delay:i*.026,ease:'power3.out',onUpdate:()=>this.stage.draw(),onComplete:()=>{entry.ready=true;}}));
    });
    this.historyFanTitle=this.text('',34,l.detailY,compact?14:20,C.white,this.root,'left','bold');this.historyFanRarity=this.text('',34,l.detailY+(compact?19:29),compact?8:10,C.muted);this.historyFanValue=this.money(result.cards[this.historySelection].value,w-34,l.detailY+(compact?11:20),compact?22:31,0xffedb0,'right','history-card-value',result.id,false,w<600?112:190,true);this.updateHistoryDetails();if(!this.state!.reduced)gsap.ticker.add(this.tickHistoryFan);
  }
  private settingsDrawer(w:number,h:number){
    const s=this.state!,l=settingsLayout(w,h),{x,y,width,height}=l,cx=x+l.pad;
    const shell=new Graphics(),shape=(n:number)=>[x+24+n,y+n,x+width-18-n,y+n,x+width-n,y+18+n,x+width-n,y+height-22-n,x+width-22-n,y+height-n,x+20+n,y+height-n,x+n,y+height-20-n,x+n,y+24+n];
    shell.poly(shape(0)).fill(0x071b30).stroke({color:0x77b8d2,width:2}).poly(shape(5)).stroke({color:0x315571,width:1}).poly([x+7,y+28,x+28,y+7,x+115,y+7,x+103,y+14,x+29,y+14,x+14,y+29,x+14,y+76,x+7,y+83]).fill(0xd44a63);this.root.addChild(shell);
    this.ball(x+42,y+43,16,0xf0edc5);this.text('POKÉGEAR',x+69,y+24,21,C.white,this.root,'left','bold');this.text('SETTINGS',x+70,y+52,9,C.cyan,this.root,'left','bold');this.button('close','Return to game',x+width-59,y+25,34,34,()=>this.dismissModal(),{visibleLabel:'×',large:true});
    shell.moveTo(cx,y+80).lineTo(x+width-l.pad,y+80).stroke({color:0x5290ac,width:1,alpha:.6});
    const options=[['Sound','Music & effects',s.sound,'sound'],['Turbo','Faster animations',s.turbo,'turbo'],['Low graphics','Lightweight mode',s.low,'low']] as const;
    options.forEach(([label,description,on,action],i)=>{const yy=l.bodyY+i*(l.rowHeight+l.gap),rw=l.column,cy=yy+l.rowHeight/2;
      shell.roundRect(cx,yy,rw,l.rowHeight,8).fill(0x10354e).stroke({color:0x315e76,width:1});shell.roundRect(cx+10,cy-16,30,32,6).fill(0x08263d);
      const icon=new Graphics();icon.position.set(cx+25,cy);this.root.addChild(icon);if(action==='sound'){icon.poly([-8,-4,-3,-4,3,-10,3,10,-3,4,-8,4]).fill(0xaee8ed).moveTo(2+Math.cos(-.65)*10,Math.sin(-.65)*10).arc(2,0,10,-.65,.65).stroke({color:0xaee8ed,width:1.6});}else if(action==='turbo')icon.poly([2,-12,-7,1,-1,1,-4,12,8,-3,2,-3]).fill(0xf5e8ad);else{for(let k=0;k<3;k++)icon.roundRect(-9+k*7,7-k*6,4,5+k*6,1).fill(0xaee8ed);}
      this.text(label,cx+50,yy+(l.compact?7:11),l.compact?12:15,C.white,this.root,'left','bold');this.text(description,cx+50,yy+(l.compact?24:34),l.compact?7:9,C.muted);
      const sx=cx+rw-58; shell.roundRect(sx,cy-13,44,26,13).fill(on?0x267f8f:0x051e31).stroke({color:on?0xb5f7e7:0x4b6b83,width:1.2}).circle(sx+(on?31:13),cy,9).fill(on?0xe7fff3:0x799caf);this.hit(action,`${label}: ${on?'on':'off'}`,cx,yy,rw,l.rowHeight,()=>s.action(action));
    });
    const ax=l.actionsX,aw=l.actionsWidth,ay=l.actionsY,half=(aw-8)/2;
    this.button('credits-menu','Add 1000 demo credits',ax,ay,aw,42,()=>s.action('credits'),{primary:true,small:true,visibleLabel:'+1,000 DEMO CREDITS'});
    this.button('fullscreen','Full screen',ax,ay+50,half,40,()=>s.action('fullscreen'),{small:true});this.button('drawer-export','Export collection',ax+half+8,ay+50,half,40,()=>s.action('export'),{small:true,visibleLabel:'Export cards'});
    this.button('drawer-about','How to play',ax,ay+98,half,38,()=>s.action('about'),{small:true});this.button('reset-menu','Reset demo and collection',ax+half+8,ay+98,half,38,()=>s.action('reset'),{disabled:!!s.save?.active,small:true,visibleLabel:'Reset demo'});
    if(l.compact)this.text('DEMO CREDITS · NO CASH VALUE',ax+aw/2,ay+151,7,C.muted,this.root,'center');else this.text('DEMO CREDITS · NO CASH VALUE',x+width/2,y+height-25,8,C.muted,this.root,'center');
  }
  private autoMenu(w:number,h:number){
    const s=this.state!,count=s.autoCount??5,mode=s.autoMode??'individual',l=autoSpinLayout(w,h);
    this.libraryShell('AUTO SPIN',s.selected.name,w,h,'binder');
    this.text('NUMBER OF PACKS',l.x,l.countLabelY,10,C.cyan,this.root,'left','bold');
    AUTO_SPIN_COUNTS.forEach((n,i)=>{const r=l.count(i);this.button(`auto-count-${n}`,`${n} packs`,r.x,r.y,r.width,r.height,()=>s.configureAuto?.(n,mode),{active:n===count,visibleLabel:String(n),large:true});});
    this.text('CARD REVEAL',l.modeLabelX,l.modeLabelY,10,C.cyan,this.root,'left','bold');
    for(const [key,label,visible] of [['individual','Reveal cards individually','One by one'],['all','Reveal all cards in each pack','Open All']] as const){const r=l[key];this.button(`auto-${key}`,label,r.x,r.y,r.width,r.height,()=>s.configureAuto?.(count,key),{active:mode===key,visibleLabel:visible,small:true});}
    this.text(`${money(s.selected.price)} / pack · ${money(s.selected.price*count)} total cost`,w/2,l.infoY,l.compact?10:12,C.white,this.root,'center','bold');
    if(!l.compact)this.text('Stop anytime. Packs are charged as they open.',w/2,l.infoY+24,10,C.muted,this.root,'center');
    const r=l.start;this.button('auto-start',`Start Auto Spin: ${count} packs`,r.x,r.y,r.width,r.height,()=>s.action('auto-start'),{primary:true,disabled:!s.ready||!s.save||s.save.balance<s.selected.price,visibleLabel:`START · ${count} PACKS`});
  }
  private menu(w:number,h:number){
    const s=this.state!;if(s.panel==='auto'){this.autoMenu(w,h);return;}if(s.panel==='settings'){this.settingsDrawer(w,h);return;}if(s.panel==='history'){if(this.historyOpening)this.historyHand(w,h,this.historyOpening);else this.history(w,h);return;}
    this.libraryShell('TRAINER GUIDE','Pack opening',w,h,'binder');
    const compact=h<440,pad=28,gap=12,columns=compact?2:1,rowH=compact?66:Math.min(92,(h-179)/4),cell=(w-pad*2-(columns-1)*gap)/columns;
    const steps=[['CHOOSE','Pick a pack. Buy it, then pull the foil or press Open.'],['REVEAL','Reveal one card at a time, or use Open All.'],['COLLECT','Collect the pack to add its value and cards.'],['PLAY YOUR WAY','Turbo speeds up animations. Auto Spin opens a chosen pack count.']];
    steps.forEach(([title,body],i)=>{const x=pad+i%columns*(cell+gap),y=100+Math.floor(i/columns)*(rowH+8);this.panel(x,y,cell,rowH,0x11364e,0x3d657d);this.text(String(i+1).padStart(2,'0'),x+12,y+10,compact?16:22,0xe9dfaa,this.root,'left','bold');this.text(title,x+48,y+10,compact?10:12,C.white,this.root,'left','bold');this.text(body,x+48,y+29,compact?9:12,C.muted,this.root,'left','normal',cell-62);});
    this.text('Demo credits have no cash value. Card values and odds are illustrative.',w/2,h-47,w<500?9:10,C.muted,this.root,'center','normal',w-64);
  }
  private inspector(w:number,h:number,card:Card){
    this.libraryShell('CARD DETAILS',card.name,w,h,'binder');const wide=w>=700&&h>=500;
    const area=wide?{x:34,y:99,w:w*.51,h:h-126}:{x:26,y:95,w:w-52,h:h-173};
    this.picture(card.image,area.x,area.y,area.w,area.h,this.root,true,foilStrength(card.rarity,card.value));
    if(wide){const x=w*.61;this.text(card.name,x,145,27,C.white,this.root,'left','bold',w-x-34);this.text(card.rarity.toUpperCase(),x,231,11,C.cyan,this.root,'left','bold');this.text(`#${card.number||'Energy'}`,x,258,12,C.muted);this.text('CARD VALUE',x,330,9,C.muted,this.root,'left','bold');this.money(card.value,x,379,42,0xffefb6,'left','inspect-card',card.id,false,w-x-28,true);this.text('Move over the card to catch the foil.',x,h-96,11,C.muted,this.root,'left','normal',w-x-34);}
    else{this.text(card.rarity,28,h-58,11,C.cyan,this.root,'left','bold');this.text(`#${card.number||'Energy'}`,28,h-36,9,C.muted);this.money(card.value,w-28,h-42,27,0xffefb6,'right','inspect-card',card.id,false,w*.45,true);}
  }
  private resultShell(w:number,h:number,title:string,subtitle:string){
    const chrome=this.resultChrome=new Container();this.root.addChild(chrome);
    const shape=(n:number)=>[26+n,8+n,w-26-n,8+n,w-8-n,26+n,w-8-n,h-26-n,w-26-n,h-8-n,26+n,h-8-n,8+n,h-26-n,8+n,26+n];
    const body=new Graphics().poly(shape(0)).fill({color:0x061d36,alpha:.84}).stroke({color:0x73d6ec,width:2,alpha:.9}).poly(shape(5)).stroke({color:0x29769b,width:1,alpha:.7});chrome.addChild(body);
    const compact=h<440,heading=this.text(title,w/2,compact?19:22,compact?16:21,C.white,chrome,'center','bold');if(heading.width>w-70)heading.scale.set((w-70)/heading.width);
    const sub=this.text(subtitle,w/2,compact?41:51,compact?9:11,C.cyan,chrome,'center','bold');if(sub.width>w-70)sub.scale.set((w-70)/sub.width);
    return chrome;
  }
  private winSummary(value:number,identity:string,area:{x:number;y:number;width:number;height:number},mode:'pack'|'session'|'interlude'){
    const key=`summary:${identity}`,state=moneyState(this.moneyValues.get(key),identity,value,false);this.moneyValues.set(key,state);
    const effectsWidth=mode==='interlude'?this.stage.app.screen.width-20:area.x*2-24,effectsHeight=mode==='interlude'?this.stage.app.screen.height*.7:Math.min(520,this.stage.app.screen.height*.7);
    const win=new ResultWin(state,{width:area.width,height:area.height,effectsWidth,effectsHeight,mode,reduced:this.state!.reduced,turbo:!!this.state!.turbo,low:this.state!.low,draw:()=>this.stage.draw()});
    win.position.set(area.x,area.y);win.celebrationLayer.position.copyFrom(win.position);this.root.addChild(win.celebrationLayer,win);return win;
  }
  private results(w:number,h:number,result:Result,fromAuto=false){
    const l=packResultsLayout(w,h),s=this.state!,ordinal=fromAuto?(s.autoRun!.results.findIndex(pack=>pack.id===result.id)+1):0;
    const chrome=this.resultShell(w,h,fromAuto?`PACK ${String(ordinal).padStart(2,'0')} / ${s.autoRun!.completed}`:'PACK COMPLETE',result.pack?.name??s.selected.name);
    this.resultAmount=this.winSummary(result.total,result.id+':result',l.total,'pack');
    result.cards.forEach((card,index)=>{const p=l.slot(index),group=new Container();group.position.set(p.x,p.y);this.root.addChild(group);
      const rare=isSpecialCard(card),edge=rare?0xffe88e:0x6dcbdc;
      group.addChild(new Graphics().roundRect(-p.width/2-3,-p.height/2-3,p.width+6,p.height+6,5).fill({color:0x08334f,alpha:.5}).stroke({color:edge,width:rare?1.8:1,alpha:rare?.9:.35}));
      this.picture(card.image,-p.width/2,-p.height/2,p.width,p.height,group,true,0,card);
      const caption=this.text(card.id==='energy'?'Energy':money(card.value),0,p.height/2+7,p.width<60?9:11,rare?0xffedb0:C.cyan,group,'center','bold');if(caption.width>p.width+8)caption.scale.set((p.width+8)/caption.width);
      this.resultCards.push({group,x:p.x,y:p.y,width:p.width,index});this.hit(`result-${index}`,`Inspect ${card.name}`,p.x-p.width/2,p.y-p.height/2,p.width,p.height,()=>s.inspect(card));
    });
    this.root.addChild(this.resultAmount);
    const y=h-61;
    if(fromAuto){const bw=Math.min(250,w-72);chrome.addChild(this.button('auto-results-back','Back to all packs',w/2-bw/2,y,bw,42,()=>this.dismissModal(),{primary:true,visibleLabel:'ALL PACKS'}));}
    else{const bw=Math.min(168,(w-68)/2);chrome.addChild(this.button('result-collection','View collection',w/2-bw-6,y,bw,42,()=>s.action('collection'),{visibleLabel:'Collection'}),this.button('result-continue','Continue',w/2+6,y,bw,42,()=>this.dismissModal('continue'),{primary:true}));}
  }
  private autoResults(w:number,h:number,session:AutoSpinView){
    const s=this.state!,l=autoResultsLayout(w,h),pg=pageWindow(session.results.length,l.capacity,this.autoResultsPage);this.autoResultsPage=pg.page;
    const chrome=this.resultShell(w,h,session.completed>=session.total?'AUTO SPIN COMPLETE':'AUTO SPIN STOPPED',`${session.completed} PACK${session.completed===1?'':'S'} OPENED`);
    this.resultAmount=this.winSummary(session.totalWon,session.id+':session',l.total,'session');
    session.results.slice(pg.start,pg.end).forEach((result,i)=>{
      const r=l.slot(i),index=pg.start+i,group=new Container();group.pivot.set(r.width/2,r.height/2);group.position.set(r.x+r.width/2,r.y+r.height/2);this.root.addChild(group);this.paints.set(`auto-pack-${index}`,group);
      group.addChild(new Graphics().roundRect(0,0,r.width,r.height,9).fill({color:0x12486c,alpha:.65}).stroke({color:0x70cde8,width:1.3,alpha:.7}).ellipse(r.width/2,r.height-46,r.width*.31,3).fill({color:0x6eeaff,alpha:.2}).roundRect(5,r.height-27,r.width-10,22,6).fill({color:0x052b46,alpha:.75}).stroke({color:0xffe89c,width:1,alpha:.25}));
      const artHeight=Math.max(12,r.height-53);this.picture(result.pack?.packImage??s.selected.packImage,6,4,r.width-12,artHeight,group);
      this.text(`PACK ${String(index+1).padStart(2,'0')}`,r.width/2,r.height-44,r.width<90?9:11,C.cyan,group,'center','bold');
      const prize=this.text(money(result.total),r.width/2,r.height-16,r.width<90?14:18,0xffedb0,group,'center','bold');prize.anchor.set(.5);if(prize.width>r.width-18)prize.scale.set((r.width-18)/prize.width);
      this.hit(`auto-pack-${index}`,`View pack ${index+1}, ${result.pack?.name??s.selected.name}, won ${money(result.total)}`,r.x,r.y,r.width,r.height,()=>{this.autoPack=result;this.build();});
      if(!s.reduced)this.moneyAnimations.push(gsap.from(group,{alpha:0,y:group.y+10,duration:.3,delay:i*.025,ease:'power3.out',onUpdate:()=>this.stage.draw()}));
    });
    const y=h-61,bw=Math.min(pg.pages>1?150:230,w-156);
    chrome.addChild(this.button('session-continue','Continue',w/2-bw/2,y,bw,42,()=>this.dismissModal('continue'),{primary:true}));
    if(pg.pages>1){chrome.addChild(this.button('session-prev','Previous packs',24,y,48,42,()=>{this.autoResultsPage--;this.build();},{disabled:pg.page===0,visibleLabel:'‹',large:true}),this.button('session-next','Next packs',w-72,y,48,42,()=>{this.autoResultsPage++;this.build();},{disabled:pg.page+1===pg.pages,visibleLabel:'›',large:true}));this.text(`${pg.start+1}–${pg.end} / ${session.completed}`,w/2,h-82,9,C.muted,chrome,'center','bold');}
  }
  private autoInterlude(w:number,h:number,result:Result,session:AutoSpinView){
    const titleY=h<430?45:Math.max(85,h*.25),title=this.text(`PACK ${session.completed} / ${session.total}`,w/2,titleY,h<430?17:24,C.white,this.root,'center','bold');title.style.stroke={color:0x052344,width:3};
    this.winSummary(result.total,session.id+':'+result.id+':interlude',{x:w/2,y:h*.49,width:Math.min(w-32,680),height:Math.min(210,h*.35)},'interlude');
    const label=session.running?'NEXT PACK':'SESSION COMPLETE';this.text(label,w/2,h*.72,h<430?11:14,0xb2efff,this.root,'center','bold');
    const dots=new Container();dots.position.set(w/2,h*.72+31);this.root.addChild(dots);
    for(let i=0;i<3;i++){const dot=this.ball((i-1)*20,0,4,0xadefff,dots);if(!this.state!.reduced)this.moneyAnimations.push(gsap.to(dot,{alpha:.25,duration:.35,delay:i*.1,repeat:-1,yoyo:true,ease:'sine.inOut',onUpdate:()=>this.stage.draw()}));}
    if(session.running){const bw=Math.min(166,w-60);this.button('auto-interlude-stop','Stop Auto Spin',w/2-bw/2,h-58,bw,38,()=>this.state!.action('auto-stop'),{small:true,visibleLabel:'STOP AUTO'});}
  }
  private animateResults(){
    const launch=this.resultLaunch!,chrome=this.resultChrome!,d=this.state!.turbo?.35:1,trail=new Graphics();this.root.addChildAt(trail,1);
    this.transitioning=true;chrome.alpha=0;this.backdrop.alpha=0;
    const tracks=this.resultCards.map(c=>{const source=launch.sources[c.index],from={x:Math.max(18,Math.min(this.stage.app.screen.width-18,source.x))-this.modalOrigin.x,y:source.y-this.modalOrigin.y};c.group.position.set(from.x,from.y);c.group.scale.set(source.cardWidth/c.width);return {...c,from,startScale:source.cardWidth/c.width,p:0};});
    const timeline=this.modalTween=gsap.timeline({onUpdate:()=>{trail.clear();for(const c of tracks){if(c.p<=0||c.p>=1)continue;const a=collectionFlight(Math.max(0,c.p-.09),c.from,c,c.index),b=collectionFlight(c.p,c.from,c,c.index);trail.moveTo(a.x,a.y).lineTo(b.x,b.y).stroke({color:0x7deeff,width:7,alpha:.13}).moveTo(a.x,a.y).lineTo(b.x,b.y).stroke({color:0xddffff,width:1.4,alpha:.6});}this.stage.draw();},onComplete:()=>{trail.destroy();this.resultUnderlay?.destroy({texture:true,textureSource:true});this.resultUnderlay=null;this.transitioning=false;this.emitTargets();}});
    timeline.to(chrome,{alpha:1,duration:.28*d,ease:'power2.out'},0).to(this.backdrop,{alpha:1,duration:.3*d},0);
    if(this.resultUnderlay)timeline.to(this.resultUnderlay,{alpha:0,duration:.26*d},.1*d);
    for(const c of tracks)timeline.to(c,{p:1,duration:.53*d,ease:'none',onUpdate:()=>{const p=collectionFlight(c.p,c.from,c,c.index);c.group.position.set(p.x,p.y);c.group.rotation=p.rotation;c.group.scale.set(c.startScale+(1-c.startScale)*p.scale);},onComplete:()=>{if(c.index%4===0)playSound('land',{gain:.28});}},(.10+c.index*.035)*d);
    timeline.to({}, {duration:.08*d});
  }

  destroy(){this.autoCoverTween?.kill();this.autoCover?.destroy();gsap.ticker.remove(this.tickSpecialFrames);this.specialFrames.clear();this.trayPrices.clear();gsap.ticker.remove(this.tickHistoryFan);this.trayHost.removeEventListener('pointerdown',this.trayDown,true);this.trayHost.removeEventListener('pointermove',this.trayMove,true);this.trayHost.removeEventListener('pointerup',this.trayUp,true);this.trayHost.removeEventListener('pointercancel',this.trayCancel,true);this.trayHost.removeEventListener('click',this.trayClick,true);this.trayHost.removeEventListener('wheel',this.trayWheel,true);this.stage.app.ticker.remove(this.tickRewards);this.rewards.destroy();this.feedbackTweens.forEach(t=>t.kill());this.feedbackTweens.clear();this.trayArt?.destroy(true);this.frozenHud?.destroy({texture:true,textureSource:true});this.resultUnderlay?.destroy({texture:true,textureSource:true});this.modalTween?.kill();this.returnTween?.kill();this.returnCover?.destroy({texture:true,textureSource:true});this.backdrop.destroy();this.trayTween?.kill();this.stage.onCardStored=null;this.stage.onSpecialWin=null;this.stage.onCollectFocus=null;this.stage.cardDestination=null;this.moneyAnimations.forEach(t=>t.kill());this.destroyed=true;++this.generation;window.removeEventListener('keydown',this.keydown);this.stage.onLayout=null;this.root.destroy({children:true});this.thumbs.forEach(t=>t.destroy(true));this.thumbs.clear();this.pending.clear();this.tray.destroy(true);BitmapFont.uninstall('LegendsMoney');}
}
