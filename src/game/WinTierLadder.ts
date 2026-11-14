import {Container,Text} from 'pixi.js';
import {winTierProfile,type CinemaTier} from './winChoreography';
import {ladderPose,TIER_PALETTE,winLadder} from './winJuiceMotion';

type Rung={root:Container;letters:Text[];shine:Text[];tier:CinemaTier};
/** Lower tiers land on earlier strikes and shatter when the next one arrives. Labels only. */
export class WinTierLadder{
 readonly root=new Container();private rungs:Rung[];
 constructor(private tier:CinemaTier){
  this.root.eventMode='none';
  this.rungs=winLadder(tier).map(({tier:name})=>{
   const palette=TIER_PALETTE[name],root=new Container(),letters:Text[]=[],shine:Text[]=[];
   for(const char of winTierProfile(name).title){
    const letter=new Text({text:char,style:{fontFamily:'BattleDisplay, Arial',fontSize:64,fill:palette.fill,stroke:{color:0x061b32,width:7},dropShadow:{color:palette.edge,blur:0,distance:8,angle:Math.PI/2}},resolution:2});letter.anchor.set(.5);
    const light=new Text({text:char,style:{fontFamily:'BattleDisplay, Arial',fontSize:64,fill:0xffffff},resolution:2});light.anchor.set(.5);light.blendMode='add';light.alpha=0;
    letters.push(letter);shine.push(light);root.addChild(letter,light);
   }
   root.visible=false;this.root.addChild(root);return {root,letters,shine,tier:name};
  });
 }
 update(age:number,w:number,h:number,x:number,y:number,reduced=false,size=Math.min(w*.135,h*.085)){
  const pose=ladderPose(age,this.tier,reduced);
  // Draw every rung once, unseen, while the Pokémon is still charging: no glyph is first rasterised on its own slam.
  if(age<.45&&!reduced){for(const rung of this.rungs){rung.root.visible=true;rung.root.alpha=.004;rung.root.scale.set(1);rung.root.position.set(x,y);rung.letters.forEach((letter,i)=>{letter.style.fontSize=rung.shine[i].style.fontSize=size;rung.shine[i].alpha=1;});}return;}
  this.rungs.forEach((rung,index)=>{
   const current=index===pose.index,leaving=index===pose.previous;rung.root.visible=(current&&pose.alpha>0)||leaving;if(!rung.root.visible)return;
   const count=rung.letters.length,advance=size*.5,start=-(count-1)*advance/2,gone=leaving?Math.max(0,Math.min(1,(age-winLadder(this.tier)[pose.index].time+.12)/.18)):pose.exit;
   rung.root.position.set(x,y);rung.root.scale.set(leaving?1:pose.scale);rung.root.rotation=leaving?-.035:pose.rotation;rung.root.alpha=leaving?1-gone:pose.alpha;
   rung.letters.forEach((letter,i)=>{
    const side=i-(count-1)/2,light=rung.shine[i];letter.style.fontSize=light.style.fontSize=size;
    // A departing rung bursts outward from its centre and falls away.
    letter.position.set(start+i*advance+side*gone*size*.9,gone*gone*size*1.6-Math.sin(gone*Math.PI)*size*.5+(leaving||reduced?0:Math.sin(age*3.1+i*.7)*size*.02));letter.rotation=side*gone*.45;
    light.position.copyFrom(letter.position);light.rotation=letter.rotation;light.alpha=leaving?0:pose.flash*.9;
   });
  });
 }
 destroy(){this.root.destroy({children:true});}
}
