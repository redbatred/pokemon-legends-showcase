const rest={y:0,scaleX:1,scaleY:1,rotation:0,light:0};
/** Complete glyphs arrive and recoil on the score beat, then become still. */
export function digitKinetics(changeAge:number,hitAge:number,strength:number,index:number,reduced=false){
 if(reduced)return {...rest};
 const t=hitAge-index*.012,k=t>=0&&t<.55?Math.sin(t*24)*Math.exp(-t*9)*Math.min(1.5,strength):0;
 const fresh=changeAge>=0&&changeAge<.16?(1-changeAge/.16)**2:0;
 if(!k&&!fresh)return {...rest};
 return {y:-k*.09-fresh*.025,scaleX:1-k*.035,scaleY:1+k*.15,rotation:-k*.018,light:Math.max(fresh*.35,Math.max(0,k)*.75)};
}
