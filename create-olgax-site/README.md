# create-olgax-site

Scaffolds a new Olgax DXP site: a Next.js + Payload CMS + Puck project pre-wired with
`@olgax/payload-preset`, `@olgax/sdk`, and `@olgax/components`.

## Usage

```bash
npx create-olgax-site my-site
```

Or without a name (you'll be prompted):

```bash
npx create-olgax-site
```

This copies the bundled template, installs dependencies with pnpm, and prints next steps
(setting `PAYLOAD_SECRET`, seeding a demo page, starting the dev server).

## Status

> The `@olgax/*` packages referenced by the template (`^0.1.0`) are not published to npm yet -
> this CLI is feature-complete but won't produce a fully installable project until Phase 1's
> packages are published. Until then, test it locally against the workspace (see below).

## Local testing (within this monorepo)

```bash
node create-olgax-site/bin/index.mjs test-site
```

This will scaffold `test-site/` as a sibling directory and attempt `pnpm install`, which will
fail on the `@olgax/*` deps until they're published - everything else (file copying, gitignore
rename, package.json rewrite) can be verified without that.
