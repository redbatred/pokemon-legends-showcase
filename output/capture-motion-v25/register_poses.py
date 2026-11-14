"""Register Spine mesh vertices to shared pose landmarks; no raster artwork edits."""
from pathlib import Path
import json
import numpy as np
from scipy.interpolate import RBFInterpolator
from scipy.spatial import cKDTree
from scipy.ndimage import binary_erosion
from PIL import Image
root=Path(__file__).resolve().parent/'assets'
meta=json.loads((root/'drawn-metadata.json').read_text())
points={
'mewtwo':[
[84,71,434,380],[138,60,494,359],[117,78,476,382],[95,99,440,417],[151,104,510,417],[135,134,501,455],[126,116,476,438],[145,128,499,450],[115,140,467,458],
[165,139,533,458],[259,148,652,474],[239,140,619,463],[97,158,448,485],[133,177,494,516],[141,218,507,565],
[106,236,454,596],[92,279,438,637],[91,292,438,657],[108,290,463,657],[198,242,581,591],[183,280,552,645],[215,290,595,653],
[49,270,389,638],[39,247,376,619],[76,284,426,653]],
'lugia':[
[242,30,534,379],[242,49,536,402],[243,65,539,425],[232,100,525,483],[211,105,488,490],[255,105,555,492],
[124,66,346,424],[84,94,284,466],[82,111,280,491],[88,135,287,533],[114,168,342,584],
[317,66,639,421],[350,87,698,447],[360,110,721,503],[326,170,690,588],
[231,145,519,559],[206,153,477,562],[255,148,564,567],[190,205,454,648],[265,199,582,640]]}
reports={}
for species,landmarks in points.items():
 m=meta[species]; cw,ch=m['cell'];a=np.array(m['first']);r=np.array(m['reference']);ac=(a[:2]+a[2:])/2;rc=(r[:2]+r[2:])/2;sf=(r[3]-r[1])/(a[3]-a[1])
 landmarks=np.array(landmarks,dtype=float);src=landmarks[:,:2];dst=(landmarks[:,2:]-rc)/sf+ac
 boundary=np.array([[0,0],[cw/2,0],[cw,0],[cw,ch/2],[cw,ch],[cw/2,ch],[0,ch],[0,ch/2]])
 fit=RBFInterpolator(np.concatenate([src,boundary]),np.concatenate([dst-src,np.zeros_like(boundary)]),kernel='thin_plate_spline',smoothing=.2)
 # Match the silhouette as well as joints. Pixel arrays are analyzed only;
 # the output remains mesh metadata and the original atlas stays untouched.
 art=np.asarray(Image.open(root/(species+'-conversion.png')).getchannel('A'))[:int(ch),:int(cw)]>180
 ref=np.asarray(Image.open(root/(species+'-reference.png')).getchannel('A'))>180
 sy,sx=np.where(art & ~binary_erosion(art));ty,tx=np.where(ref & ~binary_erosion(ref))
 contour=np.column_stack([sx,sy])[::3].astype(float);target=(np.column_stack([tx,ty])-rc)/sf+ac
 warped=contour+fit(contour);dist,idx=cKDTree(target).query(warped)
 keep=dist<18;contour=contour[keep];target=target[idx[keep]]
 # Preserve semantic anchors near edges instead of adding contradictory pairs.
 nearest,_=cKDTree(src).query(contour);keep=nearest>4;contour=contour[keep];target=target[keep]
 allsrc=np.concatenate([src,contour,boundary]);alloffset=np.concatenate([dst-src,target-contour,np.zeros_like(boundary)])
 fit=RBFInterpolator(allsrc,alloffset,kernel='thin_plate_spline',smoothing=20)
 n=49;uv=np.array([[x/(n-1),y/(n-1)] for y in range(n) for x in range(n)]);xy=uv*np.array([cw,ch]);delta=fit(xy)
 triangles=[]
 for y in range(n-1):
  for x in range(n-1):
   i=y*n+x;triangles.extend([i,i+n,i+1,i+1,i+n,i+n+1])
 data=json.loads((root/(species+'-conversion.json')).read_text());attachments=data['skins'][0]['attachments']['art']
 for frame in range(16):
  # Carry the same pose correction through the body drawings, release once
  # the artwork has become free-flowing energy (frames 6–9).
  t=np.clip((frame-5)/4,0,1);weight=1-t*t*(3-2*t)
  m['outlets'][frame]=(np.array(m['outlets'][frame])+fit(np.array([m['outlets'][frame]]))[0]*weight).tolist()
  aligned=xy+delta*weight;verts=np.column_stack([aligned[:,0]-cw/2,ch/2-aligned[:,1]]).reshape(-1)
  attachments[f'frame{frame:02}']={'type':'mesh','path':f'frame{frame:02}','uvs':uv.reshape(-1).round(7).tolist(),'triangles':triangles,'vertices':verts.round(4).tolist(),'hull':0,'width':cw,'height':ch}
 (root/(species+'-conversion.json')).write_text(json.dumps(data,separators=(',',':')))
 reports[species]={'sourceLandmarks':src.tolist(),'targetLandmarks':dst.tolist(),'meanLandmarkErrorBefore':float(np.linalg.norm(dst-src,axis=1).mean()),'meanLandmarkErrorAfter':float(np.linalg.norm(src+fit(src)-dst,axis=1).mean()),'maxVertexAdjustment':float(np.linalg.norm(delta,axis=1).max())}
(root/'drawn-metadata.json').write_text(json.dumps(meta,indent=2))
(root/'pose-registration.json').write_text(json.dumps(reports,indent=2));print(json.dumps({k:{kk:vv for kk,vv in v.items() if 'Landmarks' not in kk}for k,v in reports.items()},indent=2))
