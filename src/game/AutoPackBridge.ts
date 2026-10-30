import {Container,Graphics,Sprite,Text,Texture} from 'pixi.js';
import {ResultWin} from './ResultWin';
import {moneyState} from './moneyMotion';
/** A live, responsive award over a frozen arena, held until the wrapper is ready. */
export class AutoPackBridge extends Container {
 private backdrop:Sprite;private overlay=new Container();private widthNow=0;private heightNow=0;
 private winState;private award:ResultWin|null=null;
 constructor(texture:Texture,private info:{completed:number;total:number;amount:number;reduced:boolean;turbo:boolean;low:boolean},private draw:()=>void){
  super();this.backdrop=new Sprite(texture);this.backdrop.anchor.set(.5);this.addChild(this.backdrop,this.overlay);this.eventMode='none';
  this.winState=moneyState(undefined,'bridge',info.amount,true);
 }
 layout(w:number,h:number){
  if(w===this.widthNow&&h===this.heightNow)return;this.widthNow=w;this.heightNow=h;
  this.backdrop.position.set(w/2,h/2);this.backdrop.scale.set(Math.max(w/this.backdrop.texture.width,h/this.backdrop.texture.height));
  this.overlay.removeChildren().forEach(c=>c.destroy({children:true}));
  const label=(value:string,x:number,y:number,size:number,color=0xf3fbff)=>{const text=new Text({text:value,style:{fontFamily:'Nunito,Arial,sans-serif',fontSize:size,fontWeight:'800',fill:color,stroke:{color:0x052344,width:2}},resolution:3});text.anchor.set(.5,0);text.position.set(x,y);this.overlay.addChild(text);return text;};
  label(`PACK ${this.info.completed} / ${this.info.total}`,w/2,h<430?45:Math.max(85,h*.25),h<430?17:24);
  this.award=new ResultWin(this.winState,{width:Math.min(w-32,680),height:Math.min(210,h*.35),mode:'interlude',...this.info,draw:this.draw});
  this.award.position.set(w/2,h*.49);this.overlay.addChild(this.award);
  label('NEXT PACK',w/2,h*.72,h<430?11:14,0xb2efff);
  const bw=Math.min(166,w-60),x=w/2-bw/2,y=h-58;
  this.overlay.addChild(new Graphics().poly([x+10,y,x+bw-10,y,x+bw,y+10,x+bw,y+28,x+bw-10,y+38,x+10,y+38,x,y+28,x,y+10]).fill(0x12344f).stroke({color:0x4b7891,width:1.5}));
  const stop=label('STOP AUTO',w/2,y+19,12,0xa3c2d9);stop.anchor.set(.5);
 }
 override destroy(){if(this.destroyed)return;const texture=this.backdrop.texture;super.destroy({children:true});texture.destroy(true);}
}
