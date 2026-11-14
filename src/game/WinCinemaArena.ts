import {championshipBeat} from './championshipBeat';
import {winFinalePresentation} from './winFinalePresentation';
import type {CinemaTier} from './winChoreography';
import {arenaCrowdMotion} from './arenaCrowdMotion';
import type {StadiumResponse} from './stadiumResponse';
import {AdditiveBlending,Vector3,Color,BoxGeometry,CylinderGeometry,DoubleSide,Group,Mesh,MeshBasicMaterial,MeshStandardMaterial,PlaneGeometry,ShaderMaterial,SRGBColorSpace,TextureLoader,TorusGeometry,Vector4,type Texture} from 'three';
type ArenaPaint={base:Texture;cheer:Texture;clap:Texture;wave:Texture};
let painted:Promise<ArenaPaint>|undefined;
export function prepareWinArena(){return painted??=Promise.all(['crowd-v1/anticipating.png','crowd-v1/celebrating.png','crowd-v2/cheer-clap.png','crowd-v2/cheer-wave.png'].map(path=>new TextureLoader().loadAsync('/assets/stage/'+path).then(t=>{t.colorSpace=SRGBColorSpace;return t;}))).then(([base,cheer,clap,wave])=>({base,cheer,clap,wave}));}
/** Painted anime grandstand on curved scenery, with physical terraces, fluttering
 * pennants and spectators animated independently of the masonry. */
