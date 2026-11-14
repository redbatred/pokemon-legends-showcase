import { Container, Sprite, Text, Texture } from 'pixi.js';
import { gsap } from 'gsap';
import type { MoneyState } from './moneyMotion';
import { playSound } from './audio';
import {rewardHeat} from './rewardHeat';
import {resultWinTitle} from './amountCountMotion';
import {AwardJuice,LightComet,awardTextures} from './AwardJuice';
import {juiceUp,TIER_PALETTE} from './winJuiceMotion';
import {PACK_COUNT,PACK_TIERS,packCascade,packCountPlan,packCountPose,packCountTicks,packTierIndex,type PackCountPlan} from './packFinaleMotion';
import {prepareBattleFont} from './battleFont';
import {ResultDigits} from './ResultDigits';

/** A tile in the receipt that pays its value into the total: where it is now (in the total's parent space), when it is on
 * the table (seconds after the count is created), and what to do as its light leaves. */
export type ResultSource={point:()=>{x:number;y:number};width:number;value:number;tint:number;ready?:number;paid?:(power:number)=>void};
export type ResultWinOptions = { width: number; height: number; effectsWidth?:number;effectsHeight?:number;bet?:number;mode: 'pack' | 'session' | 'interlude'; reduced: boolean; turbo: boolean; low: boolean; draw: () => void;
  sources?:ResultSource[];/** The lip of the plate the total sits on, below the amount's centre: coins come to rest there. */ledge?:number;
  /** The whole screen in this container's own space: a tiered win dims it for the roll and flashes it on the landing. */screen?:{x:number;y:number;width:number;height:number};
  /** The landing (1) and each tier upgrade (less) hit the panel behind the total. */onImpact?:(power:number)=>void };
type Motion = { age: number; plan: PackCountPlan|null; rate:number; landed: boolean; landAge:number; stop:number; ticks:number; tier:number; tierAge:number; launched:number; arrived:number; tailSound:boolean; hero:boolean };
type Pay={source:ResultSource;depart:number;from:{x:number;y:number}|null;landed:boolean;comet:LightComet;bend:number};
const motions = new WeakMap<MoneyState, Motion>(),smooth=(v:number)=>{const t=Math.max(0,Math.min(1,v));return t*t*(3-2*t);};

/** A pack's (or a session's) total, counted like a slot: its tiles pay in a fast cascade of light, the number rolls with
 * accelerating ticks, the tier name upgrades in place on the way up, and the total lands once and turns gold. Its GSAP
 * clock runs while the stage's ticker is stopped by a result modal; once it is at rest it asks for no more frames. */
export class ResultWin extends Container {
  readonly amount: ResultDigits;
  // Both layers are their own render groups: comets, the veil and particles come and go without the renderer rebuilding the modal behind them.
  readonly celebrationLayer=new Container({isRenderGroup:true});
  private readonly amountHost = new Container();
  private readonly motion: Motion;
  private juice:AwardJuice|null=null;private bar:Sprite|null=null;private veil:Sprite|null=null;private frame:Sprite|null=null;private pays:Pay[]=[];private shed=0;private pulseAge=9;private ratio:number;private finalTier:number;
  private title:Text;private titleShine:Text;private titleTier=-2;private titleSize:number;private titleFit=1;private idle=false;
  private readonly tick = (_time: number, deltaMS: number) => {
    if (this.destroyed || document.hidden) return;
    const m=this.motion,dt = Math.min(.1, Math.max(0, deltaMS / 1000));
    // The landing holds its first frame: the clock stops, the light keeps moving.
    const held=Math.min(Math.max(0,m.stop),dt),step=(dt-held)*m.rate;m.stop-=held;m.age+=step;if(m.landed)m.landAge+=step;if(m.tierAge>=0)m.tierAge+=step;
    this.pulseAge+=dt;
    if(m.plan&&!m.landed)this.advance(dt);
    if(m.landed&&!m.tailSound&&m.landAge>=.16){m.tailSound=true;playSound('complete',{gain:this.options.mode==='session'?.8:.6});}
    this.juice?.update(dt);
    // At rest: nothing left to move, so nothing left to draw.
    const settled=m.landed&&m.landAge>PACK_COUNT.settle+.6&&!this.juice?.busy&&m.tailSound;
    if(settled&&this.idle)return;this.idle=settled;
    this.pose(); this.options.draw();
  };

