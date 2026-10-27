import { Filter, GlProgram } from 'pixi.js';
const vertex = `
in vec2 aPosition;
out vec2 vTextureCoord;
uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;
void main() {
 vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
 position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
 position.y = position.y * (2.0 * uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;
 gl_Position = vec4(position, 0.0, 1.0);
 vTextureCoord = aPosition * (uOutputFrame.zw * uInputSize.zw);
}`;
const fragment = `
in vec2 vTextureCoord;
out vec4 finalColor;
uniform sampler2D uTexture;
uniform float uTime;
uniform float uTilt;
uniform float uStrength;
uniform float uSweep;
uniform vec3 uLightColor;
uniform float uLightStrength;
void main() {
 vec2 uv = vTextureCoord;
 vec4 color = texture(uTexture, uv);
 float line = uv.x * .7 + uv.y * .45;
 float shine = pow(max(0., 1. - abs(line - (.4 + uTilt * .22 + uSweep)) * 4.5), 5.);
 vec3 spectrum = .5 + .5 * cos(6.28318 * (uv.x * 1.4 + uv.y * .8 + uTilt * .6 + vec3(0., .33, .67)));
 float textureLight = .75 + .25 * sin(uv.x * 480. + uv.y * 200.);
 float spark = pow(max(0., sin(uv.x*187.) * sin(uv.y*231.) * sin(uTime*.8+uv.x*30.)), 20.);
 vec3 foil = spectrum * shine * textureLight * .65 + vec3(spark * .32);
 float printProtection = 1. - smoothstep(.48, .75, uv.y) * .82;
 color.rgb += foil * uStrength * color.a * printProtection;
 color.rgb += vec3(.78, .94, 1.) * shine * .035 * color.a * printProtection;
 float uplight=pow(clamp(uv.y,0.,1.),2.6)*.7+pow(abs(uv.x-.5)*2.,5.)*.3;
 color.rgb += uLightColor * uplight * uLightStrength * color.a;
 finalColor = color;
}`;
export function createFoil(strength = 0.5) {
  return new Filter({ resolution: 'inherit', antialias: 'inherit', glProgram: GlProgram.from({ vertex, fragment }), resources: { foil: { uTime: { value: 0, type: 'f32' }, uTilt: { value: 0, type: 'f32' }, uStrength: { value: strength, type: 'f32' }, uSweep: { value: 0, type: 'f32' }, uLightColor:{value:[.5,.85,1],type:'vec3<f32>'},uLightStrength:{value:0,type:'f32'} } } });
}
