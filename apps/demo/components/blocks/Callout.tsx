import {
  registerComponent,
  colorOverrideFields,
  colorOverrideStyle,
  visibilityFields,
  isVisible,
  type ColorOverrideProps,
  type VisibilityProps,
} from "@olgax.com/sdk";
import "./Callout.css";

// A starter custom block. Copy this file, or run `pnpm new:component MyBlock`, to add your own.
export type CalloutProps = {
  title: string;
  body: string;
  align: "left" | "center";
} & ColorOverrideProps &
  VisibilityProps;

// Keep this a plain component with no hooks: Puck renders it in the editor (client)
// and on the public page (server). Add "use client" and hooks only if you need them.
const Callout = ({ title, body, align, ...props }: CalloutProps) => (
  <aside
    className={`site-callout site-callout--${align}`}
    style={colorOverrideStyle(props)}
  >
    <h3 className="site-callout__title">{title}</h3>
    <p className="site-callout__body">{body}</p>
  </aside>
);

// The name below is what shows up in the editor's component list, and what is stored in each page.
registerComponent<CalloutProps>("Callout", {
  fields: {
    title: { type: "text" },
    body: { type: "textarea" },
    align: {
      type: "select",
      options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
      ],
    },
    ...colorOverrideFields(),
    ...visibilityFields(),
  },
  defaultProps: {
    title: "Heads up",
    body: "Edit this callout in the page builder, or replace it with your own block.",
    align: "left",
  },
  render: (props) =>
    isVisible(props.visibility, props.puck?.metadata?.visitor) ? <Callout {...props} /> : <></>,
});
