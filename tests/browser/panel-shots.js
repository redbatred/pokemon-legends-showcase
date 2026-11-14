// Review helper for pack-flow-lab.html?browse=1&job=none: stills of every panel, with a seeded collection and history.
// Panels pause the stage, so each still is rendered and copied in the same task.
(()=>{const g=window.flowGame,shots='http://127.0.0.1:5199/save?name=';
 const snapNow=async name=>{const app=g.stage.app;app.renderer.render(app.stage);const source=app.canvas,c=document.createElement('canvas');c.width=source.width;c.height=source.height;c.getContext('2d').drawImage(source,0,0);const blob=await new Promise(r=>c.toBlob(r,'image/png'));const res=await fetch(shots+name,{method:'POST',body:blob});return res.status+' '+c.width+'x'+c.height;};
 const seed=()=>{const pool=g.pool,collection={};pool.slice(0,9).forEach((c,i)=>collection[c.id]=1+i%3);
  const pack=(n,total,bonus)=>({id:'h'+n,at:new Date(Date.now()-n*3600e3).toISOString(),cards:[...pool.slice(n,n+10),{id:'energy',number:'',name:'Basic Fire Energy',rarity:'Energy',image:'/assets/cards/energy.webp',value:0,weight:0}],pack:g.packs[0],total,...(bonus?{bonus:{name:'Lugia',image:'/assets/sets/silver-tempest/cards/186.webp',multiplier:180,amount:180000}}:{})});
  g.save={...g.save,collection,history:[pack(0,181290,true),pack(2,915),pack(4,2450)],totalWon:184655};g.render();};
 window.panelShots=async tag=>{seed();g.inspected=null;g.panel=null;g.view.historyOpening=null;g.render();await stepFor(.4);const out=[];
  for(const name of ['settings','auto','collection','history','about']){g.action(name);await stepFor(1.0);out.push(name+' '+await snapNow('md-'+tag+'-'+name));g.action('close');await stepFor(.6);}
  g.action('collection');await stepFor(.8);g.inspected=g.pool[5];g.render();await stepFor(.9);out.push('inspect '+await snapNow('md-'+tag+'-inspect'));g.inspected=null;g.panel=null;g.render();await stepFor(.4);
  g.action('history');await stepFor(.8);g.view.openHistoryHand(g.save.history[0]);await stepFor(1.0);out.push('replay '+await snapNow('md-'+tag+'-replay'));g.view.historyOpening=null;g.panel=null;g.render();await stepFor(.3);return out;};
 window.snapNow=snapNow;})();
