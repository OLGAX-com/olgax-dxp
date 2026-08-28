import type { CollectionConfig } from "payload";

// One row per (slug, locale, day) - incremented in place rather than one row
// per view, so traffic doesn't produce unbounded row growth. No PII is
// recorded (no IP, no user agent, no cookies) - just an aggregate count per
// page per day, in keeping with a self-hostable, privacy-conscious default.
export const PageViews: CollectionConfig = {
  slug: "page-views",
  labels: { singular: "Page View", plural: "Page Views" },
  admin: {
    useAsTitle: "slug",
    defaultColumns: ["slug", "locale", "date", "count"],
    description: "Read-only aggregate view counts, recorded automatically by public page loads.",
  },
  // Enforces one row per (slug, locale, day) at the database level - without
  // this, two concurrent visitors both missing the day's row in a find()
  // would both create one, silently splitting a day's count across
  // duplicate rows. `recordPageView` relies on this constraint to detect
  // that race and fall back to an update instead.
  indexes: [{ fields: ["slug", "locale", "date"], unique: true }],
  access: {
    // Only editors can see analytics; writes only ever happen via the
    // demo app's own server-side tracking call (overrideAccess: true) -
    // never through the public API, so create/update stay closed here.
    read: ({ req }) => Boolean(req.user),
    create: () => false,
    update: () => false,
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: "slug",
      type: "text",
      required: true,
      index: true,
    },
    {
      name: "locale",
      type: "text",
      required: true,
    },
    {
      name: "date",
      type: "date",
      required: true,
      admin: {
        date: { pickerAppearance: "dayOnly" },
      },
    },
    {
      name: "count",
      type: "number",
      required: true,
      defaultValue: 0,
      admin: { readOnly: true },
    },
  ],
};
