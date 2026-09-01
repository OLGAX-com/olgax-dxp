# Changelog

All notable changes to Olgax DXP are documented here. From this point forward, releases are
managed by [Changesets](https://github.com/changesets/changesets) - see `CONTRIBUTING.md`.

## 0.1.0 - First public release

An open-source, self-hostable page-building layer for Payload CMS + Next.js: Payload for
content, [Puck](https://puckeditor.com) for the drag-and-drop canvas, `@olgax/*` for the parts
that make it feel like a product.

### Core

- **`create-olgax-site`** CLI scaffolder - `npx create-olgax-site my-site` produces a runnable
  Next.js + Payload + Puck project.
- **`@olgax/payload-preset`** - reusable Payload collections/globals: `Users`, `Media`, `Pages`
  (with drafts/versioning), `Sections` (reusable page templates), `SiteSettings`, `PageViews`,
  `Webhooks`.
- **`@olgax/sdk`** - `registerComponent()`, `colorOverrideFields()`/`colorOverrideStyle()`
  (per-instance color overrides), `visibilityFields()`/`isVisible()` (personalization).
- **`@olgax/components`** - 8 default components (Hero, Header, Footer, CTA, Gallery, Pricing,
  FAQ, Testimonials) plus `RelatedPages`, all themeable via CSS custom properties.
- **`@olgax/datasource`** - collection/filter/limit data resolvers for components that need real
  Payload data (Local API and fetch-based variants).

### Content & editing

- Drafts and publishing on top of Payload's built-in `versions.drafts` - autosave while editing,
  explicit publish for what goes live.
- Start a new page from a reusable `Sections` template instead of a blank canvas.
- Site-wide theming (colors) via `SiteSettings`, with per-page and per-component overrides in
  the Puck editor itself.
- A floating "Edit this page" link for logged-in editors on the live site.

### Localization

- Locale-prefixed routes (`/en/...`, `/es/...`) via Payload's built-in `localization` config,
  with a site-wide on/off toggle - disable it and the site serves the default locale at bare
  URLs instead.
- `Pages` and `Sections` content is localized; falls back to the default locale for
  untranslated content.

### Admin dashboard

- A proper multi-tab dashboard (`/dashboard`) - Overview, Pages, Analytics, Settings - replacing
  an earlier flat page-management view.
- Page management: search, duplicate, delete, "start from section," locale switcher.

### Analytics

- A built-in, privacy-friendly page-view counter (day-bucketed, no PII, no cookies) with zero
  setup.
- Optional integration with a self-hosted [Umami](https://umami.is) instance for broader
  analytics (countries, sessions, devices, browsers, referrers) - entirely opt-in via env vars,
  bundled `docker-compose.umami.yml` for self-hosting it.

### Personalization

- A single, narrow visibility rule per component instance - show to everyone, new visitors
  only, or returning visitors only - via a first-party, no-PII cookie. Deliberately not a
  general segments/audiences/rules-engine system.

### Integrations

- Outbound webhooks (`page.published`, `page.deleted`) with HMAC-SHA256 signed payloads, so any
  external system (Slack, Zapier, a rebuild trigger, a custom endpoint) can react to content
  changes without olgax-dxp needing to know about it specifically.

### Security & production

- Explicit access control on every collection (Payload does not restrict access by default).
- Database adapter picked automatically from `DATABASE_URL` - SQLite for zero-config local dev,
  Postgres for production.
- Explicit migration tooling (`migrate`/`migrate:create`/`migrate:status`) for schema changes
  against a real, populated database.
