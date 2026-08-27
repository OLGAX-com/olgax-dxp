"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/pages";

export function NewPageForm({
  locale,
  localizationEnabled,
}: {
  locale: Locale;
  localizationEnabled: boolean;
}) {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [section, setSection] = useState("");

  return (
    <form
      className="flex w-full max-w-md flex-col items-center gap-2 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault();
        const cleanSlug = slug.trim().toLowerCase().replace(/\s+/g, "-");
        if (!cleanSlug) return;
        const cleanSection = section.trim();
        const query = cleanSection ? `?section=${encodeURIComponent(cleanSection)}` : "";
        router.push(`${localizedPath(locale, localizationEnabled, `/${cleanSlug}/edit`)}${query}`);
      }}
    >
      <input
        type="text"
        required
        placeholder="page-slug"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        className="h-10 flex-1 rounded-full border border-solid border-black/[.08] px-4 text-sm dark:border-white/[.145] dark:bg-black"
      />
      <input
        type="text"
        placeholder="start from section (optional)"
        value={section}
        onChange={(e) => setSection(e.target.value)}
        className="h-10 flex-1 rounded-full border border-solid border-black/[.08] px-4 text-sm dark:border-white/[.145] dark:bg-black"
      />
      <button
        type="submit"
        className="h-10 shrink-0 rounded-full bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
      >
        New page
      </button>
    </form>
  );
}
