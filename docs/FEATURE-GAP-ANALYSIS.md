# OLGAX DXP – Competitive DXP Feature Gap Analysis

This analysis benchmarks **OLGAX DXP** against established enterprise and mid-market Digital Experience Platforms — specifically **Sitecore (XM Cloud / XP)**, **Adobe Experience Manager (AEM)**, **Optimizely**, **Kentico (Xperience by Kentico)**, and **Umbraco**.

OLGAX DXP's strategic advantage is its **open-source, developer-friendly, zero-lock-in stack** (Next.js App Router + Payload CMS + Puck JSON). To compete as a true DXP rather than just a lightweight page builder, it must close critical gaps selectively without bloating its clean core.

---

## 1. Capability Comparison Matrix

| Capability Category | OLGAX DXP (Current) | Sitecore / AEM / Optimizely | Kentico / Umbraco | Gap Priority |
|---|---|---|---|---|
| **Headless & Structured Content** | Payload collections (`Pages`, `Sections`) + REST/GraphQL | Full content modeling, references, content fragments | Document types, structured blocks | Medium (Payload supports custom collections; needs UI/DX patterns) |
| **Visual Page Builder** | Puck drag-and-drop, 10 blocks, live style sync | Sitecore Pages / AEM Universal Editor | Kentico Page Builder / Umbraco Block Grid | Low-Medium (strong core; needs mid-edit sections & media picker) |
| **Workflows, Scheduling & Versioning** | Basic `draft` / `published` only | Multi-step approvals, scheduled publish/unpublish, visual diff | Scheduled publish, workflows, rollback UI | **High (P1)** |
| **Multi-Site & Localization** | Locale routes (`/en`, `/es`), fallback; `multi-tenancy` stub | Native multi-site, domain routing, shared sites, translation queues | Multi-site hostnames, culture variants | **High (P2)** |
| **Digital Asset Management (DAM)** | Basic Payload `Media` upload | Rich DAM, focal points, CDN transforms, folders, metadata | Media library with focal crop, folders | **High (P1)** |
| **SEO & Search** | None (static layout metadata) | Per-page SEO, XML sitemaps, redirects, faceted search | SEO fields, redirects, Examine/Lucene search | **High (P1)** |
| **Personalization & Experimentation** | New vs returning cookie toggle | Rules engine, CDP segments, A/B testing | Contact groups, A/B testing | Medium-High (P2) |
| **Navigation & Shared Chrome** | Per-page `Header`/`Footer` blocks | Managed site trees, shared layouts/partials | Navigation trees, partial views | **High (P2)** |
| **Enterprise Security & Governance** | Basic login (all users = full admin) | Granular RBAC, SSO/SAML, audit logs | Roles/permissions, audit trail | **Critical (P1)** |
| **AI Capabilities** | None | Sitecore Stream, Optimizely Opal, AEM AI | AI assistants via plugins | Low-Medium (P3) |

---

## 2. Prioritized Evaluation of Proposed Capabilities

### 1. Role-Based Access Control (RBAC) — [Issue #21](https://github.com/OLGAX-com/olgax-dxp/issues/21)
- **User Problem**: Any editor account can delete other users, read webhook secrets, or alter site-wide settings.
- **Beneficiaries**: Administrators, agencies, SMB/enterprise organizations.
- **Essential for DXP?**: Yes — table stakes for multi-user teams.
- **Competitor Comparison**: Sitecore, AEM, Umbraco, and Kentico all ship built-in roles (`Admin`, `Editor`, `Author`).
- **Complexity**: Low-Medium (Payload supports field/collection access hooks cleanly via a `Users.role` field).
- **Architecture Alignment**: High — fits natively inside `@olgax.com/payload-preset`.
- **Timing**: **Now (MVP / Phase 2)**.

### 2. Page SEO Metadata & Dynamic XML Sitemap — [Issue #22](https://github.com/OLGAX-com/olgax-dxp/issues/22)
- **User Problem**: Every page renders the same `<title>` (`"Olgax DXP"`) with no meta description, OG tags, or `sitemap.xml`.
- **Beneficiaries**: Marketing teams, SEO specialists, agencies.
- **Essential for DXP?**: Yes — websites cannot rank or share cleanly on social without it.
- **Competitor Comparison**: Built-in on Kentico/Optimizely/Sitecore XM Cloud and standard Payload SEO plugins.
- **Complexity**: Low (localized `seo` group on `Pages` + `generateMetadata()` + `app/sitemap.ts`).
- **Architecture Alignment**: High.
- **Timing**: **Now (MVP)**.

