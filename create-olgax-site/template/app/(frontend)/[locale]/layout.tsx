import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { getSiteSettings } from "@/lib/payload";
import { isLocale } from "@/lib/i18n";
import { getUmamiConfig } from "@/lib/umami";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const FONT_PRESET_CSS: Record<string, string> = {
  sans: "var(--font-geist-sans), system-ui, sans-serif",
  editorial: "Georgia, 'Times New Roman', serif",
  mono: "var(--font-geist-mono), ui-monospace, monospace",
};

export const metadata: Metadata = {
  title: "Olgax DXP",
  description: "Olgax DXP - a self-hostable page-building platform.",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const settings = await getSiteSettings();
  const umami = getUmamiConfig();

  const fontValue = settings.fontPreset ? FONT_PRESET_CSS[settings.fontPreset] : undefined;
  const schemeRule =
    settings.colorScheme === "light"
      ? "color-scheme: light; --background: #ffffff; --foreground: #171717;"
      : settings.colorScheme === "dark"
        ? "color-scheme: dark; --background: #0a0a0a; --foreground: #ededed;"
        : null;

  // Only ever contains validated hex colors or fixed allowlisted enum CSS tokens.
  const overrides = [
    schemeRule,
    settings.primaryColor && `--olgax-color-primary: ${settings.primaryColor};`,
    settings.primaryContrastColor &&
      `--olgax-color-primary-contrast: ${settings.primaryContrastColor};`,
    settings.backgroundColor && `--olgax-color-bg: ${settings.backgroundColor};`,
    settings.mutedBackgroundColor && `--olgax-color-bg-muted: ${settings.mutedBackgroundColor};`,
    settings.textColor && `--olgax-color-text: ${settings.textColor};`,
    settings.borderColor && `--olgax-color-border: ${settings.borderColor};`,
    fontValue && `--olgax-font-family: ${fontValue};`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {(overrides || umami.enabled) && (
        <head>
          {overrides && <style>{`:root { ${overrides} }`}</style>}
          {umami.enabled && (
            <Script
              src={umami.scriptUrl}
              data-website-id={umami.websiteId}
              data-auto-track="false"
              strategy="afterInteractive"
            />
          )}
        </head>
      )}
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
