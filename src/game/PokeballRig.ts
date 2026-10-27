import { Texture } from 'pixi.js';
import { Spine,SpineTexture,TextureAtlas,AtlasAttachmentLoader,SkeletonJson,type SkeletonData } from '@esotericsoftware/spine-pixi-v8';

let data:SkeletonData|undefined;
/** Shaded sphere turntable, with separate Spine lid and base for the release. */
export function createPokeballRig(){
  if(!data){
    const size=160,frames=32,canvas=document.createElement('canvas');canvas.width=size*8;canvas.height=size*5;
    const ctx=canvas.getContext('2d')!;let regions='';
    for(let frame=0;frame<frames;frame++){
      const pixels=ctx.createImageData(size,size),angle=frame/frames*Math.PI*2;
      const ca=Math.cos(angle),sa=Math.sin(angle),tilt=.46,ct=Math.cos(tilt),st=Math.sin(tilt);
      for(let y=0;y<size;y++)for(let x=0;x<size;x++){
        const nx=(x+.5-size/2)/69,ny=(y+.5-size/2)/69,r2=nx*nx+ny*ny;if(r2>=1)continue;
        const nz=Math.sqrt(1-r2),ry=ny*ca+nz*sa,rz=nz*ca-ny*sa,lx=nx*ct+rz*st,lz=rz*ct-nx*st;
        let rgb=Math.abs(ry)<.066?[17,28,46]:ry<0?[226,27,65]:[227,239,250];
        const buttonRadius=Math.hypot(lx,ry);
        if(lz>.93&&buttonRadius<.27)rgb=buttonRadius>.205?[17,28,46]:buttonRadius>.15?[174,197,217]:[246,252,255];
        const diffuse=Math.max(0,nx*-.38+ny*-.5+nz*.78),shade=.38+.63*diffuse;
        const highlight=Math.pow(Math.max(0,nx*-.24+ny*-.34+nz*.91),42)*.72;
        const rim=Math.pow(1-nz,4)*.15,index=(y*size+x)*4;
        for(let i=0;i<3;i++)pixels.data[index+i]=Math.min(255,rgb[i]*shade+255*highlight+rim*[67,118,172][i]);
        pixels.data[index+3]=Math.min(255,(1-Math.sqrt(r2))*69*255);
      }
      const px=frame%8*size,py=Math.floor(frame/8)*size;ctx.putImageData(pixels,px,py);regions+=`spin${frame}\n  bounds: ${px},${py},${size},${size}\n`;
    }
    // The release uses the same sphere lighting as the closed ball.
    for(const [i,name] of ['lower','upper','button'].entries()){
      const x=i*size,y=size*4;ctx.save();ctx.beginPath();if(name==='button')ctx.arc(x+size/2,y+size/2,18,0,Math.PI*2);else ctx.rect(x,y+(name==='lower'?size/2:0),size,size/2);ctx.clip();ctx.drawImage(canvas,0,0,size,size,x,y,size,size);ctx.restore();regions+=`${name}\n  bounds: ${x},${y},${size},${size}\n`;
    }
    const texture=Texture.from(canvas),atlas=new TextureAtlas(`ball.png\nsize: ${canvas.width},${canvas.height}\nfilter: Linear,Linear\npma: false\n${regions}`);atlas.pages[0].setTexture(SpineTexture.from(texture.source));
    const attachments:Record<string,unknown>={closed:Object.fromEntries(Array.from({length:frames},(_,i)=>[`spin${i}`,{width:size,height:size}]))};
    for(const name of ['lower','upper','button'])attachments[name]={[name]:{width:size,height:size}};
    data=new SkeletonJson(new AtlasAttachmentLoader(atlas)).readSkeletonData({skeleton:{spine:'4.2.22'},bones:[{name:'root'},{name:'orb',parent:'root'},{name:'lower',parent:'orb'},{name:'upper',parent:'orb'},{name:'button',parent:'orb'}],slots:[{name:'closed',bone:'orb',attachment:'spin0'},...['lower','upper','button'].map(name=>({name,bone:name}))],skins:[{name:'default',attachments}],animations:{
      spin:{slots:{closed:{attachment:Array.from({length:frames+1},(_,i)=>({time:i*.022,name:`spin${i%frames}`}))}}},
      open:{slots:{closed:{attachment:[{name:null}]},...Object.fromEntries(['lower','upper','button'].map(name=>[name,{attachment:[{name}]}]))},bones:{upper:{translate:[{},{time:.32,x:-14,y:55}],rotate:[{},{time:.32,value:32}],scale:[{},{time:.32,x:1,y:.65}]},button:{scale:[{},{time:.18,x:0,y:0}]},lower:{rotate:[{},{time:.3,value:-6}]},orb:{scale:[{},{time:.1,x:1.06,y:.94},{time:.3,x:1,y:1}]}}}
    }});
  }
  const rig=new Spine({skeletonData:data,autoUpdate:false});rig.state.setAnimation(0,'spin',true);rig.update(0);return rig;
}
