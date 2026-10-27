import { Assets, Container, Graphics, Sprite, Text, Texture, Rectangle, BitmapFont, BitmapText } from 'pixi.js';
import { gsap } from 'gsap';
import { playSound } from './audio';
import { railElastic,railPosition,railSnap } from './carousel';
import { gameLayout, pageWindow } from './rendering';
import { money, type Card, type Pack, type Save, type Result } from './model';
import type { OpeningStage } from './Stage';

export type Panel = 'collection'|'settings'|'history'|'about'|null;
export type GameAction = 'open'|'tear'|'next'|'all'|'continue'|'close'|'collection'|'settings'|'history'|'about'|'credits'|'sound'|'reduced'|'low'|'reset'|'export'|'retry'|'dismiss'|'fullscreen';
export interface UIState {phase:string;index:number;save:Save|null;packs:Pack[];selected:Pack;pool:Card[];cards:Card[];ready:boolean;error:string;toast:string;panel:Panel;inspected:Card|null;result?:Result;sound:boolean;reduced:boolean;low:boolean;action:(action:GameAction)=>void;select:(pack:Pack)=>void;inspect:(card:Card)=>void}
export interface HitTarget {id:string;label:string;x:number;y:number;width:number;height:number;disabled:boolean;action:()=>void;canvasPointer?:boolean;selected?:boolean}
const C={ink:0x092846,panel:0x183e60,raised:0x235781,line:0x5484a8,cyan:0x9aeeff,white:0xf3fbff,muted:0xa3c2d9,blue:0x246ec1};

