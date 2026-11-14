import {finalStrike} from './finalStrike';
import {digitKinetics} from './digitKinetics';
import {BitmapText,Container} from 'pixi.js';
import {money} from './model';
import {WIN_CINEMA_FINISH} from './winCinemaMotion';
type Digit={root:Container;glyph:BitmapText;depth:BitmapText;char:string;x:number;changed:number};
/** Crisp complete glyphs: the attack drives a short compression wave, never chopped reels. */
export class RollingWinDigits{
 readonly root=new Container();private digits:Digit[]=[];private value=0;private last=0;
 constructor(private size:number,private width:number,private target:number){}
 display(value:number){this.value=value;}
 sample(age:number,reduced=false,beat?:{age:number;strength:number}){
  const dt=Math.min(.06,Math.max(0,age-this.last)),text=money(Math.round(this.value)),final=age>=WIN_CINEMA_FINISH,decimal=text.indexOf('.');
  const sizes=[...text].map((_,i)=>this.size*(i===0?.57:i>=decimal?.64:1)),widths=sizes.map((s,i)=>s*(/[.,]/.test(text[i])?.25:.55)),span=widths.reduce((a,b)=>a+b,0);
  this.root.scale.set(Math.min(1,this.width/(money(this.target).length*this.size*.55*1.12)));let x=-span/2;
  for(let i=0;i<text.length;i++){
   let d=this.digits[i];if(!d){const root=new Container(),glyph=new BitmapText({text:'',style:{fontFamily:'BattleMoney',fontSize:this.size}});glyph.anchor.set(.5);const depth=new BitmapText({text:'',style:{fontFamily:'BattleMoney',fontSize:this.size}});depth.anchor.set(.5);depth.tint=0x9c4b23;root.addChild(depth,glyph);this.root.addChild(root);d={root,glyph,depth,char:'',x:x+widths[i]/2,changed:age};this.digits.push(d);}
   if(d.char!==text[i]){d.char=text[i];d.glyph.text=d.char;d.depth.text=d.char;d.changed=age;}
   const toX=x+widths[i]/2;d.x=reduced||this.last===0?toX:d.x+(toX-d.x)*(1-Math.exp(-dt*40));d.root.x=d.x;d.root.visible=true;d.glyph.style.fontSize=sizes[i];d.depth.style.fontSize=sizes[i];d.depth.y=this.size*(final?.065:.035);d.depth.tint=final?0x9c4b23:0x16617e;
   const strike=[1.78,3.55,4.55,WIN_CINEMA_FINISH].reduce((v,t)=>age>=t?t:v,-9);
   const motion=final?{y:0,scaleX:1,scaleY:1,rotation:0,light:finalStrike(age,reduced).hit*.85}:digitKinetics(age-d.changed,beat?.age??age-strike,beat?.strength??.65,i,reduced);
   d.root.y=(/[.,]/.test(d.char)?this.size*.18:i===0?this.size*.06:i>=decimal?this.size*.16:0)+motion.y*this.size;
   d.root.scale.set(motion.scaleX,motion.scaleY);d.root.rotation=motion.rotation;
   const base=final?0xffdf80:age>4.55?0xffe9a3:0xf4fcff;let tint=0;for(const shift of [16,8,0])tint|=Math.round(((base>>shift)&255)*(1-motion.light)+255*motion.light)<<shift;d.glyph.tint=tint;x+=widths[i];
  }
  for(let i=text.length;i<this.digits.length;i++)this.digits[i].root.visible=false;this.last=age;
 }
 destroy(){this.root.destroy({children:true});}
}
