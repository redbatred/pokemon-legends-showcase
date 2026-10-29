import {Box3,Color,Mesh,MeshPhysicalMaterial,Vector2,Vector3,type DataTexture,type Group,type Material,type MeshStandardMaterial,type Object3D} from 'three';
import {pokemonInkEligible,pokemonToonMaterial} from './pokemonMaterials';

export type TeraAttachment={bone:string;width:number;lift:number;forward?:number;yaw?:number};
export const pokemonBoneName=(name:string)=>name.toLowerCase().replace(/^\d+[_\s]+/,'').replace(/[_\s]*\d+$/,'');

/** A crown is a rigid accessory on the animated head, never a screen-space overlay. */
export function attachTeraCrown(model:Group,crown:Group,fit:TeraAttachment){
 model.updateMatrixWorld(true);const bounds=new Box3().setFromObject(model,true),height=bounds.max.y-bounds.min.y;
 let head:Object3D|undefined;model.traverse(o=>{if('isBone' in o&&pokemonBoneName(o.name)===fit.bone)head=o;});
 if(!head)throw new Error(`Tera crown attachment missing joint: ${fit.bone}`);
 crown.rotation.y=fit.yaw??0;crown.updateMatrixWorld(true);let cb=new Box3().setFromObject(crown,true);
 crown.scale.setScalar(height*fit.width/Math.max(.001,cb.max.x-cb.min.x));crown.updateMatrixWorld(true);cb=new Box3().setFromObject(crown,true);
 const socket=head.getWorldPosition(new Vector3());
 crown.position.set(socket.x,socket.y+height*fit.lift-cb.min.y,socket.z+height*(fit.forward??0));
 crown.updateMatrixWorld(true);head.attach(crown);
 crown.traverse(o=>{if(o instanceof Mesh)o.userData.teraCrown=true;});
}

/** Keep eyes/flame readable; crystal highlights follow actual skinned surface normals. */
export function teraMaterial(material:Material,gradient:DataTexture,crown:boolean,species=''){
 const old=material as MeshStandardMaterial;
 if(/(eye|mouth|tongue|teeth|fire|flame|glow|effect)/i.test(old.name)||(!crown&&species&&!pokemonInkEligible(species,'',[material])))return pokemonToonMaterial(old,gradient);
 const result=new MeshPhysicalMaterial({name:old.name,map:old.map??null,color:old.color??new Color('white'),normalMap:old.normalMap??null,normalScale:old.normalScale??new Vector2(1,1),bumpMap:old.bumpMap??null,bumpScale:old.bumpScale??1,transparent:old.transparent,opacity:old.opacity,alphaTest:old.alphaTest,side:old.side,vertexColors:old.vertexColors,depthWrite:old.depthWrite,emissive:old.emissive??new Color(0),emissiveMap:old.emissiveMap??null,emissiveIntensity:Math.min(old.emissiveIntensity??0,1.5)});
 result.metalness=crown?.12:.04;result.roughness=crown?.12:.18;result.clearcoat=1;result.clearcoatRoughness=.08;
 result.iridescence=crown?.3:.22;result.iridescenceIOR=1.35;result.iridescenceThicknessRange=[180,420];result.ior=1.65;
 result.flatShading=true;result.envMapIntensity=crown?1.5:1.05;
 // The native core surrounds a separate eye mesh. Its crystal shell must not occlude it.
 if(crown&&/_core(?:_back|_mark)?$/.test(old.name)){result.transparent=true;result.opacity=old.name.endsWith('_mark')?.18:.4;result.depthWrite=false;}
 return result;
}
