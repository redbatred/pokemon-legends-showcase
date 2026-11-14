import {Assets,Container,Graphics,Text} from 'pixi.js';
import {Spine,TextureAtlas,AtlasAttachmentLoader,SkeletonJson} from '@esotericsoftware/spine-pixi-v8';
import {guidePerformance} from './guidePerformance';
import {pickTaunt,TAUNT_PHASES,type Taunt,type TauntPhase} from './voiceBank';
import {createAnimeCel} from './animeCels';
import {guideLayout,type GuideCue,type GuideCueId} from './guideCue';
interface VoiceCue extends Taunt{step:number;envelope:number[];}
const base='/output/capture-motion-v25/';
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const out=(x:number)=>1-(1-clamp(x))**3;
/** Registered speech cels in Spine; original voice takes retain their cadence. */
/** `celsReady` settles once the ink cel behind the portrait is loaded; the guide's own files download meanwhile. */
export async function createAnimeGuide(celsReady:Promise<unknown>){
 const [atlas,json,metadata]=await Promise.all([Assets.load<TextureAtlas>(base+'assets/rocket-cels-v34.atlas'),Assets.load(base+'assets/rocket-cels-v34.json'),fetch(base+'audio/rocket/bank.json').then(r=>r.json() as Promise<Record<string,VoiceCue>>) ]);
 // The voice takes download with the scene, so the first tap does not wait for them; they are decoded when sound starts.
 const voices=Object.keys(metadata).map(id=>{const bytes=fetch(base+`audio/rocket/${id}.ogg`).then(r=>{if(!r.ok)throw Error('Guide voice missing');return r.arrayBuffer();});bytes.catch(()=>{});return [id,bytes] as const;});
 await celsReady;
 const rig=new Spine({skeletonData:new SkeletonJson(new AtlasAttachmentLoader(atlas)).readSkeletonData(json),autoUpdate:false});rig.eventMode='none';
 const container=new Container(),portrait=new Container(),art=new Container(),panel=new Graphics(),clip=new Graphics(),wipe=new Graphics(),ink=createAnimeCel('ink'),bubble=new Container(),paper=new Graphics();
 art.addChild(ink.rig,rig);art.mask=clip;portrait.addChild(panel,art,clip);portrait.mask=wipe;
 const label=new Text({text:'Jessie',style:{fontFamily:'Nunito',fontWeight:'900',fontStyle:'italic',fontSize:16,fill:0x655672}});
 const line=new Text({text:'',style:{fontFamily:'Nunito',fontWeight:'900',fontSize:28,fill:0x172b40,wordWrap:true,wordWrapWidth:350,lineHeight:32,align:'center'}});line.anchor.set(.5,0);label.anchor.set(.5,0);
 bubble.addChild(paper,label,line);container.addChild(portrait,bubble,wipe);container.eventMode='none';
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,caption=document.getElementById('guide-caption');
 const buffers=new Map<string,AudioBuffer>();let ctx:AudioContext|undefined,bus:AudioNode|undefined,voice:AudioBufferSourceNode|undefined,voiceGain:GainNode|undefined,lastCue='',lastLayout='';
 const previous:Partial<Record<TauntPhase,string>>={};
 let selected={} as Record<TauntPhase,Taunt>;
 function newRound(){for(const phase of TAUNT_PHASES){selected[phase]=pickTaunt(phase,previous[phase]);previous[phase]=selected[phase].id;}}
 newRound();
 function stop(){if(voice){try{voice.stop();}catch{}voice.disconnect();voice=undefined;}voiceGain?.disconnect();voiceGain=undefined;}
 async function prepare(context:AudioContext,destination:AudioNode){
  ctx=context;bus=destination;
  await Promise.all(voices.map(async([id,bytes])=>{buffers.set(id,await context.decodeAudioData((await bytes).slice(0)));}));
 }
 function swoosh(){
  if(!ctx||!bus)return;
  const len=Math.floor(ctx.sampleRate*.23),buffer=ctx.createBuffer(1,len,ctx.sampleRate),samples=buffer.getChannelData(0);let seed=76,low=0;
  for(let i=0;i<len;i++){seed=(seed*1664525+1013904223)>>>0;low=.82*low+.18*(seed/4294967296*2-1);samples[i]=low*Math.sin(i/len*Math.PI)**2*.19;}
  const node=ctx.createBufferSource();node.buffer=buffer;node.connect(bus);node.start();node.onended=()=>node.disconnect();
 }
 function sample(cue:GuideCue|null,w:number,h:number,playing:boolean){
  container.visible=!!cue&&cue.opacity>0;
  if(!cue){if(lastCue){stop();if(caption)caption.textContent='';}lastCue='';return false;}
  const {id,age,opacity}=cue,meta=metadata[selected[id].id],voiceAge=age-.16,l=guideLayout(w,h,id),speaking=voiceAge>=0&&voiceAge<meta.duration;
  if(lastCue!==id){stop();lastCue=id;if(caption)caption.textContent=meta.character+': '+meta.text;
   if(playing&&ctx&&bus&&voiceAge<meta.duration){if(age<.25)swoosh();voice=ctx.createBufferSource();voice.buffer=buffers.get(meta.id)!;voiceGain=ctx.createGain();voiceGain.gain.value=.78;voice.connect(voiceGain).connect(bus);voice.start(ctx.currentTime+Math.max(0,-voiceAge),Math.max(0,voiceAge));}
  }
  if(voiceGain&&ctx)voiceGain.gain.setTargetAtTime(.78*opacity,ctx.currentTime,.035);
  const enter=reduced?1:out(age/.32),balloon=reduced?1:out((age-.13)/.22),exit=1-opacity,side=l.right?1:-1;
  container.alpha=age<.3?1:opacity;
  portrait.x=reduced?0:side*((1-enter)*(l.size+65)+exit*(l.size+65));
  portrait.y=reduced?0:-5*Math.exp(-Math.max(0,age-.22)*12)*Math.sin(Math.max(0,age-.22)*30);
  rig.position.set(l.portraitX,l.portraitY);rig.scale.set(l.size/512);
  const amp=speaking?(meta.envelope[Math.floor(voiceAge/meta.step)]??0):0;
  const performance=guidePerformance(meta,age,amp,reduced);
  rig.skeleton.setAttachment('art',`frame${String(performance.frame).padStart(2,'0')}`);
  const bone=rig.skeleton.findBone('portrait')!;
  bone.rotation=performance.rotation;bone.y=performance.offset;
  rig.skeleton.findBone('head')!.rotation=performance.head;
  rig.skeleton.findBone('hair')!.rotation=performance.hair;
  rig.skeleton.findBone('gesture')!.rotation=performance.gesture;
  // A short recoil on stressed syllables complements, rather than replaces, the drawn pose changes.
  portrait.x+=side*performance.accent*3;
  rig.update(0);
  ink.sample(1+Math.floor((age*9)%4));ink.rig.position.set(l.portraitX,l.portraitY);ink.rig.scale.set(l.size/512);ink.rig.alpha=reduced?.16:.25;ink.rig.tint=id==='caught'?0xf897a3:0xcab5e8;
  bubble.position.set(l.bubbleX+(reduced?0:-side*(1-balloon)*75),l.bubbleY+(1-balloon)*12);bubble.alpha=balloon*opacity;bubble.pivot.set(0,0);bubble.scale.set(1,.84+.16*balloon);
  wipe.clear().rect(l.right?w-(l.size+70)*enter:0,0,(l.size+70)*enter,h).fill(0xffffff);
  const key=`${w}:${h}:${id}`;
  if(key!==lastLayout){lastLayout=key;
   const x0=l.right?w-l.size:-12,x1=l.right?w+12:l.size,y0=l.portraitY-l.size*.5+2,y1=l.portraitY+l.size*.5;
   const points=l.right?[x0,y0,x1,y0+33,x1,y1,x0+24,y1]:[x0,y0+33,x1,y0,x1-24,y1,x0,y1];
   panel.clear().poly(points).fill(0x272638).stroke({color:0x091221,width:9}).poly(points).stroke({color:0xe8e4ee,width:3});clip.clear().poly(points).fill(0xffffff);
   const bw=l.bubbleW,bh=l.bubbleH;
   paper.clear();
   // Manga balloon, with a curved tail that points toward the speaking face.
   paper.moveTo(bw*.16,4).bezierCurveTo(bw*.42,-7,bw*.88,-1,bw*.97,bh*.25).bezierCurveTo(bw*1.03,bh*.51,bw*.96,bh*.82,bw*.82,bh*.94).bezierCurveTo(bw*.58,bh*1.04,bw*.20,bh*1.02,bw*.06,bh*.79).bezierCurveTo(-bw*.04,bh*.53,-bw*.015,bh*.16,bw*.16,4).closePath().fill(0xfffdf4).stroke({color:0x101a2b,width:4});
   if(l.right)paper.moveTo(bw-12,bh*.47).quadraticCurveTo(bw+11,bh*.50,bw+26,bh*.29).quadraticCurveTo(bw+15,bh*.67,bw-8,bh*.69).fill(0xfffdf4).stroke({color:0x101a2b,width:3});
   else paper.moveTo(12,bh*.47).quadraticCurveTo(-11,bh*.50,-26,bh*.29).quadraticCurveTo(-15,bh*.67,8,bh*.69).fill(0xfffdf4).stroke({color:0x101a2b,width:3});
   label.position.set(bw*.5,17);line.position.set(bw*.5,43);line.style.wordWrapWidth=bw*.82;line.style.fontSize=26;line.style.lineHeight=29;
  }
  label.text=meta.character;
  const reveal=reduced?1:clamp((age-.22)/.38);line.text=meta.text.slice(0,Math.ceil(meta.text.length*reveal));
  return speaking&&playing&&opacity>.1;
 }
 return{container,prepare,sample,newRound,selection:()=>selected,duration:(id:GuideCueId)=>selected[id].duration,reset(){stop();lastCue='';container.visible=false;if(caption)caption.textContent='';},destroy(){stop();container.destroy({children:true});}};
}
