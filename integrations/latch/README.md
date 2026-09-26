# Resonance × Latch integration preparation

Status: local learning bridge and policy examples implemented. No model API, Latch account, upstream server, agent key or Privy signer is connected. No financial action has been authorized through Latch.

Keep the story continuous: character lesson → character NFT → corresponding tool → agent drafts a plan → human approves exact limits → policy checks → constrained execution → explain outcome using the learned concept. Diren is the first complete vertical path. Ece, Eric and Ade retain their distinct concepts; avoid presenting four identical agents.

The current guided plan builder is a deterministic template, explicitly not AI. Local policy outcomes are explicitly not Latch results. Current NFT checks are read-only on Sepolia; purchase amounts are fictional. No new account, credential or wallet permission has been created.

Next live steps:
1. User signs into their Latch account; create a proposal-only latch using a real controlled upstream. No signing secret or funded agent wallet is needed for the first policy dry-run. Use the dashboard's configured filters and scenario interface; the example JSON here is a design artifact, not an API creation payload.
2. Translate example filters to the live configuration and run allowed/over-cap/wrong-asset/missing-field/malformed cases. Capture actual filter traces, not local mock results. Validate types and integers server-side.
3. Add a backend for AI plan generation and Latch calls. Keep tokens and model keys out of browser files. Agent outputs are untrusted structured proposals; they cannot alter the user's approved policy. No arbitrary URLs, calldata or recipients from model output are forwarded.
4. Bind approved plan version, identity, NFT access, asset, budget, deadline and execution destination on the server/contract. An NFT is access, not a spending authorization. Validate current state at execution, not just a model's asserted budget or price.
5. For autonomous test transactions, verify the Latch signer setup and compatible ABI. The documented Privy signer wallet is separate from the current Rabby wallet. Never move the Rabby private key into an agent. Start with a narrowly scoped test wallet only after explicit user authorization.
6. Enforce aggregate budget with atomic reservations and idempotency across retries and concurrent requests. Latch Simulate skips live stateful spend/rate filters; per-call cap is not a cumulative spending guarantee. No opaque transaction bypass of typed argument policies.

Sources checked 20 September 2026:
- https://onlatch.com/docs/guides/simulate
- https://onlatch.com/docs/filters/reference
- https://onlatch.com/docs/guides/tx-signing-privy

The user has a Latch account but has not created a latch (confirmed 20 September 2026). The next live dependencies are a configured proposal-only latch and a controlled upstream. Do not label the local proposal demo as an integrated Latch agent. Reactive execution on Rialo and Latch authorization remain separate responsibilities; network and execution integrations must be verified independently.

## Proposal upstream preparation
proposal-server.py is a loopback-only, authenticated demo upstream. It accepts only the strict buy/DEMO/integer amount schema and always returns executed:false. test-proposals.py passed locally for eight proposal scenarios plus HTTP authentication, oversized/duplicate JSON, endpoint and over-cap rejection. This is not a live Latch test. The server is not hosted and not intended to be exposed directly as a production HTTP server; deploy behind a managed HTTPS runtime before configuring the immutable upstream binding. No secret was generated or stored. See SETUP.md and pipeline.json for the dashboard setup packet.

Vercel preparation: vercel/ contains the minimal Python function deployment. test-vercel.py passed locally. Missing service secret fails closed with 503. CLI 59.23.2 requires a fresh user login; no deployment yet. Target team supplied by user: direncankutanis-projects.

Live Vercel verification: https://resonance-proposal-guard.vercel.app/proposals returned 200/executed:false for valid authenticated proposal, 422 for over-cap and 401 for wrong credential. Latch not connected. Secret retained only in restricted local .private folder and Vercel production environment; excluded from source/deployment. User must enter it in Latch secret form.

Dashboard setup: five filters prepared, JSON paths use $. prefix and string values entered without quotes. Review dry-run allowed valid body and denied wrong method/path/size/action. Not activated; secret is still staged and is encrypted on activation. Rate limit 10/min is not verified by dry-run. Strict integer/extra-field checks are server-side only. dashboard-policy.json records the actual draft, distinct from the fuller proposed policy.

Live proxy verified: the locally saved latch token successfully called https://onlatch.com/proxy/proposals. 2000 minor units returned 200 with proposal_accepted and executed:false; 3000 returned 403 with deniedBy. This verifies Latch-to-Vercel forwarding and policy denial, not AI integration, real purchases or the live rate limiter. No credentials are included in test results.

Application bridge: app-server.py serves previews at http://127.0.0.1:8767 and provides same-origin POST /api/latch/check. Token stays in the local private file. Fixed upstream/action/asset; checks are optional proposal diagnostics, not execution authorization or server-verified NFT access. Browser live ALLOW, changed-plan invalidation, no reservation, connection failure and mobile checks passed. HTTP foreign-origin denial and real over-cap Latch DENY passed. UI gate was mocked for UI testing only; existing gate code unchanged. Launch with python3 integrations/latch/app-server.py from project root. Port 8765 static preview does not support the live endpoint.

AI guide preparation verified: /api/ai/plan explicitly returns not_configured until a provider is selected. Strict structured-plan validator rejects unsupported assets/actions, oversized budgets, invalid expiry and extra keys. Browser tests passed for unavailable-provider notice, explicit Apply, zero reservation, Latch result invalidation, intent edits clearing proposals, mobile width and no page errors. Model responses and NFT authorization were mocked only in the UI test. No real AI inference occurred. Local server restarted on 8767. Pending: user model API provider choice and credentials supplied outside chat.

Gemini integration complete: user confirmed Free tier before calls. Model gemini-3.5-flash-lite was selected after 2.5-flash-lite returned new-user unavailability; official pricing lists free-tier text input/output. Key stays in .private/gemini-api-key.txt. Real prompt extraction verified 1500 budgetMinor, 800 limitMinor, 5 steps. Browser test passed real Gemini → explicit Apply → real Latch ALLOW, with no reservation. NFT authorization was mocked for that test only. Quota error display tested with a mock 429-equivalent application response. Generation has no automatic retry, tools, model fallback or execution privileges; 10-second spacing, one concurrent generation and 20 calls per server process. These local limits reset on restart and are not a billing guarantee. User must keep the Google project on Free tier; app cannot detect a later billing change. Gemini calls go directly through the local backend to Google; only proposal checking uses Latch. Responses are strictly validated. Source: https://ai.google.dev/gemini-api/docs/pricing

Eric scheduled vault: separate simulation at /vault/scheduled.html. Matching Eric NFT required by the shared read-only gate. Fixed opportunities, per-purchase amount, total reservation, price cap, pause/skip/refund and cancellation. No model or Latch calls in Eric; the current proposal policy remains Diren-only. Tests: output/selection/vault/scheduled-engine.test.cjs and contracts/test/scheduled-vault.cjs, plus Diren gate regression.
