import {expect,it} from 'vitest';
import {Group,Mesh,PlaneGeometry,ShaderMaterial} from 'three';
import {prepareSceneReveal} from './sceneReveal';
it('adds only one reveal uniform even when many flags share a shader',()=>{const root=new Group(),m=new ShaderMaterial({fragmentShader:'void main(){gl_FragColor=vec4(1.);}'}),geometry=new PlaneGeometry();for(let i=0;i<12;i++)root.add(new Mesh(geometry,m));expect(prepareSceneReveal(root).size).toBe(1);prepareSceneReveal(root);expect(m.fragmentShader.match(/uniform float sceneReveal/g)).toHaveLength(1);expect(m.fragmentShader.match(/gl_FragColor.a\*=sceneReveal/g)).toHaveLength(1);geometry.dispose();m.dispose();});
