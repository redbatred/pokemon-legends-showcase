import artwork from '../../public/assets/pokemon/manifest.json';

export type PowerKind = 'fire'|'water'|'electric'|'psychic'|'leaf'|'wind'|'ice'|'dark'|'metal'|'ground'|'fairy'|'dragon';
export type PowerCue = PowerKind|'swift'|'hyperbeam'|'shadowball'|'aeroblast'|'petals'|'hydropump'|'waterpulse'|'psystrike';
export type PowerMove='stream'|'shuriken'|'discharge'|'aura'|'blade'|'orb'|'stars'|'beam'|'wave'|'petals'|'sphere'|'pulse';
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
 const special=overrides[name],[baseColor,baseLight]=colors[kind],color=special?.color??baseColor,light=special?.light??baseLight;
 const origins:Record<string,[number,number]>={charizard:[.405,.225],pikachu:[.29,.43],blastoise:[.805,.32],gyarados:[.34,.27],rayquaza:[.35,.27]};
 return {species:name,move:special?.move??(name==='greninja'?'shuriken':kind==='electric'?'discharge':['fire','water','dragon','ice'].includes(kind)?'stream':['leaf','metal','wind'].includes(kind)?'blade':'aura'),dexId:entry?.dexId??null,kind,cue:special?.cue??kind,color,light,
  bone:name==='blastoise'?'chest':['psychic','fairy','dark','metal','ground'].includes(kind)?'chest':'head',origin:origins[name]??null,direction:name==='blastoise'?-.3:kind==='fire'||kind==='dragon'?-2.45:-2.2};
}
