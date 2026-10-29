/** Bounded horizontal gesture state; card inspection remains a tap until movement is intentional. */
export class TrayPan {
 offset=0;max=0;dragged=false;private active=false;private x=0;private origin=0;private previous=0;private time=0;private velocity=0;
 configure(max:number,offset=this.offset){this.max=Math.max(0,max);this.offset=this.clamp(offset);}
 start(x:number,time:number){this.active=true;this.dragged=false;this.x=x;this.origin=this.previous=this.offset;this.time=time;this.velocity=0;}
 move(x:number,time:number){if(!this.active)return;const delta=this.x-x;if(!this.dragged&&Math.abs(delta)<6)return;this.dragged=true;this.offset=this.clamp(this.origin+delta);const dt=Math.max(8,time-this.time);this.velocity=(this.offset-this.previous)/dt;this.previous=this.offset;this.time=time;}
 end(){this.active=false;return this.clamp(this.offset+this.velocity*170);}
 cancel(){this.active=false;this.velocity=0;this.dragged=false;}
 private clamp(value:number){return Math.max(0,Math.min(this.max,value));}
}
