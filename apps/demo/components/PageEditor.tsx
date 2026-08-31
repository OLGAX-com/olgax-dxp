"use client";

import { useRef } from "react";
import { Puck } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import type { Data } from "@puckeditor/core";
import { config } from "@/lib/puck.config";
import { saveDraftPageData, publishPageData } from "@/lib/actions";
import { publicUrlForSlug, localizedPath } from "@/lib/pages";
import type { Locale } from "@/lib/i18n";

const AUTOSAVE_DELAY_MS = 2000;

export function PageEditor({
  locale,
  slug,
  title,
  initialData,
  localizationEnabled,
}: {
  locale: Locale;
  slug: string;
  title: string;
  initialData: Data;
  localizationEnabled: boolean;
}) {
  const autosaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navLinkStyle = {
    fontSize: 13,
    fontWeight: 600,
    marginRight: 12,
    textDecoration: "none",
  };

  return (
    <Puck
      config={config}
      data={initialData}
      onChange={(data) => {
        if (autosaveTimeout.current) clearTimeout(autosaveTimeout.current);
        autosaveTimeout.current = setTimeout(() => {
          saveDraftPageData(locale, slug, title, data);
        }, AUTOSAVE_DELAY_MS);
      }}
      onPublish={(data) => publishPageData(locale, slug, title, data)}
      overrides={{
        // Puck's documented (if experimental) header override - not the
        // internal/unstable AppState APIs - just injects extra links
        // alongside the default actions (Publish button, etc.).
        headerActions: ({ children }) => (
          <>
            <a
              href={localizedPath(locale, localizationEnabled, "/dashboard/pages")}
              style={navLinkStyle}
            >
              All pages
            </a>
            <a
              href={publicUrlForSlug(locale, slug, localizationEnabled)}
              target="_blank"
              rel="noreferrer"
              style={navLinkStyle}
            >
              View page ↗
            </a>
            {children}
          </>
        ),
      }}
    />
  );
}
