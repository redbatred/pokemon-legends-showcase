import {createAnimatedBonusBadge,createBonusToken,claimBonusBall,bonusBallTexture} from './BonusSymbolArtwork';
import {Container,Graphics,Text,Sprite,Texture,type Application} from 'pixi.js';
import {gsap} from 'gsap';
import {Quaternion,Vector3} from 'three';
import {playSound,type Sound} from '../audio';
import {RevealJuice} from '../RevealJuice';
import {PokeBall3D} from '../PokeBall3D';
import {juiceTextures} from '../WinJuice';
import {BADGE_BALL,bonusFlightPose,bonusSeatPose} from './bonusBallMotion';
import {showdownSocketsLayout,showdownReceiverLayout} from './showdownSymbolsLayout';
import './showdownSymbols.css';
export const showdownSymbolSvg='<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="29" fill="#123e66" stroke="#a2efff" stroke-width="3"/><path d="M5 31a27 27 0 0 1 54 0Z" fill="#3b94cb"/><path d="M5 32h54" stroke="#071e37" stroke-width="7"/><circle cx="32" cy="32" r="12" fill="#effcff" stroke="#071e37" stroke-width="5"/><path d="m32 22 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" fill="#287eb5"/></svg>';
/** A bonus card's mark; the symbol belongs to the pack, not the card's cash value. Animated, the ball lands on the card first. */
export function createShowdownBadge(animated=false){return createAnimatedBonusBadge(animated);}
const INK=0x0b1626,STEEL=0xa9b4c0,GOLD=0xffd76a,CYAN=0x8fe3ff,TUMBLE=new Vector3(.82,.35,.46).normalize();
const display=(value:string,size:number,fill=0xfff4d9)=>{const text=new Text({text:value,style:{fontFamily:'BattleDisplay, Nunito, Arial',fontWeight:'400',fontSize:size,letterSpacing:1,fill,stroke:{color:0x061b32,width:4},dropShadow:{color:0x061b32,alpha:.9,blur:0,distance:2,angle:Math.PI/2}},resolution:3});text.anchor.set(.5);return text;};
const caption=(value:string,size:number,fill=0xc9d6e0)=>{const text=new Text({text:value,style:{fontFamily:'Nunito',fontWeight:'900',fontSize:size,letterSpacing:1.4,fill,stroke:{color:0x12344e,width:2.5}},resolution:3});text.anchor.set(.5);return text;};
const smooth=(n:number)=>{const p=Math.max(0,Math.min(1,n));return p*p*(3-2*p);};
/** An open arc on its own: a path that follows a fill would otherwise be joined to it by a line. */
const arc=(g:Graphics,x:number,y:number,radius:number,from:number,to:number)=>g.moveTo(x+Math.cos(from)*radius,y+Math.sin(from)*radius).arc(x,y,radius,from,to);
type Seat={root:Container;shadow:Sprite;well:Graphics;glow:Sprite;ball:Container;rim:Graphics};
/** Everything the bonus balls do in the pack, drawn in the game canvas. There is no panel: three small seats are set into the
 * pedestal's lip, and they are not there at all until this pack's first bonus ball arrives. Each ball is carried from its
 * card to its seat in 3D; the count is stamped beside the seats for a moment; the third seat sends all three to the receiver. */
