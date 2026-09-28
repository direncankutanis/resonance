# Resonance public release

Production: https://resonance-learning-adventure.vercel.app
Project: https://vercel.com/direncankutanis-projects/resonance-learning-adventure
Release: 0.6.5 — Ade Plan Lab learning check

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
- Diren vault simulation, guided experiments and Ece’s NFT-gated Reserve Studio. Eric development is paused and its tool is not included in this release.
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
