import type { GlobalConfig } from "payload";

const hexColor = (value?: string | null) => {
  if (!value) return true; // optional - blank keeps packages/components' tokens.css default
  return /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value)
    ? true
    : "Must be a hex color, e.g. #18181b";
};

// Global (singleton) site settings - lets a non-technical editor restyle the
// default component library's colors from the admin panel, without touching
// code. Maps onto the same --olgax-color-* custom properties defined in
// packages/components/src/tokens.css; blank fields fall through to those
// defaults. Values are strictly validated as hex colors (not free-form text)
// since they get interpolated into a <style> tag on every page - this is the
// system boundary where untrusted/malformed input must be rejected, rather
// than trying to sanitize it later at render time.
export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Site Settings",
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: "primaryColor",
      type: "text",
      validate: hexColor,
      admin: {
        description: "Buttons, links, accents - e.g. #18181b. Leave blank for the default.",
      },
    },
    {
      name: "backgroundColor",
      type: "text",
      validate: hexColor,
      admin: {
        description: "Page background - e.g. #ffffff. Leave blank for the default.",
      },
    },
    {
      name: "textColor",
      type: "text",
      validate: hexColor,
      admin: {
        description: "Body text - e.g. #18181b. Leave blank for the default.",
      },
    },
  ],
};
