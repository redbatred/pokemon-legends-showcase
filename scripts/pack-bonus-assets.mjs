// Shrinks what the capture bonus downloads, without changing a pixel or a sample:
//   art    PNG -> lossless WebP (cwebp -lossless -exact), and the atlases are pointed at the WebP pages
//   music  WAV -> FLAC (bit-exact; the WAV stays beside it as the fallback for a browser that cannot decode FLAC)
// then rewrites output/capture-motion-v25/ship.json, the list of files the build copies next to the bonus page.
// Needs `cwebp` and `ffmpeg` on the path. Run after adding or changing bonus art or music: node scripts/pack-bonus-assets.mjs
import {execFileSync} from 'node:child_process';
import {existsSync,readFileSync,statSync,writeFileSync} from 'node:fs';
const root='output/capture-motion-v25/',read=file=>readFileSync(root+file,'utf8'),newer=(a,b)=>!existsSync(root+b)||statSync(root+a).mtimeMs>statSync(root+b).mtimeMs;
const ship=JSON.parse(read('ship.json')),files=new Set();
const webp=png=>{const out=png.replace(/\.png$/,'.webp');if(newer(png,out)){execFileSync('cwebp',['-quiet','-lossless','-z','9','-exact',root+png,'-o',root+out]);console.log('art  ',png,'->',out);}return out;};
const flac=wav=>{const out=wav.replace(/\.wav$/,'.flac');if(newer(wav,out)){execFileSync('ffmpeg',['-y','-loglevel','error','-i',root+wav,'-c:a','flac','-compression_level','8',root+out]);console.log('music',wav,'->',out);}return out;};
for(const file of ship){
 if(file.endsWith('.atlas')){
  // An atlas names its page images on lines of their own.
  const lines=read(file).split('\n').map(line=>{const page=line.trim();if(!/\.(png|webp)$/.test(page))return line;const png='assets/'+page.replace(/\.webp$/,'.png');files.add(webp(png));return page.replace(/\.png$/,'.webp');});
  writeFileSync(root+file,lines.join('\n'));files.add(file);
 }else if(/\.(png|webp)$/.test(file)){const png=file.replace(/\.webp$/,'.png');files.add(existsSync(root+png)?webp(png):file);}
 else if(/-score\.(wav|flac)$|music-loop\.(wav|flac)$/.test(file)){const wav=file.replace(/\.flac$/,'.wav');files.add(flac(wav));files.add(wav);}
 else files.add(file);
}
const list=[...files].sort();for(const file of list)if(!existsSync(root+file))throw new Error('Missing '+file);
writeFileSync(root+'ship.json',JSON.stringify(list,null,1)+'\n');
const size=list.reduce((n,file)=>n+statSync(root+file).size,0),fallback=list.filter(file=>/-score\.wav$|music-loop\.wav$/.test(file)).reduce((n,file)=>n+statSync(root+file).size,0);
console.log(`${list.length} files, ${(size/1e6).toFixed(1)} MB shipped, of which ${(fallback/1e6).toFixed(1)} MB is WAV fallback that is only fetched if FLAC cannot be decoded`);
