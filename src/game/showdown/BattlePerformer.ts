import type {PokemonActor} from '../PokemonActor';
import type {PokemonMoveVoice} from '../audio';
type Actor=Pick<PokemonActor,'entranceDuration'|'chargeDuration'|'attackDuration'|'recoveryDuration'|'play'|'setEntranceTime'|'setAttackTime'|'update'|'capturePose'>;

/** Native models are sampled by the same clock as the board, including fast-forward. */
export class BattlePerformer {
  private mode='';private releaseAt:number|null=null;private voice:PokemonMoveVoice|null=null;private voiceAt=0;private wasReduced=false;
  constructor(private actor:Actor){}
  setVoice(voice:PokemonMoveVoice|null,at:number){this.voice?.stop();this.voice=voice;this.voiceAt=at;}
  update(time:number,dt:number,reduced:boolean,enteredAt:number,impactAt:number|null){
    const a=this.actor,age=time-enteredAt,attackAge=impactAt===null?-1:time-(impactAt-a.chargeDuration);
    const attacking=attackAge>=0&&attackAge<a.chargeDuration+a.attackDuration+a.recoveryDuration;
    const mode=reduced?'idle':attacking?'charge':age>=0&&age<a.entranceDuration?'emerge':'idle';
    if(mode!==this.mode||(mode==='charge'&&impactAt!==this.releaseAt)){a.play(mode);this.mode=mode;}
    this.releaseAt=impactAt;
    if(mode==='emerge')a.setEntranceTime(age);
    if(mode==='charge')a.setAttackTime(attackAge);
    if(reduced){if(!this.wasReduced)a.capturePose();}else a.update(Math.min(.1,dt));
    this.wasReduced=reduced;
    if(this.voice){const vAge=time-this.voiceAt;if(vAge>1.8){this.voice.stop();this.voice=null;}else this.voice.update(Math.max(0,Math.min(1,(1.8-vAge)/.5)),0);}
  }
  reset(){this.voice?.stop();this.voice=null;this.mode='';this.releaseAt=null;this.wasReduced=false;}
}
