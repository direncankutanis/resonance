(()=>{
const root=document.querySelector('#chapter');const style=document.createElement('style');style.textContent=`#chapter[data-visual-busy=true] #storm-outcome,#chapter[data-visual-busy=true] #final-result{visibility:hidden}#chapter .tutorial-stage .defense-city{display:none}#chapter .tutorial-stage{padding:0;overflow:hidden}#chapter .tutorial-stage canvas{width:100%;display:block;aspect-ratio:12/7}#chapter .tutorial-stage .nodes{padding:15px}#chapter .animation-message{padding:12px 16px;color:#bfe9dd;font-size:13px}#chapter .tutorial-stage .node{padding:5px}#chapter .tutorial-stage .number{font-size:26px}`;document.head.append(style);
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
// Game text is translated in place; compare the English source.
const source=el=>el?(window.ResonanceI18n?window.ResonanceI18n.source(el):el.textContent):'';
const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
const rand=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);};
const sheet=(w,h)=>Object.assign(document.createElement('canvas'),{width:w,height:h});
// Soft glow sprites replace per-frame shadowBlur, which is the expensive part of a 2D canvas frame.
const sprites={};function glow(rgb,r){const key=rgb+r;if(sprites[key])return sprites[key];const s=sheet(r*2,r*2),x=s.getContext('2d'),gr=x.createRadialGradient(r,r,0,r,r,r);gr.addColorStop(0,`rgba(${rgb},1)`);gr.addColorStop(.35,`rgba(${rgb},.45)`);gr.addColorStop(1,`rgba(${rgb},0)`);x.fillStyle=gr;x.fillRect(0,0,r*2,r*2);return sprites[key]=s;}
const MINT='154,255,223',AMBER='255,210,122',CORAL='255,143,122',GOLD='255,217,154',FOAM='233,255,248';
const energyRGB=v=>v>=40?MINT:v>=20?AMBER:CORAL;
// Static scenery is painted once; each frame only adds what moves.
let base=null,waveLayer=null,wg=null,feather=null;
function scenery(){
 if(base)return;base=sheet(1200,700);const g=base.getContext('2d');
 const sea=g.createLinearGradient(0,0,760,700);sea.addColorStop(0,'#0b2134');sea.addColorStop(.55,'#123d58');sea.addColorStop(1,'#1d6f86');g.fillStyle=sea;g.fillRect(0,0,1200,700);
 const deep=g.createRadialGradient(140,120,20,140,120,520);deep.addColorStop(0,'rgba(6,16,28,.55)');deep.addColorStop(1,'rgba(6,16,28,0)');g.fillStyle=deep;g.fillRect(0,0,760,700);
 const moon=g.createLinearGradient(220,0,420,0);moon.addColorStop(0,'rgba(207,233,255,0)');moon.addColorStop(.5,'rgba(207,233,255,.045)');moon.addColorStop(1,'rgba(207,233,255,0)');g.fillStyle=moon;g.fillRect(160,0,320,700);
 const poly=(pts,fill)=>{g.beginPath();g.moveTo(...pts[0]);for(const q of pts.slice(1))g.lineTo(...q);g.closePath();g.fillStyle=fill;g.fill();};
 const sand=g.createLinearGradient(710,0,790,0);sand.addColorStop(0,'#8f8a6c');sand.addColorStop(.4,'#b9b294');sand.addColorStop(1,'#cfc6a4');poly([[740,0],[1200,0],[1200,700],[735,700],[710,520],[730,350],[715,160]],sand);
 const land=g.createLinearGradient(780,0,1200,700);land.addColorStop(0,'#5d8070');land.addColorStop(1,'#3f6152');poly([[787,0],[1200,0],[1200,700],[780,700],[768,350]],land);
 for(let i=0;i<260;i++){g.fillStyle=`rgba(${rand(i)>.5?'20,40,32':'150,190,160'},${.05+rand(i+9)*.07})`;g.fillRect(790+rand(i+3)*410,rand(i+5)*700,2+rand(i+7)*4,2+rand(i+8)*4);}
 g.strokeStyle='#cfc4a2';g.lineWidth=20;g.beginPath();g.moveTo(843,0);g.lineTo(843,700);g.moveTo(800,350);g.lineTo(1200,350);g.stroke();
 g.strokeStyle='rgba(120,110,80,.55)';g.lineWidth=2;g.setLineDash([14,14]);g.beginPath();g.moveTo(843,0);g.lineTo(843,700);g.moveTo(800,350);g.lineTo(1200,350);g.stroke();g.setLineDash([]);
 waveLayer=sheet(1200,700);wg=waveLayer.getContext('2d');feather=wg.createLinearGradient(0,30,0,670);feather.addColorStop(0,'rgba(0,0,0,0)');feather.addColorStop(.16,'rgba(0,0,0,1)');feather.addColorStop(.84,'rgba(0,0,0,1)');feather.addColorStop(1,'rgba(0,0,0,0)');
 const vg=g.createRadialGradient(600,350,260,600,350,760);vg.addColorStop(0,'rgba(4,10,18,0)');vg.addColorStop(1,'rgba(4,10,18,.55)');g.fillStyle=vg;g.fillRect(0,0,1200,700);
}
const lamps=[[830,90],[856,230],[830,470],[856,610],[900,338],[1010,362],[1090,338],[1180,362]];
function install(){const next=root.querySelector('#next')||root.querySelector('#storm-next')||root.querySelector('#lesson-step'),map=root.querySelector('.map');if(!next||!map||map.querySelector('.tutorial-canvas'))return;scenery();map.classList.add('tutorial-stage');const c=document.createElement('canvas');c.className='tutorial-canvas';c.width=1200;c.height=700;c.setAttribute('role','img');c.setAttribute('aria-label','Live coastal defense scene');map.prepend(c);const message=document.createElement('div');
message.className='animation-message';message.setAttribute('role','status');map.append(message);let g=c.getContext('2d');let strength=Number(root.querySelector('#shield').textContent),damage=15,frame=0,lastP=0,shown='',reserve=Number(root.querySelector('#reserve')?.textContent)||0,reserveCap=Math.max(40,reserve),fx=null;
// Writing the caption only on change keeps i18n from re-translating it every frame.
const say=text=>{if(text!==shown){shown=text;message.textContent=text;}};
const stormy=()=>!!root.querySelector('#storm-next');
const offline=()=>root.dataset.storm==='shield'&&!!root.querySelector('#storm-condition');
function roundRect(x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
function sprite(rgb,r,x,y,a){if(a<=0)return;const prev=g.globalAlpha;g.globalAlpha=prev*Math.min(1,a);g.drawImage(glow(rgb,r),x-r,y-r);g.globalAlpha=prev;}
function building(x,y,w,h,name,damaged,t){
 g.fillStyle='rgba(8,20,32,.55)';g.fillRect(x+8,y+10,w,h);
 const wall=g.createLinearGradient(x,y,x+w,y+h);wall.addColorStop(0,damaged?'#6a7174':'#e2d6b8');wall.addColorStop(1,damaged?'#4b5256':'#b9ab8a');g.fillStyle=wall;g.fillRect(x,y,w,h);
 g.beginPath();g.moveTo(x-8,y);g.lineTo(x+w/2,y-30);g.lineTo(x+w+8,y);g.closePath();g.fillStyle=damaged?'#353e48':'#22395a';g.fill();g.strokeStyle=damaged?'#2b333c':'#30507a';g.lineWidth=2;g.stroke();
 if(name==='RESERVE'){
  // The reserve reads as a vault: a round door whose gold ring fills with the stored energy.
  const cx=x+w/2,cy=y+h/2+4,frac=clamp(reserve/reserveCap);g.lineCap='round';
  g.fillStyle=damaged?'#3a4148':'#2a3a4c';g.beginPath();g.arc(cx,cy,25,0,7);g.fill();
  g.strokeStyle='rgba(239,207,134,.25)';g.lineWidth=5;g.beginPath();g.arc(cx,cy,20,0,7);g.stroke();
  if(frac>0&&!damaged){g.strokeStyle='#efcf86';g.beginPath();g.arc(cx,cy,20,-Math.PI/2,-Math.PI/2+frac*Math.PI*2);g.stroke();g.globalCompositeOperation='lighter';sprite(GOLD,46,cx,cy,.18+.5*frac*(.75+.25*Math.sin(t*2.4)));g.globalCompositeOperation='source-over';}
  g.strokeStyle=damaged?'#59616a':'#c9b88f';g.lineWidth=2;for(let i=0;i<4;i++){const a=i*Math.PI/2+t*.2;g.beginPath();g.moveTo(cx+Math.cos(a)*6,cy+Math.sin(a)*6);g.lineTo(cx+Math.cos(a)*13,cy+Math.sin(a)*13);g.stroke();}g.lineCap='butt';
 }else{
  const cols=name==='TOWER'?1:3,rows=name==='ACADEMY'?3:name==='TOWER'?4:1;
  for(let r=0;r<rows;r++)for(let i=0;i<cols;i++){const k=x*7+r*3+i,lit=!damaged&&rand(k)>.12,wx=x+12+i*(w-24)/cols+(cols===1?(w-33)/2:0),wy=y+16+r*(h-24)/rows;
   const tw=lit?.72+.28*Math.sin(t*(.6+rand(k+1))+rand(k+2)*6):0;g.fillStyle=lit?`rgba(255,224,160,${tw})`:'#1b2836';g.fillRect(wx,wy,9,14);
   if(lit){g.globalCompositeOperation='lighter';sprite(GOLD,14,wx+4,wy+7,.22*tw);g.globalCompositeOperation='source-over';}}
 }
 if(damaged){g.strokeStyle='#242c36';g.lineWidth=5;g.beginPath();g.moveTo(x+w*.6,y);g.lineTo(x+w*.4,y+30);g.lineTo(x+w*.6,y+48);g.stroke();}
}
function crest(front,p,t,offset,width,color){g.beginPath();for(let i=0;i<=42;i++){const y=130+i*10.6,edge=front-50*Math.pow((y-350)/230,2)-offset+Math.sin(i*.7+p*18+t*2)*5+Math.sin(i*1.9+t*3.1)*2;if(i===0)g.moveTo(edge,y);else g.lineTo(edge,y);}g.strokeStyle=color;g.lineWidth=width;g.stroke();}
function draw(p,t=performance.now()/1000){
const hit=p>=.42,fail=strength<=damage,contact=smooth((p-.42)/.14),retreat=smooth((p-.58)/.32),flood=smooth((p-.55)/.35);
const front=!hit?120+635*smooth(p/.42):fail?755+440*flood:755-250*retreat;
const wet=fail&&p>.55,storm=stormy(),energy=hit&&p>=.5?Math.max(0,strength-damage):strength;
g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';
// A short in-canvas shake at contact; nothing in the page moves.
const quake=hit&&p<.62?7*(1-smooth((p-.42)/.2))*(fail?1.4:1):0;g.setTransform(1,0,0,1,Math.sin(p*190)*quake,Math.cos(p*230)*quake*.6);
g.drawImage(base,0,0);
// Swell: three layers drifting at different speeds, plus moonlight glints.
for(let layer=0;layer<2;layer++){g.strokeStyle=`rgba(140,200,214,${.10+layer*.08})`;g.lineWidth=1.3+layer*.7;g.beginPath();for(let i=0;i<20;i++){const k=layer*40+i,y=(rand(k)*740+t*(5+layer*5))%740-20,x=rand(k+9)*620-60,len=90+rand(k+3)*200,amp=3+layer*2.5,ph=t*(.6+layer*.35)+k;g.moveTo(x,y);g.quadraticCurveTo(x+len/2,y-amp*Math.sin(ph),x+len,y);}g.stroke();}
g.globalCompositeOperation='lighter';for(let i=0;i<34;i++){const y=(rand(i)*700+t*14)%700,x=240+rand(i+40)*170,a=.5+.5*Math.sin(t*2+i*1.7);g.fillStyle=`rgba(207,233,255,${.10*a})`;g.fillRect(x,y,14+rand(i+3)*30,2);}g.globalCompositeOperation='source-over';
for(let i=0;i<22;i++){const x=(rand(i+70)*700+t*(8+rand(i)*10))%700,y=rand(i+90)*700;g.fillStyle=`rgba(${FOAM},${.12+rand(i)*.12})`;g.beginPath();g.ellipse(x,y,5+rand(i+5)*6,1.6,0,0,7);g.fill();}
// Shoreline: a wet band and a foam line that breathe with the swell.
const tide=Math.sin(t*.9)*6;g.beginPath();g.moveTo(712+tide,0);g.lineTo(712+tide,700);g.lineTo(735,700);g.lineTo(710,520);g.lineTo(730,350);g.lineTo(715,160);g.lineTo(740,0);g.closePath();g.fillStyle='rgba(60,80,70,.35)';g.fill();
g.beginPath();for(let i=0;i<=35;i++){const y=i*20,x=(y<160?740-25*y/160:y<350?715+15*(y-160)/190:y<520?730-20*(y-350)/170:710+25*(y-520)/180)-6+tide+Math.sin(i*.8+t*2.2)*3;if(i===0)g.moveTo(x,y);else g.lineTo(x,y);}g.strokeStyle=`rgba(${FOAM},.55)`;g.lineWidth=3;g.stroke();
// City: lamp halos, buildings, tower beacon.
g.globalCompositeOperation='lighter';for(const [x,y] of lamps)sprite(GOLD,30,x,y,.30+.06*Math.sin(t*1.7+x));sprite(GOLD,90,1027,190,.20+.04*Math.sin(t*.8));g.globalCompositeOperation='source-over';
const hotspots=!!c.parentElement?.querySelector('.structure-button');
const buildings=[[870,420,100,80,'RESERVE'],[950,125,155,120,'ACADEMY'],[1110,285,60,110,'TOWER']];
for(const [x,y,w,h,name] of buildings){const damaged=(wet&&front>x+20)||(p>=.9&&!fail&&strength-damage<15&&name==='RESERVE');building(x,y,w,h,name,damaged,t);
 const label=name==='TOWER'&&offline()?'TOWER · OFFLINE':name;if(!(hotspots&&name==='RESERVE')){g.font='bold 13px system-ui';g.fillStyle='rgba(8,18,28,.55)';const lw=g.measureText(label).width;roundRect(x-6,y+h+14,lw+12,22,6);g.fill();g.fillStyle=label.endsWith('OFFLINE')?'#ffb4a4':'#f4e8cc';g.fillText(label,x,y+h+30);}
 if(damaged){for(let i=0;i<4;i++)sprite('40,48,56',14+i*5,x+w/2+i*9-15,y-8-flood*25-i*4,.55);}}
g.globalCompositeOperation='lighter';
if(offline())sprite(CORAL,26,1140,262,Math.sin(t*2.2)>.55?.55:.12);
else{const a=t*1.1,beam=g.createRadialGradient(1140,262,0,1140,262,210);beam.addColorStop(0,'rgba(255,236,180,.16)');beam.addColorStop(1,'rgba(255,236,180,0)');g.fillStyle=beam;g.beginPath();g.moveTo(1140,262);g.arc(1140,262,210,a-.12,a+.12);g.closePath();g.fill();sprite(GOLD,22,1140,262,.75);}
g.globalCompositeOperation='source-over';
// The advancing wave: a body of water with layered, noisy foam crests and spray.
const waveAlpha=fail?(.85-.4*smooth((p-.9)/.1)):1-smooth((p-.8)/.15);
// The resting wave (p=1) never changes, so it is composed once and reused while idle.
if(p>0&&waveAlpha>.01&&!(p===1&&waveKey===strength+'|'+damage)){waveKey=p===1?strength+'|'+damage:'';const main=g;g=wg;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,1200,700);g.save();
const water=g.createLinearGradient(Math.max(0,front-380),0,front,0);water.addColorStop(0,'rgba(22,128,159,.10)');water.addColorStop(.55,'rgba(28,140,170,.55)');water.addColorStop(.85,'rgba(60,180,200,.78)');water.addColorStop(1,'rgba(160,232,228,.9)');g.fillStyle=water;g.beginPath();g.moveTo(0,40);g.lineTo(front-190,40);g.quadraticCurveTo(front-90,60,front-55,125);g.bezierCurveTo(front+8,185,front-20,265,front,350);g.bezierCurveTo(front+18,425,front-20,510,front-55,585);g.quadraticCurveTo(front-90,640,front-190,660);g.lineTo(0,660);g.closePath();g.fill();
crest(front,p,t,34,10,'rgba(10,60,84,.35)');crest(front,p,t,26,3,'rgba(150,230,232,.55)');crest(front,p,t,14,4,'rgba(150,230,232,.7)');crest(front,p,t,0,9,'#effff4');
g.globalCompositeOperation='lighter';for(let i=0;i<46;i++){const y=140+(i*37)%420,drift=(t*40+i*13)%60,x=front-24-((i*17)%190)-drift*.3;g.fillStyle=`rgba(${FOAM},${.18+rand(i)*.3})`;g.beginPath();g.ellipse(x,y,6+i%7,2,0,0,7);g.fill();}
if(!hit)for(let i=0;i<26;i++){const y=150+rand(i+11)*400,k=(t*1.6+rand(i))%1,x=front-4+k*26;sprite(FOAM,6,x,y-k*18,(1-k)*.6);}
g.globalCompositeOperation='source-over';g.restore();g.globalCompositeOperation='destination-in';g.fillStyle=feather;g.fillRect(0,0,1200,700);g.globalCompositeOperation='source-over';g=main;}
if(p>0&&waveAlpha>.01){g.globalAlpha=waveAlpha;g.drawImage(waveLayer,0,0);g.globalAlpha=1;}
// Shield barrier: energy fills it from the bottom and its colour follows the remaining energy.
const rgb=energyRGB(energy),frac=clamp(energy/100),breathe=.5+.5*Math.sin(t*2.1);
if(!fail||p<.56){const bow=hit?Math.sin(contact*Math.PI)*20:0,curve=()=>{g.beginPath();g.moveTo(760,80);g.quadraticCurveTo(760+bow,350,760,620);};
 const sputter=fail&&hit?1-.7*smooth((p-.46)/.1)+.15*Math.sin(p*60):1,power=(.35+.65*frac)*sputter;
 g.lineCap='round';g.globalCompositeOperation='lighter';
 curve();g.strokeStyle=`rgba(${rgb},${(.08+.06*breathe)*power})`;g.lineWidth=46+(hit?24*(1-retreat):0);g.stroke();
 curve();g.strokeStyle=`rgba(${rgb},${(.22+.10*breathe)*power})`;g.lineWidth=16+(hit?10*(1-retreat):0);g.stroke();
 curve();g.strokeStyle=`rgba(${rgb},${.95*power})`;g.lineWidth=hit?7:4.5;g.stroke();
 curve();g.strokeStyle=`rgba(255,255,255,${.55*power})`;g.lineWidth=1.5;g.stroke();
 for(let i=0;i<14;i++){const y=100+i*38+((t*22)%38);g.fillStyle=`rgba(${rgb},${(.20+.14*Math.sin(t*3+i))*power})`;g.fillRect(752+bow*Math.sin(Math.PI*(y-80)/540),y-1,16,2);}
 for(let k=0;k<2;k++){const sy=80+540*((t*.22+k*.5)%1);sprite(rgb,30,760+bow*Math.sin(Math.PI*(sy-80)/540),sy,.65*power);}
 g.globalCompositeOperation='source-over';g.lineCap='butt';
 g.font='bold 22px system-ui';const tag=String(Math.round(energy)),tw=g.measureText(tag).width+22;g.fillStyle='rgba(6,18,28,.78)';roundRect(760-tw/2,40,tw,30,15);g.fill();g.strokeStyle=`rgba(${rgb},.9)`;g.lineWidth=2;g.stroke();g.fillStyle=`rgb(${rgb})`;g.fillText(tag,760-tw/2+11,63);
 if(hit){g.globalCompositeOperation='lighter';sprite('226,255,245',150,760,350,.75*(1-smooth((p-.42)/.1)));
  for(let k=0;k<3;k++){const r=clamp((p-.42-k*.04)/.3);if(r<=0||r>=1)continue;g.strokeStyle=`rgba(226,255,245,${.7*(1-r)})`;g.lineWidth=3-k*.6;g.beginPath();g.ellipse(760,350,10+r*60,20+r*250,0,0,7);g.stroke();}
  g.globalCompositeOperation='source-over';
  if(fail){g.strokeStyle='#14222e';g.lineWidth=4;g.beginPath();g.moveTo(757,210);g.lineTo(773,285);g.lineTo(754,330);g.lineTo(770,400);g.lineTo(755,485);g.stroke();g.strokeStyle=`rgba(${CORAL},.9)`;g.lineWidth=1.5;g.stroke();}}}
// Splash: seeded droplets thrown back to sea (deflect) or over the wall (breach), with gravity.
if(hit&&p<.9){const flight=clamp((p-.42)/.45);g.globalCompositeOperation='lighter';for(let i=0;i<110;i++){const dir=fail?1:(i%5===0?1:-1),speed=50+rand(i)*230,lift=60+rand(i+50)*160,x=760+dir*speed*flight,y=140+rand(i+20)*420-lift*Math.sin(flight*Math.PI*.9)+flight*flight*120,s=2+rand(i+30)*4;
 if(i%4===0)sprite(FOAM,8+s*2,x,y,.5*(1-flight));g.fillStyle=i%3?`rgba(${FOAM},${(1-flight)})`:`rgba(150,230,236,${.9*(1-flight)})`;g.beginPath();g.ellipse(x,y,s*.8,s*1.1,-.4,0,7);g.fill();}g.globalCompositeOperation='source-over';}
// Breach: falling shards, water spilling past the wall, a coral pulse; deflect: sparkles along the barrier.
if(fail&&p>=.5&&p<.95){const k=clamp((p-.5)/.45);for(let i=0;i<16;i++){const x=760+(rand(i)-.3)*60+k*40*rand(i+4),y=200+rand(i+8)*300+k*k*160;g.fillStyle=`rgba(${CORAL},${.8*(1-k)})`;g.beginPath();g.moveTo(x,y);g.lineTo(x+6,y+3);g.lineTo(x+1,y+9);g.closePath();g.fill();}}
if(fail&&p>=.56&&p<.85){g.strokeStyle='#b1ffee';g.lineWidth=3;for(let i=0;i<8;i++){const x=765+flood*70,y=100+i*70+flood*35;g.beginPath();g.moveTo(x,y);g.lineTo(x+9,y+24);g.stroke();}}
if(!fail&&p>=.58&&p<1){g.globalCompositeOperation='lighter';for(let i=0;i<14;i++){const y=110+rand(i)*480,tw=Math.sin((p-.58)*24+i*2.1);if(tw>0)sprite(MINT,10,760+(rand(i+3)-.5)*14,y,tw*.8*(1-smooth((p-.9)/.1)));}g.globalCompositeOperation='source-over';}
// Floating numbers: damage at contact, energy arrival for a transfer.
if(hit&&damage&&p<.92){const k=clamp((p-.44)/.4);if(k>0){g.globalAlpha=Math.min(1,k*4)*(1-smooth((k-.6)/.4));g.font='bold 42px system-ui';g.lineJoin='round';g.strokeStyle='rgba(6,16,26,.85)';g.lineWidth=7;g.strokeText('−'+damage,640,330-70*k);g.fillStyle=`rgb(${CORAL})`;g.fillText('−'+damage,640,330-70*k);g.globalAlpha=1;}}
if(fx){const k=clamp((t*1000-fx.start)/900);if(k>=1)fx=null;else if(k>0){g.globalAlpha=Math.min(1,k*5)*(1-smooth((k-.55)/.45));g.font='bold 42px system-ui';g.lineJoin='round';g.strokeStyle='rgba(6,16,26,.85)';g.lineWidth=7;g.strokeText('+'+fx.amount,640,300-60*k);g.fillStyle=`rgb(${GOLD})`;g.fillText('+'+fx.amount,640,300-60*k);g.globalAlpha=1;g.globalCompositeOperation='lighter';sprite(GOLD,90,760,340,.8*(1-k));g.globalCompositeOperation='source-over';}}
g.setTransform(1,0,0,1,0,0);
// Weather: drifting cloud shadows, rain, vignette and, on storm screens, a rare soft lightning glow.
for(let i=0;i<2;i++){const x=((rand(i)*1500+t*(12+i*5))%1500)-150,y=150+rand(i+4)*400;g.globalAlpha=.18;g.drawImage(glow('2,8,16',130),x-130,y-130);}g.globalAlpha=1;
g.strokeStyle=`rgba(200,225,240,${storm?.22:.12})`;g.lineWidth=1.2;g.beginPath();const drops=storm?90:36;for(let i=0;i<drops;i++){const x=(rand(i)*1300+t*90)%1300-50,y=(rand(i+300)*760+t*(520+rand(i+5)*220))%760-30;g.moveTo(x,y);g.lineTo(x-6,y+18);}g.stroke();
if(storm){const flash=(t%11)/11<.016?Math.sin(((t%11)/.18)*Math.PI):0;if(flash>0){g.fillStyle=`rgba(190,215,255,${.10*flash})`;g.fillRect(0,0,1200,700);}}
if(fail&&p>=.55){const pulse=.22*Math.sin(clamp((p-.55)/.4)*Math.PI);if(pulse>0){const vg=g.createRadialGradient(900,350,120,900,350,700);vg.addColorStop(0,'rgba(255,143,122,0)');vg.addColorStop(1,`rgba(255,110,90,${pulse})`);g.fillStyle=vg;g.fillRect(0,0,1200,700);}}
// Status panel: same wording as before, with a coloured state dot.
const label=p===0?'READY · SELECT YOUR DEFENSE':p<.42?'WAVE APPROACHING':p<.56?'CONTACT · PRESSURE ON THE SHIELD':p<.9?(fail?'BREACH · WATER ENTERING DISTRICT':'DEFLECTED · WATER RECEDING'):(fail?'DISTRICT DAMAGED · SHIELD 0':damage+' ABSORBED · SHIELD '+Math.max(0,strength-damage));
const dot=p===0?rgb:p<.42?AMBER:p<.56?FOAM:fail?CORAL:energyRGB(Math.max(0,strength-damage));
g.font='bold 18px system-ui';const lw=Math.max(390,g.measureText(label).width+64);g.fillStyle='rgba(8,24,38,.82)';roundRect(20,20,lw,58,14);g.fill();g.strokeStyle='rgba(160,210,200,.25)';g.lineWidth=1.5;g.stroke();
g.globalCompositeOperation='lighter';sprite(dot,18,44,49,.5+.3*breathe);g.globalCompositeOperation='source-over';g.fillStyle=`rgb(${dot})`;g.beginPath();g.arc(44,49,6,0,7);g.fill();g.fillStyle='#eff8ee';g.fillText(label,60,56);
}
// Transfer: a beam with flowing energy from the reserve vault to the barrier, drawn over the resting frame.
function transfer(v,amount,t){draw(0,t);const pt=k=>[(1-k)*(1-k)*920+2*(1-k)*k*820+k*k*760,(1-k)*(1-k)*420+2*(1-k)*k*390+k*k*340];
g.lineCap='round';g.beginPath();g.moveTo(920,420);g.quadraticCurveTo(820,390,760,340);g.globalCompositeOperation='lighter';g.strokeStyle='rgba(239,207,134,.16)';g.lineWidth=30;g.stroke();g.strokeStyle='rgba(239,207,134,.35)';g.lineWidth=10;g.stroke();g.setLineDash([12,14]);g.lineDashOffset=-t*110;g.strokeStyle='rgba(255,242,200,.95)';g.lineWidth=3.5;g.stroke();g.setLineDash([]);g.lineCap='butt';g.globalCompositeOperation='source-over';
g.globalCompositeOperation='lighter';sprite(GOLD,60,920,440,.6*(1-v));for(let i=0;i<26;i++){const k=clamp(v*1.25-i*.018);if(k<=0||k>=1)continue;const [x,y]=pt(k),j=rand(i)*8-4;sprite(GOLD,i===0?26:10,x+j,y+j*.6,i===0?1:.7*(1-i/26));}
const [ox,oy]=pt(clamp(v));sprite('255,242,186',20,ox,oy,1);if(v>.85)sprite(GOLD,120,760,340,(v-.85)/.15*.7);g.globalCompositeOperation='source-over';}
// Ambient loop: the resting frame keeps moving while idle, only when visible, in view and motion is allowed.
let ambient=0,last=0,inView=true,waveKey='';
const io='IntersectionObserver' in window?new IntersectionObserver(entries=>{inView=entries.some(e=>e.isIntersecting);wake();}):null;io?.observe(c);
function loop(now){ambient=0;if(!c.isConnected){io?.disconnect();return;}if(reduce.matches||document.hidden||!inView||next.dataset.animating==='true')return;if(now-last>=48){last=now;draw(lastP,now/1000);}ambient=requestAnimationFrame(loop);}
function wake(){if(!ambient&&c.isConnected&&!reduce.matches&&!document.hidden&&inView&&next.dataset.animating!=='true')ambient=requestAnimationFrame(loop);}
waker=wake;
function idle(){strength=Number(root.querySelector('#shield').textContent);lastP=0;draw(0);say('Prepare your rule, then advance one block.');wake();}idle();const original=next.onclick;const storm=next.id==='storm-next';let lastPlanning='';const planningObserver=new MutationObserver(()=>{if(!c.isConnected){planningObserver.disconnect();return;}const phase=source(root.querySelector('#phase'));const value=root.querySelector('#shield')?.textContent;const key=phase+'|'+value;if(next.dataset.animating!=='true'&&['PLANNING','REGISTERED','NOT REGISTERED'].includes(phase)&&key!==lastPlanning){lastPlanning=key;strength=Number(value);reserve=Number(root.querySelector('#reserve')?.textContent)||reserve;reserveCap=Math.max(reserveCap,reserve);lastP=0;draw(0);}});planningObserver.observe(root,{childList:true,subtree:true});
next.onclick=e=>{if(next.dataset.animating==='true')return;const before=Number(root.querySelector('#shield').textContent),reserveBefore=Number(root.querySelector('#reserve').textContent);const pending=source(root.querySelector('#phase')).includes('QUEUED');original(e);const after=Number(root.querySelector('#shield').textContent),reserveAfter=Number(root.querySelector('#reserve').textContent),transferred=Math.max(0,reserveBefore-reserveAfter);const endDisabled=next.disabled;const result=root.querySelector('#status').textContent;
const log=source(root.querySelector('#log'));const current=log.slice(Math.max(0,log.lastIndexOf('— BLOCK')));const match=current.match(/Storm drains (\d+) shield energy/);damage=next.id==='lesson-step'?Number(next.dataset.drain||0):storm?(match?Number(match[1]):0):(pending?0:15);const incoming=Math.min(100,before+transferred);const hasTransfer=transferred>0;
function finishFrame(){strength=damage?incoming:after;reserve=reserveAfter;reserveCap=Math.max(reserveCap,reserveBefore,reserve);lastP=damage?1:0;draw(lastP);say(result);if(root.querySelector('#final-finish')){root.dataset.finalScene=c.toDataURL('image/png');}}

fx=null;
// Saved action replay uses synthetic clicks: rebuild state without animation or delays.
if(!e?.isTrusted||reduce.matches){finishFrame();return;}
cancelAnimationFrame(ambient);ambient=0;
next.dataset.animating='true';next.disabled=true;root.dataset.visualBusy='true';const token={};owner=token;const story=root.querySelector('#story');const storyVisible=story&&!story.hidden;if(storyVisible)story.hidden=true;const began=performance.now(),transferTime=hasTransfer?850:0,duration=transferTime+(damage?2400:400);strength=before;reserve=reserveBefore;reserveCap=Math.max(reserveCap,reserveBefore);
function tick(now){if(!c.isConnected){cancelAnimationFrame(frame);
 // Retry or Back during an animation replaces the screen; release the busy state this animation set.
 if(owner===token){owner=null;if(root.dataset.visualBusy==='true')delete root.dataset.visualBusy;}return;}
const elapsed=now-began,p=Math.min(1,elapsed/duration),t=now/1000;if(hasTransfer&&elapsed<transferTime){strength=before;const v=Math.min(1,elapsed/transferTime);reserve=reserveBefore-transferred*v;transfer(v,transferred,t);say('1 · Queued transfer · '+transferred+' energy from reserve to shield');}else{strength=damage?incoming:after;reserve=reserveAfter;if(hasTransfer&&!fx)fx={amount:transferred,start:began+transferTime};draw(damage?Math.min(1,(elapsed-transferTime)/2400):0,t);say(damage?'Storm impact · '+damage+' energy · Condition evaluation follows the impact.':result);}
if(p<1){frame=requestAnimationFrame(tick);return;}next.dataset.animating='false';if(owner===token)owner=null;delete root.dataset.visualBusy;next.disabled=endDisabled;if(storyVisible)story.hidden=false;finishFrame();wake();}frame=requestAnimationFrame(tick);

};}
let owner=null,waker=null;
document.addEventListener('visibilitychange',()=>waker?.());
reduce.addEventListener?.('change',()=>waker?.());
new MutationObserver(()=>{install();if(root.querySelector('#journey-summary')&&root.dataset.finalScene&&!root.querySelector('.final-city-image')){const img=document.createElement('img');img.className='final-city-image';img.src=root.dataset.finalScene;img.alt='The city after your final storm impact';img.style.cssText='width:100%;display:block;border-radius:8px;margin:18px 0';root.querySelector('#journey-summary').before(img);}}).observe(root,{childList:true,subtree:true});install();
})();
