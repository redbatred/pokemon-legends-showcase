export const AUTO_SPIN_COUNTS=[5,10,15,20,30,50,75,100] as const;
export type AutoRevealMode='individual'|'all';
export type AutoAction='open'|'tear'|'next'|'all'|'continue';
/** A run owns unique settlements, never the bounded UI history or a saved timer. */
export class AutoSpinSession {
 running=true;completed=0;private settled=new Set<string>();
 constructor(readonly total:number,readonly mode:AutoRevealMode){
  if(!(AUTO_SPIN_COUNTS as readonly number[]).includes(total)||!['individual','all'].includes(mode))throw new Error('Invalid Auto Spin selection.');
 }
 stop(){this.running=false;}
 record(id:string){if(this.settled.has(id))return;this.settled.add(id);this.completed++;if(this.completed>=this.total)this.stop();}
 next(phase:string):AutoAction|null {
  if(!this.running)return null;
  switch(phase){case 'browse':return 'open';case 'sealed':return 'tear';case 'awaiting':case 'revealed':return this.mode==='all'?'all':'next';case 'complete':return 'continue';default:return null;}
 }
}
