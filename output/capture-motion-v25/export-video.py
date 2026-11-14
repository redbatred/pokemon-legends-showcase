"""Two live browser takes: actual normal pack, capture, then alternate escape."""
import subprocess,json,pathlib
r=pathlib.Path(__file__).resolve().parent;o=r/'videos';o.mkdir(exist_ok=True)
def run(args):subprocess.run(args,check=True)
events=json.loads((r/'recordings/events.json').read_text())
escape_start=events['escape'][-1]['time']
for name,start in [('capture',0),('escape',escape_start)]:
 target=o/f'lugia-{name}.mp4'
 run(['ffmpeg','-v','error','-y','-ss',str(start),'-i',str(r/f'recordings/sequential-lugia-{name}.webm'),'-vf','fps=60','-af','loudnorm=I=-17:LRA=9:TP=-1.5,aresample=48000','-c:v','libx264','-preset','medium','-crf','19','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-ar','48000','-movflags','+faststart',str(target)])
duration=lambda p:float(json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-of','json',str(p)]))['format']['duration'])
cap=duration(o/'lugia-capture.mp4');esc=duration(o/'lugia-escape.mp4')
(o/'phone-concat.txt').write_text("file 'lugia-capture.mp4'\nfile 'lugia-escape.mp4'\n")
master=o/'legendary-capture-v26-phone.mp4';delivery=o/'legendary-capture-v26-delivery.mp4'
run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i',str(o/'phone-concat.txt'),'-c','copy','-movflags','+faststart',str(master)])
run(['ffmpeg','-v','error','-y','-i',str(master),'-c:v','libx264','-preset','medium','-crf','27','-c:a','aac','-b:a','160k','-movflags','+faststart',str(delivery)])
run(['ffmpeg','-v','error','-y','-ss','7.15','-i',str(master),'-frames:v','1','-q:v','2',str(o/'phone-poster.jpg')])
event=events['capture'];entry=event[-1]['time']
chapters=[{'name':name,'time':time} for name,time in [('Open pack',0),('First bonus card',event[1]['time']-.65),('Second bonus card',event[3]['time']-.65),('Third bonus → sockets',event[5]['time']-.65),('Counter → large sockets',event[-2]['time']+.65),('Throw button',entry+5.3),('Lugia energy',entry+8.85),('Card reveal & reward',entry+17.2),('Alternate escape',cap),('Legendary entrance',entry),('Final ball check',entry+13.42),('Return to pack',entry+25.52)]]
(o/'chapters.json').write_text(json.dumps(chapters,indent=2)+'\n');(o/'phone-probe.json').write_bytes(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(delivery)]))
print(json.dumps({'duration':cap+esc,'capture':cap,'escape':esc,'delivery_mib':delivery.stat().st_size/1024**2,'chapters':chapters},indent=2))
