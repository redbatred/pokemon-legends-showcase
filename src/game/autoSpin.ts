import type {Result} from './model';

export const AUTO_SPIN_COUNTS=[1,5,10,15,20,30,50,75,100] as const;
export type AutoRevealMode='individual'|'all';
export type AutoAction='open'|'tear'|'next'|'all'|'continue';
export interface AutoSpinView {id:string;running:boolean;completed:number;total:number;totalWon:number;results:readonly Result[];interlude:boolean}
export const autoInterludeDelay=(turbo:boolean,reduced:boolean)=>reduced?400:turbo?1200:1800;
export const openingAnimationRate=(turbo=false,automatic=false)=>turbo?4:automatic?1.65:1;

/** A run owns its exact settlements, independently of the bounded saved history. */
export class AutoSpinSession {
 readonly id=crypto.randomUUID();
 readonly results:Result[]=[];
 running=true;totalWon=0;private settled=new Set<string>();
 constructor(readonly total:number,readonly mode:AutoRevealMode){
  if(!(AUTO_SPIN_COUNTS as readonly number[]).includes(total)||!['individual','all'].includes(mode))throw new Error('Invalid Auto Spin selection.');
 }
 get completed(){return this.results.length;}
 stop(){this.running=false;}
 record(result:Result){
  if(this.settled.has(result.id))return false;
  this.settled.add(result.id);this.results.push(result);this.totalWon+=result.total;
  if(this.completed>=this.total)this.stop();
  return true;
 }
 next(phase:string,finishCurrent=false,turbo=false):AutoAction|null {
  if(!this.running&&!finishCurrent)return null;
  switch(phase){
   case 'browse':return this.running?'open':null;
   case 'sealed':return 'tear';
   case 'awaiting':case 'revealed':return this.mode==='all'&&turbo?'all':'next';
   case 'complete':return this.running?'continue':null;
   default:return null;
  }
 }
}
