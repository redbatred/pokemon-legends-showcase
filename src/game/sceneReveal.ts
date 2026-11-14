import {Mesh,ShaderMaterial,type Material,type Object3D} from 'three';
/** Shared flag/light materials must be patched once, not once per mesh. */
export function prepareSceneReveal(root:Object3D){
 const materials=new Set<Material>();
 root.traverse(object=>{
  if(!(object instanceof Mesh))return;
  for(const material of Array.isArray(object.material)?object.material:[object.material]){
   if(materials.has(material))continue;
   materials.add(material);material.transparent=true;
   if(material instanceof ShaderMaterial&&!material.uniforms.sceneReveal){
    material.uniforms.sceneReveal={value:0};
    material.fragmentShader='uniform float sceneReveal;\n'+material.fragmentShader.replace(/}\s*$/,'gl_FragColor.a*=sceneReveal;}');
   }
  }
 });
 return materials;
}
