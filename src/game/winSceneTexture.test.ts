import {expect,it} from 'vitest';
import {Sprite,TextureSource} from 'pixi.js';
import {winSceneTexture} from './winSceneTexture';
it('updates a cached sprite quad when a late-loaded cinema canvas grows beyond its initial 300×150 size',()=>{
 const source=new TextureSource({width:300,height:150}),texture=winSceneTexture(source),sprite=new Sprite(texture);
 expect(sprite.bounds.maxX).toBe(300);expect(sprite.bounds.maxY).toBe(150);
 source.resize(864,1152);sprite.width=720;sprite.height=960;
 expect(sprite.bounds.maxX*sprite.scale.x).toBeCloseTo(720);
 expect(sprite.bounds.maxY*sprite.scale.y).toBeCloseTo(960);
 source.resize(1280,720);sprite.width=1280;sprite.height=720;
 expect(sprite.bounds.maxX*sprite.scale.x).toBeCloseTo(1280);
 expect(sprite.bounds.maxY*sprite.scale.y).toBeCloseTo(720);
 sprite.destroy();texture.destroy(true);
});
