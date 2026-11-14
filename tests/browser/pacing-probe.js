// Real frame pacing of the live game (not the lab's virtual clock). Paste or load on the dev page, then:
//   await pacingRun({cheats:{win:'mega',bonus:'capture'}})  →  per-phase rAF statistics and long frames with their scripts.
(()=>{
 const sleep=ms=>new Promise(r=>setTimeout(r,ms)),short=u=>(u||'').split('?')[0].split('/').slice(-2).join('/');
 const click=id=>{const b=document.querySelector(`[data-control="${id}"]`);if(!b||b.disabled)return false;b.click();return true;};
 window.pacingRun=async({cheats={win:'normal',bonus:'off'},gap=900}={})=>{
  const frames=[],loaf=[],marks=[];let last=performance.now(),alive=true;const mark=m=>marks.push([performance.now(),m]);
  const tick=t=>{frames.push([t,t-last]);last=t;if(alive)requestAnimationFrame(tick);};requestAnimationFrame(tick);
  const observer=new PerformanceObserver(l=>{for(const e of l.getEntries())loaf.push({t:e.startTime,d:e.duration,scripts:e.scripts.map(s=>({d:s.duration,fn:s.sourceFunctionName,inv:String(s.invoker).slice(0,40),src:short(s.sourceURL)}))});});observer.observe({type:'long-animation-frame'});
  mark('idle');await sleep(2500);
  click('settings');await sleep(900);click('drawer-cheats');await sleep(900);mark('panels');
  click('cheats-reset');await sleep(200);for(const [k,v] of Object.entries(cheats)){click(`cheat-${k}-${v}`);await sleep(200);}
  mark('buy');click('cheats-open');await sleep(1800);mark('tear');click('primary');await sleep(2600);mark('cards');
  let guard=0,threw=false,entered=false;
  while(guard++<900){await sleep(gap);const frame=document.querySelector('iframe[title="Legendary encounter"]'),demo=frame?.contentWindow?.captureDemo;
   if(frame&&frame.style.visibility==='visible'&&demo){if(!entered){entered=true;mark('bonus');}if(demo.waiting&&!threw){threw=true;mark('throw');frame.contentDocument.querySelector('#throw').click();}continue;}
   if(entered&&!marks.some(m=>m[1]==='after-bonus'))mark('after-bonus');
   if(document.querySelector('[data-control="result-continue"]')){mark('result');await sleep(5000);mark('end');break;}
   click('next');}
  alive=false;observer.disconnect();
  const seg=(a,b,name)=>{const fs=frames.filter(f=>f[0]>=a&&f[0]<b).map(f=>f[1]).sort((x,y)=>x-y);if(!fs.length)return null;const sec=(b-a)/1000;return {name,sec:+sec.toFixed(1),fps:+(fs.length/sec).toFixed(1),p50:+fs[fs.length>>1].toFixed(1),p95:+fs[Math.floor(fs.length*.95)].toFixed(1),p99:+fs[Math.floor(fs.length*.99)].toFixed(1),max:Math.round(fs.at(-1)),over20:fs.filter(d=>d>20).length,over34:fs.filter(d=>d>34).length,over50:fs.filter(d=>d>50).length,over100:fs.filter(d=>d>100).length};};
  const near=t=>{let best=null;for(const m of marks)if(m[0]<=t)best=m;return best?best[1]+'+'+Math.round(t-best[0]):'?';};
  return window.pacingReport={refresh:+(1000/frames.map(f=>f[1]).sort((a,b)=>a-b)[frames.length>>3]).toFixed(0),segments:marks.slice(0,-1).map((m,i)=>seg(m[0],marks[i+1][0],m[1])).filter(Boolean),long:loaf.filter(e=>e.d>=40).sort((a,b)=>b.d-a.d).slice(0,25).map(e=>Math.round(e.d)+'ms '+near(e.t)+' :: '+e.scripts.sort((a,b)=>b.d-a.d).slice(0,2).map(s=>Math.round(s.d)+'ms '+(s.fn||'?')+' ['+s.inv+'] '+s.src).join(' | ')),longCount:loaf.filter(e=>e.d>=50).length};
 };
})();
