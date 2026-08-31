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

export const metadata: Metadata = {
  title: "Olgax DXP",
  description: "Payload + Puck + Next.js page-building spike",
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

  // Only ever contains values that passed the SiteSettings global's hex-color
  // validation (see packages/payload-preset), so it's safe to interpolate
  // directly - no free-form text ever reaches this template. Blank fields are
  // omitted entirely, letting packages/components' tokens.css defaults apply.
  const overrides = [
    settings.primaryColor && `--olgax-color-primary: ${settings.primaryColor};`,
    settings.backgroundColor && `--olgax-color-bg: ${settings.backgroundColor};`,
    settings.textColor && `--olgax-color-text: ${settings.textColor};`,
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
