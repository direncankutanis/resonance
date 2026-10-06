# Resonance public release

Production: https://resonance-learning-adventure.vercel.app
Project: https://vercel.com/direncankutanis-projects/resonance-learning-adventure
Release: 0.9.6 — English / Turkish interface

## Update workflow

1. Edit the existing application sources in `output/selection/` and landing page in `integrations/web/home.html`.
2. Run the relevant lesson, mint or vault tests. Update the visible release notes/version when publishing a new release.
3. From the repository root run `python3 integrations/web/build.py`. This rebuilds the main game and copies an explicit allowlist into `output/vercel-site/public/`.
4. Preview/test this output, then commit and push approved changes to `main`. The connected Vercel project builds from the repository root using `vercel.json`.
5. Wait for the Vercel deployment to succeed and test the stable production URL. Local edits alone are not published; pushing to `main` triggers production deployment.

The Vercel project link stays in `output/vercel-site/.vercel/`; keep it private. `.env.local` created by Vercel CLI is excluded from uploads. Never copy private credentials or the Desktop project wholesale into the public folder.

## Public scope

- English landing page, release notes, education and four-question Diren quiz.
- Rabby read-only access checks and Sepolia mint UI. Mint requires user wallet approval and test ETH; no public-chain transaction was sent during deployment verification.
- Diren vault simulation, guided experiments and Ece’s NFT-gated Reserve Studio. Eric’s budget tool is a development preview; its short budget lesson and four-question check now link to the tool; monthly rehearsals are hypothetical and stop at unresolved shortfalls.
- AI and Latch endpoints run in server-only Python functions when RESONANCE_HOSTED_SERVICES=enabled. The same build flag enables their interface. Missing configuration keeps the public UI disabled. Credentials never enter the public assets.
- Ece settings can be saved and explicitly loaded for review. Completed-policy comparisons stay in page memory; no rehearsal auto-resumes.
- Browser saves are scoped to the origin. Localhost saves do not migrate automatically; wallet NFTs remain on Sepolia.

The project combines static public assets and Python proposal-only endpoints. It is separate from the existing `resonance-proposal-guard` service. Deploy from the repository root through the Git integration; deploying only `output/vercel-site` does not include the backend.

The shared Upstash quota admits at most 20 AI drafts and 100 Latch checks per 24-hour counter window, with global cooldowns. Quota/storage failure prevents provider calls; manual simulation remains available. This is not wallet authentication or a per-user allowance. See `integrations/hosted/README.md` for configuration and limitations.

Diren price sequences accept 2–12 fictional prices (1–200 RLO). Applying only prepares data. Review locks the sequence; each authorized advance consumes one price. Exhaustion never invents a new quote or step; cancel to return a waiting reserve. The stale-data switch and normal deadline still apply. New practice resets the sequence. Covered by price-sequence.test.cjs.

Named libraries: up to 20 scenarios per character, stored only in localStorage. Diren stores applied prices, current limits and stale flag; Ece stores applied events and current protection settings. Loading validates and fills fields without approval, execution or balance refill. Records can be copied, replaced and deleted. Invalid/unavailable storage fails without overwriting existing records. The legacy Ece single-policy save remains intact. Tests: scenario-library.test.cjs.

Library transfer: versioned character-specific JSON, maximum 128 KB and 20 scenarios total. Validate the whole file, preview names, then add copies with fresh IDs. Imports never overwrite records or load/start a practice. Export includes canonical demo settings and names only. No wallet, NFT, credential or approval transfer. Tests: library-transfer.test.cjs.

First-use layout: guide and templates lead; libraries, custom editors and Ece AI/legacy saves are grouped below. Existing event handlers and approval semantics stay intact. USER_TEST_PLAN.md describes a 3–5 participant study; no human study results are claimed.

Ade Plan Lab: current Ade NFT access, validated saved-plan limits, two-policy comparisons on fictional price paths and a separate compound-growth model. See output/selection/vault/ADE_PLAN_LAB.md for accounting, import mappings and limitations. No live feeds or additional provider calls.

### Demo budget units (0.9.4)
Shared `demo-unit.js` provides Demo RLO (legacy default) and Demo rloUSDT. The latter is a fictional denomination, not a deployed token, peg or exchange rate. Changing it requires confirmation and reloads the current page, clearing unsaved simulation state. Numeric examples are unchanged; no FX is applied. Other open tabs retain their session unit until reload.
Scenario records store `demoUnit`; legacy records mean RLO. Cross-unit loads and plan transfers are rejected. Ece's older single-policy storage is separated by denomination. Downloaded reports include the unit and false real-funds flag. AI uses the existing numerical demo schema (label normalization only); Latch checks amounts, not currencies, and its record explicitly states that limitation. NFT contracts, wallet networks and Sepolia ETH gas are unaffected.

