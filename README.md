# Olgax DXP

An open-source, self-hostable page-building layer for **Payload CMS + Next.js**. Payload for
content, [Puck](https://puckeditor.com) for the drag-and-drop canvas, Olgax for the parts that
make it feel like a product.

> Status: **Phase 1 (MVP)** in progress. See `PHASE.md` and `.github/copilot-instructions.md`
> for the full phase breakdown.

## Monorepo structure

```
apps/
  demo/               # Reference Next.js + Payload + Puck site
  docs/               # Documentation site (not started yet)
packages/
  payload-preset/     # Pre-configured Payload collections (Users, Media, Pages)
  sdk/                # registerComponent() and related developer-facing APIs
  components/         # Default component library (Hero, Header, Footer, CTA, ...)
create-olgax-site/    # CLI scaffolder (not started yet)
```

## Getting started (local development)

This is a pnpm + Turborepo workspace.

```bash
pnpm install
cp apps/demo/.env.example apps/demo/.env   # then fill in PAYLOAD_SECRET
pnpm --filter demo seed                    # creates an admin user + demo page
pnpm dev                                   # runs all apps' dev servers via turbo
```

Then open [http://localhost:3000](http://localhost:3000) - it links to the demo page, the Puck
editor, and the Payload admin panel.

## Packages

- [`@olgax.com/payload-preset`](packages/payload-preset) - reusable Payload collections
- [`@olgax.com/sdk`](packages/sdk) - `registerComponent()`, the developer-facing API for adding
  components to the Puck config
- [`@olgax.com/components`](packages/components) - the default component library

## Contributing

See `CONTRIBUTING.md` (coming soon) and the "good first issue" label on GitHub Issues.

## License

MIT
