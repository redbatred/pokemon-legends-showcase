import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { money } from '../game/model';

/** DOM-only number animation: no React updates inside animation frames. */
export function AnimatedMoney({ amount, reduced, from, plus = false }: { amount: number; reduced: boolean; from?: number; plus?: boolean }) {
  const element = useRef<HTMLSpanElement>(null);
  const initial = useRef(from ?? amount);
  const value = useRef({ cents: initial.current });
  const format = (n: number) => `${plus && n > 0 ? '+' : ''}${money(Math.round(n))}`;
  useLayoutEffect(() => {
    if (!element.current) return;
    if (reduced) { value.current.cents = amount; element.current.textContent = format(amount); return; }
    const animation = gsap.to(value.current, { cents: amount, duration: .85, ease: 'power2.out', onUpdate: () => { if (element.current) element.current.textContent = format(value.current.cents); } });
    return () => { animation.kill(); };
  }, [amount, reduced, plus]);
  return <span className="animated-money" aria-label={format(amount)}><span ref={element} aria-hidden="true">{format(initial.current)}</span></span>;
}
