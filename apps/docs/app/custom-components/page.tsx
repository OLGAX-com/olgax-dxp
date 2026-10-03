export default function Page() {
  return (
    <>
      <h1>Custom components in your site</h1>
      <p>
        A site scaffolded with <code>create-olgax-site</code> has a <code>components/blocks/</code>{" "}
        folder for your own page-builder components. Anything you register there shows up in the
        editor&apos;s component list next to the built-in blocks. (To contribute to the default
        library itself instead, see <a href="/components">Adding a component</a>.)
      </p>

      <h2>1. Generate a block</h2>
      <pre>{`pnpm new:component PromoBanner`}</pre>
      <p>
        This creates <code>components/blocks/PromoBanner.tsx</code> and{" "}
        <code>PromoBanner.css</code>, and adds <code>{`import "./PromoBanner";`}</code> to{" "}
        <code>components/blocks/index.ts</code>. A finished example lives in{" "}
        <code>components/blocks/Callout.tsx</code>.
      </p>

      <h2>2. Edit it</h2>
      <pre>{`import { registerComponent } from "@olgax.com/sdk";

export type PromoBannerProps = { title: string };

const PromoBanner = ({ title }: PromoBannerProps) => (
  <section className="site-promo-banner">
    <h2>{title}</h2>
  </section>
);

registerComponent<PromoBannerProps>("PromoBanner", {
  fields: { title: { type: "text" } },   // inputs editors fill in
  defaultProps: { title: "PromoBanner" }, // values when first added to a page
  render: (props) => <PromoBanner {...props} />,
});`}</pre>
      <ul>
        <li>
          <code>fields</code> takes any{" "}
          <a href="https://puckeditor.com/docs/api-reference/fields">Puck field type</a>:{" "}
          <code>text</code>, <code>textarea</code>, <code>number</code>, <code>select</code>,{" "}
          <code>radio</code>, <code>array</code>, <code>custom</code>.
        </li>
        <li>
          Spread <code>...colorOverrideFields()</code> and <code>...visibilityFields()</code> into{" "}
          <code>fields</code> for per-block colors and new/returning-visitor rules. See{" "}
          <a href="/theming">Theming</a> and <a href="/personalization">Personalization</a>.
        </li>
        <li>
          Style with the <code>--olgax-*</code> CSS variables so the block follows the site theme.
        </li>
        <li>
          Avoid hooks unless the file starts with <code>&quot;use client&quot;</code>: blocks render
          in the editor and on the server.
        </li>
      </ul>

      <h2>3. Use it on a page</h2>
      <p>
        Run <code>pnpm dev</code>, open a page&apos;s editor (for example <code>/home/edit</code>),
        and drag the block in from the component list. Publish the page to see it live.
      </p>

      <h2>Adding a block by hand</h2>
      <p>
        Create the file, call <code>registerComponent()</code>, and import it from{" "}
        <code>components/blocks/index.ts</code>. Importing the file is what registers it, so a block
        that isn&apos;t imported there won&apos;t appear in the editor.
      </p>

      <h2>How it fits together</h2>
      <p>
        <code>lib/puck.config.tsx</code> imports <code>components/blocks</code>, then builds the
        editor config from <code>getRegisteredComponents()</code>. The same config is used by the
        editor and by the public page renderer, so a block you register is available in both. Pages
        store each block&apos;s name and props, so renaming a registered block makes existing pages
        that use the old name show nothing for it.
      </p>
    </>
  );
}
