import {AdditiveBlending,ShaderMaterial,BackSide,CircleGeometry,Color,CylinderGeometry,DataTexture,DirectionalLight,Group,HemisphereLight,Mesh,MeshBasicMaterial,MeshToonMaterial,NearestFilter,OrthographicCamera,Plane,Quaternion,RGBAFormat,Scene,SphereGeometry,TorusGeometry,Vector2,Vector3,type BufferGeometry,type Material} from 'three';
import {Sprite,Texture} from 'pixi.js';
import {sharedPokemonRenderer} from './PokemonModel';

/** Frame around the ball in ball radii: extra room above for the open lid. */
const TOP=2.7,BOTTOM=-1.7,HALF=(TOP-BOTTOM)/2;
export const BALL_FRAME={top:TOP,bottom:BOTTOM,anchorY:TOP/(TOP-BOTTOM)};
export type BallPose={spin:Quaternion;roll:number;open:number;button:number;inner:number;front:boolean};
const REST_TILT=new Quaternion().setFromAxisAngle(new Vector3(1,0,0),.26).multiply(new Quaternion().setFromAxisAngle(new Vector3(0,1,0),-.62)),Z=new Vector3(0,0,1);

/** The ball as scene objects: lower shell with latch on the floor side, lid hinged at the back, lining that takes the inner light. */
export function createBallParts(gradient:DataTexture,light:number){
 const root=new Group(),lidGroup=new Group(),shell:Mesh[]=[],owned=new Set<Material>(),geometries=new Set<BufferGeometry>();
 const toon=(color:number,options:{side?:typeof BackSide;emissive?:number}={})=>{const m=new MeshToonMaterial({color,gradientMap:gradient,side:options.side,emissive:new Color(options.emissive??0),emissiveIntensity:0});owned.add(m);return m;};
 const ink=new MeshBasicMaterial({color:0x1d2c3c,side:BackSide});owned.add(ink);
 const mesh=(geometry:BufferGeometry,material:Material,parent:Group,outer=false)=>{geometries.add(geometry);const m=new Mesh(geometry,material);parent.add(m);if(outer)shell.push(m);return m;};
 const red=toon(0xe5263f),white=toon(0xf1f5f9),black=toon(0x1d2633);
 const glow={button:toon(0xf6fbff,{emissive:light}),floor:toon(0x1a2433,{emissive:light}),lining:toon(0x1f2d40,{side:BackSide,emissive:light})};
 // Lower shell, its black band and the latch stay on the floor; the lid hinges at the back.
 const lower=(r:number)=>new SphereGeometry(r,48,16,0,Math.PI*2,Math.PI/2,Math.PI/2),upper=(r:number)=>new SphereGeometry(r,48,16,0,Math.PI*2,0,Math.PI/2);
 mesh(lower(1),white,root,true);mesh(lower(.965),glow.lining,root);mesh(lower(1.04),ink,root,true);
 const band=new CylinderGeometry(1.008,1.008,.08,64,1,true);band.translate(0,-.04,0);mesh(band,black,root,true);
 const floor=new CircleGeometry(.97,48);floor.rotateX(-Math.PI/2);floor.translate(0,-.004,0);mesh(floor,glow.floor,root);
 const ring=new CylinderGeometry(.3,.3,.16,40);ring.rotateX(Math.PI/2);ring.translate(0,0,.93);mesh(ring,black,root,true);
 const ringInk=new CylinderGeometry(.33,.33,.16,40);ringInk.rotateX(Math.PI/2);ringInk.translate(0,0,.92);mesh(ringInk,ink,root,true);
 const button=new CylinderGeometry(.2,.2,.2,40);button.rotateX(Math.PI/2);button.translate(0,0,.97);mesh(button,glow.button,root,true);
 const rim=new TorusGeometry(.2,.026,8,40);rim.translate(0,0,1.07);mesh(rim,black,root,true);
 lidGroup.position.set(0,0,-1);root.add(lidGroup);const body=new Group();body.position.set(0,0,1);lidGroup.add(body);
 // Lacquer: a hard-edged highlight, a second small one and a cool rim, drawn over each half of the shell so the ball reads as a
 // polished object and not two flat bands.
 const lacquer=new ShaderMaterial({transparent:true,depthWrite:false,blending:AdditiveBlending,vertexShader:'varying vec3 n;void main(){n=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'varying vec3 n;void main(){vec3 N=normalize(n),V=vec3(0.,0.,1.);float key=dot(N,normalize(normalize(vec3(-.52,.62,.58))+V));float fill=dot(N,normalize(normalize(vec3(.6,-.3,.74))+V));float gloss=smoothstep(.962,.972,key)*.85+smoothstep(.86,.97,key)*.16+smoothstep(.988,.993,fill)*.5;float rim=pow(1.-max(N.z,0.),2.4)*.55;gl_FragColor=vec4(vec3(gloss)+vec3(.5,.78,1.)*rim,1.);}'});owned.add(lacquer);
 mesh(lower(1.004),lacquer,root,true);
 mesh(upper(1),red,body);mesh(upper(.965),glow.lining,body);mesh(upper(1.04),ink,body);mesh(upper(1.004),lacquer,body);
 const lidBand=new CylinderGeometry(1.008,1.008,.08,64,1,true);lidBand.translate(0,.04,0);mesh(lidBand,black,body);
 return {root,lid:lidGroup,shell,glow,dispose(){owned.forEach(m=>m.dispose());geometries.forEach(g=>g.dispose());}};
}
export type BallParts=ReturnType<typeof createBallParts>;
/** A real Poké Ball in the reveal's 3D renderer: toon-shaded and inked like the Pokémon, lit by the same lights,
 * with a hinged lid, a latch button and an interior that glows with the Pokémon's light when it opens. */
export class PokeBall3D{
 readonly sprite:Sprite;readonly front:Sprite;
 private scene=new Scene();private camera=new OrthographicCamera(-HALF,HALF,TOP,BOTTOM,.1,40);private root:Group;private lid:Group;private parts:BallParts;
 private canvas=document.createElement('canvas');private context:CanvasRenderingContext2D;private frontCanvas=document.createElement('canvas');private frontContext:CanvasRenderingContext2D;
 private size:number;private gradient:DataTexture;
 private shell:Mesh[];private glow:BallParts['glow'];private energy:DirectionalLight;
 private clip=[new Plane(new Vector3(0,0,1),0)];private none:Plane[]=[];private roll=new Quaternion();private viewport=new Vector2();private dead=false;
 constructor(low=false,light=0xbdf7ff,size=low?160:256){
  this.size=size;for(const canvas of [this.canvas,this.frontCanvas])canvas.width=canvas.height=this.size;
  this.context=this.canvas.getContext('2d')!;this.frontContext=this.frontCanvas.getContext('2d')!;
  this.sprite=new Sprite(Texture.from(this.canvas));this.front=new Sprite(Texture.from(this.frontCanvas));
  for(const sprite of [this.sprite,this.front]){sprite.anchor.set(.5,BALL_FRAME.anchorY);sprite.eventMode='none';sprite.visible=false;}
  // The same four-step ramp as the Pokémon models.
  this.gradient=new DataTexture(new Uint8Array([65,65,65,255,142,142,142,255,215,215,215,255,255,255,255,255]),4,1,RGBAFormat);this.gradient.minFilter=this.gradient.magFilter=NearestFilter;this.gradient.needsUpdate=true;
  const parts=this.parts=createBallParts(this.gradient,light);this.root=parts.root;this.lid=parts.lid;this.shell=parts.shell;this.glow=parts.glow;
  // The Pokémon's own lights, so ball and Pokémon are shaded by one scene.
  this.scene.add(new HemisphereLight(0xeef7ff,0x66759c,.88));const key=new DirectionalLight(0xffffff,1.5);key.position.set(-3,5,7);const rimLight=new DirectionalLight(0x8fdcff,.42);rimLight.position.set(1,-1,3);
  this.energy=new DirectionalLight(light,0);this.energy.position.set(0,3,4);this.scene.add(key,rimLight,this.energy,this.root);
  this.camera.position.set(0,0,10);this.camera.lookAt(0,0,0);
 }
 /** The latch light: the Pokémon's colour while it is being drawn in, red while the ball is deciding. */
 setButtonColor(color:number){this.glow.button.emissive.setHex(color);}
 /** Screen size of one ball radius, in the parent's units. */
 place(x:number,y:number,radius:number,alpha:number,visible:boolean){
  const scale=2*HALF*radius/this.size;
  for(const sprite of [this.sprite,this.front]){sprite.position.set(x,y);sprite.scale.set(scale);sprite.alpha=alpha;}
  this.sprite.visible=visible;
  // A hidden ball takes its front lip with it; `update` does nothing while hidden, so it could not.
  if(!visible)this.front.visible=false;
 }
 update(pose:BallPose){
  if(this.dead||!this.sprite.visible)return;
  this.roll.setFromAxisAngle(Z,pose.roll);this.root.quaternion.copy(this.roll).multiply(REST_TILT).multiply(pose.spin);
  // Back hinge: the front edge rises and the lid swings over the back, past vertical.
  this.lid.rotation.x=-pose.open*1.2;
  this.glow.button.emissiveIntensity=pose.button*1.6;this.glow.floor.emissiveIntensity=pose.inner*2.4;this.glow.lining.emissiveIntensity=pose.inner*.45;this.energy.intensity=pose.inner*.7+pose.button*.4;
  this.render(this.context,this.sprite,false);
  this.front.visible=pose.front&&this.sprite.visible;
  // The front of the lower shell is drawn again over the Pokémon, so it rises out of the ball rather than in front of it.
  if(this.front.visible){for(const m of this.root.children)m.visible=this.shell.includes(m as Mesh);this.lid.visible=false;this.render(this.frontContext,this.front,true);for(const m of this.root.children)m.visible=true;this.lid.visible=true;}
 }
 private render(context:CanvasRenderingContext2D,sprite:Sprite,clipped:boolean){
  const renderer=sharedPokemonRenderer(this.size),full=renderer.getSize(this.viewport),side=Math.min(this.size,full.x,full.y);
  renderer.setViewport(0,0,side,side);renderer.setScissor(0,0,side,side);renderer.setScissorTest(true);renderer.clippingPlanes=clipped?this.clip:this.none;
  try{renderer.render(this.scene,this.camera);context.clearRect(0,0,this.size,this.size);context.drawImage(renderer.domElement,0,full.y-side,side,side,0,0,this.size,this.size);sprite.texture.source.update();}
  finally{renderer.clippingPlanes=this.none;renderer.setScissorTest(false);renderer.setViewport(0,0,full.x,full.y);renderer.setScissor(0,0,full.x,full.y);}
 }
 /** Compile both passes during preparation, so the first visible frame never waits on shaders. */
 prepare(){const shown=this.sprite.visible;this.sprite.visible=true;this.update({spin:new Quaternion(),roll:0,open:.5,button:1,inner:1,front:true});this.sprite.visible=shown;this.front.visible=false;}
 dispose(){this.dead=true;this.parts.dispose();this.gradient.dispose();this.sprite.destroy({texture:true,textureSource:true});this.front.destroy({texture:true,textureSource:true});}
}
/** Ball orientation over the reveal: it tumbles in flight, the spin bleeds off through the bounces, and it settles button-forward. */
export function ballSpin(t:number,hit:number,first:number,settled:number,out=new Quaternion()){
 const axis=new Vector3(.82,.35,.46).normalize(),rate=13,decay=2.4;
 const angle=t<hit?t*rate:hit*rate+rate/decay*(1-Math.exp(-(t-hit)*decay));
 out.setFromAxisAngle(axis,angle);
 const settle=t<first?0:Math.min(1,(t-first)/Math.max(.05,settled-first+.12)),w=settle*settle*(3-2*settle);
 return w>0?out.slerp(new Quaternion(),w):out;
}
