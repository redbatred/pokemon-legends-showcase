import {expect,it} from 'vitest';
import {BufferGeometry,Float32BufferAttribute,MeshStandardMaterial,DataTexture,Texture,Vector2,NearestFilter,MeshBasicMaterial} from 'three';
import {ensurePokemonNormals,pokemonToonMaterial,pokemonInkEligible} from './pokemonMaterials';
it('retains the native normal map, strength and palette sampling when creating cel materials',()=>{
 const map=new Texture(),normalMap=new Texture();map.magFilter=NearestFilter;const old=new MeshStandardMaterial({map,normalMap,normalScale:new Vector2(.7,.4)}),toon=pokemonToonMaterial(old,new DataTexture());
 expect(toon.map).toBe(map);expect(toon.normalMap).toBe(normalMap);expect(toon.normalScale.toArray()).toEqual([.7,.4]);expect(map.magFilter).toBe(NearestFilter);
});
it('adds lighting normals to unlit source geometry without altering positions or existing authored normals',()=>{
 const g=new BufferGeometry(),p=new Float32BufferAttribute([0,0,0,1,0,0,0,1,0],3);g.setAttribute('position',p);ensurePokemonNormals(g);expect(g.getAttribute('normal').array).toEqual(new Float32Array([0,0,1,0,0,1,0,0,1]));expect(g.getAttribute('position')).toBe(p);const normal=g.getAttribute('normal');ensurePokemonNormals(g);expect(g.getAttribute('normal')).toBe(normal);
});
it('gives opaque unnamed bodies an outline while keeping eyes, flame, palette facial parts and transparent glow clean',()=>{
 const material=(name:string)=>new MeshBasicMaterial({name});expect(pokemonInkEligible('scizor','body',[material('Wing')])).toBe(true);expect(pokemonInkEligible('tyranitar','mesh',[material('Material #217')])).toBe(true);expect(pokemonInkEligible('tyranitar','mesh',[material('Material #218')])).toBe(false);expect(pokemonInkEligible('breloom','mesh',[material('PaletteMaterial002')])).toBe(false);expect(pokemonInkEligible('charizard','flame',[material('body')])).toBe(false);expect(pokemonInkEligible('mew','body',[material('body'),material('eye')])).toBe(false);
});
it('preserves Rotom’s native inverted cyan silhouette without covering its orange body with an ink shell',()=>{
 const body=new MeshStandardMaterial({name:'Material #10'}),mouth=new MeshStandardMaterial({name:'Material #11'});
 // GLTFLoader names the two primitives of the source Rotom mesh Rotom_1 and Rotom_2.
 expect(pokemonInkEligible('rotom','Rotom_1',[body])).toBe(false);
 expect(pokemonInkEligible('rotom','Rotom_Bottom',[body])).toBe(false);
 expect(pokemonInkEligible('rotom','Rotom_2',[mouth])).toBe(false);
 expect(pokemonInkEligible('rotom','Rotom_Arms',[body])).toBe(true);
 expect(pokemonInkEligible('rotom','Rotom_Tail',[body])).toBe(true);
 expect(pokemonInkEligible('giratina','Giratina_1',[new MeshStandardMaterial({name:'Material #217'})])).toBe(true);
});
