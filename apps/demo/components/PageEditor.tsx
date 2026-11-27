"use client";

import { useEffect, useRef, useState } from "react";
import { Puck } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import type { Data } from "@puckeditor/core";
import { config, CONFIG_UPDATED_EVENT } from "@/lib/puck.config";
import { saveDraftPageData, publishPageData } from "@/lib/actions";
import { EditorStyleSync } from "@/components/EditorStyleSync";
import { publicUrlForSlug, localizedPath } from "@/lib/pages";
import type { Locale } from "@/lib/i18n";

const AUTOSAVE_DELAY_MS = 2000;

type SaveStatus = "idle" | "saving" | "saved" | "publishing" | "published" | "error";

function resolveEditedTitle(data: Data, fallbackTitle: string): string {
  const rootTitle = (data.root?.props as { title?: unknown } | undefined)?.title;
  return typeof rootTitle === "string" && rootTitle.trim() ? rootTitle.trim() : fallbackTitle;
}

export function PageEditor({
  locale,
  slug,
  title,
  initialData,
  localizationEnabled,
  missingSection,
}: {
  locale: Locale;
  slug: string;
  title: string;
  initialData: Data;
  localizationEnabled: boolean;
  missingSection?: string;
}) {
  const autosaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dismissedSectionWarning, setDismissedSectionWarning] = useState(false);

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

  useEffect(() => {
    return () => {
      if (autosaveTimeout.current) clearTimeout(autosaveTimeout.current);
    };
  }, []);

  const navLinkStyle = {
    fontSize: 13,
    fontWeight: 600,
    marginRight: 12,
    textDecoration: "none",
    whiteSpace: "nowrap" as const,
  };

  const statusLabel: Record<SaveStatus, string> = {
    idle: "",
    saving: "Saving draft…",
    saved: "Draft saved",
    publishing: "Publishing…",
    published: "Published",
    error: errorMessage || "Save failed",
  };

  return (
    <>
      {missingSection && !dismissedSectionWarning && (
        <div
          role="status"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "8px 16px",
            background: "#fef3c7",
            color: "#78350f",
            fontSize: 13,
            borderBottom: "1px solid #fde68a",
          }}
        >
          <span>
            Section template &ldquo;{missingSection}&rdquo; was not found — starting with an empty
            canvas.
          </span>
          <button
            type="button"
            onClick={() => setDismissedSectionWarning(true)}
            style={{ fontWeight: 600, cursor: "pointer", background: "transparent", border: 0 }}
          >
            Dismiss
          </button>
        </div>
      )}
      <Puck
        key={mount.version}
        config={config}
        data={mount.data}
        onChange={(data) => {
          latestData.current = data;
          if (autosaveTimeout.current) clearTimeout(autosaveTimeout.current);
          autosaveTimeout.current = setTimeout(async () => {
            setStatus("saving");
            setErrorMessage(null);
            try {
              await saveDraftPageData(locale, slug, resolveEditedTitle(data, title), data);
              setStatus("saved");
            } catch (err) {
              setErrorMessage(err instanceof Error ? err.message : "Failed to save draft");
              setStatus("error");
            }
          }, AUTOSAVE_DELAY_MS);
        }}
        onPublish={async (data) => {
          if (autosaveTimeout.current) clearTimeout(autosaveTimeout.current);
          setStatus("publishing");
          setErrorMessage(null);
          try {
            await publishPageData(locale, slug, resolveEditedTitle(data, title), data);
            setStatus("published");
          } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : "Failed to publish page");
            setStatus("error");
          }
        }}
        overrides={{
          // Keeps the preview styled exactly like the live page - see EditorStyleSync.
          iframe: EditorStyleSync,
          // Puck's documented (if experimental) header override - not the
          // internal/unstable AppState APIs - just injects extra links
          // alongside the default actions (Publish button, etc.).
          headerActions: ({ children }) => (
            <>
              {status !== "idle" && (
                <span
                  role="status"
                  aria-live="polite"
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    marginRight: 12,
                    whiteSpace: "nowrap",
                    color: status === "error" ? "#dc2626" : "#52525b",
                  }}
                >
                  {statusLabel[status]}
                </span>
              )}
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
    </>
  );
}
