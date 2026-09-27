# Ece Reserve Studio

A deterministic rehearsal of a budget policy over qualifying Diren-style purchase proposals. All amounts are Demo RLO, internally stored as integer hundredths. No blockchain transaction, approval, autonomous agent or live Latch enforcement.

Rules: keep a reserve, share one cap across all orders in a seven-day demo period, reject old quotes, preserve the price threshold. Recheck cumulative state for each order. Weekly reset does not refill the balance. All accepted orders include a 0.10 Demo RLO fee.

Three fixtures: simultaneous qualifying orders across two weeks, a reserve-draining streak, and a data outage that recovers. The unprotected comparison keeps the same proposals, price condition and fees; it omits Ece’s three guards. Cash retained is not investment performance. Reports are unsigned local simulation records.

The Ece NFT gate uses current Sepolia ownership and cancels the active rehearsal on revoked access. A browser gate is not financial enforcement. Old Ece local quiz passes no longer unlock the app mint flow; existing NFTs continue to work. Older Ece game saves restart the revised lesson and preserve a backup.

Diren’s confirmed order budget and price limit can be copied through same-tab session storage. No funds, expiry, ownership or authorization is imported. All Ece settings need a new explicit review.

Tests: protection-engine.test.cjs; protection-ui.test.cjs (mock wallet); contracts/test/ece-gate.cjs (local chain); character lesson and mint regression checks.

Next integration: a server/contract must enforce cumulative budgets atomically with trusted timestamps and quotes before handling real funds. Extending the existing Latch single-proposal check is separate work.

Optional AI helper: /api/ai/protection extracts all six explicitly stated boundaries. Same shared hosted AI quota as Diren; no separate allowance or paid fallback. Generated values require explicit application, review and confirmation. Changed input/context invalidates pending drafts. Gemini does not enforce rules or grant Latch approval.

Saved settings: explicitly save one validated six-field policy to this browser’s local storage. Loading revalidates and fills the form; it never starts or resumes a rehearsal. Storage failures and corrupted records leave the form unchanged. No wallet or authorization is saved.

Policy comparison: retain the last completed run per scenario in page memory. A second completed run shows both settings and outcomes; aborted runs do not replace the comparison. Different starting balances are disclosed. Comparisons reset on reload or wallet access changes and are included in the unsigned report. Remaining cash is not investment performance. Covered by protection-save.test.cjs (mock wallet).

Learning templates: Weekly pacing sets a 20 RLO cap in the crowded scenario (60 RLO remains), Keep a buffer uses the reserve scenario (40 remains), Fresh quotes uses the stale scenario (80 remains). Selection fills editable fields and selects the fixture; review and confirmation are separate. Editing fields invalidates expected-outcome guidance. No AI call. learning-templates.test.cjs checks these balances and Diren’s success, reversal and expiry examples.

Every decision has an optional numeric breakdown using the balance and weekly spend immediately before that order. Rejected orders keep their prior balance; accepted orders include the fee once. Diren has an event-driven next-step coach for registration, queueing and terminal outcomes.

Journey: current lesson completion links to the matching tool, where current NFT ownership is verified. A verified missing pass exposes the matching mint link. The optional three-step guide follows draft/review/active/finished states, and its repeat action returns to editable settings without starting a new run. No access or learning completion is inferred from the guide.
