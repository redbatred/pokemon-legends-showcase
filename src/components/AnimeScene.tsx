/** Painted scenery and platform are independent layers; light, mist and energy animate over them. */
export function AnimeScene({ active, low, revealing }: { active: boolean; low: boolean; revealing: boolean }) {
  return <div className={`anime-scene ${active?'is-active':''} ${revealing?'is-revealing':''} ${low?'low-detail':''}`} aria-hidden="true">
    <div className="selection-scene"><div className="selection-orbit orbit-one"/><div className="selection-orbit orbit-two"/><div className="selection-ball"><i/></div><svg className="selection-lines" viewBox="0 0 1600 800" preserveAspectRatio="xMidYMid slice"><g fill="none" stroke="currentColor"><path d="M0 150H480l70 70M1600 550H1160l-80 80M60 650H360l40-40M1300 90h220v100"/><circle cx="550" cy="220" r="5"/><circle cx="1080" cy="630" r="5"/></g></svg><div className="pack-aura"/></div>
    <div className="reveal-scene">
      <div className="painted-backdrop"/>
      <div className="sky-shimmer">{Array.from({length:20},(_,i)=><i key={i} style={{left:`${(i*137+17)%100}%`,top:`${(i*19)%47}%`,'--delay':`${i*-.81}s`} as React.CSSProperties}/>)}</div>
      <div className="painted-mist mist-back"/><div className="painted-mist mist-front"/>
      <div className="stage-floor-glow"/>
      <div className="painted-platform"><img src="/assets/stage/anime-platform.png" alt=""/><img className="platform-emissive" src="/assets/stage/anime-platform.png" alt=""/><div className="platform-surface-effects"><i/><i/><i/></div><div className="platform-power-flash"/></div>
      <div className="vertical-energy"/>
      <div className="spotlights"><div className="spotlight spot-left"/><div className="spotlight spot-right"/><div className="spotlight spot-center"/><i className="light-source source-left"/><i className="light-source source-right"/></div>
      <div className="anime-focus"/>
      <div className="anime-motes">{Array.from({length:24},(_,i)=><i key={i} style={{'--n':i,'--x':`${(i*137+49)%100}%`,'--delay':`${i*-.71}s`} as React.CSSProperties}/>)}</div>
      <div className="stage-scan"/><div className="reveal-impact"/>
    </div>
  </div>;
}
