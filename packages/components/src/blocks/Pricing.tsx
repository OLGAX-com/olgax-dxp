import {
  registerComponent,
  colorOverrideFields,
  colorOverrideStyle,
  visibilityFields,
  isVisible,
  type ColorOverrideProps,
  type VisibilityProps,
} from "@olgax/sdk";
import "./Pricing.css";

export type PricingPlan = {
  name: string;
  price: string;
  features: string;
  ctaLabel: string;
  ctaHref: string;
};
export type PricingProps = {
  plans: PricingPlan[];
} & ColorOverrideProps &
  VisibilityProps;

const Pricing = ({ plans, ...props }: PricingProps) => (
  <section className="olgax-pricing" style={colorOverrideStyle(props)}>
    {plans.map((plan, i) => (
      <div key={i} className="olgax-pricing__plan">
        <h3 className="olgax-pricing__name">{plan.name}</h3>
        <p className="olgax-pricing__price">{plan.price}</p>
        <ul className="olgax-pricing__features">
          {plan.features
            .split("\n")
            .filter(Boolean)
            .map((feature, j) => (
              <li key={j}>{feature}</li>
            ))}
        </ul>
        <a className="olgax-pricing__cta" href={plan.ctaHref}>
          {plan.ctaLabel}
        </a>
      </div>
    ))}
  </section>
);

registerComponent<PricingProps>("Pricing", {
  fields: {
    ...colorOverrideFields(),
    ...visibilityFields(),
    plans: {
      type: "array",
      arrayFields: {
        name: { type: "text" },
        price: { type: "text" },
        features: { type: "textarea" },
        ctaLabel: { type: "text" },
        ctaHref: { type: "text" },
      },
      getItemSummary: (item) => item.name || "Plan",
      defaultItemProps: {
        name: "Plan",
        price: "$0/mo",
        features: "Feature one\nFeature two",
        ctaLabel: "Choose plan",
        ctaHref: "#",
      },
    },
  },
  defaultProps: {
    plans: [
      {
        name: "Starter",
        price: "$0/mo",
        features: "1 site\nCommunity support",
        ctaLabel: "Get started",
        ctaHref: "#",
      },
    ],
  },
  render: (props) =>
    isVisible(props.visibility, props.puck?.metadata?.visitor) ? <Pricing {...props} /> : <></>,
});
