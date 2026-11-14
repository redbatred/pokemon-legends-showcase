"""Build native Spine attachment/mesh metadata, retaining generated alpha artwork."""
from pathlib import Path
from PIL import Image
import json, shutil, runpy
r=Path(__file__).resolve().parent; a=r/'assets'
old=json.loads((a/'drawn-metadata.json').read_text())['mewtwo']
shutil.copy2(a/'mewtwo-conversion.json',a/'mewtwo-registered.json')
runpy.run_path(str(r/'build_conversion_assets.py'))
shutil.copy2(a/'mewtwo-registered.json',a/'mewtwo-conversion.json');(a/'mewtwo-registered.json').unlink()
m=json.loads((a/'drawn-metadata.json').read_text());m['mewtwo']=old
# Regular meshes preserve the newly drawn limb-to-current shapes. No anatomical squash.
cw,ch=m['lugia']['cell'];n=41;uv=[];vertices=[];triangles=[]
for y in range(n):
 for x in range(n):uv.extend([x/(n-1),y/(n-1)]);vertices.extend([cw*(x/(n-1)-.5),ch*(.5-y/(n-1))])
for y in range(n-1):
 for x in range(n-1):
  i=y*n+x;triangles.extend([i,i+n,i+1,i+1,i+n,i+n+1])
d=json.loads((a/'lugia-conversion.json').read_text())
for i in range(16):d['skins'][0]['attachments']['art'][f'frame{i:02}']={'type':'mesh','path':f'frame{i:02}','uvs':uv,'triangles':triangles,'vertices':vertices,'hull':0,'width':cw,'height':ch}
(a/'lugia-conversion.json').write_text(json.dumps(d,separators=(',',':')));(a/'drawn-metadata.json').write_text(json.dumps(m,indent=2))
# Authored wave cells as a Spine attachment animation.
im=Image.open(a/'reward-wave.png');w,h=im.size
atlas=['reward-wave.png',f'size: {w},{h}','format: RGBA8888','filter: Linear,Linear','repeat: none'];frames={}
for i in range(16):
 x=i%4*w//4;y=i//4*h//4;cw=(i%4+1)*w//4-x;ch=(i//4+1)*h//4-y;k=f'frame{i:02}'
 atlas.extend([k,'  rotate: false',f'  xy: {x+1},{y+1}',f'  size: {cw-2},{ch-2}',f'  orig: {cw-2},{ch-2}','  offset: 0,0','  index: -1']);frames[k]={'type':'region','path':k,'width':512,'height':512}
d={'skeleton':{'spine':'4.2.22'},'bones':[{'name':'root'}],'slots':[{'name':'art','bone':'root','attachment':'frame00'}],'skins':[{'name':'default','attachments':{'art':frames}}],'animations':{'draw':{'slots':{'art':{'attachment':[{'time':i*.06,'name':f'frame{i:02}'}for i in range(16)]}}}}}
(a/'reward-wave.atlas').write_text('\n'.join(atlas)+'\n');(a/'reward-wave.json').write_text(json.dumps(d,separators=(',',':')))
print({'lugia':m['lugia']['first'],'wave_size':im.size,'alpha':im.mode})
