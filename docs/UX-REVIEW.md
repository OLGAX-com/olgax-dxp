# OLGAX DXP – Real-World User Experience Evaluation

This evaluation assesses OLGAX DXP (`main` at `8044172`) from the perspective of the five core user personas expected to adopt an open-source DXP.

---

## 1. Content Editors

### What Works Well
- **Clean visual editing loop**: Opening `/<slug>/edit` opens Puck directly with live preview styling synced via `EditorStyleSync`, and the floating `"Edit this page"` pill on public pages provides a fast shortcut from preview to edit.
- **Dashboard simplicity**: The 4-tab Dashboard (`Overview`, `Pages`, `Analytics`, `Settings`) gives editors a clean, jargon-free workspace without needing to navigate Payload's raw database admin for day-to-day page work.
- **Reusable Sections**: Starting a page from a Section (`?section=cta-banner`) reduces repetitive layout setup.

### Friction & Missing Capabilities
- **No visual Media Picker inside Puck** ([Issue #24](https://github.com/OLGAX-com/olgax-dxp/issues/24)): Non-technical editors cannot browse or upload images while editing a `Gallery` block; they must leave Puck, upload in `/admin/collections/media`, copy a URL, and paste it into a plain text field.
- **No mid-edit Section insertion** ([Issue #26](https://github.com/OLGAX-com/olgax-dxp/issues/26)): Sections only work when creating a brand-new empty page via URL query param. Typing an unknown section name into `NewPageForm` silently opens an empty page with no warning (warning banner fix pending in [PR #32](https://github.com/OLGAX-com/olgax-dxp/pull/32)).
- **No Unpublish or Version Restore UI** ([Issue #23](https://github.com/OLGAX-com/olgax-dxp/issues/23)): Editors cannot take a live page offline without deleting it, nor compare/revert revisions from the Dashboard.
- **Puck Outline Contrast & Canvas UX** ([Issue #16](https://github.com/OLGAX-com/olgax-dxp/issues/16), [Issue #17](https://github.com/OLGAX-com/olgax-dxp/issues/17)): Selected block text in the Puck Outline panel has low contrast against the light-blue highlight, autosave/publish have no visible status feedback, and empty space below short pages renders dark under dark-mode OS settings (frontend `body` and status pill fixes pending in [PR #32](https://github.com/OLGAX-com/olgax-dxp/pull/32)).

---

## 2. Marketing Teams

### What Works Well
- **Built-in privacy-first analytics**: Zero-config page view trends and per-page totals work out of the box, with an optional upgrade path to self-hosted Umami.
- **First-party visitor personalization**: Simple `"Everyone"`, `"New visitors only"`, and `"Returning visitors only"` toggle per block works without cookie consent complexity.

### Friction & Missing Capabilities
- **Zero SEO management** ([Issue #22](https://github.com/OLGAX-com/olgax-dxp/issues/22)): No per-page meta title, meta description, Open Graph image, canonical URL, `noindex` toggle, or XML sitemap. Every public page shares the static title `"Olgax DXP"`.
- **No global Header/Footer or Navigation management** ([Issue #25](https://github.com/OLGAX-com/olgax-dxp/issues/25)): Updating a top-level menu link requires manually editing every individual page.
- **No scheduled publishing or redirects** ([Issues #23, #27](https://github.com/OLGAX-com/olgax-dxp/issues/23)): Campaigns cannot be scheduled to go live automatically, and renaming a slug produces immediate 404s.
- **Minimal personalization**: No UTM/campaign targeting, geo/locale rules, or A/B experimentation ([Issue #29](https://github.com/OLGAX-com/olgax-dxp/issues/29)).

---

## 3. Developers

### What Works Well
- **Clean monorepo & open standards**: Next.js App Router + Payload 3 + Puck JSON storage avoids proprietary AST formats.
- **Fast scaffolding & component workflow**: `npx create-olgax-site` and `pnpm new:component MyBlock` provide a great first-5-minutes DX, backed by `@olgax.com/sdk`'s `registerComponent()`.
- **Dual DB adapter**: Zero-config SQLite locally and `DATABASE_URL` Postgres switch for production.

### Friction & Missing Capabilities
- **Manual `apps/demo` <-> `create-olgax-site/template` mirroring** ([Issue #19](https://github.com/OLGAX-com/olgax-dxp/issues/19)): Contributors must manually copy changes between two identical app trees with no CI drift check.
- **Windows contributor friction** ([Issue #18](https://github.com/OLGAX-com/olgax-dxp/issues/18)): Node `<20.19` breaks `vitest` (`rolldown` native binding), and `apps/docs` fails `next build` on Windows.
- **Datasource DX pitfalls**: `queryCollectionFromSearchParams` defaults to Payload's `overrideAccess: true` without collection allowlists or safe defaults on `main` ([Issue #9](https://github.com/OLGAX-com/olgax-dxp/issues/9), fix pending in [PR #31](https://github.com/OLGAX-com/olgax-dxp/pull/31)).
- **Incomplete packages in repo**: `packages/multi-tenancy` and `packages/marketplace` exist in the workspace but are unversioned stubs, which can confuse adopters.

---

## 4. Administrators

### What Works Well
- **Unified auth**: One Payload session covers `/admin`, `/dashboard`, and `/[slug]/edit`.
- **Outbound webhooks**: Clean HMAC-SHA256 webhook integration for rebuild triggers and external workflows.

### Friction & Missing Capabilities
- **No RBAC / user roles** ([Issue #21](https://github.com/OLGAX-com/olgax-dxp/issues/21)): Every logged-in user can delete other users, read webhook secrets, and change `SiteSettings`.
- **No audit logs or webhook delivery history**: No visibility into who published/deleted pages or whether outbound webhook deliveries succeeded or failed.
- **No email adapter configured by default**: Password resets and user invites log only to server stdout until an adapter is wired manually.

---

## 5. Enterprise Customers

### Gaps Blocking Enterprise Adoption
- **Multi-tenancy is groundwork only** ([Issue #28](https://github.com/OLGAX-com/olgax-dxp/issues/28)): No domain-based routing, tenant isolation, or per-site theme/settings.
- **No SSO / SAML / OIDC**: Payload local password auth only.
- **No approval workflows**: Direct publish with no editorial review gate.
- **Analytics scalability**: In-memory `find(limit: 5000)` aggregation and non-atomic increments in `lib/analytics.ts` ([Issue #20](https://github.com/OLGAX-com/olgax-dxp/issues/20)) will silently drop/truncate data on high-traffic sites.
