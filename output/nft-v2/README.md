# Resonance character learning passes — v2

The four v2 metadata files were published to IPFS and verified on 20 September 2026; see publication-verification.json for individual CIDs. A Sepolia test contract is deployed; see contracts/sepolia-deployment.json. First user mint, wallet rendering and vault access integration remain pending. v1 is an earlier archived design. Use this v2 package for future publication.

| ID | Character | Learning concept | Planned tool |
|---|---|---|---|
| 0 | Diren | Value conditions | Conditional buying |
| 1 | Ece | Risk conditions | Protection rules |
| 2 | Eric | Scheduled workflows | Periodic buying |
| 3 | Ade | Combined conditions | Combined rules |

Four PNG cards use approved portraits and an HTML layout. Four JSON files embed their PNG data URI. Images carry edition v2 and label tool access as not connected. No private player name, contract address, fabricated transaction or return promise is included. These test collectibles do not verify gameplay and are not issued by Rialo.

Rebuild: run build.cjs with Playwright available, then python3 prepare.py. prepare.py validates character IDs, traits, dimensions, embedded PNG and hashes; regenerates the app's nft-artwork.js and metadata-upload.zip. Rebuild the game with output/selection/build.py afterward. Freeze bytes before uploading; rebuilding can change content hashes.

Upload the four JSON files as a DIRECTORY, not the ZIP itself. The ZIP contains those four files at its root; extract before upload. See PUBLISHING.md. verify-publication.py checks downloaded bytes against manifest.json and creates constructor-uris.json only after all four pass. Hashes are NOT CIDs. No real constructor URIs exist yet.

Data-URI rendering in the target wallet/indexer and pin retention remain unverified. If image hosting must change, regenerate metadata and hashes before deployment. Future real access must check the verified contract's balanceOfCharacter, not the JSON trait or browser completion. Existing contract permits one claim per character per wallet but does not attest to training.
