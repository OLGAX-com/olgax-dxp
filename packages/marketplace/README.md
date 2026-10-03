# @olgax.com/marketplace

Part of [Olgax DXP](https://dxp.olgax.com) | [Discord](https://discord.gg/EAXcCXgUz2)

> **Phase 3 groundwork, not a working feature.** This package only defines the
> `ComponentManifest` schema and a validator for it. There is no registry backend, no
> discovery UI, and no install flow yet - building those is real infrastructure work for a
> maintainer to scope deliberately, not something to pre-build speculatively.

## Usage

```ts
import { validateManifest } from "@olgax.com/marketplace";

const result = validateManifest({
  name: "olgax-component-carousel",
  version: "1.0.0",
  description: "A carousel component for Olgax DXP",
  repository: "https://github.com/example/olgax-component-carousel",
  tags: ["media", "carousel"],
});

if (!result.valid) {
  console.error(result.errors);
}
```
