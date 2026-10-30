/** Card art is independent of the heavier actor; ownership transfers only when the stage adopts it. */
export class RevealPreparation<T,S extends {destroy():void}> {
 readonly ready:Promise<void>;private cancelled=false;private actor:S|null=null;
 constructor(readonly texture:Promise<T>,build:(texture:T)=>Promise<S|null>){
  this.ready=texture.then(async texture=>{
   if(this.cancelled)return;const actor=await build(texture);
   if(this.cancelled)actor?.destroy();else this.actor=actor;
  });
  // The card loader still reports its error to reveal(); background preparation must not reject unobserved.
  void this.ready.catch(()=>{});
 }
 async takeSpecial(){await this.ready;const actor=this.actor;this.actor=null;return actor;}
 cancel(){this.cancelled=true;this.actor?.destroy();this.actor=null;}
}
