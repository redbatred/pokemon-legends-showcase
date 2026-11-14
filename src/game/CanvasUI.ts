import {winPokemonImage} from './winPresentationIdentity';
import {createShowdownBadge} from './showdown/ShowdownSymbolsView';
import {showdownSocketsLayout} from './showdown/showdownSymbolsLayout';
import { Assets, Container, Graphics, Sprite, Text, Texture, BitmapFont,Rectangle,type Ticker } from 'pixi.js';
import { gsap } from 'gsap';
import {packGridLayout,packTileLayout} from './packGrid';
import {binderLayout,historyLayout} from './libraryLayout';
import {cardPowerKind} from './powerProfiles';
import {historyFanLayout} from './historyFan';
import {settingsLayout} from './settingsLayout';
import {packResultsLayout,autoResultsLayout,collectionFlight,packTiles} from './packResultsLayout';
import {packRevealLayout} from './packRevealMotion';
import {playSound} from './audio';
import {openingUiPose} from './openingUiMotion';
import {utilityLayout,compactToolbar} from './utilityLayout';
import {TrayPan} from './trayPan';
import {AUTO_SPIN_COUNTS,openingAnimationRate,type AutoRevealMode,type AutoSpinView} from './autoSpin';
import { gameLayout, pageWindow, cardTrayLayout,revealControlsLayout } from './rendering';
import { money, recordedWinnings, type Card, type Pack, type Save, type Result } from './model';
import {modalLayout,totalWinLayout,rewardLayout,creditLayout,autoSpinLayout,cheatsLayout} from './modalLayout';
import {CHEAT_BONUSES,CHEAT_LABELS,CHEAT_LEGENDARIES,CHEAT_TOTALS,CHEAT_WINS,NO_CHEATS,cheatSummary,cheatsActive,type Cheats} from './cheats';
import {drawPanel,drawPlate,drawBall} from './panelArt';
import {MoneyReadout,prepareAmountFont} from './MoneyReadout';
import {ResultWin,type ResultSource} from './ResultWin';
import {drawResultPanel,resultPanelParts} from './resultPanelArt';
import {drawTraySlot,trayShaftTexture,TRAY_PAD} from './traySlotArt';
import {awardTextures,ELEMENT_LIGHT} from './AwardJuice';
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

