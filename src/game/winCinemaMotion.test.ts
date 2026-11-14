import {expect,it} from 'vitest';
import {AWARD_INK,WIN_CINEMA_FINISH,WIN_CINEMA_IMPACT,winCinemaGeometry,winCinemaPose} from './winCinemaMotion';
it('reserves the opening for the performance before any award text or count',()=>{for(const t of [0,.5,1,WIN_CINEMA_IMPACT])expect(winCinemaPose(t)).toMatchObject({count:0,amountAlpha:0,titleAlpha:0});});
it('counts monotonically, holds its exact final total, and exits only on advance',()=>{let last=0;for(let t=0;t<8;t+=.01){const p=winCinemaPose(t);expect(p.count).toBeGreaterThanOrEqual(last);last=p.count;}expect(winCinemaPose(WIN_CINEMA_FINISH).count).toBe(1);expect(winCinemaPose(900)).toMatchObject({count:1,alpha:1});expect(winCinemaPose(900,1.05).alpha).toBe(0);});
it('withholds the win title until the final strike, then reveals it',()=>{for(const t of [2,3.55,5.9,6.119])expect(winCinemaPose(t).titleAlpha).toBe(0);expect(winCinemaPose(WIN_CINEMA_FINISH+.2).titleAlpha).toBe(1);});
it('stacks prompt, amount and title without overlap on every screen shape',()=>{
 const ink=AWARD_INK,sizes=[[390,844],[540,720],[720,960],[800,571],[844,390],[1280,720],[1920,1080],[360,640]];
 for(const [w,h] of sizes)for(const legendary of [false,true])for(const age of [3,WIN_CINEMA_FINISH+2]){
  const g=winCinemaGeometry(w,h,legendary,age),amountTop=g.amountY-g.size*ink.amountTop,amountBottom=g.amountY+g.size*ink.amountBottom;
  expect(amountBottom).toBeLessThanOrEqual(g.promptY-g.promptSize*.7);expect(g.promptY+g.promptSize).toBeLessThan(h);
  const last=g.titleRows[g.titleRows.length-1];expect(last.y+last.size*ink.titleBottom+ink.titleShadow).toBeLessThanOrEqual(amountTop);
  // The count banner clears the amount as well.
  expect(g.bannerY+g.bannerSize*ink.titleBottom+ink.titleShadow*.6).toBeLessThanOrEqual(amountTop);
  if(g.titleRows.length===2){const [first,second]=g.titleRows;expect(first.y+first.size*ink.titleBottom).toBeLessThanOrEqual(second.y-second.size*ink.titleTop+first.size*.06);}
  // Lettering leaves the top of the frame to the Pokémon and stays inside the width.
  expect(g.titleRows[0].y-g.titleRows[0].size*ink.titleTop).toBeGreaterThan(h*.3);
  expect(legendary&&!g.stacked?13*.49*g.titleRows[0].size:0).toBeLessThanOrEqual(w*.91);
 }
});
it('splits LEGENDARY WIN over two rows only on portrait screens',()=>{
 expect(winCinemaGeometry(540,720,true,8)).toMatchObject({stacked:true});expect(winCinemaGeometry(540,720,true,8).titleRows).toHaveLength(2);
 expect(winCinemaGeometry(800,571,true,8)).toMatchObject({stacked:false});expect(winCinemaGeometry(540,720,false,8).stacked).toBe(false);
});

