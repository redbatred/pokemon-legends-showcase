from pathlib import Path
import numpy as np, subprocess,json,re
r=Path(__file__).resolve().parent;sr=48000
source=r.parent/'capture-motion-v23/audio'
def read(p):return np.frombuffer(subprocess.check_output(['ffmpeg','-v','error','-i',str(p),'-f','f32le','-ar',str(sr),'-ac','2','-']),np.float32).reshape(-1,2).astype(np.float64)
def write(p,x):subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar',str(sr),'-ac','2','-i','-','-c:a','pcm_s16le',str(p)],input=x.astype(np.float32).tobytes(),check=True)
music=read(r/'audio/adventure-score.wav');write(r/'audio/music-loop.wav',music[round(6.15*sr):round(30.15*sr)]);rng=np.random.default_rng(25)
stages=[tuple(map(float,m)) for m in re.findall(r'\{start:([\d.]+),end:([\d.]+),value:([\d.]+)\}',(r/'winTimeline.ts').read_text())]
manifest=[]
for outcome in ['capture','escape']:
 beats=[(6.4,7.5,1.1),(7.5,9.1,.6),(11.3,12.55,.65),(16.1,16.65,.45),(16.65,17.9,.55)]+([(18.5,21.45,5.1)] if outcome=='capture' else [])
 segments=[];previous=0
 for a,b,add in beats:segments.extend([(previous,a,1),(a,b,(b-a)/(b-a+add))]);previous=b
 segments.append((previous,None,1))
 duration=23.05+sum(x[2] for x in beats)
 for prefix in ['','lugia-']:
  filters=[]
  for i,(a,b,speed) in enumerate(segments):
   tempo=f'atempo={speed}' if speed>=.5 else f'atempo=0.7,atempo={speed/.7}'
   filters.append(f'[0:a]atrim=start={a}'+(f':end={b}'if b else '')+f',asetpts=PTS-STARTPTS,{tempo}[a{i}]')
  filters.append(''.join(f'[a{i}]'for i in range(len(segments)))+f'concat=n={len(segments)}:v=0:a=1[out]')
  raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(source/f'{prefix}{outcome}-score.wav'),'-filter_complex',';'.join(filters),'-map','[out]','-f','f32le','-ar',str(sr),'-ac','2','-'])
  old=np.frombuffer(raw,np.float32).reshape(-1,2);n=round(duration*sr);mix=np.zeros((n,2));mix[:min(n,len(old))]+=old[:n]*.78
  t=np.arange(n)/sr
  if outcome=='capture':mix*= (1-np.clip((t-20.45)/.25,0,1))[:,None]
  # Music is a separate persistent loop; timed Foley may pause at the throw gate.
  def add(at,x,amp):
   off=round((at+1.55+(.6 if at+1.55>=8.6 else 0))*sr);end=min(n,off+len(x));v=x[:end-off]*amp;mix[off:end,0]+=v*.72;mix[off:end,1]+=v*.72
  # Ink wipe: brief rising rush, hard punctuation, then space for the eye shot.
  for cue,duration_fx,amp in [(5.18,.7,.10),(7.48,.32,.08),(29.32 if outcome=='capture' else 24.22,.6,.09)]:
   a=np.arange(round(duration_fx*sr))/sr;noise=rng.normal(0,1,len(a));noise=np.convolve(noise,np.ones(7)/7,mode='same');env=np.sin(np.pi*a/duration_fx)**1.2;add(cue-1.55,noise*env,amp)
  # Two wing-pressure cues and a traveling eye accent follow the new entrance.
  for cue,amp in [(7.38,.08),(8.78,.18),(9.60,.14)]:
   a=np.arange(round(.36*sr))/sr;wind=np.convolve(rng.normal(0,1,len(a)),np.ones(19)/19,mode='same');env=np.sin(np.pi*a/.36)**2
   add(cue-1.55,wind*env+np.sin(2*np.pi*76*a)*np.exp(-a*15)*.18,amp)
  # The physical lock/break precedes its verdict. Replace, rather than stack, its old hit.
  hit_at=18.85;dip=np.clip((t-(hit_at+.6-.09))/.09,0,1)*(1-np.clip((t-(hit_at+.6+.45))/.18,0,1));mix*= (1-.85*dip)[:,None]
  a=np.arange(round(.72*sr))/sr;noise=rng.normal(0,1,len(a));air=np.convolve(noise,np.ones(11)/11,mode='same')
  bass=np.sin(2*np.pi*(57*a+75*(1-np.exp(-a*25))/25))*np.exp(-a*8)
  if outcome=='capture':
   snap=noise*np.exp(-a*120)*.55+np.sin(2*np.pi*1450*a)*np.exp(-a*75)*.15
   add(hit_at-1.55,(bass*1.05+snap*.75+np.sin(2*np.pi*116*a)*np.exp(-a*19)*.28)*np.minimum(1,a/.001),.73)
   add(hit_at+.13-1.55,np.sin(2*np.pi*659.25*a)*np.exp(-a*8)*np.minimum(1,a/.006),.085)
  else:
   crack=noise*np.exp(-a*65)*.45;surge=air*np.exp(-a*4)*np.minimum(1,a/.008)
   add(hit_at-1.55,bass*.65+crack+surge*.7,.63)
  if outcome=='capture':
   # One card-owned reveal, separated from the later reward tally.
   for at in [18.55,18.85,19.10,19.3,19.45]:
    a=np.arange(round(.08*sr))/sr;paper=rng.normal(0,1,len(a))*np.exp(-a*60);add(at,paper,.04)
   a=np.arange(round(.65*sr))/sr
   flip=(np.sin(2*np.pi*(64*a+42*(1-np.exp(-a*16))/16))*np.exp(-a*8)*.65+rng.normal(0,1,len(a))*np.exp(-a*48)*.19)
   add(19.88,flip,.48)
   for k,f in enumerate([587.33,698.46,880]):
    a=np.arange(round(1.2*sr))/sr;add(19.92+k*.035,np.sin(2*np.pi*f*a)*np.exp(-a*3.2)*np.minimum(1,a/.004),.055)
   for tier,(start,end,value) in enumerate(stages):
    at=19.7+end
    # Rising mechanical count ticks stop before each double hit.
    for tick in np.arange(start+.06,end-.025,.038):
     a=np.arange(round(.045*sr))/sr;f=460+tier*180+(tick-start)*1150
     add(19.7+tick,np.sin(2*np.pi*f*a)*np.exp(-a*95),.045+tier*.009)
    for k in range(2):
     a=np.arange(round((.62+tier*.06)*sr))/sr
     bass=np.sin(2*np.pi*(51*a+32*(1-np.exp(-a*19))/19))*np.exp(-a*(9-tier*.6))
     crack=rng.normal(0,1,len(a))*np.exp(-a*55)
     chord=sum(np.sin(2*np.pi*f*a)*np.exp(-a*4.5) for f in [293.665,440,587.33,880])*.11
     x=(bass*(.78 if tier==4 else .24+tier*.08)+crack*(.14 if tier==4 else .10)+chord*.9)*np.minimum(1,a/.002)
     add(at+k*.16,x,(.32+.045*tier)*(1 if k==0 else .62))
    manifest.append({'species':prefix or'mewtwo-','multiplier':value,'time':at+1.55,'secondImpact':at+1.71})
   # Final anticipation: mechanical lift, a short breath, then a deep stamped hit.
   a=np.arange(round(.65*sr))/sr
   tension=np.sin(2*np.pi*(190*a+310*a*a))*np.sin(np.pi*a/.65)**2
   add(19.7+4.48,tension,.10)
   final_at=19.7+stages[-1][1]+2.15
   duck=np.clip((t-(final_at-.10))/.025,0,1)*(1-np.clip((t-(final_at-.012))/.012,0,1))
   mix*= (1-.88*duck)[:,None]
   a=np.arange(round(1.05*sr))/sr
   body=(np.sin(2*np.pi*(43*a+48*(1-np.exp(-a*26))/26))+np.sin(2*np.pi*86*a)*.36)*np.exp(-a*6)
   paper=rng.normal(0,1,len(a))*np.exp(-a*64)*.30
   add(19.7+stages[-1][1],(body+paper)*np.minimum(1,a/.002),.40)
   # Delayed physical multiplier stamp, after the amount has finished.
   a=np.arange(round(.32*sr))/sr
   stamp=(rng.normal(0,1,len(a))*np.exp(-a*65)*.35+np.sin(2*np.pi*180*a)*np.exp(-a*22))
   add(19.7+5.65,stamp,.16)
   # Final major lift and descending stereo sparkle made from pitched bell partials.
   for j,f in enumerate([587.33,698.46,880,1174.66]):
    a=np.arange(round(1.45*sr))/sr;x=(np.sin(2*np.pi*f*a)+.22*np.sin(2*np.pi*f*2.76*a))*np.exp(-a*3)*np.minimum(1,a/.006);add(19.7+stages[-1][1]+j*.065,x,.075)
  mix*=np.minimum(1,t/.025)[:,None]*np.minimum(1,(duration-t)/.06)[:,None]
  peak=np.max(np.abs(mix));mix*=min(1,.66/peak);write(r/f'audio/{prefix}{outcome}-score.wav',mix)
  print(prefix+outcome,'duration',duration,'peak',float(np.max(np.abs(mix))))
(r/'audio/cue-manifest-v25.json').write_text(json.dumps(manifest,indent=2))
