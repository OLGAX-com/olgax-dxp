import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/pages";

export function EditThisPageLink({
  locale,
  slug,
  localizationEnabled,
}: {
  locale: Locale;
  slug: string;
  localizationEnabled: boolean;
}) {
  return (
    <a
      href={localizedPath(locale, localizationEnabled, `/${slug}/edit`)}
      style={{
        position: "fixed",
        bottom: "1rem",
        right: "1rem",
        zIndex: 50,
        padding: "0.625rem 1rem",
        borderRadius: "999px",
        background: "#18181b",
        color: "#fff",
        fontSize: "0.875rem",
        fontWeight: 600,
        textDecoration: "none",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
      }}
    >
      Edit this page
    </a>
  );
}
