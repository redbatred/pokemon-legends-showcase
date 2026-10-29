/** Native Spine effects: the flight's ribbons stream behind its tangent; the release unfolds upward. */
export const BALL_FX_ATLAS=`ball-fx.png
size: 256,256
filter: Linear,Linear
pma: false
beam
  bounds: 0,0,240,32
arc
  bounds: 0,40,128,128
star
  bounds: 136,40,64,64
core
  bounds: 136,112,96,96
`;
type Key={time?:number;value?:number;x?:number;y?:number};
type Motion={translate?:Key[];rotate?:Key[];scale?:Key[]};
export function buildBallFxRigJson(low=false){
 const bones:{name:string;parent?:string;x?:number;y?:number;rotation?:number}[]=[{name:'root'}];
 const slots:{name:string;bone:string;attachment:string;color:string;blend:string}[]=[],attachments:Record<string,Record<string,{path:string;width:number;height:number;x?:number}>>={};
 const flightBones:Record<string,Motion>={},flightSlots:Record<string,{alpha:Key[]}>={},releaseBones:Record<string,Motion>={},releaseSlots:Record<string,{alpha:Key[]}>={};
 const add=(name:string,path:string,w:number,h:number,x=0,y=0,rotation=0,color='b6f5ff')=>{bones.push({name,parent:'root',x,y,rotation});slots.push({name,bone:name,attachment:name,color:color+'00',blend:'additive'});attachments[name]={[name]:{path,width:w,height:h}};};
 for(let i=0;i<(low?4:7);i++){
  const n='stream'+i,side=i%2?1:-1;add(n,'beam',90+i*16,2.5+i%3,-70-i*17,side*(8+i*3),side*3,i%3?'8cddff':'f6ffff');
  const y=side*(5+i*2);flightBones[n]={translate:[{x:0,y:-y},{time:.3,x:-16,y},{time:.6,x:0,y:-y}],scale:[{x:.75,y:.65},{time:.3,x:1.15,y:1},{time:.6,x:.75,y:.65}]};flightSlots[n]={alpha:[{value:.4},{time:.3,value:.8-i*.04},{time:.6,value:.4}]};
 }
 for(let i=0;i<2;i++){const n='orbit'+i;add(n,'arc',100+i*24,100+i*24,-8,0,i*180,'bcefff');flightBones[n]={rotate:[{value:0},{time:.6,value:360}],scale:[{x:1,y:.42},{time:.3,x:1.15,y:.46},{time:.6,x:1,y:.42}]};flightSlots[n]={alpha:[{value:.34}]};}
 add('nose','core',70,70,8,0,0,'dfffff');flightSlots.nose={alpha:[{value:.35},{time:.3,value:.65},{time:.6,value:.35}]};
 for(let i=0;i<(low?8:14);i++){
  const n='ray'+i,a=i/(low?8:14)*Math.PI*2,dx=Math.cos(a),dy=Math.sin(a);add(n,'beam',95+i%4*19,3+i%3,0,0,a*180/Math.PI,i%3?'a4eaff':'ffffff');
  releaseBones[n]={translate:[{x:dx*5,y:dy*5},{time:.09,x:dx*67,y:dy*67},{time:.4,x:dx*158,y:dy*158}],scale:[{x:.06,y:.1},{time:.08,x:1,y:1},{time:.4,x:.3,y:.05}]};releaseSlots[n]={alpha:[{value:0},{time:.035,value:.95},{time:.18,value:.6},{time:.4,value:0},{time:1.2,value:0}]};
 }
 for(let i=0;i<5;i++){
  const n='plume'+i,side=i-2,delay=.04+Math.abs(side)*.035;add(n,'beam',220-Math.abs(side)*22,12-Math.abs(side)*2,side*8,90,90+side*7,'d3f6ff');
  releaseBones[n]={translate:[{x:0,y:-80},{time:delay,x:0,y:-80},{time:delay+.25,x:side*9,y:45},{time:.85,x:side*17,y:110}],scale:[{x:.05,y:.1},{time:delay,x:.05,y:.1},{time:delay+.16,x:1,y:1},{time:.75,x:.35,y:.03}]};releaseSlots[n]={alpha:[{value:0},{time:delay,value:0},{time:delay+.08,value:.62},{time:.55,value:.3},{time:.85,value:0},{time:1.2,value:0}]};
 }
 for(let i=0;i<(low?4:9);i++){
  const n='spark'+i,side=i%2?1:-1,delay=.14+i*.045;add(n,'star',13+i%3*4,22+i%3*5,0,0,i*33,i%2?'b2edff':'ffffff');
  releaseBones[n]={translate:[{x:side*8,y:10},{time:delay,x:side*8,y:10},{time:delay+.4,x:side*(50+i*8),y:70+i*17},{time:1.2,x:side*(65+i*8),y:95+i*17}],scale:[{x:0,y:0},{time:delay,x:0,y:0},{time:delay+.1,x:1,y:1},{time:delay+.55,x:0,y:0}],rotate:[{value:0},{time:1.2,value:150}]};releaseSlots[n]={alpha:[{value:0},{time:delay,value:0},{time:delay+.1,value:.8},{time:delay+.55,value:0},{time:1.2,value:0}]};
 }
 add('openingCore','core',118,118,0,4,0,'efffff');releaseBones.openingCore={scale:[{x:.1,y:.1},{time:.08,x:1.4,y:.8},{time:.4,x:.5,y:.3},{time:.65,x:0,y:0}]};releaseSlots.openingCore={alpha:[{value:0},{time:.035,value:.85},{time:.3,value:.25},{time:.65,value:0},{time:1.2,value:0}]};
 return {skeleton:{spine:'4.2.22'},bones,slots,skins:[{name:'default',attachments}],animations:{flight:{bones:flightBones,slots:flightSlots},release:{bones:releaseBones,slots:releaseSlots}}};
}
