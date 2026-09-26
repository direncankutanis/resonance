# Resonance public release

Production: https://resonance-learning-adventure.vercel.app
Project: https://vercel.com/direncankutanis-projects/resonance-learning-adventure
Release: 0.2.0 — 21 September 2026
Deployment: dpl_5XuFkdBuXDafojFNXnCFfDvggHRm

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
- Diren vault simulation and guided experiments. Eric development is paused and its tool is not included in this release.
- AI and Latch credential-backed calls remain local. The public build replaces those modules with clear availability notices and disables AI entry; it has no `/api` backend or credentials. Local source features remain unchanged.
- Browser saves are scoped to the origin. Localhost saves do not migrate automatically; wallet NFTs remain on Sepolia.

The build is a static Vercel project, separate from the existing `resonance-proposal-guard` service. No paid add-on, custom domain purchase, or AI billing was enabled.

Next hosted integration needs a shared request budget and abuse controls before exposing model and Latch service credentials through a server. Local process counters are not a global serverless quota.
