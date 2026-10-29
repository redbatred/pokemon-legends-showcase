import measured from '../../public/assets/pokemon-3d/power-cues.json';
/** Coordinates measured on the original animated skin; values are in bone-local space. */
export type EmitterSpec={species?:string;bone:string;tip:number[];forward:number[]};
export type MoveRig={emitters:EmitterSpec[];seek?:number;speed:number;powerAt:number;end:number;recoveryEnd?:number;recoverySpeed?:number};
export const moveRigs=measured as Record<string,MoveRig>;
export type ProjectedEmitter={species?:string;x:number;y:number;dx:number;dy:number;foreshortening?:number};
