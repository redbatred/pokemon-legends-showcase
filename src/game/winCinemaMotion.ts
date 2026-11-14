/** One clock drives camera, skeletal action, effects, typography and count. */
export const WIN_CINEMA_IMPACT=1.72;
export const WIN_CINEMA_FINISH=6.12;
export const FINAL_STRIKE_RELEASE=5.78;
export const WIN_RETURN_DURATION=1.04;
export const WIN_CINEMA_BEATS=[2.65,3.55,4.55,6.12];
export const unit=(v:number)=>Math.max(0,Math.min(1,v));
export const smooth=(v:number)=>{const t=unit(v);return t*t*(3-2*t);};
export function winCinemaPose(age:number,exitAge=0,tier='mega'){
 // Every count burst belongs to a strike. The last burst arrives at the finisher.
 const stops=tier==='big'?[[1.78,2.35,.32],[3.55,4.02,.68],[5.91,6.12,1]]:[[1.78,2.35,.18],[3.55,4.02,.43],[4.55,4.98,.70],[5.91,6.12,1]];
 let count=0,pulse=0;
 for(let i=0;i<stops.length;i++){
  const [start,end,target]=stops[i],previous=i?stops[i-1][2]:0;
  if(i===stops.length-1&&age<end)continue;
  if(age>=start)count=previous+(target-previous)*smooth((age-start)/(end-start));
  const strike=i===stops.length-1?end:start;
  if(age>=strike)pulse+=Math.sin(Math.min(1,(age-strike)/.26)*Math.PI)*Math.exp(-(age-strike)*5)*(.07+i*.025);
 }
 return {count,alpha:1-smooth((exitAge-.78)/.26),amountAlpha:smooth((age-1.76)/.12)*(1-.97*smooth((age-5.22)/.08)*(1-smooth((age-5.60)/.08))),titleAlpha:smooth((age-WIN_CINEMA_FINISH)/.12),amountPulse:pulse+(age>=WIN_CINEMA_FINISH?.16*Math.exp(-(age-WIN_CINEMA_FINISH)*6):0),enter:smooth(age/.58)};
}
/** Measured ink of the battle lettering, per pixel of font size, from each text's anchor. */
export const AWARD_INK={amountTop:.21,amountBottom:.64,titleTop:.32,titleBottom:.56,titleShadow:15};
/** Bottom-up stack: prompt, amount, then the title rows. Each block sits on the measured ink of the one below, so text never overlaps at any aspect. */
export function winCinemaGeometry(w:number,h:number,legendary=false,age=0,letters=legendary?13:8){
 const portrait=h>w*.85,unitSize=Math.min(w,h*1.2),reveal=smooth((age-WIN_CINEMA_FINISH-.10)/.55),ink=AWARD_INK,gap=Math.max(6,h*.014);
 const promptSize=Math.max(10,Math.min(14,w*.02)),promptY=h-Math.max(15,h*.042),amountWidth=w*.72;
 const size=Math.min(unitSize*(.195+reveal*.04),h*.24),amountY=promptY-promptSize*.75-gap-size*ink.amountBottom,amountTop=amountY-size*ink.amountTop;
 // LEGENDARY WIN splits over two rows only where a single row would be too small to read.
 const stacked=legendary&&portrait,block=(bottom:number,font:number)=>bottom-ink.titleShadow-font*ink.titleBottom;
 const rows=stacked?[Math.min(w*.2,h*.15),Math.min(w*.21,h*.16)]:[Math.min(unitSize*.25*(legendary?1.14:1.07),w*.90/(letters*.49),h*.21)];
 const lastY=block(amountTop-gap,rows[rows.length-1]),firstY=stacked?block(lastY-rows[1]*ink.titleTop+rows[0]*.05,rows[0]):lastY;
 const bannerSize=Math.min(w*.135,h*.085),bannerY=block(amountTop-gap*.6,bannerSize)+ink.titleShadow*.4;
 return {x:w/2,portrait,stacked,titleY:firstY,titleRows:stacked?[{y:firstY,size:rows[0]},{y:lastY,size:rows[1]}]:[{y:lastY,size:rows[0]}],titleSize:rows[0],amountY,amountCentreY:amountY+size*(ink.amountBottom-ink.amountTop)/2,size,amountWidth,bannerY,bannerSize,promptY,promptSize,width:unitSize*.9,height:h};
}
