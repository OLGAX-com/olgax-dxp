# GitHub Copilot Instructions — Olgax DXP

> Place this file at `.github/copilot-instructions.md` in the repo root. GitHub Copilot
> (Chat, inline completions, and coding agent) will automatically read it for repo-wide context.

## Project Summary

Olgax DXP is an open-source, self-hostable page-building layer for **Payload CMS + Next.js**.
It is NOT a full enterprise DXP clone (not competing with Sitecore/AEM/Uniform). It is a
polished starter/framework that combines three things nobody has cleanly packaged together yet:

1. **Payload CMS** — content, media, auth, permissions, drafts (the durable backend).
2. **Puck** (`@measured/puck`) — the drag-and-drop visual canvas (MIT, framework-agnostic,
   do NOT reinvent this — integrate it).
3. **`@olgax.com/*` packages** — a component registry/SDK, a curated default component library,
   a Next.js renderer, and a CLI scaffolder (`create-olgax-site`) that ties the first two
   together into a working site in minutes.

Positioning line to keep in mind when naming things, writing docs, or designing APIs:
"An open-source, self-hostable page-building layer for Payload + Next.js — Payload for
content, Puck for the canvas, Olgax for the parts that make it feel like a product."

## Project Phases — READ THIS BEFORE SUGGESTING FEATURES

This project is built in four phases. **Copilot must always check which phase a task belongs
to before writing code**, and must actively resist scope creep — i.e. do not pull in
functionality from a later phase just because it seems related or "easy to add now." If a
requested change clearly belongs to a later phase, say so explicitly in a comment or PR
description rather than silently implementing it, and suggest opening a tracking issue instead.

The current phase is tracked in `PHASE.md` at the repo root (create this file if it does not
exist, containing a single line like `Phase 1 — MVP`). Copilot should read that file's contents
before deciding how much scope is in-bounds for a given task, and should update it when a phase
is explicitly declared complete by a maintainer — never update it unilaterally.

---

### Phase 0 — Spike / Proof of Concept (pre-repo, throwaway code)

**Goal**: confirm Puck's `Data` JSON can be stored in and round-tripped through a Payload field,
and that rendering it via Next.js feels good, before any public architecture commitments are
made.

**In scope**:
- A single throwaway Next.js + Payload app (not part of the monorepo).
- Manually wiring Puck's editor to save its `Data` output into a Payload collection field
  (JSON field is fine here — do not over-engineer the schema).
- A single Next.js route that reads that field back and renders it via Puck's `<Render>`
  component.

**Explicitly out of scope**: packages, SDK, CLI, component library, docs, tests, CI. This is
disposable exploration code. Do not suggest turning it into the monorepo structure — that
happens deliberately at the start of Phase 1, informed by what was learned here.

**Exit criteria** (Copilot should not push toward Phase 1 work until these are true):
- The integration works without fighting the frameworks.
- Editing in Puck and reloading the Next.js page shows the correct rendered result.
- No major architectural surprises were found (e.g., serialization issues, SSR mismatches).

---

### Phase 1 — MVP (current default target for most contributions)

**Goal**: a stranger can run `npx create-olgax-site my-site`, get a working Next.js + Payload +
Puck project in under two minutes, and see a public demo site that proves the concept is real.

**In scope — Copilot should actively help build these**:
- `create-olgax-site` — the CLI scaffolder.
- `packages/payload-preset` — minimal, reusable Payload collections: `Pages` (slug, title, and
  a field holding the Puck `Data` JSON), `Media`, `Users`. Nothing more elaborate yet.
- `packages/components` — 8-10 default components (Hero, Header, Footer, CTA, Gallery,
  Pricing, FAQ, Testimonials), each registered with Puck via the SDK.
- `packages/sdk` — a thin `registerComponent()` wrapper around Puck's config API. This is a
  developer-facing API surface — keep it small and well-typed; every addition to it should be
  justified by an actual component that needs it, not speculative flexibility.
- `apps/demo` — a reference site built entirely from the above packages, deployed publicly.
- `apps/docs` — a documentation site covering install, the component contribution flow, and
  the SDK.
- Repo hygiene: README with a demo GIF near the top, `CONTRIBUTING.md`, MIT `LICENSE`, issue/PR
  templates, 5-10 labeled "good first issue" tasks.

