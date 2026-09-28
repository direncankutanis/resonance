const assert=require('node:assert/strict'),E=require('./ade-engine.js');const p={balance:10000,floor:4000,weekly:2000,order:1000,limit:800,freshness:30};
let r=E.run(p,[{id:'a',day:1,orders:2,price:800,age:2}]);assert.equal(r.state.balance,8000);assert.equal(r.ending.pnl,-20);assert.equal(r.ending.equity,9980);assert.equal(r.state.fees,20);
r=E.run(p,[{id:'a',day:1,orders:3,price:800,age:90}]);assert.equal(r.ending.pnl,0);assert.equal(r.summary.rejected,3);assert(E.audit({...p,order:3000}).length);assert.throws(()=>E.paths(100,8,3,2));
let g=E.compound({principal:60,reserve:40,monthly:10,rate:0,fee:0,months:12}).at(-1);assert.equal(g.total,220);assert.equal(g.gain,0);assert.equal(g.reserve,40);
g=E.compound({principal:100,reserve:40,monthly:0,rate:12,fee:0,months:12}).at(-1);assert(Math.abs(g.invested-100*1.01**12)<1e-8);assert.equal(g.reserve,40);
g=E.compound({principal:100,reserve:40,monthly:0,rate:-12,fee:1,months:12}).at(-1);assert(g.gain<0);assert(g.fees>0);console.log('PASS mark-to-market fee accounting, stale data, incompatible rules, path bounds, contributions vs gain, compounding and losses.');
