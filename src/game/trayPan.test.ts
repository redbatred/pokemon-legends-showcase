import {expect,it} from 'vitest';
import {TrayPan} from './trayPan';
it('separates taps from drags and clamps momentum at either end',()=>{const p=new TrayPan();p.configure(680,0);p.start(200,0);p.move(197,16);expect(p.dragged).toBe(false);p.move(100,80);expect(p.dragged).toBe(true);expect(p.offset).toBe(100);expect(p.end()).toBeGreaterThan(100);p.configure(680,650);p.start(200,0);p.move(-300,50);expect(p.offset).toBe(680);expect(p.end()).toBe(680);});
it('keeps manual scroll on redraw, clamps on resize and cancels stale gestures',()=>{const p=new TrayPan();p.configure(680,310);p.configure(500);expect(p.offset).toBe(310);p.configure(100);expect(p.offset).toBe(100);p.start(100,0);p.cancel();p.move(0,20);expect(p.offset).toBe(100);p.configure(0);expect(p.offset).toBe(0);});
