import type { ComponentConfig, DefaultComponentProps } from "@puckeditor/core";
import type { Payload } from "payload";

// Deliberately narrow: collection + a single equality filter + limit. No general
// query language (no and/or, no operators).
export type CollectionQueryProps = {
  collection: string;
  filterField?: string;
  filterValue?: string;
  limit?: number;
  items?: unknown[];
};

/**
 * Puck field definitions for the four scalar props a component author fills in to
 * describe a query - plug these into a component's `fields`.
 */
export const collectionQueryFields = {
  collection: { type: "text" as const },
  filterField: { type: "text" as const },
  filterValue: { type: "text" as const },
  limit: { type: "number" as const },
};

// Derived from Puck's own ComponentConfig type (via the `{ props: Props }` params
// shape, same trick used in @olgax.com/sdk) rather than hand-rolled, so the functions
// below are guaranteed assignable to a real `resolveData`.
type ResolveDataFn<Props extends DefaultComponentProps> = NonNullable<
  ComponentConfig<{ props: Props }>["resolveData"]
>;

function shouldResolve(props: CollectionQueryProps, changed: Partial<Record<string, boolean>>) {
  if (!props.collection) return false;
  return Boolean(changed.collection || changed.filterField || changed.filterValue || changed.limit);
}

/**
 * Builds a Puck `resolveData` function that re-runs a Payload Local API `find()` whenever
 * the query props change, and writes the results into a read-only `items` prop.
 *
 * **Server-only.** `getPayload` (and the `payload` package it comes from) must never end up
 * in a browser bundle - only use this inside a `resolveData` for a config that exclusively
 * backs server-rendered `<Render>`, never one shared with the client `<Puck>` editor. For a
 * resolver safe to use in both places, use `createCollectionResolverFetch` instead.
 */
export function createCollectionResolver<Props extends CollectionQueryProps>(
  getPayload: () => Promise<Payload>,
): ResolveDataFn<Props> {
  return (async ({ props }: { props: Props }, { changed }: { changed: Partial<Record<string, boolean>> }) => {
    if (!shouldResolve(props, changed)) return { props };

    const payload = await getPayload();
    const where =
      props.filterField && props.filterValue
        ? { [props.filterField]: { equals: props.filterValue } }
        : {};

    // `collection` is deliberately a plain string (this package doesn't know a
    // consuming app's generated collection-slug union), so it's cast here.
    const result = await payload.find({
      collection: props.collection as Parameters<Payload["find"]>[0]["collection"],
      where,
      limit: props.limit ?? 10,
    });

    return {
      props: { ...props, items: result.docs },
      readOnly: { items: true },
    };
  }) as ResolveDataFn<Props>;
}

/**
 * Builds a Puck `resolveData` function that fetches from a same-app Route Handler instead of
 * calling Payload directly - safe to use in a config shared between the client `<Puck>`
 * editor and server-rendered `<Render>`, since it never imports the `payload` package.
 *
 * `endpoint` should be a Route Handler backed by `queryCollectionFromSearchParams` (or an
 * equivalent) that performs the actual Payload query server-side.
 */
export function createCollectionResolverFetch<Props extends CollectionQueryProps>(
  endpoint: string,
): ResolveDataFn<Props> {
  return (async ({ props }: { props: Props }, { changed }: { changed: Partial<Record<string, boolean>> }) => {
    if (!shouldResolve(props, changed)) return { props };

    const base =
      typeof window === "undefined" ? (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000") : "";
    const params = new URLSearchParams({
      collection: props.collection,
      limit: String(props.limit ?? 10),
    });
    if (props.filterField && props.filterValue) {
      params.set("filterField", props.filterField);
      params.set("filterValue", props.filterValue);
    }

    const res = await fetch(`${base}${endpoint}?${params.toString()}`);
    const items = res.ok ? await res.json() : [];

    return {
      props: { ...props, items },
      readOnly: { items: true },
    };
  }) as ResolveDataFn<Props>;
}

/**
 * Server-only helper for the Route Handler that `createCollectionResolverFetch` calls into -
 * parses the query string it produces and runs the equivalent Payload `find()`.
 */
export async function queryCollectionFromSearchParams(
  getPayload: () => Promise<Payload>,
  searchParams: URLSearchParams,
) {
  const collection = searchParams.get("collection");
  if (!collection) return [];

  const filterField = searchParams.get("filterField");
  const filterValue = searchParams.get("filterValue");
  const limit = Number(searchParams.get("limit") ?? 10);

  const payload = await getPayload();
  const where = filterField && filterValue ? { [filterField]: { equals: filterValue } } : {};
  const result = await payload.find({
    collection: collection as Parameters<Payload["find"]>[0]["collection"],
    where,
    limit,
  });
  return result.docs;
}
