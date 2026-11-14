from pathlib import Path
import shutil,json,struct
r=Path(__file__).resolve().parent;a=r/'assets';manifest=json.loads((a/'sharp-art-manifest.json').read_text());atlas=[]
for page,entry in enumerate(manifest['files']):
 dst=a/f'reward-sharp-{entry["part"]}.png';shutil.copy2(entry['path'],dst);w,h=struct.unpack('>II',dst.read_bytes()[16:24]);atlas += [dst.name,f'size: {w},{h}','format: RGBA8888','filter: Linear,Linear','repeat: none']
 for i in range(4):
  x=round(i%2*w/2)+2;y=round(i//2*h/2)+2;cw=round((i%2+1)*w/2)-x-2;ch=round((i//2+1)*h/2)-y-2
  atlas += [f'frame{page*4+i:02d}','  rotate: false',f'  xy: {x},{y}',f'  size: {cw},{ch}',f'  orig: {cw},{ch}','  offset: 0,0','  index: -1']
 atlas+=['']
(a/'reward-sharp.atlas').write_text('\n'.join(atlas));shutil.copy2(a/'reward-wave.json',a/'reward-sharp.json')
