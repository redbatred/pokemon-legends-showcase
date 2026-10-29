import{G as Kt,P as Is,b as Dr,C as Di,c as Wh,S as Xh,d as qh,f as Yh}from"./pixi-B8PkG-fw.js";import{T as Dl,aI as Ul,az as Nl,f as Fl,aG as kl,b2 as Kh,b3 as $h,b4 as Zh,b5 as Gn,b6 as jh,b7 as Jh,b8 as ac}from"./index-D-jae49H.js";import"./motion-xgxdCp6f.js";const Qh={aerodactyl:"soar",alakazam:"levitate",arceus:"levitate",articuno:"soar",blastoise:"land",breloom:"dash",charizard:"land",cinderace:"dash",cleffa:"bloom",dracozolt:"land",dragonite:"soar",duraludon:"land",eevee:"dash",espeon:"levitate",forretress:"levitate",gardevoir:"levitate",genesect:"land",gengar:"phase",giratina:"phase",glaceon:"land",gloom:"bloom",greninja:"dash",gyarados:"coil",kyogre:"soar",leafeon:"dash",lugia:"soar",mew:"levitate",mewtwo:"levitate",moltres:"soar",ninetales:"bloom",oddish:"bloom",clodsire:"land",pidgeot:"soar",pidgey:"soar",pikachu:"dash",pinsir:"land",raichu:"dash",raikou:"dash",rayquaza:"coil",rotom:"phase",scizor:"dash",starmie:"levitate",suicune:"dash",sylveon:"bloom",trevenant:"phase",tyranitar:"land",umbreon:"phase",vaporeon:"bloom",venusaur:"land",zapdos:"soar"},ed={land:{side:0,lift:29,settle:65,weight:1,impact:1},dash:{side:-43,lift:49,settle:65,weight:.65,impact:.8},soar:{side:26,lift:83,settle:30,weight:.4,impact:.55},levitate:{side:0,lift:48,settle:35,weight:.2,impact:.45},coil:{side:-17,lift:68,settle:49,weight:.6,impact:.85},bloom:{side:13,lift:30,settle:65,weight:.5,impact:.6},phase:{side:0,lift:45,settle:46,weight:.18,impact:.65}};function or(s){const e=Qh[s]??"land",n={blastoise:[-12,4],greninja:[52,3],mewtwo:[22,7],alakazam:[9,5],gengar:[-14,6],scizor:[32,5],gyarados:[30,5],lugia:[25,5],rayquaza:[28,5],kyogre:[24,12]}[s]??[22,7],i=["land","dash","bloom"].includes(e)||["alakazam","espeon","gardevoir","mewtwo","starmie","umbreon","trevenant","gengar"].includes(s);return{entrance:e,grounded:i,...ed[e],cameraYaw:n[0],cameraElevation:n[1],...["tyranitar","duraludon","venusaur","blastoise"].includes(s)?{weight:1.2,impact:1.15}:{},...s==="mew"?{side:30,lift:65}:{},...s==="pikachu"?{side:34,lift:60}:{},...s==="eevee"?{side:-28,lift:42}:{},...s==="giratina"?{lift:80,settle:20}:{},...s==="arceus"?{lift:65,settle:12}:{},...s==="suicune"?{side:40,lift:56}:{}}}class td{constructor(e,t,n,i){this.profile=e,this.color=t,this.light=n,this.low=i}profile;color;light;low;back=new Kt;front=new Kt;progress=0;opacity=0;update(e,t){const n=this.back.clear(),i=this.front.clear(),r=this.progress,a=this.opacity;if(a<=.001)return;const o=this.profile.entrance,c=this.color,l=this.light,h=this.low?5:9;if(o==="soar"||o==="coil")for(let d=0;d<3;d++){const f=Math.max(0,Math.min(1,r*1.4-d*.11)),u=30+f*90,g=t+95-d*23;n.moveTo(e-u,g+16).bezierCurveTo(e-u*.55,g-25,e+u*.6,g-24,e+u,g-8).stroke({color:d===1?l:c,width:3.5-d*.7,alpha:a*(1-f)*.8})}else if(o==="levitate"||o==="phase"){for(let f=0;f<h;f++){const u=f/h*Math.PI*2+r*2,g=96*(1-r*.55),v=e+Math.cos(u)*g,p=t+70+Math.sin(u)*g*.8,m=(f%3+3)*(1-r*.4);n.poly([v,p-m*2,v+m,p,v,p+m*2,v-m,p]).fill({color:o==="phase"?c:l,alpha:a*.7})}const d=28+r*70;for(let f=0;f<3;f++){const u=f*Math.PI*2/3-r*3;n.arc(e,t+80,d,u,u+.65).stroke({color:c,width:2.2,alpha:a*.45})}}else if(o==="bloom")for(let d=0;d<h;d++){const f=d/h*Math.PI*2,u=25+r*80,g=e+Math.cos(f)*u,v=t+100+Math.sin(f)*u*.6-r*35;n.moveTo(g,v-7).quadraticCurveTo(g+10,v-4,g,v+9).quadraticCurveTo(g-6,v+1,g,v-7).fill({color:d%2?c:l,alpha:a*.7})}else{for(let d=0;d<h;d++){const f=Math.PI+d/h*Math.PI,u=20+r*100,g=e+Math.cos(f)*u,v=218+Math.sin(f)*u*.18,p=18+25*r;i.moveTo(g,v).lineTo(g+Math.cos(f)*p,v+Math.sin(f)*p*.35).lineTo(g+Math.cos(f)*p*.6,v+6).closePath().fill({color:d%3?c:l,alpha:a*(1-r)*.7})}if(o==="dash")for(let d=0;d<4;d++)n.moveTo(e-this.profile.side*2-d*9,t+70+d*18).lineTo(e-this.profile.side*.2,t+60+d*18).stroke({color:l,width:1.4,alpha:a*(1-r)*.5})}}destroy(){this.back.destroy(),this.front.destroy()}}const Zi=s=>Math.max(0,Math.min(1,s)),Ls=Math.PI*2,oc=(s,e)=>Math.round((s>>16&255)*e)<<16|Math.round((s>>8&255)*e)<<8|Math.round((s&255)*e);function nd(s,e,t,n,i,r,a,o){const c=t.color,l=t.light,h=Zi(i/.62),d=a?6:11,f=(u,g,v,p,m,T)=>{const A=Math.cos(p),x=Math.sin(p),M=[u+A*v,g+x*v],y=[u-A*v,g-x*v],w=[u-x*v*.43,g+A*v*.43],_=[u+x*v*.43,g-A*v*.43],E=[u+A*v*.16,g+x*v*.16];s.poly([...y,...w,...M,..._]).fill({color:oc(m,.55),alpha:T}).stroke({color:oc(m,.4),width:1.2,alpha:T*.65}),s.poly([...y,...w,...E]).fill({color:m,alpha:T}),s.poly([...w,...M,...E]).fill({color:l,alpha:T*.85}),s.poly([...M,..._,...E]).fill({color:m,alpha:T*.9}),s.moveTo(y[0],y[1]).lineTo(E[0],E[1]).lineTo(M[0],M[1]).stroke({color:l,width:.8,alpha:T*.85})};if(t.move==="crystals"||t.move==="gems"){for(let u=0;u<d;u++){const g=Zi((i-u*.025)/.52),v=25+g*210,p=Math.sin(u*9.3)*(12+g*55),[m,T]=n(v,p),A=(t.species==="aerodactyl"?15:9)+u%3*3,x=r*(1-g*.65);s.moveTo(...n(Math.max(0,v-27),p)).lineTo(m,T).stroke({color:c,width:2,alpha:x*.3}),f(m,T,A,i*5+u,t.move==="gems"?[c,8122076,16036583][u%3]:u%3?c:l,x)}return!0}if(t.move==="seeds"||t.move==="drain"){for(let u=0;u<(a?4:7);u++){const g=Zi((i-u*.045)/.5),v=t.move==="drain"?200*(1-g):20+g*210,p=Math.sin(g*Math.PI)*(u%2?1:-1)*(20+u*6),[m,T]=n(v,p),A=5+u%3*2;s.circle(m,T,A*1.5).fill({color:c,alpha:r*.12}).circle(m,T,A).fill({color:u%2?c:l,alpha:r*(1-g*.5)}),s.moveTo(...n(v-16,p)).lineTo(m,T).stroke({color:l,width:1.5,alpha:r*.65})}return!0}if(t.move==="slash"||t.move==="kick"||t.move==="punch"){const u=t.move==="slash"?2:t.move==="punch"?3:1;for(let g=0;g<u;g++){const v=Zi((i-g*.07)/.4),p=30+v*165,m=(t.move==="kick"?72:44)*(1-v*.3),T=(g-(u-1)/2)*25,A=g%2?-1:1,x=n(p-55,T-A*m),M=n(p+30,T),y=n(p-42,T+A*m),w=n(p+7,T);if(s.moveTo(...x).quadraticCurveTo(...M,...y).quadraticCurveTo(...w,...x).fill({color:c,alpha:r*(1-v*.7)}).stroke({color:l,width:2,alpha:r}),t.move==="punch"){const[_,E]=n(p,T);for(let C=0;C<4;C++){const P=C/4*Ls+i*6;s.moveTo(_+Math.cos(P)*14,E+Math.sin(P)*14).lineTo(_+Math.cos(P)*30,E+Math.sin(P)*30).stroke({color:l,width:1.6,alpha:r*(1-v)})}}}return!0}if(t.move==="dive"){for(let u=0;u<5;u++){const g=u%2?-1:1,v=g*(16+u*8),p=25+h*80,m=n(p-60,v*.7),T=n(p+145,v*.25),A=n(p+45,v*2.1),x=n(p+37,v*1.4);e.moveTo(...m).quadraticCurveTo(...A,...T).quadraticCurveTo(...x,...m).fill({color:u%2?c:l,alpha:r*(.5-u*.045)})}for(let u=0;u<7;u++){const g=(h+u*.137)%1,v=15+g*210,p=Math.sin(u*17.3)*(15+g*55);s.moveTo(...n(v-30,p)).lineTo(...n(v,p)).stroke({color:u%2?c:l,width:1.7,alpha:r*(1-g)*.75})}return!0}if(t.move==="vortex"||t.move==="gyro"){const u=t.move==="gyro"?115:220,g=t.move==="gyro"?6:9;for(let v=0;v<g;v++){const p=(h+v/g)%1,m=20+p*u,T=(t.move==="gyro"?43:19)+p*29,A=i*13+v*.7,x=[];for(let M=0;M<=16;M++){const y=M/16,w=A+y*Math.PI*1.4;x.push(...n(m+Math.cos(w)*T*.36,Math.sin(w)*T))}s.poly(x,!1).stroke({color:v%3?c:l,width:t.kind==="fire"?5.5:2.5,alpha:r*(1-p*.7)*.8})}return!0}if(t.move==="firestar"||t.move==="moon"){const[u,g]=n(25+h*180,0),v=20+h*(t.move==="moon"?19:30);if(t.move==="firestar"){const p=[];for(let m=0;m<10;m++){const T=-Math.PI/2+m*Math.PI/5,A=m%2?v*.28:v;p.push(u+Math.cos(T)*A,g+Math.sin(T)*A)}s.poly(p).fill({color:c,alpha:r}).stroke({color:16770204,width:3,alpha:r})}else{s.circle(u,g,v*1.25).fill({color:c,alpha:r*.12}).circle(u,g,v).fill({color:c,alpha:r*.9}).circle(u-v*.15,g-v*.2,v*.7).fill({color:l,alpha:r*.9});for(let p=0;p<5;p++){const m=p/5*Ls+i*3;f(u+Math.cos(m)*v*1.4,g+Math.sin(m)*v*1.4,5,m,l,r*.7)}}return!0}if(t.move==="quake"){const{x:u,y:g}=o;for(let v=0;v<d;v++){const p=v/d*Ls,m=76+h*138,T=u+Math.cos(p)*m,A=g+Math.sin(p)*m*.25,x=Math.sin(v*16.7),M=r*(1-h*.8),y=Math.sin(h*Math.PI)*(35+v%3*17),w=(10+v%3*5)*Math.min(1,i*18);e.moveTo(u+Math.cos(p)*32,g+Math.sin(p)*9).lineTo(T+x*11,A-5).lineTo(T,A).lineTo(T+Math.cos(p)*31,A+Math.sin(p)*10).stroke({color:2504011,width:5,alpha:M*.8}).stroke({color:c,width:1.5,alpha:M}),e.ellipse(T,A,w*.9,w*.2).fill({color:465713,alpha:M*.22});const _=A-y,E=[T-w,_-w*.3,T-w*.35,_-w,T+w*.65,_-w*.66,T+w,_+w*.45,T-w*.3,_+w*.8];s.poly(E).fill({color:7110030,alpha:M}).stroke({color:2504267,width:1.5,alpha:M}),s.poly([T-w*.35,_-w,T+w*.65,_-w*.66,T+w*.3,_,T-w,_-w*.3]).fill({color:11585494,alpha:M}),s.moveTo(T-w*.35,_-w).lineTo(T+w*.65,_-w*.66).lineTo(T+w,_+w*.45).stroke({color:l,width:1.2,alpha:M*.85}),e.moveTo(T,A-3).lineTo(T-x*5,_+w*1.7).stroke({color:c,width:1.8,alpha:M*.45})}return!0}if(t.move==="thunder"){const[u,g]=n(80,0),v=Math.floor(i*18),p=[];for(let m=0;m<9;m++){const T=m/8;p.push(u+Math.sin(m*7.2+v)*(m===8?0:20),g-150+T*180)}s.poly(p,!1).stroke({color:c,width:15,alpha:r*.13}).poly(p,!1).stroke({color:c,width:7,alpha:r}).poly(p,!1).stroke({color:l,width:2.2,alpha:r});for(let m=0;m<6;m++){const T=m/6*Ls;s.moveTo(u,g+28).lineTo(u+Math.cos(T)*(30+h*45),g+28+Math.sin(T)*(15+h*25)).stroke({color:l,width:2,alpha:r*(1-h*.6)})}return!0}if(["origin","voice","darkpulse"].includes(t.move)){for(let u=0;u<(t.move==="origin"?3:4);u++){const g=Zi((i-u*.07)/.5),[v,p]=n(15+g*180,(u%2?1:-1)*(t.move==="origin"?26:0)),m=12+g*42;s.ellipse(v,p,m*.65,m).stroke({color:c,width:t.move==="origin"?9:5,alpha:r*(1-g*.7)}).ellipse(v,p,m*.65,m).stroke({color:l,width:1.5,alpha:r*(1-g*.6)}),t.move==="voice"&&f(v,p,6,i*2+u,l,r*(1-g))}return!0}return!1}const ii=Math.PI*2;class id{constructor(e,t,n=!1){this.hero=e,this.profile=t,this.low=n}hero;profile;low;back=new Kt;front=new Kt;charge=0;blast=0;fade=1;clock=0;history=[];time=0;releasedAt=-1;launch=[];point=new Is;target=new Is;begin(){this.history=[],this.time=0,this.clock=0,this.releasedAt=-1,this.launch=[],this.charge=0,this.blast=0,this.fade=1}release(e){this.releasedAt=e,this.launch=this.emitters(),this.history=[{time:e,points:this.launch}]}emitters(){return this.hero.powerEmitters(this.profile).map(e=>{this.hero.parent.toLocal(this.hero.toGlobal(new Is(e.x,e.y)),void 0,this.point),this.hero.parent.toLocal(this.hero.toGlobal(new Is(e.x+e.dx*20,e.y+e.dy*20)),void 0,this.target);const t=this.target.x-this.point.x,n=this.target.y-this.point.y,i=Math.hypot(t,n)||1;return{x:this.point.x,y:this.point.y,dx:t/i,dy:n/i,foreshortening:e.foreshortening}})}update(e){this.back.clear();const t=this.front.clear();if(this.fade<=0||!this.charge&&!this.blast)return;this.time=this.clock;let n=this.emitters();if(this.blast>0&&this.releasedAt<0&&(this.releasedAt=this.time,this.launch=n.map(i=>({...i}))),this.blast>0&&this.time>(this.history.at(-1)?.time??-1))for(this.history.push({time:this.time,points:n});this.history.length>2&&this.history[1].time<this.time-.32;)this.history.shift();["shuriken","orb","stars","pulse","crystals","gems","seeds","moon","firestar"].includes(this.profile.move)&&this.blast>0&&(n=this.launch);for(let i=0;i<n.length;i++)this.draw(n[i],i,t)}star(e,t,n,i,r,a,o=0){const c=[];for(let l=0;l<8;l++){const h=o+l*Math.PI/4,d=l%2?i*.19:i;c.push(t+Math.cos(h)*d,n+Math.sin(h)*d)}e.poly(c).fill({color:r,alpha:a})}draw(e,t,n){const i=this.profile,r=this.time,a=i.color,o=i.light,c=this.charge,l=this.fade,{x:h,y:d,dx:f,dy:u}=e,g=-u,v=f,p=(x,M)=>{if(["stream","beam"].includes(i.move)&&this.history.length&&this.blast>0){const y=this.time-x/900;let w=this.history[0],_=w;for(const Y of this.history){if(_=Y,Y.time>=y)break;w=Y}const E=w===_?0:Math.max(0,Math.min(1,(y-w.time)/(_.time-w.time))),C=w.points[t]??e,P=_.points[t]??e,D=C.x+(P.x-C.x)*E,F=C.y+(P.y-C.y)*E,I=C.dx+(P.dx-C.dx)*E,z=C.dy+(P.dy-C.dy)*E;return[D+I*x-z*M,F+z*x+I*M]}return[h+f*x+g*M,d+u*x+v*M]};if(c>0)if(i.move==="orb")this.orb(n,h,d,5+c*16,c,r);else if(i.move==="shuriken")this.shuriken(n,h,d,9+c*27,r*13,c);else if(i.kind==="electric"){this.star(n,h,d,3+c*8,o,c,r*2);for(let x=0;x<3;x++){const M=x/3*ii+r,y=[h,d,h+Math.cos(M)*14,d+Math.sin(M)*14,h+Math.cos(M+.4)*(25+c*20),d+Math.sin(M+.4)*(25+c*20)];n.poly(y,!1).stroke({color:a,width:2,alpha:c*.85})}}else{const x=this.low?5:9;for(let M=0;M<x;M++){const y=(r*1.7+M/x)%1,w=M/x*ii,_=12+(1-y)*52*c,E=h+Math.cos(w)*_,C=d+Math.sin(w)*_*.65;n.moveTo(E,C).lineTo(h+Math.cos(w)*(_+7),d+Math.sin(w)*(_+7)*.65).stroke({color:a,width:1.2,alpha:y*c*.65})}this.star(n,h,d,3+c*7,o,c*.85,r*.8)}if(!this.blast)return;const m=Math.max(0,this.time-this.releasedAt),T=Math.min(1,this.blast*1.35),A=l*T;if(m<.32){const x=Math.min(1,m/.32),M=A*(1-x),y=12+x*77,w=i.kind==="electric"?.95:i.kind==="psychic"||i.kind==="dark"?1.25:.72,_=p(y,-y*w),E=p(y*1.38,0),C=p(y,y*w);for(const[P,D,F]of[[7,1121851,.7],[4,a,1],[1.3,o,.9]])n.moveTo(..._).quadraticCurveTo(...E,...C).stroke({color:D,width:P,alpha:M*F});for(let P=0;P<(this.low?3:5);P++){const D=P-2,F=18+x*(92+Math.abs(D)*22),I=D*(12+x*11),z=p(F+30,I*1.2),Y=p(F,I),B=p(F-13,I+Math.sign(D||1)*3);this.back.poly([...Y,...z,...B]).fill({color:P%2?a:o,alpha:M*.62})}}if(!(i.move==="quake"&&t>0)&&!nd(n,this.back,i,p,m,A,this.low,{x:this.hero.x,y:this.hero.y+154})){if(i.move==="shuriken"){const x=Math.min(1,m/.44),M=x*260,[y,w]=p(M,-Math.sin(x*Math.PI)*18);for(let _=4;_>0;_--){const[E,C]=p(Math.max(0,M-_*15),-Math.sin(x*Math.PI)*18);this.shuriken(this.back,E,C,(37+x*12)*(1-_*.08),m*24-_*.3,A*(.12-_*.018))}this.shuriken(n,y,w,37+x*12,m*24,A);return}if(i.move==="orb"){const x=Math.min(1,m/.55),M=x*220,[y,w]=p(M,-Math.sin(x*Math.PI)*20);for(let _=3;_>0;_--){const[E,C]=p(Math.max(0,M-_*13),-Math.sin(x*Math.PI)*20);this.orb(this.back,E,C,19-_*2,A*(.16-_*.03),r-_*.1)}this.orb(n,y,w,26+x*10,A,r);return}if(i.move==="stars"){for(let x=0;x<6;x++){const M=m-x*.045;if(M<0)continue;const y=Math.min(1,M/.44),w=(x-1.5)*.17,_=f*Math.cos(w)-u*Math.sin(w),E=u*Math.cos(w)+f*Math.sin(w),C=h+_*(20+y*185),P=d+E*(20+y*185)-Math.sin(y*Math.PI)*15,D=10+y*4,F=[];for(let I=0;I<10;I++){const z=r*4+I*Math.PI/5,Y=I%2?D*.43:D;F.push(C+Math.cos(z)*Y,P+Math.sin(z)*Y)}n.moveTo(C-_*26,P-E*26).lineTo(C,P).stroke({color:a,width:2,alpha:A*.4}).poly(F).fill({color:a,alpha:A}).stroke({color:o,width:1.2,alpha:A})}return}if(i.move==="wave"){n.circle(h,d,11).fill({color:a,alpha:A*.4}).circle(h,d,4).fill({color:o,alpha:A});for(let x=0;x<3;x++){const M=Math.min(1,Math.max(0,(m-x*.07)*2.3)),[y,w]=p(12+M*170,0),_=12+M*37;n.moveTo(y+g*_-f*8,w+v*_-u*8).quadraticCurveTo(y+f*_*.55,w+u*_*.55,y-g*_-f*8,w-v*_-u*8).stroke({color:3743836,width:10,alpha:A*(1-M)*.85}).moveTo(y+g*_-f*8,w+v*_-u*8).quadraticCurveTo(y+f*_*.55,w+u*_*.55,y-g*_-f*8,w-v*_-u*8).stroke({color:a,width:6,alpha:A*(1-M)}).moveTo(y+g*_-f*8,w+v*_-u*8).quadraticCurveTo(y+f*_*.55,w+u*_*.55,y-g*_-f*8,w-v*_-u*8).stroke({color:o,width:1.5,alpha:A*(1-M)})}return}if(i.move==="pulse"){const x=Math.min(1,m/.36),[M,y]=p(18+x*100,0),w=9+x*34;for(let _=0;_<2;_++){const E=Math.max(3,w-_*7);n.ellipse(M-f*_*7,y-u*_*7,E*.65,E).stroke({color:1537471,width:6,alpha:A*(1-_*.28)}).ellipse(M-f*_*7,y-u*_*7,E*.65,E).stroke({color:o,width:2.5,alpha:A})}return}if(i.move==="sphere"){const x=42+T*45;this.back.ellipse(h,d,x,x*1.12).fill({color:a,alpha:A*.1}).stroke({color:a,width:6,alpha:A*.25}).ellipse(h,d,x,x*1.12).stroke({color:o,width:1.5,alpha:A*.8});for(let M=0;M<3;M++){const y=r*2+M*ii/3;this.star(n,h+Math.cos(y)*x,d+Math.sin(y)*x*1.12,5,o,A,y)}return}if(i.move==="beam"){const x=300*Math.min(T,m/.15)*(.35+.65*(e.foreshortening??1));for(let M=0;M<3;M++){const y=[],w=[23,13,4][M];for(let _=0;_<2;_++)for(let E=0;E<=18;E++){const C=_?1-E/18:E/18;y.push(...p(C*x,(_?-1:1)*w*(.35+C*.8)*Math.min(1,(1-C)*16)))}n.poly(y).fill({color:M===0?a:M===1?o:16777215,alpha:A*(M===0?.65:.9)})}for(let M=0;M<2;M++){const y=[];for(let w=0;w<=24;w++){const _=w/24;y.push(...p(_*x,Math.sin(_*24-r*25+M*Math.PI)*(4+_*13)))}n.poly(y,!1).stroke({color:o,width:1.5,alpha:A*.75})}return}if(i.kind==="fire"||i.kind==="dragon"){const x=(i.kind==="fire"?240:255)*Math.min(T,m/.18)*(.35+.65*(e.foreshortening??1)),M=r*19;for(let y=0;y<3;y++){const w=[],_=[30,19,6][y],E=x*(1-y*.13);for(let C=0;C<2;C++)for(let P=0;P<=26;P++){const D=C?1-P/26:P/26,F=2*(1-D),I=(.12+.88*D)*Math.min(1,(1-D)*13),z=1+.21*Math.sin(D*27-M+C*2)+.11*Math.sin(D*43-M*1.4),Y=Math.sin(D*8-r*7)*D*6;w.push(...p(D*E,Y+(C?-1:1)*(F+_*I*z)))}n.poly(w).fill({color:y===0?a:y===1?i.kind==="fire"?16763987:o:16775641,alpha:A}),y===0&&n.poly(w).stroke({color:i.kind==="fire"?12334153:3755428,width:1.2,alpha:A*.65})}for(let y=0;y<(this.low?5:10);y++){const w=(m*2.2+y*.103)%1,_=Math.sin(y*4.7),[E,C]=p(x*(.4+w*.75),_*(16+w*32)),P=(1-w)*7+2;n.moveTo(E-f*P*2,C-u*P*2).quadraticCurveTo(E+g*P,C+v*P,E+f*P*2,C+u*P*2).quadraticCurveTo(E-g*P*.5,C-v*P*.5,E-f*P*2,C-u*P*2).fill({color:y%3?a:o,alpha:A*(1-w)})}}else if(i.kind==="water"||i.kind==="ice"){const x=240*Math.min(T,m/.18)*(.35+.65*(e.foreshortening??1)),M=i.species==="blastoise"?12:16;for(let y=0;y<3;y++){const w=[],_=M*(1-y*.31);for(let E=0;E<2;E++)for(let C=0;C<=20;C++){const P=E?1-C/20:C/20,D=Math.min(1,(1-P)*12),F=Math.sin(P*22-r*29+t)*2*P;w.push(...p(P*x,F+(E?-1:1)*_*(.55+P*.8)*D))}n.poly(w).fill({color:y===0?1471951:y===1?a:o,alpha:A*(y===2?.88:1)})}for(let y=0;y<3;y++){const w=(m*2.8+y/3)%1,_=.1+w*.6,E=Math.min(.95,_+.21),C=[];for(let P=0;P<=9;P++){const D=_+(E-_)*P/9;C.push(...p(D*x,Math.sin(D*18-r*25+y)*M*.38))}n.poly(C,!1).stroke({color:o,width:1.5,alpha:A*Math.sin(w*Math.PI)*.85})}for(let y=0;y<(this.low?5:9);y++){const w=(m*2.6+y*.17)%1,[_,E]=p(x*.88+w*34,Math.sin(y*13)*(6+w*28));n.moveTo(_-f*6,E-u*6).lineTo(_+g*2,E+v*2).lineTo(_+f*9,E+u*9).closePath().fill({color:o,alpha:A*(1-w)})}}else if(i.kind==="electric"){const x=.8+.2*Math.sin(m*37)**2,M=Math.floor(m*18),y=this.low?3:5;for(let w=0;w<y;w++){const _=(t?-.4:.5)+w/y*ii,E=(100+w%3*29)*T,C=[h,d];for(let F=1;F<=6;F++){const I=F/6,z=F===6?0:Math.sin(F*12.4+w*6.3+M*4.1)*10;C.push(h+Math.cos(_)*E*I-Math.sin(_)*z,d+Math.sin(_)*E*I+Math.cos(_)*z)}n.poly(C,!1).stroke({color:a,width:7,alpha:A*.18*x}).poly(C,!1).stroke({color:a,width:3.6,alpha:A*x}).poly(C,!1).stroke({color:o,width:1.1,alpha:A*x});const P=C[6],D=C[7];n.moveTo(P,D).lineTo(P+Math.cos(_+.8)*18,D+Math.sin(_+.8)*18).lineTo(P+Math.cos(_+.3)*34,D+Math.sin(_+.3)*34).stroke({color:o,width:1,alpha:A})}}else if(i.move==="blade"||i.move==="petals"){const x=this.low?5:9;for(let M=0;M<x;M++){const y=(m*1.7+M/x)%1,w=Math.sin(M*9.1),[_,E]=p(22+y*185,w*(35+y*45)),C=(6+M%3*2)*(1-y*.35),P=r*8+M,D=Math.cos(P)*C,F=Math.sin(P)*C;n.moveTo(_-D,E-F).quadraticCurveTo(_-F,E+D,_+D*2,E+F*2).quadraticCurveTo(_+F*.4,E-D*.4,_-D,E-F).fill({color:M%2?a:o,alpha:A*(1-y*.7)}),n.moveTo(_-D,E-F).lineTo(_+D*1.6,E+F*1.6).stroke({color:i.move==="petals"?16766445:i.kind==="leaf"?2390613:15859711,width:.8,alpha:A})}}else{const x=this.low?5:8;for(let M=0;M<x;M++){const y=Math.min(1,Math.max(0,m*2.3-M*.045)),w=M/x*ii,_=22+y*115,E=.28+M%2*.12;n.moveTo(h+Math.cos(w-E)*_,d+Math.sin(w-E)*_*.75).quadraticCurveTo(h+Math.cos(w)*(_+12),d+Math.sin(w)*(_+12)*.75,h+Math.cos(w+E)*_,d+Math.sin(w+E)*_*.75).stroke({color:M%2?a:o,width:5*(1-y)+1,alpha:A*(1-y)})}m<.18&&this.star(n,h,d,30*(1-m/.18),o,A*(1-m/.18),.2)}}}orb(e,t,n,i,r,a){e.circle(t,n,i*1.2).fill({color:7353539,alpha:r*.17}).circle(t,n,i).fill({color:2625861,alpha:r}).circle(t-i*.15,n-i*.15,i*.7).fill({color:6630045,alpha:r}),e.moveTo(t-i*.76,n-i*.22).bezierCurveTo(t-i*.65,n-i*.88,t+i*.23,n-i*.96,t+i*.53,n-i*.47).bezierCurveTo(t-i*.07,n-i*.74,t-i*.48,n-i*.52,t-i*.76,n-i*.22).fill({color:14002431,alpha:r*.75}),e.moveTo(t+i*.75,n-i*.1).quadraticCurveTo(t+i*.93,n+i*.54,t-i*.1,n+i*.81).quadraticCurveTo(t+i*.48,n+i*.37,t+i*.75,n-i*.1).fill({color:9262804,alpha:r*.85});for(let o=0;o<3;o++){const c=a*4+o*ii/3;e.moveTo(t+Math.cos(c)*i,n+Math.sin(c)*i).quadraticCurveTo(t+Math.cos(c+.6)*i*.2,n+Math.sin(c+.6)*i*.2,t+Math.cos(c+1.6)*i*.9,n+Math.sin(c+1.6)*i*.9).stroke({color:o%2?14920191:11892735,width:2,alpha:r*.85})}}shuriken(e,t,n,i,r,a){const o=[];for(let c=0;c<12;c++){const l=r+c*ii/12,h=c%3===0?i:c%3===1?i*.27:i*.36;o.push(t+Math.cos(l)*h,n+Math.sin(l)*h*.72)}e.poly(o).fill({color:2520274,alpha:a*.9}).stroke({color:13041663,width:1.7,alpha:a});for(let c=0;c<4;c++){const l=r+c*Math.PI/2,h=[t+Math.cos(l)*i,n+Math.sin(l)*i*.72],d=[t+Math.cos(l+.52)*i*.27,n+Math.sin(l+.52)*i*.27*.72];e.poly([t,n,...h,...d]).fill({color:6610687,alpha:a*.86})}for(let c=0;c<4;c++){const l=r+c*Math.PI/2;e.moveTo(t,n).lineTo(t+Math.cos(l)*i*.82,n+Math.sin(l)*i*.58).stroke({color:15400959,width:1.6,alpha:a*.9})}}destroy(){this.back.destroy(),this.front.destroy()}}const sd=`ball-fx.png
size: 256,256
filter: Linear,Linear
pma: false
beam
  bounds: 0,0,240,32
arc
  bounds: 0,40,128,128
star
  bounds: 136,40,64,64
core
  bounds: 136,112,96,96
`;function rd(s=!1){const e=[{name:"root"}],t=[],n={},i={},r={},a={},o={},c=(u,g,v,p,m=0,T=0,A=0,x="b6f5ff")=>{e.push({name:u,parent:"root",x:m,y:T,rotation:A}),t.push({name:u,bone:u,attachment:u,color:x+"00",blend:"additive"}),n[u]={[u]:{path:g,width:v,height:p}}};for(let u=0;u<(s?4:7);u++){const g="stream"+u,v=u%2?1:-1;c(g,"beam",90+u*16,2.5+u%3,-70-u*17,v*(8+u*3),v*3,u%3?"8cddff":"f6ffff");const p=v*(5+u*2);i[g]={translate:[{x:0,y:-p},{time:.3,x:-16,y:p},{time:.6,x:0,y:-p}],scale:[{x:.75,y:.65},{time:.3,x:1.15,y:1},{time:.6,x:.75,y:.65}]},r[g]={alpha:[{value:.4},{time:.3,value:.8-u*.04},{time:.6,value:.4}]}}for(let u=0;u<2;u++){const g="orbit"+u;c(g,"arc",100+u*24,100+u*24,-8,0,u*180,"bcefff"),i[g]={rotate:[{value:0},{time:.6,value:360}],scale:[{x:1,y:.42},{time:.3,x:1.15,y:.46},{time:.6,x:1,y:.42}]},r[g]={alpha:[{value:.34}]}}c("nose","core",70,70,8,0,0,"dfffff"),r.nose={alpha:[{value:.35},{time:.3,value:.65},{time:.6,value:.35}]};for(let u=0;u<(s?8:14);u++){const g="ray"+u,v=u/(s?8:14)*Math.PI*2,p=Math.cos(v),m=Math.sin(v);c(g,"beam",95+u%4*19,3+u%3,0,0,v*180/Math.PI,u%3?"a4eaff":"ffffff"),a[g]={translate:[{x:p*5,y:m*5},{time:.09,x:p*67,y:m*67},{time:.4,x:p*158,y:m*158}],scale:[{x:.06,y:.1},{time:.08,x:1,y:1},{time:.4,x:.3,y:.05}]},o[g]={alpha:[{value:0},{time:.035,value:.95},{time:.18,value:.6},{time:.4,value:0},{time:1.2,value:0}]}}for(let u=0;u<5;u++){const g="plume"+u,v=u-2,p=.04+Math.abs(v)*.035;c(g,"beam",220-Math.abs(v)*22,12-Math.abs(v)*2,v*8,90,90+v*7,"d3f6ff"),a[g]={translate:[{x:0,y:-80},{time:p,x:0,y:-80},{time:p+.25,x:v*9,y:45},{time:.85,x:v*17,y:110}],scale:[{x:.05,y:.1},{time:p,x:.05,y:.1},{time:p+.16,x:1,y:1},{time:.75,x:.35,y:.03}]},o[g]={alpha:[{value:0},{time:p,value:0},{time:p+.08,value:.62},{time:.55,value:.3},{time:.85,value:0},{time:1.2,value:0}]}}for(let u=0;u<(s?4:9);u++){const g="spark"+u,v=u%2?1:-1,p=.14+u*.045;c(g,"star",13+u%3*4,22+u%3*5,0,0,u*33,u%2?"b2edff":"ffffff"),a[g]={translate:[{x:v*8,y:10},{time:p,x:v*8,y:10},{time:p+.4,x:v*(50+u*8),y:70+u*17},{time:1.2,x:v*(65+u*8),y:95+u*17}],scale:[{x:0,y:0},{time:p,x:0,y:0},{time:p+.1,x:1,y:1},{time:p+.55,x:0,y:0}],rotate:[{value:0},{time:1.2,value:150}]},o[g]={alpha:[{value:0},{time:p,value:0},{time:p+.1,value:.8},{time:p+.55,value:0},{time:1.2,value:0}]}}c("openingCore","core",118,118,0,4,0,"efffff"),a.openingCore={scale:[{x:.1,y:.1},{time:.08,x:1.4,y:.8},{time:.4,x:.5,y:.3},{time:.65,x:0,y:0}]},o.openingCore={alpha:[{value:0},{time:.035,value:.85},{time:.3,value:.25},{time:.65,value:0},{time:1.2,value:0}]};const l={},h={},d={},f={};for(let u=0;u<(s?3:5);u++){const g="halo"+u,v=u%2?1:-1;c(g,"arc",280+u%3*55,360+u%2*65,0,8-u*14,u*58,"c3f6ff"),l[g]={rotate:[{value:-v*35},{time:.65,value:v*95},{time:1.4,value:v*175}],scale:[{x:.2,y:.35},{time:.22,x:.85,y:.8},{time:.62,x:1.12,y:1.08},{time:1.4,x:1.4,y:1.35}],translate:[{x:v*7,y:-42},{time:.65,x:v*18,y:32},{time:1.4,x:v*38,y:94}]},h[g]={alpha:[{value:0},{time:.1,value:.85},{time:.5,value:.65},{time:1.15,value:0},{time:1.4,value:0}]}}for(let u=0;u<(s?6:12);u++){const g="formSpark"+u,v=u*Math.PI*2/(s?6:12);c(g,u%3?"beam":"star",u%3?90:20,u%3?6:36,Math.cos(v)*90,Math.sin(v)*120,v*180/Math.PI,"e3fdff"),l[g]={translate:[{x:0,y:0},{time:.6,x:Math.cos(v)*100,y:Math.sin(v)*130},{time:1.4,x:Math.cos(v)*155,y:Math.sin(v)*170}],scale:[{x:0,y:0},{time:.16+u*.02,x:1,y:1},{time:.8+u*.02,x:.3,y:.1},{time:1.4,x:0,y:0}]},h[g]={alpha:[{value:0},{time:.12+u*.02,value:.9},{time:.65+u*.02,value:.3},{time:1.4,value:0}]}}for(let u=0;u<5;u++){const g="conduit"+u,v=u-2;c(g,"beam",240,6+Math.abs(v)*2,120,v*3,v*1.6,u%2?"92e5ff":"ecffff"),d[g]={scale:[{x:.3,y:.1},{time:.14,x:1,y:1.6},{time:.55,x:1,y:1},{time:1.2,x:1,y:0}],translate:[{x:0,y:v*2},{time:.3,x:0,y:-v*4},{time:.6,x:0,y:v*3},{time:1.2,x:0,y:0}]},f[g]={alpha:[{value:0},{time:.08,value:.8},{time:.65,value:.65},{time:1.2,value:0}]}}return{skeleton:{spine:"4.2.22"},bones:e,slots:t,skins:[{name:"default",attachments:n}],animations:{flight:{bones:i,slots:r},release:{bones:a,slots:o},form:{bones:l,slots:h},conduit:{bones:d,slots:f}}}}const Wr=new Map;let Ds;function ji(s=!1){if(!Ds){const t=document.createElement("canvas");t.width=t.height=256;const n=t.getContext("2d");n.fillStyle="#fff",n.beginPath(),n.moveTo(0,16),n.bezierCurveTo(55,7,150,5,240,16),n.bezierCurveTo(150,27,55,25,0,16),n.fill(),n.beginPath();for(let r=0;r<=32;r++){const a=-1.35+r/32*2.7,o=64+Math.cos(a)*60,c=104+Math.sin(a)*60;r?n.lineTo(o,c):n.moveTo(o,c)}for(let r=32;r>=0;r--){const a=-1.35+r/32*2.7,o=60-Math.sin(r/32*Math.PI)*16;n.lineTo(64+Math.cos(a)*o,104+Math.sin(a)*o)}n.closePath(),n.fill(),n.beginPath(),[[168,41],[173,66],[198,72],[173,77],[168,103],[163,77],[137,72],[163,66]].forEach(([r,a],o)=>o?n.lineTo(r,a):n.moveTo(r,a)),n.closePath(),n.fill();const i=n.createRadialGradient(184,160,0,184,160,46);i.addColorStop(0,"#ffffffff"),i.addColorStop(.15,"#ffffffdd"),i.addColorStop(.4,"#ffffff55"),i.addColorStop(1,"#ffffff00"),n.fillStyle=i,n.fillRect(136,112,96,96),Ds=new Dl(sd),Ds.pages[0].setTexture(Ul.from(Dr.from(t).source))}Wr.has(s)||Wr.set(s,new Nl(new Fl(Ds)).readSkeletonData(rd(s)));const e=new kl({skeletonData:Wr.get(s),autoUpdate:!1});return e.eventMode="none",e.visible=!1,e}function ad(s,e,t,n){const r=Math.cos(n),a=Math.sin(n),o=[],c=(l,h)=>{const d=l*Math.PI/2,f=h*Math.PI*2,u=69*Math.sin(d)*Math.sin(f),g=-69*Math.cos(d),v=69*Math.sin(d)*Math.cos(f);return{p:[u,g*r-(v+69)*a,g*a+(v+69)*r-69],n:[u/69,g/69*r-v/69*a,g/69*a+v/69*r]}};for(let l=0;l<18;l++)for(let h=0;h<48;h++){const d=[c(l/18,h/48),c((l+1)/18,h/48),c((l+1)/18,(h+1)/48),c(l/18,(h+1)/48)],f=d.reduce((u,g)=>u.map((v,p)=>v+g.n[p]/4),[0,0,0]);o.push({p:d.map(u=>u.p),z:d.reduce((u,g)=>u+g.p[2]/4,0),n:f,inside:f[2]<0})}o.sort((l,h)=>l.z-h.z);for(const l of o){const h=l.n.map(p=>l.inside?-p:p),d=Math.max(0,h[0]*-.38+h[1]*-.5+h[2]*.78),f=.5+d*.5,u=Math.pow(Math.max(0,h[0]*-.24+h[1]*-.34+h[2]*.91),38)*.4,g=l.inside?[216,239,245]:[226,27,65],v=g.map(p=>Math.round(Math.min(255,p*f+255*u)));s.beginPath(),l.p.forEach(([p,m],T)=>T?s.lineTo(e+p,t+m):s.moveTo(e+p,t+m)),s.closePath(),s.fillStyle=`rgb(${v.join(",")})`,s.fill(),s.strokeStyle=s.fillStyle,s.lineWidth=.65,s.stroke()}s.beginPath();for(let l=0;l<=96;l++){const{p:[h,d]}=c(1,l/96);l?s.lineTo(e+h,t+d):s.moveTo(e+h,t+d)}s.strokeStyle="#273848",s.lineWidth=4,s.stroke()}let Xr;function cc(){if(!Xr){const n=document.createElement("canvas");n.width=1280,n.height=2080;const i=n.getContext("2d");let r="";for(let h=0;h<48;h++){const d=i.createImageData(160,160),f=h/48*Math.PI*2,u=Math.cos(f),g=Math.sin(f),v=.28,p=Math.cos(v),m=Math.sin(v);for(let x=0;x<160;x++)for(let M=0;M<160;M++){const y=(M+.5-80)/69,w=(x+.5-160/2)/69,_=y*y+w*w;if(_>=1)continue;const E=Math.sqrt(1-_),C=w*u+E*g,P=E*u-w*g,D=y*p+P*m,F=P*p-y*m;let I=Math.abs(C)<.066?[17,28,46]:C<0?[226,27,65]:[227,239,250];const z=Math.hypot(D,C);F>.93&&z<.27&&(I=z>.205?[17,28,46]:z>.15?[174,197,217]:[246,252,255]);const Y=Math.max(0,y*-.38+w*-.5+E*.78),B=.46+.54*Y,W=Math.pow(Math.max(0,y*-.24+w*-.34+E*.91),42)*.46,V=Math.pow(1-E,4)*.15,K=(x*160+M)*4;for(let Z=0;Z<3;Z++)d.data[K+Z]=Math.min(255,I[Z]*B+255*W+V*[67,118,172][Z]);d.data[K+3]=Math.min(255,(1-Math.sqrt(_))*69*255)}const T=h%8*160,A=Math.floor(h/8)*160;i.putImageData(d,T,A),r+=`spin${h}
  bounds: ${T},${A},160,160
`}for(const[h,d]of["lower","upper","button","inner"].entries()){const f=h*160,u=960;if(i.save(),i.beginPath(),d==="inner"){i.translate(f,u),i.beginPath(),i.arc(80,80,68,Math.PI,Math.PI*2),i.closePath(),i.fillStyle="#e8faff",i.fill(),i.lineWidth=5,i.strokeStyle="#334658",i.stroke(),i.beginPath(),i.ellipse(80,66,49,10,0,0,Math.PI*2),i.strokeStyle="#a7d6e2",i.lineWidth=2,i.stroke(),i.restore(),r+=`${d}
  bounds: ${f},${u},160,160
`;continue}d==="button"?i.arc(f+160/2,u+160/2,18,0,Math.PI*2):i.rect(f,u+(d==="lower"?160/2:0),160,160/2),i.clip(),i.drawImage(n,0,0,160,160,f,u,160,160),i.restore(),r+=`${d}
  bounds: ${f},${u},160,160
`}[0,18,42,68,91,107,111,108,105,104].forEach((h,d)=>{const f=d%4*320,u=1120+Math.floor(d/4)*320;ad(i,f+160,u+160,h*Math.PI/180),r+=`lid${d}
  bounds: ${f},${u},320,320
`});const o=Dr.from(n),c=new Dl(`ball.png
size: ${n.width},${n.height}
filter: Linear,Linear
pma: false
${r}`);c.pages[0].setTexture(Ul.from(o.source));const l={closed:Object.fromEntries(Array.from({length:48},(h,d)=>[`spin${d}`,{width:160,height:160}]))};for(const h of["lower","upper","button"])l[h]={[h]:{width:160,height:160}};for(let h=0;h<10;h++)l.upper[`lid${h}`]={width:320,height:320};Xr=new Nl(new Fl(c)).readSkeletonData({skeleton:{spine:"4.2.22"},bones:[{name:"root"},{name:"orb",parent:"root"},{name:"lower",parent:"orb"},{name:"upper",parent:"orb"},{name:"button",parent:"orb"}],slots:[{name:"closed",bone:"orb",attachment:"spin0"},...["lower","upper","button"].map(h=>({name:h,bone:h}))],skins:[{name:"default",attachments:l}],animations:{spin:{slots:{closed:{attachment:Array.from({length:49},(h,d)=>({time:d*.015,name:`spin${d%48}`}))}}},ready:{slots:{closed:{attachment:[{name:"spin0"}]}}},closed:{slots:{closed:{attachment:[{name:"spin0"}]},...Object.fromEntries(["lower","upper","button"].map(h=>[h,{attachment:[{name:null}]}]))},bones:{upper:{rotate:[{value:0}],scale:[{x:1,y:1}]},button:{scale:[{x:1,y:1}]}}},open:{slots:{closed:{attachment:[{name:null}]},...Object.fromEntries(["lower","upper","button"].map(h=>[h,{attachment:h==="upper"?Array.from({length:10},(d,f)=>({time:f*.028,name:`lid${f}`})):[{name:h}]}]))},bones:{upper:{rotate:[{value:0}],scale:[{x:1,y:1}]},button:{scale:[{},{time:.09,x:0,y:0}]},lower:{rotate:[{},{time:.3,value:-6}]},orb:{scale:[{},{time:.1,x:1.025,y:.98},{time:.3,x:1,y:1}]}}}}})}const s=new kl({skeletonData:Xr,autoUpdate:!1});return s.state.setAnimation(0,"spin",!0),s.update(0),s}function lc(s,e,t,n){const i=435/Math.max(.12,s),r=Math.max(160,n*2-24);return Math.min(i,r/Math.max(.2,e+Math.abs(t)))}const So="186",od=0,hc=1,cd=2,cr=1,ld=2,hs=3,Qn=0,Nt=1,xn=2,Nn=0,fs=1,dc=2,uc=3,fc=4,hd=5,Ui=100,dd=101,ud=102,fd=103,pd=104,md=200,gd=201,_d=202,vd=203,Ol=204,Bl=205,xd=206,bd=207,Md=208,yd=209,Sd=210,wd=211,Ed=212,Td=213,Ad=214,Ia=0,La=1,Da=2,gs=3,Ua=4,Na=5,Fa=6,ka=7,zl=0,Rd=1,Cd=2,an=0,Gl=1,Hl=2,Vl=3,Wl=4,Xl=5,ql=6,Yl=7,pc="attached",Pd="detached",Kl=300,ui=301,Hi=302,qr=303,Yr=304,Ur=306,Vi=1e3,bn=1001,br=1002,vt=1003,$l=1004,ds=1005,bt=1006,lr=1007,Dn=1008,Ht=1009,Zl=1010,jl=1011,_s=1012,wo=1013,yn=1014,Zt=1015,Sn=1016,Eo=1017,To=1018,vs=1020,Jl=35902,Ql=35899,eh=1021,th=1022,Vt=1023,kn=1026,hi=1027,Ao=1028,Ro=1029,fi=1030,Co=1031,Po=1033,hr=33776,dr=33777,ur=33778,fr=33779,Oa=35840,Ba=35841,za=35842,Ga=35843,Ha=36196,Va=37492,Wa=37496,Xa=37488,qa=37489,Mr=37490,Ya=37491,Ka=37808,$a=37809,Za=37810,ja=37811,Ja=37812,Qa=37813,eo=37814,to=37815,no=37816,io=37817,so=37818,ro=37819,ao=37820,oo=37821,co=36492,lo=36494,ho=36495,uo=36283,fo=36284,yr=36285,po=36286,pr=2200,nh=2201,Id=2202,xs=2300,bs=2301,Kr=2302,mc=2303,Ni=2400,Fi=2401,Sr=2402,Io=2500,Ld=2501,Dd=0,ih=1,mo=2,Ud=3200,Ms=0,Nd=1,Zn="",ft="srgb",Ot="srgb-linear",wr="linear",et="srgb",$r=7680,Fd=519,kd=512,Od=513,Bd=514,Lo=515,zd=516,Gd=517,Do=518,Hd=519,sh=35044,gc="300 es",Mn=2e3,ys=2001;function Vd(s){for(let e=s.length-1;e>=0;--e)if(s[e]>=65535)return!0;return!1}function Wd(s){return ArrayBuffer.isView(s)&&!(s instanceof DataView)}function Ss(s){return document.createElementNS("http://www.w3.org/1999/xhtml",s)}function Xd(){const s=Ss("canvas");return s.style.display="block",s}const _c={};function Er(...s){const e="THREE."+s.shift();console.log(e,...s)}function rh(s){const e=s[0];if(typeof e=="string"&&e.startsWith("TSL:")){const t=s[1];t&&t.isStackTrace?s[0]+=" "+t.getLocation():s[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return s}function Te(...s){s=rh(s);const e="THREE."+s.shift();{const t=s[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...s)}}function Pe(...s){s=rh(s);const e="THREE."+s.shift();{const t=s[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...s)}}function Bi(...s){const e=s.join(" ");e in _c||(_c[e]=!0,Te(...s))}function qd(s,e,t){return new Promise(function(n,i){function r(){switch(s.clientWaitSync(e,s.SYNC_FLUSH_COMMANDS_BIT,0)){case s.WAIT_FAILED:i();break;case s.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}const Yd={[Ia]:La,[Da]:Fa,[Ua]:ka,[gs]:Na,[La]:Ia,[Fa]:Da,[ka]:Ua,[Na]:gs};class ti{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){const n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){const n=this._listeners;if(n===void 0)return;const i=n[e];if(i!==void 0){const r=i.indexOf(t);r!==-1&&i.splice(r,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const n=t[e.type];if(n!==void 0){e.target=this;const i=n.slice(0);for(let r=0,a=i.length;r<a;r++)i[r].call(this,e);e.target=null}}}const Rt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let vc=1234567;const ps=Math.PI/180,Wi=180/Math.PI;function on(){const s=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Rt[s&255]+Rt[s>>8&255]+Rt[s>>16&255]+Rt[s>>24&255]+"-"+Rt[e&255]+Rt[e>>8&255]+"-"+Rt[e>>16&15|64]+Rt[e>>24&255]+"-"+Rt[t&63|128]+Rt[t>>8&255]+"-"+Rt[t>>16&255]+Rt[t>>24&255]+Rt[n&255]+Rt[n>>8&255]+Rt[n>>16&255]+Rt[n>>24&255]).toLowerCase()}function Ve(s,e,t){return Math.max(e,Math.min(t,s))}function Uo(s,e){return(s%e+e)%e}function Kd(s,e,t,n,i){return n+(s-e)*(i-n)/(t-e)}function $d(s,e,t){return s!==e?(t-s)/(e-s):0}function ms(s,e,t){return(1-t)*s+t*e}function Zd(s,e,t,n){return ms(s,e,1-Math.exp(-t*n))}function jd(s,e=1){return e-Math.abs(Uo(s,e*2)-e)}function Jd(s,e,t){return s<=e?0:s>=t?1:(s=(s-e)/(t-e),s*s*(3-2*s))}function Qd(s,e,t){return s<=e?0:s>=t?1:(s=(s-e)/(t-e),s*s*s*(s*(s*6-15)+10))}function eu(s,e){return s+Math.floor(Math.random()*(e-s+1))}function tu(s,e){return s+Math.random()*(e-s)}function nu(s){return s*(.5-Math.random())}function iu(s){s!==void 0&&(vc=s);let e=vc+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function su(s){return s*ps}function ru(s){return s*Wi}function au(s){return s>0&&Number.isInteger(s)&&2**Math.round(Math.log2(s))===s}function ou(s){return Math.pow(2,Math.ceil(Math.log(s)/Math.LN2))}function cu(s){return Math.pow(2,Math.floor(Math.log(s)/Math.LN2))}function lu(s,e,t,n,i){const r=Math.cos,a=Math.sin,o=r(t/2),c=a(t/2),l=r((e+n)/2),h=a((e+n)/2),d=r((e-n)/2),f=a((e-n)/2),u=r((n-e)/2),g=a((n-e)/2);switch(i){case"XYX":s.set(o*h,c*d,c*f,o*l);break;case"YZY":s.set(c*f,o*h,c*d,o*l);break;case"ZXZ":s.set(c*d,c*f,o*h,o*l);break;case"XZX":s.set(o*h,c*g,c*u,o*l);break;case"YXY":s.set(c*u,o*h,c*g,o*l);break;case"ZYZ":s.set(c*g,c*u,o*h,o*l);break;default:Te("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+i)}}function sn(s,e){switch(e.constructor){case Float32Array:return s;case Uint32Array:return s/4294967295;case Uint16Array:return s/65535;case Uint8Array:case Uint8ClampedArray:return s/255;case Int32Array:return Math.max(s/2147483647,-1);case Int16Array:return Math.max(s/32767,-1);case Int8Array:return Math.max(s/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function tt(s,e){switch(e.constructor){case Float32Array:return s;case Uint32Array:return Math.round(s*4294967295);case Uint16Array:return Math.round(s*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(s*255);case Int32Array:return Math.round(s*2147483647);case Int16Array:return Math.round(s*32767);case Int8Array:return Math.round(s*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}const hu={DEG2RAD:ps,RAD2DEG:Wi,generateUUID:on,clamp:Ve,euclideanModulo:Uo,mapLinear:Kd,inverseLerp:$d,lerp:ms,damp:Zd,pingpong:jd,smoothstep:Jd,smootherstep:Qd,randInt:eu,randFloat:tu,randFloatSpread:nu,seededRandom:iu,degToRad:su,radToDeg:ru,isPowerOfTwo:au,ceilPowerOfTwo:ou,floorPowerOfTwo:cu,setQuaternionFromProperEuler:lu,normalize:tt,denormalize:sn},Xo=class Xo{constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6],this.y=i[1]*t+i[4]*n+i[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Ve(this.x,e.x,t.x),this.y=Ve(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=Ve(this.x,e,t),this.y=Ve(this.y,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Ve(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(Ve(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),i=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*n-a*i+e.x,this.y=r*i+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};Xo.prototype.isVector2=!0;let ke=Xo;class jt{constructor(e=0,t=0,n=0,i=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=i}static slerpFlat(e,t,n,i,r,a,o){let c=n[i+0],l=n[i+1],h=n[i+2],d=n[i+3],f=r[a+0],u=r[a+1],g=r[a+2],v=r[a+3];if(d!==v||c!==f||l!==u||h!==g){let p=c*f+l*u+h*g+d*v;p<0&&(f=-f,u=-u,g=-g,v=-v,p=-p);let m=1-o;if(p<.9995){const T=Math.acos(p),A=Math.sin(T);m=Math.sin(m*T)/A,o=Math.sin(o*T)/A,c=c*m+f*o,l=l*m+u*o,h=h*m+g*o,d=d*m+v*o}else{c=c*m+f*o,l=l*m+u*o,h=h*m+g*o,d=d*m+v*o;const T=1/Math.sqrt(c*c+l*l+h*h+d*d);c*=T,l*=T,h*=T,d*=T}}e[t]=c,e[t+1]=l,e[t+2]=h,e[t+3]=d}static multiplyQuaternionsFlat(e,t,n,i,r,a){const o=n[i],c=n[i+1],l=n[i+2],h=n[i+3],d=r[a],f=r[a+1],u=r[a+2],g=r[a+3];return e[t]=o*g+h*d+c*u-l*f,e[t+1]=c*g+h*f+l*d-o*u,e[t+2]=l*g+h*u+o*f-c*d,e[t+3]=h*g-o*d-c*f-l*u,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,i){return this._x=e,this._y=t,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,i=e._y,r=e._z,a=e._order,o=Math.cos,c=Math.sin,l=o(n/2),h=o(i/2),d=o(r/2),f=c(n/2),u=c(i/2),g=c(r/2);switch(a){case"XYZ":this._x=f*h*d+l*u*g,this._y=l*u*d-f*h*g,this._z=l*h*g+f*u*d,this._w=l*h*d-f*u*g;break;case"YXZ":this._x=f*h*d+l*u*g,this._y=l*u*d-f*h*g,this._z=l*h*g-f*u*d,this._w=l*h*d+f*u*g;break;case"ZXY":this._x=f*h*d-l*u*g,this._y=l*u*d+f*h*g,this._z=l*h*g+f*u*d,this._w=l*h*d-f*u*g;break;case"ZYX":this._x=f*h*d-l*u*g,this._y=l*u*d+f*h*g,this._z=l*h*g-f*u*d,this._w=l*h*d+f*u*g;break;case"YZX":this._x=f*h*d+l*u*g,this._y=l*u*d+f*h*g,this._z=l*h*g-f*u*d,this._w=l*h*d-f*u*g;break;case"XZY":this._x=f*h*d-l*u*g,this._y=l*u*d-f*h*g,this._z=l*h*g+f*u*d,this._w=l*h*d+f*u*g;break;default:Te("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,i=Math.sin(n);return this._x=e.x*i,this._y=e.y*i,this._z=e.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],i=t[4],r=t[8],a=t[1],o=t[5],c=t[9],l=t[2],h=t[6],d=t[10],f=n+o+d;if(f>0){const u=.5/Math.sqrt(f+1);this._w=.25/u,this._x=(h-c)*u,this._y=(r-l)*u,this._z=(a-i)*u}else if(n>o&&n>d){const u=2*Math.sqrt(1+n-o-d);this._w=(h-c)/u,this._x=.25*u,this._y=(i+a)/u,this._z=(r+l)/u}else if(o>d){const u=2*Math.sqrt(1+o-n-d);this._w=(r-l)/u,this._x=(i+a)/u,this._y=.25*u,this._z=(c+h)/u}else{const u=2*Math.sqrt(1+d-n-o);this._w=(a-i)/u,this._x=(r+l)/u,this._y=(c+h)/u,this._z=.25*u}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Ve(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const i=Math.min(1,t/n);return this.slerp(e,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,i=e._y,r=e._z,a=e._w,o=t._x,c=t._y,l=t._z,h=t._w;return this._x=n*h+a*o+i*l-r*c,this._y=i*h+a*c+r*o-n*l,this._z=r*h+a*l+n*c-i*o,this._w=a*h-n*o-i*c-r*l,this._onChangeCallback(),this}slerp(e,t){let n=e._x,i=e._y,r=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,i=-i,r=-r,a=-a,o=-o);let c=1-t;if(o<.9995){const l=Math.acos(o),h=Math.sin(l);c=Math.sin(c*l)/h,t=Math.sin(t*l)/h,this._x=this._x*c+n*t,this._y=this._y*c+i*t,this._z=this._z*c+r*t,this._w=this._w*c+a*t,this._onChangeCallback()}else this._x=this._x*c+n*t,this._y=this._y*c+i*t,this._z=this._z*c+r*t,this._w=this._w*c+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),i=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(i*Math.sin(e),i*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}const qo=class qo{constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(xc.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(xc.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,i=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*i,this.y=r[1]*t+r[4]*n+r[7]*i,this.z=r[2]*t+r[5]*n+r[8]*i,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,i=this.z,r=e.elements,a=1/(r[3]*t+r[7]*n+r[11]*i+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*i+r[12])*a,this.y=(r[1]*t+r[5]*n+r[9]*i+r[13])*a,this.z=(r[2]*t+r[6]*n+r[10]*i+r[14])*a,this}applyQuaternion(e){const t=this.x,n=this.y,i=this.z,r=e.x,a=e.y,o=e.z,c=e.w,l=2*(a*i-o*n),h=2*(o*t-r*i),d=2*(r*n-a*t);return this.x=t+c*l+a*d-o*h,this.y=n+c*h+o*l-r*d,this.z=i+c*d+r*h-a*l,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,i=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*i,this.y=r[1]*t+r[5]*n+r[9]*i,this.z=r[2]*t+r[6]*n+r[10]*i,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Ve(this.x,e.x,t.x),this.y=Ve(this.y,e.y,t.y),this.z=Ve(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=Ve(this.x,e,t),this.y=Ve(this.y,e,t),this.z=Ve(this.z,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Ve(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,i=e.y,r=e.z,a=t.x,o=t.y,c=t.z;return this.x=i*c-r*o,this.y=r*a-n*c,this.z=n*o-i*a,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Zr.copy(this).projectOnVector(e),this.sub(Zr)}reflect(e){return this.sub(Zr.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(Ve(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,i=this.z-e.z;return t*t+n*n+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const i=Math.sin(t)*e;return this.x=i*Math.sin(n),this.y=Math.cos(t)*e,this.z=i*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),i=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=i,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};qo.prototype.isVector3=!0;let k=qo;const Zr=new k,xc=new jt,Yo=class Yo{constructor(e,t,n,i,r,a,o,c,l){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,i,r,a,o,c,l)}set(e,t,n,i,r,a,o,c,l){const h=this.elements;return h[0]=e,h[1]=i,h[2]=o,h[3]=t,h[4]=r,h[5]=c,h[6]=n,h[7]=a,h[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,i=t.elements,r=this.elements,a=n[0],o=n[3],c=n[6],l=n[1],h=n[4],d=n[7],f=n[2],u=n[5],g=n[8],v=i[0],p=i[3],m=i[6],T=i[1],A=i[4],x=i[7],M=i[2],y=i[5],w=i[8];return r[0]=a*v+o*T+c*M,r[3]=a*p+o*A+c*y,r[6]=a*m+o*x+c*w,r[1]=l*v+h*T+d*M,r[4]=l*p+h*A+d*y,r[7]=l*m+h*x+d*w,r[2]=f*v+u*T+g*M,r[5]=f*p+u*A+g*y,r[8]=f*m+u*x+g*w,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],a=e[4],o=e[5],c=e[6],l=e[7],h=e[8];return t*a*h-t*o*l-n*r*h+n*o*c+i*r*l-i*a*c}invert(){const e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],a=e[4],o=e[5],c=e[6],l=e[7],h=e[8],d=h*a-o*l,f=o*c-h*r,u=l*r-a*c,g=t*d+n*f+i*u;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const v=1/g;return e[0]=d*v,e[1]=(i*l-h*n)*v,e[2]=(o*n-i*a)*v,e[3]=f*v,e[4]=(h*t-i*c)*v,e[5]=(i*r-o*t)*v,e[6]=u*v,e[7]=(n*c-l*t)*v,e[8]=(a*t-n*r)*v,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,i,r,a,o){const c=Math.cos(r),l=Math.sin(r);return this.set(n*c,n*l,-n*(c*a+l*o)+a+e,-i*l,i*c,-i*(-l*a+c*o)+o+t,0,0,1),this}scale(e,t){return Bi("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(jr.makeScale(e,t)),this}rotate(e){return Bi("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(jr.makeRotation(-e)),this}translate(e,t){return Bi("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(jr.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let i=0;i<9;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}};Yo.prototype.isMatrix3=!0;let Le=Yo;const jr=new Le,bc=new Le().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Mc=new Le().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function du(){const s={enabled:!0,workingColorSpace:Ot,spaces:{},convert:function(i,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===et&&(i.r=Fn(i.r),i.g=Fn(i.g),i.b=Fn(i.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(i.applyMatrix3(this.spaces[r].toXYZ),i.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===et&&(i.r=zi(i.r),i.g=zi(i.g),i.b=zi(i.b))),i},workingToColorSpace:function(i,r){return this.convert(i,this.workingColorSpace,r)},colorSpaceToWorking:function(i,r){return this.convert(i,r,this.workingColorSpace)},getPrimaries:function(i){return this.spaces[i].primaries},getTransfer:function(i){return i===Zn?wr:this.spaces[i].transfer},getToneMappingMode:function(i){return this.spaces[i].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(i,r=this.workingColorSpace){return i.fromArray(this.spaces[r].luminanceCoefficients)},define:function(i){Object.assign(this.spaces,i)},_getMatrix:function(i,r,a){return i.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(i){return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(i=this.workingColorSpace){return this.spaces[i].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(i,r){return Bi("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),s.workingToColorSpace(i,r)},toWorkingColorSpace:function(i,r){return Bi("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),s.colorSpaceToWorking(i,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return s.define({[Ot]:{primaries:e,whitePoint:n,transfer:wr,toXYZ:bc,fromXYZ:Mc,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:ft},outputColorSpaceConfig:{drawingBufferColorSpace:ft}},[ft]:{primaries:e,whitePoint:n,transfer:et,toXYZ:bc,fromXYZ:Mc,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:ft}}}),s}const Be=du();function Fn(s){return s<.04045?s*.0773993808:Math.pow(s*.9478672986+.0521327014,2.4)}function zi(s){return s<.0031308?s*12.92:1.055*Math.pow(s,.41666)-.055}let _i;class uu{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{_i===void 0&&(_i=Ss("canvas")),_i.width=e.width,_i.height=e.height;const i=_i.getContext("2d");e instanceof ImageData?i.putImageData(e,0,0):i.drawImage(e,0,0,e.width,e.height),n=_i}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Ss("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const i=n.getImageData(0,0,e.width,e.height),r=i.data;for(let a=0;a<r.length;a++)r[a]=Fn(r[a]/255)*255;return n.putImageData(i,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Fn(t[n]/255)*255):t[n]=Fn(t[n]);return{data:t,width:e.width,height:e.height}}else return Te("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let fu=0;class No{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:fu++}),this.uuid=on(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let r;if(Array.isArray(i)){r=[];for(let a=0,o=i.length;a<o;a++)i[a].isDataTexture?r.push(Jr(i[a].image)):r.push(Jr(i[a]))}else r=Jr(i);n.url=r}return t||(e.images[this.uuid]=n),n}}function Jr(s){return typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&s instanceof ImageBitmap?uu.getDataURL(s):s.data?{data:Array.from(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(Te("Texture: Unable to serialize Texture."),{})}let pu=0;const Qr=new k;class Et extends ti{constructor(e=Et.DEFAULT_IMAGE,t=Et.DEFAULT_MAPPING,n=bn,i=bn,r=bt,a=Dn,o=Vt,c=Ht,l=Et.DEFAULT_ANISOTROPY,h=Zn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:pu++}),this.uuid=on(),this.name="",this.source=new No(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=r,this.minFilter=a,this.anisotropy=l,this.format=o,this.internalFormat=null,this.type=c,this.offset=new ke(0,0),this.repeat=new ke(1,1),this.center=new ke(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Le,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(Qr).x}get height(){return this.source.getSize(Qr).y}get depth(){return this.source.getSize(Qr).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const n=e[t];if(n===void 0){Te(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const i=this[t];if(i===void 0){Te(`Texture.setValues(): property '${t}' does not exist.`);continue}i&&n&&i.isVector2&&n.isVector2||i&&n&&i.isVector3&&n.isVector3||i&&n&&i.isMatrix3&&n.isMatrix3?i.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Kl)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Vi:e.x=e.x-Math.floor(e.x);break;case bn:e.x=e.x<0?0:1;break;case br:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Vi:e.y=e.y-Math.floor(e.y);break;case bn:e.y=e.y<0?0:1;break;case br:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Et.DEFAULT_IMAGE=null;Et.DEFAULT_MAPPING=Kl;Et.DEFAULT_ANISOTROPY=1;const Ko=class Ko{constructor(e=0,t=0,n=0,i=1){this.x=e,this.y=t,this.z=n,this.w=i}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,i){return this.x=e,this.y=t,this.z=n,this.w=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,i=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*i+a[12]*r,this.y=a[1]*t+a[5]*n+a[9]*i+a[13]*r,this.z=a[2]*t+a[6]*n+a[10]*i+a[14]*r,this.w=a[3]*t+a[7]*n+a[11]*i+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,i,r;const c=e.elements,l=c[0],h=c[4],d=c[8],f=c[1],u=c[5],g=c[9],v=c[2],p=c[6],m=c[10];if(Math.abs(h-f)<.01&&Math.abs(d-v)<.01&&Math.abs(g-p)<.01){if(Math.abs(h+f)<.1&&Math.abs(d+v)<.1&&Math.abs(g+p)<.1&&Math.abs(l+u+m-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const A=(l+1)/2,x=(u+1)/2,M=(m+1)/2,y=(h+f)/4,w=(d+v)/4,_=(g+p)/4;return A>x&&A>M?A<.01?(n=0,i=.707106781,r=.707106781):(n=Math.sqrt(A),i=y/n,r=w/n):x>M?x<.01?(n=.707106781,i=0,r=.707106781):(i=Math.sqrt(x),n=y/i,r=_/i):M<.01?(n=.707106781,i=.707106781,r=0):(r=Math.sqrt(M),n=w/r,i=_/r),this.set(n,i,r,t),this}let T=Math.sqrt((p-g)*(p-g)+(d-v)*(d-v)+(f-h)*(f-h));return Math.abs(T)<.001&&(T=1),this.x=(p-g)/T,this.y=(d-v)/T,this.z=(f-h)/T,this.w=Math.acos((l+u+m-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Ve(this.x,e.x,t.x),this.y=Ve(this.y,e.y,t.y),this.z=Ve(this.z,e.z,t.z),this.w=Ve(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=Ve(this.x,e,t),this.y=Ve(this.y,e,t),this.z=Ve(this.z,e,t),this.w=Ve(this.w,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Ve(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};Ko.prototype.isVector4=!0;let it=Ko;class mu extends ti{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:bt,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new it(0,0,e,t),this.scissorTest=!1,this.viewport=new it(0,0,e,t),this.textures=[];const i={width:e,height:t,depth:n.depth},r=new Et(i),a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){const t={minFilter:bt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let i=0,r=this.textures.length;i<r;i++)this.textures[i].image.width=e,this.textures[i].image.height=t,this.textures[i].image.depth=n,this.textures[i].isData3DTexture!==!0&&(this.textures[i].isArrayTexture=this.textures[i].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const i=Object.assign({},e.textures[t].image);this.textures[t].source=new No(i)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){const t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}}class cn extends mu{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class ah extends Et{constructor(e=null,t=1,n=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=vt,this.minFilter=vt,this.wrapR=bn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class gu extends Et{constructor(e=null,t=1,n=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=vt,this.minFilter=vt,this.wrapR=bn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}}const Lr=class Lr{constructor(e,t,n,i,r,a,o,c,l,h,d,f,u,g,v,p){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,i,r,a,o,c,l,h,d,f,u,g,v,p)}set(e,t,n,i,r,a,o,c,l,h,d,f,u,g,v,p){const m=this.elements;return m[0]=e,m[4]=t,m[8]=n,m[12]=i,m[1]=r,m[5]=a,m[9]=o,m[13]=c,m[2]=l,m[6]=h,m[10]=d,m[14]=f,m[3]=u,m[7]=g,m[11]=v,m[15]=p,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Lr().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();const t=this.elements,n=e.elements,i=1/vi.setFromMatrixColumn(e,0).length(),r=1/vi.setFromMatrixColumn(e,1).length(),a=1/vi.setFromMatrixColumn(e,2).length();return t[0]=n[0]*i,t[1]=n[1]*i,t[2]=n[2]*i,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,i=e.y,r=e.z,a=Math.cos(n),o=Math.sin(n),c=Math.cos(i),l=Math.sin(i),h=Math.cos(r),d=Math.sin(r);if(e.order==="XYZ"){const f=a*h,u=a*d,g=o*h,v=o*d;t[0]=c*h,t[4]=-c*d,t[8]=l,t[1]=u+g*l,t[5]=f-v*l,t[9]=-o*c,t[2]=v-f*l,t[6]=g+u*l,t[10]=a*c}else if(e.order==="YXZ"){const f=c*h,u=c*d,g=l*h,v=l*d;t[0]=f+v*o,t[4]=g*o-u,t[8]=a*l,t[1]=a*d,t[5]=a*h,t[9]=-o,t[2]=u*o-g,t[6]=v+f*o,t[10]=a*c}else if(e.order==="ZXY"){const f=c*h,u=c*d,g=l*h,v=l*d;t[0]=f-v*o,t[4]=-a*d,t[8]=g+u*o,t[1]=u+g*o,t[5]=a*h,t[9]=v-f*o,t[2]=-a*l,t[6]=o,t[10]=a*c}else if(e.order==="ZYX"){const f=a*h,u=a*d,g=o*h,v=o*d;t[0]=c*h,t[4]=g*l-u,t[8]=f*l+v,t[1]=c*d,t[5]=v*l+f,t[9]=u*l-g,t[2]=-l,t[6]=o*c,t[10]=a*c}else if(e.order==="YZX"){const f=a*c,u=a*l,g=o*c,v=o*l;t[0]=c*h,t[4]=v-f*d,t[8]=g*d+u,t[1]=d,t[5]=a*h,t[9]=-o*h,t[2]=-l*h,t[6]=u*d+g,t[10]=f-v*d}else if(e.order==="XZY"){const f=a*c,u=a*l,g=o*c,v=o*l;t[0]=c*h,t[4]=-d,t[8]=l*h,t[1]=f*d+v,t[5]=a*h,t[9]=u*d-g,t[2]=g*d-u,t[6]=o*h,t[10]=v*d+f}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(_u,e,vu)}lookAt(e,t,n){const i=this.elements;return zt.subVectors(e,t),zt.lengthSq()===0&&(zt.z=1),zt.normalize(),Hn.crossVectors(n,zt),Hn.lengthSq()===0&&(Math.abs(n.z)===1?zt.x+=1e-4:zt.z+=1e-4,zt.normalize(),Hn.crossVectors(n,zt)),Hn.normalize(),Us.crossVectors(zt,Hn),i[0]=Hn.x,i[4]=Us.x,i[8]=zt.x,i[1]=Hn.y,i[5]=Us.y,i[9]=zt.y,i[2]=Hn.z,i[6]=Us.z,i[10]=zt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,i=t.elements,r=this.elements,a=n[0],o=n[4],c=n[8],l=n[12],h=n[1],d=n[5],f=n[9],u=n[13],g=n[2],v=n[6],p=n[10],m=n[14],T=n[3],A=n[7],x=n[11],M=n[15],y=i[0],w=i[4],_=i[8],E=i[12],C=i[1],P=i[5],D=i[9],F=i[13],I=i[2],z=i[6],Y=i[10],B=i[14],W=i[3],V=i[7],K=i[11],Z=i[15];return r[0]=a*y+o*C+c*I+l*W,r[4]=a*w+o*P+c*z+l*V,r[8]=a*_+o*D+c*Y+l*K,r[12]=a*E+o*F+c*B+l*Z,r[1]=h*y+d*C+f*I+u*W,r[5]=h*w+d*P+f*z+u*V,r[9]=h*_+d*D+f*Y+u*K,r[13]=h*E+d*F+f*B+u*Z,r[2]=g*y+v*C+p*I+m*W,r[6]=g*w+v*P+p*z+m*V,r[10]=g*_+v*D+p*Y+m*K,r[14]=g*E+v*F+p*B+m*Z,r[3]=T*y+A*C+x*I+M*W,r[7]=T*w+A*P+x*z+M*V,r[11]=T*_+A*D+x*Y+M*K,r[15]=T*E+A*F+x*B+M*Z,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],i=e[8],r=e[12],a=e[1],o=e[5],c=e[9],l=e[13],h=e[2],d=e[6],f=e[10],u=e[14],g=e[3],v=e[7],p=e[11],m=e[15],T=c*u-l*f,A=o*u-l*d,x=o*f-c*d,M=a*u-l*h,y=a*f-c*h,w=a*d-o*h;return t*(v*T-p*A+m*x)-n*(g*T-p*M+m*y)+i*(g*A-v*M+m*w)-r*(g*x-v*y+p*w)}determinantAffine(){const e=this.elements,t=e[0],n=e[4],i=e[8],r=e[1],a=e[5],o=e[9],c=e[2],l=e[6],h=e[10];return t*(a*h-o*l)-n*(r*h-o*c)+i*(r*l-a*c)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const i=this.elements;return e.isVector3?(i[12]=e.x,i[13]=e.y,i[14]=e.z):(i[12]=e,i[13]=t,i[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],a=e[4],o=e[5],c=e[6],l=e[7],h=e[8],d=e[9],f=e[10],u=e[11],g=e[12],v=e[13],p=e[14],m=e[15],T=t*o-n*a,A=t*c-i*a,x=t*l-r*a,M=n*c-i*o,y=n*l-r*o,w=i*l-r*c,_=h*v-d*g,E=h*p-f*g,C=h*m-u*g,P=d*p-f*v,D=d*m-u*v,F=f*m-u*p,I=T*F-A*D+x*P+M*C-y*E+w*_;if(I===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const z=1/I;return e[0]=(o*F-c*D+l*P)*z,e[1]=(i*D-n*F-r*P)*z,e[2]=(v*w-p*y+m*M)*z,e[3]=(f*y-d*w-u*M)*z,e[4]=(c*C-a*F-l*E)*z,e[5]=(t*F-i*C+r*E)*z,e[6]=(p*x-g*w-m*A)*z,e[7]=(h*w-f*x+u*A)*z,e[8]=(a*D-o*C+l*_)*z,e[9]=(n*C-t*D-r*_)*z,e[10]=(g*y-v*x+m*T)*z,e[11]=(d*x-h*y-u*T)*z,e[12]=(o*E-a*P-c*_)*z,e[13]=(t*P-n*E+i*_)*z,e[14]=(v*A-g*M-p*T)*z,e[15]=(h*M-d*A+f*T)*z,this}scale(e){const t=this.elements,n=e.x,i=e.y,r=e.z;return t[0]*=n,t[4]*=i,t[8]*=r,t[1]*=n,t[5]*=i,t[9]*=r,t[2]*=n,t[6]*=i,t[10]*=r,t[3]*=n,t[7]*=i,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],i=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,i))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),i=Math.sin(t),r=1-n,a=e.x,o=e.y,c=e.z,l=r*a,h=r*o;return this.set(l*a+n,l*o-i*c,l*c+i*o,0,l*o+i*c,h*o+n,h*c-i*a,0,l*c-i*o,h*c+i*a,r*c*c+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,i,r,a){return this.set(1,n,r,0,e,1,a,0,t,i,1,0,0,0,0,1),this}compose(e,t,n){const i=this.elements,r=t._x,a=t._y,o=t._z,c=t._w,l=r+r,h=a+a,d=o+o,f=r*l,u=r*h,g=r*d,v=a*h,p=a*d,m=o*d,T=c*l,A=c*h,x=c*d,M=n.x,y=n.y,w=n.z;return i[0]=(1-(v+m))*M,i[1]=(u+x)*M,i[2]=(g-A)*M,i[3]=0,i[4]=(u-x)*y,i[5]=(1-(f+m))*y,i[6]=(p+T)*y,i[7]=0,i[8]=(g+A)*w,i[9]=(p-T)*w,i[10]=(1-(f+v))*w,i[11]=0,i[12]=e.x,i[13]=e.y,i[14]=e.z,i[15]=1,this}decompose(e,t,n){const i=this.elements;e.x=i[12],e.y=i[13],e.z=i[14];const r=this.determinantAffine();if(r===0)return n.set(1,1,1),t.identity(),this;let a=vi.set(i[0],i[1],i[2]).length();const o=vi.set(i[4],i[5],i[6]).length(),c=vi.set(i[8],i[9],i[10]).length();r<0&&(a=-a),Qt.copy(this);const l=1/a,h=1/o,d=1/c;return Qt.elements[0]*=l,Qt.elements[1]*=l,Qt.elements[2]*=l,Qt.elements[4]*=h,Qt.elements[5]*=h,Qt.elements[6]*=h,Qt.elements[8]*=d,Qt.elements[9]*=d,Qt.elements[10]*=d,t.setFromRotationMatrix(Qt),n.x=a,n.y=o,n.z=c,this}makePerspective(e,t,n,i,r,a,o=Mn,c=!1){const l=this.elements,h=2*r/(t-e),d=2*r/(n-i),f=(t+e)/(t-e),u=(n+i)/(n-i);let g,v;if(c)g=r/(a-r),v=a*r/(a-r);else if(o===Mn)g=-(a+r)/(a-r),v=-2*a*r/(a-r);else if(o===ys)g=-a/(a-r),v=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return l[0]=h,l[4]=0,l[8]=f,l[12]=0,l[1]=0,l[5]=d,l[9]=u,l[13]=0,l[2]=0,l[6]=0,l[10]=g,l[14]=v,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,n,i,r,a,o=Mn,c=!1){const l=this.elements,h=2/(t-e),d=2/(n-i),f=-(t+e)/(t-e),u=-(n+i)/(n-i);let g,v;if(c)g=1/(a-r),v=a/(a-r);else if(o===Mn)g=-2/(a-r),v=-(a+r)/(a-r);else if(o===ys)g=-1/(a-r),v=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return l[0]=h,l[4]=0,l[8]=0,l[12]=f,l[1]=0,l[5]=d,l[9]=0,l[13]=u,l[2]=0,l[6]=0,l[10]=g,l[14]=v,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let i=0;i<16;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}};Lr.prototype.isMatrix4=!0;let Ue=Lr;const vi=new k,Qt=new Ue,_u=new k(0,0,0),vu=new k(1,1,1),Hn=new k,Us=new k,zt=new k,yc=new Ue,Sc=new jt;class ei{constructor(e=0,t=0,n=0,i=ei.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,i=this._order){return this._x=e,this._y=t,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const i=e.elements,r=i[0],a=i[4],o=i[8],c=i[1],l=i[5],h=i[9],d=i[2],f=i[6],u=i[10];switch(t){case"XYZ":this._y=Math.asin(Ve(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,u),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(f,l),this._z=0);break;case"YXZ":this._x=Math.asin(-Ve(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,u),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-d,r),this._z=0);break;case"ZXY":this._x=Math.asin(Ve(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-d,u),this._z=Math.atan2(-a,l)):(this._y=0,this._z=Math.atan2(c,r));break;case"ZYX":this._y=Math.asin(-Ve(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(f,u),this._z=Math.atan2(c,r)):(this._x=0,this._z=Math.atan2(-a,l));break;case"YZX":this._z=Math.asin(Ve(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-h,l),this._y=Math.atan2(-d,r)):(this._x=0,this._y=Math.atan2(o,u));break;case"XZY":this._z=Math.asin(-Ve(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(f,l),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-h,u),this._y=0);break;default:Te("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return yc.makeRotationFromQuaternion(e),this.setFromRotationMatrix(yc,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Sc.setFromEuler(this),this.setFromQuaternion(Sc,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}ei.DEFAULT_ORDER="XYZ";class oh{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let xu=0;const wc=new k,xi=new jt,An=new Ue,Ns=new k,Ji=new k,bu=new k,Mu=new jt,Ec=new k(1,0,0),Tc=new k(0,1,0),Ac=new k(0,0,1),Rc={type:"added"},yu={type:"removed"},bi={type:"childadded",child:null},ea={type:"childremoved",child:null};class ht extends ti{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:xu++}),this.uuid=on(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=ht.DEFAULT_UP.clone();const e=new k,t=new ei,n=new jt,i=new k(1,1,1);function r(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new Ue},normalMatrix:{value:new Le}}),this.matrix=new Ue,this.matrixWorld=new Ue,this.matrixAutoUpdate=ht.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=ht.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new oh,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return xi.setFromAxisAngle(e,t),this.quaternion.multiply(xi),this}rotateOnWorldAxis(e,t){return xi.setFromAxisAngle(e,t),this.quaternion.premultiply(xi),this}rotateX(e){return this.rotateOnAxis(Ec,e)}rotateY(e){return this.rotateOnAxis(Tc,e)}rotateZ(e){return this.rotateOnAxis(Ac,e)}translateOnAxis(e,t){return wc.copy(e).applyQuaternion(this.quaternion),this.position.add(wc.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Ec,e)}translateY(e){return this.translateOnAxis(Tc,e)}translateZ(e){return this.translateOnAxis(Ac,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(An.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Ns.copy(e):Ns.set(e,t,n);const i=this.parent;this.updateWorldMatrix(!0,!1),Ji.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?An.lookAt(Ji,Ns,this.up):An.lookAt(Ns,Ji,this.up),this.quaternion.setFromRotationMatrix(An),i&&(An.extractRotation(i.matrixWorld),xi.setFromRotationMatrix(An),this.quaternion.premultiply(xi.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(Pe("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Rc),bi.child=e,this.dispatchEvent(bi),bi.child=null):Pe("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(yu),ea.child=e,this.dispatchEvent(ea),ea.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),An.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),An.multiply(e.parent.matrixWorld)),e.applyMatrix4(An),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Rc),bi.child=e,this.dispatchEvent(bi),bi.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,i=this.children.length;n<i;n++){const a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const i=this.children;for(let r=0,a=i.length;r<a;r++)i[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ji,e,bu),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ji,Mu,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(e){e(this);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);const e=this.pivot;if(e!==null){const t=e.x,n=e.y,i=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*n-r[8]*i,r[13]+=n-r[1]*t-r[5]*n-r[9]*i,r[14]+=i-r[2]*t-r[6]*n-r[10]*i}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){const i=this.parent;if(e===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){const r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,n)}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const i={};i.uuid=this.uuid,i.type=this.type,i.name=this.name,i.castShadow=this.castShadow,i.receiveShadow=this.receiveShadow,i.visible=this.visible,i.frustumCulled=this.frustumCulled,i.renderOrder=this.renderOrder,i.static=this.static,i.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.pivot!==null&&(i.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(i.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(i.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),i.instanceInfo=this._instanceInfo.map(o=>({...o})),i.availableInstanceIds=this._availableInstanceIds.slice(),i.availableGeometryIds=this._availableGeometryIds.slice(),i.nextIndexStart=this._nextIndexStart,i.nextVertexStart=this._nextVertexStart,i.geometryCount=this._geometryCount,i.maxInstanceCount=this._maxInstanceCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.matricesTexture=this._matricesTexture.toJSON(e),i.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(i.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(i.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(i.boundingBox=this.boundingBox.toJSON()));function r(o,c){return o[c.uuid]===void 0&&(o[c.uuid]=c.toJSON(e)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?i.background=this.background.toJSON():this.background.isTexture&&(i.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(i.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){i.geometry=r(e.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const c=o.shapes;if(Array.isArray(c))for(let l=0,h=c.length;l<h;l++){const d=c[l];r(e.shapes,d)}else r(e.shapes,c)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let c=0,l=this.material.length;c<l;c++)o.push(r(e.materials,this.material[c]));i.material=o}else i.material=r(e.materials,this.material);if(this.children.length>0){i.children=[];for(let o=0;o<this.children.length;o++)i.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){i.animations=[];for(let o=0;o<this.animations.length;o++){const c=this.animations[o];i.animations.push(r(e.animations,c))}}if(t){const o=a(e.geometries),c=a(e.materials),l=a(e.textures),h=a(e.images),d=a(e.shapes),f=a(e.skeletons),u=a(e.animations),g=a(e.nodes);o.length>0&&(n.geometries=o),c.length>0&&(n.materials=c),l.length>0&&(n.textures=l),h.length>0&&(n.images=h),d.length>0&&(n.shapes=d),f.length>0&&(n.skeletons=f),u.length>0&&(n.animations=u),g.length>0&&(n.nodes=g)}return n.object=i,n;function a(o){const c=[];for(const l in o){const h=o[l];delete h.metadata,c.push(h)}return c}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const i=e.children[n];this.add(i.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}}ht.DEFAULT_UP=new k(0,1,0);ht.DEFAULT_MATRIX_AUTO_UPDATE=!0;ht.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;class di extends ht{constructor(){super(),this.isGroup=!0,this.type="Group"}}const Su={type:"move"};class ta{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new di,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new di,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new k,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new k),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new di,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new k,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new k,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let i=null,r=null,a=null;const o=this._targetRay,c=this._grip,l=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(l&&e.hand){a=!0;for(const v of e.hand.values()){const p=t.getJointPose(v,n),m=this._getHandJoint(l,v);p!==null&&(m.matrix.fromArray(p.transform.matrix),m.matrix.decompose(m.position,m.rotation,m.scale),m.matrixWorldNeedsUpdate=!0,m.jointRadius=p.radius),m.visible=p!==null}const h=l.joints["index-finger-tip"],d=l.joints["thumb-tip"],f=h.position.distanceTo(d.position),u=.02,g=.005;l.inputState.pinching&&f>u+g?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!l.inputState.pinching&&f<=u-g&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(c.matrix.fromArray(r.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,r.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(r.linearVelocity)):c.hasLinearVelocity=!1,r.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(r.angularVelocity)):c.hasAngularVelocity=!1,c.eventsEnabled&&c.dispatchEvent({type:"gripUpdated",data:e,target:this})));o!==null&&(i=t.getPose(e.targetRaySpace,n),i===null&&r!==null&&(i=r),i!==null&&(o.matrix.fromArray(i.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,i.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(i.linearVelocity)):o.hasLinearVelocity=!1,i.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(i.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Su)))}return o!==null&&(o.visible=i!==null),c!==null&&(c.visible=r!==null),l!==null&&(l.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new di;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}const ch={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Vn={h:0,s:0,l:0},Fs={h:0,s:0,l:0};function na(s,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?s+(e-s)*6*t:t<1/2?e:t<2/3?s+(e-s)*6*(2/3-t):s}class Ce{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const i=e;i&&i.isColor?this.copy(i):typeof i=="number"?this.setHex(i):typeof i=="string"&&this.setStyle(i)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=ft){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Be.colorSpaceToWorking(this,t),this}setRGB(e,t,n,i=Be.workingColorSpace){return this.r=e,this.g=t,this.b=n,Be.colorSpaceToWorking(this,i),this}setHSL(e,t,n,i=Be.workingColorSpace){if(e=Uo(e,1),t=Ve(t,0,1),n=Ve(n,0,1),t===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+t):n+t-n*t,a=2*n-r;this.r=na(a,r,e+1/3),this.g=na(a,r,e),this.b=na(a,r,e-1/3)}return Be.colorSpaceToWorking(this,i),this}setStyle(e,t=ft){function n(r){r!==void 0&&parseFloat(r)<1&&Te("Color: Alpha component of "+e+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const a=i[1],o=i[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:Te("Color: Unknown color model "+e)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=i[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);Te("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=ft){const n=ch[e.toLowerCase()];return n!==void 0?this.setHex(n,t):Te("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Fn(e.r),this.g=Fn(e.g),this.b=Fn(e.b),this}copyLinearToSRGB(e){return this.r=zi(e.r),this.g=zi(e.g),this.b=zi(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=ft){return Be.workingToColorSpace(Ct.copy(this),e),Math.round(Ve(Ct.r*255,0,255))*65536+Math.round(Ve(Ct.g*255,0,255))*256+Math.round(Ve(Ct.b*255,0,255))}getHexString(e=ft){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Be.workingColorSpace){Be.workingToColorSpace(Ct.copy(this),t);const n=Ct.r,i=Ct.g,r=Ct.b,a=Math.max(n,i,r),o=Math.min(n,i,r);let c,l;const h=(o+a)/2;if(o===a)c=0,l=0;else{const d=a-o;switch(l=h<=.5?d/(a+o):d/(2-a-o),a){case n:c=(i-r)/d+(i<r?6:0);break;case i:c=(r-n)/d+2;break;case r:c=(n-i)/d+4;break}c/=6}return e.h=c,e.s=l,e.l=h,e}getRGB(e,t=Be.workingColorSpace){return Be.workingToColorSpace(Ct.copy(this),t),e.r=Ct.r,e.g=Ct.g,e.b=Ct.b,e}getStyle(e=ft){Be.workingToColorSpace(Ct.copy(this),e);const t=Ct.r,n=Ct.g,i=Ct.b;return e!==ft?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(i*255)})`}offsetHSL(e,t,n){return this.getHSL(Vn),this.setHSL(Vn.h+e,Vn.s+t,Vn.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Vn),e.getHSL(Fs);const n=ms(Vn.h,Fs.h,t),i=ms(Vn.s,Fs.s,t),r=ms(Vn.l,Fs.l,t);return this.setHSL(n,i,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,i=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*i,this.g=r[1]*t+r[4]*n+r[7]*i,this.b=r[2]*t+r[5]*n+r[8]*i,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Ct=new Ce;Ce.NAMES=ch;class wu extends ht{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new ei,this.environmentIntensity=1,this.environmentRotation=new ei,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}}const en=new k,Rn=new k,ia=new k,Cn=new k,Mi=new k,yi=new k,Cc=new k,sa=new k,ra=new k,aa=new k,oa=new it,ca=new it,la=new it;class rn{constructor(e=new k,t=new k,n=new k){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,i){i.subVectors(n,t),en.subVectors(e,t),i.cross(en);const r=i.lengthSq();return r>0?i.multiplyScalar(1/Math.sqrt(r)):i.set(0,0,0)}static getBarycoord(e,t,n,i,r){en.subVectors(i,t),Rn.subVectors(n,t),ia.subVectors(e,t);const a=en.dot(en),o=en.dot(Rn),c=en.dot(ia),l=Rn.dot(Rn),h=Rn.dot(ia),d=a*l-o*o;if(d===0)return r.set(0,0,0),null;const f=1/d,u=(l*c-o*h)*f,g=(a*h-o*c)*f;return r.set(1-u-g,g,u)}static containsPoint(e,t,n,i){return this.getBarycoord(e,t,n,i,Cn)===null?!1:Cn.x>=0&&Cn.y>=0&&Cn.x+Cn.y<=1}static getInterpolation(e,t,n,i,r,a,o,c){return this.getBarycoord(e,t,n,i,Cn)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(r,Cn.x),c.addScaledVector(a,Cn.y),c.addScaledVector(o,Cn.z),c)}static getInterpolatedAttribute(e,t,n,i,r,a){return oa.setScalar(0),ca.setScalar(0),la.setScalar(0),oa.fromBufferAttribute(e,t),ca.fromBufferAttribute(e,n),la.fromBufferAttribute(e,i),a.setScalar(0),a.addScaledVector(oa,r.x),a.addScaledVector(ca,r.y),a.addScaledVector(la,r.z),a}static isFrontFacing(e,t,n,i){return en.subVectors(n,t),Rn.subVectors(e,t),en.cross(Rn).dot(i)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,i){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[i]),this}setFromAttributeAndIndices(e,t,n,i){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,i),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return en.subVectors(this.c,this.b),Rn.subVectors(this.a,this.b),en.cross(Rn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return rn.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return rn.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,i,r){return rn.getInterpolation(e,this.a,this.b,this.c,t,n,i,r)}containsPoint(e){return rn.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return rn.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,i=this.b,r=this.c;let a,o;Mi.subVectors(i,n),yi.subVectors(r,n),sa.subVectors(e,n);const c=Mi.dot(sa),l=yi.dot(sa);if(c<=0&&l<=0)return t.copy(n);ra.subVectors(e,i);const h=Mi.dot(ra),d=yi.dot(ra);if(h>=0&&d<=h)return t.copy(i);const f=c*d-h*l;if(f<=0&&c>=0&&h<=0)return a=c/(c-h),t.copy(n).addScaledVector(Mi,a);aa.subVectors(e,r);const u=Mi.dot(aa),g=yi.dot(aa);if(g>=0&&u<=g)return t.copy(r);const v=u*l-c*g;if(v<=0&&l>=0&&g<=0)return o=l/(l-g),t.copy(n).addScaledVector(yi,o);const p=h*g-u*d;if(p<=0&&d-h>=0&&u-g>=0)return Cc.subVectors(r,i),o=(d-h)/(d-h+(u-g)),t.copy(i).addScaledVector(Cc,o);const m=1/(p+v+f);return a=v*m,o=f*m,t.copy(n).addScaledVector(Mi,a).addScaledVector(yi,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}class dn{constructor(e=new k(1/0,1/0,1/0),t=new k(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(tn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(tn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=tn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,tn):tn.fromBufferAttribute(r,a),tn.applyMatrix4(e.matrixWorld),this.expandByPoint(tn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),ks.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),ks.copy(n.boundingBox)),ks.applyMatrix4(e.matrixWorld),this.union(ks)}const i=e.children;for(let r=0,a=i.length;r<a;r++)this.expandByObject(i[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,tn),tn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Qi),Os.subVectors(this.max,Qi),Si.subVectors(e.a,Qi),wi.subVectors(e.b,Qi),Ei.subVectors(e.c,Qi),Wn.subVectors(wi,Si),Xn.subVectors(Ei,wi),si.subVectors(Si,Ei);let t=[0,-Wn.z,Wn.y,0,-Xn.z,Xn.y,0,-si.z,si.y,Wn.z,0,-Wn.x,Xn.z,0,-Xn.x,si.z,0,-si.x,-Wn.y,Wn.x,0,-Xn.y,Xn.x,0,-si.y,si.x,0];return!ha(t,Si,wi,Ei,Os)||(t=[1,0,0,0,1,0,0,0,1],!ha(t,Si,wi,Ei,Os))?!1:(Bs.crossVectors(Wn,Xn),t=[Bs.x,Bs.y,Bs.z],ha(t,Si,wi,Ei,Os))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,tn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(tn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Pn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Pn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Pn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Pn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Pn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Pn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Pn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Pn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Pn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const Pn=[new k,new k,new k,new k,new k,new k,new k,new k],tn=new k,ks=new dn,Si=new k,wi=new k,Ei=new k,Wn=new k,Xn=new k,si=new k,Qi=new k,Os=new k,Bs=new k,ri=new k;function ha(s,e,t,n,i){for(let r=0,a=s.length-3;r<=a;r+=3){ri.fromArray(s,r);const o=i.x*Math.abs(ri.x)+i.y*Math.abs(ri.y)+i.z*Math.abs(ri.z),c=e.dot(ri),l=t.dot(ri),h=n.dot(ri);if(Math.max(-Math.max(c,l,h),Math.min(c,l,h))>o)return!1}return!0}const _t=new k,zs=new ke;let Eu=0;class Pt extends ti{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Eu++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=sh,this.updateRanges=[],this.gpuType=Zt,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let i=0,r=this.itemSize;i<r;i++)this.array[e+i]=t.array[n+i];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)zs.fromBufferAttribute(this,t),zs.applyMatrix3(e),this.setXY(t,zs.x,zs.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)_t.fromBufferAttribute(this,t),_t.applyMatrix3(e),this.setXYZ(t,_t.x,_t.y,_t.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)_t.fromBufferAttribute(this,t),_t.applyMatrix4(e),this.setXYZ(t,_t.x,_t.y,_t.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)_t.fromBufferAttribute(this,t),_t.applyNormalMatrix(e),this.setXYZ(t,_t.x,_t.y,_t.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)_t.fromBufferAttribute(this,t),_t.transformDirection(e),this.setXYZ(t,_t.x,_t.y,_t.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=sn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=tt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=sn(t,this.array)),t}setX(e,t){return this.normalized&&(t=tt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=sn(t,this.array)),t}setY(e,t){return this.normalized&&(t=tt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=sn(t,this.array)),t}setZ(e,t){return this.normalized&&(t=tt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=sn(t,this.array)),t}setW(e,t){return this.normalized&&(t=tt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=tt(t,this.array),n=tt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,i){return e*=this.itemSize,this.normalized&&(t=tt(t,this.array),n=tt(n,this.array),i=tt(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this}setXYZW(e,t,n,i,r){return e*=this.itemSize,this.normalized&&(t=tt(t,this.array),n=tt(n,this.array),i=tt(i,this.array),r=tt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}}class lh extends Pt{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class hh extends Pt{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class ln extends Pt{constructor(e,t,n){super(new Float32Array(e),t,n)}}const Tu=new dn,es=new k,da=new k;class En{constructor(e=new k,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):Tu.setFromPoints(e).getCenter(n);let i=0;for(let r=0,a=e.length;r<a;r++)i=Math.max(i,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(i),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;es.subVectors(e,this.center);const t=es.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),i=(n-this.radius)*.5;this.center.addScaledVector(es,i/n),this.radius+=i}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(da.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(es.copy(e.center).add(da)),this.expandByPoint(es.copy(e.center).sub(da))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}let Au=0;const Xt=new Ue,ua=new ht,Ti=new k,Gt=new dn,ts=new dn,wt=new k;class Bt extends ti{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Au++}),this.uuid=on(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Vd(e)?hh:lh)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new Le().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}const i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(e),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return Xt.makeRotationFromQuaternion(e),this.applyMatrix4(Xt),this}rotateX(e){return Xt.makeRotationX(e),this.applyMatrix4(Xt),this}rotateY(e){return Xt.makeRotationY(e),this.applyMatrix4(Xt),this}rotateZ(e){return Xt.makeRotationZ(e),this.applyMatrix4(Xt),this}translate(e,t,n){return Xt.makeTranslation(e,t,n),this.applyMatrix4(Xt),this}scale(e,t,n){return Xt.makeScale(e,t,n),this.applyMatrix4(Xt),this}lookAt(e){return ua.lookAt(e),ua.updateMatrix(),this.applyMatrix4(ua.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ti).negate(),this.translate(Ti.x,Ti.y,Ti.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const n=[];for(let i=0,r=e.length;i<r;i++){const a=e[i];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new ln(n,3))}else{const n=Math.min(e.length,t.count);for(let i=0;i<n;i++){const r=e[i];t.setXYZ(i,r.x,r.y,r.z||0)}e.length>t.count&&Te("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new dn);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Pe("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new k(-1/0,-1/0,-1/0),new k(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,i=t.length;n<i;n++){const r=t[n];Gt.setFromBufferAttribute(r),this.morphTargetsRelative?(wt.addVectors(this.boundingBox.min,Gt.min),this.boundingBox.expandByPoint(wt),wt.addVectors(this.boundingBox.max,Gt.max),this.boundingBox.expandByPoint(wt)):(this.boundingBox.expandByPoint(Gt.min),this.boundingBox.expandByPoint(Gt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Pe('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new En);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Pe("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new k,1/0);return}if(e){const n=this.boundingSphere.center;if(Gt.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){const o=t[r];ts.setFromBufferAttribute(o),this.morphTargetsRelative?(wt.addVectors(Gt.min,ts.min),Gt.expandByPoint(wt),wt.addVectors(Gt.max,ts.max),Gt.expandByPoint(wt)):(Gt.expandByPoint(ts.min),Gt.expandByPoint(ts.max))}Gt.getCenter(n);let i=0;for(let r=0,a=e.count;r<a;r++)wt.fromBufferAttribute(e,r),i=Math.max(i,n.distanceToSquared(wt));if(t)for(let r=0,a=t.length;r<a;r++){const o=t[r],c=this.morphTargetsRelative;for(let l=0,h=o.count;l<h;l++)wt.fromBufferAttribute(o,l),c&&(Ti.fromBufferAttribute(e,l),wt.add(Ti)),i=Math.max(i,n.distanceToSquared(wt))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&Pe('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){Pe("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,i=t.normal,r=t.uv;let a=this.getAttribute("tangent");(a===void 0||a.count!==n.count)&&(a=new Pt(new Float32Array(4*n.count),4),this.setAttribute("tangent",a));const o=[],c=[];for(let _=0;_<n.count;_++)o[_]=new k,c[_]=new k;const l=new k,h=new k,d=new k,f=new ke,u=new ke,g=new ke,v=new k,p=new k;function m(_,E,C){l.fromBufferAttribute(n,_),h.fromBufferAttribute(n,E),d.fromBufferAttribute(n,C),f.fromBufferAttribute(r,_),u.fromBufferAttribute(r,E),g.fromBufferAttribute(r,C),h.sub(l),d.sub(l),u.sub(f),g.sub(f);const P=1/(u.x*g.y-g.x*u.y);isFinite(P)&&(v.copy(h).multiplyScalar(g.y).addScaledVector(d,-u.y).multiplyScalar(P),p.copy(d).multiplyScalar(u.x).addScaledVector(h,-g.x).multiplyScalar(P),o[_].add(v),o[E].add(v),o[C].add(v),c[_].add(p),c[E].add(p),c[C].add(p))}let T=this.groups;T.length===0&&(T=[{start:0,count:e.count}]);for(let _=0,E=T.length;_<E;++_){const C=T[_],P=C.start,D=C.count;for(let F=P,I=P+D;F<I;F+=3)m(e.getX(F+0),e.getX(F+1),e.getX(F+2))}const A=new k,x=new k,M=new k,y=new k;function w(_){M.fromBufferAttribute(i,_),y.copy(M);const E=o[_];A.copy(E),A.sub(M.multiplyScalar(M.dot(E))).normalize(),x.crossVectors(y,E);const P=x.dot(c[_])<0?-1:1;a.setXYZW(_,A.x,A.y,A.z,P)}for(let _=0,E=T.length;_<E;++_){const C=T[_],P=C.start,D=C.count;for(let F=P,I=P+D;F<I;F+=3)w(e.getX(F+0)),w(e.getX(F+1)),w(e.getX(F+2))}this._transformed=!0}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==t.count)n=new Pt(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let f=0,u=n.count;f<u;f++)n.setXYZ(f,0,0,0);const i=new k,r=new k,a=new k,o=new k,c=new k,l=new k,h=new k,d=new k;if(e)for(let f=0,u=e.count;f<u;f+=3){const g=e.getX(f+0),v=e.getX(f+1),p=e.getX(f+2);i.fromBufferAttribute(t,g),r.fromBufferAttribute(t,v),a.fromBufferAttribute(t,p),h.subVectors(a,r),d.subVectors(i,r),h.cross(d),o.fromBufferAttribute(n,g),c.fromBufferAttribute(n,v),l.fromBufferAttribute(n,p),o.add(h),c.add(h),l.add(h),n.setXYZ(g,o.x,o.y,o.z),n.setXYZ(v,c.x,c.y,c.z),n.setXYZ(p,l.x,l.y,l.z)}else for(let f=0,u=t.count;f<u;f+=3)i.fromBufferAttribute(t,f+0),r.fromBufferAttribute(t,f+1),a.fromBufferAttribute(t,f+2),h.subVectors(a,r),d.subVectors(i,r),h.cross(d),n.setXYZ(f+0,h.x,h.y,h.z),n.setXYZ(f+1,h.x,h.y,h.z),n.setXYZ(f+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)wt.fromBufferAttribute(e,t),wt.normalize(),e.setXYZ(t,wt.x,wt.y,wt.z)}toNonIndexed(){function e(o,c){const l=o.array,h=o.itemSize,d=o.normalized,f=new l.constructor(c.length*h);let u=0,g=0;for(let v=0,p=c.length;v<p;v++){o.isInterleavedBufferAttribute?u=c[v]*o.data.stride+o.offset:u=c[v]*h;for(let m=0;m<h;m++)f[g++]=l[u++]}return new Pt(f,h,d)}if(this.index===null)return Te("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new Bt,n=this.index.array,i=this.attributes;for(const o in i){const c=i[o],l=e(c,n);t.setAttribute(o,l)}const r=this.morphAttributes;for(const o in r){const c=[],l=r[o];for(let h=0,d=l.length;h<d;h++){const f=l[h],u=e(f,n);c.push(u)}t.morphAttributes[o]=c}t.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,c=a.length;o<c;o++){const l=a[o];t.addGroup(l.start,l.count,l.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){const c=this.parameters;for(const l in c)c[l]!==void 0&&(e[l]=c[l]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const c in n){const l=n[c];e.data.attributes[c]=l.toJSON(e.data)}const i={};let r=!1;for(const c in this.morphAttributes){const l=this.morphAttributes[c],h=[];for(let d=0,f=l.length;d<f;d++){const u=l[d];h.push(u.toJSON(e.data))}h.length>0&&(i[c]=h,r=!0)}r&&(e.data.morphAttributes=i,e.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone());const i=e.attributes;for(const l in i){const h=i[l];this.setAttribute(l,h.clone(t))}const r=e.morphAttributes;for(const l in r){const h=[],d=r[l];for(let f=0,u=d.length;f<u;f++)h.push(d[f].clone(t));this.morphAttributes[l]=h}this.morphTargetsRelative=e.morphTargetsRelative;const a=e.groups;for(let l=0,h=a.length;l<h;l++){const d=a[l];this.addGroup(d.start,d.count,d.materialIndex)}const o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());const c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}}class dh{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=sh,this.updateRanges=[],this.version=0,this.uuid=on()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let i=0,r=this.stride;i<r;i++)this.array[e+i]=t.array[n+i];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=on()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=on()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer)));const t={uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride};return t.usage=this.usage,t}}const Dt=new k;class Nr{constructor(e,t,n,i=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=i}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)Dt.fromBufferAttribute(this,t),Dt.applyMatrix4(e),this.setXYZ(t,Dt.x,Dt.y,Dt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Dt.fromBufferAttribute(this,t),Dt.applyNormalMatrix(e),this.setXYZ(t,Dt.x,Dt.y,Dt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Dt.fromBufferAttribute(this,t),Dt.transformDirection(e),this.setXYZ(t,Dt.x,Dt.y,Dt.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=sn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=tt(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=tt(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=tt(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=tt(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=tt(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=sn(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=sn(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=sn(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=sn(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=tt(t,this.array),n=tt(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=tt(t,this.array),n=tt(n,this.array),i=tt(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this}setXYZW(e,t,n,i,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=tt(t,this.array),n=tt(n,this.array),i=tt(i,this.array),r=tt(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this.data.array[e+3]=r,this}clone(e){if(e===void 0){Er("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const i=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[i+r])}return new Pt(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new Nr(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){Er("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const i=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[i+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}const fa=new k,Ru=new k,Cu=new Le;class Kn{constructor(e=new k(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,i){return this.normal.set(e,t,n),this.constant=i,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const i=fa.subVectors(n,t).cross(Ru.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(i,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){const i=e.delta(fa),r=this.normal.dot(i);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const a=-(e.start.dot(this.normal)+this.constant)/r;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(i,a)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||Cu.getNormalMatrix(e),i=this.coplanarPoint(fa).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}}let Pu=0;class hn extends ti{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Pu++}),this.uuid=on(),this.name="",this.type="Material",this.blending=fs,this.side=Qn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Ol,this.blendDst=Bl,this.blendEquation=Ui,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ce(0,0,0),this.blendAlpha=0,this.depthFunc=gs,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Fd,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=$r,this.stencilZFail=$r,this.stencilZPass=$r,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){Te(`Material: parameter '${t}' has value of undefined.`);continue}const i=this[t];if(i===void 0){Te(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}i&&i.isColor?i.set(n):i&&i.isVector2&&n&&n.isVector2||i&&i.isEuler&&n&&n.isEuler||i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function i(r){const a=[];for(const o in r){const c=r[o];delete c.metadata,a.push(c)}return a}if(t){const r=i(e.textures),a=i(e.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new Ce().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(n=>new Kn().fromJSON(n))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let n=e.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new ke().fromArray(n)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new ke().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const i=t.length;n=new Array(i);for(let r=0;r!==i;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}const In=new k,pa=new k,Gs=new k,Hs=new k;class Fr{constructor(e=new k,t=new k(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,In)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=In.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(In.copy(this.origin).addScaledVector(this.direction,t),In.distanceToSquared(e))}distanceSqToSegment(e,t,n,i){pa.copy(e).add(t).multiplyScalar(.5),Gs.copy(t).sub(e).normalize(),Hs.copy(this.origin).sub(pa);const r=e.distanceTo(t)*.5,a=-this.direction.dot(Gs),o=Hs.dot(this.direction),c=-Hs.dot(Gs),l=Hs.lengthSq(),h=Math.abs(1-a*a);let d,f,u,g;if(h>0)if(d=a*c-o,f=a*o-c,g=r*h,d>=0)if(f>=-g)if(f<=g){const v=1/h;d*=v,f*=v,u=d*(d+a*f+2*o)+f*(a*d+f+2*c)+l}else f=r,d=Math.max(0,-(a*f+o)),u=-d*d+f*(f+2*c)+l;else f=-r,d=Math.max(0,-(a*f+o)),u=-d*d+f*(f+2*c)+l;else f<=-g?(d=Math.max(0,-(-a*r+o)),f=d>0?-r:Math.min(Math.max(-r,-c),r),u=-d*d+f*(f+2*c)+l):f<=g?(d=0,f=Math.min(Math.max(-r,-c),r),u=f*(f+2*c)+l):(d=Math.max(0,-(a*r+o)),f=d>0?r:Math.min(Math.max(-r,-c),r),u=-d*d+f*(f+2*c)+l);else f=a>0?-r:r,d=Math.max(0,-(a*f+o)),u=-d*d+f*(f+2*c)+l;return n&&n.copy(this.origin).addScaledVector(this.direction,d),i&&i.copy(pa).addScaledVector(Gs,f),u}intersectSphere(e,t){if(e.radius<0)return null;In.subVectors(e.center,this.origin);const n=In.dot(this.direction),i=In.dot(In)-n*n,r=e.radius*e.radius;if(i>r)return null;const a=Math.sqrt(r-i),o=n-a,c=n+a;return c<0?null:o<0?this.at(c,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,i,r,a,o,c;const l=1/this.direction.x,h=1/this.direction.y,d=1/this.direction.z,f=this.origin;return l>=0?(n=(e.min.x-f.x)*l,i=(e.max.x-f.x)*l):(n=(e.max.x-f.x)*l,i=(e.min.x-f.x)*l),h>=0?(r=(e.min.y-f.y)*h,a=(e.max.y-f.y)*h):(r=(e.max.y-f.y)*h,a=(e.min.y-f.y)*h),n>a||r>i||((r>n||isNaN(n))&&(n=r),(a<i||isNaN(i))&&(i=a),d>=0?(o=(e.min.z-f.z)*d,c=(e.max.z-f.z)*d):(o=(e.max.z-f.z)*d,c=(e.min.z-f.z)*d),n>c||o>i)||((o>n||n!==n)&&(n=o),(c<i||i!==i)&&(i=c),i<0)?null:this.at(n>=0?n:i,t)}intersectsBox(e){return this.intersectBox(e,In)!==null}intersectTriangle(e,t,n,i,r){const a=this.origin,o=this.direction,c=o.x,l=o.y,h=o.z,d=e.x-a.x,f=e.y-a.y,u=e.z-a.z,g=t.x-a.x,v=t.y-a.y,p=t.z-a.z,m=n.x-a.x,T=n.y-a.y,A=n.z-a.z,x=Math.abs(c),M=Math.abs(l),y=Math.abs(h);let w,_,E,C,P,D,F,I,z,Y,B,W;if(x>=M&&x>=y?(E=c,D=d,z=g,W=m,c>=0?(w=l,_=h,C=f,P=u,F=v,I=p,Y=T,B=A):(w=h,_=l,C=u,P=f,F=p,I=v,Y=A,B=T)):M>=y?(E=l,D=f,z=v,W=T,l>=0?(w=h,_=c,C=u,P=d,F=p,I=g,Y=A,B=m):(w=c,_=h,C=d,P=u,F=g,I=p,Y=m,B=A)):(E=h,D=u,z=p,W=A,h>=0?(w=c,_=l,C=d,P=f,F=g,I=v,Y=m,B=T):(w=l,_=c,C=f,P=d,F=v,I=g,Y=T,B=m)),E===0)return null;const V=w/E,K=_/E,Z=1/E,de=C-V*D,ve=P-K*D,Xe=F-V*z,qe=I-K*z,$e=Y-V*W,j=B-K*W,te=$e*qe-j*Xe,xe=de*j-ve*$e,Ie=Xe*ve-qe*de;if(i){if(te<0||xe<0||Ie<0)return null}else if((te<0||xe<0||Ie<0)&&(te>0||xe>0||Ie>0))return null;const ge=te+xe+Ie;if(ge===0)return null;const Oe=Z*(te*D+xe*z+Ie*W);return(ge>0?Oe<0:Oe>0)?null:this.at(Oe/ge,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class jn extends hn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ce(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ei,this.combine=zl,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const Pc=new Ue,ai=new Fr,Vs=new En,Ic=new k,Ws=new k,Xs=new k,qs=new k,ma=new k,Ys=new k,Lc=new k,Ks=new k;class It extends ht{constructor(e=new Bt,t=new jn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=i.length;r<a;r++){const o=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){const n=this.geometry,i=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(i,e);const o=this.morphTargetInfluences;if(r&&o){Ys.set(0,0,0);for(let c=0,l=r.length;c<l;c++){const h=o[c],d=r[c];h!==0&&(ma.fromBufferAttribute(d,e),a?Ys.addScaledVector(ma,h):Ys.addScaledVector(ma.sub(t),h))}t.add(Ys)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){const n=this.geometry,i=this.material,r=this.matrixWorld;i!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Vs.copy(n.boundingSphere),Vs.applyMatrix4(r),ai.copy(e.ray).recast(e.near),!(Vs.containsPoint(ai.origin)===!1&&(ai.intersectSphere(Vs,Ic)===null||ai.origin.distanceToSquared(Ic)>(e.far-e.near)**2))&&(Pc.copy(r).invert(),ai.copy(e.ray).applyMatrix4(Pc),!(n.boundingBox!==null&&ai.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,ai)))}_computeIntersections(e,t,n){let i;const r=this.geometry,a=this.material,o=r.index,c=r.attributes.position,l=r.attributes.uv,h=r.attributes.uv1,d=r.attributes.normal,f=r.groups,u=r.drawRange;if(o!==null)if(Array.isArray(a))for(let g=0,v=f.length;g<v;g++){const p=f[g],m=a[p.materialIndex],T=Math.max(p.start,u.start),A=Math.min(o.count,Math.min(p.start+p.count,u.start+u.count));for(let x=T,M=A;x<M;x+=3){const y=o.getX(x),w=o.getX(x+1),_=o.getX(x+2);i=$s(this,m,e,n,l,h,d,y,w,_),i&&(i.faceIndex=Math.floor(x/3),i.face.materialIndex=p.materialIndex,t.push(i))}}else{const g=Math.max(0,u.start),v=Math.min(o.count,u.start+u.count);for(let p=g,m=v;p<m;p+=3){const T=o.getX(p),A=o.getX(p+1),x=o.getX(p+2);i=$s(this,a,e,n,l,h,d,T,A,x),i&&(i.faceIndex=Math.floor(p/3),t.push(i))}}else if(c!==void 0)if(Array.isArray(a))for(let g=0,v=f.length;g<v;g++){const p=f[g],m=a[p.materialIndex],T=Math.max(p.start,u.start),A=Math.min(c.count,Math.min(p.start+p.count,u.start+u.count));for(let x=T,M=A;x<M;x+=3){const y=x,w=x+1,_=x+2;i=$s(this,m,e,n,l,h,d,y,w,_),i&&(i.faceIndex=Math.floor(x/3),i.face.materialIndex=p.materialIndex,t.push(i))}}else{const g=Math.max(0,u.start),v=Math.min(c.count,u.start+u.count);for(let p=g,m=v;p<m;p+=3){const T=p,A=p+1,x=p+2;i=$s(this,a,e,n,l,h,d,T,A,x),i&&(i.faceIndex=Math.floor(p/3),t.push(i))}}}}function Iu(s,e,t,n,i,r,a,o){let c;if(e.side===Nt?c=n.intersectTriangle(a,r,i,!0,o):c=n.intersectTriangle(i,r,a,e.side===Qn,o),c===null)return null;Ks.copy(o),Ks.applyMatrix4(s.matrixWorld);const l=t.ray.origin.distanceTo(Ks);return l<t.near||l>t.far?null:{distance:l,point:Ks.clone(),object:s}}function $s(s,e,t,n,i,r,a,o,c,l){s.getVertexPosition(o,Ws),s.getVertexPosition(c,Xs),s.getVertexPosition(l,qs);const h=Iu(s,e,t,n,Ws,Xs,qs,Lc);if(h){const d=new k;rn.getBarycoord(Lc,Ws,Xs,qs,d),i&&(h.uv=rn.getInterpolatedAttribute(i,o,c,l,d,new ke)),r&&(h.uv1=rn.getInterpolatedAttribute(r,o,c,l,d,new ke)),a&&(h.normal=rn.getInterpolatedAttribute(a,o,c,l,d,new k),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));const f={a:o,b:c,c:l,normal:new k,materialIndex:0};rn.getNormal(Ws,Xs,qs,f.normal),h.face=f,h.barycoord=d}return h}const ns=new it,Dc=new it,Uc=new it,Lu=new it,Nc=new Ue,Zs=new k,ga=new En,Fc=new Ue,_a=new Fr;class Du extends It{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=pc,this.bindMatrix=new Ue,this.bindMatrixInverse=new Ue,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){const e=this.geometry;this.boundingBox===null&&(this.boundingBox=new dn),this.boundingBox.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,Zs),this.boundingBox.expandByPoint(Zs)}computeBoundingSphere(){const e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new En),this.boundingSphere.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,Zs),this.boundingSphere.expandByPoint(Zs)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){const n=this.material,i=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),ga.copy(this.boundingSphere),ga.applyMatrix4(i),e.ray.intersectsSphere(ga)!==!1&&(Fc.copy(i).invert(),_a.copy(e.ray).applyMatrix4(Fc),!(this.boundingBox!==null&&_a.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,_a)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){const e=new it,t=this.geometry.attributes.skinWeight;for(let n=0,i=t.count;n<i;n++){e.fromBufferAttribute(t,n);const r=1/e.manhattanLength();r!==1/0?e.multiplyScalar(r):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===pc?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===Pd?this.bindMatrixInverse.copy(this.bindMatrix).invert():Te("SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){const n=this.skeleton,i=this.geometry;Dc.fromBufferAttribute(i.attributes.skinIndex,e),Uc.fromBufferAttribute(i.attributes.skinWeight,e),t.isVector4?(ns.copy(t),t.set(0,0,0,0)):(ns.set(...t,1),t.set(0,0,0)),ns.applyMatrix4(this.bindMatrix);for(let r=0;r<4;r++){const a=Uc.getComponent(r);if(a!==0){const o=Dc.getComponent(r);Nc.multiplyMatrices(n.bones[o].matrixWorld,n.boneInverses[o]),t.addScaledVector(Lu.copy(ns).applyMatrix4(Nc),a)}}return t.isVector4&&(t.w=ns.w),t.applyMatrix4(this.bindMatrixInverse)}}class uh extends ht{constructor(){super(),this.isBone=!0,this.type="Bone"}}class kr extends Et{constructor(e=null,t=1,n=1,i,r,a,o,c,l=vt,h=vt,d,f){super(null,a,o,c,l,h,i,r,d,f),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const kc=new Ue,Uu=new Ue;class Fo{constructor(e=[],t=[]){this.uuid=on(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){const e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){Te("Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,i=this.bones.length;n<i;n++)this.boneInverses.push(new Ue)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){const n=new Ue;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){const e=this.bones,t=this.boneInverses,n=this.boneMatrices,i=this.boneTexture;for(let r=0,a=e.length;r<a;r++){const o=e[r]?e[r].matrixWorld:Uu;kc.multiplyMatrices(o,t[r]),kc.toArray(n,r*16)}i!==null&&(i.needsUpdate=!0)}clone(){return new Fo(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);const t=new Float32Array(e*e*4);t.set(this.boneMatrices);const n=new kr(t,e,e,Vt,Zt);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){const i=this.bones[t];if(i.name===e)return i}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,i=e.bones.length;n<i;n++){const r=e.bones[n];let a=t[r];a===void 0&&(Te("Skeleton: No bone found with UUID:",r),a=new uh),this.bones.push(a),this.boneInverses.push(new Ue().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){const e={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;const t=this.bones,n=this.boneInverses;for(let i=0,r=t.length;i<r;i++){const a=t[i];e.bones.push(a.uuid);const o=n[i];e.boneInverses.push(o.toArray())}return e}}class Tr extends Pt{constructor(e,t,n,i=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=i}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const Ai=new Ue,Oc=new Ue,js=[],Bc=new dn,Nu=new Ue,is=new It,ss=new En;class Fu extends It{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Tr(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let i=0;i<n;i++)this.setMatrixAt(i,Nu)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new dn),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Ai),Bc.copy(e.boundingBox).applyMatrix4(Ai),this.boundingBox.union(Bc)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new En),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Ai),ss.copy(e.boundingSphere).applyMatrix4(Ai),this.boundingSphere.union(ss)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){const n=t.morphTargetInfluences,i=this.morphTexture.source.data.data,r=n.length+1,a=e*r+1;for(let o=0;o<n.length;o++)n[o]=i[a+o]}raycast(e,t){const n=this.matrixWorld,i=this.count;if(is.geometry=this.geometry,is.material=this.material,is.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),ss.copy(this.boundingSphere),ss.applyMatrix4(n),e.ray.intersectsSphere(ss)!==!1))for(let r=0;r<i;r++){this.getMatrixAt(r,Ai),Oc.multiplyMatrices(n,Ai),is.matrixWorld=Oc,is.raycast(e,js);for(let a=0,o=js.length;a<o;a++){const c=js[a];c.instanceId=r,c.object=this,t.push(c)}js.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new Tr(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){const n=t.morphTargetInfluences,i=n.length+1;this.morphTexture===null&&(this.morphTexture=new kr(new Float32Array(i*this.count),i,this.count,Ao,Zt));const r=this.morphTexture.source.data.data;let a=0;for(let l=0;l<n.length;l++)a+=n[l];const o=this.geometry.morphTargetsRelative?1:1-a,c=i*e;return r[c]=o,r.set(n,c+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}}const oi=new En,ku=new ke(.5,.5),Js=new k;class ko{constructor(e=new Kn,t=new Kn,n=new Kn,i=new Kn,r=new Kn,a=new Kn){this.planes=[e,t,n,i,r,a]}set(e,t,n,i,r,a){const o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(i),o[4].copy(r),o[5].copy(a),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Mn,n=!1){const i=this.planes,r=e.elements,a=r[0],o=r[1],c=r[2],l=r[3],h=r[4],d=r[5],f=r[6],u=r[7],g=r[8],v=r[9],p=r[10],m=r[11],T=r[12],A=r[13],x=r[14],M=r[15];if(i[0].setComponents(l-a,u-h,m-g,M-T).normalize(),i[1].setComponents(l+a,u+h,m+g,M+T).normalize(),i[2].setComponents(l+o,u+d,m+v,M+A).normalize(),i[3].setComponents(l-o,u-d,m-v,M-A).normalize(),n)i[4].setComponents(c,f,p,x).normalize(),i[5].setComponents(l-c,u-f,m-p,M-x).normalize();else if(i[4].setComponents(l-c,u-f,m-p,M-x).normalize(),t===Mn)i[5].setComponents(l+c,u+f,m+p,M+x).normalize();else if(t===ys)i[5].setComponents(c,f,p,x).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),oi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),oi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(oi)}intersectsSprite(e){oi.center.set(0,0,0);const t=ku.distanceTo(e.center);return oi.radius=.7071067811865476+t,oi.applyMatrix4(e.matrixWorld),this.intersectsSphere(oi)}intersectsSphere(e){const t=this.planes,n=e.center,i=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<i)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const i=t[n];if(Js.x=i.normal.x>0?e.max.x:e.min.x,Js.y=i.normal.y>0?e.max.y:e.min.y,Js.z=i.normal.z>0?e.max.z:e.min.z,i.distanceToPoint(Js)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class fh extends hn{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Ce(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const Ar=new k,Rr=new k,zc=new Ue,rs=new Fr,Qs=new En,va=new k,Gc=new k;class Oo extends ht{constructor(e=new Bt,t=new fh){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[0];for(let i=1,r=t.count;i<r;i++)Ar.fromBufferAttribute(t,i-1),Rr.fromBufferAttribute(t,i),n[i]=n[i-1],n[i]+=Ar.distanceTo(Rr);e.setAttribute("lineDistance",new ln(n,1))}else Te("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){const n=this.geometry,i=this.matrixWorld,r=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Qs.copy(n.boundingSphere),Qs.applyMatrix4(i),Qs.radius+=r,e.ray.intersectsSphere(Qs)===!1)return;zc.copy(i).invert(),rs.copy(e.ray).applyMatrix4(zc);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=o*o,l=this.isLineSegments?2:1,h=n.index,f=n.attributes.position;if(h!==null){const u=Math.max(0,a.start),g=Math.min(h.count,a.start+a.count);for(let v=u,p=g-1;v<p;v+=l){const m=h.getX(v),T=h.getX(v+1),A=er(this,e,rs,c,m,T,v);A&&t.push(A)}if(this.isLineLoop){const v=h.getX(g-1),p=h.getX(u),m=er(this,e,rs,c,v,p,g-1);m&&t.push(m)}}else{const u=Math.max(0,a.start),g=Math.min(f.count,a.start+a.count);for(let v=u,p=g-1;v<p;v+=l){const m=er(this,e,rs,c,v,v+1,v);m&&t.push(m)}if(this.isLineLoop){const v=er(this,e,rs,c,g-1,u,g-1);v&&t.push(v)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=i.length;r<a;r++){const o=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}function er(s,e,t,n,i,r,a){const o=s.geometry.attributes.position;if(Ar.fromBufferAttribute(o,i),Rr.fromBufferAttribute(o,r),t.distanceSqToSegment(Ar,Rr,va,Gc)>n)return;va.applyMatrix4(s.matrixWorld);const l=e.ray.origin.distanceTo(va);if(!(l<e.near||l>e.far))return{distance:l,point:Gc.clone().applyMatrix4(s.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:s}}const Hc=new k,Vc=new k;class Ou extends Oo{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[];for(let i=0,r=t.count;i<r;i+=2)Hc.fromBufferAttribute(t,i),Vc.fromBufferAttribute(t,i+1),n[i]=i===0?0:n[i-1],n[i+1]=n[i]+Hc.distanceTo(Vc);e.setAttribute("lineDistance",new ln(n,1))}else Te("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class Bu extends Oo{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}}class ph extends hn{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Ce(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const Wc=new Ue,go=new Fr,tr=new En,nr=new k;class zu extends ht{constructor(e=new Bt,t=new ph){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){const n=this.geometry,i=this.matrixWorld,r=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),tr.copy(n.boundingSphere),tr.applyMatrix4(i),tr.radius+=r,e.ray.intersectsSphere(tr)===!1)return;Wc.copy(i).invert(),go.copy(e.ray).applyMatrix4(Wc);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=o*o,l=n.index,d=n.attributes.position;if(l!==null){const f=Math.max(0,a.start),u=Math.min(l.count,a.start+a.count);for(let g=f,v=u;g<v;g++){const p=l.getX(g);nr.fromBufferAttribute(d,p),Xc(nr,p,c,i,e,t,this)}}else{const f=Math.max(0,a.start),u=Math.min(d.count,a.start+a.count);for(let g=f,v=u;g<v;g++)nr.fromBufferAttribute(d,g),Xc(nr,g,c,i,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=i.length;r<a;r++){const o=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}function Xc(s,e,t,n,i,r,a){const o=go.distanceSqToPoint(s);if(o<t){const c=new k;go.closestPointToPoint(s,c),c.applyMatrix4(n);const l=i.ray.origin.distanceTo(c);if(l<i.near||l>i.far)return;r.push({distance:l,distanceToRay:Math.sqrt(o),point:c,index:e,face:null,faceIndex:null,barycoord:null,object:a})}}class mh extends Et{constructor(e=[],t=ui,n,i,r,a,o,c,l,h){super(e,t,n,i,r,a,o,c,l,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class ws extends Et{constructor(e,t,n=yn,i,r,a,o=vt,c=vt,l,h=kn,d=1){if(h!==kn&&h!==hi)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const f={width:e,height:t,depth:d};super(f,i,r,a,o,c,h,n,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new No(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}}class Gu extends ws{constructor(e,t=yn,n=ui,i,r,a=vt,o=vt,c,l=kn){const h={width:e,height:e,depth:1},d=[h,h,h,h,h,h];super(e,e,t,n,i,r,a,o,c,l),this.image=d,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}}class gh extends Et{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class As extends Bt{constructor(e=1,t=1,n=1,i=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:i,heightSegments:r,depthSegments:a};const o=this;i=Math.floor(i),r=Math.floor(r),a=Math.floor(a);const c=[],l=[],h=[],d=[];let f=0,u=0;g("z","y","x",-1,-1,n,t,e,a,r,0),g("z","y","x",1,-1,n,t,-e,a,r,1),g("x","z","y",1,1,e,n,t,i,a,2),g("x","z","y",1,-1,e,n,-t,i,a,3),g("x","y","z",1,-1,e,t,n,i,r,4),g("x","y","z",-1,-1,e,t,-n,i,r,5),this.setIndex(c),this.setAttribute("position",new ln(l,3)),this.setAttribute("normal",new ln(h,3)),this.setAttribute("uv",new ln(d,2));function g(v,p,m,T,A,x,M,y,w,_,E){const C=x/w,P=M/_,D=x/2,F=M/2,I=y/2,z=w+1,Y=_+1;let B=0,W=0;const V=new k;for(let K=0;K<Y;K++){const Z=K*P-F;for(let de=0;de<z;de++){const ve=de*C-D;V[v]=ve*T,V[p]=Z*A,V[m]=I,l.push(V.x,V.y,V.z),V[v]=0,V[p]=0,V[m]=y>0?1:-1,h.push(V.x,V.y,V.z),d.push(de/w),d.push(1-K/_),B+=1}}for(let K=0;K<_;K++)for(let Z=0;Z<w;Z++){const de=f+Z+z*K,ve=f+Z+z*(K+1),Xe=f+(Z+1)+z*(K+1),qe=f+(Z+1)+z*K;c.push(de,ve,qe),c.push(ve,Xe,qe),W+=6}o.addGroup(u,W,E),u+=W,f+=B}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new As(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}class Or extends Bt{constructor(e=1,t=1,n=1,i=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:i};const r=e/2,a=t/2,o=Math.floor(n),c=Math.floor(i),l=o+1,h=c+1,d=e/o,f=t/c,u=[],g=[],v=[],p=[];for(let m=0;m<h;m++){const T=m*f-a;for(let A=0;A<l;A++){const x=A*d-r;g.push(x,-T,0),v.push(0,0,1),p.push(A/o),p.push(1-m/c)}}for(let m=0;m<c;m++)for(let T=0;T<o;T++){const A=T+l*m,x=T+l*(m+1),M=T+1+l*(m+1),y=T+1+l*m;u.push(A,x,y),u.push(x,M,y)}this.setIndex(u),this.setAttribute("position",new ln(g,3)),this.setAttribute("normal",new ln(v,3)),this.setAttribute("uv",new ln(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Or(e.width,e.height,e.widthSegments,e.heightSegments)}}function Xi(s){const e={};for(const t in s){e[t]={};for(const n in s[t]){const i=s[t][n];if(qc(i))i.isRenderTargetTexture?(Te("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=i.clone();else if(Array.isArray(i))if(qc(i[0])){const r=[];for(let a=0,o=i.length;a<o;a++)r[a]=i[a].clone();e[t][n]=r}else e[t][n]=i.slice();else e[t][n]=i}}return e}function Ut(s){const e={};for(let t=0;t<s.length;t++){const n=Xi(s[t]);for(const i in n)e[i]=n[i]}return e}function qc(s){return s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)}function Hu(s){const e=[];for(let t=0;t<s.length;t++)e.push(s[t].clone());return e}function _h(s){const e=s.getRenderTarget();return e===null?s.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Be.workingColorSpace}const Vu={clone:Xi,merge:Ut};var Wu=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Xu=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class wn extends hn{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Wu,this.fragmentShader=Xu,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Xi(e.uniforms),this.uniformsGroups=Hu(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const i in this.uniforms){const a=this.uniforms[i].value;a&&a.isTexture?t.uniforms[i]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[i]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[i]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[i]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[i]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[i]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[i]={type:"m4",value:a.toArray()}:t.uniforms[i]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const i in this.extensions)this.extensions[i]===!0&&(n[i]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(const n in e.uniforms){const i=e.uniforms[n];switch(this.uniforms[n]={},i.type){case"t":this.uniforms[n].value=t[i.value]||null;break;case"c":this.uniforms[n].value=new Ce().setHex(i.value);break;case"v2":this.uniforms[n].value=new ke().fromArray(i.value);break;case"v3":this.uniforms[n].value=new k().fromArray(i.value);break;case"v4":this.uniforms[n].value=new it().fromArray(i.value);break;case"m3":this.uniforms[n].value=new Le().fromArray(i.value);break;case"m4":this.uniforms[n].value=new Ue().fromArray(i.value);break;default:this.uniforms[n].value=i.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(const n in e.extensions)this.extensions[n]=e.extensions[n];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}}class qu extends wn{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class Bo extends hn{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Ce(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ce(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Ms,this.normalScale=new ke(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ei,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class Tn extends Bo{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new ke(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return Ve(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new Ce(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Ce(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Ce(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._retroreflectivity=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get retroreflectivity(){return this._retroreflectivity}set retroreflectivity(e){this._retroreflectivity>0!=e>0&&this.version++,this._retroreflectivity=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.retroreflectivity=e.retroreflectivity,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}}class Yu extends hn{constructor(e){super(),this.isMeshToonMaterial=!0,this.defines={TOON:""},this.type="MeshToonMaterial",this.color=new Ce(16777215),this.map=null,this.gradientMap=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ce(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Ms,this.normalScale=new ke(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.alphaMap=null,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.gradientMap=e.gradientMap,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.alphaMap=e.alphaMap,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}class Ku extends hn{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Ud,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class $u extends hn{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}function $n(s,e){return!s||s.constructor===e?s:typeof e.BYTES_PER_ELEMENT=="number"?new e(s):Array.prototype.slice.call(s)}function mr(s){return s!==void 0&&s.inTangents!==void 0&&s.outTangents!==void 0}function Zu(s){function e(i,r){return s[i]-s[r]}const t=s.length,n=new Array(t);for(let i=0;i!==t;++i)n[i]=i;return n.sort(e),n}function Yc(s,e,t){const n=s.length,i=new s.constructor(n);for(let r=0,a=0;a!==n;++r){const o=t[r]*e;for(let c=0;c!==e;++c)i[a++]=s[o+c]}return i}function ju(s,e,t,n){let i=1,r=s[0];for(;r!==void 0&&r[n]===void 0;)r=s[i++];if(r===void 0)return;let a=r[n];if(a!==void 0)if(Array.isArray(a))do a=r[n],a!==void 0&&(e.push(r.time),t.push(...a)),r=s[i++];while(r!==void 0);else if(a.toArray!==void 0)do a=r[n],a!==void 0&&(e.push(r.time),a.toArray(t,t.length)),r=s[i++];while(r!==void 0);else do a=r[n],a!==void 0&&(e.push(r.time),t.push(a)),r=s[i++];while(r!==void 0)}class qi{constructor(e,t,n,i){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=i!==void 0?i:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){const t=this.parameterPositions;let n=this._cachedIndex,i=t[n],r=t[n-1];e:{t:{let a;n:{i:if(!(e<i)){for(let o=n+2;;){if(i===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(r=i,i=t[++n],e<i)break t}a=t.length;break n}if(!(e>=r)){const o=t[1];e<o&&(n=2,r=o);for(let c=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===c)break;if(i=r,r=t[--n-1],e>=r)break t}a=n,n=0;break n}break e}for(;n<a;){const o=n+a>>>1;e<t[o]?a=o:n=o+1}if(i=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,i)}return this.interpolate_(n,r,e,i)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,r=e*i;for(let a=0;a!==i;++a)t[a]=n[r+a];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}}class Ju extends qi{constructor(e,t,n,i){super(e,t,n,i),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Ni,endingEnd:Ni}}intervalChanged_(e,t,n){const i=this.parameterPositions;let r=e-2,a=e+1,o=i[r],c=i[a];if(o===void 0)switch(this.getSettings_().endingStart){case Fi:r=e,o=2*t-n;break;case Sr:r=i.length-2,o=t+i[r]-i[r+1];break;default:r=e,o=n}if(c===void 0)switch(this.getSettings_().endingEnd){case Fi:a=e,c=2*n-t;break;case Sr:a=1,c=n+i[1]-i[0];break;default:a=e-1,c=t}const l=(n-t)*.5,h=this.valueSize;this._weightPrev=l/(t-o),this._weightNext=l/(c-n),this._offsetPrev=r*h,this._offsetNext=a*h}interpolate_(e,t,n,i){const r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,l=c-o,h=this._offsetPrev,d=this._offsetNext,f=this._weightPrev,u=this._weightNext,g=(n-t)/(i-t),v=g*g,p=v*g,m=-f*p+2*f*v-f*g,T=(1+f)*p+(-1.5-2*f)*v+(-.5+f)*g+1,A=(-1-u)*p+(1.5+u)*v+.5*g,x=u*p-u*v;for(let M=0;M!==o;++M)r[M]=m*a[h+M]+T*a[l+M]+A*a[c+M]+x*a[d+M];return r}}class vh extends qi{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){const r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,l=c-o,h=(n-t)/(i-t),d=1-h;for(let f=0;f!==o;++f)r[f]=a[l+f]*d+a[c+f]*h;return r}}class Qu extends qi{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e){return this.copySampleValue_(e-1)}}class ef extends qi{interpolate_(e,t,n,i){const r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,l=c-o,h=this.inTangents,d=this.outTangents;if(!h||!d){const g=(n-t)/(i-t),v=1-g;for(let p=0;p!==o;++p)r[p]=a[l+p]*v+a[c+p]*g;return r}const f=o*2,u=e-1;for(let g=0;g!==o;++g){const v=a[l+g],p=a[c+g],m=u*f+g*2,T=d[m],A=d[m+1],x=e*f+g*2,M=h[x],y=h[x+1],w=nf(n,t,T,M,i);r[g]=xh(w,v,A,y,p)}return r}}function xh(s,e,t,n,i){const r=1-s;return r*r*r*e+3*r*r*s*t+3*r*s*s*n+s*s*s*i}function tf(s,e,t,n,i){const r=1-s;return 3*r*r*(t-e)+6*r*s*(n-t)+3*s*s*(i-n)}function nf(s,e,t,n,i){let r=(s-e)/(i-e);for(let a=0;a<8;a++){const o=xh(r,e,t,n,i)-s;if(Math.abs(o)<1e-10)break;const c=tf(r,e,t,n,i);if(Math.abs(c)<1e-10)break;r=Math.max(0,Math.min(1,r-o/c))}return r}class un{constructor(e,t,n,i){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=$n(t,this.TimeBufferType),this.values=$n(n,this.ValueBufferType),this.setInterpolation(i||this.DefaultInterpolation)}static toJSON(e){const t=e.constructor;let n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:$n(e.times,Array),values:$n(e.values,Array)};const i=e.getInterpolation();i!==e.DefaultInterpolation&&(n.interpolation=i),mr(e.settings)&&(n.settings={inTangents:$n(e.settings.inTangents,Array),outTangents:$n(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Qu(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new vh(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Ju(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){const t=new ef(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case xs:t=this.InterpolantFactoryMethodDiscrete;break;case bs:t=this.InterpolantFactoryMethodLinear;break;case Kr:t=this.InterpolantFactoryMethodSmooth;break;case mc:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){const n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return Te("KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return xs;case this.InterpolantFactoryMethodLinear:return bs;case this.InterpolantFactoryMethodSmooth:return Kr;case this.InterpolantFactoryMethodBezier:return mc}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){const t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]+=e}return this}scale(e){if(e!==1){const t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]*=e;mr(this.settings)&&(Kc(this.settings.inTangents,e),Kc(this.settings.outTangents,e))}return this}trim(e,t){const n=this.times,i=n.length;let r=0,a=i-1;for(;r!==i&&n[r]<e;)++r;for(;a!==-1&&n[a]>t;)--a;if(++a,r!==0||a!==i){r>=a&&(a=Math.max(a,1),r=a-1);const o=this.getValueSize();this.times=n.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let e=!0;const t=this.getValueSize();t-Math.floor(t)!==0&&(Pe("KeyframeTrack: Invalid value size in track.",this),e=!1);const n=this.times,i=this.values,r=n.length;r===0&&(Pe("KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==r;o++){const c=n[o];if(typeof c=="number"&&isNaN(c)){Pe("KeyframeTrack: Time is not a valid number.",this,o,c),e=!1;break}if(a!==null&&a>c){Pe("KeyframeTrack: Out of order keys.",this,o,c,a),e=!1;break}a=c}if(i!==void 0&&Wd(i))for(let o=0,c=i.length;o!==c;++o){const l=i[o];if(isNaN(l)){Pe("KeyframeTrack: Value is not a valid number.",this,o,l),e=!1;break}}return e}optimize(){const e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),i=this.getInterpolation()===Kr,r=e.length-1;let a=1;for(let o=1;o<r;++o){let c=!1;const l=e[o],h=e[o+1];if(l!==h&&(o!==1||l!==e[0]))if(i)c=!0;else{const d=o*n,f=d-n,u=d+n;for(let g=0;g!==n;++g){const v=t[d+g];if(v!==t[f+g]||v!==t[u+g]){c=!0;break}}}if(c){if(o!==a){e[a]=e[o];const d=o*n,f=a*n;for(let u=0;u!==n;++u)t[f+u]=t[d+u]}++a}}if(r>0){e[a]=e[r];for(let o=r*n,c=a*n,l=0;l!==n;++l)t[c+l]=t[o+l];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*n)):(this.times=e,this.values=t),this}clone(){const e=this.times.slice(),t=this.values.slice(),n=this.constructor,i=new n(this.name,e,t);return i.createInterpolant=this.createInterpolant,mr(this.settings)&&(i.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),i}}function Kc(s,e){for(let t=0,n=s.length;t!==n;t+=2)s[t]*=e}un.prototype.ValueTypeName="";un.prototype.TimeBufferType=Float32Array;un.prototype.ValueBufferType=Float32Array;un.prototype.DefaultInterpolation=bs;class Yi extends un{constructor(e,t,n){super(e,t,n)}}Yi.prototype.ValueTypeName="bool";Yi.prototype.ValueBufferType=Array;Yi.prototype.DefaultInterpolation=xs;Yi.prototype.InterpolantFactoryMethodLinear=void 0;Yi.prototype.InterpolantFactoryMethodSmooth=void 0;class bh extends un{constructor(e,t,n,i){super(e,t,n,i)}}bh.prototype.ValueTypeName="color";class Es extends un{constructor(e,t,n,i){super(e,t,n,i)}}Es.prototype.ValueTypeName="number";class sf extends qi{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){const r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=(n-t)/(i-t);let l=e*o;for(let h=l+o;l!==h;l+=4)jt.slerpFlat(r,0,a,l-o,a,l,c);return r}}class Ts extends un{constructor(e,t,n,i){super(e,t,n,i)}InterpolantFactoryMethodLinear(e){return new sf(this.times,this.values,this.getValueSize(),e)}}Ts.prototype.ValueTypeName="quaternion";Ts.prototype.InterpolantFactoryMethodSmooth=void 0;class Ki extends un{constructor(e,t,n){super(e,t,n)}}Ki.prototype.ValueTypeName="string";Ki.prototype.ValueBufferType=Array;Ki.prototype.DefaultInterpolation=xs;Ki.prototype.InterpolantFactoryMethodLinear=void 0;Ki.prototype.InterpolantFactoryMethodSmooth=void 0;class Cr extends un{constructor(e,t,n,i){super(e,t,n,i)}}Cr.prototype.ValueTypeName="vector";class _o{constructor(e="",t=-1,n=[],i=Io){this.name=e,this.tracks=n,this.duration=t,this.blendMode=i,this.uuid=on(),this.userData={},this.duration<0&&this.resetDuration()}static parse(e){const t=[],n=e.tracks,i=1/(e.fps||1);for(let a=0,o=n.length;a!==o;++a)t.push(af(n[a]).scale(i));const r=new this(e.name,e.duration,t,e.blendMode);return r.uuid=e.uuid,r.userData=JSON.parse(e.userData||"{}"),r}static toJSON(e){const t=[],n=e.tracks,i={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode,userData:JSON.stringify(e.userData)};for(let r=0,a=n.length;r!==a;++r)t.push(un.toJSON(n[r]));return i}static CreateFromMorphTargetSequence(e,t,n,i){const r=t.length,a=[];for(let o=0;o<r;o++){let c=[],l=[];c.push((o+r-1)%r,o,(o+1)%r),l.push(0,1,0);const h=Zu(c);c=Yc(c,1,h),l=Yc(l,1,h),!i&&c[0]===0&&(c.push(r),l.push(l[0])),a.push(new Es(".morphTargetInfluences["+t[o].name+"]",c,l).scale(1/n))}return new this(e,-1,a)}static findByName(e,t){let n=e;if(!Array.isArray(e)){const i=e;n=i.geometry&&i.geometry.animations||i.animations}for(let i=0;i<n.length;i++)if(n[i].name===t)return n[i];return null}static CreateClipsFromMorphTargetSequences(e,t,n){const i={},r=/^([\w-]*?)([\d]+)$/;for(let o=0,c=e.length;o<c;o++){const l=e[o],h=l.name.match(r);if(h&&h.length>1){const d=h[1];let f=i[d];f||(i[d]=f=[]),f.push(l)}}const a=[];for(const o in i)a.push(this.CreateFromMorphTargetSequence(o,i[o],t,n));return a}resetDuration(){const e=this.tracks;let t=0;for(let n=0,i=e.length;n!==i;++n){const r=this.tracks[n];t=Math.max(t,r.times[r.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){const e=[];for(let n=0;n<this.tracks.length;n++)e.push(this.tracks[n].clone());const t=new this.constructor(this.name,this.duration,e,this.blendMode);return t.userData=JSON.parse(JSON.stringify(this.userData)),t}toJSON(){return this.constructor.toJSON(this)}}function rf(s){switch(s.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return Es;case"vector":case"vector2":case"vector3":case"vector4":return Cr;case"color":return bh;case"quaternion":return Ts;case"bool":case"boolean":return Yi;case"string":return Ki}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+s)}function af(s){if(s.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");const e=rf(s.type);if(s.times===void 0){const n=[],i=[];ju(s.keys,n,i,"value"),s.times=n,s.values=i}let t;return e.parse!==void 0?t=e.parse(s):t=new e(s.name,s.times,s.values,s.interpolation),mr(s.settings)&&(t.settings={inTangents:$n(s.settings.inTangents,Float32Array),outTangents:$n(s.settings.outTangents,Float32Array)}),t}const Un={enabled:!1,files:{},add:function(s,e){this.enabled!==!1&&($c(s)||(this.files[s]=e))},get:function(s){if(this.enabled!==!1&&!$c(s))return this.files[s]},remove:function(s){delete this.files[s]},clear:function(){this.files={}}};function $c(s){try{const e=s.slice(s.indexOf(":")+1);return new URL(e).protocol==="blob:"}catch{return!1}}class of{constructor(e,t,n){const i=this;let r=!1,a=0,o=0,c;const l=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(h){o++,r===!1&&i.onStart!==void 0&&i.onStart(h,a,o),r=!0},this.itemEnd=function(h){a++,i.onProgress!==void 0&&i.onProgress(h,a,o),a===o&&(r=!1,i.onLoad!==void 0&&i.onLoad())},this.itemError=function(h){i.onError!==void 0&&i.onError(h)},this.resolveURL=function(h){return h=h.normalize("NFC"),c?c(h):h},this.setURLModifier=function(h){return c=h,this},this.addHandler=function(h,d){return l.push(h,d),this},this.removeHandler=function(h){const d=l.indexOf(h);return d!==-1&&l.splice(d,2),this},this.getHandler=function(h){for(let d=0,f=l.length;d<f;d+=2){const u=l[d],g=l[d+1];if(u.global&&(u.lastIndex=0),u.test(h))return g}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}}const cf=new of;class pi{constructor(e){this.manager=e!==void 0?e:cf,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){const n=this;return new Promise(function(i,r){n.load(e,i,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}}pi.DEFAULT_MATERIAL_NAME="__DEFAULT";const Ln={};class lf extends Error{constructor(e,t){super(e),this.response=t}}class Pr extends pi{constructor(e){super(e),this.mimeType="",this.responseType="",this._abortController=new AbortController}load(e,t,n,i){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=Un.get(`file:${e}`);if(r!==void 0){this.manager.itemStart(e),setTimeout(()=>{t&&t(r),this.manager.itemEnd(e)},0);return}if(Ln[e]!==void 0){Ln[e].push({onLoad:t,onProgress:n,onError:i});return}Ln[e]=[],Ln[e].push({onLoad:t,onProgress:n,onError:i});const a=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",signal:typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),o=this.mimeType,c=this.responseType;fetch(a).then(l=>{if(l.status===200||l.status===0){if(l.status===0&&Te("FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||l.body===void 0||l.body.getReader===void 0)return l;const h=Ln[e],d=l.body.getReader(),f=l.headers.get("X-File-Size")||l.headers.get("Content-Length"),u=f?parseInt(f):0,g=u!==0;let v=0;const p=new ReadableStream({start(m){T();function T(){d.read().then(({done:A,value:x})=>{if(A)m.close();else{v+=x.byteLength;const M=new ProgressEvent("progress",{lengthComputable:g,loaded:v,total:u});for(let y=0,w=h.length;y<w;y++){const _=h[y];_.onProgress&&_.onProgress(M)}m.enqueue(x),T()}},A=>{m.error(A)})}}});return new Response(p)}else throw new lf(`fetch for "${l.url}" responded with ${l.status}: ${l.statusText}`,l)}).then(l=>{switch(c){case"arraybuffer":return l.arrayBuffer();case"blob":return l.blob();case"document":return l.text().then(h=>new DOMParser().parseFromString(h,o));case"json":return l.json();default:if(o==="")return l.text();{const d=/charset="?([^;"\s]*)"?/i.exec(o),f=d&&d[1]?d[1].toLowerCase():void 0,u=new TextDecoder(f);return l.arrayBuffer().then(g=>u.decode(g))}}}).then(l=>{Un.add(`file:${e}`,l);const h=Ln[e];delete Ln[e];for(let d=0,f=h.length;d<f;d++){const u=h[d];u.onLoad&&u.onLoad(l)}}).catch(l=>{const h=Ln[e];if(h===void 0)throw this.manager.itemError(e),l;delete Ln[e];for(let d=0,f=h.length;d<f;d++){const u=h[d];u.onError&&u.onError(l)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}}const Ri=new WeakMap;class hf extends pi{constructor(e){super(e)}load(e,t,n,i){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=this,a=Un.get(`image:${e}`);if(a!==void 0){if(a.complete===!0)r.manager.itemStart(e),setTimeout(function(){t&&t(a),r.manager.itemEnd(e)},0);else{let d=Ri.get(a);d===void 0&&(d=[],Ri.set(a,d)),d.push({onLoad:t,onError:i})}return a}const o=Ss("img");function c(){h(),t&&t(this);const d=Ri.get(this)||[];for(let f=0;f<d.length;f++){const u=d[f];u.onLoad&&u.onLoad(this)}Ri.delete(this),r.manager.itemEnd(e)}function l(d){h(),i&&i(d),Un.remove(`image:${e}`);const f=Ri.get(this)||[];for(let u=0;u<f.length;u++){const g=f[u];g.onError&&g.onError(d)}Ri.delete(this),r.manager.itemError(e),r.manager.itemEnd(e)}function h(){o.removeEventListener("load",c,!1),o.removeEventListener("error",l,!1)}return o.addEventListener("load",c,!1),o.addEventListener("error",l,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),Un.add(`image:${e}`,o),r.manager.itemStart(e),o.src=e,o}}class df extends pi{constructor(e){super(e)}load(e,t,n,i){const r=new Et,a=new hf(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(o){r.image=o,r.needsUpdate=!0,t!==void 0&&t(r)},n,i),r}}class Br extends ht{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ce(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}}class uf extends Br{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(ht.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ce(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){const t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}}const xa=new Ue,Zc=new k,jc=new k;class zo{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new ke(512,512),this.mapType=Ht,this.map=null,this.mapPass=null,this.matrix=new Ue,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new ko,this._frameExtents=new ke(1,1),this._viewportCount=1,this._viewports=[new it(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera;Zc.setFromMatrixPosition(e.matrixWorld),t.position.copy(Zc),jc.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(jc),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,i){xa.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(xa,e.coordinateSystem,e.reversedDepth);const r=this._frameExtents,a=i?i.z/r.x:1,o=i?i.w/r.y:1,c=i?i.x/r.x:0,l=i?i.y/r.y:0;e.coordinateSystem===ys||e.reversedDepth?t.set(.5*a,0,0,.5*a+c,0,.5*o,0,.5*o+l,0,0,1,0,0,0,0,1):t.set(.5*a,0,0,.5*a+c,0,.5*o,0,.5*o+l,0,0,.5,.5,0,0,0,1),t.multiply(xa)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}const ir=new k,sr=new jt,mn=new k;class Mh extends ht{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Ue,this.projectionMatrix=new Ue,this.projectionMatrixInverse=new Ue,this.coordinateSystem=Mn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(ir,sr,mn),mn.x===1&&mn.y===1&&mn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(ir,sr,mn.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(ir,sr,mn),mn.x===1&&mn.y===1&&mn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(ir,sr,mn.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}}const qn=new k,Jc=new ke,Qc=new ke;class kt extends Mh{constructor(e=50,t=1,n=.1,i=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=Wi*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(ps*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Wi*2*Math.atan(Math.tan(ps*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){qn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(qn.x,qn.y).multiplyScalar(-e/qn.z),qn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(qn.x,qn.y).multiplyScalar(-e/qn.z)}getViewSize(e,t){return this.getViewBounds(e,Jc,Qc),t.subVectors(Qc,Jc)}setViewOffset(e,t,n,i,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(ps*.5*this.fov)/this.zoom,n=2*t,i=this.aspect*n,r=-.5*i;const a=this.view;if(this.view!==null&&this.view.enabled){const c=a.fullWidth,l=a.fullHeight;r+=a.offsetX*i/c,t-=a.offsetY*n/l,i*=a.width/c,n*=a.height/l}const o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+i,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}class ff extends zo{constructor(){super(new kt(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){const t=this.camera,n=Wi*2*e.angle*this.focus,i=this.mapSize.width/this.mapSize.height*this.aspect,r=e.distance||t.far;(n!==t.fov||i!==t.aspect||r!==t.far)&&(t.fov=n,t.aspect=i,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this.aspect=e.aspect,this}toJSON(){const e=super.toJSON();return e.focus=this.focus,e.aspect=this.aspect,e}}class pf extends Br{constructor(e,t,n=0,i=Math.PI/3,r=0,a=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(ht.DEFAULT_UP),this.updateMatrix(),this.target=new ht,this.distance=n,this.angle=i,this.penumbra=r,this.decay=a,this.map=null,this.shadow=new ff}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.map=e.map,this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.distance=this.distance,t.object.angle=this.angle,t.object.decay=this.decay,t.object.penumbra=this.penumbra,t.object.target=this.target.uuid,this.map&&this.map.isTexture&&(t.object.map=this.map.toJSON(e).uuid),t.object.shadow=this.shadow.toJSON(),t}}class mf extends zo{constructor(){super(new kt(90,1,.5,500)),this.isPointLightShadow=!0}}class gf extends Br{constructor(e,t,n=0,i=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=i,this.shadow=new mf}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.distance=this.distance,t.object.decay=this.decay,t.object.shadow=this.shadow.toJSON(),t}}class Rs extends Mh{constructor(e=-1,t=1,n=1,i=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=i,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,i,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2;let r=n-e,a=n+e,o=i+t,c=i-t;if(this.view!==null&&this.view.enabled){const l=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=l*this.view.offsetX,a=r+l*this.view.width,o-=h*this.view.offsetY,c=o-h*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,c,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class _f extends zo{constructor(){super(new Rs(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class gr extends Br{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(ht.DEFAULT_UP),this.updateMatrix(),this.target=new ht,this.shadow=new _f}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}}class Jn{static extractUrlBase(e){const t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}}const ba=new WeakMap;class vf extends pi{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&Te("ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&Te("ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"},this._abortController=new AbortController}setOptions(e){return this.options=e,this}load(e,t,n,i){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=this,a=Un.get(`image-bitmap:${e}`);if(a!==void 0){if(r.manager.itemStart(e),a.then){a.then(l=>{ba.has(a)===!0?(i&&i(ba.get(a)),r.manager.itemError(e),r.manager.itemEnd(e)):(t&&t(l),r.manager.itemEnd(e))});return}setTimeout(function(){t&&t(a),r.manager.itemEnd(e)},0);return}const o={};o.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",o.headers=this.requestHeader,o.signal=typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal;const c=fetch(e,o).then(function(l){return l.blob()}).then(function(l){return createImageBitmap(l,Object.assign({},r.options,{colorSpaceConversion:"none"}))}).then(function(l){return Un.add(`image-bitmap:${e}`,l),t&&t(l),r.manager.itemEnd(e),l}).catch(function(l){i&&i(l),ba.set(c,l),Un.remove(`image-bitmap:${e}`),r.manager.itemError(e),r.manager.itemEnd(e)});Un.add(`image-bitmap:${e}`,c),r.manager.itemStart(e)}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}}const Ci=-90,Pi=1;class xf extends ht{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const i=new kt(Ci,Pi,e,t);i.layers=this.layers,this.add(i);const r=new kt(Ci,Pi,e,t);r.layers=this.layers,this.add(r);const a=new kt(Ci,Pi,e,t);a.layers=this.layers,this.add(a);const o=new kt(Ci,Pi,e,t);o.layers=this.layers,this.add(o);const c=new kt(Ci,Pi,e,t);c.layers=this.layers,this.add(c);const l=new kt(Ci,Pi,e,t);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,i,r,a,o,c]=t;for(const l of t)this.remove(l);if(e===Mn)n.up.set(0,1,0),n.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(e===ys)n.up.set(0,-1,0),n.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const l of t)this.add(l),l.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:i}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,a,o,c,l,h]=this.children,d=e.getRenderTarget(),f=e.getActiveCubeFace(),u=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;const v=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let p=!1;e.isWebGLRenderer===!0?p=e.state.buffers.depth.getReversed():p=e.reversedDepthBuffer,e.setRenderTarget(n,0,i),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(n,1,i),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,i),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,i),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),e.setRenderTarget(n,4,i),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),n.texture.generateMipmaps=v,e.setRenderTarget(n,5,i),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,h),e.setRenderTarget(d,f,u),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}}class bf extends kt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}class Mf{constructor(e,t,n){this.binding=e,this.valueSize=n;let i,r,a;switch(t){case"quaternion":i=this._slerp,r=this._slerpAdditive,a=this._setAdditiveIdentityQuaternion,this.buffer=new Float64Array(n*6),this._workIndex=5;break;case"string":case"bool":i=this._select,r=this._select,a=this._setAdditiveIdentityOther,this.buffer=new Array(n*5);break;default:i=this._lerp,r=this._lerpAdditive,a=this._setAdditiveIdentityNumeric,this.buffer=new Float64Array(n*5)}this._mixBufferRegion=i,this._mixBufferRegionAdditive=r,this._setIdentity=a,this._origIndex=3,this._addIndex=4,this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,this.useCount=0,this.referenceCount=0}accumulate(e,t){const n=this.buffer,i=this.valueSize,r=e*i+i;let a=this.cumulativeWeight;if(a===0){for(let o=0;o!==i;++o)n[r+o]=n[o];a=t}else{a+=t;const o=t/a;this._mixBufferRegion(n,r,0,o,i)}this.cumulativeWeight=a}accumulateAdditive(e){const t=this.buffer,n=this.valueSize,i=n*this._addIndex;this.cumulativeWeightAdditive===0&&this._setIdentity(),this._mixBufferRegionAdditive(t,i,0,e,n),this.cumulativeWeightAdditive+=e}apply(e){const t=this.valueSize,n=this.buffer,i=e*t+t,r=this.cumulativeWeight,a=this.cumulativeWeightAdditive,o=this.binding;if(this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,r<1){const c=t*this._origIndex;this._mixBufferRegion(n,i,c,1-r,t)}a>0&&this._mixBufferRegionAdditive(n,i,this._addIndex*t,1,t);for(let c=t,l=t+t;c!==l;++c)if(n[c]!==n[c+t]){o.setValue(n,i);break}}saveOriginalState(){const e=this.binding,t=this.buffer,n=this.valueSize,i=n*this._origIndex;e.getValue(t,i);for(let r=n,a=i;r!==a;++r)t[r]=t[i+r%n];this._setIdentity(),this.cumulativeWeight=0,this.cumulativeWeightAdditive=0}restoreOriginalState(){const e=this.valueSize*3;this.binding.setValue(this.buffer,e)}_setAdditiveIdentityNumeric(){const e=this._addIndex*this.valueSize,t=e+this.valueSize;for(let n=e;n<t;n++)this.buffer[n]=0}_setAdditiveIdentityQuaternion(){this._setAdditiveIdentityNumeric(),this.buffer[this._addIndex*this.valueSize+3]=1}_setAdditiveIdentityOther(){const e=this._origIndex*this.valueSize,t=this._addIndex*this.valueSize;for(let n=0;n<this.valueSize;n++)this.buffer[t+n]=this.buffer[e+n]}_select(e,t,n,i,r){if(i>=.5)for(let a=0;a!==r;++a)e[t+a]=e[n+a]}_slerp(e,t,n,i){jt.slerpFlat(e,t,e,t,e,n,i)}_slerpAdditive(e,t,n,i,r){const a=this._workIndex*r;jt.multiplyQuaternionsFlat(e,a,e,t,e,n),jt.slerpFlat(e,t,e,t,e,a,i)}_lerp(e,t,n,i,r){const a=1-i;for(let o=0;o!==r;++o){const c=t+o;e[c]=e[c]*a+e[n+o]*i}}_lerpAdditive(e,t,n,i,r){for(let a=0;a!==r;++a){const o=t+a;e[o]=e[o]+e[n+a]*i}}}const Go="\\[\\]\\.:\\/",yf=new RegExp("["+Go+"]","g"),Ho="[^"+Go+"]",Sf="[^"+Go.replace("\\.","")+"]",wf=/((?:WC+[\/:])*)/.source.replace("WC",Ho),Ef=/(WCOD+)?/.source.replace("WCOD",Sf),Tf=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Ho),Af=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Ho),Rf=new RegExp("^"+wf+Ef+Tf+Af+"$"),Cf=["material","materials","bones","map"];class Pf{constructor(e,t,n){const i=n||Je.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,i)}getValue(e,t){this.bind();const n=this._targetGroup.nCachedObjects_,i=this._bindings[n];i!==void 0&&i.getValue(e,t)}setValue(e,t){const n=this._bindings;for(let i=this._targetGroup.nCachedObjects_,r=n.length;i!==r;++i)n[i].setValue(e,t)}bind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}}class Je{constructor(e,t,n){this.path=t,this.parsedPath=n||Je.parseTrackName(t),this.node=Je.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new Je.Composite(e,t,n):new Je(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(yf,"")}static parseTrackName(e){const t=Rf.exec(e);if(t===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+e);const n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},i=n.nodeName&&n.nodeName.lastIndexOf(".");if(i!==void 0&&i!==-1){const r=n.nodeName.substring(i+1);Cf.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,i),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){const n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){const n=function(r){for(let a=0;a<r.length;a++){const o=r[a];if(o.name===t||o.uuid===t)return o;const c=n(o.children);if(c)return c}return null},i=n(e.children);if(i)return i}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)e[t++]=n[i]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++]}_setValue_array_setNeedsUpdate(e,t){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node;const t=this.parsedPath,n=t.objectName,i=t.propertyName;let r=t.propertyIndex;if(e||(e=Je.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){Te("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let l=t.objectIndex;switch(n){case"materials":if(!e.material){Pe("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){Pe("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){Pe("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===l){l=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){Pe("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){Pe("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){Pe("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(l!==void 0){if(e[l]===void 0){Pe("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[l]}}const a=e[i];if(a===void 0){const l=t.nodeName;Pe("PropertyBinding: Trying to update property for track: "+l+"."+i+" but it wasn't found.",e);return}let o=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?o=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(r!==void 0){if(i==="morphTargetInfluences"){if(!e.geometry){Pe("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){Pe("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}c=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(c=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=i;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}Je.Composite=Pf;Je.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Je.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Je.prototype.GetterByBindingType=[Je.prototype._getValue_direct,Je.prototype._getValue_array,Je.prototype._getValue_arrayElement,Je.prototype._getValue_toArray];Je.prototype.SetterByBindingTypeAndVersioning=[[Je.prototype._setValue_direct,Je.prototype._setValue_direct_setNeedsUpdate,Je.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Je.prototype._setValue_array,Je.prototype._setValue_array_setNeedsUpdate,Je.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Je.prototype._setValue_arrayElement,Je.prototype._setValue_arrayElement_setNeedsUpdate,Je.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Je.prototype._setValue_fromArray,Je.prototype._setValue_fromArray_setNeedsUpdate,Je.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];class If{constructor(e,t,n=null,i=t.blendMode){this._mixer=e,this._clip=t,this._localRoot=n,this.blendMode=i;const r=t.tracks,a=r.length,o=new Array(a),c={endingStart:Ni,endingEnd:Ni};for(let l=0;l!==a;++l){const h=r[l].createInterpolant(null);o[l]=h,h.settings=c}this._interpolantSettings=c,this._interpolants=o,this._propertyBindings=new Array(a),this._cacheIndex=null,this._byClipCacheIndex=null,this._timeScaleInterpolant=null,this._restoreTimeScale=null,this._weightInterpolant=null,this.loop=nh,this._loopCount=-1,this._startTime=null,this.time=0,this.timeScale=1,this._effectiveTimeScale=1,this.weight=1,this._effectiveWeight=1,this.repetitions=1/0,this.paused=!1,this.enabled=!0,this.clampWhenFinished=!1,this.zeroSlopeAtStart=!0,this.zeroSlopeAtEnd=!0}play(){return this._mixer._activateAction(this),this}stop(){return this._mixer._deactivateAction(this),this.reset()}reset(){return this.paused=!1,this.enabled=!0,this.time=0,this._loopCount=-1,this._startTime=null,this.stopFading().stopWarping()}isRunning(){return this.enabled&&!this.paused&&this.timeScale!==0&&this._startTime===null&&this._mixer._isActiveAction(this)}isScheduled(){return this._mixer._isActiveAction(this)}startAt(e){return this._startTime=e,this}setLoop(e,t){return this.loop=e,this.repetitions=t,this}setEffectiveWeight(e){return this.weight=e,this._effectiveWeight=this.enabled?e:0,this.stopFading()}getEffectiveWeight(){return this._effectiveWeight}fadeIn(e){return this._scheduleFading(e,0,1)}fadeOut(e){return this._scheduleFading(e,1,0)}crossFadeFrom(e,t,n=!1){if(e.fadeOut(t),this.fadeIn(t),n===!0){const i=this._clip.duration,r=e._clip.duration,a=r/i,o=i/r;e._restoreTimeScale=e.timeScale,this._restoreTimeScale=this.timeScale,e.warp(1,a,t),this.warp(o,1,t)}return this}crossFadeTo(e,t,n=!1){return e.crossFadeFrom(this,t,n)}stopFading(){const e=this._weightInterpolant;return e!==null&&(this._weightInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this}setEffectiveTimeScale(e){return this.timeScale=e,this._effectiveTimeScale=this.paused?0:e,this.stopWarping()}getEffectiveTimeScale(){return this._effectiveTimeScale}setDuration(e){return this.timeScale=this._clip.duration/e,this.stopWarping()}syncWith(e){return this.time=e.time,this.timeScale=e.timeScale,this.stopWarping()}halt(e){return this.warp(this._effectiveTimeScale,0,e)}warp(e,t,n){const i=this._mixer,r=i.time,a=this.timeScale;let o=this._timeScaleInterpolant;o===null&&(o=i._lendControlInterpolant(),this._timeScaleInterpolant=o);const c=o.parameterPositions,l=o.sampleValues;return c[0]=r,c[1]=r+n,l[0]=e/a,l[1]=t/a,this}stopWarping(){const e=this._timeScaleInterpolant;return e!==null&&(this._timeScaleInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this._restoreTimeScale=null,this}getMixer(){return this._mixer}getClip(){return this._clip}getRoot(){return this._localRoot||this._mixer._root}_update(e,t,n,i){if(!this.enabled){this._updateWeight(e);return}const r=this._startTime;if(r!==null){const c=(e-r)*n;c<0||n===0?t=0:(this._startTime=null,t=n*c)}t*=this._updateTimeScale(e);const a=this._updateTime(t),o=this._updateWeight(e);if(o>0){const c=this._interpolants,l=this._propertyBindings;switch(this.blendMode){case Ld:for(let h=0,d=c.length;h!==d;++h)c[h].evaluate(a),l[h].accumulateAdditive(o);break;case Io:default:for(let h=0,d=c.length;h!==d;++h)c[h].evaluate(a),l[h].accumulate(i,o)}}}_updateWeight(e){let t=0;if(this.enabled){t=this.weight;const n=this._weightInterpolant;if(n!==null){const i=n.evaluate(e)[0];t*=i,e>n.parameterPositions[1]&&(this.stopFading(),i===0&&(this.enabled=!1))}}return this._effectiveWeight=t,t}_updateTimeScale(e){let t=0;if(!this.paused){t=this.timeScale;const n=this._timeScaleInterpolant;if(n!==null){const i=n.evaluate(e)[0];t*=i,e>n.parameterPositions[1]&&(t===0?this.paused=!0:(this._restoreTimeScale!==null&&(t=this._restoreTimeScale),this.timeScale=t),this.stopWarping())}}return this._effectiveTimeScale=t,t}_updateTime(e){const t=this._clip.duration,n=this.loop;let i=this.time+e,r=this._loopCount;const a=n===Id;if(e===0)return r===-1?i:a&&(r&1)===1?t-i:i;if(n===pr){r===-1&&(this._loopCount=0,this._setEndings(!0,!0,!1));e:{if(i>=t)i=t;else if(i<0)i=0;else{this.time=i;break e}this.clampWhenFinished?this.paused=!0:this.enabled=!1,this.time=i,this._mixer.dispatchEvent({type:"finished",action:this,direction:e<0?-1:1})}}else{if(r===-1&&(e>=0?(r=0,this._setEndings(!0,this.repetitions===0,a)):this._setEndings(this.repetitions===0,!0,a)),i>=t||i<0){const o=Math.floor(i/t);i-=t*o,r+=Math.abs(o);const c=this.repetitions-r;if(c<=0)this.clampWhenFinished?this.paused=!0:this.enabled=!1,i=e>0?t:0,this.time=i,this._mixer.dispatchEvent({type:"finished",action:this,direction:e>0?1:-1});else{if(c===1){const l=e<0;this._setEndings(l,!l,a)}else this._setEndings(!1,!1,a);this._loopCount=r,this.time=i,this._mixer.dispatchEvent({type:"loop",action:this,loopDelta:o})}}else this._loopCount=r,this.time=i;if(a&&(r&1)===1)return t-i}return i}_setEndings(e,t,n){const i=this._interpolantSettings;n?(i.endingStart=Fi,i.endingEnd=Fi):(e?i.endingStart=this.zeroSlopeAtStart?Fi:Ni:i.endingStart=Sr,t?i.endingEnd=this.zeroSlopeAtEnd?Fi:Ni:i.endingEnd=Sr)}_scheduleFading(e,t,n){const i=this._mixer,r=i.time;let a=this._weightInterpolant;a===null&&(a=i._lendControlInterpolant(),this._weightInterpolant=a);const o=a.parameterPositions,c=a.sampleValues;return o[0]=r,c[0]=t,o[1]=r+e,c[1]=n,this}}const Lf=new Float32Array(1);class Df extends ti{constructor(e){super(),this._root=e,this._initMemoryManager(),this._accuIndex=0,this.time=0,this.timeScale=1,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}_bindAction(e,t){const n=e._localRoot||this._root,i=e._clip.tracks,r=i.length,a=e._propertyBindings,o=e._interpolants,c=n.uuid,l=this._bindingsByRootAndName;let h=l[c];h===void 0&&(h={},l[c]=h);for(let d=0;d!==r;++d){const f=i[d],u=f.name;let g=h[u];if(g!==void 0)++g.referenceCount,a[d]=g;else{if(g=a[d],g!==void 0){g._cacheIndex===null&&(++g.referenceCount,this._addInactiveBinding(g,c,u));continue}const v=t&&t._propertyBindings[d].binding.parsedPath;g=new Mf(Je.create(n,u,v),f.ValueTypeName,f.getValueSize()),++g.referenceCount,this._addInactiveBinding(g,c,u),a[d]=g}o[d].resultBuffer=g.buffer}}_activateAction(e){if(!this._isActiveAction(e)){if(e._cacheIndex===null){const n=(e._localRoot||this._root).uuid,i=e._clip.uuid,r=this._actionsByClip[i];this._bindAction(e,r&&r.knownActions[0]),this._addInactiveAction(e,i,n)}const t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){const r=t[n];r.useCount++===0&&(this._lendBinding(r),r.saveOriginalState())}this._lendAction(e)}}_deactivateAction(e){if(this._isActiveAction(e)){const t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){const r=t[n];--r.useCount===0&&(r.restoreOriginalState(),this._takeBackBinding(r))}this._takeBackAction(e)}}_initMemoryManager(){this._actions=[],this._nActiveActions=0,this._actionsByClip={},this._bindings=[],this._nActiveBindings=0,this._bindingsByRootAndName={},this._controlInterpolants=[],this._nActiveControlInterpolants=0;const e=this;this.stats={actions:{get total(){return e._actions.length},get inUse(){return e._nActiveActions}},bindings:{get total(){return e._bindings.length},get inUse(){return e._nActiveBindings}},controlInterpolants:{get total(){return e._controlInterpolants.length},get inUse(){return e._nActiveControlInterpolants}}}}_isActiveAction(e){const t=e._cacheIndex;return t!==null&&t<this._nActiveActions}_addInactiveAction(e,t,n){const i=this._actions,r=this._actionsByClip;let a=r[t];if(a===void 0)a={knownActions:[e],actionByRoot:{}},e._byClipCacheIndex=0,r[t]=a;else{const o=a.knownActions;e._byClipCacheIndex=o.length,o.push(e)}e._cacheIndex=i.length,i.push(e),a.actionByRoot[n]=e}_removeInactiveAction(e){const t=this._actions,n=t[t.length-1],i=e._cacheIndex;n._cacheIndex=i,t[i]=n,t.pop(),e._cacheIndex=null;const r=e._clip.uuid,a=this._actionsByClip,o=a[r],c=o.knownActions,l=c[c.length-1],h=e._byClipCacheIndex;l._byClipCacheIndex=h,c[h]=l,c.pop(),e._byClipCacheIndex=null;const d=o.actionByRoot,f=(e._localRoot||this._root).uuid;delete d[f],c.length===0&&delete a[r],this._removeInactiveBindingsForAction(e)}_removeInactiveBindingsForAction(e){const t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){const r=t[n];--r.referenceCount===0&&this._removeInactiveBinding(r)}}_lendAction(e){const t=this._actions,n=e._cacheIndex,i=this._nActiveActions++,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_takeBackAction(e){const t=this._actions,n=e._cacheIndex,i=--this._nActiveActions,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_addInactiveBinding(e,t,n){const i=this._bindingsByRootAndName,r=this._bindings;let a=i[t];a===void 0&&(a={},i[t]=a),a[n]=e,e._cacheIndex=r.length,r.push(e)}_removeInactiveBinding(e){const t=this._bindings,n=e.binding,i=n.rootNode.uuid,r=n.path,a=this._bindingsByRootAndName,o=a[i],c=t[t.length-1],l=e._cacheIndex;c._cacheIndex=l,t[l]=c,t.pop(),delete o[r],Object.keys(o).length===0&&delete a[i]}_lendBinding(e){const t=this._bindings,n=e._cacheIndex,i=this._nActiveBindings++,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_takeBackBinding(e){const t=this._bindings,n=e._cacheIndex,i=--this._nActiveBindings,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_lendControlInterpolant(){const e=this._controlInterpolants,t=this._nActiveControlInterpolants++;let n=e[t];return n===void 0&&(n=new vh(new Float32Array(2),new Float32Array(2),1,Lf),n.__cacheIndex=t,e[t]=n),n}_takeBackControlInterpolant(e){const t=this._controlInterpolants,n=e.__cacheIndex,i=--this._nActiveControlInterpolants,r=t[i];e.__cacheIndex=i,t[i]=e,r.__cacheIndex=n,t[n]=r}clipAction(e,t,n){const i=t||this._root,r=i.uuid;let a=typeof e=="string"?_o.findByName(i,e):e;const o=a!==null?a.uuid:e,c=this._actionsByClip[o];let l=null;if(n===void 0&&(a!==null?n=a.blendMode:n=Io),c!==void 0){const d=c.actionByRoot[r];if(d!==void 0&&d.blendMode===n)return d;l=c.knownActions[0],a===null&&(a=l._clip)}if(a===null)return null;const h=new If(this,a,t,n);return this._bindAction(h,l),this._addInactiveAction(h,o,r),h}existingAction(e,t){const n=t||this._root,i=n.uuid,r=typeof e=="string"?_o.findByName(n,e):e,a=r?r.uuid:e,o=this._actionsByClip[a];return o!==void 0&&o.actionByRoot[i]||null}stopAllAction(){const e=this._actions,t=this._nActiveActions;for(let n=t-1;n>=0;--n)e[n].stop();return this}update(e){e*=this.timeScale;const t=this._actions,n=this._nActiveActions,i=this.time+=e,r=Math.sign(e),a=this._accuIndex^=1;for(let l=0;l!==n;++l)t[l]._update(i,e,r,a);const o=this._bindings,c=this._nActiveBindings;for(let l=0;l!==c;++l)o[l].apply(a);return this}setTime(e){this.time=0;for(let t=0;t<this._actions.length;t++)this._actions[t].time=0;return this.update(e)}getRoot(){return this._root}uncacheClip(e){const t=this._actions,n=e.uuid,i=this._actionsByClip,r=i[n];if(r!==void 0){const a=r.knownActions;for(let o=0,c=a.length;o!==c;++o){const l=a[o];this._deactivateAction(l);const h=l._cacheIndex,d=t[t.length-1];l._cacheIndex=null,l._byClipCacheIndex=null,d._cacheIndex=h,t[h]=d,t.pop(),this._removeInactiveBindingsForAction(l)}delete i[n]}}uncacheRoot(e){const t=e.uuid,n=this._actionsByClip;for(const a in n){const o=n[a].actionByRoot,c=o[t];c!==void 0&&(this._deactivateAction(c),this._removeInactiveAction(c))}const i=this._bindingsByRootAndName,r=i[t];if(r!==void 0)for(const a in r){const o=r[a];o.restoreOriginalState(),this._removeInactiveBinding(o)}}uncacheAction(e,t){const n=this.existingAction(e,t);n!==null&&(this._deactivateAction(n),this._removeInactiveAction(n))}}const $o=class $o{constructor(e,t,n,i){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,i)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,i){const r=this.elements;return r[0]=e,r[2]=t,r[1]=n,r[3]=i,this}};$o.prototype.isMatrix2=!0;let el=$o;function tl(s,e,t,n){const i=Uf(n);switch(t){case eh:return s*e;case Ao:return s*e/i.components*i.byteLength;case Ro:return s*e/i.components*i.byteLength;case fi:return s*e*2/i.components*i.byteLength;case Co:return s*e*2/i.components*i.byteLength;case th:return s*e*3/i.components*i.byteLength;case Vt:return s*e*4/i.components*i.byteLength;case Po:return s*e*4/i.components*i.byteLength;case hr:case dr:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*8;case ur:case fr:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case Ba:case Ga:return Math.max(s,16)*Math.max(e,8)/4;case Oa:case za:return Math.max(s,8)*Math.max(e,8)/2;case Ha:case Va:case Xa:case qa:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*8;case Wa:case Mr:case Ya:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case Ka:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case $a:return Math.floor((s+4)/5)*Math.floor((e+3)/4)*16;case Za:return Math.floor((s+4)/5)*Math.floor((e+4)/5)*16;case ja:return Math.floor((s+5)/6)*Math.floor((e+4)/5)*16;case Ja:return Math.floor((s+5)/6)*Math.floor((e+5)/6)*16;case Qa:return Math.floor((s+7)/8)*Math.floor((e+4)/5)*16;case eo:return Math.floor((s+7)/8)*Math.floor((e+5)/6)*16;case to:return Math.floor((s+7)/8)*Math.floor((e+7)/8)*16;case no:return Math.floor((s+9)/10)*Math.floor((e+4)/5)*16;case io:return Math.floor((s+9)/10)*Math.floor((e+5)/6)*16;case so:return Math.floor((s+9)/10)*Math.floor((e+7)/8)*16;case ro:return Math.floor((s+9)/10)*Math.floor((e+9)/10)*16;case ao:return Math.floor((s+11)/12)*Math.floor((e+9)/10)*16;case oo:return Math.floor((s+11)/12)*Math.floor((e+11)/12)*16;case co:case lo:case ho:return Math.ceil(s/4)*Math.ceil(e/4)*16;case uo:case fo:return Math.ceil(s/4)*Math.ceil(e/4)*8;case yr:case po:return Math.ceil(s/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Uf(s){switch(s){case Ht:case Zl:return{byteLength:1,components:1};case _s:case jl:case Sn:return{byteLength:2,components:1};case Eo:case To:return{byteLength:2,components:4};case yn:case wo:case Zt:return{byteLength:4,components:1};case Jl:case Ql:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${s}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:So}}));typeof window<"u"&&(window.__THREE__?Te("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=So);function yh(){let s=null,e=!1,t=null,n=null;function i(r,a){n=s.requestAnimationFrame(i),t(r,a)}return{start:function(){e!==!0&&t!==null&&s!==null&&(n=s.requestAnimationFrame(i),e=!0)},stop:function(){s!==null&&s.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){s=r}}}function Nf(s){const e=new WeakMap;function t(o,c){const l=o.array,h=o.usage,d=l.byteLength,f=s.createBuffer();s.bindBuffer(c,f),s.bufferData(c,l,h),o.onUploadCallback();let u;if(l instanceof Float32Array)u=s.FLOAT;else if(typeof Float16Array<"u"&&l instanceof Float16Array)u=s.HALF_FLOAT;else if(l instanceof Uint16Array)o.isFloat16BufferAttribute?u=s.HALF_FLOAT:u=s.UNSIGNED_SHORT;else if(l instanceof Int16Array)u=s.SHORT;else if(l instanceof Uint32Array)u=s.UNSIGNED_INT;else if(l instanceof Int32Array)u=s.INT;else if(l instanceof Int8Array)u=s.BYTE;else if(l instanceof Uint8Array)u=s.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)u=s.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:f,type:u,bytesPerElement:l.BYTES_PER_ELEMENT,version:o.version,size:d}}function n(o,c,l){const h=c.array,d=c.updateRanges;if(s.bindBuffer(l,o),d.length===0)s.bufferSubData(l,0,h);else{d.sort((u,g)=>u.start-g.start);let f=0;for(let u=1;u<d.length;u++){const g=d[f],v=d[u];v.start<=g.start+g.count+1?g.count=Math.max(g.count,v.start+v.count-g.start):(++f,d[f]=v)}d.length=f+1;for(let u=0,g=d.length;u<g;u++){const v=d[u];s.bufferSubData(l,v.start*h.BYTES_PER_ELEMENT,h,v.start,v.count)}c.clearUpdateRanges()}c.onUploadCallback()}function i(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);const c=e.get(o);c&&(s.deleteBuffer(c.buffer),e.delete(o))}function a(o,c){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const h=e.get(o);(!h||h.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const l=e.get(o);if(l===void 0)e.set(o,t(o,c));else if(l.version<o.version){if(l.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(l.buffer,o,c),l.version=o.version}}return{get:i,remove:r,update:a}}var Ff=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,kf=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Of=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Bf=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,zf=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Gf=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Hf=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Vf=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Wf=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,Xf=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,qf=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Yf=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Kf=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,$f=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Zf=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,jf=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Jf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Qf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,ep=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,tp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,np=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,ip=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,sp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,rp=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,ap=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,op=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,cp=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,lp=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,hp=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,dp=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,up="gl_FragColor = linearToOutputTexel( gl_FragColor );",fp=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,pp=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,mp=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,gp=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,_p=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,vp=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,xp=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,bp=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Mp=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,yp=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Sp=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,wp=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Ep=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Tp=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Ap=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,Rp=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureCubeUV( envMap, envMapRotation * retroVec, roughness );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_CUBE_UV
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,Cp=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Pp=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Ip=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Lp=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Dp=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Up=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Np=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Fp=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,kp=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Op=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,Bp=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,zp=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Gp=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Hp=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Vp=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Wp=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Xp=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,qp=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Yp=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Kp=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,$p=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Zp=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,jp=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Jp=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Qp=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,em=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,tm=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,nm=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,im=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,sm=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,rm=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,am=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,om=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,cm=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,lm=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,hm=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,dm=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,um=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,fm=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,pm=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,mm=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,gm=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,_m=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,vm=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,xm=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,bm=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Mm=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,ym=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Sm=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,wm=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Em=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Tm=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Am=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Rm=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Cm=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Pm=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Im=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Lm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Dm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Um=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Nm=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Fm=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,km=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Om=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Bm=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,zm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Gm=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Hm=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Vm=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Wm=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Xm=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,qm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Ym=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Km=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,$m=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Zm=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,jm=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Jm=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Qm=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,e0=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,t0=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,n0=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,i0=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,s0=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,r0=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,a0=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,o0=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,c0=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,l0=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,h0=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,d0=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,u0=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,f0=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,p0=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,m0=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Fe={alphahash_fragment:Ff,alphahash_pars_fragment:kf,alphamap_fragment:Of,alphamap_pars_fragment:Bf,alphatest_fragment:zf,alphatest_pars_fragment:Gf,aomap_fragment:Hf,aomap_pars_fragment:Vf,batching_pars_vertex:Wf,batching_vertex:Xf,begin_vertex:qf,beginnormal_vertex:Yf,bsdfs:Kf,iridescence_fragment:$f,bumpmap_pars_fragment:Zf,clipping_planes_fragment:jf,clipping_planes_pars_fragment:Jf,clipping_planes_pars_vertex:Qf,clipping_planes_vertex:ep,color_fragment:tp,color_pars_fragment:np,color_pars_vertex:ip,color_vertex:sp,common:rp,cube_uv_reflection_fragment:ap,defaultnormal_vertex:op,displacementmap_pars_vertex:cp,displacementmap_vertex:lp,emissivemap_fragment:hp,emissivemap_pars_fragment:dp,colorspace_fragment:up,colorspace_pars_fragment:fp,envmap_fragment:pp,envmap_common_pars_fragment:mp,envmap_pars_fragment:gp,envmap_pars_vertex:_p,envmap_physical_pars_fragment:Rp,envmap_vertex:vp,fog_vertex:xp,fog_pars_vertex:bp,fog_fragment:Mp,fog_pars_fragment:yp,gradientmap_pars_fragment:Sp,lightmap_pars_fragment:wp,lights_lambert_fragment:Ep,lights_lambert_pars_fragment:Tp,lights_pars_begin:Ap,lights_toon_fragment:Cp,lights_toon_pars_fragment:Pp,lights_phong_fragment:Ip,lights_phong_pars_fragment:Lp,lights_physical_fragment:Dp,lights_physical_pars_fragment:Up,lights_fragment_begin:Np,lights_fragment_maps:Fp,lights_fragment_end:kp,lightprobes_pars_fragment:Op,logdepthbuf_fragment:Bp,logdepthbuf_pars_fragment:zp,logdepthbuf_pars_vertex:Gp,logdepthbuf_vertex:Hp,map_fragment:Vp,map_pars_fragment:Wp,map_particle_fragment:Xp,map_particle_pars_fragment:qp,metalnessmap_fragment:Yp,metalnessmap_pars_fragment:Kp,morphinstance_vertex:$p,morphcolor_vertex:Zp,morphnormal_vertex:jp,morphtarget_pars_vertex:Jp,morphtarget_vertex:Qp,normal_fragment_begin:em,normal_fragment_maps:tm,normal_pars_fragment:nm,normal_pars_vertex:im,normal_vertex:sm,normalmap_pars_fragment:rm,clearcoat_normal_fragment_begin:am,clearcoat_normal_fragment_maps:om,clearcoat_pars_fragment:cm,iridescence_pars_fragment:lm,opaque_fragment:hm,packing:dm,premultiplied_alpha_fragment:um,project_vertex:fm,dithering_fragment:pm,dithering_pars_fragment:mm,roughnessmap_fragment:gm,roughnessmap_pars_fragment:_m,shadowmap_pars_fragment:vm,shadowmap_pars_vertex:xm,shadowmap_vertex:bm,shadowmask_pars_fragment:Mm,skinbase_vertex:ym,skinning_pars_vertex:Sm,skinning_vertex:wm,skinnormal_vertex:Em,specularmap_fragment:Tm,specularmap_pars_fragment:Am,tonemapping_fragment:Rm,tonemapping_pars_fragment:Cm,transmission_fragment:Pm,transmission_pars_fragment:Im,uv_pars_fragment:Lm,uv_pars_vertex:Dm,uv_vertex:Um,worldpos_vertex:Nm,background_vert:Fm,background_frag:km,backgroundCube_vert:Om,backgroundCube_frag:Bm,cube_vert:zm,cube_frag:Gm,depth_vert:Hm,depth_frag:Vm,distance_vert:Wm,distance_frag:Xm,equirect_vert:qm,equirect_frag:Ym,linedashed_vert:Km,linedashed_frag:$m,meshbasic_vert:Zm,meshbasic_frag:jm,meshlambert_vert:Jm,meshlambert_frag:Qm,meshmatcap_vert:e0,meshmatcap_frag:t0,meshnormal_vert:n0,meshnormal_frag:i0,meshphong_vert:s0,meshphong_frag:r0,meshphysical_vert:a0,meshphysical_frag:o0,meshtoon_vert:c0,meshtoon_frag:l0,points_vert:h0,points_frag:d0,shadow_vert:u0,shadow_frag:f0,sprite_vert:p0,sprite_frag:m0},he={common:{diffuse:{value:new Ce(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Le},alphaMap:{value:null},alphaMapTransform:{value:new Le},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Le}},envmap:{envMap:{value:null},envMapRotation:{value:new Le},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Le}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Le}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Le},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Le},normalScale:{value:new ke(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Le},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Le}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Le}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Le}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ce(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new k},probesMax:{value:new k},probesResolution:{value:new k}},points:{diffuse:{value:new Ce(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Le},alphaTest:{value:0},uvTransform:{value:new Le}},sprite:{diffuse:{value:new Ce(16777215)},opacity:{value:1},center:{value:new ke(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Le},alphaMap:{value:null},alphaMapTransform:{value:new Le},alphaTest:{value:0}}},vn={basic:{uniforms:Ut([he.common,he.specularmap,he.envmap,he.aomap,he.lightmap,he.fog]),vertexShader:Fe.meshbasic_vert,fragmentShader:Fe.meshbasic_frag},lambert:{uniforms:Ut([he.common,he.specularmap,he.envmap,he.aomap,he.lightmap,he.emissivemap,he.bumpmap,he.normalmap,he.displacementmap,he.fog,he.lights,{emissive:{value:new Ce(0)},envMapIntensity:{value:1}}]),vertexShader:Fe.meshlambert_vert,fragmentShader:Fe.meshlambert_frag},phong:{uniforms:Ut([he.common,he.specularmap,he.envmap,he.aomap,he.lightmap,he.emissivemap,he.bumpmap,he.normalmap,he.displacementmap,he.fog,he.lights,{emissive:{value:new Ce(0)},specular:{value:new Ce(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Fe.meshphong_vert,fragmentShader:Fe.meshphong_frag},standard:{uniforms:Ut([he.common,he.envmap,he.aomap,he.lightmap,he.emissivemap,he.bumpmap,he.normalmap,he.displacementmap,he.roughnessmap,he.metalnessmap,he.fog,he.lights,{emissive:{value:new Ce(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Fe.meshphysical_vert,fragmentShader:Fe.meshphysical_frag},toon:{uniforms:Ut([he.common,he.aomap,he.lightmap,he.emissivemap,he.bumpmap,he.normalmap,he.displacementmap,he.gradientmap,he.fog,he.lights,{emissive:{value:new Ce(0)}}]),vertexShader:Fe.meshtoon_vert,fragmentShader:Fe.meshtoon_frag},matcap:{uniforms:Ut([he.common,he.bumpmap,he.normalmap,he.displacementmap,he.fog,{matcap:{value:null}}]),vertexShader:Fe.meshmatcap_vert,fragmentShader:Fe.meshmatcap_frag},points:{uniforms:Ut([he.points,he.fog]),vertexShader:Fe.points_vert,fragmentShader:Fe.points_frag},dashed:{uniforms:Ut([he.common,he.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Fe.linedashed_vert,fragmentShader:Fe.linedashed_frag},depth:{uniforms:Ut([he.common,he.displacementmap]),vertexShader:Fe.depth_vert,fragmentShader:Fe.depth_frag},normal:{uniforms:Ut([he.common,he.bumpmap,he.normalmap,he.displacementmap,{opacity:{value:1}}]),vertexShader:Fe.meshnormal_vert,fragmentShader:Fe.meshnormal_frag},sprite:{uniforms:Ut([he.sprite,he.fog]),vertexShader:Fe.sprite_vert,fragmentShader:Fe.sprite_frag},background:{uniforms:{uvTransform:{value:new Le},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Fe.background_vert,fragmentShader:Fe.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Le}},vertexShader:Fe.backgroundCube_vert,fragmentShader:Fe.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Fe.cube_vert,fragmentShader:Fe.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Fe.equirect_vert,fragmentShader:Fe.equirect_frag},distance:{uniforms:Ut([he.common,he.displacementmap,{referencePosition:{value:new k},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Fe.distance_vert,fragmentShader:Fe.distance_frag},shadow:{uniforms:Ut([he.lights,he.fog,{color:{value:new Ce(0)},opacity:{value:1}}]),vertexShader:Fe.shadow_vert,fragmentShader:Fe.shadow_frag}};vn.physical={uniforms:Ut([vn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Le},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Le},clearcoatNormalScale:{value:new ke(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Le},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Le},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Le},sheen:{value:0},sheenColor:{value:new Ce(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Le},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Le},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Le},transmissionSamplerSize:{value:new ke},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Le},attenuationDistance:{value:0},attenuationColor:{value:new Ce(0)},specularColor:{value:new Ce(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Le},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Le},anisotropyVector:{value:new ke},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Le}}]),vertexShader:Fe.meshphysical_vert,fragmentShader:Fe.meshphysical_frag};const rr={r:0,b:0,g:0},g0=new Ue,Sh=new Le;Sh.set(-1,0,0,0,1,0,0,0,1);function _0(s,e,t,n,i,r){const a=new Ce(0);let o=i===!0?0:1,c,l,h=null,d=0,f=null;function u(T){let A=T.isScene===!0?T.background:null;if(A&&A.isTexture){const x=T.backgroundBlurriness>0;A=e.get(A,x)}return A}function g(T){let A=!1;const x=u(T);x===null?p(a,o):x&&x.isColor&&(p(x,1),A=!0);const M=s.xr.getEnvironmentBlendMode();M==="additive"?t.buffers.color.setClear(0,0,0,1,r):M==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(s.autoClear||A)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),s.clear(s.autoClearColor,s.autoClearDepth,s.autoClearStencil))}function v(T,A){const x=u(A);x&&(x.isCubeTexture||x.mapping===Ur)?(l===void 0&&(l=new It(new As(1,1,1),new wn({name:"BackgroundCubeMaterial",uniforms:Xi(vn.backgroundCube.uniforms),vertexShader:vn.backgroundCube.vertexShader,fragmentShader:vn.backgroundCube.fragmentShader,side:Nt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),l.geometry.deleteAttribute("uv"),l.onBeforeRender=function(M,y,w){this.matrixWorld.copyPosition(w.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(l)),l.material.uniforms.envMap.value=x,l.material.uniforms.backgroundBlurriness.value=A.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=A.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(g0.makeRotationFromEuler(A.backgroundRotation)).transpose(),x.isCubeTexture&&x.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply(Sh),l.material.toneMapped=Be.getTransfer(x.colorSpace)!==et,(h!==x||d!==x.version||f!==s.toneMapping)&&(l.material.needsUpdate=!0,h=x,d=x.version,f=s.toneMapping),l.layers.enableAll(),T.unshift(l,l.geometry,l.material,0,0,null)):x&&x.isTexture&&(c===void 0&&(c=new It(new Or(2,2),new wn({name:"BackgroundMaterial",uniforms:Xi(vn.background.uniforms),vertexShader:vn.background.vertexShader,fragmentShader:vn.background.fragmentShader,side:Qn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(c)),c.material.uniforms.t2D.value=x,c.material.uniforms.backgroundIntensity.value=A.backgroundIntensity,c.material.toneMapped=Be.getTransfer(x.colorSpace)!==et,x.matrixAutoUpdate===!0&&x.updateMatrix(),c.material.uniforms.uvTransform.value.copy(x.matrix),(h!==x||d!==x.version||f!==s.toneMapping)&&(c.material.needsUpdate=!0,h=x,d=x.version,f=s.toneMapping),c.layers.enableAll(),T.unshift(c,c.geometry,c.material,0,0,null))}function p(T,A){T.getRGB(rr,_h(s)),t.buffers.color.setClear(rr.r,rr.g,rr.b,A,r)}function m(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return a},setClearColor:function(T,A=1){a.set(T),o=A,p(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(T){o=T,p(a,o)},render:g,addToRenderList:v,dispose:m}}function v0(s,e){const t=s.getParameter(s.MAX_VERTEX_ATTRIBS),n={},i=f(null);let r=i,a=!1;function o(P,D,F,I,z){let Y=!1;const B=d(P,I,F,D);r!==B&&(r=B,l(r.object)),Y=u(P,I,F,z),Y&&g(P,I,F,z),z!==null&&e.update(z,s.ELEMENT_ARRAY_BUFFER),(Y||a)&&(a=!1,x(P,D,F,I),z!==null&&s.bindBuffer(s.ELEMENT_ARRAY_BUFFER,e.get(z).buffer))}function c(){return s.createVertexArray()}function l(P){return s.bindVertexArray(P)}function h(P){return s.deleteVertexArray(P)}function d(P,D,F,I){const z=I.wireframe===!0;let Y=n[D.id];Y===void 0&&(Y={},n[D.id]=Y);const B=P.isInstancedMesh===!0?P.id:0;let W=Y[B];W===void 0&&(W={},Y[B]=W);let V=W[F.id];V===void 0&&(V={},W[F.id]=V);let K=V[z];return K===void 0&&(K=f(c()),V[z]=K),K}function f(P){const D=[],F=[],I=[];for(let z=0;z<t;z++)D[z]=0,F[z]=0,I[z]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:D,enabledAttributes:F,attributeDivisors:I,object:P,attributes:{},index:null}}function u(P,D,F,I){const z=r.attributes,Y=D.attributes;let B=0;const W=F.getAttributes();for(const V in W)if(W[V].location>=0){const Z=z[V];let de=Y[V];if(de===void 0&&(V==="instanceMatrix"&&P.instanceMatrix&&(de=P.instanceMatrix),V==="instanceColor"&&P.instanceColor&&(de=P.instanceColor)),Z===void 0||Z.attribute!==de||de&&Z.data!==de.data)return!0;B++}return r.attributesNum!==B||r.index!==I}function g(P,D,F,I){const z={},Y=D.attributes;let B=0;const W=F.getAttributes();for(const V in W)if(W[V].location>=0){let Z=Y[V];Z===void 0&&(V==="instanceMatrix"&&P.instanceMatrix&&(Z=P.instanceMatrix),V==="instanceColor"&&P.instanceColor&&(Z=P.instanceColor));const de={};de.attribute=Z,Z&&Z.data&&(de.data=Z.data),z[V]=de,B++}r.attributes=z,r.attributesNum=B,r.index=I}function v(){const P=r.newAttributes;for(let D=0,F=P.length;D<F;D++)P[D]=0}function p(P){m(P,0)}function m(P,D){const F=r.newAttributes,I=r.enabledAttributes,z=r.attributeDivisors;F[P]=1,I[P]===0&&(s.enableVertexAttribArray(P),I[P]=1),z[P]!==D&&(s.vertexAttribDivisor(P,D),z[P]=D)}function T(){const P=r.newAttributes,D=r.enabledAttributes;for(let F=0,I=D.length;F<I;F++)D[F]!==P[F]&&(s.disableVertexAttribArray(F),D[F]=0)}function A(P,D,F,I,z,Y,B){B===!0?s.vertexAttribIPointer(P,D,F,z,Y):s.vertexAttribPointer(P,D,F,I,z,Y)}function x(P,D,F,I){v();const z=I.attributes,Y=F.getAttributes(),B=D.defaultAttributeValues;for(const W in Y){const V=Y[W];if(V.location>=0){let K=z[W];if(K===void 0&&(W==="instanceMatrix"&&P.instanceMatrix&&(K=P.instanceMatrix),W==="instanceColor"&&P.instanceColor&&(K=P.instanceColor)),K!==void 0){const Z=K.normalized,de=K.itemSize,ve=e.get(K);if(ve===void 0)continue;const Xe=ve.buffer,qe=ve.type,$e=ve.bytesPerElement,j=qe===s.INT||qe===s.UNSIGNED_INT||K.gpuType===wo;if(K.isInterleavedBufferAttribute){const te=K.data,xe=te.stride,Ie=K.offset;if(te.isInstancedInterleavedBuffer){for(let ge=0;ge<V.locationSize;ge++)m(V.location+ge,te.meshPerAttribute);P.isInstancedMesh!==!0&&I._maxInstanceCount===void 0&&(I._maxInstanceCount=te.meshPerAttribute*te.count)}else for(let ge=0;ge<V.locationSize;ge++)p(V.location+ge);s.bindBuffer(s.ARRAY_BUFFER,Xe);for(let ge=0;ge<V.locationSize;ge++)A(V.location+ge,de/V.locationSize,qe,Z,xe*$e,(Ie+de/V.locationSize*ge)*$e,j)}else{if(K.isInstancedBufferAttribute){for(let te=0;te<V.locationSize;te++)m(V.location+te,K.meshPerAttribute);P.isInstancedMesh!==!0&&I._maxInstanceCount===void 0&&(I._maxInstanceCount=K.meshPerAttribute*K.count)}else for(let te=0;te<V.locationSize;te++)p(V.location+te);s.bindBuffer(s.ARRAY_BUFFER,Xe);for(let te=0;te<V.locationSize;te++)A(V.location+te,de/V.locationSize,qe,Z,de*$e,de/V.locationSize*te*$e,j)}}else if(B!==void 0){const Z=B[W];if(Z!==void 0)switch(Z.length){case 2:s.vertexAttrib2fv(V.location,Z);break;case 3:s.vertexAttrib3fv(V.location,Z);break;case 4:s.vertexAttrib4fv(V.location,Z);break;default:s.vertexAttrib1fv(V.location,Z)}}}}T()}function M(){E();for(const P in n){const D=n[P];for(const F in D){const I=D[F];for(const z in I){const Y=I[z];for(const B in Y)h(Y[B].object),delete Y[B];delete I[z]}}delete n[P]}}function y(P){if(n[P.id]===void 0)return;const D=n[P.id];for(const F in D){const I=D[F];for(const z in I){const Y=I[z];for(const B in Y)h(Y[B].object),delete Y[B];delete I[z]}}delete n[P.id]}function w(P){for(const D in n){const F=n[D];for(const I in F){const z=F[I];if(z[P.id]===void 0)continue;const Y=z[P.id];for(const B in Y)h(Y[B].object),delete Y[B];delete z[P.id]}}}function _(P){for(const D in n){const F=n[D],I=P.isInstancedMesh===!0?P.id:0,z=F[I];if(z!==void 0){for(const Y in z){const B=z[Y];for(const W in B)h(B[W].object),delete B[W];delete z[Y]}delete F[I],Object.keys(F).length===0&&delete n[D]}}}function E(){C(),a=!0,r!==i&&(r=i,l(r.object))}function C(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:o,reset:E,resetDefaultState:C,dispose:M,releaseStatesOfGeometry:y,releaseStatesOfObject:_,releaseStatesOfProgram:w,initAttributes:v,enableAttribute:p,disableUnusedAttributes:T}}function x0(s,e,t){let n;function i(c){n=c}function r(c,l){s.drawArrays(n,c,l),t.update(l,n,1)}function a(c,l,h){h!==0&&(s.drawArraysInstanced(n,c,l,h),t.update(l,n,h))}function o(c,l,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,l,0,h);let f=0;for(let u=0;u<h;u++)f+=l[u];t.update(f,n,1)}this.setMode=i,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function b0(s,e,t,n){let i;function r(){if(i!==void 0)return i;if(e.has("EXT_texture_filter_anisotropic")===!0){const w=e.get("EXT_texture_filter_anisotropic");i=s.getParameter(w.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function a(w){return!(w!==Vt&&n.convert(w)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(w){const _=w===Sn&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(w!==Ht&&w!==Zt&&!_&&n.convert(w)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE))}function c(w){if(w==="highp"){if(s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.HIGH_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.HIGH_FLOAT).precision>0)return"highp";w="mediump"}return w==="mediump"&&s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.MEDIUM_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=t.precision!==void 0?t.precision:"highp";const h=c(l);h!==l&&(Te("WebGLRenderer:",l,"not supported, using",h,"instead."),l=h);const d=t.logarithmicDepthBuffer===!0,f=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");t.reversedDepthBuffer===!0&&f===!1&&Te("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");const u=s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS),g=s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=s.getParameter(s.MAX_TEXTURE_SIZE),p=s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE),m=s.getParameter(s.MAX_VERTEX_ATTRIBS),T=s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS),A=s.getParameter(s.MAX_VARYING_VECTORS),x=s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS),M=s.getParameter(s.MAX_SAMPLES),y=s.getParameter(s.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:c,textureFormatReadable:a,textureTypeReadable:o,precision:l,logarithmicDepthBuffer:d,reversedDepthBuffer:f,maxTextures:u,maxVertexTextures:g,maxTextureSize:v,maxCubemapSize:p,maxAttributes:m,maxVertexUniforms:T,maxVaryings:A,maxFragmentUniforms:x,maxSamples:M,samples:y}}function M0(s){const e=this;let t=null,n=0,i=!1,r=!1;const a=new Kn,o=new Le,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(d,f){const u=d.length!==0||f||n!==0||i;return i=f,n=d.length,u},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(d,f){t=h(d,f,0)},this.setState=function(d,f,u){const g=d.clippingPlanes,v=d.clipIntersection,p=d.clipShadows,m=s.get(d);if(!i||g===null||g.length===0||r&&!p)r?h(null):l();else{const T=r?0:n,A=T*4;let x=m.clippingState||null;c.value=x,x=h(g,f,A,u);for(let M=0;M!==A;++M)x[M]=t[M];m.clippingState=x,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=T}};function l(){c.value!==t&&(c.value=t,c.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function h(d,f,u,g){const v=d!==null?d.length:0;let p=null;if(v!==0){if(p=c.value,g!==!0||p===null){const m=u+v*4,T=f.matrixWorldInverse;o.getNormalMatrix(T),(p===null||p.length<m)&&(p=new Float32Array(m));for(let A=0,x=u;A!==v;++A,x+=4)a.copy(d[A]).applyMatrix4(T,o),a.normal.toArray(p,x),p[x+3]=a.constant}c.value=p,c.needsUpdate=!0}return e.numPlanes=v,e.numIntersection=0,p}}const ki=4,y0=6,S0=20,w0=256,as=new Rs,nl=new Ce;let Ma=null,ya=0,Sa=0,wa=!1;const E0=new k,ci=new k;class il{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,i=100,r={}){const{size:a=256,position:o=E0}=r;Ma=this._renderer.getRenderTarget(),ya=this._renderer.getActiveCubeFace(),Sa=this._renderer.getActiveMipmapLevel(),wa=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);const c=this._allocateTargets();return c.depthBuffer=!0,this._sceneToCubeUV(e,n,i,c,o),t>0&&this._blur(c,0,0,t),this._applyPMREM(c),this._cleanup(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=al(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=rl(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(Ma,ya,Sa),this._renderer.xr.enabled=wa,e.scissorTest=!1,Ii(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===ui||e.mapping===Hi?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Ma=this._renderer.getRenderTarget(),ya=this._renderer.getActiveCubeFace(),Sa=this._renderer.getActiveMipmapLevel(),wa=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:bt,minFilter:bt,generateMipmaps:!1,type:Sn,format:Vt,colorSpace:Ot,depthBuffer:!1},i=sl(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=sl(e,t,n);const{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=T0(r)),this._blurMaterial=R0(r,e,t),this._ggxMaterial=A0(r,e,t)}return i}_compileMaterial(e){const t=new It(new Bt,e);this._renderer.compile(t,as)}_sceneToCubeUV(e,t,n,i,r){const c=new kt(90,1,t,n),l=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],d=this._renderer,f=d.autoClear,u=d.toneMapping;d.getClearColor(nl),d.toneMapping=an,d.autoClear=!1,d.state.buffers.depth.getReversed()&&(d.setRenderTarget(i),d.clearDepth(),d.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new It(new As,new jn({name:"PMREM.Background",side:Nt,depthWrite:!1,depthTest:!1})));const v=this._backgroundBox,p=v.material;let m=!1;const T=e.background;T?T.isColor&&(p.color.copy(T),e.background=null,m=!0):(p.color.copy(nl),m=!0);for(let A=0;A<6;A++){const x=A%3;x===0?(c.up.set(0,l[A],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x+h[A],r.y,r.z)):x===1?(c.up.set(0,0,l[A]),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y+h[A],r.z)):(c.up.set(0,l[A],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y,r.z+h[A]));const M=this._cubeSize;Ii(i,x*M,A>2?M:0,M,M),d.setRenderTarget(i),m&&d.render(v,c),d.render(e,c)}d.toneMapping=u,d.autoClear=f,e.background=T}_textureToCubeUV(e,t){const n=this._renderer,i=e.mapping===ui||e.mapping===Hi;i?(this._cubemapMaterial===null&&(this._cubemapMaterial=al()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=rl());const r=i?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=r;const o=r.uniforms;o.envMap.value=e;const c=this._cubeSize;Ii(t,0,0,3*c,2*c),n.setRenderTarget(t),n.render(a,as)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;const i=this._lodMeshes.length;for(let r=1;r<i;r++)this._applyGGXFilter(e,r-1,r);t.autoClear=n}_applyGGXFilter(e,t,n){const i=this._renderer,r=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[n];o.material=a;const c=a.uniforms,l=n/(this._lodMeshes.length-1),h=t/(this._lodMeshes.length-1),d=Math.sqrt(l*l-h*h),f=l*1.25,u=d*f,{_lodMax:g}=this,v=this._sizeLods[n],p=3*v*(n>g-ki?n-g+ki:0),m=4*(this._cubeSize-v);c.envMap.value=e.texture,c.roughness.value=u,c.mipInt.value=g-t,Ii(r,p,m,3*v,2*v),i.setRenderTarget(r),i.render(o,as),c.envMap.value=r.texture,c.roughness.value=0,c.mipInt.value=g-n,Ii(e,p,m,3*v,2*v),i.setRenderTarget(e),i.render(o,as)}_blur(e,t,n,i){const r=this._pingPongRenderTarget,a=Math.min(i,Math.PI)/Math.SQRT2;this._blurPass(e,r,t,n,a),this._blurPass(r,e,n,n,a)}_blurPass(e,t,n,i,r){const a=this._renderer,o=this._blurMaterial,c=this._lodMeshes[i];c.material=o;const l=o.uniforms;l.envMap.value=e.texture,l.sigma.value=r,l.mipInt.value=this._lodMax-n;const h=this._sizeLods[i],d=3*h*(i>this._lodMax-ki?i-this._lodMax+ki:0),f=4*(this._cubeSize-h);Ii(t,d,f,3*h,2*h),a.setRenderTarget(t),a.render(c,as)}}function T0(s){const e=[],t=[];let n=s;const i=s-ki+1+y0;for(let r=0;r<i;r++){const a=Math.pow(2,n);e.push(a);const o=1/(a-2),c=-o,l=1+o,h=[c,c,l,c,l,l,c,c,l,l,c,l],d=6,f=6,u=3,g=new Float32Array(u*f*d),v=new Float32Array(u*f*d);for(let m=0;m<d;m++){const T=m%3*2/3-1,A=m>2?0:-1,x=[T,A,0,T+2/3,A,0,T+2/3,A+1,0,T,A,0,T+2/3,A+1,0,T,A+1,0];g.set(x,u*f*m);for(let M=0;M<f;M++){const y=h[M*2]*2-1,w=h[M*2+1]*2-1;m===0?ci.set(1,w,y):m===1?ci.set(-y,1,-w):m===2?ci.set(-y,w,1):m===3?ci.set(-1,w,-y):m===4?ci.set(-y,-1,w):ci.set(y,w,-1),ci.toArray(v,(m*f+M)*u)}}const p=new Bt;p.setAttribute("position",new Pt(g,u)),p.setAttribute("outputDirection",new Pt(v,u)),t.push(new It(p,null)),n>ki&&n--}return{lodMeshes:t,sizeLods:e}}function sl(s,e,t){const n=new cn(s,e,t);return n.texture.mapping=Ur,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Ii(s,e,t,n,i){s.viewport.set(e,t,n,i),s.scissor.set(e,t,n,i)}function A0(s,e,t){return new wn({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:w0,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:zr(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:Nn,depthTest:!1,depthWrite:!1})}function R0(s,e,t){return new wn({name:"SphericalGaussianBlur",defines:{SAMPLES:S0,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:zr(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float sigma;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359
			#define GOLDEN_ANGLE 2.39996322973

			void main() {

				if ( sigma == 0.0 ) {

					gl_FragColor = vec4( bilinearCubeUV( envMap, vOutputDirection, mipInt ), 1.0 );
					return;

				}

				vec3 outputDirection = normalize( vOutputDirection );

				vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
				vec3 tangent = normalize( cross( up, outputDirection ) );
				vec3 bitangent = cross( outputDirection, tangent );

				// Truncate the kernel at three standard deviations or at the antipode.
				float thetaMax = min( 3.0 * sigma, PI );
				float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

				vec3 accumColor = vec3( 0.0 );
				float accumWeight = 0.0;

				for ( int i = 0; i < SAMPLES; i ++ ) {

					// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
					float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
					float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
					float phi = float( i ) * GOLDEN_ANGLE;

					vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
					vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

					// Correct the planar sample density to solid angle.
					float weight = sin( theta ) / theta;

					accumColor += weight * bilinearCubeUV( envMap, sampleDirection, mipInt );
					accumWeight += weight;

				}

				gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

			}
		`,blending:Nn,depthTest:!1,depthWrite:!1})}function rl(){return new wn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:zr(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Nn,depthTest:!1,depthWrite:!1})}function al(){return new wn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:zr(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Nn,depthTest:!1,depthWrite:!1})}function zr(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}class wh extends cn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},i=[n,n,n,n,n,n];this.texture=new mh(i),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},i=new As(5,5,5),r=new wn({name:"CubemapFromEquirect",uniforms:Xi(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Nt,blending:Nn});r.uniforms.tEquirect.value=t;const a=new It(i,r),o=t.minFilter;return t.minFilter===Dn&&(t.minFilter=bt),new xf(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,i=!0){const r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,i);e.setRenderTarget(r)}}function C0(s){let e=new WeakMap,t=new WeakMap,n=null;function i(f,u=!1){return f==null?null:u?a(f):r(f)}function r(f){if(f&&f.isTexture){const u=f.mapping;if(u===qr||u===Yr)if(e.has(f)){const g=e.get(f).texture;return o(g,f.mapping)}else{const g=f.image;if(g&&g.height>0){const v=new wh(g.height);return v.fromEquirectangularTexture(s,f),e.set(f,v),f.addEventListener("dispose",l),o(v.texture,f.mapping)}else return null}}return f}function a(f){if(f&&f.isTexture){const u=f.mapping,g=u===qr||u===Yr,v=u===ui||u===Hi;if(g||v){let p=t.get(f);const m=p!==void 0?p.texture.pmremVersion:0;if(f.isRenderTargetTexture&&f.pmremVersion!==m)return n===null&&(n=new il(s)),p=g?n.fromEquirectangular(f,p):n.fromCubemap(f,p),p.texture.pmremVersion=f.pmremVersion,t.set(f,p),p.texture;if(p!==void 0)return p.texture;{const T=f.image;return g&&T&&T.height>0||v&&T&&c(T)?(n===null&&(n=new il(s)),p=g?n.fromEquirectangular(f):n.fromCubemap(f),p.texture.pmremVersion=f.pmremVersion,t.set(f,p),f.addEventListener("dispose",h),p.texture):null}}}return f}function o(f,u){return u===qr?f.mapping=ui:u===Yr&&(f.mapping=Hi),f}function c(f){let u=0;const g=6;for(let v=0;v<g;v++)f[v]!==void 0&&u++;return u===g}function l(f){const u=f.target;u.removeEventListener("dispose",l);const g=e.get(u);g!==void 0&&(e.delete(u),g.dispose())}function h(f){const u=f.target;u.removeEventListener("dispose",h);const g=t.get(u);g!==void 0&&(t.delete(u),g.dispose())}function d(){e=new WeakMap,t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:i,dispose:d}}function P0(s){const e={};function t(n){if(e[n]!==void 0)return e[n];const i=s.getExtension(n);return e[n]=i,i}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){const i=t(n);return i===null&&Bi("WebGLRenderer: "+n+" extension not supported."),i}}}function I0(s,e,t,n){const i={},r=new WeakMap;function a(d){const f=d.target;f.index!==null&&e.remove(f.index);for(const g in f.attributes)e.remove(f.attributes[g]);f.removeEventListener("dispose",a),delete i[f.id];const u=r.get(f);u&&(e.remove(u),r.delete(f)),n.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,t.memory.geometries--}function o(d,f){return i[f.id]===!0||(f.addEventListener("dispose",a),i[f.id]=!0,t.memory.geometries++),f}function c(d){const f=d.attributes;for(const u in f)e.update(f[u],s.ARRAY_BUFFER)}function l(d){const f=[],u=d.index,g=d.attributes.position;let v=0;if(g===void 0)return;if(u!==null){const T=u.array;v=u.version;for(let A=0,x=T.length;A<x;A+=3){const M=T[A+0],y=T[A+1],w=T[A+2];f.push(M,y,y,w,w,M)}}else{const T=g.array;v=g.version;for(let A=0,x=T.length/3-1;A<x;A+=3){const M=A+0,y=A+1,w=A+2;f.push(M,y,y,w,w,M)}}const p=new(g.count>=65535?hh:lh)(f,1);p.version=v;const m=r.get(d);m&&e.remove(m),r.set(d,p)}function h(d){const f=r.get(d);if(f){const u=d.index;u!==null&&f.version<u.version&&l(d)}else l(d);return r.get(d)}return{get:o,update:c,getWireframeAttribute:h}}function L0(s,e,t){let n;function i(d){n=d}let r,a;function o(d){r=d.type,a=d.bytesPerElement}function c(d,f){s.drawElements(n,f,r,d*a),t.update(f,n,1)}function l(d,f,u){u!==0&&(s.drawElementsInstanced(n,f,r,d*a,u),t.update(f,n,u))}function h(d,f,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,f,0,r,d,0,u);let v=0;for(let p=0;p<u;p++)v+=f[p];t.update(v,n,1)}this.setMode=i,this.setIndex=o,this.render=c,this.renderInstances=l,this.renderMultiDraw=h}function D0(s){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(t.calls++,a){case s.TRIANGLES:t.triangles+=o*(r/3);break;case s.LINES:t.lines+=o*(r/2);break;case s.LINE_STRIP:t.lines+=o*(r-1);break;case s.LINE_LOOP:t.lines+=o*r;break;case s.POINTS:t.points+=o*r;break;default:Pe("WebGLInfo: Unknown draw mode:",a);break}}function i(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:i,update:n}}function U0(s,e,t){const n=new WeakMap,i=new it;function r(a,o,c){const l=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,d=h!==void 0?h.length:0;let f=n.get(o);if(f===void 0||f.count!==d){let E=function(){w.dispose(),n.delete(o),o.removeEventListener("dispose",E)};f!==void 0&&f.texture.dispose();const u=o.morphAttributes.position!==void 0,g=o.morphAttributes.normal!==void 0,v=o.morphAttributes.color!==void 0,p=o.morphAttributes.position||[],m=o.morphAttributes.normal||[],T=o.morphAttributes.color||[];let A=0;u===!0&&(A=1),g===!0&&(A=2),v===!0&&(A=3);let x=o.attributes.position.count*A,M=1;x>e.maxTextureSize&&(M=Math.ceil(x/e.maxTextureSize),x=e.maxTextureSize);const y=new Float32Array(x*M*4*d),w=new ah(y,x,M,d);w.type=Zt,w.needsUpdate=!0;const _=A*4;for(let C=0;C<d;C++){const P=p[C],D=m[C],F=T[C],I=x*M*4*C;for(let z=0;z<P.count;z++){const Y=z*_;u===!0&&(i.fromBufferAttribute(P,z),y[I+Y+0]=i.x,y[I+Y+1]=i.y,y[I+Y+2]=i.z,y[I+Y+3]=0),g===!0&&(i.fromBufferAttribute(D,z),y[I+Y+4]=i.x,y[I+Y+5]=i.y,y[I+Y+6]=i.z,y[I+Y+7]=0),v===!0&&(i.fromBufferAttribute(F,z),y[I+Y+8]=i.x,y[I+Y+9]=i.y,y[I+Y+10]=i.z,y[I+Y+11]=F.itemSize===4?i.w:1)}}f={count:d,texture:w,size:new ke(x,M)},n.set(o,f),o.addEventListener("dispose",E)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)c.getUniforms().setValue(s,"morphTexture",a.morphTexture,t);else{let u=0;for(let v=0;v<l.length;v++)u+=l[v];const g=o.morphTargetsRelative?1:1-u;c.getUniforms().setValue(s,"morphTargetBaseInfluence",g),c.getUniforms().setValue(s,"morphTargetInfluences",l)}c.getUniforms().setValue(s,"morphTargetsTexture",f.texture,t),c.getUniforms().setValue(s,"morphTargetsTextureSize",f.size)}return{update:r}}function N0(s,e,t,n,i){let r=new WeakMap;function a(l){const h=i.render.frame,d=l.geometry,f=e.get(l,d);if(r.get(f)!==h&&(e.update(f),r.set(f,h)),l.isInstancedMesh&&(l.hasEventListener("dispose",c)===!1&&l.addEventListener("dispose",c),r.get(l)!==h&&(t.update(l.instanceMatrix,s.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,s.ARRAY_BUFFER),r.set(l,h))),l.isSkinnedMesh){const u=l.skeleton;r.get(u)!==h&&(u.update(),r.set(u,h))}return f}function o(){r=new WeakMap}function c(l){const h=l.target;h.removeEventListener("dispose",c),n.releaseStatesOfObject(h),t.remove(h.instanceMatrix),h.instanceColor!==null&&t.remove(h.instanceColor)}return{update:a,dispose:o}}const F0={[Gl]:"LINEAR_TONE_MAPPING",[Hl]:"REINHARD_TONE_MAPPING",[Vl]:"CINEON_TONE_MAPPING",[Wl]:"ACES_FILMIC_TONE_MAPPING",[ql]:"AGX_TONE_MAPPING",[Yl]:"NEUTRAL_TONE_MAPPING",[Xl]:"CUSTOM_TONE_MAPPING"};function k0(s,e,t,n,i,r){const a=new cn(e,t,{type:s,depthBuffer:i,stencilBuffer:r,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1});let o=null,c=null;const l=new Bt;l.setAttribute("position",new ln([-1,3,0,-1,-1,0,3,-1,0],3)),l.setAttribute("uv",new ln([0,2,0,0,2,0],2));const h=new qu({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),d=new It(l,h),f=new Rs(-1,1,1,-1,0,1);let u=null,g=null,v=!1,p,m=null,T=[],A=!1;this.setSize=function(x,M){a.setSize(x,M),o!==null&&o.setSize(x,M),c!==null&&c.setSize(x,M);for(let y=0;y<T.length;y++){const w=T[y];w.setSize&&w.setSize(x,M)}},this.setEffects=function(x){T=x,A=T.length>0&&T[0].isRenderPass===!0;const M=a.width,y=a.height;T.length>0&&o===null&&(o=new cn(M,y,{type:Sn,depthBuffer:!1,stencilBuffer:!1}),c=new cn(M,y,{type:Sn,depthBuffer:!1,stencilBuffer:!1}));for(let w=0;w<T.length;w++){const _=T[w];_.setSize&&_.setSize(M,y)}},this.begin=function(x,M){if(v||x.toneMapping===an&&T.length===0)return!1;if(m=M,M!==null){const y=M.width,w=M.height;(a.width!==y||a.height!==w)&&this.setSize(y,w)}return A===!1&&x.setRenderTarget(a),p=x.toneMapping,x.toneMapping=an,!0},this.hasRenderPass=function(){return A},this.end=function(x,M){x.toneMapping=p,v=!0;let y=a,w=o;for(let _=0;_<T.length;_++){const E=T[_];E.enabled!==!1&&(E.render(x,w,y,M),E.needsSwap!==!1&&(y=w,w=w===o?c:o))}if(u!==x.outputColorSpace||g!==x.toneMapping){u=x.outputColorSpace,g=x.toneMapping,h.defines={},Be.getTransfer(u)===et&&(h.defines.SRGB_TRANSFER="");const _=F0[g];_&&(h.defines[_]=""),h.needsUpdate=!0}h.uniforms.tDiffuse.value=y.texture,x.setRenderTarget(m),x.render(d,f),m=null,v=!1},this.isCompositing=function(){return v},this.dispose=function(){a.dispose(),o!==null&&o.dispose(),c!==null&&c.dispose(),l.dispose(),h.dispose()}}const Eh=new Et,vo=new ws(1,1),Th=new ah,Ah=new gu,Rh=new mh,ol=[],cl=[],ll=new Float32Array(16),hl=new Float32Array(9),dl=new Float32Array(4);function $i(s,e,t){const n=s[0];if(n<=0||n>0)return s;const i=e*t;let r=ol[i];if(r===void 0&&(r=new Float32Array(i),ol[i]=r),e!==0){n.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,s[a].toArray(r,o)}return r}function Mt(s,e){if(s.length!==e.length)return!1;for(let t=0,n=s.length;t<n;t++)if(s[t]!==e[t])return!1;return!0}function yt(s,e){for(let t=0,n=e.length;t<n;t++)s[t]=e[t]}function Gr(s,e){let t=cl[e];t===void 0&&(t=new Int32Array(e),cl[e]=t);for(let n=0;n!==e;++n)t[n]=s.allocateTextureUnit();return t}function O0(s,e){const t=this.cache;t[0]!==e&&(s.uniform1f(this.addr,e),t[0]=e)}function B0(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Mt(t,e))return;s.uniform2fv(this.addr,e),yt(t,e)}}function z0(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(s.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Mt(t,e))return;s.uniform3fv(this.addr,e),yt(t,e)}}function G0(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Mt(t,e))return;s.uniform4fv(this.addr,e),yt(t,e)}}function H0(s,e){const t=this.cache,n=e.elements;if(n===void 0){if(Mt(t,e))return;s.uniformMatrix2fv(this.addr,!1,e),yt(t,e)}else{if(Mt(t,n))return;dl.set(n),s.uniformMatrix2fv(this.addr,!1,dl),yt(t,n)}}function V0(s,e){const t=this.cache,n=e.elements;if(n===void 0){if(Mt(t,e))return;s.uniformMatrix3fv(this.addr,!1,e),yt(t,e)}else{if(Mt(t,n))return;hl.set(n),s.uniformMatrix3fv(this.addr,!1,hl),yt(t,n)}}function W0(s,e){const t=this.cache,n=e.elements;if(n===void 0){if(Mt(t,e))return;s.uniformMatrix4fv(this.addr,!1,e),yt(t,e)}else{if(Mt(t,n))return;ll.set(n),s.uniformMatrix4fv(this.addr,!1,ll),yt(t,n)}}function X0(s,e){const t=this.cache;t[0]!==e&&(s.uniform1i(this.addr,e),t[0]=e)}function q0(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Mt(t,e))return;s.uniform2iv(this.addr,e),yt(t,e)}}function Y0(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Mt(t,e))return;s.uniform3iv(this.addr,e),yt(t,e)}}function K0(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Mt(t,e))return;s.uniform4iv(this.addr,e),yt(t,e)}}function $0(s,e){const t=this.cache;t[0]!==e&&(s.uniform1ui(this.addr,e),t[0]=e)}function Z0(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Mt(t,e))return;s.uniform2uiv(this.addr,e),yt(t,e)}}function j0(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Mt(t,e))return;s.uniform3uiv(this.addr,e),yt(t,e)}}function J0(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Mt(t,e))return;s.uniform4uiv(this.addr,e),yt(t,e)}}function Q0(s,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i);let r;this.type===s.SAMPLER_2D_SHADOW?(vo.compareFunction=t.isReversedDepthBuffer()?Do:Lo,r=vo):r=Eh,t.setTexture2D(e||r,i)}function eg(s,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTexture3D(e||Ah,i)}function tg(s,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTextureCube(e||Rh,i)}function ng(s,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTexture2DArray(e||Th,i)}function ig(s){switch(s){case 5126:return O0;case 35664:return B0;case 35665:return z0;case 35666:return G0;case 35674:return H0;case 35675:return V0;case 35676:return W0;case 5124:case 35670:return X0;case 35667:case 35671:return q0;case 35668:case 35672:return Y0;case 35669:case 35673:return K0;case 5125:return $0;case 36294:return Z0;case 36295:return j0;case 36296:return J0;case 35678:case 36198:case 36298:case 36306:case 35682:return Q0;case 35679:case 36299:case 36307:return eg;case 35680:case 36300:case 36308:case 36293:return tg;case 36289:case 36303:case 36311:case 36292:return ng}}function sg(s,e){s.uniform1fv(this.addr,e)}function rg(s,e){const t=$i(e,this.size,2);s.uniform2fv(this.addr,t)}function ag(s,e){const t=$i(e,this.size,3);s.uniform3fv(this.addr,t)}function og(s,e){const t=$i(e,this.size,4);s.uniform4fv(this.addr,t)}function cg(s,e){const t=$i(e,this.size,4);s.uniformMatrix2fv(this.addr,!1,t)}function lg(s,e){const t=$i(e,this.size,9);s.uniformMatrix3fv(this.addr,!1,t)}function hg(s,e){const t=$i(e,this.size,16);s.uniformMatrix4fv(this.addr,!1,t)}function dg(s,e){s.uniform1iv(this.addr,e)}function ug(s,e){s.uniform2iv(this.addr,e)}function fg(s,e){s.uniform3iv(this.addr,e)}function pg(s,e){s.uniform4iv(this.addr,e)}function mg(s,e){s.uniform1uiv(this.addr,e)}function gg(s,e){s.uniform2uiv(this.addr,e)}function _g(s,e){s.uniform3uiv(this.addr,e)}function vg(s,e){s.uniform4uiv(this.addr,e)}function xg(s,e,t){const n=this.cache,i=e.length,r=Gr(t,i);Mt(n,r)||(s.uniform1iv(this.addr,r),yt(n,r));let a;this.type===s.SAMPLER_2D_SHADOW?a=vo:a=Eh;for(let o=0;o!==i;++o)t.setTexture2D(e[o]||a,r[o])}function bg(s,e,t){const n=this.cache,i=e.length,r=Gr(t,i);Mt(n,r)||(s.uniform1iv(this.addr,r),yt(n,r));for(let a=0;a!==i;++a)t.setTexture3D(e[a]||Ah,r[a])}function Mg(s,e,t){const n=this.cache,i=e.length,r=Gr(t,i);Mt(n,r)||(s.uniform1iv(this.addr,r),yt(n,r));for(let a=0;a!==i;++a)t.setTextureCube(e[a]||Rh,r[a])}function yg(s,e,t){const n=this.cache,i=e.length,r=Gr(t,i);Mt(n,r)||(s.uniform1iv(this.addr,r),yt(n,r));for(let a=0;a!==i;++a)t.setTexture2DArray(e[a]||Th,r[a])}function Sg(s){switch(s){case 5126:return sg;case 35664:return rg;case 35665:return ag;case 35666:return og;case 35674:return cg;case 35675:return lg;case 35676:return hg;case 5124:case 35670:return dg;case 35667:case 35671:return ug;case 35668:case 35672:return fg;case 35669:case 35673:return pg;case 5125:return mg;case 36294:return gg;case 36295:return _g;case 36296:return vg;case 35678:case 36198:case 36298:case 36306:case 35682:return xg;case 35679:case 36299:case 36307:return bg;case 35680:case 36300:case 36308:case 36293:return Mg;case 36289:case 36303:case 36311:case 36292:return yg}}class wg{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=ig(t.type)}}class Eg{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Sg(t.type)}}class Tg{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const i=this.seq;for(let r=0,a=i.length;r!==a;++r){const o=i[r];o.setValue(e,t[o.id],n)}}}const Ea=/(\w+)(\])?(\[|\.)?/g;function ul(s,e){s.seq.push(e),s.map[e.id]=e}function Ag(s,e,t){const n=s.name,i=n.length;for(Ea.lastIndex=0;;){const r=Ea.exec(n),a=Ea.lastIndex;let o=r[1];const c=r[2]==="]",l=r[3];if(c&&(o=o|0),l===void 0||l==="["&&a+2===i){ul(t,l===void 0?new wg(o,s,e):new Eg(o,s,e));break}else{let d=t.map[o];d===void 0&&(d=new Tg(o),ul(t,d)),t=d}}}class _r{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<n;++a){const o=e.getActiveUniform(t,a),c=e.getUniformLocation(t,o.name);Ag(o,c,this)}const i=[],r=[];for(const a of this.seq)a.type===e.SAMPLER_2D_SHADOW||a.type===e.SAMPLER_CUBE_SHADOW||a.type===e.SAMPLER_2D_ARRAY_SHADOW?i.push(a):r.push(a);i.length>0&&(this.seq=i.concat(r))}setValue(e,t,n,i){const r=this.map[t];r!==void 0&&r.setValue(e,n,i)}setOptional(e,t,n){const i=t[n];i!==void 0&&this.setValue(e,n,i)}static upload(e,t,n,i){for(let r=0,a=t.length;r!==a;++r){const o=t[r],c=n[o.id];c.needsUpdate!==!1&&o.setValue(e,c.value,i)}}static seqWithValue(e,t){const n=[];for(let i=0,r=e.length;i!==r;++i){const a=e[i];a.id in t&&n.push(a)}return n}}function fl(s,e,t){const n=s.createShader(e);return s.shaderSource(n,t),s.compileShader(n),n}const Rg=37297;let Cg=0;function Pg(s,e){const t=s.split(`
`),n=[],i=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=i;a<r;a++){const o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}const pl=new Le;function Ig(s){Be._getMatrix(pl,Be.workingColorSpace,s);const e=`mat3( ${pl.elements.map(t=>t.toFixed(4))} )`;switch(Be.getTransfer(s)){case wr:return[e,"LinearTransferOETF"];case et:return[e,"sRGBTransferOETF"];default:return Te("WebGLProgram: Unsupported color space: ",s),[e,"LinearTransferOETF"]}}function ml(s,e,t){const n=s.getShaderParameter(e,s.COMPILE_STATUS),r=(s.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";const a=/ERROR: 0:(\d+)/.exec(r);if(a){const o=parseInt(a[1]);return t.toUpperCase()+`

`+r+`

`+Pg(s.getShaderSource(e),o)}else return r}function Lg(s,e){const t=Ig(e);return[`vec4 ${s}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}const Dg={[Gl]:"Linear",[Hl]:"Reinhard",[Vl]:"Cineon",[Wl]:"ACESFilmic",[ql]:"AgX",[Yl]:"Neutral",[Xl]:"Custom"};function Ug(s,e){const t=Dg[e];return t===void 0?(Te("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+s+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+s+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const ar=new k;function Ng(){Be.getLuminanceCoefficients(ar);const s=ar.x.toFixed(4),e=ar.y.toFixed(4),t=ar.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${s}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Fg(s){return[s.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",s.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(us).join(`
`)}function kg(s){const e=[];for(const t in s){const n=s[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function Og(s,e){const t={},n=s.getProgramParameter(e,s.ACTIVE_ATTRIBUTES);for(let i=0;i<n;i++){const r=s.getActiveAttrib(e,i),a=r.name;let o=1;r.type===s.FLOAT_MAT2&&(o=2),r.type===s.FLOAT_MAT3&&(o=3),r.type===s.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:s.getAttribLocation(e,a),locationSize:o}}return t}function us(s){return s!==""}function gl(s,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return s.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function _l(s,e){return s.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const Bg=/^[ \t]*#include +<([\w\d./]+)>/gm;function xo(s){return s.replace(Bg,Gg)}const zg=new Map;function Gg(s,e){let t=Fe[e];if(t===void 0){const n=zg.get(e);if(n!==void 0)t=Fe[n],Te('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return xo(t)}const Hg=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function vl(s){return s.replace(Hg,Vg)}function Vg(s,e,t,n){let i="";for(let r=parseInt(e);r<parseInt(t);r++)i+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return i}function xl(s){let e=`precision ${s.precision} float;
	precision ${s.precision} int;
	precision ${s.precision} sampler2D;
	precision ${s.precision} samplerCube;
	precision ${s.precision} sampler3D;
	precision ${s.precision} sampler2DArray;
	precision ${s.precision} sampler2DShadow;
	precision ${s.precision} samplerCubeShadow;
	precision ${s.precision} sampler2DArrayShadow;
	precision ${s.precision} isampler2D;
	precision ${s.precision} isampler3D;
	precision ${s.precision} isamplerCube;
	precision ${s.precision} isampler2DArray;
	precision ${s.precision} usampler2D;
	precision ${s.precision} usampler3D;
	precision ${s.precision} usamplerCube;
	precision ${s.precision} usampler2DArray;
	`;return s.precision==="highp"?e+=`
#define HIGH_PRECISION`:s.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:s.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}const Wg={[cr]:"SHADOWMAP_TYPE_PCF",[hs]:"SHADOWMAP_TYPE_VSM"};function Xg(s){return Wg[s.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}const qg={[ui]:"ENVMAP_TYPE_CUBE",[Hi]:"ENVMAP_TYPE_CUBE",[Ur]:"ENVMAP_TYPE_CUBE_UV"};function Yg(s){return s.envMap===!1?"ENVMAP_TYPE_CUBE":qg[s.envMapMode]||"ENVMAP_TYPE_CUBE"}const Kg={[Hi]:"ENVMAP_MODE_REFRACTION"};function $g(s){return s.envMap===!1?"ENVMAP_MODE_REFLECTION":Kg[s.envMapMode]||"ENVMAP_MODE_REFLECTION"}const Zg={[zl]:"ENVMAP_BLENDING_MULTIPLY",[Rd]:"ENVMAP_BLENDING_MIX",[Cd]:"ENVMAP_BLENDING_ADD"};function jg(s){return s.envMap===!1?"ENVMAP_BLENDING_NONE":Zg[s.combine]||"ENVMAP_BLENDING_NONE"}function Jg(s){const e=s.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function Qg(s,e,t,n){const i=s.getContext(),r=t.defines;let a=t.vertexShader,o=t.fragmentShader;const c=Xg(t),l=Yg(t),h=$g(t),d=jg(t),f=Jg(t),u=Fg(t),g=kg(r),v=i.createProgram();let p,m,T=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(us).join(`
`),p.length>0&&(p+=`
`),m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(us).join(`
`),m.length>0&&(m+=`
`)):(p=[xl(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(us).join(`
`),m=[xl(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+l:"",t.envMap?"#define "+h:"",t.envMap?"#define "+d:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==an?"#define TONE_MAPPING":"",t.toneMapping!==an?Fe.tonemapping_pars_fragment:"",t.toneMapping!==an?Ug("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Fe.colorspace_pars_fragment,Lg("linearToOutputTexel",t.outputColorSpace),Ng(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(us).join(`
`)),a=xo(a),a=gl(a,t),a=_l(a,t),o=xo(o),o=gl(o,t),o=_l(o,t),a=vl(a),o=vl(o),t.isRawShaderMaterial!==!0&&(T=`#version 300 es
`,p=[u,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+p,m=["#define varying in",t.glslVersion===gc?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===gc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+m);const A=T+p+a,x=T+m+o,M=fl(i,i.VERTEX_SHADER,A),y=fl(i,i.FRAGMENT_SHADER,x);i.attachShader(v,M),i.attachShader(v,y),t.index0AttributeName!==void 0?i.bindAttribLocation(v,0,t.index0AttributeName):t.hasPositionAttribute===!0&&i.bindAttribLocation(v,0,"position"),i.linkProgram(v);function w(P){if(s.debug.checkShaderErrors){const D=i.getProgramInfoLog(v)||"",F=i.getShaderInfoLog(M)||"",I=i.getShaderInfoLog(y)||"",z=D.trim(),Y=F.trim(),B=I.trim();let W=!0,V=!0;if(i.getProgramParameter(v,i.LINK_STATUS)===!1)if(W=!1,typeof s.debug.onShaderError=="function")s.debug.onShaderError(i,v,M,y);else{const K=ml(i,M,"vertex"),Z=ml(i,y,"fragment");Pe("WebGLProgram: Shader Error "+i.getError()+" - VALIDATE_STATUS "+i.getProgramParameter(v,i.VALIDATE_STATUS)+`

Material Name: `+P.name+`
Material Type: `+P.type+`

Program Info Log: `+z+`
`+K+`
`+Z)}else z!==""?Te("WebGLProgram: Program Info Log:",z):(Y===""||B==="")&&(V=!1);V&&(P.diagnostics={runnable:W,programLog:z,vertexShader:{log:Y,prefix:p},fragmentShader:{log:B,prefix:m}})}i.deleteShader(M),i.deleteShader(y),_=new _r(i,v),E=Og(i,v)}let _;this.getUniforms=function(){return _===void 0&&w(this),_};let E;this.getAttributes=function(){return E===void 0&&w(this),E};let C=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return C===!1&&(C=i.getProgramParameter(v,Rg)),C},this.destroy=function(){n.releaseStatesOfProgram(this),i.deleteProgram(v),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Cg++,this.cacheKey=e,this.usedTimes=1,this.program=v,this.vertexShader=M,this.fragmentShader=y,this}let e_=0;class t_{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){const i=this._getShaderCacheForMaterial(e);return i.has(t)===!1&&(i.add(t),t.usedTimes++),i.has(n)===!1&&(i.add(n),n.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new n_(e),t.set(e,n)),n}}class n_{constructor(e){this.id=e_++,this.code=e,this.usedTimes=0}}function i_(s){return s===fi||s===Mr||s===yr}function s_(s,e,t,n,i,r){const a=new oh,o=new t_,c=new Set,l=[],h=new Map,d=n.logarithmicDepthBuffer;let f=n.precision;const u={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(_){return c.add(_),_===0?"uv":`uv${_}`}function v(_,E,C,P,D,F){const I=P.fog,z=D.geometry,Y=_.isMeshStandardMaterial||_.isMeshLambertMaterial||_.isMeshPhongMaterial?P.environment:null,B=_.isMeshStandardMaterial||_.isMeshLambertMaterial&&!_.envMap||_.isMeshPhongMaterial&&!_.envMap,W=e.get(_.envMap||Y,B),V=W&&W.mapping===Ur?W.image.height:null,K=u[_.type];_.precision!==null&&(f=n.getMaxPrecision(_.precision),f!==_.precision&&Te("WebGLProgram.getParameters:",_.precision,"not supported, using",f,"instead."));const Z=z.morphAttributes.position||z.morphAttributes.normal||z.morphAttributes.color,de=Z!==void 0?Z.length:0;let ve=0;z.morphAttributes.position!==void 0&&(ve=1),z.morphAttributes.normal!==void 0&&(ve=2),z.morphAttributes.color!==void 0&&(ve=3);let Xe,qe,$e,j;if(K){const at=vn[K];Xe=at.vertexShader,qe=at.fragmentShader}else{Xe=_.vertexShader,qe=_.fragmentShader;const at=o.getVertexShaderStage(_),Ze=o.getFragmentShaderStage(_);o.update(_,at,Ze),$e=at.id,j=Ze.id}const te=s.getRenderTarget(),xe=s.state.buffers.depth.getReversed(),Ie=D.isInstancedMesh===!0,ge=D.isBatchedMesh===!0,Oe=!!_.map,xt=!!_.matcap,Ge=!!W,Ke=!!_.aoMap,rt=!!_.lightMap,We=!!_.bumpMap&&_.wireframe===!1,lt=!!_.normalMap,St=!!_.displacementMap,Ft=!!_.emissiveMap,dt=!!_.metalnessMap,mt=!!_.roughnessMap,N=_.anisotropy>0,Tt=_.clearcoat>0,Qe=_.dispersion>0,R=_.retroreflectivity>0,b=_.iridescence>0,O=_.sheen>0,X=_.transmission>0,$=N&&!!_.anisotropyMap,ie=Tt&&!!_.clearcoatMap,se=Tt&&!!_.clearcoatNormalMap,J=Tt&&!!_.clearcoatRoughnessMap,ee=b&&!!_.iridescenceMap,re=b&&!!_.iridescenceThicknessMap,we=O&&!!_.sheenColorMap,le=O&&!!_.sheenRoughnessMap,ae=!!_.specularMap,Ee=!!_.specularColorMap,Re=!!_.specularIntensityMap,De=X&&!!_.transmissionMap,U=X&&!!_.thicknessMap,oe=!!_.gradientMap,Q=!!_.alphaMap,ce=_.alphaTest>0,pe=!!_.alphaHash,ne=!!_.extensions;let Ae=an;_.toneMapped&&(te===null||te.isXRRenderTarget===!0)&&(Ae=s.toneMapping);const ye={shaderID:K,shaderType:_.type,shaderName:_.name,vertexShader:Xe,fragmentShader:qe,defines:_.defines,customVertexShaderID:$e,customFragmentShaderID:j,isRawShaderMaterial:_.isRawShaderMaterial===!0,glslVersion:_.glslVersion,precision:f,batching:ge,batchingColor:ge&&D._colorsTexture!==null,instancing:Ie,instancingColor:Ie&&D.instanceColor!==null,instancingMorph:Ie&&D.morphTexture!==null,outputColorSpace:te===null?s.outputColorSpace:te.isXRRenderTarget===!0?te.texture.colorSpace:Be.workingColorSpace,alphaToCoverage:!!_.alphaToCoverage,map:Oe,matcap:xt,envMap:Ge,envMapMode:Ge&&W.mapping,envMapCubeUVHeight:V,aoMap:Ke,lightMap:rt,bumpMap:We,normalMap:lt,displacementMap:St,emissiveMap:Ft,normalMapObjectSpace:lt&&_.normalMapType===Nd,normalMapTangentSpace:lt&&_.normalMapType===Ms,packedNormalMap:lt&&_.normalMapType===Ms&&i_(_.normalMap.format),metalnessMap:dt,roughnessMap:mt,anisotropy:N,anisotropyMap:$,clearcoat:Tt,clearcoatMap:ie,clearcoatNormalMap:se,clearcoatRoughnessMap:J,dispersion:Qe,retroreflection:R,iridescence:b,iridescenceMap:ee,iridescenceThicknessMap:re,sheen:O,sheenColorMap:we,sheenRoughnessMap:le,specularMap:ae,specularColorMap:Ee,specularIntensityMap:Re,transmission:X,transmissionMap:De,thicknessMap:U,gradientMap:oe,opaque:_.transparent===!1&&_.blending===fs&&_.alphaToCoverage===!1,alphaMap:Q,alphaTest:ce,alphaHash:pe,combine:_.combine,mapUv:Oe&&g(_.map.channel),aoMapUv:Ke&&g(_.aoMap.channel),lightMapUv:rt&&g(_.lightMap.channel),bumpMapUv:We&&g(_.bumpMap.channel),normalMapUv:lt&&g(_.normalMap.channel),displacementMapUv:St&&g(_.displacementMap.channel),emissiveMapUv:Ft&&g(_.emissiveMap.channel),metalnessMapUv:dt&&g(_.metalnessMap.channel),roughnessMapUv:mt&&g(_.roughnessMap.channel),anisotropyMapUv:$&&g(_.anisotropyMap.channel),clearcoatMapUv:ie&&g(_.clearcoatMap.channel),clearcoatNormalMapUv:se&&g(_.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:J&&g(_.clearcoatRoughnessMap.channel),iridescenceMapUv:ee&&g(_.iridescenceMap.channel),iridescenceThicknessMapUv:re&&g(_.iridescenceThicknessMap.channel),sheenColorMapUv:we&&g(_.sheenColorMap.channel),sheenRoughnessMapUv:le&&g(_.sheenRoughnessMap.channel),specularMapUv:ae&&g(_.specularMap.channel),specularColorMapUv:Ee&&g(_.specularColorMap.channel),specularIntensityMapUv:Re&&g(_.specularIntensityMap.channel),transmissionMapUv:De&&g(_.transmissionMap.channel),thicknessMapUv:U&&g(_.thicknessMap.channel),alphaMapUv:Q&&g(_.alphaMap.channel),vertexTangents:!!z.attributes.tangent&&(lt||N),vertexNormals:!!z.attributes.normal,vertexColors:_.vertexColors,vertexAlphas:_.vertexColors===!0&&!!z.attributes.color&&z.attributes.color.itemSize===4,pointsUvs:D.isPoints===!0&&!!z.attributes.uv&&(Oe||Q),fog:!!I,useFog:_.fog===!0,fogExp2:!!I&&I.isFogExp2,flatShading:_.wireframe===!1&&(_.flatShading===!0||z.attributes.normal===void 0&&lt===!1&&(_.isMeshLambertMaterial||_.isMeshPhongMaterial||_.isMeshStandardMaterial||_.isMeshPhysicalMaterial)),sizeAttenuation:_.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:xe,skinning:D.isSkinnedMesh===!0,hasPositionAttribute:z.attributes.position!==void 0,morphTargets:z.morphAttributes.position!==void 0,morphNormals:z.morphAttributes.normal!==void 0,morphColors:z.morphAttributes.color!==void 0,morphTargetsCount:de,morphTextureStride:ve,numSunLights:E.sun.length,numDirLights:E.directional.length,numPointLights:E.point.length,numSpotLights:E.spot.length,numSpotLightMaps:E.spotLightMap.length,numRectAreaLights:E.rectArea.length,numHemiLights:E.hemi.length,numSunLightShadows:E.sunShadowMap.length,numDirLightShadows:E.directionalShadowMap.length,numPointLightShadows:E.pointShadowMap.length,numSpotLightShadows:E.spotShadowMap.length,numSpotLightShadowsWithMaps:E.numSpotLightShadowsWithMaps,numLightProbes:E.numLightProbes,numLightProbeGrids:F.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:_.dithering,shadowMapEnabled:s.shadowMap.enabled&&C.length>0,shadowMapType:s.shadowMap.type,toneMapping:Ae,decodeVideoTexture:Oe&&_.map.isVideoTexture===!0&&Be.getTransfer(_.map.colorSpace)===et,decodeVideoTextureEmissive:Ft&&_.emissiveMap.isVideoTexture===!0&&Be.getTransfer(_.emissiveMap.colorSpace)===et,premultipliedAlpha:_.premultipliedAlpha,doubleSided:_.side===xn,flipSided:_.side===Nt,useDepthPacking:_.depthPacking>=0,depthPacking:_.depthPacking||0,index0AttributeName:_.index0AttributeName,extensionClipCullDistance:ne&&_.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ne&&_.extensions.multiDraw===!0||ge)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:_.customProgramCacheKey()};return ye.vertexUv1s=c.has(1),ye.vertexUv2s=c.has(2),ye.vertexUv3s=c.has(3),c.clear(),ye}function p(_){const E=[];if(_.shaderID?E.push(_.shaderID):(E.push(_.customVertexShaderID),E.push(_.customFragmentShaderID)),_.defines!==void 0)for(const C in _.defines)E.push(C),E.push(_.defines[C]);return _.isRawShaderMaterial===!1&&(m(E,_),T(E,_),E.push(s.outputColorSpace)),E.push(_.customProgramCacheKey),E.join()}function m(_,E){_.push(E.precision),_.push(E.outputColorSpace),_.push(E.envMapMode),_.push(E.envMapCubeUVHeight),_.push(E.mapUv),_.push(E.alphaMapUv),_.push(E.lightMapUv),_.push(E.aoMapUv),_.push(E.bumpMapUv),_.push(E.normalMapUv),_.push(E.displacementMapUv),_.push(E.emissiveMapUv),_.push(E.metalnessMapUv),_.push(E.roughnessMapUv),_.push(E.anisotropyMapUv),_.push(E.clearcoatMapUv),_.push(E.clearcoatNormalMapUv),_.push(E.clearcoatRoughnessMapUv),_.push(E.iridescenceMapUv),_.push(E.iridescenceThicknessMapUv),_.push(E.sheenColorMapUv),_.push(E.sheenRoughnessMapUv),_.push(E.specularMapUv),_.push(E.specularColorMapUv),_.push(E.specularIntensityMapUv),_.push(E.transmissionMapUv),_.push(E.thicknessMapUv),_.push(E.combine),_.push(E.fogExp2),_.push(E.sizeAttenuation),_.push(E.morphTargetsCount),_.push(E.morphAttributeCount),_.push(E.numSunLights),_.push(E.numDirLights),_.push(E.numPointLights),_.push(E.numSpotLights),_.push(E.numSpotLightMaps),_.push(E.numHemiLights),_.push(E.numRectAreaLights),_.push(E.numSunLightShadows),_.push(E.numDirLightShadows),_.push(E.numPointLightShadows),_.push(E.numSpotLightShadows),_.push(E.numSpotLightShadowsWithMaps),_.push(E.numLightProbes),_.push(E.shadowMapType),_.push(E.toneMapping),_.push(E.numClippingPlanes),_.push(E.numClipIntersection),_.push(E.depthPacking)}function T(_,E){a.disableAll(),E.instancing&&a.enable(0),E.instancingColor&&a.enable(1),E.instancingMorph&&a.enable(2),E.matcap&&a.enable(3),E.envMap&&a.enable(4),E.normalMapObjectSpace&&a.enable(5),E.normalMapTangentSpace&&a.enable(6),E.clearcoat&&a.enable(7),E.iridescence&&a.enable(8),E.alphaTest&&a.enable(9),E.vertexColors&&a.enable(10),E.vertexAlphas&&a.enable(11),E.vertexUv1s&&a.enable(12),E.vertexUv2s&&a.enable(13),E.vertexUv3s&&a.enable(14),E.vertexTangents&&a.enable(15),E.anisotropy&&a.enable(16),E.alphaHash&&a.enable(17),E.batching&&a.enable(18),E.dispersion&&a.enable(19),E.retroreflection&&a.enable(24),E.batchingColor&&a.enable(20),E.gradientMap&&a.enable(21),E.packedNormalMap&&a.enable(22),E.vertexNormals&&a.enable(23),_.push(a.mask),a.disableAll(),E.fog&&a.enable(0),E.useFog&&a.enable(1),E.flatShading&&a.enable(2),E.logarithmicDepthBuffer&&a.enable(3),E.reversedDepthBuffer&&a.enable(4),E.skinning&&a.enable(5),E.morphTargets&&a.enable(6),E.morphNormals&&a.enable(7),E.morphColors&&a.enable(8),E.premultipliedAlpha&&a.enable(9),E.shadowMapEnabled&&a.enable(10),E.doubleSided&&a.enable(11),E.flipSided&&a.enable(12),E.useDepthPacking&&a.enable(13),E.dithering&&a.enable(14),E.transmission&&a.enable(15),E.sheen&&a.enable(16),E.opaque&&a.enable(17),E.pointsUvs&&a.enable(18),E.decodeVideoTexture&&a.enable(19),E.decodeVideoTextureEmissive&&a.enable(20),E.alphaToCoverage&&a.enable(21),E.numLightProbeGrids>0&&a.enable(22),E.hasPositionAttribute&&a.enable(23),_.push(a.mask)}function A(_){const E=u[_.type];let C;if(E){const P=vn[E];C=Vu.clone(P.uniforms)}else C=_.uniforms;return C}function x(_,E){let C=h.get(E);return C!==void 0?++C.usedTimes:(C=new Qg(s,E,_,i),l.push(C),h.set(E,C)),C}function M(_){if(--_.usedTimes===0){const E=l.indexOf(_);l[E]=l[l.length-1],l.pop(),h.delete(_.cacheKey),_.destroy()}}function y(_){o.remove(_)}function w(){o.dispose()}return{getParameters:v,getProgramCacheKey:p,getUniforms:A,acquireProgram:x,releaseProgram:M,releaseShaderCache:y,programs:l,dispose:w}}function r_(){let s=new WeakMap;function e(a){return s.has(a)}function t(a){let o=s.get(a);return o===void 0&&(o={},s.set(a,o)),o}function n(a){s.delete(a)}function i(a,o,c){s.get(a)[o]=c}function r(){s=new WeakMap}return{has:e,get:t,remove:n,update:i,dispose:r}}function a_(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.material.id!==e.material.id?s.material.id-e.material.id:s.materialVariant!==e.materialVariant?s.materialVariant-e.materialVariant:s.z!==e.z?s.z-e.z:s.id-e.id}function bl(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.z!==e.z?e.z-s.z:s.id-e.id}function Ml(){const s=[];let e=0;const t=[],n=[],i=[];function r(){e=0,t.length=0,n.length=0,i.length=0}function a(f){let u=0;return f.isInstancedMesh&&(u+=2),f.isSkinnedMesh&&(u+=1),u}function o(f,u,g,v,p,m){let T=s[e];return T===void 0?(T={id:f.id,object:f,geometry:u,material:g,materialVariant:a(f),groupOrder:v,renderOrder:f.renderOrder,z:p,group:m},s[e]=T):(T.id=f.id,T.object=f,T.geometry=u,T.material=g,T.materialVariant=a(f),T.groupOrder=v,T.renderOrder=f.renderOrder,T.z=p,T.group=m),e++,T}function c(f,u,g,v,p,m,T){T.reversedDepth===!0&&(p=-p);const A=o(f,u,g,v,p,m);g.transmission>0?n.push(A):g.transparent===!0?i.push(A):t.push(A)}function l(f,u,g,v,p,m){const T=o(f,u,g,v,p,m);g.transmission>0?n.unshift(T):g.transparent===!0?i.unshift(T):t.unshift(T)}function h(f,u){t.length>1&&t.sort(f||a_),n.length>1&&n.sort(u||bl),i.length>1&&i.sort(u||bl)}function d(){for(let f=e,u=s.length;f<u;f++){const g=s[f];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:t,transmissive:n,transparent:i,init:r,push:c,unshift:l,finish:d,sort:h}}function o_(){let s=new WeakMap;function e(n,i){const r=s.get(n);let a;return r===void 0?(a=new Ml,s.set(n,[a])):i>=r.length?(a=new Ml,r.push(a)):a=r[i],a}function t(){s=new WeakMap}return{get:e,dispose:t}}function c_(){const s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={direction:new k,color:new Ce};break;case"SpotLight":t={position:new k,direction:new k,color:new Ce,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new k,color:new Ce,distance:0,decay:0};break;case"HemisphereLight":t={direction:new k,skyColor:new Ce,groundColor:new Ce};break;case"RectAreaLight":t={color:new Ce,position:new k,halfWidth:new k,halfHeight:new k};break}return s[e.id]=t,t}}}function l_(){const s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ke};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ke};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ke,shadowCameraNear:1,shadowCameraFar:1e3};break}return s[e.id]=t,t}}}let h_=0;function d_(s,e){return(e.castShadow?2:0)-(s.castShadow?2:0)+(e.map?1:0)-(s.map?1:0)}function u_(s){const e=new c_,t=l_(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)n.probe.push(new k);const i=new k,r=new Ue,a=new Ue;function o(l){let h=0,d=0,f=0;for(let D=0;D<9;D++)n.probe[D].set(0,0,0);let u=0,g=0,v=0,p=0,m=0,T=0,A=0,x=0,M=0,y=0,w=0,_=0,E=0,C=0;l.sort(d_);for(let D=0,F=l.length;D<F;D++){const I=l[D],z=I.color,Y=I.intensity,B=I.distance;let W=null;if(I.shadow&&I.shadow.map&&(I.shadow.map.texture.format===fi?W=I.shadow.map.texture:W=I.shadow.map.depthTexture||I.shadow.map.texture),I.isAmbientLight)h+=z.r*Y,d+=z.g*Y,f+=z.b*Y;else if(I.isLightProbe){for(let V=0;V<9;V++)n.probe[V].addScaledVector(I.sh.coefficients[V],Y);C++}else if(I.isSunLight){const V=e.get(I);if(V.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){const K=I.shadow,Z=t.get(I);Z.shadowIntensity=K.intensity,Z.shadowBias=K.bias,Z.shadowNormalBias=K.normalBias,Z.shadowRadius=K.radius,Z.shadowMapSize.copy(K.mapSize).multiply(K.getFrameExtents()),n.sunShadow[g]=Z,n.sunShadowMap[g]=W;const de=K.getViewportCount();for(let ve=0;ve<de;ve++)n.sunShadowMatrix[v+ve]=K.getMatrix(ve),n.sunShadowCascade[v+ve]=K._cascadeData[ve];v+=de,g++}n.sun[u]=V,u++}else if(I.isDirectionalLight){const V=e.get(I);if(V.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){const K=I.shadow,Z=t.get(I);Z.shadowIntensity=K.intensity,Z.shadowBias=K.bias,Z.shadowNormalBias=K.normalBias,Z.shadowRadius=K.radius,Z.shadowMapSize=K.mapSize,n.directionalShadow[p]=Z,n.directionalShadowMap[p]=W,n.directionalShadowMatrix[p]=I.shadow.matrix,M++}n.directional[p]=V,p++}else if(I.isSpotLight){const V=e.get(I);V.position.setFromMatrixPosition(I.matrixWorld),V.color.copy(z).multiplyScalar(Y),V.distance=B,V.coneCos=Math.cos(I.angle),V.penumbraCos=Math.cos(I.angle*(1-I.penumbra)),V.decay=I.decay,n.spot[T]=V;const K=I.shadow;if(I.map&&(n.spotLightMap[_]=I.map,_++,K.updateMatrices(I),I.castShadow&&E++),n.spotLightMatrix[T]=K.matrix,I.castShadow){const Z=t.get(I);Z.shadowIntensity=K.intensity,Z.shadowBias=K.bias,Z.shadowNormalBias=K.normalBias,Z.shadowRadius=K.radius,Z.shadowMapSize=K.mapSize,n.spotShadow[T]=Z,n.spotShadowMap[T]=W,w++}T++}else if(I.isRectAreaLight){const V=e.get(I);V.color.copy(z).multiplyScalar(Y),V.halfWidth.set(I.width*.5,0,0),V.halfHeight.set(0,I.height*.5,0),n.rectArea[A]=V,A++}else if(I.isPointLight){const V=e.get(I);if(V.color.copy(I.color).multiplyScalar(I.intensity),V.distance=I.distance,V.decay=I.decay,I.castShadow){const K=I.shadow,Z=t.get(I);Z.shadowIntensity=K.intensity,Z.shadowBias=K.bias,Z.shadowNormalBias=K.normalBias,Z.shadowRadius=K.radius,Z.shadowMapSize=K.mapSize,Z.shadowCameraNear=K.camera.near,Z.shadowCameraFar=K.camera.far,n.pointShadow[m]=Z,n.pointShadowMap[m]=W,n.pointShadowMatrix[m]=I.shadow.matrix,y++}n.point[m]=V,m++}else if(I.isHemisphereLight){const V=e.get(I);V.skyColor.copy(I.color).multiplyScalar(Y),V.groundColor.copy(I.groundColor).multiplyScalar(Y),n.hemi[x]=V,x++}}A>0&&(s.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=he.LTC_FLOAT_1,n.rectAreaLTC2=he.LTC_FLOAT_2):(n.rectAreaLTC1=he.LTC_HALF_1,n.rectAreaLTC2=he.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=d,n.ambient[2]=f;const P=n.hash;(P.sunLength!==u||P.directionalLength!==p||P.pointLength!==m||P.spotLength!==T||P.rectAreaLength!==A||P.hemiLength!==x||P.numSunShadows!==g||P.numDirectionalShadows!==M||P.numPointShadows!==y||P.numSpotShadows!==w||P.numSpotMaps!==_||P.numLightProbes!==C)&&(n.sun.length=u,n.directional.length=p,n.spot.length=T,n.rectArea.length=A,n.point.length=m,n.hemi.length=x,n.sunShadow.length=g,n.sunShadowMap.length=g,n.sunShadowMatrix.length=v,n.sunShadowCascade.length=v,n.directionalShadow.length=M,n.directionalShadowMap.length=M,n.directionalShadowMatrix.length=M,n.pointShadow.length=y,n.pointShadowMap.length=y,n.pointShadowMatrix.length=y,n.spotShadow.length=w,n.spotShadowMap.length=w,n.spotLightMatrix.length=w+_-E,n.spotLightMap.length=_,n.numSpotLightShadowsWithMaps=E,n.numLightProbes=C,P.sunLength=u,P.directionalLength=p,P.pointLength=m,P.spotLength=T,P.rectAreaLength=A,P.hemiLength=x,P.numSunShadows=g,P.numDirectionalShadows=M,P.numPointShadows=y,P.numSpotShadows=w,P.numSpotMaps=_,P.numLightProbes=C,n.version=h_++)}function c(l,h){let d=0,f=0,u=0,g=0,v=0,p=0;const m=h.matrixWorldInverse;for(let T=0,A=l.length;T<A;T++){const x=l[T];if(x.isSunLight){const M=n.sun[d];M.direction.setFromMatrixPosition(x.matrixWorld),M.direction.transformDirection(m),d++}else if(x.isDirectionalLight){const M=n.directional[f];M.direction.setFromMatrixPosition(x.matrixWorld),i.setFromMatrixPosition(x.target.matrixWorld),M.direction.sub(i),M.direction.transformDirection(m),f++}else if(x.isSpotLight){const M=n.spot[g];M.position.setFromMatrixPosition(x.matrixWorld),M.position.applyMatrix4(m),M.direction.setFromMatrixPosition(x.matrixWorld),i.setFromMatrixPosition(x.target.matrixWorld),M.direction.sub(i),M.direction.transformDirection(m),g++}else if(x.isRectAreaLight){const M=n.rectArea[v];M.position.setFromMatrixPosition(x.matrixWorld),M.position.applyMatrix4(m),a.identity(),r.copy(x.matrixWorld),r.premultiply(m),a.extractRotation(r),M.halfWidth.set(x.width*.5,0,0),M.halfHeight.set(0,x.height*.5,0),M.halfWidth.applyMatrix4(a),M.halfHeight.applyMatrix4(a),v++}else if(x.isPointLight){const M=n.point[u];M.position.setFromMatrixPosition(x.matrixWorld),M.position.applyMatrix4(m),u++}else if(x.isHemisphereLight){const M=n.hemi[p];M.direction.setFromMatrixPosition(x.matrixWorld),M.direction.transformDirection(m),p++}}}return{setup:o,setupView:c,state:n}}function yl(s){const e=new u_(s),t=[],n=[],i=[];function r(f){d.camera=f,t.length=0,n.length=0,i.length=0}function a(f){t.push(f)}function o(f){n.push(f)}function c(f){i.push(f)}function l(){e.setup(t)}function h(f){e.setupView(t,f)}const d={lightsArray:t,shadowsArray:n,lightProbeGridArray:i,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:d,setupLights:l,setupLightsView:h,pushLight:a,pushShadow:o,pushLightProbeGrid:c}}function f_(s){let e=new WeakMap;function t(i,r=0){const a=e.get(i);let o;return a===void 0?(o=new yl(s),e.set(i,[o])):r>=a.length?(o=new yl(s),a.push(o)):o=a[r],o}function n(){e=new WeakMap}return{get:t,dispose:n}}const p_=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,m_=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,g_=[new k(1,0,0),new k(-1,0,0),new k(0,1,0),new k(0,-1,0),new k(0,0,1),new k(0,0,-1)],__=[new k(0,-1,0),new k(0,-1,0),new k(0,0,1),new k(0,0,-1),new k(0,-1,0),new k(0,-1,0)],Sl=new Ue,os=new k,Ta=new k;function v_(s,e,t){let n=new ko;const i=new ke,r=new ke,a=new it,o=new Ku,c=new $u,l={},h=t.maxTextureSize,d={[Qn]:Nt,[Nt]:Qn,[xn]:xn},f=new wn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new ke},radius:{value:4}},vertexShader:p_,fragmentShader:m_}),u=f.clone();u.defines.HORIZONTAL_PASS=1;const g=new Bt;g.setAttribute("position",new Pt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const v=new It(g,f),p=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=cr;let m=this.type;this.render=function(y,w,_){if(p.enabled===!1||p.autoUpdate===!1&&p.needsUpdate===!1||y.length===0)return;this.type===ld&&(Te("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=cr);const E=s.getRenderTarget(),C=s.getActiveCubeFace(),P=s.getActiveMipmapLevel(),D=s.state;D.setBlending(Nn),D.buffers.depth.getReversed()===!0?D.buffers.color.setClear(0,0,0,0):D.buffers.color.setClear(1,1,1,1),D.buffers.depth.setTest(!0),D.setScissorTest(!1);const F=m!==this.type;F&&w.traverse(function(I){I.material&&(Array.isArray(I.material)?I.material.forEach(z=>z.needsUpdate=!0):I.material.needsUpdate=!0)});for(let I=0,z=y.length;I<z;I++){const Y=y[I],B=Y.shadow;if(B===void 0){Te("WebGLShadowMap:",Y,"has no shadow.");continue}if(B.autoUpdate===!1&&B.needsUpdate===!1)continue;i.copy(B.mapSize);const W=B.getFrameExtents();i.multiply(W),r.copy(B.mapSize),(i.x>h||i.y>h)&&(i.x>h&&(r.x=Math.floor(h/W.x),i.x=r.x*W.x,B.mapSize.x=r.x),i.y>h&&(r.y=Math.floor(h/W.y),i.y=r.y*W.y,B.mapSize.y=r.y));const V=s.state.buffers.depth.getReversed();if(B.camera._reversedDepth=V,B.map===null||F===!0){if(B.map!==null&&(B.map.depthTexture!==null&&(B.map.depthTexture.dispose(),B.map.depthTexture=null),B.map.dispose()),this.type===hs){if(Y.isPointLight){Te("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}B.map=new cn(i.x,i.y,{format:fi,type:Sn,minFilter:bt,magFilter:bt,generateMipmaps:!1}),B.map.texture.name=Y.name+".shadowMap",B.map.depthTexture=new ws(i.x,i.y,Zt),B.map.depthTexture.name=Y.name+".shadowMapDepth",B.map.depthTexture.format=kn,B.map.depthTexture.compareFunction=null,B.map.depthTexture.minFilter=vt,B.map.depthTexture.magFilter=vt}else Y.isPointLight?(B.map=new wh(i.x),B.map.depthTexture=new Gu(i.x,yn)):(B.map=new cn(i.x,i.y),B.map.depthTexture=new ws(i.x,i.y,yn)),B.map.depthTexture.name=Y.name+".shadowMap",B.map.depthTexture.format=kn,this.type===cr?(B.map.depthTexture.compareFunction=V?Do:Lo,B.map.depthTexture.minFilter=bt,B.map.depthTexture.magFilter=bt):(B.map.depthTexture.compareFunction=null,B.map.depthTexture.minFilter=vt,B.map.depthTexture.magFilter=vt);B.camera.updateProjectionMatrix()}B.map.isWebGLCubeRenderTarget!==!0&&(B.map.width!==i.x||B.map.height!==i.y)&&B.map.setSize(i.x,i.y);const K=B.map.isWebGLCubeRenderTarget?6:B.getViewportCount();Y.isPointLight!==!0&&B.updateMatrices(Y,_);for(let Z=0;Z<K;Z++){const de=B.getCamera(Z);if(Y.isPointLight){const ve=B.camera,Xe=B.matrix,qe=Y.distance||ve.far;qe!==ve.far&&(ve.far=qe,ve.updateProjectionMatrix()),os.setFromMatrixPosition(Y.matrixWorld),ve.position.copy(os),Ta.copy(ve.position),Ta.add(g_[Z]),ve.up.copy(__[Z]),ve.lookAt(Ta),ve.updateMatrixWorld(),Xe.makeTranslation(-os.x,-os.y,-os.z),Sl.multiplyMatrices(ve.projectionMatrix,ve.matrixWorldInverse),B._frustum.setFromProjectionMatrix(Sl,ve.coordinateSystem,ve.reversedDepth)}if(B.map.isWebGLCubeRenderTarget)s.setRenderTarget(B.map,Z),s.clear();else{Z===0&&(s.setRenderTarget(B.map),s.clear());const ve=B.getViewport(Z);a.set(r.x*ve.x,r.y*ve.y,r.x*ve.z,r.y*ve.w),D.viewport(a)}n=B.getFrustum(Z),x(w,_,de,Y,this.type)}B.isPointLightShadow!==!0&&this.type===hs&&T(B,_),B.needsUpdate=!1}m=this.type,p.needsUpdate=!1,s.setRenderTarget(E,C,P)};function T(y,w){const _=e.update(v);f.defines.VSM_SAMPLES!==y.blurSamples&&(f.defines.VSM_SAMPLES=y.blurSamples,u.defines.VSM_SAMPLES=y.blurSamples,f.needsUpdate=!0,u.needsUpdate=!0),y.mapPass===null?y.mapPass=new cn(i.x,i.y,{format:fi,type:Sn}):(y.mapPass.width!==y.map.width||y.mapPass.height!==y.map.height)&&y.mapPass.setSize(y.map.width,y.map.height),f.uniforms.shadow_pass.value=y.map.depthTexture,f.uniforms.resolution.value.set(y.map.width,y.map.height),f.uniforms.radius.value=y.radius,s.setRenderTarget(y.mapPass),s.clear(),s.renderBufferDirect(w,null,_,f,v,null),u.uniforms.shadow_pass.value=y.mapPass.texture,u.uniforms.resolution.value.set(y.map.width,y.map.height),u.uniforms.radius.value=y.radius,s.setRenderTarget(y.map),s.clear(),s.renderBufferDirect(w,null,_,u,v,null)}function A(y,w,_,E){let C=null;const P=_.isPointLight===!0?y.customDistanceMaterial:y.customDepthMaterial;if(P!==void 0)C=P;else if(C=_.isPointLight===!0?c:o,s.localClippingEnabled&&w.clipShadows===!0&&Array.isArray(w.clippingPlanes)&&w.clippingPlanes.length!==0||w.displacementMap&&w.displacementScale!==0||w.alphaMap&&w.alphaTest>0||w.map&&w.alphaTest>0||w.alphaToCoverage===!0){const D=C.uuid,F=w.uuid;let I=l[D];I===void 0&&(I={},l[D]=I);let z=I[F];z===void 0&&(z=C.clone(),I[F]=z,w.addEventListener("dispose",M)),C=z}if(C.visible=w.visible,C.wireframe=w.wireframe,E===hs?C.side=w.shadowSide!==null?w.shadowSide:w.side:C.side=w.shadowSide!==null?w.shadowSide:d[w.side],C.alphaMap=w.alphaMap,C.alphaTest=w.alphaToCoverage===!0?.5:w.alphaTest,C.map=w.map,C.clipShadows=w.clipShadows,C.clippingPlanes=w.clippingPlanes,C.clipIntersection=w.clipIntersection,C.displacementMap=w.displacementMap,C.displacementScale=w.displacementScale,C.displacementBias=w.displacementBias,C.wireframeLinewidth=w.wireframeLinewidth,C.linewidth=w.linewidth,_.isPointLight===!0&&C.isMeshDistanceMaterial===!0){const D=s.properties.get(C);D.light=_}return C}function x(y,w,_,E,C){if(y.visible===!1)return;if(y.layers.test(w.layers)&&(y.isMesh||y.isLine||y.isPoints)&&(y.castShadow||y.receiveShadow&&C===hs)&&(!y.frustumCulled||y.intersectsFrustum(n))){y.modelViewMatrix.multiplyMatrices(_.matrixWorldInverse,y.matrixWorld);const F=e.update(y),I=y.material;if(Array.isArray(I)){const z=F.groups;for(let Y=0,B=z.length;Y<B;Y++){const W=z[Y],V=I[W.materialIndex];if(V&&V.visible){const K=A(y,V,E,C);y.onBeforeShadow(s,y,w,_,F,K,W),s.renderBufferDirect(_,null,F,K,y,W),y.onAfterShadow(s,y,w,_,F,K,W)}}}else if(I.visible){const z=A(y,I,E,C);y.onBeforeShadow(s,y,w,_,F,z,null),s.renderBufferDirect(_,null,F,z,y,null),y.onAfterShadow(s,y,w,_,F,z,null)}}const D=y.children;for(let F=0,I=D.length;F<I;F++)x(D[F],w,_,E,C)}function M(y){y.target.removeEventListener("dispose",M);for(const _ in l){const E=l[_],C=y.target.uuid;C in E&&(E[C].dispose(),delete E[C])}}}function x_(s,e){function t(){let U=!1;const oe=new it;let Q=null;const ce=new it(0,0,0,0);return{setMask:function(pe){Q!==pe&&!U&&(s.colorMask(pe,pe,pe,pe),Q=pe)},setLocked:function(pe){U=pe},setClear:function(pe,ne,Ae,ye,at){at===!0&&(pe*=ye,ne*=ye,Ae*=ye),oe.set(pe,ne,Ae,ye),ce.equals(oe)===!1&&(s.clearColor(pe,ne,Ae,ye),ce.copy(oe))},reset:function(){U=!1,Q=null,ce.set(-1,0,0,0)}}}function n(){let U=!1,oe=!1,Q=null,ce=null,pe=null;return{setReversed:function(ne){if(oe!==ne){const Ae=e.get("EXT_clip_control");ne?Ae.clipControlEXT(Ae.LOWER_LEFT_EXT,Ae.ZERO_TO_ONE_EXT):Ae.clipControlEXT(Ae.LOWER_LEFT_EXT,Ae.NEGATIVE_ONE_TO_ONE_EXT),oe=ne;const ye=pe;pe=null,this.setClear(ye)}},getReversed:function(){return oe},setTest:function(ne){ne?te(s.DEPTH_TEST):xe(s.DEPTH_TEST)},setMask:function(ne){Q!==ne&&!U&&(s.depthMask(ne),Q=ne)},setFunc:function(ne){if(oe&&(ne=Yd[ne]),ce!==ne){switch(ne){case Ia:s.depthFunc(s.NEVER);break;case La:s.depthFunc(s.ALWAYS);break;case Da:s.depthFunc(s.LESS);break;case gs:s.depthFunc(s.LEQUAL);break;case Ua:s.depthFunc(s.EQUAL);break;case Na:s.depthFunc(s.GEQUAL);break;case Fa:s.depthFunc(s.GREATER);break;case ka:s.depthFunc(s.NOTEQUAL);break;default:s.depthFunc(s.LEQUAL)}ce=ne}},setLocked:function(ne){U=ne},setClear:function(ne){pe!==ne&&(pe=ne,oe&&(ne=1-ne),s.clearDepth(ne))},reset:function(){U=!1,Q=null,ce=null,pe=null,oe=!1}}}function i(){let U=!1,oe=null,Q=null,ce=null,pe=null,ne=null,Ae=null,ye=null,at=null;return{setTest:function(Ze){U||(Ze?te(s.STENCIL_TEST):xe(s.STENCIL_TEST))},setMask:function(Ze){oe!==Ze&&!U&&(s.stencilMask(Ze),oe=Ze)},setFunc:function(Ze,Jt,fn){(Q!==Ze||ce!==Jt||pe!==fn)&&(s.stencilFunc(Ze,Jt,fn),Q=Ze,ce=Jt,pe=fn)},setOp:function(Ze,Jt,fn){(ne!==Ze||Ae!==Jt||ye!==fn)&&(s.stencilOp(Ze,Jt,fn),ne=Ze,Ae=Jt,ye=fn)},setLocked:function(Ze){U=Ze},setClear:function(Ze){at!==Ze&&(s.clearStencil(Ze),at=Ze)},reset:function(){U=!1,oe=null,Q=null,ce=null,pe=null,ne=null,Ae=null,ye=null,at=null}}}const r=new t,a=new n,o=new i,c=new WeakMap,l=new WeakMap;let h={},d={},f={},u=new WeakMap,g=[],v=null,p=!1,m=null,T=null,A=null,x=null,M=null,y=null,w=null,_=new Ce(0,0,0),E=0,C=!1,P=null,D=null,F=null,I=null,z=null;const Y=s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let B=!1,W=0;const V=s.getParameter(s.VERSION);V.indexOf("WebGL")!==-1?(W=parseFloat(/^WebGL (\d)/.exec(V)[1]),B=W>=1):V.indexOf("OpenGL ES")!==-1&&(W=parseFloat(/^OpenGL ES (\d)/.exec(V)[1]),B=W>=2);let K=null,Z={};const de=s.getParameter(s.SCISSOR_BOX),ve=s.getParameter(s.VIEWPORT),Xe=new it().fromArray(de),qe=new it().fromArray(ve);function $e(U,oe,Q,ce){const pe=new Uint8Array(4),ne=s.createTexture();s.bindTexture(U,ne),s.texParameteri(U,s.TEXTURE_MIN_FILTER,s.NEAREST),s.texParameteri(U,s.TEXTURE_MAG_FILTER,s.NEAREST);for(let Ae=0;Ae<Q;Ae++)U===s.TEXTURE_3D||U===s.TEXTURE_2D_ARRAY?s.texImage3D(oe,0,s.RGBA,1,1,ce,0,s.RGBA,s.UNSIGNED_BYTE,pe):s.texImage2D(oe+Ae,0,s.RGBA,1,1,0,s.RGBA,s.UNSIGNED_BYTE,pe);return ne}const j={};j[s.TEXTURE_2D]=$e(s.TEXTURE_2D,s.TEXTURE_2D,1),j[s.TEXTURE_CUBE_MAP]=$e(s.TEXTURE_CUBE_MAP,s.TEXTURE_CUBE_MAP_POSITIVE_X,6),j[s.TEXTURE_2D_ARRAY]=$e(s.TEXTURE_2D_ARRAY,s.TEXTURE_2D_ARRAY,1,1),j[s.TEXTURE_3D]=$e(s.TEXTURE_3D,s.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),te(s.DEPTH_TEST),a.setFunc(gs),We(!1),lt(hc),te(s.CULL_FACE),Ke(Nn);function te(U){h[U]!==!0&&(s.enable(U),h[U]=!0)}function xe(U){h[U]!==!1&&(s.disable(U),h[U]=!1)}function Ie(U,oe){return f[U]!==oe?(s.bindFramebuffer(U,oe),f[U]=oe,U===s.DRAW_FRAMEBUFFER&&(f[s.FRAMEBUFFER]=oe),U===s.FRAMEBUFFER&&(f[s.DRAW_FRAMEBUFFER]=oe),!0):!1}function ge(U,oe){let Q=g,ce=!1;if(U){Q=u.get(oe),Q===void 0&&(Q=[],u.set(oe,Q));const pe=U.textures;if(Q.length!==pe.length||Q[0]!==s.COLOR_ATTACHMENT0){for(let ne=0,Ae=pe.length;ne<Ae;ne++)Q[ne]=s.COLOR_ATTACHMENT0+ne;Q.length=pe.length,ce=!0}}else Q[0]!==s.BACK&&(Q[0]=s.BACK,ce=!0);ce&&s.drawBuffers(Q)}function Oe(U){return v!==U?(s.useProgram(U),v=U,!0):!1}const xt={[Ui]:s.FUNC_ADD,[dd]:s.FUNC_SUBTRACT,[ud]:s.FUNC_REVERSE_SUBTRACT};xt[fd]=s.MIN,xt[pd]=s.MAX;const Ge={[md]:s.ZERO,[gd]:s.ONE,[_d]:s.SRC_COLOR,[Ol]:s.SRC_ALPHA,[Sd]:s.SRC_ALPHA_SATURATE,[Md]:s.DST_COLOR,[xd]:s.DST_ALPHA,[vd]:s.ONE_MINUS_SRC_COLOR,[Bl]:s.ONE_MINUS_SRC_ALPHA,[yd]:s.ONE_MINUS_DST_COLOR,[bd]:s.ONE_MINUS_DST_ALPHA,[wd]:s.CONSTANT_COLOR,[Ed]:s.ONE_MINUS_CONSTANT_COLOR,[Td]:s.CONSTANT_ALPHA,[Ad]:s.ONE_MINUS_CONSTANT_ALPHA};function Ke(U,oe,Q,ce,pe,ne,Ae,ye,at,Ze){if(U===Nn){p===!0&&(xe(s.BLEND),p=!1);return}if(p===!1&&(te(s.BLEND),p=!0),U!==hd){if(U!==m||Ze!==C){if((T!==Ui||M!==Ui)&&(s.blendEquation(s.FUNC_ADD),T=Ui,M=Ui),Ze)switch(U){case fs:s.blendFuncSeparate(s.ONE,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case dc:s.blendFunc(s.ONE,s.ONE);break;case uc:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case fc:s.blendFuncSeparate(s.DST_COLOR,s.ONE_MINUS_SRC_ALPHA,s.ZERO,s.ONE);break;default:Pe("WebGLState: Invalid blending: ",U);break}else switch(U){case fs:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case dc:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE,s.ONE,s.ONE);break;case uc:Pe("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case fc:Pe("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Pe("WebGLState: Invalid blending: ",U);break}A=null,x=null,y=null,w=null,_.set(0,0,0),E=0,m=U,C=Ze}return}pe=pe||oe,ne=ne||Q,Ae=Ae||ce,(oe!==T||pe!==M)&&(s.blendEquationSeparate(xt[oe],xt[pe]),T=oe,M=pe),(Q!==A||ce!==x||ne!==y||Ae!==w)&&(s.blendFuncSeparate(Ge[Q],Ge[ce],Ge[ne],Ge[Ae]),A=Q,x=ce,y=ne,w=Ae),(ye.equals(_)===!1||at!==E)&&(s.blendColor(ye.r,ye.g,ye.b,at),_.copy(ye),E=at),m=U,C=!1}function rt(U,oe){U.side===xn?xe(s.CULL_FACE):te(s.CULL_FACE);let Q=U.side===Nt;oe&&(Q=!Q),We(Q),U.blending===fs&&U.transparent===!1?Ke(Nn):Ke(U.blending,U.blendEquation,U.blendSrc,U.blendDst,U.blendEquationAlpha,U.blendSrcAlpha,U.blendDstAlpha,U.blendColor,U.blendAlpha,U.premultipliedAlpha),a.setFunc(U.depthFunc),a.setTest(U.depthTest),a.setMask(U.depthWrite),r.setMask(U.colorWrite);const ce=U.stencilWrite;o.setTest(ce),ce&&(o.setMask(U.stencilWriteMask),o.setFunc(U.stencilFunc,U.stencilRef,U.stencilFuncMask),o.setOp(U.stencilFail,U.stencilZFail,U.stencilZPass)),Ft(U.polygonOffset,U.polygonOffsetFactor,U.polygonOffsetUnits),U.alphaToCoverage===!0?te(s.SAMPLE_ALPHA_TO_COVERAGE):xe(s.SAMPLE_ALPHA_TO_COVERAGE)}function We(U){P!==U&&(U?s.frontFace(s.CW):s.frontFace(s.CCW),P=U)}function lt(U){U!==od?(te(s.CULL_FACE),U!==D&&(U===hc?s.cullFace(s.BACK):U===cd?s.cullFace(s.FRONT):s.cullFace(s.FRONT_AND_BACK))):xe(s.CULL_FACE),D=U}function St(U){U!==F&&(B&&s.lineWidth(U),F=U)}function Ft(U,oe,Q){U?(te(s.POLYGON_OFFSET_FILL),(I!==oe||z!==Q)&&(I=oe,z=Q,a.getReversed()&&(oe=-oe),s.polygonOffset(oe,Q))):xe(s.POLYGON_OFFSET_FILL)}function dt(U){U?te(s.SCISSOR_TEST):xe(s.SCISSOR_TEST)}function mt(U){U===void 0&&(U=s.TEXTURE0+Y-1),K!==U&&(s.activeTexture(U),K=U)}function N(U,oe,Q){Q===void 0&&(K===null?Q=s.TEXTURE0+Y-1:Q=K);let ce=Z[Q];ce===void 0&&(ce={type:void 0,texture:void 0},Z[Q]=ce),(ce.type!==U||ce.texture!==oe)&&(K!==Q&&(s.activeTexture(Q),K=Q),s.bindTexture(U,oe||j[U]),ce.type=U,ce.texture=oe)}function Tt(){const U=Z[K];U!==void 0&&U.type!==void 0&&(s.bindTexture(U.type,null),U.type=void 0,U.texture=void 0)}function Qe(){try{s.compressedTexImage2D(...arguments)}catch(U){Pe("WebGLState:",U)}}function R(){try{s.compressedTexImage3D(...arguments)}catch(U){Pe("WebGLState:",U)}}function b(){try{s.texSubImage2D(...arguments)}catch(U){Pe("WebGLState:",U)}}function O(){try{s.texSubImage3D(...arguments)}catch(U){Pe("WebGLState:",U)}}function X(){try{s.compressedTexSubImage2D(...arguments)}catch(U){Pe("WebGLState:",U)}}function $(){try{s.compressedTexSubImage3D(...arguments)}catch(U){Pe("WebGLState:",U)}}function ie(){try{s.texStorage2D(...arguments)}catch(U){Pe("WebGLState:",U)}}function se(){try{s.texStorage3D(...arguments)}catch(U){Pe("WebGLState:",U)}}function J(){try{s.texImage2D(...arguments)}catch(U){Pe("WebGLState:",U)}}function ee(){try{s.texImage3D(...arguments)}catch(U){Pe("WebGLState:",U)}}function re(U){return d[U]!==void 0?d[U]:s.getParameter(U)}function we(U,oe){d[U]!==oe&&(s.pixelStorei(U,oe),d[U]=oe)}function le(U){Xe.equals(U)===!1&&(s.scissor(U.x,U.y,U.z,U.w),Xe.copy(U))}function ae(U){qe.equals(U)===!1&&(s.viewport(U.x,U.y,U.z,U.w),qe.copy(U))}function Ee(U,oe){let Q=l.get(oe);Q===void 0&&(Q=new WeakMap,l.set(oe,Q));let ce=Q.get(U);ce===void 0&&(ce=s.getUniformBlockIndex(oe,U.name),Q.set(U,ce))}function Re(U,oe){const ce=l.get(oe).get(U);c.get(oe)!==ce&&(s.uniformBlockBinding(oe,ce,U.__bindingPointIndex),c.set(oe,ce))}function De(){s.disable(s.BLEND),s.disable(s.CULL_FACE),s.disable(s.DEPTH_TEST),s.disable(s.POLYGON_OFFSET_FILL),s.disable(s.SCISSOR_TEST),s.disable(s.STENCIL_TEST),s.disable(s.SAMPLE_ALPHA_TO_COVERAGE),s.blendEquation(s.FUNC_ADD),s.blendFunc(s.ONE,s.ZERO),s.blendFuncSeparate(s.ONE,s.ZERO,s.ONE,s.ZERO),s.blendColor(0,0,0,0),s.colorMask(!0,!0,!0,!0),s.clearColor(0,0,0,0),s.depthMask(!0),s.depthFunc(s.LESS),a.setReversed(!1),s.clearDepth(1),s.stencilMask(4294967295),s.stencilFunc(s.ALWAYS,0,4294967295),s.stencilOp(s.KEEP,s.KEEP,s.KEEP),s.clearStencil(0),s.cullFace(s.BACK),s.frontFace(s.CCW),s.polygonOffset(0,0),s.activeTexture(s.TEXTURE0),s.bindFramebuffer(s.FRAMEBUFFER,null),s.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),s.bindFramebuffer(s.READ_FRAMEBUFFER,null),s.useProgram(null),s.lineWidth(1),s.scissor(0,0,s.canvas.width,s.canvas.height),s.viewport(0,0,s.canvas.width,s.canvas.height),s.pixelStorei(s.PACK_ALIGNMENT,4),s.pixelStorei(s.UNPACK_ALIGNMENT,4),s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,!1),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,s.BROWSER_DEFAULT_WEBGL),s.pixelStorei(s.PACK_ROW_LENGTH,0),s.pixelStorei(s.PACK_SKIP_PIXELS,0),s.pixelStorei(s.PACK_SKIP_ROWS,0),s.pixelStorei(s.UNPACK_ROW_LENGTH,0),s.pixelStorei(s.UNPACK_IMAGE_HEIGHT,0),s.pixelStorei(s.UNPACK_SKIP_PIXELS,0),s.pixelStorei(s.UNPACK_SKIP_ROWS,0),s.pixelStorei(s.UNPACK_SKIP_IMAGES,0),h={},d={},K=null,Z={},f={},u=new WeakMap,g=[],v=null,p=!1,m=null,T=null,A=null,x=null,M=null,y=null,w=null,_=new Ce(0,0,0),E=0,C=!1,P=null,D=null,F=null,I=null,z=null,Xe.set(0,0,s.canvas.width,s.canvas.height),qe.set(0,0,s.canvas.width,s.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:te,disable:xe,bindFramebuffer:Ie,drawBuffers:ge,useProgram:Oe,setBlending:Ke,setMaterial:rt,setFlipSided:We,setCullFace:lt,setLineWidth:St,setPolygonOffset:Ft,setScissorTest:dt,activeTexture:mt,bindTexture:N,unbindTexture:Tt,compressedTexImage2D:Qe,compressedTexImage3D:R,texImage2D:J,texImage3D:ee,pixelStorei:we,getParameter:re,updateUBOMapping:Ee,uniformBlockBinding:Re,texStorage2D:ie,texStorage3D:se,texSubImage2D:b,texSubImage3D:O,compressedTexSubImage2D:X,compressedTexSubImage3D:$,scissor:le,viewport:ae,reset:De}}function b_(s,e,t,n,i,r,a){const o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new ke,h=new WeakMap,d=new Set;let f;const u=new WeakMap;let g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function v(R,b){return g?new OffscreenCanvas(R,b):Ss("canvas")}function p(R,b,O){let X=1;const $=Qe(R);if(($.width>O||$.height>O)&&(X=O/Math.max($.width,$.height)),X<1)if(typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&R instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&R instanceof ImageBitmap||typeof VideoFrame<"u"&&R instanceof VideoFrame){const ie=Math.floor(X*$.width),se=Math.floor(X*$.height);f===void 0&&(f=v(ie,se));const J=b?v(ie,se):f;return J.width=ie,J.height=se,J.getContext("2d").drawImage(R,0,0,ie,se),Te("WebGLRenderer: Texture has been resized from ("+$.width+"x"+$.height+") to ("+ie+"x"+se+")."),J}else return"data"in R&&Te("WebGLRenderer: Image in DataTexture is too big ("+$.width+"x"+$.height+")."),R;return R}function m(R){return R.generateMipmaps}function T(R){s.generateMipmap(R)}function A(R){return R.isWebGLCubeRenderTarget?s.TEXTURE_CUBE_MAP:R.isWebGL3DRenderTarget?s.TEXTURE_3D:R.isWebGLArrayRenderTarget||R.isCompressedArrayTexture?s.TEXTURE_2D_ARRAY:s.TEXTURE_2D}function x(R,b,O,X,$,ie=!1){if(R!==null){if(s[R]!==void 0)return s[R];Te("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+R+"'")}let se;X&&(se=e.get("EXT_texture_norm16"),se||Te("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let J=b;if(b===s.RED&&(O===s.FLOAT&&(J=s.R32F),O===s.HALF_FLOAT&&(J=s.R16F),O===s.UNSIGNED_BYTE&&(J=s.R8),O===s.UNSIGNED_SHORT&&se&&(J=se.R16_EXT),O===s.SHORT&&se&&(J=se.R16_SNORM_EXT)),b===s.RED_INTEGER&&(O===s.UNSIGNED_BYTE&&(J=s.R8UI),O===s.UNSIGNED_SHORT&&(J=s.R16UI),O===s.UNSIGNED_INT&&(J=s.R32UI),O===s.BYTE&&(J=s.R8I),O===s.SHORT&&(J=s.R16I),O===s.INT&&(J=s.R32I)),b===s.RG&&(O===s.FLOAT&&(J=s.RG32F),O===s.HALF_FLOAT&&(J=s.RG16F),O===s.UNSIGNED_BYTE&&(J=s.RG8),O===s.UNSIGNED_SHORT&&se&&(J=se.RG16_EXT),O===s.SHORT&&se&&(J=se.RG16_SNORM_EXT)),b===s.RG_INTEGER&&(O===s.UNSIGNED_BYTE&&(J=s.RG8UI),O===s.UNSIGNED_SHORT&&(J=s.RG16UI),O===s.UNSIGNED_INT&&(J=s.RG32UI),O===s.BYTE&&(J=s.RG8I),O===s.SHORT&&(J=s.RG16I),O===s.INT&&(J=s.RG32I)),b===s.RGB_INTEGER&&(O===s.UNSIGNED_BYTE&&(J=s.RGB8UI),O===s.UNSIGNED_SHORT&&(J=s.RGB16UI),O===s.UNSIGNED_INT&&(J=s.RGB32UI),O===s.BYTE&&(J=s.RGB8I),O===s.SHORT&&(J=s.RGB16I),O===s.INT&&(J=s.RGB32I)),b===s.RGBA_INTEGER&&(O===s.UNSIGNED_BYTE&&(J=s.RGBA8UI),O===s.UNSIGNED_SHORT&&(J=s.RGBA16UI),O===s.UNSIGNED_INT&&(J=s.RGBA32UI),O===s.BYTE&&(J=s.RGBA8I),O===s.SHORT&&(J=s.RGBA16I),O===s.INT&&(J=s.RGBA32I)),b===s.RGB&&(O===s.UNSIGNED_SHORT&&se&&(J=se.RGB16_EXT),O===s.SHORT&&se&&(J=se.RGB16_SNORM_EXT),O===s.UNSIGNED_INT_5_9_9_9_REV&&(J=s.RGB9_E5),O===s.UNSIGNED_INT_10F_11F_11F_REV&&(J=s.R11F_G11F_B10F)),b===s.RGBA){const ee=ie?wr:Be.getTransfer($);O===s.FLOAT&&(J=s.RGBA32F),O===s.HALF_FLOAT&&(J=s.RGBA16F),O===s.UNSIGNED_BYTE&&(J=ee===et?s.SRGB8_ALPHA8:s.RGBA8),O===s.UNSIGNED_SHORT&&se&&(J=se.RGBA16_EXT),O===s.SHORT&&se&&(J=se.RGBA16_SNORM_EXT),O===s.UNSIGNED_SHORT_4_4_4_4&&(J=s.RGBA4),O===s.UNSIGNED_SHORT_5_5_5_1&&(J=s.RGB5_A1)}return(J===s.R16F||J===s.R32F||J===s.RG16F||J===s.RG32F||J===s.RGBA16F||J===s.RGBA32F)&&e.get("EXT_color_buffer_float"),J}function M(R,b){let O;return R?b===null||b===yn||b===vs?O=s.DEPTH24_STENCIL8:b===Zt?O=s.DEPTH32F_STENCIL8:b===_s&&(O=s.DEPTH24_STENCIL8,Te("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):b===null||b===yn||b===vs?O=s.DEPTH_COMPONENT24:b===Zt?O=s.DEPTH_COMPONENT32F:b===_s&&(O=s.DEPTH_COMPONENT16),O}function y(R,b){return m(R)===!0||R.isFramebufferTexture&&R.minFilter!==vt&&R.minFilter!==bt?Math.log2(Math.max(b.width,b.height))+1:R.mipmaps!==void 0&&R.mipmaps.length>0?R.mipmaps.length:R.isCompressedTexture&&Array.isArray(R.image)?b.mipmaps.length:1}function w(R){const b=R.target;b.removeEventListener("dispose",w),E(b),b.isVideoTexture&&h.delete(b),b.isHTMLTexture&&d.delete(b)}function _(R){const b=R.target;b.removeEventListener("dispose",_),P(b)}function E(R){const b=n.get(R);if(b.__webglInit===void 0)return;const O=R.source,X=u.get(O);if(X){const $=X[b.__cacheKey];$.usedTimes--,$.usedTimes===0&&C(R),Object.keys(X).length===0&&u.delete(O)}n.remove(R)}function C(R){const b=n.get(R);s.deleteTexture(b.__webglTexture);const O=R.source,X=u.get(O);delete X[b.__cacheKey],a.memory.textures--}function P(R){const b=n.get(R);if(R.depthTexture&&(R.depthTexture.dispose(),n.remove(R.depthTexture)),R.isWebGLCubeRenderTarget)for(let X=0;X<6;X++){if(Array.isArray(b.__webglFramebuffer[X]))for(let $=0;$<b.__webglFramebuffer[X].length;$++)s.deleteFramebuffer(b.__webglFramebuffer[X][$]);else s.deleteFramebuffer(b.__webglFramebuffer[X]);b.__webglDepthbuffer&&s.deleteRenderbuffer(b.__webglDepthbuffer[X])}else{if(Array.isArray(b.__webglFramebuffer))for(let X=0;X<b.__webglFramebuffer.length;X++)s.deleteFramebuffer(b.__webglFramebuffer[X]);else s.deleteFramebuffer(b.__webglFramebuffer);if(b.__webglDepthbuffer&&s.deleteRenderbuffer(b.__webglDepthbuffer),b.__webglMultisampledFramebuffer&&s.deleteFramebuffer(b.__webglMultisampledFramebuffer),b.__webglColorRenderbuffer)for(let X=0;X<b.__webglColorRenderbuffer.length;X++)b.__webglColorRenderbuffer[X]&&s.deleteRenderbuffer(b.__webglColorRenderbuffer[X]);b.__webglDepthRenderbuffer&&s.deleteRenderbuffer(b.__webglDepthRenderbuffer)}const O=R.textures;for(let X=0,$=O.length;X<$;X++){const ie=n.get(O[X]);ie.__webglTexture&&(s.deleteTexture(ie.__webglTexture),a.memory.textures--),n.remove(O[X])}n.remove(R)}let D=0;function F(){D=0}function I(){return D}function z(R){D=R}function Y(){const R=D;return R>=i.maxTextures&&Te("WebGLTextures: Trying to use "+(R+1)+" texture units while this GPU supports only "+i.maxTextures),D+=1,R}function B(R){const b=[];return b.push(R.wrapS),b.push(R.wrapT),b.push(R.wrapR||0),b.push(R.magFilter),b.push(R.minFilter),b.push(R.anisotropy),b.push(R.internalFormat),b.push(R.format),b.push(R.type),b.push(R.generateMipmaps),b.push(R.premultiplyAlpha),b.push(R.flipY),b.push(R.unpackAlignment),b.push(R.colorSpace),b.join()}function W(R,b){const O=n.get(R);if(R.isVideoTexture&&N(R),R.isRenderTargetTexture===!1&&R.isExternalTexture!==!0&&R.version>0&&O.__version!==R.version){const X=R.image;if(X===null)Te("WebGLRenderer: Texture marked for update but no image data found.");else if(X.complete===!1)Te("WebGLRenderer: Texture marked for update but image is incomplete");else{xe(O,R,b);return}}else R.isExternalTexture&&(O.__webglTexture=R.sourceTexture?R.sourceTexture:null);t.bindTexture(s.TEXTURE_2D,O.__webglTexture,s.TEXTURE0+b)}function V(R,b){const O=n.get(R);if(R.isRenderTargetTexture===!1&&R.version>0&&O.__version!==R.version){xe(O,R,b);return}else R.isExternalTexture&&(O.__webglTexture=R.sourceTexture?R.sourceTexture:null);t.bindTexture(s.TEXTURE_2D_ARRAY,O.__webglTexture,s.TEXTURE0+b)}function K(R,b){const O=n.get(R);if(R.isRenderTargetTexture===!1&&R.version>0&&O.__version!==R.version){xe(O,R,b);return}t.bindTexture(s.TEXTURE_3D,O.__webglTexture,s.TEXTURE0+b)}function Z(R,b){const O=n.get(R);if(R.isCubeDepthTexture!==!0&&R.version>0&&O.__version!==R.version){Ie(O,R,b);return}t.bindTexture(s.TEXTURE_CUBE_MAP,O.__webglTexture,s.TEXTURE0+b)}const de={[Vi]:s.REPEAT,[bn]:s.CLAMP_TO_EDGE,[br]:s.MIRRORED_REPEAT},ve={[vt]:s.NEAREST,[$l]:s.NEAREST_MIPMAP_NEAREST,[ds]:s.NEAREST_MIPMAP_LINEAR,[bt]:s.LINEAR,[lr]:s.LINEAR_MIPMAP_NEAREST,[Dn]:s.LINEAR_MIPMAP_LINEAR},Xe={[kd]:s.NEVER,[Hd]:s.ALWAYS,[Od]:s.LESS,[Lo]:s.LEQUAL,[Bd]:s.EQUAL,[Do]:s.GEQUAL,[zd]:s.GREATER,[Gd]:s.NOTEQUAL};function qe(R,b){if(b.type===Zt&&e.has("OES_texture_float_linear")===!1&&(b.magFilter===bt||b.magFilter===lr||b.magFilter===ds||b.magFilter===Dn||b.minFilter===bt||b.minFilter===lr||b.minFilter===ds||b.minFilter===Dn)&&Te("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),s.texParameteri(R,s.TEXTURE_WRAP_S,de[b.wrapS]),s.texParameteri(R,s.TEXTURE_WRAP_T,de[b.wrapT]),(R===s.TEXTURE_3D||R===s.TEXTURE_2D_ARRAY)&&s.texParameteri(R,s.TEXTURE_WRAP_R,de[b.wrapR]),s.texParameteri(R,s.TEXTURE_MAG_FILTER,ve[b.magFilter]),s.texParameteri(R,s.TEXTURE_MIN_FILTER,ve[b.minFilter]),b.compareFunction&&(s.texParameteri(R,s.TEXTURE_COMPARE_MODE,s.COMPARE_REF_TO_TEXTURE),s.texParameteri(R,s.TEXTURE_COMPARE_FUNC,Xe[b.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(b.magFilter===vt||b.minFilter!==ds&&b.minFilter!==Dn||b.type===Zt&&e.has("OES_texture_float_linear")===!1)return;if(b.anisotropy>1||n.get(b).__currentAnisotropy){const O=e.get("EXT_texture_filter_anisotropic");s.texParameterf(R,O.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(b.anisotropy,i.getMaxAnisotropy())),n.get(b).__currentAnisotropy=b.anisotropy}}}function $e(R,b){let O=!1;R.__webglInit===void 0&&(R.__webglInit=!0,b.addEventListener("dispose",w));const X=b.source;let $=u.get(X);$===void 0&&($={},u.set(X,$));const ie=B(b);if(ie!==R.__cacheKey){$[ie]===void 0&&($[ie]={texture:s.createTexture(),usedTimes:0},a.memory.textures++,O=!0),$[ie].usedTimes++;const se=$[R.__cacheKey];se!==void 0&&($[R.__cacheKey].usedTimes--,se.usedTimes===0&&C(b)),R.__cacheKey=ie,R.__webglTexture=$[ie].texture}return O}function j(R,b,O){return Math.floor(Math.floor(R/O)/b)}function te(R,b,O,X){const ie=R.updateRanges;if(ie.length===0)t.texSubImage2D(s.TEXTURE_2D,0,0,0,b.width,b.height,O,X,b.data);else{ie.sort((we,le)=>we.start-le.start);let se=0;for(let we=1;we<ie.length;we++){const le=ie[se],ae=ie[we],Ee=le.start+le.count,Re=j(ae.start,b.width,4),De=j(le.start,b.width,4);ae.start<=Ee+1&&Re===De&&j(ae.start+ae.count-1,b.width,4)===Re?le.count=Math.max(le.count,ae.start+ae.count-le.start):(++se,ie[se]=ae)}ie.length=se+1;const J=t.getParameter(s.UNPACK_ROW_LENGTH),ee=t.getParameter(s.UNPACK_SKIP_PIXELS),re=t.getParameter(s.UNPACK_SKIP_ROWS);t.pixelStorei(s.UNPACK_ROW_LENGTH,b.width);for(let we=0,le=ie.length;we<le;we++){const ae=ie[we],Ee=Math.floor(ae.start/4),Re=Math.ceil(ae.count/4),De=Ee%b.width,U=Math.floor(Ee/b.width),oe=Re,Q=1;t.pixelStorei(s.UNPACK_SKIP_PIXELS,De),t.pixelStorei(s.UNPACK_SKIP_ROWS,U),t.texSubImage2D(s.TEXTURE_2D,0,De,U,oe,Q,O,X,b.data)}R.clearUpdateRanges(),t.pixelStorei(s.UNPACK_ROW_LENGTH,J),t.pixelStorei(s.UNPACK_SKIP_PIXELS,ee),t.pixelStorei(s.UNPACK_SKIP_ROWS,re)}}function xe(R,b,O){let X=s.TEXTURE_2D;(b.isDataArrayTexture||b.isCompressedArrayTexture)&&(X=s.TEXTURE_2D_ARRAY),b.isData3DTexture&&(X=s.TEXTURE_3D);const $=$e(R,b),ie=b.source;t.bindTexture(X,R.__webglTexture,s.TEXTURE0+O);const se=n.get(ie);if(ie.version!==se.__version||$===!0){if(t.activeTexture(s.TEXTURE0+O),(typeof ImageBitmap<"u"&&b.image instanceof ImageBitmap)===!1){const Q=Be.getPrimaries(Be.workingColorSpace),ce=b.colorSpace===Zn?null:Be.getPrimaries(b.colorSpace),pe=b.colorSpace===Zn||Q===ce?s.NONE:s.BROWSER_DEFAULT_WEBGL;t.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,b.flipY),t.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),t.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,pe)}t.pixelStorei(s.UNPACK_ALIGNMENT,b.unpackAlignment);let ee=p(b.image,!1,i.maxTextureSize);ee=Tt(b,ee);const re=r.convert(b.format,b.colorSpace),we=r.convert(b.type);let le=x(b.internalFormat,re,we,b.normalized,b.colorSpace,b.isVideoTexture);qe(X,b);let ae;const Ee=b.mipmaps,Re=b.isVideoTexture!==!0,De=se.__version===void 0||$===!0,U=ie.dataReady,oe=y(b,ee);if(b.isDepthTexture)le=M(b.format===hi,b.type),De&&(Re?t.texStorage2D(s.TEXTURE_2D,1,le,ee.width,ee.height):t.texImage2D(s.TEXTURE_2D,0,le,ee.width,ee.height,0,re,we,null));else if(b.isDataTexture)if(Ee.length>0){Re&&De&&t.texStorage2D(s.TEXTURE_2D,oe,le,Ee[0].width,Ee[0].height);for(let Q=0,ce=Ee.length;Q<ce;Q++)ae=Ee[Q],Re?U&&t.texSubImage2D(s.TEXTURE_2D,Q,0,0,ae.width,ae.height,re,we,ae.data):t.texImage2D(s.TEXTURE_2D,Q,le,ae.width,ae.height,0,re,we,ae.data);b.generateMipmaps=!1}else Re?(De&&t.texStorage2D(s.TEXTURE_2D,oe,le,ee.width,ee.height),U&&te(b,ee,re,we)):t.texImage2D(s.TEXTURE_2D,0,le,ee.width,ee.height,0,re,we,ee.data);else if(b.isCompressedTexture)if(b.isCompressedArrayTexture){Re&&De&&t.texStorage3D(s.TEXTURE_2D_ARRAY,oe,le,Ee[0].width,Ee[0].height,ee.depth);for(let Q=0,ce=Ee.length;Q<ce;Q++)if(ae=Ee[Q],b.format!==Vt)if(re!==null)if(Re){if(U)if(b.layerUpdates.size>0){const pe=tl(ae.width,ae.height,b.format,b.type);for(const ne of b.layerUpdates){const Ae=ae.data.subarray(ne*pe/ae.data.BYTES_PER_ELEMENT,(ne+1)*pe/ae.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,Q,0,0,ne,ae.width,ae.height,1,re,Ae)}}else t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,Q,0,0,0,ae.width,ae.height,ee.depth,re,ae.data)}else t.compressedTexImage3D(s.TEXTURE_2D_ARRAY,Q,le,ae.width,ae.height,ee.depth,0,ae.data,0,0);else Te("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Re?U&&t.texSubImage3D(s.TEXTURE_2D_ARRAY,Q,0,0,0,ae.width,ae.height,ee.depth,re,we,ae.data):t.texImage3D(s.TEXTURE_2D_ARRAY,Q,le,ae.width,ae.height,ee.depth,0,re,we,ae.data);b.layerUpdates.size>0&&b.clearLayerUpdates()}else{Re&&De&&t.texStorage2D(s.TEXTURE_2D,oe,le,Ee[0].width,Ee[0].height);for(let Q=0,ce=Ee.length;Q<ce;Q++)ae=Ee[Q],b.format!==Vt?re!==null?Re?U&&t.compressedTexSubImage2D(s.TEXTURE_2D,Q,0,0,ae.width,ae.height,re,ae.data):t.compressedTexImage2D(s.TEXTURE_2D,Q,le,ae.width,ae.height,0,ae.data):Te("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Re?U&&t.texSubImage2D(s.TEXTURE_2D,Q,0,0,ae.width,ae.height,re,we,ae.data):t.texImage2D(s.TEXTURE_2D,Q,le,ae.width,ae.height,0,re,we,ae.data)}else if(b.isDataArrayTexture)if(Re){if(De&&t.texStorage3D(s.TEXTURE_2D_ARRAY,oe,le,ee.width,ee.height,ee.depth),U)if(b.layerUpdates.size>0){const Q=tl(ee.width,ee.height,b.format,b.type);for(const ce of b.layerUpdates){const pe=ee.data.subarray(ce*Q/ee.data.BYTES_PER_ELEMENT,(ce+1)*Q/ee.data.BYTES_PER_ELEMENT);t.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,ce,ee.width,ee.height,1,re,we,pe)}b.clearLayerUpdates()}else t.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,0,ee.width,ee.height,ee.depth,re,we,ee.data)}else t.texImage3D(s.TEXTURE_2D_ARRAY,0,le,ee.width,ee.height,ee.depth,0,re,we,ee.data);else if(b.isData3DTexture)Re?(De&&t.texStorage3D(s.TEXTURE_3D,oe,le,ee.width,ee.height,ee.depth),U&&t.texSubImage3D(s.TEXTURE_3D,0,0,0,0,ee.width,ee.height,ee.depth,re,we,ee.data)):t.texImage3D(s.TEXTURE_3D,0,le,ee.width,ee.height,ee.depth,0,re,we,ee.data);else if(b.isFramebufferTexture){if(De)if(Re)t.texStorage2D(s.TEXTURE_2D,oe,le,ee.width,ee.height);else{let Q=ee.width,ce=ee.height;for(let pe=0;pe<oe;pe++)t.texImage2D(s.TEXTURE_2D,pe,le,Q,ce,0,re,we,null),Q>>=1,ce>>=1}}else if(b.isHTMLTexture){if("texElementImage2D"in s){const Q=s.canvas;if(Q.hasAttribute("layoutsubtree")||Q.setAttribute("layoutsubtree","true"),ee.parentNode!==Q){Q.appendChild(ee),d.add(b),Q.onpaint=ce=>{const pe=ce.changedElements;for(const ne of d)pe.includes(ne.image)&&(ne.needsUpdate=!0)},Q.requestPaint();return}if(s.texElementImage2D.length===3)s.texElementImage2D(s.TEXTURE_2D,s.RGBA8,ee);else{const pe=s.RGBA,ne=s.RGBA,Ae=s.UNSIGNED_BYTE;s.texElementImage2D(s.TEXTURE_2D,0,pe,ne,Ae,ee)}s.texParameteri(s.TEXTURE_2D,s.TEXTURE_MIN_FILTER,s.LINEAR),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_S,s.CLAMP_TO_EDGE),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_T,s.CLAMP_TO_EDGE)}}else if(Ee.length>0){if(Re&&De){const Q=Qe(Ee[0]);t.texStorage2D(s.TEXTURE_2D,oe,le,Q.width,Q.height)}for(let Q=0,ce=Ee.length;Q<ce;Q++)ae=Ee[Q],Re?U&&t.texSubImage2D(s.TEXTURE_2D,Q,0,0,re,we,ae):t.texImage2D(s.TEXTURE_2D,Q,le,re,we,ae);b.generateMipmaps=!1}else if(Re){if(De){const Q=Qe(ee);t.texStorage2D(s.TEXTURE_2D,oe,le,Q.width,Q.height)}U&&t.texSubImage2D(s.TEXTURE_2D,0,0,0,re,we,ee)}else t.texImage2D(s.TEXTURE_2D,0,le,re,we,ee);m(b)&&T(X),se.__version=ie.version,b.onUpdate&&b.onUpdate(b)}R.__version=b.version}function Ie(R,b,O){if(b.image.length!==6)return;const X=$e(R,b),$=b.source;t.bindTexture(s.TEXTURE_CUBE_MAP,R.__webglTexture,s.TEXTURE0+O);const ie=n.get($);if($.version!==ie.__version||X===!0){t.activeTexture(s.TEXTURE0+O);const se=Be.getPrimaries(Be.workingColorSpace),J=b.colorSpace===Zn?null:Be.getPrimaries(b.colorSpace),ee=b.colorSpace===Zn||se===J?s.NONE:s.BROWSER_DEFAULT_WEBGL;t.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,b.flipY),t.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),t.pixelStorei(s.UNPACK_ALIGNMENT,b.unpackAlignment),t.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,ee);const re=b.isCompressedTexture||b.image[0].isCompressedTexture,we=b.image[0]&&b.image[0].isDataTexture,le=[];for(let ne=0;ne<6;ne++)!re&&!we?le[ne]=p(b.image[ne],!0,i.maxCubemapSize):le[ne]=we?b.image[ne].image:b.image[ne],le[ne]=Tt(b,le[ne]);const ae=le[0],Ee=r.convert(b.format,b.colorSpace),Re=r.convert(b.type),De=x(b.internalFormat,Ee,Re,b.normalized,b.colorSpace),U=b.isVideoTexture!==!0,oe=ie.__version===void 0||X===!0,Q=$.dataReady;let ce=y(b,ae);qe(s.TEXTURE_CUBE_MAP,b);let pe;if(re){U&&oe&&t.texStorage2D(s.TEXTURE_CUBE_MAP,ce,De,ae.width,ae.height);for(let ne=0;ne<6;ne++){pe=le[ne].mipmaps;for(let Ae=0;Ae<pe.length;Ae++){const ye=pe[Ae];b.format!==Vt?Ee!==null?U?Q&&t.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Ae,0,0,ye.width,ye.height,Ee,ye.data):t.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Ae,De,ye.width,ye.height,0,ye.data):Te("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):U?Q&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Ae,0,0,ye.width,ye.height,Ee,Re,ye.data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Ae,De,ye.width,ye.height,0,Ee,Re,ye.data)}}}else{if(pe=b.mipmaps,U&&oe){pe.length>0&&ce++;const ne=Qe(le[0]);t.texStorage2D(s.TEXTURE_CUBE_MAP,ce,De,ne.width,ne.height)}for(let ne=0;ne<6;ne++)if(we){U?Q&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0,0,0,le[ne].width,le[ne].height,Ee,Re,le[ne].data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0,De,le[ne].width,le[ne].height,0,Ee,Re,le[ne].data);for(let Ae=0;Ae<pe.length;Ae++){const at=pe[Ae].image[ne].image;U?Q&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Ae+1,0,0,at.width,at.height,Ee,Re,at.data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Ae+1,De,at.width,at.height,0,Ee,Re,at.data)}}else{U?Q&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0,0,0,Ee,Re,le[ne]):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0,De,Ee,Re,le[ne]);for(let Ae=0;Ae<pe.length;Ae++){const ye=pe[Ae];U?Q&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Ae+1,0,0,Ee,Re,ye.image[ne]):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Ae+1,De,Ee,Re,ye.image[ne])}}}m(b)&&T(s.TEXTURE_CUBE_MAP),ie.__version=$.version,b.onUpdate&&b.onUpdate(b)}R.__version=b.version}function ge(R,b,O,X,$,ie){const se=r.convert(O.format,O.colorSpace),J=r.convert(O.type),ee=x(O.internalFormat,se,J,O.normalized,O.colorSpace),re=n.get(b),we=n.get(O);if(we.__renderTarget=b,!re.__hasExternalTextures){const le=Math.max(1,b.width>>ie),ae=Math.max(1,b.height>>ie);$===s.TEXTURE_3D||$===s.TEXTURE_2D_ARRAY?t.texImage3D($,ie,ee,le,ae,b.depth,0,se,J,null):t.texImage2D($,ie,ee,le,ae,0,se,J,null)}t.bindFramebuffer(s.FRAMEBUFFER,R),mt(b)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,X,$,we.__webglTexture,0,dt(b)):($===s.TEXTURE_2D||$>=s.TEXTURE_CUBE_MAP_POSITIVE_X&&$<=s.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&s.framebufferTexture2D(s.FRAMEBUFFER,X,$,we.__webglTexture,ie),t.bindFramebuffer(s.FRAMEBUFFER,null)}function Oe(R,b,O){if(s.bindRenderbuffer(s.RENDERBUFFER,R),b.depthBuffer){const X=b.depthTexture,$=X&&X.isDepthTexture?X.type:null,ie=M(b.stencilBuffer,$),se=b.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;mt(b)?o.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,dt(b),ie,b.width,b.height):O?s.renderbufferStorageMultisample(s.RENDERBUFFER,dt(b),ie,b.width,b.height):s.renderbufferStorage(s.RENDERBUFFER,ie,b.width,b.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,se,s.RENDERBUFFER,R)}else{const X=b.textures;for(let $=0;$<X.length;$++){const ie=X[$],se=r.convert(ie.format,ie.colorSpace),J=r.convert(ie.type),ee=x(ie.internalFormat,se,J,ie.normalized,ie.colorSpace);mt(b)?o.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,dt(b),ee,b.width,b.height):O?s.renderbufferStorageMultisample(s.RENDERBUFFER,dt(b),ee,b.width,b.height):s.renderbufferStorage(s.RENDERBUFFER,ee,b.width,b.height)}}s.bindRenderbuffer(s.RENDERBUFFER,null)}function xt(R,b,O){const X=b.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(s.FRAMEBUFFER,R),!(b.depthTexture&&b.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");const $=n.get(b.depthTexture);if($.__renderTarget=b,(!$.__webglTexture||b.depthTexture.image.width!==b.width||b.depthTexture.image.height!==b.height)&&(b.depthTexture.image.width=b.width,b.depthTexture.image.height=b.height,b.depthTexture.needsUpdate=!0),X){if($.__webglInit===void 0&&($.__webglInit=!0,b.depthTexture.addEventListener("dispose",w)),$.__webglTexture===void 0){$.__webglTexture=s.createTexture(),t.bindTexture(s.TEXTURE_CUBE_MAP,$.__webglTexture),qe(s.TEXTURE_CUBE_MAP,b.depthTexture);const re=r.convert(b.depthTexture.format),we=r.convert(b.depthTexture.type);let le;b.depthTexture.format===kn?le=s.DEPTH_COMPONENT24:b.depthTexture.format===hi&&(le=s.DEPTH24_STENCIL8);for(let ae=0;ae<6;ae++)s.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ae,0,le,b.width,b.height,0,re,we,null)}}else W(b.depthTexture,0);const ie=$.__webglTexture,se=dt(b),J=X?s.TEXTURE_CUBE_MAP_POSITIVE_X+O:s.TEXTURE_2D,ee=b.depthTexture.format===hi?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;if(b.depthTexture.format===kn)mt(b)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,ee,J,ie,0,se):s.framebufferTexture2D(s.FRAMEBUFFER,ee,J,ie,0);else if(b.depthTexture.format===hi)mt(b)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,ee,J,ie,0,se):s.framebufferTexture2D(s.FRAMEBUFFER,ee,J,ie,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function Ge(R){const b=n.get(R),O=R.isWebGLCubeRenderTarget===!0;if(b.__boundDepthTexture!==R.depthTexture){const X=R.depthTexture;if(b.__depthDisposeCallback&&b.__depthDisposeCallback(),X){const $=()=>{delete b.__boundDepthTexture,delete b.__depthDisposeCallback,X.removeEventListener("dispose",$)};X.addEventListener("dispose",$),b.__depthDisposeCallback=$}b.__boundDepthTexture=X}if(R.depthTexture&&!b.__autoAllocateDepthBuffer)if(O)for(let X=0;X<6;X++)xt(b.__webglFramebuffer[X],R,X);else{const X=R.texture.mipmaps;X&&X.length>0?xt(b.__webglFramebuffer[0],R,0):xt(b.__webglFramebuffer,R,0)}else if(O){b.__webglDepthbuffer=[];for(let X=0;X<6;X++)if(t.bindFramebuffer(s.FRAMEBUFFER,b.__webglFramebuffer[X]),b.__webglDepthbuffer[X]===void 0)b.__webglDepthbuffer[X]=s.createRenderbuffer(),Oe(b.__webglDepthbuffer[X],R,!1);else{const $=R.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,ie=b.__webglDepthbuffer[X];s.bindRenderbuffer(s.RENDERBUFFER,ie),s.framebufferRenderbuffer(s.FRAMEBUFFER,$,s.RENDERBUFFER,ie)}}else{const X=R.texture.mipmaps;if(X&&X.length>0?t.bindFramebuffer(s.FRAMEBUFFER,b.__webglFramebuffer[0]):t.bindFramebuffer(s.FRAMEBUFFER,b.__webglFramebuffer),b.__webglDepthbuffer===void 0)b.__webglDepthbuffer=s.createRenderbuffer(),Oe(b.__webglDepthbuffer,R,!1);else{const $=R.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,ie=b.__webglDepthbuffer;s.bindRenderbuffer(s.RENDERBUFFER,ie),s.framebufferRenderbuffer(s.FRAMEBUFFER,$,s.RENDERBUFFER,ie)}}t.bindFramebuffer(s.FRAMEBUFFER,null)}function Ke(R,b,O){const X=n.get(R);b!==void 0&&ge(X.__webglFramebuffer,R,R.texture,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,0),O!==void 0&&Ge(R)}function rt(R){const b=R.texture,O=n.get(R),X=n.get(b);R.addEventListener("dispose",_);const $=R.textures,ie=R.isWebGLCubeRenderTarget===!0,se=$.length>1;if(se||(X.__webglTexture===void 0&&(X.__webglTexture=s.createTexture()),X.__version=b.version,a.memory.textures++),ie){O.__webglFramebuffer=[];for(let J=0;J<6;J++)if(b.mipmaps&&b.mipmaps.length>0){O.__webglFramebuffer[J]=[];for(let ee=0;ee<b.mipmaps.length;ee++)O.__webglFramebuffer[J][ee]=s.createFramebuffer()}else O.__webglFramebuffer[J]=s.createFramebuffer()}else{if(b.mipmaps&&b.mipmaps.length>0){O.__webglFramebuffer=[];for(let J=0;J<b.mipmaps.length;J++)O.__webglFramebuffer[J]=s.createFramebuffer()}else O.__webglFramebuffer=s.createFramebuffer();if(se)for(let J=0,ee=$.length;J<ee;J++){const re=n.get($[J]);re.__webglTexture===void 0&&(re.__webglTexture=s.createTexture(),a.memory.textures++)}if(R.samples>0&&mt(R)===!1){O.__webglMultisampledFramebuffer=s.createFramebuffer(),O.__webglColorRenderbuffer=[],t.bindFramebuffer(s.FRAMEBUFFER,O.__webglMultisampledFramebuffer);for(let J=0;J<$.length;J++){const ee=$[J];O.__webglColorRenderbuffer[J]=s.createRenderbuffer(),s.bindRenderbuffer(s.RENDERBUFFER,O.__webglColorRenderbuffer[J]);const re=r.convert(ee.format,ee.colorSpace),we=r.convert(ee.type),le=x(ee.internalFormat,re,we,ee.normalized,ee.colorSpace,R.isXRRenderTarget===!0),ae=dt(R);s.renderbufferStorageMultisample(s.RENDERBUFFER,ae,le,R.width,R.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+J,s.RENDERBUFFER,O.__webglColorRenderbuffer[J])}s.bindRenderbuffer(s.RENDERBUFFER,null),R.depthBuffer&&(O.__webglDepthRenderbuffer=s.createRenderbuffer(),Oe(O.__webglDepthRenderbuffer,R,!0)),t.bindFramebuffer(s.FRAMEBUFFER,null)}}if(ie){t.bindTexture(s.TEXTURE_CUBE_MAP,X.__webglTexture),qe(s.TEXTURE_CUBE_MAP,b);for(let J=0;J<6;J++)if(b.mipmaps&&b.mipmaps.length>0)for(let ee=0;ee<b.mipmaps.length;ee++)ge(O.__webglFramebuffer[J][ee],R,b,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+J,ee);else ge(O.__webglFramebuffer[J],R,b,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+J,0);m(b)&&T(s.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(se){for(let J=0,ee=$.length;J<ee;J++){const re=$[J],we=n.get(re);let le=s.TEXTURE_2D;(R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(le=R.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),t.bindTexture(le,we.__webglTexture),qe(le,re),ge(O.__webglFramebuffer,R,re,s.COLOR_ATTACHMENT0+J,le,0),m(re)&&T(le)}t.unbindTexture()}else{let J=s.TEXTURE_2D;if((R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(J=R.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),t.bindTexture(J,X.__webglTexture),qe(J,b),b.mipmaps&&b.mipmaps.length>0)for(let ee=0;ee<b.mipmaps.length;ee++)ge(O.__webglFramebuffer[ee],R,b,s.COLOR_ATTACHMENT0,J,ee);else ge(O.__webglFramebuffer,R,b,s.COLOR_ATTACHMENT0,J,0);m(b)&&T(J),t.unbindTexture()}R.depthBuffer&&Ge(R)}function We(R){const b=R.textures;for(let O=0,X=b.length;O<X;O++){const $=b[O];if(m($)){const ie=A(R),se=n.get($).__webglTexture;t.bindTexture(ie,se),T(ie),t.unbindTexture()}}}const lt=[],St=[];function Ft(R){if(R.samples>0){if(mt(R)===!1){const b=R.textures,O=R.width,X=R.height;let $=s.COLOR_BUFFER_BIT;const ie=R.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,se=n.get(R),J=b.length>1;if(J)for(let re=0;re<b.length;re++)t.bindFramebuffer(s.FRAMEBUFFER,se.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+re,s.RENDERBUFFER,null),t.bindFramebuffer(s.FRAMEBUFFER,se.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+re,s.TEXTURE_2D,null,0);t.bindFramebuffer(s.READ_FRAMEBUFFER,se.__webglMultisampledFramebuffer);const ee=R.texture.mipmaps;ee&&ee.length>0?t.bindFramebuffer(s.DRAW_FRAMEBUFFER,se.__webglFramebuffer[0]):t.bindFramebuffer(s.DRAW_FRAMEBUFFER,se.__webglFramebuffer);for(let re=0;re<b.length;re++){if(R.resolveDepthBuffer&&(R.depthBuffer&&($|=s.DEPTH_BUFFER_BIT),R.stencilBuffer&&R.resolveStencilBuffer&&($|=s.STENCIL_BUFFER_BIT)),J){s.framebufferRenderbuffer(s.READ_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.RENDERBUFFER,se.__webglColorRenderbuffer[re]);const we=n.get(b[re]).__webglTexture;s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,we,0)}s.blitFramebuffer(0,0,O,X,0,0,O,X,$,s.NEAREST),c===!0&&(lt.length=0,St.length=0,lt.push(s.COLOR_ATTACHMENT0+re),R.depthBuffer&&R.storeMultisampledDepthBuffer===!1&&(lt.push(ie),St.push(ie),s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,St)),s.invalidateFramebuffer(s.READ_FRAMEBUFFER,lt))}if(t.bindFramebuffer(s.READ_FRAMEBUFFER,null),t.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),J)for(let re=0;re<b.length;re++){t.bindFramebuffer(s.FRAMEBUFFER,se.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+re,s.RENDERBUFFER,se.__webglColorRenderbuffer[re]);const we=n.get(b[re]).__webglTexture;t.bindFramebuffer(s.FRAMEBUFFER,se.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+re,s.TEXTURE_2D,we,0)}t.bindFramebuffer(s.DRAW_FRAMEBUFFER,se.__webglMultisampledFramebuffer)}else if(R.depthBuffer&&R.storeMultisampledDepthBuffer===!1&&c){const b=R.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,[b])}}}function dt(R){return Math.min(i.maxSamples,R.samples)}function mt(R){const b=n.get(R);return R.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&b.__useRenderToTexture!==!1}function N(R){const b=a.render.frame;h.get(R)!==b&&(h.set(R,b),R.update())}function Tt(R,b){const O=R.colorSpace,X=R.format,$=R.type;return R.isCompressedTexture===!0||R.isVideoTexture===!0||O!==Ot&&O!==Zn&&(Be.getTransfer(O)===et?(X!==Vt||$!==Ht)&&Te("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Pe("WebGLTextures: Unsupported texture color space:",O)),b}function Qe(R){return typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement?(l.width=R.naturalWidth||R.width,l.height=R.naturalHeight||R.height):typeof VideoFrame<"u"&&R instanceof VideoFrame?(l.width=R.displayWidth,l.height=R.displayHeight):(l.width=R.width,l.height=R.height),l}this.allocateTextureUnit=Y,this.resetTextureUnits=F,this.getTextureUnits=I,this.setTextureUnits=z,this.setTexture2D=W,this.setTexture2DArray=V,this.setTexture3D=K,this.setTextureCube=Z,this.rebindTextures=Ke,this.setupRenderTarget=rt,this.updateRenderTargetMipmap=We,this.updateMultisampleRenderTarget=Ft,this.setupDepthRenderbuffer=Ge,this.setupFrameBufferTexture=ge,this.useMultisampledRTT=mt,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function M_(s,e){function t(n,i=Zn){let r;const a=Be.getTransfer(i);if(n===Ht)return s.UNSIGNED_BYTE;if(n===Eo)return s.UNSIGNED_SHORT_4_4_4_4;if(n===To)return s.UNSIGNED_SHORT_5_5_5_1;if(n===Jl)return s.UNSIGNED_INT_5_9_9_9_REV;if(n===Ql)return s.UNSIGNED_INT_10F_11F_11F_REV;if(n===Zl)return s.BYTE;if(n===jl)return s.SHORT;if(n===_s)return s.UNSIGNED_SHORT;if(n===wo)return s.INT;if(n===yn)return s.UNSIGNED_INT;if(n===Zt)return s.FLOAT;if(n===Sn)return s.HALF_FLOAT;if(n===eh)return s.ALPHA;if(n===th)return s.RGB;if(n===Vt)return s.RGBA;if(n===kn)return s.DEPTH_COMPONENT;if(n===hi)return s.DEPTH_STENCIL;if(n===Ao)return s.RED;if(n===Ro)return s.RED_INTEGER;if(n===fi)return s.RG;if(n===Co)return s.RG_INTEGER;if(n===Po)return s.RGBA_INTEGER;if(n===hr||n===dr||n===ur||n===fr)if(a===et)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===hr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===dr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===ur)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===fr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===hr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===dr)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===ur)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===fr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Oa||n===Ba||n===za||n===Ga)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Oa)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Ba)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===za)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Ga)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Ha||n===Va||n===Wa||n===Xa||n===qa||n===Mr||n===Ya)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Ha||n===Va)return a===et?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Wa)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===Xa)return r.COMPRESSED_R11_EAC;if(n===qa)return r.COMPRESSED_SIGNED_R11_EAC;if(n===Mr)return r.COMPRESSED_RG11_EAC;if(n===Ya)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===Ka||n===$a||n===Za||n===ja||n===Ja||n===Qa||n===eo||n===to||n===no||n===io||n===so||n===ro||n===ao||n===oo)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Ka)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===$a)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Za)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===ja)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Ja)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Qa)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===eo)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===to)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===no)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===io)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===so)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===ro)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===ao)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===oo)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===co||n===lo||n===ho)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===co)return a===et?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===lo)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===ho)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===uo||n===fo||n===yr||n===po)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===uo)return r.COMPRESSED_RED_RGTC1_EXT;if(n===fo)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===yr)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===po)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===vs?s.UNSIGNED_INT_24_8:s[n]!==void 0?s[n]:null}return{convert:t}}const y_=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,S_=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class w_{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const n=new gh(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,n=new wn({vertexShader:y_,fragmentShader:S_,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new It(new Or(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class E_ extends ti{constructor(e,t){super();const n=this;let i=null,r=1,a=null,o="local-floor",c=1,l=null,h=null,d=null,f=null,u=null,g=null;const v=typeof XRWebGLBinding<"u",p=new w_,m={},T=t.getContextAttributes();let A=null,x=null;const M=[],y=[],w=new ke;let _=null,E=null;const C=new kt;C.viewport=new it;const P=new kt;P.viewport=new it;const D=[C,P],F=new bf;let I=null,z=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(j){let te=M[j];return te===void 0&&(te=new ta,M[j]=te),te.getTargetRaySpace()},this.getControllerGrip=function(j){let te=M[j];return te===void 0&&(te=new ta,M[j]=te),te.getGripSpace()},this.getHand=function(j){let te=M[j];return te===void 0&&(te=new ta,M[j]=te),te.getHandSpace()};function Y(j){const te=y.indexOf(j.inputSource);if(te===-1)return;const xe=M[te];xe!==void 0&&(xe.update(j.inputSource,j.frame,l||a),xe.dispatchEvent({type:j.type,data:j.inputSource}))}function B(){i.removeEventListener("select",Y),i.removeEventListener("selectstart",Y),i.removeEventListener("selectend",Y),i.removeEventListener("squeeze",Y),i.removeEventListener("squeezestart",Y),i.removeEventListener("squeezeend",Y),i.removeEventListener("end",B),i.removeEventListener("inputsourceschange",W);for(let j=0;j<M.length;j++){const te=y[j];te!==null&&(y[j]=null,M[j].disconnect(te))}I=null,z=null,p.reset();for(const j in m)delete m[j];if(e.setRenderTarget(A),u=null,f=null,d=null,i=null,x=null,$e.stop(),n.isPresenting=!1,e.setPixelRatio(_),e.setSize(w.width,w.height,!1),E!==null){const j=E.camera;j.fov=E.fov,j.zoom=E.zoom,j.updateProjectionMatrix(),E=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(j){r=j,n.isPresenting===!0&&Te("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(j){o=j,n.isPresenting===!0&&Te("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||a},this.setReferenceSpace=function(j){l=j},this.getBaseLayer=function(){return f!==null?f:u},this.getBinding=function(){return d===null&&v&&(d=new XRWebGLBinding(i,t)),d},this.getFrame=function(){return g},this.getSession=function(){return i},this.setSession=async function(j){if(i=j,i!==null){if(A=e.getRenderTarget(),i.addEventListener("select",Y),i.addEventListener("selectstart",Y),i.addEventListener("selectend",Y),i.addEventListener("squeeze",Y),i.addEventListener("squeezestart",Y),i.addEventListener("squeezeend",Y),i.addEventListener("end",B),i.addEventListener("inputsourceschange",W),T.xrCompatible!==!0&&await t.makeXRCompatible(),_=e.getPixelRatio(),e.getSize(w),v&&"createProjectionLayer"in XRWebGLBinding.prototype){let xe=null,Ie=null,ge=null;T.depth&&(ge=T.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,xe=T.stencil?hi:kn,Ie=T.stencil?vs:yn);const Oe={colorFormat:t.RGBA8,depthFormat:ge,scaleFactor:r};d=this.getBinding(),f=d.createProjectionLayer(Oe),i.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),x=new cn(f.textureWidth,f.textureHeight,{format:Vt,type:Ht,depthTexture:new ws(f.textureWidth,f.textureHeight,Ie,void 0,void 0,void 0,void 0,void 0,void 0,xe),stencilBuffer:T.stencil,colorSpace:e.outputColorSpace,samples:T.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}else{const xe={antialias:T.antialias,alpha:!0,depth:T.depth,stencil:T.stencil,framebufferScaleFactor:r};u=new XRWebGLLayer(i,t,xe),i.updateRenderState({baseLayer:u}),e.setPixelRatio(1),e.setSize(u.framebufferWidth,u.framebufferHeight,!1),x=new cn(u.framebufferWidth,u.framebufferHeight,{format:Vt,type:Ht,colorSpace:e.outputColorSpace,stencilBuffer:T.stencil,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1,storeMultisampledDepthBuffer:u.ignoreDepthValues===!1,storeMultisampledStencilBuffer:u.ignoreDepthValues===!1})}x.isXRRenderTarget=!0,this.setFoveation(c),l=null,a=await i.requestReferenceSpace(o),$e.setContext(i),$e.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode},this.getDepthTexture=function(){return p.getDepthTexture()};function W(j){for(let te=0;te<j.removed.length;te++){const xe=j.removed[te],Ie=y.indexOf(xe);Ie>=0&&(y[Ie]=null,M[Ie].disconnect(xe))}for(let te=0;te<j.added.length;te++){const xe=j.added[te];let Ie=y.indexOf(xe);if(Ie===-1){for(let Oe=0;Oe<M.length;Oe++)if(Oe>=y.length){y.push(xe),Ie=Oe;break}else if(y[Oe]===null){y[Oe]=xe,Ie=Oe;break}if(Ie===-1)break}const ge=M[Ie];ge&&ge.connect(xe)}}const V=new k,K=new k;function Z(j,te,xe){V.setFromMatrixPosition(te.matrixWorld),K.setFromMatrixPosition(xe.matrixWorld);const Ie=V.distanceTo(K),ge=te.projectionMatrix.elements,Oe=xe.projectionMatrix.elements,xt=ge[14]/(ge[10]-1),Ge=ge[14]/(ge[10]+1),Ke=(ge[9]+1)/ge[5],rt=(ge[9]-1)/ge[5],We=(ge[8]-1)/ge[0],lt=(Oe[8]+1)/Oe[0],St=xt*We,Ft=xt*lt,dt=Ie/(-We+lt),mt=dt*-We;if(te.matrixWorld.decompose(j.position,j.quaternion,j.scale),j.translateX(mt),j.translateZ(dt),j.matrixWorld.compose(j.position,j.quaternion,j.scale),j.matrixWorldInverse.copy(j.matrixWorld).invert(),ge[10]===-1)j.projectionMatrix.copy(te.projectionMatrix),j.projectionMatrixInverse.copy(te.projectionMatrixInverse);else{const N=xt+dt,Tt=Ge+dt,Qe=St-mt,R=Ft+(Ie-mt),b=Ke*Ge/Tt*N,O=rt*Ge/Tt*N;j.projectionMatrix.makePerspective(Qe,R,b,O,N,Tt),j.projectionMatrixInverse.copy(j.projectionMatrix).invert()}}function de(j,te){te===null?j.matrixWorld.copy(j.matrix):j.matrixWorld.multiplyMatrices(te.matrixWorld,j.matrix),j.matrixWorldInverse.copy(j.matrixWorld).invert()}this.updateCamera=function(j){if(i===null)return;let te=j.near,xe=j.far;p.texture!==null&&(p.depthNear>0&&(te=p.depthNear),p.depthFar>0&&(xe=p.depthFar)),F.near=P.near=C.near=te,F.far=P.far=C.far=xe,(I!==F.near||z!==F.far)&&(i.updateRenderState({depthNear:F.near,depthFar:F.far}),I=F.near,z=F.far),F.layers.mask=j.layers.mask|6,C.layers.mask=F.layers.mask&-5,P.layers.mask=F.layers.mask&-3;const Ie=j.parent,ge=F.cameras;de(F,Ie);for(let Oe=0;Oe<ge.length;Oe++)de(ge[Oe],Ie);ge.length===2?Z(F,C,P):F.projectionMatrix.copy(C.projectionMatrix),E===null&&j.isPerspectiveCamera&&(E={camera:j,fov:j.fov,zoom:j.zoom}),ve(j,F,Ie)};function ve(j,te,xe){xe===null?j.matrix.copy(te.matrixWorld):(j.matrix.copy(xe.matrixWorld),j.matrix.invert(),j.matrix.multiply(te.matrixWorld)),j.matrix.decompose(j.position,j.quaternion,j.scale),j.updateMatrixWorld(!0),j.projectionMatrix.copy(te.projectionMatrix),j.projectionMatrixInverse.copy(te.projectionMatrixInverse),j.isPerspectiveCamera&&(j.fov=Wi*2*Math.atan(1/j.projectionMatrix.elements[5]),j.zoom=1)}this.getCamera=function(){return F},this.getFoveation=function(){if(!(f===null&&u===null))return c},this.setFoveation=function(j){c=j,f!==null&&(f.fixedFoveation=j),u!==null&&u.fixedFoveation!==void 0&&(u.fixedFoveation=j)},this.hasDepthSensing=function(){return p.texture!==null},this.getDepthSensingMesh=function(){return p.getMesh(F)},this.getCameraTexture=function(j){return m[j]};let Xe=null;function qe(j,te){if(h=te.getViewerPose(l||a),g=te,h!==null){const xe=h.views;u!==null&&(e.setRenderTargetFramebuffer(x,u.framebuffer),e.setRenderTarget(x));let Ie=!1;xe.length!==F.cameras.length&&(F.cameras.length=0,Ie=!0);for(let Ge=0;Ge<xe.length;Ge++){const Ke=xe[Ge];let rt=null;if(u!==null)rt=u.getViewport(Ke);else{const lt=d.getViewSubImage(f,Ke);rt=lt.viewport,Ge===0&&(e.setRenderTargetTextures(x,lt.colorTexture,lt.depthStencilTexture),e.setRenderTarget(x))}let We=D[Ge];We===void 0&&(We=new kt,We.layers.enable(Ge),We.viewport=new it,D[Ge]=We),We.matrix.fromArray(Ke.transform.matrix),We.matrix.decompose(We.position,We.quaternion,We.scale),We.projectionMatrix.fromArray(Ke.projectionMatrix),We.projectionMatrixInverse.copy(We.projectionMatrix).invert(),We.viewport.set(rt.x,rt.y,rt.width,rt.height),Ge===0&&(F.matrix.copy(We.matrix),F.matrix.decompose(F.position,F.quaternion,F.scale)),Ie===!0&&F.cameras.push(We)}const ge=i.enabledFeatures;if(ge&&ge.includes("depth-sensing")&&i.depthUsage=="gpu-optimized"&&v){d=n.getBinding();const Ge=d.getDepthInformation(xe[0]);Ge&&Ge.isValid&&Ge.texture&&p.init(Ge,i.renderState)}if(ge&&ge.includes("camera-access")&&v){e.state.unbindTexture(),d=n.getBinding();for(let Ge=0;Ge<xe.length;Ge++){const Ke=xe[Ge].camera;if(Ke){let rt=m[Ke];rt||(rt=new gh,m[Ke]=rt);const We=d.getCameraImage(Ke);rt.sourceTexture=We}}}}for(let xe=0;xe<M.length;xe++){const Ie=y[xe],ge=M[xe];Ie!==null&&ge!==void 0&&ge.update(Ie,te,l||a)}Xe&&Xe(j,te),te.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:te}),g=null}const $e=new yh;$e.setAnimationLoop(qe),this.setAnimationLoop=function(j){Xe=j},this.dispose=function(){}}}const T_=new Ue,Ch=new Le;Ch.set(-1,0,0,0,1,0,0,0,1);function A_(s,e){function t(p,m){p.matrixAutoUpdate===!0&&p.updateMatrix(),m.value.copy(p.matrix)}function n(p,m){m.color.getRGB(p.fogColor.value,_h(s)),m.isFog?(p.fogNear.value=m.near,p.fogFar.value=m.far):m.isFogExp2&&(p.fogDensity.value=m.density)}function i(p,m,T,A,x){m.isNodeMaterial?m.uniformsNeedUpdate=!1:m.isMeshBasicMaterial?r(p,m):m.isMeshLambertMaterial?(r(p,m),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)):m.isMeshToonMaterial?(r(p,m),d(p,m)):m.isMeshPhongMaterial?(r(p,m),h(p,m),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)):m.isMeshStandardMaterial?(r(p,m),f(p,m),m.isMeshPhysicalMaterial&&u(p,m,x)):m.isMeshMatcapMaterial?(r(p,m),g(p,m)):m.isMeshDepthMaterial?r(p,m):m.isMeshDistanceMaterial?(r(p,m),v(p,m)):m.isMeshNormalMaterial?r(p,m):m.isLineBasicMaterial?(a(p,m),m.isLineDashedMaterial&&o(p,m)):m.isPointsMaterial?c(p,m,T,A):m.isSpriteMaterial?l(p,m):m.isShadowMaterial?(p.color.value.copy(m.color),p.opacity.value=m.opacity):m.isShaderMaterial&&(m.uniformsNeedUpdate=!1)}function r(p,m){p.opacity.value=m.opacity,m.color&&p.diffuse.value.copy(m.color),m.emissive&&p.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity),m.map&&(p.map.value=m.map,t(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,t(m.alphaMap,p.alphaMapTransform)),m.bumpMap&&(p.bumpMap.value=m.bumpMap,t(m.bumpMap,p.bumpMapTransform),p.bumpScale.value=m.bumpScale,m.side===Nt&&(p.bumpScale.value*=-1)),m.normalMap&&(p.normalMap.value=m.normalMap,t(m.normalMap,p.normalMapTransform),p.normalScale.value.copy(m.normalScale),m.side===Nt&&p.normalScale.value.negate()),m.displacementMap&&(p.displacementMap.value=m.displacementMap,t(m.displacementMap,p.displacementMapTransform),p.displacementScale.value=m.displacementScale,p.displacementBias.value=m.displacementBias),m.emissiveMap&&(p.emissiveMap.value=m.emissiveMap,t(m.emissiveMap,p.emissiveMapTransform)),m.specularMap&&(p.specularMap.value=m.specularMap,t(m.specularMap,p.specularMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest);const T=e.get(m),A=T.envMap,x=T.envMapRotation;A&&(p.envMap.value=A,p.envMapRotation.value.setFromMatrix4(T_.makeRotationFromEuler(x)).transpose(),A.isCubeTexture&&A.isRenderTargetTexture===!1&&p.envMapRotation.value.premultiply(Ch),p.reflectivity.value=m.reflectivity,p.ior.value=m.ior,p.refractionRatio.value=m.refractionRatio),m.lightMap&&(p.lightMap.value=m.lightMap,p.lightMapIntensity.value=m.lightMapIntensity,t(m.lightMap,p.lightMapTransform)),m.aoMap&&(p.aoMap.value=m.aoMap,p.aoMapIntensity.value=m.aoMapIntensity,t(m.aoMap,p.aoMapTransform))}function a(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,m.map&&(p.map.value=m.map,t(m.map,p.mapTransform))}function o(p,m){p.dashSize.value=m.dashSize,p.totalSize.value=m.dashSize+m.gapSize,p.scale.value=m.scale}function c(p,m,T,A){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.size.value=m.size*T,p.scale.value=A*.5,m.map&&(p.map.value=m.map,t(m.map,p.uvTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,t(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function l(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.rotation.value=m.rotation,m.map&&(p.map.value=m.map,t(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,t(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function h(p,m){p.specular.value.copy(m.specular),p.shininess.value=Math.max(m.shininess,1e-4)}function d(p,m){m.gradientMap&&(p.gradientMap.value=m.gradientMap)}function f(p,m){p.metalness.value=m.metalness,m.metalnessMap&&(p.metalnessMap.value=m.metalnessMap,t(m.metalnessMap,p.metalnessMapTransform)),p.roughness.value=m.roughness,m.roughnessMap&&(p.roughnessMap.value=m.roughnessMap,t(m.roughnessMap,p.roughnessMapTransform)),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)}function u(p,m,T){p.ior.value=m.ior,m.sheen>0&&(p.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen),p.sheenRoughness.value=m.sheenRoughness,m.sheenColorMap&&(p.sheenColorMap.value=m.sheenColorMap,t(m.sheenColorMap,p.sheenColorMapTransform)),m.sheenRoughnessMap&&(p.sheenRoughnessMap.value=m.sheenRoughnessMap,t(m.sheenRoughnessMap,p.sheenRoughnessMapTransform))),m.clearcoat>0&&(p.clearcoat.value=m.clearcoat,p.clearcoatRoughness.value=m.clearcoatRoughness,m.clearcoatMap&&(p.clearcoatMap.value=m.clearcoatMap,t(m.clearcoatMap,p.clearcoatMapTransform)),m.clearcoatRoughnessMap&&(p.clearcoatRoughnessMap.value=m.clearcoatRoughnessMap,t(m.clearcoatRoughnessMap,p.clearcoatRoughnessMapTransform)),m.clearcoatNormalMap&&(p.clearcoatNormalMap.value=m.clearcoatNormalMap,t(m.clearcoatNormalMap,p.clearcoatNormalMapTransform),p.clearcoatNormalScale.value.copy(m.clearcoatNormalScale),m.side===Nt&&p.clearcoatNormalScale.value.negate())),m.dispersion>0&&(p.dispersion.value=m.dispersion),m.retroreflectivity>0&&(p.retroreflectivity.value=m.retroreflectivity),m.iridescence>0&&(p.iridescence.value=m.iridescence,p.iridescenceIOR.value=m.iridescenceIOR,p.iridescenceThicknessMinimum.value=m.iridescenceThicknessRange[0],p.iridescenceThicknessMaximum.value=m.iridescenceThicknessRange[1],m.iridescenceMap&&(p.iridescenceMap.value=m.iridescenceMap,t(m.iridescenceMap,p.iridescenceMapTransform)),m.iridescenceThicknessMap&&(p.iridescenceThicknessMap.value=m.iridescenceThicknessMap,t(m.iridescenceThicknessMap,p.iridescenceThicknessMapTransform))),m.transmission>0&&(p.transmission.value=m.transmission,p.transmissionSamplerMap.value=T.texture,p.transmissionSamplerSize.value.set(T.width,T.height),m.transmissionMap&&(p.transmissionMap.value=m.transmissionMap,t(m.transmissionMap,p.transmissionMapTransform)),p.thickness.value=m.thickness,m.thicknessMap&&(p.thicknessMap.value=m.thicknessMap,t(m.thicknessMap,p.thicknessMapTransform)),p.attenuationDistance.value=m.attenuationDistance,p.attenuationColor.value.copy(m.attenuationColor)),m.anisotropy>0&&(p.anisotropyVector.value.set(m.anisotropy*Math.cos(m.anisotropyRotation),m.anisotropy*Math.sin(m.anisotropyRotation)),m.anisotropyMap&&(p.anisotropyMap.value=m.anisotropyMap,t(m.anisotropyMap,p.anisotropyMapTransform))),p.specularIntensity.value=m.specularIntensity,p.specularColor.value.copy(m.specularColor),m.specularColorMap&&(p.specularColorMap.value=m.specularColorMap,t(m.specularColorMap,p.specularColorMapTransform)),m.specularIntensityMap&&(p.specularIntensityMap.value=m.specularIntensityMap,t(m.specularIntensityMap,p.specularIntensityMapTransform))}function g(p,m){m.matcap&&(p.matcap.value=m.matcap)}function v(p,m){const T=e.get(m).light;p.referencePosition.value.setFromMatrixPosition(T.matrixWorld),p.nearDistance.value=T.shadow.camera.near,p.farDistance.value=T.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:i}}function R_(s,e,t,n){let i={},r={},a=[];const o=s.getParameter(s.MAX_UNIFORM_BUFFER_BINDINGS);function c(x,M){const y=M.program;n.uniformBlockBinding(x,y)}function l(x,M){let y=i[x.id];y===void 0&&(p(x),y=h(x),i[x.id]=y,x.addEventListener("dispose",T));const w=M.program;n.updateUBOMapping(x,w);const _=e.render.frame;r[x.id]!==_&&(f(x),r[x.id]=_)}function h(x){const M=d();x.__bindingPointIndex=M;const y=s.createBuffer(),w=x.__size,_=x.usage;return s.bindBuffer(s.UNIFORM_BUFFER,y),s.bufferData(s.UNIFORM_BUFFER,w,_),s.bindBuffer(s.UNIFORM_BUFFER,null),s.bindBufferBase(s.UNIFORM_BUFFER,M,y),y}function d(){for(let x=0;x<o;x++)if(a.indexOf(x)===-1)return a.push(x),x;return Pe("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(x){const M=i[x.id],y=x.uniforms,w=x.__cache;s.bindBuffer(s.UNIFORM_BUFFER,M);for(let _=0,E=y.length;_<E;_++){const C=y[_];if(Array.isArray(C))for(let P=0,D=C.length;P<D;P++)u(C[P],_,P,w);else u(C,_,0,w)}s.bindBuffer(s.UNIFORM_BUFFER,null)}function u(x,M,y,w){if(v(x,M,y,w)===!0){const _=x.__offset,E=x.value;if(Array.isArray(E)){let C=0;for(let P=0;P<E.length;P++){const D=E[P],F=m(D);g(D,x.__data,C),typeof D!="number"&&typeof D!="boolean"&&!D.isMatrix3&&!ArrayBuffer.isView(D)&&(C+=F.storage/Float32Array.BYTES_PER_ELEMENT)}}else g(E,x.__data,0);s.bufferSubData(s.UNIFORM_BUFFER,_,x.__data)}}function g(x,M,y){typeof x=="number"||typeof x=="boolean"?M[0]=x:x.isMatrix3?(M[0]=x.elements[0],M[1]=x.elements[1],M[2]=x.elements[2],M[3]=0,M[4]=x.elements[3],M[5]=x.elements[4],M[6]=x.elements[5],M[7]=0,M[8]=x.elements[6],M[9]=x.elements[7],M[10]=x.elements[8],M[11]=0):ArrayBuffer.isView(x)?M.set(new x.constructor(x.buffer,x.byteOffset,M.length)):x.toArray(M,y)}function v(x,M,y,w){const _=x.value,E=M+"_"+y;if(w[E]===void 0)return typeof _=="number"||typeof _=="boolean"?w[E]=_:ArrayBuffer.isView(_)?w[E]=_.slice():w[E]=_.clone(),!0;{const C=w[E];if(typeof _=="number"||typeof _=="boolean"){if(C!==_)return w[E]=_,!0}else{if(ArrayBuffer.isView(_))return!0;if(C.equals(_)===!1)return C.copy(_),!0}}return!1}function p(x){const M=x.uniforms;let y=0;const w=16;for(let E=0,C=M.length;E<C;E++){const P=Array.isArray(M[E])?M[E]:[M[E]];for(let D=0,F=P.length;D<F;D++){const I=P[D],z=Array.isArray(I.value)?I.value:[I.value];for(let Y=0,B=z.length;Y<B;Y++){const W=z[Y],V=m(W),K=y%w,Z=K%V.boundary,de=K+Z;y+=Z,de!==0&&w-de<V.storage&&(y+=w-de),I.__data=new Float32Array(V.storage/Float32Array.BYTES_PER_ELEMENT),I.__offset=y,y+=V.storage}}}const _=y%w;return _>0&&(y+=w-_),x.__size=y,x.__cache={},this}function m(x){const M={boundary:0,storage:0};return typeof x=="number"||typeof x=="boolean"?(M.boundary=4,M.storage=4):x.isVector2?(M.boundary=8,M.storage=8):x.isVector3||x.isColor?(M.boundary=16,M.storage=12):x.isVector4?(M.boundary=16,M.storage=16):x.isMatrix3?(M.boundary=48,M.storage=48):x.isMatrix4?(M.boundary=64,M.storage=64):x.isTexture?Te("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(x)?(M.boundary=16,M.storage=x.byteLength):Te("WebGLRenderer: Unsupported uniform value type.",x),M}function T(x){const M=x.target;M.removeEventListener("dispose",T);const y=a.indexOf(M.__bindingPointIndex);a.splice(y,1),s.deleteBuffer(i[M.id]),delete i[M.id],delete r[M.id]}function A(){for(const x in i)s.deleteBuffer(i[x]);a=[],i={},r={}}return{bind:c,update:l,dispose:A}}const C_=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]);let gn=null;function P_(){return gn===null&&(gn=new kr(C_,16,16,fi,Sn),gn.name="DFG_LUT",gn.minFilter=bt,gn.magFilter=bt,gn.wrapS=bn,gn.wrapT=bn,gn.generateMipmaps=!1,gn.needsUpdate=!0),gn}class I_{constructor(e={}){const{canvas:t=Xd(),context:n=null,depth:i=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:d=!1,reversedDepthBuffer:f=!1,outputBufferType:u=Ht}=e;this.isWebGLRenderer=!0;let g;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=n.getContextAttributes().alpha}else g=a;const v=u,p=new Set([Po,Co,Ro]),m=new Set([Ht,yn,_s,vs,Eo,To]),T=new Uint32Array(4),A=new Int32Array(4),x=new k;let M=null,y=null;const w=[],_=[];let E=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=an,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const C=this;let P=!1,D=null,F=null,I=null,z=null;this._outputColorSpace=ft;let Y=0,B=0,W=null,V=-1,K=null;const Z=new it,de=new it;let ve=null;const Xe=new Ce(0);let qe=0,$e=t.width,j=t.height,te=1,xe=null,Ie=null;const ge=new it(0,0,$e,j),Oe=new it(0,0,$e,j);let xt=!1;const Ge=new ko;let Ke=!1,rt=!1;const We=new Ue,lt=new k,St=new it,Ft={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let dt=!1;function mt(){return W===null?te:1}let N=n;function Tt(S,L){return t.getContext(S,L)}let Qe,R,b,O,X,$,ie,se,J,ee,re,we,le,ae,Ee,Re,De,U,oe,Q,ce,pe,ne;try{const S={alpha:!0,depth:i,stencil:r,antialias:o,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:h,failIfMajorPerformanceCaveat:d};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${So}`),t.addEventListener("webglcontextlost",at,!1),t.addEventListener("webglcontextrestored",Ze,!1),t.addEventListener("webglcontextcreationerror",Jt,!1),N===null){const L="webgl2";if(N=Tt(L,S),N===null)throw Tt(L)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}Ae()}catch(S){throw t.removeEventListener("webglcontextlost",at,!1),t.removeEventListener("webglcontextrestored",Ze,!1),t.removeEventListener("webglcontextcreationerror",Jt,!1),Pe("WebGLRenderer: "+S.message),S}function Ae(){Qe=new P0(N),Qe.init(),ce=new M_(N,Qe),R=new b0(N,Qe,e,ce),b=new x_(N,Qe),R.reversedDepthBuffer&&f&&b.buffers.depth.setReversed(!0),F=N.createFramebuffer(),I=N.createFramebuffer(),z=N.createFramebuffer(),O=new D0(N),X=new r_,$=new b_(N,Qe,b,X,R,ce,O),ie=new C0(C),se=new Nf(N),pe=new v0(N,se),J=new I0(N,se,O,pe),ee=new N0(N,J,se,pe,O),U=new U0(N,R,$),Ee=new M0(X),re=new s_(C,ie,Qe,R,pe,Ee),we=new A_(C,X),le=new o_,ae=new f_(Qe),De=new _0(C,ie,b,ee,g,c),Re=new v_(C,ee,R),ne=new R_(N,O,R,b),oe=new x0(N,Qe,O),Q=new L0(N,Qe,O),O.programs=re.programs,C.capabilities=R,C.extensions=Qe,C.properties=X,C.renderLists=le,C.shadowMap=Re,C.state=b,C.info=O}v!==Ht&&(E=new k0(v,t.width,t.height,o,i,r));const ye=new E_(C,N);this.xr=ye,this.getContext=function(){return N},this.getContextAttributes=function(){return N.getContextAttributes()},this.forceContextLoss=function(){const S=Qe.get("WEBGL_lose_context");S&&S.loseContext()},this.forceContextRestore=function(){const S=Qe.get("WEBGL_lose_context");S&&S.restoreContext()},this.getPixelRatio=function(){return te},this.setPixelRatio=function(S){S!==void 0&&(te=S,this.setSize($e,j,!1))},this.getSize=function(S){return S.set($e,j)},this.setSize=function(S,L,q=!0){if(ye.isPresenting){Te("WebGLRenderer: Can't change size while VR device is presenting.");return}$e=S,j=L,t.width=Math.floor(S*te),t.height=Math.floor(L*te),q===!0&&(t.style.width=S+"px",t.style.height=L+"px"),E!==null&&E.setSize(t.width,t.height),this.setViewport(0,0,S,L)},this.getDrawingBufferSize=function(S){return S.set($e*te,j*te).floor()},this.setDrawingBufferSize=function(S,L,q){$e=S,j=L,te=q,t.width=Math.floor(S*q),t.height=Math.floor(L*q),this.setViewport(0,0,S,L)},this.setEffects=function(S){if(v===Ht){Pe("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(S){for(let L=0;L<S.length;L++)if(S[L].isOutputPass===!0){Te("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}E.setEffects(S||[])},this.getCurrentViewport=function(S){return S.copy(Z)},this.getViewport=function(S){return S.copy(ge)},this.setViewport=function(S,L,q,G){S.isVector4?ge.set(S.x,S.y,S.z,S.w):ge.set(S,L,q,G),b.viewport(Z.copy(ge).multiplyScalar(te).round())},this.getScissor=function(S){return S.copy(Oe)},this.setScissor=function(S,L,q,G){S.isVector4?Oe.set(S.x,S.y,S.z,S.w):Oe.set(S,L,q,G),b.scissor(de.copy(Oe).multiplyScalar(te).round())},this.getScissorTest=function(){return xt},this.setScissorTest=function(S){b.setScissorTest(xt=S)},this.setOpaqueSort=function(S){xe=S},this.setTransparentSort=function(S){Ie=S},this.getClearColor=function(S){return S.copy(De.getClearColor())},this.setClearColor=function(){De.setClearColor(...arguments)},this.getClearAlpha=function(){return De.getClearAlpha()},this.setClearAlpha=function(){De.setClearAlpha(...arguments)},this.clear=function(S=!0,L=!0,q=!0){let G=0;if(S){let H=!1;if(W!==null){const fe=W.texture.format;H=p.has(fe)}if(H){const fe=W.texture.type,_e=m.has(fe),ue=De.getClearColor(),be=De.getClearAlpha(),Se=ue.r,Ne=ue.g,He=ue.b;_e?(T[0]=Se,T[1]=Ne,T[2]=He,T[3]=be,N.clearBufferuiv(N.COLOR,0,T)):(A[0]=Se,A[1]=Ne,A[2]=He,A[3]=be,N.clearBufferiv(N.COLOR,0,A))}else G|=N.COLOR_BUFFER_BIT}L&&(G|=N.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),q&&(G|=N.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),G!==0&&N.clear(G)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(S){S.setRenderer(this),D=S},this.dispose=function(){t.removeEventListener("webglcontextlost",at,!1),t.removeEventListener("webglcontextrestored",Ze,!1),t.removeEventListener("webglcontextcreationerror",Jt,!1),De.dispose(),le.dispose(),ae.dispose(),X.dispose(),ie.dispose(),ee.dispose(),pe.dispose(),ne.dispose(),re.dispose(),ye.dispose(),ye.removeEventListener("sessionstart",jo),ye.removeEventListener("sessionend",Jo),ni.stop()};function at(S){S.preventDefault(),Er("WebGLRenderer: Context Lost."),P=!0}function Ze(){Er("WebGLRenderer: Context Restored."),P=!1;const S=O.autoReset,L=Re.enabled,q=Re.autoUpdate,G=Re.needsUpdate,H=Re.type;Ae(),O.autoReset=S,Re.enabled=L,Re.autoUpdate=q,Re.needsUpdate=G,Re.type=H}function Jt(S){Pe("WebGLRenderer: A WebGL context could not be created. Reason: ",S.statusMessage)}function fn(S){const L=S.target;L.removeEventListener("dispose",fn),kh(L)}function kh(S){Oh(S),X.remove(S)}function Oh(S){const L=X.get(S).programs;L!==void 0&&(L.forEach(function(q){re.releaseProgram(q)}),S.isShaderMaterial&&re.releaseShaderCache(S))}this.renderBufferDirect=function(S,L,q,G,H,fe){L===null&&(L=Ft);const _e=H.isMesh&&H.matrixWorld.determinantAffine()<0,ue=Gh(S,L,q,G,H);b.setMaterial(G,_e);let be=q.index,Se=1;if(G.wireframe===!0){if(be=J.getWireframeAttribute(q),be===void 0)return;Se=2}const Ne=q.drawRange,He=q.attributes.position;let Me=Ne.start*Se,je=(Ne.start+Ne.count)*Se;fe!==null&&(Me=Math.max(Me,fe.start*Se),je=Math.min(je,(fe.start+fe.count)*Se)),be!==null?(Me=Math.max(Me,0),je=Math.min(je,be.count)):He!=null&&(Me=Math.max(Me,0),je=Math.min(je,He.count));const gt=je-Me;if(gt<0||gt===1/0)return;pe.setup(H,G,ue,q,be);let ct,st=oe;if(be!==null&&(ct=se.get(be),st=Q,st.setIndex(ct)),H.isMesh)G.wireframe===!0?(b.setLineWidth(G.wireframeLinewidth*mt()),st.setMode(N.LINES)):st.setMode(N.TRIANGLES);else if(H.isLine){let At=G.linewidth;At===void 0&&(At=1),b.setLineWidth(At*mt()),H.isLineSegments?st.setMode(N.LINES):H.isLineLoop?st.setMode(N.LINE_LOOP):st.setMode(N.LINE_STRIP)}else H.isPoints?st.setMode(N.POINTS):H.isSprite&&st.setMode(N.TRIANGLES);if(H.isBatchedMesh)if(Qe.get("WEBGL_multi_draw"))st.renderMultiDraw(H._multiDrawStarts,H._multiDrawCounts,H._multiDrawCount);else{const At=H._multiDrawStarts,me=H._multiDrawCounts,Lt=H._multiDrawCount,Ye=be?se.get(be).bytesPerElement:1,Wt=X.get(G).currentProgram.getUniforms();for(let pn=0;pn<Lt;pn++)Wt.setValue(N,"_gl_DrawID",pn),st.render(At[pn]/Ye,me[pn])}else if(H.isInstancedMesh)st.renderInstances(Me,gt,H.count);else if(q.isInstancedBufferGeometry){const At=q._maxInstanceCount!==void 0?q._maxInstanceCount:1/0,me=Math.min(q.instanceCount,At);st.renderInstances(Me,gt,me)}else st.render(Me,gt)};function Zo(S,L,q,G){D!==null&&S.isNodeMaterial&&D.setObject(G,S),Ke===!0&&Ee.setState(S,q,!1),S.transparent===!0&&S.side===xn&&S.forceSinglePass===!1?(S.side=Nt,S.needsUpdate=!0,Ps(S,L,G),S.side=Qn,S.needsUpdate=!0,Ps(S,L,G),S.side=xn):Ps(S,L,G)}this.compile=function(S,L,q=null){q===null&&(q=S),D!==null&&D.renderStart(S,L,q),y=ae.get(q),y.init(L),_.push(y),q.traverseVisible(function(H){H.isLight&&H.layers.test(L.layers)&&(y.pushLight(H),H.castShadow&&y.pushShadow(H))}),S!==q&&S.traverseVisible(function(H){H.isLight&&H.layers.test(L.layers)&&(y.pushLight(H),H.castShadow&&y.pushShadow(H))}),y.setupLights(),D!==null&&D.updateLights(y.state.lightsArray),rt=this.localClippingEnabled,Ke=Ee.init(this.clippingPlanes,rt),Ke===!0&&Ee.setGlobalState(this.clippingPlanes,L),D!==null&&Re.render(y.state.shadowsArray,q,L);const G=new Set;return S.traverse(function(H){if(!(H.isMesh||H.isPoints||H.isLine||H.isSprite))return;const fe=H.material;if(fe)if(Array.isArray(fe))for(let _e=0;_e<fe.length;_e++){const ue=fe[_e];Zo(ue,q,L,H),G.add(ue)}else Zo(fe,q,L,H),G.add(fe)}),y=_.pop(),D!==null&&D.renderEnd(),G},this.compileAsync=function(S,L,q=null){const G=this.compile(S,L,q);return new Promise(H=>{function fe(){if(G.forEach(function(_e){const be=X.get(_e).currentProgram;(be===void 0||be.isReady())&&G.delete(_e)}),G.size===0){H(S);return}setTimeout(fe,10)}Qe.get("KHR_parallel_shader_compile")!==null?fe():setTimeout(fe,10)})};let Hr=null;function Bh(S){Hr&&Hr(S)}function jo(){ni.stop()}function Jo(){ni.start()}const ni=new yh;ni.setAnimationLoop(Bh),typeof self<"u"&&ni.setContext(self),this.setAnimationLoop=function(S){Hr=S,ye.setAnimationLoop(S),S===null?ni.stop():ni.start()},ye.addEventListener("sessionstart",jo),ye.addEventListener("sessionend",Jo),this.render=function(S,L){if(L!==void 0&&L.isCamera!==!0){Pe("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(P===!0)return;D!==null&&D.renderStart(S,L);const q=ye.enabled===!0&&ye.isPresenting===!0,G=E!==null&&(W===null||q)&&E.begin(C,W);if(S.matrixWorldAutoUpdate===!0&&S.updateMatrixWorld(),L.parent===null&&L.matrixWorldAutoUpdate===!0&&L.updateMatrixWorld(),ye.enabled===!0&&ye.isPresenting===!0&&(E===null||E.isCompositing()===!1)&&(ye.cameraAutoUpdate===!0&&ye.updateCamera(L),L=ye.getCamera()),S.isScene===!0&&S.onBeforeRender(C,S,L,W),y=ae.get(S,_.length),y.init(L),y.state.textureUnits=$.getTextureUnits(),_.push(y),We.multiplyMatrices(L.projectionMatrix,L.matrixWorldInverse),Ge.setFromProjectionMatrix(We,Mn,L.reversedDepth),rt=this.localClippingEnabled,Ke=Ee.init(this.clippingPlanes,rt),M=le.get(S,w.length),M.init(),w.push(M),ye.enabled===!0&&ye.isPresenting===!0){const _e=C.xr.getDepthSensingMesh();_e!==null&&Vr(_e,L,-1/0,C.sortObjects)}Vr(S,L,0,C.sortObjects),M.finish(),D!==null&&D.updateLights(y.state.lightsArray),C.sortObjects===!0&&M.sort(xe,Ie),dt=ye.enabled===!1||ye.isPresenting===!1||ye.hasDepthSensing()===!1,dt&&De.addToRenderList(M,S),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),Ke===!0&&Ee.beginShadows();const H=y.state.shadowsArray;if(Re.render(H,S,L),Ke===!0&&Ee.endShadows(),(G&&E.hasRenderPass())===!1){const _e=M.opaque,ue=M.transmissive;if(y.setupLights(),L.isArrayCamera){const be=L.cameras;if(ue.length>0)for(let Se=0,Ne=be.length;Se<Ne;Se++){const He=be[Se];ec(_e,ue,S,He)}dt&&De.render(S);for(let Se=0,Ne=be.length;Se<Ne;Se++){const He=be[Se];Qo(M,S,He,He.viewport)}}else ue.length>0&&ec(_e,ue,S,L),dt&&De.render(S),Qo(M,S,L)}W!==null&&B===0&&($.updateMultisampleRenderTarget(W),$.updateRenderTargetMipmap(W)),G&&E.end(C),S.isScene===!0&&S.onAfterRender(C,S,L),pe.resetDefaultState(),V=-1,K=null,_.pop(),_.length>0?(y=_[_.length-1],$.setTextureUnits(y.state.textureUnits),Ke===!0&&Ee.setGlobalState(C.clippingPlanes,y.state.camera)):y=null,w.pop(),w.length>0?M=w[w.length-1]:M=null,D!==null&&D.renderEnd()};function Vr(S,L,q,G){if(S.visible===!1)return;if(S.layers.test(L.layers)){if(S.isGroup)q=S.renderOrder;else if(S.isLOD)S.autoUpdate===!0&&S.update(L);else if(S.isLightProbeGrid)y.pushLightProbeGrid(S);else if(S.isLight)y.pushLight(S),S.castShadow&&y.pushShadow(S);else if(S.isSprite){if(!S.frustumCulled||S.intersectsFrustum(Ge)){G&&St.setFromMatrixPosition(S.matrixWorld).applyMatrix4(We);const _e=ee.update(S),ue=S.material;ue.visible&&M.push(S,_e,ue,q,St.z,null,L)}}else if((S.isMesh||S.isLine||S.isPoints)&&(!S.frustumCulled||S.intersectsFrustum(Ge))){const _e=ee.update(S),ue=S.material;if(G&&(S.boundingSphere!==void 0?(S.boundingSphere===null&&S.computeBoundingSphere(),St.copy(S.boundingSphere.center)):(_e.boundingSphere===null&&_e.computeBoundingSphere(),St.copy(_e.boundingSphere.center)),St.applyMatrix4(S.matrixWorld).applyMatrix4(We)),Array.isArray(ue)){const be=_e.groups;for(let Se=0,Ne=be.length;Se<Ne;Se++){const He=be[Se],Me=ue[He.materialIndex];Me&&Me.visible&&M.push(S,_e,Me,q,St.z,He,L)}}else ue.visible&&M.push(S,_e,ue,q,St.z,null,L)}}const fe=S.children;for(let _e=0,ue=fe.length;_e<ue;_e++)Vr(fe[_e],L,q,G)}function Qo(S,L,q,G){const{opaque:H,transmissive:fe,transparent:_e}=S;y.setupLightsView(q),Ke===!0&&Ee.setGlobalState(C.clippingPlanes,q),G&&b.viewport(Z.copy(G)),H.length>0&&Cs(H,L,q),fe.length>0&&Cs(fe,L,q),_e.length>0&&Cs(_e,L,q),b.buffers.depth.setTest(!0),b.buffers.depth.setMask(!0),b.buffers.color.setMask(!0),b.setPolygonOffset(!1)}function ec(S,L,q,G){if((q.isScene===!0?q.overrideMaterial:null)!==null)return;if(y.state.transmissionRenderTarget[G.id]===void 0){const Me=Qe.has("EXT_color_buffer_half_float")||Qe.has("EXT_color_buffer_float");y.state.transmissionRenderTarget[G.id]=new cn(1,1,{generateMipmaps:!0,type:Me?Sn:Ht,minFilter:Dn,samples:Math.max(4,R.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:Be.workingColorSpace})}const fe=y.state.transmissionRenderTarget[G.id],_e=G.viewport||Z;fe.setSize(_e.z*C.transmissionResolutionScale,_e.w*C.transmissionResolutionScale);const ue=C.getRenderTarget(),be=C.getActiveCubeFace(),Se=C.getActiveMipmapLevel();C.setRenderTarget(fe),C.getClearColor(Xe),qe=C.getClearAlpha(),qe<1&&C.setClearColor(16777215,.5),C.clear(),dt&&De.render(q);const Ne=C.toneMapping;C.toneMapping=an;const He=G.viewport;if(G.viewport!==void 0&&(G.viewport=void 0),y.setupLightsView(G),Ke===!0&&Ee.setGlobalState(C.clippingPlanes,G),Cs(S,q,G),$.updateMultisampleRenderTarget(fe),$.updateRenderTargetMipmap(fe),Qe.has("WEBGL_multisampled_render_to_texture")===!1){let Me=!1;for(let je=0,gt=L.length;je<gt;je++){const ct=L[je],{object:st,geometry:At,material:me,group:Lt}=ct;if(me.side===xn&&st.layers.test(G.layers)){const Ye=me.side;me.side=Nt,me.needsUpdate=!0,tc(st,q,G,At,me,Lt),me.side=Ye,me.needsUpdate=!0,Me=!0}}Me===!0&&($.updateMultisampleRenderTarget(fe),$.updateRenderTargetMipmap(fe))}C.setRenderTarget(ue,be,Se),C.setClearColor(Xe,qe),He!==void 0&&(G.viewport=He),C.toneMapping=Ne}function Cs(S,L,q){const G=L.isScene===!0?L.overrideMaterial:null;for(let H=0,fe=S.length;H<fe;H++){const _e=S[H],{object:ue,geometry:be,group:Se}=_e;let Ne=_e.material;Ne.allowOverride===!0&&G!==null&&(Ne=G),ue.layers.test(q.layers)&&tc(ue,L,q,be,Ne,Se)}}function tc(S,L,q,G,H,fe){D!==null&&H.isNodeMaterial&&D.setObject(S,H),S.onBeforeRender(C,L,q,G,H,fe),S.modelViewMatrix.multiplyMatrices(q.matrixWorldInverse,S.matrixWorld),S.normalMatrix.getNormalMatrix(S.modelViewMatrix),H.onBeforeRender(C,L,q,G,S,fe),H.transparent===!0&&H.side===xn&&H.forceSinglePass===!1?(H.side=Nt,H.needsUpdate=!0,C.renderBufferDirect(q,L,G,H,S,fe),H.side=Qn,H.needsUpdate=!0,C.renderBufferDirect(q,L,G,H,S,fe),H.side=xn):C.renderBufferDirect(q,L,G,H,S,fe),S.onAfterRender(C,L,q,G,H,fe)}function Ps(S,L,q){L.isScene!==!0&&(L=Ft);const G=X.get(S),H=y.state.lights,fe=y.state.shadowsArray,_e=H.state.version,ue=re.getParameters(S,H.state,fe,L,q,y.state.lightProbeGridArray),be=re.getProgramCacheKey(ue);let Se=G.programs;G.environment=S.isMeshStandardMaterial||S.isMeshLambertMaterial||S.isMeshPhongMaterial?L.environment:null,G.fog=L.fog;const Ne=S.isMeshStandardMaterial||S.isMeshLambertMaterial&&!S.envMap||S.isMeshPhongMaterial&&!S.envMap;G.envMap=ie.get(S.envMap||G.environment,Ne),G.envMapRotation=G.environment!==null&&S.envMap===null?L.environmentRotation:S.envMapRotation,Se===void 0&&(S.addEventListener("dispose",fn),Se=new Map,G.programs=Se);let He=Se.get(be);if(He!==void 0){if(G.currentProgram===He&&G.lightsStateVersion===_e)return ic(S,ue),He}else ue.uniforms=re.getUniforms(S),D!==null&&S.isNodeMaterial&&D.build(S,q,ue),S.onBeforeCompile(ue,C),He=re.acquireProgram(ue,be),Se.set(be,He),G.uniforms=ue.uniforms;const Me=G.uniforms;return(!S.isShaderMaterial&&!S.isRawShaderMaterial||S.clipping===!0)&&(Me.clippingPlanes=Ee.uniform),ic(S,ue),G.needsLights=Vh(S),G.lightsStateVersion=_e,G.needsLights&&(Me.ambientLightColor.value=H.state.ambient,Me.lightProbe.value=H.state.probe,Me.sunLights.value=H.state.sun,Me.sunLightShadows.value=H.state.sunShadow,Me.directionalLights.value=H.state.directional,Me.directionalLightShadows.value=H.state.directionalShadow,Me.spotLights.value=H.state.spot,Me.spotLightShadows.value=H.state.spotShadow,Me.rectAreaLights.value=H.state.rectArea,Me.ltc_1.value=H.state.rectAreaLTC1,Me.ltc_2.value=H.state.rectAreaLTC2,Me.pointLights.value=H.state.point,Me.pointLightShadows.value=H.state.pointShadow,Me.hemisphereLights.value=H.state.hemi,Me.sunShadowMatrix.value=H.state.sunShadowMatrix,Me.sunShadowCascade.value=H.state.sunShadowCascade,Me.directionalShadowMatrix.value=H.state.directionalShadowMatrix,Me.spotLightMatrix.value=H.state.spotLightMatrix,Me.spotLightMap.value=H.state.spotLightMap,Me.pointShadowMatrix.value=H.state.pointShadowMatrix),G.lightProbeGrid=y.state.lightProbeGridArray.length>0,G.currentProgram=He,G.uniformsList=null,He}function nc(S){if(S.uniformsList===null){const L=S.currentProgram.getUniforms();S.uniformsList=_r.seqWithValue(L.seq,S.uniforms)}return S.uniformsList}function ic(S,L){const q=X.get(S);q.outputColorSpace=L.outputColorSpace,q.batching=L.batching,q.batchingColor=L.batchingColor,q.instancing=L.instancing,q.instancingColor=L.instancingColor,q.instancingMorph=L.instancingMorph,q.skinning=L.skinning,q.morphTargets=L.morphTargets,q.morphNormals=L.morphNormals,q.morphColors=L.morphColors,q.morphTargetsCount=L.morphTargetsCount,q.numClippingPlanes=L.numClippingPlanes,q.numIntersection=L.numClipIntersection,q.vertexAlphas=L.vertexAlphas,q.vertexTangents=L.vertexTangents,q.toneMapping=L.toneMapping}function zh(S,L){if(S.length===0)return null;if(S.length===1)return S[0].texture!==null?S[0]:null;x.setFromMatrixPosition(L.matrixWorld);for(let q=0,G=S.length;q<G;q++){const H=S[q];if(H.texture!==null&&H.boundingBox.containsPoint(x))return H}return null}function Gh(S,L,q,G,H){L.isScene!==!0&&(L=Ft),$.resetTextureUnits();const fe=L.fog,_e=G.isMeshStandardMaterial||G.isMeshLambertMaterial||G.isMeshPhongMaterial?L.environment:null,ue=W===null?C.outputColorSpace:W.isXRRenderTarget===!0?W.texture.colorSpace:Be.workingColorSpace,be=G.isMeshStandardMaterial||G.isMeshLambertMaterial&&!G.envMap||G.isMeshPhongMaterial&&!G.envMap,Se=ie.get(G.envMap||_e,be),Ne=G.vertexColors===!0&&!!q.attributes.color&&q.attributes.color.itemSize===4,He=!!q.attributes.tangent&&(!!G.normalMap||G.anisotropy>0),Me=!!q.morphAttributes.position,je=!!q.morphAttributes.normal,gt=!!q.morphAttributes.color;let ct=an;G.toneMapped&&(W===null||W.isXRRenderTarget===!0)&&(ct=C.toneMapping);const st=q.morphAttributes.position||q.morphAttributes.normal||q.morphAttributes.color,At=st!==void 0?st.length:0,me=X.get(G),Lt=y.state.lights;if(Ke===!0&&(rt===!0||S!==K)){const ot=S===K&&G.id===V;Ee.setState(G,S,ot)}let Ye=!1;G.version===me.__version?(me.needsLights&&me.lightsStateVersion!==Lt.state.version||me.outputColorSpace!==ue||H.isBatchedMesh&&me.batching===!1||!H.isBatchedMesh&&me.batching===!0||H.isBatchedMesh&&me.batchingColor===!0&&H._colorsTexture===null||H.isBatchedMesh&&me.batchingColor===!1&&H._colorsTexture!==null||H.isInstancedMesh&&me.instancing===!1||!H.isInstancedMesh&&me.instancing===!0||H.isSkinnedMesh&&me.skinning===!1||!H.isSkinnedMesh&&me.skinning===!0||H.isInstancedMesh&&me.instancingColor===!0&&H.instanceColor===null||H.isInstancedMesh&&me.instancingColor===!1&&H.instanceColor!==null||H.isInstancedMesh&&me.instancingMorph===!0&&H.morphTexture===null||H.isInstancedMesh&&me.instancingMorph===!1&&H.morphTexture!==null||me.envMap!==Se||G.fog===!0&&me.fog!==fe||me.numClippingPlanes!==void 0&&(me.numClippingPlanes!==Ee.numPlanes||me.numIntersection!==Ee.numIntersection)||me.vertexAlphas!==Ne||me.vertexTangents!==He||me.morphTargets!==Me||me.morphNormals!==je||me.morphColors!==gt||me.toneMapping!==ct||me.morphTargetsCount!==At||!!me.lightProbeGrid!=y.state.lightProbeGridArray.length>0)&&(Ye=!0):(Ye=!0,me.__version=G.version);let Wt=me.currentProgram;Ye===!0&&(Wt=Ps(G,L,H),D&&G.isNodeMaterial&&D.onUpdateProgram(G,Wt,me));let pn=!1,On=!1,mi=!1;const nt=Wt.getUniforms(),ut=me.uniforms;if(b.useProgram(Wt.program)&&(pn=!0,On=!0,mi=!0),G.id!==V&&(V=G.id,On=!0),me.needsLights){const ot=zh(y.state.lightProbeGridArray,H);me.lightProbeGrid!==ot&&(me.lightProbeGrid=ot,On=!0)}if(pn||K!==S){b.buffers.depth.getReversed()&&S.reversedDepth!==!0&&(S._reversedDepth=!0,S.updateProjectionMatrix()),nt.setValue(N,"projectionMatrix",S.projectionMatrix),nt.setValue(N,"viewMatrix",S.matrixWorldInverse);const zn=nt.map.cameraPosition;zn!==void 0&&zn.setValue(N,lt.setFromMatrixPosition(S.matrixWorld)),R.logarithmicDepthBuffer&&nt.setValue(N,"logDepthBufFC",2/(Math.log(S.far+1)/Math.LN2)),(G.isMeshPhongMaterial||G.isMeshToonMaterial||G.isMeshLambertMaterial||G.isMeshBasicMaterial||G.isMeshStandardMaterial||G.isShaderMaterial)&&nt.setValue(N,"isOrthographic",S.isOrthographicCamera===!0),K!==S&&(K=S,On=!0,mi=!0)}if(me.needsLights&&(Lt.state.sunShadowMap.length>0&&nt.setValue(N,"sunShadowMap",Lt.state.sunShadowMap,$),Lt.state.directionalShadowMap.length>0&&nt.setValue(N,"directionalShadowMap",Lt.state.directionalShadowMap,$),Lt.state.spotShadowMap.length>0&&nt.setValue(N,"spotShadowMap",Lt.state.spotShadowMap,$),Lt.state.pointShadowMap.length>0&&nt.setValue(N,"pointShadowMap",Lt.state.pointShadowMap,$)),H.isSkinnedMesh){nt.setOptional(N,H,"bindMatrix"),nt.setOptional(N,H,"bindMatrixInverse");const ot=H.skeleton;ot&&(ot.boneTexture===null&&ot.computeBoneTexture(),nt.setValue(N,"boneTexture",ot.boneTexture,$))}H.isBatchedMesh&&(nt.setOptional(N,H,"batchingTexture"),nt.setValue(N,"batchingTexture",H._matricesTexture,$),nt.setOptional(N,H,"batchingIdTexture"),nt.setValue(N,"batchingIdTexture",H._indirectTexture,$),nt.setOptional(N,H,"batchingColorTexture"),H._colorsTexture!==null&&nt.setValue(N,"batchingColorTexture",H._colorsTexture,$));const Bn=q.morphAttributes;if((Bn.position!==void 0||Bn.normal!==void 0||Bn.color!==void 0)&&U.update(H,q,Wt),(On||me.receiveShadow!==H.receiveShadow)&&(me.receiveShadow=H.receiveShadow,nt.setValue(N,"receiveShadow",H.receiveShadow)),(G.isMeshStandardMaterial||G.isMeshLambertMaterial||G.isMeshPhongMaterial)&&G.envMap===null&&L.environment!==null&&(ut.envMapIntensity.value=L.environmentIntensity),ut.dfgLUT!==void 0&&(ut.dfgLUT.value=P_()),On){if(nt.setValue(N,"toneMappingExposure",C.toneMappingExposure),me.needsLights&&Hh(ut,mi),fe&&G.fog===!0&&we.refreshFogUniforms(ut,fe),we.refreshMaterialUniforms(ut,G,te,j,y.state.transmissionRenderTarget[S.id]),me.needsLights&&me.lightProbeGrid){const ot=me.lightProbeGrid;ut.probesSH.value=ot.texture,ut.probesMin.value.copy(ot.boundingBox.min),ut.probesMax.value.copy(ot.boundingBox.max),ut.probesResolution.value.copy(ot.resolution)}_r.upload(N,nc(me),ut,$)}if(G.isShaderMaterial&&G.uniformsNeedUpdate===!0&&(_r.upload(N,nc(me),ut,$),G.uniformsNeedUpdate=!1),G.isSpriteMaterial&&nt.setValue(N,"center",H.center),nt.setValue(N,"modelViewMatrix",H.modelViewMatrix),nt.setValue(N,"normalMatrix",H.normalMatrix),nt.setValue(N,"modelMatrix",H.matrixWorld),G.uniformsGroups!==void 0){const ot=G.uniformsGroups;for(let zn=0,gi=ot.length;zn<gi;zn++){const rc=ot[zn];ne.update(rc,Wt),ne.bind(rc,Wt)}}return Wt}function Hh(S,L){S.ambientLightColor.needsUpdate=L,S.lightProbe.needsUpdate=L,S.sunLights.needsUpdate=L,S.sunLightShadows.needsUpdate=L,S.directionalLights.needsUpdate=L,S.directionalLightShadows.needsUpdate=L,S.pointLights.needsUpdate=L,S.pointLightShadows.needsUpdate=L,S.spotLights.needsUpdate=L,S.spotLightShadows.needsUpdate=L,S.rectAreaLights.needsUpdate=L,S.hemisphereLights.needsUpdate=L}function Vh(S){return S.isMeshLambertMaterial||S.isMeshToonMaterial||S.isMeshPhongMaterial||S.isMeshStandardMaterial||S.isShadowMaterial||S.isShaderMaterial&&S.lights===!0}this.getActiveCubeFace=function(){return Y},this.getActiveMipmapLevel=function(){return B},this.getRenderTarget=function(){return W},this.setRenderTargetTextures=function(S,L,q){const G=X.get(S);G.__autoAllocateDepthBuffer=S.resolveDepthBuffer===!1,G.__autoAllocateDepthBuffer===!1&&(G.__useRenderToTexture=!1),X.get(S.texture).__webglTexture=L,X.get(S.depthTexture).__webglTexture=G.__autoAllocateDepthBuffer?void 0:q,G.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(S,L){const q=X.get(S);q.__webglFramebuffer=L,q.__useDefaultFramebuffer=L===void 0},this.setRenderTarget=function(S,L=0,q=0){W=S,Y=L,B=q;let G=null,H=!1,fe=!1;if(S){const ue=X.get(S);if(ue.__useDefaultFramebuffer!==void 0){b.bindFramebuffer(N.FRAMEBUFFER,ue.__webglFramebuffer),Z.copy(S.viewport),de.copy(S.scissor),ve=S.scissorTest,b.viewport(Z),b.scissor(de),b.setScissorTest(ve),V=-1;return}else if(ue.__webglFramebuffer===void 0)$.setupRenderTarget(S);else if(ue.__hasExternalTextures)$.rebindTextures(S,X.get(S.texture).__webglTexture,X.get(S.depthTexture).__webglTexture);else if(S.depthBuffer){const Ne=S.depthTexture;if(ue.__boundDepthTexture!==Ne){if(Ne!==null&&X.has(Ne)&&(S.width!==Ne.image.width||S.height!==Ne.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");$.setupDepthRenderbuffer(S)}}const be=S.texture;(be.isData3DTexture||be.isDataArrayTexture||be.isCompressedArrayTexture)&&(fe=!0);const Se=X.get(S).__webglFramebuffer;S.isWebGLCubeRenderTarget?(Array.isArray(Se[L])?G=Se[L][q]:G=Se[L],H=!0):S.samples>0&&$.useMultisampledRTT(S)===!1?G=X.get(S).__webglMultisampledFramebuffer:Array.isArray(Se)?G=Se[q]:G=Se,Z.copy(S.viewport),de.copy(S.scissor),ve=S.scissorTest}else Z.copy(ge).multiplyScalar(te).floor(),de.copy(Oe).multiplyScalar(te).floor(),ve=xt;if(q!==0&&(G=F),b.bindFramebuffer(N.FRAMEBUFFER,G)&&b.drawBuffers(S,G),b.viewport(Z),b.scissor(de),b.setScissorTest(ve),H){const ue=X.get(S.texture);N.framebufferTexture2D(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_CUBE_MAP_POSITIVE_X+L,ue.__webglTexture,q)}else if(fe){const ue=L;for(let be=0;be<S.textures.length;be++){const Se=X.get(S.textures[be]);N.framebufferTextureLayer(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0+be,Se.__webglTexture,q,ue)}}else if(S!==null&&q!==0){const ue=X.get(S.texture);N.framebufferTexture2D(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,ue.__webglTexture,q)}V=-1};function sc(S){const L=X.get(S);return(L.__readFormat!==S.format||L.__readType!==S.type)&&(L.__readFormat=S.format,L.__readType=S.type,L.__formatReadable=R.textureFormatReadable(S.format),L.__typeReadable=R.textureTypeReadable(S.type)),L}this.readRenderTargetPixels=function(S,L,q,G,H,fe,_e,ue=0){if(!(S&&S.isWebGLRenderTarget)){Pe("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let be=X.get(S).__webglFramebuffer;if(S.isWebGLCubeRenderTarget&&_e!==void 0&&(be=be[_e]),be){b.bindFramebuffer(N.FRAMEBUFFER,be);try{const Se=S.textures[ue],Ne=Se.format,He=Se.type;S.textures.length>1&&N.readBuffer(N.COLOR_ATTACHMENT0+ue);const Me=sc(Se);if(Me.__formatReadable===!1){Pe("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Me.__typeReadable===!1){Pe("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}L>=0&&L<=S.width-G&&q>=0&&q<=S.height-H&&N.readPixels(L,q,G,H,ce.convert(Ne),ce.convert(He),fe)}finally{const Se=W!==null?X.get(W).__webglFramebuffer:null;b.bindFramebuffer(N.FRAMEBUFFER,Se)}}},this.readRenderTargetPixelsAsync=async function(S,L,q,G,H,fe,_e,ue=0){if(!(S&&S.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let be=X.get(S).__webglFramebuffer;if(S.isWebGLCubeRenderTarget&&_e!==void 0&&(be=be[_e]),be)if(L>=0&&L<=S.width-G&&q>=0&&q<=S.height-H){b.bindFramebuffer(N.FRAMEBUFFER,be);const Se=S.textures[ue],Ne=Se.format,He=Se.type;S.textures.length>1&&N.readBuffer(N.COLOR_ATTACHMENT0+ue);const Me=sc(Se);if(Me.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Me.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const je=N.createBuffer();N.bindBuffer(N.PIXEL_PACK_BUFFER,je),N.bufferData(N.PIXEL_PACK_BUFFER,fe.byteLength,N.STREAM_READ),N.readPixels(L,q,G,H,ce.convert(Ne),ce.convert(He),0),N.bindBuffer(N.PIXEL_PACK_BUFFER,null);const gt=W!==null?X.get(W).__webglFramebuffer:null;b.bindFramebuffer(N.FRAMEBUFFER,gt);const ct=N.fenceSync(N.SYNC_GPU_COMMANDS_COMPLETE,0);return N.flush(),await qd(N,ct,4),N.bindBuffer(N.PIXEL_PACK_BUFFER,je),N.getBufferSubData(N.PIXEL_PACK_BUFFER,0,fe),N.bindBuffer(N.PIXEL_PACK_BUFFER,null),N.deleteBuffer(je),N.deleteSync(ct),fe}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(S,L=null,q=0){const G=Math.pow(2,-q),H=Math.floor(S.image.width*G),fe=Math.floor(S.image.height*G),_e=L!==null?L.x:0,ue=L!==null?L.y:0;$.setTexture2D(S,0),N.copyTexSubImage2D(N.TEXTURE_2D,q,0,0,_e,ue,H,fe),b.unbindTexture()},this.copyTextureToTexture=function(S,L,q=null,G=null,H=0,fe=0){let _e,ue,be,Se,Ne,He,Me,je,gt;const ct=S.isCompressedTexture?S.mipmaps[fe]:S.image;if(q!==null)_e=q.max.x-q.min.x,ue=q.max.y-q.min.y,be=q.isBox3?q.max.z-q.min.z:1,Se=q.min.x,Ne=q.min.y,He=q.isBox3?q.min.z:0;else{const ut=Math.pow(2,-H);_e=Math.floor(ct.width*ut),ue=Math.floor(ct.height*ut),S.isDataArrayTexture?be=ct.depth:S.isData3DTexture?be=Math.floor(ct.depth*ut):be=1,Se=0,Ne=0,He=0}G!==null?(Me=G.x,je=G.y,gt=G.z):(Me=0,je=0,gt=0);const st=ce.convert(L.format),At=ce.convert(L.type);let me;L.isData3DTexture?($.setTexture3D(L,0),me=N.TEXTURE_3D):L.isDataArrayTexture||L.isCompressedArrayTexture?($.setTexture2DArray(L,0),me=N.TEXTURE_2D_ARRAY):($.setTexture2D(L,0),me=N.TEXTURE_2D),b.activeTexture(N.TEXTURE0),b.pixelStorei(N.UNPACK_FLIP_Y_WEBGL,L.flipY),b.pixelStorei(N.UNPACK_PREMULTIPLY_ALPHA_WEBGL,L.premultiplyAlpha),b.pixelStorei(N.UNPACK_ALIGNMENT,L.unpackAlignment);const Lt=b.getParameter(N.UNPACK_ROW_LENGTH),Ye=b.getParameter(N.UNPACK_IMAGE_HEIGHT),Wt=b.getParameter(N.UNPACK_SKIP_PIXELS),pn=b.getParameter(N.UNPACK_SKIP_ROWS),On=b.getParameter(N.UNPACK_SKIP_IMAGES);b.pixelStorei(N.UNPACK_ROW_LENGTH,ct.width),b.pixelStorei(N.UNPACK_IMAGE_HEIGHT,ct.height),b.pixelStorei(N.UNPACK_SKIP_PIXELS,Se),b.pixelStorei(N.UNPACK_SKIP_ROWS,Ne),b.pixelStorei(N.UNPACK_SKIP_IMAGES,He);const mi=S.isDataArrayTexture||S.isData3DTexture,nt=L.isDataArrayTexture||L.isData3DTexture;if(S.isDepthTexture){const ut=X.get(S),Bn=X.get(L),ot=X.get(ut.__renderTarget),zn=X.get(Bn.__renderTarget);b.bindFramebuffer(N.READ_FRAMEBUFFER,ot.__webglFramebuffer),b.bindFramebuffer(N.DRAW_FRAMEBUFFER,zn.__webglFramebuffer);for(let gi=0;gi<be;gi++)mi&&(N.framebufferTextureLayer(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,X.get(S).__webglTexture,H,He+gi),N.framebufferTextureLayer(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,X.get(L).__webglTexture,fe,gt+gi)),N.blitFramebuffer(Se,Ne,_e,ue,Me,je,_e,ue,N.DEPTH_BUFFER_BIT,N.NEAREST);b.bindFramebuffer(N.READ_FRAMEBUFFER,null),b.bindFramebuffer(N.DRAW_FRAMEBUFFER,null)}else if(H!==0||S.isRenderTargetTexture||X.has(S)){const ut=X.get(S),Bn=X.get(L);b.bindFramebuffer(N.READ_FRAMEBUFFER,I),b.bindFramebuffer(N.DRAW_FRAMEBUFFER,z);for(let ot=0;ot<be;ot++)mi?N.framebufferTextureLayer(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,ut.__webglTexture,H,He+ot):N.framebufferTexture2D(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,ut.__webglTexture,H),nt?N.framebufferTextureLayer(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,Bn.__webglTexture,fe,gt+ot):N.framebufferTexture2D(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,Bn.__webglTexture,fe),H!==0?N.blitFramebuffer(Se,Ne,_e,ue,Me,je,_e,ue,N.COLOR_BUFFER_BIT,N.NEAREST):nt?N.copyTexSubImage3D(me,fe,Me,je,gt+ot,Se,Ne,_e,ue):N.copyTexSubImage2D(me,fe,Me,je,Se,Ne,_e,ue);b.bindFramebuffer(N.READ_FRAMEBUFFER,null),b.bindFramebuffer(N.DRAW_FRAMEBUFFER,null)}else nt?S.isDataTexture||S.isData3DTexture?N.texSubImage3D(me,fe,Me,je,gt,_e,ue,be,st,At,ct.data):L.isCompressedArrayTexture?N.compressedTexSubImage3D(me,fe,Me,je,gt,_e,ue,be,st,ct.data):N.texSubImage3D(me,fe,Me,je,gt,_e,ue,be,st,At,ct):S.isDataTexture?N.texSubImage2D(N.TEXTURE_2D,fe,Me,je,_e,ue,st,At,ct.data):S.isCompressedTexture?N.compressedTexSubImage2D(N.TEXTURE_2D,fe,Me,je,ct.width,ct.height,st,ct.data):N.texSubImage2D(N.TEXTURE_2D,fe,Me,je,_e,ue,st,At,ct);b.pixelStorei(N.UNPACK_ROW_LENGTH,Lt),b.pixelStorei(N.UNPACK_IMAGE_HEIGHT,Ye),b.pixelStorei(N.UNPACK_SKIP_PIXELS,Wt),b.pixelStorei(N.UNPACK_SKIP_ROWS,pn),b.pixelStorei(N.UNPACK_SKIP_IMAGES,On),fe===0&&L.generateMipmaps&&N.generateMipmap(me),b.unbindTexture()},this.initRenderTarget=function(S){X.get(S).__webglFramebuffer===void 0&&$.setupRenderTarget(S)},this.initTexture=function(S){S.isCubeTexture?$.setTextureCube(S,0):S.isData3DTexture?$.setTexture3D(S,0):S.isDataArrayTexture||S.isCompressedArrayTexture?$.setTexture2DArray(S,0):$.setTexture2D(S,0),b.unbindTexture()},this.resetState=function(){Y=0,B=0,W=null,b.reset(),pe.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Mn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=Be._getDrawingBufferColorSpace(e),t.unpackColorSpace=Be._getUnpackColorSpace()}}function wl(s,e){if(e===Dd)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),s;if(e===mo||e===ih){let t=s.getIndex();if(t===null){const r=[],a=s.getAttribute("position");if(a!==void 0){for(let o=0;o<a.count;o++)r.push(o);s.setIndex(r),t=s.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),s}const n=t.count-2,i=[];if(e===mo)for(let r=1;r<=n;r++)i.push(t.getX(0)),i.push(t.getX(r)),i.push(t.getX(r+1));else for(let r=0;r<n;r++)r%2===0?(i.push(t.getX(r)),i.push(t.getX(r+1)),i.push(t.getX(r+2))):(i.push(t.getX(r+2)),i.push(t.getX(r+1)),i.push(t.getX(r)));return i.length/3!==n&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles."),s.setIndex(i),s.clearGroups(),s}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",e),s}function L_(s){const e=new Map,t=new Map,n=s.clone();return Ph(s,n,function(i,r){e.set(r,i),t.set(i,r)}),n.traverse(function(i){if(!i.isSkinnedMesh)return;const r=i,a=e.get(i),o=a.skeleton.bones;r.skeleton=a.skeleton.clone(),r.bindMatrix.copy(a.bindMatrix),r.skeleton.bones=o.map(function(c){return t.get(c)}),r.bind(r.skeleton,r.bindMatrix)}),n}function Ph(s,e,t){t(s,e);for(let n=0;n<s.children.length;n++)Ph(s.children[n],e.children[n],t)}class D_ extends pi{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(t){return new O_(t)}),this.register(function(t){return new B_(t)}),this.register(function(t){return new K_(t)}),this.register(function(t){return new $_(t)}),this.register(function(t){return new Z_(t)}),this.register(function(t){return new G_(t)}),this.register(function(t){return new H_(t)}),this.register(function(t){return new V_(t)}),this.register(function(t){return new W_(t)}),this.register(function(t){return new k_(t)}),this.register(function(t){return new X_(t)}),this.register(function(t){return new z_(t)}),this.register(function(t){return new Y_(t)}),this.register(function(t){return new q_(t)}),this.register(function(t){return new N_(t)}),this.register(function(t){return new El(t,ze.EXT_MESHOPT_COMPRESSION)}),this.register(function(t){return new El(t,ze.KHR_MESHOPT_COMPRESSION)}),this.register(function(t){return new j_(t)})}load(e,t,n,i){const r=this;let a;if(this.resourcePath!=="")a=this.resourcePath;else if(this.path!==""){const l=Jn.extractUrlBase(e);a=Jn.resolveURL(l,this.path)}else a=Jn.extractUrlBase(e);this.manager.itemStart(e);const o=function(l){i?i(l):console.error(l),r.manager.itemError(e),r.manager.itemEnd(e)},c=new Pr(this.manager);c.setPath(this.path),c.setResponseType("arraybuffer"),c.setRequestHeader(this.requestHeader),c.setWithCredentials(this.withCredentials),c.load(e,function(l){try{r.parse(l,a,function(h){t(h),r.manager.itemEnd(e)},o)}catch(h){o(h)}},n,o)}setDRACOLoader(e){return this.dracoLoader=e,this}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,n,i){let r;const a={},o={},c=new TextDecoder;if(typeof e=="string")r=JSON.parse(e);else if(e instanceof ArrayBuffer)if(c.decode(new Uint8Array(e,0,4))===Ih){try{a[ze.KHR_BINARY_GLTF]=new J_(e)}catch(d){i&&i(d);return}r=JSON.parse(a[ze.KHR_BINARY_GLTF].content)}else r=JSON.parse(c.decode(e));else r=e;if(r.asset===void 0||r.asset.version[0]<2){i&&i(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}const l=new dv(r,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});l.fileLoader.setRequestHeader(this.requestHeader);for(let h=0;h<this.pluginCallbacks.length;h++){const d=this.pluginCallbacks[h](l);d.name||console.error("THREE.GLTFLoader: Invalid plugin found: missing name"),o[d.name]=d,a[d.name]=!0}if(r.extensionsUsed)for(let h=0;h<r.extensionsUsed.length;++h){const d=r.extensionsUsed[h],f=r.extensionsRequired||[];switch(d){case ze.KHR_MATERIALS_UNLIT:a[d]=new F_;break;case ze.KHR_DRACO_MESH_COMPRESSION:a[d]=new Q_(r,this.dracoLoader);break;case ze.KHR_TEXTURE_TRANSFORM:a[d]=new ev;break;case ze.KHR_MESH_QUANTIZATION:a[d]=new tv;break;default:f.indexOf(d)>=0&&o[d]===void 0&&console.warn('THREE.GLTFLoader: Unknown extension "'+d+'".')}}l.setExtensions(a),l.setPlugins(o),l.parse(n,i)}parseAsync(e,t){const n=this;return new Promise(function(i,r){n.parse(e,t,i,r)})}}function U_(){let s={};return{get:function(e){return s[e]},add:function(e,t){s[e]=t},remove:function(e){delete s[e]},removeAll:function(){s={}}}}function pt(s,e,t){const n=s.json.materials[e];return n.extensions&&n.extensions[t]?n.extensions[t]:null}const ze={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_DISPERSION:"KHR_materials_dispersion",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",KHR_MESHOPT_COMPRESSION:"KHR_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"};class N_{constructor(e){this.parser=e,this.name=ze.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){const e=this.parser,t=this.parser.json.nodes||[];for(let n=0,i=t.length;n<i;n++){const r=t[n];r.extensions&&r.extensions[this.name]&&r.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,r.extensions[this.name].light)}}_loadLight(e){const t=this.parser,n="light:"+e;let i=t.cache.get(n);if(i)return i;const r=t.json,c=((r.extensions&&r.extensions[this.name]||{}).lights||[])[e];let l;const h=new Ce(16777215);c.color!==void 0&&h.setRGB(c.color[0],c.color[1],c.color[2],Ot);const d=c.range!==void 0?c.range:0;switch(c.type){case"directional":l=new gr(h),l.target.position.set(0,0,-1),l.add(l.target);break;case"point":l=new gf(h),l.distance=d;break;case"spot":l=new pf(h),l.distance=d,c.spot=c.spot||{},c.spot.innerConeAngle=c.spot.innerConeAngle!==void 0?c.spot.innerConeAngle:0,c.spot.outerConeAngle=c.spot.outerConeAngle!==void 0?c.spot.outerConeAngle:Math.PI/4,l.angle=c.spot.outerConeAngle,l.penumbra=1-c.spot.innerConeAngle/c.spot.outerConeAngle,l.target.position.set(0,0,-1),l.add(l.target);break;default:throw new Error("THREE.GLTFLoader: Unexpected light type: "+c.type)}return l.position.set(0,0,0),_n(l,c),c.intensity!==void 0&&(l.intensity=c.intensity),l.name=t.createUniqueName(c.name||"light_"+e),i=Promise.resolve(l),t.cache.add(n,i),i}getDependency(e,t){if(e==="light")return this._loadLight(t)}createNodeAttachment(e){const t=this,n=this.parser,r=n.json.nodes[e],o=(r.extensions&&r.extensions[this.name]||{}).light;return o===void 0?null:this._loadLight(o).then(function(c){return n._getNodeRef(t.cache,o,c)})}}class F_{constructor(){this.name=ze.KHR_MATERIALS_UNLIT}getMaterialType(){return jn}extendParams(e,t,n){const i=[];e.color=new Ce(1,1,1),e.opacity=1;const r=t.pbrMetallicRoughness;if(r){if(Array.isArray(r.baseColorFactor)){const a=r.baseColorFactor;e.color.setRGB(a[0],a[1],a[2],Ot),e.opacity=a[3]}r.baseColorTexture!==void 0&&i.push(n.assignTexture(e,"map",r.baseColorTexture,ft))}return Promise.all(i)}}class k_{constructor(e){this.parser=e,this.name=ze.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){const n=pt(this.parser,e,this.name);return n===null||n.emissiveStrength!==void 0&&(t.emissiveIntensity=n.emissiveStrength),Promise.resolve()}}class O_{constructor(e){this.parser=e,this.name=ze.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){return pt(this.parser,e,this.name)!==null?Tn:null}extendMaterialParams(e,t){const n=pt(this.parser,e,this.name);if(n===null)return Promise.resolve();const i=[];if(n.clearcoatFactor!==void 0&&(t.clearcoat=n.clearcoatFactor),n.clearcoatTexture!==void 0&&i.push(this.parser.assignTexture(t,"clearcoatMap",n.clearcoatTexture)),n.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=n.clearcoatRoughnessFactor),n.clearcoatRoughnessTexture!==void 0&&i.push(this.parser.assignTexture(t,"clearcoatRoughnessMap",n.clearcoatRoughnessTexture)),n.clearcoatNormalTexture!==void 0&&(i.push(this.parser.assignTexture(t,"clearcoatNormalMap",n.clearcoatNormalTexture)),n.clearcoatNormalTexture.scale!==void 0)){const r=n.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new ke(r,r)}return Promise.all(i)}}class B_{constructor(e){this.parser=e,this.name=ze.KHR_MATERIALS_DISPERSION}getMaterialType(e){return pt(this.parser,e,this.name)!==null?Tn:null}extendMaterialParams(e,t){const n=pt(this.parser,e,this.name);return n===null||(t.dispersion=n.dispersion!==void 0?n.dispersion:0),Promise.resolve()}}class z_{constructor(e){this.parser=e,this.name=ze.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){return pt(this.parser,e,this.name)!==null?Tn:null}extendMaterialParams(e,t){const n=pt(this.parser,e,this.name);if(n===null)return Promise.resolve();const i=[];return n.iridescenceFactor!==void 0&&(t.iridescence=n.iridescenceFactor),n.iridescenceTexture!==void 0&&i.push(this.parser.assignTexture(t,"iridescenceMap",n.iridescenceTexture)),n.iridescenceIor!==void 0&&(t.iridescenceIOR=n.iridescenceIor),t.iridescenceThicknessRange===void 0&&(t.iridescenceThicknessRange=[100,400]),n.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessRange[0]=n.iridescenceThicknessMinimum),n.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessRange[1]=n.iridescenceThicknessMaximum),n.iridescenceThicknessTexture!==void 0&&i.push(this.parser.assignTexture(t,"iridescenceThicknessMap",n.iridescenceThicknessTexture)),Promise.all(i)}}class G_{constructor(e){this.parser=e,this.name=ze.KHR_MATERIALS_SHEEN}getMaterialType(e){return pt(this.parser,e,this.name)!==null?Tn:null}extendMaterialParams(e,t){const n=pt(this.parser,e,this.name);if(n===null)return Promise.resolve();const i=[];if(t.sheenColor=new Ce(0,0,0),t.sheenRoughness=0,t.sheen=1,n.sheenColorFactor!==void 0){const r=n.sheenColorFactor;t.sheenColor.setRGB(r[0],r[1],r[2],Ot)}return n.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=n.sheenRoughnessFactor),n.sheenColorTexture!==void 0&&i.push(this.parser.assignTexture(t,"sheenColorMap",n.sheenColorTexture,ft)),n.sheenRoughnessTexture!==void 0&&i.push(this.parser.assignTexture(t,"sheenRoughnessMap",n.sheenRoughnessTexture)),Promise.all(i)}}class H_{constructor(e){this.parser=e,this.name=ze.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){return pt(this.parser,e,this.name)!==null?Tn:null}extendMaterialParams(e,t){const n=pt(this.parser,e,this.name);if(n===null)return Promise.resolve();const i=[];return n.transmissionFactor!==void 0&&(t.transmission=n.transmissionFactor),n.transmissionTexture!==void 0&&i.push(this.parser.assignTexture(t,"transmissionMap",n.transmissionTexture)),Promise.all(i)}}class V_{constructor(e){this.parser=e,this.name=ze.KHR_MATERIALS_VOLUME}getMaterialType(e){return pt(this.parser,e,this.name)!==null?Tn:null}extendMaterialParams(e,t){const n=pt(this.parser,e,this.name);if(n===null)return Promise.resolve();const i=[];t.thickness=n.thicknessFactor!==void 0?n.thicknessFactor:0,n.thicknessTexture!==void 0&&i.push(this.parser.assignTexture(t,"thicknessMap",n.thicknessTexture)),t.attenuationDistance=n.attenuationDistance||1/0;const r=n.attenuationColor||[1,1,1];return t.attenuationColor=new Ce().setRGB(r[0],r[1],r[2],Ot),Promise.all(i)}}class W_{constructor(e){this.parser=e,this.name=ze.KHR_MATERIALS_IOR}getMaterialType(e){return pt(this.parser,e,this.name)!==null?Tn:null}extendMaterialParams(e,t){const n=pt(this.parser,e,this.name);return n===null||(t.ior=n.ior!==void 0?n.ior:1.5,t.ior===0&&(t.ior=1e3)),Promise.resolve()}}class X_{constructor(e){this.parser=e,this.name=ze.KHR_MATERIALS_SPECULAR}getMaterialType(e){return pt(this.parser,e,this.name)!==null?Tn:null}extendMaterialParams(e,t){const n=pt(this.parser,e,this.name);if(n===null)return Promise.resolve();const i=[];t.specularIntensity=n.specularFactor!==void 0?n.specularFactor:1,n.specularTexture!==void 0&&i.push(this.parser.assignTexture(t,"specularIntensityMap",n.specularTexture));const r=n.specularColorFactor||[1,1,1];return t.specularColor=new Ce().setRGB(r[0],r[1],r[2],Ot),n.specularColorTexture!==void 0&&i.push(this.parser.assignTexture(t,"specularColorMap",n.specularColorTexture,ft)),Promise.all(i)}}class q_{constructor(e){this.parser=e,this.name=ze.EXT_MATERIALS_BUMP}getMaterialType(e){return pt(this.parser,e,this.name)!==null?Tn:null}extendMaterialParams(e,t){const n=pt(this.parser,e,this.name);if(n===null)return Promise.resolve();const i=[];return t.bumpScale=n.bumpFactor!==void 0?n.bumpFactor:1,n.bumpTexture!==void 0&&i.push(this.parser.assignTexture(t,"bumpMap",n.bumpTexture)),Promise.all(i)}}class Y_{constructor(e){this.parser=e,this.name=ze.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){return pt(this.parser,e,this.name)!==null?Tn:null}extendMaterialParams(e,t){const n=pt(this.parser,e,this.name);if(n===null)return Promise.resolve();const i=[];return n.anisotropyStrength!==void 0&&(t.anisotropy=n.anisotropyStrength),n.anisotropyRotation!==void 0&&(t.anisotropyRotation=n.anisotropyRotation),n.anisotropyTexture!==void 0&&i.push(this.parser.assignTexture(t,"anisotropyMap",n.anisotropyTexture)),Promise.all(i)}}class K_{constructor(e){this.parser=e,this.name=ze.KHR_TEXTURE_BASISU}loadTexture(e){const t=this.parser,n=t.json,i=n.textures[e];if(!i.extensions||!i.extensions[this.name])return null;const r=i.extensions[this.name],a=t.options.ktx2Loader;if(!a){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return null}return t.loadTextureImage(e,r.source,a)}}class $_{constructor(e){this.parser=e,this.name=ze.EXT_TEXTURE_WEBP}loadTexture(e){const t=this.name,n=this.parser,i=n.json,r=i.textures[e];if(!r.extensions||!r.extensions[t])return null;const a=r.extensions[t],o=i.images[a.source];let c=n.textureLoader;if(o.uri){const l=n.options.manager.getHandler(o.uri);l!==null&&(c=l)}return n.loadTextureImage(e,a.source,c)}}class Z_{constructor(e){this.parser=e,this.name=ze.EXT_TEXTURE_AVIF}loadTexture(e){const t=this.name,n=this.parser,i=n.json,r=i.textures[e];if(!r.extensions||!r.extensions[t])return null;const a=r.extensions[t],o=i.images[a.source];let c=n.textureLoader;if(o.uri){const l=n.options.manager.getHandler(o.uri);l!==null&&(c=l)}return n.loadTextureImage(e,a.source,c)}}class El{constructor(e,t){this.name=t,this.parser=e}loadBufferView(e){const t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){const i=n.extensions[this.name],r=this.parser.getDependency("buffer",i.buffer),a=this.parser.options.meshoptDecoder;if(!a||!a.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return null}return r.then(function(o){const c=i.byteOffset||0,l=i.byteLength||0,h=i.count,d=i.byteStride,f=new Uint8Array(o,c,l);return a.decodeGltfBufferAsync?a.decodeGltfBufferAsync(h,d,f,i.mode,i.filter).then(function(u){return u.buffer}):a.ready.then(function(){const u=new ArrayBuffer(h*d);return a.decodeGltfBuffer(new Uint8Array(u),h,d,f,i.mode,i.filter),u})})}else return null}}class j_{constructor(e){this.name=ze.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){const t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;const i=t.meshes[n.mesh];for(const l of i.primitives)if(l.mode!==qt.TRIANGLES&&l.mode!==qt.TRIANGLE_STRIP&&l.mode!==qt.TRIANGLE_FAN&&l.mode!==void 0)return null;const a=n.extensions[this.name].attributes,o=[],c={};for(const l in a)o.push(this.parser.getDependency("accessor",a[l]).then(h=>(c[l]=h,c[l])));return o.length<1?null:(o.push(this.parser.createNodeMesh(e)),Promise.all(o).then(l=>{const h=l.pop(),d=h.isGroup?h.children:[h],f=l[0].count,u=[];for(const g of d){const v=new Ue,p=new k,m=new jt,T=new k(1,1,1),A=new Fu(g.geometry,g.material,f);for(let M=0;M<f;M++)c.TRANSLATION&&p.fromBufferAttribute(c.TRANSLATION,M),c.ROTATION&&m.fromBufferAttribute(c.ROTATION,M),c.SCALE&&T.fromBufferAttribute(c.SCALE,M),A.setMatrixAt(M,v.compose(p,m,T));let x=null;for(const M in c)if(M==="_COLOR_0"){const y=c[M];A.instanceColor=new Tr(y.array,y.itemSize,y.normalized)}else if(M!=="TRANSLATION"&&M!=="ROTATION"&&M!=="SCALE"){if(x===null){const w=A.geometry;x=new Bt,x.name=w.name;for(const _ in w.attributes)x.setAttribute(_,w.attributes[_]);for(const _ in w.morphAttributes)x.morphAttributes[_]=w.morphAttributes[_];w.index!==null&&x.setIndex(w.index),x.morphTargetsRelative=w.morphTargetsRelative;for(const _ of w.groups)x.addGroup(_.start,_.count,_.materialIndex);w.boundingBox!==null&&(x.boundingBox=w.boundingBox.clone()),w.boundingSphere!==null&&(x.boundingSphere=w.boundingSphere.clone()),x.drawRange.start=w.drawRange.start,x.drawRange.count=w.drawRange.count,x.userData=Object.assign({},w.userData),A.geometry=x}const y=c[M];x.setAttribute(M,new Tr(y.array,y.itemSize,y.normalized))}ht.prototype.copy.call(A,g),this.parser.assignFinalMaterial(A),u.push(A)}return h.isGroup?(h.clear(),h.add(...u),h):u[0]}))}}const Ih="glTF",cs=12,Tl={JSON:1313821514,BIN:5130562};class J_{constructor(e){this.name=ze.KHR_BINARY_GLTF,this.content=null,this.body=null;const t=new DataView(e,0,cs),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==Ih)throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw new Error("THREE.GLTFLoader: Legacy binary file detected.");const i=this.header.length-cs,r=new DataView(e,cs);let a=0;for(;a<i;){const o=r.getUint32(a,!0);a+=4;const c=r.getUint32(a,!0);if(a+=4,c===Tl.JSON){const l=new Uint8Array(e,cs+a,o);this.content=n.decode(l)}else if(c===Tl.BIN){const l=cs+a;this.body=e.slice(l,l+o)}a+=o}if(this.content===null)throw new Error("THREE.GLTFLoader: JSON content not found.")}}class Q_{constructor(e,t){if(!t)throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=ze.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){const n=this.json,i=this.dracoLoader,r=e.extensions[this.name].bufferView,a=e.extensions[this.name].attributes,o={},c={},l={};for(const h in a){const d=bo[h]||h.toLowerCase();o[d]=a[h]}for(const h in e.attributes){const d=bo[h]||h.toLowerCase();if(a[h]!==void 0){const f=n.accessors[e.attributes[h]],u=Gi[f.componentType];l[d]=u.name,c[d]=f.normalized===!0}}return t.getDependency("bufferView",r).then(function(h){return new Promise(function(d,f){i.decodeDracoFile(h,function(u){for(const g in u.attributes){const v=u.attributes[g],p=c[g];p!==void 0&&(v.normalized=p)}d(u)},o,l,Ot,f)})})}}class ev{constructor(){this.name=ze.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){if((t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0)return e;if(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),t.rotation!==void 0){const n=Math.cos(e.rotation),i=Math.sin(e.rotation);e.matrix.set(e.repeat.x*n,e.repeat.y*i,e.offset.x,-e.repeat.x*i,e.repeat.y*n,e.offset.y,0,0,1),e.matrixAutoUpdate=!1}return e.needsUpdate=!0,e}}class tv{constructor(){this.name=ze.KHR_MESH_QUANTIZATION}}class Lh extends qi{constructor(e,t,n,i){super(e,t,n,i)}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,r=e*i*3+i;for(let a=0;a!==i;a++)t[a]=n[r+a];return t}interpolate_(e,t,n,i){const r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=o*2,l=o*3,h=i-t,d=(n-t)/h,f=d*d,u=f*d,g=e*l,v=g-l,p=-2*u+3*f,m=u-f,T=1-p,A=m-f+d;for(let x=0;x!==o;x++){const M=a[v+x+o],y=a[v+x+c]*h,w=a[g+x+o],_=a[g+x]*h;r[x]=T*M+A*y+p*w+m*_}return r}}const nv=new jt;class iv extends Lh{interpolate_(e,t,n,i){const r=super.interpolate_(e,t,n,i);return nv.fromArray(r).normalize().toArray(r),r}}const qt={POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6},Gi={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},Al={9728:vt,9729:bt,9984:$l,9985:lr,9986:ds,9987:Dn},Rl={33071:bn,33648:br,10497:Vi},Aa={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},bo={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},Yn={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},sv={CUBICSPLINE:void 0,LINEAR:bs,STEP:xs},Ra={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function rv(s){return s.DefaultMaterial===void 0&&(s.DefaultMaterial=new Bo({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:Qn})),s.DefaultMaterial}function li(s,e,t){for(const n in t.extensions)s[n]===void 0&&(e.userData.gltfExtensions=e.userData.gltfExtensions||{},e.userData.gltfExtensions[n]=t.extensions[n])}function _n(s,e){e.extras!==void 0&&(typeof e.extras=="object"?Object.assign(s.userData,e.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+e.extras))}function av(s,e,t){let n=!1,i=!1,r=!1;for(let l=0,h=e.length;l<h;l++){const d=e[l];if(d.POSITION!==void 0&&(n=!0),d.NORMAL!==void 0&&(i=!0),d.COLOR_0!==void 0&&(r=!0),n&&i&&r)break}if(!n&&!i&&!r)return Promise.resolve(s);const a=[],o=[],c=[];for(let l=0,h=e.length;l<h;l++){const d=e[l];if(n){const f=d.POSITION!==void 0?t.getDependency("accessor",d.POSITION):s.attributes.position;a.push(f)}if(i){const f=d.NORMAL!==void 0?t.getDependency("accessor",d.NORMAL):s.attributes.normal;o.push(f)}if(r){const f=d.COLOR_0!==void 0?t.getDependency("accessor",d.COLOR_0):s.attributes.color;c.push(f)}}return Promise.all([Promise.all(a),Promise.all(o),Promise.all(c)]).then(function(l){const h=l[0],d=l[1],f=l[2];return n&&(s.morphAttributes.position=h),i&&(s.morphAttributes.normal=d),r&&(s.morphAttributes.color=f),s.morphTargetsRelative=!0,s})}function ov(s,e){if(s.updateMorphTargets(),e.weights!==void 0)for(let t=0,n=e.weights.length;t<n;t++)s.morphTargetInfluences[t]=e.weights[t];if(e.extras&&Array.isArray(e.extras.targetNames)){const t=e.extras.targetNames;if(s.morphTargetInfluences.length===t.length){s.morphTargetDictionary={};for(let n=0,i=t.length;n<i;n++)s.morphTargetDictionary[t[n]]=n}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function cv(s){let e;const t=s.extensions&&s.extensions[ze.KHR_DRACO_MESH_COMPRESSION];if(t?e="draco:"+t.bufferView+":"+t.indices+":"+Ca(t.attributes):e=s.indices+":"+Ca(s.attributes)+":"+s.mode,s.targets!==void 0)for(let n=0,i=s.targets.length;n<i;n++)e+=":"+Ca(s.targets[n]);return e}function Ca(s){let e="";const t=Object.keys(s).sort();for(let n=0,i=t.length;n<i;n++)e+=t[n]+":"+s[t[n]]+";";return e}function Mo(s){switch(s){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function lv(s){return s.search(/\.jpe?g($|\?)/i)>0||s.search(/^data\:image\/jpeg/)===0?"image/jpeg":s.search(/\.webp($|\?)/i)>0||s.search(/^data\:image\/webp/)===0?"image/webp":s.search(/\.ktx2($|\?)/i)>0||s.search(/^data\:image\/ktx2/)===0?"image/ktx2":"image/png"}const hv=new Ue;class dv{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new U_,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,i=-1,r=!1,a=-1;if(typeof navigator<"u"&&typeof navigator.userAgent<"u"){const o=navigator.userAgent;n=/^((?!chrome|android).)*safari/i.test(o)===!0;const c=o.match(/Version\/(\d+)/);i=n&&c?parseInt(c[1],10):-1,r=o.indexOf("Firefox")>-1,a=r?o.match(/Firefox\/([0-9]+)\./)[1]:-1}typeof createImageBitmap>"u"||n&&i<17||r&&a<98?this.textureLoader=new df(this.options.manager):this.textureLoader=new vf(this.options.manager),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new Pr(this.options.manager),this.fileLoader.setResponseType("arraybuffer"),this.options.crossOrigin==="use-credentials"&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){const n=this,i=this.json,r=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(a){return a._markDefs&&a._markDefs()}),Promise.all(this._invokeAll(function(a){return a.beforeRoot&&a.beforeRoot()})).then(function(){return Promise.all([n.getDependencies("scene"),n.getDependencies("animation"),n.getDependencies("camera")])}).then(function(a){const o={scene:a[0][i.scene||0],scenes:a[0],animations:a[1],cameras:a[2],asset:i.asset,parser:n,userData:{}};return li(r,o,i),_n(o,i),Promise.all(n._invokeAll(function(c){return c.afterRoot&&c.afterRoot(o)})).then(function(){for(const c of o.scenes)c.updateMatrixWorld();e(o)})}).catch(t)}_markDefs(){const e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let i=0,r=t.length;i<r;i++){const a=t[i].joints;for(let o=0,c=a.length;o<c;o++)e[a[o]].isBone=!0}for(let i=0,r=e.length;i<r;i++){const a=e[i];a.mesh!==void 0&&(this._addNodeRef(this.meshCache,a.mesh),a.skin!==void 0&&(n[a.mesh].isSkinnedMesh=!0)),a.camera!==void 0&&this._addNodeRef(this.cameraCache,a.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;const i=n.clone(),r=(a,o)=>{const c=this.associations.get(a);c!=null&&this.associations.set(o,c);for(const[l,h]of a.children.entries())r(h,o.children[l])};return r(n,i),i.name+="_instance_"+e.uses[t]++,i}_invokeOne(e){const t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){const i=e(t[n]);if(i)return i}return null}_invokeAll(e){const t=Object.values(this.plugins);t.unshift(this);const n=[];for(let i=0;i<t.length;i++){const r=e(t[i]);r&&n.push(r)}return n}getDependency(e,t){const n=e+":"+t;let i=this.cache.get(n);if(!i){switch(e){case"scene":i=this.loadScene(t);break;case"node":i=this._invokeOne(function(r){return r.loadNode&&r.loadNode(t)});break;case"mesh":i=this._invokeOne(function(r){return r.loadMesh&&r.loadMesh(t)});break;case"accessor":i=this.loadAccessor(t);break;case"bufferView":i=this._invokeOne(function(r){return r.loadBufferView&&r.loadBufferView(t)});break;case"buffer":i=this.loadBuffer(t);break;case"material":i=this._invokeOne(function(r){return r.loadMaterial&&r.loadMaterial(t)});break;case"texture":i=this._invokeOne(function(r){return r.loadTexture&&r.loadTexture(t)});break;case"skin":i=this.loadSkin(t);break;case"animation":i=this._invokeOne(function(r){return r.loadAnimation&&r.loadAnimation(t)});break;case"camera":i=this.loadCamera(t);break;default:if(i=this._invokeOne(function(r){return r!=this&&r.getDependency&&r.getDependency(e,t)}),!i)throw new Error("Unknown type: "+e);break}this.cache.add(n,i)}return i}getDependencies(e){let t=this.cache.get(e);if(!t){const n=this,i=this.json[e+(e==="mesh"?"es":"s")]||[];t=Promise.all(i.map(function(r,a){return n.getDependency(e,a)})),this.cache.add(e,t)}return t}loadBuffer(e){const t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!=="arraybuffer")throw new Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[ze.KHR_BINARY_GLTF].body);const i=this.options;return new Promise(function(r,a){n.load(Jn.resolveURL(t.uri,i.path),r,void 0,function(){a(new Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){const t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(n){const i=t.byteLength||0,r=t.byteOffset||0;return n.slice(r,r+i)})}loadAccessor(e){const t=this,n=this.json,i=this.json.accessors[e];if(i.bufferView===void 0&&i.sparse===void 0){const a=Aa[i.type],o=Gi[i.componentType],c=i.normalized===!0,l=new o(i.count*a);return Promise.resolve(new Pt(l,a,c))}const r=[];return i.bufferView!==void 0?r.push(this.getDependency("bufferView",i.bufferView)):r.push(null),i.sparse!==void 0&&(r.push(this.getDependency("bufferView",i.sparse.indices.bufferView)),r.push(this.getDependency("bufferView",i.sparse.values.bufferView))),Promise.all(r).then(function(a){const o=a[0],c=Aa[i.type],l=Gi[i.componentType],h=l.BYTES_PER_ELEMENT,d=h*c,f=i.byteOffset||0,u=i.bufferView!==void 0?n.bufferViews[i.bufferView].byteStride:void 0,g=i.normalized===!0;let v,p;if(u&&u!==d){const m=Math.floor(f/u),T="InterleavedBuffer:"+i.bufferView+":"+i.componentType+":"+m+":"+i.count;let A=t.cache.get(T);A||(v=new l(o,m*u,i.count*u/h),A=new dh(v,u/h),t.cache.add(T,A)),p=new Nr(A,c,f%u/h,g)}else o===null?v=new l(i.count*c):v=new l(o,f,i.count*c),p=new Pt(v,c,g);if(i.sparse!==void 0){const m=Aa.SCALAR,T=Gi[i.sparse.indices.componentType],A=i.sparse.indices.byteOffset||0,x=i.sparse.values.byteOffset||0,M=new T(a[1],A,i.sparse.count*m),y=new l(a[2],x,i.sparse.count*c);o!==null&&(p=new Pt(p.array.slice(),p.itemSize,p.normalized)),p.normalized=!1;for(let w=0,_=M.length;w<_;w++){const E=M[w];if(p.setX(E,y[w*c]),c>=2&&p.setY(E,y[w*c+1]),c>=3&&p.setZ(E,y[w*c+2]),c>=4&&p.setW(E,y[w*c+3]),c>=5)throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}p.normalized=g}return p})}loadTexture(e){const t=this.json,n=this.options,r=t.textures[e].source,a=t.images[r];let o=this.textureLoader;if(a.uri){const c=n.manager.getHandler(a.uri);c!==null&&(o=c)}return this.loadTextureImage(e,r,o)}loadTextureImage(e,t,n){const i=this,r=this.json,a=r.textures[e],o=r.images[t],c=(o.uri||o.bufferView)+":"+a.sampler;if(this.textureCache[c])return this.textureCache[c];const l=this.loadImageSource(t,n).then(function(h){h.flipY=!1,h.name=a.name||o.name||"",h.name===""&&typeof o.uri=="string"&&o.uri.startsWith("data:image/")===!1&&(h.name=o.uri);const f=(r.samplers||{})[a.sampler]||{};return h.magFilter=Al[f.magFilter]||bt,h.minFilter=Al[f.minFilter]||Dn,h.wrapS=Rl[f.wrapS]||Vi,h.wrapT=Rl[f.wrapT]||Vi,h.generateMipmaps=!h.isCompressedTexture&&h.minFilter!==vt&&h.minFilter!==bt,i.associations.set(h,{textures:e}),h}).catch(function(){return null});return this.textureCache[c]=l,l}loadImageSource(e,t){const n=this,i=this.json,r=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(d=>d.clone());const a=i.images[e],o=self.URL||self.webkitURL;let c=a.uri||"",l=!1;if(a.bufferView!==void 0)c=n.getDependency("bufferView",a.bufferView).then(function(d){l=!0;const f=new Blob([d],{type:a.mimeType});return c=o.createObjectURL(f),c});else if(a.uri===void 0)throw new Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");const h=Promise.resolve(c).then(function(d){return new Promise(function(f,u){let g=f;t.isImageBitmapLoader===!0&&(g=function(v){const p=new Et(v);p.needsUpdate=!0,f(p)}),t.load(Jn.resolveURL(d,r.path),g,void 0,u)})}).then(function(d){return l===!0&&o.revokeObjectURL(c),_n(d,a),d.userData.mimeType=a.mimeType||lv(a.uri),d}).catch(function(d){throw console.error("THREE.GLTFLoader: Couldn't load texture",c),d});return this.sourceCache[e]=h,h}assignTexture(e,t,n,i){const r=this;return this.getDependency("texture",n.index).then(function(a){if(!a)return null;if(n.texCoord!==void 0&&n.texCoord>0&&(a=a.clone(),a.channel=n.texCoord),r.extensions[ze.KHR_TEXTURE_TRANSFORM]){const o=n.extensions!==void 0?n.extensions[ze.KHR_TEXTURE_TRANSFORM]:void 0;if(o){const c=r.associations.get(a);a=r.extensions[ze.KHR_TEXTURE_TRANSFORM].extendTexture(a,o),r.associations.set(a,c)}}return i!==void 0&&(a.colorSpace=i),e[t]=a,a})}assignFinalMaterial(e){const t=e.geometry;let n=e.material;const i=t.attributes.tangent===void 0,r=t.attributes.color!==void 0,a=t.attributes.normal===void 0;if(e.isPoints){const o="PointsMaterial:"+n.uuid;let c=this.cache.get(o);c||(c=new ph,hn.prototype.copy.call(c,n),c.color.copy(n.color),c.map=n.map,c.sizeAttenuation=!1,this.cache.add(o,c)),n=c}else if(e.isLine){const o="LineBasicMaterial:"+n.uuid;let c=this.cache.get(o);c||(c=new fh,hn.prototype.copy.call(c,n),c.color.copy(n.color),c.map=n.map,this.cache.add(o,c)),n=c}if(i||r||a){let o="ClonedMaterial:"+n.uuid+":";i&&(o+="derivative-tangents:"),r&&(o+="vertex-colors:"),a&&(o+="flat-shading:");let c=this.cache.get(o);c||(c=n.clone(),r&&(c.vertexColors=!0),a&&(c.flatShading=!0),i&&(c.normalScale&&(c.normalScale.y*=-1),c.clearcoatNormalScale&&(c.clearcoatNormalScale.y*=-1)),this.cache.add(o,c),this.associations.set(c,this.associations.get(n))),n=c}e.material=n}getMaterialType(){return Bo}loadMaterial(e){const t=this,n=this.json,i=this.extensions,r=n.materials[e];let a;const o={},c=r.extensions||{},l=[];if(c[ze.KHR_MATERIALS_UNLIT]){const d=i[ze.KHR_MATERIALS_UNLIT];a=d.getMaterialType(),l.push(d.extendParams(o,r,t))}else{const d=r.pbrMetallicRoughness||{};if(o.color=new Ce(1,1,1),o.opacity=1,Array.isArray(d.baseColorFactor)){const f=d.baseColorFactor;o.color.setRGB(f[0],f[1],f[2],Ot),o.opacity=f[3]}d.baseColorTexture!==void 0&&l.push(t.assignTexture(o,"map",d.baseColorTexture,ft)),o.metalness=d.metallicFactor!==void 0?d.metallicFactor:1,o.roughness=d.roughnessFactor!==void 0?d.roughnessFactor:1,d.metallicRoughnessTexture!==void 0&&(l.push(t.assignTexture(o,"metalnessMap",d.metallicRoughnessTexture)),l.push(t.assignTexture(o,"roughnessMap",d.metallicRoughnessTexture))),a=this._invokeOne(function(f){return f.getMaterialType&&f.getMaterialType(e)}),l.push(Promise.all(this._invokeAll(function(f){return f.extendMaterialParams&&f.extendMaterialParams(e,o)})))}r.doubleSided===!0&&(o.side=xn);const h=r.alphaMode||Ra.OPAQUE;if(h===Ra.BLEND?(o.transparent=!0,o.depthWrite=!1):(o.transparent=!1,h===Ra.MASK&&(o.alphaTest=r.alphaCutoff!==void 0?r.alphaCutoff:.5)),r.normalTexture!==void 0&&a!==jn&&(l.push(t.assignTexture(o,"normalMap",r.normalTexture)),o.normalScale=new ke(1,1),r.normalTexture.scale!==void 0)){const d=r.normalTexture.scale;o.normalScale.set(d,d)}if(r.occlusionTexture!==void 0&&a!==jn&&(l.push(t.assignTexture(o,"aoMap",r.occlusionTexture)),r.occlusionTexture.strength!==void 0&&(o.aoMapIntensity=r.occlusionTexture.strength)),r.emissiveFactor!==void 0&&a!==jn){const d=r.emissiveFactor;o.emissive=new Ce().setRGB(d[0],d[1],d[2],Ot)}return r.emissiveTexture!==void 0&&a!==jn&&l.push(t.assignTexture(o,"emissiveMap",r.emissiveTexture,ft)),Promise.all(l).then(function(){const d=new a(o);return r.name&&(d.name=r.name),_n(d,r),t.associations.set(d,{materials:e}),r.extensions&&li(i,d,r),d})}createUniqueName(e){const t=Je.sanitizeNodeName(e||"");return t in this.nodeNamesUsed?t+"_"+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){const t=this,n=this.extensions,i=this.primitiveCache;function r(o){return n[ze.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(o,t).then(function(c){return Cl(c,o,t)})}const a=[];for(let o=0,c=e.length;o<c;o++){const l=e[o],h=cv(l),d=i[h];if(d)a.push(d.promise);else{let f;l.extensions&&l.extensions[ze.KHR_DRACO_MESH_COMPRESSION]?f=r(l):f=Cl(new Bt,l,t),l.mode===qt.TRIANGLE_STRIP?f=f.then(u=>wl(u,ih)):l.mode===qt.TRIANGLE_FAN&&(f=f.then(u=>wl(u,mo))),i[h]={primitive:l,promise:f},a.push(f)}}return Promise.all(a)}loadMesh(e){const t=this,n=this.json,i=this.extensions,r=n.meshes[e],a=r.primitives,o=[];for(let c=0,l=a.length;c<l;c++){const h=a[c].material===void 0?rv(this.cache):this.getDependency("material",a[c].material);o.push(h)}return o.push(t.loadGeometries(a)),Promise.all(o).then(async function(c){const l=c.slice(0,c.length-1),h=c[c.length-1],d=[];for(let u=0,g=h.length;u<g;u++){const v=h[u],p=a[u];let m;const T=l[u];if(p.mode===qt.TRIANGLES||p.mode===qt.TRIANGLE_STRIP||p.mode===qt.TRIANGLE_FAN||p.mode===void 0){const A=r.isSkinnedMesh===!0,x=v.hasAttribute("skinIndex")&&v.hasAttribute("skinWeight");A&&x===!1&&console.warn("THREE.GLTFLoader: Missing skinIndex or skinWeight attributes. Skinning disabled."),m=A&&x?new Du(v,T):new It(v,T),m.isSkinnedMesh===!0&&m.normalizeSkinWeights()}else if(p.mode===qt.LINES)m=new Ou(v,T);else if(p.mode===qt.LINE_STRIP)m=new Oo(v,T);else if(p.mode===qt.LINE_LOOP)m=new Bu(v,T);else if(p.mode===qt.POINTS)m=new zu(v,T);else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: "+p.mode);Object.keys(m.geometry.morphAttributes).length>0&&ov(m,r),m.name=t.createUniqueName(r.name||"mesh_"+e),_n(m,r),p.extensions&&li(i,m,p),t.assignFinalMaterial(m),d.push(m)}for(let u=0,g=d.length;u<g;u++)t.associations.set(d[u],{meshes:e,primitives:u});if(d.length===1)return r.extensions&&li(i,d[0],r),d[0];const f=new di;r.extensions&&li(i,f,r),t.associations.set(f,{meshes:e});for(let u=0,g=d.length;u<g;u++)f.add(d[u]);return f})}loadCamera(e){let t;const n=this.json.cameras[e],i=n[n.type];if(!i){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}return n.type==="perspective"?t=new kt(hu.radToDeg(i.yfov),i.aspectRatio||1,i.znear||1,i.zfar||2e6):n.type==="orthographic"&&(t=new Rs(-i.xmag,i.xmag,i.ymag,-i.ymag,i.znear,i.zfar)),n.name&&(t.name=this.createUniqueName(n.name)),_n(t,n),Promise.resolve(t)}loadSkin(e){const t=this.json.skins[e],n=[];for(let i=0,r=t.joints.length;i<r;i++)n.push(this._loadNodeShallow(t.joints[i]));return t.inverseBindMatrices!==void 0?n.push(this.getDependency("accessor",t.inverseBindMatrices)):n.push(null),Promise.all(n).then(function(i){const r=i.pop(),a=i,o=[],c=[];for(let l=0,h=a.length;l<h;l++){const d=a[l];if(d){o.push(d);const f=new Ue;r!==null&&f.fromArray(r.array,l*16),c.push(f)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[l])}return new Fo(o,c)})}loadAnimation(e){const t=this.json,n=this,i=t.animations[e],r=i.name?i.name:"animation_"+e,a=[],o=[],c=[],l=[],h=[];for(let d=0,f=i.channels.length;d<f;d++){const u=i.channels[d],g=i.samplers[u.sampler],v=u.target,p=v.node,m=i.parameters!==void 0?i.parameters[g.input]:g.input,T=i.parameters!==void 0?i.parameters[g.output]:g.output;v.node!==void 0&&(a.push(this.getDependency("node",p)),o.push(this.getDependency("accessor",m)),c.push(this.getDependency("accessor",T)),l.push(g),h.push(v))}return Promise.all([Promise.all(a),Promise.all(o),Promise.all(c),Promise.all(l),Promise.all(h)]).then(function(d){const f=d[0],u=d[1],g=d[2],v=d[3],p=d[4],m=[];for(let A=0,x=f.length;A<x;A++){const M=f[A],y=u[A],w=g[A],_=v[A],E=p[A];if(M===void 0)continue;M.updateMatrix&&M.updateMatrix();const C=n._createAnimationTracks(M,y,w,_,E);if(C)for(let P=0;P<C.length;P++)m.push(C[P])}const T=new _o(r,void 0,m);return _n(T,i),T})}createNodeMesh(e){const t=this.json,n=this,i=t.nodes[e];return i.mesh===void 0?null:n.getDependency("mesh",i.mesh).then(function(r){const a=n._getNodeRef(n.meshCache,i.mesh,r);return i.weights!==void 0&&a.traverse(function(o){if(o.isMesh)for(let c=0,l=i.weights.length;c<l;c++)o.morphTargetInfluences[c]=i.weights[c]}),a})}loadNode(e){const t=this.json,n=this,i=t.nodes[e],r=n._loadNodeShallow(e),a=[],o=i.children||[];for(let l=0,h=o.length;l<h;l++)a.push(n.getDependency("node",o[l]));const c=i.skin===void 0?Promise.resolve(null):n.getDependency("skin",i.skin);return Promise.all([r,Promise.all(a),c]).then(function(l){const h=l[0],d=l[1],f=l[2];f!==null&&h.traverse(function(u){u.isSkinnedMesh&&u.bind(f,hv)});for(let u=0,g=d.length;u<g;u++)h.add(d[u]);if(h.userData.pivot!==void 0&&d.length>0){const u=h.userData.pivot,g=d[0];h.pivot=new k().fromArray(u),h.position.x-=u[0],h.position.y-=u[1],h.position.z-=u[2],g.position.set(0,0,0),delete h.userData.pivot}return h})}_loadNodeShallow(e){const t=this.json,n=this.extensions,i=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];const r=t.nodes[e],a=r.name?i.createUniqueName(r.name):"",o=[],c=i._invokeOne(function(l){return l.createNodeMesh&&l.createNodeMesh(e)});return c&&o.push(c),r.camera!==void 0&&o.push(i.getDependency("camera",r.camera).then(function(l){return i._getNodeRef(i.cameraCache,r.camera,l)})),i._invokeAll(function(l){return l.createNodeAttachment&&l.createNodeAttachment(e)}).forEach(function(l){o.push(l)}),this.nodeCache[e]=Promise.all(o).then(function(l){let h;if(r.isBone===!0?h=new uh:l.length>1?h=new di:l.length===1?h=l[0]:h=new ht,h!==l[0])for(let d=0,f=l.length;d<f;d++)h.add(l[d]);if(r.name&&(h.userData.name=r.name,h.name=a),_n(h,r),r.extensions&&li(n,h,r),r.matrix!==void 0){const d=new Ue;d.fromArray(r.matrix),h.applyMatrix4(d)}else r.translation!==void 0&&h.position.fromArray(r.translation),r.rotation!==void 0&&h.quaternion.fromArray(r.rotation),r.scale!==void 0&&h.scale.fromArray(r.scale);if(!i.associations.has(h))i.associations.set(h,{});else if(r.mesh!==void 0&&i.meshCache.refs[r.mesh]>1){const d=i.associations.get(h);i.associations.set(h,{...d})}return i.associations.get(h).nodes=e,h}),this.nodeCache[e]}loadScene(e){const t=this.extensions,n=this.json.scenes[e],i=this,r=new di;n.name&&(r.name=i.createUniqueName(n.name)),_n(r,n),n.extensions&&li(t,r,n);const a=n.nodes||[],o=[];for(let c=0,l=a.length;c<l;c++)o.push(i.getDependency("node",a[c]));return Promise.all(o).then(function(c){for(let h=0,d=c.length;h<d;h++){const f=c[h];f.parent!==null?r.add(L_(f)):r.add(f)}const l=h=>{const d=new Map;for(const[f,u]of i.associations)(f instanceof hn||f instanceof Et)&&d.set(f,u);return h.traverse(f=>{const u=i.associations.get(f);u!=null&&d.set(f,u)}),d};return i.associations=l(r),r})}_createAnimationTracks(e,t,n,i,r){const a=[],o=e.name?e.name:e.uuid,c=[];function l(u){u.morphTargetInfluences&&c.push(u.name?u.name:u.uuid)}Yn[r.path]===Yn.weights?(l(e),e.isGroup&&e.children.forEach(l)):c.push(o);let h;switch(Yn[r.path]){case Yn.weights:h=Es;break;case Yn.rotation:h=Ts;break;case Yn.translation:case Yn.scale:h=Cr;break;default:n.itemSize===1?h=Es:h=Cr;break}const d=i.interpolation!==void 0?sv[i.interpolation]:bs,f=this._getArrayFromAccessor(n);for(let u=0,g=c.length;u<g;u++){const v=new h(c[u]+"."+Yn[r.path],t.array,f,d);i.interpolation==="CUBICSPLINE"&&this._createCubicSplineTrackInterpolant(v),a.push(v)}return a}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){const n=Mo(t.constructor),i=new Float32Array(t.length);for(let r=0,a=t.length;r<a;r++)i[r]=t[r]*n;t=i}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(n){const i=this instanceof Ts?iv:Lh;return new i(this.times,this.values,this.getValueSize()/3,n)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}}function uv(s,e,t){const n=e.attributes,i=new dn;if(n.POSITION!==void 0){const o=t.json.accessors[n.POSITION],c=o.min,l=o.max;if(c!==void 0&&l!==void 0){if(i.set(new k(c[0],c[1],c[2]),new k(l[0],l[1],l[2])),o.normalized){const h=Mo(Gi[o.componentType]);i.min.multiplyScalar(h),i.max.multiplyScalar(h)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;const r=e.targets;if(r!==void 0){const o=new k,c=new k;for(let l=0,h=r.length;l<h;l++){const d=r[l];if(d.POSITION!==void 0){const f=t.json.accessors[d.POSITION],u=f.min,g=f.max;if(u!==void 0&&g!==void 0){if(c.setX(Math.max(Math.abs(u[0]),Math.abs(g[0]))),c.setY(Math.max(Math.abs(u[1]),Math.abs(g[1]))),c.setZ(Math.max(Math.abs(u[2]),Math.abs(g[2]))),f.normalized){const v=Mo(Gi[f.componentType]);c.multiplyScalar(v)}o.max(c)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}i.expandByVector(o)}s.boundingBox=i;const a=new En;i.getCenter(a.center),a.radius=i.min.distanceTo(i.max)/2,s.boundingSphere=a}function Cl(s,e,t){const n=e.attributes,i=[];function r(a,o){return t.getDependency("accessor",a).then(function(c){s.setAttribute(o,c)})}for(const a in n){const o=bo[a]||a.toLowerCase();o in s.attributes||i.push(r(n[a],o))}if(e.indices!==void 0&&!s.index){const a=t.getDependency("accessor",e.indices).then(function(o){s.setIndex(o)});i.push(a)}return Be.workingColorSpace!==Ot&&"COLOR_0"in n&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${Be.workingColorSpace}" not supported.`),_n(s,e),uv(s,e,t),Promise.all(i).then(function(){return e.targets!==void 0?av(s,e.targets,t):s})}const Pa=new WeakMap,fv=new URL("/pokemon-legends-showcase/assets/draco_decoder-C32yEggz.wasm",import.meta.url).toString(),pv=new URL("/pokemon-legends-showcase/assets/draco_wasm_wrapper-DxJM36Ib.js",import.meta.url).toString(),mv=new URL("/pokemon-legends-showcase/assets/draco_decoder-fzg4nYZr.js",import.meta.url).toString();new URL("/pokemon-legends-showcase/assets/draco_wasm_wrapper-fZCQGLGb.js",import.meta.url).toString(),new URL("/pokemon-legends-showcase/assets/draco_decoder-Z1_iN-Ht.wasm",import.meta.url).toString();class gv extends pi{constructor(e){super(e),this.decoderPaths={js:pv,wasm:fv,dep_js:mv},this.decoderConfig={},this.decoderBinary=null,this.decoderPending=null,this.workerLimit=4,this.workerPool=[],this.workerNextTaskID=1,this.workerSourceURL="",this.defaultAttributeIDs={position:"POSITION",normal:"NORMAL",color:"COLOR",uv:"TEX_COORD"},this.defaultAttributeTypes={position:"Float32Array",normal:"Float32Array",color:"Float32Array",uv:"Float32Array"}}setDecoderPath(e){const{decoderPaths:t}=this;return typeof e=="object"?(t.js=e.js,t.wasm=e.wasm,t.dep_js=null):(t.js=Jn.resolveURL("draco_wasm_wrapper.js",e),t.wasm=Jn.resolveURL("draco_decoder.wasm",e),t.dep_js=Jn.resolveURL("draco_decoder.js",e)),this}setDecoderConfig(e){return console.warn("THREE.DRACOLoader: setDecoderConfig to has been deprecated and will be removed in r194."),this.decoderConfig=e,this}setWorkerLimit(e){return this.workerLimit=e,this}load(e,t,n,i){const r=new Pr(this.manager);r.setPath(this.path),r.setResponseType("arraybuffer"),r.setRequestHeader(this.requestHeader),r.setWithCredentials(this.withCredentials),r.load(e,a=>{this.parse(a,t,i)},n,i)}parse(e,t,n=()=>{}){this.decodeDracoFile(e,t,null,null,ft,n).catch(n)}decodeDracoFile(e,t,n,i,r=Ot,a=()=>{}){const o={attributeIDs:n||this.defaultAttributeIDs,attributeTypes:i||this.defaultAttributeTypes,useUniqueIDs:!!n,vertexColorSpace:r};return this.decodeGeometry(e,o).then(t).catch(a)}decodeGeometry(e,t){const n=JSON.stringify(t);if(Pa.has(e)){const c=Pa.get(e);if(c.key===n)return c.promise;if(e.byteLength===0)throw new Error("THREE.DRACOLoader: Unable to re-decode a buffer with different settings. Buffer has already been transferred.")}let i;const r=this.workerNextTaskID++,a=e.byteLength,o=this._getWorker(r,a).then(c=>(i=c,new Promise((l,h)=>{i._callbacks[r]={resolve:l,reject:h},i.postMessage({type:"decode",id:r,taskConfig:t,buffer:e},[e])}))).then(c=>this._createGeometry(c.geometry));return o.catch(()=>!0).then(()=>{i&&r&&this._releaseTask(i,r)}),Pa.set(e,{key:n,promise:o}),o}_createGeometry(e){const t=new Bt;e.index&&t.setIndex(new Pt(e.index.array,1));for(let n=0;n<e.attributes.length;n++){const{name:i,array:r,itemSize:a,stride:o,vertexColorSpace:c}=e.attributes[n];let l;if(a===o)l=new Pt(r,a);else{const h=new dh(r,o);l=new Nr(h,a,0)}i==="color"&&(this._assignVertexColorSpace(l,c),l.normalized=!(r instanceof Float32Array)),t.setAttribute(i,l)}return t}_assignVertexColorSpace(e,t){if(t!==ft)return;const n=new Ce;for(let i=0,r=e.count;i<r;i++)n.fromBufferAttribute(e,i),Be.colorSpaceToWorking(n,ft),e.setXYZ(i,n.r,n.g,n.b)}_loadLibrary(e,t){const n=new Pr(this.manager);return n.setResponseType(t),n.setWithCredentials(this.withCredentials),new Promise((i,r)=>{n.load(e,i,void 0,r)})}preload(){return this._initDecoder(),this}_initDecoder(){if(this.decoderPending)return this.decoderPending;const e=typeof WebAssembly!="object"||this.decoderConfig.type==="js",t=[],{decoderPaths:n}=this;if(e){if(n.dep_js===null)throw new Error("THREE.DRACOLoader: WebAssembly is required when using a custom decoder paths.");t.push(this._loadLibrary(n.dep_js,"text"))}else t.push(this._loadLibrary(n.js,"text")),t.push(this._loadLibrary(n.wasm,"arraybuffer"));return this.decoderPending=Promise.all(t).then(i=>{const r=i[0];e||(this.decoderConfig.wasmBinary=i[1]);const a=_v.toString(),o=["/* draco decoder */",r,"","/* worker */",a.substring(a.indexOf("{")+1,a.lastIndexOf("}"))].join(`
`);this.workerSourceURL=URL.createObjectURL(new Blob([o]))}),this.decoderPending}_getWorker(e,t){return this._initDecoder().then(()=>{if(this.workerPool.length<this.workerLimit){const i=new Worker(this.workerSourceURL);i._callbacks={},i._taskCosts={},i._taskLoad=0,i.postMessage({type:"init",decoderConfig:this.decoderConfig}),i.onmessage=function(r){const a=r.data;switch(a.type){case"decode":i._callbacks[a.id].resolve(a);break;case"error":i._callbacks[a.id].reject(a);break;default:console.error('THREE.DRACOLoader: Unexpected message, "'+a.type+'"')}},this.workerPool.push(i)}else this.workerPool.sort(function(i,r){return i._taskLoad>r._taskLoad?-1:1});const n=this.workerPool[this.workerPool.length-1];return n._taskCosts[e]=t,n._taskLoad+=t,n})}_releaseTask(e,t){e._taskLoad-=e._taskCosts[t],delete e._callbacks[t],delete e._taskCosts[t]}debug(){console.log("Task load: ",this.workerPool.map(e=>e._taskLoad))}dispose(){for(let e=0;e<this.workerPool.length;++e)this.workerPool[e].terminate();return this.workerPool.length=0,this.workerSourceURL!==""&&URL.revokeObjectURL(this.workerSourceURL),this}}function _v(){let s,e;onmessage=function(a){const o=a.data;switch(o.type){case"init":s=o.decoderConfig,e=new Promise(function(h){s.onModuleLoaded=function(d){h({draco:d})},DracoDecoderModule(s)});break;case"decode":const c=o.buffer,l=o.taskConfig;e.then(h=>{const d=h.draco,f=new d.Decoder;try{const u=t(d,f,new Int8Array(c),l),g=u.attributes.map(v=>v.array.buffer);u.index&&g.push(u.index.array.buffer),self.postMessage({type:"decode",id:o.id,geometry:u},g)}catch(u){console.error(u),self.postMessage({type:"error",id:o.id,error:u.message})}finally{d.destroy(f)}});break}};function t(a,o,c,l){const h=l.attributeIDs,d=l.attributeTypes;let f,u;const g=o.GetEncodedGeometryType(c);if(g===a.TRIANGULAR_MESH)f=new a.Mesh,u=o.DecodeArrayToMesh(c,c.byteLength,f);else if(g===a.POINT_CLOUD)f=new a.PointCloud,u=o.DecodeArrayToPointCloud(c,c.byteLength,f);else throw new Error("THREE.DRACOLoader: Unexpected geometry type.");if(!u.ok()||f.ptr===0)throw new Error("THREE.DRACOLoader: Decoding failed: "+u.error_msg());const v={index:null,attributes:[]};for(const p in h){const m=self[d[p]];let T,A;if(l.useUniqueIDs)A=h[p],T=o.GetAttributeByUniqueId(f,A);else{if(A=o.GetAttributeId(f,a[h[p]]),A===-1)continue;T=o.GetAttribute(f,A)}const x=i(a,o,f,p,m,T);p==="color"&&(x.vertexColorSpace=l.vertexColorSpace),v.attributes.push(x)}return g===a.TRIANGULAR_MESH&&(v.index=n(a,o,f)),a.destroy(f),v}function n(a,o,c){const h=c.num_faces()*3,d=h*4,f=a._malloc(d);o.GetTrianglesUInt32Array(c,d,f);const u=new Uint32Array(a.HEAPF32.buffer,f,h).slice();return a._free(f),{array:u,itemSize:1}}function i(a,o,c,l,h,d){const f=c.num_points(),u=d.num_components(),g=r(a,h),v=u*h.BYTES_PER_ELEMENT,p=Math.ceil(v/4)*4,m=p/h.BYTES_PER_ELEMENT,T=f*v,A=f*p,x=a._malloc(T);o.GetAttributeDataArrayForAllPoints(c,d,g,T,x);const M=new h(a.HEAPF32.buffer,x,T/h.BYTES_PER_ELEMENT);let y;if(v===p)y=M.slice();else{y=new h(A/h.BYTES_PER_ELEMENT);let w=0;for(let _=0,E=M.length;_<E;_++){for(let C=0;C<u;C++)y[w+C]=M[_*u+C];w+=m}}return a._free(x),{name:l,count:f,itemSize:u,array:y,stride:m}}function r(a,o){switch(o){case Float32Array:return a.DT_FLOAT32;case Int8Array:return a.DT_INT8;case Int16Array:return a.DT_INT16;case Int32Array:return a.DT_INT32;case Uint8Array:return a.DT_UINT8;case Uint16Array:return a.DT_UINT16;case Uint32Array:return a.DT_UINT32}}}function vv(s){s.computeBoundingBox();const e=s.boundingBox.getSize(new k),t=Math.max(e.x,e.y,e.z)*.002,n=new jn({color:2438986,side:Nt});return n.onBeforeCompile=i=>{i.vertexShader=i.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
 transformed += normalize(normal) * ${t.toFixed(8)};`)},n.customProgramCacheKey=()=>`native-outline-${t.toFixed(8)}`,n}function xv(s,e){const t=s;return new Yu({name:t.name,map:t.map??null,color:t.color??new Ce("white"),gradientMap:e,normalMap:t.normalMap??null,normalScale:t.normalScale??new ke(1,1),normalMapType:t.normalMapType??Ms,bumpMap:t.bumpMap??null,bumpScale:t.bumpScale??1,transparent:t.transparent,opacity:t.opacity,alphaTest:t.alphaTest,side:t.side,vertexColors:t.vertexColors,depthWrite:t.depthWrite,emissive:t.emissive??new Ce(0),emissiveMap:t.emissiveMap??null,emissiveIntensity:Math.min(t.emissiveIntensity??0,1.5)})}function bv(s){s.hasAttribute("normal")||s.computeVertexNormals()}const Mv={arceus:[23],breloom:[2,3],gardevoir:[61,64],genesect:[257,258],giratina:[218],kyogre:[35],raikou:[27],rayquaza:[35],rotom:[11],sylveon:[10,12],tyranitar:[218]},yv={rotom:/^Rotom(?:_1|_Bottom)?$/};function Sv(s,e,t){return!yv[s]?.test(e)&&t.length>0&&t.every(n=>{const i=n,r=Number(i.name.match(/Material\s*#?\s*(\d+)/i)?.[1]??i.name.match(/(\d+)$/)?.[1]);return!i.transparent&&i.opacity>=.98&&i.alphaTest===0&&!i.emissiveMap&&!/(eye|mouth|tongue|teeth|fire|flame|glow|effect)/i.test(i.name+" "+e)&&!(Mv[s.replace(/-shiny$/,"")]??[]).includes(r)})}function wv(s,e,t){const n=t?.seek??0,i=t?.speed??1.4,r=t?.powerAt??e*.36,a=t?.end??Math.min(e,r+1.26),o=Math.min(e,t?.recoveryEnd??{blastoise:4.3,greninja:1.8}[s]??e),c=Math.max(.25,(r-n)/i),l=Math.max(.3,(a-r)/i),h=Math.max(.2,Math.min(1.35,(o-a)/(t?.recoverySpeed??1.75)));return{seek:n,speed:i,powerAt:r,end:a,recoveryEnd:o,charge:c,attack:l,recovery:h,sourceAt:d=>d<=c+l?Math.min(a,n+d*i):a+(o-a)*Math.min(1,(d-c-l)/h)}}function Pl(s,e,t,n,i,r,a){const o=a??Math.max(0,t-n),c=Math.min(e.getClip().duration,i+t*r);return e.time=c-o*e.getEffectiveTimeScale(),s.update(o),t}const Ev={form:"rock-slide",seek:.25,speed:1.1,powerAt:.9,sustainEnd:1.04,end:1.24,recoverAt:1.44,recoveryEnd:2.640000104904175,emitters:[{id:"mouth",bone:"head",sourceBone:"Head",tip:[80.500023,4e-6,36.499996],forward:[126.988511,6e-6,57.578619]}],attachment:"capture-at-release",evidence:"Native Jaw opening peaks near1.0s at61.4deg, with a head dip at1.033s. A short rock-shard projectile accompanies that lunge. Tip comes from native EffMouth01 transformed into Head space; this is an authored elemental effect, not an official Ancient Power event track.",sourceModel:"https://raw.githubusercontent.com/06wj/pokemon/00d96f7f18894055e7f1db44fa0df6462e5e4c8a/public/models/142/model.glb",attackClip:"attack",timeUnits:"seek, powerAt, sustainEnd, end, recoverAt and recoveryEnd are source clip seconds; speed is playback rate",coordinateUnits:"tip and forward are absolute points in named bone-local space, not direction vectors; bone keys are lowercase for runtime lookup",chargeDuration:.5909090909090908,sourceGlbSha256:"bf077caa8b7db73a5cb8f0d0dc7c65d340da865ce2e1e37a5246471a6723ef11",socketSampleTime:0,requiresMoveFormRouting:!0,animationAuthorship:"native",effectAuthorship:"project-authored elemental interpretation; no official move event track is asserted"},Tv={form:"spoon-psychic-wave",seek:.08,speed:1.2,powerAt:.8,sustainEnd:1.25,end:1.55,recoverAt:2.15,emitters:[{id:"spoon-left",bone:"lfeelera",sourceBone:"LFeelerA",tip:[35.769501,-.043169,-1.062851],forward:[18.236475,-3.39565,-36.858856]},{id:"spoon-right",bone:"rfeelera",sourceBone:"RFeelerA",tip:[35.769501,.043146,-1.062865],forward:[33.682103,2.475525,-40.934236]}],attachment:"continuous",evidence:"The real floating spoons are controlled by LFeelerA/RFeelerA, not LFeelerD/RFeelerD or the hands. Native silver-texture geometry identifies81 spoon vertices per side. Bowl centers use the farthest40% of spoon vertices from each spoon bone; forward follows Head to EffMouth01 at1.0s. Lowercase bone keys intentionally match runtime cached-pose lookup. Original clip is pm0065_00_ba20_buturi01; psychic waves are an authored adaptation, not verified named-move animation.",sources:["https://sg.portal-pokemon.com/pokedex/0065/"],sourceModel:"https://raw.githubusercontent.com/06wj/pokemon/00d96f7f18894055e7f1db44fa0df6462e5e4c8a/public/models/065/model.glb",attackClip:"attack",timeUnits:"seek, powerAt, sustainEnd, end and recoverAt are source clip seconds; speed is playback rate",coordinateUnits:"tip and forward are absolute points in named bone-local space, not direction vectors; bone keys are lowercase for runtime lookup; sourceBone preserves original case",chargeDuration:.6000000000000001,sourceGlbSha256:"c6812a530130ef1e4e938a88cf7473ff4ad4dbbc0cab0c1c58a14c44b3c306b6",socketSampleTime:1,requiresMoveFormRouting:!0},Av={form:"judgment",seek:0,speed:1,powerAt:.76,sustainEnd:1.35,end:1.5,recoverAt:2,recoveryEnd:2,recoverySpeed:1,attackClip:"ensemble_attack",chargeDuration:.76,attachment:"continuous",socketSampleTime:.9,sourceGlbSha256:"d6a59abb56116161674ef6aa1ce7751bc99e3ac9656e20569baf0d6bd56cf107",timeUnits:"source clip seconds; authored clip runs at speed 1",coordinateUnits:"tip and forward are absolute points in named bone-local space",evidence:"Newly authored action; timing is an authored envelope, not extracted game event metadata. Socket points are measured from CPU-skinned source geometry at t=0.9 and transformed into the animated joint local space. Forward is authored +Z at release (Forretress follows each native cannon axis), then follows the joint. These are geometric effect attachments, not official move events.",sources:["https://raw.githubusercontent.com/pokemon-party/3d-pokemon/429de1288cea0d43f5b4f56305d2276e94239d65/models/opt/regular/493.glb"],emitters:[{id:"muzzle",bone:"head",sourceBone:"Head",tip:[.17483260692694103,722838793120954e-19,.41525781857883537],forward:[.3078730253870918,6823355155054239e-20,.9915031099459997],method:"Centroid of frontmost 8% of vertices influenced by the named joint and descendants at release pose."}]},Rv={form:"ice-shards",seek:.7,speed:1.6,powerAt:1.6,sustainEnd:2.45,end:2.65,recoverAt:2.85,recoveryEnd:5.458333492279053,emitters:[{id:"beak",bone:"head",sourceBone:"head",tip:[.070953,-588e-6,.207056],forward:[.224271,-.001859,.654471]}],attachment:"continuous",evidence:"Native jaw opening reaches35.1deg at1.633s, sustaining >=80% from1.567–2.7s. A finite ice-crystal volley follows the real head/beak through the flying pose. Beak tip is measured from frontmost head-skinned vertices in idle and stored in head-local coordinates.",sourceModel:"https://raw.githubusercontent.com/06wj/pokemon/00d96f7f18894055e7f1db44fa0df6462e5e4c8a/public/models/144/model.glb",attackClip:"attack",timeUnits:"seek, powerAt, sustainEnd, end, recoverAt and recoveryEnd are source clip seconds; speed is playback rate",coordinateUnits:"tip and forward are absolute points in named bone-local space, not direction vectors; bone keys are lowercase for runtime lookup",chargeDuration:.5625,sourceGlbSha256:"3ff58a6f521c4ce01b584bbfe0c4123be4f935383a91ff40890143d056026292",socketSampleTime:0,requiresMoveFormRouting:!0,animationAuthorship:"native",effectAuthorship:"project-authored elemental interpretation; no official move event track is asserted"},Cv={form:"twin-hydro-pump",seek:.55,speed:1.4,powerAt:1.65,sustainEnd:2.75,end:3.05,recoverAt:3.5,emitters:[{id:"cannon-left",bone:"left_feeler_b_02",tip:[.26,0,0],forward:[.52,0,0]},{id:"cannon-right",bone:"right_feeler_b_02",tip:[.26,0,0],forward:[.52,0,0]}],attachment:"continuous",evidence:"Each terminal barrel has177 fully weighted vertices attached to its b_02 bone. Native bone-local geometry spans X=-.00763.. .26094; Y/Z roughly +/-.083. Both barrels therefore emit along local +X, not global +Z. Cannon-forward maxima occur source t=1.67..1.72 after the windup. Body holds the extended firing pose through roughly3.0; chosen envelope is a recommendation.",sources:["https://unite.pokemon.com/en-gb/news/blastoise-has-blasted-into-pokemon-unite/"],attackClip:"attack",timeUnits:"seek, powerAt, sustainEnd, end, recoverAt and pulseTimes are source clip seconds; speed is playback rate; projectileLifetime is wall seconds",coordinateUnits:"tip and forward are absolute points in the named bone local space, not direction vectors",chargeDuration:.7857142857142857,sourceGlbSha256:"fb10b5db1408c0c5116fd8537cffc557321ae2121b2d3f4e364ffd4fefd13665"},Pv={form:"seed-bomb",seek:0,speed:1,powerAt:.76,sustainEnd:1.35,end:1.5,recoverAt:2,recoveryEnd:2,recoverySpeed:1,attackClip:"ensemble_attack",chargeDuration:.76,attachment:"capture-at-release",socketSampleTime:.9,sourceGlbSha256:"5cde2532ece8e87592ecc435d6fc8d291cb72fc2c5eec7e4570e24e1ca75174e",timeUnits:"source clip seconds; authored clip runs at speed 1",coordinateUnits:"tip and forward are absolute points in named bone-local space",evidence:"Newly authored action; timing is an authored envelope, not extracted game event metadata. Socket points are measured from CPU-skinned source geometry at t=0.9 and transformed into the animated joint local space. Forward is authored +Z at release (Forretress follows each native cannon axis), then follows the joint. These are geometric effect attachments, not official move events.",sources:["https://raw.githubusercontent.com/pokemon-party/3d-pokemon/429de1288cea0d43f5b4f56305d2276e94239d65/models/opt/regular/286.glb","https://raw.githubusercontent.com/Lilothestitch16/Pokemon-HOME-GLB-Models/27703273836f38f0e185976d955b1fbfb15448af/Pokemon%20%28Generation%203%29/pm0286_00_00.glb"],emitters:[{id:"right-palm",bone:"rhand",sourceBone:"RHand",tip:[.027497059226215453,.012479987253583735,.04869281921286664],forward:[.14464060484442706,.021794031080994397,.2883106570481936],method:"Centroid of frontmost 8% of vertices influenced by the named joint and descendants at release pose."}],projectileCount:1,projectileLifetime:.6},Iv={form:"flamethrower",seek:1.8,speed:1.3,powerAt:2.6,sustainEnd:3.55,end:3.85,recoverAt:5.55,emitters:[{id:"mouth",bone:"head",tip:[-.00496,-31e-6,.203129],forward:[-.03922,-3e-5,.501166]}],attachment:"continuous",evidence:"Native happy/glad01 is an upright celebration, not an official Flamethrower action. Mouth tip averages left/right upper_jaw_a and lower_jaw bone positions at source t=3.5, converted to head-local coordinates. Forward follows head to center_nose. At 60 Hz over authored emission t=2.60-3.85, this native muzzle axis points 27.28-40.25 degrees above the world horizontal; the head remains upright. Jaw opening has a roughly 31.04 degree plateau and >=80% window 2.2167-4.3833. The mouth socket is an approximation because secondary jaw movement continues. Preserve the source recovery from end=3.85 to recoveryEnd=5.875; recoverAt=5.55 is only a legacy blend-ready marker (~2.93% height-normalized joint RMS difference from happy start), not the full native end. All effect events are authored recommendations.",sources:["https://assets.pokemon.com/assets/cms2/pdf/video-game/pokken/Charizard_Chart_EN.pdf","https://raw.githubusercontent.com/06wj/pokemon/00d96f7f18894055e7f1db44fa0df6462e5e4c8a/public/models/006/model.glb"],attackClip:"happy",timeUnits:"seek, powerAt, sustainEnd, end, recoverAt, recoveryEnd and pulseTimes are source clip seconds; speed and recoverySpeed are playback rates; projectileLifetime is wall seconds",coordinateUnits:"tip and forward are absolute points in the named bone local space, not direction vectors",chargeDuration:.6153846153846154,sourceGlbSha256:"f9085a9d6fe0a7f56a7bf7c499d75470cba93681e7e730d27f5c6db54302fbb2",recoveryEnd:5.875,recoverySpeed:1.8,socketSampleTime:3.5},Lv={form:"pyro-ball",seek:0,speed:1,powerAt:.76,sustainEnd:1.35,end:1.5,recoverAt:2,recoveryEnd:2,recoverySpeed:1,attackClip:"ensemble_attack",chargeDuration:.76,attachment:"capture-at-release",socketSampleTime:.9,sourceGlbSha256:"bec170b7c4415a1f81a968f31c8c021f9c61bd5da1c3539551d5c80f173dfd4e",timeUnits:"source clip seconds; authored clip runs at speed 1",coordinateUnits:"tip and forward are absolute points in named bone-local space",evidence:"Newly authored action; timing is an authored envelope, not extracted game event metadata. Socket points are measured from CPU-skinned source geometry at t=0.9 and transformed into the animated joint local space. Forward is authored +Z at release (Forretress follows each native cannon axis), then follows the joint. These are geometric effect attachments, not official move events.",sources:["https://raw.githubusercontent.com/pokemon-party/3d-pokemon/429de1288cea0d43f5b4f56305d2276e94239d65/models/opt/regular/815.glb","https://raw.githubusercontent.com/Lilothestitch16/Pokemon-HOME-GLB-Models/27703273836f38f0e185976d955b1fbfb15448af/Pokemon%20%28Generation%208%29/pm0815_00_00.glb"],emitters:[{id:"striking-foot",bone:"rfoot",sourceBone:"RFoot",tip:[.2544737424213779,-.011605875213629602,-.06151166966169036],forward:[.39409691529406043,-.0315800585556939,-.35930871010720666],method:"Centroid of frontmost 8% of vertices influenced by the named joint and descendants at release pose."}],projectileCount:1,projectileLifetime:.6},Dv={form:"fairy-pulse",seek:0,speed:1,powerAt:.76,sustainEnd:1.35,end:1.5,recoverAt:2,recoveryEnd:2,recoverySpeed:1,attackClip:"ensemble_attack",chargeDuration:.76,attachment:"continuous",socketSampleTime:.9,sourceGlbSha256:"d924df3489e44ec47c3b67eec4a5a4a0f51fa5e2bb6fada42e77ec4fa29fab99",timeUnits:"source clip seconds; authored clip runs at speed 1",coordinateUnits:"tip and forward are absolute points in named bone-local space",evidence:"Newly authored action; timing is an authored envelope, not extracted game event metadata. Socket points are measured from CPU-skinned source geometry at t=0.9 and transformed into the animated joint local space. Forward is authored +Z at release (Forretress follows each native cannon axis), then follows the joint. These are geometric effect attachments, not official move events.",sources:["https://raw.githubusercontent.com/pokemon-party/3d-pokemon/429de1288cea0d43f5b4f56305d2276e94239d65/models/opt/regular/173.glb","https://raw.githubusercontent.com/Lilothestitch16/Pokemon-HOME-GLB-Models/27703273836f38f0e185976d955b1fbfb15448af/Pokemon%20%28Generation%202%29/pm0173_00_00.glb"],emitters:[{id:"muzzle",bone:"head",sourceBone:"Head",tip:[.07952902673250666,-.0011475143862934706,.13017142472808416],forward:[.08527415141512605,-.0011475146920064477,.19583850186789073],method:"Centroid of frontmost 8% of vertices influenced by the named joint and descendants at release pose."}]},Uv={form:"sludge-bomb",seek:0,speed:1,powerAt:.76,sustainEnd:1.35,end:1.5,recoverAt:2,recoveryEnd:2,recoverySpeed:1,attackClip:"ensemble_attack",chargeDuration:.76,attachment:"capture-at-release",socketSampleTime:.9,sourceGlbSha256:"2c328962e299612aa8f9883863827b62157a26376da3fc28734bb03f0c18fa76",timeUnits:"source clip seconds; authored clip runs at speed 1",coordinateUnits:"tip and forward are absolute points in named bone-local space",evidence:"Newly authored action; timing is an authored envelope, not extracted game event metadata. Socket points are measured from CPU-skinned source geometry at t=0.9 and transformed into the animated joint local space. Forward is authored +Z at release (Forretress follows each native cannon axis), then follows the joint. These are geometric effect attachments, not official move events.",sources:["https://raw.githubusercontent.com/pokemon-party/3d-pokemon/429de1288cea0d43f5b4f56305d2276e94239d65/models/opt/regular/980.glb"],emitters:[{id:"muzzle",bone:"head_23",sourceBone:"head_23",tip:[-4669158887685259e-20,.0032828967765098924,.6357641146106343],forward:[-4669158887685259e-20,.022564872106780102,1.0036870684598032],method:"Centroid of frontmost 8% of vertices influenced by the named joint and descendants at release pose."}],projectileCount:1,projectileLifetime:.6},Nv={form:"electric-discharge",seek:.08,speed:1.1,powerAt:.56,sustainEnd:.98,end:1.12,recoverAt:1.32,recoveryEnd:2.3499999046325684,emitters:[{id:"mouth",bone:"head_041",sourceBone:"Head_041",tip:[.068131,.022334,.080681],forward:[.369716,.228707,.47063]}],attachment:"continuous",evidence:"Native special-attack clip opens LowerJaw_05040deg with a peak at.633s and >=80% interval.267–1.167s. Upper/lower jaw landmarks locate the mouth. A short electrical burst aligns with this body action.",sourceModel:"https://raw.githubusercontent.com/pokemon-party/3d-pokemon/429de1288cea0d43f5b4f56305d2276e94239d65/models/opt/regular/880.glb",attackClip:"Armature|Armature|pm0880_00_00_ba21_tokusyu01|Base Layer",timeUnits:"seek, powerAt, sustainEnd, end, recoverAt and recoveryEnd are source clip seconds; speed is playback rate",coordinateUnits:"tip and forward are absolute points in named bone-local space, not direction vectors; bone keys are lowercase for runtime lookup",chargeDuration:.43636363636363634,sourceGlbSha256:"ef10cd7f306f9668fe5f3c0a794f5801c82f1db938494e6ca02b2d81885557ea",socketSampleTime:0,requiresMoveFormRouting:!0,animationAuthorship:"native",effectAuthorship:"project-authored elemental interpretation; no official move event track is asserted"},Fv={form:"hyper-beam",seek:.5,speed:1.35,powerAt:1.78,sustainEnd:2.35,end:2.5,recoverAt:3.25,emitters:[{id:"mouth",bone:"head",sourceBone:"head",tip:[.123917,1e-6,.228082],forward:[.291005,1e-6,.535624]}],attachment:"continuous",evidence:"Jaw rotation peaks1.717s and stays >=80% over.75–2.5s. Head pitches through2.083s. The native jaw joint is already near the snout; the socket moves a small distance forward along head-to-jaw direction. Head-relative Hyper Beam needs a finite straight light beam, rather than flame-shaped dragon particles. Generic supplied attack is not an official Hyper Beam event track.",sources:["https://unite.pokemon.com/en-us/news/dragonite-dances-its-way-into-pokemon-unite/"],sourceModel:"https://raw.githubusercontent.com/06wj/pokemon/00d96f7f18894055e7f1db44fa0df6462e5e4c8a/public/models/149/model.glb",attackClip:"attack",timeUnits:"seek, powerAt, sustainEnd, end and recoverAt are source clip seconds; speed is playback rate",coordinateUnits:"tip and forward are absolute points in named bone-local space, not direction vectors; bone keys are lowercase for runtime lookup; sourceBone preserves original case",chargeDuration:.9481481481481481,sourceGlbSha256:"c7b0605fe01544b52baaecfa98f608d0d32b87e3fd3600234de3a1e2c65381a0",socketSampleTime:1.95,requiresMoveFormRouting:!0},kv={form:"flash-cannon",seek:.12,speed:1.1,powerAt:.68,sustainEnd:1.45,end:1.6,recoverAt:1.8,recoveryEnd:2.5166666507720947,emitters:[{id:"cannon-aperture",bone:"rootjaw_028",sourceBone:"RootJaw_028",tip:[.119596,.005,.030379],forward:[.189671,.038632,.625795]}],attachment:"continuous",evidence:"Native special-attack clip hinges UpperJaw1_039118.6deg open from about.667–1.7s. Socket is fixed in RootJaw_028 space at the native front jaw landmarks so the beam comes from the aperture rather than following the raised lid.",sourceModel:"https://raw.githubusercontent.com/pokemon-party/3d-pokemon/429de1288cea0d43f5b4f56305d2276e94239d65/models/opt/regular/884.glb",attackClip:"Armature|Armature|pm0884_00_00_ba21_tokusyu01|Base Layer",timeUnits:"seek, powerAt, sustainEnd, end, recoverAt and recoveryEnd are source clip seconds; speed is playback rate",coordinateUnits:"tip and forward are absolute points in named bone-local space, not direction vectors; bone keys are lowercase for runtime lookup",chargeDuration:.5090909090909091,sourceGlbSha256:"a40dc1877028c39ea3509c2b6452c44ed5a735b4ea02b029ce9785b016e7770a",socketSampleTime:0,requiresMoveFormRouting:!0,animationAuthorship:"native",effectAuthorship:"project-authored elemental interpretation; no official move event track is asserted"},Ov={form:"swift-stars",seek:.35,speed:1.2,powerAt:1.2,sustainEnd:1.55,end:1.8,recoverAt:2.6,emitters:[{id:"swift-source",bone:"head",sourceBone:"head",tip:[.032238,0,.023056],forward:[.156517,0,.153267]}],attachment:"capture-at-release",evidence:"Native attack keeps lower_jaw effectively static while raising/swiping the forepaws near1.2–1.7s. Socket is the mean upper/lower snout joints in head space; a brief star volley can accompany the flourish. The previous wind blades are not a useful species-specific cue. Official UNITE descriptions explicitly associate Eevee Swift with star-shaped rays. The source generic body attack is not specifically labelled Swift.",sources:["https://unite.pokemon.com/en-us/news/espeon-unleashes-its-power-in-pokemon-unite/"],sourceModel:"https://raw.githubusercontent.com/06wj/pokemon/00d96f7f18894055e7f1db44fa0df6462e5e4c8a/public/models/133/model.glb",attackClip:"attack",timeUnits:"seek, powerAt, sustainEnd, end and recoverAt are source clip seconds; speed is playback rate",coordinateUnits:"tip and forward are absolute points in named bone-local space, not direction vectors; bone keys are lowercase for runtime lookup; sourceBone preserves original case",chargeDuration:.7083333333333334,sourceGlbSha256:"3273193aed370c045b78f03db5de2da0636fbe28b8d3f88d55fd47a847c0db29",socketSampleTime:1.25,requiresMoveFormRouting:!0},Bv={form:"psybeam",seek:0,speed:1,powerAt:.74,sustainEnd:1.02,end:1.12,recoverAt:1.32,recoveryEnd:1.9,emitters:[{id:"forehead-gem",bone:"head_09",sourceBone:"Head_09",tip:[-.10795,.056154,.114775],forward:[-.256405,.097985,.28516]}],attachment:"continuous",evidence:"Project-authored pose envelopes rotate33anatomical joints, including independent ears, neck, forelimbs and forked tail. The forehead gem is measured from red textured head vertices. Release is the authored.74s pose; full idle recovery ends1.9s.",sourceModel:"https://raw.githubusercontent.com/pokemon-party/3d-pokemon/429de1288cea0d43f5b4f56305d2276e94239d65/models/opt/regular/196.glb",attackClip:"ensemble_attack",timeUnits:"seek, powerAt, sustainEnd, end, recoverAt and recoveryEnd are source clip seconds; speed is playback rate",coordinateUnits:"tip and forward are absolute points in named bone-local space, not direction vectors; bone keys are lowercase for runtime lookup",chargeDuration:.74,sourceGlbSha256:"d6ccfe8b85e1478a26a0a775f7035930b4fdb90f27ffccf9fb428f7e48a875e8",socketSampleTime:0,requiresMoveFormRouting:!0,animationAuthorship:"project-authored",effectAuthorship:"project-authored elemental interpretation; no official move event track is asserted"},zv={form:"shell-cannon",seek:0,speed:1,powerAt:.76,sustainEnd:1.35,end:1.5,recoverAt:2,recoveryEnd:2,recoverySpeed:1,attackClip:"ensemble_attack",chargeDuration:.76,attachment:"continuous",socketSampleTime:.9,sourceGlbSha256:"8c717aaa5f9238c550a1542dcd1ef8888422c6072f85d652f494d536fb89f370",timeUnits:"source clip seconds; authored clip runs at speed 1",coordinateUnits:"tip and forward are absolute points in named bone-local space",evidence:"Newly authored action; timing is an authored envelope, not extracted game event metadata. Socket points are measured from CPU-skinned source geometry at t=0.9 and transformed into the animated joint local space. Forward is authored +Z at release (Forretress follows each native cannon axis), then follows the joint. These are geometric effect attachments, not official move events.",sources:["https://raw.githubusercontent.com/pokemon-party/3d-pokemon/429de1288cea0d43f5b4f56305d2276e94239d65/models/opt/regular/205.glb","https://raw.githubusercontent.com/Lilothestitch16/Pokemon-HOME-GLB-Models/27703273836f38f0e185976d955b1fbfb15448af/Pokemon%20%28Generation%202%29/pm0205_00_00.glb"],emitters:[{id:"cannon-left",bone:"lhanda",sourceBone:"LHandA",tip:[.31695692872912135,.025375565235036618,.04872290056240325],forward:[.575131635156475,.048469035116563336,.06481716981558527],method:"Centroid of outermost 12% of skinned cannon vertices along cannon-joint to waist axis."},{id:"cannon-right",bone:"rhanda",sourceBone:"RHandA",tip:[.3169569863196971,-.025375599672923917,.048722976276283095],forward:[.5751316934116933,-.048469051740327854,.06481726051685512],method:"Centroid of outermost 12% of skinned cannon vertices along cannon-joint to waist axis."}]},Gv={form:"psychic-palm-wave",seek:0,speed:1,powerAt:.76,sustainEnd:1.35,end:1.5,recoverAt:2,recoveryEnd:2,recoverySpeed:1,attackClip:"ensemble_attack",chargeDuration:.76,attachment:"continuous",socketSampleTime:.9,sourceGlbSha256:"468966451a26a68f539d3cc2f544e37d61bc84a55367b72876841e5bd02e5aa6",timeUnits:"source clip seconds; authored clip runs at speed 1",coordinateUnits:"tip and forward are absolute points in named bone-local space",evidence:"Newly authored action; timing is an authored envelope, not extracted game event metadata. Socket points are measured from CPU-skinned source geometry at t=0.9 and transformed into the animated joint local space. Forward is authored +Z at release (Forretress follows each native cannon axis), then follows the joint. These are geometric effect attachments, not official move events.",sources:["https://raw.githubusercontent.com/pokemon-party/3d-pokemon/429de1288cea0d43f5b4f56305d2276e94239d65/models/opt/regular/282.glb"],emitters:[{id:"left-palm",bone:"lhand",sourceBone:"LHand",tip:[.06457621068213565,.00044830973895687576,-.0005306530342221727],forward:[.316667239720733,-.2078415534526581,.10947295778030375],method:"Centroid of vertices influenced by the hand and finger descendants."},{id:"right-palm",bone:"rhand",sourceBone:"RHand",tip:[.0655817744647485,-.0008340412438667677,-.00044808897566772643],forward:[.31767436024345,.20745393084958075,.10955553492419878],method:"Centroid of vertices influenced by the hand and finger descendants."}]},Hv={form:"techno-blast",seek:0,speed:1,powerAt:.76,sustainEnd:1.35,end:1.5,recoverAt:2,recoveryEnd:2,recoverySpeed:1,attackClip:"ensemble_attack",chargeDuration:.76,attachment:"continuous",socketSampleTime:.9,sourceGlbSha256:"6ef882037fada043a0228f369ad2c9b887f45ce1ed8f0dd80ad23023ff510877",timeUnits:"source clip seconds; authored clip runs at speed 1",coordinateUnits:"tip and forward are absolute points in named bone-local space",evidence:"Newly authored action; timing is an authored envelope, not extracted game event metadata. Socket points are measured from CPU-skinned source geometry at t=0.9 and transformed into the animated joint local space. Forward is authored +Z at release (Forretress follows each native cannon axis), then follows the joint. These are geometric effect attachments, not official move events.",sources:["https://raw.githubusercontent.com/pokemon-party/3d-pokemon/429de1288cea0d43f5b4f56305d2276e94239d65/models/opt/regular/649.glb"],emitters:[{id:"dorsal-cannon",bone:"feelerd",sourceBone:"FeelerD",tip:[-27755575615628914e-33,4235164736271502e-37,-2220446049250313e-31],forward:[.27114869537869646,-5222270680164375e-22,.07775120500539057],method:"Native FeelerD cannon-front joint."}]},Vv={form:"shadow-ball",seek:.32,speed:1.15,powerAt:1.1,sustainEnd:1.4,end:1.8,recoverAt:2.6,emitters:[{id:"mouth",bone:"head",sourceBone:"head",tip:[-.02669,1e-6,.160952],forward:[-.027702,1e-6,.460951]}],attachment:"capture-at-release",evidence:"Jaw opening peaks1.5s with >=80% interval .983–2.267s. Socket uses the native teeth_01/02 center, shifted slightly toward the lower jaw to center within the open mouth, then expressed in head space at1.35s. A compact shadow orb fits this open-mouth pose; orbiting chest particles miss it. Capture projectile launch once.",sources:["https://assets.pokemon.com/assets/cms2/pdf/video-game/pokken/Gengar_Chart_EN.pdf"],sourceModel:"https://raw.githubusercontent.com/06wj/pokemon/00d96f7f18894055e7f1db44fa0df6462e5e4c8a/public/models/094/model.glb",attackClip:"attack",timeUnits:"seek, powerAt, sustainEnd, end and recoverAt are source clip seconds; speed is playback rate",coordinateUnits:"tip and forward are absolute points in named bone-local space, not direction vectors; bone keys are lowercase for runtime lookup; sourceBone preserves original case",chargeDuration:.6782608695652175,sourceGlbSha256:"fec092f15cd8e67a4593fc991f2d3380d2ef93fbc71d0fae082439dd0f21a4d3",socketSampleTime:1.35,requiresMoveFormRouting:!0},Wv={form:"shadow-pulse",seek:0,speed:1,powerAt:.76,sustainEnd:1.35,end:1.5,recoverAt:2,recoveryEnd:2,recoverySpeed:1,attackClip:"ensemble_attack",chargeDuration:.76,attachment:"continuous",socketSampleTime:.9,sourceGlbSha256:"c8f0f2a1d4a2fd358f7b7bd2ae5b6773773e3f43e7700223e0a91eeda387d7ec",timeUnits:"source clip seconds; authored clip runs at speed 1",coordinateUnits:"tip and forward are absolute points in named bone-local space",evidence:"Newly authored action; timing is an authored envelope, not extracted game event metadata. Socket points are measured from CPU-skinned source geometry at t=0.9 and transformed into the animated joint local space. Forward is authored +Z at release (Forretress follows each native cannon axis), then follows the joint. These are geometric effect attachments, not official move events.",sources:["https://raw.githubusercontent.com/pokemon-party/3d-pokemon/429de1288cea0d43f5b4f56305d2276e94239d65/models/opt/regular/487.glb"],emitters:[{id:"muzzle",bone:"head",sourceBone:"Head",tip:[.45496556599504734,854984096862264e-20,.45555006542014537],forward:[.892533648375355,8923932705060878e-21,1.290844155644436],method:"Centroid of frontmost 8% of vertices influenced by the named joint and descendants at release pose."}]},Xv={form:"icy-wind",seek:0,speed:1,powerAt:.74,sustainEnd:1.02,end:1.12,recoverAt:1.32,recoveryEnd:1.9,emitters:[{id:"frost-muzzle",bone:"head_07",sourceBone:"Head_07",tip:[-514e-6,.0372,.175773],forward:[137e-6,.016684,.468598]}],attachment:"continuous",evidence:"Project-authored braced head cast rotates29anatomical joints including head, neck, ears, forelimbs, feelers and tail. Muzzle socket uses actual frontmost head-skinned vertices. No jaw opening is asserted for this source rig. Release.74s, full idle recovery1.9s.",sourceModel:"https://raw.githubusercontent.com/pokemon-party/3d-pokemon/429de1288cea0d43f5b4f56305d2276e94239d65/models/opt/regular/471.glb",attackClip:"ensemble_attack",timeUnits:"seek, powerAt, sustainEnd, end, recoverAt and recoveryEnd are source clip seconds; speed is playback rate",coordinateUnits:"tip and forward are absolute points in named bone-local space, not direction vectors; bone keys are lowercase for runtime lookup",chargeDuration:.74,sourceGlbSha256:"f63a95671e4444b62649b91dadb2bc9f69635a7668a6f974e5f502bdf84fc520",socketSampleTime:0,requiresMoveFormRouting:!0,animationAuthorship:"project-authored",effectAuthorship:"project-authored elemental interpretation; no official move event track is asserted"},qv={form:"petal-burst",seek:.02,speed:1,powerAt:.55,sustainEnd:.92,end:1.1,recoverAt:1.3,recoveryEnd:1.850000023841858,emitters:[{id:"flower-crown",bone:"feeler_a",sourceBone:"feeler_a",tip:[.244853,91e-5,-.005588],forward:[.480489,905e-6,.065086]}],attachment:"continuous",evidence:"The native action raises both arms and hops around.55–.74s. Petals originate in the real flower crown, using the feeler_a-controlled flower vertices. The mouth remains largely static; it is not used as a false breath emitter.",sourceModel:"https://raw.githubusercontent.com/06wj/pokemon/00d96f7f18894055e7f1db44fa0df6462e5e4c8a/public/models/044/model.glb",attackClip:"attack",timeUnits:"seek, powerAt, sustainEnd, end, recoverAt and recoveryEnd are source clip seconds; speed is playback rate",coordinateUnits:"tip and forward are absolute points in named bone-local space, not direction vectors; bone keys are lowercase for runtime lookup",chargeDuration:.53,sourceGlbSha256:"960b04448e2aa68bf237ef11b081a93acdbc6c06f1a48fce4adb6d91c571bec8",socketSampleTime:0,requiresMoveFormRouting:!0,animationAuthorship:"native",effectAuthorship:"project-authored elemental interpretation; no official move event track is asserted"},Yv={form:"water-shuriken",seek:.12,speed:1.2,powerAt:.666667,sustainEnd:.72,end:1.2,recoverAt:1.65,emitters:[{id:"throwing-left-hand",bone:"left_hand_24",tip:[.090442,19e-6,-.001424],forward:[.358153,-.071911,-.091815]}],attachment:"capture-at-release",projectileCount:1,projectileLifetime:.44,evidence:"Throwing hand is left_hand_24, not jaw_01_5/head_8. Tip is the mean of left middle/index/ring first finger joints transformed into hand-local space. Forward is measured hand velocity from source .65 to .666667, transformed into the hand frame at .683333. Peak forward hand velocity occurs .658333; hand extends and holds from about .70 to1.0. Capture world origin and direction once at release; never keep released shuriken attached to the wrist. Source clip is named rangeattack01, not an explicit named Water Shuriken event track.",sources:["https://www.pokemon.com/us/pokedex/greninja?mo_ar=true&so_ar=true","https://unite.pokemon.com/en-us/pokemon/greninja/"],attackClip:"pm0725_11_00_00450_rangeattack01",timeUnits:"seek, powerAt, sustainEnd, end, recoverAt and pulseTimes are source clip seconds; speed is playback rate; projectileLifetime is wall seconds",coordinateUnits:"tip and forward are absolute points in the named bone local space, not direction vectors",chargeDuration:.4555558333333334,sourceGlbSha256:"9571db1da56cd172b6bb19f0beee8d48c0b19d4f433a6c499ca91ffa7c3aafe9"},Kv={form:"hydro-pump",seek:.12,speed:1.2,powerAt:.62,sustainEnd:1.18,end:1.42,recoverAt:1.85,emitters:[{id:"mouth",bone:"head",sourceBone:"head",tip:[.847187,2e-6,.074033],forward:[1.546674,2e-6,.100832]}],attachment:"continuous",evidence:"Lower-jaw rotation peaks.60s; >=80% window .55–1.483s. Socket is the mean upper_jaw and teeth joint positions, converted to head space at.68s; forward follows head toward upper_jaw. Strong downward head motion makes a fixed stage angle incorrect. Water stream is an authored water-type interpretation of the generic attack; source clip is not named Hydro Pump.",sources:["https://www.pokemon.com/uk/pokedex/gyarados"],sourceModel:"https://raw.githubusercontent.com/06wj/pokemon/00d96f7f18894055e7f1db44fa0df6462e5e4c8a/public/models/130/model.glb",attackClip:"attack",timeUnits:"seek, powerAt, sustainEnd, end and recoverAt are source clip seconds; speed is playback rate",coordinateUnits:"tip and forward are absolute points in named bone-local space, not direction vectors; bone keys are lowercase for runtime lookup; sourceBone preserves original case",chargeDuration:.4166666666666667,sourceGlbSha256:"2b3b9bc67a3a8db342d71e3e9f0bc1de910629d2febf1754c73a68579bd3ab8d",socketSampleTime:.68,requiresMoveFormRouting:!0},$v={form:"hydro-pump",seek:0,speed:1,powerAt:.76,sustainEnd:1.35,end:1.5,recoverAt:2,recoveryEnd:2,recoverySpeed:1,attackClip:"ensemble_attack",chargeDuration:.76,attachment:"continuous",socketSampleTime:.9,sourceGlbSha256:"f110d77f7071252066fe84ab16c54ba4d2fecb9dc75eb07110be7476eed108e0",timeUnits:"source clip seconds; authored clip runs at speed 1",coordinateUnits:"tip and forward are absolute points in named bone-local space",evidence:"Newly authored action; timing is an authored envelope, not extracted game event metadata. Socket points are measured from CPU-skinned source geometry at t=0.9 and transformed into the animated joint local space. Forward is authored +Z at release (Forretress follows each native cannon axis), then follows the joint. These are geometric effect attachments, not official move events.",sources:["https://raw.githubusercontent.com/pokemon-party/3d-pokemon/429de1288cea0d43f5b4f56305d2276e94239d65/models/opt/regular/382.glb"],emitters:[{id:"muzzle",bone:"head_043",sourceBone:"Head_043",tip:[106.7712914098529,.0013381362508406644,10.496262720860168],forward:[220.99583535656615,.0013223063437243204,-1.5092205050265246],method:"Centroid of frontmost 8% of vertices influenced by the named joint and descendants at release pose."}]},Zv={form:"leaf-blade",seek:0,speed:1,powerAt:.74,sustainEnd:1.02,end:1.12,recoverAt:1.32,recoveryEnd:1.9,emitters:[{id:"leaf-paw",bone:"lhand_028",sourceBone:"LHand_028",tip:[-.055143,-.022576,-.010858],forward:[-.352704,-.022603,-.073241]}],attachment:"capture-at-release",evidence:"Project-authored leaf slash rotates41anatomical joints, with one lead forelimb and independently following leaf appendages/tail. The socket follows the left paw geometry in LHand_028 space. Release.74s, full idle recovery1.9s.",sourceModel:"https://raw.githubusercontent.com/pokemon-party/3d-pokemon/429de1288cea0d43f5b4f56305d2276e94239d65/models/opt/regular/470.glb",attackClip:"ensemble_attack",timeUnits:"seek, powerAt, sustainEnd, end, recoverAt and recoveryEnd are source clip seconds; speed is playback rate",coordinateUnits:"tip and forward are absolute points in named bone-local space, not direction vectors; bone keys are lowercase for runtime lookup",chargeDuration:.74,sourceGlbSha256:"60f4585c1661ad4b1762315d660c220a98dd64d6b4de943cd1a1b9ab03281e36",socketSampleTime:0,requiresMoveFormRouting:!0,animationAuthorship:"project-authored",effectAuthorship:"project-authored elemental interpretation; no official move event track is asserted"},jv={form:"aeroblast",seek:.12,speed:1.15,powerAt:.7,sustainEnd:1.1,end:1.22,recoverAt:1.75,emitters:[{id:"beak",bone:"head_14",sourceBone:"head_14",tip:[.012292,-3e-6,.384232],forward:[.201026,-3e-6,1.218473]}],attachment:"continuous",evidence:"Native rangeattack01 has head rotation >=80% of its maximum about.65–1.15s and jaw secondary rotation peaks.867s. Mouth socket is the mean six native upper/lower tooth joint locations at.85s; axis follows head toward the upper-front teeth. Existing wind blade form does not represent the mouth-directed ranged pose. Aeroblast form is a recommendation supported by the official move association.",sources:["https://pokemongo.com/news/apex-reveal"],sourceModel:"https://raw.githubusercontent.com/pokemon-party/3d-pokemon/429de1288cea0d43f5b4f56305d2276e94239d65/models/opt/regular/249.glb",attackClip:"pm0249_00_00_20450_rangeattack01",timeUnits:"seek, powerAt, sustainEnd, end and recoverAt are source clip seconds; speed is playback rate",coordinateUnits:"tip and forward are absolute points in named bone-local space, not direction vectors; bone keys are lowercase for runtime lookup; sourceBone preserves original case",chargeDuration:.5043478260869565,sourceGlbSha256:"c7a68dfbfd1802ffb27ab7880fdf29f6b937df1c6ca693216c3e1165c173a440",socketSampleTime:.85,requiresMoveFormRouting:!0},Jv={form:"psychic-sphere",seek:.3,speed:1.2,powerAt:1.32,sustainEnd:1.8,end:2.15,recoverAt:2.8,emitters:[{id:"psychic-core",bone:"spine_02",sourceBone:"spine_02",tip:[-.01378,-.004801,.005],forward:[.120677,.110439,-.027266]}],attachment:"continuous",evidence:"Native attack is a floating tumble; there is no sustained mouth-firing pose. Socket is the midpoint between spine_01 and spine_02 at1.5s, in spine_02 space, for a bounded body-centered psychic sphere. Direction follows head toward upper_jaw but a local pulse does not need a long beam. Psychic-sphere form is a visual interpretation, not a specific official move event track.",sources:["https://unite.pokemon.com/en-us/pokemon/mew/","https://sg.portal-pokemon.com/pokedex/0151/"],sourceModel:"https://raw.githubusercontent.com/06wj/pokemon/00d96f7f18894055e7f1db44fa0df6462e5e4c8a/public/models/151/model.glb",attackClip:"attack",timeUnits:"seek, powerAt, sustainEnd, end and recoverAt are source clip seconds; speed is playback rate",coordinateUnits:"tip and forward are absolute points in named bone-local space, not direction vectors; bone keys are lowercase for runtime lookup; sourceBone preserves original case",chargeDuration:.8500000000000001,sourceGlbSha256:"240a1c0e076bab5db5ac0c85ae331a5dc19ee3cb90e1a00dadd37346fa029f51",socketSampleTime:1.5,requiresMoveFormRouting:!0},Qv={form:"psychic-palm-wave",seek:.65,speed:1.4,powerAt:2.02,sustainEnd:2.82,end:3.05,recoverAt:3.6,emitters:[{id:"left-palm",bone:"left_hand",sourceBone:"left_hand",tip:[.079092,.002358,-.011917],forward:[.114822,.026178,-.409605]}],attachment:"continuous",evidence:"Supplied attack makes a short right-hand jab near1.67s, then holds LEFT palm forward from about2.0 to3.2s. Socket is the mean left first finger joints plus a small offset along the palm normal, computed from native finger landmarks at2.05s. The previous torso fallback missed the active hand. This is a psychic-wave adaptation of a generic body attack, not an official Psystrike event track.",sources:["https://unite.pokemon.com/en-au/news/celebrate-pokemon-unites-2nd-anniversary-with-mega-mewtwo-x/"],sourceModel:"https://raw.githubusercontent.com/06wj/pokemon/00d96f7f18894055e7f1db44fa0df6462e5e4c8a/public/models/150/model.glb",attackClip:"attack",timeUnits:"seek, powerAt, sustainEnd, end and recoverAt are source clip seconds; speed is playback rate",coordinateUnits:"tip and forward are absolute points in named bone-local space, not direction vectors; bone keys are lowercase for runtime lookup; sourceBone preserves original case",chargeDuration:.9785714285714288,sourceGlbSha256:"8b8d8206dc81955109cdbec5894bcaed25bbbbdb695aeb5bb8194c9155048ec9",socketSampleTime:2.05,requiresMoveFormRouting:!0},ex={form:"fire-spin",seek:.1,speed:1.6,powerAt:.7,sustainEnd:1.35,end:1.6,recoverAt:1.8,recoveryEnd:5.458333492279053,emitters:[{id:"flame-wing-left",bone:"left_wing_a_06",sourceBone:"left_wing_a_06",tip:[0,0,0],forward:[.264193,-.581106,.477948]},{id:"flame-wing-right",bone:"right_wing_a_06",sourceBone:"right_wing_a_06",tip:[0,0,0],forward:[.086851,.50781,.608689]}],attachment:"continuous",evidence:"Native attack has independent wings and body lift. Jaw opens only briefly near.333s, so the1.6s effect ends after a wing-driven flame vortex rather than forcing a sustained mouth flame. Emitters use the native outer wing joints.",sourceModel:"https://raw.githubusercontent.com/06wj/pokemon/00d96f7f18894055e7f1db44fa0df6462e5e4c8a/public/models/146/model.glb",attackClip:"attack",timeUnits:"seek, powerAt, sustainEnd, end, recoverAt and recoveryEnd are source clip seconds; speed is playback rate",coordinateUnits:"tip and forward are absolute points in named bone-local space, not direction vectors; bone keys are lowercase for runtime lookup",chargeDuration:.37499999999999994,sourceGlbSha256:"2dd55b42a2fa49e07b9dc2b1b23f305eb3a7f04e0a7eebac914fadc46c6941c5",socketSampleTime:0,requiresMoveFormRouting:!0,animationAuthorship:"native",effectAuthorship:"project-authored elemental interpretation; no official move event track is asserted"},tx={form:"fire-blast",seek:.4,speed:1.6,powerAt:1.1,sustainEnd:1.95,end:2.25,recoverAt:2.45,recoveryEnd:5.458333492279053,emitters:[{id:"tail-flame-center_tail_07",bone:"center_tail_07",sourceBone:"center_tail_07",tip:[0,0,0],forward:[-.042379,-.012273,-.366523]},{id:"tail-flame-left_tail_c_07",bone:"left_tail_c_07",sourceBone:"left_tail_c_07",tip:[0,0,0],forward:[-.069638,-.140224,-.334325]},{id:"tail-flame-right_tail_c_07",bone:"right_tail_c_07",sourceBone:"right_tail_c_07",tip:[0,0,0],forward:[-.131398,.190176,-.287842]}],attachment:"capture-at-release",evidence:"Native attack bows and fans nine tails while the jaw stays static. Three real tail-tip joints carry detached fire-star bursts during1.1–2.25s. No mouth breath is implied.",sourceModel:"https://raw.githubusercontent.com/06wj/pokemon/00d96f7f18894055e7f1db44fa0df6462e5e4c8a/public/models/038/model.glb",attackClip:"attack",timeUnits:"seek, powerAt, sustainEnd, end, recoverAt and recoveryEnd are source clip seconds; speed is playback rate",coordinateUnits:"tip and forward are absolute points in named bone-local space, not direction vectors; bone keys are lowercase for runtime lookup",chargeDuration:.4375,sourceGlbSha256:"8526a66ee35420c98a98a0a94fb267261761b1df47afd423985c3528860264a3",socketSampleTime:0,requiresMoveFormRouting:!0,animationAuthorship:"native",effectAuthorship:"project-authored elemental interpretation; no official move event track is asserted"},nx={form:"mega-drain",seek:.4,speed:1.5,powerAt:1.65,sustainEnd:2.2,end:2.45,recoverAt:2.6500000000000004,recoveryEnd:4.625,emitters:[{id:"leaf-crown",bone:"feeler_02",sourceBone:"feeler_02",tip:[0,0,0],forward:[.131284,-.001337,.073978]}],attachment:"continuous",evidence:"Native attack uses leafy body dips and hops. The effect originates at the central leaf stalk feeler_02; jaw animation is effectively static. Leaf drain release is an authored adaptation of the available movement.",sourceModel:"https://raw.githubusercontent.com/06wj/pokemon/00d96f7f18894055e7f1db44fa0df6462e5e4c8a/public/models/043/model.glb",attackClip:"attack",timeUnits:"seek, powerAt, sustainEnd, end, recoverAt and recoveryEnd are source clip seconds; speed is playback rate",coordinateUnits:"tip and forward are absolute points in named bone-local space, not direction vectors; bone keys are lowercase for runtime lookup",chargeDuration:.8333333333333334,sourceGlbSha256:"ca5ef8c92cf587d92ddf38e6027f83c612fcaf3f49c9983718374f8761837d8a",socketSampleTime:0,requiresMoveFormRouting:!0,animationAuthorship:"native",effectAuthorship:"project-authored elemental interpretation; no official move event track is asserted"},ix={form:"hurricane",seek:.1,speed:1.2,powerAt:.45,sustainEnd:1.2,end:1.45,recoverAt:1.65,recoveryEnd:2.5199999809265137,emitters:[{id:"wing-left",bone:"lhand",sourceBone:"LHand",tip:[0,0,0],forward:[174.415875,-379.510997,-147.311399]},{id:"wing-right",bone:"rhand",sourceBone:"RHand",tip:[0,0,0],forward:[-88.422512,399.505044,-169.49115]}],attachment:"continuous",evidence:"Native attack flaps the actual wings throughout takeoff. Twin wing emitters use LHand/RHand and the native EffHand locators. The gust is attached to wing motion rather than the stationary screen center.",sourceModel:"https://raw.githubusercontent.com/06wj/pokemon/00d96f7f18894055e7f1db44fa0df6462e5e4c8a/public/models/018/model.glb",attackClip:"attack",timeUnits:"seek, powerAt, sustainEnd, end, recoverAt and recoveryEnd are source clip seconds; speed is playback rate",coordinateUnits:"tip and forward are absolute points in named bone-local space, not direction vectors; bone keys are lowercase for runtime lookup",chargeDuration:.2916666666666667,sourceGlbSha256:"9f53f051cde337931b174796944e51f039c4113fe0a4d1688f05f6efc02ac279",socketSampleTime:0,requiresMoveFormRouting:!0,animationAuthorship:"native",effectAuthorship:"project-authored elemental interpretation; no official move event track is asserted"},sx={form:"gust",seek:.1,speed:1.1,powerAt:.65,sustainEnd:.84,end:1,recoverAt:1.2,recoveryEnd:2.0399999618530273,emitters:[{id:"mouth",bone:"head",sourceBone:"Head",tip:[2,1e-6,7.400003],forward:[4.393615,3e-6,16.256383]}],attachment:"continuous",evidence:"Native action is a compact head/beak peck, with Head rotation peak near.7s. Gust uses the true EffMouth01 landmark in Head space and a short.65–1.0s envelope.",sourceModel:"https://raw.githubusercontent.com/06wj/pokemon/00d96f7f18894055e7f1db44fa0df6462e5e4c8a/public/models/016/model.glb",attackClip:"attack",timeUnits:"seek, powerAt, sustainEnd, end, recoverAt and recoveryEnd are source clip seconds; speed is playback rate",coordinateUnits:"tip and forward are absolute points in named bone-local space, not direction vectors; bone keys are lowercase for runtime lookup",chargeDuration:.5,sourceGlbSha256:"a0cfb3e22d1261bde7d1cec131a9fabbaa178863ea6a5ca6352fef06bf759bb2",socketSampleTime:0,requiresMoveFormRouting:!0,animationAuthorship:"native",effectAuthorship:"project-authored elemental interpretation; no official move event track is asserted"},rx={form:"cheek-lightning",seek:0,speed:1,powerAt:.56,sustainEnd:.73,end:.88,recoverAt:1.7,emitters:[{id:"cheek-left",bone:"head",tip:[.034184,-.085334,.076179],forward:[.034184,-.085334,.276179]},{id:"cheek-right",bone:"head",tip:[.034184,.085334,.076179],forward:[.034184,.085334,.276179]}],attachment:"continuous-pulses",pulseTimes:[.56,.64,.73],evidence:"Cheek centers are native head-local centroids of14 red-texture body vertices per side, isolated from the body mesh; bilateral symmetry was verified. pointlight1/2 sit by the eyes and should not substitute for cheeks. Source attack is a jump/flip: head apex0.5667; front-facing air pose around .55-.85; landing/crouch minimum1.0167. Recommended short discharge fits the frontal air pose and ends before landing.",sources:["https://www.pokemon.com/uk/pokedex/pikachu","https://unite.pokemon.com/en-us/pokemon/pikachu/"],attackClip:"attack",timeUnits:"seek, powerAt, sustainEnd, end, recoverAt and pulseTimes are source clip seconds; speed is playback rate; projectileLifetime is wall seconds",coordinateUnits:"tip and forward are absolute points in the named bone local space, not direction vectors",chargeDuration:.56,sourceGlbSha256:"531d70fe004312dbdc0595a08c8efc740191679128927c8c2b916a7399a64846"},ax={form:"x-scissor",seek:.12,speed:1.1,powerAt:.9,sustainEnd:1.1,end:1.25,recoverAt:1.45,recoveryEnd:2.440000057220459,emitters:[{id:"horn-left",bone:"lear",sourceBone:"LEar",tip:[62.000011,6.000008,-.600001],forward:[66.45342,6.627119,41.513793]},{id:"horn-right",bone:"rear",sourceBone:"REar",tip:[62.000011,-6.000004,-.600001],forward:[66.452619,-6.63276,41.513794]}],attachment:"continuous",evidence:"Native action closes and lowers the large horns near.9–1.1s. Exact EffHorn01/02 landmarks are transformed into their REar/LEar parent spaces. Crossed slashes originate at both horn tips, not facial feeler bones.",sourceModel:"https://raw.githubusercontent.com/06wj/pokemon/00d96f7f18894055e7f1db44fa0df6462e5e4c8a/public/models/127/model.glb",attackClip:"attack",timeUnits:"seek, powerAt, sustainEnd, end, recoverAt and recoveryEnd are source clip seconds; speed is playback rate",coordinateUnits:"tip and forward are absolute points in named bone-local space, not direction vectors; bone keys are lowercase for runtime lookup",chargeDuration:.7090909090909091,sourceGlbSha256:"8d788eb437501104a955776f10d3b04ea7f43b449f1d08ef1ad492669b01aa12",socketSampleTime:0,requiresMoveFormRouting:!0,animationAuthorship:"native",effectAuthorship:"project-authored elemental interpretation; no official move event track is asserted"},ox={form:"thunder-punch",seek:0,speed:1,powerAt:.55,sustainEnd:.86,end:1.02,recoverAt:1.22,recoveryEnd:1.5166666507720947,emitters:[{id:"right-fist",bone:"right_hand",sourceBone:"right_hand",tip:[.019501,-.025309,-.009202],forward:[.2634,.016679,-.007238]}],attachment:"continuous",evidence:"Native attack raises and leans the body while the tail arcs, with the strongest arm posture from.5–1.067s. The right fist socket is measured from frontmost right-hand-skinned vertices. Electrical punch release is .55–1.02 s. Punch direction is measured from the torso toward the active fist at release, then stored in fist-local space.",sourceModel:"https://raw.githubusercontent.com/06wj/pokemon/00d96f7f18894055e7f1db44fa0df6462e5e4c8a/public/models/026/model.glb",attackClip:"attack",timeUnits:"seek, powerAt, sustainEnd, end, recoverAt and recoveryEnd are source clip seconds; speed is playback rate",coordinateUnits:"tip and forward are absolute points in named bone-local space, not direction vectors; bone keys are lowercase for runtime lookup",chargeDuration:.55,sourceGlbSha256:"d547337b946985beab2c54d7ce027a20bc5d06fad0383dbe52c132ccdcd0062d",socketSampleTime:0,requiresMoveFormRouting:!0,animationAuthorship:"native",effectAuthorship:"project-authored elemental interpretation; no official move event track is asserted",directionSampleTime:.55},cx={form:"thunderbolt",seek:0,speed:1,powerAt:.76,sustainEnd:1.35,end:1.5,recoverAt:2,recoveryEnd:2,recoverySpeed:1,attackClip:"ensemble_attack",chargeDuration:.76,attachment:"continuous",socketSampleTime:.9,sourceGlbSha256:"21806903d0cc6af6432b0476d0a2fa7b31f8e5b927adad370066f247a01bf50a",timeUnits:"source clip seconds; authored clip runs at speed 1",coordinateUnits:"tip and forward are absolute points in named bone-local space",evidence:"Newly authored action; timing is an authored envelope, not extracted game event metadata. Socket points are measured from CPU-skinned source geometry at t=0.9 and transformed into the animated joint local space. Forward is authored +Z at release (Forretress follows each native cannon axis), then follows the joint. These are geometric effect attachments, not official move events.",sources:["https://raw.githubusercontent.com/pokemon-party/3d-pokemon/429de1288cea0d43f5b4f56305d2276e94239d65/models/opt/regular/243.glb"],emitters:[{id:"muzzle",bone:"head",sourceBone:"Head",tip:[.33580452760128626,-.0006362545379919438,.2395694067907918],forward:[.7740019703324375,-.00063933404646469,.47967067933490637],method:"Centroid of frontmost 8% of vertices influenced by the named joint and descendants at release pose."}]},lx={form:"dragon-pulse",seek:0,speed:1,powerAt:.76,sustainEnd:1.35,end:1.5,recoverAt:2,recoveryEnd:2,recoverySpeed:1,attackClip:"ensemble_attack",chargeDuration:.76,attachment:"continuous",socketSampleTime:.9,sourceGlbSha256:"86a502c3e26f7135e0d576e7fe0bbc66533ce09c84e18edba324b4ac5b1e86eb",timeUnits:"source clip seconds; authored clip runs at speed 1",coordinateUnits:"tip and forward are absolute points in named bone-local space",evidence:"Newly authored action; timing is an authored envelope, not extracted game event metadata. Socket points are measured from CPU-skinned source geometry at t=0.9 and transformed into the animated joint local space. Forward is authored +Z at release (Forretress follows each native cannon axis), then follows the joint. These are geometric effect attachments, not official move events.",sources:["https://raw.githubusercontent.com/pokemon-party/3d-pokemon/429de1288cea0d43f5b4f56305d2276e94239d65/models/opt/regular/384.glb"],emitters:[{id:"muzzle",bone:"head",sourceBone:"Head",tip:[1.0208139320214622,-.001153987581707497,.12027986968557003],forward:[2.29056058749509,-.001158653719306318,-.03562495778700203],method:"Centroid of frontmost 8% of vertices influenced by the named joint and descendants at release pose."}]},hx={form:"electric-pulse",seek:0,speed:1,powerAt:.76,sustainEnd:1.35,end:1.5,recoverAt:2,recoveryEnd:2,recoverySpeed:1,attackClip:"ensemble_attack",chargeDuration:.76,attachment:"continuous",socketSampleTime:.9,sourceGlbSha256:"dc14928ab82258ff34b29517a6f273141e25b912c8ac6f089ce7fa4c3a464d44",timeUnits:"source clip seconds; authored clip runs at speed 1",coordinateUnits:"tip and forward are absolute points in named bone-local space",evidence:"Newly authored action; timing is an authored envelope, not extracted game event metadata. Socket points are measured from CPU-skinned source geometry at t=0.9 and transformed into the animated joint local space. Forward is authored +Z at release (Forretress follows each native cannon axis), then follows the joint. These are geometric effect attachments, not official move events.",sources:["https://raw.githubusercontent.com/pokemon-party/3d-pokemon/429de1288cea0d43f5b4f56305d2276e94239d65/models/opt/regular/479.glb"],emitters:[{id:"left-palm",bone:"lhand",sourceBone:"LHand",tip:[.03407179033535268,-.017059606254185802,6769878347189645e-20],forward:[.04366351134744481,-.06741861947931549,.12117475336434502],method:"Centroid of vertices influenced by the hand and finger descendants."},{id:"right-palm",bone:"rhand",sourceBone:"RHand",tip:[.03449339428915633,.017565436497647573,5501161392083148e-20],forward:[.04408548594962792,.06792437953308034,.12116206602516616],method:"Centroid of vertices influenced by the hand and finger descendants."}]},dx={form:"bullet-punch",seek:0,speed:1,powerAt:.74,sustainEnd:1.02,end:1.12,recoverAt:1.32,recoveryEnd:1.9,emitters:[{id:"right-pincer",bone:"rhand_11",sourceBone:"RHand_11",tip:[-.530527,.043974,.036889],forward:[-1.07499,.068262,-.062587]}],attachment:"capture-at-release",evidence:"Project-authored pincer strike rotates13anatomical joints. Right arm thrust is stronger than the guarded left arm, and finger/pincer pose is independently articulated. The socket follows right-pincer geometry in RHand_11 space. Release.74s, full idle recovery1.9s. Punch direction is measured from the torso toward the active fist at release, then stored in fist-local space.",sourceModel:"https://raw.githubusercontent.com/pokemon-party/3d-pokemon/429de1288cea0d43f5b4f56305d2276e94239d65/models/opt/regular/212.glb",attackClip:"ensemble_attack",timeUnits:"seek, powerAt, sustainEnd, end, recoverAt and recoveryEnd are source clip seconds; speed is playback rate",coordinateUnits:"tip and forward are absolute points in named bone-local space, not direction vectors; bone keys are lowercase for runtime lookup",chargeDuration:.74,sourceGlbSha256:"93d6e730acfeb3c00e418a69dda87bf0a10155f208f1cca8adf15ecb44ca481e",socketSampleTime:0,requiresMoveFormRouting:!0,animationAuthorship:"project-authored",effectAuthorship:"project-authored elemental interpretation; no official move event track is asserted",directionSampleTime:.74},ux={form:"power-gem",seek:.1,speed:1.1,powerAt:.7,sustainEnd:1,end:1.2,recoverAt:1.4,recoveryEnd:2.119999885559082,emitters:[{id:"jewel",bone:"waist",sourceBone:"Waist",tip:[-.282716,-2e-6,22.59748],forward:[-.282711,-2e-6,54.939613]}],attachment:"continuous",evidence:"Native star-arm rotation peaks.733s at26.4deg. The red jewel centroid is measured from red textured surface vertices and transformed to Waist space. Gem projectile release follows the actual central gem.",sourceModel:"https://raw.githubusercontent.com/06wj/pokemon/00d96f7f18894055e7f1db44fa0df6462e5e4c8a/public/models/121/model.glb",attackClip:"attack",timeUnits:"seek, powerAt, sustainEnd, end, recoverAt and recoveryEnd are source clip seconds; speed is playback rate",coordinateUnits:"tip and forward are absolute points in named bone-local space, not direction vectors; bone keys are lowercase for runtime lookup",chargeDuration:.5454545454545454,sourceGlbSha256:"3958d3aca0bd1056d2edd241ea99a38709bf9f7c6141fca373d103817e210557",socketSampleTime:0,requiresMoveFormRouting:!0,animationAuthorship:"native",effectAuthorship:"project-authored elemental interpretation; no official move event track is asserted"},fx={form:"water-pulse",seek:0,speed:1,powerAt:.76,sustainEnd:1.35,end:1.5,recoverAt:2,recoveryEnd:2,recoverySpeed:1,attackClip:"ensemble_attack",chargeDuration:.76,attachment:"continuous",socketSampleTime:.9,sourceGlbSha256:"47edb2596c129577524b3002f680ad1c1f303d43b7da42161bf05b72b39e833d",timeUnits:"source clip seconds; authored clip runs at speed 1",coordinateUnits:"tip and forward are absolute points in named bone-local space",evidence:"Newly authored action; timing is an authored envelope, not extracted game event metadata. Socket points are measured from CPU-skinned source geometry at t=0.9 and transformed into the animated joint local space. Forward is authored +Z at release (Forretress follows each native cannon axis), then follows the joint. These are geometric effect attachments, not official move events.",sources:["https://raw.githubusercontent.com/pokemon-party/3d-pokemon/429de1288cea0d43f5b4f56305d2276e94239d65/models/opt/regular/245.glb","https://raw.githubusercontent.com/Lilothestitch16/Pokemon-HOME-GLB-Models/27703273836f38f0e185976d955b1fbfb15448af/Pokemon%20%28Generation%202%29/pm0245_00_00.glb"],emitters:[{id:"muzzle",bone:"head",sourceBone:"Head",tip:[.3217282172497893,.0007048760694751875,.054127243000944736],forward:[1.4652101244967255,.0007072994777698346,-.04301327568438951],method:"Centroid of frontmost 8% of vertices influenced by the named joint and descendants at release pose."}]},px={form:"fairy-pulse",seek:0,speed:1,powerAt:.76,sustainEnd:1.35,end:1.5,recoverAt:2,recoveryEnd:2,recoverySpeed:1,attackClip:"ensemble_attack",chargeDuration:.76,attachment:"continuous",socketSampleTime:.9,sourceGlbSha256:"0afbbd76024b08a61d7e278e84ea29451b1dadb153223d606ffc57d9c9f22613",timeUnits:"source clip seconds; authored clip runs at speed 1",coordinateUnits:"tip and forward are absolute points in named bone-local space",evidence:"Newly authored action; timing is an authored envelope, not extracted game event metadata. Socket points are measured from CPU-skinned source geometry at t=0.9 and transformed into the animated joint local space. Forward is authored +Z at release (Forretress follows each native cannon axis), then follows the joint. These are geometric effect attachments, not official move events.",sources:["https://raw.githubusercontent.com/pokemon-party/3d-pokemon/429de1288cea0d43f5b4f56305d2276e94239d65/models/opt/regular/700.glb"],emitters:[{id:"muzzle",bone:"head",sourceBone:"Head",tip:[.5752447933299827,.10634809193317506,.07206137729252135],forward:[.7372987714373589,.10634776375147213,.28771885389840074],method:"Centroid of frontmost 8% of vertices influenced by the named joint and descendants at release pose."}]},mx={form:"spectral-roots",seek:0,speed:1,powerAt:.76,sustainEnd:1.35,end:1.5,recoverAt:2,recoveryEnd:2,recoverySpeed:1,attackClip:"ensemble_attack",chargeDuration:.76,attachment:"continuous",socketSampleTime:.9,sourceGlbSha256:"461dca193d0b54c2b02500c308e5a816e24310ddef8735813e7961255d87d656",timeUnits:"source clip seconds; authored clip runs at speed 1",coordinateUnits:"tip and forward are absolute points in named bone-local space",evidence:"Newly authored action; timing is an authored envelope, not extracted game event metadata. Socket points are measured from CPU-skinned source geometry at t=0.9 and transformed into the animated joint local space. Forward is authored +Z at release (Forretress follows each native cannon axis), then follows the joint. These are geometric effect attachments, not official move events.",sources:["https://raw.githubusercontent.com/pokemon-party/3d-pokemon/429de1288cea0d43f5b4f56305d2276e94239d65/models/opt/regular/709.glb"],emitters:[{id:"left-palm",bone:"lhand",sourceBone:"LHand",tip:[.06108346700245282,-.013526109637087558,.0017376357031310685],forward:[.2821130656054326,-.0414793903610976,.263275726101069],method:"Centroid of vertices influenced by the hand and finger descendants."},{id:"right-palm",bone:"rhand",sourceBone:"RHand",tip:[.06108198957459854,.013519908326336871,.0017376333372736419],forward:[.28211179984800905,.041471621785495905,.26327571235451114],method:"Centroid of vertices influenced by the hand and finger descendants."}]},gx={form:"dark-pulse",seek:0,speed:1,powerAt:.76,sustainEnd:1.35,end:1.5,recoverAt:2,recoveryEnd:2,recoverySpeed:1,attackClip:"ensemble_attack",chargeDuration:.76,attachment:"continuous",socketSampleTime:.9,sourceGlbSha256:"20e6e61c5fdfc80779ab418002472bcd59f50ac15b44e2428fd51932818cd5f6",timeUnits:"source clip seconds; authored clip runs at speed 1",coordinateUnits:"tip and forward are absolute points in named bone-local space",evidence:"Newly authored action; timing is an authored envelope, not extracted game event metadata. Socket points are measured from CPU-skinned source geometry at t=0.9 and transformed into the animated joint local space. Forward is authored +Z at release (Forretress follows each native cannon axis), then follows the joint. These are geometric effect attachments, not official move events.",sources:["https://raw.githubusercontent.com/pokemon-party/3d-pokemon/429de1288cea0d43f5b4f56305d2276e94239d65/models/opt/regular/248.glb"],emitters:[{id:"muzzle",bone:"head",sourceBone:"Head",tip:[.04488698688493886,.00018575981959765192,.40067664559773075],forward:[.13045248020208788,.00018554502637732525,.7725874467486707],method:"Centroid of frontmost 8% of vertices influenced by the named joint and descendants at release pose."}]},_x={form:"dark-pulse",seek:0,speed:1,powerAt:.74,sustainEnd:1.02,end:1.12,recoverAt:1.32,recoveryEnd:1.9,emitters:[{id:"dark-chest",bone:"spine2_05",sourceBone:"Spine2_05",tip:[-.176882,-.062629,.058176],forward:[-.410266,-.101364,.139141]}],attachment:"continuous",evidence:"Project-authored brace and head lift rotate19anatomical joints with independent ears, forelimbs, neck and tail. The dark pulse emits from the chest surface in Spine2_05 space. Release.74s, full idle recovery1.9s.",sourceModel:"https://raw.githubusercontent.com/pokemon-party/3d-pokemon/429de1288cea0d43f5b4f56305d2276e94239d65/models/opt/regular/197.glb",attackClip:"ensemble_attack",timeUnits:"seek, powerAt, sustainEnd, end, recoverAt and recoveryEnd are source clip seconds; speed is playback rate",coordinateUnits:"tip and forward are absolute points in named bone-local space, not direction vectors; bone keys are lowercase for runtime lookup",chargeDuration:.74,sourceGlbSha256:"6de526923be6940df431c1967f4cec75f8754bfda4cbe854d7e1aeb6f27d694a",socketSampleTime:0,requiresMoveFormRouting:!0,animationAuthorship:"project-authored",effectAuthorship:"project-authored elemental interpretation; no official move event track is asserted"},vx={form:"water-pulse",seek:.12,speed:.75,powerAt:.63,sustainEnd:.76,end:.86,recoverAt:1.25,emitters:[{id:"mouth",bone:"head",sourceBone:"head",tip:[.104249,0,.03757],forward:[.293642,0,.101839]}],attachment:"continuous",evidence:"Lower-jaw opening peaks.717s, with >=80% opening only .60–.833s. Generic .36*duration trigger fires1.665s, well after the useful mouth pose. Socket is the mean left/right upper/lower lip-joint locations, expressed in head space at.72s. Use a short water pulse rather than a long jet while the mouth is closed. Named Water Pulse behavior is an authored interpretation, not a source clip label. Playback .75 keeps the narrow source window above the current runtime minimum .30-second effect duration.",sources:["https://sg.portal-pokemon.com/pokedex/0134/"],sourceModel:"https://raw.githubusercontent.com/06wj/pokemon/00d96f7f18894055e7f1db44fa0df6462e5e4c8a/public/models/134/model.glb",attackClip:"attack",timeUnits:"seek, powerAt, sustainEnd, end and recoverAt are source clip seconds; speed is playback rate",coordinateUnits:"tip and forward are absolute points in named bone-local space, not direction vectors; bone keys are lowercase for runtime lookup; sourceBone preserves original case",chargeDuration:.68,sourceGlbSha256:"5cd317069c1a8e53b9b49d116ee0f1abbf6f98657f2520b0af677d264109b8f3",socketSampleTime:.72,requiresMoveFormRouting:!0},xx={form:"petal-burst",seek:.08,speed:1.1,powerAt:.58,sustainEnd:.88,end:1.18,recoverAt:1.75,emitters:[{id:"flower-crown",bone:"center_feeler",sourceBone:"center_feeler",tip:[.433157,-155e-6,-.013595],forward:[.18267,-.079319,.411833]}],attachment:"continuous",evidence:"All184 vertices of the yellow flower crown are controlled by center_feeler. Socket is that native mesh centroid at.62s, expressed in center_feeler space; forward follows head toward nose. Source body jumps and thrusts; crown pitch peaks.617s. A brief flower petal burst around.58s fits the active flourish better than leaf particles emitted from the face. Generic clip is not named Petal Dance.",sources:["https://unite.pokemon.com/en-us/pokemon/venusaur/","https://unite.pokemon.com/en-us/news/pokemon-unite-patch-10-27-2022/"],sourceModel:"https://raw.githubusercontent.com/06wj/pokemon/00d96f7f18894055e7f1db44fa0df6462e5e4c8a/public/models/003/model.glb",attackClip:"attack",timeUnits:"seek, powerAt, sustainEnd, end and recoverAt are source clip seconds; speed is playback rate",coordinateUnits:"tip and forward are absolute points in named bone-local space, not direction vectors; bone keys are lowercase for runtime lookup; sourceBone preserves original case",chargeDuration:.4545454545454545,sourceGlbSha256:"597ae283043596e481f718d5c0f800c63c6fe9fda45921a86da6baa50f217253",socketSampleTime:.62,requiresMoveFormRouting:!0},bx={form:"thunder",seek:.55,speed:1.6,powerAt:1.25,sustainEnd:1.75,end:1.95,recoverAt:2.15,recoveryEnd:5.458333492279053,emitters:[{id:"electric-wing-left",bone:"left_wing_a",sourceBone:"left_wing_a",tip:[0,0,0],forward:[-.056462,.223706,.395098]},{id:"electric-wing-right",bone:"right_wing_a",sourceBone:"right_wing_a",tip:[0,0,0],forward:[-.043684,-.204547,.406924]}],attachment:"continuous",evidence:"Native head/wing preparation peaks around1.3s; jaw opening is only brief near1.467s. Twin lightning emitters bind to actual outer wing joints, supporting a1.25–1.95s feather discharge.",sourceModel:"https://raw.githubusercontent.com/06wj/pokemon/00d96f7f18894055e7f1db44fa0df6462e5e4c8a/public/models/145/model.glb",attackClip:"attack",timeUnits:"seek, powerAt, sustainEnd, end, recoverAt and recoveryEnd are source clip seconds; speed is playback rate",coordinateUnits:"tip and forward are absolute points in named bone-local space, not direction vectors; bone keys are lowercase for runtime lookup",chargeDuration:.43749999999999994,sourceGlbSha256:"a0c0b7e95ed4cb67e356d3cb7697862d7bee0b1135ce127010b7cf9441407f5e",socketSampleTime:0,requiresMoveFormRouting:!0,animationAuthorship:"native",effectAuthorship:"project-authored elemental interpretation; no official move event track is asserted"},Mx={aerodactyl:Ev,alakazam:Tv,arceus:Av,articuno:Rv,blastoise:Cv,breloom:Pv,charizard:Iv,cinderace:Lv,cleffa:Dv,clodsire:Uv,dracozolt:Nv,dragonite:Fv,duraludon:kv,eevee:Ov,espeon:Bv,forretress:zv,gardevoir:Gv,genesect:Hv,gengar:Vv,giratina:Wv,glaceon:Xv,gloom:qv,greninja:Yv,gyarados:Kv,kyogre:$v,leafeon:Zv,lugia:jv,mew:Jv,mewtwo:Qv,moltres:ex,ninetales:tx,oddish:nx,pidgeot:ix,pidgey:sx,pikachu:rx,pinsir:ax,raichu:ox,raikou:cx,rayquaza:lx,rotom:hx,scizor:dx,starmie:ux,suicune:fx,sylveon:px,trevenant:mx,tyranitar:gx,umbreon:_x,vaporeon:vx,venusaur:xx,zapdos:bx,"charizard-shiny":{seek:0,speed:1,powerAt:.6949999809265136,end:1.6679999542236328,recoveryEnd:2.316666603088379,recoverySpeed:1,emitters:[{bone:"center_nose_24",tip:[0,0,4440892098500626e-31],forward:[.21916278130317357,-461182357434081e-23,-.019174273196578273]}],evidence:"Authored effect window within the complete native ranged-attack clip. Separate timing and bone-local sockets for this variant; source clips and recovery preserved.",source:"https://raw.githubusercontent.com/pokemon-party/3d-pokemon/429de1288cea0d43f5b4f56305d2276e94239d65/models/opt/shiny/6.glb"},"mewtwo-shiny":{seek:0,speed:1,powerAt:.6049999952316284,end:1.451999988555908,recoveryEnd:2.0166666507720947,recoverySpeed:1,emitters:[{bone:"left_hand_30",tip:[6938893903907228e-32,-13877787807814457e-33,0],forward:[-.0020901284102970846,.23829040938899776,-10424378693585368e-24]}],evidence:"Authored effect window within the complete native ranged-attack clip. Separate timing and bone-local sockets for this variant; source clips and recovery preserved.",source:"https://raw.githubusercontent.com/pokemon-party/3d-pokemon/429de1288cea0d43f5b4f56305d2276e94239d65/models/opt/shiny/150.glb"},"gardevoir-shiny":{form:"psychic-palm-wave",seek:0,speed:1,powerAt:.76,sustainEnd:1.35,end:1.5,recoverAt:2,recoveryEnd:2,recoverySpeed:1,attackClip:"ensemble_attack",chargeDuration:.76,attachment:"continuous",socketSampleTime:.9,sourceGlbSha256:"c7dd0b39e8d26902640a2cc9d1ba4d94fb0dd15148b87a35488f49b89e539cd6",timeUnits:"source clip seconds; authored clip runs at speed 1",coordinateUnits:"tip and forward are absolute points in named bone-local space",evidence:"Existing Gardevoir choreography with its bone-local palm sockets converted through source and target rest axes and measured model scale; target clips retargeted through world-space rotation deltas.",sources:["https://raw.githubusercontent.com/pokemon-party/3d-pokemon/429de1288cea0d43f5b4f56305d2276e94239d65/models/opt/regular/282.glb"],emitters:[{bone:"lhand_67",tip:[-1.6144032024033983,-.013267600326047901,.011511949823759693],forward:[-7.917662332076809,2.7368166996886174,-5.194548576085104]},{bone:"rhand_89",tip:[1.6395405816553463,-.011203520944528589,.021147775243640865],forward:[7.942799529320784,2.7388811797416976,-5.184912034275321]}]},"oddish-shiny":{form:"mega-drain",seek:.4,speed:1.5,powerAt:1.65,sustainEnd:2.2,end:2.45,recoverAt:2.6500000000000004,recoveryEnd:4.625,emitters:[{id:"leaf-crown",bone:"006_feelera2",tip:[5551115123125783e-32,-23852447794681098e-34,13877787807814457e-33],forward:[.13127949965219932,-.0013374923232091437,.07397544467245382]}],attachment:"continuous",evidence:"desired target world q = source animated world q * inverse(source rest world q) * target rest world q. desired target world p = target rest world p + uniform anatomical scale * (source animated world p - source rest world p). Solve each local rotation and translation through actual target parent. Target file rest transforms remain unchanged.",sourceModel:"https://raw.githubusercontent.com/06wj/pokemon/00d96f7f18894055e7f1db44fa0df6462e5e4c8a/public/models/043/model.glb",attackClip:"attack",timeUnits:"seek, powerAt, sustainEnd, end, recoverAt and recoveryEnd are source clip seconds; speed is playback rate",coordinateUnits:"tip and forward are absolute points in named bone-local space, not direction vectors; bone keys are lowercase for runtime lookup",chargeDuration:.8333333333333334,sourceGlbSha256:"959d47852381223b213ef2478eb9b5054ad63f668855ea5a489dce82441cc723",socketSampleTime:0,requiresMoveFormRouting:!0,animationAuthorship:"native",effectAuthorship:"project-authored elemental interpretation; no official move event track is asserted"},"gloom-shiny":{form:"petal-burst",seek:.02,speed:1,powerAt:.55,sustainEnd:.92,end:1.1,recoverAt:1.3,recoveryEnd:1.850000023841858,emitters:[{id:"flower-crown",bone:"005_feelera",tip:[.24485400649915723,.0009090414109325096,-.005587945741553283],forward:[.4804909477744711,.0009031062256460694,.06508641542864525]}],attachment:"continuous",evidence:"desired target world q = source animated world q * inverse(source rest world q) * target rest world q. desired target world p = target rest world p + uniform anatomical scale * (source animated world p - source rest world p). Solve each local rotation and translation through actual target parent. Target file rest transforms remain unchanged.",sourceModel:"https://raw.githubusercontent.com/06wj/pokemon/00d96f7f18894055e7f1db44fa0df6462e5e4c8a/public/models/044/model.glb",attackClip:"attack",timeUnits:"seek, powerAt, sustainEnd, end, recoverAt and recoveryEnd are source clip seconds; speed is playback rate",coordinateUnits:"tip and forward are absolute points in named bone-local space, not direction vectors; bone keys are lowercase for runtime lookup",chargeDuration:.53,sourceGlbSha256:"acacfb0c6ffa22676e61150cb3e5f401e48b94b1f0f4bde8a696c8bd8e0a57bf",socketSampleTime:0,requiresMoveFormRouting:!0,animationAuthorship:"native",effectAuthorship:"project-authored elemental interpretation; no official move event track is asserted"}},Li=Mx;let Il=null,Yt=null,Ir=null,vr=0,xr=0,Vo=!1;function yx(s){return Yt||(Yt=new I_({alpha:!0,antialias:!0,preserveDrawingBuffer:!0,powerPreference:"high-performance"}),Yt.setClearColor(0,0),Yt.outputColorSpace=ft,Yt.toneMapping=an),(Yt.domElement.width!==s||Yt.domElement.height!==s)&&Yt.setSize(s,s,!1),Yt}function Dh(){Ir?.dispose(),Ir=null,Vo=!1}function yo(s,e=[]){const t=new Set,n=new Set,i=new Set(e),r=new Set;s.traverse(a=>{if(a instanceof It){t.add(a.geometry),"isSkinnedMesh"in a&&r.add(a.skeleton);for(const o of Array.isArray(a.material)?a.material:[a.material])n.add(o)}});for(const a of n){for(const o of Object.values(a))o&&typeof o=="object"&&"isTexture"in o&&i.add(o);a.dispose()}for(const a of r)a.dispose();for(const a of t)a.dispose();for(const a of i){const o=a.source?.data;typeof ImageBitmap<"u"&&o instanceof ImageBitmap&&o.close(),a.dispose()}}function Sx(){vr++,Yt?.dispose(),Yt?.forceContextLoss(),Yt=null,xr?Vo=!0:Dh()}async function wx(s,e){const t=vr;Il??=fetch("/pokemon-legends-showcase/assets/pokemon-3d/manifest.json",{cache:"no-cache"}).then(a=>a.ok?a.json():{}).catch(()=>({}));const n=await Il,i=s.split("/").pop().replace(/\.[^.]+$/,""),r=n[i];if(!r?.path||t!==vr)return null;Ir??=new gv().setDecoderPath("/pokemon-legends-showcase/assets/draco/").setWorkerLimit(1),xr++;try{const a=await new D_().setDRACOLoader(Ir).loadAsync(r.path+(r.optimization?.sha256?"?v="+r.optimization.sha256.slice(0,12):""));if(t!==vr)return yo(a.scene),null;try{return new Ex(a.scene,a.animations,r,e,i)}catch(o){throw yo(a.scene),o}}finally{xr--,!xr&&Vo&&Dh()}}class Ex{constructor(e,t,n,i,r){this.model=e,this.entry=n,this.stem=r,this.low=i,this.size=i?448:1024,this.canvas.width=this.canvas.height=this.size,this.context=this.canvas.getContext("2d"),this.texture=Dr.from(this.canvas),this.gradient=new kr(new Uint8Array([65,65,65,255,142,142,142,255,215,215,215,255,255,255,255,255]),4,1,Vt),this.gradient.minFilter=this.gradient.magFilter=vt,this.gradient.needsUpdate=!0;const a=[];this.model.traverse(W=>{if(!(W instanceof It))return;bv(W.geometry);const V=Array.isArray(W.material)?W.material:[W.material],K=V.map(Z=>{const de=Z;this.originalMaterials.add(de);for(const Xe of Object.values(de))Xe&&typeof Xe=="object"&&"isTexture"in Xe&&this.textures.add(Xe);const ve=xv(de,this.gradient);return this.toonMaterials.add(ve),ve});if(W.material=Array.isArray(W.material)?K:K[0],Sv(r,W.name,V)){const Z=W.clone(!1),de=vv(W.geometry);Z.material=de,Z.renderOrder=-1,this.toonMaterials.add(de),a.push({mesh:W,outline:Z})}});for(const{mesh:W,outline:V}of a)W.parent.add(V);this.scene.add(e),this.scene.add(new uf(15661055,6714780,.88));const o=new gr(16777215,1.5);o.position.set(-3,5,7),this.scene.add(o);const c=new gr(9428223,.42);c.position.set(1,-1,3),this.scene.add(c),this.mixer=new Df(e),this.clips=new Map(t.map(W=>[W.name,this.mixer.clipAction(W)])),this.play("idle"),this.mixer.update(0),e.updateMatrixWorld(!0);const l=or(n.species??r),h=l.cameraYaw*Math.PI/180,d=l.cameraElevation*Math.PI/180,f=new k(Math.sin(h)*Math.cos(d),Math.sin(d),Math.cos(h)*Math.cos(d)),u=new dn().setFromObject(e,!0),g=new k(f.z,0,-f.x).normalize(),v=f.clone().cross(g).normalize(),p=new k;let m=1/0,T=-1/0,A=1/0,x=-1/0;const M=()=>{e.traverse(W=>{if(!(W instanceof It)||W.renderOrder===-1)return;const V=W.geometry.getAttribute("position");if(V)for(let K=0;K<V.count;K++){W.getVertexPosition(K,p).applyMatrix4(W.matrixWorld);const Z=p.dot(g),de=p.dot(v);m=Math.min(m,Z),T=Math.max(T,Z),A=Math.min(A,de),x=Math.max(x,de)}})};M();const y=x-A,w=A,_=Li[this.stem],E=this.clips.get(this.entry.attack??this.entry.runtime?.attack??"");if(E){this.current?.stop(),E.reset().setLoop(pr,1).play(),E.clampWhenFinished=!0;const V=_?.seek??0,K=Math.min(E.getClip().duration,_?.recoveryEnd??E.getClip().duration),Z=(n.species??this.stem)==="mewtwo"?48:12;for(let de=0;de<=Z;de++)E.time=V+(K-V)*de/Z,this.mixer.update(0),e.updateMatrixWorld(!0),u.union(new dn().setFromObject(e,!0)),M();E.stop(),this.current=null,this.play("idle"),this.mixer.update(0),e.updateMatrixWorld(!0)}const C=this.entry.enter?this.clips.get(this.entry.enter):null;if(C){this.current?.stop(),C.reset().setLoop(pr,1).play();const W=this.entry.enterStart??0,V=this.entry.enterEnd??C.getClip().duration;for(let K=0;K<=8;K++)C.time=W+(V-W)*K/8,this.mixer.update(0),e.updateMatrixWorld(!0),M();C.stop(),this.current=null,this.play("idle"),this.mixer.update(0),e.updateMatrixWorld(!0)}const P=u.getCenter(new k),D=u.getSize(new k);P.addScaledVector(g,(m+T)/2-P.dot(g)).addScaledVector(v,(A+x)/2-P.dot(v));const F=Math.max(T-m,x-A,.1)*1.1;this.bodyHeight=y/F,this.frameWidth=(T-m)/F,this.camera.left=this.camera.bottom=-F/2,this.camera.right=this.camera.top=F/2,this.camera.position.copy(P).addScaledVector(f,F*2),this.camera.lookAt(P),this.camera.updateProjectionMatrix(),this.camera.updateMatrixWorld(!0),this.attackLight.position.copy(P).addScaledVector(g,-F*1.6).addScaledVector(f,-F*.55).addScaledVector(v,F*.8),this.attackLight.target.position.copy(P),this.scene.add(this.attackLight,this.attackLight.target);const I=[];e.traverse(W=>{"isBone"in W&&I.push(W)});const z=["waist","chest","body","spine","root"].map(W=>I.find(V=>V.name.toLowerCase().replace(/[_\s]*\d+$/,"")===W)).find(Boolean);this.horizontalAnchor=(z?z.getWorldPosition(new k):e.getWorldPosition(new k)).project(this.camera).x,this.groundY=-2*(w-P.dot(v))/F;const Y=[];e.traverse(W=>{"isBone"in W&&Y.push(W)});const B=W=>W.map(V=>Y.find(K=>K.name.toLowerCase().replace(/[_\s]*\d+$/,"")===V)).find(Boolean);this.bones=Y,this.bodySpan=D.y,this.head=B(["head","jaw","neck"]),this.torso=B(["chest","waist","body","spine"]),this.fallback.copy(P).add(new k(0,D.y*.22,D.z*.1)),this.render()}model;entry;stem;texture;groundY;horizontalAnchor;bodyHeight;frameWidth;canvas=document.createElement("canvas");context;scene=new wu;camera=new Rs(-1,1,1,-1,.01,100);mixer;attackLight=new gr(9428223,0);current=null;clips;elapsed=0;size;stopped=!1;charging=!1;emerging=!1;entranceClock=0;attackClock=0;sourceClock=0;low=!1;renderCost=0;poses=new Map;bones=[];bodySpan=1;tip=new k;forward=new k;fallback=new k;head;torso;gradient;originalMaterials=new Set;toonMaterials=new Set;textures=new Set;get timing(){const e=this.clips.get(this.entry.attack??this.entry.runtime?.attack??"");return wv(this.entry.species??this.stem,e?.getClip().duration??2,Li[this.stem])}get entranceDuration(){const e=this.entry.enter?this.clips.get(this.entry.enter):null;return e?Math.min(1.4,Math.max(.4,((this.entry.enterEnd??e.getClip().duration)-(this.entry.enterStart??0))/(this.entry.enterSpeed??1))):.68}get chargeDuration(){return this.timing.charge}get attackDuration(){return this.timing.attack}get recoveryDuration(){return this.timing.recovery}play(e){if(e==="attack"&&this.charging)return;this.emerging=e==="emerge"&&!!this.entry.enter&&this.clips.has(this.entry.enter),this.emerging&&(this.entranceClock=0,this.sourceClock=this.entry.enterStart??0);const t=e==="charge"||e==="attack",n=this.entry.attack??this.entry.runtime?.attack,i=t&&!!n&&this.clips.has(n);this.charging=i,i&&(this.attackClock=0,this.sourceClock=Li[this.stem]?.seek??0);const r=[...this.emerging?[this.entry.enter]:[],...i?[this.entry.attack,this.entry.runtime?.attack,"attack","Attack","Attack01","attack01"]:[],this.entry.idle,this.entry.runtime?.idle,"idle","Idle","wait","Wait"];let a;for(const c of r)if(c&&this.clips.has(c)){a=this.clips.get(c);break}if(a??=this.clips.values().next().value,!a||a===this.current&&!i)return;const o=this.current;a.reset().setEffectiveWeight(1).setLoop(i||this.emerging?pr:nh,i||this.emerging?1:1/0),a.clampWhenFinished=i||this.emerging,a.timeScale=i?Li[this.stem]?.speed??1.4:this.emerging?this.entry.enterSpeed??1:1,a.time=i?Li[this.stem]?.seek??0:this.emerging?this.entry.enterStart??0:0,a.play(),o&&o!==a&&a.crossFadeFrom(o,e==="recover"?.32:.18,!1),this.current=a}setEntranceTime(e){if(!this.emerging||!this.current)return;const t=this.entry.enterStart??0,n=this.entry.enterEnd??this.current.getClip().duration,i=t+(n-t)*Math.min(1,Math.max(0,e/this.entranceDuration)),r=Math.max(0,e-this.entranceClock);this.current.timeScale=1,Pl(this.mixer,this.current,i,this.sourceClock,0,1,r),this.entranceClock=e,this.sourceClock=i}setAttackTime(e){if(!this.charging||!this.current)return;const t=this.timing.sourceAt(e),n=Math.max(0,e-this.attackClock);this.current.timeScale=1,Pl(this.mixer,this.current,t,this.sourceClock,0,1,n),this.attackClock=e,this.sourceClock=t}update(e){if(this.stopped)return;!this.charging&&!this.emerging&&this.mixer.update(e),this.elapsed+=e;const t=this.low?24:(this.charging||this.emerging)&&this.renderCost<7?60:30;if(this.elapsed<1/t)return;this.elapsed%=1/t;const n=performance.now();this.render(),this.renderCost=this.renderCost*.85+(performance.now()-n)*.15}capturePose(){this.render()}setEnergy(e,t){this.attackLight.color.setHex(e),this.attackLight.intensity=Math.max(0,Math.min(1,t))*1.65}render(){this.model.updateMatrixWorld(!0);for(const t of this.bones){let n=this.poses.get(t.name.toLowerCase());n||(n=new Ue,this.poses.set(t.name.toLowerCase(),n)),n.copy(t.matrixWorld)}const e=yx(this.size);e.render(this.scene,this.camera),this.context.clearRect(0,0,this.size,this.size),this.context.drawImage(e.domElement,0,0),this.texture.source.update()}emitters(e){const t=Li[this.stem],n=()=>{const o=this.forward.clone().sub(this.tip).normalize(),c=this.camera.getWorldDirection(new k),l=Math.sqrt(Math.max(0,1-o.dot(c)**2));this.tip.project(this.camera),this.forward.project(this.camera);const h=this.forward.x-this.tip.x,d=this.tip.y-this.forward.y,f=Math.hypot(h,d)||1;return{x:this.tip.x,y:-this.tip.y,dx:h/f,dy:d/f,foreshortening:l}};if(t){const o=[];for(const c of t.emitters){const l=this.poses.get(c.bone);l&&(this.tip.fromArray(c.tip).applyMatrix4(l),this.forward.fromArray(c.forward).applyMatrix4(l),o.push(n()))}if(o.length)return o}const i=e.bone==="chest"?this.torso??this.head:this.head,r=i?this.poses.get(i.name.toLowerCase()):null;r?this.tip.setFromMatrixPosition(r):this.tip.copy(this.fallback);const a=this.bones.find(o=>/^(center_)?nose(_\d+)?$/i.test(o.name));return a&&e.bone!=="chest"?(this.forward.setFromMatrixPosition(this.poses.get(a.name.toLowerCase())),this.forward.sub(this.tip).normalize(),this.tip.addScaledVector(this.forward,this.bodySpan*.035),this.forward.multiplyScalar(this.bodySpan*.2).add(this.tip)):this.forward.copy(this.tip).add(new k(0,0,this.bodySpan*.25)),[n()]}dispose(){this.stopped=!0,this.mixer.stopAllAction(),this.mixer.uncacheRoot(this.model),yo(this.model,this.textures);for(const e of this.originalMaterials)e.dispose();this.gradient.dispose(),this.texture.destroy(!0),this.scene.clear()}}class Wo extends Di{portrait;model;preferredSpan;static async create(e,t){let n=null;try{n=await wx(e,t)}catch(r){console.warn("Animated model unavailable",r)}const i=n?.texture??await Wh.load(e);return new Wo(i,n,e)}constructor(e,t,n){super(),this.model=t,this.portrait=new Xh(e),this.portrait.anchor.set(.5);const i=t?lc(t.bodyHeight,t.frameWidth,t.horizontalAnchor,900):435;this.preferredSpan=i;const r=e.width/e.height;this.portrait.width=r>=1?i:i*r,this.portrait.height=r>=1?i/r:i,t&&(this.portrait.y=154-t.groundY*this.portrait.height/2,this.portrait.x=-t.horizontalAnchor*this.portrait.width/2),this.addChild(this.portrait)}fitPresentation(e){if(!this.model)return;const t=Math.min(this.preferredSpan,lc(this.model.bodyHeight,this.model.frameWidth,this.model.horizontalAnchor,e));this.portrait.width=this.portrait.height=t,this.portrait.x=-this.model.horizontalAnchor*t/2,this.portrait.y=154-this.model.groundY*t/2}get entranceDuration(){return this.model?.entranceDuration??.68}get attackDuration(){return this.model?.attackDuration??.9}get recoveryDuration(){return this.model?.recoveryDuration??.35}get chargeDuration(){return this.model?.chargeDuration??.65}play(e){this.model?.play(e)}capturePose(){this.model?.capturePose()}setEntranceTime(e){this.model?.setEntranceTime(e)}setAttackTime(e){this.model?.setAttackTime(e)}setEnergy(e,t){this.model?.setEnergy(e,t)}update(e){this.model?.update(e)}powerEmitters(e){if(this.model)return this.model.emitters(e).map(n=>({...n,x:this.portrait.x+n.x*this.portrait.width/2,y:this.portrait.y+n.y*this.portrait.height/2}));const t=e.origin??[.5,.3];return[{x:(t[0]-.5)*this.portrait.width,y:(t[1]-.5)*this.portrait.height,dx:Math.cos(e.direction),dy:Math.sin(e.direction)}]}destroy(){this.model?.dispose(),this.model=null,super.destroy({children:!0})}}const Uh=s=>Math.max(0,Math.min(1,s)),ls=s=>{const e=Uh(s);return e*e*(3-2*e)};function Tx(s,e,t,n){const i=Uh(s),r=ls(i),a=i===0||i===1?0:Math.sin(Math.PI*i),o=.018+.982*ls((i-.04)/.86),c=a*(n?29:58),l=e.y+(t.y+154-e.y)*r-c;return{x:e.x+(t.x-e.x)*r,y:l-154*o,scale:o,alpha:ls(i/.12),white:1-ls((i-.34)/.42),shell:1-ls((i-.18)/.16)}}function Ax(s,e,t,n,i){const r=s+.2,a=r+e+.16,o=a+t,c=o+n;return{form:r,charge:a,attack:o,attackEnd:c,recoverEnd:c+i,win:r+Math.min(.38,e*.5)}}function Rx(s,e={x:0,y:0}){const t=Math.cos(s.rotation),n=Math.sin(s.rotation);return{x:s.x+(e.x*t-e.y*n)*s.scale,y:s.y+(e.x*n+e.y*t)*s.scale}}const $t=1.12,Ll=s=>Math.max(0,Math.min(1,s));function Oi(s,e){const t=Math.max(0,Math.min($t,s)),n=t/$t,i=620,r=2750*(1-n),a=i/(i+r),o=Math.min(-500,e-70),c=1120,l=(-98-o-.5*c*$t*$t)/$t,h=o+l*t+.5*c*t*t;return{x:610*(1-n)*a,y:-185+(h+185)*a,scale:.72*a,rotation:-.27+n*.39}}function Nh(s=-500,e=220){const t=Oi($t,s),n=Oi($t-.001,s),i=(t.x-n.x)/.001*.17,r=(t.y-n.y)/.001*.34,a=1120,o=(-r+Math.sqrt(r*r+2*a*(e+98)))/a,c=r+a*o,l=c*.24,h=1250,d=o+2*l/h;return{vx:i,vy:r,gravity:a,contact:o,impact:c,reboundVelocity:l,bounceGravity:h,settled:d,floor:e}}function Cx(s){return{first:$t+s.contact,second:$t+s.settled,latch:$t+s.settled+.12,open:$t+s.settled+.24}}function Px(s,e=-500,t=220){const n=Math.max(0,s),i=Nh(e,t),r=Math.min(n,i.contact),a=Ll(r/i.contact),o=i.vx*r*(1-a*.22);if(n<=i.contact)return{x:o,y:-98+i.vy*n+.5*i.gravity*n*n,scale:.72,rotation:.12+n*.68};const c=Math.min(n-i.contact,i.settled-i.contact),l=Ll(c/(i.settled-i.contact));return{x:i.vx*i.contact*.78+i.vx*.17*c,y:Math.min(t,t-i.reboundVelocity*c+.5*i.bounceGravity*c*c),scale:.72,rotation:(.12+i.contact*.68)*(1-l)*(1-l)}}const nn={x:0,y:-98};class Fh{root=new Di;cardShell=new Di;behind=new Di({isRenderGroup:!0});front=new Di({isRenderGroup:!0});actors=new Di;floor=270;ballFloorInfluence=0;ball;shellFront;flightFx;releaseFx;formationFx;formationFront;conduitFx;hero;face;punctured;trail=new Kt;flare=new Kt;shadow=new Kt;ballShadow=new Kt;shards=[];released=!1;started=!1;energy=new Kt;pressure=new Kt;latch=new Kt;power;white=new qh;emergence={progress:0};entrance;release={amount:0,radius:0};moveVoice=null;static disposeResources(){Sx()}static async create(e,t,n=!1){const[i]=await Promise.all([Wo.create(t,n),Kh(t)]);return new Fh(e,i,t,n)}constructor(e,t,n,i){this.hero=t,this.power=new id(t,$h(n),i),this.entrance=new td(or(this.power.profile.species),this.power.profile.color,this.power.profile.light,i),this.ball=cc(),this.shellFront=cc(),this.shellFront.visible=!1,this.formationFx=ji(i),this.formationFront=ji(i),this.conduitFx=ji(i),this.flightFx=ji(i),this.releaseFx=ji(i),this.face=new Yh({texture:e,verticesX:4,verticesY:6}),this.face.setCorners(-156,-217.5,156,-217.5,156,217.5,-156,217.5),this.cardShell.addChild(this.face),this.root.addChild(this.behind,this.cardShell,this.front),this.behind.addChild(this.trail,this.flightFx,this.ball),this.actors.addChild(this.entrance.back,this.power.back,this.hero,this.power.front,this.entrance.front),this.front.addChild(this.ballShadow,this.shadow,this.releaseFx,this.formationFx,this.conduitFx,this.actors,this.formationFront,this.shellFront,this.energy,this.pressure,this.latch,this.flare),this.actors.y=this.floor-219,this.white.matrix=[0,0,0,0,.91,0,0,0,0,.99,0,0,0,0,1,0,0,0,1,0],this.hero.filters=[this.white],this.hero.visible=!1,this.hero.position.set(70,174),this.hero.scale.set(.025),this.hero.alpha=0,this.shadow.ellipse(0,0,60,10).fill({color:267560,alpha:.15}).ellipse(0,0,42,5).fill({color:267560,alpha:.3}),this.shadow.position.set(0,this.floor),this.shadow.alpha=0,this.ballShadow.ellipse(0,0,36,5).fill({color:137255,alpha:.26}).ellipse(0,0,22,3).fill({color:137255,alpha:.18}),this.ballShadow.alpha=0,this.flare.circle(0,0,34).fill({color:15399679,alpha:.5}).circle(0,0,13).fill(16777215),this.flare.position.set(nn.x,nn.y),this.flare.alpha=0,this.flare.blendMode="add";for(let l=0;l<12;l++){const h=l/12*Math.PI*2,d=l%2?104:145;this.pressure.poly([Math.cos(h-.08)*52,Math.sin(h-.08)*45,Math.cos(h)*d,Math.sin(h)*d*.8,Math.cos(h+.06)*55,Math.sin(h+.06)*46]).fill({color:l%3?12186623:16777215,alpha:.8})}this.pressure.position.set(nn.x,nn.y),this.pressure.alpha=0,this.pressure.blendMode="add",this.latch.circle(0,0,16).fill({color:9170687,alpha:.18}).circle(0,0,8).fill({color:12449791,alpha:.7}).circle(0,0,4).fill(16777215),this.latch.alpha=0,this.latch.blendMode="add";const r=document.createElement("canvas");r.width=e.width,r.height=e.height;const a=r.getContext("2d");a.drawImage(e.source.resource,0,0),a.save(),a.scale(e.width/312,e.height/435),a.translate(156,217.5);const o=Array.from({length:34},(l,h)=>{const d=h/34*Math.PI*2,f=65+Math.sin(h*7.83)*4.5+Math.sin(h*2.6)*3;return[nn.x+Math.cos(d)*f,nn.y+Math.sin(d)*f*.83]}),c=()=>{a.beginPath(),o.forEach(([l,h],d)=>d?a.lineTo(l,h):a.moveTo(l,h)),a.closePath()};c(),a.strokeStyle="#19283a",a.lineWidth=5,a.stroke(),c(),a.strokeStyle="#d8e4ee",a.lineWidth=2.6,a.stroke(),a.globalCompositeOperation="destination-out",c(),a.fill(),a.globalCompositeOperation="source-over";for(let l=0;l<11;l++){const h=l/11*Math.PI*2,d=67+Math.sin(l*7.83)*3;a.beginPath(),a.moveTo(Math.cos(h)*d,nn.y+Math.sin(h)*d*.83),a.lineTo(Math.cos(h+.035)*(d+9),nn.y+Math.sin(h+.035)*(d+9)*.83),a.lineTo(Math.cos(h+.01)*(d+16),nn.y+Math.sin(h+.01)*(d+16)*.83),a.strokeStyle="rgba(18,34,53,.55)",a.lineWidth=.8,a.stroke()}for(let l=0;l<34;l+=2){const[h,d]=o[l],f=l/34*Math.PI*2;a.beginPath(),a.moveTo(h,d),a.lineTo(h-Math.cos(f)*2+2,d-Math.sin(f)*3),a.strokeStyle="rgba(239,245,247,.85)",a.lineWidth=.65,a.stroke()}a.restore(),this.punctured=Dr.from(r),this.cardShell.once("destroyed",()=>this.punctured.destroy(!0));for(let l=0;l<12;l++){const h=l/12*Math.PI*2,d=new Kt().poly([-5,-3,3,-7,8,1,-2,10]).fill(l%3===0?14214383:l%3===1?7505327:4024467).moveTo(-5,-3).lineTo(3,-7).lineTo(8,1).stroke({color:15200245,width:.8});d.position.set(Math.cos(h)*52,nn.y+Math.sin(h)*43),d.visible=!1,this.front.addChild(d),this.shards.push(d)}}play(e,t,n,i,r,a){this.started=!0;const o=or(this.power.profile.species),c=Math.max(.92,this.hero.entranceDuration),l=o.grounded?65:o.settle-10,h={time:0},d={time:0},f={t:0},u={t:0},g=$t,v=Nh(t,this.floor-50),p=Cx(v),m=p.open,T=Ax(m,c,this.hero.chargeDuration,this.hero.attackDuration,this.hero.recoveryDuration),{form:A,charge:x,attack:M,attackEnd:y,recoverEnd:w}=T,_=M-Math.min(this.hero.chargeDuration,Zh(this.power.profile.cue).preRoll),E={gain:0},C={frame:0},P={progress:0},D=Math.min(.22,this.hero.attackDuration*.3),F={x:0,y:0},I=Math.min(.38,c*.38);this.flightFx.visible=!0,this.flightFx.state.setAnimation(0,"flight",!0),this.flightFx.update(0);const z=()=>{const B=Oi(f.t,t),W=Oi(Math.max(0,f.t-.015),t);this.ball.position.set(B.x,B.y),this.ball.scale.set(B.scale),this.ball.rotation=B.rotation,this.flightFx.position.set(B.x,B.y),this.flightFx.scale.set(B.scale),this.flightFx.rotation=Math.atan2(B.y-W.y,B.x-W.x),this.flightFx.alpha=Math.min(1,f.t/.18);const V=this.trail.clear();for(let K=20;K>=1;K--){const Z=Oi(Math.max(0,f.t-K*.011),t),de=Oi(Math.max(0,f.t-(K-1)*.011),t),ve=(21-K)/20,Xe=(2+9*ve)*B.scale;V.moveTo(Z.x,Z.y).lineTo(de.x,de.y).stroke({width:Xe*2.5,color:6672383,alpha:ve*.12}).moveTo(Z.x,Z.y).lineTo(de.x,de.y).stroke({width:Xe,color:8972031,alpha:ve*.58}).moveTo(Z.x,Z.y).lineTo(de.x,de.y).stroke({width:Math.max(.7,Xe*.25),color:16121855,alpha:ve*.8})}};z();const Y=()=>{const B=Px(u.t,t,v.floor),W=(this.floor-50-v.floor)*Math.min(1,u.t/v.contact);this.ballFloorInfluence=Math.min(1,u.t/v.contact),this.ball.position.set(B.x,B.y+W),this.ball.rotation=B.rotation,this.ball.scale.set(B.scale)};e.call(()=>Gn("flight",{pan:.25}),[],0).to(f,{t:g,duration:g,ease:"none",onUpdate:z},0).call(()=>{this.face.texture=this.punctured,this.front.addChildAt(this.ball,this.front.getChildIndex(this.actors)),this.trail.visible=!1,this.flightFx.visible=!1,n(),Gn("slam",{gain:.48})},[],g).to(this.pressure,{alpha:1,duration:.04},g).to(this.pressure.scale,{x:1.45,y:1.45,duration:.22,ease:"power3.out"},g).to(this.pressure,{alpha:0,duration:.18},g+.04).to(this.flare,{alpha:.8,duration:.035},g).to(this.flare.scale,{x:2.1,y:1.5,duration:.24,ease:"power2.out"},g).to(this.flare,{alpha:0,duration:.22},g+.05).to(this.cardShell,{y:7,rotation:.014,duration:.06,ease:"power2.out"},g).to(this.cardShell,{y:0,rotation:0,duration:.25,ease:"power2.out"},g+.06).to(u,{t:v.settled,duration:v.settled,ease:"none",onUpdate:Y},g).to(this.ball.state,{timeScale:.18,duration:v.settled,ease:"power1.out"},g).call(()=>{Gn("ballbounce",{pan:this.ball.x/312,gain:Math.max(.8,Math.min(1,v.impact/900))});const B=Number(this.ball.skeleton.findSlot("closed")?.getAttachment()?.name.replace("spin",""))||0;C.frame=B>24?B-48:B,this.ball.state.clearTracks()},[],p.first).to(C,{frame:0,duration:v.settled-v.contact,ease:"power2.out",onUpdate:()=>this.ball.skeleton.setAttachment("closed","spin"+(Math.round(C.frame)%48+48)%48)},g+v.contact).call(()=>{Gn("ballsettle",{pan:this.ball.x/312}),this.ball.state.setAnimation(0,"ready",!1),this.ball.state.timeScale=1},[],p.second).call(()=>Gn("latch"),[],p.latch).to(this.latch,{alpha:1,duration:.1},m-.12).to(this.latch,{alpha:0,duration:.14},m+.03).to(this.shadow,{alpha:1,duration:.38},g).call(()=>{this.ball.state.setAnimation(0,"open",!1);const B=this.aperture();this.releaseFx.position.set(B.x,B.y),this.releaseFx.visible=!0,this.releaseFx.state.setAnimation(0,"release",!1),this.releaseFx.update(0),Gn("release",{pan:.1})},[],m).to(this.release,{amount:1,radius:1,duration:.16,ease:"power2.out"},m+.04).call(()=>{const B=this.aperture();F.x=B.x,F.y=B.y-this.actors.y,this.hero.visible=!0,this.released=!0,this.hero.play("emerge"),this.shellFront.visible=!0,this.shellFront.state.setAnimation(0,"open",!1).trackTime=A-m,this.shellFront.update(0);for(const W of[this.formationFx,this.formationFront]){W.visible=!0,W.state.setAnimation(0,"form",!1),W.state.timeScale=1.4/c;const V=this.power.profile.light;for(const K of W.skeleton.slots)K.color.r=(V>>16&255)/255,K.color.g=(V>>8&255)/255,K.color.b=(V&255)/255}this.conduitFx.visible=!0,this.conduitFx.state.setAnimation(0,"conduit",!1),this.conduitFx.state.timeScale=1.2/(c*.44)},[],A).to(h,{time:c,duration:c,ease:"none",onUpdate:()=>this.hero.setEntranceTime(h.time)},A).to(this.emergence,{progress:1,duration:c,ease:"none",onUpdate:()=>{const B=Tx(this.emergence.progress,F,{x:0,y:l},o.grounded);this.hero.position.set(B.x,B.y),this.hero.scale.set(B.scale),this.hero.alpha=B.alpha,this.white.alpha=B.white,this.shellFront.alpha=B.shell,r?.(.55*Math.sin(this.emergence.progress*Math.PI),this.power.profile.color)},onComplete:()=>{this.hero.filters=[],this.shellFront.visible=!1,r?.(0,this.power.profile.color)}},A).to(this.entrance,{opacity:1,duration:.1},A+.1).to(this.entrance,{progress:1,duration:c+.2,ease:"none"},A+.1).to(this.entrance,{opacity:0,duration:.3},A+c-.05).to(this.release,{amount:0,duration:.35,ease:"power1.out"},A+c*.45).call(()=>{this.conduitFx.visible=!1},[],A+c*.44).call(()=>{this.formationFx.visible=this.formationFront.visible=!1},[],A+c+.08).call(()=>Gn("rare",{gain:.18}),[],A+c*.54).call(()=>Gn(o.weight>.5?"land":"release",{gain:.16+o.weight*.2}),[],A+c).call(()=>{this.ball.state.setAnimation(0,"closed",!1)},[],A+c*.48).to(this.ball,{x:-175,rotation:-.8,alpha:0,duration:I,ease:"power2.inOut"},A+c*.48).to(P,{progress:1,duration:I,ease:"power2.inOut",onUpdate:()=>{this.ball.y=this.floor-50+21*P.progress}},A+c*.48).to(this.ball.scale,{x:.25,y:.25,duration:I},A+c*.48).call(()=>{this.hero.play("charge"),this.power.begin()},[],x).call(()=>jh(this.power.profile.dexId),[],x+Math.min(.22,this.hero.chargeDuration*.32)).to(d,{time:this.hero.chargeDuration+this.hero.attackDuration+this.hero.recoveryDuration,duration:this.hero.chargeDuration+this.hero.attackDuration+this.hero.recoveryDuration,ease:"none",onUpdate:()=>{this.hero.setAttackTime(d.time),this.power.clock=d.time}},x).to(this.power,{charge:1,duration:this.hero.chargeDuration,ease:"power2.in",onUpdate:()=>r?.(this.power.charge,this.power.profile.color)},x).call(()=>{this.hero.setAttackTime(this.hero.chargeDuration),this.hero.capturePose(),this.power.release(this.hero.chargeDuration),this.hero.play("attack"),i?.(this.power.profile.color)},[],M).call(()=>{this.moveVoice=Jh(this.power.profile.cue)},[],_).to(E,{gain:1,duration:.07,ease:"sine.out",onUpdate:()=>this.moveVoice?.update(E.gain,0)},_).to(E,{gain:0,duration:.18,ease:"sine.in",onUpdate:()=>this.moveVoice?.update(E.gain,0)},y-.02).call(()=>{this.moveVoice?.stop(),this.moveVoice=null},[],y+.17).to(this.power,{charge:0,blast:1,duration:.08,ease:"power2.out"},M).to(this.hero,{x:o.side*.12,y:l+2*o.impact,duration:.055,ease:"power2.out"},M).to(this.hero,{x:0,y:l,duration:.19,ease:"sine.out"},M+.055).to(this.power,{fade:0,duration:D,ease:"power1.in"},y-D).call(()=>a?.(),[],T.win).call(()=>{this.hero.play("recover")},[],w).to({},{duration:.4},w),this.shards.forEach((B,W)=>{const V=W/12*Math.PI*2;e.set(B,{visible:!0},g).to(B,{x:Math.cos(V)*(95+W*4),y:nn.y+Math.sin(V)*86+60,rotation:(W-6)*.7,alpha:0,duration:.55,ease:"power2.out"},g)})}finish(){this.moveVoice?.stop(),this.moveVoice=null,ac(),this.started=!0,this.released=!0,this.face.texture=this.punctured,this.cardShell.position.set(0,0),this.cardShell.rotation=0,this.ball.alpha=0,this.ball.visible=!1,this.shellFront.visible=!1,this.shellFront.state.clearTracks(),this.formationFx.visible=this.formationFront.visible=!1,this.formationFront.state.clearTracks(),this.conduitFx.visible=!1,this.formationFx.state.clearTracks(),this.conduitFx.state.clearTracks(),this.flightFx.visible=!1,this.releaseFx.visible=!1,this.flightFx.state.clearTracks(),this.releaseFx.state.clearTracks(),this.ball.state.clearTracks(),this.trail.visible=!1;for(const t of[this.flare,this.pressure,this.latch,...this.shards])t.visible=!1;this.release.amount=0,this.entrance.opacity=0,this.power.charge=0,this.power.blast=0,this.power.fade=0;const e=or(this.power.profile.species);this.hero.filters=[],this.hero.visible=!0,this.hero.alpha=1,this.hero.position.set(0,e.grounded?65:e.settle-10),this.hero.scale.set(1),this.hero.play("idle"),this.hero.update(.2),this.hero.capturePose(),this.update(0)}update(e){this.hero.setEnergy(this.power.profile.color,Math.min(1,this.power.charge*.7+this.power.blast*this.power.fade*.9+this.release.amount*.45)),this.ball.update(e);const t=this.aperture();this.flightFx.visible&&this.flightFx.update(e),this.releaseFx.visible&&(this.releaseFx.position.set(t.x,t.y),this.releaseFx.update(e));for(const[r,a]of[[!1,this.formationFx],[!0,this.formationFront]])if(a.visible){a.position.set(this.hero.x,this.actors.y+this.hero.y-63.5*this.hero.scale.y),a.scale.set(this.hero.scale.x),a.update(e),a.alpha=r?.68:1;for(const o of a.skeleton.slots){const c=o.data.name;r!==(c==="halo1"||c==="halo3")&&(o.color.a=0)}}if(this.conduitFx.visible){const r=this.hero.x,a=this.actors.y+this.hero.y-63.5*this.hero.scale.y;this.conduitFx.position.set(t.x,t.y),this.conduitFx.rotation=Math.atan2(a-t.y,r-t.x),this.conduitFx.scale.set(Math.max(.01,Math.hypot(r-t.x,a-t.y)/240),1),this.conduitFx.update(e)}if(this.shellFront.visible){this.shellFront.position.copyFrom(this.ball.position),this.shellFront.scale.copyFrom(this.ball.scale),this.shellFront.rotation=this.ball.rotation;const r=this.shellFront.state.getCurrent(0),a=this.ball.state.getCurrent(0);r&&a&&(r.trackTime=a.trackTime),this.shellFront.update(0);for(const o of["closed","upper","button"])this.shellFront.skeleton.findSlot(o).color.a=0}if(this.latch.position.set(this.ball.x-19*this.ball.scale.x,this.ball.y),this.released&&this.hero.update(e),this.power.update(e),this.entrance.update(this.hero.x,this.hero.y),this.released){this.shadow.x=this.hero.x;const r=Math.max(0,65-this.hero.y);this.shadow.scale.set(Math.max(.4,1-r*.0025)),this.shadow.alpha=Math.max(.16,.85-r*.006)}const n=Math.max(0,this.floor-this.ball.y-50),i=Math.max(0,1-n/330);this.ballShadow.position.set(this.ball.x,this.floor),this.ballShadow.scale.set(.55+i*.45),this.ballShadow.alpha=i*this.ball.alpha,this.energy.clear()}aperture(){const e=this.ball.skeleton.findBone("orb");return Rx({x:this.ball.x,y:this.ball.y,scale:this.ball.scale.x,rotation:this.ball.rotation},{x:e.worldX,y:e.worldY})}fitPresentation(e){this.hero.fitPresentation(e)}setFloor(e){this.ball.y+=(e-this.floor)*this.ballFloorInfluence,this.floor=e,this.actors.y=e-219,this.shadow.y=e}setCardTilt(e,t){const n=e*.19,i=-t*.13,r=[];for(const[a,o]of[[-156,-217.5],[156,-217.5],[156,217.5],[-156,217.5]]){const c=-a*Math.sin(n)+o*Math.sin(i),l=700/(700+c);r.push(a*Math.cos(n)*l,o*Math.cos(i)*l)}this.face.setCorners(r[0],r[1],r[2],r[3],r[4],r[5],r[6],r[7])}setCardFoil(e){this.face.filters=[e]}takeCard(){return this.face.filters=[],this.setCardTilt(0,0),this.cardShell.removeFromParent(),this.cardShell}destroy(){this.moveVoice?.stop(),this.moveVoice=null,this.started&&ac(),this.hero.filters=[],this.white.destroy(),this.root.destroy({children:!0})}}export{Fh as SpineReveal};
