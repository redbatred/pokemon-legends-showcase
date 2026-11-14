from pathlib import Path
from PIL import Image
import shutil,json
r=Path(__file__).resolve().parent;a=r/'assets';src=Path(Path.home()/'.codex/generated_images/01a1bfb1-a2cb-7f60-b9d7-5103369a04dd/exec-924e924c-40ff-4bb3-a89a-88d5b51ced2c.png');shutil.copy2(src,a/'sharp-current.png')
im=Image.open(src);w,h=im.size;atlas=['sharp-current.png',f'size: {w},{h}','format: RGBA8888','filter: Linear,Linear','repeat: none'];attachments={}
for i in range(4):
 x0=i%2*w//2;y0=i//2*h//2;x1=(i%2+1)*w//2;y1=(i//2+1)*h//2
 alpha=im.getchannel('A').crop((x0,y0,x1,y1));box=alpha.point(lambda x:255 if x>100 else 0).getbbox();x,y,xe,ye=box;x+=x0;y+=y0;xe+=x0;ye+=y0
 cw=xe-x;ch=ye-y;name=f'frame{i:02}'
 atlas += [name,'  rotate: false',f'  xy: {x},{y}',f'  size: {cw},{ch}',f'  orig: {cw},{ch}','  offset: 0,0','  index: -1']
 attachments[name]={'type':'region','path':name,'x':256,'width':512,'height':512*ch/cw}
 print(i,cw,ch)
(a/'sharp-current.atlas').write_text('\n'.join(atlas))
d={'skeleton':{'spine':'4.2.22'},'bones':[{'name':'root'}],'slots':[{'name':'art','bone':'root','attachment':'frame00'}],'skins':[{'name':'default','attachments':{'art':attachments}}],'animations':{'flow':{'slots':{'art':{'attachment':[{'time':i*.07,'name':f'frame{i:02}'} for i in range(4)]}}}}}
(a/'sharp-current.json').write_text(json.dumps(d,separators=(',',':')))
