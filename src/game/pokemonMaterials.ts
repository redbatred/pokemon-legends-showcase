import {MeshToonMaterial,Color,Vector2,TangentSpaceNormalMap,type DataTexture,type Material,type MeshStandardMaterial,type BufferGeometry} from 'three';
/** Preserve source texture detail while converting only its lighting model to cel shading. */
export function pokemonToonMaterial(material:Material,gradient:DataTexture){
 const old=material as MeshStandardMaterial;
 return new MeshToonMaterial({name:old.name,map:old.map??null,color:old.color??new Color('white'),gradientMap:gradient,normalMap:old.normalMap??null,normalScale:old.normalScale??new Vector2(1,1),normalMapType:old.normalMapType??TangentSpaceNormalMap,bumpMap:old.bumpMap??null,bumpScale:old.bumpScale??1,transparent:old.transparent,opacity:old.opacity,alphaTest:old.alphaTest,side:old.side,vertexColors:old.vertexColors,depthWrite:old.depthWrite,emissive:old.emissive??new Color(0),emissiveMap:old.emissiveMap??null,emissiveIntensity:Math.min(old.emissiveIntensity??0,1.5)});
}
export function ensurePokemonNormals(geometry:BufferGeometry){if(!geometry.hasAttribute('normal'))geometry.computeVertexNormals();}
const facialParts:Record<string,number[]>={arceus:[23],breloom:[2,3],gardevoir:[61,64],genesect:[257,258],giratina:[218],kyogre:[35],raikou:[27],rayquaza:[35],rotom:[11],sylveon:[10,12],tyranitar:[218]};
// Rotom's body already includes a reverse-wound cyan halo around the orange core.
// Adding a BackSide ink shell renders that halo's near surface over the entire face.
// Its bottom uses the same native hull; the outward-wound arms and tail remain inked.
const nativeSilhouetteParts:Record<string,RegExp>={rotom:/^Rotom(?:_1|_Bottom)?$/};
export function pokemonInkEligible(species:string,meshName:string,materials:Material[]){return !nativeSilhouetteParts[species]?.test(meshName)&&materials.length>0&&materials.every(material=>{
 const m=material as MeshStandardMaterial,number=Number(m.name.match(/(\d+)$/)?.[1]);
 return !m.transparent&&m.opacity>=.98&&m.alphaTest===0&&!m.emissiveMap&&!/(eye|mouth|tongue|teeth|fire|flame|glow|effect)/i.test(m.name+' '+meshName)&&!(facialParts[species]??[]).includes(number);
});}
