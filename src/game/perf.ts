/** Opt-in diagnostics. Exposes frame measurements in the page for reproducible browser QA. */
export function startFrameProbe() {
  if (!new URLSearchParams(location.search).has('perf')) return () => {};
  const output = document.createElement('output'); output.id = 'frame-probe';
  output.style.cssText='position:fixed;right:8px;bottom:8px;z-index:9999;padding:5px 8px;background:#020818;color:#b8efff;font:11px monospace;pointer-events:none';
  document.body.appendChild(output);
  let last = 0, handle = 0, frames: number[] = [];
  const sample = (now: number) => {
    if (last && !document.hidden) frames.push(now-last);
    last=now;
    if(frames.length>=180){const sorted=[...frames].sort((a,b)=>a-b);const mean=frames.reduce((a,b)=>a+b,0)/frames.length;const canvas=document.querySelector('canvas');const renderer=canvas?.dataset.renderState==='paused'?'paused':`${canvas?.dataset.renderFps??'…'} fps`;output.textContent=`Game ${renderer} | browser ${(1000/mean).toFixed(1)} fps | p95 ${sorted[Math.floor(sorted.length*.95)].toFixed(1)} ms | >33ms ${frames.filter(n=>n>33.5).length}/180`;frames=[];}
    handle=requestAnimationFrame(sample);
  };
  output.textContent='Measuring 180 frames…'; handle=requestAnimationFrame(sample);
  return()=>{cancelAnimationFrame(handle);output.remove();};
}
