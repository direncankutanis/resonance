(()=>{
'use strict';
const $=id=>document.getElementById(id),ece=document.body.dataset.vaultCharacter==='1',workspace=$('workspace');
const box=document.createElement('section');box.id='first-run-guide';box.className='panel';
box.innerHTML='<div class="eyebrow">ACADEMY → LEARNING PASS → FIRST PRACTICE</div><h2>Your first practice, in three steps.</h2><ol><li>Choose an editable learning template.</li><li>Review its limits and confirm yourself.</li><li>Advance the demo and explain the result.</li></ol><p id="journey-status" role="status"></p><button type="button" id="journey-skip" class="secondary">Hide guide</button><div id="journey-next" hidden><h3>What would you change?</h3><p id="journey-reflection"></p><button type="button" id="journey-again">Change one limit & try again</button> <a href="../resonance-playable-v1.html">Choose another character at the academy →</a></div>';
workspace.prepend(box);
const list=box.querySelector('ol');let skipped=false,done=false;
$('journey-status').textContent=ece?'Choose Weekly pacing below. It fills a practice policy; you still review it.':'Choose A successful purchase under Guided practice below. Nothing starts until you confirm.';
$('journey-skip').onclick=()=>{skipped=!skipped;list.hidden=skipped;$('journey-status').hidden=skipped;$('journey-skip').textContent=skipped?'Show guide':'Hide guide';};
function update(stage,text,finished){
 done=finished;[...list.children].forEach((li,i)=>{if(i===stage)li.setAttribute('aria-current','step');else li.removeAttribute('aria-current');li.style.fontWeight=i===stage?'700':'400';});
 $('journey-status').textContent=text;$('journey-next').hidden=!finished;
 $('journey-reflection').textContent=ece?'Try changing only the weekly cap. Keep the same scenario to compare both completed policies. More remaining cash can mean fewer assets purchased.':'Try the price-reversal template next. A condition that was true earlier must still qualify at execution. No outcome guarantees a profit.';
}
window.addEventListener(ece?'resonance:protection-context':'resonance:vault-state',({detail:d})=>{
 const state=ece?d.mode:d.state,review=ece?state==='review':d.reviewing;
 const finished=ece?state==='finished':['completed','failed','expired','cancelled'].includes(state);
 if(finished)update(2,'Practice finished. Read the outcome, then change one limit or return to the academy.',true);
 else if(review)update(1,'Review your chosen limits. Confirm only when you can explain what the rule is allowed to do.',false);
 else if(['active','waiting','queued'].includes(state))update(2,'Advance the demo yourself. Read each decision before continuing; confirming did not guarantee a purchase.',false);
 else update(0,'Choose a template or edit the fields. Review is the next step; no practice starts automatically.',false);
});
$('journey-again').onclick=()=>{if(!done)return;const target=$(ece?'revise-protection':'new-rule');if(target&&!target.disabled)target.click();$(ece?'weekly':'limit').focus();};
new MutationObserver(()=>{if(workspace.hidden){done=false;$('journey-next').hidden=true;}}).observe(workspace,{attributes:true,attributeFilter:['hidden']});
})();
