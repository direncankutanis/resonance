const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
for(const route of ['protection','ade','eric']){
 await page.goto('file://'+__dirname+'/'+route+'.html');
 await page.evaluate(()=>{window.resonanceVaultAuthorize=async()=>true;document.getElementById('workspace').hidden=false;});
 await page.click('#example-next');await page.waitForFunction(()=>document.getElementById('example-next').disabled);
 if(route==='protection'){
  await page.click('#review-protection');await page.click('#confirm-protection');for(let n=0;n<4;n++)await page.click('#advance-protection');
  assert.equal(await page.locator('#ece-impact article').count(),5);
  await page.click('#revise-protection');assert.equal(await page.locator('#protected-balance').textContent(),'100.00');assert.match(await page.locator('#event-preview').textContent(),/Next: day/);assert.equal(await page.locator('#decision-trail').textContent(),'');assert.equal(await page.locator('#ece-impact').count(),0);assert(await page.locator('#result-summary').isHidden());assert(await page.locator('#download-report').isHidden());
  await page.fill('#weekly','30');await page.click('#review-protection');await page.click('#confirm-protection');for(let n=0;n<4;n++)await page.click('#advance-protection');assert.equal(await page.locator('#protected-balance').textContent(),'40.00');
 }
 await page.evaluate(()=>{window.resonanceVaultCancel();document.getElementById('workspace').hidden=true;});
 await page.waitForFunction(()=>!document.getElementById('example-next').disabled);
 await page.evaluate(()=>document.getElementById('workspace').hidden=false);
 assert(await page.locator('#example-next').isEnabled());
 if(route==='protection'){assert.equal(await page.locator('#ece-impact').count(),0);assert(await page.locator('#result-summary').isHidden());assert.equal(await page.locator('#decision-trail').textContent(),'');}
 await page.click('#example-next');await page.waitForFunction(()=>document.getElementById('example-next').disabled);
}
assert.deepEqual(errors,[]);console.log('PASS Ece stale outcome removal, fresh comparison, and reusable first examples after access revocation across three tools. Wallet mocked.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