  constructor(private readonly state: MoneyState, private readonly options: ResultWinOptions) {
    super({isRenderGroup:true}); this.eventMode = 'none';
    const width = Math.max(1, options.width), height = Math.max(1, options.height),bet=options.bet??0;
    const previous = motions.get(state), fresh = !previous && state.value !== state.target && state.remaining > 0;
    this.ratio=rewardHeat(state.target,bet).ratio;this.finalTier=packTierIndex(this.ratio);
    const lit=AwardJuice.available&&!options.reduced;
    this.motion = previous ?? { age: 0, plan:null, rate:options.turbo?2.4:options.mode==='interlude'?1.5:1, landed: state.value === state.target, landAge:9, stop:0, ticks:0, tier:packTierIndex(rewardHeat(state.value,bet).ratio), tierAge:-1, launched:0, arrived:0, tailSound:state.value === state.target, hero:false };
    motions.set(state, this.motion);const m=this.motion;
    if (options.reduced) {
      if (fresh) playSound('complete', { gain: options.mode === 'session' ? .58 : .42 });
      m.landed=true;m.tailSound=true;m.plan=null;state.value = state.target; state.remaining = 0;
    }
    // Tiles pay in a cascade as they come to rest; the roll starts when the first light lands.
    const paying=(options.sources??[]).filter(source=>source.value>0),cascade=fresh&&lit&&!options.turbo?paying:[];
    const departs=cascade.map((source,i)=>(source.ready??packCascade(i,cascade.length,.2))+.04);
    if(fresh&&!options.reduced){
      // Without a stake to measure against there are no tiers to cross.
      m.plan=packCountPlan(state.value,state.target,bet>0?bet:Infinity,cascade.length?Math.min(...departs)+PACK_COUNT.travel:.1);
      // A win that reaches a tier takes over the screen for its roll.
      m.hero=lit&&this.finalTier>=0&&!!options.screen&&options.mode!=='interlude';
    }
    if(m.plan)state.remaining=Math.max(0,m.plan.land-m.age);
    const size=this.amountSize;this.titleSize=Math.min(20, height * .16, width * .047);
    const face={ fontFamily: 'BattleDisplay, Nunito, Arial', fontWeight: '400' as const, fontSize: 64 };
    this.title = new Text({ text: '', style: { ...face, fill: 0xfff2cf, stroke: { color: 0x061b32, width: 7 }, dropShadow: { color: 0x1c5f8f, blur: 0, distance: 7, angle: Math.PI / 2, alpha: 1 } }, resolution: 2 });
    this.titleShine = new Text({ text: '', style: { ...face, fill: 0xffffff }, resolution: 2 });
    for(const text of [this.title,this.titleShine])text.anchor.set(.5);this.titleShine.blendMode='add';this.titleShine.alpha=0;this.title.y=this.titleShine.y=-height*.29;
    this.amount = new ResultDigits(size);this.amount.y=height*.12;this.amountHost.addChild(this.amount);
    if(lit){
      const light=(texture:Texture,parent:Container)=>{const s=new Sprite(texture);s.anchor.set(.5);s.blendMode='add';s.alpha=0;parent.addChild(s);return s;};
      this.juice=new AwardJuice(options.low);this.bar=light(awardTextures().flare,this.celebrationLayer);this.celebrationLayer.addChild(this.juice.back);
      if(options.screen){const cover=(tint:number)=>{const s=new Sprite(Texture.WHITE);s.tint=tint;s.alpha=0;s.visible=false;s.position.set(options.screen!.x,options.screen!.y);s.width=options.screen!.width;s.height=options.screen!.height;this.addChild(s);return s;};this.veil=cover(0x030d1a);this.frame=cover(0xffffff);}
      this.pays=cascade.map((source,i)=>{const comet=new LightComet();this.addChild(comet.root);return {source,depart:departs[i],from:null,landed:false,comet,bend:i%2?1:-1};});
    }
    this.addChild(this.amountHost,this.title,this.titleShine);if(this.juice)this.addChild(this.juice.front);if(this.frame)this.addChild(this.frame);
    this.amount.fit(width*.8);this.amount.show(state.value,0);this.setTier(m.landed?this.finalTier:m.tier,true);
    // Type painted before the battle face has loaded is painted again once it has.
    if(typeof FontFace!=='undefined')void prepareBattleFont().then(()=>{if(this.destroyed)return;this.amount.restyle();this.titleTier=-2;this.setTier(this.motion.landed?this.finalTier:this.motion.tier,true);this.pose();options.draw();}).catch(()=>{});
    this.pose();
    if (!options.reduced) gsap.ticker.add(this.tick);
  }

