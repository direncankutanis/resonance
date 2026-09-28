(()=>{
'use strict';const $=id=>document.getElementById(id),adapter=window.resonanceScenarioLibrary,ece=document.body.dataset.vaultCharacter==='1',ade=document.body.dataset.vaultCharacter==='3',character=ade?'ade':ece?'ece':'diren',eventName=ade?'resonance:ade-context':ece?'resonance:protection-context':'resonance:vault-state',key='resonance.scenarios.'+character+'.v1';
if(!adapter)return;
const panel=document.createElement('details');panel.className='panel';panel.id='scenario-library';panel.innerHTML='<summary>My scenario library</summary><p>Save up to 20 named scenarios on this browser. Loading fills settings only; review and confirmation are always required. No wallet, approval, running state or funds are saved.</p><p id="library-scope" class="small"></p><label for="library-name">Scenario name</label><input id="library-name" maxlength="60" placeholder="My weekly budget test"><div class="actions row"><button type="button" id="library-save">Save as new</button><button type="button" id="library-update" class="secondary">Replace selected with current settings</button></div><label for="library-list">Saved scenarios</label><select id="library-list" style="max-width:100%;padding:12px;font:inherit;background:#14222b;color:#eee9de"></select><div class="actions row"><button type="button" id="library-load">Load selected</button><button type="button" id="library-copy" class="secondary">Copy selected</button><button type="button" id="library-delete" class="secondary">Delete selected</button></div><p id="library-status" role="status"></p>';
if(ade)$('ade-growth').before(panel);else $('workspace').prepend(panel);if(ade)panel.querySelector('summary').textContent='My saved analyses';$('library-scope').textContent=ade?'Saves both plans, common market assumptions and the separate growth assumptions. Results are never restored: load, then calculate again.':ece?'Saves the applied event sequence and current six protection settings. Unapplied event edits are not included. Your older single-policy save remains available below.':'Saves the applied price sequence, current budget, price limit, deadline and stale-data switch. Unapplied price edits are not included. Loading never resets your demo balance.';
const transfer=document.createElement('section');transfer.innerHTML='<h3>Back up or move your scenarios</h3><p class="small">Export this character’s library, then import it in another browser. Files contain names and demo settings only—not NFTs, wallet access or approvals. Imports add copies and never replace existing records.</p><button type="button" id="library-export" class="secondary">Download library</button><label for="library-file">Choose a Resonance library file · JSON, up to 128 KB</label><input type="file" id="library-file" accept=".json,application/json"><p id="library-import-preview" role="status"></p><button type="button" id="library-import" disabled>Add reviewed scenarios</button>';
panel.append(transfer);
let records=[],healthy=true,pending=null,readVersion=0;

function read(){const raw=localStorage.getItem(key);if(!raw)return [];const d=JSON.parse(raw);if(d?.version!==1||!Array.isArray(d.records)||d.records.length>20)throw Error('Invalid library.');const ids=new Set();return d.records.map(r=>{if(!r||typeof r.id!=='string'||ids.has(r.id)||typeof r.name!=='string'||!r.name.trim()||r.name.length>60)throw Error('Invalid library entry.');ids.add(r.id);return {id:r.id,name:r.name,data:adapter.validate(r.data)};});}
function controls(){const edit=adapter.editable(),has=records.some(r=>r.id===$('library-list').value);for(const id of ['library-name','library-list','library-save','library-update','library-load','library-copy','library-delete'])$(id).disabled=!edit||!healthy;for(const id of ['library-update','library-load','library-copy','library-delete'])$(id).disabled=!edit||!healthy||!has;$('library-save').disabled=!edit||!healthy||records.length>=20;$('library-copy').disabled=!edit||!healthy||!has||records.length>=20;$('library-export').disabled=!edit||!healthy||!records.length;$('library-file').disabled=!edit||!healthy;$('library-import').disabled=!edit||!healthy||!pending||records.length+pending.length>20;}
function refresh(selected){try{records=read();healthy=true;const list=$('library-list');list.replaceChildren();if(!records.length){const o=document.createElement('option');o.textContent='No saved scenarios yet';o.value='';list.append(o);}for(const r of records){const o=document.createElement('option');o.value=r.id;o.textContent=r.name;list.append(o);}if(records.some(r=>r.id===selected))list.value=selected;controls();return true;}catch{healthy=false;controls();$('library-status').textContent='Library could not be read. Existing storage was not overwritten. Manual practice remains available.';return false;}}
function write(next,selection,message){localStorage.setItem(key,JSON.stringify({version:1,records:next}));refresh(selection);$('library-status').textContent=message;}
function act(fn){if(!adapter.editable())return;const id=$('library-list').value;if(!refresh(id))return;try{fn(records.find(r=>r.id===id));}catch(e){$('library-status').textContent='Not completed: '+e.message;}}
function name(){const n=$('library-name').value.trim();if(!n||n.length>60)throw Error('Enter a name of 1–60 characters.');return n;}
function uid(){return crypto.randomUUID();}
$('library-save').onclick=()=>act(()=>{if(records.length>=20)throw Error('Library is full.');const r={id:uid(),name:name(),data:adapter.capture()};write([...records,r],r.id,'Scenario saved in this browser. Nothing started.');});
$('library-update').onclick=()=>act(r=>{if(!r)throw Error('Select a scenario.');const next={id:r.id,name:name(),data:adapter.capture()};write(records.map(x=>x.id===r.id?next:x),r.id,'Selected scenario replaced with your current settings.');});
$('library-load').onclick=()=>act(r=>{if(!r)throw Error('Select a scenario.');adapter.load(r.data);$('library-name').value=r.name;$('library-status').textContent='Loaded settings only. Review and confirm to begin; your balance was not refilled.';controls();});
$('library-copy').onclick=()=>act(r=>{if(!r||records.length>=20)throw Error('Select a scenario and keep space for its copy.');const c={...r,id:uid(),name:r.name.slice(0,53)+' (copy)'};write([...records,c],c.id,'Copy saved. Load it to edit its settings.');$('library-name').value=c.name;});
$('library-delete').onclick=()=>act(r=>{if(!r)throw Error('Select a scenario.');if(!confirm('Delete “'+r.name+'” from this browser?'))return;write(records.filter(x=>x.id!==r.id),null,'Scenario deleted. Current practice settings are unchanged.');});
$('library-export').onclick=()=>act(()=>{
 if(!records.length)throw Error('No scenarios to export.');
 const data={type:'resonance-scenarios',version:1,character,records:records.map(({name,data})=>({name,data}))};
 const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='resonance-'+data.character+'-scenarios.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 $('library-status').textContent='Library exported. The file contains demo settings, not NFT ownership or an approval.';
});
function imported(data){
 if(data?.type!=='resonance-scenarios'||data.version!==1||data.character!==character)throw Error('Choose a version 1 library for this character.');
 if(!Array.isArray(data.records)||data.records.length<1||data.records.length>20)throw Error('A file must contain 1–20 scenarios.');
 return data.records.map(r=>{if(typeof r?.name!=='string'||!r.name.trim()||r.name.length>60)throw Error('A scenario name is invalid.');return {name:r.name.trim(),data:adapter.validate(r.data)};});
}
$('library-file').onchange=async()=>{
 const version=++readVersion;pending=null;controls();const file=$('library-file').files[0];if(!file)return;
 try{if(file.size>131072)throw Error('File exceeds 128 KB.');const data=imported(JSON.parse(await file.text()));if(version!==readVersion||!adapter.editable())return;if(!refresh($('library-list').value))return;if(records.length+data.length>20)throw Error('Not enough room. Keep the total at 20 or fewer scenarios.');pending=data;$('library-import-preview').textContent='Ready to add '+data.length+' copies: '+data.map(r=>r.name).join(' · ')+'. Existing records and current practice will stay unchanged.';}
 catch(e){if(version===readVersion)$('library-import-preview').textContent='File not imported: '+e.message;}
 controls();
};
$('library-import').onclick=()=>act(()=>{
 if(!pending)throw Error('Choose and review a file first.');
 if(records.length+pending.length>20)throw Error('Not enough room for this import.');
 const added=pending.map(r=>({...r,id:uid()}));
 write([...records,...added],added[0].id,'Scenarios added as copies. Load one explicitly to edit it; no rehearsal started.');
 pending=null;$('library-file').value='';$('library-import-preview').textContent='Import complete. Existing scenarios were preserved.';controls();
});
window.addEventListener(eventName,()=>{if(!adapter.editable()){readVersion++;pending=null;$('library-file').value='';$('library-import-preview').textContent='Finish or edit the current rule before importing a file.';controls();}});
$('library-list').onchange=()=>{const r=records.find(r=>r.id===$('library-list').value);if(r)$('library-name').value=r.name;controls();};
window.addEventListener(eventName,controls);
window.addEventListener('storage',e=>{if(e.key===key||e.key===null)refresh($('library-list').value);});
refresh();
})();
