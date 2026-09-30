# @olgax.com/payload-preset

Minimal, reusable Payload CMS collections and globals for an Olgax DXP site: `Users` (auth),
`Media` (uploads), `Pages` (slug, title, drafts/versioning, and a `data` JSON field holding
Puck's `Data` shape), `Sections` (reusable page templates), `PageViews` (built-in analytics),
`Webhooks` (outbound integrations), and the `SiteSettings` global (site-wide theming).

## Install

```bash
npm install @olgax.com/payload-preset
```

## Usage

```ts
import { buildConfig } from "payload";
import { Users, Media, Pages, Sections, PageViews, Webhooks, SiteSettings } from "@olgax.com/payload-preset";

export default buildConfig({
  collections: [Users, Media, Pages, Sections, PageViews, Webhooks],
  globals: [SiteSettings],
  // ...db, editor, secret, etc.
});
```

