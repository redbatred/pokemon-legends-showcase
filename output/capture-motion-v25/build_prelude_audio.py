from pathlib import Path
import importlib.util,subprocess,json
import numpy as np
r=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('sound',r/'build_audio.py');fx=importlib.util.module_from_spec(spec);spec.loader.exec_module(fx)
sr=48000;n=round(21.25*sr)
intro=np.zeros((round(5.7*sr),2));cues=[]
def add(t,x,pan=0,gain=1,name=''):
 y=fx.room(fx.pan(x*gain,pan),wet=.14,tail=.65);a=round(t*sr);b=min(len(intro),a+len(y));intro[a:b]+=y[:b-a];cues.append({'time':t,'name':name})
t=np.arange(len(intro))/sr
bed=sum(np.sin(2*np.pi*f*t) for f in [146.83,220,293.66])*.012*np.sin(np.pi*t/5.7)**2
intro+=fx.pan(bed)
for i in range(3):
 reveal=.7+i*.7;pan=(i-1)*.65
 add(reveal,fx.whoosh(.32),pan,.32,'card-turn')
 add(reveal+.16,fx.chime(.7,587.33*2**(i/12)),pan,.17,'bonus-symbol-reveal')
 add(2.55+i*.4,fx.whoosh(.4),pan,.45,'symbol-flight')
 add(2.95+i*.4,fx.combine(fx.tick(),fx.tone(.25,110+18*i,.06)),pan,.28,'socket-lock')
add(3.86,fx.combine(fx.chime(1.,880),fx.chime(1.,1174.66),fx.sweep(.38,170,72)),0,.22,'all-three-unlock')
add(4.35,fx.whoosh(.4),-.3,.5,'eye-panel-sweep')
add(4.83,fx.combine(fx.tick(),fx.sweep(.23,110,55)),0,.3,'eye-snap-open')
add(5.03,fx.chime(.38,1760),.2,.12,'pupil-glint')
add(5.40,fx.whoosh(.3,False),.3,.48,'cavern-reveal')
intro[-480:]*=np.linspace(1,0,480)[:,None]
for name in ['capture','escape','lugia-capture','lugia-escape']:
 src=r.parent/'capture-motion-v14'/'audio'/(name+'-score.wav')
 raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(src),'-f','f32le','-ac','2','-ar',str(sr),'-']);old=np.frombuffer(raw,dtype='<f4').reshape(-1,2)
 out=np.zeros((n,2));out[:len(intro)]=intro
 tail=old[round(3.05*sr):].copy();tail[:480]*=np.linspace(0,1,480)[:,None];length=min(len(tail),n-len(intro));out[len(intro):len(intro)+length]=tail[:length]
 if np.max(np.abs(out))>.75:out*=.75/np.max(np.abs(out))
 fx.write_wav(r/'audio'/(name+'-score.wav'),out)
(r/'audio'/'prelude-cues.json').write_text(json.dumps({'duration':21.25,'core_offset':2.65,'cues':cues},indent=2))
print('Built four 21.25-second stereo scores.')
