import {afterEach,expect,it,vi} from 'vitest';
import {BootScreen} from './BootScreen';
function setup(){
 let finish!:()=>void;
 const status={textContent:''},help={textContent:''},retry={hidden:true,onclick:null},meter={setAttribute:vi.fn()};
 const host={inert:true,removeAttribute:vi.fn(),setAttribute:vi.fn()};
 const animation={finished:new Promise<void>(resolve=>finish=resolve),cancel:vi.fn()};
 const cover={dataset:{} as Record<string,string>,style:{setProperty:vi.fn()},remove:vi.fn(),animate:()=>animation,
  querySelector:(selector:string)=>selector.includes('progressbar')?meter:selector.includes('status')?status:selector.includes('help')?help:retry};
 vi.stubGlobal('matchMedia',()=>({matches:false}));
 return {screen:new BootScreen(cover as unknown as HTMLElement,host as unknown as HTMLElement),host,cover,status,retry,finish};
}
afterEach(()=>vi.unstubAllGlobals());
it('keeps input locked until the cover has finished fading away',async()=>{
 const {screen,host,cover,finish}=setup();const exit=screen.finish();
 expect(host.inert).toBe(true);expect(cover.remove).not.toHaveBeenCalled();
 finish();await exit;expect(host.inert).toBe(false);expect(host.setAttribute).toHaveBeenCalledWith('aria-busy','false');expect(cover.remove).toHaveBeenCalledOnce();
});
it('does not expose an incomplete game when startup fails',()=>{
 const {screen,host,cover,retry}=setup();screen.fail();
 expect(host.inert).toBe(true);expect(cover.remove).not.toHaveBeenCalled();expect(cover.dataset.state).toBe('error');expect(retry.hidden).toBe(false);
});
it('cannot unlock a destroyed game when an old fade finishes',async()=>{
 const {screen,host,cover,finish}=setup();const exit=screen.finish();screen.destroy();finish();await exit;
 expect(host.inert).toBe(true);expect(cover.remove).not.toHaveBeenCalled();
});
it('retains the failure message when other artwork requests finish afterward',()=>{
 const {screen,status}=setup();screen.fail();const message=status.textContent;screen.progress(.9,'Preparing your packs');
 expect(status.textContent).toBe(message);
});
