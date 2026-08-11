import { registerComponent } from "@olgax/sdk";
import "./Hero.css";

export type HeroProps = {
  heading: string;
  subheading: string;
  ctaLabel: string;
  ctaHref: string;
};

const Hero = ({ heading, subheading, ctaLabel, ctaHref }: HeroProps) => (
  <section className="olgax-hero">
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
  },
  defaultProps: {
    heading: "Build pages, not pipelines",
    subheading: "A self-hostable page-building layer for Payload + Next.js.",
    ctaLabel: "Get started",
    ctaHref: "#",
  },
  render: (props) => <Hero {...props} />,
});
