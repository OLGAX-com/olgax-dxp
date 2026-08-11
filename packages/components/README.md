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
