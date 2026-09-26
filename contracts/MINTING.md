# Live Sepolia test mint handoff

Verified deployment: 0x8618f31e0c60ba53dcdffbb6de1e91ecd693bf1d
Deployment transaction: 0x7613fe1e54f3235ff8ae7133624480cb0dd340425080b191b95b6eeebeebedb9
Independent RPC verification is recorded in sepolia-deployment.json. Runtime and constructor data match the prepared build. This is not explorer source verification or a security audit.

Open http://127.0.0.1:8765/mint/index.html in the SAME browser and origin where you completed the lesson and use Rabby. NFT preview links include the character parameter. Local lesson records do not sync between file://, localhost and 127.0.0.1, browsers, or devices. The deployed contract remains permissionless and does not attest to education.

Connect Rabby on Sepolia. The page checks exact runtime code, per-character claim history, current holdings, local lesson status, funds and gas. Review the character and fee, then request mint and personally approve in Rabby. No mint sale price, only Sepolia test ETH gas.

Check existing transaction until two confirmations. The page validates sender, contract, exact claim calldata, zero payment, receipt success, reward event, token character and metadata URI. Do not submit again when pending or unknown. Recover the hash from Rabby activity when necessary. Downloading/clearing browser data or changing browser profiles can remove local duplicate protection; claim limits are also enforced by the contract.

After the first real mint, provide the transaction hash or token ID. Confirm the image renders in the target wallet/indexer before declaring wallet compatibility complete. The vault NFT gate is still pending; a minted pass does not yet activate financial execution.

Local automated tests: contracts/test/mint-ui.cjs uses Ganache and a mock provider, never the public network or a user's wallet. It checks success, event/metadata, duplicate/reload, transfer/claim history, local lesson gate, wrong chain, rejection, uncertain submission and mobile. Actual user mint remains to be tested.
