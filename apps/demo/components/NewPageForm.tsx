"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/pages";

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const RESERVED_SLUGS = new Set(["admin", "api", "dashboard", "pages"]);

export function NewPageForm({
  locale,
  localizationEnabled,
  sections = [],
}: {
  locale: Locale;
  localizationEnabled: boolean;
  sections?: string[];
}) {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [section, setSection] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex w-full flex-col gap-2">
      <form
        noValidate
        className="flex w-full max-w-md flex-col items-stretch gap-2 sm:flex-row sm:items-center"
        onSubmit={(e) => {
          e.preventDefault();
          const cleanSlug = slug
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "");

          if (!cleanSlug) {
            setError("Please enter a page slug (e.g. about-us).");
            return;
          }
          if (!SLUG_REGEX.test(cleanSlug)) {
            setError("Slug may only contain lowercase letters, numbers, and hyphens.");
            return;
          }
          if (RESERVED_SLUGS.has(cleanSlug)) {
            setError(`"${cleanSlug}" is a reserved route name. Please choose another slug.`);
            return;
          }

          setError(null);
          const cleanSection = section.trim();
          const query = cleanSection ? `?section=${encodeURIComponent(cleanSection)}` : "";
          router.push(`${localizedPath(locale, localizationEnabled, `/${cleanSlug}/edit`)}${query}`);
        }}
      >
        <input
          type="text"
          aria-label="Page slug"
          placeholder="page-slug"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            if (error) setError(null);
          }}
          className="h-10 w-full rounded-full border border-solid border-black/[.08] px-4 text-sm text-black sm:flex-1 dark:border-white/[.145] dark:bg-black dark:text-zinc-50"
        />
        <input
          type="text"
          list="olgax-sections-list"
          aria-label="Start from section"
          placeholder="start from section (optional)"
          value={section}
          onChange={(e) => setSection(e.target.value)}
          className="h-10 w-full rounded-full border border-solid border-black/[.08] px-4 text-sm text-black sm:flex-1 dark:border-white/[.145] dark:bg-black dark:text-zinc-50"
        />
        {sections.length > 0 && (
          <datalist id="olgax-sections-list">
            {sections.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        )}
        <button
          type="submit"
          className="h-10 shrink-0 rounded-full bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
        >
          New page
        </button>
      </form>
      {error && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
