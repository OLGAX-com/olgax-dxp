# @olgax/components

The default Olgax DXP component library: `Hero`, `Header`, `Footer`, `CTA`, `Gallery`,
`Pricing`, `FAQ`, `Testimonials`. Each component is a plain React component registered with
Puck via [`@olgax/sdk`](../sdk)'s `registerComponent()`, styled with CSS custom properties
(see `tokens.css`) so a consuming project can retheme every component without forking them.

## Usage

```ts
import { components } from "@olgax/components";
import type { Config } from "@puckeditor/core";

export const config: Config = { components };
```

Import `@olgax/components/dist/tokens.css` (or the `src/tokens.css` source in this workspace)
once in your app to get the default theme, then override any `--olgax-*` custom property to
retheme.

## Theming

Every component only ever reads `--olgax-*` CSS custom properties (with fallbacks), never
hardcoded colors or spacing - so a consuming app can retheme the whole library by overriding
those variables, no forking required. A `dark` theme ships as an example:

```ts
import "@olgax/components/src/themes/dark.css";
```

```html
<html data-theme="dark">
```

Add your own theme the same way: a CSS file scoping `--olgax-*` overrides under a selector
your app controls (a `data-theme` attribute, a class, a media query, etc).

### Per-component color overrides

Every component also accepts optional `backgroundColor` / `primaryColor` / `textColor` props
(hex colors, e.g. `"#18181b"`) - set via the same fields Puck shows for the component's own
content. Leaving them unset falls through to the theme defaults above; setting one only affects
that single component instance, not the rest of the page or site. This is built on
`@olgax/sdk`'s `colorOverrideFields()`/`colorOverrideStyle()`, so any third-party component can
opt into the same behavior.

## Components

Each entry below shows the props Puck stores for that component (as it would appear in a
`Data.content` item) - useful both for hand-authoring seed data and for understanding what
each component's Puck editor fields produce.

### Hero

```json
{
  "type": "Hero",
  "props": {
    "heading": "Build pages, not pipelines",
    "subheading": "A self-hostable page-building layer for Payload + Next.js.",
    "ctaLabel": "Get started",
    "ctaHref": "/get-started"
  }
}
```

### Header

```json
{
  "type": "Header",
  "props": {
    "logoText": "Olgax",
    "links": [
      { "label": "Home", "href": "/" },
      { "label": "About", "href": "/about" }
    ]
  }
}
```

### Footer

```json
{
  "type": "Footer",
  "props": {
    "text": "© 2026 Olgax",
    "links": [{ "label": "Privacy", "href": "/privacy" }]
  }
}
```

### CTA

```json
{
  "type": "CTA",
  "props": {
    "heading": "Ready to build your site?",
    "buttonLabel": "Get started",
    "buttonHref": "/get-started"
  }
}
```

### Gallery

```json
{
  "type": "Gallery",
  "props": {
    "images": [{ "src": "/photo-1.jpg", "alt": "A description of the photo" }]
  }
}
```

### Pricing

```json
{
  "type": "Pricing",
  "props": {
    "plans": [
      {
        "name": "Starter",
        "price": "$0/mo",
        "features": "1 site\nCommunity support",
        "ctaLabel": "Get started",
        "ctaHref": "/get-started"
      }
    ]
  }
}
```

`features` is a newline-separated string (one feature per line), rendered as a bullet list.

### FAQ

```json
{
  "type": "FAQ",
  "props": {
    "items": [{ "question": "What is Olgax DXP?", "answer": "A page-building layer for Payload + Next.js." }]
  }
}
```

### Testimonials

```json
{
  "type": "Testimonials",
  "props": {
    "items": [{ "quote": "This is great!", "author": "A happy user" }]
  }
}
```

### RelatedPages

Unlike the components above, `RelatedPages` doesn't self-register on import - it needs a
`resolveData` from [`@olgax/datasource`](../datasource) supplied by your app (see that
package's README, or `apps/demo/lib/puck.config.ts` for a complete example):

```ts
import { registerRelatedPages } from "@olgax/components";
import { createCollectionResolverFetch } from "@olgax/datasource";

registerRelatedPages(createCollectionResolverFetch("/api/related-pages"));
```

Author-facing props (set in the Puck editor): `collection`, `filterField`, `filterValue`,
`limit`. `items` is resolved automatically and read-only.
