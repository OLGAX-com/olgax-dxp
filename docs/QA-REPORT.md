# OLGAX DXP – Comprehensive Functional QA Report

**Audited Baseline Commit:** `OLGAX-com/olgax-dxp` `main` at [`8044172`](https://github.com/OLGAX-com/olgax-dxp/commit/8044172165785c85478f1f09724fe14fc93699f4)  
**Related Fix PRs (Pending Merge):** [PR #31](https://github.com/OLGAX-com/olgax-dxp/pull/31) (security & tests), [PR #32](https://github.com/OLGAX-com/olgax-dxp/pull/32) (editorial/UX fixes & tests)  
**Test Environment:** Windows 11 x64, Node.js `v22.23.0`, pnpm `11.6.0`, Next.js `16.3.0` (Turbopack), Payload `3.87.1`, Puck `0.23.0`, SQLite (`file:./payload.db`), Playwright `1.62.1` (Chromium).

---

## 1. Baseline Feature Status Matrix (`main` @ `8044172`)

| Area | Feature | Status on `main` (`8044172`) | Notes |
|---|---|---|---|
| **Auth** | First-admin bootstrap (`POST /api/users`) | Verified | Allows creation only when `users` count is `0`; returns `403` afterwards |
| **Auth** | Login / Logout / Session cookies (`/admin/login`, `/api/users/login`) | Verified | Valid login issues JWT + cookie; invalid credentials return `401` |
| **Auth** | Protected routes (`/dashboard`, `/[slug]/edit`) | Verified | Unauthenticated requests redirect `307` to `/admin/login?redirect=...` |
| **Auth** | Password reset email delivery | Partially implemented | Payload logs emails to console by default; no email adapter configured |
| **Auth** | Role-Based Access Control (RBAC) | Not implemented | All authenticated users have full admin rights ([Issue #21](https://github.com/OLGAX-com/olgax-dxp/issues/21)) |
| **Content** | Create, edit, duplicate, delete pages | Partially broken | Core CRUD works, but `NewPageForm` mobile height/validation & Puck title sync are broken on `main` (fix pending in [PR #32](https://github.com/OLGAX-com/olgax-dxp/pull/32)) |
| **Content** | Visual editing with Puck (10 blocks: 8 core + `RelatedPages` + `Callout`) | Verified (with UX gaps) | Drag/edit, autosave (`2000ms` debounce), and Publish persist; silent status & outline contrast ([Issue #17](https://github.com/OLGAX-com/olgax-dxp/issues/17)) |
| **Content** | Drafts & Publishing (`versions.drafts`) | Partially broken | Public routes serve `published` only, but clicking `View` on Draft pages in Dashboard 404s; draft preview pending in [PR #32](https://github.com/OLGAX-com/olgax-dxp/pull/32) |
| **Content** | Unpublish / Scheduled publishing / Approvals | Not implemented | Tracked in [Issue #23](https://github.com/OLGAX-com/olgax-dxp/issues/23) |
| **Content** | Version history diff & restore UI | Partially implemented | Payload stores versions internally; no diff/restore workflow in Dashboard |
| **Content** | Page SEO metadata & XML sitemap | Not implemented | Layout hardcodes static metadata ([Issue #22](https://github.com/OLGAX-com/olgax-dxp/issues/22)) |
| **Media** | Upload PNG via `/api/media` & serve `/api/media/file/*` | Verified | Authenticated upload returns `201`; requires `alt` text |
| **Media** | Reject SVG XSS upload (`<script>`) | Verified | Returns `400` on invalid/disallowed SVG upload |
| **Media** | Visual Media Picker in Puck | Not implemented | Editors must paste image URLs manually ([Issue #24](https://github.com/OLGAX-com/olgax-dxp/issues/24)) |
| **Media** | Folders, tagging, image transforms/focal crop | Not implemented | `thumbnailURL` is `null`; basic upload only |
| **Navigation** | Global Site Navigation / Shared Header & Footer | Not implemented | Header/Footer are per-page Puck blocks ([Issue #25](https://github.com/OLGAX-com/olgax-dxp/issues/25)) |
| **Localization** | Locale-prefixed routing (`/en`, `/es`) & fallback | Partially broken | Localized `Pages`/`Sections` work, but `RelatedPages` drops locale prefix (fix pending in [PR #32](https://github.com/OLGAX-com/olgax-dxp/pull/32)) |
| **Personalization** | New vs returning visitor visibility (`olgax_visitor`) | Verified | Works via `proxy.ts` cookie and `@olgax.com/sdk` |
| **Personalization** | Audience segments, UTM rules, A/B testing | Not implemented | Tracked in [Issue #29](https://github.com/OLGAX-com/olgax-dxp/issues/29) |
| **Analytics** | Built-in `PageViews` counter & 7-day trend chart | Verified | Anonymous views increment; logged-in editor views are skipped |
| **Analytics** | Opt-in Umami integration | Implemented, not verified live | Requires external Umami instance via `docker-compose.umami.yml` |
| **Webhooks** | Outbound `page.published` / `page.deleted` HMAC-SHA256 | Verified (SSRF risk) | Tested against local HTTP listener; lacks SSRF validation on `main` (pending in [PR #31](https://github.com/OLGAX-com/olgax-dxp/pull/31)) |
| **APIs** | Payload REST & GraphQL APIs | Verified | Respects collection access rules (`users`, `webhooks`, `sections`, `page-views` require auth) |
| **APIs** | `/api/related-pages` datasource bridge | Broken (P0 Security) | Unauthenticated `GET` bypasses access control and leaks `users`, `webhooks`, drafts on `main` (fix pending in [PR #31](https://github.com/OLGAX-com/olgax-dxp/pull/31)) |
| **Multi-tenancy** | `@olgax.com/multi-tenancy` | Partially implemented | Groundwork only (`Sites` collection + `withSite()`); no routing or isolation ([Issue #28](https://github.com/OLGAX-com/olgax-dxp/issues/28)) |
| **Marketplace** | `@olgax.com/marketplace` | Partially implemented | Groundwork only (`validateManifest` schema); no registry/installer |

---

## 2. Bugs & Security Findings Discovered on `main` (`8044172`)

1. **[P0 Security] Unauthenticated `/api/related-pages` Access Control Bypass ([Issue #9](https://github.com/OLGAX-com/olgax-dxp/issues/9))** — *Fix pending in [PR #31](https://github.com/OLGAX-com/olgax-dxp/pull/31)*
   - `GET /api/related-pages?collection=webhooks` returned HTTP `200` with plaintext HMAC signing secrets.
   - `GET /api/related-pages?collection=users` returned HTTP `200` with user emails and session objects.
   - `GET /api/related-pages?collection=pages` exposed unpublished `_status: "draft"` pages.
   - `GET /api/related-pages?collection=nonexistent` threw an unhandled HTTP `500`.
2. **[P0 Security] Empty `PAYLOAD_SECRET` Fallback ([Issue #10](https://github.com/OLGAX-com/olgax-dxp/issues/10))** — *Fix pending in [PR #31](https://github.com/OLGAX-com/olgax-dxp/pull/31)*
   - `payload.config.ts` silently defaulted `secret` to `""` even in production runtime.
3. **[P1 Security] Webhook SSRF & Plaintext Secret Exposure ([Issue #11](https://github.com/OLGAX-com/olgax-dxp/issues/11))** — *SSRF fix pending in [PR #31](https://github.com/OLGAX-com/olgax-dxp/pull/31); secret masking remains open*
   - `POST /api/webhooks` accepted `http://169.254.169.254/latest/meta-data/` (`201`) and `GET /api/webhooks/:id` returned plaintext `secret`.
4. **[P1 Bug] Puck Page Title Not Persisted to Payload `Pages.title` ([Issue #12](https://github.com/OLGAX-com/olgax-dxp/issues/12))** — *Fix pending in [PR #32](https://github.com/OLGAX-com/olgax-dxp/pull/32)*
   - Editing "Page title" in Puck's sidebar left Dashboard/Admin titles stuck at `slug`.
5. **[P1 Bug] Dashboard "View" Link on Draft Pages Returns 404 ([Issue #13](https://github.com/OLGAX-com/olgax-dxp/issues/13))** — *Draft Preview fix pending in [PR #32](https://github.com/OLGAX-com/olgax-dxp/pull/32)*
   - Clicking `View` on a Draft page in `/dashboard/pages` returned `404` even for authenticated editors.
6. **[P1 Bug] `RelatedPages` Hardcodes Locale-less URLs & Omits SDK Fields ([Issue #14](https://github.com/OLGAX-com/olgax-dxp/issues/14))** — *Fix pending in [PR #32](https://github.com/OLGAX-com/olgax-dxp/pull/32)*
   - `<a href="/${item.slug}">` dropped locale prefixes and omitted `colorOverrideFields()` / `visibilityFields()`.
7. **[P1 Bug] `NewPageForm` Mobile Input Collapse & Missing Slug Validation ([Issue #15](https://github.com/OLGAX-com/olgax-dxp/issues/15))** — *Fix pending in [PR #32](https://github.com/OLGAX-com/olgax-dxp/pull/32)*
   - `h-10 flex-1` inside `flex-col` collapsed input heights to `18px` on `375x812` mobile viewports; invalid/reserved slugs led to `404` `/edit` routes; missing `?section=` failed silently.
8. **[P2 Bug] Public Page Bottom Dark-Mode Mismatch ([Issue #16](https://github.com/OLGAX-com/olgax-dxp/issues/16))** — *Fix pending in [PR #32](https://github.com/OLGAX-com/olgax-dxp/pull/32)*
   - `body` used `--background` (`#0a0a0a` in dark mode) below light blocks and ignored `SiteSettings.backgroundColor`.
9. **[P2 UX] Puck Editor Lacks Save/Publish Feedback & Header Wrapping ([Issue #17](https://github.com/OLGAX-com/olgax-dxp/issues/17))** — *Status pill & nowrap pending in [PR #32](https://github.com/OLGAX-com/olgax-dxp/pull/32); outline contrast & Unpublish remain open*
10. **[P1 Tech Debt] Windows Vitest & Fumadocs Build Failures ([Issue #18](https://github.com/OLGAX-com/olgax-dxp/issues/18))** — *Open*
    - `pnpm test` fails on Windows when `node` < `20.19` during `pnpm install` (`@rolldown/binding-win32-x64-msvc` skipped); `apps/docs` fails `next build` on Windows (`ERR_REQUIRE_ESM` in `fumadocs-mdx`).

---

## 3. Automated Test Coverage

### Baseline on `main` (`8044172`)
- **Playwright E2E (`apps/demo/e2e/smoke.spec.ts`)**: 3 smoke tests covering public page rendering, login + dashboard listing, and API publish reflection (`3/3` passed against local checkout).
- **Unit Tests**:
  - `packages/sdk`: `registerComponent`, `colorOverrideStyle`, `isVisible` (vitest; skipped locally on Windows when `rolldown` native binding is absent, passing in CI).
  - `packages/payload-preset/src/webhooks/dispatch.test.ts`: 3 `sign()` tests.

### Pending Test Additions (in Open PRs)
- **[PR #31](https://github.com/OLGAX-com/olgax-dxp/pull/31)** (`3d71c95`): Adds `apps/demo/e2e/security.spec.ts` (endpoint access boundaries, fractional limit clamping, SSRF webhook rejection) and expands `dispatch.test.ts` with IPv4-mapped IPv6, DNS resolution, and non-redirect tests (`5/5` E2E passed on branch).
- **[PR #32](https://github.com/OLGAX-com/olgax-dxp/pull/32)** (`8ff8e20`): Adds `apps/demo/e2e/workflows.spec.ts` (reserved/invalid slugs, authenticated Draft Preview vs anonymous 404, mobile `NewPageForm`, draft title sync in Dashboard) and makes `e2e/global-setup.ts` idempotent (`7/7` E2E passed on branch).
