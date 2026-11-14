import {Filter,GlProgram,type Texture} from 'pixi.js';
const vertex=`in vec2 aPosition;out vec2 vTextureCoord;out vec2 vLocal;uniform vec4 uInputSize;uniform vec4 uOutputFrame;uniform vec4 uOutputTexture;void main(){vec2 p=aPosition*uOutputFrame.zw+uOutputFrame.xy;p.x=p.x*(2./uOutputTexture.x)-1.;p.y=p.y*(2.*uOutputTexture.z/uOutputTexture.y)-uOutputTexture.z;gl_Position=vec4(p,0.,1.);vTextureCoord=aPosition*(uOutputFrame.zw*uInputSize.zw);vLocal=aPosition;}`;
// The drawing owns coverage: a finger changes into a current in its attachment,
// rather than remaining an intact finger with a bright stripe painted over it.
// Original model shading is retained only on the unconverted part of the pose.
const fragment=`in vec2 vTextureCoord;in vec2 vLocal;out vec4 finalColor;uniform sampler2D uTexture;uniform sampler2D uVolumeTexture;uniform vec4 uMapping;uniform float uFrame;uniform float uTime;uniform float uSpecies;
void main(){vec4 c=texture(uTexture,vTextureCoord);vec2 p=vLocal*uMapping.xy+uMapping.zw;vec4 volume=texture(uVolumeTexture,clamp(p,vec2(0.),vec2(1.)));vec3 art=c.rgb/max(c.a,.0001);vec3 original=volume.rgb/max(volume.a,.0001);
float colored=uSpecies>.5?max(art.b-art.r,art.g-art.r):max(art.r-art.g,art.b-art.g);
float current=smoothstep(.045,.23,colored)*smoothstep(1.,3.8,uFrame);
float conversion=max(current,smoothstep(3.5,7.,uFrame));
conversion=max(conversion,1.-smoothstep(.05,.6,volume.a));
vec3 result=mix(original,art,conversion);
// Small moving bright cores stay inside the drawn current, not the whole body.
float light=dot(art,vec3(.2126,.7152,.0722));float wave=pow(.5+.5*sin(p.x*94.-p.y*36.-uTime*27.),8.);
result+=vec3(.12,.12,.15)*wave*smoothstep(.72,.97,light)*conversion;
finalColor=vec4(result*c.a,c.a);}`;
export function createCaptureMaterial(species:string,mapping:number[],volumeTexture:Texture){
 const filter=new Filter({glProgram:GlProgram.from({vertex,fragment}),clipToViewport:false,padding:0,resources:{uVolumeTexture:volumeTexture.source,material:{uMapping:{value:mapping,type:'vec4<f32>'},uFrame:{value:0,type:'f32'},uTime:{value:0,type:'f32'},uSpecies:{value:species==='lugia'?1:0,type:'f32'}}}});filter.blendMode='add';
 return{filter,setMapping(value:number[]){filter.resources.material.uniforms.uMapping=value;},sample(time:number,frame:number){filter.resources.material.uniforms.uTime=time;filter.resources.material.uniforms.uFrame=frame;}};
}
