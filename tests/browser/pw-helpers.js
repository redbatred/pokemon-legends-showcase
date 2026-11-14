// Capture helpers for pack-flow-lab: stills and contact sheets are posted to a local scratch server for review.
const q=new URLSearchParams(location.search),LW=Number(q.get('w')??540),LH=Number(q.get('h')??720);
const post=async(canvas,name)=>{const blob=await new Promise(r=>canvas.toBlob(r,'image/png'));const res=await fetch('http://127.0.0.1:5199/save?name='+name,{method:'POST',body:blob});return res.status+' '+canvas.width+'x'+canvas.height;};
window.saveSheet=name=>post(document.querySelector('#sheet'),name);
window.snap=async(name,crop)=>{virtualClock.manual();for(let i=0;i<12;i++)if(await step())break;const src=flowGame.stage.app.canvas,k=src.width/LW,a=crop??{x:0,y:0,w:LW,h:LH},c=document.createElement('canvas');c.width=a.w*k;c.height=a.h*k;c.getContext('2d').drawImage(src,a.x*k,a.y*k,a.w*k,a.h*k,0,0,c.width,c.height);return post(c,name);};
window.stepFor=async sec=>{virtualClock.manual();for(let i=0;i<Math.round(sec*60);i++){virtualClock.step();await new Promise(r=>setTimeout(r,0));}};
// Returns in the same task as the step that satisfied the check, so a following snap() samples that very frame.
// A step without a render leaves a presented, cleared buffer. `step()` reports whether this frame drew, and captures
// wait for one that did.
function hook(){const r=flowGame.stage.app.renderer;if(!r||r.__pw)return;const o=r.render.bind(r);r.render=(...a)=>{window.__pwDrew=true;return o(...a);};r.__pw=true;}
// The stage renders in a microtask at the end of the frame that asked; wait for it, still inside this task.
async function step(){hook();window.__pwDrew=false;virtualClock.step();await Promise.resolve();await Promise.resolve();return window.__pwDrew;}
window.stepUntil=async(check,limit=40)=>{virtualClock.manual();for(let i=0;i<limit*60;i++){const drew=await step();if(check()&&drew)return true;await new Promise(r=>setTimeout(r,0));}return check();};
window.run=work=>{window.jobState={done:false};work().then(result=>window.jobState={done:true,result},error=>window.jobState={done:true,error:String(error)});};
window.waitJob=async()=>{for(let i=0;i<110&&!window.jobState.done;i++)await new Promise(r=>setTimeout(r,250));return JSON.stringify(window.jobState);};
// Like flow.film, but samples the canvas in the same task as the step, before the browser can present and clear it.
window.pwFilm=async({seconds=4,every=.1,cols=6,scale=.4,crop=null,hook=null,name='pw-film'}={})=>{virtualClock.manual();const a=crop??{x:0,y:0,w:LW,h:LH},canvas=document.querySelector('#sheet'),tw=Math.round(a.w*scale),th=Math.round(a.h*scale),count=Math.ceil(seconds/every);canvas.width=tw*cols;canvas.height=th*Math.ceil(count/cols);const ctx=canvas.getContext('2d');ctx.fillStyle='#000';ctx.fillRect(0,0,canvas.width,canvas.height);let shot=0,elapsed=0,frame=0;
 while(shot<count){const drew=await step();hook?.(++frame);elapsed+=1/60;if(elapsed>=shot*every&&drew){const src=flowGame.stage.app.canvas,k=src.width/LW;ctx.drawImage(src,a.x*k,a.y*k,a.w*k,a.h*k,(shot%cols)*tw,Math.floor(shot/cols)*th,tw,th);ctx.fillStyle='#fff';ctx.font='11px Arial';ctx.fillText((window.cinAge?.()??elapsed).toFixed(2),(shot%cols)*tw+3,Math.floor(shot/cols)*th+11);shot++;}await new Promise(r=>setTimeout(r,0));}
 return saveSheet(name);};
// One tile per requested age (read by `clock()`), each sampled on a frame that rendered.
window.pwKeys=async({ages,clock=()=>window.cinAge(),cols=3,scale=.5,crop=null,name='pw-keys',between=null})=>{const a=crop??{x:0,y:0,w:LW,h:LH},canvas=document.querySelector('#sheet'),tw=Math.round(a.w*scale),th=Math.round(a.h*scale);canvas.width=tw*cols;canvas.height=th*Math.ceil(ages.length/cols);const ctx=canvas.getContext('2d');ctx.fillStyle='#000';ctx.fillRect(0,0,canvas.width,canvas.height);
 for(const [i,age] of ages.entries()){await between?.(i,age);await stepUntil(()=>clock()>=age,30);const src=flowGame.stage.app.canvas,k=src.width/LW;ctx.drawImage(src,a.x*k,a.y*k,a.w*k,a.h*k,(i%cols)*tw,Math.floor(i/cols)*th,tw,th);ctx.fillStyle='#fff';ctx.font='12px Arial';ctx.fillText(clock().toFixed(2),(i%cols)*tw+4,Math.floor(i/cols)*th+13);}
 return saveSheet(name);};
window.RW=()=>flowGame.view.resultAmount;window.cinAge=()=>RW()?.motion?.age??-1;
/** Frames that rendered out of `frames` stepped: 1 means every frame drew. */
window.pwRenderRate=async(frames=60)=>{let drew=0;virtualClock.manual();for(let i=0;i<frames;i++){if(await step())drew++;await new Promise(r=>setTimeout(r,0));}return drew/frames;};
/** Wall-clock cost of each stepped frame (script + render submission) over `seconds`, and how many of them rendered. */
window.pwCost=async(seconds=2)=>{virtualClock.manual();const costs=[];let drew=0;for(let i=0;i<Math.round(seconds*60);i++){const t=virtualClock.realNow();if(await step())drew++;costs.push(virtualClock.realNow()-t);await new Promise(r=>setTimeout(r,0));}const sorted=[...costs].sort((a,b)=>a-b),sum=costs.reduce((a,b)=>a+b,0);return {frames:costs.length,rendered:drew,avg:+(sum/costs.length).toFixed(2),p95:+sorted[Math.floor(sorted.length*.95)].toFixed(2),max:+sorted.at(-1).toFixed(2)};};
window.pwReady=true;
