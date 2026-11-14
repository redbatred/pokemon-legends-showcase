#!/usr/bin/env node
// Reproducible original sound design for every base game cue (Part A) and the legendary-capture bonus
// (Part B). Same method as generate-win-audio-v14.mjs: oscillators, filtered noise, struck partials and
// an algorithmic room; no downloaded samples or recordings. Tonal cues sit in C major, the key of the
// v14 win set, so flips, ticks and wins chain musically.
//
//   node scripts/generate-game-audio-v15.mjs                 write public/assets/audio-game-v15
//   node scripts/generate-game-audio-v15.mjs --only ui,flip  rebuild a few cues, print, write no manifest
//   node scripts/generate-game-audio-v15.mjs --measure a.mp3 run the same meter over any audio file
//
// Every shipped file is measured after encoding (MP3s are decoded again) and the run fails if a file
// clips, starts or ends off silence, carries DC or is bright above 8 kHz. Each Part A gain is set so the
// cue plays as loud as the file it replaces, judged twice: full range, and through a 400 Hz high-pass that
// stands in for a phone speaker. The run fails if either differs from the old file by more than 2 dB.
// Nothing here is a substitute for listening; the numbers only keep the mix where it was.
import {existsSync,mkdirSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const SR=44100,TAU=Math.PI*2,ASSETS=resolve(dirname(fileURLToPath(import.meta.url)),'../public/assets'),FOLDER='audio-game-v15',OUT=resolve(ASSETS,FOLDER);
/** Digital silence either side of every cue: the first and last 5 ms are measurably empty. */
const HEAD=.006,TAIL=.006,CEILING=8000;
const LIMITS={peakDbfs:-1,edgeDbfs:-50,dcOffset:.0005,above8kHz:.03,loudnessDeltaDb:2};
let seed=1;const rand=()=>{seed=(seed+0x6D2B79F5)|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};
/** Each cue draws from its own stream, so editing one never changes another. */
const reseed=name=>{seed=createHash('sha256').update('v15:'+name).digest().readInt32LE(0);};
const note=m=>440*2**((m-69)/12),len=s=>Math.round(s*SR),clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
const mono=s=>new Float32Array(len(s)),stereo=s=>({l:mono(s),r:mono(s)}),db=v=>20*Math.log10(Math.max(v,1e-6));

// ---- sources ----
/** Sine with a frequency function of time; `drive` adds warm harmonics. */
function tone(seconds,freq,amp,drive=0){const out=mono(seconds);let phase=0;for(let i=0;i<out.length;i++){const t=i/SR;phase+=TAU*freq(t)/SR;const v=Math.sin(phase);out[i]=(drive?Math.tanh(v*(1+drive))/Math.tanh(1+drive):v)*amp(t);}return out;}
/** Band-limited bright tone: harmonics fall off and the upper ones die first, like a struck or blown voice closing. */
function voice(seconds,f,{harmonics=10,tilt=1.1,decay=.5,attack=.006,close=.35,detune=0}={}){const out=mono(seconds),top=Math.max(1,Math.min(harmonics,Math.floor(CEILING/f)));for(let h=1;h<=top;h++){const w=TAU*f*h*(1+detune)/SR,a=1/h**tilt,tau=decay/(1+close*(h-1));for(let i=0;i<out.length;i++){const t=i/SR;out[i]+=Math.sin(w*i)*a*Math.exp(-t/tau)*Math.min(1,t/attack);}}return out;}
/** Struck partials with their own decays; a short ramp rounds the strike and nothing is voiced above the ceiling. */
function struck(seconds,f,partials,ring,attack=.0012){const out=mono(seconds);for(const [ratio,level,scale] of partials){const phase=rand()*TAU;if(f*ratio>CEILING)continue;const w=TAU*f*ratio/SR,tau=ring*scale;for(let i=0;i<out.length;i++){const t=i/SR;out[i]+=Math.sin(w*i+phase)*level*Math.exp(-t/tau)*Math.min(1,t/attack);}}return out;}
function noise(seconds,amp){const out=mono(seconds);for(let i=0;i<out.length;i++)out[i]=(rand()*2-1)*amp(i/SR);return out;}
/** Foil: a cloud of tiny damped rings, each one a crease letting go. `rate` is creases per second. */
function crinkle(seconds,rate,amp,{lo=2200,hi=6400,short=.0007,long=.0032}={}){const out=mono(seconds);let t=0;for(;;){t+=-Math.log(1-rand())/Math.max(1,rate(t));if(t>=seconds)break;const w=TAU*lo*(hi/lo)**rand()/SR,tau=short+rand()*(long-short),a=amp(t)*(.3+rand()*.7)*(rand()<.5?-1:1),start=len(t),n=len(tau*7);for(let i=0;i<n&&start+i<out.length;i++){const u=i/SR;out[start+i]+=a*Math.sin(w*i)*Math.exp(-u/tau);}}return out;}
/** A level that swings between `lo` and `hi`; the rate may accelerate. */
function lfo(seconds,rate,lo=0,hi=1,turn=0){const out=mono(seconds),r=typeof rate==='function'?rate:()=>rate;let phase=turn*TAU;for(let i=0;i<out.length;i++){phase+=TAU*r(i/SR)/SR;out[i]=lo+(hi-lo)*(.5+.5*Math.sin(phase));}return out;}
/** Fibres parting: an irregular run of small catches for a tearing body to ride on. */
function stutter(seconds,rate,depth=.75){const out=mono(seconds),fall=Math.exp(-1/(SR*.005));let level=0,next=0;for(let i=0;i<out.length;i++){const t=i/SR;if(t>=next){level=.45+rand()*.55;next=t+(.55+rand()*.9)/rate(t);}out[i]=1-depth+depth*level;level*=fall;}return out;}
const times=(a,b)=>{const out=new Float32Array(a.length),f=typeof b==='function';for(let i=0;i<a.length;i++)out[i]=a[i]*(f?b(i/SR):b[i]??0);return out;};
const reversed=a=>Float32Array.from(a).reverse();

// ---- filters ----
/** RBJ biquad whose cutoff may move; coefficients refresh every 32 samples. */
function filter(input,type,freq,q=.707){const out=new Float32Array(input.length),f=typeof freq==='function'?freq:()=>freq;let b0=1,b1=0,b2=0,a1=0,a2=0,x1=0,x2=0,y1=0,y2=0;
 for(let i=0;i<input.length;i++){if(i%32===0){const w=TAU*clamp(f(i/SR),20,SR*.45)/SR,c=Math.cos(w),alpha=Math.sin(w)/(2*q);let n0,n1,n2;if(type==='low'){n0=(1-c)/2;n1=1-c;n2=n0;}else if(type==='high'){n0=(1+c)/2;n1=-(1+c);n2=n0;}else{n0=alpha;n1=0;n2=-alpha;}const a0=1+alpha;b0=n0/a0;b1=n1/a0;b2=n2/a0;a1=-2*c/a0;a2=(1-alpha)/a0;}
  const x=input[i],y=b0*x+b1*x1+b2*x2-a1*y1-a2*y2;x2=x1;x1=x;y2=y1;y1=y;out[i]=y;}return out;}

// ---- mixing ----
/** `pan` may be a function of the source's own time; it is kept gentle, width comes from reflections.
 *  The last 2 ms of every layer are tapered, so a layer that is still sounding when its buffer ends cannot click. */
function add(mix,src,at=0,gain=1,pan=0){const start=len(at),taper=Math.min(88,src.length),moving=typeof pan==='function',law=p=>[Math.cos((p+1)*Math.PI/4)*gain,Math.sin((p+1)*Math.PI/4)*gain];let [gl,gr]=law(moving?0:pan);
 for(let i=0;i<src.length&&start+i<mix.l.length;i++){if(start+i<0)continue;if(moving&&i%64===0)[gl,gr]=law(clamp(pan(i/SR),-1,1));const v=i>=src.length-taper?src[i]*(src.length-i)/taper:src[i];mix.l[start+i]+=v*gl;mix.r[start+i]+=v*gr;}}
/** One layer made twice, from fresh noise or with opposite detune, and set either side of centre: the two ears
 *  hear related but different signals, which reads as width without anything being panned hard. */
function wide(mix,make,at=0,gain=1,width=.5){for(const side of [-1,1])add(mix,make(side),at,gain*.72,side*width);}
/** Four short, darker reflections per ear at unequal delays, each fed partly from the other side: width without a tail. */
function early(mix,{wet=.25,dull=4200}={}){const taps={l:[[.0113,.5,'l'],[.0191,.36,'r'],[.0277,.27,'l'],[.0371,.18,'r']],r:[[.0137,.5,'r'],[.0223,.36,'l'],[.0311,.27,'r'],[.0419,.18,'l']]},soft={l:filter(mix.l,'low',dull),r:filter(mix.r,'low',dull)},out={l:mix.l.slice(),r:mix.r.slice()};
 for(const side of ['l','r'])for(const [delay,gain,from] of taps[side]){const d=len(delay),src=soft[from],dst=out[side];for(let i=d;i<dst.length;i++)dst[i]+=src[i-d]*gain*wet;}return out;}
/** Eight damped combs and four allpasses per side, spread between the ears: a small bright hall. */
function room(mix,{size=.8,damp=.35,wet=.2,pre=.012}={}){const combs=[1116,1188,1277,1356,1422,1491,1557,1617],passes=[556,441,341,225],delay=len(pre);
 for(const [channel,spread] of [[mix.l,0],[mix.r,23]]){const dry=channel.slice(),sum=new Float32Array(channel.length);
  for(const c of combs){const n=c+spread,line=new Float32Array(n);let p=0,store=0;for(let i=0;i<dry.length;i++){const input=i>=delay?dry[i-delay]:0,y=line[p];store=y*(1-damp)+store*damp;line[p]=input*.5+store*size;sum[i]+=y;if(++p===n)p=0;}}
  let stage=sum;for(const a of passes){const n=a+spread,line=new Float32Array(n),next=new Float32Array(stage.length);let p=0;for(let i=0;i<stage.length;i++){const held=line[p],y=-stage[i]+held;line[p]=stage[i]+held*.5;next[i]=y;if(++p===n)p=0;}stage=next;}
  for(let i=0;i<channel.length;i++)channel[i]=dry[i]*(1-wet*.35)+stage[i]*wet*.125;}return mix;}
/** Master: trim rumble, optionally round the loudest instants (`drive` is the peak before soft clipping), roll the
 *  top off above `lp`, fade both ends, take out any offset under that fade, set the peak, then pad with silence. */
function finish(mix,{peakDb=-3,fadeIn=.0015,fadeOut=.04,drive=0,hp=32,lp=9000}={}){const n=mix.l.length,a=len(fadeIn),b=Math.min(n,len(fadeOut)),head=len(HEAD),out={l:new Float32Array(head+n+len(TAIL)),r:new Float32Array(head+n+len(TAIL))},shape=new Float32Array(n);
 let raw=0,area=0,peak=0;const tight={l:filter(mix.l,'high',hp),r:filter(mix.r,'high',hp)};for(const ch of [tight.l,tight.r])for(let i=0;i<n;i++)raw=Math.max(raw,Math.abs(ch[i]));
 for(let i=0;i<n;i++){shape[i]=(i<a?i/a:1)*(i>=n-b?.5-.5*Math.cos(Math.PI*(n-i)/b):1);area+=shape[i];}
 const pre=drive&&raw?drive/raw:1;
 for(const side of ['l','r']){let ch=tight[side],mean=0;if(drive)for(let i=0;i<n;i++)ch[i]=Math.tanh(ch[i]*pre);ch=filter(filter(ch,'low',lp,.541),'low',lp,1.307);
  for(let i=0;i<n;i++){ch[i]*=shape[i];mean+=ch[i];}mean/=area;for(let i=0;i<n;i++){ch[i]-=mean*shape[i];peak=Math.max(peak,Math.abs(ch[i]));}tight[side]=ch;}
 const gain=peak?10**(peakDb/20)/peak:1;for(const side of ['l','r'])for(let i=0;i<n;i++)out[side][head+i]=tight[side][i]*gain;return out;}

// ---- shared voices ----
const expo=tau=>t=>Math.exp(-t/tau),hit=(a,tau)=>t=>Math.min(1,t/a)*Math.exp(-t/tau);
const BELL=[[1,1,1],[2.003,.42,.62],[3.01,.2,.42],[4.2,.08,.28]],MALLET=[[1,1,1],[4,.22,.16],[9.2,.06,.08]],GLASS=[[1,1,1],[2.32,.5,.7],[4.25,.3,.5],[6.63,.15,.35]];
const COIN=[[1,1,1],[1.52,.5,.8],[2.26,.34,.55],[2.94,.2,.4],[4.1,.1,.3]],SHELL=[[1,1,1],[2.37,.55,.7],[4.1,.3,.45],[5.9,.12,.3]],CATCH=[[1,1,1],[2.4,.5,.6],[3.9,.25,.4]],PLATE=[[1,1,1],[2.003,.45,.7],[2.76,.3,.5],[4.07,.15,.35]];
/** A weighty body: pitch falls fast, level slower. */
const thump=(from,to,fall,ring,drive=.6)=>tone(ring*7,t=>to+(from-to)*Math.exp(-t/fall),hit(.002,ring),drive);
const sweep=(seconds,from,to,amp,q=1.4)=>filter(noise(seconds,amp),'band',t=>from*(to/from)**(t/seconds),q);
/** A contact: a few milliseconds of band-limited noise. */
const tick=(band,tau=.0015,q=.8)=>filter(noise(tau*6,expo(tau)),'band',band,q);
const hiss=(from,tau=.001)=>filter(noise(tau*6,expo(tau)),'high',from);
/** An impact that keeps its weight in the mids, where a phone speaker can carry it: the crack, the body of the
 *  blow, the struck surface answering, and a sub thump underneath for anything that can play one. */
function smack(mix,at,{sub=[150,42,.11],weight=.3,crack=2400,body=750,surface=330,level=1}={}){add(mix,thump(sub[0],sub[1],.03,sub[2],1),at,weight*level);wide(mix,()=>filter(noise(.22,expo(.045)),'band',body,.6),at,1.1*level,.3);wide(mix,()=>filter(noise(.07,expo(.012)),'band',crack,.7),at,level,.3);
 wide(mix,()=>hiss(3600,.014),at+.001,.3*level,.3);add(mix,tone(.2,()=>surface,hit(.002,.04),.6),at,.3*level);add(mix,tone(.15,()=>surface*2.02,hit(.002,.028),.4),at,.25*level);}
/** One coin: a bright ring in the air, a duller tick with a short ring on the floor. */
function coin(landing){const f=landing?2600+rand()*1300:3100+rand()*1500,ring=landing?.03+rand()*.04:.07+rand()*.09,out=struck(ring*5+.02,f,COIN,ring,.0006),click=landing?tick(1900,.0018):hiss(3600,.0015);for(let i=0;i<click.length&&i<out.length;i++)out[i]+=click[i]*(landing?.9:.4);return out;}
/** A spray leaves contact together, then lands across the floor a beat later. */
function coins(mix,count,at,{launch=.18,flight=[.3,.6],land=.5,level=1}={}){for(let i=0;i<count;i++){const start=at+rand()**1.6*launch,pan=rand()*.8-.4;add(mix,coin(false),start,(.35+rand()*.5)*level,pan);add(mix,coin(true),start+flight[0]+rand()*(flight[1]-flight[0]),(.25+rand()*.4)*land*level,pan*.8);}}
/** A chord struck as one gesture: each note is two slightly detuned voices set a little apart, with a bell on top. */
function chord(mix,root,steps,at,{strum=.014,decay=.7,level=1,bell=.25,seconds=1.6,attack=.006,tilt=1.1}={}){steps.forEach((step,i)=>{const f=note(root+step),start=at+i*strum,gain=level/(1+i*.12);for(const [detune,pan] of [[-.0022,-.32],[.0022,.32]])add(mix,voice(seconds,f,{decay,detune,close:.4,attack,tilt}),start,gain*.5,pan);if(bell)add(mix,struck(seconds*.7,f*2,BELL,decay*.55),start,gain*bell,i%2?.22:-.22);});}
/** One clear bell note: a detuned pair for shimmer, a mallet for the strike. */
function chime(mix,midi,at,level=1,ring=.2,pan=0){const f=note(midi);for(const [detune,side] of [[-.0018,-.25],[.0018,.25]])add(mix,struck(ring*5,f*(1+detune),BELL,ring,.002),at,level*.5,pan+side);add(mix,struck(.3,f,MALLET,ring*.3),at,level*.22,pan);}
/** Small bells scattered after a hit, thinning out as they go. */
function glitter(mix,at,span,count,pitches,level=.1,ring=.09){for(let i=0;i<count;i++){const start=at+rand()**1.4*span;add(mix,struck(ring*5,note(pitches[Math.floor(rand()*pitches.length)]),BELL,ring*(.7+rand()*.6)),start,level*(.5+rand()*.5)*Math.exp(-(start-at)/(span*.7)),rand()*.8-.4);}}
/** Sustained voices as one mono bed, to be filtered and shaped as a whole; make it twice with opposite detune for width. */
function bed(seconds,notes,options={}){const out=mono(seconds);for(const [midi,gain] of notes){const v=voice(seconds,note(midi),{decay:30,close:0,harmonics:9,...options});for(let i=0;i<out.length;i++)out[i]+=v[i]*gain;}return out;}
const HIGH=[96,100,103,108];
/** A hard hollow shell meeting something: contact, the shell's own ring, and what it landed on. */
function knock(mix,at,level,pitch,{hard=1,floor=.35,ring=.02}={}){add(mix,tick(2300*pitch,.0015),at,.6*hard*level);add(mix,struck(ring*6,520*pitch,SHELL,ring,hard<1?.003:.0012),at,level);add(mix,tone(.08,t=>(120+60*Math.exp(-t/.008))*pitch,hit(.001,.022),.4),at,floor*level);}
/** A sprung catch going home: the bolt, a short ring in the housing, and the thud of the body behind it. */
function clack(mix,at,level,ringHz,ring=.03){add(mix,tick(2700,.003),at,level);add(mix,hiss(4200,.002),at,.25*level);add(mix,tone(.08,t=>150+75*Math.exp(-t/.008),hit(.001,.022),.6),at,.3*level);add(mix,struck(ring*6,ringHz,CATCH,ring),at+.001,.7*level,-.1);}
/** Card stock leaving the fingers. */
function snap(mix,at,level=1){add(mix,tick(2400,.0022,.7),at,level);add(mix,tone(.07,t=>330+240*Math.exp(-t/.006),hit(.0008,.014),.4),at,.5*level);add(mix,struck(.05,1180,[[1,1,1],[2.37,.4,.6]],.008),at,.16*level);add(mix,filter(noise(.12,hit(.004,.03)),'band',1900,.9),at+.006,.2*level);}

// ---- the set ----
// seconds: whole file. replaces: the file whose played loudness the gain is matched to (Part A).
// trim: dB above that match. The interface cues carry +4: they moved from bright clicks to soft pitched sounds, which read quieter at equal energy.
// level: played loudness to land on, LUFS (Part B, calibrated against the v14 win set).
// marks: moments inside the file that visuals may want, in seconds from the start of the file.
const set={};
const cue=(name,options,build)=>{set[name]={...options,build:()=>build(options.seconds-HEAD-TAIL)};},mark=t=>+(t+HEAD).toFixed(3);

// ---------- Part A: base game ----------
// Button: a felt tick, a small pop that falls a fifth, one glass partial so repeats stay sweet.
cue('ui',{seconds:.34,replaces:'audio-v12/ui.mp3',trim:4},s=>{const m=stereo(s);add(m,tick(2600,.0011),0,.3);add(m,tone(.09,t=>523.25+262*Math.exp(-t/.012),hit(.0012,.02),.25),0,1);add(m,struck(.12,note(96),[[1,1,1],[2.003,.3,.6]],.022),.001,.14);
 return finish(room(early(m,{wet:.25}),{size:.36,wet:.08,damp:.5}),{hp:180,fadeOut:.08});});
// Card turn: air opening toward the snap, the snap, paper settling.
cue('flip',{seconds:.48,replaces:'audio-v12/flip.mp3',trim:4,marks:{snap:mark(.092)}},s=>{const m=stereo(s),at=.092;
 wide(m,()=>filter(noise(.16,t=>t<at?(t/at)**2.2:Math.exp(-(t-at)/.018)),'band',t=>900*4**Math.min(1,t/at),1.1),0,.55);wide(m,()=>filter(noise(.13,t=>t<at?(t/at)**3*.6:Math.exp(-(t-at)/.012)*.6),'high',3200),0,.22);snap(m,at);
 return finish(room(early(m,{wet:.3}),{size:.45,wet:.12,damp:.5}),{hp:160,fadeOut:.1});});
// Ordinary reveal: two soft mallet notes, fifth then tonic (G5, C6), with a breath on the landing.
cue('normal',{seconds:.66,replaces:'audio-v12/normal.mp3',trim:4},s=>{const m=stereo(s),ding=(midi,at,g,ring)=>{const f=note(midi);add(m,struck(.6,f,MALLET,ring),at,g*.8,-.15);add(m,struck(.6,f,BELL,ring*.8,.003),at+.002,g*.45,.2);add(m,tone(.25,()=>f/2,hit(.004,ring*.45)),at,g*.18);};
 add(m,tick(3000,.0013),0,.16);ding(79,0,.75,.1);ding(84,.085,1,.13);wide(m,()=>sweep(.3,2200,5200,hit(.03,.09)),.08,.08);
 return finish(room(early(m,{wet:.25}),{size:.7,wet:.18,damp:.4}),{hp:140,fadeOut:.15});});
// Rare: a run up the C major triad into a held glow, air rising under it, glitter after.
cue('rare',{seconds:1.26,replaces:'audio-v12/rare.mp3',trim:4},s=>{const m=stereo(s);add(m,thump(120,64,.03,.07,.3),0,.25);wide(m,()=>sweep(.55,1600,6800,t=>Math.sin(Math.PI*clamp(t/.55))**2),0,.2);
 [84,88,91,96,100].forEach((midi,i)=>chime(m,midi,i*.058,.55+i*.11,.16+i*.04));chord(m,72,[0,4,7],0,{strum:.058,decay:.55,level:.3,bell:0,seconds:1.1,attack:.03});glitter(m,.26,.6,14,HIGH,.12);
 return finish(room(m,{size:.84,wet:.3}),{hp:90,fadeOut:.25});});
// Pack settled: C major struck upward, answered by three bells opening above it.
cue('complete',{seconds:2.17,replaces:'audio-v12/complete.mp3',trim:4},s=>{const m=stereo(s);add(m,thump(110,48,.045,.16,.5),0,.3);wide(m,()=>sweep(.5,800,6000,hit(.02,.14)),0,.22);
 chord(m,60,[0,7,12,16,19,24],0,{strum:.013,decay:.6,level:1,bell:.5,seconds:1.9,tilt:.9});chord(m,48,[0,7],0,{strum:0,decay:.7,level:.2,bell:0,seconds:1.9});
 [88,91,96].forEach((midi,i)=>chime(m,midi,.16+i*.085,.44+i*.07,.26));glitter(m,.42,.9,12,HIGH,.1,.12);
 return finish(room(m,{size:.85,wet:.3,damp:.3}),{fadeOut:.45});});
// Count tick: G6 over a quieter G5, one quick harmonic and a coin glint. Gone in 150 ms, so a 90 ms retrigger stays clean.
cue('credit',{seconds:.58,replaces:'audio-v12/credit.mp3',trim:4},s=>{const m=stereo(s),f=note(91);add(m,tick(3400,.0009),0,.25);add(m,tone(.2,()=>f,hit(.001,.022)),0,1);add(m,tone(.2,()=>f/2,hit(.001,.026)),0,.45);add(m,tone(.1,()=>f*2,hit(.001,.012)),0,.3);add(m,struck(.2,f*2,COIN,.025),0,.14,.1);
 return finish(room(early(m,{wet:.25}),{size:.5,wet:.08,damp:.5}),{hp:200,fadeOut:.12});});
// Win landing: weight first, C major on top, a flick upward and a few coins.
cue('win',{seconds:1.2,replaces:'audio-v12/win.mp3',trim:4},s=>{const m=stereo(s);add(m,thump(128,46,.04,.2,.9),0,.55);add(m,filter(noise(.3,expo(.07)),'low',t=>1400*Math.exp(-t/.08)+160),0,.35);add(m,hiss(2800,.007),0,.4);
 chord(m,60,[0,7,12,16,19],.004,{strum:.012,decay:.5,level:.85,bell:.6,seconds:1.05,tilt:.9});chord(m,72,[7,12,16],.07,{strum:.03,decay:.3,level:.4,bell:.7,seconds:.7});coins(m,7,.03,{level:.5,land:.4});
 return finish(room(m,{wet:.24,size:.8}),{fadeOut:.2});});
// Collect: the drawer ("ka"), then two coins a third apart over a C7 bell ("ching"), a few settling on the pile.
cue('wincollect',{seconds:1,replaces:'audio-v12/wincollect.mp3',trim:4,marks:{ching:mark(.068)}},s=>{const m=stereo(s),at=.068;add(m,tick(1900,.002,.9),0,.7);add(m,tone(.06,t=>260+120*Math.exp(-t/.008),hit(.001,.016),.4),0,.4);add(m,struck(.1,note(91),COIN,.022),0,.3,-.1);
 add(m,struck(.8,note(96),BELL,.2,.0015),at,.5);add(m,struck(.7,note(100),COIN,.16),at,.6,-.25);add(m,struck(.7,note(103),COIN,.13),at+.012,.45,.25);add(m,hiss(3600,.0012),at,.3);add(m,tone(.2,()=>note(84),hit(.002,.05)),at,.2);
 for(let i=0;i<3;i++)add(m,coin(true),at+.11+i*.06+rand()*.03,.12-.02*i,rand()*.6-.3);
 return finish(room(early(m,{wet:.2}),{size:.76,wet:.22}),{hp:160,fadeOut:.2});});
// Latch: spring take-up, then the bolt home with a short ring.
cue('latch',{seconds:.31,replaces:'audio-v4/latch.mp3',marks:{bolt:mark(.055)}},s=>{const m=stereo(s);add(m,hiss(3200,.0015),0,.3);add(m,struck(.05,2050,CATCH,.008),0,.25);clack(m,.055,1,note(86));add(m,struck(.2,note(93),[[1,1,1],[2.1,.3,.5]],.02),.059,.25,.15);
 return finish(room(early(m,{wet:.3}),{size:.4,wet:.12,damp:.5}),{hp:70,fadeOut:.06});});
// Stage on: a relay, power gliding up an octave, C major opening from dark to bright, two glints when it is lit.
cue('stage',{seconds:.8,replaces:'audio-v4/stage.mp3'},s=>{const m=stereo(s);add(m,tone(.06,t=>90+50*Math.exp(-t/.01),hit(.001,.02),.5),0,.2);add(m,tick(1800,.0015,.9),0,.3);
 add(m,tone(.5,t=>130.81*2**(Math.min(1,t/.3)**.7),t=>Math.sin(Math.PI*clamp(t/.5))**1.2,.5),0,.18);
 wide(m,side=>filter(bed(s,[[60,.8],[67,.8],[72,1],[76,.8],[79,.6]],{decay:.26,close:.15,attack:.09,harmonics:10,tilt:.85,detune:side*.003}),'low',t=>700+5800*clamp(t/.28)**1.5,.8),0,.9,.3);
 wide(m,()=>sweep(.6,1400,5200,t=>Math.sin(Math.PI*clamp(t/.6))**2),0,.25);add(m,struck(.45,note(91),BELL,.14,.003),.2,.22,-.15);add(m,struck(.4,note(96),BELL,.12,.003),.26,.14,.2);
 return finish(room(m,{size:.8,wet:.28}),{fadeOut:.2});});
// Card into the tray: a paper slap, a felt puff, a small tup underneath.
cue('land',{seconds:.22,replaces:'audio-v12/land.mp3',trim:4},s=>{const m=stereo(s);add(m,filter(noise(.06,expo(.009)),'band',1500,.7),0,1);add(m,filter(noise(.08,expo(.016)),'band',800,.7),0,.6);add(m,tone(.08,t=>200+80*Math.exp(-t/.008),hit(.0012,.018),.3),0,.12);add(m,hiss(3000,.003),0,.25);
 return finish(room(early(m,{wet:.3}),{size:.35,wet:.1,damp:.6}),{hp:90,fadeOut:.06});});
// Suspense: an open fifth on the dominant (G, D) in quickening tremolo, an inner voice creeping A to B.
// The flip comes 0.55-0.62 s in and the face 0.24 s later, so it crests at 0.86 s and lets go under the reveal.
cue('suspense',{seconds:1.3,replaces:'audio-v4/suspense.mp3',marks:{crest:mark(.86)}},s=>{const m=stereo(s),crest=.86,swell=t=>t<crest?.18+.82*(t/crest)**1.5:Math.exp(-(t-crest)/.16),shake=lfo(s,t=>9+11*clamp(t/crest)**1.4,.1,1);
 wide(m,side=>times(times(filter(bed(s,[[55,.4],[67,1],[74,.8],[79,.7],[86,.4]],{tilt:.9,attack:.03,detune:side*.003}),'low',t=>900+4300*clamp(t/crest)**1.6,.9),shake),swell),0,1,.3);
 add(m,times(times(tone(s,t=>note(69)*2**(2*clamp(t/crest)**2/12),()=>1,.4),shake),swell),0,.2);wide(m,()=>times(sweep(s,1200,6500,t=>swell(t)**1.5),shake),0,.4);add(m,tone(s,()=>note(43),t=>swell(t)*.8,.4),0,.12);
 return finish(room(m,{size:.7,wet:.18}),{fadeOut:.12});});
// Charge: G3 gliding two octaves under a quickening pulse, air and motes climbing the scale; ends ready, no impact.
// The pack cinema lets go 0.74 s in, so it is at strength by 0.7 s and only pitch and pulse keep climbing after.
cue('charge',{seconds:1.3,replaces:'audio-v4/charge.mp3'},s=>{const m=stereo(s),scale=[67,69,71,72,74,76,79,81,83,84,86,88,91],pulse=lfo(s,t=>7+25*(t/s)**1.7,.24,1),grow=t=>.12+.88*clamp(t/.7)**1.6;
 wide(m,side=>{const body=mono(s);for(const d of [-.006,0,.007]){const v=tone(s,t=>note(55)*(1+d+side*.002)*2**(2*(t/s)**1.5),()=>1,1.3);for(let i=0;i<body.length;i++)body[i]+=v[i]/3;}return times(times(filter(body,'low',t=>600*12**(t/s),.9),pulse),grow);},0,.9,.3);
 wide(m,()=>sweep(s,350,7000,t=>grow(t)**1.4),0,.6);add(m,tone(s,t=>49+33*(t/s),t=>grow(t)*.8,.5),0,.15);
 scale.forEach((midi,i)=>add(m,struck(.2,note(midi+12),BELL,.035),s*(i/scale.length)**.62*.96,.07+.015*i,i%2?.3:-.3));
 return finish(early(m,{wet:.25}),{fadeOut:.012});});
// Slam: the crack and body of a heavy stamp with a short sub thump under it. The thump is kept brief because the
// pack cinema stacks a slam under every card's arrival.
cue('slam',{seconds:.42,replaces:'audio-v4/slam.mp3'},s=>{const m=stereo(s);smack(m,0,{sub:[150,40,.08],weight:.22});
 return finish(room(m,{size:.6,wet:.2,damp:.45}),{drive:1.3,fadeOut:.08});});
// Throw: the hand letting go, then air rushing past and falling away, with the ball's spin in it.
cue('throw',{seconds:.54,replaces:'audio-v4/throw.mp3',marks:{peak:mark(.14)}},s=>{const m=stereo(s),pk=.14,shape=t=>t<pk?(t/pk)**1.6:Math.exp(-(t-pk)/.085),spin=lfo(s,31,.56,1);
 wide(m,()=>times(filter(noise(s,shape),'band',t=>t<pk?420*(1700/420)**(t/pk):1700*(600/1700)**clamp((t-pk)/.3),1.3),spin),0,1);wide(m,()=>filter(noise(s,t=>shape(t)*.5),'high',3000),0,.12);add(m,tone(.3,t=>420-200*clamp(t/.3),t=>shape(t)*.6,.3),0,.12);add(m,filter(noise(.02,expo(.005)),'band',600,.7),0,.4);
 return finish(room(early(m,{wet:.3}),{size:.5,wet:.12}),{hp:90,fadeOut:.1});});
// Flight: the ball coming at the lens. It grows for 0.93 s, passes, and the pitch drops away before the 1.12 s hit.
cue('flight',{seconds:1.12,replaces:'audio-v13/flight.mp3',marks:{pass:mark(.93)}},s=>{const m=stereo(s),pk=.93,shape=t=>t<pk?.02+.98*(t/pk)**3.2:Math.exp(-(t-pk)/.045),spin=lfo(s,t=>14+24*clamp(t/pk),.6,1);
 wide(m,()=>times(filter(noise(s,shape),'band',t=>t<pk?420*(1900/420)**((t/pk)**1.5):1900*(650/1900)**clamp((t-pk)/.12),1.4),spin),0,1);wide(m,()=>filter(noise(s,t=>shape(t)*.5),'high',2800),0,.2);
 add(m,times(tone(s,t=>t<pk?560*(1+.18*(t/pk)**2):660*.62**clamp((t-pk)/.1),shape,.3),spin),0,.28);add(m,tone(s,t=>70+40*clamp(t/pk),t=>shape(t)*.8,.5),0,.2);
 return finish(room(early(m,{wet:.3}),{size:.6,wet:.14}),{fadeOut:.04});});
// Impact: the shell's knock and a punch of air, a crack, a little grit.
cue('impact',{seconds:.52,replaces:'audio-v4/impact.mp3'},s=>{const m=stereo(s);add(m,thump(190,58,.022,.085,.9),0,.4);add(m,struck(.2,640,SHELL,.03),0,.9);add(m,filter(noise(.1,expo(.02)),'band',1200,.8),0,.9);add(m,tick(2600,.004),0,.6);add(m,hiss(3200,.007),0,.25);
 for(let i=0;i<5;i++)add(m,tick(1800+rand()*2400,.0015,2),.05+rand()**1.3*.2,.1+rand()*.1,rand()*.6-.3);
 return finish(room(m,{size:.58,wet:.18}),{drive:1.25,fadeOut:.1});});
// Release: the catch, a body of air bursting upward, C major and a shimmer that thins out.
cue('release',{seconds:1,replaces:'audio-v13/release.mp3'},s=>{const m=stereo(s);add(m,tick(2600,.0015),0,.5);add(m,thump(125,46,.045,.17,.9),0,1.2);wide(m,()=>sweep(.42,600,6200,hit(.008,.1)),0,.7);add(m,tone(.3,t=>300*5**clamp(t/.16),hit(.004,.07),.3),0,.3);
 chord(m,72,[0,4,7,12],.01,{strum:.02,decay:.4,level:.35,bell:.5,seconds:.9});glitter(m,.06,.7,16,HIGH,.16,.08);
 return finish(room(m,{size:.84,wet:.3}),{fadeOut:.2});});
// Bounces: a hard shell on a floor. The settle is lower, softer and duller.
cue('ballbounce',{seconds:.16,replaces:'audio-v7/ballbounce.wav'},s=>{const m=stereo(s);knock(m,0,1,1);return finish(room(early(m,{wet:.3}),{size:.3,wet:.1,damp:.6}),{hp:60,fadeOut:.04});});
cue('ballsettle',{seconds:.16,replaces:'audio-v7/ballsettle.wav'},s=>{const m=stereo(s);knock(m,0,1,.84,{hard:.5,ring:.017});return finish(room(early(m,{wet:.3}),{size:.3,wet:.1,damp:.6}),{hp:60,lp:5200,fadeOut:.04});});
// Tear: the notch gives, fibres part in a steady rip that brightens, the strip comes free.
function rip(s,end,body,{from,to,curve,catches,creases,pop=.9}){const m=stereo(s),p=t=>clamp(t/end)**curve;
 add(m,times(filter(noise(s,body),'band',t=>from+(to-from)*p(t),.9),stutter(s,t=>catches[0]+(catches[1]-catches[0])*p(t))),0,.9,-.3);
 add(m,times(filter(noise(s,t=>body(t)*.6),'band',t=>from*1.9+(to-from)*.6*p(t),1.2),stutter(s,t=>catches[0]*1.4+(catches[1]-catches[0])*p(t),.85)),0,.5,.3);
 wide(m,()=>crinkle(s,t=>t<end?(creases[0]+(creases[1]-creases[0])*p(t))/2:20,body),0,.6,.4);add(m,tick(3000,.004,.7),0,.8);add(m,tick(2500,.006,.7),end,pop);add(m,tone(.05,t=>420+200*Math.exp(-t/.006),hit(.001,.012)),end,.3*pop);return m;}
cue('tear',{seconds:1.2,replaces:'audio-v4/tear.mp3',marks:{free:mark(.98)}},s=>{const end=.98,body=t=>t<.012?t/.012:t<end?1-.45*(t/end):Math.exp(-(t-end)/.03)*.55;
 return finish(room(early(rip(s,end,body,{from:2100,to:4500,curve:.8,catches:[62,102],creases:[520,520]}),{wet:.3}),{size:.5,wet:.1,damp:.4}),{hp:250,lp:7600,fadeOut:.12});});
// Pack tear: the same foil, but it quickens and climbs into the pop as the top comes away.
cue('packtear',{seconds:1,replaces:'audio-v9/packtear.mp3',marks:{free:mark(.84)}},s=>{const end=.84,body=t=>t<.01?t/.01*.5:t<end?.5+.5*(t/end)**1.6:Math.exp(-(t-end)/.025)*.6;
 return finish(room(early(rip(s,end,body,{from:1900,to:4800,curve:1.3,catches:[50,120],creases:[350,800],pop:1.1}),{wet:.3}),{size:.5,wet:.1,damp:.4}),{hp:250,lp:7600,fadeOut:.1});});
// Rustle: foil in the hand, three closing squeezes.
cue('packrustle',{seconds:.5,replaces:'audio-v9/packrustle.mp3',trim:4},s=>{const m=stereo(s),hand=t=>Math.exp(-(((t-.05)/.035)**2))+.75*Math.exp(-(((t-.19)/.05)**2))+.3*Math.exp(-(((t-.32)/.05)**2));
 add(m,crinkle(s,t=>900*hand(t)+20,hand,{lo:2400,hi:6800}),0,1,-.3);add(m,crinkle(s,t=>500*hand(t)+10,hand,{lo:1800,hi:5000,long:.006}),0,.6,.3);wide(m,()=>filter(noise(s,hand),'band',3600,.7),0,.22);
 return finish(room(early(m,{wet:.3}),{size:.4,wet:.08}),{hp:300,lp:7600,fadeOut:.1});});

// ---------- Part B: legendary capture ----------
// Merge: three trains of small bells a fifth below, on, and a fourth above C6 circle inward, quickening and closing
// on the same note, and fuse in a chime 0.80 s in: the celebration starts the cue 0.80 s before the balls fuse.
cue('cap-merge',{seconds:1.25,level:-20,marks:{chime:mark(.794)}},s=>{const m=stereo(s),at=.794,p=t=>clamp(t/at)**1.6,rise=t=>t<at-.012?.25+.75*(t/at)**1.5:t<at?(at-t)/.012:0,orbit=t=>TAU*(2*t+2.8*t*t);
 [.667,1,1.335].forEach((ratio,i)=>{const side=t=>.45*(1-p(t))*Math.sin(orbit(t)+i*TAU/3);add(m,times(tone(at,t=>note(84)*ratio**(1-p(t)),rise,.2),lfo(at,t=>7+19*clamp(t/at)**1.5,.25,1,i/3)),0,.24,side);
  for(let t=i*.05;t<at-.03;t+=1/(6+16*(t/at)**1.5))add(m,struck(.14,note(84)*ratio**(1-p(t)),BELL,.035-.012*t/at),t,.62*(.3+.7*(t/at)**1.5),side(t));});
 wide(m,()=>sweep(at,1500,6500,t=>(t/at)**2.2),0,.4);
 add(m,thump(140,60,.03,.1,.4),at,.4);add(m,hiss(3200,.0012),at,.25);[84,88,91,96].forEach((midi,i)=>chime(m,midi,at+i*.006,.8-.1*i,.17));glitter(m,at+.04,.25,8,HIGH,.12,.07);
 return finish(room(m,{size:.74,wet:.28}),{fadeOut:.2});});
// Enter: a puff as the light catches, air and a tone climbing from C2 as it gathers, then a deep wide boom with C under it.
cue('cap-enter',{seconds:1.8,level:-15,marks:{boom:mark(.994)}},s=>{const at=.994,m=stereo(s),light=t=>t<at?.05+.95*(t/at)**2:Math.exp(-(t-at)/.25);
 wide(m,()=>filter(noise(.3,hit(.012,.07)),'band',1300,.7),0,.2);wide(m,()=>sweep(at,250,6800,t=>.05+.95*(t/at)**2.3),0,.8);add(m,tone(at,t=>65.41*4**((t/at)**1.3),t=>(.04+.96*(t/at)**2.2)*.6,.8),0,.5);
 wide(m,side=>times(filter(bed(s,[[72,1],[74,.7],[79,.8],[88,.4]],{attack:.5,detune:side*.003}),'low',t=>600+4200*clamp(t/at)**2,.8),light),0,.35,.3);
 add(m,thump(72,27,.11,.32,1.2),at,.8);wide(m,()=>filter(noise(.7,expo(.16)),'low',t=>2200*Math.exp(-t/.16)+160),at,1);wide(m,()=>filter(noise(.7,hit(.004,.22)),'high',4000),at,.2);
 chord(m,36,[0,7,12,19],at,{strum:0,decay:.5,level:.4,bell:.12,seconds:.78});chord(m,60,[0,7,12],at,{strum:0,decay:.4,level:.3,bell:.2,seconds:.78});glitter(m,at+.03,.5,12,HIGH,.1,.1);
 return finish(room(m,{size:.86,wet:.32,damp:.3}),{drive:1.4,fadeOut:.35});});
// Presence: a distant strike, a low C with a shadow falling from A-flat to G, then an open C add9 pad blooming over it.
cue('cap-presence',{seconds:2.4,level:-18},s=>{const m=stereo(s),out=t=>1-smooth((t-1.75)/(s-1.75)),swell=t=>smooth(t/1.4)**1.5*out(t),late=t=>smooth((t-.5)/1.1)*out(t);
 add(m,thump(60,31,.12,.45,1),0,.4);wide(m,()=>filter(noise(.8,expo(.25)),'low',t=>700*Math.exp(-t/.2)+90),0,.3);
 for(const [d,g] of [[0,1],[.007,.7]])add(m,tone(s,()=>65.41*(1+d),t=>swell(t)*g,.8),0,.3,d?.25:-.25);add(m,tone(s,t=>note(56)*2**(-smooth((t-.5)/.9)/12),swell,.6),0,.22);
 wide(m,side=>times(filter(bed(s,[[48,.8],[60,1],[67,.8]],{attack:.5,tilt:1.1,detune:side*.003}),'low',t=>400+1800*smooth(t/1.6),.8),swell),0,.5,.3);
 wide(m,side=>times(filter(bed(s,[[72,1],[74,.6],[76,.8],[79,.7],[84,.4]],{attack:.7,tilt:1.2,detune:side*.003}),'low',t=>600+3400*smooth((t-.4)/1.3),.8),late),0,.5,.35);
 wide(m,()=>filter(noise(s,swell),'band',1100,.6),0,.07);wide(m,()=>filter(noise(s,late),'band',3800,.8),0,.035);[[91,1.15],[98,1.4],[96,1.62]].forEach(([midi,at],i)=>chime(m,midi,at,.07,.3,i%2?.25:-.25));
 return finish(room(m,{size:.9,wet:.36,damp:.3}),{fadeOut:.5});});
// Ready: a soft two-part ping, G6 then C7.
cue('cap-ready',{seconds:.5,level:-28},s=>{const m=stereo(s);add(m,hiss(3200,.0008),0,.12);add(m,struck(.45,note(91),BELL,.11,.002),0,.8,-.2);add(m,struck(.45,note(96),BELL,.14,.003),.012,.6,.2);add(m,tone(.2,()=>note(79),hit(.003,.05)),0,.25);
 return finish(room(early(m,{wet:.25}),{size:.7,wet:.22}),{hp:200,fadeOut:.15});});
// Throw: like the base throw, but the spin is the point: a fast flutter and the seam whirring.
cue('cap-throw',{seconds:.6,level:-23,marks:{peak:mark(.16)}},s=>{const m=stereo(s),pk=.16,shape=t=>t<pk?(t/pk)**1.5:Math.exp(-(t-pk)/.1),spin=lfo(s,t=>34+24*clamp(t/s),.3,1),path=t=>t<pk?(t/pk):1-clamp((t-pk)/.34);
 wide(m,()=>times(filter(noise(s,shape),'band',t=>600*(2600/600)**path(t)**(t<pk?1:.6),1.3),spin),0,1);wide(m,()=>times(filter(noise(s,t=>shape(t)*.5),'high',3000),spin),0,.2);
 add(m,times(tone(s,t=>700*(1250/700)**path(t),shape,.3),spin),0,.22);add(m,filter(noise(.02,expo(.005)),'band',600,.7),0,.4);add(m,tone(.06,t=>260-80*clamp(t/.06),hit(.002,.015),.3),0,.25);
 return finish(room(early(m,{wet:.3}),{size:.5,wet:.12}),{hp:90,fadeOut:.1});});
// Hit: a sharp crack, a sub thump, the shell, and one spark of the energy it struck.
cue('cap-hit',{seconds:.5,level:-20},s=>{const m=stereo(s);smack(m,0,{sub:[175,44,.13],weight:.2,crack:3100,body:900,surface:349});add(m,hiss(2600,.002),0,.6);add(m,struck(.15,700,SHELL,.022),0,.5);add(m,struck(.25,note(98),GLASS,.05),.002,.2,.2);
 return finish(room(m,{size:.62,wet:.22}),{drive:2,fadeOut:.1});});
// Absorb: a detuned glide through three octaves (G3 to G6) with tightening vibrato, air whistling at its octave,
// motes drawn in up the scale; shut off at 1.1 s with no tail.
cue('cap-absorb',{seconds:1.18,level:-19,marks:{end:mark(1.094)}},s=>{const end=1.094,m=stereo(s),rise=t=>t<end?.07+.93*(t/end)**2.2:0,pull=t=>196*8**((t/end)**1.25)*(1+.018*Math.sin(TAU*t*(5+20*t/end))),scale=[60,62,64,67,69,72,74,76,79,81,84,86,88,91,93,96];
 wide(m,side=>{const body=mono(end);for(const d of [-.005,0,.006]){const v=tone(end,t=>pull(t)*(1+d+side*.002),()=>1,.9);for(let i=0;i<body.length;i++)body[i]+=v[i]/3;}return times(filter(body,'low',t=>pull(t)*3,.8),rise);},0,.6,.3);
 wide(m,()=>filter(noise(end,rise),'band',t=>pull(t)*2,5),0,.5);wide(m,()=>sweep(end,450,7200,rise),0,.7);
 scale.forEach((midi,i)=>add(m,struck(.12,note(midi+12),BELL,.025),end*(i/scale.length)**.55*.97,.04+.012*i,i%2?.3:-.3));
 const air=early(m,{wet:.25}),gate=t=>t<end-.006?1:t<end?(end-t)/.006:0;for(const side of ['l','r'])air[side]=times(air[side],gate);add(air,tick(1500,.0015,1),end,.2);add(air,tone(.04,()=>240,hit(.001,.008)),end,.16);
 return finish(air,{fadeOut:.03});});
// Shut: the lid's clack with a short ring on the dominant (D6 and G6).
cue('cap-shut',{seconds:.4,level:-24},s=>{const m=stereo(s);add(m,tick(2500,.003),0,1);add(m,hiss(4000,.002),0,.25);add(m,tone(.09,t=>170+90*Math.exp(-t/.007),hit(.001,.024),.6),0,.4);add(m,struck(.35,note(86),[[1,1,1],[2.76,.5,.6],[5.4,.2,.35]],.075),.001,.6,-.15);add(m,struck(.3,note(91),[[1,1,1],[2.3,.3,.5]],.05),.003,.3,.2);
 return finish(room(early(m,{wet:.3}),{size:.5,wet:.16}),{hp:70,fadeOut:.08});});
// Drop: a thud, then two quick smaller bounces, each a little higher and shorter.
cue('cap-drop',{seconds:.7,level:-23,marks:{bounce1:mark(0),bounce2:mark(.27),bounce3:mark(.43)}},s=>{const m=stereo(s);add(m,thump(150,55,.03,.09,.8),0,.45);add(m,filter(noise(.1,expo(.02)),'band',800,.8),0,.5);knock(m,0,1,1);knock(m,.27,.5,1.08);knock(m,.43,.28,1.16,{ring:.016});
 return finish(room(m,{size:.6,wet:.2}),{fadeOut:.12});});
// Wobble: the ball rocks out, and knocks again as it comes back through centre 0.3 s later, the catch rattling
// inside. G, A, B: each a step higher with more rattle and a tighter shimmer, so the lock resolves the line to C.
for(const n of [1,2,3])cue('cap-wobble-'+n,{seconds:.5,level:-26.5+n*.5,marks:{out:mark(0),back:mark(.3)}},s=>{const m=stereo(s),pitch=2**((n-1)/6),gap=.3,f=note(55+2*(n-1));
 knock(m,0,1,.8*pitch);knock(m,gap,.72,.86*pitch);for(let i=0;i<3+n;i++)add(m,tick(3000+rand()*1500,.0008,3),.03+rand()*(gap+.05),.12+rand()*.1,rand()*.6-.3);
 add(m,filter(noise(gap,t=>Math.sin(Math.PI*clamp(t/gap))),'band',500+90*n,.8),0,.2);
 wide(m,side=>times(bed(.4,[[67+2*(n-1),1],...(n>1?[[74+2*(n-1),.6]]:[])],{decay:.12,close:.2,attack:.01,detune:side*.003}),lfo(.4,12+3*n,.4,1)),.004,.05+.03*n,.3);add(m,tone(.3,()=>f*2,hit(.004,.05),.4),0,.25);
 return finish(room(early(m,{wet:.3}),{size:.5,wet:.14}),{hp:60,fadeOut:.1});});
// Hold: the dominant triad (G, B, D) in quickening tremolo with bells trembling above; it stops dead for the verdict,
// which the encounter places 1.30 s after the hold begins.
cue('cap-hold',{seconds:1.3,level:-21,marks:{stop:mark(1.3-HEAD-TAIL-.008)}},s=>{const m=stereo(s),rise=t=>.2+.8*(t/s)**1.6,rate=t=>10+14*(t/s)**1.3,shake=lfo(s,rate,.12,1),answer=lfo(s,rate,.12,1,.5);
 wide(m,side=>times(times(filter(bed(s,[[55,.4],[67,1],[71,.8],[74,.8],[79,.5]],{tilt:.9,attack:.04,detune:side*.003}),'low',t=>900+4300*(t/s)**1.5,.9),shake),rise),0,1,.3);
 wide(m,side=>times(times(bed(s,[[83,1],[86,.8],[91,.6]],{tilt:1.6,attack:.05,harmonics:3,detune:side*.002}),answer),t=>rise(t)**2),0,.3,.35);wide(m,()=>times(sweep(s,1500,6500,t=>rise(t)**2),shake),0,.35);add(m,tone(s,()=>note(43),t=>rise(t)*.8,.4),0,.12);
 return finish(early(m,{wet:.25}),{fadeOut:.008});});
// Lock: the catch goes home, then C major is thrown upward in bells with stars after it.
cue('cap-lock',{seconds:1.2,level:-16.5,marks:{click:mark(0),star:mark(.085)}},s=>{const m=stereo(s),at=.085;clack(m,0,1,note(86));add(m,thump(130,62,.03,.09,.4),at,.35);wide(m,()=>sweep(.4,2000,6500,hit(.02,.1)),at,.2);
 chord(m,72,[0,4,7,12,16],at,{strum:.022,decay:.4,level:.8,bell:.55,seconds:1});glitter(m,at+.1,.6,14,HIGH,.14,.1);
 return finish(room(m,{size:.82,wet:.3}),{fadeOut:.2});});
// Break: the energy bursts out and falls, glass goes with it, the last pieces find the floor.
cue('cap-break',{seconds:1,level:-17},s=>{const m=stereo(s);smack(m,0,{sub:[160,42,.14],weight:.35,crack:2800,body:800,surface:277});wide(m,()=>sweep(.3,6000,700,hit(.004,.07)),0,.7);add(m,tone(.4,t=>520*(110/520)**clamp(t/.3),hit(.004,.1),.5),0,.35);wide(m,()=>filter(noise(.3,expo(.06)),'band',5200,.7),0,.4);
 for(let i=0;i<34;i++){const at=.004+rand()**2.2*.55;add(m,struck(.3,2300+rand()*4200,GLASS,.02+rand()*.07,.0006),at,(.12+rand()*.22)*Math.exp(-at/.3),rand()*.8-.4);}for(let i=0;i<6;i++)add(m,struck(.15,2600+rand()*2600,GLASS,.02+rand()*.02,.0006),.5+rand()*.35,.03+rand()*.03,rand()*.8-.4);
 return finish(room(m,{size:.78,wet:.24}),{drive:1.3,fadeOut:.2});});
// Flee: air and a tone falling away and fading as it goes.
cue('cap-flee',{seconds:1,level:-23},s=>{const m=stereo(s),shape=t=>Math.min(1,t/.04)*Math.exp(-t/.3),waver=lfo(s,17,.7,1);
 wide(m,()=>times(filter(noise(s,shape),'band',t=>4600*(320/4600)**((t/s)**.8),1.3),waver),0,1);add(m,tone(s,t=>920*(170/920)**((t/s)**.7),t=>shape(t)*.5,.3),0,.35);wide(m,()=>filter(noise(s,t=>shape(t)*.5),'high',3000),0,.15);
 return finish(room(m,{size:.74,wet:.22}),{fadeOut:.25});});
// Card: light opening (C sus2 and rising air), then the card snaps face-up with two small bells.
cue('cap-card',{seconds:.9,level:-20,marks:{snap:mark(.594)}},s=>{const m=stereo(s),at=.594,rise=t=>t<at?smooth(t/.16)*(.5+.5*(t/at)**1.5):Math.exp(-(t-at)/.05);
 wide(m,()=>sweep(at+.1,1100,5600,rise),0,.4);wide(m,side=>times(filter(bed(s,[[72,1],[74,.7],[79,.8],[84,.5]],{attack:.3,detune:side*.003}),'low',t=>700+3600*clamp(t/at)**1.6,.8),rise),0,.5,.3);add(m,tone(at+.1,t=>392*2**clamp(t/at),t=>rise(t)*.5,.3),0,.2);
 snap(m,at);add(m,struck(.28,note(91),BELL,.09),at+.004,.25,-.2);add(m,struck(.28,note(96),BELL,.1),at+.02,.2,.2);
 return finish(room(m,{size:.74,wet:.22}),{fadeOut:.12});});
// Multiplier: a heavy stamp with a plate ringing C, G, C above it.
cue('cap-mult',{seconds:.7,level:-18},s=>{const m=stereo(s);smack(m,0,{sub:[140,40,.17],weight:.35,surface:392});for(const [midi,g,pan] of [[72,1,-.25],[79,.7,.25],[84,.5,0]])add(m,struck(.6,note(midi),PLATE,.22),.004,.5*g,pan);
 return finish(room(m,{size:.74,wet:.22}),{drive:1.3,fadeOut:.15});});
// Exit: a soft whoosh in reverse, swelling with a bell pad played backwards, then closing gently.
cue('cap-exit',{seconds:.9,level:-22,marks:{close:mark(.74)}},s=>{const m=stereo(s),pk=.74,shape=t=>t<pk?(t/pk)**2.4:.5+.5*Math.cos(Math.PI*clamp((t-pk)/.12));
 wide(m,()=>filter(noise(s,shape),'band',t=>420*(4400/420)**clamp(t/pk),1.2),0,1);add(m,tone(s,t=>220*3**clamp(t/pk),t=>shape(t)*.4,.3),0,.3);
 wide(m,side=>{const pad=mono(pk);for(const midi of [72,79,86]){const v=struck(pk,note(midi)*(1+side*.002),BELL,.3);for(let i=0;i<pad.length;i++)pad[i]+=v[i]*.3;}return times(reversed(pad),t=>1-smooth((t-pk+.08)/.08));},0,.5,.3);
 return finish(room(m,{size:.7,wet:.18}),{lp:7600,fadeOut:.1});});

// ---- measure ----
function biquad(x,[b0,b1,b2,a1,a2]){const out=new Float64Array(x.length);let x1=0,x2=0,y1=0,y2=0;for(let i=0;i<x.length;i++){const v=x[i],y=b0*v+b1*x1+b2*x2-a1*y1-a2*y2;x2=x1;x1=v;y2=y1;y1=y;out[i]=y;}return out;}
/** ITU-R BS.1770 K-weighting at this sample rate: a +4 dB shelf above 1.7 kHz and a 38 Hz high-pass. */
function kWeight(x){const A=10**(3.999843853973347/40),w=TAU*1681.974450955533/SR,c=Math.cos(w),al=Math.sin(w)/(2*.7071752369554196),r=2*Math.sqrt(A)*al,a0=A+1-(A-1)*c+r;
 const shelf=[A*(A+1+(A-1)*c+r)/a0,-2*A*(A-1+(A+1)*c)/a0,A*(A+1+(A-1)*c-r)/a0,2*(A-1-(A+1)*c)/a0,(A+1-(A-1)*c-r)/a0];
 const w2=TAU*38.13547087602444/SR,c2=Math.cos(w2),al2=Math.sin(w2)/(2*.5003270373238773),b=1+al2;return biquad(biquad(x,shelf),[(1+c2)/2/b,-(1+c2)/b,(1+c2)/2/b,-2*c2/b,(1-al2)/b]);}
function power(x){let n=1;while(n<x.length)n<<=1;const re=new Float64Array(n),im=new Float64Array(n);re.set(x);
 for(let i=1,j=0;i<n;i++){let bit=n>>1;for(;j&bit;bit>>=1)j^=bit;j^=bit;if(i<j){const t=re[i];re[i]=re[j];re[j]=t;}}
 for(let size=2;size<=n;size<<=1){const ang=-TAU/size,wr=Math.cos(ang),wi=Math.sin(ang);for(let i=0;i<n;i+=size){let cr=1,ci=0;for(let k=0;k<size/2;k++){const a=i+k,b=a+size/2,tr=re[b]*cr-im[b]*ci,ti=re[b]*ci+im[b]*cr;re[b]=re[a]-tr;im[b]=im[a]-ti;re[a]+=tr;im[a]+=ti;const t=cr*wr-ci*wi;ci=cr*wi+ci*wr;cr=t;}}}
 const p=new Float64Array(n/2);for(let i=0;i<n/2;i++)p[i]=re[i]*re[i]+im[i]*im[i];return {p,bin:SR/n};}
/** Loudest 400 ms after K-weighting, as LUFS. A shorter file is measured against the full window, so brief cues compare by energy. */
function loudest(l,r){const n=l.length,kl=kWeight(l),kr=kWeight(r),win=len(.4),acc=new Float64Array(n+1);for(let i=0;i<n;i++)acc[i+1]=acc[i]+kl[i]**2+kr[i]**2;let loud=acc[n]/win;for(let i=0;i+win<=n;i+=441)loud=Math.max(loud,(acc[i+win]-acc[i])/win);return -.691+10*Math.log10(Math.max(loud,1e-12));}
/** What a phone speaker keeps: a second-order high-pass at 400 Hz. */
const small=x=>{const w=TAU*400/SR,c=Math.cos(w),al=Math.sin(w)/(2*Math.SQRT1_2),b=1+al;return biquad(x,[(1+c)/2/b,-(1+c)/b,(1+c)/2/b,-2*c/b,(1-al)/b]);};
/** duration, peak, RMS, spectral centroid, share of energy above 8 kHz, loudness (full range and as a small speaker
 *  would give it), edges, DC and stereo correlation. */
function measure(m){const n=m.l.length,edge=len(.005),r1=v=>+v.toFixed(1);let peak=0,sum=0,head=0,tail=0,dc=0,lr=0,ll=0,rr=0;
 for(const ch of [m.l,m.r]){let mean=0;for(let i=0;i<n;i++){const v=ch[i],a=Math.abs(v);peak=Math.max(peak,a);sum+=v*v;mean+=v;if(i<edge)head=Math.max(head,a);if(i>=n-edge)tail=Math.max(tail,a);}dc=Math.max(dc,Math.abs(mean/n));}
 const mid=new Float64Array(n);for(let i=0;i<n;i++){mid[i]=(m.l[i]+m.r[i])/2;lr+=m.l[i]*m.r[i];ll+=m.l[i]**2;rr+=m.r[i]**2;}
 const {p,bin}=power(mid);let total=0,weighted=0,high=0;for(let i=1;i<p.length;i++){total+=p[i];weighted+=p[i]*i*bin;if(i*bin>8000)high+=p[i];}
  return {duration:+(n/SR).toFixed(3),peakDbfs:r1(db(peak)),rmsDbfs:r1(db(Math.sqrt(sum/(2*n)))),centroidHz:Math.round(weighted/(total||1)),above8kHz:+(high/(total||1)).toFixed(4),momentaryLufs:r1(loudest(m.l,m.r)),smallSpeakerLufs:r1(loudest(small(m.l),small(m.r))),
  headDbfs:r1(db(head)),tailDbfs:r1(db(tail)),dcOffset:+dc.toFixed(5),stereoCorrelation:+(lr/Math.sqrt(ll*rr||1)).toFixed(2)};}
/** Decode any audio file to stereo at this sample rate. `channels` is what the file itself holds. */
function decode(file){const channels=+execFileSync('ffprobe',['-v','error','-select_streams','a:0','-show_entries','stream=channels','-of','csv=p=0',file]).toString().trim().split(/[,\s]/)[0],raw=execFileSync('ffmpeg',['-loglevel','error','-i',file,'-f','f32le','-ac','2','-ar',String(SR),'-'],{maxBuffer:1<<28});
 const pcm=new Float32Array(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.length)),n=pcm.length>>1,m={l:new Float32Array(n),r:new Float32Array(n)};for(let i=0;i<n;i++){m.l[i]=pcm[2*i];m.r[i]=pcm[2*i+1];}return {m,channels};}
