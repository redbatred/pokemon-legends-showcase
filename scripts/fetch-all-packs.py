"""Download authentic native-resolution card scans for the ten PDF packs.
Requires Pillow; run with the interpreter documented in ASSET-SOURCES.md.
"""
from pathlib import Path
import json,subprocess,urllib.request,concurrent.futures,io,shutil
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]; A=ROOT/'public/assets'
SETS=[
 ('obsidian-flames','Obsidian Flames',1000,'sv03','sv3','#f17935',10,['001','004','013','026','027','028','030','045','066','080','086','125','130','159','162','166','198','199','202','205','207','215','223','225','228']),
 ('pokemon-151','Pokémon 151',2500,'sv03.5','sv3pt5','#cb84c7',10,['001','002','003','004','005','006','007','008','009','025','026','039','052','054','063','065','092','093','094','133','143','151','198','199','200']),
 ('crown-zenith','Crown Zenith',5000,'swsh12.5','swsh12pt5','#6cc5dc',10,['001','004','006','011','018','019','020','036','037','047','059','060','071','108','109','swsh12.5gg:GG05','swsh12.5gg:GG10','swsh12.5gg:GG20','swsh12.5gg:GG30','swsh12.5gg:GG35','swsh12.5gg:GG38','swsh12.5gg:GG41','swsh12.5gg:GG44','swsh12.5gg:GG69','swsh12.5gg:GG70']),
 ('paldean-fates','Paldean Fates',10000,'sv04.5','sv4pt5','#a98cf1',10,['001','002','007','008','018','019','023','028','029','031','037','038','039','040','054','055','056','057','058','059','092','093','232','233','234']),
 ('lost-origin','Lost Origin',15000,'swsh11','swsh11','#bfa0e8',10,['001','003','006','007','011','013','022','023','024','025','026','050','052','058','068','069','070','079','080','093','130','180','186','swsh11tg:TG17','swsh11tg:TG29']),
 ('fusion-strike','Fusion Strike',25000,'swsh8','swsh8','#e27fbd',10,['1','3','6','16','28','30','32','33','43','56','73','86','91','93','102','113','114','120','130','156','157','185','269','270','271']),
 ('silver-tempest','Silver Tempest',35000,'swsh12','swsh12','#78bded',10,['001','002','003','005','011','017','018','020','025','026','027','036','037','038','046','049','051','059','060','063','069','138','186','193','swsh12tg:TG20']),
 ('evolving-skies','Evolving Skies',50000,'swsh7','swsh7','#8ccf6d',10,['1','4','5','6','7','13','15','20','29','30','41','42','49','54','58','65','74','95','109','110','123','124','205','215','218']),
 ('hidden-fates','Hidden Fates',75000,'sm115','sm115','#70c8b7',10,['1','3','4','5','6','8','9','10','11','14','15','16','17','18','19','20','21','24','31','39','40','44','sma:SV49','sma:SV59','sma:SV69']),
 ('base-set','Base Set 1999',100000,'base1','base1','#dfba65',9,['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','22','24','28','35','44','46','58','63','65'])
]
API_MAP={'swsh12.5gg':'swsh12pt5gg','swsh11tg':'swsh11tg','swsh12tg':'swsh12tg','sma':'sma'}
def curl(url):
 p=subprocess.run(['curl','--retry','2','--max-time','30','-L','--fail','--silent',url],capture_output=True)
 if p.returncode:raise ValueError(f'HTTP download failed {url}')
 return p.stdout

def card_job(args):
 cfg,entry=args;slug,name,price,main,api,accent,count,nums=cfg
 setid,num=entry.split(':') if ':' in entry else (main,entry)
 metadata=json.loads(curl(f'https://api.tcgdex.net/v2/en/cards/{setid}-{num}'))
 apiid=API_MAP.get(setid,api)
 api_num=str(int(num)) if num.isdigit() else num
 url=f'https://images.pokemontcg.io/{apiid}/{api_num}_hires.png'
 original=ROOT/'source-assets'/'originals'/'sets'/slug/f'{num}.png';original.parent.mkdir(parents=True,exist_ok=True)
 try:
  data=curl(url);im=Image.open(io.BytesIO(data));im.load()
  if im.width<600 or im.height<800:raise ValueError('low resolution')
  original.write_bytes(data)
 except Exception as e:
  if 'image' not in metadata:raise
  url=metadata['image']+'/high.webp';data=curl(url);im=Image.open(io.BytesIO(data));im.load();original=original.with_suffix('.webp');original.write_bytes(data)
 target=A/'cards'/f'{num}.webp' if slug=='obsidian-flames' else A/'sets'/slug/'cards'/f'{num}.webp'
 target.parent.mkdir(parents=True,exist_ok=True);im.save(target,quality=95,method=6)
 row={'id':metadata['id'],'number':num,'name':metadata['name'],'rarity':metadata['rarity'],'image':'/'+str(target.relative_to(ROOT/'public'))}
 src={'file':row['image'],'url':url,'provider':'Pokémon TCG API' if 'pokemontcg.io' in url else 'TCGdex','nativeDimensions':[im.width,im.height],'original':str(original.relative_to(ROOT))}
 return row,src

all_sources=[];packs=[]
for cfg in SETS:
 slug,name,price,setid,api,accent,count,nums=cfg
 catalog=[]
 with concurrent.futures.ThreadPoolExecutor(max_workers=7) as ex:
  for row,src in ex.map(card_job,[(cfg,n) for n in nums]):catalog.append(row);all_sources.append(src)
 folder=A if slug=='obsidian-flames' else A/'sets'/slug
 (folder/'catalog.json').write_text(json.dumps(catalog,indent=2)+'\n')
 manifest={'id':slug,'name':name,'price':price,'packImage':'/assets/pack.webp' if slug=='obsidian-flames' else f'/assets/sets/{slug}/pack.webp','catalogUrl':'/assets/catalog.json' if slug=='obsidian-flames' else f'/assets/sets/{slug}/catalog.json','accent':accent,'rewardCount':count}
 packs.append(manifest)
 (A/'packs.json').write_text(json.dumps(packs,indent=2)+'\n')
 (A/'expanded-asset-manifest.json').write_text(json.dumps(all_sources,indent=2)+'\n')
 print(slug,len(catalog),'cards ready',dict((str(x['nativeDimensions']),sum(y['nativeDimensions']==x['nativeDimensions'] for y in all_sources[-25:])) for x in all_sources[-25:]),flush=True)
print('250 authentic native scans ready.',flush=True)
