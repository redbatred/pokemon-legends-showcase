import { Assets, Texture } from 'pixi.js';
import { AtlasAttachmentLoader, SkeletonJson, Spine, SpineTexture, TextureAtlas, type SkeletonData } from '@esotericsoftware/spine-pixi-v8';
import { buildPokemonRigJson, POKEMON_RIG_SIZE } from './pokemonRigData';

const skeletons = new Map<string, Promise<SkeletonData>>();

async function loadSkeleton(path: string): Promise<SkeletonData> {
  const texture = await Assets.load<Texture>(path);
  // A separate lower jaw and mouth interior allow actual articulation. The base
  // art has an alpha cutout; moving one sheet would only stretch a painted mouth.
  const hasJaw=path.split('/').pop()==='charizard.png';
  let page=texture,regions=`artwork\n  bounds: 0,0,${texture.width},${texture.height}\n`;
  if(hasJaw){
    const canvas=document.createElement('canvas');canvas.width=texture.width*3;canvas.height=texture.height;
    const c=canvas.getContext('2d',{willReadFrequently:true})!,w=texture.width,h=texture.height;
    const points=[[181,94],[192,94],[212,99],[233,105],[244,112],[249,122],[233,128],[210,122],[191,112],[182,103]];
    const mouth=()=>{c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x/475*w,y/475*h):c.moveTo(x/475*w,y/475*h));c.closePath();};
    c.drawImage(texture.source.resource as CanvasImageSource,0,0);c.save();c.globalCompositeOperation='destination-out';mouth();c.fill();c.restore();
    c.save();c.translate(w,0);mouth();c.fillStyle='#4b2632';c.fill();c.save();mouth();c.clip();c.beginPath();c.ellipse(213/475*w,119/475*h,15/475*w,4/475*h,0,0,Math.PI*2);c.fillStyle='#db7e84';c.fill();
    c.beginPath();c.moveTo(192/475*w,95/475*h);c.lineTo(196/475*w,103/475*h);c.lineTo(199/475*w,97/475*h);c.fillStyle='#fff9dc';c.fill();c.restore();c.restore();
    c.save();c.translate(w*2,0);mouth();c.clip();c.drawImage(texture.source.resource as CanvasImageSource,0,0);c.restore();
    page=Texture.from(canvas);regions+=`mouth\n  bounds: ${w},0,${w},${h}\njaw\n  bounds: ${w*2},0,${w},${h}\n`;
  }
  const atlas = new TextureAtlas(`pokemon.png\nsize: ${page.width},${page.height}\nfilter: Linear,Linear\npma: false\n${regions}`);
  atlas.pages[0].setTexture(SpineTexture.from(page.source));
  const aspect = texture.width / texture.height;
  const width = aspect >= 1 ? POKEMON_RIG_SIZE : POKEMON_RIG_SIZE * aspect;
  const height = aspect >= 1 ? POKEMON_RIG_SIZE / aspect : POKEMON_RIG_SIZE;
  const json=buildPokemonRigJson(path,width,height);
  if(hasJaw){
    const slots=json.slots as {name:string;bone:string;attachment:string}[];
    slots.unshift({name:'mouth',bone:'head',attachment:'mouth'});slots.push({name:'jaw',bone:'jaw',attachment:'jaw'});
    const attachments=json.skins[0].attachments as Record<string,unknown>;
    attachments.mouth={mouth:{path:'mouth',width,height,x:-(.47-.5)*width,y:-(.5-.23)*height}};
    attachments.jaw={jaw:{path:'jaw',width,height,x:-(.52-.5)*width,y:-(.5-.24)*height}};
  }
  return new SkeletonJson(new AtlasAttachmentLoader(atlas)).readSkeletonData(json);
}

/** An articulated 2D artwork rig. Advance with rig.update(dtSeconds).
 * Starts `emerge`, then loops `idle`; `roar` is also available through rig.state.
 * Art is a single view: joints bend its visible pixels, never invent hidden surfaces.
 * Charizard has hand-placed anatomical masks. Other species use restrained family
 * profiles or a conservative head/torso fallback. Charizard has a separate jaw
 * and mouth interior. Single-view art cannot turn around or change baked-in occlusion.
 */
export async function createPokemonRig(path: string): Promise<Spine> {
  let pending = skeletons.get(path);
  if (!pending) {
    pending = loadSkeleton(path).catch(error => { skeletons.delete(path); throw error; });
    skeletons.set(path, pending);
  }
  const rig = new Spine({ skeletonData: await pending, autoUpdate: false });
  rig.state.data.defaultMix = .16;
  rig.state.setAnimation(0, 'emerge', false);
  rig.state.addAnimation(0, 'idle', true, 0);
  rig.update(0);
  return rig;
}
