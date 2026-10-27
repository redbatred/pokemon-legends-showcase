import { Assets, Container, Graphics, Sprite, Text, Texture, Rectangle, BitmapFont, BitmapText } from 'pixi.js';
import { gsap } from 'gsap';
import { playSound } from './audio';
import { gameLayout, pageWindow } from './rendering';
import { money, type Card, type Pack, type Save, type Result } from './model';
import type { OpeningStage } from './Stage';

export type Panel = 'collection'|'settings'|'history'|'about'|null;
export type GameAction = 'open'|'tear'|'next'|'all'|'continue'|'close'|'collection'|'settings'|'history'|'about'|'credits'|'sound'|'reduced'|'low'|'reset'|'export'|'retry'|'dismiss'|'fullscreen';
export interface UIState {phase:string;index:number;save:Save|null;packs:Pack[];selected:Pack;pool:Card[];cards:Card[];ready:boolean;error:string;toast:string;panel:Panel;inspected:Card|null;result?:Result;sound:boolean;reduced:boolean;low:boolean;action:(action:GameAction)=>void;select:(pack:Pack)=>void;inspect:(card:Card)=>void}
export interface HitTarget {id:string;label:string;x:number;y:number;width:number;height:number;disabled:boolean;action:()=>void}
const C={ink:0x092846,panel:0x183e60,raised:0x235781,line:0x5484a8,cyan:0x9aeeff,white:0xf3fbff,muted:0xa3c2d9,blue:0x246ec1};

