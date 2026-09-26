(() => {
  'use strict';
  const $=id=>document.getElementById(id),engine=window.ResonanceSchedule;
  let state=engine.initial(),draft=null;
  const money=n=>(n/100).toFixed(2);
  const amount=id=>{const v=$(id).value.trim();return /^\d+(?:\.\d{1,2})?$/.test(v)?Math.round(Number(v)*100):NaN;};
  function render() {
    for(const key of ['available','reserved','spent'])$(key).textContent=money(state[key]);
    $('owned').textContent=state.units.toFixed(4);
    $('state').textContent=state.state.toUpperCase();
    $('step').textContent='STEP '+state.step;
    const active=engine.active(state);
    for(const id of ['amount','count','interval','limit','review'])$(id).disabled=active||!!draft;
    $('advance').disabled=!active;$('cancel').disabled=!active;$('pause').disabled=!active;
    $('pause').textContent=state.state==='paused'?'Resume schedule':'Pause schedule';
    $('review-box').hidden=!draft;
    $('schedule-summary').textContent=active?'Next opportunity: step '+(state.plan.start+(state.attempts+1)*state.plan.interval)+' · '+(state.plan.count-state.attempts)+' remaining.':'Review a schedule to begin another experiment.';
    $('results').textContent=state.plan?state.purchases+' purchased · '+state.skips+' skipped · '+(state.plan.count-state.attempts)+' unused opportunities'+(state.state==='cancelled'?' (cancelled).':'.'):'';
    $('history').replaceChildren(...state.events.map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));
    $('outcome').hidden=active||!state.plan;
    $('outcome').textContent=state.state==='cancelled'?'Schedule cancelled. Remaining RLO returned. Previous purchases cannot be undone.':state.state==='finished'?'All scheduled opportunities have passed. Time determined when to attempt a purchase; fresh data and your price limit determined whether it could run. Skipped amounts were returned, never accumulated for a larger later purchase.':'';
  }
  $('enter-demo').onclick=async()=>{if(!await window.resonanceVaultAuthorize())return;$('workspace').hidden=false;$('amount').focus();};
  $('schedule-form').onsubmit=async event=>{
    event.preventDefault();if(!await window.resonanceVaultAuthorize()||engine.active(state)||draft)return;
    const plan={amount:amount('amount'),count:Number($('count').value),interval:Number($('interval').value),limit:amount('limit')};
    if(!engine.validate(plan,state.available)){$('feedback').textContent='Use 2–10 opportunities, 1–10 steps apart, and a total budget within your available RLO. Price limit: 1–200; each purchase: at least 1 Demo RLO.';return;}
    draft=plan;$('feedback').textContent='';
    $('review-text').textContent='Reserve '+money(plan.amount*plan.count)+' RLO for '+plan.count+' opportunities of '+money(plan.amount)+' each, every '+plan.interval+' steps. First: step '+(state.step+plan.interval)+'; last: step '+(state.step+plan.interval*plan.count)+'. Each successful purchase includes a 0.10 Demo RLO fee. Buy only at or below '+money(plan.limit)+'. Paused, stale or over-limit opportunities are skipped and refunded, with no catch-up.';
    render();$('confirm').focus();
  };
  $('edit').onclick=()=>{draft=null;render();$('amount').focus();};
  $('confirm').onclick=async()=>{if(!await window.resonanceVaultAuthorize()||!draft)return;state=engine.register(state,draft);draft=null;render();};
  $('advance').onclick=async()=>{if(!await window.resonanceVaultAuthorize())return;try{state=engine.advance(state,amount('price'),!$('stale').checked);$('feedback').textContent='';}catch(e){$('feedback').textContent=e.message;}render();};
  $('pause').onclick=async()=>{if(!await window.resonanceVaultAuthorize())return;state=engine.pause(state);render();};
  window.resonanceVaultCancel=()=>{draft=null;state=engine.cancel(state);render();};
  $('cancel').onclick=window.resonanceVaultCancel;
  render();
})();
