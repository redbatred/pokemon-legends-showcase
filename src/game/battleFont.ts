import {BitmapFont} from 'pixi.js';
let ready:Promise<void>|undefined;
export function prepareBattleFont(){
 if(typeof document==='undefined')return Promise.resolve();
 return ready??=new FontFace('BattleDisplay','url(/assets/fonts/Bangers-Regular.ttf)').load().then(face=>{
  document.fonts.add(face);
  BitmapFont.install({name:'BattleMoney',style:{fontFamily:'BattleDisplay',fontSize:80,fill:0xffffff,stroke:{color:0x07121f,width:3}},chars:'0123456789$.,+- ',resolution:3,padding:4,skipKerning:true});
 });
}