export class ShowdownSymbolsView {
 private hud=new Container();private status=document.createElement('p');private seatsView:Seat[];private stampText=display('',20);private stampShine=display('',20,0xffffff);
 private slots:Container[];private seats=[-1,-1,-1];private device=showdownSocketsLayout(720,960);
 private seen=new Set<number>();private collected=new Set<number>();private flights=new Set<Container>();private positions:number[]=[];private id='';private animations=new Set<gsap.core.Animation>();private overlay:Container|null=null;private dead=false;private active=false;private blocked=false;
 private juice:RevealJuice|null=null;private clock=0;private stamp=-1;
 /** When the seats were called up for this pack (seconds); negative until its first bonus ball. */
 private summoned=-1;
 /** Seats whose ball has been counted but is still on its way. */
 private pending=new Set<number>();
 /** While the rest of the pack is laid out over the pedestal, the seats stand on the floor under the cards instead. */
 private group=false;private arranged=false;private movedFrom:{x:number;y:number}[]|null=null;private movedAt=0;
 /** The stage layer the cards are drawn in. The seats belong to the scene, so they are drawn under the cards: above this layer when it is the pedestal's own, below it otherwise. */
 private cardLayer:Container|null=null;private underLayer=false;
 private receiverCleanup:(()=>void)|null=null;private width=0;private height=0;private painted=-1;
 private visibility=()=>{for(const animation of this.animations)document.hidden?animation.pause():animation.resume();};
 constructor(private host:HTMLElement,private reduced:()=>boolean,private app:Application){
  const dot=juiceTextures().dot,sprite=(tint:number,add:boolean)=>{const s=new Sprite(dot);s.anchor.set(.5);s.tint=tint;if(add)s.blendMode='add';s.alpha=0;return s;};
  this.seatsView=[0,1,2].map(()=>{const seat:Seat={root:new Container(),shadow:sprite(0x020a14,false),well:new Graphics(),glow:sprite(CYAN,true),ball:new Container(),rim:new Graphics()};seat.root.addChild(seat.shadow,seat.well,seat.glow,seat.ball,seat.rim);return seat;});
  this.slots=this.seatsView.map(seat=>seat.ball);this.stampShine.blendMode='add';this.stampText.alpha=this.stampShine.alpha=0;
  this.hud.eventMode='none';this.hud.visible=false;this.hud.addChild(...this.seatsView.map(seat=>seat.root),this.stampText,this.stampShine);this.app.stage.addChild(this.hud);
  this.status.className='showdown-symbol-accessibility';this.status.setAttribute('role','status');this.status.setAttribute('aria-live','polite');this.status.setAttribute('aria-atomic','true');host.append(this.status);document.addEventListener('visibilitychange',this.visibility);gsap.ticker.add(this.layout);this.layout();
 }
 /** Light for the seats: made on first use, advanced on the animation clock, kept either side of them in depth. */
 private light(){if(!this.juice){this.juice=new RevealJuice(false);this.juice.back.eventMode=this.juice.front.eventMode='none';}this.juice.scale=Math.min(this.app.screen.width,this.app.screen.height)/640;return this.juice;}
 /** The seats show only while the pack is in play, nothing covers it, and a bonus ball has turned up. */
 private sync(){this.hud.visible=this.active&&!this.blocked&&this.summoned>=0;}
 private layout=()=>{
  if(this.dead||document.hidden)return;
  const now=performance.now(),step=Math.min(.05,Math.max(0,(now-this.clock)/1000)),time=now/1000;this.clock=now;this.juice?.update(step);if(this.juice)this.juice.back.visible=this.juice.front.visible=!this.blocked||!!this.overlay;
  const {width:w,height:h}=this.app.screen;
  if(w!==this.width||h!==this.height||this.group!==this.arranged){
   // Moving to the floor under a laid-out pack, seats that are already up slide there instead of jumping.
   const sliding=this.group!==this.arranged&&w===this.width&&h===this.height&&this.summoned>=0&&time-this.summoned>.4;this.movedFrom=sliding?this.device.sockets.map(socket=>({...socket})):null;this.movedAt=time;
   this.width=w;this.height=h;this.arranged=this.group;this.painted=-1;const d=this.device=showdownSocketsLayout(w,h,this.group),r=d.radius;
   this.seatsView.forEach((seat,i)=>{
    seat.root.position.copyFrom(d.sockets[i]);
    // A seat has depth and no backing: a contact shadow on whatever it is set into, a steel collar, and a dark well.
    seat.shadow.position.set(0,r*.42);seat.shadow.width=r*3.3;seat.shadow.height=r*1.9;
    const g=seat.well.clear();g.circle(0,0,r+2).fill(INK);g.circle(0,0,r+.6).fill(STEEL);arc(g,0,0,r-.3,Math.PI*1.08,Math.PI*1.62).stroke({color:0xffffff,width:1.3,alpha:.75});
    g.circle(0,0,r-2).fill(INK);g.circle(0,0,r-2.9).fill(0x121a28);arc(g,0,1,r-4.4,Math.PI*1.12,Math.PI*1.88).stroke({color:0x04070d,width:2.2,alpha:.9});
    seat.ball.removeChildren().forEach(child=>child.destroy());seat.ball.addChild(createBonusToken(r*.82));seat.glow.width=seat.glow.height=r*4.6;
   });
   for(const text of [this.stampText,this.stampShine]){text.style.fontSize=d.stamp.size;text.anchor.set(d.stamp.align==='left'?0:d.stamp.align==='right'?1:.5,.5);text.position.set(d.stamp.x,d.stamp.y);}
  }
  this.dress(time);
  // Depth: the seats are part of the scene, so cards pass in front of them; the hand-off, light and any ball in the air are on top.
  const stage=this.app.stage,base=this.cardLayer&&this.cardLayer.parent===stage?this.cardLayer:null;
  if(this.hud.visible){
   if(!base){if(!this.overlay&&!this.juice&&!this.flights.size&&stage.children.at(-1)!==this.hud)stage.addChild(this.hud);}
   else{const at=stage.getChildIndex(base),mine=stage.getChildIndex(this.hud);if(mine!==(this.underLayer?at-1:at+1)){stage.removeChild(this.hud);stage.addChildAt(this.hud,stage.getChildIndex(base)+(this.underLayer?0:1));}}
  }
  if(this.overlay&&stage.children.at(-1)!==this.overlay&&!this.juice&&!this.flights.size)stage.addChild(this.overlay);
  if(this.juice||this.flights.size){if(this.juice)stage.addChild(this.juice.back);if(this.overlay)stage.addChild(this.overlay);else if(!base&&this.hud.visible)stage.addChild(this.hud);if(this.juice)stage.addChild(this.juice.front);for(const flight of this.flights)stage.addChild(flight);}
 };
 /** Everything that depends on how many balls are in: which seats are lit, which one is asking for its ball, the weight of the last landing and the count's moment. */
 private dress(time:number){
  const n=this.collected.size,d=this.device,r=d.radius,reduced=this.reduced(),shown=n-this.pending.size,key=n*8+this.pending.size;
  if(key!==this.painted){this.painted=key;
   this.seatsView.forEach((seat,i)=>{const lit=i<n&&!this.pending.has(i),rim=seat.rim.clear();if(!lit)return;rim.circle(0,0,r+.6).stroke({color:shown===3?GOLD:0xd8f4ff,width:2,alpha:1});arc(rim,0,0,r+.6,Math.PI*1.15,Math.PI*1.6).stroke({color:0xffffff,width:1.3,alpha:.85});});
  }
  const called=this.summoned<0?-1:time-this.summoned;
  this.seatsView.forEach((seat,i)=>{
   // Called up one after another, each seat pushes out of the lip and settles.
   const u=reduced?(called>=0?1:0):Math.max(0,Math.min(1,(called-i*.07)/.3)),rise=u<=0?0:u>=1?1:1+2.2*(u-1)**3+1.2*(u-1)**2;seat.root.visible=u>0;seat.root.scale.set(rise);seat.root.alpha=Math.min(1,u*3);seat.shadow.alpha=.42;
   const age=this.seats[i]<0?-1:time-this.seats[i],filled=i<n&&!this.pending.has(i),pose=bonusSeatPose(filled?Math.max(0,age<0?9:age):-1,reduced);seat.ball.visible=filled;
   seat.ball.scale.set(1+pose.squash,1-pose.squash);seat.ball.position.set(0,r*.05+r*Math.max(0,pose.squash)*.7-(1-pose.sink)*r*.25);
   // The seat takes the weight too: it dips with the ball and comes back.
   const from=this.movedFrom?.[i],slide=from&&!reduced?smooth((time-this.movedAt)/.34):1,x=from?from.x+(d.sockets[i].x-from.x)*slide:d.sockets[i].x,y=from?from.y+(d.sockets[i].y-from.y)*slide:d.sockets[i].y;
   seat.root.position.set(x,y+(filled&&!reduced?Math.exp(-Math.max(0,age)*16)*Math.cos(Math.max(0,age)*30)*r*.16:0));
   // A filled seat stays lit; at two, the empty one slowly asks for its ball.
   const calling=!filled&&i===shown&&shown===2&&!reduced?.2+.3*(.5+.5*Math.sin(time*3.1)):0;seat.glow.tint=shown===3?GOLD:CYAN;seat.glow.alpha=filled?pose.glow*(shown===3?.7:.5):calling;
  });
  // The count is a moment: it stamps above the seats and is gone within a second.
  const since=this.stamp<0?9:time-this.stamp,pop=reduced?0:Math.exp(-since*11)*Math.cos(since*24)*.55,alpha=since>1.05?0:smooth(since/.05)*(1-smooth((since-.72)/.3));
  for(const text of [this.stampText,this.stampShine])text.scale.set(1+pop);if(this.stampText.width>d.stamp.reach*2)for(const text of [this.stampText,this.stampShine])text.scale.set((1+pop)*d.stamp.reach*2/this.stampText.width);
  this.stampText.alpha=alpha;this.stampText.rotation=this.stampShine.rotation=-.04;this.stampText.y=this.stampShine.y=d.stamp.y-(reduced?0:(1-Math.exp(-since*6))*r*.35);this.stampShine.alpha=reduced?0:Math.max(0,1-since/.18)*.9*alpha;
 }
 /** The lens leaves the stage for a win or a special reveal: the seats go with the pedestal they are set into. */
 setWinOcclusion(value:number){this.hud.alpha=1-Math.max(0,Math.min(1,value*1.25));}
 private render(){if(!this.dead&&!document.hidden){this.layout();this.app.renderer.render(this.app.stage);}}
 private airborne=new Set<()=>void>();private carried=new Set<gsap.core.Timeline>();private quiet=false;
 /** Bring every ball that is still in the air home at once, without effects or sound: whatever interrupts a flight still ends with its ball counted. */
 private finishFlights(){if(!this.carried.size)return;this.quiet=true;try{for(const timeline of [...this.carried])timeline.progress(1);}finally{this.quiet=false;}}
 private say(name:string,options?:{gain?:number;rate?:number}){if(!this.quiet)playSound(name as Sound,options);}
 private clearFlights(){this.carried.clear();for(const release of [...this.airborne])release();this.airborne.clear();for(const flight of this.flights)if(!flight.destroyed)flight.destroy({children:true});this.flights.clear();}
 setOpening(id:string,positions:readonly number[]){if(this.dead)return;if(id!==this.id){this.receiverCleanup?.();for(const animation of this.animations)animation.kill();this.animations.clear();this.clearFlights();this.juice?.clear();this.id=id;this.positions=[...positions];this.seen.clear();this.collected.clear();this.pending.clear();this.seats=[-1,-1,-1];this.stamp=-1;this.summoned=-1;this.group=false;}this.active=false;this.hud.visible=false;this.paint();}
 show(){if(this.dead)return;this.active=true;this.sync();this.render();}
 has(index:number){return this.positions.includes(index);}
 /** A bonus card has been revealed. With an origin the ball that landed on the card is carried to its well; without one
  * (the rest of the pack turned at once) the well simply takes it. */
 reveal(index:number,origin?:{x:number;y:number}){
  if(!this.has(index)||this.seen.has(index)||this.dead)return;this.seen.add(index);
  const order=this.seen.size,seated=claimBonusBall(!!origin,this.app.stage),reduced=this.reduced(),i=order-1;
  playSound('rare',{gain:.43});
  const layer=seated?.layer(this.app.stage)??null;
  if(origin&&layer){this.cardLayer=layer;this.underLayer=false;}
  else if(!origin&&seated){
   // The rest of the pack is laid out over the pedestal: the seats come up again on the floor under the cards.
   if(!this.cardLayer&&layer){this.cardLayer=layer;this.underLayer=true;}
   if(!this.group){this.group=true;if(this.summoned<0)this.summoned=performance.now()/1000-(reduced?9:0);this.sync();this.layout();}
  }
  // The seats are not there until a pack has a bonus ball: they come up as the first one strikes its card.
  if(this.summoned<0){this.summoned=performance.now()/1000+(reduced?-9:origin?BADGE_BALL.impact+BADGE_BALL.hold:0);this.sync();}
  // Turned with the rest of the pack, the ball is counted at once; it still has to get from its card to its seat.
  if(!origin)this.collect(index);
  if(reduced||order>3||(!origin&&!seated)){seated?.release();if(origin)this.collect(index);this.land(order,!reduced);return;}
  if(!origin)this.pending.add(i);
  const lift=origin?BADGE_BALL.lift:.58,arrive=origin?BADGE_BALL.collect:.98,unit=Math.min(this.app.screen.width,this.app.screen.height),juice=this.light(),spin=new Quaternion(),travel={p:0},previous={x:0,y:0};
  let ball:PokeBall3D|null=null,still:Container|null=null,from={x:origin?.x??0,y:origin?.y??0,radius:unit*.026},to={x:0,y:0,radius:0},height=unit*.12,flying=false;
  const host=new Container();host.eventMode='none';host.visible=false;this.app.stage.addChild(host);this.flights.add(host);
  const end=()=>{this.airborne.delete(end);ball?.dispose();ball=null;this.flights.delete(host);if(!host.destroyed)host.destroy({children:true});};this.airborne.add(end);
  const timeline=gsap.timeline({onUpdate:()=>{if(!this.quiet)this.render();},onComplete:()=>{end();this.animations.delete(timeline);this.carried.delete(timeline);}});this.carried.add(timeline);
  // The ball strikes the card (the mark plays that on the card itself), sits, then is lifted off its mark.
  timeline.call(()=>{this.say('ballbounce',{gain:.8});this.say('latch',{gain:.3});},[],BADGE_BALL.impact+BADGE_BALL.hold);
  timeline.call(()=>{
   const seat=seated?.global()??null;seated?.release();if(this.quiet||(!seat&&!origin))return;
   if(seat)from=seat;const point=this.device.sockets[i];to={x:point.x,y:point.y,radius:this.device.radius*.82};height=Math.max(unit*.1,Math.hypot(to.x-from.x,to.y-from.y)*.3);previous.x=from.x;previous.y=from.y;
   if(bonusBallTexture())try{ball=new PokeBall3D(false,0xbdf7ff,256);host.addChild(ball.sprite);}catch{ball=null;}
   if(!ball){still=createBonusToken(1);host.addChild(still);}
   flying=true;host.visible=!this.blocked;this.say('flight',{gain:.24});juice.flare(from.x,from.y,from.radius*3.4,0xffffff,.2);
  },[],lift);
  timeline.to(travel,{p:1,duration:arrive-lift,ease:'none',onUpdate:()=>{
   if(this.quiet||!flying)return;
   const pose=bonusFlightPose(travel.p,from,to,height),dx=pose.x-previous.x,dy=pose.y-previous.y,speed=Math.hypot(dx,dy);
   if(ball){ball.place(pose.x,pose.y,pose.radius,1,true);ball.update({spin:spin.setFromAxisAngle(TUMBLE,pose.tumble),roll:pose.roll,open:0,button:.35+.4*Math.sin(travel.p*Math.PI),inner:0,front:false});}
   else if(still){still.position.set(pose.x,pose.y);still.scale.set(pose.radius);still.rotation=pose.tumble;}
   // One streak of light along the path it has just travelled.
   if(speed>.5){const angle=Math.atan2(-dy,-dx),length=Math.min(unit*.2,speed*5.5);juice.streak(pose.x,pose.y,angle,length,pose.radius*.11,CYAN,.2,true);juice.streak(pose.x,pose.y,angle,length*.7,pose.radius*.04,0xffffff,.15,true);}
   previous.x=pose.x;previous.y=pose.y;
  }},lift);
  timeline.call(()=>{host.visible=false;if(origin)this.collect(index);else this.pending.delete(i);this.land(order,!this.quiet);},[],arrive);
  this.animations.add(timeline);if(document.hidden||this.blocked)timeline.pause();
 }
 /** A ball takes its seat: weight, a latch, light that stays on, and the count stamped beside it. Each one lands a step higher; the third resolves the phrase. */
 private land(order:number,animated:boolean){
  const i=order-1,time=performance.now()/1000;if(i<0||i>2)return;
  this.seats[i]=animated?time:time-9;
  if(animated){const unit=Math.min(this.app.screen.width,this.app.screen.height),at=this.device.sockets[i],r=this.device.radius,last=order===3,tint=last?GOLD:CYAN,juice=this.light(),reach=r*(last?6.5:4.2);
   const shown=this.collected.size-this.pending.size;this.stampText.text=this.stampShine.text=shown>=3?'3/3!':shown===2?(this.device.stamp.short?'2/3!':'2/3 · ONE MORE!'):'1/3';this.stampText.style.fill=shown>=3?GOLD:0xfff4d9;this.stamp=time;
   juice.flare(at.x,at.y,r*(last?7:4.6),0xffffff,.22);for(const angle of [0,Math.PI]){juice.streak(at.x,at.y,angle,reach,2.4,tint,.34);juice.streak(at.x,at.y,angle,reach*.6,1,0xffffff,.24);}
   juice.burst(at.x,at.y,last?12:6,unit*.26/juice.scale,tint,.5);
   if(last){juice.streak(at.x,at.y,-Math.PI/2,unit*.18,3.2,GOLD,.5,true);juice.streak(at.x,at.y,-Math.PI/2,unit*.12,1.1,0xffffff,.36,true);}
   this.say('cap-ready',{gain:.9,rate:[1,1.122,1.335][i]??1});this.say('latch',{gain:.34});
  }
  this.render();
 }
 private collect(index:number){const before=this.collected.size;this.collected.add(index);this.paint();if(before<3&&this.collected.size===3)this.host.dispatchEvent(new CustomEvent('legendary-bonus-ready',{detail:{openingId:this.id}}));}
 private paint(){const n=this.collected.size;if(n>0&&this.summoned<0){this.summoned=performance.now()/1000-9;this.sync();}for(let i=0;i<3;i++)if(i<n&&this.seats[i]<0)this.seats[i]=performance.now()/1000-9;this.status.textContent=`${n} of 3 bonus Poké Balls collected in this pack. ${n===3?'Legendary encounter ready.':'Collect 3 to unlock the legendary encounter.'}`;this.render();}
 setBlocked(blocked:boolean){this.blocked=blocked;for(const animation of this.animations){if(animation.data==='handoff')continue;blocked||document.hidden?animation.pause():animation.resume();}if(this.juice)this.juice.back.visible=this.juice.front.visible=!blocked||!!this.overlay;for(const flight of this.flights)flight.visible=!blocked&&flight.children.length>0;this.sync();this.render();}
 hide(){this.finishFlights();this.active=false;this.hud.visible=false;this.render();}
 /** The three balls leave their wells and seat in the receiver tray, one after another, with the tray taking each one's weight. */
 async transferToReceiver(texture:Texture){
  // A ball still on its way is brought home first, so the hand-off always starts from three seated balls.
  if(this.dead)return;this.finishFlights();if(this.collected.size!==3)return;
  this.receiverCleanup?.();this.layout();if(this.juice)this.juice.back.visible=this.juice.front.visible=true;
  const w=this.app.screen.width,h=this.app.screen.height,reduced=this.reduced(),l=showdownReceiverLayout(w,h,texture.width,texture.height),{scale:ts,x:tx,y:ty}=l,radius=l.tokenScale*15*.93,dot=juiceTextures().dot;
  const starts=this.device.sockets.map(socket=>({x:socket.x,y:socket.y,radius:this.device.radius*.82}));
  const panel=new Container(),shade=new Sprite(Texture.WHITE),tray=new Container(),receiver=new Sprite(texture),title=display('LEGENDARY ENCOUNTER',34),sub=caption('3 / 3 POKÉ BALLS COLLECTED',15,0xfff4d9);
  const glows=l.holes.map(()=>{const glow=new Sprite(dot);glow.anchor.set(.5);glow.blendMode='add';glow.alpha=0;return glow;}),hosts=l.holes.map(()=>new Container()),balls:(PokeBall3D|null)[]=[],stills:(Container|null)[]=[],spin=new Quaternion();
  hosts.forEach((host,i)=>{let ball:PokeBall3D|null=null;if(!reduced&&bonusBallTexture())try{ball=new PokeBall3D(false,0xbdf7ff,256);host.addChild(ball.sprite);}catch{ball=null;}balls.push(ball);const still=ball?null:createBonusToken(1);if(still)host.addChild(still);stills.push(still);void i;});
  shade.tint=0x0b1c2c;shade.width=w;shade.height=h;title.scale.set(l.typeScale);sub.scale.set(l.typeScale);if(title.width>w-28)title.scale.set(l.typeScale*(w-28)/title.width);const titleScale=title.scale.x;
  tray.addChild(receiver,...glows);panel.addChild(shade,tray,...hosts,title,sub);panel.eventMode='none';this.overlay=panel;this.app.stage.addChild(panel);
  // The wells hand their balls over: the collector's own are hidden while their 3D selves are in the air.
  for(const slot of this.slots)slot.renderable=false;
  const state={t:0},depart=(i:number)=>.44+i*.15,landAt=(i:number)=>depart(i)+.85,seen=[false,false,false];
  const draw=()=>{
   const t=state.t,rise=reduced?1:smooth(t/.65),juice=this.light();shade.alpha=.74*(reduced?1:smooth(t/.55));
   // Each seat presses the tray down a little; it springs back.
   const press=reduced?0:l.holes.reduce((sum,_,i)=>{const age=t-landAt(i);return age>=0?sum+Math.exp(-age*14)*Math.cos(age*28):sum;},0);
   tray.position.set(0,(1-rise)*h*.48+press*h*.006);receiver.scale.set(ts);receiver.position.set(tx,ty);receiver.alpha=rise;
   l.holes.forEach((hole,i)=>{
    const age=t-depart(i),seated=t-landAt(i),flight=bonusFlightPose(reduced?1:age/.85,starts[i],{x:hole.x,y:hole.y,radius},h*.12+i*h*.012,.6),seat=bonusSeatPose(reduced?9:seated,reduced),ball=balls[i],still=stills[i];
    const y=flight.y+(seated>=0?radius*Math.max(0,seat.squash)*.6+press*h*.006:0),size=flight.radius;
    if(ball){ball.place(flight.x,y,size,1,true);ball.sprite.scale.x*=1+seat.squash;ball.sprite.scale.y*=1-seat.squash;ball.update({spin:spin.setFromAxisAngle(TUMBLE,flight.tumble*(i%2?-1:1)),roll:flight.roll*(i-1),open:0,button:.3+seat.flash*1.3,inner:0,front:false});}
    else if(still){still.position.set(flight.x,y);still.scale.set(size*(1+seat.squash),size*(1-seat.squash));still.rotation=reduced?0:flight.tumble*.6;}
    // The hole lights as its ball seats, and stays lit.
    glows[i].position.set(hole.x,hole.y);glows[i].width=glows[i].height=radius*4.6;glows[i].tint=GOLD;glows[i].alpha=seated>=0||reduced?seat.glow*.7:0;
    if(!reduced&&seated>=0&&!seen[i]){seen[i]=true;juice.flare(hole.x,hole.y,radius*3.4,0xffffff,.24);for(const angle of [0,Math.PI]){juice.streak(hole.x,hole.y,angle,radius*3.2,3,GOLD,.36);juice.streak(hole.x,hole.y,angle,radius*2,1.1,0xffffff,.26);}juice.burst(hole.x,hole.y+radius*.5,9,Math.min(w,h)*.5/juice.scale,0xffe9a8,.5);}
   });
   const named=reduced?1:t-1.55;title.position.set(w/2,l.titleY);sub.position.set(w/2,l.subtitleY);title.alpha=smooth(named/.12);sub.alpha=smooth((named-.12)/.3);
   title.scale.set(titleScale*(1+(reduced||named<0?0:Math.exp(-named*11)*Math.cos(named*22)*.35)));
   this.render();
  };
  let handoff:gsap.core.Timeline|null=null,settle:(()=>void)|null=null;
  // Ending the hand-off early (a second one, a new pack, teardown) stops its clock and lets whoever awaits it carry on.
  this.receiverCleanup=()=>{this.receiverCleanup=null;if(handoff){handoff.kill();this.animations.delete(handoff);handoff=null;}for(const ball of balls)ball?.dispose();for(const slot of this.slots)slot.renderable=true;if(this.overlay===panel)this.overlay=null;if(!panel.destroyed)panel.destroy({children:true});settle?.();settle=null;if(!this.dead)this.render();};
  playSound('charge',{gain:.38});draw();
  if(reduced){state.t=2.1;draw();playSound('latch',{gain:.4});return;}
  await new Promise<void>(resolve=>{settle=resolve;const timeline=handoff=gsap.timeline({data:'handoff',onComplete:()=>{this.animations.delete(timeline);handoff=null;settle=null;resolve();}});timeline.to(state,{t:2.1,duration:2.1,ease:'none',onUpdate:()=>{if(!panel.destroyed)draw();}});
   l.holes.forEach((_,i)=>{timeline.call(()=>this.say('flight',{gain:.3}),[],depart(i));timeline.call(()=>{this.say('ballbounce',{gain:.9});this.say('latch',{gain:.5});this.say('cap-ready',{gain:.7,rate:[1,1.122,1.335][i]});},[],landAt(i));});
   timeline.call(()=>this.say('win-stamp',{gain:.7}),[],1.55);this.animations.add(timeline);if(document.hidden)timeline.pause();
  });
 }
 finishReceiverTransfer(){this.receiverCleanup?.();}
 destroy(){if(this.dead)return;this.receiverCleanup?.();this.dead=true;this.juice?.destroy();this.juice=null;for(const animation of this.animations)animation.kill();this.animations.clear();this.clearFlights();gsap.ticker.remove(this.layout);document.removeEventListener('visibilitychange',this.visibility);this.status.remove();this.hud.destroy({children:true});this.overlay?.destroy({children:true});this.overlay=null;}
}
