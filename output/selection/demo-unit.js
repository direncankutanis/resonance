/* Fictional denomination, not an exchange rate, token contract or wallet network. */
(()=>{'use strict';
const key='resonance.demo-unit.v1',valid=u=>u==='RLO'||u==='rloUSDT';
let unit='RLO';try{const saved=localStorage.getItem(key);if(valid(saved))unit=saved;}catch{}
const text=s=>String(s).replace(/\bRLO\b/g,unit);
window.ResonanceUnit={get:()=>unit,text,record:data=>({...data,demoUnit:unit,realFunds:false}),validate:u=>{if(u!==undefined&&!valid(u))throw Error('Unknown demo budget unit.');return u||'RLO';},require:u=>{if((u||'RLO')!==unit)throw Error('This plan uses Demo '+(u||'RLO')+'. Choose that budget unit first; no currency conversion is performed.');},storageKey:k=>unit==='RLO'?k:k+'.rloUSDT',prompt:s=>String(s).replace(/\brloUSDT\b/g,'RLO')};
function mount(){
const panel=document.createElement('section');panel.id='demo-unit-control';panel.setAttribute('aria-label','Demo budget unit');panel.style.cssText='margin:16px 0;padding:14px;border:1px solid #60766e;border-radius:12px;font:14px/1.5 system-ui;max-width:100%;';
panel.innerHTML='<label for="demo-unit">Demo budget unit </label><select id="demo-unit" style="font:inherit;padding:8px;max-width:100%"><option value="RLO">Demo RLO</option><option value="rloUSDT">Demo rloUSDT</option></select><p style="margin:8px 0 0">Fictional units only. rloUSDT is a demo accounting label, not an issued stablecoin or a guaranteed dollar value. Switching starts a fresh page session with the same example numbers, not a currency conversion. Saved plans keep their original unit. NFT minting still uses Sepolia ETH.</p><p id="demo-unit-status" role="status"></p>';
(document.querySelector('main')||document.body).prepend(panel);const select=panel.querySelector('select');select.value=unit;
select.onchange=()=>{const next=select.value;if(next===unit)return;if(!confirm('Switch to Demo '+next+'? This reloads the page and clears unsaved inputs and current simulation results. Saved plans and learning progress remain. No exchange or token transfer occurs.')){select.value=unit;return;}try{localStorage.setItem(key,next);location.reload();}catch{select.value=unit;panel.querySelector('#demo-unit-status').textContent='Browser storage is unavailable. The budget unit was not changed.';}};
// Render authored denomination labels, including later simulation output. Never touch scripts or entered values.
const excluded=n=>n.parentElement?.closest('#demo-unit-control,script,style,textarea,input,[data-unit-fixed]');
function render(root){if(root.nodeType===3){if(!excluded(root)&&root.data.includes('RLO'))root.data=text(root.data);return;}if(root.nodeType!==1||root.closest('#demo-unit-control,script,style,textarea,input,[data-unit-fixed]'))return;const walk=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);while(walk.nextNode())render(walk.currentNode);for(const e of root.querySelectorAll('[placeholder],[aria-label]')){if(e.closest('#demo-unit-control,[data-unit-fixed]'))continue;for(const attr of ['placeholder','aria-label'])if(e.hasAttribute(attr))e.setAttribute(attr,text(e.getAttribute(attr)));}}
if(window.ResonanceI18n){window.ResonanceI18n.refresh();return;}
if(unit!=='RLO'){render(document.body);new MutationObserver(changes=>{for(const c of changes){if(c.type==='characterData')render(c.target);else for(const n of c.addedNodes)render(n);}}).observe(document.body,{childList:true,subtree:true,characterData:true});}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
