"use client";

import { useEffect, useRef, useState } from "react";
import { Puck } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import type { Data } from "@puckeditor/core";
import { config, CONFIG_UPDATED_EVENT } from "@/lib/puck.config";
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

  // Puck reads `config` once when it mounts. While developing, editing a block under
  // components/blocks/ hot-reloads lib/puck.config (which announces it - see that file) but
  // does not re-render this component, so listen for it, then remount Puck from the latest
  // in-editor data so no unsaved edits are lost. In production the config never changes.
  const latestData = useRef<Data>(initialData);
  const [mount, setMount] = useState({ version: 0, data: initialData });
  useEffect(() => {
    const onConfigUpdated = () => {
      const data = latestData.current;
      setMount((current) => ({ version: current.version + 1, data }));
    };
    window.addEventListener(CONFIG_UPDATED_EVENT, onConfigUpdated);
    return () => window.removeEventListener(CONFIG_UPDATED_EVENT, onConfigUpdated);
  }, []);

  const navLinkStyle = {
    fontSize: 13,
    fontWeight: 600,
    marginRight: 12,
    textDecoration: "none",
  };

  return (
    <Puck
      key={mount.version}
      config={config}
      data={mount.data}
      onChange={(data) => {
        latestData.current = data;
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
