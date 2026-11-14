import {BitmapFont,BitmapText,Container} from 'pixi.js';
import {prepareBattleFont} from './battleFont';
import {playSound,type Sound} from './audio';
import {gsap} from 'gsap';
import {money} from './model';
import {RollingWinDigits} from './RollingWinDigits';
import {moneyState,type MoneyState} from './moneyMotion';
import {rewardHeat} from './rewardHeat';
import {createBurningText} from './BurningText';
import {amountCountPose,amountFireHeat} from './amountCountMotion';

type Options={size:number;color:number;align:'left'|'center'|'right';width:number;plus:boolean;hero:boolean;centerY?:boolean;reduced:boolean;ticks:boolean;bet?:number;countStyle?:'result';cinematic?:boolean;draw:()=>void;
 /** The play screen's amounts: battle-font digits with an ink edge and a hard drop, a raised currency sign and cents, digits that
  * punch as they change, and a short roll whose length and ticks scale with the step. No flames. */
 meter?:boolean;tickSound?:boolean;
 /** `gold` (the default) is for winnings; `cool` is white on a blue drop, for balances and prices. */
 tone?:'gold'|'cool'};
let amountFont=false,amountFontReady:Promise<void>|undefined;
/** Bake the meter's digits once the battle font is in. Readouts made before that use the plain money font. */
export function prepareAmountFont(){return amountFontReady??=prepareBattleFont().then(()=>{if(typeof document==='undefined')return;
 BitmapFont.install({name:'BattleAmount',style:{fontFamily:'BattleDisplay',fontSize:96,fill:0xffffff,stroke:{color:0x061b32,width:12,join:'round'},dropShadow:{color:0xa86a16,alpha:1,blur:0,distance:8,angle:Math.PI/2}},chars:'0123456789$.,+- ',resolution:2,padding:8,skipKerning:true});
 BitmapFont.install({name:'BattleAmountCool',style:{fontFamily:'BattleDisplay',fontSize:96,fill:0xffffff,stroke:{color:0x061b32,width:12,join:'round'},dropShadow:{color:0x1c69ad,alpha:1,blur:0,distance:8,angle:Math.PI/2}},chars:'0123456789$.,+- ',resolution:2,padding:8,skipKerning:true});amountFont=true;}).catch(()=>{});}
type Glyph={text:BitmapText;char:string;at:number;role:number};
/** Where a baked digit's ink lies around its anchor, as fractions of the font size (measured from the rendered font, edge
 * included): the body starts just above the anchor, hangs two thirds of a size below it and leans to the right. */
