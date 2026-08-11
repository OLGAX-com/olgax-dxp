# @olgax/datasource

A narrow resolver layer so a Puck component can declare "pull N items from a Payload
collection, filtered by one field" and receive them as a resolved `items` prop - without
hand-writing Payload queries in every component. Deliberately does not support a general query
language (no `and`/`or`, no operators beyond equality, one filter field at a time) - see
`.github/copilot-instructions.md`'s Phase 2 scope.

## Two resolvers - pick based on where your config is used

Puck's `<Puck>` editor renders in the browser, so a `resolveData` shared with it must never
import the `payload` package (it's server/Node-only and will break the client bundle). Use:

- **`createCollectionResolverFetch(endpoint)`** - calls a same-app Route Handler over `fetch`.
  Safe for a config shared between the client `<Puck>` editor and server `<Render>`. This is
  what you want in almost all cases.
- **`createCollectionResolver(getPayload)`** - calls the Payload Local API directly.
  Server-only - only use it in a config that exclusively backs server-rendered `<Render>` and
  is never imported by client-bundled code.

## Usage

```ts
// lib/puck.config.ts - shared by the editor and the render route
import { createCollectionResolverFetch } from "@olgax/datasource";
import { registerRelatedPages } from "@olgax/components";

registerRelatedPages(createCollectionResolverFetch("/api/related-pages"));
```

```ts
// app/(frontend)/api/related-pages/route.ts - the Route Handler it calls
import { NextResponse } from "next/server";
import { queryCollectionFromSearchParams } from "@olgax/datasource";
import { getPayloadClient } from "@/lib/payload";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const items = await queryCollectionFromSearchParams(getPayloadClient, searchParams);
  return NextResponse.json(items);
}
```

The author sets `collection`, optionally `filterField`/`filterValue` (a single equality
filter), and `limit` in the Puck editor; `items` is resolved automatically and marked
read-only.
