/// <reference types="vite/client" />
import './styles.css';
import { PokemonGame } from './game/Game';
import { startFrameProbe } from './game/perf';
const root=document.getElementById('root')!;
root.className='game-viewport canvas-host';root.setAttribute('aria-label','Pokémon Legends game');
const stopProbe=startFrameProbe();
const game=new PokemonGame(root);
void game.init().catch(()=>{
  const fallback=document.createElement('button');fallback.className='boot-error';fallback.textContent='Game could not load. Tap to reload.';fallback.onclick=()=>location.reload();root.append(fallback);
});
if(import.meta.hot)import.meta.hot.dispose(()=>{stopProbe();game.destroy();root.replaceChildren();});
