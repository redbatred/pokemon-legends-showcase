import type {Graphics} from 'pixi.js';
import type {PowerProfile} from './powerProfiles';
type PointAt=(u:number,v:number)=>[number,number];
const clamp=(v:number)=>Math.max(0,Math.min(1,v)),TAU=Math.PI*2;
/** Species move silhouettes. All geometry is finite and driven by the move's release clock. */
export function signatureEffect(g:Graphics,b:Graphics,p:PowerProfile,at:PointAt,age:number,a:number,low:boolean,floor:{x:number;y:number}){
 const c=p.color,l=p.light,u=clamp(age/.62),n=low?6:11;
 const shard=(x:number,y:number,r:number,angle:number,color:number,alpha:number)=>{const co=Math.cos(angle),si=Math.sin(angle);g.poly([x-co*r,y-si*r,x-si*r*.35,y+co*r*.35,x+co*r,y+si*r,x+si*r*.35,y-co*r*.35]).fill({color,alpha}).stroke({color:l,width:1.1,alpha:alpha*.8});};
 if(p.move==='crystals'||p.move==='gems'){
  for(let i=0;i<n;i++){const t=clamp((age-i*.025)/.52),d=25+t*210,spread=Math.sin(i*9.3)*(12+t*55),[x,y]=at(d,spread),r=(p.species==='aerodactyl'?15:9)+i%3*3;const alpha=a*(1-t*.65);
   g.moveTo(...at(Math.max(0,d-27),spread)).lineTo(x,y).stroke({color:c,width:2,alpha:alpha*.3});shard(x,y,r,age*5+i,p.move==='gems'?[c,0x7beedc,0xf4b2e7][i%3]:i%3?c:l,alpha);
  }return true;
 }
 if(p.move==='seeds'||p.move==='drain'){
  for(let i=0;i<(low?4:7);i++){const t=clamp((age-i*.045)/.5),d=p.move==='drain'?200*(1-t):20+t*210,spread=Math.sin(t*Math.PI)*(i%2?1:-1)*(20+i*6),[x,y]=at(d,spread),r=5+i%3*2;g.circle(x,y,r*1.5).fill({color:c,alpha:a*.12}).circle(x,y,r).fill({color:i%2?c:l,alpha:a*(1-t*.5)});g.moveTo(...at(d-16,spread)).lineTo(x,y).stroke({color:l,width:1.5,alpha:a*.65});}return true;
 }
 if(p.move==='slash'||p.move==='kick'||p.move==='punch'){
  const count=p.move==='slash'?2:p.move==='punch'?3:1;
  for(let i=0;i<count;i++){const t=clamp((age-i*.07)/.4),d=30+t*165,span=(p.move==='kick'?72:44)*(1-t*.3),v=(i-(count-1)/2)*25,side=i%2?-1:1;
   const start=at(d-55,v-side*span),mid=at(d+30,v),end=at(d-42,v+side*span),inside=at(d+7,v);g.moveTo(...start).quadraticCurveTo(...mid,...end).quadraticCurveTo(...inside,...start).fill({color:c,alpha:a*(1-t*.7)}).stroke({color:l,width:2,alpha:a});
   if(p.move==='punch'){const [x,y]=at(d,v);for(let j=0;j<4;j++){const angle=j/4*TAU+age*6;g.moveTo(x+Math.cos(angle)*14,y+Math.sin(angle)*14).lineTo(x+Math.cos(angle)*30,y+Math.sin(angle)*30).stroke({color:l,width:1.6,alpha:a*(1-t)});}}
  }return true;
 }
 if(p.move==='dive'){
  // A tapered rush of cel ribbons follows the body; no spring-shaped beam.
  for(let i=0;i<5;i++){const side=i%2?-1:1,v=side*(16+i*8),d=25+u*80,start=at(d-60,v*.7),tip=at(d+145,v*.25),control=at(d+45,v*2.1),inner=at(d+37,v*1.4);b.moveTo(...start).quadraticCurveTo(...control,...tip).quadraticCurveTo(...inner,...start).fill({color:i%2?c:l,alpha:a*(.5-i*.045)});}
  for(let i=0;i<7;i++){const t=(u+i*.137)%1,d=15+t*210,v=Math.sin(i*17.3)*(15+t*55);g.moveTo(...at(d-30,v)).lineTo(...at(d,v)).stroke({color:i%2?c:l,width:1.7,alpha:a*(1-t)*.75});}return true;
 }
 if(p.move==='vortex'||p.move==='gyro'){
  const reach=p.move==='gyro'?115:220,rows=p.move==='gyro'?6:9;
  for(let i=0;i<rows;i++){const t=(u+i/rows)%1,d=20+t*reach,r=(p.move==='gyro'?43:19)+t*29,angle=age*13+i*.7,pts:number[]=[];for(let j=0;j<=16;j++){const q=j/16,theta=angle+q*Math.PI*1.4;pts.push(...at(d+Math.cos(theta)*r*.36,Math.sin(theta)*r));}g.poly(pts,false).stroke({color:i%3?c:l,width:p.kind==='fire'?5.5:2.5,alpha:a*(1-t*.7)*.8});}
  return true;
 }
 if(p.move==='firestar'||p.move==='moon'){
  const [x,y]=at(25+u*180,0),r=20+u*(p.move==='moon'?19:30);
  if(p.move==='firestar'){const pts:number[]=[];for(let i=0;i<10;i++){const angle=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.28:r;pts.push(x+Math.cos(angle)*rr,y+Math.sin(angle)*rr);}g.poly(pts).fill({color:c,alpha:a}).stroke({color:0xffe49c,width:3,alpha:a});}
  else{g.circle(x,y,r*1.25).fill({color:c,alpha:a*.12}).circle(x,y,r).fill({color:c,alpha:a*.9}).circle(x-r*.15,y-r*.2,r*.7).fill({color:l,alpha:a*.9});for(let i=0;i<5;i++){const an=i/5*TAU+age*3;shard(x+Math.cos(an)*r*1.4,y+Math.sin(an)*r*1.4,5,an,l,a*.7);}}
  return true;
 }
 if(p.move==='quake'){
  const {x,y}=floor;for(let i=0;i<n;i++){
   const angle=i/n*TAU,r=76+u*138,xx=x+Math.cos(angle)*r,yy=y+Math.sin(angle)*r*.25,seed=Math.sin(i*16.7),opacity=a*(1-u*.8),rise=Math.sin(u*Math.PI)*(35+i%3*17),size=(10+i%3*5)*Math.min(1,age*18);
   b.moveTo(x+Math.cos(angle)*32,y+Math.sin(angle)*9).lineTo(xx+seed*11,yy-5).lineTo(xx,yy).lineTo(xx+Math.cos(angle)*31,yy+Math.sin(angle)*10).stroke({color:0x26354b,width:5,alpha:opacity*.8}).stroke({color:c,width:1.5,alpha:opacity});
   b.ellipse(xx,yy,size*.9,size*.2).fill({color:0x071b31,alpha:opacity*.22});
   const ry=yy-rise,points=[xx-size,ry-size*.3,xx-size*.35,ry-size,xx+size*.65,ry-size*.66,xx+size,ry+size*.45,xx-size*.3,ry+size*.8];
   g.poly(points).fill({color:0x6c7d8e,alpha:opacity}).stroke({color:0x26364b,width:1.5,alpha:opacity});
   g.poly([xx-size*.35,ry-size,xx+size*.65,ry-size*.66,xx+size*.3,ry,xx-size,ry-size*.3]).fill({color:0xb0c7d6,alpha:opacity});
   g.moveTo(xx-size*.35,ry-size).lineTo(xx+size*.65,ry-size*.66).lineTo(xx+size,ry+size*.45).stroke({color:l,width:1.2,alpha:opacity*.85});
   b.moveTo(xx,yy-3).lineTo(xx-seed*5,ry+size*1.7).stroke({color:c,width:1.8,alpha:opacity*.45});
  }return true;
 }
 if(p.move==='thunder'){
  const [x,y]=at(80,0),seed=Math.floor(age*18),pts:number[]=[];for(let i=0;i<9;i++){const t=i/8;pts.push(x+Math.sin(i*7.2+seed)*(i===8?0:20),y-150+t*180);}g.poly(pts,false).stroke({color:c,width:15,alpha:a*.13}).poly(pts,false).stroke({color:c,width:7,alpha:a}).poly(pts,false).stroke({color:l,width:2.2,alpha:a});for(let i=0;i<6;i++){const an=i/6*TAU;g.moveTo(x,y+28).lineTo(x+Math.cos(an)*(30+u*45),y+28+Math.sin(an)*(15+u*25)).stroke({color:l,width:2,alpha:a*(1-u*.6)});}return true;
 }
 if(['origin','voice','darkpulse'].includes(p.move)){
  for(let i=0;i<(p.move==='origin'?3:4);i++){const t=clamp((age-i*.07)/.5),[x,y]=at(15+t*180,(i%2?1:-1)*(p.move==='origin'?26:0)),r=12+t*42;g.ellipse(x,y,r*.65,r).stroke({color:c,width:p.move==='origin'?9:5,alpha:a*(1-t*.7)}).ellipse(x,y,r*.65,r).stroke({color:l,width:1.5,alpha:a*(1-t*.6)});if(p.move==='voice')shard(x,y,6,age*2+i,l,a*(1-t));}return true;
 }
 return false;
}
