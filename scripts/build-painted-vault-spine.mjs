/** Authors Spine geometry/timelines only. Every pixel comes from the external PNG atlas. */
import {mkdirSync,writeFileSync} from 'node:fs';
const bones=[{name:'root'}],slots=[],attachments={},animations={};
const round=n=>Math.round(n*1000)/1000;
function clip(kind,duration,loop=false){
 const anim={bones:{},slots:{},attachments:{default:{}}};animations[kind]=anim;
 function mesh(id,path,w,h,x=0,y=0,opacity=1,rotation=0){
  const name=kind+'_'+id,vertices=[],uvs=[],triangles=[],cols=8,rows=4;
  bones.push({name,parent:'root',x,y,rotation});slots.push({name,bone:name,attachment:name,color:'ffffff00'});
  for(let row=0;row<=rows;row++)for(let col=0;col<=cols;col++){vertices.push(round((col/cols-.5)*w),round((.5-row/rows)*h));uvs.push(col/cols,row/rows);}
  for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){const a=row*(cols+1)+col,b=a+cols+1;triangles.push(a,b,a+1,a+1,b,b+1);}
  attachments[name]={[name]:{type:'mesh',path,width:w,height:h,uvs,triangles,vertices,hull:0}};
  anim.slots[name]={alpha:loop?[{value:opacity},{time:duration/2,value:opacity*.87},{time:duration,value:opacity}]:[{value:0},{time:round(duration*.12),value:opacity},{time:round(duration*.6),value:opacity},{time:duration,value:0}]};
  const deform=[];
  for(let f=0;f<=8;f++){
   const time=duration*f/8,phase=f/8*Math.PI*2,offsets=[];
   for(let row=0;row<=rows;row++)for(let col=0;col<=cols;col++){
    const u=col/cols,v=row/rows,envelope=Math.sin(u*Math.PI)*Math.sin(v*Math.PI);
    offsets.push(round(Math.sin(v*7-phase+rotation)*w*.025*envelope),round(Math.sin(u*8-phase*2+rotation)*h*.065*Math.sin(u*Math.PI)));
   }
   deform.push({time:round(time),vertices:offsets});
  }
  anim.attachments.default[name]={[name]:{deform}};
  return {name,motion:(value)=>anim.bones[name]=value,alpha:(keys)=>anim.slots[name]={alpha:keys}};
 }
 return {mesh,anim,duration};
}
for(let k=0;k<3;k++){
 const {mesh}=clip('fire'+k,.76);
 // Continuous painted white/yellow jets carry the attack from the mouth to the ward.
 const wake=mesh('wake','jet',324,[128,146,172][k],162,0,.96);
 wake.motion({scale:[{x:.04,y:.12},{time:.08,x:.8,y:.78},{time:.16,x:1,y:1.1},{time:.3,x:1,y:1},{time:.48,x:1,y:.4},{time:.62,x:1,y:.08},{time:.76,x:1,y:0}],translate:[{x:-155},{time:.16,x:0},{time:.76,x:0}]});
 wake.alpha([{value:0},{time:.055,value:.96},{time:.35,value:.96},{time:.6,value:.3},{time:.76,value:0}]);
 const core=mesh('core','jet',324,[78,92,112][k],162,0,1);
 core.motion({translate:[{x:-150},{time:.12,x:0},{time:.76,x:0}],scale:[{x:.06,y:.1},{time:.1,x:.9,y:.9},{time:.18,x:1,y:1.08},{time:.35,x:1,y:1},{time:.52,x:1,y:.24},{time:.62,x:1,y:.05},{time:.76,x:1,y:0}]});
 core.alpha([{value:0},{time:.07,value:1},{time:.42,value:1},{time:.62,value:.25},{time:.76,value:0}]);

}
{
 const {mesh}=clip('impact',.8);
 const shock=mesh('flare','flare',170,170,0,0,.85);shock.motion({scale:[{x:.2,y:.2},{time:.065,x:1,y:1},{time:.22,x:1.2,y:.9},{time:.8,x:1.5,y:.5}]});
 for(let i=0;i<4;i++){const side=i%2?1:-1,p=mesh('curl'+i,'wisp',88,95,side*18,(i<2?1:-1)*21,.8,i*73);p.motion({translate:[{x:0,y:0},{time:.18,x:side*23,y:(i<2?1:-1)*18},{time:.8,x:side*74,y:(i<2?1:-1)*54}],scale:[{x:.3,y:.3},{time:.12,x:1,y:1},{time:.8,x:.6,y:.5}],rotate:[{value:0},{time:.8,value:side*75}]});}
}
{
 const {mesh}=clip('guardback',4,true);const field=mesh('field','ward',204,230,0,0,.14);field.motion({scale:[{x:1,y:1},{time:2,x:.97,y:1.02},{time:4,x:1,y:1}]});
 const haze=mesh('haze','fog',175,230,0,0,.13);haze.motion({rotate:[{value:-4},{time:2,value:4},{time:4,value:-4}]});
}
{
 const {mesh}=clip('guardfront',4,true);mesh('membrane','ward',204,230,0,0,.85);
 for(let i=0;i<2;i++){
  const angle=i/2*Math.PI*2,wisp=mesh('wisp'+i,'wisp',32,65,0,0,.28,i*180),translate=[],rotate=[];
  for(let f=0;f<=16;f++){const a=angle+f/16*Math.PI*2;translate.push({time:f/4,x:round(Math.cos(a)*94),y:round(Math.sin(a)*105)});rotate.push({time:f/4,value:round(-a*180/Math.PI+90)});}
  wisp.motion({translate,rotate});
 }
}
{
 const {mesh}=clip('guardbreak',1.4);
 const membrane=mesh('membrane','ward',204,230,0,0,.9);
 membrane.motion({scale:[{x:1,y:1},{time:.1,x:.64,y:.77},{time:.16,x:.4,y:.48},{time:.2,x:.37,y:.43},{time:.32,x:1.35,y:1.25},{time:.5,x:1.65,y:1.5},{time:1.4,x:1.9,y:1.7}],rotate:[{value:0},{time:.16,value:-7},{time:.32,value:4},{time:1.4,value:16}]});
 membrane.alpha([{value:.9},{time:.16,value:1},{time:.26,value:.9},{time:.42,value:.2},{time:.6,value:0},{time:1.4,value:0}]);
 const shock=mesh('shock','shock',420,420,0,0,1);
 shock.motion({scale:[{x:.08,y:.08},{time:.2,x:.2,y:.2},{time:.32,x:1.2,y:1.2},{time:.45,x:1.45,y:1.45},{time:.65,x:1.65,y:1.65},{time:1.4,x:1.65,y:1.65}]});
 shock.alpha([{value:0},{time:.2,value:0},{time:.27,value:1},{time:.32,value:1},{time:.38,value:.25},{time:.46,value:0},{time:1.4,value:0}]);
 for(let i=0;i<7;i++){
  const a=i/7*Math.PI*2,wisp=mesh('shard'+i,'wisp',55,145,0,0,.9,i*51);
  wisp.motion({translate:[{x:Math.cos(a)*80,y:Math.sin(a)*100},{time:.16,x:Math.cos(a)*28,y:Math.sin(a)*33},{time:.2,x:Math.cos(a)*25,y:Math.sin(a)*30},{time:.34,x:Math.cos(a)*175,y:Math.sin(a)*185},{time:.65,x:Math.cos(a)*245,y:Math.sin(a)*250},{time:1.4,x:Math.cos(a)*310,y:Math.sin(a)*290}],rotate:[{value:0},{time:.16,value:i%2?-20:20},{time:.34,value:i%2?-55:55},{time:1.4,value:i%2?-100:100}],scale:[{x:1,y:.7},{time:.16,x:.4,y:.4},{time:.34,x:1.1,y:1.35},{time:.65,x:.65,y:1.2},{time:1.4,x:.05,y:.3}]});
  wisp.alpha([{value:.65},{time:.16,value:.9},{time:.34,value:1},{time:.7,value:.6},{time:1.4,value:0}]);
 }
}
{
 const {mesh}=clip('summon',1.5);const base=mesh('portal','portal',275,92,0,0,.75);base.motion({scale:[{x:.1,y:.3},{time:.25,x:1,y:1},{time:1.5,x:1.15,y:.5}]});
 const plume=mesh('plume','summon',225,340,0,160,.95);plume.motion({translate:[{x:0,y:-130},{time:.28,x:0,y:-30},{time:.55,x:0,y:0},{time:1.5,x:0,y:65}],scale:[{x:.4,y:.1},{time:.25,x:.85,y:.8},{time:.55,x:1,y:1},{time:1.5,x:.8,y:1.2}]});
 for(let i=0;i<3;i++){const p=mesh('tongue'+i,'wisp',85,210,(i-1)*57,75,.65,(i-1)*-19);p.motion({translate:[{x:0,y:-65},{time:.4,x:(i-1)*8,y:20},{time:1.5,x:(i-1)*35,y:125}],scale:[{x:.5,y:.2},{time:.4,x:1,y:1},{time:1.5,x:.3,y:.9}],rotate:[{value:-8},{time:.7,value:12},{time:1.5,value:23}]});}
}
{
 const {mesh}=clip('charge',1.2);const ball=mesh('core','bloom',105,105,0,0,.9);ball.motion({scale:[{x:.3,y:.3},{time:.65,x:.85,y:.85},{time:1,x:1.1,y:1.1},{time:1.2,x:.2,y:.2}]});
 for(let i=0;i<3;i++){const a=i/3*Math.PI*2,w=mesh('orbit'+i,'jet',70,38,0,0,.75,i*120);w.motion({translate:[{x:Math.cos(a)*75,y:Math.sin(a)*75},{time:.7,x:Math.cos(a+1.7)*40,y:Math.sin(a+1.7)*40},{time:1.2,x:0,y:0}],rotate:[{value:0},{time:1.2,value:110}]});}
}
{
 const {mesh,anim}=clip('reward',3);const aura=mesh('aura','reward',850,850,0,0,.9);aura.motion({scale:[{x:.96,y:.96},{time:.3,x:1,y:1},{time:3,x:1,y:1}]});
 // The painted rectangular opening must remain rigid and slightly beneath the card edges.
 delete anim.attachments.default[aura.name];
 for(let i=0;i<4;i++){
  const side=i%2?1:-1,w=mesh('edge'+i,'flare',22,42,side*174,i<2?112:-112,.7,side*18);
  w.motion({translate:[{x:0,y:-8},{time:1,x:side*3,y:5},{time:3,x:side*5,y:15}],rotate:[{value:0},{time:1.5,value:side*20},{time:3,value:side*35}],scale:[{x:.6,y:.6},{time:.5,x:1,y:1},{time:1.8,x:.7,y:.7},{time:3,x:.3,y:.3}]});
 }
}
{
 const {mesh}=clip('containment',6,true);
 for(let i=0;i<2;i++){const r=mesh('ring'+i,'portal',150,200,0,0,i?.2:.35,i*90);r.motion({rotate:[{value:0},{time:3,value:i?-10:10},{time:6,value:0}],scale:[{x:1,y:1},{time:3,x:i?1.03:.97,y:i?.97:1.03},{time:6,x:1,y:1}]});}
 for(let i=0;i<3;i++){const [x,y]=[[-67,14],[67,14],[0,-91]][i],c=mesh('seal'+i,'clasp',30,30,x,y,.95,0);c.motion({scale:[{x:1,y:1},{time:3,x:1.05,y:1.05},{time:6,x:1,y:1}],rotate:[{value:-3},{time:3,value:3},{time:6,value:-3}]});}
}
{
 const {mesh}=clip('ambient',12,true);
 for(let i=0;i<3;i++){const f=mesh('fog'+i,'fog',820,230,(i-1)*310,i*28,.2,i*4-4);f.motion({translate:[{x:-30,y:0},{time:6,x:30,y:8-i*7},{time:12,x:-30,y:0}],scale:[{x:1,y:1},{time:6,x:1.08,y:.94},{time:12,x:1,y:1}]});}
}
{
 const {mesh}=clip('portal',6,true);mesh('shadow','shadow',280,85,0,-3,.6);const p=mesh('rim','portal',260,90,0,0,.8);p.motion({scale:[{x:1,y:1},{time:3,x:1.04,y:.94},{time:6,x:1,y:1}]});
 for(let i=0;i<2;i++){const w=mesh('curl'+i,'wisp',95,42,i?83:-83,5,.45,i?180:0);w.motion({translate:[{x:-8,y:0},{time:3,x:8,y:7},{time:6,x:-8,y:0}]});}
}
{
 const {mesh,anim}=clip('ball',1.5);
 const ball=mesh('sphere','ball',38,38,0,19,1);
 ball.motion({translate:[{x:-120,y:38},{time:.12,x:-78,y:0},{time:.23,x:-36,y:30},{time:.35,x:0,y:0},{time:.57,x:0,y:0},{time:.78,x:0,y:-16},{time:1.5,x:0,y:-16}],rotate:[{value:-150},{time:.35,value:0},{time:1.5,value:0}],scale:[{x:1,y:1},{time:.12,x:1.12,y:.88},{time:.18,x:1,y:1},{time:.35,x:1.06,y:.94},{time:.45,x:1,y:1},{time:.62,x:.7,y:.7},{time:.8,x:0,y:0},{time:1.5,x:0,y:0}]});
 ball.alpha([{value:1},{time:.6,value:1},{time:.8,value:0},{time:1.5,value:0}]);
 // Painted spherical hardware stays round; its bounce/squash lives on the bone.
 anim.attachments.default[ball.name][ball.name].deform.forEach(frame=>{frame.vertices=frame.vertices.map(value=>round(value*.12));});
}
{
 const {mesh}=clip('link',3,true);
 const tether=mesh('ribbon','wisp',320,35,160,0,.52);
 tether.motion({scale:[{x:1,y:.8},{time:1.5,x:1,y:1.08},{time:3,x:1,y:.8}]});
 const core=mesh('filament','wisp',320,14,160,0,.3);
 core.motion({scale:[{x:1,y:1},{time:1.5,x:1,y:.7},{time:3,x:1,y:1}]});
}
{
 const {mesh}=clip('water',3,true);
 for(let i=0;i<3;i++){
  const strip=mesh('ripple'+i,'water',600-i*55,110-i*15,0,(i-1)*18,[.42,.6,.4][i]);
  // The atlas supplies painted water; mesh waves travel along it and close on the loop boundary.
  strip.motion({translate:[{x:0,y:0},{time:.75,x:12-i*8,y:2},{time:1.5,x:0,y:0},{time:2.25,x:-12+i*8,y:-2},{time:3,x:0,y:0}],scale:[{x:1,y:1},{time:1.5,x:1.035,y:.95},{time:3,x:1,y:1}]});
 }
}
{
 const {mesh,anim}=clip('rocks',6,true);
 const positions=[[-465,145,58],[-285,235,82],[38,110,46],[295,185,70],[470,250,90]];
 for(let i=0;i<positions.length;i++){
  const [x,y,size]=positions[i],rock=mesh('stone'+i,'rock',size,size*.82,x,y,.9,i*39-60),translate=[],rotate=[];
  for(let f=0;f<=16;f++){
   const phase=f/16*Math.PI*2,offset=i*.9;
   translate.push({time:f*6/16,x:round((Math.cos(phase+offset)-Math.cos(offset))*4),y:round((Math.sin(phase+offset)-Math.sin(offset))*(4+i*.6))});
   rotate.push({time:f*6/16,value:round(Math.sin(phase+offset)*5)});
  }
  rock.motion({translate,rotate});
  // Matte rock silhouettes remain rigid; only their independently animated bones move.
  delete anim.attachments.default[rock.name];
 }
}
{
 const {mesh}=clip('speed',.7,true);
 const lines=mesh('lines','speed',1000,700,0,0,.5);
 lines.alpha([{value:.5},{time:.7,value:.5}]);
 lines.motion({scale:[{x:1,y:1},{time:.35,x:1.08,y:1.04},{time:.7,x:1,y:1}]});
}
{
 const {mesh}=clip('shock',.55);
 const burst=mesh('burst','shock',500,500,0,0,1);
 burst.motion({scale:[{x:.2,y:.2},{time:.07,x:1,y:1},{time:.18,x:1.2,y:1.2},{time:.55,x:1.5,y:1.5}]});
 burst.alpha([{value:0},{time:.04,value:1},{time:.15,value:.95},{time:.3,value:.5},{time:.55,value:0}]);
}
mkdirSync('public/assets/showdown-v11',{recursive:true});
writeFileSync('public/assets/showdown-v11/vault.json',JSON.stringify({skeleton:{spine:'4.2.22',images:'./',audio:''},bones,slots,skins:[{name:'default',attachments}],animations}));
console.log(`Wrote native Spine rig: ${bones.length} bones, ${slots.length} deforming raster meshes, ${Object.keys(animations).length} animations.`);
