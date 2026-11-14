from pathlib import Path
from PIL import Image
import json
root=Path(__file__).resolve().parents[2]/'public/assets/capture-seals-v23'
for kind in ['ball','card']:
 name=kind+'-seal';im=Image.open(root/(name+'.png'));w,h=im.size;atlas=[name+'.png',f'size: {w},{h}','format: RGBA8888','filter: Linear,Linear','repeat: none'];frames={}
 for i in range(16):
  x=i%4*w//4;y=i//4*h//4;cw=(i%4+1)*w//4-x;ch=(i//4+1)*h//4-y;n=f'frame{i:02}'
  atlas.extend([n,'  rotate: false',f'  xy: {x},{y}',f'  size: {cw},{ch}',f'  orig: {cw},{ch}','  offset: 0,0','  index: -1']);frames[n]={'type':'region','path':n,'width':256,'height':256 if kind=='ball' else 384}
 data={'skeleton':{'spine':'4.2.22'},'bones':[{'name':'root'}],'slots':[{'name':'art','bone':'root','attachment':'frame00'}],'skins':[{'name':'default','attachments':{'art':frames}}],'animations':{'draw':{'slots':{'art':{'attachment':[{'time':i*.06,'name':f'frame{i:02}'} for i in range(16)]}}}}}
 (root/(name+'.atlas')).write_text('\n'.join(atlas)+'\n');(root/(name+'.json')).write_text(json.dumps(data,separators=(',',':')))
 print(name,im.size,im.mode)
