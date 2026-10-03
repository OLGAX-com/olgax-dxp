---
"create-olgax-site": minor
---

Scaffolded projects now work on the first run and have a clear path for custom components.

- The CLI creates `.env` with a generated `PAYLOAD_SECRET` and runs the seed, so `pnpm dev` shows a real homepage instead of the "no homepage" page.
- Generated projects include a `README.md` and a `LICENSE`.
- New `components/blocks/` folder for your own page-builder components, with a working `Callout` example and `pnpm new:component <Name>` to generate and register a new block.
- The first-run fallback page now explains how to fix a missing homepage.
