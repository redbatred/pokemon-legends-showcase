import {smooth,WIN_CINEMA_FINISH} from './winCinemaMotion';
import {winTierProfile,type CinemaTier} from './winChoreography';
/** Contact changes the composition; the victory shot stays held until the player advances. */
export function winFinalePresentation(age:number,tier:CinemaTier,exitAge=0,reduced=false){
 const rank=winTierProfile(tier).rank,victory=smooth((age-WIN_CINEMA_FINISH)/.72),release=1-smooth(exitAge/.62);
 return {victory:victory*release,heroZoom:reduced?0:victory*release*(.025+rank*.012),aimDrop:reduced?0:victory*release*.08,night: victory*release*(.72+rank*.035)};
}
/** A brief centre-out landing belongs to the strike, then becomes completely still. */
export function winTitleLetter(landing:number,index:number,count:number,reduced=false){
 const delay=reduced?0:Math.abs(index-(count-1)/2)*.008,t=landing-delay,enter=smooth(t/.095),settle=smooth((t-.095)/.36);
 return {alpha:enter,scale:reduced?1:1+(1-enter)*.55+Math.sin(settle*Math.PI)*.08,y:reduced||enter===1?0:(1-enter)*-.045,rotation:reduced?-.035:-.035+(1-enter)*(index<(count-1)/2?-.09:.09)};
}
