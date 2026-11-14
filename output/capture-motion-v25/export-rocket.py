from pathlib import Path
import subprocess,json
r=Path(__file__).resolve().parent;o=r/'videos';downloads=Path.home()/'Downloads'
source=downloads/'sequential-v31-lugia-capture.webm';escape=downloads/'legendary-capture-v25-lugia-escape-phone.webm'
events=json.loads((downloads/'v31-capture-events.json').read_text());entry=next(e['time'] for e in events if e['name'].endswith(' capture'))
# Both takes are captured from the same live frontend and audio bus.
video=o/'legendary-capture-v32-phone.mp4'
subprocess.run(['ffmpeg','-v','error','-y','-i',str(source),'-ss','14.8','-i',str(escape),'-filter_complex','[0:v]fps=60,setpts=PTS-STARTPTS[v0];[0:a]asetpts=PTS-STARTPTS[a0];[1:v]scale=720:960,fps=60,setpts=PTS-STARTPTS[v1];[1:a]asetpts=PTS-STARTPTS[a1];[v0][a0][v1][a1]concat=n=2:v=1:a=1[v][mix];[mix]loudnorm=I=-17:LRA=9:TP=-1.8[a]','-map','[v]','-map','[a]','-c:v','libx264','-threads','3','-preset','medium','-crf','31','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k','-ar','48000','-movflags','+faststart',str(video)],check=True)
beats=[(6.4,7.5,1.1),(7.5,9.1,.6),(11.3,12.55,.65),(16.1,16.65,.45),(16.65,17.9,.55),(18.5,21.45,5.1)]
def clock(s):return s+sum(add*max(0,min(1,(s-a)/(b-a))) for a,b,add in beats)
hold=1.8190416666666667+.75
at=lambda t:entry+.12+clock(t+4.45)-5.15+(hold if t>=5 else 0)
capduration=events[-1]['time']+3.4
chapters=[{'name':n,'time':round(t,3)} for n,t in [('Open pack',0),('First bonus card',events[1]['time']-.65),('Second bonus card',events[3]['time']-.65),('Third bonus → sockets',events[5]['time']-.65),('Legendary entrance',entry),('Jessie’s original voice',at(5)-hold+.38),('Lugia energy',at(7.2)),('Final ball click',at(12.2)),('Reward stagger',at(14.1)),('Final win hit',entry+.12+clock(18.5)+5.3-5.15+hold),('Return to pack',at(17.5)),('Normal amount · 10×',events[2]['time']+.15),('Normal amount · 50×',events[4]['time']+.15),('Normal Mega Win',events[-1]['time']),('Alternate escape · James',capduration+.15)]]
(o/'v32-chapters.json').write_text(json.dumps(chapters,indent=2));(o/'v32-capture-events.json').write_text(json.dumps(events,indent=2))
subprocess.run(['ffmpeg','-v','error','-y','-ss',str(at(5)-hold+.95),'-i',str(video),'-frames:v','1','-q:v','2',str(o/'v32-phone-poster.jpg')],check=True)
print(json.dumps({'video':str(video),'bytes':video.stat().st_size,'entry':entry,'chapterCount':len(chapters)}))
