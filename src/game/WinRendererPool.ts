import {WebGLRenderer} from 'three';
type Lease={renderer:WebGLRenderer;low:boolean;generation:number};
/** Retain at most two idle contexts; active scenes always have separate canvases. */
export class WinRendererPool{
 private idle:Lease[]=[];private generation=0;
 constructor(private create=(low:boolean)=>new WebGLRenderer({antialias:!low,alpha:true,preserveDrawingBuffer:true,powerPreference:'high-performance'})){}
 take(low:boolean):Lease{const index=this.idle.findIndex(item=>item.low===low);return index>=0?this.idle.splice(index,1)[0]:{renderer:this.create(low),low,generation:this.generation};}
 release(lease:Lease){lease.renderer.renderLists.dispose();if(lease.generation===this.generation&&this.idle.length<2)this.idle.push(lease);else this.dispose(lease);}
 clear(){this.generation++;for(const lease of this.idle)this.dispose(lease);this.idle=[];}
 private dispose(lease:Lease){lease.renderer.dispose();lease.renderer.forceContextLoss();}
}
export const winRenderers=new WinRendererPool();
