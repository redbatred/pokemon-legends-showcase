/** Add a profile plus compatible rig/clip mapping; timing, sound cues and rewards are shared. */
export interface EncounterProfile {id:string;name:string;cardName:string;location:string;modelUrl:string;cardUrl:string;energyTint:string;multiplier:number;bet:number;audioPrefix:string;rig:'winged'|'humanoid';nativeFlow:boolean;pullHue:number;poolHue:number;smokeHeight:number;smokeScale:number;clips:{idle:string;attack:string;roar:string};}
export const encounters={
 mewtwo:{id:'mewtwo',rig:'humanoid',nativeFlow:false,pullHue:-35,poolHue:58,smokeHeight:205,smokeScale:1.18,clips:{idle:'defaultwait',attack:'rangeattack',roar:'roar'},name:'Mewtwo',cardName:'MEWTWO VSTAR',location:'Cerulean Cave',modelUrl:'/assets/pokemon-3d/mewtwo.glb',cardUrl:'/assets/sets/crown-zenith/cards/GG44.webp',energyTint:'dff5ffff',multiplier:180,bet:10,audioPrefix:''},
 lugia:{id:'lugia',rig:'winged',nativeFlow:true,pullHue:-110,poolHue:0,smokeHeight:145,smokeScale:1.05,clips:{idle:'defaultwait',attack:'rangeattack',roar:'roar'},name:'Lugia',cardName:'LUGIA V',location:'Tidal Cavern',modelUrl:'/assets/pokemon-3d/lugia.glb',cardUrl:'/assets/sets/silver-tempest/cards/186.webp',energyTint:'dff5ffff',multiplier:180,bet:10,audioPrefix:'lugia-'},
} as const satisfies Record<string,EncounterProfile>;
const requested=typeof location!=='undefined'?new URLSearchParams(location.search).get('pokemon'):null;
export const species:keyof typeof encounters=requested&&Object.hasOwn(encounters,requested)?requested as keyof typeof encounters:'mewtwo';
// The game embeds this scene with the price of the pack being opened, so the reward shown is the reward paid.
const stake=typeof location!=='undefined'?Number(new URLSearchParams(location.search).get('bet')):NaN;
export const encounter:EncounterProfile={...encounters[species],bet:Number.isFinite(stake)&&stake>0?stake:encounters[species].bet};