/** A file as the game plays it: Howler pans every voice, and a centred mono source reaches each ear 3 dB down. */
function reference(file){const {m,channels}=decode(file),stats=measure(m),law=channels===1?3.01:0;return {channels,...stats,momentaryLufs:+(stats.momentaryLufs-law).toFixed(1),smallSpeakerLufs:+(stats.smallSpeakerLufs-law).toFixed(1)};}

// ---- write ----
function wav(mix){const n=mix.l.length,data=Buffer.alloc(44+n*4);data.write('RIFF',0);data.writeUInt32LE(36+n*4,4);data.write('WAVEfmt ',8);data.writeUInt32LE(16,16);data.writeUInt16LE(1,20);data.writeUInt16LE(2,22);data.writeUInt32LE(SR,24);data.writeUInt32LE(SR*4,28);data.writeUInt16LE(4,32);data.writeUInt16LE(16,34);data.write('data',36);data.writeUInt32LE(n*4,40);
 for(let i=0;i<n;i++){data.writeInt16LE(Math.round(clamp(mix.l[i],-1,1)*32767),44+i*4);data.writeInt16LE(Math.round(clamp(mix.r[i],-1,1)*32767),46+i*4);}return data;}
const quantised=data=>{const n=(data.length-44)>>2,m={l:new Float32Array(n),r:new Float32Array(n)};for(let i=0;i<n;i++){m.l[i]=data.readInt16LE(44+i*4)/32767;m.r[i]=data.readInt16LE(46+i*4)/32767;}return m;};
/** Soft-edged or long cues ship as MP3; anything short and struck stays PCM so the attack is sample-accurate. */
const LONG=new Set(['normal','rare','complete','win','wincollect','stage','suspense','charge','throw','flight','release','tear','packtear','packrustle','cap-merge','cap-throw','cap-enter','cap-presence','cap-absorb','cap-hold','cap-lock','cap-break','cap-flee','cap-card','cap-exit']);
const args=process.argv.slice(2),flag=name=>{const i=args.indexOf(name);return i<0?null:args[i+1]??'';};
if(args[0]==='--measure'){for(const file of args.slice(1)){const {channels,...stats}=reference(resolve(file));console.log(file,JSON.stringify({channels,...stats}));}process.exit(0);}
try{execFileSync('ffmpeg',['-version'],{stdio:'ignore'});execFileSync('ffprobe',['-version'],{stdio:'ignore'});}catch{console.error('ffmpeg and ffprobe are required: long cues are MP3 and every Part A cue is measured against the file it replaces.');process.exit(1);}
const only=flag('--only')?.split(',').filter(Boolean),names=Object.keys(set).filter(name=>!only||only.includes(name)),manifestPath=resolve(OUT,'cues.json'),provenancePath=resolve(OUT,'provenance.json');
const previous=existsSync(provenancePath)?JSON.parse(readFileSync(provenancePath,'utf8')).files:{},olderGain=file=>JSON.parse(readFileSync(resolve(ASSETS,dirname(file),'cues.json'),'utf8'))[file.replace(/^.*\/|\.\w+$/g,'')].gain;
mkdirSync(OUT,{recursive:true});const cues={},failures=[],both=x=>(x.momentaryLufs+x.smallSpeakerLufs)/2,r1=v=>+v.toFixed(1),provenance={generator:'scripts/generate-game-audio-v15.mjs',method:'oscillator, filtered-noise and struck-partial synthesis with short decorrelated reflections and an algorithmic room; no samples or recordings',key:'C major',sampleRate:SR,
 meter:{measured:'the shipped file (MP3s decoded again with ffmpeg); not auditioned',momentaryLufs:'loudest 400 ms, ITU-R BS.1770 K-weighting; shorter files are measured against the full window, so brief cues compare by energy',smallSpeakerLufs:'the same after a 400 Hz second-order high-pass, standing in for a phone speaker',
  playedLufs:'mean of the two loudness figures + 20*log10(gain): where a call at gain 1 lands in the mix',gain:'Part A: set so playedLufs equals that of the file replaced, which puts the full-range and small-speaker differences equally either side of zero. Part B: set to reach the level chosen for the cue',
  replaces:'older files as the game played them: Howler centres a mono source 3.01 dB down in each ear',headDbfs:'peak of the first 5 ms',tailDbfs:'peak of the last 5 ms',above8kHz:'share of spectral energy above 8 kHz',centroidHz:'power-weighted mean frequency of the mid signal',stereoCorrelation:'1 is mono; lower is wider'},limits:LIMITS,files:{}};
