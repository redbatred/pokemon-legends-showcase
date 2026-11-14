import {captureFlight,captureKnock,captureSceneImpulse,conversionProgress} from './captureKinetics';
import {extendRewardAudio} from './rewardReactionAudio';
import {createVerdictAudio} from './verdictAudio';
import {createThrowButton} from './throwButton';
import {createAnimeGuide} from './animeGuide';
import {guideCue,type GuideCue,ARRIVE_HOLD} from './guideCue';
let inspectedGuide:GuideCue|null=null;
import {loadPremiumCels,createPremiumCel} from './premiumCels';
import {nextPresentationStop} from './presentationSkip';
import {ENTRY_START,entryShot,exitShot} from './choreography';
import {loadCaptureSeals} from '../../src/game/showdown/CaptureSealFrames';
import {loadAnimeCels,createAnimeCel} from './animeCels';
import {createModeTransition} from './modeTransition';
import {createBallVerdict} from './ballVerdict';
import {usesBallInterior} from './ballDepth';
import {loadNativeCurrent,createNativeCurrent} from './nativeCurrent';
import {storyTime,playbackTime} from './timing';
import {createCavernMotion} from './cavernMotion';
import {ThrowGate,THROW_AT} from './throwGate';
import {createBonusPrelude} from './bonusPrelude';
import {createCinematicEye} from './cinematicEye';
import {createFrameSequence} from './frameSequence';
import {createEncounterActor} from './encounterActor';
import {createCardReveal} from './cardReveal';
import {createEnergyTransfer} from './energyTransfer';
import {encounter} from './encounter';
import {Application,Assets,Container,Sprite,Texture,Text,Rectangle,ColorMatrixFilter} from 'pixi.js';
import {AtlasAttachmentLoader,SkeletonJson,Spine,type SkeletonData,type TextureAtlas} from '@esotericsoftware/spine-pixi-v8';
import {DURATION,clamp,smooth,mix,outcomeFromByte,camera,type Outcome} from './model';
import {createLightLayer} from './lightLayer';
import {createCavernAtmosphere} from './cavernAtmosphere';
import {createEnergyBeam} from './energyBeam';
import {createEnergyBody} from './energyBody';
import {PokeBall3D} from '../../src/game/PokeBall3D';
import {juiceUp} from '../../src/game/winJuiceMotion';
import {Quaternion,Vector3} from 'three';
import {prepareBattleFont} from '../../src/game/battleFont';
import {keepTextCanvasesInMemory} from '../../src/game/canvasUploads';

const ENTRY_AT=ENTRY_START;
const embedded=new URLSearchParams(location.search).has('embed');const hostAspect=Number(new URLSearchParams(location.search).get('aspect'))||0;if(embedded)document.body.classList.add('embedded');
const base='/output/capture-motion-v25/',host=document.getElementById('stage')!,play=document.getElementById('play') as HTMLButtonElement,record=document.getElementById('record') as HTMLButtonElement,status=document.getElementById('status')!,save=document.getElementById('save') as HTMLAnchorElement,choice=document.getElementById('outcome') as HTMLSelectElement;
keepTextCanvasesInMemory();
// Every download starts here, side by side, and each is awaited further down where it is first needed. Awaited one stage
// after another, each stage cost a round trip to the server before the next could begin: seconds on a phone connection.
// The game shows how far along this is while the player waits: `captureLoad.progress` is the share of downloads that have settled.
let asked=0,settled=0;(window as any).captureLoad={get progress(){return asked?settled/asked:0;}};
const early=<T>(work:Promise<T>)=>{asked++;const done=()=>{settled++;};work.then(done,done);return work;};
const all=<T extends unknown[]>(...works:{[K in keyof T]:Promise<T[K]>})=>early(Promise.all(works.map(early)) as Promise<T>);
// Music ships as FLAC: the same samples in a third of the bytes. The WAV beside it is fetched only by a browser that cannot decode FLAC.
const sound=(name:string)=>{const bytes=early(fetch(base+'audio/'+name+'.flac').then(r=>{if(!r.ok)throw Error('Audio missing: '+name);return r.arrayBuffer()}));
 return async(ctx:BaseAudioContext)=>{try{return await ctx.decodeAudioData((await bytes).slice(0));}catch{const r=await fetch(base+'audio/'+name+'.wav');if(!r.ok)throw Error('Audio missing: '+name);return ctx.decodeAudioData(await r.arrayBuffer());}};};
const sceneFiles=all(
 Assets.load<Texture>(base+'assets/cave.webp'),Assets.load<Texture>('/assets/stage/pokemon-anime-arena-v2.png'),Assets.load<Texture>(encounter.cardUrl),Assets.load<Texture>('/assets/card-back.webp'),Assets.load<Texture>('/assets/showdown-v10/shadow.png'),Assets.load<Texture>(base+'assets/receiver.webp'),
 Assets.load<TextureAtlas>(base+'assets/mewtwo.atlas'),Assets.load(base+'assets/mewtwo.json'),Assets.load<TextureAtlas>(base+'assets/capture.atlas'),Assets.load(base+'assets/effects.json'),Assets.load<Texture>(base+'assets/smoke-sequence.webp'),Assets.load<TextureAtlas>(base+'assets/limb-flow.atlas'),Assets.load(base+'assets/limb-flow.json'),Assets.load<TextureAtlas>(base+'assets/'+encounter.id+'-conversion.atlas'),Assets.load(base+'assets/'+encounter.id+'-conversion.json'),Assets.load<TextureAtlas>(base+'assets/eye-sequence.atlas'),Assets.load(base+'assets/eye-sequence.json'),Assets.load(base+'assets/drawn-metadata.json'));
