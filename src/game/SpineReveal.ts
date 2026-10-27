import { Assets,Container,Graphics,Sprite,Texture } from 'pixi.js';
import { Spine,SpineTexture,TextureAtlas,AtlasAttachmentLoader,SkeletonJson,type SkeletonData } from '@esotericsoftware/spine-pixi-v8';
import { playSound } from './audio';

let ballData:SkeletonData|undefined;
const heroData=new Map<string,SkeletonData>();
function skeleton(texture:Texture,regions:string,json:unknown){
  const atlas=new TextureAtlas(`reveal.png\nsize: ${texture.width},${texture.height}\nfilter: Linear,Linear\npma: false\n${regions}`);
  atlas.pages[0].setTexture(SpineTexture.from(texture.source));
  return new SkeletonJson(new AtlasAttachmentLoader(atlas)).readSkeletonData(json);
}
function pokeball(){
  if(!ballData){
    const canvas=document.createElement('canvas');canvas.width=384;canvas.height=128;const c=canvas.getContext('2d')!;
    for(let i=0;i<2;i++){
      c.save();c.translate(i*128,0);c.beginPath();c.rect(0,i?64:0,128,64);c.clip();
      const g=c.createRadialGradient(44,34,3,70,68,65);g.addColorStop(0,i?'#ffffff':'#ff8b9c');g.addColorStop(.48,i?'#eef7ff':'#ee3655');g.addColorStop(1,i?'#8ea9c8':'#9d1640');
      c.fillStyle=g;c.strokeStyle='#10233e';c.lineWidth=7;c.beginPath();c.arc(64,64,52,0,Math.PI*2);c.fill();c.stroke();c.beginPath();c.moveTo(12,64);c.lineTo(116,64);c.stroke();
      if(!i){c.fillStyle='rgba(255,255,255,.65)';c.beginPath();c.ellipse(42,31,16,7,-.55,0,Math.PI*2);c.fill();}c.restore();
    }
    c.translate(256,0);c.fillStyle='#f7fbff';c.strokeStyle='#10233e';c.lineWidth=7;c.beginPath();c.arc(64,64,16,0,Math.PI*2);c.fill();c.stroke();c.strokeStyle='#8eabc7';c.lineWidth=2;c.beginPath();c.arc(64,64,8,0,Math.PI*2);c.stroke();
    const texture=Texture.from(canvas);
    ballData=skeleton(texture,'upper\n  bounds: 0,0,128,128\nlower\n  bounds: 128,0,128,128\nbutton\n  bounds: 256,0,128,128\n',{
      skeleton:{spine:'4.2.22'},bones:[{name:'root'},{name:'orb',parent:'root'},{name:'lower',parent:'orb'},{name:'upper',parent:'orb'},{name:'button',parent:'orb'}],
      slots:[{name:'lower',bone:'lower',attachment:'lower'},{name:'upper',bone:'upper',attachment:'upper'},{name:'button',bone:'button',attachment:'button'}],
      skins:[{name:'default',attachments:Object.fromEntries(['lower','upper','button'].map(name=>[name,{[name]:{width:128,height:128}}]))}],
      animations:{open:{bones:{upper:{translate:[{},{time:.32,x:-23,y:62}],rotate:[{},{time:.32,value:48}]},button:{scale:[{},{time:.15,x:0,y:0}]},orb:{scale:[{},{time:.12,x:1.08,y:.9},{time:.35,x:1,y:1}]}}},idle:{bones:{orb:{rotate:[{value:-2},{time:1.3,value:2},{time:2.6,value:-2}]}}}}
    });
  }
  const rig=new Spine({skeletonData:ballData,autoUpdate:false});rig.update(0);return rig;
}
async function pokemon(path:string){
  let data=heroData.get(path);
  if(!data){
    const texture=await Assets.load<Texture>(path),uvs:number[]=[],vertices:number[]=[],triangles:number[]=[],deform:number[]=[];const n=8;
    for(let y=0;y<=n;y++)for(let x=0;x<=n;x++){const u=x/n,v=y/n;uvs.push(u,v);vertices.push((u-.5)*350,(.5-v)*350);deform.push((u-.5)*3*Math.sin(v*Math.PI),Math.sin(v*Math.PI)*3.5);if(x<n&&y<n){const a=y*(n+1)+x;triangles.push(a,a+1,a+n+1,a+1,a+n+2,a+n+1);}}
    data=skeleton(texture,`hero\n  bounds: 0,0,${texture.width},${texture.height}\n`,{
      skeleton:{spine:'4.2.22'},bones:[{name:'root'},{name:'body',parent:'root'}],slots:[{name:'hero',bone:'body',attachment:'hero'}],
      skins:[{name:'default',attachments:{hero:{hero:{type:'mesh',uvs,triangles,vertices,hull:0,width:350,height:350}}}}],
      animations:{idle:{bones:{body:{translate:[{},{time:1.25,y:4},{time:2.5}],rotate:[{value:-.6},{time:1.25,value:.6},{time:2.5,value:-.6}]}},attachments:{default:{hero:{hero:{deform:[{},{time:1.25,vertices:deform},{time:2.5}]}}}}}}
    });heroData.set(path,data);
  }
  const rig=new Spine({skeletonData:data,autoUpdate:false});rig.state.setAnimation(0,'idle',true);rig.update(0);return rig;
}