export type Panel = 'collection'|'settings'|'history'|'about'|'auto'|'cheats'|null;
export type GameAction = 'open'|'tear'|'next'|'all'|'continue'|'close'|'collection'|'settings'|'history'|'about'|'credits'|'sound'|'turbo'|'auto'|'auto-start'|'auto-stop'|'low'|'reset'|'export'|'retry'|'dismiss'|'fullscreen'|'showdown'|'cheats'|'cheats-reset'|'cheats-open';
export interface UIState {phase:string;index:number;groupRevealCount?:number;save:Save|null;packs:Pack[];selected:Pack;pool:Card[];cards:Card[];ready:boolean;error:string;toast:string;panel:Panel;inspected:Card|null;result?:Result;sound:boolean;turbo?:boolean;autoCount?:number;autoMode?:AutoRevealMode;autoRun?:AutoSpinView;configureAuto?:(count:number,mode:AutoRevealMode)=>void;cheats?:Cheats;setCheats?:(patch:Partial<Cheats>)=>void;reduced:boolean;low:boolean;action:(action:GameAction)=>void;select:(pack:Pack)=>void;inspect:(card:Card)=>void}
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
  private resultChrome:Container|null=null;private resultAmount:ResultWin|null=null;private resultCount:MoneyState|null=null;private resultCards:{group:Container;x:number;y:number;width:number;index:number;shadow:Sprite;caption:Text;landed:boolean}[]=[];private resultButtons:Container[]=[];private resultSeen:{id:string;bonus:boolean;slots:{x:number;y:number;width:number}[]}|null=null;
  private modalOrigin={x:0,y:0};
  private tray:Texture;
  private moneyAnimations:gsap.core.Animation[]=[];private moneyValues=new Map<string,MoneyState>();
  private rewards:RewardTransfers;private cardCaptions:Container[]=[];private cardCaptionKey='';
  private rewardPhaseKey='';
  private awardCard=(card:Card,immediate=false)=>{
    const s=this.state;if(!s?.save?.active||s.save.active.cards[s.index]?.id!==card.id)return;
    const tier=winTier(card,s.save.active.pack?.price??s.selected.price,!!s.save.active.previewSpecial&&s.index===0);
    this.rewards.reveal(s.index,card.value,s.reduced,tier,s.low,cardPowerKind(card),card.name,winPokemonImage(card),this.stage.winOrigins,s.save.active.pack?.price??s.selected.price);
    this.stage.scene.setBoard({phase:'revealed',packName:s.save.active.pack?.name??s.selected.name,index:s.index,cardName:card.name,cardValue:card.value,special:!!tier});
    if(immediate){this.rewards.finish(s.index);this.rewards.update(0,this.stage.app.screen.width,this.stage.app.screen.height,s.reduced);this.stage.draw();}
  };
  waitForWinRecovery(){return this.rewards.waitForWinRecovery();}
  /** A caught bonus joins this pack's running total. */
  awardBonus(amount:number){
    if(amount<=0)return;const s=this.state,{width:w,height:h}=this.stage.app.screen;
    // On the play screen it is an event: stamped over the pedestal's three seats, then thrown into the total. Anywhere else it is simply counted.
    if(s&&!s.reduced&&!s.panel&&!s.inspected&&['awaiting','revealing','revealed'].includes(s.phase)){const seats=showdownSocketsLayout(w,h).sockets,seat=seats[1]??seats[0]??{x:w/2,y:h/2};this.rewards.bonus(amount,{x:seat.x,y:seat.y});return;}
    this.rewards.ledger.total+=amount;this.creditReward(this.rewards.ledger.total);
  }
  private focusDimmed=false;
  private tickRewards=(ticker:Ticker)=>{this.animateChrome();const s=this.state;if(!s)return;
    // The special reveal owns the lens: controls step back until it hands the scene on.
    const focus=this.stage.revealFocus;if(!this.transitioning&&!this.modalTween&&(focus>0||this.focusDimmed)){this.root.alpha=1-focus*.86;this.focusDimmed=focus>0;}
    const visible=!s.panel&&!s.inspected&&['awaiting','revealing','revealed','collecting','settling'].includes(s.phase);this.rewards.root.visible=visible;this.rewards.background.visible=visible;if(visible)this.rewards.update(ticker.deltaMS/1000,this.stage.app.screen.width,this.stage.app.screen.height,s.reduced,openingAnimationRate(false,!!s.autoRun&&!s.turbo));this.stage.setWinOverlay(visible?this.rewards.cinematicOpacity:0,visible?this.rewards.actorOcclusion:0,visible?this.rewards.backgroundOcclusion:0);for(const caption of this.cardCaptions)caption.alpha=1-this.rewards.celebrationOpacity;};
  private creditReward=(total:number,settled=false)=>{if(this.moneyValues.get('revealed')?.target===total)return;if(this.packValueLabel){this.packValueLabel.retarget(total);if(settled){this.packValueLabel.display(total);this.packValueLabel.pulse();}else this.packValueLabel.pulse(1+this.rewards.arrivalPower*1.8);}else{const state=moneyState(this.moneyValues.get('revealed'),this.openingId,total,false);if(settled){state.value=total;state.remaining=0;}this.moneyValues.set('revealed',state);}};
  private updating=false;
  private lastPackId='';private rackGroup:Container|null=null;private rackMask:Graphics|null=null;private rackGlow:Graphics|null=null;private rackKind:'packs'|'cards'='packs';private arrowPulses:{glyph:Graphics;base:number;phase:number;axis:'x'|'y'}[]=[];
  private utilityPulses:Graphics[]=[];
  private cardPulses:{group:Container;baseX:number;baseY:number;rotation:number;phase:number;shine:Graphics}[]=[];
  private generation=0;private hits:HitTarget[]=[];private paints=new Map<string,Container>();private feedbackTweens=new Map<string,gsap.core.Tween>();
  private historyOpening:Result|null=null;private historySelection=0;private historyFanCards:{group:Container;x:number;y:number;rotation:number;scale:number;ready:boolean}[]=[];private historyFanTime=0;private tickHistoryFan=(_time:number,delta:number)=>{if(document.hidden)return;this.historyFanTime+=delta/1000;this.animateHistoryFan(Math.min(.05,delta/1000));this.stage.draw();};private historyFanTitle:Text|null=null;private historyFanRarity:Text|null=null;private historyFanValue:MoneyReadout|null=null;
  private page=0;private collected=false;private openingId='';private landed=new Set<number>();
  private trayArt:Texture|null=null;private redrawTray:(()=>void)|null=null;private trayOffset={value:0};private trayTween:gsap.core.Tween|null=null;
  private trayWheelRemainder=0;private trayPan=new TrayPan();private trayPointer:number|null=null;private trayInterrupted=false;private trayFocusKey='';private suppressTrayClickUntil=0;private trayHost:HTMLElement;
  private specialFrames=new Set<SpecialCardFrame>();
  private tickSpecialFrames=(_time:number,delta:number)=>{if(document.hidden||this.state?.reduced)return;for(const frame of this.specialFrames)frame.update(Math.min(.05,delta/1000));if(this.specialFrames.size)this.stage.draw();};
  private trayPrices=new Map<number,Container>();private trayBadges=new Map<number,Container>();
  private trayStrip:Container|null=null;private collectingIndex:number|null=null;private trayNext:{light:Container;stride:number}|null=null;
  private packValueLabel:MoneyReadout|null=null;private revealCountLabel:Text|null=null;
  private thumbs=new Map<string,Texture>();private pending=new Map<string,Promise<Texture>>();private destroyed=false;
  constructor(private stage:OpeningStage,private onTargets:(hits:HitTarget[],summary:string)=>void){
    void preloadWinCelebration().catch(()=>{});
    BitmapFont.install({name:'LegendsMoney',style:{fontFamily:'Nunito',fontSize:64,fontWeight:'900',fill:0xffffff,stroke:{color:0x082e52,width:3}},chars:'0123456789$.,+- ',resolution:3,padding:3,skipKerning:true});
    const canvas=document.createElement('canvas');canvas.width=8;canvas.height=128;const ctx=canvas.getContext('2d')!;const gradient=ctx.createLinearGradient(0,0,0,128);gradient.addColorStop(0,'rgba(4,14,29,0)');gradient.addColorStop(1,'rgba(4,14,29,.65)');ctx.fillStyle=gradient;ctx.fillRect(0,0,8,128);this.tray=Texture.from(canvas);
    this.rewards=new RewardTransfers(this.creditReward,()=>stage.draw(),()=>this.state?.action('next'));stage.app.stage.addChildAt(this.rewards.background,stage.app.stage.getChildIndex(stage.world));stage.app.ticker.add(this.tickRewards);
    stage.app.stage.addChild(this.backdrop,this.root,stage.flightLayer,this.rewards.root);stage.onCardStored=this.storeCard;stage.onSpecialWin=this.awardCard;stage.onLayout=()=>{if(!this.updating)this.build();};
    stage.onBeforeCardTransfer=()=>this.rewards.beforeCardTransfer();stage.onCollectFocus=this.focusTray;stage.cardDestination=this.cardDestination;
    window.addEventListener('keydown',this.keydown);
    this.trayHost=stage.app.canvas.parentElement!;this.trayHost.addEventListener('pointerdown',this.trayDown,true);this.trayHost.addEventListener('pointermove',this.trayMove,true);this.trayHost.addEventListener('pointerup',this.trayUp,true);this.trayHost.addEventListener('pointercancel',this.trayCancel,true);this.trayHost.addEventListener('click',this.trayClick,true);this.trayHost.addEventListener('wheel',this.trayWheel,{capture:true,passive:false});

  }
  update(state:UIState){
    this.interludeEntry=!!state.autoRun?.interlude&&!this.state?.autoRun?.interlude;
    if((state.autoRun?.id??'')!==this.autoIdentity){this.autoIdentity=state.autoRun?.id??'';this.autoResultsPage=0;this.autoPack=null;}
    if(state.phase==='complete'&&this.state?.phase!=='complete'&&state.result&&!state.autoRun?.interlude&&(state.autoRun?.results.length??0)<=1&&!state.panel&&!state.inspected)this.resultLaunch={sources:[...state.result.cards.map((_,i)=>this.cardDestination(i)),...(state.result.bonus?[{x:this.stage.app.screen.width/2,y:this.stage.app.screen.height*.4,cardWidth:Math.min(220,this.stage.app.screen.width*.4)}]:[])],total:totalWinLayout(this.stage.app.screen.width,this.stage.app.screen.height)};
    if(this.state?.phase==='revealing'&&state.phase==='revealed')this.trayOffset.value=cardTrayLayout(this.stage.app.screen.width,this.stage.app.screen.height,state.index).offset;
    const id=state.save?.active?.id??'';if(id!==this.openingId){this.openingId=id;this.landed.clear();this.trayOffset.value=0;this.trayFocusKey='';this.trayWheelRemainder=0;this.trayPan.cancel();this.rewards.reset(id,state.save?.active?.cards.slice(0,state.index).map(c=>c.value)??[]);this.rewards.ledger.total+=state.save?.active?.bonus?.amount??0;this.moneyValues.delete('revealed');}
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
    for(const pulse of this.utilityPulses)pulse.alpha=s.reduced?.8:.5+.3*(1+Math.sin(this.stage.time*3))/2;
    for(const c of this.cardPulses){const wave=s.reduced?0:Math.sin(this.stage.time*2.2-c.phase);c.group.x=c.baseX+wave*.7;c.group.y=c.baseY-wave*1.2;c.group.rotation=c.rotation+wave*.018;c.shine.alpha=s.reduced?.55:.25+.6*(1+wave)/2;}
    for(const {glyph,base,phase,axis} of this.arrowPulses){const p=s.reduced?1:(1+Math.sin(this.stage.time*3.6-phase))*.5;glyph[axis]=base+p*2.6;glyph.alpha=.72+.28*p;}
    this.placeTrayLight();
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
  /** Display lettering: the battle font with an ink edge and a hard drop. Names and titles; never running text. */
  private display(value:string,x:number,y:number,size:number,fill=0xffffff,edge=0x1a5f93,parent=this.root,align:'left'|'center'|'right'='center'){
    const text=new Text({text:value,style:{fontFamily:'BattleDisplay, Nunito, Arial',fontSize:size,fontWeight:'400',fill,letterSpacing:.6,stroke:{color:0x061b32,width:size<15?Math.max(1.8,size*.16):Math.max(3,size*.19),join:'round'},dropShadow:{color:edge,alpha:1,blur:0,distance:size<15?1.2:Math.max(2,size*.12),angle:Math.PI/2}},resolution:Math.max(2,Math.min(3,devicePixelRatio))});
    text.anchor.set(align==='center'?.5:align==='right'?1:0,0);text.position.set(x,y);parent.addChild(text);return text;
  }
  /** Small captions: Nunito bold, spaced, with a thin ink edge. Legible over the painting without a backing shape. */
  private caption(text:Text,spacing=1.2,fill?:number){text.style.letterSpacing=spacing;text.style.stroke={color:0x0b2c49,width:2.6,join:'round'};if(fill!==undefined)text.style.fill=fill;return text;}
  private money(amount:number,x:number,y:number,size:number,color:number,align:'left'|'center'|'right',key:string,identity:string,plus=false,width=240,centerY=false){
    const state=moneyState(this.moneyValues.get(key),identity,amount,key==='wallet'||key==='lifetime'||key==='revealed');this.moneyValues.set(key,state);
    const bet=key==='revealed'||key==='reward'?this.state!.save?.active?.pack?.price??this.state!.selected.price:undefined;
    const label=new MoneyReadout(state,{size,color,align,width,plus,centerY,bet,hero:key==='reward'||key==='result',reduced:this.state!.reduced,ticks:key==='result'||key==='wallet'||key==='revealed',meter:key!=='reward'&&key!=='result',tone:['revealed','lifetime','history-pack-total','inspect-card','history-card-value'].includes(key)?'gold':'cool',tickSound:key==='revealed',draw:()=>this.stage.draw()});
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
    group.addChild(this.slab(new Graphics(),x,y,w,h,chosen?'blue':'deep',Math.min(10,h/4),undefined,!!options.primary));
    if(options.primary)group.addChild(drawBall(new Graphics(),x+25,y+h/2,Math.min(9,h*.22)));
    const fontSize=options.large?23:options.small?12:14;
    const textX=x+(options.primary?43:12),textW=w-(options.primary?55:24),caption=this.text(options.visibleLabel??label,textX+textW/2,y+(h-fontSize*1.3)/2,fontSize,chosen?C.white:C.muted,group,'center','bold');if(caption.width>textW)caption.scale.set(textW/caption.width);
    group.pivot.set(x+w/2,y+h/2);group.position.set(x+w/2,y+h/2);group.alpha=options.disabled?.38:1;
    const hit={id,label,x,y,width:w,height:h,disabled:!!options.disabled,selected:options.active,action};this.hits.push(hit);
    group.eventMode=options.disabled?'none':'static';group.cursor='pointer';group.on('pointertap',()=>{if(!options.disabled&&!this.transitioning)action();});
    return group;
  }
  /** The bonus ticket, in the same material as the other controls, with a live demo quote from the selected pack. */
  private bonusBuy(w:number,h:number,disabled:boolean){
    const s=this.state!,l=gameLayout(w,h),horizontal=l.portrait&&!l.compact;
    const auto=utilityLayout(w,h).auto,x=l.compact||horizontal?18:l.large?28:25,y=horizontal?auto.y+auto.height+2:l.compact?106:auto.y+auto.height+10;
    const width=horizontal?w-36:l.compact?190:220,height=horizontal?40:l.compact?72:78;
    const group=new Container(),g=new Graphics();
    group.position.set(x+width/2,y+height/2);group.pivot.set(width/2,height/2);group.addChild(g);this.root.addChild(group);this.paints.set('showdown',group);
    this.slab(g,0,0,width,height,'blue',horizontal?9:11,undefined,true);
    // The ball it throws: red over white with a dark band and latch, lit from the upper left.
    const cx=horizontal?25:33,cy=horizontal?height/2:l.compact?25:27,r=horizontal?13:l.compact?16:18,emblem=new Graphics();group.addChild(emblem);
    drawBall(emblem,cx,cy,r);
    const copyX=cx+r+10,price=s.selected.price*100;
    const quote=(size:number,room:number)=>{const readout=new MoneyReadout({identity:'bonus-buy',value:price,target:price,remaining:0},{size,meter:true,tone:'cool',color:0xffffff,align:'right',width:room,plus:false,hero:false,centerY:true,reduced:true,ticks:false,draw:()=>this.stage.draw()});group.addChild(readout);return readout;};
    if(horizontal){
      const title=this.display('BONUS BUY',copyX,3,16,0xffffff,0x0f3f73,group,'left');this.caption(this.text('LEGENDARY CAPTURE',copyX,24,8,0xdff2ff,group,'left','bold'),1.1);
      quote(17,Math.max(70,width-copyX-title.width-30)).position.set(width-14,height/2-6);
      this.caption(this.text('DEMO · 100×',width-14,height-15,8,0xdff2ff,group,'right','bold'),1);
    }else{
      this.display('BONUS BUY',copyX,l.compact?6:7,l.compact?18:20,0xffffff,0x0f3f73,group,'left');this.caption(this.text('LEGENDARY CAPTURE',copyX,l.compact?28:31,8.5,0xdff2ff,group,'left','bold'),1.1);
      // The quote sits in a recessed strip along the foot of the ticket.
      const stripH=22,stripY=height-stripH-6;g.roundRect(8,stripY,width-16,stripH,5).fill({color:0x08294a,alpha:.78}).stroke({color:0x8fd0f2,width:1,alpha:.35});
      this.caption(this.text('DEMO · 100×',15,stripY+stripH/2-6,8.5,0xdff2ff,group,'left','bold'),1);
      quote(16,width-112).position.set(width-15,stripY+stripH/2);
    }
    const action=()=>s.action('showdown');
    group.alpha=disabled?.42:1;group.eventMode=disabled?'none':'static';group.cursor='pointer';group.hitArea=new Rectangle(0,0,width,height);
    group.on('pointertap',()=>{if(!disabled&&!this.transitioning)action();});
    this.hits.push({id:'showdown',label:`Bonus Buy: Legendary capture preview. Demo price ${money(price)}, 100 times the selected pack price. No credits charged.`,x,y,width,height,disabled,action});
  }
  /** The game's button material: a chamfered slab with thickness and a cast shadow, a lit upper half, a bright rim and a bevel line. */
  private slab(g:Graphics,x:number,y:number,w:number,h:number,tone:'blue'|'deep'|'bright'='blue',cut=Math.min(10,h*.28),lip=Math.max(2,Math.min(4,h*.09)),accent=false){
    const shape=(dy:number)=>[x+cut,y+dy,x+w-cut,y+dy,x+w,y+cut+dy,x+w,y+h-cut+dy,x+w-cut,y+h+dy,x+cut,y+h+dy,x,y+h-cut+dy,x,y+cut+dy];
    const [face,under,rim]=({blue:[0x1d6db6,0x0f3f73,0xbfeaff],deep:[0x12456f,0x08294a,0x8fd0f2],bright:[0x2f93e0,0x175a9c,0xffffff]} as const)[tone];
    g.poly(shape(lip+2)).fill({color:0x031a30,alpha:.4}).poly(shape(lip)).fill(under).poly(shape(0)).fill(face)
      .poly([x+cut,y+1.5,x+w-cut,y+1.5,x+w-1.5,y+cut,x+w-1.5,y+h*.5,x+1.5,y+h*.5,x+1.5,y+cut]).fill({color:0xffffff,alpha:tone==='deep'?.08:.14})
      .poly(shape(0)).stroke({color:rim,width:1.5,alpha:.95}).moveTo(x+cut+2,y+2.4).lineTo(x+w-cut-2,y+2.4).stroke({color:0xffffff,width:1.1,alpha:.55,cap:'round'});
    // The red stripe sits inside the rim, along the cut corner.
    if(accent){const k=Math.max(4,Math.min(7,h*.16));g.poly([x+1.5,y+cut+k,x+1.5,y+cut+.6,x+cut+.6,y+1.5,x+cut+k,y+1.5]).fill(0xe5263f);}
    return g;
  }
  /** The HUD's one button shape: a rounded square with weight (drop), an inner light on its upper half, a rim and a bevel line. */
  private keycap(g:Graphics,cx:number,cy:number,size:number,body:number,rim:number,light=0x9fe3ff,lit=.22){
    const r=size/2,k=size*.3;
    return g.roundRect(cx-r,cy-r+3,size,size,k).fill({color:0x041a30,alpha:.42}).roundRect(cx-r,cy-r,size,size,k).fill({color:body,alpha:.97})
      .roundRect(cx-r+2.5,cy-r+2.5,size-5,size*.46,k*.82).fill({color:light,alpha:lit}).roundRect(cx-r,cy-r,size,size,k).stroke({color:rim,width:1.8})
      .moveTo(cx-r+k*.75,cy-r+1.7).lineTo(cx+r-k*.75,cy-r+1.7).stroke({color:0xffffff,width:1.2,alpha:.55,cap:'round'});
  }
  private utility(kind:'turbo'|'auto',label:string,r:{x:number;y:number;width:number;height:number},active:boolean,disabled:boolean,action:()=>void){
    const {x,y,width:w,height:h}=r,group=new Container(),g=new Graphics(),cx=w/2,cy=w/2;
    const accent=0xc9f4ff,ink=disabled?0x8ba9bf:0xf2fbff;
    group.position.set(x+cx,y+cy);group.pivot.set(cx,cy);group.addChild(g);this.root.addChild(group);this.paints.set(kind,group);
    this.keycap(g,cx,cy,w,active?0x1f86c9:disabled?0x1c466b:0x15548c,active?0xf2fbff:disabled?0x86a9c2:0xd8f7ff,active?0xdffaff:0x9fe3ff,active?.38:disabled?.1:.22);
    if(active){
      // All active decoration is inset: no corner badges or expanding halos.
      const pulse=new Graphics().roundRect(cx-w/2+2,cy-w/2+2,w-4,w-4,w*.3-2).stroke({color:0xffffff,width:1.4});group.addChild(pulse);this.utilityPulses.push(pulse);
      g.roundRect(1,w+3,w-2,14,5).fill(0x124a79).stroke({color:accent,width:1,alpha:.85});
    }
    const icon=new Graphics();icon.position.set(cx,active?w*.33:cy);icon.scale.set(w/44*(active?.65:1));group.addChild(icon);
    if(kind==='turbo')icon.poly([3,-14,-9,2,-1,2,-5,14,11,-4,3,-4]).fill(ink).stroke({color:0x063557,width:1.4,join:'round'});
    else if(active)icon.roundRect(-7,-7,14,14,2).fill(ink);
    else{icon.moveTo(9,-8).arc(0,0,12,-.72,Math.PI*1.12).stroke({color:ink,width:2.2,cap:'round'}).poly([-13,-7,-14,2,-5,-1]).fill(ink);icon.roundRect(-4,-6,8,12,1.5).stroke({color:ink,width:1.5}).moveTo(-2,-3).lineTo(2,-3).stroke({color:ink,width:1});}
    const text=this.text(kind==='turbo'?'TURBO':'AUTO',cx,w+5,w<40?7:w>50?10:8.5,disabled?0x9bb5c9:C.white,group,'center','bold');if(!active)this.caption(text,.5);
    if(active){
      const badgeY=w*.57,badgeW=w*.62,badgeH=w*.26;
      g.roundRect(cx-badgeW/2,badgeY,badgeW,badgeH,4).fill(0x082d45);
      const value=kind==='turbo'?'ON':String(Math.max(0,(this.state!.autoRun?.total??0)-(this.state!.autoRun?.completed??0)));
      const badge=this.text(value,cx,badgeY+badgeH/2,w<40?8:9,accent,group,'center','bold');badge.anchor.y=.5;
      if(badge.width>badgeW-4)badge.scale.set((badgeW-4)/badge.width);
    }
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
      for(const [i,base] of [-18,0,18].entries()){
        const card=new Container(),rotation=base*.013,plate=new Graphics(),shine=new Graphics();card.position.set(base,i===1?-6:2);card.rotation=rotation;icon.addChild(card);
        plate.roundRect(-18,-26,36,52,4).fill(0x062443).stroke({color:0x082e52,width:5}).roundRect(-18,-26,36,52,4).fill(i===1?0x207ac3:0x144c80).stroke({color:i===1?0xf2ffff:0x84cfe9,width:i===1?2.7:2});
        plate.roundRect(-13,-21,26,42,3).stroke({color:0x75dfff,width:1,alpha:.72});card.addChild(plate);this.ball(0,0,8,i===1?0xf5ffff:0xa9e4f4,card);
        shine.moveTo(-11,-20).lineTo(9,-20).stroke({color:0xffffff,width:3,alpha:.95}).moveTo(-14,-15).lineTo(-14,9).stroke({color:0x93ffff,width:2,alpha:.9});card.addChild(shine);
        this.cardPulses.push({group:card,baseX:base,baseY:card.y,rotation,phase:i*1.4,shine});
      }
      const flash=new Graphics().poly([0,-8,2,-2,8,0,2,2,0,8,-2,2,-8,0,-2,-2]).fill(0xf0ffff);flash.position.set(27,-28);icon.addChild(flash);
    }
    // Both commands carry the same opaque chip in the controls' material, so the stadium's scrolling board passes behind it and
    // never through the lettering.
    const fontSize=size>=110?17:size>=90?15:13,text=this.display((kind==='all'?'OPEN ALL':label).toUpperCase(),0,0,fontSize,0xffffff,0x0f3f73,group,'center');text.anchor.set(.5);
    {const pw=Math.max(text.width+26,size*.92),ph=Math.round(fontSize*1.95),py=r+5;group.addChildAt(this.slab(new Graphics(),-pw/2,py,pw,ph,kind==='next'?'bright':'blue',ph*.3,undefined,kind==='next'),group.getChildIndex(text));text.position.set(0,py+ph/2-1);}
    group.alpha=disabled?.42:1;
    this.hits.push({id,label,x:cx-r-4,y:cy-r-4,width:size+8,height:size+44,disabled,action});
    return group;
  }
  private openCommand(w:number,y:number,disabled:boolean,center=w/2,maxWidth=278){
    const s=this.state!,buying=['browse','reserving'].includes(s.phase),width=Math.min(maxWidth,w-44),height=56,x=center-width/2,group=new Container(),g=new Graphics();this.root.addChild(group);group.addChild(g);group.pivot.set(center,y+height/2);group.position.set(center,y+height/2);this.paints.set('primary',group);
    // The main action: a pointed slab with thickness and a cast shadow, a lit upper half and a bright rim.
    const tip=20,mid=y+height/2,shape=(inset:number,dy=0)=>[x+tip+inset,y+inset+dy,x+width-tip-inset,y+inset+dy,x+width-inset*1.3,mid+dy,x+width-tip-inset,y+height-inset+dy,x+tip+inset,y+height-inset+dy,x+inset*1.3,mid+dy];
    g.poly(shape(0,7)).fill({color:0x031a30,alpha:.42}).poly(shape(0,4)).fill(0x0b3a6c).poly(shape(0)).fill(0x1558a0).poly(shape(4)).fill(0x2a8be0)
      .poly([x+tip+4,y+4,x+width-tip-4,y+4,x+width-9,mid,x+9,mid]).fill({color:0xffffff,alpha:.16})
      .poly(shape(0)).stroke({color:0xd6f4ff,width:2}).moveTo(x+tip+6,y+7).lineTo(x+width-tip-6,y+7).stroke({color:0xffffff,width:1.4,alpha:.6,cap:'round'});
    const label=buying?'Buy pack':'Open',caption=this.display(label.toUpperCase(),0,0,26,0xffffff,0x0b3a6c,group,'left');caption.anchor.set(0,.5);
    group.addChild(drawBall(new Graphics(),x+tip+24,mid,12));
    if(buying&&width>=250){
      // The price rides on the button, so the cost of the press is on the thing pressed.
      const price=new MoneyReadout({identity:'buy-'+s.selected.id,value:s.selected.price,target:s.selected.price,remaining:0},{size:20,meter:true,tone:'cool',color:0xffffff,align:'right',width:104,plus:false,hero:false,centerY:true,reduced:true,ticks:false,draw:()=>this.stage.draw()});group.addChild(price);
      const left=x+tip+44,right=x+width-tip-8,rule=right-price.inkWidth-9,room=rule-left-9;if(caption.width>room)caption.scale.set(room/caption.width);
      caption.position.set(left,mid-1);price.position.set(right,mid-1);g.moveTo(rule,y+14).lineTo(rule,y+height-14).stroke({color:0xd6f4ff,width:1.2,alpha:.4});
    }else{
      const left=x+tip+44,right=x+width-tip-30,room=right-left;if(caption.width>room)caption.scale.set(room/caption.width);caption.position.set(left+(room-caption.width)/2,mid-1);
      g.poly([x+width-tip-20,mid-8,x+width-tip-11,mid,x+width-tip-20,mid+8]).stroke({color:0xffffff,width:3,cap:'round',join:'round'});
    }
    group.alpha=disabled?.4:1;this.hits.push({id:'primary',label,x,y,width,height,disabled,action:()=>s.action(s.phase==='sealed'?'tear':'open')});
  }
  setFocus(id:string|null){if(id?.startsWith('history-fan-'))this.focusHistoryCard(Number(id.slice(12)));this.focus.clear();const hit=this.hits.find(h=>h.id===id);if(hit)this.focus.roundRect(hit.x-this.modalOrigin.x-3,hit.y-this.modalOrigin.y-3,hit.width+6,hit.height+6,8).stroke({color:0xe3fcff,width:2});this.stage.draw();}
  async prepareAssets(packs:Pack[],progress:(value:number)=>void=()=>{}){
    const paths=[...new Set(['/assets/pokemon-logo.png',...packs.map(pack=>pack.packImage)])];let completed=0;
    await Promise.all([prepareAmountFont(),...paths.map(async path=>{await this.thumbnail(path);progress(++completed/paths.length);})]);
    if(this.state&&!this.destroyed)this.build();
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
    this.resultChrome=null;this.resultAmount=null;this.resultCount=null;this.resultCards=[];this.resultButtons=[];this.trayPan.cancel();this.trayPointer=null;
    ++this.generation;gsap.ticker.remove(this.tickSpecialFrames);this.specialFrames.clear();this.trayPrices.clear();this.trayBadges.clear();gsap.ticker.remove(this.tickHistoryFan);this.historyFanCards=[];this.historyFanTitle=this.historyFanRarity=null;this.historyFanValue=null;this.arrowPulses=[];this.cardPulses=[];this.utilityPulses=[];this.trayNext=null;this.rackGroup=null;this.rackMask=null;this.rackGlow=null;this.cardCaptions=[];this.trayStrip=null;this.packValueLabel=null;this.revealCountLabel=null;this.moneyAnimations.forEach(t=>t.kill());this.moneyAnimations=[];this.trayTween?.kill();this.redrawTray=null;this.trayArt?.destroy(true);this.trayArt=null;this.hits=[];this.feedbackTweens.forEach(t=>t.kill());this.feedbackTweens.clear();this.paints.clear();this.focus.clear();
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
  private emitTargets(){const s=this.state!;const {width,height}=this.stage.app.screen,bw=Math.min(166,width-60);const hits=this.autoCover?(s.autoRun?.running?[{id:'auto-transition-stop',label:'Stop Auto Spin',x:width/2-bw/2,y:height-58,width:bw,height:38,disabled:false,action:()=>s.action('auto-stop')}]:[]):this.hits.map(hit=>({...hit,disabled:hit.disabled||(this.transitioning&&hit.id!=='finish-win')}));this.onTargets(hits,s.inspected?`Viewing ${s.inspected.name}`:s.panel?`${s.panel} screen`:`${s.selected.name}. ${s.phase}. Balance ${money(s.save?.balance??10000)}. ${s.phase==='revealed'?s.save?.active?.cards[s.index]?.name??'':''}`);}
  private animateModal(kind:string,w:number,h:number){
    this.transitioning=true;this.root.alpha=0;this.backdrop.alpha=0;
    if(kind==='settings')this.root.x=Math.min(440,w)+24;else{this.root.scale.set(.985);this.root.position.set(this.modalOrigin.x+w*.0075,this.modalOrigin.y+h*.0075+14);}
    this.modalTween=gsap.timeline({onUpdate:()=>this.stage.draw(),onComplete:()=>{this.resultUnderlay?.destroy({texture:true,textureSource:true});this.resultUnderlay=null;this.transitioning=false;this.emitTargets();}})
      .to(this.backdrop,{alpha:1,duration:.2},0).to(this.root,{x:this.modalOrigin.x,y:this.modalOrigin.y,alpha:1,duration:kind==='settings'?.38:.3,ease:'power3.out'},0).to(this.root.scale,{x:1,y:1,duration:.3,ease:'power3.out'},0);
    if(this.resultUnderlay)this.modalTween.to(this.resultUnderlay,{alpha:0,duration:.3},0);
  }
  private finishResultCount(){
    const count=this.resultCount;
    if(!this.resultAmount||!count||count.value===count.target)return false;
    this.resultAmount.display(count.target);this.stage.draw();return true;
  }
  private dismissModal(action:'close'|'continue'='close'){
    if(this.finishResultCount())return;
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
    const g=this.keycap(new Graphics(),cx,cy,r*2,kind==='plus'?0xc2434f:0x15548c,kind==='plus'?0xffe6c4:0xd8f7ff,kind==='plus'?0xffc4b0:0x9fe3ff,kind==='plus'?.3:.22);group.addChild(g);
    const icon=new Graphics(),white=kind==='plus'?0xfff3d6:0xf2fbff,unit=size/48;group.addChild(icon);icon.position.set(cx,cy);icon.scale.set(unit);
    if(kind==='binder'){icon.roundRect(-11,-12,17,23,3).fill(0x337ec0).stroke({color:white,width:2}).roundRect(-5,-8,17,23,3).fill(0x194b7b).stroke({color:white,width:2}).circle(3.5,3,4).stroke({color:white,width:1.6}).moveTo(-.5,3).lineTo(7.5,3).stroke({color:white,width:1.4});}
    else if(kind==='gear'){const points:number[]=[];for(let i=0;i<32;i++){const radius=i%4<2?13:10,a=i*Math.PI/16;points.push(Math.cos(a)*radius,Math.sin(a)*radius);}icon.poly(points).fill(white).circle(0,0,5).fill(0x15548c);}
    else if(kind==='history')icon.circle(0,0,12).stroke({color:white,width:2}).moveTo(0,-7).lineTo(0,0).lineTo(6,4).stroke({color:white,width:2.4});
    else if(kind==='plus')icon.roundRect(-10,-2,20,4,2).fill(white).roundRect(-2,-10,4,20,2).fill(white);
    else {icon.poly([-12,-4,-6,-4,1,-10,1,10,-6,4,-12,4]).fill(white);if(kind==='sound'){for(const radius of [7,12])icon.moveTo(1+Math.cos(-.7)*radius,Math.sin(-.7)*radius).arc(1,0,radius,-.7,.7).stroke({color:white,width:2});}else icon.moveTo(6,-5).lineTo(13,5).moveTo(6,5).lineTo(13,-5).stroke({color:white,width:2});}
    if(kind==='binder'||kind==='history'){this.caption(this.text(kind==='binder'?'CARDS':'HISTORY',cx,y+size+5,size<40?7:size>50?10:8.5,C.white,group,'center','bold'),.5);}
    group.pivot.set(cx,cy);group.position.set(cx,cy);this.hits.push({id,label,x,y,width:size,height:size+(['binder','history'].includes(kind)?18:0),disabled:false,action});return group;
  }
  private hud(w:number,h:number){
    const s=this.state!,l=gameLayout(w,h,['awaiting','revealing','revealed','collecting','settling'].includes(s.phase));
    if(s.save&&!this.moneyValues.has('lifetime'))this.moneyValues.set('lifetime',moneyState(undefined,'lifetime',recordedWinnings(s.save),true));
    const tight=l.portrait||(l.short&&!l.sideControls),logoW=l.compact?compactToolbar(w).logoWidth:tight?116:l.large?196:148,logoH=l.compact?logoW*.38:tight?44:l.large?73:55,logoX=l.large?28:18;
    this.picture('/assets/pokemon-logo.png',logoX,l.large?12:10,logoW,logoH);this.caption(this.text('LEGENDS',logoX+logoW/2,l.compact?logoH+10:tight?50:l.large?80:59,l.large?10:8,0xffffff,this.root,'center','bold'),1.6);
    const credit=creditLayout(w,h);
    // Label and amount end together, right beside the + button, on the button's centre line.
    this.display('DEMO WALLET',credit.textRight,credit.labelY,credit.labelSize,0xdff2ff,0x1a5f93,this.root,'right');
    this.money(s.save?.balance??10000,credit.textRight,credit.amountY,credit.amountSize,0xffffff,'right','wallet','balance',false,credit.textWidth,true);
    this.iconButton('credits','Add 1000 free demo credits',credit.buttonX,credit.buttonY,credit.buttonSize,'plus',()=>s.action('credits'));
    const side=l.portrait?18:25,utilities=utilityLayout(w,h,['awaiting','revealing','revealed','collecting','settling'].includes(s.phase));
    for(const [id,label,kind,action] of [['binder','My collection','binder','collection'],['history','Opening history','history','history'],['settings','Settings','gear','settings'],['sound',s.sound?'Mute sound':'Enable sound',s.sound?'sound':'mute','sound']] as const){
      const r=utilities[id];this.iconButton(id,label,r.x,r.y,r.width,kind,()=>s.action(action));
    }
    this.utility('turbo',`Turbo Mode: ${s.turbo?'on':'off'}`,utilities.turbo,!!s.turbo,false,()=>s.action('turbo'));
    this.utility('auto',s.autoRun?.running?`Auto Spin active: ${Math.max(0,s.autoRun.total-s.autoRun.completed)} packs remaining. Stop Auto Spin`:'Auto Spin',utilities.auto,!!s.autoRun?.running,!s.autoRun?.running&&!!s.save?.active,()=>s.action(s.autoRun?.running?'auto-stop':'auto'));
    const edgeTitle=l.compact||(l.short&&l.sideControls),bonusTitleOffset=s.phase==='browse'&&!s.save?.active&&l.portrait&&!l.compact?8:0,captionY=(l.compact?65:!l.sideControls&&l.short?166:edgeTitle?125:l.sideControls?28:182)+bonusTitleOffset;
    const captionWidth=edgeTitle?Math.max(85,l.sideControls?(w-l.stageWidth)/2-28:w/2-156*l.scale-side-12):l.sideControls?w-510:w-112;
    const packTitle=this.display(s.save?.active?.pack?.name??s.selected.name,edgeTitle?side:w/2,captionY-(edgeTitle?3:l.sideControls?4:l.short?14:9),edgeTitle?16:l.sideControls?26:22,0xffffff,0x1a5f93,this.root,edgeTitle?'left':'center');packTitle.visible=!['awaiting','revealing','revealed','collecting','settling'].includes(s.phase);if(packTitle.width>captionWidth)packTitle.scale.set(captionWidth/packTitle.width);
    if(s.save?.active){
      const grouped=s.phase==='collecting'&&(s.groupRevealCount??0)>0,countY=l.compact?65:!l.sideControls?captionY+3:128;
      const y=grouped?Math.min(countY,packRevealLayout(w,h,s.groupRevealCount!).top-19):countY;
      // One progress readout at a time: the stadium board and the numbered slots already count single reveals.
      this.revealCountLabel=grouped?this.caption(this.text(`${s.groupRevealCount} CARDS`,w-side,y,10,0xfff3d6,this.root,'right','bold'),1):null;
    }
  }
  private playControls(w:number,h:number){
    const s=this.state!,l=gameLayout(w,h,['awaiting','revealing','revealed','collecting','settling'].includes(s.phase)),busy=!!s.autoRun?.running||['reserving','tearing','revealing','collecting','settling'].includes(s.phase);
    // The stadium board keeps its lettering clear of the reveal controls while they are up.
    {const c=revealControlsLayout(w,h),showing=!!s.save?.active&&['awaiting','revealing','revealed'].includes(s.phase);this.stage.scene.setBoardKeepOut(showing?[c.all.x-c.all.size/2-10,c.next.x+c.next.size/2+10]:null);}
    if(s.phase==='browse'&&!s.save?.active){
      this.bonusBuy(w,h,busy||!s.ready);
    }
    if(s.save?.active&&['awaiting','revealing','revealed','collecting','settling'].includes(s.phase)){
      const win=totalWinLayout(w,h);
      const caption=this.display('TOTAL WIN',win.x,win.labelY,win.labelSize,0xfff2cf,0xa86a16,this.root,'center');
      this.packValueLabel=this.money(this.rewards.ledger.total,win.x,win.y,win.size,0xfff2cf,'center','revealed',s.save.active.id,false,win.width-24,true);this.root.addChild(caption);
    }

    if(s.phase==='revealed'){
      const card=s.save!.active!.cards[s.index],captionW=l.compact?Math.min(288,w-creditLayout(w,h).width-164):l.sideControls?Math.min(420,l.stageWidth*.8):Math.min(340,w-40);
      // One card label, anchored to its stage: the name under the stone's value with its line of small print below it.
      // In short landscape there is no room under the stone, so the name and the small print sit either side of the value.
      const stone=rewardLayout(w,h),beside=stone.width*.75+10,captionY=l.compact?stone.y:l.stageFront+1,captionH=l.compact?44:l.sideControls?50:46;
      const captionX=(w-captionW)/2,group=new Container(),rare=isSpecialCard(card);
      group.position.set(w/2,captionY);this.root.addChild(group);
      // Both lines scale with the screen, but never past the room between the stage's front edge and the tray.
      const below=cardTrayLayout(w,h,0).y-(l.stageFront+1)-6,titleSize=l.compact?15:Math.max(15,Math.min(30,w*.035,below/2.4)),smallSize=l.compact?8:Math.max(8,Math.min(13,w*.016,titleSize*.46)),title=this.display(card.name,l.compact?-beside:0,l.compact?0:titleSize*.9,titleSize,0xffffff,rare?0xb9761a:0x1a5f93,group);title.anchor.set(l.compact?1:.5,.5);
      const room=l.compact?Math.max(60,captionW/2-beside):captionW-24;if(title.width>room)title.scale.set(room/title.width);
      const rarity=this.caption(this.text(`${card.rarity.toUpperCase()} · #${card.number||'ENERGY'}`,l.compact?beside:0,l.compact?1:titleSize*1.62+smallSize*.9,smallSize,rare?0xffe9ad:0xe9f7ff,group,'center','bold'));rarity.anchor.set(l.compact?0:.5,.5);
      if(rarity.width>room)rarity.scale.set(room/rarity.width);
      const tag=new Container();group.addChildAt(tag,0);tag.addChild(rarity);
      this.cardCaptions.push(group);
      const captionKey=`${s.save!.active!.id}:${s.index}`;
      // The name is stamped as the card's flip lands; its tag slides out from under it a beat later.
      if(captionKey!==this.cardCaptionKey&&!s.reduced){const sx=title.scale.x,draw=()=>this.stage.draw();
        this.moneyAnimations.push(gsap.fromTo(title.scale,{x:sx*1.5,y:sx*1.5},{x:sx,y:sx,duration:.3,ease:'back.out(2.6)',onUpdate:draw}),gsap.fromTo(title,{alpha:0,rotation:-.05},{alpha:1,rotation:0,duration:.14,ease:'power2.out'}),
          gsap.fromTo(tag,l.compact?{x:-14,alpha:0}:{y:-10,alpha:0},{x:0,y:0,alpha:1,duration:.26,delay:.12,ease:'back.out(1.8)',onUpdate:draw}));}
      this.cardCaptionKey=captionKey;
      this.hit('inspect',`Inspect ${card.name}`,captionX,l.compact?captionY-22:captionY,captionW,Math.max(44,captionH),()=>s.inspect(card));
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
      const viewport=new Container(),strip=new Container();this.trayStrip=strip;strip.y=tray.y;viewport.addChild(strip);this.root.addChild(viewport);const mask=new Graphics().rect(tray.viewportX-2,tray.y-34,tray.viewportWidth+4,tray.slotHeight+TRAY_PAD+40).fill(0xffffff);this.root.addChild(mask);viewport.mask=mask;
      const base=tray.start+tray.offset,focusKey=`${this.openingId}:${s.index}`,changed=focusKey!==this.trayFocusKey;this.trayFocusKey=focusKey;
      this.trayPan.configure(tray.maxOffset,this.trayOffset.value);this.trayOffset.value=this.trayPan.offset;strip.x=base-this.trayOffset.value;
      if(changed&&s.phase==='revealing'&&!s.reduced)this.scrollTrayTo(tray.offset,.38,false);
      else if(changed){this.trayOffset.value=tray.offset;this.trayPan.configure(tray.maxOffset,tray.offset);strip.x=base-tray.offset;}
      s.save.active.cards.forEach((card,i)=>{
        const x=i*tray.stride,slot=new Container();slot.position.set(x,0);strip.addChild(slot);
        const price=new Container(),pw=tray.cardWidth,ph=tray.priceHeight,rare=isSpecialCard(card),color=rare?0xffe59a:0xffffff;
        price.position.set(pw/2,tray.priceY+ph/2);price.visible=this.landed.has(i);slot.addChild(price);this.trayPrices.set(i,price);
        if(s.save!.active!.showdownSymbols?.includes(i)){const badge=createShowdownBadge();if(badge){badge.scale.set(pw/180);badge.position.set(pw/2,tray.cardHeight-12*pw/180-2);badge.visible=this.landed.has(i);slot.addChild(badge);this.trayBadges.set(i,badge);}}
        price.addChild(new MoneyReadout({identity:this.openingId,value:card.value,target:card.value,remaining:0},{size:l.compact?14:l.short?16:l.large?25:19,meter:true,tone:rare?'gold':'cool',color,align:'center',width:pw-8,plus:false,hero:false,centerY:true,reduced:true,ticks:false,draw:()=>this.stage.draw()}));
      });
      // One native canvas atlas keeps the static rack independent of animated
      // mesh buffers, with a single texture update for each landed card.
      const resolution=Math.min(2,this.stage.app.renderer.resolution),art=document.createElement('canvas'),artWidth=(s.save.active.cards.length-1)*tray.stride+tray.cardWidth;
      art.width=Math.ceil((artWidth+TRAY_PAD*2)*resolution);art.height=Math.ceil((tray.slotHeight+TRAY_PAD*2)*resolution);
      const context=art.getContext('2d')!,texture=Texture.from(art),sprite=new Sprite(texture);this.trayArt=texture;sprite.position.set(-TRAY_PAD);sprite.width=artWidth+TRAY_PAD*2;sprite.height=tray.slotHeight+TRAY_PAD*2;strip.addChildAt(sprite,0);
      const generation=this.generation,cards=s.save.active.cards;
      // The slot that will take the card now on the stage is the lit one; once that card is seated the light moves on with the next reveal.
      const redraw=()=>{if(this.destroyed||generation!==this.generation)return;context.setTransform(resolution,0,0,resolution,TRAY_PAD*resolution,TRAY_PAD*resolution);context.clearRect(-TRAY_PAD,-TRAY_PAD,artWidth+TRAY_PAD*2,tray.slotHeight+TRAY_PAD*2);cards.forEach((card,i)=>{
        const x=i*tray.stride,image=this.landed.has(i)?this.thumbs.get(card.image):null;
        context.save();context.translate(x,0);drawTraySlot(context,tray,{index:i,next:i===this.waitingSlot(),special:isSpecialCard(card),image:image?{source:image.source.resource as CanvasImageSource,width:image.width,height:image.height}:null});context.restore();
      });texture.source.update();this.stage.draw();};
      this.redrawTray=redraw;redraw();
      new Set(cards.map(card=>card.image)).forEach(path=>{void this.thumbnail(path).then(redraw).catch(()=>{});});
      this.syncTrayHits();
      // The waiting slot breathes: light spills onto its top edge from the stage above and pools in the well.
      {const light=new Container(),spill=new Sprite(trayShaftTexture()),pool=new Graphics().roundRect(0,0,tray.cardWidth,tray.cardHeight,6).fill({color:0x9fe6ff,alpha:.2}).stroke({color:0xe9fdff,width:1.6,alpha:.75});
        spill.anchor.set(.5,1);spill.width=tray.cardWidth*.96;spill.height=Math.min(30,tray.cardHeight*.3);spill.position.set(tray.cardWidth/2,1);pool.blendMode='add';light.eventMode='none';light.addChild(spill,pool);strip.addChildAt(light,1);
        this.trayNext={light,stride:tray.stride};this.placeTrayLight();}
      if(tray.maxOffset>0){for(const direction of [-1,1]){const cx=direction<0?11:w-11,cy=tray.y+tray.cardHeight/2,g=new Graphics();
        g.roundRect(cx-9,cy-22,18,44,9).fill({color:0x0a3a63,alpha:.38}).stroke({color:0xbdf3ff,width:1,alpha:.5});
        g.moveTo(cx-direction*3,cy-8).lineTo(cx+direction*3,cy).lineTo(cx-direction*3,cy+8).stroke({color:0xdffaff,width:2.4,alpha:.95,cap:'round',join:'round'});this.root.addChild(g);this.hit(direction<0?'tray-prev':'tray-next',direction<0?'Scroll cards left':'Scroll cards right',cx-10,cy-23,20,46,()=>this.scrollTrayTo(this.trayOffset.value+direction*tray.stride*2),!['awaiting','revealed'].includes(s.phase));}}
      return;
    }
    const grid=packGridLayout(w,h,s.packs.length);
    s.packs.forEach((pack,i)=>{
      const slot=grid.slot(i),{x,y,width:tw,height:th}=slot,selected=pack.id===s.selected.id,group=new Container();
      group.position.set(x+tw/2,y+th/2);group.pivot.set(tw/2,th/2);this.root.addChild(group);this.paints.set(`pack-${pack.id}`,group);
      const tile=packTileLayout(tw,th),base=tile.artHeight+1,affordable=(s.save?.balance??0)>=pack.price,disabled=!!s.autoRun?.running||!!s.save?.active;
      // Each set stands on the floor with its own contact shadow. The chosen one is lifted, a little larger, and lit by a bar of light at its foot.
      const artW=tw*(selected?.82:.74),artH=tile.artHeight*(selected?1:.92),artY=selected?-3:tile.artHeight-artH;
      group.addChild(new Graphics().ellipse(tw/2,base,artW*.5,3.2).fill({color:0x031326,alpha:selected?.3:.4}));
      if(selected){const bar=new Graphics().roundRect(tw/2-artW*.56,base+2,artW*1.12,3.5,1.75).fill({color:0xd9fbff,alpha:.95}).roundRect(tw/2-artW*.4,base+5.5,artW*.8,2,1).fill({color:0x7fe3ff,alpha:.5});group.addChild(bar);if(!s.reduced&&!disabled)this.moneyAnimations.push(gsap.to(bar,{alpha:.5,duration:1.1,repeat:-1,yoyo:true,ease:'sine.inOut'}));}
      const art=new Container();group.addChild(art);this.picture(pack.packImage,(tw-artW)/2,artY,artW,artH,art);art.alpha=affordable||disabled?1:.55;
      // Names are display lettering in white, fitted to the tile by rule; the chosen set's is brighter and larger, not another colour.
      const title=this.display(pack.name,tw/2,tile.nameY+tile.nameHeight/2,tile.fontSize+(tw<85?3:5),selected?0xffffff:0xd9ecff,selected?0x1f7fd0:0x15507f,group);title.anchor.set(.5);if(title.width>tw-2)title.scale.set((tw-2)/title.width);
      // Price tag: a small slab in the controls' material, cut to the price. The digits sit in its middle; red when the wallet cannot cover it.
      const size=Math.min(tw<85?14:tw<120?17:20,tile.priceHeight/1.42),price=new MoneyReadout({identity:pack.id,value:pack.price,target:pack.price,remaining:0},{size,meter:true,tone:'cool',color:affordable||disabled?0xffffff:0xffb4b4,align:'center',width:tw-size*1.3,plus:false,hero:false,centerY:true,reduced:true,ticks:false,draw:()=>this.stage.draw()});
      const bh=Math.min(tile.priceHeight-3,Math.round(size*1.42)),bw=Math.min(tw-2,price.inkWidth+size*1.15),by=tile.priceY+(tile.priceHeight-3-bh)/2,bx=(tw-bw)/2;
      group.addChild(this.slab(new Graphics(),bx,by,bw,bh,selected?'bright':'deep',bh*.26,2,selected));
      // The hard drop under the digits is part of them: lift the amount by half of it so the whole figure is centred in the tag.
      price.position.set(tw/2,by+bh/2-size*.05);group.addChild(price);
      // A pack already bought leaves the rest of the shelf in shade rather than faded out.
      if(disabled){group.tint=selected?0xdfeaf5:0x7f9cc4;group.alpha=selected?1:.9;}
      this.hits.push({id:`pack-${pack.id}`,label:`${pack.name}, ${money(pack.price)}`,x,y,width:tw,height:th,disabled,action:()=>s.select(pack),selected});
      if(selected&&this.lastPackId!==pack.id&&!s.reduced)this.moneyAnimations.push(gsap.from(group.scale,{x:.92,y:.92,duration:.3,ease:'back.out(1.7)'}));
    });
    this.lastPackId=s.selected.id;
  }

  /** The slot that is waiting for a card: the lowest revealed one not yet seated, so the light stays on a slot until its card
   * has landed and only then moves on. */
  private waitingSlot(){
    const s=this.state;if(!s?.save?.active||!['awaiting','revealing','revealed'].includes(s.phase))return -1;
    for(let i=0;i<=s.index;i++)if(!this.landed.has(i))return i;return -1;
  }
  private placeTrayLight(){
    const next=this.trayNext;if(!next||next.light.destroyed)return;const index=this.waitingSlot();
    next.light.visible=index>=0;next.light.x=index*next.stride;next.light.alpha=this.state?.reduced?.75:.62+.38*Math.sin(this.stage.time*2.8);
  }
  private trayLayout(){return cardTrayLayout(this.stage.app.screen.width,this.stage.app.screen.height,this.collectingIndex??this.state?.index??0);}
  private trayPoint(event:PointerEvent|WheelEvent){const b=this.trayHost.getBoundingClientRect();return {x:(event.clientX-b.left)*this.stage.app.screen.width/b.width,y:(event.clientY-b.top)*this.stage.app.screen.height/b.height};}
  private overTray(event:PointerEvent|WheelEvent){const s=this.state;if(!s||s.panel||s.inspected||!['awaiting','revealed'].includes(s.phase))return false;const t=this.trayLayout(),p=this.trayPoint(event);return t.maxOffset>0&&p.y>=t.y-6&&p.y<=t.y+t.slotHeight+8&&p.x>=0&&p.x<=this.stage.app.screen.width;}
  private trayDown=(e:PointerEvent)=>{if(!this.overTray(e)||e.button>0)return;this.trayWheelRemainder=0;this.trayInterrupted=!!this.trayTween?.isActive();this.trayTween?.kill();this.trayPointer=e.pointerId;this.trayPan.configure(this.trayLayout().maxOffset,this.trayOffset.value);this.trayPan.start(this.trayPoint(e).x,e.timeStamp);};
  private trayMove=(e:PointerEvent)=>{if(e.pointerId!==this.trayPointer)return;const was=this.trayPan.dragged;this.trayPan.move(this.trayPoint(e).x,e.timeStamp);if(!this.trayPan.dragged)return;e.preventDefault();e.stopPropagation();if(!was){this.trayHost.setPointerCapture(e.pointerId);this.syncTrayHits(false);this.emitTargets();}this.trayOffset.value=this.trayPan.offset;this.positionTray();};
  private trayUp=(e:PointerEvent)=>{if(e.pointerId!==this.trayPointer)return;this.trayPointer=null;if(this.trayPan.dragged){e.preventDefault();e.stopPropagation();this.suppressTrayClickUntil=performance.now()+400;if(this.trayHost.hasPointerCapture(e.pointerId))this.trayHost.releasePointerCapture(e.pointerId);this.scrollTrayTo(this.trayPan.end(),.34);}else{this.trayPan.cancel();if(this.trayInterrupted){this.syncTrayHits();this.emitTargets();}}this.trayInterrupted=false;};
  private trayCancel=()=>{this.trayPointer=null;this.trayPan.cancel();this.syncTrayHits();this.emitTargets();};
  private trayClick=(e:MouseEvent)=>{if(performance.now()<this.suppressTrayClickUntil){e.preventDefault();e.stopImmediatePropagation();}};
  private trayWheel=(e:WheelEvent)=>{if(!this.overTray(e))return;e.preventDefault();e.stopPropagation();const delta=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;const stride=this.trayLayout().stride;this.trayWheelRemainder+=delta*(e.deltaMode===1?16:1);const steps=Math.trunc(this.trayWheelRemainder/stride);if(steps){this.trayWheelRemainder-=steps*stride;this.scrollTrayTo(this.trayPan.offset+steps*stride,.16);}};
  private positionTray(){if(this.trayStrip){const t=this.trayLayout();this.trayStrip.x=t.start+t.offset-this.trayOffset.value;this.stage.draw();}}
  private scrollTrayTo(value:number,duration=.3,emit=true){
    this.trayTween?.kill();const t=this.trayLayout(),target=Math.max(0,Math.min(t.maxOffset,Math.round(value/t.stride)*t.stride));this.trayPan.configure(t.maxOffset,target);this.syncTrayHits(false);if(emit)this.emitTargets();
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
    const fresh=!this.landed.has(index);this.landed.add(index);this.redrawTray?.();const mark=this.trayBadges.get(index);if(mark&&!mark.destroyed)mark.visible=true;if(fresh&&!this.state?.reduced)this.seatCard(index);
    // The value is stamped into the slot's tab once the card has seated.
    const price=this.trayPrices.get(index);if(price){price.visible=true;if(fresh&&!this.state?.reduced){this.moneyAnimations.push(gsap.fromTo(price,{alpha:0},{alpha:1,duration:.08,delay:.1}),gsap.fromTo(price.scale,{x:1.7,y:1.7},{x:1,y:1,duration:.3,delay:.1,ease:'back.out(2.4)',onUpdate:()=>this.stage.draw()}));}}
    this.syncTrayHits();this.emitTargets();
    if(this.state?.phase==='collecting'){
      const card=this.state.save!.active!.cards[index];this.rewards.deposit(index,card.value);
      if(this.revealCountLabel)this.revealCountLabel.text=`${this.landed.size} / 11`;
    }
    this.stage.draw();
  };
  /** The card lands in its well: a little large and high, it sinks past its seat and comes back up into it while the rim takes the hit. */
  private seatCard(index:number){
    const strip=this.trayStrip,card=this.state?.save?.active?.cards[index];if(!strip||strip.destroyed||!card)return;
    const t=this.trayLayout(),x=index*t.stride+t.cardWidth/2,y=t.cardHeight/2,thumb=this.thumbs.get(card.image),draw=()=>this.stage.draw(),light=isSpecialCard(card)?0xffe59a:0xbdf3ff;
    const rim=new Graphics().roundRect(-t.cardWidth/2,-t.cardHeight/2,t.cardWidth,t.cardHeight,6).fill({color:light,alpha:.26}).stroke({color:0xffffff,width:2.4});
    rim.position.set(x,y);rim.blendMode='add';rim.eventMode='none';strip.addChild(rim);this.moneyAnimations.push(gsap.to(rim,{alpha:0,duration:.44,ease:'power2.out',onUpdate:draw,onComplete:()=>{if(!rim.destroyed)rim.destroy();}}));
    if(!thumb)return;
    const seat=new Sprite(thumb);seat.anchor.set(.5);seat.eventMode='none';seat.width=t.cardWidth-3;seat.height=t.cardHeight-3;const sx=seat.scale.x,sy=seat.scale.y;seat.position.set(x,y);strip.addChildAt(seat,strip.getChildIndex(rim));
    this.moneyAnimations.push(gsap.timeline({onUpdate:draw,onComplete:()=>{if(!seat.destroyed)seat.destroy();}})
      .fromTo(seat.scale,{x:sx*1.1,y:sy*1.1},{x:sx*.962,y:sy*.962,duration:.1,ease:'power2.in'},0).to(seat.scale,{x:sx,y:sy,duration:.22,ease:'back.out(3)'},.1)
      .fromTo(seat,{y:y-6},{y:y+1.5,duration:.1,ease:'power2.in'},0).to(seat,{y,duration:.22,ease:'back.out(3)'},.1));
  }
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
  private libraryShell(title:string,subtitle:string,w:number,h:number,kind:'binder'|'history'|'spark',footer=true){
    const g=new Graphics();this.root.addChild(g);drawPanel(g,8,8,w-16,h-16,{head:72,foot:footer?66:undefined});
    // The section's emblem is one of the HUD's own keys.
    this.keycap(g,48,45,40,0x15548c,0xd8f7ff);const icon=new Graphics(),white=0xf2fbff;icon.position.set(48,45);this.root.addChild(icon);
    if(kind==='binder')icon.roundRect(-9,-10,14,19,3).fill(0x337ec0).stroke({color:white,width:1.8}).roundRect(-4,-7,14,19,3).fill(0x194b7b).stroke({color:white,width:1.8});
    else if(kind==='history')icon.circle(0,0,10).stroke({color:white,width:1.8}).moveTo(0,-6).lineTo(0,0).lineTo(5,3).stroke({color:white,width:2.2,cap:'round'});
    // Cheats: a four-point star with a smaller one beside it.
    else{const star=(cx:number,cy:number,r:number)=>{const points:number[]=[];for(let k=0;k<8;k++){const radius=k%2?r*.34:r,a=k*Math.PI/4-Math.PI/2;points.push(cx+Math.cos(a)*radius,cy+Math.sin(a)*radius);}return points;};icon.poly(star(-2,1,10)).fill(white).poly(star(8,-8,4.5)).fill(0xd8405a).stroke({color:white,width:1});}
    const nested=!!this.state!.inspected||!!this.historyOpening,buttonW=nested?88:40,titleW=w-116-buttonW;
    const titleText=this.display(title,78,w<500?22:19,w<500?22:27,0xffffff,0x0f3f73,this.root,'left');if(titleText.width>titleW)titleText.scale.set(titleW/titleText.width);
    const sub=this.caption(this.text(subtitle.toUpperCase(),79,55,9.5,0xcfeaff,this.root,'left','bold'),1.2);if(sub.width>titleW)sub.scale.set(titleW/sub.width);
    this.button('close',this.state!.inspected?'Back to cards':this.historyOpening?'Back to history':'Return to game',w-26-buttonW,25,buttonW,40,()=>this.dismissModal(),{visibleLabel:nested?'‹ BACK':'×',small:nested,large:!nested});
  }
  private libraryTab(id:string,label:string,x:number,y:number,width:number,active:boolean,action:()=>void){
    this.root.addChild(this.slab(new Graphics(),x,y,width,34,active?'blue':'deep',9,2,active));
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
      const g=drawPlate(new Graphics(),0,0,r.width,r.height,8,!!count);if(!count)g.alpha=.55;group.addChild(g);
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
    const top=h<500?90:99,statsH=h<500?46:58,stats=drawPlate(new Graphics(),l.pad,top,l.width,statsH,10,true);this.root.addChild(stats);
    this.caption(this.text('TOTAL WON',l.pad+14,top+6,9,0xfff2cf,this.root,'left','bold'),1.2);this.money(s.save?recordedWinnings(s.save):0,l.pad+14,top+(h<500?29:36),h<500?20:26,0xfff2bb,'left','lifetime','lifetime',false,l.width*.58,true);
    const best=Math.max(0,...history.map(r=>r.total));this.caption(this.text('BEST PACK',w-l.pad-14,top+6,9,0xcfeaff,this.root,'right','bold'),1.2);this.money(best,w-l.pad-14,top+(h<500?29:36),h<500?17:21,C.white,'right','history-best','best',false,l.width*.34,true);
    if(!history.length){this.ball(w/2,h/2-20,28,0x46768f);this.text('No packs opened yet',w/2,h/2+24,17,C.white,this.root,'center','bold');}
    history.slice(pg.start,pg.end).forEach((result,i)=>{
      const x=l.pad,y=l.top+i*(l.rowHeight+l.gap),wRow=l.width,hRow=l.rowHeight,group=new Container();group.position.set(x,y);this.root.addChild(group);
      this.hit(`history-pack-${result.id}`,`View all cards from ${result.pack?.name??'Obsidian Flames'}`,x,y,wRow,hRow,()=>this.openHistoryHand(result));
      const g=drawPlate(new Graphics(),0,0,wRow,hRow,12);g.moveTo(2,18).lineTo(2,hRow-18).stroke({color:i===0?0xadebfc:0x3f7d9b,width:3});group.addChild(g);
      const packW=hRow<90?35:42;this.picture(result.pack?.packImage??s.packs[0].packImage,14,8,packW,hRow-16,group);
      const textX=packW+29,title=this.text(result.pack?.name??'Obsidian Flames',textX,12,w<500?13:16,C.white,group,'left','bold'),titleW=w<500?wRow-textX-12:wRow-textX-210;if(title.width>titleW)title.scale.set(titleW/title.width);
      const date=new Date(result.at);this.text(date.toLocaleDateString(undefined,{month:'short',day:'numeric'})+' · '+date.toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit'}),textX,hRow<90?34:38,9,C.muted,group);
      this.text(`${result.cards.length} CARDS${result.bonus?' + BONUS':''}`,textX,hRow-22,9,result.bonus?0xffdf7a:0x85bdce,group,'left','bold');
      const amount=this.money(result.total,x+wRow-14,y+hRow-30,w<500?24:29,0xe4ffff,'right',`history-${result.id}`,result.id,false,w<500?wRow*.52:180,true);group.addChild(amount);amount.position.set(wRow-14,hRow-23);
      if(w>=600){const tiles=packTiles(result),bestCards=[...tiles].sort((a,b)=>b.value-a.value).slice(0,3);bestCards.forEach((card,j)=>{const cx=wRow-300+j*29;const thumbH=Math.min(63,hRow-24);this.picture(card.image,cx,12,thumbH/1.4,thumbH,group,true,0,card);this.hit(`history-card-${result.id}-${j}`,`View pack with ${card.name}`,x+cx,y+12,29,thumbH,()=>this.openHistoryHand(result,tiles.indexOf(card)));});}
      if(!s.reduced)this.moneyAnimations.push(gsap.from(group,{alpha:0,x:x+18,duration:.28,delay:i*.045,ease:'power3.out',onUpdate:()=>this.stage.draw()}));
    });
    this.libraryPager(w,h,pg.page,pg.pages,'history');
  }
  private openHistoryHand(result:Result,index?:number){this.historyOpening=result;{const tiles=packTiles(result);this.historySelection=index??tiles.reduce((best,c,i)=>c.value>tiles[best].value?i:best,0);}this.build();playSound('flip',{gain:.35});}
  private focusHistoryCard(index:number){if(!this.historyOpening||index===this.historySelection)return;this.historySelection=index;const {width,height}=modalLayout(this.stage.app.screen.width,this.stage.app.screen.height,'history-pack'),l=historyFanLayout(width,height,packTiles(this.historyOpening).length);this.historyFanCards.forEach((c,i)=>{const p=l.pose(i,i===index);Object.assign(c,p);c.group.zIndex=i===index?100:i;});this.updateHistoryDetails();if(this.state?.reduced){this.animateHistoryFan(0);this.stage.draw();}}
  private updateHistoryDetails(){const c=this.historyOpening?packTiles(this.historyOpening)[this.historySelection]:undefined;if(!c)return;const width=modalLayout(this.stage.app.screen.width,this.stage.app.screen.height,'history-pack').width,max=Math.min(470,width-86-(width<600?112:190));if(this.historyFanTitle){this.historyFanTitle.text=c.name;this.historyFanTitle.scale.set(1);if(this.historyFanTitle.width>max)this.historyFanTitle.scale.set(max/this.historyFanTitle.width);}if(this.historyFanRarity){this.historyFanRarity.text=`${c.rarity} · #${c.number||'Energy'}`;this.historyFanRarity.scale.set(1);if(this.historyFanRarity.width>max)this.historyFanRarity.scale.set(max/this.historyFanRarity.width);}this.historyFanValue?.retarget(c.value);this.historyFanValue?.display(c.value);}
  private animateHistoryFan(dt:number){if(!this.historyOpening||this.state?.inspected||this.transitioning)return;const blend=this.state?.reduced?1:Math.min(1,dt*13);this.historyFanCards.forEach((c,i)=>{if(!c.ready)return;const bob=this.state?.reduced?0:Math.sin(this.historyFanTime*.9+i*.37)*2;const g=c.group;g.x+=(c.x-g.x)*blend;g.y+=(c.y+bob-g.y)*blend;g.rotation+=(c.rotation-g.rotation)*blend;g.scale.set(g.scale.x+(c.scale-g.scale.x)*blend);});}
  private historyHand(w:number,h:number,result:Result){
    this.libraryShell('PACK REPLAY',result.pack?.name??'Obsidian Flames',w,h,'binder',false);const tiles=packTiles(result),l=historyFanLayout(w,h,tiles.length),compact=h<420;
    // A short landscape panel has no free row above the hand, so the pack's total sits in the header beside Back.
    {const size=compact?20:28,x=compact?w-128:w-34,y=compact?52:122,labelSize=compact?11:13;this.display('PACK WIN',x,y-size*.43-4-labelSize*1.25,labelSize,0xfff2cf,0xa86a16,this.root,'right');this.money(result.total,x,y,size,0xfff2b8,'right','history-pack-total',result.id,false,220,true);}
    if(!compact)this.caption(this.text(w<600?'TAP TO LIFT · TAP AGAIN TO INSPECT':'HOVER TO FAN · SELECT A CARD TO INSPECT',34,102,9,0xcfeaff,this.root,'left','bold'),1.1);
    const hand=new Container();hand.sortableChildren=true;this.root.addChild(hand);
    tiles.forEach((card,i)=>{const p=l.pose(i,i===this.historySelection),group=new Container();group.position.set(p.x,p.y);group.rotation=p.rotation;group.scale.set(p.scale);group.zIndex=i===this.historySelection?100:i;hand.addChild(group);
      const shadow=new Graphics().roundRect(-l.width/2-2,-l.height/2+4,l.width+4,l.height,7).fill({color:0x000b18,alpha:.7}).roundRect(-l.width/2-1,-l.height/2-1,l.width+2,l.height+2,6).stroke({color:card.id==='bonus'?0xffd45a:0xa9dfed,width:card.id==='bonus'?2.4:1.5,alpha:card.id==='bonus'?1:.7});group.addChild(shadow);this.picture(card.image,-l.width/2,-l.height/2,l.width,l.height,group,true,0,card);const entry={group,...p,ready:!!this.state!.reduced};this.historyFanCards.push(entry);
      const hitW=i===0||i===tiles.length-1?l.step/2+l.width/2:l.step;const hitX=i===0?p.x-l.width/2:p.x-l.step/2;
      this.hit(`history-fan-${i}`,`Inspect ${card.name} from pack`,hitX,Math.max(104,p.y-l.height/2-l.lift),hitW,l.height+l.lift+16,()=>{if(this.historySelection!==i){this.focusHistoryCard(i);this.stage.draw();}else this.state!.inspect(card);});
      if(!this.state!.reduced)this.moneyAnimations.push(gsap.from(group,{x:w/2,y:h+40,rotation:0,alpha:0,duration:.48,delay:i*.026,ease:'power3.out',onUpdate:()=>this.stage.draw(),onComplete:()=>{entry.ready=true;}}));
    });
    this.historyFanTitle=this.display('',34,l.detailY-(compact?2:5),compact?16:24,0xffffff,0x0f3f73,this.root,'left');this.historyFanRarity=this.text('',34,l.detailY+(compact?19:29),compact?8:10,C.muted);this.historyFanValue=this.money(tiles[this.historySelection].value,w-34,l.detailY+(compact?11:20),compact?22:31,0xffedb0,'right','history-card-value',result.id,false,w<600?112:190,true);this.updateHistoryDetails();if(!this.state!.reduced)gsap.ticker.add(this.tickHistoryFan);
  }
  private settingsDrawer(w:number,h:number){
    const s=this.state!,l=settingsLayout(w,h),{x,y,width,height}=l,cx=x+l.pad;
    const shell=new Graphics(),head=l.compact?68:76;this.root.addChild(shell);drawPanel(shell,x,y,width,height,{head});
    this.keycap(shell,x+44,y+head/2+2,38,0x15548c,0xd8f7ff);{const gear=new Graphics(),points:number[]=[];for(let k=0;k<32;k++){const radius=k%4<2?11:8.5,a=k*Math.PI/16;points.push(Math.cos(a)*radius,Math.sin(a)*radius);}gear.poly(points).fill(0xf2fbff).circle(0,0,4.2).fill(0x15548c);gear.position.set(x+44,y+head/2+2);this.root.addChild(gear);}
    this.display('POKÉGEAR',x+72,y+(l.compact?12:16),l.compact?22:26,0xffffff,0x0f3f73,this.root,'left');this.caption(this.text('SETTINGS',x+73,y+(l.compact?43:50),9,0xcfeaff,this.root,'left','bold'),1.6);
    this.button('close','Return to game',x+width-58,y+(head-38)/2+1,38,38,()=>this.dismissModal(),{visibleLabel:'×',large:true});
    const options=[['Sound','Music & effects',s.sound,'sound'],['Turbo','Faster animations',s.turbo,'turbo'],['Low graphics','Lightweight mode',s.low,'low']] as const;
    options.forEach(([label,description,on,action],i)=>{const yy=l.bodyY+i*(l.rowHeight+l.gap),rw=l.column,cy=yy+l.rowHeight/2;
      drawPlate(shell,cx,yy,rw,l.rowHeight,10,on);this.keycap(shell,cx+26,cy,30,on?0x1d6db6:0x12456f,on?0xffffff:0x8fd0f2,0x9fe3ff,on?.3:.16);
      const icon=new Graphics();icon.position.set(cx+26,cy);icon.scale.set(.82);this.root.addChild(icon);if(action==='sound'){icon.poly([-8,-4,-3,-4,3,-10,3,10,-3,4,-8,4]).fill(0xf2fbff).moveTo(2+Math.cos(-.65)*10,Math.sin(-.65)*10).arc(2,0,10,-.65,.65).stroke({color:0xf2fbff,width:1.6});}else if(action==='turbo')icon.poly([2,-12,-7,1,-1,1,-4,12,8,-3,2,-3]).fill(0xf2fbff);else{for(let k=0;k<3;k++)icon.roundRect(-9+k*7,7-k*6,4,5+k*6,1).fill(0xf2fbff);}
      this.text(label,cx+52,yy+(l.compact?7:l.rowHeight/2-17),l.compact?12:15,C.white,this.root,'left','bold');this.text(description,cx+52,yy+(l.compact?24:l.rowHeight/2+3),l.compact?7:9.5,0xb9d6ea);
      // The switch: a track with thickness that lights when on, and a knob with its own shadow.
      const tw=48,th=26,sx=cx+rw-tw-14,kx=sx+(on?tw-th/2:th/2);shell.roundRect(sx,cy-th/2+2.5,tw,th,th/2).fill({color:0x031a30,alpha:.5}).roundRect(sx,cy-th/2,tw,th,th/2).fill(on?0x2f93e0:0x0a2742).stroke({color:on?0xffffff:0x5d88a6,width:1.4,alpha:on?.95:.8})
        .roundRect(sx+2.5,cy-th/2+2.5,tw-5,th*.4,th/2).fill({color:0xffffff,alpha:on?.22:.06}).circle(kx,cy+1.5,th/2-2.5).fill({color:0x031a30,alpha:.4}).circle(kx,cy,th/2-3).fill(on?0xffffff:0x9db8cc).stroke({color:0x061b32,width:1.2,alpha:.55});
      this.caption(this.text(on?'ON':'OFF',sx-8,cy-6,9,on?0xffffff:0x8fb0c8,this.root,'right','bold'),1);this.hit(action,`${label}: ${on?'on':'off'}`,cx,yy,rw,l.rowHeight,()=>s.action(action));
    });
    const ax=l.actionsX,aw=l.actionsWidth,ay=l.actionsY,half=(aw-8)/2;
    this.button('credits-menu','Add 1000 demo credits',ax,ay,aw,42,()=>s.action('credits'),{primary:true,small:true,visibleLabel:'+1,000 DEMO CREDITS'});
    this.button('fullscreen','Full screen',ax,ay+50,half,40,()=>s.action('fullscreen'),{small:true});this.button('drawer-export','Export collection',ax+half+8,ay+50,half,40,()=>s.action('export'),{small:true,visibleLabel:'Export cards'});
    this.button('drawer-about','How to play',ax,ay+98,half,38,()=>s.action('about'),{small:true});this.button('reset-menu','Reset demo and collection',ax+half+8,ay+98,half,38,()=>s.action('reset'),{disabled:!!s.save?.active,small:true,visibleLabel:'Reset demo'});
    // Demo cheats: choose what the next pack holds. The key is lit while any are armed.
    {const armed=cheatsActive(s.cheats??NO_CHEATS);this.button('drawer-cheats',armed?'Cheats: on':'Cheats',ax,ay+144,aw,38,()=>s.action('cheats'),{small:true,active:armed,visibleLabel:armed?'CHEATS · ON':'CHEATS'});}
    if(l.caption)this.text('DEMO CREDITS · NO CASH VALUE',l.compact?ax+aw/2:x+width/2,l.captionY,l.compact?7:8,C.muted,this.root,'center');
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
  /** Demo cheats: every choice is a strip of chips; the lit chip is what the next pack will do. */
  private cheatsMenu(w:number,h:number){
    const s=this.state!,cheats=s.cheats??NO_CHEATS,l=cheatsLayout(w,h),armed=cheatsActive(cheats);
    this.libraryShell('CHEATS','Demo outcomes',w,h,'spark');
    const section=<K extends keyof Cheats>(title:string,key:K,values:readonly Cheats[K][])=>{
      this.text(title,l.labels[key].x,l.labels[key].y,10,C.cyan,this.root,'left','bold');
      values.forEach((value,i)=>{const r=l[key](i),label=(CHEAT_LABELS[key] as Record<string,string>)[value];this.button(`cheat-${key}-${value}`,`${title}: ${label}`,r.x,r.y,r.width,r.height,()=>s.setCheats?.({[key]:value} as Partial<Cheats>),{active:cheats[key]===value,visibleLabel:label,small:true});});
    };
    section('POKÉMON WIN','win',CHEAT_WINS);section('END SCREEN TOTAL','total',CHEAT_TOTALS);section('BONUS GAME','bonus',CHEAT_BONUSES);section('LEGENDARY',"legendary",CHEAT_LEGENDARIES);
    if(l.info)this.text(cheatSummary(cheats),w/2,l.infoY,w<500?10:11,armed?C.white:C.muted,this.root,'center','bold',l.width);
    // From here straight into the pack; while a pack is open the choices wait for the next one.
    const busy=!!s.autoRun?.running||!['browse','complete'].includes(s.phase);
    this.button('cheats-reset','Reset cheats',l.reset.x,l.reset.y,l.reset.width,l.reset.height,()=>s.action('cheats-reset'),{small:true,disabled:!armed,visibleLabel:'Reset'});
    this.button('cheats-open',busy?'Done. The cheats apply to the next pack':`Open ${s.selected.name} with these cheats`,l.open.x,l.open.y,l.open.width,l.open.height,()=>s.action(busy?'close':'cheats-open'),{primary:true,disabled:!busy&&(!s.ready||!s.save),visibleLabel:busy?'DONE · NEXT PACK':`OPEN PACK · ${money(s.selected.price)}`});
  }
  private menu(w:number,h:number){
    const s=this.state!;if(s.panel==='auto'){this.autoMenu(w,h);return;}if(s.panel==='cheats'){this.cheatsMenu(w,h);return;}if(s.panel==='settings'){this.settingsDrawer(w,h);return;}if(s.panel==='history'){if(this.historyOpening)this.historyHand(w,h,this.historyOpening);else this.history(w,h);return;}
    this.libraryShell('TRAINER GUIDE','Pack opening',w,h,'binder');
    const compact=h<440,pad=28,gap=12,columns=compact?2:1,rowH=compact?66:Math.min(92,(h-179)/4),cell=(w-pad*2-(columns-1)*gap)/columns;
    const steps=[['CHOOSE','Pick a pack. Buy it, then pull the foil or press Open.'],['REVEAL','Reveal one card at a time, or use Open All.'],['COLLECT','Collect the pack to add its value and cards.'],['PLAY YOUR WAY','Turbo speeds up animations. Auto Spin opens a chosen pack count.']];
    const plates=new Graphics();this.root.addChild(plates);
    steps.forEach(([title,body],i)=>{const x=pad+i%columns*(cell+gap),y=100+Math.floor(i/columns)*(rowH+8);drawPlate(plates,x,y,cell,rowH);
      const number=this.display(String(i+1),x+30,y+rowH/2,compact?24:34,0xffffff,0x1f7fd0,this.root,'center');number.anchor.set(.5);
      this.display(title,x+60,y+(compact?7:rowH/2-27),compact?13:17,0xffffff,0x0f3f73,this.root,'left');this.text(body,x+60,y+(compact?27:rowH/2+1),compact?9:12.5,0xcfe3f2,this.root,'left','normal',cell-76);});
    this.text('Demo credits have no cash value. Card values and odds are illustrative.',w/2,h-47,w<500?9:10,C.muted,this.root,'center','normal',w-64);
  }
  private inspector(w:number,h:number,card:Card){
    const wide=w>=700&&h>=500;this.libraryShell('CARD DETAILS',card.name,w,h,'binder',!wide);
    const area=wide?{x:34,y:99,w:w*.51,h:h-126}:{x:26,y:95,w:w-52,h:h-173};
    this.picture(card.image,area.x,area.y,area.w,area.h,this.root,true,foilStrength(card.rarity,card.value));
    if(wide){const x=w*.6,room=w-x-34,plates=new Graphics();this.root.addChild(plates);
      const name=this.display(card.name,x,128,34,0xffffff,0x0f3f73,this.root,'left');if(name.width>room)name.scale.set(room/name.width);
      // Rarity and number on one chip; the value on its own plate.
      const rarity=this.caption(this.text(`${card.rarity.toUpperCase()} · #${card.number||'ENERGY'}`,x+12,190,10,0xffffff,this.root,'left','bold'),1.2);this.root.addChildAt(this.slab(new Graphics(),x,183,Math.min(room,rarity.width+24),26,'deep',7,2),this.root.getChildIndex(rarity));
      drawPlate(plates,x,236,Math.min(room,260),92,12,true);this.caption(this.text('CARD VALUE',x+16,247,9,0xfff2cf,this.root,'left','bold'),1.2);
      this.money(card.value,x+16,292,38,0xffefb6,'left','inspect-card',card.id,false,Math.min(room,260)-32,true);
      this.text('Move over the card to catch the foil.',x,h-92,11,0xb9d6ea,this.root,'left','normal',room);}
    else{this.caption(this.text(`${card.rarity.toUpperCase()} · #${card.number||'ENERGY'}`,28,h-48,10,0xcfeaff,this.root,'left','bold'),1.1);this.money(card.value,w-28,h-41,26,0xffefb6,'right','inspect-card',card.id,false,w*.45,true);}
  }
  private resultShell(w:number,h:number,title:string,subtitle:string,total?:{x:number;y:number;width:number;height:number}){
    // The panel is one object that can be moved and scaled about its centre when it opens.
    const chrome=this.resultChrome=new Container();chrome.pivot.set(w/2,h/2);chrome.position.set(w/2,h/2);this.root.addChild(chrome);
    const body=new Graphics();drawResultPanel(body,0,0,w,h,total);chrome.addChild(body);
    const compact=h<440,heading=this.display(title,w/2,compact?14:16,compact?19:25,0xffffff,0x0f3f73,chrome,'center');if(heading.width>w-70)heading.scale.set((w-70)/heading.width);
    const sub=this.caption(this.text(subtitle.toUpperCase(),w/2,compact?41:50,compact?8.5:10,0xf3d98a,chrome,'center','bold'),1.4);if(sub.width>w-70)sub.scale.set((w-70)/sub.width);
    return chrome;
  }
  private winSummary(value:number,identity:string,area:{x:number;y:number;width:number;height:number},mode:'pack'|'session'|'interlude',bet?:number,table:{sources?:ResultSource[];ledge?:number;onImpact?:(power:number)=>void}={}){
    const key=`summary:${identity}`,state=moneyState(this.moneyValues.get(key),identity,value,false);this.moneyValues.set(key,state);
    const view=this.stage.app.screen,effectsWidth=mode==='interlude'?view.width-20:area.x*2-24,effectsHeight=mode==='interlude'?view.height*.7:Math.min(520,view.height*.7);
    // The whole screen in the total's own space: a tiered win dims and flashes it.
    const screen={x:-(area.x+this.root.x),y:-(area.y+this.root.y),width:view.width,height:view.height};
    const win=new ResultWin(state,{width:area.width,height:area.height,effectsWidth,effectsHeight,mode,bet,sources:table.sources,ledge:table.ledge,screen,onImpact:table.onImpact,reduced:this.state!.reduced,turbo:!!this.state!.turbo,low:this.state!.low,draw:()=>this.stage.draw()});
    win.position.set(area.x,area.y);win.celebrationLayer.position.copyFrom(win.position);this.root.addChild(win.celebrationLayer,win);
    this.resultAmount=win;this.resultCount=state;
    // While a total is counting, a tap anywhere that is not a control lands it.
    win.eventMode='static';win.cursor='pointer';win.hitArea=win.paying?new Rectangle(screen.x,screen.y,screen.width,screen.height):new Rectangle(-area.width/2,-area.height/2,area.width,area.height);
    win.on('pointertap',()=>this.finishResultCount());
    this.hit('finish-win','Finish win animation',area.x-area.width/2,area.y-area.height/2,area.width,area.height,()=>this.finishResultCount());
    return win;
  }
  private results(w:number,h:number,result:Result,fromAuto=false){
    const tiles=packTiles(result),l=packResultsLayout(w,h,tiles.length),s=this.state!,ordinal=fromAuto?(s.autoRun!.results.findIndex(pack=>pack.id===result.id)+1):0,parts=resultPanelParts(h,l.total),draw=()=>this.stage.draw();
    const chrome=this.resultShell(w,h,fromAuto?`PACK ${String(ordinal).padStart(2,'0')} / ${s.autoRun!.completed}`:'PACK COMPLETE',result.pack?.name??s.selected.name,l.total);
    // A bonus caught after this modal opened arrives on it: the tiles make room, its tile flies in and only it pays.
    const before=this.resultSeen?.id===result.id?this.resultSeen:null,late=!!result.bonus&&!!before&&!before.bonus&&!s.reduced;
    this.resultSeen={id:result.id,bonus:!!result.bonus,slots:tiles.map((_,i)=>l.slot(i))};
    const d=s.turbo?.35:1,launching=!!this.resultLaunch&&!s.reduced,sources:ResultSource[]=[],dim:(()=>void)[]=[];
    // Tiles stand on the panel: each has a contact shadow, and its value stays dim until its light has been paid into the total.
    const groups=tiles.map((card,index)=>{const p=l.slot(index),group=new Container(),bonus=card.id==='bonus';group.position.set(p.x,p.y);
      const rare=isSpecialCard(card),edge=bonus?0xffd45a:rare?0xffe88e:0x6dcbdc,shadow=new Sprite(awardTextures().shade);shadow.anchor.set(.5);shadow.position.set(0,p.height/2+2);shadow.width=p.width*1.3;shadow.height=Math.max(8,p.width*.22);shadow.alpha=.6;
      const frame=new Graphics().roundRect(-p.width/2-3,-p.height/2-3,p.width+6,p.height+6,5).fill({color:bonus?0x2b1c06:rare?0x1d1238:0x061f33,alpha:bonus?.9:.75}).stroke({color:edge,width:bonus?2.4:rare?2:1,alpha:bonus||rare?.95:.4});
      // The bonus is its own kind of tile: a gold double edge and its multiplier across the foot of the card.
      if(bonus)frame.roundRect(-p.width/2-6,-p.height/2-6,p.width+12,p.height+12,7).stroke({color:0xfff2c0,width:1,alpha:.55});
      const art=new Container();group.addChild(shadow,frame,art);
      // Thumbnails are static: an animated special frame here kept the whole modal redrawing every frame while it stood open.
      this.picture(card.image,-p.width/2,-p.height/2,p.width,p.height,art,true,0);
      if(bonus){const size=Math.max(8,Math.min(20,p.width*.2)),bar=size*1.55,tag=new Text({text:'BONUS '+card.number,style:{fontFamily:'BattleDisplay, Nunito, Arial',fontWeight:'400',fontSize:size*2,fill:0xffffff,stroke:{color:0x061b32,width:size*.36},dropShadow:{color:0xc47a12,blur:0,distance:size*.22,angle:Math.PI/2,alpha:1}},resolution:2});
        tag.anchor.set(.5);tag.scale.set(.5);tag.position.set(0,p.height/2-bar*.5-1);if(tag.width>p.width+4)tag.scale.set(.5*(p.width+4)/tag.width);
        group.addChild(new Graphics().roundRect(-p.width/2-3,p.height/2-bar-1,p.width+6,bar+4,4).fill({color:0x1a0f02,alpha:.88}).moveTo(-p.width/2-2,p.height/2-bar-1).lineTo(p.width/2+2,p.height/2-bar-1).stroke({color:0xffd45a,width:1.2,alpha:.9}),tag);}
      else if(result.showdownSymbols?.includes(index)){const badge=createShowdownBadge();badge.scale.set(p.width/180);badge.position.set(0,p.height/2-12);group.addChild(badge);}
      const caption=this.text(card.id==='energy'?'Energy':money(card.value),0,p.height/2+7,p.width<60?9:11,bonus?0xffdf7a:rare?0xffedb0:C.cyan,group,'center','bold'),fit=caption.width>p.width+8?(p.width+8)/caption.width:1;caption.scale.set(fit);
      const entry={group,x:p.x,y:p.y,width:p.width,index,shadow,caption,landed:!launching};
      // When it is on the table: as it lands from the tray, or (a late bonus) once it has flown in.
      if(!late||bonus)sources.push({point:()=>({x:group.x,y:group.y}),width:p.width,value:card.value,tint:bonus?0xffd45a:ELEMENT_LIGHT[cardPowerKind(card)]??0x9aeff7,ready:late?.5:launching?(.16+index*.04+.5)*d:undefined,
        paid:power=>{if(caption.destroyed)return;gsap.killTweensOf(caption);caption.alpha=1;if(power>0&&!s.reduced)this.moneyAnimations.push(gsap.fromTo(caption.scale,{x:fit*(1.25+.3*power),y:fit*(1.25+.3*power)},{x:fit,y:fit,duration:.3,ease:'back.out(2.4)',onUpdate:draw}));}});
      if(!late||bonus)dim.push(()=>{if(card.value>0)caption.alpha=.36;});
      this.resultCards.push(entry);this.hit(`result-${index}`,bonus?`Inspect bonus ${card.name}, ${card.number}`:`Inspect ${card.name}`,p.x-p.width/2,p.y-p.height/2,p.width,p.height,()=>s.inspect(card));
      if(late){const old=before!.slots[index];
        // Make room: tiles slide from where they stood; the bonus drops in from the middle of the screen, large, and settles.
        if(old&&!bonus)this.moneyAnimations.push(gsap.from(group,{x:old.x,y:old.y,duration:.34,ease:'power3.out',onUpdate:draw}),gsap.from(group.scale,{x:old.width/p.width,y:old.width/p.width,duration:.34,ease:'power3.out'}));
        if(bonus){caption.alpha=0;this.moneyAnimations.push(gsap.from(group,{x:w/2,y:h*.46,alpha:0,duration:.46,ease:'power3.out',onUpdate:draw}),gsap.from(group.scale,{x:3.2,y:3.2,duration:.46,ease:'back.out(1.5)',onComplete:()=>{if(!caption.destroyed)caption.alpha=.36;playSound('land',{gain:.5});playSound('rare',{gain:.5});}}));}}
      return group;
    });
    // The landing and each tier upgrade pass through the panel: it gives once, and the tiles hop outward from the total.
    const reach=Math.max(w,h),impact=(power:number)=>{if(s.reduced||chrome.destroyed)return;this.moneyAnimations.push(gsap.fromTo(chrome.scale,{x:1+.02*power,y:1+.02*power},{x:1,y:1,duration:.42,ease:'elastic.out(1,.5)',onUpdate:draw}));
      for(const c of this.resultCards)if(c.landed&&!c.group.destroyed)this.moneyAnimations.push(gsap.fromTo(c.group,{y:c.y+8*power},{y:c.y,duration:.36,delay:Math.hypot(c.x-l.total.x,c.y-l.total.y)/reach*.16,ease:'back.out(3)',onUpdate:draw}));};
    const win=this.resultAmount=this.winSummary(result.total,result.id+':result',l.total,'pack',result.pack?.price??s.selected.price,{sources,ledge:parts.plate?parts.plate.y+parts.plate.height-l.total.y-3:undefined,onImpact:impact});
    if(win.paying){for(const off of dim)off();win.relight();}
    this.root.addChild(...groups,win);
    const y=h-61;this.resultButtons=[];
    if(fromAuto){const bw=Math.min(250,w-72);this.resultButtons.push(this.button('auto-results-back','Back to all packs',w/2-bw/2,y,bw,42,()=>this.dismissModal(),{primary:true,visibleLabel:'ALL PACKS'}));}
    else{const bw=Math.min(168,(w-68)/2);this.resultButtons.push(this.button('result-collection','View collection',w/2-bw-6,y,bw,42,()=>s.action('collection'),{visibleLabel:'Collection'}),this.button('result-continue','Continue',w/2+6,y,bw,42,()=>this.dismissModal('continue'),{primary:true}));}
    chrome.addChild(...this.resultButtons);
  }
  private autoResults(w:number,h:number,session:AutoSpinView){
    const s=this.state!,l=autoResultsLayout(w,h),pg=pageWindow(session.results.length,l.capacity,this.autoResultsPage);this.autoResultsPage=pg.page;
    const chrome=this.resultShell(w,h,session.completed>=session.total?'AUTO SPIN COMPLETE':'AUTO SPIN STOPPED',`${session.completed} PACK${session.completed===1?'':'S'} OPENED`);
    this.resultAmount=this.winSummary(session.totalWon,session.id+':session',l.total,'session',session.results.reduce((sum,pack)=>sum+(pack.pack?.price??s.selected.price),0));
    session.results.slice(pg.start,pg.end).forEach((result,i)=>{
      const r=l.slot(i),index=pg.start+i,group=new Container();group.pivot.set(r.width/2,r.height/2);group.position.set(r.x+r.width/2,r.y+r.height/2);this.root.addChild(group);this.paints.set(`auto-pack-${index}`,group);
      group.addChild(new Graphics().roundRect(0,0,r.width,r.height,9).fill({color:0x12486c,alpha:.65}).stroke({color:0x70cde8,width:1.3,alpha:.7}).roundRect(r.width*.19,r.height-47.5,r.width*.62,3,1.5).fill({color:0x6eeaff,alpha:.2}).roundRect(5,r.height-27,r.width-10,22,6).fill({color:0x052b46,alpha:.75}).stroke({color:0xffe89c,width:1,alpha:.25}));
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
    this.winSummary(result.total,session.id+':'+result.id+':interlude',{x:w/2,y:h*.49,width:Math.min(w-32,680),height:Math.min(210,h*.35)},'interlude',result.pack?.price??this.state!.selected.price);
    const label=session.running?'NEXT PACK':'SESSION COMPLETE';this.text(label,w/2,h*.72,h<430?11:14,0xb2efff,this.root,'center','bold');
    const dots=new Container();dots.position.set(w/2,h*.72+31);this.root.addChild(dots);
    for(let i=0;i<3;i++){const dot=this.ball((i-1)*20,0,4,0xadefff,dots);if(!this.state!.reduced)this.moneyAnimations.push(gsap.to(dot,{alpha:.25,duration:.35,delay:i*.1,repeat:-1,yoyo:true,ease:'sine.inOut',onUpdate:()=>this.stage.draw()}));}
    if(session.running){const bw=Math.min(166,w-60);this.button('auto-interlude-stop','Stop Auto Spin',w/2-bw/2,h-58,bw,38,()=>this.state!.action('auto-stop'),{small:true,visibleLabel:'STOP AUTO'});}
  }
  private animateResults(){
    const launch=this.resultLaunch!,chrome=this.resultChrome!,d=this.state!.turbo?.35:1,home=chrome.y,trayCount=this.state!.result?.cards.length??Infinity;
    this.transitioning=true;this.backdrop.alpha=0;
    // The panel comes up with weight and settles; the cards are dealt onto it from the tray in order; the buttons arrive last.
    chrome.alpha=0;chrome.y=home+30;chrome.scale.set(.955);for(const button of this.resultButtons){button.alpha=0;button.y+=12;}
    const tracks=this.resultCards.map(c=>{const source=launch.sources[c.index]??{x:this.stage.app.screen.width/2,y:this.stage.app.screen.height*.4,cardWidth:c.width},from={x:Math.max(18,Math.min(this.stage.app.screen.width-18,source.x))-this.modalOrigin.x,y:source.y-this.modalOrigin.y},rest={shadow:c.shadow.alpha,caption:c.caption.alpha};c.group.position.set(from.x,from.y);c.group.scale.set(source.cardWidth/c.width);c.shadow.alpha=0;c.caption.alpha=0;if(c.index>=trayCount)c.group.alpha=0;return {...c,from,rest,startScale:source.cardWidth/c.width,p:0};});
    const timeline=this.modalTween=gsap.timeline({onUpdate:()=>this.stage.draw(),onComplete:()=>{this.resultUnderlay?.destroy({texture:true,textureSource:true});this.resultUnderlay=null;this.transitioning=false;this.emitTargets();}});
    timeline.to(chrome,{alpha:1,duration:.22*d,ease:'power2.out'},0).to(chrome,{y:home,duration:.52*d,ease:'back.out(1.6)'},0).to(chrome.scale,{x:1,y:1,duration:.52*d,ease:'back.out(1.6)'},0).to(this.backdrop,{alpha:1,duration:.3*d},0);
    if(this.resultUnderlay)timeline.to(this.resultUnderlay,{alpha:0,duration:.26*d},.1*d);
    for(const c of tracks)timeline.to(c,{p:1,duration:.5*d,ease:'none',onStart:()=>{c.group.alpha=1;},onUpdate:()=>{const p=collectionFlight(c.p,c.from,c,c.index),size=c.startScale+(1-c.startScale)*p.scale,turn=Math.sin(Math.PI*c.p);
      // Dealt with a quarter turn of the wrist: the card narrows in flight and opens flat as it lands.
      c.group.position.set(p.x,p.y);c.group.rotation=p.rotation;c.group.scale.set(size*(1-.42*turn),size*(1+.04*turn));
     },onComplete:()=>{const entry=this.resultCards.find(card=>card.group===c.group);if(entry)entry.landed=true;if(c.index%3===0)playSound('land',{gain:.3});if(c.caption.destroyed)return;
      // It lands, gives slightly, and takes its shadow; its value appears under it.
      const draw=()=>this.stage.draw();c.group.scale.set(1.07,.94);this.moneyAnimations.push(gsap.to(c.group.scale,{x:1,y:1,duration:.34*d,ease:'elastic.out(1,.55)',onUpdate:draw}),gsap.to(c.shadow,{alpha:c.rest.shadow,duration:.18*d,onUpdate:draw}),gsap.to(c.caption,{alpha:Math.max(c.caption.alpha,c.rest.caption),duration:.2*d,onUpdate:draw}));}},(.16+c.index*.04)*d);
    const after=(.16+tracks.length*.04+.42)*d;this.resultButtons.forEach((button,i)=>{timeline.to(button,{alpha:1,y:button.y-12,duration:.3*d,ease:'back.out(1.8)'},after+i*.07*d);});
    timeline.to({}, {duration:.08*d});
  }
  destroy(){this.autoCoverTween?.kill();this.autoCover?.destroy();gsap.ticker.remove(this.tickSpecialFrames);this.specialFrames.clear();this.trayPrices.clear();gsap.ticker.remove(this.tickHistoryFan);this.trayHost.removeEventListener('pointerdown',this.trayDown,true);this.trayHost.removeEventListener('pointermove',this.trayMove,true);this.trayHost.removeEventListener('pointerup',this.trayUp,true);this.trayHost.removeEventListener('pointercancel',this.trayCancel,true);this.trayHost.removeEventListener('click',this.trayClick,true);this.trayHost.removeEventListener('wheel',this.trayWheel,true);this.stage.app.ticker.remove(this.tickRewards);this.rewards.destroy();this.feedbackTweens.forEach(t=>t.kill());this.feedbackTweens.clear();this.trayArt?.destroy(true);this.frozenHud?.destroy({texture:true,textureSource:true});this.resultUnderlay?.destroy({texture:true,textureSource:true});this.modalTween?.kill();this.returnTween?.kill();this.returnCover?.destroy({texture:true,textureSource:true});this.backdrop.destroy();this.trayTween?.kill();this.stage.onBeforeCardTransfer=null;this.stage.onCardStored=null;this.stage.onSpecialWin=null;this.stage.onCollectFocus=null;this.stage.cardDestination=null;this.moneyAnimations.forEach(t=>t.kill());this.destroyed=true;++this.generation;window.removeEventListener('keydown',this.keydown);this.stage.onLayout=null;this.root.destroy({children:true});this.thumbs.forEach(t=>t.destroy(true));this.thumbs.clear();this.pending.clear();this.tray.destroy(true);BitmapFont.uninstall('LegendsMoney');}
}
