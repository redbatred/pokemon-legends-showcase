import {BitmapText,Container,Graphics} from 'pixi.js';
import {gsap} from 'gsap';
import {money} from './model';
import {moneyState,type MoneyState} from './moneyMotion';

type Options={size:number;color:number;align:'left'|'center'|'right';width:number;plus:boolean;hero:boolean;reduced:boolean;ticks:boolean;draw:()=>void};
/** Exact cents with subordinate currency/decimals, fitted from glyph measurements. */
export class MoneyReadout extends Container {
 private ink=new Container();private prefix:BitmapText;private integer:BitmapText;private decimals:BitmapText;
 private count:gsap.core.Tween|null=null;private entrance:gsap.core.Timeline|null=null;private maxScale=1;
 constructor(private state:MoneyState,private options:Options){
  super();this.eventMode='none';this.addChild(this.ink);
  const label=(size:number)=>{const text=new BitmapText({text:'',style:{fontFamily:'LegendsMoney',fontSize:size}});text.tint=options.color;this.ink.addChild(text);return text;};
  this.prefix=label(options.size*.6);this.integer=label(options.size);this.decimals=label(options.size*.64);this.prefix.alpha=.82;this.decimals.alpha=.88;
  this.fit();this.paint(state.value);this.animate();
  if(options.hero&&state.value===0&&state.target>0&&!options.reduced){
   const glint=new Graphics().poly([-22,0,-3,-1,0,-7,3,-1,22,0,3,1,0,7,-3,1]).fill(0xbaf7ff);glint.position.set(options.align==='left'?10:0,options.size*.95);this.addChild(glint);
   this.entrance=gsap.timeline({onUpdate:options.draw});this.entrance.from(this,{alpha:0,duration:.24,ease:'power2.out'},0).from(this.ink,{y:8,duration:.3,ease:'power2.out'},0).from(this.ink.scale,{x:this.maxScale*.92,y:this.maxScale*.92,duration:.38,ease:'power3.out'},0).to(glint,{alpha:0,x:glint.x+46,duration:.48},.12);
  }
 }
 private parts(value:number){const formatted=money(Math.round(value));const [whole,cents]=formatted.replace('$','').split('.');return {prefix:this.options.plus?'+$':'$',whole,cents:'.'+cents};}
 private layout(value:number){const p=this.parts(value),s=this.options.size;this.prefix.text=p.prefix;this.integer.text=p.whole;this.decimals.text=p.cents;
  this.prefix.position.set(0,s*.30);this.integer.position.set(this.prefix.width+2,0);this.decimals.position.set(this.integer.x+this.integer.width+1,s*.26);
  return this.decimals.x+this.decimals.width;
 }
 private fit(){const width=Math.max(this.layout(this.state.target),this.layout(this.state.value));this.maxScale=Math.min(1,this.options.width/Math.max(1,width));this.ink.scale.set(this.maxScale);}
 private paint(value:number){const width=this.layout(value)*this.maxScale;this.ink.x=this.options.align==='right'?-width:this.options.align==='center'?-width/2:0;this.options.draw();}
 private animate(){
  this.count?.kill();const s=this.state;
  if(this.options.reduced||s.value===s.target){s.value=s.target;s.remaining=0;this.paint(s.value);return;}
  const duration=s.remaining;this.count=gsap.to(s,{value:s.target,remaining:0,duration,ease:'power2.out',onUpdate:()=>{
   this.paint(s.value);
  },onComplete:()=>{s.value=s.target;s.remaining=0;this.paint(s.target);}});
 }
 retarget(amount:number){this.count?.kill();Object.assign(this.state,moneyState(this.state,this.state.identity,amount,false));this.fit();this.animate();}
 override destroy(){this.count?.kill();this.entrance?.kill();super.destroy({children:true});}
}
