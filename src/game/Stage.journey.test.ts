import {expect,it} from 'vitest';
import {Container} from 'pixi.js';
import {OpeningStage} from './Stage';
import {gameLayout} from './rendering';
it('keeps later auto packs in the arena when wrapper extraction starts, including after rotation',()=>{
 const stage=Object.assign(Object.create(OpeningStage.prototype),{app:{screen:{width:1280,height:780}},world:new Container(),journey:{amount:0,startOpening:true}});
 for(const [width,height] of [[1280,780],[390,780],[780,390]])for(const amount of [0,.01,.5,1]){
  stage.app.screen={width,height};stage.journey.amount=amount;stage.positionJourney();const expected=gameLayout(width,height,true);
  expect(stage.world.y).toBe(expected.worldY);expect(stage.world.scale.x).toBe(expected.scale);
 }
});
it('retains the original manual pack journey from the lobby pose to the arena',()=>{
 const stage=Object.assign(Object.create(OpeningStage.prototype),{app:{screen:{width:1280,height:780}},world:new Container(),journey:{amount:0,startOpening:false}});
 stage.positionJourney();expect(stage.world.y).toBe(gameLayout(1280,780,false).worldY);
 stage.journey.amount=1;stage.positionJourney();expect(stage.world.y).toBe(gameLayout(1280,780,true).worldY);
});
