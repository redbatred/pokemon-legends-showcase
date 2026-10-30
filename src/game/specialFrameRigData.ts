export const SPECIAL_FRAME_ATLAS=`special-frame.png
size: 256,256
filter: Linear,Linear
pma: false
corner
  bounds: 0,0,64,64
star
  bounds: 64,0,64,64
bloom
  bounds: 0,64,128,128
`;
/** Constant-speed highlights follow the rounded card perimeter; the wrap is the same pose. */
function perimeter(t:number){
 const r=14,x=164,y=225.5,a=x-r,b=y-r,arc=Math.PI*r/2,length=4*(a+b)+4*arc;
 let d=((t%1)+1)%1*length;
 const segments=[2*a,arc,2*b,arc,2*a,arc,2*b,arc];let i=0;while(i<7&&d>segments[i])d-=segments[i++];
 const u=d/segments[i];
 if(i===0)return {x:-a+2*a*u,y};if(i===2)return {x,y:b-2*b*u};if(i===4)return {x:a-2*a*u,y:-y};if(i===6)return {x:-x,y:-b+2*b*u};
 const angle=(Math.PI/2)*(1-(i-1)/2-u),cx=i===1||i===3?a:-a,cy=i===1||i===7?b:-b;
 return {x:cx+Math.cos(angle)*r,y:cy+Math.sin(angle)*r};
}
export function buildSpecialFrameRigJson(low=false){
 const bones:{name:string;parent?:string;x?:number;y?:number;rotation?:number}[]=[{name:'root'}];
 const slots:{name:string;bone:string;attachment:string;blend:string;color:string}[]=[],attachments:Record<string,Record<string,{path:string;width:number;height:number}>>={};
 const motion:Record<string,unknown>={},alpha:Record<string,unknown>={};const duration=4.8;
 const add=(name:string,path:string,w:number,h:number,x=0,y=0,rotation=0,color='a4edff')=>{bones.push({name,parent:'root',x,y,rotation});slots.push({name,bone:name,attachment:name,blend:'additive',color:color+'ff'});attachments[name]={[name]:{path,width:w,height:h}};};
 for(let i=0;i<4;i++){
  const x=i%2?158:-158,y=i<2?219:-219,name='corner'+i;add(name,'corner',42,42,x,y,[0,-90,90,180][i]);
  motion[name]={scale:[{x:1,y:1},{time:1.2,x:1.1,y:1.1},{time:2.4,x:1,y:1},{time:3.6,x:1.06,y:1.06},{time:duration,x:1,y:1}]};
  alpha[name]={alpha:[{value:.5},{time:1.2,value:.95},{time:2.4,value:.5},{time:3.6,value:.8},{time:duration,value:.5}]};
 }
 const count=low?4:8,half=count/2;
 for(let i=0;i<count;i++){
  const phase=(i<half?0:.5)+(i%half)*.018,head=i%half===0,name='spark'+i;
  add(name,head?'star':'bloom',head?23:32,head?23:32,0,0,0,head?'ffffff':'a4edff');
  motion[name]={translate:Array.from({length:97},(_,n)=>({time:duration*n/96,...perimeter(n/96-phase)}))};
  alpha[name]={alpha:[{value:head?1:.22-(i%half)*.035},{time:duration,value:head?1:.22-(i%half)*.035}]};
 }
 return {skeleton:{spine:'4.2.22'},bones,slots,skins:[{name:'default',attachments}],animations:{surround:{bones:motion,slots:alpha}}};
}
