import type { ComponentConfig, DefaultComponentProps } from "@puckeditor/core";

// A single shared registry that `packages/components` (and any third-party
// component package) registers into, and that a consuming app's Puck config
// reads from - so registering a component never requires touching the SDK.
const registry: Record<string, ComponentConfig<DefaultComponentProps>> = {};

/**
 * Registers a Puck component so it shows up in the Puck editor and can be
 * rendered. This is the only public entry point third-party component
 * authors need - see `packages/components` for real usage examples.
 */
export function registerComponent<Props extends DefaultComponentProps>(
  name: string,
  config: ComponentConfig<Props>,
) {
  registry[name] = config as ComponentConfig<DefaultComponentProps>;
}

/** Returns every component registered so far, keyed by name. */
export function getRegisteredComponents() {
  return { ...registry };
}
