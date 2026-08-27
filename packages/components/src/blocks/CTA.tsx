import { registerComponent, colorOverrideFields, colorOverrideStyle, type ColorOverrideProps } from "@olgax/sdk";
import "./CTA.css";

export type CTAProps = {
  heading: string;
  buttonLabel: string;
  buttonHref: string;
} & ColorOverrideProps;

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
  },
  defaultProps: {
    heading: "Ready to build your site?",
    buttonLabel: "Get started",
    buttonHref: "#",
  },
  render: (props) => <CTA {...props} />,
});
