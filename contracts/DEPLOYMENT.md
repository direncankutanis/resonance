# Sepolia deployment handoff

Prepared from verified v2 individual-file IPFS URIs. No public transaction has been submitted by preparation or testing.

Open http://127.0.0.1:8765/deploy/index.html in the browser containing Rabby. Keep the local preview server running.

1. Review four character URIs, permissionless test-claim policy, and remaining wallet rendering/pin-retention checks.
2. Connect Rabby, select Sepolia, and check deployment cost. This performs read/estimate RPC calls only.
3. Review the checkbox, request deployment, and personally approve or reject in Rabby. This sends zero ETH value; test ETH gas is charged by the network. The wallet's displayed fee takes precedence over the estimate.
4. After submission, use Check existing transaction until two confirmations. Do not deploy twice. Unknown outcomes stay locked; recover the hash from Rabby activity.
5. The page verifies creation data (including all four URIs) and deployed runtime code. Download the deployment record and provide the contract address/hash for subsequent mint integration.

The localStorage deployment record is convenience duplicate protection, not a global lock. It is scoped to this browser/origin. Do not switch origins/profiles or clear storage to retry an uncertain transaction. Check wallet activity first.

Compiler source bundle and constructor arguments are included for later explorer source verification. Local runtime matching is NOT explorer source verification, a security audit, gameplay verification, wallet rendering verification or Rialo integration.

Rebuild deployment-config.js with `node contracts/prepare-deployment.cjs` only before deployment; preserve the exact published build and record after deployment. Local UI test: test/deployment-ui.cjs uses Ganache with Sepolia chain ID and a mock Rabby provider, never a real wallet.
