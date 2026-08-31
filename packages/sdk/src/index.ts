import type { ComponentConfig, DefaultComponentProps } from "@puckeditor/core";

export { colorOverrideFields, colorOverrideStyle } from "./theming";
export type { ColorOverrideProps } from "./theming";
export { visibilityFields, isVisible } from "./personalization";
export type { VisibilityProps, VisibilityRule, VisitorState } from "./personalization";

// A single shared registry that `packages/components` (and any third-party
// component package) registers into, and that a consuming app's Puck config
// reads from - so registering a component never requires touching the SDK.
const registry: Record<string, ComponentConfig<DefaultComponentProps>> = {};

/**
 * Registers a Puck component so it shows up in the Puck editor and can be
 * rendered. This is the only public entry point third-party component
 * authors need - see `packages/components` for real usage examples.
 *
 * Warns (does not throw) if `name` is already registered, since that's almost
 * always an accidental collision between two component packages rather than
 * an intentional override.
 */
export function registerComponent<Props extends DefaultComponentProps>(
  name: string,
  // Wrapping Props in the `{ props: Props }` "params" shape sidesteps Puck's
  // Exact-type constraint on ComponentConfig, which doesn't resolve correctly
  // against an abstract (non-literal) generic type parameter.
  config: ComponentConfig<{ props: Props }>,
) {
  if (!name) {
    throw new Error("registerComponent: `name` is required");
  }
  if (registry[name]) {
    console.warn(
      `@olgax/sdk: a component named "${name}" is already registered - it will be overwritten. ` +
        "This usually means two component packages picked the same name.",
    );
  }
  registry[name] = config as ComponentConfig<DefaultComponentProps>;
}

/** Returns every component registered so far, keyed by name. */
export function getRegisteredComponents() {
  return { ...registry };
}
