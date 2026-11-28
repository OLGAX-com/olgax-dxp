import type { ComponentConfig, DefaultComponentProps } from "@puckeditor/core";
import type { Payload, PayloadRequest } from "payload";

// Deliberately narrow: collection + a single equality filter + limit. No general
// query language (no and/or, no operators).
export type CollectionQueryProps = {
  collection: string;
  filterField?: string;
  filterValue?: string;
  limit?: number;
  items?: unknown[];
};

export type QueryCollectionOptions = {
  /** Explicit allowlist of collection slugs that may be queried. */
  allowedCollections?: readonly string[];
  /** Optional explicit allowlist of field names allowed in `filterField`. */
  allowedFilterFields?: readonly string[];
  /** Optional authenticated user; defaults to anonymous access (`null`). */
  user?: PayloadRequest["user"] | null;
  /** Maximum number of items returned per query (default: 50). */
  maxLimit?: number;
  /** Optional Payload locale code (e.g. "en", "es") forwarded to `payload.find()`. */
  locale?: string;
};

export class DatasourceQueryError extends Error {
  readonly status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "DatasourceQueryError";
    this.status = status;
  }
}

const SLUG_PATTERN = /^[a-z0-9-]+$/;
const FIELD_PATTERN = /^[a-zA-Z0-9_.]+$/;

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

function normalizeLimit(raw: unknown, maxLimit: number): number {
  const safeMax = Number.isFinite(maxLimit) && maxLimit >= 1 ? Math.floor(maxLimit) : 50;
  const parsed = Number(raw ?? 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return Math.min(10, safeMax);
  return Math.max(1, Math.min(Math.floor(parsed), safeMax));
}

/**
 * Builds a Puck `resolveData` function that re-runs a Payload Local API `find()` whenever
 * the query props change, and writes the results into a read-only `items` prop.
 *
 * Enforces Payload access control (`overrideAccess: false`) so server renders only ever
 * return records readable in the current context.
 *
 * **Server-only.** `getPayload` (and the `payload` package it comes from) must never end up
 * in a browser bundle - only use this inside a `resolveData` for a config that exclusively
 * backs server-rendered `<Render>`, never one shared with the client `<Puck>` editor. For a
 * resolver safe to use in both places, use `createCollectionResolverFetch` instead.
 */
export function createCollectionResolver<Props extends CollectionQueryProps>(
  getPayload: () => Promise<Payload>,
  options: Pick<
    QueryCollectionOptions,
    "allowedCollections" | "allowedFilterFields" | "maxLimit" | "locale"
  > = {},
): ResolveDataFn<Props> {
  return (async (
    { props }: { props: Props },
    params: { changed: Partial<Record<string, boolean>>; metadata?: Record<string, unknown> },
  ) => {
    const { changed, metadata } = params;
    if (!shouldResolve(props, changed)) return { props };
    if (!SLUG_PATTERN.test(props.collection)) {
      return { props: { ...props, items: [] }, readOnly: { items: true } };
    }
    if (options.allowedCollections && !options.allowedCollections.includes(props.collection)) {
      return { props: { ...props, items: [] }, readOnly: { items: true } };
    }
    if (
      props.filterField &&
      (!FIELD_PATTERN.test(props.filterField) ||
        (options.allowedFilterFields && !options.allowedFilterFields.includes(props.filterField)))
    ) {
      return { props: { ...props, items: [] }, readOnly: { items: true } };
    }

    const locale =
      options.locale ??
      (typeof metadata?.locale === "string" && metadata.locale ? metadata.locale : undefined);

    const payload = await getPayload();
    const where =
      props.filterField && props.filterValue
        ? { [props.filterField]: { equals: props.filterValue } }
        : {};

    const result = await payload.find({
      collection: props.collection as Parameters<Payload["find"]>[0]["collection"],
      where,
      limit: normalizeLimit(props.limit, options.maxLimit ?? 50),
      ...(locale ? { locale: locale as Parameters<Payload["find"]>[0]["locale"] } : {}),
      overrideAccess: false,
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
 * validates query parameters, enforces Payload access control (`overrideAccess: false`),
 * and runs the Payload `find()`.
 */
export async function queryCollectionFromSearchParams(
  getPayload: () => Promise<Payload>,
  searchParams: URLSearchParams,
  options: QueryCollectionOptions = {},
) {
  const collection = searchParams.get("collection")?.trim();
  if (!collection) return [];

  if (!SLUG_PATTERN.test(collection)) {
    throw new DatasourceQueryError("Invalid collection parameter.", 400);
  }
  if (options.allowedCollections && !options.allowedCollections.includes(collection)) {
    throw new DatasourceQueryError(`Collection "${collection}" is not permitted.`, 403);
  }

  const filterField = searchParams.get("filterField")?.trim();
  const filterValue = searchParams.get("filterValue");
  if (filterField) {
    if (!FIELD_PATTERN.test(filterField)) {
      throw new DatasourceQueryError("Invalid filterField parameter.", 400);
    }
    if (options.allowedFilterFields && !options.allowedFilterFields.includes(filterField)) {
      throw new DatasourceQueryError(`Filter field "${filterField}" is not permitted.`, 403);
    }
  }

  const maxLimit = options.maxLimit ?? 50;
  const limit = normalizeLimit(searchParams.get("limit"), maxLimit);

  const payload = await getPayload();
  if (!(collection in payload.collections)) {
    throw new DatasourceQueryError(`Unknown collection "${collection}".`, 400);
  }

  const where = filterField && filterValue ? { [filterField]: { equals: filterValue } } : {};
  const result = await payload.find({
    collection: collection as Parameters<Payload["find"]>[0]["collection"],
    where,
    limit,
    overrideAccess: false,
    user: options.user ?? undefined,
  });
  return result.docs;
}
