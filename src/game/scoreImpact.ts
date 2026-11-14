import {smooth} from './winCinemaMotion';
/** The visible projectile touches the amount; force expands outward instead of obscuring it. */
export function scoreImpact(w:number,h:number,after:number,finisher:boolean,amountY:number){
 const spread=smooth(after/.60);
 return {y:amountY,size:Math.min(w*(finisher?.18:.14),h*.10),alpha:.95*(1-smooth(Math.max(0,after)/.14)),sideX:w*(.40+spread*.28),sideY:amountY-h*.01,sideSize:Math.min(w*.20,h*.12),sideAlpha:finisher?smooth(after/.055)*(1-smooth((after-.12)/.72))*.84:0};
}
