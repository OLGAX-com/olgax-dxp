# OLGAX DXP – Technical, Architecture & Security Review

*Evaluated against `OLGAX-com/olgax-dxp` `main` at commit `8044172`.*

## 1. Architecture Overview

OLGAX DXP is structured as a pnpm + Turborepo monorepo combining three core layers:

1. **Content & Auth Backend (`@olgax.com/payload-preset`)**:
   - Payload CMS 3.87.1 embedded inside Next.js 16.3.0 (`App Router`), supporting SQLite (`@payloadcms/db-sqlite`) for zero-config local dev and Postgres (`@payloadcms/db-postgres`) via `DATABASE_URL`.
   - Collections: `Users` (auth), `Media` (upload), `Pages` (localized + `versions.drafts`), `Sections` (localized block templates), `PageViews` (day-bucketed analytics), `Webhooks` (HMAC-SHA256 outbound notifications).
   - Globals: `SiteSettings` (localization toggle + `--olgax-color-*` theme overrides).
2. **Visual Builder & SDK (`@olgax.com/sdk`, `@olgax.com/components`, `@olgax.com/datasource`)**:
   - `@olgax.com/sdk`: Global in-memory component registry (`registerComponent()`), CSS custom property theming helpers (`colorOverrideFields`, `colorOverrideStyle`), and visitor visibility helpers (`visibilityFields`, `isVisible`).
   - `@olgax.com/components`: 8 self-registering blocks (`Hero`, `Header`, `Footer`, `CTA`, `Gallery`, `Pricing`, `FAQ`, `Testimonials`) + factory-registered `RelatedPages`.
   - `@olgax.com/datasource`: Puck `resolveData` helpers bridging client Puck editors to Payload via Next.js Route Handlers.
3. **Reference App & Scaffolder (`apps/demo`, `create-olgax-site`, `apps/docs`)**:
   - `apps/demo` serves as the reference Next.js site with `proxy.ts` handling locale routing (`/en/...`, `/es/...`) and the `olgax_visitor` cookie.
   - `create-olgax-site/template` duplicates `apps/demo` for npm scaffolding.
   - Groundwork-only packages: `packages/multi-tenancy` and `packages/marketplace`.

---

## 2. Security Review

### Critical & High Findings on `main` (`8044172`)

