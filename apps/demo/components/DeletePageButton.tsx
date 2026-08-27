"use client";

import { deletePage } from "@/lib/actions";
import type { Locale } from "@/lib/i18n";

export function DeletePageButton({
  locale,
  id,
  title,
}: {
  locale: Locale;
  id: string | number;
  title: string;
}) {
  return (
    <form
      action={() => deletePage(locale, id)}
      onSubmit={(e) => {
        if (!confirm(`Delete "${title}"? This can't be undone.`)) {
          e.preventDefault();
        }
      }}
    >
      <button type="submit" className="text-red-600 hover:underline dark:text-red-400">
        Delete
      </button>
    </form>
  );
}
