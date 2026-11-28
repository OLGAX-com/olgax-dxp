---
"create-olgax-site": patch
---

- Handle `--help` / `--version` flags and reject unknown flags in `create-olgax-site` CLI instead of scaffolding directories from flags.
- Include `pnpm-workspace.yaml` with `allowBuilds` for `esbuild` in the starter template so `pnpm install` passes cleanly on pnpm v11.
- Re-resolve dynamic `@olgax.com/datasource` blocks on SSR in `PageRenderer` using Puck `resolveAllData()` and Payload Local API.
- Clarify Puck RSC rules in `Callout.tsx` and add `--client` mode to `scripts/new-component.mjs` so client blocks never leak `props.puck` functions across RSC boundaries.
