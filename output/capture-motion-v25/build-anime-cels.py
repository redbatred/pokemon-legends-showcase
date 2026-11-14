from pathlib import Path
from PIL import Image
import json
r=Path(__file__).resolve().parent/'assets'
for name in ['anime-ink-v26','anime-impact-v26']:
 p=r/(name+'.png')
 if not p.exists():continue
 im=Image.open(p);w,h=im.size
 atlas=[p.name,f'size: {w},{h}','format: RGBA8888','filter: Linear,Linear','repeat: none'];frames={}
 for i in range(16):
  x=i%4*w//4+2;y=i//4*h//4+2;cw=(i%4+1)*w//4-x-2;ch=(i//4+1)*h//4-y-2;n=f'frame{i:02}'
  atlas.extend([n,'  rotate: false',f'  xy: {x},{y}',f'  size: {cw},{ch}',f'  orig: {cw},{ch}','  offset: 0,0','  index: -1']);frames[n]={'type':'region','path':n,'width':512,'height':512}
 data={'skeleton':{'spine':'4.2.22'},'bones':[{'name':'root'}],'slots':[{'name':'art','bone':'root','attachment':'frame00'}],'skins':[{'name':'default','attachments':{'art':frames}}],'animations':{'draw':{'slots':{'art':{'attachment':[{'time':i*.06,'name':f'frame{i:02}'} for i in range(16)]}}}}}
 (r/(name+'.atlas')).write_text('\n'.join(atlas)+'\n');(r/(name+'.json')).write_text(json.dumps(data,separators=(',',':')));print(name,im.size,im.mode)
