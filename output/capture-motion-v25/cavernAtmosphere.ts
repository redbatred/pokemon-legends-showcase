import {Container,Sprite} from 'pixi.js';
import {juiceTextures} from '../../src/game/WinJuice';

/** Air in the cavern, behind the Pokémon: shafts of light from the roof, glints running on the water, mist over the shore and
 * dust drifting through the light. Everything is a function of time, so it never restarts and can be filmed frame by frame.
 * `energy` (0..1) lets the scene's beats light the room: the shafts and the water answer a hit, a lock or a break-out. */
export function createCavernAtmosphere(tint:number){
 const t=juiceTextures(),container=new Container();container.eventMode='none';
 const make=(texture=t.dot,blend:'add'|'normal'='add')=>{const s=new Sprite(texture);s.anchor.set(.5);s.blendMode=blend;container.addChild(s);return s;};
 const mist=Array.from({length:7},()=>make(t.dot,'normal')),shafts=Array.from({length:4},()=>{const s=make(t.streak);s.anchor.set(0,.5);return s;}),glints=Array.from({length:18},()=>make(t.star)),motes=Array.from({length:30},()=>make(t.dot));
 const hash=(n:number)=>{const x=Math.sin(n*127.1)*43758.5453;return x-Math.floor(x);};
 function sample(now:number,w:number,h:number,waterY:number,floorY:number,energy=0){
  const unit=h/960;
  // Shafts: four soft bars leaning in from the upper left, breathing slowly and never in step.
  shafts.forEach((shaft,i)=>{const sway=Math.sin(now*.11+i*1.9)*.035,breath=.5+.5*Math.sin(now*.27+i*2.3);
   shaft.position.set(w*(.02+i*.24)+Math.sin(now*.07+i)*w*.02,-h*.04);shaft.rotation=1.12+sway+i*.045;shaft.scale.set(h*1.15/128,(9+i*3.5+breath*4)*unit);shaft.tint=i%2?0xffffff:tint;shaft.alpha=(.05+.05*breath)*(1+energy*2.2);});
  // Mist: wide, low and slow along the shoreline, in front of the far rock and behind the Pokémon.
  mist.forEach((cloud,i)=>{const drift=((now*(.012+hash(i)*.014)+hash(i+9))%1.3)-.15;cloud.position.set(w*drift,waterY+h*(.012+hash(i+3)*.07));cloud.scale.set(w*(.42+hash(i+5)*.3)/32,h*(.035+hash(i+7)*.03)/32);cloud.tint=0xe8f6ff;cloud.alpha=.1+.05*Math.sin(now*.3+i);});
  // Glints: small stars that run along the water and wink out; more of them light up when the room is hit.
  glints.forEach((glint,i)=>{const phase=(now*(.35+hash(i)*.4)+hash(i+20)*7)%1,x=(hash(i+11)+now*.006*(i%2?1:-1))%1;
   glint.position.set(w*((x+1)%1),waterY-h*.012+hash(i+31)*h*.058);const wink=Math.sin(phase*Math.PI)**3;glint.scale.set((.1+hash(i+2)*.12)*unit*(.6+wink*.6));glint.rotation=now*.4+i;glint.tint=i%3?0xffffff:tint;glint.alpha=wink*(.35+energy*.5)*(i%4===0||energy>.2?1:.55);});
  // Dust: slow motes rising through the shafts, larger and softer the nearer they are.
  motes.forEach((mote,i)=>{const depth=.35+hash(i+40)*.65,rise=(now*(.012+depth*.02)+hash(i+50))%1,x=(hash(i+60)+Math.sin(now*.13+i)*.03+1)%1;
   mote.position.set(w*x,floorY-h*(.05+rise*.62));mote.scale.set((2+depth*7)*unit/32);mote.tint=i%2?0xffffff:tint;mote.alpha=Math.sin(rise*Math.PI)*(.1+depth*.2)*(1+energy);});
 }
 return {container,sample};
}
