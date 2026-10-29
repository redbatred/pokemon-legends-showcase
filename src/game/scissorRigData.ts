export const SCISSOR_ATLAS=`scissors.png
size: 320,192
filter: Linear,Linear
pma: false
front
  bounds: 0,0,160,160
back
  bounds: 160,0,160,160
pivot
  bounds: 0,160,32,32
`;
export function buildScissorRigJson(){return {
 skeleton:{spine:'4.2.22'},bones:[{name:'root'},{name:'back',parent:'root',rotation:-19},{name:'front',parent:'root',rotation:19}],
 slots:[{name:'back',bone:'back',attachment:'back'},{name:'front',bone:'front',attachment:'front'},{name:'pivot',bone:'root',attachment:'pivot'}],
 skins:[{name:'default',attachments:{back:{back:{width:160,height:160}},front:{front:{width:160,height:160}},pivot:{pivot:{width:17,height:17}}}}],
 animations:{snip:{bones:{back:{rotate:[{value:0},{time:.26,value:0},{time:.42,value:16},{time:.62,value:0},{time:1.4,value:0}]},front:{rotate:[{value:0},{time:.26,value:0},{time:.42,value:-16},{time:.62,value:0},{time:1.4,value:0}]}}}}
};}
