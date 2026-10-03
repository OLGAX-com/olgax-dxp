# @olgax.com/multi-tenancy

Part of [Olgax DXP](https://dxp.olgax.com) | [Discord](https://discord.gg/EAXcCXgUz2)

> **Phase 3 groundwork.** This is a data-model starting point, not a finished multi-tenancy
> feature - no tenant-aware access control, domain-based routing, or admin UI site switcher yet.
> Entirely opt-in: importing this package doesn't change any other package's behavior.

## Usage

```ts
import { buildConfig } from "payload";
import { Users, Media, Pages } from "@olgax.com/payload-preset";
import { Sites, withSite } from "@olgax.com/multi-tenancy";

export default buildConfig({
  collections: [Users, Media, Sites, withSite(Pages)],
  // ...
});
```

`withSite()` adds a required `site` relationship field to any collection config - typically
`Pages` from `@olgax.com/payload-preset` - so documents can be scoped per site.
