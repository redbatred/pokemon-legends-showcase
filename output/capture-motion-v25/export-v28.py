from pathlib import Path
import subprocess,json
r=Path(__file__).resolve().parent;o=r/'videos';takes=r/'recordings/v28'
capEvents=json.loads((takes/'capture-events.json').read_text());escEvents=json.loads((takes/'escape-events.json').read_text());entry=capEvents[-1]['time'];escStart=escEvents[-1]['time']
def duration(path):
 rows=subprocess.check_output(['ffprobe','-v','error','-show_entries','packet=pts_time,duration_time','-of','csv=p=0',str(path)],text=True).strip().splitlines()
 return max(float(p[0])+(float(p[1]) if p[1]!="N/A" else 0) for p in (line.split(',') for line in rows))
cap=duration(takes/'capture.webm')
filters='[0:v]fps=60,setpts=PTS-STARTPTS[v0];[1:v]fps=60,setpts=PTS-STARTPTS[v1];[0:a]loudnorm=I=-17:LRA=9:TP=-1.5,aresample=48000,asetpts=PTS-STARTPTS[a0];[1:a]loudnorm=I=-17:LRA=9:TP=-1.5,aresample=48000,asetpts=PTS-STARTPTS[a1];[v0][a0][v1][a1]concat=n=2:v=1:a=1[v][a]'
subprocess.run(['ffmpeg','-v','error','-y','-i',str(takes/'capture.webm'),'-ss',str(escStart),'-i',str(takes/'escape.webm'),'-filter_complex',filters,'-map','[v]','-map','[a]','-c:v','libx264','-threads','4','-preset','medium','-crf','26','-pix_fmt','yuv420p','-c:a','aac','-b:a','160k','-ar','48000','-movflags','+faststart',str(o/'legendary-capture-v28-delivery.mp4')],check=True)
chapters=[{'name':n,'time':t} for n,t in [('Open pack',0),('First bonus card',capEvents[1]['time']-.65),('Second bonus card',capEvents[3]['time']-.65),('Third bonus → sockets',capEvents[5]['time']-.65),('Counter → large sockets',capEvents[-2]['time']+.65),('Throw button',entry+5.9),('Lugia energy',entry+9.45),('Card reveal & reward',entry+17.8),('Alternate escape',cap),('Legendary entrance',entry),('Final ball check',entry+14.02),('Return to pack',entry+26.12)]]
(o/'v28-chapters.json').write_text(json.dumps(chapters,indent=2))
subprocess.run(['ffmpeg','-v','error','-y','-ss',str(entry+4.9),'-i',str(o/'legendary-capture-v28-delivery.mp4'),'-frames:v','1','-q:v','2',str(o/'v28-phone-poster.jpg')],check=True)
print(json.dumps({'captureDuration':cap,'escapeStart':escStart,'entry':entry,'bytes':(o/'legendary-capture-v28-delivery.mp4').stat().st_size}))
