"""16 distinct drawn smoke frames, native Spine attachment animation.
No replicated puffs, no scale-only animation and no bitmap modifications.
"""
from pathlib import Path
import json
p=Path(__file__).parent/'assets';size=1254
atlas=['smoke-sequence.png',f'size: {size},{size}','filter: Linear,Linear','pma: false']
attachments={};keys=[]
for i in range(16):
 x=int(i%4*size/4);y=int(i//4*size/4);right=int((i%4+1)*size/4);bottom=int((i//4+1)*size/4)
 name=f'frame{i:02}'
 atlas += [name,f'  bounds: {x},{y},{right-x},{bottom-y}']
 attachments[name]={'path':name,'width':520,'height':520}
 keys.append({'time':i*.065,'name':name})
keys.append({'time':1.04,'name':None})
j={'skeleton':{'spine':'4.2.22'},'bones':[{'name':'root'}],'slots':[{'name':'smoke','bone':'root','attachment':'frame00'}],'skins':[{'name':'default','attachments':{'smoke':attachments}}],'animations':{'poof':{'slots':{'smoke':{'attachment':keys}}}}}
(p/'smoke.atlas').write_text('\n'.join(atlas)+'\n');(p/'smoke.json').write_text(json.dumps(j))
