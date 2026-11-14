import {Assets} from 'pixi.js';
import {AtlasAttachmentLoader,SkeletonJson,TextureAtlas,type SkeletonData} from '@esotericsoftware/spine-pixi-v8';
let data:Promise<SkeletonData>|undefined;
export function loadPressureRig(){return data??=Promise.all([Assets.load<TextureAtlas>('/assets/arena-pressure-v47/pressure.atlas'),Assets.load('/assets/arena-pressure-v47/pressure.json')]).then(([atlas,json])=>new SkeletonJson(new AtlasAttachmentLoader(atlas)).readSkeletonData(json));}

let arenaData:Promise<SkeletonData>|undefined;
export function loadArenaPressureRig(){return arenaData??=Promise.all([Assets.load<TextureAtlas>('/assets/arena-pressure-v54/pressure.atlas'),Assets.load('/assets/arena-pressure-v54/pressure.json')]).then(([atlas,json])=>new SkeletonJson(new AtlasAttachmentLoader(atlas)).readSkeletonData(json));}
