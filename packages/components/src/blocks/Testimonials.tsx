import {
  registerComponent,
  colorOverrideFields,
  colorOverrideStyle,
  visibilityFields,
  isVisible,
  type ColorOverrideProps,
  type VisibilityProps,
} from "@olgax/sdk";
import "./Testimonials.css";

export type Testimonial = { quote: string; author: string };
export type TestimonialsProps = {
  items: Testimonial[];
} & ColorOverrideProps &
  VisibilityProps;

const Testimonials = ({ items, ...props }: TestimonialsProps) => (
  <section className="olgax-testimonials" style={colorOverrideStyle(props)}>
    {items.map((item, i) => (
      <figure key={i} className="olgax-testimonials__item">
        <blockquote className="olgax-testimonials__quote">&ldquo;{item.quote}&rdquo;</blockquote>
        <figcaption className="olgax-testimonials__author">{item.author}</figcaption>
      </figure>
    ))}
  </section>
);

registerComponent<TestimonialsProps>("Testimonials", {
  fields: {
    ...colorOverrideFields(),
    ...visibilityFields(),
    items: {
      type: "array",
      arrayFields: {
        quote: { type: "textarea" },
        author: { type: "text" },
      },
      getItemSummary: (item) => item.author || "Testimonial",
      defaultItemProps: { quote: "This is great!", author: "A happy user" },
    },
  },
  defaultProps: {
    items: [{ quote: "This is great!", author: "A happy user" }],
  },
  render: (props) =>
    isVisible(props.visibility, props.puck?.metadata?.visitor) ? <Testimonials {...props} /> : <></>,
});
