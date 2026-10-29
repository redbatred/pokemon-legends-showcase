/** A skip belongs to one card, including its loading, turn and Pokémon stages. */
export class RevealCompletion {
 requested=false;private active=false;private finishStep:(()=>void)|null=null;
 begin(){this.end();this.requested=false;this.active=true;}
 request(){if(!this.active)return false;this.requested=true;this.finishStep?.();return true;}
 bind(timeline:gsap.core.Timeline,settle:()=>void,done:()=>void){
  const finish=(skip:boolean)=>{if(this.finishStep!==skipStep)return;this.finishStep=null;if(skip){timeline.progress(1,true).pause();settle();}done();};
  const skipStep=()=>finish(true);this.finishStep=skipStep;
  timeline.eventCallback('onComplete',()=>finish(false));
  if(this.requested)skipStep();
 }
 end(){this.active=false;this.finishStep=null;}
}
