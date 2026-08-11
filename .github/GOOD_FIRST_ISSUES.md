# Good first issues

A starter list of self-contained tasks for new contributors. Each is scoped to avoid touching
SDK/renderer internals. Turn these into actual GitHub issues with the `good first issue` label
when ready.

1. **Add a "Spacer" component** to `packages/components` - a simple block with a `height`
   number field, no fields beyond that. Good intro to the `registerComponent()` pattern.
2. **Add a "Divider" component** - a horizontal rule with a `style` select field (solid/dashed).
3. **Add per-component usage examples** - a short README section (or JSDoc example) for each
   component in `packages/components/src/blocks/`, showing its fields and a screenshot.
4. **Add an `alt` text validation** to the `Media` collection in `packages/payload-preset` so
   uploads without alt text show a clear Payload admin validation error.
5. **Add a loading/empty state** to the `Gallery` component when `images` is empty.
6. **Write a "your first component in 15 minutes" tutorial** for `apps/docs` (once scaffolded),
   timed against the actual `registerComponent()` workflow.
7. **Add `CTAProps`/etc. Storybook-style preview** - a simple static page in `apps/demo` that
   renders every registered component with its default props, for visual QA.
8. **Improve `NewPageForm`** in `apps/demo` - add basic slug validation/collision feedback
   (currently just navigates to `/[slug]/edit` with no checks).

## Guidelines for issue authors

- Keep scope to a single component, doc page, or small fix - not multiple at once.
- Link to the relevant file(s) so a new contributor doesn't have to hunt for them.
- Avoid anything that requires touching `packages/sdk`'s public API surface.
