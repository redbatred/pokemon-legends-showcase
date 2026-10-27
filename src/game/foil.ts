import { Filter, GlProgram } from 'pixi.js';
const vertex = `
in vec2 aPosition;
out vec2 vTextureCoord;
out highp vec2 vCardCoord;
uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;
void main() {
 vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
 position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
 position.y = position.y * (2.0 * uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;
 gl_Position = vec4(position, 0.0, 1.0);
 vTextureCoord = aPosition * (uOutputFrame.zw * uInputSize.zw);
 vCardCoord=aPosition;
}`;
const fragment = `
in vec2 vTextureCoord;
in highp vec2 vCardCoord;
out vec4 finalColor;
uniform sampler2D uTexture;
uniform float uTime;
uniform float uTilt;
uniform float uTiltY;
uniform float uStrength;
uniform float uSweep;
uniform vec3 uLightColor;
uniform float uLightStrength;
float hash(vec2 p) {return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main() {
 vec4 color = texture(uTexture, vTextureCoord);
 vec2 uv = clamp(vCardCoord,0.,1.);
 vec2 tilt=vec2(uTilt,uTiltY);
 float angle=uv.x*.78+uv.y*.46;
 float center=.62+uTilt*.34+uTiltY*.22+uSweep*.56;
 float band=exp(-pow((angle-center)*4.8,2.));
 float edge=exp(-pow((angle-center-.07)*23.,2.));
 float diffraction=uv.x*1.8-uv.y*1.22+dot(tilt,vec2(.75,-.6));
 vec3 rainbow=.52+.48*cos(6.283185*(diffraction+vec3(0.,.333,.667)));
 float etching=.75+.25*sin((uv.x+uv.y*.7)*650.);
 vec2 cell=floor(uv*vec2(110.,155.));
 float grain=hash(cell),facet=pow(max(0.,cos(grain*6.283185+dot(tilt,vec2(3.8,3.1))+uTime*.13)),22.);
 vec2 micro=fract(uv*vec2(110.,155.))-.5;
 float sparkle=exp(-dot(micro,micro)*35.)*facet*step(.91,grain)*band;
 float printProtection=1.-smoothstep(.47,.75,uv.y)*.74;
 // The surface changes with viewing angle; reflection is screened into the print, never a white wash.
 vec3 reflected=(rainbow*band*.46*etching+vec3(.72,.91,1.)*edge*.40+vec3(sparkle*.7))*uStrength*printProtection;
 color.rgb += (vec3(color.a)-color.rgb)*reflected;
 float uplight=pow(uv.y,2.6)*.7+pow(abs(uv.x-.5)*2.,5.)*.3;
 color.rgb += uLightColor*uplight*uLightStrength*color.a;
 finalColor=color;
}`;
export function foilStrength(rarity:string,value=0){return /Hyper|Special/i.test(rarity)?.95:/Illustration|Ultra/i.test(rarity)?.8:/Holo|Rare/i.test(rarity)||value>=600?.62:.3;}
export function createFoil(strength = .65) {
 return new Filter({resolution:'inherit',antialias:'inherit',glProgram:GlProgram.from({vertex,fragment,preferredFragmentPrecision:'highp'}),resources:{foil:{uTime:{value:0,type:'f32'},uTilt:{value:0,type:'f32'},uTiltY:{value:0,type:'f32'},uStrength:{value:strength,type:'f32'},uSweep:{value:0,type:'f32'},uLightColor:{value:[.5,.85,1],type:'vec3<f32>'},uLightStrength:{value:0,type:'f32'}}}});
}
