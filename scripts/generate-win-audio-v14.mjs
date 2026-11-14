#!/usr/bin/env node
// Reproducible original sound design for the special win: oscillators, filtered noise, struck-metal
// partials and an algorithmic room. No downloaded samples or recordings. PCM WAV keeps attacks
// sample-accurate. Run from any directory: node scripts/generate-win-audio-v14.mjs
import {mkdirSync,rmSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const SR=44100,TAU=Math.PI*2,OUT=resolve(dirname(fileURLToPath(import.meta.url)),'../public/assets/audio-win-v14');
let seed=20261113;const rand=()=>{seed=(seed+0x6D2B79F5)|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};
const note=m=>440*2**((m-69)/12),len=s=>Math.round(s*SR),clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const mono=s=>new Float32Array(len(s)),stereo=s=>({l:mono(s),r:mono(s)});

// ---- sources ----
/** Sine with a frequency function of time; `drive` adds warm harmonics. */
function tone(seconds,freq,amp,drive=0){const out=mono(seconds);let phase=0;for(let i=0;i<out.length;i++){const t=i/SR;phase+=TAU*freq(t)/SR;const v=Math.sin(phase);out[i]=(drive?Math.tanh(v*(1+drive))/Math.tanh(1+drive):v)*amp(t);}return out;}
/** Band-limited bright tone: harmonics fall off and the upper ones die first, like a struck or blown voice closing. */
function voice(seconds,f,{harmonics=10,tilt=1.1,decay=.5,attack=.006,close=.35,detune=0}={}){const out=mono(seconds),top=Math.min(harmonics,Math.floor(SR*.45/f));for(let h=1;h<=top;h++){const w=TAU*f*h*(1+detune)/SR,a=1/h**tilt,tau=decay/(1+close*(h-1));for(let i=0;i<out.length;i++){const t=i/SR;out[i]+=Math.sin(w*i)*a*Math.exp(-t/tau)*Math.min(1,t/attack);}}return out;}
/** Struck metal: inharmonic partials with their own decays. */
function metal(seconds,f,partials,ring){const out=mono(seconds);for(const [ratio,level,scale] of partials){const w=TAU*f*ratio/SR,tau=ring*scale,phase=rand()*TAU;if(f*ratio>SR*.46)continue;for(let i=0;i<out.length;i++)out[i]+=Math.sin(w*i+phase)*level*Math.exp(-(i/SR)/tau);}return out;}
function noise(seconds,amp){const out=mono(seconds);for(let i=0;i<out.length;i++)out[i]=(rand()*2-1)*amp(i/SR);return out;}

// ---- filters ----
/** RBJ biquad whose cutoff may move; coefficients refresh every 32 samples. */
function filter(input,type,freq,q=.707){const out=new Float32Array(input.length),f=typeof freq==='function'?freq:()=>freq;let b0=1,b1=0,b2=0,a1=0,a2=0,x1=0,x2=0,y1=0,y2=0;
 for(let i=0;i<input.length;i++){if(i%32===0){const w=TAU*clamp(f(i/SR),20,SR*.45)/SR,c=Math.cos(w),alpha=Math.sin(w)/(2*q);let n0,n1,n2;if(type==='low'){n0=(1-c)/2;n1=1-c;n2=n0;}else if(type==='high'){n0=(1+c)/2;n1=-(1+c);n2=n0;}else{n0=alpha;n1=0;n2=-alpha;}const a0=1+alpha;b0=n0/a0;b1=n1/a0;b2=n2/a0;a1=-2*c/a0;a2=(1-alpha)/a0;}
  const x=input[i],y=b0*x+b1*x1+b2*x2-a1*y1-a2*y2;x2=x1;x1=x;y2=y1;y1=y;out[i]=y;}return out;}

// ---- mixing ----
function add(mix,src,at=0,gain=1,pan=0){const start=len(at),gl=Math.cos((pan+1)*Math.PI/4)*gain,gr=Math.sin((pan+1)*Math.PI/4)*gain;for(let i=0;i<src.length&&start+i<mix.l.length;i++){if(start+i<0)continue;mix.l[start+i]+=src[i]*gl;mix.r[start+i]+=src[i]*gr;}}
/** Eight damped combs and four allpasses per side, spread between the ears: a small bright hall. */
function room(mix,{size=.8,damp=.35,wet=.2,pre=.012}={}){const combs=[1116,1188,1277,1356,1422,1491,1557,1617],passes=[556,441,341,225],scale=SR/44100,delay=len(pre);
 for(const [channel,spread] of [[mix.l,0],[mix.r,23]]){const dry=channel.slice(),sum=new Float32Array(channel.length);
  for(const c of combs){const n=Math.round((c+spread)*scale),line=new Float32Array(n);let p=0,store=0;for(let i=0;i<dry.length;i++){const input=i>=delay?dry[i-delay]:0,y=line[p];store=y*(1-damp)+store*damp;line[p]=input*.5+store*size;sum[i]+=y;if(++p===n)p=0;}}
  let stage=sum;for(const a of passes){const n=Math.round((a+spread)*scale),line=new Float32Array(n),next=new Float32Array(stage.length);let p=0;for(let i=0;i<stage.length;i++){const held=line[p],y=-stage[i]+held;line[p]=stage[i]+held*.5;next[i]=y;if(++p===n)p=0;}stage=next;}
  for(let i=0;i<channel.length;i++)channel[i]=dry[i]*(1-wet*.35)+stage[i]*wet*.125;}return mix;}
/** `drive` is the peak the mix is scaled to before soft clipping: 1 is clean, 1.6 rounds only the loudest instants. */
function finish(mix,{peakDb=-3.5,fadeIn=.0015,fadeOut=.03,drive=0}={}){const n=mix.l.length,a=len(fadeIn),b=len(fadeOut);let raw=0;for(const ch of [mix.l,mix.r])for(let i=0;i<n;i++)raw=Math.max(raw,Math.abs(ch[i]));
 const pre=drive&&raw?drive/raw:1;let peak=0;
 for(const ch of [mix.l,mix.r])for(let i=0;i<n;i++){let v=ch[i]*pre;if(drive)v=Math.tanh(v);if(i<a)v*=i/a;if(i>n-b)v*=(n-i)/b;ch[i]=v;peak=Math.max(peak,Math.abs(v));}
 const gain=peak?10**(peakDb/20)/peak:1;for(const ch of [mix.l,mix.r])for(let i=0;i<n;i++)ch[i]*=gain;return mix;}

// ---- shared voices ----
const expo=tau=>t=>Math.exp(-t/tau),hit=(a,tau)=>t=>Math.min(1,t/a)*Math.exp(-t/tau);
/** A weighty body: pitch falls fast, level slower. */
const thump=(seconds,from,to,fall,ring,drive=.6)=>tone(seconds,t=>to+(from-to)*Math.exp(-t/fall),hit(.002,ring),drive);
const COIN=[[1,1,1],[1.52,.5,.8],[2.26,.34,.55],[2.94,.2,.4],[4.1,.1,.3]];
/** One coin: a bright ring in the air, a duller tick with a short ring on the floor. */
function coin(landing){const f=landing?2600+rand()*1500:3300+rand()*2300,ring=landing?.03+rand()*.04:.07+rand()*.1,out=metal(ring*5+.02,f,COIN,ring);const click=filter(noise(.006,expo(.0018)),landing?'low':'high',landing?1900:3800);for(let i=0;i<click.length;i++)out[i]+=click[i]*(landing?.9:.45);return out;}
/** A spray leaves contact together, then lands across the floor a beat later. */
function coins(mix,count,at,{launch=.18,flight=[.55,1.05],land=.55,level=1}={}){for(let i=0;i<count;i++){const start=at+rand()**1.6*launch,pan=rand()*1.7-.85;add(mix,coin(false),start,(.35+rand()*.5)*level,pan);add(mix,coin(true),start+flight[0]+rand()*(flight[1]-flight[0]),(.25+rand()*.4)*land*level,pan*.8);if(rand()<.45)add(mix,coin(true),start+flight[1]+.08+rand()*.3,(.12+rand()*.2)*land*level,pan*.7);}}
/** A chord struck as one gesture: each note is two slightly detuned voices set wide, with a bell on top. */
function chord(mix,root,steps,at,{strum=.016,decay=.7,level=1,bell=.25,seconds=1.6}={}){steps.forEach((step,i)=>{const f=note(root+step),start=at+i*strum,gain=level/(1+i*.12);for(const [detune,pan] of [[-.0022,-.55],[.0022,.55]])add(mix,voice(seconds,f,{decay,detune,close:.4}),start,gain*.5,pan);if(bell)add(mix,metal(seconds*.7,f*2,[[1,1,1],[2.01,.4,.6],[3.02,.18,.4]],decay*.55),start,gain*bell,(i%2?.4:-.4));});}
const sweep=(seconds,from,to,amp,q=1.4)=>filter(noise(seconds,amp),'band',t=>from*(to/from)**(t/seconds),q);
const MAJOR=[0,7,12,16,19,24],ADD9=[0,7,12,14,16,19,24,28];

// ---- the set ----
const set={};
// Poké Ball beats
set['win-puncture']={gain:.5,build(){const m=stereo(.6);add(m,thump(.4,150,44,.035,.16),0,1);add(m,filter(noise(.05,expo(.011)),'band',3400,.9),0,.9);add(m,filter(noise(.16,expo(.045)),'high',5200),.004,.3,.2);add(m,metal(.45,1480,[[1,1,1],[2.4,.5,.6],[3.9,.25,.4]],.12),.006,.22,-.15);return finish(room(m,{wet:.16,size:.7}));}};
set['win-gather']={gain:.42,build(){const s=.62,m=stereo(s);add(m,tone(s,t=>260*(1150/260)**((t/s)**1.5)*(1+.012*Math.sin(TAU*t*(6+t/s*22))),t=>(t/s)**1.8*.8,.3),0,.8);add(m,sweep(s,500,6500,t=>(t/s)**2.2),0,.7);for(let i=0;i<9;i++){const at=s*(i/9)**.7;add(m,metal(.2,2400+i*420,[[1,1,1],[2.7,.3,.5]],.035),at,.12+i*.03,i%2?.6:-.6);}return finish(m,{fadeOut:.012});}};
set['win-bloom']={gain:.5,build(){const m=stereo(1.5);add(m,thump(.5,110,46,.05,.2),0,.8);add(m,sweep(.5,900,7000,hit(.02,.16)),0,.55);chord(m,72,[0,4,7,12],0,{strum:.03,decay:.55,level:.8,bell:.5,seconds:1.2});for(let i=0;i<10;i++)add(m,metal(.3,3000+rand()*4200,[[1,1,1],[2.3,.3,.5]],.07),.06+rand()*.4,.1+rand()*.1,rand()*1.6-.8);return finish(room(m,{wet:.3,size:.84}));}};
set['win-land']={gain:.52,build(){const m=stereo(.6);add(m,thump(.5,92,34,.05,.2,1),0,1);add(m,filter(noise(.3,expo(.07)),'low',t=>420*Math.exp(-t/.09)+90),0,.9);add(m,filter(noise(.05,expo(.012)),'band',1700,1.2),.003,.3);return finish(room(m,{wet:.12,size:.6}));}};
// Charge, the flood into the arena and the way back
set['win-charge']={gain:.44,build(){const s=1.08,m=stereo(s),rate=t=>6+22*(t/s)**1.6,body=mono(s);for(const d of [-.006,0,.007]){const v=tone(s,t=>170*(1+d)*2**(2*(t/s)**1.4),()=>1,1.4);for(let i=0;i<body.length;i++)body[i]+=v[i]/3;}const shaped=filter(body,'low',t=>500*(11)**(t/s),.9);for(let i=0;i<shaped.length;i++){const t=i/SR;shaped[i]*=(t/s)**1.7*(.62+.38*Math.sin(TAU*t*rate(t)));}add(m,shaped,0,.9);add(m,sweep(s,350,7500,t=>(t/s)**2.4),0,.6);add(m,tone(s,t=>52+30*(t/s),t=>(t/s)**2*.8,.5),0,.5);return finish(m,{fadeOut:.01});}};
set['win-launch']={gain:.36,build(){const m=stereo(.45);add(m,sweep(.4,700,5200,hit(.03,.11)),0,1,-.2);add(m,tone(.3,t=>240+900*t/.3,hit(.01,.09),.3),0,.35,.2);return finish(room(m,{wet:.14,size:.6}));}};
set['win-flood']={gain:.56,build(){const at=.64,m=stereo(2.3);add(m,sweep(at,280,6800,t=>(t/at)**2.6),0,.85);add(m,tone(at,t=>120*4**((t/at)**1.3),t=>(t/at)**2.2*.6,.8),0,.5);
 add(m,thump(1.4,74,27,.11,.62,1.2),at,1.1);add(m,filter(noise(.9,expo(.24)),'low',t=>1500*Math.exp(-t/.16)+110),at,.9);add(m,filter(noise(1.3,hit(.004,.42)),'high',4200),at,.2);
 chord(m,48,[0,7,12,19],at,{strum:0,decay:1.1,level:.5,bell:.15,seconds:1.6});for(let i=0;i<16;i++)add(m,metal(.5,2600+rand()*5200,[[1,1,1],[2.4,.3,.5]],.12),at+.03+rand()**1.4*.8,.08+rand()*.1,rand()*1.8-.9);return finish(room(m,{wet:.3,size:.88,damp:.3}),{drive:1.5});}};
set['win-return']={gain:.4,build(){const m=stereo(1.0);add(m,sweep(.9,6200,320,t=>Math.sin(Math.PI*clamp(t/.9))**1.3),0,1);add(m,tone(.7,t=>300*.35**(t/.7),t=>Math.sin(Math.PI*clamp(t/.7))*.5,.3),.05,.4);return finish(room(m,{wet:.18,size:.7}));}};
// Count and contact on the amount
set['win-tick']={gain:.26,build(){const m=stereo(.11);add(m,tone(.1,()=>740,hit(.0012,.022)),0,1);add(m,tone(.08,()=>1480,hit(.001,.012)),0,.4);add(m,tone(.06,()=>2220,hit(.001,.008)),0,.16);add(m,filter(noise(.004,expo(.0012)),'high',5000),0,.2);return finish(m,{fadeOut:.01,peakDb:-5});}};
for(const [index,weight] of [[1,.7],[2,1],[3,1.35]])set['win-strike-'+index]={gain:.46+index*.04,build(){const m=stereo(.55+weight*.35);add(m,thump(.5+weight*.2,150-weight*8,50-weight*8,.04,.13+weight*.09,.8),0,1);add(m,tone(.2,()=>208,hit(.002,.05),.6),0,.4);add(m,filter(noise(.03,expo(.006)),'high',2600),0,.5);
 add(m,metal(.7,1980,[[1,1,1],[1.5,.6,.8],[2.5,.4,.6],[3.76,.2,.4]],.16+weight*.08),.004,.2+weight*.05,-.25);add(m,metal(.7,2970,[[1,1,1],[1.5,.5,.7],[2.3,.3,.5]],.13+weight*.06),.012,.14,.3);coins(m,Math.round(5+weight*5),.02,{level:.5,land:.4});return finish(room(m,{wet:.14+weight*.03,size:.72}));}};
for(const [index,count] of [[1,14],[2,28],[3,48]])set['win-coins-'+index]={gain:.36+index*.03,build(){const m=stereo(1.9);coins(m,count,0,{launch:.22+index*.04,level:1/Math.sqrt(count/14)});return finish(room(m,{wet:.2,size:.74}));}};
// Tiers: each lands a step higher; the awarded tier gets the full hit
const ROOTS=[60,62,64,67];
for(let tier=1;tier<=3;tier++)set['win-rung-'+tier]={gain:.5,build(){const m=stereo(1.3);add(m,thump(.4,140,52,.035,.15),0,.9);add(m,filter(noise(.03,expo(.007)),'high',3000),0,.4);chord(m,ROOTS[tier-1],MAJOR.slice(0,5),.004,{strum:.014,decay:.42,level:.8,bell:.35,seconds:1.1});return finish(room(m,{wet:.22,size:.78}));}};
for(let tier=1;tier<=4;tier++)set['win-final-'+tier]={gain:.58,build(){const seconds=2.3+tier*.25,m=stereo(seconds),root=ROOTS[tier-1],big=tier>=3;
 add(m,thump(1.3,82,26,.1,.5+tier*.06,1.3),0,1.15);add(m,filter(noise(.7,expo(.2)),'low',t=>1700*Math.exp(-t/.14)+120),0,.85);add(m,filter(noise(1.6+tier*.2,hit(.003,.45+tier*.08)),'high',3800),0,.22);
 // A pickup run into the held chord, wider and longer for higher tiers.
 const run=big?[0,4,7,12]:[0,7,12];run.forEach((step,i)=>chord(m,root+12,[step],.05+i*.055,{strum:0,decay:.22,level:.5,bell:.5,seconds:.6}));
 const landing=.05+run.length*.055+.03;chord(m,root,big?ADD9:MAJOR,landing,{strum:.02,decay:.95+tier*.14,level:1,bell:.35,seconds:seconds-landing-.1});chord(m,root-12,[0,7],landing,{strum:0,decay:1.1,level:.5,bell:0,seconds:seconds-landing-.1});
 for(let i=0;i<10+tier*6;i++)add(m,metal(.5,note(root+24+[0,4,7,12,16,19][Math.floor(rand()*6)]),[[1,1,1],[2.01,.35,.6],[3.01,.15,.4]],.16),landing+.08+rand()**1.2*(1+tier*.2),.07+rand()*.08,rand()*1.8-.9);
 coins(m,10+tier*8,.03,{launch:.3,level:.45,land:.5});return finish(room(m,{wet:.3,size:.86+tier*.01,damp:.28}),{drive:1.5});}};
set['win-stamp']={gain:.46,build(){const m=stereo(1.0);add(m,thump(.35,130,56,.03,.12),0,.9);add(m,filter(noise(.025,expo(.006)),'high',3200),0,.4);chord(m,67,[0,7,12],.004,{strum:.012,decay:.36,level:.7,bell:.4,seconds:.8});return finish(room(m,{wet:.2,size:.74}));}};

// The eye glint before the finisher: a bright struck shimmer that rises and rings into the room.
set['win-glint']={gain:.44,build(){const m=stereo(1.2);add(m,tone(.5,t=>2400*(1+.6*Math.min(1,t/.06)),hit(.002,.16)),0,.45);add(m,metal(1,3300,[[1,1,1],[1.41,.6,.8],[2.12,.4,.6],[2.83,.25,.4]],.26),0,.6,-.3);add(m,metal(1,4950,[[1,1,1],[1.5,.4,.6]],.2),.012,.42,.3);add(m,sweep(.28,1800,12500,hit(.002,.07)),0,.55);add(m,thump(.3,96,52,.03,.1,.3),0,.22);return finish(room(m,{wet:.32,size:.82}));}};
// ---- write ----
function wav(mix){const n=mix.l.length,data=Buffer.alloc(44+n*4);data.write('RIFF',0);data.writeUInt32LE(36+n*4,4);data.write('WAVEfmt ',8);data.writeUInt32LE(16,16);data.writeUInt16LE(1,20);data.writeUInt16LE(2,22);data.writeUInt32LE(SR,24);data.writeUInt32LE(SR*4,28);data.writeUInt16LE(4,32);data.writeUInt16LE(16,34);data.write('data',36);data.writeUInt32LE(n*4,40);
 for(let i=0;i<n;i++){data.writeInt16LE(Math.round(clamp(mix.l[i],-1,1)*32767),44+i*4);data.writeInt16LE(Math.round(clamp(mix.r[i],-1,1)*32767),46+i*4);}return data;}
const LONG=new Set(['win-bloom','win-charge','win-flood','win-return','win-coins-1','win-coins-2','win-coins-3','win-rung-1','win-rung-2','win-rung-3','win-final-1','win-final-2','win-final-3','win-final-4']);
let encoder=true;try{execFileSync('ffmpeg',['-version'],{stdio:'ignore'});}catch{encoder=false;console.warn('ffmpeg not found: long cues stay WAV');}
mkdirSync(OUT,{recursive:true});const cues={},provenance={generator:'scripts/generate-win-audio-v14.mjs',method:'oscillator, filtered-noise and struck-partial synthesis with an algorithmic room; no samples or recordings',sampleRate:SR,files:{}};
for(const [name,cue] of Object.entries(set)){const mix=cue.build(),data=wav(mix);let peak=0,sum=0;for(const ch of [mix.l,mix.r])for(const v of ch){peak=Math.max(peak,Math.abs(v));sum+=v*v;}
 const file=resolve(OUT,name+'.wav'),compressed=encoder&&LONG.has(name);writeFileSync(file,data);const duration=+(mix.l.length/SR).toFixed(3);
 if(compressed){execFileSync('ffmpeg',['-loglevel','error','-y','-i',file,'-codec:a','libmp3lame','-q:a','2',resolve(OUT,name+'.mp3')]);rmSync(file);}else rmSync(resolve(OUT,name+'.mp3'),{force:true});
 cues[name]={files:compressed?{mp3:'/assets/audio-win-v14/'+name+'.mp3'}:{wav:'/assets/audio-win-v14/'+name+'.wav'},duration,gain:+cue.gain.toFixed(2),peakDbfs:+(20*Math.log10(peak)).toFixed(1)};
 provenance.files[name]={pcmSha256:createHash('sha256').update(data).digest('hex'),format:compressed?'mp3':'wav',rmsDbfs:+(10*Math.log10(sum/(mix.l.length*2))).toFixed(1)};console.log(name.padEnd(16),String(duration).padStart(6)+'s','peak',cues[name].peakDbfs,'rms',provenance.files[name].rmsDbfs,compressed?'mp3':'wav');}
writeFileSync(resolve(OUT,'cues.json'),JSON.stringify(cues,null,1)+'\n');writeFileSync(resolve(OUT,'provenance.json'),JSON.stringify(provenance,null,1)+'\n');
