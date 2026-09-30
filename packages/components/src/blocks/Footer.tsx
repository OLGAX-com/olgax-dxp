import {
  registerComponent,
  colorOverrideFields,
  colorOverrideStyle,
  visibilityFields,
  isVisible,
  type ColorOverrideProps,
  type VisibilityProps,
} from "@olgax.com/sdk";
import "./Footer.css";

export type FooterLink = { label: string; href: string };
export type FooterProps = {
  text: string;
  links: FooterLink[];
} & ColorOverrideProps &
  VisibilityProps;

const Footer = ({ text, links, ...props }: FooterProps) => (
  <footer className="olgax-footer" style={colorOverrideStyle(props)}>
    <span className="olgax-footer__text">{text}</span>
    <nav className="olgax-footer__nav">
      {links.map((link, i) => (
        <a key={i} className="olgax-footer__link" href={link.href}>
          {link.label}
        </a>
      ))}
    </nav>
  </footer>
);

registerComponent<FooterProps>("Footer", {
  fields: {
    text: { type: "text" },
    ...colorOverrideFields(),
    ...visibilityFields(),
    links: {
      type: "array",
      arrayFields: {
        label: { type: "text" },
        href: { type: "text" },
      },
      getItemSummary: (item) => item.label || "Link",
      defaultItemProps: { label: "Link", href: "#" },
    },
  },
  defaultProps: {
    text: `© ${new Date().getFullYear()} Olgax`,
    links: [{ label: "Privacy", href: "#" }],
  },
  render: (props) =>
    isVisible(props.visibility, props.puck?.metadata?.visitor) ? <Footer {...props} /> : <></>,
});
