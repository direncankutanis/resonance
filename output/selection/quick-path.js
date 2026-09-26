(()=>{
const root=document.getElementById('chapter');
const css=document.createElement('style');css.textContent='#chapter .quick-guide{padding:14px 18px;border:1px solid #759d94;background:#152f32;border-radius:5px;margin:16px 0}#chapter .quick-guide p{margin:6px 0}#chapter[data-visual-busy=true] #quick-finish{display:none}';document.head.append(css);
function finish(){
const replay=root.querySelector('#retry').onclick;
const shield=root.querySelector('#shield').textContent,reserve=root.querySelector('#reserve').textContent;
root.innerHTML='<header><div class="brand">RESONANCE</div><div class="small">THE LAST LIGHT · LESSON COMPLETE</div><button class="secondary" id="back">Characters</button></header><h1>You made the city react.</h1><section class="quick-guide"><h2>One rule. A visible result.</h2><p id="quick-result"></p><p>The shield fell below 30. Your condition became true, and the queued transfer restored protection in the next simulated block.</p><p><strong>Real-world connection:</strong> the same condition → action pattern can describe a scheduled payment or an authorized reserve top-up. Execution still needs sufficient funds and permissions.</p></section><p>Finish the knowledge check to collect your learning reward. A wrong answer includes an explanation and another try.</p><div class="row"><button class="secondary" id="storm-replay">Replay the lesson</button></div><div class="foot">Local learning simulation · No live Rialo transaction or NFT mint · Next-block timing is this exercise’s model</div>';
root.querySelector('#quick-result').textContent='Shield: '+shield+' · Reserve: '+reserve+'. Your registered rule executed.';
root.querySelector('#storm-replay').onclick=replay;
root.querySelector('#back').onclick=()=>{root.hidden=true;document.getElementById('resonance-select').hidden=false;};
}
function install(){
const enter=root.querySelector('#enter');
if(enter&&!root.querySelector('#quick-intro')){const p=document.createElement('p');p.id='quick-intro';p.textContent='QUICK START · One guided wave + a short knowledge check. Extra defense challenges are optional.';enter.closest('section').prepend(p);}
const register=root.querySelector('#register');
if(register&&!root.querySelector('#quick-guide')){
const box=document.createElement('section');box.id='quick-guide';box.className='quick-guide';box.innerHTML='<strong>Your first rule, made easy</strong><p>Use shield &lt; 30 and transfer 20. The first impact takes shield energy from 40 to 25; the transfer then restores it to 45.</p><button class="secondary" id="quick-recommend">Use this rule</button><p>You will still register it and advance the blocks to see what happens.</p>';register.closest('section').prepend(box);
box.querySelector('button').onclick=()=>{for(const [id,value] of [['condition','low'],['amount','20']]){const el=document.getElementById(id);el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));}};
}
const suggestion=root.querySelector('#quick-recommend');if(suggestion&&suggestion.disabled!==register.disabled)suggestion.disabled=register.disabled;
const story=root.querySelector('#story');
if(story&&!story.hidden&&!root.querySelector('#quick-finish')){const b=document.createElement('button');b.id='quick-finish';b.textContent='Finish the lesson →';b.onclick=finish;story.before(b);story.textContent='Optional: defend against two more waves →';story.classList.add('secondary');}
}
new MutationObserver(install).observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','disabled']});install();
})();
