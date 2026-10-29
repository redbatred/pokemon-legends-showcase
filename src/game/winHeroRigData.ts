/** Native Spine coronas frame the Pokémon; the center stays clear for its silhouette. */
export function buildWinHeroRigJson(epic=false){
 const bones:any[]=[{name:'root'}],slots:any[]=[],attachments:Record<string,any>={},motion:Record<string,any>={},colors:Record<string,any>={},idle:Record<string,any>={},idleColors:Record<string,any>={};
 for(const side of [-1,1])for(const layer of [0,1]){
  const name=`corona${side<0?'Left':'Right'}${layer}`,vertices:number[]=[],uvs:number[]=[],triangles:number[]=[],rows=49;
  for(let i=0;i<rows;i++){const p=i/(rows-1),x=side*(178+Math.sin(p*Math.PI)*75+layer*16),y=-170+p*440,width=Math.sin(p*Math.PI)**.65*(layer?3:epic?14:10);
   for(const edge of [-1,1]){vertices.push(x+width*edge,y);uvs.push((edge+1)/2,p);}if(i<rows-1){const a=i*2;triangles.push(a,a+1,a+2,a+1,a+3,a+2);}}
  bones.push({name,parent:'root'});slots.push({name,bone:name,attachment:name,color:layer?'fff4c900':'8feeff00',blend:'additive'});
  attachments[name]={[name]:{type:'mesh',path:'ribbon',width:32,height:64,uvs,vertices,triangles,hull:rows*2}};
  motion[name]={scale:[{x:.4,y:.65},{time:.12,x:.4,y:.65},{time:.56,x:1.08,y:1.04},{time:.88,x:1,y:1},{time:2.5,x:1,y:1}],rotate:[{value:side*14},{time:.6,value:-side*2},{time:1,value:0}],translate:[{y:-65},{time:.65,y:8},{time:1,y:0}]};
  colors[name]={alpha:[{value:0},{time:.12,value:0},{time:.4,value:layer?.9:.75},{time:.9,value:.3},{time:1.9,value:.3},{time:2.05,value:.8},{time:2.5,value:.28}]};
  idle[name]={scale:[{x:1,y:1},{time:1.4,x:1.025,y:1.015},{time:2.8,x:1,y:1}]};
  idleColors[name]={alpha:[{value:.28},{time:1.4,value:layer?.48:.38},{time:2.8,value:.28}]};
 }
 for(let i=0;i<(epic?12:8);i++){
  const name=`energy${i}`,side=i%2?1:-1,delay=.3+i*.07,x=side*(205+(i%3)*22),y=-130+(i%4)*95;
  bones.push({name,parent:'root',x,y});slots.push({name,bone:name,attachment:name,color:i%3?'b9f7ff00':'fff1b800',blend:'additive'});attachments[name]={[name]:{path:'star',width:i%3?12:20,height:i%3?18:28}};
  motion[name]={translate:[{y:-30},{time:delay,y:-30},{time:delay+.55,y:40},{time:2.5,y:105}],scale:[{x:0,y:0},{time:delay,x:0,y:0},{time:delay+.14,x:1,y:1},{time:delay+.7,x:0,y:0}],rotate:[{value:-25},{time:2.5,value:60}]};
  colors[name]={alpha:[{value:0},{time:delay,value:0},{time:delay+.14,value:.85},{time:delay+.7,value:0},{time:2.5,value:0}]};
  idle[name]={scale:[{x:0,y:0},{time:delay,x:0,y:0},{time:delay+.18,x:.7,y:.7},{time:delay+.65,x:0,y:0},{time:2.8,x:0,y:0}]};idleColors[name]={alpha:[{value:0},{time:delay,value:0},{time:delay+.18,value:.55},{time:delay+.65,value:0},{time:2.8,value:0}]};
 }
 return {skeleton:{spine:'4.2.22',x:-300,y:-180,width:600,height:500},bones,slots,skins:[{name:'default',attachments}],animations:{celebrate:{bones:motion,slots:colors},idle:{bones:idle,slots:idleColors}}};
}
