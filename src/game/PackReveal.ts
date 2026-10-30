import {Container,Graphics,PerspectiveMesh,Text,Texture} from 'pixi.js';
import {createFoil,foilStrength} from './foil';
import {SpecialCardFrame} from './SpecialCardFrame';
import {isSpecialCard} from './specialCard';
import {cardPowerKind} from './powerProfiles';
import {money,type Card} from './model';
import {packRevealLayout,packRevealPose,PACK_REVEAL} from './packRevealMotion';

/** A single stage formation. Cards share a flip beat and retain their meshes
 * when they leave for the tray, so the transition never swaps in a screenshot. */
export class PackReveal {
 readonly root=new Container();
 readonly items;
 time=0;
 private width=0;private height=0;
 constructor(cards:Card[],textures:Texture[],private back:Texture,low:boolean){
  this.root.eventMode='none';
  this.items=cards.map((card,i)=>{
   const flight=new Container(),mesh=new PerspectiveMesh({texture:back,verticesX:4,verticesY:6}),special=isSpecialCard(card);
   const shadow=new Graphics().roundRect(-158,-216,316,438,15).fill({color:0x031729,alpha:.38});shadow.position.set(3,7);flight.addChild(shadow,mesh);
   const frame=special?new SpecialCardFrame(312,435,cardPowerKind(card),card.rarity,low):null;
   if(frame){frame.visible=false;flight.addChild(frame);}
   const foil=special&&!low?createFoil(foilStrength(card.rarity,card.value)):null;
   const price=new Container(),chip=new Graphics(),label=new Text({text:money(card.value),style:{fontFamily:'Nunito, Arial, sans-serif',fontWeight:'800',fontSize:17,fill:special?0xffedac:0xd9fcff},resolution:Math.max(2,Math.min(3,devicePixelRatio))});label.anchor.set(.5);price.addChild(chip,label);price.alpha=0;
   this.root.addChild(flight,price);
   return {flight,mesh,frame,foil,price,chip,label,special,texture:textures[i],front:false,taken:false};
  });
 }
 render(time:number,w:number,h:number,source:{x:number;y:number;scale:number}){
  this.time=time;const layout=packRevealLayout(w,h,this.items.length),resize=this.width!==w||this.height!==h;this.width=w;this.height=h;
  this.items.forEach((item,i)=>{
   if(item.taken)return;
   const slot=layout.slot(i),pose=packRevealPose(time,i),p=pose.spread,scale=source.scale+(slot.width/312-source.scale)*p;
   item.flight.position.set(source.x+(slot.x-source.x)*p,source.y+(slot.y-source.y)*p-Math.sin(Math.PI*p)*30);
   item.flight.scale.set(scale*(1+pose.pulse*.035));item.flight.rotation=(i-(this.items.length-1)/2)*.014*(1-p);
   if(item.front!==pose.front){item.front=pose.front;item.mesh.texture=pose.front?item.texture:this.back;item.mesh.filters=pose.front&&item.foil?[item.foil]:[];}
   const corners:number[]=[];
   for(const [x,y] of [[-156,-217.5],[156,-217.5],[156,217.5],[-156,217.5]]){const perspective=740/(740-x*Math.sin(pose.flip));corners.push(x*Math.cos(pose.flip)*perspective,y*perspective);}
   item.mesh.setCorners(corners[0],corners[1],corners[2],corners[3],corners[4],corners[5],corners[6],corners[7]);
   if(item.foil){const u=item.foil.resources.foil.uniforms;u.uTime=time;u.uSweep=-.9+Math.min(1,(time-PACK_REVEAL.face)/.8)*1.8;}
   if(item.frame){item.frame.visible=time>=PACK_REVEAL.settled;item.frame.alpha=pose.price;}
   item.price.alpha=pose.price;item.price.position.set(slot.x,slot.y+slot.height/2+layout.priceHeight/2+4*(1-pose.price));
   if(resize){
    const width=slot.width+4,height=layout.priceHeight-3,color=item.special?0xffe9a4:0x96eaff;
    item.chip.clear().roundRect(-width/2,-height/2,width,height,4).fill({color:0x062744,alpha:.94}).stroke({color,width:1,alpha:.55});
    item.label.style.fontSize=Math.max(8,Math.min(18,slot.width*.2));item.label.scale.set(1);if(item.label.width>width-7)item.label.scale.set((width-7)/item.label.width);
   }
  });
 }
 update(dt:number){for(const item of this.items)if(!item.taken&&item.frame?.visible)item.frame.update(dt);}
 takeFlight(index:number){const item=this.items[index];item.taken=true;item.mesh.filters=[];item.frame?.destroy();item.price.destroy({children:true});item.flight.removeFromParent();return item.flight;}
 destroy(){for(const item of this.items)item.foil?.destroy();this.root.destroy({children:true});}
}
