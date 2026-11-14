import {createOpening,type Card,type Pack,type Save} from './model';
import {createPreviewOpening} from './previewOpening';
import {isSpecialCard} from './specialCard';
import type {PokemonArtwork} from './specialReward';
import {assignMockShowdownSymbols} from './showdown/showdownSymbols';
import {PACK_TIERS} from './packFinaleMotion';

/** Demo cheats: the presenter picks what the next pack holds. They only choose the outcome; the pack is then dealt, saved,
 * revealed and paid by the game's own rules, so every screen that follows is the real one. Demo credits only. */
export const CHEAT_WINS=['random','normal','special','big','mega','epic','legendary'] as const;
export const CHEAT_TOTALS=['random','big','mega','epic','legendary'] as const;
export const CHEAT_BONUSES=['random','off','capture','escape'] as const;
export const CHEAT_LEGENDARIES=['lugia','mewtwo'] as const;
export type CheatWin=typeof CHEAT_WINS[number];
export type CheatTotal=typeof CHEAT_TOTALS[number];
export type CheatBonus=typeof CHEAT_BONUSES[number];
export type CheatLegendary=typeof CHEAT_LEGENDARIES[number];
export interface Cheats{/** The Pokémon win on the pack's first card. */win:CheatWin;/** The least the pack pays in all: the end screen's tier. */total:CheatTotal;/** Whether the three bonus balls come, and how the throw ends. */bonus:CheatBonus;/** The legendary met in the bonus. */legendary:CheatLegendary}
export const NO_CHEATS:Cheats={win:'random',total:'random',bonus:'random',legendary:'lugia'};
export const cheatsActive=(cheats:Cheats)=>cheats.win!=='random'||cheats.total!=='random'||cheats.bonus!=='random'||cheats.legendary!==NO_CHEATS.legendary;

/** What the first card pays, in pack prices, for each Pokémon win: a value inside that tier's band of `winTier`. */
export const HERO_MULTIPLE:Record<Exclude<CheatWin,'random'|'normal'|'special'>,number>={big:4,mega:12,epic:30,legendary:160};
/** The pack total each end-screen tier starts at, in pack prices. */
export const totalMultiple=(total:Exclude<CheatTotal,'random'>)=>PACK_TIERS.find(tier=>tier.tier===total)!.at;

export const CHEAT_LABELS={
 win:{random:'Random',normal:'Normal',special:'Special',big:'Big win',mega:'Mega win',epic:'Epic win',legendary:'Legendary'} satisfies Record<CheatWin,string>,
 total:{random:'Random',big:`Big ${totalMultiple('big')}×`,mega:`Mega ${totalMultiple('mega')}×`,epic:`Epic ${totalMultiple('epic')}×`,legendary:`Legend ${totalMultiple('legendary')}×`} satisfies Record<CheatTotal,string>,
 bonus:{random:'Random',off:'Off',capture:'Caught',escape:'Escaped'} satisfies Record<CheatBonus,string>,
 legendary:{lugia:'Lugia',mewtwo:'Mewtwo'} satisfies Record<CheatLegendary,string>,
};
/** One line saying what the next pack will do. */
export function cheatSummary(cheats:Cheats){
 const parts:string[]=[];
 if(cheats.win==='normal')parts.push('no special Pokémon');else if(cheats.win!=='random')parts.push(`${CHEAT_LABELS.win[cheats.win].toLowerCase()} on the first card`);
 if(cheats.total!=='random')parts.push(`pays at least ${totalMultiple(cheats.total)}× the pack`);
 if(cheats.bonus==='off')parts.push('no bonus');else if(cheats.bonus!=='random')parts.push(`bonus: ${CHEAT_LABELS.legendary[cheats.legendary]} ${cheats.bonus==='capture'?'is caught':'escapes'}`);
 else if(cheats.legendary!==NO_CHEATS.legendary)parts.push(`bonus legendary: ${CHEAT_LABELS.legendary[cheats.legendary]}`);
 return parts.length?`Next pack: ${parts.join(' · ')}.`:'Cheats off. Every pack is random.';
}

const special=(card:Card,price:number)=>isSpecialCard(card)||card.value>=price;
const unit=(rng:()=>number)=>Math.min(.9999999,Math.max(0,rng()));
/** The pack's own cards with every special one swapped for an ordinary card of the set. */
function plainCards(cards:Card[],pool:Card[],price:number,count:number,rng:()=>number){
 const real=cards.slice(0,count),used=new Set(real.map(card=>card.id)),spare=pool.filter(card=>!special(card,price)&&!used.has(card.id));
 const swapped=real.map(card=>special(card,price)&&spare.length?spare.splice(Math.floor(unit(rng)*spare.length),1)[0]:card);
 return [...swapped.sort((a,b)=>a.value-b.value),...cards.slice(count)];
}
/** Open a pack under the chosen cheats. With none chosen this is exactly the ordinary opening. `armed` is the existing
 * test hook that guarantees the three bonus balls. */
export function createCheatOpening(save:Save,pool:Card[],pack:Pack,art:PokemonArtwork,cheats:Cheats=NO_CHEATS,rng:()=>number=Math.random,armed=false):Save{
 const hero=cheats.total!=='random'||!['random','normal'].includes(cheats.win),plain=cheats.win==='normal'&&!hero;
 const opened=plain?createOpening(save,pool,rng,pack):hero?createPreviewOpening(save,pool,pack,art,rng,true):createPreviewOpening(save,pool,pack,art,rng);
 if(opened===save||!opened.active)return opened;
 const count=pack.rewardCount,showdownSymbols=cheats.bonus==='off'?[]:assignMockShowdownSymbols(count,armed||cheats.bonus==='capture'||cheats.bonus==='escape',rng);
 const active={...opened.active,showdownSymbols};
 if(plain){active.cards=plainCards(active.cards,pool,pack.price,count,rng);delete active.previewSpecial;}
 // The first card is one of the set's showcase Pokémon; its value decides the win it plays and what the pack pays.
 else if(hero&&active.previewSpecial){
  const first=active.cards[0],tier=cheats.win==='random'||cheats.win==='normal'||cheats.win==='special'?Math.min(first.value,Math.round(pack.price*1.5)):HERO_MULTIPLE[cheats.win]*pack.price;
  active.cards=[{...first,value:Math.max(tier,cheats.total==='random'?0:totalMultiple(cheats.total)*pack.price)},...active.cards.slice(1)];
 }
 return {...opened,active};
}
