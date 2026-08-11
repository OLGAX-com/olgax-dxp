import { getRegisteredComponents } from "@olgax/sdk";
import "./tokens.css";
import "./blocks/Hero";
import "./blocks/Header";
import "./blocks/Footer";
import "./blocks/CTA";
import "./blocks/Gallery";
import "./blocks/Pricing";
import "./blocks/FAQ";
import "./blocks/Testimonials";

// Every block above registers itself with @olgax/sdk on import (side effect).
// This is the single Puck `components` map a consuming app's config needs.
export const components = getRegisteredComponents();

// RelatedPages needs an app-supplied `getPayload`, so unlike the blocks above it
// doesn't register itself on import - call this once, then re-read
// `getRegisteredComponents()` from @olgax/sdk directly to pick it up (`components`
// above is a snapshot taken before this runs). See packages/datasource's README.
export { registerRelatedPages } from "./blocks/RelatedPages";

export type { HeroProps } from "./blocks/Hero";
export type { HeaderProps, HeaderLink } from "./blocks/Header";
export type { FooterProps, FooterLink } from "./blocks/Footer";
export type { CTAProps } from "./blocks/CTA";
export type { GalleryProps, GalleryImage } from "./blocks/Gallery";
export type { PricingProps, PricingPlan } from "./blocks/Pricing";
export type { FAQProps, FAQItem } from "./blocks/FAQ";
export type { TestimonialsProps, Testimonial } from "./blocks/Testimonials";
export type { RelatedPagesProps, RelatedPagesItem } from "./blocks/RelatedPages";
