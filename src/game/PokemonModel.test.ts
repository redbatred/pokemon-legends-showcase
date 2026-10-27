import {afterEach,expect,it,vi} from 'vitest';
import {Bone,BufferGeometry,Group,MeshBasicMaterial,Skeleton,SkinnedMesh} from 'three';
const loader=vi.hoisted(()=>({load:vi.fn(),dispose:vi.fn()}));
vi.mock('three/addons/loaders/GLTFLoader.js',()=>({GLTFLoader:class{setDRACOLoader(){return this;}loadAsync=loader.load;}}));
vi.mock('three/addons/loaders/DRACOLoader.js',()=>({DRACOLoader:class{setDecoderPath(){return this;}setWorkerLimit(){return this;}dispose=loader.dispose;}}));
import {createPokemonModel,disposePokemonRenderer} from './PokemonModel';
afterEach(()=>{disposePokemonRenderer();vi.unstubAllGlobals();});
it('discards a model that finishes after teardown, releases bones, and waits for active decodes before terminating workers',async()=>{
 vi.stubGlobal('fetch',vi.fn(async()=>({ok:true,json:async()=>({charizard:{path:'/charizard.glb',idle:'idle'}})})));
 const root=new Group(),geometry=new BufferGeometry(),material=new MeshBasicMaterial(),mesh=new SkinnedMesh(geometry,material),bone=new Bone();mesh.add(bone);mesh.bind(new Skeleton([bone]));mesh.skeleton.computeBoneTexture();root.add(mesh);
 const boneDispose=vi.spyOn(mesh.skeleton,'dispose'),geometryDispose=vi.spyOn(geometry,'dispose'),materialDispose=vi.spyOn(material,'dispose');
 let finish!:(value:unknown)=>void;loader.load.mockReturnValue(new Promise(resolve=>{finish=resolve;}));
 const result=createPokemonModel('/assets/pokemon/charizard.png',false);await vi.waitFor(()=>expect(loader.load).toHaveBeenCalledOnce());
 disposePokemonRenderer();expect(loader.dispose).not.toHaveBeenCalled();finish({scene:root,animations:[]});
 expect(await result).toBeNull();expect(loader.dispose).toHaveBeenCalledOnce();expect(boneDispose).toHaveBeenCalledOnce();expect(geometryDispose).toHaveBeenCalledOnce();expect(materialDispose).toHaveBeenCalledOnce();
});