**Explicitly out of scope for Phase 1 — do not implement, even if asked in passing**:
- A custom drag-and-drop canvas. Puck is the canvas. Do not propose dnd-kit, React Flow, or any
  hand-rolled canvas/editor code unless a maintainer explicitly asks for an evaluation of
  alternatives to Puck.
- Multi-tenancy or multi-site support.
- Personalization, A/B testing, or analytics hooks.
- A data-source abstraction layer (components pulling filtered data from arbitrary Payload
  collections) — Phase 1 components take static props only.
- Theming/design-token systems beyond basic CSS variables for maintainability.
- Auth beyond what Payload's built-in access control already provides.
- SEO fields, localization, or versioning extras on the `Pages` collection.

**Exit criteria**: the CLI works end-to-end for a fresh user, the demo is deployed and linked
from the README, and the project has been publicly launched (e.g. Hacker News / r/nextjs /
r/webdev) with at least some external signal (stars, issues, PRs) before Phase 2 work starts.
Copilot should treat "no external users yet" as a reason to keep polishing Phase 1, not a
reason to start Phase 2 features early.

---

### Phase 2 — Developer & Component Experience (only after Phase 1 has real external users)

**Goal**: make it genuinely easy — documented target of under 15 minutes — for a third-party
developer to register a custom component, and give components access to real Payload data
instead of only static props.

**In scope**:
- SDK polish: better types, clearer error messages, a documented step-by-step "add your first
  component" tutorial that is literally timed and tested against the 15-minute target.
- `packages/datasource` (new package) — a resolver layer so a component can declare "pull N
  items from the `products` collection, filtered by category" and receive resolved data as
  props. Keep the resolver API narrow (collection + filter + limit) — do not build a general
  query language in this phase.
- Theming: design tokens / CSS variable sets that let a consuming project restyle default
  components without forking them.
- Templates and reusable page sections (saved groups of Puck blocks a user can insert as a
  unit).
- Improved live preview / click-to-edit ergonomics where Puck's own APIs support it — do not
  build a competing preview mechanism from scratch; extend what Puck exposes.

**Explicitly out of scope for Phase 2**:
- Multi-tenancy, personalization, A/B testing (still deferred to Phase 3).
- A component marketplace or public registry (Phase 3).
- Hosted/managed offering (Phase 3).

**Exit criteria**: at least a few external contributors have successfully added components or
data sources using only the public docs, without needing help from a maintainer in Discord/
GitHub Discussions.

---

### Phase 3 — Ecosystem & Scale (only if Phase 1-2 got real traction — do not pre-build this)

**Goal**: grow from "a good starter kit" toward "a small ecosystem," and open a path to
sustainability.

**In scope, but ONLY when explicitly requested by a maintainer for this phase**:
- Multi-site / basic multi-tenancy support.
- A component marketplace or shared registry (discovery + install flow for third-party
  component packages).
- Versioning and publishing workflow enhancements on top of Payload's drafts.
- An optional hosted "Studio" / managed hosting offering — this is also a plausible answer to
  the current gap left by Payload Cloud pausing new sign-ups, so it has real timing relevance,
  but it is a commercial/infra decision for maintainers, not something to scaffold speculatively.
- Personalization hooks — genuinely last on the list; do not introduce personalization-shaped
  APIs (segments, variants, rules engines) anywhere in earlier phases "just in case."

**Copilot guidance for this phase**: even once active, keep each Phase 3 feature behind its own
package/module boundary so it can be adopted independently — a consuming project should never
be forced to take on multi-tenancy complexity just to get marketplace components, for example.

---

### General rule of thumb for Copilot across all phases

When in doubt about whether something is in scope: check `PHASE.md`, prefer the smaller/narrower
implementation, and prefer flagging the ambiguity in a comment over guessing expansively. It is
always cheaper to extend a narrow API later than to unwind a speculative one.

## Monorepo Structure

This structure grows phase by phase. The Phase 1 baseline is below; Phase 2/3 additions
(`packages/datasource`, marketplace tooling, hosted-studio infra, etc.) should only be added
to this tree when that phase is actually underway — see the Phases section above.

