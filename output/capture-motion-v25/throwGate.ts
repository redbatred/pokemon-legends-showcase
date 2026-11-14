import {playbackTime} from './timing';
/** Presentation-only gate. It never reads or changes the predetermined outcome. */
export const THROW_AT=playbackTime(9.45);
export class ThrowGate{
 waiting=false;released=false;held=0;
 reset(){this.waiting=false;this.released=false;this.held=0;}
 sample(elapsed:number){if(!this.released&&elapsed>=THROW_AT){this.waiting=true;this.held=elapsed-THROW_AT;return THROW_AT;}return elapsed-this.held;}
 release(elapsed:number){if(!this.waiting)return false;this.held=elapsed-THROW_AT;this.waiting=false;this.released=true;return true;}
}
