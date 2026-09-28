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
function rehearse(input,options){
 plan(input);if(!options||!Number.isInteger(options.months)||options.months<1||options.months>24)throw Error('Choose 1–24 months.');
 const change=options.change;
 if(change){if(!Number.isInteger(change.month)||change.month<1||change.month>options.months)throw Error('Change month must be inside the rehearsal.');if(change.income!==undefined)amount(change.income,'changed monthly income');if(change.billId!==undefined){if(!input.bills.some(b=>b.id===change.billId))throw Error('Choose an existing expense.');amount(change.billAmount,'changed expense');}else if(change.billAmount!==undefined)throw Error('Choose an expense for the changed amount.');}
 let cash=input.cash,savings=input.savings,goals=input.goals.map(g=>({...g})),incomeTotal=0,expenseTotal=0;const rows=[],completed=Object.fromEntries(goals.filter(g=>g.balance===g.target).map(g=>[g.id,0]));
 const initial=input.cash+input.savings+goals.reduce((n,g)=>n+g.balance,0);
 for(let month=1;month<=options.months;month++){
 const active=change&&month>=change.month,income=active&&change.income!==undefined?change.income:input.income;
 const bills=input.bills.map(b=>({...b,amount:active&&b.id===change.billId?change.billAmount:b.amount}));
 const result=plan({...input,cash,savings,goals,bills,income});incomeTotal+=income;expenseTotal+=result.earmarked;
 cash=result.operating;savings=result.savings;goals=goals.map(g=>{const d=result.decisions.find(d=>d.kind==='goal'&&d.id===g.id);if(d.remaining===0&&completed[g.id]===undefined)completed[g.id]=month;return {...g,balance:d.balance};});
 const retained=cash+savings+goals.reduce((n,g)=>n+g.balance,0);
 if(initial+incomeTotal!==retained+expenseTotal)throw Error('Rehearsal conservation failed');
 const blocked=result.reserveDeficit>0||result.decisions.some(d=>d.status==='unfunded');rows.push({month,income,expenseTotal,retained,blocked,result});
 // Stop instead of silently erasing unpaid obligations or inventing debt handling.
 if(blocked)break;
 }
 return {type:'eric-budget-rehearsal',version:1,onchain:false,paid:false,requestedMonths:options.months,completed,rows,stopped:rows.at(-1).blocked,initial,incomeTotal,expenseTotal,assumptions:'Monthly income and expenses repeat. Funded expenses leave the simulated budget each month; no real settlement. Goal balances, cash and savings carry forward; savings permission cap resets monthly. Stops at the first reserve or expense shortfall. Changes persist from their selected month. No interest, inflation, fees or debt resolution modeled.'};
}
const api={plan,rehearse};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.EricBudget=api;
})(typeof window==='undefined'?globalThis:window);
