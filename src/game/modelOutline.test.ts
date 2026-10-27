import {expect,it} from 'vitest';
import {BoxGeometry} from 'three';
import {createModelOutline} from './modelOutline';

it('keeps outline thickness identical after converting centimeter and meter meshes to world units',()=>{
 const widths:number[]=[];
 for(const units of [1,100]){
  const geometry=new BoxGeometry(units,2*units,units),ink=createModelOutline(geometry),shader={vertexShader:'#include <begin_vertex>'};
  ink.onBeforeCompile(shader as never,undefined as never);
  expect(shader.vertexShader).toContain('normalize(normal)');expect(shader.vertexShader).not.toContain('objectNormal');
  widths.push(Number(shader.vertexShader.match(/\* ([\d.]+);/)![1])/units);
  geometry.dispose();ink.dispose();
 }
 expect(widths[0]).toBeCloseTo(widths[1],8);expect(widths[0]).toBeCloseTo(.004,8);
});
