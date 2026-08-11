# @olgax/payload-preset

Minimal, reusable Payload CMS collections for an Olgax DXP site: `Users` (auth), `Media`
(uploads), and `Pages` (slug, title, and a `data` JSON field holding Puck's `Data` shape).

## Install

This package is part of the Olgax DXP pnpm workspace and is consumed via the `workspace:*`
protocol - it isn't published standalone yet.

## Usage

```ts
import { buildConfig } from "payload";
import { Users, Media, Pages } from "@olgax/payload-preset";

export default buildConfig({
  collections: [Users, Media, Pages],
  // ...db, editor, secret, etc.
});
```
