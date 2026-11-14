from pathlib import Path
import subprocess,json
r=Path(__file__).resolve().parent;o=r/'videos';takes=r/'recordings/v31'
events=json.loads((takes/'capture-events.json').read_text());entry=next(e['time'] for e in events if e['name'].endswith(' capture'))
subprocess.run(['ffmpeg','-v','error','-y','-i',str(takes/'capture.webm'),'-vf','fps=60','-af','loudnorm=I=-17:LRA=9:TP=-1.8','-c:v','libx264','-threads','3','-preset','medium','-crf','27','-pix_fmt','yuv420p','-c:a','aac','-b:a','160k','-ar','48000','-movflags','+faststart',str(o/'legendary-capture-v31-delivery.mp4')],check=True)
chapters=[{'name':n,'time':t} for n,t in [('Open pack',0),('First bonus card',events[1]['time']-.65),('Second bonus card',events[3]['time']-.65),('Third bonus → sockets',events[5]['time']-.65),('Legendary entrance',entry),('Throw button',entry+5.9),('Lugia energy',entry+9.45),('Final ball click',entry+14.02),('Reward stagger',entry+18.0),('Final win hit',entry+22.7),('Return to pack',entry+26.12)]]
chapters.extend([{'name':'Normal amount · 10×','time':events[2]['time']+.15},{'name':'Normal amount · 50×','time':events[4]['time']+.15}])
chapters.append({'name':'Normal Mega Win','time':next(e['time'] for e in events if e['name']=='Normal pack result')})
(o/'v31-chapters.json').write_text(json.dumps(chapters,indent=2))
subprocess.run(['ffmpeg','-v','error','-y','-ss',str(entry+24.7),'-i',str(o/'legendary-capture-v31-delivery.mp4'),'-frames:v','1','-q:v','2',str(o/'v31-phone-poster.jpg')],check=True)
print(json.dumps({'entry':entry,'bytes':(o/'legendary-capture-v31-delivery.mp4').stat().st_size}))

subprocess.run(['ffmpeg','-v','error','-y','-i',str(takes/'capture.webm'),'-vf','fps=60','-af','loudnorm=I=-17:LRA=9:TP=-1.8','-c:v','libx264','-threads','3','-preset','medium','-crf','29','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k','-ar','48000','-movflags','+faststart',str(o/'legendary-capture-v31-phone.mp4')],check=True)
