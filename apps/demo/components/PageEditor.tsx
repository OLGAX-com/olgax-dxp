"use client";

import { Puck } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import type { Data } from "@puckeditor/core";
import { config } from "@/lib/puck.config";
import { savePageData } from "@/lib/actions";

export function PageEditor({
  slug,
  title,
  initialData,
}: {
  slug: string;
  title: string;
  initialData: Data;
}) {
  return (
    <Puck
      config={config}
      data={initialData}
      onPublish={(data) => savePageData(slug, title, data)}
    />
  );
}
