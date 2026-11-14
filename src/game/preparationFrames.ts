/** Serialize first-use GPU work so separate scene preparations cannot stall the same frame. */
export function createPreparationQueue(schedule:(run:()=>void)=>void){
 const jobs:(()=>void)[]=[];let pending=false;
 const pump=()=>{if(pending||!jobs.length)return;pending=true;schedule(()=>{const job=jobs.shift()!;try{job();}finally{pending=false;pump();}});};
 return <T>(work:()=>T)=>new Promise<T>((resolve,reject)=>{jobs.push(()=>{try{resolve(work());}catch(error){reject(error);}});pump();});
}
export const prepareOnFrame=createPreparationQueue(run=>requestAnimationFrame(()=>setTimeout(run,0)));
