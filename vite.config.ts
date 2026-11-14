import {cp,readFile} from 'node:fs/promises';
import {defineConfig,type Plugin} from 'vite';

/** The capture bonus is a page of its own, embedded by the game. Its code is bundled as a second entry; the art and sound
 * it fetches by relative URL at run time are named in its `ship.json` and copied next to the built page. */
const BONUS='output/capture-motion-v25';
function shipBonusFiles():Plugin{
 return {name:'ship-bonus-files',apply:'build',async closeBundle(){
  const files:string[]=JSON.parse(await readFile(`${BONUS}/ship.json`,'utf8'));
  // The list itself ships too: the game reads it to fetch the encounter's files ahead of the first Bonus Buy.
  await Promise.all([...files,'ship.json'].map(file=>cp(`${BONUS}/${file}`,`dist/${BONUS}/${file}`)));
 }};
}
export default defineConfig({base:process.env.SITE_BASE??'/',server:{port:5174},plugins:[shipBonusFiles()],build:{rollupOptions:{input:{main:'index.html',bonus:`${BONUS}/index.html`},output:{manualChunks:{pixi:['pixi.js'],motion:['gsap']}}}}});