  /** True while this total is still counting. */
  get paying(){return !!this.motion.plan&&!this.motion.landed;}
  /** After a rebuild in the middle of a count: tiles whose light had already left are lit again. */
  relight(){if(this.pays.length)return;(this.options.sources??[]).filter(source=>source.value>0).slice(0,this.motion.launched).forEach(source=>source.paid?.(0));}
  private get amountSize(){return Math.min(96,this.options.height*.46,this.options.width*.2);}
  private get light(){return this.finalTier>=0?TIER_PALETTE[PACK_TIERS[this.finalTier].tier].glow:this.ratio>=1?0xffd98a:0x9fe6ff;}
  /** The name above the total: the plain title, or the tier reached so far in that tier's colours. Restyled only on a change. */
  private setTier(tier:number,quiet=false){
    if(tier===this.titleTier)return;const up=tier>this.titleTier&&this.titleTier>-2;this.titleTier=tier;
    const text=tier>=0?PACK_TIERS[tier].title:resultWinTitle(0,this.options.mode==='session'),palette=tier>=0?TIER_PALETTE[PACK_TIERS[tier].tier]:{fill:this.ratio>=1?0xffe9a9:0xfff2cf,edge:0x1c5f8f,glow:0x9fe6ff};
    const size=tier>=0?Math.min(36,this.options.height*.25,this.options.width*.1):this.titleSize;
    this.title.text=this.titleShine.text=text;this.title.style.fill=palette.fill;(this.title.style.dropShadow as {color:number}).color=palette.edge;
    this.titleFit=Math.min(size/64,this.options.width*.86/Math.max(1,this.titleShine.width));
    if(up&&!quiet)this.upgrade(tier);
  }
  /** A tier is crossed: the name changes in place with a hard punch, and the panel feels it. */
  private upgrade(tier:number){
    const m=this.motion,palette=TIER_PALETTE[PACK_TIERS[tier].tier];m.tierAge=0;
    playSound(('win-rung-'+Math.min(3,tier+1)) as 'win-rung-1',{gain:.9});playSound('slam',{gain:.3+.08*tier});
    this.juice?.flare(0,this.title.y,this.options.width*(.9+.15*tier),.3,palette.glow,1.2+.3*tier);this.juice?.flare(0,this.title.y,this.options.width*.6,.18,0xffffff,.6);
    for(const way of [0,Math.PI])this.juice?.sparks(Math.cos(way)*this.options.width*.18,this.title.y,5+tier*2,this.amountSize*(2.4+tier*.5),palette.glow,.1,way,.4);
    this.options.onImpact?.(.3+.1*tier);
  }
  /** One frame of the count: the cascade, the roll, its ticks, the tier it has reached and the landing. */
  private advance(dt:number){
    const m=this.motion,plan=m.plan!,pose=packCountPose(plan,m.age);
    this.payLight(dt);
    this.state.value=Math.round(pose.value);this.state.remaining=Math.max(0,plan.land-m.age);this.amount.show(this.state.value,m.age);
    // Ticks come faster and higher as the roll runs.
    const ticks=packCountTicks(pose.progress,plan.segments.length-1);if(ticks>m.ticks){m.ticks=ticks;playSound('win-tick',{gain:.32+.4*pose.progress,rate:.9+.75*pose.progress+.07*Math.max(0,pose.tier)});}
    if(pose.tier>m.tier){m.tier=pose.tier;this.setTier(pose.tier);}
    if(pose.landed)this.land();
  }
  /** Tile to total: a streak leaves each paying tile as it comes to rest, a few hundredths apart, and lands across the digits. */
  private payLight(dt:number){
    if(!this.pays.length||!this.juice)return;const m=this.motion,ax=0,ay=this.amount.y,count=this.pays.length;
    this.pays.forEach((pay,i)=>{
      if(pay.landed||m.age<pay.depart)return;const tint=pay.source.tint,last=i===count-1,weight=Math.min(1,.35+.65*pay.source.value/Math.max(1,this.state.target));
      if(!pay.from){const p=pay.source.point();pay.from={x:p.x-this.x,y:p.y-this.y-pay.source.width*.55};pay.source.paid?.(weight);m.launched++;this.juice!.flare(pay.from.x,pay.from.y,pay.source.width*(1+.6*weight),.16,tint,.5,Math.atan2(ay-pay.from.y,ax-pay.from.x));if(i%3===0||last)playSound('flip',{gain:.3,pan:Math.max(-.5,Math.min(.5,pay.from.x/Math.max(1,this.options.width)))});}
      const from=pay.from,u=(m.age-pay.depart)/PACK_COUNT.travel,span=Math.hypot(ax-from.x,ay-from.y),cx=(from.x+ax)/2+pay.bend*span*.14,cy=(from.y+ay)/2,at=(t:number)=>{const e=Math.max(0,Math.min(1,t))**1.6,q=1-e;return {x:q*q*from.x+2*q*e*cx+e*e*ax,y:q*q*from.y+2*q*e*cy+e*e*ay};};
      if(u<1){const head=at(u),tail=at(u-.09),size=5+10*weight;pay.comet.pose(head.x,head.y,Math.atan2(head.y-tail.y,head.x-tail.x),span*(.3+.5*Math.sin(u*Math.PI)),size,tint,Math.min(1,u*9));
        if(!this.options.low){this.shed+=dt*(30+50*weight);while(this.shed>=1){this.shed--;this.juice!.shed(head.x,head.y,size,tint);}}return;}
      pay.landed=true;pay.comet.hide();m.arrived++;this.pulseAge=0;const back=at(.86);
      this.juice!.strike(ax,ay,this.options.width*(.26+.2*weight),tint,.2+.5*weight,Math.atan2(ay-back.y,ax-back.x));
    });
  }
  /** The total lands: hit-stop, a white frame, one punch through the panel, coins from behind the name, and gold digits. */
  private land(){
    const m=this.motion;if(m.landed)return;m.landed=true;m.landAge=0;m.tier=this.finalTier;this.state.value=this.state.target;this.state.remaining=0;this.amount.show(this.state.target,m.age);
    for(const pay of this.pays){pay.landed=true;pay.comet.hide();}
    // Every tile is marked paid, including after a rebuild that left no light in flight.
    for(const source of this.options.sources??[])if(source.value>0)source.paid?.(0);
    const tiered=this.finalTier>=0,power=tiered?.7+.1*this.finalTier:Math.min(.6,.25+.35*Math.min(1,this.ratio)),width=this.options.width,y=this.amount.y;
    this.setTier(this.finalTier,true);m.tierAge=tiered?0:-1;m.stop=tiered?PACK_COUNT.stop:PACK_COUNT.stop*.5;
    if(this.juice){
      this.juice.flare(0,y,width*(.9+.7*power),.3+.25*power,this.light,1.2+2*power);this.juice.flare(0,y,width*(.55+.4*power),.2,0xffffff,.6+.6*power);
      for(const way of [0,Math.PI])this.juice.sparks(Math.cos(way)*width*.18,y,Math.round(3+12*power),this.amountSize*(2.2+2.6*power),this.light,.12,way,.42);
      if(tiered){const palette=TIER_PALETTE[PACK_TIERS[this.finalTier].tier],spread=Math.min(46,this.amountSize*.7);
        this.juice.flare(0,y,this.amountSize*3.4,.3,0xffffff,.8,Math.PI/2);this.juice.rays(0,y,Math.max(width*1.7,this.options.effectsWidth??0),1.1,palette.glow);
        // Coins spill from behind the name, low, and come to rest along the plate's lip.
        this.juice.coins(0,this.title.y+this.titleSize*.6,palette.coin*.45,spread,this.options.ledge??y+this.amountSize*.56,.4*190/spread,true,width*.7/spread,1.2);}
    }
    playSound('win', { gain: this.options.mode === 'session' ? .85 : .6 });
    if(tiered){const rank=Math.min(4,this.finalTier+1);playSound(('win-final-'+rank) as 'win-final-1',{gain:.9});playSound(('win-coins-'+Math.min(3,rank)) as 'win-coins-1',{gain:.8});playSound('win-stamp',{gain:.7});}
    this.options.onImpact?.(tiered?1:.45*power);
  }

