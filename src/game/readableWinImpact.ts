import {smooth} from './winCinemaMotion';
/** Keep opaque cels at foot contact; the lens and lighting carry the screen-wide force. */
export function readableWinImpact(w:number,h:number,after:number,finisher:boolean,titleY=h*.65){
 const spread=smooth(after/.72),size=Math.min(w*(finisher?.23:.19),h*.11);
 return {y:Math.min(h*.535,titleY-size/2-h*.045),size,alpha:.88*(1-smooth((after-.035)/.36)),sideX:w*(.08+spread*.48),sideY:h*(.54-spread*.035),sideSize:Math.min(w*.24,h*.14),sideAlpha:finisher?smooth(after/.08)*(1-smooth((after-.13)/.65))*.72:0};
}
