import {juiceTextures} from '../../src/game/WinJuice';
import {juiceUp,TIER_PALETTE} from '../../src/game/winJuiceMotion';
import {Container,Graphics,Sprite} from 'pixi.js';
import {WIN_STAGES,winState} from './winTimeline';
import {coinFlight,digitLock,HERO,heldAge,heroState,letterSlam,LOCK_COINS,multiplierFlight,reelDigits,rewardMotion,ribbonState,RIBBON,tierLevel,windup} from './rewardMotion';
import {blend,caption,clamp,CREAM,CREAM_SHADE,display,fillPoly,GOLD,GOLD_LIGHT,GOLD_SHADE,hairline,INK,lozenge,mix,out,perimeter,RED,RED_LIGHT,RED_SHADE,RIM,slice,smooth,softBar,STEEL,STEEL_LIGHT,STEEL_SHADE,strokeRun,tray,WELL} from './rewardKit';
export interface RewardProfile{bet:number;multiplier:number;}
const PLACES=6,TITLES={reward:'CAPTURE REWARD',big:'BIG WIN',mega:'MEGA WIN',epic:'EPIC WIN',legendary:'LEGENDARY WIN'};
// Tier plates, cel-shaded: face, lit band, lip, lettering.
const TIER_PLATE={reward:[STEEL,STEEL_LIGHT,STEEL_SHADE,0xf5ead0],big:[0x2f8fe0,0x66b8ff,0x1c5fa3,0xffffff],mega:[RED,RED_LIGHT,RED_SHADE,0xfff3d2],epic:[0x8a4fe0,0xb388ff,0x5a2aa6,0xfff0ff],legendary:[GOLD,GOLD_LIGHT,GOLD_SHADE,0xfffbe6]} as const;
/** Where the tray stands. */
export function plateBox(w:number,h:number,portrait:boolean){return portrait?{x:w*.5,y:h*.815,width:w*.86,height:h*.245}:{x:w*.73,y:h*.5,width:w*.39,height:h*.34};}
/** Where the award goes when it leaves the tray on the final lock: the title, the hero total under it, and the card beside or above them. */
export function heroLayout(w:number,h:number,portrait:boolean){return portrait?{cardX:w*.5,cardY:h*.357,cardScale:.9,x:w*.5,width:w*.82,titleY:h*.648,totalY:h*.8,captionY:h*.932}:{cardX:w*.245,cardY:h*.52,cardScale:1.03,x:w*.68,width:w*.5,titleY:h*.3,totalY:h*.56,captionY:h*.745};}
/** The prize tray, in the receiver's family of shapes: a red shoulder carrying the bet chip and the multiplier's socket, a cream
 * body that is nearly all reel window, a steel ledge that keeps the coins. The tier plate is mounted on its top edge.
 * On the final lock the plate and the total leave it for the hero layout, and come back when the award settles. */
