# create-olgax-site

Scaffolds a new Olgax DXP site: a Next.js + Payload CMS + Puck project pre-wired with
`@olgax.com/payload-preset`, `@olgax.com/sdk`, and `@olgax.com/components`.

## Usage

```bash
npx create-olgax-site my-site
cd my-site
pnpm dev
```

Or without a name (you'll be prompted):

```bash
npx create-olgax-site
```

The CLI copies the template, creates `.env` with a generated `PAYLOAD_SECRET`, installs
dependencies with pnpm, and seeds an admin user and a demo homepage, so `pnpm dev` shows a real
page straight away. Requires Node.js 20.9+ and [pnpm](https://pnpm.io). If the install or seed
step fails, the CLI tells you which command to run yourself.

## What you get

- A public site, a dashboard (`/dashboard`) and a visual page builder (`/<slug>/edit`)
- The Payload admin panel at `/admin` (default login `admin@example.com` / `ChangeMe123!`)
- A `README.md` and `LICENSE` in the generated project
- `components/blocks/` for your own page-builder components - generate one with
  `pnpm new:component MyBlock`

## Local testing (within this monorepo)

```bash
node create-olgax-site/bin/index.mjs test-site
```

This scaffolds `test-site/` in the current directory and runs the same install and seed steps.
