import type { ReactNode } from "react";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCurrentUser, getSiteSettings } from "@/lib/payload";
import { localizedPath } from "@/lib/pages";
import { isLocale, resolveLocalizationEnabled } from "@/lib/i18n";
import { DashboardNav } from "@/components/DashboardNav";

// Single auth guard + shared chrome for every /dashboard/* tab (Overview,
// Pages, Analytics, Settings) - consolidates what used to be one flat
// /pages route into a proper multi-section admin dashboard.
export default async function DashboardLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const user = await getCurrentUser();
  const settings = await getSiteSettings();
  const localizationEnabled = resolveLocalizationEnabled(settings.localizationEnabled);
  if (!user) {
    const dashboardPath = localizedPath(locale, localizationEnabled, "/dashboard");
    redirect(`/admin/login?redirect=${encodeURIComponent(dashboardPath)}`);
  }

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <div className="flex w-full max-w-3xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">Dashboard</h1>
          <div className="flex gap-4 text-sm font-medium">
            <a
              href={localizedPath(locale, localizationEnabled, "")}
              className="text-zinc-600 hover:underline dark:text-zinc-400"
            >
              Home
            </a>
            <Link href="/admin" className="text-zinc-600 hover:underline dark:text-zinc-400">
              Payload admin
            </Link>
          </div>
        </div>

        <DashboardNav locale={locale} localizationEnabled={localizationEnabled} />

        {children}
      </div>
    </div>
  );
}
