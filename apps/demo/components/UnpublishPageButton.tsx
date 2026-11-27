"use client";

import { unpublishPage } from "@/lib/actions";
import type { Locale } from "@/lib/i18n";

export function UnpublishPageButton({
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
      action={() => unpublishPage(locale, id)}
      onSubmit={(e) => {
        if (
          !confirm(
            `Unpublish "${title}"? It will return to Draft and be hidden from public visitors.`,
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <button type="submit" className="text-amber-700 hover:underline dark:text-amber-400">
        Unpublish
      </button>
    </form>
  );
}
