# Hosted proposal services — preparation

Status: provider connections and live Redis admission verified locally; production deployment validation pending. No real trading.

Endpoints: POST /api/ai/plan and POST /api/latch/check. The browser never receives service credentials. AI drafts require explicit application and final review; Latch approval does not execute a purchase or prove NFT ownership.

Production setup still required:
1. Create a permanent free Upstash Redis database in the project owner's account.
2. Store UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, GEMINI_API_KEY and LATCH_TOKEN as server-only Vercel environment variables. Never commit them.
3. Verify atomic Redis admission against the actual service and test Vercel Python packaging and routes.
4. Enable RESONANCE_HOSTED_SERVICES=enabled only after configuration. This flag also enables the public AI and Latch interface during the build.
5. Test actual provider responses and explicit user review on the deployed site before announcing availability.

Limits: 20 AI requests and 100 Latch requests across all visitors per 24-hour counter window, with global cooldowns. Failed provider calls still count. Missing or unavailable Redis fails closed. Origin checks are not authentication; public quota can be exhausted by another visitor. Manual simulation remains available. These limits do not change provider billing settings: keep all accounts on free plans.

Validation: python3 -m unittest integrations.hosted.test_service uses mocked external services plus a local HTTP boundary test. It does not establish live Redis, AI or Latch connectivity.

Live validation: `python3 -m integrations.hosted.check_redis_live` uses a unique expiring test prefix, not production counters. `browser-flow.test.cjs` checks draft/apply/check/final-confirm boundaries with mocked providers and NFT access.
