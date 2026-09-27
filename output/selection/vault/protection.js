(()=>{
  'use strict';
  const $=id=>document.getElementById(id), engine=window.EceProtection;
  const fields=['balance','floor','weekly','order','limit','freshness'];
  const money=n=>(n/100).toFixed(2);
  let selected=engine.scenarios[0], state=null, draft=null, cursor=0, mode='draft', busy=false, revision=0;
  function values(){
    const p={};
    for(const id of fields){
      const raw=$(id).value.trim(),valid=id==='freshness'?/^\d+$/.test(raw):/^\d+(?:\.\d{1,2})?$/.test(raw);
      if(!valid)throw Error('Enter positive amounts with at most two decimal places and a whole-number data age.');
      p[id]=id==='freshness'?Number(raw):Math.round(Number(raw)*100);
    }
    return engine.validate(p);
  }
  function sentence(p){return `Keep ${money(p.floor)} Demo RLO untouched. Spend at most ${money(p.weekly)} per demo week, in ${money(p.order)} RLO orders including fees. Buy only at ${money(p.limit)} or below, using quotes no older than ${p.freshness} minutes.`;}
  function preview(){try{$('policy-preview').textContent=sentence(values());$('form-error').textContent='';}catch(e){$('policy-preview').textContent='Adjust your boundaries to see the plan.';$('form-error').textContent=e.message;}}
  function controls(){
    for(const id of fields)$(id).disabled=mode!=='draft'||busy;
    document.querySelectorAll('.scenario').forEach(b=>{b.disabled=mode==='active'||busy;b.setAttribute('aria-pressed',String(b.dataset.scenario===selected.id));});
    $('review-protection').disabled=mode!=='draft'||busy;
    $('confirm-protection').disabled=busy;
    $('advance-protection').disabled=mode!=='active'||busy;
    $('revise-protection').disabled=mode==='draft'||busy;
    $('import-diren').disabled=mode!=='draft'||busy;
    $('policy-review').hidden=mode!=='review';
  }
  function chart(s){
    const p=s.policy;
    $('protected-balance').textContent=money(s.balance);$('baseline-balance').textContent=money(s.baseline);
    $('protected-bar').style.width=(100*s.balance/p.balance)+'%';$('baseline-bar').style.width=(100*s.baseline/p.balance)+'%';
    $('floor-marker').style.left=(100*p.floor/p.balance)+'%';
    $('weekly-spend').textContent=money(s.weeklySpent)+' / '+money(p.weekly);$('blocked-count').textContent=s.blocked;$('reserve-floor').textContent=money(p.floor);
  }
  function nextEvent(){
    const e=selected.events[cursor];
    $('event-preview').textContent=e?`Next: day ${e.day} · ${e.orders} proposed ${e.orders===1?'order':'orders'} · price ${money(e.price)} RLO · quote age ${e.age} min.`:'All market events processed.';
  }
  function select(s){
    revision++;selected=s;state=null;draft=null;cursor=0;mode='draft';
    for(const id of fields)$(id).value=id==='freshness'?s.policy[id]:money(s.policy[id]);
    $('scenario-description').textContent=s.description;$('run-status').textContent='Review your protection to begin.';
    $('result-summary').hidden=true;$('download-report').hidden=true;$('decision-trail').replaceChildren();
    const p=document.createElement('p');p.textContent='No orders evaluated yet.';$('decision-trail').append(p);
    chart(engine.create(s.policy));preview();nextEvent();controls();
  }
  for(const s of engine.scenarios){
    const b=document.createElement('button');b.className='scenario';b.dataset.scenario=s.id;
    const title=document.createElement('strong'),text=document.createElement('span');title.textContent=s.name;text.textContent=s.description;b.append(title,text);
    b.onclick=()=>{if(mode!=='active'&&!busy)select(s);};$('scenarios').append(b);
  }
  for(const id of fields)$(id).addEventListener('input',()=>{if(mode==='draft'){revision++;preview();}});
  async function authorized(action){
    if(busy)return;busy=true;const rev=revision;controls();
    try{if(await window.resonanceVaultAuthorize()&&rev===revision)action();}
    finally{busy=false;controls();}
  }
  $('enter-demo').onclick=()=>authorized(()=>{$('workspace').hidden=false;$('balance').focus();});
  $('protection-form').onsubmit=e=>{e.preventDefault();authorized(()=>{
    if(mode!=='draft')return;
    try{draft=values();$('form-error').textContent='';$('review-copy').textContent=sentence(draft)+' The rehearsal starts from '+money(draft.balance)+' fictional RLO.';mode='review';controls();$('confirm-protection').focus();}
    catch(e){$('form-error').textContent=e.message;}
  });};
  $('edit-protection').onclick=()=>{revision++;draft=null;mode='draft';controls();$('balance').focus();};
  $('confirm-protection').onclick=()=>authorized(()=>{
    if(mode!=='review'||!draft)return;
    state=engine.create(draft);draft=null;cursor=0;mode='active';
    $('decision-trail').replaceChildren();$('result-summary').hidden=true;$('download-report').hidden=true;
    chart(state);nextEvent();$('run-status').textContent='Protection confirmed for this rehearsal. No order processed yet.';
  });
  function trail(entry){
    const section=document.createElement('article');section.className='decision-event';
    const h=document.createElement('h3');h.textContent=`Day ${entry.event.day} · Demo week ${entry.week} · ${entry.event.orders} proposed orders`;section.append(h);
    for(const d of entry.decisions){
      const row=document.createElement('div');row.className='decision-row';
      const badge=document.createElement('span');badge.className='pill'+(d.allowed?'':' stop');badge.textContent=d.allowed?'EXECUTED':'STOPPED';
      const body=document.createElement('div'),p=document.createElement('p'),small=document.createElement('small');
      const failed=d.checks.filter(c=>!c.ok).map(c=>({price:'Price exceeds your approved limit.',freshness:'Quote is too old. Wait for fresh data.',weekly:'This order would exceed the shared weekly cap.',reserve:'This order would consume your protected reserve.'}[c.key]));
      p.textContent=`Order ${d.number}: `+(d.allowed?'All four checks passed; demo order executed once.':failed.join(' '));
      small.textContent=`After this decision: ${money(d.balance)} RLO left · ${money(d.weeklySpent)} spent this week. Comparison: ${d.baselineAllowed?'bought without Ece’s guards':'did not buy'}.`;
      body.append(p,small);row.append(badge,body);section.append(row);
    }
    $('decision-trail').prepend(section);
  }
  $('advance-protection').onclick=()=>authorized(()=>{
    if(mode!=='active'||!state)return;
    state=engine.advance(state,selected.events[cursor]);cursor++;chart(state);trail(state.history.at(-1));nextEvent();
    $('run-status').textContent=`Day ${state.day} complete. Each order used the updated shared balance and budget.`;
    if(cursor===selected.events.length){mode='finished';$('run-status').textContent='Rehearsal complete. Change your boundaries to compare a different policy.';$('result-summary').hidden=false;$('download-report').hidden=false;
      $('result-summary').textContent=`${state.blocked} orders stopped. ${money(state.baselineSpent-state.spent)} Demo RLO not spent compared with the unprotected run. You bought ${state.units.toFixed(4)} demo assets vs ${state.baselineUnits.toFixed(4)} without Ece. Fees paid with Ece: ${money(state.fees)} RLO. This is a policy comparison, not a profit estimate.`;
    }
  });
  $('revise-protection').onclick=()=>{revision++;draft=null;mode='draft';$('run-status').textContent='Previous rehearsal stopped. Edit your boundaries, then review to start from a fresh balance.';preview();controls();$('weekly').focus();};
  window.resonanceVaultCancel=()=>{revision++;draft=null;mode='draft';$('run-status').textContent='Wallet access changed. The rehearsal stopped; review again after checking ownership.';controls();};
  $('download-report').onclick=()=>{
    if(!state||mode!=='finished')return;
    const report={type:'ece-local-rehearsal',version:1,onchain:false,latchVerified:false,realFunds:false,scenario:selected.id,policy:state.policy,result:state};
    const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='ece-rehearsal.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  let imported=null;
  try{const p=JSON.parse(sessionStorage.getItem('resonance.diren-plan.v1')||'null');if(p?.version===1&&Number.isSafeInteger(p.budget)&&p.budget>=100&&p.budget<=10000&&Number.isSafeInteger(p.limit)&&p.limit>=100&&p.limit<=20000)imported=p;}catch{}
  if(imported){$('import-diren').hidden=false;$('import-status').textContent='A reviewed Diren plan is available in this browser tab. Only its order amount and price limit can be copied.';}
  $('import-diren').onclick=()=>{if(mode!=='draft'||!imported)return;revision++;$('order').value=money(imported.budget);$('limit').value=money(imported.limit);preview();$('import-status').textContent='Diren’s amount and price copied. Set Ece’s weekly cap and reserve yourself. Diren’s expiry and execution state were not imported.';};
  select(selected);
})();
