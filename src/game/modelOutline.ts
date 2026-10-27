import {BackSide,MeshBasicMaterial,Vector3,type BufferGeometry} from 'three';

/** Extrude the native normal before skinning. Imported bone scales must not inflate the ink shell. */
export function createModelOutline(geometry:BufferGeometry){
 geometry.computeBoundingBox();const size=geometry.boundingBox!.getSize(new Vector3());
 const width=Math.max(size.x,size.y,size.z)*.002;
 const ink=new MeshBasicMaterial({color:0x25374a,side:BackSide});
 ink.onBeforeCompile=shader=>{shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>\n transformed += normalize(normal) * ${width.toFixed(8)};`);};
 ink.customProgramCacheKey=()=>`native-outline-${width.toFixed(8)}`;
 return ink;
}
