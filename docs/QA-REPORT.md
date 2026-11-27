# OLGAX DXP – Comprehensive Functional QA Report

**Audit Target:** `OLGAX-com/olgax-dxp` (`main` at commit `8044172`, plus post-fix verification)  
**Test Environment:** Windows 11 x64, Node.js `v22.23.0`, pnpm `11.6.0`, Next.js `16.3.0` (Turbopack), Payload `3.87.1`, Puck `0.23.0`, SQLite (`file:./payload.db`), Playwright `1.62.1` (Chromium).

---

## 1. Feature Status Matrix

| Area | Feature | Status | Notes |
|---|---|---|---|
| **Auth** | First-admin bootstrap (`POST /api/users`) | Verified | Allows creation only when `users` count is `0`; returns `403` afterwards |
| **Auth** | Login / Logout / Session cookies (`/admin/login`, `/api/users/login`) | Verified | Valid login issues JWT + cookie; invalid credentials return `401` |
| **Auth** | Protected routes (`/dashboard`, `/[slug]/edit`) | Verified | Unauthenticated requests redirect `307` to `/admin/login?redirect=...` |
| **Auth** | Password reset email delivery | Partially implemented | Payload logs emails to console by default; no email adapter configured |
| **Auth** | Role-Based Access Control (RBAC) | Not implemented | All authenticated users have full admin rights ([Issue #21](https://github.com/OLGAX-com/olgax-dxp/issues/21)) |
| **Content** | Create, edit, duplicate, delete pages | Verified | Works via Dashboard & Payload Admin; `NewPageForm` & title sync fixed ([Issues #12, #15](https://github.com/OLGAX-com/olgax-dxp/issues/12)) |
| **Content** | Visual editing with Puck (10 blocks: 8 core + `RelatedPages` + `Callout`) | Verified | Drag/edit, autosave (`2000ms` debounce), and Publish persist to Payload |
| **Content** | Drafts & Publishing (`versions.drafts`) | Verified | Public routes serve `published` only; Draft Preview added for editors ([Issue #13](https://github.com/OLGAX-com/olgax-dxp/issues/13)) |
| **Content** | Unpublish / Scheduled publishing / Approvals | Not implemented | Tracked in [Issue #23](https://github.com/OLGAX-com/olgax-dxp/issues/23) |
| **Content** | Version history diff & restore UI | Partially implemented | Payload stores versions internally; no diff/restore workflow in Dashboard |
| **Content** | Page SEO metadata & XML sitemap | Not implemented | Layout hardcodes static metadata ([Issue #22](https://github.com/OLGAX-com/olgax-dxp/issues/22)) |
| **Media** | Upload PNG via `/api/media` & serve `/api/media/file/*` | Verified | Authenticated upload returns `201`; requires `alt` text |
| **Media** | Reject SVG XSS upload (`<script>`) | Verified | Returns `400` on invalid/disallowed SVG upload |
| **Media** | Visual Media Picker in Puck | Not implemented | Editors must paste image URLs manually ([Issue #24](https://github.com/OLGAX-com/olgax-dxp/issues/24)) |
| **Media** | Folders, tagging, image transforms/focal crop | Not implemented | `thumbnailURL` is `null`; basic upload only |
| **Navigation** | Global Site Navigation / Shared Header & Footer | Not implemented | Header/Footer are per-page Puck blocks ([Issue #25](https://github.com/OLGAX-com/olgax-dxp/issues/25)) |
| **Localization** | Locale-prefixed routing (`/en`, `/es`) & fallback | Verified | Localized `title`, `data`, `sections`; `RelatedPages` locale fix applied ([Issue #14](https://github.com/OLGAX-com/olgax-dxp/issues/14)) |
| **Personalization** | New vs returning visitor visibility (`olgax_visitor`) | Verified | Works via `proxy.ts` cookie and `@olgax.com/sdk` |
| **Personalization** | Audience segments, UTM rules, A/B testing | Not implemented | Tracked in [Issue #29](https://github.com/OLGAX-com/olgax-dxp/issues/29) |
| **Analytics** | Built-in `PageViews` counter & 7-day trend chart | Verified | Anonymous views increment; logged-in editor views are skipped |
| **Analytics** | Opt-in Umami integration | Implemented, not verified live | Requires external Umami instance via `docker-compose.umami.yml` |
| **Webhooks** | Outbound `page.published` / `page.deleted` HMAC-SHA256 | Verified | Tested against local HTTP listener; SSRF protection added ([Issue #11](https://github.com/OLGAX-com/olgax-dxp/issues/11)) |
| **APIs** | Payload REST & GraphQL APIs | Verified | Respects collection access rules (`users`, `webhooks`, `sections`, `page-views` require auth) |
| **APIs** | `/api/related-pages` datasource bridge | Fixed & verified | Previously leaked `users`, `webhooks`, drafts (`P0`); now locked down ([Issue #9](https://github.com/OLGAX-com/olgax-dxp/issues/9)) |
| **Multi-tenancy** | `@olgax.com/multi-tenancy` | Partially implemented | Groundwork only (`Sites` collection + `withSite()`); no routing or isolation ([Issue #28](https://github.com/OLGAX-com/olgax-dxp/issues/28)) |
| **Marketplace** | `@olgax.com/marketplace` | Partially implemented | Groundwork only (`validateManifest` schema); no registry/installer |

---

## 2. Bugs & Security Findings Discovered During QA

1. **[P0 Security] Unauthenticated `/api/related-pages` Access Control Bypass ([Issue #9](https://github.com/OLGAX-com/olgax-dxp/issues/9))** — *Fixed*
   - `GET /api/related-pages?collection=webhooks` returned HTTP `200` with plaintext HMAC signing secrets.
   - `GET /api/related-pages?collection=users` returned HTTP `200` with user emails and session objects.
   - `GET /api/related-pages?collection=pages` exposed unpublished `_status: "draft"` pages.
   - `GET /api/related-pages?collection=nonexistent` threw an unhandled HTTP `500`.
2. **[P0 Security] Empty `PAYLOAD_SECRET` Fallback ([Issue #10](https://github.com/OLGAX-com/olgax-dxp/issues/10))** — *Fixed*
   - `payload.config.ts` silently defaulted `secret` to `""` even in production runtime.
3. **[P1 Security] Webhook SSRF & Plaintext Secret Exposure ([Issue #11](https://github.com/OLGAX-com/olgax-dxp/issues/11))** — *Partially Fixed (SSRF fixed; secret masking remains)*
   - `POST /api/webhooks` accepted `http://169.254.169.254/latest/meta-data/` (`201`). Added `validateWebhookUrl()` rejecting private/loopback/metadata IPs and non-HTTP(S) schemes in both collection validation and `dispatchWebhooks()`.
4. **[P1 Bug] Puck Page Title Not Persisted to Payload `Pages.title` ([Issue #12](https://github.com/OLGAX-com/olgax-dxp/issues/12))** — *Fixed*
   - Editing "Page title" in Puck's sidebar left Dashboard/Admin titles stuck at `slug`.
5. **[P1 Bug] Dashboard "View" Link on Draft Pages Returns 404 ([Issue #13](https://github.com/OLGAX-com/olgax-dxp/issues/13))** — *Fixed*
   - Added authenticated `?preview=true` Draft Preview mode with banner and updated Dashboard Draft rows to render `Preview`.
6. **[P1 Bug] `RelatedPages` Hardcodes Locale-less URLs & Omits SDK Fields ([Issue #14](https://github.com/OLGAX-com/olgax-dxp/issues/14))** — *Fixed*
   - Added `localePrefix` support, empty state, `colorOverrideFields()`, and `visibilityFields()`.
7. **[P1 Bug] `NewPageForm` Mobile Input Collapse & Missing Slug Validation ([Issue #15](https://github.com/OLGAX-com/olgax-dxp/issues/15))** — *Fixed*
   - Fixed `w-full sm:flex-1` height collapse on `375px` mobile viewports, added slug regex and reserved-route checks (`admin`, `api`, `dashboard`, `pages`), and added server-side validation on `Pages.slug`.
8. **[P2 Bug] Public Page Bottom Dark-Mode Mismatch ([Issue #16](https://github.com/OLGAX-com/olgax-dxp/issues/16))** — *Fixed*
   - Updated `body` background/text in `globals.css` to use `--olgax-color-bg` / `--olgax-color-text`.
9. **[P2 UX] Puck Editor Lacks Save/Publish Feedback & Header Wrapping ([Issue #17](https://github.com/OLGAX-com/olgax-dxp/issues/17))** — *Partially Fixed*
   - Added live status pill (`Saving draft…`, `Draft saved`, `Publishing…`, `Published`, error alert) and `whiteSpace: nowrap` on links. Outline selection contrast and Unpublish action remain open.
10. **[P1 Tech Debt] Windows Vitest & Fumadocs Build Failures ([Issue #18](https://github.com/OLGAX-com/olgax-dxp/issues/18))** — *Open*
    - `pnpm test` fails on Windows when `node` < `20.19` during `pnpm install` (`@rolldown/binding-win32-x64-msvc` skipped); `apps/docs` fails `next build` on Windows (`ERR_REQUIRE_ESM` in `fumadocs-mdx`).

---

## 3. Automated Test Coverage

- **Playwright E2E (`apps/demo/e2e/`):**
  - `smoke.spec.ts`: 3 smoke tests covering public page rendering, login + dashboard listing, and API publish reflection.
  - `security-and-workflows.spec.ts` *(added)*: 4 test suites covering `/api/related-pages` access boundaries, SSRF webhook rejection, reserved/invalid slug rejection, authenticated Draft Preview vs anonymous 404, and `NewPageForm` mobile viewport + validation.
- **Unit Tests (`packages/sdk`, `packages/payload-preset`):**
  - `packages/sdk`: `registerComponent`, `colorOverrideStyle`, `isVisible`.
  - `packages/payload-preset`: `sign` + `validateWebhookUrl` *(expanded)*.