1. **`[P0]` Unauthenticated Datasource Access Control Bypass (`packages/datasource`, `/api/related-pages`) — Fix pending in [PR #31](https://github.com/OLGAX-com/olgax-dxp/pull/31) ([Issue #9](https://github.com/OLGAX-com/olgax-dxp/issues/9))**
   - **Finding**: `queryCollectionFromSearchParams` calls `payload.find()` without `overrideAccess: false` and without collection/field allowlists. Because Payload's Local API bypasses access control by default, `/api/related-pages?collection=webhooks|users|pages|sections|page-views` exposes all records anonymously on `main`, including webhook HMAC secrets, user emails, and unpublished drafts.
   - **Proposed Remediation ([PR #31](https://github.com/OLGAX-com/olgax-dxp/pull/31))**: Enforce `overrideAccess: false`, `allowedCollections`, `allowedFilterFields`, slug/field regex validation, limit clamping (`1..50`), and `DatasourceQueryError` (`400`/`403`) handling.

2. **`[P0]` Empty `PAYLOAD_SECRET` Fallback (`payload.config.ts`) — Fix pending in [PR #31](https://github.com/OLGAX-com/olgax-dxp/pull/31) ([Issue #10](https://github.com/OLGAX-com/olgax-dxp/issues/10))**
   - **Finding**: `secret: process.env.PAYLOAD_SECRET || ""` allows production startups with an empty JWT signing key.
   - **Proposed Remediation ([PR #31](https://github.com/OLGAX-com/olgax-dxp/pull/31))**: Fail fast at runtime when `NODE_ENV === "production"` (outside `phase-production-build`) if `PAYLOAD_SECRET` is empty.

3. **`[P1]` Webhook SSRF & Plaintext Secret Exposure (`packages/payload-preset`) — SSRF fix pending in [PR #31](https://github.com/OLGAX-com/olgax-dxp/pull/31) ([Issue #11](https://github.com/OLGAX-com/olgax-dxp/issues/11))**
   - **Finding**: `Webhooks.url` only checks `new URL(value)`, allowing `http://169.254.169.254/...`, `127.0.0.1`, and private IPs, and `fetch()` follows redirects by default. Additionally, `secret` is readable in plaintext via `GET /api/webhooks/:id`.
   - **Proposed Remediation ([PR #31](https://github.com/OLGAX-com/olgax-dxp/pull/31))**: Validate HTTP(S) URLs, private/loopback/IPv4-mapped IPv6/metadata ranges, resolve DNS and bind connections to the validated IP, and disable redirect following. Secret masking on read responses remains open.

4. **`[P1]` Missing RBAC Separation of Duties ([Issue #21](https://github.com/OLGAX-com/olgax-dxp/issues/21))**
   - **Risk**: Every authenticated user in `Users` can read/modify `Webhooks` secrets, delete any `User`, alter `SiteSettings`, and publish/delete any `Page`.

5. **Positive Security Controls Verified on `main`**
   - `colorOverrideStyle` and `SiteSettings` strictly validate hex colors (`HEX_COLOR`) before interpolating into `<style>` tags.
   - `Users.create` restricts unauthenticated registration strictly to first-user bootstrap (`totalDocs === 0`).
   - `PageViews` denies public `create`/`update` via API (`() => false`).
   - `Media` rejects dangerous inline-script SVG uploads (`400`).

---

## 3. Performance & Scalability Analysis

1. **In-Memory Analytics Aggregation ([Issue #20](https://github.com/OLGAX-com/olgax-dxp/issues/20))**
   - `apps/demo/lib/analytics.ts` fetches up to `limit: 5000` `page-views` documents and sums them in JS on every Dashboard Overview/Analytics request. At scale (>5,000 slug/locale/day rows), counts silently truncate and latency degrades.
   - `recordPageView()` uses read-then-write `find()` + `update()`, losing concurrent increments.
2. **Synchronous Webhook Dispatch in `afterChange` Hook**
   - `Pages.hooks.afterChange` awaits `dispatchWebhooks()` with a `5000ms` timeout per webhook. Slow webhook receivers add up to 5 seconds of latency to the editor's Publish button. Moving dispatch to a background queue / Next `after()` or job runner would decouple publish latency.
3. **Proxy Settings Fetch Latency**
   - `proxy.ts` performs an internal HTTP `fetch(${origin}/api/globals/site-settings?depth=0)` on cache miss every 30s (`CACHE_TTL_MS = 30_000`), failing open to `true`. Toggling `localizationEnabled` in Admin takes up to 30 seconds per worker instance to take effect.
4. **No Caching / Revalidation Strategy for Public Pages**
   - Public routes (`[locale]/page.tsx`, `[locale]/[slug]/page.tsx`) dynamically query Payload on every request (`ƒ Dynamic`) with no `unstable_cache` / tag revalidation on publish.

---

## 4. Technical Debt

1. **Duplicated App Code (`apps/demo` vs `create-olgax-site/template`) ([Issue #19](https://github.com/OLGAX-com/olgax-dxp/issues/19))**
   - Shared files are manually duplicated between both directories with no CI drift verification.
2. **Cross-Platform Build/Test Friction ([Issue #18](https://github.com/OLGAX-com/olgax-dxp/issues/18))**
   - `vitest@4.1.11` (`rolldown`) requires Node `^20.19.0 || >=22.12.0` (while docs claim `20.9+`), and `apps/docs` (`fumadocs-mdx`) fails Turbopack `next build` on Windows.
3. **Unfinished Groundwork Packages in Workspace**
   - `packages/multi-tenancy` and `packages/marketplace` exist in `packages/` without tests or integration, excluded from `.changeset/config.json`.
4. **Puck `resolveData` SSR Dependency on `NEXT_PUBLIC_SITE_URL`**
   - `createCollectionResolverFetch` assumes `http://localhost:3000` on SSR when `NEXT_PUBLIC_SITE_URL` is unset, which breaks in production unless configured or replaced with a server-side `createCollectionResolver`.
