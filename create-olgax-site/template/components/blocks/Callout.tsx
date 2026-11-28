import type { ComponentConfig } from "@puckeditor/core";
import {
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

// Keep this ComponentConfig file server-safe (no "use client" here): Puck renders it
// in the editor (client) and on the public page (server). If you need React state or
// hooks, put them in a separate `"use client"` child component and pass only plain
// serializable props from `render` (never spread `props.puck` across client boundaries),
// or scaffold with `pnpm new:component MyBlock --client`.
const CalloutView = ({
  title,
  body,
  align,
  primaryColor,
  backgroundColor,
  textColor,
}: CalloutProps) => (
  <aside
    className={`site-callout site-callout--${align}`}
    style={colorOverrideStyle({ primaryColor, backgroundColor, textColor })}
  >
    <h3 className="site-callout__title">{title}</h3>
    <p className="site-callout__body">{body}</p>
  </aside>
);

// This config is what the page builder uses. It is listed in components/blocks/index.ts,
// and the key used there is the name shown in the editor's component list.
export const calloutBlock: ComponentConfig<{ props: CalloutProps }> = {
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
    isVisible(props.visibility, props.puck?.metadata?.visitor) ? <CalloutView {...props} /> : <></>,
};
