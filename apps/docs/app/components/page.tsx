export default function Page() {
  return (
    <>
      <h1>Adding a component</h1>
      <p>
        Default components live in <code>packages/components/src/blocks/</code>. Each is a
        plain React component registered with Puck via{" "}
        <a href="/sdk">
          <code>@olgax.com/sdk</code>
        </a>
        &apos;s <code>registerComponent()</code>.
      </p>
      <h2>Steps</h2>
      <ol>
        <li>
          Create <code>src/blocks/YourComponent.tsx</code> with a typed props interface and a
          <code>registerComponent(&quot;YourComponent&quot;, {"{"} fields, defaultProps, render {"}"})</code>{" "}
          call.
        </li>
        <li>
          Add a co-located <code>YourComponent.css</code> using <code>--olgax-*</code> custom
          properties (see <code>tokens.css</code>) instead of hardcoded colors/spacing.
        </li>
        <li>
          Import the new file (for its registration side effect) from{" "}
          <code>packages/components/src/index.ts</code>.
        </li>
        <li>
          Avoid client-only hooks (<code>useState</code>, etc.) in <code>render</code> - Puck
          components need to work in both the editor (client) and <code>&lt;Render&gt;</code>{" "}
          (can run in a React Server Component).
        </li>
      </ol>
      <p>
        See <code>CONTRIBUTING.md</code> in the repository root for the full contribution
        workflow.
      </p>
    </>
  );
}
