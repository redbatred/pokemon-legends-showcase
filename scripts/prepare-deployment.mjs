import {execFileSync} from 'node:child_process';
import {readdir,readFile,writeFile,access} from 'node:fs/promises';
import {join,extname} from 'node:path';

const base=process.env.SITE_BASE??'/';
if(!/^\/[a-zA-Z0-9_/-]*$/.test(base)||!base.endsWith('/'))throw new Error('SITE_BASE must be an absolute directory path ending in /');
const root='dist';
// Vite rewrites module URLs; artwork/audio/model URLs also occur in manifests
// and canvas code. Rebase those for the existing GitHub Pages project URL.
async function rebase(directory){
 for(const entry of await readdir(directory,{withFileTypes:true})){
  const path=join(directory,entry.name);
  if(entry.isDirectory())await rebase(path);
  else if(['.js','.json','.css','.html','.svg'].includes(extname(path))){
   const source=await readFile(path,'utf8');
   const output=source.replace(/(?<=["'`(])\/assets\//g,base+'assets/');
   if(output!==source)await writeFile(path,output);
  }
 }
}
if(base!=='/')await rebase(root);
async function verify(value){
 if(Array.isArray(value))await Promise.all(value.map(verify));
 else if(value&&typeof value==='object')await Promise.all(Object.values(value).map(verify));
 else if(typeof value==='string'&&value.startsWith(base+'assets/'))await access(join(root,value.slice(base.length)));
}
for(const file of ['pokemon/manifest.json','pokemon-3d/manifest.json','packs.json'])await verify(JSON.parse(await readFile(join(root,'assets',file),'utf8')));
const sourceCommit=process.env.VERCEL_GIT_COMMIT_SHA||process.env.GITHUB_SHA||execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
await writeFile(join(root,'release.json'),JSON.stringify({sourceCommit,build:base==='/'?'vercel':'github-pages',builtAt:new Date().toISOString(),demo:true},null,2)+'\n');
await writeFile(join(root,'.nojekyll'),'');
console.log(`Prepared ${base} deployment from ${sourceCommit.slice(0,7)}`);
