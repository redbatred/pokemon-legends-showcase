import {describe,expect,it} from 'vitest';
import {BADGE_BALL,bonusBadgePose,bonusFlightPose,bonusSeatPose} from './bonusBallMotion';

describe('bonus ball in the pack',()=>{
 it('arrives from the lens, lands exactly in the well and prints the mark on contact',()=>{
  const early=bonusBadgePose(BADGE_BALL.drop+.02),late=bonusBadgePose(BADGE_BALL.impact-.02),contact=bonusBadgePose(BADGE_BALL.impact);
  expect(early.ball.radius).toBeGreaterThan(late.ball.radius);expect(late.ball.radius).toBeGreaterThan(BADGE_BALL.seated);
  expect(early.mark.alpha).toBe(0);expect(late.mark.alpha).toBe(0);
  expect(contact.ball.x).toBeCloseTo(0);expect(contact.ball.radius).toBeCloseTo(BADGE_BALL.seated);expect(contact.ball.tumble).toBeCloseTo(0);
  expect(bonusBadgePose(BADGE_BALL.impact+.04).mark.alpha).toBe(1);
  // The hardest squash and the brightest light are at contact, and both die away.
  expect(contact.ball.squash).toBeGreaterThan(.25);expect(contact.light.barAlpha).toBe(1);
  const rest=bonusBadgePose(BADGE_BALL.impact+1.4);expect(Math.abs(rest.ball.squash)).toBeLessThan(.001);expect(rest.light.washAlpha).toBeLessThan(.001);expect(rest.mark.flash).toBeLessThan(.001);expect(rest.light.sparkAlpha).toBeLessThan(.01);expect(rest.mark.scale).toBeCloseTo(1,3);expect(rest.seated).toBe(true);
 });
 it('drags light behind it only on the way in, and its latch glints once before it is carried off',()=>{
  expect(bonusBadgePose((BADGE_BALL.drop+BADGE_BALL.impact)/2).tail).toBeGreaterThan(.5);expect(bonusBadgePose(BADGE_BALL.impact+.01).tail).toBe(0);
  expect(bonusBadgePose(BADGE_BALL.lift-.2).light.glint).toBeCloseTo(1);expect(bonusBadgePose(BADGE_BALL.impact+.2).light.glint).toBeLessThan(.01);expect(bonusBadgePose(BADGE_BALL.lift).light.glint).toBeLessThan(.02);
 });
 it('is seated and still before a carried ball lifts off',()=>{
  const p=bonusBadgePose(BADGE_BALL.lift);expect(Math.abs(p.ball.x)).toBeLessThan(.01);expect(Math.abs(p.ball.y)).toBeLessThan(.5);expect(Math.abs(p.ball.roll)).toBeLessThan(.01);expect(p.ball.radius).toBeCloseTo(BADGE_BALL.seated);
 });
 it('shows the finished mark at once with reduced motion',()=>{
  for(const age of [0,.2,2]){const p=bonusBadgePose(age,true);expect(p.mark).toEqual({alpha:1,scale:1,flash:0});expect(p.tail).toBe(0);expect(p.ball.radius).toBe(BADGE_BALL.seated);expect(p.light.washAlpha).toBe(0);expect(p.light.barAlpha).toBe(0);}
 });
 it('flies from its seat to its socket, largest at the top of the arc',()=>{
  const from={x:100,y:300,radius:13},to={x:420,y:520,radius:12};
  expect(bonusFlightPose(0,from,to,80)).toMatchObject({x:100,y:300});expect(bonusFlightPose(0,from,to,80).radius).toBeCloseTo(13);
  const end=bonusFlightPose(1,from,to,80);expect(end.x).toBeCloseTo(420);expect(end.y).toBeCloseTo(520);expect(end.radius).toBeCloseTo(12);expect(end.tumble).toBe(0);expect(Math.abs(end.roll)).toBeLessThan(1e-9);
  const mid=bonusFlightPose(.5,from,to,80);expect(mid.radius).toBeGreaterThan(13*2);expect(mid.y).toBeLessThan((300+520)/2-70);
  // It always travels toward the socket.
  let previous=from.x;for(let p=.05;p<=1;p+=.05){const x=bonusFlightPose(p,from,to,80).x;expect(x).toBeGreaterThan(previous);previous=x;}
 });
 it('takes its seat with one squash that settles, and keeps its socket lit',()=>{
  expect(bonusSeatPose(-.1)).toEqual({squash:0,sink:0,glow:0,flash:0});
  expect(bonusSeatPose(0).squash).toBeCloseTo(.28);expect(bonusSeatPose(0).flash).toBe(1);
  const settled=bonusSeatPose(1.2);expect(Math.abs(settled.squash)).toBeLessThan(.001);expect(settled.sink).toBe(1);expect(settled.glow).toBeGreaterThan(.29);expect(settled.flash).toBeLessThan(.001);
  expect(bonusSeatPose(.3,true)).toEqual({squash:0,sink:1,glow:.3,flash:0});
 });
});
