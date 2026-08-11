# @olgax/multi-tenancy

> **Phase 3 groundwork.** This is a data-model starting point, not a finished multi-tenancy
> feature - no tenant-aware access control, domain-based routing, or admin UI site switcher yet.
> Entirely opt-in: importing this package doesn't change any other package's behavior.

## Usage

```ts
import { buildConfig } from "payload";
import { Users, Media, Pages } from "@olgax/payload-preset";
import { Sites, withSite } from "@olgax/multi-tenancy";

export default buildConfig({
  collections: [Users, Media, Sites, withSite(Pages)],
  // ...
});
```

`withSite()` adds a required `site` relationship field to any collection config - typically
`Pages` from `@olgax/payload-preset` - so documents can be scoped per site.
