export const BALL_HIT=1.12;
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
/** A parabolic world-space throw projected through depth, rather than eased screen coordinates. */
export function ballFlight(time:number,skyY:number){
 const t=Math.max(0,Math.min(BALL_HIT,time)),u=t/BALL_HIT,focal=620,z=2750*(1-u),perspective=focal/(focal+z);
 const startY=Math.min(-760,skyY-280),gravity=1120,velocity=(-98-startY-.5*gravity*BALL_HIT*BALL_HIT)/BALL_HIT;
 const worldY=startY+velocity*t+.5*gravity*t*t;
 return {x:610*(1-u)*perspective,y:-185+(worldY+185)*perspective,scale:.72*perspective,rotation:-.27+u*.39};
}
export function ballLandingPlan(skyY=-500,floor=220){
 const end=ballFlight(BALL_HIT,skyY),before=ballFlight(BALL_HIT-.001,skyY);
 // The paper collision dissipates energy but never reverses the through-card tangent.
 const vx=(end.x-before.x)/.001*.17,vy=(end.y-before.y)/.001*.34,gravity=1120;
 const contact=(-vy+Math.sqrt(vy*vy+2*gravity*(floor+98)))/gravity;
 const impact=vy+gravity*contact,reboundVelocity=impact*.24,bounceGravity=1250;
 const settled=contact+2*reboundVelocity/bounceGravity;
 return {vx,vy,gravity,contact,impact,reboundVelocity,bounceGravity,settled,floor};
}
/** Both audible contacts and the latch share the same physical plan as the rendered fall. */
export function ballRevealCues(plan:ReturnType<typeof ballLandingPlan>){return {first:BALL_HIT+plan.contact,second:BALL_HIT+plan.settled,latch:BALL_HIT+plan.settled+.12,open:BALL_HIT+plan.settled+.24};}
/** One ballistic rebound with drag; the lid may open only after `settled`. */
export function ballLanding(time:number,skyY=-500,floor=220){
 const t=Math.max(0,time),p=ballLandingPlan(skyY,floor),f=Math.min(t,p.contact),u=clamp(f/p.contact),x=p.vx*f*(1-u*.22);
 if(t<=p.contact)return {x,y:-98+p.vy*t+.5*p.gravity*t*t,scale:.72,rotation:.12+t*.68};
 const rebound=Math.min(t-p.contact,p.settled-p.contact),v=clamp(rebound/(p.settled-p.contact)),a=p.vx*p.contact*.78;
 return {x:a+p.vx*.17*rebound,y:Math.min(floor,floor-p.reboundVelocity*rebound+.5*p.bounceGravity*rebound*rebound),scale:.72,rotation:(.12+p.contact*.68)*(1-v)*(1-v)};
}
