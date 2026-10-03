#!/usr/bin/env node
// Usage: pnpm new:component PromoBanner
// Creates components/blocks/PromoBanner.tsx + .css and adds it to the blocks map in components/blocks/index.ts.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const name = process.argv[2];

if (!name || !/^[A-Z][A-Za-z0-9]*$/.test(name)) {
  console.error("Usage: pnpm new:component <PascalCaseName>   e.g. pnpm new:component PromoBanner");
  process.exit(1);
}

const blocksDir = join(dirname(fileURLToPath(import.meta.url)), "..", "components", "blocks");
const tsxPath = join(blocksDir, `${name}.tsx`);
const cssPath = join(blocksDir, `${name}.css`);
const indexPath = join(blocksDir, "index.ts");

if (existsSync(tsxPath) || existsSync(cssPath)) {
  console.error(`components/blocks/${name} already exists.`);
  process.exit(1);
}

const className = `site-${name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()}`;
const configName = `${name[0].toLowerCase()}${name.slice(1)}Block`;

const tsx = `import type { ComponentConfig } from "@puckeditor/core";
import {
  colorOverrideFields,
  colorOverrideStyle,
  visibilityFields,
  isVisible,
  type ColorOverrideProps,
  type VisibilityProps,
} from "@olgax.com/sdk";
import "./__NAME__.css";

export type __NAME__Props = {
  title: string;
} & ColorOverrideProps &
  VisibilityProps;

const __NAME__View = ({ title, ...props }: __NAME__Props) => (
  <section className="__CLASS__" style={colorOverrideStyle(props)}>
    <h2>{title}</h2>
  </section>
);

// Listed in components/blocks/index.ts - the key used there is the name shown in the editor.
export const __CONFIG__: ComponentConfig<{ props: __NAME__Props }> = {
  fields: {
    title: { type: "text" },
    ...colorOverrideFields(),
    ...visibilityFields(),
  },
  defaultProps: {
    title: "__NAME__",
  },
  render: (props) =>
    isVisible(props.visibility, props.puck?.metadata?.visitor) ? <__NAME__View {...props} /> : <></>,
};
`;

const css = `.__CLASS__ {
  padding: calc(var(--olgax-spacing, 1rem) * 2);
  background: var(--olgax-color-bg, #ffffff);
  color: var(--olgax-color-text, #18181b);
  font-family: var(--olgax-font-family, system-ui, sans-serif);
}
`;

mkdirSync(blocksDir, { recursive: true });
writeFileSync(
  tsxPath,
  tsx.replaceAll("__NAME__", name).replaceAll("__CLASS__", className).replaceAll("__CONFIG__", configName),
);
writeFileSync(cssPath, css.replaceAll("__CLASS__", className));

const importMarker = "// new:component imports go above this line";
const entryMarker = "  // new:component entries go above this line";
const indexSource = existsSync(indexPath) ? readFileSync(indexPath, "utf8") : "";

if (indexSource.includes(importMarker) && indexSource.includes(entryMarker)) {
  writeFileSync(
    indexPath,
    indexSource
      .replace(importMarker, `import { ${configName} } from "./${name}";\n${importMarker}`)
      .replace(entryMarker, `  ${name}: block(${configName}),\n${entryMarker}`),
  );
  console.log(`Created components/blocks/${name}.tsx and ${name}.css and added it to components/blocks/index.ts.`);
  console.log(`Open any page's /edit URL while "pnpm dev" is running and add "${name}" from the component list.`);
} else {
  console.log(`Created components/blocks/${name}.tsx and ${name}.css.`);
  console.log("components/blocks/index.ts doesn't have the new:component markers, so add these two lines yourself:");
  console.log(`  import { ${configName} } from "./${name}";`);
  console.log(`  ${name}: block(${configName}),   // inside the blocks object`);
}
