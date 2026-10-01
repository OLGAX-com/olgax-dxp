# Olgax DXP

[![CI](https://github.com/OLGAX-com/olgax-dxp/actions/workflows/ci.yml/badge.svg)](https://github.com/OLGAX-com/olgax-dxp/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/create-olgax-site.svg)](https://www.npmjs.com/package/create-olgax-site)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**Olgax DXP** is an open-source, self-hostable page-building layer for **Payload CMS + Next.js**.
[Payload](https://payloadcms.com) handles content, auth, and drafts; [Puck](https://puckeditor.com)
is the drag-and-drop visual canvas; `@olgax.com/*` is the component registry, default component
library, renderer, and CLI that ties the two together into a working site in minutes.

If you want a self-hosted alternative to page builders like Builder.io or Webstudio, but built on
tools you already trust (Payload for content, Puck for the canvas), this is for you.

> Status: **Phase 1 (MVP)**. See [PHASE.md](PHASE.md) for the current phase.

## Quick start

```bash
npx create-olgax-site my-site
cd my-site
pnpm dev
```

That's it - a runnable Next.js + Payload + Puck project with an admin panel, a visual page
editor, and a seeded demo page.

## Features

### Visual page building
- Drag-and-drop editing powered by [Puck](https://puckeditor.com), with page content stored as
  structured JSON in Payload - no proprietary page format to migrate away from later.
- **8 default components** - Hero, Header, Footer, CTA, Gallery, Pricing, FAQ, Testimonials -
  plus `RelatedPages` for pulling in real content from a Payload collection.
- Every component is themeable via CSS custom properties (`--olgax-*`), with per-instance color
  overrides settable right from the Puck editor - no forking components to restyle them.
- Start a new page from a reusable `Sections` template instead of a blank canvas.

### Content & editing
- Drafts and publishing built on Payload's own `versions.drafts` - autosave while editing,
  explicit publish for what goes live.
- A floating "Edit this page" link for logged-in editors, right on the live site.
- A proper multi-tab admin dashboard (Overview, Pages, Analytics, Settings) with search,
  duplicate, delete, and "start from section" actions.

### Data & integrations
- **Data sources**: components can declare "pull N items from a Payload collection, filtered by
  one field" and receive resolved data as props, via `@olgax.com/datasource`.
- **Outbound webhooks**: HMAC-SHA256 signed `page.published`/`page.deleted` events, so Slack,
  Zapier, a rebuild trigger, or any custom endpoint can react to content changes.

### Localization
- Locale-prefixed routes (`/en/...`, `/es/...`) via Payload's built-in localization, with a
  site-wide on/off toggle. `Pages` and `Sections` content is localized, falling back to the
  default locale for untranslated content.

### Personalization
- A single, narrow visibility rule per component instance - show to everyone, new visitors
  only, or returning visitors only - via a first-party, no-PII cookie. Deliberately not a
  general segments/audiences/rules-engine system.

### Analytics
- A built-in, privacy-friendly page-view counter (day-bucketed, no PII, no cookies), zero setup.
- Optional integration with a self-hosted [Umami](https://umami.is) instance for deeper
  analytics (countries, sessions, devices, browsers, referrers) - entirely opt-in via env vars,
  with a bundled `docker-compose.umami.yml`.

### Security & production readiness
- Explicit access control on every collection (Payload does not restrict access by default).
- Database adapter picked automatically from `DATABASE_URL` - SQLite for zero-config local dev,
  Postgres for production - with explicit migration tooling for schema changes.

## Packages

| Package | Description |
| --- | --- |
| [`create-olgax-site`](create-olgax-site) | CLI scaffolder - `npx create-olgax-site my-site` |
| [`@olgax.com/payload-preset`](packages/payload-preset) | Reusable Payload collections/globals: `Users`, `Media`, `Pages`, `Sections`, `PageViews`, `Webhooks`, `SiteSettings` |
| [`@olgax.com/sdk`](packages/sdk) | `registerComponent()`, theming, and personalization helpers - the developer-facing API |
| [`@olgax.com/components`](packages/components) | The default, themeable component library |
| [`@olgax.com/datasource`](packages/datasource) | Collection/filter/limit data resolvers connecting components to real Payload content |

## Monorepo structure

```
apps/
  demo/               # Reference Next.js + Payload + Puck site
  docs/               # Documentation site
packages/
  payload-preset/     # Pre-configured Payload collections and globals
  sdk/                # registerComponent() and related developer-facing APIs
  components/         # Default component library (Hero, Header, Footer, CTA, ...)
  datasource/         # Collection/filter/limit data resolvers
create-olgax-site/    # CLI scaffolder (npx create-olgax-site)
```

## Local development (this monorepo)

This is a pnpm + Turborepo workspace.

```bash
pnpm install
cp apps/demo/.env.example apps/demo/.env   # then fill in PAYLOAD_SECRET
pnpm --filter demo seed                    # creates an admin user + demo page
pnpm dev                                   # runs all apps' dev servers via turbo
```

Then open [http://localhost:3000](http://localhost:3000) - it links to the demo page, the Puck
editor, and the Payload admin panel.

## Documentation

See `apps/docs` for guides on installation, the SDK, theming, data sources, drafts,
personalization, webhooks, and production deployment.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and the "good first issue" label on GitHub Issues.

## License

MIT

