import { Filter, GlProgram, Matrix, Shader, Texture, type Mesh } from 'pixi.js';
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

// The same foil as part of the card's own shader. As a filter it made the renderer leave the screen's framebuffer in the
// middle of the frame and come back, once per lit card, and on tile-based GPUs every such round trip stores and reloads the
// whole multisampled screen; in the big-win scene, where the card is at its largest, that was most of the frame. Here the
// card is drawn once, lit as it is drawn. The lighting is the filter's, line for line; its coordinates are the card's own
// corners where the filter used the card's bounding box, which coincide for a card that faces the screen.
const meshVertex = `
in vec2 aPosition;
in vec2 aUV;
out vec2 vUV;
out highp vec2 vCardCoord;
out vec4 vColor;
uniform mat3 uProjectionMatrix;
uniform mat3 uWorldTransformMatrix;
uniform mat3 uTransformMatrix;
uniform vec4 uWorldColorAlpha;
uniform vec4 uColor;
uniform mat3 uTextureMatrix;
void main() {
 vec3 position = uProjectionMatrix * uWorldTransformMatrix * uTransformMatrix * vec3(aPosition, 1.0);
 gl_Position = vec4(position.xy, 0.0, 1.0);
 vUV = (uTextureMatrix * vec3(aUV, 1.0)).xy;
 vCardCoord = aUV;
 vColor = uWorldColorAlpha * uColor;
}`;
const meshFragment = fragment.replace('in vec2 vTextureCoord;','in vec2 vUV;\nin vec4 vColor;').replace('vec4 color = texture(uTexture, vTextureCoord);','vec4 color = texture(uTexture, vUV) * vColor;');
if(meshFragment===fragment||!meshFragment.includes('texture(uTexture, vUV) * vColor'))throw new Error('The card foil shader is out of step with the foil filter.');
/** A foil: its strength, sweep, tilt and light, shared by every card mesh it lights. */
export type CardFoil = Shader;
let program: GlProgram | undefined;
const foilProgram = () => program ??= GlProgram.from({vertex:meshVertex,fragment:meshFragment,preferredFragmentPrecision:'highp'});
/** One shader per lit mesh: the foil's own uniform group, and the texture and texture mapping of that mesh. */
function lightMesh(foil: CardFoil, texture: Texture) {
 const shader = new Shader({glProgram:foilProgram(),resources:{uTexture:texture.source,foil:foil.resources.foil,map:{uTextureMatrix:{value:texture.textureMatrix.mapCoord,type:'mat3x3<f32>'}}}});
 // A mesh hands its shader each texture it is given; the shader samples that one.
 let current = texture;
 Object.defineProperty(shader,'texture',{configurable:true,get:()=>current,set:(value:Texture|null)=>{current=value??Texture.EMPTY;if(!shader.resources)return;shader.resources.uTexture=current.source;shader.resources.map.uniforms.uTextureMatrix=current.textureMatrix.mapCoord;}});
 return shader as Shader & { texture: Texture };
}
export function createCardFoil(strength = .65): CardFoil {
 // Never drawn itself: it holds the uniforms the lit meshes share.
 return new Shader({glProgram:foilProgram(),resources:{uTexture:Texture.EMPTY.source,foil:{uTime:{value:0,type:'f32'},uTilt:{value:0,type:'f32'},uTiltY:{value:0,type:'f32'},uStrength:{value:strength,type:'f32'},uSweep:{value:0,type:'f32'},uLightColor:{value:[.5,.85,1],type:'vec3<f32>'},uLightStrength:{value:0,type:'f32'}},map:{uTextureMatrix:{value:new Matrix(),type:'mat3x3<f32>'}}}});
}
const lit = new WeakMap<Mesh,{foil:CardFoil;shader:Shader & { texture: Texture }}>();
/** A card mesh that may be lit is never batched with other sprites. The renderer caches whether a mesh is batched and only
 * checks again on a frame where nothing else in the scene changed, so a card that gained or lost its foil on a busy frame
 * could go on being drawn the old way. Drawn on its own from the start, there is nothing to switch. */
export function cardMesh<T extends Mesh>(mesh: T): T { (mesh.geometry as { batchMode?: string }).batchMode = 'no-batch'; return mesh; }
/** Light a card mesh with a foil, or return it to plain drawing. A foil can light several meshes; each keeps its own picture. */
export function setCardFoil(mesh: Mesh, foil: CardFoil | null) {
 const current = lit.get(mesh);
 if ((current?.foil ?? null) === foil) return;
 if (current) { lit.delete(mesh); if (!mesh.destroyed && mesh.shader === current.shader) mesh.shader = null; current.shader.destroy(); }
 if (!foil || mesh.destroyed) return;
 const shader = lightMesh(foil, mesh.texture); lit.set(mesh, {foil, shader}); mesh.shader = shader;
}
