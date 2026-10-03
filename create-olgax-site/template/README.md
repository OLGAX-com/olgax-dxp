# My Olgax site

A [Next.js](https://nextjs.org) + [Payload CMS](https://payloadcms.com) + [Puck](https://puckeditor.com)
site, scaffolded with [`create-olgax-site`](https://www.npmjs.com/package/create-olgax-site) from
[Olgax DXP](https://github.com/OLGAX-com/olgax-dxp).

## Getting started

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) for the site. The scaffolder already created
`.env` (with a generated `PAYLOAD_SECRET`) and seeded a demo homepage plus an admin user.

| URL | What it is |
| --- | --- |
| `/` | Your public homepage |
| `/dashboard` | Manage pages, analytics and site settings |
| `/<slug>/edit` | The visual page builder (for example `/home/edit`) |
| `/admin` | The Payload admin panel (users, media, webhooks, raw data) |

**Default login:** `admin@example.com` / `ChangeMe123!`. Change this password in `/admin` before
you deploy anything.

If the homepage says "This site doesn't have a homepage yet", the seed didn't run. Run
`pnpm seed` (it is safe to re-run), or create a page with the slug `home` from the dashboard.

## Project structure

```
app/(frontend)/      Public site, dashboard and the page editor routes
app/(payload)/       Payload admin panel and API
components/blocks/   YOUR custom page-builder blocks, listed in components/blocks/index.ts
components/          App components (editor, renderer, dashboard UI)
lib/puck.config.tsx  Combines the default components and your blocks into one editor config
payload.config.ts    Payload config (collections, localization, database)
scripts/seed.ts      Creates the admin user and the demo homepage
```

## Add your own component

Every block in the page builder is a Puck component config. Your blocks live in
`components/blocks/`, and `components/blocks/index.ts` is the list of blocks your site uses.
A working example is in `components/blocks/Callout.tsx`.

**1. Generate a block**

```bash
pnpm new:component PromoBanner
```

This creates `components/blocks/PromoBanner.tsx` and `PromoBanner.css`, and adds the block to the
`blocks` list in `components/blocks/index.ts`. With `pnpm dev` running it shows up in the
editor's component list straight away, with no restart or reload.

**2. Edit it.** The file exports one config with three parts:

```tsx
export const promoBannerBlock: ComponentConfig<{ props: PromoBannerProps }> = {
  fields: { title: { type: "text" } },   // the inputs editors fill in
  defaultProps: { title: "PromoBanner" }, // values when first dropped on a page
  render: (props) => <PromoBannerView {...props} />, // what visitors see
};
```

Save the file and the open editor updates its fields live. Add or rename fields freely; new
fields show up in the side panel immediately.

- `fields` accepts any [Puck field type](https://puckeditor.com/docs/api-reference/fields)
  (`text`, `textarea`, `number`, `select`, `radio`, `array`, `custom`, ...).
- Spread `...colorOverrideFields()` and `...visibilityFields()` into `fields` to give your block
  per-block colors and "show to new / returning visitors" rules, like the built-in blocks.
- Style with the `--olgax-*` CSS variables so your block follows the site theme.
- Don't use hooks in a block unless the file starts with `"use client"`. Blocks render in both
  the editor and on the server.
- Give new fields a value in `defaultProps` and make the view handle missing values. Pages you
  already saved don't have the new field until someone edits and saves them again.

**3. Use it.** Open a page's editor (for example `/home/edit`) and drag your block in from the
component list. Publish the page to see it on the live site.

**Adding a block by hand.** Create the file and export a config like above, then add two lines to
`components/blocks/index.ts`: an `import` and an entry in the `blocks` object
(`PromoBanner: block(promoBannerBlock)`). The key is the name shown in the editor and stored in
each page, so renaming it affects pages that already use the block.

## Configuration

Set these in `.env` (see `.env.example` for the full list):

| Variable | Purpose |
| --- | --- |
| `PAYLOAD_SECRET` | Required. Signs sessions. Generated for you in `.env`. |
| `DATABASE_URL` | `file:./payload.db` (SQLite, default) or a `postgres://` URL for production |
| `NEXT_PUBLIC_SITE_URL` | Your public URL. Needed in production for server-side data components |
| `NEXT_PUBLIC_UMAMI_*` | Optional [Umami](https://umami.is) analytics (`docker-compose.umami.yml`) |

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` / `pnpm start` | Production build and server |
| `pnpm seed` | Create the admin user and demo homepage if missing |
| `pnpm new:component <Name>` | Generate a custom page-builder block |
| `pnpm migrate`, `migrate:create`, `migrate:status` | Database migrations (use these with Postgres) |
| `pnpm generate:types` | Regenerate Payload types after changing collections |

## Deploying

Set `PAYLOAD_SECRET` to a long random value, point `DATABASE_URL` at Postgres, set
`NEXT_PUBLIC_SITE_URL`, run `pnpm migrate`, then `pnpm build && pnpm start`. SQLite is for local
development only.

## Learn more

- [Olgax DXP on GitHub](https://github.com/OLGAX-com/olgax-dxp) (docs live in `apps/docs`)
- [Payload docs](https://payloadcms.com/docs)
- [Puck docs](https://puckeditor.com/docs)

## License

The scaffolded code is MIT licensed (see `LICENSE`). Replace it with your own license for your
project if you prefer.
