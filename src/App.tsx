import { useEffect, useRef, useState } from 'react';
import { useMachine } from '@xstate/react';
import { Assets } from 'pixi.js';
import { Volume2, VolumeX, Settings2, Check, Plus, ArrowRight, RotateCcw, BookOpen, History, Info, Maximize2, LoaderCircle, X, Download, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import { GameStage } from './components/GameStage';
import { Dialog } from './components/Dialog';
import { AnimeScene } from './components/AnimeScene';
import { AnimatedMoney } from './components/AnimatedMoney';
import { OpeningStage } from './game/Stage';
import { openingMachine } from './game/machine';
import { createOpening, settleOpening, priceCard, money, DEFAULT_PACK, type Card, type Save, type Pack } from './game/model';
import { loadSave, transactSave, resetSave } from './game/storage';
import { setSound, playSound } from './game/audio';

type Panel = 'collection' | 'settings' | 'history' | 'about' | null;
const systemReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export default function App() {
  const [machine, send] = useMachine(openingMachine);
  const phase = machine.value as string;
  const [save, setSave] = useState<Save | null>(null);
  const [packs, setPacks] = useState<Pack[]>([DEFAULT_PACK]);
  const [selectedId, setSelectedId] = useState(DEFAULT_PACK.id);
  const [catalogs, setCatalogs] = useState<Record<string, Card[]>>({});
  const [engineReady, setEngineReady] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [panel, setPanel] = useState<Panel>(null);
  const [inspected, setInspected] = useState<Card | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const [sound, setSoundEnabled] = useState(false);
  const [reduced, setReduced] = useState(systemReduced);
  const [low, setLow] = useState(false);
  const [filter, setFilter] = useState<'all' | 'collected'>('all');
  const [toast, setToast] = useState('');
  const [retry, setRetry] = useState(0);
  const [resultId, setResultId] = useState<string | null>(null);
  const stage = useRef<OpeningStage | null>(null);
  const inspector = useRef<HTMLDivElement>(null);
  const gameShell = useRef<HTMLDivElement>(null);
  const dock = useRef<HTMLDivElement>(null);
  const index = machine.context.index;
  const current = save?.active?.cards[index];
  const result = save?.history.find(o => o.id === resultId);
  const revealed = phase === 'revealed';
  const busy = ['reserving', 'tearing', 'revealing', 'settling'].includes(phase);
  const opening = !['browse', 'complete'].includes(phase);
  const selected = save?.active?.pack ?? packs.find(p => p.id === selectedId) ?? DEFAULT_PACK;
  const pool = catalogs[selected.id] ?? [];
  const discovered = Object.keys(save?.collection ?? {}).length;
  const revealedTotal = save?.active?.cards.slice(0,index+(revealed?1:0)).reduce((n,c)=>n+c.value,0) ?? 0;
  const collectedCards = Array.from(new Map([...Object.values(catalogs).flat(), ...(save?.history.flatMap(o => o.cards) ?? [])].filter(c => c.id !== 'energy').map(c => [c.id,c])).values());

  useEffect(() => {
    loadSave().then(s => { setSave(s); if (s.active) { setSelectedId(s.active.pack?.id ?? DEFAULT_PACK.id); send({ type: 'RESUME' }); } }).catch(e => setError(e.message));
    fetch('/assets/packs.json').then(r => r.ok ? r.json() : [DEFAULT_PACK]).then((list: Pack[]) => setPacks(list)).catch(() => setPacks([DEFAULT_PACK]));
    try { const s = JSON.parse(localStorage.getItem('legends-settings') ?? '{}'); setSoundEnabled(!!s.sound); setReduced(systemReduced() || !!s.reduced); setLow(!!s.low); } catch { /* Defaults. */ }
  }, [send]);
  useEffect(() => {
    let cancelled = false;
    Promise.all(packs.map(async pack => {
      const r = await fetch(pack.catalogUrl); if (!r.ok) throw new Error(`Could not load ${pack.name}. Reload to retry.`);
      const raw: Omit<Card,'value'|'weight'>[] = await r.json();
      return [pack.id,raw.map(c => { const card = priceCard(c); return { ...card, value: Math.round(card.value * pack.price / DEFAULT_PACK.price) }; })] as const;
    })).then(entries => { if (!cancelled) setCatalogs(Object.fromEntries(entries)); }).catch(e => { if (!cancelled) setError(e.message); });
    return () => { cancelled = true; };
  }, [packs]);
  useEffect(() => {
    if (!engineReady) return;
    let cancelled = false; setReady(false);
    stage.current!.setPack(selected.packImage, '#82dfff').then(() => { if (!cancelled) setReady(true); }).catch(() => { if (!cancelled) setError('Pack image could not load. Select another pack or reload.'); });
    return () => { cancelled = true; };
  }, [engineReady, selected.packImage, selected.accent]);
  useEffect(() => { setSound(sound); try { localStorage.setItem('legends-settings', JSON.stringify({ sound, reduced, low })); } catch { /* In-memory preferences. */ } }, [sound, reduced, low]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(''), 2500); return () => clearTimeout(t); }, [toast]);
  useEffect(() => {
    if (phase !== 'reserving') return;
    transactSave(s => createOpening(s, pool, Math.random, selected)).then(s => { setSave(s); send({ type: 'RESERVED' }); }).catch(e => { setError(e.message); send({ type: 'FAIL' }); });
  }, [phase, pool, selected, send]);
  useEffect(() => { if (ready && phase === 'sealed') stage.current?.setSealed(); }, [ready, phase]);
  useEffect(() => {
    if (!ready || phase !== 'tearing') return;
    let cancelled = false;
    stage.current!.tear().then(() => { if (!cancelled) send({ type: 'TORN' }); }).catch(() => setError('Opening interrupted. Reload to resume the same pack.'));
    return () => { cancelled = true; };
  }, [phase, ready, send]);
  useEffect(() => {
    if (!ready || phase !== 'revealing' || !current) return;
    let cancelled = false;
    stage.current!.reveal(current, index === 0).then(() => { if (!cancelled) { setError(''); send({ type: 'FLIPPED' }); } }).catch(() => { if (!cancelled) setError('Card image could not load. Retry the reveal.'); });
    return () => { cancelled = true; };
  }, [phase, ready, current?.id, save?.active?.id, index, send, retry]);
  useEffect(() => {
    if (phase !== 'settling') return;
    const id = save?.active?.id; if (!id) return;
    transactSave(s => settleOpening(s,id)).then(s => { setResultId(id); setSave(s); stage.current?.showResult(); send({ type: 'SETTLED' }); playSound('complete'); }).catch(e => { setError(e.message); send({ type: 'FAIL' }); });
  }, [phase, send, save?.active?.id]);
  useEffect(() => { save?.active?.cards.forEach(c => { void Assets.load(c.image).catch(() => {}); }); }, [save?.active?.id]);
  const addCredits = async () => { try { setSave(await transactSave(s => { if (opening && s.active?.id !== save?.active?.id) throw new Error('This opening changed in another tab. Reload to sync your demo.'); return { ...s, balance: s.balance + 100000 }; })); setToast('$1,000 demo credits added'); setError(''); } catch(e) { setError((e as Error).message); } };
  const reset = () => { stage.current?.reset(); send({ type: 'RESET' }); };
  const inspect = (card: Card) => { setZoomed(false); setInspected(card); };
  const selectPack = (pack: Pack) => { if (opening) return; if (phase === 'complete') reset(); setSelectedId(pack.id); setError(''); };
  const exportCollection = () => { const url = URL.createObjectURL(new Blob([JSON.stringify(collectedCards.filter(c => save?.collection[c.id]).map(c => ({ id:c.id,name:c.name,number:c.number,copies:save?.collection[c.id] })),null,2)], { type:'application/json' })); const a = document.createElement('a'); a.href=url; a.download='pokemon-collection.json'; a.click(); URL.revokeObjectURL(url); };

  return <div className={`app ${reduced ? 'reduced-motion' : ''}`}>
    <header className="topbar"><a className="brand" href="#" onClick={e => { e.preventDefault(); setPanel(null); }} aria-label="Pokémon Legends home"><img src="/assets/pokemon-logo.png" alt="Pokémon"/><span>Legends</span></a><nav aria-label="Main navigation"><button className={!panel ? 'nav-active' : ''} onClick={() => setPanel(null)}>Open packs</button><button className={panel === 'collection' ? 'nav-active' : ''} onClick={() => setPanel('collection')}>My collection <span className="nav-count">{discovered}</span></button></nav><div className="topbar-right"><div className="wallet"><span>Demo</span><strong><AnimatedMoney amount={save?.balance ?? 10000} reduced={reduced}/></strong><button onClick={addCredits} aria-label="Add 1000 free demo credits"><Plus size={16}/></button></div><button className="icon-button" aria-label="Settings" onClick={() => setPanel('settings')}><Settings2 size={19}/></button></div></header>
    <main className="game-shell" ref={gameShell} style={{ '--accent': '#6acfff' } as React.CSSProperties}>
      <section className={`arena phase-${phase}`} aria-label={`${selected.name} opening stage`}>
        <AnimeScene active={['revealing','revealed','settling','complete'].includes(phase)} low={low} revealing={phase==='revealing'}/><div className="arena-vignette"/>
        <div className="arena-hud"><div className="pack-title"><span className="set-indicator"/>{selected.name}{opening && <small>{Math.min(index+(revealed?1:0),11)} / 11</small>}</div><div className="hud-controls"><button className="icon-button" aria-label={sound?'Mute sound':'Enable sound'} onClick={()=>setSoundEnabled(!sound)}>{sound?<Volume2 size={17}/>:<VolumeX size={17}/>}</button><button className="icon-button" aria-label="Opening history" onClick={()=>setPanel('history')}><History size={17}/></button><button className="icon-button" aria-label="Game info" onClick={()=>setPanel('about')}><Info size={17}/></button><button className="icon-button fullscreen" aria-label="Full screen" onClick={()=>{ if(document.fullscreenElement) void document.exitFullscreen(); else void gameShell.current?.requestFullscreen().catch(()=>setToast('Full screen is unavailable in this browser.')); }}><Maximize2 size={17}/></button></div></div>
        <GameStage reduced={reduced} low={low} onReady={game=>{stage.current=game;setEngineReady(true);}} onError={setError} onTear={()=>send({type:'TEAR'})} onNext={()=>send({type:'NEXT'})}/>
        {!ready && phase !== 'complete' && <div className="stage-loading"><LoaderCircle className="spin" size={24}/></div>}
        {error && <div className="error-banner" role="alert"><span>{error}</span>{phase==='revealing'&&<button onClick={()=>setRetry(n=>n+1)}>Retry</button>}<button className="icon-button" aria-label="Dismiss error" onClick={()=>setError('')}><X size={16}/></button></div>}
        {phase !== 'complete' && <div className="stage-actions">
          {revealed && current && <div className="card-caption" aria-live="polite"><div><span className="rarity-name">{current.rarity}</span><h2>{current.name}</h2></div><button className="inspect-trigger" onClick={()=>inspect(current)} aria-label={`Inspect ${current.name}`}><ZoomIn size={18}/></button><strong className="card-value" key={`${save?.active?.id}-${index}`}>{current.id==='energy'?'Energy':<AnimatedMoney amount={current.value} from={0} reduced={reduced} plus/>}</strong></div>}
          {phase==='browse'&&<button className="primary-button" disabled={!ready||!save||!pool.length} onClick={()=>{setError('');send({type:'OPEN'});}}>Open pack <span>{money(selected.price)}</span><ArrowRight size={17}/></button>}
          {phase==='sealed'&&<><span className="gesture-hint">Drag across the seal</span><button className="primary-button" disabled={!ready} onClick={()=>send({type:'TEAR'})}>Tear open <ArrowRight size={17}/></button></>}
          {busy&&<button className="primary-button" disabled><LoaderCircle className="spin" size={17}/>{phase==='reserving'?'Loading pack':phase==='tearing'?'Opening':phase==='settling'?'Saving':'Revealing'}</button>}
          {revealed&&<div className="reveal-actions"><button className="primary-button" onClick={()=>send({type:'NEXT'})}>{index===10?'Collect':'Next card'}<ArrowRight size={17}/></button>{index<10&&<button className="secondary-button" onClick={()=>send({type:'ALL'})}>Reveal all</button>}</div>}
        </div>}
        {phase==='complete'&&result&&<div className="results-board"><header><div><h1>{result.pack?.name??'Obsidian Flames'}</h1><span>{result.pack?.rewardCount??10} cards + {11-(result.pack?.rewardCount??10)} Energy</span></div><div className="result-total"><strong><AnimatedMoney amount={result.total} from={0} reduced={reduced} plus/></strong><span><Check size={13}/> Credited</span></div></header><div className="results-cards">{result.cards.map((c,i)=><button key={`${c.id}-${i}`} style={{'--i':i} as React.CSSProperties} onClick={()=>inspect(c)}><img src={c.image} alt={c.name}/><span>{c.id==='energy'?'Energy':money(c.value)}</span></button>)}</div><div className="result-actions"><button className="secondary-button" onClick={()=>setPanel('collection')}><BookOpen size={16}/> Collection</button><button className="primary-button" onClick={reset}>Continue <ArrowRight size={17}/></button></div></div>}
      </section>
      <section className={`pack-dock ${opening?'opening-dock':''}`} aria-label={opening?'Cards in this pack':'Select a pack'}>
        {opening&&save?.active?<><div className="dock-label"><span>{index+(revealed?1:0)} / 11</span><strong><AnimatedMoney amount={revealedTotal} reduced={reduced}/></strong><small>Revealed value</small></div><div className="reveal-strip">{save.active.cards.map((c,i)=><button key={i} disabled={!(i<index||(i===index&&revealed))} onClick={()=>inspect(c)} className={`reveal-thumb ${i===index?'current':''}`}><img src={i<index||(i===index&&revealed)?c.image:'/assets/card-back.webp'} alt={i<index||(i===index&&revealed)?c.name:`Unrevealed card ${i+1}`}/><span>{String(i+1).padStart(2,'0')}</span></button>)}</div></>:<><button className="dock-arrow" aria-label="Previous packs" onClick={()=>dock.current?.scrollBy({left:-420,behavior:reduced?'instant':'smooth'})}><ChevronLeft size={19}/></button><div className="pack-list" ref={dock}>{packs.map(pack=><button key={pack.id} className={`pack-option ${selected.id===pack.id?'selected':''}`} onClick={()=>selectPack(pack)} aria-pressed={selected.id===pack.id}><img src={pack.packImage} alt={`${pack.name} booster pack`}/><div><span>{pack.name}</span><strong>{money(pack.price)}</strong></div><i/></button>)}</div><button className="dock-arrow" aria-label="Next packs" onClick={()=>dock.current?.scrollBy({left:420,behavior:reduced?'instant':'smooth'})}><ChevronRight size={19}/></button></>}
      </section>
    </main>
    {toast&&<div className="toast" role="status"><Check size={16}/>{toast}</div>}
    {panel&&<Dialog title={panel==='collection'?'My collection':panel==='settings'?'Settings':panel==='history'?'Opening history':'Game info'} onClose={()=>setPanel(null)} wide={panel==='collection'}>
      {panel==='collection'&&<><div className="collection-toolbar"><div className="segmented"><button className={filter==='all'?'selected':''} onClick={()=>setFilter('all')}>{selected.name}</button><button className={filter==='collected'?'selected':''} onClick={()=>setFilter('collected')}>Collected ({discovered})</button></div><button className="icon-button" onClick={exportCollection} aria-label="Export collection"><Download size={18}/></button></div>{filter==='collected'&&!discovered?<p className="empty-state">No cards collected yet.</p>:<div className="collection-grid">{(filter==='all'?pool:collectedCards.filter(c=>save?.collection[c.id])).map(c=><button key={c.id} className="collection-card" onClick={()=>inspect(c)}><div><img src={c.image} alt={c.name} loading="lazy"/>{!!save?.collection[c.id]&&<span className="copy-count">×{save.collection[c.id]}</span>}</div><strong>{c.name}</strong><span>#{c.number}<i>{money(c.value)}</i></span></button>)}</div>}</>}
      {panel==='settings'&&<><label className="setting-row"><span>Sound effects</span><input type="checkbox" checked={sound} onChange={e=>setSoundEnabled(e.target.checked)}/></label><label className="setting-row"><span>Reduced motion</span><input type="checkbox" checked={reduced} onChange={e=>setReduced(e.target.checked)}/></label><label className="setting-row"><span>Low graphics</span><input type="checkbox" checked={low} onChange={e=>setLow(e.target.checked)}/></label><div className="settings-credit"><button className="secondary-button" onClick={addCredits}><Plus size={16}/> Add $1,000 demo credits</button></div><button className="reset-button" disabled={opening} onClick={async()=>{try{setSave(await resetSave());setError('');stage.current?.reset();if(phase==='complete')send({type:'RESET'});setPanel(null);}catch{setError('Browser storage unavailable. Enable it and reload.');}}}><RotateCcw size={14}/> Reset demo and collection</button></>}
      {panel==='history'&&<>{!save?.history.length?<p className="empty-state">No completed openings.</p>:<div className="history-list">{save.history.map(o=><div key={o.id}><img src={o.pack?.packImage??DEFAULT_PACK.packImage} alt="Booster pack"/><div><strong>{o.pack?.name??DEFAULT_PACK.name}</strong><span>{new Date(o.at).toLocaleString()}</span></div><strong>{money(o.total)}</strong></div>)}</div>}</>}
      {panel==='about'&&<div className="guide"><p>Open a pack, drag across its seal, then reveal each card. Use the magnifier to read a card at full size.</p><p>Reward values are automatically credited after the opening. Energy has no value. Cards stay in your collection.</p><p>Demo credits only. Pools and values are illustrative, not physical booster odds, market prices or a verified RTP. No payments or cash withdrawals.</p><p>Pokémon artwork belongs to its respective rights holders.</p></div>}
    </Dialog>}
    {inspected&&<Dialog title={inspected.name} onClose={()=>setInspected(null)} wide><div className={`inspector ${zoomed?'zoomed':''}`}><div className="inspect-tools"><span>{inspected.rarity} · #{inspected.number||'Energy'}</span><button className="secondary-button" onClick={()=>setZoomed(!zoomed)}><ZoomIn size={16}/>{zoomed?'Fit':'Full size'}</button></div><div className="inspect-scroll"><div className="inspect-card" ref={inspector} onPointerMove={e=>{if(reduced||zoomed)return;const r=e.currentTarget.getBoundingClientRect();const x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;inspector.current?.style.setProperty('--rx',`${(y-.5)*-8}deg`);inspector.current?.style.setProperty('--ry',`${(x-.5)*10}deg`);inspector.current?.style.setProperty('--mx',`${x*100}%`);}} onPointerLeave={()=>{inspector.current?.style.setProperty('--rx','0deg');inspector.current?.style.setProperty('--ry','0deg');}}><img src={inspected.image} alt={`${inspected.name} card ${inspected.number}`}/>{!zoomed&&inspected.value>=600&&<div className="inspect-foil"/>}</div></div></div></Dialog>}
  </div>;
}
