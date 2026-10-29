import artwork from '../../public/assets/pokemon/manifest.json';
import soundRoutes from '../../public/assets/audio-v6/species-cues.json';
import soundCues from '../../public/assets/audio-v6/cues.json';

export type PowerKind = 'fire'|'water'|'electric'|'psychic'|'leaf'|'wind'|'ice'|'dark'|'metal'|'ground'|'fairy'|'dragon';
export type PowerCue = keyof typeof soundCues|PowerKind|'swift'|'hyperbeam'|'shadowball'|'aeroblast'|'petals'|'hydropump'|'waterpulse'|'psystrike';
export type PowerMove='stream'|'shuriken'|'discharge'|'aura'|'blade'|'orb'|'stars'|'beam'|'wave'|'petals'|'sphere'|'pulse'|'crystals'|'seeds'|'slash'|'kick'|'vortex'|'firestar'|'drain'|'gyro'|'quake'|'gems'|'thunder'|'punch'|'dive'|'moon'|'origin'|'voice'|'darkpulse';
export type PowerProfile = { species:string;move:PowerMove;dexId:number|null; kind:PowerKind; cue:PowerCue; color:number; light:number; bone:string; origin:[number,number]|null; direction:number };
const groups:Record<PowerKind,string[]>={
 fire:['charizard','moltres','ninetales','cinderace'],
 water:['blastoise','greninja','gyarados','kyogre','suicune','vaporeon'],
 electric:['pikachu','raichu','raikou','zapdos','rotom','dracozolt'],
 psychic:['mewtwo','mew','alakazam','espeon','starmie'],
 leaf:['leafeon','venusaur','breloom','oddish','gloom','trevenant'],
 ice:['glaceon','articuno'],dark:['umbreon','gengar','giratina'],
 wind:['lugia','pidgeot','pidgey','aerodactyl','eevee'],dragon:['rayquaza','dragonite'],
 metal:['scizor','genesect','duraludon','forretress'],ground:['tyranitar','pinsir','clodsire'],
 fairy:['sylveon','cleffa','gardevoir','arceus'],
};
const colors:Record<PowerKind,[number,number]>={fire:[0xff633c,0xfff4bf],water:[0x269eff,0xbdfcff],electric:[0xffd537,0xffffd4],psychic:[0xbb73ff,0xffccff],leaf:[0x63de81,0xe2ff9c],wind:[0x79e9f4,0xeaffff],ice:[0x78d3ff,0xf0ffff],dark:[0x974dd9,0xd4b9ff],metal:[0x72bad3,0xedffff],ground:[0xb89368,0xeadaba],fairy:[0xf782da,0xffe1fa],dragon:[0x577aff,0xb7efff]};
export function pokemonPower(path:string):PowerProfile{
 const name=path.split(/[?#]/)[0].split('/').pop()?.replace(/\.[^.]+$/,'')??'';
 const kind=(Object.keys(groups) as PowerKind[]).find(k=>groups[k].includes(name))??'wind';
 const entry=Object.values(artwork).find(p=>p.image.split('/').pop()?.replace(/\.[^.]+$/,'')===name);
 const overrides:Record<string,{move:PowerMove;color?:number;light?:number;cue?:PowerCue}>={mewtwo:{move:'wave',cue:'psystrike'},blastoise:{move:'stream',cue:'hydropump'},gyarados:{move:'stream',cue:'hydropump'},vaporeon:{move:'pulse',cue:'waterpulse'},alakazam:{move:'wave'},lugia:{move:'beam',cue:'aeroblast'},dragonite:{move:'beam',color:0xffcf66,light:0xfff6d4,cue:'hyperbeam'},gengar:{move:'orb',cue:'shadowball'},mew:{move:'sphere'},venusaur:{move:'petals',color:0xf179ba,light:0xffdced,cue:'petals'},eevee:{move:'stars',color:0xffdc76,light:0xffffd9,cue:'swift'}};
 const ensemble:Record<string,{move:PowerMove;color?:number;light?:number}>={aerodactyl:{move:'crystals',color:0xaaa2c6,light:0xe9e2ff},arceus:{move:'beam',color:0xe2ce84,light:0xffffe8},articuno:{move:'crystals',color:0x79c8ff},breloom:{move:'seeds'},cinderace:{move:'kick'},cleffa:{move:'voice'},duraludon:{move:'beam',color:0x9dc4ee,light:0xf0faff},espeon:{move:'beam',color:0xde93f5,light:0xffdbfd},forretress:{move:'gyro'},gardevoir:{move:'wave'},genesect:{move:'beam',color:0xd388ff,light:0xffd8fc},giratina:{move:'slash',color:0xae7edc},glaceon:{move:'crystals'},gloom:{move:'petals',color:0xeaa4da,light:0xffe5f8},kyogre:{move:'origin'},leafeon:{move:'slash'},moltres:{move:'vortex'},ninetales:{move:'firestar'},oddish:{move:'drain'},pidgeot:{move:'vortex'},pinsir:{move:'slash',color:0xb7d0db,light:0xffffff},raichu:{move:'punch'},raikou:{move:'dive',color:0xffde46,light:0xffffdd},rayquaza:{move:'dive',color:0x6df0bc,light:0xe0ffdf},scizor:{move:'punch',color:0xa8d2f3,light:0xf1ffff},starmie:{move:'gems',color:0xdd8dff,light:0xffd7f6},suicune:{move:'beam',color:0x9af3e5,light:0xffc7fe},sylveon:{move:'moon'},trevenant:{move:'seeds'},tyranitar:{move:'quake'},clodsire:{move:'quake'},umbreon:{move:'darkpulse'},zapdos:{move:'thunder'}};
 const special=ensemble[name]??overrides[name],[baseColor,baseLight]=colors[kind],color=special?.color??baseColor,light=special?.light??baseLight;
 const origins:Record<string,[number,number]>={charizard:[.405,.225],pikachu:[.29,.43],blastoise:[.805,.32],gyarados:[.34,.27],rayquaza:[.35,.27]};
 return {species:name,move:special?.move??(name==='greninja'?'shuriken':kind==='electric'?'discharge':['fire','water','dragon','ice'].includes(kind)?'stream':['leaf','metal','wind'].includes(kind)?'blade':'aura'),dexId:entry?.dexId??null,kind,cue:((soundRoutes as Record<string,PowerCue>)[name]??kind),color,light,
  bone:name==='blastoise'?'chest':['psychic','fairy','dark','metal','ground'].includes(kind)?'chest':'head',origin:origins[name]??null,direction:name==='blastoise'?-.3:kind==='fire'||kind==='dragon'?-2.45:-2.2};
}

/** Use the same species routing for the fullscreen win as the actor's own attack. */
export function cardPowerKind(cardName:string):PowerKind {const name=cardName.replace(/^Radiant /,'').replace(/ (?:ex|EX|GX|V|VMAX|VSTAR)$/,'');const entry=(artwork as Record<string,{image:string}>)[name];return pokemonPower(entry?.image??name.toLowerCase()+'.png').kind;}
