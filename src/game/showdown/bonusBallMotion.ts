/** Timing and poses for the bonus ball in the pack: its landing on a card, its flight to the collector and its seat in the receiver. Pure. */
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const smooth=(n:number)=>{const p=clamp(n);return p*p*(3-2*p);};
/** Seconds on a marked card's own clock. `lift` is when a carried ball leaves; `collect` when it reaches its socket. */
export const BADGE_BALL={drop:.06,impact:.36,hold:.05,seated:17,from:150,lift:1.12,collect:1.67};
/** A mark is drawn a quarter larger than its own units on a full card, so it holds its own against the artwork. */
export const BADGE_SCALE=1.25;
/** The well of the mark, in the mark's own coordinates. */
export const BADGE_SOCKET={x:-37,y:2};
/** The ball comes down out of the lens onto the card, lands, and the mark prints under it. Positions are offsets from the well. */
export function bonusBadgePose(age:number,reduced=false){
 if(reduced)return {seated:true,ball:{x:0,y:0,radius:BADGE_BALL.seated,alpha:1,squash:0,tumble:0,roll:0,button:.25},tail:0,shadow:{x:1,y:13,width:30,alpha:.4},mark:{alpha:1,scale:1,flash:0},light:{wash:0,washAlpha:0,bar:0,barAlpha:0,spread:1,sparkAlpha:0,glint:0}};
 const {drop,impact,seated,from}=BADGE_BALL,u=clamp((age-drop)/(impact-drop)),fall=u*u,i=age-impact,landed=i>=0;
 // After contact: one hard squash, a short hop, and a rock that dies out.
 const squash=landed?Math.exp(-i*15)*Math.cos(i*31)*.3:0,hop=landed?-Math.abs(Math.sin(i*11.5))*Math.exp(-i*7.5)*13:0,rock=landed?Math.sin(i*17)*Math.exp(-i*6.5)*.3:0;
 const decay=(rate:number)=>landed?Math.exp(-i*rate):0;
 // Just before it is carried off, the latch catches the light once.
 const glint=Math.exp(-(((age-(BADGE_BALL.lift-.2))/.07)**2));
 return {
  // Still enough to swap the live render for the resting one.
  seated:i>.8,
  // It comes in large from above the card and shrinks into the well: thrown at the card from where the player sits.
  ball:{x:-24*(1-fall),y:-250*(1-fall)+hop+seated*Math.max(0,squash)*.6,radius:from+(seated-from)*(1-(1-u)**2.2),alpha:smooth((age-drop)/.06),squash,tumble:(1-fall)*9,roll:rock,button:.22+1.25*decay(5)+glint*.9+(landed?.12*Math.sin(age*5.5):0)},
  // Light dragged behind it on the way in, as a fraction of its speed.
  tail:landed?0:u*(1-u)*4,
  shadow:{x:1+26*(1-fall),y:13+30*(1-fall),width:(30+110*(1-fall))*(1+Math.max(0,squash)*.5),alpha:.46*fall*(landed?1:u)},
  mark:{alpha:landed?smooth(i/.03):0,scale:landed?1+.5*Math.exp(-i*13)*Math.cos(i*27):1.5,flash:decay(20)},
  light:{wash:80+380*(1-decay(9)),washAlpha:.5*decay(6),bar:90+520*(1-decay(12)),barAlpha:decay(7),spread:1-decay(6),sparkAlpha:landed?decay(6)*(i>.01?1:0):0,glint},
 };
}
/** A carried ball's path from `from` to `to`: it rises toward the lens (growing), tumbles, and comes down into its seat. */
export function bonusFlightPose(progress:number,from:{x:number;y:number;radius:number},to:{x:number;y:number;radius:number},lift:number,toward=1.25){
 const p=clamp(progress),e=p*p*(3-2*p),arc=Math.sin(Math.PI*p),depth=1+toward*Math.sin(Math.PI*Math.min(1,p*1.12))**.8;
 return {x:from.x+(to.x-from.x)*e,y:from.y+(to.y-from.y)*e-arc*lift,radius:(from.radius+(to.radius-from.radius)*e)*(p<1?depth:1),tumble:(1-p)**1.6*9.5,roll:Math.sin(p*Math.PI)*.3};
}
/** Weight on arrival in a socket or a hole: seconds since contact → squash (positive = flattened) and how far it has sunk in. */
export function bonusSeatPose(age:number,reduced=false){
 if(age<0||reduced)return {squash:0,sink:age<0?0:1,glow:age<0?0:.3,flash:0};
 return {squash:Math.exp(-age*13)*Math.cos(age*27)*.28,sink:smooth(age/.12),glow:.3+.7*Math.exp(-age*4),flash:Math.exp(-age*9)};
}
