export const BALL_HIT=1.08;
/** A parabolic world-space throw projected through depth, rather than eased screen coordinates. */
export function ballFlight(time:number,skyY:number){
 const t=Math.max(0,Math.min(BALL_HIT,time)),u=t/BALL_HIT,focal=620,z=2750*(1-u),perspective=focal/(focal+z);
 const startY=Math.min(-760,skyY-280),gravity=1450,velocity=(-98-startY-.5*gravity*BALL_HIT*BALL_HIT)/BALL_HIT;
 const worldY=startY+velocity*t+.5*gravity*t*t;
 return {x:610*(1-u)*perspective,y:-185+(worldY+185)*perspective,scale:.72*perspective,rotation:-.27+u*.39};
}
/** Card contact loses energy; gravity carries the ball to one small floor rebound. */
export function ballLanding(time:number){
 const t=Math.max(0,time),contact=.53,floor=174;
 if(t<=contact){const gravity=1350,v=(floor+98-.5*gravity*contact*contact)/contact;return {x:70*t/contact,y:-98+v*t+.5*gravity*t*t,rotation:.12+t*.9};}
 const rebound=t-contact,g=1050,v=-145;
 return {x:70+Math.min(rebound,.28)*20,y:Math.min(floor,floor+v*rebound+.5*g*rebound*rebound),rotation:.6-Math.min(1,rebound/.28)*.6};
}
