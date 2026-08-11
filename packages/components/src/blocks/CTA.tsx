import { registerComponent } from "@olgax/sdk";
import "./CTA.css";

export type CTAProps = {
  heading: string;
  buttonLabel: string;
  buttonHref: string;
};

const CTA = ({ heading, buttonLabel, buttonHref }: CTAProps) => (
  <section className="olgax-cta">
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
  },
  defaultProps: {
    heading: "Ready to build your site?",
    buttonLabel: "Get started",
    buttonHref: "#",
  },
  render: (props) => <CTA {...props} />,
});
