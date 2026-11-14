/** The ball owns the foreground until absorption begins. Only the current goes
 * between its shell layers; normal flight/contact never passes behind Lugia. */
export function usesBallInterior(time:number,outcome:'capture'|'escape'){
 return time>=6.85&&time<8.2||(outcome==='escape'&&time>=12.2&&time<13.45);
}
