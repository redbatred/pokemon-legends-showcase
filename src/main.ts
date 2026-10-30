/// <reference types="vite/client" />
import './styles.css';
import {BootScreen} from './BootScreen';
import type {PokemonGame} from './game/Game';
const root=document.getElementById('root')!;
root.className='game-viewport canvas-host';root.setAttribute('aria-label','Pokémon Legends game');
const boot=new BootScreen(document.getElementById('boot-screen')!,root);
let game:PokemonGame|undefined,stopProbe=()=>{},disposed=false;
void (async()=>{
  // Let the lightweight intro paint before parsing or initializing WebGL / Spine.
  await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));
  const [{PokemonGame},{startFrameProbe}]=await Promise.all([import('./game/Game'),import('./game/perf')]);if(disposed)return;
  stopProbe=startFrameProbe();game=new PokemonGame(root);await game.init(boot.progress);if(!disposed)await boot.finish();
})().catch(error=>{console.error('Game startup failed',error);if(!disposed)boot.fail();});
if(import.meta.hot)import.meta.hot.dispose(()=>{disposed=true;boot.destroy();stopProbe();game?.destroy();root.replaceChildren();});
