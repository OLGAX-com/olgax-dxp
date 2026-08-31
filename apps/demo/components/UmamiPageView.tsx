"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

type UmamiGlobal = { track: () => void };

// Umami's script loads with data-auto-track="false" (see [locale]/layout.tsx)
// so nothing is tracked automatically - we call track() ourselves, only for
// genuine public page views, skipping a logged-in editor's own visits (same
// rule the built-in PageViews counter follows in lib/analytics.ts).
export function UmamiPageView({ skip }: { skip: boolean }) {
  const pathname = usePathname();

  useEffect(() => {
    if (skip) return;
    let cancelled = false;

    // The tracker script (strategy="afterInteractive") may not have finished
    // loading and defined `window.umami` yet on the very first paint - a
    // short bounded retry avoids silently dropping that first pageview.
    const attempt = (retriesLeft: number) => {
      const umami = (window as typeof window & { umami?: UmamiGlobal }).umami;
      if (umami) {
        umami.track();
      } else if (retriesLeft > 0 && !cancelled) {
        setTimeout(() => attempt(retriesLeft - 1), 200);
      }
    };
    attempt(10);

    return () => {
      cancelled = true;
    };
  }, [pathname, skip]);

  return null;
}
