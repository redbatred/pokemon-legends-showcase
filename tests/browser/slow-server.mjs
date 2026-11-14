// Lab only. A static server that behaves like a phone connection: one shared download rate and a delay before every response.
// It mirrors the deployed host's caching: hashed build files are immutable, everything else must be revalidated (ETag -> 304).
// /__stats reports bytes and requests served, /__log each response, /__reset clears both.
// usage: npm run build && node tests/browser/slow-server.mjs "$PWD/dist" 5302 9000 100     (folder, port, kbit/s, ms per response)
import http from 'node:http';import {createReadStream,statSync,readFileSync,existsSync} from 'node:fs';import {join,extname,normalize} from 'node:path';import {gzipSync} from 'node:zlib';
const [dir,port,kbps,latency]=[process.argv[2],Number(process.argv[3]),Number(process.argv[4]||0),Number(process.argv[5]||0)];
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.atlas':'text/plain','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.wav':'audio/wav','.flac':'audio/flac','.ogg':'audio/ogg','.mp3':'audio/mpeg','.glb':'model/gltf-binary','.ttf':'font/ttf','.woff2':'font/woff2','.ico':'image/x-icon'};
const text=new Set(['.html','.js','.css','.json','.atlas','.svg']),zipped=new Map();
let budget=0,last=Date.now();const waiters=[];let sent=0,requests=0,log=[];
const rate=kbps*1000/8; // bytes per second
setInterval(()=>{const now=Date.now();if(rate){budget=Math.min(rate*.05,budget+rate*(now-last)/1000);}last=now;while(waiters.length&&(budget>0||!rate)){waiters.shift()();}},10);
const take=n=>new Promise(resolve=>{const go=()=>{if(!rate){resolve(n);return;}if(budget<=0){waiters.push(go);return;}const got=Math.min(n,Math.max(1,Math.floor(budget)));budget-=got;resolve(got);};go();});
http.createServer(async(req,res)=>{
 const url=new URL(req.url,'http://x');if(url.pathname==='/__stats'){res.setHeader('access-control-allow-origin','*');res.end(JSON.stringify({sent,requests}));return;}
 if(url.pathname==='/__reset'){sent=0;requests=0;log=[];res.end('ok');return;}
 if(url.pathname==='/__log'){res.end(JSON.stringify(log));return;}
 let path=normalize(join(dir,decodeURIComponent(url.pathname)));if(!path.startsWith(dir)){res.statusCode=403;res.end();return;}
 if(existsSync(path)&&statSync(path).isDirectory())path=join(path,'index.html');
 requests++;if(latency)await new Promise(r=>setTimeout(r,latency));
 if(!existsSync(path)){res.statusCode=404;res.end('not found');return;}
 const stat=statSync(path),ext=extname(path),etag=`"${stat.size}-${Math.round(stat.mtimeMs)}"`,hashed=/\/assets\/[^/]+-[A-Za-z0-9_-]{8}\.(js|css)$/.test(url.pathname);
 res.setHeader('etag',etag);res.setHeader('cache-control',hashed?'public, max-age=31536000, immutable':'public, max-age=0, must-revalidate');res.setHeader('content-type',types[ext]||'application/octet-stream');
 if(req.headers['if-none-match']===etag){log.push([url.pathname,304,0]);res.statusCode=304;res.end();return;}
 let body=null;if(text.has(ext)&&/gzip/.test(req.headers['accept-encoding']||'')){const key=path+etag;if(!zipped.has(key))zipped.set(key,gzipSync(readFileSync(path)));body=zipped.get(key);res.setHeader('content-encoding','gzip');}
 else body=readFileSync(path);
 res.setHeader('content-length',body.length);res.writeHead(200);log.push([url.pathname,200,body.length]);
 let closed=false;res.on('close',()=>{closed=true;});
 for(let offset=0;offset<body.length&&!closed;){const n=await take(Math.min(16384,body.length-offset));if(closed)break;res.write(body.subarray(offset,offset+n));sent+=n;offset+=n;}
 res.end();
}).listen(port,'127.0.0.1',()=>console.log(`serving ${dir} on ${port} at ${kbps||'unlimited'} kbit/s, ${latency} ms`));
