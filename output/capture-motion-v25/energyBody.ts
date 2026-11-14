import {BlurFilter,ColorMatrixFilter,Filter,GlProgram,Sprite} from 'pixi.js';

const vertex=`in vec2 aPosition;out vec2 vTextureCoord;uniform vec4 uInputSize;uniform vec4 uOutputFrame;uniform vec4 uOutputTexture;void main(){vec2 p=aPosition*uOutputFrame.zw+uOutputFrame.xy;p.x=p.x*(2./uOutputTexture.x)-1.;p.y=p.y*(2.*uOutputTexture.z/uOutputTexture.y)-uOutputTexture.z;gl_Position=vec4(p,0.,1.);vTextureCoord=aPosition*(uOutputFrame.zw*uInputSize.zw);}`;
// The body keeps its drawn shape and a trace of its shading, filled with the energy's colour. Its outline burns white, and bands
// of brighter light run through it toward the ball (or away from it on a break-out).
const fragment=`in vec2 vTextureCoord;out vec4 finalColor;uniform sampler2D uTexture;uniform highp vec4 uInputSize;uniform vec3 uColor;uniform float uTime;uniform float uEnergy;uniform float uDirection;
void main(){vec4 c=texture(uTexture,vTextureCoord);float a=c.a;if(a<.004){finalColor=vec4(0.);return;}
vec2 near=uInputSize.zw*3.,far=uInputSize.zw*9.;
float n=texture(uTexture,vTextureCoord+vec2(near.x,0.)).a+texture(uTexture,vTextureCoord-vec2(near.x,0.)).a+texture(uTexture,vTextureCoord+vec2(0.,near.y)).a+texture(uTexture,vTextureCoord-vec2(0.,near.y)).a;
float f=texture(uTexture,vTextureCoord+vec2(far.x,0.)).a+texture(uTexture,vTextureCoord-vec2(far.x,0.)).a+texture(uTexture,vTextureCoord+vec2(0.,far.y)).a+texture(uTexture,vTextureCoord-vec2(0.,far.y)).a;
float rim=clamp((4.*a-n)*1.1,0.,1.),edge=clamp((4.*a-f)*.45,0.,1.);
vec3 base=c.rgb/a;float lum=dot(base,vec3(.299,.587,.114));
float band=pow(.5+.5*sin(vTextureCoord.x*70.-uTime*16.*uDirection+sin(vTextureCoord.y*34.+uTime*4.)*1.6),3.);
vec3 body=uColor*(.62+.38*lum);vec3 energy=mix(body,vec3(1.),clamp(rim+edge*.75+band*.3,0.,1.));
finalColor=vec4(mix(base,energy,uEnergy)*a,a);}`;
/** The Pokémon as energy. Two copies of its own sprite share its texture, so they follow its pose and the flow that carries it
 * into the ball: one redraws it as light over the body, one haloes it in the same colour. */
export function createEnergyBody(source:Sprite,color:number){
 const rgb=[(color>>16&255)/255,(color>>8&255)/255,(color&255)/255];
 const filter=new Filter({glProgram:GlProgram.from({vertex,fragment}),resources:{energy:{uColor:{value:rgb,type:'vec3<f32>'},uTime:{value:0,type:'f32'},uEnergy:{value:0,type:'f32'},uDirection:{value:1,type:'f32'}}}});
 const tintOnly=new ColorMatrixFilter();tintOnly.matrix=[0,0,0,0,rgb[0],0,0,0,0,rgb[1],0,0,0,0,rgb[2],0,0,0,1,0];
 const lit=new Sprite(source.texture),halo=new Sprite(source.texture);lit.filters=[filter];halo.filters=[tintOnly,new BlurFilter({strength:12,quality:3})];halo.blendMode='add';lit.visible=halo.visible=false;
 const parent=source.parent!;parent.addChildAt(halo,parent.getChildIndex(source));parent.addChildAt(lit,parent.getChildIndex(source)+1);
 function sample(energy:number,now:number,inward=true){
  const on=energy>.004&&source.visible&&source.alpha>0;lit.visible=halo.visible=on;if(!on)return;
  for(const copy of [lit,halo]){copy.anchor.copyFrom(source.anchor);copy.position.copyFrom(source.position);copy.width=source.width;copy.height=source.height;copy.rotation=source.rotation;}
  const level=Math.min(1,energy),u=filter.resources.energy.uniforms;u.uTime=now;u.uEnergy=level;u.uDirection=inward?1:-1;lit.alpha=source.alpha;halo.alpha=level*source.alpha*(.42+.1*Math.sin(now*31));
 }
 return {sample};
}
