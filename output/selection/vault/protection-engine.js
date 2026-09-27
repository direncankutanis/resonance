/* Deterministic teaching engine. Integer hundredths are demo units, not token decimals. */
(function (root) {
  'use strict';
  const FEE = 10;
  function validate(p) {
    if (!p || !['balance','weekly','floor','order','limit','freshness'].every(k => Number.isSafeInteger(p[k]))) throw Error('Use whole internal units.');
    if (p.balance < 1000 || p.balance > 100000) throw Error('Start with 10–1,000 Demo RLO.');
    if (p.floor < 0 || p.floor >= p.balance) throw Error('The reserve must be below the starting balance.');
    if (p.weekly < 100 || p.weekly > p.balance) throw Error('The weekly cap must be between 1 RLO and the starting balance.');
    if (p.order < 100 || p.order > p.weekly || p.order > p.balance - p.floor) throw Error('One order must fit both your weekly cap and your spendable balance.');
    if (p.limit < 100 || p.limit > 20000 || p.freshness < 1 || p.freshness > 120) throw Error('Use a price limit of 1–200 RLO and data age of 1–120 minutes.');
    return Object.freeze({...p});
  }
  function create(policy) {
    const p = validate(policy);
    return {policy:p, balance:p.balance, baseline:p.balance, spent:0, baselineSpent:0, fees:0, units:0, baselineUnits:0, week:0, weeklySpent:0, day:0, blocked:0, history:[], seen:[]};
  }
  function advance(state, event) {
    if (!event || typeof event.id !== 'string' || !Number.isInteger(event.day) || event.day < 1 || event.day < state.day || !Number.isSafeInteger(event.price) || event.price < 100 || event.price > 20000 || !Number.isInteger(event.age) || event.age < 0 || !Number.isInteger(event.orders) || event.orders < 1 || event.orders > 5) throw Error('Invalid market event.');
    if (state.seen.includes(event.id)) throw Error('This event has already been processed.');
    const p = state.policy, s = {...state, history:[...state.history], seen:[...state.seen,event.id]};
    s.day = event.day;
    const week = Math.floor((event.day-1)/7);
    if (week !== s.week) {s.week = week; s.weeklySpent = 0;}
    const decisions = [];
    for (let i=0;i<event.orders;i++) {
      // Same proposals, price threshold and fee; baseline omits Ece's three protections.
      const baselineAllowed = event.price <= p.limit && s.baseline >= p.order;
      if (baselineAllowed) {s.baseline -= p.order; s.baselineSpent += p.order; s.baselineUnits += (p.order-FEE)/event.price;}
      const checks = [
        {key:'price',ok:event.price <= p.limit,label:'Price within your Diren limit'},
        {key:'freshness',ok:event.age <= p.freshness,label:'Quote fresh enough'},
        {key:'weekly',ok:s.weeklySpent+p.order <= p.weekly,label:'Order fits the shared weekly cap'},
        {key:'reserve',ok:s.balance-p.order >= p.floor,label:'Your reserve remains untouched'}
      ];
      const allowed = checks.every(c=>c.ok);
      if (allowed) {s.balance -= p.order; s.weeklySpent += p.order; s.spent += p.order; s.fees += FEE; s.units += (p.order-FEE)/event.price;}
      else s.blocked++;
      decisions.push({number:i+1,allowed,checks,baselineAllowed,balance:s.balance,weeklySpent:s.weeklySpent});
    }
    s.history.push({event:{...event},week:s.week+1,decisions});
    return s;
  }
  const scenarios = [
    {id:'crowded',name:'The crowded week',description:'Several orders qualify together. Watch them share one cap, then cross into a new week.',policy:{balance:10000,weekly:3000,floor:4000,order:1000,limit:800,freshness:30},events:[{id:'c1',day:1,price:750,age:2,orders:3},{id:'c2',day:3,price:700,age:4,orders:2},{id:'c3',day:8,price:780,age:1,orders:3},{id:'c4',day:9,price:680,age:3,orders:3}]},
    {id:'reserve',name:'An irresistible streak',description:'Every price qualifies. A generous weekly cap still must not consume your emergency reserve.',policy:{balance:10000,weekly:8000,floor:4000,order:1000,limit:800,freshness:30},events:[{id:'r1',day:1,price:750,age:2,orders:3},{id:'r2',day:2,price:720,age:2,orders:3},{id:'r3',day:3,price:680,age:2,orders:2}]},
    {id:'stale',name:'The quiet data outage',description:'An attractive quote can be too old. Fresh data lets the rule resume; a higher price still stops it.',policy:{balance:10000,weekly:3000,floor:4000,order:1000,limit:800,freshness:30},events:[{id:'s1',day:1,price:650,age:90,orders:2},{id:'s2',day:2,price:750,age:3,orders:1},{id:'s3',day:3,price:900,age:2,orders:1},{id:'s4',day:4,price:650,age:60,orders:2},{id:'s5',day:5,price:780,age:1,orders:1}]}
  ];
  const api = {create,advance,validate,scenarios,FEE};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.EceProtection = api;
})(typeof window === 'undefined' ? globalThis : window);
