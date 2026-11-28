#!/usr/bin/env node
// Usage: pnpm new:component PromoBanner [--client]
// Creates components/blocks/PromoBanner.tsx + .css (and PromoBannerClient.tsx with --client)
// and adds it to the blocks map in components/blocks/index.ts.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const rawArgs = process.argv.slice(2);
const isClient = rawArgs.includes("--client");
const name = rawArgs.find((arg) => !arg.startsWith("-"));

if (!name || !/^[A-Z][A-Za-z0-9]*$/.test(name)) {
  console.error(
    "Usage: pnpm new:component <PascalCaseName> [--client]   e.g. pnpm new:component PromoBanner",
  );
  process.exit(1);
}

const blocksDir = join(dirname(fileURLToPath(import.meta.url)), "..", "components", "blocks");
const tsxPath = join(blocksDir, `${name}.tsx`);
const clientPath = join(blocksDir, `${name}Client.tsx`);
const cssPath = join(blocksDir, `${name}.css`);
const indexPath = join(blocksDir, "index.ts");

if (existsSync(tsxPath) || existsSync(cssPath) || (isClient && existsSync(clientPath))) {
  console.error(`components/blocks/${name} already exists.`);
  process.exit(1);
}

const className = `site-${name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()}`;
const configName = `${name[0].toLowerCase()}${name.slice(1)}Block`;

const serverTsx = `import type { ComponentConfig } from "@puckeditor/core";
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

const __NAME__View = ({
  title,
  primaryColor,
  backgroundColor,
  textColor,
}: __NAME__Props) => (
  <section
    className="__CLASS__"
    style={colorOverrideStyle({ primaryColor, backgroundColor, textColor })}
  >
    <h2>{title}</h2>
  </section>
);

// Keep ComponentConfig server-safe (never add "use client" here or spread props.puck).
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
    isVisible(props.visibility, props.puck?.metadata?.visitor) ? (
      <__NAME__View
        title={props.title}
        primaryColor={props.primaryColor}
        backgroundColor={props.backgroundColor}
        textColor={props.textColor}
      />
    ) : (
      <></>
    ),
};
`;

const clientBridgeTsx = `import type { ComponentConfig } from "@puckeditor/core";
import {
  colorOverrideFields,
  visibilityFields,
  isVisible,
  type ColorOverrideProps,
  type VisibilityProps,
} from "@olgax.com/sdk";
import { __NAME__Client } from "./__NAME__Client";
import "./__NAME__.css";

export type __NAME__Props = {
  title: string;
} & ColorOverrideProps &
  VisibilityProps;

// Keep this ComponentConfig file server-safe; interactive hooks live in __NAME__Client.tsx.
// Pass only plain serializable props below (never spread props.puck).
export const __CONFIG__: ComponentConfig<{ props: __NAME__Props }> = {
  fields: {
    title: { type: "text" },
    ...colorOverrideFields(),
    ...visibilityFields(),
  },
  defaultProps: {
    title: "__NAME__",
  },
  render: ({ title, primaryColor, backgroundColor, textColor, visibility, puck }) =>
    isVisible(visibility, puck?.metadata?.visitor) ? (
      <__NAME__Client
        title={title}
        primaryColor={primaryColor}
        backgroundColor={backgroundColor}
        textColor={textColor}
      />
    ) : (
      <></>
    ),
};
`;

const clientChildTsx = `"use client";

import { useState } from "react";
import { colorOverrideStyle, type ColorOverrideProps } from "@olgax.com/sdk";

export function __NAME__Client({
  title,
  primaryColor,
  backgroundColor,
  textColor,
}: { title: string } & ColorOverrideProps) {
  const [count, setCount] = useState(0);

  return (
    <section
      className="__CLASS__"
      style={colorOverrideStyle({ primaryColor, backgroundColor, textColor })}
    >
      <h2>{title}</h2>
      <button type="button" onClick={() => setCount((c) => c + 1)}>
        Clicks: {count}
      </button>
    </section>
  );
}
`;

const css = `.__CLASS__ {
  padding: calc(var(--olgax-spacing, 1rem) * 2);
  background: var(--olgax-color-bg, #ffffff);
  color: var(--olgax-color-text, #18181b);
  font-family: var(--olgax-font-family, system-ui, sans-serif);
}
`;

const replaceTokens = (content) =>
  content
    .replaceAll("__NAME__", name)
    .replaceAll("__CLASS__", className)
    .replaceAll("__CONFIG__", configName);

mkdirSync(blocksDir, { recursive: true });
writeFileSync(tsxPath, replaceTokens(isClient ? clientBridgeTsx : serverTsx));
if (isClient) {
  writeFileSync(clientPath, replaceTokens(clientChildTsx));
}
writeFileSync(cssPath, replaceTokens(css));

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
  console.log(
    `Created components/blocks/${name}.tsx${isClient ? `, ${name}Client.tsx,` : ""} and ${name}.css and added it to components/blocks/index.ts.`,
  );
  console.log(`Open any page's /edit URL while "pnpm dev" is running and add "${name}" from the component list.`);
} else {
  console.log(`Created components/blocks/${name}.tsx${isClient ? `, ${name}Client.tsx,` : ""} and ${name}.css.`);
  console.log("components/blocks/index.ts doesn't have the new:component markers, so add these two lines yourself:");
  console.log(`  import { ${configName} } from "./${name}";`);
  console.log(`  ${name}: block(${configName}),   // inside the blocks object`);
}
