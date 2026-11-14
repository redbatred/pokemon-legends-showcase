from pathlib import Path
import subprocess
r=Path(__file__).resolve().parent;source=r.parent/'capture-motion-v23/audio'
segments=[(0,11.3,1),(11.3,12.55,1.25/1.9),(12.55,16.65,1),(16.65,17.9,1.25/1.8),(17.9,18.5,1),(18.5,19.65,1.15/2.35),(19.65,None,1)]
for p in source.glob('*-score.wav'):
 filters=[]
 for i,(a,b,speed) in enumerate(segments):
  tempo=f'atempo={speed}' if speed>=.5 else f'atempo=0.7,atempo={speed/.7}'
  filters.append(f'[0:a]atrim=start={a}'+(f':end={b}'if b else '')+f',asetpts=PTS-STARTPTS,{tempo}[a{i}]')
 filters.append(''.join(f'[a{i}]'for i in range(len(segments)))+f'concat=n={len(segments)}:v=0:a=1[out]')
 subprocess.run(['ffmpeg','-v','error','-y','-i',str(p),'-filter_complex',';'.join(filters),'-map','[out]','-c:a','pcm_s16le',str(r/'audio'/p.name)],check=True)
 print(p.name)
