import { Container, Graphics, Text, Texture } from 'pixi.js';
import { AtlasAttachmentLoader, SkeletonJson, Spine, SpineTexture, TextureAtlas } from '@esotericsoftware/spine-pixi-v8';
import { gsap } from 'gsap';
import { MoneyReadout } from './MoneyReadout';
import type { MoneyState } from './moneyMotion';
import { playSound } from './audio';
import { buildResultWinRigJson,buildResultWinFountainsJson, RESULT_WIN_ATLAS } from './resultWinRigData';

export type ResultWinOptions = { width: number; height: number; effectsWidth?:number;effectsHeight?:number;mode: 'pack' | 'session' | 'interlude'; reduced: boolean; turbo: boolean; low: boolean; draw: () => void };
type Motion = { age: number; impactAge: number; started: boolean; done: boolean; credits: number; duration: number; arrivalSound:boolean; tailSound:boolean };
const motions = new WeakMap<MoneyState, Motion>();
let resources: Promise<SkeletonJson> | undefined;

/** One tiny shared material atlas; every result owns its native Spine pose. */
export function preloadResultWin(): Promise<SkeletonJson> {
  return resources ??= Promise.resolve().then(() => {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 64;
    const c = canvas.getContext('2d');
    if (!c) throw new Error('A 2D canvas is required for result-win materials.');
    c.fillStyle = '#fff'; c.fillRect(0, 0, 4, 4);
    c.beginPath(); [[8, 16], [21, 13], [24, 0], [27, 13], [40, 16], [27, 19], [24, 32], [21, 19]].forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(45, 1); c.lineTo(51, 0); c.lineTo(51, 10); c.lineTo(44, 12); c.closePath(); c.fill();
    const atlas = new TextureAtlas(RESULT_WIN_ATLAS);
    atlas.pages[0].setTexture(SpineTexture.from(Texture.from(canvas).source));
    return new SkeletonJson(new AtlasAttachmentLoader(atlas));
  }).catch(error => { resources = undefined; throw error; });
}

/** A single large result amount. Its GSAP clock continues while the stage's
 * Pixi ticker is paused by a result modal, and never escapes its local bounds. */
export class ResultWin extends Container {
  readonly amount: MoneyReadout;
  readonly celebrationLayer=new Container();
  private readonly content = new Container();
  private readonly amountHost = new Container();
  private readonly motion: Motion;
  private rig: Spine | null = null;
  private fountains:Spine|null=null;
  private rigAnimation = '';
  private entrance: gsap.core.Timeline | null = null;
  private impact: gsap.core.Tween | null = null;
  private readonly tick = (_time: number, deltaMS: number) => {
    if (this.destroyed || document.hidden) return;
    const dt = Math.min(.1, Math.max(0, deltaMS / 1000));
    this.motion.age += dt;
    if (this.motion.impactAge >= 0) this.motion.impactAge += dt;
    if(this.motion.started&&!this.motion.done&&!this.motion.arrivalSound&&this.motion.age>=.08){this.motion.arrivalSound=true;playSound('wincollect',{gain:.38});}
    if (!this.motion.done && this.state.value === this.state.target) this.finish();
    if(this.motion.impactAge>=.16&&!this.motion.tailSound){this.motion.tailSound=true;playSound('complete',{gain:this.options.mode==='session'?.8:.6});}
    if (!this.motion.done && this.motion.started) {
      const beats = [.20,.38,.56,.73,.88].map(beat=>beat*this.motion.duration);
      const next = beats[this.motion.credits];
      if (next !== undefined && this.motion.age >= next) { this.motion.credits++; playSound('credit', { gain: .34+this.motion.credits*.035 }); }
    }
    this.pose(); this.options.draw();
  };

