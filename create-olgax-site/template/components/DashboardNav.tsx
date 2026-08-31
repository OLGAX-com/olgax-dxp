"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { LOCALES } from "@/lib/i18n";
import { localizedPath } from "@/lib/pages";

const TABS = [
  { href: "", label: "Overview" },
  { href: "/pages", label: "Pages" },
  { href: "/analytics", label: "Analytics" },
  { href: "/settings", label: "Settings" },
];

export function DashboardNav({
  locale,
  localizationEnabled,
}: {
  locale: Locale;
  localizationEnabled: boolean;
}) {
  const pathname = usePathname();
  const dashboardBase = localizedPath(locale, localizationEnabled, "/dashboard");
  const activeSubPath = pathname.startsWith(dashboardBase) ? pathname.slice(dashboardBase.length) : "";

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-solid border-black/[.08] pb-3 dark:border-white/[.145]">
      {TABS.map((tab) => {
        const isActive = activeSubPath === tab.href;
        return (
          <Link
            key={tab.label}
            href={localizedPath(locale, localizationEnabled, `/dashboard${tab.href}`)}
            className={
              isActive
                ? "rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background"
                : "rounded-full px-4 py-1.5 text-sm font-medium text-zinc-600 hover:bg-black/[.04] dark:text-zinc-400 dark:hover:bg-[#1a1a1a]"
            }
          >
            {tab.label}
          </Link>
        );
      })}
      {localizationEnabled && (
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-zinc-400">Locale:</span>
          {LOCALES.map((l) => (
            <Link
              key={l}
              href={`/${l}/dashboard${activeSubPath}`}
              className={
                l === locale
                  ? "rounded-full bg-foreground px-3 py-1 text-xs font-semibold text-background"
                  : "rounded-full border border-solid border-black/[.08] px-3 py-1 text-xs text-zinc-600 dark:border-white/[.145] dark:text-zinc-400"
              }
            >
              {l}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
