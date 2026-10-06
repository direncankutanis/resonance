# Release readiness — 6 October 2026

## Scope
Educational game + Sepolia NFT access + four local financial simulations. Live trading, Rialo execution, borrowing and payments are not implemented. Passing the tests below does not certify zero bugs or financial safety.

## This pass
Fixed an unbounded read-only wallet RPC wait: each request now has a 10-second timeout. Transient failure retains the current demo. Connection and network-switch prompts remain user-controlled.
Updated library/template tests to open the advanced section introduced by the new Diren workspace; retained their original behavioral assertions.

## Passed
- Four Turkish lessons, incorrect-rule retry, quizzes, migration and progress recovery.
- My Resonance: NFT checks, network change, transferred NFT, wrong contract, corrupt storage, mobile.
- Diren/Ece saved libraries: persistence, load without execution, update/copy/delete, active-review lock, corrupt storage, mobile.
- Diren successful purchase, reversal and expiry examples; Ece three templates and expected balances.
- Eric comparison and library; Ade library and assumptions; Ece summary arithmetic.
- Wallet recovery: duplicate notifications, transient RPC failure, non-resolving RPC, retry, double-click, genuine account change. All use a mock wallet/provider.
- 12 hosted-service tests: request boundaries, failure handling and protection checks; local mocked services.

## Required live acceptance
- User-held Diren NFT via real Rabby: connect, verify, complete one demo purchase, retry a read-only check.
- User-operated Sepolia mint and resulting NFT access; no mint transaction was submitted in this audit.
- Live AI/Latch availability and quota behavior require separate verification; local service tests do not establish live uptime.

## Next development
Complete the live acceptance checks above. All four tools now use inline desks; layout tests cover completed demo examples, collapsed advanced sections and mobile overflow. Real wallet transactions remain unverified.

## 0.9.5 audit
- All 38 existing selection regression scripts passed across the initial run and focused reruns; updated obsolete disclosure/guide expectations to the current inline layout.
- New result-lifecycle regression passed: Ece outcome removal and fresh balance on revision, fresh policy comparison, first-example recovery after access revocation.
- Four Turkish lessons/quiz recovery and 12 hosted-service unit tests passed.
- Local real-contract mint UI passed: receipt verification, duplicate guard, transfer, wrong network, rejection/retry and unknown-outcome lock. No public-chain transaction was submitted.
- Real-user wallet acceptance is deferred at the user’s request. Live service availability is not established by local tests.

## 0.9.6 verification
Full local release runner: 44/44 checks passed on 6 October 2026. Includes all selection regressions, 320/390px workspace layout, keyboard shortcuts, TR labels, pending access feedback, focused validation, lesson recovery, local-contract mint UI, home page and hosted-service unit suite (12 tests). Real Rabby/Sepolia acceptance and live AI/Latch uptime remain deferred.

## 0.9.7 verification
46 local checks passed across the complete run and focused reruns. Added result-summary branches, collapsed-detail access, keyboard-focusable tables, 320px layout, summary visibility below toolbar, and incremental translation checks. The initial denomination assertion was updated to open the new details disclosure; both summary and detail amounts are checked. Existing calculation engines are unchanged. No real wallet or live-service acceptance is claimed.
