"""Native Spine attachment animation for sixteen painted energy drawings."""
import json,pathlib
root=pathlib.Path(__file__).resolve().parent/'assets';w,h=1261,1247
atlas=['limb-flow.png',f'size: {w},{h}','format: RGBA8888','filter: Linear,Linear','repeat: none']
attachments={}
for i in range(16):
 x=(i%4)*w//4;y=(i//4)*h//4;cw=((i%4+1)*w//4)-x;ch=((i//4+1)*h//4)-y;name=f'flow{i:02}'
 atlas.extend([name,'  rotate: false',f'  xy: {x}, {y}',f'  size: {cw}, {ch}',f'  orig: {cw}, {ch}','  offset: 0, 0','  index: -1'])
 attachments[name]={'type':'region','path':name,'width':440,'height':440}
(root/'limb-flow.atlas').write_text('\n'.join(atlas)+'\n')
data={'skeleton':{'spine':'4.2.22'},'bones':[{'name':'root'},{'name':'flow','parent':'root','x':167.2,'y':22}],'slots':[{'name':'flow','bone':'flow','attachment':'flow00'}],'skins':[{'name':'default','attachments':{'flow':attachments}}],'animations':{'flow':{'slots':{'flow':{'attachment':[{'time':i*.05,'name':f'flow{i:02}'} for i in range(16)]+[{'time':.8,'name':'flow00'}]}}}}}
(root/'limb-flow.json').write_text(json.dumps(data,separators=(',',':'))+'\n')