### 3. Visual Media Picker for Puck — [Issue #24](https://github.com/OLGAX-com/olgax-dxp/issues/24)
- **User Problem**: Non-technical editors must copy-paste raw image URLs from `/admin/collections/media` into Puck text fields.
- **Beneficiaries**: Content editors and marketers.
- **Essential for DXP?**: Yes — manual URL copying breaks the visual CMS promise.
- **Competitor Comparison**: Every visual builder (Sitecore Pages, AEM, Webstudio, Builder.io) embeds an asset picker.
- **Complexity**: Medium (custom Puck field in `@olgax.com/sdk` querying `/api/media`).
- **Architecture Alignment**: High.
- **Timing**: **Now (MVP)**.

### 4. Scheduled Publishing & Unpublishing — [Issue #23](https://github.com/OLGAX-com/olgax-dxp/issues/23)
- **User Problem**: Editors cannot unpublish a live page or schedule future campaign launches.
- **Beneficiaries**: Marketing teams and content editors.
- **Essential for DXP?**: Yes.
- **Competitor Comparison**: Standard across all DXP competitors; Payload 3 supports `schedulePublish`.
- **Complexity**: Medium.
- **Architecture Alignment**: High (can leverage Payload's built-in jobs/draft scheduling).
- **Timing**: **Now (MVP / Early Competitive)**.

### 5. Global Navigation & Shared Layout Chrome — [Issue #25](https://github.com/OLGAX-com/olgax-dxp/issues/25)
- **User Problem**: Updating a menu link requires editing every page individually.
- **Beneficiaries**: Marketers, editors, developers.
- **Essential for DXP?**: Yes for any multi-page site.
- **Competitor Comparison**: Sitecore/Umbraco/Kentico manage site navigation centrally.
- **Complexity**: Medium (`Navigation` global + optional `Header`/`Footer` binding).
- **Architecture Alignment**: High.
- **Timing**: **Next (Competitive DXP)**.

### 6. URL Redirects Management (301/302) — [Issue #27](https://github.com/OLGAX-com/olgax-dxp/issues/27)
- **User Problem**: Slug changes cause 404s and break SEO equity.
- **Beneficiaries**: Marketers, SEO teams.
- **Essential for DXP?**: Yes for production sites.
- **Complexity**: Low-Medium (`Redirects` collection + `proxy.ts` lookup).
- **Timing**: **Next (Competitive DXP)**.

### 7. Multi-Tenancy & Multi-Site Routing — [Issue #28](https://github.com/OLGAX-com/olgax-dxp/issues/28)
- **User Problem**: Agencies/enterprises cannot run multiple domains with isolated content and themes from one deployment (`@olgax.com/multi-tenancy` is only a stub).
- **Beneficiaries**: Digital agencies, enterprise organizations.
- **Essential for DXP?**: Yes for enterprise/agency positioning (Sitecore/AEM core strength).
- **Complexity**: High (tenant scoping across all collections, auth, `proxy.ts` host resolution, analytics, and `SiteSettings`).
- **Timing**: **Later (Enterprise DXP / Phase 3)**.

### 8. Audience Segmentation & A/B Experimentation — [Issue #29](https://github.com/OLGAX-com/olgax-dxp/issues/29)
- **User Problem**: Current personalization only distinguishes `new` vs `returning` visitors.
- **Beneficiaries**: Growth & marketing teams.
- **Essential for DXP?**: Differentiator between "CMS" and "DXP".
- **Complexity**: Medium-High (UTM/locale/device rules + variant split + conversion attribution).
- **Timing**: **Next / Enterprise DXP**.

### 9. AI Content & SEO Assistant — [Issue #30](https://github.com/OLGAX-com/olgax-dxp/issues/30)
- **User Problem**: Manual copywriting, SEO meta writing, and `en` -> `es` translation slow down small teams.
- **Beneficiaries**: Marketers and editors.
- **Essential for DXP?**: Emerging standard (Sitecore Stream, Optimizely Opal).
- **Complexity**: Medium (provider-agnostic `@olgax.com/ai` plugin; strictly opt-in).
- **Timing**: **Future Innovation (Phase 4)**.
