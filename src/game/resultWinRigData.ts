/** Native Spine championship crest. Every feather, bevel, flare and spark is a
 * separate attachment; the held award remains readable after the impact. */
export const RESULT_WIN_ATLAS = `result-win.png
size: 64,64
filter: Linear,Linear
pma: false
ink
  bounds: 0,0,4,4
star
  bounds: 8,0,32,32
shard
  bounds: 44,0,8,12
`;
type Bone={name:string;parent?:string;x?:number;y?:number;rotation?:number};
type Key={time:number;x?:number;y?:number;value?:number};
type Motion={translate?:Key[];scale?:Key[];rotate?:Key[]};
type Mesh={type:'mesh';path:string;width:number;height:number;vertices:number[];uvs:number[];triangles:number[];hull:number};
type Region={path:string;width:number;height:number};
type Slot={name:string;bone:string;attachment:string;color:string;blend?:string};
const round=(n:number)=>Math.round(n*10000)/10000;
function polygon(points:number[]):Mesh{const triangles:number[]=[];for(let i=1;i<points.length/2-1;i++)triangles.push(0,i,i+1);return {type:'mesh',path:'ink',width:4,height:4,vertices:points.map(round),uvs:points.map(()=>.5),triangles,hull:points.length/2};}
function disk(radius:number,from=0,to=360){const points=[0,0];for(let i=0;i<=24;i++){const a=(from+(to-from)*i/24)*Math.PI/180;points.push(Math.cos(a)*radius,Math.sin(a)*radius);}return polygon(points);}
export function buildResultWinRigJson(width:number,height:number,low=false){
 const bones:Bone[]=[{name:'root'},{name:'crest',parent:'root',y:-height*.035},{name:'medal',parent:'root',y:-height*.397}];
 const slots:Slot[]=[],attachments:Record<string,Record<string,Mesh|Region>>={};
 const arrivalBones:Record<string,Motion>={},impactBones:Record<string,Motion>={},chargeBones:Record<string,Motion>={},idleBones:Record<string,Motion>={};
 const arrivalSlots:Record<string,{alpha:Key[]}>= {},impactSlots:Record<string,{alpha:Key[]}>= {},chargeSlots:Record<string,{alpha:Key[]}>= {},idleSlots:Record<string,{alpha:Key[]}>= {};
 const add=(name:string,bone:string,shape:Mesh|Region,color:string,blend=false)=>{slots.push({name,bone,attachment:name,color,...(blend?{blend:'additive'}:{})});attachments[name]={[name]:shape};};
 // Burst petals spread behind the solid award, so the amount is never washed out.
 for(let i=0;i<(low?8:16);i++){
  const a=Math.PI*2*i/(low?8:16),name=`burst-${i}`,x=Math.cos(a)*width*.42,y=Math.sin(a)*height*.42;
  bones.push({name,parent:'root'});
  add(name,name,polygon([x*.45,y*.45,x*.82-y*.055,y*.82+x*.008,x,y,x*.82+y*.055,y*.82-x*.008]),`${i%2?'a5edff':'ffe79b'}00`,true);
  impactBones[name]={scale:[{time:0,x:.25,y:.25},{time:.10,x:1,y:1},{time:.45,x:1.02,y:1.02},{time:.72,x:.94,y:.94}]};
  impactSlots[name]={alpha:[{time:0,value:0},{time:.08,value:.9},{time:.25,value:.55},{time:.65,value:0}]};
 }
 // Three jointed feathers per side unfold in sequence, with shaded lower faces.
 for(const side of [-1,1])for(let i=0;i<3;i++){
  const name=`wing-${side}-${i}`,x=side*width*.27,y=height*(.13-i*.15),tip=side*width*(.19-i*.018);
  bones.push({name,parent:'root',x,y});
  const points=[0,-height*.055,tip*.75,-height*.012,tip,height*.15,tip*.64,height*.07,0,height*.025];
  add(`${name}-gold`,name,polygon(points),'f6cc62ff');
  add(`${name}-ivory`,name,polygon([0,-height*.02,tip*.70,height*.012,tip*.87,height*.118,tip*.58,height*.062,0,height*.018]),i===1?'75d9ffff':'e4fbffff');
  add(`${name}-shade`,name,polygon([0,-height*.055,tip*.75,-height*.012,tip*.64,height*.014,0,-height*.028]),'1769aaff');
  const delay=i*.035;
  arrivalBones[name]={scale:[{time:0,x:.1,y:.3},{time:delay+.12,x:.4,y:.6},{time:delay+.32,x:1,y:1}],rotate:[{time:0,value:side*-14},{time:delay+.32,value:0}]};
  impactBones[name]={scale:[{time:0,x:.78,y:.8},{time:.13+i*.018,x:1,y:1},{time:.72,x:1,y:1}]};
  idleBones[name]={translate:[{time:0,x:0,y:0},{time:1.8,x:0,y:height*.012*(i+1)/3},{time:3.6,x:0,y:0}]};
 }
 // A deep blue inset, stepped metallic bevels, and one luminous upper edge.
 const plate=(scale:number)=>polygon([-.335*width*scale,.25*height*scale,.335*width*scale,.25*height*scale,.38*width*scale,.12*height*scale,.35*width*scale,-.20*height*scale,.27*width*scale,-.285*height*scale,-.27*width*scale,-.285*height*scale,-.35*width*scale,-.20*height*scale,-.38*width*scale,.12*height*scale]);
 add('crest-shadow','crest',plate(1.04),'082544ff');
 add('crest-gold','crest',plate(1),'f3cd64ff');
 add('crest-ivory','crest',plate(.955),'fff0b8ff');
 add('crest-bevel','crest',plate(.919),'1c6fa7ff');
 add('crest-face','crest',plate(.865),'092952ff');
 add('crest-upper-glass','crest',polygon([-.30*width,.20*height,.30*width,.20*height,.323*width,.10*height,-.323*width,.10*height]),'4bb5e438');
 add('crest-edge-light','crest',polygon([-.30*width,.215*height,.30*width,.215*height,.30*width,.23*height,-.30*width,.23*height]),'eaffffb0',true);
 chargeSlots['crest-edge-light']={alpha:[{time:0,value:.25},{time:.45,value:1},{time:.9,value:.25}]};
 arrivalBones.crest={scale:[{time:0,x:.5,y:.65},{time:.19,x:.97,y:.97},{time:.32,x:1,y:1}]};
 impactBones.crest={scale:[{time:0,x:.93,y:.86},{time:.12,x:1.015,y:1.055},{time:.34,x:1,y:1}]};
 chargeBones.crest={scale:[{time:0,x:1,y:1},{time:.45,x:1.006,y:1.012},{time:.9,x:1,y:1}]};
 const radius=height*.077;
 add('medal-outline','medal',disk(radius),'ffda85ff');add('medal-dark','medal',disk(radius*.81),'143a5dff');add('medal-red','medal',disk(radius*.66,0,180),'ed5378ff');add('medal-ivory','medal',disk(radius*.66,180,360),'fff4cbff');
 add('medal-stripe','medal',polygon([-radius*.75,-radius*.1,radius*.75,-radius*.1,radius*.75,radius*.1,-radius*.75,radius*.1]),'143a5dff');add('medal-button-ring','medal',disk(radius*.31),'143a5dff');add('medal-button','medal',disk(radius*.18),'fff7d9ff');
 arrivalBones.medal={scale:[{time:0,x:0,y:0},{time:.24,x:.6,y:.6},{time:.4,x:1,y:1}]};impactBones.medal={scale:[{time:0,x:.7,y:.7},{time:.15,x:1.1,y:1.1},{time:.4,x:1,y:1}]};
 for(let i=0;i<(low?6:16);i++){
  const name=`confetti-${i}`,side=i%2?1:-1,seed=(i%7)/7,delay=(i%4)*.018,size=Math.min(8,height*(.04+seed*.018));
  bones.push({name,parent:'root',x:side*width*(.38+seed*.06),y:-height*.21,rotation:i*39});
  add(name,name,{path:i%5?'shard':'star',width:size,height:size*1.2},`${['ffe48e','a9e8fa','fff5da'][i%3]}00`);
  const translate:Key[]=[],rotate:Key[]=[],scale:Key[]=[];
  for(let frame=0;frame<=16;frame++){const t=frame/16;translate.push({time:delay+t*.72,x:side*width*.026*t,y:height*(1.7*t-1.25*t*t)});rotate.push({time:delay+t*.72,value:side*320*t});scale.push({time:delay+t*.72,x:Math.cos(t*10+seed),y:1});}
  impactBones[name]={translate,rotate,scale};impactSlots[name]={alpha:[{time:0,value:0},{time:delay+.04,value:1},{time:.52,value:1},{time:.79,value:0}]};
 }
 for(let i=0;i<(low?2:6);i++){
  const name=`glint-${i}`,side=i%2?1:-1,start=.04+i*.055,size=Math.min(24,height*.16);
  bones.push({name,parent:'root',x:side*width*(i<2?.30:i<4?.43:.20),y:height*(i<2?.245:i<4?0:-.27)});
  add(name,name,{path:'star',width:size,height:size},i%2?'cef4ff00':'fff2bc00',true);
  impactBones[name]={scale:[{time:0,x:0,y:0},{time:start,x:0,y:0},{time:start+.07,x:1,y:1},{time:start+.35,x:0,y:0}],rotate:[{time:0,value:-18},{time:.85,value:40}]};
  impactSlots[name]={alpha:[{time:0,value:0},{time:start,value:0},{time:start+.07,value:1},{time:start+.35,value:0},{time:.85,value:0}]};
  const idle=.2+i*.47;idleBones[name]={scale:[{time:0,x:0,y:0},{time:idle,x:0,y:0},{time:idle+.12,x:.6,y:.6},{time:idle+.42,x:0,y:0},{time:3.6,x:0,y:0}],rotate:[{time:0,value:-12},{time:3.6,value:50}]};
  idleSlots[name]={alpha:[{time:0,value:0},{time:idle,value:0},{time:idle+.12,value:.85},{time:idle+.42,value:0},{time:3.6,value:0}]};
 }
 for(const slot of slots.filter(s=>!/^confetti|^glint|^burst/.test(s.name))){const opacity=parseInt(slot.color.slice(6),16)/255;arrivalSlots[slot.name]={alpha:[{time:0,value:0},{time:.14,value:opacity},{time:.4,value:opacity}]};}
 return {skeleton:{spine:'4.2.22',x:-width/2,y:-height/2,width,height},bones,slots,skins:[{name:'default',attachments}],animations:{arrive:{bones:arrivalBones,slots:arrivalSlots},charge:{bones:chargeBones,slots:chargeSlots},impact:{bones:impactBones,slots:impactSlots},idle:{bones:idleBones,slots:idleSlots},held:{}}};
}