const fontLoading=early(document.fonts.load('800 24px Nunito')),battleFontLoading=prepareBattleFont().catch(()=>{}),celsLoading=all(loadCaptureSeals(),loadNativeCurrent(),loadAnimeCels(),loadPremiumCels());
const characterLoading=early(createEncounterActor(encounter)),guideLoading=early(createAnimeGuide(celsLoading)),verdictAudio=createVerdictAudio();
const packLoading=early(Assets.load<Texture>('/assets/pack.webp')),triggerLoading=Promise.all(['001','011','047'].map(id=>early(Assets.load<Texture>('/assets/sets/crown-zenith/cards/'+id+'.webp'))));
const music=sound('music-loop'),scores=['capture','escape'].map(name=>sound(encounter.audioPrefix+name+'-score'));
const app=new Application();await app.init({width:1280,height:720,antialias:true,resolution:1,background:0x192d41,preference:'webgl',preserveDrawingBuffer:!embedded});app.stop();host.append(app.canvas);
await fontLoading;
const [background,stadium,card,back,shadowTex,receiverTex,charAtlas,charJSON,fxAtlas,fxJSON,smokeTexture,flowAtlas,flowJSON,drawnAtlas,drawnJSON,eyeAtlas,eyeJSON,drawnMeta]=await sceneFiles;
const charData=new SkeletonJson(new AtlasAttachmentLoader(charAtlas)).readSkeletonData(charJSON),fxData=new SkeletonJson(new AtlasAttachmentLoader(fxAtlas)).readSkeletonData(fxJSON);
// Legacy smoke rig remains in assets for provenance; playback blends its drawn frames.
function rig(data:SkeletonData){const s=new Spine({skeletonData:data,autoUpdate:false});s.eventMode='none';return s}
function pose(s:Spine,name:string,t:number){s.skeleton.setToSetupPose();const entry=s.state.getCurrent(0);if(!entry||entry.animation?.name!==name)s.state.setAnimation(0,name,false);s.state.getCurrent(0)!.trackTime=Math.max(0,t);s.update(0)}
await battleFontLoading;
/** Display lettering: the battle font with an ink edge and a hard drop, the same voice as the game's win titles. */
function display(value:string,size:number,fill=0xffffff,edge=0x1c5f8f){return new Text({text:value,style:{fontFamily:'BattleDisplay, Nunito, Arial',fontWeight:'400',fontSize:size,fill,letterSpacing:1,stroke:{color:0x061b32,width:Math.max(4,size*.14)},dropShadow:{color:edge,alpha:1,blur:0,distance:Math.max(3,size*.13),angle:Math.PI/2}},resolution:2})}
function text(value:string,size=24,color=0xfffdf4){return new Text({text:value,style:{fontFamily:'Nunito',fontWeight:'800',fontSize:size,fill:color,stroke:{color:0x172c40,width:2}}})}
function plate(color:number){const s=new Sprite(Texture.WHITE);s.tint=color;return s}
await celsLoading;
const character=await characterLoading;
character.sample('idle',0);
const cavernMotion=createCavernMotion();
const world=new Container(),bg=new Sprite(background),ripples=[rig(fxData),rig(fxData),rig(fxData)],shadow=new Sprite(new Texture({source:shadowTex.source,frame:new Rectangle(128,586,994,169)})),actor=character.display,ball=rig(fxData),ballFront=rig(fxData),lidFront=rig(fxData),frontMask=new Sprite(Texture.WHITE),contact=rig(fxData),pull=rig(fxData),stars=rig(fxData),lock=rig(fxData),release=rig(fxData),dust=rig(fxData),mouthFlare=rig(fxData),flowPulses=[rig(fxData),rig(fxData),rig(fxData)];
for(const pulse of flowPulses)pulse.skeleton.color.setFromString('ffbdeeff');
const innerWell=new Sprite(shadow.texture);innerWell.anchor.set(.5);innerWell.tint=0x042b47;
const ballShadow=new Sprite(shadow.texture);shadow.anchor.set(.5);ballShadow.anchor.set(.5);
bg.filters=[cavernMotion.filter];
world.addChild(bg,...ripples,shadow,ballShadow,dust,actor,pull,...flowPulses,ball,contact,mouthFlare,stars,lock,release);app.stage.addChild(world);
const flowData=new SkeletonJson(new AtlasAttachmentLoader(flowAtlas)).readSkeletonData(flowJSON);
const energyTransfer=createEnergyTransfer(new SkeletonJson(new AtlasAttachmentLoader(drawnAtlas)).readSkeletonData(drawnJSON),character.sprite,encounter.id,drawnMeta[encounter.id],flowData);world.addChildAt(ball,world.getChildIndex(actor));world.addChildAt(innerWell,world.getChildIndex(actor));world.addChild(energyTransfer.container,ballFront,lidFront,frontMask,mouthFlare);ballFront.mask=frontMask;
const nativeCurrent=createNativeCurrent();world.addChildAt(nativeCurrent.container,world.getChildIndex(actor));
const smokeSequence=createFrameSequence(smokeTexture),poof=smokeSequence.container;world.addChild(poof);
const groundWake=createPremiumCel('wind');world.addChildAt(groundWake.rig,world.getChildIndex(actor));
const wingWakes=[createPremiumCel('wind'),createPremiumCel('wind')];
const wingHistory=wingWakes.map(()=>({y:0,time:-1,birth:-10,x:0,originY:0,strength:0}));
for(const wake of wingWakes)world.addChildAt(wake.rig,world.getChildIndex(actor));
const pullColor=new ColorMatrixFilter();pullColor.hue(encounter.pullHue,false);pull.filters=[pullColor];
const poolColor=new ColorMatrixFilter();poolColor.hue(encounter.poolHue,false);for(const ripple of ripples)ripple.filters=[poolColor];
const contactImpact=createAnimeCel('impact'),ballImpact=createAnimeCel('impact');world.addChild(contactImpact.rig,ballImpact.rig);
const cardReveal=createCardReveal({card,back,fxData}),guide=await guideLoading;
const transition=new Container(),topCurtain=plate(0x112b40),bottomCurtain=plate(0x112b40),band=plate(0xc6b8d5),eye=rig(charData),liveCutin=new Sprite(character.sprite.texture),eyeMask=plate(0xffffff),transitionName=display(encounter.name.toUpperCase(),50),sceneTitle=text('LEGENDARY ENCOUNTER',16),sceneSub=display(encounter.location,28),footer=new Container(),footerTitle=display('',26,0xfff4dc,0x16405e),footerSub=text('',16,0xe0eaf0);sceneTitle.style.letterSpacing=3;sceneTitle.style.fontWeight='900';footerSub.style.letterSpacing=1.5;footerSub.style.fontWeight='900';let footerShown='',footerAt=0;
footerSub.style.stroke={color:0x102b40,width:2};footer.addChild(footerTitle,footerSub);transition.addChild(topCurtain,bottomCurtain,band,eye,liveCutin,eyeMask,transitionName);eye.mask=eyeMask;liveCutin.mask=eyeMask;liveCutin.anchor.copyFrom(character.sprite.anchor);
const intro=new Container(),introBg=new Sprite(stadium),introShade=plate(0x102b43),receiver=new Sprite(receiverTex),introBalls=[rig(fxData),rig(fxData),rig(fxData)],socketFX=[rig(fxData),rig(fxData),rig(fxData)],unlock=rig(fxData),introText=text('Three symbols. One encounter.',42),introSmall=text('3 bonus symbols in one pack',22),introCount=text('0 / 3',24),returnTitle=text('',40),returnSub=text('',22);
intro.addChild(introBg,introShade,receiver,...introBalls,...socketFX,unlock,introText,introSmall,introCount,returnTitle,returnSub);
app.stage.addChild(intro,cardReveal.container,sceneTitle,sceneSub,footer,transition);
const packTexture=await packLoading,triggerCards=await triggerLoading;
const prelude=createBonusPrelude(back,receiverTex,stadium,fxData,packTexture,triggerCards),eyeCinema=createCinematicEye(new SkeletonJson(new AtlasAttachmentLoader(eyeAtlas)).readSkeletonData(eyeJSON),encounter.id,encounter.name);const entrySnapshot=new Sprite(Texture.EMPTY),exitSnapshot=new Sprite(Texture.EMPTY);let hasEntryBackdrop=false,hasExitBackdrop=false;app.stage.addChild(prelude.container,entrySnapshot,eyeCinema.container,exitSnapshot);
const modeWipe=createModeTransition(),verdict=createBallVerdict();app.stage.addChild(verdict.container,modeWipe.container);
// Light answers the scene's beats: one layer inside the world (under the camera), one around the reward.
let ball3dReady=true;const ball3d=new PokeBall3D(false,0xbdf7ff,512),ballSpin=new Quaternion(),BALL_TUMBLE=new Vector3(.82,.35,.46).normalize(),BALL_UP=new Vector3(0,1,0);
const lightLayer=createLightLayer();const atmosphere=createCavernAtmosphere(lightLayer.light);world.addChildAt(atmosphere.container,world.getChildIndex(shadow));
const ENERGY=lightLayer.energy,energyBeam=createEnergyBeam(ENERGY,lightLayer.light),energyBody=createEnergyBody(character.sprite,ENERGY);world.addChild(energyBeam.container);world.addChildAt(lightLayer.world.back,world.getChildIndex(ball));world.addChild(lightLayer.world.front);
cardReveal.container.addChildAt(lightLayer.halo,1);cardReveal.container.addChildAt(lightLayer.reward.back,2);app.stage.addChildAt(lightLayer.vignette,app.stage.getChildIndex(world)+1);app.stage.addChildAt(lightLayer.ladder,app.stage.getChildIndex(sceneTitle));app.stage.addChildAt(lightLayer.reward.front,app.stage.getChildIndex(sceneTitle));
const skipHint=text('Tap to finish this beat',15,0xd1e0e8);skipHint.anchor.set(1);app.stage.addChild(skipHint);
const flash=plate(0xffeaf2);app.stage.addChild(flash);
const throwGate=new ThrowGate(),throwInput=document.getElementById('throw') as HTMLButtonElement,skipInput=document.getElementById('skip') as HTMLButtonElement;
const throwIcon=rig(fxData),throwButton=createThrowButton(throwInput,throwIcon);app.stage.addChild(throwButton.container,guide.container);
let scoreGain:GainNode|undefined;
let musicBuffer:AudioBuffer|undefined,musicSource:AudioBufferSourceNode|undefined,musicGain:GainNode|undefined;
let gateStarted=0,recordingDemo=false,ambientTime=0,ambientNode:AudioBufferSourceNode|undefined;
let w=1280,h=720,portrait=false,time=ENTRY_AT,running=false,outcome:Outcome='capture',audioCtx:AudioContext|undefined,audioBuffers:Record<Outcome,AudioBuffer>|undefined,source:AudioBufferSourceNode|undefined,bus:GainNode|undefined,startAt=0,recorder:MediaRecorder|undefined,chunks:BlobPart[]=[],recStream:MediaStream|undefined,lastUrl='';
function cover(sprite:Sprite,width:number,height:number){const s=Math.max(width/sprite.texture.width,height/sprite.texture.height);sprite.scale.set(s);sprite.position.set((width-sprite.width)/2,(height-sprite.height)/2)}
function resize(){if(recorder?.state==='recording')return;portrait=embedded||host.clientWidth<600;w=portrait?720:1280;h=portrait?960:720;
 // Embedded in the game, the scene takes the shape of the screen it is on: tall for phones (down to 9:19.5), wide for desktops
 // (up to 21:9). Everything in it is laid out from w and h, so only the canvas changes.
 // A squarish screen keeps the tall layout and widens it instead of leaving bars at the sides.
 if(embedded&&hostAspect>0){portrait=hostAspect<1.15;if(portrait){h=Math.round(Math.min(1560,Math.max(900,720/hostAspect)));w=Math.round(Math.min(1035,Math.max(720,h*hostAspect)));}else{w=Math.round(Math.min(1680,Math.max(1040,720*hostAspect)));h=Math.round(Math.min(904,Math.max(720,w/hostAspect)));}}
 host.style.aspectRatio=`${w} / ${h}`;app.renderer.resize(w,h);sample(storyTime(time,outcome));app.render()}
