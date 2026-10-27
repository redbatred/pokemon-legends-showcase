const clamp=(n:number)=>Math.max(0,Math.min(1,n));
/** Only the original cyan emitters can contribute light. Court paint and chassis are excluded. */
export function stageEmissionStrength(r:number,g:number,b:number,u:number,v:number){
  if(v<.245||v>.725)return 0;
  const radius=((u-.5)/.409)**2+((v-.485)/.213)**2,dx=Math.abs(u-.5);
  const socket=((dx-.226)/.029)**2+((v-.305)/.023)**2<1||((dx-.343)/.029)**2+((v-.61)/.023)**2<1;
  if(!(radius>.82&&radius<1.15||socket))return 0;
  return clamp((g-160)/42)*clamp((b-r-48)/65)*clamp((g-r-35)/60)*clamp((g/b-.65)/.2);
}

/** The white inner Poké Ball ring is an emitter; the larger painted court stays neutral. */
export function centerEmissionStrength(r:number,g:number,b:number,u:number,v:number){
 const radius=((u-.498)/.080)**2+((v-.454)/.052)**2;
 if(radius<.50||radius>1.10)return 0;
 return clamp((Math.min(r,g,b)-175)/45);
}
