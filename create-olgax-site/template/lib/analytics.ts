import { getPayloadClient } from "./payload";
import type { Locale } from "./i18n";

function todayDateOnly(): string {
  // Full ISO timestamp at UTC day-start, not a bare "YYYY-MM-DD" string -
  // Payload's `date` field stores/returns full ISO timestamps, and an
  // `equals` query with just a date part silently never matches the stored
  // value, so every request would think no row exists yet for the day.
  return new Date().toISOString().slice(0, 10) + "T00:00:00.000Z";
}

// Increments today's (slug, locale) view counter, creating it if this is the
// first view of the day. Never throws - analytics must never break the page
// it's tracking. Called via Next's `after()` from PageRenderer so it runs
// without adding latency to the response, but is still guaranteed to run
// (unlike a plain un-awaited call, which can be cut off once the response
// is sent on some hosting platforms).
//
// Two concurrent visitors can both miss the day's row in `find()` and both
// attempt `create()` - the collection's unique (slug, locale, date) index
// rejects the second one, which is caught below and retried as an update
// against the row the first request just created.
export async function recordPageView(slug: string, locale: Locale, attempt = 0) {
  try {
    const payload = await getPayloadClient();
    const date = todayDateOnly();

    const existing = await payload.find({
      collection: "page-views",
      where: {
        slug: { equals: slug },
        locale: { equals: locale },
        date: { equals: date },
      },
      limit: 1,
      overrideAccess: true,
    });

    const doc = existing.docs[0];
    if (doc) {
      await payload.update({
        collection: "page-views",
        id: doc.id,
        data: { count: (doc.count ?? 0) + 1 },
        overrideAccess: true,
      });
    } else {
      try {
        await payload.create({
          collection: "page-views",
          data: { slug, locale, date, count: 1 },
          overrideAccess: true,
        });
      } catch (createError) {
        // Most likely the unique index rejecting a duplicate created by a
        // concurrent request in the gap between our find() and create().
        // Retry once as an update against that now-existing row.
        if (attempt === 0) {
          await recordPageView(slug, locale, attempt + 1);
        } else {
          throw createError;
        }
      }
    }
  } catch {
    // Swallow - a tracking failure should never surface to a visitor.
  }
}

// Total views per slug across every locale/day - used by the /pages
// dashboard. One query for every page's rows rather than one query per page.
export async function getViewCountsBySlug(): Promise<Record<string, number>> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "page-views",
    limit: 5000,
    overrideAccess: true,
  });

  const totals: Record<string, number> = {};
  for (const view of result.docs) {
    totals[view.slug] = (totals[view.slug] ?? 0) + (view.count ?? 0);
  }
  return totals;
}