for(const name of names){const item=set[name];reseed(name);const mix=item.build(),data=wav(mix),file=resolve(OUT,name+'.wav'),compressed=LONG.has(name),shipped=resolve(OUT,name+(compressed?'.mp3':'.wav'));writeFileSync(file,data);
 if(compressed){execFileSync('ffmpeg',['-loglevel','error','-y','-i',file,'-codec:a','libmp3lame','-q:a','2',shipped]);rmSync(file);}else rmSync(resolve(OUT,name+'.mp3'),{force:true});
 const stats=measure(compressed?decode(shipped).m:quantised(data)),duration=+(mix.l.length/SR).toFixed(3),fail=reason=>failures.push(name+': '+reason),record={format:compressed?'mp3':'wav',pcmSha256:createHash('sha256').update(data).digest('hex'),...stats,duration};
 if(Math.abs(duration-item.seconds)>.002)fail(`duration ${duration} s, wanted ${item.seconds} s`);if(stats.peakDbfs>LIMITS.peakDbfs)fail(`peak ${stats.peakDbfs} dBFS`);if(stats.headDbfs>LIMITS.edgeDbfs)fail(`first 5 ms at ${stats.headDbfs} dBFS`);if(stats.tailDbfs>LIMITS.edgeDbfs)fail(`last 5 ms at ${stats.tailDbfs} dBFS`);
 if(stats.dcOffset>LIMITS.dcOffset)fail(`DC offset ${stats.dcOffset}`);if(stats.above8kHz>LIMITS.above8kHz)fail(`${(stats.above8kHz*100).toFixed(1)}% of energy above 8 kHz`);
 let gain,note='';
 if(item.replaces){const source=resolve(ASSETS,item.replaces),old=existsSync(source)?{file:'/assets/'+item.replaces,gain:olderGain(item.replaces),...reference(source)}:previous[name]?.replaces;if(!old){fail('nothing to match: '+item.replaces+' is missing and no earlier measurement is recorded');continue;}
  old.playedLufs=r1(both(old)+db(old.gain));gain=+clamp(10**((both(old)+db(old.gain)+(item.trim??0)-both(stats))/20),.001,1).toFixed(3);
  record.replaces=old;record.loudnessDeltaDb=r1(stats.momentaryLufs+db(gain)-old.momentaryLufs-db(old.gain));record.smallSpeakerDeltaDb=r1(stats.smallSpeakerLufs+db(gain)-old.smallSpeakerLufs-db(old.gain));record.rmsDeltaDb=r1(stats.rmsDbfs+db(gain)-old.rmsDbfs-db(old.gain)+(old.channels===1?3.01:0));
  for(const [label,delta] of [['full range',record.loudnessDeltaDb],['on a small speaker',record.smallSpeakerDeltaDb]])if(Math.abs(delta-(item.trim??0))>LIMITS.loudnessDeltaDb)fail(`plays ${delta} dB from the file it replaces (${label}), against an intended ${item.trim??0}`);
  note=`was ${old.gain}  full ${record.loudnessDeltaDb>=0?'+':''}${record.loudnessDeltaDb} small ${record.smallSpeakerDeltaDb>=0?'+':''}${record.smallSpeakerDeltaDb} dB (old cent ${old.centroidHz}, ${old.duration}s)`;
 }else gain=+clamp(10**((item.level-both(stats))/20),.001,1).toFixed(2);
 record.gain=gain;record.playedLufs=r1(both(stats)+db(gain));provenance.files[name]=record;
 cues[name]={files:compressed?{mp3:`/assets/${FOLDER}/${name}.mp3`}:{wav:`/assets/${FOLDER}/${name}.wav`},duration,gain,peakDbfs:stats.peakDbfs,...(item.marks?{marks:item.marks}:{})};
 const pad=(v,n=5)=>String(v).padStart(n);console.log(name.padEnd(13),pad(duration)+'s',record.format,'peak',pad(stats.peakDbfs),'rms',pad(stats.rmsDbfs),'M',pad(stats.momentaryLufs),'S',pad(stats.smallSpeakerLufs),'cent',pad(stats.centroidHz,4),'>8k',pad((stats.above8kHz*100).toFixed(2))+'%','corr',pad(stats.stereoCorrelation,4),'edges',pad(stats.headDbfs,4),pad(stats.tailDbfs,6),'gain',String(gain).padEnd(5),'plays',pad(record.playedLufs),note);}
if(failures.length){console.error('\nFAILED\n'+failures.map(line=>' - '+line).join('\n'));process.exit(1);}
if(only){console.log('\n--only: manifest left as it was');process.exit(0);}
writeFileSync(manifestPath,JSON.stringify(cues,null,1)+'\n');writeFileSync(provenancePath,JSON.stringify(provenance,null,1)+'\n');console.log(`\n${names.length} cues written to public/assets/${FOLDER}`);
