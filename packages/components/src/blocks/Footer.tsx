import { registerComponent } from "@olgax/sdk";
import "./Footer.css";

export type FooterLink = { label: string; href: string };
export type FooterProps = {
  text: string;
  links: FooterLink[];
};

const Footer = ({ text, links }: FooterProps) => (
  <footer className="olgax-footer">
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
  render: (props) => <Footer {...props} />,
});
