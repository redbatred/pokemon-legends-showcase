// Lab helper: a CPU profile of the real game while it plays a pack, with frame pacing and long frames.
// Needs the lab server (vite.lab.config.mts), which sends `Document-Policy: js-profiling`.
// Usage on pack-flow-lab.html?browse=1&job=none:   await perfRun({cheats:{win:'mega',bonus:'capture'}})  →  window.perfReport
(()=>{
 const sleep=ms=>new Promise(r=>setTimeout(r,ms));
 const short=url=>(url||'').split('?')[0].split('/').slice(-2).join('/');
 window.perfRun=async({cheats={},turbo=false,settle=2500}={})=>{
  const g=window.flowGame,frames=[],loaf=[],marks=[];let last=performance.now(),alive=true;
  const mark=name=>marks.push([performance.now(),name]);
  const tick=t=>{frames.push([t,t-last]);last=t;if(alive)requestAnimationFrame(tick);};requestAnimationFrame(tick);
  const observer=new PerformanceObserver(list=>{for(const e of list.getEntries())loaf.push({start:e.startTime,duration:e.duration,scripts:e.scripts.map(s=>({duration:s.duration,name:s.sourceFunctionName,invoker:String(s.invoker).slice(0,50),source:short(s.sourceURL)}))});});observer.observe({type:'long-animation-frame'});
  const profiler=new Profiler({sampleInterval:1,maxBufferSize:400000});
  g.turbo=turbo;g.setCheats(cheats);mark('idle');await sleep(settle);
  mark('buy');g.action('cheats-open');await flow.until(()=>g.phase==='sealed',20000);await sleep(700);
  mark('tear');g.action('tear');await flow.until(()=>g.phase==='awaiting',20000);await sleep(500);
  let guard=0,threw=false,card=-1;
  while(g.phase!=='complete'&&guard++<6000){
   if(g.showdown){const d=g.bonusFrame.contentWindow.captureDemo;if(d&&d.waiting&&!threw){threw=true;mark('throw');g.bonusFrame.contentDocument.querySelector('#throw').click();}}
   else if(g.showdownLoading){if(marks.at(-1)[1]!=='bonus-enter'&&!threw)mark('bonus-enter');}
   else if(['awaiting','revealed'].includes(g.phase)){if(threw&&marks.every(m=>m[1]!=='bonus-return'))mark('bonus-return');if(g.index!==card||g.phase==='awaiting'){card=g.index;mark('card'+(g.phase==='awaiting'?0:g.index+1));}await sleep(650);g.action('next');}
   await sleep(120);
  }
  mark('result');await sleep(5000);mark('end');alive=false;observer.disconnect();
  const trace=await profiler.stop();
  // Aggregate samples: self time and inclusive time per function.
  const key=f=>{const fr=trace.frames[f];return (fr.name||'(anonymous)')+' @'+(fr.resourceId!==undefined?short(trace.resources[fr.resourceId]):'native')+(fr.line?':'+fr.line:'');};
  const stackOf=id=>{const out=[];while(id!==undefined){const s=trace.stacks[id];out.push(s.frameId);id=s.parentId;}return out;};
  const samples=trace.samples,self=new Map(),incl=new Map(),timed=[];
  for(let i=0;i<samples.length-1;i++){const dt=Math.min(8,samples[i+1].timestamp-samples[i].timestamp);if(samples[i].stackId===undefined)continue;const stack=stackOf(samples[i].stackId);timed.push([samples[i].timestamp,dt,stack]);self.set(stack[0],(self.get(stack[0])??0)+dt);for(const f of new Set(stack))incl.set(f,(incl.get(f)??0)+dt);}
  const top=(map,n,filter=()=>true)=>[...map].filter(([f])=>filter(key(f))).sort((a,b)=>b[1]-a[1]).slice(0,n).map(([f,ms])=>Math.round(ms)+'ms '+key(f));
  const ours=name=>/game\/|capture-motion|browser\//.test(name);
  const window_=(a,b)=>{const inc=new Map(),own=new Map();let busy=0;for(const [t,dt,stack] of timed){if(t<a||t>=b)continue;busy+=dt;own.set(stack[0],(own.get(stack[0])??0)+dt);for(const f of new Set(stack))inc.set(f,(inc.get(f)??0)+dt);}return {busy:Math.round(busy),ours:top(inc,8,ours),self:top(own,6)};};
  const segment=(a,b,name)=>{const fs=frames.filter(f=>f[0]>=a&&f[0]<b).map(f=>f[1]).sort((x,y)=>x-y);if(!fs.length)return null;const sec=(b-a)/1000,w=window_(a,b);return {name,sec:+sec.toFixed(1),fps:+(fs.length/sec).toFixed(1),p50:+fs[fs.length>>1].toFixed(1),p95:+fs[Math.floor(fs.length*.95)].toFixed(1),max:Math.round(fs.at(-1)),over34:fs.filter(d=>d>34).length,over50:fs.filter(d=>d>50).length,cpuPerSec:Math.round(w.busy/sec),ours:w.ours.slice(0,6)};};
  const names=['idle','buy','tear','card0','bonus-enter','throw','bonus-return','result','end'],at=name=>marks.find(m=>m[1]===name)?.[0];
  const cuts=names.map(n=>[n,at(n)]).filter(c=>c[1]!==undefined),segments=cuts.slice(0,-1).map((c,i)=>segment(c[1],cuts[i+1][1],c[0]));
  const near=t=>{let best=null;for(const m of marks)if(m[0]<=t)best=m;return best?best[1]+'+'+Math.round(t-best[0]):'?';};
  const hitches=loaf.filter(e=>e.duration>=45).sort((a,b)=>b.duration-a.duration).slice(0,30).map(e=>({ms:Math.round(e.duration),at:near(e.start),script:e.scripts.sort((a,b)=>b.duration-a.duration).slice(0,2).map(s=>Math.round(s.duration)+'ms '+(s.name||'?')+' ['+s.invoker+'] '+s.source).join(' | '),...window_(e.start,e.start+e.duration)}));
  return window.perfReport={sampleCount:samples.length,segments,hitches,topSelf:top(self,40),topOurs:top(incl,60,ours),marks:marks.map(m=>[Math.round(m[0]),m[1]])};
 };
})();
