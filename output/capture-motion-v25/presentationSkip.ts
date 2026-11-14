import {playbackTime} from './timing';
import {WIN_STAGES} from './winTimeline';
/** Only advances presentation; never reads or modifies outcome selection. */
export function nextPresentationStop(time:number,outcome:'capture'|'escape'){
 const common=[6.4,7.5,9.45,10.3,11.3,13.0,14.95,15.8,16.65].map(t=>playbackTime(t,outcome));
 const result=outcome==='capture'?[playbackTime(17.1),playbackTime(18.5),...WIN_STAGES.map(s=>playbackTime(18.5)+s.end),playbackTime(18.5)+6.05]:[17.9,18.75,20.05].map(t=>playbackTime(t,outcome));
 const end=playbackTime(23.05,outcome);
 return [...common,...result,end].find(t=>t>time+.0001)??end;
}
