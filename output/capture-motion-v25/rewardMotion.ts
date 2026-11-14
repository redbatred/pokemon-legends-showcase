import {WIN_STAGES} from './winTimeline';
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
/** Absolute presentation time, shared by every encounter. No outcome logic here. */
export function rewardMotion(age:number){
 let tier=-1;for(let i=0;i<WIN_STAGES.length;i++)if(age>=WIN_STAGES[i].end)tier=i;
 const hitAge=tier<0?-1:age-WIN_STAGES[tier].end,final=age>=WIN_STAGES.at(-1)!.end;
 const pulse=(t:number)=>t<0?0:Math.exp(-t*9)*Math.cos(t*19);
 const strength=tier<0?0:tier===4?1.8:.7+tier*.19;
 const punch=strength*(pulse(hitAge)+.52*pulse(hitAge-.16));
 const anticipation=age>=4.1&&age<5.3?clamp((age-4.1)/.65):0;
 const charge=age<1.15?0:clamp((age-1.15)/4.15);
 return{punch,anticipation,final,tier,hitAge,charge};
}

const smooth=(x:number)=>{const p=clamp(x);return p*p*(3-2*p);};
/** The final total holds on contact for a few frames, then the clock catches up: hit-stop for the plate only. */
export const FINAL_HOLD=.08;
export function heldAge(age:number){const end=WIN_STAGES.at(-1)!.end;if(age<=end)return age;if(age<end+FINAL_HOLD)return end;return age-FINAL_HOLD*(1-smooth((age-end-FINAL_HOLD)/.35));}
/** The card's multiplier is stamped on it, charges, leaves it and strikes the bet on the frame the count starts. */
export const MULTIPLIER={stamp:.36,charge:.82,leave:.9,strike:WIN_STAGES[0].start};
export function multiplierFlight(age:number){
 const u=clamp((age-MULTIPLIER.leave)/(MULTIPLIER.strike-MULTIPLIER.leave)),since=age-MULTIPLIER.strike;
 return {stamped:age>=MULTIPLIER.stamp,stampAge:age-MULTIPLIER.stamp,charge:smooth((age-MULTIPLIER.charge)/(MULTIPLIER.leave-MULTIPLIER.charge))*(1-smooth(u/.25)),
  flying:u>0&&u<1,travel:u*u*(3-2*u)**1,arc:Math.sin(Math.PI*u),docked:since>=0,since,strike:since>=0?Math.exp(-since*11):0};
}
/** The tier plate above the total upgrades in place: 0 names the reward, then BIG, MEGA, EPIC and LEGENDARY. */
export const RIBBON=['reward','big','mega','epic','epic','legendary'] as const;
export function ribbonState(age:number){
 let index=0,since=9;for(let i=0;i<WIN_STAGES.length;i++)if(age>=WIN_STAGES[i].end){index=i+1;since=age-WIN_STAGES[i].end;}
 // The last plate does not turn: it is simply there when the white frame clears, already on its way up.
 const changed=index>0&&index<WIN_STAGES.length&&RIBBON[index]!==RIBBON[index-1],turning=changed&&since<.16;
 // A split-flap turn: the old face closes, the new one opens past flat and settles.
 const flip=turning?Math.abs(Math.cos(Math.PI*since/.16)):1,showing=turning&&since<.08?index-1:index;
 return {index,showing,name:RIBBON[showing],since,flip,punch:index>0?Math.exp(-since*9)*Math.cos(since*20):0,final:index===WIN_STAGES.length};
}
/** Drum position of every dollar digit, most significant first. A digit rolls into the next as the digits below it
 * roll over; when the amount is climbing faster than the eye can count a place, that drum simply spins. */
export function reelDigits(dollars:number,rate:number,places:number){
 const out:{digit:number;roll:number;blank:boolean;spin:number;appear:number}[]=[];
 for(let k=places-1;k>=0;k--){
  const unit=10**k,raw=dollars/unit,whole=Math.floor(raw+1e-9),speed=Math.abs(rate)/unit,spin=clamp((speed-7)/9);
  const below=k?(dollars-Math.floor(dollars/unit+1e-9)*unit)/unit:raw-whole,step=k?smooth((below-.88)/.12):below;
  const roll=spin>0?mix(step,raw-whole,spin):step;
  // A new leading place makes room only as its first digit rolls in.
  out.push({digit:whole%10,roll:clamp(roll),blank:k>0&&whole===0,spin,appear:k===0||whole>0?1:smooth((raw-.88)/.12)});
 }
 return out;
}
const mix=(a:number,b:number,p:number)=>a+(b-a)*p;
/** One coin thrown out from behind an end of the tray: it arcs clear of the tray, drops onto the end of the ledge and rolls
 * in along it to rest. It never passes in front of the amount, the bet or the multiplier. `x` is a fraction of the tray's
 * half-width, `y` is in tray heights from its centre. */
