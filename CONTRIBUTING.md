# Contributing to Olgax DXP

Thanks for your interest in contributing! See `PHASE.md` and `.github/copilot-instructions.md`
for what's in scope right now.

## Project structure

This is a pnpm + Turborepo workspace:

```
apps/demo                  # Reference Next.js + Payload + Puck site
apps/docs                  # Documentation site
packages/payload-preset    # Payload collections/globals (Users, Media, Pages, Sections, ...)
packages/sdk               # registerComponent() and related developer-facing APIs
packages/components        # Default component library
packages/datasource        # Collection/filter/limit data resolvers
packages/multi-tenancy     # [groundwork only] Sites collection + withSite() helper
packages/marketplace       # [groundwork only] component manifest schema/validation
create-olgax-site          # CLI scaffolder
```

## Getting set up

```bash
pnpm install
cp apps/demo/.env.example apps/demo/.env   # fill in PAYLOAD_SECRET
pnpm --filter demo seed                    # creates an admin user + demo page
pnpm dev                                   # runs dev servers via turbo
```

## Adding a component to `packages/components`

1. Create `src/blocks/YourComponent.tsx` with a typed props interface and a
   `registerComponent("YourComponent", { fields, defaultProps, render })` call - see any
   existing block (e.g. `Hero.tsx`) for the pattern.
2. Add a co-located `YourComponent.css` using `--olgax-*` custom properties (see `tokens.css`)
   instead of hardcoded colors/spacing, so it stays themeable.
3. Import the new file (for its registration side effect) from `src/index.ts`.
4. Avoid client-only hooks (`useState`, etc.) in `render` - components need to work in both the
   Puck editor (client) and `<Render>` (can run in RSC).

## Pull requests

- Keep PRs focused - one component, one fix, one doc update per PR where possible.
- Run `pnpm lint` and `pnpm build` before opening a PR (CI runs both on every PR too).
- Check `PHASE.md` before proposing anything from a later phase (see
  `.github/copilot-instructions.md` for the full phase breakdown) - open a tracking issue
  instead if it's out of scope for now.

## Releasing (`@olgax.com/*` packages, `create-olgax-site`)

This repo uses [Changesets](https://github.com/changesets/changesets) for versioning and
publishing. If your PR changes anything inside `packages/sdk`, `packages/components`,
`packages/datasource`, `packages/payload-preset`, or `create-olgax-site`, add a changeset:

```bash
pnpm changeset
```

Pick the affected package(s), a semver bump (patch for fixes, minor for new features, major for
breaking changes), and write a one-line summary - it becomes the changelog entry. Commit the
generated `.changeset/*.md` file with your PR. `packages/marketplace` and `packages/multi-tenancy`
are intentionally excluded from versioning/publishing for now (see `.changeset/config.json`) -
they're groundwork only, not real features yet.

Merging to `main` with pending changesets opens/updates a "Version Packages" PR automatically
(`.github/workflows/release.yml`); merging that PR publishes to npm.

## Code of conduct

Be respectful and constructive. This is a community project.