  private pose() {
    const m = this.motion,reduced=this.options.reduced,size=this.amountSize,width=this.options.width,landed=m.landed;
    const pose=m.plan&&!landed?packCountPose(m.plan,m.age):null,progress=pose?pose.progress:landed?1:0;
    // Takeover: the room dims behind the total while a tiered win rolls, and lifts as soon as it has landed.
    const hero=m.hero&&!reduced?(landed?1-smooth((m.landAge-.25)/.45):smooth((m.age-m.plan!.start+.05)/.22)):0;
    if(this.veil){this.veil.visible=hero>.003;this.veil.alpha=.76*hero;}
    if(this.frame){const white=landed&&m.hero?Math.max(0,1-m.landAge/.16)**1.6*.8:0;this.frame.visible=white>.004;this.frame.alpha=white;}
    // The name: punched on every upgrade, with a white shine that dies quickly.
    const roomy=this.options.height>=120?1:.3,stamp=reduced||m.tierAge<0?{scale:1,rotation:0}:juiceUp(m.tierAge,.5,.06),lift=1+hero*roomy*(.2+.05*Math.max(0,m.tier));
    for(const text of [this.title,this.titleShine]){text.scale.set(this.titleFit*stamp.scale*lift);text.rotation=stamp.rotation;text.y=-this.options.height*.29-hero*roomy*size*.2;}
    this.titleShine.alpha=reduced||m.tierAge<0?0:Math.max(0,1-m.tierAge/.24)*.9;
    // The digits: a nudge for every light that lands, a punch on the landing, and gold once they have landed.
    const nudge=reduced?0:Math.exp(-this.pulseAge*16)*.05*(landed?0:1),hit=reduced||!landed?{scale:1,rotation:0}:juiceUp(m.landAge,this.finalTier>=0?.34:.2,.02),golden=this.ratio>=1?(landed?smooth(m.landAge/.22):.25*progress):0;
    this.amountHost.scale.set((1+nudge)*hit.scale*(1+hero*.24*roomy));this.amountHost.rotation=hit.rotation;this.amountHost.y=hero*roomy*size*.12;
    this.amount.pose(m.age,reduced?(this.ratio>=1?1:0):golden,reduced||!landed?nudge*4:Math.max(0,1-m.landAge/.3)*.85);
    // The bar the amount stands on lengthens as the count climbs and flares when it lands.
    if(this.bar){const flare=landed?Math.exp(-m.landAge*5):0;this.bar.position.set(0,this.amount.y+size*.56+hero*roomy*size*.2);this.bar.tint=this.light;this.bar.scale.set(width*(.34+.5*progress+flare*.25)*(1+hero*.24*roomy)/256,.14+progress*.16+flare*.75);this.bar.alpha=Math.min(1,m.age/.2)*(.3+.3*progress+flare*.3);}
  }

  /** A visual beat on the total from outside (a value arriving); it never replays the result's audio. */
  pulse() { if (this.options.reduced || this.destroyed) return; this.pulseAge=0; this.idle=false; }

  /** Show `value`; the target lands the count at once: every tile is marked paid and the landing plays. */
  display(value: number) {
    const m=this.motion;
    if(value===this.state.target){
      if(m.landed){this.state.value=value;this.state.remaining=0;return;}
      if(m.plan&&!this.options.reduced){m.age=Math.max(m.age,m.plan.land);m.ticks=1e9;this.land();this.pose();return;}
      m.landed=true;m.tailSound=true;this.state.value=value;this.state.remaining=0;
    }
    this.amount.show(value,m.age);this.pose();
  }

  override destroy() {
    if (this.destroyed) return;
    if(this.motion.landed)this.motion.tailSound=true;
    gsap.ticker.remove(this.tick);
    this.juice?.destroy();this.juice=null;
    if(!this.celebrationLayer.destroyed)this.celebrationLayer.destroy({children:true});
    super.destroy({ children: true });
  }
}
