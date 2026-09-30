import {
  registerComponent,
  colorOverrideFields,
  colorOverrideStyle,
  visibilityFields,
  isVisible,
  type ColorOverrideProps,
  type VisibilityProps,
} from "@olgax.com/sdk";
import "./CTA.css";

export type CTAProps = {
  heading: string;
  buttonLabel: string;
  buttonHref: string;
} & ColorOverrideProps &
  VisibilityProps;

const CTA = ({ heading, buttonLabel, buttonHref, ...props }: CTAProps) => (
  <section className="olgax-cta" style={colorOverrideStyle(props)}>
    <h2 className="olgax-cta__heading">{heading}</h2>
    <a className="olgax-cta__button" href={buttonHref}>
      {buttonLabel}
    </a>
  </section>
);

registerComponent<CTAProps>("CTA", {
  fields: {
    heading: { type: "text" },
    buttonLabel: { type: "text" },
    buttonHref: { type: "text" },
    ...colorOverrideFields(),
    ...visibilityFields(),
  },
  defaultProps: {
    heading: "Ready to build your site?",
    buttonLabel: "Get started",
    buttonHref: "#",
  },
  render: (props) =>
    isVisible(props.visibility, props.puck?.metadata?.visitor) ? <CTA {...props} /> : <></>,
});
