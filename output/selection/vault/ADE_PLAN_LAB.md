# Ade Plan Lab · v0.6 preview

Purpose: explain and audit user-defined rules before any real authorization. Uses existing Ece deterministic guards (price, freshness, shared weekly cap, cash reserve), with two policies under identical fictional paths. Ade NFT (character 3) grants current-ownership access; the gate never sends transactions. Eric remains paused.

## Accounting
Integer hundredths of Demo RLO for policy/event inputs. Each accepted order spends its total including 0.10 fee, acquiring (order − fee) / price units. Ending equity = remaining cash + units × last price. Gain/loss = equity − starting balance. Fees already reduce units and must not be deducted twice. No liquidation occurs. Taxes, slippage, sale fees and live markets are excluded. Policy A and B require equal starting balances. A cash floor cannot protect asset market value.

Paths are equally visible −30%, 0%, +30% linear illustrations, not probabilistic forecasts. 2–12 weeks, 1–5 orders at the start of each week. Starting prices 1.43–153.84 keep all generated prices inside engine bounds. No extra contributions occur in trading scenarios. Orders recheck cumulative state sequentially. Audit covers current engine constraints, not arbitrary logical theorem proving or smart contract security.

Compound calculator is separate, never added to trading outcomes. Monthly return = user nominal annual rate / 12. Monthly fee on post-growth invested balance, then month-end contribution. Reserve earns zero. Contributions and gain/loss reported separately. Supports negative rates; default return is zero. No real RLO yield implied. Floating point arithmetic models illustrative valuation, not chain settlement.

## Reuse and limits
Reads named libraries in this origin only. Ece imports six validated policy settings, not saved events. Diren imports order amount and price limit only; one-shot expiry, saved price path and state do not map to this repeated weekly experiment. Import does not mutate source records. UI explains this mapping. Calculations require current gate verification. Changed inputs invalidate old results. Reports contain assumptions and result paths only.

No AI inference, Latch enforcement, live Rialo transactions or real trading. Actual usability study remains pending per USER_TEST_PLAN.md. Next work should follow user feedback; do not imply forecast accuracy from deterministic test success.

Tests: ade-engine.test.cjs (fee accounting, stale data, bounds, contribution/growth separation); ade-ui.test.cjs (comparison/audits/invalidation/download/mobile); contracts/test/ade-gate.cjs (local-chain NFT grant/revoke, wrong character, read-only requests).

Version 0.6.1 adds conditional whole-order capacity explanations (total, weekly, proposals per event, earliest depletion under qualifying conditions), an explicit stale-data warning, scenario-selectable charts beginning at initial equity, and per-week price/cash/value/decision tables. These capacities are not forecasts.

Version 0.6.2: named analysis library (20 browser-local records) with model ade-v1. Each record contains validated A/B policies, common market parameters and independent compound assumptions. Loading clears prior results and requires explicit recalculation. Shared backup/import validates character/model, preserves existing records and transfers no access or approvals. Corrupt storage remains untouched. Test: ade-library.test.cjs plus shared Diren/Ece library regressions.

Version 0.6.3: optional disruption suite, 4–12 weeks. Shock: week 2 −30%, linear imposed recovery to initial price. Outage: weeks 2 through floor(weeks/2)+1 use age 1440, other events use user age, flat price; valuation remains hypothetical, not a reliable tradable quote. Burst: 3 events each week on days 1/2/3, each using user order count and a shared cap. Chart x-axis uses actual day spacing; decision table includes day and quote age. Saved analyses store path.suite; older records default to baseline. No probabilities, forecasts or external feeds. Tests: ade-stress.test.cjs and ade-stress-ui.test.cjs.

Version 0.6.4: separate compound illustration includes contribution vs invested-value chart and monthly breakdown (contributions, investment, gain/loss, cumulative fees, unchanged reserve, total). A dedicated report includes exact assumptions and all monthly rows. Input changes, analysis reload and access revocation clear old growth visuals/report. Tests: ade-growth-ui.test.cjs.

Version 0.6.5 aligns Ade’s short lesson with Plan Lab: four questions, four choices, covering AND, cash reserves vs asset risk, contributions vs gain, and assumptions vs forecasts. New local Ade pass schema is quizVersion 1 / correctAnswers 4. Existing NFTs keep access. Old Ade quiz replays restart at question 1 with a backup; other learning passes remain. The test contract still does not verify lessons.

Version 0.6.6 adds three one-variable guided comparisons (reserve, weekly cap, freshness). Loading replaces comparison inputs only, clears old results, preserves growth and saved records, and requires explicit comparison. The relevant disruption path is selected after calculation. Manual edits/import/library loads remove the guided context. No automatic execution or recommendations.

Version 0.6.7 explains each selected comparison with changed boundaries, B-minus-A accounting, the first differing accept/stop decision and a next experiment. Multiple changes are not assigned single-cause attribution; later state dependence is explicit. No ranking or financial recommendation.
