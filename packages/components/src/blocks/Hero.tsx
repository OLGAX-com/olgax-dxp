import {
  registerComponent,
  colorOverrideFields,
  colorOverrideStyle,
  visibilityFields,
  isVisible,
  type ColorOverrideProps,
  type VisibilityProps,
} from "@olgax.com/sdk";
import "./Hero.css";

export type HeroProps = {
  heading: string;
  subheading: string;
  ctaLabel: string;
  ctaHref: string;
} & ColorOverrideProps &
  VisibilityProps;

const Hero = ({ heading, subheading, ctaLabel, ctaHref, ...props }: HeroProps) => (
  <section className="olgax-hero" style={colorOverrideStyle(props)}>
    <h1 className="olgax-hero__heading">{heading}</h1>
    <p className="olgax-hero__subheading">{subheading}</p>
    {ctaLabel && (
      <a className="olgax-hero__cta" href={ctaHref}>
        {ctaLabel}
      </a>
    )}
  </section>
);

registerComponent<HeroProps>("Hero", {
  fields: {
    heading: { type: "text" },
    subheading: { type: "textarea" },
    ctaLabel: { type: "text" },
    ctaHref: { type: "text" },
    ...colorOverrideFields(),
    ...visibilityFields(),
  },
  defaultProps: {
    heading: "Build pages, not pipelines",
    subheading: "A self-hostable page-building layer for Payload + Next.js.",
    ctaLabel: "Get started",
    ctaHref: "#",
  },
  render: (props) =>
    isVisible(props.visibility, props.puck?.metadata?.visitor) ? <Hero {...props} /> : <></>,
});
