import {expect,it} from 'vitest';
import {Texture} from 'pixi.js';
import {Spine,SkeletonData,BoneData,SlotData,Skin,RegionAttachment,TextureRegion,SpineTexture} from '@esotericsoftware/spine-pixi-v8';
import {spineTextures} from './prepareWinEffects';
it('finds hidden Spine atlas textures once even when multiple attachments share them',()=>{
 const data=new SkeletonData(),bone=new BoneData(0,'root',null),slot=new SlotData(0,'flame',bone),skin=new Skin('default');data.bones.push(bone);data.slots.push(slot);data.skins.push(skin);data.defaultSkin=skin;
 const atlas=SpineTexture.from(Texture.WHITE.source);
 for(const name of ['frame1','frame2']){const attachment=new RegionAttachment(name,name),region=new TextureRegion();region.texture=atlas;attachment.region=region;skin.setAttachment(0,name,attachment);}
 const rig=new Spine({skeletonData:data,autoUpdate:false});rig.visible=false;
 expect(spineTextures(rig)).toEqual([atlas.texture]);rig.destroy();
});
