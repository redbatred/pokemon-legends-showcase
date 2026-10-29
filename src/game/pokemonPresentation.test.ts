import {expect,it} from 'vitest';
import {pokemonFrameSpan} from './pokemonPresentation';
it('sizes the visible body to a card height instead of the padded animation frame',()=>{const span=pokemonFrameSpan(.55,.88,0,600);expect(span*.55).toBeCloseTo(435);expect(span).toBeGreaterThan(700);});
it('keeps wide attack silhouettes inside the viewport while preserving their aspect ratio',()=>{const span=pokemonFrameSpan(.44,.92,.08,330);expect(span*(.92+.08)).toBeLessThanOrEqual(636);expect(span).toBeGreaterThan(600);});
