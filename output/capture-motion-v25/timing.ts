/** Monotonic picture/audio clock. Only a successful capture receives the win cadence. */
export const stretchedBeats=[[6.4,7.5,1.1],[7.5,9.1,.6],[11.3,12.55,.65],[16.1,16.65,.45],[16.65,17.9,.55],[18.5,21.2,5.1*2.7/2.95],[21.2,21.45,5.1*.25/2.95+2.4]] as const;
const beats=(outcome:'capture'|'escape')=>outcome==='capture'?stretchedBeats:stretchedBeats.slice(0,-2);
export function playbackTime(story:number,outcome:'capture'|'escape'='capture'){let extra=0;for(const [a,b,add] of beats(outcome))extra+=add*Math.max(0,Math.min(1,(story-a)/(b-a)));return story+extra;}
export function storyTime(playback:number,outcome:'capture'|'escape'='capture'){let extra=0;for(const [a,b,add] of beats(outcome)){if(playback<a+extra)return playback-extra;if(playback<=b+extra+add)return a+(playback-a-extra)*(b-a)/(b-a+add);extra+=add;}return playback-extra;}
