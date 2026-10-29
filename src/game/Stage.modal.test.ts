import {afterEach,expect,it,vi} from 'vitest';
import {OpeningStage} from './Stage';
afterEach(()=>vi.unstubAllGlobals());
it('pauses a modal without hiding or reallocating the underlying game frame',()=>{
 vi.stubGlobal('document',{hidden:false});
 const stage={blocked:false,world:{visible:true},flightLayer:{visible:true},scene:{pause:vi.fn()},timeline:{pause:vi.fn(),resume:vi.fn()},tweens:new Set(),app:{stop:vi.fn(),start:vi.fn()},mode:'card',resize:vi.fn(),draw:vi.fn()} as any;
 OpeningStage.prototype.setBlocked.call(stage,true);
 expect(stage.world.visible).toBe(true);expect(stage.flightLayer.visible).toBe(true);
 expect(stage.resize).not.toHaveBeenCalled();expect(stage.timeline.pause).toHaveBeenCalledOnce();
 OpeningStage.prototype.setBlocked.call(stage,false);
 expect(stage.resize).not.toHaveBeenCalled();expect(stage.timeline.resume).toHaveBeenCalledOnce();expect(stage.app.start).toHaveBeenCalledOnce();
});
