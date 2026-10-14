/* Academy effects: celebrations, number pops and highlights. Reads game state only; never changes numbers, text, timing or controls. */
(()=>{'use strict';
const root=document.querySelector('#chapter');if(!root)return;
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const source=el=>el?(window.ResonanceI18n?window.ResonanceI18n.source(el):el.textContent).trim():'';
const value=id=>{const el=document.getElementById(id);return el?Number(el.textContent):NaN;};
const css=document.createElement('style');css.textContent=`
#chapter .nodes .node{position:relative;transition:box-shadow .35s,border-color .35s}
#chapter .node:has(#reserve){border-radius:14px;border-color:#8f7d55;background:radial-gradient(ellipse at 50% 115%,rgba(239,207,134,calc(.06 + var(--fx-fill,.5)*.24)),transparent 70%),linear-gradient(160deg,#1b2c3d,#121f2d)}
#chapter .node:has(#reserve)::before{content:'';position:absolute;top:8px;right:8px;width:20px;height:20px;border-radius:50%;background:conic-gradient(#efcf86 calc(var(--fx-fill,.5)*360deg),rgba(239,207,134,.16) 0);-webkit-mask:radial-gradient(circle,transparent 5px,#000 6px);mask:radial-gradient(circle,transparent 5px,#000 6px);box-shadow:0 0 10px rgba(239,207,134,calc(var(--fx-fill,.5)*.5))}
#chapter .node:has(#shield){border-radius:14px;background:linear-gradient(160deg,#16303a,#111f2b)}
#chapter .node:has(#shield)[data-fx-level=high]{border-color:#6fbfa8;box-shadow:inset 0 0 18px rgba(154,255,223,.08)}
#chapter .node:has(#shield)[data-fx-level=mid]{border-color:#c9a560;box-shadow:inset 0 0 18px rgba(255,210,122,.08)}
#chapter .node:has(#shield)[data-fx-level=low]{border-color:#d07a6a;box-shadow:inset 0 0 18px rgba(255,143,122,.12)}
#chapter .node[data-fx-delta]::after{content:attr(data-fx-delta);content:attr(data-fx-delta) / "";position:absolute;top:50%;right:10px;margin-top:-11px;font:700 22px/1 system-ui,sans-serif;color:var(--fx-tone,#ffd99a);text-shadow:0 2px 8px #000c;pointer-events:none;animation:fx-pop 1.5s ease-out forwards}
#chapter .node.fx-gain{animation:fx-gain 1s ease-out}#chapter .node.fx-loss{animation:fx-loss 1s ease-out}#chapter .node.fx-spend{animation:fx-spend 1s ease-out}
#chapter .map.fx-alarm{animation:fx-alarm 1.3s ease-out}
#chapter[data-fx-phase=ready]:not([data-visual-busy=true]) :is(#next,#storm-next,#lesson-step):not(:disabled){animation:fx-next 2s ease-in-out 4}
#chapter:not([data-visual-busy=true]) #lesson-quiz:not([hidden]),#chapter #quick-finish,#chapter #mastery-start{animation:fx-next 2s ease-in-out 4}
#chapter[data-fx-phase=queued]:not([data-visual-busy=true]) #phase{box-shadow:0 0 0 1px rgba(255,210,122,.6);animation:fx-armed 1.4s ease-in-out 5}
#chapter[data-fx-phase=executed]:not([data-visual-busy=true]) #phase{animation:fx-flash 1.1s ease-out}
#chapter[data-fx-phase=survived]:not([data-visual-busy=true]) #phase{animation:fx-saved 1.6s ease-out;box-shadow:0 0 0 1px #8fe0c3}
#chapter[data-fx-phase=failed]:not([data-visual-busy=true]) #phase{animation:fx-fail 1.2s ease-out;box-shadow:0 0 0 1px #d98a7a}
#chapter .storm-tick{transition:background .3s,box-shadow .3s,border-color .3s}
#chapter .storm-tick.current{box-shadow:0 0 0 1px #f3d59f,0 0 14px rgba(220,183,120,.55)}
#chapter .storm-tick.past{background:rgba(163,215,206,.12);color:#cfe9e2}
#chapter[data-fx-phase=failed] .storm-tick.current{background:#d98a7a;border-color:#ffb4a4;box-shadow:0 0 14px rgba(255,143,122,.6)}
#chapter[data-fx-phase=survived] .storm-tick{border-color:#8fe0c3}
#chapter .mastery-option{animation:fx-in .28s ease-out both}#chapter .mastery-option:nth-child(2){animation-delay:.05s}#chapter .mastery-option:nth-child(3){animation-delay:.1s}#chapter .mastery-option:nth-child(4){animation-delay:.15s}
#chapter .mastery-option.correct{position:relative;animation:fx-correct .7s ease-out both;box-shadow:0 0 0 2px #8fe0c3,0 0 18px rgba(154,255,223,.35)}
#chapter .mastery-option.correct::after{content:'';position:absolute;right:16px;top:50%;width:8px;height:15px;margin-top:-10px;border:solid #8fe0c3;border-width:0 3px 3px 0;transform:rotate(45deg);animation:fx-in .35s ease-out both}
#chapter .mastery-option.wrong{animation:fx-shake .4s ease-out;box-shadow:0 0 0 2px #d98a7a,0 0 16px rgba(255,143,122,.3)}
#chapter :is(#mastery-content,#lesson-options):has(.wrong) .mastery-option.correct{animation:none;box-shadow:0 0 0 1px #8fe0c3}
#chapter #lesson-award,#chapter .rm-card{animation:fx-award 1.6s ease-out}
#lesson-briefing[open]{animation:fx-in .3s ease-out}#lesson-briefing[open]::backdrop{animation:fx-fade .3s ease-out}
#lesson-briefing:has(#briefing-read:checked) #briefing-continue{box-shadow:0 0 0 2px #f3d59f,0 0 18px rgba(243,213,159,.55)}
#chapter .final-city-image.fx-dawn{animation:fx-dawn 2.8s ease-out}
.fx-layer{position:fixed;inset:0;overflow:hidden;pointer-events:none;z-index:30}
.fx-layer canvas{position:absolute;inset:0;width:100%;height:100%}
.fx-toast{position:absolute;left:50%;bottom:18px;display:flex;gap:14px;align-items:center;padding:10px 16px;border:1px solid #3b4f57;border-radius:12px;background:rgba(10,20,28,.92);color:#eef3f0;font:600 13px/1.2 system-ui,sans-serif;box-shadow:0 12px 30px #0008;transform:translateX(-50%);animation:fx-toast 2.6s ease-out forwards;white-space:nowrap}
.fx-toast b{font-weight:700}.fx-toast .gain{color:#9affdf}.fx-toast .loss{color:#ff8f7a}.fx-toast .spend{color:#efcf86}
.fx-toast.win{border-color:#8fe0c3;box-shadow:0 12px 30px #0008,0 0 26px rgba(154,255,223,.35)}.fx-toast.fail{border-color:#d98a7a;box-shadow:0 12px 30px #0008,0 0 26px rgba(255,143,122,.35)}
@keyframes fx-pop{0%{opacity:0;transform:translateY(8px) scale(.8)}15%{opacity:1;transform:translateY(-2px) scale(1.08)}70%{opacity:1}100%{opacity:0;transform:translateY(-20px)}}
@keyframes fx-gain{0%{box-shadow:0 0 6px 1px rgba(154,255,223,.2)}25%{box-shadow:0 0 26px 4px rgba(154,255,223,.55)}100%{box-shadow:0 0 30px 6px rgba(154,255,223,0)}}
@keyframes fx-loss{0%{box-shadow:0 0 6px 1px rgba(255,143,122,.2)}25%{box-shadow:0 0 26px 4px rgba(255,143,122,.6)}100%{box-shadow:0 0 30px 6px rgba(255,143,122,0)}}
@keyframes fx-spend{0%{box-shadow:0 0 6px 1px rgba(239,207,134,.2)}25%{box-shadow:0 0 26px 4px rgba(239,207,134,.55)}100%{box-shadow:0 0 30px 6px rgba(239,207,134,0)}}
@keyframes fx-alarm{0%,100%{box-shadow:0 0 0 0 rgba(255,110,90,0)}30%{box-shadow:0 0 0 1px rgba(255,110,90,.7),0 0 44px 6px rgba(255,110,90,.4)}}
@keyframes fx-next{0%,100%{box-shadow:0 0 0 0 rgba(243,213,159,0)}50%{box-shadow:0 0 0 1px rgba(243,213,159,.45),0 0 20px 2px rgba(243,213,159,.35)}}
@keyframes fx-armed{0%,100%{box-shadow:0 0 0 1px rgba(255,210,122,.4)}50%{box-shadow:0 0 0 2px rgba(255,210,122,.9),0 0 16px rgba(255,210,122,.5)}}
@keyframes fx-flash{0%{box-shadow:0 0 18px 3px rgba(255,217,154,.7);background-color:rgba(255,217,154,.3)}100%{box-shadow:0 0 24px 6px rgba(255,217,154,0)}}
@keyframes fx-saved{0%{box-shadow:0 0 22px 4px rgba(154,255,223,.75)}100%{box-shadow:0 0 0 1px #8fe0c3}}
@keyframes fx-fail{0%{box-shadow:0 0 22px 4px rgba(255,143,122,.75)}100%{box-shadow:0 0 0 1px #d98a7a}}
@keyframes fx-in{from{opacity:.15}to{opacity:1}}@keyframes fx-fade{from{opacity:0}to{opacity:1}}
@keyframes fx-correct{0%{box-shadow:0 0 24px 5px rgba(154,255,223,.65)}100%{box-shadow:0 0 0 2px #8fe0c3,0 0 18px rgba(154,255,223,.35)}}
@keyframes fx-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(5px)}60%{transform:translateX(-3px)}80%{transform:translateX(2px)}}
@keyframes fx-award{0%{box-shadow:0 0 10px 2px rgba(255,217,154,.3)}25%{box-shadow:0 0 34px 6px rgba(255,217,154,.55)}100%{box-shadow:0 0 40px 10px rgba(255,217,154,0)}}
@keyframes fx-dawn{0%{filter:brightness(.55) saturate(.6) hue-rotate(-20deg)}100%{filter:none}}
@keyframes fx-toast{0%{opacity:0;transform:translate(-50%,12px)}10%,80%{opacity:1;transform:translate(-50%,0)}100%{opacity:0;transform:translate(-50%,8px)}}
@media(max-width:640px){#chapter .node[data-fx-delta]::after{right:6px;margin-top:-9px;font-size:17px}#chapter .node:has(#reserve)::before{top:6px;right:6px;width:14px;height:14px;-webkit-mask:radial-gradient(circle,transparent 3.5px,#000 4.5px);mask:radial-gradient(circle,transparent 3.5px,#000 4.5px)}}
@media(prefers-reduced-motion:reduce){#chapter .node[data-fx-delta]::after,.fx-toast{display:none}#chapter :is(.node,.map,#phase,#next,#storm-next,#lesson-step,#lesson-quiz,#quick-finish,#mastery-start,.final-city-image){animation:none!important}}
`;document.head.append(css);
// Phase → mood. English source text, so Turkish play behaves the same.
const moods={'NOT REGISTERED':'idle',PLANNING:'idle',REGISTERED:'ready',WAITING:'ready','TRIGGERED → QUEUED':'queued',EXECUTED:'executed','ESSENTIALS FUNDED':'executed','RESERVE PROTECTED':'executed','EXECUTION FAILED':'failed','DEFENSE FAILED':'failed','RESERVE BREACHED':'failed','STORM SURVIVED':'survived','CITY SAVED':'survived'};
const outcome=m=>m==='executed'||m==='failed'||m==='survived';
const caps=new WeakMap();
// Outcome moods are shown only by play(), after the block has played out; restores and replays rest at 'settled'.
function sync(){
 const phase=document.getElementById('phase');let mood=phase?moods[source(phase)]:undefined;if(outcome(mood)&&root.dataset.fxPhase!==mood)mood='settled';
 if(mood){if(root.dataset.fxPhase!==mood)root.dataset.fxPhase=mood;}else if(root.dataset.fxPhase)delete root.dataset.fxPhase;
 const r=document.getElementById('reserve'),s=document.getElementById('shield');
 if(r&&r.parentElement){const n=Number(r.textContent),cap=Math.max(40,caps.get(r)||0,n);caps.set(r,cap);const fill=String(Math.round(Math.max(0,Math.min(1,n/cap))*100)/100);if(r.parentElement.style.getPropertyValue('--fx-fill')!==fill)r.parentElement.style.setProperty('--fx-fill',fill);}
 if(s&&s.parentElement){const n=Number(s.textContent),level=n>=40?'high':n>=20?'mid':'low';if(s.parentElement.dataset.fxLevel!==level)s.parentElement.dataset.fxLevel=level;}
}
let queued=false;new MutationObserver(()=>{if(!queued){queued=true;requestAnimationFrame(()=>{queued=false;sync();});}}).observe(root,{childList:true,subtree:true,characterData:true});sync();
// One fixed, click-through layer for particles and the phone toast; appended, never prepended.
let layer=null;function fxLayer(){if(!layer||!layer.isConnected){layer=document.createElement('div');layer.className='fx-layer';layer.setAttribute('aria-hidden','true');document.body.append(layer);}return layer;}
// The first candidate that is actually on screen, so a phone player scrolled down to the controls still sees the celebration.
function anchor(...els){for(const el of els){const r=el?.getBoundingClientRect?.();if(r&&r.width>0&&r.bottom>30&&r.top<innerHeight-30)return r;}return null;}
function burst(rect,kind){
 if(!rect||rect.width<=0)return;const box=fxLayer(),c=document.createElement('canvas'),w=innerWidth,h=innerHeight;c.width=w;c.height=h;box.append(c);const g=c.getContext('2d');
 const colors=kind==='confetti'?['#ffd99a','#9affdf','#f3d59f','#ff8f7a','#cfe9ff']:['#9affdf','#ffd99a','#e9fff8'];
 const parts=Array.from({length:kind==='confetti'?70:40},(_,i)=>{const a=Math.random()*Math.PI*2,sp=kind==='confetti'?3+Math.random()*5:1.5+Math.random()*3.5;return {x:rect.left+rect.width*(.25+Math.random()*.5),y:rect.top+rect.height*(kind==='confetti'?.35:.5),vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-(kind==='confetti'?4:1),r:Math.random()*Math.PI,vr:(Math.random()-.5)*.3,s:kind==='confetti'?4+Math.random()*5:2+Math.random()*3,c:colors[i%colors.length]};});
 const start=performance.now(),life=kind==='confetti'?1900:1300;
 (function frame(now){if(!c.isConnected)return;const k=(now-start)/life;if(k>=1){c.remove();return;}g.clearRect(0,0,w,h);for(const p of parts){p.x+=p.vx;p.y+=p.vy;p.vy+=kind==='confetti'?.16:.03;p.vx*=.985;p.r+=p.vr;g.globalAlpha=1-k*k;g.fillStyle=p.c;if(kind==='confetti'){g.save();g.translate(p.x,p.y);g.rotate(p.r);g.fillRect(-p.s,-p.s*.4,p.s*2,p.s*.8);g.restore();}else{g.beginPath();g.arc(p.x,p.y,p.s*(1-k*.5),0,7);g.fill();}}requestAnimationFrame(frame);})(start);
 setTimeout(()=>c.remove(),life+500);
}
// Reserve going down is a spend (gold), not a loss; the shield going down is damage (coral).
function pop(id,delta){const el=document.getElementById(id),node=el?.parentElement;if(!node||!delta)return;const tone=delta>0?'gain':id==='reserve'?'spend':'loss',label=(delta>0?'+':'−')+Math.abs(delta);node.removeAttribute('data-fx-delta');node.classList.remove('fx-gain','fx-loss','fx-spend');void node.offsetWidth;node.style.setProperty('--fx-tone',tone==='gain'?'#9affdf':tone==='spend'?'#efcf86':'#ff8f7a');node.dataset.fxDelta=label;node.classList.add('fx-'+tone);setTimeout(()=>{if(node.dataset.fxDelta===label){node.removeAttribute('data-fx-delta');node.classList.remove('fx-gain','fx-loss','fx-spend');}},1600);}
function toast(before,after,mood){const map=root.querySelector('.tutorial-canvas');if(!map)return;const r=map.getBoundingClientRect();if(r.bottom>40&&r.top<innerHeight-40)return;
 const rows=[['SHIELD',before.shield,after.shield,'loss'],['RESERVE',before.reserve,after.reserve,'spend']].filter(([,a,b])=>Number.isFinite(a)&&Number.isFinite(b));if(!rows.length)return;
 const box=fxLayer();box.querySelectorAll('.fx-toast').forEach(t=>t.remove());
 const t=document.createElement('div');t.className='fx-toast'+(mood==='survived'?' win':mood==='failed'?' fail':'');for(const [label,a,b,down] of rows){const s=document.createElement('span'),name=document.createElement('span'),num=document.createElement('b');name.textContent=label;num.textContent=' '+a+' → '+b;num.className=b>a?'gain':b<a?down:'';num.dataset.i18nIgnore='';s.append(name,num);t.append(s);}
 box.append(t);setTimeout(()=>t.remove(),2700);}
function snapshot(){const s=document.getElementById('shield');return {el:s,shield:value('shield'),reserve:value('reserve'),phase:source(document.getElementById('phase')),quiz:!!document.querySelector('#lesson-quiz:not([hidden])')};}
function play(before,after,id){
 const mood=moods[after.phase];if(outcome(mood)&&!reduce.matches){delete root.dataset.fxPhase;void root.offsetWidth;}
 if(outcome(mood))root.dataset.fxPhase=mood;sync();if(reduce.matches)return;
 // A re-rendered chapter (new wave, Retry) has new number elements; its values are not a change.
 const same=before.el&&before.el===after.el,ds=after.shield-before.shield,dr=after.reserve-before.reserve;
 if(same){if(Number.isFinite(dr)&&dr)pop('reserve',dr);if(Number.isFinite(ds)&&ds)setTimeout(()=>pop('shield',ds),dr?220:0);}
 const map=root.querySelector('.map'),rect=anchor(root.querySelector('.tutorial-canvas'),map,document.getElementById('phase'),document.getElementById(id));
 if(mood==='survived'&&moods[before.phase]!=='survived')burst(rect,'confetti');
 else if(mood==='failed'&&moods[before.phase]!=='failed'||same&&after.shield===0&&before.shield>0){map?.classList.remove('fx-alarm');void map?.offsetWidth;map?.classList.add('fx-alarm');setTimeout(()=>map?.classList.remove('fx-alarm'),1400);}
 else if(after.quiz&&!before.quiz)burst(rect,'sparkle');
 else if(mood==='executed'&&before.phase!==after.phase)burst(rect,'sparkle');
 if(same&&/^(next|storm-next|lesson-step)$/.test(id))toast(before,after,mood);
}
// Effects are armed only by a real click on a button that moves the game forward, so replays, restores, Retry and Hint stay silent.
const advancing=/^(next|storm-next|lesson-step|final-balanced|final-reserve)$/,award=/^(lesson-answer-next|mastery-next|final-finish|quick-finish)$/;
let armed=null,pending=null;
document.addEventListener('click',e=>{if(!e.isTrusted||document.body.dataset.restoringJourney==='true'){armed=null;return;}const b=e.target.closest?.('button');armed=b&&root.contains(b)&&(advancing.test(b.id)||award.test(b.id))?{id:b.id,before:snapshot()}:null;},true);
document.addEventListener('click',e=>{const a=armed;armed=null;if(!a||!e.isTrusted)return;const b=e.target.closest?.('button');if(!b||b.id!==a.id)return;
 if(award.test(a.id)){requestAnimationFrame(()=>{const card=document.querySelector('#lesson-award,.rm-card,#journey-summary,#quick-result');if(!card||reduce.matches)return;const img=document.querySelector('#chapter .final-city-image');if(a.id==='final-finish'&&img)img.classList.add('fx-dawn');const secured=/^CITY SECURED/.test(source(document.getElementById('journey-outcome')));burst(anchor(img,card,document.getElementById('journey-outcome')),a.id==='final-finish'&&secured?'confetti':'sparkle');});return;}
 const after=snapshot();if(root.dataset.visualBusy==='true'){if(!pending)pending={before:a.before,after,id:a.id};}else play(a.before,after,a.id);});
// When the block finishes, play only if nothing (Retry, Back, a new wave) changed the state in between.
new MutationObserver(()=>{if(pending&&root.dataset.visualBusy!=='true'){const p=pending,now=snapshot();pending=null;if(now.el===p.after.el&&now.shield===p.after.shield&&now.reserve===p.after.reserve&&now.phase===p.after.phase)play(p.before,now,p.id);}}).observe(root,{attributes:true,attributeFilter:['data-visual-busy']});
})();
