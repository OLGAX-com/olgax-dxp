# @olgax.com/sdk

[Docs](https://dxp.olgax.com/docs/reference/sdk) | [Website](https://dxp.olgax.com) | [Discord](https://discord.gg/EAXcCXgUz2) | [GitHub](https://github.com/OLGAX-com/olgax-dxp)

A thin wrapper around Puck's config API. `registerComponent()` is the main entry
point - its whole purpose is making it fast to register a custom component with Puck. It also exports
`colorOverrideFields()`/`colorOverrideStyle()` and `visibilityFields()`/`isVisible()` (see the
[full reference](https://dxp.olgax.com/docs/reference/sdk)).

## Usage

```tsx
// MyComponent.tsx
import { registerComponent } from "@olgax.com/sdk";

registerComponent("MyComponent", {
  fields: {
    title: { type: "text" },
  },
  defaultProps: {
    title: "Hello",
  },
  render: ({ title }) => <h2>{title}</h2>,
});
```

Import the file for its side effect (e.g. from a package's `index.ts`), then build a Puck
`Config` from `getRegisteredComponents()`:

```ts
import { getRegisteredComponents } from "@olgax.com/sdk";
import type { Config } from "@puckeditor/core";

export const config: Config = { components: getRegisteredComponents() };
```