/** Pixi draws every visible control. Transparent DOM targets provide keyboard/screen-reader access only. */
export class CanvasUI {
  root=new Container(); private focus=new Graphics();private state:UIState|null=null;
  private tray:Texture;
  private moneyAnimations:gsap.core.Tween[]=[];private moneyValues=new Map<string,{identity:string,value:number}>();
  private updating=false;
  private railMotion={offset:0};private railTween:gsap.core.Tween|null=null;
  private rail:{content:Container;x:number;y:number;width:number;height:number;tile:number;stride:number;max:number;groups:Container[];hits:HitTarget[]}|null=null;
  private drag:{id:number;startX:number;startY:number;offset:number;lastX:number;lastTime:number;velocity:number;moved:boolean}|null=null;
  private lastPackId='';
  private generation=0;private hits:HitTarget[]=[];private paints=new Map<string,Container>();
  private page=0;private collected=false;private zoom=false;private lastInspected='';
  private thumbs=new Map<string,Texture>();private pending=new Map<string,Promise<Texture>>();private destroyed=false;
  constructor(private stage:OpeningStage,private onTargets:(hits:HitTarget[],summary:string)=>void){
    BitmapFont.install({name:'LegendsMoney',style:{fontFamily:'Nunito',fontSize:48,fontWeight:'900',fill:0xffffff},chars:'0123456789$.,+- ',resolution:2,padding:3,skipKerning:true});
    const canvas=document.createElement('canvas');canvas.width=8;canvas.height=128;const ctx=canvas.getContext('2d')!;const gradient=ctx.createLinearGradient(0,0,0,128);gradient.addColorStop(0,'rgba(4,14,29,0)');gradient.addColorStop(1,'rgba(4,14,29,.65)');ctx.fillStyle=gradient;ctx.fillRect(0,0,8,128);this.tray=Texture.from(canvas);
    stage.app.stage.addChild(this.root);stage.onLayout=()=>{if(!this.updating)this.build();};
    window.addEventListener('keydown',this.keydown);
    stage.app.canvas.addEventListener('pointerdown',this.railDown);stage.app.canvas.addEventListener('pointermove',this.railMove);stage.app.canvas.addEventListener('pointerup',this.railUp);stage.app.canvas.addEventListener('pointercancel',this.railCancel);stage.app.canvas.addEventListener('wheel',this.railWheel,{passive:false});
  }
  update(state:UIState){
    if(state.inspected?.id!==this.lastInspected){this.zoom=false;this.lastInspected=state.inspected?.id??'';}
    this.state=state;
    this.updating=true;
    this.stage.setLayoutMode(!['browse','complete'].includes(state.phase));
    this.stage.setScene(['revealing','revealed','settling','complete'].includes(state.phase));
    this.stage.setBlocked(!!state.panel||!!state.inspected||state.phase==='complete');
    this.updating=false;
    this.build();
  }
  private keydown=(event:KeyboardEvent)=>{
    if(!this.state)return;
    if(event.key==='Escape'){event.preventDefault();this.state.action('close');return;}
    if((event.target as HTMLElement)?.tagName==='BUTTON')return;
    if(this.state.panel==='collection'&&!this.state.inspected&&['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();this.page+=event.key==='ArrowRight'?1:-1;this.build();}
    if((event.key===' '||event.key==='Enter')&&!this.state.panel&&!this.state.inspected){event.preventDefault();const phase=this.state.phase;const action=phase==='browse'?'open':phase==='sealed'?'tear':phase==='revealed'?'next':phase==='complete'?'continue':null;if(action)this.state.action(action);}
  };
  private text(value:string,x:number,y:number,size=14,color=C.white,parent=this.root,align:'left'|'center'|'right'='left',weight:'normal'|'bold'='normal',maxWidth?:number){
    const text=new Text({text:value,style:{fontFamily:'Nunito, Arial, sans-serif',fontSize:size,fontWeight:weight==='bold'?'800':'600',fill:color,align,wordWrap:!!maxWidth,wordWrapWidth:maxWidth,lineHeight:size*1.3},resolution:Math.min(2,devicePixelRatio)});
    text.anchor.set(align==='center'?.5:align==='right'?1:0,0);text.position.set(x,y);parent.addChild(text);return text;
  }
  private money(amount:number,x:number,y:number,size:number,color:number,align:'left'|'center'|'right',key:string,identity:string,plus=false){
    const previous=this.moneyValues.get(key);this.moneyValues.set(key,{identity,value:amount});
    const start=previous?.identity===identity?previous.value:(key==='wallet'?amount:0);
    const label=new BitmapText({text:`${plus?'+':''}${money(amount)}`,style:{fontFamily:'LegendsMoney',fontSize:size,align}});
    label.anchor.set(align==='right'?1:align==='center'?.5:0,0);label.position.set(x,y);label.tint=color;this.root.addChild(label);
    if(start!==amount&&!this.state!.reduced){
      const counter={value:start};let lastTick=0;label.scale.set(1.06);
      this.moneyAnimations.push(gsap.to(counter,{value:amount,duration:.85,ease:'power2.out',onUpdate:()=>{label.text=`${plus?'+':''}${money(Math.round(counter.value))}`;if(key==='result'&&performance.now()-lastTick>115){playSound('credit');lastTick=performance.now();}this.stage.draw();}}));
      this.moneyAnimations.push(gsap.to(label.scale,{x:1,y:1,duration:.55,ease:'back.out(1.7)',onUpdate:()=>this.stage.draw()}));
    }
    return label;
  }
  private panel(x:number,y:number,w:number,h:number,fill=C.panel,line=C.line,parent=this.root,cut=9){
    const radius=Math.min(cut+3,h/2);
    const g=new Graphics().roundRect(x,y+3,w,h,radius).fill({color:0x04192c,alpha:.38}).roundRect(x,y,w,h,radius).fill({color:fill,alpha:.94}).stroke({width:1.4,color:line,alpha:.8});
    parent.addChild(g);return g;
  }
  private ball(x:number,y:number,r:number,color=C.cyan,parent=this.root){
    const g=new Graphics().circle(x,y,r).stroke({color,width:1.6}).moveTo(x-r,y).lineTo(x+r,y).stroke({color,width:1.5}).circle(x,y,r*.28).fill(C.panel).stroke({color,width:1.5});parent.addChild(g);return g;
  }
  private button(id:string,label:string,x:number,y:number,w:number,h:number,action:()=>void,options:{primary?:boolean;active?:boolean;disabled?:boolean;small?:boolean;visibleLabel?:string}={}){
    const group=new Container();this.root.addChild(group);this.paints.set(id,group);
    const chosen=options.active||options.primary;
    this.panel(x,y,w,h,chosen?C.blue:C.panel,chosen?C.cyan:C.line,group,7);
    if(chosen){const light=new Graphics().roundRect(x+3,y+3,w-6,h*.4,5).fill({color:0xd7f7ff,alpha:.12});group.addChild(light);}
    if(options.primary)this.ball(x+24,y+h/2,7,C.white,group);
    this.text(options.visibleLabel??label,x+w/2+(options.primary?6:0),y+(h-(options.small?12:14)*1.3)/2,options.small?12:14,chosen?C.white:C.muted,group,'center','bold');
    group.alpha=options.disabled?.38:1;
    const hit={id,label,x,y,width:w,height:h,disabled:!!options.disabled,action};this.hits.push(hit);
    group.eventMode=options.disabled?'none':'static';group.cursor='pointer';group.on('pointertap',()=>{if(!options.disabled)action();});
    return group;
  }
  private hit(id:string,label:string,x:number,y:number,w:number,h:number,action:()=>void,disabled=false){this.hits.push({id,label,x,y,width:w,height:h,disabled,action});}
  hover(id:string,value:boolean){const paint=this.paints.get(id);if(paint){paint.tint=value?0xc2f6ff:0xffffff;this.stage.draw();}}
  setFocus(id:string|null){this.focus.clear();const hit=this.hits.find(h=>h.id===id);if(hit)this.focus.roundRect(hit.x-3,hit.y-3,hit.width+6,hit.height+6,8).stroke({color:0xe3fcff,width:2});this.stage.draw();}
  private async thumbnail(path:string){
    const cached=this.thumbs.get(path);if(cached)return cached;
    if(this.pending.has(path))return this.pending.get(path)!;
    const promise=(async()=>{const image=new Image();image.src=path;await image.decode();
      const scale=Math.min(1,384/Math.max(image.naturalWidth,image.naturalHeight));const canvas=document.createElement('canvas');canvas.width=Math.round(image.naturalWidth*scale);canvas.height=Math.round(image.naturalHeight*scale);const ctx=canvas.getContext('2d')!;
      if(path.includes('/cards/')||path.includes('card-back')){ctx.beginPath();ctx.roundRect(0,0,canvas.width,canvas.height,canvas.width*.05);ctx.clip();}
      ctx.drawImage(image,0,0,canvas.width,canvas.height);const texture=Texture.from(canvas);
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
    ++this.generation;this.railTween?.kill();this.railTween=null;this.cancelRailDrag();this.rail=null;this.moneyAnimations.forEach(t=>t.kill());this.moneyAnimations=[];this.hits=[];this.paints.clear();this.focus.clear();
    this.root.removeChild(this.focus);this.root.removeChildren().forEach(child=>child.destroy({children:true}));
    const s=this.state,w=this.stage.app.screen.width,h=this.stage.app.screen.height,l=gameLayout(w,h,!['browse','complete'].includes(s.phase));
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
    this.root.addChild(this.focus);this.stage.draw();
    this.emitTargets();
    // Keep thumbnail memory bounded. A screen uses fewer than 24; oldest pages can be discarded.
    while(this.thumbs.size>72){const key=this.thumbs.keys().next().value!;const texture=this.thumbs.get(key)!;this.thumbs.delete(key);texture.destroy(true);}
  }
  private emitTargets(){const s=this.state!;this.onTargets([...this.hits],s.inspected?`Viewing ${s.inspected.name}`:s.panel?`${s.panel} screen`:`${s.selected.name}. ${s.phase}. Balance ${money(s.save?.balance??10000)}. ${s.phase==='revealed'?s.save?.active?.cards[s.index]?.name??'':''}`);}
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
  private positionRail(velocity=0){const r=this.rail;if(!r)return;r.content.x=r.x-this.railMotion.offset;r.groups.forEach(group=>{group.rotation=this.state!.reduced?0:Math.max(-.025,Math.min(.025,-velocity*.012));});this.stage.draw();}
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
    else {icon.poly([-12,-4,-6,-4,1,-10,1,10,-6,4,-12,4]).fill(white);if(kind==='sound')icon.arc(1,0,8,-.7,.7).stroke({color:white,width:2}).arc(1,0,13,-.7,.7).stroke({color:white,width:2});else icon.moveTo(6,-5).lineTo(13,5).moveTo(6,5).lineTo(13,-5).stroke({color:white,width:2});}
    this.hits.push({id,label,x,y,width:size,height:size,disabled:false,action});return group;
  }
  private hud(w:number,h:number){
    const s=this.state!,l=gameLayout(w,h,!['browse','complete'].includes(s.phase));
    const logoW=l.portrait?116:148,logoH=l.portrait?44:55;
    this.picture('/assets/pokemon-logo.png',18,10,logoW,logoH);this.text('LEGENDS',18+logoW/2,l.portrait?50:59,8,0xffffff,this.root,'center','bold');
    const walletW=l.portrait?181:205,walletX=w-walletW-16,walletY=13;
    const wallet=new Graphics().roundRect(walletX,walletY,walletW,48,22).fill({color:0x06315a,alpha:.91}).stroke({width:1.5,color:0xa7e8ff,alpha:.85});this.root.addChild(wallet);
    this.text('Demo credits',walletX+17,walletY+5,8,C.muted);
    this.money(s.save?.balance??10000,w-59,walletY+15,l.portrait?23:27,C.white,'right','wallet','balance');
    this.iconButton('credits','Add 1000 free demo credits',w-49,walletY+8,32,'plus',()=>s.action('credits'));
    const size=l.compact?38:l.portrait?44:50,side=l.portrait?16:25,iconsY=l.compact?76:95;
    this.iconButton('binder','My collection',side,iconsY,size,'binder',()=>s.action('collection'));
    this.iconButton('history','Opening history',side,iconsY+size+12,size,'history',()=>s.action('history'));
    this.iconButton('settings','Settings',w-side-size,iconsY,size,'gear',()=>s.action('settings'));
    this.iconButton('sound',s.sound?'Mute sound':'Enable sound',w-side-size,iconsY+size+12,size,s.sound?'sound':'mute',()=>s.action('sound'));
    if(!l.compact){this.text(s.selected.name,side,l.top-2,11,C.white,this.root,'left','bold');if(s.save?.active)this.text(`${Math.min(s.index+(s.phase==='revealed'?1:0),11)} / 11`,w-side,l.top-2,11,C.white,this.root,'right','bold');}
  }
  private playControls(w:number,h:number){
    const s=this.state!,l=gameLayout(w,h,!['browse','complete'].includes(s.phase)),busy=['reserving','tearing','revealing','settling'].includes(s.phase);
    const y=l.dockTop-(l.compact?45:52);
    if(s.phase==='revealed'){
      const card=s.save!.active!.cards[s.index];
      const plateW=l.compact?220:Math.min(w-36,390),plateX=l.compact?24:(w-plateW)/2,plateY=l.compact?l.actionTop+3:l.actionTop+2;
      const plate=new Graphics().roundRect(plateX,plateY,plateW,l.compact?64:70,16).fill({color:0x062744,alpha:.9});this.root.addChild(plate);
      const cx=plateX+plateW/2;
      this.text(card.rarity,cx,plateY+5,9,C.cyan,this.root,'center','bold');
      this.text(card.name,cx-12,plateY+19,l.compact?15:19,C.white,this.root,'center','bold');
      this.button('inspect',`Inspect ${card.name}`,plateX+plateW-37,plateY+20,25,25,()=>s.inspect(card),{visibleLabel:'⌕'});
      if(card.id==='energy')this.text('Energy',cx,plateY+44,14,C.cyan,this.root,'center');
      else this.money(card.value,cx,plateY+43,l.compact?19:22,C.cyan,'center','reward',`${s.save!.active!.id}-${s.index}`,true);
      const bw=l.portrait?164:190,buttonX=l.compact?w/2:w/2-(s.index<10?bw+112: bw)/2;
      this.button('next',s.index===10?'Collect cards':'Next card',buttonX,y,bw,42,()=>s.action('next'),{primary:true,visibleLabel:s.index===10?'Collect':'Next card'});
      if(s.index<10)this.button('reveal-all','Reveal all',buttonX+bw+10,y,102,42,()=>s.action('all'),{small:true});
    }else{
      if(s.phase==='sealed'&&!l.compact)this.text('Slide across the seal to open',w/2,y-24,12,C.white,this.root,'center');
      const label=busy?(s.phase==='tearing'?'Opening…':s.phase==='revealing'?'Revealing…':s.phase==='settling'?'Collecting…':'Preparing…'):s.phase==='sealed'?'Tear open':`Open pack   ${money(s.selected.price)}`;
      this.button('primary',label,w/2-132,y,264,44,()=>s.action(s.phase==='sealed'?'tear':'open'),{primary:true,disabled:busy||!s.ready||!s.save||(s.phase==='browse'&&!s.pool.length)});
    }
  }
  private rack(w:number,h:number){
    const s=this.state!,l=gameLayout(w,h,!['browse','complete'].includes(s.phase)),y=l.dockTop;
    const fade=new Sprite(this.tray);fade.position.set(0,y-25);fade.width=w;fade.height=l.dock+25;this.root.addChild(fade);
    if(s.save?.active){
      const revealed=s.index+(s.phase==='revealed'?1:0),total=s.save.active.cards.slice(0,revealed).reduce((n,c)=>n+c.value,0);
      if(!l.compact){this.text('Pack value',25,y+9,10,C.muted);this.money(total,w-25,y+3,21,C.white,'right','revealed',s.save.active.id);}
      const cardWidth=Math.min(l.compact?35:49,(w-40-10*5)/11),cardHeight=cardWidth*1.4;const full=cardWidth*11+50,start=(w-full)/2;
      s.save.active.cards.forEach((card,i)=>{const x=start+i*(cardWidth+5),cy=y+(l.compact?13:34);if(i===s.index){const g=new Graphics().roundRect(x-3,cy-3,cardWidth+6,cardHeight+6,5).fill({color:0xabf5ff,alpha:.16}).stroke({width:2,color:C.cyan});this.root.addChild(g);}this.picture(i<revealed?card.image:'/assets/card-back.webp',x,cy,cardWidth,cardHeight);if(i<revealed)this.hit(`card-${i}`,`Inspect ${card.name}, card ${i+1}`,x,cy,cardWidth,cardHeight,()=>s.inspect(card));});
      return;
    }
    const tile=l.compact?124:l.portrait?190:200,stride=tile+14,margin=l.portrait?14:24;
    const viewport={x:margin,y:y+8,width:w-margin*2,height:tile+7};
    const content=new Container();content.y=viewport.y;this.root.addChild(content);
    const mask=new Graphics().rect(viewport.x,viewport.y-4,viewport.width,viewport.height+8).fill(0xffffff);this.root.addChild(mask);content.mask=mask;
    const groups:Container[]=[],hits:HitTarget[]=[];
    this.railMotion.offset=railPosition(this.railMotion.offset,Math.max(0,s.packs.length*stride-14-viewport.width));
    s.packs.forEach((pack,i)=>{
      const selected=pack.id===s.selected.id,group=new Container();group.pivot.set(tile/2,tile/2);group.position.set(i*stride+tile/2,tile/2);content.addChild(group);groups.push(group);this.paints.set(`pack-${pack.id}`,group);
      const frame=new Graphics().roundRect(0,3,tile,tile,17).fill({color:0x061d37,alpha:.4}).roundRect(0,0,tile,tile,17).fill({color:selected?0x276f9d:0x123c63,alpha:selected?.88:.76}).stroke({width:selected?2.8:1.4,color:selected?0xb5f9ff:0x679fc1,alpha:.95});
      frame.roundRect(5,5,tile-10,tile*.55,13).fill({color:0xb6edff,alpha:selected?.11:.04});group.addChild(frame);
      const artH=l.compact?68:tile-63;this.picture(pack.packImage,tile/2-49,7,98,artH,group);
      this.text(pack.name,tile/2,tile-53,l.compact?10:12,C.white,group,'center','bold',tile-14);
      const price=new BitmapText({text:money(pack.price),style:{fontFamily:'LegendsMoney',fontSize:l.compact?20:27}});price.anchor.set(.5,0);price.position.set(tile/2,tile-31);price.tint=selected?0xc5fbff:C.white;group.addChild(price);
      if(selected)this.ball(tile-17,17,7,0xd6ffff,group);
      hits.push({id:`pack-${pack.id}`,label:`${pack.name}, ${money(pack.price)}`,x:0,y:viewport.y,width:tile,height:tile,disabled:false,action:()=>s.select(pack),canvasPointer:true,selected});
      if(selected&&this.lastPackId!==pack.id&&!s.reduced)this.moneyAnimations.push(gsap.from(group.scale,{x:.95,y:.95,duration:.36,ease:'back.out(1.8)'}));
    });
    this.lastPackId=s.selected.id;
    this.rail={content,...viewport,tile,stride,max:Math.max(0,s.packs.length*stride-14-viewport.width),groups,hits};this.positionRail();
    // Arrow buttons are keyboard alternatives to mouse/touch dragging.
    this.button('pack-prev','Previous packs',6,viewport.y+tile/2-18,26,36,()=>this.animateRail(railPosition(this.railMotion.offset-stride*2,this.rail!.max)),{small:true,visibleLabel:'‹'});
    this.button('pack-next','Next packs',w-32,viewport.y+tile/2-18,26,36,()=>this.animateRail(railPosition(this.railMotion.offset+stride*2,this.rail!.max)),{small:true,visibleLabel:'›'});
    hits.forEach((hit,i)=>{const left=viewport.x+i*stride-this.railMotion.offset,right=left+tile;hit.x=Math.max(viewport.x,left);hit.width=Math.max(0,Math.min(viewport.x+viewport.width,right)-hit.x);if(hit.width>24)this.hits.push(hit);});
  }
  private screen(title:string,w:number,h:number,subtitle?:string){
    this.root.addChild(new Graphics().rect(0,0,w,h).fill({color:0x08233f,alpha:.94}));
    const body=new Graphics().roundRect(12,12,w-24,h-24,23).fill({color:0x113b60,alpha:.98}).stroke({width:2,color:0x87c8e6,alpha:.6});
    body.roundRect(18,18,w-36,58,18).fill(0x205980);this.root.addChild(body);
    this.ball(w-60,h-60,100,0x1c4a70);
    this.picture('/assets/pokemon-logo.png',29,29,73,28);
    const heading=this.text(title,119,24,w<700?21:26,C.white,this.root,'left','bold');
    if(heading.width>w-185)heading.scale.set((w-185)/heading.width);
    if(subtitle)this.text(subtitle,120,55,10,0xb8dbef);
    this.button('close',this.state!.inspected?'Close card viewer':'Return to game',w-57,27,30,30,()=>this.state!.action('close'),{visibleLabel:'×'});
  }
  private collection(w:number,h:number){
    const s=this.state!,portrait=w<700;
    const source=this.collected?s.cards.filter(c=>s.save?.collection[c.id]):s.pool;
    const rows=h<550&&w>=560?1:2,columns=portrait?2:Math.max(4,Math.min(6,Math.floor((w-70)/150))),size=columns*rows;
    const page=pageWindow(source.length,size,this.page);this.page=page.page;
    this.screen('Card binder',w,h,`${Object.keys(s.save?.collection??{}).length} cards discovered`);
    this.button('set-filter',s.selected.name,26,87,portrait?160:190,34,()=>{this.collected=false;this.page=0;this.build();},{active:!this.collected,small:true});
    this.button('collected-filter','Collected cards',portrait?194:228,87,portrait?135:165,34,()=>{this.collected=true;this.page=0;this.build();},{active:this.collected,small:true,visibleLabel:'Collected'});
    if(!portrait)this.button('export','Export collection',w-183,87,155,34,()=>s.action('export'),{small:true});
    if(!source.length){this.ball(w/2,h/2-30,36,C.line);this.text('Your binder is waiting.',w/2,h/2+22,20,C.white,this.root,'center','bold');this.text('Open a pack to collect your first cards.',w/2,h/2+54,12,C.muted,this.root,'center');}
    const top=137,bottom=h-68,slotW=(w-52-(columns-1)*12)/columns,slotH=(bottom-top-17*(rows-1))/rows;
    source.slice(page.start,page.end).forEach((card,i)=>{
      const x=26+(i%columns)*(slotW+12),y=top+Math.floor(i/columns)*(slotH+17),count=s.save?.collection[card.id]??0;
      this.panel(x,y,slotW,slotH,0x102b44,count?0x416d89:0x223f5b,this.root,6);
      const imgH=Math.max(60,slotH-40),imgW=Math.min(slotW-12,imgH/1.397);this.picture(card.image,x+(slotW-imgW)/2,y+5,imgW,imgH);
      this.text(card.name,x+7,y+slotH-31,portrait?9:11,C.white,this.root,'left','bold',slotW-12);
      this.text(count?`×${count}`:`#${card.number}`,x+7,y+slotH-15,9,count?C.cyan:C.muted);
      this.text(money(card.value),x+slotW-7,y+slotH-15,9,C.muted,this.root,'right');
      this.hit(`binder-${card.id}`,`${card.name}, ${count} collected`,x,y,slotW,slotH,()=>s.inspect(card));
    });
    this.button('page-prev','Previous collection page',26,h-52,68,30,()=>{this.page--;this.build();},{disabled:page.page===0,visibleLabel:'‹ Back',small:true});
    this.text(`${page.page+1} / ${page.pages}`,w/2,h-46,12,C.cyan,this.root,'center','bold');
    this.button('page-next','Next collection page',w-94,h-52,68,30,()=>{this.page++;this.build();},{disabled:page.page+1===page.pages,visibleLabel:'Next ›',small:true});
  }
  private menu(w:number,h:number){
    const s=this.state!;const title=s.panel==='settings'?'Game settings':s.panel==='history'?'Opening history':'How to play';
    this.screen(title,w,h);
    const x=Math.max(28,(w-520)/2),width=Math.min(520,w-56);let y=107;
    if(s.panel==='settings'){
      const short=h<590,split=short&&w>=560;
      const contentW=split?Math.min(800,w-56):width,cx=(w-contentW)/2,colW=split?(contentW-26)/2:contentW;
      const top=short?94:109,rowH=short?48:58,gap=short?10:17;
      [['Sound effects',s.sound,'sound'],['Reduced motion',s.reduced,'reduced'],['Low graphics',s.low,'low']].forEach(([label,value,action],i)=>{
        const yy=top+i*(rowH+gap);this.panel(cx,yy,colW,rowH,0x19496f,0x467da1);this.text(String(label),cx+17,yy+(rowH-19)/2,14,C.white);
        this.button(String(action),`${label}: ${value?'on':'off'}`,cx+colW-82,yy+(rowH-30)/2,65,30,()=>s.action(action as GameAction),{active:!!value,visibleLabel:value?'ON':'OFF',small:true});
      });
      const right=split?cx+colW+26:cx;let yy=split?top:top+3*(rowH+gap)+2;
      this.button('credits-menu','Add 1000 demo credits',right,yy,colW,38,()=>s.action('credits'),{primary:true,visibleLabel:'Add $1,000 demo credits'});yy+=short?48:54;
      this.button('history-menu','Opening history',right,yy,(colW-10)/2,34,()=>s.action('history'),{small:true});this.button('help-menu','How to play',right+(colW+10)/2,yy,(colW-10)/2,34,()=>s.action('about'),{small:true});yy+=short?44:48;
      this.button('fullscreen','Full screen',right,yy,(colW-10)/2,34,()=>s.action('fullscreen'),{small:true});this.button('export-menu','Export collection',right+(colW+10)/2,yy,(colW-10)/2,34,()=>s.action('export'),{small:true});yy+=short?44:48;
      this.button('reset-menu','Reset demo and collection',right,yy,colW,34,()=>s.action('reset'),{disabled:!!s.save?.active,small:true});
      this.text('Demo credits only',w/2,h-39,10,C.muted,this.root,'center');
    }else if(s.panel==='history'){
      const rows=Math.max(1,Math.floor((h-175)/66)),history=s.save?.history??[],pg=pageWindow(history.length,rows,this.page);this.page=pg.page;
      if(!history.length)this.text('No completed openings yet.',w/2,h/2,16,C.muted,this.root,'center');
      history.slice(pg.start,pg.end).forEach((result,i)=>{const yy=y+i*66;this.panel(x,yy,width,55,0x112b42,0x25465f);this.picture(result.pack?.packImage??s.packs[0].packImage,x+10,yy+4,28,48);this.text(result.pack?.name??'Obsidian Flames',x+53,yy+9,13,C.white,this.root,'left','bold');this.text(new Date(result.at).toLocaleString(),x+53,yy+31,9,C.muted);this.text(`+${money(result.total)}`,x+width-13,yy+19,14,C.cyan,this.root,'right','bold');});
      this.button('history-back','Previous history page',x,h-54,68,30,()=>{this.page--;this.build();},{disabled:pg.page===0,visibleLabel:'‹',small:true});this.text(`${pg.page+1} / ${pg.pages}`,w/2,h-49,12,C.muted,this.root,'center');this.button('history-next','Next history page',x+width-68,h-54,68,30,()=>{this.page++;this.build();},{disabled:pg.page+1===pg.pages,visibleLabel:'›',small:true});
    }else{
      const lines=['Choose a pack, then slide across its seal to open it.','Tap Next card or press Space to reveal. Inspect a card to read it at full size.','The revealed value is credited when you collect the pack. Energy has no value.','Your cards and unfinished pack are saved in this browser.','This is a frontend demo. Credits have no cash value; card values and odds are illustrative.'];
      lines.forEach((line,i)=>this.text(line,x,y+i*Math.min(72,(h-135)/5),h<550?12:14,i===4?C.muted:C.white,this.root,'left','normal',width));
    }
  }
  private inspector(w:number,h:number,card:Card){
    this.screen(card.name,w,h,`${card.rarity} · #${card.number||'Energy'}`);
    this.button('zoom',this.zoom?'Fit card':'Full-size card',w-165,76,138,32,()=>{this.zoom=!this.zoom;this.build();},{small:true,visibleLabel:this.zoom?'Fit card':'Full size'});
    this.text(this.zoom?'Drag to move the card':'',28,85,10,C.muted);
    const area={x:24,y:121,w:w-48,h:h-149};const imageLayer=new Container();this.root.addChild(imageLayer);
    const mask=new Graphics().rect(area.x,area.y,area.w,area.h).fill(0xffffff);this.root.addChild(mask);imageLayer.mask=mask;
    const gen=this.generation;
    void Assets.load<Texture>(card.image).then(texture=>{
      if(this.destroyed||gen!==this.generation)return;
      const sprite=new Sprite(texture);sprite.anchor.set(.5);
      const fit=Math.min(area.w/texture.width,area.h/texture.height);sprite.scale.set(this.zoom?Math.max(fit,1):fit);
      sprite.position.set(w/2,this.zoom?area.y+sprite.height/2:area.y+area.h/2);imageLayer.addChild(sprite);
      if(this.zoom){
        let drag:{x:number;y:number;sx:number;sy:number}|null=null;imageLayer.eventMode='static';imageLayer.cursor='grab';imageLayer.hitArea=new Rectangle(area.x,area.y,area.w,area.h);
        imageLayer.on('pointerdown',e=>{drag={x:e.global.x,y:e.global.y,sx:sprite.x,sy:sprite.y};imageLayer.cursor='grabbing';});
        imageLayer.on('globalpointermove',e=>{if(!drag)return;const dx=Math.max(0,(sprite.width-area.w)/2),dy=Math.max(0,sprite.height-area.h);sprite.x=Math.max(w/2-dx,Math.min(w/2+dx,drag.sx+e.global.x-drag.x));sprite.y=Math.max(area.y+sprite.height/2-dy,Math.min(area.y+sprite.height/2,drag.sy+e.global.y-drag.y));this.stage.draw();});
        const stop=()=>{drag=null;imageLayer.cursor='grab';};imageLayer.on('pointerup',stop);imageLayer.on('pointerupoutside',stop);
      }
      this.stage.draw();
    }).catch(()=>{if(gen===this.generation){this.text('Card image could not load.',w/2,h/2,14,C.muted,this.root,'center');this.stage.draw();}});
  }
  private results(w:number,h:number,result:Result){
    const compact=h<550&&w>=560;
    this.screen('Pack collected',w,h,result.pack?.name??'Obsidian Flames');
    const fresh=this.moneyValues.get('result')?.identity!==result.id;
    this.money(result.total,w/2,compact?87:96,compact?30:w<700?40:52,C.cyan,'center','result',result.id,true);this.text('Added to your balance',w/2,compact?124:w<700?140:150,11,C.muted,this.root,'center');
    const columns=compact?11:w<700?4:6,rows=Math.ceil(11/columns),top=compact?148:183,bottom=h-95;
    const cw=Math.min(145,(w-54-(columns-1)*12)/columns),ch=Math.min(cw*1.4,(bottom-top-(rows-1)*23)/rows-20),drawW=ch/1.4;
    result.cards.forEach((card,i)=>{const row=Math.floor(i/columns),col=i%columns,number=Math.min(columns,11-row*columns),rowWidth=number*(drawW+12)-12,x=(w-rowWidth)/2+col*(drawW+12),y=top+row*(ch+33);this.picture(card.image,x,y,drawW,ch);this.text(card.id==='energy'?'Energy':money(card.value),x+drawW/2,y+ch+7,10,C.cyan,this.root,'center');this.hit(`result-${i}`,`Inspect ${card.name}`,x,y,drawW,ch,()=>this.state!.inspect(card));});
    if(fresh&&!this.state!.reduced){
      for(let i=0;i<12;i++){const coin=new Graphics().circle(0,0,5+i%3).fill(i%2?0xb7f3ff:0xffffff).stroke({color:0x3883ba,width:2});coin.position.set(w/2,124);this.root.addChild(coin);const angle=(i/12)*Math.PI*2;const distance=55+(i%4)*18;this.moneyAnimations.push(gsap.to(coin,{x:w/2+Math.cos(angle)*distance,y:124+Math.sin(angle)*distance,alpha:0,rotation:3,duration:.8,delay:i*.025,ease:'power2.out',onUpdate:()=>this.stage.draw(),onComplete:()=>coin.destroy()}));}
    }
    this.button('result-collection','View collection',w/2-151,h-68,140,42,()=>this.state!.action('collection'),{visibleLabel:'Collection'});this.button('result-continue','Continue',w/2+1,h-68,150,42,()=>this.state!.action('continue'),{primary:true});
  }
  destroy(){this.railTween?.kill();this.cancelRailDrag();const canvas=this.stage.app.canvas;canvas.removeEventListener('pointerdown',this.railDown);canvas.removeEventListener('pointermove',this.railMove);canvas.removeEventListener('pointerup',this.railUp);canvas.removeEventListener('pointercancel',this.railCancel);canvas.removeEventListener('wheel',this.railWheel);this.moneyAnimations.forEach(t=>t.kill());this.destroyed=true;++this.generation;window.removeEventListener('keydown',this.keydown);this.stage.onLayout=null;this.root.destroy({children:true});this.thumbs.forEach(t=>t.destroy(true));this.thumbs.clear();this.pending.clear();this.tray.destroy(true);BitmapFont.uninstall('LegendsMoney');}
}
