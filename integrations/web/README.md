# Resonance public release

Production: https://resonance-learning-adventure.vercel.app
Project: https://vercel.com/direncankutanis-projects/resonance-learning-adventure
Release: 0.4.0 — Ece Reserve Studio

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
- Browser saves are scoped to the origin. Localhost saves do not migrate automatically; wallet NFTs remain on Sepolia.

The project combines static public assets and two Python proposal-only endpoints. It is separate from the existing `resonance-proposal-guard` service. Deploy from the repository root through the Git integration; deploying only `output/vercel-site` does not include the backend.

The shared Upstash quota admits at most 20 AI drafts and 100 Latch checks per 24-hour counter window, with global cooldowns. Quota/storage failure prevents provider calls; manual simulation remains available. This is not wallet authentication or a per-user allowance. See `integrations/hosted/README.md` for configuration and limitations.
