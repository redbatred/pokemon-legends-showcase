from pathlib import Path
from PIL import Image
import json
root=Path(__file__).resolve().parent/'assets'
def build(name,rects,animations,display=None):
 im=Image.open(root/(name+'.png'));w,h=im.size
 atlas=[name+'.png',f'size: {w},{h}','format: RGBA8888','filter: Linear,Linear','repeat: none'];attachments={}
 for i,(x,y,cw,ch) in enumerate(rects):
  n=f'frame{i:02}';atlas.extend([n,'  rotate: false',f'  xy: {x},{y}',f'  size: {cw},{ch}',f'  orig: {cw},{ch}','  offset: 0,0','  index: -1']);attachments[n]={'type':'region','path':n,'width':display[0] if display else cw,'height':display[1] if display else ch}
 data={'skeleton':{'spine':'4.2.22'},'bones':[{'name':'root'}],'slots':[{'name':'art','bone':'root','attachment':'frame00'}],'skins':[{'name':'default','attachments':{'art':attachments}}],'animations':{name:{'slots':{'art':{'attachment':[{'time':j*.07,'name':f'frame{i:02}'} for j,i in enumerate(seq)]}}} for name,seq in animations.items()}}
 (root/(name+'.atlas')).write_text('\n'.join(atlas)+'\n');(root/(name+'.json')).write_text(json.dumps(data,separators=(',',':')))
meta={}
for species in ['mewtwo','lugia']:
 name=species+'-conversion';im=Image.open(root/(name+'.png'));w,h=im.size;rects=[]
 for i in range(16):
  x=i%4*w//4;y=i//4*h//4;rects.append((x,y,(i%4+1)*w//4-x,(i//4+1)*h//4-y))
 build(name,rects,{'transform':list(range(16))},(w/4,h/4))
 a=im.getchannel('A');x,y,cw,ch=rects[0];bbox=a.crop((x,y,x+cw,y+ch)).point(lambda p:255 if p>180 else 0).getbbox();x,y,cw,ch=rects[15];last=a.crop((x,y,x+cw,y+ch)).point(lambda p:255 if p>100 else 0).getbbox();ref=Image.open(root/(species+'-reference.png')).getchannel('A').point(lambda p:255 if p>180 else 0).getbbox()
 outlets=[]
 for x,y,cw,ch in rects:
  alpha=a.crop((x,y,x+cw,y+ch));bb=None
  for threshold in [160,80,10]:
   bb=alpha.point(lambda p:255 if p>threshold else 0).getbbox()
   if bb:break
  if not bb:outlets.append([cw*.83,ch*.55]);continue
  pixels=[(xx,yy,alpha.getpixel((xx,yy))) for xx in range(max(bb[0],bb[2]-8),bb[2]) for yy in range(bb[1],bb[3]) if alpha.getpixel((xx,yy))>threshold]
  total=sum(v for xx,yy,v in pixels) or 1;outlets.append([sum(xx*v for xx,yy,v in pixels)/total,sum(yy*v for xx,yy,v in pixels)/total])
 meta[species]={'outlets':outlets,'cell':[w/4,h/4],'first':bbox,'last':last,'reference':ref}
rows=[(10,160),(175,326),(341,492),(507,659),(672,816),(831,968),(983,1109),(1123,1250)]
rects=[(x,y,602,b-y) for y,b in rows for x in [15,636]]
build('eye-sequence',rects,{'mewtwo':list(range(8)),'lugia':list(range(8,16))},(1024,250))
(root/'drawn-metadata.json').write_text(json.dumps(meta,indent=2));print(json.dumps(meta,indent=2))
