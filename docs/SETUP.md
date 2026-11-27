# OLGAX DXP – Verified Local Setup Guide

This guide documents the verified local development setup for the `OLGAX-com/olgax-dxp` monorepo on Windows, macOS, and Linux (verified against `main` at commit `8044172`).

## Prerequisites

- **Node.js**: **22.x** recommended (CI runs `node-version: 22`).
  - *Note*: While documentation states `20.9+`, `@rolldown/binding-win32-x64-msvc` (used by Vitest 4) requires `^20.19.0 || >=22.12.0`, and `apps/docs` requires Node 22+ for ESM module loading in `fumadocs-mdx`.
- **pnpm**: `11.6.0` (declared in root `package.json` `packageManager` field).
- **Docker** (optional): Only needed if running the optional self-hosted Umami analytics stack (`apps/demo/docker-compose.umami.yml`) or a local Postgres database.

## 1. Install Dependencies

```bash
git clone https://github.com/OLGAX-com/olgax-dxp.git
cd olgax-dxp
pnpm install --frozen-lockfile
```

> **Windows note:** Ensure Node 22.12+ (or 20.19+) is active in your `PATH` *before* running `pnpm install --frozen-lockfile`, otherwise pnpm may skip the `@rolldown/binding-win32-x64-msvc` optional dependency needed by `vitest`.

## 2. Configure Environment Variables (`apps/demo`)

Copy the example environment file and set a `PAYLOAD_SECRET`:

```bash
cp apps/demo/.env.example apps/demo/.env
```

Edit `apps/demo/.env`:

```env
PAYLOAD_SECRET=replace-with-a-long-random-secret-at-least-32-chars
DATABASE_URL=file:./payload.db
```

### Configuration Notes
- **Database**: Defaults to local SQLite (`file:./payload.db`) with zero external services. Setting `DATABASE_URL=postgres://...` switches `apps/demo/payload.config.ts` to `@payloadcms/db-postgres` automatically.
- **Datasource SSR (`NEXT_PUBLIC_SITE_URL`)**: Optional locally (`http://localhost:3000` default); required in production if `@olgax.com/datasource`'s `createCollectionResolverFetch` runs during SSR.
- **Umami Analytics (`NEXT_PUBLIC_UMAMI_*`)**: Optional. Leave unset to use only the built-in `PageViews` collection. If enabled, run `docker compose -f apps/demo/docker-compose.umami.yml up -d`.

## 3. Seed the Database

```bash
pnpm --filter demo seed
```

Verified seed output creates:
- **Admin user**: `admin@example.com` / `ChangeMe123!` (change before deploying)
- **Published homepage**: slug `home` with `Hero` and `CTA` blocks
- **Reusable section**: `cta-banner`

## 4. Start the Application

To run only the reference DXP site (`apps/demo`):

```bash
pnpm --filter demo dev
```

Or run all workspace apps via Turborepo:

```bash
pnpm dev
```

### Verified Endpoints
- Public homepage: `http://localhost:3000` (redirects to `/en` when localization is enabled)
- Payload Admin: `http://localhost:3000/admin`
- Editor Dashboard: `http://localhost:3000/en/dashboard`
- Visual Page Editor (Puck): `http://localhost:3000/en/home/edit`
- REST API: `http://localhost:3000/api/pages`
- GraphQL API: `http://localhost:3000/api/graphql`

## 5. Run Verification Checks

```bash
# Lint (apps/demo and apps/docs)
pnpm lint

# Production build of the demo app
pnpm --filter demo build

# Playwright E2E smoke suite (runs on port 3100 against an isolated payload.e2e.db)
pnpm --filter demo exec playwright install chromium
pnpm --filter demo test:e2e

# Unit tests (packages/sdk, packages/payload-preset)
pnpm test
```

## Known Setup Caveats

1. **`apps/docs` build on Windows**: `pnpm --filter docs build` currently fails on Windows in Next.js 16.3.0 Turbopack loader-runner (`ERR_REQUIRE_ESM` loading `fumadocs-mdx/dist/webpack/macro.js`). CI runs cleanly on `ubuntu-latest`. See [Issue #18](https://github.com/OLGAX-com/olgax-dxp/issues/18).
2. **`sharp` build script in `pnpm-workspace.yaml`**: `allowBuilds.sharp` is set to `false`; image upload works for PNGs, while generated image thumbnails (`thumbnailURL`) are `null` unless `imageSizes` and native `sharp` builds are enabled.
