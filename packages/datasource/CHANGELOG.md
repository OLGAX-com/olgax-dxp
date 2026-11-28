# @olgax.com/datasource

## 0.2.0

### Minor Changes

- 268b064: - `@olgax.com/datasource`: Add allowlisted `sort`, `page`, `depth`, and `filterOperator` (`equals`, `not_equals`, `contains`) options plus `queryCollectionWithMeta()` returning pagination metadata.
  - `@olgax.com/payload-preset`: Export `createDraftWorkflowHooks()`, `dispatchWebhooks()`, `createPagesCollection({ reservedSlugs })`, and `createWebhooksCollection({ events })`.
  - `apps/demo` & `create-olgax-site/template`: Exclude `/rss.xml`, `/feed.xml`, and `/atom.xml` in `proxy.ts`.

### Patch Changes

- 22eea80: - Handle `--help` / `--version` flags and reject unknown flags in `create-olgax-site` CLI instead of scaffolding directories from flags.
  - Include `pnpm-workspace.yaml` with `allowBuilds` for `esbuild` in the starter template so `pnpm install` passes cleanly on pnpm v11.
  - Forward `locale` through `@olgax.com/datasource`'s `createCollectionResolver` and re-resolve dynamic `@olgax.com/datasource` blocks on SSR in `PageRenderer` using Puck `resolveAllData()` and Payload Local API.
  - Clarify Puck RSC rules in `Callout.tsx` and add `--client` mode to `scripts/new-component.mjs` so client blocks never leak `props.puck` functions across RSC boundaries.

## 0.1.4

### Patch Changes

- aa9b1ec: Enforce Payload access control and collection allowlists in `@olgax.com/datasource` and `/api/related-pages`, add SSRF URL/IP validation to webhook configuration and dispatch, and require a non-empty `PAYLOAD_SECRET` at production runtime.

## 0.1.3

### Patch Changes

- ecf8364: Link the new documentation site (https://dxp.olgax.com) and the official Discord (https://discord.gg/EAXcCXgUz2) from READMEs, package metadata and the CLI's next-steps output, and refresh the generated project's README.

## 0.1.2

### Patch Changes

- fdccb7c: Remove references to an internal repo file from the published README and source comments.

## 0.1.1

### Patch Changes

- 8ff0cbe: Add npm search metadata (description, keywords, repository) to package.json so it's indexed on npmjs.com.
