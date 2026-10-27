import { useEffect, useRef } from 'react';
import { OpeningStage } from '../game/Stage';
type Props = { reduced: boolean; low: boolean; onReady: (stage: OpeningStage) => void; onError: (message: string) => void; onTear: () => void; onNext: () => void };
export function GameStage(props: Props) {
  const host = useRef<HTMLDivElement>(null);
  const current = useRef(props); current.current = props;
  const stage = useRef<OpeningStage | null>(null);
  useEffect(() => {
    const game = new OpeningStage(host.current!, { reduced: current.current.reduced, low: current.current.low, onTear: () => current.current.onTear(), onNext: () => current.current.onNext() });
    stage.current = game;
    game.init().then(() => { if (!game.destroyed) current.current.onReady(game); }).catch(() => current.current.onError('The animation could not load. Please reload to try again.'));
    return () => game.destroy();
  }, []);
  useEffect(() => { stage.current?.updateOptions({ reduced: props.reduced, low: props.low, onTear: props.onTear, onNext: props.onNext }); }, [props.reduced, props.low, props.onTear, props.onNext]);
  return <div ref={host} className="stage-canvas" />;
}
