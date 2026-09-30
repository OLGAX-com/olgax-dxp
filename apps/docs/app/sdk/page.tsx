export default function Page() {
  return (
    <>
      <h1>SDK reference</h1>
      <p>
        <code>@olgax.com/sdk</code> is a thin wrapper around Puck&apos;s config API.{" "}
        <code>registerComponent()</code> is the only public entry point.
      </p>
      <pre>{`import { registerComponent } from "@olgax.com/sdk";

registerComponent("MyComponent", {
  fields: {
    title: { type: "text" },
  },
  defaultProps: {
    title: "Hello",
  },
  render: ({ title }) => <h2>{title}</h2>,
});`}</pre>
      <p>
        A consuming app builds its Puck <code>Config</code> from everything registered so far:
      </p>
      <pre>{`import { getRegisteredComponents } from "@olgax.com/sdk";
import type { Config } from "@puckeditor/core";

export const config: Config = { components: getRegisteredComponents() };`}</pre>
      <p>
        <code>@olgax.com/components</code> already does this for the default component library - see{" "}
        <code>packages/components/src/index.ts</code>.
      </p>
    </>
  );
}
