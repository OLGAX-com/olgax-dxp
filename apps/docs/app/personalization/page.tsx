export default function Page() {
  return (
    <>
      <h1>Personalization</h1>
      <p>
        A single, narrow personalization signal - <strong>new vs. returning visitor</strong> -
        the one most starter kits and DXPs treat as a baseline. Deliberately not a general
        segments/audiences/rules-engine system; add one of those yourself on top if you need it,
        via the same <code>metadata</code> mechanism described below.
      </p>

      <h2>How it works</h2>
      <ul>
        <li>
          <code>proxy.ts</code> sets a first-party, no-PII cookie (<code>olgax_visitor</code>) on
          a visitor&apos;s first request. No IP, user agent, or any other identifying data is
          stored - just a marker.
        </li>
        <li>
          <code>lib/personalization.ts</code>&apos;s <code>getVisitorState()</code> reads that
          cookie server-side and returns <code>&quot;new&quot;</code> or{" "}
          <code>&quot;returning&quot;</code>.
        </li>
        <li>
          <code>PageRenderer</code> passes it to Puck&apos;s own documented{" "}
          <code>&lt;Render metadata={"{"}...{"}"}&gt;</code> prop, which every component receives
          as <code>props.puck.metadata</code>.
        </li>
      </ul>

      <h2>Using it in a component</h2>
      <p>
        Every default block in <code>@olgax/components</code> already has a &quot;Show to&quot;
        field (Everyone / New visitors only / Returning visitors only) via{" "}
        <code>@olgax/sdk</code>&apos;s <code>visibilityFields()</code>/<code>isVisible()</code> -
        the same pattern as <code>colorOverrideFields()</code>:
      </p>
      <pre>{`import { registerComponent, visibilityFields, isVisible } from "@olgax/sdk";

registerComponent("MyBlock", {
  fields: {
    // ...your own fields
    ...visibilityFields(),
  },
  render: (props) =>
    isVisible(props.visibility, props.puck?.metadata?.visitor) ? <MyBlock {...props} /> : <></>,
});`}</pre>
      <p>
        In the Puck editor itself, <code>puck.metadata.visitor</code> is always{" "}
        <code>undefined</code> (the canvas has no real visitor) - <code>isVisible()</code> treats
        that as &quot;always show&quot;, so authoring never hides a block you&apos;re editing.
      </p>

      <h2>Explicitly out of scope</h2>
      <p>
        No custom audience/segment builder, no rules engine, no third-party segment provider
        integration (GA, Segment, etc.). If you need those, this is the extension point - build
        on top of the same <code>metadata</code> mechanism rather than a separate system.
      </p>
    </>
  );
}