```
olgax-dxp/
├── apps/
│   ├── demo/              # Reference site (Next.js + Payload + Puck), deployed publicly
│   └── docs/               # Documentation site
├── packages/
│   ├── payload-preset/     # Pre-configured Payload collections (Pages, Media, Users)
│   ├── components/         # Default component library, Puck-registered
│   ├── sdk/                # registerComponent() and related developer-facing APIs
│   └── datasource/         # [Phase 2] collection/filter resolver for component data
├── create-olgax-site/      # CLI scaffolder (npx create-olgax-site)
├── .github/
│   └── copilot-instructions.md
├── PHASE.md                 # Single source of truth for current project phase
├── README.md
├── CONTRIBUTING.md
├── LICENSE                 # MIT
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## Tech Stack & Conventions

- **Package manager**: pnpm (workspaces). Never suggest npm/yarn commands or lockfiles.
- **Build orchestration**: Turborepo. New packages need a `turbo.json` pipeline entry if they
  add build/lint/test scripts.
- **Language**: TypeScript everywhere, strict mode. No `any` unless justified with a comment.
- **Framework**: Next.js (App Router), React Server Components where practical, client
  components only where interactivity requires it (e.g., the Puck canvas itself).
- **CMS**: Payload CMS v3+ (config-as-code, runs natively inside the Next.js `/app` folder).
  Do not suggest Payload v2 patterns (e.g., separate Express server) — this project targets v3.
- **Visual builder**: Puck (`@measured/puck`). Page structure is stored as Puck's JSON `Data`
  shape inside a Payload field (JSON field or a dedicated richer field on the `pages`
  collection) — do not invent a competing schema.
- **Styling**: keep default components framework-agnostic and easy to theme — prefer CSS
  variables / Tailwind utility classes over hardcoded values, so themes (Phase 2) can layer on
  top without rewrites.
- **Testing**: Vitest for unit tests, Playwright for e2e on the demo app once one exists.
- **Linting/formatting**: ESLint + Prettier, shared config at the workspace root.

## Component & SDK Conventions

- Every default component in `packages/components` must:
  - Be a plain React component with a typed `props` interface.
  - Have a matching Puck config entry (`fields`, `defaultProps`) co-located or in a clearly
    paired file.
  - Ship with a short usage example in its own README or docs entry.
  - Avoid dependencies beyond what's already in the workspace unless discussed first.
- `registerComponent()` in `packages/sdk` should be a thin, well-typed wrapper — its whole
  purpose is making it fast (documented target: under 15 minutes) for a third-party developer
  to register a custom component. Don't add ceremony to this API.
- Prefer composition and small, focused components over large configurable "mega-components."

## Payload Conventions

- Collections live in `packages/payload-preset` and are meant to be imported into a consuming
  app's Payload config, not hardcoded into `apps/demo` directly — the preset must be reusable
  by `create-olgax-site` scaffolded projects.
- Keep the `pages` collection schema minimal in Phase 1: slug, title, and a field holding the
  Puck `Data` JSON. Resist adding SEO fields, localization, versioning extras, etc. until
  Phase 2 unless explicitly requested.
- Use Payload's built-in access control and draft/publish features rather than building custom
  equivalents.

## CLI (`create-olgax-site`) Conventions

- Target UX: `npx create-olgax-site my-site` produces a runnable project in under 2 minutes,
  matching the `create-t3-app` / `create-next-app` style of scaffolder.
- Keep prompts minimal (project name, maybe package manager choice). Don't add a long
  interactive wizard in Phase 1.
- Generated projects should depend on the published `@olgax.com/*` packages, not copy-paste their
  source, so upstream fixes propagate.

## Documentation & Contribution Conventions

- Every new package needs a README with: what it does, install instructions, one minimal code
  example.
- When adding a "good first issue"-sized piece of work (new component, doc page, small fix),
  make sure it's genuinely self-contained — don't let it quietly require touching the SDK or
  renderer internals.
- Write comments and docs assuming the reader is a competent TypeScript/React developer who is
  new to Payload and/or Puck specifically — don't over-explain React basics, do explain
  Payload/Puck-specific concepts.

## What NOT to do (applies across all phases unless the current phase says otherwise)

- Do not propose building a custom drag-and-drop canvas — use Puck, in every phase.
- Do not propose PHP/WordPress-style plugin architectures.
- Do not add personalization, multi-tenancy, marketplace, or analytics code paths ahead of the
  phase they belong to (see Phases section) — check `PHASE.md` first.
- Do not introduce a new state-management library without discussion (React state + Puck's own
  state handling should cover Phase 1-2 needs).
- Do not fabricate or assume APIs from Payload or Puck — check their current docs/types rather
  than guessing method signatures, since both are actively evolving libraries.
- Do not silently expand a package's public API "while you're in there" — new exports from
  `sdk` or `datasource` should map to an actual, current-phase need.