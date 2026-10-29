import {expect,it} from 'vitest';
import {Bone,Box3,BoxGeometry,DataTexture,Group,Mesh,MeshStandardMaterial,Texture,Vector3} from 'three';
import {attachTeraCrown,pokemonBoneName,teraMaterial} from './teraAppearance';

it('keeps the original skin and face textures while giving the body a reflective crystal surface',()=>{
 const map=new Texture(),normalMap=new Texture(),source=new MeshStandardMaterial({name:'body',map,normalMap});
 const result=teraMaterial(source,new DataTexture(),false);
 expect(result.type).toBe('MeshPhysicalMaterial');expect(result.map).toBe(map);expect(result.normalMap).toBe(normalMap);
 expect((result as any).clearcoat).toBe(1);expect((result as any).flatShading).toBe(true);expect(result.opacity).toBe(1);
 const eye=teraMaterial(new MeshStandardMaterial({name:'Eye',map}),new DataTexture(),false);
 expect(eye.type).toBe('MeshToonMaterial');expect(eye.map).toBe(map);
 expect(teraMaterial(new MeshStandardMaterial({name:'Material #218',map}),new DataTexture(),false,'tyranitar').type).toBe('MeshToonMaterial');
 const core=teraMaterial(new MeshStandardMaterial({name:'M_crown_core',map}),new DataTexture(),true);
 expect(core.transparent).toBe(true);expect(core.depthWrite).toBe(false);expect(core.opacity).toBeLessThan(.6);
 const mark=teraMaterial(new MeshStandardMaterial({name:'M_crown_core_mark',map}),new DataTexture(),true);expect(mark.transparent).toBe(true);expect(mark.depthWrite).toBe(false);expect(mark.opacity).toBeLessThan(.3);
});
it('attaches the crown above the head and follows the animated joint without changing the body geometry',()=>{
 const model=new Group(),body=new Mesh(new BoxGeometry(2,4,2)),head=new Bone();head.name='013_Head';head.position.set(0,1,0);model.add(body,head);
 const crown=new Group();crown.add(new Mesh(new BoxGeometry(2,1,2)));const position=body.geometry.getAttribute('position').array.slice();
 attachTeraCrown(model,crown,{bone:'head',width:.5,lift:.125});
 expect(crown.parent).toBe(head);expect(crown.getWorldPosition(new Vector3()).y).toBeCloseTo(2);
 const before=crown.getWorldPosition(new Vector3());head.rotation.z=Math.PI/2;model.updateMatrixWorld(true);
 expect(crown.getWorldPosition(new Vector3()).distanceTo(before)).toBeGreaterThan(.5);
 expect(body.geometry.getAttribute('position').array).toEqual(position);
 expect(crown.children[0].userData.teraCrown).toBe(true);
});
it('recognizes both HOME and native exported head and waist joints',()=>{
 expect(pokemonBoneName('013_Head')).toBe('head');expect(pokemonBoneName('head_33')).toBe('head');expect(pokemonBoneName('003_Waist')).toBe('waist');
});
it('keeps accessory size and seat stable when a source root carries a unit conversion',()=>{
 const model=new Group(),head=new Bone();head.name='Head';head.position.y=1;model.scale.setScalar(2);model.position.x=3;model.add(head,new Mesh(new BoxGeometry(2,4,2)));
 const crown=new Group();crown.add(new Mesh(new BoxGeometry(2,1,2)));attachTeraCrown(model,crown,{bone:'head',width:.5,lift:.125});
 const box=new Box3().setFromObject(crown,true);expect(box.max.x-box.min.x).toBeCloseTo(4);expect(box.min.y).toBeCloseTo(3);expect(crown.getWorldPosition(new Vector3()).x).toBeCloseTo(3);
});
it('preserves the native mounting origin of asymmetric crown artwork',()=>{
 const model=new Group(),head=new Bone();head.name='Head';model.add(head,new Mesh(new BoxGeometry(2,4,2)));
 const crown=new Group(),star=new Mesh(new BoxGeometry(2,1,1));star.position.set(.8,.5,-.4);crown.add(star);attachTeraCrown(model,crown,{bone:'head',width:.5,lift:0});
 expect(crown.getWorldPosition(new Vector3()).x).toBeCloseTo(0);expect(crown.getWorldPosition(new Vector3()).z).toBeCloseTo(0);
});
