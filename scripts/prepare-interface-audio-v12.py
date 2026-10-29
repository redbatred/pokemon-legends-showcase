#!/usr/bin/env python3
"""Short, tactile game cues from the existing Kenney CC0 sample cache.
Run scripts/polish-audio.py first if that cache is missing. No network required here.
"""
import array, hashlib, json, math, os, shutil, subprocess, tempfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
CACHE=Path(os.environ.get('REVEAL_AUDIO_SOURCE_CACHE',str(Path(tempfile.gettempdir())/'pokemon-reveal-audio-sources')))
OUT=ROOT/'public/assets/audio-v12'
FFMPEG=shutil.which('ffmpeg') or '/opt/homebrew/bin/ffmpeg'
RATE=48000
# (source, trim offset, source length, playback speed, mix gain, delay)
RECIPES={
 'ui':(.12,.25,[('interface/Audio/click_003.ogg',0,.12,.9,1,0)]),
 'flip':(.26,.25,[('casino/Audio/card-slide-6.ogg',.02,.27,1.15,1,0)]),
 'normal':(.32,.26,[('casino/Audio/card-place-4.ogg',.01,.25,1.1,1,0),('interface/Audio/glass_001.ogg',0,.2,1.1,.16,.07)]),
 'rare':(.65,.30,[('interface/Audio/glass_004.ogg',0,.5,1.08,.7,0),('interface/Audio/glass_001.ogg',0,.35,1.4,.3,.10)]),
 'credit':(.10,.13,[('casino/Audio/chip-lay-2.ogg',.025,.09,1.1,1,0)]),
 'land':(.16,.17,[('casino/Audio/card-place-2.ogg',.18,.18,1.06,1,0)]),
 'complete':(.72,.24,[('interface/Audio/glass_004.ogg',0,.55,.94,.75,0),('interface/Audio/glass_001.ogg',0,.32,1.25,.32,.12)]),
 'win':(.82,.32,[('interface/Audio/glass_004.ogg',0,.60,.87,.8,0),('interface/Audio/glass_001.ogg',0,.35,1.35,.42,.12)]),
 'wincollect':(.24,.23,[('casino/Audio/chip-lay-2.ogg',.025,.15,1.0,.9,0),('interface/Audio/glass_001.ogg',0,.2,1.2,.17,.03)])
}
def run(args):return subprocess.check_output(args)
def floats(data):
 a=array.array('f');a.frombytes(data)
 if os.sys.byteorder!='little':a.byteswap()
 return a
OUT.mkdir(exist_ok=True)
manifest={};sources={};reports={}
for name,(duration,gain,layers) in RECIPES.items():
 mix=[0.] * round(duration*RATE)
 for relative,start,length,speed,level,delay in layers:
  path=CACHE/relative
  sources[relative]=hashlib.sha256(path.read_bytes()).hexdigest()
  filt=f'atrim=start={start}:duration={length},asetpts=PTS-STARTPTS,asetrate={int(RATE*speed)},aresample={RATE},highpass=f=160,lowpass=f=7500'
  data=floats(run([FFMPEG,'-v','error','-i',str(path),'-af',filt,'-ac','1','-ar',str(RATE),'-f','f32le','-']))
  peak=max(abs(x) for x in data) or 1
  for i,x in enumerate(data):
   j=i+round(delay*RATE)
   if j>=len(mix):break
   fade=min(1,i/(RATE*.002),max(0,(len(data)-1-i)/(RATE*.035)))
   mix[j]+=x/peak*level*fade
 peak=max(abs(x) for x in mix) or 1
 for i in range(len(mix)):mix[i]*=10**(-8/20)/peak*min(1,i/(RATE*.002),(len(mix)-1-i)/(RATE*.035))
 pcm=array.array('f',mix)
 if os.sys.byteorder!='little':pcm.byteswap()
 with tempfile.NamedTemporaryFile(suffix='.f32') as tmp:
  tmp.write(pcm.tobytes());tmp.flush()
  files={}
  for ext,codec in [('mp3',['-c:a','libmp3lame','-b:a','160k']),('ogg',['-c:a','libopus','-b:a','96k'])]:
   dest=OUT/f'{name}.{ext}'
   run([FFMPEG,'-y','-v','error','-f','f32le','-ar',str(RATE),'-ac','1','-i',tmp.name,'-map_metadata','-1',*codec,str(dest)])
   decoded=floats(run([FFMPEG,'-v','error','-i',str(dest),'-ar',str(RATE),'-ac','1','-f','f32le','-']))
   assert all(math.isfinite(x) for x in decoded) and max(abs(x) for x in decoded)<.55
   files[ext]=f'/assets/audio-v12/{dest.name}'
  manifest[name]={'gain':gain,'files':files};reports[name]={'seconds':duration,'layers':layers,'peakDbfs':-8}
(OUT/'cues.json').write_text(json.dumps(manifest,indent=2)+'\n')
(OUT/'provenance.json').write_text(json.dumps({'date':'2026-10-29','license':'CC0 1.0','creator':'Kenney','sourcePages':['https://kenney.nl/assets/interface-sounds','https://kenney.nl/assets/casino-audio'],'cachedSourceSHA256':sources,'processing':'Trim, high/low pass, short fades, sample mix; -8 dBFS pre-encode peak. Existing source cache from polish-audio.py. No human audition claimed.','cues':reports},indent=2)+'\n')
print('Prepared and decoded',len(manifest),'cues; all finite with codec headroom.')
