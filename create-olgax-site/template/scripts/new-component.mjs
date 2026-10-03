#!/usr/bin/env node
// Usage: pnpm new:component PromoBanner
// Creates components/blocks/PromoBanner.tsx + .css and registers it in components/blocks/index.ts.
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

const tsx = `import {
  registerComponent,
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

const __NAME__ = ({ title, ...props }: __NAME__Props) => (
  <section className="__CLASS__" style={colorOverrideStyle(props)}>
    <h2>{title}</h2>
  </section>
);

// The name below is what shows up in the editor's component list.
registerComponent<__NAME__Props>("__NAME__", {
  fields: {
    title: { type: "text" },
    ...colorOverrideFields(),
    ...visibilityFields(),
  },
  defaultProps: {
    title: "__NAME__",
  },
  render: (props) =>
    isVisible(props.visibility, props.puck?.metadata?.visitor) ? <__NAME__ {...props} /> : <></>,
});
`;

const css = `.__CLASS__ {
  padding: calc(var(--olgax-spacing, 1rem) * 2);
  background: var(--olgax-color-bg, #ffffff);
  color: var(--olgax-color-text, #18181b);
  font-family: var(--olgax-font-family, system-ui, sans-serif);
}
`;

mkdirSync(blocksDir, { recursive: true });
writeFileSync(tsxPath, tsx.replaceAll("__NAME__", name).replaceAll("__CLASS__", className));
writeFileSync(cssPath, css.replaceAll("__CLASS__", className));

const importLine = `import "./${name}";`;
const indexSource = existsSync(indexPath) ? readFileSync(indexPath, "utf8") : "";
if (!indexSource.includes(importLine)) {
  const separator = indexSource === "" || indexSource.endsWith("\n") ? "" : "\n";
  writeFileSync(indexPath, `${indexSource}${separator}${importLine}\n`);
}

console.log(`Created components/blocks/${name}.tsx and ${name}.css, registered in components/blocks/index.ts.`);
console.log(`Open any page's /edit URL while "pnpm dev" is running and add "${name}" from the component list.`);