export function createRewardCounter(profile:RewardProfile){
 const container=new Container(),trayRoot=new Container(),plate=new Container(),shadow=new Sprite(softBar()),body=new Graphics(),warmth=new Sprite(softBar()),glass=new Graphics(),rim=new Graphics(),feed=new Sprite(hairline()),sweepBar=new Sprite(hairline());
 const coinsBack=new Container(),coinsFront=new Container(),chip=new Container(),chipPlate=new Graphics(),chipValue=display(`BET $${profile.bet.toFixed(2)}`,24,0xfff6dc,STEEL_SHADE);
 const token=new Container(),tokenPlate=new Graphics(),tokenText=display(`×${profile.multiplier}`,26,0xfffbe6,GOLD_SHADE);
 const ribbon=new Container(),ribbonPlate=new Graphics(),ribbonText=display('',30),ribbonShine=display('',30,0xffffff,0xffffff);
 const reels=new Container(),reelGlow=new Sprite(softBar()),title=new Container(),confirmed=caption('BONUS AWARDED',16,GOLD_LIGHT,4);
 confirmed.style.stroke={color:INK,width:4,join:'round'};
 shadow.anchor.set(.5);shadow.tint=0x020812;for(const s of [warmth,feed,sweepBar,reelGlow]){s.anchor.set(.5);s.blendMode='add';}ribbonShine.blendMode='add';ribbonShine.style.stroke={color:0xffffff,width:0};ribbonShine.style.dropShadow=false;
 chip.addChild(chipPlate,chipValue);token.addChild(tokenPlate,tokenText);ribbon.addChild(ribbonPlate,ribbonText,ribbonShine);
 const lit=(text:string,size:number,fill:number,edge:number)=>{const d=display(text,size,fill,edge),light=display(text,size,0xffffff,0xffffff);light.style.stroke={color:0xffffff,width:0};light.style.dropShadow=false;light.blendMode='add';light.alpha=0;return{d,light};};
 // Two drums' worth of glyphs per place: the digit showing and the one rolling in, each with a light copy for flashes and sweeps.
 const slot=()=>[0,1].map(()=>{const g=lit('0',90,0xfff3c8,GOLD_SHADE);reels.addChild(g.d,g.light);return g;});
 const dollars=Array.from({length:PLACES},slot),sign=slot(),comma=slot(),point=slot(),cents=[slot(),slot()];
 const heroText=TITLES[RIBBON[WIN_STAGES.length]],letters=[...heroText].map(char=>{const g=lit(char,96,0xffe27a,GOLD_SHADE);title.addChild(g.d,g.light);return g;});
 const coins=LOCK_COINS.flatMap((count,stage)=>Array.from({length:count},(_,j)=>{const sprite=new Sprite(juiceTextures().coins[0]);sprite.anchor.set(.5);sprite.visible=false;return{sprite,stage,j,seed:stage*31+j*7+3};}));
 const glints=[0,1,2].map(()=>{const s=new Sprite(juiceTextures().star);s.anchor.set(.5);s.blendMode='add';s.visible=false;return s;});
 plate.addChild(body,warmth,glass,sweepBar,feed,rim,chip,token);trayRoot.addChild(shadow,coinsBack,plate,coinsFront,...glints);container.addChild(trayRoot,reelGlow,reels,ribbon,title,confirmed);
 let drawn='',edge:number[]=[],shown=-1;
 const geometry=(W:number,H:number)=>{const shoulder=H*.25,ledge=H*.13;return{shoulder,ledge,wellW:W*.9,wellH:H*.5,wellY:-H/2+shoulder+(H-shoulder-ledge)/2,sideW:W*.21,sideH:H*.17,sideY:-H/2+shoulder/2+1,chipX:-W*.375,socketX:W*.375,ribbonW:W*.5,ribbonH:H*.25,ribbonY:-H/2-H*.25*.32};};
 function build(W:number,H:number){
  const g=geometry(W,H),cut=H*.16,yA=-H/2+g.shoulder,yB=H/2-g.ledge,w2=W/2,h2=H/2,outline=tray(W,H,cut);edge=perimeter(outline,5);
  body.clear();fillPoly(body,outline,CREAM,INK,0);
  // Red shoulder with a lit band, cream body with a shaded foot, steel ledge with a darker lip: three flat tones each, like a cel.
  body.poly([-w2+cut,-h2,w2-cut,-h2,w2,-h2+cut,w2,yA,-w2,yA,-w2,-h2+cut]).fill(RED).poly([-w2+cut+4,-h2+5,w2-cut-4,-h2+5,w2-cut*.5,-h2+H*.07,-w2+cut*.5,-h2+H*.07]).fill(RED_LIGHT).rect(-w2,yA-H*.03,W,H*.03).fill(RED_SHADE);
  body.rect(-w2,yB-H*.035,W,H*.035).fill(CREAM_SHADE);
  body.poly([-w2,yB,w2,yB,w2,h2-cut,w2-cut,h2,-w2+cut,h2,-w2,h2-cut]).fill(STEEL).rect(-w2,yB,W,H*.035).fill(STEEL_LIGHT).poly([-w2+cut*.5,h2-H*.045,w2-cut*.5,h2-H*.045,w2-cut,h2,-w2+cut,h2]).fill(STEEL_SHADE);
  body.moveTo(-w2,yA).lineTo(w2,yA).stroke({color:INK,width:3.5}).moveTo(-w2,yB).lineTo(w2,yB).stroke({color:INK,width:3.5}).poly(outline).stroke({color:INK,width:6,join:'round'});
  // The reel window: a dark well with a steel rim, set into the body.
  const r=g.wellH*.16;body.roundRect(-g.wellW/2-7,g.wellY-g.wellH/2-7,g.wellW+14,g.wellH+14,r+7).fill(INK).roundRect(-g.wellW/2-4,g.wellY-g.wellH/2-4,g.wellW+8,g.wellH+8,r+4).fill(RIM).roundRect(-g.wellW/2-4,g.wellY-g.wellH/2-4,g.wellW+8,(g.wellH+8)*.5,r+4).fill({color:0xe7edf3,alpha:.55}).roundRect(-g.wellW/2,g.wellY-g.wellH/2,g.wellW,g.wellH,r).fill(WELL).stroke({color:INK,width:2.5});
  // The socket the multiplier seats in: the same well, cut to the token's shape, on the shoulder.
  const at=(points:number[],x:number)=>points.map((v,i)=>v+(i%2?g.sideY:x)),cutS=g.sideH*.42;
  body.poly(at(lozenge(g.sideW+10,g.sideH+10,cutS+4),g.socketX)).fill(INK).poly(at(lozenge(g.sideW+5,g.sideH+5,cutS+2),g.socketX)).fill(RIM).poly(at(lozenge(g.sideW,g.sideH,cutS),g.socketX)).fill(WELL).poly(at(lozenge(g.sideW,g.sideH,cutS),g.socketX)).stroke({color:INK,width:2.5,join:'round'});
  glass.clear().roundRect(-g.wellW/2+3,g.wellY-g.wellH/2+3,g.wellW-6,g.wellH*.24,r*.8).fill({color:0x000308,alpha:.5}).roundRect(-g.wellW/2+8,g.wellY+g.wellH/2-8,g.wellW-16,3,1.5).fill({color:0x9fd6ff,alpha:.22});
  chipPlate.clear().poly(lozenge(g.sideW+6,g.sideH+6,cutS+2)).fill(INK).poly(lozenge(g.sideW,g.sideH,cutS)).fill(STEEL).poly(slice(g.sideW,g.sideH,cutS,-g.sideH*.4,-g.sideH*.12)).fill(STEEL_LIGHT).poly(slice(g.sideW,g.sideH,cutS,g.sideH*.3,g.sideH*.5,2)).fill(STEEL_SHADE);
  tokenPlate.clear().poly(lozenge(g.sideW-2,g.sideH-2,cutS)).fill(GOLD).poly(slice(g.sideW-2,g.sideH-2,cutS,-g.sideH*.4,-g.sideH*.12)).fill(GOLD_LIGHT).poly(slice(g.sideW-2,g.sideH-2,cutS,g.sideH*.3,g.sideH*.5,2)).fill(GOLD_SHADE).poly(lozenge(g.sideW-2,g.sideH-2,cutS)).stroke({color:INK,width:3.5,join:'round'});
  chipValue.style.fontSize=Math.min(g.sideH*.56,(g.sideW-g.sideH*.6)/(chipValue.text.length*.44));chipValue.position.set(0,-g.sideH*.04);tokenText.style.fontSize=Math.min(g.sideH*.62,(g.sideW-g.sideH*.6)/(tokenText.text.length*.5));tokenText.position.set(0,-g.sideH*.03);
 }
 function drawRibbon(name:keyof typeof TIER_PLATE,W:number,H:number){const [face,light,lip,ink]=TIER_PLATE[name];ribbonPlate.clear();fillPoly(ribbonPlate,lozenge(W+8,H+8,H*.5+3).map((v,i)=>i%2?v+5:v),INK,INK,0,.55);
  ribbonPlate.poly(lozenge(W,H,H*.5)).fill(face).poly(slice(W,H,H*.5,-H*.4,-H*.1)).fill(light).poly(slice(W,H,H*.5,H*.3,H*.5,2)).fill(lip).poly(lozenge(W,H,H*.5)).stroke({color:INK,width:5,join:'round'});
  ribbonText.text=ribbonShine.text=TITLES[name];ribbonText.style.fill=ink;ribbonText.style.dropShadow={color:lip,alpha:1,blur:0,distance:Math.max(3,H*.09),angle:Math.PI/2};}
 /** Where the multiplier seats, in the coordinates of this counter's parent. */
 function socket(w:number,h:number,portrait:boolean){const box=plateBox(w,h,portrait),g=geometry(box.width,box.height);return{x:box.x+g.socketX,y:box.y+g.sideY,width:g.sideW,height:g.sideH};}
 function sample(rawAge:number,w:number,h:number,portrait:boolean,settleAt:number){
  const age=heldAge(rawAge),box=plateBox(w,h,portrait),W=box.width,H=box.height,g=geometry(W,H),motion=rewardMotion(age),enter=out((rawAge-.62)/.42),flight=multiplierFlight(rawAge),tier=ribbonState(age),lv=tierLevel(age),hero=heroState(rawAge,settleAt),place=heroLayout(w,h,portrait),drain=windup(rawAge),k=hero.out,last=WIN_STAGES.length;
  container.visible=rawAge>=.62;if(!container.visible)return;
  const key=`${Math.round(W)}:${Math.round(H)}`;if(key!==drawn){drawn=key;shown=-1;build(W,H);}
  // The tray comes up from below and seats. Every lock lands on it harder than the last: it jumps, shakes sideways and rings out.
  const strike=flight.docked?flight.strike:0,punch=motion.punch+strike*.6,shake=lv.level&&lv.since<.5?Math.sin(lv.since*58)*Math.exp(-lv.since*9)*(2+9*lv.power)*H/235:0,tremble=drain*Math.sin(rawAge*49)*H*.007;
  container.position.set(box.x,box.y+(1-enter)*H*.9);container.alpha=smooth((rawAge-.62)/.14);
  // On the final lock it drops out of frame under the award, and rises again when the award comes home.
  trayRoot.y=k*(h-(box.y-H/2)+H*.5);trayRoot.alpha=1-smooth(k/.45);
  plate.position.set(shake+tremble,-H*(.03+.035*lv.power)*Math.max(0,punch));plate.rotation=.009*punch*(motion.tier%2?1:-1)*(1+lv.power);plate.scale.set(1+(.03+.03*lv.power)*punch,(1-.05*motion.anticipation)*(1+(.05+.05*lv.power)*punch));
  shadow.position.set(0,H*.56-plate.y*.6);shadow.width=W*1.16;shadow.height=H*.5*(1+.3*Math.max(0,punch));shadow.alpha=.55-.12*Math.max(0,punch);
  // Bet chip and multiplier on the shoulder: the token is absent until it lands in its socket, then pumps with every lock.
  chip.position.set(g.chipX,g.sideY);chip.scale.set(flight.docked?juiceUp(flight.since,.3,.05).scale:1);
  token.visible=flight.docked;token.position.set(g.socketX,g.sideY);if(flight.docked){const seat=juiceUp(flight.since,.5,.06),pump=motion.hitAge>=0?juiceUp(motion.hitAge,.3,.03):{scale:1,rotation:0};token.scale.set(seat.scale*pump.scale*(1+.05*drain*Math.sin(rawAge*30)));token.rotation=seat.rotation+pump.rotation;}
  // While a stage counts, the token feeds light down into the window.
  const stage=WIN_STAGES.find(s=>age>=s.start&&age<s.end),feeding=!!stage&&flight.docked,beat=(age*5.2)%1;
  feed.visible=feeding;if(feeding){feed.position.set(mix(g.socketX,g.wellW*.1,beat),mix(g.sideY+g.sideH*.5,g.wellY-g.wellH/2-2,Math.min(1,beat*2.2)));feed.width=W*.2;feed.height=8;feed.tint=GOLD_LIGHT;feed.alpha=Math.sin(beat*Math.PI)*.95;}
  // Reels. The row is laid out once per frame, then lives either in the window or, after the final lock, hero-sized in the room.
  const dollarsNow=winState(age,profile.multiplier).value*profile.bet,rate=(dollarsNow-winState(age-1/60,profile.multiplier).value*profile.bet)*60,drums=reelDigits(dollarsNow,rate,PLACES),total=profile.multiplier*profile.bet;
  const whole=String(Math.floor(total)).length,font=Math.min(g.wellH*.86,(g.wellW-26)/(.5+whole*.52+(whole>3?.2:0)+.2+.68)),em=font*.52,radius=font*.56,heat=clamp(dollarsNow/total),golden=lv.level===last,fill=golden?0xffe27a:blend(0xfff6dc,0xffe9a6,heat);
  // Only the places that were still turning as the lock arrived roll to a stop; the ones above them were already still.
  const lockEnd=lv.level?WIN_STAGES[lv.level-1].end:0,recent=lv.level?(winState(lockEnd,profile.multiplier).value-winState(lockEnd-.25,profile.multiplier).value)*profile.bet:0;
  const thousands=drums[PLACES-4].appear;let width=font*.5+font*.2+font*.68;drums.forEach((d,i)=>{width+=em*d.appear;if(i===PLACES-4)width+=font*.2*thousands;});
  const heroScale=Math.min(place.width/width,h*.2/font),flying=k>0&&k<1&&!hero.returning;
  reels.position.set(mix(plate.x,place.x-box.x,k),mix(plate.y+g.wellY*plate.scale.y,place.totalY-box.y,k)-(flying?Math.sin(Math.PI*k)*H*.2:0));reels.scale.set(mix(plate.scale.x,heroScale,k),mix(plate.scale.y,heroScale,k));reels.rotation=plate.rotation*(1-k);
  reelGlow.position.copyFrom(reels.position);reelGlow.width=width*reels.scale.x*1.5;reelGlow.height=font*reels.scale.y*2.1;reelGlow.tint=0xffb52e;reelGlow.alpha=k*(.5+.08*Math.sin(rawAge*3));
  // A hairline of light crosses the row after each lock; once the total has landed it returns every couple of seconds.
  const lockAge=motion.hitAge,sweep=lockAge<0?-1:golden&&lockAge>1.2?((lockAge-1.2)%2.2)/.5:(lockAge-.06)/.42;let cursor=-width/2,order=0;
  const put=(glyphs:ReturnType<typeof slot>,x:number,char:string,next:string|null,roll:number,size:number,alpha:number,dy=0,digit=false)=>{
   // On a lock each place stops a beat after the one to its left and slams; on the final lock the slams happen where the total lands.
   const j=order++,landed=hero.active&&!hero.returning?hero.total-j*HERO.digit:-1,lock=lv.level&&!golden?digitLock(lv.since,j,lv.power):{rolling:0,scale:1,lift:0,light:0};
   const settle=landed>=0?{scale:1+.5*Math.exp(-landed*11)*Math.cos(landed*23)*Math.max(0,1-landed/.45),light:Math.max(0,1-landed/.22)}:{scale:lock.scale,light:lock.light},turnBack=digit&&lock.rolling>0?lock.rolling*.85:0;
   const glint=sweep>=0&&sweep<=1?Math.max(0,1-Math.abs((x+width/2)/width-sweep)/.16):0,now=turnBack>0?String((Number(char||'0')+9)%10):char,then=turnBack>0?(char||'0'):next,turn=turnBack>0?1-turnBack:roll;
   glyphs.forEach((glyph,n)=>{const text=n?then:now,on=text!==null&&text!==''&&(n===0||turn>.001);glyph.d.visible=glyph.light.visible=on&&alpha>.01;if(!glyph.d.visible)return;
    // A drum: the showing digit turns up and away, the next comes over the bottom.
    const angle=(n?1-turn:-turn)*1.22,facing=Math.cos(angle);glyph.d.text=glyph.light.text=text!;
    if(glyph.d.style.fontSize!==size){glyph.d.style.fontSize=glyph.light.style.fontSize=size;glyph.d.style.stroke={color:INK,width:Math.max(3,size*.13),join:'round'};glyph.d.style.dropShadow={color:GOLD_SHADE,alpha:1,blur:0,distance:Math.max(2,size*.07),angle:Math.PI/2};}
    glyph.d.style.fill=fill;for(const t of [glyph.d,glyph.light]){t.position.set(x,dy+Math.sin(angle)*radius+lock.lift*font);t.scale.set(settle.scale,Math.max(.05,facing)*settle.scale);}
    glyph.d.alpha=alpha*Math.max(0,facing)**1.4;glyph.light.alpha=alpha*Math.max(0,facing)*Math.min(1,glint*.85+settle.light*.9);});
  };
  put(sign,cursor+font*.25,'$',null,0,font*.8,1,font*.03);cursor+=font*.5;
  drums.forEach((d,i)=>{put(dollars[i],cursor+em*d.appear/2,d.blank?'':String(d.digit),String((d.digit+1)%10),d.roll,font,d.appear*(1-.25*d.spin),0,!d.blank&&10**(PLACES-1-i)<=recent);cursor+=em*d.appear;
   if(i===PLACES-4){put(comma,cursor+font*.1*thousands,thousands>.5?',':'',null,0,font,thousands);cursor+=font*.2*thousands;}});
  put(point,cursor+font*.1,'.',null,0,font,1);cursor+=font*.2;cents.forEach(c=>{put(c,cursor+font*.17,'0',null,0,font*.56,1,font*.15);cursor+=font*.34;});
  // The window warms with the amount and flares on each lock.
  warmth.position.set(0,g.wellY);warmth.width=g.wellW*1.2;warmth.height=g.wellH*1.5;warmth.tint=golden?0xffc24a:0xff9b3c;warmth.alpha=(.1+.3*heat+.45*Math.max(0,Math.exp(-Math.max(0,lockAge)*5))*(motion.tier>=0?1:0))*(1-k);
  sweepBar.visible=sweep>=0&&sweep<=1&&k<.05;if(sweepBar.visible){sweepBar.position.set(-g.wellW/2+g.wellW*sweep,g.wellY);sweepBar.rotation=Math.PI/2-.28;sweepBar.width=g.wellH*1.3;sweepBar.height=g.wellW*.06;sweepBar.alpha=Math.sin(sweep*Math.PI)*.5;sweepBar.tint=0xfff3c8;}
  // Tier plate: turns over to the next tier on the lock and takes the hit. On the final lock it launches up and breaks into the title.
  if(tier.showing!==shown){shown=tier.showing;drawRibbon(RIBBON[tier.showing],g.ribbonW,g.ribbonH);}
  const size=Math.min(g.ribbonH*.66,(g.ribbonW-g.ribbonH)/(ribbonText.text.length*.47));ribbonText.style.fontSize=ribbonShine.style.fontSize=size;ribbonText.position.set(0,-g.ribbonH*.04);ribbonShine.position.copyFrom(ribbonText.position);
  const kick=1+(.14+.14*lv.power)*tier.punch,mountY=trayRoot.y+plate.y+g.ribbonY-g.ribbonH*.12*Math.max(0,tier.punch),titleX=place.x-box.x,titleY=place.titleY-box.y,launch=hero.active&&!hero.returning?out((hero.s-HERO.launch)/(HERO.title-HERO.launch+.05)):0;
  ribbon.visible=!hero.active||launch<1||hero.returning>.5;ribbon.position.set(mix(plate.x,titleX,launch),hero.active&&!hero.returning?mix(g.ribbonY,titleY,launch):mountY);ribbon.scale.set(kick*(1+launch*1.1),kick*tier.flip*(1+launch*1.1));ribbon.rotation=-.018+.02*tier.punch;ribbon.alpha=hero.returning?smooth((hero.returning-.5)/.5):1-smooth((launch-.55)/.45);
  const gleam=((tier.since-.5)*.8)%2.6;ribbonShine.alpha=Math.max(tier.index>0?Math.max(0,1-tier.since/.2)*.8:0,tier.final&&tier.since>.5?Math.max(0,1-Math.abs(gleam-.5)/.2)*.45:0);
  // The hero title: one letter at a time, each arriving large and hitting; then a band of light keeps crossing it.
  title.visible=hero.active&&hero.title>=0&&hero.returning<1;
  if(title.visible){const count=letters.length,advance=(c:string)=>c===' '?.3:.5,units=[...heroText].reduce((n,c)=>n+advance(c),0),letter=Math.min(place.width/(units+.2),h*.125),back=hero.returning;let x=-units*letter/2,rank=0;
   // Going home it shrinks toward where the plate will be, and is gone before the total passes.
   title.position.set(mix(titleX,plate.x,back),mix(titleY,plate.y+g.ribbonY,back));title.scale.set(1-.72*back);title.alpha=1-smooth(back/.35);const lightAt=((hero.title-.75)%1.9)/.55;
   letters.forEach((glyph,i)=>{const char=heroText[i],step=advance(char)*letter,slam=letterSlam(hero.title-rank*HERO.letter),u=(x+step/2+units*letter/2)/(units*letter);if(char===' ')rank+=2;else rank++;
    glyph.d.visible=glyph.light.visible=slam.shown&&char!==' ';if(glyph.d.visible){if(glyph.d.style.fontSize!==letter){glyph.d.style.fontSize=glyph.light.style.fontSize=letter;glyph.d.style.stroke={color:INK,width:Math.max(4,letter*.14),join:'round'};glyph.d.style.dropShadow={color:GOLD_SHADE,alpha:1,blur:0,distance:Math.max(3,letter*.1),angle:Math.PI/2};}
     const bob=Math.sin(rawAge*2.3+i*.55)*letter*.018*smooth((hero.title-.9)/.4);for(const t of [glyph.d,glyph.light]){t.position.set(x+step/2,-slam.drop*letter*.55+bob);t.scale.set(slam.scale);t.rotation=(i-count/2)*.004-slam.drop*.12;}
     glyph.light.alpha=Math.max(slam.light*.95,hero.title>.75&&lightAt<=1?Math.max(0,1-Math.abs(u-lightAt)/.14)*.7:0);}
    x+=step;});}
  // The last lock leaves gold on the tray's edge; earlier locks light it in their tier's colour for a moment.
  rim.clear();const top=W-2*H*.16,path=edge.length/2,from=(W/2+g.socketX-H*.16)/Math.max(1,top)*(top/(path*5));
  if(motion.final){const run=smooth(motion.hitAge/.42);strokeRun(rim,edge,from-.5*run,from+.5*run,GOLD,7);strokeRun(rim,edge,from-.5*run,from+.5*run,GOLD_LIGHT,2.5);}
  else if(motion.tier>=0&&motion.hitAge<.45){const glow=TIER_PALETTE[RIBBON[motion.tier+1] as 'big'].glow,fade=(1-motion.hitAge/.45)**2;strokeRun(rim,edge,0,1,glow,5+4*lv.power,fade*.9);strokeRun(rim,edge,0,1,0xffffff,1.6,fade);}
  // Coins leave from the tray's ends, more with every tier, land on its ledge and stay.
  const size0=H*.2;for(const coin of coins){const since=age-WIN_STAGES[coin.stage].end-.03-coin.j*(.5/Math.max(8,LOCK_COINS[coin.stage])),f=coinFlight(since,coin.seed);coin.sprite.visible=!!f;if(!f)continue;
   const layer=f.rising?coinsBack:coinsFront;if(coin.sprite.parent!==layer)layer.addChild(coin.sprite);const frame=Math.floor(((f.spin/Math.PI)%1+1)%1*8)%8;coin.sprite.texture=juiceTextures().coins[f.resting?0:frame];
   coin.sprite.position.set(f.x*(W/2-size0*.3),f.y*H+plate.y*(f.rising?0:1));coin.sprite.scale.set(size0/64,size0/64*(f.resting?.5:1));}
  // Settled gold keeps catching the light: a glint walks from coin to coin.
  glints.forEach((glint,i)=>{const clock=(motion.hitAge-.9-i*.37)/.55,turn=Math.floor(clock),u=clock-turn,coin=coins[(Math.abs(turn)*7+i*11)%coins.length];glint.visible=motion.final&&clock>=0&&coin.sprite.visible;if(!glint.visible)return;glint.position.set(coin.sprite.x,coin.sprite.y-size0*.12);glint.scale.set(size0*.9*Math.sin(u*Math.PI)/128);glint.rotation=u*.8;glint.alpha=Math.sin(u*Math.PI)*.9;glint.tint=0xfff3c8;});
  // BONUS AWARDED sits under the tray, or under the hero total while the award is out.
  const small=Math.max(11,h*(portrait?.0165:.021));confirmed.style.fontSize=small*(1+.3*k);confirmed.position.set(mix(0,place.x-box.x,k),mix(H/2+H*.098,place.captionY-box.y,k));// It is never seen in between the two places.
  confirmed.alpha=(motion.final?out((motion.hitAge-1.05)/.3):0)*(1-Math.min(1,4*k*(1-k)*1.6));
 }
 return{container,sample,socket,setGuideVisible(visible:boolean){confirmed.visible=!visible;}};
}