function sample(totalTime:number){
 const elapsed=totalTime-1.8;
 const t=elapsed-2.65;
 const foot=h*.81,scale=portrait?1.55:1.2,center=w*.5,deflect=smooth((t-5.85)/.55),ballHit={x:mix(center+40*scale,w*.76,deflect),y:mix(foot-278*scale,foot-170*scale,deflect)},ballBase=foot+26,caught=outcome==='capture';
 const shot=entryShot(totalTime),exit=exitShot(t);world.visible=shot.arrival;world.position.set(0);world.scale.set(1);cover(bg,w,h);bg.scale.set(bg.scale.x*1.04);bg.position.set((w-bg.width)/2+Math.sin(ambientTime*.23)*w*.006,(h-bg.height)/2+Math.sin(ambientTime*.17)*h*.003);bg.alpha=1;bg.tint=t>=13&&caught?0x8097ab:0xffffff;
 const waterY=bg.y+bg.height*.455;for(let i=0;i<3;i++){const r=ripples[i];pose(r,'water',(ambientTime+i*.7)%3);r.position.set(w*(.25+i*.25),waterY+20*i);r.scale.set(portrait?.6:.95);r.alpha=.28;}
 // The room answers the beats: a hit, the lid, a landing and the verdict all pass through the light and the water.
 atmosphere.sample(ambientTime,w,h,waterY,foot,Math.min(1,captureSceneImpulse(t)*.8+(t>=6.85&&t<8.2?.35*conversionProgress(t-6.85):0)));
 actor.visible=(t>=3.05&&t<8.1)||(!caught&&t>=12.2&&t<15.35);actor.alpha=1;actor.rotation=0;actor.scale.set(scale);actor.position.set(center,foot);
 shadow.position.set(center,foot+4);shadow.width=240*scale;shadow.height=36*scale;shadow.alpha=.34;shadow.visible=actor.visible;
 const nativeFlow=encounter.nativeFlow;
 const sampleCharacter=(clip:string,age:number)=>character.sample(clip,age,true,1.2+throwGate.held,playbackTime(totalTime,outcome)+throwGate.held);
 const captureP=t>=6.85&&t<8.1?conversionProgress(t-6.85):!caught&&t>=12.2&&t<13.45?1-conversionProgress(t-12.2):0;
 if('setCaptureFlow' in character)character.setCaptureFlow(captureP,{x:(ballHit.x-center)/scale,y:((!caught&&t>=12.2?ballBase:ballHit.y+60)-37-foot)/scale});
 if(t<4.65)sampleCharacter('appear',Math.max(0,t-3.05));
 else if(t<5.85)sampleCharacter('idle',Math.max(0,t-4.65)+throwGate.held);
 else if(t<6.4)sampleCharacter('react',t-5.85);
 else if(t<6.85)sampleCharacter('resist',(t-6.4)*.6/.45);
 else if(t<8.1){
  const age=t-7;sampleCharacter(nativeFlow?'capture':'resist',nativeFlow?captureP*.7:.6);
  // The actual skeletal capture pose continues across the conversion front.
  actor.position.set(center,foot);shadow.alpha*=1-smooth(age/.35);
 }else if(!caught&&t>=12.2&&t<13.45){
  const age=t-12.2;sampleCharacter(nativeFlow?'capture':'resist',nativeFlow?captureP*.7:.6);actor.position.set(center,foot);actor.scale.set(scale);shadow.alpha*=smooth(age/.8);
 }else if(!caught&&t>=13.45){
  if(t<14.3)sampleCharacter('reform',Math.min(.7,Math.max(0,t-13.45)));
  else{const age=t-14.3;sampleCharacter('depart',age);shadow.alpha*=1-smooth(age/.5);
   
  }
 }
 if(encounter.rig==='winged'&&t>=3.05&&t<4.65){const u=clamp((t-3.05)/1.6),approach=1-smooth(u);actor.x+=w*.26*approach;actor.y-=230*approach+Math.sin(Math.PI*u)*62;actor.scale.set(scale*(.76+.24*smooth(u)));shadow.width*=.5+.5*smooth(u);shadow.alpha*=smooth(u);}
 dust.visible=(t>=6.4&&t<7)||(!caught&&t>=13.05&&t<13.65);pose(dust,'dust',t>=13.05?t-13.05:t-6.4);dust.position.set(center,foot-8);dust.scale.set(1.5,.5);
 if(t>=3.05&&t<4.65){const u=clamp((t-3.05)/1.6),z=1+.16*Math.sin(Math.PI*u);world.scale.set(z);world.position.set(center*(1-z)-24*Math.sin(Math.PI*u),h*.50*(1-z));}
 ball.visible=t>=5.1&&t<(caught?13.15:13.5);ball.alpha=1;ball.rotation=0;ball.scale.set(1.05);pose(ball,'closed',0);
 if(t>=5.1&&t<5.85){const p=captureFlight((t-5.1)/.75,{x:w*.13,y:h+90},{x:ballHit.x,y:ballHit.y+60},h*.28);ball.position.set(p.x,p.y);ball.scale.set(p.scale);ball.rotation=p.rotation;}
 else if(t<8.2){ball.position.set(ballHit.x,ballHit.y+60);pose(ball,'open',Math.min(.35,t-5.85));}
 else if(t<8.55){const u=clamp((t-8.2)/.35);pose(ball,'shut',Math.min(.3,t-8.2));ball.position.set(ballHit.x,mix(ballHit.y+60,ballBase,u*u));}
 else{const bounce=t<9.1?Math.sin(clamp((t-8.55)/.55)*Math.PI)*65:0;ball.position.set(ballHit.x,ballBase-bounce);const k=captureKnock(t);ball.x+=k.x;ball.y+=k.y;ball.rotation=k.rotation;}
 if(!caught&&t>=12.2){pose(ball,'open',Math.min(.35,t-12.2));const kick=Math.sin(Math.PI*clamp((t-12.2)/.6));ball.rotation=-.035*kick;ball.alpha=1-smooth((t-13.1)/.4);}
 if(caught&&t>=12.85){ball.alpha=1-smooth((t-12.85)/.3);ball.scale.set(1.05*mix(1,.4,smooth((t-12.85)/.3)));}
 contact.visible=false;pose(contact,'contact',t-5.85);contact.position.set(ballHit.x,ballHit.y);contact.scale.set(1.1);
 pull.visible=t>=6.4&&t<7;pose(pull,'pull',t<7?mix(.1,.3,clamp((t-6.4)/.6)):mix(.3,.65,clamp((t-7)/1.1)));
 const chest=character.chest,px=actor.x+(chest.worldX*Math.cos(actor.rotation)-chest.worldY*Math.sin(actor.rotation))*actor.scale.x,py=actor.y+(chest.worldX*Math.sin(actor.rotation)+chest.worldY*Math.cos(actor.rotation))*actor.scale.y,dx=ballHit.x-px,dy=ballHit.y-4-py;pull.position.set(px,py);pull.scale.set(Math.max(1,Math.hypot(dx,dy))/420,scale*mix(.24,.82,smooth((t-6.4)/1.5))*(1-smooth((t-8.02)/.08)));pull.rotation=Math.atan2(dy,dx);
 mouthFlare.visible=false;pose(mouthFlare,'contact',t-7.96);mouthFlare.position.set(ballHit.x,ballHit.y+8.5);mouthFlare.scale.set(1.65);
 const chestWorld={x:actor.x+character.chest.worldX*actor.scale.x,y:actor.y+character.chest.worldY*actor.scale.y};
 const mode=t>=6.85&&t<8.1?'capture':!caught&&t>=12.2&&t<13.45?'release':'none';
 const age=mode==='capture'?t-6.85:mode==='release'?t-12.2:t-14.3;
 if(!nativeFlow)energyTransfer.sample(mode,mode==='none'?age:conversionProgress(age)*1.25,actor,mode==='release'?{x:ballHit.x,y:ballBase-55}:{x:ballHit.x,y:ballHit.y+8.5},chestWorld,character.energyAnchors,character.energyPaths);

 nativeCurrent.container.visible=false;
 if(nativeFlow&&'flowChest'in character){nativeCurrent.sample(captureP,{x:actor.x+character.flowChest.x*scale,y:actor.y+character.flowChest.y*scale},{x:ballHit.x,y:(!caught&&t>=12.2?ballBase:ballHit.y+60)-37},scale);}
 if(nativeFlow){energyTransfer.container.visible=false;character.sprite.alpha=1;character.sprite.visible=true;pull.visible=false;}
 // A Pokémon without a flow of its own is taken the classic way: its whole body, as energy, shrinks along the beam into the mouth
 // (and grows back out of the ball on a break-out). The drawn conversion art is not used.
 let heldAt:{x:number;y:number}|null=null;
 if(!nativeFlow){energyTransfer.container.visible=false;character.sprite.alpha=1;character.sprite.visible=true;actor.alpha=1;
  if(captureP>0){const k=captureP,size=Math.max(.02,(1-k)**1.15),bow=Math.sin(Math.PI*k),sx=size*(1+.3*bow),sy=size*(1-.14*bow),target=!caught&&t>=12.2?{x:ballHit.x,y:ballBase-55}:{x:ballHit.x-9*ball.scale.x,y:ballHit.y+2},cx=chestWorld.x-actor.x,cy=chestWorld.y-actor.y;
   heldAt={x:chestWorld.x+(target.x-chestWorld.x)*k*k,y:chestWorld.y+(target.y-chestWorld.y)*k*k};actor.scale.set(scale*sx,scale*sy);actor.position.set(heldAt.x-cx*sx,heldAt.y-cy*sy);shadow.alpha*=size;}}
 // During flight and impact the complete ball is always above the creature.
 const enteringBody=usesBallInterior(t,outcome);world.setChildIndex(ball,enteringBody?world.getChildIndex(actor)-1:world.getChildIndex(actor)+1);world.setChildIndex(nativeCurrent.container,world.getChildIndex(actor)-1);
 const openBall=(t>=5.85&&t<8.2)||(!caught&&t>=12.2&&t<13.5);
 ballFront.visible=lidFront.visible=openBall;frontMask.visible=openBall;innerWell.visible=openBall;innerWell.width=76*ball.scale.x;innerWell.height=15*ball.scale.y;innerWell.position.set(ball.x,ball.y-47*ball.scale.y);innerWell.alpha=.85*ball.alpha;innerWell.tint=enteringBody?0x137daa:0x042b47;
 if(openBall){pose(lidFront,'open',Math.min(.35,t-(t>=12.2?12.2:5.85)));for(const slot of lidFront.skeleton.slots)if(slot.data.name!=='lid')slot.setAttachment(null);lidFront.position.copyFrom(ball.position);lidFront.scale.copyFrom(ball.scale);lidFront.rotation=ball.rotation;lidFront.alpha=ball.alpha;pose(ballFront,'open',.35);ballFront.skeleton.findSlot('lid')?.setAttachment(null);ballFront.position.copyFrom(ball.position);ballFront.scale.copyFrom(ball.scale);ballFront.rotation=ball.rotation;ballFront.alpha=ball.alpha;frontMask.position.set(ball.x-60*ball.scale.x,ball.y-43*ball.scale.y);frontMask.width=120*ball.scale.x;frontMask.height=48*ball.scale.y;}
 // The ball is a real toon-shaded 3D object driven by the 2D rig's transform: it tumbles in flight, hinges open toward the
 // Pokémon with the stream passing behind its front lip, and rocks on the floor with its latch pulsing red.
 if(ball3dReady){try{const radius=50*ball.scale.x,flying=t>=5.1&&t<5.85,resting=t>=8.55,knock=captureKnock(t),hinge=openBall?smooth((t-(t>=12.2?12.2:5.85))/.22):t>=8.2&&t<8.4?1-smooth((t-8.2)/.12):0;
  world.addChildAt(ball3d.sprite,world.getChildIndex(ball));world.addChildAt(ball3d.front,world.getChildIndex(lidFront));
  // Its own performance on top of the rig's path: it shivers and swells while it drinks the Pokémon in, snaps flat as the lid
  // shuts, squashes on each landing, crouches and springs on a lock, and is thrown back by a break-out.
  const drinking=t>=6.85&&t<8.2?captureP:0,shiver=drinking*(1-drinking)*4,gulp=t>=8.2?Math.exp(-(t-8.2)*15)*Math.sin((t-8.2)*34)*.16:0;
  const landed=(at:number,power:number)=>{const a=t-at;return a>=0?Math.exp(-a*17)*power:0;},squash=landed(8.55,.24)+landed(9.1,.1)+(resting&&t<12.2?knock.impact*.06:0)+(caught&&t>=12.2?Math.exp(-(t-12.2)*11)*Math.sin((t-12.2)*24)*.2:0)+gulp;
  const thrown=!caught&&t>=12.2?Math.sin(Math.PI*clamp((t-12.2)/.5)):0,size=radius*(1+.2*hinge+.07*drinking+.02*Math.sin(ambientTime*31)*drinking);
  ball3d.place(ball.x+Math.sin(ambientTime*71)*shiver*2.2+thrown*10,ball.y-51.8*ball.scale.y+Math.sin(ambientTime*83)*shiver*1.8-thrown*26,size,ball.alpha,ball.visible);
  for(const part of [ball3d.sprite,ball3d.front]){part.scale.x*=1+squash;part.scale.y*=1-squash;part.y+=size*squash;}
  const falling=t>=8.2&&t<8.75?(1-smooth((t-8.2)/.55))*4.2:0;
  if(flying)ballSpin.setFromAxisAngle(BALL_TUMBLE,ball.rotation*2.6);else if(falling>0)ballSpin.setFromAxisAngle(BALL_TUMBLE,falling);else ballSpin.setFromAxisAngle(BALL_UP,hinge*.95+(resting?knock.rotation*2.4:0)+thrown*.9);
  ball3d.setButtonColor(resting&&t<12.2?0xff3a2e:lightLayer.light);
  ball3d.update({spin:ballSpin,roll:flying?0:ball.rotation*3+thrown*.5,open:hinge,button:resting?(t<12.2?.22+knock.impact*1.2:caught?.3+1.5*Math.exp(-(t-12.2)*3):.2):.35,inner:hinge*(.7+.9*captureP),front:hinge>.02});
  ball.renderable=ballFront.renderable=lidFront.renderable=false;innerWell.visible=false;
  // The drawn current and pull strokes are replaced by light (see lightLayer): the body's own flow stays.
  nativeCurrent.container.visible=false;pull.visible=false;for(const pulse of flowPulses)pulse.visible=false;}catch(error){
  // No graphics context to spare for the 3D ball: the drawn ball takes over for the rest of the session.
  ball3dReady=false;ball3d.sprite.visible=ball3d.front.visible=false;ball.renderable=ballFront.renderable=lidFront.renderable=true;console.warn('3D ball unavailable; using the drawn ball',error);}}
 if(!ball3dReady){nativeCurrent.container.visible=false;pull.visible=false;for(const pulse of flowPulses)pulse.visible=false;}
 // Energy. In: a beam leaves the open mouth, takes hold of the Pokémon, turns its whole body to light and draws it in, then
 // snaps back into the ball as the lid shuts. Out: the same beam runs the other way and the body cools as it lets go.
 {const centreY=ball.y-51.8*ball.scale.y,hold='flowChest' in character&&nativeFlow?{x:actor.x+character.flowChest.x*scale,y:actor.y+character.flowChest.y*scale}:heldAt??chestWorld,breaking=!caught&&t>=12.2&&t<13.5;
  let start=0,end=0,power=0,energy=0;
  if(t>=6.25&&t<8.22){end=smooth((t-6.25)/.16)*(1-smooth((t-8.04)/.15));power=smooth((t-6.25)/.1)*(.5+.5*smooth((t-6.45)/.5));energy=smooth((t-6.38)/.4);}
  else if(breaking){end=smooth((t-12.2)/.12);start=smooth((t-12.95)/.45);power=1-smooth((t-13.0)/.45);energy=1-smooth((t-13.12)/.3);}
  world.addChildAt(energyBeam.container,Math.max(0,world.getChildIndex(ball3d.front)));
  energyBeam.sample({now:ambientTime,from:{x:ball.x-(breaking?0:9*ball.scale.x),y:centreY-(breaking?10:5)*ball.scale.y},to:hold,start,end,power,inward:!breaking,unit:h/960});
  energyBody.sample(energy,ambientTime,!breaking);
  // The room leans in while the Pokémon is taken: a slow push toward the pull and a tremor that grows with it.
  if(t>=6.3&&t<8.4){const k=smooth((t-6.3)/.5)*(1-smooth((t-8.2)/.2)),z=1+.085*k,fx=(center+ballHit.x)/2,fy=ballHit.y+40,tremor=k*(.4+captureP)*2.6;world.scale.set(z);world.position.set(fx*(1-z)+Math.sin(ambientTime*61)*tremor,fy*(1-z)+Math.sin(ambientTime*53)*tremor*.8);}
  if(breaking&&t<12.75){const tremor=(1-smooth((t-12.2)/.55))*7;world.position.x+=Math.sin(ambientTime*67)*tremor;world.position.y+=Math.sin(ambientTime*59)*tremor*.7;}}
 if(!caught&&t>=14.73)actor.visible=false;
 // Disappearance is an opaque animated smoke cover, followed by outward
 // rolling puffs. It never reuses the capture pull or fades the character.
 poof.visible=!caught&&t>=14.4&&t<15.6;smokeSequence.sample((t-14.4)/1.04*15);poof.position.set(center,foot-encounter.smokeHeight*scale);poof.scale.set(scale*encounter.smokeScale);
 // The escaped Pokémon leaves as what it is made of: it gathers, then goes up and out of the cavern as a streak of its own light.
 // (The drawn smoke cover is not used; the body is gone before the rig hides it.)
 poof.visible=false;if(!caught&&t>=14.4&&t<14.73){const u=clamp((t-14.4)/.33),gather=Math.sin(Math.min(1,u/.3)*Math.PI/2),go=clamp((u-.3)/.7)**2;actor.scale.set(scale*(1-.1*gather)*(1-.55*go),scale*(1-.08*gather)*(1+.9*go));actor.y=foot-go*h*.95;actor.alpha=1-clamp((u-.72)/.28);shadow.alpha*=1-go;}
 // A downstroke leaves a drawn wake at the actual wing tip. The wake keeps
 // traveling after the wing moves away, rather than restarting at each action.
 for(let i=0;i<2;i++){
  const wake=wingWakes[i],history=wingHistory[i],anchor=character.energyAnchors[i+2];
  const wx=actor.x+anchor.x*actor.scale.x,wy=actor.y+anchor.y*actor.scale.y;
  const clock=playbackTime(totalTime,outcome)+throwGate.held,dt=clock-history.time,localY=anchor.y*actor.scale.y;
  const active=encounter.rig==='winged'&&actor.visible&&((t>=3.05&&t<6.4)||(!caught&&t>=13.45&&t<14.7));
  if(dt<0||dt>.2)history.birth=-10;
  if(active&&dt>0&&dt<.2&&(localY-history.y)/dt>55&&clock-history.birth>.45){history.birth=clock;history.x=wx;history.originY=wy;history.strength=t<4.65||t>13?1:.48;}
  history.y=localY;history.time=clock;const age=clock-history.birth;
  wake.rig.visible=active&&age>=0&&age<.78;
  if(wake.rig.visible){wake.sample(age/.78*15);wake.rig.position.set(history.x+(i===0?-1:1)*age*55,history.originY+age*72);wake.rig.scale.set((i===0?1:-1)*scale*.72,scale*.56);wake.rig.rotation=i===0?-.24:.24;wake.rig.alpha=history.strength*Math.min(1,age/.055)*(1-smooth((age-.5)/.28));}
 }

 for(let i=0;i<3;i++){const pulse=flowPulses[i],pt=t-(6.62+i*.42),u=clamp(pt/.38);pulse.visible=false;pose(pulse,'glint',u*.65);pulse.position.set(mix(px,ballHit.x,u*u),mix(py,ballHit.y-4,u*u));pulse.scale.set(.17+.1*u);pulse.alpha=.7;}
 stars.visible=false;pose(stars,'success',t-12.35);stars.position.set(ballHit.x,ballBase-80);stars.scale.set(1.1);
 lock.visible=false;pose(lock,'lock',t-12.2);lock.position.set(ballHit.x,ballBase-55);lock.scale.set(1.25);
 const contactAge=t-5.85;contactImpact.rig.visible=contactAge>=0&&contactAge<.38;contactImpact.sample(19+Math.min(12,contactAge/.38*13));contactImpact.rig.position.set(ballHit.x,ballHit.y+8.5);contactImpact.rig.scale.set(.38);
 // Inward mechanical snap, then recoil. The seal opens only on the escape branch.
 if(caught&&t>=12.2&&t<12.65){const age=t-12.2;const hit=Math.exp(-age*10)*Math.sin(age*29);ball.scale.set(1.05*(1+.19*hit),1.05*(1-.15*hit));ball.y+=14*Math.exp(-age*11)*Math.sin(age*25);}
 const resultAge=t-12.2;
 // Drawn compression precedes one hard latch. Breakout has its own outward cels.
 const impactAge=caught?resultAge+.12:resultAge;
 ballImpact.rig.visible=impactAge>=0&&impactAge<(caught?.74:.92);
 const impactFrame=caught?(impactAge<.12?impactAge/.12*5:5+(impactAge-.12)/.62*11):16+Math.min(15,impactAge/.92*16);
 ballImpact.sample(impactFrame);ballImpact.rig.position.set(ball.x,ball.y-53);ballImpact.rig.scale.set(caught?.64:1.6);
 if(caught&&resultAge>=-.12&&resultAge<0){const q=smooth((resultAge+.12)/.12);ball.scale.set(1.05*(1-.07*q),1.05*(1+.07*q));}

 
 contactImpact.rig.visible=ballImpact.rig.visible=false;
 release.visible=false;pose(release,'release',t-12.2);release.position.set(ballHit.x,ballBase-55);release.scale.set(.7);release.filters=[];
 ballShadow.visible=t>=8.2&&t<13.3;ballShadow.position.set(ballHit.x,ballBase+3);ballShadow.width=115;ballShadow.height=20;ballShadow.alpha=.25*smooth((t-8.2)/.35)*(1-smooth((t-12.85)/.4));
 if(t>=9.05&&t<13.5){const c=camera(w,h,ballHit.x,ballBase,t,outcome);world.scale.set(c.z);world.position.set(c.x,c.y);}
 // Each check pulls the lens a step closer to the ball and kicks it; the held breath creeps in further, and the verdict lets go.
 if(t>=9.7&&t<12.36){let step=0,punch=0;for(const at of [9.8,10.65,11.5]){const a=t-at-.26;if(a>=0){step+=smooth(a/.18);punch=Math.max(punch,Math.exp(-a*13));}}
  const extra=1+(.05*step+.035*punch+.05*smooth((t-11.74)/.46))*(1-smooth((t-12.2)/.15)),sx=world.x+ball.x*world.scale.x,sy=world.y+(ball.y-51.8*ball.scale.y)*world.scale.y,shake=punch*(t<12.2?5:0),held=world.scale.x;
  world.scale.set(held*extra);world.position.set(sx-(sx-world.x)*extra+Math.sin(ambientTime*67)*shake,sy-(sy-world.y)*extra+Math.sin(ambientTime*59)*shake*.7);}
 const sceneHit=captureSceneImpulse(t),waveEvents=[4.36,8.55,12.2],waveAt=waveEvents.reduce((last,at)=>t>=at?at:last,-10),waveAge=t-waveAt;
 groundWake.rig.visible=waveAge>=0&&waveAge<.8;groundWake.sample(waveAge/.8*15);groundWake.rig.position.set(waveAt===4.36?center:ballHit.x,waveAt===4.36?foot:ballBase);groundWake.rig.scale.set((portrait?1.2:1.5)*(1+smooth(waveAge/.8)*.6),.24);groundWake.rig.alpha=(1-smooth(waveAge/.8))*.75;
 cavernMotion.sample(ambientTime,sceneHit,(ball.x-bg.x)/bg.width,(ball.y-bg.y)/bg.height);
 if(t>=5.1&&t<6.5){const focus=smooth((t-5.1)/.45)*(1-smooth((t-5.95)/.55)),z=1+focus*.055;world.scale.set(z);world.position.set(center*(1-z),h*.5*(1-z));}
 if(sceneHit>0){world.x+=Math.sin(t*93)*sceneHit*4;world.y+=Math.sin(t*71)*sceneHit*3;}
 if(t>=8.03&&t<8.25){const k=1-clamp((t-8.03)/.22);world.x+=Math.sin((t-8.03)*65)*5*k;world.y+=Math.sin((t-8.03)*46)*3*k;}
 // Brief local impact recoil, returning exactly to the camera's current transform.
 if(t>=5.85&&t<6.1){const k=(1-clamp((t-5.85)/.25));world.x+=Math.sin((t-5.85)*75)*9*k;world.y+=Math.sin((t-5.85)*56)*4*k;}
 if(!caught&&t>=13.05&&t<13.22)world.y+=Math.sin((t-13.05)*55)*4*(1-clamp((t-13.05)/.17));
 if(t>=12.2&&t<12.5){const age=t-12.2,k=Math.exp(-age*13),power=caught?10:15;world.x+=Math.sin(age*65)*power*k;world.y+=Math.sin(age*44)*power*.45*k;}
 cardReveal.sample({time:caught?t:-1,w,h,portrait,originX:world.x+ball.x*world.scale.x,originY:world.y+(ball.y-51.8*ball.scale.y)*world.scale.y});
 {const cardHeight=h*(portrait?.53:.72),counterHeight=h*(portrait?.23:.32),inReward=caught&&t>=12.45&&t<17.5;lightLayer.sample({t,rewardAge:inReward?playbackTime(t+4.45)-playbackTime(18.5):-9,post:1-(1-clamp((playbackTime(t+4.45)-playbackTime(21.2))/.32))**3,w,h,portrait,caught,now:ambientTime,ball:{x:ball.x,y:ball.y-51.8*ball.scale.y,visible:ball.visible&&world.visible},chest:{x:center,y:foot-150*scale},feet:{x:center,y:foot},floorY:ballBase,rest:{x:ballHit.x,y:ballBase-51.8*1.05},ballRoll:t>=5.1&&t<5.85?0:ball.rotation*3,ballScreen:{x:world.x+ball.x*world.scale.x,y:world.y+(ball.y-51.8*ball.scale.y)*world.scale.y},
  card:{x:w*(portrait?.5:.35),y:h*(portrait?.405:.48),width:cardHeight*.716,height:cardHeight},counter:{x:w*(portrait?.5:.79),y:h*(portrait?.82:.51),height:counterHeight}});lightLayer.reward.back.visible=lightLayer.reward.front.visible=inReward;lightLayer.halo.visible=lightLayer.halo.visible&&inReward;lightLayer.vignette.visible=lightLayer.vignette.visible&&world.visible;lightLayer.ladder.visible=lightLayer.ladder.visible&&inReward;lightLayer.ladder.alpha=1-smooth((t-17.2)/.3);}
 sceneTitle.text=encounter.location.toUpperCase();sceneSub.text=encounter.name.toUpperCase();sceneTitle.style.fontSize=15;sceneSub.style.fontSize=44;sceneTitle.position.set(40,28);sceneSub.position.set(38,48);sceneTitle.visible=sceneSub.visible=t>=3.05&&t<17.5&&!(caught&&t>=12.65);
 footer.visible=t>=3.05&&t<17&&!(caught&&t>=12.2)&&!(!caught&&t>=12.2&&t<14.1);
 footer.position.set(w/2,h-100);footerTitle.anchor.set(.5,0);footerSub.anchor.set(.5,0);footerTitle.position.set(0,12);footerSub.position.set(0,56);footerTitle.style.fontSize=38;footerSub.style.fontSize=15;
 const message=t<5.1?[`Wild ${encounter.name} appeared!`,'Capture it to reveal its reward card.']:t<5.85?['','']:t<6.4?['A direct hit!','']:t<8.2?[`${encounter.name} is resisting!`,'']:t<12.2?['Will it hold?','']:caught?[`${encounter.name} captured!`,'']:t<15.3?[`${encounter.name} broke free!`,'']:['It got away…','No bonus card awarded.'];footerTitle.text=message[0].toUpperCase();footerSub.text=message[1].toUpperCase();footerTitle.y=message[1]?22:34;footerTitle.anchor.set(.5);
 // Each new line of the commentary lands with a stamp.
 if(message[0]!==footerShown){footerShown=message[0];footerAt=ambientTime;}{const stamp=juiceUp(ambientTime-footerAt,.34,.04);footerTitle.scale.set(stamp.scale);footerTitle.rotation=stamp.rotation;}

 intro.visible=t<2.8||t>=17.5;cover(introBg,w,h);introShade.width=w;introShade.height=h;introShade.alpha=.72;
 const returned=t>=17.5,trayScale=portrait?.36:.51;receiver.visible=!returned;receiver.scale.set(trayScale);receiver.position.set(center-receiverTex.width*trayScale/2,h*.48-receiverTex.height*trayScale/2);
 introText.visible=introSmall.visible=introCount.visible=!returned;introText.text=t<2.05?'Three symbols. One encounter.':'LEGENDARY ENCOUNTER';introText.style.fontSize=portrait?34:42;introText.anchor.set(.5);introText.position.set(center,h*.23);introSmall.text=t<2.05?'Land 3 Poké Balls in one pack':'Catch the Pokémon. Reveal its bonus card.';introSmall.style.fontSize=portrait?21:23;introSmall.anchor.set(.5);introSmall.position.set(center,h*.75);introCount.anchor.set(.5);introCount.position.set(center,h*.66);introCount.text=Math.min(3,[.55,1.15,1.75].filter(v=>t>=v).length)+' / 3';
 for(let i=0;i<3;i++){
  const latch=.55+i*.6,u=clamp((t-(latch-.5))/.5),landed=t>=latch,cx=receiver.x+[610.5,1086,1561.5][i]*trayScale,cy=receiver.y+362*trayScale,bs=335*trayScale/100;
  pose(introBalls[i],'closed',0);introBalls[i].visible=!returned&&t>=latch-.5;introBalls[i].alpha=1;introBalls[i].rotation=landed?0:mix(-2.5,0,u);introBalls[i].scale.set(bs*(1+(landed?.1*Math.sin(clamp((t-latch)/.18)*Math.PI):.6*(1-u))));introBalls[i].position.set(mix(center+(i-1)*w*.48,cx,smooth(u)),mix(h+100,cy+51.8*bs,u)-Math.sin(Math.PI*u)*h*.18);
  socketFX[i].visible=!returned&&t>=latch&&t<latch+.65;pose(socketFX[i],'lock',t-latch);socketFX[i].position.set(cx,cy);socketFX[i].scale.set(bs*.45);
 }
 unlock.visible=!returned&&t>=2.05;pose(unlock,'lock',t-2.05);unlock.position.set(center,h*.48);unlock.scale.set(portrait?2.1:3,.9);
 returnTitle.visible=returnSub.visible=returned;returnTitle.anchor.set(.5);returnSub.anchor.set(.5);returnTitle.position.set(center,h*.44);returnSub.position.set(center,h*.54);returnTitle.text=caught?`${encounter.name.toUpperCase()} CAPTURED`:`${encounter.name.toUpperCase()} ESCAPED`;returnTitle.style.fontSize=portrait?34:40;returnSub.text=caught?`${encounter.multiplier}× · ${(encounter.bet*encounter.multiplier).toLocaleString('en-US',{style:'currency',currency:'USD'})} mock award`:'No bonus card awarded';returnSub.style.fontSize=portrait?23:26;
 transition.visible=(t>=2.15&&t<3.05)||(t>=17.3&&t<18.3);const tt=t<4?t-2.15:t-17.3,closed=smooth(tt/.2)*(1-smooth((tt-.55)/.35));topCurtain.width=bottomCurtain.width=w;topCurtain.height=bottomCurtain.height=h*.5*closed;topCurtain.position.set(0,0);bottomCurtain.position.set(0,h-bottomCurtain.height);band.position.set(0,h*.33);band.width=w;band.height=h*.28;band.alpha=clamp((tt-.14)/.08)*(1-clamp((tt-.57)/.15));eyeMask.position.set(0,h*.33);eyeMask.width=w;eyeMask.height=h*.28;pose(eye,'idle',clamp(tt/.9)*1.5);const es=portrait?6:8;eye.scale.set(es);eye.position.set(w*.55-40*es+mix(90,-90,smooth(tt/.9)),h*.47+341*es);eye.alpha=encounter.rig==='humanoid'?band.alpha:0;const head=character.energyAnchors[1];liveCutin.visible=encounter.rig==='winged';liveCutin.width=liveCutin.height=character.displaySize*(portrait?2.5:3);liveCutin.position.set(w*.5-head.x*(portrait?2.5:3),h*.47-head.y*(portrait?2.5:3));liveCutin.alpha=band.alpha;transitionName.position.set(32,h*.7);transitionName.alpha=band.alpha;if(t>=17.3)band.alpha=eye.alpha=liveCutin.alpha=transitionName.alpha=0;
 prelude.sample(elapsed,w,h,portrait);if(hasEntryBackdrop)prelude.container.visible=false;entrySnapshot.visible=hasEntryBackdrop&&shot.wipe;entrySnapshot.width=w;entrySnapshot.height=h;eyeCinema.sample(elapsed,w,h);eyeCinema.container.visible=shot.eye;if(elapsed<5.7){intro.visible=false;transition.visible=false;sceneTitle.visible=sceneSub.visible=footer.visible=false;}
 exitSnapshot.visible=hasExitBackdrop&&exit.showPack;exitSnapshot.width=w;exitSnapshot.height=h;exitSnapshot.alpha=1;if(hasExitBackdrop&&t>=17){intro.visible=false;transition.visible=false;}
 modeWipe.sample(shot.wipe?totalTime-ENTRY_START:exit.visible?exit.age:-1,w,h,exit.visible);verdict.sample(t,caught,w,h);
 skipHint.visible=running&&!throwGate.waiting&&!recordingDemo;skipHint.position.set(w-26,h-9);skipInput.hidden=!running||throwGate.waiting;
 const guideRewardAge=playbackTime(totalTime)-playbackTime(18.5),cue=inspectedGuide??guideCue(t,guideRewardAge,caught,throwGate.waiting,throwGate.held),guideSpeaking=guide.sample(cue,w,h,running);cardReveal.setGuideVisible(cue?.id==='caught');sceneTitle.alpha=sceneSub.alpha=cue&&cue.id!=='escape'&&cue.id!=='caught'?1-Math.min(1,cue.opacity*1.4):1;if(cue){footer.visible=false;skipHint.visible=false;}
 const verdictSound=verdictAudio.sample(t,outcome,running);if(scoreGain&&audioCtx)scoreGain.gain.setTargetAtTime(verdictSound?.2:.6,audioCtx.currentTime,.06);
 if(musicGain&&running){const rewardAge=playbackTime(totalTime)-playbackTime(18.5),finalBreath=caught&&rewardAge>=4.45&&rewardAge<5.3,finalHit=caught&&rewardAge>=5.3&&rewardAge<6;const target=t>=17?.72*(1-smooth((t-17)/1.6)):finalBreath?.22:finalHit?.92:t>=11.7&&t<12.2?.26:t>=9.5&&t<12.2?.48:shot.eye?.42:.72;musicGain.gain.setTargetAtTime(guideSpeaking?Math.min(target,.19):verdictSound?Math.min(target,.14):target,audioCtx!.currentTime,guideSpeaking?.08:finalBreath||finalHit?.06:.22);}
 pose(throwIcon,'closed',0);throwButton.sample(ambientTime,w,h,throwGate.waiting,matchMedia('(prefers-reduced-motion: reduce)').matches);if(throwGate.waiting)footer.visible=false;
 flash.width=w;flash.height=h;flash.alpha=t>=5.85&&t<5.97?.19*(1-(t-5.85)/.12):t>=12.2&&t<12.35?(caught?.17:.4)*(1-(t-12.2)/.15):0;
}
new ResizeObserver(resize).observe(host);resize();
async function audio(){if(!audioCtx){audioCtx=new AudioContext({sampleRate:48000});bus=audioCtx.createGain();bus.gain.value=demoMuted?0:1.3;bus.connect(audioCtx.destination);scoreGain=audioCtx.createGain();scoreGain.connect(bus);const decoded=await Promise.all([...scores,music].map(decode=>decode(audioCtx!)));audioBuffers={capture:extendRewardAudio(audioCtx,decoded[0]),escape:decoded[1]};musicBuffer=decoded[2];musicGain=audioCtx.createGain();musicGain.gain.value=.72;musicGain.connect(bus);await Promise.all([guide.prepare(audioCtx,bus),verdictAudio.prepare(audioCtx,bus)]);}await audioCtx.resume();lightLayer.audio(!demoMuted);}
function startAmbience(){const buffer=audioCtx!.createBuffer(2,48000*4,48000);let seed=12345;for(let channel=0;channel<2;channel++){const data=buffer.getChannelData(channel);let filtered=0;for(let i=0;i<data.length;i++){seed=(seed*1664525+1013904223)>>>0;const n=(seed/4294967296-.5);filtered=.94*filtered+.06*n;const p=i/data.length;data[i]=filtered*.12*(.7+.3*Math.sin(p*Math.PI*8+channel));}}ambientNode=audioCtx!.createBufferSource();ambientNode.buffer=buffer;ambientNode.loop=true;ambientNode.connect(bus!);ambientNode.start();}
function startMusic(){if(musicSource){musicGain!.gain.cancelScheduledValues(audioCtx!.currentTime);musicGain!.gain.setTargetAtTime(.72,audioCtx!.currentTime,.15);return;}musicSource=audioCtx!.createBufferSource();musicSource.buffer=musicBuffer!;musicSource.loop=true;musicSource.connect(musicGain!);musicGain!.gain.cancelScheduledValues(audioCtx!.currentTime);musicGain!.gain.setValueAtTime(.72,audioCtx!.currentTime);musicSource.start();}
function halt(keepMusic=false){inspectedGuide=null;guide.reset();verdictAudio.reset();if(!keepMusic){musicSource?.stop();musicSource=undefined;}running=false;throwGate.reset();throwInput.hidden=true;ambientNode?.stop();ambientNode=undefined;source?.stop();source=undefined;if(recorder?.state==='recording')recorder.stop()}
async function begin(capture=false){play.disabled=record.disabled=choice.disabled=true;try{
 halt(true);guide.newRound();await audio();startMusic();recordingDemo=capture;gateStarted=0;throwGate.reset();outcome=choice.value==='random'?outcomeFromByte(crypto.getRandomValues(new Uint8Array(1))[0]):choice.value as Outcome;
 save.hidden=true;if(capture){chunks=[];recStream=app.canvas.captureStream(60);const destination=audioCtx!.createMediaStreamDestination();bus!.connect(destination);for(const track of destination.stream.getAudioTracks())recStream.addTrack(track);const mime=['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus'].find(m=>MediaRecorder.isTypeSupported(m));recorder=new MediaRecorder(recStream,{mimeType:mime,videoBitsPerSecond:10000000});recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};recorder.onstop=()=>{if(lastUrl)URL.revokeObjectURL(lastUrl);lastUrl=URL.createObjectURL(new Blob(chunks,{type:recorder!.mimeType}));save.href=lastUrl;save.download='legendary-capture-v25-'+encounter.id+'-'+outcome+(portrait?'-phone':'-wide')+'.webm';save.hidden=false;recStream?.getTracks().forEach(t=>t.stop());bus!.disconnect(destination);status.textContent='Recording ready · '+outcome+' · includes stereo sound';};sample(ENTRY_AT);app.render();recorder.start(100);}
 startAmbience();source=audioCtx!.createBufferSource();source.buffer=audioBuffers![outcome];source.connect(scoreGain!);const scheduled=audioCtx!.currentTime+.12;startAt=scheduled-ENTRY_AT;source.start(scheduled,ENTRY_AT);time=ENTRY_AT;sample(ENTRY_AT);app.render();running=true;play.textContent='Replay with sound';status.textContent=capture?'Recording selected take + stereo sound':'Playing · 50/50 frontend demo';
 }catch(e){status.textContent=String(e);play.disabled=record.disabled=choice.disabled=false;}}
