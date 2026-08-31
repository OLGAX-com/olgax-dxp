import { getSiteSettings } from "@/lib/payload";
import { resolveLocalizationEnabled, LOCALES, DEFAULT_LOCALE } from "@/lib/i18n";

const SHORTCUTS = [
  {
    href: "/admin/globals/site-settings",
    label: "Site Settings",
    hint: "Site-wide theme colors, localization toggle",
  },
  {
    href: "/admin/collections/sections",
    label: "Sections",
    hint: "Reusable page-section templates",
  },
  { href: "/admin/collections/media", label: "Media", hint: "Uploaded images and files" },
  { href: "/admin/collections/users", label: "Users", hint: "Editor accounts" },
  {
    href: "/admin/collections/webhooks",
    label: "Webhooks",
    hint: "Notify an external URL on publish/delete",
  },
];

// Payload's admin panel already owns the actual editing UI for these -
// this tab is a jumping-off point plus a quick read-only summary, not a
// competing settings form.
export default async function DashboardSettings() {
  const settings = await getSiteSettings();
  const localizationEnabled = resolveLocalizationEnabled(settings.localizationEnabled);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Site status
        </h2>
        <ul className="flex flex-col gap-2 text-sm">
          <li className="flex items-center justify-between rounded-2xl border border-solid border-black/[.08] px-4 py-3 dark:border-white/[.145]">
            <span className="text-zinc-600 dark:text-zinc-400">Localization</span>
            <span className="font-medium text-black dark:text-zinc-50">
              {localizationEnabled ? `On (${LOCALES.join(", ")})` : `Off (${DEFAULT_LOCALE} only)`}
            </span>
          </li>
        </ul>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Manage
        </h2>
        <ul className="flex flex-col divide-y divide-black/[.08] dark:divide-white/[.145]">
          {SHORTCUTS.map((shortcut) => (
            <li key={shortcut.href} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-black dark:text-zinc-50">{shortcut.label}</p>
                <p className="text-sm text-zinc-500">{shortcut.hint}</p>
              </div>
              <a
                href={shortcut.href}
                className="text-sm font-medium text-zinc-600 hover:underline dark:text-zinc-400"
              >
                Open
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
