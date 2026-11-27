# OLGAX DXP – Prioritized Product Roadmap

This roadmap translates the repository audit, functional QA, UX evaluation, and competitive DXP analysis into a practical phased plan anchored in [GitHub Issues](https://github.com/OLGAX-com/olgax-dxp/issues).

---

## Horizon 1: MVP Hardening (Production-Safe Core CMS + Page Builder)

*Goal: Ensure existing teams can deploy OLGAX DXP safely in production with non-technical editorial workflows.*

| Priority | Initiative | Issue | Status |
|---|---|---|---|
| **P0** | Lock down `/api/related-pages` & `@olgax.com/datasource` access control | [#9](https://github.com/OLGAX-com/olgax-dxp/issues/9) | **Implemented & verified** |
| **P0** | Fail fast on missing `PAYLOAD_SECRET` in production runtime | [#10](https://github.com/OLGAX-com/olgax-dxp/issues/10) | **Implemented & verified** |
| **P1** | Webhook SSRF protection (URL/IP allowlisting) & secret masking | [#11](https://github.com/OLGAX-com/olgax-dxp/issues/11) | **SSRF fixed; secret masking open** |
| **P1** | Sync Puck Root `title` edits to Payload `Pages.title` | [#12](https://github.com/OLGAX-com/olgax-dxp/issues/12) | **Implemented** |
| **P1** | Authenticated Draft Preview (`?preview=true`) for Draft pages | [#13](https://github.com/OLGAX-com/olgax-dxp/issues/13) | **Implemented & verified** |
| **P1** | Fix `RelatedPages` locale-aware links & SDK theming/visibility | [#14](https://github.com/OLGAX-com/olgax-dxp/issues/14) | **Implemented** |
| **P1** | Fix `NewPageForm` mobile collapse + slug validation & reserved slugs | [#15](https://github.com/OLGAX-com/olgax-dxp/issues/15) | **Implemented & verified** |
| **P1** | Align Node.js requirements & Windows Vitest / Fumadocs build DX | [#18](https://github.com/OLGAX-com/olgax-dxp/issues/18) | Open |
| **P1** | Role-Based Access Control (`admin`, `editor`, `author`) | [#21](https://github.com/OLGAX-com/olgax-dxp/issues/21) | Open |
| **P1** | Page SEO metadata fields (`metaTitle`, `metaDescription`, OG, `sitemap.xml`) | [#22](https://github.com/OLGAX-com/olgax-dxp/issues/22) | Open |
| **P1** | Scheduled publishing, unpublishing & version restore | [#23](https://github.com/OLGAX-com/olgax-dxp/issues/23) | Open |
| **P1** | Visual Media Picker field inside Puck backed by Payload Media | [#24](https://github.com/OLGAX-com/olgax-dxp/issues/24) | Open |
| **P2** | Public page dark-mode background alignment & Puck UX polish | [#16](https://github.com/OLGAX-com/olgax-dxp/issues/16), [#17](https://github.com/OLGAX-com/olgax-dxp/issues/17) | **Partially implemented** |

---

## Horizon 2: Competitive DXP (Marketing & Developer Parity)

*Goal: Deliver the day-to-day marketing, SEO, content operations, and DX capabilities expected from modern DXP platforms.*

| Priority | Initiative | Issue |
|---|---|---|
| **P2** | Global Site Navigation / Menu management & shared Header/Footer | [#25](https://github.com/OLGAX-com/olgax-dxp/issues/25) |
| **P2** | Mid-edit Section insertion & "Save as Section" inside Puck | [#26](https://github.com/OLGAX-com/olgax-dxp/issues/26) |
| **P2** | URL Redirects management (`301`/`302`) for slug changes & campaigns | [#27](https://github.com/OLGAX-com/olgax-dxp/issues/27) |
| **P2** | Audience segmentation (UTM, locale, device) & A/B experimentation | [#29](https://github.com/OLGAX-com/olgax-dxp/issues/29) |
| **P2** | Atomic `PageViews` increments & DB-level analytics aggregation | [#20](https://github.com/OLGAX-com/olgax-dxp/issues/20) |
| **P2** | CI sync verification between `apps/demo` and `create-olgax-site/template` | [#19](https://github.com/OLGAX-com/olgax-dxp/issues/19) |

### Additional Competitive Enhancements (Backlog Candidates)
- Full-text content search (facets/filtering across published pages and collections).
- Form builder block with submission storage and webhook/email notifications.
- Image optimization & CDN adapter support (Cloudinary / S3 / Vercel Blob) on `Media`.
- Webhook delivery logs, retry queue, and async dispatch outside `afterChange`.

---

## Horizon 3: Enterprise DXP (Scale, Governance & Multi-Site)

*Goal: Enable digital agencies and enterprise teams to govern multiple brands, domains, and compliance requirements.*

| Priority | Initiative | Issue |
|---|---|---|
| **P2** | Production Multi-Tenancy (`@olgax.com/multi-tenancy`: domain routing, tenant isolation, site switcher) | [#28](https://github.com/OLGAX-com/olgax-dxp/issues/28) |
| **P2+** | Approval workflows (Draft -> In Review -> Approved -> Published) & audit trails | — |
| **P2+** | Enterprise SSO (OIDC / SAML) integration for Payload Auth | — |
| **P2+** | ISR / tag-based cache invalidation on publish/unpublish + horizontal scaling | — |
| **P2+** | Complete `@olgax.com/marketplace` component registry & CLI install (`olgax add`) | — |

---

## Horizon 4: Future Innovations (AI-Native DXP)

*Goal: Differentiate OLGAX DXP with open, model-agnostic AI workflows that augment editors without vendor lock-in.*

| Priority | Initiative | Issue |
|---|---|---|
| **P3** | AI Content Assistant, multi-locale translation & SEO metadata generator (`@olgax.com/ai`) | [#30](https://github.com/OLGAX-com/olgax-dxp/issues/30) |
| **P3** | Semantic / vector search & intelligent content recommendations for `RelatedPages` | — |
| **P3** | Automated accessibility & SEO pre-publish lint checks inside Puck | — |
