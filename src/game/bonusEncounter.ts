/// <reference types="vite/client" />
/** The legendary capture encounter is its own page, embedded over the pack and driven through this interface.
 * The page is built with the game (see `vite.config.ts`) and lives under the site's base path. */
export const BONUS_SCENE=(import.meta.env?.BASE_URL??'/')+'output/capture-motion-v25/';
export interface CaptureDemo{
 readonly running:boolean;readonly waiting:boolean;readonly outcome:'capture'|'escape';
 /** The legendary on offer: its reward card and multiplier of the stake. */
 readonly reward:{name:string;image:string;multiplier:number};
 /** The scene's canvas in its own pixels; its shape was chosen for the screen it was loaded on. */
 readonly size:{width:number;height:number};
 setEntryBackdrop(canvas:HTMLCanvasElement):void;setExitBackdrop(canvas:HTMLCanvasElement):void;setMuted(value:boolean):void;
 start(result:'capture'|'escape'|'random',automatic?:boolean):Promise<void>;stop():void;
}
/** The scene takes the screen's shape when it loads (tall, 3:4 or wide). It is shown in the largest box of that shape that fits
 * the game, centred; if the screen has changed shape since, what is left over is shaded. */
export function bonusFrameBox(width:number,height:number,aspect=.75){
 const boxWidth=Math.round(Math.min(width,height*aspect)),boxHeight=Math.round(boxWidth/aspect);
 return {x:Math.round((width-boxWidth)/2),y:Math.round((height-boxHeight)/2),width:boxWidth,height:boxHeight,letterboxed:boxWidth<width-2||boxHeight<height-2};
}
