(()=>{
  'use strict';
  const $=id=>document.getElementById(id), engine=window.EceProtection;
  const fields=['balance','floor','weekly','order','limit','freshness'];
  const money=n=>(n/100).toFixed(2);
  const SAVE_KEY=window.ResonanceUnit.storageKey('resonance.ece-policy.v1'), previousRuns=new Map();
  let savedPolicy=null, comparison=null;
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
  function clearOutcome(){
    $('result-summary').hidden=true;$('download-report').hidden=true;$('ece-impact')?.remove();
    $('policy-comparison').hidden=true;$('decision-summary').hidden=true;comparison=null;
  }
  function preview(){try{const policy=values();if(mode==='draft')chart(engine.create(policy));$('policy-preview').textContent=sentence(policy);$('form-error').textContent='';}catch(e){$('policy-preview').textContent='Adjust your boundaries to see the plan.';$('form-error').textContent=e.message;}}
  function controls(){
    for(const id of fields)$(id).disabled=mode!=='draft'||busy;
    document.querySelectorAll('#custom-scenario input,#custom-scenario button').forEach(b=>b.disabled=mode!=='draft'||busy);
    $('custom-add').disabled=mode!=='draft'||busy||$('custom-events').children.length>=8;
    document.querySelectorAll('[data-template]').forEach(b=>b.disabled=mode!=='draft'||busy);
    document.querySelectorAll('.scenario').forEach(b=>{b.disabled=mode==='active'||busy;b.setAttribute('aria-pressed',String(b.dataset.scenario===selected.id));});
    $('review-protection').disabled=mode!=='draft'||busy;
    $('download-report').disabled=mode!=='finished'||busy;
    $('confirm-protection').disabled=busy;
    $('advance-protection').disabled=mode!=='active'||busy;
    $('revise-protection').disabled=mode==='draft'||busy;
    $('import-diren').disabled=mode!=='draft'||busy;
    $('policy-review').hidden=mode!=='review';
    $('save-policy').disabled=mode!=='draft'||busy;
    $('load-policy').disabled=mode!=='draft'||busy||!savedPolicy;
    window.dispatchEvent(new CustomEvent('resonance:protection-context',{detail:{revision,editable:mode==='draft'&&!busy,mode,cursor}}));
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
    comparison=null;$('policy-comparison').hidden=true;$('decision-summary').hidden=true;
    $('template-hint').textContent='Choose a learning template, or edit the scenario settings yourself.';
    revision++;selected=s;state=null;draft=null;cursor=0;mode='draft';
    for(const id of fields)$(id).value=id==='freshness'?s.policy[id]:money(s.policy[id]);
    $('scenario-description').textContent=s.description;$('run-status').textContent='Review your protection to begin.';
    $('result-summary').hidden=true;$('download-report').hidden=true;$('ece-impact')?.remove();$('decision-trail').replaceChildren();
    const p=document.createElement('p');p.textContent='No orders evaluated yet.';$('decision-trail').append(p);
    chart(engine.create(s.policy));preview();nextEvent();controls();
  }
  for(const s of engine.scenarios){
    const b=document.createElement('button');b.className='scenario';b.dataset.scenario=s.id;
    const title=document.createElement('strong'),text=document.createElement('span');title.textContent=s.name;text.textContent=s.description;b.append(title,text);
    b.onclick=()=>{if(mode!=='active'&&!busy)select(s);};$('scenarios').append(b);
  }
  function addEventRow(){
    if($('custom-events').children.length>=8)return;
    const row=document.createElement('fieldset');row.className='form-grid';
    row.innerHTML='<legend>Market event</legend><label>Day<input data-event="day" type="number" min="1" max="28" step="1" value="1"></label><label>Proposed orders<input data-event="orders" type="number" min="1" max="5" step="1" value="5"></label><label>Price per asset · Demo RLO<input data-event="price" type="number" min="1" max="200" step="0.01" value="7.50"></label><label>Quote age · minutes<input data-event="age" type="number" min="0" max="1440" step="1" value="2"></label><button type="button" class="secondary">Remove event</button>';
    row.querySelector('button').onclick=()=>{row.remove();customChanged();controls();};
    row.addEventListener('input',customChanged);$('custom-events').append(row);customChanged();controls();
  }
  function customChanged(){$('custom-status').textContent='Event draft changed. Use this scenario to apply it; the currently selected rehearsal has not changed.';}
  $('custom-add').onclick=()=>{if(mode==='draft'&&!busy)addEventRow();};
  $('custom-use').onclick=()=>authorized(()=>{
    if(mode!=='draft')return;
    try{
      const policy=values(),rows=[...$('custom-events').children];
      if(!rows.length||rows.length>8)throw Error('Add 1–8 events.');
      let last=0;
      const events=rows.map((row,i)=>{
        const e={id:'custom-'+i};
        for(const k of ['day','orders','price','age']){const raw=row.querySelector('[data-event="'+k+'"]').value.trim();if(!(k==='price'?/^\d+(?:\.\d{1,2})?$/:/^\d+$/).test(raw))throw Error('Event '+(i+1)+': use whole numbers, or up to two decimals for price.');e[k]=k==='price'?Math.round(Number(raw)*100):Number(raw);}
        if(e.day<1||e.day>28||e.day<last||e.orders<1||e.orders>5||e.price<100||e.price>20000||e.age<0||e.age>1440)throw Error('Event '+(i+1)+': days 1–28 in order, 1–5 orders, price 1–200, age 0–1440.');
        last=e.day;return e;
      });
      select({id:'custom:'+JSON.stringify(events),name:'Your custom scenario',description:events.length+' custom events · '+events.reduce((n,e)=>n+e.orders,0)+' proposed orders · days '+events[0].day+'–'+last+'. Your protection settings are preserved.',policy,events});
      $('custom-status').textContent='Custom scenario applied. Review protection and confirm to start. Changing the event draft alone does not change this scenario.';
    }catch(e){$('custom-status').textContent=e.message;}
  });
  addEventRow();
  const templateNotes={
    crowded:'Weekly pacing · With 100 RLO, a 40 reserve and a 20 weekly cap, only two 10 RLO orders fit each week. Complete this scenario: 60 RLO remains. Then try a 30 cap on the same scenario and compare: 40 remains. More cash means fewer assets, not more profit.',
    reserve:'Keep a buffer · Start with 100 RLO, keep 40, allow 80 per week and spend 10 per order. Six orders fit; later orders stop at the reserve even though the weekly cap has room. Expected remaining balance: 40 RLO.',
    stale:'Fresh quotes · A 30-minute limit rejects the 90- and 60-minute-old quotes. Two fresh, qualifying orders execute; the price of 9 also fails the price limit of 8. Expected remaining balance: 80 RLO. Freshness alone does not make every order valid.'
  };
  for(const b of document.querySelectorAll('[data-template]'))b.onclick=()=>authorized(()=>{
    if(mode!=='draft')return;
    select(engine.scenarios.find(s=>s.id===b.dataset.template));
    if(b.dataset.template==='crowded'){$('weekly').value='20';$('weekly').dispatchEvent(new Event('input',{bubbles:true}));}
    $('template-hint').textContent=templateNotes[b.dataset.template]+' Review and confirm when ready.';
    $('balance').focus();
  });
  for(const id of fields)$(id).addEventListener('input',()=>{if(mode==='draft'){revision++;clearOutcome();preview();$('template-hint').textContent='Settings changed. Template outcomes no longer apply; review these values and rehearse to see their result.';}});

  async function authorized(action){
    if(busy)return;busy=true;const rev=revision;controls();
    try{if(await window.resonanceVaultAuthorize()&&rev===revision)action();}
    finally{busy=false;controls();}
  }
  $('enter-demo').onclick=()=>authorized(()=>{$('workspace').hidden=false;$('balance').focus();});
  $('protection-form').onsubmit=e=>{e.preventDefault();authorized(()=>{
    if(mode!=='draft')return;
    try{draft=values();$('form-error').textContent='';$('review-copy').textContent=sentence(draft)+' Scenario: '+selected.name+' ('+selected.events.length+' events). The rehearsal starts from '+money(draft.balance)+' fictional RLO.';mode='review';controls();$('confirm-protection').focus();}
    catch(e){$('form-error').textContent=e.message;}
  });};
  $('edit-protection').onclick=()=>{revision++;draft=null;mode='draft';controls();$('balance').focus();};
  $('confirm-protection').onclick=()=>authorized(()=>{
    if(mode!=='review'||!draft)return;
    state=engine.create(draft);draft=null;cursor=0;mode='active';
    comparison=null;$('policy-comparison').hidden=true;$('decision-summary').hidden=true;
    $('ece-impact')?.remove();$('decision-trail').replaceChildren();$('result-summary').hidden=true;$('download-report').hidden=true;
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
      const proof=document.createElement('details'),summary=document.createElement('summary'),numbers=document.createElement('p');
      summary.textContent='Show the check with numbers';numbers.className='small';
      const before=d.balance+(d.allowed?state.policy.order:0),spentBefore=d.weeklySpent-(d.allowed?state.policy.order:0),policy=state.policy;
      numbers.textContent=`Price: ${money(entry.event.price)} ≤ ${money(policy.limit)}. Quote age: ${entry.event.age} ≤ ${policy.freshness} minutes. Weekly total if accepted: ${money(spentBefore)} + ${money(policy.order)} = ${money(spentBefore+policy.order)} ≤ ${money(policy.weekly)}. Balance if accepted: ${money(before)} − ${money(policy.order)} = ${money(before-policy.order)} ≥ ${money(policy.floor)} reserve. All four comparisons must be true. The order cost already includes the fee.`;
      proof.append(summary,numbers);body.append(p,small,proof);row.append(badge,body);section.append(row);
    }
    $('decision-trail').prepend(section);
  }
  $('advance-protection').onclick=()=>authorized(()=>{
    if(mode!=='active'||!state)return;
    state=engine.advance(state,selected.events[cursor]);cursor++;chart(state);trail(state.history.at(-1));nextEvent();
    $('run-status').textContent=`Day ${state.day} complete. Each order used the updated shared balance and budget.`;
    if(cursor===selected.events.length){mode='finished';$('run-status').textContent='Rehearsal complete. Change your boundaries to compare a different policy.';$('result-summary').hidden=false;$('download-report').hidden=false;
      $('result-summary').textContent=`${state.blocked} orders stopped. ${money(state.baselineSpent-state.spent)} Demo RLO not spent compared with the unprotected run. You bought ${state.units.toFixed(4)} demo assets vs ${state.baselineUnits.toFixed(4)} without Ece. Fees paid with Ece: ${money(state.fees)} RLO. This is a policy comparison, not a profit estimate.`;
      const metrics=document.createElement('div');metrics.id='ece-impact';metrics.className='ledger';
      for(const [label,value] of [['Cash retained with Ece',money(state.balance)+' RLO'],['Cash retained without Ece',money(state.baseline)+' RLO'],['Extra cash retained, not profit',money(state.balance-state.baseline)+' RLO'],['Assets acquired with Ece',state.units.toFixed(4)],['Assets acquired without Ece',state.baselineUnits.toFixed(4)]]){const item=document.createElement('article'),h=document.createElement('h3'),v=document.createElement('p');h.textContent=label;v.textContent=value;item.append(h,v);metrics.append(item);}
      $('ece-impact')?.remove();$('result-summary').after(metrics);
      explainCompleted();compareCompleted();
    }
  });
  $('revise-protection').onclick=()=>{revision++;draft=null;state=null;cursor=0;mode='draft';clearOutcome();$('decision-trail').replaceChildren();nextEvent();$('run-status').textContent='Previous rehearsal stopped. Edit your boundaries, then review to start from a fresh balance.';preview();controls();$('weekly').focus();};
  window.resonanceVaultCancel=()=>{clearOutcome();state=null;cursor=0;$('decision-trail').replaceChildren();previousRuns.clear();comparison=null;$('policy-comparison').hidden=true;$('decision-summary').hidden=true;revision++;draft=null;mode='draft';$('run-status').textContent='Wallet access changed. The rehearsal stopped; review again after checking ownership.';preview();nextEvent();controls();};
  $('download-report').onclick=()=>{
    if(!state||mode!=='finished')return;
    const report={type:'ece-local-rehearsal',version:1,onchain:false,latchVerified:false,realFunds:false,scenario:selected.id,events:selected.events,summary:engine.summarize(state),policy:state.policy,result:state,previousPolicyComparison:comparison};
    const url=URL.createObjectURL(new Blob([JSON.stringify(window.ResonanceUnit.record(report),null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='ece-rehearsal.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  function checkedPolicy(record){
    if(!record||record.version!==1||!record.policy||typeof record.policy!=='object'||Array.isArray(record.policy)||Object.keys(record.policy).sort().join('|')!==[...fields].sort().join('|'))throw Error('Invalid saved policy');
    return engine.validate(record.policy);
  }
  function readSaved(){
    savedPolicy=null;
    try{const raw=localStorage.getItem(SAVE_KEY);if(!raw){$('saved-policy-status').textContent='No saved policy on this browser yet.';}else{savedPolicy=checkedPolicy(JSON.parse(raw));$('saved-policy-status').textContent='Saved settings available. Loading fills the form only.';}}
    catch{$('saved-policy-status').textContent='Saved settings could not be read or validated. Use the manual fields; nothing was loaded.';}
    $('saved-policy-summary').textContent=savedPolicy?sentence(savedPolicy):'';
    controls();
  }
  $('save-policy').onclick=()=>{
    if(mode!=='draft'||busy)return;
    try{const p=values();localStorage.setItem(SAVE_KEY,JSON.stringify({version:1,demoUnit:window.ResonanceUnit.get(),policy:Object.fromEntries(fields.map(k=>[k,p[k]]))}));savedPolicy=p;$('saved-policy-status').textContent='Current settings saved on this browser. Saving does not start or approve a rehearsal.';$('saved-policy-summary').textContent=sentence(p);controls();}
    catch{$('saved-policy-status').textContent='Could not save these settings. Check your values and browser storage. Your current form remains available.';}
  };
  $('load-policy').onclick=()=>{
    if(mode!=='draft'||busy)return;
    // Read again: another tab may have updated or corrupted the stored record.
    readSaved();if(!savedPolicy)return;
    for(const id of fields)$(id).value=id==='freshness'?String(savedPolicy[id]):money(savedPolicy[id]);
    for(const id of fields)$(id).dispatchEvent(new Event('input',{bubbles:true}));
    $('saved-policy-status').textContent='Saved settings loaded. Review protection and confirm to start a fresh rehearsal.';$('review-protection').focus();
  };
  window.addEventListener('storage',e=>{if(e.key===SAVE_KEY||e.key===null)readSaved();});
  function explainCompleted(){
    const summary=engine.summarize(state),names={price:'Price above your limit',freshness:'Quote older than allowed',weekly:'Shared weekly budget exceeded',reserve:'Protected reserve would be spent'};
    $('decision-summary').hidden=false;$('decision-totals').textContent=`${summary.total} proposed orders: ${summary.accepted} executed and ${summary.rejected} stopped. Remaining balance: ${money(state.balance)} Demo RLO.`;
    $('decision-counts').replaceChildren();for(const [key,count] of Object.entries(summary.failedChecks)){const li=document.createElement('li');li.textContent=names[key]+': '+count+' failed checks';$('decision-counts').append(li);}
    const failed=Object.entries(summary.failedChecks).filter(([,n])=>n>0).sort((a,b)=>b[1]-a[1]);
    const prompts={price:'Inspect the prices that exceeded your chosen limit. A queued or attractive order still must meet the execution price.',freshness:'Compare with a fresh-data event while keeping the same budget. An old quote cannot establish the current price.',weekly:'Try a different weekly cap on the same events and compare both completed runs. More purchases use more of the balance.',reserve:'Inspect the balance after each proposed order. The reserve is a boundary you chose, not a promise against investment losses.'};
    $('decision-next').textContent=failed.length?'A useful next experiment: '+prompts[failed[0][0]]:'Every proposal passed this time. Try adding an above-limit price or an old quote to see how your rule responds. Passing this rehearsal does not prove safety in real markets.';
  }
  function compareCompleted(){
    const previous=previousRuns.get(selected.id);
    if(previous){
      comparison={scenario:selected.id,previous,current:state};
      $('policy-comparison').hidden=false;$('comparison-context').textContent=selected.name+' · The previous completed rehearsal on this page versus the one you just finished.';
      $('comparison-rows').replaceChildren();
      const rows=[['Starting balance',money(previous.policy.balance),money(state.policy.balance)],['Remaining Demo RLO',money(previous.balance),money(state.balance)],['Total spent, including fees',money(previous.spent),money(state.spent)],['Fees paid',money(previous.fees),money(state.fees)],['Demo asset units',previous.units.toFixed(4),state.units.toFixed(4)],['Orders stopped',previous.blocked,state.blocked]];
      for(const cells of rows){const tr=document.createElement('tr');cells.forEach((value,i)=>{const cell=document.createElement(i?'td':'th');if(!i)cell.scope='row';cell.textContent=String(value);tr.append(cell);});$('comparison-rows').append(tr);}
      const labels={balance:'Starting balance',floor:'Protected reserve',weekly:'Weekly cap',order:'Order cost',limit:'Unit price limit',freshness:'Maximum quote age'};
      const changed=fields.filter(k=>previous.policy[k]!==state.policy[k]).map(k=>labels[k]+': '+(k==='freshness'?previous.policy[k]+' → '+state.policy[k]+' min':money(previous.policy[k])+' → '+money(state.policy[k])+' Demo RLO'));
      $('comparison-changes').textContent=changed.length?'Changed settings: '+changed.join(' · '):'The settings are identical. Deterministic inputs should produce identical results.';
      if(previous.policy.balance!==state.policy.balance)$('comparison-changes').textContent+=' Starting balances differ; remaining cash alone is not a like-for-like measure.';
    }else{$('result-summary').textContent+=' Edit your settings and finish this scenario again to compare both policies.';}
    previousRuns.set(selected.id,state);
  }
  let imported=null;
  try{const p=JSON.parse(sessionStorage.getItem('resonance.diren-plan.v1')||'null');if(p)window.ResonanceUnit.require(p.demoUnit);if(p?.version===1&&Number.isSafeInteger(p.budget)&&p.budget>=100&&p.budget<=10000&&Number.isSafeInteger(p.limit)&&p.limit>=100&&p.limit<=20000)imported=p;}catch{}
  if(imported){$('import-diren').hidden=false;$('import-status').textContent='A reviewed Diren plan is available in this browser tab. Only its order amount and price limit can be copied.';}
  $('import-diren').onclick=()=>{if(mode!=='draft'||!imported)return;revision++;$('order').value=money(imported.budget);$('limit').value=money(imported.limit);preview();$('import-status').textContent='Diren’s amount and price copied. Set Ece’s weekly cap and reserve yourself. Diren’s expiry and execution state were not imported.';};
  function validateScenario(data){
    if(!data||!Array.isArray(data.events)||data.events.length<1||data.events.length>8)throw Error('Invalid saved events.');
    const policy=engine.validate(Object.fromEntries(fields.map(k=>[k,data.policy?.[k]])));let last=0;
    const events=data.events.map((e,i)=>{if(!e||!Number.isInteger(e.day)||e.day<last||e.day<1||e.day>28||!Number.isInteger(e.orders)||e.orders<1||e.orders>5||!Number.isSafeInteger(e.price)||e.price<100||e.price>20000||!Number.isInteger(e.age)||e.age<0||e.age>1440)throw Error('Invalid saved event.');last=e.day;return {id:'custom-'+i,day:e.day,orders:e.orders,price:e.price,age:e.age};});
    return {policy,events};
  }
  window.resonanceScenarioLibrary={
    editable:()=>mode==='draft'&&!busy,
    validate:validateScenario,
    capture:()=>validateScenario({policy:values(),events:selected.events}),
    load:data=>{if(mode!=='draft'||busy)throw Error('Finish or edit your current rehearsal first.');const {policy,events}=validateScenario(data);select({id:'custom:'+JSON.stringify(events),name:'Saved scenario',description:'Loaded events and protection settings. Review and confirm to begin a fresh rehearsal.',policy,events});$('custom-events').replaceChildren();for(const e of events){addEventRow();const row=$('custom-events').lastElementChild;for(const k of ['day','orders','price','age'])row.querySelector('[data-event="'+k+'"]').value=k==='price'?money(e[k]):String(e[k]);}$('custom-status').textContent='Saved events loaded and applied. Edit them here and apply again to change this scenario.';}
  };
  select(selected);
  readSaved();
})();