function throwBall(){if(!throwGate.waiting)return;const elapsed=audioCtx!.currentTime-startAt;if(!throwGate.release(elapsed))return;source=audioCtx!.createBufferSource();source.buffer=audioBuffers![outcome];source.connect(scoreGain!);source.start(0,THROW_AT);throwInput.hidden=true;status.textContent='Throwing · outcome remains the selected mock result';}
let lastSkip=-Infinity;
function skipCurrentAnimation(){
 if(!running||throwGate.waiting||!audioCtx||audioCtx.currentTime-lastSkip<.16)return;
 lastSkip=audioCtx.currentTime;const target=nextPresentationStop(time,outcome);
 source?.stop();source=undefined;startAt=audioCtx.currentTime-target-throwGate.held;time=target;
 if(target<playbackTime(DURATION,outcome)){source=audioCtx.createBufferSource();source.buffer=audioBuffers![outcome];source.connect(scoreGain!);source.start(0,target);}
 sample(storyTime(time,outcome));app.render();status.textContent='Animation finished · tap again to finish the next beat';
}
app.canvas.addEventListener('pointerup',skipCurrentAnimation);skipInput.onclick=skipCurrentAnimation;
throwInput.onclick=throwBall;
play.onclick=()=>void begin(false);record.onclick=()=>void begin(true);
// Same-origin walkthrough harness records the actual normal game and this scene.
let bridgeDestination:MediaStreamAudioDestinationNode|undefined;
// The host game owns the sound setting.
let demoMuted=false;
(window as any).captureDemo={canvas:app.canvas,setEntryBackdrop(canvas:HTMLCanvasElement){const copy=document.createElement("canvas");copy.width=canvas.width;copy.height=canvas.height;copy.getContext("2d",{willReadFrequently:true})!.drawImage(canvas,0,0);if(hasEntryBackdrop)entrySnapshot.texture.destroy(true);entrySnapshot.texture=Texture.from(copy);hasEntryBackdrop=true;},setExitBackdrop(canvas:HTMLCanvasElement){const copy=document.createElement("canvas");copy.width=canvas.width;copy.height=canvas.height;copy.getContext("2d",{willReadFrequently:true})!.drawImage(canvas,0,0);if(hasExitBackdrop)exitSnapshot.texture.destroy(true);exitSnapshot.texture=Texture.from(copy);hasExitBackdrop=true;},get reward(){return {name:encounter.name,image:encounter.cardUrl,multiplier:encounter.multiplier};},get size(){return {width:w,height:h};},setMuted(value:boolean){demoMuted=value;if(bus)bus.gain.value=value?0:1.3;lightLayer.audio(!value&&!!audioCtx);},get outcome(){return outcome;},get voiceSelection(){return guide.selection();},get running(){return running;},get waiting(){return throwGate.waiting;},get presentationTime(){return time;},throwBall,skip:skipCurrentAnimation,
 async prepare(){await audio();startMusic();if(!bridgeDestination){bridgeDestination=audioCtx!.createMediaStreamDestination();bus!.connect(bridgeDestination);}return bridgeDestination.stream;},
 async start(result:Outcome,automatic=false){choice.value=result;await begin(false);recordingDemo=automatic;},stop:()=>halt(),
 /** Review tool: step the scene's own clock without sound and tile the frames into a contact sheet. `from`/`to` are story seconds
  * (the `t` in `sample`: 3.05 the Pokémon appears, 5.1 throw, 5.85 hit, 8.2 lid shuts, 9.8/10.65/11.5 shakes, 12.2 verdict, 13 card, 17 exit).
  * Effects that run on real time advance by the same step, so what is filmed is what plays. */
 film({from=3,to=17.5,step=1/60,every=.2,cols=6,scale=.5,branch='capture' as Outcome,crop=null as null|{x:number;y:number;w:number;h:number}}={}){
  halt();outcome=branch;const area=crop??{x:0,y:0,w,h},tw=Math.round(area.w*scale),th=Math.round(area.h*scale),count=Math.floor((to-from)/every)+1,sheet=document.createElement('canvas');sheet.width=tw*cols;sheet.height=th*Math.ceil(count/cols);
  const context=sheet.getContext('2d',{willReadFrequently:true})!;context.fillStyle='#000';context.fillRect(0,0,sheet.width,sheet.height);context.font='12px Arial';let shot=0;
  // A second of lead-in so anything that reacts to a time being crossed sees it crossed.
  for(let t=from-1;t<=to+1e-6&&shot<count;t+=step){ambientTime+=step;time=playbackTime(t+4.45,outcome);sample(t+4.45);if(t>=from+shot*every-1e-6){app.render();context.drawImage(app.canvas,area.x,area.y,area.w,area.h,(shot%cols)*tw,Math.floor(shot/cols)*th,tw,th);context.fillStyle='#fff';context.fillText(t.toFixed(2),(shot%cols)*tw+4,Math.floor(shot/cols)*th+12);shot++;}}
  return sheet;},
 /** Review tool: milliseconds per frame (scene update, draw and the GPU finishing it) over a stretch of the story clock. */
 cost({from=3,to=17.5,step=1/60,branch='capture' as Outcome}={}){
  halt();outcome=branch;const gl=(app.renderer as unknown as {gl:WebGL2RenderingContext}).gl,pixel=new Uint8Array(4),times:number[]=[];
  for(let t=from-.5;t<=to+1e-6;t+=step){ambientTime+=step;time=playbackTime(t+4.45,outcome);const started=performance.now();sample(t+4.45);app.render();gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,pixel);if(t>=from)times.push(performance.now()-started);}
  times.sort((a,b)=>a-b);const at=(q:number)=>+times[Math.min(times.length-1,Math.floor(times.length*q))].toFixed(2);return {frames:times.length,median:at(.5),p95:at(.95),worst:at(1)};}};

