export type ArenaBoardState={phase:string;packName:string;index:number;cardName?:string;cardValue?:number;special?:boolean};
/** Separate traced edges: the painted stadium is not perfectly symmetric. Pixel-sized bleed covers its blue seam. */
const upperLeft=[[230,522],[300,536],[350,545],[400,552],[450,558],[500,563],[550,567],[600,571],[650,573],[700,575],[740,576],[777,576.5]];
const lowerLeft=[[241,602],[300,604],[400,610],[500,615],[600,617],[700,619],[763,620]];
function sample(edge:number[][],x:number){if(x<=edge[0][0])return edge[0][1];if(x>=edge.at(-1)![0])return edge.at(-1)![1];const i=edge.findIndex(p=>p[0]>=x),a=edge[i-1],b=edge[i];return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);}
export function wallScreenPoint(side:0|1,t:number,v:number){
 const along=Math.max(0,Math.min(1,t)),level=Math.max(0,Math.min(1,v)),at=side?1-along:along,xt=230+at*547,xb=241+at*522;
 const x=xt+(xb-xt)*level,y=sample(upperLeft,xt)+(sample(lowerLeft,xb)-sample(upperLeft,xt))*level;
 // Right bay's outer top corner extends 4 px farther than the left bay's mirror.
 const correction=side?(1-at)*(4*(1-level)+1*level):0;
 const edgeBleed=side?0:4*(1-at)**5;return {u:(side?1672-x+correction:x-edgeBleed)/1672,v:(y-(side?0:2*(1-at)**5*(1-level)))/941};
}
export function arenaMessages(s:ArenaBoardState,cycle:number):[string,string,string,string]{
 if(s.phase==='showdown')return s.index>0?['CHARIZARD','CHALLENGER','MEWTWO',`${s.index} GUARDS REMAIN`]:['LEGENDARY SHOWDOWN','BATTLE COMPLETE','MEWTWO VSTAR','REWARD REVEALED'];
 const pack=s.packName.toUpperCase(),count=`CARD ${Math.min(11,s.index+1)} / 11`;
 if(s.phase==='sealed')return cycle%2?[pack,'PACK READY','CUT THE SEAL','DRAG ACROSS THE TOP']:[pack,'PACK READY','CUT THE SEAL','OR PRESS OPEN'];
 if(s.phase==='tearing')return [pack,'SEAL OPENING','ARENA READY','11 CARDS'];
 if(s.phase==='awaiting')return [pack,count,'READY TO REVEAL','TAP CARD OR NEXT'];
 if(s.phase==='revealing')return [pack,count,'REVEALING',''];
 if(s.phase==='revealed'&&s.cardName)return [s.cardName.toUpperCase(),count,`$${((s.cardValue??0)/100).toFixed(2)}`,s.special?'SPECIAL REVEAL':'CARD VALUE'];
 if(s.phase==='collecting'||s.phase==='settling')return [pack,'OPEN ALL','COLLECTING CARDS',''];
 if(s.phase==='complete')return [pack,'PACK COMPLETE','COLLECTION UPDATED',''];
 return cycle%2?[pack,'11 CARDS','CHOOSE YOUR PACK','POKÉMON LEAGUE']:['POKÉMON LEAGUE','PACK ARENA',pack,'11 CARDS'];
}

export function screenTextWindow(side:0|1,minU:number,maxU:number){
 const left=wallScreenPoint(side,0,.5).u,right=wallScreenPoint(side,1,.5).u,clamp=(v:number)=>Math.max(0,Math.min(1,v)),a=clamp((minU-left)/(right-left)),b=clamp((maxU-left)/(right-left));
 return {center:(a+b)/2,span:Math.max(.05,b-a)};
}

export type RibbonCaption=[title:string,detail:string];
/** Both former caption variants become consecutive entries in one repeating strip. */
export function ribbonMessages(state:ArenaBoardState):RibbonCaption[]{
 const captions:RibbonCaption[]=[],seen=new Set<string>();
 for(const cycle of [0,1]){const lines=arenaMessages(state,cycle);for(const i of [0,2]){const caption:RibbonCaption=[lines[i],lines[i+1]],key=JSON.stringify(caption);if(!seen.has(key)){seen.add(key);captions.push(caption);}}}
 return captions;
}

/** Align each bay's first caption with its visible portion; both share one phase. */
export function ribbonMapping(side:0|1,window:{center:number;span:number},span:number,count:number){
 const scale=1/(span*count);return {scale,origin:(side+.5)/count-window.center*scale};
}

/** Positive UV travel moves lettering left. Wrapping is a whole texture period. */
export function advanceRibbonOffset(offset:number,seconds:number,span:number,count:number,reduced:boolean){
 return reduced?offset:(offset+Math.max(0,seconds)*.06/(span*count))%1;
}