export const COIN_LEDGE=.41;
export function coinFlight(sinceSpawn:number,seed:number){
 const r=(n:number)=>{const x=Math.sin((seed*7.13+n)*127.1+311.7)*43758.5453;return x-Math.floor(x);};
 if(sinceSpawn<0)return null;
 const side=r(0)<.5?-1:1,rest=.1+r(1)*.82,flight=.48+r(3)*.16,roll=.16+(.96-rest)*.5,apex=.5+r(2)*.3,ledge=COIN_LEDGE+r(6)*.03;
 if(sinceSpawn<flight){const u=sinceSpawn/flight;return {x:side*(1+.11*Math.sin(Math.PI*u)*(1-.2*u)-.04*u),y:.05+(ledge-.05)*u-4*apex*u*(1-u),rising:u<.5,rolling:false,resting:false,spin:r(4)*8+sinceSpawn*(10+r(5)*7),land:flight};}
 const v=clamp((sinceSpawn-flight)/roll),eased=1-(1-v)**2,x=.96+(rest-.96)*eased;
 return {x:side*x,y:ledge-Math.abs(Math.sin(v*Math.PI*2))*.035*(1-v),rising:false,rolling:v<1,resting:v>=1,spin:v<1?r(4)*8+flight*12+(.96-x)*24:0,land:flight};
}

const hash=(n:number)=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x);};
/** What each lock is worth across the whole screen: nothing yet, BIG, MEGA, EPIC, EPIC again, LEGENDARY. */
export const POWER=[0,.2,.38,.58,.78,1] as const;
/** Coins thrown onto the ledge by each lock; the last one rains instead. */
export const LOCK_COINS=[4,8,14,22,0] as const;
export function tierLevel(age:number){let level=0,since=99;WIN_STAGES.forEach((stage,i)=>{if(age>=stage.end){level=i+1;since=age-stage.end;}});return{level,since,power:POWER[level],name:RIBBON[level]};}
/** The stretch before the last lock: light drains out of the room toward the card and the tray, and everything tightens. */
export function windup(age:number){const end=WIN_STAGES.at(-1)!.end,from=WIN_STAGES.at(-2)!.end+.22;return age<from||age>=end?0:smooth((age-from)/(end-from-.1));}
/** The card answers each lock, more with every tier: a pulse, then a lift with a tilt, then a hop that throws light across the foil. */
export function cardLock(age:number){
 const {level,since}=tierLevel(age);if(!level||since>1.4)return{level,lift:0,scale:1,yaw:0,pitch:0,sweep:null as number|null,light:0};
 const p=POWER[level],hop=Math.sin(Math.PI*clamp(since/(.34+.22*p))),ring=Math.exp(-since*7)*Math.cos(since*19);
 return{level,lift:level>=2?hop*(.01+.03*p):0,scale:1+(.015+.03*p)*ring,yaw:level>=2?ring*(.1+.36*p)*(level%2?1:-1):0,pitch:level>=3?-hop*.13*p:0,
  sweep:level>=3&&since<.7?-1.2+2.5*smooth(since/.62):null,light:Math.exp(-since*4)*(.25+.75*p)};
}
/** Each place of the amount stops a moment after the one to its left, so a lock lands as a run of slams, not one. */
export const DIGIT_STAGGER=.034;
export function digitLock(since:number,order:number,power:number){
 const at=order*DIGIT_STAGGER,t=since-at;if(t<0)return{rolling:1-clamp(since/Math.max(.001,at)),scale:1,lift:0,light:0};
 if(t>=.4)return{rolling:0,scale:1,lift:0,light:0};const k=1-t/.4,amount=.3+.34*power;
 return{rolling:0,scale:1+amount*Math.exp(-t*13)+amount*.4*Math.sin(t*46)*k**3,lift:-Math.sin(Math.min(1,t/.2)*Math.PI)*.07*(.5+power),light:Math.max(0,1-t/.2)};
}
/** After the final lock the award leaves the tray. Times are seconds after that lock. */
export const HERO={launch:FINAL_HOLD,title:.2,letter:.03,total:.34,digit:.04,back:.42};
/** `out` is 0 in the tray and 1 in the hero layout; `settleAt` is the age at which it starts back. */
export function heroState(age:number,settleAt:number){
 const s=age-WIN_STAGES.at(-1)!.end;if(s<HERO.launch)return{s,active:false,out:0,returning:0,title:-1,total:-1};
 const returning=smooth((age-settleAt)/HERO.back);
 return{s,active:true,out:(1-(1-clamp((s-HERO.launch)/.26))**3)*(1-returning),returning,title:s-HERO.title,total:s-HERO.total};
}
/** One letter of the hero title: it arrives large from above, hits, rings out and stays. `since` is seconds after its own slam begins. */
export function letterSlam(since:number){
 if(since<0)return{shown:false,scale:1,drop:0,light:0};const fall=clamp(since/.07),t=since-.07,k=Math.max(0,1-t/.4);
 return{shown:true,scale:t<0?2-fall*fall:1+.26*Math.exp(-t*12)*Math.cos(t*24)*k,drop:t<0?1-fall*fall:0,light:t<0?0:Math.max(0,1-t/.2)};
}
/** Coin rain after the final lock, looping until the reward fades. Near coins are large and fall down the outer edges, in front;
 * far coins are small and fall behind everything. `x` is a fraction of the half-width from the centre, `y` and `size` of the height. */
export function rainCoin(index:number,since:number,near:boolean){
 const r=(n:number)=>hash(index*13.7+n+(near?50:0)),period=(near?1.5:2.4)+r(2)*.9,t=since-r(1)*(near?1.4:1.1);if(t<0)return null;
 const u=(t/period)%1,turn=Math.floor(t/period),side=hash(index*5.1+turn*3.3+(near?9:0))<.5?-1:1;
 return{x:near?side*(.97+r(4)*.08):(hash(index*2.9+turn*7.7)*2-1)*.98+Math.sin(t*2+r(7)*6)*.02,y:-.12+1.24*u,size:near?.07+r(5)*.03:.017+r(5)*.014,spin:r(6)*8+t*(near?5:9)};
}
