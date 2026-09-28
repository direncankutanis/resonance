/* Pure proposal calculation. Integer hundredths of fictional Demo RLO. No settlement. */
(function(root){'use strict';
const MAX=100000000;
function amount(n,label){if(!Number.isSafeInteger(n)||n<0||n>MAX)throw Error('Invalid '+label);return n;}
function list(items,label){if(!Array.isArray(items)||items.length>20)throw Error('Use at most 20 '+label);const ids=new Set();for(const x of items){if(!x||typeof x.id!=='string'||!x.id.trim()||x.id.length>80||ids.has(x.id))throw Error('Unique '+label+' IDs required');ids.add(x.id);if(!Number.isInteger(x.priority)||x.priority<1||x.priority>20)throw Error('Invalid priority');}return items;}
function plan(input){
 if(!input)throw Error('Budget required');
 const {cash,income,reserve,savings,topUp}=input;
 for(const [k,v] of Object.entries({cash,income,reserve,savings}))amount(v,k);
 if(!topUp||typeof topUp.enabled!=='boolean'||!Array.isArray(topUp.billIds))throw Error('Explicit savings permission required');amount(topUp.cap,'top-up cap');
 const bills=list(input.bills,'bills'),goals=list(input.goals,'goals');
 for(const b of bills){amount(b.amount,'bill amount');if(!Number.isInteger(b.day)||b.day<1||b.day>31)throw Error('Invalid due day');}
 for(const g of goals){amount(g.target,'goal target');amount(g.balance,'goal balance');amount(g.cap,'goal cap');if(g.balance>g.target)throw Error('Goal balance exceeds target');}
 if(new Set(topUp.billIds).size!==topUp.billIds.length||topUp.billIds.some(id=>!bills.some(b=>b.id===id)))throw Error('Unknown or duplicate savings permission');
 const order=(a,b)=>a.priority-b.priority||(a.day||0)-(b.day||0);
 let operating=cash+income,flexible=savings,used=0,earmarked=0,goalAdded=0;
 const reserveDeficit=Math.max(0,reserve-operating),decisions=[];
 for(const b of [...bills].sort(order)){
 const available=Math.max(0,operating-reserve),needed=Math.max(0,b.amount-available);
 const permitted=!reserveDeficit&&topUp.enabled&&topUp.billIds.includes(b.id)?Math.min(flexible,topUp.cap-used):0;
 const funded=!reserveDeficit&&available+permitted>=b.amount;
 if(funded){operating+=needed-b.amount;flexible-=needed;used+=needed;earmarked+=b.amount;}
 decisions.push({kind:'bill',id:b.id,requested:b.amount,allocated:funded?b.amount:0,fromSavings:funded?needed:0,shortfall:funded?0:Math.max(0,b.amount-available-permitted),status:funded?'earmarked':'unfunded',reason:funded?'Allocation only; not paid':reserveDeficit?'Protected reserve is underfunded':'Insufficient permitted funds; no partial allocation'});
 }
 const blocked=reserveDeficit>0||decisions.some(d=>d.status==='unfunded');
 for(const g of [...goals].sort(order)){
 const contribution=blocked?0:Math.min(g.target-g.balance,g.cap,Math.max(0,operating-reserve));operating-=contribution;goalAdded+=contribution;
 decisions.push({kind:'goal',id:g.id,allocated:contribution,balance:g.balance+contribution,remaining:g.target-g.balance-contribution,status:g.balance+contribution===g.target?'complete':blocked?'paused':'planned',reason:blocked?'Resolve reserve and obligation shortfalls first':'Limited by remaining cash, goal target and period cap'});
 }
 const startingTotal=cash+income+savings+goals.reduce((s,g)=>s+g.balance,0);
 const endingTotal=operating+flexible+earmarked+goals.reduce((s,g)=>s+g.balance,0)+goalAdded;
 if(startingTotal!==endingTotal)throw Error('Budget conservation failed');
 return {type:'eric-budget-proposal',version:1,onchain:false,paid:false,operating,savings:flexible,earmarked,goalAdded,savingsUsed:used,reserveDeficit,startingTotal,endingTotal,decisions};
}
const api={plan};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.EricBudget=api;
})(typeof window==='undefined'?globalThis:window);
