export type EntranceKind='land'|'dash'|'soar'|'levitate'|'coil'|'bloom'|'phase';
export type PerformanceProfile={entrance:EntranceKind;grounded:boolean;side:number;lift:number;settle:number;weight:number;cameraYaw:number;cameraElevation:number;impact:number};
const entries:Record<string,EntranceKind>={
 aerodactyl:'soar',alakazam:'levitate',arceus:'levitate',articuno:'soar',blastoise:'land',breloom:'dash',charizard:'land',cinderace:'dash',cleffa:'bloom',dracozolt:'land',dragonite:'soar',duraludon:'land',eevee:'dash',espeon:'levitate',forretress:'levitate',gardevoir:'levitate',genesect:'land',gengar:'phase',giratina:'phase',glaceon:'land',gloom:'bloom',greninja:'dash',gyarados:'coil',kyogre:'soar',leafeon:'dash',lugia:'soar',mew:'levitate',mewtwo:'levitate',moltres:'soar',ninetales:'bloom',oddish:'bloom',clodsire:'land',pidgeot:'soar',pidgey:'soar',pikachu:'dash',pinsir:'land',raichu:'dash',raikou:'dash',rayquaza:'coil',rotom:'phase',scizor:'dash',starmie:'levitate',suicune:'dash',sylveon:'bloom',trevenant:'phase',tyranitar:'land',umbreon:'phase',vaporeon:'bloom',venusaur:'land',zapdos:'soar',
};
const base:Record<EntranceKind,Pick<PerformanceProfile,'side'|'lift'|'settle'|'weight'|'impact'>>={
 land:{side:0,lift:29,settle:65,weight:1,impact:1},dash:{side:-43,lift:49,settle:65,weight:.65,impact:.8},soar:{side:26,lift:83,settle:30,weight:.4,impact:.55},levitate:{side:0,lift:48,settle:35,weight:.2,impact:.45},coil:{side:-17,lift:68,settle:49,weight:.6,impact:.85},bloom:{side:13,lift:30,settle:65,weight:.5,impact:.6},phase:{side:0,lift:45,settle:46,weight:.18,impact:.65},
};
export function performanceProfile(species:string):PerformanceProfile{
 const entrance=entries[species]??'land';const cameras:Record<string,[number,number]>={blastoise:[-12,4],greninja:[52,3],mewtwo:[22,7],alakazam:[9,5],gengar:[-14,6],scizor:[32,5],gyarados:[30,5],lugia:[25,5],rayquaza:[28,5],kyogre:[24,12]};const camera=cameras[species]??[22,7];
 const grounded=['land','dash','bloom'].includes(entrance)||['alakazam','espeon','gardevoir','mewtwo','starmie','umbreon','trevenant','gengar'].includes(species);
 return {entrance,grounded,...base[entrance],cameraYaw:camera[0],cameraElevation:camera[1],...(['tyranitar','duraludon','venusaur','blastoise'].includes(species)?{weight:1.2,impact:1.15}:{}),...(species==='mew'?{side:30,lift:65}:{}),...(species==='pikachu'?{side:34,lift:60}:{}),...(species==='eevee'?{side:-28,lift:42}:{}),...(species==='giratina'?{lift:80,settle:20}:{}),...(species==='arceus'?{lift:65,settle:12}:{}),...(species==='suicune'?{side:40,lift:56}:{})};
}
