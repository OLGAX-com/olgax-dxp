# create-olgax-site

## 0.2.3

### Patch Changes

- ecf8364: Link the new documentation site (https://dxp.olgax.com) and the official Discord (https://discord.gg/EAXcCXgUz2) from READMEs, package metadata and the CLI's next-steps output, and refresh the generated project's README.

## 0.2.2

### Patch Changes

- f7577c5: The page editor preview now stays styled exactly like the live page. Puck copies the page's stylesheets into the preview once and never refreshes them, so during `pnpm dev` a hot-updated stylesheet (or the page re-inserting one) left custom blocks unstyled in the editor until a reload. New `components/EditorStyleSync.tsx` keeps the preview's copies in step. The README also gains a troubleshooting section.

## 0.2.1

### Patch Changes

- 4ff2d4f: Custom components no longer need a reload or a restart. Blocks in `components/blocks/` are now plain exported Puck configs listed in `components/blocks/index.ts`, and the open editor updates live when you edit a block's fields or add a new block with `pnpm new:component`. The generated README documents the flow, including renaming and new-field pitfalls.

## 0.2.0

### Minor Changes

- c5f26e1: Scaffolded projects now work on the first run and have a clear path for custom components.

  - The CLI creates `.env` with a generated `PAYLOAD_SECRET` and runs the seed, so `pnpm dev` shows a real homepage instead of the "no homepage" page.
  - Generated projects include a `README.md` and a `LICENSE`.
  - New `components/blocks/` folder for your own page-builder components, with a working `Callout` example and `pnpm new:component <Name>` to generate and register a new block.
  - The first-run fallback page now explains how to fix a missing homepage.

## 0.1.2

### Patch Changes

- 22d97bc: Pin all Payload packages in the scaffolded project's `package.json` to the exact tested version (3.87.1). Scaffolded projects have no lockfile, so the previous caret ranges let `payload` resolve to a newer release than the exact-pinned `@payloadcms/ui`, and Payload refused to start (`Mismatching "payload" dependency versions`).

## 0.1.1

### Patch Changes

- 8ff0cbe: Add npm search metadata (description, keywords, repository) to package.json so it's indexed on npmjs.com.
