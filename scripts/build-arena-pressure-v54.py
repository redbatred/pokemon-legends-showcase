"""Authored Spine 4.2 court gusts: inward anticipation, outward impact and settling dust.
Reuse the project's transparent inked vector atlas; no raster generation or per-frame Graphics.
"""
from pathlib import Path
import json,math,shutil
out=Path('public/assets/arena-pressure-v54');out.mkdir(exist_ok=True)
for ext in ('atlas','svg'):shutil.copy2(f'public/assets/arena-pressure-v47/pressure.{ext}',out/f'pressure.{ext}')
data=json.loads(Path('public/assets/arena-pressure-v47/pressure.json').read_text())
animations={}
for name,duration in [('gather',1),('burst',.96)]:
 bones={};slots={}
 for i,slot in enumerate(data['slots']):
  dust=i>=8;k=i-8 if dust else i;n=6 if dust else 8;a=k/n*math.tau
  trans=[];rot=[];scales=[];alpha=[]
  for f in range(31):
   p=f/30;t=p*duration;ease=1-(1-p)**3
   if name=='gather':
    radius=220-120*(p*p*(3-2*p));turn=a+.27*math.sin(p*math.pi);scale=.35+.2*math.sin(p*math.pi);opacity=0 if dust else math.sin(p*math.pi)*.32
   else:
    radius=(48 if dust else 25)+(168 if dust else 260)*ease;turn=a+(.08 if dust else .20)*ease;scale=(.32 if dust else .2)+(1.1 if dust else .85)*math.sin(p*math.pi*.85);opacity=math.sin(min(1,p/.12)*math.pi/2)*(1-p)**(1.2 if dust else 1.7)
   trans.append(dict(time=t,x=math.cos(turn)*radius,y=math.sin(turn)*radius))
   rot.append(dict(time=t,value=(-10+34*ease)*(1 if k%2 else -1)))
   scales.append(dict(time=t,x=scale*(1+.07*math.sin(p*math.tau+k)),y=scale))
   alpha.append(dict(time=t,color='ffffff'+f'{round(max(0,min(1,opacity))*255):02x}'))
  bones[slot['bone']]=dict(translate=trans,rotate=rot,scale=scales);slots[slot['name']]={'rgba':alpha}
 animations[name]=dict(bones=bones,slots=slots)
data['animations']=animations
(out/'pressure.json').write_text(json.dumps(data,separators=(',',':')))
