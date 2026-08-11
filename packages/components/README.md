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
