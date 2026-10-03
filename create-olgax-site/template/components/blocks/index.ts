import type { ComponentConfig, DefaultComponentProps } from "@puckeditor/core";
import { calloutBlock } from "./Callout";
// new:component imports go above this line

// Puck's component types are invariant in their props, so each block is widened once here.
const block = <P extends DefaultComponentProps>(config: ComponentConfig<{ props: P }>) =>
  config as unknown as ComponentConfig<DefaultComponentProps>;

// Every custom block is listed here. The key is the block's name: it is shown in the page
// builder and stored in each page, so renaming a key affects pages that already use it.
// `pnpm new:component <Name>` adds the import and the entry for you.
export const blocks = {
  Callout: block(calloutBlock),
  // new:component entries go above this line
};
