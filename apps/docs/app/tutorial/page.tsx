export default function Page() {
  return (
    <>
      <h1>Add your first component in 15 minutes</h1>
      <p>
        A timed walkthrough of the exact steps in{" "}
        <a href="/components">Adding a component</a>, building a real (if small) component from
        scratch: a <code>Spacer</code> block with a configurable height. Times assume you
        already have the repo cloned and <code>pnpm install</code> run.
      </p>

      <h2>1. Create the component file (5 min)</h2>
      <p>
        Create <code>packages/components/src/blocks/Spacer.tsx</code>:
      </p>
      <pre>{`import { registerComponent } from "@olgax/sdk";

export type SpacerProps = {
  height: number;
};

const Spacer = ({ height }: SpacerProps) => (
  <div style={{ height }} />
);

registerComponent<SpacerProps>("Spacer", {
  fields: {
    height: { type: "number" },
  },
  defaultProps: {
    height: 32,
  },
  render: (props) => <Spacer {...props} />,
});`}</pre>

      <h2>2. Register it in the package index (1 min)</h2>
      <p>
        Add one line to <code>packages/components/src/index.ts</code>, alongside the other
        blocks:
      </p>
      <pre>{`import "./blocks/Spacer";`}</pre>

      <h2>3. Run it locally (3 min)</h2>
      <pre>{`pnpm --filter demo dev`}</pre>
      <p>
        Open <code>http://localhost:3000/home/edit</code> - <code>Spacer</code> should already
        appear in the component drawer (Next transpiles <code>@olgax/components</code> directly
        from source, no build step needed - see <code>apps/demo/next.config.ts</code>&apos;s{" "}
        <code>transpilePackages</code>). Drag it onto the canvas and confirm the{" "}
        <code>height</code> field works.
      </p>

      <h2>4. Add a usage example (3 min)</h2>
      <p>
        Add a short section to <code>packages/components/README.md</code> (see the existing
        entries for the pattern) showing the props shape as a <code>Data.content</code> item.
      </p>

      <h2>5. Sanity-check types (3 min)</h2>
      <pre>{`pnpm --filter demo build`}</pre>
      <p>
        Puck&apos;s config types are stricter than the dev-mode/editor diagnostics catch on
        their own - a full build is the reliable check. See{" "}
        <a href="/sdk">SDK reference</a> if you hit a generic-constraint type error here; it&apos;s
        a known Puck typing quirk with a documented workaround.
      </p>

      <p>
        <strong>Total: ~15 minutes</strong> for a component with one field. Components with
        array fields (see <code>Header</code>, <code>Gallery</code>, etc. in{" "}
        <a href="/components">Adding a component</a>) or a data-source-backed one (see{" "}
        <a href="/data-sources">Data sources</a>) take a bit longer, but follow the same shape.
      </p>
    </>
  );
}