/** An artwork-based Spine rig: whole-image mesh breathing, not an articulated studio character rig. */
export class SpineReveal {
  root=new Container();cardShell=new Container();private left=new Container();private right=new Container();
  private ball:Spine;private hero:Spine;private cover:Sprite;private coverMask=new Graphics();private aura=new Graphics();
  private rip={amount:0};
  static async create(card:Texture,pokemonImage:string){return new SpineReveal(card,await pokemon(pokemonImage));}
  private constructor(card:Texture,hero:Spine){
    this.hero=hero;this.ball=pokeball();const characters=new Container({isRenderGroup:true});characters.addChild(this.aura,this.hero,this.ball);this.root.addChild(this.cardShell,characters);
    const seam:number[]=[];for(let i=0;i<=24;i++)seam.push((i%2?1:-1)*(3+(i%5)), -217.5+i*435/24);
    for(const [group,side] of [[this.left,-1],[this.right,1]] as const){
      const face=new Sprite(card);face.anchor.set(.5);face.width=312;face.height=435;
      const points=side<0?[-156,-217.5,...seam,-156,217.5]:[156,-217.5,...seam,156,217.5];
      const mask=new Graphics().poly(points).fill(0xffffff),fibers=new Graphics().moveTo(seam[0],seam[1]);for(let i=2;i<seam.length;i+=2)fibers.lineTo(seam[i],seam[i+1]);fibers.stroke({color:0xe9edf4,width:1.6});group.addChild(face,mask,fibers);face.mask=mask;this.cardShell.addChild(group);
    }
    this.cover=new Sprite(card);this.cover.anchor.set(.5);this.cover.width=312;this.cover.height=435;this.cover.mask=this.coverMask;this.cardShell.addChild(this.cover,this.coverMask);this.cardShell.visible=false;
    this.hero.visible=false;this.hero.position.set(16,200);this.hero.scale.set(.04);this.hero.alpha=0;
    this.ball.scale.set(.64);this.ball.position.set(0,-700);
    this.aura.circle(0,0,95).fill({color:0xb9f4ff,alpha:.12}).circle(0,0,55).fill({color:0xf6ffff,alpha:.3});this.aura.position.set(16,200);this.aura.alpha=0;
  }
  play(timeline:gsap.core.Timeline,skyY:number,onImpact:()=>void){
    this.ball.y=skyY;
    timeline.to(this.ball,{y:-155,rotation:5.8,duration:.58,ease:'power2.in'},0)
      .call(()=>{this.cardShell.visible=true;onImpact();playSound('tear');},[],.58)
      .to(this.rip,{amount:1,duration:.43,ease:'power1.inOut',onUpdate:()=>{const a=this.rip.amount;this.left.x=-32*a;this.right.x=32*a;this.left.rotation=-.075*a;this.right.rotation=.075*a;this.coverMask.clear().rect(-157,-218+436*a,314,Math.max(0,436*(1-a))).fill(0xffffff);this.cover.visible=a<.999;}},.58)
      .to(this.ball,{x:16,y:225,rotation:7.2,duration:.46,ease:'power1.in'},.58)
      .to(this.ball,{y:180,rotation:6.3,duration:.19,ease:'power2.out'},1.04)
      .to(this.ball,{y:185,rotation:Math.PI*2,duration:.16,ease:'power2.in'},1.23)
      .call(()=>{this.ball.state.setAnimation(0,'open',false);this.hero.visible=true;playSound('rare');},[],1.4)
      .to(this.aura,{alpha:1,duration:.12},1.4).to(this.aura.scale,{x:2.5,y:2.5,duration:.6,ease:'power2.out'},1.4).to(this.aura,{alpha:0,duration:.42,onComplete:()=>{this.aura.visible=false;}},1.57)
      .to(this.hero,{y:-28,alpha:1,duration:.54,ease:'power3.out'},1.45).to(this.hero.scale,{x:1.06,y:1.06,duration:.64,ease:'back.out(1.35)'},1.45)
      .to(this.ball,{alpha:.8,duration:.4},1.8).to({}, {duration:.28});
  }
  update(dt:number){this.ball.update(dt);this.hero.update(dt);}
  takeCard(){this.cardShell.removeFromParent();return this.cardShell;}
  destroy(){this.root.destroy({children:true});}
}
