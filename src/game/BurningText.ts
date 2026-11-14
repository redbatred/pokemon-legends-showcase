import {Filter,GlProgram} from 'pixi.js';
const vertex=`in vec2 aPosition;out vec2 vTextureCoord;uniform vec4 uInputSize;uniform vec4 uOutputFrame;uniform vec4 uOutputTexture;
void main(){vec2 p=aPosition*uOutputFrame.zw+uOutputFrame.xy;p.x=p.x*2./uOutputTexture.x-1.;p.y=p.y*2.*uOutputTexture.z/uOutputTexture.y-uOutputTexture.z;gl_Position=vec4(p,0.,1.);vTextureCoord=aPosition*uOutputFrame.zw*uInputSize.zw;}`;
const fragment=`
in vec2 vTextureCoord;out vec4 finalColor;uniform sampler2D uTexture;uniform vec4 uInputSize;
uniform float uTime;uniform float uHeat;uniform float uHeight;uniform float uRise;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);}
float flow(vec2 p){return noise(p)*.65+noise(p*2.03+3.17)*.35;}
void main(){
 vec4 base=texture(uTexture,vTextureCoord);
 if(uHeat<.001){finalColor=base;return;}
 vec2 px=vTextureCoord*uInputSize.xy;
 float size=max(8.,uHeight),rise=max(1.,uRise);
 vec2 q=px/size*vec2(7.,9.)+vec2(0.,uTime*2.6);
 float n=flow(q+vec2((noise(q*.48)-.5)*1.3,0.));
 float fuel=0.,lift=0.;
 // Trace upward from the actual glyph alpha. Nothing emits from empty bounds,
 // and every tongue is bounded by maxRise, keeping nearby headings untouched.
 for(int i=1;i<=14;i++){
  float d=float(i)/14.,dist=d*rise;
  float curl=(flow(vec2(px.x/size*9.,px.y/size*5.+uTime*2.1+d))-.5)*d*size*.12*uHeat;
  vec2 at=vTextureCoord+vec2(curl,dist)*uInputSize.zw;
  float source=texture(uTexture,at).a;
  float f=source*(1.-d*.88);
  if(f>fuel){fuel=f;lift=d;}
 }
 float density=fuel-(.14+n*.47);
 float alpha=smoothstep(.02,.13,density)*(.45+.55*uHeat)*(1.-base.a);
 vec3 red=vec3(1.,.25,.035),gold=vec3(1.,.72,.13),tip=vec3(1.,.98,.66);
 vec3 flame=mix(red,gold,smoothstep(.15,.5,lift+n*.23));flame=mix(flame,tip,smoothstep(.48,.88,lift+n*.18));
 float ink=smoothstep(.22,.58,max(base.r,max(base.g,base.b))/max(base.a,.001));
 vec3 hot=mix(vec3(1.,.47,.09),vec3(1.,.96,.67),smoothstep(.24,.76,n));
 base.rgb=mix(base.rgb,hot*base.a,ink*uHeat*.42);
 finalColor=vec4(base.rgb+flame*alpha,base.a+alpha);
}`;
/** Flame roots are the rendered glyphs, never a rectangle around the amount. */
export function createBurningText(){
 const filter=new Filter({padding:4,resolution:'inherit',antialias:'inherit',glProgram:GlProgram.from({vertex,fragment,preferredFragmentPrecision:'highp'}),resources:{burn:{uTime:{value:0,type:'f32'},uHeat:{value:0,type:'f32'},uHeight:{value:32,type:'f32'},uRise:{value:4,type:'f32'}}}});
 return{filter,sample(time:number,heat:number,height:number,maxRise:number){const u=filter.resources.burn.uniforms;u.uTime=time;u.uHeat=Math.max(0,Math.min(1,heat));u.uHeight=Math.max(1,height);u.uRise=Math.max(0,maxRise);filter.padding=Math.ceil(maxRise+4);},destroy(){filter.destroy();}};
}
