(()=>{
'use strict';const $=id=>document.getElementById(id),root=$('workspace'),ece=document.body.dataset.vaultCharacter==='1';
// Arrange existing controls; preserve handlers, values, ownership checks and approval flow.
const guide=$('first-run-guide');root.prepend(guide);
const tools=document.createElement('section');tools.id='more-practice-tools';tools.style.marginTop='28px';
const heading=document.createElement('h2');heading.textContent='When you want to explore more';
const intro=document.createElement('p');intro.textContent='Your first practice needs only a template, your review and the next-step button. These optional tools are here when you need them.';tools.append(heading,intro);root.append(tools);
function move(id){const el=$(id);if(el)tools.append(el);}
move('scenario-library');move(ece?'custom-scenario':'price-sequence');
if(ece){
 const templates=$('template-heading').closest('section');const scenarios=$('scenarios');
 scenarios.before(templates);templates.style.marginBottom='16px';
 const alternatives=document.createElement('details');alternatives.id='alternate-scenarios';alternatives.className='panel';
 const summary=document.createElement('summary');summary.textContent='Choose a different scenario with its default settings';alternatives.append(summary);scenarios.before(alternatives);alternatives.append(scenarios);tools.append(alternatives);
 move('ece-ai');
 const saved=document.querySelector('details.saved-policy');if(saved)tools.append(saved);
}else{
 const bridge=$('lesson-bridge');if(bridge){const d=document.createElement('details');d.id='academy-recap';d.className='panel';const summary=document.createElement('summary');summary.textContent='Revisit the academy concepts';d.append(summary,bridge);tools.append(d);}
}
const nav=document.createElement('p');nav.className='small';const link=document.createElement('a');link.href='#more-practice-tools';link.textContent='Looking for saved scenarios or custom practice? →';nav.append(link);guide.append(nav);
const style=document.createElement('style');style.textContent='#workspace > * + *{margin-top:18px}#more-practice-tools > details{margin:14px 0}#more-practice-tools summary{font-weight:600}#first-run-guide ol{display:flex;flex-wrap:wrap;gap:12px 32px;padding-left:24px}#academy-recap #lesson-bridge{border:0;padding:12px 0}#scenario-library input{max-width:100%}';document.head.append(style);
})();
