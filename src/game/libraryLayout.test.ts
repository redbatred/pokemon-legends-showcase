import {expect,it} from 'vitest';
import {modalLayout} from './modalLayout';
import {binderLayout,historyLayout} from './libraryLayout';
it('keeps binder pockets and history records within the body and clear of the footer',()=>{for(const [w,h] of [[320,568],[390,780],[568,320],[844,390],[760,740],[980,780]]){const b=binderLayout(w,h);for(let i=0;i<b.size;i++){const s=b.slot(i);expect(s.width).toBeGreaterThan(50);expect(s.height).toBeGreaterThan(60);expect(s.x+s.width).toBeLessThanOrEqual(w-b.pad+.01);expect(s.y+s.height).toBeLessThanOrEqual(h-81);}const a=historyLayout(w,h);expect(a.top+a.rows*a.rowHeight+(a.rows-1)*a.gap).toBeLessThanOrEqual(h-70);}});

it('uses actual inset modal dimensions on short landscape screens',()=>{for(const [w,h] of [[720,320],[844,320],[844,390],[1280,780]]){const c=modalLayout(w,h,'collection'),b=binderLayout(c.width,c.height);for(let i=0;i<b.size;i++){const s=b.slot(i);expect(s.height).toBeGreaterThanOrEqual(70);expect(s.y+s.height).toBeLessThan(c.height-73);}const f=modalLayout(w,h,'history'),a=historyLayout(f.width,f.height);expect(a.top+a.rows*a.rowHeight+(a.rows-1)*a.gap).toBeLessThan(f.height-73);}});
