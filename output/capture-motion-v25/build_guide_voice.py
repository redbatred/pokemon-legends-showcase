import asyncio,edge_tts,subprocess,json,wave,struct,math
from pathlib import Path
# Development-only: pip install edge-tts. Runtime uses the checked-in WAV files.
root=Path(__file__).resolve().parent/'audio/guide'
root.mkdir(parents=True,exist_ok=True)
lines={}
for species,spoken in [('lugia','Lugia'),('mewtwo','Mewtwo')]:
 for cue,text in [('throw',f'{spoken}! Catch it! Reveal its reward card.'),('caught',f'{spoken}, captured!'),('escape','It broke free!')]: lines[f'{species}-{cue}']=text
async def make(key,text):
 temp=Path('/tmp')/(key+'-guide.mp3')
 await edge_tts.Communicate(text,voice='en-US-JennyNeural',rate='+8%',pitch='-4Hz').save(str(temp))
 dest=root/(key+'.wav')
 subprocess.run(['ffmpeg','-v','error','-y','-i',str(temp),'-af','silenceremove=start_periods=1:start_duration=0.015:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_duration=0.015:start_threshold=-45dB,areverse,highpass=f=110,acompressor=threshold=0.1:ratio=2:attack=10:release=90,loudnorm=I=-18:TP=-3:LRA=7','-ar','24000','-ac','1',str(dest)],check=True)
 with wave.open(str(dest)) as f:
  rate=f.getframerate();data=struct.unpack('<'+'h'*f.getnframes(),f.readframes(f.getnframes()))
 envelope=[]
 for i in range(0,len(data),480):
  a=data[i:i+480];rms=math.sqrt(sum((v/32768)**2 for v in a)/len(a));envelope.append(round(min(1,rms*7),3))
 return key,{'text':text,'duration':len(data)/rate,'step':.02,'envelope':envelope}
async def main():
 result=dict(await asyncio.gather(*(make(k,t) for k,t in lines.items())))
 (root/'cues.json').write_text(json.dumps(result))
 print(json.dumps({k:round(v['duration'],2) for k,v in result.items()}))
asyncio.run(main())
