(function(root) {
  'use strict';
  const initial = () => ({available:10000,reserved:0,spent:0,units:0,step:0,state:'idle',plan:null,attempts:0,purchases:0,skips:0,events:[]});
  function validate(plan, available) {
    return plan && ['amount','count','interval','limit'].every(k => Number.isSafeInteger(plan[k])) && plan.amount >= 100 && plan.amount <= 10000 && plan.count >= 2 && plan.count <= 10 && plan.interval >= 1 && plan.interval <= 10 && plan.limit >= 100 && plan.limit <= 20000 && plan.amount * plan.count <= available;
  }
  const active = s => s.state === 'running' || s.state === 'paused';
  function register(s, plan) {
    if (active(s) || !validate(plan,s.available)) throw Error('Choose 2–10 purchases, 1–10 steps apart, and an affordable total budget.');
    const budget=plan.amount*plan.count;
    return {...s,available:s.available-budget,reserved:budget,state:'running',plan:{...plan,start:s.step},attempts:0,purchases:0,skips:0,events:[...s.events,`Registered ${plan.count} opportunities. Reserved ${(budget/100).toFixed(2)} Demo RLO.`]};
  }
  function cancel(s) {
    if (!active(s)) return s;
    return {...s,available:s.available+s.reserved,reserved:0,state:'cancelled',events:[...s.events,`Cancelled at step ${s.step}. Unspent reserve returned; completed purchases remain.`]};
  }
  function pause(s) { return active(s)?{...s,state:s.state==='paused'?'running':'paused'}:s; }
  function advance(s, price, fresh) {
    if (!active(s)) return s;
    if (!Number.isSafeInteger(price)||price<100||price>20000) throw Error('Enter a simulated price from 1 to 200.');
    const step=s.step+1, next=s.plan.start+(s.attempts+1)*s.plan.interval;
    if(step<next) return {...s,step};
    const reason=s.state==='paused'?'schedule paused':!fresh?'stale price data':price>s.plan.limit?'price above limit':null;
    const amount=s.plan.amount, attempts=s.attempts+1;
    const event=reason?`Step ${step}: skipped (${reason}). ${(amount/100).toFixed(2)} RLO returned. No catch-up purchase.`:`Step ${step}: bought ${((amount-10)/price).toFixed(4)} demo units for ${(amount/100).toFixed(2)} RLO including a 0.10 Demo RLO fee.`;
    return {...s,step,attempts,reserved:s.reserved-amount,available:s.available+(reason?amount:0),spent:s.spent+(reason?0:amount),units:s.units+(reason?0:(amount-10)/price),purchases:s.purchases+(reason?0:1),skips:s.skips+(reason?1:0),state:attempts===s.plan.count?'finished':s.state,events:[...s.events,event]};
  }
  const api={initial,validate,active,register,cancel,pause,advance};
  root.ResonanceSchedule=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
