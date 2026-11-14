import type {Renderer} from 'pixi.js';
/** Work that must be drawn *before* the frame's main pass begins. The stage runs these right before it renders. */
type Job=(renderer:Renderer,width:number,height:number)=>void;
const jobs=new Set<Job>();
export function addBeforeFrame(job:Job){jobs.add(job);return ()=>{jobs.delete(job);};}
export function runBeforeFrame(renderer:Renderer,width:number,height:number){for(const job of jobs)job(renderer,width,height);}
