(()=>{
  'use strict';
  const $=id=>document.getElementById(id),fields=['balance','floor','weekly','order','limit','freshness'];
  let version=0,proposal=null,pending=null,contextRevision=null;
  const editable=()=>!$('workspace').hidden&&!$('balance').disabled;
  const fingerprint=()=>fields.map(id=>$(id).value).join('|')+'|'+document.querySelector('.scenario[aria-pressed=true]')?.dataset.scenario;
  const money=n=>(n/100).toFixed(2);
  function invalidate(){version++;pending?.abort();pending=null;proposal=null;$('ece-ai-proposal').hidden=true;buttons();}
  function buttons(){$('ece-draft').disabled=!!pending||!editable();$('ece-example').disabled=!editable();$('ece-apply').disabled=!!pending||!editable();}
  window.addEventListener('resonance:protection-context',e=>{if(e.detail.revision!==contextRevision||!e.detail.editable){contextRevision=e.detail.revision;invalidate();}buttons();});
  new MutationObserver(()=>{if($('workspace').hidden){invalidate();$('ece-ai-status').textContent='Wallet access changed. Check ownership and draft again.';}buttons();}).observe($('workspace'),{attributes:true,attributeFilter:['hidden']});
  for(const id of fields)$(id).addEventListener('input',()=>{invalidate();$('ece-ai-status').textContent='Your manual values changed. Generate a new draft if needed.';});
  $('ece-intent').addEventListener('input',()=>{invalidate();$('ece-ai-status').textContent='Request changed. Draft again when ready.';});
  $('ece-example').onclick=()=>{if(!editable())return;invalidate();$('ece-intent').value=`Start with ${$('balance').value} Demo RLO. Keep ${$('floor').value} untouched. Spend at most ${$('weekly').value} per demo week, in ${$('order').value} RLO orders including fees. Maximum price ${$('limit').value} RLO per asset. Reject quotes older than ${$('freshness').value} minutes.`;$('ece-ai-status').textContent='Current values copied into your request. Edit them before asking Ece; nothing has been sent.';};
  $('ece-draft').onclick=async()=>{
    if(!editable()||pending)return;
    const prompt=$('ece-intent').value.trim();
    if(!prompt){$('ece-ai-status').textContent='Specify all six limits, or use the example button.';return;}
    invalidate();const current=version,snapshot=fingerprint();
    if(!await window.resonanceVaultAuthorize()||current!==version||!editable())return;
    const controller=new AbortController();pending=controller;buttons();const timer=setTimeout(()=>controller.abort(),35000);
    $('ece-ai-status').textContent='Ece is translating your stated boundaries…';
    try{
      const response=await fetch('/api/ai/protection',{method:'POST',headers:{'Content-Type':'application/json','X-Resonance-Request':'proposal-check'},body:JSON.stringify({prompt}),signal:controller.signal});
      const data=await response.json();
      if(current!==version||snapshot!==fingerprint()||!editable())return;
      if(!response.ok){$('ece-ai-status').textContent=({clarify:'Please state all six limits clearly: balance, reserve, weekly cap, order cost, maximum price and quote age. Nothing changed.',shared_limit:'The shared free AI limit has been reached. Try later or use the manual fields.',quota:'The provider’s free quota is unavailable. Use the manual fields; no paid fallback.',not_configured:'AI is not enabled in this preview. Use the manual fields.'}[data.code]||'No valid draft was returned. Nothing changed; try later or use the manual fields.');return;}
      const p=data.plan,keys=['action','explanation',...fields].sort().join('|');
      if(data.executed!==false||!p||Object.keys(p).sort().join('|')!==keys||p.action!=='protect'||typeof p.explanation!=='string'||!p.explanation.length||p.explanation.length>600)throw Error('Invalid response');
      window.EceProtection.validate(p);proposal={...p};
      $('ece-ai-summary').textContent=`Start: ${money(p.balance)} Demo RLO · Reserve: ${money(p.floor)} · Weekly cap: ${money(p.weekly)} · Order: ${money(p.order)} · Price limit: ${money(p.limit)} · Quote age: ${p.freshness} min.`;
      $('ece-ai-explanation').textContent=p.explanation;$('ece-ai-proposal').hidden=false;
      $('ece-ai-status').textContent='Compare these six values with your request. Nothing has been applied or started.';
    }catch{if(current===version)$('ece-ai-status').textContent='Draft unavailable. Nothing changed. You can use the manual fields.';}
    finally{clearTimeout(timer);if(pending===controller)pending=null;buttons();}
  };
  $('ece-apply').onclick=async()=>{
    const p=proposal,current=version,snapshot=fingerprint();if(!p||!editable())return;
    if(!await window.resonanceVaultAuthorize()||current!==version||p!==proposal||snapshot!==fingerprint()||!editable())return;
    for(const id of fields)$(id).value=id==='freshness'?String(p[id]):money(p[id]);
    for(const id of fields)$(id).dispatchEvent(new Event('input',{bubbles:true}));
    $('ece-ai-status').textContent='Values filled in. Review protection and confirm separately; no rehearsal or order has started.';
    $('review-protection').focus();
  };
  buttons();
})();
