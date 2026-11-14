// GPU cost of the live game's frames (dev page only: needs window.__game). Wraps the Pixi renderer with a timer query and
// counts draw calls, framebuffer switches and texture uploads per frame.
//   gpuProbe.start(); …play…; gpuProbe.report()
(()=>{
 const g=window.__game,app=g.stage.app,renderer=app.renderer,gl=renderer.gl,ext=gl.getExtension('EXT_disjoint_timer_query_webgl2');
 const frames=[],pending=[];let current=null,active=false,installed=false,marks=[];
 const count=(name,measure)=>{const original=gl[name].bind(gl);gl[name]=(...args)=>{if(current)measure(current,args);return original(...args);};};
 const install=()=>{if(installed)return;installed=true;
  count('drawElements',f=>f.draws++);count('drawArrays',f=>f.draws++);count('drawElementsInstanced',f=>f.draws++);count('drawArraysInstanced',f=>f.draws++);
  count('bindFramebuffer',f=>f.targets++);count('useProgram',f=>f.programs++);count('linkProgram',f=>f.links++);
  const size=args=>{const source=args[args.length-1];if(args.length>=9&&typeof args[3]==='number'&&typeof args[4]==='number'&&args.length===9)return args[3]*args[4];return (source?.width??source?.videoWidth??0)*(source?.height??source?.videoHeight??0);};
  count('texImage2D',(f,args)=>{f.uploads++;f.uploadPixels+=size(args);});count('texSubImage2D',(f,args)=>{f.uploads++;f.uploadPixels+=(typeof args[4]==='number'&&args.length===9?args[4]*args[5]:size(args));});
  count('readPixels',f=>f.reads++);count('blitFramebuffer',f=>f.blits++);
  const render=renderer.render.bind(renderer);
  renderer.render=(...args)=>{if(!active)return render(...args);
   for(let i=pending.length-1;i>=0;i--){const p=pending[i];if(gl.getQueryParameter(p.query,gl.QUERY_RESULT_AVAILABLE)){if(!gl.getParameter(ext.GPU_DISJOINT_EXT))p.frame.gpu=gl.getQueryParameter(p.query,gl.QUERY_RESULT)/1e6;gl.deleteQuery(p.query);pending.splice(i,1);}}
   const nested=!!current,frame=nested?current:{t:performance.now(),draws:0,targets:0,programs:0,links:0,uploads:0,uploadPixels:0,reads:0,blits:0,gpu:null,cpu:0,phase:g.phase+':'+g.index};let query=null;
   if(!nested){current=frame;if(ext&&pending.length<24){query=gl.createQuery();gl.beginQuery(ext.TIME_ELAPSED_EXT,query);}}
   const started=performance.now();try{return render(...args);}finally{if(!nested){frame.cpu=performance.now()-started;if(query){gl.endQuery(ext.TIME_ELAPSED_EXT);pending.push({query,frame});}frames.push(frame);current=null;}}};
 };
 const stat=(values)=>{const s=values.filter(v=>v!==null).sort((a,b)=>a-b);if(!s.length)return null;const at=p=>+s[Math.min(s.length-1,Math.floor(s.length*p))].toFixed(2);return {n:s.length,p50:at(.5),p90:at(.9),p99:at(.99),max:+s.at(-1).toFixed(1)};};
 window.gpuProbe={start(){install();frames.length=0;marks=[];active=true;},stop(){active=false;},mark(name){marks.push([performance.now(),name]);},frames,
  report(){const groups=new Map();for(const f of frames){const key=f.phase.split(':')[0];if(!groups.has(key))groups.set(key,[]);groups.get(key).push(f);}
   const phases=[...groups].map(([phase,fs])=>({phase,frames:fs.length,gpu:stat(fs.map(f=>f.gpu)),cpu:stat(fs.map(f=>f.cpu)),draws:stat(fs.map(f=>f.draws)),targets:stat(fs.map(f=>f.targets)),uploads:fs.reduce((n,f)=>n+f.uploads,0),uploadMP:+(fs.reduce((n,f)=>n+f.uploadPixels,0)/1e6).toFixed(1),links:fs.reduce((n,f)=>n+f.links,0),reads:fs.reduce((n,f)=>n+f.reads,0)}));
   const worst=[...frames].filter(f=>f.gpu!==null).sort((a,b)=>b.gpu-a.gpu).slice(0,14).map(f=>({gpu:+f.gpu.toFixed(1),cpu:+f.cpu.toFixed(1),phase:f.phase,draws:f.draws,targets:f.targets,uploads:f.uploads,uploadMP:+(f.uploadPixels/1e6).toFixed(2),links:f.links}));
   const uploads=[...frames].sort((a,b)=>b.uploadPixels-a.uploadPixels).slice(0,10).map(f=>({phase:f.phase,uploads:f.uploads,uploadMP:+(f.uploadPixels/1e6).toFixed(2),gpu:f.gpu===null?null:+f.gpu.toFixed(1),cpu:+f.cpu.toFixed(1),links:f.links}));
   return {phases,worst,uploads};}};
})();
