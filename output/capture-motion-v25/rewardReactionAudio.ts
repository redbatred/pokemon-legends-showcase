import {playbackTime} from './timing';
/** Preserve the authored exit cue after the new post-reward dialogue hold. */
export function extendRewardAudio(context:BaseAudioContext,input:AudioBuffer){
 const insert=Math.min(input.length,Math.round(playbackTime(21.2)*input.sampleRate)),gap=Math.round(2.4*input.sampleRate),fade=Math.round(.006*input.sampleRate);
 const output=context.createBuffer(input.numberOfChannels,input.length+gap,input.sampleRate);
 for(let c=0;c<input.numberOfChannels;c++){
  const src=input.getChannelData(c),dst=output.getChannelData(c);dst.set(src.subarray(0,insert));dst.set(src.subarray(insert),insert+gap);
  for(let i=0;i<fade;i++){if(insert-1-i>=0)dst[insert-1-i]*=i/fade;if(insert+gap+i<dst.length)dst[insert+gap+i]*=i/fade;}
 }
 return output;
}
