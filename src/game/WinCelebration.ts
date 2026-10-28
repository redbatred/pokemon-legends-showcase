import {Assets,Container,Graphics,Sprite,Text,Texture} from 'pixi.js';
import type {WinTier} from './winTransfer';
import {rewardLayout} from './modalLayout';
export function specialWinGeometry(w:number,h:number){const stone=rewardLayout(w,h),width=Math.min(640,w*.94);return {x:w/2,y:stone.y-width*.06,width,amountY:stone.y+width*.04,size:Math.min(52,width*.09)};}
/** A cel-painted crest, live typography and one directional impact, never an idle overlay. */
export class WinCelebration {
 root=new Container();private shade=new Graphics();private rays=new Graphics();private crest=new Sprite(Texture.EMPTY);private title:Text;
 constructor(tier:Exclude<WinTier,null>){
  this.title=new Text({text:tier==='epic'?'EPIC WIN!':tier==='big'?'BIG WIN!':'SPECIAL PULL',style:{fontFamily:'Nunito',fontWeight:'900',fontStyle:'italic',fontSize:54,fill:0xfff59a,stroke:{color:0x123b75,width:5}},resolution:2});this.title.anchor.set(.5);this.crest.anchor.set(.5);this.root.addChild(this.shade,this.rays,this.crest,this.title);this.root.eventMode='none';
  void Assets.load<Texture>('/assets/ui/win-crest-v1.png').then(texture=>{if(!this.root.destroyed)this.crest.texture=texture;}).catch(()=>{});
 }
 update(age:number,w:number,h:number,hold:number){
  const g=specialWinGeometry(w,h),enter=Math.min(1,age/.18),fade=Math.max(0,Math.min(1,(hold+.42-age)/.16)),pop=1+Math.sin(enter*Math.PI)*.10;
  this.root.alpha=fade;this.shade.clear().rect(0,0,w,h).fill({color:0x061b42,alpha:enter*.27});
  this.crest.position.set(g.x,g.y);this.crest.width=g.width*pop;this.crest.height=g.width*(793/1983)*pop;this.crest.alpha=enter;
  this.title.position.set(g.x,g.y+g.width*.023);this.title.scale.set(Math.min(g.width*.58/this.title.width*this.title.scale.x,g.width/640)*pop);this.title.alpha=enter;
  const rays=this.rays.clear(),hit=Math.max(0,1-age/.42),extent=(1-hit)*72;
  if(hit)for(const side of [-1,1])for(let i=0;i<5;i++){const x=g.x+side*(g.width*.38+extent+i*13),y=g.y+(i-2)*22;rays.poly([x,y,x+side*(30+i*6),y-7,x+side*8,y+3]).fill({color:i%2?0xeaffff:0x65d8ff,alpha:hit*.8});}
 }
 destroy(){this.root.destroy({children:true});}
}
