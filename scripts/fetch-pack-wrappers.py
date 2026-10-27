"""Refresh original pack wrappers; plain rectangular crop and WebP conversion only."""
from pathlib import Path
import subprocess,hashlib,json,io,ast
from PIL import Image,ImageChops
ROOT=Path(__file__).resolve().parents[1];A=ROOT/'public/assets'
WRAPPERS={
 'pokemon-151':('151_Booster.png',None),
 'crown-zenith':('Crown_Zenith_Booster.jpg',None),
 'paldean-fates':('Paldean_Fates_Booster_Ceruledge.png',None),
 'lost-origin':('SWSH11_Booster_Enamorus.jpg',None),
 'fusion-strike':('SWSH8_Booster_Mew.jpg',None),
 'silver-tempest':('SWSH12_Booster_Lugia.jpg',None),
 'evolving-skies':('SWSH7_Booster_Rayquaza.jpg',None),
 'hidden-fates':('hidden-fates-charizard-original.jpg','https://amazingtoys.cstatic.io/media/36/79/13/1678199968/pok-mon-hidden-fates-booster-1.jpg'),
 'base-set':('base-set-long-crimp-bp.png','https://tcgtower.com/cdn/shop/files/base-set-long-crimp-bp.png?v=1714522971&width=2048')
}
sources=[]
for slug,(filename,url) in WRAPPERS.items():
 if not url:
  h=hashlib.md5(filename.encode()).hexdigest();url=f'https://archives.bulbagarden.net/media/upload/{h[0]}/{h[:2]}/{filename}'
 p=subprocess.run(['curl','--retry','2','--max-time','30','-L','--fail','--silent',url],capture_output=True,check=True)
 im=Image.open(io.BytesIO(p.stdout));im.load();original=ROOT/'source-assets'/'originals'/'sets'/slug/filename;original.parent.mkdir(parents=True,exist_ok=True);original.write_bytes(p.stdout)
 dims=im.size;crop=None
 if slug in ['base-set','hidden-fates']:
  rgb=im.convert('RGB');difference=ImageChops.difference(rgb,Image.new('RGB',im.size,'white')).convert('L').point(lambda p:255 if p>16 else 0)
  crop=difference.getbbox();im=im.crop(crop)
 target=A/'sets'/slug/'pack.webp';target.parent.mkdir(parents=True,exist_ok=True);im.save(target,quality=95,method=6)
 sources.append({'id':slug,'file':f'/assets/sets/{slug}/pack.webp','url':url,'provider':'TCG Tower' if slug=='base-set' else 'Amazingtoys' if slug=='hidden-fates' else 'Bulbagarden Archives','nativeDimensions':dims,'servedDimensions':im.size,'crop':crop,'original':str(original.relative_to(ROOT))})
 print(slug,im.size,im.mode,flush=True)
(A/'wrapper-manifest.json').write_text(json.dumps(sources,indent=2)+'\n')
# Read literal definitions without running the card download job again.
tree=ast.parse((ROOT/'scripts/fetch-all-packs.py').read_text());defs=next(ast.literal_eval(n.value) for n in tree.body if isinstance(n,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='SETS' for t in n.targets))
packs=[]
for slug,name,price,setid,api,accent,count,nums in defs:
 packs.append({'id':slug,'name':name,'price':price,'packImage':'/assets/pack.webp' if slug=='obsidian-flames' else f'/assets/sets/{slug}/pack.webp','catalogUrl':'/assets/catalog.json' if slug=='obsidian-flames' else f'/assets/sets/{slug}/catalog.json','accent':accent,'rewardCount':count})
(A/'packs.json').write_text(json.dumps(packs,indent=2)+'\n')
