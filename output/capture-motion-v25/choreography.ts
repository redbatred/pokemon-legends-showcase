/** Story-clock shot boundaries. An outgoing shot cannot reveal the next shot early. */
export const ENTRY_START=5.15,EYE_START=6.4,ARRIVAL_START=7.5;
export function entryShot(t:number){return{wipe:t>=ENTRY_START&&t<EYE_START,eye:t>=EYE_START&&t<ARRIVAL_START,arrival:t>=ARRIVAL_START};}
export function verdictAge(t:number,result:'capture'|'escape'){return t-(result==='capture'?12.42:12.62);}
export function exitShot(t:number){const age=t-17;return{age,visible:age>=0&&age<1.5,covered:age>=.65&&age<.85,showPack:t>=17.72};}
