import type {Outcome} from './model';
export const VERDICT_CUES={capture:[{at:12.2,file:'se_go_ball_gotcha',gain:.8},{at:12.42,file:'200_ME_gotcha',gain:.52}],escape:[{at:12.2,file:'se_go_ball_out',gain:.64},{at:12.62,file:'encounter_flee',gain:.5}]} as const;
/** Physical seal/break first, then the matching game-confirmation phrase. */
export function createVerdictAudio(){
 const buffers=new Map<string,AudioBuffer>(),nodes=new Set<AudioBufferSourceNode>();let context:AudioContext|undefined,bus:AudioNode|undefined,previous=-1,until=0;
 async function prepare(ctx:AudioContext,destination:AudioNode){context=ctx;bus=destination;await Promise.all([...new Set(Object.values(VERDICT_CUES).flat().map(c=>c.file))].map(async file=>{const response=await fetch('/output/capture-motion-v25/audio/verdict/'+file+'.wav');if(!response.ok)throw Error('Verdict audio missing');buffers.set(file,await ctx.decodeAudioData(await response.arrayBuffer()));}));}
 function reset(){for(const node of nodes){try{node.stop();}catch{}node.disconnect();}nodes.clear();previous=-1;until=0;}
 function sample(t:number,outcome:Outcome,playing:boolean){
  if(!playing||!context||!bus)return false;
  if(previous>=0&&Math.abs(t-previous)>.5){for(const node of nodes){try{node.stop();}catch{}}nodes.clear();until=0;}
  for(const cue of VERDICT_CUES[outcome])if(previous<cue.at&&t>=cue.at&&t-cue.at<.15){const buffer=buffers.get(cue.file)!;const node=context.createBufferSource(),gain=context.createGain();node.buffer=buffer;gain.gain.value=cue.gain;node.connect(gain).connect(bus);node.start();nodes.add(node);until=Math.max(until,context.currentTime+buffer.duration);node.onended=()=>{nodes.delete(node);node.disconnect();gain.disconnect();};}
  previous=t;return context.currentTime<until;
 }
 return{prepare,sample,reset};
}
