export default function Page() {
  return (
    <>
      <h1>Custom components in your site</h1>
      <p>
        A site scaffolded with <code>create-olgax-site</code> has a <code>components/blocks/</code>{" "}
        folder for your own page-builder blocks. Each block is a Puck component config, and{" "}
        <code>components/blocks/index.ts</code> is the list of blocks your site uses. (To contribute
        to the default library itself instead, see <a href="/components">Adding a component</a>.)
      </p>

      <h2>1. Generate a block</h2>
      <pre>{`pnpm new:component PromoBanner`}</pre>
      <p>
        This creates <code>components/blocks/PromoBanner.tsx</code> and{" "}
        <code>PromoBanner.css</code> and adds the block to the <code>blocks</code> list in{" "}
        <code>components/blocks/index.ts</code>. With <code>pnpm dev</code> running, it appears in
        the editor&apos;s component list immediately, with no restart or reload. A finished example
        lives in <code>components/blocks/Callout.tsx</code>.
      </p>

      <h2>2. Edit it</h2>
      <pre>{`import type { ComponentConfig } from "@puckeditor/core";

export type PromoBannerProps = { title: string };

const PromoBannerView = ({ title }: PromoBannerProps) => (
  <section className="site-promo-banner">
    <h2>{title}</h2>
  </section>
);

export const promoBannerBlock: ComponentConfig<{ props: PromoBannerProps }> = {
  fields: { title: { type: "text" } },    // inputs editors fill in
  defaultProps: { title: "PromoBanner" }, // values when first added to a page
  render: (props) => <PromoBannerView {...props} />,
};`}</pre>
      <p>Save the file and the open editor updates its fields live.</p>
      <ul>
        <li>
          <code>fields</code> takes any{" "}
          <a href="https://puckeditor.com/docs/api-reference/fields">Puck field type</a>:{" "}
          <code>text</code>, <code>textarea</code>, <code>number</code>, <code>select</code>,{" "}
          <code>radio</code>, <code>array</code>, <code>custom</code>.
        </li>
        <li>
          Spread <code>...colorOverrideFields()</code> and <code>...visibilityFields()</code> from{" "}
          <code>@olgax.com/sdk</code> into <code>fields</code> for per-block colors and
          new/returning-visitor rules. See <a href="/theming">Theming</a> and{" "}
          <a href="/personalization">Personalization</a>.
        </li>
        <li>
          Style with the <code>--olgax-*</code> CSS variables so the block follows the site theme.
        </li>
        <li>
          Avoid hooks unless the file starts with <code>&quot;use client&quot;</code>: blocks render
          in the editor and on the server.
        </li>
        <li>
          Give new fields a value in <code>defaultProps</code> and make the view handle missing
          values. Pages you already saved don&apos;t have the new field until someone edits and
          saves them again.
        </li>
      </ul>

      <h2>3. Use it on a page</h2>
      <p>
        Open a page&apos;s editor (for example <code>/home/edit</code>) and drag the block in from
        the component list. Publish the page to see it live.
      </p>

      <h2>Adding a block by hand</h2>
      <p>
        Create the file and export a config like above, then add two lines to{" "}
        <code>components/blocks/index.ts</code>: an <code>import</code> and an entry in the{" "}
        <code>blocks</code> object, for example <code>PromoBanner: block(promoBannerBlock)</code>.
        The key is the name shown in the editor and stored in each page, so renaming it affects
        pages that already use the block.
      </p>

      <h2>How it fits together</h2>
      <p>
        <code>lib/puck.config.tsx</code> merges the default components with your{" "}
        <code>blocks</code> into one config. The same config is used by the editor and by the
        public page renderer. Third-party component packages can still add themselves with{" "}
        <code>registerComponent()</code> from <code>@olgax.com/sdk</code>; see the{" "}
        <a href="/sdk">SDK reference</a>.
      </p>
    </>
  );
}