/** Pixi draws every visible control. Transparent DOM targets provide keyboard/screen-reader access only. */
export class CanvasUI {
  root=new Container(); private focus=new Graphics();private state:UIState|null=null;
  private tray:Texture;
  private moneyAnimations:gsap.core.Tween[]=[];private moneyValues=new Map<string,{identity:string,value:number}>();
  private updating=false;
  private generation=0;private hits:HitTarget[]=[];private paints=new Map<string,Container>();
  private page=0;private packStart=0;private collected=false;private zoom=false;private lastInspected='';
  private thumbs=new Map<string,Texture>();private pending=new Map<string,Promise<Texture>>();private destroyed=false;
  constructor(private stage:OpeningStage,private onTargets:(hits:HitTarget[],summary:string)=>void){
    BitmapFont.install({name:'LegendsMoney',style:{fontFamily:'Nunito',fontSize:48,fontWeight:'900',fill:0xffffff},chars:'0123456789$.,+- ',resolution:2,padding:3,skipKerning:true});
    const canvas=document.createElement('canvas');canvas.width=8;canvas.height=128;const ctx=canvas.getContext('2d')!;const gradient=ctx.createLinearGradient(0,0,0,128);gradient.addColorStop(0,'rgba(4,14,29,0)');gradient.addColorStop(1,'rgba(4,14,29,.65)');ctx.fillStyle=gradient;ctx.fillRect(0,0,8,128);this.tray=Texture.from(canvas);
    stage.app.stage.addChild(this.root);stage.onLayout=()=>{if(!this.updating)this.build();};
    window.addEventListener('keydown',this.keydown);
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
    ++this.generation;this.moneyAnimations.forEach(t=>t.kill());this.moneyAnimations=[];this.hits=[];this.paints.clear();this.focus.clear();
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
    this.onTargets([...this.hits],s.inspected?`Viewing ${s.inspected.name}`:s.panel?`${s.panel} screen`:`${s.selected.name}. ${s.phase}. Balance ${money(s.save?.balance??10000)}. ${s.phase==='revealed'?s.save?.active?.cards[s.index]?.name??'':''}`);
    // Keep thumbnail memory bounded. A screen uses fewer than 24; oldest pages can be discarded.
    while(this.thumbs.size>72){const key=this.thumbs.keys().next().value!;const texture=this.thumbs.get(key)!;this.thumbs.delete(key);texture.destroy(true);}
  }
  private hud(w:number,h:number){
    const s=this.state!,l=gameLayout(w,h,!['browse','complete'].includes(s.phase));
    const bar=new Graphics().roundRect(12,10,w-24,l.portrait?51:56,17).fill({color:0x07294c,alpha:.9}).stroke({width:1.5,color:0xa6dcf2,alpha:.42});this.root.addChild(bar);
    this.picture('/assets/pokemon-logo.png',25,17,l.portrait?93:115,37);this.text('LEGENDS',l.portrait?71:82,51,7,0xd7eeff,this.root,'center','bold');
    if(l.portrait&&!l.compact){this.button('packs','Pack opening',22,69,112,28,()=>s.action('close'),{active:true,small:true,visibleLabel:'Open packs'});this.button('binder','My collection',142,69,120,28,()=>s.action('collection'),{small:true,visibleLabel:'Collection'});}
    else if(l.compact&&l.portrait){this.button('binder','My collection',140,23,114,31,()=>s.action('collection'),{visibleLabel:'Collection'});}
    else {this.button('packs','Pack opening',171,23,118,31,()=>s.action('close'),{active:true,visibleLabel:'Open packs'});this.button('binder','My collection',300,23,130,31,()=>s.action('collection'),{visibleLabel:'Collection'});}
    const walletRight=w-(l.portrait?87:135);
    this.text('Demo credits',walletRight,16,9,C.muted,this.root,'right');
    this.money(s.save?.balance??10000,walletRight,29,l.portrait?22:25,C.white,'right','wallet','balance');
    this.button('credits','Add 1000 free demo credits',w-(l.portrait?75:121),24,28,28,()=>s.action('credits'),{visibleLabel:'+'});
    this.button('settings','Settings',w-42,24,27,28,()=>s.action('settings'),{visibleLabel:'☰'});
    if(!l.portrait)this.button('sound',s.sound?'Mute sound':'Enable sound',w-82,24,28,28,()=>s.action('sound'),{visibleLabel:s.sound?'♪':'♩'});
    if(!l.compact){this.text(s.selected.name,25,l.top+12,12,C.white,this.root,'left','bold');
      if(s.save?.active)this.text(`${Math.min(s.index+(s.phase==='revealed'?1:0),11)} / 11`,w-25,l.top+12,12,C.white,this.root,'right','bold');}
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
    const count=Math.max(2,Math.min(6,Math.floor((w-76)/(l.portrait?130:154))));
    this.packStart=Math.max(0,Math.min(this.packStart,s.packs.length-count));
    this.button('pack-prev','Previous packs',14,y+l.dock/2-20,27,42,()=>{this.packStart=Math.max(0,this.packStart-count);this.build();},{disabled:this.packStart===0,visibleLabel:'‹'});
    this.button('pack-next','Next packs',w-41,y+l.dock/2-20,27,42,()=>{this.packStart+=count;this.build();},{disabled:this.packStart+count>=s.packs.length,visibleLabel:'›'});
    const width=Math.min(176,(w-100)/count),start=(w-width*count)/2,artHeight=l.compact?65:l.portrait?100:124;
    s.packs.slice(this.packStart,this.packStart+count).forEach((pack,i)=>{
      const x=start+i*width,selected=pack.id===s.selected.id,group=new Container();this.root.addChild(group);this.paints.set(`pack-${pack.id}`,group);
      const base=new Graphics().ellipse(x+width/2,y+artHeight-4,width*.3,8).fill({color:selected?0x8ce9ff:0x061d35,alpha:selected?.35:.5});group.addChild(base);
      if(selected){const glow=new Graphics().roundRect(x+width/2-43,y-4,86,artHeight+12,17).fill({color:0x69c5ee,alpha:.14});group.addChild(glow);}
      this.picture(pack.packImage,x+width/2-36,y-2,72,artHeight,group);
      this.text(pack.name,x+width/2,y+artHeight+6,l.compact?10:12,selected?C.white:0xd4e7f6,group,'center','bold',width-10);
      const pillY=y+l.dock-(l.compact?32:40);
      const pill=new Graphics().roundRect(x+width/2-45,pillY,90,29,14).fill({color:selected?0xc5f6ff:0x173f65,alpha:.96}).stroke({color:selected?0xffffff:0x6596b7,width:1.2});group.addChild(pill);
      const price=new BitmapText({text:money(pack.price),style:{fontFamily:'LegendsMoney',fontSize:l.portrait?18:20}});price.anchor.set(.5,0);price.position.set(x+width/2,pillY+3);price.tint=selected?0x123959:C.white;group.addChild(price);
      if(selected){const dot=new Graphics().circle(x+width/2-52,pillY+14,3).fill(C.cyan);group.addChild(dot);}
      this.hit(`pack-${pack.id}`,`${pack.name}, ${money(pack.price)}`,x+4,y-3,width-8,l.dock-9,()=>s.select(pack));
    });
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
  destroy(){this.moneyAnimations.forEach(t=>t.kill());this.destroyed=true;++this.generation;window.removeEventListener('keydown',this.keydown);this.stage.onLayout=null;this.root.destroy({children:true});this.thumbs.forEach(t=>t.destroy(true));this.thumbs.clear();this.pending.clear();this.tray.destroy(true);BitmapFont.uninstall('LegendsMoney');}
}