export class WinCinemaArena {
 readonly root=new Group();private beams:Mesh<CylinderGeometry,ShaderMaterial>[]=[];private flags:Mesh[]=[];private lamps:Mesh[]=[];private texture:Texture;private backdrop:ShaderMaterial;private rails:Mesh[]=[];
 constructor(paint:ArenaPaint,mega:boolean,color=0x65cfff){
  this.texture=paint.base.clone();this.texture.offset.y=.28;this.texture.repeat.y=.72;this.texture.needsUpdate=true;
  this.backdrop=new ShaderMaterial({side:DoubleSide,uniforms:{paint:{value:this.texture},cheer:{value:paint.cheer},clap:{value:paint.clap},wave:{value:paint.wave},poses:{value:Array.from({length:48},()=>new Vector4(0,0,0,0))},tone:{value:new Color(color)},night:{value:0},charge:{value:0},impact:{value:0},afterglow:{value:0},life:{value:1},time:{value:0}},vertexShader:`varying vec2 v;varying vec3 world;void main(){v=uv;world=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(world,1.);}`,fragmentShader:`varying vec2 v;varying vec3 world;uniform sampler2D paint;uniform sampler2D cheer;uniform sampler2D clap;uniform sampler2D wave;uniform vec4 poses[48];
vec3 cel(float frame,vec2 uv){if(frame<.5)return texture2D(paint,uv).rgb;if(frame<1.5)return texture2D(cheer,uv).rgb;if(frame<2.5)return texture2D(clap,uv).rgb;return texture2D(wave,uv).rgb;}
vec2 seats(float x){float a=min(x,1.-x);if(a<.14)return mix(vec2(.339,.464),vec2(.420,.533),a/.14);if(a<.30)return mix(vec2(.420,.533),vec2(.481,.588),(a-.14)/.16);return mix(vec2(.481,.588),vec2(.506,.600),clamp((a-.30)/.13,0.,1.));}
float aisle(float x,float y,float a,float b,float c,float d){vec2 bounds=seats(x);float t=clamp((y-bounds.x)/(bounds.y-bounds.x),0.,1.);return step(mix(a,c,t),x)*(1.-step(mix(b,d,t),x));}
uniform vec3 tone;uniform float night;uniform float charge;uniform float impact;uniform float afterglow;uniform float time;uniform float life;void main(){vec2 uv=vec2(v.x,.28+v.y*.72);vec3 art=texture2D(paint,uv).rgb;float imageY=1.-uv.y;vec2 bounds=seats(uv.x);float mask=smoothstep(bounds.x,bounds.x+.003,imageY)*(1.-smoothstep(bounds.y-.003,bounds.y,imageY));
mask*=1.-max(max(aisle(uv.x,imageY,.135,.151,.153,.174),aisle(uv.x,imageY,.292,.303,.312,.327)),max(aisle(uv.x,imageY,.430,.441,.427,.441),max(aisle(uv.x,imageY,.559,.570,.559,.573),max(aisle(uv.x,imageY,.697,.708,.673,.688),aisle(uv.x,imageY,.849,.865,.826,.847)))));
float rowT=clamp((imageY-bounds.x)/(bounds.y-bounds.x),0.,.999);
int row=int(floor(rowT*3.));int group=int(clamp(floor(uv.x*16.),0.,15.))+row*16;
vec4 pose=poses[group];if(mask>.001){
// Seated feet and row edges stay fixed; only the upper-body part breathes and leans.
float seatRow=floor(rowT*7.);float person=floor(uv.x*128.+mod(seatRow,2.)*.5)+seatRow*137.;float phase=person*2.39996;
float body=sin(fract(rowT*7.)*3.141593);body*=body;
float shoulder=sin(fract(uv.x*128.+mod(seatRow,2.)*.5)*3.141593);shoulder*=shoulder;
float breath=sin(time*(1.4+fract(person*.37)) + phase);
float glance=sin(time*(.72+fract(person*.17)*.48)+phase*.63);
// Gestures have effort and rest, with an independent rhythm for each seat.
float gesture=.5+.5*sin(time*(.65+fract(person*.41)*.35)+phase*.83);
gesture=gesture*gesture*gesture;
float clapMotion=sin(time*(4.0+fract(person*.23)*1.7)+phase)*gesture;
float cheerMotion=1.-pose.x;
float lean=sin(time*(1.05+fract(person*.11)*.45)+phase*.71);
float rise=.5-.5*cos(time*(2.3+fract(person*.23)*.8)+phase);
vec2 liveUv=uv+vec2((glance*.00040+lean*.00065*cheerMotion+clapMotion*.00024*pose.z)*body,(breath*.00032+rise*.00075*cheerMotion*gesture)*body*shoulder)*life*mask;
vec3 moving=texture2D(paint,liveUv).rgb*pose.x+texture2D(cheer,liveUv).rgb*pose.y+texture2D(clap,liveUv).rgb*pose.z+texture2D(wave,liveUv).rgb*pose.w;
art=mix(art,moving,mask*life);
}float bounce=exp(-max(0.,world.y-1.)*.23);float sweep=.65+.35*cos(world.x*.36-time*1.7);float keep=mask;vec3 enclosure=vec3(.007,.015,.038)+vec3(.006,.012,.024)*max(0.,1.-abs(world.y-3.)*.16);vec3 daylight=mix(enclosure,art*vec3(.14,.22,.37),keep)*(1.-charge*.35);vec3 reflected=tone*bounce*impact*.38;vec3 celebration=tone*afterglow*.16*sweep;gl_FragColor=vec4(daylight+reflected+celebration,1.);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`});
  const surround=new Mesh(new CylinderGeometry(14,14,11.5,128,1,true,Math.PI/2,Math.PI),this.backdrop);surround.position.y=5.5;this.root.add(surround);
  for(let i=0;i<3;i++){const tier=new Mesh(new CylinderGeometry(10.8+i*.34,10.7+i*.34,.25,100,1,true),new MeshStandardMaterial({color:i%2?0x2777aa:0xd1ecf3,roughness:.9,side:DoubleSide}));tier.position.y=.35+i*.43;this.root.add(tier);const rail=new Mesh(new TorusGeometry(10.7+i*.34,.035,6,128),new MeshBasicMaterial({color:0xd5f8ff}));rail.rotation.x=Math.PI/2;rail.position.y=.5+i*.43;this.root.add(rail);this.rails.push(rail);}
  const flagMaterial=new ShaderMaterial({side:DoubleSide,uniforms:{time:{value:0},impact:{value:0}},vertexShader:'varying vec2 v;uniform float time;uniform float impact;void main(){v=uv;vec3 p=position;float phase=modelMatrix[3].x*.32;float wave=sin(uv.y*7.-time*4.4+phase);float tip=pow(1.-uv.y,1.5);p.z+=wave*tip*(.12+impact*.52);p.x+=sin(uv.y*4.-time*3.2+phase)*tip*impact*.10;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}',fragmentShader:'varying vec2 v;void main(){vec2 p=(v-.5)*vec2(1.,1.5);float d=length(p);vec3 c=v.y>.5?vec3(.80,.12,.16):vec3(.94,.97,1.);if(abs(v.y-.5)<.025)c=vec3(.04,.13,.23);if(d<.15)c=vec3(.04,.13,.23);if(d<.095)c=vec3(.97);gl_FragColor=vec4(c,1.);}'});
  for(let i=0;i<12;i++){const a=Math.PI*.55+i*Math.PI*.9/11,r=10.6,flag=new Mesh(new PlaneGeometry(.65,1.3,5,12),flagMaterial);flag.position.set(Math.sin(a)*r,2.1,Math.cos(a)*r);flag.rotation.y=a;this.root.add(flag);this.flags.push(flag);const pole=new Mesh(new BoxGeometry(.045,2.8,.045),new MeshBasicMaterial({color:0xd9edff}));pole.position.copy(flag.position).add({x:.36,y:.2,z:0} as import('three').Vector3);this.root.add(pole);}
  for(let side=-1;side<=1;side+=2){const tower=new Group();for(let row=0;row<2;row++)for(let col=0;col<4;col++){const lamp=new Mesh(new BoxGeometry(.23,.18,.12),new MeshBasicMaterial({color:0xfff0c5}));lamp.position.set(col*.29-.43,row*.26,0);tower.add(lamp);this.lamps.push(lamp);}const support=new Mesh(new BoxGeometry(.09,4,.09),new MeshStandardMaterial({color:0x8bb3c9}));support.position.y=-2;tower.add(support);tower.position.set(side*6,6,-7.5);tower.rotation.y=side*.3;this.root.add(tower);}

  // Light originates at the two existing stadium towers, entirely behind the actor.
  // Four low-poly volumes share one shader; no screen-space blur/filter or particle emitter.
  const beamMaterial=new ShaderMaterial({transparent:true,depthWrite:false,side:DoubleSide,blending:AdditiveBlending,uniforms:{power:{value:0},warm:{value:mega?1:0}},vertexShader:`varying vec2 v;varying vec3 normalView;varying vec3 viewDir;void main(){v=uv;vec4 p=modelViewMatrix*vec4(position,1.);normalView=normalize(normalMatrix*normal);viewDir=normalize(-p.xyz);gl_Position=projectionMatrix*p;}`,fragmentShader:`varying vec2 v;varying vec3 normalView;varying vec3 viewDir;uniform float power;uniform float warm;void main(){float edge=pow(abs(dot(normalize(normalView),normalize(viewDir))),2.);float fall=smoothstep(0.,.25,v.y)*(1.-smoothstep(.92,1.,v.y));vec3 tone=mix(vec3(.45,.78,1.),vec3(1.,.78,.40),warm);gl_FragColor=vec4(tone,edge*fall*power*.22);}`});
  for(const side of [-1,1])for(let i=0;i<2;i++){const beam=new Mesh(new CylinderGeometry(.06,1.25+i*.45,1,16,1,true),beamMaterial);beam.userData.side=side;beam.userData.lane=i;beam.renderOrder=1;this.root.add(beam);this.beams.push(beam);}
  this.root.userData.mega=mega;
 }
 update(age:number,response:StadiumResponse,reduced=false,tier:CinemaTier='big',exitAge=0,clock=age){
  const victory=winFinalePresentation(age,tier,exitAge,reduced),show=championshipBeat(age,tier,exitAge,reduced),energy=response.cloth,u=this.backdrop.uniforms;u.night.value=victory.night;u.charge.value=response.charge;u.impact.value=response.light;u.afterglow.value=response.afterglow;u.time.value=clock;u.life.value=reduced?0:1;
  this.rails.forEach(rail=>{(rail.material as MeshBasicMaterial).color.setRGB(.56+response.light*.25,.78+response.light*.24,.86+response.afterglow*.16);});
  for(const flag of this.flags){const m=flag.material as ShaderMaterial;m.uniforms.time.value=reduced?0:clock;m.uniforms.impact.value=energy;}
  this.lamps.forEach((lamp,i)=>{(lamp.material as MeshBasicMaterial).color.setScalar(.85-response.charge*.20+response.light*.85+response.afterglow*.22+(!reduced?.06*Math.sin(age*1.4+i):0));});
  for(const beam of this.beams){const side=beam.userData.side as number,lane=beam.userData.lane as number,phase=reduced?0:Math.sin(age*.48+lane*1.7)*1.25;
   const source=new Vector3(side*6,6,-7.5),target=new Vector3(side*(1.1+lane*1.9)+phase,.6,-3.1-lane*.7),direction=source.clone().sub(target);beam.position.copy(source).add(target).multiplyScalar(.5);beam.scale.y=direction.length();beam.quaternion.setFromUnitVectors(new Vector3(0,1,0),direction.normalize());beam.material.uniforms.power.value=show.light;beam.visible=show.light>0;
  }
  for(let i=0;i<48;i++){const pose=arenaCrowdMotion(age,i,reduced);(u.poses.value[i] as Vector4).fromArray(pose.weights);}
 }
 disposeTexture(){this.texture.dispose();}
}
