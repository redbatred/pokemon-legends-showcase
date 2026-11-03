import {spawnSync} from 'node:child_process';
const result=spawnSync(process.platform==='win32'?'npm.cmd':'npm',['run','build'],{
 stdio:'inherit',env:{...process.env,SITE_BASE:'/pokemon-legends-showcase/'},
});
if(result.error)throw result.error;
process.exit(result.status??1);
