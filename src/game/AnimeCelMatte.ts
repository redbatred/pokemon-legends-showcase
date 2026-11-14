import {Filter,GlProgram} from 'pixi.js';
const vertex=`in vec2 aPosition;out vec2 vTextureCoord;uniform highp vec4 uInputSize;uniform highp vec4 uOutputFrame;uniform vec4 uOutputTexture;
void main(){vec2 p=aPosition*uOutputFrame.zw+uOutputFrame.xy;p.x=p.x*2./uOutputTexture.x-1.;p.y=p.y*2.*uOutputTexture.z/uOutputTexture.y-uOutputTexture.z;gl_Position=vec4(p,0.,1.);vTextureCoord=aPosition*uOutputFrame.zw*uInputSize.zw;}`;
/** Remove low-alpha matte residue while preserving the opaque cel and its edge. */
export function animeCelMatte(softCelEdge=false){return new Filter({padding:0,resolution:1,glProgram:GlProgram.from({vertex,fragment:`in vec2 vTextureCoord;out vec4 finalColor;uniform sampler2D uTexture;uniform highp vec4 uInputSize;uniform highp vec4 uOutputFrame;
void main(){vec4 c=texture(uTexture,vTextureCoord);float a=c.a*smoothstep(.045,.14,c.a);${softCelEdge?'vec2 local=vTextureCoord*uInputSize.xy/uOutputFrame.zw-.5;a*=1.-smoothstep(.36,.49,length(local));':''}finalColor=vec4(c.rgb*a/max(c.a,.0001),a);}`})});}
