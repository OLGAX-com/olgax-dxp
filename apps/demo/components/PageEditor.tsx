"use client";

import { useRef } from "react";
import { Puck } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import type { Data } from "@puckeditor/core";
import { config } from "@/lib/puck.config";
import { saveDraftPageData, publishPageData } from "@/lib/actions";

const AUTOSAVE_DELAY_MS = 2000;

export function PageEditor({
  slug,
  title,
  initialData,
}: {
  slug: string;
  title: string;
  initialData: Data;
}) {
  const autosaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  return (
    <Puck
      config={config}
      data={initialData}
      onChange={(data) => {
        if (autosaveTimeout.current) clearTimeout(autosaveTimeout.current);
        autosaveTimeout.current = setTimeout(() => {
          saveDraftPageData(slug, title, data);
        }, AUTOSAVE_DELAY_MS);
      }}
      onPublish={(data) => publishPageData(slug, title, data)}
    />
  );
}
