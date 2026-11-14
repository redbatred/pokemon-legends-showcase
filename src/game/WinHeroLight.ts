import {AdditiveBlending,Color,Mesh,PlaneGeometry,ShaderMaterial,Vector3,type Camera} from 'three';

/** A fan of light standing behind the actor in the arena, so the Pokémon occludes its own backlight. */
export class WinHeroLight{
 readonly root:Mesh;private material:ShaderMaterial;private forward=new Vector3();
 constructor(element:number,award:number){
  this.material=new ShaderMaterial({transparent:true,depthWrite:false,blending:AdditiveBlending,uniforms:{time:{value:0},rays:{value:0},core:{value:0},warm:{value:0},element:{value:new Color(element)},award:{value:new Color(award)}},
   vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
   fragmentShader:`varying vec2 vUv;uniform float time;uniform float rays;uniform float core;uniform float warm;uniform vec3 element;uniform vec3 award;
void main(){vec2 p=vUv*2.-1.;float r=length(p),a=atan(p.y,p.x);
float wide=pow(.5+.5*sin(a*7.+time*.42),3.),thin=pow(.5+.5*sin(a*17.-time*.63+1.7),6.);
float fan=(wide*.62+thin*.5)*smoothstep(1.,.12,r)*smoothstep(.02,.26,r);
float glow=exp(-r*r*5.5);
vec3 tone=mix(element,award,warm);
vec3 colour=tone*fan*rays+mix(tone,vec3(1.),.55)*glow*core;
gl_FragColor=vec4(colour,1.);}`});
  this.root=new Mesh(new PlaneGeometry(1,1),this.material);this.root.renderOrder=-2;this.root.frustumCulled=false;
 }
 update(age:number,camera:Camera,target:Vector3,rays:number,core:number,warm:number,size=17){
  camera.getWorldDirection(this.forward);
  this.root.position.copy(target).addScaledVector(this.forward,2.6);this.root.quaternion.copy(camera.quaternion);this.root.scale.setScalar(size);
  const u=this.material.uniforms;u.time.value=age;u.rays.value=rays;u.core.value=core;u.warm.value=warm;
 }
 dispose(){this.root.geometry.dispose();this.material.dispose();}
}
