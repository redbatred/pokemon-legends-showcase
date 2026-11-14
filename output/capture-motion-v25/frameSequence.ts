import {Container,MeshPlane,Shader,GlProgram,type Texture} from 'pixi.js';
import {clamp,smooth} from './model';
const vertex=`in vec2 aPosition;in vec2 aUV;out vec2 vUV;out vec4 vColor;uniform mat3 uProjectionMatrix;uniform mat3 uWorldTransformMatrix;uniform mat3 uTransformMatrix;uniform vec4 uWorldColorAlpha;uniform vec4 uColor;void main(){vec3 p=uProjectionMatrix*uWorldTransformMatrix*uTransformMatrix*vec3(aPosition,1.);gl_Position=vec4(p.xy,0.,1.);vUV=aUV;vColor=uWorldColorAlpha*uColor;}`;
const fragment=`in vec2 vUV;in vec4 vColor;out vec4 finalColor;uniform sampler2D uTexture;uniform vec4 uCellA;uniform vec4 uCellB;uniform float uBlend;void main(){vec4 a=texture(uTexture,uCellA.xy+vUV*uCellA.zw);vec4 b=texture(uTexture,uCellB.xy+vUV*uCellB.zw);float edge=smoothstep(.035,.085,min(min(vUV.x,1.-vUV.x),min(vUV.y,1.-vUV.y)));finalColor=mix(a,b,uBlend)*vColor*edge;}`;
/** Interpolate premultiplied artwork pixels, preserving opaque cover at a
 * frame boundary. Two alpha-over sprites would lose 25% coverage mid-blend. */
export function createFrameSequence(texture:Texture,size=520){
 const container=new Container(),mesh=new MeshPlane({texture,verticesX:2,verticesY:2});
 mesh.geometry.batchMode='no-batch';mesh.width=mesh.height=size;mesh.position.set(-size/2);container.addChild(mesh);
 const shader=new Shader({glProgram:GlProgram.from({vertex,fragment}),resources:{uTexture:texture.source,frames:{uCellA:{value:[0,0,.25,.25],type:'vec4<f32>'},uCellB:{value:[0,0,.25,.25],type:'vec4<f32>'},uBlend:{value:0,type:'f32'}}}});mesh.shader=Object.assign(shader,{texture});
 function cell(i:number){const x=Math.floor(i%4*texture.width/4),y=Math.floor(Math.floor(i/4)*texture.height/4),right=Math.floor((i%4+1)*texture.width/4),bottom=Math.floor((Math.floor(i/4)+1)*texture.height/4);return[(x+.5)/texture.width,(y+.5)/texture.height,(right-x-1)/texture.width,(bottom-y-1)/texture.height];}
 function sample(frame:number){const f=clamp(frame/15)*15,a=Math.floor(f),b=Math.min(15,a+1),u=shader.resources.frames.uniforms;u.uCellA=cell(a);u.uCellB=cell(b);u.uBlend=smooth(f-a);}
 return {container,sample};
}
