/** Native Spine 4.2 keyframes. Artwork regions join exactly in the resting pose. */
export const WIN_BANNER_ATLAS='win-frame-v2.png\nsize: 2172,724\nfilter: Linear,Linear\npma: false\nleft\n  bounds: 0,0,565,724\nplate\n  bounds: 565,0,1042,724\nright\n  bounds: 1607,0,565,724\n';
export function buildWinBannerRigJson(){
 const wing=565/2172*1000,plate=1042/2172*1000;
 return {skeleton:{spine:'4.2.22'},bones:[{name:'root'},{name:'plaque',parent:'root'},{name:'left',parent:'plaque',x:-plate/2},{name:'right',parent:'plaque',x:plate/2},{name:'title',parent:'plaque',y:1000/3*.13},{name:'amount',parent:'plaque',y:-1000/3*.075}],
  slots:[{name:'left',bone:'left',attachment:'left'},{name:'right',bone:'right',attachment:'right'},{name:'plate',bone:'plaque',attachment:'plate'}],
  skins:[{name:'default',attachments:{left:{left:{path:'left',width:wing,height:1000/3,x:-wing/2}},right:{right:{path:'right',width:wing,height:1000/3,x:wing/2}},plate:{plate:{path:'plate',width:plate,height:1000/3}}}}],
  events:{impact:{}},animations:{celebrate:{events:[{time:.18,name:'impact'}],bones:{
   plaque:{translate:[{y:-32},{time:.18,y:6},{time:.34,y:-2},{time:.46,y:0}],scale:[{x:.64,y:.50},{time:.18,x:1.045,y:1.08},{time:.34,x:.99,y:.985},{time:.46,x:1,y:1}]},
   left:{rotate:[{value:-28},{time:.20,value:5},{time:.37,value:-1.3},{time:.50,value:0}],translate:[{x:100},{time:.20,x:-8},{time:.37,x:2},{time:.50,x:0}],scale:[{x:.25,y:.75},{time:.23,x:1.05,y:1.03},{time:.50,x:1,y:1}]},
   right:{rotate:[{value:28},{time:.23,value:-5},{time:.40,value:1.3},{time:.53,value:0}],translate:[{x:-100},{time:.23,x:8},{time:.40,x:-2},{time:.53,x:0}],scale:[{x:.25,y:.75},{time:.26,x:1.05,y:1.03},{time:.53,x:1,y:1}]},
   title:{scale:[{x:.55,y:.55},{time:.10,x:.55,y:.55},{time:.25,x:1.10,y:1.10},{time:.40,x:1,y:1}]},
   amount:{scale:[{x:.72,y:.72},{time:.20,x:.72,y:.72},{time:.36,x:1.10,y:1.10},{time:.52,x:1,y:1}]}
  },slots:{plate:{alpha:[{value:0},{time:.08,value:1}]},left:{alpha:[{value:0},{time:.08,value:1}]},right:{alpha:[{value:0},{time:.08,value:1}]}}},
  idle:{bones:{
   plaque:{translate:[{y:0},{time:1.2,y:3},{time:2.4,y:0}],scale:[{x:1,y:1},{time:1.2,x:1.005,y:1.005},{time:2.4,x:1,y:1}]},
   left:{rotate:[{value:0},{time:1.2,value:-1.2},{time:2.4,value:0}]},
   right:{rotate:[{value:0},{time:1.2,value:1.2},{time:2.4,value:0}]}
  },slots:{plate:{alpha:[{value:1}]},left:{alpha:[{value:1}]},right:{alpha:[{value:1}]}}}
  }};
}