  constructor(private readonly state: MoneyState, private readonly options: ResultWinOptions) {
    super(); this.eventMode = 'none'; this.addChild(this.content);
    const width = Math.max(1, options.width), height = Math.max(1, options.height);
    const previous = motions.get(state), fresh = !previous && state.value === 0 && state.target > 0 && state.remaining > 0;
    const duration=options.mode==='interlude'?(options.turbo?.50:.85):options.turbo?.95:options.mode==='session'?1.9:1.5;
    this.motion = previous ?? { age: 0, impactAge: -1, started: fresh, done: state.value === state.target, credits: 0, duration,arrivalSound:false,tailSound:false };
    motions.set(state, this.motion);
    if (fresh && !options.reduced) state.remaining = this.motion.duration;
    if (options.reduced) {
      if (!this.motion.done && this.motion.started) playSound('complete', { gain: options.mode === 'session' ? .58 : .42 });
      this.motion.done = true; this.motion.started = false; state.value = state.target; state.remaining = 0;
    }

    const mask = new Graphics().rect(-width / 2, -height / 2, width, height).fill(0xffffff);
    this.addChild(mask); this.content.mask = mask;
    const title = new Text({ text: options.mode === 'session' ? 'SESSION WIN' : 'PACK WIN', style: { fontFamily: 'Nunito, Arial, sans-serif', fontWeight: '900', fontSize: Math.min(20, height * .16, width * .047), letterSpacing: Math.min(2.4, width * .004), fill: 0xffe9a9, stroke: { color: 0x10324e, width: 1 } }, resolution: 3 });
    title.anchor.set(.5); title.y = -height * .355;
    if (title.width > width * .66) title.scale.set(width * .66 / title.width);
    this.amount = new MoneyReadout(state, { size: Math.min(112, height * .54, width * .23), color: 0xffeeaf, align: 'center', width: width * .66, plus: false, hero: false, centerY: true, reduced: options.reduced, ticks: false, draw: options.draw });
    this.amount.y=height*.025;
    this.amountHost.addChild(this.amount); this.content.addChild(title, this.amountHost);
    if (fresh && !options.reduced) {
      this.entrance = gsap.timeline({ onUpdate: options.draw });
      this.entrance.from(this.amountHost, { alpha: 0, duration: .18 }, 0).from(this.amountHost.scale, { x: .86, y: .86, duration: .42, ease: 'back.out(1.7)' }, 0).from(title, { alpha: 0, duration: .22 }, .03);
    }
    void preloadResultWin().then(reader => {
      if (this.destroyed) return;
      this.rig = new Spine({ skeletonData: reader.readSkeletonData(buildResultWinRigJson(width, height, options.low)), autoUpdate: false });
      if(options.effectsWidth&&!options.reduced){this.fountains=new Spine({skeletonData:reader.readSkeletonData(buildResultWinFountainsJson(options.effectsWidth,options.effectsHeight??height*3,options.low)),autoUpdate:false});this.fountains.state.setAnimation(0,'impact',false);this.celebrationLayer.addChild(this.fountains);}
      this.content.addChildAt(this.rig, 0); this.pose(); options.draw();
    }).catch(() => {});
    if (!options.reduced) gsap.ticker.add(this.tick);
  }

  private pose() {
    if (!this.rig) return;
    const m = this.motion;
    const name = this.options.reduced ? 'held' : m.impactAge >= 0 && m.impactAge < .85 ? 'impact' : m.started && m.age < .4 ? 'arrive' : !m.done?'charge':'idle';
    if (name !== this.rigAnimation) {
      this.rig.skeleton.setToSetupPose(); this.rig.state.clearTracks();
      this.rig.state.setAnimation(0, name, name === 'idle'||name==='charge'); this.rigAnimation = name;
    }
    const entry = this.rig.state.getCurrent(0);
    if (entry) entry.trackTime = name === 'impact' ? m.impactAge : name === 'arrive' ? m.age : name === 'charge'?m.age%.9:name === 'idle' ? m.age % 3.6 : 0;
    this.rig.update(0);
    if(this.fountains){this.celebrationLayer.visible=m.impactAge>=0&&m.impactAge<1.7;const track=this.fountains.state.getCurrent(0);if(track)track.trackTime=Math.max(0,m.impactAge);this.fountains.update(0);}
  }

  private finish() {
    this.motion.done = true;this.motion.arrivalSound=true;
    if (!this.motion.started || this.options.reduced) return;
    this.motion.impactAge = 0; this.pulse();
    playSound('win', { gain: this.options.mode === 'session' ? .85 : .6 });
  }

  /** A visual landing beat; repeated calls never replay the result's audio. */
  pulse() {
    if (this.options.reduced || this.destroyed) return;
    this.entrance?.progress(1).kill(); this.entrance = null; this.amountHost.alpha = 1;
    this.impact?.kill(); this.amountHost.scale.set(1.13);
    this.impact = gsap.to(this.amountHost.scale, { x: 1, y: 1, duration: .58, ease: 'elastic.out(1,.45)', onUpdate: this.options.draw });
  }

  display(value: number) {
    this.amount.display(value);
    if (value === this.state.target && !this.motion.done) this.finish();
  }

  override destroy() {
    if (this.destroyed) return;
    if(this.motion.done)this.motion.tailSound=true;
    gsap.ticker.remove(this.tick); this.entrance?.kill(); this.impact?.kill();
    this.rig?.state.clearTracks(); this.rig = null;
    if(!this.celebrationLayer.destroyed)this.celebrationLayer.destroy({children:true});this.fountains=null;
    super.destroy({ children: true });
  }
}
