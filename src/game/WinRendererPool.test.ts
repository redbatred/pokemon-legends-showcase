import {expect,it,vi} from 'vitest';
import type {WebGLRenderer} from 'three';
import {WinRendererPool} from './WinRendererPool';
const fake=()=>({renderLists:{dispose:vi.fn()},dispose:vi.fn(),forceContextLoss:vi.fn()}) as unknown as WebGLRenderer;
it('reuses a compatible renderer without losing its context between wins',()=>{
 const create=vi.fn(fake),pool=new WinRendererPool(create),first=pool.take(false);pool.release(first);
 const next=pool.take(false);expect(next.renderer).toBe(first.renderer);expect(create).toHaveBeenCalledOnce();expect(first.renderer.forceContextLoss).not.toHaveBeenCalled();pool.release(next);pool.clear();expect(first.renderer.forceContextLoss).toHaveBeenCalledOnce();
});
it('keeps active leases independent and disposes late returns after teardown',()=>{
 const create=vi.fn(fake),pool=new WinRendererPool(create),a=pool.take(false),b=pool.take(false);expect(a.renderer).not.toBe(b.renderer);
 pool.release(a);pool.clear();pool.release(b);expect(b.renderer.dispose).toHaveBeenCalledOnce();const c=pool.take(false);expect(c.renderer).not.toBe(a.renderer);expect(c.renderer).not.toBe(b.renderer);pool.release(c);pool.clear();
});
