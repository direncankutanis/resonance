# Eric · Life Budget Studio

Status: development resumed. Phase 1 is a tested calculation foundation, not a released tool. English UI; all amounts fictional Demo RLO. No payments, transactions, provider calls or live Rialo integration.

## Product promise
Explain how a user-defined budget reacts when obligations change, while preserving protected cash and making shortfalls explicit. Never present allocation as payment. Never imply that an illustrative plan guarantees affordability.

## Journey and concrete example
Academy: allocate city energy to critical infrastructure, academy and upgrades. A higher academy requirement tests reserve protection and authorized fallback. Four-question check, Eric NFT, then the matching budget tool.
Tool: income arrives → rent allocation → education allocation → permitted savings top-up if necessary → goals receive the remainder. For a 200 RLO tuition increase, show the affected envelope, shortage, permitted funding source and impact on the savings balance before any future real authorization.

## Accounting and consent
One ledger with disjoint buckets: operating cash, protected floor within operating cash, flexible savings and goal balances. Internal moves conserve total value. Funding an obligation earmarks money; simulated settlement is a separate explicit action in a later phase. The foundation returns a proposal, never mutates the source balances.
Use integer hundredths. No credit, implicit borrowing, negative cash, invented income, yield or exchange rates. No money counted in two envelopes. Unmet obligations stop goal contributions. Underfunded reserve blocks spending and reports the deficit. Equal priorities resolve by due day, then stable input order; show this tie-break in the UI.
Flexible savings can fund only named obligations, within a shared per-period cap, and only when explicitly enabled in settings. No savings-funded goals. A suggestion is not consent. Insufficient resources produce a shortfall; no automatic partial payment. Each replan must start from the same snapshot until explicitly adopted.

## Meaningful depth, progressively disclosed
1. Editable obligations with amount, priority and due day; multiple goals with target, current balance, period contribution ceiling and priority. Basic view offers three transparent examples.
2. Event timeline: income reduction, fee increase, missed contribution, unexpected expense. Compare original plan and revised proposal side by side, including which goal loses funding. Event scope and effective period must be explicit.
3. Reserve rebuilding, optional goal minimums and percentage distribution. Explain infeasible combinations before adoption. Completed goals stop receiving money; priority allocation redirects remaining capacity without exceeding caps.
4. Multi-period rehearsal, deadlines and gap analysis. Show missed dates and required contributions under stated income/expense assumptions, with no forecast certainty.
5. Named local plans, backup/import, accessible mobile review, itemized decision trace. Stale results clear on every edit. NFT rechecked at actions.
6. Optional AI drafts user-stated rules only. Deterministic engine validates every field. Latch integration only after verifying supported controls; no claim it enforces ledger limits today.
7. Future real execution requires verified payment rails, recipient allowlists, asset/network compatibility, allowance limits, idempotency, receipts, revocation and reliable status reconciliation. Fiat rent requires a suitable payment provider; RLO labels alone cannot pay it.

## Build order and acceptance
A. Pure allocation engine and accounting tests (this iteration).
B. NFT-gated review UI, editable bills/goals, three examples: ordinary month / education increase / income shortfall. No auto-adoption when selecting an example.
C. Event comparison and explicit proposal adoption with duplicate protection; never call allocations paid.
D. Multi-period goals/deadlines, saved plans, short education and four-choice quiz.
E. Whole-product review across Diren, Ece, Ade, Eric. User study remains pending.

Foundation limits: single period, income supplied by user, due day 1–31 is ordering metadata, priority contributions only, no settlement or recurring schedule. No AI or Latch. Tests verify conservation, shortages, shared top-up limits, completed goals, reserve deficit, invalid input and input immutability.
