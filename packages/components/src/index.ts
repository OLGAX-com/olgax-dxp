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

export type { HeroProps } from "./blocks/Hero";
export type { HeaderProps, HeaderLink } from "./blocks/Header";
export type { FooterProps, FooterLink } from "./blocks/Footer";
export type { CTAProps } from "./blocks/CTA";
export type { GalleryProps, GalleryImage } from "./blocks/Gallery";
export type { PricingProps, PricingPlan } from "./blocks/Pricing";
export type { FAQProps, FAQItem } from "./blocks/FAQ";
export type { TestimonialsProps, Testimonial } from "./blocks/Testimonials";