document.querySelectorAll<HTMLButtonElement>('[data-pose]').forEach(button=>button.onclick=()=>{if(recorder?.state==='recording')return;halt();if(button.dataset.guide)inspectedGuide={id:'throw',age:1.1,opacity:1};outcome=button.dataset.branch as Outcome;time=playbackTime(Number(button.dataset.pose)+(button.dataset.prelude?0:2.65)+1.8,outcome);play.disabled=record.disabled=choice.disabled=false;sample(storyTime(time,outcome));app.render();status.textContent='Paused pose inspection · '+button.textContent;});
// Embedded in the game the scene is loaded ahead of time and kept, hidden, between encounters. It draws nothing while no
// encounter is playing: an idle scene that kept rendering was a second game running behind the first.
function loop(){if(embedded&&!running){requestAnimationFrame(loop);return;}ambientTime=performance.now()/1000;if(running){const elapsed=Math.max(ENTRY_AT,audioCtx!.currentTime-startAt),wasWaiting=throwGate.waiting;time=throwGate.sample(elapsed);if(throwGate.waiting&&!wasWaiting){source?.stop();source=undefined;gateStarted=elapsed;status.textContent='Ready to throw · timing does not change the outcome';}if(throwGate.waiting&&recordingDemo&&elapsed-gateStarted>ARRIVE_HOLD+guide.duration('throw')+.60)throwButton.demonstratePress(ambientTime);if(throwGate.waiting&&recordingDemo&&elapsed-gateStarted>ARRIVE_HOLD+guide.duration('throw')+.75)throwBall();if(time>=playbackTime(DURATION,outcome)){time=playbackTime(DURATION,outcome);running=false;source=undefined;if(musicSource){musicGain!.gain.setTargetAtTime(0,audioCtx!.currentTime,.5);}ambientNode?.stop();ambientNode=undefined;if(recorder?.state==='recording')recorder.stop();else status.textContent='Complete · '+outcome+' · demo only';play.disabled=record.disabled=choice.disabled=false;}}sample(storyTime(time,outcome));app.render();requestAnimationFrame(loop)}
play.disabled=record.disabled=false;play.textContent='Play with sound';status.textContent='Ready · 50/50 demo · skeletal character + Spine effects';requestAnimationFrame(loop);
addEventListener('pagehide',()=>{halt();audioCtx?.close();guide.destroy();throwButton.destroy();character.dispose();app.destroy(true,{children:true})});

