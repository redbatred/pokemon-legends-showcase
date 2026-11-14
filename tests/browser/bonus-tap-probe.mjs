// Lab only. Times "tap Bonus Buy -> the encounter is on screen" in a real headless Chrome with a fresh profile (an empty disk
// cache), a phone-sized viewport and the CPU slowed by <cpuRate>. Point it at a build served by slow-server.mjs.
//   cold: tap the instant the game appears.   warm: wait for the background fetch of the encounter to finish, then tap.
// usage: node tests/browser/bonus-tap-probe.mjs http://127.0.0.1:5302/ 4 warm [debugPort]
import {spawn} from 'node:child_process';import {mkdtempSync,rmSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';
const [url,rate,mode,port]=[process.argv[2],Number(process.argv[3]||1),process.argv[4]||'cold',Number(process.argv[5]||9377)];
const profile=mkdtempSync(join(process.env.SCRATCH||tmpdir(),'chrome-'));
const chrome=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new',`--remote-debugging-port=${port}`,`--user-data-dir=${profile}`,'--no-first-run','--no-default-browser-check','--window-size=412,915','--autoplay-policy=no-user-gesture-required','--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist','--mute-audio','about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let version;for(let i=0;i<50&&!version;i++){await sleep(200);version=await fetch(`http://127.0.0.1:${port}/json/version`).then(r=>r.json()).catch(()=>null);}
const ws=new WebSocket(version.webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r));
let id=0;const pending=new Map();ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id&&pending.has(m.id)){const {resolve,reject}=pending.get(m.id);pending.delete(m.id);m.error?reject(new Error(m.error.message)):resolve(m.result);}});
const send=(method,params={},sessionId)=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params,sessionId}));});
const {targetId}=await send('Target.createTarget',{url:'about:blank'}),{sessionId}=await send('Target.attachToTarget',{targetId,flatten:true});
const page=(method,params)=>send(method,params,sessionId);
const run=async expression=>{const r=await page('Runtime.evaluate',{expression:`(async()=>{${expression}})()`,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails).slice(0,600));return r.result.value;};
await page('Page.enable');await page('Runtime.enable');await page('Emulation.setDeviceMetricsOverride',{width:412,height:915,deviceScaleFactor:2,mobile:true});await page('Emulation.setTouchEmulationEnabled',{enabled:true});
if(rate>1)await page('Emulation.setCPUThrottlingRate',{rate});
const origin=new URL(url).origin;await fetch(origin+'/__reset');
const started=Date.now();await page('Page.navigate',{url});
const out={url,cpu:rate+'x',mode};
out.gpu=await run(`const c=document.createElement('canvas').getContext('webgl');const e=c.getExtension('WEBGL_debug_renderer_info');return e?c.getParameter(e.UNMASKED_RENDERER_WEBGL):'?'`).catch(()=>'?');
await run(`await new Promise(r=>{const iv=setInterval(()=>{const root=document.getElementById('root');if(root&&!document.getElementById('boot-screen')&&!root.inert){clearInterval(iv);r()}},50)});
 window.__m={};setInterval(()=>{const f=document.querySelector('iframe'),l=document.querySelector('.bonus-loader[data-shown]');if(l&&!window.__m.loader)window.__m.loader=performance.now();if(f&&f.style.visibility==='visible'&&!window.__m.t1)window.__m.t1=performance.now();},16);`);
out.bootSeconds=+((Date.now()-started)/1000).toFixed(1);const boot=await fetch(origin+'/__stats').then(r=>r.json());out.bootMB=+(boot.sent/1e6).toFixed(1);await fetch(origin+'/__reset');
if(mode==='warm'){ // let the background fetch finish: wait until the server has been quiet for 4 s
 let last=-1,quiet=0;const t=Date.now();while(quiet<4&&Date.now()-t<90000){await sleep(1000);const s=await fetch(origin+'/__stats').then(r=>r.json());if(s.sent===last)quiet++;else quiet=0;last=s.sent;}
 out.backgroundSeconds=+((Date.now()-t)/1000-4).toFixed(1);out.backgroundMB=+(last/1e6).toFixed(1);await fetch(origin+'/__reset');
}
const result=await run(`window.__m.t0=performance.now();document.querySelector('[data-control="showdown"]').click();
 await new Promise(r=>{const iv=setInterval(()=>{if(window.__m.t1||performance.now()-window.__m.t0>120000){clearInterval(iv);r()}},30)});
 const d=document.querySelector('iframe')?.contentWindow?.captureDemo;
 return {tapToScene:window.__m.t1?Math.round(window.__m.t1-window.__m.t0):null,tapToLoader:window.__m.loader?Math.round(window.__m.loader-window.__m.t0):null,running:!!d?.running};`);
Object.assign(out,result);const log=await fetch(origin+'/__log').then(r=>r.json()).catch(()=>[]),after=await fetch(origin+'/__stats').then(r=>r.json());
out.afterTap={requests:after.requests,MB:+(after.sent/1e6).toFixed(2),downloaded:log.filter(e=>e[1]===200).length,revalidated:log.filter(e=>e[1]===304).length};
out.errors=await run(`return (document.querySelector('iframe')?.contentWindow?.__errors||[]).slice(0,3)`).catch(()=>[]);
console.log(JSON.stringify(out,null,1));
ws.close();chrome.kill();await sleep(500);try{rmSync(profile,{recursive:true,force:true});}catch{}
process.exit(0);
