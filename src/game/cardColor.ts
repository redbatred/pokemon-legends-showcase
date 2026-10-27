/** Dominant saturated artwork color. Ignore pale borders, black print and transparent pixels. */
export function artworkColor(pixels:ArrayLike<number>){
  const bins=Array.from({length:12},()=>({weight:0,r:0,g:0,b:0}));
  for(let i=0;i<pixels.length;i+=4){
    const r=pixels[i]/255,g=pixels[i+1]/255,b=pixels[i+2]/255,max=Math.max(r,g,b),min=Math.min(r,g,b),delta=max-min;
    if(pixels[i+3]<128||max<.18||delta<.15)continue;
    let hue=max===r?((g-b)/delta+6)%6:max===g?(b-r)/delta+2:(r-g)/delta+4;
    const bin=bins[Math.floor(hue*2)%12],weight=delta*delta;
    bin.weight+=weight;bin.r+=r*weight;bin.g+=g*weight;bin.b+=b*weight;
  }
  const best=bins.reduce((a,b)=>b.weight>a.weight?b:a,bins[0]);if(best.weight===0)return 0x8cddff;
  const channels=[best.r/best.weight,best.g/best.weight,best.b/best.weight],peak=Math.max(...channels),floor=Math.min(...channels);
  // A light needs chroma: remove the artwork's gray component before raising brightness.
  // This retains hue instead of turning pastel illustrations into nearly white emitters.
  const [r,g,b]=channels.map(c=>Math.round((.12+(c-floor)/(peak-floor)*.88)*255));return (r<<16)|(g<<8)|b;
}
