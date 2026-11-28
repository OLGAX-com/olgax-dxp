import {
  registerComponent,
  colorOverrideFields,
  colorOverrideStyle,
  visibilityFields,
  isVisible,
  mediaField,
  safeHref,
  safeMediaSrc,
  type ColorOverrideProps,
  type VisibilityProps,
} from "@olgax.com/sdk";
import "./Hero.css";

export type HeroProps = {
  eyebrow?: string;
  heading: string;
  subheading: string;
  backgroundImage?: string;
  backgroundAlt?: string;
  overlayOpacity?: number;
  ctaLabel: string;
  ctaHref: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
} & ColorOverrideProps &
  VisibilityProps;

const Hero = ({
  eyebrow,
  heading,
  subheading,
  backgroundImage,
  backgroundAlt,
  overlayOpacity = 55,
  ctaLabel,
  ctaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
  ...props
}: HeroProps) => {
  const safeBg = safeMediaSrc(backgroundImage);
  const clampedOpacity = Math.max(0, Math.min(90, Number(overlayOpacity ?? 55))) / 100;

  return (
    <section
      className={`olgax-hero${safeBg ? " olgax-hero--with-image" : ""}`}
      style={colorOverrideStyle(props)}
    >
      {safeBg && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- framework-agnostic component */}
          <img
            className="olgax-hero__bg"
            src={safeBg}
            alt={backgroundAlt || heading}
          />
          <div
            aria-hidden="true"
            className="olgax-hero__scrim"
            style={{ opacity: clampedOpacity }}
          />
        </>
      )}
      <div className="olgax-hero__content">
        {eyebrow && <span className="olgax-hero__eyebrow">{eyebrow}</span>}
        <h1 className="olgax-hero__heading">{heading}</h1>
        <p className="olgax-hero__subheading">{subheading}</p>
        {(ctaLabel || secondaryCtaLabel) && (
          <div className="olgax-hero__actions">
            {ctaLabel && (
              <a className="olgax-hero__cta" href={safeHref(ctaHref)}>
                {ctaLabel}
              </a>
            )}
            {secondaryCtaLabel && (
              <a
                className="olgax-hero__cta olgax-hero__cta--secondary"
                href={safeHref(secondaryCtaHref)}
              >
                {secondaryCtaLabel}
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

registerComponent<HeroProps>("Hero", {
  fields: {
    eyebrow: { type: "text" },
    heading: { type: "text" },
    subheading: { type: "textarea" },
    backgroundImage: mediaField("Background image (optional)"),
    backgroundAlt: { type: "text" },
    overlayOpacity: { type: "number" },
    ctaLabel: { type: "text" },
    ctaHref: { type: "text" },
    secondaryCtaLabel: { type: "text" },
    secondaryCtaHref: { type: "text" },
    ...colorOverrideFields(),
    ...visibilityFields(),
  },
  defaultProps: {
    eyebrow: "",
    heading: "Build pages, not pipelines",
    subheading: "A self-hostable page-building layer for Payload + Next.js.",
    backgroundImage: "",
    backgroundAlt: "",
    overlayOpacity: 55,
    ctaLabel: "Get started",
    ctaHref: "#",
    secondaryCtaLabel: "",
    secondaryCtaHref: "#",
  },
  render: (props) =>
    isVisible(props.visibility, props.puck?.metadata?.visitor) ? <Hero {...props} /> : <></>,
});
