# Eric · Life Budget Studio

Status: development resumed. Single-period UI is released as a development preview. English UI; all amounts fictional Demo RLO. No payments, transactions, provider calls or live Rialo integration.

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

UI preview: eric.html uses existing character-2 NFT gate, rechecks before calculation, invalidates old reports on input and wallet changes, and offers ordinary / tuition increase / income reduction examples. Example selection resets permissions. No adoption, settlement or save library yet. Tests mock NFT authorization; no public transactions sent.

Version 0.7.1: explicitly keep a calculated proposal as a tab-local reference, then compare changed inputs, bucket totals and item-level allocations/status/gaps. IDs preserve identity across edits; additions/removals are identified. Example selection and access revocation clear references. Downloads include both input/result snapshots; no adoption or settlement. Tests: eric-comparison.test.cjs.

Version 0.7.2 adds 1–24 month deterministic rehearsal. Monthly income and bills repeat; funded expenses leave the simulated ledger at each month-end, cash/savings/goals carry forward and the shared permitted top-up cap resets monthly. Optional persistent income and/or bill replacement begins at a selected month. Baseline and revised paths share the same original input. Goal completion is reported as a month only if reached; unresolved paths stop at first unfunded bill/reserve deficit (no erased arrears or invented debt resolution). No interest, fees or real settlement. Reports include assumptions, original input and both paths. Tests: eric-rehearsal.test.cjs / eric-rehearsal-ui.test.cjs.

Version 0.7.3 connects the short three-step city budget lesson to Life Budget Studio. Four questions/four options, local quizVersion 1 and four correct answers required by the mint UI. The NFT contract still does not verify learning. Old Eric action replays are backed up and restart at lesson entry; existing onchain passes retain tool access. Education and mint completion link to eric.html.

Version 0.7.4: character-specific browser library (20 records) for model eric-budget-v1. Saves input cash/income/reserve/savings, named bills/goals and savings eligibility/cap. Enabled savings permission is stripped on save and import, and always off on load. Results, reference and rehearsal changes are excluded/reset. Shared backups validate whole files before adding copies; corrupt storage is not overwritten. No actual account balances or approvals.
