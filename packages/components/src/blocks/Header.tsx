import { registerComponent, colorOverrideFields, colorOverrideStyle, type ColorOverrideProps } from "@olgax/sdk";
import "./Header.css";

export type HeaderLink = { label: string; href: string };
export type HeaderProps = {
  logoText: string;
  links: HeaderLink[];
} & ColorOverrideProps;

const Header = ({ logoText, links, ...props }: HeaderProps) => (
  <header className="olgax-header" style={colorOverrideStyle(props)}>
    <span className="olgax-header__logo">{logoText}</span>
    <nav className="olgax-header__nav">
      {links.map((link, i) => (
        <a key={i} className="olgax-header__link" href={link.href}>
          {link.label}
        </a>
      ))}
    </nav>
  </header>
);

registerComponent<HeaderProps>("Header", {
  fields: {
    logoText: { type: "text" },
    ...colorOverrideFields(),
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
    logoText: "Olgax",
    links: [
      { label: "Home", href: "/" },
      { label: "About", href: "#" },
    ],
  },
  render: (props) => <Header {...props} />,
});
