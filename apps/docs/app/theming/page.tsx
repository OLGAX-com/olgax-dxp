export default function Page() {
  return (
    <>
      <h1>Theming</h1>
      <p>
        Every component in <code>@olgax.com/components</code> reads styling only from{" "}
        <code>--olgax-*</code> CSS custom properties (with sensible fallbacks) - never
        hardcoded colors or spacing. This means a consuming app can restyle every default
        component without forking them.
      </p>
      <h2>Default tokens</h2>
      <pre>{`:root {
  --olgax-color-bg: #ffffff;
  --olgax-color-bg-muted: #f4f4f5;
  --olgax-color-text: #18181b;
  --olgax-color-text-muted: #52525b;
  --olgax-color-primary: #18181b;
  --olgax-color-primary-contrast: #ffffff;
  --olgax-color-border: #e4e4e7;
  --olgax-font-family: system-ui, sans-serif;
  --olgax-radius: 0.5rem;
  --olgax-spacing: 1rem;
}`}</pre>
      <h2>Adding a theme</h2>
      <p>
        Scope your overrides under a selector your app controls (a <code>data-theme</code>{" "}
        attribute, a class, a media query):
      </p>
      <pre>{`[data-theme="dark"] {
  --olgax-color-bg: #0a0a0a;
  --olgax-color-text: #fafafa;
  /* ...etc, see packages/components/src/themes/dark.css for the full example */
}`}</pre>
      <p>
        Then add <code>data-theme=&quot;dark&quot;</code> to your <code>&lt;html&gt;</code> (or
        any ancestor element) to activate it.
      </p>
    </>
  );
}
