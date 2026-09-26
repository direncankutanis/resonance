# Current status

Sepolia reward contract deployed at `0x8618f31e0c60ba53dcdffbb6de1e91ecd693bf1d`. The browser mint flow is available in the public preview. Historical preparation notes below describe earlier stages; use the root README and current mint configuration for the implemented scope. This is not a security audit or an onchain learning attestation.

# Reactive Master — Sepolia test collectible

Not deployed. Not an achievement attestation. No wallet key is needed for local tests.

Run `npm ci --ignore-scripts` then `npm test` in this directory. Compiler: Solidity 0.8.30, Shanghai target, optimizer 200. OpenZeppelin Contracts 5.4.0; lockfile pins dependencies. Tests run against local Ganache configured with Sepolia's chain ID, not the public network.

ERC-721, transferable, one lifetime claim per character per caller (four character rewards per caller). Transferring a token does not reset the allowance; an address can still receive multiple tokens by transfer. Character IDs: 0 Diren, 1 Ece, 2 Eric, 3 Ade. No sale payment, owner, upgrade mechanism, metadata setter, gameplay attestation or arbitrary recipient mint. Constructor fixes four metadata URIs; actual content persistence depends on chosen storage. Empty URIs and non-Sepolia deployment are rejected.

Before public deployment: prepare four final artwork/JSON assets with public persistent URLs (prefer content-addressed storage), review metadata and run receiver callbacks/reentrancy tests, deploy from user-approved wallet, verify source/chain/address, then implement claim receipt confirmation and duplicate-claim lookup. The TEST_ONLY URIs in tests are deliberate placeholders and must never be used in a public deployment. This local test suite is not a security audit.

NFT preview in the app shows the existing character portrait and planned attributes; final minted artwork and hosted metadata are still pending. Mint stays disabled until a deployment is verified. Browser completion only gates UI; direct contract calls remain permissionless in this test design.


## Character access model (v2 preparation)
`hasClaimed(address,uint8)` is permanent claim history, not current access. `characterOf(tokenId)` returns the character and rejects nonexistent tokens. `balanceOfCharacter(address,uint8)` counts currently owned rewards and follows transfers, including multiple copies received from others. IDs outside 0–3 have zero mapping values; `claim` rejects them. Gate access by a positive current character balance on the verified chain/contract, never by `hasClaimed` or local learning records.

NFT transfer moves the prospective access right to its new owner. The sender's claim history remains used. Receiving a token does not consume a recipient's own claim. A wallet may therefore hold multiple copies through transfers even though it can claim each character only once. This is not Sybil resistance or proof of training.

Character and metadata are readable during receiver callbacks. Claims use OpenZeppelin ReentrancyGuard, including across different characters. URI content is fixed by constructor; tokenURI derives from the character rather than duplicating strings per token. No mutable metadata or financial execution is introduced.

Tests cover all four claims, duplicate protection, transfer/self-transfer balances, unauthorized transfers, callback visibility, cross-character nested claim rejection, rejected-receiver rollback and retry, invalid IDs, payment, URI and network. A passing local test is not a security audit. Public minting is disabled. The ABI changed from hasClaimed(address) to hasClaimed(address,uint8); future integration must use the new artifact. No deployed contract is migrated.
