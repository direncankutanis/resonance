(()=>{
window.resonanceMountClaimDemo=host=>{
let state='disconnected';
const states={
disconnected:{title:'Wallet required',text:'A real claim would require a connected wallet. This demo uses no address.',actions:[['Use demo wallet','wrong-network']]},
'wrong-network':{title:'Wrong network',text:'The demo wallet is on another network. A real claim must use Sepolia.',actions:[['Simulate Sepolia switch','ready'],['Simulate switch rejection','switch-rejected']]},
'switch-rejected':{title:'Network switch declined',text:'Nothing was submitted. The player can retry or keep playing.',actions:[['Retry demo switch','wrong-network']]},
ready:{title:'Ready to request approval',text:'Demo eligibility is assumed for this walkthrough. This does not validate your game completion or real wallet.',actions:[['Simulate claim request','approval'],['Simulate already claimed','claimed']]},
approval:{title:'Awaiting wallet approval',text:'In the live flow, the player reviews the transaction in their wallet. No wallet window is opened here.',actions:[['Simulate approval','pending'],['Simulate rejection','rejected']]},
rejected:{title:'Request declined',text:'No transaction was submitted. No reward was minted. You can retry.',actions:[['Retry demo claim','ready']]},
pending:{title:'Transaction pending — simulated',text:'A submitted transaction cannot be cancelled merely by closing this screen. The live flow must check its receipt before confirming success.',actions:[['Simulate successful receipt','success'],['Simulate reverted receipt','failed'],['Simulate unavailable receipt','unknown']]},
unknown:{title:'Confirmation unavailable',text:'The result is unknown. Do not treat this as a failed mint or submit a duplicate claim. Recheck the existing transaction first.',actions:[['Recheck demo receipt','pending']]},
failed:{title:'Transaction reverted — simulated',text:'The demo transaction failed. In a live transaction, a revert can still consume network gas. Check eligibility and network state before retrying.',actions:[['Return to demo checks','ready']]},
success:{title:'Success state preview',text:'This is what a confirmed claim would look like. No NFT was minted, no collection entry was added, and no transaction hash exists.',actions:[['Preview duplicate-claim protection','claimed']]},
claimed:{title:'Already claimed — simulated',text:'The prepared contract allows one lifetime claim per character per address. Transferring that NFT does not reset its claim allowance; other characters can still be claimed. No public deployment is connected.',actions:[]}
};
const heading=document.createElement('h3');heading.textContent='Claim flow simulator';const label=document.createElement('p');label.className='profile-tag';label.textContent='SIMULATION ONLY · NO WALLET REQUESTS · NO ONCHAIN ACTIVITY';const intro=document.createElement('p');intro.textContent='Explore the planned screens independently of your game progress. Demo state is discarded when this window closes.';const panel=document.createElement('div');panel.className='claim-demo-state';panel.setAttribute('role','status');panel.setAttribute('aria-live','polite');panel.style.cssText='border-left:3px solid #9cd0c1;padding:12px;margin:12px 0';const actions=document.createElement('div');actions.style.cssText='display:flex;gap:8px;flex-wrap:wrap';const reset=document.createElement('button');reset.textContent='Reset demo';reset.style.marginTop='16px';reset.onclick=()=>render('disconnected');host.append(heading,label,intro,panel,actions,reset);
function render(next){state=next;const item=states[state];panel.replaceChildren();const title=document.createElement('h4');title.textContent=item.title;title.tabIndex=-1;title.style.margin='0 0 8px';const text=document.createElement('p');text.textContent=item.text;panel.append(title,text);actions.replaceChildren();for(const [name,target]of item.actions){const b=document.createElement('button');b.textContent=name;b.onclick=()=>{render(target);panel.querySelector('h4').focus();};actions.append(b);}host.dataset.claimState=state;}
render(state);
};
})();
