import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Olgax DXP Docs",
  description: "Docs for Olgax DXP - Payload + Puck + Next.js",
};

const nav = [
  { href: "/", label: "Introduction" },
  { href: "/installation", label: "Installation" },
  { href: "/components", label: "Adding a component" },
  { href: "/sdk", label: "SDK reference" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="docs-layout">
          <nav className="docs-nav">
            {nav.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
          <main className="docs-content">{children}</main>
        </div>
      </body>
    </html>
  );
}
