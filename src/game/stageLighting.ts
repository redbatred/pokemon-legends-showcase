const clamp=(n:number)=>Math.max(0,Math.min(1,n));
/** Only the original cyan emitters can contribute light. Court paint and chassis are excluded. */
export function stageEmissionStrength(r:number,g:number,b:number,u:number,v:number){
  if(v<.245||v>.725)return 0;
  const radius=((u-.5)/.409)**2+((v-.485)/.213)**2,dx=Math.abs(u-.5);
  const socket=((dx-.226)/.029)**2+((v-.305)/.023)**2<1||((dx-.343)/.029)**2+((v-.61)/.023)**2<1;
  if(!(radius>.82&&radius<1.15||socket))return 0;
  return clamp((g-160)/42)*clamp((b-r-48)/65)*clamp((g-r-35)/60)*clamp((g/b-.65)/.2);
}

/** The whole white Poké Ball emblem emits, including its large circle and crossbar. */
export function centerEmissionStrength(r:number,g:number,b:number,u:number,v:number){
 const radius=((u-.5)/.303)**2+((v-.471)/.171)**2;
 if(radius>1.12||v<.29||v>.66)return 0;
 return clamp((Math.min(r,g,b)-180)/40)*clamp(1-(Math.max(r,g,b)-Math.min(r,g,b))/75);
}

/** Broad light keeps the sampled hue. Only the narrow highlight approaches white. */
export function stageLightColor(color:number,slot:string){
 const white=slot==='rimHighlight'?.7:slot==='centerWhite'?.5:['rimCore','centerCore'].includes(slot)?.12:0;
 return [color>>16&255,color>>8&255,color&255].map(c=>white+(1-white)*c/255);
}
export function stageLightLevel(slot:string,impact:number,charge:number){
 const levels:Record<string,number>={rimCore:.88,rimBloom:.85,rimHighlight:.42,centerCore:.9,centerBloom:.8,centerWhite:.54,pool:.12,source:.14,beamLeft:.23,beamRight:.11};
 const level=levels[slot]??.42;
 return level*(charge>=0?.12+charge*charge*.88:1+impact*.18);
}