/** Side fountains sit behind the result cards. Their ballistic, tumbling keys
 * use the same atlas; they do not tint the card artwork or the win amount. */
export function buildResultWinFountainsJson(width:number,height:number,low=false){
 const bones:Bone[]=[{name:'root'}],slots:Slot[]=[],attachments:Record<string,Record<string,Region>>={};
 const movement:Record<string,Motion>={},alpha:Record<string,{alpha:Key[]}>={};
 for(let i=0;i<(low?12:36);i++){
  const name=`fountain-${i}`,side=i%2?1:-1,seed=((i*17)%31)/31,delay=(i%6)*.025,size=4+seed*7;
  bones.push({name,parent:'root',x:side*width*(.38+seed*.055),y:-height*.07,rotation:i*31});
  slots.push({name,bone:name,attachment:name,color:`${['ffe59b','dffbff','62d4ff'][i%3]}00`});
  attachments[name]={[name]:{path:i%6?'shard':'star',width:size,height:size*(i%6?1.5:1)}};
  const translate:Key[]=[],rotate:Key[]=[],scale:Key[]=[];
  for(let f=0;f<=24;f++){const t=f/16;translate.push({time:delay+t,x:side*width*(.025*t+Math.sin(t*3+seed)*.012),y:height*((.44+seed*.15)*t-.57*t*t)});rotate.push({time:delay+t,value:side*(180+seed*280)*t});scale.push({time:delay+t,x:Math.cos(t*(7+seed*5)),y:1});}
  movement[name]={translate,rotate,scale};alpha[name]={alpha:[{time:0,value:0},{time:delay,value:0},{time:delay+.035,value:1},{time:.88,value:.95},{time:1.5,value:0},{time:1.7,value:0}]};
 }
 return {skeleton:{spine:'4.2.22'},bones,slots,skins:[{name:'default',attachments}],animations:{impact:{bones:movement,slots:alpha},held:{}}};
}
