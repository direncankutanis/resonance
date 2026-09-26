const assert=require('node:assert/strict'),e=require('./scheduled-engine.js');
const plan={amount:1000,count:2,interval:2,limit:800};
const conserved=s=>assert.equal(s.available+s.reserved+s.spent,10000);
let s=e.register(e.initial(),plan);assert.equal(s.reserved,2000);
s=e.advance(s,800,true);assert.equal(s.purchases,0);
s=e.advance(s,800,true);assert.equal(s.purchases,1);assert.equal(s.reserved,1000);conserved(s);
s=e.advance(e.advance(s,800,true),800,true);assert.equal(s.state,'finished');assert.equal(s.purchases,2);assert.equal(s.units,2.475);conserved(s);assert.strictEqual(e.advance(s,800,true),s);
for(const mode of ['paused','stale','price']){let t=e.register(e.initial(),plan);if(mode==='paused')t=e.pause(t);t=e.advance(e.advance(t,mode==='price'?900:800,mode!=='stale'),mode==='price'?900:800,mode!=='stale');assert.equal(t.skips,1);assert.equal(t.available,9000);if(mode==='paused')t=e.pause(t);t=e.advance(e.advance(t,800,true),800,true);assert.equal(t.purchases,1);assert.equal(t.spent,1000);assert.equal(t.reserved,0);conserved(t);}
s=e.register(e.initial(),plan);s=e.advance(e.advance(s,800,true),800,true);s=e.cancel(s);assert.equal(s.available,9000);assert.equal(s.spent,1000);conserved(s);assert.strictEqual(e.cancel(s),s);
assert.throws(()=>e.register(e.initial(),{...plan,amount:6000}));assert.throws(()=>e.register(e.initial(),{...plan,count:2.5}));assert.throws(()=>e.register(e.initial(),{...plan,interval:0}));assert.throws(()=>e.advance(e.register(e.initial(),plan),NaN,true));assert.throws(()=>e.register(e.register(e.initial(),plan),plan));
console.log('PASS scheduled engine: fixed timing, total cap, fees, pause/stale/price skip without catch-up, cancel, conservation, no repeat execution.');