### My Resonance (0.9.4)
`/my/index.html` shows current-version local lesson completion independently of Sepolia NFT ownership. Rabby connection is explicit. Read-only checks verify runtime code, all four character balances and account/network consistency; account/network events clear results, and visible verified sessions recheck every 15 seconds and on focus. No ownership cache is saved. Each tool retains its own gate.
Local libraries show names and original budget units without loading or executing them. `?plan=ID#scenario-library` selects a record only; ownership verification and an explicit Load action are still required. Corrupt storage is reported and never overwritten. Local progress and plans are browser-specific, not linked to a wallet or synced to a server.
Validation: dashboard browser tests mock provider responses to cover current/old lessons, held and transferred NFTs, wrong network/runtime, corrupt local storage, plan handoff and mobile width. These tests do not make public-chain transactions. Existing home, navigation and scenario library checks pass.

## English / Turkish interface

English remains the default. The EN/TR control persists a browser preference and switches authored interface text in place. Translation catalogs live in `output/selection/i18n/`; the build generates `tr.js`. User names, plan names, identifiers and machine-readable report fields retain their original values. External wallet/provider messages may remain in their original language.

Validation: four Turkish character lessons and quizzes, recovery and replay; live language switching with unchanged inputs, results, saved names and denomination; six-page preference persistence and mobile layout.

### Character lesson briefings (0.9.4)
Each short lesson opens a concise EN/TR briefing on first entry. A checkbox acknowledges reading; the browser remembers each character separately. Lesson information reopens it without resetting the lesson. Save replay bypasses the introduction so existing journeys restore normally.

### First examples (0.9.4)
A prominent starter prepares a worked example in each vault. Diren has explicit review, reservation, condition and execution steps ending in exactly one simulated purchase. Preparation clears stale-data and custom-price-sequence settings. Existing ownership checks and explicit confirmation remain in place; no AI/Latch availability is needed. Ece, Eric and Ade starters lead to their existing review and result controls. EN/TR supported.

### Wallet recovery (0.9.4)
Unchanged account/network notifications no longer cancel a demo. Concurrent ownership checks share one request; transient RPC failures pause authorization without discarding the simulation. Genuine account/network changes, missing ownership or invalid contract still lock access. Diren serializes advance requests to prevent double-clicks consuming two steps. Outcome translations and a fresh guided-purchase shortcut are included. Mock-provider tests cover duplicate events, RPC recovery, double-clicks and real account changes.

### Turkish message coverage (0.9.4)
Expanded authored translations for vault templates, validation, AI/Latch statuses, mint feedback and library actions. Full dynamic sentences cover purchase history, policy decisions and comparison math, including combined result paragraphs. Browser flow checks cover all four vault starters/results; focused message tests preserve all numeric amounts. User-authored names and external wallet messages retain their original language.

### Transaction desk and Web3 examples (0.9.4)
Four vaults offer a transaction desk with rules and results side by side on desktop, stacked on mobile. Existing controls and wallet checks are reused, with the workspace hidden on access loss. Ece shows protected/unprotected cash and acquired units; extra retained cash is not called profit. Ade explains A/B on the same market path and distinguishes unrealized value from realized profit. Eric defaults use Web3 service/RPC subscriptions, gas reserve and protocol budget. They remain local allocations, not live payment, gas estimation or borrow integration.

### Diren default desk (0.9.4)
Diren now opens an inline workspace: example and editable rule on the left, confirmation/balances/execution/outcome on the right. Advanced examples, AI and saved plans are collapsed. Existing ownership checks and action handlers are retained; mobile stacks the two sections.

### Audit fixes (0.9.4, 5 October 2026)
Fixed misleading original-example instructions after editing Diren budget, price, deadline or stale-data inputs. Saved-plan deep links now open the containing advanced section. Verified transaction desks, gate recovery, first examples, orientation, denomination, three calculation engines, message translation and language/state preservation. Wallet flows use mocked ownership and provider responses; live wallet/provider reliability is not established by these tests.

### Wallet timeout and regression checks (0.9.4)
Read-only wallet RPC requests now time out after 10 seconds rather than locking the UI indefinitely. The current demo survives transient failures and can retry. User connection and network approval prompts are not timed out by this wrapper. Regression checks cover a non-resolving RPC, retry, duplicate notifications and genuine account revocation.

### All tools inline (0.9.4)
Ece, Ade and Eric now use a default two-column workspace: inputs on the left, review/results on the right. Advanced and saved-plan tools remain expandable. Existing authorization, approval and calculation handlers are retained. Mobile stacks the same controls vertically.

### Outcome lifecycle and release checks (0.9.5, 6 October 2026)
Ece clears old outcome cards and reports when revising a rehearsal and displays the fresh starting balance. Access revocation clears the old run and makes the first-example guide reusable for every tool. Eric uses the Web3 Budget Studio name in navigation and the personal dashboard.

Build first, then run `python3 integrations/web/check_release.py` for the local regression suite (Node, Playwright/Chrome and contract dependencies required). Use `--match protection` to focus checks. The command writes a temporary JSON report and returns nonzero if a check fails. These checks use simulated providers/local chain; real Rabby/Sepolia acceptance and live AI/Latch remain separate.

### Workspace polish (0.9.6)
Shared responsive styles and keyboard-accessible shortcuts connect inputs, results and advanced tools. Eric examples and reference controls sit beside their corresponding form/result. Repeated guide steps are collapsible. New reviews reset the result pane scroll. Ade and Eric show pending access checks; transient warnings clear after successful verification. Ade price and duration validation focuses the invalid field. Additional Turkish guide copy is complete.