const INK={top:-.0625,bottom:.667,left:-.21,right:.41},SIGN_TOP=-.135;
const now=()=>typeof performance==='undefined'?0:performance.now()/1000;
/** Exact cents on one baseline; the alignment point remains fixed during impact. */
export class MoneyReadout extends Container {
 private rolling:RollingWinDigits|null=null;private ink=new Container();private prefix:BitmapText;private integer:BitmapText;private decimals:BitmapText;
 private pulseTween:gsap.core.Tween|null=null;private count:gsap.core.Tween|null=null;private entrance:gsap.core.Timeline|null=null;private maxScale=1;
 private meter=false;private family='BattleAmount';private inkSpan=0;private glyphs:Glyph[]=[];private advances=new Map<string,number>();private probe:BitmapText|null=null;private settle:gsap.core.Tween|null=null;
 private impact={value:0};private heat=0;private heatColor=0;private fireTime=0;private fireHeat=0;private burning:ReturnType<typeof createBurningText>|null=null;private burningActive=false;
 private get hasBet(){return Number.isFinite(this.options.bet)&&(this.options.bet??0)>0;}
 private tickHeat=(_time:number,deltaMS:number)=>{
  if(this.destroyed||this.heat===0||(typeof document!=='undefined'&&document.hidden))return;
  for(let node:Container|null=this;node;node=node.parent)if(!node.visible||!node.renderable||node.alpha===0)return;
  this.fireTime+=Math.min(.05,Math.max(0,deltaMS/1000));this.pose();this.options.draw();
 };
 constructor(private state:MoneyState,private options:Options){
  super();this.eventMode='none';this.addChild(this.ink);
  const label=(size:number)=>{const text=new BitmapText({text:'',style:{fontFamily:'LegendsMoney',fontSize:size}});text.tint=options.color;this.ink.addChild(text);return text;};
  this.prefix=label(options.size*.56);this.integer=label(options.size);this.decimals=label(options.size*.62);this.prefix.alpha=.84;this.decimals.alpha=.9;
  this.meter=!!options.meter&&amountFont&&!options.cinematic;if(options.tone==='cool')this.family='BattleAmountCool';if(this.meter){for(const part of [this.prefix,this.integer,this.decimals])part.visible=false;this.probe=new BitmapText({text:'',style:{fontFamily:this.family,fontSize:options.size}});}
  this.fit();this.paint(state.value);this.animate();if(options.cinematic){this.rolling=new RollingWinDigits(options.size,options.width,state.target);this.ink.visible=false;this.addChild(this.rolling.root);this.rolling.display(state.value);this.rolling.sample(0,true);}
  if(this.hasBet&&!options.reduced)gsap.ticker.add(this.tickHeat);
  if(options.hero&&state.value===0&&state.target>0&&!options.reduced){
   this.pulse();this.entrance=gsap.timeline({onUpdate:options.draw}).from(this,{alpha:0,duration:.16,ease:'power2.out'});
  }
 }
 private parts(value:number){const formatted=money(Math.round(value));const [whole,cents]=formatted.replace('$','').split('.');return {prefix:this.options.plus?'+$':'$',whole,cents:'.'+cents};}
 /** Width of one character at the readout's size, measured once. */
 private advance(char:string){let width=this.advances.get(char);if(width===undefined){this.probe!.text=char;width=this.probe!.width;this.advances.set(char,width);}return width;}
 /** One object per character, so each digit can take its own hit. The sign is small and hangs from the top line; the cents are
  * smaller digits on the same baseline after a visible point, spaced so "00" can never read as letters. */
 private meterLayout(value:number){
  const p=this.parts(value),s=this.options.size,time=now(),CENTS=.72,SIGN=.56;
  const chars=[...[...p.prefix].map(c=>[c,SIGN,-1] as const),...[...p.whole].map(c=>[c,1,0] as const),...[...p.cents].map(c=>[c,CENTS,1] as const)];
  while(this.glyphs.length<chars.length){const text=new BitmapText({text:'',style:{fontFamily:this.family,fontSize:s}});text.anchor.set(.5,.5);this.ink.addChild(text);this.glyphs.push({text,char:'',at:-9,role:1});}
  // Compare from the right, so a digit keeps its identity when the amount grows a place.
  const shift=this.glyphs.filter(g=>g.text.visible).length-chars.length,previous=this.glyphs.map(g=>g.char);let cursor=0;
  this.glyphs.forEach((glyph,i)=>{const entry=chars[i];glyph.text.visible=!!entry;if(!entry){glyph.char='';return;}const [char,role,rise]=entry,before=previous[i+shift];
   if(char!==before&&/[0-9]/.test(char)&&before!==undefined&&before!=='')glyph.at=time;glyph.char=char;glyph.role=role;glyph.text.text=char;
   const mark=char==='.'||char===',',width=this.advance(char)*role*(mark?.86:rise>0?1.06:1);
   // rise -1: top-aligned with the digits; +1: sharing their baseline.
   // The sign's top is level with the digits' tops (its glyph is taller than a digit, so it is placed by its measured ink).
   glyph.text.position.set(cursor+width/2,s*.5+(rise<0?s*(INK.top-SIGN_TOP*role):rise>0?(1-role)*s*.34:0));glyph.text.scale.set(role);cursor+=width;});
  return cursor;
 }
 private layout(value:number){if(this.meter)return this.meterLayout(value);const p=this.parts(value),s=this.options.size,gap=Math.max(1,s*.045);this.prefix.text=p.prefix;this.integer.text=p.whole;this.decimals.text=p.cents;
  this.prefix.position.set(0,s*.38);this.integer.position.set(this.prefix.width+gap,0);this.decimals.position.set(this.integer.x+this.integer.width+gap,s*.32);
  return this.decimals.x+this.decimals.width;
 }
 private fit(){
  // Reserve both the impact and the small heated stretch inside the number's slot.
  const width=Math.max(this.layout(this.state.target),this.layout(this.state.value)),reserve=this.hasBet?1.12:1.07;
  this.maxScale=Math.min(1,this.options.width/Math.max(1,width*reserve));this.ink.scale.set(this.maxScale);
 }
 private paint(value:number){
  this.layout(value);
  if(this.meter){
   // Align and centre on the ink, not on the glyph cells, so an amount sits exactly where it is put: its edge on the given x,
   // the middle of its digits on the given y.
   const s=this.options.size;let left=Infinity,right=-Infinity;for(const glyph of this.glyphs){if(!glyph.text.visible)continue;left=Math.min(left,glyph.text.x+INK.left*s*glyph.role);right=Math.max(right,glyph.text.x+INK.right*s*glyph.role);}
   if(left>right)left=right=0;this.inkSpan=right-left;
   this.ink.pivot.x=this.options.align==='right'?right:this.options.align==='center'?(left+right)/2:left;
   this.ink.pivot.y=s*(.5+(this.options.centerY?(INK.top+INK.bottom)/2:INK.top));
  }else{const b=this.ink.getLocalBounds();
   this.ink.pivot.x=this.options.align==='right'?b.maxX:this.options.align==='center'?(b.minX+b.maxX)/2:b.minX;
   this.ink.pivot.y=this.options.centerY?(b.minY+b.maxY)/2:0;}
  const heat=this.hasBet?rewardHeat(value,this.options.bet!):null;this.heat=heat?.heat??0;this.heatColor=heat?.color??this.options.color;this.fireHeat=heat?amountFireHeat(heat.ratio):0;
  this.pose();this.options.draw();
 }
 private pose(){
  const animated=!this.options.reduced,h=animated?this.heat:0,t=this.fireTime,stretch=Math.sin(t*7.2)*h*.012,impact=animated?this.impact.value:0;
  if(this.meter){
   const time=now(),flash=Math.min(1,impact*.5);let tint=0;for(const shift of [16,8,0])tint|=Math.round(((this.heatColor>>shift)&255)*(1-flash)+255*flash)<<shift;
   this.ink.scale.set(this.maxScale*(1+impact*.05),this.maxScale*(1+impact*.12));
   for(const glyph of this.glyphs){if(!glyph.text.visible)continue;const age=time-glyph.at,punch=animated&&age<.22?Math.exp(-age*16)*Math.cos(age*30):0;
    const hit=punch*(glyph.role<1?.45:1);glyph.text.scale.set(glyph.role*(1+hit*.2),glyph.role*(1+hit*.34));glyph.text.pivot.y=hit*this.options.size*.07;glyph.text.tint=tint;}
   return;
  }
  this.ink.scale.set(this.maxScale*(1-impact*.035+stretch),this.maxScale*(1+impact*.10-Math.sin(t*7.2+.8)*h*.026));
  // A warm color roll stays inside the readable lettering at ordinary ratios.
  for(const [index,glyph] of [this.prefix,this.integer,this.decimals].entries()){
   const roll=h*(.10+.10*Math.sin(t*4-index*1.7));let tint=0;
   for(const shift of [16,8,0])tint|=Math.round(((this.heatColor>>shift)&255)*(1-roll)+((0xfff1c2>>shift)&255)*roll)<<shift;
   glyph.tint=tint;
  }
  const ignition=animated?this.fireHeat:0;
  if(ignition>0){
   if(!this.burning)this.burning=createBurningText();
   if(!this.burningActive){this.ink.filters=[this.burning.filter];this.burningActive=true;}
   const height=this.ink.getLocalBounds().height*this.ink.scale.y;
   this.burning.sample(t,ignition,height,Math.min(this.options.size*.20,height*.20));
  }else if(this.burningActive){this.ink.filters=[];this.burningActive=false;}
 }
 private animate(){
  this.count?.kill();const s=this.state;
  if(this.options.reduced||s.value===s.target){s.value=s.target;s.remaining=0;this.paint(s.value);return;}
  const power=this.hasBet?Math.min(1,Math.abs(s.target-s.value)/this.options.bet!):.4;
  const duration=this.options.countStyle==='result'?s.remaining:this.meter?Math.min(Math.max(s.remaining,.2),.24+.56*Math.sqrt(power)):Math.min(.7,s.remaining),start=s.value,delta=s.target-start;let beat=0;
  s.remaining=duration;
  this.count=gsap.to(s,{remaining:0,duration,ease:'none',onUpdate:()=>{
   const pose=amountCountPose(1-s.remaining/duration);s.value=start+delta*pose.value;this.paint(s.value);
   if(this.hasBet&&delta>0&&pose.beat>beat){beat=pose.beat;this.pulse(this.meter?.5+power:1);if(this.meter&&this.options.tickSound&&beat<6)playSound('win-tick' as Sound,{gain:.4+.45*power,rate:.94+beat*(.06+.05*power)});}
  },onComplete:()=>{s.value=s.target;s.remaining=0;this.paint(s.target);if(this.options.ticks)this.pulse(this.meter?1+power*1.6:1);if(this.meter){this.settle?.kill();this.settle=gsap.to({},{duration:.26,onUpdate:()=>{this.pose();this.options.draw();}});}}});
 }
 /** Drawn width of the amount, edge to edge, and the height of its digits (the hard drop hangs a further tenth below). */
 get inkWidth(){return this.meter?this.inkSpan*this.maxScale:this.width;}
 get digitHeight(){return this.options.size*(INK.bottom-INK.top)*this.maxScale;}
 returnStyle(progress:number){if(!this.rolling)return;const t=Math.max(0,Math.min(1,(progress-.60)/.35));this.ink.visible=t>0;this.ink.alpha=t;this.rolling.root.alpha=1-t;}
 cinema(age:number,reduced=false,beat?:{age:number;strength:number}){this.rolling?.sample(age,reduced,beat);}
 display(value:number){this.rolling?.display(value);this.count?.kill();this.state.value=value;this.state.remaining=0;this.paint(value);}
 /** `strength` above 1 is a harder hit: the amount stretches further before it settles. */
 pulse(strength=1){
  if(this.options.reduced)return;
  this.pulseTween?.kill();this.impact.value=strength;this.pose();
  this.pulseTween=gsap.to(this.impact,{value:0,duration:this.options.countStyle==='result'?.22:.16,ease:'back.out(1.3)',onUpdate:()=>{this.pose();this.options.draw();}});
  this.options.draw();
 }
 retarget(amount:number){this.count?.kill();this.pulseTween?.kill();this.impact.value=0;Object.assign(this.state,moneyState(this.state,this.state.identity,amount,false));this.fit();this.paint(this.state.value);this.animate();}
 override destroy(){this.settle?.kill();this.probe?.destroy();this.probe=null;this.rolling?.destroy();this.rolling=null;gsap.ticker.remove(this.tickHeat);this.pulseTween?.kill();this.count?.kill();this.entrance?.kill();this.ink.filters=[];this.burning?.destroy();this.burning=null;super.destroy({children:true});}
}
